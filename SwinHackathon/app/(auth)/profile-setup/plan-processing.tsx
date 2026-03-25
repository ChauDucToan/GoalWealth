import { Redirect } from 'expo-router';

export default function PlanProcessingRedirect() {
  return <Redirect href="/(auth)/profile-setup/pick-plan" />;
}
