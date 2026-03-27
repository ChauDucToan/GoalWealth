import React from 'react';
import { Redirect } from '@/lib/expo-router';

export default function PlanProcessingRedirect() {
  return <Redirect href="/(auth)/profile-setup/pick-plan" />;
}
