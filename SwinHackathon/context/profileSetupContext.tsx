import React, { createContext, useMemo, useState } from 'react';

export type ProfileSetupState = {
  selectedAvatarId: string | null;
  linkedBankId: string | null;
  selectedSavingsAccountId: string | null;
  notificationsEnabled: boolean;
  selectedPlanId: string | null;
};

type ProfileSetupContextValue = {
  state: ProfileSetupState;
  setSelectedAvatarId: (value: string) => void;
  setLinkedBankId: (value: string) => void;
  setSelectedSavingsAccountId: (value: string) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setSelectedPlanId: (value: string) => void;
  resetProfileSetup: () => void;
};

const initialState: ProfileSetupState = {
  selectedAvatarId: 'avatar-1',
  linkedBankId: 'chase',
  selectedSavingsAccountId: 'high-yield',
  notificationsEnabled: true,
  selectedPlanId: 'plus',
};

export const ProfileSetupContext = createContext<ProfileSetupContextValue | null>(null);

export function ProfileSetupProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProfileSetupState>(initialState);

  const value = useMemo<ProfileSetupContextValue>(
    () => ({
      state,
      setSelectedAvatarId: (value) => setState((current) => ({ ...current, selectedAvatarId: value })),
      setLinkedBankId: (value) => setState((current) => ({ ...current, linkedBankId: value })),
      setSelectedSavingsAccountId: (value) => setState((current) => ({ ...current, selectedSavingsAccountId: value })),
      setNotificationsEnabled: (value) => setState((current) => ({ ...current, notificationsEnabled: value })),
      setSelectedPlanId: (value) => setState((current) => ({ ...current, selectedPlanId: value })),
      resetProfileSetup: () => setState(initialState),
    }),
    [state]
  );

  return <ProfileSetupContext.Provider value={value}>{children}</ProfileSetupContext.Provider>;
}
