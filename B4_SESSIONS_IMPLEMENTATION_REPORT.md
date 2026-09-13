# B4 — P1.4 Sessions & Refresh Token Redesign: Implementation Report

Date: 2026-09-13
Scope: Frozen **B4 = P1.4 “Auth Sessions / Refresh-tokens”** only (Authorization: B4 Scope Verification Report = approved; 4 locked decisions).
Status: **PASS — implemented, verified, stopped.** B5 / B6 **not** started.

---

## Executive summary

The legacy Redis-only “session” (a single cached JWT refresh token per user) was replaced with a **DB-authoritative, multi-device session table** with storage-hashed opaque refresh tokens, atomic single-use rotation with DB-level reuse detection, an append-only consumed-token ledger, immediate revocation (logout / logout-all / revoke-one / list), a dedicated cleanup worker, and in-process domain events via EventEmitter2. Access tokens are 15-minute JWTs (config-driven, `SESSION_MAX_SESSIONS` cap of 5), and a per-token `jti` nonce was added so concurrent rapid logins cannot collide on the `(tenantId, userId, accessTokenHash)` unique key.

All four locked decisions are implemented:

| Decision | Locked outcome | State |
|----------|----------------|-------|
| D-01 (TTL) | Access TTL 15m default, config-driven; hardcoded `3600` removed | ✅ |
| D-02 (Events) | EventEmitter2 installed/registered; B4 emits session events; B5 owns persistence | ✅ |
| D-03 (Fingerprint) | Minimal, privacy-conscious; nothing sensitive stored (`deviceInfo` preserved, currently `null`) | ✅ |
| D-04 (Scope) | Session listing + individual revocation + logout-all included | ✅ |

## What changed

### Data model (identity domain)
- `Session` reworked in `apps/api/prisma/domains/identity.prisma`:
  - `accessTokenHash` SHA-256 hex `VARCHAR(64)`; `@@unique([tenantId, userId, accessTokenHash])` (per-device, unique even within one second thanks to `jti`).
  - `refreshTokenHash` `@unique` — opaque 32-byte base64url token, hashed at rest.
  - `isActive`, `lastActivityAt`, `deviceInfo Json?`, `ipAddress`, `userAgent`, `expiresAt` (session/refresh TTL), `createdAt/updatedAt`.
  - Legacy `token String? @unique` retained (additive; NOT NULL removed) so the migration is non-destructive.
  - Indexes: `@@index([userId])`, `@@index([isActive, expiresAt])` (cleanup scan).
- **`RefreshTokenHistory`** ledger (append-only single-use evidence): `sessionId` FK (Cascade), `refreshTokenHash @unique`, `createdAt`.
- `User.sessions` / `Tenant.sessions` relations added.

### Migration (already applied + verified)
- `prisma/migrations/20260913100000_b4_sessions_refresh_tokens/migration.sql` — generated via `prisma migrate diff` (interactive `migrate dev` is unavailable in this shell), hardened by hand: columns added nullable → legacy rows backfilled (sentinel SHA-256 `md5(...)` hashes, `isActive=false`, `tenantId` from `users`, `expiresAt=now`) → `SET NOT NULL`; `token` dropped NOT NULL; legacy `sessions_token_idx` dropped (index-only, non-destructive).
- Applied with `prisma migrate deploy`. `npx prisma migrate status`: **4 migrations, database schema up to date** (dev DB). Additive; no data destruction.

### Application code
- `src/modules/session/` — new:
  - `session.events.ts` — `SessionCreated`, `RefreshRotated`, `RefreshReuseDetected`, `SessionLogout`, `SessionLogoutAll`, `SessionRevoked`, `SessionExpired` + ID-only payloads (D-08 / spec §9.6).
  - `session.service.ts` — `create` (active-session cap, oldest-keeps-newest revocation), `rotate` (interactive `$transaction`, CAS `updateMany(id + refreshTokenHash CAS + isActive + expiry guard)`; history-ledger reuse detection revokes the *whole* session; expired → inactive + `SessionExpired`; unknown → opaque 401, no oracle), `lookupForAccess`, `revokeCurrent/revokeOne/revokeAll/revokeAllSessionsForUser` (deactivation primitive), `list`, `sweepExpired`, TTL helpers. Redis (`session:access:{hash}`, guest-set `session:user:{userId}`) is **cache-only**; DB row is always authoritative. Events are emitted only **after** the transaction commits.
  - `session.controller.ts` — `GET /sessions` (caller-only, no hashes/tokens), `DELETE /sessions/:id` (own-session, 404 otherwise), `DELETE /sessions` (logout-all). All behind `JwtAuthGuard` with tenant+user scoping.
  - `session-cleanup.service.ts` + `src/workers/session-cleanup.worker.ts` (+ `bootstrap-session-cleanup-worker.ts`) — periodic `sweepExpired()` (spec I-22), **not auto-started** in the web app (e2e-safe); `npm run start:session-cleanup-worker`.
  - `session.service.spec.ts` — 10 unit tests (create/limit/rotate/reuse/unknown/expired/lookup/revoke/sweep/D-04 TTL).
