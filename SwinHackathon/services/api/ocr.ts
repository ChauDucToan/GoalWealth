import { requestGoalwealth } from '@/services/api/http';
import type {
  GoalwealthOcrIngressData,
  GoalwealthOcrIngressRequest,
  GoalwealthOcrRecordData,
} from '@/services/api/types';

export async function ingestGoalwealthOcr(
  payload: GoalwealthOcrIngressRequest,
  accessToken?: string | null
) {
  return requestGoalwealth<GoalwealthOcrIngressData>({
    path: '/v1/ocr/ingress',
    method: 'POST',
    accessToken,
    body: payload,
  });
}

export async function getGoalwealthOcrRecord(
  ocrRecordId: string,
  accessToken?: string | null
) {
  return requestGoalwealth<GoalwealthOcrRecordData>({
    path: `/v1/ocr/records/${encodeURIComponent(ocrRecordId)}`,
    method: 'GET',
    accessToken,
  });
}
