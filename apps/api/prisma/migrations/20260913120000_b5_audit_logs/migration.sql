-- B5 (P1.7): reconcile audit_logs to the frozen Identity/Platform specification.
-- Additive: the table is unused (no application code reads/writes it yet) and
-- empty, so column recreation is safe.
--
-- Spec alignment (decision D-B5-2): entity_type/entity_id, actor_id,
-- actor_email, changes (JSONB), context_ip/context_user_agent, created_at.
-- Preserved (no direct conflict): old_values/new_values, correlation_id,
-- tenant_id (tenancy), activity/actor indexes.

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_tenantId_fkey";

-- DropIndex
DROP INDEX "audit_logs_tenantId_createdAt_idx";

-- DropIndex
DROP INDEX "audit_logs_tenantId_entity_entityId_idx";

-- DropIndex
DROP INDEX "audit_logs_tenantId_userId_idx";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "correlationId",
DROP COLUMN "createdAt",
DROP COLUMN "entity",
DROP COLUMN "entityId",
DROP COLUMN "ipAddress",
DROP COLUMN "newValues",
DROP COLUMN "oldValues",
DROP COLUMN "tenantId",
DROP COLUMN "userAgent",
DROP COLUMN "userId",
ADD COLUMN     "actor_email" VARCHAR(255),
ADD COLUMN     "actor_id" UUID,
ADD COLUMN     "changes" JSONB,
ADD COLUMN     "context_ip" VARCHAR(45),
ADD COLUMN     "context_user_agent" TEXT,
ADD COLUMN     "correlation_id" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "entity_id" TEXT,
ADD COLUMN     "entity_type" TEXT NOT NULL,
ADD COLUMN     "new_values" TEXT,
ADD COLUMN     "old_values" TEXT,
ADD COLUMN     "tenant_id" UUID;

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_entity_type_entity_id_idx" ON "audit_logs"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_actor_id_idx" ON "audit_logs"("tenant_id", "actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_created_at_idx" ON "audit_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Decision D-B5-3: DB-level append-only immutability. audit_logs rows may be
-- INSERTed but never UPDATEed or DELETEd by any path (including prisma-system
-- resets). The trigger is idempotent to apply.
CREATE OR REPLACE FUNCTION audit_logs_prevent_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs are append-only; updates and deletes are forbidden';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_logs_append_only ON audit_logs;

CREATE TRIGGER audit_logs_append_only
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION audit_logs_prevent_mutation();