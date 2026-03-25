import { SubscriptionSetupProvider } from '@/context/subscriptionSetupContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function SubscriptionSetupLayout() {
  return (
    <SubscriptionSetupProvider>
      <Stack screenOptions={{ headerShown: false, presentation: 'card' }} />
    </SubscriptionSetupProvider>
  );
}
