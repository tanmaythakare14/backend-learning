export interface OnboardingLeftPanelProps {
  className?: string;
}

/** Sent once after Auth0 login to keep the local profile row in sync. */
export interface SyncProfilePayload {
  email: string;
  firstName: string;
  lastName: string;
}

export interface SyncProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}
