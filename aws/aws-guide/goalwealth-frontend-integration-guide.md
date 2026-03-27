# GoalWealth Frontend Integration Guide v1

This guide explains how the frontend should connect to the GoalWealth Adapter API.

It reflects the current architecture decisions:
- Google OIDC first
- thin adapter API as the public entry point
- OpenClaw is orchestration only
- OpenClaw should not depend on local markdown memory in production
- OCR ingress is raw_text-only

---

## 1. High-level flow

```text
Frontend
-> Google login
-> receive token
-> call GoalWealth Adapter API with Bearer token
-> Adapter verifies token
-> Adapter attaches user context
-> Adapter calls OpenClaw / memory / smart-agent / OCR services
-> Adapter returns normalized JSON envelope
```

---

## 2. Auth strategy

## Target production auth
Frontend should use **Google OIDC**.

Recommended user-facing flow:
- user taps **Sign in with Google**
- frontend obtains Google identity token / auth result
- frontend sends Bearer token to GoalWealth Adapter API
- adapter verifies token using Google issuer and audience

### Current implementation note
At the current implementation stage, the adapter verifies Google ID tokens through Google's `tokeninfo` endpoint as a practical bridge step.
This is enough to wire frontend login early, but it is not the final production-grade verification design.
Later we should upgrade to local JWT/JWKS verification.

### Canonical identity
Use Google `sub` claim as the stable product-level external identity.

Suggested mapping:
- Google `sub` -> `user_id_external`
- backend may later map `user_id_external` -> internal GoalWealth `user_id`

---

## 3. Current dev-mode reality

At the current implementation stage, the adapter still supports a **dev token mode** for testing.

### Dev token format
```text
dev-token:<user_id>
```

Example:
```text
dev-token:user-123
```

This is useful before full Google OIDC verification is wired.

### Important
- Dev token mode is only for local/dev testing.
- Production should use real Google OIDC verification.

---

## 4. Adapter base URL

Frontend should talk only to the **adapter API**, not directly to OpenClaw.

Examples:
- local dev: `http://localhost:8080`
- internal dev: `http://<private-host>:8080`
- production: `https://api.goalwealth.example.com`

---

## 5. Common request headers

All authenticated frontend calls should send:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Optional but recommended:

```http
X-Request-Id: <uuid>
```

The adapter will echo `X-Request-Id` and also return it inside the response envelope metadata.

---

## 6. Response envelope used by adapter

The adapter now uses a normalized outer envelope:

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

### Error shape
```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "message is required",
    "details": {}
  },
  "meta": {
    "request_id": "req-123"
  },
  "warnings": []
}
```

### Frontend rule
Frontend should always check:
1. `ok`
2. `error`
3. `warnings`
4. then read `data`

---

## 7. Chat API

## Endpoint
```http
POST /v1/chat/respond
```

## Request body
```json
{
  "message": "Tôi nên ưu tiên mục tiêu nào trước?",
  "session_id": "optional-session-id",
  "locale": "vi-VN",
  "timezone": "Asia/Ho_Chi_Minh",
  "attachments": []
}
```

## Example request
```bash
curl -X POST "$GOALWEALTH_ADAPTER_BASE_URL/v1/chat/respond" \
  -H "Authorization: Bearer dev-token:user-123" \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: req-demo-001" \
  -d '{
    "message": "Tôi nên ưu tiên mục tiêu nào trước?",
    "session_id": "sess-001",
    "locale": "vi-VN",
    "timezone": "Asia/Ho_Chi_Minh",
    "attachments": []
  }'
```

## Example success response
```json
{
  "ok": true,
  "data": {
    "session_id": "sess-001",
    "reply": "Adapter chat skeleton đã nhận request và chuẩn bị payload cho OpenClaw...",
    "warnings": [
      "OpenClaw real orchestration chưa được nối ở bước này."
    ],
    "used_context": {
      "memory": false,
      "ocr_records": [],
      "smart_agent": false,
      "smart_agent_result_count": 0,
      "user_present": true
    },
    "meta": {
      "gateway": "orchestrator_placeholder",
      "environment": "dev"
    }
  },
  "error": null,
  "meta": {
    "request_id": "req-demo-001",
    "route": "chat.respond"
  },
  "warnings": [
    "OpenClaw real orchestration chưa được nối ở bước này."
  ]
}
```

## Frontend handling notes
- Show `data.reply` as the assistant message.
- If `warnings` is non-empty, log it for dev/debug and optionally surface a soft UI hint.
- Persist `data.session_id` and send it back on later chat turns.
- Send `timezone` when available so backend news/smart-agent context can align better with the user locale.

---

