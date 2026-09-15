import Joi from 'joi';

export const startConversationSchema = Joi.object({
  studentId: Joi.string().guid({ version: 'uuidv4' }).required(),
});

const attachmentSchema = Joi.object({
  id: Joi.string().required(),
  kind: Joi.string().valid('pdf', 'doc', 'image', 'video', 'link').required(),
  name: Joi.string().required(),
  url: Joi.string().required(),
  sizeLabel: Joi.string().optional(),
});

/** At least one of text/attachments must be present — a fully empty message can't be sent. */
export const sendMessageSchema = Joi.object({
  text: Joi.string().allow('').optional(),
  attachments: Joi.array().items(attachmentSchema).optional(),
}).or('text', 'attachments');
