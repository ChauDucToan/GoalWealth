import { Stack } from '@/lib/expo-router';
import React from 'react';

export default function ProfileStackLayout() {
  return <Stack screenOptions={{ headerShown: false, presentation: 'card' }} />;
}
