from __future__ import annotations
import base64
import hashlib
import json
import re
import uuid
from fastapi import APIRouter, HTTPException, Request, UploadFile, status
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import text
from app.ai.capabilities import Capability
from app.ai.gateway import reason_vision_stream
from app.db.session import session_scope






router = APIRouter(prefix="/bills", tags=["bills"])
limiter = Limiter(key_func=get_remote_address)

MAX_BYTES = 10 * 1024 * 1024  # 10 MB





# Magic byte → MIME. We validate the file header bytes, NOT the client's
# Content-Type header, to prevent polyglot / disguised file attacks.
_MAGIC: list[tuple[bytes, str]] = [
    (b"\xff\xd8\xff",  "image/jpeg"),
    (b"\x89PNG\r\n",   "image/png"),
    (b"%PDF",          "application/pdf"),
    (b"GIF87a",        "image/gif"),
    (b"GIF89a",        "image/gif"),
]

OCR_PROMPT = (
    "Extract all legislative text from this scanned bill image. "
    "Return ONLY the extracted text exactly as it appears — section numbers, "
    "article headers, paragraph structure, and all body text. "
    "No commentary, no formatting changes, no markdown fences."
)









def _detect_mime(header: bytes) -> str | None:
    # WebP: bytes 0-3 == 'RIFF', bytes 8-11 == 'WEBP'
    if header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return "image/webp"
    for magic, mime in _MAGIC:
        if header[: len(magic)] == magic:
            return mime
    return None


def _sanitize(raw: str) -> str:
    """Strip control characters and cap length. Extracted text is
    untrusted LLM output from an uploaded image — strip control chars
    that could cause DB or rendering issues, but do not otherwise alter
    the legislative content."""
    clean = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", raw)
    clean = re.sub(r"\n{4,}", "\n\n\n", clean)
    return clean.strip()[:50_000]


@router.post("/ingest/vision")
@limiter.limit("2/minute")
async def ingest_vision(
    request: Request,
    file: UploadFile,
):
    """SSE stream: chunk events while OCR runs, then a complete event with bill_id."""
    raw = await file.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            "Image exceeds 10 MB. Reduce size and retry.",
        )

    mime = _detect_mime(raw[:16])
    if mime is None:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            "Unsupported file. Upload a JPEG, PNG, WebP, GIF, or PDF image of a bill.",
        )

    image_b64 = base64.b64encode(raw).decode("ascii")

    async def event_stream():
        chunks: list[str] = []
        try:
            async for chunk in reason_vision_stream(
                task="vision_ocr",
                capability=Capability.VISION,
                image_b64=image_b64,
                mime=mime,
                ocr_prompt=OCR_PROMPT,
            ):
                chunks.append(chunk)
                yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"

            full_text = _sanitize("".join(chunks))
            bill_id = await _persist_bill(full_text)

            yield f"data: {json.dumps({'type': 'complete', 'bill_id': str(bill_id), 'char_count': len(full_text)})}\n\n"

        except Exception as exc:
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)[:300]})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


def _detect_jurisdiction(text: str) -> str:
    t = text[:500].upper()
    if "TEXAS" in t or "SENATE OF TEXAS" in t:                          return "TX"
    if "CALIFORNIA" in t or "LEGISLATURE OF CA" in t:                   return "CA"
    if "NEW YORK" in t:                                                  return "NY"
    if "CONGRESS OF THE PHILIPPINES" in t or "REPUBLIC OF THE PHILIPPINES" in t: return "PH"
    if "EUROPEAN UNION" in t or "EUR-LEX" in t:                         return "EU"
    if "PARLIAMENT" in t and "UK" in t:                                  return "UK"
    return "UPLOAD"


async def _persist_bill(full_text: str) -> uuid.UUID:
    """Insert a minimal Bill row for the vision-extracted text.
    The title heuristic uses the first non-empty line (≤200 chars).
    urgency_score=60 ensures it appears mid-feed until analyzed."""
    lines = [ln.strip() for ln in full_text.splitlines() if ln.strip()]
    title = (lines[0][:200] if lines else "Vision-Ingested Bill")
    content_hash = hashlib.sha256(full_text.encode()).hexdigest()
    jurisdiction = _detect_jurisdiction(full_text)

    async with session_scope() as session:
        row = (
            await session.execute(
                text(
                    """
                    INSERT INTO bills (
                        jurisdiction, bill_number, title,
                        full_text, status, pass_probability, urgency_score,
                        content_hash
                    ) VALUES (
                        :jurisdiction,
                        :num,
                        :title,
                        :full_text,
                        'introduced',
                        50,
                        60,
                        :content_hash
                    )
                    RETURNING id
                    """
                ),
                {
                    "jurisdiction": jurisdiction,
                    "num": f"VISION-{uuid.uuid4().hex[:6].upper()}",
                    "title": title,
                    "full_text": full_text,
                    "content_hash": content_hash,
                },
            )
        ).scalar_one()
    return row
