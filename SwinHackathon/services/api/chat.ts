import { requestGoalwealth } from '@/services/api/http';
import type { GoalwealthChatRequest, GoalwealthChatResponseData } from '@/services/api/types';

export async function respondToGoalwealthChat(
  payload: GoalwealthChatRequest,
  accessToken?: string | null
) {
  return requestGoalwealth<GoalwealthChatResponseData>({
    path: '/v1/chat/respond',
    method: 'POST',
    accessToken,
    body: {
      message: payload.message,
      session_id: payload.session_id,
      locale: payload.locale,
      timezone: payload.timezone,
      attachments: payload.attachments ?? [],
    },
  });
}
