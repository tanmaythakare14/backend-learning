export class ForbiddenException extends Error {
  statusCode = 403;
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenException';
    Object.setPrototypeOf(this, ForbiddenException.prototype);
  }
}
