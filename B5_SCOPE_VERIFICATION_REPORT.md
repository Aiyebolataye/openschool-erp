# B5 — Scope Verification Report (READ-ONLY planning gate)

**Date:** 2026-09-13
**Status:** SCOPE VERIFIED / **NOT READY** — decisions required before implementation.
**Authority:** User-granted B5 scope-verification authorization (read-only gate). Frozen authorities: `MASTER_SMS_ROADMAP.md` §PHASE 1; `PHASE_1_SCOPE_REVIEW.md` (D-01…D-09 LOCKED 2026-09-12); Identity & Access Engineering spec (frozen); `B1_GAP_ANALYSIS.md` / `docs/implementation/PHASE_1_B1_RECONCILIATION.md`; `B4_SESSIONS_IMPLEMENTATION_REPORT.md`; current source tree (authoritative over any report claim — every statement below was re-verified directly).

---

## 1. Batch identity and authority

**Frozen batch labels** (`PHASE_1_SCOPE_REVIEW.md` §6) are authoritative for P1.x ownership:

| Frozen batch | P1.x ownership | Status of actions to date |
|---|---|---|
| B1 | P1.3 (JWT) + P1.6 (Swagger) + P1.5 config subset (CORS, size limits, Helmet) | **Not executed as a batch.** P1.3 was absorbed by Phase 0 (config validate) + B4 (D-04 TTL); P1.6 and the P1.5 config subset are **unimplemented** (see §3, §18). |
| B2 | P1.1 registration security | Executed under the session label **"B1 (Identity & Access)"** (see `PHASE_1_B1_RECONCILIATION.md`, §Preface) — APPROVED COMPLETE. |
| B3 | P1.2 login protection | **APPROVED COMPLETE** (login_attempts + lockout + pre-auth throttle). |
| B4 | P1.4 sessions/refresh | **APPROVED COMPLETE** (this session tree). |
| **B5** | **P1.5 remainder (error filter/envelope) + P1.7 audit logging** | **This gate — scope verification only. Implementation NOT started.** |
| B6 | Final security gate | **NOT started.** |

**Collision resolved:** the session label "B1 (Identity & Access)" = frozen **B2**. The frozen labels remain authoritative; a work item's presence in a session-labeled report does not re-assign it to a frozen batch. Two consequences verified in the source tree:
1. Frozen **B1** deliverables (P1.6 Swagger gating; P1.5 CORS/size-limits/Helmet-HSTS-CSP per D-06) were **never implemented** — `main.ts` still runs `cors: true`, unconditional Swagger, default `helmet()`, and there is no system config for origins/body limits. These are **NOT** B5's frozen ownership.
2. Frozen **B5 = P1.5 remainder + P1.7** only; B4's in-code comment "B5 (P1.7 audit) owns persistent audit consumers" is consistent with that.

---

## 2. Exact B5 scope

**B5 owns exactly:**
- **P1.5 remainder** — the canonical response/error envelope (D-07), global error filter registration, correlation-ID wiring, and any API-convention conformance needed to make B5's APIs (and existing auth surfaces) conform to the locked contract. *NOT* CORS/origins/body limits/Helmet-HSTS-CSP (frozen B1) and *NOT* Swagger gating (frozen B1/P1.6).
- **P1.7 audit logging** — in-process audit events for the D-08 Phase-1 minimum set; an `AuditService`/consumer that persists tenant-aware, secret-free `audit_logs` rows; optional read-only audit-list API; reconciliation of the `audit_logs` schema with the frozen spec §7.2 (decision-gated); append-only enforcement (decision-gated).

**Explicitly NOT B5:** login_attempts behavior (B3), sessions behavior (B4), CORS/size/Helmet OR elsewhere (frozen B1), Swagger gating (frozen B1/P1.6), MFA, password recovery, phone OTP, custom RBAC (Phase 2), durable outbox/`domain_events` (D-08 §5.2 deferred), audit-log export, audit dashboards, retention jobs.

---

## 3. P1.5 remaining work (classification)

