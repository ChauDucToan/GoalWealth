import React, { createContext, useMemo, useState } from 'react';

export type FinancialAssessmentState = {
  fullName: string;
  purposeId: string | null;
  occupation: string;
  incomeSourceId: string | null;
  monthlyIncome: number;
  savingsRate: number;
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
  isFirstChunkComplete: false,
  isSecondChunkComplete: false,
  isThirdChunkComplete: false,
  isFourthChunkComplete: false,
};

export const FinancialAssessmentContext = createContext<FinancialAssessmentContextValue | null>(null);

export function FinancialAssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FinancialAssessmentState>(initialState);

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
      completeFourthChunk: () =>
        setState((current) => ({
          ...current,
          isFirstChunkComplete: true,
          isSecondChunkComplete: true,
          isThirdChunkComplete: true,
          isFourthChunkComplete: true,
        })),
      restartFirstChunk: () => setState(initialState),
    }),
    [state]
  );

  return <FinancialAssessmentContext.Provider value={value}>{children}</FinancialAssessmentContext.Provider>;
}
