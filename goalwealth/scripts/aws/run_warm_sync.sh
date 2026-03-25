#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <stack-name> <region>"
  exit 1
fi

STACK_NAME="$1"
REGION="$2"
FUNCTION_NAME="$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='RssCrawlerFunctionName'].OutputValue" --output text)"
PAYLOAD_FILE="/tmp/goalwealth-warm-sync-payload.json"
OUTPUT_FILE="/tmp/goalwealth-warm-sync-response.json"

echo '{"mode":"warm_sync"}' > "$PAYLOAD_FILE"

aws lambda invoke \
  --region "$REGION" \
  --function-name "$FUNCTION_NAME" \
  --payload "fileb://$PAYLOAD_FILE" \
  "$OUTPUT_FILE" >/dev/null

cat "$OUTPUT_FILE"
