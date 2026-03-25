import React from 'react';
import { Redirect } from 'expo-router';

export default function ChooseAvatarRedirect() {
  return <Redirect href="/(auth)/profile-setup/avatar" />;
}
