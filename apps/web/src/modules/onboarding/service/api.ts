import { config } from '@/config/environment';
import { handleHttpError } from '@/utils/apiError';
import type {
  RegisterAccountPayload,
  RegisterAccountResponse,
  LoginPayload,
  LoginResponse,
} from '../@types';

export async function registerAccount(
  payload: RegisterAccountPayload,
): Promise<RegisterAccountResponse> {
  const res = await fetch(`${config.apiUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body: { data?: RegisterAccountResponse; message?: string } | undefined = await res
    .json()
    .catch(() => undefined);

  if (!res.ok) {
    handleHttpError(res.status, body);
  }

  return (body as { data: RegisterAccountResponse }).data;
}

export async function loginAccount(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${config.apiUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body: { data?: LoginResponse; message?: string } | undefined = await res
    .json()
    .catch(() => undefined);

  if (!res.ok) {
    handleHttpError(res.status, body);
  }

  return (body as { data: LoginResponse }).data;
}

/**
 * Always resolves on a 200 — the backend intentionally responds identically
 * whether or not the email is registered, to avoid leaking which addresses
 * have accounts. Only a genuine network/validation failure throws.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetch(`${config.apiUrl}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const body: { message?: string } | undefined = await res.json().catch(() => undefined);
    handleHttpError(res.status, body);
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const res = await fetch(`${config.apiUrl}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });

  if (!res.ok) {
    const body: { message?: string } | undefined = await res.json().catch(() => undefined);
    handleHttpError(res.status, body);
  }
}
