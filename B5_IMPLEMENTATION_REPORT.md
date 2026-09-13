# B5 Implementation Report — Envelope Filter Conformance + Tenant-Isolated Audit Persistence

**Batch:** B5 (frozen; no commits were made in this batch)
**Status:** IMPLEMENTED + FULLY VERIFIED
**Canonical gate:** build exit 0 · `tsc --noEmit` clean · e2e **6/6 suites, 101/101 tests** · unit 93/93 · lint clean
**Area:** P1.7 security gate remainder · B5-2/3/4 audit-log persistence · envelope conformance (D-03/04/05/07)

---

## 1. What shipped

### 1.1 Envelope filter & error conformance (B5-2 gate remainder)

`apps/api/src/common/filters/all-exceptions.filter.ts`

- **Opaque login failures (envelope D-03/D-04):** a failure to authenticate at `auth/login` produces a unitary, uniform error body — no enumerations, no per-field diffs, no ambiguous actor emails. Identity/`reason` details are server-side only.
- **Correlation header plumbing (D-05):** `X-Correlation-ID` is parsed from a request (or generated), threaded through the failed-login path, echoed on the error envelope, and persisted against the audit row; `X-Correlation-ID` is echoed back as a response header on every errored response (incl. unmatched-route 404s).
- **Raw 4xx mapping + PAYLOAD_TOO_LARGE:** raw 411/413-style body-parser failures are mapped to the canonical envelope (`PAYLOAD_TOO_LARGE` where applicable) rather than leaking the framework text.
- Error shape unchanged on the success path: `{success:true,data}`; error path `{success:false,error:{code,message,correlationId,timestamp}}`; no top-level `statusCode`/`message` leak; correlationId/`timestamp` present.

### 1.2 Tenant-isolated audit-log persistence (B5-2/3/4)

`apps/api/src/modules/audit/` (service + controller + consumer + dto) and `apps/api/src/common/envelopes/` consumers.

- `auth.login.succeeded` / `auth.login.failed` / `auth.login.locked` rows are written **append-only** (DB trigger `audit_logs_append_only` re-applied idempotently in seed) with the **actor's own tenant** as the owner.
- **Tenant isolation guarantee:** an institution-admin in org A cannot read, poll, or leak rows owned by any other tenant (incl. the greenfield seed tenant) through the paginated `audit-logs` envelope. No cross-tenant enumeration of actor emails or tenant IDs; `total` is scoped to the caller's tenant only.
- Audit rows are consumed **fire-and-forget** (bounded poll in the failing-login e2e to defeat the async race); the e2e suite now focuses on the *server-side reason* (e.g. `invalid-password`) rather than a client-supplied reason.
- Failed-login rejection messages are the same regardless of which credential was wrong (uniform `Invalid credentials`), but the server maintains a distinct `reason` (`invalid-password` vs `invalid-email`) usable only by the tenant-scoped owner/admin for security tooling.

### 1.3 Identity-b1 opaque-login region (D-03/D-07 conformance)

`apps/api/test/identity-b1.e2e-spec.ts` — the opaque-login block is restored to a hardened, self-contained form: an array of opaque cases, a uniform 401 body per case, and an explicit guarantee that identical outcomes are observed for unknown email / wrong password / unknown tenant.

---

## 2. Files touched

| File | Change |
|---|---|
| `apps/api/src/common/filters/all-exceptions.filter.ts` | correlation echo, raw-4xx mapping, PAYLOAD_TOO_LARGE, reason passthrough |
| `apps/api/src/modules/audit/audit-log.consumer.ts` | failed-login row write with server-side reason, correlate fire-and-forget |
| `apps/api/src/modules/audit/audit.service.ts` | isolation-scoped list query (tenant-gated, no cross-tenant leak) |
| `apps/api/src/modules/audit/audit.controller.ts` | envelope `total`/`items` shape, authorization to INSTITUTION_ADMIN |
| `apps/api/test/envelope-security.e2e-spec.ts` | 413/flood + X-Correlation-ID echo tests (fixed) |
| `apps/api/test/audit.e2e-spec.ts` | polling fix, tenant-isolation assertions, immutable-trigger check |
| `apps/api/test/identity-b1.e2e-spec.ts` | opaque-login uniformity + tenant-scoped reason assertions |
| `apps/api/prisma/schema.prisma` / `seed.ts` | `AuditLog` model, appended-trigger re-apply (idempotent) |
| `apps/api/test/audit.e2e-spec.ts` — multiple | TS18047/TS2339/null-unification compile fixes |

---

## 3. Verification matrix

| Gate | Command | Result |
|---|---|---|
| Build | `npm run build` | exit 0 |
| Type-check | `tsc --noEmit` | clean |
| Unit tests | `npm test` (jest) | 93/93 passed, 7 suites |
| e2e (auth) | jest e2e | PASS |
| e2e (identity-b1) | jest e2e | PASS (opaque login region 3/3) |
| e2e (envelope-security) | jest e2e | PASS (413/flood + correlation-echo 5/5) |
| e2e (audit) | jest e2e | **10/10 PASS** (tenant isolation + append-only) |
| e2e (login-protection) | jest e2e | PASS |
| e2e (sessions) | jest e2e | PASS |
| **Full e2e** | `npm run test:e2e` | **6 suites, 101 tests all PASS** |

---

## 4. Deliverables & stop

- No commits were created in B5.
- All frozen-batch labels B5-1..B5-7 and D-03/D-04/D-05/D-07 are honored.
- **Per instruction: STOP here and await approval.** The next move (commit, PR against `main`, and/or cross-app web verification) is deferred pending explicit user authorization.

— B5 implementation complete.
