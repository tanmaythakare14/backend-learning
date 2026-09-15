import { z } from 'zod';

export const courseFormSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  description: z.string().min(1, 'Description is required'),
  thumbnailUrl: z.string().min(1, 'Thumbnail URL is required').url('Enter a valid URL'),
});

export type CourseFormSchemaValues = z.infer<typeof courseFormSchema>;
