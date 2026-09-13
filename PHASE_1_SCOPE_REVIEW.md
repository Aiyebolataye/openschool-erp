# Phase 1 — Scope Review (Authentication & Security Hardening)

**Status:** LOCKED/APPROVED — 2026-09-12. Decisions D-01–D-09 are approved and authoritative for Phase 1 implementation (see §5). **Nothing implemented.** No source changes, no migrations, no commits, no B batches started.
**Authority:** `MASTER_SMS_ROADMAP.md` §2 (principles) + §PHASE 1 (P1.1–P1.7 + security gate). Secondary: frozen `engineering/Identity & Access Engineering.md`, `CURRENT-STATE-AUDIT.md`, `PHASE_0_COMPLETION_REPORT.md`.
**Phase 0 dependency:** Phase 0 is APPROVED and CLOSED (commits `d95fc93`, `3ceb2ff`, `062b5a6`, `797c384`; tree clean). Phase 1 builds directly on it.

---

## 1. Phase 1 name & objective

- **Name:** Authentication & Security Hardening (roadmap §PHASE 1).
- **Objective (roadmap):** "Make authentication safe enough to serve as the foundation for every subsequent API."
- **Result of Phase 1 = passing the "Phase 1 security gate"** (roadmap lines 357–370) before Phase 2 (RBAC) can start.

## 2. Task inventory with full breakdown

Gaps cited from the roadmap's Phase 1 tasks; current-state evidence from the running repo.

### 2.1 P1.1 — Registration security

**Objective:** Remove unrestricted client-selected role registration; define server-side role assignment; prevent privileged-role self-creation; validate input; tenant-boundary-safe.

| Item | Current state (evidence) | Gap / work |
|---|---|---|
| Remove unrestricted client-selected role registration | `POST /auth/register` accepts client `roleName`; `AuthService.register` looks it up by name and assigns (`auth.dto.ts:58-61`, `auth.service.ts:156-211`) | Replace role-from-client with server-side rule. No self-selection |
| Prevent public creation of privileged platform roles | Seed defines 13 roles including `PLATFORM_ADMIN`, `INSTITUTION_ADMIN`, `BURSAR`, `HR_OFFICER`, `HOSTEL_ADMIN`, etc. (`seed.ts:129-143`). Nothing stops a client registering as `PLATFORM_ADMIN` today | Enforce allowlist of self-registrable roles (decision — see D-01), reject system/privileged roles, test each |
| Define which roles may self-register, per frozen Identity spec | Spec §6.3 P-16 + §2 Security + ADR-016 = **invitation-based onboarding**; V-RA-06 "invitation token required (if invite-only mode)" | Adopt invitation-based registration (token + role from invitation) or locked allowlist. Ambiguity — see §4.1 |
| Enforce server-side role assignment rules | None (no assignment service; global role lookup) | New server-side assignment layer; invitation `role_id` binding |
| Validate all registration input | DTO has email/password/names/phone (`auth.dto.ts:29-61`) | Tighten per V-RA-01..06 (email ≤255, name rules 1–100, password per policy) |
| Verify email/identity requirements per spec | Spec requires email verification flow (`email_verification_tokens`, `EmailVerified`, endpoints `/auth/email/verify` + `/verification-request`) | **LOCKED (D-02).** Phase-1 tokens + dev/log `DeliveryProvider` only; sender wiring deferred to Phase 9 |
| Ensure registration cannot bypass tenant boundaries | `register` resolves `tenantSlug`, creates user under that tenant (`auth.service.ts:165-171`) | Enforce tenant appears on user + assignment rows; e2e: cross-tenant email reuse → per-tenant uniqueness (spec I-01) |

**Files affected:** `apps/api/src/modules/auth/auth.controller.ts`, `auth.service.ts`, `dto/auth.dto.ts`, `auth.module.ts`; possibly new `src/modules/identity/invitations`; Prisma `identity.prisma`; `apps/api/test/*.e2e-spec.ts`.
**Phase 0 deps:** global ValidationPipe, typed config, test infra (`create-test-app`, force-reset+seed).
**DB/schema:** (pending decisions) `email_verification_tokens`; invitation tables (see D-01); no change needed for role allowlist alone.
**API:** `POST /auth/register` semantics change (invitation token / no role in body).
**Web:** none (frontend integration is Phase 11).
**Tests:** unit: role-rule logic; e2e: PUBLIC user cannot create privileged role (PLATFORM_ADMIN, INSTITUTION_ADMIN), unknown role rejected, duplicate email 409, cross-tenant same email allowed, input rejection.
**Security:** privilege escalation (P1 gate item 1), tenant bypass.
**Migration/compat:** additive tables only; `register` contract change is breaking — flag for consumers (none today).
**DoD:** privileged roles cannot be self-created; register no longer accepts client role; registration tests pass; no auth regression.

