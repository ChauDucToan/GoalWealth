# Mizuki Batch Plan - SwinHackathon Frontend Integration (for LLM coding agents)

## Mission
Integrate `SwinHackathon/` with the GoalWealth adapter backend in **small, independently testable batches**.

Do not attempt a broad repo-wide refactor.
Do not replace working UX scaffolds unless the batch explicitly requires it.
Keep UI continuity high.

---

## Key repository facts observed

### Frontend stack
- Expo Router app
- React Native / Expo 54
- TypeScript
- Context + reducer state
- OCR already uses ML Kit locally in `app/(finance)/smart-budgeting/receipt-scan.tsx`

### Existing auth shape
- `app/(auth)/signIn.tsx` calls `services/oauth2.ts`
- `services/oauth2.ts` uses OAuth2 password flow against env-defined endpoints
- `.env.example` currently includes `EXPO_PUBLIC_OAUTH_CLIENT_SECRET`
- `signIn.tsx` still exposes `Go Home (Test)` bypass
- auth token currently lives in reducer memory only

### Existing assistant shape
- `app/(tabs)/assistant.tsx` is inbox/launcher UI
- `app/(assistant)/chat/[scenario].tsx` is the main thread UI
- `context/assistantContext.tsx` still implements mock-only send behavior
- no real `/v1/chat/respond` client exists yet

### Existing OCR shape
- receipt import starts in `app/(finance)/smart-budgeting/add-spending.tsx`
- OCR scan/review happens in `app/(finance)/smart-budgeting/receipt-scan.tsx`
- local OCR output is already reduced to `raw_text`
- this aligns well with GoalWealth adapter OCR ingress contract `{ raw_text }`

### GoalWealth adapter assumptions
- public adapter routes include:
  - `POST /v1/chat/respond`
  - `POST /v1/ocr/ingress`
  - `GET /v1/ocr/records/{ocr_record_id}`
- outer response envelope is:
  - `{ ok, data, error, meta, warnings }`
- chat request currently supports:
  - `message`
  - `session_id`
  - `locale`
  - `timezone`
  - `attachments`
- OCR ingress contract is raw-text-first
- adapter auth direction is Google OIDC-first, not password-grant-first

---

## Global invariants

1. Do not remove current mock/demo UX until the new live path works.
2. Keep each batch shippable on its own.
3. Prefer additive changes over destructive rewrites.
4. Keep network logic out of screen components when possible.
5. Use a single API client layer, not per-screen `fetch()` copies.
6. Do not keep public mobile client secrets in `EXPO_PUBLIC_*` configuration.
7. Keep OCR business normalization on backend side; frontend should stay close to `raw_text` + review UX.
8. Preserve existing route behavior unless the batch explicitly changes navigation.
9. Do not refactor unrelated route groups in the same batch.
10. Every batch should end with a short manual verification checklist.

---

## Non-goals

- Do not redesign the visual system.
- Do not migrate all Context state to another state manager.
- Do not rewrite the app around a different navigator.
- Do not implement full backend domain logic in frontend.
- Do not expand OCR parsing heuristics in frontend unless the batch specifically requires minimal review helpers.

---

# Batch 1 - Networking foundation

## Goal
Create a reusable frontend integration layer for GoalWealth adapter calls.

## Why this batch exists
Without this layer, auth/chat/OCR integrations will diverge and become inconsistent.

## Expected deliverables
Create a small API module set, e.g.:
- `services/api/config.ts`
- `services/api/http.ts`
- `services/api/types.ts`
- `services/api/errors.ts`
- `services/api/chat.ts`
- `services/api/ocr.ts`

Names may vary, but responsibilities must remain separated.

## Required behaviors
- read adapter base URL from env
- normalize request headers
- attach `Authorization` if token exists
- parse GoalWealth response envelope consistently
- surface `warnings` and `meta` without losing them
- throw/return typed errors for `ok: false`
- keep timeout and JSON parsing in one place

