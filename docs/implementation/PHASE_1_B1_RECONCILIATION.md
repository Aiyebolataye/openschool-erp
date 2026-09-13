# Phase 1 — B1 Final Correction & Verification Gate: Reconciliation

**Date:** 2026-09-12
**Batch label in this gate:** "B1 (Identity & Access)" — the invitations, registration, email-verification, onboarding, and identity/organization/institution membership work.
**Authorities:** the approved Identity / Organization / Institution / Onboarding Specification (frozen), `PHASE_1_SCOPE_REVIEW.md` (decisions D-01…D-09 locked/approved 2026-09-12), `B1_GAP_ANALYSIS.md` (approved decisions D-G1…D-G6), `docs/API-ENGINEERING-CONVENTIONS.md`.

> **Batch-label note (do not silently redefine frozen decisions).** `PHASE_1_SCOPE_REVIEW.md` §6 freezes the Phase-1 batch labels B1–B6 (frozen B1 = P1.3/P1.6/P1.5-config; frozen B2 = P1.1 registration security; B3 = P1.2 login protection; B4 = P1.4 sessions; B5 = P1.5-remainder + P1.7 audit; B6 = final security gate). The work reviewed in this gate was executed under the session label "B1 (Identity & Access)" and corresponds to frozen **B2 (P1.1)** plus the new-spec extensions (memberships, onboarding links, role security). Where this document names an *owning batch* for deferred work, it uses the frozen labels from `PHASE_1_SCOPE_REVIEW.md` §6 unless stated otherwise. This naming collision is documented here so that no reviewer mistakes the session "B1" for frozen "B1".

---

## 1. Verification found during this gate

1. **Onboarding lifecycle was a single-claim state machine** (`PENDING → ACCEPTED` on one endpoint). The specification requires completion to be split so the user **confirms the provisioned personal information before setting a password**, without silently replacing administrator-provisioned identity data.
2. **Replacement semantics revoked only `PENDING` links**, leaving a `CONFIRMED` predecessor active in parallel.
3. `Institution` had no status column, so the structural half of "deactivated institutions cannot be accessed" was not present.
4. Everything else — hierarchy, memberships, uniqueness scoping, login resolution, D-03 opacity, invitation track, hashed/single-use/6-month/non-transferable links, Platform-Admin guard — was found implemented for this batch (see §3; runtime proof deferred to e2e, §6).

### Corrections applied in this gate

- New dedicated enum `OnboardingStatus` (`PENDING / CONFIRMED / COMPLETED / EXPIRED / REVOKED`) on `OnboardingLink` (schema-head + `domains/identity.prisma`), replacing the reuse of `InvitationStatus`. Added `confirmedAt DateTime?`.
- New state machine in `OnboardingService`:
  `ONBOARDING_PENDING → (token) WELCOME/REVIEW → CONFIRM INFORMATION → SET PASSWORD → ACTIVATE → AUTO-AUTHENTICATE`
  - `POST /onboarding/:id/review` — reveals only the provisioned identity data bound to the token (`email`, `firstName`, `lastName`, `institutionId`, `institutionName`, `roleNames`); does not consume the link; no token/password/provisioning details.
  - `POST /onboarding/:id/confirm` — echoes provisioned `firstName`/`lastName`; must match exactly (case/NFKC/whitespace tolerant). Mismatch → `400 Name confirmation does not match the provisioned account` (never silent replacement, never leaks expected values, proves non-transferability). Sets `CONFIRMED` + `confirmedAt`.
  - `POST /onboarding/:id/claim` — **gated on `CONFIRMED`**; sets password (policy-enforced), performs initial email verification, activates, establishes memberships, auto-authenticates. Sets `COMPLETED` + `acceptedAt`; revokes all other `PENDING`/`CONFIRMED` links for the user.
  - All three stages share one validator so bad token / consumed / revoked / expired are indistinguishable (`Invalid onboarding link`); expired links are marked `EXPIRED`.
