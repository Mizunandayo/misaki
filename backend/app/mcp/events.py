"""MCP event types published over Postgres LISTEN/NOTIFY.

publish_event() is fire-and-forget: it INSERTs into mcp_events AND calls
pg_notify(). The SSE relay (app/mcp/bus.py, Phase 2) consumes the NOTIFY
stream. Until that listener is wired, publishes still persist to the
table — so nothing is lost; the terminal panel just won't stream live
yet.

This module is imported by app/ai/gateway.py so the gateway can emit a
THINK card naming the chosen model on every reason() call. That's how
the "Routing to <model> via <provider>" cards appear in the terminal."""

from __future__ import annotations

import json
import uuid
from dataclasses import dataclass
from enum import Enum
from typing import Any

from sqlalchemy import text

from app.core.config import settings
from app.db.session import session_scope


class EventType(str, Enum):
    ACT = "ACT"
    OBSERVE = "OBSERVE"
    THINK = "THINK"
    CONCLUDE = "CONCLUDE"
    ERROR = "ERROR"


@dataclass
class ModelTrace:
    """Embedded in THINK card payloads so the frontend ModelRouterBadge
    can render provider+model without parsing the text field."""
    provider: str
    model: str


async def publish_event(
    run_id: uuid.UUID,
    event_type: EventType,
    payload: dict[str, Any],
    *,
    cached: bool = False,
) -> None:
    """Persist + broadcast one MCP event for a run.

    The INSERT is the source of truth (the SSE relay backfills from this
    table on subscribe). The pg_notify call is the live push. Both happen
    in one transaction via session_scope()."""
    payload_with_meta = {**payload, "cached": cached}
    async with session_scope() as session:
        await session.execute(
            text(
                """
                INSERT INTO mcp_events (run_id, event_type, payload, cached)
                VALUES (:rid, :etype, CAST(:pl AS jsonb), :cached)
                """
            ),
            {
                "rid": run_id,
                "etype": event_type.value,
                "pl": json.dumps(payload_with_meta, default=str),
                "cached": cached,
            },
        )
        notify_payload = json.dumps(
            {
                "run_id": str(run_id),
                "type": event_type.value,
                "payload": payload_with_meta,
            },
            default=str,
        )
        # pg_notify avoids quoting issues with the NOTIFY <channel>, '<payload>' form.
        await session.execute(
            text("SELECT pg_notify(:ch, :msg)"),
            {"ch": settings.MCP_EVENT_CHANNEL, "msg": notify_payload},
        )
