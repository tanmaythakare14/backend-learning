export class InternalServerErrorException extends Error {
  statusCode = 500;
  constructor(message = 'Internal server error') {
    super(message);
    this.name = 'InternalServerErrorException';
    Object.setPrototypeOf(this, InternalServerErrorException.prototype);
  }
}
