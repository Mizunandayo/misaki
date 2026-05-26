from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.redis_client import get_redis

router = APIRouter()


class HealthCheck(BaseModel):
    db: Literal["ok", "down"]
    redis: Literal["ok", "down"]


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    checks: HealthCheck


@router.get("/healthz", response_model=HealthResponse)
async def healthz(db: AsyncSession = Depends(get_db)) -> HealthResponse:
    db_status: Literal["ok", "down"] = "ok"
    redis_status: Literal["ok", "down"] = "ok"

    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "down"

    try:
        await get_redis().ping()
    except Exception:
        redis_status = "down"

    overall = "ok" if db_status == "ok" and redis_status == "ok" else "degraded"

    return HealthResponse(
        status=overall,
        checks=HealthCheck(db=db_status, redis=redis_status),
    )