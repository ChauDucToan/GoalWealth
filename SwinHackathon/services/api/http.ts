import { goalwealthApiConfig, isGoalwealthAdapterConfigured } from '@/services/api/config';
import { GoalwealthApiError, buildGoalwealthEnvelopeError } from '@/services/api/errors';
import type { GoalwealthEnvelope, GoalwealthSuccess } from '@/services/api/types';

type GoalwealthRequestOptions = {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  accessToken?: string | null;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

function createRequestId() {
  return `gw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeAuthorization(accessToken?: string | null) {
  if (!accessToken?.trim()) {
    return null;
  }

  const cleaned = accessToken.trim();
  if (cleaned.toLowerCase().startsWith('bearer ')) {
    return cleaned;
  }

  return `Bearer ${cleaned}`;
}

function normalizePath(path: string) {
  const trimmed = path.trim();
  if (!trimmed) {
    return '/';
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function isEnvelopeLike(payload: unknown): payload is GoalwealthEnvelope<unknown> {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  return (
    typeof candidate.ok === 'boolean' &&
    'data' in candidate &&
    'error' in candidate &&
    'meta' in candidate &&
    Array.isArray(candidate.warnings)
  );
}

export async function requestGoalwealth<T>({
  path,
  method = 'GET',
  accessToken,
  body,
  headers,
  timeoutMs = goalwealthApiConfig.requestTimeoutMs,
}: GoalwealthRequestOptions): Promise<GoalwealthSuccess<T>> {
  if (!isGoalwealthAdapterConfigured()) {
    throw new GoalwealthApiError({
      code: 'ADAPTER_NOT_CONFIGURED',
      message:
        'GoalWealth adapter base URL is missing. Set EXPO_PUBLIC_GOALWEALTH_API_BASE_URL first.',
    });
  }

  const requestId = createRequestId();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const authHeader = normalizeAuthorization(accessToken);

  try {
    const response = await fetch(`${goalwealthApiConfig.baseUrl}${normalizePath(path)}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(authHeader ? { Authorization: authHeader } : {}),
        'X-Request-Id': requestId,
        ...(headers ?? {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const rawText = await response.text();
    let payload: unknown = null;

    try {
      payload = rawText ? JSON.parse(rawText) : null;
    } catch {
      throw new GoalwealthApiError({
        code: 'INVALID_RESPONSE',
        message: 'GoalWealth adapter returned invalid JSON.',
        status: response.status,
        requestId,
      });
    }

    if (!isEnvelopeLike(payload)) {
      throw new GoalwealthApiError({
        code: 'INVALID_ENVELOPE',
        message: 'GoalWealth adapter response did not match the expected envelope.',
        status: response.status,
        requestId,
      });
    }

    const envelope = payload as GoalwealthEnvelope<T>;
    const responseRequestId =
      typeof envelope.meta?.request_id === 'string'
        ? envelope.meta.request_id
        : response.headers.get('x-request-id') ?? requestId;

    if (!response.ok || !envelope.ok) {
      const normalizedError = buildGoalwealthEnvelopeError(
        envelope.error,
        'GoalWealth adapter request failed.'
      );

      throw new GoalwealthApiError({
        code: normalizedError.code,
        message: normalizedError.message,
        status: response.status,
        details: normalizedError.details,
        requestId: responseRequestId,
        warnings: envelope.warnings,
      });
    }

    return {
      data: envelope.data as T,
      meta: envelope.meta ?? {},
      warnings: envelope.warnings ?? [],
      requestId: responseRequestId,
    };
  } catch (error) {
    if (error instanceof GoalwealthApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new GoalwealthApiError({
        code: 'REQUEST_TIMEOUT',
        message: 'GoalWealth adapter request timed out.',
        requestId,
      });
    }

    throw new GoalwealthApiError({
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Unable to reach the GoalWealth adapter.',
      requestId,
    });
  } finally {
    clearTimeout(timer);
  }
}
