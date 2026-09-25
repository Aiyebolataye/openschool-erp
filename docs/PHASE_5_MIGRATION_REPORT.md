# PHASE 5 — Legacy Academic Structure Disposition (D-1) Migration Report

| | |
|---|---|
| Phase | 5 — Academic Management |
| Decision | D-1 (locked by Full Phase Authorization) |
| Governed by | `engineering/Academic Management Engineering.md` §7–§8 (frozen v1.2); `MASTER_SMS_ROADMAP.md` P5.1–P5.8 |
| Database treated | Authoritative frozen Academic schema REPLACES legacy academic structures |
| Status | COMPLETE — D-1 executed and verified on a disposable DB. `20260924100000_p5_1_archive_legacy_academic` + `20260924110000_p5_2_academic_management` authored and applied; full history (10 migrations) replayed from scratch on `openschool_dev`; `migrate status` clean; `migrate diff` clean except the sanctioned archive drops; seed reruns; unit (252) + e2e suites green. See `PHASE_5_IMPLEMENTATION_REPORT.md` §5 for the verified acceptance matrix. |

## 1. Purpose

D-1 requires that the legacy academic structures be replaced/renamed/reconciled —
not silently dropped — with a **complete dependency inventory**, an **explicit
old-model → new-model mapping**, **preserved data where safely mappable**,
**documented unmappable data**, and a **documented rollback/recovery** path. This
report is that deliverable, together with the archive migration itself.

## 2. Dependency inventory (verified, read-only)

### 2.1 Legacy models/tables and their current consumer surface

| Legacy model (domain file) | Table | Final disposition |
|---|---|---|
| `AcademicYear` (`academic.prisma`) | `academic_years` | replaced by new `AcademicYear` |
| `Term` (`academic.prisma`) | `terms` | replaced by new `Term` (now under `academic_sessions`) |
| `Curriculum` (`academic.prisma`) | `curricula` | removed (concept realized via `subject_groups` in P5) |
| `Subject` (`academic.prisma`) | `subjects` | replaced by new `Subject` (FK `department_id`, no `curriculum_id`) |
| `Class` (`academic.prisma`) | `classes` | replaced by new `Class` (FK `grade_level_id`/`stream_id`) |
| `Enrollment` (`academic.prisma`) | `enrollments` | replaced by `student_class_enrollments` |
| `Grade` (`academic.prisma`) | `grades` | removed (realized via `assessments`/`assessment_results`/`results`) |
| `Result` (`academic.prisma`) | `results` | replaced by new `Result` |
| `Attendance` (`operations.prisma`) | `attendance` | moved to Academic domain (new `Attendance`) |
| `Assignment` / `Submission` (`documents.prisma`) | `assignments` / `submissions` | moved to Academic domain (`Assignment` / `AssignmentSubmission`) |
| `Department` (`institution.prisma`) | `departments` | moved to Academic domain (D-3 canonical owner) |

### 2.2 Verdict — the legacy academic table set is INERT

A full reference sweep of `apps/api/src/**` and `apps/api/test/**` (all `.ts`)
for `prisma.enrollment|prisma.grade|prisma.curriculum|prisma.attendance|
prisma.submission|prisma.assignment|classTeacherOf|EnrollmentStatus` returned
**zero hits**. No service, controller, DTO, guard, repository, or test reads or
writes the legacy academic tables. The only consumers of the legacy models are:

1. **`apps/api/prisma/migrations/20260908180041_init/migration.sql`** — creates
   the legacy tables/DDL (academic_years L44, terms L60, curricula L76,
   subjects L93, classes L111, enrollments L131, grades L147, results + …).
2. **`apps/api/prisma/seed.ts`** — writes academic fixtures and is re-authored
   against the new schema as part of Phase 5 (see §6).
3. **Schema relation declarations** in the five domain `*.prisma` files
   (re-pointed; see §5).

### 2.3 Cross-domain FK/consumer inventory (from the domain Prisma files)

Referencing (consumer) relations that currently point into the legacy set:

