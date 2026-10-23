# Phase 6 — Finance Phase 5 Implementation Status Audit

| | |
|---|---|
| **Subject** | Discrepancy between `engineering/Finance Engineering.md` Phase 5 "Complete" and the actual repository |
| **Type** | Audit / investigation only |
| **Branch** | `phase/2-rbac` |
| **HEAD** | `aae6309` |
| **Date** | 2026-09-26 |
| **Changes made** | **None.** This report is the only artifact created. |
| **Frozen context respected** | D-2 Option 1, ADR-031, D-3 terminology, ADR-036, `Institution.currency`, `regional.*`, D-9, D-14 — all untouched and treated as fixed context. |

> **Safe-stop determination: NOT triggered.** Exactly one authoritative Finance
> specification exists (`engineering/Finance Engineering.md`); no second or conflicting
> Finance specification was found, and no document claims Finance Phase 5 is implemented
> elsewhere. The discrepancy is therefore a **specification-vs-repository** inconsistency,
> not a documentation conflict requiring arbitration between two sources.

> **Scope limit.** This report establishes the factual implementation state. It does **not**
> repair the discrepancy, rewrite any status, or propose an implementation. §12 states the
> decision required; §13 states the next decision point.

---

## 1. Executive finding

**The Finance specification's implementation statuses are not supported by the repository.
The Finance domain is specification-only with a thin, unused data-layer scaffold.**

| Phase 5 claim | Repository reality |
|---|---|
| 14 modules | **0 of the 16 modules listed in §9.1 exist** |
| 14 repositories | **0** — and the codebase contains no repository layer at all (0 repository files vs 36 services) |
| 14 domain services | **0** |
| 14 controllers | **0** — 26 controllers exist repo-wide, none Finance |
| 8 event consumers | **0** — no Finance domain event exists in code |

The only executable Finance artefacts in the repository are:

1. **5 Prisma models / 5 tables** (`fee_structures`, `invoices`, `payments`, `scholarships`,
   `refunds`) out of **30 tables** catalogued in §7.1 — **17%** of the specified database.
2. **A logging-only queue worker stub** (`payment.worker.ts`, 39 lines) whose entire
   "payment processing" is two `logger.log()` calls.
3. **Queue name and job-type constants** that no functional code consumes.
4. **9 seed rows** (3 `FeeStructure`, 6 `Invoice`) that no application code ever reads.
5. **A static bursar/finance frontend** — 12 pages with hardcoded `useState` data and **zero**
   `fetch`/`axios` calls anywhere in `apps/web/src`.

**No currently implemented code depends on Finance in any way.** There is zero coupling, so
nothing is broken. The risk is forward-looking: four implemented domains carry
specification-level dependencies on an absent Finance, two of them rated *High*.

**Additionally, the Finance specification contradicts itself** on its own counts, independent
of the repository: §4 claims 14 modules while §9.1 lists 16, and §4 claims 32 tables while
§7.1 catalogues 30.

---

## 2. Finance Phase 5 claim from the specification

### 2.1 §4 Engineering Status (lines 211–223), verbatim

| Phase | Status | Summary |
|-------|--------|---------|
| Phase 1 — Domain Analysis | Complete | 30 entities, 50+ domain events, 30 business rules |
| Phase 2 — Domain Design | Complete | 11 aggregates, 30 invariants, 20 policies, 12 validation rule sets |
| Phase 3 — Database Design | Complete | 32 tables, 45+ indexes, 25 unique constraints |
| Phase 4 — Prisma Schema | Complete | 32 models, 17 enums, 2-pass validation |
| **Phase 5 — Backend Implementation** | **Complete** | **14 modules, 14 repositories, 14 domain services, 14 controllers, 8 event consumers** |
| Phase 6 — API Design | Complete | 100+ endpoints (65 primary + 35 sub-resource) |
| Phase 7 — Testing & Verification | Complete | 18 test categories, ~240+ test scenarios |

**Overall Status: Approved — Frozen for Implementation.** (line 223)

Closing line (line 1849): *"This document is the permanent engineering specification for the
Finance domain. It is approved and frozen for implementation… Refer to source code for
implementation details."*

### 2.2 §9.1 Module Structure (lines 1265–1284) — the authoritative module list

**This list contains 16 modules, not the 14 claimed in §4.**

