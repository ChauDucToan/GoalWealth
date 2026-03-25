import type { GoalwealthEnvelopeError } from '@/services/api/types';

type GoalwealthApiErrorParams = {
  code: string;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
  requestId?: string | null;
  warnings?: string[];
};

export class GoalwealthApiError extends Error {
  code: string;
  status: number | null;
  details: Record<string, unknown> | null;
  requestId: string | null;
  warnings: string[];

  constructor({
    code,
    message,
    status,
    details,
    requestId,
    warnings,
  }: GoalwealthApiErrorParams) {
    super(message);
    this.name = 'GoalwealthApiError';
    this.code = code;
    this.status = typeof status === 'number' ? status : null;
    this.details = details ?? null;
    this.requestId = requestId ?? null;
    this.warnings = [...(warnings ?? [])];
  }
}

export function normalizeGoalwealthError(error: unknown) {
  if (error instanceof GoalwealthApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new GoalwealthApiError({
      code: 'UNEXPECTED_ERROR',
      message: error.message,
    });
  }

  return new GoalwealthApiError({
    code: 'UNEXPECTED_ERROR',
    message: 'Something went wrong while contacting GoalWealth.',
  });
}

export function buildGoalwealthEnvelopeError(
  error: GoalwealthEnvelopeError | null | undefined,
  fallbackMessage: string
) {
  if (!error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: fallbackMessage,
      details: {},
    };
  }

  return {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message || fallbackMessage,
    details: error.details ?? {},
  };
}
