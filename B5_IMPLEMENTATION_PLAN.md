# B5 — Reconciliation & Implementation Plan (pre-implementation, READ-ONLY until authorized)

**Date:** 2026-09-13
**Status:** PLAN — **no files modified yet.** Awaiting explicit authorization to implement.
**Decisions:** B5 authorized with six LOCKED decisions (D-B5-1 … D-B5-6) per user message. Scope = P1.5 remainder + P1.7 audit + absorbed frozen-B1 security-gate remainder. No Phase-2 RBAC / recovery / OTP / MFA / email provider / provisioning / new session behavior / UI / dependency upgrades / unrelated refactor. No commits at any point.

---

## A. Pre-implementation verification (read-only, completed)

- **Frozen batch labels authoritative** (§1 of `PHASE_1_SCOPE_REVIEW.md` §6 + `PHASE_1_B1_RECONCILIATION.md` preface): session-labeled "B1" = frozen B2; frozen B1 (P1.3/P1.6/P1.5-config) was never executed and is absorbed here **only as sanctioned by D-B5-1**. B1/B3/B4 work is NOT renamed or reimplemented.
- **Locked contract sources:** D-07 envelope (flat list envelope, no `meta`), D-08 event mechanism + minimum Phase-1 event set, D-03 opacity, spec §7.2 `audit_logs`, §9.6 consumers, §10.3 audit endpoints + `identity:audit_log:*` permissions, roadmap gate checklist (CORS restricted; request-size limits; Swagger policy).
- **Verified tree state** (authoritative): EventEmitter2 installed + ForRoot; `SessionEvents` (7) emitted post-commit by B4; **no** auth/registration/email events, no consumers, no AuditService/controller/module, no `identity:audit_log:*` seeds; `AuditLog` model exists unused (`platform.prisma`); `AllExceptionsFilter` + `CorrelationIdInterceptor` exist but **unregistered**; `/auth/login` `/refresh` `/logout` `/me` return raw bodies; `main.ts` has `cors:true`, default Helmet, always-on Swagger. 65 unit + 86 e2e green (B4).
- **No new specification contradictions encountered** during verification; two implementation-time notes are surfaced (not silently resolved): see §H.

---

## B. Decision → code/schema/test mapping

### D-B5-1 — Absorb frozen-B1 security-gate remainder (CORS, body size, Helmet/HSTS/CSP, Swagger gate)

| Item | Config | Code | Tests |
|---|---|---|---|
| CORS origins | `cors.origins: string[]` from `CORS_ORIGINS` (CSV); dev defaults `http://localhost:3000,http://localhost:3001`; production default `[]`; `validateEnv` rejects `*` in production | `main.ts` `app.enableCors({ origin: corsOrigins, methods: [...], credentials: true })`; mirrored in `createTestApp` via shared `configureApp()` helper (single source: new `src/app-http.ts` exporting `configureApp(app)` used by `main.ts` and `createTestApp`) | e2e: allowed origin preflight reflects origin; disallowed origin → no `Access-Control-Allow-Origin`; config unit (production `*` rejected) |
| Body-size limit | `http.bodyLimit` from `BODY_LIMIT` (default `1mb`; test env `2kb` for cheap 413 test); `validateEnv` positive-size check | apply in `configureApp`: `app.useBodyParser('json', { limit })` (fallback: `express.json({limit})` if the Nest 10 API is unavailable — verified at implementation) | e2e: oversize POST → 413 + D-07 error envelope (no leak) |
| Helmet baseline + HSTS/CSP (D-06) | `security.hstsMaxAgeSeconds` from `HSTS_MAX_AGE_SECONDS` (default 15552000), `hstsIncludeSubDomains` default true | `configureApp`: `app.use(helmet({ hsts: { maxAge, includeSubDomains }, contentSecurityPolicy: { directives: minimal {defaultSrc:["'self'"], frameAncestors:["'self'"]} } }))` — minimal, no over-engineering | e2e: `X-Content-Type-Options`,`X-Frame-Options`,`Strict-Transport-Security` present |
| Swagger gate (P1.6) | `swagger.enabled` = `env !== 'production'` unless `SWAGGER_ENABLED=true`; `validateEnv` boolean parse | `configureApp`: only call `SwaggerModule.setup` when enabled | e2e: `/api/docs` reachable in test env; config/unit: prod-like env disables |

