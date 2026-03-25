# GoalWealth Google OIDC Setup Guide

This guide is the next practical step for GoalWealth login-first integration.

It assumes the current architecture decisions are already in place:
- Google OIDC first for MVP
- adapter API is the only public backend entry point
- OpenClaw is orchestration only
- product memory must remain external and structured
- production runtime must not use local markdown memory files

---

## 1. What we are setting up

Goal:
- frontend signs users in with Google
- frontend sends a Bearer token to the GoalWealth adapter
- adapter verifies the token
- adapter maps Google identity -> GoalWealth user context

High-level flow:

```text
User
-> Sign in with Google
-> frontend receives Google token
-> frontend calls GoalWealth adapter with Authorization: Bearer <token>
-> adapter verifies issuer/audience/expiry/sub
-> adapter uses Google sub as stable external user identity
```

---

## 2. Recommended identity model

Use Google `sub` as the canonical external identity.

Suggested mapping:
- `google_sub` -> `user_id_external`
- later backend may map `user_id_external` -> internal `user_id`

Do not use email as the primary durable identity key.

Reason:
- `sub` is stable
- email can change
- `sub` is the correct OIDC subject identifier

---

## 3. Frontend setup strategy

## Current dev mode
Before real Google login is wired, frontend may use:

```text
dev-token:<user_id>
```

Example:

```text
dev-token:user-123
```

This is useful for frontend development against the adapter while Google Console setup is still in progress.

## Real auth target
Frontend should send:

```http
Authorization: Bearer <google_id_token>
```

At the current implementation stage, the adapter verifies Google tokens using the Google `tokeninfo` endpoint as a practical bridge step.
Later this should be upgraded to local JWT/JWKS verification.

---

## 4. Google Cloud Console steps

## Step 1: create/select a Google Cloud project
Create a dedicated project for GoalWealth auth, or use a dedicated auth project already under your control.

## Step 2: configure OAuth consent screen
Set up the consent screen with:
- app name: GoalWealth
- support email
- developer contact email

For MVP/dev, test mode is fine.

## Step 3: create OAuth client(s)
Create the client type that matches your frontend.

Possible cases:
- Web app
- Android
- iOS
- Desktop

If your frontend is web-first, start with a **Web application** client.

## Step 4: copy the client ID
You will need this value for the adapter environment:

```bash
GOALWEALTH_OIDC_AUDIENCE=<google-client-id>
```

## Step 5: if using web redirect flow
Add your dev/prod redirect URIs.

Examples:
- `http://localhost:3000`
- `http://localhost:5173`
- `https://app.goalwealth.example.com`

Exact frontend framework determines the final redirect URI shape.

---

## 5. Adapter environment values for Google OIDC

Set these for the adapter:

```bash
export GOALWEALTH_OIDC_ISSUER="https://accounts.google.com"
export GOALWEALTH_OIDC_AUDIENCE="<google-client-id>"
export GOALWEALTH_OIDC_JWKS_URL="https://www.googleapis.com/oauth2/v3/certs"
export GOALWEALTH_OIDC_TOKENINFO_URL="https://oauth2.googleapis.com/tokeninfo"
export GOALWEALTH_OIDC_TIMEOUT_SECONDS="10"
```

### Notes
- `GOALWEALTH_OIDC_AUDIENCE` should match the frontend's Google client id.
- Current adapter implementation uses `tokeninfo`.
- `JWKS_URL` is still worth storing now because later we should move to local JWT/JWKS verification.

---

## 6. Current adapter verification behavior

Current implementation in `goalwealth/src/adapter_api/services/auth_service.py`:
- accepts `dev-token:<user_id>` in dev mode
- otherwise calls Google `tokeninfo`
- verifies:
  - issuer (`iss`)
  - audience (`aud`)
  - expiry (`exp`)
  - subject (`sub`)
- maps `sub` -> `user_id`

### Important limitation
This is a practical bridge step, not the final production auth design.

Production target later:
- verify JWT locally
- fetch Google JWKS
- validate signature without relying on tokeninfo per request

---

## 7. Frontend request pattern

## Chat request
```http
POST /v1/chat/respond
Authorization: Bearer <google-id-token>
Content-Type: application/json
```

Body:
```json
{
  "message": "Tôi nên ưu tiên mục tiêu nào trước?",
  "session_id": "optional-session-id",
  "locale": "vi-VN",
  "attachments": []
}
```

## OCR ingress request
```http
POST /v1/ocr/ingress
Authorization: Bearer <google-id-token>
Content-Type: application/json
```

Body:
```json
{
  "raw_text": "..."
}
```

---

## 8. Backend user identity handling

Adapter should treat the verified Google identity like this:

```text
verified Google token
-> extract sub
-> current_user.user_id = sub
-> route uses user_id for memory/OCR/service lookup
```

Later, once PostgreSQL-backed user service exists:

```text
google sub
-> lookup/create GoalWealth user row
-> internal user id
```

---

## 9. What to store in AWS for auth/env config

## Short answer
Yes, use AWS-managed secret/config services.

### Recommended split
- **AWS Systems Manager Parameter Store**:
  - non-secret configuration
  - URLs
  - audience/client ids
  - feature flags
- **AWS Secrets Manager**:
  - secrets/tokens
  - adapter bearer tokens
  - OpenClaw gateway tokens
  - any future service credentials
- **AWS KMS**:
  - encryption layer underneath
  - protect Secrets Manager / SecureString values

## Important clarification
**KMS alone is not a config store.**

KMS is for encryption and key management.
It is not where you should directly manage app env values as your primary config system.

### Good practice
- store secret values in Secrets Manager
- store secure config in SSM Parameter Store (`SecureString`) when appropriate
- let KMS encrypt them

---

## 10. Suggested GoalWealth config storage model

### Store in Parameter Store
Examples:
- `/goalwealth/dev/adapter/oidc/issuer`
- `/goalwealth/dev/adapter/oidc/audience`
- `/goalwealth/dev/adapter/oidc/jwks_url`
- `/goalwealth/dev/adapter/openclaw/base_url`
- `/goalwealth/dev/adapter/openclaw/http_endpoint`

### Store in Secrets Manager
Examples:
- `/goalwealth/dev/adapter/openclaw/token`
- `/goalwealth/dev/internal_api/bearer_token`
- future DB/app secrets

### Use KMS for encryption
- customer-managed KMS key if you want tighter control/audit
- or AWS-managed key for simpler MVP

---

## 11. What I recommend for MVP

For MVP/dev:
- Parameter Store for mostly-static config
- Secrets Manager for actual secrets/tokens
- KMS backing those values

This is better than putting sensitive values directly into plain shell env files on the box.

### Practical tradeoff
You may still use `.env` / exported env vars during local development,
but on AWS runtime the cleaner path is:
- fetch from SSM / Secrets Manager
- inject into systemd/service environment at startup

---

## 12. Suggested next implementation after this guide

### Priority 1
Wire adapter deployment/runtime to read auth config from AWS-managed config/secrets.

### Priority 2
Finish frontend Google login flow.

### Priority 3
Upgrade adapter auth from Google `tokeninfo` verification to local JWT/JWKS verification.

---

## 13. Recommended next doc after this one

After login setup, the next useful artifact is:
- public adapter OpenAPI contract

That will give frontend and backend a formal interface contract after auth is clear.
