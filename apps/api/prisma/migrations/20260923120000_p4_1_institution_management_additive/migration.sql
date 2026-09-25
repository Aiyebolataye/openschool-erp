-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InstitutionStatus" ADD VALUE 'PROVISIONING';
ALTER TYPE "InstitutionStatus" ADD VALUE 'SUSPENDED';
ALTER TYPE "InstitutionStatus" ADD VALUE 'ARCHIVED';

-- CreateTable
CREATE TABLE "institution_configurations" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institution_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_settings" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'STRING',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institution_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "institution_configurations_tenantId_institutionId_idx" ON "institution_configurations"("tenantId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "institution_configurations_institutionId_key_key" ON "institution_configurations"("institutionId", "key");

-- CreateIndex
CREATE INDEX "institution_settings_tenantId_institutionId_idx" ON "institution_settings"("tenantId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "institution_settings_institutionId_key_key" ON "institution_settings"("institutionId", "key");

-- AddForeignKey
ALTER TABLE "institution_configurations" ADD CONSTRAINT "institution_configurations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_configurations" ADD CONSTRAINT "institution_configurations_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_settings" ADD CONSTRAINT "institution_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_settings" ADD CONSTRAINT "institution_settings_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;