| # | Module | Responsibility (per spec) |
|---|--------|---------------------------|
| 1 | FinanceModule | Root module, orchestrates sub-modules |
| 2 | FeeStructureModule | FeeCategory, FeeItem, FeeTemplate, FeeSchedule CRUD |
| 3 | BillingModule | Bill generation, invoice creation, line items |
| 4 | InvoiceModule | Invoice lifecycle, approval, publication, cancellation |
| 5 | PaymentModule | Payment recording, confirmation, failure handling |
| 6 | PaymentAllocationModule | Payment-to-invoice allocation |
| 7 | GatewayModule | Gateway abstraction, transaction management |
| 8 | ReconciliationModule | Gateway-to-internal matching |
| 9 | DiscountModule | Discount CRUD, eligibility, application |
| 10 | ScholarshipModule | Scholarship CRUD, award management |
| 11 | RefundModule | Refund request, approval, processing |
| 12 | AdjustmentModule | Charge corrections, adjustments, write-offs |
| 13 | InstallmentModule | Installment plans, schedules, late fees |
| 14 | AccountingModule | Journal entries, ledger accounts, balances, periods |
| 15 | FinancialPolicyModule | Policy CRUD, versioning, retrieval |
| 16 | SummerSchoolBillingModule | Receive billing requests, generate invoices |

### 2.3 Other Phase 5 claims

- **§9.2 Repository Layer** (lines 1286–1297+): names 8+ repositories —
  `FeeStructureRepository`, `BillingRepository`, `PaymentRepository`, `DiscountRepository`,
  `ScholarshipRepository`, `RefundRepository`, `AdjustmentRepository`, `InstallmentRepository`.
- **§7.1 Table Catalogue** (lines 750–781): **30 tables** (see §7.2 of this report).
- **Phase 6 claim:** 100+ endpoints. **Phase 7 claim:** 18 test categories, ~240+ scenarios.

---

## 3. Repository evidence

### 3.1 Backend module inventory

`apps/api/src/modules` contains exactly **11** directories:

```
academics, audit, auth, delivery, events, identity,
institutions, invitations, onboarding, people, session
```

**No `finance` directory exists.** A recursive filename search across the repository
(excluding `node_modules`, `.next`, `dist`, `.git`) for `*financ*`, `*invoice*`, `*payment*`,
`*ledger*`, `*fee*`, `*refund*`, `*scholar*`, `*gateway*`, `*reconcil*`, `*installment*`,
`*discount*`, `*adjust*` returned only:

| Path | Nature |
|------|--------|
| `apps/api/prisma/domains/finance.prisma` | Data-layer scaffold (5 models) |
| `apps/api/src/workers/payment.worker.ts` | Logging-only stub |
| `apps/api/src/workers/bootstrap-payment-worker.ts` | 73-byte bootstrap shim |
| `apps/web/src/app/bursar/*` (6 pages), `institution/finance`, `org-admin/finance`, `parent/fees` | Static frontend, no API wiring |
| `engineering/Finance Engineering.md` | The specification itself |

### 3.2 Application bootstrap — no Finance registration

`apps/api/src/app.module.ts` imports and registers 16 modules: `PrismaModule`, `CacheModule`,
`QueueModule`, `RateLimitModule`, `HealthModule`, `IdentityModule`, `DeliveryModule`,
`AuthModule`, `InvitationsModule`, `OnboardingModule`, `SessionModule`, `AuditModule`,
`PeopleModule`, `InstitutionsModule`, `EventsModule`, `AcademicsModule`.

**No `FinanceModule` import or registration exists.**

### 3.3 Controller inventory — 26 controllers, zero Finance

```
academics/     administration, calendar, curriculum, enrollment, grading,
               summer-school, teaching, work                    (8)
audit/         audit                                            (1)
auth/          auth                                             (1)
institutions/  institution-configurations, institution-settings, institutions (3)
invitations/   invitations                                       (1)
onboarding/    onboarding                                        (1)
people/        applicants, emergency-contacts, guardians, parents,
               people-documents, people-merge, persons,
               relationships, staff, students                    (9)
session/       session                                           (1)
```

**No invoice, payment, fee, refund, scholarship, discount, installment, ledger, gateway,
reconciliation, financial-policy, or billing controller exists.**

### 3.4 Service and repository inventory

| Layer | Count | Finance |
|-------|-------|---------|
| `*.service.ts` under `src/modules` | **36** | **0** |
| Repository files (`*.repository.ts`, `*.repo.ts`, `*repository*`) under all of `src` | **0** | **0** |

The codebase pattern is **Service → `PrismaService` directly**, with no repository layer
(e.g. `institutions.service.ts` imports `PrismaService` and calls `this.prisma.institution…`
inline). This is architecturally divergent from the §9.2 repository pattern — a codebase-wide
difference, not a Finance-specific one.

### 3.5 Zero coupling to Finance data

