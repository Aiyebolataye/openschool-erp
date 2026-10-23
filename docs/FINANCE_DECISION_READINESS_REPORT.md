# FINANCE DECISION READINESS REPORT

> ## ✅ SUPERSEDED — 2026-09-29. The owner has decided.
>
> The decisions this report prepared for have been answered by the architecture owner on
> **2026-09-29**. The authoritative record is **`docs/FINANCE_OWNER_DECISIONS_RECORD.md`**, and the
> decisions are reconciled into **`engineering/Finance Engineering.md` (revision 1.8.0)**.
>
> - **8 required decisions resolved:** D-2, D-3, D-4, D-6, D-7, D-8, D-12, and the unnumbered
>   aggregate document-total limit.
> - **1 conditional decision resolved:** D-5 → **staff-only** (off the critical path).
> - **D-1** remains deferred and undecided.
> - **One bounded item remains open:** the aggregate-limit **numeric defaults**. Verified absent
>   from every authoritative source; no value has been invented or derived from `Decimal(14,2)`.
>
> **Current status: READY FOR FINAL FINANCE IMPLEMENTATION PROMPT**, with the aggregate-limit
> numeric defaults carried as an explicit configuration prerequisite that must fail closed.
>
> The findings below are **preserved exactly as written** as the point-in-time evidence record. The
> "Outcome: NO" row in the table below described the state at the time this report was written.

| Field | Value |
|---|---|
| **Document type** | Decision-preparation / evidence-gathering. No code, schema, migration, spec, ADR, or decision document was modified. |
| **Date** | 2026-09-29 |
| **Repository HEAD** | `aae6309` |
| **Branch** | `phase/2-rbac` |
| **Scope** | D-1 … D-8 of `docs/PHASE_6_DECISION_BRIEF.md`, plus the decisions they gate. |
| **Files changed** | **None.** This report is the only artifact created. |
| **Outcome** | **NO** — owner decisions remain. Seven decisions are required before the final Finance implementation batch can safely begin; one is conditionally required. *(State at time of writing; the owner answered on 2026-09-29 — see the banner above.)* |
| **Method** | Read-only inspection and read-only verification only. No product, architecture, or authority decision is made or recommended in this report. |

---

## 1. SOURCE-OF-TRUTH INVENTORY

### 1.1 Sources inspected

| Source | Role | Status |
|---|---|---|
| `engineering/Finance Engineering.md` (1938 lines) | Frozen Finance specification | Authoritative for Finance requirements; contains the two embedded ADRs cited below |
| `docs/PHASE_6_DECISION_BRIEF.md` (1646 lines) | Phase 6 Finance decision register, D-1 … D-18 | Authoritative record of what is *undecided* and the documented options |
| `docs/PHASE_6_SCOPE_VERIFICATION_REPORT.md` | Phase 6 coverage matrix, L403-420 | Cross-check; agrees with the brief on all eight decisions |
| `docs/DECISION_D1_SPECIFICATION_AUTHORITY.md` | **Different register** — D-1 specification-authority rule | See §1.2 |
| `docs/DECISION_D2_COUNTABLE_UNITS_AND_GRANULARITY.md` | **Different register** — D-2 countable units | See §1.2 |
| `docs/DECISION_D3_INVESTIGATION.md` | **Different register** — D-3 detail-section tie-break | See §1.2 |
| `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md` L691-700 | **Different register** — D-1 … D-10 counting/status conventions | See §1.2 |
| `MASTER_SMS_ROADMAP.md` L686 | Roadmap deliverable list (`- [ ] expenses`) | Conflicts with the frozen spec; see D-1 |
| `apps/api/prisma/domains/finance.prisma` | Finance schema (P6.1 + P6.2 + legacy scaffold) | Implementation evidence |
| `apps/api/prisma/schema.prisma` | Consolidated schema, legacy Finance models, shared enums | Implementation evidence |
| `apps/api/prisma/domains/institution.prisma` L72 | `Institution.currency` | Implementation evidence |
| `apps/api/prisma/seed.ts` | 32 Finance permissions, 5 admin grants, BURSAR matrix | Implementation evidence |
| `apps/api/src/common/guards/*` | `object-scope.guard.ts`, `permission.guard.ts`, `tenant.guard.ts` | Implementation evidence |
| `apps/api/src/modules/auth/jwt-auth.guard.ts`, `modules/institutions/institution-scope.guard.ts` | Additional guards that exist | Implementation evidence |
| `apps/api/src/modules/finance/**` (5 controllers, 5 services, 6 DTOs, events, 2 spec files) | Finance module | Implementation evidence |
| `apps/api/src/modules/people/students.service.ts`, `dto/student.dto.ts` | Withdrawal refund state | Implementation evidence |
| `apps/api/src/modules/academics/services/summer-school.service.ts`, `dto/academic-admin.dto.ts` | Summer School payment state | Implementation evidence |
| `apps/web/src/app/bursar/expenses/page.tsx`, `parent/fees/page.tsx` | Finance UI prototypes | Implementation evidence; see D-1, D-5 |

### 1.2 PRECEDENCE CONFLICT 1 — `D-n` identifiers collide across two unrelated registers

**This is the single most important source-of-truth finding in this report.**

Two independent registers both use the identifiers `D-1` … `D-10`, with entirely different subjects:

| Identifier | Register A — `docs/PHASE_6_DECISION_BRIEF.md` (Finance) | Register B — `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md` (counting/status) |
|---|---|---|
| D-1 | Expenses | Specification-authority rule when a summary conflicts with a detail section |
| D-2 | Financial configuration ownership | Countable unit and granularity per category |
| D-3 | Canonical settlement currency | Tie-break when a detail section contradicts itself |
| D-4 | Event contract, naming, consumer ownership | Positional vs named section references |
| D-5 | Payer and object scope | Project-wide phase-status vocabulary |
| D-6 | Financial status authority | Verification gate for `Complete` |
| D-7 | Roles, permissions, and guards | Specification-domain → repository mapping rule |
| D-8 | Decimal precision, rounding, balanced entries | Which document governs approval state |

Register B's D-1, D-2, and D-3 have dedicated documents (`DECISION_D1_…`, `DECISION_D2_…`, `DECISION_D3_…`), each of which explicitly scopes itself: *"D-2 … D-10 are **not** resolved here"*, and `DECISION_D3_INVESTIGATION.md` records its own result as **`SAFE-STOP`**.

**Consequence:** an unqualified reference to "D-3" in a ticket, prompt, or commit message is ambiguous. This report resolves the ambiguity by scope only, not by precedence: **all D-n references below mean Register A (`PHASE_6_DECISION_BRIEF.md`)**, because the request concerns Finance. This is a naming defect, not a decision, and it is recorded in §11-B.

**No precedence rule is asserted here.** Which register outranks the other is itself an open Register-B question, and asserting it would be an owner decision.

### 1.3 PRECEDENCE CONFLICT 2 — embedded ADRs vs the brief

`Finance Engineering.md` §3 contains ADR-001 … ADR-037. Two of them are marked as locking a decision named in the brief:

| ADR | Locks | Explicit self-limit |
|---|---|---|
| ADR-036 (`Finance Engineering.md:246`) | D-3 **terminology** | *"Terminology only: does not decide the storage mechanism for settlement currency, does not build a Finance currency store, and does **not** delete, rename, migrate, or reassign `Institution.currency`"* |
| ADR-037 (`Finance Engineering.md:247`) | D-7 **billing surface only** | *"Scope-limited: grants permissions only; introduces no role, permission, endpoint, or authorization behaviour; leaves `finance:fee_category` / `finance:fee_item`, refund and write-off authority, financial-period approval authority, and every other D-7 approval-authority question undecided"* |

Both are marked **LOCKED** for their stated scope and **PARTIALLY RESOLVED** for the remainder. Neither is treated here as closing its parent decision.

### 1.4 PRECEDENCE CONFLICT 3 — `Finance Engineering.md:48` vs §9.5 and the permission catalogue

- `:48` **Out of Scope:** `Authentication, Authorization, Roles, Permissions, MFA, Sessions (Identity & Access)` … and `Institution configuration, Licensing, Subscription management (Institution Management)`.
- `:1428-1442` **§9.5 Guards** mandates seven Finance-specific guards, including `FinanceAccessGuard`, `ModuleLicenseGuard`, `FinancialAuthorityGuard`, `ImmutabilityGuard`.
- `:125-129` and ADR-037 assign `BURSAR` Finance permissions.

**Assessment of the conflict's nature** (this is a scope-reading, not a decision): the two statements are *reconcilable* under the reading that Finance does not own the RBAC **system** (Identity/Access owns JWT, sessions, and the permission tables) but does own the Finance-specific guards and the Finance permission catalogue. Under that reading the conflict is documentation scope-drift and **does not block** permission registration or the existing 32-permission catalogue, which is already built and enforced by `PermissionGuard`.

**What it does leave open:** `:48` provides no statement about which of the seven §9.5 guards Finance must own versus inherit. That ambiguity is the substantive residue, and it is reported under D-5 and D-7 rather than resolved here.

### 1.5 PRECEDENCE CONFLICT 4 — roadmap vs frozen spec

`MASTER_SMS_ROADMAP.md:686` lists `- [ ] expenses`. The frozen Finance specification does not define an Expense entity. Document order does not settle this: the roadmap is a planning artifact, the specification is a frozen design artifact, and no source states which governs. Reported under D-1 as an unresolved owner decision.

---

## 2. D-1 — EXPENSES

### 2.1 What D-1 actually asks

`PHASE_6_DECISION_BRIEF.md:41`:

> Is `expenses` a Phase 6 Finance capability, and if so is it an aggregate, an account type, or deferred?

### 2.2 Current documented state

| Source | Says |
|---|---|
| `MASTER_SMS_ROADMAP.md:686` | `- [ ] expenses` — a Phase 6 deliverable checkbox |
| `Finance Engineering.md:46` (In Scope) | 18 capability groups, enumerated; **no expenses** |
| `Finance Engineering.md:1742-1748` / ADR-029 | `EXPENSE` exists as a **chart-of-accounts account type** |
| `Finance Engineering.md:1326` (Models) | 32 models listed; **no Expense model** |
| `Finance Engineering.md:1320`, `:1783` | `AccountType` enum: `ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE` |
| `apps/api/prisma/domains/finance.prisma` | No `Expense` model. `EXPENSE` appears only in `AccountType` and in the debit-normal set (`accounting.service.ts:44-47`) |
| `apps/api/src/modules/finance/services/accounting.service.ts:44-47` | `AccountType.EXPENSE` is a **debit-normal** account classification, i.e. an accounting type, not an entity |

The roadmap mentions expenses **once**, in a checklist line. The specification omits the entity from six independent structural sections and uses the word in a narrower, different sense.

### 2.3 NEW EVIDENCE NOT IN THE PRIOR AUDIT — an Expense prototype exists in the web app

`apps/web/src/app/bursar/expenses/page.tsx` **exists in source**. It is a client-side prototype with no API calls, but it is not empty of design content. It defines:

| Prototype element | Value |
|---|---|
| `type ExpenseStatus` | `"Approved" \| "Pending" \| "Rejected"` — an **approval workflow** |
| `interface Expense` fields | `id`, `item`, `category`, `amount`, `account`, `date`, `status` |
| ID scheme | `EXP-3051` (prefix + counter) |
| Categories | `Utilities, Salaries, Maintenance, Stationery, Transport, Ad-hoc` |
| Accounts | `Bank Account`, `Petty Cash` |
| User actions | "Add Expense" modal; row-click detail modal |
| Amount parsing | `parseInt(expAmount, 10)` — integer Naira, no minor units |

The remaining Bursar Finance pages (`bursar/payments`, `bursar/invoices`, `bursar/fees`) and `parent/fees` are prototypes of the same kind: hard-coded arrays, `useState`, no `fetch`/`axios`.

