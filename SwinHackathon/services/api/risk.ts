import { requestGoalwealth } from '@/services/api/http';
import type {
  GoalwealthRiskProfileData,
  GoalwealthRiskProfileUpsertRequest,
} from '@/services/api/types';

export async function getGoalwealthRiskProfile(accessToken?: string | null) {
  return requestGoalwealth<GoalwealthRiskProfileData>({
    path: '/v1/risk-profile',
    method: 'GET',
    accessToken,
  });
}

export async function putGoalwealthRiskProfile(
  payload: GoalwealthRiskProfileUpsertRequest,
  accessToken?: string | null
) {
  return requestGoalwealth<GoalwealthRiskProfileData>({
    path: '/v1/risk-profile',
    method: 'PUT',
    accessToken,
    body: payload,
  });
}
