#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<EOF
Usage: $0 <env-file>

Example:
  bash goalwealth/scripts/aws/deploy_goalwealth_all_in_one.sh goalwealth/scripts/aws/goalwealth.aws.env
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

ENV_FILE="$1"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GOALWEALTH_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
WORKSPACE_ROOT="$(cd "$GOALWEALTH_DIR/.." && pwd)"
REMOTE_BOOTSTRAP="$SCRIPT_DIR/remote_bootstrap_goalwealth_runtime.sh"

# shellcheck source=/dev/null
source "$ENV_FILE"

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required env var: $name" >&2
    exit 1
  fi
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    exit 1
  fi
}

require_cmd aws
require_cmd ssh
require_cmd scp
require_cmd python3
require_cmd tar

require_var AWS_REGION
require_var GW_ENV
require_var GW_STACK_NAME
require_var GW_ARTIFACT_BUCKET
require_var GW_RUNTIME_NAME
require_var GW_SUBNET_ID
require_var GW_SG_ID
require_var GW_KEY_NAME
require_var GW_SSH_KEY_PATH
require_var GW_INSTANCE_PROFILE
require_var GW_INSTANCE_TYPE
require_var GW_EC2_USER
require_var GW_INTERNAL_BEARER_TOKEN
require_var GW_ADAPTER_PORT
require_var GW_INTERNAL_BACKEND_PORT
require_var GW_ENABLE_DOCS
require_var GW_REMOTE_APP_DIR
require_var GW_NEWS_BASE_URL

if [[ ! -f "$GW_SSH_KEY_PATH" ]]; then
  echo "SSH key file not found: $GW_SSH_KEY_PATH" >&2
  exit 1
fi

SSH_OPTS=(
  -F /dev/null
  -o StrictHostKeyChecking=no
  -o UserKnownHostsFile=/dev/null
  -o ConnectTimeout=10
  -o IdentitiesOnly=yes
  -i "$GW_SSH_KEY_PATH"
)

extract_json_field() {
  local field="$1"
  python3 -c '
import json, sys

field = sys.argv[1]
raw = sys.stdin.read()
if not raw.strip():
    sys.exit(0)

data = json.loads(raw)
value = data.get(field, "")
print("" if value is None else value)
' "$field"
}

log() {
  printf '[goalwealth-all-in-one] %s\n' "$*" >&2
}

if [[ "${GW_DEPLOY_SAM:-true}" == "true" ]]; then
  log "deploying/updating AWS SAM stack"
  bash "$SCRIPT_DIR/package_and_deploy.sh" \
    "$GW_ARTIFACT_BUCKET" \
    "$GW_STACK_NAME" \
    "$AWS_REGION" \
    "$GW_ENV"
else
  log "skipping SAM deployment because GW_DEPLOY_SAM=${GW_DEPLOY_SAM:-false}"
fi

INSTANCE_ID="${GW_EXISTING_INSTANCE_ID:-}"
GW_EC2_PUBLIC_IP="${GW_EC2_PUBLIC_IP:-}"
GW_EC2_PRIVATE_IP="${GW_EC2_PRIVATE_IP:-}"

if [[ -z "$INSTANCE_ID" ]]; then
  log "launching new EC2 runtime instance"
  LAUNCH_JSON="$(bash "$SCRIPT_DIR/launch_goalwealth_runtime_ec2.sh" \
    "$GW_RUNTIME_NAME" \
    "$AWS_REGION" \
    "$GW_SUBNET_ID" \
    "$GW_SG_ID" \
    "$GW_KEY_NAME" \
    "$GW_INSTANCE_PROFILE" \
    "$GW_INSTANCE_TYPE")"

  INSTANCE_ID="$(printf '%s' "$LAUNCH_JSON" | extract_json_field InstanceId)"
  GW_EC2_PUBLIC_IP="$(printf '%s' "$LAUNCH_JSON" | extract_json_field PublicIp)"
  GW_EC2_PRIVATE_IP="$(printf '%s' "$LAUNCH_JSON" | extract_json_field PrivateIp)"

  if [[ -z "$INSTANCE_ID" ]]; then
    echo "Failed to parse InstanceId from launch output" >&2
    exit 1
  fi

  log "waiting for EC2 instance to become running: $INSTANCE_ID"
  aws ec2 wait instance-running --region "$AWS_REGION" --instance-ids "$INSTANCE_ID"
  aws ec2 wait instance-status-ok --region "$AWS_REGION" --instance-ids "$INSTANCE_ID"

  DESCRIBE_JSON="$(aws ec2 describe-instances \
    --region "$AWS_REGION" \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].{PublicIp:PublicIpAddress,PrivateIp:PrivateIpAddress}' \
    --output json)"
  GW_EC2_PUBLIC_IP="$(printf '%s' "$DESCRIBE_JSON" | extract_json_field PublicIp)"
  GW_EC2_PRIVATE_IP="$(printf '%s' "$DESCRIBE_JSON" | extract_json_field PrivateIp)"
else
  log "reusing existing EC2 instance: $INSTANCE_ID"
  if [[ -z "$GW_EC2_PUBLIC_IP" ]]; then
    DESCRIBE_JSON="$(aws ec2 describe-instances \
      --region "$AWS_REGION" \
      --instance-ids "$INSTANCE_ID" \
      --query 'Reservations[0].Instances[0].{PublicIp:PublicIpAddress,PrivateIp:PrivateIpAddress}' \
      --output json)"
    GW_EC2_PUBLIC_IP="$(printf '%s' "$DESCRIBE_JSON" | extract_json_field PublicIp)"
    GW_EC2_PRIVATE_IP="$(printf '%s' "$DESCRIBE_JSON" | extract_json_field PrivateIp)"
  fi
