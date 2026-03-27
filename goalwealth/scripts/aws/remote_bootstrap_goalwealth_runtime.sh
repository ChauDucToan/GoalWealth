#!/usr/bin/env bash
set -euo pipefail

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "[remote-bootstrap] missing required env: $name" >&2
    exit 1
  fi
}

require_var GW_REMOTE_SRC_ARCHIVE
require_var GW_REMOTE_APP_DIR
require_var GW_INTERNAL_BEARER_TOKEN
require_var GW_ENV
require_var GW_ADAPTER_PORT
require_var GW_INTERNAL_BACKEND_PORT
require_var GW_ENABLE_DOCS
require_var GW_NEWS_BASE_URL

GW_DATABASE_URL="${GW_DATABASE_URL:-}"
GW_APPLY_DDL_V1="${GW_APPLY_DDL_V1:-false}"
GW_DATABASE_ECHO_SQL="${GW_DATABASE_ECHO_SQL:-false}"

APP_DIR="$GW_REMOTE_APP_DIR"
ARCHIVE_PATH="$GW_REMOTE_SRC_ARCHIVE"
RUN_DIR="$APP_DIR/run"
LOG_DIR="$APP_DIR/logs"

write_env_file() {
  local output_path="$1"
  shift
  python3 - "$output_path" "$@" <<'PY'
from pathlib import Path
import os
import sys

output = Path(sys.argv[1])
keys = sys.argv[2:]
with output.open("w", encoding="utf-8") as f:
    for key in keys:
        value = os.environ.get(key, "")
        f.write(f"{key}={value!r}\n")
PY
}

append_env_if_set() {
  local output_path="$1"
  local key="$2"
  local value="${!key:-}"
  if [[ -n "$value" ]]; then
    python3 - "$output_path" "$key" <<'PY'
from pathlib import Path
import os
import sys

output = Path(sys.argv[1])
key = sys.argv[2]
value = os.environ[key]
with output.open("a", encoding="utf-8") as f:
    f.write(f"{key}={value!r}\n")
PY
  fi
}

append_env_literal() {
  local output_path="$1"
  local key="$2"
  local value="$3"
  python3 - "$output_path" "$key" "$value" <<'PY'
from pathlib import Path
import sys

output = Path(sys.argv[1])
key = sys.argv[2]
value = sys.argv[3]
with output.open("a", encoding="utf-8") as f:
    f.write(f"{key}={value!r}\n")
PY
}

extract_json_field() {
  local json_path="$1"
  local field="$2"
  python3 - "$json_path" "$field" <<'PY'
from pathlib import Path
import json
import sys

json_path = Path(sys.argv[1])
field = sys.argv[2]
raw = json_path.read_text(encoding="utf-8").strip()
if not raw:
    sys.exit(0)
obj = json.loads(raw)
value = obj
for part in field.split('.'):
    if isinstance(value, dict):
        value = value.get(part)
    else:
        value = None
        break
print("" if value is None else value)
PY
}

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "[remote-bootstrap] missing required command: $cmd" >&2
    exit 1
  fi
}

require_command python3
require_command curl
require_command bash

install_base_packages() {
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
      git python3 python3-pip python3-venv tar gzip curl
    return 0
  fi

  if command -v dnf >/dev/null 2>&1; then
    sudo dnf update -y
    sudo dnf install -y git python3 python3-pip tar gzip curl
    return 0
  fi

  if command -v yum >/dev/null 2>&1; then
    sudo yum update -y
    sudo yum install -y git python3 python3-pip tar gzip curl
    return 0
  fi

  echo "[remote-bootstrap] unsupported package manager" >&2
  exit 1
}

install_node_packages() {
  if command -v apt-get >/dev/null 2>&1; then
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs npm || true
    return 0
  fi

  if command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y nodejs npm || true
    return 0
  fi

  if command -v yum >/dev/null 2>&1; then
    sudo yum install -y nodejs npm || true
    return 0
  fi
}

install_base_packages

if [[ "${GW_INSTALL_OPENCLAW:-false}" == "true" ]]; then
  if ! command -v node >/dev/null 2>&1; then
    install_node_packages
  fi
  if ! command -v openclaw >/dev/null 2>&1; then
    sudo npm install -g "${GW_OPENCLAW_NPM_PACKAGE:-openclaw}" || true
  fi
fi

sudo mkdir -p "$APP_DIR"
sudo chown "$USER":"$USER" "$APP_DIR"
mkdir -p "$APP_DIR"
rm -rf "$APP_DIR/goalwealth" "$APP_DIR/aws" "$APP_DIR/aws-guide"

tar xzf "$ARCHIVE_PATH" -C "$APP_DIR"

cd "$APP_DIR"
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r goalwealth/src/requirements.txt

mkdir -p "$RUN_DIR" "$LOG_DIR"

