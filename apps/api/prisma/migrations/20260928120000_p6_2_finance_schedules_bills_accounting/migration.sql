-- Phase 6.2 (P6.2) — Finance: fee schedules, bills, discounts, accounting foundation
--
-- Source of truth: engineering/Finance Engineering.md
--   §5.5 Core Entities, §5.6 Lifecycle States, §5.7 Business Rules, §5.8 Domain Events,
--   §6.4 Aggregate Invariants, §6.6 Validation Rules, §7.1 Table Catalogue,
--   §7.2 Column Catalogue, §7.3 Constraints, §7.4 Indexes, §8 Prisma Schema,
--   §13 Double-Entry Accounting Foundation, §2 Prisma schema principles.
--
-- Generated with `prisma migrate diff` from the validated P6.1-only baseline to the
-- current merged schema, so this file is exactly the datamodel delta and adds no
-- hand-written statement. Column naming and FK actions follow the P6.1 Finance
-- migration (20260927120000_p6_1_finance_fee_structure).
--
-- Additive only. The legacy `fee_structures` scaffold is untouched, and no data is
-- backfilled, archived, or rewritten (no D-12 destructive step).
--
-- Deliberately NOT modelled, pending the separately gated Finance legacy-archival
-- decision: the canonical `invoices`, `payments`, `scholarships` and `refunds`
-- models. The legacy scaffold already occupies those table names, so adding the
-- canonical shapes is impossible without first deciding what happens to the
-- scaffold. Consequently `discount_applications` (which references an invoice) is
-- also not modelled, and bill -> invoice conversion, payment recording, refunds
-- and write-offs remain unimplemented. No table is renamed, dropped or reused.
--
-- `fee_templates` is schema-only: §7.1 defines the table but §10.3 defines no
-- FeeTemplate endpoint or permission, so no API surface is introduced for it.
--
-- `financial_periods` carries the OPEN/CLOSING/CLOSED lifecycle, but no close
-- operation is implemented: period-close authority is an open D-7 question, and
-- closing a period is not safe to expose without it.
--
-- Cross-domain references (`academic_session_id`, `student_person_id`, `term_id`)
-- are plain UUID columns with service-level existence checks, per §8.2. They are
-- deliberately not Prisma relations, so the Finance schema carries no dependency
-- on the Academic/Student domain schemas.

-- CreateEnum
CREATE TYPE "FeeTemplateStatus" AS ENUM ('DRAFT', 'ACTIVE');

-- CreateEnum
CREATE TYPE "FeeScheduleStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('GENERATED', 'SENT', 'CONVERTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "DiscountCondition" AS ENUM ('EARLY_PAYMENT', 'SIBLING', 'EMPLOYEE', 'CUSTOM', 'NONE');

-- CreateEnum
CREATE TYPE "DiscountStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "FinancialPeriodStatus" AS ENUM ('OPEN', 'CLOSING', 'CLOSED');

-- CreateTable
CREATE TABLE "fee_templates" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "items" JSONB,
    "status" "FeeTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "fee_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_schedules" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "academic_session_id" UUID NOT NULL,
    "fee_template_id" UUID,
    "status" "FeeScheduleStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "fee_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_schedule_items" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "fee_schedule_id" UUID NOT NULL,
    "fee_item_id" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "fee_schedule_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "student_person_id" UUID NOT NULL,
    "fee_schedule_id" UUID NOT NULL,
    "academic_session_id" UUID NOT NULL,
    "term_id" UUID,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "status" "BillStatus" NOT NULL DEFAULT 'GENERATED',
    "notes" VARCHAR(500),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "value" DECIMAL(14,2) NOT NULL,
    "condition" "DiscountCondition" NOT NULL DEFAULT 'NONE',
    "max_applications" INTEGER,
    "valid_from" DATE,
    "valid_to" DATE,
    "applicable_session_ids" JSONB,
    "status" "DiscountStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_accounts" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "account_type" "AccountType" NOT NULL,
    "description" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_periods" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "academic_session_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "FinancialPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "financial_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "entry_number" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "reference_type" VARCHAR(50) NOT NULL,
    "reference_id" UUID NOT NULL,
    "financial_period_id" UUID NOT NULL,
    "total_debit" DECIMAL(14,2) NOT NULL,
    "total_credit" DECIMAL(14,2) NOT NULL,
    "posted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reversed" BOOLEAN NOT NULL DEFAULT false,
    "reversed_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entry_lines" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "journal_entry_id" UUID NOT NULL,
    "ledger_account_id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "debit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "description" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "journal_entry_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_balances" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "ledger_account_id" UUID NOT NULL,
    "financial_period_id" UUID NOT NULL,
    "opening_balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_debit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_credit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "closing_balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "account_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_policies" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "policy_type" VARCHAR(50) NOT NULL,
    "policy_key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "description" VARCHAR(500),
    "version" INTEGER NOT NULL DEFAULT 1,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "status" "PolicyStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "financial_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_fee_template_tenant_institution" ON "fee_templates"("tenantId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "fee_templates_tenantId_institutionId_name_key" ON "fee_templates"("tenantId", "institutionId", "name");

