import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { ObjectScopeGuard } from '../../../common/guards/object-scope.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ObjectScope } from '../../../common/decorators/object-scope.decorator';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { BillingService } from '../services/billing.service';
import { AuthUser, toFinanceContext } from '../finance.types';
import { FeeIdParamDto } from '../dto/fee.dto';
import { BillQueryDto, CancelBillDto, GenerateBillDto } from '../dto/bill.dto';

/**
 * P6.2 — Billing endpoints (frozen Finance §9.4 BillingController, §10.3 Bills).
 *
 * `POST /bills/:id/convert` is intentionally absent. §10.3 lists it with
 * finance:bill:convert, but conversion writes an `invoices` row and the
 * spec-conformant invoice table cannot exist while the pre-P6.1 legacy
 * `invoices` table holds the frozen name — its archival is a separate, gated
 * decision. The permission is seeded (ADR-037 grants BURSAR finance:bill:convert)
 * but no route consumes it until that decision is made.
 */
@ApiTags('finance/bills')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
@Controller('finance/bills')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get()
  @Permissions('finance:bill:read')
  listBills(@CurrentUser() user: AuthUser, @Query() query: BillQueryDto) {
    return this.billing.listBills(
      toFinanceContext(user),
      query.page,
      query.limit,
      query.status,
      query.studentPersonId,
      query.feeScheduleId,
      query.academicSessionId,
    );
  }

  @Get(':id')
  @Permissions('finance:bill:read')
  @ObjectScope({ type: 'institution', model: 'bill' })
  getBill(@CurrentUser() user: AuthUser, @Param() params: FeeIdParamDto) {
    return this.billing.getBill(toFinanceContext(user), params.id);
  }

  @Post('generate')
  @Permissions('finance:bill:create')
  generateBill(@CurrentUser() user: AuthUser, @Body() dto: GenerateBillDto) {
    return this.billing.generateBill(toFinanceContext(user), dto);
  }

  @Post(':id/cancel')
  @Permissions('finance:bill:cancel')
  @ObjectScope({ type: 'institution', model: 'bill' })
  cancelBill(
    @CurrentUser() user: AuthUser,
    @Param() params: FeeIdParamDto,
    @Body() dto: CancelBillDto,
  ) {
    return this.billing.cancelBill(toFinanceContext(user), params.id, dto);
  }
}
