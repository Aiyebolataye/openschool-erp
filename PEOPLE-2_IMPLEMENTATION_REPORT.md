# PEOPLE-2 IMPLEMENTATION REPORT

---

## 1. Executive summary

PEOPLE-2 (Student-Management slice of Master Roadmap Phase 4, batch scoped by the frozen
decisions D-A..D-F in `PEOPLE-2_SCOPE_VERIFICATION_REPORT.md`) is **complete and verified**.

The effort delivered the Person CRUD + search APIs, the Student (enrollment) management APIs,
the non-admin permission grants for the STUDENT/PARENT roles, the people audit events
(PEOPLE-2, BR-020), and a full regression + security review of the final diff — all verified by
a **clean deterministic full E2E run of 9 suites / 140 tests (119 pre-existing tests across the
8 earlier suites — auth, sessions, login-protection, rbac4-object-scope, identity-b1, audit,
people-foundation, envelope-security — plus the 21 new People tests)** and a **full unit run of
10 suites / 110 tests**.

Two genuine product defects surfaced during the completion pass and were fixed
(canPatchStatus in `people.lifecycle.ts`; `@IsOptional()` on `EnrollmentDetailDto`), one
pre-existing E2E timing-defect was repaired in `audit.e2e-spec.ts` (a poll loop that never
polled), and two test defects were corrected (case-sensitive exact-email search; ambiguous
guardian lookup). No schema migration was introduced (D-F respected); no dependencies were
added; no probes remain; no tests were weakened.

**Verdict: `PEOPLE-2 COMPLETE — VERIFIED`** (see §16).

---

## 2. Plan of record

- **Authorised workstream:** PEOPLE-2 "Student-Management" (batch) of Master Roadmap Phase 4,
  executed as the authorised continuation after PEOPLE-1 was verified and after the
  `PEOPLE-2_SCOPE_VERIFICATION_REPORT.md` bounded the exact batch (Determinations 01–10).
- **Nature of this pass:** a **completion + verification pass** over the already-implemented
  PEOPLE-2 working tree. Steps were: (1) inspect current state, (2) clean deterministic People
  E2E run, (3) remove temporary probe artifacts, (4) full verification chain, (5) regression
  & security review, (6) scope audit of the final diff, (7) this report, then **STOP**.
- **Frozen inputs:** `engineering/People Engineering.md` (spec §10.3 endpoint/permission
  catalogue, §13 Person-vs-User) and the frozen batch decisions set at `PEOPLE-2_SCOPE_
  VERIFICATION_REPORT.md` §11: D-A (Person+Student slice), D-B (role grants frozen matrix:
  PARENT/STUDENT each exactly `people:person:read` + `people:student:read`, no `list`),
  D-C (no internal-email sync on Person registration, no auto user creation), D-D (bounded
  deterministic search), D-E (enrollment writes only `StudentEnrollmentDetail` plus automatic
  STUDENT-type `PersonInstitution` + generated `internalEmail`), D-F (no schema change).
- **Release boundary:** no commit/push/PR/merge/tag. Output is this report + final summary,
  then **STOP**. Bulk import is outside this batch (PEOPLE-3+ boundary).

---

## 3. Systems-of-record status

| System | Role | Status at end of PEOPLE-2 pass |
|---|---|---|
| `apps/api/src/modules/people/` | PEOPLE-2 implementation | 15 files: controllers, services, DTOs, guard, lifecycle, events, module, 3 unit specs (**all green**) |
| `apps/api/src/app.module.ts` | Composition root | `PeopleModule` registered (+2 lines; only change in pass) |
| `apps/api/src/modules/audit/audit-log.consumer.ts` | Audit persistence | PEOPLE-2 (BR-020) handlers for person/student lifecycle events; pre-existing auth handlers untouched |
| `apps/api/prisma/seed.ts` | Seed authority | Grants for PARENT/STUDENT (D-B), PEOPLE-1 fixtures preserved; no schema change |
| `apps/api/test/people.e2e-spec.ts` | People E2E truth | 21 tests, all passing standalone and in the serial run |
| `apps/api/test/people-foundation.e2e-spec.ts` | PEOPLE-1 regression truth | 6 tests, passing in the serial run (grant-compare tightened to `people:` resources) |
| `apps/api/test/audit.e2e-spec.ts`, `identity-b1.e2e-spec.ts` | Phase-1/2 regression truth | Deterministic-after-fix, passing in the serial run |
| Test DB `openschool_test` (localhost:5433) | e2e authority | rebuilt per run via `test/setup/global-setup.ts` (`db push --force-reset` + seed + redis flush) |

