from __future__ import annotations

from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any, Iterable
from uuid import UUID

from persistence import GoalWealthPersistenceService

from ..errors import ApiHttpError

ALLOWED_SECTIONS = {
    "user_profile",
    "goals",
    "risk_profile",
    "ocr_summaries",
    "conversation_summary",
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: datetime | None) -> str | None:
    if value is None:
        return None
    return value.replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _date_iso(value: date | None) -> str | None:
    return value.isoformat() if value is not None else None


def _native(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, datetime):
        return _iso(value)
    if isinstance(value, date):
        return _date_iso(value)
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, dict):
        return {str(k): _native(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_native(item) for item in value]
    return value


def _normalize_sections(include_sections: Iterable[str] | None) -> set[str] | None:
    if include_sections is None:
        return None
    normalized = {str(item).strip() for item in include_sections if str(item).strip()}
    filtered = {item for item in normalized if item in ALLOWED_SECTIONS}
    return filtered or None


def _empty_goals() -> dict[str, Any]:
    return {
        "total_active_goals": 0,
        "total_goals": 0,
        "active_goals": [],
        "completed_goals": [],
        "paused_goals": [],
        "archived_goals": [],
    }


def _empty_ocr_summaries() -> dict[str, Any]:
    return {
        "total_summaries": 0,
        "recent_summaries": [],
        "by_type": {},
    }


def _empty_conversation_summary(now: datetime) -> dict[str, Any]:
    return {
        "last_turn_date": _iso(now),
        "total_turns": 0,
        "last_topic": "goal_alignment",
        "user_intent": "financial_planning",
        "last_message": "No conversation summary available yet.",
        "context_needs": [],
        "pending_actions": [],
    }


def _goal_to_payload(goal: Any) -> dict[str, Any]:
    return {
        "goal_id": str(goal.id),
        "title": goal.title,
        "type": goal.goal_type,
        "status": goal.status,
        "priority": goal.priority,
        "target_amount": _native(goal.target_amount),
        "current_progress": _native(goal.current_progress),
        "target_date": _date_iso(goal.target_date),
        "description": goal.description,
        "created_at": _iso(goal.created_at),
        "updated_at": _iso(goal.updated_at),
        "milestones": [],
    }


def build_memory_service_view_from_persistence(
    persistence_service: GoalWealthPersistenceService,
    user_reference: str,
    *,
    include_sections: Iterable[str] | None = None,
    ocr_summary_limit: int | None = None,
) -> dict[str, Any] | None:
    resolved_user_id = persistence_service.resolve_existing_user_id(user_reference)
    if resolved_user_id is None:
        return None

    now = _now()
    selected_sections = _normalize_sections(include_sections)
    profile = persistence_service.get_user_profile(resolved_user_id)
    risk = persistence_service.get_risk_profile(resolved_user_id)
    conversation = persistence_service.get_conversation_summary(resolved_user_id)
    goals = persistence_service.list_goals_for_user(resolved_user_id)
    recent_ocr = persistence_service.list_recent_ocr_for_user(
        resolved_user_id,
        limit=max(1, min(ocr_summary_limit or 3, 10)),
    )
    ocr_by_type = persistence_service.count_ocr_by_document_type_for_user(resolved_user_id)

    grouped_goals = {
        "active": [],
        "completed": [],
        "paused": [],
        "archived": [],
    }
    for goal in goals:
        grouped_goals.setdefault(goal.status, []).append(_goal_to_payload(goal))

    ocr_recent_payload = []
    for record in recent_ocr:
        ocr_recent_payload.append(
            {
                "ocr_record_id": record.ocr_record_id,
                "document_type": record.document_type,
                "summary_text": record.summary_text,
                "usable": record.is_usable,
                "overall_confidence": _native(record.overall_confidence),
                "document_date": _date_iso(record.issued_date),
                "amount_involved": None,
                "institution_name": record.institution_name,
                "created_at": _iso(record.created_at),
                "related_goal_ids": [],
            }
        )

    full_view = {
        "schema_version": "1.0.0",
        "user_id": str(resolved_user_id),
        "user_profile": {
            "full_name": getattr(profile, "full_name", None),
            "email": getattr(profile, "email", None),
            "phone": getattr(profile, "phone", None),
            "location": {
                "city": getattr(profile, "city", None),
                "country": getattr(profile, "country", None),
                "timezone": getattr(profile, "timezone", None) or "Asia/Ho_Chi_Minh",
            },
            "created_at": _iso(getattr(profile, "created_at", None)),
            "updated_at": _iso(getattr(profile, "updated_at", None)),
        },
        "goals": {
            "total_active_goals": len(grouped_goals.get("active", [])),
            "total_goals": len(goals),
            "active_goals": grouped_goals.get("active", []),
            "completed_goals": grouped_goals.get("completed", []),
            "paused_goals": grouped_goals.get("paused", []),
            "archived_goals": grouped_goals.get("archived", []),
        },
        "risk_profile": {
            "risk_tolerance": getattr(risk, "risk_tolerance", None),
            "calculated_score": _native(getattr(risk, "calculated_score", None)),
            "investment_horizon": getattr(risk, "investment_horizon", None),
            "knowledge_level": getattr(risk, "knowledge_level", None),
            "liquidity_needs": getattr(risk, "liquidity_needs", None),
            "created_at": _iso(getattr(risk, "created_at", None)),
            "updated_at": _iso(getattr(risk, "updated_at", None)),
            "constraints": {
                "max_loss": _native(getattr(risk, "max_loss", None)),
                "min_return": _native(getattr(risk, "min_return", None)),
                "sector_exclusions": [],
                "asset_class_limits": {},
            },
        },
        "ocr_summaries": {
            "total_summaries": sum(ocr_by_type.values()),
            "recent_summaries": ocr_recent_payload,
            "by_type": ocr_by_type,
        },
        "conversation_summary": {
            "last_turn_date": _iso(getattr(conversation, "last_turn_date", None)) or _iso(now),
            "total_turns": getattr(conversation, "total_turns", 0) or 0,
            "last_topic": getattr(conversation, "last_topic", None) or "goal_alignment",
            "user_intent": getattr(conversation, "user_intent", None) or "financial_planning",
            "last_message": getattr(conversation, "last_message", None) or "No conversation summary available yet.",
            "context_needs": [],
            "pending_actions": [],
        },
        "last_updated": _iso(now),
    }

    if selected_sections is None:
        return full_view

    view = dict(full_view)
    if "user_profile" not in selected_sections:
        view["user_profile"] = {}
    if "goals" not in selected_sections:
        view["goals"] = _empty_goals()
    if "risk_profile" not in selected_sections:
        view["risk_profile"] = {}
    if "ocr_summaries" not in selected_sections:
        view["ocr_summaries"] = _empty_ocr_summaries()
    if "conversation_summary" not in selected_sections:
        view["conversation_summary"] = _empty_conversation_summary(now)
    return view


def build_openclaw_view_from_persistence(
    persistence_service: GoalWealthPersistenceService,
    ocr_record_id: str,
    *,
    user_reference: str,
) -> dict[str, Any] | None:
    resolved_user_id = persistence_service.resolve_existing_user_id(user_reference)
    if resolved_user_id is None:
        return None

    record = persistence_service.get_ocr_record(resolved_user_id, ocr_record_id)
    if record is None:
        return None

    if record.ingest_status in {"pending_backend", "pending_user_context"}:
        raise ApiHttpError(
            409,
            "OCR_RECORD_NOT_READY",
            f"OCR record is not ready for OpenClaw yet: {ocr_record_id}",
            details={
                "status": record.ingest_status,
                "retryable": True,
            },
        )

    status = record.parse_status
    if not status:
        status = "validation_failed" if record.ingest_status == "failed" else "processed"

    validation_payload = record.validation_jsonb if isinstance(record.validation_jsonb, dict) else {}
    orchestration_hint = (
        record.orchestration_hint_jsonb
        if isinstance(record.orchestration_hint_jsonb, dict)
        else {}
    )

    return {
        "schema_version": "1.0.0",
        "ocr_record_id": record.ocr_record_id,
        "user_id": str(resolved_user_id),
        "document_type": record.document_type,
        "status": status,
        "summary_text": record.summary_text,
        "usable": record.is_usable,
        "overall_confidence": _native(record.overall_confidence),
        "manual_review_required": record.manual_review_required,
        "auto_apply_allowed": record.auto_apply_allowed,
        "warnings": _native(validation_payload.get("warnings", [])),
        "missing_fields": _native(validation_payload.get("missing_fields", [])),
        "facts": _native(record.normalized_data_jsonb if isinstance(record.normalized_data_jsonb, dict) else {}),
        "orchestration_hint": _native(orchestration_hint),
        "created_at": _iso(record.created_at),
        "updated_at": _iso(record.updated_at),
    }
