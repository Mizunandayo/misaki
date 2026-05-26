from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

# Supabase pool has 10 connections on free tier; size accordingly.
engine = create_async_engine(
    settings.DATABASE_URL.get_secret_value(),
    pool_size=5,
    max_overflow=2,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False,
)



SessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency - yields a session, commits on success, rolls back on error."""
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise




@asynccontextmanager
async def session_scope() -> AsyncIterator[AsyncSession]:
    """Standalone context manager for Celery tasks and scripts."""
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        
