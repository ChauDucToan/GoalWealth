import { FinancialAssessmentProvider } from '@/context/financialAssessmentContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function FinancialAssessmentLayout() {
  return (
    <FinancialAssessmentProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </FinancialAssessmentProvider>
  );
}
