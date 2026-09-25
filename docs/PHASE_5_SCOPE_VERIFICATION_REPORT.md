# PHASE 5 — ACADEMIC MANAGEMENT: SCOPE VERIFICATION REPORT

**Task:** Phase 5 (Academic) scope + architecture verification gate (READ-ONLY).
**Status of authoring:** containment — no production code, schema, migration, test,
seed, or configuration was modified, created, or deleted.
**Date:** 2026-09-23
**Verdict:** `PHASE 5 BLOCKED — ARCHITECTURAL CONFLICT`

---

## 1. Authoritative Phase 5 Source

| Source | Path | Coverage |
|--------|------|----------|
| Master roadmap (`PHASE 5 — ACADEMIC MANAGEMENT`) | `MASTER_SMS_ROADMAP.md` §"PHASE 5 — ACADEMIC MANAGEMENT" (lines 588–668) | Milestones P5.1–P5.8, Phase 5 gate (lines 664–666) |
| Academic Management Engineering spec (frozen v1.2, 2026-07-20) | `engineering/Academic Management Engineering.md` | 35 ADRs, 31 entities, 30 business rules (BR-01..BR-30), 55+ events, 35 tables, 12 enums, 15 modules, ~110 endpoints (§10.3), ~240 test scenarios (§11.2) |
| Cross-domain consumers | `engineering/Finance Engineering.md` (ADR-025, BR-025: Summer School billing via Academic events only), `engineering/Communication Engineering.md` (§5.2 events: AttendanceRecorded, AssignmentPublished, ResultPublished, StudentPlacedOnProbation, SummerSchoolRegistered), `engineering/00 README.md` lines 31–35 (dependency map) | Event contracts + money/notification ownership |
| Baseline schema + audits | `apps/api/prisma/domains/*.prisma`, `apps/api/prisma/schema-head.prisma`, `apps/api/prisma/seed.ts`, `CURRENT-STATE-AUDIT.md` | Current schema reality |
| Engineering-side roadmap | `engineering/ROADMAP.md` (secondary; master roadmap authoritative) | Tracking only |

## 2. Exact Phase 5 Scope

From `MASTER_SMS_ROADMAP.md` (lines 588–668):

- **P5.1 Academic structure** — academic sessions, terms, curriculum structures, subjects, classes, class memberships/enrollments, teacher assignments, required academic configuration.
- **P5.2 Attendance** — creation, updates, retrieval, role-based restrictions, tenant scoping, reporting inputs, duplicate prevention.
- **P5.3 Assessments and grades** — assessment setup, score entry, score validation, grade computation, teacher permissions, modification rules, auditability.
- **P5.4 Results** — computation, approval, publication, visibility, report-card data, historical result integrity.
- **P5.5 Assignments and timetable** — assignments, submissions where specified, lesson/academic resources where specified, timetable, teacher/student visibility.
- **P5.6 Academic Recovery** — approved recovery/summer-school behavior; preserves original results and configured attainable-grade rule (`Academic Management Engineering.md` §13).
- **P5.7 Academic Probation** — approved probation rules/visibility/workflow (spec §12 progression + probation events).
- **P5.8 Academic integrity tests** — teacher/class-subject boundaries, student/parent mutation blocked, published results immutable, cross-tenant blocked, deterministic calculations, concurrent updates.

Spec "In Scope" (§1 of the engineering spec): calendar, curriculum, class structure, student enrollment/placement, subject registration, staff teaching assignments, timetable, attendance, assignments, assessments, grading, results, report cards, academic progression (promotion, retention, graduation, withdrawal), probation, Summer School, configurable academic policies.

Spec "Out of Scope" (§1): authentication/authorization/roles/permissions/MFA/sessions (Identity), person profiles (People), institution configuration (Institution), billing/payments/invoices (Finance), messaging/notifications (Communication), CBT delivery + learning content repo + document storage (Platform/Documents), RFID attendance hardware (Smart Campus).

## 3. Current Implementation Inventory

**Modules/API/test: complete absence of an Academic implementation.**

