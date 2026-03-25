from __future__ import annotations

import json
import logging
import os
import time
from datetime import datetime, timezone
from typing import Any

import boto3

from shared.bedrock_embeddings import embed_text
from shared.normalization import normalize_text
from shared.opensearch_store import OpenSearchStore

logger = logging.getLogger()
logger.setLevel(logging.INFO)

FRESH_KEYWORDS = {
    "mới",
    "mới nhất",
    "hôm nay",
    "sáng nay",
    "breaking",
    "latest",
    "recent",
    "vừa đăng",
}

SEMANTIC_KEYWORDS = {
    "tìm",
    "search",
    "liên quan",
    "semantic",
    "phân tích",
    "so sánh",
    "giải thích",
}

RECENCY_THRESHOLD_MINUTES = int(os.environ.get("RECENCY_THRESHOLD_MINUTES", "180"))
DEFAULT_RESULT_LIMIT = int(os.environ.get("DEFAULT_RESULT_LIMIT", "10"))
REFRESH_MAX_FEEDS = int(os.environ.get("REFRESH_MAX_FEEDS", "5"))
REFRESH_COOLDOWN_SECONDS = int(os.environ.get("REFRESH_COOLDOWN_SECONDS", "300"))
BEDROCK_EMBEDDING_DIMENSIONS = int(os.environ.get("BEDROCK_EMBEDDING_DIMENSIONS", "1024"))
CRAWLER_FUNCTION_NAME = os.environ["CRAWLER_FUNCTION_NAME"]
SMART_AGENT_MODEL_MODE = os.environ.get("SMART_AGENT_MODEL_MODE", "rule_based")

store = OpenSearchStore()
lambda_client = boto3.client("lambda")
RECENT_REFRESHES: dict[str, float] = {}


def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    started = time.time()
    query = str(event.get("query") or "").strip()
    if not query:
        return error_response("semantic_search", "EMPTY_QUERY", "Query is required", started, query)

    route = classify_route(query)

    try:
        ensure_search_ready()
        results = fetch_results(query, route)
        freshness = infer_freshness(results)
        refresh_triggered = maybe_trigger_refresh(
            route=route,
            query=query,
            freshness=freshness,
            total_results=len(results),
        )

        payload = {
            "status": "ok",
            "route": route,
            "results": results,
            "summary": build_summary(route, results, freshness, refresh_triggered),
            "meta": {
                "query": query,
                "total_results": len(results),
                "freshness": freshness,
                "refresh_triggered": refresh_triggered,
                "took_ms": int((time.time() - started) * 1000),
                "trace_id": getattr(context, "aws_request_id", f"local-{int(started)}"),
            },
            "error": None,
        }
        logger.info(
            "smart_agent.response route=%s total=%s freshness=%s refresh_triggered=%s",
            route,
            len(results),
            freshness,
            refresh_triggered,
        )
        return payload
    except Exception as exc:
        logger.exception("smart_agent.failed route=%s query=%s", route, query)
        return error_response(route, "SMART_AGENT_ERROR", str(exc), started, query)


def ensure_search_ready() -> None:
    store.ensure_index(BEDROCK_EMBEDDING_DIMENSIONS)


def classify_route(query: str) -> str:
    lowered = normalize_text(query).lower()
    wants_fresh = any(keyword in lowered for keyword in FRESH_KEYWORDS)
    wants_semantic = any(keyword in lowered for keyword in SEMANTIC_KEYWORDS)

    if SMART_AGENT_MODEL_MODE != "rule_based":
        logger.info("smart_agent.mode=%s falling back to rule_based for v1", SMART_AGENT_MODEL_MODE)

    if wants_fresh and wants_semantic:
        return "hybrid_search"
    if wants_fresh:
        return "fresh_news"
    return "semantic_search"


def fetch_results(query: str, route: str) -> list[dict[str, Any]]:
    if route == "fresh_news":
        return fetch_fresh_results(query)

    if route == "semantic_search":
        embedding = embed_text(query)
        semantic_items = format_hits(store.semantic_search(embedding, size=DEFAULT_RESULT_LIMIT))
        if semantic_items:
            return semantic_items
        keyword_items = format_hits(store.keyword_search(query, size=DEFAULT_RESULT_LIMIT))
        return rank_result_items(keyword_items, score_weight=0.85, freshness_weight=0.15)

    embedding = embed_text(query)
    keyword_items = format_hits(store.keyword_search(query, size=DEFAULT_RESULT_LIMIT))
    semantic_items = format_hits(store.semantic_search(embedding, size=DEFAULT_RESULT_LIMIT))
    return merge_result_items(
        keyword_items,
        semantic_items,
        score_weight=0.7,
        freshness_weight=0.3,
    )


def fetch_fresh_results(query: str) -> list[dict[str, Any]]:
    query_token_set = query_terms(query)
    keyword_items = format_hits(store.keyword_search(query, size=DEFAULT_RESULT_LIMIT))
    recent_items = format_hits(store.recent_search(size=max(DEFAULT_RESULT_LIMIT * 3, 20)))
    relevant_recent_items = filter_recent_items(recent_items, query_token_set)

    if not relevant_recent_items and not keyword_items:
        return rank_result_items(recent_items[:DEFAULT_RESULT_LIMIT], score_weight=0.3, freshness_weight=0.7)

    if not relevant_recent_items:
        return rank_result_items(keyword_items, score_weight=0.4, freshness_weight=0.6)

    return merge_result_items(
        keyword_items,
        relevant_recent_items,
        score_weight=0.4,
        freshness_weight=0.6,
    )


