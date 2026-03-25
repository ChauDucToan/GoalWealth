#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <stack-name> <region> <query>"
  exit 1
fi

STACK_NAME="$1"
REGION="$2"
QUERY="$3"
FUNCTION_NAME="$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='SmartAgentFunctionName'].OutputValue" --output text)"
PAYLOAD_FILE="/tmp/goalwealth-smart-agent-payload.json"
OUTPUT_FILE="/tmp/goalwealth-smart-agent-response.json"

python3 - <<'PY' "$QUERY" "$PAYLOAD_FILE"
import json
import sys
from pathlib import Path

query = sys.argv[1]
out = Path(sys.argv[2])
out.write_text(json.dumps({"query": query}, ensure_ascii=False))
PY

aws lambda invoke \
  --region "$REGION" \
  --function-name "$FUNCTION_NAME" \
  --payload "fileb://$PAYLOAD_FILE" \
  "$OUTPUT_FILE" >/dev/null

cat "$OUTPUT_FILE"
