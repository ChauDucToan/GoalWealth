# GoalWealth PostgreSQL Schema Pruning Pass (Draft)

Status: pruning pass only, before DDL draft.

Goal of this pass:
- decide what should be implemented in DDL v1 now
- decide what should be delayed to later phases
- avoid storing derived/projection-only data as canonical source-of-truth

Context decisions already locked:
- start from the original GoalWealth contracts/schemas
- keep OAuth2/OIDC identity separate from product profile data
- keep core domain data normalized
- allow OCR to remain a semi-structured exception inside `ocr_records`
- Phase 1 should support practical product/API work without exploding table count too early

---

## 1. KEEP NOW (DDL v1)

These tables should be implemented in the first SQL draft.

### 1.1 `users`
Keep now because:
- internal product identity anchor
- referenced by every other domain table
- very low complexity

Keep-now fields:
- `id`
- `status`
- `created_at`
- `updated_at`

Notes:
- Keep intentionally thin.
- Do not merge OAuth provider identity into this table.

---

### 1.2 `user_identities`
Keep now because:
- OAuth2/OIDC is a first-class requirement now
- cleanly supports Google web, Android, and backend OAuth toolkit flows
- avoids coupling external provider identity to product profile rows

Keep-now fields:
- `id`
- `user_id`
- `provider`
- `provider_subject`
- `issuer`
- `provider_email`
- `email_verified`
- `linked_at`
- `last_login_at`

Constraint to keep now:
- UNIQUE (`provider`, `provider_subject`)

---

### 1.3 `user_profiles`
Keep now because:
- needed for `/v1/me`
- directly matches memory-service-view user profile concept
- still clean as a 1:1 extension table

Keep-now fields:
- `user_id`
- `full_name`
- `email`
- `timezone`
- `created_at`
- `updated_at`

Keep-later fields inside this table:
- `phone`
- `city`
- `country`

Reason:
- these are useful but not critical for first draft
- can be added later without reshaping the model

---

### 1.4 `risk_profiles`
Keep now because:
- risk profile is part of the original memory-service-view core
- useful for `/v1/me` and chat context early
- remains normalized as a 1:1 extension table

Keep-now fields:
- `user_id`
- `risk_tolerance`
- `calculated_score`
- `investment_horizon`
- `created_at`
- `updated_at`

Keep-later fields inside this table:
- `knowledge_level`
- `liquidity_needs`
- `max_loss`
- `min_return`

Reason:
- scalar and easy to add later
- not essential to ship first product/API draft

---

### 1.5 `goals`
Keep now because:
- goals are a core product entity
- memory-service-view depends on them heavily
- `/v1/me` and chat context both benefit from them immediately

Keep-now fields:
- `id`
- `user_id`
- `title`
- `goal_type`
- `status`
- `priority`
- `target_amount`
- `current_progress`
- `target_date`
- `created_at`
- `updated_at`

Keep-later fields inside this table:
- `description`

Reason:
- nice to have, but not required to establish a usable goal model

---

### 1.6 `conversation_summaries`
Keep now because:
- conversation state is useful for orchestration continuity
- `last_message` is considered important
- keeps current summary state separate from full transcript/session history

Keep-now fields:
- `user_id`
- `last_turn_date`
- `total_turns`
- `last_topic`
- `user_intent`
- `last_message`
- `created_at`
- `updated_at`

---

### 1.7 `ocr_records`
Keep now because:
- OCR is part of Phase 1 API surface already
- current design explicitly allows OCR to remain semi-structured
- one-row retrieval matters more here than strict relational decomposition

Keep-now fields:
- `ocr_record_id`
- `user_id`
- `source_type`
- `document_type`
- `ingest_status`
- `parse_status`
- `language`
- `provider`
- `raw_text`
- `raw_text_confidence`
- `summary_text`
- `is_usable`
- `overall_confidence`
- `normalization_confidence`
- `manual_review_required`
- `auto_apply_allowed`
- `normalized_data_jsonb`
- `validation_jsonb`
- `orchestration_hint_jsonb`
- `parser_model_id`
- `normalizer_version`
- `frontend_trace_id`
- `processed_at`
- `created_at`
- `updated_at`

Keep-later fields inside this table:
- `file_name`
- `mime_type`
- `page_count`
- `issued_date`
- `document_currency`
- `institution_name`
- `document_reference`

Reason:
- useful metadata, but not strictly required for the first DDL draft
- can be added later without changing the OCR design direction

---

## 2. KEEP LATER (not in DDL v1)

These tables are still valid in the longer-term model, but should be postponed.

### 2.1 `risk_sector_exclusions`
Keep later because:
- normalized and valid
- but depends on richer risk constraints usage than current Phase 1 needs

### 2.2 `risk_asset_class_limits`
Keep later because:
- normalized and valid
- but belongs to a more advanced risk-constraint phase

### 2.3 `goal_milestones`
Keep later because:
- schema gốc supports milestones
- but milestone complexity can wait until goals are clearly in active product use

### 2.4 `conversation_context_needs`
Keep later because:
- helpful for richer orchestration memory
- not necessary to begin with a stable current-summary table

### 2.5 `conversation_pending_actions`
Keep later because:
- useful once product logic starts using structured pending actions seriously
- not essential for first draft persistence

### 2.6 `auth_sessions`
Keep later because:
- only needed if backend session persistence becomes a first-class auth behavior

### 2.7 `oauth_refresh_tokens`
Keep later because:
- only needed if backend stores provider refresh tokens intentionally

### 2.8 `ocr_record_goal_links`
Keep later because:
- explicit OCR-to-goal linkage is useful
- but relationship logic can be introduced after core OCR + goals work reliably

---

## 3. DERIVED / DO NOT STORE AS CANONICAL TABLES

These should not become canonical source-of-truth tables in DDL v1.

### 3.1 Derived from goals
Do not store separately:
- `total_active_goals`
- `total_goals`

These should be derived by query.

### 3.2 Derived from OCR
Do not store separately:
- `ocr_summaries.total_summaries`
- `ocr_summaries.by_type`
- `recent_summaries` as a pre-packed stored list
- `transactions_count`
- `holding_count`
- `transaction_candidates[]`
- `holding_candidates[]`

These should be projected from `ocr_records` and service logic.

### 3.3 Auth/provider config
Do not store in PostgreSQL product tables:
- Google web client id
- Google Android client id
- OAuth client secret
- redirect URIs
- PKCE state / verifier

Store them in:
- environment config
- AWS Systems Manager Parameter Store
- AWS Secrets Manager

---

## 4. RESULT OF THIS PRUNING PASS

Recommended DDL v1 table set:
- `users`
- `user_identities`
- `user_profiles`
- `risk_profiles`
- `goals`
- `conversation_summaries`
- `ocr_records`

Recommended DDL v1-later set:
- `risk_sector_exclusions`
- `risk_asset_class_limits`
- `goal_milestones`
- `conversation_context_needs`
- `conversation_pending_actions`
- `auth_sessions`
- `oauth_refresh_tokens`
- `ocr_record_goal_links`

---

## 5. CURRENT RECOMMENDATION

Next step after this pruning pass:
- write DDL v1 only for the 7 KEEP NOW tables above
- keep OCR semi-structured as agreed
- defer richer constraints / milestones / pending-action tables until the core API and product flows are stable
