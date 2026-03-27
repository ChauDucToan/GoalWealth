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
import { createGoalwealthGoal, getGoalwealthGoals } from '@/services/api/goals';
import type { GoalwealthGoalCreateRequest, GoalwealthGoalRecord } from '@/services/api/types';
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
};

type FinancialGoalsContextValue = {
  goals: FinancialGoalItem[];
  isUsingLiveGoals: boolean;
  isLoading: boolean;
  error: string | null;
  capabilities: FinancialGoalsCapabilities;
  refreshGoals: () => Promise<void>;
  createGoal: (payload: GoalwealthGoalCreateRequest) => Promise<FinancialGoalItem>;
  getGoalById: (goalId?: string | string[] | null) => FinancialGoalItem | null;
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
      return;
    }

    void refreshGoals();
  }, [refreshGoals, shouldUseLiveGoals]);

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
      return mapGoalwealthGoalsToFinancialGoals(nextRecords).find(
        (goal) => goal.id === response.data.goal.goal_id
      )!;
    },
    [liveGoalRecords, shouldUseLiveGoals, userState.accessToken]
  );

  const getGoalById = useCallback(
    (goalId?: string | string[] | null) => findFinancialGoalById(goalId, goals),
    [goals]
  );

  const capabilities = useMemo<FinancialGoalsCapabilities>(
    () => ({
      canCreate: true,
      canEdit: !shouldUseLiveGoals,
      canDelete: !shouldUseLiveGoals,
      canTransfer: !shouldUseLiveGoals,
    }),
    [shouldUseLiveGoals]
  );

  const value = useMemo(
    () => ({
      goals,
      isUsingLiveGoals: shouldUseLiveGoals,
      isLoading,
      error,
      capabilities,
      refreshGoals,
      createGoal,
      getGoalById,
    }),
    [capabilities, createGoal, error, getGoalById, goals, isLoading, refreshGoals, shouldUseLiveGoals]
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
