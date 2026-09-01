import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';

export type AuditLogLevel = 'info' | 'warn' | 'error';

@Injectable()
export class AuditLogger {
  constructor(private readonly logger: LoggerService) {}

  log(
    context: string,
    message: string,
    meta: Record<string, unknown> = {},
    level: AuditLogLevel = 'info',
  ): void {
    const line = this.format(context, message, meta);
    this.logger[level](line, { context, ...meta });
  }

  private format(context: string, message: string, meta: Record<string, unknown>): string {
    const pairs = Object.entries(meta)
      .map(([key, value]) => `${key}=${this.stringify(value)}`)
      .join(' ');
    const base = `[${context}] ${message}`;
    return pairs ? `${base} ${pairs}` : base;
  }

  private stringify(value: unknown): string {
    if (value === null || value === undefined) return String(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}
