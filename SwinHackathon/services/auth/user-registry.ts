import type { UserProfile, UserState } from '@/context/user.types';

export type StoredUserLocation = {
  city?: string;
  country?: string;
  timezone?: string;
};

export type StoredUserBasicProfile = {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: StoredUserLocation;
  created_at?: string;
  updated_at?: string;
};

export type StoredLinkedUserAccount = {
  user_id: string;
  auth_mode: UserState['authMode'] | 'sign-up-draft' | null;
  profile: StoredUserBasicProfile;
  password_secret?: string;
  linked_account_ids: string[];
  created_at: string;
  updated_at: string;
};

export type RegisterUserAccountInput = {
  full_name?: string;
  email: string;
  phone?: string;
  location?: StoredUserLocation;
  auth_mode?: StoredLinkedUserAccount['auth_mode'];
  password?: string;
  linked_account_ids?: string[];
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeUserId(email: string) {
  const normalized = normalizeEmail(email)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'goalwealth-user';
}

function buildDisplayName(email: string) {
  const localPart = normalizeEmail(email).split('@')[0] || 'Goalwealth User';
  return localPart
    .replace(/[._-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase()) || 'Goalwealth User';
}

export function buildLinkedUserDisplayName(email: string) {
  return buildDisplayName(email);
}

export function buildAvatarInitialFromName(name: string) {
  const normalized = name.trim();
  return normalized.charAt(0).toUpperCase() || 'G';
}

function dedupeLinkedAccountIds(ids: string[], selfId: string) {
  return Array.from(
    new Set(
      ids
        .map((value) => value.trim())
        .filter((value) => value && value !== selfId),
    ),
  );
}

const now = new Date().toISOString();

export const linkedUserAccountsRegistry: StoredLinkedUserAccount[] = [
  {
    user_id: 'toan-chau-goalwealth',
    auth_mode: 'goalwealth-dev-bridge',
    profile: {
      full_name: 'Chau Duc Toan',
      email: 'toan.chau@goalwealth.local',
      phone: '+84 900 100 001',
      location: {
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        timezone: 'Asia/Ho_Chi_Minh',
      },
      created_at: now,
      updated_at: now,
    },
    password_secret: 'Toan@123456',
    linked_account_ids: ['kha-nguyen-goalwealth'],
    created_at: now,
    updated_at: now,
  },
  {
    user_id: 'kha-nguyen-goalwealth',
    auth_mode: 'goalwealth-dev-bridge',
    profile: {
      full_name: 'Kha Nguyen',
      email: 'kha.nguyen@goalwealth.local',
      phone: '+84 900 100 002',
      location: {
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        timezone: 'Asia/Ho_Chi_Minh',
      },
      created_at: now,
      updated_at: now,
    },
    password_secret: 'Kha@123456',
    linked_account_ids: ['toan-chau-goalwealth'],
    created_at: now,
    updated_at: now,
  },
];

export function listLinkedUserAccounts() {
  return [...linkedUserAccountsRegistry];
}

export function findLinkedUserAccountByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  return linkedUserAccountsRegistry.find(
    (account) => normalizeEmail(account.profile.email ?? '') === normalizedEmail,
  ) ?? null;
}

export function buildUserProfileFromLinkedAccount(
  account: StoredLinkedUserAccount,
): UserProfile {
  const email = normalizeEmail(account.profile.email ?? `${account.user_id}@goalwealth.local`);
  const name = account.profile.full_name?.trim() || buildDisplayName(email);

  return {
    id: account.user_id,
    name,
    email,
    phone: account.profile.phone,
    language: account.profile.location?.timezone ? 'en-US' : undefined,
  };
}

export function verifyLinkedUserCredentials(email: string, password: string) {
  const account = findLinkedUserAccountByEmail(email);

  if (!account) {
    return null;
  }

  if (!account.password_secret || account.password_secret !== password.trim()) {
    return null;
  }

  return account;
}

export function registerLinkedUserAccount(
  input: RegisterUserAccountInput,
): StoredLinkedUserAccount {
  const normalizedEmail = normalizeEmail(input.email);

  if (!normalizedEmail) {
    throw new Error('email is required');
  }

  const existing = findLinkedUserAccountByEmail(normalizedEmail);
  const timestamp = new Date().toISOString();

  if (existing) {
    existing.auth_mode = input.auth_mode ?? existing.auth_mode;
    existing.profile = {
      ...existing.profile,
      full_name: input.full_name?.trim() || existing.profile.full_name,
      email: normalizedEmail,
      phone: input.phone?.trim() || existing.profile.phone,
      location: input.location ?? existing.profile.location,
      created_at: existing.profile.created_at ?? existing.created_at,
      updated_at: timestamp,
    };
    existing.linked_account_ids = dedupeLinkedAccountIds(
      input.linked_account_ids ?? existing.linked_account_ids,
      existing.user_id,
    );
    existing.password_secret = input.password?.trim() || existing.password_secret;
    existing.updated_at = timestamp;

    return existing;
  }

  const userId = normalizeUserId(normalizedEmail);
  const createdRecord: StoredLinkedUserAccount = {
    user_id: userId,
    auth_mode: input.auth_mode ?? 'sign-up-draft',
    profile: {
      full_name: input.full_name?.trim() || buildDisplayName(normalizedEmail),
      email: normalizedEmail,
      phone: input.phone?.trim() || undefined,
      location: input.location,
      created_at: timestamp,
      updated_at: timestamp,
    },
    password_secret: input.password?.trim() || undefined,
    linked_account_ids: dedupeLinkedAccountIds(input.linked_account_ids ?? [], userId),
    created_at: timestamp,
    updated_at: timestamp,
  };

  linkedUserAccountsRegistry.push(createdRecord);
  return createdRecord;
}
