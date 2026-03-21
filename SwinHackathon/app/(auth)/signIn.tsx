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
    getMissingOAuth2EnvVars,
    signInWithOAuth2Password,
} from '@/services/oauth2';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SignIn() {
    const router = useRouter();
    const { colors } = useTheme();
    const { dispatch, actions } = useMyUser();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [authError, setAuthError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const missingOAuth2EnvVars = getMissingOAuth2EnvVars();
    const isOAuth2Configured = missingOAuth2EnvVars.length === 0;

    const showEmailError = submitAttempted && !email.trim();
    const showPasswordError = submitAttempted && password.trim().length < 8;

    const handleSubmit = async () => {
        setSubmitAttempted(true);
        setAuthError('');

        if (!isOAuth2Configured) {
            setAuthError(`Missing OAuth2 configuration: ${missingOAuth2EnvVars.join(', ')}`);
            return;
        }

        if (!email.trim() || password.trim().length < 8) {
            return;
        }

        setIsSubmitting(true);
        dispatch(actions.setLoading(true));

        try {
            const result = await signInWithOAuth2Password({
                username: email.trim(),
                password: password.trim(),
            });

            dispatch(actions.signInSuccess(result.profile, result.accessToken));
            router.replace('/(tabs)/home');
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'Unable to sign in with OAuth2.';

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
            subtitle="Authenticate against your OAuth2 token endpoint using email and password."
            illustration={<RobotIllustration />}
        >
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
                helperText={showPasswordError ? 'ERROR: Incorrect password.' : undefined}
            />

            <RememberMe
                checked={rememberMe}
                onPress={() => setRememberMe((current) => !current)}
            />

            <View style={styles.buttonStack}>
                <AuthPrimaryButton
                    title={isSubmitting ? 'Signing In...' : 'Sign In'}
                    onPress={handleSubmit}
                    colorBackground={colors.primaryDark}
                    colorText={colors.textLight}
                    disabled={isSubmitting || !isOAuth2Configured}
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
            </View>

            {!isOAuth2Configured ? (
                <View
                    style={[
                        styles.testBadge,
                        { backgroundColor: hexToRgba(colors.warning, 0.12) },
                    ]}
                >
                    <Text style={[styles.testBadgeText, { color: colors.warning }]}>
                        Missing OAuth2 env vars: {missingOAuth2EnvVars.join(', ')}
                    </Text>
                    <Text style={[styles.hintText, { color: hexToRgba(colors.text, 0.64) }]}>
                        Create `.env` from `.env.example`, then restart Expo.
                    </Text>
                </View>
            ) : null}

            {authError && isOAuth2Configured ? (
                <View
                    style={[
                        styles.testBadge,
                        { backgroundColor: hexToRgba(colors.error, 0.08) },
                    ]}
                >
                    <Text style={[styles.testBadgeText, { color: colors.error }]}>
                        {authError}
                    </Text>
                </View>
            ) : null}

            <Pressable
                style={styles.linkWrap}
                onPress={() => router.push('/(auth)/forgetPassword')}
            >
                <Text style={[styles.link, { color: colors.primaryDark }]}>
                    Forgot Password
                </Text>
            </Pressable>
        </AuthScaffold>
    )
}

const styles = StyleSheet.create({
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
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
    },
    hintText: {
        marginTop: 6,
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 16,
    },
    linkWrap: {
        marginTop: 18,
        alignSelf: 'center',
    },
    link: {
        fontSize: 13,
        fontWeight: '700',
        textDecorationLine: 'underline',
    }
})
