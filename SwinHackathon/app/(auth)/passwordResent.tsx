import {
    AuthPrimaryButton,
    AuthScaffold,
    AuthSupportText,
    PasswordResetIllustration,
} from "@/components/auth/AuthKit";
import { useTheme } from "@/hooks/use-theme-colors";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function PasswordResent() {
    const { colors } = useTheme();
    const router = useRouter();
    return (
        <AuthScaffold
            title="Password Reset Sent."
            subtitle="Please check your email in a few minutes - we've sent you an email containing password recovery link."
            illustration={<PasswordResetIllustration />}
        >
            <View style={styles.buttonWrap}>
                <AuthPrimaryButton
                    title="Continue"
                    onPress={() => {
                        console.log('(auth) Sign In');
                        router.replace('/(auth)/signIn');
                    }}
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
        marginTop: 12,
    },
});
