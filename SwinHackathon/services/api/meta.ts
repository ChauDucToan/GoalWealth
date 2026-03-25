import { requestGoalwealth } from '@/services/api/http';
import type {
  GoalwealthHealthData,
  GoalwealthReadyData,
  GoalwealthRootData,
} from '@/services/api/types';

export async function getGoalwealthRoot() {
  return requestGoalwealth<GoalwealthRootData>({
    path: '/',
    method: 'GET',
  });
}

export async function getGoalwealthHealth() {
  return requestGoalwealth<GoalwealthHealthData>({
    path: '/health',
    method: 'GET',
  });
}

export async function getGoalwealthReady() {
  return requestGoalwealth<GoalwealthReadyData>({
    path: '/ready',
    method: 'GET',
  });
}
