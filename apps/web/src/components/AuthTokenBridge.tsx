import { useEffect, useRef } from 'react';
import { useAuth0, type User } from '@auth0/auth0-react';
import { setAccessTokenGetter } from '@/utils/authToken';
import { syncProfile } from '@/modules/onboarding/service';
import { logger } from '@/utils/logger';

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
  const { isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    setAccessTokenGetter(() => getAccessTokenSilently());
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (!isAuthenticated || isLoading || hasSyncedRef.current || !user) return;
    hasSyncedRef.current = true;

    const { firstName, lastName } = splitDisplayName(user);
    syncProfile({ email: user.email ?? '', firstName, lastName }).catch((error: unknown) => {
      logger.error('Failed to sync profile after login', error);
    });
  }, [isAuthenticated, isLoading, user]);

  return null;
}
