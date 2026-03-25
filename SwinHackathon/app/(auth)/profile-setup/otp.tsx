import { Redirect } from 'expo-router';

export default function OtpRedirect() {
  return <Redirect href="/(auth)/profile-setup/face-id" />;
}
