# PEOPLE-2 Scope Verification Report

PROJECT: SMS V1 (People Engineering Domain)
WORKSTREAM: PEOPLE-2 (Student Management)
VERSION: 1.0
STATUS: Verification complete — read-only, no files modified
DATE: 2026-Sep-15

FINAL VERDICT (from §14):
**PEOPLE-2 READY — DECISIONS REQUIRED**

---

## 1 Mode and scope of review

This review is strictly READ-ONLY. No source, schema, Prisma, migration, seed, test,
or configuration files were modified; nothing was committed or pushed; no dependencies
were installed; no database writes were performed. The purpose is to verify that the
PEOPLE-2 workstream (Student Management) is scoped correctly against the frozen inputs,
that the PEOPLE-1 foundation satisfies every PEOPLE-2 dependency, and to surface only
genuine decisions that the operator must resolve before implementation begins.

The verdict in the header is the single pass/fail outcome of §14 and must be used
verbatim to gate PEOPLE-2 implementation.

## 2 Authoritative sources

- `MASTER_SMS_ROADMAP.md` (Phase 4 People tasks list, P4.2/P4.3/P4.4 quality and test
  stages, Phase-4 gate, §7 report format).
- `engineering/People Engineering.md` v3.0.0 — frozen People spec: §6 V-* validation
  rules, §7 database catalogue, §9 module/guard definitions and core flows, §10 API
  catalogue including the §10.3 endpoint→permission mapping (58 endpoints), §11 test
  requirements, §13 Person-vs-User (BR-02), §15 retention, §16 outstanding/planned.
- `engineering/ROADMAP.md` — all V1 domains incl. People are Approved & Frozen.
- `PEOPLE-G_ARCHITECTURE_GATE_REPORT.md` (PEOPLE-G) — D1–D10 approved decisions;
  §16 recommended implementation batches (PEOPLE-1..PEOPLE-5); §18 confirmations.
- `PEOPLE-1_IMPLEMENTATION_REPORT.md` (PEOPLE-1) — foundation verdict PASS; §4-§7
  schema/seed/guard state; §9 permissions; §14 gates; §16 out-of-scope/V1 boundary.
- `PHASE_3_SCOPE_VERIFICATION_REPORT.md` — baseline Phase-3 state; origin of D1–D10.
- Verified tree evidence (files under `apps/api`): `prisma/domains/people.prisma`,
  `institution.prisma`, `identity.prisma`, `academic.prisma`, `prisma/schema.prisma`,
  `prisma/seed.ts`, `prisma/migrations/` (7 migrations), `src/common/guards/object-scope.guard.ts`,
  `src/common/decorators/object-scope.decorator.ts`, `src/common/guards/permission.guard.ts`,
  `src/common/guards/jwt.strategy.ts`, `src/modules/auth/auth.service.ts`,
  `src/modules/identity/identity.utils.ts`, `src/modules/people/people.utils.ts`,
  `src/modules/invitations/invitations.controller.ts` (controller pattern),
  `src/modules/audit/audit.controller.ts` + `dto/list-audit-logs.dto.ts` (pagination
  pattern), `src/app.module.ts`, `test/**` (harness + e2e suites).

## 3 Current-state findings (verified tree evidence)

- **No People API exists.** `src/modules/people/` contains only `people.utils.ts` +
  `people.utils.spec.ts`. There is no People controller, service, or module. PEOPLE-2
  is a greenfield implementation against an existing foundation.
- **`app.module.ts`** wires Config, EventEmitter (`EventEmitterModule.forRoot`), Prisma,
  Cache, Queue, RateLimit, Health, Identity, Delivery, Auth, Invitations, Onboarding,
  Session, Audit, plus global `APP_FILTER` AllExceptionsFilter and `APP_INTERCEPTOR`
  CorrelationIdInterceptor (envelope). People must be added as a feature module.
- **ObjectScope registry** in `object-scope.guard.ts` registers all 20 People models
  (including sub-detail selectors) — the selectMap the guard needs for PEOPLE-2 is
  already present. Scope types `tenant|self|institution|none|authOnly` supported.
