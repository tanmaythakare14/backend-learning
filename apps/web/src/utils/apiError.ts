export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Backend's generateResponse()/errorHandler shape — see apps/api/src/common/utils/response.util.ts. */
interface ApiErrorBody {
  message?: string;
}

export function handleHttpError(status: number, body?: ApiErrorBody): never {
  if (status === 401) {
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (status >= 500) {
    throw new ApiError('Something went wrong. Please try again later.', status);
  }
  // 4xx messages from this backend are already user-safe (see error-handler.middleware.ts).
  throw new ApiError(body?.message ?? 'Request failed', status);
}
