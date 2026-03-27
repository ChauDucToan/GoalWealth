import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserProfile } from '@/context/user.types';

const PROFILE_OVERRIDES_STORAGE_KEY = 'goalwealth.profile.overrides.v1';

export type StoredProfileOverride = Partial<
  Pick<UserProfile, 'name' | 'phone' | 'city' | 'countryCode' | 'timezone' | 'locale' | 'avatarUrl'>
>;

function normalizeOverrideValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function sanitizeOverride(patch: StoredProfileOverride): StoredProfileOverride {
  const next: StoredProfileOverride = {};

  const name = normalizeOverrideValue(patch.name);
  if (name) {
    next.name = name;
  }

  const phone = normalizeOverrideValue(patch.phone);
  if (phone) {
    next.phone = phone;
  }

  const city = normalizeOverrideValue(patch.city);
  if (city) {
    next.city = city;
  }

  const countryCode = normalizeOverrideValue(patch.countryCode)?.toUpperCase();
  if (countryCode) {
    next.countryCode = countryCode;
  }

  const timezone = normalizeOverrideValue(patch.timezone);
  if (timezone) {
    next.timezone = timezone;
  }

  const locale = normalizeOverrideValue(patch.locale);
  if (locale) {
    next.locale = locale;
  }

  const avatarUrl = normalizeOverrideValue(patch.avatarUrl);
  if (avatarUrl) {
    next.avatarUrl = avatarUrl;
  }

  return next;
}

async function readOverrideMap() {
  const raw = await AsyncStorage.getItem(PROFILE_OVERRIDES_STORAGE_KEY);
  if (!raw) {
    return {} as Record<string, StoredProfileOverride>;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, StoredProfileOverride>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeOverrideMap(value: Record<string, StoredProfileOverride>) {
  await AsyncStorage.setItem(PROFILE_OVERRIDES_STORAGE_KEY, JSON.stringify(value));
}

export async function getStoredProfileOverride(userId?: string | null) {
  const normalizedUserId = userId?.trim();
  if (!normalizedUserId) {
    return null;
  }

  const entries = await readOverrideMap();
  return entries[normalizedUserId] ?? null;
}

export async function persistStoredProfileOverride(
  userId: string,
  patch: StoredProfileOverride
) {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) {
    return;
  }

  const entries = await readOverrideMap();
  const nextPatch = sanitizeOverride(patch);
  entries[normalizedUserId] = {
    ...(entries[normalizedUserId] ?? {}),
    ...nextPatch,
  };
  await writeOverrideMap(entries);
}

export function mergeProfileWithOverride(
  profile: UserProfile,
  override?: StoredProfileOverride | null
): UserProfile {
  if (!override) {
    return profile;
  }

  return {
    ...profile,
    ...override,
  };
}
