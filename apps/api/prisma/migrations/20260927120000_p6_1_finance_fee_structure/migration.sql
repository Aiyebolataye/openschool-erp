-- Phase 6.1 (P6.1) — Finance: fee structure foundation (fee categories, fee items)
--
-- Source of truth: engineering/Finance Engineering.md
--   §5.5 Core Entities, §5.7 BR-01 / BR-030, §5.8 Domain Events,
--   §6.6 V-FC-01..02 / V-FI-01..04, §7.2 Column catalogue, §2 Prisma schema principles.
--
-- Additive only: the legacy `fee_structures` scaffold is untouched. No data is
-- backfilled, archived, or rewritten (no D-12 destructive step). Column naming
-- and FK actions follow apps/api/prisma/migrations/20260924110000_p5_2_academic_management.

-- CreateEnum
CREATE TYPE "FeeItemStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "fee_categories" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "fee_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_items" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "fee_category_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "description" VARCHAR(500),
    "status" "FeeItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "fee_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fee_category_tenant_institution_name_key" ON "fee_categories"("tenantId", "institutionId", "name");

-- CreateIndex
CREATE INDEX "idx_fee_category_tenant_institution" ON "fee_categories"("tenantId", "institutionId");

-- CreateIndex
CREATE INDEX "idx_fee_item_tenant_institution" ON "fee_items"("tenantId", "institutionId");

-- CreateIndex
CREATE INDEX "idx_fee_item_tenant_category" ON "fee_items"("tenantId", "feeCategoryId");

-- AddForeignKey
ALTER TABLE "fee_categories" ADD CONSTRAINT "fee_categories_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_items" ADD CONSTRAINT "fee_items_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_items" ADD CONSTRAINT "fee_items_fee_category_id_fkey" FOREIGN KEY ("fee_category_id") REFERENCES "fee_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
