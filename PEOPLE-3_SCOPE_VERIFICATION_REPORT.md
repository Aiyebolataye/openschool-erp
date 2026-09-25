# PEOPLE-3 Scope & Architecture Verification Report

**Milestone:** PEOPLE-3 (next major People implementation batch)
**Author:** OpenCode (READ-ONLY architectural verification pass)
**Date:** 2026-09-16
**Baseline:** branch `phase/2-rbac`, commit `e8df968`
**Verdict:** **PEOPLE-3 READY — NO NEW DECISIONS REQUIRED**

---

## 1. Purpose & Methodology

This report is a READ-ONLY architectural verification for the next People
milestone. It reconciles the frozen authoritative documents (engineering
`ROADMAP.md`, `MASTER_SMS_ROADMAP.md`, `engineering/People Engineering.md`
v3.0.0, `engineering/Academic Management Engineering.md`) against the **current
implementation tree**, determines the next implementation boundary, and verifies
that no schema, permission, authorization, or tenant-isolation work is silently
missing before implementation can begin.

**Constraint:** No code, schema, test, seed, or dependency changes were made
while producing this report. Only this document was written.

## 2. Naming Distinction (Why Not `PHASE_3_SCOPE_VERIFICATION_REPORT.md`)

A file named `PHASE_3_SCOPE_VERIFICATION_REPORT.md` already exists at the repo
root. It is a **pre-PEOPLE-1 planning document** written when:

- The Person aggregate did not exist (0 of 20 People models implemented).
- Decisions D1-D10 were still open.
- The People API had no endpoints.

The current report serves a **different purpose**: it is the scope gate for the
**next implementation batch** after PEOPLE-1/PEOPLE-2, when all 20 models, all
permissions, the ObjectScope registry, and the seed already exist. Consistent
with the established batch documents (`PEOPLE-G_ARCHITECTURE_GATE_REPORT.md`,
`PEOPLE-1_IMPLEMENTATION_REPORT.md`, `PEOPLE-2_SCOPE_VERIFICATION_REPORT.md`,
`PEOPLE-2_IMPLEMENTATION_REPORT.md`), this report is named
`PEOPLE-3_SCOPE_VERIFICATION_REPORT.md`. The legacy
`PHASE_3_SCOPE_VERIFICATION_REPORT.md` is preserved as historical planning
documentation and is **not overwritten**.

## 3. Roadmap Alignment

### 3.1 Master Roadmap

`MASTER_SMS_ROADMAP.md` §Phase 4 groups **Institution Management (P4.1)** and
**People (P4.2)** under one phase. P4.2 items (lines 520-658):

> students, staff, guardians, relationships, profile fields, lifecycle, admissions
> V1, class/enrollment.

P4.3 = API quality, P4.4 = critical tests, Phase-4 gate = institution and people
workflows operate end-to-end through real APIs and pass security tests.

### 3.2 Engineering Roadmap

`engineering/ROADMAP.md` — all 10 V1 domains are Approved & Frozen. The
"phase" concept there is P1-P7 **per domain** (engineering design phases), which
is **not** the "Phase 0/1/2/3" implementation-phase naming used in earlier scope
documents. People as a domain is frozen (no more design decisions can arise that
force spec changes).

### 3.3 Local Working Labels

"PEOPLE-3" is a **local working label** (same convention as PEOPLE-1/PEOPLE-2),
not a roadmap label. It refers to the next batch of P4.2 People implementation.
The PEOPLE-G gate report already fixed the batch plan:

| Batch | Scope | Status |
|---|---|---|
| PEOPLE-1 | Person foundation + schema + RBAC | DONE |
| PEOPLE-2 | Person API + Student API + lifecycle + events | DONE |
| **PEOPLE-3** | **Staff Management** | **THIS REPORT** |
| PEOPLE-4 | Parents / Guardians / Relationships / Emergency | planned |
| PEOPLE-5 | Applicants / Admissions V1 + quality + gate | planned |

