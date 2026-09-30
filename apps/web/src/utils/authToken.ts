type AccessTokenGetter = () => Promise<string | undefined>;
type SessionExpiredHandler = () => void;

let accessTokenGetter: AccessTokenGetter | null = null;
let sessionExpiredHandler: SessionExpiredHandler | null = null;

/**
 * Resolves the moment AuthTokenBridge registers the getter. A screen's data
 * effect can run before the bridge's effect has, so getAccessToken() waits on
 * this instead of reporting "no session" for a session that is merely not
 * wired up yet.
 */
let markReady: (() => void) | null = null;
const bridgeReady = new Promise<void>((resolve) => {
  markReady = resolve;
});

/** How long to wait for the bridge before giving up and letting the call 401 honestly. */
const BRIDGE_READY_TIMEOUT_MS = 5000;

/** Called once from AuthTokenBridge with Auth0's getAccessTokenSilently. */
export function setAccessTokenGetter(getter: AccessTokenGetter): void {
  accessTokenGetter = getter;
  markReady?.();
  markReady = null;
}

/**
 * Used by every module's service/api.ts to attach the Auth0 access token —
 * these are plain functions, not hooks, so they can't call useAuth0() directly.
 *
 * Returns null only when there genuinely is no session. Returning null while
 * the bridge was still mounting used to send the request with no Authorization
 * header at all, which the API answered with a 401 — and that 401 bounced the
 * user back to /login even though they were signed in.
 */
export async function getAccessToken(): Promise<string | null> {
  if (!accessTokenGetter) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    await Promise.race([
      bridgeReady,
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, BRIDGE_READY_TIMEOUT_MS);
      }),
    ]);
    if (timer !== undefined) clearTimeout(timer);
  }

  if (!accessTokenGetter) return null;

  try {
    return (await accessTokenGetter()) ?? null;
  } catch {
    return null;
  }
}

/**
 * Registered by AuthTokenBridge so a 401 can move the user to the sign-in
 * screen through the router. Plain modules can't navigate on their own, and
 * assigning window.location reloads the document — which restarts the whole
 * Auth0 bootstrap and loops if the next request 401s too.
 */
export function setSessionExpiredHandler(handler: SessionExpiredHandler): void {
  sessionExpiredHandler = handler;
}

/** Fired by handleHttpError() on a 401. No-op before the bridge has mounted. */
export function notifySessionExpired(): void {
  sessionExpiredHandler?.();
}
