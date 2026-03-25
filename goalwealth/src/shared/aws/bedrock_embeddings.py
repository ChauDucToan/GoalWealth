from __future__ import annotations

import json
import os
from typing import Sequence

import boto3


class EmbeddingError(RuntimeError):
    pass


def embed_text(text: str) -> Sequence[float]:
    provider_mode = os.environ.get("EMBEDDING_PROVIDER_MODE", "bedrock")
    if provider_mode != "bedrock":
        raise EmbeddingError(
            f"Unsupported EMBEDDING_PROVIDER_MODE={provider_mode!r}. Only 'bedrock' is implemented in v1."
        )

    model_id = os.environ.get("BEDROCK_EMBEDDING_MODEL_ID", "amazon.titan-embed-text-v2:0")
    dimensions = int(os.environ.get("BEDROCK_EMBEDDING_DIMENSIONS", "1024"))

    client = boto3.client("bedrock-runtime")
    body = {
        "inputText": text,
        "dimensions": dimensions,
        "normalize": True,
    }

    response = client.invoke_model(
        modelId=model_id,
        body=json.dumps(body),
        accept="application/json",
        contentType="application/json",
    )
    payload = json.loads(response["body"].read())
    embedding = payload.get("embedding")
    if not embedding:
        raise EmbeddingError(f"No embedding returned by model {model_id}")
    return embedding
