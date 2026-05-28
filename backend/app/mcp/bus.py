"""MCP event bus — single asyncpg LISTEN connection in the FastAPI process.

The publisher (app/mcp/events.py) writes to mcp_events AND calls pg_notify.
This listener consumes the NOTIFY stream and routes each payload into
per-run asyncio.Queues so any SSE subscriber awaiting a given run_id
gets the live stream.

Architecture note: Supabase's Session Pooler (port 5432) maintains
session affinity — LISTEN/NOTIFY works through it. If you ever migrate
to the Transaction Pooler (port 6543), LISTEN/NOTIFY will break — that
pooler multiplexes connections per-transaction and drops listeners
between txns. Stay on 5432 for this code path.
"""

from __future__ import annotations

import asyncio
import contextlib
import json
import uuid
from collections import defaultdict
from typing import AsyncIterator

import asyncpg

from app.core.config import settings
from app.core.logging import get_logger

log = get_logger(__name__)


class EventBus:
    def __init__(self) -> None:
        self._conn: asyncpg.Connection | None = None
        self._subs: dict[uuid.UUID, set[asyncio.Queue[dict]]] = defaultdict(set)
        self._lock = asyncio.Lock()
        self._loop: asyncio.AbstractEventLoop | None = None

    async def start(self) -> None:
        if self._conn is not None:
            return
        # asyncpg expects postgresql:// (not the SQLAlchemy +asyncpg flavor).
        dsn = settings.DATABASE_URL.get_secret_value()
        dsn = dsn.replace("postgresql+asyncpg://", "postgresql://")
        self._loop = asyncio.get_running_loop()
        self._conn = await asyncpg.connect(dsn=dsn)
        await self._conn.add_listener(settings.MCP_EVENT_CHANNEL, self._on_notify)
        log.info("mcp_bus_started", channel=settings.MCP_EVENT_CHANNEL)

    async def stop(self) -> None:
        if self._conn is None:
            return
        with contextlib.suppress(Exception):
            await self._conn.remove_listener(
                settings.MCP_EVENT_CHANNEL, self._on_notify
            )
        with contextlib.suppress(Exception):
            await self._conn.close()
        self._conn = None
        log.info("mcp_bus_stopped")

    def _on_notify(self, _conn, _pid, _channel, payload: str) -> None:
        """asyncpg invokes this from the listener's read loop. Parse the
        payload, look up matching subscribers, fan out non-blocking."""
        try:
            data = json.loads(payload)
            rid = uuid.UUID(data["run_id"])
        except Exception:
            return
        for q in list(self._subs.get(rid, ())):
            with contextlib.suppress(asyncio.QueueFull):
                q.put_nowait(data)

    async def subscribe(self, run_id: uuid.UUID) -> AsyncIterator[dict]:
        """SSE handler awaits this. Yields every NOTIFY payload for the
        given run_id until the caller breaks (typically on CONCLUDE/ERROR)."""
        q: asyncio.Queue[dict] = asyncio.Queue(maxsize=512)
        async with self._lock:
            self._subs[run_id].add(q)
        try:
            while True:
                msg = await q.get()
                yield msg
        finally:
            async with self._lock:
                self._subs[run_id].discard(q)
                if not self._subs[run_id]:
                    self._subs.pop(run_id, None)


bus = EventBus()
