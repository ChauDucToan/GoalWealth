import { useMyUser } from '@/context/myUserContext';
import { isGoalwealthLiveAdapterEnabled } from '@/services/api/config';
import { getGoalwealthRiskProfile, putGoalwealthRiskProfile } from '@/services/api/risk';
import type {
  GoalwealthInvestmentHorizon,
  GoalwealthKnowledgeLevel,
  GoalwealthLiquidityNeeds,
  GoalwealthRiskTolerance,
} from '@/services/api/types';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export type FinancialAssessmentState = {
  fullName: string;
  purposeId: string | null;
  occupation: string;
  incomeSourceId: string | null;
  monthlyIncome: number;
  savingsRate: number;
  liquidAssets: number;
  monthlyObligations: number;
  payFrequencyId: string | null;
  spendingCategoryIds: string[];
  outstandingDebt: number;
  financialGoalId: string | null;
  goalDeadlineLabel: string | null;
  expenseTrackingId: string | null;
  retirementAge: number;
  dependentCount: number;
  financeSituationId: string | null;
  emergencyFundId: string | null;
  emergencyFundMonths: number;
  spendingBehaviourScore: number | null;
  biggestChallengeId: string | null;
  commitmentPhrase: string;
  ocrImportStatus: 'not-started' | 'review-needed' | 'ready';
  persistedRiskTolerance: GoalwealthRiskTolerance | null;
  persistedRiskCalculatedScore: number | null;
  persistedInvestmentHorizon: GoalwealthInvestmentHorizon | null;
  persistedKnowledgeLevel: GoalwealthKnowledgeLevel | null;
  persistedLiquidityNeeds: GoalwealthLiquidityNeeds | null;
  persistedMaxLoss: number | null;
  persistedMinReturn: number | null;
  riskProfileSource: 'local' | 'goalwealth';
  isFirstChunkComplete: boolean;
  isSecondChunkComplete: boolean;
  isThirdChunkComplete: boolean;
  isFourthChunkComplete: boolean;
};

type FinancialAssessmentContextValue = {
  state: FinancialAssessmentState;
  setFullName: (value: string) => void;
  setPurposeId: (value: string) => void;
  setOccupation: (value: string) => void;
  setIncomeSourceId: (value: string) => void;
  setMonthlyIncome: (value: number) => void;
  setSavingsRate: (value: number) => void;
  setLiquidAssets: (value: number) => void;
  setMonthlyObligations: (value: number) => void;
  setPayFrequencyId: (value: string) => void;
  toggleSpendingCategoryId: (value: string) => void;
  setOutstandingDebt: (value: number) => void;
  setFinancialGoalId: (value: string) => void;
  setGoalDeadlineLabel: (value: string) => void;
  setExpenseTrackingId: (value: string) => void;
  setRetirementAge: (value: number) => void;
  setDependentCount: (value: number) => void;
  setFinanceSituationId: (value: string) => void;
  setEmergencyFundId: (value: string) => void;
  setEmergencyFundMonths: (value: number) => void;
  setSpendingBehaviourScore: (value: number) => void;
  setBiggestChallengeId: (value: string) => void;
  setOcrImportStatus: (value: 'not-started' | 'review-needed' | 'ready') => void;
  saveRiskProfile: () => Promise<void>;
  completeFirstChunk: () => void;
  completeSecondChunk: () => void;
  completeThirdChunk: () => void;
  completeFourthChunk: () => void;
  restartFirstChunk: () => void;
};

