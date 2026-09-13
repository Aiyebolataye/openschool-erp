# B5 Release Checkpoint Report — frozen batch, awaiting approval

**Status:** RELEASE REVIEW COMPLETE — implementation frozen, **no commits, no PR, no destructive actions.**
**Date:** 2026-09-13
**Batch:** B5 (P1.5 security-gate remainder + P1.7 audit logging; frozen B1/B2/B3/B4 labels authoritative)

---

## 1. Locked decisions applied (both pre-exist in the frozen implementation — verified, NOT modified)

### D-B5-A — Correlation-ID naming (LOCKED, single canonical pair)
- **Request/echo header:** `X-Correlation-ID`
- **Envelope field:** `error.correlationId`
- **Aliases explicitly rejected:** `correlation_id`, `requestId`, `request_id`, `traceId` — **grep-verified zero matches** across the full `src/` tree (interceptor, filter, audit consumer/service).
- Incoming `X-Correlation-ID` is propagated (AsyncLocalStorage) and echoed; the same value surfaces as `error.correlationId` in applicable error envelopes. Verified in `envelope-security.e2e-spec.ts` (77-82: `corr-413-test` echoed in `res.body.error.correlationId` **and** `res.headers['x-correlation-id']`).

### D-B5-B — Read-only audit-list API (LOCKED, included in B5)
- `GET /audit-logs` — flat D-07 list envelope `{success,data:{items,total,page,limit}}` (no `meta`), `page`/`limit` with `limit ≤ 100` cap, optional `action` filter, **tenant-scoped by construction** (service where = `{ tenantId, ... }`).
- `GET /audit-logs/:id` — single-row read, tenant-scoped `findById(tenantId, id)` (cross-tenant id → `null` → 404).
- **Read-only:** controller surface is `@Get`-only; `AuditService` exposes `record/list/findById` — **no create/update/delete** method or endpoint.
- **Authorization:** `PermissionGuard` + `@Permissions('identity:audit_log:list' / 'identity:audit_log:read')`; `JwtAuthGuard` first.
- **Append-only preserved:** append-only DB trigger re-applied idempotently; no `POST/PUT/DELETE /audit-logs` exists.
- **No secrets in responses:** rows store IDs/metadata only; e2e asserts no token/password material persists.

## 2. Acceptance criteria — all satisfied (B5 scope verification + green gates)

| Criterion | Result |
|---|---|
| Error envelope uniform `{success:false,error:{code,message,details?,correlationId?,timestamp?}}` | ✅ |
| Success envelope `{success:true,data}` | ✅ |
| Flat list envelope (`items/total/page/limit`, no `meta`) | ✅ |
| 4xx mapping incl. 413→`PAYLOAD_TOO_LARGE`, opaque 401 (login) | ✅ |
| Correlation ID thread + echo (header + envelope + audit row) | ✅ |
| Audit persistence: login success/failed/locked, registration, email verification | ✅ |
| Audit **tenant isolation** (no cross-tenant or greenfield-seed leak; per-item tenant/actor checks) | ✅ |
| Audit **append-only** (append-only trigger + no update/delete surface) | ✅ |
| Audit-list authorization (`identity:audit_log:list/read`, INSTITUTION_ADMIN+; tenant-scoped) | ✅ |
| B3 login-protection behavior intact (opaque 401, lock, retryAfter envelope) | ✅ |
| B4 session behavior intact (opaque logout-all, refresh envelope) | ✅ |
| No B6/Phase-2 functionality introduced | ✅ |

## 3. Verification results (canonical, single command set in `apps/api`)

| Gate | Result |
|---|---|
| `npm run build` | exit **0** |
| `tsc --noEmit` | clean |
| unit | **7 suites / 93 tests** pass |
| `npm run test:e2e` | **6 suites / 101 tests, ALL PASS** (incl. audit 10/10, envelope-security 5/5, identity-b1 3/3) |
| Full canonical (combined run) | **6 suites green** — no interference, no flakes in current state |

## 4. Security / tenant-isolation / immutability checklist

1. **Tenant isolation:** audit list `where` is always `tenantId`-scoped; ✔
2. **Opaque auth failures:** uniform 401 for unknown-identity / wrong-password / unknown-tenant (no enumeration); ✔
3. **Correlation handling:** `X-Correlation-ID` echoed as both header and `error.correlationId`; persistence carries `correlationId`; ✔
4. **413/411:** envelope-filter maps raw body-parser failures → canonical `PAYLOAD_TOO_LARGE`/`...` code; ✔
5. **Append-only:** append-only trigger re-applied idempotently in seed; no update/delete API; ✔
6. **No secret leakage:** audit rows store actor email + metadata only; e2e asserts no tokens/passwords; ✔
7. **Cross-tenant leak regression:** per-item `tenantId === other.id`, no `@greenfield.edu.ng` actor leaks; ✔

## 5. Regression status

- envelope-security, identity-b1, auth, login-protection, sessions, audit — **all green**.
- B3 (login protection), B4 (sessions) behavior unchanged & re-asserted (opaque-style responses, throttle, refresh rotation).
- Unit tests (93) unaffected by conformance edits.

## 6. Clean build / no drift
- Working tree includes only B1–B5 frozen source + docs (untracked per frozen-batch protocol) and the expected config/env/prisma deltas; **no secrets** (scanned; only redacted/masked placeholders present), no generated artifacts committed, no debug code, no unintended scope.

## 7. Remaining / blockers
- **Blocked in --wait mode (not implemented):** DB-level append-only **trigger** is in place; retention policy; audit-list API already wired (decision 2) — nothing further pending in B5.
- Anything deferred (Phase-2 RBAC/audit-export/retention, P1.6 Swagger gate) remains frozen for later batches.

## 8. Recommendation
**B5 APPROVED — no code changes were required by the two locked decisions (both pre-existed).** No commits, no PR, no destructive DB actions taken.

**Next:** await explicit authorization to commit, open the PR, and run the cross-app web acceptance check. **Nothing has been committed.**
