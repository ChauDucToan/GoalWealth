export type GoalwealthEnvelopeError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type GoalwealthEnvelopeMeta = {
  request_id?: string | null;
  [key: string]: unknown;
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

export type GoalwealthReadyData = {
  status: 'ready';
  service: string;
  checks: {
    config_loaded?: boolean;
    docs_mode_known?: boolean;
    oidc_config_present?: boolean;
    openclaw_config_present?: boolean;
    [key: string]: unknown;
  };
  runtime?: Record<string, unknown>;
};

export type GoalwealthEnvelope<T> = {
  ok: boolean;
  data: T | null;
  error: GoalwealthEnvelopeError | null;
  meta: GoalwealthEnvelopeMeta;
  warnings: string[];
};

export type GoalwealthSuccess<T> = {
  data: T;
  meta: GoalwealthEnvelopeMeta;
  warnings: string[];
  requestId: string | null;
};

export type GoalwealthChatRequest = {
  message: string;
  session_id?: string;
  locale?: string;
  timezone?: string;
  attachments?: string[];
};

export type GoalwealthChatResponseData = {
  session_id: string;
  reply: string;
  warnings: string[];
  used_context: {
    memory?: boolean;
    ocr_records?: string[];
    smart_agent?: boolean;
    smart_agent_result_count?: number;
    user_present?: boolean;
    [key: string]: unknown;
  };
  meta: Record<string, unknown>;
};

export type GoalwealthOcrIngressRequest = {
  raw_text: string;
};

export type GoalwealthOcrIngressData = {
  ocr_record_id: string;
  status: 'accepted';
  message: string;
  meta: Record<string, unknown>;
};

export type GoalwealthOcrRecordData = {
  ocr_record_id: string;
  status: 'pending_user_context' | 'pending_backend' | 'ready';
  warnings: string[];
  data: Record<string, unknown>;
};
