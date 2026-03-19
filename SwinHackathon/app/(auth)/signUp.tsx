import { InputField } from '@/components/InputField';
import { ThemeButton } from '@/components/ThemeButton';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SignUp() {
    const navigation = useNavigation();
    const { colors } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const getPasswordStrength = (pass: string) => {
        if (!pass) return { label: '', color: 'transparent' };
        if (pass.length < 6) return { label: 'Weak', color: '#ff4d4d' }; // red

        const hasNumber = /[0-9]/.test(pass);
        const hasLetter = /[a-zA-Z]/.test(pass);
        const hasSpecial = /[^a-zA-Z0-9]/.test(pass);

        if (pass.length >= 8 && hasNumber && hasLetter && hasSpecial) {
            return { label: 'Strong', color: '#4CAF50' }; // green
        }
        return { label: 'Medium', color: '#FFA500' }; // orange
    };

    const strength = getPasswordStrength(password);

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
                <MaterialCommunityIcons name="finance" size={64} color={colors.darkBackground} />
                <Text style={[styles.text, { color: colors.darkBackground }]}>
                    Sign Up to Goal Wealth
                </Text>

                <InputField
                    label="Email"
                    placeholder="Enter your email"
                    iconName="email"
                    value={email}
                    onChangeText={setEmail}
                    containerStyle={{ marginTop: 24 }}
                />

                <InputField
                    label="Password"
                    placeholder="Enter your password"
                    iconName="lock"
                    secureTextEntry
                    isPassword={true}
                    value={password}
                    onChangeText={setPassword}
                    containerStyle={{ marginTop: 12 }}
                />

                {password.length > 0 && (
                    <View style={styles.strengthContainer}>
                        <Text style={[styles.strengthText, { color: strength.color }]}>
                            Password Strength: {strength.label}
                        </Text>
                    </View>
                )}

                <InputField
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    iconName="lock"
                    secureTextEntry
                    isPassword={true}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    containerStyle={{ marginTop: 12 }}
                />

                <View style={{ marginTop: 24, marginBottom: 24, alignItems: 'center' }}>
                    <ThemeButton
                        title="Sign Up"
                        onPress={() => {
                            // Handle sign up logic here
                            console.log('(auth) Sign Up');
                        }}
                        colorBackground={colors.darkBackground}
                        colorText={colors.textLight}
                        style={styles.button}
                    />

                    <ThemeButton
                        title="Already have an account? Sign In"
                        onPress={() => {
                            navigation.goBack();
                        }}
                        colorBackground={colors.primaryLight}
                        colorText={colors.darkBackground}
                        style={[styles.button, styles.buttonOdd]}
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
    textNote: {
        fontSize: 14,
        fontWeight: "bold",
        textDecorationLine: 'underline',
    },
    button: {
        width: 300,
    },
    buttonOdd: {
        borderColor: "#0c3a7b",
        borderWidth: 1,
        marginTop: 12,
    },
    strengthContainer: {
        width: '85%',
        alignItems: 'flex-start',
        marginTop: 4,
        paddingLeft: 4,
    },
    strengthText: {
        fontSize: 12,
        fontWeight: 'bold',
    }
});
