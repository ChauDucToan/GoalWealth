from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class ErrorResponse:
    error_code: str
    message: str
    details: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class HealthResponse:
    status: str
    service: str


@dataclass(slots=True)
class RequestMeta:
    request_id: str | None = None
    user_id: str | None = None


@dataclass(slots=True)
class ApiEnvelope:
    ok: bool
    data: Any = None
    error: dict[str, Any] | None = None
    meta: dict[str, Any] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)
