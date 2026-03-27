import { InputField } from "@/components/InputField";
import {
    AuthPrimaryButton,
    AuthScaffold,
    AuthSupportText,
    ShieldIllustration,
} from "@/components/auth/AuthKit";
import { useTheme } from "@/hooks/use-theme-colors";
import { useRouter } from "@/lib/expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function ForgetPassword() {
    const { colors } = useTheme();
    const router = useRouter();
    const [email, setEmail] = useState('');

    const [submitAttempted, setSubmitAttempted] = useState(false);
    const isEmailValid = /\S+@\S+\.\S+/.test(email.trim());
    const emailError = submitAttempted && !isEmailValid
        ? 'Invalid email address!'
        : '';

    const handleContinue = () => {
        setSubmitAttempted(true);

        if (isEmailValid) {
            console.log('(auth) Password Reset Sent');
            router.push('/(auth)/passwordResent');
        }
    };

    return (
        <AuthScaffold
            title="Forgot Password"
            subtitle="Please enter your email address to reset your password."
            illustration={<ShieldIllustration />}
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
                }}
                status={emailError ? 'error' : 'default'}
                helperText={emailError || undefined}
            />

            <View style={styles.buttonWrap}>
                <AuthPrimaryButton
                    title="Continue"
                    onPress={handleContinue}
                    colorBackground={colors.primaryDark}
                    colorText={colors.textLight}
                />
            </View>

            <AuthSupportText />
        </AuthScaffold>
    );
}

const styles = StyleSheet.create({
    buttonWrap: {
        marginTop: 20,
    }
});
