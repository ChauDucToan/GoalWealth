import React from 'react';
import { Redirect } from '@/lib/expo-router';

export default function PasscodeRedirect() {
  return <Redirect href="/(auth)/profile-setup/face-id" />;
}