**Effect on D-1:** the brief states that Option 3 (a first-class Expense aggregate) is *"No source supports"* because *"the frozen spec gives no Expense columns, lifecycle, approval rules, or vendor/payables model."* That statement remains true of the **frozen specification**. It is no longer true of the **repository**: a UI prototype supplies columns, an approval lifecycle, and a category/account vocabulary. This does not make Option 3 decided — a UI prototype is not a frozen requirement, and it conflicts with the frozen spec rather than extending it — but the owner should be told that the evidence base for Option 3 is stronger than the brief records.

### 2.4 Implementation areas affected

Backend: none today (no model, no migration, no permission, no endpoint, no service). Frontend: one prototype page, self-contained. Chart of accounts: `AccountType.EXPENSE` already exists and is used for the debit side of refunds, scholarships, and write-offs, independent of the D-1 answer.

### 2.5 Does another decision depend on D-1?

No. D-1 is a leaf. It does not gate D-2 … D-8, does not gate D-12, and no implemented Finance work depends on it. Nothing currently built must be undone under any option.

### 2.6 Exact owner decision required

Choose one of the three options the brief already documents, and record it against the roadmap line:

1. Amend `MASTER_SMS_ROADMAP.md:686` to drop `expenses` from P6.1; `EXPENSE` remains an account type.
2. Retain the line; express expenses only as balanced journal entries against `EXPENSE` ledger accounts via the existing `finance:journal:create` path (`Finance Engineering.md:1582-1584`), no Expense aggregate.
3. Amend the frozen Finance specification to add a first-class Expense aggregate — which now requires reconciling the frozen spec with the existing `bursar/expenses` prototype (columns, approval workflow, categories, accounts, and the `parseInt` integer-Naira treatment, which conflicts with `decimal(14,2)` at `Finance Engineering.md:752`).

**No new options are introduced here.** The `parseInt`/integer-Naira observation in option 3 is reported as a fact about the existing prototype, not as a proposed design.

**Status: UNRESOLVED OWNER DECISION.** Not blocking the final batch under options 1 or 2; blocking under option 3.

---

## 3. D-2 — FINANCIAL CONFIGURATION OWNERSHIP

### 3.1 What D-2 actually asks

`PHASE_6_DECISION_BRIEF.md` §H (L256-259):

> Name the single owning domain for each of: settlement currency, tax rules, invoice numbering, late-fee/penalty rules, gateway enablement, and gateway credentials. Then state whether `institution_configurations` retains a `financial.*` namespace, and if so whether it is authoritative, a read-only projection of Finance tables, or removed.

### 3.2 Current documented state and the conflict with `Finance Engineering.md`

| Source | Says |
|---|---|
| `Finance Engineering.md:46` (In Scope) | *"configurable financial policies (**currency, tax, numbering, penalties**)"* — Finance owns these |
| `Finance Engineering.md:48` (Out of Scope) | *"**Institution configuration**, Licensing, Subscription management (Institution Management)"* |
| `Finance Engineering.md:640-664` §6.5 | Configurable Policies; `FinancialPolicy` is versioned and institution-scoped, UNIQUE `(tenant_id, institution_id, policy_type, policy_key, version)` (`:1138`) |
| `Finance Engineering.md:316` | `PolicyStatus`: `DRAFT, ACTIVE, SUPERSEDED` |
| ADR-020 (`:230`) | Currency is institution-scoped and fixed after first invoice |
| ADR-021 (`:231`) | Tax rules are institution-configurable |
| ADR-022 (`:232`) | Invoice numbering is sequential and institution-scoped |
| ADR-023 (`:233`) | Late payment penalties are configurable |
| `apps/api/prisma/domains/finance.prisma:412` | `model FinancialPolicy` is **implemented** (P6.2) |
| `apps/api/prisma/domains/institution-configuration.prisma` | `financial.*` namespace reserved but blocked |
| `apps/api/src/modules/finance/services/policy.service.ts`, `controllers/policy.controller.ts` | `FinancialPolicy` CRUD is **live** behind `finance:policy:*` permissions |
| `apps/api/src/modules/institutions/institution-configurations.service.ts` | Owns the reserved-namespace enforcement |
| `apps/api/src/modules/finance/reserved-config-namespaces.ts` | Reserve list; `financial.*` held for Finance |

**The conflict is direct:** the specification makes Finance the owner of currency, tax, numbering, and penalties, while excluding Institution configuration from Finance's scope. Those two clauses cannot both be the ownership rule, because Institution configuration is where institution-scoped configuration physically lives. The brief records this as the D-2 conflict and it remains open.

**Already decided, mechanically:** gateway credentials cannot live in `financial.*` JSON (brief L250-252). This is a prerequisite for D-9, not a D-2 choice.

### 3.3 Is D-2 already resolved anywhere?

No. No ADR covers configuration ownership. ADR-021/022/023/029 fix *that* the rules are institution-configurable; none names the owning domain or the storage home. `Finance Engineering.md:48` is the only statement that points away from Finance, and it is a scope exclusion, not an ownership assignment.

### 3.4 Implementation consequences

- Under "Finance owns": `FinancialPolicy` (already built) is the single home; the `financial.*` Institution namespace is removed or becomes a read-only projection. `Institution Management Engineering.md` §11.1 must be amended.
- Under "Institution owns values": a typed JSON schema and validation tier per category must be built — infrastructure the repository does not currently have.
- Under "split by category": a written category→owner map is required; the brief records this as the largest governance surface.

Live impact today: `policy.controller.ts` already exposes `GET/POST /finance/policies` and `GET /finance/policies/history`. Those endpoints work because `FinancialPolicy` exists; they do not yet conflict with anything. The conflict becomes load-bearing the moment a **second** writer appears — which is what D-3 is about.

### 3.5 Dependencies

- **D-3 depends on D-2.** The brief's D-3 Option 1 ("`Institution.currency` authoritative") is only coherent if Institution owns settlement currency, which is D-2's question. D-3 cannot be answered first.
- D-9 (gateway provider set and secret custody) depends on D-2 for the credential/ownership half.
- D-16 (period alignment and late-fee accrual) depends on D-2 for penalty-rule ownership.
- D-17 (invoice numbering) depends on D-2 for numbering ownership.

**Status: UNRESOLVED OWNER DECISION. Upstream of D-3, D-9, D-16, D-17.**

---

## 4. D-3 — CANONICAL SETTLEMENT CURRENCY

### 4.1 Current D-3 status: PARTIALLY LOCKED

`Finance Engineering.md:87-88` and ADR-036 (`:246`) are explicit:

> **Locked by decision D-3 (ADR-036).** The terms below are authoritative for the Finance domain and must be used consistently by implementers.

**LOCKED by ADR-036 — the following is closed and must not be re-decided:**

1. "Settlement currency" is Finance-owned and applies to invoices, payments, fees, refunds, adjustments, discounts, scholarships, and every other Finance-owned monetary operation (`:92`).
2. "Institution default currency" means the institution's Finance-owned **settlement currency**, explicitly *not* a display or formatting setting (`:93`).
3. Currency formatting/display is Institution/regional/localization and carries no settlement meaning (`:94`).
4. **The existence of a column does not transfer ownership.** `institution.currency` does *not* make Institution Management the owner of settlement currency (`:99-103`).
5. Settlement currency and currency formatting are distinct and must not be conflated (`:104-106`).

ADR-036 further states it *"does not decide the storage mechanism for settlement currency"* (`:246`).

### 4.2 What D-3 controls

Which single field is authoritative for institution settlement currency, whether `Institution.currency` remains writable, and where BR-015/ADR-020's "fixed after first invoice" check is enforced.

### 4.3 What is NOT locked

`Finance Engineering.md:1938` Revision History v1.3.0 closes the loop explicitly:

> The disposition of `Institution.currency` remains an **open D-3 implementation decision**.

### 4.4 Current on-disk homes — four, unresolved

| # | Location | Evidence | State |
|---|---|---|---|
| 1 | `Institution.currency String @default("NGN")` | `institution.prisma:72` | Migrated, populated, **writable** |
| 2 | `FeeStructure.currency String @default("NGN")` | `finance.prisma:455` | Legacy, per-row, schema default |
| 3 | `Payment.currency String @default("NGN")` | `finance.prisma:507` | Legacy, per-row, schema default |
| 4 | `institution_configurations` `financial.*` JSON | D-2 | Specified, reserved, unimplemented |

`apps/api/prisma/seed.ts:1193-1220` hard-codes NGN across 3 legacy fee structures. Neither legacy Finance table enforces the institution's currency: `FeeStructure` has `institutionId`, `Payment` does **not**.

### 4.5 What D-3 gates — and one premise correction

**Correction of a premise in the request:** the request states that D-3 "gates D-12 or any legacy Finance migration work." The repository shows the dependency runs the other way for the table-name conflict. `finance.prisma:197-200` states:

> `discount_applications` is deliberately NOT created here: §7.2 makes it invoice-scoped … and the spec-conformant `invoices` table cannot be created while the pre-P6.1 legacy `invoices` table occupies the frozen table name. **That table's archival is a separate, gated decision.**

So **D-12 (legacy Finance table disposition) gates D-3's and D-6's implementation**, because the spec-conformant `Invoice` table cannot be created until the legacy one is archived. D-3 does not gate D-12.

**Where D-3 → D-12 is correct:** D-3 determines the disposition of the `currency` column on the two legacy tables that D-12 will archive (`FeeStructure.currency`, `Payment.currency`). If D-3 Option 1 is chosen, those columns are *removed with their tables*; if Option 2, they are *replaced by a policy read*. That is a column-level dependency, not a table-level one.

### 4.6 Does anything remain for the owner?

Yes. D-3 remains open on: (a) the authoritative field, (b) whether `Institution.currency` stays writable, (c) the write path that enforces "fixed after first invoice" (BR-015 / ADR-020). ADR-020 states the constraint; nothing states the enforcement point.

**Status: TERMINOLOGY LOCKED (ADR-036). STORAGE AND ENFORCEMENT UNRESOLVED — owner decision required.**

---

## 5. D-4 — EVENT CONTRACT, NAMING, AND CONSUMER OWNERSHIP

### 5.1 What D-4 asks

`PHASE_6_DECISION_BRIEF.md:375` and §H (L541-545): (a) the governing event naming convention; (b) whether `eventVersion` and `occurredAt` are added to the locked envelope or Finance accepts `emittedAt`; (c) for `StudentGraduated`, `StudentWithdrawn`, and the two enrollment events, which frozen spec is authoritative; (d) whether Finance must handle `PersonMerged` and `PersonSoftDeleted`.

### 5.2 The envelope sub-question is LOCKED and out of scope for Finance

`apps/api/src/modules/events/event-envelope.ts:4-10` documents a **locked Phase 5 decision**: the envelope is extended **additively** and `emitAudited`'s shared-`eventId` audit dedup depends on its current shape. Adding `eventVersion`/`occurredAt` would amend a completed phase. `eventVersion` is absent repo-wide; `occurredAt` is replaced by `emittedAt`. `correlationId` and `actorId` **are** implemented in domain payloads via ALS.

Reported as: the brief's Option 4 is an amendment to locked Phase 5 infrastructure, not a Finance-local change. **Not decided here.**

### 5.3 NEW EVIDENCE — the naming question is partly pre-empted by Finance's own implementation

`apps/api/src/modules/finance/finance.events.ts:18-40` defines 12 events whose **constant names are PascalCase** (matching `Finance Engineering.md:81`) but whose **emitted strings are dotted and namespaced** — a third convention, distinct from both the frozen PascalCase rule and Academics' dotted strings:

