from __future__ import annotations

from typing import Any

from persistence import GoalWealthPersistenceService

from ..schemas.auth import UserClaims


class SummaryService:
    def __init__(self, *, persistence_service: GoalWealthPersistenceService | None = None):
        self.persistence_service = persistence_service

    def build_summary_payload(self, current_user: UserClaims | None) -> tuple[dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")

        raw_claims = current_user.raw_claims or {}
        warnings: list[str] = []

        if self.persistence_service is None:
            warnings.append("Persistence is not configured; /v1/summary is returning auth-derived fallback data only.")
            return {
                "user": {
                    "user_id": current_user.user_id,
                    "display_name": raw_claims.get("name") or raw_claims.get("given_name"),
                    "email": raw_claims.get("email"),
                    "phone": None,
                    "timezone": "Asia/Ho_Chi_Minh",
                    "locale": "vi-VN",
                    "location": {
                        "city": None,
                        "country": None,
                    },
                },
                "risk_profile": {
                    "risk_tolerance": None,
                    "calculated_score": None,
                    "investment_horizon": None,
                },
                "goals": {
                    "total_goals": 0,
                    "total_active_goals": 0,
                    "recent_goals": [],
                },
                "documents": {
                    "recent_document_count": 0,
                },
                "conversation": {
                    "last_topic": None,
                    "last_message": None,
                },
            }, warnings

        snapshot = self.persistence_service.build_user_bootstrap_snapshot(current_user.user_id)
        recent_goals = self.persistence_service.list_goals_for_user(current_user.user_id)[:3]
        risk_profile = self.persistence_service.get_risk_profile(current_user.user_id)

        return {
            "user": {
                "user_id": str(snapshot.user_id),
                "display_name": snapshot.full_name,
                "email": snapshot.email,
                "phone": snapshot.phone,
                "timezone": snapshot.timezone,
                "locale": "vi-VN",
                "location": {
                    "city": snapshot.city,
                    "country": snapshot.country,
                },
            },
            "risk_profile": {
                "risk_tolerance": getattr(risk_profile, "risk_tolerance", None),
                "calculated_score": float(risk_profile.calculated_score) if getattr(risk_profile, "calculated_score", None) is not None else None,
                "investment_horizon": getattr(risk_profile, "investment_horizon", None),
                "knowledge_level": getattr(risk_profile, "knowledge_level", None),
                "liquidity_needs": getattr(risk_profile, "liquidity_needs", None),
                "max_loss": float(risk_profile.max_loss) if getattr(risk_profile, "max_loss", None) is not None else None,
                "min_return": float(risk_profile.min_return) if getattr(risk_profile, "min_return", None) is not None else None,
            },
            "goals": {
                "total_goals": snapshot.total_goals,
                "total_active_goals": snapshot.total_active_goals,
                "recent_goals": [
                    {
                        "goal_id": str(getattr(goal, "id", "")),
                        "title": getattr(goal, "title", None),
                        "goal_type": getattr(goal, "goal_type", None),
                        "status": getattr(goal, "status", None),
                        "priority": getattr(goal, "priority", None),
                        "target_amount": float(goal.target_amount) if getattr(goal, "target_amount", None) is not None else None,
                        "current_progress": float(goal.current_progress) if getattr(goal, "current_progress", None) is not None else None,
                        "target_date": goal.target_date.isoformat() if getattr(goal, "target_date", None) is not None else None,
                    }
                    for goal in recent_goals
                ],
            },
            "documents": {
                "recent_document_count": snapshot.recent_document_count,
            },
            "conversation": {
                "last_topic": snapshot.last_topic,
                "last_message": snapshot.last_message,
            },
        }, warnings
