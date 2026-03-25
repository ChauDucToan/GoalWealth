import React, { createContext, useMemo, useState } from 'react';

export type ProfileSetupState = {
  selectedAvatarId: string | null;
  avatarMode: 'avatar' | 'upload';
  linkedBankId: string | null;
  selectedSavingsAccountId: string | null;
  faceIdEnabled: boolean;
  otpCode: string;
  passcode: string;
  biometricEnabled: boolean;
  notificationsEnabled: boolean;
  selectedPlanId: string | null;
};

type ProfileSetupContextValue = {
  state: ProfileSetupState;
  setSelectedAvatarId: (value: string) => void;
  setAvatarMode: (value: ProfileSetupState['avatarMode']) => void;
  setLinkedBankId: (value: string) => void;
  setSelectedSavingsAccountId: (value: string) => void;
  setFaceIdEnabled: (value: boolean) => void;
  setOtpCode: (value: string) => void;
  setPasscode: (value: string) => void;
  setBiometricEnabled: (value: boolean) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setSelectedPlanId: (value: string) => void;
  resetProfileSetup: () => void;
};

const initialState: ProfileSetupState = {
  selectedAvatarId: 'avatar-1',
  avatarMode: 'avatar',
  linkedBankId: 'chase',
  selectedSavingsAccountId: 'high-yield',
  faceIdEnabled: true,
  otpCode: '0000',
  passcode: '1879',
  biometricEnabled: true,
  notificationsEnabled: true,
  selectedPlanId: 'premium',
};

export const ProfileSetupContext = createContext<ProfileSetupContextValue | null>(null);

export function ProfileSetupProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProfileSetupState>(initialState);

  const value = useMemo<ProfileSetupContextValue>(
    () => ({
      state,
      setSelectedAvatarId: (value) => setState((current) => ({ ...current, selectedAvatarId: value })),
      setAvatarMode: (value) => setState((current) => ({ ...current, avatarMode: value })),
      setLinkedBankId: (value) => setState((current) => ({ ...current, linkedBankId: value })),
      setSelectedSavingsAccountId: (value) => setState((current) => ({ ...current, selectedSavingsAccountId: value })),
      setFaceIdEnabled: (value) => setState((current) => ({ ...current, faceIdEnabled: value })),
      setOtpCode: (value) => setState((current) => ({ ...current, otpCode: value })),
      setPasscode: (value) => setState((current) => ({ ...current, passcode: value })),
      setBiometricEnabled: (value) => setState((current) => ({ ...current, biometricEnabled: value })),
      setNotificationsEnabled: (value) => setState((current) => ({ ...current, notificationsEnabled: value })),
      setSelectedPlanId: (value) => setState((current) => ({ ...current, selectedPlanId: value })),
      resetProfileSetup: () => setState(initialState),
    }),
    [state]
  );

  return <ProfileSetupContext.Provider value={value}>{children}</ProfileSetupContext.Provider>;
}