```
FeeCategoryCreated:      'finance.fee-category.created'
FeeCategoryUpdated:      'finance.fee-category.updated'
FeeItemCreated:          'finance.fee-item.created'
FeeItemUpdated:          'finance.fee-item.updated'
FeeScheduleCreated:      'finance.fee-schedule.created'
FeeSchedulePublished:    'finance.fee-schedule.published'
BillGenerated:           'finance.bill.generated'
BillCancelled:           'finance.bill.cancelled'
DiscountCreated:         'finance.discount.created'
JournalEntryPosted:      'finance.journal-entry.posted'
FinancialPolicyCreated:  'finance.financial-policy.created'
FinancialPolicyUpdated:  'finance.financial-policy.updated'
```

**Consequence the owner must know before choosing:** brief Option 2 ("normalise all event names to frozen PascalCase") would now require renaming **12 already-emitted Finance event strings** in addition to the ~130 Academics constants. The brief's blast-radius estimate predates this file. No Finance event is currently consumed by anything, so no consumer breakage results today.

### 5.4 Current ownership state — verified

| Event | Frozen Finance consumer | Frozen other-domain consumer | Runtime reality |
|---|---|---|---|
| `StudentGraduated` | `PeopleConsumer` (`:1457`) | `FinanceConsumer` (`People Engineering.md:1179`) | Emitted `students.service.ts:584` |
| `StudentWithdrawn` | `PeopleConsumer` (`:1457`) | `FinanceModule` (`People Engineering.md:387`) | Emitted `students.service.ts:728` |
| `StudentClassEnrolled` / `StudentClassTransferred` | `AcademicManagementConsumer` (`:1456`) | Academic assigns them to Audit/Attendance/People, **Finance absent** (`:388-389`) | **No runtime event of either name exists**; equivalents are `academics.enrollment.created` / `.transferred` |
| `SummerSchoolRegistered` | `AcademicManagementConsumer` (`:1456`) | Academic `:240`, `:1443` assign Finance; `:418` omits Finance | Emitted `academics.summer-school.registered` |
| `PersonMerged` | **none declared** | `FinanceModule` required (`People Engineering.md:411`) | Emitted `people-merge.service.ts:455` |
| `PersonSoftDeleted` / `PersonRestored` | **none declared** | `FinanceModule` required (`People Engineering.md:381,383`) | — |
| `StudentEnrolled` | **undeclared third billing trigger** | — | Emitted from **two** places: `students.service.ts:345`, `applicants.service.ts:644` |

**Verified current state:** `finance.events.ts` has **12 producers and zero consumers**. The only `*Consumer` class in the codebase is `AuditLogConsumer`. `people-merge.service.ts:14` explicitly defers: *"MergeConsumer responsibility (§9.6) — out of the People batch scope."*

### 5.5 Is D-4 resolvable from the repository?

**Partially, and only for facts, not for choices:**
- *Mechanically established*: the naming conventions actually in use (People PascalCase, Academics dotted, Finance dotted-with-PascalCase-constants); the two missing runtime enrollment events; the four undeclared Finance handlers; the undeclared applicant-acceptance billing trigger.
- *Not resolvable*: which convention is authoritative; which frozen spec wins when Finance and People disagree on the same event; whether Finance must handle `PersonMerged` and what it must do with merged financial history.

**Status: UNRESOLVED OWNER DECISION.** Naming sub-question is now partly pre-empted by 12 shipped event strings.

---

## 6. D-5 — FINANCE ACCESS / AUTHORIZATION

### 6.1 What §9.5 requires

`Finance Engineering.md:1428-1442` mandates seven guards and an ordered flow:

> **Authorization flow:** JwtAuthGuard → TenantGuard → InstitutionGuard → FinanceAccessGuard → ModuleLicenseGuard → controller execution. For approval operations: FinancialAuthorityGuard is added. For published records: ImmutabilityGuard prevents writes.

### 6.2 Which of the seven guards exist

| §9.5 guard | Exists? | Location | Used by Finance controllers? |
|---|---|---|---|
| `JwtAuthGuard` | **Yes** (as a class) | `apps/api/src/modules/auth/jwt-auth.guard.ts` | **Not directly** — Finance uses `AuthGuard('jwt')`, the Passport equivalent, at the top of every controller |
| `TenantGuard` | **Yes** | `apps/api/src/common/guards/tenant.guard.ts` | **No** — exists, not applied to any Finance controller |
| `InstitutionGuard` | **Yes** (as `InstitutionScopeGuard`) | `apps/api/src/modules/institutions/institution-scope.guard.ts` | **No** |
| `FinanceAccessGuard` | **No** | — | — |
| `ModuleLicenseGuard` | **No** | — | — |
| `FinancialAuthorityGuard` | **No** | — | — |
| `ImmutabilityGuard` | **No** | — | — |

**3 of 7 exist; 4 are absent. Of the 3 that exist, 1 is used by Finance in a different form and 2 are not applied to Finance at all.**

### 6.3 Which Finance controllers use what

All five Finance controllers declare the identical guard chain:

```ts
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
```

- `controllers/fees.controller.ts:47` — `finance/fees`
- `controllers/billing.controller.ts:34` — `finance/bills`
- `controllers/discount.controller.ts:25` — `finance/discounts`
- `controllers/accounting.controller.ts:33` — `finance/accounting`
- `controllers/policy.controller.ts:28` — `finance/policies`

**14 of 34 Finance routes carry `@ObjectScope({ type: 'institution', model: … })`; 20 do not.**

### 6.4 Which authorization responsibilities are enforced in services today — verified

Service-level institution and tenant scoping is **consistently and fail-closed** implemented. Every Finance service derives institution from the trusted request context and filters on it:

- `accounting.service.ts:83,104,162,184,216` — `const institutionId = this.assertInstitutionContext(ctx);`
- `accounting.service.ts:86,165` — `institutionWhere(ctx.tenantId, institutionId)`
- `accounting.service.ts:195` — `where: { id, tenantId, institutionId }`
- `accounting.service.ts:277` — rejects a ledger account belonging to another institution
- The same `assertInstitutionContext` + `institutionWhere` pattern appears in `billing.service.ts`, `discount.service.ts`, `fees.service.ts`, and `policy.service.ts`

This matches the object-scope rule that ADR-037 declares **LOCKED and unaffected by D-7** (`Finance Engineering.md:133-135`):

> Object-level rules are unaffected by this decision and continue to apply: tenant and institution are taken from the trusted JWT, an active institution membership is required, and cross-tenant or cross-institution access fails closed. A grant never widens object scope.

**The 20 undecorated routes are therefore protected by service predicates, not left open.** This is a coverage-asymmetry finding, not a vulnerability finding.

### 6.5 Is service-level enforcement explicitly acceptable under the specification?

**Not explicitly.** §9.5 mandates `FinanceAccessGuard` as a discrete guard in the ordered flow. The specification nowhere states that a service-layer predicate is an acceptable substitute. Conversely, the specification also nowhere states that guard-layer coverage must be exhaustive.

**This ambiguity is the substance of the D-5/D-7 guard question, and it is not resolved here.**

### 6.6 Is `ObjectScopeGuard` expected to be the authoritative enforcement mechanism?

**No — and this is mechanically established.** The guard's entire predicate vocabulary is column equality: `tenantId` equality, `userId` equality, `institutionId` equality (`object-scope.guard.ts:99-101, 129-131, 179-184`). It supports exactly three enforcing scope types — `tenant`, `self`, `institution` — plus pass-throughs `none` and `authOnly` (`:42, 57-75`).

The relational rule a payer-facing feature needs — *this payer may see this student's invoice* — is a **join predicate** over `PersonRelationship` with `isActive` and date bounds. That is **outside the guard's vocabulary**, so `ObjectScopeGuard` is not a candidate mechanism for D-5 Option 2. A new scope type or a Finance-specific guard is required.

### 6.7 Current `ObjectScopeGuard` behaviour — reported, not changed

**Finance models are registered** (`object-scope.guard.ts:283-306`), contradicting the D-11 packet's stale claim that the registry contains no Finance models:

```
feeCategory, feeItem, feeSchedule, bill, discount,
ledgerAccount, financialPeriod, journalEntry, financialPolicy
```

`bill` also selects `studentPersonId` and `feeScheduleId`. Unregistered names throw `ForbiddenException('Unsupported object scope model')` (`:286-288`).

Three verified fail-open behaviours, all **pre-existing and independent of D-5**:

1. **No object scope declared** → `ObjectScopeGuard` returns immediately. The 20 undecorated Finance routes rely on service predicates.
2. **`params.id` absent** → the guard reads **only** `request.params.id` (`:88, 117, 167`). A route parameter named anything else is invisible. Concretely: `if (!objectId || !model) { return true; }` at `:90-92`, `:119-121`, `:169-171`. The frozen spec's own route `GET /api/v1/finance/invoices/student/:studentId` (`Finance Engineering.md:1554` §10.3) uses `:studentId`, so under current logic **every** scope type short-circuits to `true` on that route. That route is not implemented, so there is no live exposure today.
3. **Collection routes** → no `params.id`, therefore no guard-level check, therefore service predicates are the only boundary.

The brief itself records this as belonging to **D-11, not D-5** (`:674-675`): *"Independent of the choice: the `params.id`-only short-circuit must be addressed for Finance routes regardless — it is D-11, not contingent on the payer decision."*

### 6.8 Does D-5 depend on D-7 and D-11?

- **D-7 → D-5:** yes. If refund/write-off approval authority is granted to a non-admin operational role, `FinancialAuthorityGuard` becomes load-bearing and D-5's payer question interacts with it.
- **D-5 → D-11:** yes, and the direction matters. D-11 (`ObjectScopeGuard` registry and fail-open behaviour) is a **prerequisite** for any D-5 option that relies on the guard. D-5 Option 1 still needs D-11 to close the `:studentId` short-circuit.
- **D-5 → D-4:** D-5 Option 2 "breaks if People merges Persons" (brief `:661`) — merging two Persons merges their financial history, which is the D-4 `PersonMerged` question.

### 6.9 Can D-5 be resolved from existing documents?

**No.** The frozen specification **never uses the word "payer"** — zero occurrences. The brief's evidence is decisive on the facts:

- `Finance Engineering.md:1718` — the gateway flow names the **Student** as the paying actor
- `Finance Engineering.md:1913` — *"Low | Parent payment portal | Future"* — explicitly deferred
- `People Engineering.md:62`, ADR-003, ADR-010 — payer-adjacent vocabulary lives in **People**, not Finance
- `MASTER_SMS_ROADMAP.md:741` (P6.6) requires an "unauthorized invoice access" test but defines no payer role or entity

**Repository tension the owner must weigh:** `apps/web/src/app/parent/fees/page.tsx` exists and shows invoices with a **pay-invoice action** (`initialInvoices`, `payInvoice` state). The frozen spec places the parent portal in Future. This is a prototype, not a requirement, and it is not authoritative — but it is evidence that a parent-facing surface was designed.

**Status: UNRESOLVED OWNER DECISION. Conditionally blocking** — only if the owner wants any non-student invoice view or payment path in Phase 6.

---

## 7. D-6 — PAYMENT / REFUND STATE OWNERSHIP

### 7.1 What D-6 asks

`Finance Engineering.md:1316` defines the Finance state machine:

> `RefundStatus | REQUESTED, APPROVED, REJECTED, PROCESSED`

`PHASE_6_DECISION_BRIEF.md:689` classifies it as the **trusted payment-state boundary**, and identifies the current problem as *"existing client-writable financial status."*

### 7.2 The three competing state models — audited

**Finance (frozen spec, `:1316`)** — `RefundStatus`: `REQUESTED, APPROVED, REJECTED, PROCESSED`.
Implemented? **No Finance payment or refund model exists.** `domains/finance.prisma` contains P6.1 + P6.2 models plus the legacy scaffold; neither `Refund` nor `Payment` in the spec sense is built. `BillStatus` (`:78`) is `GENERATED, SENT, CONVERTED, CANCELLED` — a bill lifecycle, not a settlement state.

