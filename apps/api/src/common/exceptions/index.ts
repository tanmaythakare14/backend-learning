export { NotFoundException } from './not-found.exception';
export { BadRequestException } from './bad-request.exception';
export { ConflictException } from './conflict.exception';
export { ForbiddenException } from './forbidden.exception';
export { UnauthorizedException } from './unauthorized.exception';
export { NotImplementedException } from './not-implemented.exception';
export { InternalServerErrorException } from './internal-server-error.exception';

export function isHttpException(
  error: unknown,
): error is Error & { statusCode: number } {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    typeof (error as { statusCode: unknown }).statusCode === 'number'
  );
}
