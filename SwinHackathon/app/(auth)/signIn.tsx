import { InputField } from '@/components/InputField';
import { ThemeButton } from '@/components/ThemeButton';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
export default function SignIn() {
    const navigation = useNavigation();
    const { colors } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const getPasswordStrength = (pass: string) => {
        if (!pass) return { label: '', color: 'transparent' };
        if (pass.length < 6) return { label: 'Weak', color: '#ff4d4d' };

        const hasNumber = /[0-9]/.test(pass);
        const hasLetter = /[a-zA-Z]/.test(pass);
        const hasSpecial = /[^a-zA-Z0-9]/.test(pass);

        if (pass.length >= 8 && hasNumber && hasLetter && hasSpecial) {
            return { label: 'Strong', color: '#4CAF50' };
        }
        return { label: 'Medium', color: '#FFA500' };
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
                    Sign In to Goal Wealth
                </Text>

                <InputField label="Email" placeholder="Enter your email" iconName="email" value={email} onChangeText={setEmail} containerStyle={{ marginTop: 24 }} />
                <InputField label="Password" placeholder="Enter your password" iconName="lock" secureTextEntry isPassword={true} value={password} onChangeText={setPassword} containerStyle={{ marginTop: 12 }} />

                {password.length > 0 && (
                    <View style={styles.strengthContainer}>
                        <Text style={[styles.strengthText, { color: strength.color }]}>
                            Password Strength: {strength.label}
                        </Text>
                    </View>
                )}

                <View style={{ marginTop: 24, marginBottom: 24, alignItems: 'center' }}>
                    <ThemeButton title="Sign In" onPress={() => {
                        console.log('(auth) Sign In');
                    }} colorBackground={colors.darkBackground} colorText={colors.textLight} style={styles.button} />

                    <ThemeButton title="Create New Account" onPress={() => {
                        navigation.navigate('signUp' as never);
                        // console.log(navigation.getState());
                    }} colorBackground={colors.primaryLight} colorText={colors.darkBackground} style={[styles.button, styles.buttonOdd]} />
                    <Pressable style={{ marginTop: 4 }} onPress={() => {
                        navigation.navigate('forgetPassword' as never);
                    }}>
                        <Text style={[styles.textNote, { color: colors.darkBackground }]}>
                            Forgot password?
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>

    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 50,
        paddingBottom: 100,
    },
    subContainer: {
        marginTop: 24,
        marginBottom: 24
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
    },
    textDescription: {
        fontSize: 18,
        fontWeight: "200",
        paddingLeft: 8,
        paddingRight: 8,
        textAlign: "center"
    },
    textNote: {
        fontSize: 14,
        fontWeight: "bold",
        textDecorationLine: 'underline',

    },
    loading: {
        marginTop: 12,
    },
    button: {
        width: 300,
    },
    buttonOdd: {
        borderColor: "#0c3a7b",
        borderWidth: 1,
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
})