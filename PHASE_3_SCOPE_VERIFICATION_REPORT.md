# PHASE_3_SCOPE_VERIFICATION_REPORT

**Mode:** READ-ONLY. No source changes. No schema/migration/config change. No tests. No deps. No Phase-3 branch. No commits/PRs. No implementation. Defects found are documented, not fixed. The creation of this report is the only write.

**Task requested:** Scope verification and reconciliation for **People + Student Management**, per the frozen roadmap and engineering specifications.

---

## 1. Executive summary

People + Student Management is **ready to plan** but requires **explicit decisions before implementation**. The frozen People Engineering specification (v3.0.0, Approved — Permanent Engineering Specification) defines a **20-model Person-aggregate design**; the committed Prisma schema implements a **flat 4-model design** (`Student`, `Staff`, `Guardian`, `StudentGuardianRelationship`). No People API, controller, module, or permission exists in the codebase. The entire domain is unimplemented. The Phase 2 RBAC/tenant-isolation enforcement layer this API must sit on is released and verified. Ten genuine decisions (D1–D10, §18) gate implementation start; none is a scope blocker for planning.

**Verdict: `PHASE 3 READY — DECISIONS REQUIRED`** (see §20).

---

## 2. Mode and methodology

- Basis was re-derived from the committed tree + frozen docs (not from prior summaries):
  - `MASTER_SMS_ROADMAP.md` (1640 lines, master tracker §3, Phase definitions).
  - Frozen `engineering/People Engineering.md` v3.0.0 (1757 lines; ADRs §3; 20-model schema §8; modules/guards/events §9; 58-endpoint catalogue §10.3; test catalogue §11; Person vs User §13; retention §15; outstanding items §16).
  - Frozen `engineering/Identity & Access Engineering.md` and `engineering/Institution Management Engineering.md` (1370 lines) — used for lifecycle/ownership/tenancy references only; no frozen rule reopened.
  - `PHASE_2_SCOPE_VERIFICATION_REPORT.md` (frozen Phase-2 decisions and batch definitions).
  - Committed source: `apps/api/prisma/domains/*.prisma` (10 files, 65 models), `apps/api/src/**` (modules: audit, auth, delivery, identity, invitations, onboarding, session), `apps/api/prisma/seed.ts`, `apps/api/prisma/migrations/`, `apps/api/test/*.e2e-spec.ts`, `apps/api/src/**/*.spec.ts`.
