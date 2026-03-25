import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserProfile } from '@/context/user.types';

const AUTH_SESSION_STORAGE_KEY = 'goalwealth.auth.session.v1';

export type StoredAuthSession = {
  accessToken: string;
  profile: UserProfile;
  authMode: 'goalwealth-dev-bridge' | 'legacy-oauth';
};

function normalizeUserId(email: string) {
  const normalized = email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'goalwealth-dev-user';
}

function deriveDisplayName(email: string) {
  const localPart = email.trim().split('@')[0] || 'GoalWealth User';
  const cleaned = localPart.replace(/[._-]+/g, ' ').trim();

  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase()) || 'GoalWealth User';
}

export async function loadStoredAuthSession() {
  const raw = await AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredAuthSession;
    if (!parsed?.accessToken || !parsed?.profile?.id) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function persistAuthSession(session: StoredAuthSession) {
  await AsyncStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function clearStoredAuthSession() {
  await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export function buildDevelopmentBridgeSession(email: string): StoredAuthSession {
  const normalizedEmail = email.trim().toLowerCase();
  const userId = normalizeUserId(normalizedEmail);

  return {
    accessToken: `Bearer dev-token:${userId}`,
    authMode: 'goalwealth-dev-bridge',
    profile: {
      id: userId,
      name: deriveDisplayName(normalizedEmail),
      email: normalizedEmail,
      language: 'en-US',
    },
  };
}
