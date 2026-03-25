# Mizuki Final Frontend Handoff for GoalWealth

## Status of this document
This is the **final frontend handoff document** for the current GoalWealth direction.

Use this as the working source of truth for frontend-side decisions until backend contracts materially change.
After this document, the intended stance is:
- frontend direction is **temporarily frozen**
- backend remains the main moving part
- frontend should avoid inventing new architecture assumptions

This document is written so that:
- human frontend contributors can follow it
- LLM coding agents can use it directly
- future edits stay aligned with GoalWealth backend reality, not just proposal language or UI demo habits

---

# 1. Executive summary

If you only remember ten lines, remember these:

1. **Frontend talks only to the GoalWealth adapter public API.**
2. **Frontend does not call OpenClaw directly.**
3. **OpenClaw is orchestration-only, not a business-data source of truth.**
4. **Google OIDC-first is the intended auth direction.**
5. **Do not treat OAuth2 password grant + public client secret as target architecture.**
6. **OCR ingress from frontend is raw_text-first.**
7. **Frontend should not become the main OCR normalization engine.**
8. **Structured backend data is product truth; frontend state is mostly UX state.**
9. **Smart Agent / orchestration tools return JSON-shaped data; they do not own arbitrary frontend side effects.**
10. **When unsure, follow adapter contracts and architecture docs, not proposal-level infrastructure wording.**

---

# 2. Why this handoff exists

The current project state has three simultaneous realities:

## Reality A - the proposal vision
The proposal describes a broad product/system vision:
- agentic AI
- explainable recommendations
- backtesting
- OCR ingestion
- news monitoring
- AWS components such as API Gateway, Cognito/IAM, Textract, S3, Aurora/RDS, DynamoDB, OpenSearch

That vision is useful for direction.
It is **not enough** to drive frontend implementation details by itself.

## Reality B - the GoalWealth backend direction already chosen
The backend has already converged on a more specific architecture:
- adapter public API is the single frontend entry point
- Google OIDC-first for public/mobile auth direction
- OpenClaw as orchestration-only
- OCR ingress is raw_text-only at the frontend boundary
- structured backend services own normalization and product truth
- OpenClaw consumes structured views, not raw OCR text and not local markdown memory

## Reality C - the current SwinHackathon frontend repo
The frontend already contains:
- many UI flows
- assistant demo flows
- smart budgeting receipt flow
- auth scaffolding
- local OCR via ML Kit
- mock/state-heavy implementations

This repo is useful, but its current implementation contains assumptions that do not fully match GoalWealth backend direction.

This document exists to prevent the frontend from drifting further away.

---

# 3. Source-of-truth order

When there is a conflict, use this priority order.

## Priority 1 - adapter/public contract and current architecture docs
Prefer these first:
- `aws-guide/goalwealth-frontend-integration-guide.md`
- `aws-guide/goalwealth-google-oidc-setup-guide.md`
- `aws-guide/goalwealth-current-architecture-diagrams.md`
- `goalwealth/contracts/api/goalwealth-adapter-public-api.openapi.yaml`
- `goalwealth/contracts/api/goalwealth-adapter-public-api-notes.md`

## Priority 2 - backend implementation shape
Use these to understand runtime intent and data shape:
- `goalwealth/src/adapter_api/*`
- `goalwealth/src/orchestrator_clients/*`
- `goalwealth/contracts/ocr/*`
- `goalwealth/contracts/memory/*`

## Priority 3 - frontend handoff docs
Use these as interpretation guides for frontend execution:
- `SwinHackathon/docs/Mizuki-frontend-alignment-to-goalwealth-backend.md`
- `SwinHackathon/docs/Mizuki-batch-plan-frontend-llm.md`
- this file

## Priority 4 - proposal text
The proposal is vision, not final contract.
Do not let proposal wording override live backend contracts.

---

# 4. Current GoalWealth architecture truth the frontend must respect

## 4.1 Public entry point
The frontend should speak to exactly one public backend surface:
- the GoalWealth adapter API

Not to:
- OpenClaw directly
- memory service directly
- OCR service directly
- smart agent directly
- random AWS services directly

This matters because the adapter is where we normalize:
- auth verification
- request envelope
- context attachment
- orchestration entry
- graceful degradation behavior

---

## 4.2 OpenClaw role
OpenClaw is not the product database.
OpenClaw is not the frontend API.
OpenClaw is not the canonical memory store.

OpenClaw is:
- orchestration
- tool calling
- response synthesis
- session/context handling for orchestration

The frontend must not assume:
- that sending something to chat means it is durably stored as product truth
- that OpenClaw owns raw OCR records
- that OpenClaw should be asked for low-level business entities directly

