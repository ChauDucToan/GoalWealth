from __future__ import annotations

from typing import Any

from persistence import GoalWealthPersistenceService
from persistence.service_models import RiskProfileUpsertInput

from ..schemas.auth import UserClaims
from ..schemas.profile import (
    ALLOWED_INVESTMENT_HORIZON,
    ALLOWED_KNOWLEDGE_LEVEL,
    ALLOWED_LIQUIDITY_NEEDS,
    ALLOWED_RISK_TOLERANCE,
    RiskProfileUpsertRequest,
)


class RiskProfileService:
    def __init__(self, *, persistence_service: GoalWealthPersistenceService | None = None):
        self.persistence_service = persistence_service

    def _build_payload(self, current_user: UserClaims) -> dict[str, Any]:
        if self.persistence_service is None:
            return {
                "user_id": current_user.user_id,
                "risk_profile": {},
                "source": "fallback",
            }

        profile = self.persistence_service.get_risk_profile(current_user.user_id)
        return {
            "user_id": current_user.user_id,
            "risk_profile": {
                "risk_tolerance": getattr(profile, "risk_tolerance", None),
                "calculated_score": float(profile.calculated_score) if getattr(profile, "calculated_score", None) is not None else None,
                "investment_horizon": getattr(profile, "investment_horizon", None),
                "knowledge_level": getattr(profile, "knowledge_level", None),
                "liquidity_needs": getattr(profile, "liquidity_needs", None),
                "max_loss": float(profile.max_loss) if getattr(profile, "max_loss", None) is not None else None,
                "min_return": float(profile.min_return) if getattr(profile, "min_return", None) is not None else None,
            },
            "source": "persistence",
        }

    def get_risk_profile(self, current_user: UserClaims | None) -> tuple[dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")
        warnings: list[str] = []
        if self.persistence_service is None:
            warnings.append("Persistence is not configured; risk profile is returning fallback data only.")
        return self._build_payload(current_user), warnings

    def put_risk_profile(self, current_user: UserClaims | None, payload: RiskProfileUpsertRequest) -> tuple[dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")
        if self.persistence_service is None:
            raise ValueError("Persistence is not configured")

        if payload.risk_tolerance is not None and payload.risk_tolerance not in ALLOWED_RISK_TOLERANCE:
            raise ValueError("risk_tolerance is invalid")
        if payload.investment_horizon is not None and payload.investment_horizon not in ALLOWED_INVESTMENT_HORIZON:
            raise ValueError("investment_horizon is invalid")
        if payload.knowledge_level is not None and payload.knowledge_level not in ALLOWED_KNOWLEDGE_LEVEL:
            raise ValueError("knowledge_level is invalid")
        if payload.liquidity_needs is not None and payload.liquidity_needs not in ALLOWED_LIQUIDITY_NEEDS:
            raise ValueError("liquidity_needs is invalid")

        self.persistence_service.upsert_risk_profile(
            current_user.user_id,
            RiskProfileUpsertInput(
                risk_tolerance=payload.risk_tolerance,
                calculated_score=payload.calculated_score,
                investment_horizon=payload.investment_horizon,
                knowledge_level=payload.knowledge_level,
                liquidity_needs=payload.liquidity_needs,
                max_loss=payload.max_loss,
                min_return=payload.min_return,
            ),
        )
        return self._build_payload(current_user), []
