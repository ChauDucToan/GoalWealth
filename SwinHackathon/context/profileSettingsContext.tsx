import {
  AppearanceOption,
  CurrencyOption,
  LanguageOption,
  linkedAccountsSeed,
} from '@/components/profile-settings/data';
import React, { createContext, useContext, useMemo, useState } from 'react';

type ProfileIdentity = {
  name: string;
  email: string;
  phone: string;
  planLabel: string;
  memberSince: string;
  city: string;
  streakLabel: string;
  avatarInitial: string;
};

type NotificationSettings = {
  push: boolean;
  sound: boolean;
  email: boolean;
  billReminders: boolean;
  weeklyDigest: boolean;
  communityReplies: boolean;
  quietHours: boolean;
};

type SecuritySettings = {
  biometrics: boolean;
  passcodeEnabled: boolean;
  twoFactor: boolean;
  loginAlerts: boolean;
};

type DisplaySettings = {
  appearance: AppearanceOption;
  language: LanguageOption;
  currency: CurrencyOption;
};

type InviteSettings = {
  referralCode: string;
  rewardLabel: string;
  successfulInvites: number;
};

type ProfileSettingsContextValue = {
  profile: ProfileIdentity;
  notifications: NotificationSettings;
  security: SecuritySettings;
  display: DisplaySettings;
  linkedAccounts: typeof linkedAccountsSeed;
  invite: InviteSettings;
  appRating: number;
  exportStatusLabel: string;
  feedbackDraft: string;
  updateProfile: (patch: Partial<ProfileIdentity>) => void;
  updateNotifications: (patch: Partial<NotificationSettings>) => void;
  updateSecurity: (patch: Partial<SecuritySettings>) => void;
  updateDisplay: (patch: Partial<DisplaySettings>) => void;
  setAppRating: (rating: number) => void;
  setFeedbackDraft: (value: string) => void;
  requestExport: () => void;
};

const ProfileSettingsContext = createContext<ProfileSettingsContextValue | null>(null);

const defaultProfile: ProfileIdentity = {
  name: 'Jane Doe Watson',
  email: 'jane.watson@finpal.app',
  phone: '+61 432 991 888',
  planLabel: 'Premium Member',
  memberSince: 'Joined March 2024',
  city: 'Melbourne, Australia',
  streakLabel: 'Longest streak: 22 days',
  avatarInitial: 'J',
};

const defaultNotifications: NotificationSettings = {
  push: true,
  sound: true,
  email: false,
  billReminders: true,
  weeklyDigest: true,
  communityReplies: false,
  quietHours: true,
};

const defaultSecurity: SecuritySettings = {
  biometrics: true,
  passcodeEnabled: true,
  twoFactor: true,
  loginAlerts: true,
};

const defaultDisplay: DisplaySettings = {
  appearance: 'System',
  language: 'English (US)',
  currency: 'USD',
};

const defaultInvite: InviteSettings = {
  referralCode: 'JANE-8FD2',
  rewardLabel: 'Invite friends, get $50',
  successfulInvites: 3,
};

export function ProfileSettingsProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState(defaultProfile);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [security, setSecurity] = useState(defaultSecurity);
  const [display, setDisplay] = useState(defaultDisplay);
  const [linkedAccounts] = useState(linkedAccountsSeed);
  const [invite] = useState(defaultInvite);
  const [appRating, setAppRating] = useState(4);
  const [exportStatusLabel, setExportStatusLabel] = useState('Last export 2 days ago');
  const [feedbackDraft, setFeedbackDraft] = useState('');

  const value = useMemo<ProfileSettingsContextValue>(
    () => ({
      profile,
      notifications,
      security,
      display,
      linkedAccounts,
      invite,
      appRating,
      exportStatusLabel,
      feedbackDraft,
      updateProfile: (patch) => setProfile((current) => ({ ...current, ...patch })),
      updateNotifications: (patch) =>
        setNotifications((current) => ({ ...current, ...patch })),
      updateSecurity: (patch) => setSecurity((current) => ({ ...current, ...patch })),
      updateDisplay: (patch) => setDisplay((current) => ({ ...current, ...patch })),
      setAppRating,
      setFeedbackDraft,
      requestExport: () => setExportStatusLabel('Export requested just now'),
    }),
    [
      appRating,
      display,
      exportStatusLabel,
      feedbackDraft,
      invite,
      linkedAccounts,
      notifications,
      profile,
      security,
    ]
  );

  return (
    <ProfileSettingsContext.Provider value={value}>
      {children}
    </ProfileSettingsContext.Provider>
  );
}

export function useProfileSettings() {
  const context = useContext(ProfileSettingsContext);

  if (!context) {
    throw new Error('useProfileSettings must be used within ProfileSettingsProvider');
  }

  return context;
}
