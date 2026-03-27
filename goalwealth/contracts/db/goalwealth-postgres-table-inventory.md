# GoalWealth PostgreSQL Table Inventory (Draft)

Status: draft only, not implemented yet.

This file captures the current recommended canonical PostgreSQL table inventory based on the original GoalWealth contracts, with the latest design decision that:
- core domain data stays normalized
- OAuth2/OIDC identity stays separate from product profile data
- OCR is allowed to remain a semi-structured exception in a single `ocr_records` table for simpler retrieval and lower join pressure

Source basis:
- `goalwealth/contracts/memory/memory-service-view.schema.json`
- `goalwealth/contracts/ocr/ocr-parse-output.schema.json`
- `goalwealth/contracts/ocr/ocr-openclaw-view.schema.json`
- `goalwealth/contracts/api/openclaw-backend-api.openapi.yaml`
- `aws-guide/goalwealth-current-architecture-diagrams.md`

---

## 1. MUST HAVE TABLES

### 1.1 `users`
Purpose:
- Internal user row only
- Product/business identity anchor

Fields:
- `id` UUID PK
- `status` TEXT
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

Notes:
- Keep this table intentionally thin.
- OAuth identity details should not be stored directly here.

---

### 1.2 `user_identities`
Purpose:
- OAuth2/OIDC identity linkage
- Clean separation between provider identity and product profile

Fields:
- `id` UUID PK
- `user_id` UUID FK -> `users.id`
- `provider` TEXT
- `provider_subject` TEXT
- `issuer` TEXT
- `provider_email` TEXT
- `email_verified` BOOLEAN
- `linked_at` TIMESTAMPTZ
- `last_login_at` TIMESTAMPTZ

Constraints:
- UNIQUE (`provider`, `provider_subject`)

Notes:
- Current expected provider: `google`
- Web / Android / FastAPI OAuth toolkit all map here through the same provider identity model.

---

### 1.3 `user_profiles`
Purpose:
- Business/user profile data used by memory service view and frontend bootstrap

Fields:
- `user_id` UUID PK/FK -> `users.id`
- `full_name` TEXT
- `email` TEXT
- `phone` TEXT
- `city` TEXT
- `country` TEXT
- `timezone` TEXT
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

---

### 1.4 `risk_profiles`
Purpose:
- Scalar risk-profile values from memory service view

Fields:
- `user_id` UUID PK/FK -> `users.id`
- `risk_tolerance` TEXT
- `calculated_score` NUMERIC(5,2)
- `investment_horizon` TEXT
- `knowledge_level` TEXT
- `liquidity_needs` TEXT
- `max_loss` NUMERIC(5,2)
- `min_return` NUMERIC(5,2)
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

Notes:
- `max_loss` and `min_return` come from the scalar parts of risk constraints.

---

### 1.5 `risk_sector_exclusions`
Purpose:
- Normalized storage for `sector_exclusions[]`

Fields:
- `user_id` UUID FK -> `users.id`
- `sector_name` TEXT

Constraints:
- PRIMARY KEY (`user_id`, `sector_name`)

---

### 1.6 `risk_asset_class_limits`
Purpose:
- Normalized storage for `asset_class_limits{}`

Fields:
- `user_id` UUID FK -> `users.id`
- `asset_class` TEXT
- `limit_percent` NUMERIC(5,2)

Constraints:
- PRIMARY KEY (`user_id`, `asset_class`)

---

### 1.7 `goals`
Purpose:
- Canonical goal entities

Fields:
- `id` UUID PK
- `user_id` UUID FK -> `users.id`
- `title` TEXT
- `goal_type` TEXT
- `status` TEXT
- `priority` SMALLINT
- `target_amount` NUMERIC(18,2)
- `current_progress` NUMERIC(18,2)
- `target_date` DATE
- `description` TEXT
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

Notes:
- Do not store `total_active_goals` or `total_goals` here; those are derived.

---

### 1.8 `goal_milestones`
Purpose:
- Normalized storage for `goal.milestones[]`

Fields:
- `id` UUID PK
- `goal_id` UUID FK -> `goals.id`
- `title` TEXT
- `target_amount` NUMERIC(18,2)
- `current_progress` NUMERIC(18,2)
- `target_date` DATE
- `completed_at` TIMESTAMPTZ
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

---

### 1.9 `conversation_summaries`
Purpose:
- Current conversation summary state for a user

Fields:
- `user_id` UUID PK/FK -> `users.id`
- `last_turn_date` TIMESTAMPTZ
- `total_turns` INTEGER
- `last_topic` TEXT
- `user_intent` TEXT
- `last_message` TEXT
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

---

### 1.10 `conversation_context_needs`
Purpose:
- Normalized storage for `context_needs[]`

