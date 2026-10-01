/** Sync DTO — profile fields the frontend has from Auth0's `user` object, sent right after login. */
export interface SyncProfileDto {
  email: string;
  firstName: string;
  lastName: string;
}

/** Output DTO — shape returned to the client. */
export interface UserOutDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}
