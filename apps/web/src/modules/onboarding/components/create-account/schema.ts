import { z } from 'zod';

export const createAccountSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Use at least 8 characters')
    .regex(/[A-Z]/, 'Add an uppercase letter')
    .regex(/[0-9]/, 'Add a number')
    .regex(/[^A-Za-z0-9]/, 'Add a special character'),
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;
