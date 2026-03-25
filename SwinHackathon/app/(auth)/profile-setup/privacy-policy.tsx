import { Redirect } from 'expo-router';

export default function PrivacyPolicyRedirect() {
  return <Redirect href="/(auth)/profile-setup/confirm-account" />;
}
