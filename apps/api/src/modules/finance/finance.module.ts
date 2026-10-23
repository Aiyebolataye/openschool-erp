import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { FeeStructureService } from './services/fees.service';
import { FeeStructureController } from './controllers/fees.controller';
import { BillingService } from './services/billing.service';
import { BillingController } from './controllers/billing.controller';
import { AccountingService } from './services/accounting.service';
import { AccountingController } from './controllers/accounting.controller';
import { DiscountService } from './services/discount.service';
import { DiscountController } from './controllers/discount.controller';
import { FinancialPolicyService } from './services/policy.service';
import { FinancialPolicyController } from './controllers/policy.controller';

/**
 * P6.1 / P6.2 — Finance module.
 *
 * AuthZ: AuthGuard('jwt') + PermissionGuard (finance:fee_category /
 * finance:fee_item / finance:fee_schedule / finance:bill / finance:ledger /
 * finance:journal / finance:period / finance:policy / finance:discount
 * catalogue) + ObjectScopeGuard (institution-scoped, fail-closed). Mutations
 * emit D-4 envelope-aware events with a shared eventId on the audit row (72h
 * dedup); mutations §5.8 gives no event for record an audit row only.
 *
 * Implemented (P6.1): fee categories, fee items.
 * Implemented (P6.2): fee schedules + schedule items + publication, bill
 * generation and cancellation, ledger accounts, manual double-entry journal
 * posting, account balances, financial periods (create/list), discount
 * definitions, financial policies with versioning.
 *
 * NOT implemented, and deliberately so:
 * - Invoices, payments, refunds, scholarships, write-offs and installment plans.
 *   Their §7.2 table names (invoices, payments, scholarships, refunds) are
 *   occupied by the pre-P6.1 legacy scaffold, and that scaffold's archival is a
 *   separate, gated decision — so bill->invoice conversion, payment recording,
 *   discount application and every approval workflow stay closed.
 * - `POST /accounting/periods/:id/close`: closing a period has mechanics in
 *   §13.4 but its authority is an open D-7 question.
 * - Payment gateways: credential storage/encryption is unspecified, and the
 *   callback route is unauthenticated, so no gateway surface is exposed.
 * - FeeTemplate: §7.1 defines the table but §10.3 defines no endpoint, so the
 *   model exists as schema with no API.
 */
@Module({
  imports: [AuditModule],
  controllers: [
    FeeStructureController,
    BillingController,
    AccountingController,
    DiscountController,
    FinancialPolicyController,
  ],
  providers: [
    FeeStructureService,
    BillingService,
    AccountingService,
    DiscountService,
    FinancialPolicyService,
  ],
  exports: [
    FeeStructureService,
    BillingService,
    AccountingService,
    DiscountService,
    FinancialPolicyService,
  ],
})
export class FinanceModule {}
