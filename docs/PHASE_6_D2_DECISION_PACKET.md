# Phase 6 D-2 Decision Packet

**Decision:** D-2 — Financial configuration ownership.
**Source of record:** `docs/PHASE_6_DECISION_BRIEF.md` lines 137–261 (D-2), plus
`docs/PHASE_6_SCOPE_VERIFICATION_REPORT.md` line 404.
**Gate state at time of writing:** HEAD `aae6309`, branch `phase/2-rbac`, working tree clean apart
from the Phase 6 gate documents.
**Status of this document:** preparation only. It records no decision and selects no option.

## 0. Note on the option set — deviation from the request template

The request asked for "the exact A–H options" and for a decision matrix with eight columns
`A`–`H`. **The brief does not contain an A–H option set for D-2.** Verified by direct reading of
`docs/PHASE_6_DECISION_BRIEF.md`:

- In the brief, `A`–`H` are the **analysis-section headings** applied identically to every blocker
  (D-1…D-8): A Decision title, B What the frozen sources say, C What the current repository says,
  D Exact conflict, E Concrete options, F Consequences, G Recommended resolution, H Exact decision
  required. They are not options.
- D-2's actual option set is **three** options, numbered `Option 1`, `Option 2`, `Option 3`, at
  brief lines 218, 223 and 228. No blocker in the brief has eight options (D-1: 3, D-2: 3, D-4: 4,
  D-5: 3, D-6: 3, D-7: 3, D-8: 3).

Because inventing options is prohibited, this packet carries the **three real options** with their
**exact names and definitions copied from the brief**, and the matrix uses columns `1 | 2 | 3`
instead of `A`–`H`. Every other requested element is present unchanged. The only deviation is the
column labels, which now match the actual option count.

The option names, definitions, consequences and recommendation in §4 and §5 are reproduced from the
brief. This packet does not merge, split, rename, or add to them.

---

## 1. Decision statement

D-2 must establish **one authoritative ownership model for institution financial configuration and
eliminate competing sources of truth**, by naming, for each of the following six concepts, the
single owning domain — Institution or Finance:

1. settlement currency
2. tax rules
3. invoice numbering
4. late-fee / penalty rules
5. gateway enablement
6. gateway credentials

It must then state whether `institution_configurations` retains a `financial.*` namespace and, if so,
whether that namespace is **authoritative**, a **read-only projection** of Finance tables, or
**removed**.

This is the decision required by the brief's section H verbatim
(`docs/PHASE_6_DECISION_BRIEF.md:254-259`):

> Name the single owning domain for each of: settlement currency, tax rules, invoice numbering,
> late-fee/penalty rules, gateway enablement, and gateway credentials. Then state whether
> `institution_configurations` retains a `financial.*` namespace, and if so whether it is
> authoritative, a read-only projection of Finance tables, or removed.

D-2 does not decide the canonical currency field (that is D-3), the provider set (that is D-9), the
disposition of legacy Finance tables (that is D-12), or subscription billing (that is D-14). D-2
decides **who owns the configuration**; those four decisions remain open afterwards.

---

## 2. Current-state evidence

Status vocabulary used below, per the request:

- **Implemented** — the field or table exists in the current Prisma schema.
- **Proposed** — defined in a frozen specification, with no corresponding Prisma model.
- **Duplicated** — more than one live or specified location can hold the same concept.
- **Untyped** — stored as a bare JSON/string value with no schema, validation, or per-category rule.

Authority is **not** inferred from a field merely existing. Where a field exists but no source
asserts that it is authoritative for the concept, this packet says so explicitly.

### 2.0 Shared substrate

| Item | Source | Model / section / field | Current meaning | Status |
|---|---|---|---|---|
| Generic configuration table | `apps/api/prisma/domains/institution-configuration.prisma:17-35` | `InstitutionConfiguration` — `key String`, `value Json`, `version Int @default(1)`, `@@unique([institutionId, key])` | Any key/value pair scoped to an institution. No category column, no schema, no default/override tier. | **Untyped**, implemented |
| Generic settings table | `institution-configuration.prisma:37-56` | `InstitutionSetting` — same shape plus `kind String @default("STRING")` | Same, with a free-text kind discriminator that no code reads. | **Untyped**, implemented |
| Configuration service | `apps/api/src/modules/institutions/institution-configurations.service.ts:42-89` | `list`, `findByKey`, `upsert` | Generic CRUD. `upsert` carries an optimistic-lock version check (`:73-77`) but performs **no** category validation. | **Untyped**, implemented |
| Settings service | `institution-configurations.service.ts` sibling `institution-settings.service.ts:82-201` | generic CRUD | Same pattern, no category awareness. | **Untyped**, implemented |
| `financial.*` namespace usage | repo-wide search of `apps/api/src` for `financial.`, `regional.`, `module.`, `automation.` | — | **Zero** namespace literals. The only matches are unrelated substrings (`events.module.tokens`, `EventEmitterModule.forRoot()`). | **Declared in spec, entirely unimplemented** |

