# GoalWealth Internal Backend Stub Guide

This guide explains how to run the new GoalWealth internal backend stub service so that:
- the adapter can resolve memory view
- the adapter can resolve OCR OpenClaw view
- the adapter can resolve Smart Agent query
- AWS end-to-end testing no longer blocks on `GOALWEALTH_INTERNAL_API_BASE_URL`

---

## 1. What this service is

The internal backend stub is a practical HTTP service that implements these internal contracts:
- `GET /v1/memory/users/{userId}/view`
- `GET /v1/ocr/records/{ocrRecordId}/openclaw-view?userId=...`
- `POST /v1/smart-agent/query`

Code location:
- `goalwealth/src/internal_backend_api/`

This is not the final production data backend.
It is a **contract-respecting internal stub** designed to unblock:
- AWS deployment wiring
- adapter end-to-end tests
- OpenClaw orchestration integration
- frontend/backend contract validation

---

## 2. Why we added it

Before this service existed, the adapter degraded with errors like:
- missing `GOALWEALTH_INTERNAL_API_BASE_URL`
- memory unavailable
- smart agent unavailable
- OCR view unavailable

Now we can point the adapter at a runnable internal service that returns practical structured payloads.

---

## 3. Runtime behavior

### Memory view
Returns a structured user memory view with:
- user profile
- active goals
- risk profile
- OCR summaries
- conversation summary

### OCR OpenClaw view
Returns an orchestration-safe OCR summary with:
- document type
- summary text
- confidence
- warnings
- normalized facts
- orchestration hint

### Smart Agent query
Returns a deterministic stub response with:
- route classification (`semantic_search`, `fresh_news`, `hybrid_search`)
- article-like results
- summary
- meta

---

## 4. Install dependencies

`goalwealth/src/requirements.txt` now includes:
- `fastapi`
- `uvicorn`

Install them in your runtime image/host environment.

Example:

```bash
pip install -r goalwealth/src/requirements.txt
```

---

## 5. Internal backend env

Recommended minimum:

```bash
export GOALWEALTH_INTERNAL_BACKEND_ENV=dev
export GOALWEALTH_INTERNAL_BACKEND_HOST=0.0.0.0
export GOALWEALTH_INTERNAL_BACKEND_PORT=8090
export GOALWEALTH_INTERNAL_BACKEND_ENABLE_DOCS=true
export GOALWEALTH_INTERNAL_BACKEND_AUTH_OPTIONAL=false
export GOALWEALTH_INTERNAL_BACKEND_BEARER_TOKEN="replace-me-in-aws"
export GOALWEALTH_INTERNAL_BACKEND_SMART_AGENT_MODE=stub
export GOALWEALTH_INTERNAL_BACKEND_NEWS_BASE_URL="https://news.goalwealth.example.com"
```

If you want zero-auth local smoke tests, you can temporarily set:

```bash
export GOALWEALTH_INTERNAL_BACKEND_AUTH_OPTIONAL=true
```

---

## 6. Run the service

From workspace root:

```bash
bash goalwealth/scripts/local/run_internal_backend_stub.sh
```

Default URL:

```text
http://127.0.0.1:8090
```

---

## 7. Point the adapter at this service

Set adapter/orchestrator client env like this:

```bash
export GOALWEALTH_INTERNAL_API_BASE_URL="http://127.0.0.1:8090"
export GOALWEALTH_INTERNAL_API_BEARER_TOKEN="replace-me-in-aws"
export GOALWEALTH_INTERNAL_API_TIMEOUT_SECONDS="10"
```

If adapter and internal service are deployed separately in AWS, replace the base URL with the internal service URL.

Example:

```bash
export GOALWEALTH_INTERNAL_API_BASE_URL="https://internal-api.goalwealth.example.internal"
```

---

## 8. Health checks

### Root
```bash
curl http://127.0.0.1:8090/
```

### Health
```bash
curl http://127.0.0.1:8090/health
```

### Ready
```bash
curl http://127.0.0.1:8090/ready
```

---

## 9. Example calls

### Memory view
```bash
curl -H "Authorization: Bearer replace-me-in-aws" \
  "http://127.0.0.1:8090/v1/memory/users/user-123/view?includeSections=user_profile,goals,risk_profile&ocrSummaryLimit=3"
```

### OCR OpenClaw view
```bash
curl -H "Authorization: Bearer replace-me-in-aws" \
  "http://127.0.0.1:8090/v1/ocr/records/ocr-123/openclaw-view?userId=user-123"
```

### Smart Agent query
```bash
curl -X POST \
  -H "Authorization: Bearer replace-me-in-aws" \
  -H "Content-Type: application/json" \
  "http://127.0.0.1:8090/v1/smart-agent/query" \
  -d '{
    "query": "tin AI mới nhất hôm nay",
    "user_id": "user-123",
    "top_k": 5,
    "locale": "vi-VN",
    "timezone": "Asia/Ho_Chi_Minh",
    "caller": "adapter_api"
  }'
```

---

## 10. AWS deployment model

Practical AWS options for this stub service:

### Option A - same EC2 host, separate port
- adapter on `:8080`
- internal backend stub on `:8090`
- `GOALWEALTH_INTERNAL_API_BASE_URL=http://127.0.0.1:8090`

This is the fastest path for dev/staging.

### Option B - separate internal service
- deploy internal backend stub on private ALB / App Runner / ECS / EC2
- adapter calls private internal URL

This is closer to long-term separation.

---

## 11. Known limitations

This is still a stub layer.
It does not yet:
- persist user memory in PostgreSQL
- persist OCR records across true ingestion lifecycle
- run real Smart Agent search over OpenSearch in this service
- replace the final domain backends

What it does do well:
- honor current contracts
- unblock adapter live calls
- provide practical structured responses
- make AWS end-to-end testing possible now

---

## 12. Recommended next step after deploying this

Once the stub service is reachable from adapter, re-run:
- adapter chat response
- adapter OCR ingress + OCR record fetch
- local orchestrator client smoke tests

Expected improvement:
- memory should move from `unavailable` -> `loaded`
- smart agent should move from `unavailable` -> `loaded` when query hints match
- OCR get record should move from `pending_backend` -> `ready` for normal IDs

That is the first real sign that GoalWealth has moved from skeleton-only to contract-wired end-to-end.