- **50 `people:*` permission rows** registered and seeded, granted to the **5 admin
  roles only** (PLATFORM_ADMIN, ORG_ADMIN, PRIMARY_INSTITUTION_ADMIN, TENANT_ADMIN,
  INSTITUTION_ADMIN). The people-foundation e2e asserts zero non-admin grants.
- **Public-ID utilities** (`people.utils.ts`) serve P/STU/EMP/APP prefixes, 11-char
  limit, regex `/^(P|STU|EMP|APP)-(\d{4})-(\d{6})$/`, per-tenant sequence in
  [0, 999999], plus 5 unit tests.
- **Seed provisions the full person graph** (16 persons; 5 students, 9 staff, 1 parent,
  1 guardian; 16 `person_institutions`; 3 `person_relationships`; student/staff detail
  rows) **and the academic fixture graph** used for class/enrollment wiring: 1
  academic year + terms, curricula/subjects, `classes` (SS 1 Science/SS 1 Arts), and
  seeded `enrollment` rows for the 5 students. Class-wiring tests therefore have
  existing fixture data.
- **Auth compatibility surface intact**: login by internalEmail/staffNumber/studentNumber;
  nullable `userId` bridge on Student/Staff/Parent/Guardian rows; `User.personId`
  absent. `jwt.strategy.ts` recomputes permissions per request via
  `roles.role.permissions.permission`.
- **Audit** uses the EventEmitter2 → audience-consumer pattern (reusable per D9).
- **7 migrations** present; dev DB at migration 7/7 (`20260915120000_people_foundation`
  is the People foundation); test DB force-reset per run via `global-setup.ts`.

## 4 Determination 01 — Exact PEOPLE-2 scope

PEOPLE-2 is the **Student Management slice** of Phase-4 P4.2, per PEOPLE-G §16.
Scope = the deliverables below; everything else in the P4.2 checklist is explicitly
assigned to later batches (§12).

PEOPLE-2 WILL deliver:

1. **Person module** — Create, Read, Update, soft-Delete, Restore, search, profile
   read/update, and institution-assignment endpoints per spec §10.3, using frozen
   `@Permissions('people:person:*')` resources, `@ObjectScope`, DTO validation (V-P
   rules), envelope responses, and open-api-style pagination for list/search.
2. **Student module** — nested CRUD under `/api/v1/people/:personId/students` plus
   public-ID lookup of students; enrollment-detail GET/PUT, graduation, transfer, and
   withdrawal endpoints, each with frozen status-transition validity
   (ENROLLED → ACTIVE → ACTIVE is stay/update; ACTIVE → GRADUATED / TRANSFERRED /
   WITHDRAWN; no invalid reverse transitions).
3. **Public IDs** — generated server-side per tenant, immutable, format per
   `people.utils.ts` (STU-YYYY-NNNNNN), unique per tenant (PID rules).
4. **Internal-email generation (D7)** — on student creation, generate and persist
   `internalEmail` via the existing `generateInternalEmail()` utility.
5. **Class/enrollment wiring** — per the decision in D-E, including writing
   `Enrollment` rows against the existing seeded `classes`/`academic_years` where the
   operator approves it.
6. **Status lifecycle operations** — Student and Person status transitions per frozen
   enums and §18.2 (formerly §18) status model.
7. **Required profile fields** — Person required-field handling reconciled per D-F.
8. **Events + audit** — emit `PersonCreated/Updated`, `StudentEnrolled/Updated/
   Graduated/Transferred/Withdrawn` via EventEmitter2 with the existing
   audit-log consumer pattern. No outbox (D9). No Finance/Academics/Identity consumer
   behaviour in scope.

PEOPLE-2 WILL NOT deliver (verbatim §16 boundary, re-stated in §12):
staff, parents, guardians, person relationships, emergency contacts, people documents,
applicants/admissions V1, person merge, bulk import, full-text fuzzy search,
profile-photo storage, module-licensing guard, `academic_session_id` joins (D2), and
the Academics/Finance event consumers.

## 5 Determination 02 — PEOPLE-1 dependency check

Every dependency PEOPLE-1 was required to provide for PEOPLE-2 is present and verified
by tree evidence and the committed green gates:

