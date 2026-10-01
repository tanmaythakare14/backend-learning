type AccessTokenGetter = () => Promise<string | undefined>;

let accessTokenGetter: AccessTokenGetter | null = null;

/** Called once from AuthTokenBridge with Auth0's getAccessTokenSilently. */
export function setAccessTokenGetter(getter: AccessTokenGetter): void {
  accessTokenGetter = getter;
}

/**
 * Used by every module's service/api.ts to attach the Auth0 access token —
 * these are plain functions, not hooks, so they can't call useAuth0() directly.
 * Returns null when there's no session (getAccessTokenSilently throws or
 * resolves with no token), so callers can still issue the request and let the
 * backend's 401 drive the existing handleHttpError() redirect-to-login flow.
 */
export async function getAccessToken(): Promise<string | null> {
  if (!accessTokenGetter) return null;
  try {
    return (await accessTokenGetter()) ?? null;
  } catch {
    return null;
  }
}
