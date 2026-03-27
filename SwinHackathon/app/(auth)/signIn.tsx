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
import { goalwealthApiConfig } from '@/services/api/config';
import { loadLastUsedAdapterBearerToken } from '@/services/auth/direct-bearer';
import {
  getGoogleOidcPlatformConfig,
  getGoogleOidcRequestConfig,
  isGoogleOidcConfigured,
} from '@/services/auth/google-oidc';
import {
  signInWithAdapterBearer,
  signInWithGoogleOidc,
  signInWithRegisteredPassword,
} from '@/services/auth/sign-in';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Google from 'expo-auth-session/providers/google';
import type { AuthSessionResult } from 'expo-auth-session';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from '@/lib/expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_PLACEHOLDER_CLIENT_ID = 'goalwealth-placeholder.apps.googleusercontent.com';

function isResolvedAuthSessionResult(
  result: AuthSessionResult
): result is Extract<AuthSessionResult, { type: 'success' | 'error' }> {
  return result.type === 'success' || result.type === 'error';
}

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

  const googleConfigured = isGoogleOidcConfigured();
  const showGoogleOption =
    googleConfigured || Boolean(process.env.EXPO_PUBLIC_GOOGLE_OIDC_CLIENT_ID?.trim());
  const showRegisteredPassword = true;
  const showDirectBearer = true;
  const googlePlatformConfig = useMemo(
    () => getGoogleOidcPlatformConfig(),
    []
  );
  const requiresNativeGoogleBuild =
    googleConfigured &&
    (googlePlatformConfig.platform === 'android' || googlePlatformConfig.platform === 'ios') &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  const showGoogleClientConfigError =
    showGoogleOption &&
    (googlePlatformConfig.platform === 'android' || googlePlatformConfig.platform === 'ios') &&
    !googlePlatformConfig.hasUsableClientId;

  const googleRequestConfig = useMemo(() => {
    if (googleConfigured) {
      return getGoogleOidcRequestConfig();
    }

    return {
      clientId: GOOGLE_PLACEHOLDER_CLIENT_ID,
      webClientId: GOOGLE_PLACEHOLDER_CLIENT_ID,
      iosClientId: GOOGLE_PLACEHOLDER_CLIENT_ID,
      androidClientId: GOOGLE_PLACEHOLDER_CLIENT_ID,
      redirectUri: undefined,
      scopes: ['openid', 'profile', 'email'],
      selectAccount: true,
    };
  }, [googleConfigured]);

  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest(googleRequestConfig);
  const handledGoogleResponseKey = useRef('');

  const completeSignIn = useCallback(async (
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
  }, [actions, dispatch, router]);

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
    if (!googleResponse) {
      return;
    }

    const resolvedGoogleResponse = isResolvedAuthSessionResult(googleResponse) ? googleResponse : null;

    const responseKey = JSON.stringify({
      type: googleResponse.type,
      params: resolvedGoogleResponse?.params ?? null,
      hasAuthentication: Boolean(resolvedGoogleResponse?.authentication),
      hasIdToken: Boolean(resolvedGoogleResponse?.authentication?.idToken),
      hasAccessToken: Boolean(resolvedGoogleResponse?.authentication?.accessToken),
    });

    if (handledGoogleResponseKey.current === responseKey) {
      return;
    }

    handledGoogleResponseKey.current = responseKey;

    console.log(
      JSON.stringify(
        {
          scope: 'google-sign-in',
          step: 'auth_response',
          type: googleResponse.type,
          hasIdToken:
            Boolean(resolvedGoogleResponse?.authentication?.idToken) ||
            typeof resolvedGoogleResponse?.params?.id_token === 'string',
          hasAccessToken:
            Boolean(resolvedGoogleResponse?.authentication?.accessToken) ||
            typeof resolvedGoogleResponse?.params?.access_token === 'string',
          hasCode: typeof resolvedGoogleResponse?.params?.code === 'string',
        },
        null,
        2
      )
    );

    if (googleResponse.type === 'error') {
      const params = 'params' in googleResponse ? googleResponse.params : undefined;
      const errorDescription =
        typeof params?.error_description === 'string'
          ? params.error_description
          : 'Google sign-in could not be completed.';
      setAuthError(errorDescription);
      setIsSubmitting(false);
      dispatch(actions.setLoading(false));
      return;
    }

    if (googleResponse.type !== 'success') {
      setIsSubmitting(false);
      dispatch(actions.setLoading(false));
      return;
    }

    const idToken =
      resolvedGoogleResponse?.authentication?.idToken ??
      (typeof resolvedGoogleResponse?.params?.id_token === 'string'
        ? resolvedGoogleResponse.params.id_token
        : '');
    const accessToken =
      resolvedGoogleResponse?.authentication?.accessToken ??
      (typeof resolvedGoogleResponse?.params?.access_token === 'string'
        ? resolvedGoogleResponse.params.access_token
        : undefined);

    if (!idToken) {
      setAuthError('Google sign-in succeeded, but no ID token was returned.');
      setIsSubmitting(false);
      dispatch(actions.setLoading(false));
      return;
    }

    void completeSignIn(() => signInWithGoogleOidc({ idToken, accessToken }));
  }, [actions, completeSignIn, dispatch, googleResponse]);

  const showEmailError =
    submitAttempted && showRegisteredPassword && !email.trim();
  const showPasswordError =
    submitAttempted && showRegisteredPassword && password.trim().length < 8;
  const showBearerError = submitAttempted && showDirectBearer && !bearerToken.trim();

  const resetInlineErrors = () => {
    if (submitAttempted) {
      setSubmitAttempted(false);
    }
    if (authError) {
      setAuthError('');
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');

    console.log(
      JSON.stringify(
        {
          scope: 'google-sign-in',
          step: 'request_config',
          platform: googlePlatformConfig.platform,
          activeClientId: googlePlatformConfig.activeClientId,
          redirectUri: googleRequest?.redirectUri ?? googleRequestConfig.redirectUri ?? null,
        },
        null,
        2
      )
    );

    if (showGoogleClientConfigError) {
      setAuthError(
        `Google sign-in is not ready on this ${googlePlatformConfig.platform} build yet. Add the platform-specific Google OAuth client ID and restart the app.`
      );
      return;
    }

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

      if (response.type === 'error') {
        const params =
          'params' in response && response.params ? response.params : undefined;
        const errorDescription =
          typeof params?.error_description === 'string'
            ? params.error_description
            : 'Google sign-in could not be completed.';
        setAuthError(errorDescription);
        setIsSubmitting(false);
        dispatch(actions.setLoading(false));
        return;
      }

      if (response.type !== 'success') {
        setIsSubmitting(false);
        dispatch(actions.setLoading(false));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed.';
      setAuthError(message);
      dispatch(actions.setError(message));
      setIsSubmitting(false);
      dispatch(actions.setLoading(false));
    }
  };

  const handleLegacySignIn = async () => {
    setSubmitAttempted(true);
    setAuthError('');

    if (!showRegisteredPassword) {
      setAuthError('Email and password sign-in is not available right now.');
      return;
    }

    if (!email.trim() || password.trim().length < 8) {
      return;
    }

    await completeSignIn(() =>
      signInWithRegisteredPassword({
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
      subtitle="Sign in with your account credentials, Google, or an existing bearer token."
      illustration={<RobotIllustration />}
    >
      {showRegisteredPassword ? (
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
            helperText={showPasswordError ? 'Password must be at least 8 characters.' : undefined}
          />

          <RememberMe checked={rememberMe} onPress={() => setRememberMe((current) => !current)} />

          {showGoogleOption ? (
            <View style={styles.googleButtonWrap}>
              <Pressable
                onPress={handleGoogleSignIn}
                disabled={isSubmitting || !isSessionReady || !googleRequest || requiresNativeGoogleBuild}
                style={({ pressed }) => [
                  styles.googleButton,
                  {
                    backgroundColor: colors.primaryDark,
                    opacity:
                      isSubmitting || !isSessionReady || !googleRequest || requiresNativeGoogleBuild
                        ? 0.56
                        : pressed
                          ? 0.9
                          : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}
              >
                <MaterialCommunityIcons name="google" size={20} color={colors.textLight} />
                <Text style={[styles.googleButtonText, { color: colors.textLight }]}>
                  {isSubmitting
                    ? 'Signing In...'
                    : googleRequest
                      ? 'Continue with Google'
                      : 'Preparing Google...'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.buttonStack}>
            <AuthPrimaryButton
              title={isSubmitting ? 'Signing In...' : 'Sign In with Email'}
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

      {showRegisteredPassword ? (
        <Pressable style={styles.linkWrap} onPress={() => router.push('/(auth)/forgetPassword')}>
          <Text style={[styles.link, { color: colors.primaryDark }]}>Forgot Password</Text>
        </Pressable>
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
            helperText={showBearerError ? 'Bearer token is required.' : undefined}
            containerStyle={styles.fieldSpacing}
            multiline
            numberOfLines={3}
            inputStyle={styles.bearerInput}
          />

          <View style={styles.buttonStack}>
            <AuthPrimaryButton
              title={isSubmitting ? 'Signing In...' : 'Sign In with Bearer'}
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
  googleButtonWrap: {
    width: '100%',
    marginTop: 20,
  },
  googleButton: {
    minHeight: 54,
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
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
