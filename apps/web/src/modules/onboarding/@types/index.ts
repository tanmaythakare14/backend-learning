export interface PasswordStrengthFieldProps {
  password: string;
}

export interface OnboardingLeftPanelProps {
  className?: string;
}

export interface RegisterAccountPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterAccountResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: RegisterAccountResponse;
}