def format_hits(hits: list[dict[str, Any]]) -> list[dict[str, Any]]:
    results = []
    for hit in hits:
        source = hit.get("_source", {})
        results.append(
            {
                "id": source.get("article_id") or hit.get("_id"),
                "type": "article",
                "title": source.get("title", ""),
                "url": source.get("canonical_url", ""),
                "source": source.get("source", "unknown"),
                "published_at": source.get("published_at"),
                "summary": source.get("summary", ""),
                "score": float(hit.get("_score", 0.0)),
                "freshness_score": compute_freshness_score(source.get("published_at")),
            }
        )
    return results


def merge_result_items(
    *item_sets: list[dict[str, Any]],
    score_weight: float,
    freshness_weight: float,
) -> list[dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {}
    for items in item_sets:
        for item in items:
            article_id = item["id"]
            if article_id not in merged:
                merged[article_id] = dict(item)
                continue
            merged[article_id]["score"] = max(merged[article_id]["score"], item["score"])
            merged[article_id]["freshness_score"] = max(
                merged[article_id]["freshness_score"],
                item["freshness_score"],
            )

    return rank_result_items(
        list(merged.values()),
        score_weight=score_weight,
        freshness_weight=freshness_weight,
    )


def rank_result_items(
    items: list[dict[str, Any]],
    *,
    score_weight: float,
    freshness_weight: float,
) -> list[dict[str, Any]]:
    return sorted(
        items,
        key=lambda item: (item.get("score", 0.0) * score_weight)
        + (item.get("freshness_score", 0.0) * freshness_weight),
        reverse=True,
    )[:DEFAULT_RESULT_LIMIT]


def query_terms(query: str) -> set[str]:
    return {token for token in normalize_text(query).lower().split() if len(token) > 1}


def filter_recent_items(items: list[dict[str, Any]], query_token_set: set[str]) -> list[dict[str, Any]]:
    if not query_token_set:
        return items[:DEFAULT_RESULT_LIMIT]

    filtered: list[dict[str, Any]] = []
    for item in items:
        haystack = normalize_text(
            " ".join(
                [
                    item.get("title", ""),
                    item.get("summary", ""),
                    item.get("source", ""),
                ]
            )
        ).lower()
        if any(token in haystack for token in query_token_set):
            filtered.append(item)

    return filtered[: DEFAULT_RESULT_LIMIT * 2]


def compute_freshness_score(published_at: str | None) -> float:
    if not published_at:
        return 0.0
    try:
        published = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        age_minutes = (datetime.now(timezone.utc) - published.astimezone(timezone.utc)).total_seconds() / 60
        if age_minutes <= 0:
            return 1.0
        return max(0.0, 1.0 - (age_minutes / RECENCY_THRESHOLD_MINUTES))
    except Exception:
        return 0.0


def infer_freshness(results: list[dict[str, Any]]) -> str:
    if not results:
        return "unknown"
    best = max(item.get("freshness_score", 0.0) for item in results)
    if best >= 0.8:
        return "fresh"
    if best >= 0.3:
        return "mixed"
    return "cached"


def maybe_trigger_refresh(route: str, query: str, freshness: str, total_results: int) -> bool:
    if route in {"fresh_news", "hybrid_search"}:
        should_refresh = freshness not in {"fresh", "mixed"}
    elif route == "semantic_search":
        should_refresh = total_results == 0
    else:
        should_refresh = False

    if not should_refresh:
        return False

    query_key = normalize_text(query).lower()
    now = time.time()
    previous = RECENT_REFRESHES.get(query_key)
    if previous and (now - previous) < REFRESH_COOLDOWN_SECONDS:
        logger.info(
            "smart_agent.refresh_skipped_cooldown query=%s cooldown_remaining=%s",
            query,
            int(REFRESH_COOLDOWN_SECONDS - (now - previous)),
        )
        return False

    trigger_async_refresh(query)
    RECENT_REFRESHES[query_key] = now
    return True


def trigger_async_refresh(query: str) -> None:
    logger.info("smart_agent.trigger_async_refresh query=%s", query)
    lambda_client.invoke(
        FunctionName=CRAWLER_FUNCTION_NAME,
        InvocationType="Event",
        Payload=json.dumps(
            {
                "mode": "targeted_refresh",
                "query": query,
                "max_feeds": REFRESH_MAX_FEEDS,
            }
        ).encode("utf-8"),
    )


def build_summary(
    route: str,
    results: list[dict[str, Any]],
    freshness: str,
    refresh_triggered: bool,
) -> dict[str, Any]:
    if not results:
        text = "Chưa tìm thấy kết quả phù hợp trong index hiện tại."
        if refresh_triggered:
            text += " Đã kích hoạt refresh nền để làm mới dữ liệu."
        return {
            "text": text,
            "highlights": [],
        }

    prefix = {
        "fresh_news": "Kết quả thiên về tin mới",
        "semantic_search": "Kết quả thiên về semantic search",
        "hybrid_search": "Kết quả hybrid giữa semantic + freshness",
    }.get(route, "Kết quả truy vấn")

    suffix = ""
    if refresh_triggered:
        suffix = " Đã kích hoạt refresh nền để cập nhật thêm kết quả mới."

    highlights = [item["title"] for item in results[:3] if item.get("title")]
    return {
        "text": f"{prefix}. Freshness hiện tại: {freshness}. Tìm được {len(results)} bài.{suffix}",
        "highlights": highlights,
    }


def error_response(route: str, code: str, message: str, started: float, query: str) -> dict[str, Any]:
    return {
        "status": "error",
        "route": route,
        "results": [],
        "summary": {
            "text": message,
            "highlights": [],
        },
        "meta": {
            "query": query,
            "total_results": 0,
            "freshness": "unknown",
            "refresh_triggered": False,
            "took_ms": int((time.time() - started) * 1000),
            "trace_id": f"error-{int(started)}",
        },
        "error": {
            "code": code,
            "message": message,
        },
    }