## 8. OCR ingress API

## Endpoint
```http
POST /v1/ocr/ingress
```

## OCR boundary
OCR ingress is intentionally minimal:

```json
{
  "raw_text": "..."
}
```

It does **not** accept or require:
- blocks
- confidence
- parsed fields
- validation results

Those belong to downstream normalization/backend services.

## Example request
```bash
curl -X POST "$GOALWEALTH_ADAPTER_BASE_URL/v1/ocr/ingress" \
  -H "Authorization: Bearer dev-token:user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "raw_text": "Lương tháng này 25 triệu, chi phí 8 triệu"
  }'
```

## Example success response
```json
{
  "ok": true,
  "data": {
    "ocr_record_id": "ocr-abc123",
    "status": "accepted",
    "message": "OCR ingress skeleton accepted the raw_text payload. Downstream normalization service is not wired yet.",
    "meta": {
      "user_id": "user-123",
      "raw_text_length": 38,
      "forwarded": false,
      "environment": "dev"
    }
  },
  "error": null,
  "meta": {
    "request_id": "req-ocr-001",
    "route": "ocr.ingest"
  },
  "warnings": []
}
```

## Frontend handling notes
- Store `data.ocr_record_id`
- Poll the OCR record endpoint later if needed
- Do not assume OCR normalization has already happened when `status=accepted`

---

## 9. OCR record API

## Endpoint
```http
GET /v1/ocr/records/{ocr_record_id}
```

## Example request
```bash
curl "$GOALWEALTH_ADAPTER_BASE_URL/v1/ocr/records/ocr-abc123" \
  -H "Authorization: Bearer dev-token:user-123"
```

## Possible statuses
The adapter currently uses best-effort OCR result fetching.

### `pending_user_context`
No user context available yet.

### `pending_backend`
OCR backend / OCR OpenClaw view is not ready or not reachable.

### `ready`
OCR OpenClaw-safe result is available.

## Example pending response
```json
{
  "ok": true,
  "data": {
    "ocr_record_id": "ocr-abc123",
    "status": "pending_backend",
    "warnings": [
      "OCR view unavailable: ValueError - Missing required environment variable: GOALWEALTH_INTERNAL_API_BASE_URL"
    ],
    "data": {}
  },
  "error": null,
  "meta": {
    "request_id": "req-ocr-002",
    "route": "ocr.get_record"
  },
  "warnings": [
    "OCR view unavailable: ValueError - Missing required environment variable: GOALWEALTH_INTERNAL_API_BASE_URL"
  ]
}
```

## Frontend handling notes
- Treat `pending_*` statuses as non-fatal polling states.
- Only render parsed OCR content once `status=ready`.

---

## 10. Health endpoints

## Health
```http
GET /health
```

## Readiness
```http
GET /ready
```

These endpoints now use the same response envelope and are useful for frontend/dev environment smoke tests.

---

## 11. Frontend integration strategy by phase

## Phase A - immediate dev
- use adapter with `dev-token:<user_id>`
- call `/v1/chat/respond`
- call `/v1/ocr/ingress`
- treat warnings as expected during scaffolding

## Phase B - auth integration
- replace dev token with Google OIDC token
- adapter verifies Google token via Google tokeninfo endpoint
- frontend login becomes real user auth path
- later upgrade adapter auth from tokeninfo to local JWT/JWKS verification

## Phase C - full backend integration
- adapter pulls memory view from structured backend
- adapter reads OCR OpenClaw view
- adapter calls OpenClaw Gateway live
- frontend keeps the same public API shape

---

## 12. Recommended frontend contract assumptions

Frontend should assume:
- adapter is the only public backend entrypoint
- all routes return the normalized outer envelope
- auth is Bearer-based
- `session_id` should be persisted client-side for conversation continuity
- OCR ingress accepts `raw_text` only
- warnings are not necessarily fatal

Frontend should **not** assume:
- OpenClaw is directly reachable
- OCR normalization is synchronous
- Smart Agent is always available
- missing context means system failure

---

## 13. Best next backend step after this guide

Backend should next implement:
1. real Google OIDC verification in `auth_service.py`
2. stronger request/response schema enforcement
3. live OpenClaw Gateway path end-to-end
4. PostgreSQL-backed memory service

---

## 14. Files related to this guide
- `goalwealth/src/adapter_api/`
- `goalwealth/contracts/api/openclaw-backend-api.openapi.yaml`
- `goalwealth/contracts/ocr/ocr-ingress.schema.json`
- `goalwealth/contracts/ocr/ocr-openclaw-view.schema.json`
- `goalwealth/contracts/memory/memory-service-view.schema.json`
