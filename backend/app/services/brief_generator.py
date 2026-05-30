"""WeasyPrint compliance brief generator — async generator yielding SSE progress events."""
from __future__ import annotations
import hashlib
import io
import uuid
from collections.abc import AsyncGenerator
from datetime import date
from pathlib import Path
from typing import Any
from jinja2 import Environment, FileSystemLoader
from sqlalchemy import text
from app.ai.capabilities import Capability
from app.ai.gateway import reason
from app.ai.prompts_brief import BRIEF_SYSTEM, brief_user_prompt
from app.ai.schemas_brief import BriefContent
from app.core.logging import get_logger
from app.db.session import session_scope
from app.services.supabase_storage import create_signed_url, upload_pdf

log = get_logger(__name__)

TEMPLATE_DIR = Path(__file__).parent.parent / "templates" / "brief"











def _jinja_env() -> Environment:
    return Environment(
        loader=FileSystemLoader(str(TEMPLATE_DIR)),
        autoescape=True,   # XSS-safe even though output is PDF
    )


async def generate_brief(
    bill_id: uuid.UUID,
) -> AsyncGenerator[dict[str, Any], None]:
    """
    Async generator — yields progress dicts for SSE streaming.
    Final event is {"step": "complete", ...} with signed_url and metadata.
    """
    try:
        # ── Step 1: Load context ────────────────────────────────────────────
        yield {"step": "assembling_context"}

        async with session_scope() as db:
            bill_row = (
                await db.execute(
                    text(
                        """
                        SELECT id, title, bill_number, jurisdiction, status, full_text, source_url
                        FROM bills
                        WHERE id = :id
                        """
                    ),
                    {"id": bill_id},
                )
            ).mappings().first()

            if bill_row is None:
                yield {"step": "error", "message": "Bill not found"}
                return

            assessment_row = (
                await db.execute(
                    text(
                        """
                        SELECT id, verdict, confidence, compliance_cost_estimate,
                               affected_operations, reasoning_chain, triggering_clause_text
                        FROM assessments
                        WHERE bill_id = :bid
                        ORDER BY created_at DESC
                        LIMIT 1
                        """
                    ),
                    {"bid": bill_id},
                )
            ).mappings().first()

            company_row = (
                await db.execute(text("SELECT * FROM company_profiles LIMIT 1"))
            ).mappings().first()

        bill = dict(bill_row)
        assessment = dict(assessment_row) if assessment_row else {}
        company = dict(company_row) if company_row else {}

        # ── Step 2: AI/ML content generation ───────────────────────────────
        yield {"step": "generating_analysis"}

        content: BriefContent = await reason(
            task="compliance_brief",
            capability=Capability.LONG_FORM_PROSE,
            schema=BriefContent,
            system_prompt=BRIEF_SYSTEM,
            user_prompt=brief_user_prompt(bill, assessment, company),
            run_id=None,
            cache=False,  # never cache briefs — always generate fresh
        )

        # ── Step 3: Render PDF ──────────────────────────────────────────────
        yield {"step": "rendering_document"}

        today_str = date.today().strftime("%B %d, %Y")
        exposure_formatted = _format_usd(content.total_compliance_cost_usd)

        env = _jinja_env()
        template = env.get_template("compliance_brief.html")
        html_str = template.render(
            bill=bill,
            assessment=assessment,
            content=content,
            exposure_formatted=exposure_formatted,
            today=today_str,
        )

        pdf_bytes = _html_to_pdf(html_str)
        content_hash = hashlib.sha256(pdf_bytes).hexdigest()
        pages = max(4, len(pdf_bytes) // 50_000)

        # ── Step 4: Upload to Supabase Storage ─────────────────────────────
        yield {"step": "uploading"}

        brief_id = uuid.uuid4()
        storage_path = f"{bill_id}/{brief_id}.pdf"

        await upload_pdf(storage_path, pdf_bytes)
        signed_url = await create_signed_url(storage_path, expires_in=86_400)

        # ── Persist brief record ────────────────────────────────────────────
        async with session_scope() as db:
            await db.execute(
                text(
                    """
                    INSERT INTO briefs
                        (id, bill_id, storage_path, signed_url,
                         signed_url_expires_at, content_hash,
                         compliance_exposure_usd, total_gaps, verdict, pages)
                    VALUES
                        (:id, :bill_id, :path, :url,
                         NOW() + INTERVAL '24 hours', :hash,
                         :exposure, :gaps, :verdict, :pages)
                    """
                ),
                {
                    "id": brief_id,
                    "bill_id": bill_id,
                    "path": storage_path,
                    "url": signed_url,
                    "hash": content_hash,
                    "exposure": content.total_compliance_cost_usd,
                    "gaps": len(content.compliance_gaps),
                    "verdict": assessment.get("verdict"),
                    "pages": pages,
                },
            )

        yield {
            "step": "complete",
            "brief_id": str(brief_id),
            "signed_url": signed_url,
            "exposure_usd": content.total_compliance_cost_usd,
            "pages": pages,
            "bill_title": bill["title"],
            "bill_jurisdiction": bill["jurisdiction"],
            "bill_number": bill["bill_number"],
            "verdict": assessment.get("verdict"),
            "total_gaps": len(content.compliance_gaps),
            "content_hash": content_hash,
        }

    except Exception as exc:
        log.error("brief_generation_error", bill_id=str(bill_id), exc=str(exc))
        yield {"step": "error", "message": str(exc)[:400]}


def _html_to_pdf(html_str: str) -> bytes:
    # Lazy import: WeasyPrint loads native GTK libraries (libgobject/pango/cairo)
    # at import time. Importing it at module level crashes the whole server on
    # boot if GTK isn't installed. Importing here keeps the API up and surfaces
    # a clear, actionable error only when a PDF is actually requested.
    try:
        from weasyprint import HTML as WeasyHTML
    except OSError as exc:
        raise RuntimeError(
            "WeasyPrint cannot load its native libraries (GTK3). Install the GTK3 "
            "runtime and restart the server. Windows: install "
            "'GTK3-Runtime Win64' from "
            "https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases "
            "then reopen the terminal. Original error: " + str(exc)
        ) from exc

    buf = io.BytesIO()
    WeasyHTML(string=html_str, base_url=str(TEMPLATE_DIR)).write_pdf(buf)
    return buf.getvalue()


def _format_usd(n: int) -> str:
    if n >= 1_000_000:
        return f"${n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"${n / 1_000:,.0f}K"
    return f"${n:,}"
