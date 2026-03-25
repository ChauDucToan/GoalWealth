import { Redirect } from 'expo-router';

export default function BankEmptyRedirect() {
  return <Redirect href="/(auth)/profile-setup/link-bank" />;
}
