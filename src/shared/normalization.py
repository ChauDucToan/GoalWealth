from __future__ import annotations

import html
import re
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

TRACKING_PARAM_PREFIXES = (
    "utm_",
    "fbclid",
    "gclid",
    "mc_",
    "igshid",
)

MEANINGFUL_QUERY_KEYS = {
    "id",
    "p",
    "articleid",
    "story",
    "post",
}

_WHITESPACE_RE = re.compile(r"\s+")
_HTML_TAG_RE = re.compile(r"<[^>]+>")


def normalize_whitespace(value: str) -> str:
    return _WHITESPACE_RE.sub(" ", value or "").strip()


def strip_html(value: str) -> str:
    if not value:
        return ""
    return normalize_whitespace(html.unescape(_HTML_TAG_RE.sub(" ", value)))


def normalize_title(value: str) -> str:
    return normalize_whitespace(strip_html(value)).lower()


def normalize_text(value: str) -> str:
    return normalize_whitespace(strip_html(value))


def normalize_url(url: str | None) -> str:
    if not url:
        return ""

    parsed = urlparse(url.strip())
    scheme = parsed.scheme.lower() or "https"
    netloc = parsed.netloc.lower()
    path = parsed.path or "/"

    if path != "/" and path.endswith("/"):
        path = path[:-1]

    filtered_params = []
    for key, value in parse_qsl(parsed.query, keep_blank_values=True):
        lowered = key.lower()
        if lowered.startswith(TRACKING_PARAM_PREFIXES):
            continue
        if lowered in TRACKING_PARAM_PREFIXES:
            continue
        if lowered in MEANINGFUL_QUERY_KEYS:
            filtered_params.append((key, value))

    query = urlencode(filtered_params, doseq=True)
    return urlunparse((scheme, netloc, path, "", query, ""))


def parse_datetime(value: Any) -> str | None:
    if not value:
        return None

    if isinstance(value, datetime):
        dt = value
    else:
        try:
            dt = parsedate_to_datetime(str(value))
        except Exception:
            return None

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()
