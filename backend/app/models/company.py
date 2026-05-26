from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import ARRAY, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base





class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    industry_tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    jurisdictions: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    headcount: Mapped[int | None] = mapped_column(Integer)
    revenue_band: Mapped[str | None] = mapped_column(String(64))
    data_handling_classification: Mapped[str | None] = mapped_column(String(64))
    compliance_certifications: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    tech_stack_indicators: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    profile_confidence_score: Mapped[int] = mapped_column(Integer, default=0)
    profile_gaps: Mapped[list[dict]] = mapped_column(JSONB, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )