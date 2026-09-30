import { useCallback, useMemo, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import {
  CurrentProfileContext,
  type CurrentProfile,
  type CurrentProfileContextValue,
  type CurrentProfileState,
} from './currentProfileContext';

/**
 * Holds the stored profile in one place so the top bar, the dashboard banner and
 * Settings agree with each other. Server data stays out of Redux (see state.md) —
 * this is plain module-level context, filled by the post-login sync and refreshed
 * by the Settings save.
 */
export function CurrentProfileProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, setState] = useState<CurrentProfileState>({ status: 'loading' });

  // Stable identities: consumers list these in effect dependencies, and a setter
  // that changed on every state update would re-fire those effects forever.
  const setProfile = useCallback(
    (profile: CurrentProfile) => setState({ status: 'ready', profile }),
    [],
  );
  const setFailed = useCallback(() => setState({ status: 'error' }), []);

  const value = useMemo<CurrentProfileContextValue>(
    () => ({ state, setProfile, setFailed }),
    [state, setProfile, setFailed],
  );

  return <CurrentProfileContext.Provider value={value}>{children}</CurrentProfileContext.Provider>;
}
