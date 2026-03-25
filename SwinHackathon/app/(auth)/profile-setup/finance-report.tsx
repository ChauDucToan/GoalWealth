import { Redirect } from 'expo-router';

export default function FinanceReportRedirect() {
  return <Redirect href="/(auth)/profile-setup/financial-score" />;
}
