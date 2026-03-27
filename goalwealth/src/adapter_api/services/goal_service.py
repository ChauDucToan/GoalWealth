from __future__ import annotations

from datetime import date
from typing import Any

from persistence import GoalWealthPersistenceService
from persistence.service_models import GoalCreateInput

from ..schemas.auth import UserClaims
from ..schemas.profile import ALLOWED_GOAL_STATUSES, ALLOWED_GOAL_TYPES, GoalCreateRequest


class GoalService:
    def __init__(self, *, persistence_service: GoalWealthPersistenceService | None = None):
        self.persistence_service = persistence_service

    def _serialize_goal(self, goal: Any) -> dict[str, Any]:
        return {
            "goal_id": str(getattr(goal, "id", "")),
            "title": getattr(goal, "title", None),
            "goal_type": getattr(goal, "goal_type", None),
            "status": getattr(goal, "status", None),
            "priority": getattr(goal, "priority", None),
            "target_amount": float(goal.target_amount) if getattr(goal, "target_amount", None) is not None else None,
            "current_progress": float(goal.current_progress) if getattr(goal, "current_progress", None) is not None else None,
            "target_date": goal.target_date.isoformat() if getattr(goal, "target_date", None) is not None else None,
            "description": getattr(goal, "description", None),
            "created_at": getattr(goal, "created_at", None).isoformat() if getattr(goal, "created_at", None) is not None else None,
            "updated_at": getattr(goal, "updated_at", None).isoformat() if getattr(goal, "updated_at", None) is not None else None,
        }

    def list_goals(self, current_user: UserClaims | None, *, status: str | None = None) -> tuple[dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")
        if self.persistence_service is None:
            raise ValueError("Persistence is not configured")
        if status is not None and status not in ALLOWED_GOAL_STATUSES:
            raise ValueError("status is invalid")

        statuses = [status] if status is not None else None
        goals = self.persistence_service.list_goals_for_user(current_user.user_id, statuses=statuses)
        return {
            "user_id": current_user.user_id,
            "goals": [self._serialize_goal(goal) for goal in goals],
            "count": len(goals),
        }, []

    def create_goal(self, current_user: UserClaims | None, payload: GoalCreateRequest) -> tuple[dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")
        if self.persistence_service is None:
            raise ValueError("Persistence is not configured")
        if payload.goal_type not in ALLOWED_GOAL_TYPES:
            raise ValueError("goal_type is invalid")
        if payload.status not in ALLOWED_GOAL_STATUSES:
            raise ValueError("status is invalid")
        if payload.priority < 1 or payload.priority > 10:
            raise ValueError("priority is invalid")
        if payload.target_amount is not None and payload.target_amount < 0:
            raise ValueError("target_amount must be non-negative")
        if payload.current_progress < 0:
            raise ValueError("current_progress must be non-negative")

        parsed_target_date: date | None = None
        if payload.target_date:
            try:
                parsed_target_date = date.fromisoformat(payload.target_date)
            except ValueError as exc:
                raise ValueError("target_date must be ISO format YYYY-MM-DD") from exc

        created = self.persistence_service.create_goal(
            current_user.user_id,
            GoalCreateInput(
                title=payload.title,
                goal_type=payload.goal_type,
                status=payload.status,
                priority=payload.priority,
                target_amount=payload.target_amount,
                current_progress=payload.current_progress,
                target_date=parsed_target_date,
                description=payload.description,
            ),
        )
        return {
            "user_id": current_user.user_id,
            "goal": self._serialize_goal(created),
        }, []
