import { ThemeProvider } from "@/hooks/use-theme-colors";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{headerShown:false}}>
        {/* landing */}
        <Stack.Screen name="index" options={{}}/>
        {/* auth */}
        <Stack.Screen name="(auth)" options={{}}/>
        {/* main app */}
        <Stack.Screen name="(tabs)" options={{}}/>
      </Stack>
    </ThemeProvider>
  );
}
