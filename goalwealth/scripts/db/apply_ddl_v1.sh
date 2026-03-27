#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GOALWEALTH_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
DDL_PATH="$GOALWEALTH_DIR/contracts/db/goalwealth-postgres-ddl-v1.sql"
export DDL_PATH

if [[ ! -f "$DDL_PATH" ]]; then
  echo "[apply-ddl-v1] DDL file not found: $DDL_PATH" >&2
  exit 1
fi

if [[ -z "${GOALWEALTH_DATABASE_URL:-}" ]]; then
  echo "[apply-ddl-v1] GOALWEALTH_DATABASE_URL is required" >&2
  exit 1
fi

if [[ -f "$GOALWEALTH_DIR/../.venv/bin/activate" ]]; then
  # Support calling from app root after remote bootstrap.
  # shellcheck source=/dev/null
  source "$GOALWEALTH_DIR/../.venv/bin/activate"
elif [[ -f "$GOALWEALTH_DIR/.venv/bin/activate" ]]; then
  # shellcheck source=/dev/null
  source "$GOALWEALTH_DIR/.venv/bin/activate"
fi

python3 - <<'PY'
from __future__ import annotations

import os
from pathlib import Path

import psycopg

sql_path = Path(os.environ["DDL_PATH"])
database_url = os.environ["GOALWEALTH_DATABASE_URL"]
sql = sql_path.read_text(encoding="utf-8")

with psycopg.connect(database_url, autocommit=True) as conn:
    with conn.cursor() as cur:
        cur.execute(sql)

print(f"[apply-ddl-v1] applied {sql_path}")
PY
