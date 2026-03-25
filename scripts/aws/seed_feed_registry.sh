#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <stack-name> <region>"
  exit 1
fi

STACK_NAME="$1"
REGION="$2"
WORKDIR="$(cd "$(dirname "$0")/../.." && pwd)"
TABLE_NAME="$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='FeedRegistryTableName'].OutputValue" --output text)"
SAMPLE_FILE="$WORKDIR/infra/sample-feeds.json"
REQUEST_FILE="$WORKDIR/.build/feed-registry-batch.json"
mkdir -p "$WORKDIR/.build"

python3 - <<'PY' "$TABLE_NAME" "$SAMPLE_FILE" "$REQUEST_FILE"
import json
import sys
from pathlib import Path

table_name = sys.argv[1]
sample_file = Path(sys.argv[2])
request_file = Path(sys.argv[3])
feeds = json.loads(sample_file.read_text())
request_items = []
for feed in feeds:
    item = {
        "feed_id": {"S": feed["feed_id"]},
        "feed_url": {"S": feed["feed_url"]},
        "source_name": {"S": feed["source_name"]},
        "category": {"S": feed["category"]},
        "status": {"S": feed.get("status", "active")},
        "priority": {"N": str(feed.get("priority", 50))},
        "tags": {"L": [{"S": tag} for tag in feed.get("tags", [])]},
        "keywords": {"L": [{"S": kw} for kw in feed.get("keywords", [])]},
        "error_count": {"N": "0"}
    }
    request_items.append({"PutRequest": {"Item": item}})
request_file.write_text(json.dumps({table_name: request_items}, indent=2))
print(request_file)
PY

aws dynamodb batch-write-item \
  --region "$REGION" \
  --request-items "file://$REQUEST_FILE"

echo "Seeded sample feeds into $TABLE_NAME"
