import React from 'react';
import { Redirect } from '@/lib/expo-router';

export default function FinanceReportRedirect() {
  return <Redirect href="/(auth)/profile-setup/financial-score" />;
}