## 4. Prior Milestone Reconciliation

### 4.1 PEOPLE-2 (complete, verified)

- Verdict: `PEOPLE-2 COMPLETE — VERIFIED`
- Verification chain passed: `prisma validate` ✅, tsc ✅, unit 110/110 ✅,
  full E2E serial 140/140 (9 suites) ✅, `nest build` exit 0 ✅.
- Report: `PEOPLE-2_IMPLEMENTATION_REPORT.md`.

### 4.2 Frozen decisions D-A..D-F (PEOPLE-2)

- **D-A** Person + Student only for PEOPLE-2.
- **D-B** Frozen role-grant matrix (HR_OFFICER → `people:staff`;
  STUDENT_MANAGEMENT_OFFICER → `people:student` + `people:applicant`;
  TEACHER → `people:person` list/read/search + `people:student` list/read;
  PARENT/STUDENT → self reads).
- **D-C** No auto user creation; no `Person.email` ↔ User sync.
- **D-D** Bounded deterministic search (`exact` / `fuzzy` on
  name/email/phone, plus publicId/studentNumber/email exact match).
- **D-E** Enrollment writes `StudentEnrollmentDetail` + `PersonInstitution`
  (roleContext `STUDENT`) + `internalEmail` on the Student record.
- **D-F** No schema change during PEOPLE-2.

All were respected; none are contradicted by the People spec.

## 5. Remaining Capability Gap (Implemented vs Spec §10.3)

### 5.1 Currently implemented

- **Person**: 12 endpoints (list/search/create/findOne/update/remove/restore/
  getProfile/updateProfile/listInstitutions/assignInstitution/removeInstitution) —
  `persons.controller.ts`.
- **Student**: 12 endpoints (list/create/findOne/update/remove/getEnrollment/
  updateEnrollment/getGraduation/graduate/getTransfer/transfer/getWithdrawal/
  withdraw) — `students.controller.ts`.
- **Events**: PersonCreated/Updated/SoftDeleted/Restored + StudentEnrolled/
  Updated/Graduated/Transferred/Withdrawn — `people.events.ts`, consumed by
  `audit-log.consumer.ts` (+166 lines PEOPLE-2).
- **Scope**: `PeopleScopeGuard` handles `person` (tenant) + `student`
  (institution); `ObjectScopeGuard` registry already lists **all** people models
  from `person` through `peopleDocument` and `*Detail` variants.
- **Lifecycle**: Student status machine + `canPatchStatus` in
  `people.lifecycle.ts`.

### 5.2 Remaining per spec §10.3 (52 endpoints)

| Resource group | Endpoints | Permission |
|---|---|---|
| Staff (CRUD) | 5 | `people:staff:*` |
| Staff Employment | 2 | `people:staff:read/update` |
| Staff Qualifications | 4 | `people:staff:read/update` |
| Staff Certifications | 4 | `people:staff:read/update` |
| Parent (CRUD) | 5 | `people:parent:*` |
| Guardian (CRUD) | 5 | `people:guardian:*` |
| Applicant (CRUD + accept/reject) | 7 | `people:applicant:*` |
| Emergency Contact (CRUD) | 5 | `people:emergencyContact:*` |
| Person Relationship (CRUD) | 5 | `people:relationship:*` |
| People Document (CRUD) | 5 | `people:document:*` |
| Person Merge (suggest/merge/history) | 3 | `people:person:merge` |
| Profile Photo (upload/remove) | 2 | `people:person:update` |
| **Total** | **52** | — |

## 6. Boundary Recommendation

**PEOPLE-3 = Staff Management** (15 endpoints). Rationale:

1. Follows the PEOPLE-G §16 plan already reviewed and approved.
2. Scope comparable to PEOPLE-2 ("Person + Student" ≈ 24 endpoints; Staff is 15
   endpoints + status machine, similar complexity to Student).