| Dependency | Evidence | Status |
|---|---|---|
| 20-model People schema | `people.prisma` (20 models, 12 enums) merged into `schema.prisma` | Satisfied |
| Enums incl. status/lifecycle | People enums + `schema-head` Gender merged | Satisfied |
| 50 `people:*` permissions | `seed.ts` catalogue + grants to 5 admin roles | Satisfied (grant scope → D-B) |
| ObjectScope registration | `object-scope.decorator` + guard selectMap (all 20 models) | Satisfied |
| Public-ID engine | `people.utils.ts` + 5 unit tests (P/STU/EMP/APP) | Satisfied |
| Internal-email generator | `identity.utils.ts generateInternalEmail` | Satisfied |
| Migration 7/7 | migrations incl. `..._people_foundation` | Satisfied |
| Test harness | `create-test-app`, `global-setup` force-reset, seeded `greenfield-academy` | Satisfied |
| Auth compatibility | login by internalEmail/studentNumber/staffNumber; `userId` bridge rows | Satisfied |
| PEOPLE-1 gate record | UNIT 8/98; E2E 8/119; identity-b1 52/52; people-foundation 6/6; DB probes PASS | Satisfied (as documented) |

Mismatch / gap found (flag): **no open-api-level list/search precedent for People** —
the list/pagination envelope exists only in the Audit list pattern (limit ≤ 100,
tenant-scoped). People-2 introduces `people:person:search` and Person list; the
pagination + `searchMode=exact|fuzzy` + sort contract must be applied from spec §10.2.
This is an implementation contract, not a gate.

Re-execution note: read-only mode precludes re-running the gates here; they are listed
as documented-committed evidence. Re-verification (prisma validate + tsc + jest) is a
PEOPLE-2 implementation gate (§14).

## 6 Determination 03 — Schema/migration analysis

- **No new models, columns, enums, or indexes are required** to implement the STUDENT
  slice. All People tables it touches exist with frozen shapes; wiring joins existing
  Academics tables (`classes`, `academic_years`, `enrollments`) that already carry
  seeded fixture rows. **No DDL is required.**
- Residual schema notes (not blockers):
  - D2 column `/academic_session_id` exists (UUID, nullable, **no FK**) on
    People sub-detail models. PEOPLE-2 writes leave it NULL unless a decision later
    populates it; no join, no constraint.
  - No migration is pending; dev DB already at 7/7.
- **No destructive or ambiguous operations were found. The §3 rule to STOP on
  destructive/ambiguous migration strategy is not triggered.**

## 7 Determination 04 — Authorization/tenancy analysis

- Endpoint→permission mapping is frozen in spec §10.3 and already seeded (50 rows).
  PEOPLE-2 must apply those resources/actions verbatim:
  `people:person:create/read/update/delete` (+ `search` entry in the catalogue),
  `people:student:create/read/update`, lifecycle PUTs (enrolment/graduation/transfer/
  withdrawal) all map to `people:student:update` — **no new permissions to invent**.
- `@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)` pattern with
  `@Permissions()` and `@ObjectScope(...)` follows the frozen Invitations/Audit
  precedent. Person-level routes use `tenant` scope on `person`; nested Student routes
  use `institution` scope on `student`; self-scope read for `student`/`person` is
  supported by the guard for student/parent self-service.