| Item (roadmap P1.5) | Evidence in source | Classification |
|---|---|---|
| Replace `cors:true` with explicit origins | `main.ts:10` `cors: true`; no `corsOrigins` in `configuration.ts` | **Future phase / un-executed frozen-B1 task** — NOT B5 (frozen B1). Needs authorization to absorb (§18, §19). |
| Per-env origins | none | Same. |
| Review Helmet + define production headers (HSTS/CSP) | `main.ts:15` default `helmet()`; no D-06 config | Same (D-06 locked but unimplemented). |
| Request-size limits | none (no bodyParser limit anywhere) | Same. |
| HTTP method behavior | not set | Same. |
| Prod errors must not leak internals | `AllExceptionsFilter` exists (`common/filters/all-exceptions.filter.ts`) but is **unregistered** (no `APP_FILTER`) | **B5 required** — P1.5 remainder. |
| Canonical error envelope `{success:false, error:{code,message,details?,correlationId?,timestamp?}}` | Filter currently outputs legacy `{statusCode, message, errors, timestamp}`; 401/423/429 objects leak `{statusCode, message, retryAfter}` via `HttpException` body (`auth.service.ts:119-125`; `login-throttle.guard.ts:83-89`) | **B5 required** (D-07). Existing e2e assertions on legacy shapes (`login-protection.e2e-spec.ts` `.statusCode/.retryAfter`, `identity-b1.e2e-spec.ts` `.errors/.message`) must be re-expressed against the new contract (§15). Decision: D-07 has no `retryAfter` field → map into `error.details` or `Retry-After` header (§20). |
| Canonical success envelope `{success:true, data}` / list `{success:true, data:{items,total,page,limit}}` | Conformant: register, sessions, invitations, onboarding. **Non-conformant (raw): `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`** (`auth.controller.ts:19-62` return unwrapped; tests assert `.body.accessToken`, `.body.sub`) | **B5 required** — wrap these in the D-07 envelope (§20 decision: uniform application confirmed by D-07). |
| Correlation IDs | `common/interceptors/correlation-id.interceptor.ts` exists (`correlationStorage = AsyncLocalStorage`), but **unregistered** (no `APP_INTERCEPTOR`); no response header today; D-07 error `correlationId?` cannot be populated | **B5 required** — register interceptor; thread correlationId into audit rows (audit column already exists). |
| Timestamps | D-07 error `timestamp?` not present in current error bodies | **B5 required** (with filter). |
| Pagination | invitations list already uses flat `items/total/page/limit` (verified e2e `meta` undefined). No pagination helper module | Future/optional for B5 IF audit-list API is added (§10 decision); reuse flat envelope only. |
| Swagger/OpenAPI bullets | always-on (`main.ts:36`) | Future (frozen B1/P1.6); Swagger DTO annotations for new audit endpoints are B5 conformance work. |

