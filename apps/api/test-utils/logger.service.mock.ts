import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
  info = jest.fn();
  warn = jest.fn();
  error = jest.fn();
  debug = jest.fn();
  http = jest.fn();
}
