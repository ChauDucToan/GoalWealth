import { Redirect } from 'expo-router';

export default function DataSecureRedirect() {
  return <Redirect href="/(auth)/profile-setup/confirm-account" />;
}
