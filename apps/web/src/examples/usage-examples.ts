/**
 * Usage examples for secure storage, Redux, and logging
 * This file demonstrates how to use all the security features
 */

import { secureLocalStorage, secureSessionStorage } from '../utils/secureStorage';
import { logger } from '../utils/logger';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { config } from '../config/environment';

// ─── Secure Storage ───────────────────────────────────────────────────────────

export function secureStorageExamples() {
  // Store a string securely in localStorage
  secureLocalStorage.setItem('userToken', 'my-secret-token-12345');
  const token = secureLocalStorage.getItem('userToken');
  logger.info('Token retrieved', { token });

  interface UserPreferences {
    theme: 'light' | 'dark';
    notifications: boolean;
  }

  secureLocalStorage.setItemObject<UserPreferences>('userPreferences', {
    theme: 'dark',
    notifications: true,
  });
  const prefs = secureLocalStorage.getItemObject<UserPreferences>('userPreferences');
  logger.info('Preferences retrieved', { prefs });

  // Session storage (cleared on tab close)
  secureSessionStorage.setItem('sessionId', 'session-abc-123');
  secureSessionStorage.setItemObject('tempData', { key: 'value' });

  secureLocalStorage.removeItem('userToken');
}

// ─── Redux ────────────────────────────────────────────────────────────────────

export function useReduxExamples() {
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) => state.sample.count);

  const increment = () => dispatch({ type: 'increment' });
  const decrement = () => dispatch({ type: 'decrement' });

  return { count, increment, decrement };
}

// ─── Logger ───────────────────────────────────────────────────────────────────

export function loggerExamples() {
  const patientData = {
    name: 'John Doe',
    ssn: '123-45-6789',
    email: 'john@example.com',
    phone: '555-1234',
    dateOfBirth: '01/15/1990',
    medicalRecordNumber: 'MRN-12345',
  };

  logger.debug('Patient data retrieved', patientData);    // PHI auto-redacted
  logger.info('User logged in', { userId: 'user-123' });
  logger.warn('API rate limit approaching', { remaining: 10 });

  try {
    throw new Error('Something went wrong');
  } catch (error) {
    logger.error('Failed to process request', error, { requestId: 'req-123' });
  }
}

// ─── Environment ──────────────────────────────────────────────────────────────

export function environmentExamples() {
  if (config.isDevelopment) logger.debug('Running in development mode');
  if (config.isProduction) logger.info('Running in production mode');

  return {
    apiUrl: config.apiUrl,
    encryptionKeySet: !!config.encryptionKey,
  };
}
