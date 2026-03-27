type GoalwealthJsonObject = Record<string, unknown>;

export type GoalwealthDocumentType =
  | 'receipt'
  | 'bank_statement'
  | 'salary_slip'
  | 'investment_statement'
  | 'insurance_document'
  | 'unknown';

export type GoalwealthSeverity = 'info' | 'warning' | 'error';

export type GoalwealthEnvelopeMeta = {
  request_id?: string | null;
  route?: string;
  [key: string]: unknown;
};

export type GoalwealthEnvelopeError = {
  code: string;
  message: string;
  details: GoalwealthJsonObject;
};

export type GoalwealthSuccessEnvelope<T> = {
  ok: true;
  data: T;
  error: null;
  meta: GoalwealthEnvelopeMeta;
  warnings: string[];
};

export type GoalwealthErrorEnvelope = {
  ok: false;
  data: null;
  error: GoalwealthEnvelopeError;
  meta: GoalwealthEnvelopeMeta;
  warnings: string[];
};

export type GoalwealthEnvelope<T> = GoalwealthSuccessEnvelope<T> | GoalwealthErrorEnvelope;

export type GoalwealthSuccess<T> = {
  data: T;
  meta: GoalwealthEnvelopeMeta;
  warnings: string[];
  requestId: string | null;
};

export type GoalwealthRootData = {
  service: string;
  version: string;
  environment: string;
  docs_enabled: boolean;
};

export type GoalwealthHealthData = {
  status: 'ok';
  service: string;
  version?: string;
  environment?: string;
};

export type GoalwealthReadyChecks = {
  config_loaded?: boolean;
  docs_mode_known?: boolean;
  oidc_config_present?: boolean;
  openclaw_config_present?: boolean;
  [key: string]: unknown;
};

export type GoalwealthReadyData = {
  status: 'ready';
  service: string;
  checks: GoalwealthReadyChecks;
  runtime?: GoalwealthJsonObject;
};

export type GoalwealthMetaEnvelope = GoalwealthSuccessEnvelope<GoalwealthRootData>;
export type GoalwealthHealthEnvelope = GoalwealthSuccessEnvelope<GoalwealthHealthData>;
export type GoalwealthReadyEnvelope = GoalwealthSuccessEnvelope<GoalwealthReadyData>;

export type GoalwealthMeUserData = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  timezone: string | null;
  locale: string | null;
  location: {
    city: string | null;
    country: string | null;
  };
};

export type GoalwealthMeData = {
  user: GoalwealthMeUserData;
  onboarding: {
    completed: boolean;
    status: string;
  };
  summary: {
    total_active_goals: number;
    total_goals: number;
    risk_tolerance: string | null;
    recent_document_count: number;
  };
  conversation?: {
    last_topic: string | null;
    last_message: string | null;
  };
};

export type GoalwealthMePatchRequest = {
  display_name?: string;
  phone?: string;
  city?: string;
  country_code?: string;
  timezone?: string;
};