Consequence: the `financial.*` namespace is a **specification-only** surface. Nothing in the running
system can read, write, or validate it today.

### 2.1 currency

| Source | Model / section / field | What it currently means | Status |
|---|---|---|---|
| `apps/api/prisma/domains/institution.prisma:72` | `Institution.currency String @default("NGN")` | A single currency string on the institution record. | Implemented, **duplicated** |
| `apps/api/prisma/domains/finance.prisma:11` | `FeeStructure.currency String @default("NGN")` | Per-row currency on a legacy fee structure. | Implemented, **duplicated** |
| `apps/api/prisma/domains/finance.prisma:64` | `Payment.currency String @default("NGN")` | Per-row currency on a legacy payment. | Implemented, **duplicated** |
| `engineering/Finance Engineering.md:1041` | `financial_policies.policy_type` = `CURRENCY` | Finance intends a versioned policy row per institution. | **Proposed** |
| `engineering/Finance Engineering.md:338` | BR-015 — "Currency is institution-scoped and fixed after first invoice" | A rule that prescribes no field. | Rule only, **unimplementable as written** |
| `engineering/Institution Management Engineering.md:995` | `regional.*` — "Time zone, locale, language, date format, **currency format**" | Display formatting only, distinct from settlement. | **Untyped**, unimplemented |
| `engineering/Institution Management Engineering.md:992` | `financial.*` | Does not name currency at all. | **Untyped**, unimplemented |

Four distinct homes exist. **No source designates any one of them authoritative.** The frozen Finance
spec does not name a field; BR-015 requires a write-path enforcement point that only the owner can
supply.

### 2.2 tax

| Source | Model / section / field | What it currently means | Status |
|---|---|---|---|
| `engineering/Finance Engineering.md:1041` | `financial_policies.policy_type` = `TAX` | Finance intends a per-institution tax policy. | **Proposed** |
| `engineering/Finance Engineering.md:339` | BR-016 — "Tax rules are configurable per institution" | Per-institution rule, no owner named. | Rule only |
| `engineering/Institution Management Engineering.md:992` | `financial.*` — "…payment gateways, **tax settings**" | Institution Admin owns tax settings. | **Untyped**, unimplemented |
| `apps/api/prisma` | No tax model, no tax column | Nothing exists. | **Absent** |

Two frozen specifications place tax on opposite sides, and neither side has any implementation.

### 2.3 numbering

| Source | Model / section / field | What it currently means | Status |
|---|---|---|---|
| `engineering/Finance Engineering.md:1041` | `financial_policies.policy_type` = `NUMBERING` | Finance intends a versioned numbering policy. | **Proposed** |
| `engineering/Finance Engineering.md:340` | BR-017 — "Invoice numbering is sequential and institution-scoped (gap-free)" | Requirement; gap-free is unimplementable without sequence storage. | Rule only |
| `engineering/Finance Engineering.md:1132` | `invoices` UNIQUE `(tenant_id, institution_id, invoice_number)` | A uniqueness constraint, not a sequence source. | **Proposed** constraint |
| `apps/api/prisma` | No sequence table, counter, or advisory lock | Nothing generates numbers. | **Absent** |
| `apps/api/prisma/domains/finance.prisma:35,53` | `Invoice.invoiceNumber` + `@@unique([tenantId, invoiceNumber])` | Legacy numbering; the unique key **omits `institutionId`**, unlike the frozen constraint. | Implemented, **misaligned** with frozen spec |

### 2.4 penalties

| Source | Model / section / field | What it currently means | Status |
|---|---|---|---|
| `engineering/Finance Engineering.md:1041` | `financial_policies.policy_type` = `PENALTY` | Finance intends a versioned penalty policy. | **Proposed** |
| `engineering/Finance Engineering.md:1026-1035` | `late_fees` table — `rate_applied decimal(5,2)`, `days_overdue`, `applied_date` | Storage for applied late fees. | **Proposed** |
| `engineering/Finance Engineering.md:341` | BR-018 — "Late payment penalties are calculated daily on overdue amounts" | Daily accrual rule. | Rule only |
| `engineering/Institution Management Engineering.md:992` | `financial.*` | Does not name penalties. | **Untyped**, unimplemented |
| `apps/api/prisma` | No `LateFee` model | Nothing exists. | **Absent** |

### 2.5 gateway enablement

| Source | Model / section / field | What it currently means | Status |
|---|---|---|---|
| `engineering/Finance Engineering.md:1122` | `payment_gateway_configs.is_active boolean` default true | Per-config enablement flag. | **Proposed** |
| `engineering/Finance Engineering.md:1710-1714` | Provider status table — Paystack **Active**, Flutterwave **Active**, Stripe **Future** | Platform-level provider maturity, not per-institution enablement. | Frozen, platform-scoped |
| `engineering/Finance Engineering.md:351` | BR-028 — "Gateway configuration is institution-scoped" | Config is per-institution. | Rule only |
| `engineering/Institution Management Engineering.md:996` | `module.*` — "Enabled modules, module-specific settings, **feature toggles**" | A second, Institution-owned enablement surface; input to `ModuleLicenseGuard` (`Finance Engineering.md:1317`). | **Untyped**, unimplemented |
| `MASTER_SMS_ROADMAP.md:700-712` | P6.3 Paystack-only | Phase 6 scope is narrower than the frozen three-provider set. | Roadmap constraint |
| `apps/api/prisma` | No `PaymentGatewayConfig` model | Nothing exists. | **Absent** |

### 2.6 gateway credentials

| Source | Model / section / field | What it currently means | Status |
|---|---|---|---|
| `engineering/Finance Engineering.md:1119-1121` | `payment_gateway_configs.public_key`, `secret_key`, `webhook_secret` — all "encrypted", `webhook_secret` nullable | The intended encrypted secret store. | **Proposed** |
| `engineering/Finance Engineering.md:1729` | "Gateway keys (public, secret, webhook secret) are encrypted at rest" | Mandatory encryption. | Frozen requirement |
| `engineering/Finance Engineering.md:1732` | "Secret keys are never exposed in API responses" | Mandatory non-disclosure. | Frozen requirement |
| `engineering/Institution Management Engineering.md:992` | `financial.*` — "…**payment gateways**…", Owner: **Institution Admin** | Places gateways in a namespace the Institution Admin can read. | **Untyped**, unimplemented |
| `apps/api/prisma` | No `PaymentGatewayConfig` model, no encryption code | Nothing exists. | **Absent** |

This is the sharpest conflict in D-2. `financial.*` is Institution-Admin-owned and ordinarily
readable through generic configuration CRUD, while the frozen Finance spec requires gateway secrets
to be encrypted and never exposed. A credential stored in `financial.*` would be readable by the
Institution Admin under the Institution spec's ownership row.

### 2.7 financial policy

| Source | Model / section / field | What it currently means | Status |
|---|---|---|---|
| `engineering/Finance Engineering.md:1037-1048` | `financial_policies` — `policy_type`, `policy_key`, `value json`, `description`, `version`, `effective_from`, `effective_to`, `status` (DRAFT/ACTIVE/SUPERSEDED) | A versioned, dated, institution-scoped policy record. | **Proposed** |
| `engineering/Finance Engineering.md:1138` | `financial_policies` UNIQUE `(tenant_id, institution_id, policy_type, policy_key, version)` | Per-institution versioning. | **Proposed** constraint |
| `engineering/Finance Engineering.md:316` | Lifecycle `Draft → Active → Superseded` | Versioning semantics. | Frozen |
| `engineering/Finance Engineering.md:1306`, `:1594-1598` | `FinancialPolicyController` at `/api/v1/finance/policies`; permissions `finance:policy:read/create/update` | A Finance-owned CRUD surface. | **Proposed** |
| `engineering/Finance Engineering.md:46` | In Scope — "configurable financial policies (currency, tax, numbering, penalties)" | Finance claims these four categories. | Frozen claim |
| `engineering/Finance Engineering.md:48` | Out of Scope — "**Institution configuration**, Licensing, Subscription management (Institution Management)" | The same document disclaims the surface it just claimed. | Frozen contradiction |
| `engineering/Finance Engineering.md:349` | BR-026 — "Finance owns all invoice calculation; other domains send billing requests" | Extends Finance ownership to calculation. | Frozen rule |
| `apps/api/prisma` | No `FinancialPolicy` model | Nothing exists. | **Absent** |

