// ─── HTTP / API ───────────────────────────────────────────────────────────────

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

export interface ApiResponse<TData = unknown> {
  status: HttpStatusCode;
  message?: string;
  data?: TData;
}

export interface PaginatedResponse<TData> extends ApiResponse<TData[]> {
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  status: HttpStatusCode;
  message: string;
  error?: string;
  timestamp?: string;
}

// ─── Domain: Health ───────────────────────────────────────────────────────────

export interface HealthStatus {
  status: 'active' | 'error';
  timestamp: number;
}

// ─── Domain: Example ─────────────────────────────────────────────────────────

export interface ExampleOutDto {
  id: string;
  name: string;
  col1: string;
  col2: string;
  col3: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface ExampleCreateDto {
  name: string;
  col1: string;
  col2: string;
  col3: string;
}

export interface ExampleUpdateDto {
  name?: string;
  col1?: string;
  col2?: string;
  col3?: string;
  isActive?: boolean;
}