| Consumer model (file) | Legacy target |
|---|---|
| `FeeStructure` (finance.prisma) | `AcademicYear`, `Term` |
| `Invoice` (finance.prisma) | `AcademicYear`, `Term` (plus `Student` — unchanged) |
| `MaintenanceRequest` (operations.prisma) | `Term` |
| `LeaveRequest` (operations.prisma) | `Term` |
| `LibraryBookCopy` (documents.prisma) | `Class` |
| `BookLoan` (documents.prisma) | `Term` (plus `Student`, `LibraryBook` — unchanged) |
| `Student` (people.prisma) | back-relations `enrollments`/`attendance`/`submissions`/`assignments` → removed |
| `Staff` (people.prisma) | back-relations `classes`/`classTeacherOf`/`grades` → removed |
| `Institution` (institution.prisma) | back-relations `departments`/`academicYears`/`classes`/`subjects`/`curricula` → re-pointed/removed |
| `StudentEnrollmentDetail` / `StudentAcademicRecord` (people.prisma) | `academic_session_id` columns — deferred FK now wired to new `AcademicSession` (deviation D2 closed) |

There are no raw-SQL queries, Prisma raw queries, reporting queries, event
payloads, or eager-load `include` paths in application code that touch the
legacy set (verified §2.2). The migrations history (8 migrations) touches
legacy tables only in the init migration.

## 3. Old-model → new-model mapping (explicit)

| Legacy shape | New shape | Mapping notes |
|---|---|---|
| `AcademicYear` (name, startYear:int, endYear:int, isCurrent) | `AcademicYear` (name, start_date, end_date, status, is_active) | Column rename + type change. `startYear/endYear` (INT) → `start_date/end_date` (DATE) has NO deterministic date semantics → **UNMAPPABLE**, preserved in archive |
| `Term` (academicYearId FK, isCurrent) | `Term` (academicSessionId FK, status enum, no isCurrent) | Legacy term has no session; the P5 model nests terms under `academic_sessions`. No deterministic session assignment → **UNMAPPABLE**, preserved in archive |
| `Curriculum` | — (removed) | No P5 table. Replaced by `subject_groups` membership. **UNMAPPABLE** (no equivalence), preserved in archive |
| `Subject` (curriculumId FK, creditHours) | `Subject` (departmentId FK, status) | `name`/`code` deterministic-copied; `creditHours` and `curriculumId` have no target → **PARTIALLY MAPPABLE**; creditHours surface is not re-applied |
| `Class` (subjectId FK, academicYearId FK, section, teacherStaffId, classTeacherId, room) | `Class` (gradeLevelId FK, streamId FK, capacity, status) | Legacy class = "SS 1 Science"/"SS 1 Arts" keyed to a subject — structurally different (grade-level keyed). → **UNMAPPABLE**, preserved in archive |
| `Enrollment` (studentId/classId/academicYearId, status) | `StudentClassEnrollment` (student_person_id/classId/termId, status ENROLLED/ACTIVE/TRANSFERRED/WITHDRAWN) | Different grain (per-term + person-id). Enum values differ (`ACTIVE/COMPLETED/...` vs `ENROLLED/ACTIVE/...`). → **UNMAPPABLE**, preserved in archive |
| `Grade` / `Result`, `Attendance` (operations), `Assignment`/`Submission` (documents), `Department` (institution) | P5 `Assessment`+`Result`, `Attendance`, `Assignment`+`AssignmentSubmission`, `Department` | Column sets/keys changed materially; no lossless deterministic transform → archived, fixtures re-seeded |

**Data-preservation statement:** every legacy table's rows are preserved intact in
`_academic_legacy_*` archive copies (rename, not delete). No data is destroyed.
No semantic conversion is guessed. Unmappable data is fully documented here and
recoverable via the rollback procedure (§7).

## 4. Schema ownership & accounting (new set)

31 tables from P5 spec §7.1 + the `subject_subject_groups` join = **32 tables**
created for the Academic domain (`academic.prisma`), plus enumeration types
added to `schema-head.prisma` (P5 spec §8.1; the legacy `EnrollmentStatus`
values are replaced by the frozen ENROLLED/ACTIVE/TRANSFERRED/WITHDRAWN).

New tables: `academic_years`, `academic_sessions`, `terms`, `subjects`,
`subject_groups`, `subject_subject_groups`, `departments`, `streams`,
`grade_levels`, `classes`, `arms`, `homerooms`, `teaching_assignments`,
`timetables`, `timetable_slots`, `student_class_enrollments`,
`subject_registrations`, `attendance`, `assignments`, `assignment_submissions`,
`assessments`, `assessment_results`, `grade_scales`, `grade_boundaries`,
`remarks`, `results`, `report_cards`, `academic_progressions`,
`academic_policies`, `summer_school_sessions`, `summer_school_registrations`,
`summer_school_results`.