A search across `apps/api/src/**/*.ts` for
`prisma.(invoice|payment|feeStructure|scholarship|refund)` **and** all 16 module class names
returned **no matches**. No implemented service, controller, guard, or worker references a
Finance model or Finance module.

A search for Finance domain events (`InvoiceGenerated`, `PaymentReceived`,
`PaymentConfirmed`, `RefundProcessed`, `FeeStructure`) in `src` returned **no matches**.
**No Finance domain event exists in code**, so the claimed "8 event consumers" have nothing
to consume.

### 3.6 The payment worker is a stub, not an implementation

`apps/api/src/workers/payment.worker.ts` (39 lines) creates an application context, registers
a worker on `QUEUE_NAMES.PAYMENTS`, and handles two job types:

```ts
case JOB_TYPES.PAYMENT_VERIFY:
  logger.log(`Verifying payment: ${JSON.stringify(job.data)}`);
  break;
case JOB_TYPES.PAYMENT_RECONCILE:
  logger.log(`Reconciling payment: ${JSON.stringify(job.data)}`);
  break;
```

No database access, no gateway call, no state change, no error handling. This is **generic
queue infrastructure with Finance-flavoured job names** and must not be counted as payment or
reconciliation implementation.

`apps/api/src/queue/queue.constants.ts` declares `QUEUE_NAMES.PAYMENTS` and job types
`PAYMENT_VERIFY`, `PAYMENT_RECONCILE`, `BULK_INVOICES` — **constants only**, consumed by the
stub and by nothing else.

### 3.7 Other branches, worktrees, and stashes — not implemented elsewhere

| Ref | `apps/api/prisma/domains` | Finance module | Finance artefacts present |
|-----|---------------------------|----------------|---------------------------|
| `main` / `origin/main` | **empty** (no domain files) | none | none |
| `phase/0-foundation` | 10 domain files incl. `finance.prisma` | **none** | `finance.prisma` + the same `payment.worker.ts` stub + bursar invoice/payment pages |
| `phase/2-rbac` (current) | 11 domain files incl. `finance.prisma` | **none** | as above |

- **Worktrees:** 1 (`C:/Users/USER/Documents/SMS [phase/2-rbac]`).
- **Stashes:** none.
- **Branches:** `main`, `phase/0-foundation`, `phase/2-rbac` (+ origin mirrors). No Finance branch.

**Conclusion: the Finance backend is not implemented on any branch, in any worktree, or in any
stash.** Objective 4 of the audit (implemented in another branch/worktree/project) is
**excluded by evidence**.

### 3.8 Only one Finance specification exists

A filename search for `*finance*` outside `node_modules`/`.next`/`dist`/`.git` returned
`engineering/Finance Engineering.md` as the **sole** Finance specification, alongside the
non-authoritative artefacts (`finance.prisma`, two frontend route directories). There is no
second, competing Finance specification.

---

## 4. Module comparison table

Assessed against §9.1, which lists **16** modules (§4 claims 14 — see §8.1). A module counts as
implemented only where executable code supports its specified responsibility. Generic
infrastructure, similarly named fields, and seed literals are **not** counted.

