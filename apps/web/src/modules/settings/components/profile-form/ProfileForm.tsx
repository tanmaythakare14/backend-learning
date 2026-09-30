import type { JSX } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth0 } from '@auth0/auth0-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/utils/apiError';
import { logger } from '@/utils/logger';
import { formValuesToUpdatePayload, profileDtoToFormValues, updateProfile } from '../../service';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PhoneNumberField } from '@/components/common/PhoneNumberField';
import { profileFormSchema, type ProfileFormSchemaValues } from './schema';
import type { ProfileFormProps } from '../../@types';

export function ProfileForm({ defaultValues, onSaved }: ProfileFormProps): JSX.Element {
  const { getAccessTokenSilently } = useAuth0();

  const form = useForm<ProfileFormSchemaValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  const handleSubmit = async (values: ProfileFormSchemaValues): Promise<void> => {
    // The email input is disabled, so this is false in normal use. The branch is
    // kept because the API still supports the change (and still writes it to
    // Auth0) — re-enabling the input is all it takes to turn the flow back on.
    const emailChanged = values.email.trim().toLowerCase() !== defaultValues.email.toLowerCase();

    try {
      const saved = await updateProfile(formValuesToUpdatePayload(values));
      const next = profileDtoToFormValues(saved);

      // Reset to what the server stored, so the form is clean again and any
      // normalisation it applied (trimming, lower-casing the email) is visible.
      form.reset(next);
      onSaved(saved);

      if (emailChanged) {
        // The header and everything else read the email off useAuth0()'s user,
        // which comes from the ID token minted at login. Auth0 now holds the new
        // address, so force a fresh token — otherwise the old one shows until
        // the user signs out and back in.
        try {
          await getAccessTokenSilently({ cacheMode: 'off' });
        } catch (error) {
          logger.error('Could not refresh the Auth0 session after an email change', error);
          toast.info('Profile saved. Sign out and back in to refresh your displayed email.');
          return;
        }
      }

      toast.success(
        emailChanged ? 'Profile saved. Your sign-in email was updated too.' : 'Profile saved.',
      );
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  First name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ada" autoComplete="given-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Last name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Lovelace" autoComplete="family-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="ada@example.com"
                  disabled
                  readOnly
                  data-pii
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                This is the address you sign in with. Contact an administrator to change it.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Phone number <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <PhoneNumberField autoComplete="tel" data-pii {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
          <Button
            type="button"
            variant="ghost"
            disabled={!form.formState.isDirty || form.formState.isSubmitting}
            onClick={() => form.reset(defaultValues)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