export PYTHONPATH="$APP_DIR/goalwealth/src"
export GOALWEALTH_INTERNAL_BACKEND_ENV="$GW_ENV"
export GOALWEALTH_INTERNAL_BACKEND_HOST="127.0.0.1"
export GOALWEALTH_INTERNAL_BACKEND_PORT="$GW_INTERNAL_BACKEND_PORT"
export GOALWEALTH_INTERNAL_BACKEND_ENABLE_DOCS="$GW_ENABLE_DOCS"
export GOALWEALTH_INTERNAL_BACKEND_AUTH_OPTIONAL="false"
export GOALWEALTH_INTERNAL_BACKEND_BEARER_TOKEN="$GW_INTERNAL_BEARER_TOKEN"
export GOALWEALTH_INTERNAL_BACKEND_SMART_AGENT_MODE="stub"
export GOALWEALTH_INTERNAL_BACKEND_NEWS_BASE_URL="$GW_NEWS_BASE_URL"
export GOALWEALTH_DATABASE_ECHO_SQL="$GW_DATABASE_ECHO_SQL"
export GOALWEALTH_ADAPTER_ENV="$GW_ENV"
export GOALWEALTH_ADAPTER_HOST="0.0.0.0"
export GOALWEALTH_ADAPTER_PORT="$GW_ADAPTER_PORT"
export GOALWEALTH_ADAPTER_ENABLE_DOCS="$GW_ENABLE_DOCS"
export GOALWEALTH_ADAPTER_AUTH_OPTIONAL="true"
export GOALWEALTH_ADAPTER_ALLOW_DEV_TOKENS="true"
export GOALWEALTH_INTERNAL_API_BASE_URL="http://127.0.0.1:$GW_INTERNAL_BACKEND_PORT"
export GOALWEALTH_INTERNAL_API_BEARER_TOKEN="$GW_INTERNAL_BEARER_TOKEN"
export GOALWEALTH_INTERNAL_API_TIMEOUT_SECONDS="10"
export GOALWEALTH_DATABASE_URL="${GW_DATABASE_URL:-}"
export GOALWEALTH_OPENCLAW_BASE_URL="${GW_OPENCLAW_BASE_URL:-}"
export GOALWEALTH_OPENCLAW_TOKEN="${GW_OPENCLAW_TOKEN:-}"
export GOALWEALTH_OPENCLAW_AGENT_ID="${GW_OPENCLAW_AGENT_ID:-main}"
export GOALWEALTH_OPENCLAW_SESSION_PREFIX="${GW_OPENCLAW_SESSION_PREFIX:-goalwealth}"
export GOALWEALTH_OPENCLAW_HTTP_ENDPOINT="${GW_OPENCLAW_HTTP_ENDPOINT:-chat_completions}"

write_env_file "$APP_DIR/internal-backend.env" \
  PYTHONPATH \
  GOALWEALTH_INTERNAL_BACKEND_ENV \
  GOALWEALTH_INTERNAL_BACKEND_HOST \
  GOALWEALTH_INTERNAL_BACKEND_PORT \
  GOALWEALTH_INTERNAL_BACKEND_ENABLE_DOCS \
  GOALWEALTH_INTERNAL_BACKEND_AUTH_OPTIONAL \
  GOALWEALTH_INTERNAL_BACKEND_BEARER_TOKEN \
  GOALWEALTH_INTERNAL_BACKEND_SMART_AGENT_MODE \
  GOALWEALTH_INTERNAL_BACKEND_NEWS_BASE_URL \
  GOALWEALTH_DATABASE_ECHO_SQL

write_env_file "$APP_DIR/adapter.env" \
  PYTHONPATH \
  GOALWEALTH_ADAPTER_ENV \
  GOALWEALTH_ADAPTER_HOST \
  GOALWEALTH_ADAPTER_PORT \
  GOALWEALTH_ADAPTER_ENABLE_DOCS \
  GOALWEALTH_ADAPTER_AUTH_OPTIONAL \
  GOALWEALTH_ADAPTER_ALLOW_DEV_TOKENS \
  GOALWEALTH_INTERNAL_API_BASE_URL \
  GOALWEALTH_INTERNAL_API_BEARER_TOKEN \
  GOALWEALTH_INTERNAL_API_TIMEOUT_SECONDS \
  GOALWEALTH_OPENCLAW_BASE_URL \
  GOALWEALTH_OPENCLAW_TOKEN \
  GOALWEALTH_OPENCLAW_AGENT_ID \
  GOALWEALTH_OPENCLAW_SESSION_PREFIX \
  GOALWEALTH_OPENCLAW_HTTP_ENDPOINT \
  GOALWEALTH_DATABASE_ECHO_SQL

append_env_if_set "$APP_DIR/internal-backend.env" GOALWEALTH_DATABASE_URL
append_env_if_set "$APP_DIR/adapter.env" GOALWEALTH_DATABASE_URL