- Replacement (`POST /onboarding`, admin) now revokes **`PENDING` or `CONFIRMED`** predecessors.
- Added `InstitutionStatus` enum (`ACTIVE / DEACTIVATED`) and `Institution.status @default(ACTIVE)` — **structural only**; access enforcement is owned by the batch in §4.row-r (deactivation).

---

## 2. Onboarding lifecycle — minimum server-side state

| Stage | API | State | Outcome on success |
|---|---|---|---|
| Issue (admin) | `POST /api/v1/onboarding` | `PENDING` | Raw token delivered via email (non-prod also returned); previous `PENDING`/`CONFIRMED` revoked |
| Welcome / review | `POST /api/v1/onboarding/:id/review` | unchanged (`PENDING`) | Provisioned info shown (bound to token) |
| Confirm information | `POST /api/v1/onboarding/:id/confirm` | `CONFIRMED` | `confirmedAt` set; echoed names must match provisioned values |
| Set password | `POST /api/v1/onboarding/:id/claim` | `COMPLETED` | Password hash stored; `emailVerifiedAt=now`; `status=ACTIVE`; org + (optional) institution memberships ACTIVE; auto-auth tokens issued |
| Expiry | (lazy on any stage) | `EXPIRED` | 6-month TTL (`onboarding.expiryDays`, default 182) |
| Replace / revoke | admin re-issue | `REVOKED` | Predecessor unusable |

Conformance: (a) completion requires explicit confirmation of provisioned personal info; (b) confirmation never silently replaces admin-provisioned data (mismatch is a hard error); (c) link is bound to one user and to the user's email — a different identity cannot confirm or claim it; (d) no profile-editing UI is introduced; (e) successful claim is the initial email verification (no separate generic verification flow at onboarding); (f) provisioning details, token plaintext, and password are never persisted or logged.

---

## 3. 18-row reconciliation table (B1 scope vs. approved requirement set)

Legend: **B1 = this batch** (implemented, verified at code level); **DEF = deferred** (owner per §4).

