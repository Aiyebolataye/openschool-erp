-- B4 / P1.4 — Sessions & refresh-token redesign (D-05; additive / non-destructive)
-- Legacy `sessions` rows (pre-B4) carry no token hashes or tenant scope. They are
-- preserved, backfilled with synthesized non-functional hash values, and marked
-- inactive (isActive = false) so they can never be used for refresh or access
-- validation. No rows, tables or user data are deleted.

-- DropIndex (legacy helper index on the retired `token` column; index-only, not data)
DROP INDEX "sessions_token_idx";

-- AlterTable: add the new columns as NULLABLE first so any existing legacy rows
-- are not rejected, then backfill them below.
ALTER TABLE "sessions"
  ADD COLUMN "accessTokenHash" VARCHAR(64),
  ADD COLUMN "deviceInfo" JSONB,
  ADD COLUMN "isActive" BOOLEAN,
  ADD COLUMN "lastActivityAt" TIMESTAMP(3),
  ADD COLUMN "refreshTokenHash" VARCHAR(64),
  ADD COLUMN "tenantId" UUID,
  ADD COLUMN "updatedAt" TIMESTAMP(3),
  ALTER COLUMN "token" DROP NOT NULL;

-- Backfill any pre-existing legacy rows (defensive; dev DB is empty). md5() reads
-- as hex and is used only to synthesize unique placeholder values that satisfy the
-- NOT NULL / UNIQUE constraints; these rows are inactive and never validated.
UPDATE "sessions" AS s
SET
  "tenantId" = u."tenantId",
  "accessTokenHash" = md5('legacy-access:' || s."id"),
  "refreshTokenHash" = md5('legacy-refresh:' || s."id"),
  "isActive" = false,
  "lastActivityAt" = s."createdAt",
  "updatedAt" = s."createdAt"
FROM "users" AS u
WHERE u."id" = s."userId" AND s."tenantId" IS NULL;

-- Make the new columns NOT NULL now that every row is populated.
ALTER TABLE "sessions"
  ALTER COLUMN "accessTokenHash" SET NOT NULL,
  ALTER COLUMN "isActive" SET NOT NULL,
  ALTER COLUMN "lastActivityAt" SET NOT NULL,
  ALTER COLUMN "refreshTokenHash" SET NOT NULL,
  ALTER COLUMN "tenantId" SET NOT NULL,
  ALTER COLUMN "updatedAt" SET NOT NULL;

-- Restore the model-level default for isActive.
ALTER TABLE "sessions" ALTER COLUMN "isActive" SET DEFAULT true;

-- CreateTable
CREATE TABLE "refresh_token_history" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "refreshTokenHash" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_history_refreshTokenHash_key" ON "refresh_token_history"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "refresh_token_history_sessionId_idx" ON "refresh_token_history"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_history_sessionId_refreshTokenHash_key" ON "refresh_token_history"("sessionId", "refreshTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshTokenHash_key" ON "sessions"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "sessions_isActive_expiresAt_idx" ON "sessions"("isActive", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tenantId_userId_accessTokenHash_key" ON "sessions"("tenantId", "userId", "accessTokenHash");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_token_history" ADD CONSTRAINT "refresh_token_history_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;