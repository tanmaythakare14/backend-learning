import { useEffect } from 'react';
import { initFeedbackPlugin, type PluginConfig } from '@mindbowser_inc/ui-feedback-plugin';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';

type FeedbackBackend = PluginConfig['backend'];

const LIFTED_BOTTOM = '88px';

/**
 * Which storage the widget uses, from env. Returns null (and says why) when the chosen
 * provider is missing its credentials, so a half-configured setup shows nothing rather than
 * a widget that silently fails to save.
 */
function resolveBackend(): FeedbackBackend | null {
  const { provider } = config.feedback;

  if (provider === 'local') return { provider: 'local' };

  if (provider === 'supabase') {
    const { supabaseUrl, supabaseAnonKey } = config.feedback;
    if (supabaseUrl && supabaseAnonKey) {
      return { provider: 'supabase', url: supabaseUrl, anonKey: supabaseAnonKey };
    }
    logger.warn('Feedback widget disabled: VITE_FEEDBACK_SUPABASE_URL / _ANON_KEY are not set');
    return null;
  }

  if (provider === 'firebase') {
    const { firebaseApiKey, firebaseAuthDomain, firebaseProjectId, firebaseStorageBucket } =
      config.feedback;
    if (firebaseApiKey && firebaseAuthDomain && firebaseProjectId) {
      return {
        provider: 'firebase',
        apiKey: firebaseApiKey,
        authDomain: firebaseAuthDomain,
        projectId: firebaseProjectId,
        storageBucket: firebaseStorageBucket || undefined,
      };
    }
    logger.warn('Feedback widget disabled: the VITE_FEEDBACK_FIREBASE_* variables are not set');
    return null;
  }

  logger.warn(`Feedback widget disabled: unknown VITE_FEEDBACK_PROVIDER "${provider}"`);
  return null;
}

/**
 * Mounts the floating feedback button (annotated screenshots, comment threads) from
 * @mindbowser_inc/ui-feedback-plugin. Renders nothing itself — the plugin adds its own
 * button to the page — and tears it down again when unmounted.
 */
export function FeedbackWidget(): null {
  useEffect(() => {
    if (!config.feedback.enabled) return;

    const backend = resolveBackend();
    if (!backend) return;

    // React StrictMode (dev) mounts, cleans up and mounts again straight away. The plugin refuses
    // a second init after a teardown ("Already initialized") and the widget vanishes, so start it
    // on a timer that the throwaway first mount cancels before it ever fires.
    let teardown: (() => void) | undefined;
    let timer = window.setTimeout(() => {
      teardown = initFeedbackPlugin({
        backend,
        projectKey: config.feedback.projectKey,
        position: 'bottom-right',
      });
      lift();
    }, 0);

    // The plugin has no offset option and pins its button 24px from the corner, which sits on
    // top of pages' sticky footers (e.g. the assignment builder's Publish button). Its DOM is in
    // a shadow root, so lift the button's container from in there.
    let attempts = 0;
    function lift(): void {
      const host = document.querySelector('ui-feedback-plugin');
      const container = host?.shadowRoot?.querySelector('#ufp-btn-annotate')?.parentElement;
      if (container) {
        container.style.bottom = LIFTED_BOTTOM;
      } else if (attempts++ < 20) {
        timer = window.setTimeout(lift, 100);
      }
    }

    return () => {
      window.clearTimeout(timer);
      teardown?.();
    };
  }, []);

  return null;
}
