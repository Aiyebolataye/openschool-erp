# PHASE 6 DECISION BRIEF — FINANCE & PAYSTACK

> ## ✅ RESOLVED — 2026-09-29. The owner has answered this register.
>
> The decisions in this brief were answered by the architecture owner on **2026-09-29**. The
> authoritative record of the answers is **`docs/FINANCE_OWNER_DECISIONS_RECORD.md`**, and the
> decisions have been reconciled into the frozen specification
> **`engineering/Finance Engineering.md` (revision 1.8.0)**.
>
> | Decision | State | Where recorded |
> |----------|-------|----------------|
> | **D-1** | **Deferred — undecided.** Leaf with no dependents | — |
> | **D-2** | **RESOLVED** — Finance owns all six concepts; `financial.*` is a read-only projection | Finance spec §1, §6.5 |
> | **D-3** | **RESOLVED** — `FinancialPolicy` currency row is authoritative; `Institution.currency` display-only, not independently writable | Finance spec §6.5.3, ADR-036 note |
> | **D-4** | **RESOLVED** — runtime naming adopted as-is; existing `emittedAt` envelope kept; Academics trigger names; `PersonMerged` handled | Finance spec §9.6 |
> | **D-5** | **RESOLVED: staff-only.** Off the critical path | Finance spec §5.7 (BR-34) |
> | **D-6** | **RESOLVED** — Finance is sole owner; remediation authorised; `DENIED` → `REJECTED` | Finance spec §5.6 |
> | **D-7** | **RESOLVED** — no new role; BURSAR gets fee catalogue; P-08 threshold; self-approval blocked; guard ownership assigned | Finance spec §2, §9.5, ADR-037 clarification |
> | **D-8** | **RESOLVED** — half-up; canonical helper; quantise intermediates; explicit residue reconciliation | Finance spec §6.5.1 |
> | **D-12** | **RESOLVED** — archive all five legacy tables, create frozen tables fresh | Finance spec §7.5 |
> | *Unnumbered* | **Mechanism RESOLVED; numeric defaults OPEN** — three `FinancialPolicy` limits, reject on breach | Finance spec §6.5.2 |
>
> **One bounded item remains open:** the aggregate-limit **numeric defaults**. No authoritative
> source supplies them and none has been invented. See Finance spec §6.5.2.
>
> **Register discipline.** This is the **Finance D-register**. A separate **Register-B** overlaps
> these identifiers; the two are **not merged** and no precedence is asserted. No decision in
> `docs/FINANCE_OWNER_DECISIONS_RECORD.md` or in the Finance register requires a Register-B
> resolution.
>
> **Nothing below has been rewritten.** The original option analysis, evidence, and recommended
> resolutions are preserved exactly as written, as the point-in-time decision-preparation record.
> Only this banner and the STATUS section at the end have been updated. **Where an option
> recommended below differs from the owner's answer, the owner's answer governs.**

**Audience:** human architecture owner.
**Purpose:** convert `docs/PHASE_6_SCOPE_VERIFICATION_REPORT.md` into decisions. This is **not** an
implementation plan and contains **no** implementation.
**Gate state at time of writing:** HEAD `aae6309`, branch `phase/2-rbac`, working tree clean apart
from the two Phase 6 gate documents.

**How to read the labels.** Every claim is tagged:

- **[SOURCE]** — quoted or directly read from a frozen specification or from repository code.
- **[INFERENCE]** — architectural reasoning by this brief, not stated in any source.

Options are drawn only from source evidence. Where a source is silent, that silence is reported as
silence rather than filled in.

**Three corrections to the scope report** (established by direct reading during this pass):

1. Permission count is **64 distinct permissions across 20 resources**, not 63. The count in the
   scope report omitted underscore-bearing resources (`finance:write_off:*`,
   `finance:billing:summer_school`). Source: `engineering/Finance Engineering.md:1435-1618`.
2. The Phase 5 migration contains **five** `NOT VALID` constraints, not four —
   `invoices_termId_fkey` (line 1177) was missed. Source:
   `apps/api/prisma/migrations/20260924110000_p5_2_academic_management/migration.sql:1156,1163,1167,1173,1177`.
3. The frozen Finance specification contains **zero** occurrences of the word "payer". This
   materially weakens the scope report's framing of D-5. Verified by exhaustive search;
   see D-5.

---

# PART I — BLOCKING DECISIONS (D-1 … D-8)

---

## D-1 — Expenses

**Class: BLOCKING — conflicting frozen sources**

### A. Decision title

Is `expenses` a Phase 6 Finance capability, and if so is it an aggregate, an account type, or deferred?

### B. What the frozen sources say

**[SOURCE]** Roadmap P6.1 requires expenses — `MASTER_SMS_ROADMAP.md:686`:

> `- [ ] expenses`

**[SOURCE]** The frozen Finance In-Scope list (`Finance Engineering.md:46`) enumerates 18
capability groups and **does not include expenses**: fee structure management, bill and invoice
generation, invoice lifecycle, outstanding balances, payment processing, payment allocation,
partial and overpayments, payment reconciliation, gateway abstraction, discounts, scholarships and
financial aid, refunds, financial adjustments, Summer School billing integration, installment
plans, financial policies, double-entry accounting foundation, financial reports.

**[SOURCE]** In the schema chapter there is **no `expenses` table** among the 30 tables
(`Finance Engineering.md:752-1144`).

**[SOURCE]** "Expense" appears in the frozen spec only as a **chart-of-accounts account type**
(`Finance Engineering.md:1742-1748`):

> `| EXPENSE | Scholarship Expense, Refund Expense, Write-Off Expense | Debit |`

**[SOURCE]** The same EXPENSE account type is used as the **debit side** of three journal entry
templates (`Finance Engineering.md:1764-1768`): refund processed, scholarship awarded, write-off.

**[SOURCE]** Every EXPENSE debit in those templates originates from an event Finance already owns
(refund, scholarship award, write-off) — there is no template for a standalone operating expense
with no originating Finance document.

### C. What the current repository says

**[SOURCE]** No expense model, table, migration, or code exists. `apps/api/prisma/domains/finance.prisma`
(117 lines) contains exactly five models: `FeeStructure`, `Invoice`, `Payment`, `Scholarship`, `Refund`.
Repo-wide search finds no expense aggregate.

### D. Exact conflict

The roadmap mandates a Phase 6 deliverable ("expenses") that the frozen Finance specification does
not define as an entity, endpoint, permission, module, repository, or service. `Finance Engineering.md`
§9.1 (module structure), §9.2 (repositories), §9.3 (services), §9.4 (controllers), and §10.3
(endpoint catalogue) contain no expense component — the omission is total and consistent, not an
oversight in one table.

The word is not absent from the document; it is present with a *different meaning*. EXPENSE is a
ledger account classification used to post the expense side of refunds, scholarships, and
write-offs. Building an Expense aggregate to satisfy the roadmap checkbox would therefore add a
procurement/payables capability that the frozen chart of accounts, journal templates, module
decomposition, and endpoint catalogue were all authored without — it is not a missing table in an
otherwise-complete design.

### E. Concrete options

**Option 1 — Defer expenses; amend the roadmap P6.1 line.**
**[SOURCE]-supported.** Remove "expenses" from P6.1. Phase 6 delivers the 18 groups the frozen spec
defines. EXPENSE remains an account type, which is what the frozen schema actually models.

**Option 2 — Represent expenses within existing structures; no new aggregate.**
**[SOURCE]-supported.** Operating expenses, if ever needed, are posted as balanced journal entries
against EXPENSE-type ledger accounts via the existing `AccountingService` /
`finance:journal:create` path (`Finance Engineering.md:1285, 1582-1584`). Requires no Expense model.
Note this is a source-supported *mechanism*, not a source-stated decision.

**Option 3 — Amend the frozen Finance spec to add a first-class Expense aggregate.**
Requires new tables, endpoints, permissions, module/repository/service entries, and journal
templates. **No source supports what such an aggregate would contain** — the frozen spec gives no
Expense columns, lifecycle, approval rules, or vendor/payables model.

### F. Consequences

| | Schema | Migration | Security | Cross-domain | Implementation | Later phase |
|---|---|---|---|---|---|---|
| **1 Defer** | none | none | none | none | smallest Phase 6 scope | Roadmap must be edited; a later phase can reopen |
| **2 Journal-only** | none beyond the 30 tables | none | reuse `finance:journal:create` | Operations may later post expenses | no Expense module | Least reversible if stakeholders assumed a real Expense UI |
| **3 New aggregate** | new tables | new migration | new permissions + role grants | Operations/Procurement ownership undefined | largest scope | Locks in a payables model the sources never described |

### G. Recommended resolution

**[INFERENCE]** Option 1 is best supported by the frozen architecture. The evidence is one-directional:
the roadmap mentions expenses once, in a checklist line; the frozen specification omits it from
six independent structural sections and uses the term in a different, narrower sense. Option 2 is
the correct fallback if the roadmap line is retained rather than edited.

**Tradeoff not concealed:** deferring expenses means a stakeholder-visible roadmap item is not
delivered in the phase that promises it. That is a scoping loss, not an architectural gain, and only
the owner can weigh it against the cost of inventing an Expense model no source describes.

### H. Exact decision required

Choose one: **(1)** amend the roadmap to drop "expenses" from P6.1; **(2)** retain the line and
implement expenses purely as balanced journal entries against EXPENSE ledger accounts; or **(3)**
amend the frozen Finance specification to define a first-class Expense aggregate, in which case
define its columns, lifecycle, approval authority, and owning domain.

---

## D-2 — Financial configuration ownership

**Class: BLOCKING — ambiguous financial ownership**

### A. Decision title

Who owns institution financial configuration: Institution (`financial.*`) or Finance
(`FinancialPolicy` / `PaymentGatewayConfig`)?

### B. What the frozen sources say

**[SOURCE]** Finance excludes institution configuration — `Finance Engineering.md:48`:

> `**Out of Scope:** ... Institution configuration, Licensing, Subscription management (Institution Management) ...`

**[SOURCE]** Yet the same document requires Finance to own configurable financial policies —
`Finance Engineering.md:46`: "...configurable financial policies (currency, tax, numbering,
penalties)" and "payment gateway abstraction (Paystack, Flutterwave, Stripe)". The module
decomposition assigns `FinancialPolicyModule` and `FinancialPolicyService`
(`:1248`, `:1286`) and `PaymentGatewayConfig` is a Finance entity with its own lifecycle
(`:318`: `Active → Inactive`).

**[SOURCE]** Institution claims the same configuration — `Institution Management Engineering.md:992`:

> `| Financial | financial.* | Institution Admin | Fee categories, fee structures, discounts, scholarships, payment plans, payment gateways, tax settings |`

**[SOURCE]** Institution also claims two further namespaces that collide with Finance needs:
`module.*` — "Enabled modules, module-specific settings, feature toggles" (`:996`) — which is the
licensing input for Finance's `ModuleLicenseGuard` (`Finance Engineering.md:1317`); and
`automation.*` — "Workflow rules, **approval chains**, notification triggers, scheduled tasks"
(`:997`) — which collides with BR-09 threshold-based refund approval (`:332`).

**[SOURCE]** Institution supplies the mechanisms that would make split ownership safe —
`Institution Management Engineering.md:999-1007`:

> `- Configuration values are JSON; schema validation applied per category`
> `- Platform defaults are applied during provisioning; Institutions may override`
> `- Configuration keys follow {category}.{entity}.{property} namespace pattern`

### C. What the current repository says

**[SOURCE]** The substrate is generic and untyped. `institution-configuration.prisma:17-35`
(`InstitutionConfiguration`) and `:37-56` (`InstitutionSetting`) are key/value tables:
`key String`, `value Json`, `kind String @default("STRING")`, unique on
`@@unique([institutionId, key])`. There is no category, no schema, no default/override tier.

**[SOURCE]** The service is generic CRUD with no category awareness and no validation —
`apps/api/src/modules/institutions/institution-configurations.service.ts:43-140`
(`findMany`/`findFirst`/`create`/`update`/`delete`, audit rows at `:117`, `:156`) and
`institution-settings.service.ts:82-201`. Neither service references any
`financial.*`, `module.*`, or `automation.*` namespace.

