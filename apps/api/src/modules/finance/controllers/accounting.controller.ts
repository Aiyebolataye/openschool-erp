import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { ObjectScopeGuard } from '../../../common/guards/object-scope.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ObjectScope } from '../../../common/decorators/object-scope.decorator';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { AccountingService } from '../services/accounting.service';
import { AuthUser, toFinanceContext } from '../finance.types';
import { FeeIdParamDto } from '../dto/fee.dto';
import {
  AccountBalanceQueryDto,
  CreateFinancialPeriodDto,
  CreateLedgerAccountDto,
  FinancialPeriodQueryDto,
  JournalEntryQueryDto,
  LedgerAccountQueryDto,
  PostJournalEntryDto,
} from '../dto/accounting.dto';

/**
 * P6.2 — Accounting endpoints (frozen Finance §9.4 AccountingController,
 * §10.3 Accounting, §13 Double-Entry Accounting Foundation).
 *
 * `POST /accounting/periods/:id/close` (finance:period:manage) is intentionally
 * absent: §13.4 defines the mechanics of closing but the authority allowed to
 * close a period is an open D-7 question, so the route is not exposed. Creating
 * a period is.
 */
@ApiTags('finance/accounting')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
@Controller('finance/accounting')
export class AccountingController {
  constructor(private readonly accounting: AccountingService) {}

  // ------------------------------------------------------- ledger accounts
  @Get('ledger-accounts')
  @Permissions('finance:ledger:read')
  listLedgerAccounts(
    @CurrentUser() user: AuthUser,
    @Query() query: LedgerAccountQueryDto,
  ) {
    return this.accounting.listLedgerAccounts(toFinanceContext(user), query);
  }

  @Post('ledger-accounts')
  @Permissions('finance:ledger:create')
  createLedgerAccount(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateLedgerAccountDto,
  ) {
    return this.accounting.createLedgerAccount(toFinanceContext(user), dto);
  }

  // --------------------------------------------------------- journal entries
  @Get('journal-entries')
  @Permissions('finance:journal:read')
  listJournalEntries(
    @CurrentUser() user: AuthUser,
    @Query() query: JournalEntryQueryDto,
  ) {
    return this.accounting.listJournalEntries(toFinanceContext(user), query);
  }

  @Get('journal-entries/:id')
  @Permissions('finance:journal:read')
  @ObjectScope({ type: 'institution', model: 'journalEntry' })
  getJournalEntry(@CurrentUser() user: AuthUser, @Param() params: FeeIdParamDto) {
    return this.accounting.getJournalEntry(toFinanceContext(user), params.id);
  }

  @Post('journal-entries')
  @Permissions('finance:journal:create')
  postJournalEntry(@CurrentUser() user: AuthUser, @Body() dto: PostJournalEntryDto) {
    return this.accounting.postJournalEntry(toFinanceContext(user), dto);
  }

  // ---------------------------------------------------------------- balances
  @Get('balances')
  @Permissions('finance:ledger:read')
  listBalances(@CurrentUser() user: AuthUser, @Query() query: AccountBalanceQueryDto) {
    return this.accounting.listBalances(toFinanceContext(user), query);
  }

  // -------------------------------------------------------- financial periods
  @Get('periods')
  @Permissions('finance:period:read')
  listPeriods(@CurrentUser() user: AuthUser, @Query() query: FinancialPeriodQueryDto) {
    return this.accounting.listPeriods(toFinanceContext(user), query);
  }

  @Post('periods')
  @Permissions('finance:period:create')
  createPeriod(@CurrentUser() user: AuthUser, @Body() dto: CreateFinancialPeriodDto) {
    return this.accounting.createPeriod(toFinanceContext(user), dto);
  }
}
