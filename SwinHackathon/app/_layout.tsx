import { AssistantProvider } from "@/context/assistantContext";
import { FinanceProvider } from "@/context/financeContext";
import { IntroPreferencesProvider } from "@/context/introPreferencesContext";
import { MyUserProvider } from "@/context/myUserContext";
import { ProfileSettingsProvider } from "@/context/profileSettingsContext";
import { SmartBudgetingProvider } from "@/context/smartBudgetingContext";
import { ThemeProvider } from "@/hooks/use-theme-colors";
import { Stack } from "@/lib/expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <MyUserProvider>
        <ProfileSettingsProvider>
          <SmartBudgetingProvider>
            <IntroPreferencesProvider>
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
                    <Stack.Screen name="(profile)" options={{}}/>
                  </Stack>
                </FinanceProvider>
              </AssistantProvider>
            </IntroPreferencesProvider>
          </SmartBudgetingProvider>
        </ProfileSettingsProvider>
      </MyUserProvider>
    </ThemeProvider>
  );
}
