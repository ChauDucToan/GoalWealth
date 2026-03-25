import {
  initialUserState,
  userActions,
  userReducer,
} from '@/context/user.reducer';
import { UserAction, UserState } from '@/context/user.types';
import React, {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from 'react';

type MyUserContextValue = {
  state: UserState;
  dispatch: Dispatch<UserAction>;
  actions: typeof userActions;
};

export const MyUserContext = createContext<MyUserContextValue | null>(null);

export function MyUserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialUserState);

  return React.createElement(
    MyUserContext.Provider,
    {
      value: {
        state,
        dispatch,
        actions: userActions,
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
