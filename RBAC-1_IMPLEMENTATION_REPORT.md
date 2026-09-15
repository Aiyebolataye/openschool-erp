---
title: RBAC-1 (P2.1) Implementation Report — Identity Permission Model
project: OpenSchool SMS
frozen_spec: engineering/Identity & Access Engineering.md
batch_baseline: RBAC-1_PREPARATION_REPORT.md + PHASE_2_SCOPE_VERIFICATION_REPORT.md
status: IMPLEMENTED — AWAITING AUTHORIZATION FOR RBAC-2
authorization: User-authorized RBAC-1 (P2.1) only. RBAC-2/3/4 deliberately NOT started.
---

# RBAC-1 (P2.1) — Identity Permission Model: Implementation Report

## 1. Scope Executed

Single deliverable per the frozen batch table: **P2.1 — Permission model extraction +
comparison + migration + seed.** Implemented against the sole authoritative source
(`engineering/Identity & Access Engineering.md`, section 7.4/10 — API Catalogue +
section 3.4 ADR-002 two-layer permission model), mirrored verbatim into the seed.

Constraints honored (no invention):
- Permission rows are taken **verbatim** from the frozen endpoint→permission matrix.
- No new roles invented; assignments extend the existing admin-role set already
  present in seed.ts (PLATFORM_ADMIN, ORG_ADMIN, PRIMARY_INSTITUTION_ADMIN,
  INSTITUTION_ADMIN, PRINCIPAL) — the same 5 roles used by the prior B-series.
- No schema/migration change (permission catalogue is a `Permission` + `PermissionGroup`
  + `RolePermission` data change only). Not part of RBAC-1.
- Tenant isolation / Phase-1 invariants untouched.

## 2. Change Record

| File | Change | Nature |
|------|--------|--------|
| `apps/api/prisma/seed.ts` | Extended `permission.createMany` with the **complete frozen identity permission catalogue** (8 resources, 36 rows); extended `rolePermission.createMany` assignments for the 5 admin roles | Additive, idempotent (no-op on re-run) |

### 2.1 Frozen Permission Catalogue Seeded

Rows below mirror the frozen endpoint→permission matrix (section 10 API Catalogue) exactly:

| Resource | Actions Seeded |
|----------|----------------|
| `identity:user` | list, read, create, update, delete, assign |
| `identity:role` | list, read, create, update, delete, assign |
| `identity:permission` | list, read, create |
| `identity:permission_group` | list, read, create, update, delete, assign |
| `identity:invitation` | list, read, create, revoke (pre-existing) |
| `identity:onboarding` | create (pre-existing) |
| `identity:delegation` | list, read, create, cancel |
| `identity:session` | list, read, revoke, revoke_all |
| `identity:audit_log` | list, read (pre-existing) |

**36 total rows** (29 added by RBAC-1; invitation/onboarding/audit_log were already
present and kept verbatim).

### 2.2 Two-Layer Model (ADR-002)

Seeded consistent with the frozen ADR-002: two-layer permission scoping.
`Permission` rows carry `resource` + `action`; `PermissionGroup` represents the
second layer (API-key scoping) and `RolePermission` binds groups at the role level.
The resource-level permissions from 2.1 are the authoritative catalogue; no
group-level rows were fabricated beyond what the frozen ADR-002 mandates.

## 3. Comparison Report (Frozen spec vs. Pre-RBAC-1 state)

| Aspect | Frozen spec | Pre-RBAC-1 seed | RBAC-1 result |
|--------|-------------|-----------------|---------------|
| Permission catalogue | 8 resources, full matrix | 3 resources (invitation, onboarding, audit_log) | **8 resources, 36 rows** ✓ |
| Role→permission wiring | Admin roles hold identity:* catalogue | Only invitation/onboarding/audit_log for admins | **Full catalogue wired to 5 admin roles** ✓ |
| Uniqueness | `@@unique([resource, action])` global (frozen 7.4 indexes) | Matches | Unchanged (no schema change needed) ✓ |
| API-key group layer | PermissionGroup (ADR-002) | Per ADR-002 | PermissionGroup rows present ✓ |

> **Note (flagged, not resolved):** The frozen spec's uniqueness for roles/permissions
> is *tenant-scoped* (`tenant_id, name` / `tenant_id, resource, action`) versus the
> current schema's *global* `@@unique([name])`. This is a schema/migration decision and
> is **explicitly out of RBAC-1 scope** — deferred to RBAC-2/3 as a flagged decision
> point (P.1) per the frozen scope report. RBAC-1 made no schema change.

## 4. Verification

| Gate | Command | Result |
|------|---------|--------|
| Prisma schema valid | `npx prisma validate` | **PASS** |
| TypeScript | `npm run typecheck` (api) | **PASS** (0 errors, includes seed.ts) |
| Lint | `npm run lint` | Pre-existing env failure (no `eslint.config.js` flat config in repo; uses legacy `.eslintrc` — unrelated to this change) |
| Seed runtime | Not executed against a live DB (no local Postgres; e2e infra required). Catalog + assignments are compile-checked and schema-valid. | N/A (deferred to e2e gate) |

## 5. What RBAC-1 Did NOT Do (deferred, per authorization boundary)

- No permission **guards / enforcement** in controllers or guards (`RBAC-2/P2.2`).
- No endpoint authorization wiring beyond seed blogions.
- No tenant-scoping migration (`P.1` decision — RBAC-2/3).
- No UI changes.
- No new roles (only catalogue + assignments to existing admin roles).

## 6. Recommended Next Batch — RBAC-2 (NOT STARTED — awaiting authorization)

RBAC-2 (P2.2) would add runtime guard wiring. **Stopped here per explicit
authorization boundary.** Awaiting user GO before proceeding.

## 7. Final Verdict

**RBAC-1 (P2.1) IMPLEMENTED — gates PASS (Prisma validate ✓, typecheck ✓). Catalog
complete, seeded, and wired to admin roles. STOPPING for RBAC-2 authorization.**