3. Self-contained: Staff does not depend on Parent/Guardian/Applicant features.
4. Highest-value remaining P4.2 item ("staff" is an explicit roadmap item).
5. Zero architectural decisions — every Y/N was resolved in PEOPLE-G.

**Out of scope for PEOPLE-3** (deferred without loss):

- Parent, Guardian, Emergency Contact (PEOPLE-4).
- Person Relationship (PEOPLE-4), People Document (PEOPLE-5).
- Applicant / Admissions V1 including accept→convert-to-Student (PEOPLE-5).
- Person Merge (PEOPLE-5), Profile Photo endpoints (spec §16 marks photo
  implementation as future). Staff Employment History **data model** is inside
  scope (written on separation); it has **no API endpoints** per spec §10.3.

## 7. Schema Reconciliation

### 7.1 People models — all present in `apps/api/prisma/domains/people.prisma`

All 20 models exist and are in the current `schema.prisma` migration chain
(`20260915120000_people_foundation`). Relevant to PEOPLE-3:

- **Staff** (≈ line 362): `staffNumber`, `personId`, `institutionId`,
  `userId?` (nullable per PEOPLE-G D1 compatibility bridge), `position`,
  `department` (plain `String @db.VarChar(200)` — spec §7.2 keeps department as
  a string, **not** a relation; no defect), `employmentType`, `startDate`,
  `endDate?`, `contractType`, `status` (StaffStatus enum), `version`.
- **StaffEmploymentDetail** (≈ line 385): 1:1 to Staff (`staffId @unique`),
  salary, employer, location, reportTo, note.
- **StaffQualification** (≈ line 420): 1:N to Staff — type, school, year, cert.
- **StaffCertification** (≈ line 445): 1:N to Staff — name, issuer, date, expiry.
- **StaffEmploymentHistory** (≈ line 469): 1:N to Staff — prior employment
  records (data-only; **no API endpoints** in spec §10.3).

### 7.2 Academic domain (class/enrollment wiring question)

`apps/api/prisma/domains/academic.prisma` defines `AcademicYear`, `Term`,
`Class`, `Enrollment`, `Grade`. The P4.2 roadmap item "class/enrollment
relationships as defined by the schema/spec" is **satisfied by PEOPLE-2**:
`StudentEnrollmentDetail` + `PersonInstitution` (roleContext `STUDENT`) +
`StudentEnrolled` event. The Academics `Class`/`Enrollment` tables are owned by
domain **P5 (Academics)** and the Academics sub-domain consumes the
`StudentEnrolled` event — they are **not** People-domain work. The five seed
Enrollment rows (seed.ts:781-789) already pre-wire the cross-domain reference.

### 7.3 Schema verdict

**No schema change required for PEOPLE-3.** No migration, no model addition,
no enum alteration. This mirrors D-F from PEOPLE-2.

## 8. Tenancy / Object-Scope Model

- Staff is **institution-scoped** (`Staff.institutionId`, same shape as
  `Student.institutionId`). Tenant isolation derives from tenant `id` on every
  People table plus institution scope on staff/student/employment.
- `ObjectScopeGuard.resolveObject` selectMap **already includes** `staff` (and
  every other people model) — `object-scope.guard.ts`.
- **Required code change:** `PeopleScopeGuard` must gain a `staff` branch that
  resolves `staff` by UUID or public ID (`EMP-...`) to its `institutionId`
  (mirror the existing `student` branch in `people-scope.guard.ts`). This is the
  only guard change needed for PEOPLE-3; parent/guardian/applicant/relationship/
  document branches are deferred to their batches.
- **Self-service branch:** not needed for Staff. HR_OFFICER manages staff via
  admin reads/writes; per frozen D-B, no STAFF-role caller receives `people:*`
  grants, so there is no staff "self" access path to implement.

## 9. RBAC / Permission Model