---

## 4.3 Product truth vs UX state
This is one of the most important distinctions.

### Product truth belongs in backend structured systems
Examples:
- user identity
- goals
- risk profile / suitability facts
- OCR normalized records
- memory service view
- financial summaries and validated data
- smart agent structured results

### UX state belongs in frontend state
Examples:
- text being typed into a message box
- current tab or selected thread
- intro/tutorial seen flags
- temporary receipt preview state
- temporary selected category in a review screen
- transient loading/error flags

### Rule
Frontend local state can guide UX.
Frontend local state must not silently become long-term financial truth.

---

## 4.4 OCR boundary
Frontend-side OCR boundary is intentionally small:

```json
{
  "raw_text": "..."
}
```

That is the intended public contract shape for OCR ingress.

What this means:
- local OCR on device is allowed
- alternative OCR capture sources can exist
- but frontend should not feel required to send blocks/confidence/field maps to the adapter unless backend contract later explicitly changes

Backend/downstream services own:
- parsing
- normalization
- validation
- document typing
- confidence/risk logic
- orchestration-safe summaries

---

## 4.5 Auth direction
Target direction is:
- Google OIDC-first
- adapter verifies token
- frontend supplies Bearer token

Current bridge reality exists:
- dev token mode is supported in adapter
- Google `tokeninfo` verification is used as an intermediate step

But frontend should not lock itself into:
- password-grant-first architecture
- public client secret patterns
- direct token endpoint assumptions as long-term truth

---

# 5. Proposal interpretation rules for frontend

The proposal includes many valid system-level ideas. The frontend must interpret them correctly.

## 5.1 “API Gateway + Cognito (or IAM)” does not mean frontend should build to Cognito-first today
The proposal gives infrastructure possibilities.
The implemented backend direction currently says:
- Google OIDC-first
- adapter as public entry point

Therefore frontend should not hardcode its architecture around Cognito-specific assumptions unless backend later explicitly converges there.

### Safe interpretation
Frontend should think in terms of:
- obtain valid identity token from the chosen user-facing auth flow
- send Bearer token to adapter
- let adapter own verification and user-context attachment

---

## 5.2 “OCR via Textract” does not mean frontend should depend on Textract response shape
Textract may be a backend implementation choice.
Frontend should not couple itself to:
- Textract blocks schema
- S3 upload prerequisites
- document analysis internals

### Safe interpretation
Frontend should support:
- image/document acquisition
- local preview
- raw OCR text capture if available
- submission to adapter using stable ingress contract

---

## 5.3 “S3 / RDS / DynamoDB / OpenSearch” are backend concerns, not frontend contracts
The frontend should not create UI assumptions based on internal storage layout.

For frontend implementation, the relevant contracts are:
- public request headers
- request body shapes
- response envelope
- endpoint semantics
- stable status handling

Not:
- whether backend uses S3
- whether sessions use DynamoDB
- whether search uses OpenSearch
- whether OCR pipelines use Textract or something else later

---

## 5.4 “Agent keeps state and uses tools” must not be read as “assistant local state is product truth”
The frontend already contains assistant mock state and settings.
Those are useful for UI.
They are not product memory truth.

The proposal’s agentic framing should not lead frontend to:
- overstuff assistant local state
- persist arbitrary financial truth inside chat state
- assume that assistant UI state is a substitute for backend identity/goals/risk models

---

# 6. Current SwinHackathon repo assessment

This section explains what the frontend repo currently does well, and where it misaligns.

## 6.1 What is already good and should be preserved

### Assistant UI structure is usable
- `app/(tabs)/assistant.tsx` works as a good assistant entry/inbox surface
- `app/(assistant)/chat/[scenario].tsx` is already a usable thread UI

### Receipt import UX is useful
- `app/(finance)/smart-budgeting/add-spending.tsx`
- `app/(finance)/smart-budgeting/receipt-scan.tsx`

These already form a reasonable user flow for:
- importing a receipt
- running local OCR
- previewing/reviewing before using the result

### Local OCR is a strong asset
`app/(finance)/smart-budgeting/receipt-scan.tsx` already uses ML Kit and produces local OCR text.
This aligns surprisingly well with the backend’s raw_text-first ingress boundary.

### Context/reducer-based UX state is acceptable
The app’s context/reducer state is not inherently wrong.
It just needs clearer boundaries between:
- UX convenience state
- backend-backed product truth

---

## 6.2 Where the repo is currently misaligned