- `apps/api/src/modules/` = exactly 9 modules: `audit, auth, delivery, identity, institutions, invitations, onboarding, people, session`. No `academics/*`.
- `app.module.ts:23-45` registers only those 9. No guard/controller/service/DTO/tests named `academic|attendance|subject|term|timetable|enrollment|assessment|grade|result|progression`.
- No `academics:*` permission anywhere in code/seed/SQL (the only occurrences are inside the frozen engineering spec, lines 85, 1536–1714+).
- `common/guards/object-scope.guard.ts:198-242` `selectMap` has identity/people/institutions entries only — no academic model.
- `modules/audit/audit-log.consumer.ts` has no `academics.*` action mappings.
- No academic e2e/unit specs in `apps/api/test/`.
- Web frontend has static mock pages only (no API backing) — out of scope for this gate (Phase 11).

**Schema: legacy baseline tables exist and are woven across domain files (no API).**

| Legacy model | File (model) | Referenced-by (relations) |
|---|---|---|
| AcademicYear | `prisma/domains/academic.prisma:1` | Institution (institution.prisma:79), finance FeeStructure/Invoice (finance.prisma:19,49), documents Assignment (documents.prisma:42), people (via enrollment) |
| Term | `academic.prisma:27` | finance FeeStructure/Invoice (finance.prisma:20,50), operations MaintenanceRequest/LeaveRequest (operations.prisma:161,196), documents LibraryBook (BookLoan), people |
| Curriculum | `academic.prisma:54` | Institution (institution.prisma:83) |
| Subject | `academic.prisma:76` | Institution (institution.prisma:84), Department (institution.prisma:118), Class (academic.prisma:118), people |
| Class | `academic.prisma:101` (`subjectId` NOT NULL) | Institution (institution.prisma:82), operations Attendance (operations.prisma:14), documents Assignment/Submission (documents.prisma:40,69), people Staff (people.prisma:397-398), documents LibraryBookCopy |
| Enrollment | `academic.prisma:132` (year-scoped) | people Student (people.prisma:233), Seed fixture |
| Grade | `academic.prisma:156` | people Staff (people.prisma:399) |
| Result | `academic.prisma:181` (term-level aggregate; mutable; soft-del) | — |
| Attendance | `operations.prisma:1` (per class+student+date) | people Student (people.prisma:235) |
| Assignment/Submission | `documents.prisma:25,50` | academic.prisma Class/Student back-arrays |
| Department | `institution.prisma:105` (Institution-owned) | academic Subject FK |

- Seed `apps/api/prisma/seed.ts:80-151,871-911` creates fixture rows (academicYear/term/curriculum/subjects/classes/enrollments/invoices).
- No live service/test code touches these tables (verified: zero `prisma.enrollment|academicYear|...` references in `src/modules` or `test/`).

**Status per roadmap deliverable:**

| Deliverable | Status |
|---|---|
| P5.1 Academic structure (sessions/terms/curriculum/subjects/classes/enrollments/teacher assignments/config) | **NOT IMPLEMENTED.** Legacy tables partially present but architecturally incompatible (no AcademicSession, Class keyed by subjectId, year-scoped enrollment, no TeachingAssignment/Arm/Homeroom/Stream table). |
| P5.2 Attendance | **NOT IMPLEMENTED.** Legacy `operations.Attendance` incompatible (no `subject_id`, no per-subject-per-day uniqueness — spec ADR-007). |
| P5.3 Assessments and grades | **NOT IMPLEMENTED.** No Assessment/AssessmentResult/GradeScale/GradeBoundary/Remark models anywhere; legacy `Grade` is a flat CA+Exam row, no assessment objects. |
| P5.4 Results | **NOT IMPLEMENTED.** Legacy `Result` is a term-level aggregate (per enrollment+year+term) with mutable/soft-delete columns — contradicts spec (subject-level immutable Result, ResultStatus COMPILED/APPROVED/PUBLISHED, `version_number` corrections, no soft delete). No ReportCard. |
| P5.5 Assignments + timetable | **NOT IMPLEMENTED.** Legacy documents Assignment/Submission incompatible (single dueDate, no submission window/max_score/attachments JSON); no Timetable/TimetableSlot anywhere. |
| P5.6 Academic Recovery (Summer School) | **NOT IMPLEMENTED** (no table/module; spec §13). |
| P5.7 Academic Probation | **NOT IMPLEMENTED** (progression domain + probation events absent). |
| P5.8 Integrity tests | **NOT IMPLEMENTED.** |
| Core domain artifacts (events §5.8, services §6.3, repos §9.2, 15 modules §9.1) | **NOT IMPLEMENTED.** |
| Permissions/ObjectScope/audit wiring | **NOT IMPLEMENTED** (no `academics:*` strings, no ObjectScope entries, no audit mappings). |

