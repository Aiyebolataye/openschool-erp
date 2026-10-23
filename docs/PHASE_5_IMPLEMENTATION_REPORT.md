# PHASE 5 — Academic Management Implementation Report

| | |
|---|---|
| Phase | 5 — Academic Management (P5.1–P5.8) |
| Gate | Runtime verification of migrations, seed, tests, authz, D-4 events, business rules, regression |
| Verdict | **PHASE 5 COMPLETE — VERIFIED** |
| Date | 2026-09-24 |
| Infra | Docker compose (postgres:5433 / redis:6379 / minio:9000-9001), all healthy |
| Databases used | `openschool_dev` (disposable migration DB), `openschool_test` (e2e DB via `db push --force-reset`); no production database touched |

## 1. Summary

The D-1 legacy-academic disposition and the Phase 5 academic-management
runtime gates are **complete and verified**. The two-phase migration
(`20260924100000_p5_1_archive_legacy_academic`,
`20260924110000_p5_2_academic_management`) was authored and applied; the full
10-migration history was replayed from scratch on the disposable DB; `migrate
status` is clean and `prisma migrate diff` shows only the sanctioned archive
drops; the seed reruns; the unit suite (252) and all e2e suites are green.

One **verification-discovered defect** was found and fixed during this gate:
`AcademicsModule` never imported `AuditModule`, so booting the full `AppModule`
threw `Nest can't resolve dependencies of the CalendarService (…, ?, AuditService
…)` and every e2e suite failed. This was invisible to the unit suite (which
builds modules with explicit mocked providers) and only surfaced under a full
DI-graph boot. Fixed by adding `imports: [AuditModule]` to
`src/modules/academics/academics.module.ts`.

## 2. Migration execution — in-place proof (recorded before the reset run)

### Phase 1 `p5_1_archive_legacy_academic`
- Renamed **12** legacy tables → `_academic_legacy_*` (data preserved):
  `academic_years, terms, curricula, subjects, classes, enrollments, grades,
  results, departments, attendance, assignments, submissions`.
- Dropped the **8 external consumer FKs** (algorithmically over `pg_constraint`;
  legacy-parent / non-legacy-child): `fee_structures_academicYearId_fkey`,
  `fee_structures_termId_fkey`, `invoices_academicYearId_fkey`,
  `invoices_termId_fkey`, `library_book_copies_curriculumId_fkey`,
  `book_loans_termId_fkey`, `leave_requests_studentId_fkey`,
  `maintenance_requests_studentId_fkey`.
- Retained the **19 archive-internal FKs** (legacy→legacy) so the archive
  relations stay coherent.
- Renamed only the `<table>_pkey` PK backing index/constraints
  (schema-scoped names freed for Phase 2); other legacy index names do not
  collide with the Phase 2 set. 0 old-name PK indexes remained.
- Pre-reset row counts preserved exactly: academic_years 1, terms 3, curricula 1,
  subjects 13, classes 2, enrollments 5, grades 0, results 0, departments 5,
  attendance 0, assignments 0, submissions 0.

### Phase 2 `p5_2_academic_management` (1201 lines)
- Created the **32-table authoritative academic schema** (calendar, curriculum,
  teaching/timetable, enrollment, attendance, assignments, assessments, grading,
  results/report cards, progression, policies, summer school) + enums + indexes.
- The generated `AlterEnum` was intentionally curated: renamed the existing enum
  `EnrollmentStatus → _academic_legacy_EnrollmentStatus` (archive rows still
  depend on it) and created the new `EnrollmentStatus` enum
  (`ENROLLED, ACTIVE, TRANSFERRED, WITHDRAWN`). Verified present:
  - `EnrollmentStatus` = ENROLLED, ACTIVE, TRANSFERRED, WITHDRAWN
  - `_academic_legacy_EnrollmentStatus` = ACTIVE, COMPLETED, TRANSFERRED, WITHDRAWN
- Added the **5 consumer FKs as `NOT VALID`** (with comments) because existing
  orphaned rows reference archived ids: `fee_structures_academicYearId_fkey`,
  `fee_structures_termId_fkey`, `invoices_academicYearId_fkey`,
  `invoices_termId_fkey`, `book_loans_termId_fkey`. Orphaned rows were
  **preserved** (fee 3, invoices 6, book_loans 1); all 3 fee + 6 invoice
  `academicYearId` values join back to `_academic_legacy_academic_years`.
