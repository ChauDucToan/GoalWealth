import { Redirect } from 'expo-router';

export default function ShareBudgetQrRedirect() {
  return <Redirect href="/(finance)/smart-budgeting/share-budget" />;
}
