# PEOPLE-3 Implementation Report — Staff Management

**Verdict: `PEOPLE-3 COMPLETE — VERIFIED`** (see §18).

## 1. Executive summary

PEOPLE-3 (Staff Management) was implemented as a single coherent work unit per the
approved `PEOPLE-3_SCOPE_VERIFICATION_REPORT.md` boundary and the authorization
instructions. All 15 staff endpoints are delivered at `apps/api/src/modules/people/`
(staff.service.ts + staff.controller.ts + dto/staff.dto.ts), wired into the existing
PeopleModule, guarded by PeopleScopeGuard's new `staff` institution-scope branch, and
dispatched to BR-020 audit rows via three new event handlers in the audit consumer.

Verification is green across all five gates: `npx prisma validate`, `npx tsc --noEmit`,
unit (`npm test` → 10 suites / 120 tests), full serial E2E (`--runInBand` → 10 suites /
181 tests, including the new 41-test `staff.e2e-spec.ts`), and `nest build`.

## 2. Plan of record

- Boundary source: `PEOPLE-3_SCOPE_VERIFICATION_REPORT.md` (verdict
  `PEOPLE-3 READY — NO NEW DECISIONS REQUIRED`).
- Authorization: implement the full milestone; no schema changes; no new permissions;
  no new RBAC/event infrastructure; stop only for genuine hard blockers.
- Frozen architectures honored: PEOPLE-G D-B determinations, PEOPLE-1 patterns
  (person-scoped namespace, tenant/publicId conventions), PEOPLE-2 patterns (institution
  scope, service-level resolution, `listEnvelope`, ADR-014 version checks, soft delete,
  event/audit dispatch).

## 3. Systems-of-record status

- `apps/api/src/modules/people/` — new module directory (people scoping, staff module).
- `apps/api/prisma/seed.ts` — extended with staff qualification/certification/employment-
  history fixtures (covers 3 of the 9 seeded staff).
- `apps/api/src/modules/audit/audit-log.consumer.ts` — extended with PEOPLE-3 handlers.
- No Prisma schema or migration change was required (Staff / StaffEmploymentDetail /
  StaffQualification / StaffCertification / StaffEmploymentHistory already existed).

## 4. Batch scope (mapping to the scope report)

| Scope-report item | Delivered |
| --- | --- |
| §10 Staff CRUD (5 endpoints) | YES — list, create, read, update, soft-delete |
| §10 Employment detail (2 endpoints) | YES — GET / PUT `:id/employment` |
| §10 Qualifications (4 endpoints) | YES — list/add/update/remove |
| §10 Certifications (4 endpoints) | YES — list/add/update/remove |
| §7 Schema | NO change (boundary: no-schema-change) |
| §8 Tenancy/object scope | Staff added as institution-scoped guard model  |
| §9 RBAC | Uses existing `people:staff:*` grants; no new permissions |
| §12 Events/audit | `people.staff.hired/updated/separated` rows |
| §13 Search/pagination | status filter, exact/fuzzy search, paginated envelope |
| §14 Bulk/import/merge/documents/photos/academics | Out of scope (excluded) |
| Parents/guardians/relationships/emergency contacts/applicants | Out of scope (excluded) |

## 5. Implementation delivered

New files:
- `apps/api/src/modules/people/dto/staff.dto.ts` — `CreateStaffDto`, `UpdateStaffDto`,
  `ListStaffQueryDto`, `StaffEmploymentDetailDto`, `CreateStaffQualificationDto`,
  `UpdateStaffQualificationDto`, `CreateStaffCertificationDto`,
  `UpdateStaffCertificationDto`. Create deliberately has **no** `status` field (staff are
  always created as `HIRED`); all mutations carry the ADR-014 `version`.
- `apps/api/src/modules/people/staff.service.ts` — resolution (UUID or `EMP-YYYY-NNNNNN`
  publicId), nested-person/tenant/institution assertions, duplicate checks
  (`staffNumber`, `internalEmail`, person+institution, `userId`), employment-history
  snapshot on separation, and post-write event dispatch.
- `apps/api/src/modules/people/staff.controller.ts` — 15 routes under
  `people/persons/:personId/staff`, each gated by `AuthGuard('jwt')`, `PermissionGuard`
  and `PeopleScopeGuard({ model: 'staff' })`.

Extended files:
- `people.module.ts` — registers `StaffController` + `StaffService`.
- `people.events.ts` — adds `StaffHired`, `StaffUpdated`, `StaffSeparated`.
- `people.lifecycle.ts` — adds `canPatchStaffStatus`, `isMutableEmployment`,
  `StaffStatusValue` and the status-transition tables.
- `people-scope.decorator.ts` — `PeopleScopeTarget` gains `'staff'`.
- `people-scope.guard.ts` — staff branch; generalized `validateInstitutionScope`;
  defensive Forbidden so PARENT/STUDENT-seated principals cannot reach staff.
- `audit-log.consumer.ts` — three BR-020 handlers (`people.staff.hired/updated/separated`,
  entityType `staff`).
- `prisma/seed.ts` — staff qualification/certification/history fixtures.

Endpoint → permission mapping (unchanged grant set):

| Route | Permission |
| --- | --- |
| `GET /staff`, `POST /staff`, `GET|PUT /staff/:id`, `DELETE /staff/:id` | list / create / read+update / delete |
| `GET|PUT /staff/:id/employment` | read / update |
| `GET /staff/:id/qualifications`, `POST|PUT|DELETE /staff/:id/qualifications[/:qualificationId]` | read / update |
| `GET /staff/:id/certifications`, `POST|PUT|DELETE /staff/:id/certifications[/:certificationId]` | read / update |

## 6. DTO / validation contract delivered

- `@IsNumberString`/`@Type` page-limit with bounds; `hireDate` `@IsDateString`;
  `employmentType` enum; `yearObtained` bounded range; `expiryDate` ≥ `issueDate`
  business validation; unknown properties rejected (`forbidNonWhitelisted`).
- `version` required on all mutating DTOs; guards use the current row version and
  reject stale writes with 409 (ADR-014).
- Client-supplied `institutionId` is never accepted by any DTO/query; an attempted
  override is rejected 400 by the validation pipe (verified by test).

## 7. Lifecycle & business rules delivered

- Status machine: `HIRED → ACTIVE`, `ACTIVE → ON_LEAVE`,
  `ON_LEAVE → ACTIVE`, `{HIRED|ACTIVE|ON_LEAVE} → SEPARATED`; same-state allowed;
  `SEPARATED` is terminal (any exit → 409); covered in `people.lifecycle.spec.ts` and
  E2E.
- `isMutableEmployment` is false for `SEPARATED` (employment updates → 409).
- Soft delete sets `deletedAt`/`deletedBy` + status `SEPARATED`, writes a
  `StaffEmploymentHistory` snapshot (current `StaffEmploymentDetail` with end date), and
  emits `StaffSeparated`; Nested-read after delete → 404; lists exclude it.
- Create sets `EMP-YYYY-NNNNNN` publicId, HR `internalEmail` (unique, suffixed if taken),
  and a `STAFF` PersonInstitution context.

## 8. Events / audit delivered

Three handlers in `audit-log.consumer.ts` write append-only rows:
`people.staff.hired` (create), `people.staff.updated` (updates + status transitions,
except separation), `people.staff.separated` (status → SEPARATED and soft delete).
Verified by E2E: hired/updated/separated rows exist with actor/entity metadata and
`changes: { deleted: true }` on delete. No outbox/event-infra change.

## 9. Search / pagination delivered

`ListStaffQueryDto`: `status` filter; `search` with `exact` mode (`staffNumber` /
`publicId` / `internalEmail`) or `fuzzy` mode (name / email / position / department);
page/limit pagination with the locked flat `listEnvelope` (`items`, `total`, `page`,
`limit`). Soft-deleted staff are excluded.

## 10. Defects fixed during this pass

- `staff.service.ts` (updateEmploymentDetail): the checked Prisma input type
  `StaffEmploymentDetailUpdateInput` does not expose the `reportingTo` scalar FK (it is
  a relation field there); switched the update `data` to
  `Prisma.StaffEmploymentDetailUncheckedUpdateInput` — the single TypeScript error
  found by the first `tsc --noEmit` pass. No runtime behavior change.

## 11. Test matrix — result summary

Unit (extended):
- `people.lifecycle.spec.ts` — added `canPatchStaffStatus` + `isMutableEmployment`
  (6 statuses, forward moves, terminal SEPARATED).
- `people-scope.guard.spec.ts` — added staff scope tests (no-institution Forbidden,
  cross-institution/cross-tenant Forbidden, matched allowed, EMP publicId resolution,
  missing NotFound, self-service cannot reach staff).

E2E (`staff.e2e-spec.ts`, 41 tests):
- Create 201 + envelope + HIRED + EMP publicId + employment detail + STAFF context.
- 409s: duplicate person+institution, duplicate staffNumber, stale version (staff /
  employment / qualification), invalid status transition, SEPARATED exit, employment
  update for SEPARATED.
- 400s: invalid hireDate, missing position, contract-end < start, nonexistent
  `reportingTo`, invalid yearObtained, expiry before issue, scope-spoof `institutionId`.
- 404s: missing person, garbage/non-UUID staff id, unknown staff id, nested personId
  mismatch, another staff's qualification id.
- Reads by UUID and EMP publicId; list filters (status, exact/fuzzy search).
- RBAC: TEACHER / STUDENT_MANAGEMENT_OFFICER / PARENT → 403 everywhere; PRINCIPAL
  (admin) succeeds.
- Isolation: cross-institution 403, cross-tenant 403, branch staff invisible in list.
- Lifecycle walk HIRED→ACTIVE→ON_LEAVE→ACTIVE→SEPARATED; history snapshot; soft delete
  (`deletedAt`, excluded from read/list).
- Audit rows for hired/updated/separated with the 500 ms consumer-settle polling
  pattern.

Full regression: **unit 120/120 · serial E2E 181/181** (all 10 suites).

## 12. Verification gates

| Gate | Command | Result |
| --- | --- | --- |
| Schema | `npx prisma validate` | ✅ valid (unchanged) |
| Types | `npx tsc --noEmit` | ✅ exit 0 |
| Unit | `npm test` | ✅ 10 suites / 120 tests |
| E2E (serial) | `npx jest --config ./test/jest-e2e.json --forceExit --runInBand` | ✅ 10 suites / 181 tests |
| Build | `npm run build` | ✅ |

## 13. Regression & security review (checklist)

- [x] Tenant isolation — cross-tenant staff access 403 (guard resolved from trusted
      `user.tenantId`; verified E2E).
- [x] Institution scope — cross-institution 403; scope-mismatched staff invisible in
      list; active-membership required.
- [x] Self-service boundary — PARENT/STUDENT-seated principals cannot reach any staff
      route (guard Forbidden).
- [x] RBAC — only HR_OFFICER (all 5) and admin roles (existing `people:*`) can act;
      403 for TEACHER/SMO/PARENT; no new grant rows introduced.
- [x] Public-ID handling — UUID/EMP resolution; garbage ids → 404, never 500.
- [x] Nested ownership — staff nested under the wrong person → 404.
- [x] Soft-delete integrity — read/list exclude; live duplicate staffNumber still 409.
- [x] Version conflicts — stale writes 409 on staff, employment, qualification,
      certification.
- [x] Audit events — hired/updated/separated rows append-only, tenant-scoped.
- [x] No expansion of Person/Student endpoints or guards; no new dependencies; no
      secrets introduced.

## 14. Scope audit of the final diff

Files changed/added are confined to: the People module (staff files + wiring),
`people.events.ts`, `people.lifecycle.ts`, the people scope decorator/guard, the audit
consumer, the staff E2E spec, the unit specs, and seed fixtures. No Prisma schema,
migration, permission, or RBAC-table change. Person and Student services/controllers are
untouched. People-1/2 endpoints unchanged.

## 15. Known issues / residual concerns

- Infra (pre-existing): `npm run test:e2e` launches parallel Jest workers against a
  single shared test Postgres, which can produce cross-suite interference (observed as
  transient 401s in `audit.e2e-spec.ts` under parallel load; the suite passes alone and
  the full set is green with `--runInBand`). This is not a PEOPLE-3 defect; mitigation
  is the documented serial gate above.
- Reusing a soft-deleted `staffNumber` is still blocked by the DB unique index even
  though the service pre-check filters `deletedAt: null`; the resulting generic 500
  matches the frozen PEOPLE-2 `studentNumber` behavior exactly. Deliberately unchanged
  for consistency; flagged for a future People milestone if spec clarifies reuse rules.
- Employment-history capture semantics (snapshot on separation) were unspecified by the
  spec; implemented as the narrow rule and flagged for PEOPLE-5 review (carried from the
  scope-report decisions register).

## 16. Deviations

- None functional. Route `:id` param name is used for the staff segment (URL identical
  to the spec's `:staffId`), mirroring the existing student sub-resource convention.

## 17. Confirmation / follow-ups

- Confirmed: 15 endpoints, 5 existing grants reused, no schema change, full test + gate
  coverage, report written.
- Follow-ups (future milestones, not PEOPLE-3): Applicants/Admissions, documents,
  photos, merge, Academics, Parents/Guardians and relationships, emergency contacts,
  bulk import — all explicitly out of the PEOPLE-3 boundary.

## 18. Final gate verdict

All verification gates passed and the security/architecture audit found no People-3
defect, no boundary leak, and no deviation requiring a decision.

**Verdict: `PEOPLE-3 COMPLETE — VERIFIED`**