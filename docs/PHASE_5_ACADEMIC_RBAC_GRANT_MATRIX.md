# PHASE 5 — Academic Permission Catalogue & Role Grant Matrix (D-2)

| | |
|---|---|
| Phase | 5 — Academic Management |
| Decision | D-2 (locked): **no new RBAC roles**. `HEAD_TEACHER` / `CLASS_TEACHER` are academic *responsibilities* enforced through the persisted TeachingAssignment model, never via a client-supplied role string |
| Governed by | `engineering/Academic Management Engineering.md` §6.5 P-12, §7.2.17 (TeachingRole enum), §10.3 (endpoint → permission catalogue), §11.2 AUTHZ |

## 1. Purpose

Map the full `academics:*` permission catalogue onto the **15 existing seeded
RBAC roles** (no new roles), and state exactly how responsibility-level
authority (Head/Class Teacher, result approval per P-12) is enforced at the
data level via `teaching_assignments` — not via role forgery.

## 2. Permission catalogue (resource:action → endpoints)

64 permission pairs. Repository mapping: `Permission.resource` + `Permission.action`
(two-column model, `@@unique([resource, action])`).

| Resource | Actions | Endpoints (catalogue §10.3) |
|---|---|---|
| `academics:calendar` | read, create, update, manage | years/sessions/terms CRUD + open/close/activate |
| `academics:subject` | read, create, update | subject CRUD |
| `academics:department` | read, create, update | department CRUD |
| `academics:grade_level` | read, create, update | grade-level CRUD |
| `academics:class` | read, create, update | class CRUD + class students |
| `academics:teaching` | read, create, update, delete | teaching-assignment CRUD |
| `academics:timetable` | read, create, update, manage | timetable CRUD + slots + publish + teacher view |
| `academics:enrollment` | read, create, update, delete | enrollment CRUD + subject register/drop |
| `academics:attendance` | read, create, update | attendance mark/correct/bulk/report |
| `academics:assignment` | read, create, update, manage, submit, grade | assignment CRUD + publish + submit + grade |
| `academics:assessment` | read, create, update, manage, grade | assessment CRUD + publish + score entry (single/bulk) |
| `academics:grading` | read, create, update | grade-scale CRUD + boundaries |
| `academics:result` | read, compile, approve, publish, generate | result list/compile/approve/publish + report cards + rankings |
| `academics:progression` | read, evaluate, approve, manage | progression list/evaluate/approve/promote/retain/probation |
| `academics:summer_school` | read, create, update, manage, register, compile, publish | summer-school sessions + registrations + results |
| `academics:policy` | read, create, update | academic-policy CRUD + history |

## 3. Role → grant matrix

Least privilege. **Admin roles** (`PLATFORM_ADMIN`, `ORG_ADMIN`, `PRIMARY_INSTITUTION_ADMIN`, `INSTITUTION_ADMIN`, `PRINCIPAL`) receive the **entire** catalogue (64 pairs).

| Existing role | Granted resources and actions | Notes |
|---|---|---|
| `PLATFORM_ADMIN` | all 64 | global admin |
| `ORG_ADMIN` | all 64 | org admin |
| `PRIMARY_INSTITUTION_ADMIN` | all 64 | primary institution admin |
| `INSTITUTION_ADMIN` | all 64 | institution admin |
| `PRINCIPAL` | all 64 | final approval authority (result publish per P-12) |
| `TEACHER` | read on: calendar, subject, department, grade_level, class, teaching, timetable, enrollment, attendance, assignment, assessment, grading, result, progression, summer_school, policy; **write**: attendance{create,update}, assignment{create,update,manage,grade}, assessment{create,update,manage,grade}, result{read,approve} | Object + authority guard narrows *every* write to the class/subject/term the teacher is persisted as assigned to (`teaching_assignments`); `result:approve` lets a persisted Class Teacher approve *their* class results (P-12); automatic result-completion flows (compile/publish/generate) and scoring/approving workflows that re-target other classes are rejected |
| `STUDENT` | read on: calendar, subject, class, timetable, assignment, assessment, result, progression, attendance, summer_school, policy; assignment{submit} | Guard scopes to the student's own enrollments; `submit` scoped to assignments published on their class |
| `PARENT` | read on: calendar, subject, class, timetable, assignment, assessment, result, attendance, progression, summer_school, policy | Guard scopes to students linked via the person graph |
| `STUDENT_MANAGEMENT_OFFICER` | calendar{read}; enrollment{read,create,update,delete}; attendance{read,create,update}; class{read}; grade_level{read}; subject{read}; department{read}; teaching{read}; progression{read,evaluate,manage}; result{read}; summer_school{read,register} | Operational officer for placements, attendance data-entry, registrations, summer-school registration |
| `HR_OFFICER` | calendar{read}; department{read}; subject{read}; grade_level{read}; class{read}; teaching{read,create,update,delete} | Manages staff academic assignments only |
| `BURSAR` | calendar{read} | Minimal: interpret term/session on billing artifacts |
| `HOSTEL_ADMIN` | — | No academic grants |
| `CLINIC_ADMIN` | — | No academic grants |
| `LIBRARIAN` | — | No academic grants |
| `TRANSPORT_MANAGER` | — | No academic grants |

