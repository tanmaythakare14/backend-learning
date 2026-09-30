import { config } from '@/config/environment';
import { authHeaders } from '@/utils/httpHeaders';
import { handleHttpError } from '@/utils/apiError';
import type { ChangePasswordPayload, ProfileApiDto, UpdateProfilePayload } from '../@types';

const PROFILE_URL = `${config.apiUrl}/api/v1/auth/me`;

export async function getProfile(): Promise<ProfileApiDto> {
  const res = await fetch(PROFILE_URL, { headers: await authHeaders() });
  const body: { data?: ProfileApiDto; message?: string } | undefined = await res
    .json()
    .catch(() => undefined);

  if (!res.ok) {
    handleHttpError(res.status, body);
  }

  return (body as { data: ProfileApiDto }).data;
}

/**
 * Names and phone are stored by us; the email is also pushed to Auth0, which
 * owns it. The API does both, so this stays a single call.
 */
export async function updateProfile(payload: UpdateProfilePayload): Promise<ProfileApiDto> {
  const res = await fetch(PROFILE_URL, {
    method: 'PUT',
    headers: await authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  const body: { data?: ProfileApiDto; message?: string } | undefined = await res
    .json()
    .catch(() => undefined);

  if (!res.ok) {
    handleHttpError(res.status, body);
  }

  return (body as { data: ProfileApiDto }).data;
}

/**
 * Auth0 owns the credential — the API verifies the current password with Auth0
 * and asks it to set the new one. Nothing is stored on our side.
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  const res = await fetch(`${config.apiUrl}/api/v1/auth/change-password`, {
    method: 'POST',
    headers: await authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body: { message?: string } | undefined = await res.json().catch(() => undefined);
    handleHttpError(res.status, body);
  }
}
