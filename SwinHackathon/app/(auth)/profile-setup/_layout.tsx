import { ProfileSetupProvider } from '@/context/profileSetupContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileSetupLayout() {
  return (
    <ProfileSetupProvider>
      <Stack screenOptions={{ headerShown: false, presentation: 'card' }} />
    </ProfileSetupProvider>
  );
}
