import { InputField } from '@/components/InputField';
import {
  AuthPrimaryButton,
  AuthScaffold,
  RememberMe,
  RobotIllustration,
  hexToRgba,
} from '@/components/auth/AuthKit';
import { Typography } from '@/constants/theme';
import { useMyUser } from '@/context/myUserContext';
import { useTheme } from '@/hooks/use-theme-colors';
import {
  goalwealthApiConfig,
  isGoalwealthAdapterConfigured,
  isGoalwealthLiveAdapterEnabled,
} from '@/services/api/config';
import { normalizeGoalwealthError } from '@/services/api/errors';
import { getGoalwealthReady } from '@/services/api/meta';
import { loadLastUsedAdapterBearerToken } from '@/services/auth/direct-bearer';
import {
  getGoogleOidcPlatformConfig,
  getGoogleOidcRequestConfig,
  isGoogleOidcConfigured,
} from '@/services/auth/google-oidc';
import {
  isDevelopmentBridgeSignInAvailable,
  isLegacyPasswordSignInAvailable,
  signInWithAdapterBearer,
  signInWithDevelopmentBridge,
  signInWithGoogleOidc,
  signInWithLegacyPassword,
} from '@/services/auth/sign-in';
import * as Google from 'expo-auth-session/providers/google';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_PLACEHOLDER_CLIENT_ID = 'goalwealth-placeholder.apps.googleusercontent.com';

