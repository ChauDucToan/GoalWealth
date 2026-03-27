from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import (
    DATE,
    TIMESTAMP,
    Boolean,
    CheckConstraint,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("status IN ('active', 'disabled', 'deleted')", name="status_allowed"),
    )

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    status: Mapped[str] = mapped_column(String, nullable=False, server_default=text("'active'"))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    identities: Mapped[list["UserIdentity"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    profile: Mapped["UserProfile | None"] = relationship(back_populates="user", cascade="all, delete-orphan", uselist=False)
    risk_profile: Mapped["RiskProfile | None"] = relationship(back_populates="user", cascade="all, delete-orphan", uselist=False)
    goals: Mapped[list["Goal"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    conversation_summary: Mapped["ConversationSummary | None"] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
    ocr_records: Mapped[list["OcrRecord"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    recommendation_states: Mapped[list["RecommendationState"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class UserIdentity(Base):
    __tablename__ = "user_identities"
    __table_args__ = (
        Index("idx_user_identities_user_id", "user_id"),
        Index("idx_user_identities_provider_email", "provider_email"),
    )

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider: Mapped[str] = mapped_column(String, nullable=False)
    provider_subject: Mapped[str] = mapped_column(String, nullable=False, unique=False)
    issuer: Mapped[str] = mapped_column(String, nullable=False)
    provider_email: Mapped[str | None] = mapped_column(String, nullable=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    linked_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    last_login_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    user: Mapped[User] = relationship(back_populates="identities")


Index(
    "uq_user_identities_provider_subject",
    UserIdentity.provider,
    UserIdentity.provider_subject,
    unique=True,
)


class UserProfile(Base):
    __tablename__ = "user_profiles"
    __table_args__ = (
        Index("idx_user_profiles_email", "email"),
    )

    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    city: Mapped[str | None] = mapped_column(String, nullable=True)
    country: Mapped[str | None] = mapped_column(String, nullable=True)
    timezone: Mapped[str] = mapped_column(String, nullable=False, server_default=text("'Asia/Ho_Chi_Minh'"))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    user: Mapped[User] = relationship(back_populates="profile")


class RiskProfile(Base):
    __tablename__ = "risk_profiles"
    __table_args__ = (
        CheckConstraint(
            "risk_tolerance IS NULL OR risk_tolerance IN ('conservative', 'moderate', 'balanced', 'growth', 'aggressive')",
            name="risk_tolerance_allowed",
        ),
        CheckConstraint(
            "calculated_score IS NULL OR (calculated_score >= 0 AND calculated_score <= 100)",
            name="calculated_score_range",
        ),
        CheckConstraint(
            "investment_horizon IS NULL OR investment_horizon IN ('short_term', 'medium_term', 'long_term')",
            name="investment_horizon_allowed",
        ),
        CheckConstraint(
            "knowledge_level IS NULL OR knowledge_level IN ('beginner', 'intermediate', 'advanced', 'expert')",
            name="knowledge_level_allowed",
        ),
        CheckConstraint(
            "liquidity_needs IS NULL OR liquidity_needs IN ('high', 'medium', 'low')",
            name="liquidity_needs_allowed",
        ),
        CheckConstraint(
            "max_loss IS NULL OR (max_loss >= 0 AND max_loss <= 100)",
            name="max_loss_range",
        ),
        CheckConstraint(
            "min_return IS NULL OR (min_return >= -100 AND min_return <= 100)",
            name="min_return_range",
        ),
    )

    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    risk_tolerance: Mapped[str | None] = mapped_column(String, nullable=True)
    calculated_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    investment_horizon: Mapped[str | None] = mapped_column(String, nullable=True)
    knowledge_level: Mapped[str | None] = mapped_column(String, nullable=True)
    liquidity_needs: Mapped[str | None] = mapped_column(String, nullable=True)
    max_loss: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    min_return: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    user: Mapped[User] = relationship(back_populates="risk_profile")


class Goal(Base):
    __tablename__ = "goals"
    __table_args__ = (
        CheckConstraint(
            "goal_type IN ('savings_goal', 'debt_payoff_goal', 'investment_goal', 'retirement_goal', 'emergency_fund_goal', 'wealth_building_goal')",
            name="goal_type_allowed",
        ),
        CheckConstraint("status IN ('active', 'completed', 'paused', 'archived')", name="status_allowed"),
        CheckConstraint("priority BETWEEN 1 AND 10", name="priority_range"),
        CheckConstraint("target_amount IS NULL OR target_amount >= 0", name="target_amount_non_negative"),
        CheckConstraint("current_progress >= 0", name="current_progress_non_negative"),
        Index("idx_goals_user_id", "user_id"),
        Index("idx_goals_user_status", "user_id", "status"),
    )

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    goal_type: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, server_default=text("'active'"))
    priority: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("5"))
    target_amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    current_progress: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False, server_default=text("0"))
    target_date: Mapped[date | None] = mapped_column(DATE, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    user: Mapped[User] = relationship(back_populates="goals")


class ConversationSummary(Base):
    __tablename__ = "conversation_summaries"
    __table_args__ = (
        CheckConstraint("total_turns >= 0", name="total_turns_non_negative"),
    )

    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    last_turn_date: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    total_turns: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    last_topic: Mapped[str | None] = mapped_column(String, nullable=True)
    user_intent: Mapped[str | None] = mapped_column(String, nullable=True)
    last_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    user: Mapped[User] = relationship(back_populates="conversation_summary")


class OcrRecord(Base):
    __tablename__ = "ocr_records"
    __table_args__ = (
        CheckConstraint(
            "source_type IN ('image_upload', 'camera_capture', 'pdf_upload', 'frontend_sdk', 'api_import')",
            name="source_type_allowed",
        ),
        CheckConstraint(
            "document_type IN ('receipt', 'bank_statement', 'salary_slip', 'investment_statement', 'insurance_document', 'unknown')",
            name="document_type_allowed",
        ),
        CheckConstraint(
            "ingest_status IN ('pending_backend', 'pending_user_context', 'ready', 'failed')",
            name="ingest_status_allowed",
        ),
        CheckConstraint(
            "parse_status IS NULL OR parse_status IN ('processed', 'needs_review', 'validation_failed', 'rejected')",
            name="parse_status_allowed",
        ),
        CheckConstraint(
            "raw_text_confidence IS NULL OR (raw_text_confidence >= 0 AND raw_text_confidence <= 1)",
            name="raw_text_confidence_range",
        ),
        CheckConstraint(
            "overall_confidence IS NULL OR (overall_confidence >= 0 AND overall_confidence <= 1)",
            name="overall_confidence_range",
        ),
        CheckConstraint(
            "normalization_confidence IS NULL OR (normalization_confidence >= 0 AND normalization_confidence <= 1)",
            name="normalization_confidence_range",
        ),
        CheckConstraint(
            "page_count IS NULL OR page_count >= 1",
            name="page_count_minimum",
        ),
        Index("idx_ocr_records_user_id", "user_id"),
        Index("idx_ocr_records_user_created_at", "user_id", "created_at"),
        Index("idx_ocr_records_ingest_status", "ingest_status"),
        Index("idx_ocr_records_parse_status", "parse_status"),
        Index("idx_ocr_records_document_type", "document_type"),
        Index("idx_ocr_records_normalized_data_gin", "normalized_data_jsonb", postgresql_using="gin"),
    )

    ocr_record_id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    source_type: Mapped[str] = mapped_column(String, nullable=False)
    document_type: Mapped[str] = mapped_column(String, nullable=False, server_default=text("'unknown'"))
    ingest_status: Mapped[str] = mapped_column(String, nullable=False, server_default=text("'pending_backend'"))
    parse_status: Mapped[str | None] = mapped_column(String, nullable=True)
    language: Mapped[str] = mapped_column(String, nullable=False, server_default=text("'vi'"))
    ocr_provider: Mapped[str | None] = mapped_column(String, nullable=True)
    file_name: Mapped[str | None] = mapped_column(String, nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String, nullable=True)
    page_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    issued_date: Mapped[date | None] = mapped_column(DATE, nullable=True)
    currency: Mapped[str | None] = mapped_column(String(3), nullable=True)
    institution_name: Mapped[str | None] = mapped_column(String, nullable=True)
    document_reference: Mapped[str | None] = mapped_column(String, nullable=True)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_text_confidence: Mapped[Decimal | None] = mapped_column(Numeric(4, 3), nullable=True)
    summary_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_usable: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    overall_confidence: Mapped[Decimal | None] = mapped_column(Numeric(4, 3), nullable=True)
    normalization_confidence: Mapped[Decimal | None] = mapped_column(Numeric(4, 3), nullable=True)
    manual_review_required: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    auto_apply_allowed: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    normalized_data_jsonb: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    validation_jsonb: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    orchestration_hint_jsonb: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    parser_model_id: Mapped[str | None] = mapped_column(String, nullable=True)
    normalizer_version: Mapped[str | None] = mapped_column(String, nullable=True)
    frontend_trace_id: Mapped[str | None] = mapped_column(String, nullable=True)
    processed_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    user: Mapped[User] = relationship(back_populates="ocr_records")


class RecommendationState(Base):
    __tablename__ = "recommendation_states"
    __table_args__ = (
        CheckConstraint("status IN ('dismissed')", name="recommendation_state_status_allowed"),
        Index("idx_recommendation_states_user_id", "user_id"),
        Index("idx_recommendation_states_user_status", "user_id", "status"),
        Index("uq_recommendation_states_user_recommendation", "user_id", "recommendation_id", unique=True),
    )

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recommendation_id: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, server_default=text("'dismissed'"))
    dismissed_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    user: Mapped[User] = relationship(back_populates="recommendation_states")
