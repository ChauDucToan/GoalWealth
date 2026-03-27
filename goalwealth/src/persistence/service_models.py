from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID


@dataclass(slots=True)
class IdentityUpsertInput:
    provider: str
    provider_subject: str
    issuer: str
    provider_email: str | None = None
    email_verified: bool = False


@dataclass(slots=True)
class UserProfileUpsertInput:
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    city: str | None = None
    country: str | None = None
    timezone: str | None = None


@dataclass(slots=True)
class RiskProfileUpsertInput:
    risk_tolerance: str | None = None
    calculated_score: Decimal | float | None = None
    investment_horizon: str | None = None
    knowledge_level: str | None = None
    liquidity_needs: str | None = None
    max_loss: Decimal | float | None = None
    min_return: Decimal | float | None = None


@dataclass(slots=True)
class GoalCreateInput:
    title: str
    goal_type: str
    status: str = "active"
    priority: int = 5
    target_amount: Decimal | float | None = None
    current_progress: Decimal | float = 0
    target_date: date | None = None
    description: str | None = None


@dataclass(slots=True)
class GoalUpdateInput:
    title: str | None = None
    goal_type: str | None = None
    status: str | None = None
    priority: int | None = None
    target_amount: Decimal | float | None = None
    current_progress: Decimal | float | None = None
    target_date: date | None = None
    description: str | None = None


@dataclass(slots=True)
class ConversationSummaryUpsertInput:
    last_turn_date: datetime | None = None
    total_turns: int | None = None
    last_topic: str | None = None
    user_intent: str | None = None
    last_message: str | None = None


@dataclass(slots=True)
class OcrRecordCreateInput:
    ocr_record_id: str
    source_type: str
    document_type: str = "unknown"
    ingest_status: str = "pending_backend"
    parse_status: str | None = None
    language: str = "vi"
    ocr_provider: str | None = None
    file_name: str | None = None
    mime_type: str | None = None
    page_count: int | None = None
    issued_date: date | None = None
    currency: str | None = None
    institution_name: str | None = None
    document_reference: str | None = None
    raw_text: str | None = None
    raw_text_confidence: Decimal | float | None = None
    summary_text: str | None = None
    is_usable: bool | None = None
    overall_confidence: Decimal | float | None = None
    normalization_confidence: Decimal | float | None = None
    manual_review_required: bool = False
    auto_apply_allowed: bool = False
    normalized_data_jsonb: dict[str, Any] = field(default_factory=dict)
    validation_jsonb: dict[str, Any] = field(default_factory=dict)
    orchestration_hint_jsonb: dict[str, Any] = field(default_factory=dict)
    parser_model_id: str | None = None
    normalizer_version: str | None = None
    frontend_trace_id: str | None = None
    processed_at: datetime | None = None


@dataclass(slots=True)
class OcrRecordUpdateInput:
    ingest_status: str | None = None
    parse_status: str | None = None
    document_type: str | None = None
    raw_text: str | None = None
    raw_text_confidence: Decimal | float | None = None
    summary_text: str | None = None
    is_usable: bool | None = None
    overall_confidence: Decimal | float | None = None
    normalization_confidence: Decimal | float | None = None
    manual_review_required: bool | None = None
    auto_apply_allowed: bool | None = None
    normalized_data_jsonb: dict[str, Any] | None = None
    validation_jsonb: dict[str, Any] | None = None
    orchestration_hint_jsonb: dict[str, Any] | None = None
    parser_model_id: str | None = None
    normalizer_version: str | None = None
    processed_at: datetime | None = None


@dataclass(slots=True)
class ResolvedUser:
    user_id: UUID
    created_user: bool
    created_identity: bool


@dataclass(slots=True)
class UserBootstrapSnapshot:
    user_id: UUID
    full_name: str | None
    email: str | None
    phone: str | None
    city: str | None
    country: str | None
    timezone: str | None
    risk_tolerance: str | None
    calculated_score: Decimal | None
    investment_horizon: str | None
    total_goals: int
    total_active_goals: int
    recent_document_count: int
    last_topic: str | None
    last_message: str | None
