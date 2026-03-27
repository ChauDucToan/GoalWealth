from __future__ import annotations

from datetime import datetime
from typing import Sequence
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .models import ConversationSummary, Goal, OcrRecord, RiskProfile, User, UserIdentity, UserProfile
from .service_models import (
    ConversationSummaryUpsertInput,
    GoalCreateInput,
    IdentityUpsertInput,
    OcrRecordCreateInput,
    RiskProfileUpsertInput,
    UserProfileUpsertInput,
)


class UserRepository:
    def get(self, session: Session, user_id: UUID) -> User | None:
        return session.get(User, user_id)

    def create(self, session: Session, *, status: str = "active") -> User:
        record = User(status=status)
        session.add(record)
        session.flush()
        return record


class UserIdentityRepository:
    def get_by_provider_subject(
        self,
        session: Session,
        *,
        provider: str,
        provider_subject: str,
    ) -> UserIdentity | None:
        stmt = (
            select(UserIdentity)
            .where(UserIdentity.provider == provider)
            .where(UserIdentity.provider_subject == provider_subject)
            .limit(1)
        )
        return session.scalar(stmt)

    def get_by_subject(self, session: Session, *, provider_subject: str) -> UserIdentity | None:
        stmt = select(UserIdentity).where(UserIdentity.provider_subject == provider_subject).limit(1)
        return session.scalar(stmt)

    def create(
        self,
        session: Session,
        *,
        user_id: UUID,
        payload: IdentityUpsertInput,
    ) -> UserIdentity:
        record = UserIdentity(
            user_id=user_id,
            provider=payload.provider,
            provider_subject=payload.provider_subject,
            issuer=payload.issuer,
            provider_email=payload.provider_email,
            email_verified=payload.email_verified,
        )
        session.add(record)
        session.flush()
        return record

    def touch_login(
        self,
        identity: UserIdentity,
        *,
        login_time: datetime | None = None,
        provider_email: str | None = None,
        email_verified: bool | None = None,
    ) -> UserIdentity:
        identity.last_login_at = login_time or datetime.utcnow()
        if provider_email is not None:
            identity.provider_email = provider_email
        if email_verified is not None:
            identity.email_verified = email_verified
        return identity


class UserProfileRepository:
    def get(self, session: Session, user_id: UUID) -> UserProfile | None:
        return session.get(UserProfile, user_id)

    def upsert(
        self,
        session: Session,
        *,
        user_id: UUID,
        payload: UserProfileUpsertInput,
    ) -> UserProfile:
        record = self.get(session, user_id)
        if record is None:
            record = UserProfile(user_id=user_id)
            session.add(record)

        if payload.full_name is not None:
            record.full_name = payload.full_name
        if payload.email is not None:
            record.email = payload.email
        if payload.phone is not None:
            record.phone = payload.phone
        if payload.city is not None:
            record.city = payload.city
        if payload.country is not None:
            record.country = payload.country
        if payload.timezone is not None:
            record.timezone = payload.timezone

        session.flush()
        return record


class RiskProfileRepository:
    def get(self, session: Session, user_id: UUID) -> RiskProfile | None:
        return session.get(RiskProfile, user_id)

    def upsert(
        self,
        session: Session,
        *,
        user_id: UUID,
        payload: RiskProfileUpsertInput,
    ) -> RiskProfile:
        record = self.get(session, user_id)
        if record is None:
            record = RiskProfile(user_id=user_id)
            session.add(record)

        if payload.risk_tolerance is not None:
            record.risk_tolerance = payload.risk_tolerance
        if payload.calculated_score is not None:
            record.calculated_score = payload.calculated_score
        if payload.investment_horizon is not None:
            record.investment_horizon = payload.investment_horizon
        if payload.knowledge_level is not None:
            record.knowledge_level = payload.knowledge_level
        if payload.liquidity_needs is not None:
            record.liquidity_needs = payload.liquidity_needs
        if payload.max_loss is not None:
            record.max_loss = payload.max_loss
        if payload.min_return is not None:
            record.min_return = payload.min_return

        session.flush()
        return record


class GoalRepository:
    def create(
        self,
        session: Session,
        *,
        user_id: UUID,
        payload: GoalCreateInput,
    ) -> Goal:
        record = Goal(
            user_id=user_id,
            title=payload.title,
            goal_type=payload.goal_type,
            status=payload.status,
            priority=payload.priority,
            target_amount=payload.target_amount,
            current_progress=payload.current_progress,
            target_date=payload.target_date,
            description=payload.description,
        )
        session.add(record)
        session.flush()
        return record

    def list_for_user(
        self,
        session: Session,
        *,
        user_id: UUID,
        statuses: Sequence[str] | None = None,
    ) -> list[Goal]:
        stmt = select(Goal).where(Goal.user_id == user_id).order_by(Goal.created_at.desc())
        if statuses:
            stmt = stmt.where(Goal.status.in_(list(statuses)))
        return list(session.scalars(stmt).all())

    def count_for_user(
        self,
        session: Session,
        *,
        user_id: UUID,
        status: str | None = None,
    ) -> int:
        stmt = select(func.count()).select_from(Goal).where(Goal.user_id == user_id)
        if status is not None:
            stmt = stmt.where(Goal.status == status)
        return int(session.scalar(stmt) or 0)