## 5. Re-pointing edit set (schema code, already applied)

- `domains/academic.prisma` — rewritten (authoritative P5 set; D-1/D-3 header).
- `domains/operations.prisma` — legacy `Attendance` model removed.
- `domains/documents.prisma` — legacy `Assignment`/`Submission` models removed.
- `domains/institution.prisma` — legacy `Department` model removed; `Institution`
  back-relations re-pointed (academic years/sessions/terms/subjects/subjectGroups/
  streams/gradeLevels/classes/timetables/gradeScales/policies/summer-school);
  `curricula` back-relation removed.
- `domains/people.prisma` — `Student`/`Staff` legacy academic back-relations
  removed; `academic_session_id` FK wired to `AcademicSession` (D2 closed).
- `schema-head.prisma` — academic enums added; `EnrollmentStatus` replaced.
- `schema.prisma` (merged) + `@prisma/client` — regenerated; `prisma validate` PASS.

## 6. Migration strategy (two-phase, on a disposable DB first)

### Phase 1 — archive (`migrate/…p5_1_archive_legacy_academic`)
1. Drop every FK constraint whose referenced table is a legacy academic table
   and that lives on a NON-legacy consumer table (algorithmic `DO` block over
   `pg_constraint`, so exact legacy constraint names need not be guessed).
   Archive-internal FKs are retained so the archived relations stay coherent.
2. Rename the 12 legacy tables to `_academic_legacy_*` (data preserved; indexes
   and archive-internal FKs retained).

### Phase 2 — authoritative schema
Generated by `prisma migrate diff --from-schema-datasource --to-schema-datamodel`
against the disposable DB *after* Phase 1, so the resulting SQL is exactly what
makes the live schema equal `schema.prisma` (new enums, the 32 Academic tables,
and the consumer re-point FKs including the People → academic_sessions FKs).
Additive DB-invariant SQL appended to the migration: the attendance
"exactly one of student enrollment / staff" CHECK and the attendance STUDENT
partial-unique semantics are already expressed via the Prisma
`@@unique([tenantId, studentClassEnrollmentId, subjectId, date])`
NULL-DISTINCT column; a CHECK constraint enforces the exactly-one rule.
(Verified: Prisma's NULL-DISTINCT semantics reproduce the spec's partial
unique.)

### Acceptance (proves migration, per D-1)
Run on a disposable/test DB: apply the full migration history (8 existing +
Phase 1 + Phase 2) via `prisma migrate deploy`; confirm `prisma migrate status`
clean, `prisma migrate diff` clean, seed reruns, and existing e2e suites green.

## 7. Rollback / recovery (documented)

- **Point-in-time:** Postgres WAL backup of the pre-migration snapshot restores
  the legacy DB as-is.
- **Archive-first:** because legacy tables are renamed (not dropped), restoring
  the legacy model is a matter of (a) applying the inverse renames
  `_academic_legacy_x` → `x`, (b) re-creating the dropped consumer FKs from the
  Phase-1 pre-migration inventory (`departments`, `curricula`, legacy
  `academic_years`, `terms`, `subjects`, `classes`, `enrollments`, `grades`,
  `results`, `attendance`, `assignments`, `submissions`), and (c) switching the
  domain files back in git history. No data loss is possible at any earlier
  state.
- **No HARD STOP triggered:** the D-1 gate only fires when a data relationship
  **cannot** be safely reconciled. The dependency inventory (§2) shows every
  relationship is either deterministic (re-pointed consumers + regenerated
  fixtures) or preserved wholesale in the archive; no production/business
  data was found at risk (current DB holds dev/test fixtures only).

## 8. Cross-cut flags

- **People integration (boundary respected):** `student_enrollment_details` /
  `student_academic_records` gain only the deferred `academic_session_id`
  FK relation; no other People schema/behavior change. People's resolution,
  guards, and e2e contract are untouched (additive).
- **D-3 (canonical calendar owner):** `academic_sessions`, `terms`,
  `departments`, `academic_policies` and calendar semantics are owned by the
  Academic domain only. The Institution domain spec's
  `academic_sessions`/`academic_terms`/`academic_holidays` catalogue entries
  are NOT materialized as Institution-domain tables (reconciliation evidence:
  Institution Management Engineering.md §5.2 rows 191–192 and §7.1 rows
  536–538). Institution configuration remains the key-value surface
  (`institution_configurations` / `institution_settings`).