const initialState: FinancialAssessmentState = {
  fullName: '',
  purposeId: null,
  occupation: '',
  incomeSourceId: null,
  monthlyIncome: 5000,
  savingsRate: 25,
  liquidAssets: 9000,
  monthlyObligations: 1800,
  payFrequencyId: null,
  spendingCategoryIds: [],
  outstandingDebt: 5000,
  financialGoalId: null,
  goalDeadlineLabel: null,
  expenseTrackingId: null,
  retirementAge: 67,
  dependentCount: 5,
  financeSituationId: null,
  emergencyFundId: null,
  emergencyFundMonths: 12,
  spendingBehaviourScore: null,
  biggestChallengeId: null,
  commitmentPhrase: 'I commit to building a better financial life with Finpal.',
  ocrImportStatus: 'review-needed',
  persistedRiskTolerance: null,
  persistedRiskCalculatedScore: null,
  persistedInvestmentHorizon: null,
  persistedKnowledgeLevel: null,
  persistedLiquidityNeeds: null,
  persistedMaxLoss: null,
  persistedMinReturn: null,
  riskProfileSource: 'local',
  isFirstChunkComplete: false,
  isSecondChunkComplete: false,
  isThirdChunkComplete: false,
  isFourthChunkComplete: false,
};

export const FinancialAssessmentContext = createContext<FinancialAssessmentContextValue | null>(null);

function calculateAssessmentScore(state: FinancialAssessmentState) {
  const monthlySaved = Math.round((state.monthlyIncome * state.savingsRate) / 100);
  const debtPressureRatio = state.monthlyIncome > 0 ? state.outstandingDebt / state.monthlyIncome : 0;
  const behaviourScore = state.spendingBehaviourScore ?? 3;

  return Math.max(
    0,
    Math.min(
      100,
      40 +
        state.savingsRate * 1.2 +
        Math.min(state.emergencyFundMonths, 6) * 5 -
        Math.min(debtPressureRatio * 6, 22) -
        Math.max(0, 3 - behaviourScore) * 6 +
        Math.min(monthlySaved / 250, 6)
    )
  );
}

function deriveRiskTolerance(state: FinancialAssessmentState): GoalwealthRiskTolerance {
  const behaviourScore = state.spendingBehaviourScore ?? 3;

  if (state.emergencyFundMonths >= 6 && behaviourScore >= 4) {
    return 'growth';
  }

  if (state.emergencyFundMonths >= 3) {
    return 'balanced';
  }

  return 'conservative';
}