## 4. Schema Reconciliation

The frozen spec (§8) defines **35 models / 12 enums**. Reconciliation of each against the merged schema (`schema-head.prisma` + 11 domain files via `scripts/merge-schemas.mjs`):

- **Purely net-new (additive, no name collision)**: `AcademicSession`, `GradeLevel`, `Stream`, `Arm`, `Homeroom`, `TeachingAssignment`, `Timetable`, `TimetableSlot`, `StudentClassEnrollment`, `SubjectRegistration`, `Assessment`, `AssessmentResult`, `GradeScale`, `GradeBoundary`, `Remark`, `ReportCard`, `AcademicProgression`, `AcademicPolicy`, `SummerSchoolSession`, `SummerSchoolRegistration`, `SummerSchoolResult`, `SubjectGroup`, `SubjectSubjectGroup` (~23 models).
- **Table-name/structural collision with legacy baseline** (`@map` names taken; shapes incompatible): `academic_years`, `terms`, `subjects`, `classes`, `results`, `attendance`, `assignments`, `submissions`, `departments`. The spec structures differ fundamentally (session hierarchy; `Class.grade_level_id` vs legacy `Class.subject_id` NOT NULL; subject-level results; per-subject-per-day attendance; submission windows), so additive column extension cannot satisfy the spec.
- **Enum collisions**: legacy `EnrollmentStatus {ACTIVE, COMPLETED, TRANSFERRED, WITHDRAWN}` (schema-head:38) vs spec `{ENROLLED, ACTIVE, TRANSFERRED, WITHDRAWN}`; legacy generic `UserRoleStatus {ACTIVE, INACTIVE, SUSPENDED}` is reused across legacy academic models. Spec requires ~20 domain enums (AcademicYearStatus, SessionStatus, TermStatus, SubjectStatus, DepartmentStatus, GradeLevelStatus, ClassStatus, TeachingRole, TimetableStatus, DayOfWeek, RegistrationStatus, AttendanceType, AssignmentStatus, SubmissionStatus, AssessmentType, AssessmentStatus, GradeScaleStatus, ResultStatus, ReportCardStatus, ProgressionType, PolicyStatus, SummerSchoolStatus, SSRegistrationStatus, CostModel). `AttendanceStatus` values already match.
- **Ownership boundary**: spec §8 explicitly wants cross-domain Staff/Student references as UUID-without-DB-constraint; the baseline embeds real Prisma FKs from people/finance/operations/documents/institutions into the legacy academic tables. Executing the spec therefore means **removing or re-pointing legacy relations inside `people.prisma` (People seal), `finance.prisma`, `operations.prisma`, `documents.prisma`, `institution.prisma`** — a destructive/entangled migration, with seed fixture remap and a rollback plan required (roadmap §5 DB rules; Architecture Freeze §4 "Major" category).

**Conclusion:** implementing the frozen Phase 5 schema requires either replacing/renaming the legacy baseline academic tables (destructive migration touching five frozen-domain schema files) or an approved coexistence scheme. This cannot be decided from the frozen specs.

## 5. API Catalogue

From `engineering/Academic Management Engineering.md` §10.3 (global prefix `api/v1`, envelope §10.1, list params §10.2). All endpoints require JWT auth; permissions per column. (~106 endpoints.)

