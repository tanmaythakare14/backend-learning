import { getAccessToken } from './authToken';

/** Attaches the Auth0 access token (if a session exists) alongside any extra headers. */
export async function authHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}
