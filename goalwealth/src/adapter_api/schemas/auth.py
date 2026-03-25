from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class UserClaims:
    user_id: str
    subject: str
    issuer: str | None = None
    audience: str | None = None
    scopes: list[str] = field(default_factory=list)
    raw_claims: dict[str, Any] = field(default_factory=dict)
