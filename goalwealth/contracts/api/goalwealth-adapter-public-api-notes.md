# GoalWealth Adapter Public API - Notes

## Files
- `goalwealth/contracts/api/goalwealth-adapter-public-api.openapi.yaml`

## Purpose
This contract is for the **frontend-facing adapter API**.

It is intentionally separate from the internal backend contract:
- `goalwealth/contracts/api/openclaw-backend-api.openapi.yaml`

Reason:
- public adapter API = frontend talks here
- internal backend API = adapter/orchestrator talks here

## Current public routes covered
- `GET /`
- `GET /health`
- `GET /ready`
- `POST /v1/chat/respond`
- `POST /v1/ocr/ingress`
- `GET /v1/ocr/records/{ocr_record_id}`

## Auth model in this contract
- production target: Google OIDC Bearer token
- current dev mode: `dev-token:<user_id>` also supported

## Response model
All public routes use the normalized outer envelope:

```json
{
  "ok": true,
  "data": {},
  "error": null,
  "meta": {
    "request_id": "req-123"
  },
  "warnings": []
}
```

## Important implementation notes

### Chat route
The chat route is already useful for frontend integration, but the orchestration path may still:
- use placeholder responses
- degrade softly when memory/smart-agent/OpenClaw is not fully available
- expose extra context diagnostics inside `data.used_context` so frontend/dev tools can see whether memory or smart-agent were loaded, skipped, or unavailable

This means frontend should:
- read `data.reply`
- keep `data.session_id`
- surface `warnings` softly
- not assume every warning means a fatal UI error

### OCR ingress
OCR ingress is minimal by design:

```json
{
  "raw_text": "..."
}
```

Frontend should not send parsed OCR fields here.

### OCR record states
Current OCR record statuses are:
- `pending_user_context`
- `pending_backend`
- `ready`

Frontend should treat `pending_*` as non-fatal/polling states.

## Suggested next use
Use this file as the contract frontend should implement against now.
When the user sends frontend source later, compare its network layer against this contract first.