## Env additions expected
Likely add values such as:
- `EXPO_PUBLIC_GOALWEALTH_API_BASE_URL`
- maybe optional feature flags for mock/live mode

## Acceptance criteria
- one shared HTTP utility exists
- one shared typed envelope parser exists
- assistant and OCR services can import from this layer
- no new screen should call raw `fetch()` directly for GoalWealth adapter access

## Manual verification
- invalid base URL shows a controlled error
- valid mock/dev URL returns parsed envelope
- headers are attached in one place only

---

# Batch 2 - Auth correction and session bootstrap

## Goal
Move auth closer to GoalWealth’s real architecture.

## Main problem
Current implementation is centered on OAuth2 password grant from the mobile app and exposes a public client secret pattern through env scaffolding. This should not remain the long-term path.

## Required direction
Implement in two layers if needed:

### Layer A: safe bridge for local/dev
- preserve sign-in capability for development
- keep UI working
- centralize auth/session lifecycle

### Layer B: production-oriented path
- move toward Google OIDC/mobile-safe sign-in
- remove dependency on password grant as the main path
- ensure mobile client does not rely on `EXPO_PUBLIC_OAUTH_CLIENT_SECRET`

## Likely files to touch
- `.env.example`
- `services/oauth2.ts` or replacement auth service(s)
- `app/(auth)/signIn.tsx`
- `context/user.reducer.ts`
- `context/user.types.ts`
- possibly add secure storage helpers

## Strong recommendations
- add `expo-secure-store` if persistent token storage is needed
- keep reducer state as session view-model, not the only persistence location
- gate `Go Home (Test)` behind an explicit dev feature flag or remove it from normal flow
- do not map `zoneinfo` to `currency` unless there is a real business reason

## Acceptance criteria
- auth flow no longer depends on public client secret pattern
- sign-in state can be restored or intentionally cleared in a controlled way
- sign-out clears memory + storage consistently
- the app can run in dev mode without misleading production auth semantics

## Manual verification
- app restart behavior is deterministic
- auth failure is rendered cleanly
- test bypass is either removed or clearly guarded by dev-only configuration

---

# Batch 3 - Live assistant chat integration

## Goal
Replace mock-only assistant send behavior with a real adapter-backed path while preserving current UI.

## Current state to preserve
- `app/(tabs)/assistant.tsx` as assistant inbox / launcher
- `app/(assistant)/chat/[scenario].tsx` as the main thread surface
- scenario cards can remain as seed/demo thread entry points

## Required changes
Introduce a real assistant service layer that calls:
- `POST /v1/chat/respond`

Request should support at least:
- `message`
- `session_id`
- `timezone`
- maybe `locale`
- maybe `attachments` later

## Required state changes
Add or formalize thread runtime state for:
- active session id
- sending flag
- request error
- retry state
- warnings/diagnostics if needed in dev

## Likely files to touch
- `context/assistantContext.tsx`
- `hooks/use-assistant.tsx`
- `app/(assistant)/chat/[scenario].tsx`
- maybe `components/assistant/*`
- new `services/api/chat.ts`

## Implementation guidance
- do not mix mock scenario seed data with live transport logic in the same function
- preserve scenario threads as initial prompt presets or fallback content
- keep optimistic UI minimal and safe
- if there is no live session yet, create/store one from first successful response
- keep adapter warnings available for debugging

## Acceptance criteria
- user message results in a real backend call
- assistant reply renders from backend data
- session id persists per active live thread
- mock reply is no longer hardcoded as the default live behavior

## Manual verification
- first message creates/uses a session id
- second message continues same session id
- network error shows controlled UI
- warnings do not break rendering

---

# Batch 4 - OCR ingress + record view integration

## Goal
Use existing local OCR to feed the GoalWealth backend instead of overgrowing frontend-only receipt intelligence.

## Important architectural rule
Frontend OCR should stop near `raw_text`.
Backend should own normalization and structured interpretation.

## Existing advantages
`app/(finance)/smart-budgeting/receipt-scan.tsx` already:
- imports an image
- runs ML Kit OCR locally
- stores `ocrRawText`
- tracks status and errors

