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
