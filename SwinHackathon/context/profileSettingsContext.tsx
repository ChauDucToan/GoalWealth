import {
  AppearanceOption,
  CurrencyOption,
  LanguageOption,
  linkedAccountsSeed,
} from '@/components/profile-settings/data';
import { useMyUser } from '@/context/myUserContext';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ProfileIdentity = {
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  city: string;
  countryCode: string;
  timezone: string;
  locale: string;
  streakLabel: string;
  avatarInitial: string;
  avatarUri?: string | null;
  coverUri?: string | null;
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
  memberSince: 'Joined March 2024',
  city: 'Melbourne, Australia',
  countryCode: 'AU',
  timezone: 'Australia/Melbourne',
  locale: 'en-AU',
  streakLabel: 'Longest streak: 22 days',
  avatarInitial: 'J',
  avatarUri: null,
  coverUri: null,
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

function buildAvatarInitial(name: string, email: string) {
  const source = name.trim() || email.trim();
  return source.charAt(0).toUpperCase() || 'G';
}

function formatLanguageOptionFromLocale(locale: string | undefined, fallback: DisplaySettings['language']) {
  const normalized = locale?.trim().toLowerCase();

  if (!normalized) {
    return fallback;
  }

  if (normalized.startsWith('vi')) {
    return 'Vietnamese';
  }

  if (normalized.startsWith('ja')) {
    return 'Japanese';
  }

  if (normalized.startsWith('fr')) {
    return 'French';
  }

  if (normalized.startsWith('es')) {
    return 'Spanish';
  }

  return 'English (US)';
}

export function ProfileSettingsProvider({ children }: { children: React.ReactNode }) {
  const { state: userState } = useMyUser();
  const [profile, setProfile] = useState(defaultProfile);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [security, setSecurity] = useState(defaultSecurity);
  const [display, setDisplay] = useState(defaultDisplay);
  const [linkedAccounts] = useState(linkedAccountsSeed);
  const [invite] = useState(defaultInvite);
  const [appRating, setAppRating] = useState(4);
  const [exportStatusLabel, setExportStatusLabel] = useState('Last export 2 days ago');
  const [feedbackDraft, setFeedbackDraft] = useState('');

  useEffect(() => {
    if (!userState.profile) {
      return;
    }

    setProfile((current) => ({
      ...current,
      name: userState.profile?.name?.trim() || current.name,
      email: userState.profile?.email?.trim() || current.email,
      phone: userState.profile?.phone?.trim() || current.phone,
      city: userState.profile?.city?.trim() || current.city,
      countryCode: userState.profile?.countryCode?.trim() || current.countryCode,
      timezone: userState.profile?.timezone?.trim() || current.timezone,
      locale: userState.profile?.locale?.trim() || current.locale,
      avatarUri: userState.profile?.avatarUrl || current.avatarUri,
      avatarInitial: buildAvatarInitial(
        userState.profile?.name ?? current.name,
        userState.profile?.email ?? current.email,
      ),
    }));

    if (userState.profile?.locale?.trim()) {
      setDisplay((current) => ({
        ...current,
        language: formatLanguageOptionFromLocale(userState.profile?.locale, current.language),
      }));
    }
  }, [userState.profile]);

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