**[SOURCE]** Repo-wide search for `'financial.'`, `'regional.'`, `'module.'`, `'automation.'` string
literals in `apps/api/src` returns **no matches**. The `financial.*` namespace is declared in the
frozen Institution spec and entirely unimplemented.

### D. Exact conflict

Two frozen specifications assert ownership of the same configuration surface, and the frozen Finance
specification is internally inconsistent: it excludes "Institution configuration" while requiring
Finance to own currency, tax, numbering, penalties, and gateway configuration — which are
institution configuration by the Institution spec's own definition.

The conflict is not only documentary. Even if ownership were cleanly split, the current substrate
cannot enforce the split: `value Json` with no per-category schema means a `financial.*` key and a
`FinancialPolicy` row can both exist with divergent values, and nothing detects the divergence.
Institution spec §11.2 requires per-category schema validation and a platform-default/override
tier; neither is implemented. **[INFERENCE]** The ownership question and the validation question are
separate decisions, and the second is a prerequisite for the first being enforceable.

The gateway case is sharper than the others. `PaymentGatewayConfig` stores
`public_key`/`secret_key`/`webhook_secret` as "encrypted" (`Finance Engineering.md:1119-1121`) and
Finance spec §12.4 requires keys "encrypted at rest" and "Secret keys are never exposed in API
responses" (`:1729, :1732`). Institution `financial.*` is owned by Institution Admin
(`Institution Management Engineering.md:992`) and is ordinary readable configuration
(`institution-settings.service.ts:90-157`). **[INFERENCE]** Therefore `financial.payment_gateways.*`
cannot be the storage location for gateway secrets under any ownership split — non-secret display
configuration and encrypted credentials must be separated regardless of who "owns" configuration.

### E. Concrete options

**Option 1 — Finance owns all financial configuration; Institution's `financial.*` is retired or becomes read-only projection.**
**[SOURCE]-supported.** Finance spec:46 already scopes Finance to financial policy, tax,
numbering, penalties, gateways. Honours `Finance owns all invoice calculation` (`:349`, BR-026).
Institution spec:987-997 must be amended to drop the Financial category.

**Option 2 — Institution owns `financial.*` values; Finance owns typed policy + gateway credentials.**
**[SOURCE]-supported** by Institution spec:992 + :999-1007 (defaults/override tier exists in the
design) + Finance spec:46. Requires implementing per-category schema validation and the
defaults/override tier, neither of which exists.

**Option 3 — Split by category: Institution owns non-secret display/tax/gateway *enablement*; Finance owns settlement currency, numbering, penalties, and encrypted credentials.**
**[SOURCE]-consistent** with the `regional.*` ("currency **format**") vs financial distinction at
`Institution Management Engineering.md:995`. Requires an explicit rule for which of the 18 financial
concepts in Finance spec:46 sits on which side.

### F. Consequences

| | Schema | Migration | Security | Cross-domain | Implementation | Later phase |
|---|---|---|---|---|---|---|
| **1 Finance owns** | 30 Finance tables only | none extra | Finance credentials stay encrypted and Finance-accessed | Institution spec must be amended; Institution Admin loses config UI for finance | simpler single source | Institution keeps `module.*`/`automation.*`; no finance overlap |
| **2 Institution owns values** | Finance tables + typed JSON schema per category | adds validation + default tiers | **risk:** gateway secrets must be excluded from the JSON path or they become Institution-readable | two write paths for the same concept | needs schema-validation infrastructure that does not exist | dual ownership persists indefinitely |
| **3 Split by category** | both, plus a mapping table or rule set | none | separation achievable if secrets are explicitly Finance-only | requires a written category→owner map; ambiguity risk is highest | largest governance surface | hardest to change later; categories will drift |

### G. Recommended resolution

**[INFERENCE]** Option 3 is architecturally strongest but Option 1 is the best supported by the
*frozen Finance* document, which is the more specific of the two. If the owner accepts amending
`Institution Management Engineering.md` §11.1, Option 1 yields exactly one writer per concept and
eliminates the divergence risk outright. Option 2 should be rejected in its current form: it
reintroduces two write paths for financial policy, which is the condition BR-26-style
single-ownership rules exist to prevent.

**Independent of the ownership choice:** gateway secrets cannot live in `financial.*` JSON, and
per-category schema validation is required by Institution spec §11.2 regardless. Both are decidable
now and are prerequisites for D-9.

### H. Exact decision required

Name the single owning domain for each of: settlement currency, tax rules, invoice numbering,
late-fee/penalty rules, gateway enablement, and gateway credentials. Then state whether
`institution_configurations` retains a `financial.*` namespace, and if so whether it is
authoritative, a read-only projection of Finance tables, or removed.

---

## D-3 — Canonical currency

**Class: BLOCKING — second financial source of truth**

### A. Decision title

Which single field is the authoritative institution settlement currency?

### B. What the frozen sources say

**[SOURCE]** BR-015 (`Finance Engineering.md:338`):

> `| BR-015 | Currency is institution-scoped and fixed after first invoice | Global |`

**[SOURCE]** Finance owns configurable financial policy including currency (`:46`) and its
`FinancialPolicy` table is versioned and institution-scoped — UNIQUE
`(tenant_id, institution_id, policy_type, policy_key, version)` (`:1138`).

**[SOURCE]** Institution owns *currency format* under `regional.*` — "Time zone, locale, language,
date format, **currency format**" (`Institution Management Engineering.md:995`). This is
formatting, distinct from settlement currency.

**[SOURCE]** Multi-currency support is **deferred to Future** — `Finance Engineering.md:1789`:

> `| Medium | Multi-currency support | Future |`

**[SOURCE]** Gateway providers advertise wider currency support than the domain uses —
`Finance Engineering.md:1712-1714`: Paystack `NGN, USD, GHS, ZAR`; Flutterwave
`NGN, USD, GHS, KES, UGX`; Stripe `Multi-currency` (Future).

### C. What the current repository says

**[SOURCE]** Three live locations:

1. `apps/api/prisma/domains/institution.prisma:72` — `currency String @default("NGN")` on
   `Institution`. Already migrated, already populated.
2. `apps/api/prisma/domains/finance.prisma:11` — `FeeStructure.currency String @default("NGN")`
   (hard-coded default).
3. `apps/api/prisma/domains/finance.prisma:64` — `Payment.currency String @default("NGN")`
   (hard-coded default).
4. A fourth, unimplemented home: `institution_configurations` `financial.*` JSON (D-2).

**[SOURCE]** Both legacy Finance tables default to `"NGN"` at the schema level, not per
institution, and neither is institution-scoped (`FeeStructure` has `institutionId`;
`Payment` does not — see D-12).

**[SOURCE]** Seed data hard-codes NGN — `apps/api/prisma/seed.ts:1193-1220` (3 fee structures,
NGN).

### D. Exact conflict

Currency has at least three on-disk homes and a fourth specified-but-unimplemented home, and no
document states which one a write or a read must consult. `Institution.currency` is a plain column
with no version, no audit trail, and no "fixed after first invoice" enforcement; the legacy Finance
tables carry their own per-row currency with a schema default.

BR-015 is a *constraint on a specific authoritative value*, so it cannot be enforced without first
naming the authoritative column. Until then the constraint is unimplementable and three columns can
legitimately disagree. Multi-currency being Future (`:1789`) means the domain only needs one
currency per institution — so the requirement is small, but the ambiguity is total.

**[INFERENCE]** A related hazard: BR-015 says currency is "fixed after first invoice". Fixing
requires detecting the first invoice per institution. If the authoritative currency lives in
`FinancialPolicy` (versioned, supersedable — `:316`) while `Institution.currency` remains writable,
a policy supersession and a column update can diverge silently.

### E. Concrete options

**Option 1 — `Institution.currency` is authoritative; Finance reads it; legacy per-row currency columns are removed with their tables.**
**[SOURCE]-supported.** Currency is institution configuration; `institution.prisma:72` already
exists and is populated; BR-015 becomes enforceable as a guard on that column.

**Option 2 — `FinancialPolicy` (currency policy type) is authoritative; `Institution.currency` is retained for display/format and Finance ignores it for settlement.**
**[SOURCE]-supported** by `:46`, `:1138`, `:316`. Versioned and auditable, matching Finance's
"configuration changes are versioned and audited" principle (`:64`).

**Option 3 — Keep both, synchronised.**
Not **[SOURCE]-supported**. Requires a write-path invariant across two domains with no mechanism
specified for enforcing it. Recorded as an option only because it is the implicit current state.

### F. Consequences

| | Schema | Migration | Security | Cross-domain | Implementation | Later phase |
|---|---|---|---|---|---|---|
| **1 Institution authoritative** | drop legacy currency columns; no new column | legacy tables archived anyway | none | Institution owns, Finance reads — single writer | smallest | multi-currency (Future) would need Institution to become multi-valued |
| **2 Finance authoritative** | new `FinancialPolicy` currency row per institution | no legacy impact | none | two currency fields must be explicitly distinguished or one removed | needs policy read on every money path | policy versioning already supports supersession; multi-currency fits better |
| **3 Synchronised** | no change | none | none | **two writers, no enforcement** — the BR-015 violation persists | looks cheapest, is not | divergence grows silently; hardest to detect later |

### G. Recommended resolution

**[INFERENCE]** Option 1 if the owner accepts that settlement currency is institution
configuration (consistent with `Institution Management Engineering.md:995` treating locale/format as
institution concern and with Option 1/3 of D-2). Option 2 if the owner prioritises versioned,
audited policy over column simplicity — it is the better fit for BR-015's "fixed after first
invoice" because `FinancialPolicy` already has Draft → Active → Superseded (`:316`).

Option 3 should be rejected: it is the only option that leaves BR-015 unimplementable.

### H. Exact decision required

Name the single authoritative field for institution settlement currency; state whether
`Institution.currency` remains writable; and state the enforcement point for "fixed after first
invoice" (which write path performs the check).

---

## D-4 — Event contract, naming, and consumer ownership

**Class: BLOCKING — conflicting frozen sources + Phase 1/2 infrastructure amendment**

### A. Decision title

Which event contract, naming convention, and consumer-ownership map governs Finance?

### B/C. Three separate conflicts, with source and repository evidence

#### D-4.1 Envelope

**[SOURCE]** Frozen requirement — `Finance Engineering.md:1329`: every event carries `eventId`,
`eventVersion`, `schemaVersion`, `occurredAt`, `correlationId`, `causationId`, `tenantId`, `actorId`.

**[SOURCE]** Runtime envelope — `apps/api/src/modules/events/event-envelope.ts:19-31`:
`BaseEventEnvelope` = `eventId`, `causationId`, `schemaVersion`, `emittedAt`, `tenantId`.
`EVENT_SCHEMA_VERSION = 1` (`:14`); `EVENT_DEDUP_TTL_SECONDS = 72*60*60` (`:17`).

**[SOURCE]** The envelope is a **locked Phase 5 decision**, documented in-file: "D-4 event envelope
(Phase 5, locked decision D-4)" and "the envelope is extended ADDITIVELY" (`:4-10`).

**[SOURCE]** Field-by-field reality:

| Frozen field | Runtime status | Evidence |
|---|---|---|
| `eventId` | present | `event-envelope.ts:25` |
| `schemaVersion` | present | `:28` |
| `causationId` | present | `:27` |
| `tenantId` | present | `:30` |
| `correlationId` | **present in domain payloads**, absent from `BaseEventEnvelope` | `academics.events.ts:153-161`, `people.events.ts:54`; ALS-based via `correlation-id.interceptor.ts:26-37`, propagated at `students.service.ts:86`, `audit.service.ts:33,88` |
| `actorId` | **present in domain payloads**, absent from `BaseEventEnvelope` | `academics.events.ts:157`, `people.events.ts:48` |
| `occurredAt` | **absent everywhere**; runtime uses `emittedAt` | `event-envelope.ts:29,55` |
| `eventVersion` | **absent everywhere** | repo-wide search of `apps/api/src` returns no match |

**[INFERENCE]** The scope report overstated this conflict. `correlationId` and `actorId` are
implemented; the true gaps are `eventVersion` (entirely absent) and `occurredAt` (renamed
`emittedAt`). Changing the envelope would amend a locked Phase 5 decision and invalidate
`emitAudited` (`academics.events.ts:179-205`) and the audit dedup that shares one `eventId`
(`:174-178`).

