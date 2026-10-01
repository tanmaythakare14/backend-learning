import { Request, Response, NextFunction } from 'express';
import { isHttpException } from '../exceptions';
import { logger } from '../utils/logger';

const HTTP_STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  503: 'Service Unavailable',
};

/** Global error handler — must have exactly 4 parameters. */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // JSON parse errors
  if (err instanceof SyntaxError && 'body' in err) {
    res
      .status(400)
      .json({ status: 400, message: 'Invalid JSON in request body', error: 'Bad Request' });
    return;
  }

  // Typed HTTP exceptions (NotFoundException, BadRequestException, etc.)
  if (isHttpException(err)) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      error: HTTP_STATUS_TEXT[err.statusCode] ?? 'Error',
    });
    return;
  }

  // Unhandled — never leak internals
  res.status(500).json({
    status: 500,
    message: 'An unexpected error occurred',
    error: 'Internal Server Error',
  });
};

/** 404 handler — catches requests to undefined routes. */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: 404,
    message: `Route ${req.method} ${req.path} not found`,
    error: 'Not Found',
  });
};
