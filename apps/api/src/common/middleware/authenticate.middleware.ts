import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpStatus } from '../constants/http-status.constants';
import { AuthErrorMessages } from '../constants/auth-error-messages.constants';

/**
 * Verifies the Bearer JWT in the Authorization header and attaches the decoded
 * payload to req.user. Must run before any route handler that needs the user.
 *
 * Usage in NestJS (via @UseGuards or directly in module routes):
 *   this.router.get('/protected', authenticate, asyncHandler(controller.getAll));
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: AuthErrorMessages.AUTH_TOKEN_REQUIRED,
        error: AuthErrorMessages.UNAUTHORIZED,
      });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: AuthErrorMessages.INVALID_AUTH_HEADER_FORMAT,
        error: AuthErrorMessages.UNAUTHORIZED,
      });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is not set');

    try {
      const payload = jwt.verify(parts[1], secret) as {
        userId: string;
        email: string;
        roles: string[];
      };
      req.user = { userId: payload.userId, email: payload.email, roles: payload.roles ?? [] };
      next();
    } catch {
      res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: AuthErrorMessages.INVALID_TOKEN,
        error: AuthErrorMessages.UNAUTHORIZED,
      });
    }
  } catch {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AuthErrorMessages.AUTHENTICATION_ERROR_OCCURRED,
      error: AuthErrorMessages.INTERNAL_SERVER_ERROR,
    });
  }
};
