# B1 Gap Analysis & Corrected Implementation Plan

**Title:** SMS Identity, Organization, Institution & Onboarding — B1 reconciliation gate
**Status:** DRAFT FOR APPROVAL — no implementation performed
**Baseline spec:** "SMS Identity, Organization, Institution & Onboarding" (Proposed for freeze)
**Existing implementation:** B1 (Invitations, Registration, Email Verification, Delivery, Permissions) — built to the *earlier* frozen Identity & Access Engineering spec + D-01…D-09
**Method:** Current B1 → compare against this spec → KEEP / MODIFY / REMOVE / ADD / DEFER → architecture & migration impact → corrected B1 plan → **user approval** → only then code.

> STOP rule: document only. No source/schema/config/test changes, no installs, no commits until the user approves.

---

## 1. Current B1 implementation (factual summary)

- **Identity root:** `User` is the only identity entity, scoped to `tenantId`, unique `(tenantId, email)`. Optional **singleton** bindings: `staff?`, `student?`, `guardian?` (one user → at most one of each).
- **Tenant hierarchy today:** `Tenant` (slug, e.g. `greenfield-academy`) → `Institution` (one or more). `Tenant` behaves as the login/uniqueness/authorization boundary. Roles are **global** (`Role @unique([name])`).
- **Staff/Student:** `Student.studentNumber` unique per tenant (org-scoped); `Staff.staffNumber` unique per tenant (org-scoped); both carry `institutionId` and `userId @unique`. No separate membership entities.
- **Guardian (parent):** org-scoped record, no institution column; relationships via `StudentGuardianRelationship` per student.
- **B1 additions (this batch):** `UserInvitation` (7-day expiry, hashed, single-use, role-optional), `EmailVerificationToken` (issued on registration + `/email/verification-request`), `PasswordPolicy`, `PasswordHistory`, `User.emailVerifiedAt`, `identity:invitation:*` permissions, `DeliveryProvider` (dev/no-op), invitation CRUD + public claim-check, privilege-gated invitation management, invitation-driven registration (D-01), D-02 privileged-unverified login gate, D-03 registration enumeration fix (identical success envelope).
- **Auth today:** login by `email + tenantSlug`; register consumes an invitation; no student-ID/school-email/phone login; `login` still returns a distinct `401 'Invalid tenant'` (registered B3 debt); sessions are the legacy single-row model (untouched by B1).

---

## 2. Specification comparison — §37 reconciliation table

Verdict legend: **KEEP** = conforms, retain; **MODIFY** = exists but must change; **REMOVE** = drop/retire; **ADD** = new capability required; **DEFER** = required by spec but not in this batch (explicitly scheduled).

