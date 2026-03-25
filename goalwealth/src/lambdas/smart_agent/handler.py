from __future__ import annotations

import json
import logging
import os
import re
import time
from datetime import datetime, timezone
from typing import Any

import boto3

from shared.aws.bedrock_embeddings import embed_text
from shared.content.normalization import normalize_text
from shared.aws.opensearch_store import OpenSearchStore

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

SEARCH_STOPWORDS = {
    "tin",
    "bai",
    "bài",
    "cac",
    "các",
    "ve",
    "về",
    "va",
    "và",
    "moi",
    "mới",
    "nhat",
    "nhất",
    "hom",
    "hôm",
    "nay",
    "sang",
    "sáng",
    "new",
    "news",
    "latest",
    "recent",
    "today",
    "breaking",
    "search",
    "semantic",
}
ACRONYM_ALIASES = {
    "AI": ("artificial intelligence", "trí tuệ nhân tạo", "tri tue nhan tao"),
    "ML": ("machine learning", "học máy", "hoc may"),
    "LLM": ("large language model", "large language models", "mô hình ngôn ngữ lớn", "mo hinh ngon ngu lon"),
    "NLP": ("natural language processing", "xử lý ngôn ngữ tự nhiên", "xu ly ngon ngu tu nhien"),
    "AWS": ("amazon web services",),
    "GPU": ("graphics processing unit", "graphics processing units"),
}
QUERY_TOKEN_RE = re.compile(r"[\w-]+", re.UNICODE)

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
        match_quality = assess_match_quality(route, query, results)
        relevance_threshold_passed = match_quality != "none"
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
            "summary": build_summary(route, results, freshness, refresh_triggered, match_quality),
            "meta": {
                "query": query,
                "total_results": len(results),
                "freshness": freshness,
                "match_quality": match_quality,
                "relevance_threshold_passed": relevance_threshold_passed,
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
    acronym_terms = acronym_query_terms(query)
    keyword_items = format_hits(store.keyword_search(query, size=DEFAULT_RESULT_LIMIT))
    recent_items = format_hits(store.recent_search(size=max(DEFAULT_RESULT_LIMIT * 3, 20)))

    if not query_token_set and not acronym_terms:
        if not recent_items and not keyword_items:
            return []
        if not recent_items:
            return rank_result_items(keyword_items, score_weight=0.4, freshness_weight=0.6)
        return merge_result_items(
            keyword_items,
            recent_items,
            score_weight=0.4,
            freshness_weight=0.6,
        )

    relevant_keyword_items = filter_result_items(keyword_items, query_token_set, acronym_terms)
    relevant_recent_items = filter_result_items(recent_items, query_token_set, acronym_terms)

    if not relevant_recent_items and not relevant_keyword_items:
        return []

    if not relevant_recent_items:
        return rank_result_items(relevant_keyword_items, score_weight=0.4, freshness_weight=0.6)

    if not relevant_keyword_items:
        return rank_result_items(relevant_recent_items, score_weight=0.3, freshness_weight=0.7)

    return merge_result_items(
        relevant_keyword_items,
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
                "score": coerce_score(hit.get("_score")),
                "freshness_score": compute_freshness_score(source.get("published_at")),
            }
        )
    return dedupe_result_items(results)


def coerce_score(value: Any) -> float:
    if value is None:
        return 0.0
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def result_business_key(item: dict[str, Any]) -> str:
    return str(item.get("url") or item.get("id") or "")


def dedupe_result_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    deduped: dict[str, dict[str, Any]] = {}
    for item in items:
        key = result_business_key(item)
        if not key:
            key = str(item.get("id") or len(deduped))
        if key not in deduped:
            deduped[key] = dict(item)
            continue
        deduped[key]["score"] = max(deduped[key].get("score", 0.0), item.get("score", 0.0))
        deduped[key]["freshness_score"] = max(
            deduped[key].get("freshness_score", 0.0),
            item.get("freshness_score", 0.0),
        )
    return list(deduped.values())


