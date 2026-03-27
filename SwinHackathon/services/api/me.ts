import { requestGoalwealth } from '@/services/api/http';
import type { UserProfile } from '@/context/user.types';
import type { GoalwealthMeData, GoalwealthMePatchRequest } from '@/services/api/types';

export async function getGoalwealthMe(accessToken?: string | null) {
  return requestGoalwealth<GoalwealthMeData>({
    path: '/v1/me',
    method: 'GET',
    accessToken,
  });
}

export async function patchGoalwealthMe(
  payload: GoalwealthMePatchRequest,
  accessToken?: string | null
) {
  return requestGoalwealth<GoalwealthMeData>({
    path: '/v1/me',
    method: 'PATCH',
    accessToken,
    body: payload,
  });
}

export function mapGoalwealthMeToUserProfile(data: GoalwealthMeData): Partial<UserProfile> {
  const profile: Partial<UserProfile> = {
    id: data.user.user_id,
    name: data.user.display_name?.trim() || data.user.email?.trim() || 'GoalWealth User',
  };

  if (data.user.email?.trim()) {
    profile.email = data.user.email.trim();
  }

  if (data.user.phone?.trim()) {
    profile.phone = data.user.phone.trim();
  }

  if (data.user.avatar_url?.trim()) {
    profile.avatarUrl = data.user.avatar_url.trim();
  }

  if (data.user.locale?.trim()) {
    profile.language = data.user.locale.trim();
    profile.locale = data.user.locale.trim();
  }

  if (data.user.timezone?.trim()) {
    profile.timezone = data.user.timezone.trim();
  }

  if (data.user.location.city?.trim()) {
    profile.city = data.user.location.city.trim();
  }

  if (data.user.location.country?.trim()) {
    profile.countryCode = data.user.location.country.trim();
  }

  return profile;
}
