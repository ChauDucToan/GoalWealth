import type { UserProfile } from '@/context/user.types';
import { goalwealthApiConfig, isGoalwealthAdapterConfigured } from '@/services/api/config';
import { getMissingOAuth2EnvVars, signInWithOAuth2Password } from '@/services/oauth2';

import {
  buildDevelopmentBridgeSession,
  type StoredAuthSession,
} from './session';

export type ConfiguredSignInMode = 'dev-bridge' | 'legacy-oauth' | 'unconfigured';

export type ConfiguredSignInResult = {
  accessToken: string;
  profile: UserProfile;
  authMode: StoredAuthSession['authMode'];
};

export function getConfiguredSignInMode(): ConfiguredSignInMode {
  if (goalwealthApiConfig.useDevAuthBridge && isGoalwealthAdapterConfigured()) {
    return 'dev-bridge';
  }

  if (
    goalwealthApiConfig.enableLegacyPasswordAuth &&
    getMissingOAuth2EnvVars().length === 0
  ) {
    return 'legacy-oauth';
  }

  return 'unconfigured';
}

export async function signInWithConfiguredMethod(input: {
  email: string;
  password: string;
}): Promise<ConfiguredSignInResult> {
  const mode = getConfiguredSignInMode();

  if (mode === 'dev-bridge') {
    const session = buildDevelopmentBridgeSession(input.email);
    return {
      accessToken: session.accessToken,
      profile: session.profile,
      authMode: session.authMode,
    };
  }

  if (mode === 'legacy-oauth') {
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

  throw new Error(
    'Sign-in is not configured. Set GoalWealth adapter env for the dev auth bridge or enable the legacy OAuth bridge explicitly.'
  );
}
