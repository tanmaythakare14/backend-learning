import { z } from 'zod';
import {
  MAX_INSTRUCTIONS_LENGTH,
  MAX_OPTIONS,
  MAX_OPTION_LENGTH,
  MAX_PROMPT_LENGTH,
  MAX_TITLE_LENGTH,
} from '../../constants';
import { choiceProblem, quizShapeProblems } from '../../utils';

const optionSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Option text is required')
    .max(MAX_OPTION_LENGTH, `Keep it under ${MAX_OPTION_LENGTH} characters`),
  isCorrect: z.boolean(),
});

const questionSchema = z
  .object({
    type: z.enum(['single', 'multiple', 'short', 'descriptive']),
    prompt: z
      .string()
      .trim()
      .min(1, 'Write the question')
      .max(MAX_PROMPT_LENGTH, `Keep it under ${MAX_PROMPT_LENGTH} characters`),
    options: z.array(optionSchema).max(MAX_OPTIONS, `Use at most ${MAX_OPTIONS} options`),
  })
  .superRefine((question, ctx) => {
    // The same rule the options editor shows live and the service re-checks.
    const problem = choiceProblem(question.type, question.options);
    if (problem) ctx.addIssue({ code: 'custom', path: ['options'], message: problem });
  });

export const assignmentBuilderSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Give the assignment a title')
      .max(MAX_TITLE_LENGTH, `Keep it under ${MAX_TITLE_LENGTH} characters`),
    instructions: z
      .string()
      .trim()
      .min(1, 'Add instructions for your students')
      .max(MAX_INSTRUCTIONS_LENGTH, `Keep it under ${MAX_INSTRUCTIONS_LENGTH} characters`),
    courseId: z.string().min(1, 'Choose a course'),
    dueAt: z
      .string()
      .min(1, 'Choose a due date and time')
      .refine((value) => {
        const time = new Date(value).getTime();
        return !Number.isNaN(time) && time > Date.now();
      }, 'The due date must be in the future'),
    questions: z.array(questionSchema),
  })
  .superRefine((values, ctx) => {
    for (const message of quizShapeProblems(values.questions.map((question) => question.type))) {
      ctx.addIssue({ code: 'custom', path: ['questions'], message });
    }
  });

export type AssignmentBuilderSchemaValues = z.infer<typeof assignmentBuilderSchema>;