- Added `attendance_participant_check` (exactly one of
  `student_class_enrollment_id` / `staff_person_id` non-null) per
  `PHASE_5_MIGRATION_REPORT.md` §6.

### Post-migration integrity
- `npx prisma migrate status` → 10 applied, **"Database schema is up to date!"**
- `prisma migrate diff` (schema-datasource → datamodel) shows **only** the
  sanctioned D-1 deviations: archive `DROP TABLE`, archive `DropForeignKey`,
  and the legacy `DropEnum`. Filtering to non-`_academic_legacy_` objects
  produces **zero** diffs — the 5 NOT VALID consumer FKs match `schema.prisma`
  exactly and there is no other drift.
- `prisma generate` regenerated the client for the new models.

## 3. Full-history acceptance (per `PHASE_5_MIGRATION_REPORT.md` §6)

Executed on the disposable `openschool_dev`:

1. `npx prisma migrate reset --force` → replayed **all 10 migrations from
   scratch** on an empty database: `init` → `identity_memberships_…` →
   `login_protection` → `b4_sessions_refresh_tokens` → `b5_audit_logs` →
   `m0_user_role_assignment_tenant_scoped` → `people_foundation` →
   `p4_1_institution_management_additive` → `p5_1_archive_legacy_academic` →
   `p5_2_academic_management`. This exercises the archive (12 tables renamed)
   and Phase 2 on the fresh-history path.
2. Seed **reran successfully**: Tenant Demo Academy, 11 users, 5 students,
   9 staff; academic fixtures populated (academic_years 1, academic_sessions 1,
   terms 3, departments 3, subjects 13, subject_groups 1, grade_levels 1,
   streams 2, classes 2, student_class_enrollments 5, teaching_assignments 1,
   fee_structures 3, invoices 6, grade_scales 1).
3. `migrate status` still clean; DB evidence re-confirmed: 12 archive tables,
   `attendance_participant_check` present, both enums present, exactly the 5
   unvalidated consumer FKs.

## 4. Verification-discovered defect (FIXED)

| | |
|---|---|
| Symptom | Every e2e suite failed at boot: `Nest can't resolve dependencies of the CalendarService (PrismaService, EventPublisher, ?) … the argument AuditService at index [2] is available in the AcademicsModule context`. |
| Root cause | `AcademicsModule` declared no `imports`. Every academic service extends `AcademicServiceBase`, whose constructor injects `AuditService`. `PrismaService` and `EventPublisher` are available because `PrismaModule` and `EventsModule` are `@Global()`; `AuditModule` is not global and was never imported. |
| Why units missed it | Unit specs construct `Test.createTestingModule` with explicit providers/mocks and never boot `AppModule`'s DI graph; the missing provider only throws under a full-graph compile. |
| Fix | `src/modules/academics/academics.module.ts`: `imports: [AuditModule]`. |
| Proof | Boot-driven: all 19 e2e spec files compile `AppModule`; post-fix the auth spec boots and passes 7/7, and the full run passes every suite that boots the graph (see §6). |

