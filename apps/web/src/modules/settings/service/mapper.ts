import type { ProfileApiDto, ProfileFormValues, UpdateProfilePayload } from '../@types';

/**
 * First login provisions the row from Auth0's display name, which for database
 * users is the email. That isn't a name, and the email has its own field — so
 * show the input empty rather than repeat it.
 */
export function nameOrEmpty(value: string): string {
  return value.includes('@') ? '' : value;
}

/** DTO → form shape. Phone is nullable in the database but the form wants a string. */
export function profileDtoToFormValues(dto: ProfileApiDto): ProfileFormValues {
  return {
    firstName: nameOrEmpty(dto.firstName),
    lastName: dto.lastName,
    email: dto.email,
    phone: dto.phone ?? '',
  };
}

/** Form shape → request body. */
export function formValuesToUpdatePayload(values: ProfileFormValues): UpdateProfilePayload {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
  };
}
