from __future__ import annotations

from uuid import UUID

from sqlalchemy.exc import ProgrammingError
from sqlalchemy.orm import sessionmaker

from .repositories import (
    ConversationSummaryRepository,
    GoalRepository,
    OcrRecordRepository,
    RecommendationStateRepository,
    RiskProfileRepository,
    UserIdentityRepository,
    UserProfileRepository,
    UserRepository,
)
from .service_models import (
    ConversationSummaryUpsertInput,
    GoalCreateInput,
    GoalUpdateInput,
    IdentityUpsertInput,
    OcrRecordCreateInput,
    OcrRecordUpdateInput,
    ResolvedUser,
    RiskProfileUpsertInput,
    UserBootstrapSnapshot,
    UserProfileUpsertInput,
)


def _coerce_user_id(user_id: UUID | str) -> UUID | str:
    if isinstance(user_id, UUID):
        return user_id
    try:
        return UUID(str(user_id))
    except (TypeError, ValueError):
        return user_id


class GoalWealthPersistenceService:
    """Draft persistence service for GoalWealth PostgreSQL-backed storage.

    This class intentionally keeps runtime wiring out of scope for now.
    It provides a practical boundary for the next phase where FastAPI routes
    or internal services can consume a stable storage-oriented API.
    """

    def __init__(
        self,
        session_factory: sessionmaker,
        *,
        users: UserRepository | None = None,
        identities: UserIdentityRepository | None = None,
        profiles: UserProfileRepository | None = None,
        risk_profiles: RiskProfileRepository | None = None,
        goals: GoalRepository | None = None,
        conversation_summaries: ConversationSummaryRepository | None = None,
        ocr_records: OcrRecordRepository | None = None,
        recommendation_states: RecommendationStateRepository | None = None,
    ):
        self.session_factory = session_factory
        self.users = users or UserRepository()
        self.identities = identities or UserIdentityRepository()
        self.profiles = profiles or UserProfileRepository()
        self.risk_profiles = risk_profiles or RiskProfileRepository()
        self.goals = goals or GoalRepository()
        self.conversation_summaries = conversation_summaries or ConversationSummaryRepository()
        self.ocr_records = ocr_records or OcrRecordRepository()
        self.recommendation_states = recommendation_states or RecommendationStateRepository()

    def resolve_or_create_user(
        self,
        identity: IdentityUpsertInput,
        *,
        profile: UserProfileUpsertInput | None = None,
    ) -> ResolvedUser:
        with self.session_factory.begin() as session:
            existing_identity = self.identities.get_by_provider_subject(
                session,
                provider=identity.provider,
                provider_subject=identity.provider_subject,
            )
            if existing_identity is not None:
                self.identities.touch_login(
                    existing_identity,
                    provider_email=identity.provider_email,
                    email_verified=identity.email_verified,
                )
                if profile is not None:
                    self.profiles.upsert(session, user_id=existing_identity.user_id, payload=profile)
                session.flush()
                return ResolvedUser(
                    user_id=existing_identity.user_id,
                    created_user=False,
                    created_identity=False,
                )

            user = self.users.create(session)
            created_identity = self.identities.create(session, user_id=user.id, payload=identity)
            self.identities.touch_login(
                created_identity,
                provider_email=identity.provider_email,
                email_verified=identity.email_verified,
            )
            if profile is not None:
                self.profiles.upsert(session, user_id=user.id, payload=profile)
            session.flush()
            return ResolvedUser(
                user_id=user.id,
                created_user=True,
                created_identity=True,
            )

    def resolve_existing_user_id(self, user_reference: str) -> UUID | None:
        with self.session_factory() as session:
            try:
                parsed_uuid = UUID(str(user_reference))
            except (TypeError, ValueError):
                parsed_uuid = None

            if parsed_uuid is not None:
                existing_user = self.users.get(session, parsed_uuid)
                if existing_user is not None:
                    return existing_user.id

            identity = self.identities.get_by_subject(session, provider_subject=str(user_reference))
            if identity is not None:
                return identity.user_id
            return None

    def upsert_user_profile(self, user_id, payload: UserProfileUpsertInput):
        with self.session_factory.begin() as session:
            return self.profiles.upsert(session, user_id=_coerce_user_id(user_id), payload=payload)

    def get_user_profile(self, user_id):
        with self.session_factory() as session:
            return self.profiles.get(session, _coerce_user_id(user_id))

    def upsert_risk_profile(self, user_id, payload: RiskProfileUpsertInput):
        with self.session_factory.begin() as session:
            return self.risk_profiles.upsert(session, user_id=_coerce_user_id(user_id), payload=payload)

    def get_risk_profile(self, user_id):
        with self.session_factory() as session:
            return self.risk_profiles.get(session, _coerce_user_id(user_id))

    def create_goal(self, user_id, payload: GoalCreateInput):
        with self.session_factory.begin() as session:
            return self.goals.create(session, user_id=_coerce_user_id(user_id), payload=payload)

    def list_goals_for_user(self, user_id, *, statuses=None):
        with self.session_factory() as session:
            return self.goals.list_for_user(session, user_id=_coerce_user_id(user_id), statuses=statuses)

    def get_goal_for_user(self, user_id, goal_id):
        with self.session_factory() as session:
            return self.goals.get_for_user(session, user_id=_coerce_user_id(user_id), goal_id=_coerce_user_id(goal_id))

    def update_goal_for_user(self, user_id, goal_id, payload: GoalUpdateInput):
        with self.session_factory.begin() as session:
            return self.goals.update_for_user(
                session,
                user_id=_coerce_user_id(user_id),
                goal_id=_coerce_user_id(goal_id),
                payload=payload,
            )

    def get_conversation_summary(self, user_id):
        with self.session_factory() as session:
            return self.conversation_summaries.get(session, _coerce_user_id(user_id))

    def upsert_conversation_summary(self, user_id, payload: ConversationSummaryUpsertInput):
        with self.session_factory.begin() as session:
            return self.conversation_summaries.upsert(session, user_id=_coerce_user_id(user_id), payload=payload)

    def create_ocr_record(self, user_id, payload: OcrRecordCreateInput):
        with self.session_factory.begin() as session:
            return self.ocr_records.create(session, user_id=_coerce_user_id(user_id), payload=payload)

    def update_ocr_record(self, user_id, ocr_record_id: str, payload: OcrRecordUpdateInput):
        with self.session_factory.begin() as session:
            return self.ocr_records.update_for_user(
                session,
                user_id=_coerce_user_id(user_id),
                ocr_record_id=ocr_record_id,
                payload=payload,
            )

    def get_ocr_record(self, user_id, ocr_record_id: str):
        with self.session_factory() as session:
            return self.ocr_records.get_for_user(session, user_id=_coerce_user_id(user_id), ocr_record_id=ocr_record_id)

    def list_recent_ocr_for_user(self, user_id, *, limit: int = 10):
        with self.session_factory() as session:
            return self.ocr_records.list_recent_for_user(session, user_id=_coerce_user_id(user_id), limit=limit)

    def count_ocr_by_document_type_for_user(self, user_id) -> dict[str, int]:
        with self.session_factory() as session:
            return self.ocr_records.count_grouped_by_document_type(session, user_id=_coerce_user_id(user_id))

    def list_dismissed_recommendation_ids_for_user(self, user_id) -> set[str]:
        try:
            with self.session_factory() as session:
                return self.recommendation_states.list_dismissed_ids_for_user(session, user_id=_coerce_user_id(user_id))
        except ProgrammingError as exc:
            error_text = str(exc).lower()
            if "recommendation_states" in error_text and "does not exist" in error_text:
                return set()
            raise

    def list_completed_recommendation_ids_for_user(self, user_id) -> set[str]:
        try:
            with self.session_factory() as session:
                return self.recommendation_states.list_completed_ids_for_user(session, user_id=_coerce_user_id(user_id))
        except ProgrammingError as exc:
            error_text = str(exc).lower()
            if "recommendation_states" in error_text and "does not exist" in error_text:
                return set()
            raise

    def get_recommendation_state_for_user(self, user_id, recommendation_id: str):
        try:
            with self.session_factory() as session:
                return self.recommendation_states.get_for_user(
                    session,
                    user_id=_coerce_user_id(user_id),
                    recommendation_id=recommendation_id,
                )
        except ProgrammingError as exc:
            error_text = str(exc).lower()
            if "recommendation_states" in error_text and "does not exist" in error_text:
                return None
            raise

    def dismiss_recommendation_for_user(self, user_id, recommendation_id: str):
        try:
            with self.session_factory.begin() as session:
                return self.recommendation_states.dismiss_for_user(
                    session,
                    user_id=_coerce_user_id(user_id),
                    recommendation_id=recommendation_id,
                )
        except ProgrammingError as exc:
            error_text = str(exc).lower()
            if "recommendation_states" in error_text and "does not exist" in error_text:
                raise ValueError(
                    "Recommendation dismiss state is not ready; apply the recommendation_states DB patch first."
                ) from exc
            raise

    def complete_recommendation_for_user(self, user_id, recommendation_id: str):
        try:
            with self.session_factory.begin() as session:
                return self.recommendation_states.complete_for_user(
                    session,
                    user_id=_coerce_user_id(user_id),
                    recommendation_id=recommendation_id,
                )
        except ProgrammingError as exc:
            error_text = str(exc).lower()
            if "recommendation_states" in error_text and "does not exist" in error_text:
                raise ValueError(
                    "Recommendation state is not ready; apply the recommendation_states DB patch first."
                ) from exc
            raise

    def undismiss_recommendation_for_user(self, user_id, recommendation_id: str) -> bool:
        try:
            with self.session_factory.begin() as session:
                return self.recommendation_states.undismiss_for_user(
                    session,
                    user_id=_coerce_user_id(user_id),
                    recommendation_id=recommendation_id,
                )
        except ProgrammingError as exc:
            error_text = str(exc).lower()
            if "recommendation_states" in error_text and "does not exist" in error_text:
                raise ValueError(
                    "Recommendation dismiss state is not ready; apply the recommendation_states DB patch first."
                ) from exc
            raise

    def build_user_bootstrap_snapshot(self, user_id) -> UserBootstrapSnapshot:
        normalized_user_id = _coerce_user_id(user_id)
        with self.session_factory() as session:
            profile = self.profiles.get(session, normalized_user_id)
            risk = self.risk_profiles.get(session, normalized_user_id)
            conversation = self.conversation_summaries.get(session, normalized_user_id)
            total_goals = self.goals.count_for_user(session, user_id=normalized_user_id)
            total_active_goals = self.goals.count_for_user(session, user_id=normalized_user_id, status="active")
            recent_document_count = self.ocr_records.count_for_user(session, user_id=normalized_user_id)

            return UserBootstrapSnapshot(
                user_id=normalized_user_id,
                full_name=getattr(profile, "full_name", None),
                email=getattr(profile, "email", None),
                phone=getattr(profile, "phone", None),
                city=getattr(profile, "city", None),
                country=getattr(profile, "country", None),
                timezone=getattr(profile, "timezone", None),
                risk_tolerance=getattr(risk, "risk_tolerance", None),
                calculated_score=getattr(risk, "calculated_score", None),
                investment_horizon=getattr(risk, "investment_horizon", None),
                total_goals=total_goals,
                total_active_goals=total_active_goals,
                recent_document_count=recent_document_count,
                last_topic=getattr(conversation, "last_topic", None),
                last_message=getattr(conversation, "last_message", None),
            )
