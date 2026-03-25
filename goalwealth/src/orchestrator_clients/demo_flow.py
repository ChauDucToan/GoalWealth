from __future__ import annotations

from typing import Any, Iterable

from .base import DEFAULT_ENV_PREFIX, ApiClientError, ApiRequestError
from .memory_client import MemoryClient
from .ocr_client import OcrClient
from .smart_agent_client import SmartAgentClient


def build_clients_from_env(*, prefix: str = DEFAULT_ENV_PREFIX) -> dict[str, Any]:
    return {
        "memory": MemoryClient.from_env(prefix=prefix),
        "ocr": OcrClient.from_env(prefix=prefix),
        "smart_agent": SmartAgentClient.from_env(prefix=prefix),
    }


def _success_result(data: dict[str, Any]) -> dict[str, Any]:
    return {
        "ok": True,
        "data": data,
        "error": None,
    }


def _error_result(exc: Exception) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "type": exc.__class__.__name__,
        "message": str(exc),
    }

    if isinstance(exc, ApiRequestError):
        payload["status_code"] = exc.status_code
        payload["payload"] = exc.payload
    elif isinstance(exc, ApiClientError):
        payload["payload"] = None

    return {
        "ok": False,
        "data": None,
        "error": payload,
    }


def safe_memory_view(
    user_id: str,
    *,
    include_sections: Iterable[str] | None = None,
    ocr_summary_limit: int | None = None,
    prefix: str = DEFAULT_ENV_PREFIX,
) -> dict[str, Any]:
    client = MemoryClient.from_env(prefix=prefix)
    try:
        result = client.get_user_view(
            user_id,
            include_sections=include_sections,
            ocr_summary_limit=ocr_summary_limit,
        )
        return _success_result(result)
    except (ApiClientError, ValueError) as exc:
        return _error_result(exc)


def safe_ocr_view(
    ocr_record_id: str,
    *,
    user_id: str,
    prefix: str = DEFAULT_ENV_PREFIX,
) -> dict[str, Any]:
    client = OcrClient.from_env(prefix=prefix)
    try:
        result = client.get_openclaw_view(ocr_record_id, user_id=user_id)
        return _success_result(result)
    except (ApiClientError, ValueError) as exc:
        return _error_result(exc)


def safe_smart_agent_query(
    query: str,
    *,
    user_id: str | None = None,
    top_k: int | None = None,
    categories: Iterable[str] | None = None,
    freshness_threshold_minutes: int | None = None,
    locale: str | None = None,
    timezone: str | None = None,
    trace_id: str | None = None,
    caller: str = "openclaw_orchestrator",
    prefix: str = DEFAULT_ENV_PREFIX,
) -> dict[str, Any]:
    client = SmartAgentClient.from_env(prefix=prefix)
    try:
        result = client.query(
            query,
            user_id=user_id,
            top_k=top_k,
            categories=categories,
            freshness_threshold_minutes=freshness_threshold_minutes,
            locale=locale,
            timezone=timezone,
            trace_id=trace_id,
            caller=caller,
        )
        return _success_result(result)
    except (ApiClientError, ValueError) as exc:
        return _error_result(exc)


def run_full_demo(
    *,
    user_id: str,
    query: str | None = None,
    ocr_record_id: str | None = None,
    include_sections: Iterable[str] | None = None,
    ocr_summary_limit: int | None = None,
    top_k: int | None = None,
    categories: Iterable[str] | None = None,
    freshness_threshold_minutes: int | None = None,
    locale: str | None = None,
    timezone: str | None = None,
    trace_id: str | None = None,
    caller: str = "openclaw_orchestrator",
    prefix: str = DEFAULT_ENV_PREFIX,
) -> dict[str, Any]:
    result: dict[str, Any] = {
        "meta": {
            "user_id": user_id,
            "query": query,
            "ocr_record_id": ocr_record_id,
            "env_prefix": prefix,
            "flow": [
                "memory_view",
                "ocr_view_if_provided",
                "smart_agent_if_query_provided",
            ],
        },
        "memory": safe_memory_view(
            user_id,
            include_sections=include_sections,
            ocr_summary_limit=ocr_summary_limit,
            prefix=prefix,
        ),
        "ocr": None,
        "smart_agent": None,
        "summary": {},
    }

    if ocr_record_id:
        result["ocr"] = safe_ocr_view(ocr_record_id, user_id=user_id, prefix=prefix)

    if query:
        result["smart_agent"] = safe_smart_agent_query(
            query,
            user_id=user_id,
            top_k=top_k,
            categories=categories,
            freshness_threshold_minutes=freshness_threshold_minutes,
            locale=locale,
            timezone=timezone,
            trace_id=trace_id,
            caller=caller,
            prefix=prefix,
        )

    result["summary"] = summarize_full_demo(result)
    return result


def summarize_full_demo(result: dict[str, Any]) -> dict[str, Any]:
    memory_ok = bool(result.get("memory", {}).get("ok"))
    ocr_block = result.get("ocr")
    smart_block = result.get("smart_agent")
    ocr_ok = True if ocr_block is None else bool(ocr_block.get("ok"))
    smart_ok = True if smart_block is None else bool(smart_block.get("ok"))

    summary = {
        "all_ok": memory_ok and ocr_ok and smart_ok,
        "memory_ok": memory_ok,
        "ocr_ok": ocr_ok,
        "smart_agent_ok": smart_ok,
        "next_step_hint": None,
    }

    if not memory_ok:
        summary["next_step_hint"] = "Fix memory service connectivity/auth first."
        return summary
    if ocr_block is not None and not ocr_ok:
        summary["next_step_hint"] = "Check OCR record existence/readiness or user_id scoping."
        return summary
    if smart_block is not None and not smart_ok:
        summary["next_step_hint"] = "Check Smart Agent endpoint payload/auth/runtime next."
        return summary

    summary["next_step_hint"] = "Core orchestrator client flow looks healthy."
    return summary