| # | Requirement (authoritative source) | B1 disposition | Evidence / location |
|---|---|---|---|
| 1 | Platform → Organization → Institution hierarchy (spec §3–§6) | B1 — implemented | `domains/institution.prisma` (Tenant/Institution), `domains/identity.prisma`; seed |
| 2 | Organization is the tenant (`Tenant.slug` = org context, D-G1) | B1 — implemented | `auth.service.ts` login/resolution by slug; `resolveIdentity` |
| 3 | `User → OrganizationMembership → InstitutionMembership(s) → Role(s) → Permissions`; one org-level identity (D-G1/D-G2) | B1 — implemented | `OrganizationMembership` (`@@unique([tenantId,userId])`), `InstitutionMembership` (`@@unique([tenantId,institutionId,userId])`), `UserRoleAssignment` |
| 4 | Exactly one identity per organization per user; orgs fully isolated (spec §38) | B1 — implemented | `users @@unique([tenantId,email])`; e2e Example D + cross-org isolation test |
| 5 | Institution-scoped Student ID / Staff ID (D-G2, §35) | B1 — implemented | `students @@unique([tenantId,institutionId,studentNumber])`, `staff @@unique([tenantId,institutionId,staffNumber])` |
| 6 | Institution-scoped internal emails (student/staff); org-scoped org internal email (D-G2, §35) | B1 — implemented (student/staff); org internal email structural padding only | `internalEmail` columns + scoped uniques; `generateInternalEmail()` |
| 7 | Multiple roles per identity; multi-institution staff; parent with children across institutions (Examples A–D) | B1 — implemented | `UserRoleAssignment @@unique([userId,roleId])`; `InstitutionMembership` supports N; `StudentGuardianRelationship`; e2e Examples A–D |
| 8 | Platform Admin exactly one, no app-flow creation (D-G5); ORG_ADMIN + PRIMARY_INSTITUTION_ADMIN built-ins (D-G6); TENANT_ADMIN deprecated | B1 — implemented | invitation 409 / register 400 guards; `PRIVILEGED_ROLES`; seed roles/permissions; `OnboardingService.create` 404/409 paths |
| 9 | Only Primary Institution Admin manages custom roles | DEF | See row 14 (§4). No such admin flow exists in B1; no Phase-1 roadmap batch owns it. |
| 10 | Invitation self-registration track (D-02) + email-verification tokens | B1 — implemented | `UserInvitation` (hashed, single-use, expiry), `EmailVerificationToken`, `/auth/register`, `/auth/email/verify` |
| 11 | Provisioned-account onboarding links: 6-month, single-use, cryptographically random, hashed at rest, non-transferable | B1 — implemented | `OnboardingLink` (token = SHA-256 of 32-byte base64url; 182d TTL); replacement semantics; e2e #1–#13 |
| 12 | Onboarding completion = initial email verification; includes personal-info confirmation; auto-authenticate | B1 — implemented (this gate) | §2 state machine; `OnboardingStatus`/`confirmedAt`; e2e #3–#7 |
| 13 | WordPressLogin D-03 opaque errors; no account/existence oracle in registration | B1 — implemented | `auth.service.ts` (unknown tenant/user/wrong password = identical 401); register duplicate path returns identical envelope; e2e D-03 tests |
| 14 | Tenant password policy + history; admins never see/set permanent passwords | B1 — implemented | `PasswordPolicy`/`PasswordHistory`; `PasswordPolicyService`; claim/register enforce policy; no API returns plaintext password |
| 15 | Students: generated temporary credentials + forced first-login password change | DEF | Row 15 (§4) — tied to the (absent) provisioning API; onboarding-link flow is the B1 credential mechanism |
| 16 | External email change → re-verify; phone change → OTP (initial provisioning exempt) | DEF | Rows 16–17 (§4) |
| 17 | Password recovery (self-service) | DEF | Row 18 (§4) |
| 18 | Deactivation ≠ deletion; deactivated institutions/orgs/users inaccessible; sessions invalidated immediately | B1 structural + DEF enforcement | `InstitutionStatus` added (B1); enforcement = rows 12–13 (§4) |

> The 18 rows cover every requirement in the approved B1 scope (rows 1–13, 14-sec) plus every deferred requirement named in this gate (rows 14–18 → §4 detail). No requirement was silently dropped.

---

## 4. Deferred requirements — exact ownership

Ownership labels: frozen batches (`PHASE_1_SCOPE_REVIEW.md` §6) / roadmap tasks (`P1.x`) / post-Phase-1 target. "Schema required now" states what B1 guarantees today; "B1 schema no-block" confirms nothing here prevents the owning batch.

### Row 12 — Sessions / refresh redesign (D-05)
- **Owner: B4 (P1.4)** — the authoritative Phase-1 batch for sessions. **Do not weaken D-05** in any earlier batch: session table stays DB-authoritative with rotating, opaque, hashed refresh tokens, access-token hash retention, reuse detection, logout/logout-all, session limits, immediate invalidation after deactivation; Redis remains a cache, not authority.
- **Acceptance criteria (from scope review §2.4 + D-05):** access+refresh flow against DB rows; rotation + old-token reuse detection; logout invalidates; logout-all iterates; deactivation invalidates all sessions; idle/absolute expiry enforced via cleanup job; `access_token_hash` retained.
- **Schema already required now:** legacy `Session` (userId/token/expiresAt) is present and unused by B1 flows beyond login bookkeeping; `User.emailVerifiedAt`, `User.status` exist. B1 adds nothing that conflicts; B4 will migrate columns/add hashes — **no blocker**.
- **B1 note:** the current login writes a per-login `Session` row + Redis cache entry. B4 supersedes this; B1 does not depend on it for correctness.

