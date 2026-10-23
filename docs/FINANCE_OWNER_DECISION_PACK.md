# FINANCE OWNER DECISION PACK

> ## ✅ ANSWERED — 2026-09-29
>
> The owner has answered every question in §11 of this pack. The authoritative record of the
> answers is **`docs/FINANCE_OWNER_DECISIONS_RECORD.md`**, and the decisions have been reconciled
> into **`engineering/Finance Engineering.md` (revision 1.8.0)**.
>
> - **8 required decisions answered** (Finance D-2, D-3, D-4, D-6, D-7, D-8, D-12, plus the
>   unnumbered aggregate document-total limit).
> - **1 conditional decision answered** (Finance D-5 → **staff-only**, off the critical path).
> - **Finance D-1** remains deferred and undecided.
> - **One bounded item remains open:** the aggregate-limit **numeric defaults**. The mechanism,
>   storage, and reject-on-breach behaviour are decided; the three values were not supplied and
>   have **not** been invented.
>
> **§11 below is preserved exactly as issued** — the unanswered question set, as the
> point-in-time record of what was asked. The answers are recorded in
> `docs/FINANCE_OWNER_DECISIONS_RECORD.md`, not back-filled into the question text.
>
> **Current status: READY FOR FINAL FINANCE IMPLEMENTATION PROMPT**, with the aggregate-limit
> numeric defaults carried as an explicit configuration prerequisite.

| Field | Value |
|---|---|
| **Document type** | Owner decision pack. No decision is made, implied, or pre-selected anywhere in this document. |
| **Date** | 2026-09-29 |
| **Repository HEAD** | `aae6309` |
| **Branch** | `phase/2-rbac` |
| **Primary source** | `docs/FINANCE_DECISION_READINESS_REPORT.md` |
| **Corroborating sources** | `docs/PHASE_6_DECISION_BRIEF.md`; `engineering/Finance Engineering.md` |
| **Files changed** | **None.** This file is the only artifact created. |
| **Owner decisions required** | **8** — seven numbered (Finance D-2, D-3, D-4, D-6, D-7, D-8, D-12) plus one unnumbered documentation gap |
| **Conditional decisions** | **1** — Finance D-5 |
| **Excluded by scope** | Finance D-1 (leaf, no blocking dependents) |
| **Implementation status at time of writing** | **SAFE-STOPPED — awaiting owner decisions** — *(superseded 2026-09-29; see the banner above)* |

---

## 0. REGISTER DISCIPLINE — READ BEFORE ANSWERING

### 0.1 Two D-registers exist and their identifiers collide

| Identifier | **FINANCE D-register** — `docs/PHASE_6_DECISION_BRIEF.md` | **REGISTER-B D-register** — `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md` |
|---|---|---|
| D-1 | Expenses | Specification-authority rule when a summary conflicts with a detail section |
| D-2 | **Financial configuration ownership** | Countable unit and granularity per category |
| D-3 | **Canonical settlement currency** | Tie-break when a detail section contradicts itself |
| D-4 | Event contract, naming, consumer ownership | Positional vs named section references |
| D-5 | Payer and object scope | Project-wide phase-status vocabulary |
| D-6 | Payment / refund state authority | Verification gate for `Complete` |
| D-7 | Roles, permissions, and guards | Specification-domain → repository mapping rule |
| D-8 | Decimal precision, rounding, balanced entries | Which document governs approval state |
| D-12 | Legacy Finance table disposition | — (register B stops at D-10) |

**Every question in this pack concerns the FINANCE D-register.** This is stated for disambiguation only. **No precedence between the registers is asserted, implied, or resolved here.** Where a question is genuinely specific to one register, this pack writes `FINANCE D-n` in full.

REGISTER-B D-1, D-2, and D-3 are **not** required to answer any Finance question in this pack. The one place a Register-B question could become relevant is noted explicitly in §5.5, and it is **not** treated as blocking.

### 0.2 What is already LOCKED and must not be re-decided

| Locked item | Source | Scope of the lock |
|---|---|---|
| **ADR-036** — "institution default currency" means the institution's Finance-owned **settlement currency**; currency formatting/display is a separate concept | `Finance Engineering.md:87-88`, `:246` | **Terminology only.** Explicitly *"does not decide the storage mechanism for settlement currency"*, does not build a Finance currency store, and does **not** delete, rename, migrate, or reassign `Institution.currency` |
| **ADR-037** — `BURSAR` receives exactly 14 Finance permissions; the five admin roles hold every Finance permission; `BURSAR` receives **no** `finance:payment` permission | `Finance Engineering.md:111-131`, `:247` | **Billing surface only.** Grants permissions only. Introduces no role, permission, endpoint, or authorization behaviour |
| **Object-scope policy** — tenant and institution from the trusted JWT; active institution membership required; cross-tenant/cross-institution fails closed; a grant never widens object scope | `Finance Engineering.md:133-135` (ADR-037 §"Object-level rules") | Unaffected by D-7. Not reopened here |
| **Phase 5 event envelope** — extended **additively**; `emitAudited` shares one `eventId` with audit dedup | `apps/api/src/modules/events/event-envelope.ts:4-10` | Locked Phase 5 decision. Not amendable by a Finance decision without a separate governance act |

**Verified against the running system:** `apps/api/prisma/seed.ts:929-934` grants BURSAR exactly `finance:fee_schedule {read, create, update, manage}` + `finance:bill {read, create, convert, cancel}` + `finance:invoice {read, create, manage, cancel, update, adjust}` = **14 grants**, action-for-action identical to ADR-037. Nothing is missing and nothing is extra.

---

## 1. DECISION SUMMARY TABLE

| Decision | What it controls | Current status | Why it matters | Blocks what |
|---|---|---|---|---|
| **FINANCE D-7** remainder | Who may approve refunds, write-offs, discount overrides, journal postings, and period closes; which of the 7 §9.5 guards Finance owns; role assignment for 17 of 20 Finance resources | **PARTIALLY LOCKED** — ADR-037 fixed the billing surface; the remainder is explicitly deferred by ADR-037 itself | A flat role cannot express "request a refund" vs "approve a refund above a threshold", which is what BR-09 and `FinancialAuthorityGuard` require | `FinancialAuthorityGuard`, `ImmutabilityGuard`; refund approval; write-off authorisation; period-close authority; **FINANCE D-6** (refund transitions need an approver) |
| **FINANCE D-8** | Rounding mode; quantisation point; per-line vs aggregate rounding; discount/tax intermediate rounding; residue reconciliation between the invoice chain and the journal chain | **UNRESOLVED** — spec mandates `decimal(14,2)` and a balance invariant, states **no** arithmetic rule; repository contains **zero** rounding helpers | The invoice chain and journal chain are independent materialisations. If they quantise differently, `total_debit ≠ total_credit` and every affected transaction is rejected at post time | Bill totals; discount computation; journal posting; account balances; payment allocation; **FINANCE D-6**; **FINANCE D-12** (column precision); D-16 late fees |
| **FINANCE D-2** | Which domain owns settlement currency, tax rules, invoice numbering, late-fee/penalty rules, gateway enablement, gateway credentials; whether `institution_configurations` keeps a `financial.*` namespace | **UNRESOLVED** — `Finance Engineering.md:46` makes Finance the owner; `:48` excludes Institution configuration. No source ranks the two clauses | Two writers for the same concept is the exact condition single-ownership rules exist to prevent. A second writer only becomes live when a currency, tax, or numbering write path is added | **FINANCE D-3** (upstream); D-9 gateway secrets; D-16 penalty rules; D-17 numbering |
| **FINANCE D-3** | Which single field is authoritative for institution settlement currency; whether `Institution.currency` stays writable; where "fixed after first invoice" (BR-015 / ADR-020) is enforced | **TERMINOLOGY LOCKED** (ADR-036). **Storage and enforcement UNRESOLVED** — Revision History v1.3.0 states the disposition of `Institution.currency` *"remains an open D-3 implementation decision"* | Four on-disk currency homes exist; no source names the authoritative one, so BR-015 is currently unimplementable | Every money path needing a currency read. **Does NOT gate D-12** — see §6.4 |
| **FINANCE D-4** | Governing event naming convention; whether `eventVersion`/`occurredAt` join the envelope; which frozen spec wins when Finance and People disagree on an event; whether Finance must handle `PersonMerged`/`PersonSoftDeleted` | **UNRESOLVED and partly pre-empted** — two conventions live in the codebase, and Finance's own 12 shipped event strings use a third | Finance has 12 event producers and **zero** consumers. No consumer-driven billing can be written against an unknown naming rule or an unknown ownership map | All consumer-driven billing: bill generation from enrolment, refund eligibility on withdrawal, final billing on graduation, enrolment clearance on payment |
| **FINANCE D-6** | Which domain owns payment and refund state; what happens to two existing client-writable fields; the canonical refund vocabulary | **UNRESOLVED — two live bypasses confirmed.** Finance has no payment/refund model at all | Two non-Finance modules write financial state today, and the roadmap explicitly requires that payment state not be trusted from the client (P6.3) | All of payments, refunds, write-offs, payment allocation, gateway reconciliation, refund eligibility, financial clearance |
| **FINANCE D-12** | Archive, migrate, or delete the five legacy Finance tables: `FeeStructure`, `Invoice`, `Payment`, `Scholarship`, `Refund` | **UNRESOLVED — destructive-migration gate** | The spec-conformant `Invoice`, `Payment`, and `Refund` tables **cannot be created** while the legacy tables occupy the frozen names. `DiscountApplication` is blocked for the same reason | The spec-conformant `Invoice` / `Payment` / `Refund` tables, therefore **all settlement work**. Gates **FINANCE D-8** implementation and **FINANCE D-6** |
| **FINANCE D-5** *(conditional)* | Whether Phase 6 exposes any invoice view or payment path to a person who is not the student; if so, whether the relationship uses `PersonRelationship` or a new Finance payer record | **UNRESOLVED but conditional.** Spec has **zero** occurrences of "payer" and defers the parent portal to Future, but a `parent/fees` prototype with a pay action exists in the web app | Only blocking if a non-student surface is required. The `params.id` short-circuit is **D-11**, not D-5 | **Nothing, if "staff-only" is confirmed.** If a parent/guardian surface is required, a new scope type or Finance guard is required first |
| **FINANCE D-1** *(out of scope)* | Whether `expenses` is a Phase 6 capability | UNRESOLVED, but **excluded from this pack** | — | **Nothing.** Leaf with no dependents; may be decided later or deferred with a roadmap amendment |
| **UNNUMBERED** — aggregate document total | Maximum line amount, maximum line count, and maximum document total | **NOT COVERED BY ANY EXISTING D-NUMBER** | See §4.2 and §11.1 | Any document total that can exceed `Decimal(14,2)`'s ceiling |

---

## 2. FINANCE D-7 — FINANCIAL AUTHORITY

### 2.1 What is already settled

**LOCKED by ADR-037 — do not re-answer:**

- `BURSAR` holds exactly 14 permissions: `finance:fee_schedule` {read, create, update, manage}, `finance:bill` {read, create, convert, cancel}, `finance:invoice` {read, create, manage, cancel, update, adjust}.
- `BURSAR` receives **no `finance:payment` permission.** Settlement is outside ADR-037.
- The five admin roles — `PLATFORM_ADMIN`, `ORG_ADMIN`, `PRIMARY_INSTITUTION_ADMIN`, `INSTITUTION_ADMIN`, `PRINCIPAL` — hold **every** Finance permission.
- ADR-037 adds no role, no permission, no endpoint, and no authorization behaviour.

