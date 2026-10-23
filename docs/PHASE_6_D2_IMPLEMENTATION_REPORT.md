# Phase 6 — D-2 Implementation Report (Option 1)

**Decision implemented:** D-2, Option 1 — **Finance is the sole authoritative owner and writer of
financial configuration and financial policy.** (This is D-2, not D-9. D-9 remains open: gateway
provider set and secret custody.)

**Branch / HEAD:** `phase/2-rbac` @ `aae6309` (unchanged — no commit, amend, rebase, or reset).
**Change size:** 3 files modified, 2 files added, 48 insertions, 10 deletions.
**New migration:** none. **New dependency:** none. **Prisma schema change:** none.

---

## 1. What existed before

Repository inspection (read-only) established the decisive fact: **`institution.financial.*` was
specification-only.** It had zero implementation, zero consumers, and zero stored data.

| Probed | Result |
|---|---|
| Definitions of `institution.financial.*` | Exactly one, and it was specification prose: `Institution Management Engineering.md:992` |
| Read/write paths referencing `financial.*` | **None.** Repo-wide grep returned only `:992` and the Phase 6 gate documents |
| Finance configuration models | **None.** No `FinancialPolicy`, `PaymentGatewayConfig`, `LateFee`, `LedgerAccount`, tax or sequence model in Prisma (all 32 frozen Finance models are unimplemented) |
| Seeded `institution_configurations` / `institution_settings` rows | **None** — no insert anywhere in `seed.ts` |
| Frontend / admin consumers | **None.** The only "financial" strings in `apps/web` are three marketing-copy literals |
| Tests touching the namespace | **None** |
| Keys actually in use | One: `school.logo` (2 segments), used by `institutions.e2e-spec.ts:207` and unit fixtures |

Consequence: there was nothing to retire, migrate, or re-point. **No migration logic was written**,
which matches the instruction not to create migration logic for data that does not exist.

Two write surfaces did exist and both accepted arbitrary keys:

- `InstitutionConfiguration` (`institution-configuration.prisma:17-35`) — `key String`, `value Json`,
  **no category column**, unique on `(institutionId, key)`.
- `InstitutionSetting` (`institution-configuration.prisma:37-56`) — same, plus `kind String` that no
  code read.

Validation was `key: /^[a-z0-9._-]+$/` plus `@IsDefined()` on `value` — so `financial.tax` was
**accepted by the API** before this change. The namespace was documented but unenforced.

---

## 2. What changed

### 2.1 Documentation — `engineering/Institution Management Engineering.md`

1. **§11.1 amended** — the `| Financial | \`financial.*\` | Institution Admin | … |` row is removed.
   The category table now holds 8 categories (Academic, Organizational, Branding, Communication,
   Security, Regional, Module, Automation). A blockquote beneath the table records the removal and
   points to ADR-031, states that `institution_configurations`/`institution_settings` reject the
   namespace, and records that `regional.*` currency **format** is unaffected and that settlement
   currency is **not** decided here (D-3).
2. **ADR-031 added** — Finance is authoritative for financial configuration and financial policy;
   Institution Management must not create an independent financial source of truth; ADR-031 takes
   precedence over ADR-023/ADR-024 for financial concepts; `Institution.currency` is explicitly
   left to D-3.
3. **ADR-023 and ADR-024 preserved and scoped** — both retain their original decision text and gain
   a scope clause excluding financial configuration. They were not rewritten or removed.
4. **§5.2 responsibility row** — "financial structure" removed from the Institution Configuration
   responsibility, with a pointer to ADR-031, because leaving it would have contradicted §11.1.

No other ADRs, principles, or sections were touched. The Finance specification was **not** edited —
it already asserts the ownership this change aligns to.

### 2.2 Code — `financial.*` write-path protection

New file `apps/api/src/modules/institutions/reserved-config-namespaces.ts`:

- `RESERVED_CONFIG_NAMESPACES = ['financial']` — deliberately minimal, mirroring only the one
  category removed from §11.1. It is **not** a general category registry.
- `reservedNamespaceOf(key)` — first dot-segment, trimmed and lower-cased.
- `isReservedConfigKey(key)` / `assertNotReservedConfigKey(key, surface)` — throws
  `ForbiddenException` naming the Finance domain.

Fail-closed properties: the first segment is compared case-insensitively (`FINANCIAL.tax` is
rejected) and surrounding whitespace is trimmed, so a key cannot slip past by casing. `financial`
with no suffix is rejected too. `financials.tax`, `xfinancial.tax` and `regional.financial` are
**not** rejected — the check is on the whole first segment, not a substring.

Applied to **both** key/value surfaces, because `institution_settings` is a second
institution-scoped write path and leaving it unguarded would leave the reservation bypassable:

