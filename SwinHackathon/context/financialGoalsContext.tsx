import {
  financialGoals as mockFinancialGoals,
  findFinancialGoalById,
  FinancialGoalItem,
} from '@/components/financial-goals/data';
import {
  buildLocalGoalwealthGoalRecord,
  mapGoalwealthGoalsToFinancialGoals,
} from '@/components/financial-goals/live';
import { useMyUser } from '@/context/myUserContext';
import { normalizeGoalwealthError } from '@/services/api/errors';
import { isGoalwealthLiveAdapterEnabled } from '@/services/api/config';
import {
  createGoalwealthGoal,
  getGoalwealthGoal,
  getGoalwealthGoals,
  updateGoalwealthGoal,
} from '@/services/api/goals';
import {
  completeGoalwealthRecommendation,
  dismissGoalwealthRecommendation,
  getGoalwealthRecommendations,
} from '@/services/api/recommendations';
import type {
  GoalwealthGoalCreateRequest,
  GoalwealthGoalRecord,
  GoalwealthGoalUpdateRequest,
  GoalwealthRecommendationGoalPrefill,
  GoalwealthRecommendationItem,
} from '@/services/api/types';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type FinancialGoalsCapabilities = {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canTransfer: boolean;
  canViewHistory: boolean;
  canManageFundingAccount: boolean;
  canConfigureFundingPlan: boolean;
  canViewDerivedInsights: boolean;
};

type FinancialGoalsContextValue = {
  goals: FinancialGoalItem[];
  isUsingLiveGoals: boolean;
  isLoading: boolean;
  error: string | null;
  goalRecommendation: GoalwealthRecommendationItem | null;
  isGoalRecommendationLoading: boolean;
  goalRecommendationError: string | null;
  capabilities: FinancialGoalsCapabilities;
  refreshGoals: () => Promise<void>;
  refreshGoalRecommendation: () => Promise<void>;
  dismissGoalRecommendation: (recommendationId: string) => Promise<void>;
  completeGoalRecommendation: (
    recommendationId: string,
    targetPath?: string | null
  ) => Promise<GoalwealthRecommendationGoalPrefill>;
  clearGoalRecommendationPrefill: () => void;
  createGoal: (payload: GoalwealthGoalCreateRequest) => Promise<FinancialGoalItem>;
  refreshGoal: (goalId: string) => Promise<FinancialGoalItem | null>;
  updateGoal: (goalId: string, payload: GoalwealthGoalUpdateRequest) => Promise<FinancialGoalItem>;
  getGoalById: (goalId?: string | string[] | null) => FinancialGoalItem | null;
  appliedGoalRecommendationPrefill: GoalwealthRecommendationGoalPrefill | null;
};

const FinancialGoalsContext = createContext<FinancialGoalsContextValue | null>(null);

