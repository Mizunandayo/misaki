"""
Supabase Storage client — upload PDFs and mint 24h signed URLs.
Uses asyncio.to_thread() for the synchronous supabase-py SDK calls.
Service role key is required for private bucket access.
"""
from __future__ import annotations
import asyncio
from functools import lru_cache
from supabase import Client, create_client
from app.core.config import settings
from app.core.logging import get_logger





log = get_logger(__name__)
BUCKET = "briefs"


@lru_cache(maxsize=1)
def _client() -> Client:
    return create_client(
        str(settings.SUPABASE_URL),
        settings.SUPABASE_SERVICE_ROLE_KEY.get_secret_value(),
    )






async def upload_pdf(path: str, pdf_bytes: bytes) -> None:
    """Upload PDF bytes to the private 'briefs' bucket."""

    def _upload() -> None:
        try:
            _client().storage.from_(BUCKET).upload(
                path=path,
                file=pdf_bytes,
                file_options={"content-type": "application/pdf", "upsert": "true"},
            )
        except Exception as exc:
            log.error("storage_upload_failed", path=path, error=str(exc))
            raise RuntimeError(f"Storage upload failed: {exc}") from exc

    await asyncio.to_thread(_upload)






async def create_signed_url(path: str, expires_in: int = 86_400) -> str:
    """Returns a 24h signed URL for the given storage path."""

    def _sign() -> str:
        result = _client().storage.from_(BUCKET).create_signed_url(path, expires_in)
        # supabase-py v2 may return an object or a dict — handle both
        if hasattr(result, "signed_url"):
            url = result.signed_url or ""
        elif isinstance(result, dict):
            url = result.get("signedURL") or result.get("signed_url") or ""
        else:
            url = str(result)

        if not url:
            raise RuntimeError("Supabase returned empty signed URL")
        return url

    return await asyncio.to_thread(_sign)
