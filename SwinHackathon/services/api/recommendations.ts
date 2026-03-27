import { requestGoalwealth } from '@/services/api/http';
import type {
  GoalwealthRecommendationCompleteData,
  GoalwealthRecommendationDetailData,
  GoalwealthRecommendationMutationData,
  GoalwealthRecommendationsData,
} from '@/services/api/types';

type GoalwealthRecommendationsQuery = {
  scope?: string;
  status?: string;
  limit?: number;
};

function buildRecommendationsPath(query?: GoalwealthRecommendationsQuery) {
  const params: string[] = [];

  if (query?.scope) {
    params.push(`scope=${encodeURIComponent(query.scope)}`);
  }
  if (query?.status) {
    params.push(`status=${encodeURIComponent(query.status)}`);
  }
  if (typeof query?.limit === 'number' && Number.isFinite(query.limit)) {
    params.push(`limit=${encodeURIComponent(String(query.limit))}`);
  }

  return params.length > 0 ? `/v1/recommendations?${params.join('&')}` : '/v1/recommendations';
}

export async function getGoalwealthRecommendations(
  accessToken?: string | null,
  query?: GoalwealthRecommendationsQuery
) {
  return requestGoalwealth<GoalwealthRecommendationsData>({
    path: buildRecommendationsPath(query),
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

export async function completeGoalwealthRecommendation(
  recommendationId: string,
  accessToken?: string | null,
  targetPath?: string | null
) {
  const path =
    targetPath?.trim() && targetPath.startsWith('/v1/')
      ? targetPath
      : `/v1/recommendations/${encodeURIComponent(recommendationId)}/complete`;

  return requestGoalwealth<GoalwealthRecommendationCompleteData>({
    path,
    method: 'POST',
    accessToken,
  });
}
