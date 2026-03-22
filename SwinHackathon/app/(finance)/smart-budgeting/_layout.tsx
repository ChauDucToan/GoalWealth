import { SmartBudgetingProvider } from '@/context/smartBudgetingContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function SmartBudgetingLayout() {
  return (
    <SmartBudgetingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </SmartBudgetingProvider>
  );
}
