import { z } from 'zod';

export const studentFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Enter a valid US phone number'),
  course: z.string().min(1, 'Select a course'),
  street: z.string().min(1, 'Street address is required'),
  country: z.string().min(1, 'Select a country'),
  state: z.string().min(1, 'Select a state'),
  city: z.string().min(1, 'Select a city'),
  zipCode: z.string().min(1, 'ZIP / postal code is required'),
});

export type StudentFormSchemaValues = z.infer<typeof studentFormSchema>;
