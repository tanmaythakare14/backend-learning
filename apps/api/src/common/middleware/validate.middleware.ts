import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { HttpStatus } from '../constants/http-status.constants';
import { AuthErrorMessages } from '../constants/auth-error-messages.constants';

/** Validates request body against Joi schema. Returns 400 with errors if invalid. */
export const validate =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: AuthErrorMessages.VALIDATION_FAILED,
        errors: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })),
        error: AuthErrorMessages.BAD_REQUEST,
      });
      return;
    }
    req.body = value;
    next();
  };

/** Login validation: always returns 401 to avoid leaking email/password policy. */
export const validateLogin =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: AuthErrorMessages.INVALID_CREDENTIALS,
        error: AuthErrorMessages.UNAUTHORIZED,
      });
      return;
    }
    req.body = value;
    next();
  };