### D-B5-2 — Reconcile `audit_logs` (spec authoritative; preserve non-conflicting fields)

Migration (single additive `2026…_b5_audit_logs` via `prisma migrate diff` → hand-edit → `migrate deploy`, B4 pattern):
- `platform.prisma` `AuditLog`: rename `userId` → `actorId` (`actor_id`), add `actorEmail @db.VarChar(255)` (`actor_email`), add `changes Json?`, add indexes `@@index([actorId])`, `@@index([createdAt])`, **preserve** `entity/entityId/action/oldValues/newValues/ipAddress/userAgent/correlationId/createdAt` + 3 tenant indexes (no direct conflict; `oldValues/newValues` retained per decision text).
- Optionally `ipAddress` stays varchar (spec `inet` — noted variance, documented, no loss of function).
- Additive-safe (empty/unused table; dev+test recreated per harness). No tenant-key changes.

### D-B5-3 — Audit append-only immutability

- **Application level:** `AuditService` exposes only `record()`/read queries; no update/delete methods; consumer maps events to rows via explicit field whitelist (never generic spread ⇒ tokens/passwords/hashes cannot be persisted).
- **DB level:** migration appends `CREATE FUNCTION audit_logs_no_update() … RAISE EXCEPTION` + `BEFORE UPDATE OR DELETE ON audit_logs … EXECUTE FUNCTION` trigger. No normal app path can update/delete.
- Confirmed scope: applies to `audit_logs` only (B3 `login_attempts`/B4 `refresh_token_history` not touched).

### D-B5-4 — Read-only `GET /audit-logs` API

- `audit.controller.ts`: `GET /audit-logs` (`@Permissions('identity:audit_log:list')`, `JwtAuthGuard`+`PermissionGuard`), `GET /audit-logs/:id` (`identity:audit_log:read`). **No create/update/delete endpoints.**
- List DTO: `page`(1), `limit`(20, max 100), `action?`, `entity?`, `entityId?`, `actorId?`, `from?`, `to?`. Tenant-scoped by construction (caller `tenantId` from the strategy; enforced in `AuditService.list/findById`).
- Response: LOCKED flat envelope `{success:true,data:{items,total,page,limit}}`; items expose no tokens (they contain none).
- Seed: `identity:audit_log:list`/`read` permissions granted to existing admin-role set (`PLATFORM_ADMIN, ORG_ADMIN, PRIMARY_INSTITUTION_ADMIN, INSTITUTION_ADMIN, PRINCIPAL` — identical pattern to `identity:invitation`).
- Swagger annotations on both endpoints.

### D-B5-5 — 423/429 retryAfter inside D-07 `error.details`

- `all-exceptions.filter.ts` rewritten to D-07: `{success:false, error:{code, message, details?, correlationId?, timestamp?}}`.
  - `code`: stable derived codes (`UNAUTHORIZED`, `BAD_REQUEST`, `VALIDATION_ERROR`, `NOT_FOUND`, `LOCKED`, `TOO_MANY_REQUESTS`, `INTERNAL_ERROR`, …).
  - `details`: array — validation errors (message arrays) and object-payload extras (`errors`, `retryAfter`). 423/429 place `retryAfter` **inside `error.details`** — no second response format, no `Retry-After` duplicate format.
  - `correlationId`: from `correlationStorage` (present once interceptor registered); `timestamp`: ISO.
  - Non-HttpException → 500 `INTERNAL_ERROR`, generic message, never a stack.
