import { requestGoalwealth } from '@/services/api/http';
import type {
  GoalwealthRecommendationDetailData,
  GoalwealthRecommendationMutationData,
  GoalwealthRecommendationsData,
} from '@/services/api/types';

export async function getGoalwealthRecommendations(accessToken?: string | null) {
  return requestGoalwealth<GoalwealthRecommendationsData>({
    path: '/v1/recommendations',
    method: 'GET',
    accessToken,
  });
}

export async function getGoalwealthRecommendation(
  recommendationId: string,
  accessToken?: string | null
) {
  return requestGoalwealth<GoalwealthRecommendationDetailData>({
    path: `/v1/recommendations/${encodeURIComponent(recommendationId)}`,
    method: 'GET',
    accessToken,
  });
}

export async function dismissGoalwealthRecommendation(
  recommendationId: string,
  accessToken?: string | null
) {
  return requestGoalwealth<GoalwealthRecommendationMutationData>({
    path: `/v1/recommendations/${encodeURIComponent(recommendationId)}/dismiss`,
    method: 'POST',
    accessToken,
  });
}

export async function undismissGoalwealthRecommendation(
  recommendationId: string,
  accessToken?: string | null
) {
  return requestGoalwealth<GoalwealthRecommendationMutationData>({
    path: `/v1/recommendations/${encodeURIComponent(recommendationId)}/undismiss`,
    method: 'POST',
    accessToken,
  });
}