## 4. Authority (responsibility) enforcement — the D-2 spine

Head Teacher / Class Teacher are **data, not roles**:

1. **Persisted source of truth** — `TeachingAssignment(subjectId, classId, termId, staffPersonId, role)` where `role ∈ {SUBJECT_TEACHER, CLASS_TEACHER, DEPARTMENT_HEAD}` (§7.2.17). `@@unique([tenantId, staffPersonId, subjectId, classId, termId])` and the one-Department-Head-per-term uniqueness (spec I-26) define exactly who may act.
2. **AuthorityGuard** — a teacher's write/approve on a class proceeds **only if** an active `TeachingAssignment` (current `termId`, correct `role`, class owned by the actor) exists. Request-borne strings/codes (role names, class names) are never trusted.
3. **P-12 result approval** — `result:approve` is granted to `TEACHER` (matrix above) *but* the AuthorityGuard restricts execution to assignments with `role = CLASS_TEACHER` on the result's class+term; `PRINCIPAL` (admin) may approve any. `result:compile/publish/generate`, `progression:approve/manage` remain admin-only.
4. **HEAD_TEACHER** — realized as any staff member holding a `CLASS_TEACHER`/`DEPARTMENT_HEAD` assignment for the target term, not as an RBAC role.

## 5. Object-scope enforcement map (per guard pattern from people/institutions)

| Guard surface | Scope rule |
|---|---|
| Institution scoping | every academic entity created/queried must match the requester's resolved `institutionId` + `tenantId` (ObjectScope `selectMap`); cross-institution returns 404/empty (spec §11.3 TI-001..008) |
| Teacher write scope | attendance/assignment/assessment/result{approve} limited to assignments where `staffPersonId = actor` for the term |
| Student scope | read + submit limited to `student_class_enrollments.student_person_id = actor` |
| Parent scope | read limited to students linked via `person_relationships` |
| Administrative role scope | no object-level restriction (tenant + institution only) |

## 6. Seed/registration implementation

- `permission.createMany` registers the 64 `academics:*` pairs (Section 2).
- `adminRoleIds` (five admin roles) receive all 64 (mirrors `institution:*`, `people:*` V1 pattern).
- `academicOperationalMatrix` grants the teacher/student/parent/operational sets verbatim from Section 3 (throw if a catalogue row is missing — same safety as the People matrix).
- No new roles, no role renames; `PRIVILEGED_ROLES`/`permissionsFromRoles` unchanged.

## 7. Cross-checks

- **P-12** §6.5: approval authority CLASS_TEACHER/HEAD_TEACHER/PRINCIPAL — delivered by §4 + granted `academics:result:approve`.
- **§11.2 AUTHZ** (10 cases): guard must reject (a) teacher without assignment, (b) role-forgery request, (c) reassignment of someone else's class, (d) HEAD_TEACHER claim without assignment, (e) module-license-less access — all enforced at the data level.
- **§10.3 catalogue parity**: every endpoint's permission string exists in Section 2; no endpoint is granted to a role missing in Section 3's set.