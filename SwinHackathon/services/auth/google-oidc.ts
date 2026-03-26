import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { UserProfile } from '@/context/user.types';

import type { StoredAuthSession } from './session';

const GOOGLE_USERINFO_ENDPOINT = 'https://openidconnect.googleapis.com/v1/userinfo';

export const googleOidcConfig = {
  clientId: process.env.EXPO_PUBLIC_GOOGLE_OIDC_CLIENT_ID?.trim() ?? '',
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_OIDC_WEB_CLIENT_ID?.trim() ?? '',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_OIDC_IOS_CLIENT_ID?.trim() ?? '',
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_OIDC_ANDROID_CLIENT_ID?.trim() ?? '',
};

function getExpoScheme() {
  const configuredScheme = Constants.expoConfig?.scheme;

  if (Array.isArray(configuredScheme)) {
    return configuredScheme.find(Boolean)?.trim() ?? '';
  }

  return configuredScheme?.trim() ?? '';
}

function getAndroidPackageName() {
  return Constants.expoConfig?.android?.package?.trim() || 'com.anonymous.SwinHackathon';
}

function getAndroidGoogleRedirectScheme() {
  const androidClientId = googleOidcConfig.androidClientId.trim();

  if (!androidClientId) {
    return getAndroidPackageName();
  }

  const clientIdPrefix = androidClientId.replace(/\.apps\.googleusercontent\.com$/i, '');
  return `com.googleusercontent.apps.${clientIdPrefix}`;
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

function decodeIdTokenPayload(idToken: string) {
  const payload = idToken.split('.')[1];
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as {
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

function buildProfileFromIdToken(idToken: string) {
  const payload = decodeIdTokenPayload(idToken);

  if (!payload) {
    throw new Error('Google sign-in succeeded, but the ID token payload could not be decoded.');
  }

  return {
    id: payload.sub ?? payload.email ?? 'goalwealth-google-user',
    name: payload.name ?? payload.email ?? 'GoalWealth User',
    email: payload.email ?? 'unknown@goalwealth.local',
    avatarUrl: payload.picture,
    language: payload.locale,
  } satisfies UserProfile;
}

async function fetchGoogleUserProfile(accessToken: string) {
  const response = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Google sign-in succeeded, but the user profile request failed.');
  }

  const payload = (await response.json()) as {
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
    locale?: string;
  };

  return {
    id: payload.sub ?? payload.email ?? 'goalwealth-google-user',
    name: payload.name ?? payload.email ?? 'GoalWealth User',
    email: payload.email ?? 'unknown@goalwealth.local',
    avatarUrl: payload.picture,
    language: payload.locale,
  } satisfies UserProfile;
}

export function getGoogleOidcClientIdForPlatform() {
  const isNativeMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  const platformClientId = Platform.select({
    ios: googleOidcConfig.iosClientId,
    android: googleOidcConfig.androidClientId,
    web: googleOidcConfig.webClientId,
    default: googleOidcConfig.clientId,
  });

  if (isNativeMobile) {
    return platformClientId?.trim() || '';
  }

  return platformClientId?.trim() || googleOidcConfig.clientId;
}

export function getGoogleOidcPlatformConfig() {
  const platform = Platform.OS;
  const isNativeMobile = platform === 'ios' || platform === 'android';
  const platformClientId = Platform.select({
    ios: googleOidcConfig.iosClientId,
    android: googleOidcConfig.androidClientId,
    web: googleOidcConfig.webClientId,
    default: googleOidcConfig.clientId,
  });
  const hasPlatformSpecificClientId = Boolean(platformClientId?.trim());
  const hasFallbackClientId = Boolean(googleOidcConfig.clientId);
  const activeClientId = getGoogleOidcClientIdForPlatform();
  const reusesSharedClientId =
    Boolean(activeClientId) &&
    Boolean(googleOidcConfig.clientId) &&
    activeClientId === googleOidcConfig.clientId;
  const matchesOtherNativeClientId =
    platform === 'ios'
      ? Boolean(activeClientId) && activeClientId === googleOidcConfig.androidClientId
      : platform === 'android'
        ? Boolean(activeClientId) && activeClientId === googleOidcConfig.iosClientId
        : false;
  const appearsMisconfigured = isNativeMobile && (reusesSharedClientId || matchesOtherNativeClientId);

  return {
    platform,
    activeClientId,
    hasPlatformSpecificClientId,
    hasFallbackClientId,
    usesFallbackClientId: !hasPlatformSpecificClientId && hasFallbackClientId,
    requiresPlatformSpecificClientId: isNativeMobile,
    reusesSharedClientId,
    matchesOtherNativeClientId,
    appearsMisconfigured,
    hasUsableClientId:
      isNativeMobile
        ? hasPlatformSpecificClientId && !appearsMisconfigured
        : Boolean(activeClientId),
  };
}

export function isGoogleOidcConfigured() {
  return Boolean(getGoogleOidcClientIdForPlatform());
}

export function getGoogleOidcRequestConfig() {
  const isNativeMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  const fallbackClientId = googleOidcConfig.clientId || undefined;
  const redirectUri = isNativeMobile
    ? AuthSession.makeRedirectUri({
        native:
          Platform.OS === 'android'
            ? `${getAndroidGoogleRedirectScheme()}:/signIn`
            : `${getExpoScheme() || 'swinhackathon'}:/signIn`,
      })
    : undefined;

  return {
    clientId: isNativeMobile ? undefined : fallbackClientId,
    webClientId: googleOidcConfig.webClientId || (!isNativeMobile ? fallbackClientId : undefined),
    iosClientId: googleOidcConfig.iosClientId || undefined,
    androidClientId: googleOidcConfig.androidClientId || undefined,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
    selectAccount: true,
  };
}

export async function buildGoogleOidcSession(input: {
  idToken: string;
  accessToken?: string | null;
}): Promise<StoredAuthSession> {
  const idToken = input.idToken.trim();

  if (!idToken) {
    throw new Error('Google sign-in did not return an ID token.');
  }

  const fallbackProfile = buildProfileFromIdToken(idToken);
  let profile = fallbackProfile;

  if (input.accessToken?.trim()) {
    try {
      profile = await fetchGoogleUserProfile(input.accessToken.trim());
    } catch {
      profile = fallbackProfile;
    }
  }

  return {
    accessToken: `Bearer ${idToken}`,
    authMode: 'google-oidc',
    profile,
  };
}