The specification itself records why a role matrix had to be invented: `Finance Engineering.md:115-119` — *"§10.3 maps every Finance endpoint to a `{domain}:{resource}:{action}` permission, but this specification provides **no Finance role matrix** — it names no Finance role and assigns no permission to any role."*

### 2.2 The 20 Finance resources and their current assignment

64 permissions exist across 20 resources. Current assignment, verified against the seed:

| Resource | Actions | Currently held by | Status |
|---|---|---|---|
| `finance:fee_category` | read, create, update | 5 admins only | **Deferred by ADR-037** |
| `finance:fee_item` | read, create, update | 5 admins only | **Deferred by ADR-037** |
| `finance:fee_schedule` | read, create, update, manage | 5 admins + BURSAR | **LOCKED** |
| `finance:bill` | read, create, convert, cancel | 5 admins + BURSAR | **LOCKED** |
| `finance:invoice` | read, create, manage, cancel, update, adjust | 5 admins + BURSAR | **LOCKED** |
| `finance:payment` | read, create, confirm, allocate | 5 admins only | **LOCKED** (BURSAR explicitly excluded) |
| `finance:gateway` | read, create, update, transact | 5 admins only | Open |
| `finance:reconciliation` | read, manage | 5 admins only | Open |
| `finance:discount` | read, create, update, apply | 5 admins only | Open |
| `finance:report` | read | 5 admins only | Open |
| `finance:billing` | summer_school | 5 admins only | Open |
| `finance:scholarship` | read, create, update, award, revoke | 5 admins only | Open |
| `finance:refund` | read, request, approve, process | 5 admins only | Open — **needs request/approve separation** |
| `finance:adjustment` | read, create, reverse | 5 admins only | Open |
| `finance:write_off` | read, create, approve | 5 admins only | Open — **needs request/approve separation** |
| `finance:installment` | read, create, pay | 5 admins only | Open |
| `finance:ledger` | read, create | 5 admins only | Open |
| `finance:journal` | read, create | 5 admins only | Open |
| `finance:period` | read, create, manage | 5 admins only | Open — **period authority deferred to D-7** |
| `finance:policy` | read, create, update | 5 admins only | Open |

**Two observations the owner should have before answering:**

1. **`finance:fee_category` and `finance:fee_item` are admin-only while `finance:fee_schedule` is BURSAR-granted.** A BURSAR can create and publish a fee schedule but cannot create the categories or items that schedules reference. ADR-037 explicitly listed these as *"not decided here"* — so this is open, not locked.
2. **`finance:refund` and `finance:write_off` each contain both a request/creation action and a separate approval action.** A single role holding both can self-approve unless something prevents it.

### 2.3 D-7.1 — Does Phase 6 introduce any new role?

**Documented options (from the brief, no new options added):**

**Option 1 — Reuse `BURSAR`; separate request from approve purely through permissions.**
- Technically: all 64 permissions already fit the existing `(resource, action)` shape; **no schema change, no migration**. `BURSAR` already exists as a seeded system role. `finance:refund:request` vs `finance:refund:approve` and `finance:write_off:create` vs `finance:write_off:approve` are already distinct permission rows.
- The threshold check lives inside `FinancialAuthorityGuard`.
- Follows the locked Phase 5 precedent of "no new roles".
- **Consequence the owner must weigh:** segregation of duties stays weak. A BURSAR holding both `request` and `approve` can approve their own request unless the guard explicitly blocks it.

**Option 2 — Add one new role (the brief names it `FINANCE_MANAGER`) for approval authority above threshold.**
- Technically: roles are data, so **still no schema change and no migration**. Requires amending the Phase 5 "no new roles" precedent for one role.
- Gives genuine two-person control.
- **Consequence:** a new system role in the catalogue, and a precedent that may be repeated per domain.

**Option 3 — Model authority as a data capability (delegation / threshold table) rather than a role.**
- Technically: **new data and a new migration** for a delegation/threshold table. Builds on Identity's existing `Delegation` concept.
- Gives time-bound authority.
- **Consequence:** the largest build of the three, and more machinery than any Finance source describes.

### 2.4 D-7.2 — Which role holds which of the 64 permissions?

**QUESTION NOT FULLY SPECIFIED — OWNER INPUT REQUIRED**

The specification has no Finance role matrix. ADR-037 resolved 3 of 20 resources for `BURSAR` and explicitly deferred *"all remaining Finance resources and their role assignment"*. The brief documents no options for the other 17.

**The owner must state, for each of the 17 resources currently admin-only, whether:**
- (a) the five admin roles remain the only holders — in which case the answer is already the current state and no change is needed, or
- (b) a specific role receives some of them, and which.

**Resources that most likely need an explicit answer rather than a default:**
- `finance:journal` (read, create) — posting journal entries is the accounting action
- `finance:ledger` (read, create) — chart-of-accounts maintenance
- `finance:period` (read, create, manage) — see D-7.3
- `finance:refund` / `finance:write_off` (request, approve) — see D-7.4
- `finance:fee_category` / `finance:fee_item` — see the observation in §2.2
- `finance:reconciliation` (manage) — settlement-adjacent
- `finance:billing:summer_school` — the only permission with an underscore in its action segment

### 2.5 D-7.3 — Financial-period authority

**QUESTION NOT FULLY SPECIFIED — OWNER INPUT REQUIRED**

D-16 (Financial periods and late-fee accrual) explicitly defers this to D-7: *"confirm whether period close may be run by BURSAR or requires elevated authority (relates to D-7)."*

Current state, verified: `FinancialPeriod` is **implemented** with status `OPEN, CLOSING, CLOSED`, and `POST /finance/accounting/periods` requires `finance:period:create`, which only the five admin roles hold. So **period creation and closing work today and are admin-gated.** No decision is required to keep them working.

What the owner must state: whether period close remains admin-only, or whether a named role may close periods. D-16 additionally asks whether `CLOSING` is a distinct persisted state or a transaction phase — that part belongs to D-16, not here.

### 2.6 D-7.4 — Refund and write-off approval authority

**Documented requirement:** BR-09 (`:332`) — *"Refunds require approval workflow with threshold-based escalation."* BR-011 (`:334`) — *"Write-offs require admin authorization."* ADR-011 (`:221`) — *"Refunds involve money leaving the institution; threshold-based multi-level approval prevents fraud."*

**A documented home already exists for the threshold:** `Finance Engineering.md` §6.5, policy **P-08**:

> `| P-08 | Refund approval threshold (amount) | 50000 | 1000–1000000 |`

`FinancialPolicy` is implemented and versioned, so P-08 has a working home. The open question is **how authority is separated**, not where a threshold is stored.

