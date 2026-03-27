import { Stack } from '@/lib/expo-router';
import React from 'react';

export default function AssistantLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
      }}
    />
  );
}
