export class ConflictException extends Error {
  statusCode = 409;
  constructor(message = 'Conflict') {
    super(message);
    this.name = 'ConflictException';
    Object.setPrototypeOf(this, ConflictException.prototype);
  }
}
