import { SETTINGS_SECTIONS } from '../@types';
import type { LegalSection, SettingsNavGroup, SettingsNavItem } from '../@types';

export const SETTINGS_PATH = '/settings';

/** Width the spec pins the content column to. */
export const SETTINGS_CONTENT_WIDTH_CLASS = 'w-full max-w-[680px]';

export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
  {
    label: 'My account',
    items: [
      {
        id: SETTINGS_SECTIONS.PROFILE,
        label: 'User profile',
        description: 'Your name and contact details.',
      },
      {
        id: SETTINGS_SECTIONS.PASSWORD,
        label: 'Change password',
        description: 'Update the password you sign in with.',
      },
    ],
  },
  {
    label: 'Workspace',
    items: [
      {
        id: SETTINGS_SECTIONS.TERMS,
        label: 'Terms of service',
        description: 'The terms your organisation uses Cognify under.',
      },
      {
        id: SETTINGS_SECTIONS.PRIVACY,
        label: 'Privacy policy',
        description: 'What Cognify collects, and why.',
      },
    ],
  },
];

/** Flat lookup for resolving the active section's title and group. */
export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = SETTINGS_NAV_GROUPS.flatMap(
  (group) => group.items,
);

/**
 * Placeholder copy so the screen can be reviewed with realistic content.
 * Replace with the wording legal signs off on before this ships.
 */
export const TERMS_LAST_UPDATED = '1 September 2026';

export const TERMS_INTRO =
  'These terms cover your use of Cognify. Placeholder copy — to be replaced with legally reviewed wording before release.';

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: 'Using your account',
    body: 'Your account is personal to you. Keep your sign-in details private, and tell us straight away if you think someone else has access to them. You are responsible for activity carried out under your account.',
  },
  {
    heading: 'Acceptable use',
    body: 'Use Cognify only for managing the students and courses your organisation is responsible for. Do not attempt to access records belonging to other organisations, disrupt the service, or copy data out of it for unrelated purposes.',
  },
  {
    heading: 'Your organisation owns its data',
    body: 'Student and course records you enter remain your organisation’s. We process them to provide the service, and we do not sell them or use them to train anything.',
  },
  {
    heading: 'Availability',
    body: 'We aim to keep Cognify running continuously, but we may take it offline for maintenance. We will give notice of planned downtime where we reasonably can.',
  },
  {
    heading: 'Changes to these terms',
    body: 'If we change these terms in a way that materially affects you, we will let you know in the app before the change takes effect.',
  },
];

export const PRIVACY_LAST_UPDATED = '1 September 2026';

export const PRIVACY_INTRO =
  'This policy explains what Cognify collects and why. Placeholder copy — to be replaced with legally reviewed wording before release.';

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: 'What we collect',
    body: 'Your name and email address, taken from your sign-in provider. Any phone number you add here. Plus the student and course records your organisation enters into the product.',
  },
  {
    heading: 'How sign-in works',
    body: 'Authentication is handled by Auth0. Your password is stored and verified by them, never by us — Cognify only receives a signed token confirming who you are.',
  },
  {
    heading: 'Why we collect it',
    body: 'To show you the right records, to keep an audit trail of changes, and to keep the service secure. We do not use your data for advertising.',
  },
  {
    heading: 'Who can see it',
    body: 'Staff at your own organisation, and the small number of our engineers who maintain the service. We do not share records with other customers or third parties.',
  },
  {
    heading: 'Your choices',
    body: 'You can update your profile details on this page at any time. To request a copy of your data, or its deletion, contact your organisation’s administrator.',
  },
];