**Documented options for the separation mechanism** (identical to §2.3's Option 1/2/3, applied to approvals):

| Mechanism | What changes technically | Affected permissions |
|---|---|---|
| **Permissions only** | No schema change. `request` and `approve` are distinct permissions; the threshold lives in `FinancialPolicy` P-08; `FinancialAuthorityGuard` enforces it | `finance:refund:request` vs `:approve`; `finance:write_off:create` vs `:approve` |
| **A separate approval role** | No schema change (roles are data). One new system role | Same permissions, assigned to the new role |
| **Delegation table** | New data + migration for delegation/threshold records | Same permissions, resolved through delegation state |

**The owner must state which mechanism separates request authority from approval authority.**

### 2.7 D-7.5 — Is self-approval blocked?

**QUESTION NOT FULLY SPECIFIED — OWNER INPUT REQUIRED**

The brief states this is a required part of the decision (*"whether self-approval is blocked"*) and notes that BR-09's escalation intent *"is otherwise unmet"* if one person can both request and approve. **No source states the answer**, and no source defines "self" precisely for a refund — the candidate identities are the requester, the approver, and possibly the original payer.

**The owner must state:** whether self-approval is blocked, and if so, which identity comparison defines "self".

### 2.8 D-7.6 — Payment authority

**LOCKED for `BURSAR`:** no `finance:payment` permission. `Finance Engineering.md:131` — *"`BURSAR` receives no `finance:payment` permission. Settlement is outside this decision."*

**Open:** whether any role **other than the five admins** receives `finance:payment` {read, create, confirm, allocate}. The brief documents no options for this; it is one of the resources ADR-037 deferred. Note that `finance:payment:confirm` is the action that moves money to a settled state, so it is the highest-consequence of the four.

### 2.9 D-7.7 — Which of the seven §9.5 guards does Finance own?

**The documented conflict.** `Finance Engineering.md:48` **Out of Scope:** `Authentication, Authorization, Roles, Permissions, MFA, Sessions (Identity & Access)`. The same document, at `:1428-1442`, **§9.5 Guards**, mandates seven:

| Guard | §9.5 purpose | Exists in the repository? | Used by Finance controllers? |
|---|---|---|---|
| `JwtAuthGuard` | Validate JWT and extract user | Yes — `modules/auth/jwt-auth.guard.ts` | Finance uses `AuthGuard('jwt')`, the Passport equivalent |
| `TenantGuard` | Validate tenant context from JWT | Yes — `common/guards/tenant.guard.ts` | **No** |
| `InstitutionGuard` | Validate access to the requested Institution | Yes — `modules/institutions/institution-scope.guard.ts` | **No** |
| `FinanceAccessGuard` | Validate access to the requested financial entity | **No** | — |
| `ModuleLicenseGuard` | Check if the Institution has the Finance module enabled | **No** | — |
| `FinancialAuthorityGuard` | Validate authority for approval operations (refund approval, write-off) | **No** | — |
| `ImmutabilityGuard` | Prevent modification of published invoices, confirmed payments, posted entries | **No** | — |

All five Finance controllers declare the identical chain: `@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)`.

**The owner must state, for each of the four absent guards, whether Finance owns it:**

- **`FinanceAccessGuard`** — its §9.5 purpose is "access to the requested financial entity". Access is currently enforced in services instead: every Finance service calls `assertInstitutionContext(ctx)` and filters with `institutionWhere(ctx.tenantId, institutionId)` or `where: { id, tenantId, institutionId }`, failing closed. The owner must state whether that service-layer enforcement satisfies the guard requirement, or whether a Finance-specific guard must be built.
- **`ModuleLicenseGuard`** — its purpose is licensing, and `Finance Engineering.md:48` assigns Licensing to Institution Management. The owner must state whether the Finance-module-enabled check belongs to Finance or to Institution Management. *(This also depends on FINANCE D-2, which assigns the owning domain per configuration concept.)*
- **`FinancialAuthorityGuard`** — blocked on D-7.4/D-7.5. Cannot be built until the owner states the approval mechanism and the self-approval rule.
- **`ImmutabilityGuard`** — §9.5 names three immutable things: **published invoices, confirmed payments, posted entries**. The owner must state whether that list is complete and authoritative, and whether immutability is enforced by a guard, by service logic, or by database constraint. Note that ADR-026 (`:236`) already says published invoices are immutable and corrections create credit/debit notes, and the implementation comment in `finance.prisma:256-259` states journal entries and balances are immutable — so the *rule* is stated; what is missing is the *enforcement mechanism decision*.

### 2.10 D-7 downstream dependencies

| Consumer of D-7 | Why |
|---|---|
| **FINANCE D-6** | Refund transitions `REQUESTED → APPROVED` and `APPROVED → PROCESSED` are approval operations. D-6 cannot name the canonical state model without knowing who may move it |
| **D-16** | Period-close authority is explicitly deferred to D-7 |
| **D-5** | If a parent/guardian surface is approved, approval authority interacts with the payer scope |
| **FINANCE D-2** | `ModuleLicenseGuard` ownership depends on which domain owns configuration |
| **D-9** | Gateway enablement and credentials ownership depends on D-2, and `finance:gateway:transact` is a D-7 resource |

---

## 3. FINANCE D-8 — ROUNDING / QUANTISATION

FINANCE D-8 contains **two unrelated problems**. They are separated below because answering one does not answer the other.

### 3.1 PART A — Rounding / quantisation

#### 3.1.1 What the specification fixes, and what it does not

**Fixed:** `Finance Engineering.md:752` — *"All monetary columns use decimal(14,2) (never Float)."* And the invariant: ADR-030 (`:240`) — *"Journal entries must balance: Every journal entry has equal total debits and credits; unbalanced entries are rejected"*; `:1349` — *"Journal entry posting validates balance before commit; rolled back if unbalanced."*

**Not fixed:** an exhaustive search of the specification for `rounding`, `half-up`, `half-even`, `ceiling`, `floor`, `toFixed`, `ROUND(` returns **no matches**. The brief confirms the arithmetic rule was never stated.

**Current implementation:** a repository-wide search of the API source for `toFixed`, `Round`, `ROUND_`, `Math.round`, `quantis`, `quantiz` returns **zero matches**. There is no money utility, no quantisation helper, and `decimal.js` is not a direct dependency. Monetary values arrive as `Prisma.Decimal`.

#### 3.1.2 The four sub-questions the brief poses

| # | Sub-question | Why it cannot be answered from the repository |
|---|---|---|
| (i) | **Rounding mode** — half-up, half-even (banker's), truncate? | No source names a mode. No existing code establishes a convention to inherit |
| (ii) | **Quantisation point** — per line, per document, or per persisted column? | The invoice chain is a *sequence of materialisations* (`subtotal → total_amount → paid_amount → outstanding_balance`, `:825-833`), and the journal chain is a parallel materialisation (`journal lines → total_debit / total_credit`, `:1071-1072`). No source says where in either chain rounding occurs |
| (iii) | **Discount and tax — do they round at each intermediate step?** | `total_discounts`, `total_scholarships`, `total_tax`, `total_late_fees` are all separate materialised columns. Whether a percentage is applied to a rounded or unrounded base is unstated |
| (iv) | **Residue reconciliation** — how is a sub-cent carried between the invoice chain and the journal chain? | If the two chains quantise at different points, `total_debit ≠ total_credit` and the balance check **rejects the transaction**, turning a rounding choice into a production failure |

#### 3.1.3 Documented options

**Option 1 — Single canonical quantisation helper, applied once per persisted document, half-up, with mode and application point recorded in `FinancialPolicy`.**
- **No schema change, no migration.** One helper, one call-site convention.
- `FinancialPolicy` is already implemented and versioned (`FinancialPolicyStatus`: `DRAFT, ACTIVE, SUPERSEDED`), so the home exists.
- Makes a future mode change a policy edit rather than a migration. Best fit if multi-currency ever arrives — multi-currency is Future (`:1908`).
- **Cost:** the policy becomes a financial dependency on every money write.
- **Note:** the brief states explicitly that the *half-up* element is a recommendation, not a source requirement. **It is presented here as an option, not as derived.**

**Option 2 — Quantise at every persisted `decimal(14,2)` column, with no intermediate rounding.**
- **No schema change, no migration.** Discipline only; no shared helper.
- Closest literal reading of `:752` and of PostgreSQL numeric semantics.
- **Cost:** rigid. No single place to change the rule later.

**Option 3 — Store exact unrounded decimals and round only for presentation and reporting.**
- **Contradicts `:752`**, which mandates `decimal(14,2)` on the columns themselves.
- The brief records it as the weakest fit, listed for completeness.

**These three are the only options the sources support. No fourth option is invented here.**

#### 3.1.4 Concrete illustrations of the unresolved choices

**Rounding mode** — the same input under three defensible rules:

| Input | half-up | half-even | truncate |
|---|---|---|---|
| 0.125 | 0.13 | 0.12 | 0.12 |
| 0.135 | 0.14 | 0.14 | 0.13 |

**Quantisation point** — ₦10.00 across 3 equal lines:

| Point | Line values | Sum | Effect |
|---|---|---|---|
| Per line | 3.33, 3.33, 3.33 | **9.99** | A cent disappears from the document total |
| Per document | 3.33, 3.33, 3.34 | **10.00** | Residue assigned to one line |
| None, DB rounds | order-dependent | **nondeterministic** | Current behaviour; the repository has no helper |

**Discount / tax order** — a ₦1,000.00 fee with 7.5% tax and a ₦50.00 discount:

| Method | Tax | Discount | Total |
|---|---|---|---|
| Tax on gross, then discount | 75.00 | 50.00 | **875.00** |
| Discount first, then tax | 71.25 (7.5% of 950.00) | 50.00 | **878.75** |

₦3.75 apart. The specification mandates the results are materialised into `total_tax` and `total_discounts` but not the order of operations.

**Residue reconciliation** — a ₦10.00 bill paid in three equal allocations:

| Method | Allocations | `outstanding_balance` | Effect on V-PA-03 |
|---|---|---|---|
| Round each allocation | 3.33 × 3 | **0.01** | I-02 (`allocation ≤ outstanding balance`) **blocks** the final cent as a fifth allocation |
| Round the final allocation to the residual | 3.33, 3.33, 3.34 | **0.00** | No orphan cent |

Both are defensible. Only the second behaves cleanly, and **which one is in force is not written down anywhere.**

**Aggregate discount stacking** — P-11 (`Discount stacking allowed`, default false) and P-12 (`Max discounts per invoice`, default 1, range 1–5) both exist, so stacking is already policy-controlled. But the *arithmetic order* for multiple discounts is not.

### 3.2 PART B — The overflow is NOT a D-8 question

See §11.1 for the full treatment. Summary: the aggregate overflow is a **missing maximum-value rule**, not a missing rounding rule, and **no existing D-number covers it.** It is raised separately as `UNNUMBERED OWNER DECISION REQUIRED — DOCUMENTATION GAP`.

**Why it is not D-8:** choosing a rounding mode has no effect on an overflow. A document that totals ₦199,999,999,999,998.00 does not become representable because half-up was chosen. The three inputs the owner must supply — maximum line amount, maximum line count, maximum document total — are absent from D-8's four sub-questions entirely.

---

## 4. FINANCE D-2 — FINANCIAL CONFIGURATION OWNERSHIP

*(Throughout this section: **FINANCE D-2** = configuration ownership. **REGISTER-B D-2** = countable unit and granularity. These are unrelated. The owner is answering FINANCE D-2.)*

### 4.1 The exact conflict

`Finance Engineering.md:46` (**In Scope**) — *"configurable financial policies (**currency, tax, numbering, penalties**)"*
`Finance Engineering.md:48` (**Out of Scope**) — *"**Institution configuration**, Licensing, Subscription management (Institution Management)"*

These two clauses cannot both be the ownership rule, because institution-scoped configuration physically lives in Institution configuration. No source ranks the two clauses, and document order does not settle it: `:48` comes *after* `:46`, but a later exclusion does not by itself override an earlier inclusion.

**A fourth home is specified but unimplemented:** the `institution_configurations` table has a reserved `financial.*` JSON namespace, currently held for Finance and not writable.

**Already implemented and unaffected:** `FinancialPolicy` (versioned, institution-scoped, unique on `tenant_id, institution_id, policy_type, policy_key, version`) is built, with live endpoints `GET/POST /finance/policies` and `GET /finance/policies/history` behind `finance:policy:*` permissions. 20 policy slots are defined in §6.5 (P-01 through P-20), including **P-08 refund approval threshold** and **P-06 / P-15 late-fee caps** — both of which FINANCE D-7 depends on.

### 4.2 Documented options

**Option 1 — Finance owns the values.**
- 30 Finance tables only, no extra schema, no migration.
- Institution Management must be amended; `INSTITUTION_ADMIN` loses its config UI for financial concepts.
- One writer per concept. `FinancialPolicy` becomes the single home — and it is **already built**, so this option has the least new construction.
- Multi-currency (Future) would need Institution to become multi-valued, or Finance to keep owning it.

**Option 2 — Institution owns the values.**
- Finance tables **plus** a typed JSON schema per category in `institution_configurations`.
- Requires validation and default tiers that **do not exist** in the repository today.
- Creates **two write paths for the same concept** — the exact condition single-ownership rules exist to prevent.
- The brief flags a specific hazard: gateway secrets must be excluded from the JSON path or they become Institution-readable.

**Option 3 — Split by category.**
- Both domains store, plus a written category→owner map or rule set.
- Largest governance surface; the brief records the ambiguity risk as highest and notes categories will drift over time.
- Achievable only with a per-category schema-validation layer that does not exist.

**Precondition already decided, independent of the option:** gateway credentials cannot live in `financial.*` JSON. This is a prerequisite for D-9, not a D-2 choice.

### 4.3 The owner's answer must cover six concepts individually

The brief requires the owning domain to be named **per concept**, not globally:

1. Settlement currency
2. Tax rules
3. Invoice numbering
4. Late-fee / penalty rules
5. Gateway enablement
6. Gateway credentials

Plus: whether `institution_configurations` retains a `financial.*` namespace, and if so whether it is **authoritative**, a **read-only projection** of Finance tables, or **removed**.

### 4.4 Implementation impact

| Under | Live impact today |
|---|---|
| Option 1 | `policy.controller.ts` already serves `FinancialPolicy` and nothing conflicts. The `financial.*` namespace is removed or becomes a read-only projection. `Institution Management Engineering.md` §11.1 must be amended |
| Option 2 | A typed JSON schema and validation tier must be built from scratch. Two writers for any concept routed to `financial.*` |
| Option 3 | Requires the category→owner map to be written before any code. Ambiguity is highest here |

**Nothing is currently broken.** The conflict becomes load-bearing the moment a *second* writer for a concept appears — which is precisely what FINANCE D-3 is about.

### 4.5 Dependencies

- **FINANCE D-2 is upstream of FINANCE D-3.** The brief's D-3 Option 1 ("`Institution.currency` authoritative") is only coherent if Institution owns settlement currency. **FINANCE D-3 cannot be answered before FINANCE D-2.**
- **D-9** (gateway provider set and secret custody) depends on D-2 for the credential/ownership half.
- **D-16** (late-fee accrual) depends on D-2 for penalty-rule ownership — P-05/P-06/P-14/P-15 are policy rows with a home that D-2 assigns.
- **D-17** (invoice numbering) depends on D-2 for numbering ownership — P-03/P-04.

### 4.6 Does it block the final Finance batch?

**Yes.** Any money path that reads or writes a configured financial value needs to know which domain owns it. With two owners, `FinancialPolicy` and the `financial.*` namespace can legitimately disagree, and no source says which wins.

### 4.7 Register-B interaction — not required, and why

**REGISTER-B D-2** asks *"What is the countable unit and granularity per category per specification?"* — e.g. whether an index count is per-table or per-column.

**It is not required to answer FINANCE D-2.** Ownership of a concept is orthogonal to how many rows a spec claims a concept has. The counts in `Finance Engineering.md` (30 tables, 32 models, 64 permissions, 98 endpoints) are documentation figures, not ownership rules, and FINANCE D-2 does not depend on any of them being correct.

REGISTER-B D-2 remains `SAFE-STOP` and stays out of scope.

---

## 5. FINANCE D-3 — CANONICAL SETTLEMENT CURRENCY

*(Throughout: **FINANCE D-3** = settlement currency storage. **REGISTER-B D-3** = tie-break when a detail section contradicts itself.)*

### 5.1 What D-3 decides

FINANCE D-3 asks three things:

1. Which single field is authoritative for institution settlement currency?
2. Does `Institution.currency` remain writable?
3. Which write path performs the BR-015 / ADR-020 "fixed after first invoice" check?

### 5.2 What is already LOCKED (ADR-036) — do not re-answer

ADR-036 fixes the *terminology*, and the specification states its limit explicitly:

- "Settlement currency" is **Finance-owned** and applies to invoices, payments, fees, refunds, adjustments, discounts, scholarships, and every other Finance-owned monetary operation.
- "Institution default currency" is that settlement currency — explicitly **not** a display or formatting setting.
- **"The existence of a column does not transfer ownership"** — `institution.currency` does *not* make Institution Management the owner of settlement currency.
- Settlement currency and currency formatting are distinct and must not be conflated.

ADR-036 states it *"does not decide the storage mechanism for settlement currency"*, and Revision History v1.3.0 states that **"The disposition of `Institution.currency` remains an open D-3 implementation decision."**

### 5.3 The four on-disk homes

| # | Location | State |
|---|---|---|
| 1 | `Institution.currency String @default("NGN")` | Migrated, populated, **writable** |
| 2 | `FeeStructure.currency String @default("NGN")` | Legacy table, per-row, schema default |
| 3 | `Payment.currency String @default("NGN")` | Legacy table, per-row, schema default |
| 4 | `institution_configurations` `financial.*` JSON | Specified, reserved, unimplemented (FINANCE D-2) |

Both legacy tables default to `"NGN"` at the schema level rather than per institution, and **neither is institution-scoped for currency**: `FeeStructure` has `institutionId`; `Payment` does not. The seed hard-codes `NGN` across 3 legacy fee structures.

### 5.4 Documented options

**Option 1 — `Institution.currency` is authoritative; Finance reads it; legacy per-row currency columns are removed with their tables.**
- No new column. **No migration** beyond whatever D-12 requires.
- The column already exists and is populated.
- BR-015 becomes enforceable as a write guard on that one column.
- **Depends on FINANCE D-2 Option 1 or 3** — coherent only if Institution owns settlement currency.
- Future cost: multi-currency (Future) would need Institution to become multi-valued.

**Option 2 — `FinancialPolicy` (a currency policy type) is authoritative; `Institution.currency` is retained for display/format and Finance ignores it for settlement.**
- New `FinancialPolicy` row per institution. No legacy-table impact.
- Versioned and auditable, matching the specification's stated principle that configuration changes are versioned and audited.
- **Needs a policy read on every money path.**
- **Better fit for BR-015's "fixed after first invoice"** because `FinancialPolicy` already has `DRAFT → ACTIVE → SUPERSEDED` — a supersession event exists to enforce "fixed".
- Future cost: multi-currency fits this option better.

**Option 3 — Keep both, synchronised.**
- No schema change, no migration.
- **The brief records this as not source-supported:** it requires a write-path invariant across two domains with no specified enforcement mechanism, leaving two writers and no enforcement. BR-015 stays unimplementable.
- Recorded as an option only because it is the implicit current state.

**These three are the only documented options. No fourth is invented here.**

### 5.5 What D-3 affects

- Every money path that must read a settlement currency to write a monetary value.
- The `currency` column disposition on `FeeStructure` and `Payment` — both of which **FINANCE D-12 may archive**.
- FINANCE D-2 (D-2 is upstream; D-3 is downstream).
- ADR-020 / BR-015 compliance, which is currently unimplementable because the authoritative column is unnamed.

### 5.6 What D-3 does **NOT** block — and the dependency direction, verified

**D-3 does NOT gate FINANCE D-12.** This must be stated precisely because the reverse is commonly assumed.

The verified dependency is:

- **FINANCE D-12 gates FINANCE D-3's implementation.** The spec-conformant `Invoice` and `Payment` tables cannot be created while the legacy `invoices` and `payments` tables occupy the frozen names. The schema states this in-file: `finance.prisma:197-200` — *"`discount_applications` is deliberately NOT created here: §7.2 makes it invoice-scoped, and the spec-conformant `invoices` table cannot be created while the pre-P6.1 legacy `invoices` table occupies the frozen table name. That table's archival is a separate, gated decision."*
- **D-3 → D-12 is a column-level dependency only.** If D-3 Option 1 is chosen, the legacy `currency` columns are *removed with their tables*. If Option 2, they are *replaced by a policy read*. Either way, the archival decision in D-12 is not contingent on the currency answer — only the fate of two columns is.
- **D-3 does NOT gate FINANCE D-8.** D-8 is about arithmetic, not currency. Multi-currency is Future, so per-currency exponent handling is not a Phase 6 concern.

### 5.7 Does the owner need to answer D-3 before the final batch?

**Yes** — but only after FINANCE D-2, and only because every money path in the final batch needs to read a currency. D-3 is not on the critical path for the already-built fee-structure, billing, discount, accounting, and policy work in the same way that D-12 and D-8 are.

### 5.8 Register-B interaction — not required, and why

**REGISTER-B D-3** asks *"When a detail section contradicts itself, which sub-part wins — the enumeration or the summary?"*

**It is not required to answer FINANCE D-3.** The currency conflict is not an internal contradiction within one detail section; it is a conflict between two *different* sections (`:46` vs `:48`) and between the specification and the schema. Section-precedence questions do not resolve it, and the specification supplies the actual answer for the terminology half (ADR-036) while leaving storage explicitly open.

**One adjacent item the owner may encounter:** `Finance Engineering.md` Revision History v1.2.0 records *"Phase 4 enum count correction (16→17)"* and *"test count correction (~450+ → ~240+)"*. Whether those corrections are the authoritative figures is a **REGISTER-B D-3** question. **It does not affect FINANCE D-3** and is not required here.

---

## 6. FINANCE D-4 — EVENT CONTRACT, NAMING, AND CONSUMER OWNERSHIP

### 6.1 Current state

**Envelope sub-question is LOCKED by Phase 5.** `event-envelope.ts:4-10` documents that the envelope is extended **additively** and that `emitAudited` shares one `eventId` with audit dedup. `eventVersion` is absent repo-wide; `occurredAt` has been replaced by `emittedAt`; `correlationId` and `actorId` **are** implemented in domain payloads.

**Naming: the repository now uses three conventions.**

| Producer | Constant name | Emitted string | Convention |
|---|---|---|---|
| People | PascalCase (`PersonCreated`, `StudentGraduated`) | PascalCase | Frozen convention (`Finance Engineering.md:81`: *"Events | PascalCase, past tense"*) |
| Academics | PascalCase (`EnrollmentCreated`) | dotted (`academics.enrollment.created`) | Documented Phase 5 deviation |
| **Finance (12 events, shipped)** | **PascalCase** (`FeeSchedulePublished`) | **dotted** (`finance.fee-schedule.published`) | **A third pattern** |

**This is new since the brief was written.** The brief's Option 2 blast-radius estimate predates the Finance events file. **Choosing Option 2 would now require renaming 12 already-emitted Finance event strings in addition to the Academics constants.** Because Finance has zero consumers, no consumer breakage results today.

**Finance has 12 event producers and 0 consumers.** The only `*Consumer` class in the codebase is `AuditLogConsumer`.

**Consumer-ownership conflicts, verified:**

| Event | Finance spec assigns | Other frozen spec assigns | Runtime reality |
|---|---|---|---|
| `StudentGraduated` | `PeopleConsumer` | `FinanceConsumer` ("update financial records") | Emitted |
| `StudentWithdrawn` | `PeopleConsumer` | `FinanceModule` | Emitted |
| `StudentClassEnrolled` / `StudentClassTransferred` | `AcademicManagementConsumer` (trigger bill/invoice generation) | Academic table assigns Audit/Attendance/People — **Finance absent** | **No runtime event of either name exists** |
| `SummerSchoolRegistered` | `AcademicManagementConsumer` | Academic assigns Finance in two places, omits it in a third | Emitted (dotted) |
| `PersonMerged` | **nothing** | **`FinanceModule` required** | Emitted |
| `PersonSoftDeleted` / `PersonRestored` | **nothing** | **`FinanceModule` required** | — |
| `StudentEnrolled` | **not declared as a billing trigger** | — | Emitted from **two** places, including applicant acceptance |

**`PersonMerged` is the material one:** merging two Persons merges their financial history, the People specification requires Finance to react, and the Finance specification never says how.

### 6.2 Documented options

**Option 1 — Adopt the runtime as-is: PascalCase for People-originated events, dotted for Academics-originated; Finance subscribes per source domain.**
- No amendment to a locked Phase 5 decision. No schema, no migration.
- Requires Finance to document two naming conventions and an explicit event-name map.
- **Cost:** a permanent Finance-side mapping table; a mis-mapping means silently missed billing.

**Option 2 — Normalise all event names to the frozen PascalCase convention.**
- No schema, no migration.
- **Now also requires renaming the 12 shipped Finance event strings.**
- Largest blast radius; touches a completed phase.
- **Benefit:** one convention forever — the cheapest long-term outcome per the brief.

**Option 3 — Normalise all event names to dotted namespaced.**
- No schema, no migration.
- **Contradicts the frozen convention text**, which specifies PascalCase; would require amending the convention in the Finance, Academic, and People specifications and renaming all People events.
- The brief records this as inference, not source-supported.

**Option 4 — Add `eventVersion` and `occurredAt` to the envelope; keep `emittedAt` as an alias.**
- No schema, no migration.
- **Amends a locked Phase 5 decision** and invalidates `emitAudited`'s shared-`eventId` contract and the audit dedup that depends on it.
- Only option that delivers `eventVersion`, which is what enables per-event evolution.

### 6.3 The owner's answer must cover four questions

| # | Question | Notes |
|---|---|---|
| (a) | **Which naming convention governs?** | The owner should note that Option 2 now includes 12 shipped Finance strings. Option 1 requires Finance to publish an event-name map |
| (b) | **Are `eventVersion` and `occurredAt` added to the envelope, or does Finance accept `emittedAt`?** | Option 4 amends locked Phase 5 infrastructure. This is a governance decision, not a Finance-local one |
| (c) | **For `StudentGraduated`, `StudentWithdrawn`, and the two enrollment events, which frozen specification is authoritative?** | `QUESTION NOT FULLY SPECIFIED — OWNER INPUT REQUIRED`. No source ranks the Finance, Academic, and People specifications against each other. **Related unresolved sub-question:** the two enrollment events the Finance spec names **do not exist at runtime under any name** — does the owner amend the Finance spec to the Academics names, or require Academics to emit the Finance names? |
| (d) | **Must Finance handle `PersonMerged` and `PersonSoftDeleted`, and what does it do with financial history when two Persons merge?** | `QUESTION NOT FULLY SPECIFIED — OWNER INPUT REQUIRED`. The People spec requires Finance to react; the Finance spec declares no handler. What "merging financial history" means — reassign, split, or refuse — is stated nowhere |

**A fifth item the owner should be aware of:** `StudentEnrolled` is emitted from two places, including applicant acceptance, and **neither** the Finance event table nor the People consumer tables name applicant acceptance as a billing trigger. The owner must state whether applicant acceptance triggers billing.

### 6.4 Dependencies

- **D-4 (c) gates all consumer-driven billing** — bill generation from enrolment or Summer School, refund eligibility on withdrawal, final billing on graduation, enrolment clearance on payment.
- **D-4 (d) gates FINANCE D-5 Option 2** — a parent/guardian payer rule expressed through `PersonRelationship` breaks if People merges Persons.
- **D-4 (a) Option 2 would additionally require** the D-7-adjacent question of whether renaming shipped event strings is permitted in Phase 6, since Finance events are not yet consumed.

### 6.5 Does it block the final batch?

**Yes.** No Finance consumer can be written against an unknown naming rule or an unknown ownership map. D-4 blocks the entire consumer-driven billing half.

---

## 7. FINANCE D-6 — PAYMENT / REFUND STATE OWNERSHIP

### 7.1 The current state, precisely

#### Legacy Refund — no independent state vocabulary

The legacy `Refund` model does **not** have its own enum. It **reuses the `PaymentStatus` enum**, which is shared with the legacy `Payment` model:

```
enum PaymentStatus { PENDING, COMPLETED, FAILED, REFUNDED }
```

**Consequence 1 — internal incoherence.** A refund can be recorded as `REFUNDED` while its own payment is still `PENDING`, because both read the same four values with no relationship enforced between them.

**Consequence 2 — the frozen workflow is unrepresentable.** The specification requires a four-state approval lifecycle: `Requested → Approved / Rejected → Processed`, enum `REQUESTED, APPROVED, REJECTED, PROCESSED`. The shared `PaymentStatus` enum **cannot express it**: there is no `APPROVED`, and `REJECTED` is absent. **The frozen refund approval workflow is not representable in the current legacy shape.**

**Consequence 3 — no approval fields.** The legacy `Refund` model has no approver, no approval timestamp, and no threshold, so BR-09's approval workflow has no substrate.

#### People — live `refundStatus` write path

- `StudentWithdrawalDetail.refundStatus` — a `VarChar(50)` free-text column on a **People-owned** model.
- Validated only by `@Matches(/^(PENDING|PROCESSED|DENIED)$/)`.
- Written at withdrawal time: `refundStatus: dto.refundStatus ?? 'PENDING'`, and updated when supplied.
- **The caller can set `refundStatus: 'PROCESSED'` in the same request that withdraws a student** — with no refund request, no approval, and no threshold escalation. BR-09's control is therefore bypassable *through* the People module, not merely unmet inside Finance.
- **Vocabulary mismatch:** People uses `PENDING | PROCESSED | DENIED`. The frozen Finance enum is `REQUESTED | APPROVED | REJECTED | PROCESSED`. **The frozen lifecycle has no `DENIED` state at all.**

#### Academics — live free-text `paymentStatus` write path

- `SummerSchoolRegistration.paymentStatus` — a `VarChar(50)` column on an **Academics-owned** model, validated only as a string with no enum.
- Writable on create **and mutable afterwards**.
- **Because it is free text, `'paid'`, `'PAID'`, and `'completed'` are all accepted** — three spellings of two different concepts. It can also be asserted and then retracted, with no Finance transaction at any point.
- The frozen Academic specification assigns Finance "payment status" as a **write** capability, compounding the ambiguity: the field is written by Academics from client input *and* nominally by Finance.

#### The refund record itself

- **`prisma.refund.*` has zero matches anywhere in the API source.** No Finance payment or refund service exists. No event is emitted for any payment or refund transition.
- **A student withdrawal therefore produces a refund *state* with no corresponding refund *record*.** `StudentWithdrawalDetail.refundStatus` is the only artifact.

### 7.2 What the specification requires

| Source | Statement |
|---|---|
| BR-027 | *"Payment gateway transactions are audit records; payment state owned by Finance"* |
| BR-025 | *"Summer School billing triggered by Academic Management events only"* |
| BR-026 | *"Finance owns all invoice calculation; other domains send billing requests"* |
| BR-009 | *"Refunds require approval workflow with threshold-based escalation"* |
| Lifecycle | `Requested → Approved / Rejected → Processed`; enum `REQUESTED, APPROVED, REJECTED, PROCESSED` |
| Roadmap P6.3 | *"Ensure payment state is not trusted from the client."* |
| ADR-008 | *"Gateway transactions are audit records; GatewayTransaction captures provider response; payment state is owned by Finance, not the gateway"* |

**Three mutually incompatible vocabularies currently exist** — Finance spec (unimplemented), legacy `PaymentStatus`, and People — so the two client-writable fields cannot even be compared to each other, let alone reconciled with Finance.

### 7.3 Documented options

**Option 1 — Finance owns both fields; the People and Academic columns become read-only projections written only by Finance event consumers; client input is removed.**
- No schema change, no migration. The columns stay.
- Trust is restored via Finance events; a `PaymentConfirmed` / `PaymentFailed` → projection write path is required.
- **Requires edits to Phase 4 (People) and Phase 5 (Academic) code** — both completed phases.
- **Cost:** two projection writers to maintain; projections can drift if an event is lost.

**Option 2 — Finance owns both; the People and Academic columns are removed entirely and consumers read Finance.**
- Drop 2 columns. **Requires a migration on completed tables.**
- Strongest: one representation, no drift possible.
- **Breaking for any existing reader; also requires Phase 4/5 edits.**
- Smallest Finance-side code, largest blast radius on past phases.
- **The brief notes a required precondition:** no runtime reader of these two columns was found, but *"this must be confirmed before choosing."*

**Option 3 — Defer remediation; Phase 6 ships Finance without touching the fields, accepting a known cross-module bypass of BR-09 and BR-027.**
- No schema, no migration, no implementation work.
- **The brief records this as not source-supported:** it contradicts roadmap P6.3 and BR-027.
- **A P6.6 security test cannot honestly pass under this option.**

### 7.4 The four sub-decisions the owner must make

| # | Question | Notes |
|---|---|---|
| 1 | **Confirm Finance as sole owner of payment and refund state** | BR-027 asserts it; the code currently contradicts it in two places |
| 2 | **Choose Option 1, 2, or 3** | Options 1 and 2 both require Phase 4/5 edits. Option 3 is a documented bypass |
| 3 | **Authorise a remediation pass against Phase 4/5 code, or explicitly accept deferral** | The brief states plainly that *"this gate must not touch"* completed phases, so **the owner must authorise crossing that boundary** — or choose to carry the bypass into Phase 6 knowingly |
| 4 | **Settle the canonical refund vocabulary** | `REQUESTED \| APPROVED \| REJECTED \| PROCESSED` (frozen) or `PENDING \| PROCESSED \| DENIED` (People's). Note: the frozen lifecycle has **no `DENIED`** state, and `RefundStatus` is already implemented in the specification's enum list — but **there is no `RefundStatus` enum in the Prisma schema today** |

**QUESTION NOT FULLY SPECIFIED — OWNER INPUT REQUIRED (sub-decision 4, detail):** if the frozen vocabulary is chosen, the owner must state what happens to `DENIED`, which exists in People's live field and in no specification. The three options the sources support are: map `DENIED` onto `REJECTED`; keep both and map at the projection; or leave `StudentWithdrawalDetail.refundStatus` as an independent operational state distinct from the Finance refund workflow. **No source states which.**

### 7.5 Ownership, migration, API, event, and security implications per option

| Dimension | Option 1 (read-only projections) | Option 2 (remove columns) | Option 3 (defer) |
|---|---|---|---|
| **Ownership model** | Finance sole owner; others project | Finance sole owner; others deleted | Split, undocumented |
| **Canonical vocabulary** | Finance's, applied by projection writer | Finance's | Three incompatible vocabularies coexist |
| **Affected modules** | People, Academics, Finance | People, Academics, Finance | Academics, People, Finance |
| **Migration** | None | Drop 2 columns on completed tables | None |
| **API** | Write paths removed; fields become read-only | Fields removed; clients reading them break | Unchanged — client still writes |
| **Events** | Requires `PaymentConfirmed` / `PaymentFailed` → projection write path; **FINANCE D-4 governs the naming** | Requires consumers to read Finance directly; **D-4 governs** | None |
| **Security** | Bypass closed; fields can no longer be forged | Bypass closed; strongest guarantee | **Known bypass persists into production** |
| **Phase 4/5 remediation required** | **Yes** | **Yes** | No |
| **BR-09 / BR-027 compliance** | Restored | Restored | **Not compliant** |
| **P6.6 security test** | Can pass | Can pass | **Cannot honestly pass** |

### 7.6 Can Finance proceed without D-6?

**Partially, and only for the already-built work.** Fee structure, fee schedules, bills, discounts, ledger accounts, journal entries, balances, financial policies, and financial periods are all independent of payment and refund state, and they are 74-test-green. **Finance cannot proceed with payments, refunds, write-offs, payment allocation, gateway reconciliation, refund eligibility, or financial clearance without D-6.**

### 7.7 Dependencies

- **FINANCE D-6 depends on FINANCE D-7** — the `REQUESTED → APPROVED` and `APPROVED → PROCESSED` transitions are approval operations, and `FinancialAuthorityGuard` cannot exist until the owner states the approval mechanism.
- **FINANCE D-6 depends on FINANCE D-8** — allocation rounding (V-PA-03 / I-02) is a D-8 question.
- **FINANCE D-6 depends on FINANCE D-12** — the spec-conformant `Payment` and `Refund` tables cannot be created while the legacy ones hold the frozen names.
- **FINANCE D-6 depends on FINANCE D-4** for the event names used in the Option 1 projection write path.

---

## 8. FINANCE D-12 — LEGACY FINANCE TABLE DISPOSITION

### 8.1 The exact question

Class: **REQUIRED — destructive-migration gate.**

> Archive, replace, or migrate the five legacy Finance tables: `FeeStructure`, `Invoice`, `Payment`, `Scholarship`, `Refund`.

### 8.2 Which tables are affected, and what is wrong with each

| Model | Defects against the frozen specification |
|---|---|
| **`FeeStructure`** | `Decimal(10,2)` (not `decimal(14,2)`); `academicYearId` required with optional `termId`, but BR-029 requires **session** scoping; status enum cannot express `Draft → Published` |
| **`Invoice`** | **No `institutionId` — a direct BR-01 violation** (BR-01: *"Every entity is tenant-scoped and institution-scoped"*); no `version` column; no `createdBy`/`updatedBy`/`deletedBy`; status enum has `PENDING` where the frozen lifecycle uses `Published`, and lacks `Generated`/`WrittenOff`; column named `balance` where the specification names `outstanding_balance`; unique key is `(tenantId, invoiceNumber)` with **no `institutionId`**, where the specification requires `(tenant_id, institution_id, invoice_number)` |
| **`Payment`** | **No `institutionId`**; no `version`; `reference` is **globally** unique where the specification requires tenant+institution scope; status uses `COMPLETED` where the frozen lifecycle uses `Confirmed`; `externalRef` nullable and unconstrained; **no `PaymentMethod.POS`**, which the specification's in-scope list requires |
| **`Scholarship`** | **No `institutionId`**; no `version`; status enum cannot express `Closed`; `amount` + `percentage` conflate the fund and the award, so BR-024 (award ≤ fund limit) is **unenforceable**; no `fund_limit` / `awarded_amount` split |
| **`Refund`** | **No `institutionId`**; no `version`; `status` **reuses the payment enum**, so the frozen `Requested → Approved/Rejected → Processed` is unrepresentable; no approval fields at all |

**Two structural facts the owner should have:**

1. **Four of the five models violate BR-01 outright** (no `institutionId`). In a multi-tenant, multi-institution system this is an isolation defect, not a cosmetic one.
2. **None of the five has a `version` column.** The frozen optimistic-concurrency rule and roadmap P6.2's *"protect balance calculations"* therefore have **no substrate at all** in the legacy tables.

### 8.3 What data currently exists

**Nine rows total, all demo fixtures from the seed:**

| Table | Rows | Detail |
|---|---|---|
| `fee_structures` | **3** | `Tuition Fee` 450,000 NGN; `Hostel Fee` 120,000 NGN; `Transport Fee` 80,000 NGN — all hard-coded `NGN` |
| `invoices` | **6** | 2 students × 3 fee structures. Each `invoiceNumber` is built as `` `INV-${studentNumber}-${category}-${Date.now()}` `` |
| `payments` | 0 | — |
| `scholarships` | 0 | — |
| `refunds` | 0 | — |

**Per D-13, all 9 rows are orphans** — they are the only rows these tables hold, and they carry five `NOT VALID` foreign-key constraints (four of them on Finance tables) that cannot be validated without deleting or repairing the rows.

### 8.4 Institution-ownership, versioning, naming, and precision issues

- **Institution ownership:** four of five tables have no `institutionId` at all, so institution-level ownership cannot be migrated *from* them even if the owner chooses migration. `FeeStructure` is the only one that has it.
- **Versioning:** no `version` column anywhere, so optimistic concurrency cannot be preserved through a migration.
- **Naming:** `Invoice.balance` vs the specification's `outstanding_balance`; `PaymentStatus.COMPLETED` vs `Confirmed`; `InvoiceStatus.PENDING` vs `Published`. A migration must map between vocabularies that do not correspond.
- **Precision:** all legacy monetary columns are `Decimal(10,2)` (max 99,999,999.99) where the specification mandates `Decimal(14,2)`. **Widening is required if rows are migrated; it is unnecessary if the tables are replaced.** The brief notes this explicitly as a confirmable point.

### 8.5 Documented options

**Option 1 — Archive all five tables and create the frozen 30 fresh.**
- **No row data is lost** — rows are preserved in archive tables.
- Follows the **locked Phase 5 precedent** for archive-not-rewrite, where five `NOT VALID` constraints were each annotated with a `COMMENT ON CONSTRAINT` recording the rationale. The archive path is already documented.
- **Any reader of the five legacy tables breaks.**
- **No `ALTER`, no precision widening, no vocabulary mapping.**

**Option 2 — Migrate the 9 rows into new tables.**
- Requires a transform whose shape **cannot represent the target for 4 of 5 models** (no `institutionId` to migrate from).
- Lossy or impossible.
- The brief notes the effort buys nothing at demo scale.

**Option 3 — In-place `ALTER`.**
- **The brief records this as forbidden by the gate** — a destructive Finance migration.
- Recorded for completeness only.

### 8.6 Dependencies — direction stated explicitly

**FINANCE D-12 gates FINANCE D-8 implementation work.** The brief classes D-12 as *"DEPENDENT on D-3, D-6, D-8"* and the schema makes the direction concrete: the spec-conformant `Invoice`, `Payment`, and `Refund` tables — and `DiscountApplication`, which is invoice-scoped — **cannot be created while the legacy tables occupy the frozen names.** D-8's arithmetic rule must be known before the replacement columns are written, so D-8's *decision* comes first, and D-12's *execution* is what unblocks the tables.

**FINANCE D-3 does NOT gate FINANCE D-12.** D-3 affects only the **currency-column disposition** of two tables that D-12 may archive: `FeeStructure.currency` and `Payment.currency`. Under D-3 Option 1 those columns are removed with their tables; under Option 2 they are replaced by a policy read. **Neither currency answer changes whether D-12 archives, migrates, or deletes.** The owner can answer D-12 without D-3, and D-3 without D-12.

**FINANCE D-6 depends on FINANCE D-12** — the direction is the reverse: D-6 needs the tables before payment and refund state can be modelled at all.

**Other dependencies:** D-13 (`NOT VALID` constraints) is *"DEPENDENT on D-12"* — if the tables are archived the constraints become irrelevant; if the tables survive in any form the constraints stay `NOT VALID` indefinitely.

### 8.7 The owner's answer must cover four points

1. **Confirm archive-then-create, or choose migrate, for all five tables.**
2. **Confirm whether the 6 seeded invoices and 3 fee structures are retained in the archive or discarded.**
3. **Confirm that the `Decimal(10,2)` → `decimal(14,2)` widening is unnecessary because the tables are replaced rather than altered** — or state otherwise if the owner chose migration.
4. **Confirm which Finance-owned columns, if any, are dropped versus archived.**

### 8.8 What this blocks

The spec-conformant `Invoice`, `Payment`, and `Refund` tables, and therefore **all settlement work**: payments, refunds, adjustments, `DiscountApplication`, discount application at billing time, gateway reconciliation, refund eligibility, financial clearance. This is the **largest single blocker in the Finance module** and it gates FINANCE D-8's implementation and FINANCE D-6.

**Nothing in the already-built P6.1/P6.2 work depends on D-12.** Fee categories, fee items, fee templates, fee schedules, fee schedule items, bills, discounts, ledger accounts, financial periods, journal entries, journal entry lines, account balances, and financial policies are all independent of the five legacy tables.

---

## 9. FINANCE D-5 — CONDITIONAL

### 9.1 The exact condition

**If the product requires a non-student invoice view or payment path, FINANCE D-5 must be resolved before implementation.**

**If invoice access is staff-only, FINANCE D-5 can remain off the critical path** and does not need to be answered to begin the final batch.

**D-5 is therefore conditional, not blocking, and is listed in this pack so the owner can close it in one line.**

### 9.2 What "staff-only" means in the existing authorization model

**Answering "staff-only" means all of the following hold, and no new mechanism is required:**

1. **Every invoice, bill, and financial record is read and written only by institution staff holding an institution-admin, principal, or bursar role.** No parent, guardian, or other non-staff actor reads a Finance record.
2. **Access is bounded by institution, not by person.** A staff member sees only the records of institutions they are an active member of. This is **already enforced and fails closed** — every Finance service derives institution from the trusted request context and filters on `tenantId` + `institutionId`.
3. **The relational payer rule is never evaluated.** No predicate of the form "this payer may see this student's invoice" is required, which matters because the existing `ObjectScopeGuard` cannot express it — its entire vocabulary is `tenantId` equality, `userId` equality, and `institutionId` equality. A payer rule is a join predicate over `PersonRelationship` with `isActive` and date bounds, which is outside that vocabulary.
4. **No parent-facing payment-initiation endpoint exists.** Payment initiation remains a student or staff action. The specification's own gateway flow names the **Student** as the paying actor.
5. **The `ObjectScopeGuard` `params.id` question is NOT part of D-5.** The short-circuit on non-`:id` routes is a **D-11** question, and the brief assigns it to D-11 explicitly. Closing D-5 as "staff-only" does not close D-11.

### 9.3 If the owner answers "staff-only"

- No payer entity, no `payer` scope type, no parent-facing Finance route, and no `PersonRelationship` dependency in Finance.
- The roadmap's P6.6 "unauthorized invoice access" test is satisfied by institution and tenant scoping, which already works.
- D-5 comes off the critical path entirely.
- **The decision still needs recording**, because a future parent-portal phase will re-open it, and the specification places that portal in Future.

### 9.4 If the owner requires non-student access

**QUESTION NOT FULLY SPECIFIED — OWNER INPUT REQUIRED.** The brief documents two options, both of which require a new mechanism:

- **Option 2 — read-only parent/guardian visibility** through the existing `PersonRelationship`, honouring `isActive` and date bounds; payment stays student-initiated. Requires a new scope type or a Finance-specific guard, plus a Finance↔person link on the invoice.
- **Option 3 — a new first-class Finance payer record.** The brief records this as having **no source basis** — the specification defines no payer table and the word "payer" does not appear in it.

**The owner must also state whether the non-student surface is read-only or includes payment initiation**, because the specification's own flow makes the student the paying actor and no source describes a parent-initiated payment.

### 9.5 Context the owner should have

**Two things in the repository point in different directions, and neither is authoritative:**

- The frozen specification places the parent payment portal in **Future**, and names the **Student** as the paying actor.
- A `parent/fees` page **exists in the web app** and shows invoices with a **pay-invoice action**. It is a client-side prototype with hard-coded data and no API calls.

A prototype is not a requirement. But if a parent-facing surface was designed, it may indicate intent that the frozen specification does not record.

### 9.6 Dependencies if D-5 becomes live

- **D-11** — object-scope enforcement; a new scope type would be required (the brief's D-11 Option 3).
- **FINANCE D-4** — `PersonMerged` merges two Persons and therefore merges their financial history, which breaks a relationship-based payer rule.
- **FINANCE D-7** — approval authority interacts with the payer scope.
- **D-2** — this is a cross-module ownership question, though `Finance Engineering.md:48` already excludes Parent profiles from Finance scope.

---

## 10. UNNUMBERED OWNER DECISION REQUIRED — DOCUMENTATION GAP

### 10.1 Aggregate document-total limit

**Label: `UNNUMBERED OWNER DECISION REQUIRED — DOCUMENTATION GAP`**

**No existing D-number covers this.** Verified by searching the entire decision brief for `overflow`, `maximum`, `max `, `cap`, `too large`, and `exceed`: **zero matches.** Each neighbouring decision was checked individually and none poses this question:

| Existing decision | Why it does not cover it |
|---|---|
| **FINANCE D-8** | Poses four sub-questions: mode, point, intermediate rounding, residue. **None of the four is a maximum-value question.** The brief's own text contains no occurrence of "maximum", "overflow", or "cap" |
| **FINANCE D-12** | Asks whether the `Decimal(10,2)` → `decimal(14,2)` widening is necessary *because the tables are replaced rather than altered*. That is a precision question about **replacement**, not a question about what the maximum document total should be |
| **D-16** | Concerns late-fee accrual. Its documented caps (P-06 late-payment max cap 20%, range 0–50; P-15 installment late-fee max cap 15%, range 0–50) are **percentage caps on penalties**, not caps on document totals |
| **D-13** | Concerns five `NOT VALID` foreign keys |

### 10.2 The confirmed problem

| Quantity | Value |
|---|---|
| Maximum single line amount | 999,999,999,999.99 |
| Lines on one document | 200 |
| **Aggregate** | **199,999,999,999,998.00** |
| `Decimal(14,2)` maximum | 99,999,999,999,999.99 |
| **Overflow** | **by 99,999,999,999,998.01** |

The aggregate lands in `Bill.totalAmount` (`Decimal(14,2)`) and, by the same arithmetic, in `AccountBalance.closingBalance` (`Decimal(14,2)`).

### 10.3 Why the current specification does not establish the correct behaviour

**Three independent facts:**

1. **The `Decimal(14,2)` type conforms exactly to the specification.** `Finance Engineering.md:752` mandates `decimal(14,2)`. The implementation is conformant — this is not an implementation defect.
2. **The specification states no maximum anywhere in the document chain that bounds a document.** A search of the specification for `overflow`, `maximum`, `at most`, `no more than`, `exceed`, and `too large` returns **no maximum on any monetary total.** The only matches are inequality rules in the *other* direction — BR-024 (scholarship award ≤ fund limit), I-02 (allocation ≤ outstanding balance), I-03, I-08, I-09, I-16 — all of which cap one value against another and none of which caps a document total.
3. **`InvoiceLineItem` is declared `1:N` with no bound.** The validation rules for line items cover required fields, the student reference, the session reference, and the line-item type enum. **There is no maximum line count and no maximum line amount.**

So an implementation asked to handle a document whose total exceeds the column's capacity has **no rule to apply** — it must either reject the document, clamp the total, split the document, or widen the column, and **the specification authorises none of those and forbids none of them.**

### 10.4 What a documented mechanism already exists — and what is missing from it

This is the most useful finding for the owner: **the mechanism and the home already exist. Only the policy rows are missing.**

`Finance Engineering.md` §6.5 defines a **20-row configurable policy table with Default and Range columns**, and `FinancialPolicy` is **already implemented** and versioned with `DRAFT → ACTIVE → SUPERSEDED`. The table already contains **cardinality and amount maxima of exactly the required shape**:

| ID | Policy | Default | Range |
|---|---|---|---|
| P-08 | Refund approval threshold (amount) | 50000 | 1000–1000000 |
| P-12 | **Max discounts per invoice** | 1 | **1–5** |
| P-13 | **Installment max count** | 12 | **2–24** |
| P-20 | Search results max | 100 | 20–500 |

**The gap is precise:** the table bounds *how many discounts* and *how many installments*, but contains **no row for a maximum line amount, a maximum line count per document, or a maximum document total.** The pattern, the range convention, the default convention, and the storage mechanism are all established. **What is missing is three specific rows, with values the owner must set.**

### 10.5 What implementation would otherwise have to guess

Without an owner answer, any implementation of the money path must invent at least one of these:

1. **Reject the document** with an error — silently capping what an institution can bill, with no policy row and no configuration point.
2. **Widen the column** — a schema change contradicting `:752`, with no decision recorded, affecting every monetary column.
3. **Clamp or saturate the total** — produces a document whose stated total does not equal the sum of its lines, violating BR-04 (`Invoice amount = sum of line items - discounts + tax + late fees`) and I-01.
4. **Split the document across multiple invoices** — a business behaviour stated nowhere, with numbering, allocation, and clearance consequences.
5. **Apply a per-line cap at entry** — which is a *policy* choice with a default and a range, exactly like P-12 and P-13, and therefore has a natural home.

**Note that option 5 is the only one that follows the specification's own established pattern**, but choosing it, and choosing the values, is an owner decision. **This pack does not choose it and does not propose values.**

### 10.6 Does it block the final batch?

**Yes, for any work that computes or stores a document total.** The affected live paths are bill total, discount computation, journal line aggregation, and account balance derivation. It does **not** block fee-structure, fee-schedule, or policy work, none of which computes a document total.

---

## 11. OWNER ANSWERS

*Each question below is stated so it can be answered without opening the repository. Reference the option numbers in this pack. Where an option set does not exist, the question says so.*

### FINANCE D-7

**Q1. Does Phase 6 introduce any new role for financial approval authority?**
Options: **(1)** Reuse `BURSAR`, separate request from approve purely through permissions. **(2)** Add one new role for approval authority above threshold. **(3)** Model authority as a delegation/threshold data capability rather than a role.
**Answer:** __________________

**Q2. For the 17 Finance resources currently held only by the five admin roles, is "admin-only" the final answer, or does a named role receive some of them? If a role receives them, list the role and the resources.**
*(No options are documented for this. `finance:journal:create`, `finance:ledger:create`, `finance:period:manage`, `finance:refund:approve`, `finance:write_off:approve`, `finance:fee_category:create`, and `finance:fee_item:create` are the highest-consequence.)*
**Answer:** __________________

**Q3. Which mechanism separates refund and write-off *request* authority from *approval* authority, and where does the BR-09 threshold value live?**
Options: **(1)** Permissions only, threshold as a `FinancialPolicy` value (P-08 already exists, default 50000, range 1000–1000000). **(2)** A separate approval role. **(3)** A delegation record.
**Answer:** __________________

**Q4. Is self-approval of a refund or write-off blocked? If yes, which identity comparison defines "self"?**
*(No source states this.)*
**Answer:** __________________

**Q5. May a period be closed by anyone other than the five admin roles?**
*(Today: period create/close requires `finance:period:create`, held only by the five admins. Period close is implemented and works. This question only decides whether it may be *extended*.)*
**Answer:** __________________

**Q6. May any role other than the five admins receive `finance:payment` (read, create, confirm, allocate)?**
*(Locked: `BURSAR` explicitly does not. Open: every other role.)*
**Answer:** __________________

**Q7. Does `BURSAR` receive `finance:fee_category` and `finance:fee_item`?**
*(Currently admin-only. Today a `BURSAR` can create and publish a fee schedule but cannot create the categories or items those schedules reference. ADR-037 explicitly left this undecided.)*
**Answer:** __________________

**Q8. Which of the four absent §9.5 guards must Finance own — `FinanceAccessGuard`, `ModuleLicenseGuard`, `FinancialAuthorityGuard`, `ImmutabilityGuard` — and for each, is it enforced by a guard, by service logic, or by database constraint?**
*(For reference: `FinanceAccessGuard` — access is currently enforced in services and fails closed. `ModuleLicenseGuard` — licensing is assigned to Institution Management by the specification's Out-of-Scope line. `FinancialAuthorityGuard` — blocked on Q3/Q4. `ImmutabilityGuard` — the rule is already stated as published invoices, confirmed payments, posted entries; only the enforcement mechanism is undecided.)*
**Answer:** __________________

### FINANCE D-8

**Q1. What is the rounding mode?**
Options: half-up, half-even (banker's), truncate, or another mode the owner names. *(No source names a mode.)*
**Answer:** __________________

**Q2. At what point is money quantised — per line item, per document, per journal entry, or at every persisted column?**
Options: **(1)** A single canonical quantisation helper applied once per persisted document, with mode and application point recorded in `FinancialPolicy`. **(2)** Quantise at every persisted `decimal(14,2)` column, no intermediate rounding. *(Option 3 — store unrounded and round for display — contradicts the specification's mandate that the columns themselves be `decimal(14,2)`.)*
**Answer:** __________________

**Q3. Do discount and tax round at each intermediate step, or only at the final total?**
*(Unstated. Applying 7.5% tax then a ₦50 discount to a ₦1,000 fee gives ₦875.00; discounting first then taxing gives ₦878.75.)*
**Answer:** __________________

**Q4. How is a sub-cent residue carried between the invoice chain and the journal chain so that total debits always equal total credits?**
*(Unstated. Rounding each payment allocation leaves a ₦0.01 outstanding balance that then blocks the final allocation under the "allocation ≤ outstanding balance" rule.)*
**Answer:** __________________

### FINANCE D-2 *(FINANCE D-register — configuration ownership)*

**Q1. For each of these six concepts, which single domain owns it — settlement currency, tax rules, invoice numbering, late-fee/penalty rules, gateway enablement, gateway credentials?**
Options: **(1)** Finance owns the values. **(2)** Institution owns the values via a typed JSON schema. **(3)** Split by category, with a written category→owner map.
**Answer:** __________________

**Q2. Does `institution_configurations` retain a `financial.*` namespace, and if so is it authoritative, a read-only projection of Finance tables, or removed?**
*(It exists today as a reserved, non-writable namespace. Gateway credentials cannot live in it regardless of the Q1 answer.)*
**Answer:** __________________

### FINANCE D-3 *(FINANCE D-register — settlement currency storage; terminology already locked by ADR-036)*

**Q1. Which single field is authoritative for institution settlement currency?**
Options: **(1)** `Institution.currency` — Finance reads it. **(2)** A `FinancialPolicy` currency policy row per institution — `Institution.currency` retained for display only. **(3)** Both, synchronised. *(Option 3 is recorded in the source as not source-supported: two writers with no enforcement.)* **Q1 requires FINANCE D-2 to be answered first.**
**Answer:** __________________

**Q2. Does `Institution.currency` remain writable?**
**Answer:** __________________

**Q3. Which write path performs the "fixed after first invoice" check (BR-015 / ADR-020)?**
**Answer:** __________________

**Q4. If `FinancialPolicy` is authoritative, does it supersede or overwrite — and how is the "fixed after first invoice" rule enforced given `DRAFT → ACTIVE → SUPERSEDED`?**
**Answer:** __________________

### FINANCE D-4

**Q1. Which event naming convention governs?**
Options: **(1)** Adopt the runtime as-is — PascalCase for People-originated, dotted for Academics-originated; Finance subscribes per source domain and publishes an event-name map. **(2)** Normalise everything to frozen PascalCase — *note this now also requires renaming the 12 Finance event strings already emitted, e.g. `finance.fee-schedule.published`.* **(3)** Normalise everything to dotted namespaced — contradicts the frozen convention text and requires amending three specifications.
**Answer:** __________________

**Q2. Are `eventVersion` and `occurredAt` added to the event envelope, or does Finance accept the existing `emittedAt`?**
*(Adding them amends a locked Phase 5 decision and invalidates the shared-`eventId` audit dedup.)*
**Answer:** __________________

**Q3. When Finance and People name different consumers for the same event — `StudentGraduated` and `StudentWithdrawn` — which frozen specification is authoritative?**
**Answer:** __________________

**Q4. The Finance specification names `StudentClassEnrolled` and `StudentClassTransferred` as billing triggers, but no runtime event of either name exists. Does the Finance specification get amended to the Academics event names, or must Academics emit the Finance names?**
**Answer:** __________________

**Q5. Must Finance handle `PersonMerged` and `PersonSoftDeleted`? If yes, what happens to financial history when two Persons are merged — reassign, split, or refuse the merge?**
**Answer:** __________________

**Q6. Does applicant acceptance (which emits `StudentEnrolled`) trigger billing? Neither the Finance event table nor the People consumer tables name it as a trigger.**
**Answer:** __________________

### FINANCE D-6

**Q1. Confirm Finance as sole owner of payment and refund state?**
Options: **(1)** Yes — the People and Academics columns become read-only projections written only by Finance event consumers, and client input is removed. **(2)** Yes — the People and Academics columns are removed entirely and consumers read Finance. **(3)** No / defer — ship Finance without touching the fields, accepting a known bypass. *(Option 3 is recorded in the source as not source-supported; it contradicts the roadmap's "ensure payment state is not trusted from the client" and a Phase 6.6 security test cannot honestly pass under it.)*
**Answer:** __________________

**Q2. Is a remediation pass against completed Phase 4 (People) and Phase 5 (Academic) code authorised?**
*(Options 1 and 2 both require it. The brief states the gate "must not touch" those phases, so this must be authorised explicitly — or the bypass must be knowingly accepted.)*
**Answer:** __________________

**Q3. What is the canonical refund state vocabulary?**
Options: `REQUESTED | APPROVED | REJECTED | PROCESSED` (frozen) or `PENDING | PROCESSED | DENIED` (People's live field). *(No Prisma `RefundStatus` enum exists today; the legacy model reuses the payment enum, which cannot express the frozen workflow at all.)*
**Answer:** __________________

**Q4. If the frozen vocabulary is chosen, what happens to `DENIED`, which exists in the live People field and in no specification?**
Options: map `DENIED` onto `REJECTED`; keep both and map at the projection; or leave `StudentWithdrawalDetail.refundStatus` as an independent operational state. *(No source states which.)*
**Answer:** __________________

### FINANCE D-12

**Q1. For all five legacy tables — `FeeStructure`, `Invoice`, `Payment`, `Scholarship`, `Refund` — is the disposition archive-then-create, migrate, or in-place `ALTER`?**
Options: **(1)** Archive all five and create the frozen tables fresh. **(2)** Migrate the 9 rows. **(3)** In-place `ALTER` — recorded in the source as forbidden by the gate.
**Answer:** __________________

**Q2. Are the 6 seeded invoices and 3 seeded fee structures retained in the archive, or discarded?**
**Answer:** __________________

**Q3. Confirm the `Decimal(10,2)` → `decimal(14,2)` widening is unnecessary because the tables are replaced rather than altered — or state otherwise if migration was chosen.**
**Answer:** __________________

**Q4. Which Finance-owned columns, if any, are dropped versus archived?**
**Answer:** __________________

**Q5. After the disposition, what happens to the five `NOT VALID` foreign-key constraints, four of which are on Finance tables?**
*(This overlaps D-13, which is dependent on D-12.)*
**Answer:** __________________

### FINANCE D-5 — CONDITIONAL

**Invoice access:** ☐ staff-only  ☐ non-student access required

*If "non-student access required":*

**Q1. Is the non-student surface read-only, or does it include payment initiation?**
*(The frozen specification makes the student the paying actor and places the parent payment portal in Future.)*
**Answer:** __________________

**Q2. If a non-student read is required, is the relationship expressed through the existing `PersonRelationship` (honouring active flag and date bounds), or through a new Finance-owned payer record?**
*(The existing object-scope guard cannot express a join predicate, so either option needs a new scope type or a Finance-specific guard.)*
**Answer:** __________________

### UNNUMBERED OWNER DECISION REQUIRED — AGGREGATE DOCUMENT-TOTAL LIMIT

**Q1. Is there a maximum amount per line item, a maximum number of line items per document, and a maximum total per document? If so, what are they?**
*(No source states any of the three. The specification's configurable-policy table already bounds max discounts per invoice (1–5) and max installment count (2–24) in exactly this shape, and `FinancialPolicy` is already implemented and versioned — the gap is three missing policy rows, not a missing mechanism.)*
**Answer:** __________________

**Q2. If a maximum is exceeded, what happens?**
Options: reject the document with an error; apply a per-line cap at entry; split into multiple documents; widen the column. *(No source authorises any of these. Clamping or saturating the total is not listed because it would break the "invoice amount = sum of line items − discounts + tax + late fees" rule.)*
**Answer:** __________________

**Q3. Where do these limits live — as `FinancialPolicy` rows in the existing configurable-policy table, or as hard-coded validation rules?**
**Answer:** __________________

---

## 12. DECISIONS REQUIRED BEFORE FINAL FINANCE IMPLEMENTATION

Listed in dependency order. Each entry is a genuine owner question that the repository cannot answer.

| # | Decision | Why it cannot wait |
|---|---|---|
| 1 | **FINANCE D-7** | Root of the authority tree. Blocks `FinancialAuthorityGuard`, `ImmutabilityGuard`, refund approval, write-off authorisation, and period-close authority. Gates **FINANCE D-6** |
| 2 | **FINANCE D-8** | Blocks every monetary path. Must precede **FINANCE D-12** so the replacement columns get the right arithmetic. Gates D-16 late fees and D-6 allocation |
| 3 | **UNNUMBERED — aggregate document-total limit** | A document total that exceeds `Decimal(14,2)`'s ceiling has no specified behaviour. No existing D-number covers it. Blocks bill totals, discount computation, journal aggregation, balance derivation |
| 4 | **FINANCE D-2** | Root of the configuration tree. Upstream of **FINANCE D-3**; gates D-9 credentials, D-16 penalty rules, D-17 numbering |
| 5 | **FINANCE D-3** | Terminology is locked; storage is not. Needs D-2 first. Affects every money path needing a currency read |
| 6 | **FINANCE D-4** | Blocks all consumer-driven billing: bill generation from enrolment, refund eligibility on withdrawal, final billing on graduation, enrolment clearance on payment |
| 7 | **FINANCE D-6** | Two live cross-module write paths exist today. The settlement half cannot be built until the authoritative owner and the canonical vocabulary are named. Needs 1, 2, and 8 |
| 8 | **FINANCE D-12** | **Critical path.** Blocks creation of the spec-conformant `Invoice`, `Payment`, and `Refund` tables, therefore all settlement work. Gates D-8 implementation and D-6 |

**Conditional — answer only if a non-student surface is wanted:** **FINANCE D-5** (1 line if staff-only).

**Total: 8 required decisions, 1 conditional decision.**

---

## 13. DECISIONS THAT CAN BE DEFERRED

| Decision | Why it does not block |
|---|---|
| **FINANCE D-1** (expenses) | A leaf with no dependents. No implemented Finance work depends on it, and nothing must be undone under any of the three options. May be decided after the batch starts, or deferred with a roadmap amendment |
| **FINANCE D-5** | If answered "staff-only", it is not on the critical path at all. If a parent surface is wanted later, it re-opens then |
| **D-9** gateway provider set and credentials | Not in the required set. Its credential-ownership half waits on D-2, but D-2 is required for a different reason |
| **D-16** late-fee scheduling and period mechanics | The brief classes it *"REQUIRED — not blocking"*. Period state-machine work is unaffected. Its arithmetic half waits on D-8, which is required anyway |
| **D-17** invoice numbering and gateway-reference uniqueness | Downstream. The legacy tables it would affect are inside D-12's scope |
| **D-11** `ObjectScopeGuard` registry and fail-open behaviour | The registry work is already done. The fail-open question is a design-hardening decision, not a prerequisite for the money path |
| **REGISTER-B D-1, D-2, D-3, D-4 … D-10** | Counting and status-convention questions. **No Finance decision in this pack depends on any of them.** They remain `SAFE-STOP` and are correctly out of scope |

---

## 14. FINAL BATCH STATUS

> **Status as of 2026-09-29: SUPERSEDED.** The owner has answered all eight required decisions and
> the one conditional decision. The current status is
> **READY FOR FINAL FINANCE IMPLEMENTATION PROMPT**, with the aggregate-limit **numeric defaults**
> carried as an explicit configuration prerequisite that must fail closed until owner-supplied
> values exist. See `docs/FINANCE_OWNER_DECISIONS_RECORD.md`.
>
> The placeholder prohibition below governed the period between this pack being issued and the owner
> answering. It is preserved as the point-in-time record. Note which prohibitions have since been
> **explicitly lifted by decision**: the rounding helper (D-8), the maximum-value policy mechanism
> (aggregate limits — values still pending), the four guards (D-7 Q8), the new permission grant
> (D-7 Q7), the spec-conformant `Invoice`/`Payment`/`Refund` tables and the archive action against
> the five legacy tables (D-12), and the People/Academics payment-refund write paths (D-6, remediation
> authorised). The event envelope and the 12 Finance event strings remain unchanged by decision
> (D-4 Q1, Q2). An Expense entity (D-1) and any payer entity or `payer` scope type (D-5, staff-only)
> remain out of scope.

### SAFE-STOPPED — awaiting owner decisions *(state at time of writing)*

**Eight owner decisions remain open** (FINANCE D-7 remainder, D-8, the unnumbered aggregate document-total limit, D-2, D-3, D-4, D-6, D-12), plus one conditional decision (FINANCE D-5).

The repository does not establish that any blocking decision is already resolved. The four guards that §9.5 mandates remain unbuilt; the two client-writable financial state fields remain writable; the spec-conformant `Invoice`, `Payment`, and `Refund` tables remain uncreatable; and no rounding, quantisation, or maximum-value rule exists anywhere in the specification or the code.

**No placeholder may be created for any of these.** Specifically, until the corresponding decision is answered, the following must not be written: a rounding or quantisation helper; a maximum-value policy; `FinancialAuthorityGuard`, `ImmutabilityGuard`, `ModuleLicenseGuard`, or `FinanceAccessGuard`; any new permission grant; an Expense entity; a payer entity or `payer` scope type; a parent-facing Finance route; a spec-conformant `Invoice`/`Payment`/`Refund` table; any archive, migrate, or delete action against the five legacy tables; any change to the event envelope; any rename of the 12 shipped Finance event strings; any change to the write path of `Institution.currency`.

**Work that CAN proceed without any owner decision** — because it depends on none of the eight — is listed in the readiness report §11-B and is unchanged by this pack: the missing dependency declaration, the journal-line `CHECK` constraint, the five missing query parameters, the `Bill.totalAmount` mapping correction, timestamp precision, documentation drift, lint configuration, and E2E execution once PostgreSQL is available.

---

## APPENDIX — Files inspected for this pack

**Primary:** `docs/FINANCE_DECISION_READINESS_REPORT.md`
**Decision register:** `docs/PHASE_6_DECISION_BRIEF.md` — D-6 (§L687-798), D-7 (§L800-940), D-8 (§L942-1061), D-11 (§L1151-1188), D-12 (§L1191-1234), D-13 (§L1237-1265), D-16 (§L1352-1396)
**Specification:** `engineering/Finance Engineering.md` — `:46`, `:48`, `:85-109` (ADR-036), `:111-148` (ADR-037), `:207-247` (ADR table), `:639-664` (policy table P-01…P-20), `:665-804` (validation rules, invariants I-01…I-26), `:1428-1442` (§9.5), `:1900-1929` (outstanding items, revision history)
**Other registers:** `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md`; `docs/DECISION_D1_SPECIFICATION_AUTHORITY.md`; `docs/DECISION_D2_COUNTABLE_UNITS_AND_GRANULARITY.md`; `docs/DECISION_D3_INVESTIGATION.md`; `docs/PHASE_6_SCOPE_VERIFICATION_REPORT.md`
**Roadmap:** `MASTER_SMS_ROADMAP.md` L686, L711, L717, L741
**Schema:** `apps/api/prisma/schema.prisma` (L206-211 `PaymentStatus`, L1214-1230 `SummerSchoolRegistration`, L3097-3112 `StudentWithdrawalDetail`); `apps/api/prisma/domains/finance.prisma` (all 22 models, all `Decimal(...)` declarations, the D-12 gate comment at L197-200); `apps/api/prisma/domains/institution.prisma` L72
**Seed:** `apps/api/prisma/seed.ts` — BURSAR grant block L929-934, legacy fee-structure rows L1344-1351, legacy invoice loop L1352-1368
**Implementation:** `apps/api/src/common/guards/*`; `apps/api/src/modules/auth/jwt-auth.guard.ts`; `apps/api/src/modules/institutions/institution-scope.guard.ts`; all five Finance controllers; all five Finance services; `finance.events.ts`; `apps/api/src/modules/events/event-envelope.ts`; `apps/api/src/modules/people/students.service.ts`; `apps/api/src/modules/people/dto/student.dto.ts`; `apps/api/src/modules/academics/services/summer-school.service.ts`; `apps/api/src/modules/academics/dto/academic-admin.dto.ts`
**Frontend:** `apps/web/src/app/bursar/expenses/page.tsx`; `apps/web/src/app/parent/fees/page.tsx`

**Commands run:** read-only `Select-String`, `Get-ChildItem`, and line-range reads. **No test suite was executed. No implementation change was made. Nothing was committed.**