export default function SignIn() {
  const router = useRouter();
  const { colors } = useTheme();
  const { state, dispatch, actions, isSessionReady } = useMyUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bearerToken, setBearerToken] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adapterReadyState, setAdapterReadyState] = useState<
    'idle' | 'checking' | 'ready' | 'error'
  >('idle');
  const [adapterReadyMessage, setAdapterReadyMessage] = useState('');

  const googleConfigured = isGoogleOidcConfigured();
  const devBridgeAvailable = isDevelopmentBridgeSignInAvailable();
  const legacyPasswordAvailable = isLegacyPasswordSignInAvailable();
  const liveAdapterEnabled = isGoalwealthLiveAdapterEnabled();
  const showLegacyPassword = legacyPasswordAvailable && !googleConfigured;
  const shouldCheckAdapterReadiness =
    liveAdapterEnabled && isGoalwealthAdapterConfigured();
  const showDirectBearer = __DEV__;
  const showDevBridge = !googleConfigured && devBridgeAvailable;
  const showDeveloperAccess =
    showDirectBearer || showDevBridge || showLegacyPassword;
  const showStatusCard = !googleConfigured || shouldCheckAdapterReadiness;
  const hasAnySignInPath = googleConfigured || showDeveloperAccess;
  const googlePlatformConfig = useMemo(
    () => getGoogleOidcPlatformConfig(),
    []
  );
  const requiresNativeGoogleBuild =
    googleConfigured &&
    (googlePlatformConfig.platform === 'android' || googlePlatformConfig.platform === 'ios') &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  const showGoogleNativeHint =
    googleConfigured &&
    (googlePlatformConfig.platform === 'android' || googlePlatformConfig.platform === 'ios') &&
    !googlePlatformConfig.hasPlatformSpecificClientId;

  const googleRequestConfig = useMemo(() => {
    if (googleConfigured) {
      return getGoogleOidcRequestConfig();
    }

    return {
      clientId: GOOGLE_PLACEHOLDER_CLIENT_ID,
      webClientId: GOOGLE_PLACEHOLDER_CLIENT_ID,
      iosClientId: GOOGLE_PLACEHOLDER_CLIENT_ID,
      androidClientId: GOOGLE_PLACEHOLDER_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      selectAccount: true,
    };
  }, [googleConfigured]);

  const [googleRequest, , promptGoogleAsync] = Google.useAuthRequest(googleRequestConfig);

  useEffect(() => {
    if (isSessionReady && state.isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isSessionReady, router, state.isAuthenticated]);

  useEffect(() => {
    if (!showDirectBearer) {
      return;
    }

    let cancelled = false;

    void loadLastUsedAdapterBearerToken().then((token) => {
      if (!cancelled && token) {
        setBearerToken(token);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [showDirectBearer]);

  useEffect(() => {
    if (!shouldCheckAdapterReadiness) {
      setAdapterReadyState('idle');
      setAdapterReadyMessage('');
      return;
    }

    let cancelled = false;
    setAdapterReadyState('checking');
    setAdapterReadyMessage('');

    void getGoalwealthReady()
      .then((response) => {
        if (cancelled) {
          return;
        }

        const checks = response.data.checks ?? {};
        const configLoaded = checks.config_loaded !== false;
        const oidcConfigured = checks.oidc_config_present !== false;
        const openclawConfigured = checks.openclaw_config_present !== false;
        if (!configLoaded) {
          setAdapterReadyState('error');
          setAdapterReadyMessage('Adapter config is incomplete. Sign-in can continue, but live features may stay unavailable.');
          return;
        }

        const runtimeEnvironment =
          typeof response.data.runtime?.environment === 'string'
            ? response.data.runtime.environment
            : null;
        const missingChecks = [
          !oidcConfigured ? 'OIDC' : null,
          !openclawConfigured ? 'OpenClaw' : null,
        ].filter(Boolean);

        setAdapterReadyState('ready');
        setAdapterReadyMessage(
          missingChecks.length === 0
            ? runtimeEnvironment
              ? `Adapter ready • ${response.data.service} • ${runtimeEnvironment}`
              : `Adapter ready • ${response.data.service}`
            : `Adapter reachable • Missing ${missingChecks.join(' + ')} config.`
        );
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        const normalized = normalizeGoalwealthError(error);
        setAdapterReadyState('error');
        setAdapterReadyMessage(
          normalized.message || 'GoalWealth adapter is unreachable right now. You can still sign in with Google.'
        );
      });

    return () => {
      cancelled = true;
    };
  }, [shouldCheckAdapterReadiness]);

  const statusCopy = useMemo(() => {
    if (googleConfigured) {
      return {
        title: 'Google OIDC',
        subtitle:
          'Continue with Google to sign in to GoalWealth with the client ID configured for this build.',
        hint: 'Google is the recommended sign-in path for GoalWealth.',
        tone: colors.primaryDark,
      };
    }

    if (showDevBridge) {
      return {
        title: 'Development Access',
        subtitle:
          'Google sign-in is not configured on this build yet. Use the temporary development path below.',
        hint: 'This path is for local testing only and is not the production auth posture.',
        tone: colors.warning,
      };
    }

    if (showLegacyPassword) {
      return {
        title: 'Legacy Bridge',
        subtitle: 'Temporary compatibility mode for local development.',
        hint: 'Google OIDC should replace this path as soon as platform client IDs are available.',
        tone: colors.warning,
      };
    }

    return {
      title: 'Sign-in not configured',
      subtitle: 'Add the Google OIDC client IDs in .env, then restart Expo.',
      hint: 'You can keep the dev bridge disabled once Google sign-in is ready.',
      tone: colors.error,
    };
  }, [
    colors.error,
    colors.primaryDark,
    colors.warning,
    googleConfigured,
    showDevBridge,
    showLegacyPassword,
  ]);

  const showEmailError =
    submitAttempted && (showDevBridge || showLegacyPassword) && !email.trim();
  const showPasswordError =
    submitAttempted && showLegacyPassword && password.trim().length < 8;
  const showBearerError = submitAttempted && showDirectBearer && !bearerToken.trim();

  const resetInlineErrors = () => {
    if (submitAttempted) {
      setSubmitAttempted(false);
    }
    if (authError) {
      setAuthError('');
    }
  };

  const completeSignIn = async (
    runner: () => Promise<{
      accessToken: string;
      profile: Parameters<typeof actions.signInSuccess>[0];
      authMode: Parameters<typeof actions.signInSuccess>[2];
    }>
  ) => {
    setIsSubmitting(true);
    dispatch(actions.setLoading(true));

    try {
      const result = await runner();
      dispatch(actions.signInSuccess(result.profile, result.accessToken, result.authMode));
      router.replace('/(tabs)/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in right now.';
      setAuthError(message);
      dispatch(actions.setError(message));
    } finally {
      setIsSubmitting(false);
      dispatch(actions.setLoading(false));
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');

    if (!googleConfigured) {
      setAuthError('Google sign-in is not configured for this build.');
      return;
    }

    if (requiresNativeGoogleBuild) {
      setAuthError(
        'Google sign-in on mobile requires a development build or production build. Expo Go will trigger an authorization error for this setup.'
      );
      return;
    }

    if (!googleRequest) {
      setAuthError('Google sign-in is still preparing. Try again in a moment.');
      return;
    }

    setIsSubmitting(true);
    dispatch(actions.setLoading(true));

    try {
      const response = await promptGoogleAsync();

      if (response.type !== 'success') {
        if (response.type === 'error') {
          const params =
            'params' in response && response.params ? response.params : undefined;
          const errorDescription =
            typeof params?.error_description === 'string'
              ? params.error_description
              : 'Google sign-in could not be completed.';
          setAuthError(errorDescription);
        }

        return;
      }

      const idToken =
        response.authentication?.idToken ??
        ('params' in response && typeof response.params?.id_token === 'string'
          ? response.params.id_token
          : '');
      const accessToken =
        response.authentication?.accessToken ??
        ('params' in response && typeof response.params?.access_token === 'string'
          ? response.params.access_token
          : undefined);

      if (!idToken) {
        setAuthError('Google sign-in succeeded, but no ID token was returned.');
        return;
      }

      const result = await signInWithGoogleOidc({ idToken, accessToken });
      dispatch(actions.signInSuccess(result.profile, result.accessToken, result.authMode));
      router.replace('/(tabs)/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed.';
      setAuthError(message);
      dispatch(actions.setError(message));
    } finally {
      setIsSubmitting(false);
      dispatch(actions.setLoading(false));
    }
  };

  const handleDevBridgeSignIn = async () => {
    setSubmitAttempted(true);
    setAuthError('');

    if (!devBridgeAvailable) {
      setAuthError('The GoalWealth dev bridge is not enabled for this build.');
      return;
    }

    if (!email.trim()) {
      return;
    }

    if (shouldCheckAdapterReadiness && adapterReadyState !== 'ready') {
      setAuthError(
        adapterReadyMessage || 'GoalWealth adapter is not ready yet. Check /ready before signing in.'
      );
      return;
    }

    await completeSignIn(() => signInWithDevelopmentBridge(email.trim()));
  };

  const handleLegacySignIn = async () => {
    setSubmitAttempted(true);
    setAuthError('');

    if (!showLegacyPassword) {
      setAuthError('Legacy sign-in is not enabled for this build.');
      return;
    }

    if (!email.trim() || password.trim().length < 8) {
      return;
    }

    await completeSignIn(() =>
      signInWithLegacyPassword({
        email: email.trim(),
        password: password.trim(),
      })
    );
  };

  const handleDirectBearerSignIn = async () => {
    setSubmitAttempted(true);
    setAuthError('');

    if (!showDirectBearer) {
      setAuthError('Direct bearer sign-in is only available in development builds.');
      return;
    }

    if (!bearerToken.trim()) {
      return;
    }

    await completeSignIn(() =>
      signInWithAdapterBearer({
        bearerToken: bearerToken.trim(),
        email: email.trim() || undefined,
      })
    );
  };

  return (
    <AuthScaffold
      title="Sign In to GoalWealth"
      subtitle={statusCopy.subtitle}
      illustration={<RobotIllustration />}
    >
      {showStatusCard ? (
        <View
          style={[
            styles.statusCard,
            { backgroundColor: hexToRgba(statusCopy.tone, 0.12) },
          ]}
        >
          {!googleConfigured ? (
            <>
              <Text style={[styles.statusTitle, { color: statusCopy.tone }]}>
                {statusCopy.title}
              </Text>
              <Text style={[styles.statusHint, { color: hexToRgba(colors.text, 0.64) }]}>
                {statusCopy.hint}
              </Text>
            </>
          ) : null}
          {shouldCheckAdapterReadiness ? (
            <Text
              style={[
                !googleConfigured ? styles.adapterStatusText : styles.adapterStatusInline,
              {
                color:
                  adapterReadyState === 'ready'
                    ? colors.success
                    : adapterReadyState === 'error'
                        ? colors.warning
                        : hexToRgba(colors.text, 0.62),
              },
            ]}
          >
            {adapterReadyState === 'checking'
              ? 'Checking GoalWealth adapter readiness...'
              : adapterReadyMessage || 'GoalWealth readiness will be checked in the background.'}
          </Text>
        ) : null}
      </View>
      ) : null}

      {googleConfigured ? (
        <View style={styles.primarySection}>
          <AuthPrimaryButton
            title={
              isSubmitting
                ? 'Signing In...'
                : googleRequest
                  ? 'Continue with Google'
                  : 'Preparing Google...'
            }
            onPress={handleGoogleSignIn}
            colorBackground={colors.primaryDark}
            colorText={colors.textLight}
            disabled={isSubmitting || !isSessionReady || !googleRequest || requiresNativeGoogleBuild}
          />
          <Text style={[styles.helperText, { color: hexToRgba(colors.text, 0.58) }]}>
            Uses the Google client ID from your `.env` for this build.
          </Text>
          {requiresNativeGoogleBuild ? (
            <View
              style={[
                styles.googleHintCard,
                {
                  backgroundColor: hexToRgba(colors.error, 0.08),
                  borderColor: hexToRgba(colors.error, 0.16),
                },
              ]}
            >
              <Text style={[styles.googleHintTitle, { color: colors.error }]}>
                Development build required
              </Text>
              <Text style={[styles.googleHintBody, { color: hexToRgba(colors.text, 0.66) }]}>
                You are running in Expo Go. For Google sign-in on mobile, use a development build
                or production build so the native redirect URI matches your app.
              </Text>
            </View>
          ) : null}
          {showGoogleNativeHint ? (
            <View
              style={[
                styles.googleHintCard,
                {
                  backgroundColor: hexToRgba(colors.warning, 0.1),
                  borderColor: hexToRgba(colors.warning, 0.2),
                },
              ]}
            >
              <Text style={[styles.googleHintTitle, { color: colors.warning }]}>
                Native Google client missing
              </Text>
              <Text style={[styles.googleHintBody, { color: hexToRgba(colors.text, 0.66) }]}>
                This {googlePlatformConfig.platform} build is falling back to the shared client ID.
                If Google returns `400 invalid_request`, set the platform-specific client in `.env`
                and make sure it matches your app package / bundle ID and signing keys.
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {showDeveloperAccess ? (
        <View style={styles.toolsSection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Developer access</Text>
          <Text style={[styles.sectionHelper, { color: hexToRgba(colors.text, 0.58) }]}>
            These fallback paths are for local testing only.
          </Text>

          {showDevBridge ? (
            <View style={styles.toolBlock}>
              <InputField
                label="Dev bridge email"
                placeholder="Enter your email address..."
                iconName="email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  resetInlineErrors();
                }}
                status={showEmailError ? 'error' : 'default'}
                helperText={
                  showEmailError
                    ? 'Email address is required for the temporary dev bridge.'
                    : 'GoalWealth adapter must be reachable for this path.'
                }
              />

              <View style={styles.buttonStack}>
                <AuthPrimaryButton
                  title={isSubmitting ? 'Signing In...' : 'Use Dev Bridge'}
                  onPress={handleDevBridgeSignIn}
                  colorBackground={hexToRgba(colors.primaryDark, 0.08)}
                  colorText={colors.primaryDark}
                  style={[
                    styles.outlineButton,
                    { borderColor: hexToRgba(colors.primaryDark, 0.24) },
                  ]}
                  disabled={
                    isSubmitting ||
                    !isSessionReady ||
                    (shouldCheckAdapterReadiness && adapterReadyState !== 'ready')
                  }
                />
              </View>
            </View>
          ) : null}

          {showLegacyPassword ? (
            <View style={styles.toolBlock}>
              <InputField
                label="Email Address"
                placeholder="Enter your email address..."
                iconName="email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  resetInlineErrors();
                }}
                status={showEmailError ? 'error' : 'default'}
                helperText={showEmailError ? 'Email address is required.' : undefined}
              />

              <InputField
                label="Password"
                placeholder="Enter your password..."
                iconName="lock"
                secureTextEntry
                isPassword
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  resetInlineErrors();
                }}
                containerStyle={styles.fieldSpacing}
                status={showPasswordError ? 'error' : 'default'}
                helperText={
                  showPasswordError
                    ? 'Password must be at least 8 characters for the legacy bridge.'
                    : 'Legacy compatibility path only.'
                }
              />

              <RememberMe checked={rememberMe} onPress={() => setRememberMe((current) => !current)} />

              <View style={styles.buttonStack}>
                <AuthPrimaryButton
                  title={isSubmitting ? 'Signing In...' : 'Use Legacy Bridge'}
                  onPress={handleLegacySignIn}
                  colorBackground={hexToRgba(colors.primaryDark, 0.08)}
                  colorText={colors.primaryDark}
                  style={[
                    styles.outlineButton,
                    { borderColor: hexToRgba(colors.primaryDark, 0.24) },
                  ]}
                  disabled={isSubmitting || !isSessionReady}
                />
              </View>
            </View>
          ) : null}

          {showDirectBearer ? (
            <View style={styles.toolBlock}>
              <InputField
                label="Existing bearer token"
                placeholder="Bearer eyJ..."
                iconName="vpn-key"
                autoCapitalize="none"
                autoCorrect={false}
                value={bearerToken}
                onChangeText={(value) => {
                  setBearerToken(value);
                  resetInlineErrors();
                }}
                status={showBearerError ? 'error' : 'default'}
                helperText={
                  showBearerError
                    ? 'Bearer token is required.'
                    : 'Development fallback only. The last token stays on this device.'
                }
                containerStyle={styles.fieldSpacing}
                multiline
                numberOfLines={3}
                inputStyle={styles.bearerInput}
              />

              <View style={styles.buttonStack}>
                <AuthPrimaryButton
                  title={isSubmitting ? 'Signing In...' : 'Use Existing Bearer'}
                  onPress={handleDirectBearerSignIn}
                  colorBackground={hexToRgba(colors.primaryDark, 0.08)}
                  colorText={colors.primaryDark}
                  style={[
                    styles.outlineButton,
                    { borderColor: hexToRgba(colors.primaryDark, 0.24) },
                  ]}
                  disabled={isSubmitting || !isSessionReady}
                />
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {!hasAnySignInPath ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: hexToRgba(colors.error, 0.06), borderColor: hexToRgba(colors.error, 0.18) },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: colors.error }]}>No sign-in path is ready</Text>
          <Text style={[styles.emptyBody, { color: hexToRgba(colors.text, 0.64) }]}>
            Add your Google client ID in `.env`, restart Expo, then try again.
          </Text>
        </View>
      ) : null}

      <View style={styles.buttonStack}>
        <AuthPrimaryButton
          title="Create New Account"
          onPress={() => router.push('/(auth)/signUp')}
          colorBackground={colors.card}
          colorText={colors.primaryDark}
          style={[
            styles.outlineButton,
            { borderColor: hexToRgba(colors.primaryDark, 0.38) },
          ]}
        />
        {goalwealthApiConfig.enableDevHomeBypass ? (
          <AuthPrimaryButton
            title="Go Home (Test)"
            onPress={() => router.replace('/(tabs)/home')}
            colorBackground={hexToRgba(colors.primaryDark, 0.08)}
            colorText={colors.primaryDark}
            style={[
              styles.outlineButton,
              { borderColor: hexToRgba(colors.primaryDark, 0.2) },
            ]}
          />
        ) : null}
      </View>

      {authError ? (
        <View
          style={[
            styles.errorCard,
            { backgroundColor: hexToRgba(colors.error, 0.08) },
          ]}
        >
          <Text style={[styles.errorText, { color: colors.error }]}>{authError}</Text>
        </View>
      ) : null}

      {showLegacyPassword ? (
        <Pressable style={styles.linkWrap} onPress={() => router.push('/(auth)/forgetPassword')}>
          <Text style={[styles.link, { color: colors.primaryDark }]}>Forgot Password</Text>
        </Pressable>
      ) : null}
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusHint: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
  },
  adapterStatusText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  adapterStatusInline: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  primarySection: {
    width: '100%',
  },
  toolsSection: {
    width: '100%',
    marginTop: 22,
    gap: 16,
  },
  toolBlock: {
    width: '100%',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHelper: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
  },
  fieldSpacing: {
    marginTop: 18,
  },
  buttonStack: {
    marginTop: 18,
    gap: 10,
  },
  outlineButton: {
    borderWidth: 1,
  },
  helperText: {
    marginTop: 10,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  googleHintCard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  googleHintTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  googleHintBody: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
  },
  bearerInput: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  emptyCard: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyBody: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
  },
  errorCard: {
    marginTop: 14,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: Typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  linkWrap: {
    marginTop: 18,
    alignSelf: 'center',
  },
  link: {
    fontSize: Typography.body,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
