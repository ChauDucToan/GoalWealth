import { Href, Router } from 'expo-router';

export function goSmartBudgetBack(router: Router, fallback: Href) {
  router.replace(fallback);
}
