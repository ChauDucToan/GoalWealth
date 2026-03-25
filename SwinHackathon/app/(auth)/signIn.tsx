import { InputField } from '@/components/InputField';
import {
  AuthPrimaryButton,
  AuthScaffold,
  RememberMe,
  RobotIllustration,
  hexToRgba,
} from '@/components/auth/AuthKit';
import { useMyUser } from '@/context/myUserContext';
import { useTheme } from '@/hooks/use-theme-colors';
import {
  goalwealthApiConfig,
  isGoalwealthAdapterConfigured,
  isGoalwealthLiveAdapterEnabled,
} from '@/services/api/config';
import { normalizeGoalwealthError } from '@/services/api/errors';
import { getGoalwealthReady } from '@/services/api/meta';
import {
  getConfiguredSignInMode,
  signInWithConfiguredMethod,
} from '@/services/auth/sign-in';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

export default function SignIn() {
  const router = useRouter();
  const { colors } = useTheme();
  const { state, dispatch, actions, isSessionReady } = useMyUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adapterReadyState, setAdapterReadyState] = useState<
    'idle' | 'checking' | 'ready' | 'error'
  >('idle');
  const [adapterReadyMessage, setAdapterReadyMessage] = useState('');
  const signInMode = getConfiguredSignInMode();
  const isConfigured = signInMode !== 'unconfigured';
  const liveAdapterEnabled = isGoalwealthLiveAdapterEnabled();
  const adapterPreflightRequired =
    liveAdapterEnabled && isGoalwealthAdapterConfigured() && signInMode === 'dev-bridge';

  useEffect(() => {
    if (isSessionReady && state.isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isSessionReady, router, state.isAuthenticated]);

  useEffect(() => {
    if (!adapterPreflightRequired) {
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
        const openclawConfigured = checks.openclaw_config_present !== false;

        if (!configLoaded) {
          setAdapterReadyState('error');
          setAdapterReadyMessage('GoalWealth adapter loaded without runtime config.');
          return;
        }

        if (!openclawConfigured) {
          setAdapterReadyState('error');
          setAdapterReadyMessage('GoalWealth adapter is up, but OpenClaw runtime is not configured.');
          return;
        }

        const runtimeEnvironment =
          typeof response.data.runtime?.environment === 'string'
            ? response.data.runtime.environment
            : null;

        setAdapterReadyState('ready');
        setAdapterReadyMessage(
          runtimeEnvironment
            ? `Adapter ready • ${response.data.service} • ${runtimeEnvironment}`
            : `Adapter ready • ${response.data.service}`
        );
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        const normalized = normalizeGoalwealthError(error);
        setAdapterReadyState('error');
        setAdapterReadyMessage(normalized.message);
      });

    return () => {
      cancelled = true;
    };
  }, [adapterPreflightRequired]);

  const modeCopy = useMemo(() => {
    switch (signInMode) {
      case 'dev-bridge':
        return {
          subtitle: 'Use the GoalWealth dev auth bridge while Google sign-in is still being wired.',
          badgeTone: colors.success,
          badgeLabel: 'Dev bridge ready',
          hint: 'A dev token will be issued locally and sent to the GoalWealth adapter as Bearer auth.',
        };
      case 'legacy-oauth':
        return {
          subtitle: 'Temporary legacy OAuth bridge for development compatibility only.',
          badgeTone: colors.warning,
          badgeLabel: 'Legacy bridge',
          hint: 'This path stays transitional. Google OIDC remains the target auth direction.',
        };
      default:
        return {
          subtitle: 'Configure the GoalWealth adapter or enable the temporary legacy bridge before signing in.',
          badgeTone: colors.error,
          badgeLabel: 'Sign-in not configured',
          hint: 'Update your .env from .env.example, then restart Expo.',
        };
    }
  }, [colors.error, colors.success, colors.warning, signInMode]);

  const showEmailError = submitAttempted && !email.trim();
  const showPasswordError =
    submitAttempted && signInMode === 'legacy-oauth' && password.trim().length < 8;

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    setAuthError('');

    if (!isConfigured) {
      setAuthError(
        'Sign-in is not configured. Set GoalWealth adapter env values or enable the temporary legacy bridge.'
      );
      return;
    }

    if (adapterPreflightRequired && adapterReadyState !== 'ready') {
      setAuthError(
        adapterReadyMessage || 'GoalWealth adapter is not ready yet. Check /ready before signing in.'
      );
      return;
    }

    if (!email.trim() || (signInMode === 'legacy-oauth' && password.trim().length < 8)) {
      return;
    }

    setIsSubmitting(true);
    dispatch(actions.setLoading(true));

    try {
      const result = await signInWithConfiguredMethod({
        email: email.trim(),
        password: password.trim(),
      });

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

  return (
    <AuthScaffold
      title="Sign In to finpal"
      subtitle={modeCopy.subtitle}
      illustration={<RobotIllustration />}
    >
      <View
        style={[
          styles.modeBadge,
          { backgroundColor: hexToRgba(modeCopy.badgeTone, 0.12) },
        ]}
      >
        <Text style={[styles.modeBadgeText, { color: modeCopy.badgeTone }]}>
          {modeCopy.badgeLabel}
        </Text>
        <Text style={[styles.modeHintText, { color: hexToRgba(colors.text, 0.62) }]}>
          {modeCopy.hint}
        </Text>
        {adapterPreflightRequired ? (
          <Text
            style={[
              styles.adapterStatusText,
              {
                color:
                  adapterReadyState === 'ready'
                    ? colors.success
                    : adapterReadyState === 'error'
                      ? colors.error
                      : hexToRgba(colors.text, 0.62),
              },
            ]}
          >
            {adapterReadyState === 'checking'
              ? 'Checking GoalWealth adapter readiness...'
              : adapterReadyMessage || 'GoalWealth readiness will be checked before sign-in.'}
          </Text>
        ) : null}
      </View>

      <InputField
        label="Email Address"
        placeholder="Enter your email address..."
        iconName="email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          if (submitAttempted) setSubmitAttempted(false);
          if (authError) setAuthError('');
        }}
        status={showEmailError ? 'error' : 'default'}
        helperText={showEmailError ? 'Email address is required.' : undefined}
      />

      {signInMode === 'legacy-oauth' ? (
        <>
          <InputField
            label="Password"
            placeholder="Enter your password..."
            iconName="lock"
            secureTextEntry
            isPassword
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (submitAttempted) setSubmitAttempted(false);
              if (authError) setAuthError('');
            }}
            containerStyle={styles.fieldSpacing}
            status={showPasswordError ? 'error' : 'default'}
            helperText={
              showPasswordError
                ? 'Password must be at least 8 characters for the legacy bridge.'
                : 'Temporary compatibility bridge only.'
            }
          />

          <RememberMe checked={rememberMe} onPress={() => setRememberMe((current) => !current)} />
        </>
      ) : null}

      <View style={styles.buttonStack}>
        <AuthPrimaryButton
          title={isSubmitting ? 'Signing In...' : 'Sign In'}
          onPress={handleSubmit}
          colorBackground={colors.primaryDark}
          colorText={colors.textLight}
          disabled={
            isSubmitting ||
            !isConfigured ||
            !isSessionReady ||
            (adapterPreflightRequired && adapterReadyState !== 'ready')
          }
        />
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
            styles.testBadge,
            { backgroundColor: hexToRgba(colors.error, 0.08) },
          ]}
        >
          <Text style={[styles.testBadgeText, { color: colors.error }]}>{authError}</Text>
        </View>
      ) : null}

      <Pressable style={styles.linkWrap} onPress={() => router.push('/(auth)/forgetPassword')}>
        <Text style={[styles.link, { color: colors.primaryDark }]}>Forgot Password</Text>
      </Pressable>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  modeBadge: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
  },
  modeBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  modeHintText: {
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
  fieldSpacing: {
    marginTop: 18,
  },
  buttonStack: {
    marginTop: 26,
    gap: 10,
  },
  outlineButton: {
    borderWidth: 1,
  },
  testBadge: {
    marginTop: 14,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  testBadgeText: {
    fontSize: Typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  hintText: {
    marginTop: 6,
    fontSize: Typography.body,
    textAlign: 'center',
    lineHeight: 16,
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
