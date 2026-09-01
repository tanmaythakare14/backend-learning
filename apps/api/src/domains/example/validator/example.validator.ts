import Joi from 'joi';

export const createExampleSchema = Joi.object({
  name: Joi.string().required(),
  col1: Joi.string().required(),
  col2: Joi.string().required(),
  col3: Joi.string().required(),
});

export const updateExampleSchema = Joi.object({
  name: Joi.string(),
  col1: Joi.string(),
  col2: Joi.string(),
  col3: Joi.string(),
  isActive: Joi.boolean(),
}).min(1); // at least one field required