| # | Claimed Finance module | Expected responsibility | Implementation found? | Evidence | Status |
|---|------------------------|------------------------|-----------------------|----------|--------|
| 1 | `FinanceModule` | Root module, orchestrates sub-modules | **No** | Not in `src/modules`; `app.module.ts` registers 16 modules, none Finance | **Not found** |
| 2 | `FeeStructureModule` | FeeCategory, FeeItem, FeeTemplate, FeeSchedule CRUD | **No** | Model `FeeStructure` exists (`finance.prisma:1`); **no** service/controller; `FeeCategory`/`FeeItem`/`FeeTemplate`/`FeeSchedule` have no models at all | **Not found** (data-only) |
| 3 | `BillingModule` | Bill generation, invoice creation, line items | **No** | No `bills` or `invoice_line_items` table; no code; `Invoice` is written only by the seed | **Not found** |
| 4 | `InvoiceModule` | Invoice lifecycle, approval, publication, cancellation | **No** | `Invoice` model exists (`finance.prisma:28`); no service/controller; no status transitions; no `PUBLISHED`/`CANCELLED` handling anywhere | **Not found** (data-only) |
| 5 | `PaymentModule` | Payment recording, confirmation, failure handling | **No** | `Payment` model exists (`finance.prisma:59`); no service/controller; `payment.worker.ts` only logs | **Not found** (data-only) |
| 6 | `PaymentAllocationModule` | Payment-to-invoice allocation | **No** | No `payment_allocations` table; no code | **Not found** |
| 7 | `GatewayModule` | Gateway abstraction, transaction management | **No** | No `gateway_transactions` / `payment_gateway_configs` table; no gateway code; no credential handling | **Not found** |
| 8 | `ReconciliationModule` | Gateway-to-internal matching | **No** | No `payment_reconciliations` table; `JOB_TYPES.PAYMENT_RECONCILE` consumed only by the logging stub | **Not found** |
| 9 | `DiscountModule` | Discount CRUD, eligibility, application | **No** | No `discounts` / `discount_applications` table; no code | **Not found** |
| 10 | `ScholarshipModule` | Scholarship CRUD, award management | **No** | `Scholarship` model exists (`finance.prisma:83`); no service/controller; no `scholarship_awards` table | **Not found** (data-only) |
| 11 | `RefundModule` | Refund request, approval, processing | **No** | `Refund` model exists (`finance.prisma:103`); no service/controller; no approval workflow. (`people.e2e-spec.ts:408` `refundStatus` is a **Staff withdrawal** field, not Finance) | **Not found** (data-only) |
| 12 | `AdjustmentModule` | Charge corrections, adjustments, write-offs | **No** | No `financial_adjustments` / `write_offs` tables; no code | **Not found** |
| 13 | `InstallmentModule` | Installment plans, schedules, late fees | **No** | No `installment_plans` / `installment_schedules` / `late_fees` tables; no code | **Not found** |
| 14 | `AccountingModule` | Journal entries, ledger accounts, balances, periods | **No** | No `journal_entries`, `journal_entry_lines`, `ledger_accounts`, `account_balances`, `financial_periods` tables; no double-entry code | **Not found** |
| 15 | `FinancialPolicyModule` | Policy CRUD, versioning, retrieval | **No** | No `financial_policies` table; no code | **Not found** |
| 16 | `SummerSchoolBillingModule` | Receive billing requests, generate invoices | **No** | `academics/controllers/summer-school.controller.ts` exists but contains **no** Finance integration; no billing-request handling, no invoice generation | **Not found** |

**Result: 0 of 16 implemented · 0 partially implemented · 16 not found.**

Four modules (2, 4, 5, 10, 11 — five models across four areas) have a *data model* only. A
Prisma model is not an implementation: none is reachable through any service, controller, or
endpoint, and none is referenced by any application code.

---

## 5. Actual Finance implementation inventory

Everything that genuinely exists:

| Artefact | Location | Classification |
|----------|----------|----------------|
| 5 Prisma models | `apps/api/prisma/domains/finance.prisma` (117 lines) | **Partially implemented — data layer only** |
| 3 Finance enums | `apps/api/prisma/schema.prisma:197, 206, 213` (`InvoiceStatus`, `PaymentStatus`, `PaymentMethod`) | **Specified in code, not in the domain file** |
| 5 DB tables | `migrations/20260908180041_init/migration.sql` | **Implemented (schema only)** |
| 5 Prisma client delegates | generated client (`prisma-client-js`) exposes `feeStructure`, `invoice`, `payment`, `scholarship`, `refund` | **Implemented (type layer only, zero call sites)** |
| 9 seed rows | `prisma/seed.ts:1194–1197` (3 `FeeStructure`), `1201–1220` (6 `Invoice`) | **Implemented (seed only, never read)** |
| Payment queue worker | `src/workers/payment.worker.ts` | **Referenced but absent** (logging stub) |
| Queue/job constants | `src/queue/queue.constants.ts` | **Referenced but absent** (declarations only) |
| Bursar/finance UI | 12 pages under `apps/web/src/app/` | **Specified-only UI — no backend wiring** |

### Bursar/finance frontend detail

| Page | Size |
|------|------|
| `bursar/page.tsx` | 12,791 B |
| `bursar/invoices/page.tsx` | 8,880 B |
| `bursar/payments/page.tsx` | 9,418 B |
| `bursar/fees/page.tsx` | 7,913 B |
| `bursar/expenses/page.tsx` | 8,393 B |
| `bursar/communication/page.tsx` | 10,339 B |
| `bursar/profile/page.tsx` | 5,404 B |
| `bursar/layout.tsx`, `bursar/nav.ts` | 456 B / 468 B |
| `institution/finance/page.tsx` | 17,263 B |
| `org-admin/finance/page.tsx` | 12,351 B |
| `parent/fees/page.tsx` | 6,723 B |

`bursar/invoices/page.tsx:33` declares `const initialInvoices: Invoice[] = [...]` and line 72
`useState<Invoice[]>(initialInvoices)`. A repository-wide search of `apps/web/src` for
`fetch(`, `axios`, `/invoices`, `/payments`, `/fees` returned **no matches**.

