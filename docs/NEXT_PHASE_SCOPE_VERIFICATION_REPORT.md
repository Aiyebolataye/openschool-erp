# NEXT PHASE SCOPE VERIFICATION REPORT

(READ-ONLY RECONCILIATION GATE - no implementation performed during this gate.)

Authoritative evidence (all shell-verified on disk, this session, byte-safe reads):
  - APS/API module dir = audit, auth, delivery, identity, invitations, onboarding, people, session (shell Get-ChildItem).
  - NO institution module file/dir exists under src (shell dir listing) -> P4.1 Institution Management is the genuine gap.
  - people module on disk (36 files): staff, students, guardians, parents, applicants, emergency-contacts,
    people-documents, people-merge, relationships, people.events, people.lifecycle, people-scope.guard+decorator.
  - people e2e specs present: applicants/guardians/parents/people/relationships/staff/emergency-contacts/people-merge/people-documents (shell Test-Path).
  - prisma domains/institution.prisma + schema.prisma: Institution/Tenant/Department models present (shell grep, models at 1/54/101 + schema head).
  - migration 20260915120000_people_foundation + 20260915120000_people_foundation present (shell dir listing).
  - Phase-3 report written to disk; NEXT_PHASE_SCOPE_VERIFICATION_REPORT.md written by this gate.

## 1. Executive Summary

PEOPLE-1..5 are NOT missing: People (incl. PEOPLE-5 applicants/admissions, person-merge, photo/media)
is substantially on disk. The genuinely next major roadmap phase is PHASE 4 - INSTITUTION MANAGEMENT
& PEOPLE, and within it the genuinely missing owner is P4.1 Institution Management (no institution
module on disk). Phase 3 + People runtime verification remains BLOCKED-INFRA (no live Postgres/Redis/
Docker); this is an INABILITY TO RUN, not a code failure - no test result fabricated.

## 2. Phase Reconciliation (roadmap MASTER_SMS_ROADMAP.md + on-disk)

- Phase 0 (Baseline/hygiene): COMPLETE + VERIFIED.
- Phase 1 (AuthN, RBAC-1/2): COMPLETE + VERIFIED.
- Phase 2 (RBAC-3 multi-tenant, RBAC-4): COMPLETE on disk; RUNTIME-VERIFICATION BLOCKED-INFRA.
- Phase 3 (Backend Reliability: D1 logging / D2 queue single-source / D3 Redis health):
  IMPLEMENTED + tsc-verified (exit 0, twice); runtime/e2e BLOCKED-INFRA.
- PEOPLE-1..5 (People workstream incl. PEOPLE-5 applicants/admissions, person merge, photo):
  IMPLEMENTED on disk (module + e2e + migration); runtime BLOCKED-INFRA. See section 4.

## 3. Next Major Phase Identified

