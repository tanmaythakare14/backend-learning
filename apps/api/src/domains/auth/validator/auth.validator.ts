import Joi from 'joi';

export const syncProfileSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().min(1).required(),
  // Auth0's default database-connection signup only collects email — given/family
  // name are absent, so the frontend falls back to splitting the email/display
  // name, which often leaves lastName empty. Empty is legitimate here.
  lastName: Joi.string().allow('').required(),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(255).required(),
  lastName: Joi.string().trim().min(1).max(255).required(),
  email: Joi.string().trim().email().max(255).required(),
  // Matches the US format PhoneNumberField produces on the client.
  phone: Joi.string()
    .trim()
    .pattern(/^\(\d{3}\) \d{3}-\d{4}$/)
    .required()
    .messages({ 'string.pattern.base': 'Enter a valid US phone number.' }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  // Must stay >= the Auth0 tenant policy, which has the final say. No
  // character-class rules: the tenant does not require them, and they would
  // reject passphrases Auth0 accepts.
  newPassword: Joi.string().min(8).max(72).invalid(Joi.ref('currentPassword')).required().messages({
    'any.invalid': 'Choose a password different from your current one.',
    'string.min': 'Use at least 8 characters.',
    'string.max': 'Use at most 72 characters.',
  }),
});
