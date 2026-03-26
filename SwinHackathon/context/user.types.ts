export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  language?: string;
  currency?: string;
};

export type UserPreferences = {
  pushNotification: boolean;
  soundNotification: boolean;
  emailNotification: boolean;
  biometricsEnabled: boolean;
};

export type UserState = {
  isAuthenticated: boolean;
  profile: UserProfile | null;
  preferences: UserPreferences;
  accessToken: string | null;
  authMode:
    | 'goalwealth-dev-bridge'
    | 'google-oidc'
    | 'adapter-bearer'
    | 'registered-password'
    | 'legacy-oauth'
    | null;
  loading: boolean;
  error: string | null;
};

export type UserActionPayloadMap = {
  'user/set-loading': {
    loading: boolean;
  };
  'user/sign-in-success': {
    profile: UserProfile;
    accessToken: string;
    authMode: UserState['authMode'];
  };
  'user/sign-out': undefined;
  'user/update-profile': {
    profile: Partial<UserProfile>;
  };
  'user/update-preferences': {
    preferences: Partial<UserPreferences>;
  };
  'user/set-error': {
    error: string | null;
  };
  'user/reset': undefined;
};

type ActionType = keyof UserActionPayloadMap;

export type UserAction = {
  [Type in ActionType]: UserActionPayloadMap[Type] extends undefined
    ? { type: Type }
    : { type: Type; payload: UserActionPayloadMap[Type] };
}[ActionType];
