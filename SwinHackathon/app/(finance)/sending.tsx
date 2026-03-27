import React from 'react';
import { Redirect } from '@/lib/expo-router';

export default function SendingRedirect() {
  return <Redirect href="/(tabs)/transactions" />;
}
