import Joi from 'joi';

export const MAX_WRITTEN_ANSWER_LENGTH = 5000;
export const MAX_DESCRIPTIVE_LENGTH = 3000;

/**
 * These are applied inside AssignmentService, not through the validate()
 * middleware: POST /assignments/:id/submission may be multipart, and multer
 * only parses the body after middleware has already run, so a middleware would
 * see an empty body for every file upload.
 */
export const writtenSubmissionSchema = Joi.object({
  answerText: Joi.string()
    .trim()
    .max(MAX_WRITTEN_ANSWER_LENGTH)
    .allow('')
    .default('')
    .messages({
      'string.max': `Your answer must be at most ${MAX_WRITTEN_ANSWER_LENGTH} characters.`,
    }),
});

/**
 * `choices` and `texts` opt out of the service-wide stripUnknown: a quiz is one
 * attempt, so a malformed key must be rejected rather than silently dropped —
 * otherwise a client bug could submit an empty quiz and use up the only attempt.
 */
export const quizAnswersSchema = Joi.object({
  choices: Joi.object()
    .pattern(Joi.string().uuid(), Joi.array().items(Joi.string().uuid()).max(20))
    .prefs({ stripUnknown: false })
    .default({}),
  texts: Joi.object()
    .pattern(Joi.string().uuid(), Joi.string().allow('').max(MAX_DESCRIPTIVE_LENGTH))
    .prefs({ stripUnknown: false })
    .default({}),
});

// ── Create (admin) ────────────────────────────────────────────────────────

export const MAX_TITLE_LENGTH = 255;
export const MAX_INSTRUCTIONS_LENGTH = 5000;
export const MAX_PROMPT_LENGTH = 500;
export const MAX_OPTION_LENGTH = 200;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 5;

const optionSchema = Joi.object({
  label: Joi.string().trim().min(1).max(MAX_OPTION_LENGTH).required().label('Option text'),
  isCorrect: Joi.boolean().required().label('Option correct flag'),
});

/**
 * One question. A choice question needs 2+ options and a valid answer key (exactly one
 * correct for single choice, at least one for multiple); the paragraph types are written
 * answers, so any options sent with them are dropped.
 */
const questionSchema = Joi.object({
  type: Joi.string()
    .valid('single', 'multiple', 'short', 'descriptive')
    .required()
    .label('Question type'),
  prompt: Joi.string().trim().min(1).max(MAX_PROMPT_LENGTH).required().label('Question text'),
  options: Joi.array().items(optionSchema).max(MAX_OPTIONS).default([]).label('Options'),
}).custom((question: { type: string; options: Array<{ isCorrect: boolean }> }, helpers) => {
  const position = helpers.state.path?.[helpers.state.path.length - 1];
  const prefix = typeof position === 'number' ? `Question ${position + 1}: ` : '';

  if (question.type !== 'single' && question.type !== 'multiple') {
    return { ...question, options: [] };
  }

  if (question.options.length < MIN_OPTIONS) {
    return helpers.message({ custom: `${prefix}add at least ${MIN_OPTIONS} options.` });
  }
  const correct = question.options.filter((option) => option.isCorrect).length;
  if (correct === 0) {
    return helpers.message({
      custom: `${prefix}${question.type === 'single' ? 'mark the correct answer.' : 'mark at least one correct answer.'}`,
    });
  }
  if (question.type === 'single' && correct > 1) {
    return helpers.message({ custom: `${prefix}only one answer can be correct.` });
  }
  return question;
});

/**
 * Applied inside AssignmentService (like the submit schemas). The only rule on how many
 * questions: a quiz needs at least one. No maximum, and no required question type or order.
 */
export const createAssignmentSchema = Joi.object({
  kind: Joi.string().valid('written', 'quiz').default('quiz').label('Kind'),
  title: Joi.string().trim().min(1).max(MAX_TITLE_LENGTH).required().label('Title'),
  courseId: Joi.string().uuid().required().label('Course'),
  instructions: Joi.string()
    .trim()
    .min(1)
    .max(MAX_INSTRUCTIONS_LENGTH)
    .required()
    .label('Instructions'),
  dueAt: Joi.date()
    .iso()
    .required()
    .label('Due date')
    .custom((value: Date, helpers) =>
      value.getTime() > Date.now()
        ? value
        : helpers.message({ custom: 'The due date must be in the future.' }),
    ),
  // A switch rather than if/else: an unknown `kind` is reported on `kind` itself, instead of
  // also tripping a misleading "written assignments have no questions" error.
  questions: Joi.when('kind', {
    switch: [
      {
        is: 'quiz',
        then: Joi.array().items(questionSchema).min(1).required().messages({
          'array.min': 'Add at least one question.',
          'any.required': 'Add at least one question.',
        }),
      },
      {
        is: 'written',
        then: Joi.array()
          .length(0)
          .default([])
          .messages({ 'array.length': 'A written assignment has no questions.' }),
      },
    ],
    otherwise: Joi.any(),
  }),
}).prefs({ errors: { wrap: { label: false } } });
