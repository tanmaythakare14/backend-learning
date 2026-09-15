import Joi from 'joi';

const addressFields = {
  streetAddress: Joi.string().min(1).required(),
  city: Joi.string().min(1).required(),
  state: Joi.string().min(1).required(),
  zipCode: Joi.string().min(1).required(),
  country: Joi.string().min(1).required(),
};

/**
 * course is deliberately a free-text non-empty string, not a fixed enum —
 * courses are managed dynamically via the course-management module (frontend
 * mock catalog today), so a hardcoded whitelist here would reject any
 * legitimate course that didn't exist when this file was last edited.
 */
export const createStudentSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).required(),
  course: Joi.string().min(1).required(),
  ...addressFields,
});

/**
 * No firstName/lastName here on purpose — a student's name can't be changed
 * after enrollment. validate() strips unknown keys, so even if a client sends
 * them, they never reach the controller.
 */
export const updateStudentSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).required(),
  course: Joi.string().min(1).required(),
  ...addressFields,
});

/** `deleted` is deliberately not a valid value here — DELETE /students/:id handles that transition. */
export const updateStudentStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'deactivated').required(),
});