**The frontend presents a Finance UI with no backend behind it.** No invoice is issued,
recorded, or displayed from real data. This is the most likely origin of the impression that
Finance "exists", and it is a UI shell only.

---

## 6. Missing / partial modules

**Fully missing (no artefact of any kind):** BillingModule, PaymentAllocationModule,
GatewayModule, ReconciliationModule, DiscountModule, AdjustmentModule, InstallmentModule,
AccountingModule, FinancialPolicyModule, SummerSchoolBillingModule, FinanceModule —
**11 of 16.**

**Data-model-only (4 modules, 5 models):** FeeStructureModule, InvoiceModule, PaymentModule,
ScholarshipModule, RefundModule.

**Missing sub-responsibilities within the data-only modules:**

| Specified | Present | Gap |
|-----------|---------|-----|
| `FeeCategory`, `FeeItem`, `FeeTemplate`, `FeeSchedule`, `FeeScheduleItem` | a single flattened `FeeStructure` model | The entire fee taxonomy is absent; `category` is a bare `String` |
| Invoice lifecycle: approval, publication, cancellation | `status InvoiceStatus` (PENDING only in seed) | No transitions, no ADR-026 immutability enforcement |
| Invoice line items, totals, discounts, scholarships, tax, late fees | only `totalAmount`, `paidAmount`, `balance` | 7 of 10 specified total columns absent |
| `invoices.currency` (§7.2 line 834) | **absent from the `Invoice` model** | The settlement record cannot record its own currency (raised in the D-3 investigation §8.3) |
| Double-entry accounting (ADR-014, ADR-030) | nothing | No ledger, no journal entries, no balancing |
| Gateway credentials (§12.4) | nothing | D-9 remains wholly unstarted |
| Tax, numbering, penalty policies (ADR-021, ADR-022, ADR-023) | nothing | D-2 left these to Finance; Finance has none |

---

## 7. Prisma / model findings

### 7.1 Specified vs. implemented tables

§7.1 catalogues **30 tables**. The init migration creates **5** Finance tables (**17%**).

| Specified table | Implemented? |
|-----------------|--------------|
| `fee_categories`, `fee_items`, `fee_templates`, `fee_schedules`, `fee_schedule_items` | ❌ all 5 absent |
| `bills`, `invoice_line_items`, `charge_adjustments` | ❌ all 3 absent |
| `invoices` | ✅ present |
| `payments` | ✅ present |
| `payment_allocations`, `gateway_transactions`, `payment_reconciliations` | ❌ all 3 absent |
| `discounts`, `discount_applications` | ❌ both absent |
| `scholarships` | ✅ present |
| `scholarship_awards` | ❌ absent |
| `refunds` | ✅ present |
| `financial_adjustments`, `write_offs` | ❌ both absent |
| `installment_plans`, `installment_schedules`, `late_fees` | ❌ all 3 absent |
| `financial_policies` | ❌ absent |
| `ledger_accounts`, `journal_entries`, `journal_entry_lines`, `account_balances`, `financial_periods` | ❌ all 5 absent |
| `payment_gateway_configs` | ❌ absent |

### 7.2 `fee_structures` is not a specified table

The `FeeStructure` model maps to `fee_structures`, which **does not appear anywhere in §7.1**.
It is an implementation-only table with no specification basis — the same class of problem the
D-3 investigation identified for `Institution.currency`. Four of the five implemented tables
match specified names; this one does not.

### 7.3 Enum and type findings

- **§4 claims 17 enums. `finance.prisma` defines zero.** `InvoiceStatus`, `PaymentStatus`, and
  `PaymentMethod` are declared in the **root `schema.prisma`** (lines 197, 206, 213), outside
  the `domains/` convention. `Refund` and `Scholarship` use no dedicated status enum.
- **Cross-domain enum leak:** `FeeStructure.status` is typed `UserRoleStatus`
  (`finance.prisma:13`) — an **Identity/RBAC** enum reused as a fee lifecycle status. Fee
  status is therefore constrained to role-like states (`ACTIVE`/`INACTIVE`/…) rather than the
  fee lifecycle the specification describes.
- **Type divergence (D-3 §8.5):** all three currency columns are unbounded `TEXT`
  (`migration.sql:460, 499, 660`), while §7.2 requires `varchar(3)` ISO 4217. No ISO 4217
  validation exists anywhere.
- **Decimal precision divergence:** models use `@db.Decimal(10, 2)`; §7.2 line 787 mandates
  `decimal(14,2)` for all monetary columns.
