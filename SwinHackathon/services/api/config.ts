function parseBooleanEnv(value: string | undefined, fallback = false) {
  if (value == null) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function normalizeBaseUrl(baseUrl: string | undefined) {
  return (baseUrl ?? '').trim().replace(/\/+$/, '');
}

export const goalwealthApiConfig = {
  baseUrl: normalizeBaseUrl(process.env.EXPO_PUBLIC_GOALWEALTH_API_BASE_URL),
  useLiveAdapter: parseBooleanEnv(process.env.EXPO_PUBLIC_GOALWEALTH_USE_LIVE_ADAPTER, false),
  useDevAuthBridge: parseBooleanEnv(process.env.EXPO_PUBLIC_GOALWEALTH_USE_DEV_AUTH_BRIDGE, false),
  enableDevHomeBypass: parseBooleanEnv(process.env.EXPO_PUBLIC_ENABLE_DEV_HOME_BYPASS, false),
  enableLegacyPasswordAuth: parseBooleanEnv(
    process.env.EXPO_PUBLIC_ENABLE_LEGACY_PASSWORD_AUTH,
    false
  ),
  requestTimeoutMs: 15000,
};

export function isGoalwealthAdapterConfigured() {
  return Boolean(goalwealthApiConfig.baseUrl);
}

export function isGoalwealthLiveAdapterEnabled() {
  return goalwealthApiConfig.useLiveAdapter && isGoalwealthAdapterConfigured();
}
