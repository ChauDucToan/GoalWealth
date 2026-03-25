from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class ApiHttpError(RuntimeError):
    status_code: int
    error_code: str
    message: str
    details: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        super().__init__(self.message)

    def to_payload(self) -> dict[str, Any]:
        payload = {
            "error_code": self.error_code,
            "message": self.message,
        }
        if self.details:
            payload["details"] = self.details
        return payload