`Finance Engineering.md:46` and `Finance Engineering.md:48` contradict each other **within a single
frozen document**. This is not a cross-document dispute; it is internal to Finance.

### 2.8 payment gateway configuration

| Source | Model / section / field | What it currently means | Status |
|---|---|---|---|
| `engineering/Finance Engineering.md:1113-1123` | `payment_gateway_configs` — `name`, `provider` (PAYSTACK/FLUTTERWAVE/STRIPE), three encrypted key columns, `is_active`, `config json` | A Finance entity combining enablement, credentials, and provider config. | **Proposed** |
| `engineering/Finance Engineering.md:1144` | UNIQUE `(tenant_id, institution_id, name)` | Per-institution uniqueness. | **Proposed** constraint |
| `engineering/Finance Engineering.md:318` | Lifecycle `Active → Inactive` | Simple two-state lifecycle. | Frozen |
| `engineering/Finance Engineering.md:1207` | Listed among the 32 Finance models | It is a first-class Finance model. | Frozen |
| `engineering/Finance Engineering.md:1506-1509` | `/api/v1/finance/gateways`; permissions `finance:gateway:read/create/update/transact` | A Finance-owned API surface. | **Proposed** |
| `engineering/Institution Management Engineering.md:992` | `financial.*` — "payment gateways" | Institution Admin owns the same concept. | **Untyped**, unimplemented |

`payment_gateway_configs` is a **single table carrying all three of enablement, credentials, and
provider config**. D-2 must decide whether that table is the authoritative home, and whether the
`financial.*` duplicate is retired, projected, or removed.

### 2.9 Adjacent namespaces the brief records as colliding

Not part of the six decision concepts, but recorded by the brief as the same class of conflict
(`docs/PHASE_6_DECISION_BRIEF.md:163-167`):

- `module.*` (`:996`) — "Enabled modules, module-specific settings, feature toggles" — the licensing
  input for Finance's `ModuleLicenseGuard` (`Finance Engineering.md:1317`).
- `automation.*` (`:997`) — "Workflow rules, **approval chains**, notification triggers, scheduled
  tasks" — collides with BR-09 threshold-based refund approval (`:332`).

Both are unimplemented. They are listed here because any ownership model that retains a
`financial.*` namespace must also state where these two sit.

---

## 3. Why the current state is blocked

### 3.1 The documentary conflict

Two frozen specifications assert ownership of the same surface. `Finance Engineering.md:46` gives
Finance "configurable financial policies (currency, tax, numbering, penalties)" and "payment gateway
abstraction (Paystack, Flutterwave, Stripe)", and `:48` in the same document disclaims "Institution
configuration". `Institution Management Engineering.md:992` gives Institution Admin `financial.*`
covering "payment gateways" and "tax settings". The overlap is total for tax and gateways and
partial for currency.

### 3.2 The substrate cannot enforce any split

`institution-configuration.prisma:22` stores `value Json` and `:21` stores `key String`, with no
category column and no schema. Institution spec §11.2 requires two things that do not exist
(`:1004-1005`):

> `- Configuration values are JSON; schema validation applied per category`
> `- Platform defaults are applied during provisioning; Institutions may override`

Verified: no per-category validation, no default/override tier, and zero `financial.*` references
anywhere in `apps/api/src`. Therefore, **under every option**, a `financial.*` key and a
`financial_policies` row could both exist with divergent values and nothing would detect it. The
brief states this as the reason the ownership question and the validation question are separate
decisions, and that validation is a prerequisite for ownership being enforceable
(`docs/PHASE_6_DECISION_BRIEF.md:200-205`).

### 3.3 The security conflict is unconditional

`Finance Engineering.md:1729` and `:1732` require gateway secrets encrypted at rest and never exposed.
`Institution Management Engineering.md:992` places payment gateways in an Institution-Admin-owned,
ordinarily readable namespace. The brief records the conclusion
(`docs/PHASE_6_DECISION_BRIEF.md:207-214`) and marks one part **[INFERENCE]**: `financial.*` cannot
be the storage location for gateway secrets under any ownership split. The brief also states this
conclusion is **independent of the ownership choice** (`:250-252`), meaning it is decidable now and is
a prerequisite for D-9.

