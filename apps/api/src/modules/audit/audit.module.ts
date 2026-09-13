import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditLogConsumer } from './audit-log.consumer';
import { AuditController } from './audit.controller';

@Module({
  providers: [AuditService, AuditLogConsumer],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}