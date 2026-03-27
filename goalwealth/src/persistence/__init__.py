"""GoalWealth persistence draft package.

This package is a draft-only scaffold for the upcoming PostgreSQL-backed
storage layer. It is intentionally not wired into the running adapter yet.
"""

from .base import Base
from .bootstrap import build_optional_persistence_bundle, build_persistence_bundle
from .config import PersistenceConfig
from .models import (
    ConversationSummary,
    Goal,
    OcrRecord,
    RecommendationState,
    RiskProfile,
    User,
    UserIdentity,
    UserProfile,
)
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
    IdentityUpsertInput,
    OcrRecordCreateInput,
    ResolvedUser,
    RiskProfileUpsertInput,
    UserBootstrapSnapshot,
    UserProfileUpsertInput,
)
from .services import GoalWealthPersistenceService
from .session import build_engine, build_session_factory

__all__ = [
    "Base",
    "PersistenceConfig",
    "build_persistence_bundle",
    "build_optional_persistence_bundle",
    "User",
    "UserIdentity",
    "UserProfile",
    "RiskProfile",
    "Goal",
    "ConversationSummary",
    "OcrRecord",
    "RecommendationState",
    "UserRepository",
    "UserIdentityRepository",
    "UserProfileRepository",
    "RiskProfileRepository",
    "GoalRepository",
    "ConversationSummaryRepository",
    "OcrRecordRepository",
    "RecommendationStateRepository",
    "IdentityUpsertInput",
    "UserProfileUpsertInput",
    "RiskProfileUpsertInput",
    "GoalCreateInput",
    "ConversationSummaryUpsertInput",
    "OcrRecordCreateInput",
    "ResolvedUser",
    "UserBootstrapSnapshot",
    "GoalWealthPersistenceService",
    "build_engine",
    "build_session_factory",
]
