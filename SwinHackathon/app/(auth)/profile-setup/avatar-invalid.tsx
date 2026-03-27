import React from 'react';
import { Redirect } from '@/lib/expo-router';

export default function AvatarInvalidRedirect() {
  return <Redirect href="/(auth)/profile-setup/avatar" />;
}
