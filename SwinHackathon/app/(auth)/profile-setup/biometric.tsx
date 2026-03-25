import React from 'react';
import { Redirect } from 'expo-router';

export default function BiometricRedirect() {
  return <Redirect href="/(auth)/profile-setup/face-id" />;
}
