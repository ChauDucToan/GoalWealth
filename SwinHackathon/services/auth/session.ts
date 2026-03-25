import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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

async function canUseSecureStore() {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

async function readStoredValue() {
  if (await canUseSecureStore()) {
    const value = await SecureStore.getItemAsync(AUTH_SESSION_STORAGE_KEY);
    if (value) {
      return value;
    }
  }

  return AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);
}

async function writeStoredValue(value: string) {
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(AUTH_SESSION_STORAGE_KEY, value);
    await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(AUTH_SESSION_STORAGE_KEY, value);
}

async function removeStoredValue() {
  await Promise.allSettled([
    SecureStore.deleteItemAsync(AUTH_SESSION_STORAGE_KEY),
    AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY),
  ]);
}

async function migrateAsyncStorageSessionToSecureStore(raw: string) {
  if (!(await canUseSecureStore())) {
    return;
  }

  await SecureStore.setItemAsync(AUTH_SESSION_STORAGE_KEY, raw);
  await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export async function loadStoredAuthSession() {
  const raw = await readStoredValue();

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredAuthSession;
    if (!parsed?.accessToken || !parsed?.profile?.id) {
      return null;
    }

    if (Platform.OS !== 'web') {
      const asyncStoredValue = await AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      if (asyncStoredValue === raw) {
        await migrateAsyncStorageSessionToSecureStore(raw);
      }
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function persistAuthSession(session: StoredAuthSession) {
  await writeStoredValue(JSON.stringify(session));
}

export async function clearStoredAuthSession() {
  await removeStoredValue();
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