| Resource | Method | Route | Permission | Scope |
|---|---|---|---|---|
| Years | GET/POST | `/academics/calendar/years` | read/create | institution |
| Years | GET/PUT | `/academics/calendar/years/:id` | read/update | institution |
| Years | POST | `/academics/calendar/years/:id/open` `/…/close` | manage | institution |
| Sessions | GET/POST | `/academics/calendar/years/:yearId/sessions` | read/create | institution |
| Sessions | PUT | `/…/sessions/:id` | update | institution |
| Sessions | POST | `/…/sessions/:id/activate` `/…/close` | manage | institution |
| Terms | GET/POST | `/academics/calendar/sessions/:sessionId/terms` | read/create | institution |
| Terms | PUT | `/…/terms/:id` | update | institution |
| Terms | POST | `/…/terms/:id/activate` `/…/close` | manage | institution |
| Subjects | GET/POST | `/academics/curriculum/subjects` | read/create | institution |
| Subjects | GET/PUT | `/academics/curriculum/subjects/:id` | read/update | institution |
| Departments | GET/POST | `/academics/curriculum/departments` | read/create | institution |
| Departments | GET/PUT | `/academics/curriculum/departments/:id` | read/update | institution |
| GradeLevels | GET/POST | `/academics/classes/grade-levels` | read/create | institution |
| GradeLevels | PUT | `/academics/classes/grade-levels/:id` | update | institution |
| Classes | GET/POST | `/academics/classes` | read/create | institution |
| Classes | GET/PUT | `/academics/classes/:id` | read/update | institution |
| Classes | GET | `/academics/classes/:id/students` | read | institution |
| TeachingAssignments | GET/POST/PUT/DELETE | `/academics/teaching-assignments[/:id]` | read/create/update/delete | institution |
| Timetables | GET/POST | `/academics/timetables` | read/create | institution |
| Timetables | GET/PUT | `/academics/timetables/:id` | read/update | institution |
| Timetables | POST | `/academics/timetables/:id/publish` | manage | institution |
| Timetables | POST/PUT/DELETE | `/academics/timetables/:id/slots[/:slotId]` | update | institution |
| Timetables | GET | `/academics/timetables/teacher/:staffId` | read | institution |
| Enrollments | GET/POST | `/academics/enrollments` | read/create | institution |
| Enrollments | GET/DELETE | `/academics/enrollments/:id` | read/delete | institution |
| Enrollments | POST/DELETE | `/academics/enrollments/:id/subjects[/:subjectId]` | update | institution |
| Attendance | GET/POST | `/academics/attendance` | read/create | institution |
| Attendance | PUT | `/academics/attendance/:id` | update | institution |
| Attendance | POST | `/academics/attendance/bulk` | create | institution |
| Attendance | GET | `/academics/attendance/report` | read | institution |
| Assignments | GET/POST | `/academics/assignments` | read/create | institution |
| Assignments | GET/PUT | `/academics/assignments/:id` | read/update | institution |
| Assignments | POST | `/academics/assignments/:id/publish` | manage | institution |
| Assignments | GET/POST | `/academics/assignments/:id/submissions` | read/submit | institution |
| Assignments | PUT | `/…/submissions/:submissionId/grade` | grade | institution |
| Assessments | GET/POST | `/academics/assessments` | read/create | institution |
| Assessments | GET/PUT | `/academics/assessments/:id` | read/update | institution |
| Assessments | POST | `/academics/assessments/:id/publish` | manage | institution |
| Assessments | POST | `/academics/assessments/:id/results[/bulk]` | grade | institution |
| Grading | GET/POST | `/academics/grading/scales` | read/create | institution |
| Grading | GET/PUT | `/academics/grading/scales/:id` | read/update | institution |
| Grading | POST/PUT/DELETE | `/academics/grading/scales/:id/boundaries[/:boundaryId]` | update | institution |
| Results | GET/POST | `/academics/results` | read | institution |
| Results | GET | `/academics/results/:id` | read | institution |
| Results | POST | `/academics/results/compile` | compile | institution |
| Results | POST | `/academics/results/:id/approve` | approve | institution |
| Results | POST | `/academics/results/publish` | publish | institution |
| Results | GET/POST | `/academics/results/report-cards[/generate]` | read/generate | institution |
| Results | GET/POST | `/academics/results/report-cards/:id(/:publish)` | read/publish | institution |
| Results | GET | `/academics/results/rankings` | read | institution |
| Progression | GET | `/academics/progression[/pending|probation]` | read | institution |
| Progression | POST | `/academics/progression/evaluate` | evaluate | institution |
| Progression | POST | `/academics/progression/:id/approve` | approve | institution |
| Progression | POST | `/academics/progression/promote|retain` | manage | institution |
| Summer School | GET/POST | `/academics/summer-school/sessions[/:id]` | read/create | institution |
| Summer School | PUT/POST | `/…/:id` `/…/:id/open` | update/manage | institution |
| Summer School | GET/POST | `/…/:id/registrations[/register]` | read/register | institution |
| Summer School | POST | `/…/:id/results/compile|publish` | compile/publish | institution |
| Policies | GET/POST | `/academics/policies` | read/create | institution |
| Policies | GET/PUT | `/academics/policies/:id` | read/update | institution |
| Policies | GET | `/academics/policies/history` | read | institution |

