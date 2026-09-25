# PEOPLE-G ARCHITECTURE GATE REPORT

**Mode:** READ-ONLY. No source code, Prisma schema, migrations, seed, permissions, controllers/services, tests, or branch changes. No commits/PRs. Only this report was written. **DB inspection was strictly read-only** (SELECT counts / information_schema only).

**Basis (re-derived from the committed tree + frozen docs):**
- `MASTER_SMS_ROADMAP.md` (Phase 4 = Institution Management & People; P4.2 People, P4.3 API quality, P4.4 Critical tests, Phase-4 gate).
- Frozen `engineering/People Engineering.md` v3.0.0 (ADR-001–044; §5 domain analysis; §6 aggregates/invariants/policies; §7 table/column/constraint/index catalogue; §8 Prisma schema; §9 backend; §10 API; §13 Person-vs-User; §15 retention).
- Frozen `engineering/Identity & Access Engineering.md` and `engineering/Institution Management Engineering.md` (ownership/tenancy references only).
- Released Phase-2 baseline `phase/2-rbac` @ `e8df968` (authorization/tenant isolation verified).
- Committed schema pipeline: `apps/api/prisma/schema-head.prisma` + `apps/api/prisma/domains/*.prisma` → `scripts/merge-schemas.mjs` → `apps/api/prisma/schema.prisma`; migration history `apps/api/prisma/migrations/` (5 migrations).
- Live dev DB inspection (read-only counts — see §5).

---

## 1. Executive summary

The approved 20-model People architecture can be introduced safely on top of the existing Phase-1/Phase-2 database and identity/RBAC foundation, **provided** two compatibility bridges are honored (keep the nullable `userId` pointer on the Student/Staff role rows so the frozen Phase-1 login/`user.staff.userId`/`user.student.userId` institution-resolution path keeps working; keep the org-as-tenant relation to `person_institutions`). All people tables are confirmed **empty** in the dev DB (and the test DB is force-reset), so the migration is additive for 17 of 20 models and a **safe drop-and-recreate** for the three existing flat tables (`students`, `staff`, `guardians`) plus the flat `student_guardian_relationships` — destroy/recreate is only safe on a verified-empty schema, which is the current state. No real user data exists to preserve and no data backfill is required (the only follow-up is seed reconciliation at PEOPLE-1). No schema or security blocker was found. A small set of **confirmatory decisions** (bulk-import boundary, status-enum semantics, Person↔User link strategy, public-ID generator, verbatim permission catalogue, ObjectScope model-name registry) remain for explicit sign-off before PEOPLE-1.

**Verdict: `PEOPLE-G READY — DECISIONS REQUIRED`**

---

## 2. Approved decisions D1–D10 (resolved; architecture is built on these)

| Decision | Resolution (from scope verification) | Consequence |
|---|---|---|
| D1 | Adopt frozen People spec v3.0.0 20-model Person aggregate; do NOT extend the flat 4-model design as final architecture | All 20 spec models introduced; flat Student/Staff/Guardian replaced |
| D2 | Master-Roadmap Phase 4 boundary only (P4.2 People + P4.4 tests). No Reliability (P3), Finance, Communication, Documents, Analytics, or Production work pulled in | People phase is strictly People domain + P4.3 API quality + P4.4 tests |
| D3 | Parent and Guardian are distinct sub-types; institution-scoped person rows | New `parents` and `guardians` tables, not a single ambiguous field |
| D4 | Admissions/Applicant only to the exact frozen V1 extent (Applicant sub-type + accept/reject/expiry + convert-to-Student) | Applicant model only; no broader admissions system |
| D5 | Bulk import included only where the frozen Phase-4 scope explicitly requires; no oversized import framework | Recommend: single-record authorized creation for V1 **; bulk-import hook documented as deferred (open confirm §18) |
| D6 | Reuse Phase-2 RBAC: PermissionGuard + ObjectScopeGuard + organization/institution membership + trusted server context; add permissions only where the frozen spec defines them | People permissions seeded verbatim from People spec §10.3; no invented actions |
| D7 | Internal emails are server-controlled identity attributes: deterministic, institution-unique, non-editable, non-mailbox | `generateInternalEmail()` (identity.utils.ts:81) is the mechanism; internal email stays on institution-scoped Student/Staff rows, NOT on Person |
| D8 | One org-level Person identity + multiple institution memberships; no duplicate identities; scoped institution info; history preserved | `person_institutions` (role context) is the multi-institution carrier; person_relationships/timestamps preserve history |
| D9 | Reuse existing EventEmitter2 + audit/event architecture; no outbox invention for People | EventEmitterModule.forRoot + AuthEvents/SessionEvents→AuditLogConsumer pattern is live (app.module.ts:28, audit-log.consumer.ts); People events reuse the same envelope-less consumer pattern; durable async cross-domain delivery deferred to later phases |
| D10 | Optimistic versioning only where concurrent updates could cause lost updates | `version` on the 20 mutable People tables per spec §7.2; NOT on identity/RBAC/membership tables |

