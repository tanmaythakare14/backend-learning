import { useEffect, useRef } from 'react';
import { useAuth0, type User } from '@auth0/auth0-react';
import { setAccessTokenGetter, setSessionExpiredHandler } from '@/utils/authToken';
import { syncProfile } from '@/modules/onboarding/service';
import { logger } from '@/utils/logger';
import { useCurrentProfile } from '@/context/currentProfileContext';

/**
 * Auth0's default database-connection signup form only collects email —
 * given_name/family_name are usually absent, so this falls back to splitting
 * whatever display name Auth0 does provide.
 */
function splitDisplayName(user: User): { firstName: string; lastName: string } {
  if (user.given_name) {
    return { firstName: user.given_name, lastName: user.family_name ?? '' };
  }
  const source = user.name ?? user.email ?? 'User';
  const [firstName, ...rest] = source.split(' ');
  return { firstName, lastName: rest.join(' ') };
}

/**
 * Invisible bridge mounted once near the app root: gives service/api.ts's
 * plain fetch functions access to the Auth0 token (they can't call useAuth0()
 * directly), and just-in-time provisions the local profile row after login.
 */
export function AuthTokenBridge(): null {
  const { isAuthenticated, isLoading, user, getAccessTokenSilently, logout } = useAuth0();
  const { setProfile, setFailed } = useCurrentProfile();
  const hasSyncedRef = useRef(false);
  const sessionEndedRef = useRef(false);

  useEffect(() => {
    setAccessTokenGetter(() => getAccessTokenSilently());
  }, [getAccessTokenSilently]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      // Already on the sign-in screen, or already signing out because another request got
      // its 401 first — several can land at once.
      if (window.location.pathname === '/login' || sessionEndedRef.current) return;
      sessionEndedRef.current = true;

      // End the Auth0 session for real. Navigating to /login is not enough: the SDK still
      // believes the user is signed in, so /login forwards them straight to the dashboard —
      // every menu then appears to "go to the dashboard" and there is no way to sign in
      // again. Signing out lands them on the sign-in screen with a clean session.
      void logout({ logoutParams: { returnTo: window.location.origin } });
    });
  }, [logout]);

  useEffect(() => {
    if (!isAuthenticated || isLoading || hasSyncedRef.current || !user) return;
    hasSyncedRef.current = true;

    const { firstName, lastName } = splitDisplayName(user);
    syncProfile({ email: user.email ?? '', firstName, lastName })
      .then(setProfile)
      .catch((error: unknown) => {
        logger.error('Failed to sync profile after login', error);
        setFailed();
      });
  }, [isAuthenticated, isLoading, user, setProfile, setFailed]);

  return null;
}
