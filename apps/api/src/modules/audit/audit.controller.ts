import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { AuditService } from './audit.service';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs.dto';

/**
 * Read-only audit API (decision D-B5-4). Audit rows are append-only; there is
 * intentionally no create/update/delete controller surface here.
 */
@ApiTags('audit')
@Controller('audit-logs')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @Permissions('identity:audit_log:list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List audit log entries for the current tenant' })
  list(@CurrentUser('tenantId') tenantId: string, @Query() query: ListAuditLogsQueryDto) {
    return this.audit.list(tenantId, query);
  }

  @Get(':id')
  @Permissions('identity:audit_log:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single audit log entry by id' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const row = await this.audit.findById(tenantId, id);
    if (!row) {
      throw new NotFoundException('Audit log entry not found');
    }
    return { success: true as const, data: row };
  }
}