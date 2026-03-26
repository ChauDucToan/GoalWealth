import type { UserProfile } from '@/context/user.types';
import { goalwealthApiConfig, isGoalwealthAdapterConfigured } from '@/services/api/config';
import { getMissingOAuth2EnvVars, signInWithOAuth2Password } from '@/services/oauth2';

import {
  buildAdapterBearerSession,
  persistLastUsedAdapterBearerToken,
} from './direct-bearer';
import {
  buildDevelopmentBridgeSession,
  type StoredAuthSession,
} from './session';
import {
  buildGoogleOidcSession,
  isGoogleOidcConfigured,
} from './google-oidc';

export type ConfiguredSignInMode = 'google-oidc' | 'dev-bridge' | 'legacy-oauth' | 'unconfigured';

export type ConfiguredSignInResult = {
  accessToken: string;
  profile: UserProfile;
  authMode: StoredAuthSession['authMode'];
};

export function isDevelopmentBridgeSignInAvailable() {
  return goalwealthApiConfig.useDevAuthBridge && isGoalwealthAdapterConfigured();
}

export function isLegacyPasswordSignInAvailable() {
  return (
    goalwealthApiConfig.enableLegacyPasswordAuth &&
    getMissingOAuth2EnvVars().length === 0
  );
}

export function getConfiguredSignInMode(): ConfiguredSignInMode {
  if (isGoogleOidcConfigured()) {
    return 'google-oidc';
  }

  if (isDevelopmentBridgeSignInAvailable()) {
    return 'dev-bridge';
  }

  if (isLegacyPasswordSignInAvailable()) {
    return 'legacy-oauth';
  }

  return 'unconfigured';
}

export async function signInWithGoogleOidc(input: {
  idToken: string;
  accessToken?: string | null;
}): Promise<ConfiguredSignInResult> {
  const session = await buildGoogleOidcSession(input);

  return {
    accessToken: session.accessToken,
    profile: session.profile,
    authMode: session.authMode,
  };
}

export async function signInWithAdapterBearer(input: {
  bearerToken: string;
  email?: string;
}): Promise<ConfiguredSignInResult> {
  const session = buildAdapterBearerSession(input);
  await persistLastUsedAdapterBearerToken(session.accessToken);

  return {
    accessToken: session.accessToken,
    profile: session.profile,
    authMode: session.authMode,
  };
}

export async function signInWithDevelopmentBridge(email: string): Promise<ConfiguredSignInResult> {
  const session = buildDevelopmentBridgeSession(email);
  return {
    accessToken: session.accessToken,
    profile: session.profile,
    authMode: session.authMode,
  };
}

export async function signInWithLegacyPassword(input: {
  email: string;
  password: string;
}): Promise<ConfiguredSignInResult> {
  const result = await signInWithOAuth2Password({
    username: input.email,
    password: input.password,
  });

  return {
    accessToken: result.accessToken,
    profile: result.profile,
    authMode: 'legacy-oauth',
  };
}

export async function signInWithConfiguredMethod(input: {
  email: string;
  password: string;
}): Promise<ConfiguredSignInResult> {
  const mode = getConfiguredSignInMode();

  if (mode === 'dev-bridge') {
    return signInWithDevelopmentBridge(input.email);
  }

  if (mode === 'legacy-oauth') {
    return signInWithLegacyPassword(input);
  }

  if (mode === 'google-oidc') {
    throw new Error('Google OIDC sign-in must be started from the Google auth flow.');
  }

  throw new Error(
    'Sign-in is not configured. Set GoalWealth adapter env for the dev auth bridge or enable the legacy OAuth bridge explicitly.'
  );
}