class ConversationSummaryRepository:
    def get(self, session: Session, user_id: UUID) -> ConversationSummary | None:
        return session.get(ConversationSummary, user_id)

    def upsert(
        self,
        session: Session,
        *,
        user_id: UUID,
        payload: ConversationSummaryUpsertInput,
    ) -> ConversationSummary:
        record = self.get(session, user_id)
        if record is None:
            record = ConversationSummary(user_id=user_id)
            session.add(record)

        if payload.last_turn_date is not None:
            record.last_turn_date = payload.last_turn_date
        if payload.total_turns is not None:
            record.total_turns = payload.total_turns
        if payload.last_topic is not None:
            record.last_topic = payload.last_topic
        if payload.user_intent is not None:
            record.user_intent = payload.user_intent
        if payload.last_message is not None:
            record.last_message = payload.last_message

        session.flush()
        return record


class OcrRecordRepository:
    def create(
        self,
        session: Session,
        *,
        user_id: UUID,
        payload: OcrRecordCreateInput,
    ) -> OcrRecord:
        record = OcrRecord(
            ocr_record_id=payload.ocr_record_id,
            user_id=user_id,
            source_type=payload.source_type,
            document_type=payload.document_type,
            ingest_status=payload.ingest_status,
            parse_status=payload.parse_status,
            language=payload.language,
            ocr_provider=payload.ocr_provider,
            file_name=payload.file_name,
            mime_type=payload.mime_type,
            page_count=payload.page_count,
            issued_date=payload.issued_date,
            currency=payload.currency,
            institution_name=payload.institution_name,
            document_reference=payload.document_reference,
            raw_text=payload.raw_text,
            raw_text_confidence=payload.raw_text_confidence,
            summary_text=payload.summary_text,
            is_usable=payload.is_usable,
            overall_confidence=payload.overall_confidence,
            normalization_confidence=payload.normalization_confidence,
            manual_review_required=payload.manual_review_required,
            auto_apply_allowed=payload.auto_apply_allowed,
            normalized_data_jsonb=payload.normalized_data_jsonb,
            validation_jsonb=payload.validation_jsonb,
            orchestration_hint_jsonb=payload.orchestration_hint_jsonb,
            parser_model_id=payload.parser_model_id,
            normalizer_version=payload.normalizer_version,
            frontend_trace_id=payload.frontend_trace_id,
            processed_at=payload.processed_at,
        )
        session.add(record)
        session.flush()
        return record

    def get_for_user(
        self,
        session: Session,
        *,
        user_id: UUID,
        ocr_record_id: str,
    ) -> OcrRecord | None:
        stmt = (
            select(OcrRecord)
            .where(OcrRecord.user_id == user_id)
            .where(OcrRecord.ocr_record_id == ocr_record_id)
            .limit(1)
        )
        return session.scalar(stmt)

    def update_for_user(
        self,
        session: Session,
        *,
        user_id: UUID,
        ocr_record_id: str,
        payload,
    ) -> OcrRecord | None:
        record = self.get_for_user(session, user_id=user_id, ocr_record_id=ocr_record_id)
        if record is None:
            return None

        fields = (
            "ingest_status",
            "parse_status",
            "document_type",
            "raw_text",
            "raw_text_confidence",
            "summary_text",
            "is_usable",
            "overall_confidence",
            "normalization_confidence",
            "manual_review_required",
            "auto_apply_allowed",
            "normalized_data_jsonb",
            "validation_jsonb",
            "orchestration_hint_jsonb",
            "parser_model_id",
            "normalizer_version",
            "processed_at",
        )
        for field in fields:
            value = getattr(payload, field, None)
            if value is not None:
                setattr(record, field, value)

        session.flush()
        return record

    def count_for_user(self, session: Session, *, user_id: UUID) -> int:
        stmt = select(func.count()).select_from(OcrRecord).where(OcrRecord.user_id == user_id)
        return int(session.scalar(stmt) or 0)

    def count_grouped_by_document_type(self, session: Session, *, user_id: UUID) -> dict[str, int]:
        stmt = (
            select(OcrRecord.document_type, func.count())
            .where(OcrRecord.user_id == user_id)
            .group_by(OcrRecord.document_type)
        )
        return {str(document_type): int(count) for document_type, count in session.execute(stmt).all()}

    def list_recent_for_user(self, session: Session, *, user_id: UUID, limit: int = 10) -> list[OcrRecord]:
        stmt = (
            select(OcrRecord)
            .where(OcrRecord.user_id == user_id)
            .order_by(OcrRecord.created_at.desc())
            .limit(limit)
        )
        return list(session.scalars(stmt).all())