### 9.1 Permission catalogue — already seeded

`seed.ts` registers the full `people:*` catalogue (50 rows). Staff-relevant rows
already exist:

- `people:staff:list`, `people:staff:read`, `people:staff:create`,
  `people:staff:update`, `people:staff:delete`.

### 9.2 Role grants — already seeded

- All 5 admin roles → all `people:*`.
- `HR_OFFICER` → `people:staff` list/read/create/update/delete.
- Every other operational role (STUDENT_MANAGEMENT_OFFICER, TEACHER, PARENT,
  STUDENT) is deliberately **excluded** from `people:staff` grants per frozen
  D-B. The `STAFF` role definition exists in the seed role list but receives **no**
  `people:*` grants — this is the frozen decision.

### 9.3 Verdict

**No new permissions or grants required for PEOPLE-3.** HR_OFFICER authorization
for all 15 staff endpoints is already in the seed.

## 10. API Contract (15 Staff Endpoints)

Routes are mounted under `/api/v1/people/persons/:personId/staff`, mirroring the
Students controller mount (`/people/persons/:personId/students`,
`students.controller.ts:39`). Every update/delete carries optimistic
`version` (ADR-014); responses use the `{ success: true, data }` envelope;
ValidationPipe yields 400 (never 422); 403 for scope/RBAC denial; 404 for
missing; 409 for version/duplicate conflicts.

| # | Method | Route | Action | Permission |
|---|---|---|---|---|
| 1 | GET | `/people/persons/:personId/staff` | List (institution-scoped, status filter, search) | `people:staff:list` |
| 2 | GET | `.../staff/:id` | Read by UUID or publicId `EMP-...` | `people:staff:read` |
| 3 | POST | `.../staff` | Create (Person + Staff + PersonInstitution `STAFF` + optional StaffEmploymentDetail) | `people:staff:create` |
| 4 | PUT | `.../staff/:id` | Update (version-checked) | `people:staff:update` |
| 5 | DELETE | `.../staff/:id` | Soft delete (status `SEPARATED`? No — soft-delete sets `deletedAt`; separate from status) | `people:staff:delete` |
| 6 | GET | `.../staff/:staffId/employment` | Read current employment (1:1) | `people:staff:read` |
| 7 | PUT | `.../staff/:staffId/employment` | Update employment (version-checked) | `people:staff:update` |
| 8 | GET | `.../staff/:staffId/qualifications` | List | `people:staff:read` |
| 9 | POST | `.../staff/:staffId/qualifications` | Add | `people:staff:update` |
| 10 | PUT | `.../staff/:staffId/qualifications/:id` | Update | `people:staff:update` |
| 11 | DELETE | `.../staff/:staffId/qualifications/:id` | Remove | `people:staff:update` |
| 12 | GET | `.../staff/:staffId/certifications` | List | `people:staff:read` |
| 13 | POST | `.../staff/:staffId/certifications` | Add | `people:staff:update` |
| 14 | PUT | `.../staff/:staffId/certifications/:id` | Update | `people:staff:update` |
| 15 | DELETE | `.../staff/:staffId/certifications/:id` | Remove | `people:staff:update` |

Notes:

- `:id` = qualification/certification UUID; `:staffId` = staff UUID or publicId.
- **StaffEmploymentHistory has no endpoints** in the frozen spec §10.3. It is
  written internally (e.g., capture the final employment record when a staff
  member is separated or when prior employment is supplied at hire). Expose as
  seed data only; no route.
- Prisma public-ID trap applies: never `findUnique({ where: { id } })` on a
  `@db.Uuid` column with a non-UUID string — branch on `isUuid()`.

## 11. DTO / Validation Contract

Follow the established DTO conventions in `dto/person.dto.ts` / `dto/student.dto.ts`:

- `CreateStaffDto` — `position`, `department` (≤ 200), `employmentType`
  (enum), `staffNumber` (unique within institution, `ID_NUMBER_REGEX` pattern
  from `student.dto.ts:16`), `startDate`, `contractType`, `userId?`
  (`@IsUUID` optional — wire to existing User per D1), instantiated from a
  Person-first create (`personId` scoped by route param).
- `UpdateStaffDto` — all optional + required `version` (`@IsInt @Min(1)`).
- `StaffEmploymentDto` — salary (decimal), employer, location, reportTo, note;
  reuses `PersonProfileDto`-style optional/object validation for free-form note.
- `StaffQualificationDto` / `StaffCertificationDto` — type/name, school/issuer,
  year/date with `@IsDateString`, optional expiry for certs.
- `ListStaffQueryDto` — `page`/`limit`/`search`/`sortBy`/`sortOrder`/`status`
  mirroring `ListPeopleQueryDto` (person.dto.ts:211-250) with `Max(100)` limit
  and `status` restricted to `StaffStatus`.
- NAME_REGEX `/^[a-zA-Z0-9 ]+$/` for person-name fields (define once, reuse).

## 12. Events / Audit

Add to `PeopleEvents` in `people.events.ts` (frozen `{Entity}{PastTenseVerb}`
convention, same payload shape `PeopleEventPayload`):

- `StaffHired` (`people.staff.hired`, entityType `staff`)
- `StaffUpdated` (`people.staff.updated`, entityType `staff`)
- `StaffSeparated` (`people.staff.separated`, entityType `staff`)

Add matching `@OnEvent(..., { async: true })` handlers in
`audit-log.consumer.ts` under a `// ---- PEOPLE-3 (BR-020) ----` section,
mirroring the students block (audit-log.consumer.ts:215-259): `record({
tenantId, actorId, actorEmail, action, entityType, entityId, changes, ...})`
wrapped in `this.safe(...)`.

## 13. Search / Pagination

- List = paginated with `exact`/`fuzzy` bounded search (D-D), searching
  `staffNumber`, person `firstName`/`lastName`/`email`/`phone`, `position`,
  `department`; `status` filter = StaffStatus (`HIRED`, `ACTIVE`, `ON_LEAVE`,
  `SEPARATED`); deterministic sort (`created_at` default, `asc`/`desc`).
- Scope filter: default to the caller's active `institutionId` (same default
  as the student list), overridable by `institutionId` param for
  multi-institution admins.
- No new search infra (e.g., pgvector/elastic) — reuses the DB-level bounded
  term-matching built in PEOPLE-2.

## 14. Bulk / Import / Merge

- **Bulk import**: deferred by PEOPLE-G D5 to **post-PEOPLE-5**. Not in scope.
- **Person Merge**: deferred to PEOPLE-5; spec §12 algorithm stays future.
- **Profile Photo endpoints**: deferred; spec §16 marks photo implementation
  as future work.

## 15. Testing Plan

### 15.1 Staff E2E (`test/staff.e2e-spec.ts`) — ~20-24 tests

1. Create staff (Person + Staff + `PersonInstitution` roleContext `STAFF` +
   optional employment detail) → 201, envelope, employment resolvable.
2. Create with duplicate `staffNumber` in institution → 409.
3. Create with duplicate email on Person → 409 (established Person rule).
4. Read staff by UUID → 200; read by publicId `EMP-...` → 200.
5. List staff (institution-scoped) → only own institution's staff returned.
6. List with `status=ACTIVE` filter; list with `search` on name/position.
7. Update staff (next-version success → 200; stale version → 409).
8. Soft delete staff → 200, subsequent read → 404; relationship to
   employment/qualification/certification preserved (cascade-none).
9. Employment: GET → 200; PUT update (version-checked, success + 409 stale).
10. Qualifications: list → 200; add → 201; update → 200; remove → 200.
11. Certifications: list → 200; add → 201; update → 200; remove → 200.
12. RBAC: TEACHER/PARENT/STUDENT attempt all five staff actions → 403.
13. HR_OFFICER succeeds on all five; ORGANIZATION_OWNER (non-admin? no —
    ORG_OWNER is an admin role) — verify admin roles succeed.
