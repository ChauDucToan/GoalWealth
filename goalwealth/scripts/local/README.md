# GoalWealth Local Test Scripts

## Files
- `test_orchestrator_clients.py` - CLI smoke test for memory/OCR/smart-agent/full flow
- `run_orchestrator_demo.sh` - shell wrapper for easier execution

## Required env
At minimum:

```bash
export GOALWEALTH_INTERNAL_API_BASE_URL="https://your-internal-api.example.com"
```

Optional:

```bash
export GOALWEALTH_INTERNAL_API_BEARER_TOKEN="..."
export GOALWEALTH_INTERNAL_API_TIMEOUT_SECONDS="10"
export GOALWEALTH_INTERNAL_API_USER_AGENT="GoalWealthSmokeTest/1.0"
```

## Example commands

### Memory only
```bash
bash goalwealth/scripts/local/run_orchestrator_demo.sh memory \
  --user-id user-123 \
  --include-sections user_profile goals risk_profile \
  --ocr-summary-limit 5
```

### OCR only
```bash
bash goalwealth/scripts/local/run_orchestrator_demo.sh ocr \
  --user-id user-123 \
  --ocr-record-id ocr-123
```

### Smart agent only
```bash
bash goalwealth/scripts/local/run_orchestrator_demo.sh smart-agent \
  --query "tin AI mới nhất hôm nay" \
  --user-id user-123 \
  --top-k 5 \
  --freshness-threshold-minutes 180 \
  --locale vi-VN \
  --timezone Asia/Ho_Chi_Minh
```

### Full flow
```bash
bash goalwealth/scripts/local/run_orchestrator_demo.sh full \
  --user-id user-123 \
  --ocr-record-id ocr-123 \
  --query "tin AI mới nhất hôm nay" \
  --include-sections user_profile goals risk_profile conversation_summary \
  --ocr-summary-limit 5 \
  --top-k 5 \
  --freshness-threshold-minutes 180 \
  --locale vi-VN \
  --timezone Asia/Ho_Chi_Minh
```

## Exit codes
- `0` = success
- `2` = one or more calls failed or the full flow summary is not healthy