**D5 note (per D-authorization text):** "Include bulk import only where explicitly required by the frozen Phase 4 People scope." The frozen People spec marks person bulk import as High-priority Future (§16) and roadmap P4.2 does not list it. Working recommendation for implementation: **defer bulk import to post-PEOPLE-5**; V1 uses authorized single-record creation (no student self-registration). This is recorded as a genuine open decision (§18.1).

---

## 3. Twenty-model architecture map

All tables: UUID PK `id`; common columns `tenant_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at` (nullable), `deleted_by` (nullable), `version int default 1`; `@map` snake_case. Public IDs (P‑/STU‑/EMP‑/APP‑YYYY‑NNNNNN) are UNIQUE per tenant, immutable, never a PK (ADR-040).

| # | Model (table) | Purpose | Org (tenant) key | Institution | Rel to Person | Rel to User | Rel to memberships | Unique constraints | Key indexes | Lifecycle/status | Audit | Maps from existing schema | Migration class |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Person (`people`) | Core identity (name, email, phone, DOB, gender, address, photo ref, status) | tenantId | via person_institutions (1:N) | root aggregate (ADR-031) | none directly (bridge §18.3) | person_institutions (role context) | (tenant_id,email), (tenant_id,public_id) | email, public_id, status, is_active, name search | ACTIVE/INACTIVE business; soft delete via deleted_at (ADR-041) | all state changes (§BR-020) | — (new) | **ADD** |
| 2 | PersonProfile (`person_profiles`) | bio, custom_fields (JSON, institution-configurable), metadata | tenantId | — | 1:1 Person | — | — | (tenant_id,person_id) | person_id | — | profile updates | — | **ADD** |
| 3 | PersonInstitution (`person_institutions`) | Person↔Institution binding with role context (KEY to D8) | tenantId | institutionId | 1:N Person | — | complements InstitutionMembership (identity) | (tenant_id,person_id,institution_id,role_context) | person_id, institution_id | role context assignment, not statused | assignment events | — | **ADD** |
| 4 | Student (`students`) | student-specific attrs: public_id, student_id_number, enrollment_date, status | tenantId | institutionId | 1:0..1 Person (person_id) | nullable userId @unique (compat bridge) | institution via PersonInstitution(STUDENT) | (tenant_id,person_id,institution_id), (tenant_id,public_id) | institution, status, person, public_id | ENROLLED→ACTIVE→TRANSFERRED/WITHDRAWN/GRADUATED | all changes + lifecycle | flat `students` (userId-centric) | **REBUILD** (empty-verified) |
| 5 | StudentEnrollmentDetail (`student_enrollment_details`) | enrollment metadata: session, grade, class, stream, type | tenantId | via student | 1:1 Student | — | — | (student_id) | student_id | mirrors Enrollment | enrollment changes | — | **ADD** |
| 6 | StudentAcademicRecord (`student_academic_records`) | append-only references to Academics domain | tenantId | via student | 1:N Student | — | — | — | student_id | append-only, no soft delete / no status | creation only | — | **ADD** |
| 7 | StudentGraduationDetail (`student_graduation_details`) | graduation date, final grade, cert refs | tenantId | via student | 1:1 Student | — | — | (student_id) | student_id | graduation only | graduation | — | **ADD** |
| 8 | StudentTransferDetail (`student_transfer_details`) | source/destination institution refs, reason, docs | tenantId | via student | 1:1 Student | — | — | (student_id) | student_id | transfer only | transfer | — | **ADD** |
| 9 | StudentWithdrawalDetail (`student_withdrawal_details`) | withdrawal type/reason/refund status | tenantId | via student | 1:1 Student | — | — | (student_id) | student_id | withdrawal only | withdrawal | — | **ADD** |
| 10 | Staff (`staff`) | staff-specific: public_id EMP-, employee_id, hire_date, employment_type, status | tenantId | institutionId | 1:0..1 Person (person_id) | nullable userId @unique (compat bridge) | institution via PersonInstitution(STAFF) | (tenant_id,person_id,institution_id), (tenant_id,public_id) | institution, status, person, public_id | HIRED→ACTIVE→(ON_LEAVE)→SEPARATED | all changes + lifecycle | flat `staff` (userId-centric; department/position strings) | **REBUILD** (empty-verified) |
| 11 | StaffEmploymentDetail (`staff_employment_details`) | position, department (moved OUT of staff string), reporting_to, salary grade, contract | tenantId | via staff | 1:1 Staff | — | — | (staff_id) | staff_id | employment state | hire/update/separate | — | **ADD** |
| 12 | StaffQualification (`staff_qualifications`) | qualifications per §7.2 | tenantId | via staff | 1:N Staff | — | — | — | staff_id | — | add/update/remove | — | **ADD** |
| 13 | StaffCertification (`staff_certifications`) | certifications (issuing body, refs) | tenantId | via staff | 1:N Staff | — | — | — | staff_id | expiry tracked | add/update/remove | — | **ADD** |
| 14 | StaffEmploymentHistory (`staff_employment_history`) | prior employment (invoice §15 compliance) | tenantId | via staff | 1:N Staff | — | — | — | staff_id | — | add on separation | — | **ADD** |
| 15 | Parent (`parents`) | distinct sub-type (ADR-017): contact_preference, status | tenantId | institutionId | 1:0..1 Person | nullable userId @unique (bridge, matches org-level parent login) | institution via PersonInstitution(PARENT) | (tenant_id,person_id,institution_id) | institution, person | ACTIVE/INACTIVE | CRUD + preference | — (no Parent exists) | **ADD** |
| 16 | Guardian (`guardians`) | distinct sub-type (ADR-017): legal_guardianship_ref, contact_preference, status | tenantId | institutionId | 1:0..1 Person | nullable userId @unique (bridge) | institution via PersonInstitution(GUARDIAN) | (tenant_id,person_id,institution_id) | institution, person | ACTIVE/INACTIVE | CRUD + legal ref | flat `guardians` (org-level, no institutionId, no person_id) | **REBUILD** (empty-verified) |
| 17 | Applicant (`applicants`) | admission sub-type: public_id APP-, target grade, source, status, notes | tenantId | institutionId | 1:0..1 Person | — | institution via PersonInstitution(APPLICANT) | (tenant_id,person_id,institution_id), (tenant_id,public_id) | institution, status, public_id | APPLIED→UNDER_REVIEW→(ACCEPTED→convert to Student | REJECTED | EXPIRED) | lifecycle + decisions | — | **ADD** |
| 18 | EmergencyContact (`emergency_contacts`) | first-class emergency contact (ADR-006) | tenantId | — (person-level) | 1:N Person | — | — | (tenant_id,person_id,priority) | person_id | ACTIVE/INACTIVE | CRUD + priority | — | **ADD** |
| 19 | PersonRelationship (`person_relationships`) | bidirectional, temporal, institution-scoped (ADR-003/029/033) | tenantId | institutionId | source/target 1:N Person | — | — | (tenant_id,source_person_id,target_person_id,relationship_type,institution_id) | source, target, institution | CREATED→ACTIVE→EXPIRED/REVOKED (temporal) | create/revoke | flat `student_guardian_relationships` (student↔guardian only) | **ADD** (replaces SGR) |
| 20 | PeopleDocument (`people_documents`) | document metadata references only (ADR-004/034) | tenantId | — (person-level) | 1:N Person | — | — | — | person_id | document_status ACTIVE/EXPIRED/REVOKED | CRUD | — | **ADD** |

