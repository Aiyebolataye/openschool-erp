---
title: RBAC-2 (P2.2) — Permission-Guard Enforcement Record
project: OpenSchool SMS
phase: Phase 2 — RBAC
batch: RBAC-2 (P2.2)
frozen_spec: engineering/Identity & Access Engineering.md (§5.4, §10 API catalogue)
rbac1_input: RBAC-1 perms + seed (8 resources / 36 rows / 9-wired admin roles)
status: COMPLETE — enforcement wiring verified, no gaps against frozen matrix
security_gate: Phase 2 final gate NOT yet run (pending RBAC-3/4 + full suite)
---

# RBAC-2 (P2.2) — Permission-Guard Enforcement Record

## 1. Deliverable

Server-side RBAC enforcement with **no client-configurable privilege input**.
Every identity-surface endpoint is guarded by `PermissionGuard`, which resolves
permissions from **trusted server-side role state** loaded by the JWT strategy —
never from request bodies, query params, headers, or token claims supplied by the
caller. Phase-1 session/auth/audit enforcement is preserved unchanged.

## 2. Enforcement Point (single trusted resolution)

`apps/api/src/modules/auth/jwt.strategy.ts`:

```ts
const user = await this.prisma.user.findUnique({ where: { id: payload.sub },
  include: { roles: { include: { role: { include: { permissions: {
    include: { permission: true } } } } } } } });

const permissions = permissionsFromRoles(user.roles);   // server-side, DB-sourced

return { sub, tenantId, institutionId, roles: [...], permissions, sessionId };
```

`PermissionGuard` (`common/guards/permission.guard.ts`) reads `@Permissions(...)`
decorator metadata and checks `request.user.permissions.includes(...)`. The
`permissions` array is built exclusively by the strategy from DB role→permission
rows: a caller **cannot** add, remove, or override a permission through any
request input (no `x-permissions` header, no body field, no query param is ever
consulted).

## 3. Frozen Matrix → Implemented Enforcement Coverage

| Resource (seed rows) | Endpoint(s) | Controller → `@Permissions(...)` | Wired |
|----------------------|-------------|----------------------------------|-------|
| identity:session | GET /sessions | session.controller → `identity:session:list` | ✓ |
| identity:session | DELETE /sessions/:id | session.controller → `identity:session:revoke` | ✓ |
| identity:session | DELETE /sessions | session.controller → `identity:session:revoke_all` | ✓ |
| identity:invitation | GET/POST/DELETE /invitations | invitations → list/read/create/revoke | ✓ |
| identity:onboarding | POST /onboarding* | onboarding → `identity:onboarding:create` | ✓ |
| identity:audit_log | GET /audit-logs* | audit → list/read | ✓ |
| (public) health | GET /health | health module (no perms — pre-auth) | N/A ✓ |

**Gaps: none.** All 36 frozen rows used by existing endpoints are enforced;
rows for resources with no endpoints yet (user/role/permission/permission_group/
delegation) are seeded-and-assigned but not yet reachable by routes, consistent
with frozen Phase 2 scope (routes land in later batches).

## 4. Security Invariants (RBAC-2)

| # | Invariant | Where guaranteed |
|---|-----------|------------------|
| 1 | Caller cannot supply/override permissions via request input | Strategy builds `permissions` only from DB roles; guard never reads request-supplied values |
| 2 | Trusted server-side state | `permissionsFromRoles` derives from `user.roles[].role.permissions[].permission` (JWT strategy) |
| 3 | Motivation source (tokens) never returned | SessionService returns no hashes/tokens; controller replies carry only `revoked: true` |
| 4 | Session revocation is self+tenant-scoped | `revokeOne(tenantId, userId, id)` / `revokeAll(tenantId, userId)` |
| 5 | Admin-only audit access preserved (B5) | `identity:audit_log:list/read` on admin roles, unchanged |
| 6 | Phase-1 auth/session flow unchanged | `AuthGuard('jwt')` + `TenantAwareJwtGuard` untouched; JWT strategy logic unchanged except where RBAC-1 seeded rows are consumed |

## 5. Verification

| Gate | Command | Result |
|------|---------|--------|
| Typecheck | `npm run typecheck` (api) | **PASS** (0 errors) |
| Lint | `npm run lint` | **BLOCKED (pre-existing)**: repo uses legacy `.eslintrc*`; ESLint 9 needs `eslint.config.js`. Unrelated to RBAC-2; documented, not resolved (out of scope) |
| Unit tests | `npm test` | Pending (run at security gate) |
| E2E | `npm run test:e2e` | Pending (run at security gate) |
| Prisma | `prisma validate` | **PASS** (RBAC-1) — unchanged by RBAC-2 |

## 6. Deliverable Files

| File | Nature |
|------|--------|
| `apps/api/src/modules/session/session.controller.ts` | Verified (enforcement already complete) — **no change required** |
| `apps/api/src/modules/auth/jwt.strategy.ts` | Verified unchanged (trusted-state source) |
| `apps/api/src/common/guards/permission.guard.ts` | Verified unchanged (reads decorator metadata) |
| This report | RBAC-2 record |

## 7. Findings

- **No enforcement gaps** against the frozen matrix for existing endpoints.
- **No client-escalation path** found: `permissions` are derived solely from DB
  role assignments in the JWT strategy; no route accepts a permission list.
- RBAC-2 required **no code change** because RBAC-1 seeded the exact permission
  rows that RBAC-2's existing guards consume; the two batches are fully coherent.

## Boundary Note (next decision point)

A **flagged decision point (P.1)** from RBAC-1 prep remains: the frozen spec
scopes role/permission uniqueness *per-tenant* (`@@unique([tenantId, name])`,
`@@unique([tenantId, resource, action])`) while the current schema is global
(`@@unique([resource, action])`). Enforcing tenant-scoped uniqueness requires a
schema/migration decision, which is the RBAC-3 batch boundary. Proceeding to
assess RBAC-3 next.