if [[ "${GW_ENABLE_OIDC:-false}" == "true" && -n "${GW_GOOGLE_CLIENT_ID:-}" ]]; then
  append_env_literal "$APP_DIR/adapter.env" GOALWEALTH_OIDC_ISSUER https://accounts.google.com
  append_env_literal "$APP_DIR/adapter.env" GOALWEALTH_OIDC_AUDIENCE "$GW_GOOGLE_CLIENT_ID"
  append_env_literal "$APP_DIR/adapter.env" GOALWEALTH_OIDC_JWKS_URL https://www.googleapis.com/oauth2/v3/certs
  append_env_literal "$APP_DIR/adapter.env" GOALWEALTH_OIDC_TOKENINFO_URL https://oauth2.googleapis.com/tokeninfo
  append_env_literal "$APP_DIR/adapter.env" GOALWEALTH_OIDC_TIMEOUT_SECONDS 10
fi

stop_pid_file() {
  local pid_file="$1"
  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(cat "$pid_file" 2>/dev/null || true)"
    if [[ -n "$pid" ]]; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
    rm -f "$pid_file"
  fi
}

pkill -f 'uvicorn internal_backend_api.app:app' >/dev/null 2>&1 || true
pkill -f 'uvicorn adapter_api.app:app' >/dev/null 2>&1 || true
stop_pid_file "$RUN_DIR/internal-backend.pid"
stop_pid_file "$RUN_DIR/adapter.pid"

if [[ "$GW_APPLY_DDL_V1" == "true" ]]; then
  if [[ -z "$GW_DATABASE_URL" ]]; then
    echo "[remote-bootstrap] GW_APPLY_DDL_V1=true but GW_DATABASE_URL is empty" >&2
    exit 1
  fi
  DDL_PATH="$APP_DIR/goalwealth/contracts/db/goalwealth-postgres-ddl-v1.sql"
  export DDL_PATH GOALWEALTH_DATABASE_URL
  bash "$APP_DIR/goalwealth/scripts/db/apply_ddl_v1.sh" > "$LOG_DIR/db-apply.log" 2>&1
fi

nohup bash -lc "cd '$APP_DIR' && source .venv/bin/activate && set -a && source internal-backend.env && set +a && bash goalwealth/scripts/local/run_internal_backend_stub.sh" > "$LOG_DIR/internal-backend.log" 2>&1 &
echo $! > "$RUN_DIR/internal-backend.pid"

nohup bash -lc "cd '$APP_DIR' && source .venv/bin/activate && set -a && source adapter.env && set +a && python3 -m uvicorn adapter_api.app:app --host 0.0.0.0 --port '$GW_ADAPTER_PORT'" > "$LOG_DIR/adapter.log" 2>&1 &
echo $! > "$RUN_DIR/adapter.pid"

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$GW_INTERNAL_BACKEND_PORT/ready" >/tmp/internal-ready.json 2>/dev/null; then
    break
  fi
  sleep 2
done

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$GW_ADAPTER_PORT/ready" >/tmp/adapter-ready.json 2>/dev/null; then
    break
  fi
  sleep 2
done

curl -fsS -X POST "http://127.0.0.1:$GW_ADAPTER_PORT/v1/chat/respond" \
  -H "Authorization: Bearer dev-token:user-123" \
  -H "Content-Type: application/json" \
  -d '{"message":"Tin AI mới nhất hôm nay là gì?","timezone":"Asia/Ho_Chi_Minh"}' > "$LOG_DIR/chat-smoke.json"

curl -fsS "http://127.0.0.1:$GW_ADAPTER_PORT/v1/me" \
  -H "Authorization: Bearer dev-token:user-123" > "$LOG_DIR/me-smoke.json"

curl -fsS -X POST "http://127.0.0.1:$GW_ADAPTER_PORT/v1/ocr/ingress" \
  -H "Authorization: Bearer dev-token:user-123" \
  -H "Content-Type: application/json" \
  -d '{"raw_text":"Luong thang 03/2026: net 45,000,000 VND"}' > "$LOG_DIR/ocr-ingress-smoke.json"

OCR_RECORD_ID="$(extract_json_field "$LOG_DIR/ocr-ingress-smoke.json" data.ocr_record_id)"
if [[ -z "$OCR_RECORD_ID" ]]; then
  echo "[remote-bootstrap] failed to extract OCR record id from smoke response" >&2
  cat "$LOG_DIR/ocr-ingress-smoke.json" >&2 || true
  exit 1
fi

curl -fsS "http://127.0.0.1:$GW_ADAPTER_PORT/v1/ocr/records/$OCR_RECORD_ID" \
  -H "Authorization: Bearer dev-token:user-123" > "$LOG_DIR/ocr-smoke.json"

cat <<EOF
[remote-bootstrap] completed
app_dir=$APP_DIR
internal_ready=$(cat /tmp/internal-ready.json 2>/dev/null || echo '{}')
adapter_ready=$(cat /tmp/adapter-ready.json 2>/dev/null || echo '{}')
chat_smoke=$LOG_DIR/chat-smoke.json
me_smoke=$LOG_DIR/me-smoke.json
ocr_ingress_smoke=$LOG_DIR/ocr-ingress-smoke.json
ocr_smoke=$LOG_DIR/ocr-smoke.json
db_apply_log=$LOG_DIR/db-apply.log
internal_log=$LOG_DIR/internal-backend.log
adapter_log=$LOG_DIR/adapter.log
EOF

