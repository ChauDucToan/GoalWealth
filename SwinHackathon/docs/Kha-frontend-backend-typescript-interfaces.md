# Frontend <-> Backend TypeScript Interfaces

## Mục tiêu

File này gom lại các kiểu dữ liệu TypeScript mà frontend đang cần backend trả về ở phạm vi live hiện tại.

Ưu tiên:

1. dễ đối chiếu giữa frontend và backend
2. không kéo theo toàn bộ app
3. bám đúng các flow đang gọi backend thật

## Envelope chung

```ts
type GoalwealthJsonObject = Record<string, unknown>;

type GoalwealthEnvelopeMeta = {
  request_id?: string | null;
  route?: string;
  [key: string]: unknown;
};

type GoalwealthEnvelopeError = {
  code: string;
  message: string;
  details: GoalwealthJsonObject;
};

type GoalwealthSuccessEnvelope<T> = {
  ok: true;
  data: T;
  error: null;
  meta: GoalwealthEnvelopeMeta;
  warnings: string[];
};

type GoalwealthErrorEnvelope = {
  ok: false;
  data: null;
  error: GoalwealthEnvelopeError;
  meta: GoalwealthEnvelopeMeta;
  warnings: string[];
};

type GoalwealthEnvelope<T> = GoalwealthSuccessEnvelope<T> | GoalwealthErrorEnvelope;
```

## Meta endpoints

```ts
type GoalwealthRootData = {
  service: string;
  version: string;
  environment: string;
  docs_enabled: boolean;
};

type GoalwealthHealthData = {
  status: 'ok';
  service: string;
  version?: string;
  environment?: string;
};

type GoalwealthReadyChecks = {
  config_loaded?: boolean;
  docs_mode_known?: boolean;
  oidc_config_present?: boolean;
  openclaw_config_present?: boolean;
  [key: string]: unknown;
};

type GoalwealthReadyData = {
  status: 'ready';
  service: string;
  checks: GoalwealthReadyChecks;
  runtime?: GoalwealthJsonObject;
};
```

## Chat endpoint

### Request

```ts
type GoalwealthChatRequest = {
  message: string;
  session_id?: string;
  locale?: string;
  timezone?: string;
  attachments?: string[];
};
```

### Response

```ts
type GoalwealthChatUsedContext = {
  memory?: boolean;
  ocr_records?: string[];
  smart_agent?: boolean;
  smart_agent_result_count?: number;
  user_present?: boolean;
  [key: string]: unknown;
};

type GoalwealthChatResponseData = {
  session_id: string;
  reply: string;
  warnings: string[];
  used_context: GoalwealthChatUsedContext;
  meta: GoalwealthJsonObject;
};

type GoalwealthChatEnvelope = GoalwealthSuccessEnvelope<GoalwealthChatResponseData>;
```

## OCR endpoints

### OCR ingress request

```ts
type GoalwealthOcrIngressRequest = {
  raw_text: string;
};
```

### OCR ingress response

```ts
type GoalwealthOcrIngressData = {
  ocr_record_id: string;
  status: 'accepted';
  message: string;
  meta: GoalwealthJsonObject;
};

type GoalwealthOcrIngressEnvelope = GoalwealthSuccessEnvelope<GoalwealthOcrIngressData>;
```

### OCR record response

```ts
type GoalwealthOcrRecordStatus = 'pending_user_context' | 'pending_backend' | 'ready';

type GoalwealthOcrRecordData = {
  ocr_record_id: string;
  status: GoalwealthOcrRecordStatus;
  warnings: string[];
  data: GoalwealthJsonObject;
};

type GoalwealthOcrRecordEnvelope = GoalwealthSuccessEnvelope<GoalwealthOcrRecordData>;
```

## User profile tối thiểu

Frontend auth/profile hiện đang cần tối thiểu:

```ts
type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  language?: string;
  currency?: string;
};
```

## Memory view nếu backend cấp tiếp

Đây là nhóm type frontend đã chuẩn bị sẵn, phù hợp nếu backend mở memory API tiếp theo.

```ts
type GoalwealthMemoryLocation = {
  city?: string;
  country?: string;
  timezone?: string;
};

type GoalwealthMemoryUserProfile = {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: GoalwealthMemoryLocation;
  created_at?: string;
  updated_at?: string;
};

type GoalwealthMemoryGoalStatus = 'active' | 'completed' | 'paused' | 'archived';

type GoalwealthMemoryMilestone = {
  milestone_id: string;
  title: string;
  target_amount: number;
  current_progress?: number;
  target_date: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
};

type GoalwealthMemoryGoal = {
  goal_id: string;
  title: string;
  type: string;
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

type GoalwealthMemoryGoals = {
  total_active_goals: number;
  total_goals: number;
  active_goals: GoalwealthMemoryGoal[];
  completed_goals?: GoalwealthMemoryGoal[];
  paused_goals?: GoalwealthMemoryGoal[];
  archived_goals?: GoalwealthMemoryGoal[];
};

type GoalwealthRiskProfile = {
  risk_tolerance?: string;
  calculated_score?: number;
  investment_horizon?: string;
  knowledge_level?: string;
  liquidity_needs?: string;
  created_at?: string;
  updated_at?: string;
  constraints?: Record<string, unknown>;
};

type GoalwealthOcrSummary = {
  ocr_record_id: string;
  document_type: string;
  summary_text: string;
  usable?: boolean;
  overall_confidence?: number;
  document_date?: string;
  amount_involved?: number;
  institution_name?: string;
  created_at: string;
  related_goal_ids?: string[];
};
```

## Tóm tắt

Nếu backend muốn đáp ứng frontend ở phạm vi live hiện tại, chỉ cần khóa chắc 4 nhóm type:

1. envelope chung
2. `GoalwealthReadyData`
3. `GoalwealthChatResponseData`
4. `GoalwealthOcrIngressData` + `GoalwealthOcrRecordData`

Phần `UserProfile` và `Memory*` là bước kế tiếp nên ưu tiên nếu muốn giảm mock trong app.
