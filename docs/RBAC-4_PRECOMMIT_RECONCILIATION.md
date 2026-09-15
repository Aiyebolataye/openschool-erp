# RBAC-4 (P2.5, object-level authorization) — Pre-implementation Reconciliation (READ-ONLY)

**Status: RECONCILED & VERDICTED. No schema change required. No code written. No migration. No commit. No PR.**

## 1. What was inspected (all read-only, live + real)

| # | Reconciliation input (authorized) | Result |
|---|---|---|
| 1 | RBAC-4 frozen spec (P2.5) | Authorized fresh in RBAC-4 go-ahead: 9 security requirements (object ownership/scope; cross-institution; cross-org; cross-tenant; trusted-context; missing-invalid membership; deactivated membership/institution/org; Platform Admin freeze; Phase-1 + RBAC-1/2/3 freeze) |
| 2 | Current Role/Permission/RolePermission/UserRoleAssignment schema | Live-verified: `roles`/`permissions`/`role_permissions` **global** (no tenantId, no tenant-scoped unique); `user_roles` tenant-scoped `@@unique([tenantId, userId, roleId])` + FK→`tenants` (Option-2, exactly as frozen RBAC-3) |
| 3 | RBAC-1 + RBAC-2 authorization implementation | Verified intact: `@UseGuards(AuthGuard('jwt'), PermissionGuard)` + `@Permissions('identity:…')` on invitations/onboarding/sessions/audit; server-side permission resolution from trusted session + DB roles (no client-supplied authority) |
| 4 | RBAC-3 Option-2 reconciliation | Confirmed in place: assignment-level tenancy; Role/Permission/RolePermission stay platform-global as **system definitions** |
| 5 | Organization/institution membership model | Verified present + tenant-scoped: `InstitutionMembership` carries `tenantId`, `@@unique([tenantId, institutionId, userId])`, FK→`tenants`; reciprocal `InstitutionMembership[]` on `Tenant` |

## 2. Focal analysis — RolePermissionAssignment (property asked in the authorization)

Under the **frozen Option-2** architecture ratified on RBAC-3:

- `Role` = **platform-global system definition** (unique by `name`, no tenant).
- `Permission` = **platform-global system definition** (unique by `resource, action`, no tenant).
- `RolePermission` = wiring between the two global definitions → therefore **platform-global by design** (unique `[roleId, permissionId]`, no tenant), matching the frozen 7.3 perimeter the user authorized RBAC-3 to hold.

Equivalent role→permission wiring is a statement about *system role definitions*, not about a tenant's objects. Object-level authorization under Option-2 does **not** derive from re-scoping `RolePermission`; it derives from the two dimensions that already carry tenancy in the frozen model:
1. **Assignment tenancy** (`user_roles.tenantId` + `@@unique([tenantId, userId, roleId])`) — who holds which role *within which tenant*; and
2. **Object ownership** (every domain object in the frozen schema carries `tenantId`/institution membership through a tenant-scoped join) — *which tenant/institution actually owns the target object*.

RBAC-4 therefore wires a **code-layer object-scope predicate** (target-object owner context vs. trusted actor context) at the object boundary, and re-uses existing RolePermission as the (global) definition. This is precisely what the user's RBAC-4 authorization frames: "not a general application authorization rewrite."

**Verdict: RBAC-4 does NOT require a new Prisma schema change or migration.** Implementing a schema change here (e.g., tenant-scoping `RolePermission`) would be an Option-1-style re-scope that the user's RBAC-3 authorization explicitly forbade ("Do NOT implement Option 1").

## 3. Required RBAC-4 delta (code-layer only, for the go-ahead)

Implement-only-if-you-authorize-the-implementation-pass:
- An object-ownership authorization predicate resolving: actor tenant context + object's tenant/institution owner context + membership/relationship, evaluated **server-side** off trusted session/JWT state (never client-supplied ids).
- Wire it into the P2.5-covered object-boundary operations.
- The user's 9-item security test basket (correct-object allowed; wrong-institution denied; wrong-org denied; same-role-another-tenant denied; client-supplied context ignored; missing/invalid membership denied; deactivated membership/institution/org denied; Platform Admin unchanged; Phase-1 + RBAC-1/2/3 regression green).

## 4. Honest gate state
- **Reconciliation complete & authoritative — READ-ONLY. ✓**
- **No RBAC-4 code written. No migration. No commit. No PR.**
- The implementation pass (predicate + wiring + 9-test basket + full typecheck/lint/build/test/e2e green) is a substantial code-and-test effort. Per standing rules: rather than write it in a session where it cannot be **fully and honestly verified green**, I am stopping here for a clean go. I will not fake a green verification run I cannot actually complete.

**Standing STOP — awaiting your explicit go for the RBAC-4 implementation & full-verification pass.**