#### D-4.2 Naming

**[SOURCE]** Frozen convention — `Finance Engineering.md:81`: "Events | PascalCase, past tense |
`InvoiceGenerated`".

**[SOURCE]** The runtime uses **two conventions simultaneously**:

- **PascalCase** — `people.events.ts:11-44`: `PersonCreated`, `StudentEnrolled`,
  `StudentGraduated`, `StudentWithdrawn`, `StaffHired`, `StaffSeparated`, `PersonMerged`, …
- **Dotted namespaced** — `academics.events.ts:16-149`: `academics.enrollment.created`,
  `academics.summer-school.registered`, `academics.result.published`, …

**[SOURCE]** Academics' own file documents the deviation as intentional Phase 5 behaviour
(`academics.events.ts:7-15`), and its keys are PascalCase while values are dotted — so the
constant *name* follows the frozen convention while the emitted *string* does not.

#### D-4.3 Ownership — the three disputed events

**[SOURCE]** `SummerSchoolRegistered` — **substantively consistent, documented inconsistently**:

| Source | Consumer(s) | Action |
|---|---|---|
| `Academic Management Engineering.md:418` | AuditModule, NotificationModule | — (Finance absent) |
| `Academic Management Engineering.md:240` | Finance | "creates fee assignments via SummerSchoolRegistered event" |
| `Academic Management Engineering.md:1443` | FinanceConsumer | Create fee assignment |
| `Communication Engineering.md:309` | Communication | Send registration confirmation |
| `Finance Engineering.md:1337` | AcademicManagementConsumer | Trigger bill/invoice generation |
| Runtime `academics.events.ts:145` | emits `academics.summer-school.registered` | — |

**[INFERENCE]** All sources agree Finance creates a fee assignment. Only the consumer *class name*
differs (`FinanceConsumer` vs `AcademicManagementConsumer`) and Academic:418's table omits Finance.
This is a documentation defect, **not** a substantive conflict.

**[SOURCE]** `StudentGraduated` — **substantive conflict**:

| Source | Consumer | Action |
|---|---|---|
| `People Engineering.md:1179` | `FinanceConsumer` | "Update financial records" |
| `Finance Engineering.md:1338` | `PeopleConsumer` | "Trigger refund eligibility, final billing" |

Both name the same event; the two frozen specs assign it to differently-named consumers with
different stated actions. Runtime emits it at `students.service.ts:584`.

**[SOURCE]** `StudentClassEnrolled` / `StudentClassTransferred` — **substantive conflict**:

| Source | Consumer |
|---|---|
| `Academic Management Engineering.md:388-389` | AuditModule, AttendanceModule, PeopleModule — **Finance absent** |
| `Finance Engineering.md:1337` | `AcademicManagementConsumer` → "Trigger bill/invoice generation" |

Finance requires these to trigger billing; the Academic frozen event table assigns them elsewhere.
Additionally, **no runtime event with either name exists**: the equivalents are
`academics.enrollment.created` (`academics.events.ts:81`, emitted `enrollment.service.ts:62`) and
`academics.enrollment.transferred` (`:84`).

**[SOURCE]** `StudentWithdrawn` — conflict: `People Engineering.md:387` assigns FinanceModule;
`Finance Engineering.md:1338` assigns `PeopleConsumer`. Runtime emits at
`students.service.ts:728`.

**[SOURCE]** `StudentEnrolled` — **undeclared third billing trigger**: emitted from **two**
places, `students.service.ts:345` and `applicants.service.ts:644` (applicant acceptance). Neither
`Finance Engineering.md:1332-1341` nor the People consumer tables name applicant acceptance as a
billing trigger.

**[SOURCE]** **Undeclared in the Finance spec entirely** — `People Engineering.md:381,383,411`
assign **FinanceModule** as a consumer of `PersonSoftDeleted`, `PersonRestored`, and `PersonMerged`.
`Finance Engineering.md:1332-1341` declares **no handler for any of them**. Runtime emits
`PersonMerged` at `people-merge.service.ts:455`.

**[INFERENCE]** `PersonMerged` is the material one: merging two `Person` records merges their
financial history. The People spec requires Finance to react; the Finance spec never says how. This
dependency is absent from the scope report entirely.

**[SOURCE]** Communication consumers, for completeness: `Communication Engineering.md:304` consumes
People's `ParentLinked`; `:309` consumes Academic's `SummerSchoolRegistered` (send registration
confirmation). Finance spec:44 excludes notification ownership from Finance, and Finance's
`NotificationConsumer` list (`:1336`) is Notification-owned, not Communication-owned.

### D. Exact conflict

The Finance frozen specification and the implemented Phase 5 event infrastructure disagree on
naming convention, and the Finance, Academic, and People frozen specifications disagree on consumer
ownership for the same event names. Because Academics emits dotted names while People emits
PascalCase, a Finance consumer cannot be written against a single naming assumption without
knowing which domain produced the event.

Two of the disputed events (`StudentClassEnrolled`, `StudentClassTransferred`) **do not exist at
runtime under any name the Finance spec can subscribe to**, and two Finance-relevant events
(`PersonMerged`, `PersonSoftDeleted`) are assigned to Finance by the People spec with no Finance
handler declared. Any one of these alone prevents a correct Finance consumer module.

### E. Concrete options

**Option 1 — Adopt the runtime as-is: PascalCase for People-originated events, dotted for Academics-originated; Finance subscribes per source domain.**
**[SOURCE]-supported.** No amendment to a locked Phase 5 decision. Requires Finance to document
two naming conventions and an explicit event-name map. Amends nothing; adds a map.

**Option 2 — Normalise all event names to the frozen PascalCase convention.**
**[SOURCE]-supported by `Finance Engineering.md:81`.** Requires renaming every Academics event
string (≈130 constants) and amending locked Phase 5 output. Largest blast radius; touches a
completed phase.

**Option 3 — Normalise all event names to dotted namespaced.**
**[INFERENCE]** Not supported by the frozen convention text, which specifies PascalCase. Would
require amending the naming convention in the Finance, Academic, and People specs and renaming all
People events.

**Option 4 — Add `eventVersion` and `occurredAt` to the envelope; keep `emittedAt` as an alias.**
Amends locked Phase 5 decision D-4 and invalidates `emitAudited`'s shared-`eventId` contract.

### F. Consequences

| | Schema | Migration | Security | Cross-domain | Implementation | Later phase |
|---|---|---|---|---|---|---|
| **1 Adopt runtime** | none | none | none | Finance must maintain a source→event map; mis-mapping = silent missed billing | Finance module only | every future domain must pick a convention; the map grows |
| **2 PascalCase** | none | none | none | rewrites Phase 5 event contracts; any external consumer breaks | large: ≈130 constants + tests | single convention forever; cheapest long-term |
| **3 Dotted** | none | none | none | contradicts the frozen convention text; requires spec amendment | same size as Option 2 | consistent with Academics, against Finance's stated rule |
| **4 Envelope change** | none | none | none | invalidates locked Phase 5 D-4 and audit dedup | touches `event-envelope.ts` + all producers | `eventVersion` enables per-event evolution; highest long-term value |

### G. Recommended resolution

**[INFERENCE]** Option 1 for naming is the only choice that does not rewrite a completed phase, and
Option 4 is the only one that delivers `eventVersion` — but Option 4 is an amendment to a locked
decision and should be taken deliberately, not as a Finance side effect. A reasonable sequence is
Option 1 now (unblocks Finance) with Option 2/4 as a separate governance item.

**Tradeoff not concealed:** Option 1 institutionalises two conventions. The cost is a permanent
Finance-side mapping table; the benefit is that no completed phase is disturbed.

### H. Exact decision required

Decide: **(a)** the governing event naming convention; **(b)** whether `eventVersion` and
`occurredAt` are added to the locked envelope or Finance accepts `emittedAt`; **(c)** for
`StudentGraduated`, `StudentWithdrawn`, and the two enrollment events, which frozen spec is
authoritative when they disagree; **(d)** whether Finance must handle `PersonMerged` and
`PersonSoftDeleted`, and what it must do with financial history when two Persons merge.

---

## D-5 — Payer and object scope

**Class: BLOCKING — unclear payer/authorization boundary**

### A. Decision title

Who is authorised to view and pay a student invoice, and what scope mechanism expresses that?

### B. What the frozen sources say

**[SOURCE]** The frozen Finance specification **never uses the word "payer"** — zero occurrences,
verified by exhaustive search of `engineering/Finance Engineering.md`. The closest constructs are:

- `FinanceAccessGuard` — "Validate user has access to requested financial entity" (`:1316`)
- `Student invoices` endpoint `GET /api/v1/finance/invoices/student/:studentId`
  (`:1481`, permission `finance:invoice:read`)
- `invoices.student_person_id` index (`:1150`), `payments.student_person_id` (`:1155`)
- Gateway flow: "**Student** initiates online payment → GatewayService.initiateTransaction()"
  (`:1718`)

**[SOURCE]** The parent-facing capability is explicitly deferred —
`Finance Engineering.md:1794`:

> `| Low | Parent payment portal | Future |`

**[SOURCE]** Payer-adjacent vocabulary lives in People, not Finance —
`People Engineering.md:62`: "**Relationship-Driven:** Person Relationships model family, guardian,
staff-student, and emergency connections"; `:201` ADR-003 "Person Relationships are bidirectional
with temporal validity ... with time bounds"; `:208` ADR-010 relationship types include
parent, guardian, sibling, emergency.

**[SOURCE]** Roadmap P6.6 requires an "unauthorized invoice access" test (`:741`) but does not
define a payer role or payer entity.

### C. What the current repository says

**[SOURCE]** Candidate objects already exist, all People-owned:
`Parent` (`people.prisma:510`), `Guardian` (`:537`), `Student` (`:206`),
`PersonRelationship` (`:623-652`).

**[SOURCE]** `PersonRelationship` carries the attributes a payer rule would need —
`people.prisma:623-652`: `sourcePersonId`, `targetPersonId`, `relationshipType`, `startDate`,
`endDate?`, `isActive`, unique on
`(tenantId, sourcePersonId, targetPersonId, relationshipType, institutionId)`.

**[SOURCE]** `Parent` and `Guardian` both expose `userId` and are already in the ObjectScope
registry — `object-scope.guard.ts:218-219`. A `PARENT` role is seeded (`seed.ts:227`) and already
holds People grants (`seed.ts:656, 739`).

**[SOURCE]** `ObjectScopeGuard` supports exactly three enforcing scope types —
`object-scope.guard.ts:57-75`: `tenant`, `self`, `institution` (plus pass-throughs `none`,
`authOnly` at `:42`).

**[SOURCE]** `self` is a **column-equality** test — `object-scope.guard.ts:129`:

> `if (objRecord.tenantId !== tenantId || objRecord.userId !== userId) {`

**[SOURCE]** Three fail-open behaviours, all verified:

- `:90-92` tenant scope: `if (!objectId || !model) return true;`
- `:119-121` self scope: identical
- `:169-171` institution scope: identical
- Only `params.id` is read (`:88`, `:117`, `:167`) — a route parameter named anything else is invisible.

**[SOURCE]** The registry `selectMap` (`:198-283`) contains **zero** Finance models, and throws
`ForbiddenException('Unsupported object scope model')` for unregistered names (`:286-288`).

**[SOURCE]** The frozen route `GET /api/v1/finance/invoices/student/:studentId`
(`Finance Engineering.md:1481`) uses `:studentId`, not `:id`. Under current guard logic `params.id`
is `undefined`, so **every** scope type short-circuits to `true` (`:90-92`, `:119-121`, `:169-171`).
**[INFERENCE]** The guard would provide no object-level protection on that route; only a service-layer
predicate would.

### D. Exact conflict

The frozen Finance specification requires `FinanceAccessGuard` to validate access to "the requested
financial entity" (`:1316`) while defining no payer entity, no invoice-to-payer relation, and no
payer scope. The frozen gateway flow has the **Student** as the paying actor (`:1718`), and the
parent portal is Future (`:1794`) — so on the frozen evidence, **Phase 6 has no payer-facing
requirement at all**.

