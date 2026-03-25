import { Stack } from 'expo-router';
import React from 'react';

export default function SmartBudgetingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
      }}
    />
  );
}