PHASE 4 - INSTITUTION MANAGEMENT & PEOPLE (roadmap: P4.1 Institution Management, P4.2 People,
P4.3 API quality, P4.4 Critical tests; Phase 4 gate: "Core institution and people workflows must
operate end-to-end through real APIs and pass security tests."). Verbatim from MASTER_SMS_ROADMAP.md
Phase-4 header + objective + gate (shell-read at lines 520-585).

## 4. PEOPLE-5 Status (explicit, root-caused)

PEOPLE-5 (applicant/admissions domain, person merge, photo/media, person-scope guard): all present
on disk as source. It is NOT left-complete-as-implementation; the honest statement is:
  - Implementation: DONE on disk (module files + e2e + migration + frozen People spec report).
  - Runtime verification: BLOCKED-INFRA (needs live Postgres/Redis/Docker, all unavailable this gate).
  - No e2e pass claimed. No fabrication. PEOPLE-5 is NOT the missing piece for the NEXT phase;
    it only re-enters the runtime-defeer conversation once infra returns.

## 5. Exact Next-Phase Scope (from roadmap, no invention)

### P4.1 Institution Management (the genuinely missing owner)

- Institution lifecycle.
- Institution configuration.
- Institution settings.
- Institution users/admin relationships.
- Relevant institution-level configuration.
- Required platform-admin operations.
- Required institution-admin operations.
- For every operation: authentication, authorization, tenant enforcement, validation, audit logging, tests.

### P4.2 People

Implement per frozen People Engineering specification: students, staff, guardians, relationships,
required profile fields, status/lifecycle operations, admissions/enrollment for V1,
class/enrollment relationships (as schema/spec define). ALREADY ON DISK - do not re-implement;
runtime-verify once infra returns.

### P4.3 API quality

Every people endpoint: DTO validation, authorization, tenant isolation, pagination/filtering where
specified, safe response fields, consistent errors, tests.

### P4.4 Critical tests

CRUD authorization, cross-tenant access, duplicates/uniqueness, invalid relationships,
deactivation/status behavior, transactional multi-record operations.

## 6. Architecture Compatibility

P4.1 Institution Management consumes the frozen, already-present Prisma foundation
(Institution/Tenant/Department models + InstitutionMembership relation in identity.prisma;
tenant-scoped RBAC-3/RBAC-4 object-scope guard + decorator). New institution jobs must consume
Phase-3 single-source buildQueueJobOptions; structured logging + correlation via Phase-3 wiring;
Terminus readiness (DB+Redis) reused; liveness independent; no new dependencies;
no new infra (frozen no-new-infra rule).

## 7. Database / Schema Analysis

Institution model + Tenant + Department already exist (domain institution.prisma model at 54;
schema.prisma head + InstitutionMembership at 1044-1144). P4.1 additions are expected additive
(new fields/settings on Institution), tenant-scoped; no migration authored during this READ-ONLY gate.

## 8. Tenancy / Authorization

Institution/People endpoints are tenant-scoped via existing RBAC-3/RBAC-4 object-scope guard;
platform-admin vs institution-admin boundaries follow the frozen RBAC conventions. Every
operation derives institution/tenantId from server-side session context (never client input).

## 9. API Contract / Events / Background

Standard success/error envelope + correlationId; REST under apiPrefix; tenant-scoped routes;
queue-backed institution operations via buildQueueJobOptions (Phase-3 single source);
institution-created/updated events via existing EventEmitter pattern; Terminus readiness DB+Redis,
liveness independent.

## 10. Tests / Phase 4 gate

Per roadmap P4.4 + Phase 4 gate: CRUD authorization, cross-tenant, uniqueness, invalid relationship,
status/lifecycle, transactional tests. All require live Postgres+Redis; runtime stays BLOCKED-INFRA.

## 11. Genuine Decisions Required

1. Confirm P4.1 Institution Management opens as the next implementation owner (P4.2 People already
   on disk; no re-implementation).
2. Confirm whether people runtime-e2e (PEOPLE-1..5) may stay deferred (BLOCKED-INFRA) while P4.1
   code is authored, or whether infra must be restored first - architectural vs operational.
3. Confirm P4.1 institution-config/settings additions are additive-safe to the frozen Institution
   model (no destructive migration).

## 12. Hard-Stop Check

No roadmap contradiction, destructive migration, tenant-boundary ambiguity, authorization conflict,
or dependency on an unfinished architectural decision blocks P4.1 from being scoped. The only blocker
is operational (live Postgres/Redis/Docker), which does not gate code authoring under the frozen
no-new-infra rule.

## 13. Final Verdict

NEXT PHASE READY— DECISIONS REQUIRED

Next phase: PHASE 4 - INSTITUTION MANAGEMENT & PEOPLE, owner = P4.1 Institution Management.
People (P4.2) is already on disk. Phase 3 + People runtime verification remains BLOCKED-INFRA
and is NOT a code failure (no test result fabricated). Restoring infra then re-running e2e
(PHASE_3_e2e + PEOPLE e2e) is the honest unblock for the existing Phase-3 gate.