-- CreateIndex
CREATE INDEX "idx_fee_schedule_tenant_institution" ON "fee_schedules"("tenantId", "institutionId");

-- CreateIndex
CREATE INDEX "idx_fee_schedule_tenant_institution_status" ON "fee_schedules"("tenantId", "institutionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "fee_schedules_tenantId_institutionId_academic_session_id_na_key" ON "fee_schedules"("tenantId", "institutionId", "academic_session_id", "name");

-- CreateIndex
CREATE INDEX "idx_fee_schedule_item_tenant_institution" ON "fee_schedule_items"("tenantId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "fee_schedule_items_tenantId_fee_schedule_id_fee_item_id_key" ON "fee_schedule_items"("tenantId", "fee_schedule_id", "fee_item_id");

-- CreateIndex
CREATE INDEX "idx_bill_tenant_institution" ON "bills"("tenantId", "institutionId");

-- CreateIndex
CREATE INDEX "idx_bill_tenant_institution_student" ON "bills"("tenantId", "institutionId", "student_person_id");

-- CreateIndex
CREATE INDEX "idx_bill_tenant_institution_schedule" ON "bills"("tenantId", "institutionId", "fee_schedule_id");

-- CreateIndex
CREATE INDEX "idx_bill_tenant_institution_status" ON "bills"("tenantId", "institutionId", "status");

-- CreateIndex
CREATE INDEX "idx_discount_tenant_institution" ON "discounts"("tenantId", "institutionId");

-- CreateIndex
CREATE INDEX "idx_discount_tenant_institution_status" ON "discounts"("tenantId", "institutionId", "status");

-- CreateIndex
CREATE INDEX "idx_la_type" ON "ledger_accounts"("tenantId", "institutionId", "account_type");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_accounts_tenantId_institutionId_code_key" ON "ledger_accounts"("tenantId", "institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_accounts_tenantId_institutionId_name_key" ON "ledger_accounts"("tenantId", "institutionId", "name");

-- CreateIndex
CREATE INDEX "idx_financial_period_tenant_institution" ON "financial_periods"("tenantId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "financial_periods_tenantId_institutionId_name_key" ON "financial_periods"("tenantId", "institutionId", "name");

-- CreateIndex
CREATE INDEX "idx_je_period" ON "journal_entries"("financial_period_id");

-- CreateIndex
CREATE INDEX "idx_je_reference" ON "journal_entries"("reference_type", "reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_tenantId_institutionId_entry_number_key" ON "journal_entries"("tenantId", "institutionId", "entry_number");

-- CreateIndex
CREATE INDEX "idx_jel_account" ON "journal_entry_lines"("ledger_account_id");

-- CreateIndex
CREATE INDEX "idx_jel_entry" ON "journal_entry_lines"("journal_entry_id");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entry_lines_tenantId_journal_entry_id_ledger_accoun_key" ON "journal_entry_lines"("tenantId", "journal_entry_id", "ledger_account_id", "line_number");

-- CreateIndex
CREATE INDEX "idx_ab_period" ON "account_balances"("financial_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_balances_tenantId_ledger_account_id_financial_perio_key" ON "account_balances"("tenantId", "ledger_account_id", "financial_period_id");

-- CreateIndex
CREATE INDEX "idx_financial_policy_tenant_institution" ON "financial_policies"("tenantId", "institutionId");

-- CreateIndex
CREATE INDEX "idx_financial_policy_tenant_institution_type_key" ON "financial_policies"("tenantId", "institutionId", "policy_type", "policy_key");

-- CreateIndex
CREATE UNIQUE INDEX "financial_policies_tenantId_institutionId_policy_type_polic_key" ON "financial_policies"("tenantId", "institutionId", "policy_type", "policy_key", "version");

-- AddForeignKey
ALTER TABLE "fee_templates" ADD CONSTRAINT "fee_templates_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_schedules" ADD CONSTRAINT "fee_schedules_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_schedules" ADD CONSTRAINT "fee_schedules_fee_template_id_fkey" FOREIGN KEY ("fee_template_id") REFERENCES "fee_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_schedule_items" ADD CONSTRAINT "fee_schedule_items_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_schedule_items" ADD CONSTRAINT "fee_schedule_items_fee_schedule_id_fkey" FOREIGN KEY ("fee_schedule_id") REFERENCES "fee_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_schedule_items" ADD CONSTRAINT "fee_schedule_items_fee_item_id_fkey" FOREIGN KEY ("fee_item_id") REFERENCES "fee_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_fee_schedule_id_fkey" FOREIGN KEY ("fee_schedule_id") REFERENCES "fee_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_periods" ADD CONSTRAINT "financial_periods_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_financial_period_id_fkey" FOREIGN KEY ("financial_period_id") REFERENCES "financial_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_ledger_account_id_fkey" FOREIGN KEY ("ledger_account_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_ledger_account_id_fkey" FOREIGN KEY ("ledger_account_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_financial_period_id_fkey" FOREIGN KEY ("financial_period_id") REFERENCES "financial_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_policies" ADD CONSTRAINT "financial_policies_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

