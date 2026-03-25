import { Redirect } from 'expo-router';

export default function AvatarUploadingRedirect() {
  return <Redirect href="/(auth)/profile-setup/avatar" />;
}