This is already a good foundation.

## Required live path
1. local OCR produces `raw_text`
2. frontend calls `POST /v1/ocr/ingress`
3. frontend stores returned `ocr_record_id`
4. frontend optionally fetches `GET /v1/ocr/records/{ocr_record_id}`
5. frontend maps backend diagnostics/status into UX

## States to support in UI
- accepted
- pending_user_context
- pending_backend
- ready
- local OCR error
- backend ingress error

## Likely files to touch
- `app/(finance)/smart-budgeting/receipt-scan.tsx`
- `components/smart-budgeting/receipt-import.ts`
- maybe `context/assistantContext.tsx` if receipt draft shape needs new ids/statuses
- new `services/api/ocr.ts`

## Important guidance
- do not move more parsing heuristics into frontend than necessary
- do not block the current spending review UX while backend is still best-effort
- keep local OCR and backend OCR states distinct
- if backend record is not ready, show graceful pending state instead of failing the screen

## Acceptance criteria
- OCR ingress sends `{ raw_text }`
- `ocr_record_id` is captured and stored
- record polling/fetch is optional but structured
- spending review still works even if backend is not fully ready

## Manual verification
- image receipt -> local OCR success -> backend ingress success
- missing auth/user context returns a visible but non-fatal state
- backend unavailable returns a controlled warning

---

# Batch 5 - Receipt flow consolidation

## Goal
Remove conceptual duplication between assistant receipt entry points and the real finance receipt flow.

## Current state
- `app/(assistant)/receipt-upload.tsx` redirects
- `app/(assistant)/receipt-scan.tsx` redirects
- real receipt handling lives in finance smart-budgeting routes

## Required outcome
Define one canonical receipt flow and use assistant routes only as launchers/deep-links.

## Expected work
- document a single source-of-truth flow
- make return targets explicit
- decide whether receipt completion returns to:
  - assistant thread
  - spending draft
  - or a route-dependent destination

## Acceptance criteria
- assistant receipt routes are intentional launchers, not confusing shadow flows
- return navigation is deterministic
- no duplicate receipt business logic exists in assistant route group

---

# Batch 6 - Hardening and cleanup

## Goal
Make integrated mode safe and repeatable.

## Expected work
- formalize env documentation
- add feature flags for mock/live modes
- improve timeout/offline messaging
- remove misleading public secret config
- audit screens that still present mock data as if it were live
- ensure debug-only diagnostics do not leak into normal UX unintentionally

## Acceptance criteria
- app can run in either mock mode or integrated dev mode intentionally
- feature flags are explicit
- docs explain required env clearly
- test bypasses are controlled

---

## Recommended execution order
1. Batch 1
2. Batch 2
3. Batch 3
4. Batch 4
5. Batch 5
6. Batch 6

Reason:
- foundation first
- auth semantics second
- assistant live path third
- OCR live path fourth
- consolidation and cleanup last

---

## Definition of done for each batch
A batch is only done when all of the following are true:

1. code compiles/lints at the existing project quality bar
2. the main target flow is manually verified
3. the batch does not introduce ad-hoc `fetch()` duplication
4. changed state transitions are documented in comments or docs if non-obvious
5. the batch does not break unrelated route groups
6. fallback behavior is clear when backend/env is not ready

---

## Suggested commit style
Use one commit per batch, with messages like:
- `feat(frontend): add goalwealth adapter api client foundation`
- `refactor(auth): replace password-grant-first flow with adapter-safe session bootstrap`
- `feat(assistant): connect chat thread to goalwealth adapter`
- `feat(ocr): send local receipt raw_text to adapter ingress`
- `refactor(receipt): consolidate assistant launchers with finance receipt flow`

---

## Final instruction to future LLM agents
Do not start from Batch 3 because it looks exciting.
If Batch 1 is missing, create it first.
If auth is still semantically wrong, do not pretend the integration is production-like.
Prefer smaller safe diffs over sweeping rewrites.
