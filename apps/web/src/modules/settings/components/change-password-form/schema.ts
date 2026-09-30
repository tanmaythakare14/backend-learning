import { z } from 'zod';

/**
 * Must stay >= the Auth0 tenant password policy, which is the final authority.
 * If Auth0 requires more than this, a password can pass here and still be
 * rejected on submit with a "too weak" error.
 *
 * Tenant policy at the time of writing: minimum 15, maximum 72.
 * Lower the Auth0 connection's minimum length to 8 to match this.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
      .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters`),
    confirmPassword: z.string().min(1, 'Re-enter your new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: 'Choose a password different from your current one',
    path: ['newPassword'],
  });

export type ChangePasswordFormSchemaValues = z.infer<typeof changePasswordFormSchema>;