def merge_result_items(
    *item_sets: list[dict[str, Any]],
    score_weight: float,
    freshness_weight: float,
) -> list[dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {}
    for items in item_sets:
        for item in items:
            key = result_business_key(item)
            if key not in merged:
                merged[key] = dict(item)
                continue
            merged[key]["score"] = max(merged[key]["score"], item["score"])
            merged[key]["freshness_score"] = max(
                merged[key]["freshness_score"],
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
    deduped = dedupe_result_items(items)
    return sorted(
        deduped,
        key=lambda item: (item.get("score", 0.0) * score_weight)
        + (item.get("freshness_score", 0.0) * freshness_weight),
        reverse=True,
    )[:DEFAULT_RESULT_LIMIT]


def tokenize_terms(value: str) -> set[str]:
    return {
        token.lower()
        for token in QUERY_TOKEN_RE.findall(normalize_text(value).lower())
        if len(token) > 1 and token.lower() not in SEARCH_STOPWORDS
    }


def acronym_query_terms(query: str) -> set[str]:
    return {
        token
        for token in QUERY_TOKEN_RE.findall(query)
        if len(token) > 1 and token.isupper()
    }


def query_terms(query: str) -> set[str]:
    acronym_terms = acronym_query_terms(query)
    return {
        token
        for token in tokenize_terms(query)
        if token.upper() not in acronym_terms
    }


def item_text(item: dict[str, Any]) -> str:
    return " ".join(
        [
            item.get("title", ""),
            item.get("summary", ""),
            item.get("source", ""),
        ]
    )


def item_terms(item: dict[str, Any]) -> set[str]:
    return tokenize_terms(item_text(item))


def item_matches_acronym(item: dict[str, Any], acronym: str) -> bool:
    raw_text = item_text(item)
    if re.search(rf"(?<!\\w){re.escape(acronym)}(?!\\w)", raw_text):
        return True

    normalized = normalize_text(raw_text).lower()
    for alias in ACRONYM_ALIASES.get(acronym, ()): 
        if alias.lower() in normalized:
            return True
    return False


def match_term_count(item: dict[str, Any], query_token_set: set[str], acronym_terms: set[str] | None = None) -> int:
    acronym_terms = acronym_terms or set()
    acronym_matches = {term for term in acronym_terms if item_matches_acronym(item, term)}
    if acronym_terms and acronym_matches != acronym_terms:
        return 0

    lexical_matches = len(item_terms(item).intersection(query_token_set))
    return lexical_matches + len(acronym_matches)


def filter_result_items(
    items: list[dict[str, Any]],
    query_token_set: set[str],
    acronym_terms: set[str] | None = None,
) -> list[dict[str, Any]]:
    acronym_terms = acronym_terms or set()
    if not query_token_set and not acronym_terms:
        return dedupe_result_items(items)[: DEFAULT_RESULT_LIMIT * 2]

    filtered: list[dict[str, Any]] = []
    for item in items:
        if match_term_count(item, query_token_set, acronym_terms) > 0:
            filtered.append(item)

    return dedupe_result_items(filtered)[: DEFAULT_RESULT_LIMIT * 2]


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


def assess_match_quality(route: str, query: str, results: list[dict[str, Any]]) -> str:
    if not results:
        return "none"

    if route != "fresh_news":
        return "unknown"

    query_token_set = query_terms(query)
    acronym_terms = acronym_query_terms(query)
    if not query_token_set and not acronym_terms:
        return "broad"

    best_overlap = max(match_term_count(item, query_token_set, acronym_terms) for item in results)
    if best_overlap <= 0:
        return "none"

    expected_signals = max(len(query_token_set) + len(acronym_terms), 1)
    coverage = best_overlap / expected_signals
    if coverage >= 1.0:
        return "high"
    if coverage >= 0.5:
        return "medium"
    return "low"


def build_summary(
    route: str,
    results: list[dict[str, Any]],
    freshness: str,
    refresh_triggered: bool,
    match_quality: str,
) -> dict[str, Any]:
    if not results:
        if route == "fresh_news":
            text = "Chưa thấy bài đủ liên quan cho truy vấn trong dữ liệu hiện tại."
        else:
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
    quality_suffix = ""
    if match_quality not in {"unknown", "broad"}:
        quality_suffix = f" Match quality: {match_quality}."

    return {
        "text": f"{prefix}. Freshness hiện tại: {freshness}. Tìm được {len(results)} bài.{quality_suffix}{suffix}",
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
            "match_quality": "none",
            "relevance_threshold_passed": False,
            "refresh_triggered": False,
            "took_ms": int((time.time() - started) * 1000),
            "trace_id": f"error-{int(started)}",
        },
        "error": {
            "code": code,
            "message": message,
        },
    }
