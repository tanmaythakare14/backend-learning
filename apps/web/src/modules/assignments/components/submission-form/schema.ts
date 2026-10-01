import { z } from 'zod';
import { ALLOWED_FILE_EXTENSIONS, MAX_ANSWER_LENGTH, MAX_FILE_BYTES } from '../../constants';

function extensionOf(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

export const submissionFormSchema = z
  .object({
    answerText: z.string().max(MAX_ANSWER_LENGTH, `Keep it under ${MAX_ANSWER_LENGTH} characters`),
    file: z.instanceof(File).nullable(),
  })
  .superRefine((values, ctx) => {
    if (!values.answerText.trim() && !values.file) {
      ctx.addIssue({
        code: 'custom',
        path: ['answerText'],
        message: 'Write an answer or attach a file',
      });
    }

    if (values.file && values.file.size > MAX_FILE_BYTES) {
      ctx.addIssue({
        code: 'custom',
        path: ['file'],
        message: `File is too large — the limit is ${MAX_FILE_BYTES / (1024 * 1024)} MB`,
      });
    }

    if (values.file && !ALLOWED_FILE_EXTENSIONS.includes(extensionOf(values.file.name))) {
      ctx.addIssue({
        code: 'custom',
        path: ['file'],
        message: `Unsupported file type — use ${ALLOWED_FILE_EXTENSIONS.join(', ')}`,
      });
    }
  });

export type SubmissionFormSchemaValues = z.infer<typeof submissionFormSchema>;