**Enum catalogue to add (§8 spec):** `PersonStatus` (ACTIVE, INACTIVE), `StudentStatus` (ENROLLED, ACTIVE, TRANSFERRED, WITHDRAWN, GRADUATED), `StaffStatus` (HIRED, ACTIVE, ON_LEAVE, SEPARATED), `EmploymentType` (FULL_TIME, PART_TIME, CONTRACT, INTERN), `ContactPreference` (EMAIL, PHONE, SMS, WHATSAPP), `ApplicantStatus` (APPLIED, UNDER_REVIEW, ACCEPTED, REJECTED, EXPIRED), `ApplicantSource` (WEBSITE, REFERRAL, WALK_IN, AGENT, OTHER), `RelationshipType` (PARENT, GUARDIAN, SIBLING, EMERGENCY_CONTACT, AUTHORIZED_PICKUP, STAFF_STUDENT, OTHER), `DocumentStatus` (ACTIVE, EXPIRED, REVOKED); extend `Gender` with `PREFER_NOT_TO_SAY`.

---

## 4. Existing-schema reconciliation

### 4.1 Models that exist today (in the committed schema) and their fate

| Existing (domain file) | Required by 20-model spec | Fate |
|---|---|---|
| `Student` (`domains/people.prisma`) | `Student` | **Replace** — gains `person_id`, `public_id STU-`, `version` + common columns, `StudentStatus`; loses `studentNumber`→`student_id_number`, gains institution-scoped semantics; **keeps nullable `userId` @unique** (compat bridge) |
| `Staff` | `Staff` | **Replace** — same, plus `public_id EMP-`, `staffNumber`→`employee_id`, `department`/`position` strings removed into `StaffEmploymentDetail`, `StaffStatus` replaces `UserRoleStatus` on this row |
| `Guardian` | `Guardian` (+ new `Parent`) | **Replace** — gains `person_id`, `institution_id`, `legal_guardianship_ref`, `contact_preference`, `GuardianStatus`; becomes institution-scoped sub-type |
| `StudentGuardianRelationship` | `PersonRelationship` | **Replace** — generalizes to source/target enums, temporal bounds, institution scope; SGR dropped after empty-verify |
| `User.parent → Guardian` relation (`identity.prisma:22`) | kept (guardian row still linkable) | **Keep**, but the 20-model design binds guardians through `person_id`; guard relation resolves via the userId compat bridge |
| `Institution.students/staff` back-relations, `Class.teacherStaffId/classTeacherId`, `Enrollment.studentId`, `Grade.staffId`, `Result`, `Invoice.studentId`, `HostelAllocation`, `TransportAllocation`, `Document.studentId`, `BookLoan.studentId` | unchanged | **Keep untouched** — FK targets are table names (`students`, `staff`) which are rebuilt; FKs re-point to the same table names with same PK type (uuid), so no FK change required |

