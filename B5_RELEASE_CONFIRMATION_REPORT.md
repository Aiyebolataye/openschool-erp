# B5 — Phase-1 (B1–B5) Cross-App Release Confirmation

**Status: RELEASED — frozen surface committed, PR open, cross-app web-justification gates green.**
**Scope: B1–B5 frozen Phase-1 surface ONLY. No B6, no Phase-2, no UI changes, no speculative/refactor code.**

---

## 1. Authoritative release identities (current, post-gate)

| Item | Value |
|---|---|
| Branch | `phase/0-foundation` |
| Release commit (short) | `878c300` |
| Release commit (full) | `878c3000466bf09d11df968e3ab734b08bd1ba3e` |
| PR | **#1 — OPEN — base `main` ← head `phase/0-foundation` — mergeState `CLEAN`** |
| PR URL | https://github.com/Aiyebolataye/openschool-erp/pull/1 |
| Envelope rulebook | flat D-03/D-07 envelope; `error.{code,message,correlationId,timestamp,details?}`; error+response `X-Correlation-ID` echo |

**Release commit contains only the frozen B1–B5 implementation + Phase-1 documentation** (84 staged files:
identity/auth/audit modules, envelope-security e2e, audit e2e, envelope filter/interceptor, prisma migrations + seed,
docs, `.env.example`/`.env.test.example` templates — **never** the real `.env`, secrets, builds, or `node_modules`).
A dedicated scan of the released tree for B6/Phase-2 markers returned **zero** matches.

---

## 2. Cross-app (web-origin → API) verification

Executed per the frozen B5 plan §F against the released API surface from the **locked web dev origin
(`http://localhost:3000` = CORS-allow-listed; dev defaults also include `:3001`/`:8080`)**:

| Check | Result |
|---|---|
| CORS origin allow-list / disallowed-origin blocking | **PASS** (e2e: denied origin has no `Access-Control-Allow-Origin`) |
| Browser preflight (OPTIONS) reflecting method + headers incl. `X-Correlation-ID` | **PASS** |
| Envelope on expired/opaque auth 401 → flat `error.{code,message,correlationId,timestamp}` | **PASS** (opaque; no stack/lifecycle leak) |
| `X-Correlation-ID` inbound → correlationId echo (`error.correlationId` **and** response header) | **PASS** (echo verified `corr-413-test`; envelope-security suite) |
| Authenticated, **tenant-scoped** audit-log list + read-by-id | **PASS** (e2e: tenant isolation — cross-tenant read returns 404/empty; no leak) |
| Envelope error (413 payload-limit → `PAYLOAD_TOO_LARGE`) | **PASS** |
| Permissions gate `identity:audit_log:list/read` (read-only; **no** create/update/delete surface) | **PASS** |
| Correct canonical gates post-commit/PR | build ✓ tsc ✓ unit **93/93** e2e **6 suites / 101/101** ✓ |

**No UI code was modified.** The web app has no API wiring in Phase-1 by design (web-API integration is
frozen Phase-2); the enforcement point B5 owns — the API HTTP surface consumed by a browser at the web
origin — is proven by the envelope-security + audit e2e suites listed above.

---

## 3. Post-commit regression (full, on the released commit)

| Gate | Result |
|---|---|
| `nest build` (tsc compile) | exit 0 |
| typecheck | clean |
| Unit (apps/api) | 93/93 |
| e2e (envelope-security, audit, auth, identity-b1, login-protection, sessions) | **6 suites · 101/101 PASS** |

---

## 4. Issues found & notes

- **None blocking.** Single hygiene deprecation surfaced during the run:
  Node `url.parse()` deprecation (`DEP0169`, internal Nest dependency) — logged as tech debt, not B5-owned,
  no remediation required for this gate.
- **Verification done against real released server surface** via the project’s canonical Jest e2e harness on the
  committed tree (the identical `configureApp` path used by `main.ts`), not an ad-hoc smoke script.

---

## 5. Stop condition honored

With B5 released and verified, **Phase 1 is complete and frozen**. Work stops here — **no B6, no Phase 2**
was started, and any further phase requires explicit authorization.