| # | Spec requirement | Current B1 | Verdict | Gap / required change |
|---|---|---|---|---|
| 1 | `EmailVerificationToken` | Issued at registration + verification-request | **MODIFY** | Spec §24: no *generic* verification token for initial onboarding — the onboarding claim **is** the initial verification. Keep the table for §25 (external email change) + re-verification/recovery. Registration must stop issuing a separate token; set `emailVerifiedAt` on onboarding claim instead. |
| 2 | Invitation model | `UserInvitation` (tenant-scoped, 7d, roleId?, hashed, single-use) | **MODIFY** | Align to "onboarding/claim credential": 6-month validity (default), bound to a **pre-provisioned identity** (not a free-form register), context-tied, non-transferable, invalidated on consume/account-invalid/relationship-removed/expiry/revoke. Distinguish onboarding links (provisioned accounts) from self-registration invitations (D-01 invite-only path). |
| 3 | Invitation acceptance | Public claim-check (`/invitations/:id/accept`) returns details; `register()` consumes | **MODIFY** | Spec §21–22: claim completes onboarding for a **provisioned** account = proof of email control + set password + account activation + **initial email verification** + automatic authentication. Provide a claim endpoint that activates a provisioned identity (password set + `emailVerifiedAt` + auto-token), separate from the self-registration register flow. |
| 4 | Onboarding expiry | 7 days (`INVITATION_EXPIRY_DAYS=7`) | **MODIFY** | Spec §23: **6 months**. Change default config; keep hashed-at-rest single-use; add explicit invalidation triggers (consumed, account invalid, email/identity relationship removed, expired, revoked/replaced). |
| 5 | Onboarding verification semantics | Separate registration → then `EmailVerificationToken` verify | **MODIFY** | Spec §24: claim == initial verification. No separate verification step during initial onboarding. |
| 6 | User identity model | `User` tenant-scoped, singleton staff/student/guardian | **MODIFY / ADD** | Spec §36: `User → OrganizationMembership → InstitutionMembership(s) → roles → permissions`. Introduce organizations + two membership layers; stop modeling "User = Institution User". A single user must support multiple institution memberships and multiple roles (e.g., Teacher + Parent). |
| 7 | Organization membership | Not modeled | **ADD** | `OrganizationMembership` entity with lifecycle `ACTIVE / SUSPENDED / INACTIVE`, distinct from institution membership. |
| 8 | Institution membership | Implicit via singleton `staff.userId`/`student.userId` | **ADD** | `InstitutionMembership` entity (user, institution, role, status, membership history). Staff/Student become membership-attached profiles (per-institution), not user singletons. Enables §10 transfers (ACTIVE→INACTIVE at one school, ACTIVE at another) without identity duplication. |
| 9 | Role assignment | `UserRoleAssignment` global (`unique(userId, roleId)`); `Role` global | **MODIFY** | Roles must attach at the membership level (organization role / institution role) and be scope-aware; `Role` scoped per organization (at minimum) per §35/§7.3 spec. Preserve permission-derived authorization. |
| 10 | Custom roles | Not implemented (no role CRUD) | **DEFER** | Spec §31 (Primary Institution Admin manages custom roles; permission model authoritative). This is Phase 2 RBAC. Keep `Role` additive; do not build in B1. |
| 11 | Parent identity | `Guardian` org-scoped, no institution column; per-student relationships | **MODIFY / ADD** | Spec §12–13: parent identity is **organization-level**; children across institutions in the same org; relationships are institution-aware; never merged across unrelated orgs. Restructure so a parent identity lives under an `OrganizationMembership` and relationships resolve per institution. |
| 12 | Teacher identity | `Staff` record, org-scoped `staffNumber`, `userId @unique` | **MODIFY / ADD** | Spec §14–15: provisioned by school admin; require external email + phone; staff ID unique **within the institution**; system-generated internal school email (login + messaging, non-editable, not an external mailbox, unchanged when external email changes). |
| 13 | Student identity | `Student` record; `studentNumber` + (system) unique per organization | **MODIFY** | Spec §17: Student ID and internal school email unique **per institution**; manual/bulk provisioning. Model-level scoping change now; bulk import is a provisioning batch. |
| 14 | School email generation | Not implemented | **ADD** | Deterministic per-institution internal email (`jane@greenfield` style), institution-unique, system-generated. Add generator + model fields. (Mail delivery itself is a later phase.) |
| 15 | Organization internal email | Not modeled (no org staff concept) | **ADD** | Organization-level staff email, org-unique, not global, platform-managed. Field + policy added with `OrganizationMembership`; enforcement scoped to org-staff batch. |
| 16 | External email changes | No change flow (email effectively immutable in B1) | **ADD (batch)** | Spec §25: change allowed under permissions/business rules; new external email **must be re-verified**; admin cannot bypass. Use `EmailVerificationToken`/recovery channels. Not in B1 core — scheduled with identity-management endpoints. |
| 17 | Phone changes | No flow | **DEFER** | Spec §26: initial phone needs no OTP; subsequent changes require OTP. Depends on OTP/SMS infra (provider + channel) — later auth batch. |
| 18 | Session invalidation on deactivation | Legacy single-session model; B1 did not touch sessions | **DEFER** | Spec §28–30 deactivation cascades require session/refresh invalidation → B4 session redesign. Reconciliation dependency recorded; B1 must not extend the legacy session model. |
| 19 | Deactivation (user/institution/organization) | `User.status` exists and login blocks non-ACTIVE; no institution status; no cascade | **ADD (structural) / DEFER (enforcement)** | Add institutional/organizational status + cascade flags structurally; enforce cascades + history-retention in a later batch. Account deactivation endpoints not in B1. |
| 20 | Cross-organization isolation | Isolation by `tenantId` today | **KEEP core + MODIFY checks** | Keep org-boundary isolation (§5). Extend authorization so membership + institution context are enforced (spec §34): knowledge of an institution's URL, same email/phone/name, or same-org membership alone grants nothing. Add tenant/membership assertion tests. |
| 21 | Uniqueness constraints | `(tenant,email)`; staff/student numbers org-scoped; roles global | **MODIFY** | Spec §35 "where applicable": external email/phone stay unique within the organization (identity record — one Jane per org, cross-org allowed), while Staff ID, Student ID, student internal email, teacher internal email become **institution-scoped**. Internal/org internal emails: org-scoped. |
| 22 | Login identifier resolution | `email + tenantSlug` only; client supplies slug | **MODIFY / ADD** | Spec §19/§26/§33: allow Student ID, school email, phone as identifiers; context derived from the authenticated portal/request and valid memberships (no arbitrary manual school selection; membership+role+permission validation). Preserve opaque D-03 semantics. |
| 23 | D-03 generic login/registration semantics | Registration fixed (opaque success/no 409); **login still `401 'Invalid tenant'`** | **MODIFY** | D-03 is locked: unknown tenant, unknown user, bad password → identical opaque `401 Invalid credentials`. Unify login now (small, locked). Keep registration as fixed. |
| 24 | Password recovery | Not implemented | **DEFER** | Spec §27: admin-triggered, no enumeration, approved verified channels, credentials invalidated after use. Reset-token batch (later auth work). |
| 25 | Initial-password handling | Registration sets the user's chosen password | **ADD / DEFER** | Spec §20: provisioned accounts get a **temporary** password, viewable/downloadable once, force-change on first login, never stored plaintext, admins never see permanent password. Temporary-password provisioning is a provisioning batch; B1 keeps hashing + policy and the onboarding-claim password set. |

