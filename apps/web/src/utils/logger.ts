/**
 * Logger utility with PHI (Protected Health Information) redaction
 * Handles logging based on environment — always redacts PHI for HIPAA compliance
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  environment: string;
}

const PHI_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
  /\b\d{9}\b/g,
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone numbers
  /\(\d{3}\)\s?\d{3}-\d{4}/g,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
  /\b\d{4}[-.s]?\d{4}[-.s]?\d{4}[-.s]?\d{4}\b/g, // Credit card
  /\bMRN[-:]?\s?\d+\b/gi, // Medical record numbers
  /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g, // Dates of birth
  /\b(?:patient|client|user)\s+name:?\s*[A-Z][a-z]+\s+[A-Z][a-z]+\b/gi,
];

const CUSTOM_PHI_FIELDS = [
  'ssn',
  'socialSecurityNumber',
  'dateOfBirth',
  'dob',
  'phone',
  'phoneNumber',
  'email',
  'emailAddress',
  'address',
  'medicalRecordNumber',
  'mrn',
  'insuranceId',
  'policyNumber',
  'accountNumber',
  'creditCard',
  'cardNumber',
  'name',
  'patientName',
  'clientName',
  'firstName',
  'lastName',
  'fullName',
];

function redactPHI(text: string): string {
  return PHI_PATTERNS.reduce((acc, pattern) => acc.replace(pattern, '[REDACTED]'), text);
}

function redactPHIFromObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return redactPHI(obj);
  if (Array.isArray(obj)) return obj.map(redactPHIFromObject);
  if (typeof obj === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      redacted[key] = CUSTOM_PHI_FIELDS.some((f) => lowerKey.includes(f))
        ? '[REDACTED]'
        : redactPHIFromObject(value);
    }
    return redacted;
  }
  return obj;
}

function shouldRedactPHI(): boolean {
  return import.meta.env.VITE_DISABLE_PHI_REDACTION !== 'true';
}

class Logger {
  private environment: string;
  private enabled: boolean;

  constructor() {
    this.environment = import.meta.env.MODE || 'development';
    this.enabled = this.environment !== 'test' && import.meta.env.VITE_DISABLE_LOGGING !== 'true';
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    if (this.environment === 'production') {
      return level === LogLevel.WARN || level === LogLevel.ERROR;
    }
    return true;
  }

  private formatLog(level: LogLevel, message: string, data?: unknown): LogEntry {
    const redact = shouldRedactPHI();
    return {
      level,
      message: redact ? redactPHI(message) : message,
      data: data ? (redact ? redactPHIFromObject(data) : data) : undefined,
      timestamp: new Date().toISOString(),
      environment: this.environment,
    };
  }

  private outputLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;
    const { level, message, data, timestamp } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data ?? '');
        break;
      case LogLevel.INFO:
        console.info(prefix, message, data ?? '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, data ?? '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, data ?? '');
        break;
    }
  }

  debug(message: string, data?: unknown): void {
    this.outputLog(this.formatLog(LogLevel.DEBUG, message, data));
  }

  info(message: string, data?: unknown): void {
    this.outputLog(this.formatLog(LogLevel.INFO, message, data));
  }

  warn(message: string, data?: unknown): void {
    this.outputLog(this.formatLog(LogLevel.WARN, message, data));
  }

  error(message: string, error?: Error | unknown, data?: unknown): void {
    const baseErrorData =
      error instanceof Error ? { message: error.message, stack: error.stack } : { error };
    const errorData =
      data && typeof data === 'object' && !Array.isArray(data)
        ? { ...baseErrorData, ...data }
        : data !== undefined
          ? { ...baseErrorData, data }
          : baseErrorData;
    this.outputLog(this.formatLog(LogLevel.ERROR, message, errorData));
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  getEnvironment(): string {
    return this.environment;
  }
}

export const logger = new Logger();
export { Logger };
