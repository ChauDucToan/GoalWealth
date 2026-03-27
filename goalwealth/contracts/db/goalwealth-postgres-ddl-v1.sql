-- GoalWealth PostgreSQL DDL v1 (Draft)
-- Status: draft only, not implemented yet.
--
-- Scope of this v1 draft:
-- - users
-- - user_identities
-- - user_profiles
-- - risk_profiles
-- - goals
-- - conversation_summaries
-- - ocr_records
-- - recommendation_states
--
-- Design notes:
-- - OAuth2/OIDC provider identity is stored in user_identities.
-- - OAuth config/secrets (client ids, client secrets, redirect URIs, PKCE state) are NOT stored here.
-- - OCR is intentionally semi-structured and allowed to use JSONB in ocr_records.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- users
-- Thin internal product identity anchor.
-- =========================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'disabled', 'deleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- user_identities
-- OAuth2/OIDC provider identity mapping.
-- One user may later support multiple linked identities/providers.
-- =========================================================
CREATE TABLE user_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_subject TEXT NOT NULL,
    issuer TEXT NOT NULL,
    provider_email TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    CONSTRAINT uq_user_identities_provider_subject UNIQUE (provider, provider_subject)
);

CREATE INDEX idx_user_identities_user_id
    ON user_identities(user_id);

CREATE INDEX idx_user_identities_provider_email
    ON user_identities(provider_email);

-- =========================================================
-- user_profiles
-- Business/user profile fields used by /v1/me and memory view.
-- =========================================================
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,
    country TEXT,
    timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_email
    ON user_profiles(email);

-- =========================================================
-- risk_profiles
-- Scalar risk-profile fields only in v1.
-- =========================================================
CREATE TABLE risk_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    risk_tolerance TEXT
        CHECK (risk_tolerance IN (
            'conservative',
            'moderate',
            'balanced',
            'growth',
            'aggressive'
        )),
    calculated_score NUMERIC(5,2)
        CHECK (calculated_score >= 0 AND calculated_score <= 100),
    investment_horizon TEXT
        CHECK (investment_horizon IN (
            'short_term',
            'medium_term',
            'long_term'
        )),
    knowledge_level TEXT
        CHECK (knowledge_level IN (
            'beginner',
            'intermediate',
            'advanced',
            'expert'
        )),
    liquidity_needs TEXT
        CHECK (liquidity_needs IN (
            'high',
            'medium',
            'low'
        )),
    max_loss NUMERIC(5,2)
        CHECK (max_loss >= 0 AND max_loss <= 100),
    min_return NUMERIC(5,2)
        CHECK (min_return >= -100 AND min_return <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- goals
-- Core goal entity for planning and memory view.
-- =========================================================
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    goal_type TEXT NOT NULL
        CHECK (goal_type IN (
            'savings_goal',
            'debt_payoff_goal',
            'investment_goal',
            'retirement_goal',
            'emergency_fund_goal',
            'wealth_building_goal'
        )),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'paused', 'archived')),
    priority SMALLINT NOT NULL DEFAULT 5
        CHECK (priority BETWEEN 1 AND 10),
    target_amount NUMERIC(18,2)
        CHECK (target_amount IS NULL OR target_amount >= 0),
    current_progress NUMERIC(18,2) NOT NULL DEFAULT 0
        CHECK (current_progress >= 0),
    target_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_goals_user_id
    ON goals(user_id);

CREATE INDEX idx_goals_user_status
    ON goals(user_id, status);

-- =========================================================
-- conversation_summaries
-- Current summary state for orchestration continuity.
-- =========================================================
CREATE TABLE conversation_summaries (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    last_turn_date TIMESTAMPTZ,
    total_turns INTEGER NOT NULL DEFAULT 0
        CHECK (total_turns >= 0),
    last_topic TEXT,
    user_intent TEXT,
    last_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- ocr_records
-- Semi-structured OCR storage exception.
-- JSONB used intentionally for polymorphic normalized data,
-- validation payload, and orchestration hint.
-- =========================================================
CREATE TABLE ocr_records (
    ocr_record_id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL
        CHECK (source_type IN (
            'image_upload',
            'camera_capture',
            'pdf_upload',
            'frontend_sdk',
            'api_import'
        )),
    document_type TEXT NOT NULL DEFAULT 'unknown'
        CHECK (document_type IN (
            'receipt',
            'bank_statement',
            'salary_slip',
            'investment_statement',
            'insurance_document',
            'unknown'
        )),
    ingest_status TEXT NOT NULL DEFAULT 'pending_backend'
        CHECK (ingest_status IN (
            'pending_backend',
            'pending_user_context',
            'ready',
            'failed'
        )),
    parse_status TEXT
        CHECK (parse_status IN (
            'processed',
            'needs_review',
            'validation_failed',
            'rejected'
        )),
    language TEXT NOT NULL DEFAULT 'vi',
    ocr_provider TEXT,
    file_name TEXT,
    mime_type TEXT,
    page_count INTEGER
        CHECK (page_count IS NULL OR page_count >= 1),
    issued_date DATE,
    currency CHAR(3),
    institution_name TEXT,
    document_reference TEXT,
    raw_text TEXT,
    raw_text_confidence NUMERIC(4,3)
        CHECK (
            raw_text_confidence IS NULL OR
            (raw_text_confidence >= 0 AND raw_text_confidence <= 1)
        ),
    summary_text TEXT,
    is_usable BOOLEAN,
    overall_confidence NUMERIC(4,3)
        CHECK (
            overall_confidence IS NULL OR
            (overall_confidence >= 0 AND overall_confidence <= 1)
        ),
    normalization_confidence NUMERIC(4,3)
        CHECK (
            normalization_confidence IS NULL OR
            (normalization_confidence >= 0 AND normalization_confidence <= 1)
        ),
    manual_review_required BOOLEAN NOT NULL DEFAULT FALSE,
    auto_apply_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    normalized_data_jsonb JSONB NOT NULL DEFAULT '{}'::jsonb,
    validation_jsonb JSONB NOT NULL DEFAULT '{}'::jsonb,
    orchestration_hint_jsonb JSONB NOT NULL DEFAULT '{}'::jsonb,
    parser_model_id TEXT,
    normalizer_version TEXT,
    frontend_trace_id TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ocr_records_user_id
    ON ocr_records(user_id);

CREATE INDEX idx_ocr_records_user_created_at
    ON ocr_records(user_id, created_at DESC);

CREATE INDEX idx_ocr_records_ingest_status
    ON ocr_records(ingest_status);

CREATE INDEX idx_ocr_records_parse_status
    ON ocr_records(parse_status);

CREATE INDEX idx_ocr_records_document_type
    ON ocr_records(document_type);

CREATE INDEX idx_ocr_records_normalized_data_gin
    ON ocr_records USING GIN (normalized_data_jsonb);

-- =========================================================
-- recommendation_states
-- User-controlled state for recommendation cards (phase 1: dismiss only).
-- =========================================================
CREATE TABLE recommendation_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'dismissed'
        CHECK (status IN ('dismissed')),
    dismissed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_recommendation_states_user_recommendation UNIQUE (user_id, recommendation_id)
);

CREATE INDEX idx_recommendation_states_user_id
    ON recommendation_states(user_id);

CREATE INDEX idx_recommendation_states_user_status
    ON recommendation_states(user_id, status);