export function FinancialGoalsProvider({ children }: { children: React.ReactNode }) {
  const { state: userState, isSessionReady } = useMyUser();
  const liveAdapterEnabled = isGoalwealthLiveAdapterEnabled();
  const shouldUseLiveGoals =
    liveAdapterEnabled &&
    isSessionReady &&
    userState.isAuthenticated &&
    Boolean(userState.accessToken?.trim()) &&
    userState.authMode !== 'registered-password';
  const [mockGoals, setMockGoals] = useState<FinancialGoalItem[]>(mockFinancialGoals);
  const [liveGoalRecords, setLiveGoalRecords] = useState<GoalwealthGoalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goalRecommendation, setGoalRecommendation] =
    useState<GoalwealthRecommendationItem | null>(null);
  const [isGoalRecommendationLoading, setIsGoalRecommendationLoading] = useState(false);
  const [goalRecommendationError, setGoalRecommendationError] = useState<string | null>(null);
  const [appliedGoalRecommendationPrefill, setAppliedGoalRecommendationPrefill] =
    useState<GoalwealthRecommendationGoalPrefill | null>(null);

  const goals = useMemo(
    () => (shouldUseLiveGoals ? mapGoalwealthGoalsToFinancialGoals(liveGoalRecords) : mockGoals),
    [liveGoalRecords, mockGoals, shouldUseLiveGoals]
  );

  const refreshGoals = useCallback(async () => {
    if (!shouldUseLiveGoals) {
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getGoalwealthGoals(userState.accessToken);
      setLiveGoalRecords(response.data.goals);
    } catch (incomingError) {
      const normalizedError = normalizeGoalwealthError(incomingError);
      setLiveGoalRecords([]);
      setError(normalizedError.message);
    } finally {
      setIsLoading(false);
    }
  }, [shouldUseLiveGoals, userState.accessToken]);

  useEffect(() => {
    if (!shouldUseLiveGoals) {
      setLiveGoalRecords([]);
      setError(null);
      setIsLoading(false);
      setGoalRecommendation(null);
      setGoalRecommendationError(null);
      setIsGoalRecommendationLoading(false);
      setAppliedGoalRecommendationPrefill(null);
      return;
    }

    void refreshGoals();
  }, [refreshGoals, shouldUseLiveGoals]);

  const refreshGoalRecommendation = useCallback(async () => {
    if (!shouldUseLiveGoals) {
      setGoalRecommendation(null);
      setGoalRecommendationError(null);
      setIsGoalRecommendationLoading(false);
      return;
    }

    setIsGoalRecommendationLoading(true);
    setGoalRecommendationError(null);

    try {
      let response;
      try {
        response = await getGoalwealthRecommendations(userState.accessToken, {
          scope: 'goals',
          limit: 1,
        });
      } catch (incomingError) {
        const normalizedError = normalizeGoalwealthError(incomingError);

        if (
          normalizedError.code === 'BAD_REQUEST' &&
          normalizedError.message.toLowerCase().includes('status is invalid')
        ) {
          response = await getGoalwealthRecommendations(userState.accessToken, {
            scope: 'goals',
            status: 'open',
            limit: 1,
          });
        } else {
          throw incomingError;
        }
      }

      setGoalRecommendation(response.data.items[0] ?? null);
    } catch (incomingError) {
      const normalizedError = normalizeGoalwealthError(incomingError);

      if (normalizedError.status === 404 || normalizedError.code === 'NOT_FOUND') {
        setGoalRecommendation(null);
        setGoalRecommendationError(null);
      } else {
        setGoalRecommendation(null);
        setGoalRecommendationError(
          normalizedError.code === 'AUTH_REQUIRED'
            ? normalizedError.message
            : 'GoalWealth goals recommendation is not available right now.'
        );
      }
    } finally {
      setIsGoalRecommendationLoading(false);
    }
  }, [shouldUseLiveGoals, userState.accessToken]);

  useEffect(() => {
    if (!shouldUseLiveGoals) {
      return;
    }

    void refreshGoalRecommendation();
  }, [refreshGoalRecommendation, shouldUseLiveGoals]);

  const createGoal = useCallback(
    async (payload: GoalwealthGoalCreateRequest) => {
      if (!shouldUseLiveGoals) {
        const localRecord = buildLocalGoalwealthGoalRecord(payload);
        const localGoal = mapGoalwealthGoalsToFinancialGoals([localRecord])[0];
        setMockGoals((current) =>
          [...current, localGoal].sort((left, right) => left.priorityOrder - right.priorityOrder)
        );
        return localGoal;
      }

      const response = await createGoalwealthGoal(payload, userState.accessToken);
      const nextRecords = [response.data.goal, ...liveGoalRecords];
      setLiveGoalRecords(nextRecords);
      void refreshGoalRecommendation();
      return mapGoalwealthGoalsToFinancialGoals(nextRecords).find(
        (goal) => goal.id === response.data.goal.goal_id
      )!;
    },
    [liveGoalRecords, refreshGoalRecommendation, shouldUseLiveGoals, userState.accessToken]
  );

  const refreshGoal = useCallback(
    async (goalId: string) => {
      if (!goalId) {
        return null;
      }

      if (!shouldUseLiveGoals) {
        return findFinancialGoalById(goalId, mockGoals);
      }

      const response = await getGoalwealthGoal(goalId, userState.accessToken);
      setLiveGoalRecords((current) => {
        const next = current.filter((record) => record.goal_id !== goalId);
        return [response.data.goal, ...next];
      });
      return mapGoalwealthGoalsToFinancialGoals([response.data.goal])[0] ?? null;
    },
    [mockGoals, shouldUseLiveGoals, userState.accessToken]
  );

  const updateGoal = useCallback(
    async (goalId: string, payload: GoalwealthGoalUpdateRequest) => {
      if (!goalId) {
        throw new Error('Goal ID is required');
      }

      if (!shouldUseLiveGoals) {
        const existingGoal = findFinancialGoalById(goalId, mockGoals);
        if (!existingGoal) {
          throw new Error('Goal not found');
        }
        return existingGoal;
      }

      const response = await updateGoalwealthGoal(goalId, payload, userState.accessToken);
      setLiveGoalRecords((current) =>
        current.map((record) => (record.goal_id === goalId ? response.data.goal : record))
      );
      return mapGoalwealthGoalsToFinancialGoals([response.data.goal])[0]!;
    },
    [mockGoals, shouldUseLiveGoals, userState.accessToken]
  );

  const dismissGoalRecommendation = useCallback(
    async (recommendationId: string) => {
      if (!shouldUseLiveGoals || !recommendationId) {
        return;
      }

      await dismissGoalwealthRecommendation(recommendationId, userState.accessToken);
      await refreshGoalRecommendation();
    },
    [refreshGoalRecommendation, shouldUseLiveGoals, userState.accessToken]
  );

  const completeGoalRecommendation = useCallback(
    async (recommendationId: string, targetPath?: string | null) => {
      if (!shouldUseLiveGoals || !recommendationId) {
        throw new Error('Goal recommendation is not available');
      }

      const response = await completeGoalwealthRecommendation(
        recommendationId,
        userState.accessToken,
        targetPath
      );
      setAppliedGoalRecommendationPrefill(response.data.goal_prefill);
      setGoalRecommendation((current) =>
        current && current.id === recommendationId
          ? { ...current, status: response.data.status }
          : current
      );
      return response.data.goal_prefill;
    },
    [shouldUseLiveGoals, userState.accessToken]
  );

  const clearGoalRecommendationPrefill = useCallback(() => {
    setAppliedGoalRecommendationPrefill(null);
  }, []);

  const getGoalById = useCallback(
    (goalId?: string | string[] | null) => findFinancialGoalById(goalId, goals),
    [goals]
  );

  const capabilities = useMemo<FinancialGoalsCapabilities>(
    () => ({
      canCreate: true,
      canEdit: true,
      canDelete: !shouldUseLiveGoals,
      canTransfer: !shouldUseLiveGoals,
      canViewHistory: !shouldUseLiveGoals,
      canManageFundingAccount: !shouldUseLiveGoals,
      canConfigureFundingPlan: !shouldUseLiveGoals,
      canViewDerivedInsights: !shouldUseLiveGoals,
    }),
    [shouldUseLiveGoals]
  );

  const value = useMemo(
    () => ({
      goals,
      isUsingLiveGoals: shouldUseLiveGoals,
      isLoading,
      error,
      goalRecommendation,
      isGoalRecommendationLoading,
      goalRecommendationError,
      capabilities,
      refreshGoals,
      refreshGoalRecommendation,
      dismissGoalRecommendation,
      completeGoalRecommendation,
      clearGoalRecommendationPrefill,
      createGoal,
      refreshGoal,
      updateGoal,
      getGoalById,
      appliedGoalRecommendationPrefill,
    }),
    [
      appliedGoalRecommendationPrefill,
      capabilities,
      clearGoalRecommendationPrefill,
      completeGoalRecommendation,
      createGoal,
      dismissGoalRecommendation,
      error,
      getGoalById,
      goalRecommendation,
      goalRecommendationError,
      goals,
      isGoalRecommendationLoading,
      isLoading,
      refreshGoal,
      refreshGoalRecommendation,
      refreshGoals,
      shouldUseLiveGoals,
      updateGoal,
    ]
  );

  return <FinancialGoalsContext.Provider value={value}>{children}</FinancialGoalsContext.Provider>;
}

export function useFinancialGoalsContext() {
  const context = useContext(FinancialGoalsContext);
  if (!context) {
    throw new Error('useFinancialGoalsContext must be used inside FinancialGoalsProvider');
  }

  return context;
}