### 4.2 Models that must change
See "Replace" rows above; also `User` gains **no** required columns (Person↔User bridge lives on role rows; optional `User.personId` is a PEOPLE-1 decision, §18.3).

### 4.3 Models that must be added (17)
`people`, `person_profiles`, `person_institutions`, `student_enrollment_details`, `student_academic_records`, `student_graduation_details`, `student_transfer_details`, `student_withdrawal_details`, `staff_employment_details`, `staff_qualifications`, `staff_certifications`, `staff_employment_history`, `parents`, `applicants`, `emergency_contacts`, `person_relationships`, `people_documents`.

### 4.4 Existing fields that conflict with the 20-model architecture
- `Student.studentNumber` / `Staff.staffNumber` (institution-unique numbers) → replaced by `student_id_number`/`employee_id` + public IDs.
- `Staff.department`, `Staff.position` (plain strings) → moved to `StaffEmploymentDetail`; fixes the pre-existing non-relational `Department.headStaffId` bare-UUID defect.
- `Student.status`/`Staff.status` enums (`EnrollmentStatus`, `UserRoleStatus`) → `StudentStatus`, `StaffStatus` (semantics differ from enrollment/account status; §18.2 confirm).
- `Guardian` at org level (no `institution_id`) vs spec institution-scoped guardian.
- `gender` enum lacks `PREFER_NOT_TO_SAY`; `EnrollmentStatus` lacks `ENROLLED`/`GRADUATED` equivalents used by `StudentStatus`.

### 4.5 Phase-1/Phase-2 relations that must remain untouched
`User`, `Role` (global `@@unique([name])` — pre-existing deviation, NOT reopened), `Permission` (global `@@unique([resource,action])`), `RolePermission`, `UserRoleAssignment` (tenant-scoped in DB, see §5.4), `Session`, `RefreshTokenHistory`, `UserInvitation`, `EmailVerificationToken`, `LoginAttempt`, `PasswordPolicy`, `PasswordHistory`, `OrganizationMembership`, `InstitutionMembership`, `OnboardingLink`, `Tenant`, `Institution`, `Department`, `AuditLog`, `SystemConfig`, `FeatureFlag`. None change.

---

## 5. Existing-data assessment (read-only DB inspection performed)

Dev database probed (cwd `apps/api`, `.env` `DATABASE_URL`; **SELECT-only**; no credentials output):

### 5.1 Row counts (all zero)
| Table | Count |
|---|---|
| tenants, institutions, users | 0 |
| organization_memberships, institution_memberships | 0 |
| students, staff, guardians, student_guardian_relationships | 0 |
| roles, permissions, user_role_assignments, role_permissions | 0 |

### 5.2 Existence of 20-model tables
- **Exist:** `students`, `staff`, `guardians` (flat form).
- **Do NOT exist (all null via `to_regclass`):** `people`, `person_profiles`, `person_institutions`, `student_enrollment_details`, `student_academic_records`, `student_graduation_details`, `student_transfer_details`, `student_withdrawal_details`, `staff_employment_details`, `staff_qualifications`, `staff_certifications`, `staff_employment_history`, `parents`, `applicants`, `emergency_contacts`, `person_relationships`, `people_documents`.

### 5.3 Test database
e2e `global-setup.ts` runs `npx prisma db push --force-reset` per suite → test DB is empty and schema-locked to `schema.prisma` at run time.

### 5.4 Schema/history drift discovered (pre-existing, documented — NOT modified)
- Live `user_roles` columns: `id, userId, roleId, createdAt, tenantId` — i.e., the DB **already has** the tenant-scoped `UserRoleAssignment` required by Phase-2, but **no migration in `apps/api/prisma/migrations/` creates `tenantId`**, and the domain source `domains/identity.prisma` **does not include `tenantId`** while the generated `schema.prisma` **does** (`@@unique([tenantId,userId,roleId])`). This matches the hand-written `apps/api/prisma/rbac3.sql` scratch script (adds `tenantId` to `user_roles`). Conclusion: `schema.prisma` is ahead of both the migration history and `domains/identity.prisma` for this column; the schema pipeline must be resynchronized (source file + a real migration baseline) **before/at** PEOPLE-1 migration work. Documented here; not executed.
- `roles`/`permissions` seeded permission catalogue contains **no `people:` resources** (verified live: `permissionsByResource` = empty because permissions table is empty; seed only defines `identity:*` groups — see §8).

### 5.5 Backfill necessity
- No production/user data exists. **No data backfill is required.** The only follow-on is **seed reconciliation** (synthetic) at PEOPLE-1 — deterministic.
- **Data-safety override:** the Rebuild-class operations (§6) are only safe because tables are verified empty; the executor must re-verify zero rows immediately before the destructive step (guard §13).

---

## 6. Migration strategy (classified; NOT executed)

