import { requestGoalwealth } from '@/services/api/http';
import type {
  GoalwealthGoalCreateData,
  GoalwealthGoalCreateRequest,
  GoalwealthGoalsListData,
} from '@/services/api/types';

export async function getGoalwealthGoals(accessToken?: string | null) {
  return requestGoalwealth<GoalwealthGoalsListData>({
    path: '/v1/goals',
    method: 'GET',
    accessToken,
  });
}

export async function createGoalwealthGoal(
  payload: GoalwealthGoalCreateRequest,
  accessToken?: string | null
) {
  return requestGoalwealth<GoalwealthGoalCreateData>({
    path: '/v1/goals',
    method: 'POST',
    accessToken,
    body: payload,
  });
}
