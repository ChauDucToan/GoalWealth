import { InputField } from '@/components/InputField';
import {
    AuthPrimaryButton,
    AuthScaffold,
    PasswordStrengthMeter,
    RobotIllustration,
} from '@/components/auth/AuthKit';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from '@/lib/expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';
import { useProfileSettings } from '@/context/profileSettingsContext';
import {
    buildAvatarInitialFromName,
    buildLinkedUserDisplayName,
    registerLinkedUserAccount,
} from '@/services/auth/user-registry';

export default function SignUp() {
    const router = useRouter();
    const { colors } = useTheme();
    const { updateProfile } = useProfileSettings();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const confirmPasswordError = submitAttempted && confirmPassword !== password
        ? 'Passwords do not match.'
        : '';

    const formatJoinedLabel = () =>
        `Joined ${new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())}`;

    const handleCreateAccount = () => {
        setSubmitAttempted(true);

        if (email.trim() && password.trim().length >= 8 && confirmPassword === password) {
            const displayName = buildLinkedUserDisplayName(email.trim());

            registerLinkedUserAccount({
                email: email.trim(),
                full_name: displayName,
                auth_mode: 'sign-up-draft',
                password: password.trim(),
            });

            updateProfile({
                name: displayName,
                email: email.trim().toLowerCase(),
                avatarInitial: buildAvatarInitialFromName(displayName),
                memberSince: formatJoinedLabel(),
            });
            router.push('/(auth)/profile-setup/avatar');
        }
    };

    return (
        <AuthScaffold title="Sign Up to finpal" illustration={<RobotIllustration />}>
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
            />

            <PasswordStrengthMeter password={password} />

            <InputField
                label="Confirm Password"
                placeholder="Enter your password..."
                iconName="lock"
                secureTextEntry
                isPassword
                value={confirmPassword}
                onChangeText={(value) => {
                    setConfirmPassword(value);
                    if (submitAttempted) setSubmitAttempted(false);
                }}
                containerStyle={styles.fieldSpacing}
                status={confirmPasswordError ? 'error' : 'default'}
                helperText={confirmPasswordError || undefined}
            />

            <View style={styles.buttonWrap}>
                <AuthPrimaryButton
                    title="Create Account"
                    onPress={handleCreateAccount}
                    colorBackground={colors.primaryDark}
                    colorText={colors.textLight}
                />
            </View>

            <Pressable
                style={styles.linkWrap}
                onPress={() => router.replace('/(auth)/signIn')}
            >
                <Text style={[styles.link, { color: colors.primaryDark }]}>
                    I Already Have Account
                </Text>
            </Pressable>
        </AuthScaffold>
    );
}

const styles = StyleSheet.create({
    fieldSpacing: {
        marginTop: 18,
    },
    buttonWrap: {
        marginTop: 28,
    },
    linkWrap: {
        marginTop: 20,
        alignSelf: 'center',
    },
    link: {
        fontSize: Typography.body,
        fontWeight: '700',
        textDecorationLine: 'underline',
    }
});
