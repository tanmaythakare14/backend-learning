export const AuthErrorMessages = {
  BAD_REQUEST: 'Bad Request', UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden', INTERNAL_SERVER_ERROR: 'Internal Server Error',
  VALIDATION_FAILED: 'Validation failed', INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_TOKEN_REQUIRED: 'Authorization token is required',
  INVALID_AUTH_HEADER_FORMAT: 'Authorization header must be: Bearer <token>',
  INVALID_TOKEN: 'Invalid or expired token',
  INVALID_ACCESS_TOKEN: 'Session is invalid or has been revoked',
  AUTHENTICATION_REQUIRED: 'Authentication required',
  AUTHENTICATION_ERROR_OCCURRED: 'An authentication error occurred',
} as const;
export const getAccessDeniedMessage = (roles: string[]): string =>
  `Access denied. Required role(s): ${roles.join(', ')}`;
export const getAllRolesRequiredMessage = (roles: string[]): string =>
  `All of the following roles are required: ${roles.join(', ')}`;
