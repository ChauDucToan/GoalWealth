import {
  initialUserState,
  userActions,
  userReducer,
} from '@/context/user.reducer';
import { UserAction, UserState } from '@/context/user.types';
import {
  clearStoredAuthSession,
  loadStoredAuthSession,
  persistAuthSession,
} from '@/services/auth/session';
import { isGoalwealthLiveAdapterEnabled } from '@/services/api/config';
import { getGoalwealthMe, mapGoalwealthMeToUserProfile } from '@/services/api/me';
import React, {
  createContext,
  Dispatch,
  ReactNode,
  useEffect,
  useContext,
  useReducer,
  useState,
} from 'react';

type MyUserContextValue = {
  state: UserState;
  dispatch: Dispatch<UserAction>;
  actions: typeof userActions;
  isSessionReady: boolean;
  signOut: () => Promise<void>;
};

export const MyUserContext = createContext<MyUserContextValue | null>(null);

export function MyUserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialUserState);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const liveAdapterEnabled = isGoalwealthLiveAdapterEnabled();

  useEffect(() => {
    let cancelled = false;

    void loadStoredAuthSession()
      .then((session) => {
        if (cancelled) {
          return;
        }

        if (session) {
          dispatch(
            userActions.signInSuccess(session.profile, session.accessToken, session.authMode)
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsSessionReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isSessionReady) {
      return;
    }

    if (state.isAuthenticated && state.profile && state.accessToken && state.authMode) {
      void persistAuthSession({
        accessToken: state.accessToken,
        profile: state.profile,
        authMode: state.authMode,
      });
      return;
    }

    void clearStoredAuthSession();
  }, [
    isSessionReady,
    state.accessToken,
    state.authMode,
    state.isAuthenticated,
    state.profile,
  ]);

  useEffect(() => {
    if (
      !isSessionReady ||
      !liveAdapterEnabled ||
      !state.isAuthenticated ||
      !state.accessToken?.trim() ||
      state.authMode === 'registered-password'
    ) {
      return;
    }

    let cancelled = false;

    void getGoalwealthMe(state.accessToken)
      .then((response) => {
        if (cancelled) {
          return;
        }

        dispatch(userActions.updateProfile(mapGoalwealthMeToUserProfile(response.data)));
      })
      .catch(() => {
        // The app can continue with the locally restored session if /v1/me is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [
    dispatch,
    isSessionReady,
    liveAdapterEnabled,
    state.accessToken,
    state.authMode,
    state.isAuthenticated,
  ]);

  const signOut = async () => {
    await clearStoredAuthSession();
    dispatch(userActions.signOut());
  };

  return React.createElement(
    MyUserContext.Provider,
    {
      value: {
        state,
        dispatch,
        actions: userActions,
        isSessionReady,
        signOut,
      },
    },
    children,
  );
}

export function useMyUser() {
  const context = useContext(MyUserContext);

  if (!context) {
    throw new Error('useMyUser must be used inside MyUserProvider');
  }

  return context;
}
