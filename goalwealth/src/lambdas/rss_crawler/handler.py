from __future__ import annotations

import json
import logging
import os
import re
from typing import Any

import boto3
import feedparser
import requests
from boto3.dynamodb.conditions import Attr
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from shared.aws.bedrock_embeddings import embed_text
from shared.content.dedupe import build_article_id, build_content_hash
from shared.content.normalization import iso_now, normalize_text, normalize_url, parse_datetime
from shared.aws.opensearch_store import OpenSearchStore

logger = logging.getLogger()
logger.setLevel(logging.INFO)

TABLE_NAME = os.environ["FEED_REGISTRY_TABLE"]
MAX_ARTICLES_PER_FEED = int(os.environ.get("MAX_ARTICLES_PER_FEED", "20"))
FETCH_TIMEOUT_SECONDS = int(os.environ.get("FETCH_TIMEOUT_SECONDS", "15"))
BEDROCK_EMBEDDING_DIMENSIONS = int(os.environ.get("BEDROCK_EMBEDDING_DIMENSIONS", "1024"))
DEFAULT_MAX_TARGET_FEEDS = int(os.environ.get("DEFAULT_MAX_TARGET_FEEDS", "5"))
REQUEST_USER_AGENT = os.environ.get(
    "REQUEST_USER_AGENT",
    f"{os.environ.get('PROJECT_NAME', 'GoalWealth')}Crawler/1.0",
)
QUERY_TOKEN_RE = re.compile(r"[\w-]+", re.UNICODE)


dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)
store = OpenSearchStore()
http = requests.Session()
retry = Retry(
    total=3,
    connect=3,
    read=3,
    status=3,
    backoff_factor=0.5,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=frozenset(["GET", "HEAD"]),
)
http.mount("http://", HTTPAdapter(max_retries=retry))
http.mount("https://", HTTPAdapter(max_retries=retry))
http.headers.update(
    {
        "User-Agent": REQUEST_USER_AGENT,
        "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.1",
    }
)


def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    mode = event.get("mode", "warm_sync")
    feed_ids = set(event.get("feed_ids") or [])
    query = str(event.get("query") or "").strip()
    max_feeds = int(event.get("max_feeds") or DEFAULT_MAX_TARGET_FEEDS)

    logger.info(
        "crawler.start mode=%s feed_ids=%s query=%s max_feeds=%s",
        mode,
        list(feed_ids),
        query,
        max_feeds,
    )
    store.ensure_index(BEDROCK_EMBEDDING_DIMENSIONS)

    feeds = load_feeds(
        feed_ids=feed_ids if feed_ids else None,
        mode=mode,
        query=query,
        max_feeds=max_feeds,
    )
    summary = {
        "mode": mode,
        "query": query or None,
        "feeds_considered": len(feeds),
        "feeds_processed": 0,
        "articles_indexed": 0,
        "articles_skipped": 0,
        "articles_updated": 0,
        "not_modified": 0,
        "errors": [],
    }

    for feed in feeds:
        try:
            result = process_feed(feed)
            summary["feeds_processed"] += 1
            summary["articles_indexed"] += result["indexed"]
            summary["articles_skipped"] += result["skipped"]
            summary["articles_updated"] += result["updated"]
            summary["not_modified"] += 1 if result["not_modified"] else 0
        except Exception as exc:
            logger.exception("crawler.feed_error feed_id=%s", feed.get("feed_id"))
            register_feed_error(feed, str(exc))
            summary["errors"].append({"feed_id": feed.get("feed_id"), "error": str(exc)})

    return {
        "statusCode": 200,
        "body": json.dumps(summary),
    }


def load_feeds(
    feed_ids: set[str] | None = None,
    mode: str = "warm_sync",
    query: str = "",
    max_feeds: int = DEFAULT_MAX_TARGET_FEEDS,
) -> list[dict[str, Any]]:
    if feed_ids:
        items: list[dict[str, Any]] = []
        for feed_id in feed_ids:
            item = table.get_item(Key={"feed_id": feed_id}).get("Item")
            if item and item.get("status") == "active":
                items.append(item)
        return items

    feeds = scan_active_feeds()
    feeds.sort(key=lambda item: int(item.get("priority", 0)), reverse=True)

    if mode != "targeted_refresh":
        return feeds

    targeted = select_target_feeds(feeds, query=query, max_feeds=max_feeds)
    logger.info(
        "crawler.targeted_selection query=%s total_active=%s selected=%s",
        query,
        len(feeds),
        [feed.get("feed_id") for feed in targeted],
    )
    return targeted


def scan_active_feeds() -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    last_evaluated_key: dict[str, Any] | None = None

    while True:
        kwargs: dict[str, Any] = {
            "FilterExpression": Attr("status").eq("active"),
        }
        if last_evaluated_key:
            kwargs["ExclusiveStartKey"] = last_evaluated_key

        response = table.scan(**kwargs)
        items.extend(response.get("Items", []))
        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

    return items


def select_target_feeds(feeds: list[dict[str, Any]], query: str, max_feeds: int) -> list[dict[str, Any]]:
    if not feeds:
        return []
    if not query:
        return feeds[:max_feeds]

    query_tokens = query_terms(query)
    scored: list[tuple[float, dict[str, Any]]] = []

    for feed in feeds:
        score = score_feed(feed, query, query_tokens)
        scored.append((score, feed))

    scored.sort(key=lambda pair: (pair[0], int(pair[1].get("priority", 0))), reverse=True)
    selected = [feed for score, feed in scored if score > 0]
    if selected:
        return selected[:max_feeds]

    return feeds[:max_feeds]


