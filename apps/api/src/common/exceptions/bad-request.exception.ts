export class BadRequestException extends Error {
  statusCode = 400;
  constructor(message = 'Bad request') {
    super(message);
    this.name = 'BadRequestException';
    Object.setPrototypeOf(this, BadRequestException.prototype);
  }
}
