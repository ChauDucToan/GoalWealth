import type { Href } from '@/lib/expo-router';

type GoalCreateParams = {
  goalId?: string;
  accountId?: string;
  mode?: 'create' | 'edit';
};

type GoalAccountParams = {
  goalId?: string;
  accountId?: string;
  origin?: 'create' | 'transfer' | 'detail';
  mode?: 'create' | 'edit' | 'topup' | 'recurring';
};

type GoalTransferParams = {
  goalId?: string;
  accountId?: string;
  mode?: 'topup' | 'recurring';
};

type GoalHistoryParams = {
  goalId?: string;
};

type GoalResultMode = 'created' | 'updated' | 'transferred' | 'recurring' | 'deleted';

type GoalResultParams = {
  goalId?: string;
  mode?: GoalResultMode;
};

export function getFinancialGoalsDashboardHref(): Href {
  return '/(finance)/financial-goals';
}

export function getFinancialGoalDetailHref(goalId?: string): Href {
  if (!goalId) {
    return getFinancialGoalsDashboardHref();
  }

  return {
    pathname: '/(finance)/financial-goals/[goalId]',
    params: { goalId },
  };
}

export function getCreateBackHref(params: GoalCreateParams): Href {
  if (params.mode === 'edit') {
    return getFinancialGoalDetailHref(params.goalId);
  }

  return getFinancialGoalsDashboardHref();
}

export function getAccountBackHref(params: GoalAccountParams): Href {
  if (params.origin === 'transfer') {
    return {
      pathname: '/(finance)/financial-goals/transfer',
      params: {
        goalId: params.goalId,
        accountId: params.accountId,
        mode: params.mode === 'recurring' ? 'recurring' : 'topup',
      },
    };
  }

  if (params.origin === 'detail') {
    return getFinancialGoalDetailHref(params.goalId);
  }

  return {
    pathname: '/(finance)/financial-goals/create',
    params: {
      goalId: params.goalId,
      accountId: params.accountId,
      mode: params.mode === 'edit' ? 'edit' : 'create',
    },
  };
}

export function getTransferBackHref(params: GoalTransferParams): Href {
  return getFinancialGoalDetailHref(params.goalId);
}

export function getHistoryBackHref(params: GoalHistoryParams): Href {
  return getFinancialGoalDetailHref(params.goalId);
}

export function getDeleteBackHref(goalId?: string): Href {
  return getFinancialGoalDetailHref(goalId);
}

export function getResultBackHref(params: GoalResultParams): Href {
  if (params.mode === 'deleted' || params.mode === 'created') {
    return getFinancialGoalsDashboardHref();
  }

  return getFinancialGoalDetailHref(params.goalId);
}
