#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH="${PYTHONPATH:-}:$(pwd)/goalwealth/src"
: "${GOALWEALTH_INTERNAL_BACKEND_HOST:=0.0.0.0}"
: "${GOALWEALTH_INTERNAL_BACKEND_PORT:=8090}"

exec python3 -m uvicorn internal_backend_api.app:app \
  --host "$GOALWEALTH_INTERNAL_BACKEND_HOST" \
  --port "$GOALWEALTH_INTERNAL_BACKEND_PORT"
