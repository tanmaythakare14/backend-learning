import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants/http-status.constants';
import {
  AuthErrorMessages,
  getAccessDeniedMessage,
  getAllRolesRequiredMessage,
} from '../constants/auth-error-messages.constants';

/** User must have at least ONE of the specified roles. */
export const requireRole =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: AuthErrorMessages.AUTHENTICATION_REQUIRED,
        error: AuthErrorMessages.UNAUTHORIZED,
      });
      return;
    }
    const hasRole = roles.some((r) => (req.user?.roles ?? []).includes(r));
    if (!hasRole) {
      res.status(HttpStatus.FORBIDDEN).json({
        status: HttpStatus.FORBIDDEN,
        message: getAccessDeniedMessage(roles),
        error: AuthErrorMessages.FORBIDDEN,
      });
      return;
    }
    next();
  };

/** User must have ALL specified roles. */
export const requireAllRoles =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: AuthErrorMessages.AUTHENTICATION_REQUIRED,
        error: AuthErrorMessages.UNAUTHORIZED,
      });
      return;
    }
    const hasAll = roles.every((r) => (req.user?.roles ?? []).includes(r));
    if (!hasAll) {
      res.status(HttpStatus.FORBIDDEN).json({
        status: HttpStatus.FORBIDDEN,
        message: getAllRolesRequiredMessage(roles),
        error: AuthErrorMessages.FORBIDDEN,
      });
      return;
    }
    next();
  };