Pipeline: edit `domains/people.prisma` (+ enum additions in `schema-head.prisma` or `domains/people.prisma`), regenerate via `npm run prisma:merge`, `prisma generate`, then one or more `prisma migrate dev` migrations. Staging (stages may each commit a migration):

**Stage M0 — pipeline hygiene (prerequisite, non-destructive):** resync `domains/identity.prisma` `UserRoleAssignment` with the live `tenantId` column + a real migration baseline for it (resolves §5.4 drift). Class: **constraint change / history repair — additive-data backfill** (existing rows would need the single-tenant fill of `rbac3.sql`; no rows exist).

**Stage M1 — additive core (17 new tables + enums):** create `people`, `person_profiles`, `person_institutions`, all four `student_*` detail tables, all four `staff_*` detail tables, `parents`, `applicants`, `emergency_contacts`, `person_relationships`, `people_documents`; add enums `PersonStatus`, `StudentStatus`, `StaffStatus`, `EmploymentType`, `ContactPreference`, `ApplicantStatus`, `ApplicantSource`, `RelationshipType`, `DocumentStatus`; `ALTER TYPE Gender ADD VALUE 'PREFER_NOT_TO_SAY'`. Class: **additive / enum-additive** (Postgres ADD VALUE is additive). Also add indexes per People spec §7.4.

**Stage M2 — rebuild flat tables (DESTRUCTIVE, safe-on-empty only):** drop and recreate `students`, `staff`, `guardians` to spec shape (person_id FK, public_id, institution-scoped, version/common columns, new status enums, keep nullable `userId` @unique bridge). Drop `student_guardian_relationships` (superseded by `person_relationships`). Class: **destructive / relation change / constraint change** — the ONLY destructive group; guarded (§13).

**Stage M3 — compatibility wiring (additive):** nothing on identity/RBAC tables; verify `User.staff`, `User.student` relations resolve through the compat `userId` bridge; extend `ObjectScopeGuard` model registry (code, not schema — PEOPLE-1).

**Stage M4 — public-ID infrastructure (additive):** per-tenant sequential counter for `P-`/`STU-`/`EMP-`/`APP-YYYY-NNNNNN` (application or small counter table — PEOPLE-1 scope, spec §16 "Planned"); no data in M4.

| Operation class | Occurrences | Risk |
|---|---|---|
| Additive | 17 tables, 9 enums, ~60 indexes | Low |
| Rename | none (spec reuses `students/staff/guardians` names) | Low |
| Relation change | person_id FKs added; User→Student/Staff kept via userId bridge | Medium (bridge) |
| Constraint change | unique (tenant,person,institution) & (tenant,public_id) etc.; `ALTER TYPE ... ADD VALUE` ×1 | Low–Med |
| Data backfill | none (empty) | n/a |
| Destructive (drop/recreate) | `students`, `staff`, `guardians`, `student_guardian_relationships` | **High — guarded, empty-only** |
| History repair | user_roles tenantId baseline (M0) | Medium (ID/schema baseline) |

**Do not execute now.** This is the plan approved for PEOPLE-1 execution.

---

## 7. Backfill strategy

- Backfill required: **none** (all people tables + tenants/users verified empty; test DB force-reset).
- Deterministic backfill possible only for synthetic seed (PEOPLE-1). 
- Any future guard M2 re-execution must re-run the emptiness check (§5.5) — deterministic precondition, not a mutation.
- Never invent production data; no query wrote to the DB.

---

## 8. Seed strategy (NO seed changes made)

At PEOPLE-1, seed must:
1. **Roles (no change):** keep existing seeded roles (PLATFORM_ADMIN, ORG_ADMIN, PRIMARY_INSTITUTION_ADMIN, INSTITUTION_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, HOSTEL_ADMIN, CLINIC_ADMIN, LIBRARIAN, TRANSPORT_MANAGER, HR_OFFICER, STUDENT_MANAGEMENT_OFFICER, BURSAR). No new roles required by the People spec.
2. **Permissions (add, verbatim from People spec §10.3):** `people:person` (list/read/create/update/delete/search/assign/merge), `people:student` (list/read/create/update/delete), `people:staff` (list/read/create/update/delete), `people:parent` (list/read/create/update/delete), `people:guardian` (list/read/create/update/delete), `people:applicant` (list/read/create/update/delete/accept/reject), `people:emergency_contact` (list/read/create/update/delete), `people:relationship` (list/read/create/update/delete), `people:document` (list/read/create/update/delete). Sub-endpoints (enrollment/graduation/transfer/withdrawal = `people:student:read/update`; employment/qualifications/certifications = `people:staff:read/update`) reuse existing actions — **no invented actions**.
3. **Role→permission grants (confirm at PEOPLE-1):** admins (PLATFORM_ADMIN/ORG_ADMIN/PRIMARY_INSTITUTION_ADMIN/INSTITUTION_ADMIN/PRINCIPAL) full; HR_OFFICER for `people:staff`; STUDENT_MANAGEMENT_OFFICER for `people:student`/`people:applicant`; STAFF/TEACHER read-only; PARENT/STUDENT self-scope read. Principle: least privilege, object-scope verified.
4. **Reference/status enums:** new People enums (§3). No speculative seed data (no fake enrolments etc. beyond existing synthetic population redesign).
5. **Seed population rebuild** to 20-model shape (Person → person_institutions → Student/Staff/Parent/Guardian/Applicant rows, relationships, docs refs) — replaces the flat seed population. This is synthetic; deterministic.

