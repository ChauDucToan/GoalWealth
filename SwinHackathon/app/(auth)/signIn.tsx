import { InputField } from '@/components/InputField';
import {
    AuthPrimaryButton,
    AuthScaffold,
    RememberMe,
    RobotIllustration,
    hexToRgba,
} from '@/components/auth/AuthKit';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const ENABLE_HOME_TEST_BYPASS = true;

export default function SignIn() {
    const router = useRouter();
    const { colors } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const showPasswordError = submitAttempted && password.trim().length < 8;

    const handleSubmit = () => {
        if (ENABLE_HOME_TEST_BYPASS) {
            router.replace('/(tabs)/home');
            return;
        }

        setSubmitAttempted(true);

        if (email.trim() && password.trim().length >= 8) {
            router.replace('/(tabs)/home');
        }
    };

    return (
        <AuthScaffold title="Sign In to finpal" illustration={<RobotIllustration />}>
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
                }}
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
                    title={ENABLE_HOME_TEST_BYPASS ? 'Sign In (Test to Home)' : 'Sign In'}
                    onPress={handleSubmit}
                    colorBackground={colors.primaryDark}
                    colorText={colors.textLight}
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
            </View>

            {ENABLE_HOME_TEST_BYPASS ? (
                <View
                    style={[
                        styles.testBadge,
                        { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                    ]}
                >
                    <Text style={[styles.testBadgeText, { color: colors.primaryDark }]}>
                        Test mode enabled: sign in now routes straight to Home.
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
