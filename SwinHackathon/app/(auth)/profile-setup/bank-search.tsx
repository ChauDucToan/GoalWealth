import { Redirect } from 'expo-router';

export default function BankSearchRedirect() {
  return <Redirect href="/(auth)/profile-setup/link-bank" />;
}