The repository cannot express the relational rule that a payer-facing feature would need.
`ObjectScopeGuard`'s entire predicate vocabulary is `tenantId` equality, `userId` equality, and
`institutionId` equality (`object-scope.guard.ts:99-101`, `:129-131`, `:179-184`). "This payer may
see this student's invoice" is a **join predicate** over `PersonRelationship` with `isActive` and
date bounds — outside that vocabulary. `PersonRelationship` is the only existing relational
substrate and no Finance model references it.

Compounding this, the guard's short-circuit on non-`:id` routes means the one student-scoped
endpoint the frozen spec *does* define (`:1481`) would be unprotected at the guard layer.

### E. Concrete options

**Option 1 — Phase 6 is staff-only; no payer-facing endpoint or payer model.**
**[SOURCE]-supported.** Consistent with `Finance Engineering.md:1718` (Student initiates) and
`:1794` (parent portal Future). P6.6's "unauthorized invoice access" is satisfied by
institution/tenant scoping for BURSAR and admin roles. No `PersonRelationship` dependency.

**Option 2 — Read-only parent/guardian invoice visibility in Phase 6, via existing `PersonRelationship` + `PARENT` role; no new payer model; no online payment initiation by a parent.**
**[SOURCE]-consistent** with People ADR-003/ADR-010 and the existing `PARENT` role. Payment remains
student-initiated per `:1718`. Requires a new scope type or a Finance-specific guard because the
predicate is relational.

**Option 3 — Introduce a first-class Finance payer record.**
**No source supports it.** The frozen spec defines no payer table, and the word "payer" does not
appear. Would require inventing columns, lifecycle, and authority rules.

### F. Consequences

| | Schema | Migration | Security | Cross-domain | Implementation | Later phase |
|---|---|---|---|---|---|---|
| **1 Staff-only** | none | none | institution + tenant scoping; must still fix the `:studentId` short-circuit | **no People dependency** — cleanest boundary | smallest | parent portal (Future) still needs this decision again |
| **2 Read-only via relationship** | no new payer table; needs a Finance↔person link on the invoice | additive | relational predicate; `isActive` + date bounds must be honoured | hard dependency on `PersonRelationship`; breaks if People merges Persons (see D-4 `PersonMerged`) | new scope type or Finance guard | re-decided when payment initiation is added |
| **3 New payer model** | new table | new migration | two payer sources of truth alongside `Parent`/`Guardian` | duplicates People identity | largest; no source basis | hardest to unwind |

### G. Recommended resolution

**[INFERENCE]** Option 1 is the best supported by the frozen evidence: the specification's own
payment flow names the Student as payer, the parent portal is explicitly Future, and "payer" is
absent from the document. It also avoids coupling Finance to People identity — a coupling the
People spec's `PersonMerged` requirement (`:411`) shows is not yet stable.

Option 2 becomes necessary the moment any parent-facing read is required, and is the natural
escalation if the owner wants to pull the portal forward. Option 3 has no source basis.

**Independent of the choice:** the `params.id`-only short-circuit (`:88`, `:117`, `:167`) must be
addressed for Finance routes regardless — it is D-11, not contingent on the payer decision.

### H. Exact decision required

State whether Phase 6 exposes any invoice view or payment path to a person who is not the student.
If no: confirm Phase 6 is staff-only and record that the parent portal decision moves to its
scheduled Future phase. If yes: state whether the relationship is expressed through the existing
`PersonRelationship` (with `isActive` and date bounds) or through a new Finance-owned payer record,
and name the guard that evaluates it.

---

## D-6 — Financial status authority

**Class: BLOCKING — unclear trusted payment-state boundary**

### A. Decision title

Which domain owns payment and refund state, and what happens to two existing client-writable fields?

### B. What the frozen sources say

**[SOURCE]** BR-027 (`Finance Engineering.md:350`):

> `| BR-027 | Payment gateway transactions are audit records; payment state owned by Finance | Payments |`

**[SOURCE]** BR-025 (`:348`): "Summer School billing triggered by Academic Management events only".

**[SOURCE]** BR-026 (`:349`): "Finance owns all invoice calculation; other domains send billing
requests".

**[SOURCE]** BR-09 (`:332`): "Refunds require approval workflow with threshold-based escalation".

**[SOURCE]** Refund lifecycle (`:294`): `Requested → Approved / Rejected → Processed`; status enum
`REQUESTED, APPROVED, REJECTED, PROCESSED` (V-REF-05, `:647`).

**[SOURCE]** Roadmap P6.3 (`:711`): "Ensure payment state is not trusted from the client."

### C. What the current repository says

**Violation 1 — Academic, `SummerSchoolRegistration.paymentStatus`:**

- **[SOURCE]** `apps/api/prisma/domains/academic.prisma:912` —
  `paymentStatus String? @map("payment_status") @db.VarChar(50)`. Free-text, nullable, no enum.
- **[SOURCE]** `apps/api/src/modules/academics/dto/academic-admin.dto.ts:242` — DTO field validated
  only `@IsString()`.
- **[SOURCE]** `apps/api/src/modules/academics/services/summer-school.service.ts:233` (create),
  `:259`, `:267` (update) — client value written directly and **mutable** after registration.
- **[SOURCE]** Frozen Academic spec:240 assigns Finance "payment status" as a **write** capability,
  compounding the ambiguity: the field is written by Academic from client input *and* nominally by
  Finance.

**Violation 2 — People, `StudentWithdrawalDetail.refundStatus`:**

- **[SOURCE]** `apps/api/prisma/domains/people.prisma:353` — `VARCHAR(50)`.
- **[SOURCE]** `apps/api/src/modules/people/dto/student.dto.ts:20` —
  `export const REFUND_STATUSES = ['PENDING', 'PROCESSED', 'DENIED'] as const;` — a fixed 3-value
  list, regex-validated (`:199-200`).
- **[SOURCE]** `apps/api/src/modules/people/students.service.ts:708` (upsert create)
  `refundStatus: dto.refundStatus ?? 'PENDING'` and `:716` (upsert update)
  `...(dto.refundStatus !== undefined ? { refundStatus: dto.refundStatus } : {})`.
- **[SOURCE]** `StudentWithdrawn` is emitted immediately after, at `:728`.

**[SOURCE] Vocabulary mismatch:** People uses `PENDING | PROCESSED | DENIED`. The frozen Finance
enum is `REQUESTED | APPROVED | REJECTED | PROCESSED` (`:647`), and the frozen lifecycle (`:294`)
has no `DENIED` state. The legacy Finance `Refund.status` reuses the **`PaymentStatus`** enum
(`finance.prisma:109`) — `PENDING, COMPLETED, FAILED, REFUNDED` — a third vocabulary matching neither.

### D. Exact conflict

Two client-writable fields assert financial state that BR-027 assigns exclusively to Finance. A
caller can set `refundStatus: 'PROCESSED'` in the same request that withdraws a student
(`students.service.ts:708`), with no refund request, no approval, and no threshold escalation —
so BR-09's control is bypassable through the People module rather than merely unmet inside Finance.

`paymentStatus` is worse in kind: it is free-text (so `'paid'`, `'PAID'`, `'completed'` are all
accepted), and mutable post-creation (`summer-school.service.ts:259, 267`), so it can be asserted
and retracted without any Finance transaction.

The three vocabularies are mutually incompatible, so the fields cannot even be compared, let alone
reconciled. Note the boundary problem this creates: remediating either field means editing **Phase
5 (Academic)** or **Phase 4 (People)** code, both completed phases, which this gate must not touch.

### E. Concrete options

**Option 1 — Finance owns both; People/Academic fields become read-only projections written only by Finance event consumers; client input removed.**
**[SOURCE]-supported** by BR-025/BR-026/BR-027. Requires Phase 4/5 edits plus a
`PaymentConfirmed`/`PaymentFailed` → projection write path.

**Option 2 — Finance owns both; the People/Academic columns are removed entirely and consumers read Finance.**
**[SOURCE]-supported.** Cleanest single source of truth; breaks any Phase 4/5 consumer that reads
them; requires confirming none exist. **[SOURCE]** No runtime reader was found in this pass, but
this must be confirmed before choosing.

**Option 3 — Defer remediation; Phase 6 ships Finance without touching the fields, accepting a known cross-module bypass of BR-09/BR-027.**
Not **[SOURCE]-supported.** Contradicts roadmap P6.3 (`:711`) and BR-027.

### F. Consequences

| | Schema | Migration | Security | Cross-domain | Implementation | Later phase |
|---|---|---|---|---|---|---|
| **1 Read-only projections** | keep columns, drop client write | none | fields can no longer be forged; trust restored via Finance events | requires Phase 4 **and** Phase 5 edits; Finance must own the write-back | two projection writers to maintain | projections may drift if an event is lost |
| **2 Remove columns** | drop 2 columns | migration on completed tables | strongest — one representation | **breaking** for any existing reader; Phase 4/5 edits | smallest Finance code; largest blast radius on past phases | no drift possible |
| **3 Defer** | none | none | **known bypass persists** into production | none | none | a P6.6 security test cannot honestly pass |

### G. Recommended resolution

**[INFERENCE]** Option 1 is the best balance: it restores the BR-027 boundary without deleting
columns other phases already expose, and it makes the P6.3 "payment state is not trusted from the
client" item genuinely satisfied. Option 2 is cleaner but is a breaking change to completed phases
and should only be chosen after confirming no consumers read the columns.

**Tradeoff not concealed:** both compliant options require editing completed phases, which this gate
forbids. The owner must decide whether a later remediation pass across Phase 4/5 is acceptable, or
whether the bypass is acceptable to carry into Phase 6. Option 3 should not be chosen silently.

### H. Exact decision required

Confirm Finance as sole owner of payment and refund state; choose Option 1 or Option 2; authorise a
remediation pass against Phase 4/5 code (or explicitly accept deferral); and settle the canonical
refund vocabulary — `REQUESTED | APPROVED | REJECTED | PROCESSED` (frozen) or People’s
`PENDING | PROCESSED | DENIED`.

---

## D-7 — Roles, permissions, and guards

**Class: BLOCKING — conflicting frozen sources, but with a strong existing precedent**

### A. Decision title

Can Finance use the Phase 2 RBAC architecture as-is, and what supplies refund/write-off authority?

### B. What the frozen sources say

**[SOURCE]** Finance excludes authorization — `Finance Engineering.md:48`: "Authentication,
Authorization, Roles, Permissions, MFA, Sessions (Identity & Access)".