export type GoalwealthGoalRecord = {
  goal_id: string;
  title: string | null;
  goal_type: GoalwealthMemoryGoalType;
  status: GoalwealthMemoryGoalStatus;
  priority: number | null;
  target_amount: number | null;
  current_progress: number | null;
  target_date: string | null;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type GoalwealthGoalsListData = {
  user_id: string;
  goals: GoalwealthGoalRecord[];
  count: number;
};

export type GoalwealthGoalCreateRequest = {
  title: string;
  goal_type: GoalwealthMemoryGoalType;
  status?: GoalwealthMemoryGoalStatus;
  priority?: number;
  target_amount?: number | null;
  current_progress?: number;
  target_date?: string | null;
  description?: string | null;
};

export type GoalwealthGoalCreateData = {
  user_id: string;
  goal: GoalwealthGoalRecord;
};

export type GoalwealthChatRequest = {
  message: string;
  session_id?: string;
  locale?: string;
  timezone?: string;
  attachments?: string[];
};

export type GoalwealthChatUsedContext = {
  memory?: boolean;
  ocr_records?: string[];
  smart_agent?: boolean;
  smart_agent_result_count?: number;
  user_present?: boolean;
  [key: string]: unknown;
};

export type GoalwealthChatResponseData = {
  session_id: string;
  reply: string;
  warnings: string[];
  used_context: GoalwealthChatUsedContext;
  meta: GoalwealthJsonObject;
};

export type GoalwealthChatEnvelope = GoalwealthSuccessEnvelope<GoalwealthChatResponseData>;

export type GoalwealthOcrIngressRequest = {
  raw_text: string;
};

export type GoalwealthOcrIngressData = {
  ocr_record_id: string;
  status: 'accepted';
  message: string;
  meta: GoalwealthJsonObject;
};

export type GoalwealthOcrIngressEnvelope = GoalwealthSuccessEnvelope<GoalwealthOcrIngressData>;

export type GoalwealthOcrRecordStatus = 'pending_user_context' | 'pending_backend' | 'ready';

export type GoalwealthOcrRecordData = {
  ocr_record_id: string;
  status: GoalwealthOcrRecordStatus;
  warnings: string[];
  data: GoalwealthJsonObject;
};

export type GoalwealthOcrRecordEnvelope = GoalwealthSuccessEnvelope<GoalwealthOcrRecordData>;

export type GoalwealthRiskProfileData = {
  user_id: string;
  risk_profile: {
    risk_tolerance: GoalwealthRiskTolerance | null;
    calculated_score: number | null;
    investment_horizon: GoalwealthInvestmentHorizon | null;
    knowledge_level: GoalwealthKnowledgeLevel | null;
    liquidity_needs: GoalwealthLiquidityNeeds | null;
    max_loss: number | null;
    min_return: number | null;
  };
  source: 'persistence' | 'fallback';
};

export type GoalwealthRiskProfileUpsertRequest = {
  risk_tolerance?: GoalwealthRiskTolerance;
  investment_horizon?: GoalwealthInvestmentHorizon;
  knowledge_level?: GoalwealthKnowledgeLevel;
  liquidity_needs?: GoalwealthLiquidityNeeds;
  calculated_score?: number;
  max_loss?: number;
  min_return?: number;
  notes?: string;
};

export type GoalwealthInternalErrorResponse = {
  error_code: string;
  message: string;
  trace_id?: string;
  details?: GoalwealthJsonObject;
};

export type GoalwealthMemoryIncludeSection =
  | 'user_profile'
  | 'goals'
  | 'risk_profile'
  | 'ocr_summaries'
  | 'conversation_summary';

export type GoalwealthMemoryViewQuery = {
  includeSections?: GoalwealthMemoryIncludeSection[];
  ocrSummaryLimit?: number;
};

export type GoalwealthMemoryLocation = {
  city?: string;
  country?: string;
  timezone?: string;
};

export type GoalwealthMemoryUserProfile = {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: GoalwealthMemoryLocation;
  created_at?: string;
  updated_at?: string;
};

export type GoalwealthMemoryGoalType =
  | 'savings_goal'
  | 'debt_payoff_goal'
  | 'investment_goal'
  | 'retirement_goal'
  | 'emergency_fund_goal'
  | 'wealth_building_goal';

export type GoalwealthMemoryGoalStatus = 'active' | 'completed' | 'paused' | 'archived';

export type GoalwealthMemoryMilestone = {
  milestone_id: string;
  title: string;
  target_amount: number;
  current_progress?: number;
  target_date: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type GoalwealthMemoryGoal = {
  goal_id: string;
  title: string;
  type: GoalwealthMemoryGoalType;
  status: GoalwealthMemoryGoalStatus;
  priority?: number;
  target_amount?: number;
  current_progress?: number;
  target_date?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  milestones?: GoalwealthMemoryMilestone[];
};

export type GoalwealthMemoryGoals = {
  total_active_goals: number;
  total_goals: number;
  active_goals: GoalwealthMemoryGoal[];
  completed_goals?: GoalwealthMemoryGoal[];
  paused_goals?: GoalwealthMemoryGoal[];
  archived_goals?: GoalwealthMemoryGoal[];
};

export type GoalwealthRiskTolerance =
  | 'conservative'
  | 'moderate'
  | 'balanced'
  | 'growth'
  | 'aggressive';

export type GoalwealthInvestmentHorizon = 'short_term' | 'medium_term' | 'long_term';

export type GoalwealthKnowledgeLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type GoalwealthLiquidityNeeds = 'high' | 'medium' | 'low';

export type GoalwealthRiskConstraints = {
  max_loss?: number;
  min_return?: number;
  sector_exclusions?: string[];
  asset_class_limits?: Record<string, number>;
};

export type GoalwealthRiskProfile = {
  risk_tolerance?: GoalwealthRiskTolerance;
  calculated_score?: number;
  investment_horizon?: GoalwealthInvestmentHorizon;
  knowledge_level?: GoalwealthKnowledgeLevel;
  liquidity_needs?: GoalwealthLiquidityNeeds;
  created_at?: string;
  updated_at?: string;
  constraints?: GoalwealthRiskConstraints;
};

export type GoalwealthOcrSummary = {
  ocr_record_id: string;
  document_type: GoalwealthDocumentType;
  summary_text: string;
  usable?: boolean;
  overall_confidence?: number;
  document_date?: string;
  amount_involved?: number;
  institution_name?: string;
  created_at: string;
  related_goal_ids?: string[];
};

export type GoalwealthOcrSummaries = {
  total_summaries: number;
  recent_summaries: GoalwealthOcrSummary[];
  by_type?: Record<string, number>;
};

export type GoalwealthPendingActionType =
  | 'update_goal'
  | 'review_document'
  | 'check_balance'
  | 'analyze_portfolio'
  | 'recommend_action';

export type GoalwealthConversationPendingAction = {
  action_type: GoalwealthPendingActionType;
  target: string;
  priority?: number;
  created_at?: string;
};

export type GoalwealthConversationSummary = {
  last_turn_date: string;
  total_turns: number;
  last_topic: string;
  user_intent: string;
  last_message?: string;
  context_needs?: string[];
  pending_actions?: GoalwealthConversationPendingAction[];
};

export type GoalwealthStructuredMessage = {
  code: string;
  message: string;
  severity: GoalwealthSeverity;
  field_path?: string;
};

export type GoalwealthMemoryServiceView = {
  schema_version: '1.0.0';
  user_id: string;
  user_profile: GoalwealthMemoryUserProfile;
  goals: GoalwealthMemoryGoals;
  risk_profile: GoalwealthRiskProfile;
  ocr_summaries: GoalwealthOcrSummaries;
  conversation_summary: GoalwealthConversationSummary;
  last_updated: string;
};

export type GoalwealthOcrOpenclawStatus =
  | 'processed'
  | 'needs_review'
  | 'validation_failed'
  | 'rejected';

export type GoalwealthOcrDirection = 'in' | 'out' | 'unknown';

export type GoalwealthOcrTransactionCandidate = {
  transaction_date: string;
  description: string;
  amount: number;
  direction: GoalwealthOcrDirection;
  category_hint?: string;
  confidence: number;
};

export type GoalwealthOcrHoldingCandidate = {
  ticker: string;
  quantity: number;
  avg_cost?: number;
  market_price?: number;
  market_value?: number;
  confidence?: number;
};

export type GoalwealthOcrDocumentSummary = {
  institution_name?: string;
  currency?: string;
  statement_period?: {
    from?: string;
    to?: string;
  };
  merchant_name?: string;
  broker_name?: string;
  document_date?: string;
};

export type GoalwealthOcrFinancialUpdates = {
  opening_balance?: number;
  closing_balance?: number;
  minimum_due?: number;
  statement_balance?: number;
  gross_income?: number;
  net_income?: number;
  total_amount?: number;
  total_market_value?: number;
  cash_balance?: number;
  premium_amount?: number;
  insured_amount?: number;
  transactions_count?: number;
  holding_count?: number;
  transaction_candidates?: GoalwealthOcrTransactionCandidate[];
  holding_candidates?: GoalwealthOcrHoldingCandidate[];
};

export type GoalwealthOcrFactsEnvelope = {
  document_summary: GoalwealthOcrDocumentSummary;
  financial_updates: GoalwealthOcrFinancialUpdates;
};

export type GoalwealthOcrApplyTarget =
  | 'cashflow'
  | 'income_profile'
  | 'expense_profile'
  | 'asset_snapshot'
  | 'liability_snapshot'
  | 'goal_context'
  | 'portfolio_snapshot';

export type GoalwealthOcrRecommendedAction =
  | 'use_for_context_only'
  | 'ask_user_confirmation_before_apply'
  | 'manual_review_before_apply'
  | 'ignore_for_now';

export type GoalwealthOcrOrchestrationHint = {
  recommended_action: GoalwealthOcrRecommendedAction;
  safe_for_context_use: boolean;
  next_question_hint?: string;
  apply_targets?: GoalwealthOcrApplyTarget[];
};

export type GoalwealthOcrOpenclawView = {
  schema_version: '1.0.0';
  ocr_record_id: string;
  user_id: string;
  document_type: GoalwealthDocumentType;
  status: GoalwealthOcrOpenclawStatus;
  summary_text: string;
  usable: boolean;
  overall_confidence: number;
  manual_review_required: boolean;
  auto_apply_allowed: boolean;
  warnings: GoalwealthStructuredMessage[];
  missing_fields?: string[];
  facts: GoalwealthOcrFactsEnvelope;
  orchestration_hint: GoalwealthOcrOrchestrationHint;
  created_at: string;
  updated_at?: string;
};

export type GoalwealthOcrOpenclawViewQuery = {
  userId: string;
};

export type GoalwealthSmartAgentCaller =
  | 'openclaw_orchestrator'
  | 'adapter_api'
  | 'internal_tool';

export type GoalwealthSmartAgentQueryRequest = {
  query: string;
  user_id?: string;
  top_k?: number;
  categories?: string[];
  freshness_threshold_minutes?: number;
  locale?: string;
  timezone?: string;
  trace_id?: string;
  caller?: GoalwealthSmartAgentCaller;
};

export type GoalwealthSmartAgentResultItem = {
  id: string;
  type: 'article';
  title: string;
  url: string;
  source: string;
  published_at?: string;
  summary: string;
  score: number;
  freshness_score: number;
};

export type GoalwealthSmartAgentFreshness =
  | 'fresh'
  | 'stale'
  | 'empty'
  | 'mixed'
  | 'unknown';

export type GoalwealthSmartAgentMeta = {
  query: string;
  total_results: number;
  freshness: GoalwealthSmartAgentFreshness;
  refresh_triggered: boolean;
  took_ms: number;
  trace_id: string;
};

export type GoalwealthSmartAgentErrorEnvelope =
  | null
  | {
      code: string;
      message: string;
    };

export type GoalwealthSmartAgentRoute =
  | 'semantic_search'
  | 'fresh_news'
  | 'hybrid_search';

export type GoalwealthSmartAgentQueryResponse = {
  status: 'ok' | 'error';
  route: GoalwealthSmartAgentRoute;
  results: GoalwealthSmartAgentResultItem[];
  summary: string;
  meta: GoalwealthSmartAgentMeta;
  error: GoalwealthSmartAgentErrorEnvelope;
};
