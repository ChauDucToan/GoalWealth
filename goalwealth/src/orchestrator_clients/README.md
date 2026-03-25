# GoalWealth Orchestrator Clients

These clients are the first contract-first integration layer for OpenClaw orchestration.

## Files
- `base.py`
- `memory_client.py`
- `ocr_client.py`
- `smart_agent_client.py`

## Environment-based factory
All clients inherit `BaseApiClient.from_env()`.

Default env prefix:
- `GOALWEALTH_INTERNAL_API_`

### Supported env vars
- `GOALWEALTH_INTERNAL_API_BASE_URL` (required)
- `GOALWEALTH_INTERNAL_API_BEARER_TOKEN` (optional)
- `GOALWEALTH_INTERNAL_API_TOKEN` (optional alias)
- `GOALWEALTH_INTERNAL_API_TIMEOUT_SECONDS` (optional, default `10`)
- `GOALWEALTH_INTERNAL_API_USER_AGENT` (optional)

## Usage examples

### 1. Memory client
```python
from orchestrator_clients import MemoryClient

client = MemoryClient.from_env()
view = client.get_user_view(
    "user-123",
    include_sections=["user_profile", "goals", "risk_profile"],
    ocr_summary_limit=5,
)
```

### 2. OCR client
```python
from orchestrator_clients import OcrClient

client = OcrClient.from_env()
ocr_view = client.get_openclaw_view("ocr-123", user_id="user-123")
```

### 3. Smart agent client
```python
from orchestrator_clients import SmartAgentClient

client = SmartAgentClient.from_env()
result = client.query(
    "tin AI mới nhất hôm nay",
    user_id="user-123",
    top_k=5,
    freshness_threshold_minutes=180,
    locale="vi-VN",
    timezone="Asia/Ho_Chi_Minh",
)
```

## Notes
- These clients intentionally use Python stdlib (`urllib`) for the first implementation.
- Runtime response validation is not added yet.
- Retries, tracing, and richer typed models can be layered on later.
