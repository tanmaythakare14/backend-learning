import { createContext, useContext } from 'react';

/** The signed-in user's stored profile — the part of it the app shell needs. */
export interface CurrentProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profileComplete: boolean;
}

export type CurrentProfileState =
  { status: 'loading' } | { status: 'ready'; profile: CurrentProfile } | { status: 'error' };

export interface CurrentProfileContextValue {
  state: CurrentProfileState;
  setProfile: (profile: CurrentProfile) => void;
  setFailed: () => void;
}

export const CurrentProfileContext = createContext<CurrentProfileContextValue | null>(null);

export function useCurrentProfile(): CurrentProfileContextValue {
  const value = useContext(CurrentProfileContext);
  if (!value) {
    throw new Error('useCurrentProfile must be used inside <CurrentProfileProvider>');
  }
  return value;
}
