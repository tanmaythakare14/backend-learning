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
  auth0Domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
  auth0ClientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  auth0Audience: import.meta.env.VITE_AUTH0_AUDIENCE || undefined,
  feedback: {
    // On in development; in production only when explicitly turned on, because the widget
    // takes screenshots of whatever is on screen (student names, emails, phone numbers).
    enabled: import.meta.env.VITE_FEEDBACK_ENABLED
      ? import.meta.env.VITE_FEEDBACK_ENABLED === 'true'
      : import.meta.env.DEV,
    // 'local' keeps everything in this browser. 'supabase' | 'firebase' send it to that service.
    provider: import.meta.env.VITE_FEEDBACK_PROVIDER || 'local',
    projectKey: import.meta.env.VITE_FEEDBACK_PROJECT_KEY || 'cognify',
    supabaseUrl: import.meta.env.VITE_FEEDBACK_SUPABASE_URL || '',
    supabaseAnonKey: import.meta.env.VITE_FEEDBACK_SUPABASE_ANON_KEY || '',
    firebaseApiKey: import.meta.env.VITE_FEEDBACK_FIREBASE_API_KEY || '',
    firebaseAuthDomain: import.meta.env.VITE_FEEDBACK_FIREBASE_AUTH_DOMAIN || '',
    firebaseProjectId: import.meta.env.VITE_FEEDBACK_FIREBASE_PROJECT_ID || '',
    firebaseStorageBucket: import.meta.env.VITE_FEEDBACK_FIREBASE_STORAGE_BUCKET || '',
  },
} as const;
