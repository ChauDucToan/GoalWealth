import { Redirect } from 'expo-router';

export default function BankSuccessRedirect() {
  return <Redirect href="/(auth)/profile-setup/link-bank" />;
}
