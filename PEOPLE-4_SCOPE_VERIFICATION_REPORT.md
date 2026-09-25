# PEOPLE-4 Scope & Architecture Verification Report

**Milestone:** PEOPLE-4 (next major People implementation batch)
**Author:** OpenCode (READ-ONLY architectural verification pass)
**Date:** 2026-09-16
**Baseline:** branch `phase/2-rbac` implementation tree after PEOPLE-3 (committed, verified)
**Verdict:** **PEOPLE-4 READY — NO NEW DECISIONS REQUIRED**

---

## 1. Purpose & Methodology

This report is a READ-ONLY architectural verification for the next People
milestone. It reconciles the frozen authoritative documents
(`MASTER_SMS_ROADMAP.md`, `engineering/People Engineering.md` v3.0.0,
`PEOPLE-G_ARCHITECTURE_GATE_REPORT.md`, `PEOPLE-2/3` scope + implementation
reports, `engineering/Identity & Access Engineering.md`) against the **current
implementation tree**, resolves the PEOPLE-4 boundary (Parents, Guardians,
Emergency Contacts, Person Relationships), and verifies that no schema,
permission, authorization, tenant-isolation, or identity work is silently
missing before implementation can begin.

**Constraint:** No code, schema, migration, test, seed, or dependency changes
were made while producing this report. No commits. Only this document was
written.

## 2. Naming Distinction

"PEOPLE-4" is a local working label (same convention as PEOPLE-1/2/3), not a
roadmap label. It denotes the next batch of P4.2 People implementation fixed by
the PEOPLE-G §16 batch plan. This report supersedes nothing: the historical
`PHASE_3_SCOPE_VERIFICATION_REPORT.md` (pre-PEOPLE-1 planning) is preserved.

## 3. Roadmap Alignment

- **Master Roadmap:** Phase 4 groups Institution Management (P4.1) + People
  (P4.2: students, staff, guardians, relationships, profile fields, lifecycle,
  admissions V1, class/enrollment). P4.3 = API quality, P4.4 = critical tests,
  Phase-4 gate. Parents/Guardians/Relationships/Emergency Contacts are explicit
  P4.2 items.
- **Engineering Roadmap:** All V1 domains frozen; People v3.0.0 frozen
  (revision history §18). No new design decision can force a spec change.
- **Batch plan (PEOPLE-G §16):** PEOPLE-1 (schema+seed+RBAC) DONE; PEOPLE-2
  (Person + Student) DONE; PEOPLE-3 (Staff) DONE; **PEOPLE-4 (Parents,
  Guardians, Relationships, Emergency Contacts)** ← this report; PEOPLE-5
  (Applicants/admissions + P4.3/P4.4 quality + gate).

## 4. Prior Milestone Reconciliation

### 4.1 Verification chain status

| Milestone | Verdict | Evidence |
|---|---|---|
| PEOPLE-G | `PEOPLE-G READY — DECISIONS REQUIRED` (`PEOPLE-G_ARCHITECTURE_GATE_REPORT.md`) | 20-model map, permission catalogue, batch plan |
| PEOPLE-1 | COMPLETE — VERIFIED | 20 models migrated (`120000_people_foundation`), `people:*` catalogue + grants seeded, ObjectScope registry extended |
| PEOPLE-2 | `PEOPLE-2 COMPLETE — VERIFIED` | Person + Student APIs, lifecycle, events; unit 110/110; E2E serial 140/140 |
| PEOPLE-3 | `PEOPLE-3 COMPLETE — VERIFIED` (`PEOPLE-3_IMPLEMENTATION_REPORT.md`) | Staff APIs + employment/quals/certs; unit 120/120; E2E serial 181/181; tsc/prisma validate/nest build ✅ |

### 4.2 Frozen decisions carried forward (all applied, none contradicted)

- **D1** 20-model Person aggregate; nullable `userId @unique` compat bridge on
  role rows (incl. Parent/Guardian) keeps Phase-1 login/session path working.