### 3.4 Downstream dependencies

From `docs/PHASE_6_DECISION_BRIEF.md:1556-1573` and the decision order at `:1581-1623`:

| Dependent | Blocked because | Source |
|---|---|---|
| **D-3 Currency** | BR-015 "fixed after first invoice" is unenforceable until the owning domain and authoritative field are named, because the enforcement point is a write path in whichever domain owns it. D-3 cannot name the canonical field among `Institution.currency`, a `financial_policies` CURRENCY row, or a per-row column. | Brief `:1558-1560`; D-3 listed as Round 2, "needs D-2's owner" (`:1609`) |
| **D-9 Providers/secrets** | Whether gateway credentials may live in `financial.*` depends on whether that namespace is Finance-owned or Institution-readable. D-9 must know the custody boundary before choosing the provider set and key storage. | Brief `:1561-1562`; D-9 "DEPENDENT on D-2 (configuration ownership)" (`:1070`); "needs D-2 to know whether `financial.*` is safe" (`:1610`); D-9 notes credentials must not be routed through `financial.*` if D-2 Option 2 is chosen (`:1101`) |
| **D-14 Subscription billing** | ADR-015 assigns subscription billing to Finance while `Finance Engineering.md:48` excludes subscription management; Platform Administration owns subscriptions. The billing side's configuration home is undetermined. | Brief `:1621`; `Institution Management Engineering.md:140`; `Finance Engineering.md:48` |
| **D-12 Legacy tables** | D-2 constrains what the legacy Finance tables may be replaced *with*. Four of five legacy models lack `institutionId`, and the per-row `currency` columns are duplicated homes that a D-2 outcome either preserves or requires removing. | Brief `:1625-1627` ("it constrains D-12"); D-2 Option 1 removes `financial.*`; D-3 Option 1 removes the per-row currency columns "with their tables" (`:331`) |
| **D-11 ObjectScopeGuard registry** | Recorded as dependent on D-5, not D-2. Listed here only to note it is **not** blocked by D-2. | Brief `:1565-1566` |
| **D-17 Numbering uniqueness** | Depends on D-3, D-8, D-10. Numbering ownership is part of D-2's concept list, but D-17's sequence mechanics are downstream of D-3. | Brief `:1622` |

D-2 is the highest-leverage decision in the graph: the brief records it as the sole predecessor of
D-3, D-9 and D-14, and as a constraint on D-12 (`:1625-1627`).

---

## 4. Exact decision options

The three options below are reproduced from `docs/PHASE_6_DECISION_BRIEF.md:216-231`. Names and
definitions are exact. No option is added, merged, split, or renamed.

### Option 1

- **Exact option name:** Finance owns all financial configuration; Institution's `financial.*` is
  retired or becomes read-only projection.
- **Exact definition (brief `:218-221`):** **[SOURCE]-supported.** Finance spec:46 already scopes
  Finance to financial policy, tax, numbering, penalties, gateways. Honours `Finance owns all invoice
  calculation` (`:349`, BR-026). Institution spec:987-997 must be amended to drop the Financial
  category.
- **What becomes authoritative:** `financial_policies` and `payment_gateway_configs`. The brief's F
  table (`:237`) records schema as "30 Finance tables only", migration as "none extra", and security
  as "Finance credentials stay encrypted and Finance-accessed".
- **What happens to competing/duplicate configuration:** the `financial.*` namespace is retired or
  demoted to a read-only projection of Finance tables. `Institution.currency` becomes a display
  concern rather than a settlement concern. The legacy per-row `currency` columns are addressed by
  D-3.
- **Which existing models/spec sections are affected:** `InstitutionConfiguration` /
  `InstitutionSetting` (the `financial.*` keys); `institution.prisma:72` `Institution.currency`;
  `finance.prisma:11,64` per-row currency; frozen sections `Institution Management
  Engineering.md:987-997` (amend to drop the Financial category) and `Finance Engineering.md:46`
  (retain).
- **Downstream decisions unlocked:** D-3 (Finance-owned policy table gives BR-015 an enforcement
  point), D-9 (secrets are Finance-accessible, satisfying `:1729`/`:1732`), D-14 (Finance billing
  side has a configuration home), D-12 (Finance tables are the replacement target).
