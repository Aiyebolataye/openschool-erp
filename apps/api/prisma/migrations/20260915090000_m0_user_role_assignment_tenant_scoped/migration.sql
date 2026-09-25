-- M0 (PEOPLE-1): user_roles is tenant-scoped (RBAC-3 / P2.3 Option 2).
-- Authoritative source-of-truth: domains/identity.prisma UserRoleAssignment
-- carries tenantId + Tenant relation + @@unique([tenantId, userId, roleId]).
-- The dev/test database was verified empty before applying this destructive
-- migration (see PEOPLE-1_IMPLEMENTATION_REPORT.md §4); an empty table is the
-- only reason adding a NOT NULL column needs no DEFAULT.

-- The flat (userId, roleId) uniqueness is replaced by the tenant-scoped triple.
DROP INDEX "user_roles_userId_roleId_key";

-- Phase-2 RBAC requires every role assignment to be bound to an organization.
ALTER TABLE "user_roles" ADD COLUMN "tenantId" UUID NOT NULL;

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "user_roles_tenantId_userId_roleId_key" ON "user_roles"("tenantId", "userId", "roleId");