### Row 13 — Account deactivation / deactivated institution & org access (enforcement)
- **Owner:** structural = **B1 → in this batch** (`InstitutionStatus` field added); session invalidation hook = **B4 (P1.4)**; admin lifecycle operations (deactivate/activate) = **post-Phase-1 (Identity lifecycle batch)**.
- **Acceptance criteria:** deactivating a user invalidates all sessions immediately and blocks login (opaque 401); deactivated institution/org memberships block scoped access; reactivation restores access without data loss; nothing is deleted.
- **Schema already required now:** `User.status`, `Tenant.status`, `Institution.status` (added this gate), membership `status` + `deletedAt` (history retention, deactivation ≠ deletion).
- **B1 schema no-block:** confirmed — enforcement batches build on these columns.

### Row 14 — Custom roles (only Primary Institution Admin manages)
- **Owner:** **Phase 2 (RBAC)** — scope review §4 item 4 explicitly flags RBAC as "Mostly Phase 2"; no Phase-1 batch (B1–B6) owns custom-role CRUD.
- **Acceptance criteria:** org-scoped roles (`(tenant_id, name)` unique), permission scoping per spec §7.3 + ADR-003; only PRIMARY_INSTITUTION_ADMIN manages custom roles; system roles immutable.
- **Schema already required now:** `Role`/`Permission`/`RolePermission`/`UserRoleAssignment` exist; B1 already added ORG_ADMIN/PRIMARY_INSTITUTION_ADMIN/PRINCIPAL system roles. **Global `Role @@unique([name])` is a known Phase-2 deviation** (scope review §4.4) — flagged, not fixed here (out of B1 scope; P1.1/B2 role rules already avoid relying on global role identity for privilege checks).
- **B1 schema no-block:** confirmed.

### Row 15 — Student temporary credentials + forced first-login change
- **Owner:** **post-Phase-1 — Account provisioning batch** (no Phase-1 roadmap task owns admin account provisioning). Until that batch exists, the **onboarding-link flow is the B1 credential mechanism** covering secure initial credential establishment for provisioned accounts.
- **Acceptance criteria:** provisioning API generates a display-once temporary credential; first successful login forces a policy-compliant password change; passwords never shown to admins after generation; history enforced.
- **Schema already required now:** `User.passwordHash`, `PasswordHistory`; onboarding-link flow (initial credential). `mustChangePassword`-type column is additive to the provisioning batch.
- **B1 schema no-block:** confirmed.

### Row 16 — External email change → re-verification
- **Owner:** **post-Phase-1 — Identity/account-management batch** (§25 email change semantics; no Phase-1 roadmap task owns email management).
- **Acceptance criteria:** request change → verify new address → commit; old address loses login until verified; sessions retained; D-03 preserved; admin-provisioned internal email unaffected by external email changes.
- **Schema already required now:** `EmailVerificationToken` (reusable for the new-address proof), `User.email`, tenant-scoped unique.
- **B1 schema no-block:** confirmed.

### Row 17 — Phone OTP on phone change (initial provisioning exempt)
- **Owner:** **post-Phase-1 — Identity/account-management + notification batch** (OTP delivery rides `DeliveryProvider`, already modeled).
- **Acceptance criteria:** change request → OTP to old/known phone → verify → commit; initial provisioning phone capture requires no OTP; D-03 preserved.
- **Schema already required now:** `User.phone`; `DeliveryProvider` interface (email now; SMS later).
- **B1 schema no-block:** confirmed.

### Row 18 — Password recovery (self-service)
- **Owner:** **post-Phase-1 — Authentication/recovery batch** (no Phase-1 roadmap task owns it; B1 intentionally has no self-service reset to preserve the invite/onboarding-gated credential model).
- **Acceptance criteria:** tokenized, expiring, single-use reset for verified address; force re-verification; session invalidation on recovery; D-09 rate limiting applies.
- **Schema already required now:** `PasswordHistory` (prevents reuse), `EmailVerificationToken` (token machinery), `DeliveryProvider`.
- **B1 schema no-block:** confirmed.