- **Migration implications:** no extra migration beyond the Finance schema itself, per the brief's F
  table. **[INFERENCE]** Rows already written under a `financial.*` key would require a one-time
  backfill into `financial_policies`; no such rows exist today (zero references in `apps/api/src`),
  so the backfill is empty.
- **Security implications:** credentials remain in the Finance-owned encrypted table and stay
  Finance-accessed. The `financial.*` Institution-Admin read path is removed for secrets.
- **Operational implications:** Institution Admin loses the finance configuration UI the frozen
  Institution spec grants at `:992`; the brief's F table records this directly. The Finance
  configuration surface (`/api/v1/finance/policies`, `/api/v1/finance/gateways`) becomes the only one.
- **Main trade-offs:** removes all dual ownership and the divergence risk outright, and yields
  exactly one writer per concept — at the cost of amending a frozen specification
  (`Institution Management Engineering.md:987-997`) and removing an owner the Institution spec
  currently grants.
- **Risks/unknowns explicitly supported by the sources:** the brief states the option requires
  amending the Institution spec (`:221`). `Finance Engineering.md:48`'s exclusion of "Institution
  configuration" remains textually in tension with `:46` regardless of which side wins.

### Option 2

- **Exact option name:** Institution owns `financial.*` values; Finance owns typed policy + gateway
  credentials.
- **Exact definition (brief `:223-226`):** **[SOURCE]-supported** by Institution spec:992 +
  :999-1007 (defaults/override tier exists in the design) + Finance spec:46. Requires implementing
  per-category schema validation and the defaults/override tier, neither of which exists.
- **What becomes authoritative:** split by table — `institution_configurations` `financial.*` keys
  for values, `financial_policies` for typed policy, `payment_gateway_configs` for credentials. The
  brief's F table (`:238`) records schema as "Finance tables + typed JSON schema per category".
- **What happens to competing/duplicate configuration:** the `financial.*` namespace is promoted to
  authoritative for values. The brief's F table records the cross-domain consequence as "two write
  paths for the same concept" and the later-phase consequence as "dual ownership persists
  indefinitely".
- **Which existing models/spec sections are affected:** `institution-configuration.prisma:17-56`
  requires a category column and per-category validation; `institution-configurations.service.ts:42-89`
  and `institution-settings.service.ts:82-201` require category awareness;
  `Institution Management Engineering.md:999-1007` becomes an implementation obligation rather than
  design intent; `Finance Engineering.md:46`/`Institution Management Engineering.md:992` both stand.
- **Downstream decisions unlocked:** D-3 and D-9 both remain partly open — D-3 still must choose
  between `Institution.currency` and a policy row, and D-9 is explicitly conditioned on this option
  (brief `:1101` records that under Option 2 those values are Institution-readable). D-14 and D-12
  are constrained but not resolved.
- **Migration implications:** the brief's F table records "adds validation + default tiers". This is
  new infrastructure on the Institution side, not a Finance-schema change.
- **Security implications:** the brief's F table records a **risk** verbatim: "gateway secrets must
  be excluded from the JSON path or they become Institution-readable". The option as written assigns
  credentials to Finance, so the risk is managed by exclusion rather than by ownership.
- **Operational implications:** Institution Admin retains the configuration UI the Institution spec
  grants. Platform-default/override provisioning must be built before any value is trustworthy.
- **Main trade-offs:** requires no amendment to either frozen specification, but the brief's G
  section (`:247-248`) states the option "should be rejected in its current form: it reintroduces
  two write paths for financial policy, which is the condition BR-26-style single-ownership rules
  exist to prevent."
- **Risks/unknowns explicitly supported by the sources:** two write paths for the same concept
  (`:238`); the validation and default/override infrastructure does not exist (`:226`); secrets must
  be explicitly fenced off the JSON path (`:238`).

### Option 3

- **Exact option name:** Split by category: Institution owns non-secret display/tax/gateway
  *enablement*; Finance owns settlement currency, numbering, penalties, and encrypted credentials.
