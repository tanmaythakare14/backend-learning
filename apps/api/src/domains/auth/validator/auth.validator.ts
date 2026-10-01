import Joi from 'joi';

export const syncProfileSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().min(1).required(),
  // Auth0's default database-connection signup only collects email — given/family
  // name are absent, so the frontend falls back to splitting the email/display
  // name, which often leaves lastName empty. Empty is legitimate here.
  lastName: Joi.string().allow('').required(),
});
