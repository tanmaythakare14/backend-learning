import Joi from 'joi';

export const createCourseSchema = Joi.object({
  name: Joi.string().min(1).required(),
  description: Joi.string().min(1).required(),
  thumbnailUrl: Joi.string().uri().required(),
});

export const updateCourseSchema = Joi.object({
  name: Joi.string().min(1).required(),
  description: Joi.string().min(1).required(),
  thumbnailUrl: Joi.string().uri().required(),
});

export const updateCourseStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'deactivated').required(),
});