Envelope/validation conventions apply as-is (`singleEnvelope`/`listEnvelope`, `{success:false,error:{code,message,details[]}}`, `ValidationPipe` with `forbidNonWhitelisted`, global `api/v1` prefix, list params page/limit ≤100/search/sortBy/sortOrder/status/institutionId/academicYearId/termId).

## 6. Authorization / Permission Matrix

- Permission model (frozen Phase 2): two-column `Permission(resource, action)` (identity.prisma:76-87), `RolePermission` join (89-100), compound key derived at runtime (`identity.utils.ts:54`). `academics:{resource}:{action}` is a namespaced extension of this model.
- Enforcement chain to use (frozen Phase 2/4): `@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)` class-level + method-level `@Permissions(...)` + `@ObjectScope(...)`; `PermissionGuard` reads handler metadata only (method-level permission required — see People-5 merge fix).
- Resource tokens required by spec §10.3: `calendar, subject, department, grade_level, class, teaching, timetable, enrollment, attendance, assignment, assessment, grading, result, progression, summer_school, policy` with actions `read/create/update/delete/manage/submit/grade/compile/approve/publish/evaluate/register/generate`.
- **Gap:** the frozen specs define neither the **institute-vs-platform grant split** nor the **role→grant matrix** for these resources. Behavioral anchors exist but are incomplete: spec §11.2 (teacher scoped to own class/subject; students/parents read-only own scope); P-12 approval authority default `{CLASS_TEACHER, HEAD_TEACHER, PRINCIPAL}` — but **`HEAD_TEACHER` is not in the seeded/authoritative Role catalogue** (roles: PLATFORM_ADMIN, ORG_ADMIN, PRIMARY_INSTITUTION_ADMIN, INSTITUTION_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, HOSTEL_ADMIN, CLINIC_ADMIN, LIBRARIAN, TRANSPORT_MANAGER, HR_OFFICER, STUDENT_MANAGEMENT_OFFICER, BURSAR), and `CLASS_TEACHER` is a `TeachingAssignment` role type (spec `TeachingRole`), not an RBAC Role. New-permission string names + grant mapping require a Phase-2-style RBAC decision.
- No `academics:*` grants exist in seed; creation touches the seeded catalogue (identity rolePermission blocks seed.ts:407-527).

## 7. Tenancy / Scope Model

- Tenant: JWT `req.user.tenantId`; institution: `req.user.institutionId` resolved from **first ACTIVE `institutionMembership`** (auth.service resolveInstitutionId). No client-supplied ids trusted (guards fail closed). Reuse as-is.
- Institution scope enforcement for academic resources: `ObjectScopeGuard` `institution` type (object-scope.guard.ts:141-187) or the `institutions` module `InstitutionScopeGuard` pattern — the established mechanism; requires **new `selectMap` entries** in `object-scope.guard.ts:198-242` for the ~20 institution-scoped academic models (id, tenantId, institutionId) and tenant-scoped for join/child tables (`timetable_slots`, `subject_registrations`, `assessment_results`, `assignment_submissions`, `grade_boundaries`, `remarks`, `arms`, `homerooms`). Spec requires ACTIVE institution membership for all institution-scoped operations (TI-002: unassigned institution → 403).
- No new tenant model, no RLS — consistent with ADR-014 (`Academic Management` ADR-014) and Phase 2 (application-level filtering).

