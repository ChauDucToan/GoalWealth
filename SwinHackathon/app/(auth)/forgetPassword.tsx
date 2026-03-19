import { InputField } from "@/components/InputField";
import { ThemeButton } from "@/components/ThemeButton";
import { useTheme } from "@/hooks/use-theme-colors";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
export default function ForgetPassword() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
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
                <MaterialIcons name="password" size={64} color={colors.darkBackground} />
                <Text style={[styles.text, { color: colors.darkBackground }]}>
                    Forget Password
                </Text>
                <Text style={[styles.textDescription, { color: colors.text }]}>
                    Enter your email address and we'll send you a link to reset your password.
                </Text>
                <InputField
                    label="Email"
                    placeholder="Enter your email"
                    iconName="email"
                    value={email}
                    onChangeText={setEmail}
                    containerStyle={{ marginTop: 24 }}
                />

                <View style={{ marginTop: 24, marginBottom: 24, alignItems: 'center' }}>
                    <ThemeButton
                        title="Send"
                        onPress={() => {
                            console.log('(auth) Password Resent');
                            navigation.navigate('passwordResent' as never);
                            // console.log(navigation.getState());
                        }}
                        colorBackground={colors.darkBackground}
                        colorText={colors.textLight}
                        style={styles.button}
                    />

                    <ThemeButton
                        title="Back to Sign In"
                        onPress={() => {
                            navigation.goBack();
                        }}
                        colorBackground={colors.primaryLight}
                        colorText={colors.darkBackground}
                        style={[styles.button, styles.buttonOdd]}
                    />
                </View>
                <Text style={styles.textDescription}>
                    Don't remember your email? Contact us at <Text style={[styles.textNote, { color: colors.darkBackground }]}> "help@gmail.com"</Text>
                </Text>
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
    button: {
        width: 300,
    },
    buttonOdd: {
        borderColor: "#0c3a7b",
        borderWidth: 1,
        marginTop: 12,
    },
    textDescription: {
        fontSize: 14,
        textAlign: "center",
        paddingLeft: 8,
        paddingRight: 8,
        marginTop: 8,
        fontWeight: "200",
    },
    textNote: {
        fontSize: 14,
        fontWeight: "bold",
        textDecorationLine: 'underline',
    }
});