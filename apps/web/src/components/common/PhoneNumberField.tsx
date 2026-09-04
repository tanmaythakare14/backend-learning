import * as React from 'react';
import { Input } from '@/components/ui/input';

export interface PhoneNumberFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'type'
> {
  onChange: (value: string) => void;
}

/** Formats digits into US shape as the user types — "4155550134" -> "(415) 555-0134". Caps at 10 digits. */
function formatUsPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export const PhoneNumberField = React.forwardRef<HTMLInputElement, PhoneNumberFieldProps>(
  ({ onChange, ...props }, ref) => (
    <Input
      ref={ref}
      type="tel"
      inputMode="numeric"
      placeholder="(415) 555-0134"
      onChange={(e) => onChange(formatUsPhoneNumber(e.target.value))}
      {...props}
    />
  ),
);
PhoneNumberField.displayName = 'PhoneNumberField';
