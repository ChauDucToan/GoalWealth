import React from 'react';
import { Redirect } from 'expo-router';

export default function SendMoneyRedirect() {
  return <Redirect href="/(tabs)/transactions" />;
}
