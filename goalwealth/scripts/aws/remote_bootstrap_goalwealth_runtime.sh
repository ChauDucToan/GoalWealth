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

APP_DIR="$GW_REMOTE_APP_DIR"
ARCHIVE_PATH="$GW_REMOTE_SRC_ARCHIVE"
RUN_DIR="$APP_DIR/run"
LOG_DIR="$APP_DIR/logs"

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

cat > "$APP_DIR/internal-backend.env" <<EOF
PYTHONPATH=$APP_DIR/goalwealth/src
GOALWEALTH_INTERNAL_BACKEND_ENV=$GW_ENV
GOALWEALTH_INTERNAL_BACKEND_HOST=127.0.0.1
GOALWEALTH_INTERNAL_BACKEND_PORT=$GW_INTERNAL_BACKEND_PORT
GOALWEALTH_INTERNAL_BACKEND_ENABLE_DOCS=$GW_ENABLE_DOCS
GOALWEALTH_INTERNAL_BACKEND_AUTH_OPTIONAL=false
GOALWEALTH_INTERNAL_BACKEND_BEARER_TOKEN=$GW_INTERNAL_BEARER_TOKEN
GOALWEALTH_INTERNAL_BACKEND_SMART_AGENT_MODE=stub
GOALWEALTH_INTERNAL_BACKEND_NEWS_BASE_URL=$GW_NEWS_BASE_URL
EOF

cat > "$APP_DIR/adapter.env" <<EOF
PYTHONPATH=$APP_DIR/goalwealth/src
GOALWEALTH_ADAPTER_ENV=$GW_ENV
GOALWEALTH_ADAPTER_HOST=0.0.0.0
GOALWEALTH_ADAPTER_PORT=$GW_ADAPTER_PORT
GOALWEALTH_ADAPTER_ENABLE_DOCS=$GW_ENABLE_DOCS
GOALWEALTH_ADAPTER_AUTH_OPTIONAL=true
GOALWEALTH_ADAPTER_ALLOW_DEV_TOKENS=true
GOALWEALTH_INTERNAL_API_BASE_URL=http://127.0.0.1:$GW_INTERNAL_BACKEND_PORT
GOALWEALTH_INTERNAL_API_BEARER_TOKEN=$GW_INTERNAL_BEARER_TOKEN
GOALWEALTH_INTERNAL_API_TIMEOUT_SECONDS=10
EOF

if [[ "${GW_ENABLE_OIDC:-false}" == "true" && -n "${GW_GOOGLE_CLIENT_ID:-}" ]]; then
  cat >> "$APP_DIR/adapter.env" <<EOF
GOALWEALTH_OIDC_ISSUER=https://accounts.google.com
GOALWEALTH_OIDC_AUDIENCE=$GW_GOOGLE_CLIENT_ID
GOALWEALTH_OIDC_JWKS_URL=https://www.googleapis.com/oauth2/v3/certs
GOALWEALTH_OIDC_TOKENINFO_URL=https://oauth2.googleapis.com/tokeninfo
GOALWEALTH_OIDC_TIMEOUT_SECONDS=10
EOF
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

curl -fsS "http://127.0.0.1:$GW_ADAPTER_PORT/v1/ocr/records/ocr-aws-001" \
  -H "Authorization: Bearer dev-token:user-123" > "$LOG_DIR/ocr-smoke.json"

cat <<EOF
[remote-bootstrap] completed
app_dir=$APP_DIR
internal_ready=$(cat /tmp/internal-ready.json 2>/dev/null || echo '{}')
adapter_ready=$(cat /tmp/adapter-ready.json 2>/dev/null || echo '{}')
chat_smoke=$LOG_DIR/chat-smoke.json
ocr_smoke=$LOG_DIR/ocr-smoke.json
internal_log=$LOG_DIR/internal-backend.log
adapter_log=$LOG_DIR/adapter.log
EOF
