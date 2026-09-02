import Joi from 'joi';

/**
 * Mirrors the password rules enforced client-side in
 * apps/web/src/modules/onboarding/components/create-account/schema.ts —
 * keep the two in sync if either changes.
 */
export const registerSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/, 'uppercase letter')
    .pattern(/[0-9]/, 'number')
    .pattern(/[^A-Za-z0-9]/, 'special character')
    .required(),
});

/**
 * Deliberately loose (no complexity rules) — this only checks the request is
 * well-formed. Wired via validateLogin(), which always responds 401 on
 * failure rather than 400, so malformed input never reveals *why* it failed.
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