- **D2** Phase-4 boundary only (P4.2 People + P4.4 tests).
- **D3** Parent and Guardian are **distinct sub-types** (legal vs biological),
  institution-scoped person rows.
- **D5** Bulk import deferred to post-PEOPLE-5.
- **D6 / D-B** Permission catalogue + role→permission matrix seeded eagerly;
  least privilege; non-admin operational grants are GROUND TRUTH (see §9).
- **D8** One org-level Person identity; `person_institutions` (+ PersonRelationship)
  carry multi-institution context; no duplicate identities.
- **D9** In-process EventEmitter2 + AuditLogConsumer (BR-020); no outbox.
- **D10** Optimistic `version` on all mutable People tables; 409 on stale.

## 5. Authoritative-Source Reconciliation

Frozen **People spec §10.3** endpoint catalogue (verified directly, lines
1243–1416) defines for PEOPLE-4:

| Resource group | Endpoints | Route (codebase mount) | Permissions |
|---|---|---|---|
| Parents | 5 | `/people/persons/:personId/parents` | `people:parent:*` |
| Guardians | 5 | `/people/persons/:personId/guardians` | `people:guardian:*` |
| Emergency Contacts | 5 | `/people/persons/:personId/emergency-contacts` | `people:emergency_contact:*` (**underscore**) |
| Person Relationships | 5 | `/people/persons/:personId/relationships` | `people:relationship:*` |

- Parents/Guardians/Emergency/Relationships carry **no public_id** in spec
  §7.2 (public IDs exist only for people/students/staff/applicants) — guard
  resolution is by **UUID only** (no `P-`/`STU-`/`EMP-`/`APP-` branch).
- Emergency contacts route uses **`emergency-contacts`** (hyphens) while the
  permission resource uses **`people:emergency_contact`** (underscores) — both
  verbatim from the frozen catalogue; the seed (§seed.ts:336-342) and the
  foundation e2e already use the underscore form.
- DELETE on relationships = "Revoke relationship"; on parents/guardians/
  emergency contacts = "Soft delete".
- No People-4 endpoint has a **body-restricted action** beyond the standard
  five; no accept/reject/restore-style actions exist for these groups.

### 5.1 Schema reconciliation (all four entities already present)

All four models exist in `apps/api/prisma/domains/people.prisma` and in the
committed migration chain (`20260915120000_people_foundation`). They match spec
§7.1–§7.4 **exactly** (including indexes and unique constraints), plus the
frozen `userId @unique` compat bridge:

| Model | Spec-mandated columns | Unique constraints | Indexes (§7.4) | Status enum |
|---|---|---|---|---|
| `Parent` | contactPreference, status | `@@unique([tenantId, personId, institutionId])` | `(tenantId, personId)`, `(tenantId, institutionId)` | `ParentStatus` ACTIVE/INACTIVE |
| `Guardian` | legalGuardianshipRef?, contactPreference, status | same | same | `GuardianStatus` ACTIVE/INACTIVE |
| `EmergencyContact` | name, phonePrimary (req), phoneSecondary?, email?, relationship, priority, address? | `@@unique([tenantId, personId, priority])` | `(tenantId, personId)` | **none in frozen spec** |
| `PersonRelationship` | source/target person, type, institutionId, startDate, endDate?, isActive, metadata? | `@@unique([tenantId, sourcePersonId, targetPersonId, relationshipType, institutionId])` | source / target / institution | **none in frozen spec** |

Enums in the merged schema: `RelationshipType` (PARENT, GUARDIAN, SIBLING,
EMERGENCY_CONTACT, AUTHORIZED_PICKUP, STAFF_STUDENT, OTHER),
`ContactPreference` (EMAIL, PHONE, SMS, WHATSAPP), `ParentStatus`,
`GuardianStatus`. Seed already creates guardian + parent + 3 PARENT
relationships (`seed.ts:763-832`); foundation e2e asserts
`person_relationships` replace the legacy SGR for the Eze family.

**Schema verdict: NO change.** No migration, model, or enum alteration.
Mirrors D-F from PEOPLE-2 ("no schema change during batch") and the
PEOPLE-3 precedent.

