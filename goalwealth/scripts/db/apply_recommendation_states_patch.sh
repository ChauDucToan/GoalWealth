#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GOALWEALTH_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [[ -z "${GOALWEALTH_DATABASE_URL:-}" ]]; then
  echo "[apply-recommendation-states-patch] GOALWEALTH_DATABASE_URL is required" >&2
  exit 1
fi

if [[ -f "$GOALWEALTH_DIR/../.venv/bin/activate" ]]; then
  # shellcheck source=/dev/null
  source "$GOALWEALTH_DIR/../.venv/bin/activate"
elif [[ -f "$GOALWEALTH_DIR/.venv/bin/activate" ]]; then
  # shellcheck source=/dev/null
  source "$GOALWEALTH_DIR/.venv/bin/activate"
fi

python3 - <<'PY'
from __future__ import annotations

import os

import psycopg

sql = """
CREATE TABLE IF NOT EXISTS recommendation_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'dismissed'
        CHECK (status IN ('dismissed')),
    dismissed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_recommendation_states_user_recommendation UNIQUE (user_id, recommendation_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendation_states_user_id
    ON recommendation_states(user_id);

CREATE INDEX IF NOT EXISTS idx_recommendation_states_user_status
    ON recommendation_states(user_id, status);
"""

with psycopg.connect(os.environ["GOALWEALTH_DATABASE_URL"], autocommit=True) as conn:
    with conn.cursor() as cur:
        cur.execute(sql)

print("[apply-recommendation-states-patch] applied recommendation_states patch")
PY
