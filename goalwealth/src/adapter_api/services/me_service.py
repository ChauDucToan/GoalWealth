from __future__ import annotations

from typing import Any

from persistence import GoalWealthPersistenceService
from persistence.service_models import UserProfileUpsertInput

from ..schemas.auth import UserClaims
from ..schemas.profile import ALLOWED_ME_UPDATE_FIELDS, MeUpdateRequest


class MeService:
    def __init__(self, *, persistence_service: GoalWealthPersistenceService | None = None):
        self.persistence_service = persistence_service

    def update_me_profile(self, current_user: UserClaims | None, payload: MeUpdateRequest) -> tuple[dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")
        if self.persistence_service is None:
            raise ValueError("Persistence is not configured")

        updates = {
            "display_name": payload.display_name,
            "phone": payload.phone,
            "city": payload.city,
            "country_code": payload.country_code,
            "timezone": payload.timezone,
        }
        provided_fields = {key: value for key, value in updates.items() if value is not None}
        if not provided_fields:
            raise ValueError("At least one allowed profile field is required")

        unknown_fields = set(provided_fields.keys()) - ALLOWED_ME_UPDATE_FIELDS
        if unknown_fields:
            raise ValueError(f"Unsupported profile fields: {', '.join(sorted(unknown_fields))}")

        self.persistence_service.upsert_user_profile(
            current_user.user_id,
            UserProfileUpsertInput(
                full_name=payload.display_name,
                phone=payload.phone,
                city=payload.city,
                country=payload.country_code,
                timezone=payload.timezone,
            ),
        )
        return self.build_me_payload(current_user)

    def build_me_payload(self, current_user: UserClaims | None) -> tuple[dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")

        warnings: list[str] = []
        raw_claims = current_user.raw_claims or {}

        if self.persistence_service is None:
            warnings.append("Persistence is not configured; /v1/me is returning auth-derived fallback data only.")
            return (
                {
                    "user": {
                        "user_id": current_user.user_id,
                        "display_name": raw_claims.get("name") or raw_claims.get("given_name"),
                        "email": raw_claims.get("email"),
                        "phone": None,
                        "avatar_url": raw_claims.get("picture"),
                        "timezone": "Asia/Ho_Chi_Minh",
                        "locale": "vi-VN",
                        "location": {
                            "city": None,
                            "country": None,
                        },
                    },
                    "onboarding": {
                        "completed": False,
                        "status": "not_started",
                    },
                    "summary": {
                        "total_active_goals": 0,
                        "total_goals": 0,
                        "risk_tolerance": None,
                        "recent_document_count": 0,
                    },
                },
                warnings,
            )

        snapshot = self.persistence_service.build_user_bootstrap_snapshot(current_user.user_id)
        return (
            {
                "user": {
                    "user_id": str(snapshot.user_id),
                    "display_name": snapshot.full_name,
                    "email": snapshot.email,
                    "phone": snapshot.phone,
                    "avatar_url": raw_claims.get("picture"),
                    "timezone": snapshot.timezone,
                    "locale": "vi-VN",
                    "location": {
                        "city": snapshot.city,
                        "country": snapshot.country,
                    },
                },
                "onboarding": {
                    "completed": False,
                    "status": "not_started",
                },
                "summary": {
                    "total_active_goals": snapshot.total_active_goals,
                    "total_goals": snapshot.total_goals,
                    "risk_tolerance": snapshot.risk_tolerance,
                    "recent_document_count": snapshot.recent_document_count,
                },
                "conversation": {
                    "last_topic": snapshot.last_topic,
                    "last_message": snapshot.last_message,
                },
            },
            warnings,
        )
