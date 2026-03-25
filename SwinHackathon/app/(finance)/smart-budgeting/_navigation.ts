import { Href, Router } from 'expo-router';

export function goSmartBudgetBack(router: Router, fallback: Href) {
  router.replace(fallback);
}

export function resolveSmartBudgetReturnRoute(returnTo?: string | string[]): Href {
  const value = Array.isArray(returnTo) ? returnTo[0] : returnTo;

  if (value === 'budget-insights') {
    return '/(finance)/smart-budgeting/budget-insights';
  }

  return '/(tabs)/smart-budgeting';
}
