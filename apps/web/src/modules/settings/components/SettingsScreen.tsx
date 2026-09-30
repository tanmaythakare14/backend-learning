import { useCallback, useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { SETTINGS_SECTIONS } from '../@types';
import type {
  ProfileApiDto,
  ProfileFormValues,
  SettingsSection as SettingsSectionId,
} from '../@types';
import { useCurrentProfile } from '@/context/currentProfileContext';
import {
  PRIVACY_INTRO,
  PRIVACY_LAST_UPDATED,
  PRIVACY_SECTIONS,
  SETTINGS_CONTENT_WIDTH_CLASS,
  SETTINGS_NAV_GROUPS,
  TERMS_INTRO,
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
} from '../constants';
import { getProfile, nameOrEmpty, profileDtoToFormValues } from '../service';
import { logger } from '@/utils/logger';
import { SettingsNav } from './settings-nav';
import { SettingsSection } from './settings-section';
import { ProfileForm } from './profile-form';
import { ChangePasswordForm } from './change-password-form';
import { LegalDocument } from './legal';

/** Auth0's profile carries a display name rather than split parts — see AuthTokenBridge. */
function splitDisplayName(name: string | undefined): { firstName: string; lastName: string } {
  const [firstName = '', ...rest] = (name ?? '').trim().split(' ');
  return { firstName, lastName: rest.join(' ') };
}

export function SettingsScreen(): JSX.Element {
  const { user } = useAuth0();
  const { setProfile: setCurrentProfile } = useCurrentProfile();
  const [activeSection, setActiveSection] = useState<SettingsSectionId>(SETTINGS_SECTIONS.PROFILE);

  // Seed from the Auth0 session so the form is never blank, then replace with
  // what we actually store — Auth0 has no phone number.
  const [profile, setProfile] = useState<ProfileFormValues | null>(null);

  const sessionDefaults = (): ProfileFormValues => {
    const { firstName, lastName } = splitDisplayName(user?.given_name ? undefined : user?.name);
    return {
      firstName: nameOrEmpty(user?.given_name ?? firstName),
      lastName: nameOrEmpty(user?.family_name ?? lastName),
      email: user?.email ?? '',
      phone: '',
    };
  };

  useEffect(() => {
    let cancelled = false;

    getProfile()
      .then((dto) => {
        if (!cancelled) setProfile(profileDtoToFormValues(dto));
      })
      .catch((error: unknown) => {
        // Fall back to the session values — the form still works, phone is just blank.
        logger.error('Could not load profile', error);
        if (!cancelled) setProfile(sessionDefaults());
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleProfileSaved = useCallback(
    (saved: ProfileApiDto) => {
      setProfile(profileDtoToFormValues(saved));
      // Top bar and dashboard banner read the shared profile — refresh it so they
      // update immediately instead of waiting for the next login.
      setCurrentProfile(saved);
    },
    [setCurrentProfile],
  );

  const activeItem = SETTINGS_NAV_GROUPS.flatMap((group) => group.items).find(
    (item) => item.id === activeSection,
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>

      <div className="flex items-start gap-12">
        <SettingsNav activeSection={activeSection} onSelect={setActiveSection} />

        <div className={SETTINGS_CONTENT_WIDTH_CLASS}>
          {activeSection === SETTINGS_SECTIONS.PROFILE && (
            <SettingsSection title="Personal details" description={activeItem?.description}>
              {profile ? (
                <ProfileForm defaultValues={profile} onSaved={handleProfileSaved} />
              ) : (
                <p className="text-sm text-muted-foreground">Loading your details…</p>
              )}
            </SettingsSection>
          )}

          {activeSection === SETTINGS_SECTIONS.PASSWORD && (
            <SettingsSection title="Password" description={activeItem?.description}>
              <ChangePasswordForm />
            </SettingsSection>
          )}

          {activeSection === SETTINGS_SECTIONS.TERMS && (
            <SettingsSection
              title="Terms of service"
              description={`Last updated ${TERMS_LAST_UPDATED}`}
            >
              <LegalDocument
                title="Terms of service"
                intro={TERMS_INTRO}
                sections={TERMS_SECTIONS}
              />
            </SettingsSection>
          )}

          {activeSection === SETTINGS_SECTIONS.PRIVACY && (
            <SettingsSection
              title="Privacy policy"
              description={`Last updated ${PRIVACY_LAST_UPDATED}`}
            >
              <LegalDocument
                title="Privacy policy"
                intro={PRIVACY_INTRO}
                sections={PRIVACY_SECTIONS}
              />
            </SettingsSection>
          )}
        </div>
      </div>
    </div>
  );
}