- Thrown shapes that feed it today: `auth.service.ts` 423 `{statusCode,message,retryAfter}`, `login-throttle.guard.ts` 429 `{...retryAfter}`, register policy `{message,errors}`, PLATFORM_ADMIN BadRequest, opaque Unauthorized. Filter maps them all; call sites keep throwing (only body shape changes).
- Main + test parity via `APP_FILTER` registered in `app.module.ts` (applies to `main.ts` and `createTestApp` automatically).

### D-B5-6 — Normalize raw auth endpoints to D-07

- `auth.controller.ts`: wrap to `{success:true, data:{...}}`:
  - `POST /auth/login` → `data:{accessToken, refreshToken, expiresIn, user}`
  - `POST /auth/refresh` → `data:{accessToken, refreshToken, expiresIn}`
  - `POST /auth/logout` → `data:{loggedOut:true}`
  - `GET /auth/me` → `data:{...user}`
- **D-03 untouched:** credential failures remain byte-identical opaque `401`; unknown tenant/user/wrong password indistinguishable; 423/429 remain distinct lock/throttle signals (D-03/D-09). No message/content changes in failure branches.

### Cross-cutting P1.5 remainder

- Register `CorrelationIdInterceptor` globally (`APP_INTERCEPTOR` in `app.module.ts`), keeping `correlationStorage` + `X-Correlation-ID` response header.
- `src/modules/audit/` (new): `audit.events.ts` (AuthEvents: `LoginSucceeded`, `LoginFailed`, `LoginLocked`, `RegistrationSucceeded`, `EmailVerificationRequested`, `EmailVerified` + payload types; extend `SessionEventPayload` with `correlationId?`), `audit.service.ts` (record whitelist + read queries), `audit-log.consumer.ts` (one `@OnEvent` per event → row; failure = log-and-continue, silent per D-03; pre-auth events emitted within the correlation ALS context so `correlationId` propagates; empty/`''` tenant treated as null), `audit.controller.ts`, `audit.module.ts` (imports Prisma; exports AuditService; registers controller+consumer).
- Producers added in `auth.service.ts` (emit **after** the relevant DB write commits; pattern parity with B4):
  - `LoginSucceeded` on success; `LoginFailed` per failure branch (unknown-identity / invalid-password / verification-required; tenantId null for the unknown-tenant path); `LoginLocked` emitted on the **423 rejection only** (decision-9 default — no double-log at `evaluateLock`); `RegistrationSucceeded` only on real account creation (NOT the D-03 duplicate-masking branch); `EmailVerificationRequested` only when a new token is issued; `EmailVerified` after the verify transaction.
  - `LoginAttemptsService` (B3) untouched — direct writes remain; audit is a **parallel** immutable trail, no duplication of B3's tracking logic.
- B4 producers unchanged; `session.service.ts` payload gains optional `correlationId` (additive).
- Config (`configuration.ts` + spec tests): `cors.origins`, `http.bodyLimit`, `security.{hstsMaxAgeSeconds,hstsIncludeSubDomains}`, `swagger.enabled`, `audit.actorEmailCapture` (default true → persists `actorEmail` per spec).
- Env/docs: `apps/api/.env`, `apps/api/.env.test`, root `.env.test.example`, `docs/ENVIRONMENT.md`.

---

## C. Test impact matrix (conformance to the LOCKED contract — behaviors preserved, never weakened)