---

## 3. Condensed verdict

- **KEEP:** org-boundary isolation core (§5, §20), D-03 registration fix, invitation single-use hashed-token mechanics, PasswordPolicy/History, permission-guard pattern, dev/no-op delivery guard.
- **MODIFY:** invitation → onboarding-claim credential (6 months, provisioned-identity-tied); registration no longer issues a separate initial verification token; role assignment scoping; uniqueness scoping (institution-scoped IDs/internal emails, org-scoped external email); login identifier resolution + D-03 login unification.
- **REMOVE:** none required — the legacy singleton `staff/student/guardian` coupling is *replaced*, not destroyed (data retained, backfill to memberships).
- **ADD:** `Organization` semantics (see D-G1), `OrganizationMembership`, `InstitutionMembership`, institution/organization internal email fields + generator, institution status + deactivation flags (structural only), Platform-Admin exclusivity guard.
- **DEFER (explicitly scheduled):** custom roles (Phase 2), bulk student/teacher/parent provisioning + temp passwords, external email change flow, phone OTP, password recovery, session invalidation/redesign (B4), deactivation cascade enforcement, org internal-email policy enforcement.

---

## 4. Architecture & migration impact

### 4.1 Proposed identity shape (target)

```
Platform
└── Organization  (existing "Tenant" table — see D-G1)
    ├── OrganizationMembership (user, org, status)        [ADD]
    │     └── roles (organization role scope)             [MODIFY scoping]
    └── Institution (existing table)
        ├── InstitutionMembership (user, institution, role, status)  [ADD]
        │     ├── Staff profile (per-institution)         [reinterpret]
        │     ├── Student profile (per-institution)       [reinterpret]
        │     └── Parent identity (org-level, relationships institution-aware) [restructure]
        └── institution-internal emails (teacher/student) [ADD fields + generator]
```

### 4.2 Additive migration (no destructive operations)
- New tables: `organization_memberships`, `institution_memberships`, `onboarding_links` (or repurposed `user_invitations` semantics), optional `institution_status` column + `organization_status` reuse.
- New columns: `User.external_email` (clarify vs existing `email`; `email` becomes the canonical auth identifier), staff/student internal email columns, membership status/history fields, onboarding claim metadata.
- Backfill: derive one `OrganizationMembership` + one `InstitutionMembership` for every existing user from `staff`/`student`/`guardian` rows (one-per-institution); retain all source rows.
- Role handling: seed `ORG_ADMIN`, `PRIMARY_INSTITUTION_ADMIN` built-ins (and decide `TENANT_ADMIN` alias — D-G6); scope role names per organization going forward.
- Config/env: `INVITATION_EXPIRY_DAYS` → onboarding default **182 days**; login-identifier config; keep defaults (empty allowlist, invitation-driven).
- Seed: produce the §38 fixture (ABC group: Greenfield+Bluefield; Jane×2 schools; Sarah parent of Child A/B; independent XYZ/Jane twice) to prove multi-institution + isolation in tests.
- Security: `JwtStrategy`/guards resolve context from memberships + roles, not from JWT claims alone (authorization check ordering per §34).

### 4.3 Impact on existing B1 code/tests
- `login` (identifier resolution + D-03 unification), `register` (no initial verification token; allowlist/org context), invitation service/controller (onboarding links + claim semantics), permission seeds, `PRIVILEGED_ROLES` (add ORG_ADMIN/PRIMARY_INSTITUTION_ADMIN), `configuration` (expiry/context), seed, and both e2e suites + unit tests will be updated accordingly.

---

## 5. Corrected B1 implementation plan (proposed)