def query_terms(query: str) -> set[str]:
    normalized = normalize_text(query).lower()
    return {token for token in QUERY_TOKEN_RE.findall(normalized) if len(token) > 1}


def score_feed(feed: dict[str, Any], query: str, query_tokens: set[str]) -> float:
    source_name = normalize_text(str(feed.get("source_name") or "")).lower()
    category = normalize_text(str(feed.get("category") or "")).lower()
    tags = [normalize_text(str(tag)).lower() for tag in feed.get("tags", [])]
    keywords = [normalize_text(str(tag)).lower() for tag in feed.get("keywords", [])]
    haystack = " ".join(part for part in [source_name, category, *tags, *keywords] if part)
    normalized_query = normalize_text(query).lower()

    score = float(int(feed.get("priority", 0)))
    if normalized_query and normalized_query in haystack:
        score += 10

    for token in query_tokens:
        if token in category:
            score += 5
        if token in source_name:
            score += 4
        if any(token in tag for tag in tags):
            score += 3
        if any(token in keyword for keyword in keywords):
            score += 2

    return score


def process_feed(feed: dict[str, Any]) -> dict[str, int | bool]:
    headers = {}
    if feed.get("etag"):
        headers["If-None-Match"] = feed["etag"]
    if feed.get("last_modified"):
        headers["If-Modified-Since"] = feed["last_modified"]

    response = http.get(feed["feed_url"], headers=headers, timeout=FETCH_TIMEOUT_SECONDS)

    if response.status_code == 304:
        update_feed_state(feed, response, success=True)
        return {"indexed": 0, "updated": 0, "skipped": 0, "not_modified": True}

    response.raise_for_status()
    parsed = feedparser.parse(response.content)

    indexed = 0
    updated = 0
    skipped = 0

    for entry in parsed.entries[:MAX_ARTICLES_PER_FEED]:
        document, existing = build_article_document(entry, feed)
        if not document:
            skipped += 1
            continue

        doc_id, action = store.upsert_article(document, existing=existing)
        logger.info(
            "crawler.article_upsert feed_id=%s article_id=%s doc_id=%s action=%s",
            feed.get("feed_id"),
            document["article_id"],
            doc_id,
            action,
        )
        if action == "updated":
            updated += 1
        elif action == "created":
            indexed += 1
        else:
            skipped += 1

    update_feed_state(feed, response, success=True)
    return {"indexed": indexed, "updated": updated, "skipped": skipped, "not_modified": False}


def build_article_document(
    entry: dict[str, Any],
    feed: dict[str, Any],
) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    raw_url = entry.get("link") or entry.get("id") or ""
    canonical_url = normalize_url(raw_url)
    title = normalize_text(entry.get("title", ""))
    summary = normalize_text(entry.get("summary", entry.get("description", "")))
    content = extract_content(entry)
    published_at = parse_published(entry)

    if not title and not canonical_url:
        return None, None

    article_id = build_article_id(
        {
            "guid": entry.get("id") or entry.get("guid"),
            "title": title,
            "published_at": published_at,
        },
        canonical_url,
        str(feed.get("source_name") or "unknown"),
    )
    content_hash = build_content_hash(title, summary, content)

    existing = store.find_by_article_id(article_id)
    if existing and existing.get("_source", {}).get("content_hash") == content_hash:
        return None, existing

    embedding_input = "\n\n".join(part for part in [title, summary, content[:4000]] if part)
    embedding = embed_text(embedding_input)

    document = {
        "article_id": article_id,
        "canonical_url": canonical_url,
        "title": title,
        "summary": summary,
        "content": content,
        "source": feed.get("source_name", "unknown"),
        "category": feed.get("category", "general"),
        "published_at": published_at or iso_now(),
        "crawled_at": iso_now(),
        "content_hash": content_hash,
        "tags": feed.get("tags", []),
        "embedding": embedding,
    }
    return document, existing


def extract_content(entry: dict[str, Any]) -> str:
    content = entry.get("content")
    if isinstance(content, list) and content:
        return normalize_text(content[0].get("value", ""))
    return normalize_text(entry.get("description", ""))


def parse_published(entry: dict[str, Any]) -> str | None:
    for key in ("published", "updated", "created"):
        value = entry.get(key)
        parsed = parse_datetime(value)
        if parsed:
            return parsed
    return None


def update_feed_state(feed: dict[str, Any], response: requests.Response, success: bool) -> None:
    now = iso_now()
    update_expr = [
        "SET last_fetch_at = :last_fetch_at",
        "etag = :etag",
        "last_modified = :last_modified",
        "error_count = :error_count",
    ]
    values = {
        ":last_fetch_at": now,
        ":etag": response.headers.get("ETag", feed.get("etag", "")),
        ":last_modified": response.headers.get("Last-Modified", feed.get("last_modified", "")),
        ":error_count": 0 if success else int(feed.get("error_count", 0)) + 1,
    }
    if success:
        update_expr.append("last_success_at = :last_success_at")
        values[":last_success_at"] = now

    table.update_item(
        Key={"feed_id": feed["feed_id"]},
        UpdateExpression=", ".join(update_expr),
        ExpressionAttributeValues=values,
    )


def register_feed_error(feed: dict[str, Any], error_message: str) -> None:
    table.update_item(
        Key={"feed_id": feed["feed_id"]},
        UpdateExpression="SET last_fetch_at = :last_fetch_at, last_error = :last_error, error_count = :error_count",
        ExpressionAttributeValues={
            ":last_fetch_at": iso_now(),
            ":last_error": error_message[:1000],
            ":error_count": int(feed.get("error_count", 0)) + 1,
        },
    )
