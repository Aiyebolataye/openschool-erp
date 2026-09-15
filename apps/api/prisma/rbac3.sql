BEGIN;
DROP INDEX IF EXISTS "user_roles_userId_roleId_key";
ALTER TABLE "user_roles" ADD COLUMN "tenantId" uuid;
UPDATE "user_roles" SET "tenantId" = (SELECT id FROM "tenants" LIMIT 1) WHERE "tenantId" IS NULL;
ALTER TABLE "user_roles" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE UNIQUE INDEX "user_roles_tenantId_userId_roleId_key" ON "user_roles"("tenantId", "userId", "roleId");
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;