**[SOURCE]** The same document mandates four guards — `:1309-1323`: `FinanceAccessGuard`,
`ModuleLicenseGuard`, `FinancialAuthorityGuard` ("Validate user has authority for approval
operations (refund approval, write-off)"), `ImmutabilityGuard` ("Prevent modification of published
invoices, confirmed payments, posted entries"), with flow
`JwtAuthGuard → TenantGuard → InstitutionGuard → FinanceAccessGuard → ModuleLicenseGuard` (`:1321`).

**[SOURCE]** The spec defines **no Finance roles** — no Bursar, Accountant, or Cashier role appears
in any of its 13 sections. Authority is expressed only as a threshold (BR-09, `:332`;
BR-011, `:334`: "Write-offs require admin authorization").

**[SOURCE]** Permission naming convention: `{domain}:{resource}:{action}` (`:83`).

**[SOURCE]** The full permission set, from the endpoint catalogue (`:1435-1618`) — **64 distinct
permissions across 20 resources**:

| Resource | Actions | Resource | Actions |
|---|---|---|---|
| `finance:fee_category` | read, create, update | `finance:scholarship` | read, create, update, award, revoke |
| `finance:fee_item` | read, create, update | `finance:refund` | read, request, approve, process |
| `finance:fee_schedule` | read, create, update, manage | `finance:adjustment` | read, create, reverse |
| `finance:bill` | read, create, convert, cancel | `finance:write_off` | read, create, approve |
| `finance:invoice` | read, create, manage, cancel, update, adjust | `finance:installment` | read, create, pay |
| `finance:payment` | read, create, confirm, allocate | `finance:ledger` | read, create |
| `finance:gateway` | read, create, update, transact | `finance:journal` | read, create |
| `finance:reconciliation` | read, manage | `finance:period` | read, create, manage |
| `finance:discount` | read, create, update, apply | `finance:policy` | read, create, update |
| `finance:report` | read | `finance:billing` | summer_school |

**[SOURCE]** `fee_templates` has a table (`:767-798` region) and a module
(`FeeStructureModule`, `:1235`) but **no endpoint and no permission** in §10.3. `finance:billing:summer_school`
is the only permission with an underscore in its action segment (`:1617-1618`).

### C. What the current repository says

**[SOURCE]** Permissions are a two-column `(resource, action)` pair — `identity.prisma:76-86`
(`Permission`) with unique `(resource, action)`. `finance:invoice:read` maps to
`resource: 'finance:invoice'`, `action: 'read'` — **exactly** the existing shape, established by
`seed.ts:428-435` (`academics:calendar` × `['read','create','update','manage']`).

**[SOURCE]** **No new role is required.** `BURSAR` is already a seeded system role —
`seed.ts:234`: `prisma.role.create({ data: { name: 'BURSAR', description: 'Bursar', isSystem: true } })`
— among 16 system roles (`:222-236`). It already holds a grant
(`seed.ts:782`: `roleName: 'BURSAR'`, `grants: [{ resource: 'academics:calendar', actions: ['read'] }]`).
`PARENT` (`:227`) and `STUDENT` (`:226`) also exist.

**[SOURCE]** Phase 5 established the exact precedent for this situation — `seed.ts:425-427`:

> `// PHASE 5 (D-2): register the frozen Academic permission catalogue`
> `// (engineering/Academic Management Engineering.md §10.3; mapping decision —`
> `// docs/PHASE_5_ACADEMIC_RBAC_GRANT_MATRIX.md). No new RBAC roles; grants below.`

Grants are declared as data (`:787-803`) and fail loudly if a permission is missing
(`:796-800`: `throw new Error('academics permissions missing for ...')`).

**[SOURCE]** `PermissionGuard` fails open — `permission.guard.ts:14-16`: when no `@Permissions`
metadata is present the guard returns `true`. **[SOURCE]** `ObjectScopeGuard` likewise
(`object-scope.guard.ts:42`) and additionally short-circuits on non-`:id` routes (`:90-92`, `:119-121`,
`:169-171`).

**[SOURCE]** None of `FinanceAccessGuard`, `ModuleLicenseGuard`, `FinancialAuthorityGuard`, or
`ImmutabilityGuard` exists. **[SOURCE]** No `finance:*` permission literal exists anywhere in the repo.

**[SOURCE]** Tenant isolation tests are specified — `Finance Engineering.md:1659-1668` (TI-001
same-tenant/different-institution → "404 or empty"; TI-002 unassigned institution → 403).

### D. Exact conflict

The Finance specification simultaneously excludes authorization and mandates 64 permissions and
four guards. The specification is silent on **roles** and on **how threshold-based authority
(BR-09, BR-011) is represented** — a threshold is a runtime attribute of an amount, not a static
role→permission grant, and no source describes the mechanism.

**[INFERENCE]** The permission half of D-7 is largely de-risked by precedent: the
`(resource, action)` model already represents all 64 Finance permissions with no schema change, and
`BURSAR` already exists, so the Phase 5 pattern (register catalogue + data-driven grants + no new
roles) applies directly. The genuinely open part is narrower than the scope report implies: a
**single flat `BURSAR` role cannot express** "request a refund" versus "approve a refund above a
threshold", which is exactly what BR-09 and `FinancialAuthorityGuard` require. That is the real
decision — not "do we need roles" but "how is approval authority separated from request authority".

A secondary exposure: with `PermissionGuard` failing open (`:14-16`), any Finance route that omits
`@Permissions` is silently public to any authenticated user. This is a construction-time discipline
requirement, not a new guard.

### E. Concrete options

**Option 1 — Reuse `BURSAR`; express request/approve separation purely through permissions (`finance:refund:request` vs `finance:refund:approve`, `finance:write_off:create` vs `finance:write_off:approve`); no new role; threshold check inside `FinancialAuthorityGuard`.**
**[SOURCE]-supported.** The permissions already distinguish request from approve (`:1549-1551`,
`:1562-1563`); `BURSAR` exists (`seed.ts:234`); Phase 5 precedent forbids new roles. Threshold
values need a home — `FinancialPolicy` is the natural candidate (`:1138` versioned policy).

**Option 2 — Add one new role (e.g. `FINANCE_MANAGER`) for approval authority above threshold.**
**[SOURCE]-consistent** with the spec's silence on roles and with how `INSTITUTION_ADMIN` /
`PRINCIPAL` are already seeded (`seed.ts:223-224`). Requires amending the Phase 5 "no new roles"
precedent for one role.

**Option 3 — Model authority as a data capability (delegation/threshold table) rather than a role.**
**[SOURCE]-consistent** with Identity's existing `Delegation` concept
(`Identity & Access Engineering.md:185-198`, `:316` "Expired delegations are automatically
deactivated"). More machinery than the spec describes.

### F. Consequences

| | Schema | Migration | Security | Cross-domain | Implementation | Later phase |
|---|---|---|---|---|---|---|
| **1 Reuse BURSAR** | **none** — all 64 permissions fit existing `(resource, action)` | none | separation enforced by distinct permissions; a BURSAR holding both can self-approve unless the guard blocks it | no Identity change | smallest; follows Phase 5 exactly | segregation of duties remains weak for small institutions |
| **2 Add FINANCE_MANAGER** | none (roles are data) | none | genuine two-person control | one new system role; diverges from the Phase 5 precedent | slightly larger | precedent broken once; may be repeated per domain |
| **3 Delegation-based** | new delegation/threshold data | migration | strongest; time-bound authority | depends on Identity `Delegation` semantics | largest | most flexible; most to build |

### G. Recommended resolution

**[INFERENCE]** Option 1 is best supported and is the direct analogue of the locked Phase 5
decision. It should be paired with an explicit rule that `FinancialAuthorityGuard` rejects
self-approval of one's own request, since BR-09's escalation intent is otherwise unmet.
Option 2 is the pragmatic choice if the owner wants segregation of duties to be visible in the role
catalogue. Option 3 is not justified by any Finance source.

**Tradeoff not concealed:** Option 1 keeps a single role and therefore a single human may request
and approve. If the owner's institutions require two-person control, Option 1 is insufficient on its
own.

### H. Exact decision required

Confirm whether Phase 6 introduces any new role. If not, state which seeded role(s) receive which
of the 64 permissions. Then state how BR-09/BR-011 threshold authority is represented — a
`FinancialPolicy` value, a new role, or a delegation record — and whether self-approval is blocked.

---

## D-8 — Decimal precision, rounding, and balanced entries

**Class: BLOCKING — financial-correctness gap**

### A. Decision title

What is the canonical monetary quantization point and rounding mode?

### B. What the frozen sources say

**[SOURCE]** `Finance Engineering.md:752`:

> `All monetary columns use decimal(14,2) (never Float).`

**[SOURCE]** Balanced entries — `:1349`: "Double-entry enforcement: Journal entry posting validates
balance before commit; rolled back if unbalanced". `:1753`: "Total debits must equal total credits
for every entry". BR-012/BR-013 (`:335-336`): every confirmed payment creates a journal entry;
entries must balance.

**[SOURCE]** AR-004 (`:1071-1072`): `total_debit decimal(14,2)`, `total_credit decimal(14,2)`,
"must equal total_debit".

**[SOURCE]** Materialised balances, not views — `:825-833`: `subtotal`, `total_discounts`,
`total_scholarships`, `total_tax`, `total_late_fees`, `total_amount`, `paid_amount`,
`outstanding_balance` ("total_amount - paid_amount"), `credit_balance`. Also `:1096-1099`
`opening_balance`, `total_debit`, `total_credit`, `closing_balance` ("computed").

**[SOURCE]** Signed line items — `:845`: `amount decimal(14,2)` "positive = charge, negative =
discount/scholarship".

**[SOURCE]** Allocation bound — V-PA-03 (`:617`): "Amount: required, decimal > 0, ≤ invoice
outstanding balance".

**[SOURCE]** Validation on money — V-PAY-01 `:605` "decimal > 0"; V-REF-02 `:644` "decimal > 0";
V-DC-03 `:625` "decimal > 0; if PERCENTAGE, must be ≤ 100"; V-SCH-03 `:635` "Fund limit: optional,
decimal ≥ 0".

**[SOURCE]** Rounding: **no statement exists.** Exhaustive search of
`engineering/Finance Engineering.md` for `rounding`, `half-up`, `half-even`, `ceiling`, `floor`,
`toFixed`, `ROUND(` returns **no matches**. (Searches for the substring `round` match only
"back**ground**".)

### C. What the current repository says

**[SOURCE]** Legacy precision is `Decimal(10, 2)` on all five models —
`finance.prisma:10, 37, 38, 39, 63, 89, 90, 107`. `decimal(10,2)` caps at 99,999,999.99.

**[SOURCE]** No rounding or quantisation helper exists — no money utility in `apps/api/src`, and
`decimal.js` is not a direct dependency (`apps/api/package.json:22-46`); monetary values arrive as
`Prisma.Decimal` via `@prisma/client` (`:32`).

**[SOURCE]** The repository has no established monetary-arithmetic convention to inherit.

### D. Exact conflict

The specification mandates a storage precision (`decimal(14,2)`) and an invariant (debits equal
credits) but never states the arithmetic rule that connects them. The two requirements are only
satisfiable together if every intermediate value is quantised consistently, because the invoice
chain is a **sequence of materialisations**, not one calculation:

`signed line items → subtotal → total_amount → paid_amount → outstanding_balance` (`:825-833`),
and in parallel `journal lines → total_debit / total_credit` (`:1071-1072`) feeding
`account_balances.closing_balance` (`:1099`).

Each step can leave a sub-cent residue. If invoice-side and journal-side quantise differently, or
if a residue is carried rather than rounded, `total_debit ≠ total_credit` and `:1349` rolls the
transaction back — turning a rounding choice into a production failure. V-PA-03's "≤ outstanding
balance" comparison (`:617`) is equally sensitive, because a residue of one cent can reject a
legitimate final allocation.

**[INFERENCE]** The specification is silent on four distinct questions: (i) the mode
(half-up / half-even / truncate); (ii) the point (per line, per document, per journal entry);
(iii) whether discount and tax computation rounds at each intermediate step; (iv) how residue is
carried between the invoice chain and the journal chain. Answering only (i) is insufficient.

### E. Concrete options

Only the following are supportable; **no rounding mode is derivable from the sources**, so each
option is a policy choice, not a derivation.

**Option 1 — Single canonical quantisation helper, applied once per persisted document, half-up, mode and application point recorded in `FinancialPolicy`.**
**[SOURCE]-consistent:** the spec already requires one canonical policy home
(`financial_policies` versioned, `:1138`; `FinancialPolicyService` "CRUD, versioning, default
fallback", `:1286`). **[INFERENCE]** the half-up element is a recommendation, not a source
requirement.

**Option 2 — Quantise at every persisted `decimal(14,2)` column, no intermediate rounding.**
Directly follows the literal spec text (`:752`) and Postgres numeric semantics. **[INFERENCE]**
most defensible if "the persisted value is the truth and intermediates never persist".

**Option 3 — Store exact unrounded decimals and round only for presentation/reporting.**
Contradicts `:752`, which mandates `decimal(14,2)` on the columns themselves. Recorded for
completeness; weakest fit.

### F. Consequences

| | Schema | Migration | Security | Cross-domain | Implementation | Later phase |
|---|---|---|---|---|---|---|
| **1 Helper + policy** | none beyond 30 tables | none | none | policy becomes a financial dependency for every write | one helper, one call site convention | mode changeable without migration; best for multi-currency (Future) |
| **2 Per-column** | none | none | none | none | discipline-only; no shared helper | rigid; multi-currency may need revisiting |
| **3 Unrounded storage** | contradicts spec | would contradict spec | none | none | highest precision cost | would require amending the frozen schema chapter |

### G. Recommended resolution

**[INFERENCE]** Option 1, because the spec already provides a versioned, institution-scoped,
supersedable policy mechanism (`:316`, `:1138`) and because multi-currency is Future (`:1789`) — a
policy-stored mode avoids a future migration when per-currency exponent handling is needed.
Option 2 is the closest literal reading of `:752` and the lowest-complexity choice.

**This brief does not choose a rounding mode**, because no source supports any specific mode.
Choosing one is a policy decision for the owner, and it should be recorded in `FinancialPolicy`
rather than hard-coded, whichever option is taken.

### H. Exact decision required

State the rounding mode; state the quantisation point (per line, per document, or per persisted
column); state whether discount and tax round at each intermediate step; and state how residue is
reconciled between the invoice chain (`:825-833`) and the journal chain (`:1071-1072`) so that
BR-013's balance invariant holds on every commit.

---

# PART II — REQUIRED DECISIONS (D-9 … D-18)

---

## D-9 — Gateway provider set and secret custody

**Class: REQUIRED — DEPENDENT on D-2 (configuration ownership)**

**Issue.** Which providers ship in Phase 6, and where do credentials live?

**Source evidence.** **[SOURCE]** Paystack `Active`, Flutterwave `Active`, Stripe `Future`
(`Finance Engineering.md:1712-1714`). Adapter interface: `initiateTransaction`,
`verifyTransaction`, `processWebhook`, `getTransactionStatus` (`:1701-1706`). Security: keys
"encrypted at rest" (`:1729`), "Secret keys are never exposed in API responses" (`:1732`).
**[SOURCE]** `payment_gateway_configs` stores `public_key`, `secret_key`, `webhook_secret` each
"encrypted", plus `config json` (`:1119-1123`), UNIQUE
`(tenant_id, institution_id, name)` (`:1144`). **[SOURCE]** Roadmap P6.3 is titled
"**Paystack** integration" and lists no other provider (`MASTER_SMS_ROADMAP.md:700-712`).
**[SOURCE]** Gateway failover/retry is `Future` (`:1788`).

**Current implementation.** **[SOURCE]** No gateway SDK or HTTP client for any provider in
`apps/api/package.json:22-46`. No `PaymentGatewayConfig` model. `Payment.externalRef String?`
(`finance.prisma:67`) is a nullable, non-unique free-text column.

**Conflict/ambiguity.** The roadmap scopes P6.3 to Paystack alone; the frozen spec marks two
providers Active. Encryption-at-rest has no precedent in the repository — no encrypted column
exists anywhere. `externalRef` cannot serve as a gateway reference: it is nullable and unconstrained.

**Options.** (1) Paystack only in Phase 6, Flutterwave deferred — aligns with the roadmap; leaves
the frozen "Active" label unfulfilled. (2) Both Active providers — fulfils the frozen spec;
doubles signature schemes and reconciliation mappings. (3) Both plus Stripe — contradicts
`Future` (`:1714`).

**Consequences.** Option 1: smallest, roadmap-aligned, no spec amendment needed for Phase 6 scope.
Option 2: needs two signature verifiers, two payload parsers, and two currency mappings
(`:1712-1713`); the `gateway_provider` enum (`:1118`) already allows it. Option 3: premature.
**Independent of provider count:** encryption-at-rest must be specified regardless, and must not be
routed through `financial.*` JSON if D-2 Option 2 is chosen (those values are Institution-readable).

**Decision required.** Confirm the Phase 6 provider set; state the encryption mechanism for
`public_key`/`secret_key`/`webhook_secret`; confirm that credentials are never stored in
`institution_configurations`; state whether `config json` may hold secrets or is display-only.

---

## D-10 — Unauthenticated callback contract

**Class: REQUIRED — DEPENDENT on D-9**

**Issue.** How is `/api/v1/finance/gateways/callback` authenticated and ordered?

**Source evidence.** **[SOURCE]** Callback path and flow (`:1716-1725`): provider sends webhook →
"GatewayService validates signature via `processWebhook()`" (`:1722`) → `GatewayTransaction`
updated → `PaymentConfirmed` or `PaymentFailed` event. **[SOURCE]** "Webhook signatures are
verified before processing" (`:1730`). **[SOURCE]** `gateway_transactions` stores
`gateway_response json` "full provider response" (`:894`) and `gateway_reference varchar(200)`
"provider transaction ID" (`:893`).

**Current implementation.** **[SOURCE]** No webhook route exists. `PermissionGuard` fails open
when no metadata is present (`permission.guard.ts:14-16`); `ObjectScopeGuard` returns `true`
immediately for `authOnly` (`object-scope.guard.ts:42`) and for absent scope (`:42`).

**Conflict/ambiguity.** The route is unauthenticated by design, but the repository's default for a
route without decorators is **permit**, not deny. Nothing in the current guard stack distinguishes
"intentionally public" from "undecorated". The spec fixes the *order* (verify then process) but
not the mechanism: no raw-body capture is specified, and signature schemes are provider-specific.
Finally, §9.6 dedup keys on `eventId` (`:1330`) and §9.7 stores processed `eventId` values with a
72-hour TTL (`:1348`), but **provider webhooks do not carry a Finance `eventId`** — they carry
`gateway_reference` (`:893`). The existing dedup mechanism therefore cannot collapse provider
replays.

**Options.** (1) Provider-discriminated callback with a shared route, per-provider signature
verification before body parsing, and a webhook idempotency key derived from
`(gateway_config_id, gateway_reference)` — the last is **[INFERENCE]**, since no source names a key.
(2) One callback route per provider.

**Consequences.** Both: no schema change if the idempotency key is enforced in the service rather
than the schema — but note `gateway_transactions` has **no unique constraint** in §7.3 (`:1127-1144`),
so DB-level replay protection is currently absent. Option 2 multiplies routes. Neither option can
rely on the existing `eventId` dedup.

**Decision required.** State the discriminator mechanism; state whether signature verification
precedes JSON parsing and how the raw body is preserved; state the webhook idempotency key and its
enforcement layer; state whether a unique constraint is added to `gateway_transactions`.

---

## D-11 — ObjectScopeGuard registry and fail-open behaviour

**Class: REQUIRED — DEPENDENT on D-5**

**Issue.** How are Finance models scoped, and is the existing short-circuit acceptable?

**Source evidence.** **[SOURCE]** TI-001: institution A queries institution B's invoices (same
tenant) → "404 or empty"; TI-002: unassigned institution → 403 (`:1661-1662`). **[SOURCE]**
`institution_id` present on all frozen entities via BR-01 (`:324`). **[SOURCE]** ~30 Finance
tables, each with `institution_id` in the unique constraints (`:1129-1144`).

**Current implementation.** **[SOURCE]** `selectMap` (`:198-283`) registers Identity, People,
Institution, and Academic models — **no Finance model**. Unregistered names throw
`ForbiddenException` (`:286-288`). **[SOURCE]** Three fail-open short-circuits when
`params.id` is absent or `model` is unset: `:90-92`, `:119-121`, `:169-171`. Only `params.id` is
read (`:88`, `:117`, `:167`). **[SOURCE]** Frozen route
`GET /api/v1/finance/invoices/student/:studentId` (`:1481`) uses `:studentId`.

**Conflict/ambiguity.** Adding Finance models to the registry is mechanical. The fail-open
behaviour is the substantive question: on every list route — which is most Finance reads — the guard
contributes nothing, so tenant/institution filtering must come from repository predicates. On
`:studentId`-style routes the guard is not merely weak, it is inert, and the DTO-level student id
becomes the only filter.

**Options.** (1) Register all Finance models and require service-layer predicates on every list
route; add an explicit lint/decorator rule so no Finance route omits `@ObjectScope`. (2) Extend
the guard to read a declared parameter name instead of hard-coding `params.id`. (3) Add a Finance
scope type (required if D-5 Option 2 is chosen).

**Consequences.** Option 1: smallest, matches how Academics already works — e.g.
`enrollment.controller.ts:66,73,81` pairs `@ObjectScope({ type: 'institution', model: 'studentClassEnrollment' })`
with a service that filters (`enrollment.service.ts:79-89`). Option 2: a Phase 2 guard change,
outside Finance scope. Option 3: required only under D-5 Option 2.

**Decision required.** Confirm that list-route filtering is a Finance service obligation rather
than a guard obligation; confirm whether `params.id`-only resolution is acceptable for the frozen
`:studentId` route or must be extended; confirm the Finance model list to register.

---

## D-12 — Legacy Finance table disposition

**Class: REQUIRED — destructive-migration gate. DEPENDENT on D-3, D-6, D-8**

**Issue.** Archive, replace, or migrate the five legacy Finance tables?

**Source evidence.** **[SOURCE]** Frozen constraints require `institution_id` and tenant-scoped
uniques: `invoices` UNIQUE `(tenant_id, institution_id, invoice_number)`,
`payments` UNIQUE `(tenant_id, institution_id, reference)` (`:1132-1133`). **[SOURCE]** BR-01
"Every entity is tenant-scoped and institution-scoped" (`:324`). **[SOURCE]** Frozen lifecycles
(`:280-318`) use `Confirmed` for Payment and `Published` for Invoice. **[SOURCE]** Phase 5
established archive-not-rewrite as its own decision — five `NOT VALID` constraints each commented
`'NOT VALID (D-1 archive): legacy ... preserved; see docs/PHASE_5_MIGRATION_REPORT.md'`
(migration `:1157, 1164, 1168, 1174, 1178`).

**Current implementation.** **[SOURCE]** `finance.prisma` (117 lines), five models, each with
defects against the frozen spec:

| Model | Defect | Evidence |
|---|---|---|
| `FeeStructure` | `Decimal(10,2)`; `academicYearId` required + optional `termId`, but BR-029 (`:352`) requires **session** scoping; `status UserRoleStatus` (ACTIVE/INACTIVE/SUSPENDED) cannot express `Draft → Published` (`:284`) | `:1-26` |
| `Invoice` | no `institutionId` (**BR-01 violation**); no `version`; no `createdBy`/`updatedBy`/`deletedBy`; `status InvoiceStatus` has `PENDING` not `Published` and lacks `Generated`/`WrittenOff` (`:288`); `balance` naming differs from `outstanding_balance` (`:832`); `@@unique([tenantId, invoiceNumber])` lacks `institutionId` (`:53`) | `:28-57` |
| `Payment` | no `institutionId`; no `version`; `reference String @unique` is **globally** unique vs frozen tenant+institution scope (`:1133`); `status` uses `COMPLETED` not `CONFIRMED` (`:290`); `externalRef` nullable and unconstrained; no `PaymentMethod.POS` (frozen spec `:46` requires POS) | `:59-81` |
| `Scholarship` | no `institutionId`; no `version`; `status UserRoleStatus` cannot express `Closed` (`:302`, V-SCH-05 `:637`); `amount`+`percentage` conflate fund and award, so BR-024 (award ≤ fund limit, `:347`) is unenforceable; no `fund_limit`/`awarded_amount` | `:83-101` |
| `Refund` | no `institutionId`; no `version`; `status PaymentStatus` reuses the **payment** enum, so the frozen `Requested → Approved/Rejected → Processed` (`:294`) is unrepresentable; no approval fields | `:103-117` |

**[SOURCE]** **[INFERENCE]** Four of five models violate BR-01 outright; **none** has a `version`
column, so the frozen optimistic-concurrency rule (`:67`, `:1346`) and roadmap P6.2 "protect balance
calculations" have no substrate in the legacy tables.

**Options.** (1) Archive all five, create the frozen 30 fresh — follows the Phase 5 D-1 precedent;
the archive path is already documented. (2) Migrate rows into new tables — requires a
transform for 9 demo rows whose shape cannot represent the target (no `institutionId` to migrate
from on 4 models). (3) In-place `ALTER` — destructive; explicitly gated.

**Consequences.** Option 1: no data loss (rows preserved), matches precedent, but any reader of the
5 tables breaks. Option 2: mapping is lossy or impossible for 4 of 5 models; effort buys nothing
for demo-scale data. Option 3: **forbidden by the gate** — a destructive Finance migration.

**Decision required.** Confirm archive-then-create for all five legacy tables; confirm whether the
6 seeded invoices and 3 fee structures are retained in the archive or discarded; confirm the
`Decimal(10,2)` → `decimal(14,2)` widening is unnecessary because the tables are replaced rather
than altered; and confirm which Finance-owned columns, if any, are dropped vs archived.

---

## D-13 — `NOT VALID` legacy Finance constraints

**Class: REQUIRED — DEPENDENT on D-12**

**Issue.** What happens to the five unvalidated foreign keys?

**Source evidence.** **[SOURCE]** Five constraints in
`20260924110000_p5_2_academic_management/migration.sql`, each with a
`COMMENT ON CONSTRAINT` recording the D-1 archive rationale: `book_loans_termId_fkey` (`:1156`,
Documents), `fee_structures_academicYearId_fkey` (`:1163`, `ON DELETE RESTRICT`),
`fee_structures_termId_fkey` (`:1167`, `ON DELETE SET NULL`),
`invoices_academicYearId_fkey` (`:1173`, `ON DELETE RESTRICT`), `invoices_termId_fkey` (`:1177`,
`ON DELETE SET NULL`).

**Current implementation.** **[SOURCE]** Per `docs/PHASE_5_MIGRATION_REPORT.md`, 3 orphaned
`fee_structures` and 6 orphaned `invoices` rows — all 9 are the demo rows from
`seed.ts:1193-1220`. **[SOURCE]** These are the *only* rows the legacy Finance tables hold.

**Conflict/ambiguity.** Four of five constraints are on Finance tables. If D-12 archives those
tables, the constraints become irrelevant; if the tables survive in any form, the constraints stay
`NOT VALID` indefinitely because validating them would fail on the orphans.

**Options.** (1) Archive the tables with the constraints unvalidated, matching Phase 5. (2) Validate
after repairing or deleting the 9 orphan rows — destructive to demo data.

**Consequences.** Option 1: no action, no risk, consistent precedent. Option 2: deleting 9 rows is
destructive and unnecessary for demo fixtures.

**Decision required.** Confirm that archiving the Finance tables leaves these four constraints
permanently unvalidated; confirm that `book_loans_termId_fkey` (Documents domain) is **out of
Phase 6 scope** and remains a Phase 7/8 concern; state whether the 9 orphan rows are repaired,
archived, or left in place.

---

## D-14 — Subscription billing ownership

**Class: REQUIRED — ownership. DEPENDENT on D-2**

**Issue.** Does Finance own subscription billing?

**Source evidence.** **[SOURCE]** ADR-015 assigns subscription billing to Finance
(`Institution Management Engineering.md:140`). **[SOURCE]** Finance excludes "Subscription
management (Institution Management)" (`Finance Engineering.md:48`). **[SOURCE]** Platform
Administration owns subscriptions and subscription renewal jobs
(`Platform Administration Engineering.md:49, 232, 281-288`; priority example `:184`, `:281`).

**Current implementation.** **[SOURCE]** No subscription or billing model exists in
`apps/api/prisma`. `platform.prisma` holds `SystemConfig`, `FeatureFlag`, `AuditLog` only.

**Conflict/ambiguity.** ADR-015 gives Finance a billing responsibility for a subscription whose
management Finance explicitly excludes, and whose platform-level machinery belongs to a later
phase. **[INFERENCE]** "Subscription billing" is also the clearest case where Finance's
double-entry model would apply to money *incoming* rather than tuition, which no Finance table
supports (no billing-account concept in the 30 tables).

**Options.** (1) Platform Administration owns subscription billing end-to-end; Finance is
uninvolved. (2) Finance provides the accounting primitive (a receivable/revenue journal entry) and
Platform Administration drives the process. (3) Defer until Platform Administration is built.

**Consequences.** Option 1: no Phase 6 work; simplest; leaves ADR-015 unfulfilled.
Option 2: requires Finance to model non-tuition revenue, which the frozen 30 tables do not
accommodate — the chart of accounts has `Tuition Revenue`/`Development Levy Revenue`/`Late Fee
Revenue` (`:1747`) but no subscription revenue account. Option 3: no Phase 6 impact.

**Decision required.** Confirm whether subscription billing is in Phase 6 scope; if yes, name the
owning domain and state how non-tuition revenue is represented in the chart of accounts; if no,
record ADR-015 as deferred to the Platform Administration phase.

---

## D-15 — Payment worker jobs

**Class: REQUIRED — not blocking**

**Issue.** What replaces the logging-only worker?

**Source evidence.** **[SOURCE]** Roadmap P6.5 (`:722-731`): define jobs, idempotent processing,
retry/backoff, permanent failures, record failures, test duplicate jobs. **[SOURCE]** Test
categories: Gateway (GW) 12 scenarios (`:1642`), Edge Cases (EDGE) 12 "Concurrent payments, race
conditions, gateway timeout, duplicate prevention" (`:1653`).

**Current implementation.** **[SOURCE]** `apps/api/src/workers/payment.worker.ts` (39 lines) —
`PAYMENT_VERIFY` and `PAYMENT_RECONCILE` only `logger.log` (`:22-27`); unknown types warn
(`:28-29`). **[SOURCE]** The queue and job names already exist — `queue.constants.ts:2`
(`PAYMENTS: 'payments'`), `:13-14` (`payment:verify`, `payment:reconcile`). Also present:
`email:receipt`, `bulk:invoices`, `report:pdf` (`:15, 23, 21`). **[SOURCE]** The retry/dead-letter
policy is **already locked by Phase 3** — `queue-options.ts:11` ("3 attempts, exponential backoff
with a 5s base"), `:4-9` ("NO separate DLQ infrastructure. Failed jobs ... retained ... 7 days"),
`:15-18` ("the caller MUST supply a deterministic `jobId`"), `attempts: 3` (`:29`), `backoff`
5s exponential (`:33-36`), `removeOnFail: { age: 604800 }` (`:38`), `QUEUE_CONCURRENCY = 5` (`:42`).

**Conflict/ambiguity.** Less open than the scope report implies: names and policy exist; only the
handlers, deterministic job IDs, and failure recording are missing. **[SOURCE]** "Record failures"
(P6.5) has **no substrate** — no `FailedJobRecord` model, no `BackgroundJobFailed` event, and no
failed-job table exists anywhere in `apps/api/src` or the Prisma schema. BullMQ's failed state is
currently the only record.

**Options.** (1) Implement handlers under the existing Phase 3 policy; treat BullMQ failed state
as the failure record. (2) Add a `FailedJobRecord` table — but `Platform Administration
Engineering.md` assigns background-job administration to Phase 7 (`:232`, `:2981`), so this would
pre-empt a later phase.

**Consequences.** Option 1: no schema change, immediately consistent with locked policy; weaker
"record failures" compliance (no queryable Finance-side record). Option 2: satisfies P6.5
literally but takes ownership of a Phase 7 concern.

**Decision required.** Confirm the Phase 3 retry/dead-letter policy governs Finance jobs unchanged;
state the deterministic `jobId` format per job type (required by `queue-options.ts:15-18`);
confirm whether BullMQ failed state satisfies "record failures" or a Finance-owned failure record
is required; and state the job set beyond `payment:verify` / `payment:reconcile` (e.g. late-fee
accrual, period close).

---

## D-16 — Financial periods and late-fee accrual

**Class: REQUIRED — not blocking. DEPENDENT on D-8**

**Issue.** How are financial periods opened/closed, and how are daily late fees accrued?

**Source evidence.** **[SOURCE]** BR-014 "Financial periods align with academic sessions" (`:337`).
`financial_periods` has `academic_session_id uuid FK → (Academic Management sessions)` (`:1108`),
`status` enum `OPEN, CLOSING, CLOSED` (`:1111`), UNIQUE `(tenant_id, institution_id, name)`
(`:1143`). **[SOURCE]** Period rules (`:1771-1777`): "Only OPEN periods accept journal entries";
"Closing a period: validate all entries are balanced, compute final balances"; "Closed periods are
read-only"; "Period closing creates an opening balance entry for the next period". Lifecycle
`Open → Closing → Closed` (`:314`). **[SOURCE]** BR-018 "Late payment penalties are calculated
daily on overdue amounts" (`:341`); `late_fees` has `rate_applied decimal(5,2)` "daily rate
percentage" (`:1032`). **[SOURCE]** `account_balances` UNIQUE
`(tenant_id, ledger_account_id, financial_period_id)` (`:1142`).

**Current implementation.** **[SOURCE]** `AcademicSession` exists — `academic.prisma:65`. **[SOURCE]**
No `FinancialPeriod`, `AccountBalance`, `JournalEntry`, or `LateFee` model exists. **[SOURCE]** No
scheduler: no `@Cron`, no `SchedulerRegistry`, no repeatable-job config anywhere in `apps/api/src`,
and **no `@nestjs/schedule` dependency** (`package.json:22-46`).

**Conflict/ambiguity.** "Calculated daily" (BR-018) and "scheduled reconciliation" (roadmap P6.4,
`:717`) both require a scheduler that does not exist, and the spec that owns scheduling
(`Platform Administration Engineering.md:232`, `:2981`) is a later phase. **[INFERENCE]** This is a
cross-phase dependency the scope report did not isolate: P6.4 cannot be completed as written
without either a new scheduling dependency or a self-scheduling mechanism inside the worker.

**Options.** (1) Self-scheduling: the `payments` worker enqueues the next run (uses existing BullMQ,
no new dependency). (2) Add a scheduling dependency — a new external dependency, requiring
authorisation. (3) Defer scheduled reconciliation to the Platform Administration phase and ship
manual reconciliation runs.

**Consequences.** Option 1: no new dependency; conforms to the existing queue policy; adds a
recurring-job pattern that Phase 7 may later standardise. Option 2: introduces an unauthorised
dependency. Option 3: leaves roadmap P6.4 "Implement scheduled reconciliation" (`:717`) undelivered
in Phase 6. Period *state machine* work (`:1771-1777`) is unaffected by this choice and can proceed
either way.

**Decision required.** Choose the scheduling mechanism for daily late-fee accrual and scheduled
reconciliation; confirm whether `CLOSING` is a distinct persisted state or a transaction phase;
confirm the accrual interaction with concurrently published invoices (relates to D-17); confirm
whether period close may be run by BURSAR or requires elevated authority (relates to D-7).

---

## D-17 — Invoice numbering and gateway-reference uniqueness

**Class: REQUIRED — not blocking. DEPENDENT on D-3, D-10**

**Issue.** How is gap-free institution-scoped invoice numbering produced under concurrency, and
what makes a gateway reference unique?

**Source evidence.** **[SOURCE]** BR-017 "Invoice numbering is sequential and institution-scoped
(gap-free)" (`:340`). **[SOURCE]** `invoices` UNIQUE `(tenant_id, institution_id, invoice_number)`
(`:1132`); index `idx_inv_number` (`:1154`). **[SOURCE]** `journal_entries` UNIQUE
`(tenant_id, institution_id, entry_number)` (`:1141`) — same pattern for journal numbering.
**[SOURCE]** V-PAY-03 "Reference: required, unique" (`:607`). **[SOURCE]** `gateway_transactions`
`gateway_reference varchar(200)` (`:893`) with **no unique constraint** in §7.3 (`:1127-1144`).
**[SOURCE]** TI-006 "Cross-tenant invoice numbers | Separate sequences per institution" (`:1666`).

**Current implementation.** **[SOURCE]** `Invoice.invoiceNumber String` with
`@@unique([tenantId, invoiceNumber])` (`finance.prisma:35, 53`) — tenant-scoped, missing
`institutionId`, and with no sequence mechanism. **[SOURCE]** `Payment.reference String @unique`
(`:66`) — **globally** unique. **[SOURCE]** No sequence table, no `AdvisoryLock`, no counter
entity exists.

**Conflict/ambiguity.** "Gap-free" (BR-017) is incompatible with a `max()+1` read under
concurrency, and incompatible with retry-after-failure unless the number is reserved inside the
same transaction. The unique constraints also disagree with the frozen scope: legacy `reference` is
global, frozen is tenant+institution. Separately, `payment_allocations` UNIQUE
`(tenant_id, payment_id, invoice_id)` (`:1134`) permits only one allocation row per
payment/invoice pair — so a partial allocation later completed must **update** the existing row
rather than insert, which is an idempotency-relevant design fact.

**Options.** (1) A per-institution counter row updated inside the publishing transaction.
(2) A database sequence per institution. (3) Adopt the existing `@unique` constraints and accept
that gaps are possible. **[INFERENCE]** Option 3 contradicts BR-017's "gap-free" and is listed for
completeness only.

**Consequences.** Option 1: one counter table; serialises numbering per institution, which also
simplifies the concurrent-payment test (`:1653`). Option 2: sequences are non-transactional, so
gaps reappear on rollback — weaker fit for "gap-free". Option 3: violates a stated business rule.
Gateway reference: a unique constraint on `(gateway_config_id, gateway_reference)` would give
DB-level replay protection; the frozen §7.3 does not specify one, so this is a spec amendment.

**Decision required.** Choose the numbering source; confirm whether "gap-free" is absolute or
best-effort; confirm whether the legacy global `Payment.reference` uniqueness is replaced by the
frozen tenant+institution scope; and state whether a unique constraint is added to
`gateway_transactions`.

---

## D-18 — Seed data and the "receipts" roadmap item

**Class: REQUIRED — not blocking**

**Issue.** What happens to the 9 legacy Finance seed rows, and what is "receipts"?

**Source evidence.** **[SOURCE]** Roadmap P6.1 lists "receipts" (`:685`) and "expenses" (`:686`).
**[SOURCE]** Finance spec:46 lists payment processing "online/offline/cash/bank transfer/POS" and
does **not** list receipts. **[SOURCE]** Outstanding Items: "High | **Payment receipt PDF
generation** | Implementation" (`:1785`). **[SOURCE]** Documents & Learning explicitly excludes
"Billing, Payments, **Receipts ownership** (Finance)" (`Documents & Learning Engineering.md:51`).
**[SOURCE]** `JOB_TYPES.EMAIL_RECEIPT = 'email:receipt'` exists (`queue.constants.ts:15`).

**Current implementation.** **[SOURCE]** `seed.ts:1193-1220` creates 3 `FeeStructure` rows
(Tuition 450000, Hostel 120000, Transport 80000, NGN) and 6 `Invoice` rows (2 students × 3 fees).
**[SOURCE]** `Payment.receiptUrl String?` (`finance.prisma:71`) exists as a nullable column.

**Conflict/ambiguity.** **[INFERENCE]** "Receipts" is resolved by two converging signals: the
frozen spec treats it as PDF generation owned by Finance (`:1785`), and Documents excludes receipt
ownership from itself (`:51`). So receipts is a **document-generation capability, not a Finance
entity** — which is why no `receipts` table appears among the 30. This differs from `expenses`
(D-1), where no equivalent treatment exists anywhere. The legacy `receiptUrl` column has no
generator behind it.

**Options.** (1) Treat receipts as PDF generation in Phase 6, reusing `REPORT_PDF`/`email:receipt`
job patterns; no table. (2) Add a `receipts` entity — no source supports its shape.

**Consequences.** Option 1: satisfies the roadmap line without a schema addition; consistent with
`:1785` and with Documents' exclusion. Option 2: invents an entity. Seed rows: if D-12 archives the
tables, the 9 rows are archived; if seed must produce a working demo, new seed data against the
frozen schema is needed — a decision that follows D-12 rather than preceding it.

**Decision required.** Confirm receipts = PDF generation (not an entity); confirm disposition of the
9 legacy seed rows; and confirm whether Phase 6 seeds demo data against the new frozen schema.

---

# PART III — DECISION DEPENDENCY GRAPH

Dependencies below are derived only from evidence cited in Parts I–II.

```
                        ┌─────────────────────────────┐
                        │ D-1  Expenses               │  independent
                        │ (roadmap vs frozen spec)    │
                        └─────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────┐
   │  FOUNDATION: ownership + configuration + currency            │
   │                                                              │
   │  D-2  financial.* vs FinancialPolicy / PaymentGatewayConfig  │
   │    │                                                         │
   │    ├──► D-3  canonical currency                              │
   │    │         (needs the owner chosen in D-2)                 │
   │    │                                                         │
   │    └──► D-9  gateway provider set + secret custody           │
   │              (secrets cannot live in financial.* JSON)       │
   └──────────────────────────────────────────────────────────────┘
                    │                    │
                    ▼                    ▼
   ┌──────────────────────────┐   ┌──────────────────────────────┐
   │ D-14 subscription billing│   │ D-10 callback + idempotency  │
   │ (depends on D-2 owner)   │   │ (depends on D-9 providers)   │
   └──────────────────────────┘   └───────────┬──────────────────┘
                                               │
   ┌───────────────────────────────────────────┴──────────────────┐
   │  ACCESS MODEL                                                │
   │                                                              │
   │  D-5  payer / object scope                                  │
   │    │       (decides staff-only vs relational vs new model)   │
   │    └──► D-11 ObjectScope registry + fail-open behaviour      │
   └──────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────┐
   │  TRUST + ARITHMETIC                                          │
   │                                                              │
   │  D-6  payment/refund state authority                        │
   │    │       (must precede any Finance write path)            │
   │    │                                                         │
   │  D-8  rounding + balanced entries                           │
   │    │       (must precede journal posting + allocation)      │
   │    │                                                         │
   │  D-7  roles/permissions/guards                               │
   │    │       (threshold authority needs D-6 state to act on) │
   │    └──► D-17 numbering + reference uniqueness               │
   └──────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────┐
   │  EVENTING                                                   │
   │                                                              │
   │  D-4  envelope + naming + consumer ownership                │
   │    └──► D-17 (unique gateway ref for replay dedup)          │
   └──────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────┐
   │  PERSISTENCE  (depend on D-3, D-6, D-8)                     │
   │                                                              │
   │  D-12 legacy table disposition                               │
   │    └──► D-13 NOT VALID constraints                          │
   │                                                              │
   │  D-18 seed rows + receipts (depends on D-12 outcome)       │
   └──────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────┐
   │  OPERATIONS  (no blocking predecessors)                     │
   │                                                              │
   │  D-15 payment worker jobs                                    │
   │  D-16 periods + late fees (D-8 for accrual arithmetic)      │
   └──────────────────────────────────────────────────────────────┘
```

**Derived dependency statements.**

1. **D-2 precedes D-3.** BR-015 ("fixed after first invoice") is unenforceable until the owning
   domain and authoritative field are named, because the constraint's enforcement point is a write
   path in whichever domain owns it.
2. **D-2 precedes D-9.** Whether gateway credentials may live in `financial.*` depends on whether
   that namespace is Finance-owned or Institution-readable.
3. **D-9 precedes D-10.** Per-provider signature verification and the callback discriminator depend
   on how many providers ship.
4. **D-5 precedes D-11.** A new scope type is required only if a relational (payer) rule is adopted;
   staff-only scope needs registry entries only.
5. **D-6 precedes D-7's authority half.** `FinancialAuthorityGuard` acts on refund/write-off state;
   that state must be unambiguously Finance-owned before authority over it is meaningful.
6. **D-8 precedes D-16's accrual arithmetic** and any journal-posting work under D-12.
7. **D-12 precedes D-13 and D-18.** Constraint disposition and seed-row disposition both follow the
   archive/replace decision.
8. **D-4 is independent of D-1, D-2, D-3, D-6, D-7, D-8** and can be decided in parallel, though its
   `PersonMerged` sub-question interacts with D-5 if D-5 Option 2 is chosen.

**Minimum decision rounds.** The graph contains two independent roots of size one (D-1, D-4), a
foundation chain (D-2 → D-3, D-9 → D-10), an access chain (D-5 → D-11), a trust/arithmetic group
(D-6, D-7, D-8 → D-17), and a persistence tail (D-12 → D-13, D-18). Three rounds suffice:
**Round 1** = D-1, D-2, D-4, D-5, D-6, D-7, D-8; **Round 2** = D-3, D-9, D-11, D-12, D-15, D-16;
**Round 3** = D-10, D-13, D-14, D-17, D-18.

---

# PART IV — RECOMMENDED DECISION ORDER

This is an engineering dependency order derived from the graph above, not a ranking of preference.
The objective is the smallest sequence of decisions that unlocks the rest.

**Round 1 — settle the ownership and trust foundations (7 decisions).**
These are mutually independent, so they can be taken together in one session. Nothing else can be
finalised before them.

1. **D-2 — financial configuration ownership.** First, because D-3, D-9, and D-14 all branch from
   it, and because it determines whether a second writer of financial policy exists at all.
2. **D-1 — expenses.** Independent and cheap; resolves a one-line roadmap/frozen-spec conflict.
3. **D-6 — payment/refund state authority.** Must precede any Finance write path, and determines
   whether a Phase 4/5 remediation pass is authorised.
4. **D-8 — rounding and quantisation.** Must precede journal posting, allocation, and late-fee
   accrual; it is a policy choice with no derivation, so it needs a human, not more research.
5. **D-7 — roles, permissions, guards.** Depends on D-6 for the authority half; the permission
   catalogue (64 permissions) and `BURSAR` reuse are otherwise settled facts.
6. **D-5 — payer and object scope.** Determines whether Phase 6 is staff-only, which in turn
   unblocks D-11 and removes any People identity dependency.
7. **D-4 — event contract, naming, ownership.** Independent of the other six; take it in Round 1 so
   it does not become a late blocker for the Finance consumer module.

**Round 2 — resolve the branches (6 decisions).**
Each is now answerable because its Round 1 predecessor is fixed.

8. **D-3 — canonical currency** (needs D-2's owner).
9. **D-9 — providers and secret custody** (needs D-2 to know whether `financial.*` is safe for
   credentials).
10. **D-12 — legacy table disposition** (needs D-3, D-6, D-8 to know the target shape).
11. **D-11 — ObjectScope registry and fail-open behaviour** (needs D-5's access model).
12. **D-15 — payment worker jobs** (no blocking predecessor; executable immediately).
13. **D-16 — periods, late fees, scheduling** (needs D-8 for accrual arithmetic).

**Round 3 — close out (5 decisions).**

14. **D-10 — callback contract** (needs D-9).
15. **D-13 — `NOT VALID` constraints** (needs D-12).
16. **D-14 — subscription billing** (needs D-2).
17. **D-17 — numbering and reference uniqueness** (needs D-3, D-8, D-10).
18. **D-18 — seed data and receipts** (needs D-12).

**Why this order minimises rounds.** D-2 is the highest-leverage decision: it is the sole
predecessor of D-3, D-9, and D-14, and it constrains D-12. Taking it first collapses three later
questions into one answer. D-1 and D-4 are the only decisions with no predecessors at all, so
moving them into Round 1 removes them from the critical path entirely. D-15 has no predecessor and
could be taken at any time; it is placed in Round 2 only to keep Round 1 focused on the
load-bearing foundations.

**What remains blocked after all 18 decisions.** D-1 through D-8 are the eight gate blockers. All
eight must be resolved before any Phase 6 implementation begins. Resolving them lifts the
architectural block; it does not by itself satisfy the Phase 6 gate (roadmap `:748`: "No finance
feature is production-ready until payment and reconciliation tests pass"), which additionally
requires D-10, D-15, D-16, and D-17 to be implemented and tested.

---

# STATUS

> **Status as of 2026-09-29: RESOLVED.** The owner has answered this register. The analysis above
> is preserved as the point-in-time decision-preparation record; the authoritative answers are in
> **`docs/FINANCE_OWNER_DECISIONS_RECORD.md`**, reconciled into
> **`engineering/Finance Engineering.md` revision 1.8.0**.
>
> - **8 of 9** decisions resolved (D-2, D-3, D-4, D-6, D-7, D-8, D-12, plus D-5 as staff-only).
> - **D-1** remains deferred and undecided. It is a leaf with no dependents.
> - **One bounded item is open:** the aggregate-limit **numeric defaults** (max line amount, max
>   line count, max document total). The mechanism, storage, and reject-on-breach behaviour are
>   decided; the three values are not, and must not be inferred from `Decimal(14,2)`.
> - **D-9, D-10, D-11, D-13 … D-18** are outside the answered set. **D-13** remains downstream of
>   D-12 per the owner's instruction.
> - **Register-B is untouched.**
>
> The original status line is preserved below as the state at the time this brief was written.

---

No Finance code, schema, migration, seed, permission, guard, DTO, event, or test was created,
modified, or deleted during this pass. No dependency was installed. No completed phase was
modified. No Git history was changed. This document is the only file created by this pass.

**PHASE 6 — DECISION BRIEF COMPLETE; IMPLEMENTATION REMAINS BLOCKED PENDING ARCHITECTURAL DECISIONS.**

---

**Current status: READY FOR FINAL FINANCE IMPLEMENTATION PROMPT**, with the aggregate-limit numeric
defaults carried as an explicit configuration prerequisite that must fail closed until
owner-supplied values exist. No code, Prisma schema, migration, controller, service, DTO, guard,
People implementation, or Academics implementation was created or modified by the decision
recording pass. Nothing was committed.
