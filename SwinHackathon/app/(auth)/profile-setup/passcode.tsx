import { Redirect } from 'expo-router';

export default function PasscodeRedirect() {
  return <Redirect href="/(auth)/profile-setup/face-id" />;
}
