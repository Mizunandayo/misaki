"""Semantic amendment diff between two bill versions."""
from __future__ import annotations
import hashlib
import json
import uuid
from typing import Any
from sqlalchemy import text
from app.ai.capabilities import Capability
from app.ai.gateway import reason
from app.ai.guards import wrap_untrusted
from app.ai.prompts_services import AMENDMENT_DIFF_SYSTEM, AMENDMENT_DIFF_USER
from app.ai.schemas_services import AmendmentDiffResult
from app.core.logging import get_logger
from app.db.session import session_scope

log = get_logger(__name__)














def _profile_hash(profile: dict[str, Any]) -> str:
    blob = json.dumps(
        {k: profile.get(k) for k in sorted(profile)}, default=str
    ).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()


async def diff_versions(
    *,
    bill_id: uuid.UUID,
    from_version_id: uuid.UUID,
    to_version_id: uuid.UUID,
    profile: dict[str, Any],
    run_id: uuid.UUID | None = None,
) -> uuid.UUID:
    async with session_scope() as session:
        rows = (
            await session.execute(
                text(
                    """
                    SELECT id, version_number, full_text, content_hash
                      FROM bill_versions
                     WHERE id = ANY(:ids)
                     ORDER BY version_number
                    """
                ),
                {"ids": [from_version_id, to_version_id]},
            )
        ).mappings().all()
    if len(rows) != 2:
        raise RuntimeError("Missing bill_versions for diff")

    a, b = rows[0], rows[1]
    cache_key = hashlib.sha256(
        f"{a['content_hash']}|{b['content_hash']}|{_profile_hash(profile)}".encode()
    ).hexdigest()

    async with session_scope() as session:
        cached = (
            await session.execute(
                text("SELECT id FROM amendment_diffs WHERE cache_key = :k"),
                {"k": cache_key},
            )
        ).scalar_one_or_none()
    if cached is not None:
        return cached

    result = await reason(
        task="amendment_diff",
        capability=Capability.DEEP_REASONING,
        schema=AmendmentDiffResult,
        system_prompt=AMENDMENT_DIFF_SYSTEM,
        user_prompt=AMENDMENT_DIFF_USER.format(
            profile_json=json.dumps(profile, default=str),
            jurisdiction=profile.get("__jurisdiction__", ""),
            bill_number=profile.get("__bill_number__", ""),
            title=profile.get("__title__", ""),
            version_a=wrap_untrusted(a["full_text"][:24_000], source=f"v{a['version_number']}"),
            version_b=wrap_untrusted(b["full_text"][:24_000], source=f"v{b['version_number']}"),
        ),
        run_id=run_id,
    )

    async with session_scope() as session:
        diff_id = (
            await session.execute(
                text(
                    """
                    INSERT INTO amendment_diffs
                       (bill_id, from_version_id, to_version_id,
                        changes, exposure_delta_usd, cache_key)
                    VALUES (:bid, :fv, :tv, CAST(:c AS jsonb), :delta, :k)
                    RETURNING id
                    """
                ),
                {
                    "bid": bill_id,
                    "fv": from_version_id,
                    "tv": to_version_id,
                    "c": json.dumps([ch.model_dump(mode="json") for ch in result.changes]),
                    "delta": result.exposure_delta_usd,
                    "k": cache_key,
                },
            )
        ).scalar_one()
    return diff_id