fi

if [[ -z "$GW_EC2_PUBLIC_IP" ]]; then
  echo "Could not determine EC2 public IP for instance: $INSTANCE_ID" >&2
  exit 1
fi

REMOTE_HOST="${GW_EC2_USER}@${GW_EC2_PUBLIC_IP}"
log "waiting for SSH on $REMOTE_HOST"
SSH_READY="false"
LAST_SSH_ERROR=""
for _ in $(seq 1 40); do
  LAST_SSH_ERROR="$(ssh "${SSH_OPTS[@]}" "$REMOTE_HOST" 'echo ssh-ready' 2>&1)" && {
    SSH_READY="true"
    break
  }
  if [[ "$LAST_SSH_ERROR" == *"Permission denied"* ]]; then
    break
  fi
  sleep 10
done

if [[ "$SSH_READY" != "true" ]]; then
  echo "SSH did not become ready for $REMOTE_HOST" >&2
  if [[ -n "$LAST_SSH_ERROR" ]]; then
    printf '%s\n' "$LAST_SSH_ERROR" >&2
  fi
  exit 1
fi

ARCHIVE_PATH="$(mktemp /tmp/goalwealth-workspace.XXXXXX.tgz)"
trap 'rm -f "$ARCHIVE_PATH"' EXIT

log "packing local workspace subset for remote bootstrap"
ARCHIVE_INPUTS=(goalwealth)
if [[ -d "$WORKSPACE_ROOT/aws/aws-guide" ]]; then
  ARCHIVE_INPUTS+=(aws/aws-guide)
elif [[ -d "$WORKSPACE_ROOT/aws-guide" ]]; then
  ARCHIVE_INPUTS+=(aws-guide)
fi

tar czf "$ARCHIVE_PATH" -C "$WORKSPACE_ROOT" "${ARCHIVE_INPUTS[@]}"

REMOTE_ARCHIVE="/tmp/goalwealth-workspace.tgz"
REMOTE_SCRIPT="/tmp/remote_bootstrap_goalwealth_runtime.sh"

log "uploading workspace archive and remote bootstrap script"
scp "${SSH_OPTS[@]}" "$ARCHIVE_PATH" "$REMOTE_HOST:$REMOTE_ARCHIVE"
scp "${SSH_OPTS[@]}" "$REMOTE_BOOTSTRAP" "$REMOTE_HOST:$REMOTE_SCRIPT"

log "running remote bootstrap"
ssh "${SSH_OPTS[@]}" "$REMOTE_HOST" \
  GW_REMOTE_SRC_ARCHIVE="$REMOTE_ARCHIVE" \
  GW_REMOTE_APP_DIR="$GW_REMOTE_APP_DIR" \
  GW_INTERNAL_BEARER_TOKEN="$GW_INTERNAL_BEARER_TOKEN" \
  GW_ENV="$GW_ENV" \
  GW_ADAPTER_PORT="$GW_ADAPTER_PORT" \
  GW_INTERNAL_BACKEND_PORT="$GW_INTERNAL_BACKEND_PORT" \
  GW_ENABLE_DOCS="$GW_ENABLE_DOCS" \
  GW_NEWS_BASE_URL="$GW_NEWS_BASE_URL" \
  GW_ENABLE_OIDC="${GW_ENABLE_OIDC:-false}" \
  GW_GOOGLE_CLIENT_ID="${GW_GOOGLE_CLIENT_ID:-}" \
  GW_INSTALL_OPENCLAW="${GW_INSTALL_OPENCLAW:-false}" \
  GW_OPENCLAW_NPM_PACKAGE="${GW_OPENCLAW_NPM_PACKAGE:-openclaw}" \
  'bash /tmp/remote_bootstrap_goalwealth_runtime.sh'

log "running final smoke tests from remote host"
ssh "${SSH_OPTS[@]}" "$REMOTE_HOST" "curl -fsS http://127.0.0.1:${GW_INTERNAL_BACKEND_PORT}/ready >/tmp/gw-internal-ready.json && curl -fsS http://127.0.0.1:${GW_ADAPTER_PORT}/ready >/tmp/gw-adapter-ready.json && curl -fsS -X POST http://127.0.0.1:${GW_ADAPTER_PORT}/v1/chat/respond -H 'Authorization: Bearer dev-token:user-123' -H 'Content-Type: application/json' -d '{\"message\":\"Tin AI mới nhất hôm nay là gì?\",\"timezone\":\"Asia/Ho_Chi_Minh\"}' >/tmp/gw-chat.json && printf 'internal_ready=%s\n' \"$(cat /tmp/gw-internal-ready.json)\" && printf 'adapter_ready=%s\n' \"$(cat /tmp/gw-adapter-ready.json)\" && printf 'chat=%s\n' \"$(cat /tmp/gw-chat.json)\""

cat <<EOF

[goalwealth-all-in-one] completed successfully
instance_id=$INSTANCE_ID
public_ip=$GW_EC2_PUBLIC_IP
private_ip=$GW_EC2_PRIVATE_IP
remote_host=$REMOTE_HOST
adapter_base_url=http://$GW_EC2_PUBLIC_IP:$GW_ADAPTER_PORT
internal_stub_loopback=http://127.0.0.1:$GW_INTERNAL_BACKEND_PORT
next_test:
  curl -s -X POST "http://$GW_EC2_PUBLIC_IP:$GW_ADAPTER_PORT/v1/chat/respond" \
    -H "Authorization: Bearer dev-token:user-123" \
    -H "Content-Type: application/json" \
    -d '{"message":"Tin AI mới nhất hôm nay là gì?","timezone":"Asia/Ho_Chi_Minh"}'
EOF