## 8. People Integration

- Student/Staff are People-owned (`Student` people.prisma:205-251, `Staff` 369-412; identity on `Person`). Academic references via `student_person_id` / `staff_person_id` UUIDs (spec §8 without DB constraint; ADR-032: internal UUIDs; display via P-/STU-/EMP- prefixes).
- **Enrollment ownership:** People maintain a **summary** `StudentEnrollmentDetail` (student_enrollment_details: gradeLevel/className/stream text; academic_session_id deferred — people.prisma header lines 20-24, frozen-spec deviation D2). The authoritative **term-scoped** placement is Academic's `StudentClassEnrollment` (spec ADR-010/ADR-026). Coexistence is intended; Academic must wire the deferred `student_enrollment_details.academic_session_id` and `student_academic_records.academic_session_id` FKs **once `AcademicSession` exists** — an additive but cross-seal change to `people.prisma`.
- ADR-031: StudentEnrolled/StaffHired events drive academic record creation. Event names match the existing `people.events.ts` (`StudentEnrolled`, `StaffHired`); the Academic `PeopleConsumer` (spec §9.6) is new.
- Student/Staff self-service (parent visibility, own-result visibility) must align with the People self-service mechanism (`SELF_SERVICE_ROLES = ['PARENT','STUDENT']`, people-scope.guard.ts:41).

## 9. Events / Audit Requirements

- Reuse EventEmitter2 + canonical append-only audit (`audit-log.consumer.ts` + `audit_logs` trigger). Event naming `{Entity}{PastTenseVerb}` already matches the repo convention (`people.events.ts`).
- Spec §5.8 event catalogue (55+): AcademicYear* / AcademicSession* / Term* / Subject* / Department* / GradeLevel* / Class* / TeachingAssignment* / TimetablePublished / StudentClassEnrolled|Transferred|SubjectRegistered|Dropped / AttendanceMarked|Corrected / Assignment* / Assessment* / GradeScale* / ResultCompiled|Approved|Published / ReportCard* / StudentPromoted|Retained|Graduated|Withdrawn|PlacedOnProbation|RemovedFromProbation|ConditionallyPromoted / SummerSchool* / AcademicPolicy*.
- Consumers (spec §9.6): AuditLogConsumer (all), PeopleConsumer (enrollment/progression events), NotificationConsumer (5 academic events), FinanceConsumer (**SummerSchoolRegistered → fee assignment only; Finance owns money** — finance.prisma/ADR-025), AttendanceConsumer, ProgressionConsumer (ResultPublished → evaluate), SummerSchoolConsumer (TermClosed), PolicyConsumer (invalidate).
- **Gap vs current convention:** spec §9.6/9.7 wants a versioned envelope (`eventId, eventVersion, schemaVersion, occurredAt, correlationId, causationId, tenantId, actorId`) with **eventId idempotency + 72h dedupe**; the current repo events carry `tenantId, actorId?, actorEmail?, entityId, version?, changes?, correlationId?` without eventId/causationId/dedupe. Aligning academic events to the full spec envelope is a shared-pattern extension needing agreement.
- Transaction coupling: current `$transaction` then synchronous emit matches spec (defer until commit).

## 10. Test / Verification Plan (expected surface)

- Unit: per service/repo for the 15 modules (spec §11.2 ~240 scenarios; 90%+ coverage target per §11.1).
- E2E: `apps/api/test/academics.e2e-spec.ts` (or per-module) using the deterministic serial protocol (`--runInBand`, isolation-aware audit `waitFor`, single shared test DB) established in P4/People-5.
- Security: 17 categories incl. TI-001..TI-008 (§11.3), permission matrix (incl. teacher class/subject scoping, student/parent read-only, HEAD_TEACHER-equivalent approval), result immutability, concurrent score updates (BR-23/§5.8, EDGE, §12 concurrency), deterministic calculations.
- Migration verification: schema reset prisma db push + seed on clean `openschool_test`; no drift.
- Regression must stay green: all 19 e2e suites + 21 unit suites + tsc/nest/prisma gates + People 47-file seal + identity/institutions/audit suites.