**P1.3 residue:** implementation complete (boot fails on weak/missing secret; D-04 TTLs config-driven). Only "secrets never appear in responses/logs" regression assertion is absent. **Classification:** already complete at implementation; add a P1 regression assertion in B6 (or B5's test pass). Not B5 work.

**D-06/D-07 residue under B5:** only D-07 (envelope) — D-06 is future.

---

## 4. P1.7 audit scope

Frozen spec references (Identity & Access Engineering.md):
- **Business rule (§Audit Logging):** every state-changing operation → append-only entry with `entity_type, entity_id, action, actor_id, actor_email, changes (json diff), context_ip, context_user_agent, timestamp`.
- **Table §7.2 audit_logs:** `entity_type varchar(100)`, `entity_id uuid`, `action varchar(100)`, `actor_id uuid?`, `actor_email varchar(255)?`, `changes json?`, `context_ip inet?`, `context_user_agent text?`, `created_at` — *"Append-only; no soft delete."*
- **Indexes §7.4:** `(entity_type, entity_id)`, `(actor_id)`, `(created_at)` (scope review adds tenant scoping required by I/S-§7.3 and D-08).
- **Invariants:** I-27 "Audit logs are append-only — **Database constraint**"; ADR-009 immutable append-only; ADR-010 event sourcing for audit trail (**deferred** per D-08 §5.2).
- **API §10.3:** `GET /api/v1/audit-logs` (list) `identity:audit_log:list`; `GET /api/v1/audit-logs/:id` (read) `identity:audit_log:read` — read-only queries (AuditModule).
- **Consumers §9.6:** AuditLogConsumer = "All state-change events → create audit log entry".
- **D-08 (locked) Phase-1 minimum event set:** login succeeded, login failed, login locked, registration succeeded, refresh rotated, refresh reuse detected, logout, logout-all, session created, session revoked, session expired, email verification requested, email verified. Audit records: tenant-aware with actor/user, entity, IP, user-agent, correlation context. **Never log passwords, raw access or refresh tokens.** In-process EventEmitter2 only; no durable outbox (deferred, recorded tech debt §5.2).

---

## 5. Current implementation state (re-verified in source, not inferred)

| Item | Exists? | Evidence |
|---|---|---|
| EventEmitter2 installed | ✅ | `@nestjs/event-emitter ^2.1.1` (`package.json`); `EventEmitterModule.forRoot({wildcard:true})` in `app.module.ts:24` |
| Event definitions | ⚠️ partial | `SessionEvents` (7) in `session.events.ts`. **No auth/registration/email events exist** |
| Event producers | ⚠️ partial | `session.service.ts` emits all 7 session events **after** DB commit (verified at emit sites). `auth.service.ts`/`register`/`verifyEmail`/`requestVerificationEmail` emit **nothing** |
| Event consumers | ❌ none | no `@OnEvent`/consumer anywhere |
| AuditService / AuditModule | ❌ none | no file, no provider |
| Audit controller / DTOs | ❌ none | spec §10.3 endpoints absent |
| `AuditLog` Prisma model | ✅ exists, **unused** | `platform.prisma:35-55` (`@@map audit_logs`), 6 indexes incl. tenant indexes, merged into `schema.prisma`; nothing writes to it |
| `LoginAttempt` Prisma model | ✅ (B3) append-only, active | `identity.prisma:174-190` |
| Repair migration history | ✅ | 4 migrations applied; last = `20260913100000_b4_sessions_refresh_tokens` |
| Config (`configuration.ts`) | ✅ | Jwt/Throttle/LoginProtection/Session/Auth/Invitation/Onboarding/Verification groups; **no audit config** |
| Response helpers / interceptors | ⚠️ | `AllExceptionsFilter` + `CorrelationIdInterceptor` authored but **both unregistered**; no success-envelope interceptor |
| Correlation ID infra | ⚠️ | `correlationStorage` AsyncLocalStorage exists; unregistered |
| Error handling | ⚠️ | legacy filter unregistered; HttpException-object bodies leak `{statusCode,message,...}` |
| Authorization guards | ✅ | `JwtAuthGuard(AuthGuard('jwt'))` (session-aware strategy returns `sub/tenantId/institutionId/roles/permissions/sessionId`), `PermissionGuard` + `@Permissions()`, `TenantGuard`, `LoginThrottleGuard`, self-scoped session controller |
| Audit permissions seeded | ❌ | seed has `identity:invitation:*` + `identity:onboarding:create`; **no `identity:audit_log:*`** |
| Tests | ✅ | 65 unit (5 suites) + 86 e2e (4 suites) green (B4 report), incl. legacy error-shape assertions that B5's envelope changes (conformance, not weakening) |

---

## 6. Event producer → consumer → persistence matrix (target for B5)

### Producers to add in B5 (in `auth.service.ts` / an `auth.events.ts`), emitted AFTER the relevant DB write/transaction (D-08; pattern parity with B4)

| Event | Producer (code) | Playload required (IDs/metadata only) | Consumer |
|---|---|---|---|
| `LoginSucceeded` | `auth.login` success path | tenantId, userId, email(canonical), ipAddress, userAgent | AuditLogConsumer |
| `LoginFailed` | `auth.login` each failure (unknown-identity / invalid-password / verification-required) | tenantId, userId?, email(canonical), failureReason, ipAddress, userAgent | AuditLogConsumer |
| `LoginLocked` | `auth.login` 423 path; also when `evaluateLock` sets the lock (single event, see §19 event-scope) | tenantId, userId, email, retryAfterSeconds, ipAddress, userAgent | AuditLogConsumer |
| `RegistrationSucceeded` | `auth.register` only on actual account creation (NOT on the D-03 duplicate-masking branch — no account exists) | tenantId, userId, email | AuditLogConsumer |
| `EmailVerificationRequested` | `auth.requestVerificationEmail` (after token issued) | tenantId, userId | AuditLogConsumer |
| `EmailVerified` | `auth.verifyEmail` (after transaction) | tenantId, userId | AuditLogConsumer |

### Producers already in place (B4), consumed by B5

| Event | Producer | Persistence |
|---|---|---|
| `SessionCreated`, `SessionExpired` | `session.service` (after commit) | AuditLogConsumer → `audit_logs` |
| `RefreshRotated`, `RefreshReuseDetected` | `session.service.rotate` (after commit) | AuditLogConsumer → `audit_logs` (reuse ⇒ also `SessionRevoked`) |
| `SessionRevoked` (limit-exceeded / revoke-one / revoke-all / deactivation / reuse-cascade / logout) | `session.service` | AuditLogConsumer → `audit_logs` |
| `SessionLogout`, `SessionLogoutAll` | `session.service` | AuditLogConsumer → `audit_logs` |

### Explicitly verify (based on D-08 minimum set)

- Invitation events (`InvitationCreated/Accepted/Revoked`) and onboarding events: **NOT in the D-08 Phase-1 minimum list**. Spec §5.2 lists them as domain events; invitation consumers (EmailConsumer) are future. **Recommendation:** do not implement in B5 unless the frozen Phase-1 gate is interpreted to include them → flag as decision (§20, low-risk option: defer, matching D-08's explicit minimum).
- Password/MFA events (`PasswordChanged`, `MFAToggled`, `UserSoftDeleted`): **out of Phase-1 scope** (no flows exist; post-Phase-1 batches).

### Transport semantics (D-08 / §5.2, locked)

EventEmitter2 = **in-process dispatch only**; NOT durable, NOT event sourcing, no outbox. Audit write is a separate Postgres insert performed by the consumer (or extension: see failure semantics §20), **after** the business transaction that emitted the event. No `domain_events` table is introduced. Event names follow `{Entity}{PastTenseVerb}`; payloads carry only IDs + non-secret metadata; **no raw tokens, token hashes, or secrets** (B4 payload shape `SessionEventPayload` is the template; add correlationId to it for B5).

---

## 7. Audit schema requirements

Current `AuditLog` (`platform.prisma`) vs frozen spec §7.2 — divergence to reconcile (decision, §20):

| Spec §7.2 | Current repo model | Delta |
|---|---|---|
| `entity_type varchar(100)` | `entity String` | compatible (name) |
| `entity_id uuid` | `entityId String? @db.Uuid` | compatible (nullability) |
| `action varchar(100)` | `action String` | ✅ |
| `actor_id uuid?` | `userId String?` (`actor` semantics) | rename/alias decision |
| `actor_email varchar(255)?` | missing | **add** (spec) |
| `changes json?` | `oldValues/newValues String?` | **reconcile** (spec `changes json`), or keep + add `changes` |
| `context_ip inet?` | `ipAddress String?` (`@db.VarChar(45)` — not `inet`) | reconcile type or accept varchar |
| `context_user_agent text?` | `userAgent String?` | ✅ semantic |
| `created_at` immutable | `createdAt DateTime @default(now())` | ✅ |
| tenant scoping | `tenantId String?` + 3 tenant indexes (`(tenantId,entity,entityId)`, `(tenantId,userId)`, `(tenantId,createdAt)`) | ✅ (B5 should add spec index `(actor_id)` and consider `(created_at)`) |
| — | `correlationId String?` | keep (D-08 correlation context) |
| — | `entity`/`entityId` relational FKs | none currently — acceptable (audit references are soft; no FK to entity tables) |

Recommended B5 additive migration: add `actorEmail`, `changes` (Json), rename `userId→actorId` (or alias via field), widen `ipAddress` to `@db.Inet` or keep varchar, add `actorId`/`createdAt` indexes. **Additive/safe** (empty table; pre-release). Verified the current table is empty and unused ⇒ a **non-destructive additive migration** is achievable (add nullable/backfill-null columns; no data loss). `tenantId` FK currently `ON DELETE SET NULL` — with enforcement debates (immutability §9) consider removing the FK to preserve rows, or keep; decision.

---

## 8. Tenant / organization / institution attribution

- **Tenant boundary = Organization** (`Tenant` table is the organization; D-G1, B1 reconciliation §5). Every audit row must carry `tenantId` from the event payload (B4 events already carry `tenantId`; B5 auth events must too).
- **Actor:** `actorId` = the authenticated user id for logged-in flows; for login/register/auth events the actor is the attempting user when the identity resolved (else null + canonical `email`). `actorEmail` mirrors the canonical identifier (spec field) — nullable for unknown-identity attempts. **No raw credentials in actor fields.**
- **Institution:** NOT a first-class audit row column (spec §7.2 has none). Institution context lives in entity identity (e.g., `entity=institution`, `entityId=<id>`) or, where useful, in `changes` metadata. Multi-institution memberships: audit is org-scoped — a user's actions are recorded once per org (their tenant); institution is descriptive, never a boundary. Do NOT invent an institution column the spec doesn't define.
- **System actions** (cleanup worker, sweep): no actor ⇒ `actorId`/`actorEmail` null, `tenantId` still set (tenant-aware worker), action `SessionExpired` etc. Platform-level rows (should any exist in Phase 1): `tenantId` null; must be written only from a real platform context (no such flow in B5 scope).
- **Cross-org isolation:** queries must filter on caller's tenant by construction + permission gate; same-email-across-orgs rows are only ever visible within their own tenant. Parent/student/staff all reduce to org-scoped user rows — no special casing.

---

## 9. Audit immutability requirements

- Frozen spec: ADR-009 (immutable append-only), I-27 "**Database constraint**", §7.2 "Append-only; no soft delete."
- Repo precedent: `LoginAttempt` (B3) and `RefreshTokenHistory` (B4) are append-only by **application convention only** — no DB trigger/rule/revoke prevents UPDATE/DELETE by a direct SQL client.
- **Blocker/flags (per the instruction, not silently choosing):**
  1. B5 should implement **application-level** append-only in the AuditService (only create; Prisma client pattern excludes update/delete), AND
  2. The spec's I-27 wording ("Database constraint") exceeds what the current architecture provides. Implementing true DB-level enforcement (BEFORE UPDATE/DELETE trigger raising, or column-level `REVOKE UPDATE/DELETE` in the migration) is a **decision**: adopt repo precedent (app-level only, like B3/B4) or add a DB trigger. Recommend app-level for Phase 1 to match B3/B4 precedent, flagging DB-level as a hardening TODO — **requires user decision** (§20).
- **Retention:** DB-architecture doc references 7-year/archive policy; **no Phase-1 requirement** — out of scope, noted only.

---

## 10. Audit API requirements

- Spec §10.3: `GET /audit-logs` (`identity:audit_log:list`) and `GET /audit-logs/:id` (`identity:audit_log:read`), read-only.
- **Decision required (§20): include the audit-list API in B5?** The roadmap P1.7 lists only "define events / record events / no tokens / tenant-aware" — no read API. The frozen spec §10.3 does define it (AuditModule "audit log querying"). Two readings: (a) B5 implements the read API to satisfy §10.3; (b) read API is future (only persistence is Phase-1). Flag for authorization. If included: flat D-07 list envelope, `page/limit` (max 100) per §10.2, filters = actor, action, entity/entityType, entityId, date range, tenant-scoped by construction.
- **Who may access (no custom RBAC):** reuse the existing `PermissionGuard` + `@Permissions()` pattern (as invitations/onboarding do). Seed `identity:audit_log:list/read` and grant to privileged admin roles. Decide the grant matrix (§20): recommendation = `PLATFORM_ADMIN`/`ORG_ADMIN`/`PRIMARY_INSTITUTION_ADMIN`/`PRINCIPAL`/`INSTITUTION_ADMIN` (parity with existing invitation/onboarding grants). Cross-tenant browsing (platform) not in Phase 1; every query constrained to caller's `tenantId`.

---

## 11. Security requirements (B5 gate items)

1. **Tenant isolation** — all reads/writes carry `tenantId`; never returned cross-tenant (§8).
2. **Tamper resistance** — append-only (§9); no update/delete path; audit rows never reflect raw values of sensitive columns.
3. **Actor attribution** — `actorId`/`actorEmail` from resolved identity; null for system/unknown.
4. **Privileged-action logging** — registration succeeds, login locked, session revoke/reuse/expire are logged even though their actors are partially known.
5. **Sensitive-data sanitization** — redaction unit-tested: email is canonical but **not** a credential; never persist passwords, raw access/refresh tokens, token hashes, JWT, verification/invitation/onboarding tokens (payloads are IDs/metadata only — B4 pattern; audit writer must assert no such fields).
6. **Enumeration resistance** — audit never changes login/registration response semantics (D-03 preserved); failures still opaque 401; `LoginFailed` audit rows carry `failureReason` server-side only.
7. **Authorization** — audit-list gated by `identity:audit_log:*` + tenant scope; no unauthenticated access.
8. **Pagination/query abuse** — `limit` ≤ 100; tenant filter mandatory.
9. **Correlation IDs** — `correlationId` propagated into audit rows; `X-Correlation-ID` response header set by the (newly registered) interceptor.
10. **IP/user-agent** — from request (B4/B3 already capture; reuse), not client-supplied.
11. **Append-only guarantees** — enforced by service + optional DB constraint (decision).
12. **Consumer failure** — audit write must not leak secrets on error and must not violate D-03 semantics (decision on swallow-vs-throw, §20).

---

## 12. Configuration requirements

- New `AuditConfig` group in `configuration.ts` (validation + spec tests): recommended fields only where genuinely config-driven:
  - `audit.actorEmailCapture` (bool) — whether `actorEmail`/attempt email is persisted (PII/canonical identifier) **if** spec field is adopted; default true (spec requires the column).
  - No new env required for persistence itself; EventEmitter wildcard already on.
- Confirm: no audit-related env is introduced for access/modes except the above; keep `validateEnv` extended + `configuration.spec.ts` cases. (Options can be reduced to zero-required-env to avoid ops burden — decision.)

---

## 13. Migration requirements (NOT created — additive/safe plan only)

Single new additive migration, `2026…_b5_audit_logs_reconcile` scoped to `audit_logs` (table currently empty; dev + test recreated per harness):
- Add columns (nullable, no backfill needed): `actor_email varchar(255)`, `changes json`, index additions `(actor_id)` and `(created_at)`; optional `actor_id` renames.
- No enforcement on FKs/immutability in code unless the DB-trigger option (§9) is chosen — a trigger is additive SQL in the same migration but should only be added after the §9 decision.
- Additive-safe verified: table empty, indexes additive, no data migration, no destructive ops, no tenant-key changes.

---

## 14. Dependency requirements

- **Required for B5: none new.** `@nestjs/event-emitter ^2.1.1` already installed and ForRoot-registered (D-08 dependency satisfied); Prisma Client covers the model; Nest guards/interceptors/filters are in-framework.
- Frozen spec flags (§5.3): no upgrades during Phase 1 (Nest 10, Jest 29, bcrypt cost 10) — B5 does not touch any.

---

## 15. Required B5 acceptance tests

### Audit persistence
- event → `audit_logs` row (per event type), correct tenant + actor + entity/entityId + action + timestamp.
- correlationId captured from request → row; auto-generated when absent.
- metadata sanitization: payload contains no password/raw tokens/hashes (unit + e2e assertion over written columns).
- append-only: service has no update/delete; (if DB trigger chosen) UPDATE/DELETE from raw SQL raises.
- duplicate/retry: rotation emits `RefreshRotated` once per winner; concurrent double-refresh yields exactly one rotated row + reuse row (B4 test parity); consumer ignores/coalesces duplicates as designed.
- consumer failure behavior: audit-write failure does not alter auth/session outcome (aligned with chosen semantics).

### Session audit
- each of the 7 B4 events writes the correct action (e.g., `SessionCreated`, `RefreshRotated`, `RefreshReuseDetected`, `SessionRevoked` reason variants, `SessionExpired`, `SessionLogout`, `SessionLogoutAll`) with tenant/actor/ip/UA.

### Authentication audit
- LoginSucceeded / LoginFailed (each reason) / LoginLocked / RegistrationSucceeded / EmailVerificationRequested / EmailVerified write rows; **B3 login-protection semantics unchanged** (`login_attempts` writes, lockout thresholds, 423/429/401 codes preserved post-envelope).

### Tenant isolation
- org A user cannot read org B rows (audit-list scoped); same-identifier-across-orgs rows isolated.

### Authorization
- only roles granted `identity:audit_log:list/read` can read; anonymous/student → 401/403.

### API contract
- all B5 endpoints + re-exposed auth/session surfaces use D-07 envelopes; error filter returns `{success:false,error:{code,message,details?,correlationId?,timestamp?}}`; list uses flat `items/total/page/limit`; **no `data.meta` anywhere**.

### Regression (no weakening)
- All existing suites stay green: B1 (identity-b1, invitations/onboarding/membership), B3 (login-protection), B4 (sessions). Expectation: **test *expression* updates** are required where legacy error shapes were asserted (`.statusCode/.message/.errors/.retryAfter`) because the D-07 contract — B5's own mandate — changes the body; the underlying security behaviors (opaque 401, 423 lock, 429, append-only) are preserved and re-asserted under the new envelope. Envelope-vs-behavior distinction must be explicit in the review.
- `npm test`, `npm run typecheck`, `nest build`, `npm run test:e2e`, `prisma migrate status` all green.

---

## 16. B4 dependencies

- B4 event payloads (`SessionEventPayload`: sessionId/tenantId/userId/ipAddress/userAgent/reason/emittedAt) are directly consumable; add `correlationId` to the payload to enable correlation propagation (small B4-adjacent change, additive, no behavior change).
- Access-key/test-helper parity: e2e `loginAs`/`freshUser` helpers reusable. Session use counts must be excluded so audit-list tests don't collide across suites (B4 parallel-worker lessons: use fresh users for count-sensitive audit assertions).
- B4 events are emitted **after** commit — B5 consumer ordering (per-event, no duplication) depends on this; document that a single session reuse produces both `RefreshReuseDetected` **and** `SessionRevoked`.

---

## 17. B3 dependencies

- `LoginAttempt`/lockout remain B3-owned and untouched. B5 does **not** write `login_attempts`; does **not** add `actor_email` to it (prompt: login attempts are a separate security table, not audit records; no B5 field changes).
- B3's direct calls into `LoginAttemptsService` stay in place (no event-reactor duplication). B5 only adds **parallel** `AuditLog` writes via events for login failures — the two records serve different purposes (security throttling/lock vs. immutable audit trail) and are deliberately not unified.
- Envelope change touches B3's 401/423/429 bodies (see §15 regression note); behaviors (D-09 thresholds) untouched.

---

## 18. B5 exclusions

- CORS explicit origins, per-env origins, request-size limits, Helmet HSTS/CSP config, HTTP-method policy → **frozen B1, un-executed** (NOT B5). **This is a Phase-1 gate risk:** roadmap "security gate" checklist includes "CORS restricted" + "Request-size limits exist" (lines 367–368), so the work must land somewhere before B6. Flagged for authorization (§20).
- Swagger gating (P1.6, frozen B1) — excluded; Swagger *annotations* for new endpoints are B5 conformance.
- Custom RBAC, role matrix, permission model expansion (Phase 2) — the `identity:audit_log:*` seed uses existing `PermissionGuard`, not new RBAC.
- Durable outbox / `domain_events` / ADR-010 event sourcing — deferred tech debt (§5.2), not introduced.
- MFA, password recovery, phone OTP, delegation, permission groups, API keys.
- Audit export/retention job/analytics.

---

## 19. Contradictions / conflicts

| # | Source | Conflicting requirement | Likely interpretation | Resolvable by locked decisions? | Authorization needed? |
|---|---|---|---|---|---|
| 1 | Frozen B1 vs executed batches | Frozen B1 (P1.3+P1.6+P1.5-config) was **never run**; session-labeled "B1" was frozen B2 | Frozen labels remain authoritative; P1.6/P1.5-config genuinely unimplemented | No — D-01…D-09 don't cover batch execution order | **Yes** — assign frozen-B1 remainder to B5 (recommended: B5 pre-step), or to B6-first, or a dedicated mini-batch (§20) |
| 2 | D-07 envelope vs existing tests | New error/success envelope changes bodies asserted by green B1/B3/B4 tests (`.statusCode/.errors/.message/.retryAfter`) | Test conformance to the mandated contract — not a reduction | Yes — D-07 locked; test-expression updates are implementation consequence | No (implementation-time) — but confirm the `retryAfter` mapping (§20 #5) |
| 3 | D-07 error schema vs 423/429 `retryAfter` | D-07 `error` has `code/message/details?/correlationId?/timestamp?` — no retryAfter | Move retry hint into `error.details` (or `Retry-After` header) | Partially — D-07 locked; placement of extra hint undefined | **Yes** (small) — approve details-vs-header mapping |
| 4 | Spec §7.2 audit_logs vs repo model | Spec: actor_email, changes json, inet; repo: userId, old/newValues, varchar ip, extra correlationId | Reconcile additively (add fields + indexes), keep repo extras | No — scope-review §8 left audit shape as an implementation-time decision | **Yes** — approve reconciliation approach |
| 5 | I-27 "Database constraint" vs architecture | Spec wants DB-level append-only; repo only application-level (B3/B4 precedent) | Flag, don't silently choose | No | **Yes** — app-level-only (parity) vs add DB trigger |
| 6 | Spec §10.3 audit read API vs roadmap P1.7 | Roadmap P1.7 mentions only recording; spec defines list/read | Either wire read API now (with permissions) or defer | No | **Yes** — include audit-list API in B5? |
| 7 | D-08 min event set vs spec §5.2 domain events | D-08 list omits invitation/registration-side events that §5.2 catalogs | D-08 is authoritative for the Phase-1 minimum; extras (invitation/onboarding) defer | Yes — D-08 supersedes for Phase 1 | No (defer by default; flag if user wants them) |
| 8 | LoginAttempts vs audit | Both record login failures; B3 table is a separate security table | Parallel records, distinct purposes, no duplication of write logic | Yes — D-08 names both consumers | No |

---

## 20. Decisions required before implementation

1. **Frozen-B1 remainder absorption** — P1.6 (Swagger gate) + P1.5-config subset (CORS origins, body-size limit, Helmet HSTS/CSP per D-06): fold into B5 (pre-step), defer to B6-first, or a dedicated batch? (Required for the roadmap "security gate" checklist to pass.)
2. **`audit_logs` reconciliation** — approve desired columns: add `actorEmail` (varchar 255), `changes` (Json), `actorId` (rename/alias of `userId`), index `(actorId)` + `(createdAt)`; keep repo `entity/entityId/ipAddress/userAgent/correlationId`; ip stays varchar vs migrate to `inet`.
3. **Immutability enforcement** — app-level only (B3/B4 parity) vs DB trigger (I-27 wording); retention policy binding (if any) or none in Phase 1.
4. **Audit read API in B5?** — implement `GET /audit-logs` + `GET /audit-logs/:id` (`identity:audit_log:list/read` seeded; grant set: recommended PLATFORM_ADMIN/ORG_ADMIN/PRIMARY_INSTITUTION_ADMIN/INSTITUTION_ADMIN/PRINCIPAL) or defer the API (only persistence in B5).
5. **`retryAfter` mapping under D-07** — into `error.details` vs `Retry-After` header (423/429).
6. **Envelope scope uniformity** — confirm `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me` move under `{success, data}` (D-07 applies uniformly) so the affected tests are re-expressed, not weakened.
7. **Consumer failure semantics** — audit-write failure: log-and-continue (recommended; preserves D-03/auth behavior) vs propagate.
8. **correlationId in event payloads** — approve adding `correlationId?` to `SessionEventPayload` + auth events (additive; enables row-level correlation).
9. **LoginLocked event scope** — emit on the 423 rejection only (recommended) or also on `evaluateLock` threshold write (potential double-log).
10. **actor_email capture** — approve persisting canonical identifier as `actorEmail` for login-failure rows (spec field), noting it is PII-ish but spec-mandated and already recorded in `login_attempts`.

---

## 21. Readiness verdict

**B5 NOT READY — decisions required before implementation.**

Scope is fully delineated: B5 = P1.5 remainder (D-07 filter/envelope + correlation-ID wiring) + P1.7 audit (D-08 events, AuditService/consumer, permission-gated read API if approved, `audit_logs` reconcile, append-only). No new dependencies, additive/safe single migration plan, explicit event matrix, and a test plan that preserves every existing security behavior while conforming assertions to the locked contract.

Blocking unresolved items: decisions 1 (frozen-B1 remainder), 2 (schema reconciliation), 3 (immutability level), 4 (audit API), 5 (retryAfter mapping), and 6 (envelope uniformity) must be authorized before implementation. Decisions 7–10 can be recommended defaults taken at implementation.

B6 has not been started. No source, schema, migration, config, test, or database changes were made by this gate.

---

*Deliverable of the read-only B5 scope-verification gate. All repository assertions were re-verified against the current tree; no inferences from prior reports were substituted for inspection.*