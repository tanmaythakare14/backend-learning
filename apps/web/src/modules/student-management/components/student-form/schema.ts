import { z } from 'zod';

export const studentFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  course: z.string().min(1, 'Select a course'),
});

export type StudentFormSchemaValues = z.infer<typeof studentFormSchema>;
