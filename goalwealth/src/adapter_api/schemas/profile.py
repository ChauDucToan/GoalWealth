from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class MeUpdateRequest:
    display_name: str | None = None
    phone: str | None = None
    city: str | None = None
    country_code: str | None = None
    timezone: str | None = None


@dataclass(slots=True)
class RiskProfileUpsertRequest:
    risk_tolerance: str | None = None
    investment_horizon: str | None = None
    knowledge_level: str | None = None
    liquidity_needs: str | None = None
    calculated_score: float | None = None
    max_loss: float | None = None
    min_return: float | None = None
    notes: str | None = None


ALLOWED_ME_UPDATE_FIELDS = {
    "display_name",
    "phone",
    "city",
    "country_code",
    "timezone",
}

ALLOWED_RISK_TOLERANCE = {"conservative", "moderate", "balanced", "growth", "aggressive"}
ALLOWED_INVESTMENT_HORIZON = {"short_term", "medium_term", "long_term"}
ALLOWED_KNOWLEDGE_LEVEL = {"beginner", "intermediate", "advanced", "expert"}
ALLOWED_LIQUIDITY_NEEDS = {"high", "medium", "low"}
ALLOWED_GOAL_TYPES = {
    "savings_goal",
    "debt_payoff_goal",
    "investment_goal",
    "retirement_goal",
    "emergency_fund_goal",
    "wealth_building_goal",
}
ALLOWED_GOAL_STATUSES = {"active", "completed", "paused", "archived"}


@dataclass(slots=True)
class GoalCreateRequest:
    title: str
    goal_type: str
    status: str = "active"
    priority: int = 5
    target_amount: float | None = None
    current_progress: float = 0
    target_date: str | None = None
    description: str | None = None


@dataclass(slots=True)
class GoalUpdateRequest:
    title: str | None = None
    goal_type: str | None = None
    status: str | None = None
    priority: int | None = None
    target_amount: float | None = None
    current_progress: float | None = None
    target_date: str | None = None
    description: str | None = None
