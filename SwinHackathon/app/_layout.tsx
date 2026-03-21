import { AssistantProvider } from "@/context/assistantContext";
import { FinanceProvider } from "@/context/financeContext";
import { ThemeProvider } from "@/hooks/use-theme-colors";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AssistantProvider>
        <FinanceProvider>
          <Stack screenOptions={{headerShown:false}}>
            {/* landing */}
            <Stack.Screen name="index" options={{}}/>
            <Stack.Screen name="welcome" options={{}}/>
            {/* auth */}
            <Stack.Screen name="(auth)" options={{}}/>
            {/* main app */}
            <Stack.Screen name="(tabs)" options={{}}/>
            <Stack.Screen name="(finance)" options={{}}/>
            <Stack.Screen name="(assistant)" options={{}}/>
          </Stack>
        </FinanceProvider>
      </AssistantProvider>
    </ThemeProvider>
  );
}
