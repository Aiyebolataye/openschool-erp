# PEOPLE-5 — Scope Verification Report

Date: 2026-09-16
Status: VERIFIED — NO BLOCKERS (implementation may proceed)
Authority: Frozen People Engineering spec + PEOPLE-G batch recommendation + current batch directive (final word).

---

## 1. Batch Boundary

PEOPLE-5 (final People batch) delivers the endpoints and behaviour remaining
from the frozen People spec §10.3 after PEOPLE-1..4:

| Area | Endpoints (spec §10.3) | Permissions |
|------|------------------------|-------------|
| **Applicants** | `GET|POST /people/persons/:personId/applicants`, `GET|PUT|DELETE /people/persons/:personId/applicants/:id`, `POST .../:id/accept`, `POST .../:id/reject` | `people:applicant:*` (incl. accept/reject) |
| **People Documents** | `GET|POST /people/persons/:personId/documents`, `GET|PUT|DELETE /people/persons/:personId/documents/:id` | `people:document:*` |
| **Person Merge** | `GET /people/merge/suggestions`, `POST /people/merge`, `GET /people/merge/history` | `people:person:merge` |
| **Profile Photo** | `POST|DELETE /people/persons/:personId/profile/photo` | `people:person:update` |

Route prefix follows the established PEOPLE-1..4 convention (base mounted at
`/api/v1/people/persons/:personId/...`; merge collection at `/api/v1/people/merge/...`).

**Explicitly OUT of scope** (PEOPLE-G §16 / §12.3 / roadmap):
applicant portal, bulk import, bulk merge, merge auto-suggestion *algorithm*
(advanced scoring; on-the-fly deterministic suggestions endpoint is in scope),
profile-photo *file storage* integration (Platform Services; People stores refs
only per §5.9 assumption 7), applicant notifications (NotificationModule is a
later-phase consumer — same handling used in PEOPLE-2..4).

## 2. Reused Models — NO SCHEMA / MIGRATION CHANGES

| Model | Needed for | Notes |
|-------|-----------|-------|
| `Applicant` | applicant CRUD/accept/reject | Full model already merged (schema.prisma ~L1987). Fields: tenantId, personId, institutionId, publicId (prefix `APP`), applicationDate (Date), targetGrade, source (enum), status (enum: APPLIED/UNDER_REVIEW/ACCEPTED/REJECTED/EXPIRED), notes, audit cols, deletedAt/By, version. Uniques: `[tenantId,personId,institutionId]`, `[tenantId,publicId]`. |
| `PeopleDocument` | document CRUD | Full model already merged. Fields: personId, documentType, documentName, fileReference, fileSize?, mimeType?, status (DocumentStatus enum), expiryDate?, audit cols, deletedAt/By, version. **Tenant-scoped only (no institutionId)** → scope like EmergencyContact. |
| `Person.profilePhotoRef` | photo endpoints | `VarChar(500)` reference column already present (schema L1545). Reference-only storage (§5.9 assumption 7). |
| `Student` + `StudentEnrollmentDetail` | applicant ACCEPT → enroll | §9.8 step 4 mandates Student creation. `gradeLevel` derives from `applicant.targetGrade`; `enrollmentType` default `NEW` (student-service precedent); `PersonInstitution` upsert with `STUDENT` roleContext (student-flow precedent). |
| `audit_logs` | merge history surrogate | §12.4 mandates before/after snapshots with source Person ID in merge metadata. History = `auditLog` rows with `action='people.person.merged'`, `entityType='person'`. **No merge-history table exists and none is created** (verified by grep — no PersonMerge model anywhere). |
| `PersonInstitution` | applicant creation | `APPLICANT` roleContext upsert follows STUDENT/STAFF/PARENT/GUARDIAN precedent (`RoleContext` enum already includes `APPLICANT`, schema L1526). |

**Conclusion:** No `prisma` model or migration work is required. This batch is
pure service/controller/guard/test work on existing schema.

## 3. Permissions — ALL ALREADY SEEDED, NO CHANGES

seed.ts already registers (L310–336): `people:person` incl. `search`/`assign`/`merge`;
`people:applicant` incl. `accept`/`reject`; `people:document` CRUD.
Grants (L423+, operational matrix in PEOPLE-2):
- All 5 admin roles → every `people:*` permission (wholesale grant), so merge + document + applicant perms already held by admin.
- `STUDENT_MANAGEMENT_OFFICER` → `people:applicant` full incl. accept/reject.
- No non-admin role receives document/merge perms (least privilege preserved).