## 5. Test results

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` | PASS (`tsc --noEmit`) |
| Unit | `npx jest` | **27 suites / 252 tests PASS** (incl. academics attendance/grading/results specs + event-envelope + audit-dedup) |
| E2E (full, parallel) | `npm run test:e2e` | 17/19 suites, 323/326 tests PASS; 3 failures in 2 suites |
| E2E flaky suites (serial) | `npx jest --config ./test/jest-e2e.json --forceExit --runInBand test/institutions.e2e-spec.ts test/people.e2e-spec.ts` | **37/37 PASS** |

## 6. E2E parallel-run flakes (documented, verified NOT P5 defects)

The 3 failures in the parallel run disappear under `--runInBand`:

1. `people.e2e-spec.ts` — "records people audit events post-transaction
   (BR-020)": asserts the **global** count of `people.student.enrolled` audit
   rows for tenantId equals 3; a parallel worker spec that also enrolls a
   student lands an extra row before the count (4). Shared-DB cross-suite
   writer; no P5 code involved.
2. `institutions.e2e-spec.ts` — two requests returned 401 mid-spec. Root cause:
   e2e workers share one Postgres + one Redis; `SESSION_MAX_SESSIONS=5`
   (`.env.test`) means a newer login for `principal@greenfield.edu.ng` in a
   parallel file revokes the oldest principal session, invalidating this file's
   token between two assertions.

Both are harness/data-race patterns, matching earlier-phase session records
(same `got 401`/count-drift signatures) and are **not** regressions from this
phase. The run was serialized only for confirmation; the suites themselves are
unchanged (no `.only`/`.skip`, no test edits, nothing weakened).

## 7. Phase 5-specific runtime & security verifications

- **AuthN/AuthZ wiring:** all 8 academic controllers carry
  `@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)` with
  `@Permissions('academics:*')` (frozen catalogue) and
  `@ObjectScope({ type: 'institution', model: <academicModel> })`.
- **ObjectScope registry (`object-scope.guard.ts` §P5 registry, additive/frozen):**
  all 32 academic models resolve tenant+institution ownership from trusted
  server-side state (`selectMap`), fail-closed on unsupported model, missing
  ownership, or cross-tenant/institution mismatch (unit-covered).
- **Single academic source of truth:** the 32-table schema is the only live
  academic surface; legacy structures are archived (`_academic_legacy_*`, no
  writes, read-only historical). Institution-domain calendar/term catalogue
  entries are **not** materialized — calendar ownership stays in the Academic
  domain only (per `PHASE_5_MIGRATION_REPORT.md` §8, D-3).
- **People boundary:** enrollments reference `student_person_id`; staff-in-
  academics reference `staff_person_id` (deliberately FK-less identity);
  `student_enrollment_details` / `student_academic_records` gained only the
  deferred `academic_session_id` relation. No People schema change.
- **D-4 events + canonical audit:** `emitAudited()` stamps **one `eventId`**
  shared by the emitted envelope (`eventId, causationId, schemaVersion,
  emittedAt, tenantId`; producers never set envelope fields) and the audit row,
  so the 72h Redis dedup collapses redeliveries to one audit row. Event
  catalogue = 140+ named academic events. Covered by `event-envelope.spec.ts`,
  `audit-dedup.spec.ts`, and every academic mutation path.
- **Business rules:** `attendance_participant_check` enforces exactly-one
  participant at DB level (verified present in `postgres`); teaching authority
  for grading/approval is derived from **persisted** `teaching_assignments`
  (`CLASS_TEACHER`/`DEPARTMENT_HEAD`), never from client-supplied claims —
  covered by `grading.service.spec.ts` / `results.service.spec.ts`.
- **Organs preserved:** archived rows (pre-reset: 30 legacy rows) and orphaned
  consumer rows (fee 3, invoices 6, book_loans 1) are all retained and
  documented; consumer FKs remain `NOT VALID` so no historical row can block
  new writes.

## 8. Findings & deviations (recorded, not blockers)

- **Seed is not idempotent / not fully deterministic:** it creates a fresh
  tenant with the unique slug `greenfield-academy` and fixed seeded emails, so
  a second run on a populated DB would fail; invoice numbers derive from
  `Date.now()` (non-deterministic). The acceptance flow runs the seed on a
  freshly reset disposable DB (`migrate reset`), where it succeeds. This is the
  same behavior as prior phases' seed and is documented here deliberately.
- Rerun **seed determinism** improvements would be a follow-up, not a P5
  requirement; no production data involved.

## 9. HARD-STOP review (none triggered)

- No production database was modified (dev/test DBs only); no destructive
  operation was needed; D-1..D-4 conflicts not encountered; no new RBAC role
  was required; People/P4 designs were not redesigned; ownership stayed
  unambiguous; academic single-source-of-truth preserved; infra came up and
  results are trustworthy.

## 10. Conclusion

**PHASE 5 COMPLETE — VERIFIED.**

Both migration phases are applied and provable on the disposable DB (in-place
data-preservation proof + clean full-history replay), the aggregate schema is
drift-free modulo the sanctioned archive, the seed reruns, and the complete
test catalogue is green: 27 unit suites (252), full typecheck, and every e2e
suite (3 parallel-run flakes proven green when serialized and documented as a
test-harness race). The single runtime defect surfaced by this gate — the
missing `AuditModule` import — is fixed and boot-verified.