## 11. Dependency Order (proposed batches, strictly within Phase 5)

1. **Schema decision** (see §13 D-1) + academic domain Prisma models per spec §7/§8 + migration + seed remap — gate for everything else.
2. Permissions seed (`academics:*` per §10.3) + ObjectScope `selectMap` additions + role-grant mapping (after D-2).
3. Core structure services: AcademicCalendar (Year/Session/Term), Curriculum, ClassStructure — repos + lifecycle + validation (BR-02..05, V-*).
4. Placement (StudentClassEnrollment, SubjectRegistration, electives, prerequisites BR-11..15) + TeachingAssignment (BR-16, BR-30).
5. Timetable (clash detection, publish).
6. Attendance (per-subject-per-day, correct, duplicate prevention BR-18).
7. Assignments (submission windows, grading).
8. Assessments + Grading (weights, boundaries).
9. Results + ReportCards (compile/approve/publish/immutability BR-21..24, rankings).
10. Policies (versioning) → Progression engine → Probation (BR-25..29, §12).
11. Summer School (eligibility, max-grade cap, finance event only).
12. Events/audit + cross-domain consumers (People/Finance/Communication hooks — events only).
13. Tests, serial e2e, security + regression; completion report.

Dependencies: 1 → all; 2 → API wiring; 3 → 4/5/6/7/8/9/10; 4 → 9/10; 8→9; 9→10/11; 3+6+8+9 → progression; 12 parallel to 3-11.

## 12. Deferred / Out-of-Scope Items (do NOT implement in Phase 5)

- Finance: fees/invoices/payments/balances/Summer School billing — **Finance owns money (Finance ADR-025; Academic emits `SummerSchoolRegistered` only)** → Phase 6.
- Communication: notifications/sms/email/chat — consumes Academic events → Phase 9.
- Operations: hostel/transport/library/clinic/inventory — Phase 7 (legacy `operations.Attendance` belongs to Academic per spec §7; hostel/transport tables already exist but unexposed → Phase 7).
- Documents storage/S3 + CBT/learning content: Phase 8 (Assignment attachments are file *references* only, ADR-008).
- Reporting/analytics dashboards, exports: Phase 10 (Attendance/results reports listed in §10.3 are functional reporting *inputs*, in scope; dashboards are not).
- Frontend/mock-page integration: Phase 11. Platform admin/licensing/module gates: spec §9.5 `ModuleLicenseGuard` — licensing is Institution Management (P4.1 deferred module-licensing; keep license guard design but no licensing backend).
- Smart Campus/RFID, bulk CSV enrollment, timetable auto-generation, PDF report cards: spec §15 "Outstanding Items" = Future.

## 13. Decisions Required (genuinely unresolvable from frozen sources)