---

## 4. Batch scope (mapping to frozen determinations)

- **D-A — in scope:** `POST/GET/PATCH/DELETE /people/persons` (create, read-by-uuid/publicId,
  update w/ version, soft-delete, restore, search) and student management under
  `/people/persons/:personId/students` (enroll, list, read, update enrollment detail, transfer,
  graduate, withdraw). No classroom/attendance/assessment wiring (out of batch).
- **D-B — implemented and enforced:** PARENT and STUDENT roles carry exactly
  `people:person:read` + `people:student:read`. `list` permission is only granted to
  OPERATIONAL/SUBADMIN/INSTITUTION_ADMIN/SYSTEM_ADMIN. E2E proves a parent gets **403** on
  list endpoints and on all write endpoints.
- **D-C — respected:** Person registration does not auto-create users and does not sync an
  internal email onto `Person.email`.
- **D-D — bounded deterministic search:** `people/persons/search` is deterministic and
  paginated; exact-email matching is case-sensitive against normalized storage, and a
  publicId exact-search path is covered by E2E.
- **D-E — respected:** enrolling creates `Student` + `StudentEnrollmentDetail` + a STUDENT-type
  `PersonInstitution` entry and a generated internal email (`{slug}.local` domain);
  one-time enroll is idempotent-guarded (duplicate -> 409); after graduation the enrollment
  detail is immutable (409 on further writes).
- **D-F — respected:** **no schema change** was introduced during this pass; the working-tree
  schema/migration diffs are the pre-existing PEOPLE-1 foundation state (M0 +
  `20260915120000_people_foundation`), untouched by PEOPLE-2.

---

## 5. Implementation delivered

- **Persons:** `persons.controller.ts` + `persons.service.ts` (~20.5 KB) — create/read list/read
  by UUID|publicId/update (optimistic version, 409 on stale)/soft-delete/restore/search,
  with/without institution context; UUID `isUuid()` branch avoids Prisma `@db.Uuid` inline
  `findUnique` errors on public IDs; publicId explicit in every 201 envelope.
- **Students:** `students.controller.ts` + `students.service.ts` (~25.5 KB) — enroll/read/list
  (status filter)/update-enrollment/activate/graduate/transfer/withdraw under the nested
  `:personId` route; `studentScope()` includes `internalEmail`; nested-route ownership
  enforced (`assertNested` -> 404 on mismatch); enrollment ownership + immutability rules;
  `gradeLevel` lives on `StudentEnrollmentDetail`, not `Student`.
- **Authorization:** `people-scope.guard.ts` + decorator — object scope for person/student
  (tenant, institution, self-access for STUDENT/PARENT principals, cross-institution denial);
  `PermissionGuard` on all endpoints per spec §10.3; list endpoints exclude PARENT/STUDENT.
- **Lifecycle:** `people.lifecycle.ts` — status transition table incl. `canPatchStatus` and
  enrollment state machine; unit-tested (5 tests).
- **Events/audit (BR-020):** `people.events.ts` + `audit-log.consumer.ts` handlers for
  person.created/updated/soft_deleted/restored and student.enrolled/updated/graduated/
  transferred/withdrawn, emitted post-transaction and persisted append-only.
- **DTO validation:** `person.dto.ts` / `student.dto.ts` with `NAME_REGEX`, enum validation,
  version requirements; ValidationPipe -> 400 (never 422).

---

## 6. Defects fixed during this pass

