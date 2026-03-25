from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone
from typing import Iterable

from ..config import InternalBackendApiConfig

FRESH_KEYWORDS = {"mới", "mới nhất", "hôm nay", "breaking", "latest", "recent", "fresh"}
SEMANTIC_KEYWORDS = {"phân tích", "so sánh", "giải thích", "search", "semantic", "liên quan"}



def _now() -> datetime:
    return datetime.now(timezone.utc)



def _iso(dt: datetime) -> str:
    return dt.replace(microsecond=0).isoformat().replace("+00:00", "Z")



def _seed(value: str) -> int:
    return int(hashlib.sha256(value.encode("utf-8")).hexdigest()[:8], 16)



def classify_route(query: str) -> str:
    lowered = query.lower()
    wants_fresh = any(keyword in lowered for keyword in FRESH_KEYWORDS)
    wants_semantic = any(keyword in lowered for keyword in SEMANTIC_KEYWORDS)
    if wants_fresh and wants_semantic:
        return "hybrid_search"
    if wants_fresh:
        return "fresh_news"
    return "semantic_search"



def _build_results(query: str, *, route: str, top_k: int, config: InternalBackendApiConfig) -> list[dict]:
    seed = _seed(f"{route}:{query}")
    now = _now()
    topic = query.strip()[:64]
    results = []
    for index in range(max(1, min(top_k, 5))):
        hours_ago = index * 6 if route != "fresh_news" else index * 2
        published_at = now - timedelta(hours=hours_ago)
        base_score = 0.92 - (index * 0.08)
        freshness_score = max(0.2, 0.98 - (index * 0.15))
        source = ["CafeF", "VNExpress", "Bloomberg", "Reuters", "CafeBiz"][index % 5]
        slug = topic.replace(" ", "-").replace("/", "-").lower() or "market"
        results.append(
            {
                "id": f"stub-{route}-{seed % 100000}-{index}",
                "type": "article",
                "title": f"{topic.title() or 'Market update'} - insight {index + 1}",
                "url": f"{config.news_base_url.rstrip('/')}/{slug}-{index + 1}",
                "source": source,
                "published_at": _iso(published_at),
                "summary": (
                    f"Stub {route} result for query '{query}'. "
                    f"This item is meant to unblock end-to-end orchestration and UI integration on AWS."
                ),
                "score": round(base_score, 4),
                "freshness_score": round(freshness_score, 4),
            }
        )
    return results



def build_smart_agent_response(
    query: str,
    *,
    config: InternalBackendApiConfig,
    user_id: str | None = None,
    top_k: int | None = None,
    categories: Iterable[str] | None = None,
    freshness_threshold_minutes: int | None = None,
    locale: str | None = None,
    timezone: str | None = None,
    trace_id: str | None = None,
    caller: str = "openclaw_orchestrator",
) -> dict:
    cleaned_query = query.strip()
    route = classify_route(cleaned_query)
    effective_top_k = max(1, min(top_k or 5, 10))
    results = _build_results(cleaned_query, route=route, top_k=effective_top_k, config=config)
    freshness = "fresh" if route == "fresh_news" else "mixed" if route == "hybrid_search" else "unknown"
    if not results:
        freshness = "empty"

    categories_list = [str(item) for item in (categories or []) if str(item).strip()]
    effective_trace_id = trace_id or f"stub-trace-{_seed(cleaned_query) % 1000000}"
    summary = (
        f"Smart Agent stub returned {len(results)} result(s) via {route}. "
        f"Caller={caller}, user_id={user_id or 'anonymous'}, locale={locale or config.default_locale}, timezone={timezone or config.default_timezone}."
    )
    if categories_list:
        summary += f" Categories={', '.join(categories_list)}."

    return {
        "status": "ok",
        "route": route,
        "results": results,
        "summary": summary,
        "meta": {
            "query": cleaned_query,
            "total_results": len(results),
            "freshness": freshness,
            "refresh_triggered": False,
            "took_ms": 15,
            "trace_id": effective_trace_id,
            "user_id": user_id,
            "categories": categories_list,
            "freshness_threshold_minutes": freshness_threshold_minutes or 180,
            "locale": locale or config.default_locale,
            "timezone": timezone or config.default_timezone,
            "caller": caller,
            "mode": config.smart_agent_mode,
        },
        "error": None,
    }