14. Cross-institution denial: staff query scoped to institution B from
    institution-A session → 403/404.
15. Cross-tenant denial: staff lookup with foreign tenant id → 404.
16. Staff nested under a Person that does not own the staff record → 404
    (nestedRelationship check, same as student).
17. Audit rows: hire/update/separate each write an `audit_logs` row.
18. Concurrency: parallel double-update → exactly one 200 + one 409.
19. Public-ID trap: GET staff with non-UUID string resolves via `EMP-...`
    branch, non-UUID garbage → 404 (not 500).
20. Soft-deleted staff excluded from list, from search.
21. Status/termination: hire → 200; verify StaffEmploymentHistory row written
    on separation flow; list history (seed) unchanged.
22. Environment isolation: all above via `openschool-postgres:5433` /
    `openschool-redis:6379` / `openschool-minio:9000-9001`; `global-setup.ts`
    runs `db push --force-reset` + seed + redis flush per jest invocation.

### 15.2 Staff unit tests (extend `people` unit suites) — ~10-14 tests

- `staff.service.spec.ts`: create/update/find/license inventory, version
  conflict, scope derivation, `isUuid` branching, soft-delete preserve
  employment records, unique constraints, `canPatchStatus`-style staff status
  machine (`HIRED → ACTIVE → ON_LEAVE → SEPARATED`), employment-detail
  write-on-create, event emission (hire/update/separate).

### 15.3 Foundation E2E (`test/people-foundation.e2e-spec.ts`)

Add staff module to the permissions/module-surface foundation suite (~3 tests):
controller mounted, permission catalogue row present, HR_OFFICER grant present.

### 15.4 Regression gate (must stay green)

- Full unit: **110 → ~124** (new staff unit tests).
- Full E2E serial: **140 → ~163** (new staff e2e + foundation).
- `prisma validate` ✅, tsc ✅, `nest build` exit 0 ✅.
- Re-run the complete suite before declaring PEOPLE-3 complete.

## 16. Implementation Plan

### New files

| File | Content |
|---|---|
| `apps/api/src/modules/people/staff.controller.ts` | 15 endpoints, `@Controller('people/persons/:personId/staff')`, @PeopleScope/@Permission decorators per endpoint |
| `apps/api/src/modules/people/staff.service.ts` | list/create/findOne/update/softDelete + employment/qualifications/certifications transactions, nestedRelationship guard, version checks, event emission |
| `apps/api/src/modules/people/dto/staff.dto.ts` | Create/UpdateStaff, StaffEmployment, StaffQualification, StaffCertification, ListStaffQuery DTOs |
| `apps/api/test/staff.e2e-spec.ts` | Staff E2E suite (15.1) |
| `apps/api/src/modules/people/staff.service.spec.ts` | Staff unit suite (15.2) |

### Modified files

| File | Change |
|---|---|
| `apps/api/src/modules/people/people.module.ts` | Register StaffController + StaffService (+ any guards/roles already registered) |
| `apps/api/src/modules/people/people-scope.guard.ts` | Add `staff` → institution-scope branch (mirror `student`) |
| `apps/api/src/modules/people/people.events.ts` | Add `StaffHired`, `StaffUpdated`, `StaffSeparated` |
| `apps/api/src/modules/audit/audit-log.consumer.ts` | Add 3 handlers (staff block) |
| `apps/api/prisma/seed.ts` | Add StaffQualification + StaffCertification + StaffEmploymentHistory fixtures for existing seeded staff (5 staff at seed.ts:541-573) |
| `apps/api/test/people-foundation.e2e-spec.ts` | Add staff module surface checks |

## 17. Dependencies

