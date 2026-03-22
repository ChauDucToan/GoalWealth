import { Redirect } from 'expo-router';

export default function CreateBudgetCategoryRedirect() {
  return <Redirect href="/(finance)/smart-budgeting/edit-category" />;
}