→ Seed untouched; no duplicate permission rows.

## 4. ObjectScope / Guards

- **ObjectScopeGuard registry** (`common/guards/object-scope.guard.ts`) already
  registers `applicant` (id/tenantId/institutionId/personId/status) and
  `peopleDocument` (id/tenantId/personId) at L220/L229. **No change.**
- **PeopleScopeGuard** (`people-scope.guard.ts`) is the People enforcement layer:
  - Add `applicant` to `INSTITUTION_MODELS` + resolve branch (UUID or `publicId`
    fallback like staff/student; dedicated `applicantSelect` **without `userId`** —
    repeat of the PEOPLE-4 `relationshipSelect` trap: `institutionSelect` includes
    `userId` which does not exist on Applicant → would 500).
  - Add `peopleDocument` resolve branch (tenant-scoped like emergencyContact).
  - Merge + photo reuse existing `person` target (no change).
- **PeopleScope decorator** type union needs `'applicant' | 'peopleDocument'` added.
- Merge endpoints are collection-level (`/people/merge/...`, no `:id`) → guard
  short-circuits; service enforces tenant + same-tenant source/target.

## 5. Lifecycle (spec §5.6, §9.8)

Applicant: `APPLIED → UNDER_REVIEW → (ACCEPTED | REJECTED | EXPIRED)`; all
terminal states immutable via update. Update may move APPLIED→UNDER_REVIEW /
UNDER_REVIEW→APPLIED re-open (same-shape rule as staff toggle). Expiry:
§6.5 P-02 default 90 days (30–365). **Expiry mechanism = lazy "expiry-on-read"**
(as PEOPLE-G recommendation, matching prior batches' no-cron stance; documented
decision, not a blocker): a read/accept/reject that finds the application past
`applicationDate + expiryDays` while still APPLIED/UNDER_REVIEW marks it EXPIRED
and emits `ApplicantExpired` once.

## 6. Events (spec §5.8) & Audit (BR-020)

New People events (additive to `people.events.ts` + `AuditLogConsumer`):

| Event | Audit action / entity |
|-------|------------------------|
| `ApplicantCreated` | `people.applicant.created` / `applicant` |
| `ApplicantUpdated` | `people.applicant.updated` / `applicant` |
| `ApplicantAccepted` | `people.applicant.accepted` / `applicant` (+ `StudentEnrolled` emitted by conversion) |
| `ApplicantRejected` | `people.applicant.rejected` / `applicant` |
| `ApplicantExpired` | `people.applicant.expired` / `applicant` |
| `PeopleDocumentUploaded` | `people.people_document.uploaded` / `people_document` |
| `PeopleDocumentRemoved` | `people.people_document.removed` / `people_document` |
| `PersonMerged` | `people.person.merged` / `person` (changes: sourcePersonId, before, after, previousValue/keptValue pairs) |

Fallbacks applied when §5.8 defines no dedicated event (precedent: staff
qualifications/certifications re-emit `StaffUpdated`):
- **Document PUT (update)** → re-emit `PersonUpdated` with `changes { documentUpdated: {id, documentType, documentName} }` (no `PeopleDocumentUpdated` in §5.8).
- **Photo upload / remove** → re-emit `PersonUpdated` with `changes { profilePhotoUploaded | profilePhotoRemoved }` (profile PUT precedent, persons.service L514/606).
- **Accept conversion** → §9.8 mentions "ApplicantConverted" which is NOT in the §5.8 table; the faithful §5.8 set is covered by `ApplicantAccepted` + `StudentEnrolled`.

Consumption in this batch: AuditModule only (NotificationModule/IdentityAccess/
Academics/Finance consumers are later-phase — same as prior batches).

## 7. Merge Semantics (spec §12)

- Manual merge (source + target selected by admin; §12.3). Single transaction (§12.4).
- Identity preserved = target (surviving) Person ID retained; source soft-deleted
  with source ID recorded in merge audit metadata.
- Merge rules §12.2 applied to People-owned data only:
  person profile fields (admin-selected → newest non-null wins; nulls never
  overwrite non-nulls), role records (Student/Staff/Parent/Guardian/Applicant
  rows re-pointed `personId` → survivor), PersonProfile (survivor profile wins,
  source profile soft-deleted), PersonInstitution (consolidated, deduped),
  PeopleDocument (re-pointed; conflicts keep both), EmergencyContact (re-pointed;
  priority conflicts → keep both, resolution left to admin §12.5),
  PersonRelationship (source/target re-pointed — must avoid self-relationship
  flip: a relationship between source+target resolves to identity-preserved).
