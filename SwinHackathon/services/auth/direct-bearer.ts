import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { UserProfile } from '@/context/user.types';

import type { StoredAuthSession } from './session';

const LAST_USED_BEARER_STORAGE_KEY = 'goalwealth.auth.last-adapter-bearer.v1';

function normalizeAuthorization(value: string) {
  const cleaned = value.trim();
  if (!cleaned) {
    throw new Error('Bearer token is required.');
  }

  return cleaned.toLowerCase().startsWith('bearer ') ? cleaned : `Bearer ${cleaned}`;
}

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (normalized.length % 4)) % 4;
  const padded = `${normalized}${'='.repeat(padding)}`;

  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(padded);
  }

  throw new Error('Base64 decoding is unavailable on this platform.');
}

function decodeJwtPayload(token: string) {
  const parts = token.replace(/^Bearer\s+/i, '').split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(parts[1])) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
      locale?: string;
    };
  } catch {
    return null;
  }
}

function buildFallbackProfile(email?: string): UserProfile {
  const normalizedEmail = email?.trim().toLowerCase();

  return {
    id: normalizedEmail || 'goalwealth-bearer-user',
    name: normalizedEmail ? normalizedEmail.split('@')[0] : 'GoalWealth User',
    email: normalizedEmail || 'unknown@goalwealth.local',
  };
}

export function buildAdapterBearerSession(input: {
  bearerToken: string;
  email?: string;
}): StoredAuthSession {
  const accessToken = normalizeAuthorization(input.bearerToken);
  const payload = decodeJwtPayload(accessToken);

  const profile: UserProfile = payload
    ? {
        id: payload.sub ?? payload.email ?? input.email?.trim() ?? 'goalwealth-bearer-user',
        name: payload.name ?? payload.email ?? input.email?.trim() ?? 'GoalWealth User',
        email: payload.email ?? input.email?.trim().toLowerCase() ?? 'unknown@goalwealth.local',
        avatarUrl: payload.picture,
        language: payload.locale,
      }
    : buildFallbackProfile(input.email);

  return {
    accessToken,
    authMode: 'adapter-bearer',
    profile,
  };
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

async function readStoredBearerToken() {
  if (await canUseSecureStore()) {
    const value = await SecureStore.getItemAsync(LAST_USED_BEARER_STORAGE_KEY);
    if (value) {
      return value;
    }
  }

  return AsyncStorage.getItem(LAST_USED_BEARER_STORAGE_KEY);
}

async function writeStoredBearerToken(value: string) {
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(LAST_USED_BEARER_STORAGE_KEY, value);
    await AsyncStorage.removeItem(LAST_USED_BEARER_STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(LAST_USED_BEARER_STORAGE_KEY, value);
}

export async function loadLastUsedAdapterBearerToken() {
  const raw = await readStoredBearerToken();
  return raw?.trim() || '';
}

export async function persistLastUsedAdapterBearerToken(token: string) {
  const normalized = normalizeAuthorization(token);
  await writeStoredBearerToken(normalized);
}
