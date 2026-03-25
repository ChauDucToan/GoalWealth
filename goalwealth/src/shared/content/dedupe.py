from __future__ import annotations

import hashlib
from typing import Any

from shared.content.normalization import normalize_text, normalize_title, normalize_url


def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def build_article_id(entry: dict[str, Any], canonical_url: str, source_name: str) -> str:
    guid = str(entry.get("id") or entry.get("guid") or "").strip()
    if guid:
        return _sha256(f"guid::{normalize_text(guid)}")

    if canonical_url:
        return _sha256(f"url::{normalize_url(canonical_url)}")

    title = normalize_title(str(entry.get("title") or ""))
    published_at = str(entry.get("published_at") or entry.get("published") or "")
    return _sha256(f"fallback::{source_name.lower()}::{title}::{published_at}")


def build_content_hash(title: str, summary: str, content: str) -> str:
    material = "\n".join(
        [normalize_text(title), normalize_text(summary), normalize_text(content)]
    )
    return _sha256(material)
