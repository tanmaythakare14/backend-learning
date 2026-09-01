/**
 * Environment configuration
 * Centralizes all environment variable access
 */
export const config = {
  encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY || undefined,
  mode: import.meta.env.MODE || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  disableLogging: import.meta.env.VITE_DISABLE_LOGGING === 'true',
  disablePHIRedaction: import.meta.env.VITE_DISABLE_PHI_REDACTION === 'true',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000',
} as const;