**Scope for this corrected B1** (smallest change set that satisfies the gate):
1. **Identity restructure (schema, additive):** organizations-as-tenants; `OrganizationMembership` + `InstitutionMembership`; membership-scoped roles; backfill from existing data.
2. **Onboarding links:** onboarding/claim credential with 182-day default, hashed, single-use, provisioned-identity-tied; claim endpoint = proof of email control + password set + `emailVerifiedAt` + activation (+ auto-auth); registration no longer issues a separate initial `EmailVerificationToken`; invitation-driven self-registration preserved as the D-01 invite-only path.
3. **Login:** alias resolution (email, and where applicable institution ID/internal email/phone) within context from membership; full D-03 unification (`401 Invalid credentials` for unknown tenant/user/password); purge the `Invalid tenant` distinction.
4. **Uniqueness + internal emails:** institution-scoped staff/student ID and internal emails; org-scoped external email; schema fields + deterministic generator (delivery deferred).
5. **Security guards:** Platform-Admin exclusivity (single account, no self-assignment, no app-flow creation) + privileged-set update; D-02 gate persists.
6. **Structural deactivation fields only** (no cascade enforcement; B2+).
7. **Tests + seed:** update existing 35 unit/2 e2e suites; add membership/onboarding/isolation/D-03-login tests; seed the §38 fixture.

**Explicitly out of scope for corrected B1 (deferred):** custom roles (§31 → Phase 2 RBAC), bulk provisioning + temporary passwords (§20), external email change flow (§25), phone OTP (§26), password recovery (§27), session redesign/invalidation (§18 → B4), deactivation cascade enforcement (§30), org internal-email enforcement, real email provider.

---

## 6. Decisions required from the user (approve or redirect)

- **D-G1 — Organization entity:** Reinterpret the existing `Tenant` table as the **Organization** (recommended; minimal churn, `Tenant.slug` stays the org context, existing data unchanged) vs introduce a new `Organization` table and demote `Tenant`.
- **D-G2 — Uniqueness:** External email/phone stay unique per **organization** (identity record; cross-org reuse allowed); Staff ID / Student ID / student internal email / teacher internal email become **institution-scoped**. Approve?
- **D-G3 — Two onboarding tracks:** Keep invitation-driven **self-registration** (D-01 invite-only, external identity) AND add admin-**provisioned onboarding links** (6 months, claim=activate+verify) as distinct flows. Approve?
- **D-G4 — Corrected B1 scope:** Approve §5 scope + §5 deferrals as the boundary of this batch.
- **D-G5 — Platform-Admin exclusivity guard:** Enforce exactly-one Platform Admin in this batch (model + login/assignment guard + tests).
- **D-G6 — Role naming:** Add `ORG_ADMIN` + `PRIMARY_INSTITUTION_ADMIN` as built-ins and treat existing `TENANT_ADMIN` as a deprecated alias of ORG_ADMIN (recommended), vs keep `TENANT_ADMIN` naming.

---

## 7. Approval record

**Approved in full (recommended options), this batch:**
- **D-G1 — Organization:** Reinterpret existing `Tenant` as the **Organization** (keep table/data; `Tenant.slug` remains the org context).
- **D-G2 — Uniqueness:** External email/phone per-organization; Staff ID / Student ID / teacher + student internal emails per-institution.
- **D-G3 — Two tracks:** Keep invitation-driven self-registration (D-01) AND add admin-provisioned onboarding links (182-day default, claim = activate + verify + auto-auth); self-registration keeps its verification token.
- **D-G4 — Scope:** Identity restructure (memberships), onboarding links, login identifier resolution + D-03 unification, uniqueness/internal emails + generator, Platform-Admin guard, structural deactivation fields, tests/seed. Defer: custom roles (Phase 2 RBAC), temp passwords + bulk provisioning, external email change, phone OTP, password recovery, session redesign (B4), deactivation cascade enforcement, org internal-email enforcement, real delivery provider.
- **D-G5 — Platform Admin:** Exactly one account; no self-assignment; no app-flow creation; guard + tests.
- **D-G6 — Roles:** Add `ORG_ADMIN` + `PRIMARY_INSTITUTION_ADMIN` built-ins; `TENANT_ADMIN` = deprecated alias of `ORG_ADMIN`; `PRIVILEGED_ROLES` updated; global-role machinery unchanged until Phase 2 RBAC.

---

## 8. Next step

Implement the §5 corrected B1 per §7 approvals in repo `phase/0-foundation` (branch, no commits), then run the `B1 — Security Correction & Completion Gate` verification (unit tests, typecheck, build, prisma validate now; migration + e2e once infra is up — Postgres 5433/Redis 6379 are currently down). No B2 work begins until this gate passes.