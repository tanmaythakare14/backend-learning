import type { ReactNode } from 'react';

export const SETTINGS_SECTIONS = {
  PROFILE: 'profile',
  PASSWORD: 'password',
  TERMS: 'terms',
  PRIVACY: 'privacy',
} as const;

export type SettingsSection = (typeof SETTINGS_SECTIONS)[keyof typeof SETTINGS_SECTIONS];

export interface SettingsNavItem {
  id: SettingsSection;
  label: string;
  /** Shown under the page title in the content column, not in the nav. */
  description: string;
}

/** Nav items are grouped under a labelled heading. */
export interface SettingsNavGroup {
  label: string;
  items: SettingsNavItem[];
}

export interface SettingsNavProps {
  activeSection: SettingsSection;
  onSelect: (section: SettingsSection) => void;
}

export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Profile fields the user can edit. Mirrors profileFormSchema — see profile-form/schema.ts. */
export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ProfileFormProps {
  defaultValues: ProfileFormValues;
  onSaved: (saved: ProfileApiDto) => void;
}

/** Raw profile shape from GET/PUT /api/v1/auth/me. */
export interface ProfileApiDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profileComplete: boolean;
  createdAt: string;
}

/** Request body for PUT /api/v1/auth/me. */
export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/** Request body for POST /api/v1/auth/change-password. */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDocumentProps {
  title: string;
  intro: string;
  sections: LegalSection[];
}