### Auth is the biggest mismatch
Current signs of mismatch:
- `services/oauth2.ts` is password-grant oriented
- `.env.example` includes `EXPO_PUBLIC_OAUTH_CLIENT_SECRET`
- `signIn.tsx` still contains `Go Home (Test)` bypass
- token state lives only in reducer memory currently

This is not the intended final GoalWealth direction.

### Assistant runtime is still mock-only
In `context/assistantContext.tsx`:
- sending a message appends a fixed canned assistant reply
- there is no true adapter-backed chat runtime yet

### OCR review contains frontend heuristics that must remain secondary
The existing receipt flow includes useful helper behavior such as:
- amount extraction from raw text
- suggested category guesses

This is acceptable for UX convenience.
It must not become the system’s business truth layer.

### Assistant receipt routes are not true implementations
Current assistant receipt routes mostly redirect into finance receipt flows.
That means the real canonical receipt flow already lives elsewhere.
This should be acknowledged and simplified, not duplicated further.

---

# 7. Explicit frontend rules

These are hard directional rules for current frontend work.

## Rule 1 - do not create new direct backend integrations outside the adapter
If a frontend feature needs backend data, the default assumption is:
- it should go through the adapter public API

Do not invent direct calls to:
- OpenClaw endpoints
- OCR internal endpoints
- memory service endpoints
- smart-agent internal endpoints

unless backend explicitly adds those as public frontend contracts later.

---

## Rule 2 - do not treat password grant as the target auth system
If existing code still uses it, treat it as:
- dev bridge
- temporary compatibility layer
- transitional implementation only

Do not present it in docs/code comments as the final or preferred long-term GoalWealth path.

---

## Rule 3 - do not store client secrets in public Expo env as a core architecture assumption
Any public env like `EXPO_PUBLIC_OAUTH_CLIENT_SECRET` is a red flag for long-term direction.
If present, it should be phased out or clearly marked as temporary/non-production.

---

## Rule 4 - do not make assistant local memory equal to product memory
Frontend assistant state may store:
- UI settings
- demo thread state
- temporary drafts
- thread-local runtime state

But it must not silently become:
- user financial truth
- OCR truth
- goals truth
- risk truth
- canonical product memory

---

## Rule 5 - keep OCR frontend logic close to capture/review, not business normalization
Frontend is allowed to:
- import images/files
- OCR locally
- preview raw text
- provide review UI
- prefill soft suggestions

Frontend should avoid becoming the main place for:
- financial field normalization policy
- validation rules that backend should own
- canonical receipt parsing semantics
- confidence scoring logic

---

## Rule 6 - always parse adapter envelope fully
The frontend should always handle:
- `ok`
- `data`
- `error`
- `meta`
- `warnings`

Do not only parse `data` and ignore the rest.
GoalWealth backend currently uses graceful degradation, so `warnings` matter.
`meta.request_id` matters for debugging.

---

## Rule 7 - preserve working UX while changing transport/runtime underneath
Do not rewrite UI just because integration transport changes.
Prefer:
- keeping existing screens
- replacing mock send logic with real transport
- replacing direct assumptions with typed service modules

---

# 8. Stable public contract assumptions for frontend

These are the assumptions frontend may safely use right now.

## 8.1 Common authenticated headers
Use:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Optional and recommended:

```http
X-Request-Id: <uuid>
```

---

## 8.2 Response envelope
Assume adapter responses look like:

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

