# RBAC-1_PREPARATION_REPORT — RBAC BATCH 1 (P2.1 PERMISSION MODEL)

**Mode:** READ-ONLY toward the codebase. No source changed, no schema/migration change, no seed run, no tests, no deps, no commits, no PR. This document confirms the exact RBAC-1 scope against the frozen specification before any implementation.

Content derived from (not inferred): frozen `MASTER_SMS_ROADMAP.md` Phase 2 P2.1; frozen `engineering/Identity & Access Engineering.md` (permission convention §2, endpoint→permission catalogue, Role/Permission model catalogue); current `apps/api/prisma/domains/identity.prisma`; current `apps/api/prisma/seed.ts`.

---

## 1. RBAC-1 = P2.1 exactly

Per frozen roadmap lines 382–390, P2.1 (the only task in RBAC-1) is:

> **P2.1 Permission model** — [ ] Extract the authoritative role/permission matrix from the frozen Identity & Access specification; [ ] Compare it against the Prisma schema; [ ] Seed required permissions; [ ] Seed role-permission relationships; [ ] Define platform-level vs institution-level permissions; [ ] Define role-specific restrictions; [ ] Document the resulting matrix. **Do not invent permissions where the specification already defines them.**

Nothing from P2.2 (enforcement/wiring), P2.3 (tenant isolation), P2.4 (object-level authz), P2.5 (security tests) is in RBAC-1 Illustrative. Those are RBAC-2/RBAC-3.

---

## 2. Authoritative permission catalogue (frozen — what RBAC-1 must seed)

Resource prefixes from the frozen Identity & Access spec endpoint→permission matrix (lines 941–1016):

| Resource | Permission prefix | Frozen actions (from spec rows) |
|---|---|---|
| Users | `identity:user:` | list, read, create, update, delete, assign, restore |
| Roles | `identity:role:` | list, read, create, update, delete, assign |
| Permissions | `identity:permission:` | list, read, create, update, delete |
| Permission groups | `identity:permission_group:` | list, read, create, update, delete, assign |
| Invitations | `identity:invitation:` | list, read, create, revoke, resend |
| Delegations | `identity:delegation:` | list, read, create, cancel |
| Sessions | `identity:session:` | list, read, revoke, revoke_all |
| Audit logs | `identity:audit_log:` | list, read |

The exact authoritative row set (resource+action + the role→permission assignments) must be lifted **verbatim from the frozen spec's permission catalogue section**, never invented.

---

## 3. Schema comparison (current vs frozen)

| Current Prisma (identity domain) | Requirement from frozen spec | Status |
|---|---|---|
| `Role` (`@@unique([name])`, `isSystem` flag) | Role model with system flag | Present ✓ |
| `UserRoleAssignment` | user↔role assignment | Present ✓ |
| `Permission` (`@@unique([resource, action])`) | Permission model | Present ✓ — but uniqueness is global (see D1) |
| `RolePermission` (`@@unique([roleId, permissionId])`) | role↔permission join | Present ✓ |
| Permission_group models | `identity:permission_group:*` needs PermissionGroup/PermissionGroupPermission tables | **NOT present — RBAC-1 gap** |
| Delegation models | `identity:delegation:*` needs delegation tables | **NOT present — RBAC-1 gap** |

**RBAC-1 decision D.1 (scope of schema work in RBAC-1):** P2.1 requires "seed required permissions" and "seed role-permission relationships" — operating on the already-present `Permission` + `RolePermission` models. The missing `PermissionGroup`/`Delegation` tables are needed to *enforce* `identity:permission_group:*` and `identity:delegation:*` catalogues (P2.3/P2.4 territory), not to *seed* the permission rows. Recommend RBAC-1 = seed the full frozen permission catalogue + built-in-role→permission rows; defer table creation for PermissionGroup/Delegation to the batch that enforces them.

**RBAC-1 decision D.2 (permission uniqueness):** frozen spec mandates `(tenant_id, resource, action)` scoping; current schema is global `@@unique([resource, action])`. A migration (I-03) aligning to tenant-scoped uniqueness is a Phase-2 schema change — confirm it belongs in RBAC-1 or the tenant-isolation batch (P2.3). I will not silently change uniqueness.

**RBAC-1 decision D.3 (do-not-invent):** the frozen seed must assign each built-in system role exactly the permission set the frozen spec defines; no permission, resource, or assignment may be invented.

---

## 4. Confirmed RBAC-1 deliverable set

1. Extract the exact frozen permission rows (identity:* catalogue) into a machine-readable matrix document.
2. Compare against `identity.prisma` — record gaps (PermissionGroup, Delegation models).
3. Extend the seed to create the full frozen permission catalogue (resource+action rows).
4. Extend the seed to create role-permission relationships for **built-in system roles only**, exactly as the frozen matrix defines.
5. Produce `RBAC_PERMISSION_MATRIX.md` documenting the seeded matrix + platform vs institution-level permissions + role-specific restrictions.
6. Verify: seed compiles (tsc), resolves (typecheck), migrations consistent, existing tests unaffected.

---

## 5. Verification gate (after RBAC-1)

- `tsc --noEmit` + build on affected packages
- prisma validate + `prisma migrate dev` dry-check (no automated run until approved)
- existing unit/e2e regression (identity domain untouched behaviorally; seed additive)
- diff/status inspection to confirm RBAC-1-only scope
- `RBAC-1_IMPLEMENTATION_REPORT.md` written, then STOP awaiting RBAC-2 authorization

---

## 6. Final verdict

**RBAC-1 (P2.1) scope CONFIRMED — no BLOCKER on scope.** Three decision points (D.1–D.3 above) will be resolved inline with the frozen spec as the binding authority (do-not-invent, spec-first). Read-only preparation complete; no code changed.
