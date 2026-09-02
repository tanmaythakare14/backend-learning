export const PRODUCT_NAME = 'Cognify';

export const CREATE_ACCOUNT_PATH = '/register';
export const SIGN_IN_PATH = '/login';
export const DASHBOARD_PATH = '/dashboard';

export const PASSWORD_STRENGTH_RULES: Array<{
  label: string;
  test: (value: string) => boolean;
}> = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'One number', test: (value) => /[0-9]/.test(value) },
  { label: 'One special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export const PASSWORD_STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'] as const;
