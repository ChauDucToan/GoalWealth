from __future__ import annotations

from typing import Any

try:
    from pydantic import BaseModel, Field
except ImportError:  # pragma: no cover - optional dependency path
    PYDANTIC_AVAILABLE = False
    BaseModel = object  # type: ignore[assignment]
    Field = None  # type: ignore[assignment]
else:
    PYDANTIC_AVAILABLE = True


if PYDANTIC_AVAILABLE:

    class ErrorBodyModel(BaseModel):
        code: str
        message: str
        details: dict[str, Any] = {}


    class ApiEnvelopeModel(BaseModel):
        ok: bool
        data: Any | None = None
        error: ErrorBodyModel | None = None
        meta: dict[str, Any] = {}
        warnings: list[str] = []


    class ChatRespondRequestModel(BaseModel):
        message: str = Field(..., min_length=1)
        session_id: str | None = None
        locale: str | None = None
        timezone: str | None = None
        attachments: list[str] = []


    class OcrIngressRequestModel(BaseModel):
        raw_text: str = Field(..., min_length=1)


    class MeUpdateRequestModel(BaseModel):
        display_name: str | None = Field(default=None, min_length=1)
        phone: str | None = None
        city: str | None = None
        country_code: str | None = Field(default=None, min_length=2, max_length=2)
        timezone: str | None = None


    class RiskProfileUpsertRequestModel(BaseModel):
        risk_tolerance: str | None = None
        investment_horizon: str | None = None
        knowledge_level: str | None = None
        liquidity_needs: str | None = None
        calculated_score: float | None = None
        max_loss: float | None = None
        min_return: float | None = None
        notes: str | None = None


    class GoalCreateRequestModel(BaseModel):
        title: str = Field(..., min_length=1)
        goal_type: str = Field(..., min_length=1)
        status: str = "active"
        priority: int = Field(default=5, ge=1, le=10)
        target_amount: float | None = Field(default=None, ge=0)
        current_progress: float = Field(default=0, ge=0)
        target_date: str | None = None
        description: str | None = None
