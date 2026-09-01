export class NotImplementedException extends Error {
  statusCode = 501;
  constructor(message = 'Not implemented') {
    super(message);
    this.name = 'NotImplementedException';
    Object.setPrototypeOf(this, NotImplementedException.prototype);
  }
}