- Released baseline: `phase/2-rbac` @ `e8df968` (Phase 2 RBAC release, PR #2 open/mergeable; Phase-2 gates verified: tsc PASS, unit 93/93, nest build PASS, e2e serial 113/113).

---

## 3. Phase-numbering reconciliation (documented, not resolved)

The user's working label **"Phase 3 = People + Student Management"** does not match the remark name of the master roadmap:

| Source | What "Phase 3" is labeled | What People belongs to |
|---|---|---|
| `MASTER_SMS_ROADMAP.md` master tracker (line 147–163) | Phase 3 = Backend Reliability, Observability & Shared Infrastructure ⬜ | Phase 4 = Institution Management & People ⬜ (line 152) |
| `MASTER_SMS_ROADMAP.md` Phase 4 (lines 520–585) | N/A | P4.1 Institution Management, P4.2 People, P4.3 API quality, P4.4 Critical tests, Phase-4 gate |
| `engineering/ROADMAP.md` | Different legend (P1–P7 per domain; all 10 domains Approved & Frozen). Academic Management includes Admissions | People = Approved & Frozen domain |
| `architecture/03 Implementation Roadmap.md` (OPS-ARCH-003, **Draft**) | Phase 1 Core = Identity/Institution/People | (Draft, conflicts with master roadmap) |

**Finding:** The user's "Phase 3" is the master roadmap's **Phase 4, minus (by the user's scoping) the P4.1 Institution-Management slice**. The roadmap's true Phase 3 (reliability/observability) is not part of this scope. **Decision D2** resolves the label and scope boundary. This report reconciles against the roadmap's **P4.2 People** objectives (plus P4.4 tests) with P4.1/P4.3 treated per D2.

**Roadmap Phase 4 gate (line 584):** "Core institution and people workflows must operate end-to-end through real APIs and pass security tests." Note it couples People to P4.1 Institution workflows — relevant to D2.

---

## 4. Authoritative sources (frozen — not to be reopened)

- **People Engineering v3.0.0** — the governing spec for this phase: Person core identity; Student; Staff; Parent; Guardian; Applicant; Emergency Contact; Person Relationships; People Documents; public IDs; optimistic concurrency; versioned domain events; soft-delete vs business status; merge & dedup; retention.
- Frozen Identity rules (from `Identity & Access Engineering.md` + its ADR table; also the operating rules the user marked as must-keep):
  - Organization = tenant boundary; institutions beneath organizations; unrelated orgs isolated.
  - One underlying person/user identity within the relevant org; multiple institution memberships never duplicate identity; staff may work across multiple institutions in the same org; parent identity is org-level; institution membership is separate from identity.
  - Staff: staff ID institution-scoped; internal school email institution-scoped, system-generated, **not externally editable**; external email org-scoped; membership states authoritative.
  - Students: student ID institution-scoped; internal school email institution-scoped + system-generated; created by authorized personnel or **approved bulk-import** only; initial credentials follow frozen onboarding; **no student self-registration**.
  - Parents: org-level identity; multiple children across institutions within same org; provisioned through frozen onboarding.
  - Authorization integrity: every operation preserves authenticated identity + org context + institution context + active membership + role + permission + target object. RBAC-4 (object-scope) must not be weakened.
- **Institution Management Engineering** — institution lifecycle, P4.1 (ownership references). Note its own ADR-002/ADR-021 text ("Institution is the primary tenant boundary"; "tenant-per-institution") **contradicts** the org-as-tenant model implemented and frozen by Identity + Phase 2; the implemented org-as-tenant model is authoritative for this report (per the user's frozen rules) — deviation recorded below (§8, §16).

---

## 5. Scope matrix (user scope → roadmap/spec owner)

| User scope item | Roadmap owner | Frozen spec owner | Current state |
|---|---|---|---|
| People (Person identity core) | Phase 4 P4.2 "required profile fields" | People §5–§8 (Person aggregate, ADR-001/031/032/035/036) | **Unimplemented** (no `Person` table, no people API) |
| Students | P4.2 "students" + "status/lifecycle operations" | People §7/§9.4/§10.3 (Student + lifecycle) | Tables exist (flat); no API |
| Staff | P4.2 "staff" | People §7/§9.4/§10.3 (Staff + hire/separate) | Tables exist (flat); no API |
| Guardians / Parents | P4.2 "guardians" | People (Parent + Guardian distinct sub-types, ADR-017) | `Guardian` only; `Parent` absent |
| Relationships | P4.2 "relationships" | People (PersonRelationship, ADR-003/029/033) | `StudentGuardianRelationship` only |
| Admissions / enrollment (V1) | P4.2 "admissions/enrollment functionality specified for V1" | People applicant/admission flow (§9.8) + Academic `Enrollment`/`Class` | No `Applicant`; `Enrollment`/`Class` tables exist |
| Class/enrollment relationships | P4.2 "class/enrollment relationships as defined by the schema/spec" | Academic domain (owned by Academics per ADR-020) | `Enrollment`/`Class` exist; wiring to people APIs absent |
| Institution management (lifecycle/config/ops) | P4.1 (the roadmap pairs it with People) | Institution spec | Partial (provisioning to activate via onboarding); not in user's stated scope (D2) |
| API quality | P4.3 | People §10 (envelope, pagination, search) | Applies to every new endpoint (D2 scope) |
| Critical tests / phase gate | P4.4 + Phase 4 gate | People §11 (TI-001..008, 330+ scenarios) | No people tests yet |

---

## 6. Existing implementation audit (what exists, and what must be built)

### 6.1 People surface = zero
- Modules (`apps/api/src/modules/`): `audit`, `auth`, `delivery`, `identity`, `invitations`, `onboarding`, `session`. **No people module.**
- Controllers (`@Controller`): `health`, `audit-logs`, `auth`, `invitations`, `onboarding`, `sessions`. **No people/students/staff/guardians controller. No roles/permissions CRUD controller. No institution controller.**
- No `people:` permission strings exist in seed or reports — the seeded permission catalogue (RBAC-1) does not cover the People domain.

### 6.2 Reusable enforcement layer (released Phase-2, must be reused)
- Guards: `TenantGuard`, `PermissionGuard`, `ObjectScopeGuard` (RBAC-4). Decorators: `@Permissions(...)`, `@ObjectScope(...)`, `@User()`. All route handling is server-side; tenant identity comes from authenticated JWT context, never client-supplied tenant IDs (P2.3).
- Session/refresh, invitation (B-series), onboarding (link + confirmation echo), password policy, login protection/lockout, D-07 envelope + correlation + central exception filter (`all-exceptions.filter`), append-only `AuditLog` (`platform.prisma`).

### 6.3 Seed (`apps/api/prisma/seed.ts`)
- Full synthetic population for one tenant/institution: 9 staff (`STF-001..009`, incl. `Student Management Officer`), parent user + `guardian` record, student-mgmt & parent accounts, roles `TEACHER`, `STUDENT`, `PARENT`, `STUDENT_MANAGEMENT_OFFICER`, etc. `Tenant.maxStudents=2000`, `maxStaff=300`.
- Seed exercises the **flat** people model only; a Person-aggregate adoption (D1) requires seed redesign.

### 6.4 Migrations status (`apps/api/prisma/migrations/`)
- `20260908180041_init` (includes `students`/`staff`/`guardians` tables), `identity_memberships_onboarding_internal_emails`, `login_protection`, `b4_sessions_refresh_tokens`, `b5_audit_logs`.
- **No People-specific migration** exists. Table presence is from `init`. A Person-aggregate migration is required only if D1 = adopt spec v3.0.0.
- `apps/api/prisma/rbac3.sql` is a **hand-written scratch script** adding `tenantId` to `user_roles` — it is NOT a migration and is not referenced by schema (schema's `UserRoleAssignment` has no `tenantId`). Recorded as pre-existing hygiene deviation (§16) — Phase 3 does not fix it unless authorized.

### 6.5 Tests
- E2E (`apps/api/test/`): `audit`, `auth`, `envelope-security`, `identity-b1`, `login-protection`, `rbac4-object-scope`, `sessions`.
- Unit (`src/**/*.spec.ts` / test tree): `all-exceptions.filter`, `configuration`, `audit.service`, `delivery-provider`, `identity.utils`, `password-policy`, `session.service`.
- Current gates (Phase-2 release): unit 93/93, nest build PASS, e2e serial 113/113, tsc PASS. **No people tests exist**; People phase adds substantive new unit + e2e suites.

---

## 7. Data-model reconciliation (frozen People spec v3.0.0 vs committed schema) — dominant finding

The frozen People spec §8 (Phase 4 — Prisma Schema) requires **20 models**: Person, PersonProfile, PersonInstitution, Student, StudentEnrollmentDetail, StudentAcademicRecord, StudentGraduationDetail, StudentTransferDetail, StudentWithdrawalDetail, Staff, StaffEmploymentDetail, StaffQualification, StaffCertification, StaffEmploymentHistory, Parent, Guardian, Applicant, EmergencyContact, PersonRelationship, PeopleDocument — plus 10 enums (incl. `PersonStatus`, `StudentStatus`, `StaffStatus`, `EmploymentType`, `ContactPreference`, `ApplicantStatus`, `RelationshipType`, `DocumentStatus`).

The committed schema (`apps/api/prisma/domains/people.prisma`) has **4 models**: `Student`, `Staff`, `Guardian`, `StudentGuardianRelationship`.

| Frozen spec (v3.0.0) | Implemented schema | Gap |
|---|---|---|
| `Person` root aggregate (ADR-031), public ID `P-YYYY-NNNNNN` (ADR-040), person_profiles, person_institutions (role context, ADR-025) | None | **Missing — architectural** |
| `Student` referencing `person_id`, tenant-scoped public ID `STU-...`, enrollment/graduation/transfer/withdrawal detail tables (ADR-009), optimistic `version` | `Student` flat: `tenantId`, `institutionId`, `userId` (@unique), `studentNumber`, `internalEmail` (nullable), no Person link, no sub-detail tables, no `version` | Structural divergence |
| `Staff` referencing `person_id`, employment detail/qualification/certification/history tables (staff_qualifications, staff_certifications, staff_employment_history), status enum `StaffStatus` | `Staff` flat: `userId` @unique, `staffNumber`, `internalEmail` (nullable), `email` (external, nullable, no org-scope constraint), `department`/`position` as **plain strings** (no relation), `status` uses `UserRoleStatus` | Structural divergence |
| `Parent` (status, contact_preference, institution-scoped person rows) | **Absent** (`User.parent` relation binds to `Guardian`, identity.prisma:22) | Missing entity |
| `Guardian` (legal_guardianship_ref, contact_preference, institution-scoped) | `Guardian` org-level (no `institutionId`), no guardianship ref | Divergence |
| `Applicant` (public ID `APP-...`, lifecycle) | **Absent** | Missing entity (admissions V1, D4) |
| `EmergencyContact` (priority-scoped) | **Absent** | Missing entity |
| `PersonRelationship` (bidirectional, temporal, institution-scoped, ADR-003/029/033) | `StudentGuardianRelationship` only (student↔guardian, no source/target Person, no temporal validity) | Divergence |
| `PeopleDocument` (metadata-only references, ADR-004/034) | **Absent** (generic `Document` in documents.prisma exists as separate domain model) | Missing entity |
| `version` optimistic-locking column everywhere | **No `version` columns in the schema at all** | Missing (spec §8/ADR-014) |

**Cross-domain consumers of the flat model** (must reconcile if D1 = adopt aggregate): `academic.prisma` `Class.teacherStaffId/classTeacherId → Staff`, `Enrollment.studentId → Student`, `Grade.staffId → Staff`, `Grade/Result` enrollment chains; `finance.prisma` `Invoice.studentId`; `operations.prisma` `HostelAllocation`/`TransportAllocation` → Student/Staff; `documents.prisma` `Document.studentId`; `people.prisma` `StudentGuardianRelationship`. A Person-aggregate migration touches every one of these FKs.

---

## 8. Tenancy & isolation (frozen rules mapped onto the schema)

Implemented, release-verified model (authoritative for this phase; not reopened):
- `Tenant` (organization) is the boundary; `Institution` sits beneath (`institution.prisma`). Unrelated orgs isolated (P2.3/RBAC-4 verified).
- Membership: `OrganizationMembership` (tenant+user) and `InstitutionMembership` (tenant+institution+user, `MembershipStatus`) — `identity.prisma:223-258`. **This is the mechanism that already supports multi-institution membership without duplicating `User`.**
- `OnboardingLink.institutionId` is nullable (`identity.prisma:264`) — explicitly supports org-level identities such as parents (onboarding.dto.ts documents this).
- **Tension — must be resolved, not reopened:** frozen rule "staff may work across multiple institutions in the same org" vs `Staff.userId @unique` (`people.prisma:49`) — one user cannot hold Staff rows at two institutions in the current flat model. Either an org-level `Person` + `PersonInstitution`-style assignment (D1/aligned with spec ADR-005/025) or a deliberate persona-per-institution model must be chosen (**D1/D8**).
- **Tension within frozen specs (documented):** Institution spec ADR-002 ("Institution is the primary tenant boundary") and ADR-021 ("tenant-per-institution") conflict with the implemented org-as-tenant boundary that Phase 2 verified and the user's frozen rule mandates. Resolved here in favor of org-as-tenant.

---

## 9. RBAC & permission mapping

- Enforcement machinery exists (`PermissionGuard` + `@Permissions('...')`, `ObjectScopeGuard`), but the **permission catalogue does not yet contain People permissions** (no `people:` strings anywhere). The Phase-2 matrix froze permissions present at that time; People permissions are defined authoritatively by the frozen People spec §10.3 (e.g., `people:person:list`, `people:student:create`, `people:staff:update`, `people:parent:create`, `people:guardian:list`, `people:applicant:accept`, `people:emergency_contact:*`, `people:relationship:*`, `people:document:*`, `people:person:merge`, plus sub-permissions for lifecycle ops: `people:student:enroll/graduate/transfer/withdraw`, `people:staff:hire/separate`, etc.). **No permission invention needed — seed per spec catalogue.**
- Role mapping candidates exist in seed + spec (STUDENT_MANAGEMENT_OFFICER, INSTITUTION_ADMIN / PRIMARY_INSTITUTION_ADMIN, PRINCIPAL, TEACHER, STAFF, STUDENT, PARENT, HR_OFFICER, BURSAR) but the **complete role→people-permission mapping is unseeded** and requires the user's confirmation (**D6**).
- Uniqueness note: `Role.name` is globally `@unique` (identity.prisma:49) — a deviation already flagged in Phase 2 (spec wants `(tenant_id, name)`); `rbac3.sql` is the un-migrated scratch toward tenant-scoped `user_roles`. Not reopened here; dependency noted.

---

## 10. API & workflow scope (unbuilt)

Per frozen People §10.3 the catalogue is **38 primary + 20 sub-resource = 58 endpoints** under `/api/v1/people...`. Workflows required by roadmap P4.2 for "Student Management":
1. **Students:** create (authorized personnel only), read/list (institution-scoped), update, soft-delete/restore, status/lifecycle (enrolled→active→transferred/withdrawn/graduated), enrollment-detail, graduation, transfer, withdrawal sub-resources, class/enrollment relationships via `Class`/`Enrollment` (Academic-owned data, cross-domain reference).
2. **Staff:** hire (authored by authorized institutional admin/HR), read/list, update, separation, qualifications/certifications/employment-history sub-resources (per spec — tables absent today).
3. **Parents / Guardians:** org-level identity; institution-scoped child linkage; contact_preference; legal_guardianship_ref for guardians.
4. **Relationships:** parent↔student, guardian↔student, sibling, authorized pickup, staff↔student, temporal validity, bidirectionality, overlap detection.
5. **Applicants / admissions (V1):** application lifecycle; accept → convert to Student; reject; expiry.
6. **Personification/search:** full-text search (`people:person:search`), `institutionId` filter, pagination (§10.2), public-ID lookups.
7. **Profile fields:** name/email/phone/DOB/gender/address/photo reference; residential address required for Students (§14).
8. **Public IDs:** `P-`/`STU-`/`EMP-`/`APP-` per-tenant sequential generation (spec §16 "Planned: Public ID generation service"), immutable, never a PK (ADR-040).

P4.1 Institution Management (roadmap pairs it with People, but is outside the user's stated scope) — currently **only provisioning-to-activate exists** (onboarding); full institution lifecycle/config/module-license operations are unbuilt. **D2** decides whether it joins this scope.

---

## 11. Bulk import & provisioning (frozen constraints — preserved, not reopened)

- Frozen Identity rule: Students are created by **authorized personnel or approved bulk-import**; **no student self-registration**; initial credentials follow the frozen onboarding flow.
- Frozen People spec §16 lists **"Person bulk import (CSV/Excel)" as High-priority Future**. It is specced as an orchestration/dedup concern (§12 merge & deduplication: duplicates from bulk imports) but not designed as a V1 API.
- **Gap:** "approved bulk-import" is mandated by the user's frozen rules but the import mechanism is not yet designed (**D5**: build minimal V1 bulk-import now, or defer and rely on per-record authorized creation for V1).
- Portal access: creating a Student/Staff/Parent does **not** auto-provision credentials (ADR-032 §13.3: "No auto-creation"); access is configurable and flows through the existing `OnboardingLink`/invitation machinery. People APIs must not create credentials themselves.

---

## 12. Security requirements (apply to every endpoint)

- Preserve the Phase-2 invariants: authenticated identity + org + institution + active membership + role + permission + target object; `ObjectScopeGuard` on object reads; **no IDOR/BOLA** (People spec TI-001..008, §11.3); safe 403/404 envelopes; direct-API-bypass prevention.
- Internal school emails (`Student.internalEmail`, `Staff.internalEmail`): institution-scoped, **system-generated, not user-editable** (frozen rule). Today nullable in schema — generation policy/format needed (**D7**).
- External email (`Staff.email`): org-scoped rule vs schema's unconstrained nullable column — constraint to enforce at service layer (frozen rule).
- No self-registration; no client-supplied tenant IDs; institution context is derived (membership), never trusted from input.
- People retention: soft delete + 30-day restore window; business `status` vs `deleted_at` orthogonality (ADR-041); archive/permanent-delete policies (§15) documented, enforcement belongs to a later job — flag as out of V1 API scope unless decided otherwise.

---

## 13. Audit & eventing

- Append-only `AuditLog` (entity_type/entity_id/action/actor/correlation_id/changes JSON, `platform.prisma`) is released and reused — every People state change must write audit.
- Frozen People spec ADR-042/043 define a **versioned event envelope** (`eventId`, `eventType`, `eventVersion`, `schemaVersion`, `occurredAt`, `correlationId`, `causationId`, `tenantId`, `actorId`) with idempotent consumers (dedup by `eventId`, outbox or Redis TTL) and events such as `PersonCreated`, `StudentEnrolled`, `StaffHired`, `ApplicantAccepted`, `PersonMerged` (§9.6, §9.8). The codebase has **no event/outbox infrastructure** today. **D9** decides minimal in-process publishing (+ event_outbox) now vs later; note the AuditLog consumer pattern already exists (audit module) and could be the first consumer.

---

## 14. Dependencies (existing, reused, not rebuilt)

- **Released/verified:** JWT auth + sessions, TenantGuard/PermissionGuard/ObjectScopeGuard, envelope + correlation + error filter, password policy/login protection, invitations + onboarding (provisioned credentials), tenant/institution/organization membership, audit service.
- **Existing data to integrate with:** `Class` (`teacherStaffId`, `classTeacherId` → `Staff`), `Enrollment` (student+class+academicYear, unique `(studentId, classId, academicYearId)`), `Grade`/`Result` → Enrollment/Staff; `FeeStructure`/`Invoice` → Student; `HostelAllocation`/`TransportAllocation` → Student/Staff; `LibraryBookLoan` → Student; `LeaveRequest`/`MaintenanceRequest` → Staff; `Department` (headStaffId is a bare UUID — no relation; staff.department is a string — **no relational link: pre-existing data-model defect** §§16).
- **Not present (dependency of the gate, not of People code):** ModuleLicenseGuard (`institution:module:*`) per Institution spec §9.5/§13 — module licensing is a P4.1 concern (D2); not required for People CRUD V1 if licensing remains out of scope (decision note).
- No external email/SMS/push/storage providers (frozen deferrals preserved). Documents remain metadata references.

---

## 15. Implementation boundaries (ownership, per frozen ADRs — to be respected)

| Concern | Owner (frozen) |
|---|---|
| Person identity attributes, sub-types, relationships, document metadata, search, merge | People (§13.1; ADR-001/031/036) |
| Authentication, credentials, sessions, roles/permissions, MFA | Identity & Access (ADR-032: People never auto-provisions credentials) |
| Grades, attendance, academic records (reference-only in People) | Academics (ADR-020) |
| Enrollment/class relationships data | Academics owns tables; People creates/links Student to Enrollment using People's flow (P4.2 "class/enrollment relationships as defined by schema/spec") |
| Fee/rollover side effects of enroll/hire events | Finance (event consumers) |
| File storage | Platform Services (People stores references only — ADR-004/034) |

---

## 16. Documented defects / deviations found (read-only; NOT fixed)

1. **No `Person` aggregate** and 16 of the frozen 20 models are missing vs spec v3.0.0 (dominates scope; see §7, D1).
2. `Guardian` has no `institutionId` and `User.parent` binds to `Guardian`; spec requires distinct `Parent` and `Guardian`, each with institution-scoped person rows (D3).
3. `Staff.userId @unique` conflicts with multi-institution staff (frozen rule) (D8).
4. `Student.internalEmail` / `Staff.internalEmail` nullable; no system-generated internal-email mechanism implemented (frozen rule requires generation) (D7).
5. `Staff.department`/`position` are plain strings; `Department.headStaffId` is a bare UUID with no relation — no relational staff↔department link.
6. `Staff.email` (external) has no org-scope uniqueness/enforcement (frozen "external email org-scoped" rule).
7. `Role.name` globally `@unique` vs spec `(tenant_id, name)` (carried from Phase 2; `rbac3.sql` scratch is not migrated).
8. `UserRoleAssignment` has no `tenantId`/`institutionId` in schema; `rbac3.sql` adds `tenantId` by hand (hygiene/drift risk, not a migration).
9. `schema-head.prisma` and `schema.realprisma.mp` (untracked) exist as schema artifacts; `schema.prisma` is generated by `scripts/merge-schemas.mjs` — confirmation of the merge pipeline before editing schemas.
10. Institution spec ADR-002/021 (institution-as-tenant) contradict org-as-tenant implementation (resolved in favor of the implemented/frozen model).
11. No `version` optimistic-locking columns anywhere (frozen spec ADR-014, §8).
12. `architecture/03 Implementation Roadmap.md` is a Draft with contradictory phase mapping (ingored as non-authoritative).

---

## 17. Outstanding spec items relevant to this scope

- Public ID generation service (`P-`/`STU-`/`EMP-`/`APP-`) — spec "Planned/Implementation" (§16).
- Person bulk import — spec "Future/High" (D5 decision).
- Person merge auto-suggestion — spec "Future" (not needed for V1; manual merge endpoint is in catalogue).
- Profile photo upload — spec "Implementation"; storage integration is a platform concern (defer or accept base64/URL reference D-proposal in batch planning).
- Event outbox/idempotency store — spec "Planned" (D9).
- Rate limiting middleware — spec "Planned" (already roadmap Phase 3 reliability territory; not this scope).

---

## 18. Decision register (genuine decisions requiring approval before implementation)

| ID | Decision | Options (recommendation in bold) | Impact |
|---|---|---|---|
| D1 | People data model: adopt frozen v3.0.0 Person aggregate (20 models + migration) vs extend flat 4-model design | **Adopt spec v3.0.0 Person aggregate** / Extend flat model | Schema migration, seed rewrite, FK touches across academic/finance/ops/documents |
| D2 | Phase label + scope boundary: confirm "Phase 3" = P4.2 People + Student Management only, or include P4.1 Institution Management | **People + Student Management only (P4.2 + P4.4 tests)** / Include P4.1 | Scope, plan size, gate definition |
| D3 | Parent vs Guardian: implement distinct `Parent` + `Guardian` entities (spec) vs keep single `Guardian` | **Distinct Parent + Guardian (spec)** / Single Guardian | Data model, role mapping |
| D4 | Admissions (Applicant) in V1: build Applicant CRUD + lifecycle (accept→convert to Student) now vs defer | **Build minimal Applicant V1 (roadmap P4.2 demands "admissions/enrollment ... V1")** / Defer | Batch scope, migration |
| D5 | Bulk import: build minimal approved V1 bulk-import (system-generated internal emails/credentials, dedup) vs defer to later phase | Decide with roadmap priority: **minimal V1 if authorization flow needed now**, otherwise defer | V1 scope; frozen rule references "approved bulk-import" |
| D6 | Role→people-permission mapping: confirm which built-in roles manage students/staff/parents/guardians/applicants (e.g., STUDENT_MANAGEMENT_OFFICER, PRIMARY_INSTITUTION_ADMIN/INSTITUTION_ADMIN, HR_OFFICER, PRINCIPAL read-only, TEACHER read-only) | **Confirm per frozen catalogue + seeded roles** | Permission seed + guard wiring |
| D7 | Internal email policy: format + mandatory system-generation for all students/staff; enforcement point (service layer) | **System-generate on create, non-editable, institution-scoped** | Data integrity, login path (auth.service relies on internalEmail) |
| D8 | Multi-institution staff modeling: org-level Person + institution assignments (spec, D1-aligned) vs personae-per-institution | **Resolve via D1 (Person aggregate)** if D1 adopted; else document persona-per-institution successor model | Tenancy integrity (frozen rule) |
| D9 | Eventing: build minimal in-process event envelope + outbox + idempotent AuditLog consumer now vs skip | **Build minimal envelope + outbox (spec ADR-042/043) with AuditLog consumer** / Skip | Audit integrity, cross-domain rollover (Finance/Academics later) |
| D10 | Optimistic concurrency: add `version` columns to people entities (409s) vs rely on row-level defaults | **Add `version` per spec** (small migration, adheres to ADR-014) | Migration, service patterns |

---

## 19. Proposed batch breakdown (proposal — not a roadmap change)

| Batch | Scope |
|---|---|
| PEOPLE-G | Decision gate: D1–D10 resolved by user; schema/migration + seed redesign approved |
| PEOPLE-1 | Permission extraction + seed (`people:*` per spec §10.3) + role mapping (D6); guard wiring scaffold for People routes |
| PEOPLE-2 | Student Management: Person-consolidated Student CRUD, enrollment/graduation/transfer/withdrawal, class/enrollment wiring, public IDs, search, internal-email generation (D7) |
| PEOPLE-3 | Staff Management: hire/separate, qualifications/certifications/history, department fix (D8, §16.5) |
| PEOPLE-4 | Parents + Guardians + Relationships (D3) + Emergency Contacts (V1) |
| PEOPLE-5 | Applicants/admissions V1 (D4) + bulk import (if decided) + P4.3 API quality pass + P4.4 security/critical tests + Phase-4 gate report |

---

## 20. Final verdict

**PHASE 3 READY — DECISIONS REQUIRED**

- **Genuine decisions to approve before implementation:** **10** (D1–D10, §18).
- **Architecture/schema blockers:** none blocking planning. The dominant structural decision is **D1** (Person aggregate adoption vs flat-model extension) — it is a decision, not a dead end; every other gap either follows from it or is independently resolvable.
- **Documented deviations/defects:** 12 (§16), intentionally NOT fixed (read-only).
- **Frozen rules preserved:** organization-as-tenant boundary, institution-scoped student/staff IDs + system-generated internal emails, no student self-registration, authorized-personnel/bulk-import creation, org-level parent identity, RBAC-4 object-scope integrity — none reopened.

**Recommended next action:** Authorize resolution of D1–D10 with the recommended options above; on approval, proceed with a PEOPLE-G design/decision confirmation and then PEOPLE-1..PEOPLE-5 batches on an approved branch per the roadmap Phase-4 gate. READ-ONLY COMPLETE — no source changes, no commits, no PR, no migrations, no implementation begun.