| Surface | `upsert` | `remove` |
|---|---|---|
| `InstitutionConfigurationsService` | assertion **first**, before `findFirst` | assertion **after** the `NotFoundException` check, before `delete` |
| `InstitutionSettingsService` | assertion **first**, before `findFirst` | assertion **after** the `NotFoundException` check, before `delete` |

In both services every assertion precedes the Prisma write, so a rejected key performs **no** write,
emits **no** event, and records **no** audit row.

The `remove` ordering is deliberate and was directed: a nonexistent reserved key still returns
`NotFoundException` rather than becoming a 403, preserving the existing contract the current tests
depend on. Only an *existing* reserved row is refused deletion.

`findByKey` (`GET :key`) was **intentionally left unblocked** — see §6.

`ForbiddenException` matches existing repo convention (`object-scope.guard.ts:286`).

---

## 3. Authoritative Finance ownership

Finance is the sole authoritative owner and writer of financial configuration and financial policy:
settlement currency, tax rules, invoice numbering, penalty/late-fee rules, gateway enablement, and
gateway credentials. This is recorded in ADR-031 and enforced structurally — Institution Management
has no code path that can write a `financial.*` value.

Institution Management **does not** implement the Option 2 defaults/override ownership model and
**does not** implement the Option 3 category split. Neither was built.

The Finance specification was preserved unchanged; it already claimed this ownership at
`Finance Engineering.md:46` and its exclusion of "Institution configuration" at `:48` is now
consistent with the implemented reality.

---

## 4. What happened to `institution.financial.*`

**Removed from the specification; enforced as rejected in code; nothing to migrate.**

Because inspection proved the namespace was never implemented, had no consumers, and held no data,
this is a "retire" outcome under decision branch 1 — not a conversion to a read-only projection
(branch 2), which would have required a consumer to project for. There were **zero** rows to
backfill, so no data migration, no `NOT VALID` constraint, and no archival step was required.

---

## 5. Gateway-secret handling

**Invariant enforced:** Institution Configuration cannot accept `financial.*`, therefore financial
and gateway secrets cannot be written into Institution Configuration through that namespace.

A regression test writes a realistic secret-shaped value —
`financial.payment_gateways.paystack.secret_key` = `sk_live_xxx` — through
`InstitutionSettingsService.upsert` and asserts `ForbiddenException` with no write performed.

This is a *negative* invariant and is worth stating precisely: it does **not** assert that a secure
credential store exists, because none does. See §6.

---

## 6. Schema-validation changes

**None. Per-category schema validation was deliberately not implemented.**

The frozen Institution spec `:1004` requires "schema validation applied per category", but no
specification defines a JSON schema for any of the 8 categories — the definitions are prose only.
Implementing strict validation would have required inventing 8 schemas. The `{category}.{entity}.{property}`
convention (`:1003`) was **not** reinterpreted as grounds to migrate keys, and `school.logo` was
left untouched with its tests intact.

The practical posture is therefore unchanged: `value` remains an unvalidated JSON blob, as before.
The namespace boundary is enforced; value-shape validation is not. Both facts are recorded in the
helper's doc block so the reservation is not over-read as a validation framework.

---

## 7. Migrations

**None.** No Prisma schema change, no migration SQL, no data movement, no `seed.ts` change. The
change is confined to two service methods, one new helper, one new spec, and specification prose.

---

## 8. Tests and checks

New file `reserved-config-namespaces.spec.ts` — 24 cases covering:

- helper behaviour: 8 reserved key forms rejected (incl. `FINANCIAL.tax`, padded, bare `financial`);
  9 near-miss keys **not** rejected (`financials.tax`, `xfinancial.tax`, `regional.financial`, …),
  proving the check is segment-exact and cannot be trivially evaded;
- `financial.*` cannot be **created** via configuration — no `create`, no `update` call
- `financial.*` cannot be **updated** via configuration — no `update`, no `create` call
- `financial.*` cannot be **removed** via configuration — no `delete` call
- the same three protections for settings, including the secret-shaped key
- `NotFoundException` still returned for an **absent** reserved key on both services
- `school.logo` and `sms.provider` remain writable
- `findByKey` reads remain available

| Check | Command | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | **PASS** (exit 0) |
| Prisma validation | `npx prisma validate` | **PASS** — schema valid |
| Unit tests | `npx jest` | **PASS — 28/28 suites, 282/282 tests** (38s) |
| Institutions unit | `npx jest src/modules/institutions` | **PASS — 5/5 suites, 62/62 tests** |
| Institutions e2e | `jest --config test/jest-e2e.json --runInBand test/institutions.e2e-spec.ts` | **PASS — 16/16 tests** (covers the `school.logo` v1→v2→409→delete lifecycle and both 403 authz cases) |
| Lint | `npm run lint` | **CANNOT RUN — pre-existing.** ESLint 9.39.5 requires a flat `eslint.config.js`; the repo has **no ESLint config anywhere** and the script targets legacy `.eslintrc`. Not caused by this change (no config file exists and none was added). Fixing it means adding a repo-wide flat config, which is outside this decision's scope. |
| Full e2e suite | `npm run test:e2e` | **PRE-EXISTING FLAKY — see below** |

