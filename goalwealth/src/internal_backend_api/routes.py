from __future__ import annotations

from typing import Any, Iterable

from persistence import GoalWealthPersistenceService

from .auth import ensure_internal_auth
from .config import InternalBackendApiConfig
from .errors import ApiHttpError
from .services.memory_stub_service import build_memory_service_view
from .services.ocr_stub_service import build_openclaw_view
from .services.persistence_views import build_memory_service_view_from_persistence, build_openclaw_view_from_persistence
from .services.smart_agent_stub_service import build_smart_agent_response



def _state_config(request: Any | None) -> InternalBackendApiConfig:
    state = getattr(getattr(request, "app", None), "state", None)
    config = getattr(state, "config", None)
    return config if isinstance(config, InternalBackendApiConfig) else InternalBackendApiConfig.from_env()



def _state_persistence(request: Any | None) -> GoalWealthPersistenceService | None:
    state = getattr(getattr(request, "app", None), "state", None)
    persistence_service = getattr(state, "persistence_service", None)
    return persistence_service if isinstance(persistence_service, GoalWealthPersistenceService) else None



def _parse_sections(include_sections: str | Iterable[str] | None) -> list[str] | None:
    if include_sections is None:
        return None
    if isinstance(include_sections, str):
        parts = [item.strip() for item in include_sections.split(",") if item.strip()]
        return parts or None
    parts = [str(item).strip() for item in include_sections if str(item).strip()]
    return parts or None



def root(request: Any = None) -> dict[str, Any]:
    config = _state_config(request)
    return {
        "service": config.service_name,
        "version": config.version,
        "environment": config.environment,
        "docs_enabled": config.enable_docs,
        "mode": "internal_stub",
    }



def health(request: Any = None) -> dict[str, Any]:
    config = _state_config(request)
    return {
        "status": "ok",
        "service": config.service_name,
        "version": config.version,
        "environment": config.environment,
    }



def ready(request: Any = None) -> dict[str, Any]:
    config = _state_config(request)
    persistence_service = _state_persistence(request)
    return {
        "status": "ready",
        "service": config.service_name,
        "checks": {
            "config_loaded": True,
            "smart_agent_mode_known": bool(config.smart_agent_mode),
            "internal_auth_mode_known": True,
            "persistence_configured": persistence_service is not None,
        },
        "runtime": config.public_runtime_summary(),
    }



def get_memory_user_view(
    userId: str,
    includeSections: str | None = None,
    ocrSummaryLimit: int | None = None,
    request: Any = None,
) -> dict[str, Any]:
    config = _state_config(request)
    ensure_internal_auth(request, config)
    persistence_service = _state_persistence(request)
    selected_sections = _parse_sections(includeSections)
    if persistence_service is not None:
        persisted_view = build_memory_service_view_from_persistence(
            persistence_service,
            userId,
            include_sections=selected_sections,
            ocr_summary_limit=ocrSummaryLimit,
        )
        if persisted_view is not None:
            return persisted_view
    return build_memory_service_view(
        userId,
        include_sections=selected_sections,
        ocr_summary_limit=ocrSummaryLimit,
    )



def get_ocr_openclaw_view(
    ocrRecordId: str,
    userId: str | None = None,
    request: Any = None,
) -> dict[str, Any]:
    config = _state_config(request)
    ensure_internal_auth(request, config)
    if not userId or not str(userId).strip():
        raise ApiHttpError(400, "INVALID_REQUEST", "userId query parameter is required")
    cleaned_user_id = str(userId).strip()
    persistence_service = _state_persistence(request)
    if persistence_service is not None:
        persisted_view = build_openclaw_view_from_persistence(
            persistence_service,
            ocrRecordId,
            user_reference=cleaned_user_id,
        )
        if persisted_view is not None:
            return persisted_view
    return build_openclaw_view(ocrRecordId, user_id=cleaned_user_id)



def post_smart_agent_query(request: Any = None, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    config = _state_config(request)
    ensure_internal_auth(request, config)
    payload = payload or {}
    query = str(payload.get("query") or "").strip()
    if not query:
        raise ApiHttpError(400, "INVALID_REQUEST", "query is required")
    return build_smart_agent_response(
        query,
        config=config,
        user_id=(str(payload.get("user_id")).strip() or None) if payload.get("user_id") is not None else None,
        top_k=int(payload["top_k"]) if payload.get("top_k") is not None else None,
        categories=payload.get("categories") or None,
        freshness_threshold_minutes=(
            int(payload["freshness_threshold_minutes"])
            if payload.get("freshness_threshold_minutes") is not None
            else None
        ),
        locale=(str(payload.get("locale")).strip() or None) if payload.get("locale") is not None else None,
        timezone=(str(payload.get("timezone")).strip() or None) if payload.get("timezone") is not None else None,
        trace_id=(str(payload.get("trace_id")).strip() or None) if payload.get("trace_id") is not None else None,
        caller=(str(payload.get("caller")).strip() or "openclaw_orchestrator"),
    )
