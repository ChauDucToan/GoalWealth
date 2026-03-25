import React, { createContext, useMemo, useState } from 'react';
import { SubscriptionCycle } from '@/components/finance/subscription-data';

export type SubscriptionDraftState = {
  serviceId: string;
  type: string;
  amount: string;
  nextPayment: string;
  cycle: SubscriptionCycle;
};

type SubscriptionSetupContextValue = {
  state: SubscriptionDraftState;
  setServiceId: (value: string) => void;
  setType: (value: string) => void;
  setAmount: (value: string) => void;
  setNextPayment: (value: string) => void;
  setCycle: (value: SubscriptionCycle) => void;
  resetDraft: () => void;
};

const initialState: SubscriptionDraftState = {
  serviceId: 'netflix',
  type: 'Entertainment',
  amount: '10',
  nextPayment: 'Jul 28, 2023',
  cycle: 'Monthly',
};

export const SubscriptionSetupContext = createContext<SubscriptionSetupContextValue | null>(null);

export function SubscriptionSetupProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SubscriptionDraftState>(initialState);

  const value = useMemo<SubscriptionSetupContextValue>(
    () => ({
      state,
      setServiceId: (value) => setState((current) => ({ ...current, serviceId: value })),
      setType: (value) => setState((current) => ({ ...current, type: value })),
      setAmount: (value) => setState((current) => ({ ...current, amount: value })),
      setNextPayment: (value) => setState((current) => ({ ...current, nextPayment: value })),
      setCycle: (value) => setState((current) => ({ ...current, cycle: value })),
      resetDraft: () => setState(initialState),
    }),
    [state]
  );

  return <SubscriptionSetupContext.Provider value={value}>{children}</SubscriptionSetupContext.Provider>;
}
