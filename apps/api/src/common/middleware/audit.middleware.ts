import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../utils/logger.service';

interface AuditActor {
  userId?: string;
  roles?: string[];
  system: boolean;
}

type AuditStatus = 'SUCCESS' | 'FAILURE';

interface AuditLogEntry {
  timestamp: string;
  actor: AuditActor;
  method: string;
  endpoint: string;
  status: AuditStatus;
  statusCode: number;
  durationMs: number;
  userAgent?: string;
  query?: unknown;
  body?: unknown;
}

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = process.hrtime.bigint();

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      const entry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        actor: this.resolveActor(req),
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: res.statusCode,
        status: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE',
        durationMs: Math.round(durationMs * 100) / 100,
        userAgent: req.get('user-agent') ?? undefined,
      };

      if (req.query && Object.keys(req.query).length > 0) {
        entry.query = req.query;
      }
      if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        entry.body = req.body;
      }

      this.logger.info('AUDIT', entry);
    });

    next();
  }

  private resolveActor(req: Request): AuditActor {
    const user = req.user;
    if (!user) return { system: true };
    return {
      userId: user.userId,
      roles: user.roles,
      system: false,
    };
  }
}
