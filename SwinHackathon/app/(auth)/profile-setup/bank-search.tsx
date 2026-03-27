import React from 'react';
import { Redirect } from '@/lib/expo-router';

export default function BankSearchRedirect() {
  return <Redirect href="/(auth)/profile-setup/link-bank" />;
}