- **No `version` column** on any Finance model, so the §2 optimistic-concurrency convention
  (and ADR-018) cannot hold for Finance records.
- **No `createdBy`/`updatedBy`/`deletedBy`** audit columns, though §7.2 line 785 lists them as
  common columns.

### 7.4 Migration evidence

`migrations/20260908180041_init/migration.sql` creates exactly `fee_structures`, `invoices`,
`payments`, `scholarships`, `refunds` (58 tables total across all domains). The generated
Prisma client exposes all 5 delegates, so `prisma generate` has been run against them — the
type layer is live even though no code calls it.

---

## 8. API / service findings

| Claim (§4 Phase 6) | Reality |
|-------------------|---------|
| 100+ endpoints (65 primary + 35 sub-resource) | 26 controllers exist repo-wide; **0 Finance endpoints** |
| 14 domain services | 0 Finance services (36 exist repo-wide, all other domains) |
| 14 repositories | 0 repositories **codebase-wide** — the repository pattern is unused |
| 8 event consumers | 0 Finance event consumers; 0 Finance events emitted |
| Payment guards | None. No `finance:` permission is checked anywhere, because no Finance route exists |

**No Finance API surface of any kind is reachable.** There is no invoice, payment, fee,
refund, scholarship, discount, installment, ledger, gateway, reconciliation, financial-policy,
or billing endpoint.

### 8.1 Internal contradictions in the Finance specification

These are inconsistencies **within the specification itself**, independent of the repository:

| §4 claim | Authoritative detail section | Actual count in that section |
|----------|------------------------------|-----------------------------|
| "14 modules" | §9.1 Module Structure | **16 modules** |
| "32 tables" | §7.1 Table Catalogue | **30 tables** |
| "32 models" | §4 (no detail section cross-check available) | repo has 5 |
| "17 enums" | §8 Enums | `finance.prisma` defines 0 |

The module and table contradictions are verifiable without reference to the repository, and
mean the §4 summary line cannot be reconciled with the specification's own body.

---

## 9. Test findings

| Claim (§4 Phase 7) | Reality |
|-------------------|---------|
| 18 test categories, ~240+ test scenarios | **0 Finance tests of any kind** |

- A search of `apps/api/test` and `apps/api/src` for `FeeStructure`, `Invoice`, `Payment`,
  `Refund`, `Scholarship`, `Ledger` returned only:
  - `people.e2e-spec.ts:408` — `withdrawalDetail.refundStatus === 'PENDING'`, a **People/Staff
    withdrawal** field, unrelated to the Finance `Refund` model.
  - `reserved-config-namespaces.spec.ts` — the D-2 guard test, which uses
    `financial.currency` / `financial.numbering.invoice` as *arbitrary blocked key strings*.
- No `finance.e2e-spec.ts`, no Finance service spec, no Finance test fixtures.
- The D-2 and D-3 work is **not** Finance implementation and is excluded from all counts above.

---

## 10. Dependency / conformance findings

### 10.1 Live code dependencies on Finance: **none**

Because §3.5 establishes zero coupling, **no implemented code depends on an absent Finance
module.** Nothing is broken at runtime. This is the single most important risk finding: the
discrepancy is currently *latent*, not active.

### 10.2 Specifications that assume Finance exists

| Specification | Reference | Depends on | Domain implemented? |
|---------------|-----------|------------|---------------------|
| **Operations** | ADR-001 "Operations owns resources, Finance owns money"; ADR-008 "Library fines reference Finance for billing"; line 58 "Hostel fees, transport fees, library fines… calculated by Finance"; `library_fines.amount` "Calculated by Finance" (line 1032); Outstanding "**Hostel billing integration — High**" and "**Transport fee integration — High**" (lines 2619–2620) | Fee calculation, billing, fines | **Yes** — 9 models, hostels/transport/inventory/maintenance/leave |
| **Academics** | Finance ADR-025 (Summer School billing); Academics line 1860 "Payment processed (if applicable) via Finance domain" | Enrollment → billing; Summer School invoicing | **Yes** — 8 controllers incl. `summer-school.controller.ts` |
| **People** | Line 1734 "Payment Gateways — Process application fees, tuition payments — Domain events consumed by Finance domain" | Application/tuition fee processing | **Yes** — 9 controllers |
| **Institution Management** | ADR-015 "Subscription billing handled by Finance domain"; line 322 assumption 14; line 1066 | Subscription billing | **Yes** — 3 controllers. **Note: no subscription code exists in the module either**, so this dependency is already unmet on both sides |
| **Documents & Learning** | Line 62 Finance boundary: "Finance owns receipts and invoices" | Receipt/invoice documents | No |
| **Platform Administration** | Line 558 "Finance owns payment processing; Platform Administration only manages subscription state" | Payment processing | No |

