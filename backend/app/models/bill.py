"""Bill ORM model - mirrors db/migrations"""

from __future__ import annotations

import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base



class Bill(Base):
    __tablename__ = "bills"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    jurisdiction: Mapped[str] = mapped_column(String(8), nullable=False, index=True)
    bill_number: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    full_text: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32), default="introduced")
    introduced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_action_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    effective_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    source_url: Mapped[str | None] = mapped_column(Text)
    content_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    pass_probability: Mapped[int] = mapped_column(Integer, default=0)
    urgency_score: Mapped[int] = mapped_column(Integer, default=0, index=True)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(768))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )