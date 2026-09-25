# PEOPLE-4 Implementation Report

**Author:** Implementation Agent (opencode)
**Status:** `PEOPLE-4 COMPLETE — VERIFIED`
**Prequisite:** `PEOPLE-4_SCOPE_VERIFICATION_REPORT.md` verdict `PEOPLE-4 READY — NO NEW DECISIONS REQUIRED` (approved boundary).

---

## 1. Purpose & Methodology

This report documents the completed implementation of the approved PEOPLE-4
boundary — **Parents, Guardians, Emergency Contacts, and Person Relationships
(20 endpoints)** — and presents the evidence for the full regression gate
required by the scope report §15.6.

Methodology: each requirement was traced from the frozen People Engineering
spec (§5.x, §6.x, §7.2, §10.3, §13) and the approved scope report to (a) code
(controller/service/DTO/guard/lifecycle/events/audit), and (b) deterministic
tests (unit + serial e2e). No Prisma schema or migration was modified. No new
npm packages were added. No new permissions or role grants were added.

## 2. Boundary Delivered

| Resource | Base path | Endpoints | Scope |
|---|---|---|---|
| Parents | `/people/persons/:personId/parents` | GET list, GET :id, POST, PUT :id, DELETE :id | institution |
| Guardians | `/people/persons/:personId/guardians` | GET list, GET :id, POST, PUT :id, DELETE :id | institution |
| Emergency Contacts | `/people/persons/:personId/emergency-contacts` | GET list, GET :id, POST, PUT :id, DELETE :id | tenant (+ person nesting) |
| Person Relationships | `/people/persons/:personId/relationships` | GET list, GET :id, POST, PUT :id, DELETE :id | institution (+ involvement) |

**Exactly 20 endpoints. Zero out-of-boundary additions** (people.identity,
people.development, PEOPLE-5, approvals, notifications were not built).

## 3. File Inventory

### New files
| File | Content |
|---|---|
| `src/modules/people/parents.controller.ts / parents.service.ts` | 5 endpoints, institution scope, ParentCreated/Updated events |
| `src/modules/people/guardians.controller.ts / guardians.service.ts` | 5 endpoints, legal-ref validation, GuardianCreated/Updated |
| `src/modules/people/emergency-contacts.controller.ts / emergency-contacts.service.ts` | 5 endpoints, tenant scope, priority ordering, Created/Updated/Removed |
| `src/modules/people/relationships.controller.ts / relationships.service.ts` | 5 endpoints, bidir reads, revoke, Created/Updated/Revoked |
| `src/modules/people/dto/parent.dto.ts`, `guardian.dto.ts`, `emergency-contact.dto.ts`, `relationship.dto.ts` | Create/Update/List DTOs (scope report §10) |
| `src/modules/people/parents.service.spec.ts`, `guardians.service.spec.ts`, `emergency-contacts.service.spec.ts`, `relationships.service.spec.ts` | Unit suites (scope report §15.4) |
| `test/parents.e2e-spec.ts`, `test/guardians.e2e-spec.ts`, `test/emergency-contacts.e2e-spec.ts`, `test/relationships.e2e-spec.ts` | E2E suites (scope report §15.1–15.3) |

### Modified files
| File | Change |
|---|---|
| `people.module.ts` | Registered 4 controllers + 4 services |
| `people-scope.decorator.ts` | Widened `PeopleScopeTarget` with `parent`, `guardian`, `emergencyContact`, `personRelationship` |
| `people-scope.guard.ts` | Institution branches for parent/guardian/personRelationship; tenant branch for emergencyContact; UUID-only `resolveTarget` additions; `resolveUuidOnly` helper |
| `people.lifecycle.ts` | `canPatchParentStatus`, `canPatchGuardianStatus`, `isValidTemporalBounds` |
| `people.events.ts` | +9 events (ParentCreated, ParentUpdated, GuardianCreated, GuardianUpdated, EmergencyContactCreated/Updated/Removed, PersonRelationshipCreated/Updated/Revoked) |
| `audit-log.consumer.ts` | +9 async handlers (BR-020) |
| `test/people-foundation.e2e-spec.ts` | +4 controller-surface checks (scope report §15.5) |

Unchanged by design: `prisma/schema.prisma`, all Prisma domain files,
`prisma/seed.ts`, and the permission-seed rows.

## 4. Endpoint Outcomes (20)

All 20 endpoint behaviors were exercised end-to-end via the serial e2e suites
listed in §12. Selected evidence:

| Family | Key verified behaviors |
|---|---|
| Parents | 201 create writes Parent + `personInstitution` (roleContext `PARENT`); duplicate `(tenant,person,institution)` → 409; status `ACTIVE→INACTIVE` ok, `INACTIVE→ACTIVE` → 409; stale `version` → 409; soft delete sets `deletedAt` and excludes from list (no fabricated delete event); nested-person mismatch → 404; cross-institution → 403; non-UUID `:id` → 404 not 500 |
| Guardians | Same shape + `legalGuardianshipRef` required on create (400 when missing) and persisted; GUARDIAN personInstitution upsert; GuardianCreated/Updated audit rows |
| Emergency Contacts | 201 with `phonePrimary`; both phones cleared → 400 (BR-06); duplicate `(tenant,person,priority)` → 409; list ordered by priority asc; priority reorder with 200; stale-version 409; remove = soft delete → Removed audit row; tenant-scoped (cross-tenant → 404) |
| Relationships | 201 PARENT source→target; same row readable from **target** (bidirectional OR read); self-relationship → 400 (I-017); `endDate < startDate` → 400 (I-08); forward/reverse duplicate → 409 (canonical single row); metadata round-trip; DELETE = revoke (soft delete, `isActive false`, excluded from both lists); institution-scope denial → 403; non-UUID → 404 |

## 5. DTO / Validation (scope report §10)

- Parent/Guardian: `contactPreference` (enum), `status` (enum), optional `userId`
  (UUID, tenant-verified bridge) on create/update; `version` required on update.
- Guardian: `legalGuardianshipRef` required on create (V-G-03/BR-09), ≤500 chars.
- Emergency contact: `name` ≤200; `phonePrimary` required + `PHONE_REGEX`
  (BR-06); `phoneSecondary?`; `email?` (`@IsEmail`, V-EC-06); `relationship`
  ≤100 (V-EC-04); `priority` `@IsInt @Min(1)` (V-EC-05); `address?` ≤500.
- Relationship: `targetPersonId` (UUID), `relationshipType` enum, `startDate`
  required, `endDate?` with temporal bound (I-08), `metadata?` JSON.
- List DTOs: `page`/`limit` with `@Max(100)`, mirrors existing list conventions;
  parents/guardians add `status`/`contactPreference` filters; relationships add
  `relationshipType` filter. **No institutionId in any body** (always derived
  from auth context).

## 6. Scope / Tenancy Enforcement

- Guard chain: `AuthGuard('jwt') → PermissionGuard → PeopleScopeGuard` on every
  PEOPLE-4 route (same as students/staff).
- Institution-scoped resolution (`parent`, `guardian`, `personRelationship`):
  target must match session tenant + session institution; the optional
  `:personId` nesting is re-verified in-service (`assertNested` /
  `assertInvolvement`) so a record under the wrong person is 404.
- Tenant-scoped (`emergencyContact`): `id + tenantId + personId` resolution;
  cross-tenant UUIDs 404.
- Non-UUID `:id` → 404 (never 500); unknown UUID → 404; cross-institution
  known UUID → 403 (institution) or 404 (person nesting / tenant).
- Client-supplied tenant/institution IDs are never accepted from bodies; the
  session is authoritative.

## 7. RBAC Enforcement

Permissions granted to admin roles only (frozen D-B matrix, seeded rows already
present — **no seed changes were made by this implementation**):
`people:parent:*`, `people:guardian:*`, `people:emergency_contact:*` (underscore),
`people:relationship:*`. E2e asserts HR_OFFICER and TEACHER are denied every
PEOPLE-4 action (403) and unauthenticated requests are rejected (401) across
all four families.

## 8. Lifecycle Rules

- Parent/Guardian status machine (`people.lifecycle.ts`): `ACTIVE`↔`INACTIVE`
  via valid transitions; `INACTIVE→ACTIVE` through this API → 409. Verified in
  unit (§13) and e2e.
- Emergency contact lifecycle: no status enum — live or soft-deleted (Remove).
- Relationship lifecycle: "Expired" is **derived** from `endDate`; revoke =
  DELETE (soft delete + `isActive=false`); no invented status enum.

## 9. Events / Audit (BR-020)

Nine events defined in `people.events.ts` and consumed by
`audit-log.consumer.ts` (async handlers; entity types `parent`, `guardian`,
`emergency_contact`, `person_relationship`; actions `people.{family}.{verb}`):

- ParentCreated, ParentUpdated
- GuardianCreated, GuardianUpdated
- EmergencyContactCreated, EmergencyContactUpdated, EmergencyContactRemoved
- PersonRelationshipCreated, PersonRelationshipUpdated, PersonRelationshipRevoked

Per the frozen spec §5.8 there is **no** Parent/Guardian "deleted" event — soft
delete is observable only via `deletedAt`/`deletedBy` lineage. E2e asserts the
exact audit rows (including a negative cross-tenant leak check) and a unit
assertion confirms no fabricated Removed event on parent/guardian soft delete.

## 10. API Contract Compliance

- Success envelope `{ success: true, data }`; error envelope
  `{ success: false, error: { code, message, ... } }` via the established
  exception filter (no new infra).
- 400 validation (never 422), 403 RBAC/scope, 404 missing, 409 stale-`version` /
  duplicate-unique; optimistic `version` on every update.

## 11. Security / Tenancy Audit

- Fix applied late-stage: the PeopleScopeGuard `personRelationship` branch
  previously selected `userId` (a field that exists on parent/guardian/staff/
  student but **not** on `PersonRelationship`), which surfaced as 500 on all
  `:id` relationship operations. Replaced with a model-accurate select set
  (`{ id, tenantId, institutionId }`). Verified by the relationships e2e suite
  (30/30) and the full serial regression.
- No secrets/keys introduced; no logging of PII beyond existing `personName`
  summaries already established by the template.
- Cross-tenant and cross-institution probes included in every resource suite;
  emergency-contact cross-tenant → 404; institution cross-access → 403.

## 12. Test Evidence (deterministic, serial)

### Unit (`npx jest --runInBand`)
**159 passed / 159 (14 suites)** — target ~148-152 exceeded slightly by adding
all four §15.4 service suites (10 parents + 9 guardians + 8 emergency-contact +
8 relationships = +35 new).

### E2E (`npx jest --config ./test/jest-e2e.json --forceExit --runInBand`)
**287 passed / 287 (14 suites)** — target ~270-276 exceeded by fuller coverage.

| Suite | Tests |
|---|---|
| parents.e2e-spec.ts | 22 |
| guardians.e2e-spec.ts | 23 |
| emergency-contacts.e2e-spec.ts | 27 |
| relationships.e2e-spec.ts | 30 |
| people-foundation.e2e-spec.ts (incl. +4 surface checks) | 10 |
| pre-existing suites (identity, staff, people, audit, auth, sessions, rbac4-object-scope, login-protection, envelope-security) | 175 |
| **Total** | **287** |

### Static gates
- `npx prisma validate` — **PASS**
- `npx tsc --noEmit` — **exit 0**
- `npx nest build` — **exit 0**

## 13. Deviations from the Scope Plan (documented)

1. **Unit count 159 vs ~148-152** — all planned service suites were added; the
   final total sits slightly above the estimate (more coverage, still green).
2. **E2E count 287 vs ~270-276** — same rationale (each suite carries a few
   extra assertions/cases, e.g. garbage-id 404 checks).
3. **Guard `personRelationship` select fix** (see §11) — an implementation
   defect caught by testing, not a scope change.
4. **`prisma/seed.ts` untouched** — the scope plan marked a seed change
   *optional*; e2e creates its own fixtures (preferred), so no seed change was
   needed.

No decision-register entries (§18.3 of the scope report) were opened during
implementation; all choices followed the approved boundary.

## 14. Risks (scope report §19) — disposition

| Risk | Disposition |
|---|---|
| Guard widening regresses existing branches | student/staff/person suites re-run green in the serial gate |
| Route shadowing between `:id` segments | no collisions; four distinct literals exercised end-to-end |
| Emergency-contact tenant vs institution scope | dedicated cross-tenant 404 probe in the EC suite |
| Bidirectional create race | canonical single row + unique constraint; pre-check + P2002 → 409 (unit + e2e) |
| Relationship list growth | paginated + `relationshipType` filter; no new index infra |

## 15. Verdict

### `PEOPLE-4 COMPLETE — VERIFIED`

- All **20 endpoints** implemented per the frozen People spec and the approved
  scope boundary; no out-of-boundary features, no schema change, no new
  permissions/grants, no new packages.
- Full serial regression: **159/159 unit** and **287/287 e2e** passing with the
  canonical `--runInBand --forceExit` configuration; `prisma validate`, `tsc`,
  and `nest build` clean.
- Events/audit (§5.8/BR-020), lifecycle rules, DTO validation, tenancy/object-
  scope, RBAC, and the API contract are implemented and test-asserted as
  documented above.

**End of PEOPLE-4 implementation.**