---

## 9. RBAC reconciliation

### 9.1 Permissions already available (Phase-2 catalogue — NOT People)
`identity:user` (list/read/create/update/delete/assign), `identity:role` (…/assign), `identity:permission` (list/read/create), `identity:permission_group` (…/assign), `identity:delegation` (list/read/create/cancel), `identity:session` (list/read/revoke/revoke_all), `identity:invitation` (list/read/create/revoke), `identity:onboarding` (create), `identity:audit_log` (list/read).

### 9.2 Permissions missing (to add at PEOPLE-1)
All `people:*` resources (§8.2). Genuinely required by the frozen spec (its §10.3 endpoint catalogue) — not invented.

### 9.3 Mechanics
- Reuse PermissionGuard (`@Permissions('people:student:create')`), TenantGuard, ObjectScopeGuard chain; server-side only; no client-supplied tenant/institution.
- `Permission`/`Role` global uniqueness (`@@unique([resource,action])`, `@@unique([name])`) remains a pre-existing Phase-2 deviation; People permissions follow the same global-unique pattern (consistent with existing catalogue). No change.

---

## 10. Object-scope reconciliation (per major object)

| Object | Scope strategy | Root | Guard |
|---|---|---|---|
| Person | tenant-scoped identity; institution-level authorization resolved through `person_institutions` matching caller membership; client never supplies ownership | aggregate root | `ObjectScope('tenant', {model:'person'})` |
| Student / Staff / Parent / Guardian / Applicant | institution-scoped rows | Person | `ObjectScope('institution', {model:'student'|'staff'|'parent'|'guardian'|'applicant'})` |
| StudentEnrollment/…/WithdrawalDetail | 1:1 to Student → resolve via student.institutionId | Student | institution (via owning student) |
| StaffEmploymentDetail/Qualification/Certification/History | 1:1/N to Staff → resolve via staff.institutionId | Staff | institution (via owning staff) |
| EmergencyContact / PeopleDocument | person-level (tenant) | Person | `tenant` + person-ownership check |
| PersonRelationship | institution-scoped (has institution_id) | Person | `institution` |
| PersonInstitution | tenant+person+institution (assignment) | Person | tenant + membership of actor |
| Public-ID lookups | resolve tenant first, then public_id | — | service-layer scoped query |

**Registry extension required:** `ObjectScopeGuard.resolveObject()` select-map (object-scope.guard.ts:198) must add entries for `person, student, staff, parent, guardian, applicant, personInstitution, personRelationship, peopleDocument, emergencyContact` (and the 1:1/N sub-detail model accessors) before People routes are enabled. Client-supplied tenant/institution identifiers **never** override trusted context (guard fails closed — tenant/institution mismatch → 403/404). Confirmed: **no People endpoint will trust client-supplied ownership.**

---

## 11. Tenant-isolation analysis

- Org = tenant boundary (frozen Identity rule, implemented, Phase-2 verified). Every People table carries `tenant_id`; every query tenant-scoped; unrelated orgs isolated.
- Institution context is derived from authenticated membership (InstitutionMembership + guard), never from input.
- `PersonInstitution` binds persons to institutions within an org only; cross-org assignment impossible (tenant_id equality enforced).
- Multi-institution staff: one Person identity; multiple `person_institutions(STAFF)` rows within the org — satisfies D8 without duplicate identities.
- Cross-institution read blocked by `ObjectScope('institution')` (fails closed); People spec TI-001..008 scenarios cover the same matrix.
- No RLS; app-layer isolation per ADR-011/ADR-003 (kept).

---

## 12. Phase-1/Phase-2 compatibility analysis (proven per rule)

| Frozen rule | Compliance under 20-model architecture | Evidence / mechanism |
|---|---|---|
| Organization = tenant boundary; institutions beneath; unrelated orgs isolated | ✅ | tenant_id on all people tables; person_institutions tenant-scoped; ObjectScopeGuard fails closed |
| One underlying person identity per org; **multiple institution memberships never duplicate identity** | ✅ **requires** compat bridge | `Person` unique per org (email unique/tenant, public_id unique/tenant); universities: `person_institutions` + per-institution role rows all point to one person_id |
| Staff may work across multiple institutions in one org | ✅ | `person_institutions(STAFF)` ×N; removal of `Staff.userId`-as-persona constraint by moving identity to Person (userId bridge remains nullable pointer) |
| Parent identity org-level; institution-specific child info scoped | ✅ | `parents(person_id, institution_id)`; same person_id reused; institution-specific contact_preference/child links scoped |
| Student/staff IDs institution-scoped; internal email institution-scoped + system-generated + non-editable | ✅ | `student_id_number`/`employee_id`/`public_id` institution-scoped; `internalEmail` stays on institution-scoped row, generated by `generateInternalEmail()` (identity.utils.ts:81), not free-editable |
| Phase-1 session/login (auth.service findByEmail via staff/student internalEmail; session institution context `user.staff?.institutionId ?? user.student?.institutionId`) | ✅ **requires** compat bridge | nullable `userId @unique` retained on rebuilt Student/Staff rows; `User.staff`/`User.student` relations preserved. Without this bridge Phase-1 breaks → would be a BLOCKER (§18.3 must be confirmed) |
| Phase-1 onboarding rules (provisioned credentials; no self-reg; onboarding links org/institution nullable) | ✅ | untouched; Person creation never provisions credentials (ADR-032) |
| Phase-2 RBAC (PermissionGuard/RolePermission) | ✅ | People permissions seeded per spec; same permission/role tables |
| Phase-2 object-level authorization (IDOR/BOLA) | ✅ | ObjectScopeGuard extended with person/institution models; fail-closed |
| Phase-2 global Permission/Role design (`@@unique([resource,action])`, `@@unique([name])`) | ✅ (carried) | no schema change to Role/Permission |
| Phase-2 tenant-scoped UserRoleAssignment | ✅ (DB already has tenantId) | §5.4; baseline migration pending in M0 |

**No incompatibility found provided §18.3 (Person↔User bridge) and M0 (history repair) are accepted.** If the bridge were dropped, the architecture WOULD violate Phase-1 session/institution resolution — hence the explicit decision.

---

## 13. Destructive-operation review

| Operation | Class | Irreversible? | Risk | Mitigation |
|---|---|---|---|---|
| M2: drop + recreate `students`, `staff`, `guardians` | Destructive (data loss) | Yes | Loses any rows present at execution; FKs from Academic/Finance/Ops/Docs re-point to same-named tables | Pre-flight check: `COUNT(*)` on each = 0 before drop; only then migrate; verified today (0 rows) |
| M2: drop `student_guardian_relationships` | Destructive (data loss) | Yes | Idempotent-equivalent data in `person_relationships` (queryable equivalence: same org/institution links) | Empty-verified (0 rows); recreate in M1 before drop in M2 ordering (M1 creates person_relationships first) |
| M0: `ALTER TABLE user_roles ADD tenantId`-baseline | Constraint/history repair | Partially (uniqueness change) | Drift between schema.prisma/migrations/domain source | Zero rows; single-tenant fill never needed; baseline via proper migration |
| `ALTER TYPE Gender ADD VALUE 'PREFER_NOT_TO_SAY'` | Enum add | No | none (only additive to enum) | PG supports ADD VALUE without rewrite |
| M4: public-ID counters | Additive | No | none | application-level sequence per tenant/year |

**Rule:** No destructive step executes unless (a) PEOPLE-1 authorized, and (b) rowcount probe re-confirmed zero within the same execution window.

---

## 14. Dependencies

- **Reused (released/verified):** JWT + sessions; TenantGuard/PermissionGuard/ObjectScopeGuard; envelope + correlation + exception filter; password policy/login protection; invitations + onboarding; Organization/InstitutionMembership; append-only AuditLog; **EventEmitter2 + AuditLogConsumer** (live for AuthEvents/SessionEvents) — the People phase adds `Person*/Student*/Staff*/Applicant*` events to the same in-process flow (D9). No outbox/event-sourcing introduced; if a durable async consumer (e.g., Finance) becomes an explicit Phase-4 requirement, per D9 that is a later-phase decision, not People scope.
- **Existing data to integrate with:** `Class`/`Enrollment`/`Grade`/`Result` (Academics-owned tables); `FeeStructure`/`Invoice` (Finance); `HostelAllocation`/`TransportAllocation` (Operations); `Document`/`BookLoan` (Documents) — FK targets preserved by same table names. No storage provider (file references only, ADR-004/034). Module licenscing (institution:module:*) is P4.1 and out of scope (D2).

---

## 15. Risks

1. **Compat-bridge dependence (highest):** dropping `userId` on Student/Staff would break Phase-1 login/session institution resolution — mitigated by §18.3 decision + guard testing in PEOPLE-1 (regression: identity-b1/auth/sessions e2e must stay green).
2. **Migration-history drift (§5.4):** schema.prisma ≠ migrations ≠ domain source for `user_roles`; must be baselined (M0) before people migrations, else `prisma migrate dev` fails/shadow-rewrites. Not executed now.
3. **Status-enum semantics:** replacing `EnrollmentStatus`/`UserRoleStatus` on Student/Staff with spec enums must not leak into academic `Enrollment.status` (kept) or account `User.status` (kept) — §18.2 confirm.
4. **Guard registry size:** ObjectScope select-map grows; keep ownership-fields-only selects (no PII projection) to avoid data leaks through the guard path.
5. **Public-ID generation** is a "Planned" spec item — must ship a deterministic per-tenant/per-year counter to honor "immutable, unique per tenant" (ADR-040) without inventing infrastructure.
6. **Search/fuzzy** (`pg_trgm`, ILIKE) is spec §16 "Planned"; do not build heavy search in PEOPLE-1 beyond idempotent `searchMode=exact/fuzzy` on ICARUS-scale data — scope to P4.3 baseline.
7. **Person merge/dedup** is spec Future (auto-suggestion) — keep manual merge minimal; do not pull auto-merge in V1.
8. **State-transition guards** (BR-010/BR-012/BR-013, I-020 expiry job) — applicant expiry needs a scheduled path; if no job infrastructure exists in scope, document manual/on-read expiry for V1 (decide §18).
9. **Dual identity models during cutover:** until M0–M2, flat tables exist; the gate mandates the 20-model design final — no dual-write path (migration window is a single developer-controlled transition given zero data).