## 6. Boundary Resolution

**PEOPLE-4 = Parents (5) + Guardians (5) + Emergency Contacts (5) + Person
Relationships (5) = 20 endpoints.** Rationale (from PEOPLE-G §16 and
PEOPLE-3 scope §6):

1. Follows the approved batch plan; "guardians, relationships" are explicit
   P4.2 roadmap items.
2. Comparable scope to PEOPLE-3 (Staff = 15 endpoints + one status machine);
   here the machine shape is simpler (ACtive/Inactive toggles + temporal
   rules), so this batch is at most equal effort.
3. Self-contained: no dependency on Applicants, Documents, Merge, or Photos.
4. Tightly coupled by design — relationships/guardians/emergency contacts are
   the student lifecycle companions; implementing them in one batch avoids
   half-linked guardian data.

## 7. Tenancy / Object-Scope Model

Per PEOPLE-G §10 (object-scope strategy verified) and the current
`people-scope.guard.ts`:

| Object | Scope | Guard resolution | Service check |
|---|---|---|---|
| `Parent` | institution | `PeopleScope('parent')` → institution branch (mirrors `staff`) | nested `personId` host match |
| `Guardian` | institution | `PeopleScope('guardian')` → institution branch | nested `personId` host match |
| `PersonRelationship` | institution (has `institutionId`) | `PeopleScope('personRelationship')` → institution branch | bidirectional read (source OR target), nested check on `:personId` |
| `EmergencyContact` | tenant (no institution) | `PeopleScope('emergencyContact')` → **tenant branch** + owner-person nested check | `emergencyContact.personId === :personId` |

- Client-supplied tenant/institution/object ids are never trusted; guard fails
  closed (403/404). All targets resolve by **UUID only** (no public_id), so a
  non-UUID `:id` yields 404 — not 500 (established trap rule).
- Lists/create (no `:id`) short-circuit the guard (`people-scope.guard.ts:72-76`);
  the service enforces tenant + institution + person-nesting from trusted
  caller state (the `:personId` host). List scope defaults to the caller's
  active `institutionId`, overridable only for multi-institution admins
  (PEOPLE-3 §13 convention).
- `people-scope.decorator.ts` `PeopleScopeTarget` union ('person' | 'student' |
  'staff') widens to add the four new targets.