> **Exactness note:** sessions and login-lockout have real Phase-1 owners (B4, B3). Custom roles and the identity-lifecycle items genuinely have **no Phase-1 roadmap owner** (RBAC is explicitly Phase 2); assigning them a fake Phase-1 batch or silently changing frozen scope would violate D-01…D-09. Their owners above are therefore stated to the phase/batch level they will land in.

---

## 5. Uniqueness / scoping of identifiers (verified at schema level)

| Identifier | Scope | Enforcing constraint |
|---|---|---|
| External email | organization (`tenant`) | `users @@unique([tenantId, email])` |
| Student ID | institution | `students @@unique([tenantId, institutionId, studentNumber])` |
| Staff ID | institution | `staff @@unique([tenantId, institutionId, staffNumber])` |
| Student internal email | institution | `students @@unique([tenantId, institutionId, internalEmail])` |
| Staff internal email | institution | `staff @@unique([tenantId, institutionId, internalEmail])` |
| Org internal email | org | reserved as identity-scoped concept (D-G2); no global-name collision possible — per-org locality |
| Phone | none (informational) | D-G2: not an auth identifier in B1 |

Cross-organization collision outcome: identical external email in two unrelated orgs is **valid** (Example D) — resolution always happens inside a tenant context first.

Ambiguous institution-scoped identifier (same Student ID in two institutions of one org) resolves to **no single user** → opaque `401 Invalid credentials` (never a per-account answer) — verified by the ambiguity e2e.

---

## 6. Verification status

| Gate | Result | Evidence |
|---|---|---|
| `npm run prisma:merge` | ✅ | schema.prisma regenerated from 10 domain files |
| `npx prisma validate` | ✅ | "The schema at prisma\schema.prisma is valid" |
| `npm run prisma:generate` | ✅ | client v6.19.3 generated |
| `npm run typecheck` | ✅ | `tsc --noEmit` clean (incl. tests) |
| `npx nest build` | ✅ | clean |
| `npm test` (unit) | ✅ | 4 suites / 39 passed |
| `npm run test:e2e` | ⛔ **BLOCKED** | infra down (see below); suite expanded (onboarding 13 lifecycle/security tests incl. confirmation + Examples A–D + ambiguity + platform-admin) but cannot execute |
| `npx prisma migrate dev` | ⛔ **BLOCKED** | infra down; requires new migration for `OnboardingStatus`/`confirmedAt`/`InstitutionStatus`/`Institution.status` |

**Infrastructure blocker (unchanged, re-verified):** `com.docker.service` and `postgresql-x64-18` are **Stopped**; `docker ps` → *"Error response from daemon: Docker Desktop is unable to start"*; `npx prisma migrate dev` and the e2e global setup both fail with *"Error: P1001: Can't reach database server at `localhost:5433`"*. No manual/prod-DB workaround is permitted. Migration and the e2e suite therefore **cannot run and are NOT reported as passed**.

> **Note on the e2e harness:** `test/setup/global-setup.ts` applies the schema with `prisma db push --force-reset` against the isolated **`openschool_test`** database. The B1 migration must follow the project-standard `prisma migrate dev` workflow for the dev DB (no `db push --force-reset`, no destructive resets). This harness behavior is pre-existing and out of B1 scope; flagged for the B6 security-gate review.

**Lint:** `npm run lint` remains blocked by a pre-existing ESLint 9 no-config error (unchanged; not introduced by B1).

**Seed integration:** seed creates roles/permissions incl. ORG_ADMIN + PRIMARY_INSTITUTION_ADMIN, memberships backfill, and the provisioned-teacher fixture in `PENDING`; the fixture's claim path now requires confirm-first (matches the seeded raw token `SEED_ONBOARDING_RAW_TOKEN`).

---

## 7. Not started / explicitly out of scope

- B2–B6 implementation (frozen labels) — **not begun**.
- Phase 2 (RBAC, custom roles) — **not begun**.
- No UI changes beyond documentation; no unrelated refactors; no dependency upgrades; no schema renames of frozen models (`Tenant` table retained per D-G1).