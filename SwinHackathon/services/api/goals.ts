import { requestGoalwealth } from '@/services/api/http';
import type {
  GoalwealthGoalCreateData,
  GoalwealthGoalCreateRequest,
  GoalwealthGoalDetailData,
  GoalwealthGoalUpdateData,
  GoalwealthGoalUpdateRequest,
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

export async function getGoalwealthGoal(goalId: string, accessToken?: string | null) {
  return requestGoalwealth<GoalwealthGoalDetailData>({
    path: `/v1/goals/${goalId}`,
    method: 'GET',
    accessToken,
  });
}

export async function updateGoalwealthGoal(
  goalId: string,
  payload: GoalwealthGoalUpdateRequest,
  accessToken?: string | null
) {
  return requestGoalwealth<GoalwealthGoalUpdateData>({
    path: `/v1/goals/${goalId}`,
    method: 'PATCH',
    accessToken,
    body: payload,
  });
}
