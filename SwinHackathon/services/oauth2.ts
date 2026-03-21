import { UserProfile } from '@/context/user.types';

type OAuth2TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
};

type OAuth2UserInfoResponse = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  phone_number?: string;
  locale?: string;
  zoneinfo?: string;
};

type OAuth2PasswordSignInResult = {
  accessToken: string;
  refreshToken?: string;
  profile: UserProfile;
};

type OAuth2PasswordSignInInput = {
  username: string;
  password: string;
};

const oauth2Config = {
  tokenEndpoint: process.env.EXPO_PUBLIC_OAUTH_TOKEN_ENDPOINT?.trim() ?? '',
  userInfoEndpoint: process.env.EXPO_PUBLIC_OAUTH_USERINFO_ENDPOINT?.trim() ?? '',
  clientId: process.env.EXPO_PUBLIC_OAUTH_CLIENT_ID?.trim() ?? '',
  clientSecret: process.env.EXPO_PUBLIC_OAUTH_CLIENT_SECRET?.trim() ?? '',
  scope: process.env.EXPO_PUBLIC_OAUTH_SCOPE?.trim() ?? 'openid profile email',
};

export function getMissingOAuth2EnvVars() {
  const missingVars: string[] = [];

  if (!oauth2Config.tokenEndpoint) {
    missingVars.push('EXPO_PUBLIC_OAUTH_TOKEN_ENDPOINT');
  }

  if (!oauth2Config.clientId) {
    missingVars.push('EXPO_PUBLIC_OAUTH_CLIENT_ID');
  }

  return missingVars;
}

function encodeFormBody(params: Record<string, string>) {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

async function parseOAuthError(response: Response) {
  const fallbackMessage = 'OAuth2 sign-in failed. Check credentials and server configuration.';
  const contentType = response.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as {
        error?: string;
        error_description?: string;
        message?: string;
      };

      return payload.error_description ?? payload.message ?? payload.error ?? fallbackMessage;
    }

    const text = await response.text();
    return text.trim() || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function fetchUserProfile(accessToken: string, fallbackUsername: string) {
  if (!oauth2Config.userInfoEndpoint) {
    return {
      id: fallbackUsername,
      name: fallbackUsername,
      email: fallbackUsername,
    } satisfies UserProfile;
  }

  const response = await fetch(oauth2Config.userInfoEndpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Signed in, but failed to fetch user profile.');
  }

  const payload = (await response.json()) as OAuth2UserInfoResponse;

  return {
    id: payload.sub ?? payload.email ?? fallbackUsername,
    name: payload.name ?? payload.email ?? fallbackUsername,
    email: payload.email ?? fallbackUsername,
    avatarUrl: payload.picture,
    phone: payload.phone_number,
    language: payload.locale,
    currency: payload.zoneinfo,
  } satisfies UserProfile;
}

export async function signInWithOAuth2Password({
  username,
  password,
}: OAuth2PasswordSignInInput): Promise<OAuth2PasswordSignInResult> {
  const missingVars = getMissingOAuth2EnvVars();

  if (missingVars.length > 0) {
    throw new Error(
      `Missing OAuth2 configuration: ${missingVars.join(', ')}.`,
    );
  }

  const body = encodeFormBody({
    grant_type: 'password',
    username,
    password,
    client_id: oauth2Config.clientId,
    scope: oauth2Config.scope,
    ...(oauth2Config.clientSecret
      ? { client_secret: oauth2Config.clientSecret }
      : {}),
  });

  const tokenResponse = await fetch(oauth2Config.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  });

  if (!tokenResponse.ok) {
    throw new Error(await parseOAuthError(tokenResponse));
  }

  const tokenPayload = (await tokenResponse.json()) as OAuth2TokenResponse;

  if (!tokenPayload.access_token) {
    throw new Error('OAuth2 response does not include an access token.');
  }

  const profile = await fetchUserProfile(tokenPayload.access_token, username);

  return {
    accessToken: tokenPayload.access_token,
    refreshToken: tokenPayload.refresh_token,
    profile,
  };
}
