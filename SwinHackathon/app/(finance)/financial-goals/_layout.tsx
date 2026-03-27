import { FinancialGoalsProvider } from '@/context/financialGoalsContext';
import { Stack } from '@/lib/expo-router';
import React from 'react';

export default function FinancialGoalsLayout() {
  return (
    <FinancialGoalsProvider>
      <Stack screenOptions={{ headerShown: false, presentation: 'card' }} />
    </FinancialGoalsProvider>
  );
}
