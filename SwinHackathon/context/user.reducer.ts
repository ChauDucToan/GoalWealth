import {
  UserAction,
  UserPreferences,
  UserProfile,
  UserState,
} from '@/context/user.types';

export const initialUserState: UserState = {
  isAuthenticated: false,
  profile: null,
  preferences: {
    pushNotification: true,
    soundNotification: true,
    emailNotification: false,
    biometricsEnabled: false,
  },
  accessToken: null,
  authMode: null,
  loading: false,
  error: null,
};

export function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'user/set-loading':
      return {
        ...state,
        loading: action.payload.loading,
      };

    case 'user/sign-in-success':
      return {
        ...state,
        isAuthenticated: true,
        profile: action.payload.profile,
        accessToken: action.payload.accessToken,
        authMode: action.payload.authMode,
        loading: false,
        error: null,
      };

    case 'user/sign-out':
      return {
        ...initialUserState,
      };

    case 'user/update-profile':
      if (!state.profile) {
        return state;
      }

      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload.profile,
        },
      };

    case 'user/update-preferences':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload.preferences,
        },
      };

    case 'user/set-error':
      return {
        ...state,
        error: action.payload.error,
        loading: false,
      };

    case 'user/reset':
      return {
        ...initialUserState,
      };

    default:
      return state;
  }
}

export const userActions = {
  setLoading: (loading: boolean): UserAction => ({
    type: 'user/set-loading',
    payload: { loading },
  }),
  signInSuccess: (
    profile: UserProfile,
    accessToken: string,
    authMode: UserState['authMode']
  ): UserAction => ({
    type: 'user/sign-in-success',
    payload: {
      profile,
      accessToken,
      authMode,
    },
  }),
  signOut: (): UserAction => ({
    type: 'user/sign-out',
  }),
  updateProfile: (profile: Partial<UserProfile>): UserAction => ({
    type: 'user/update-profile',
    payload: { profile },
  }),
  updatePreferences: (preferences: Partial<UserPreferences>): UserAction => ({
    type: 'user/update-preferences',
    payload: { preferences },
  }),
  setError: (error: string | null): UserAction => ({
    type: 'user/set-error',
    payload: { error },
  }),
  reset: (): UserAction => ({
    type: 'user/reset',
  }),
};
