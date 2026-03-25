import { Redirect } from 'expo-router';

export default function FreeTrialRedirect() {
  return <Redirect href="/(auth)/profile-setup/financial-score" />;
}
