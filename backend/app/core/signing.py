from __future__ import annotations
import base64
import hashlib
import hmac
import time
from typing import Literal
from app.core.config import settings





Kind = Literal["scanner", "brief"]
DEFAULT_TTL_SECONDS = 24 * 3600












def _b64url(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode("ascii").rstrip("=")


def _b64url_decode(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)


def _key() -> bytes:
    return settings.MISAKI_SIGNING_KEY.get_secret_value().encode("utf-8")




def mint(kind: Kind, resource_id: str, *, ttl_seconds: int = DEFAULT_TTL_SECONDS) -> str:
    """Returns a URL-safe token tying (kind, resource_id) to an expiry."""
    exp = int(time.time()) + max(60, ttl_seconds)
    payload = f"{kind}|{resource_id}|{exp}".encode("utf-8")
    sig = hmac.new(_key(), payload, hashlib.sha256).digest()
    return f"{_b64url(payload)}.{_b64url(sig)}"






def verify(token: str, *, expected_kind: Kind) -> str | None:
    """Returns the resource_id if valid, None otherwise. Constant-time HMAC check."""
    try:
        payload_b64, sig_b64 = token.split(".", 1)
    except ValueError:
        return None
    try:
        payload = _b64url_decode(payload_b64)
        sig = _b64url_decode(sig_b64)
    except Exception:
        return None

    expected_sig = hmac.new(_key(), payload, hashlib.sha256).digest()
    if not hmac.compare_digest(sig, expected_sig):
        return None

    try:
        kind, resource_id, exp_str = payload.decode("utf-8").split("|")
        exp = int(exp_str)
    except Exception:
        return None
    if kind != expected_kind:
        return None
    if exp < int(time.time()):
        return None
    return resource_id