### 2.2 P1.2 — Login protection

**Objective:** Rate-limit login, track failed attempts, lock accounts, prevent brute force, avoid account-existence leak.

| Item | Current state (evidence) | Gap / work |
|---|---|---|
| Apply rate limiting to login | `TenantRateLimitGuard` is global via `APP_GUARD` (`rate-limit.module.ts:8-12`) but **no-ops pre-auth**: no `x-tenant-id` header + no `request.user` → returns `true` (`rate-limit.guard.ts:26-32`); login requests therefore unlimited. Limits hardcoded 1000ms/100 (`rate-limit.guard.ts:14-15`) | Wire auth-specific limit keyed by IP/email/tenant; consume or document `THROTTLE_TTL/LIMIT`; decide pre-auth keying |
| Failed-attempt tracking | No `login_attempts` table (not in schema); no audit write on failure | New append-only `login_attempts` table (spec §7.1/§7.2) + write on every result |
| Account lockout per specification | No lockout: `users` has no `locked_until`/attempt counter; spec P-16 default max 5 attempts (3–10), lock on threshold, I-24 state machine | Add `locked_until` (and optional counter) or derive from `login_attempts`; enforce V-A-03 before password check |
| Prevent brute-force abuse | Nothing today | Login rate limit + failed-attempt lockout + (optional) exponential delay |
| Avoid leaking account existence | `login` returns distinct `Invalid tenant` (unknown slug) vs `Invalid credentials` (`auth.service.ts:34-36,47-49`); user-lookup failure same message but tenant slug leaks | Unify error for unknown tenant/user/bad password; decide (#D-03) |
| Test repeated failed login attempts | None | e2e: 5 bad logins → locked; correct login rejected while locked; lock clears after window; 429 on burst |

**Files affected:** `src/modules/auth/auth.service.ts`, `auth.controller.ts`, `src/rate-limit/rate-limit.guard.ts`, `rate-limit.module.ts`, `src/config/configuration.ts` (+spec), Prisma `identity.prisma`, `.env*`, `docs/ENVIRONMENT.md`, test suite.
**Phase 0 deps:** Redis CacheService, config validation, e2e infra.
**DB/schema:** new `LoginAttempt` model (+ optional user lock columns). **First Phase-1 migration.**
**API:** error-response semantics for `/auth/login`; possible 429/423 statuses.
**Web:** none.
**Tests:** see items above; unit: lockout policy, guard keying; e2e: rate limit + lockout + timer expiry.
**Security:** brute force (P1 gate item 2–3), account-existence enumeration.
**Migration/compat:** additive; no breaking change to happy-path login.
**DoD:** login rate limiting works; brute-force protections work (gate items); repeated-failure test passes; happy-path login unchanged.

### 2.3 P1.3 — JWT configuration

**Objective:** No silent secret fallback; validated startup config; correct signing/expiry; secrets never logged.

| Item | Current state (evidence) | Gap / work |
|---|---|---|
| Remove `change-me` fallback | DONE in Phase 0 — no defaults in `auth.module.ts`/`jwt.strategy.ts`; boot fails on missing/blank `JWT_SECRET` | ✅ READY (verify in CI-only boot) |
| Require production JWT config | `validateEnv` enforces ≥32 chars in production; rejects `change-me*`/`changeme`/`secret` placeholders | ✅ READY; confirm at deploy (NODE_ENV present in prod) |
| Validate JWT config at startup | `ConfigModule.validate` (`configuration.ts`) | ✅ READY |
| Confirm signing/verification | HS256 default, `passport-jwt` `ignoreExpiration:false`, bearer extraction (`jwt.strategy.ts:16-20`) | ✅ READY — verify no asymmetry (access uses same secret) |
| Confirm access-token expiry | `JWT_EXPIRES_IN` env; `auth.service` returns `expiresIn: 3600` (`auth.service.ts:105`) | **Decision:** spec ADR-006 says 15 min; repo default 1 h (D-04) |
| Confirm refresh-token expiry | `jwt.refreshExpiresIn` default `7d` (`auth.service.ts:79`) — matches spec 7-day | ✅ READY (will change under P1.4 rotation) |
| Ensure secrets are not logged | Nothing logs the secret; unit config tests do not print it | ✅ READY — add a regression assertion in P1 e2e |

**Files affected:** config unit test additions only (implementation largely complete).
**Phase 0 deps:** config/validateEnv (P0.3).
**DB/schema:** none. **API:** none (D-04 LOCKED: TTLs from config). **Web:** none.
**Tests:** unit: production boot rejects weak secret (exists); e2e: no secret value appears in any response body/log capture.
**Security:** signing-key compromise (P1 gate item 4).
**Migration/compat:** none.
**DoD:** JWT secret cannot silently fall back (gate item) — verified; expiry policy locked and tested.

### 2.4 P1.4 — Sessions / refresh tokens

**Objective:** Enforce valid, revocable, expiring sessions per the Identity spec; DB and Redis never silently diverge; multi-device model.

| Item | Current state (evidence) | Gap / work |
|---|---|---|
| Define multi-device session model per spec | Spec ADR-013 default max 5 concurrent; ADR-014 device fingerprinting; `sessions` = access+refresh hashes, device_info, ip (inet), UA, last_activity_at, expires_at, `is_active`; V-S rules | Decision then schema rework (D-05) |
| Secure refresh-token/session validation | Refresh verifies JWT + Redis cache only (`auth.service.ts:120-154`); **DB `sessions` row never read**; cache single key `session:{userId}` overwritten per login (one session per user) | DB-backed validation with hashed refresh; V-S-06 uniqueness; multi-session support |
| Revoked/expired sessions cannot refresh | No revocation; no expiry check on refresh | is_active/expires checks in validation |
| Session DB & Redis cannot silently diverge | Redis is source of truth today, DB row is a no-op | Single authoritative store (DB; Redis as cache/index) or transactional dual-write; reconcile/cleanup |
| Session expiry cleanup | `sessions.expires_at` exists but nothing enforces; spec I-22 background cleanup | Cron/BullMQ cleanup job (Queue infra exists) |
| Logout/revocation | No logout endpoint; spec: `POST /auth/logout` + session revoke endpoints | Add logout (+ optional `DELETE /sessions`); SessionRevocationConsumer on password change |
| Test expired sessions | None | e2e: expired access 401; expired refresh cannot refresh |
| Test revoked sessions | None | e2e: logged-out refresh rejected; per-device revoke |
| Test multiple sessions/devices if required | Not currently possible (single-session) | e2e after model: concurrent cap (5), per-device revocation |

**Files affected:** `auth.service.ts` (refresh/login), `auth.controller.ts` (+logout), new `src/modules/auth/session.service.ts` (or `src/modules/sessions`), `prisma/domains/identity.prisma` (Session), `src/cache/cache.service.ts` (index/keys), `src/queue/*` + a cleanup worker, `src/common/consumer/session-revocation`.
**Phase 0 deps:** CacheService (Redis), QueueService (BullMQ) for cleanup, e2e infra.
**DB/schema:** **major `sessions` rework** (+`tenantId`, hashes, `is_active`, `last_activity_at`, `device_info`; drop/repurpose `token`); likely `@db.Uuid`→inet for ip; migration.
**API:** `POST /auth/logout`; refresh rotation (refresh endpoint returns new refresh); session list/revoke endpoints (spec catalog) — scope decided in D-05.
**Web:** none.
**Tests:** the 4 item tests above; unit: rotation, validity matrix; e2e: multi-device, divergence detection.
**Security:** session fixation/reuse, revocation (P1 gate items 5–6).
**Migration/compat:** **breaking** — existing sessions invalidated; acceptable pre-release (no production data).
**DoD:** session/refresh validation enforced; expiry/revocation works (gate items); divergence tests pass.

### 2.5 P1.5 — CORS and HTTP security

**Objective:** Explicit origins, per-env split, hardened Helmet, request-size limits, method behavior, safe prod errors.

| Item | Current state (evidence) | Gap / work |
|---|---|---|
| Replace `cors: true` with explicit origins | `NestFactory.create(AppModule, { cors: true })` (`main.ts:9-11`) | `CORS_ORIGINS` env (already reserved Phase-1 in ENVIRONMENT.md) consumed in `main.ts` |
| Separate dev/staging/prod origins | No env separation anywhere | Per-NODE_ENV defaults; `.env.example`/`.env.test.example` entries |
| Review Helmet configuration | `app.use(helmet())` defaults (`main.ts:15`) | Per-spec HSTS/CSP review (D-06) |
| Define production security headers | Defaults only | Policy per deployment env |
| Add request-size limits | None (default body limits ~100kb) | Explicit `bodyParser`/`rawBody` limit (e.g., 1mb) |
| Review HTTP method behavior | Not set | Decide allowed methods / 405 handling |
| Prod errors must not leak internals | **No global exception filter registered** (`AllExceptionsFilter` exists, unregistered); default Nest responses can leak internals | Register a safe filter or scoped one; envelope LOCKED via D-07 |

**Files affected:** `main.ts`, `src/config/configuration.ts` (+spec), `src/common/filters/all-exceptions.filter.ts` (register via `APP_FILTER`), `.env*`, `docs/ENVIRONMENT.md`.
**Phase 0 deps:** typed config; `AllExceptionsFilter` already authored.
**DB/schema:** none. **API:** error-response envelope change (may affect §2.2 messages accordingly).
**Web:** none (CORS affects future web client).
**Tests:** e2e: preflight reflects allowed origin, disallowed origin rejected; body > limit → 413; disallowed method → 4xx; crafted error does not expose stack; prod-like envelope shape.
**Security:** open-CORS removal, info leak (P1 gate items 7–8).
**Migration/compat:** none (dev-only console SDKs unaffected).
**DoD:** CORS restricted per env, request-size limits exist, prod error responses sanitized (gate items).

### 2.6 P1.6 — Swagger / API documentation exposure

| Item | Current state (evidence) | Gap / work |
|---|---|---|
| Keep Swagger for development | Always on at `/api/docs` (`main.ts:35-36`) | Gate: enable in dev/staging, disable or auth-protect in prod |
| Restrict/disable in production per deployment policy | No gate; `NODE_ENV` not consulted | Config flag (e.g., `SWAGGER_ENABLED` default true + prod-safeguard) or rely on NODE_ENV |
| No sensitive schemas/credentials exposed | Current docs expose DTOs only (no secrets); auth endpoints bearered | Keep regression assertion; verify no example secrets |

**Files affected:** `main.ts`, `configuration.ts` (+spec), `.env*`.
**Phase 0 deps:** config. **DB/API/Web:** none.
**Tests:** e2e: docs reachable in test env; (config) prod-NODE_ENV/docs-flag disables route; grep generated spec for `secret`/passwords.
**Security:** documentation exposure (attack surface).
**DoD:** Swagger policy per env implemented and verified.

### 2.7 P1.7 — Authentication audit logging

**Objective:** Record security-relevant auth events, tenant-aware, no secrets, per frozen spec event semantics.

| Item | Current state (evidence) | Gap / work |
|---|---|---|
| Define auth audit events | Spec D-02: LoginSucceeded, LoginFailed, SessionCreated, SessionRevoked, SessionExpired, PasswordChanged/… | Enumerate Phase-1 subset (login, failed login, session create/revoke/expire, register, refresh-rotate) |
| Record security-relevant auth events | `audit_logs` table exists (`platform.prisma`) but **nothing writes to it** | Writer + events (direct or event-driven — D-08) |
| Never log passwords/tokens | Nothing today (nothing recorded) | Enforce in writer; hash tokens only |
| Tenant-aware audit records | `audit_logs` has `tenantId` (`platform.prisma:37`) | Populate from auth context; assert in tests |

**Files affected:** new `src/audit` or `src/common/audit/audit.service.ts`; `auth.service.ts` + `session.service.ts` emit; `prisma/domains/identity.prisma` or `platform.prisma` (`login_attempts` if chosen here); possibly add `@nestjs/event-emitter` (not currently installed) — **conventions doc §8 targets EventEmitter2**.
**Phase 0 deps:** Prisma schema, typed config.
**DB/schema:** `login_attempts` if not placed under P1.2; `audit_logs` shape matches spec closely (spec adds `actor_email`/`changes` JSON — deviation candidate, §4.3).
**API:** none public.
**Web:** none.
**Tests:** e2e: login success/failure write rows with tenantId+actor, no password/token column; unit: writer redaction.
**Security:** tamper-evident trail (spec ADR-009/010).
**Migration/compat:** additive; append-only contract.
**DoD:** auth events recorded, tenant-scoped, secret-free; audit checks pass.

---

## 3. Readiness classification summary

| Roadmap task | Classification | Reason |
|---|---|---|
| P1.1 Registration security | **BLOCKED** (implementation pending; decisions locked) | Decisions D-01/D-02 locked (invite+allowlist, email verification); implementation not started |
| P1.2 Login protection | **BLOCKED** | Needs new schema (login_attempts/lock), rate-limit redesign (pre-auth no-op today) |
| P1.3 JWT configuration | **READY** (mostly) | Phase 0 completed; only add decision D-04 + regression assertions |
| P1.4 Sessions/refresh | **BLOCKED** | Major schema + service redesign; model decision D-05 required first |
| P1.5 CORS/HTTP security | **PARTIALLY READY** | Simple config items ready; error-filter/envelope needs decision D-07 |
| P1.6 Swagger exposure | **PARTIALLY READY** | Small gate; needs prod-policy flag decision |
| P1.7 Auth audit logging | **BLOCKED** (no writer; event infra absent) | Need event-emitter dependency decision D-08 + login_attempts placement |
| **Phase 1 security gate** | **BLOCKED** | Depends on P1.1/1.2/1.4/1.5 completion + security test suite (none today) |

No Phase-1 task is fully READY end-to-end except P1.3 (which still needs its decisions locked and its gate test added).

---

## 4. Conflicts & spec/repo discrepancies (recorded per roadmap §2.1 — not silently resolved)

1. **Registration model conflict:** Public self-register with arbitrary role (repo) vs **invitation-based onboarding** (spec ADR-016, V-RA-06). Cannot both hold. → D-01.
2. **Email verification vs email service availability:** Spec requires email verification (V-UP-03, `/auth/email/verify`, tokens table), but roadmap Phase 9 owns provider delivery (email/SMS). A Phase-1 email-verification *flow* would need a sender that does not exist. → D-02.
3. **Audit shape divergence:** Repo `audit_logs` = `action/entity/entityId/oldValues/newValues/ip/userAgent/correlationId`; spec = `entity_type/entity_id/action/actor_id/actor_email/changes/context_ip/context_user_agent`. Compatible but the spec's `changes` JSON + `actor_email` are missing (design deviation to approve — spec tables §7.2 audit_logs). → D-08.
4. **Schema not tenant-scoped for RBAC entities:** `Role` is `@@unique([name])` global (`identity.prisma:39`), `Permission` global `@@unique([resource,action])` (`identity.prisma:65`) — spec mandates `(tenant_id, name)` / `(tenant_id, resource, action)` (§7.3) and ADR-003 tenant isolation. Mostly Phase 2, but P1.1 role rules must not rely on global role identity. Flag now; do not fix this phase unless P1.1 requires it.
5. **Tech-stack drift vs frozen spec:** Spec stack = NestJS ^11, Jest ^30, Prisma ^6.12, bcrypt 12 rounds, Swagger ^7, Node ≥22; **repo** = NestJS 10, Jest ^29.7, Prisma 6.19.3 pinned (audit; spec-compatible branch), bcrypt cost **10** (audit §7), Swagger ^7.4 ✓, Node ≥22 ✓. Nest/Jest/bcrypt-cost are spec-vs-repo deviations requiring a decision (do not upgrade mid-Phase-1 without approval).
6. **Response-envelope conflict:** Frozen spec §10.1 defines `{success, data}` / `{success:false, error:{code,message,details[]}}`; Phase 0 `API-ENGINEERING-CONVENTIONS.md` §2/§7 defines raw detail responses + `{statusCode, code, message, correlationId, timestamp}` errors. Both are authoritative documents and they disagree. → D-07.
7. **Rate-limit guard pre-auth no-op** (P1.2) and **hardcoded limits** vs spec "rate limiting on authentication endpoints" + `THROTTLE_*` reserved-but-unused (ENVIRONMENT.md). Requires deliberate keying design.
8. **`/auth/me` returns raw JWT payload** (audit §5f) — not a Phase-1 roadmap item; noted as carry-over (frontend integration Phase 11).

## 5. LOCKED DECISIONS — Phase 1 implementation constraints

> **STATUS: LOCKED / APPROVED — 2026-09-12.** Decisions D-01 through D-09 below are approved and authoritative for Phase 1 implementation; their resolutions were amended and re-confirmed on 2026-09-12 (D-07 list envelope, D-05 `access_token_hash` retention, event-durability deferral, dependency-compatibility flag). They bind every Phase-1 implementation batch (B1–B5) and the final security gate (B6); B0 (pre-implementation gate) is complete. Any change requires re-approval.

| ID | Decision | Locked resolution |
|----|----------|-------------------|
| **D-01** | Registration model | Registration is invitation-driven by default. `AUTH_PUBLIC_REGISTRATION_ROLES` MAY define explicitly approved low-privilege public-registration roles; the default MUST be EMPTY. Public registration must never allow a client to select an arbitrary role. The server derives role assignment from (1) a validated invitation or (2) an explicitly permitted public-registration policy. Privileged/system roles are never publicly self-assignable. Invitation tokens are one-time, expiring, securely stored/hashed, and carry the server-authoritative role assignment. The allowlist must not become an implicit permanent bypass of invitation-only production onboarding. |
| **D-02** | Email verification | Implement verification state, token lifecycle and endpoints in Phase 1 behind a `DeliveryProvider` abstraction. Only a development/log transport is allowed in Phase 1. No third-party email provider before the planned Phase 9 email integration. Unverified users may log in but cannot hold privileged roles or perform operations explicitly requiring verified identity. Seed/dev accounts must have an explicit verification state. |
| **D-03** | Login error semantics | Unknown tenant, unknown user and incorrect password produce the same opaque `HTTP 401 — Invalid credentials`. Rate limiting → `429`. Temporary account lock → `423`. Registration must not reveal whether an email/account exists. Detailed failure reasons remain server-side in `login_attempts`/audit records. |
| **D-04** | Access-token TTL | Access token: 15 minutes. Refresh token: 7 days. Refresh tokens are opaque, single-use, rotated on every successful refresh. All TTLs come from configuration. Remove hardcoded `3600`/1-hour access-token behavior. |
| **D-05** | Session architecture | Database sessions are authoritative; Redis is a cache/index and must never become the source of truth for session validity. Refresh tokens: opaque, cryptographically random, hashed at rest, single-use, rotated on every refresh, atomically rotated; reuse detection revokes the entire affected session and emits an audit event. Logout revokes the current session; logout-all revokes all active sessions. Expired/revoked sessions cannot refresh. Concurrent sessions: default max 5, oldest/inactive revoked when exceeded. Record device/session metadata: user-agent, IP, and the approved hashed device-fingerprint strategy. Rotation must be safe under concurrent requests — two simultaneous refreshes using the same current refresh token must not both succeed. **`access_token_hash`: LOCKED for retention (2026-09-12)** — the frozen Identity specification explicitly includes it (spec §7.2 `sessions`, UNIQUE `(tenant_id, user_id, access_token_hash)` at §7.3); retain the field in the Phase 1 session model unless a formal specification amendment removes it. Generation, at-rest form, and use are documented in §5.1. Do not change the schema yet. |
| **D-06** | Helmet / security headers | Keep Helmet defaults as baseline. Add config/environment-driven HSTS and a minimal CSP/security-header baseline. Configure request-body size limits. Do not over-engineer web-specific CSP/cookie hardening in Phase 1 (web delivery phase). |
| **D-07** | Canonical API envelope | The frozen Identity/API specification is authoritative over earlier engineering-conventions wording. Success: `{ "success": true, "data": { ... } }`. **List (LOCKED, amended 2026-09-12): `{ "success": true, "data": { "items": [...], "total": <number>, "page": <number>, "limit": <number> } }`** — flat pagination fields inside `data`, exactly per frozen spec §10.1. **`data.meta` is NOT part of the canonical API contract** unless the frozen specification is formally amended. Error: `{ "success": false, "error": { "code", "message", "details?", "correlationId?", "timestamp?" } }`. HTTP status codes remain transport-level. `API-ENGINEERING-CONVENTIONS.md` §2/§4 are amended to match (see that file). |
| **D-08** | Security audit / event mechanism | Use `@nestjs/event-emitter` for Phase 1 in-process domain-event dispatch. Auth/session services emit security-relevant events; `AuditService` and `LoginAttemptService` consume and persist appropriate records. Phase 1 security events (minimum): login succeeded, login failed, login locked, registration succeeded, refresh rotated, refresh reuse detected, logout, logout-all, session created, session revoked, session expired, email verification requested, email verified. Audit records are tenant-aware with actor/user, entity, IP, user-agent and correlation context. Never log passwords, raw access tokens or raw refresh tokens. EventEmitter2 is in-process dispatch — NOT durable event sourcing; do not claim guaranteed durable delivery. If a durable outbox/domain-event mechanism is not required by the current Phase 1 specification, defer it rather than adding unnecessary infrastructure. Security audit records are distinct from ordinary application logging (later concern). |
| **D-09** | Login rate limiting | Two security layers. Layer 1: Redis-backed request throttling on authentication endpoints using IP-based and IP+normalized-identifier limits. Layer 2: database-backed failed-login tracking via `login_attempts` keyed by tenant + canonicalized identifier/email. Default max failed attempts: 5 (per specification). Exceeding threshold → temporary lock via `locked_until`. Rate limiting → `429`; temporary account lock → `423`; other auth failures remain opaque `401`. Rate-limit configuration from `THROTTLE_*` config, not hardcoded. Successful auth clears the ACTIVE failure window/lock state but must NOT delete historical `login_attempts` records (kept for audit/forensics). Define and apply canonical email/identifier normalization consistently across registration, login, uniqueness checks, rate limiting and failed-attempt tracking. |

### 5.1 `access_token_hash` — retained field contract (LOCKED 2026-09-12)

Authoritative for Phase-1 `sessions` design. No schema change now; this resolves D-05's field question so it is **not** an implementation-time architectural decision.

- **Why the field exists:** The frozen Identity specification mandates `sessions.access_token_hash` (spec §7.2 `sessions` table; `varchar(255)`) plus UNIQUE `(tenant_id, user_id, access_token_hash)` (§7.3). The field is retained because the frozen specification explicitly includes it — not because a legacy schema happens to carry it. Unless the specification is formally amended, Phase 1 must retain it.
- **How it is generated:** a one-way cryptographic hash of the random opaque access token, computed at session/token issuance (Phase 1 approach: SHA-256 of the raw access token; raw token is never stored).
- **How it is used for session/security validation:** access tokens are short-lived JWTs; `access_token_hash` gives the server a persistent, revocability-enabling record linking a presented access token to its authoritative DB session row, and supports DB↔Redis reconciliation (DB authoritative per D-05). It does not replace refresh-token rotation/reuse detection (that operates on the refresh token).
- **What is stored at rest:** only the hash (`sha256(accessToken)`), never the raw access token, so a DB leak does not expose usable tokens.
- **Uniqueness / revocation / session lookup:** participates in uniqueness via `UNIQUE (tenant_id, user_id, access_token_hash)` and can serve as part of session lookup; revocation of a session is driven by `is_active`/`expires_at` plus refresh-token rotation/reuse detection (D-05), with the hash supporting the DB-authoritative link.

### 5.2 Event durability — deferred requirement, recorded tech debt (LOCKED 2026-09-12)

The approved D-08 deferral is preserved verbatim and recorded as technical debt:

- `@nestjs/event-emitter` (EventEmitter2) = **in-process dispatch only**. No durable-delivery guarantee is claimed.
- `AuditService` and `LoginAttemptService` are the Phase-1 consumers that persist the **security trail**: `audit_logs` and `login_attempts` (both append-only, no soft delete, per spec §7.2).
- This is **NOT durable event sourcing**. The frozen spec's `domain_events` table (§7.1, append-only) and ADR-010 "Event sourcing for audit trail" are **deferred**; no outbox/`domain_events` implementation is introduced in Phase 1. The roadmap "Phase 1 security gate" (roadmap lines 357–370) does not require it.
- **Technical debt / follow-up (tracked):** durable domain-event delivery (`domain_events` table / outbox) — re-evaluate in a later phase; `audit_logs` + `login_attempts` remain the Phase-1 persisted security records until then.

### 5.3 Dependency & version compatibility flag (LOCKED 2026-09-12)

Do **not** upgrade dependencies during Phase 1 merely to match the frozen specification. Each difference is recorded below with whether it blocks Phase 1 and whether the upgrade is a separate task.

| Dependency | Repository (current) | Frozen spec (target) | Blocks Phase 1? | Action |
|---|---|---|---|---|
| NestJS (`@nestjs/*`) | ^10.4.0 | ^11 | **No** | Defer; separate upgrade task after Phase 1 |
| Jest | ^29.7.0 | ^30 | **No** | Defer; separate upgrade task after Phase 1 |
| bcrypt cost | 10 (`saltRounds = 10`) | 12 rounds | **No** | Defer; evaluate cost increase as a separate hardening task (not a direct Phase-1 gate blocker) |
| Prisma | ^6.9.0 (installed 6.19.3) | ^6.12 | **No** | Installed version already ≥ spec floor; none |
| Swagger (`@nestjs/swagger`) | ^7.4.0 | ^7 | **No** | Compatible; none |
| Node | ≥22 | ≥22 | **No** | Compatible; none |

No dependency changes now. Any future upgrade is its own reviewed task outside Phase 1 implementation.

## 6. Batching & execution order (LOCKED structure)

Phase 1 = 7 roadmap tasks (P1.1–P1.7) + the roadmap "Phase 1 security gate" (lines 357–370, required before Phase 2). Batching uses 7 labels (B0–B6) across three roles:

- **B0 — pre-implementation planning/documentation gate** (COMPLETE 2026-09-12): decision lock (§5), scope-review finalization, conventions reconciliation. Not an implementation batch.
- **B1–B5 — implementation batches (5 total):** cover P1.1–P1.7 in dependency order.
- **B6 — final security gate:** proves the roadmap "Phase 1 security gate" + full regression + completion report. Not an implementation batch.

| Batch | Role / Tasks | Rationale | Review gate after |
|---|---|---|---|
| **B0** | Pre-implementation gate — decision lock (§5) + `PHASE_1_SCOPE_REVIEW.md` finalization — **DOCUMENTATION COMPLETE (2026-09-12)** | Freezes contracts before any code | D-01–D-09 LOCKED/APPROVED; awaiting go for B1 |
| **B1** | Implementation batch — P1.3 (JWT), P1.6 (Swagger), P1.5 config subset (CORS, size limits, Helmet) | Smallest risk; mostly config/env; no schema | Unit+e2e pass, typecheck, build |
| **B2** | Implementation batch — P1.1 (Registration security + email-verification tokens) | Next obstacle to proving the security gate; additive schema | Gate item "privileged roles cannot be self-created" + tests |
| **B3** | Implementation batch — P1.2 (Login protection: login_attempts, lockout, auth rate-limit) | Schema disjoint from B2; needed before P1.4 stress | Brute-force + lockout e2e |
| **B4** | Implementation batch — P1.4 (Sessions/refresh redesign, logout, cleanup job) | Biggest; builds on B3 failure handling | Expiry/revocation/multi-device e2e |
| **B5** | Implementation batch — P1.5 remainder (error filter/envelope), P1.7 (audit logging) | Envelope affects error tests; audit consumes B3/B4 events | Audit tests; full suite |
| **B6** | Final security gate — Phase 1 security gate suite + regression + report | Prove gate; completion report; STOP for approval | Full unit+e2e green; gate checklist signed |

Dependency notes: P1.3 independent; P1.1→D-01/D-02; P1.2→schema (informs P1.4); P1.4 most complex, locks step with P1.2 login failures and P1.7 session events; P1.5/P1.6 mostly independent config; P1.7 observes P1.2/P1.4 events. Ordering note: B1 before B2 keeps P1.3/P1.6 independence exploited early; P1.5 error-envelope part deferred to B5 deliberately (it changes response shapes used by B2/B3 tests); P1.7 last as an observer of auth/session events. Each batch ends with review — nothing merged past review (per `docs/GIT-WORKFLOW.md`).

## 7. Required tests per gate (summary)

- **Every batch:** `npm test` (unit) + `npm run test:e2e` green against `openschool_test` (force-reset+seed); `npm run typecheck`; `nest build`; no regression in existing 14 tests.
- **Gate-relevant (roadmap security gate):** privileged-role self-create blocked; login rate-limit 429; lockout after repeated failures + auto-clear; JWT placeholder boot failure (regression assertion); expired/revoked refresh rejection; session DB↔Redis divergence detected; CORS disallowed-origin rejection; request-size 413; sanitized prod error body; auth audit rows written tenant-aware; `swagger` gated in prod-like env.

## 8. Ambiguities — resolved & remaining

**Resolved by LOCKED DECISIONS (D-01–D-09, incl. the 2026-09-12 amendments):**
- Role self-registration policy (invitation vs allowlist) → **D-01**.
- Email-verification flow given no sender until Phase 9 → **D-02** (dev/log delivery only).
- Response/error envelope authority → **D-07** (frozen API spec authoritative).

**List envelope shape → LOCKED**: flat `data:{items,total,page,limit}` per frozen spec §10.1; `data.meta` is not part of the canonical contract (§5 D-07; `API-ENGINEERING-CONVENTIONS.md` §2/§4 amended).
**`access_token_hash` → LOCKED**: retained per frozen spec §7.2/§7.3; generation/use/at-rest contract in §5.1.
**Event durability → LOCKED**: in-process EventEmitter2 only; `domain_events`/outbox and ADR-010 deferred as recorded tech debt (§5.2).
**Dependency/version drift → LOCKED**: no upgrades during Phase 1; compatibility flag in §5.3.

**Remaining (open — not part of D-01–D-09):**
- Session list/revoke **endpoint** scope (spec catalog `GET/DELETE /sessions`) — D-05 mandates logout + logout-all + max-5 concurrency; whether the list/revoke endpoints are also exposed in Phase 1 still to confirm at implementation.
- `audit_logs`/`login_attempts` shape drift vs spec (spec adds `actor_email`, `changes` JSON; repo has no `LoginAttempt`) — Phase-1 schema work (B3/B5) must reconcile against spec §7.2; design decision at implementation, not pre-blocking.

**Non-blocking recorded items (approved, not open):** §4.5 tech-stack drift → §5.3 flag (deferred, no Phase-1 block); `domain_events`/ADR-010 → §5.2 (deferred tech debt); `access_token_hash` → §5.1 (retained); pagination shape → §5 D-07 (locked, flat fields).

---

## 9. Status

Scope extracted, classified, and batched. **Decisions D-01–D-09 LOCKED/APPROVED (2026-09-12), incl. amendments for list envelope (flat `total`/`page`/`limit`), `access_token_hash` retention, event-durability deferral, and dependency-compatibility flag.** Documentation only — no implementation, no source/schema/migration changes, no package installs, no dependency upgrades, no commits. B0 (pre-implementation gate) is complete; B1–B5 and the B6 final security gate await approval to begin.