### 10.3 Consequence

Four **implemented** domains (Operations, Academics, People, Institution Management) carry
specification-level dependencies on an absent Finance. Two of them — Operations hostel and
transport billing — are logged as **High**-priority outstanding items in their own
specification. None of these can proceed, and none currently attempts to.

An additional Operations-side gap, noted for completeness: `library_fines` is specified
(Operations lines 1024–1035, including a `currency` column) but **absent from the implemented
`operations.prisma`**, so even the fine record Finance is meant to calculate does not exist.

---

## 11. Impact on currently implemented phases

| Area | Impact |
|------|--------|
| Runtime behaviour | **None.** Zero coupling; no Finance module is imported, called, or required. |
| Build / typecheck | **None.** The 5 Prisma models and 3 enums compile cleanly and are unused. |
| Database | 5 Finance tables exist and are populated by the seed (9 rows) but are **never read or written** by application code. Harmless but dead. |
| Tests | **None.** No existing test touches Finance. The full suite result is unaffected. |
| Frontend | The bursar/finance UI is **misleading**: it presents invoices, payments, and fees that do not exist in the backend. A reviewer or demo would reasonably conclude Finance is built. |
| Security posture | No `finance:*` permission is enforced anywhere — correct, since no Finance route exists. |
| D-2 / D-3 | **Unaffected.** D-2's `financial.*` write-path guard blocks writes to a namespace no longer owned by Institution Management; Finance's absence does not weaken it. D-3's terminology decision and ADR-036 are unaffected. |
| Forward roadmap | Operations and Academics cannot complete their billing integration without Finance. This is the real cost of the gap. |

---

## 12. Exact discrepancy requiring an architecture / specification decision

### 12.1 The statement under audit

> `engineering/Finance Engineering.md` §4, line 219:
> **"Phase 5 — Backend Implementation | Complete | 14 modules, 14 repositories, 14 domain services, 14 controllers, 8 event consumers"**
> and line 223: **"Overall Status: Approved — Frozen for Implementation."**

### 12.2 The evidence against it

| Claim | Verified reality |
|-------|------------------|
| 14 modules | **0 of 16** exist (§4 of this report) |
| 14 repositories | **0** — no repository layer exists anywhere in the codebase |
| 14 domain services | **0** |
| 14 controllers | **0** of 26 controllers |
| 8 event consumers | **0** — no Finance event is emitted |
| 32 tables (Phase 3) | **5** of 30 catalogued |
| 32 models / 17 enums (Phase 4) | **5** models; **0** enums in the domain file |
| 100+ endpoints (Phase 6) | **0** Finance endpoints |
| ~240+ test scenarios (Phase 7) | **0** Finance tests |

### 12.3 The compound discrepancy

1. **Implementation gap.** Finance Phase 3–7 statuses describe an unbuilt domain. The status
   line and the "Approved — Frozen for Implementation" overall status are unsupported.
2. **Internal specification contradiction.** §4 says 14 modules (§9.1 lists 16) and 32 tables
   (§7.1 lists 30). The summary line cannot be reconciled with the document's own body, so
   the discrepancy is **not solely** a repository problem.
3. **Layering divergence.** The specified Service→Repository→Prisma layering is unused
   project-wide (0 repositories, 36 services using `PrismaService` directly). Any future
   Finance build would not follow §9.2 as written.
4. **Unspecified schema artefact.** `fee_structures` exists in the database with no
   specification basis — the same category of defect as `Institution.currency` (D-3 §8.2).
5. **Misleading UI.** 12 bursar/finance pages present non-existent backend functionality.

### 12.4 The decision that is required

**What does a phase status of "Complete" mean in a frozen engineering specification: "designed"
or "implemented"?** And consequently, is Finance (a) a design target whose statuses should
read *Specified / Not Started*, or (b) a build commitment that has silently not been executed?

This audit deliberately does **not** answer that, and no status has been altered. The status
line has been left exactly as written pending an explicit instruction.

---

## 13. Recommended next decision point

**Recommended next step: a single specification-conformance decision on what "Phase N —
Complete" means in the frozen engineering specifications, applied first to Finance §4. Decide
and record it; implement nothing.**

Rationale:

- **Every other decision depends on it.** Whether Finance is a build commitment, whether §4 is
  corrected, whether the bursar UI is misleading, and whether Operations/Academics billing
  work can proceed are all downstream of this one question.
