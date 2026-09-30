import { notifySessionExpired } from './authToken';

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
    // Hand off to AuthTokenBridge, which navigates via the router. Assigning
    // window.location here reloads the document, restarting the Auth0 bootstrap
    // — and if the next request 401s as well, that reload repeats forever.
    notifySessionExpired();
    throw new ApiError('Your session has expired. Please sign in again.', status);
  }
  if (status >= 500) {
    throw new ApiError('Something went wrong. Please try again later.', status);
  }
  // 4xx messages from this backend are already user-safe (see error-handler.middleware.ts).
  throw new ApiError(body?.message ?? 'Request failed', status);
}
