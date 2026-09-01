import { Response } from 'express';
import { HttpStatusCode } from '../constants/http-status.constants';

interface GenerateResponseOptions<TData> {
  statusCode: HttpStatusCode;
  message?: string;
  data?: TData;
  additionalFields?: Record<string, unknown>;
}

type ApiResponse<TData> = {
  status: HttpStatusCode;
  message?: string;
  data?: TData;
} & Record<string, unknown>;

export function generateResponse<TData>(
  res: Response,
  options: GenerateResponseOptions<TData>,
): Response {
  const responseBody: ApiResponse<TData> = { status: options.statusCode };
  if (options.message !== undefined) responseBody.message = options.message;
  if (options.data !== undefined) responseBody.data = options.data;
  if (options.additionalFields) Object.assign(responseBody, options.additionalFields);
  return res.status(options.statusCode).json(responseBody);
}
