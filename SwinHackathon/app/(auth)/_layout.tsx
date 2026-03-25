import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="signIn" />
            <Stack.Screen name="signUp" />
            <Stack.Screen name="forgetPassword" />
            <Stack.Screen name="passwordResent" />
        </Stack>
    );
}