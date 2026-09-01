import { Global, Module } from '@nestjs/common';
import { LoggerService } from './utils/logger.service';
import { AuditLogger } from './utils/audit-logger.service';

@Global()
@Module({
  providers: [LoggerService, AuditLogger],
  exports: [LoggerService, AuditLogger],
})
export class LoggingModule {}
