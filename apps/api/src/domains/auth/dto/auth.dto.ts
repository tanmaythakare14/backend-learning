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
