export type GoalwealthRecommendationAppRoute =
  | '/(tabs)/assistant'
  | '/(finance)/financial-assessment'
  | '/(finance)/financial-goals'
  | '/(finance)/smart-budgeting/add-spending'
  | '/(profile)/account';

export function resolveGoalwealthRecommendationActionRoute(
  target?: string | null
): GoalwealthRecommendationAppRoute {
  if (!target?.trim()) {
    return '/(tabs)/assistant';
  }

  if (target === '/risk-profile') {
    return '/(finance)/financial-assessment';
  }

  if (target === '/goals') {
    return '/(finance)/financial-goals';
  }

  if (target === '/chat') {
    return '/(tabs)/assistant';
  }

  if (target === '/ocr' || target.startsWith('/ocr/records')) {
    return '/(finance)/smart-budgeting/add-spending';
  }

  if (target === '/me' || target === '/profile') {
    return '/(profile)/account';
  }

  return '/(tabs)/assistant';
}

export function buildGoalwealthRecommendationDetailRoute(recommendationId: string) {
  return `/(assistant)/recommendation/${encodeURIComponent(recommendationId)}` as const;
}
