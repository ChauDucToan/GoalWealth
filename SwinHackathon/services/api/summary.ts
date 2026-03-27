import { requestGoalwealth } from '@/services/api/http';
import type { GoalwealthSummaryData } from '@/services/api/types';

export async function getGoalwealthSummary(accessToken?: string | null) {
  return requestGoalwealth<GoalwealthSummaryData>({
    path: '/v1/summary',
    method: 'GET',
    accessToken,
  });
}