- **Self-service branch unchanged:** the D-B matrix grants PARENT/STUDENT roles
  only `people:person:read` + `people:student:read` — they cannot hold any
  People-4 permission, so PermissionGuard denies first; no self-scope path is
  added (frozen D-B decision, no change to the guard's self branch).

## 8. RBAC / Permission Audit

### 8.1 Permission catalogue — ALREADY SEEDED (§10.3 verbatim)

`seed.ts:313-344` registers, and `people-foundation.e2e-spec.ts:86-97` asserts:

- `people:parent` → list/read/create/update/delete
- `people:guardian` → list/read/create/update/delete
- `people:emergency_contact` → list/read/create/update/delete
- `people:relationship` → list/read/create/update/delete

### 8.2 Role grants — ALREADY SEEDED (frozen D-B matrix)

Foundation e2e (`people-foundation.e2e-spec.ts:115-171`) asserts the exact
grant set: the **five admin roles** receive all `people:*` (including the four
People-4 resources); non-admin roles receive **only** their D-B rows — and
**NO non-admin role (including HR_OFFICER, TEACHER, PARENT, STUDENT,
STUDENT_MANAGEMENT_OFFICER) receives any `people:parent`, `people:guardian`,
`people:emergency_contact`, or `people:relationship` grant.**

**RBAC verdict: NO new permissions, NO new grants, NO role changes.** Admin-only
CRUD for all 20 People-4 endpoints is the frozen matrix. Least privilege holds.

## 9. API Contract (20 Endpoints)

### 9.1 Parents — `/people/persons/:personId/parents`

| # | Method | Route | Action | Permission |
|---|---|---|---|---|
| 1 | GET | `.../parents` | List (institution-scoped, status/contactPreference filter, pagination) | `people:parent:list` |
| 2 | GET | `.../parents/:id` | Read by UUID | `people:parent:read` |
| 3 | POST | `.../parents` | Create (Parent row for existing Person; PersonInstitution roleContext `PARENT`; optional `userId` bridge) | `people:parent:create` |
| 4 | PUT | `.../parents/:id` | Update (version-checked; contactPreference/status) | `people:parent:update` |
| 5 | DELETE | `.../parents/:id` | Soft delete (`deletedAt` set) | `people:parent:delete` |

### 9.2 Guardians — `/people/persons/:personId/guardians`

Same shape as Parents with `people:guardian:*`; create/update require
`legalGuardianshipRef` (V-G-03 / BR-09 / I-09) as a **document/file reference**
string.

### 9.3 Emergency Contacts — `/people/persons/:personId/emergency-contacts`

| # | Method | Route | Action | Permission |
|---|---|---|---|---|
| 1 | GET | `.../emergency-contacts` | List (person-scoped, ordered by priority) | `people:emergency_contact:list` |
| 2 | GET | `.../emergency-contacts/:id` | Read by UUID | `people:emergency_contact:read` |
| 3 | POST | `.../emergency-contacts` | Create (at least one phone; priority unique per Person) | `people:emergency_contact:create` |
| 4 | PUT | `.../emergency-contacts/:id` | Update (version-checked; priority re-order) | `people:emergency_contact:update` |
| 5 | DELETE | `.../emergency-contacts/:id` | Soft delete | `people:emergency_contact:delete` |

### 9.4 Person Relationships — `/people/persons/:personId/relationships`

| # | Method | Route | Action | Permission |
|---|---|---|---|---|
| 1 | GET | `.../relationships` | List (source **OR** target = bidirectional; type/temporal filter, pagination) | `people:relationship:list` |
| 2 | GET | `.../relationships/:id` | Read by UUID | `people:relationship:read` |
| 3 | POST | `.../relationships` | Create (canonical single row; source≠target; start≤end; institution-scoped) | `people:relationship:create` |
| 4 | PUT | `.../relationships/:id` | Update (version-checked; temporal bounds/endDate/isActive) | `people:relationship:update` |
| 5 | DELETE | `.../relationships/:id` | **Revoke** (soft delete) | `people:relationship:delete` |

**Contract conventions (established):** all mounted under
`people/persons/:personId/...` (Person-root aggregate); `{ success: true,
data }` envelope; 400 ValidationPipe (never 422); 403 RBAC/scope; 404 missing;
**409** stale-`version` or duplicate-unique; optimistic `version` on every
update. The `:personId` host is verified in-service (nested-relationship),
mirroring students/staff. Path-segment checks show **no routing collision**:
`parents`, `guardians`, `emergency-contacts`, `relationships` are distinct
literals and non-conflicting with existing `students`/`staff` mounts.

## 10. DTO / Validation Contract (spec §6.6)

Follow `dto/student.dto.ts` / `dto/staff.dto.ts` conventions (`NAME_REGEX`,
`ID_NUMBER_REGEX`, `List<X>QueryDto` with `Max(100)`, `@IsEnum`,
`@IsDateString`, required-`version` on update):

- **Create/UpdateParentDto** — `contactPreference?: ContactPreference` enum
  (V-PA-03), `status?: ParentStatus` (V-PA-04), `userId?` (`@IsUUID`, compat
  bridge, optional).
- **Create/UpdateGuardianDto** — `legalGuardianshipRef` **required** on create
  (V-G-03/BR-09; ≤500, file-reference string), `contactPreference?`, `status?`,
  `userId?`.
- **Create/UpdateEmergencyContactDto** — `name` required ≤200 (V-EC-02);
  `phonePrimary` required, valid phone format, at least one phone present
  (BR-06/I-06/V-EC-03); `phoneSecondary?`, `email?` (`@IsEmail`, V-EC-06);
  `relationship` required ≤100 (V-EC-04); `priority` required `@IsInt @Min(1)`
  (V-EC-05); `address?` ≤500.
- **Create/UpdateRelationshipDto** — `targetPersonId`, `relationshipType`
  (`RelationshipType` enum; V-PR-03), `institutionId`, `startDate` required,
  `endDate?` ≥ startDate (V-PR-05/I-08), `metadata?` JSON (I-017 source≠target
  enforced in service — the route's `:personId` is source).
- **List query DTOs** — page/limit/sort/pagination mirroring the established
  list DTOs; parents/guardians add `status`/`contactPreference` filters;
  relationships add `relationshipType` filter. No new search infra.

## 11. Events / Audit (BR-020)

Add to `PeopleEvents` in `people.events.ts` (frozen `{Entity}{PastTenseVerb}`
convention; `PeopleEventPayload` shape), exactly the §5.8 set — **and no
more**:

- `ParentCreated`, `ParentUpdated`
- `GuardianCreated`, `GuardianUpdated`
- `EmergencyContactCreated`, `EmergencyContactUpdated`, `EmergencyContactRemoved`
- `PersonRelationshipCreated`, `PersonRelationshipUpdated`, `PersonRelationshipRevoked`

Add 9 matching `@OnEvent(..., { async: true })` handlers in
`audit-log.consumer.ts` under a `// ---- PEOPLE-4 (BR-020) ----` section
(record `tenantId, actorId, actorEmail, action, entityType, entityId, changes`,
wrapped in `safe(...)`), entityType `parent` / `guardian` /
`emergency_contact` / `person_relationship`.

**Spec-fidelity finding (no event invention):** §5.8 defines **no**
Parent/Guardian "deleted" events and no `EmergencyContactInactive` /
`PersonRelationshipExpired` events. Soft deletes and temporal expiry therefore
write **no child-domain event** — exactly how Student soft delete was handled in
PEOPLE-2 (no `StudentSoftDeleted` event exists). This is frozen-catalogue
compliance, not an omission; BR-020 lineage is preserved by `deleted_at`/
`deleted_by`/`updated_by` and the audited operations.

## 12. Search / Pagination / Lists

- Simple where-clause lists (institution/person-scoped) with deterministic
  sort + the established pagination contract. No full-text search for these
  four groups (spec §10.3 lists no `search` endpoint for them; PersonSearch is
  the P-2 concern).
- Emergency contacts ordered by `priority` (BR-017 / I-016).
- Relationships list resolves **both** directions (source OR target) so a
  parent/guardian relationship is visible from either person — the §6.2a
  bidirectionality requirement surfaced at read time.

## 13. Identity / Modeling Notes (§13 Person vs User; §6.2a)

- Creating a Parent/Guardian/Emergency Contact/Relationship **never provisions
  User credentials** (§13.3, ADR-032); the `userId @unique` bridge on Parent/
  Guardian is an *optional* pointer to an existing Identity row only (kept per
  D3/§18.3 decision, already schema-frozen).
- A Person who is Staff **and** Parent retains **one** Person identity (D8);
  the Parent row (institution-scoped) + `person_institutions(PARENT)` and/or a
  PARENT relationship render role context. No duplicate people created.
- Emergency Contact links are **independent** of Person Relationships (§6.2a
  rule); both are implemented without cross-coupling.
- Parent/Guardian are distinct sub-types (ADR-017); no merged table.

## 14. Exclusions / Deferred (outside PEOPLE-4)

- **Applicants** (7 endpoints incl. accept/reject/convert-to-Student), **People
  Documents** (5), **Person Merge** (3), **Profile Photo** (2 spec-Future) →
  PEOPLE-5 (PEOPLE-G §16).
- **Bulk import** → post-PEOPLE-5 (D5). **Address value-object** (§14) → future
  batch (not in §10.3 endpoint catalogue).
- **People-4 record types carry no public_id** — no public-ID generator work for
  this batch.
- **AUTHORIZED_PICKUP approval workflow** (BR-018 / I-025): no approval entity
  exists in any frozen schema; V1 records the relationship type without
  inventing approval infrastructure (D5-style recorded exclusion; the enum
  value stays valid). If a workflow is ever wanted it is a future-batch
  decision, not a PEOPLE-4 schema/API carve-out.

## 15. Testing Plan

### 15.1 Parent/Guardian E2E (`parents.e2e-spec.ts`, `guardians.e2e-spec.ts`) — ~24-28 each

1. Create (existing Person host) → 201; PersonInstitution roleContext
   `PARENT`/`GUARDIAN` written; row resolvable.
2. Create duplicate `(tenant, person, institution)` → **409** (schema unique).
3. Guardian create without `legalGuardianshipRef` → 400 (V-G-03).
4. Read by UUID → 200; non-UUID garbage `:id` → 404 (not 500).
5. List institution-scoped only; `status`/`contactPreference` filters.
6. Update → 200 (next-version); stale `version` → **409**.
7. Soft delete → read → 404; excluded from list.
8. Status transition ACTIVE ↔ INACTIVE (valid); invalid input → 400.
9. RBAC: TEACHER, PARENT, STUDENT, HR_OFFICER try all five actions → **403**
   (no grant); each admin role succeeds.
10. Cross-institution denial 403/404; cross-tenant → 404.
11. Nested-relationship mismatch: parent row under a person that does not own
    it → 404.
12. `userId` bridge: link to existing User → persisted; unlink on update.
13. Audit rows on create/update/delete.
14. Isolation + environment via the standard test harness
    (`create-test-app`, `loginAs`, per-run `db push --force-reset` + seed).

### 15.2 Emergency Contact E2E (`emergency-contacts.e2e-spec.ts`) — ~22-26

1. Create with `phonePrimary` → 201; ordered by priority on list.
2. Create without any phone → 400 (BR-06/I-06/V-EC-03).
3. Duplicate `(tenant, person, priority)` → **409** (schema unique, I-016).
4. `priority` non-positive / non-integer → 400 (V-EC-05).
5. Update (next-version 200; stale 409); reorder priorities → 200, order
   reflects new values.
6. Soft delete → list excludes; read 404.
7. Tenant-scope: cross-tenant id → 404; nested person mismatch → 404.
8. RBAC: non-admin roles → 403; admin success.
9. Audit rows on add/update/remove.

### 15.3 Relationship E2E (`relationships.e2e-spec.ts`) — ~28-30

1. Create PARENT source→target → 201; read back from **target** list (OR)
   proves bidirectionality (BR-07/§6.2a).
2. Self-referential source==target → 400 (I-017/V-PR-07).
3. `endDate < startDate` → 400 (I-08/V-PR-05).
4. Duplicate `(tenant, source, target, type, institution)` → **409**; reverse
   duplicate → **409** (single canonical row).
5. Update temporal bounds/endDate (`isActive` via endDate) → 200/409-stale.
6. DELETE = revoke → soft deleted; excluded from lists.
7. Institution-scope: relationship in institution B queried from institution-A
   session → 403/404; cross-tenant → 404.
8. Type enum validation: `SIBLING`, `AUTHORIZED_PICKUP`, `STAFF_STUDENT`,
   `OTHER`, `EMERGENCY_CONTACT` accepted; garbage → 400.
9. RBAC: non-admin → 403; admin success.
10. Audit rows on create/update/revoke.
11. P-05-style count behavior is **not** enforced by new machinery (see §19).

### 15.4 Unit tests (`*.service.spec.ts` × 4 + lifecycle) — ~24-30 total

Service suites mirror `staff.service.spec.ts`: create/update/find, `version`
conflicts, scope derivation, `isUuid`/UUID-only branching, soft-delete
preservation, unique constraints, event emission (9 events), and the
Parent/Guardian status machine from `people.lifecycle.ts`
(ACTIVE ↔ INACTIVE helpers mirroring `canPatchStaffStatus`).

### 15.5 Foundation surface (`people-foundation.e2e-spec.ts`)

Add 4 module-surface checks: each of the four controllers mounted with the
correct permission strings (rows already asserted).

### 15.6 Regression gate (must stay green)

- Full unit: **120 → ~148-152**.
- Full E2E serial (`--runInBand`, single test DB): **181 → ~270-276**.
- `prisma validate` ✅ (`npx prisma validate` from `apps/api`), `tsc --noEmit`
  exit 0 ✅, `nest build` exit 0 ✅.
- Re-run the complete suite before declaring PEOPLE-4 complete.

## 16. Implementation Plan

### New files

| File | Content |
|---|---|
| `apps/api/src/modules/people/parents.controller.ts` / `parents.service.ts` | 5 endpoints, institution scope, events |
| `apps/api/src/modules/people/guardians.controller.ts` / `guardians.service.ts` | 5 endpoints, legal-ref validation |
| `apps/api/src/modules/people/emergency-contacts.controller.ts` / `emergency-contacts.service.ts` | 5 endpoints, tenant scope, priority ordering |
| `apps/api/src/modules/people/relationships.controller.ts` / `relationships.service.ts` | 5 endpoints, bidir reads, revoke |
| `apps/api/src/modules/people/dto/parent.dto.ts`, `guardian.dto.ts`, `emergency-contact.dto.ts`, `relationship.dto.ts` | Create/Update/List DTOs (§10) |
| `apps/api/test/{parents,guardians,emergency-contacts,relationships}.e2e-spec.ts` | E2E suites (§15) |
| `apps/api/src/modules/people/{parents,guardians,emergency-contacts,relationships}.service.spec.ts` | Unit suites (§15.4) |

### Modified files

| File | Change |
|---|---|
| `people.module.ts` | Register 4 controllers + 4 services |
| `people-scope.decorator.ts` | Widen `PeopleScopeTarget` (+4 models) |
| `people-scope.guard.ts` | Institution branches for `parent`/`guardian`/`personRelationship`; tenant branch for `emergencyContact`; `resolveTarget` UUID-only additions; union typings |
| `people.lifecycle.ts` | Parent/Guardian ACTIVE↔INACTIVE machine helpers |
| `people.events.ts` | +9 events (§11) |
| `audit-log.consumer.ts` | +9 handlers (§11) |
| `people-foundation.e2e-spec.ts` | +4 surface checks (§15.5) |
| `prisma/seed.ts` | **optional only** — emergency-contact fixtures for the seeded Eze family if e2e needs a seeded baseline; otherwise e2e creates its own |

## 17. Dependencies

- **No new npm packages.** Reuses: PrismaService, PermissionGuard,
  PeopleScopeGuard, ObjectScopeGuard, AuditLogService, EventEmitter2,
  Person/Student/Staff service + DTO conventions, `isUuid` pattern, test
  harness (`create-test-app`, `loginAs`, reset-per-run DB).
- No outbox, external queue, or storage services (guardianship refs are
  references only, ADR-004/034).
- Cross-domain: emergency/relationship data is person-internal; no Academics/
  Finance module dependency.

## 18. Decisions Register

### 18.1 Resolved in PEOPLE-G / PEOPLE-2/3 (carried forward, applied)

D1, D2, D3, D5, D6, D8, D9, D10, D-B operational matrix, D-F (no-schema-change
batch rule). No change requested by this report.

### 18.2 Reconciliation findings (implementation-detail resolutions — NOT new decisions)

1. **Bidirectional relationships = single canonical stored row; reverse reads
   via OR(source,target).** Forced by the frozen unique constraint
   `(tenant, source, target, type, institution)` plus the §6.7 read model and
   the existing guard's OR-matching precedent (`people-scope.guard.ts:164-174`).
   Reverse duplicates → 409. No mirror-row machinery invented.
2. **Emergency Contact "Active/Inactive" (§5.6) is soft-delete-only.** The
   frozen schema (spec §7.2 + Prisma model) has **no status column/enum**; do
   not invent an `EmergencyContactStatus`.
3. **Relationship "Expired" (§5.6) is derived** from `endDate`; revoke = DELETE
   soft-delete. No `RelationshipStatus` enum invented.
4. **Guardianship ref is DTO-required, DB-nullable.** V-G-03/BR-09/I-09 require
   the reference; the frozen §7.2 table does not mark it NOT NULL — validated
   at the API boundary, not a schema change.
5. **AUTHORIZED_PICKUP approval (BR-018) not built** — no approval entity
   exists in the frozen schema; recorded exclusion (D5 precedent), see §14.
6. **Configurable policies P-03/P-05/P-16/P-17 defaults are recorded, not
   enforced via new machinery** — consistent with how P-09/P-010 were handled in
   PEOPLE-3 (no cap/feature infra introduced for staff qualifications/certs).
   Schema uniqueness prevents degenerate duplicates. If firm caps become a
   product requirement, that is a PEOPLE-5+/config-Infra decision, not
   PEOPLE-4.

### 18.3 Opened by this report

**None.** Every Y/N PEOPLE-4 poses is answered by (a) the frozen spec §10.3/
§5.7/§6.3-§6.6, (b) the already-merged schema + seed + permission grant, or
(c) the implemented Student/Staff template. No human authorization is required
to begin.

## 19. Stop Conditions & Risks

### 19.1 Stop conditions — none triggered

- Destructive migration ambiguity: **N/A** (no migration).
- Data ownership ambiguity: **N/A** (parents/guardians/relationships are
  institution-scoped; emergency contacts person-scoped; all per spec §7.2).
- Spec contradiction requiring a spec change: **none found** (the §18.2
  findings are reconciliations, not contradictions).
- Tenant-isolation ambiguity: **none** (tenant + institution scoping mirrors
  the proven Staff branch; emergency contacts tenant-scoped like Person).
- Authorization contradiction: **none** (the frozen D-B matrix already grants
  exactly the admin-role-only access these resources require).
- Unauthorized dependency: **none** (no new package/service).

### 19.2 Risks (monitored, non-blocking)

| Risk | Mitigation |
|---|---|
| Guard widening regresses existing student/staff branches | Keep the same switch shape; full serial e2e regression re-runs students/staff/person suites |
| Route shadowing between `:id` segments | Verified distinct literals (`parents`, `guardians`, `emergency-contacts`, `relationships`); contract table in §9 is the checklist |
| Emergency-contact tenant scope accidentally treated as institution scope | Explicit `emergencyContact` branch routed to the tenant path; dedicated cross-tenant e2e (§15.2 #7) |
| Bidirectional create race (two opposite-direction creates) | Single canonical row + unique constraint → second request 409; transaction-scoped |
| Relationship list grow | Paginated list + `relationshipType` filter; no new index infra (spec §7.4 indexes already present) |

## 20. Verdict

### `PEOPLE-4 READY — NO NEW DECISIONS REQUIRED`

- Boundary: **Parents (5), Guardians (5), Emergency Contacts (5), Person
  Relationships (5) = 20 endpoints** per frozen People spec §10.3, aligned to
  the PEOPLE-G §16 batch plan and P4.2/P4.4 roadmap items.
- Zero blocked items: all four Prisma models are already migrated and
  spec-conformant; the `people:parent` / `people:guardian` /
  `people:emergency_contact` / `people:relationship` permission rows and the
  admin-role grants are already seeded and e2e-asserted; the ObjectScope
  registry already covers every People model; the PeopleScopeGuard pattern is
  proven twice (student, staff).
- No schema change, no new permissions or grants, no new packages, no new
  decisions: implementation is a pattern repetition of the proven Person/
  Student/Staff template (controller + service + DTO + guard branch + lifecycle
  helpers + events + audit handlers + e2e/unit), reusing established helpers
  and the `--runInBand` serial e2e gate.
- All §18.2 reconciliation findings are frozen-schema-forced resolutions
  already consistent with the live seed and the existing guard semantics.

Next action when approved: implement per §16 (new files + guarded edits), then
run the §15 full regression gate (unit ~150, E2E ~270, `prisma validate`, tsc,
`nest build`) and produce `PEOPLE-4_IMPLEMENTATION_REPORT.md`.

**STOP — no implementation begins until this boundary is approved.**

*END OF PEOPLE-4 REPORT*