- `src/modules/auth/`:
  - `auth.service.ts` — `login` creates the authoritative session; hardcoded `3600` removed → `expiresIn: sessionService.accessTtlSeconds()`; `refresh` delegates to `sessionService.rotate`; new `logout`. Access tokens carry `jti` (unique per token).
  - `jwt.strategy.ts` — `passReqToCallback`, re-extracts the raw bearer, hashes it, and **requires** an active, unexpired DB session for the same tenant+user (V-S-03/04). Surface includes `sessionId`.
  - `auth.controller.ts` — `POST /auth/logout` (revokes the current `sessionId`).
- `src/app.module.ts` — `EventEmitterModule.forRoot({ wildcard: true })` + `SessionModule`.
- `src/config/configuration.ts` — `SessionConfig` (maxSessions 5, cleanupIntervalMinutes 60), validateEnv guards, `jwt.expiresIn` default `'15m'`, `parseDurationToMs` helper. `configuration.spec.ts` extended.
- `src/cache/cache.service.ts` — added `sadd/srem/smembers` (Redis set index for logout-all/cleanup).

### Config/env/docs
- `apps/api/.env`, `apps/api/.env.test`, `.env.test.example`, `docs/ENVIRONMENT.md`: `JWT_EXPIRES_IN=15m`, documented `SESSION_MAX_SESSIONS` / `SESSION_CLEANUP_INTERVAL_MINUTES`.
- `apps/api/test/setup/global-setup.ts`: now flushes Redis after reseeding the test DB **so repeated full runs are deterministic** (stale throttle buckets used to bleed into later runs within the 10‑minute fixed window).

## Verification (all green)

| Check | Command | Result |
|-------|---------|--------|
| Typecheck | `npm run typecheck` | ✅ 0 errors |
| Unit | `npm test` | ✅ 5 suites / **65 tests** |
| Build | `npm run build` | ✅ (both worker bootstraps emitted) |
| e2e | `npm run test:e2e` (→ `jest --config ./test/jest-e2e.json --forceExit`) | ✅ 4 suites / **86 tests** (`auth`, `login-protection`, `identity-b1`, **`sessions` = 16 new**) |
| Dev migration | `npx prisma migrate status` | ✅ up to date (4 migrations) |

`--forceExit` added to the e2e script so lingering BullMQ/ioredis handles (pre-existing infrastructure) cannot block CI.

### e2e coverage highlights (16 sessions tests)
DB-authoritative login (row + `accessTokenHash`/`refreshTokenHash` verified), immediate revocation (missing DB row → 401), rotation + single-use + history ledger, opaque 401 for reused/unknown/logged-out tokens, **concurrent double-refresh → exactly one succeeds and the whole session is revoked**, caller-scoped listing with **no token material exposed**, revoke-one (404 on non-own), logout-one vs logout-all, max-sessions eviction of oldest, `SessionCreated/RefreshRotated/SessionExpired` emissions, idempotent `sweepExpired`, non-ACTIVE-user hard-block + `revokeAllSessionsForUser`.

## Security & design notes
- Reuse detection is DB-authoritative via the ledger + atomic CAS — a concurrent loser is indistinguishable from a deliberate replay, both revoke the entire session.
- Unknown/never-issued tokens get an opaque, byte-consistent 401 with **no** existence oracle (D-03).
- Refresh tokens never leave the DB as plaintext; access-token hashes enable instant invalidation while the JWT itself remains offline-verifiable.
- Redis is a fail-open index only: a miss/error can never resurrect a revoked session.

## Reconciliation
- Onboarding auto-auth flows through `auth.login` → sessions created normally (verified: `onboarding.service.ts` calls `this.auth.login`).
- Audit persistence, admin revocation UI, MFA, password recovery, Phase-2 RBAC, phone OTP: **not touched** (B5 / B6 territory).

## Stopped
Batch complete. **B5 (P1.5 remainder / P1.7 audit) and B6 (security gate) are not started** and await explicit authorization.