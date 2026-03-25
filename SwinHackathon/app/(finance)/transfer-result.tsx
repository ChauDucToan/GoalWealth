import React from 'react';
import { Redirect } from 'expo-router';

export default function TransferResultRedirect() {
  return <Redirect href="/(tabs)/transactions" />;
}
