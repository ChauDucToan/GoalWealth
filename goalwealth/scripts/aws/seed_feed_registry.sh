#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <stack-name> <region> [mode]"
  echo "Modes: upsert (default) | sync-inactive | sync-delete"
  exit 1
fi

STACK_NAME="$1"
REGION="$2"
MODE="${3:-upsert}"

case "$MODE" in
  upsert|sync-inactive|sync-delete)
    ;;
  *)
    echo "Invalid mode: $MODE"
    echo "Expected one of: upsert | sync-inactive | sync-delete"
    exit 1
    ;;
esac

WORKDIR="$(cd "$(dirname "$0")/../.." && pwd)"
BUILD_DIR="$WORKDIR/.build/feed-registry"
TABLE_NAME="$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='FeedRegistryTableName'].OutputValue" --output text)"
SAMPLE_FILE="$WORKDIR/infra/seeds/sample-feeds.json"
mkdir -p "$BUILD_DIR"
rm -f "$BUILD_DIR"/*.json "$BUILD_DIR"/*.txt

python3 - <<'PY' "$TABLE_NAME" "$SAMPLE_FILE" "$BUILD_DIR" "$REGION" "$MODE"
import json
import math
import subprocess
import sys
from pathlib import Path


def chunked(seq, size):
    for i in range(0, len(seq), size):
        yield seq[i:i + size]


def attr_string(value):
    return {"S": str(value)}


def attr_number(value):
    return {"N": str(value)}


def attr_list(values):
    return {"L": [{"S": str(v)} for v in values]}


def build_item(feed: dict):
    item = {
        "feed_id": attr_string(feed["feed_id"]),
        "feed_url": attr_string(feed["feed_url"]),
        "source_name": attr_string(feed["source_name"]),
        "category": attr_string(feed["category"]),
        "status": attr_string(feed.get("status", "active")),
        "priority": attr_number(feed.get("priority", 50)),
        "tags": attr_list(feed.get("tags", [])),
        "keywords": attr_list(feed.get("keywords", [])),
        "error_count": attr_number(0),
    }
    if "notes" in feed:
        item["notes"] = attr_string(feed["notes"])
    if "fetch_interval_minutes" in feed:
        item["fetch_interval_minutes"] = attr_number(feed["fetch_interval_minutes"])
    return item


def aws_json(cmd):
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


table_name = sys.argv[1]
sample_file = Path(sys.argv[2])
build_dir = Path(sys.argv[3])
region = sys.argv[4]
mode = sys.argv[5]
feeds = json.loads(sample_file.read_text())
feed_ids_in_file = {feed["feed_id"] for feed in feeds}

put_requests = [{"PutRequest": {"Item": build_item(feed)}} for feed in feeds]
for idx, chunk in enumerate(chunked(put_requests, 25), start=1):
    path = build_dir / f"upsert-{idx:03d}.json"
    path.write_text(json.dumps({table_name: chunk}, indent=2, ensure_ascii=False))

existing_feed_ids = set()
scan_cmd = [
    "aws", "dynamodb", "scan",
    "--region", region,
    "--table-name", table_name,
    "--projection-expression", "feed_id",
    "--output", "json",
]
last_key = None
while True:
    cmd = list(scan_cmd)
    if last_key:
        cmd.extend(["--exclusive-start-key", json.dumps(last_key)])
    response = aws_json(cmd)
    for item in response.get("Items", []):
        feed_id = item.get("feed_id", {}).get("S")
        if feed_id:
            existing_feed_ids.add(feed_id)
    last_key = response.get("LastEvaluatedKey")
    if not last_key:
        break

missing_ids = sorted(existing_feed_ids - feed_ids_in_file)
(build_dir / "missing-feed-ids.txt").write_text("\n".join(missing_ids))

if mode == "sync-delete" and missing_ids:
    delete_requests = [{"DeleteRequest": {"Key": {"feed_id": attr_string(feed_id)}}} for feed_id in missing_ids]
    for idx, chunk in enumerate(chunked(delete_requests, 25), start=1):
        path = build_dir / f"delete-{idx:03d}.json"
        path.write_text(json.dumps({table_name: chunk}, indent=2, ensure_ascii=False))
PY

run_batch_write_files() {
  local pattern="$1"
  shopt -s nullglob
  local files=("$BUILD_DIR"/$pattern)
  shopt -u nullglob
  for file in "${files[@]}"; do
    [[ -f "$file" ]] || continue
    echo "[seed] batch-write $(basename "$file")"
    aws dynamodb batch-write-item \
      --region "$REGION" \
      --request-items "file://$file" >/dev/null
  done
}

run_batch_write_files 'upsert-*.json'

MISSING_FILE="$BUILD_DIR/missing-feed-ids.txt"
MISSING_COUNT=0
if [[ -f "$MISSING_FILE" ]]; then
  MISSING_COUNT=$(grep -c . "$MISSING_FILE" || true)
fi

if [[ "$MODE" == "sync-inactive" && -f "$MISSING_FILE" ]]; then
  while IFS= read -r feed_id; do
    [[ -n "$feed_id" ]] || continue
    echo "[seed] marking inactive: $feed_id"
    aws dynamodb update-item \
      --region "$REGION" \
      --table-name "$TABLE_NAME" \
      --key "{\"feed_id\":{\"S\":\"$feed_id\"}}" \
      --update-expression "SET #st = :inactive" \
      --expression-attribute-names '{"#st":"status"}' \
      --expression-attribute-values '{":inactive":{"S":"inactive"}}' >/dev/null
  done < "$MISSING_FILE"
fi

if [[ "$MODE" == "sync-delete" ]]; then
  run_batch_write_files 'delete-*.json'
fi

echo "Seeded feeds into $TABLE_NAME"
echo "Mode: $MODE"
echo "Feeds in JSON: $(find "$BUILD_DIR" -maxdepth 1 -name 'upsert-*.json' -print0 | xargs -0 cat | grep -c 'PutRequest' || true)"
echo "Feeds present in DynamoDB but missing from JSON: $MISSING_COUNT"
if [[ "$MODE" == "upsert" && "$MISSING_COUNT" -gt 0 ]]; then
  echo "Note: missing feeds were left untouched. Use mode 'sync-inactive' or 'sync-delete' if you want reconciliation."
fi