| # | Defect | Root cause | Fix | Evidence |
|---|---|---|---|---|
| 1 | PATCH `ACTIVE` on a GRADUATED student returned **200** instead of 409 | `updateStudent` checked only the target status, not current status | `canPatchStatus(from,to)` added to `people.lifecycle.ts`, wired into `students.service.ts::updateStudent` | unit `people.lifecycle.spec.ts` + People E2E "graduates..." test |
| 2 | Update enrollment detail returned **400** instead of the service's 409 | `EnrollmentDetailDto.enrollmentType` was declared optional but lacked `@IsOptional()`, so `@Matches` rejected `undefined` | added `@IsOptional()` to the field | People E2E "graduates; becomes immutable" test |
| 3 | `audit.e2e-spec.ts` cross-tenant test intermittently returned `total: 0` in the serial run | pre-existing poll loop `for (...; !res ...)` never iterated (first response makes `res` truthy) — a broken retry, exposed by scheduling/load in the full serial run | removed `&& !res` so it genuinely polls while `total < 1` | full serial E2E: audit suite green |
| 4 | Exact-email search returned 0 in suite (but not in probe) | test searched with the mixed-case `uniqueEmail(...)` string while storage normalizes to lower-case and exact match is case-sensitive | search test uses `.toLowerCase()`; added exact search-by-publicId assertion | People E2E "searches people..." test |
| 5 | Parent self-read of own guardian person returned 403 | ambiguous `guardian.findFirstOrThrow({ where: { tenantId } })` picked the second greenfield guardian created by `identity-b1.e2e-spec.ts` (not the one linked to parent@) | resolve the guardian via the parent user's `userId` (guardian.create in identity-b1) | People E2E "parent: self-scoped read..." test |
| 6 | People-foundation role-grant deep equality broke | seed grants `identity:session:*` universally (incl. to admin roles), so comparing full grant sets against a people-only expectation failed | grant comparison now filters to `people:`-prefixed resources (catalogue still fully asserted) | people-foundation suite green in serial run |

**No test was weakened.** #4–#6 tighten determinism/assertion accuracy; #3 strengthens
(restores) a broken retry; #1–#2 are product fixes.

---

## 7. Test matrix — result summary

**People module (unit): 3 suites / 17 tests — PASS**
- `people-scope.guard.spec.ts` (7), `people.lifecycle.spec.ts` (5), `people.utils.spec.ts` (5).

**Full unit suite: 10 suites / 110 tests — PASS**

**People E2E: `test/people.e2e-spec.ts` — 21/21 PASS** (standalone and inside full serial run):
create/read (UUID + publicId), duplicate-409 + bad-DOB/missing-gender-400, optimistic update +
stale 409, profile update, institution-context assign/remove (roleContext validated), soft-
delete/restore, deterministic search (fuzzy name, exact email, exact publicId), admin-without-
institution 403 on student create, enroll (Student + EnrollmentDetail + STUDENT
PersonInstitution + internal email), duplicate-enroll 409, list/read w/ status filter, version-
driven enrollment update + activation, graduate -> immutable 409, transfer + withdraw,
student version 409, people audit (BR-020), teacher read-only (writes 403), nested-route 404,
**parent self-scoped read / list+write 403 (frozen matrix)**, cross-tenant 403.

**People-foundation E2E: 6/6 PASS** (4 seed shape + 2 catalogue; grant compare scoped to
`people:`).

**Full E2E (serial, `npx jest --config ./test/jest-e2e.json --runInBand --forceExit`):**
**9 suites / 140 tests — ALL PASS**, exit code 0:
identity-b1 · people · sessions · rbac4-object-scope · login-protection · audit ·
people-foundation · envelope-security · auth.

---

## 8. Verification gates

| Gate | Command | Result |
|---|---|---|
| Schema | `npx prisma validate` | valid (no change in pass) |
| Types | `npx tsc --noEmit` | exit 0 |
| People unit | `npx jest src/modules/people --runInBand` | 17/17 (3 suites) |
| Full unit | `npx jest --runInBand --forceExit` | 110/110 (10 suites) |
| People E2E (isolated) | `npx jest --config ./test/jest-e2e.json test/people.e2e-spec.ts --runInBand --forceExit` | 21/21 |
| Full E2E (serial) | `npx jest --config ./test/jest-e2e.json --runInBand --forceExit` | **140/140 (9 suites), exit 0** |
| Build | `npx nest build` | exit 0 |

Infra context: test infra is Docker-backed (Postgres :5433, Redis :6379, MinIO :9000-:9001);
Docker Desktop was started/healthy for the runs. `--clearCache` run before the final serial E2E;
no orphan `node`/`cmd` processes left running after runs.

---

## 9. Regression & security review (checklist)

