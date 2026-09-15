/** Register DTO — fields required to create a new account */
export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** Output DTO — shape returned to the client. Never includes passwordHash. */
export interface UserOutDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}

/** Login DTO — credentials submitted to authenticate */
export interface LoginDto {
  email: string;
  password: string;
}

/** Login output — issued JWT plus the authenticated user's public profile */
export interface LoginOutDto {
  token: string;
  user: UserOutDto;
}

/** Forgot-password DTO — the account email to send a reset link to (if it exists) */
export interface ForgotPasswordDto {
  email: string;
}

/** Reset-password DTO — the raw token from the emailed link, plus the new password */
export interface ResetPasswordDto {
  token: string;
  password: string;
}