- Guard mechanics to carry into service design: `resolveObject` reads only
  `request.params.id`. On nested routes such as `/api/v1/people/:personId/students`,
  the guard does NOT verify `:personId` belongs to the caller's active institution
  membership (it only checks the caller's membership and the `:id` object when present).
  **The service layer must enforce person-level ownership/tenant checks on nested
  list/create routes**; client-supplied `tenantId`/`institutionId` must be ignored
  (RBAC-2/4 trust chain, fail-closed).
- RBAC-4 and its 9-item security basket pass for People at foundation level; NEEDS
  re-verification as an implementation gate in P4.3.
- **D-B is the authority gap**: the roadmaps' "authorized personnel" flows
  (STUDENT_MANAGEMENT_OFFICER, HR_OFFICER) and self-service roles (TEACHER, STAFF,
  PARENT, STUDENT) currently hold **zero** `people:*` grants. Resolution per §11.

## 8 Determination 05 — Data/domain compatibility (incl. spec-vs-implemented)

Compatibility contract PEOPLE-2 must preserve (frozen):
- Person is the root aggregate; Student/Staff/Parent/Guardian are role entities sharing
  `personId`; `person_institutions` establishes institution context (org-as-tenant).
- `userId` bridge on role rows stays NULL until identity provisioning; **PEOPLE-2 does
  NOT create `user` rows** (ADR-032). Keep `user.student.userId`/`user.staff.userId`
  intact — do not touch the Phase-1 auth path.
- Public IDs immutable after creation, tenant-unique, prefix per entity.
- Internal emails are system-generated, non-mailbox, institution-scoped (D7);
  `internalEmail` on Student, `studentNumber`/`staffNumber` field names retained.
- Status enums frozen (incl. per-table status + `is_active`); soft-delete is via
  `deletedAt` (file state) orthogonal to business status; use restore, not reactivation,
  when un-deleting.

Spec-vs-implemented observations (drive D-F and/or validation notes):
1. **DOB**: V-P-05 says required+valid+not-future, but the model allows NULL. Recommend
   DTO-level enforcement of V-P-05 while schema stays permissive.
2. **Gender**: V-P-06 says optional, but the model requires non-null and has no default.
   Recommend treating as effectively required (schema-authoritative) unless a schema
   default is approved.
3. **Person.email on students**: seed precedent sets `person.email` = generated
   internal email (test asserts equality). See D-C for the decision surface.

## 9 Determination 06 — Events/audit/outbox

- PEOPLE-2 owns only its own domain events and its audit trail; D9 governs: reuse
  EventEmitter2 with the envelope-less pattern and the existing AuditLog consumer;
  **no outbox**. No Finance/Academics/Identity listeners attach in PEOPLE-2.
- Emit (at minimum) `PersonCreated`, `PersonUpdated`, `StudentEnrolled`,
  `StudentUpdated`, `StudentGraduated`, `StudentTransferred`, `StudentWithdrawn`.
- All mutations carried by the created/updated student event data must respect the
  same tenant/institution scope and optimistic-concurrency `version` (409 on mismatch,
  ADR-014/P2025).
- No new audit persistence mechanism; reuse `audit_log` rows + consumer.

## 10 Determination 07 — Concrete test matrix (PEOPLE-2)

Unit (extend `people.utils` suite; new service specs):
1. Public-ID generation: per-tenant uniqueness, format, immutability, boundary of the
   sequence (999999) — PID rules.
2. Internal-email generation: deterministic, uniqueness, short-circuit when supplied.
3. Status-transition validity table (invalid transitions rejected).
4. Email uniqueness (BR-02) and soft-delete/restore orthogonality in Person service.
5. Optimistic concurrency: version bump on update; 409 on stale version.

E2E (same harness: loginAs + `greenfield-academy`, isolated DB reset + Redis flush):
6. Person CRUD + profile + soft-delete/restore + person search (exact publicID/email +
   tenant-scoped name search), pagination contract.
7. Student lifecycle: create → enroll → graduation; create → transfer; create →
   withdraw; enrollment-detail updates; class/enrollment wiring against seeded
   `classes`/`academic_years`; re-schedule checks (unit does invalid transitions).
8. Authorization: RBAC-4 9-item basket (correct-object allowed; wrong-institution
   denied; wrong-org denied; same-role-another-tenant denied; client-supplied context
   ignored; missing/invalid membership denied; deactivated membership/institution
   denied; Platform Admin unchanged; Phase-1+RBAC-1/2/3 regression) re-verified on
   People endpoints.
9. Tenant isolation: person/student lists and search return only the caller's tenant;
   cross-tenant reads by public ID must 404.
10. Error envelope: 400 (V-P/V-S validation), 401, 403 (no permission / wrong scope),
    404 (soft-deleted or foreign-tenant resource), 409 (version conflict); envelope
    shape from the global filter/interceptor.
11. Self-scope: STUDENT/PARENT self-scope reads work; any attempted cross-person access
    is denied.
12. Regression: Phase-1/2 suites (auth, sessions, identity-b1, login-protection,
    envelope-security, audit) + people-foundation must remain green.
13. Schema/migration validation: `prisma validate`, merged-schema regeneration check,
    dev DB `migrate status` at 7/7, test DB reset green.

## 11 Determination 08 — Decision register (genuine decisions only)

### D-A — PEOPLE-2 batch boundary: Student-Management slice vs full P4.2 checklist
- **Source conflict / why real**: the frozen MASTER roadmap lists P4.2 as one checklist
  covering students, staff, guardians, relationships, profile fields, status/lifecycle,
  admissions/enrollment, class/enrollment relationships. PEOPLE-G §16 (approved gates)
  splits the same tasks across PEOPLE-2..PEOPLE-5. The task→batch mapping differs
  between two frozen inputs.
- **Recommended option (1)**: PEOPLE-2 = the §16 Student-Management slice exactly as
  §4 enumerates; staff→PEOPLE-3; parents/guardians/relationships/emergency contacts→
  PEOPLE-4; applicants/admissions→PEOPLE-5. Also assign the two PEOPLE-G §16
  unallocated families (People Documents, Person Merge) to PEOPLE-4/PEOPLE-5 and
  record that in the tracker.
- **Alternative (2)**: expand PEOPLE-2 to the full P4.2 checklist (staff + guardians +
  relationships in this batch). Increases batch size and risk; departs from approved
  §16.
- **Consequences**: choosing (1) keeps batches aligned to approved decisions and Phase-4
  gate structure; choosing (2) requires updating PEOPLE-G §16 retroactively.
- **Blocked if unresolved?**: No.

### D-B — Non-admin operational role grants (people:*)
- **Why real**: PEOPLE-1 deliberately seeded grants to the 5 admin roles ONLY
  (verified: zero non-admin grants). PEOPLE-G §8.3 had recommended least-privilege
  grants for operational roles (STUDENT_MANAGEMENT_OFFICER → people:student + applicant,
  HR_OFFICER → people:staff, TEACHER/STAFF read-only, PARENT/STUDENT self-scope read).
  Without this, no seeded operational/self-service role can perform any People V1 flow.
- **Recommended option (1)**: extend grants per the §8.3 mapping in PEOPLE-2 (seed +
  permission tests attached to this batch).
- **Alternative (2)**: keep admin-only for PEOPLE-2; add operational grants in the
  PEOPLE-5 / P4.3 quality pass.
- **Consequences**: (1) makes the roadmap's "authorized personnel" flows real now;
  (2) leaves those flows operatorless until PEOPLE-5.
- **Blocked if unresolved?**: Yes for the "authorized personnel" + self-service
  workflows in the roadmap.

### D-C — Person.email semantics for students
- **Why real**: D7 defines internal emails as non-mailbox and institution-scoped;
  BR-02 requires person email uniqueness per tenant. The seed sets `person.email` =
  generated internal email for students (e2e asserts equality). The spec does not
  directly state which address a Student's Person row carries.
- **Recommended option (1)**: follow the seed precedent — when no external email is
  supplied, `person.email` = the generated internal email (deterministic, unique).
- **Alternative (2)**: keep `Person.email` null/optional (external addresses only) and
  store internal email exclusively on Student.
- **Consequences**: (1) preserves login-by-internal-email (auth compat) and the seeded
  data invariant; (2) changes BR-02 interplay and the auth login surface.
- **Blocked if unresolved?**: No.

### D-D — Person search depth in PEOPLE-2
- **Why real**: spec catalogues `people:person:search` with exact + fuzzy modes and
  full-text intent (§16 Planned infra); PEOPLE-G §15.6 explicitly defers heavy fuzzy
  to the P4.3 baseline.
- **Recommended option (1)**: implement exact publicID + email lookup and a
  tenant-scoped ILIKE name search now; defer pg_trgm fuzzy and ID-number sub-substring
  search to the later batch.
- **Alternative (2)**: implement full §10.2 fuzzy/exact with pg_trgm extension now.
- **Consequences**: (1) matrix items 6/9 are simpler; (2) adds an extension + bigger
  test surface to this batch.
- **Blocked if unresolved?**: No.

### D-E — Class/enrollment wiring depth
- **Why real**: the P4.2 checklist asks for "class/enrollment relationships as defined
  by the schema/spec". Writing `enrollment` rows (an Academics-owned table) from the
  People API crosses a domain ownership boundary that the frozen docs treat only for
  academic *records* (ADR-020 reference-only), not for class membership. The seed
  already demonstrates the combined write.
- **Recommended option (1)**: in one transaction — create Person + Student +
  StudentEnrollmentDetail + PersonInstitution(STUDENT) + Enrollment(classId,
  academicYearId) — mirroring the seeded precedent; `academic_session_id` stays NULL
  (D2).
- **Alternative (2)**: create only People-owned metadata (detail + person_institutions)
  and leave `enrollment`/`class` row-writes to Academics (later batch).
- **Consequences**: (1) delivers the roadmap item fully now with existing fixture data;
  (2) keeps the ownership boundary strict but leaves class wiring half-shipped.
- **Blocked if unresolved?**: No.

### D-F — Person required-field alignment (V-P-05 / V-P-06 vs schema nullability)
- **Why real**: V-P-05 says DOB required (schema allows NULL); V-P-06 says gender
  optional (schema requires non-null, no default). Two spec-vs-implemented
  inversions on the create DTO.
- **Recommended option (1)**: enforce V-P-05 (DOB required) at the DTO; treat gender as
  effectively required per the schema (no schema change).
- **Alternative (2)**: align schema to V-P-05/06 (make DOB NOT NULL, gender nullable) —
  requires a People schema migration in this batch.
- **Consequences**: (1) no DDL, keeps §6 rule; (2) triggers the migration path and
  touches the frozen foundation.
- **Blocked if unresolved?**: No.

Not decisions (resolved by frozen inputs — listed for completeness): status/enum
semantics (fixed); Person↔User bridge (fixed, no `User.personId`); public-ID format
(fixed in `people.utils.ts`); events/audit/no-outbox (D9 fixed); applicant seeding
deferred; permission names imported verbatim from §10.3; student lifecycle transition
authorization = `people:student:update` for every lifecycle PUT (no new permission).

## 12 Determination 09 — Batch boundary

- **PEOPLE-2 WILL**: §4 list (Person CRUD+search+profile+institution assignment;
  Student CRUD + enrollment detail + graduation/transfer/withdrawal + class/enrollment
  wiring; public IDs; internal-email D7; status ops; required fields D-F; delete/
  restore; events + audit). PLUS, per D-B option 1, the §8.3 role grants.
- **PEOPLE-2 WILL NOT** (even though P4.2 checklist mentions them): staff, guardians,
  parents-role flows, relationships, emergency contacts, documents, applicants,
  admissions V1, merge, bulk import, fuzzy search, photo blob storage, module-licensing
  guard, `academic_session_id` populating (D2), Finance/Academics/Identity event
  consumers, outbox.
- **PEOPLE-3**: Staff slice (staff CRUD, employment history, certifications,
  qualifications, departments/positions refs).
- **PEOPLE-4**: Parents, Guardians, Relationships, Emergency Contacts (+ People
  Documents per the D-A note).
- **PEOPLE-5**: Applicants + admissions V1, Person Merge, bulk import (D5), full-text/
  fuzzy search, P4.3 API quality pass completion, Phase-4 gate, optional operational
  grants if D-B chose option 2.

## 13 Recommended next action

1. Record the six decisions (§11) in the tracker/decision log.
2. On approval of D-A option 1 and D-B option 1 (the recommended set):
   - Begin PEOPLE-2 implementation — Person module first (routes, DTOs per V-P,
     service incl. D-C/D-D/D-F choices, guard wiring), then Student module (lifecycle
     per frozen transitions, class wiring per D-E).
   - Apply grants (seed change) + permission tests.
   - Implement the §10 test matrix; re-verify PEOPLE-1 regression suites.
3. Do not begin until this report and its decisions are authorised.

## 14 Determination 10 — Final verdict

**PEOPLE-2 READY — DECISIONS REQUIRED**

The PEOPLE-1 foundation satisfies every PEOPLE-2 dependency and no schema/migration
work or destructive operation is required. Six genuine, non-blocking decisions remain
(D-A..D-F; the recommended options are stated in §11). No implementation work has been
performed and none begins without authorisation.