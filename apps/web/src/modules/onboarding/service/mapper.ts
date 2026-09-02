import type { RegisterAccountPayload } from '../@types';
import type { CreateAccountFormValues } from '../components/create-account/schema';

export function formValuesToRegisterPayload(
  values: CreateAccountFormValues,
): RegisterAccountPayload {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    password: values.password,
  };
}