**Legacy Finance (implemented)** — `schema.prisma:206-211`:

```
enum PaymentStatus { PENDING, COMPLETED, FAILED, REFUNDED }
```

**Correction of a premise in the request:** the legacy `Refund` model does **not** have its own state set. It **reuses `PaymentStatus`** — `schema.prisma:2073`: `status PaymentStatus @default(PENDING)`. The values `PENDING, COMPLETED, FAILED, REFUNDED` are one shared enum serving both `Payment` (`:2032`) and `Refund` (`:2073`). There is no separate `COMPLETED`/`FAILED`/`REFUNDED` refund vocabulary.

**People (implemented)** — `apps/api/src/modules/people/dto/student.dto.ts:20`:

```ts
export const REFUND_STATUSES = ['PENDING', 'PROCESSED', 'DENIED'] as const;
```

Persisted on the **People-owned** model `StudentWithdrawalDetail` (`schema.prisma:3097-3112`): `refundStatus String? @map("refund_status") @db.VarChar(50)`.

**Academics (implemented)** — `SummerSchoolRegistration.paymentStatus String? @db.VarChar(50)` (`schema.prisma:1221`).

### 7.3 Which module currently owns each state

| State | Owned by | Backing type | Finance involvement |
|---|---|---|---|
| `REQUESTED/APPROVED/REJECTED/PROCESSED` | Finance (frozen spec) | **not implemented** | — |
| `PENDING/COMPLETED/FAILED/REFUNDED` | Legacy Finance | `PaymentStatus` enum, shared by `Payment` + `Refund` | No service writes either; legacy scaffold untouched |
| `PENDING/PROCESSED/DENIED` | **People** | `VarChar(50)` free text on `StudentWithdrawalDetail` | **None** |
| Summer School payment state | **Academics** | `VarChar(50)` free text on `SummerSchoolRegistration` | **None** |

### 7.4 Is there a live cross-module bypass? — CONFIRMED, two of them

**Bypass 1 — Academics, caller-controlled free text.**

- `apps/api/src/modules/academics/dto/academic-admin.dto.ts:242` — `paymentStatus?: string;` — **no enum, no `@IsIn`, no validation**
- `apps/api/src/modules/academics/services/summer-school.service.ts:233` — `paymentStatus: dto.paymentStatus` on create
- `apps/api/src/modules/academics/services/summer-school.service.ts:259` — `data: { paymentStatus: dto.paymentStatus, … }` on update
- `apps/api/src/modules/academics/services/summer-school.service.ts:267` — `changes: { paymentStatus: dto.paymentStatus }` in the audit trail

An Academics-scoped caller can set an arbitrary string into a financial payment-state field. This is a **live write path today**, not a hypothetical.

**Bypass 2 — People, regex-validated but Finance-unowned.**

- `apps/api/src/modules/people/dto/student.dto.ts:197-200` — `@Matches(/^(PENDING|PROCESSED|DENIED)$/)` — the only validation
- `apps/api/src/modules/people/students.service.ts:708` — `refundStatus: dto.refundStatus ?? 'PENDING'`
- `apps/api/src/modules/people/students.service.ts:716` — conditional update of `refundStatus`

Validation restricts the value set; it does not create Finance authority, a Finance `Refund` row, a journal entry, or an event. **Student withdrawal produces a refund *state* with no refund *record*.**

**Verified absence:** no `prisma.refund.*` call exists anywhere in `apps/api/src`. No Finance payment or refund service exists. No event is emitted for either transition. `Refund.status` reuses `PaymentStatus`, so a refund can be `REFUNDED` while the underlying payment is `PENDING` — the shared enum cannot express the spec's four-state approval workflow.

### 7.5 Model ownership

`Payment` and `Refund` are both **legacy Finance** models pending D-12. They are not the spec's `Payment` (with `PaymentAllocation`, `GatewayTransaction`, `PaymentReconciliation`) or the spec's `Refund` (`RefundStatus`, `RefundMethod`). The spec-conformant versions cannot be created while the legacy tables occupy the frozen names — `finance.prisma:197-200`.

### 7.6 Do the D-6 alternatives still hold?

Yes. The brief's two options remain the actual alternatives, unchanged by the code:

- **Option 1** — Finance becomes the sole authoritative owner of payment/refund state; Academics and People stop writing financial status and consume Finance events instead.
- **Option 2** — the current split is formalized: Academics/People keep ownership of their own operational state, and a documented boundary says financial settlement truth lives only in Finance.

**This report does not choose between them.** Both are live in the repository today; the code currently implements Option 2's *behaviour* without its *documentation*.

### 7.7 What exact owner decision is required

1. Does Finance become the **sole authoritative owner** of payment and refund state, and do the Academics `paymentStatus` and People `refundStatus` fields become read-only projections of Finance state?
2. If not sole: what is the documented boundary, and which module is authoritative for a withdrawal refund that has reached the institution's bank but not a Finance record?
3. What happens to the two live bypasses — are the Academics and People write paths removed, restricted, or retained?
4. What authority approves a refund transition (`REQUESTED → APPROVED` and `APPROVED → PROCESSED`)? This is D-7/BR-09/ADR-011 territory and is **not** decided by ADR-037.

**Status: UNRESOLVED OWNER DECISION. Two live bypasses confirmed. Blocks the entire settlement half of the final batch.**

---

## 8. D-7 — FINANCIAL AUTHORITY / ROLE MATRIX

### 8.1 What D-7 asks

Whether Phase 6 can adopt the existing Phase 2 RBAC architecture as-is, and what supplies refund, write-off, and other financial approval authority. `PHASE_6_DECISION_BRIEF.md:409` phrases it as: *"Resolve the RBAC contradiction: line 48 excludes Roles/Permissions while section 9.5 mandates 4 guards and 63 `finance:*` permissions."*

### 8.2 LOCKED by ADR-037 — do not re-decide

`Finance Engineering.md:113` and ADR-037 (`:247`). Marked *"Locked by decision Phase 6 D-7 (ADR-037), for the billing surface only"* and *"authoritative for the Finance domain and must be used as-is by implementers."*

**BURSAR receives exactly these 14 grants:**

| Role | Resource | Actions |
|---|---|---|
| `BURSAR` | `finance:fee_schedule` | `read`, `create`, `update`, `manage` |
| `BURSAR` | `finance:bill` | `read`, `create`, `convert`, `cancel` |
| `BURSAR` | `finance:invoice` | `read`, `create`, `manage`, `cancel`, `update`, `adjust` |

Verified against the seed, which matches the ADR action-for-action — `apps/api/prisma/seed.ts:929-934`:

```ts
roleName: 'BURSAR',
grants: [
  { resource: 'finance:fee_schedule', actions: ['read','create','update','manage'] },
  { resource: 'finance:bill',         actions: ['read','create','convert','cancel'] },
  { resource: 'finance:invoice',      actions: ['read','create','manage','cancel','update','adjust'] },
],
```

4 + 4 + 6 = **14 grants. Confirmed conforming.**

**BURSAR explicitly does NOT receive** — `Finance Engineering.md:131`:

> **`BURSAR` receives no `finance:payment` permission.** Settlement is outside this decision.

Also **LOCKED** — object-scope policy, explicitly unaffected by D-7 (`:133-135`): tenant and institution come from the trusted JWT; active institution membership required; cross-tenant/cross-institution fails closed; a grant never widens object scope.

**LOCKED** — the five admin roles (`PLATFORM_ADMIN`, `ORG_ADMIN`, `PRIMARY_INSTITUTION_ADMIN`, `INSTITUTION_ADMIN`, `PRINCIPAL`) hold **every** Finance permission (`:121-122`).

### 8.3 What remains open — quoted from the ADR itself

`Finance Engineering.md:137-148`, *"Explicitly outside ADR-037 … must not be read as granted, denied, or implied"*:

- `finance:fee_category` and `finance:fee_item` — the fee-structure catalogue
- refund and write-off authority (BR-09, BR-011) — including any threshold mechanism and whether self-approval is blocked
- financial-period approval authority
- every other approval-authority question covered by Phase 6 D-7
- all remaining Finance resources and their role assignment

ADR-037 also states it *"introduces **no** new role, no new permission, no new endpoint, and **no** authorization behaviour** beyond the grants tabulated above."*

### 8.4 What BURSAR currently receives, in the running system

- **14 grants**, exactly matching ADR-037.
- `seed.ts:911-919` documents the reasoning: *"BURSAR receives the billing groups — fee_schedule, bill, invoice … ADR-037 enumerates BURSAR's Finance role → permission matrix, so extending BURSAR here would invent authority. Whether a BURSAR or accountant role may post journal entries or read …"*
- `seed.ts:546`: *"ADR-037 grants it to BURSAR, so removing it would contradict a ratified ADR."*

### 8.5 Does D-7 require changes to BURSAR?

**Unknown, and that is the open question.** ADR-037 locks the current 14. Whether BURSAR should receive anything beyond them is undecided. **No permission is granted in this report.**

### 8.6 Does D-7 require a broader Finance role/authority matrix?

**Yes — and the specification admits it has none.** `Finance Engineering.md:115-119`:

> §10.3 maps every Finance endpoint to a `{domain}:{resource}:{action}` permission, but this specification provides **no Finance role matrix** — it names no Finance role and assigns no permission to any role. The mapping below is therefore decided here and is not derived, inferred, or carried over from any other domain's role matrix.

ADR-037 is a **partial patch to a specification that has no role matrix at all.** 20 of the 20 implemented Finance resources' role assignments, beyond the 3 BURSAR resources, are addressed only by "the five admin roles hold every Finance permission." No non-admin operational role exists for any other Finance resource.

### 8.7 Does §48 conflict with §9.5 and the implemented permission catalogue?

**Yes, and the conflict is of different kinds in different places:**

| Aspect | §48 effect | Blocks implementation? |
|---|---|---|
| Permission **registration** (32 permissions) | None — Identity/Access owns the mechanism; Finance owns the catalogue entries | **No.** Already built, seeded, enforced by `PermissionGuard` |
| Admin **grants** (5 roles × all permissions) | None | **No.** Seeded and verified |
| BURSAR **grants** | None — ADR-037 supplies them explicitly | **No.** Seeded and verified |
| The 4 absent §9.5 **guards** | §48 excludes "Authorization"; §9.5 mandates them. No source says which Finance must own | **Yes** — see §8.8 |
| **Approval authority** (refund, write-off, period close) | §48 excludes "Roles/Permissions"; §9.5 mandates `FinancialAuthorityGuard`; ADR-037 defers it | **Yes** — no authority exists to encode |

**Assessment:** the conflict is **documentation scope-drift for the permission catalogue** (not a blocker) and a **substantive authority gap for guards and approvals** (a blocker). Both readings are consistent with the sources; the sources do not choose between them, and this report does not.

### 8.8 What depends on D-7

| Dependency | Status if D-7 stays open |
|---|---|
| `FinancialAuthorityGuard` (refund/write-off approval) | **Cannot be built** — no authority rule to enforce |
| `ImmutabilityGuard` (published invoices, confirmed payments, posted entries) | **Cannot be built** — no immutability rule to enforce |
| `finance:period:create` / period close | Implemented, admin-gated only. Works as-is; cannot be extended to a non-admin role |
| `ModuleLicenseGuard` | Independent of D-7 — depends on licensing, reported under D-5 |
| Refunds, write-offs, adjustments | **Blocked** — each is an approval operation per ADR-011/ADR-013 |
| D-6 (refund state transitions) | **Blocked** — `REQUESTED → APPROVED` authority is a D-7 question |
| 20 unassigned Finance resources | Cannot be granted to any non-admin role |
| Period-close functionality | Implemented and usable; **blocked only for extension** |