| Suite | Current assertion | B5 change |
|---|---|---|
| `auth.e2e-spec.ts` | `body.accessToken/refreshToken/user`, `body.sub` (me) | → `body.data.*`; `body.data.user.*` (me) |
| `login-protection.e2e-spec.ts` | `body.statusCode/retryAfter/message` | → `error.code/message/details[].retryAfter`; assert status codes unchanged (401/423/429) |
| `identity-b1.e2e-spec.ts` | `body.errors`, `body.message`, `login.body.user.*` | → `error.details`, `error.message`, `data.user.*`; register/success already conformant |
| `sessions.e2e-spec.ts` (+ helpers) | `loginAs` reads `res.body.accessToken`; `.body.data.sessions` already fine | helper → `res.body.data.accessToken/refreshToken`; refresh/logout body paths updated |
| `create-test-app.ts` | — | use `configureApp` (CORS/helmet/bodyParser/swagger gate/global filter+interceptor via AppModule) |
| New `audit.e2e-spec.ts` | — | §D below |

## D. New B5 tests

- **Unit:** `audit.service.spec.ts` (record whitelist/redaction incl. token/password key rejection, tenant-scoped list + pagination, findById scope, append-only surface — no update/delete methods); `all-exceptions.filter.spec.ts` (401/400/423/429/500 shapes, retryAfter in details, correlationId, no stack); `configuration.spec.ts` additions (CORS parse + prod-`*` reject, BODY_LIMIT, HSTS default, SWAGGER_ENABLED).
- **e2e `audit.e2e-spec.ts`:** login success/failure/locked rows (tenant + actor + action + correlationId + no token material); registration/email-verify rows; B4 session rows (created/rotated/reuse→revoke/logout/logout-all/expired); unknown-tenant `LoginFailed` row (tenantId null) does not alter D-03 401; **tenant isolation** (org-A cannot read org-B); **permission gate** (unprivileged → 403; granted admin → 200); **flat list envelope** + filters + no `meta`; **append-only DB trigger** (raw `$executeRaw` update/delete raises); consumer failure does not change auth outcome.
- **e2e envelope/security (B5 remainder):** CORS preflight + disallowed-origin; 413 on oversize; security headers present; D-07 error envelope on a forced 500 (no stack in body); flat-envelope audit list.
- **Regression:** run full `npm test`, `npm run typecheck`, `nest build`, `npm run test:e2e`, `prisma migrate status`. B1/B3/B4 suites pass with only the conformance edits above; no security behavior weakened.

## E. Migration & DB workflow

1. Edit `platform.prisma` `AuditLog`; run `npm run prisma:merge` (schema.prisma regenerated) + `npx prisma validate` + `npm run prisma:generate`.
2. `prisma migrate diff` (from current to new) → new migration SQL; hand-append the audit append-only trigger; `prisma migrate deploy` on dev DB; `npx prisma migrate status` up to date.
3. Test DB: recreated each run by existing `global-setup.ts` (`db push --force-reset` + seed + Redis flush) — B0/B4 harness unchanged.

## F. Verification sequence at completion

`npm run prisma:merge` → `prisma validate` → `prisma generate` → **`prisma migrate` + `migrate status`** → `npm test` → `npm run typecheck` → `nest build` → `npm run test:e2e` (full, incl. new audit + envelope/security suites; `--forceExit` already in script) → targeted B5 security tests (redaction, append-only trigger, isolation, authorization). Then produce the B5 implementation report and STOP for approval. **Nothing committed.**

## G. Exclusions reaffirmed

Phase-2 RBAC/custom roles, password recovery, phone OTP, MFA, production email provider, bulk provisioning, new session functionality beyond B4, UI, dependency upgrades, unrelated refactoring, durable outbox/`domain_events` (D-08 §5.2 deferred).

## H. Implementation-time notes (surface, do not silently resolve)

1. **`inet` vs varchar for `ip_address`:** spec §7.2 says `inet`; repo stores varchar(45) (B3/B4). Plan preserves varchar (documented variance, no functional loss) unless you direct otherwise.
2. **Nest 10 `useBodyParser` availability:** verify at implementation; fallback `express.json({ limit })` via `app.use(...)` inside `configureApp` if unsupported.
3. If any **new** contradiction appears during implementation, implementation stops and the contradiction is reported before proceeding (per authorization).

---

**Awaiting explicit authorization to implement this plan. No files were modified.**