- **D-1 — Legacy academic table disposition (BLOCKING, destructive-migration trigger).** The frozen Academic schema (§8) cannot be realized additively: `academic_years/terms/subjects/classes/results/attendance/assignments/submissions/departments` already exist (baseline init migration + seed) with different shapes and are relationally referenced by five frozen-domain schema files (finance FeeStructure/Invoice; operations Attendance/MaintenanceRequest/LeaveRequest; documents Assignment/Submission/LibraryBookCopy; institution Institution/Department; people Student/Staff/StudentEnrollmentDetail). Options: (a) replace/rename legacy tables and re-point/remove FKs in the five files (destructive migration + People-seal touch + data-migration/rollback plan, roadmap §5, Freeze §4 "Major"); (b) ship spec tables under new table names beside legacy, preserve legacy for later-phase consumers; (c) treat Institution-spec's `academic_sessions/academic_terms/academic_holidays` as the canonical calendar config and accept a dual-calendar model. **Cannot be resolved autonomously** (conflicts with frozen People/P4 relations + two frozen specs disagree — see D-3). HARD STOP.
- **D-2 — `academics:*` role-grant matrix + approval authority roles.** Spec defines permission *strings* and behavioral expectations but no role→grant table; P-12 approval authority references `CLASS_TEACHER/HEAD_TEACHER/PRINCIPAL`, and **`HEAD_TEACHER` is not an RBAC Role** (and `CLASS_TEACHER` is a `TeachingRole` value, not an RBAC Role). Options: map to existing roles (e.g., PRINCIPAL) with a documented matrix (Phase-2-style), or request a new role (Phase 1/2 change-control). **Needs decision.**
- **D-3 — Academic calendar/Department ownership across two frozen specs.** `Institution Management Engineering.md` (frozen) claims `Academic Calendar Configuration — Sessions, Terms, Semesters, Holidays` (line 192) and tables `academic_sessions/academic_terms/academic_holidays` (lines 536-538) and `academic policies` in Institution Configuration (line 191); `Academic Management Engineering.md` (frozen) owns Year/Session/Term + Departments + AcademicPolicy as Academic aggregates (ADR-001/020, §8). Same-named tables/semantics in both — requires an ownership ruling. **Needs decision.**
- **D-4 — Event envelope contract.** Spec §9.6 wants `eventId/causationId` + idempotency dedupe (72h); the current EventEmitter2 convention (established in People/P4) does not carry these. Adopt the spec envelope (shared-pattern extension) or align Academic to the existing convention. **Needs decision.**

Resolvable WITHOUT decision (from frozen architecture): tenant/institution scope mechanism; ObjectScope `selectMap` registration approach; permission two-column model; envelope/validation/pagination conventions; soft-delete/`deleted_at/deleted_by/version` common columns; post-transaction event emission; append-only audit storage; "Finance owns money; Academic emits billing events"; "People owns person records + summary enrollment; Academic owns authoritative term placement".

## 14. Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R-1 | Destructive schema migration across 5 frozen domain files + People seal (D-1) | Critical | Decision + change-control per Freeze §4; data-migration/rollback plan; serial e2e regression evidence |
| R-2 | Cross-spec calendar/Department ownership ambiguity (D-3) | High | Ownership ruling before any schema work |
| R-3 | Unseeded RBAC grants / HEAD_TEACHER role gap (D-2) → approval-path bypass or over-grant | High | Matrix decision + permission-grant e2e before results/progression APIs |
| R-4 | Result immutability + concurrency (BR-23, spec §5.8) if legacy mismatch persists | High | Subject-level immutable Result model; version/409; integrity tests |
| R-5 | Event-envelope divergence (D-4) — missed idempotency if skipped | Medium | Decide envelope before cross-domain consumers |
| R-6 | Parallel e2e flakiness (established harness limitation) | Medium | Serial `--runInBand` protocol + audit `waitFor` |
| R-7 | Scale (35 models / ~106 endpoints / ~240 tests) drift from spec | Medium | Batch completion checks per §11 |

## 15. Final Readiness Verdict

### `PHASE 5 BLOCKED — ARCHITECTURAL CONFLICT`

Grounds (each independently a HARD STOP per the gate rules):

1. **Sacrificial/destructive migration required** (D-1): the frozen Academic schema collides with the baseline academic tables that completed People/P4 and 4 other frozen-domain schema files relationally reference; realizing the spec requires replacing/renaming those tables or a coexistence ruling.
2. **Conflict between two already-frozen engineering specs** (D-3): Institution Management claims academic-calendar/session/term + academic-policies configuration; Academic Management claims the same entities as its own aggregates and tables.
3. **Completed People/P4 architecture touch-point** (D-1/D-8): Academic wiring requires editing `people.prisma` (People seal) for the deferred `academic_session_id` FKs and re-pointing legacy Student/Staff relations.
4. **Unclear ownership of critical academic data** (calendar hierarchy, Departments, enrollment state partition) not resolvable from frozen documents.

**Stopping here, per the change-control rule (MASTER_SMS_ROADMAP.md §9, Architecture Freeze §4).** No autonomous workaround will be chosen that alters frozen architecture without human decision.

## 16. Read-Only Confirmation

- No production code, Prisma schema, migration, seed, test, documentation outside this report, or configuration was created or modified.
- No commits/pushes.
- This report is the sole artifact produced.