**Status: BILLING SURFACE LOCKED (ADR-037). REMAINDER UNRESOLVED — a major blocker for the settlement and accounting-authority half of the final batch.**

---

## 9. D-8 — ROUNDING / QUANTISATION

### 9.1 What D-8 asks

`PHASE_6_DECISION_BRIEF.md:948` and §H (L1057-1060): the rounding mode; the quantisation point; whether discount and tax round at each intermediate step; and how residue is reconciled between the invoice chain and the journal chain so BR-013's balance invariant holds.

### 9.1a The specification mandates precision but states no arithmetic rule

`Finance Engineering.md:752`:

> All monetary columns use decimal(14,2) (never Float).

**Exhaustive search of the specification for `rounding`, `half-up`, `half-even`, `ceiling`, `floor`, `toFixed`, `ROUND(` returns no matches.** The spec fixes storage precision (`:752`) and an invariant (`total_debit = total_credit`, ADR-030, `:1349`, `:1753`) but never states the arithmetic rule connecting them.

### 9.2 Current numeric types and database precision/scale

**New P6.1/P6.2 tables — `Decimal(14,2)`, conforming to `:752`:**

| Field | Line |
|---|---|
| `FeeScheduleItem.amount` | `finance.prisma:146` |
| `Bill.totalAmount` | `finance.prisma:174` |
| `FinancialPolicy.value` | `finance.prisma:228` |
| `JournalEntry.totalDebit` / `totalCredit` | `finance.prisma:337-338` |
| `JournalEntryLine.debit` / `credit` | `finance.prisma:362-363` |
| `AccountBalance.openingBalance` / `totalDebit` / `totalCredit` / `closingBalance` | `finance.prisma:384-387` |

**Legacy tables — `Decimal(10,2)`, 4 orders of magnitude narrower:**

| Field | Line |
|---|---|
| `FeeStructure.amount` | `finance.prisma:452` |
| `Invoice.totalAmount` / `paidAmount` / `balance` | `finance.prisma:479-481` |
| `Payment.amount` | `finance.prisma:505` |
| `Scholarship.amount` / `percentage` (`Decimal(5,2)`) | `finance.prisma:531-532` |
| `Refund.amount` | `finance.prisma:549` |

Two different precisions coexist. The legacy tables are pending D-12.

### 9.3 Current `Decimal` behaviour, and where arithmetic occurs

- **No rounding or quantisation helper exists anywhere in `apps/api/src`.** A repository-wide search for `toFixed`, `Round`, `ROUND_`, `Math.round`, `quantis`, `quantiz` across all API TypeScript returns **zero matches**.
- **No money utility module exists.**
- **`decimal.js` is not a direct dependency** of `apps/api/package.json`.
- Monetary values arrive as `Prisma.Decimal` from `@prisma/client`.

Arithmetic therefore happens ad hoc at the call sites, in whatever precision JavaScript hands over, with no quantisation step:

| Path | Operation | Location |
|---|---|---|
| Bill generation | sums fee schedule item amounts into `totalAmount` | `billing.service.ts` |
| Discount | percentage × amount, applied against a bill/invoice | `discount.service.ts` |
| Journal posting | sums `debit`/`credit` into `totalDebit`/`totalCredit`, then compares | `accounting.service.ts` |
| Account balances | `openingBalance + totalDebit − totalCredit` → `closingBalance` | `accounting.service.ts:384-387` |
| Period close | aggregates balances per `FinancialPeriod` | `accounting.service.ts` |
| Policy values | `FinancialPolicy.value` (tax, penalty, numbering) | `policy.service.ts` |

`accounting.service.ts` enforces the ADR-030 balance invariant **at the point of comparison**, rejecting an unbalanced entry. That is correct as far as it goes; it does not address *where* the two sides should be quantised relative to each other.

### 9.4 Does the current implementation generate fractional residue?

**Structurally possible, and unquantified.** There is no rounding step anywhere, so any operation that produces a third decimal place is written to a `Decimal(14,2)` column — where **PostgreSQL rounds it silently**. The residue is discarded at the database boundary, not at a defined application point.

Concrete paths that can produce a third decimal place with no rounding applied:

| Path | Example | Residue |
|---|---|---|
| Percentage discount | 10% of ₦33.33 = **₦3.333** | written as ₦3.33; **₦0.003 discarded** |
| Percentage discount stacking | ₦33.33 − 10% − 15% = ₦28.3275 | written as ₦28.33 |
| Journal line aggregation | 3 lines of ₦0.335 | sum ₦1.005 vs. per-line rounding to ₦1.01 |
| Balance derivation | `closingBalance = opening + totalDebit − totalCredit` across a mixed set of rounded lines | drift accumulates per period |

**The highest-leverage case is the journal/invoice divergence:** the invoice chain materialises `subtotal → total_amount → paid_amount → outstanding_balance` (`Finance Engineering.md:825-833`) and the journal chain independently materialises `journal lines → total_debit / total_credit` (`:1071-1072`) feeding `account_balances.closing_balance` (`:1099`). If the two sides are rounded at different points — or if the invoice side rounds and the journal side does not — `total_debit ≠ total_credit` and the balance check at `accounting.service.ts` **rejects the transaction**.

A second live sensitivity: V-PA-03 (`:617`) requires a payment allocation to be `≤ invoice outstanding balance`. A one-cent residue rejects a legitimate final allocation.

### 9.5 Maximum representable values and the confirmed aggregate overflow

`Decimal(14,2)` = 14 total digits, 2 after the point → **maximum 99,999,999,999,999.99** (12 integer digits).

**Confirmed aggregate overflow:**

```
line max          = 999,999,999,999.99      (per §7.2 line-item column maximum)
lines per bill    = 200
aggregate         = 999,999,999,999.99 × 200
                  = 199,999,999,999,998.00
Decimal(14,2) max =  99,999,999,999,999.99
                  → OVERFLOW by 99,999,999,999,998.01
```

The overflow occurs in `Bill.totalAmount` (`finance.prisma:174`), an `Int @default(0)`-free but unbounded `Decimal(14,2)` column, and in `AccountBalance.closingBalance` (`finance.prisma:387`) by the same arithmetic.

### 9.6 Is the overflow an implementation bug or an unresolved business rule?

**It is neither a bug nor a rounding question. It is a missing maximum-value business rule.** Three facts establish this:

1. The `Decimal(14,2)` type **conforms exactly** to `Finance Engineering.md:752`. The implementation is spec-conformant.
2. The specification mandates the precision but **states no maximum line count, no maximum line amount, no maximum document total, and no overflow behaviour**.
3. The overflow therefore arises from a rule the specification never states: *how many lines may a bill have, and what is the largest document total the institution may hold?*

**Answering D-8's rounding questions does not fix this.** A rounding mode is irrelevant to an overflow. The overflow needs a **maximum-allowable-value policy**, which is a separate question the brief does not currently pose. It is reported here as a gap in D-8's scope, not as a new decision.

### 9.7 Concrete examples of each unresolved D-8 choice

**(a) Rounding mode** — same input, three defensible answers:

| Computation | half-up | half-even (banker's) | truncate |
|---|---|---|---|
| ₦0.125 | ₦0.13 | ₦0.12 | ₦0.12 |
| ₦0.135 | ₦0.14 | ₦0.14 | ₦0.13 |
| ₦2.675 → 2 dp | ₦2.68 | ₦2.68 | ₦2.67 |

*(The last row is the classic binary-float case: `2.675` is not exactly representable, so naive float arithmetic can yield ₦2.67 under half-up. A `Prisma.Decimal` implementation yields ₦2.68. The mode is not the only variable — the arithmetic type is too.)*

**(b) Quantisation point** — ₦10.00 across 3 lines:

| Point | Result | Sum |
|---|---|---|
| Per line (each ₦3.333) | ₦3.33 × 3 | **₦9.99** — a cent vanishes |
| Per document (₦10.00 ÷ 3) | ₦3.33, ₦3.33, ₦3.34 | **₦10.00** — residue assigned to the last line |
| No quantisation, DB rounds | depends on write order | **nondeterministic** |

**(c) Per-line vs aggregate rounding** — a ₦100.00 bill with two 7.5% discounts:

| Order | Computation | Result |
|---|---|---|
| Sequential | 100 − 7.50 − 7.50 | ₦85.00 |
| Sum first | 100 − (7.5 + 7.5)% = 100 − 15% | ₦85.00 |
| On a ₦33.33 base | 33.33 − 2.49975 − 2.49975 | ₦28.33 or ₦28.34 |

**(d) Discount / tax rounding on intermediate steps** — a ₦1,000.00 fee with a 7.5% tax and a ₦50.00 discount:

| Method | Tax | Discount | Total |
|---|---|---|---|
| Tax on gross, then discount | ₦75.00 | ₦50.00 | ₦875.00 |
| Discount first, then tax | tax on ₦950.00 = ₦71.25 | ₦50.00 | ₦878.75 |
| Round each to 2 dp, sum | ₦75.00 | ₦50.00 | ₦875.00 |

₦3.75 apart. The specification mandates the result is materialised into `total_tax` and `total_discounts` (`Finance Engineering.md:825-833`) but not the order.

**(e) Residue reconciliation** — a ₦10.00 bill paid in 3 equal ₦3.333 allocations:

- Round per allocation: ₦3.33 × 3 = ₦9.99 → `outstanding_balance` **₦0.01**, and V-PA-03 (`≤ outstanding balance`) blocks the final ₦0.01 as a fifth allocation.
- Round the final allocation to the residual: ₦3.33, ₦3.33, ₦3.34 → balance **₦0.00**, no orphan cent.

Both are defensible. Only one is currently possible, and which one is in force is not written down.

**(f) Maximum allowable values** — the overflow case in §9.5. No source states a maximum.

### 9.8 What D-8 blocks

| Downstream | Dependency | Status |
|---|---|---|
| **Overflow handling** | Maximum-value policy, **not** rounding | **Blocked** — and D-8 as currently posed does not ask the question |
| **Journal balance invariant** (BR-013, ADR-030) | Quantisation point + residue reconciliation | **Blocked** — `accounting.service.ts` can reject a legitimate entry |
| **Discount computation** (P6.2 `DiscountCreated` is live) | (b)(c)(d) | **Blocked** — `discount.service.ts` has no quantisation step |
| **Bill `totalAmount`** (live) | (b) + overflow | **Blocked** |
| **Account balances** (live) | (b)(e) | **Blocked** |
| **D-12 replacement tables** | Precision/scale of the new columns | **Gated** — the replacement `invoices`/`payments`/`refunds` tables inherit the quantisation decision |
| **D-16 late fees** | Daily accrual × rate, per day, compounded | **Blocked** — `AccountBalance.closingBalance` is the accumulator |
| **D-6 payment allocation** | (e) V-PA-03 comparison | **Blocked** |
| **D-3 currency** | Multi-currency is Future, so exponent handling is Future | **Not blocked now** |

**Correction of a premise in the request:** the request describes the chain as *"D-8 → D-12 → legacy/schema work."* The accurate dependency is narrower. **D-12 (legacy table disposition) gates D-8's implementation**, because the spec-conformant `Invoice`/`Payment`/`Refund` tables cannot be created while the legacy tables hold the frozen names (`finance.prisma:197-200`). D-8 gates only D-12's *choice of precision for the replacement columns*. D-12 does not gate D-8's *decision* — D-8 must be answered first to know what precision to write into the new tables.

**Status: UNRESOLVED OWNER DECISION. High leverage — blocks every monetary path in the final batch.**

---

## 10. CROSS-DECISION DEPENDENCY MAP

```
                         ┌──────────────────────┐
                         │ D-2  Config ownership│  (upstream of most config questions)
                         └──────────┬───────────┘
                                    │ owns settlement currency?
                                    ▼
                         ┌──────────────────────┐
                         │ D-3  Currency storage│  ADR-036 locks TERMINOLOGY only
                         └──────────┬───────────┘
                                    │ currency on replacement tables
                                    ▼
┌───────────────┐         ┌──────────────────────┐
│ D-1  Expenses │         │ D-12 Legacy tables  │◄─── gates the Invoice/Payment/
│  (leaf,       │         │  (Part II, not in   │     Refund table names
│   non-blocking)│        │   D-1..D-8)         │     finance.prisma:197-200
└───────────────┘         └──────────┬───────────┘
                                    │ spec-conformant tables now creatable
                    ┌───────────────┼───────────────┬────────────────┐
                    ▼               ▼               ▼                ▼
         ┌────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
         │ D-6 Payment/   │ │ D-4 Events   │ │ D-5 Payer    │ │ D-8 Rounding │
         │   Refund state │ │  contract    │ │  + scope     │ │  (all money) │
         └───────┬────────┘ └──────────────┘ └──────┬───────┘ └──────┬───────┘
                 │                                   │                │
                 │ needs refund approval authority   │ needs D-11     │ gates
                 ▼                                   ▼                ▼
         ┌───────────────────────────────────┐  ┌──────────┐  ┌──────────────┐
         │ D-7  Authority / role matrix      │  │ D-11     │  │ D-16 Late    │
         │  ADR-037 locks BILLING ONLY       │  │ ObjectScp │  │ fees, D-6    │
         │  refund/write-off/period OPEN     │  │ registry  │  │ allocation   │
         └───────────────────────────────────┘  └──────────┘  └──────────────┘
```

### 10.1 Decision-by-decision

| Decision | Depends on | Blocks | Independent? | Blocks implementation? | Later phase only? |
|---|---|---|---|---|---|
| **D-1** Expenses | nothing | nothing | **Fully independent** | No — no built work affected | Yes, under options 1/2 |
| **D-2** Config ownership | nothing | D-3, D-9, D-16, D-17 | Root of the config tree | Yes | No |
| **D-3** Currency | **D-2** | currency on every money path; column disposition in D-12 | No | Yes | No |
| **D-4** Events | naming choice affects D-5 Opt. 2 | all consumer-driven billing; refund eligibility; `PersonMerged` | Partially | Yes | No |
| **D-5** Payer/scope | **D-7** (approval), **D-11** (guard), **D-4** (`PersonMerged`) | only if non-student visibility is in scope | No | **Conditionally** | Yes, if staff-only is confirmed |
| **D-6** Payment/refund state | **D-7** (approval authority), **D-8** (allocation rounding), **D-12** (tables) | the entire settlement half | No | Yes | No |
| **D-7** Authority | nothing | 4 missing guards; refund/write-off; period approval; D-6 | Root of the authority tree | Yes | No |
| **D-8** Rounding | **D-12** (target tables) | every monetary path; D-16; D-6 allocation | No | Yes | No |
| **D-12** Legacy tables | **D-3** (currency columns), **D-8** (precision) | Invoice, Payment, Refund, DiscountApplication | No | **Yes — the critical path** | No |

### 10.2 The three dependency chains called out in the request

**D-8 → D-12 → legacy/schema work — direction is reversed.**
D-12 gates D-8's *implementation* (table names), not D-8's *decision*. D-8 gates only the precision chosen for D-12's replacement columns. D-8 must be answered first; D-12 must be answered second; only then can the settlement tables be written.

**D-7 → guards / period close / authority matrix.**
ADR-037 closed the billing surface. Everything else in §9.5 waits on D-7: `FinancialAuthorityGuard` and `ImmutabilityGuard` cannot be built without an authority rule and an immutability rule. Period close is implemented and admin-gated, so it works; only its extension is blocked. D-7 is upstream of D-6, because `REQUESTED → APPROVED` is a D-7 authority question.

**D-6 → payment/refund implementation.**
Two live bypasses are writing financial state today. D-6 gates all of it, and D-6 itself waits on D-7 (authority), D-8 (allocation rounding), and D-12 (tables).

**D-5 → D-11 / object-scope enforcement.**
Confirmed and correctly scoped: the `params.id` short-circuit and the registry are D-11, independent of the payer choice. D-5 becomes a blocking decision only if the owner wants non-student invoice visibility; `ObjectScopeGuard`'s equality-only vocabulary means D-5 Option 2 needs a new mechanism regardless.

---

## 11. SEPARATE DECISIONS FROM IMPLEMENTATION FIXES

### A. OWNER DECISIONS REQUIRED

#### A-1 — D-8: rounding mode, quantisation point, and residue reconciliation

- **Exact question.** What is the rounding mode? At what point is money quantised — per line, per document, or per persisted column? Do discount and tax round at each intermediate step? How is residue reconciled between the invoice chain and the journal chain so BR-013 holds on every commit? **And, separately, what is the maximum allowable line count, line amount, and document total?**
- **Why evidence cannot resolve it.** The specification mandates `decimal(14,2)` (`:752`) and the balance invariant (`:1349`, ADR-030) but states **no** rounding rule — an exhaustive search for `rounding`, `half-up`, `half-even`, `ceiling`, `floor`, `toFixed`, `ROUND(` returns nothing. The repository has **zero** rounding helpers, **zero** money utilities, and **no** `decimal.js` dependency, so there is no existing convention to inherit.
- **Options already documented.** Option 1 — single canonical quantisation helper applied once per persisted document, half-up, mode recorded in `FinancialPolicy`. Option 2 — quantise at every persisted `decimal(14,2)` column, no intermediate rounding. Option 3 — store exact unrounded decimals, round for presentation only (contradicts `:752`). **The maximum-value question is not among the documented options** — that is a scope gap in D-8, reported as a fact.
- **Blocked work.** Bill `totalAmount`; discount computation; journal posting; account balances; overflow handling; V-PA-03 allocation; D-16 late fees; D-6 payment allocation; D-12's replacement column precision.
- **Downstream decisions.** D-6 (allocation), D-12 (column precision), D-16 (daily accrual).

#### A-2 — D-6: authoritative owner of payment and refund state

- **Exact question.** Does Finance become the sole authoritative owner of payment and refund state? If not, what is the documented boundary between Finance, Academics, and People? What happens to the two live write paths? What authority approves each refund transition?
- **Why evidence cannot resolve it.** Three incompatible state vocabularies exist with no source ranking them: Finance spec `REQUESTED/APPROVED/REJECTED/PROCESSED` (`:1316`, **unimplemented**); legacy `PaymentStatus` `PENDING/COMPLETED/FAILED/REFUNDED` (implemented, shared by `Payment` and `Refund`); People `PENDING/PROCESSED/DENIED` (implemented on a People-owned table). ADR-008 states payment state is owned by Finance, not the gateway — that is a gateway boundary, not a Finance-vs-People boundary.
- **Options already documented.** Option 1 — Finance is sole owner; Academics and People consume Finance events. Option 2 — formalize the current split with a documented boundary. **Both remain the actual alternatives; the code currently implements Option 2's behaviour without its documentation.**
- **Blocked work.** All of payments, refunds, write-offs, payment allocation, gateway reconciliation, refund eligibility on withdrawal, financial clearance on graduation.
- **Downstream decisions.** D-7 (approval authority), D-8 (allocation rounding), D-12 (tables).

#### A-3 — D-7 remainder: financial approval authority and the broader role matrix

- **Exact question.** Who holds refund, write-off, discount-override, and financial-period approval authority? Is there a threshold mechanism? Is self-approval blocked? Does any role other than the five admins receive any of the 20 Finance resources beyond `fee_schedule`, `bill`, and `invoice`? And which of the seven §9.5 guards must Finance own rather than inherit?
- **Why evidence cannot resolve it.** ADR-037 **explicitly excludes** each of these (`Finance Engineering.md:137-145`) and states it adds no authorization behaviour. The specification provides **no Finance role matrix at all** (`:115-119`). `:48` excludes authorization from Finance scope while §9.5 mandates Finance-specific guards, and no source says which reading governs.
- **Options already documented.** None for the role matrix — ADR-037 is a partial patch, not a template. The owner must supply the matrix; this report does not draft one.
- **Blocked work.** `FinancialAuthorityGuard`; `ImmutabilityGuard`; refund approval; write-off authorisation; period-close extension; any non-admin grant.
- **Downstream decisions.** D-6 (refund transitions), D-5 (payer interacts with approval).

#### A-4 — D-2: owning domain per financial configuration concept

- **Exact question.** Name the single owning domain for settlement currency, tax rules, invoice numbering, late-fee/penalty rules, gateway enablement, and gateway credentials. Does `institution_configurations` retain a `financial.*` namespace, and if so is it authoritative, a read-only projection, or removed?
- **Why evidence cannot resolve it.** `Finance Engineering.md:46` makes Finance the owner of currency, tax, numbering, and penalties; `:48` excludes Institution configuration from Finance scope. No source ranks the two clauses.
- **Options already documented.** Option 1 — Finance owns; Option 2 — Institution owns values via typed JSON; Option 3 — split by category with a written category→owner map. Gateway credentials cannot live in `financial.*` JSON regardless (already decided).
- **Blocked work.** Any second currency/tax/numbering/penalty writer; gateway credential storage; the `financial.*` namespace.
- **Downstream decisions.** **D-3** (upstream), D-9, D-16, D-17.

#### A-5 — D-3: authoritative storage field and enforcement point for settlement currency

- **Exact question.** Which single field is authoritative for institution settlement currency? Does `Institution.currency` remain writable? Which write path enforces "fixed after first invoice" (BR-015 / ADR-020)?
- **Why evidence cannot resolve it.** ADR-036 locks the **terminology** and explicitly *"does not decide the storage mechanism"*; Revision History v1.3.0 states the disposition of `Institution.currency` *"remains an open D-3 implementation decision"*. Four on-disk homes exist and no source names the authoritative one.
- **Options already documented.** Option 1 — `Institution.currency` authoritative. Option 2 — `FinancialPolicy` authoritative. Option 3 — keep both synchronised (recorded as unsupported: two writers, no enforcement).
- **Blocked work.** Every money path needing a currency read; the `currency` column disposition on the two legacy tables D-12 will archive.
- **Downstream decisions.** D-12 (column disposition). **Depends on D-2** — cannot be answered first.

#### A-6 — D-4: event naming convention, envelope fields, and consumer ownership

- **Exact question.** (a) Which naming convention governs — noting 12 Finance event strings already ship as dotted names? (b) Are `eventVersion`/`occurredAt` added to the locked envelope, or does Finance accept `emittedAt`? (c) When Finance and People name different consumers for the same event, which spec wins? (d) Must Finance handle `PersonMerged` and `PersonSoftDeleted`, and what happens to financial history on a Person merge?
- **Why evidence cannot resolve it.** Two conventions are live in the codebase (People PascalCase, Academics dotted) and a third in Finance (dotted strings, PascalCase constants). The envelope is a **locked Phase 5 decision** extended additively; changing it is a governance act, not a Finance choice. For the disputed events, the frozen specs disagree and neither outranks the other.
- **Options already documented.** Option 1 — adopt the runtime, Finance subscribes per source domain. Option 2 — normalise to frozen PascalCase. Option 3 — normalise to dotted. Option 4 — extend the envelope. **Note: Option 2 now also requires renaming 12 shipped Finance event strings, which the brief's blast-radius estimate predates.**
- **Blocked work.** Every consumer-driven billing path — bill generation from enrollment/summer school, refund eligibility on withdrawal, final billing on graduation, enrollment clearance on payment.
- **Downstream decisions.** D-5 Option 2 (breaks if People merges Persons).

#### A-7 — D-12: disposition of the five legacy Finance tables *(outside the requested D-1…D-8 range, on the critical path)*

- **Exact question.** Approve archive-then-create for the 5 legacy Finance tables (`FeeStructure`, `Invoice`, `Payment`, `Scholarship`, `Refund`) with no in-place `ALTER`, and decide the 9 `NOT VALID` legacy rows (3 `fee_structures`, 6 `invoices`) and their constraints.
- **Why evidence cannot resolve it.** The specification defines spec-conformant `Invoice`, `Payment`, and `Refund`; the legacy tables occupy the same frozen names. `finance.prisma:197-200` states this in the code: *"the spec-conformant `invoices` table cannot be created while the pre-P6.1 legacy `invoices` table occupies the frozen table name. That table's archival is a separate, gated decision."* Archive, migrate, and delete are three different products and the specification describes none of them for existing rows.
- **Options already documented.** Per brief D-12 and D-13.
- **Blocked work.** **The spec-conformant `Invoice`, `Payment`, and `Refund` tables — therefore all of payments, refunds, adjustments, and `DiscountApplication`.** This is the single largest blocker in the module.
- **Downstream decisions.** D-8 (column precision), D-3 (currency columns), D-6 (payment/refund models).

#### A-8 — D-5: whether Phase 6 exposes any non-student invoice view or payment path *(conditionally required)*

- **Exact question.** Does Phase 6 expose any invoice view or payment path to a person who is not the student? If yes, is the relationship expressed through the existing `PersonRelationship` (honouring `isActive` and date bounds) or through a new Finance-owned payer record, and which guard evaluates it?
- **Why evidence cannot resolve it.** The frozen specification **never uses the word "payer"** — zero occurrences. `Finance Engineering.md:1718` names the Student as payer; `:1913` places the parent portal in Future. Meanwhile `apps/web/src/app/parent/fees/page.tsx` exists with a pay-invoice action, and `MASTER_SMS_ROADMAP.md:741` requires an "unauthorized invoice access" test. The prototype and the frozen spec point in different directions, and prototypes are not requirements. `ObjectScopeGuard`'s equality-only vocabulary cannot express the relational rule either way.
- **Options already documented.** Option 1 — staff-only, no payer surface. Option 2 — read-only parent/guardian visibility via `PersonRelationship`; payment stays student-initiated. Option 3 — new Finance payer record.
- **Blocked work.** Nothing, **if Option 1 is confirmed.** If Option 2, a new scope type or Finance guard is required before any parent-facing read.
- **Downstream decisions.** D-7 (approval interacts with payer), D-4 (`PersonMerged` breaks the relationship), D-11.

#### A-9 — D-1: whether `expenses` is a Phase 6 capability *(non-blocking)*

- **Exact question.** Amend the roadmap to drop `expenses`; express expenses as balanced journal entries against `EXPENSE` accounts; or amend the frozen specification to add a first-class Expense aggregate?
- **Why evidence cannot resolve it.** The roadmap mandates a deliverable the frozen specification does not define as an entity, endpoint, permission, module, repository, or service. `EXPENSE` exists only as a chart-of-accounts account type (`:1742-1748`, ADR-029). **New evidence:** `apps/web/src/app/bursar/expenses/page.tsx` supplies columns, an `Approved/Pending/Rejected` approval workflow, categories, and accounts — so Option 3 has a prototype basis the brief records as "no source supports", and its `parseInt(expAmount, 10)` integer-Naira treatment conflicts with `decimal(14,2)`.
- **Options already documented.** Options 1, 2, 3 per brief §E. **No new options introduced.**
- **Blocked work.** **None.** D-1 is a leaf; no implemented Finance work depends on it under options 1 or 2.
- **Downstream decisions.** None.

### B. NO DECISION REQUIRED

Each item below is mechanically correctable once the relevant architecture is approved. None is a product or architecture question.

| # | Item | Why no decision is needed | Evidence |
|---|---|---|---|
| B-1 | **`@nestjs/mapped-types` is used but not declared** in `apps/api/package.json` | The library is already in the dependency tree transitively and all 356 tests + `tsc` pass. A missing direct declaration is a packaging defect with one correct fix. | `discount.dto.ts`, `fee.dto.ts`, `schedule.dto.ts` |
| B-2 | **Journal-line `CHECK` constraint missing** (`total_debit = total_credit`) | ADR-030 states the invariant in one line; the constraint is its direct transcription. Adding it is not a design choice. | `Finance Engineering.md:1753`, ADR-030, `:1349`; absent from the P6.2 migration |
| B-3 | **5 common query parameters missing** from Finance list DTOs | `Finance Engineering.md` §10.2 defines them for the whole API. DTO omission is drift, not a choice. | `:1538-1553` |
| B-4 | **`Bill.totalAmount` mapping differs from spec** | The spec's column name is fixed; the mapping is a naming correction. | `Finance Engineering.md:825-833` vs `finance.prisma:174` |
| B-5 | **Timestamps are `TIMESTAMP(3)`** | A migration-scaffolding artefact, not a stated requirement. | P6.1/P6.2 migrations |
| B-6 | **`ObjectScopeGuard` Finance registry** | Already implemented for all 9 Finance models. The D-11 packet's claim that no Finance model is registered is **stale** — documentation drift. | `object-scope.guard.ts:283-306` |
| B-7 | **`params.id`-only short-circuit in `ObjectScopeGuard`** | Behaviour is pre-existing and generic. The brief itself assigns it to **D-11**, explicitly *not* contingent on D-5. Reported, not changed. | `:88, 117, 167`; brief `:674-675` |
| B-8 | **No rounding helper exists** | Not a defect to fix *now* — it is the mechanical consequence of D-8 being undecided. Listed here so it is not double-counted as a decision. | zero matches repo-wide |
| B-9 | **No ESLint configuration** | The repo has no `eslint.config.(js|mjs|cjs)` and the lint script uses `--fix`. Adding config is tooling, not design. | `apps/api/package.json` |
| B-10 | **12 Finance E2E tests unexecutable** | Environment limitation: PostgreSQL unavailable, Docker unavailable. Not a design question. | port 5433 `ECONNREFUSED`; 5432 reset |
| B-11 | **`D-n` identifier collision across two registers** | A naming defect (§1.2). Qualifying future references as "Finance D-3" costs nothing and needs no ruling — **unless** the owner wants a formal precedence rule, which is Register B's own open question. | §1.2 |
| B-12 | **Finance documentation stale statements** | The D-11 packet (Finance models not registered) and the brief's Option 3 evidence (no Expense source) are both drift against the current repository. | §1.2, §2.3, B-6 |
| B-13 | **`D-1..D-18` counting-register documents remain `SAFE-STOP`** | Those are Register B questions about counting conventions and phase-status vocabulary. They do not gate Finance implementation and are correctly out of scope. | `DECISION_D3_INVESTIGATION.md` |

---

## 12. FINAL IMPLEMENTATION-BATCH READINESS

### 12.1 Readiness table

| Area | Status | Owner decision required? | Blocks final Finance batch? | Reason |
|---|---|---|---|---|
| **D-1** Expenses | `UNRESOLVED` — leaf, non-blocking | **Yes, but non-urgent** | **No** | Roadmap checkbox vs frozen spec. New `bursar/expenses` prototype evidence strengthens Option 3. No implemented work depends on it; nothing must be undone under options 1/2. |
| **D-2** Config ownership | `UNRESOLVED` — root of config tree | **Yes** | **Yes** | `:46` vs `:48` conflict unresolved. Upstream of D-3, D-9, D-16, D-17. |
| **D-3** Currency | `PARTIALLY LOCKED` — terminology only (ADR-036); storage open | **Yes** | **Yes** | Four on-disk homes, no authoritative field. Revision History v1.3.0 confirms it is open. Cannot be answered before D-2. |
| **D-4** Events | `UNRESOLVED` — partly pre-empted by 12 shipped event strings | **Yes** | **Yes** | Two live naming conventions plus a third in Finance; 4 undeclared Finance handlers; 2 spec-named events that do not exist at runtime. Blocks all consumer-driven billing. |
| **D-5** Payer / access | `UNRESOLVED` — conditional | **Only if a non-student surface is wanted** | **Conditionally** | Spec has zero "payer" occurrences and defers the parent portal to Future, but a `parent/fees` prototype with pay action exists. Confirmed staff-only → not blocking. The `params.id` short-circuit is **D-11**, not D-5. |
| **D-6** Payment / refund state | `UNRESOLVED` — 2 live bypasses confirmed | **Yes** | **Yes** | Academics writes free-text `paymentStatus`; People writes regex-only `refundStatus`. No Finance payment/refund model exists. `Refund` reuses `PaymentStatus`, so the spec's 4-state workflow is unrepresentable. |
| **D-7** Authority / role matrix | `PARTIALLY LOCKED` — billing surface only (ADR-037); remainder open | **Yes** | **Yes** | ADR-037 defers fee catalogue, refund/write-off authority, period approval, and all 20 remaining resources. Blocks 2 guards and all approval operations. Seed matches the ADR exactly (14 grants, no `finance:payment`). |
| **D-8** Rounding / quantisation | `UNRESOLVED` | **Yes** | **Yes** | Spec mandates precision, states no arithmetic rule; repo has zero rounding helpers. Blocks every monetary path. Overflow needs a **maximum-value** rule that D-8 does not currently ask. |
| **D-12** *(adjacent)* Legacy tables | `UNRESOLVED` | **Yes** | **Yes — critical path** | Blocks creation of the spec-conformant `Invoice`, `Payment`, `Refund` tables, therefore all of settlement. Gates D-8's implementation. |

### 12.2 Smallest decision set needed before implementation

Ordered by dependency, not by severity. Each entry is a genuine owner question; none can be answered from the repository.

| # | Decision | Question, in one line | Why it cannot wait |
|---|---|---|---|
| 1 | **D-7** remainder | Who holds refund, write-off, discount-override, and period-approval authority, and which of the seven §9.5 guards does Finance own? | Root of the authority tree. Blocks 2 guards, all approval operations, and D-6. |
| 2 | **D-8** | Rounding mode, quantisation point, intermediate rounding, residue reconciliation — **and** the maximum allowable values. | Blocks every monetary path. Must precede D-12 so the new tables get the right precision. |
| 3 | **D-2** | Which domain owns settlement currency, tax, numbering, penalties, gateway enablement, and gateway credentials? | Root of the config tree. Upstream of D-3. |
| 4 | **D-3** | Which field is authoritative, does `Institution.currency` stay writable, and where is "fixed after first invoice" enforced? | Terminology is locked; storage is not. Needs D-2 first. |
| 5 | **D-4** | Which naming convention governs, are `eventVersion`/`occurredAt` added, which spec wins on disputed events, and must Finance handle `PersonMerged`/`PersonSoftDeleted`? | Blocks all consumer-driven billing. 12 event strings already ship, so the cost of Option 2 is higher than the brief records. |
| 6 | **D-6** | Is Finance the sole owner of payment/refund state, what happens to the two live bypasses, and what approves each transition? | Two live cross-module write paths exist today. Needs 1, 2, and 7. |
| 7 | **D-12** | Archive-then-create for the 5 legacy Finance tables, and disposition of the 9 `NOT VALID` rows? | **Critical path.** Blocks the `Invoice`/`Payment`/`Refund` tables, therefore all settlement work. |
| 8 | **D-5** *(conditional)* | Does Phase 6 expose any non-student invoice view or payment path? | Only if a parent/guardian surface is wanted. Answering "staff-only" removes it from the critical path. |

**Not in the set:** **D-1.** It is a leaf with no dependents. It can be decided after the batch starts, or deferred with the roadmap amendment.

**Recommended minimum for a first slice:** decisions **1, 2, 7** plus **8** answered "staff-only" unblock the fee-structure, billing, discount, accounting, and policy work that is already 74-test-green. The settlement half (payments, refunds, adjustments) additionally needs **3, 4, 5, 6**.

### 12.3 Can the final Finance implementation batch start?

**NO — owner decisions remain.**

Specifically missing:

1. **D-7's remainder.** ADR-037 locked only the billing surface. Refund and write-off authority, financial-period approval, the fee catalogue, and all 20 remaining Finance resources have no authority rule. `FinancialAuthorityGuard` and `ImmutabilityGuard` cannot be built without one. `Finance Engineering.md:137-145` states each of these is explicitly *not* decided.
2. **D-8's arithmetic rule.** The specification fixes `decimal(14,2)` and the balance invariant but states no rounding mode, quantisation point, intermediate-rounding rule, or residue handling. The repository has zero rounding helpers. Every monetary path — bills, discounts, journal entries, balances, allocations, late fees — is blocked, and the confirmed aggregate overflow additionally requires a **maximum-value rule that D-8 does not currently ask for**.
3. **D-2 and D-3.** Four on-disk homes for settlement currency, no authoritative field, and no stated enforcement point for "fixed after first invoice". ADR-036 locked terminology only and explicitly declined to decide storage.
4. **D-4.** Two naming conventions are live in the codebase and a third in Finance's own 12 shipped event strings; four People-assigned Finance handlers are undeclared; two spec-named enrollment events do not exist at runtime. All consumer-driven billing is blocked.
5. **D-6.** Two live cross-module bypasses write financial state today — Academics with an unvalidated free-text `paymentStatus`, People with a regex-only `refundStatus` — while no Finance payment or refund model exists. The settlement half cannot be built until the authoritative owner is named.
6. **D-12** (adjacent, critical path). The spec-conformant `Invoice`, `Payment`, and `Refund` tables cannot be created while the legacy tables hold the frozen names. This blocks all settlement work regardless of how the five above are answered.

**D-5** must also be answered if any non-student invoice view or payment path is wanted; confirming "Phase 6 is staff-only" removes it from the critical path.

**D-1 does not block anything** and can be decided later or deferred with a roadmap amendment.

### 12.4 SAFE-STOP status

**Implementation must remain SAFE-STOPPED.** No placeholder may be created for a blocked decision. Specifically, the following must **not** be written until the named decision is answered:

- No rounding/quantisation helper, and no default rounding mode (D-8)
- No `FinancialAuthorityGuard`, no `ImmutabilityGuard`, no `ModuleLicenseGuard`, no `FinanceAccessGuard` (D-7, D-5)
- No new permission grant to BURSAR or any other role (D-7 — ADR-037's 14 are locked and final)
- No Expense model, migration, permission, or endpoint (D-1)
- No payer entity, no `payer` scope type, no parent-facing Finance route (D-5)
- No spec-conformant `Invoice`/`Payment`/`Refund` table, and no archive/migrate/delete action on the 5 legacy tables (D-12)
- No change to `event-envelope.ts`, and no rename of the 12 shipped Finance event strings (D-4)
- No currency write-path change to `Institution.currency` (D-3)

---

## APPENDIX A — Files inspected

**Specifications and ADRs**
`engineering/Finance Engineering.md`; `engineering/Institution Management Engineering.md` (referenced); `docs/PHASE_6_DECISION_BRIEF.md`; `docs/PHASE_6_SCOPE_VERIFICATION_REPORT.md`; `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md`; `docs/DECISION_D1_SPECIFICATION_AUTHORITY.md`; `docs/DECISION_D2_COUNTABLE_UNITS_AND_GRANULARITY.md`; `docs/DECISION_D3_INVESTIGATION.md`; `MASTER_SMS_ROADMAP.md`

**Schema and migrations**
`apps/api/prisma/schema.prisma`; `apps/api/prisma/schema-head.prisma`; `apps/api/prisma/domains/finance.prisma`; `apps/api/prisma/domains/institution.prisma`; `apps/api/prisma/domains/people.prisma`; `apps/api/prisma/domains/institution-configuration.prisma`; `apps/api/prisma/seed.ts`; P6.1/P6.2 migration directories

**Authorization**
`apps/api/src/common/guards/object-scope.guard.ts`; `permission.guard.ts`; `tenant.guard.ts`; `apps/api/src/modules/auth/jwt-auth.guard.ts`; `apps/api/src/modules/institutions/institution-scope.guard.ts`; `apps/api/src/app.module.ts`

**Finance module**
`finance.module.ts`; `finance.events.ts`; `finance.common.ts`; `finance.types.ts`; `controllers/{fees,billing,discount,accounting,policy}.controller.ts`; `services/{fees,billing,discount,accounting,policy}.service.ts`; `dto/{fee,schedule,bill,discount,accounting,policy}.dto.ts`; `fees.service.spec.ts`; `finance.p62.service.spec.ts`

**Cross-module**
`apps/api/src/modules/people/students.service.ts`; `people/dto/student.dto.ts`; `people-merge.service.ts`; `applicants.service.ts`; `apps/api/src/modules/academics/services/summer-school.service.ts`; `academics/dto/academic-admin.dto.ts`; `apps/api/src/modules/events/event-envelope.ts`; `apps/api/src/modules/audit/audit-log.consumer.ts`

**Frontend**
`apps/web/src/app/bursar/expenses/page.tsx`; `bursar/payments/page.tsx`; `parent/fees/page.tsx`

**Tests**
`apps/api/test/finance-fees.e2e-spec.ts`; `apps/api/src/modules/finance/*.spec.ts`

## APPENDIX B — Commands and tests run

All read-only. No test suite was executed in this engagement; the previously verified baseline was re-checked by file inspection only.

| Command type | Purpose | Result |
|---|---|---|
| `Select-String` over `docs/PHASE_6_DECISION_BRIEF.md` | Enumerate D-1 … D-18 titles | 18 decisions found; titles confirmed |
| `Select-String` over `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md` | Enumerate register-B D-1 … D-10 | **Register collision confirmed** |
| `Select-String` over `docs/PHASE_6_SCOPE_VERIFICATION_REPORT.md` L403-420 | Cross-check decision statements | Agrees with the brief on all eight |
| `Get-ChildItem apps/api/src/common/guards`, recursive `*.guard.ts` | Guard inventory | 3 common + 6 others; **4 of 7 §9.5 guards absent** |
| `Select-String` over the 5 Finance controllers | Guard chains, permissions, `@ObjectScope` | All 5 use `AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard`; 14 decorated routes |
| `Select-String '^enum '` over all 13 `domains/*.prisma` + `schema.prisma` | Enum inventory | **`Refund` reuses `PaymentStatus`** — premise corrected |
| `Select-String` over `schema.prisma` L1200-1230, L3090-3112 | Locate `paymentStatus` / `refundStatus` owners | `SummerSchoolRegistration`, `StudentWithdrawalDetail` — both People/Academics-owned |
| `Select-String` over `people` + `academics` sources | Refund/payment write paths | **2 live bypasses confirmed** |
| `Select-String` over `apps/api/src` | `refund.*` / `prisma.refund` | **Zero matches** — no Finance refund writer |
| `Select-String` over `apps/api/src` for `toFixed\|Round\|ROUND_\|Math.round\|quantis\|quantiz` | Rounding helpers | **Zero matches** — no quantisation exists |
| `Select-String '^model \|^// '` over `domains/finance.prisma` | Model inventory + comments | 9 new + 5 legacy; the D-12 gate comment at L197-200 |
| `Select-String` over `domains/finance.prisma` for `Decimal(` | Precision/scale | `Decimal(14,2)` × 11 new, `Decimal(10,2)` × 6 legacy |
| `Select-String` over `object-scope.guard.ts` L85-95, 115-125, 165-175, 283-306 | Fail-open behaviour + registry | 3 fail-opens confirmed; 9 Finance models registered |
| `Select-String` over `finance.events.ts` L18-40 | Event names | 12 events, **dotted strings** |
| `Select-String` over `apps/api/src` for `Consumer` | Consumer inventory | Only `AuditLogConsumer`; **no Finance consumer** |
| `Select-String` over `seed.ts` for `BURSAR` + L929-975 | BURSAR grant verification | **14 grants, exact ADR-037 match, no `finance:payment`** |
| `Select-String` over `institution.prisma` for `currency` | D-3 home 1 | `currency String @default("NGN")` at L72 |
| `Get-ChildItem apps/web/src/app -Recurse page.tsx` | Finance UI surface | 160 pages; 6 Finance-related, **all client-side mocks** |
| Header scan of `Finance Engineering.md` | Resolve §9.5 / §48 / ADR locations | §9.5 = L1428-1442; §48 = L48; ADRs = L209-247 |
| Line reads | ADR-036, ADR-037, §9.5, §111-148, §1900-1929 | Verbatim lock text captured |
| `Select-String` over `services/*.ts` for `institutionId` | Service-level scope predicates | `assertInstitutionContext` + `institutionWhere` confirmed fail-closed |

## APPENDIX C — Environment limitations

| Limitation | Detail | Effect on this report |
|---|---|---|
| **PostgreSQL unavailable** | port 5433 `ECONNREFUSED`; port 5432 connection reset; Docker unavailable | No DB-level verification of the aggregate overflow, the missing journal `CHECK`, or timestamp precision. All precision claims are read from Prisma schema and migration text, not from a live database. |
| **E2E not executable** | 12 Finance E2E tests exist in `apps/api/test/finance-fees.e2e-spec.ts` but require PostgreSQL | No runtime confirmation that any authorization path behaves as the code inspection predicts. Guard and scope claims are static-analysis only. |
| **No ESLint config** | No `eslint.config.(js\|mjs\|cjs)`; the lint script uses `--fix` | Not run, per the read-only constraint. Recorded as B-9. |
| **Stale build artifacts** | `apps/web/.next/types/**` and `apps/api/dist/**` contain generated files | Excluded from evidence. Notably, `.next` and `dist` matched "expense" before the source page was found; all findings were re-verified against source. |
| **Prototype pages are not authoritative** | All 6 Finance web pages are client-side mocks with hard-coded arrays and no API calls | Treated as evidence of *intent*, never as a requirement. Flagged as such wherever cited. |
| **Registry-B decisions remain `SAFE-STOP`** | `DECISION_D1/D2/D3` and the counting register are unresolved | Correctly out of scope. D-5/D-6/D-7/D-8 status-conflict questions (register B) are not imported into this Finance report. |

## APPENDIX D — Output and next steps

| Field | Value |
|---|---|
| **Report path** | `C:\Users\USER\Documents\SMS\docs\FINANCE_DECISION_READINESS_REPORT.md` |
| **Other files modified** | **None.** |
| **Committed** | **No.** Nothing was staged or committed. |
| **Implementation status** | **SAFE-STOPPED.** No code, schema, migration, spec, ADR, or decision document was changed. No placeholder was created for any blocked decision. No permission was granted. No product or architecture decision was made on the owner's behalf. |
| **Smallest set of owner decisions required next** | **D-7 remainder, D-8, D-2, D-3, D-4, D-6, D-12** — seven decisions. **D-5** becomes the eighth only if a non-student invoice view or payment path is wanted. **D-1** is not required and can be decided later or deferred. |
| **Answer to "Can the final Finance implementation batch start?"** | **NO.** |

**Suggested answering order:** D-7 remainder → D-8 (including the maximum-value rule D-8 does not currently pose) → D-2 → D-3 → D-4 → D-6 → D-12. D-5 can be answered in parallel as "staff-only" to keep it off the critical path; D-1 can be answered at any time.

**Once those seven are answered**, the mechanically-determined work in §11-B can proceed without further owner input: dependency declaration, `CHECK` constraint, query DTO parameters, naming/mapping correction, documentation drift, lint configuration, and E2E execution once PostgreSQL is available.