- **Exact definition (brief `:228-231`):** **[SOURCE]-consistent** with the `regional.*` ("currency
  **format**") vs financial distinction at `Institution Management Engineering.md:995`. Requires an
  explicit rule for which of the 18 financial concepts in Finance spec:46 sits on which side.
- **What becomes authoritative:** both sides, by category. The brief's F table (`:239`) records schema
  as "both, plus a mapping table or rule set" and migration as "none".
- **What happens to competing/duplicate configuration:** neither side is wholly retired; a written
  category→owner map is required. The brief's F table records "ambiguity risk is highest" and
  "categories will drift".
- **Which existing models/spec sections are affected:** `institution-configuration.prisma:17-56` for
  the Institution side; `financial_policies` and `payment_gateway_configs` for the Finance side;
  `Institution Management Engineering.md:995` (`regional.*` currency **format**) becomes the
  precedent for the display/settlement split; a new category→owner rule set is required, which does
  not exist in either spec.
- **Downstream decisions unlocked:** D-3 is answered for the settlement side (Finance owns
  settlement currency, per the option name); D-9 is answered for credentials (Finance owns encrypted
  credentials); D-14 and D-12 remain constrained by the rule set.
- **Migration implications:** the brief's F table records "none", on the basis that no new mapping
  table is required beyond a written rule.
- **Security implications:** the brief's F table records "separation achievable if secrets are
  explicitly Finance-only". Credentials are on the Finance side by definition of the option.
- **Operational implications:** the brief's F table records the largest governance surface, and that
  this is "hardest to change later; categories will drift".
- **Main trade-offs:** best matches the existing `regional.*` vs financial distinction at
  `Institution Management Engineering.md:995` and satisfies the credential requirement without
  amending either frozen spec — but requires the owner to author a category→owner rule that covers
  all 18 in-scope concepts at `Finance Engineering.md:46`, which no source provides.
- **Risks/unknowns explicitly supported by the sources:** ambiguity risk highest and categories will
  drift (`:239`); the rule set is a new artefact not present in either frozen specification (`:231`).

### Note carried from the brief (section G, `docs/PHASE_6_DECISION_BRIEF.md:241-252`)

The brief **does** provide a recommendation, so it is reproduced here as the brief's own, tagged as
the brief tagged it. **This packet does not endorse it and selects nothing.**

> **[INFERENCE]** Option 3 is architecturally strongest but Option 1 is the best supported by the
> *frozen Finance* document, which is the more specific of the two. If the owner accepts amending
> `Institution Management Engineering.md` §11.1, Option 1 yields exactly one writer per concept and
> eliminates the divergence risk outright. Option 2 should be rejected in its current form: it
> reintroduces two write paths for financial policy, which is the condition BR-26-style
> single-ownership rules exist to prevent.
>
> **Independent of the ownership choice:** gateway secrets cannot live in `financial.*` JSON, and
> per-category schema validation is required by Institution spec §11.2 regardless. Both are decidable
> now and are prerequisites for D-9.

The two items in the second paragraph are stated by the brief as decidable **regardless** of which
option is chosen.

---

## 5. Decision matrix

Factual comparison only. No scores, no ranking, no winner. Each cell is a description supportable
from the sources cited in §2 and §4.

| Criterion | 1 | 2 | 3 |
|---|---|---|---|
| Single source of truth | One writer per concept; `financial.*` retired or read-only | Two write paths for the same concept (brief `:238`) | Neither side wholly retired; category→owner map required (brief `:239`) |
| Tenant/institution isolation | `financial_policies` and `payment_gateway_configs` are institution-scoped by their frozen UNIQUE keys (`:1138`, `:1144`) | `financial.*` is institution-scoped by `@@unique([institutionId, key])`; the `financial_policies` tier is institution-scoped too, so the key is not unique on its own | Both sides institution-scoped; the map, not the schema, carries the routing |
| Compatibility with frozen Finance spec | Compatible with `:46`; leaves `:48`'s exclusion of "Institution configuration" textually in tension | Compatible with `:46` and with Institution `:992`; requires the §11.2 validation layer to be built | Consistent with `:46`; requires a rule set covering all 18 concepts at `:46` |
| Compatibility with frozen Institution spec | **Requires amendment** of `:987-997` to drop the Financial category (brief `:221`) | Compatible with `:992`; makes `:1004-1005` an implementation obligation | Compatible with `:992`; uses `:995` as the display/settlement precedent |
| Migration complexity | "none extra" beyond the Finance schema (brief `:237`) | "adds validation + default tiers" (brief `:238`) | "none" (brief `:239`) |
| Security / secret handling | Credentials stay encrypted and Finance-accessed (brief `:237`); satisfies `:1729`/`:1732` | **Risk:** secrets must be excluded from the JSON path or they become Institution-readable (brief `:238`) | Separation achievable if secrets are explicitly Finance-only (brief `:239`) |
| Impact on D-3 | Supplies the Finance-owned enforcement point BR-015 needs | Leaves D-3 choosing between two live value homes | Answers the settlement side; display side stays with Institution |
| Impact on D-9 | Unlocks: `financial.*` is not the credential path | Partly conditions D-9; brief `:1101` notes values are Institution-readable under this option | Unlocks the credential-custody half |
| Impact on D-14 | Unlocks: Finance billing side has a configuration home | Constrains; subscription values route through Institution `financial.*` | Constrains; needs the category→owner map to place subscriptions |
| Impact on D-12 | Finance tables become the replacement target; per-row currency columns removable with their tables | Legacy tables not directly replaced; the duplicate value homes persist | Requires the map to state what replaces each legacy column |

---

## 6. Downstream impact

What remains undecided until D-2 is locked.

### D-3 — Canonical currency

Undecided: which field is authoritative among `Institution.currency` (`institution.prisma:72`), a
`financial_policies` row with `policy_type = CURRENCY` (`Finance Engineering.md:1041`), and the
legacy per-row `currency` columns (`finance.prisma:11,64`). BR-015's "fixed after first invoice"
(`:338`) has no named enforcement point, because the enforcement point is a write path in whichever
domain owns it (brief `:1558-1560`). Also undecided: whether `regional.*` currency **format**
(`Institution Management Engineering.md:995`) is display-only or participates in settlement — the
brief treats that distinction as the Option 3 precedent (`:229`).

### D-9 — Providers/secrets

Undecided: whether gateway credentials may be routed through `financial.*`, which depends on whether
that namespace is Finance-owned or Institution-readable (brief `:1561-1562`). Until D-2 fixes the
custody boundary, D-9 cannot finalize secret storage. The brief records one point as **independent
of D-2** and already decidable: gateway secrets cannot live in `financial.*` JSON (`:250-252`).

### D-12 — Legacy Finance tables

Undecided: what the legacy tables are replaced with. D-2 constrains but does not decide this. Under
Option 1 the Finance tables become the replacement target; the per-row `currency` columns become
removable with their tables (D-3 Option 1, brief `:331`). Under Options 2 and 3 the duplicate value
homes persist and the map or tier must state what replaces each legacy column. D-12's own disposition
(archive vs replace) remains a separate decision (brief `:1570-1571`).

### D-14 — Subscription billing

Undecided: the configuration home for the Finance side of subscription billing. ADR-015
(`Institution Management Engineering.md:140`) assigns subscription billing to Finance while
`Finance Engineering.md:48` excludes subscription management and Platform Administration owns
subscriptions (brief `:1621`). D-2 must say where the billing configuration lives before D-14 can
resolve the ownership collision.

---

## 7. Human decision

The six concepts in §1 must each be assigned to exactly one owning domain, and the fate of the
`financial.*` namespace must be stated. No option is selected in this packet.

DECISION REQUIRED: D-2

1 — Finance owns all financial configuration; Institution's `financial.*` is retired or becomes read-only projection.

2 — Institution owns `financial.*` values; Finance owns typed policy + gateway credentials.

3 — Split by category: Institution owns non-secret display/tax/gateway *enablement*; Finance owns settlement currency, numbering, penalties, and encrypted credentials.

Additionally, and independently of the option chosen (brief `:250-252`):

- State whether gateway secrets are stored outside `financial.*` JSON. **[INFERENCE]** The brief
  records that they cannot be.
- State whether per-category schema validation is implemented, as `Institution Management
  Engineering.md:1004` requires regardless of ownership.

---

## 8. Verification

| Check | Result |
|---|---|
| No implementation files changed | Confirmed — `git diff --stat` empty; no tracked file modified |
| No Prisma migration created | Confirmed — no file written under `apps/api/prisma/migrations/` |
| No dependencies installed | Confirmed — no package manager invoked; `apps/api/package.json` untouched |
| No tests modified | Confirmed — no test file written or edited |
| No Git history modified | Confirmed — HEAD remains `aae6309`; no commit, amend, rebase, or reset performed |
| Only `docs/PHASE_6_D2_DECISION_PACKET.md` created/updated | Confirmed — this file is the sole output of this task; the two pre-existing untracked Phase 6 gate documents are unchanged from prior passes |

No Prisma schema, migration, seed, permission, guard, DTO, event, service, or test was created,
modified, or deleted. No architectural decision is recorded in this packet.