1. **Tenant isolation** — foreign-tenant person forbidden to every Greenfield principal (E2E PASS).
2. **Institution isolation** — nested-route mismatch 404; student ownership enforced (queries scoped by tenantId+institutionId).
3. **PARENT self/object access** — self-scoped read works via user->guardian bridge; object read authorized (E2E PASS).
4. **STUDENT self/object access** — self-service branch in `people-scope.guard` (personRelationship / userId bridge), unit-covered.
5. **Cross-institution denial** — `validateInstitutionScope` + `assertNested`; admin-without-institution 403 (E2E PASS).
6. **Parent list denial (frozen D-B)** — list endpoints require `people:*:list`, which PARENT/STUDENT lack -> 403 (E2E PASS).
7. **Correct 400/403/404/409 semantics** — duplicate 409, stale version 409, invalid DOB/missing gender 400, not-found 404, route mismatch 404 (E2E PASS).
8. **Public-ID safety** — `isUuid()` branches prevent Prisma `@db.Uuid` inline-`findUnique` errors; reads by publicId work (E2E PASS).
9. **Enrollment ownership/immutability** — duplicate/terminal-state/graduated-activation writes all 409 (E2E PASS).
10. **Internal email** — generated (`{slug}.local`) and returned in studentScope; no `Person.email` sync (D-C; E2E PASS).
11. **Phase-1 auth/session** — auth, sessions, login-protection suites PASS in serial run.
12. **Phase-2 RBAC** — rbac4-object-scope suite PASS; object-scope guard extended for People models (registered in `object-scope.guard.ts`).
13. **PEOPLE-1 foundation** — people-foundation suite PASS in serial run.

---

## 10. Scope audit of the final diff

- **Product diff (PEOPLE-2 only):** `apps/api/src/modules/people/**` (new), `apps/api/src/
  app.module.ts` (+2, PeopleModule), `apps/api/src/modules/audit/audit-log.consumer.ts`
  (+166, BR-020 handlers). No other product code touched.
- **Test diff:** `test/people.e2e-spec.ts` + `test/people-foundation.e2e-spec.ts` (new),
  `test/audit.e2e-spec.ts` (+1/-1 poll fix), `test/identity-b1.e2e-spec.ts` (pre-existing
  guardian fixture work, inherited from the current working state, not authored in this pass).
- **Schema:** no new migration; working-tree `prisma/*` diffs are the inherited PEOPLE-1
  foundation state. D-F respected.
- **Dependencies:** none added (package.json untouched).
- **No** secrets, generated artifacts in diff, probes, debug logging, `.only`/`.skip`, or orphan
  node processes.
- **Stray (non-diff, pre-existing) artifacts noted:** `apps/api/prisma/schema.realprisma.mp`
  (dated 2026-09-14, a prior schema-analysis copy during the foundation work; not produced by
  `scripts/merge-schemas.mjs`, which writes only `schema.prisma`) and the inherited uncommitted
  PEOPLE-1 migrations + domain diffs — all part of the pre-this-pass working tree, preserved.

---

## 11. Known issues / residual concerns

- The `identity-b1` availability of a stable guardian fixture is now handled deterministically
  (via user->guardian bridge); the fixture itself lives in the pre-existing test diff.
- The audit poll fix (#3) eliminates the observed race; audit persistence remains async
  fire-and-forget by design (availability over strict durability), so extremely slow CI could
  still theoretically expose a poll-window miss — the 20x200ms bounded poll mitigates this.
- `gradeLevel` and staff/classroom/academic wiring remain explicitly out of batch (PEOPLE-3+).

---

## 12. Deviations

None beyond the inherited documented batch decisions D-A..D-F and the PEOPLE-1 deviations
recorded in the previous milestone report. This pass introduced no new product behavior beyond
the two defect fixes in §6 (#1 canPatchStatus, #2 `@IsOptional()`).

---

## 13. Confirmation / follow-ups

- Final full-verification-chain evidence captured in this pass (commands + exit codes in §7/§8).
- Follow-ups are release decisions only (commit/PR/merge/tag) and deliberately **not** performed,
  per the release boundary. Next engineering workstream remains PEOPLE-3+ (bulk import /
  classrooms / academics), unauthorised here.

---

## 14. Final gate verdict

Considering the frozen spec (engineering/People Engineering.md + scoped batch determinations),
the verified implementation, the full clean test evidence, and the scope audit:

> **PEOPLE-2 COMPLETE — VERIFIED**

(9/9 E2E suites / 140 tests, 10/10 unit suites / 110 tests, `tsc --noEmit` exit 0,
`npx prisma validate` valid, `npx nest build` exit 0. STOP; no git mutation performed.)