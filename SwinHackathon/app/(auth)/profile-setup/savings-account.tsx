import { Redirect } from 'expo-router';

export default function SavingsAccountRedirect() {
  return <Redirect href="/(auth)/profile-setup/link-bank" />;
}
