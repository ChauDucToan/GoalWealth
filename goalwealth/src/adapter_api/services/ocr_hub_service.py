from __future__ import annotations

from typing import Any

from persistence import GoalWealthPersistenceService

from ..schemas.auth import UserClaims

ALLOWED_OCR_DOCUMENT_TYPES = {
    "receipt",
    "bank_statement",
    "salary_slip",
    "investment_statement",
    "insurance_document",
    "unknown",
}

ALLOWED_OCR_INGEST_STATUSES = {"pending_backend", "pending_user_context", "ready", "failed"}
ALLOWED_OCR_PARSE_STATUSES = {"processed", "needs_review", "validation_failed", "rejected"}


class OcrHubService:
    def __init__(self, *, persistence_service: GoalWealthPersistenceService | None = None):
        self.persistence_service = persistence_service

    def _serialize_record(self, record: Any) -> dict[str, Any]:
        return {
            "ocr_record_id": getattr(record, "ocr_record_id", None),
            "document_type": getattr(record, "document_type", None),
            "ingest_status": getattr(record, "ingest_status", None),
            "parse_status": getattr(record, "parse_status", None),
            "language": getattr(record, "language", None),
            "file_name": getattr(record, "file_name", None),
            "mime_type": getattr(record, "mime_type", None),
            "institution_name": getattr(record, "institution_name", None),
            "summary_text": getattr(record, "summary_text", None),
            "is_usable": getattr(record, "is_usable", None),
            "overall_confidence": float(record.overall_confidence) if getattr(record, "overall_confidence", None) is not None else None,
            "normalization_confidence": float(record.normalization_confidence) if getattr(record, "normalization_confidence", None) is not None else None,
            "manual_review_required": getattr(record, "manual_review_required", None),
            "auto_apply_allowed": getattr(record, "auto_apply_allowed", None),
            "created_at": getattr(record, "created_at", None).isoformat() if getattr(record, "created_at", None) is not None else None,
            "updated_at": getattr(record, "updated_at", None).isoformat() if getattr(record, "updated_at", None) is not None else None,
        }

    def list_records(
        self,
        current_user: UserClaims | None,
        *,
        document_type: str | None = None,
        ingest_status: str | None = None,
        parse_status: str | None = None,
        limit: int = 10,
    ) -> tuple[dict[str, Any], list[str]]:
        if current_user is None:
            raise ValueError("Authentication is required")
        if self.persistence_service is None:
            raise ValueError("Persistence is not configured")
        if document_type is not None and document_type not in ALLOWED_OCR_DOCUMENT_TYPES:
            raise ValueError("document_type is invalid")
        if ingest_status is not None and ingest_status not in ALLOWED_OCR_INGEST_STATUSES:
            raise ValueError("ingest_status is invalid")
        if parse_status is not None and parse_status not in ALLOWED_OCR_PARSE_STATUSES:
            raise ValueError("parse_status is invalid")

        normalized_limit = max(1, min(limit, 50))
        records = self.persistence_service.list_recent_ocr_for_user(current_user.user_id, limit=normalized_limit)
        if document_type is not None:
            records = [record for record in records if getattr(record, "document_type", None) == document_type]
        if ingest_status is not None:
            records = [record for record in records if getattr(record, "ingest_status", None) == ingest_status]
        if parse_status is not None:
            records = [record for record in records if getattr(record, "parse_status", None) == parse_status]

        items = [self._serialize_record(record) for record in records[:normalized_limit]]
        return {
            "user_id": current_user.user_id,
            "count": len(items),
            "filters": {
                "document_type": document_type,
                "ingest_status": ingest_status,
                "parse_status": parse_status,
                "limit": normalized_limit,
            },
            "records": items,
        }, []
