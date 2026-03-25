from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class OcrIngressRequest:
    raw_text: str


@dataclass(slots=True)
class OcrIngressAcceptedResponse:
    ocr_record_id: str
    status: str = "accepted"
    message: str = ""
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class OcrRecordResponse:
    ocr_record_id: str
    status: str
    warnings: list[str] = field(default_factory=list)
    data: dict[str, Any] = field(default_factory=dict)