---

## 16. Recommended PEOPLE-1 .. PEOPLE-5 implementation boundaries

| Batch | Scope (aligned to roadmap P4.2/P4.3/P4.4) |
|---|---|
| **PEOPLE-1 — Data model + seed + RBAC** | M0–M4 migrations (schema+seed to 20-model); sync pipeline files; extend ObjectScopeGuard registry; seed `people:*` permissions (verbatim §10.3) + role grants; keep all Phase-1/2 e2e green |
| **PEOPLE-2 — Student Management** | Person CRUD+search, Student CRUD + enrollment/graduation/transfer/withdrawal, class/enrollment wiring (Academic tables), public IDs, internal-email generation (D7), status lifecycle (D/F per §18.2) |
| **PEOPLE-3 — Staff Management** | Staff CRUD + hire/separate + employment detail/qualifications/certifications/history; fixes `Department.headStaffId` string defect; leave handled by Operations (no duplication) |
| **PEOPLE-4 — Parents, Guardians, Relationships, Emergency Contacts** | Parent/Guardian CRUD + contact preferences + legal refs; PersonRelationship (bidirectional, temporal); EmergencyContact (priority). (D3) |
| **PEOPLE-5 — Applicants + API-quality + gate** | Applicant V1 (accept→convert to Student, reject, expiry-on-read); P4.3 quality pass (DTO/pagination/filter/safe-errors); P4.4 critical tests (CRUD authz, cross-tenant, uniqueness, invalid relationships, status behavior, transactions); Phase-4 gate report |
| **Deferred (outside batches, documented)** | Bulk import (D5 §18.1), person merge auto-suggestion, profile-photo storage integration, durable cross-domain event consumers, outbox, module licensing (P4.1) |

---

## 17. Final gate verdict

**PEOPLE-G READY — DECISIONS REQUIRED**

- **Is the 20-model architecture safe to implement on top of Phase-1/2?** **Yes** — no schema or security blocker; verified via 20-model map (§3), existing-schema reconciliation (§4), empty-data assessment (§5), guard/registry and tenant analysis (§§10–11), and rule-by-rule compatibility proof (§12). The only hard dependency is the Person↔User **compat bridge** (nullable `userId` on Student/Staff) and the M0 migration-history repair — both feasible, both pending sign-off.
- **Remaining decisions:** §18 (5 items) — bulk-import boundary, status-enum semantics, Person↔User link strategy (incl. optional `User.personId`), public-ID generator approach, verbatim permission catalogue + ObjectScope model-name registry confirmation.
- **Migration/data risks:** §13 destructive group (`students`/`staff`/`guardians`/SGR drop-recreate) — safe strictly under the empty-row precondition; §5.4 history drift must be baselined before People migrations.
- **Migration/data-blockers:** none.

---

## 18. Remaining decisions (confirm before PEOPLE-1)

1. **D5 bulk import:** defer to post-PEOPLE-5 and document the frozen "approved bulk-import" hook as outstanding (recommended), or require a minimal authorized CSV import in PEOPLE-1/PEOPLE-2.
2. **Status enums:** adopt `StudentStatus`/`StaffStatus` on the people rows while keeping `EnrollmentStatus` (academic enrollment) and `UserRoleStatus` (accounts) unchanged on their existing tables (recommended).
3. **Person↔User link:** keep nullable `userId @unique` compat bridge on Student/Staff (and Parent/Guardian for parent login) with NO `User.personId` column in V1 (recommended) — validates §12; or additionally add `User.personId` (additive, larger blast radius) to satisfy spec §13.2 literally.
4. **Public-ID generator:** minimal deterministic per-tenant/per-year sequential counter service (recommended); confirm format `P-YYYY-NNNNNN` etc.
5. **Permission/registry catalogue:** adopt the frozen §10.3 strings verbatim (no invented actions) and the ObjectScope model-name registry list from §10 (recommended).

**Exact next step:** On approval of §18 (recommended defaults), begin **PEOPLE-1** — schema+seed+RBAC — on an approved implementation branch; Stage M0 (history repair) runs first; destructive stages execute only under the §13 empty-row guard; Phase-1/Phase-2 e2e suites and the 113-serial-e2e gate must stay green. Wait for explicit authorization before PEOPLE-1.

*END OF PEOPLE-G REPORT*