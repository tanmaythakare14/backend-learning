/** Sync DTO — profile fields the frontend has from Auth0's `user` object, sent right after login. */
export interface SyncProfileDto {
  email: string;
  firstName: string;
  lastName: string;
}

/** Editable profile fields. Email also propagates to Auth0. */
export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/** Output DTO — shape returned to the client. */
export interface UserOutDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  /** False until the user has saved a real name and phone — drives the dashboard banner. */
  profileComplete: boolean;
  createdAt: Date;
}

/** Change-password DTO — verified against Auth0, never stored here. */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
