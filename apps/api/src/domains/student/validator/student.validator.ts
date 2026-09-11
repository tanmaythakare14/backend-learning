import Joi from 'joi';
import { COMPUTER_ENGINEERING_COURSES } from '../constants/courses.constants';

const addressFields = {
  streetAddress: Joi.string().min(1).required(),
  city: Joi.string().min(1).required(),
  state: Joi.string().min(1).required(),
  zipCode: Joi.string().min(1).required(),
  country: Joi.string().min(1).required(),
};

export const createStudentSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).required(),
  course: Joi.string()
    .valid(...COMPUTER_ENGINEERING_COURSES)
    .required(),
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
  course: Joi.string()
    .valid(...COMPUTER_ENGINEERING_COURSES)
    .required(),
  ...addressFields,
});

/** `deleted` is deliberately not a valid value here — DELETE /students/:id handles that transition. */
export const updateStudentStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'deactivated').required(),
});
