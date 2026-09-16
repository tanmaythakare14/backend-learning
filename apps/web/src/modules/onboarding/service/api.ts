import { config } from '@/config/environment';
import { handleHttpError } from '@/utils/apiError';
import { getAccessToken } from '@/utils/authToken';
import type { SyncProfilePayload, SyncProfileResponse } from '../@types';

/** Just-in-time provisioning — upserts the local profile row for the authenticated Auth0 user. */
export async function syncProfile(payload: SyncProfilePayload): Promise<SyncProfileResponse> {
  const token = await getAccessToken();
  const res = await fetch(`${config.apiUrl}/api/v1/auth/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const body: { data?: SyncProfileResponse; message?: string } | undefined = await res
    .json()
    .catch(() => undefined);

  if (!res.ok) {
    handleHttpError(res.status, body);
  }

  return (body as { data: SyncProfileResponse }).data;
}
