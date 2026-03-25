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
