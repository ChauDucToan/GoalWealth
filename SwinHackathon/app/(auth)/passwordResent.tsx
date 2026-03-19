import { ThemeButton } from "@/components/ThemeButton";
import { useTheme } from "@/hooks/use-theme-colors";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function PasswordResent() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.primaryLight }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <MaterialIcons name="email" size={64} color={colors.darkBackground} />
                <Text style={[styles.text, { color: colors.darkBackground }]}>
                    Password Resent
                </Text>
                <Text style={[styles.textDescription, { color: colors.text }]}>
                    Your password has been reset successfully. You can now login with your new password.
                </Text>
                <View style={{ marginTop: 24, marginBottom: 24, alignItems: 'center' }}>
                    <ThemeButton
                        title="Back to Sign In"
                        onPress={() => {
                            console.log('(auth) Sign In');
                            navigation.navigate('signIn' as never);
                        }}
                        colorBackground={colors.darkBackground}
                        colorText={colors.textLight}
                        style={styles.button}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 50,
        paddingBottom: 100,
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
    },
    textDescription: {
        fontSize: 14,
        textAlign: "center",
        paddingLeft: 8,
        paddingRight: 8,
        marginTop: 8,
        fontWeight: "200",
    },
    button: {
        width: 300,
    },
});