### E2E flakiness: proven pre-existing, not a regression

The full e2e run is unstable under the project's canonical parallel command. To attribute it, I ran
the identical command on a **clean baseline with all D-2 changes reverted** (backed up, reverted,
run, restored):

| Run | Suites failed | Tests failed |
|---|---|---|
| Baseline, **zero** D-2 changes | **5** (`staff`, `people`, `sessions`, `people-applicants`, `identity-b1`) | **17** of 326 |
| With D-2 changes, canonical parallel | 2 (`people`, `identity-b1`) | 9 of 326 |
| With D-2 changes, `--runInBand` | 1 (`people`) | 1 of 326 |
| `people.e2e-spec.ts` in isolation | 0 | 0 of 21 |

The baseline is strictly worse than the changed tree, and `people.e2e-spec.ts` passes 21/21 in
isolation. The failures are ordering/shared-test-database contention among concurrently running
suites (example: an audit-event count assertion expecting 3, receiving 4). The changed tree is not
the cause; if anything it failed less. The suites that failed are People, Identity, Staff and
Sessions — none of which touch Institution Configuration.

Docker Desktop was not running and had to be started to provide Postgres on `localhost:5433`; the
test database was then reset by the suite's own `globalSetup` (`prisma db push --force-reset`).

### Stale-reference sweep

Repo-wide search for `financial.` / `institution.financial` / `Institution.currency` in `apps/`
returns only the D-2 decision comments, the helper, and the new tests. **No independent write path
remains.** `institution.prisma` is not in the diff — `Institution.currency` is untouched (D-3).

---

## 9. Explicitly deferred

| Item | Why not implemented | Where it is recorded |
|---|---|---|
| **Per-category JSON schemas** (8 categories) | No specification defines them; authoring them would be inventing specification content | Helper doc block; frozen spec `:1004` remains an open prerequisite |
| **Strict per-category schema enforcement** | Depends on the above. `value` remains an unvalidated JSON blob | Same |
| **Gateway credential / secret storage mechanism** | `PaymentGatewayConfig` does not exist; grep for `encrypt\|decrypt\|cipher\|SecretService\|kms\|vault` across `apps/api/src` returns **no matches**. The mechanism does not exist to preserve. Building it is Finance/appropriate-phase work, not D-2 | Helper doc block; `Finance Engineering.md:1729`, `:1119-1121` describe the future requirement |
| **`Institution.currency` / D-3** | A separate decision. Not touched | ADR-031 states it explicitly; `institution.prisma` unmodified |
| **Read-path projection of `financial.*`** | No consumer exists, so there is nothing to project for. The read path is deliberately left open so a future Finance→Institution projection can be served | §6 of the helper; reported below as a residual risk |

---

## 10. Remaining blockers and ambiguities

No new contradiction arose while implementing; no second safe-stop was needed.

Open items for the architecture owner, none of which block D-2:

1. **Read path is intentionally unblocked.** `findByKey`/`list` still serve any `financial.*` key. A
   row could only appear via direct DB access, and it would then be readable through the Institution
   API — the very "read-only projection" the decision contemplates, but one nothing creates or
   maintains. If you want that closed too, the follow-up is a decision, not a bug: either block
   reads, or add the Finance-owned projection.
2. **Existing reserved rows would need direct DB access to delete**, since both `remove` paths
   refuse them. No such rows exist, so this is theoretical today.
3. **D-3 remains open** — the authoritative settlement-currency field is still undecided. ADR-031
   deliberately does not touch it.
4. **D-9 remains open** — provider set and secret custody. D-2 resolved only the custody *boundary*.
5. **D-14 remains open** — `Institution Management Engineering.md:215` still records the Finance
   dependency as `Reads/Writes`. That direction covers subscription plan **assignment** (ADR-015),
   which is not financial configuration, so it is not contradicted by ADR-031. Whether any billing
   configuration flows the other way is a D-14 question, not decided here.
6. **`module.*` / `automation.*` collisions** — the brief records these as the same class of conflict
   (`Institution Management Engineering.md:996-997` vs `ModuleLicenseGuard` and BR-09 approval
   chains). Untouched, as instructed; still unenforced and undecided.
7. **Lint cannot run** in this repo at all (pre-existing). If a lint gate is required for Phase 6,
   the ESLint flat-config migration is a separate piece of work.

---

## 11. Status

Finance is the sole authoritative owner of financial configuration. The `financial.*` namespace is
removed from the Institution Management specification and rejected at every Institution
Configuration and Institution Settings write path, with no independent write path remaining. No
migration was required because the namespace was never implemented and held no data.

**D-2 IMPLEMENTED. D-3, D-9, and D-14 REMAIN OPEN. Phase 6 Finance implementation remains blocked
pending those decisions.**