- **It is a documentation decision, not an engineering one.** It requires no code, schema,
  migration, or test change, so it can be made without pre-judging the build.
- **It must precede any status edit.** Correcting "Complete" to "Not Started" is only correct
  under one definition of the word; leaving it is only defensible under the other. Editing the
  status first would silently resolve the question by accident.
- **It also surfaces the two internal contradictions** (§9.1 = 16 vs §4 = 14; §7.1 = 30 vs
  §4 = 32), which need reconciling regardless of the repository outcome.

Explicitly **not** recommended at this stage, and **not** done: choosing a Finance build
sequence, reconciling `fee_structures`, adding `invoices.currency`, closing the repository-layer
divergence, or hiding the bursar UI. Each is a consequence, not a prerequisite.

---

## Appendix A — Checks performed

No test suite, build, or migration was run; this audit changed nothing. All checks were
read-only searches and file reads.

| # | Check | Result |
|---|-------|--------|
| 1 | `src/modules` directory listing | 11 modules, no `finance` |
| 2 | Recursive filename search (`*financ*`, `*invoice*`, `*payment*`, `*ledger*`, `*fee*`, `*refund*`, `*scholar*`, `*gateway*`, `*reconcil*`, `*installment*`, `*discount*`, `*adjust*`) | Only the artefacts in §5 |
| 3 | `app.module.ts` full read | 16 modules registered, none Finance |
| 4 | `*.controller.ts` inventory | 26 controllers, 0 Finance |
| 5 | `*.service.ts` / repository file count | 36 services, **0 repositories** |
| 6 | `src/**/*.ts` search for `prisma.(invoice\|payment\|feeStructure\|scholarship\|refund)` + all 16 module names | **0 matches** |
| 7 | `src/**/*.ts` search for Finance domain events | **0 matches** |
| 8 | `payment.worker.ts` full read (39 lines) | Logging stub |
| 9 | `queue.constants.ts` full read | Constants declared, unconsumed |
| 10 | `git branch -a`, `git worktree list`, `git stash list` | 3 branches, 1 worktree, 0 stashes |
| 11 | `git ls-tree -r` on `main`, `phase/0-foundation`, `origin/main` for Finance paths + prisma domains | No Finance module on any branch |
| 12 | `finance.prisma` model/enum/`@@map` extraction | 5 models, 0 enums |
| 13 | `finance.prisma` full read (117 lines) | Field-level divergence vs §7.2 |
| 14 | Generated Prisma client delegate search | 5 delegates present |
| 15 | `migration.sql` `CREATE TABLE` extraction | 5 Finance tables of 58 total |
| 16 | Enum definition search across all prisma files | `InvoiceStatus`/`PaymentStatus`/`PaymentMethod` in root `schema.prisma:197,206,213` |
| 17 | `seed.ts` Finance row search | 3 `FeeStructure` + 6 `Invoice` |
| 18 | Bursar/finance frontend file inventory + content inspection | 12 pages, hardcoded `useState` |
| 19 | `apps/web/src` search for `fetch(`/`axios`/finance endpoints | **0 matches** |
| 20 | Test search for Finance entities in `apps/api/test` + `src` | 0 Finance tests; 2 false positives explained |
| 21 | Cross-spec search for Finance dependency statements | 6 specifications, 4 implemented domains |
| 22 | Filename search for a second Finance specification | Only `engineering/Finance Engineering.md` |

**Pre-existing conditions encountered (not caused by this audit):**
- Two shell searches exceeded the 120 s / 90 s timeout because `node_modules`, `.next`, and
  `dist` were traversed; both were re-run with tighter scoping and completed. No check was
  skipped as a result — check 22's conclusion was confirmed on the re-run.
- `rg` (ripgrep) is not installed on this machine; `Select-String` and the search tool were
  used throughout.
- Pre-existing working-tree changes from the completed D-2 and D-3 tasks were present before
  this audit began and were not modified.

## Appendix B — Repository state

- **HEAD:** `aae6309` — unchanged. No commit, amend, branch, or history operation.
- **Files changed by this audit:** **none.** No code, Prisma schema, migration, API, test, ADR,
  or specification file was created, modified, or deleted.
- **Only artifact created:** `docs/PHASE_6_FINANCE_PHASE5_IMPLEMENTATION_STATUS_AUDIT.md`
  (new, untracked).
- **Finance specification status line:** left exactly as written. Not corrected, not annotated.
- **Frozen decisions:** D-2 Option 1, ADR-031, D-3 terminology, ADR-036, `Institution.currency`,
  `regional.*`, D-9, D-14 — all untouched.