- Cross-domain (Academics/Finance/Communication) reference updates are consumer
  responsibilities (`MergeConsumer` §9.6) — declared out of People batch scope;
  People-owned tables only. This mirrors StudentEnrolled/etc. cross-domain
  handling in prior batches (events emitted, consumers later).
- Suggestions: deterministic on-the-fly rule set (same normalized email, or same
  phone, or name+DOB match) against non-deleted same-tenant persons, capped
  (§6.5 P-013 page size). Advanced scoring = Future (§16).
- History: read-only `auditLog` listing filtered to `action='people.person.merged'`
  (no new table).

## 8. Policy Limits Applied

P-02 90d expiry (30–365), P-06 people-document max 50/person, P-012 applicant
document max 20 (applies when person holds an active Applicant; else P-06),
P-07 photo ≤5MB metadata validation, P-013 results cap 100, §5.9#7 reference-only.

## 9. Unit Test Requirements (service-level)

- `applicants.service.spec.ts` — create/read/list/update/soft-delete/accept/
  reject/expiry; version-conflict 409; P-012 cap; terminal-state immutability;
  event emissions; `personInstitution` APPLICANT upsert on create;
  accept → Student + enrollment-detail + STUDENT roleContext + ApplicantAccepted
  + StudentEnrolled.
- `people-documents.service.spec.ts` — CRUD, P-06/P-012 cap, soft delete,
  `PeopleDocumentUploaded/Removed` + `PersonUpdated`-fallback emissions.
- `person-merge.service.spec.ts` — source≠target, same-tenant, both non-deleted,
  conflict precedence (admin-selected > newest non-null), null-safety, transaction,
  source soft-delete, `PersonMerged` changes payload, non-People tables untouched,
  suggestions rules, history query.
- `people-scope.guard.spec.ts` additions — applicant (UUID + APP- publicId,
  cross-institution fails closed, no userId 500 trap), peopleDocument scope,
  merge/photo pass-through.
- `applicants.lifecycle` (or inline) — status-state machine matrix.

## 10. E2E Test Requirements (`test/`)

New `applicants.e2e-spec.ts`, `people-documents.e2e-spec.ts`,
`person-merge.e2e-spec.ts`, `profile-photo.e2e-spec.ts` (harness
`create-test-app.ts`, roles principal@greenfield.edu.ng /
student-management-officer@greenfield.edu.ng, DB seeding via existing patterns):
positive CRUD, publicId reads (APP-...), permission 403s (incl.
STUDENT_MANAGEMENT_OFFICER on merge/document = 403), scope/nesting 404/403,
soft-delete + restore semantics, version 409, expiry-on-read, accept→student+
enrollment, reject, suggestion shape, merge flow + audit history row, photo
reference set/clear + BR-020 audit rows, envelope shape.

## 11. Dependencies

None new (EventEmitter2 + Prisma tx already in use). No package changes.

## 12. Compatibility with PEOPLE-1..4

Guard/permission additions are purely additive; no existing endpoint behaviour,
permission, or test is weakened. Frozen PEOPLE-1..4 tests must stay green.

## 13. Decisions That Were NOT Blockers (spec-anchored reconciliations)

1. **Expiry mechanism**: lazy expiry-on-read (PEOPLE-G endorsed; no cron infra).
2. **Merge history storage**: audit_logs surrogate, no new table (§12.2/12.4).
3. **Suggestions**: deterministic rules now; scoring algorithm deferred (§16).
4. **Applicant convert event**: §9.8 "ApplicantConverted" ∉ §5.8 → `ApplicantAccepted` + `StudentEnrolled`.
5. **Doc update / photo events**: no §5.8 event → `PersonUpdated` fallback (prior precedent).
6. **Source enum variance**: V-AP-05 lists `OTHER`; schema enum lacks it → schema authoritative for storage; DTO uses schema enum.
7. **Schema**: models already exist; **no migration required**.

## 14. Blockers / Unresolved Decisions

**NONE.** No STOP condition triggered (no architectural decision required, no
destructive migration, no unexpected data, no new dependency, no security
ambiguity, no frozen-spec conflict).

---
Verified 2026-09-16. Proceeding to implementation on approval.