from __future__ import annotations

import os
from typing import Any, Iterable
from urllib.parse import urlparse

import boto3
from opensearchpy import AWSV4SignerAuth, OpenSearch, RequestsHttpConnection
from opensearchpy.exceptions import NotFoundError, RequestError


class OpenSearchStore:
    def __init__(self, endpoint: str | None = None, index_name: str | None = None):
        endpoint = endpoint or os.environ["OPENSEARCH_COLLECTION_ENDPOINT"]
        parsed = urlparse(endpoint)
        host = parsed.netloc or parsed.path
        region = boto3.session.Session().region_name or os.environ.get("AWS_REGION") or "us-east-1"
        credentials = boto3.Session().get_credentials()
        auth = AWSV4SignerAuth(credentials, region, "aoss")
        self.client = OpenSearch(
            hosts=[{"host": host, "port": 443}],
            http_auth=auth,
            use_ssl=True,
            verify_certs=True,
            connection_class=RequestsHttpConnection,
            timeout=30,
        )
        self.index_name = index_name or os.environ.get("OPENSEARCH_INDEX", "news_articles")

    def ensure_index(self, vector_dimension: int) -> None:
        try:
            if self.client.indices.exists(index=self.index_name):
                return
        except NotFoundError:
            pass

        body = {
            "settings": {"index": {"knn": True}},
            "mappings": {
                "properties": {
                    "article_id": {"type": "keyword"},
                    "canonical_url": {"type": "keyword"},
                    "title": {"type": "text"},
                    "summary": {"type": "text"},
                    "content": {"type": "text"},
                    "source": {"type": "keyword"},
                    "category": {"type": "keyword"},
                    "published_at": {"type": "date"},
                    "crawled_at": {"type": "date"},
                    "content_hash": {"type": "keyword"},
                    "tags": {"type": "keyword"},
                    "embedding": {
                        "type": "knn_vector",
                        "dimension": vector_dimension,
                    },
                }
            },
        }
        try:
            self.client.indices.create(index=self.index_name, body=body)
        except RequestError as exc:
            if "resource_already_exists_exception" in str(exc):
                return
            raise

    def find_by_article_id(self, article_id: str) -> dict[str, Any] | None:
        try:
            response = self.client.search(
                index=self.index_name,
                body={
                    "size": 1,
                    "query": {"term": {"article_id": article_id}},
                },
            )
        except NotFoundError:
            return None
        hits = response.get("hits", {}).get("hits", [])
        return hits[0] if hits else None

    def upsert_article(
        self,
        document: dict[str, Any],
        existing: dict[str, Any] | None = None,
    ) -> tuple[str, str]:
        existing = existing or self.find_by_article_id(document["article_id"])
        if existing:
            existing_hash = existing.get("_source", {}).get("content_hash")
            if existing_hash == document.get("content_hash"):
                return existing.get("_id", ""), "unchanged"
            self.client.index(index=self.index_name, id=existing["_id"], body=document, refresh=False)
            return existing["_id"], "updated"

        response = self.client.index(index=self.index_name, body=document, refresh=False)
        return response.get("_id", ""), "created"

    def keyword_search(self, query: str, size: int = 10) -> list[dict[str, Any]]:
        try:
            response = self.client.search(
                index=self.index_name,
                body={
                    "size": size,
                    "sort": [{"published_at": {"order": "desc"}}],
                    "query": {
                        "multi_match": {
                            "query": query,
                            "fields": ["title^3", "summary^2", "content"],
                        }
                    },
                },
            )
        except NotFoundError:
            return []
        return response.get("hits", {}).get("hits", [])

    def semantic_search(self, embedding: Iterable[float], size: int = 10) -> list[dict[str, Any]]:
        try:
            response = self.client.search(
                index=self.index_name,
                body={
                    "size": size,
                    "query": {
                        "knn": {
                            "embedding": {
                                "vector": list(embedding),
                                "k": size,
                            }
                        }
                    },
                },
            )
        except NotFoundError:
            return []
        return response.get("hits", {}).get("hits", [])

    def recent_search(self, size: int = 10) -> list[dict[str, Any]]:
        try:
            response = self.client.search(
                index=self.index_name,
                body={
                    "size": size,
                    "sort": [{"published_at": {"order": "desc"}}],
                    "query": {"match_all": {}},
                },
            )
        except NotFoundError:
            return []
        return response.get("hits", {}).get("hits", [])