Fields:
- `user_id` UUID FK -> `users.id`
- `need_code` TEXT

Constraints:
- PRIMARY KEY (`user_id`, `need_code`)

---

### 1.11 `conversation_pending_actions`
Purpose:
- Normalized storage for `pending_actions[]`

Fields:
- `id` UUID PK
- `user_id` UUID FK -> `users.id`
- `action_type` TEXT
- `target` TEXT
- `priority` SMALLINT
- `created_at` TIMESTAMPTZ

---

### 1.12 `ocr_records`
Purpose:
- Canonical OCR row with a deliberate semi-structured design
- Stores OCR parse data, validation payload, and orchestration hint with lower join complexity

Fields:
- `ocr_record_id` TEXT PK
- `user_id` UUID FK -> `users.id`
- `source_type` TEXT
- `document_type` TEXT
- `ingest_status` TEXT
- `parse_status` TEXT
- `language` TEXT
- `provider` TEXT
- `file_name` TEXT
- `mime_type` TEXT
- `page_count` INTEGER
- `issued_date` DATE
- `document_currency` CHAR(3)
- `institution_name` TEXT
- `document_reference` TEXT
- `raw_text` TEXT
- `raw_text_confidence` NUMERIC(4,3)
- `summary_text` TEXT
- `is_usable` BOOLEAN
- `overall_confidence` NUMERIC(4,3)
- `normalization_confidence` NUMERIC(4,3)
- `manual_review_required` BOOLEAN
- `auto_apply_allowed` BOOLEAN
- `normalized_data_jsonb` JSONB
- `validation_jsonb` JSONB
- `orchestration_hint_jsonb` JSONB
- `parser_model_id` TEXT
- `normalizer_version` TEXT
- `frontend_trace_id` TEXT
- `processed_at` TIMESTAMPTZ
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

Notes:
- This table is the explicit exception to strict 1NF+ design.
- OCR remains document-shaped and polymorphic, so the design keeps typed/nested OCR data inside JSONB for simpler retrieval.
- This avoids exploding OCR into many child tables too early.

---

## 2. OPTIONAL LATER TABLES

### 2.1 `auth_sessions`
Purpose:
- Backend-managed auth sessions if the EC2/FastAPI layer introduces session persistence

Fields:
- `id` UUID PK
- `user_id` UUID FK -> `users.id`
- `session_token_hash` TEXT
- `created_at` TIMESTAMPTZ
- `expires_at` TIMESTAMPTZ
- `revoked_at` TIMESTAMPTZ

---

### 2.2 `oauth_refresh_tokens`
Purpose:
- Provider refresh-token storage if backend keeps provider refresh tokens

Fields:
- `id` UUID PK
- `user_identity_id` UUID FK -> `user_identities.id`
- `provider` TEXT
- `refresh_token_encrypted` TEXT
- `scope` TEXT
- `issued_at` TIMESTAMPTZ
- `expires_at` TIMESTAMPTZ
- `revoked_at` TIMESTAMPTZ

---

### 2.3 `ocr_record_goal_links`
Purpose:
- Explicit many-to-many link between OCR records and goals if product logic starts relying on durable document-to-goal linkage

Fields:
- `ocr_record_id` TEXT FK -> `ocr_records.ocr_record_id`
- `goal_id` UUID FK -> `goals.id`

Constraints:
- PRIMARY KEY (`ocr_record_id`, `goal_id`)

---

## 3. DERIVED / DO NOT STORE DIRECTLY

These values should be built from canonical tables instead of stored as independent source-of-truth fields.

### From memory service view
- `total_active_goals`
- `total_goals`
- `ocr_summaries.total_summaries`
- `ocr_summaries.by_type`
- `ocr_summaries.recent_summaries` as a pre-packed list

### From OCR OpenClaw view
- `transactions_count`
- `holding_count`
- `transaction_candidates[]`
- `holding_candidates[]`

### From auth config/tooling
Do not store these in product PostgreSQL tables:
- Google web client id
- Google Android client id
- OAuth client secret
- redirect URIs
- PKCE state / verifier

These belong in:
- environment config
- AWS Systems Manager Parameter Store
- AWS Secrets Manager

---

## 4. CURRENT DESIGN SUMMARY

Recommended current shape:
- normalized core domain:
  - users
  - user_identities
  - user_profiles
  - risk_profiles
  - risk_sector_exclusions
  - risk_asset_class_limits
  - goals
  - goal_milestones
  - conversation_summaries
  - conversation_context_needs
  - conversation_pending_actions
- OCR as a deliberate semi-structured exception:
  - ocr_records

This gives GoalWealth:
- clean OAuth2/OIDC identity separation
- normalized core product memory
- practical OCR storage without over-splitting document structures too early