- **No new npm packages.** Reuses: PrismaService, PermissionGuard,
  PeopleScopeGuard, ObjectScopeGuard, AuditLogService, EventEmitter2
  (in-process), `internalEmail()` / `publicId()` helpers, isUuid branch pattern.
- No outbox, no external queue, no storage services required for staff data.
- Class/Enrollment cross-domain wiring is **not** People work (section 7.2);
  no Academics-module dependency in PEOPLE-3.

## 18. Decisions Register

### 18.1 Resolved in PEOPLE-G (carried forward)

| ID | Decision | Status |
|---|---|---|
| D1 | Person aggregate adopted; nullable `userId` bridge on Staff/Student | applied |
| D2 | Phase-4 boundary: Person-first, subset-first delivery | applied |
| D3 | Distinct `Parent` + `Guardian` tables (relationship graph for the former) | applied |
| D4 | Applicant V1: accept → convert to Student | applied |
| D5 | Bulk import deferred post-PEOPLE-5 | applied |
| D6 | Permission catalogue seeded eagerly | applied |
| D7 | Internal emails for staff/student population | applied |
| D8 | Multi-institution staff via `PersonInstitution` | applied |
| D9 | EventEmitter2 in-process; audit appends `audit_logs` | applied |
| D10 | Optimistic `version` on all entity updates | applied |

### 18.2 Opened by this report

**None.** PEOPLE-3 requires no architectural/user decision:
schema is frozen, permissions and grants exist, scope model mirrors Student,
events mirror Student, and the status machine is specified. This satisfies the
boundary goal: down the whole batch, no ordinary implementation decision will
stop for human authorization.

## 19. Stop Conditions & Risks

### 19.1 Stop conditions — none triggered

- Destructive migration ambiguity: **N/A** (no migration).
- Data ownership ambiguity: **N/A** (staff owned by institution per spec §7.2).
- Spec contradiction requiring a spec change: **none found**.
- Tenant isolation ambiguity: **none** (tenant + institution scoping mirrors
  Student, proven in PEOPLE-2).
- Authorization model contradiction: **none** (D-B matrix covers all 15 routes).
- Unauthorized dependency: **none** (no new package/service).

### 19.2 Risks (monitored, non-blocking)

| Risk | Mitigation |
|---|---|
| `people-scope.guard.ts` extension regresses Student branch | Move the `student` branch into the same switch shape; Staff e2e + existing student e2e cover both |
| Employment-history capture semantics unspecified by spec | Implement the narrow rule (snapshot current `StaffEmploymentDetail` into `StaffEmploymentHistory` on separation); document in the implementation report; flag for PEOPLE-5 review if spec is later clarified |
| `Staff.department` string vs `Department` model (Academics) future reconciliation | Recorded as future cross-domain concern (spec §7.2 keeps string); not a PEOPLE-3 blocker |

## 20. Verdict

### `PEOPLE-3 READY — NO NEW DECISIONS REQUIRED`

- Boundary: **Staff Management** (15 endpoints + staff status machine +
  StaffEmploymentHistory capture on separation). Everything else in
  §10.3 (§5.2) is explicitly deferred: Parent/Guardian/Relationship/Emergency
  (PEOPLE-4), Applicant/Documents/Merge/Photo (PEOPLE-5).
- Zero blocked items. All 20 models, all permissions, all role grants, the
  ObjectScope registry, and five seeded staff records already exist.
- Implementation is a pattern repetition of the proven Person/Student template
  (controller + service + DTO + guard branch + events + audit + e2e/unit),
  reusing established helpers and test infrastructure.
- No schema change, no new permissions, no new packages, no new decisions.

Next action when approved: implement per §16 (new files + guarded edits), then
run the §15 full regression gate (unit ~124, E2E ~163, build, tsc, prisma
validate) and produce `PEOPLE-3_IMPLEMENTATION_REPORT.md`.

**STOP — no implementation begins until this boundary is approved.**