function deriveInvestmentHorizon(state: FinancialAssessmentState): GoalwealthInvestmentHorizon {
  if (state.financialGoalId === 'retirement') {
    return 'long_term';
  }

  if (!state.goalDeadlineLabel) {
    return 'medium_term';
  }

  const targetDate = new Date(state.goalDeadlineLabel);
  if (Number.isNaN(targetDate.getTime())) {
    return 'medium_term';
  }

  const diffDays = (targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

  if (diffDays <= 365) {
    return 'short_term';
  }

  if (diffDays <= 365 * 3) {
    return 'medium_term';
  }

  return 'long_term';
}

function deriveKnowledgeLevel(state: FinancialAssessmentState): GoalwealthKnowledgeLevel {
  if (state.expenseTrackingId === 'automatic') {
    return 'advanced';
  }

  if (state.expenseTrackingId === 'manual' || state.expenseTrackingId === 'partial') {
    return 'intermediate';
  }

  return 'beginner';
}

function deriveLiquidityNeeds(state: FinancialAssessmentState): GoalwealthLiquidityNeeds {
  if (state.financeSituationId === 'stressed' || state.emergencyFundId === 'no') {
    return 'high';
  }

  if (state.financeSituationId === 'neutral') {
    return 'medium';
  }

  return 'low';
}

function deriveLossAndReturnTargets(riskTolerance: GoalwealthRiskTolerance) {
  switch (riskTolerance) {
    case 'aggressive':
      return { maxLoss: 20, minReturn: 10 };
    case 'growth':
      return { maxLoss: 15, minReturn: 8 };
    case 'balanced':
    case 'moderate':
      return { maxLoss: 10, minReturn: 6 };
    default:
      return { maxLoss: 5, minReturn: 4 };
  }
}

export function FinancialAssessmentProvider({ children }: { children: React.ReactNode }) {
  const { state: userState } = useMyUser();
  const liveAdapterEnabled = isGoalwealthLiveAdapterEnabled();
  const [state, setState] = useState<FinancialAssessmentState>(initialState);

  useEffect(() => {
    if (
      !liveAdapterEnabled ||
      !userState.isAuthenticated ||
      !userState.accessToken?.trim() ||
      userState.authMode === 'registered-password'
    ) {
      return;
    }

    let cancelled = false;

    void getGoalwealthRiskProfile(userState.accessToken)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setState((current) => ({
          ...current,
          persistedRiskTolerance: response.data.risk_profile.risk_tolerance,
          persistedRiskCalculatedScore: response.data.risk_profile.calculated_score,
          persistedInvestmentHorizon: response.data.risk_profile.investment_horizon,
          persistedKnowledgeLevel: response.data.risk_profile.knowledge_level,
          persistedLiquidityNeeds: response.data.risk_profile.liquidity_needs,
          persistedMaxLoss: response.data.risk_profile.max_loss,
          persistedMinReturn: response.data.risk_profile.min_return,
          riskProfileSource: response.data.source === 'persistence' ? 'goalwealth' : 'local',
        }));
      })
      .catch(() => {
        // Assessment flow can continue locally if risk-profile is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [
    liveAdapterEnabled,
    userState.accessToken,
    userState.authMode,
    userState.isAuthenticated,
  ]);

  const saveRiskProfile = useCallback(async () => {
    if (
      !liveAdapterEnabled ||
      !userState.isAuthenticated ||
      !userState.accessToken?.trim() ||
      userState.authMode === 'registered-password'
    ) {
      return;
    }

    const riskTolerance = deriveRiskTolerance(state);
    const calculatedScore = calculateAssessmentScore(state);
    const investmentHorizon = deriveInvestmentHorizon(state);
    const knowledgeLevel = deriveKnowledgeLevel(state);
    const liquidityNeeds = deriveLiquidityNeeds(state);
    const { maxLoss, minReturn } = deriveLossAndReturnTargets(riskTolerance);

    try {
      const response = await putGoalwealthRiskProfile(
        {
          risk_tolerance: riskTolerance,
          calculated_score: calculatedScore,
          investment_horizon: investmentHorizon,
          knowledge_level: knowledgeLevel,
          liquidity_needs: liquidityNeeds,
          max_loss: maxLoss,
          min_return: minReturn,
        },
        userState.accessToken
      );

      setState((current) => ({
        ...current,
        persistedRiskTolerance: response.data.risk_profile.risk_tolerance,
        persistedRiskCalculatedScore: response.data.risk_profile.calculated_score,
        persistedInvestmentHorizon: response.data.risk_profile.investment_horizon,
        persistedKnowledgeLevel: response.data.risk_profile.knowledge_level,
        persistedLiquidityNeeds: response.data.risk_profile.liquidity_needs,
        persistedMaxLoss: response.data.risk_profile.max_loss,
        persistedMinReturn: response.data.risk_profile.min_return,
        riskProfileSource: response.data.source === 'persistence' ? 'goalwealth' : current.riskProfileSource,
      }));
    } catch {
      // Keep the assessment flow usable even if backend persistence is temporarily unavailable.
    }
  }, [
    liveAdapterEnabled,
    state,
    userState.accessToken,
    userState.authMode,
    userState.isAuthenticated,
  ]);

  const completeFourthChunk = useCallback(() => {
    setState((current) => ({
      ...current,
      isFirstChunkComplete: true,
      isSecondChunkComplete: true,
      isThirdChunkComplete: true,
      isFourthChunkComplete: true,
    }));
    void saveRiskProfile();
  }, [saveRiskProfile]);

  const value = useMemo<FinancialAssessmentContextValue>(
    () => ({
      state,
      setFullName: (value) => setState((current) => ({ ...current, fullName: value })),
      setPurposeId: (value) => setState((current) => ({ ...current, purposeId: value })),
      setOccupation: (value) => setState((current) => ({ ...current, occupation: value })),
      setIncomeSourceId: (value) => setState((current) => ({ ...current, incomeSourceId: value })),
      setMonthlyIncome: (value) =>
        setState((current) => ({ ...current, monthlyIncome: Math.max(0, Math.round(value)) })),
      setSavingsRate: (value) =>
        setState((current) => ({ ...current, savingsRate: Math.max(0, Math.min(100, Math.round(value))) })),
      setLiquidAssets: (value) =>
        setState((current) => ({ ...current, liquidAssets: Math.max(0, Math.round(value)) })),
      setMonthlyObligations: (value) =>
        setState((current) => ({ ...current, monthlyObligations: Math.max(0, Math.round(value)) })),
      setPayFrequencyId: (value) => setState((current) => ({ ...current, payFrequencyId: value })),
      toggleSpendingCategoryId: (value) =>
        setState((current) => {
          const exists = current.spendingCategoryIds.includes(value);

          if (exists) {
            return {
              ...current,
              spendingCategoryIds: current.spendingCategoryIds.filter((item) => item !== value),
            };
          }

          if (current.spendingCategoryIds.length >= 3) {
            return {
              ...current,
              spendingCategoryIds: [...current.spendingCategoryIds.slice(1), value],
            };
          }

          return {
            ...current,
            spendingCategoryIds: [...current.spendingCategoryIds, value],
          };
        }),
      setOutstandingDebt: (value) =>
        setState((current) => ({ ...current, outstandingDebt: Math.max(0, Math.round(value)) })),
      setFinancialGoalId: (value) => setState((current) => ({ ...current, financialGoalId: value })),
      setGoalDeadlineLabel: (value) => setState((current) => ({ ...current, goalDeadlineLabel: value })),
      setExpenseTrackingId: (value) => setState((current) => ({ ...current, expenseTrackingId: value })),
      setRetirementAge: (value) =>
        setState((current) => ({ ...current, retirementAge: Math.max(45, Math.min(80, Math.round(value))) })),
      setDependentCount: (value) =>
        setState((current) => ({ ...current, dependentCount: Math.max(0, Math.min(12, Math.round(value))) })),
      setFinanceSituationId: (value) => setState((current) => ({ ...current, financeSituationId: value })),
      setEmergencyFundId: (value) => setState((current) => ({ ...current, emergencyFundId: value })),
      setEmergencyFundMonths: (value) =>
        setState((current) => ({ ...current, emergencyFundMonths: Math.max(0, Math.min(36, Math.round(value))) })),
      setSpendingBehaviourScore: (value) =>
        setState((current) => ({ ...current, spendingBehaviourScore: Math.max(1, Math.min(5, Math.round(value))) })),
      setBiggestChallengeId: (value) => setState((current) => ({ ...current, biggestChallengeId: value })),
      setOcrImportStatus: (value) => setState((current) => ({ ...current, ocrImportStatus: value })),
      saveRiskProfile,
      completeFirstChunk: () => setState((current) => ({ ...current, isFirstChunkComplete: true })),
      completeSecondChunk: () =>
        setState((current) => ({
          ...current,
          isFirstChunkComplete: true,
          isSecondChunkComplete: true,
        })),
      completeThirdChunk: () =>
        setState((current) => ({
          ...current,
          isFirstChunkComplete: true,
          isSecondChunkComplete: true,
          isThirdChunkComplete: true,
        })),
      completeFourthChunk,
      restartFirstChunk: () => setState(initialState),
    }),
    [completeFourthChunk, saveRiskProfile, state]
  );

  return <FinancialAssessmentContext.Provider value={value}>{children}</FinancialAssessmentContext.Provider>;
}