On error:

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "SOME_CODE",
    "message": "Readable explanation",
    "details": {}
  },
  "meta": {
    "request_id": "req-123"
  },
  "warnings": []
}
```

### Mandatory frontend behavior
1. check `ok`
2. if false, read `error.code` and `error.message`
3. retain `meta.request_id`
4. preserve `warnings` for logs/debug UI
5. only then process `data`

---

## 8.3 Chat request shape
Current adapter chat request shape supports:

```json
{
  "message": "...",
  "session_id": "optional",
  "locale": "optional",
  "timezone": "optional",
  "attachments": []
}
```

### Frontend note
If timezone is available from device/user preferences, send it.
It will help context alignment later.

---

## 8.4 OCR ingress request shape
Current OCR ingress boundary is:

```json
{
  "raw_text": "..."
}
```

No need to require:
- blocks
- confidence
- parsed field trees
- validation structures

unless backend contract later changes.

---

## 8.5 OCR record fetch semantics
Frontend should be prepared for statuses such as:
- `accepted`
- `pending_user_context`
- `pending_backend`
- `ready`

and treat them as **real states**, not necessarily failures.

---

# 9. Frontend architecture recommendations

This section describes what frontend architecture should look like after alignment.

## 9.1 Introduce a single adapter API layer
Create a shared service layer, for example:
- `services/api/config.ts`
- `services/api/http.ts`
- `services/api/types.ts`
- `services/api/errors.ts`
- `services/api/chat.ts`
- `services/api/ocr.ts`
- maybe `services/auth/session.ts`

### Responsibilities
- base URL config
- auth header composition
- envelope parsing
- timeout handling
- JSON parsing
- typed error conversion
- service-specific helpers for chat/OCR

### Anti-pattern to avoid
Do not copy raw `fetch()` logic into multiple screens.

---

## 9.2 Keep screen components thin
Screens should focus on:
- input collection
- rendering
- optimistic/loading states
- user-triggered actions

They should not own:
- low-level HTTP boilerplate
- envelope parsing duplication
- ad-hoc auth header generation
- backend contract normalization logic

---

## 9.3 Use frontend state for runtime coordination, not durable truth
Examples of good frontend state:
- current live chat session id
- message sending status
- OCR draft preview
- retry flags
- receipt import workflow progress

Examples of backend-owned truth:
- final normalized OCR facts
- durable goal/memory entities
- authoritative risk/suitability state
- smart-agent structured results used by orchestration

---

## 9.4 Separate demo seeds from live runtime
The assistant scenarios and mock content are still valuable.
They should become one of these:
- seed prompts
- empty state helpers
- demo mode content
- storybook-like UX scaffolding

They should not remain the default live runtime engine.

---

# 10. Auth migration guidance for frontend

This section is intentionally explicit because auth is the current biggest mismatch.

## 10.1 Current state
Current frontend code is centered around an OAuth2 password flow.
This may be practical for temporary testing, but it is not the intended long-term mobile/public design.

## 10.2 Target state
Target state is:
- user signs in through Google OIDC-friendly flow
- frontend gets Google auth result/token
- frontend sends `Authorization: Bearer <token>` to adapter
- adapter verifies issuer/audience/expiry/subject
- adapter maps identity to GoalWealth user context

## 10.3 Transitional allowance
A transitional dev bridge is acceptable if needed.
But it must be clearly labeled as temporary and not presented as final architecture.

## 10.4 What frontend should change eventually
- phase out public-client-secret assumptions
- separate dev bypasses from normal auth UX
- support safe token/session bootstrap
- prepare for secure storage if persistence is needed
- stop centering auth around password grant assumptions

## 10.5 Things frontend should avoid now
- adding more code that deepens password-grant coupling
- building new screens around public client secret assumptions
- treating current bridge auth flow as stable product contract

---

# 11. Assistant integration guidance

## 11.1 Current state
Assistant UI exists, but live runtime does not.

## 11.2 Target state
Assistant chat should call the adapter:
- `POST /v1/chat/respond`

The frontend should maintain:
- live thread runtime state
- current `session_id`
- sending/error/retry state

## 11.3 Good implementation pattern
- keep current screens
- add adapter-backed chat service
- use scenario data only as seed/fallback/demo content
- persist returned `session_id` per live thread
- show backend reply from `data.reply`

## 11.4 Warning handling
Warnings are not necessarily fatal.
They may represent degraded-but-usable backend responses.
Frontend should not crash or hide all output just because warnings exist.

## 11.5 Do not over-assume attachments yet
The chat contract currently contains `attachments`, but attachment semantics may still evolve.
Do not overengineer attachment pipelines until backend side actually needs them.

---

# 12. OCR integration guidance

## 12.1 Current state
The current receipt flow is close to a good architecture already.
It captures images, runs local OCR, and holds a reviewable draft.

## 12.2 Target state
The live backend path should be:
1. local OCR result becomes `raw_text`
2. frontend submits `POST /v1/ocr/ingress`
3. frontend stores returned `ocr_record_id`
4. frontend may fetch `GET /v1/ocr/records/{ocr_record_id}` if needed
5. frontend maps backend states into UX

## 12.3 What frontend may still do locally
- preview images/documents
- extract raw OCR text locally
- offer category/amount suggestions for user convenience
- support manual corrections

## 12.4 What frontend should not promote to system truth
- guessed merchant/category/amount as authoritative truth
- canonical normalized OCR structure
- final financial interpretation rules

## 12.5 Receipt flow ownership
The canonical receipt flow should live in one place.
Assistant routes may launch it, but should not duplicate core logic.

---

# 13. What to keep, what to change, what to stop doing

## Keep
- current assistant surfaces and chat UX scaffold
- current smart budgeting receipt import/review UX
- local OCR capability
- reducer/context pattern for UX state
- mock scenario data as demo/fallback/seed material

## Change
- auth direction
- transport layer structure
- assistant send behavior
- response envelope handling discipline
- OCR backend integration path
- dev bypass gating
- distinction between local state and backend truth

## Stop doing / stop assuming
- password grant as main auth target
- public client secret as a normal public mobile env assumption
- direct backend/service coupling outside the adapter
- assistant local state as durable product memory
- frontend receipt heuristics as canonical business truth
- duplicate receipt implementations across route groups
- inferring frontend contracts from proposal infrastructure wording alone

---

# 14. Suggested file-level impact map

These are not mandatory exact filenames, but they indicate the expected impact zone.

## Files that are already important and should be treated carefully
- `SwinHackathon/app/(auth)/signIn.tsx`
- `SwinHackathon/services/oauth2.ts`
- `SwinHackathon/context/assistantContext.tsx`
- `SwinHackathon/app/(assistant)/chat/[scenario].tsx`
- `SwinHackathon/app/(tabs)/assistant.tsx`
- `SwinHackathon/app/(finance)/smart-budgeting/add-spending.tsx`
- `SwinHackathon/app/(finance)/smart-budgeting/receipt-scan.tsx`
- `SwinHackathon/app/(assistant)/receipt-upload.tsx`
- `SwinHackathon/app/(assistant)/receipt-scan.tsx`
- `SwinHackathon/.env.example`

## Files that likely should be added
- `SwinHackathon/services/api/config.ts`
- `SwinHackathon/services/api/http.ts`
- `SwinHackathon/services/api/types.ts`
- `SwinHackathon/services/api/errors.ts`
- `SwinHackathon/services/api/chat.ts`
- `SwinHackathon/services/api/ocr.ts`
- optionally `SwinHackathon/services/auth/session.ts`

## Files that should remain mostly frontend UX concerns
- component-only visual scaffolds
- theme-related files
- unrelated profile/news/community UI routes

Do not expand the blast radius unless a batch explicitly requires it.

---

# 15. Recommended execution order if frontend is resumed later

If frontend work resumes later, use this order:

## Phase 1 - API foundation
Create a shared adapter API layer.

## Phase 2 - Auth correction / bridge cleanup
Align auth with GoalWealth direction.

## Phase 3 - Assistant live integration
Replace mock send runtime with adapter-backed chat.

## Phase 4 - OCR ingress integration
Submit raw OCR text to adapter and map backend statuses cleanly.

## Phase 5 - Receipt flow consolidation
Make assistant receipt entry points explicit launchers, not shadow implementations.

## Phase 6 - Hardening and cleanup
Feature flags, env clarity, secure session handling, dev bypass control, mock/live distinction.

---

# 16. Definition of done for any future frontend batch

A frontend batch is not complete unless all of the following are true:

1. It keeps backend contract assumptions explicit.
2. It does not create new raw `fetch()` duplication.
3. It does not deepen password-grant-first architecture without a conscious transitional reason.
4. It preserves working UX unless the change intentionally updates UX.
5. It distinguishes product truth from frontend UX state.
6. It handles `ok/data/error/meta/warnings` correctly.
7. It documents any new env variables or feature flags.
8. It does not increase direct coupling to backend internals beyond the adapter public contract.

---

# 17. Instructions for future LLM coding agents

If you are an LLM or code agent working on this frontend later, follow these rules strictly:

## Do
- read this file first
- read the adapter integration guide and public OpenAPI next
- prefer small additive changes
- keep UI intact while swapping transport/runtime layers underneath
- preserve demo fallback behavior until live behavior is proven
- use one adapter service layer
- treat backend docs/contracts as implementation truth

## Do not
- invent new public request shapes because a UI seems to want them
- wire frontend directly to OpenClaw or internal backend services
- assume proposal infrastructure details are the current contract
- extend password-grant coupling as if it were the long-term design
- turn frontend OCR heuristics into canonical financial truth
- treat assistant local state as durable product memory

## When in doubt
Choose the option that:
- keeps frontend thinner
- keeps adapter as the public contract boundary
- keeps business truth in backend structured systems
- keeps OpenClaw as orchestration-only

---

# 18. Final one-paragraph handoff

GoalWealth frontend should be built around a thin but explicit public adapter contract, not around direct assumptions about OpenClaw, Cognito, Textract, S3, or internal backend topology. The current SwinHackathon repo already contains valuable UI, assistant surfaces, and receipt OCR UX, but it must stop deepening password-grant auth assumptions, stop treating assistant state as product memory, and stop letting frontend OCR heuristics drift into business-truth territory. The right direction is: adapter-first networking, Google OIDC-first auth, raw_text OCR ingress, structured backend truth, graceful envelope handling, and minimal frontend coupling to backend internals.
