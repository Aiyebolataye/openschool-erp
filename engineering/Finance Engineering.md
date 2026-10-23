# Finance Engineering Specification

**Domain:** Finance
**Scope:** Fee Structure, Billing, Payments, Payment Gateway Integration, Discounts, Scholarships & Financial Aid, Refunds, Financial Adjustments, Summer School Billing, Installment Plans, Financial Policies, Accounting Foundation, Financial Reports
**Created:** 2026-07-17
**Status:** Approved — Frozen for Implementation
**Last Updated:** 2026-09-28

---

## Table of Contents

1. [Overview](#1-overview)
2. [Engineering Principles](#2-engineering-principles)
3. [Architecture Decision Records](#3-architecture-decision-records)
4. [Engineering Status](#4-engineering-status)
5. [Phase 1 — Domain Analysis](#5-phase-1--domain-analysis)
6. [Phase 2 — Domain Design](#6-phase-2--domain-design)
7. [Phase 3 — Database Design](#7-phase-3--database-design)
8. [Phase 4 — Prisma Schema](#8-phase-4--prisma-schema)
9. [Phase 5 — Backend Implementation](#9-phase-5--backend-implementation)
10. [Phase 6 — API Design](#10-phase-6--api-design)
11. [Phase 7 — Testing & Verification](#11-phase-7--testing--verification)
12. [Payment Gateway Abstraction](#12-payment-gateway-abstraction)
13. [Double-Entry Accounting Foundation](#13-double-entry-accounting-foundation)
14. [Outstanding Items](#14-outstanding-items)
15. [Revision History](#15-revision-history)

---

## 1. Overview

Finance is the monetary backbone of the platform, owning every financial transaction performed within an institution — from fee definition and billing through payment collection, refund processing, and accounting records. Finance owns money.

| Aspect | Approach |
|--------|----------|
| Identity | Institution-scoped; every entity belongs to one Institution |
| Billing | Invoice is the primary financial document; Bills are draft precursors |
| Payments | Gateway-independent; supports online, offline, cash, bank transfer, POS |
| Scholarships | Multiple funding sources; reduce invoice amounts |
| Refunds | Approval workflow; credit notes and original-payment refunds |
| Accounting | Double-entry journal entries; financial periods aligned with academic sessions |
| Integration | Other domains request financial operations; Finance owns all calculation |
| Communication | Publishes events; does not own messaging or notifications |

**In Scope:** Fee structure management (categories, items, templates, schedules), bill and invoice generation, invoice lifecycle, outstanding balances, payment processing (online/offline/cash/bank transfer/POS), payment allocation, partial and overpayments, payment reconciliation, payment gateway abstraction (Paystack, Flutterwave, Stripe), discounts (percentage, fixed, early payment, sibling, employee, custom), scholarships and financial aid (full, partial, sponsorship, grant, fee waiver), refunds (full, partial, credit notes, approval workflow), financial adjustments (charge corrections, invoice adjustments, payment reversals, manual adjustments, write-offs), Summer School billing integration, installment plans (monthly, term, custom), configurable financial policies (currency, tax, numbering, penalties), double-entry accounting foundation (ledger accounts, journal entries, balances, financial periods), financial reports (revenue, outstanding, payments, collections, scholarships, discounts, refunds, audit)

**Out of Scope:** Authentication, Authorization, Roles, Permissions, MFA, Sessions (Identity & Access), Student/Staff/Parent profiles (People), Subjects, Results, Attendance, Promotions, Summer School eligibility (Academic Management), Email, SMS, Notifications (Communication), Institution configuration, Licensing, Subscription management (Institution Management), File storage (Platform Services)

> **Financial configuration ownership (Phase 6 D-2, decided 2026-09-29).** The *Out of Scope* line
> above excludes **Institution configuration as a Finance-owned capability surface**. It does not
> transfer ownership of financial configuration values away from Finance, and the two lines are not
> in conflict. **Finance is the sole authoritative owner** of the values for all six of the
> following: settlement currency, tax rules, invoice numbering, late-fee/penalty rules, gateway
> enablement, and gateway credentials.
>
> **Gateway credentials must never be stored in the institution configuration JSON namespace.**
> This is consistent with §12.4 ("encrypted at rest"; "Secret keys are never exposed in API
> responses") and with Institution Management ADR-031.
>
> **The `financial.*` namespace.** `financial.*` in `institution_configurations` is **retained as a
> read-only projection, not an authoritative source**. Finance is authoritative for Finance-owned
> financial configuration. The Institution write path already rejects the `financial.*` namespace, so
> the namespace cannot become a second writer; no code change is required to give it that property.
>
> This is consistent with Institution Management ADR-031, which already assigns financial
> configuration and policy to Finance and removes `financial.*` as an Institution configuration
> category. No change to that document is required.

---

## 2. Engineering Principles

### Core Philosophy

- **Finance Owns Money:** All financial calculations, invoice generation, payment processing, and accounting records belong exclusively to the Finance domain; other domains send billing requests but never calculate invoices
- **Invoice as Source of Truth:** The Invoice is the authoritative financial document; all payment allocation, refund, scholarship, and discount operations reference invoices
- **Gateway Independence:** Payment gateway integration is abstracted; the domain remains provider-independent with a pluggable gateway adapter pattern
- **Double-Entry Accounting:** Every financial transaction produces balanced journal entries (debits = credits); accounting integrity is non-negotiable
- **Immutable Financial Records:** Published invoices, confirmed payments, and posted journal entries are never modified; corrections create new versioned records
- **Multi-Tenant Isolation by Default:** Every query scoped to tenant context; cross-tenant access = security violation
- **Institution Scoping:** Every entity is scoped to one Institution; currency, tax rules, and numbering are institution-specific. "Institution-scoped" describes **scope, not storage ownership** — the institution's settlement currency is a Finance-owned value (ADR-036, D-3)
- **Event-Driven Communication:** Cross-service communication via domain events; eventual consistency
- **Configuration over Customization:** Financial policies, tax rules, penalties, and numbering are institution-configurable; no code changes required
- **Soft Delete by Default:** All mutable core entities support restore within retention period
- **Business Status vs Soft Delete:** Status enums represent business states (e.g., DRAFT, PUBLISHED, PAID); deletion is controlled by `deleted_at` / `deleted_by` columns exclusively
- **Optimistic Concurrency:** Version column on mutable entities; 409 Conflict on version mismatch
- **Immutable Audit Logging:** Append-only audit logs; never update or delete
- **Approval Workflows:** Refunds and write-offs require multi-level authorization with threshold-based escalation

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Database tables | snake_case, plural | invoices, payments, ledger_accounts |
| Columns | snake_case | invoice_id, total_amount |
| Enums | SCREAMING_SNAKE_CASE | ACTIVE, DRAFT, PUBLISHED |
| Classes | PascalCase | InvoiceAggregate |
| Methods | camelCase | createInvoice |
| API responses | camelCase | success, invoiceId |
| Events | PascalCase, past tense | InvoiceGenerated |
| Errors | PascalCase + Error | InvoiceNotFoundError |
| Permissions | `{domain}:{resource}:{action}` | finance:invoice:read |

### Currency Terminology

> **Locked by decision D-3 (ADR-036).** The terms below are authoritative for the Finance
> domain and must be used consistently by implementers.

| Term | Meaning | Owner |
|------|---------|-------|
| **Settlement currency** | The currency in which a financial transaction is actually denominated and settled. Applies to invoices, payments, fees, refunds, adjustments, discounts, scholarships, and every other Finance-owned monetary operation. | **Finance** |
| **Institution default currency** | The institution's authoritative **settlement currency**. A shorthand used inside this specification (notably V-INV-07) meaning "the settlement currency configured for this institution" — **not** a display or formatting setting. | **Finance** |
| **Currency formatting / display** | How a monetary value is rendered for a reader: symbol, placement, decimal separators, locale conventions. Presentation only; carries no settlement meaning. | Institution / regional / localization concerns, where applicable |
| **Invoice currency** | The settlement currency recorded on a specific invoice. Defaults to the institution default currency when not specified (V-INV-07). | **Finance** |

Two consequences follow, and both are intentional:

1. **The existence of a column does not transfer ownership.** A settlement currency may be
   *scoped to* an institution without being *owned or stored by* Institution Management.
   Ownership follows the table above, not the presence of a column. In particular, the
   existing `institution.currency` column in the Prisma Institution model does **not** make
   Institution Management the owner of settlement currency.
2. **Settlement currency and currency formatting are distinct concepts** and must not be
   conflated. A formatting setting can never satisfy a settlement requirement, and a
   settlement currency is never a substitute for a formatting setting.

ADR-036 is a **terminology-only** decision. It does not decide where settlement currency is
persisted, and it does not delete, rename, migrate, or reassign `Institution.currency`.

> **Storage question now decided — Phase 6 D-3 (2026-09-29).** ADR-036 deliberately left the
> storage mechanism open. That question is now **answered**; ADR-036's terminology lock is
> **unchanged** and is not reopened. The authoritative settlement-currency source is a
> **`FinancialPolicy` currency row per institution**, and `Institution.currency` is retained for
> **display/compatibility only** and is **not independently writable** as an authoritative Finance
> value. There must be no second authoritative writer. The "fixed after first invoice" check
> (BR-015 / ADR-020 / I-13) is performed by the **Finance-owned currency policy write path**
> against Finance's authoritative invoice history, not against a client-provided field, and a
> later policy version must not silently change historical invoice currency. See **§6.5.3** for the
> full record and §2 *Currency Terminology* for the terminology this builds on.

### Finance Role Permissions

> **Locked by decision Phase 6 D-7 (ADR-037), for the billing surface only.** The grants below are
> authoritative for the Finance domain and must be used as-is by implementers. This is an
> **explicit Finance RBAC decision**: §10.3 maps every Finance endpoint to a
> `{domain}:{resource}:{action}` permission, but this specification provides **no Finance role
> matrix** - it names no Finance role and assigns no permission to any role. The mapping below is
> therefore decided here and is not derived, inferred, or carried over from any other domain's
> role matrix.
>
> **Amended by Phase 6 D-7 Q7 (2026-09-29).** ADR-037's original wording left the
> fee-structure catalogue *outside* the ADR and undecided. The owner has since decided it, and the
> amendment is recorded in the **ADR-037 clarification** below. The billing grants and the payment
> exclusion in ADR-037 itself are **unchanged**.

The five admin roles (`PLATFORM_ADMIN`, `ORG_ADMIN`, `PRIMARY_INSTITUTION_ADMIN`,
`INSTITUTION_ADMIN`, `PRINCIPAL`) hold every Finance permission. One operational role is granted
the billing surface:

| Role | Resource | Actions granted |
|------|----------|-----------------|
| `BURSAR` | `finance:fee_schedule` | `read`, `create`, `update`, `manage` |
| `BURSAR` | `finance:bill` | `read`, `create`, `convert`, `cancel` |
| `BURSAR` | `finance:invoice` | `read`, `create`, `manage`, `cancel`, `update`, `adjust` |

**`BURSAR` receives no `finance:payment` permission.** Settlement is outside this decision.

Object-level rules are unaffected by this decision and continue to apply: tenant and institution
are taken from the trusted JWT, an active institution membership is required, and cross-tenant or
cross-institution access fails closed. A grant never widens object scope.

#### ADR-037 clarification — `BURSAR` fee-catalogue grant (Phase 6 D-7 Q7, 2026-09-29)

The owner has decided that `BURSAR` **also** receives the fee-category and fee-item permissions
required to operate its billing workflow, because a `BURSAR` can create and publish a fee schedule
but could not create the categories and items those schedules reference. The action set is the one
§10.3 already defines for exactly these two resources (L1560-1562, L1568-1570) — `read`, `create`,
`update`:

| Role | Resource | Actions granted | Basis |
|------|----------|-----------------|-------|
| `BURSAR` | `finance:fee_category` | `read`, `create`, `update` | Phase 6 D-7 Q7 |
| `BURSAR` | `finance:fee_item` | `read`, `create`, `update` | Phase 6 D-7 Q7 |

This brings the `BURSAR` Finance grant total from **14 to 20**.

**Three boundaries are unchanged and must not be read as relaxed by this amendment:**

1. **Billing permissions** remain as tabulated in ADR-037 above.
2. **`BURSAR` remains explicitly excluded from payment permissions.** No `finance:payment:read`,
   `create`, `confirm`, or `allocate` is granted to any role other than the five admin roles
   (Phase 6 D-7 Q6).
3. **`BURSAR` holds no general Finance admin authority.** The remaining 17 admin-only Finance
   resources - including `finance:journal:create`, `finance:ledger:create`,
   `finance:period:manage`, `finance:refund:approve`, and `finance:write_off:approve` - remain
   **admin-only for now** and are not assigned to any new role (Phase 6 D-7 Q2).

**The fee-catalogue grant is a narrow, enumerated exception.** It must not be generalised to any
other currently admin-only Finance resource.

#### Approval authority (Phase 6 D-7, decided 2026-09-29)

| Question | Decision |
|----------|----------|
| New approval role | **None.** `BURSAR` is reused; request and approval authority are separated through permissions. No approval role and no delegation model (D-7 Q1) |
| Request vs approval separation | **Permissions**, with the threshold held as a `FinancialPolicy` value using existing policy **P-08** — default `50000`, range `1000`–`1000000` (D-7 Q3) |
| Self-approval | **Blocked.** The authenticated actor identity is compared against the identity that initiated/requested the refund or write-off. The comparison uses the canonical authenticated user uuid already established by the repository: the refund's `approved_by` (§7.2) against the record's initiator `createdBy` column. No new identity concept is introduced (D-7 Q4) |
| Period-close authority | **Not extended.** Financial periods remain restricted to the five admin roles (D-7 Q5) |
| Payment permissions | **Five admin roles only** (D-7 Q6) |

#### Guard ownership (Phase 6 D-7 Q8, decided 2026-09-29)

| Guard | Owner | Constraint |
|-------|-------|------------|
| `FinanceAccessGuard` | **Finance** | Existing service-level Finance access logic may remain **where it correctly enforces relational Finance ownership**, but the implementation **must not create a fail-open path** |
| `ModuleLicenseGuard` | **Institution Management — not Finance** | Licensing is out of Finance scope (§1) |
| `FinancialAuthorityGuard` | **Finance** | |
| `ImmutabilityGuard` | **Finance** | |

**Database constraints** are used for true data invariants where appropriate and are **not** a
substitute for authorization guards. See §9.5.

**Remaining authority questions.** Beyond the items decided above, the role assignment of the other
admin-only Finance resources and every further approval-authority question remain as recorded in
§9.5 and §3 (ADR-037). ADR-037 grants permissions only. It introduces **no new role, no new
permission, no new endpoint, and no authorization behaviour** beyond the grants tabulated above
and in the D-7 Q7 amendment.

### Tenant Isolation

- Tenant ID extracted from JWT and passed to repository methods as first parameter
- Application-level filtering (no Postgres Row-Level Security)
- Every query must include tenant filter
- Institution ID further scopes queries within a tenant

### Soft Delete

- All mutable core entities use soft delete via `deleted_at` (DateTime?) and `deleted_by` (uuid?)
- Business status (e.g., DRAFT, PUBLISHED, PAID) is a separate concern from deletion
- Financial records have restricted deletion: published invoices and confirmed payments are never soft-deleted; corrections use adjustment records
- 30-day restore window before permanent deletion for eligible entities

### Audit Logging

Every state-changing operation generates an append-only audit log entry with: entity_type, entity_id, action, actor_id, actor_email, changes (JSON diff), context_ip, context_user_agent, timestamp.

For financial records, the audit log additionally captures: amount, currency, balance_before, balance_after.

### Error Handling

- Structured error responses: `{ success: false, error: { code, message, details[] } }`
- Domain-specific error classes; never expose internal details
- Full error context logged server-side
- Financial errors include transaction reference for debugging

### Prisma Schema Principles

- UUID `@default(uuid())` for all primary keys
- `@unique` constraints for business keys
- `@map` for snake_case column names
- Soft delete via `deleted_at` (DateTime?) and `deleted_by` (uuid?)
- Business status via `status` enum (never a deletion marker)
- Optimistic locking via `version` (Int @default(1))
- Audit fields: created_at, created_by, updated_at, updated_by
- JSON columns for flexible data (metadata, line item details, gateway response)
- Prisma enums mapped to database types
- `Decimal` type for all monetary amounts (never Float)
- Cascade deletes: child entities cascade from parent aggregate root; cross-aggregate references use application-level guards

### Technology Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js >=22.0.0 |
| Framework | NestJS ^11.0.0 |
| ORM | Prisma ^6.12.0 |
| Language | TypeScript ^5.8.3 |
| Validation | class-validator + class-transformer |
| Auth | JWT + bcrypt |
| Testing | Jest ^30.0.0 |
| Migrations | Prisma Migrate |
| API Docs | Swagger/OpenAPI ^7.0.0 |

---

## 3. Architecture Decision Records

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-001 | Invoice is the primary financial document | All financial operations (payments, refunds, scholarships, discounts) reference the Invoice; it is the source of truth |
| ADR-002 | Bills are draft charges; Invoices are published documents | Bills are generated from fee schedules and can be modified; Invoices are finalized and immutable |
| ADR-003 | Fee schedules are session-scoped | Fees change per academic session; schedules must be versioned per session |
| ADR-004 | Payments are allocated to invoices via PaymentAllocation | A single payment may cover multiple invoices; allocation provides traceability |
| ADR-005 | Partial payments are supported | Students may pay in installments; invoice status tracks partial payment |
| ADR-006 | Overpayments create credit balance | Excess payments are not lost; credit balance applies to future invoices |
| ADR-007 | Gateway-independent payment architecture | Provider abstraction via adapter pattern; institutions can switch providers without domain changes |
| ADR-008 | Gateway transactions are audit records | GatewayTransaction captures provider response; payment state is owned by Finance, not the gateway |
| ADR-009 | Discounts are applied at billing time | Discounts reduce invoice amounts at generation; they are not applied at payment time |
| ADR-010 | Scholarships reduce invoice amounts | Scholarships are funding sources that reduce what a student owes; they create line items on invoices |
| ADR-011 | Refunds require approval workflow | Refunds involve money leaving the institution; threshold-based multi-level approval prevents fraud |
| ADR-012 | Credit notes are the primary refund mechanism | Credit notes reduce outstanding balances; they are preferred over cash refunds for auditability |
| ADR-013 | Write-offs require admin authorization | Writing off bad debt is a financial decision; it requires explicit admin action and creates journal entries |
| ADR-014 | Double-entry accounting via journal entries | Every financial transaction produces balanced debit/credit pairs; accounting integrity is non-negotiable |
| ADR-015 | Financial periods align with academic sessions | Accounting periods match the institution's operational calendar for clean reporting |
| ADR-016 | Application-level tenant isolation (no RLS) | Consistent with Identity & Access, Institution Management, People, and Academic Management |
| ADR-017 | Domain events via EventEmitter2 (in-process) | Decouples services; supports async processing; future migration to MQ |
| ADR-018 | Optimistic concurrency (version column) | Prevents lost updates on financial records; no pessimistic locking overhead |
| ADR-019 | Immutable audit logs (append-only) | Tamper-proof financial audit trail; compliance requirement |
| ADR-020 | Currency is institution-scoped and fixed after first invoice | Changing currency after invoices exist would break financial integrity |
| ADR-021 | Tax rules are institution-configurable | Tax rates and exemptions vary by jurisdiction; must be configurable |
| ADR-022 | Invoice numbering is sequential and institution-scoped | Guarantees unique, gap-free invoice numbers per institution for compliance |
| ADR-023 | Late payment penalties are configurable | Penalty rates, grace periods, and calculation methods vary by institution |
| ADR-024 | Installment plans are linked to invoices | Installments decompose an invoice into scheduled payments with due dates |
| ADR-025 | Summer School billing triggered by Academic Management events | Academic Management sends billing requests; Finance owns all calculation and invoicing |
| ADR-026 | Published invoices are immutable | Corrections create credit/debit notes; the original invoice remains an accurate historical record |
| ADR-027 | Payment reconciliation matches gateway records | Reconciliation ensures internal records match external gateway statements |
| ADR-028 | Discount stacking is configurable per institution | Institutions choose whether multiple discounts can be combined on a single invoice |
| ADR-029 | Ledger accounts follow standard account types | ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE categories provide accounting structure |
| ADR-030 | Journal entries must balance | Every journal entry has equal total debits and credits; unbalanced entries are rejected |
| ADR-031 | Scholarship awards can span multiple invoices | A scholarship may apply to tuition, development levy, and other fees across invoices |
| ADR-032 | Financial reports are read-optimized projections | Reports are materialized views updated on event consumption; never queried from transactional tables |
| ADR-033 | Fee items must belong to a fee category | Categories provide organizational structure and reporting grouping |
| ADR-034 | Refunds reference original payment method by default | Refunds default to the original payment method; alternative methods require explicit selection |
| ADR-035 | Installment late fees are calculated daily | Late fees accrue daily on overdue installments; configurable rate and cap |
| ADR-036 | "Institution default currency" means the institution's Finance-owned **settlement currency**; currency formatting/display is a separate concept (D-3) | Locks the settlement-vs-formatting terminology so implementers do not read V-INV-07 as a display setting, and so the existence of a column is never mistaken for ownership. **Termology only:** does not decide the storage mechanism for settlement currency, does not build a Finance currency store, and does **not** delete, rename, migrate, or reassign `Institution.currency` — the storage and disposition questions themselves were left open by ADR-036 and have since been decided by Phase 6 D-3; see §6.5.3. The terminology lock above is unchanged |
| ADR-037 | For the billing surface, `BURSAR` receives `finance:fee_schedule` {read, create, update, manage}, `finance:bill` {read, create, convert, cancel}, and `finance:invoice` {read, create, manage, cancel, update, adjust}, and **no** `finance:payment` permission (Phase 6 D-7) | §10.3 defines the endpoint → permission mapping but this specification contains **no Finance role matrix** - it names no Finance role and assigns no permission to any role - so the role assignment had to be decided explicitly rather than read off the spec. Recorded here so implementers do not infer Finance grants from another domain's role matrix, and so the billing grant is separated from settlement. **Scope-limited:** grants permissions only; introduces no role, permission, endpoint, or authorization behaviour. **Amended by Phase 6 D-7 Q7 (2026-09-29):** `BURSAR` additionally receives `finance:fee_category` {read, create, update} and `finance:fee_item` {read, create, update} — a narrow enumerated exception bringing the total to 20 grants, which does not relax the payment exclusion or grant general Finance admin authority. Refund/write-off authority (BR-09, BR-011), self-approval, and financial-period authority were decided by D-7 Q3-Q5; the remaining 17 admin-only Finance resources stay admin-only per D-7 Q2. See §2 *Finance Role Permissions* |

---

## 4. Engineering Status

| Phase | Status | Summary |
|-------|--------|---------|
| Phase 1 — Domain Analysis | Complete | 30 entities, 50+ domain events, 30 business rules |
| Phase 2 — Domain Design | Complete | 11 aggregates, 30 invariants, 20 policies, 12 validation rule sets |
| Phase 3 — Database Design | **Specified / Not Implemented** | Architecture and schema design is specified (§7), but the claimed implementation is not present. The repository contains **5** Finance tables, **11** index declarations, and **4** unique constraints, against **this phase's own status claim** of 32 tables, 45+ indexes, and 25 unique constraints. **Note:** §7.1 separately catalogues **30** tables; the 32-vs-30 gap is an unresolved *internal* specification discrepancy (§4.1 item 2) and 32 is **not** the canonical §7.1 table count. The 5 tables present are a thin scaffold, not a realisation of the 30 designed tables; the entire double-entry group (`ledger_accounts`, `journal_entries`, `journal_entry_lines`, `account_balances`, `financial_periods`) is absent |
| Phase 4 — Prisma Schema | **Specified / Not Implemented** | Finance domain model/validation implementation is not present. The repository contains **5** Finance models in `apps/api/prisma/domains/finance.prisma` and **0** Finance-domain enums (3 related enums — `InvoiceStatus`, `PaymentStatus`, `PaymentMethod` — are declared in the root `schema.prisma`), against **this phase's own status claim** of 32 models and 17 enums. **No two-pass validation gate exists:** no validation script is defined in any `package.json` and no result artefact is recorded, so the §8 statement "2-pass check — all validation checks PASS" is unsupported. Applying the only published two-pass definition found in the engineering specifications to the current schema, its criteria do not pass — `deletedBy`, `version`, `createdBy`, `updatedBy`, `Json`, and `onDelete` are absent; 25 of the 30 catalogued models and 14 of the 17 claimed enums are missing; and soft delete is present on `Invoice`/`Payment`/`Refund` where §8.2 forbids it. The 5 models present are a thin scaffold, not a realisation of the 32 claimed models |
| Phase 5 — Backend Implementation | **Specified / Not Implemented** | Architecture and design specified (16 modules defined in 9.1). **No backend code exists in the repository:** 0 modules, 0 repositories, 0 domain services, 0 controllers, 0 event consumers. The previously claimed "14 modules, 14 repositories, 14 domain services, 14 controllers, 8 event consumers" is **not present**. Implementation is a future work item |
| Phase 6 — API Design | **Specified / Not Implemented** | API design specifies 100+ endpoints, but repository evidence shows **0** implemented Finance endpoints; **98** endpoints are designed/specification-only. §10.3 enumerates those **98** across 18 resource groups, so the design itself falls short of the 100+ figure in **this phase's own status claim** (recorded in `docs/PHASE_3_4_6_7_STATUS_CONFORMANCE_AUDIT.md` §5; the §4.1 list does not yet cover this gap). The `65 primary + 35 sub-resource` decomposition is not labelled anywhere in §10.3 and is **Unable to Verify**. None of the 14 controllers named in §9 exists — the repository has 29 controller classes, none Finance — and there is no `/api/v1/finance` route, Finance module, repository, domain service, or event consumer |
| Phase 7 — Testing & Verification | **Specified / Not Implemented** | Validation/test scenarios are specified (~240; the audit counted **239** across the 18 categories in §11.2, consistent with this phase's status claim — the only phase whose detail section matches its §4 summary), but no corresponding Finance implementation or test suite is present: **0** of the 239 scenarios are implemented. The repository contains 47 spec files (28 unit, 19 e2e) and **no Finance test file**; no test references `FeeStructure`, `InvoiceStatus`, `PaymentStatus`, or `PaymentMethod`, or any Finance Prisma delegate. The §11.2 performance targets have no benchmark harness and no code to measure, and the §11.4 Production Readiness Checklist is fully unchecked |

> **Phase status vocabulary.** **"Complete" denotes implemented repository functionality that
> has passed the applicable verification gates; specification/design completion alone does not
> constitute implementation completion.** A phase must not be marked "Complete" merely because
> its architecture has been designed, approved, or frozen.
>
> **"Specified / Not Implemented"** denotes a phase whose architecture and design are
> documented in this specification but for which no corresponding implementation exists in the
> repository.
>
> This definition governs the phase-status table in this section. It is stated here because no
> equivalent definition existed in the engineering specifications.
>
> Note that the document status **"Approved — Frozen for Implementation"** (header, line 6, and
> Overall Status below) denotes **specification maturity** — the document is stable and ready
> to be built. It does **not** assert that any implementation exists.
>
> **Audit trail for implementation-status statements in this document:** established by
> `docs/PHASE_6_FINANCE_PHASE5_IMPLEMENTATION_STATUS_AUDIT.md` (2026-09-26), a read-only
> repository audit. The Phase 5 status above was corrected from "Complete" on the basis of that
> audit.

### 4.1 Known Follow-Up Discrepancies (recorded, not resolved)

Identified by `docs/PHASE_6_FINANCE_PHASE5_IMPLEMENTATION_STATUS_AUDIT.md` and
`docs/PHASE_3_4_6_7_STATUS_CONFORMANCE_AUDIT.md`, and **deliberately left unresolved**. Each
requires a separate architecture or specification decision. Entries 3–5 record findings whose
**status-correction** limb has since been decided and applied to the §4 table; the underlying
discrepancies themselves remain unresolved, as does every other entry in this list. No entry here
has been reconciled by count, and none has been decided by implementation.

| # | Discrepancy | Status |
|---|-------------|--------|
| 1 | §4 summary claims 14 modules; §9.1 defines 16 | Unresolved — module count not chosen |
| 2 | §4 summary claims 32 tables; §7.1 catalogues 30 | Unresolved — table count not chosen |
| 3 | Phase 3 (32 tables, 45+ indexes, 25 unique constraints) and Phase 4 (32 models, 17 enums, 2-pass validation) status claims are unsupported by the repository, which contains 5 Finance models / 5 tables, 11 index declarations, 4 unique constraints, and 0 Finance-domain enums; no two-pass validation gate exists and the audited criteria do not pass against the current schema | **Status correction completed** — §4 Phase 3 and Phase 4 changed from "Complete" to "Specified / Not Implemented" per `docs/PHASE_3_4_6_7_STATUS_CONFORMANCE_AUDIT.md` §6. **Counts still unresolved** — no count chosen; the Phase 3 32-vs-30 gap (item 2) is internal to the specification |
| 4 | Phase 6 status claim of 100+ endpoints is unsupported: 0 Finance endpoints are implemented, while §10.3 designs 98 across 18 resource groups. The status claim's `65 primary + 35 sub-resource` decomposition is not labelled anywhere in §10.3 and could not be independently verified | **Status correction completed** — §4 Phase 6 changed from "Complete" to "Specified / Not Implemented" per `docs/PHASE_3_4_6_7_STATUS_CONFORMANCE_AUDIT.md` §6. **Endpoint counts still unresolved** — the 98-vs-100+ gap is an internal specification/status-claim inconsistency; neither figure is treated as authoritative and the 65/35 split remains unverified |
| 5 | Phase 7 status claim of 18 test categories and ~240+ scenarios is unsupported: 0 scenarios are implemented and no Finance test file exists | **Status correction completed** — §4 Phase 7 changed from "Complete" to "Specified / Not Implemented" per `docs/PHASE_3_4_6_7_STATUS_CONFORMANCE_AUDIT.md` §6. Underlying gap still unresolved — no test suite exists; §11.2's 239 counted scenarios is the only phase whose detail section matches its §4 summary |
| 6 | `fee_structures` (mapped from the `FeeStructure` model) has no basis in the §7.1 table catalogue | Unresolved — model neither removed nor reconciled |
| 7 | `FeeStructure.status` reuses the Identity `UserRoleStatus` enum; `InvoiceStatus`, `PaymentStatus`, and `PaymentMethod` are declared in root `schema.prisma` rather than `domains/finance.prisma` | Unresolved — models not redesigned |
| 8 | §7.2 requires `invoices.currency`; the `Invoice` model has no `currency` field | Unresolved — field not added (see also D-3, §8.3 of the D-3 investigation) |
| 9 | §8 records "2-pass check — all validation checks PASS", while the Phase 4 status claims it summarises are unsupported | Unresolved — validation statement not amended |
| 10 | A static bursar/finance frontend (12 pages) presents Finance UI with no backend integration | Unresolved — UI neither modified nor hidden |
| 11 | Finance event consumers are absent, and no Finance domain event is emitted anywhere in the codebase | Unresolved — a consequence of items 1–10 |
| 12 | The spec-conformant `Invoice`, `Payment`, and `Refund` tables **cannot be created** because the legacy tables occupy the frozen names; `DiscountApplication` is blocked for the same reason | **Disposition decided** by Phase 6 D-12 on 2026-09-29 — archive all five legacy tables and create the frozen tables fresh, no in-place `ALTER` (§7.5, LEG-01 … LEG-05). **Not yet implemented** — no migration exists; this is the critical path for the final Finance implementation batch. D-13 (the five `NOT VALID` constraints) remains downstream and undecided |

**Overall Status:** Approved — Frozen for Implementation.

---

## 5. Phase 1 — Domain Analysis

### 5.1 Domain Purpose

Finance is the monetary backbone of the platform. Every financial operation — fee definition, billing, payment collection, refund processing, discount and scholarship application, installment management, and accounting — is governed by this domain.

The domain operates on a strict boundary principle: Finance owns money. Other domains (Academic Management, People) request financial operations via domain events, but Finance performs all calculations, generates all invoices, and maintains all accounting records.

### 5.2 Domain Responsibilities

| Responsibility | Description |
|----------------|-------------|
| Fee Structure | Define fee categories, items, templates, and schedules |
| Billing | Generate bills from fee schedules; convert to invoices |
| Invoicing | Create, publish, and manage invoice lifecycle |
| Payment Processing | Accept and record online, offline, cash, bank transfer, and POS payments |
| Payment Allocation | Allocate payments to invoices; handle partial and overpayments |
| Payment Gateway | Abstract gateway integration for Paystack, Flutterwave, Stripe |
| Discounts | Define and apply percentage, fixed, and conditional discounts |
| Scholarships | Manage scholarship funds and award allocations |
| Refunds | Process full, partial refunds and credit notes with approval workflow |
| Financial Adjustments | Handle charge corrections, invoice adjustments, payment reversals, write-offs |
| Summer School Billing | Receive billing requests from Academic Management; generate invoices |
| Installment Plans | Decompose invoices into scheduled payments with due dates and late fees |
| Financial Policies | Define and version institution-specific financial policies |
| Accounting | Maintain ledger accounts, journal entries, balances, and financial periods |
| Reporting | Generate revenue, outstanding, payment, collection, and audit reports |

### 5.3 Domain Boundaries

**In Scope:** Fee structure, billing, invoicing, payments, payment gateway integration, discounts, scholarships, refunds, financial adjustments, Summer School billing, installment plans, financial policies, accounting foundation, financial reports

**Out of Scope:** Authentication, Authorization, Roles, Permissions, MFA, Sessions (Identity & Access), Student/Staff/Parent profiles (People), Subjects, Results, Attendance, Promotions, Summer School eligibility (Academic Management), Email, SMS, Notifications (Communication), Institution configuration, Licensing, Subscription management (Institution Management), File storage (Platform Services)

### 5.4 Dependencies

| Dependency | Nature | Direction |
|------------|--------|-----------|
| Identity & Access | User authentication, authorization context | Reads |
| Institution Management | Institution context, tenant isolation, module licensing | Reads |
| People | Student, Staff, Parent person records | Reads |
| Academic Management | Summer School billing requests, student enrollment context | Reads |
| Communication | Receipt delivery, notification delivery | Writes (references) |
| Platform Services | File storage for receipts, audit logging, event bus | Writes |

### 5.5 Core Entities

| Entity | Type | Description |
|--------|------|-------------|
| FeeCategory | Core | Organizational grouping for fees (e.g., Tuition, Development Levy) |
| FeeItem | Core | Individual charge item with amount and description |
| FeeTemplate | Core | Reusable fee configuration for generating bills |
| FeeSchedule | Core | Schedule of fees for an academic session |
| FeeScheduleItem | Supporting | Line item in a fee schedule linking to fee items |
| Bill | Core | Draft charge generated from a fee schedule for a student |
| Invoice | Core | Published financial document; primary source of truth |
| InvoiceLineItem | Supporting | Individual line on an invoice (tuition, levy, discount, scholarship, tax) |
| ChargeAdjustment | Supporting | Adjustment to an invoice charge |
| Payment | Core | Payment record (online, offline, cash, bank transfer, POS) |
| PaymentAllocation | Supporting | How a payment is allocated to one or more invoices |
| GatewayTransaction | Supporting | Transaction record with payment gateway provider |
| PaymentReconciliation | Supporting | Reconciliation between internal records and gateway statements |
| Discount | Core | Discount definition (percentage, fixed, conditional) |
| DiscountApplication | Supporting | Discount applied to a specific student or invoice |
| Scholarship | Core | Scholarship fund definition (full, partial, sponsorship, grant) |
| ScholarshipAward | Supporting | Scholarship award to a specific student |
| Refund | Core | Refund record with approval workflow |
| FinancialAdjustment | Core | Manual adjustment (charge correction, payment reversal) |
| WriteOff | Core | Bad debt write-off record |
| InstallmentPlan | Core | Installment payment plan linked to an invoice |
| InstallmentSchedule | Supporting | Individual installment with due date |
| LateFee | Supporting | Late fee applied to an overdue installment |
| FinancialPolicy | Core | Configurable policy record (currency, tax, numbering, penalties) |
| LedgerAccount | Core | Chart of accounts entry |
| JournalEntry | Core | Double-entry journal record |
| JournalEntryLine | Supporting | Individual debit or credit line in a journal entry |
| AccountBalance | Core | Account balance snapshot |
| FinancialPeriod | Core | Accounting period aligned with academic session |
| PaymentGatewayConfig | Core | Gateway provider configuration per institution |

### 5.6 Lifecycle States

**FeeTemplate:** Draft → Active

**FeeSchedule:** Draft → Published

**Bill:** Generated → Sent → Converted (to Invoice) / Cancelled

**Invoice:** Draft → Generated → Published → (Partially Paid) → Paid / Overdue / Written Off / Cancelled

**Payment:** Pending → Confirmed → (Refunded) / Failed

**GatewayTransaction:** Initiated → Processing → Completed / Failed

**Refund:** Requested → Approved / Rejected → Processed

> **Canonical refund vocabulary and state ownership (Phase 6 D-6, decided 2026-09-29).**
> `REQUESTED`, `APPROVED`, `REJECTED`, `PROCESSED` is the **single canonical** Finance refund
> vocabulary and is unchanged from the frozen values already stated in this specification
> (§5.6, V-REF-05, §7.2 `refund_status`, §8). **No second canonical refund vocabulary is
> introduced.**
>
> Finance is the **sole authoritative owner** of payment and refund state. The People and Academics
> payment/refund fields become **read-only projections** written only by Finance event consumers,
> and **client-controlled writes to those authoritative states must be removed**.
>
> **Legacy `DENIED` → `REJECTED`.** The People withdrawal field carries a live `DENIED` state that
> appears in no specification. It is **mapped to `REJECTED`** and becomes a projection/mapping
> concern only. Two competing canonical refund workflows are not retained.
>
> **Cross-module remediation is authorised.** A remediation pass against the completed Phase 4
> (People) and Phase 5 (Academics) code is explicitly authorised, because those phases must not be
> treated as immutable in a way that preserves a known Finance payment/refund security bypass.
> Authorisation only - the remediation itself is part of the final implementation batch.
>
> **Note on the legacy scaffold.** The legacy `Refund` model reuses the shared `PaymentStatus`
> enum, which cannot express this workflow, and no `RefundStatus` enum exists. A dedicated
> `RefundStatus` enum carrying the four canonical values is required when D-12 creates the frozen
> tables; it is not introduced here.

**InstallmentPlan:** Active → Completed / Defaulted

**InstallmentSchedule:** Pending → Paid / Overdue → (Late Fees accrue) → Paid / Written Off

**Discount:** Draft → Active → Inactive

**Scholarship:** Active → Suspended → Closed

**ScholarshipAward:** Active → Completed / Revoked

**FinancialAdjustment:** Draft → Posted → (Reversed)

**WriteOff:** Draft → Approved → Posted

**LedgerAccount:** Active → Inactive

**JournalEntry:** Draft → Posted → (Reversed)

**FinancialPeriod:** Open → Closing → Closed

**FinancialPolicy:** Draft → Active → Superseded

**PaymentGatewayConfig:** Active → Inactive

### 5.7 Business Rules

| ID | Rule | Scope |
|----|------|-------|
| BR-01 | Every entity is tenant-scoped and institution-scoped | Global |
| BR-02 | Invoice is the primary financial document | Billing |
| BR-03 | Bills are draft charges converted to invoices when published | Billing |
| BR-04 | Invoice amount = sum of line items − discounts + tax + late fees | Billing |
| BR-05 | Payments reduce invoice outstanding balance | Payments |
| BR-06 | Partial payments are supported; invoice status tracks PARTIALLY_PAID | Payments |
| BR-07 | Overpayments create credit balance for future invoices | Payments |
| BR-08 | Published invoices are immutable; adjustments create credit/debit notes | Billing |
| BR-09 | Refunds require approval workflow with threshold-based escalation | Refunds |
| BR-010 | Credit notes reduce invoice amounts; debit notes increase them | Adjustments |
| BR-011 | Write-offs require admin authorization and create journal entries | Adjustments |
| BR-012 | Every confirmed payment creates a journal entry (double-entry) | Accounting |
| BR-013 | Journal entries must balance: total debits = total credits | Accounting |
| BR-014 | Financial periods align with academic sessions | Accounting |
| BR-015 | Currency is institution-scoped and fixed after first invoice | Global |
| BR-016 | Tax rules are configurable per institution | Billing |
| BR-017 | Invoice numbering is sequential and institution-scoped (gap-free) | Billing |
| BR-018 | Late payment penalties are calculated daily on overdue amounts | Payments |
| BR-019 | Installment plans must cover the full invoice amount | Installments |
| BR-020 | Each installment has a due date; missed payments trigger late fees | Installments |
| BR-021 | Discounts are applied at billing time; they reduce invoice amounts | Discounts |
| BR-022 | Multiple discounts may be stacked (configurable per institution) | Discounts |
| BR-023 | Scholarships reduce invoice amounts as funding sources | Scholarships |
| BR-024 | Scholarship awards cannot exceed the scholarship fund limit | Scholarships |
| BR-025 | Summer School billing triggered by Academic Management events only | Integration |
| BR-026 | Finance owns all invoice calculation; other domains send billing requests | Integration |
| BR-027 | Payment gateway transactions are audit records; payment state owned by Finance | Payments |
| BR-028 | Gateway configuration is institution-scoped | Payments |
| BR-029 | Fee schedules are session-scoped | Fee Structure |
| BR-030 | Fee items must belong to a fee category | Fee Structure |
| BR-031 | All Finance monetary arithmetic is quantised half-up at the canonical boundary, and the invoice/payment/allocation/journal chain reconciles sub-cent residue so total debits equal total credits (R-01 … R-06) | Global |
| BR-032 | A document is rejected when a line item, the line-item count, or the document total exceeds its configured `FinancialPolicy` limit; amounts are never clamped, saturated, or auto-split (L-01 … L-03). **Limit values pending — fail closed until owner-supplied** | Global |
| BR-033 | An initiator may not approve their own refund or write-off request (D-7 Q4) | Global |
| BR-034 | Phase 6 exposes invoice access to **staff only**. No non-student invoice view and no non-student payment initiation is in scope (D-5) | Global |

### 5.8 Domain Events

| Event | Trigger | Consumers |
|-------|---------|-----------|
| FeeCategoryCreated | Category created | AuditModule |
| FeeCategoryUpdated | Category updated | AuditModule |
| FeeItemCreated | Fee item created | AuditModule |
| FeeItemUpdated | Fee item updated | AuditModule |
| FeeTemplateCreated | Template created | AuditModule |
| FeeScheduleCreated | Schedule created | AuditModule |
| FeeSchedulePublished | Schedule published | AuditModule, BillingModule |
| BillGenerated | Bill generated for student | AuditModule, NotificationModule |
| BillCancelled | Bill cancelled | AuditModule |
| InvoiceGenerated | Invoice created from bill | AuditModule, NotificationModule |
| InvoicePublished | Invoice finalized and sent | AuditModule, NotificationModule |
| InvoiceCancelled | Invoice cancelled | AuditModule |
| InvoiceOverdue | Invoice past due date | AuditModule, NotificationModule |
| PaymentReceived | Payment recorded | AuditModule, AccountingModule |
| PaymentConfirmed | Payment verified and confirmed | AuditModule, AccountingModule, NotificationModule |
| PaymentFailed | Payment failed | AuditModule, NotificationModule |
| PaymentAllocated | Payment allocated to invoice(s) | AuditModule, AccountingModule |
| OverpaymentCreated | Excess payment received | AuditModule, NotificationModule |
| GatewayTransactionInitiated | Gateway request sent | AuditModule |
| GatewayTransactionCompleted | Gateway confirmed | AuditModule |
| GatewayTransactionFailed | Gateway rejected | AuditModule |
| DiscountCreated | Discount defined | AuditModule |
| DiscountApplied | Discount applied to student/invoice | AuditModule |
| DiscountRemoved | Discount removed from invoice | AuditModule |
| ScholarshipCreated | Scholarship fund created | AuditModule |
| ScholarshipAwarded | Scholarship awarded to student | AuditModule, NotificationModule |
| ScholarshipRevoked | Scholarship award revoked | AuditModule |
| RefundRequested | Refund submitted | AuditModule, NotificationModule |
| RefundApproved | Refund approved | AuditModule, AccountingModule |
| RefundRejected | Refund rejected | AuditModule, NotificationModule |
| RefundProcessed | Refund completed | AuditModule, AccountingModule, NotificationModule |
| AdjustmentCreated | Financial adjustment posted | AuditModule, AccountingModule |
| WriteOffApproved | Write-off authorized | AuditModule, AccountingModule |
| WriteOffPosted | Write-off posted to ledger | AuditModule, AccountingModule |
| SummerSchoolBillingRequested | Billing request from Academic Management | AuditModule, BillingModule |
| SummerSchoolInvoiceGenerated | Summer School invoice created | AuditModule, NotificationModule |
| InstallmentPlanCreated | Installment plan established | AuditModule, NotificationModule |
| InstallmentPaid | Installment payment received | AuditModule |
| InstallmentOverdue | Installment past due | AuditModule, NotificationModule |
| LateFeeApplied | Late fee charged | AuditModule |
| JournalEntryPosted | Journal entry posted | AuditModule |
| FinancialPeriodClosed | Period closed and balanced | AuditModule |
| FinancialPolicyCreated | Policy created | AuditModule |
| FinancialPolicyUpdated | Policy updated (new version) | AuditModule |

### 5.9 Assumptions

1. Multi-tenant is the default deployment model
2. Every entity is institution-scoped
3. Invoice is the primary financial document
4. Bills are draft precursors to invoices
5. Finance owns all financial calculations; other domains send requests only
6. Gateway transactions are audit records; payment state is Finance-owned
7. Double-entry accounting via journal entries
8. Financial periods align with academic sessions
9. Currency is institution-scoped and immutable after first invoice. "Institution-scoped" denotes Finance ownership of the institution's settlement currency, not institution-side storage (ADR-036, D-3)
10. Published invoices are immutable; corrections use credit/debit notes
11. Refunds require approval workflow
12. Scholarships reduce invoice amounts
13. Discounts are applied at billing time
14. Installment plans decompose invoices into scheduled payments
15. Late fees accrue daily on overdue installments
16. Summer School billing is triggered by Academic Management events
17. Financial reports are read-optimized projections
18. Discount stacking is configurable per institution
19. Payment allocation provides traceability for multi-invoice payments
20. Ledger accounts follow standard chart of accounts structure

---

## 6. Phase 2 — Domain Design

### 6.1 Aggregates

| Aggregate | Root Entity | Entities | Value Objects |
|-----------|------------|----------|---------------|
| FeeStructure | FeeCategory | FeeItem, FeeTemplate, FeeSchedule, FeeScheduleItem | FeeAmount, FeePeriod |
| Billing | Invoice | Bill, InvoiceLineItem, ChargeAdjustment | InvoiceAmount, LineItemType |
| Payment | Payment | PaymentAllocation, GatewayTransaction, PaymentReconciliation | PaymentMethod, PaymentStatus |
| Discount | Discount | DiscountApplication | DiscountType, DiscountCondition |
| Scholarship | Scholarship | ScholarshipAward | ScholarshipType, AwardAmount |
| Refund | Refund | — | RefundMethod, RefundReason |
| FinancialAdjustment | FinancialAdjustment | WriteOff | AdjustmentType, WriteOffReason |
| InstallmentPlan | InstallmentPlan | InstallmentSchedule, LateFee | InstallmentFrequency, DueDate |
| FinancialPolicy | FinancialPolicy | — | PolicyType, PolicyValue |
| Accounting | LedgerAccount | JournalEntry, JournalEntryLine, AccountBalance, FinancialPeriod | AccountType, Amount |
| PaymentGateway | PaymentGatewayConfig | — | GatewayProvider, GatewayCredentials |

### 6.2 Entity Relationships

| Relationship | Cardinality | Description |
|-------------|-------------|-------------|
| FeeCategory → FeeItem | 1:N | Category groups multiple fee items |
| FeeSchedule → FeeScheduleItem | 1:N | Schedule contains multiple line items |
| FeeScheduleItem → FeeItem | N:1 | Line item references a fee item |
| Bill → Invoice | 1:0..1 | Bill converts to one invoice |
| Invoice → InvoiceLineItem | 1:N | Invoice contains multiple line items |
| Invoice → ChargeAdjustment | 1:N | Invoice may have adjustments |
| Invoice → PaymentAllocation | 1:N | Invoice receives multiple payment allocations |
| Payment → PaymentAllocation | 1:N | Payment allocates to multiple invoices |
| Payment → GatewayTransaction | 1:0..1 | Online payment has one gateway transaction |
| Discount → DiscountApplication | 1:N | Discount applied to multiple students/invoices |
| Scholarship → ScholarshipAward | 1:N | Scholarship funds multiple awards |
| Refund → Invoice | N:1 | Refund references an invoice |
| Refund → Payment | 1:0..1 | Refund may reference original payment |
| InstallmentPlan → Invoice | 1:1 | Plan decomposes one invoice |
| InstallmentPlan → InstallmentSchedule | 1:N | Plan contains multiple installments |
| InstallmentSchedule → LateFee | 1:N | Installment may accrue late fees |
| JournalEntry → JournalEntryLine | 1:N | Entry contains multiple debit/credit lines |
| FinancialPeriod → JournalEntry | 1:N | Period contains multiple journal entries |
| LedgerAccount → JournalEntryLine | 1:N | Account referenced in multiple journal lines |
| LedgerAccount → AccountBalance | 1:1 | Account has one balance snapshot |
| PaymentGatewayConfig → Institution | 1:N | Institution may have multiple gateway configs |

### 6.3 Domain Services

| Service | Responsibility |
|---------|---------------|
| FeeStructureService | FeeCategory, FeeItem, FeeTemplate, FeeSchedule CRUD |
| BillingService | Bill generation, invoice creation, line item management |
| InvoiceService | Invoice lifecycle, approval, publication, cancellation |
| PaymentService | Payment recording, confirmation, failure handling |
| PaymentAllocationService | Allocate payments to invoices, handle partial/overpayments |
| GatewayService | Gateway abstraction, transaction initiation, callback handling |
| ReconciliationService | Match gateway records to internal payments |
| DiscountService | Discount CRUD, eligibility evaluation, application to invoices |
| ScholarshipService | Scholarship CRUD, award management, fund limit validation |
| RefundService | Refund request, approval workflow, processing, credit notes |
| AdjustmentService | Charge corrections, invoice adjustments, payment reversals, write-offs |
| InstallmentService | Installment plan CRUD, schedule management, late fee calculation |
| AccountingService | Journal entry posting, balance updates, period management |
| FinancialPolicyService | Policy CRUD, versioning, retrieval, default fallback |
| FinancialReportService | Report generation from read-optimized projections |
| SummerSchoolBillingService | Receive billing requests, generate invoices |

### 6.4 Aggregate Invariants

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| I-01 | Invoice amount equals sum of line items minus discounts plus tax plus late fees | Application calculation on generation |
| I-02 | Payment allocation amounts cannot exceed invoice outstanding balance | Application validation |
| I-03 | Total payment allocations for an invoice cannot exceed invoice total + credit tolerance | Application validation |
| I-04 | Journal entries must balance (total debits = total credits) | Application validation before posting |
| I-05 | Published invoices are immutable | Application guard (no update/delete) |
| I-06 | Confirmed payments are immutable | Application guard |
| I-07 | Posted journal entries are immutable | Application guard |
| I-08 | Refund amount cannot exceed original payment amount | Application validation |
| I-09 | Scholarship award total cannot exceed scholarship fund limit | Application validation |
| I-10 | Installment plan total equals invoice outstanding balance | Application validation on creation |
| I-11 | Fee items must belong to a fee category | FK constraint |
| I-12 | Invoice numbering is sequential and gap-free per institution | DB sequence or application counter |
| I-13 | Currency fixed after first invoice for institution | Application guard, in the Finance-owned currency policy write path, checked against Finance's authoritative invoice history (CUR-04, §6.5.3) |
| I-14 | Late fee rate and cap within institution policy limits | Application validation |
| I-15 | Discount stacking respects institution configuration | Application validation |
| I-16 | Credit note amount cannot exceed original invoice amount | Application validation |
| I-17 | Financial period must be OPEN to accept journal entries | Application guard |
| I-18 | Gateway transaction references valid payment | FK constraint + Application validation |
| I-19 | Installment due dates must be in ascending order | Application validation |
| I-20 | Write-off requires admin authorization | Authorization guard |
| I-21 | Refund threshold determines approval level | Application evaluation |
| I-22 | Bill must be in GENERATED status to convert to Invoice | Application state validation |
| I-23 | Fee schedule items reference active fee items | Application validation |
| I-24 | Overpayment credit applies to next invoice automatically | Application logic |
| I-25 | Tax calculation uses institution-configured tax rules | Policy retrieval on invoice generation |
| I-26 | Invoice line item types are constrained (TUITION, LEVY, DISCOUNT, SCHOLARSHIP, TAX, LATE_FEE, ADJUSTMENT) | Enum validation |
| I-27 | Scholarship awards reference valid student enrollment | Application validation |
| I-28 | Payment method matches gateway config provider | Application validation |
| I-29 | Journal entry lines reference active ledger accounts | Application validation |
| I-30 | Account balance updated atomically with journal entry posting | Transaction management |
| I-31 | Every monetary value is quantised half-up at the canonical boundary, and the `invoice → payment → allocation → journal` chain reconciles sub-cent residue so total debits equal total credits (R-01 … R-06, §6.5.1) | Canonical quantisation helper + application validation |
| I-32 | A document is **rejected** when a line item, the line-item count, or the document total exceeds its configured limit; amounts are never clamped, saturated, or auto-split (L-01 … L-03, §6.5.2) | Application validation against `FinancialPolicy`. **Values pending — must fail closed until owner-supplied** |
| I-33 | An initiator may not approve their own refund or write-off request; the authenticated actor is compared against the initiating identity | Authorization guard (`FinancialAuthorityGuard`) |

### 6.5 Configurable Policies

| ID | Policy | Default | Range |
|----|--------|---------|-------|
| P-01 | Currency | NGN | ISO 4217 |
| P-02 | Tax rate (%) | 0 | 0–30 |
| P-03 | Invoice prefix | INV | 1–10 chars |
| P-04 | Invoice number reset | ANNUAL | ANNUAL, NEVER |
| P-05 | Late payment penalty rate (% per day) | 1 | 0–5 |
| P-06 | Late payment max cap (%) | 20 | 0–50 |
| P-07 | Grace period (days) | 7 | 0–30 |
| P-08 | Refund approval threshold (amount) | 50000 | 1000–1000000 |
| P-09 | Refund method default | ORIGINAL_PAYMENT | ORIGINAL_PAYMENT, BANK_TRANSFER, CASH, CREDIT_NOTE |
| P-10 | Scholarship fund limit enforcement | true | true, false |
| P-11 | Discount stacking allowed | false | true, false |
| P-12 | Max discounts per invoice | 1 | 1–5 |
| P-13 | Installment max count | 12 | 2–24 |
| P-14 | Installment late fee rate (% per day) | 0.5 | 0–5 |
| P-15 | Installment late fee max cap (%) | 15 | 0–50 |
| P-16 | Auto-generate bill on enrollment | true | true, false |
| P-17 | Bill to invoice conversion | MANUAL | MANUAL, AUTOMATIC |
| P-18 | Credit balance auto-apply | true | true, false |
| P-19 | Soft delete retention (days) | 30 | 7–90 |
| P-20 | Search results max | 100 | 20–500 |

#### 6.5.1 Rounding and Quantisation (Phase 6 D-8, decided 2026-09-29)

> **Decided.** Finance monetary arithmetic is **half-up**. These rules are canonical for the
> domain and are recorded here because this specification previously stated no rounding,
> quantisation, or residue rule at all, while every monetary column is `decimal(14,2)` and I-04
> requires balanced journal entries.

| ID | Rule | Enforcement |
|----|------|-------------|
| R-01 | Finance monetary rounding is **half-up** | Canonical quantisation helper |
| R-02 | One **canonical quantisation helper** is applied at the defined persisted-document boundary. Individual Finance services must not implement their own rounding behaviour | Application - single shared helper |
| R-03 | The rounding **mode** and the **quantisation point** are represented consistently in `FinancialPolicy` / this specification, and must not diverge per service | Policy retrieval + specification |
| R-04 | Each **intermediate monetary step** is quantised according to the canonical rule. Unrounded intermediate values must not produce inconsistent totals | Canonical helper at each calculation boundary |
| R-05 | Discount and tax **calculation order is deterministic** and uses canonical half-up quantisation at the defined calculation boundary. No second rounding convention exists for individual services | Application - fixed order |
| R-06 | The `invoice → payment → allocation → journal` chain performs **explicit residue reconciliation** so that: allocation never exceeds outstanding balance; the final allocation can close the outstanding balance; journal debits equal journal credits; persisted amounts remain consistent with the canonical quantisation rule | Application - deterministic residue handling |

**Residue must not be silently discarded.** R-06 exists because rounding each payment allocation
independently leaves a sub-cent outstanding balance that then blocks the final allocation under
I-02 ("allocation amounts cannot exceed invoice outstanding balance").

**Rounding does not resolve aggregate overflow.** R-01 … R-06 govern *how* a value is quantised.
They supply **no maximum value** and do not determine what happens when a document total exceeds
the storage ceiling. That is a separate decision — see §6.5.2.

#### 6.5.2 Aggregate Monetary Limits (unnumbered owner decision, decided 2026-09-29)

> **Decided — mechanism, location, and overflow behaviour. Numeric defaults remain OPEN.**
> This is a **separate decision** from D-8 and is deliberately not a rounding rule.

| ID | Limit | Storage | Overflow behaviour |
|----|-------|---------|--------------------|
| L-01 | Maximum amount per line item | `FinancialPolicy` row | **Reject** the document with a validation / business-rule error |
| L-02 | Maximum number of line items per document | `FinancialPolicy` row | **Reject** the document with a validation / business-rule error |
| L-03 | Maximum total amount per document | `FinancialPolicy` row | **Reject** the document with a validation / business-rule error |

**Explicitly not permitted** when a limit is exceeded: clamping the amount, silently saturating it,
automatically splitting the document, or widening the database column as a workaround. The
rejection must surface as a validation / business-rule error.

**Storage mechanism.** The limits are rows in the existing versioned `FinancialPolicy` mechanism,
which already carries `version` and the `DRAFT | ACTIVE | SUPERSEDED` lifecycle and is uniquely
keyed per `(tenantId, institutionId, policyType, policyKey, version)`. The same mechanism already
bounds max discounts per invoice (P-12) and installment count (P-13), so the gap is three missing
policy rows, not a missing mechanism.

> **OPEN — numeric defaults not supplied. Do not invent them.**
>
> No authoritative source in this specification or the repository states a value for L-01, L-02, or
> L-03. The policy table in §6.5 contains no such row, no validation rule in §6.6 states a maximum
> monetary amount, and no invariant in §6.4 bounds these values. The `decimal(14,2)` type in §7.2
> is a **storage** ceiling and is **not** adopted as the business limit.
>
> **Implementation requirement:** the three values are **owner-supplied configuration**. Until they
> are supplied, this path must **fail closed**. A default must not be derived from
> `Decimal(14,2)`, and must not be silently substituted. The policy rows are created with
> owner-supplied values.

**Separation from D-8.** §6.5.1 (R-01 … R-06) and §6.5.2 (L-01 … L-03) are independent. Rounding
rules do not supply a maximum value, and these limits do not define a rounding mode.

#### 6.5.3 Settlement Currency Storage (Phase 6 D-3, decided 2026-09-29)

> **Decided.** ADR-036 locked the *terminology* and deliberately left the storage question open.
> That storage question is now answered. The terminology lock is unchanged.

| ID | Rule |
|----|------|
| CUR-01 | The authoritative institution settlement currency is a **`FinancialPolicy` currency row per institution** |
| CUR-02 | `Institution.currency` is retained for **display / compatibility only** and is **not independently writable** as an authoritative Finance value |
| CUR-03 | There must be **no second authoritative writer**. Finance is the sole authoritative owner of settlement currency (also D-2) |
| CUR-04 | The "fixed after first invoice" check (BR-015 / ADR-020 / I-13) is performed by the **Finance-owned currency policy write path**, against Finance's **authoritative invoice history** — never against a client-provided field |
| CUR-05 | The policy remains subject to its existing lifecycle `DRAFT → ACTIVE → SUPERSEDED` |
| CUR-06 | The effective settlement currency becomes **immutable for an institution once its first invoice has been issued**. A later policy version must not silently change historical invoice currency |

CUR-04 closes the divergence hazard recorded against D-3: because the check reads Finance's own
invoice history, a client-supplied `Institution.currency` value cannot influence it.

`Institution.currency` is **not** deleted or renamed by this decision; it is demoted to a
display/compatibility field. V-INV-07 and I-13 name CUR-01 as the authoritative source.

### 6.6 Validation Rules

#### Fee Category (V-FC)

| Rule | Description |
|------|-------------|
| V-FC-01 | Name: required, 1–100 chars, unique within Institution |
| V-FC-02 | Description: optional, max 500 chars |

#### Fee Item (V-FI)

| Rule | Description |
|------|-------------|
| V-FI-01 | Name: required, 1–200 chars |
| V-FI-02 | Fee category ID: required, must exist |
| V-FI-03 | Amount: required, decimal ≥ 0 |
| V-FI-04 | Description: optional, max 500 chars |

#### Fee Schedule (V-FS)

| Rule | Description |
|------|-------------|
| V-FS-01 | Name: required, 1–100 chars |
| V-FS-02 | Academic session ID: required, must exist |
| V-FS-03 | Status: required, valid enum (DRAFT, PUBLISHED) |

#### Invoice (V-INV)

| Rule | Description |
|------|-------------|
| V-INV-01 | Student person ID: required, must reference active Student in People domain |
| V-INV-02 | Academic session ID: required, must exist |
| V-INV-03 | Term ID: optional, must exist if provided |
| V-INV-04 | Invoice number: auto-generated, sequential, institution-scoped |
| V-INV-05 | Due date: required, valid date |
| V-INV-06 | Status: required, valid enum |
| V-INV-07 | Currency: institution default if not specified — *institution default currency* is the institution's Finance-owned **settlement currency**, not a formatting/display setting (ADR-036, D-3). The authoritative value is the institution's **`FinancialPolicy` currency row** (CUR-01, §6.5.3); `Institution.currency` is display/compatibility only and is not an authoritative Finance value |

> **V-INV-07 terminology and storage (D-3, ADR-036, decided 2026-09-29).** "Institution default" in
> this rule means the institution's **Finance-owned settlement currency** — the currency its
> financial transactions are denominated and settled in. It does **not** refer to a display or
> formatting preference. An invoice may omit `currency`, but the value Finance falls back to
> is the institution's settlement currency, and that value is Finance-owned. **The storage question
> is now decided:** the authoritative source is a **`FinancialPolicy` currency row per institution**
> (CUR-01, §6.5.3), and `Institution.currency` is display/compatibility only and not independently
> writable (CUR-02). There is no second authoritative writer (CUR-03).

#### Invoice Line Item (V-ILI)

| Rule | Description |
|------|-------------|
| V-ILI-01 | Invoice ID: required, must exist |
| V-ILI-02 | Description: required, 1–200 chars |
| V-ILI-03 | Amount: required, decimal |
| V-ILI-04 | Line item type: required, valid enum (TUITION, LEVY, DISCOUNT, SCHOLARSHIP, TAX, LATE_FEE, ADJUSTMENT) |

#### Payment (V-PAY)

| Rule | Description |
|------|-------------|
| V-PAY-01 | Amount: required, decimal > 0 |
| V-PAY-02 | Payment method: required, valid enum |
| V-PAY-03 | Reference: required, unique |
| V-PAY-04 | Student person ID: required |
| V-PAY-05 | Status: required, valid enum (PENDING, CONFIRMED, FAILED, REFUNDED) |

#### Payment Allocation (V-PA)

| Rule | Description |
|------|-------------|
| V-PA-01 | Payment ID: required, must exist and be CONFIRMED |
| V-PA-02 | Invoice ID: required, must exist and be published |
| V-PA-03 | Amount: required, decimal > 0, ≤ invoice outstanding balance |

#### Discount (V-DC)

| Rule | Description |
|------|-------------|
| V-DC-01 | Name: required, 1–100 chars |
| V-DC-02 | Discount type: required, valid enum (PERCENTAGE, FIXED) |
| V-DC-03 | Value: required, decimal > 0; if PERCENTAGE, must be ≤ 100 |
| V-DC-04 | Condition: optional, valid enum (EARLY_PAYMENT, SIBLING, EMPLOYEE, CUSTOM, NONE) |
| V-DC-05 | Status: required, valid enum (DRAFT, ACTIVE, INACTIVE) |

#### Scholarship (V-SCH)

| Rule | Description |
|------|-------------|
| V-SCH-01 | Name: required, 1–200 chars |
| V-SCH-02 | Scholarship type: required, valid enum |
| V-SCH-03 | Fund limit: optional, decimal ≥ 0; null = unlimited |
| V-SCH-04 | Academic session ID: required |
| V-SCH-05 | Status: required, valid enum (ACTIVE, SUSPENDED, CLOSED) |

#### Refund (V-REF)

| Rule | Description |
|------|-------------|
| V-REF-01 | Invoice ID: required |
| V-REF-02 | Amount: required, decimal > 0 |
| V-REF-03 | Refund method: required, valid enum |
| V-REF-04 | Reason: required, 1–500 chars |
| V-REF-05 | Status: required, valid enum (REQUESTED, APPROVED, REJECTED, PROCESSED) |

#### Installment Plan (V-IP)

| Rule | Description |
|------|-------------|
| V-IP-01 | Invoice ID: required, must have outstanding balance |
| V-IP-02 | Frequency: required, valid enum (MONTHLY, TERM, CUSTOM) |
| V-IP-03 | Installment count: required, integer ≥ 2 |
| V-IP-04 | Total amount must equal invoice outstanding balance |

#### Ledger Account (V-LA)

| Rule | Description |
|------|-------------|
| V-LA-01 | Name: required, 1–100 chars, unique within Institution |
| V-LA-02 | Account type: required, valid enum (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE) |
| V-LA-03 | Code: required, unique within Institution |

#### Journal Entry (V-JE)

| Rule | Description |
|------|-------------|
| V-JE-01 | Description: required, 1–500 chars |
| V-JE-02 | Financial period ID: required, must be OPEN |
| V-JE-03 | Reference type: required (PAYMENT, REFUND, ADJUSTMENT, WRITE_OFF) |
| V-JE-04 | Reference ID: required, must exist |
| V-JE-05 | Must have at least 2 lines |
| V-JE-06 | Total debits must equal total credits |

#### Financial Policy (V-FP)

| Rule | Description |
|------|-------------|
| V-FP-01 | Policy type: required, 1–50 chars |
| V-FP-02 | Policy key: required, 1–100 chars |
| V-FP-03 | Value: required, valid JSON |
| V-FP-04 | Version: auto-incremented per policy_type + policy_key |

### 6.7 Read Models

| Model | Key Fields |
|-------|------------|
| FeeCategorySummary | id, name, description, itemCount, status |
| FeeItemSummary | id, name, categoryName, amount, status |
| FeeScheduleSummary | id, name, academicSessionName, itemCount, status |
| InvoiceSummary | id, invoiceNumber, studentName, totalAmount, paidAmount, outstandingBalance, dueDate, status |
| InvoiceDetail | id, invoiceNumber, studentName, lineItems[], discounts[], scholarships[], tax, totalAmount, paidAmount, outstandingBalance, status |
| PaymentSummary | id, reference, studentName, amount, method, status, createdAt |
| PaymentDetail | id, reference, studentName, amount, method, allocations[], gatewayTransaction, status |
| DiscountSummary | id, name, type, value, condition, status |
| ScholarshipSummary | id, name, type, fundLimit, awardedAmount, status |
| ScholarshipAwardSummary | id, scholarshipName, studentName, amount, awardDate, status |
| RefundSummary | id, invoiceNumber, studentName, amount, method, status, requestedAt |
| InstallmentPlanSummary | id, invoiceNumber, studentName, frequency, totalAmount, installmentCount, status |
| JournalEntrySummary | id, description, referenceType, referenceId, totalDebit, totalCredit, periodName, status |
| AccountBalanceSummary | id, accountName, accountType, balance, lastUpdated |
| FinancialPeriodSummary | id, name, startDate, endDate, status, journalEntryCount |
| OutstandingBalanceSummary | id, studentName, totalBilled, totalPaid, totalOutstanding, overdueAmount |
| RevenueReport | period, totalRevenue, totalDiscounts, totalScholarships, totalNetRevenue, collectionRate |
| PaymentReport | period, totalPayments, onlineCount, offlineCount, cashCount, averagePaymentSize |

---

## 7. Phase 3 — Database Design

### 7.1 Table Catalogue

| Table | Description | Tenant Scoped | Soft Delete |
|-------|-------------|---------------|-------------|
| fee_categories | Fee organizational groupings | Yes | Yes |
| fee_items | Individual charge items | Yes | Yes |
| fee_templates | Reusable fee configurations | Yes | Yes |
| fee_schedules | Session-scoped fee schedules | Yes | Yes |
| fee_schedule_items | Line items in fee schedules | Yes | Yes |
| bills | Draft charges for students | Yes | Yes |
| invoices | Published financial documents | Yes | No |
| invoice_line_items | Individual lines on invoices | Yes | No |
| charge_adjustments | Adjustments to invoices | Yes | No |
| payments | Payment records | Yes | No |
| payment_allocations | Payment-to-invoice mapping | Yes | No |
| gateway_transactions | Gateway provider records | Yes | No |
| payment_reconciliations | Reconciliation records | Yes | No |
| discounts | Discount definitions | Yes | Yes |
| discount_applications | Discount applications to invoices | Yes | No |
| scholarships | Scholarship fund definitions | Yes | Yes |
| scholarship_awards | Scholarship awards to students | Yes | Yes |
| refunds | Refund records | Yes | No |
| financial_adjustments | Manual adjustments | Yes | No |
| write_offs | Bad debt write-offs | Yes | No |
| installment_plans | Installment payment plans | Yes | Yes |
| installment_schedules | Individual installments | Yes | Yes |
| late_fees | Late fee records | Yes | No |
| financial_policies | Configurable policies | Yes | Yes |
| ledger_accounts | Chart of accounts | Yes | Yes |
| journal_entries | Double-entry journal records | Yes | No |
| journal_entry_lines | Debit/credit lines | Yes | No |
| account_balances | Account balance snapshots | Yes | No |
| financial_periods | Accounting periods | Yes | Yes |
| payment_gateway_configs | Gateway provider configuration | Yes | Yes |

### 7.2 Column Catalogue

**Common columns** (all mutable tables): `id` (uuid PK), `tenant_id` (uuid FK), `institution_id` (uuid FK), `created_at` (timestamptz), `created_by` (uuid), `updated_at` (timestamptz), `updated_by` (uuid), `deleted_at` (timestamptz nullable), `deleted_by` (uuid nullable), `version` (int, default 1)

All monetary columns use `decimal(14,2)` (never Float).

#### fee_categories

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(100) | UNIQUE per institution |
| description | varchar(500) | nullable |

#### fee_items

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(200) | |
| fee_category_id | uuid FK → fee_categories | |
| amount | decimal(14,2) | default amount; may be overridden per schedule |
| description | varchar(500) | nullable |
| status | fee_item_status enum | ACTIVE, INACTIVE |

#### fee_templates

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(100) | UNIQUE per institution |
| description | varchar(500) | nullable |
| status | fee_template_status enum | DRAFT, ACTIVE |

Fee template items stored as JSON array referencing fee_item_ids and amounts.

#### fee_schedules

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(100) | |
| academic_session_id | uuid FK → (Academic Management sessions) | |
| fee_template_id | uuid FK → fee_templates | nullable |
| status | fee_schedule_status enum | DRAFT, PUBLISHED |

UNIQUE (tenant_id, institution_id, academic_session_id, name).

#### fee_schedule_items

| Column | Type | Notes |
|--------|------|-------|
| fee_schedule_id | uuid FK → fee_schedules | |
| fee_item_id | uuid FK → fee_items | |
| amount | decimal(14,2) | override amount for this schedule |
| mandatory | boolean | default true; false = optional fee |

UNIQUE (tenant_id, fee_schedule_id, fee_item_id).

#### bills

| Column | Type | Notes |
|--------|------|-------|
| student_person_id | uuid FK → (People domain Student) | |
| fee_schedule_id | uuid FK → fee_schedules | |
| academic_session_id | uuid FK → (Academic Management sessions) | |
| term_id | uuid FK → (Academic Management terms) | nullable |
| total_amount | decimal(14,2) | |
| status | bill_status enum | GENERATED, SENT, CONVERTED, CANCELLED |
| notes | varchar(500) | nullable |

#### invoices

| Column | Type | Notes |
|--------|------|-------|
| invoice_number | varchar(50) | UNIQUE per institution, sequential |
| student_person_id | uuid FK → (People domain Student) | |
| parent_person_id | uuid FK → (People domain Parent) | nullable |
| bill_id | uuid FK → bills | nullable |
| academic_session_id | uuid FK → (Academic Management sessions) | |
| term_id | uuid FK → (Academic Management terms) | nullable |
| subtotal | decimal(14,2) | sum of positive line items |
| total_discounts | decimal(14,2) | sum of discount line items |
| total_scholarships | decimal(14,2) | sum of scholarship line items |
| total_tax | decimal(14,2) | |
| total_late_fees | decimal(14,2) | |
| total_amount | decimal(14,2) | final amount due |
| paid_amount | decimal(14,2) | sum of confirmed payments |
| outstanding_balance | decimal(14,2) | total_amount - paid_amount |
| credit_balance | decimal(14,2) | overpayment credit available |
| currency | varchar(3) | ISO 4217 |
| due_date | date | |
| status | invoice_status enum | DRAFT, GENERATED, PUBLISHED, PARTIALLY_PAID, PAID, OVERDUE, WRITTEN_OFF, CANCELLED |
| metadata | json | nullable |

#### invoice_line_items

| Column | Type | Notes |
|--------|------|-------|
| invoice_id | uuid FK → invoices | |
| description | varchar(200) | |
| amount | decimal(14,2) | positive = charge, negative = discount/scholarship |
| line_item_type | line_item_type enum | TUITION, LEVY, DISCOUNT, SCHOLARSHIP, TAX, LATE_FEE, ADJUSTMENT |
| fee_item_id | uuid FK → fee_items | nullable |
| discount_id | uuid FK → discounts | nullable |
| scholarship_id | uuid FK → scholarships | nullable |
| metadata | json | nullable |

#### charge_adjustments

| Column | Type | Notes |
|--------|------|-------|
| invoice_id | uuid FK → invoices | |
| adjustment_type | adjustment_type enum | CREDIT_NOTE, DEBIT_NOTE |
| amount | decimal(14,2) | |
| reason | varchar(500) | |
| reference | varchar(100) | nullable |

#### payments

| Column | Type | Notes |
|--------|------|-------|
| reference | varchar(100) | UNIQUE per institution |
| student_person_id | uuid FK → (People domain Student) | |
| amount | decimal(14,2) | |
| currency | varchar(3) | ISO 4217 |
| payment_method | payment_method enum | ONLINE, OFFLINE, CASH, BANK_TRANSFER, POS |
| payment_date | timestamptz | |
| gateway_config_id | uuid FK → payment_gateway_configs | nullable |
| metadata | json | nullable, gateway response data |
| status | payment_status enum | PENDING, CONFIRMED, FAILED, REFUNDED |

#### payment_allocations

| Column | Type | Notes |
|--------|------|-------|
| payment_id | uuid FK → payments | |
| invoice_id | uuid FK → invoices | |
| amount | decimal(14,2) | |
| allocated_at | timestamptz | default now() |

UNIQUE (tenant_id, payment_id, invoice_id).

#### gateway_transactions

| Column | Type | Notes |
|--------|------|-------|
| payment_id | uuid FK → payments | |
| gateway_config_id | uuid FK → payment_gateway_configs | |
| gateway_reference | varchar(200) | provider transaction ID |
| gateway_response | json | full provider response |
| amount | decimal(14,2) | |
| currency | varchar(3) | |
| status | gateway_status enum | INITIATED, PROCESSING, COMPLETED, FAILED |
| initiated_at | timestamptz | |
| completed_at | timestamptz | nullable |

#### payment_reconciliations

| Column | Type | Notes |
|--------|------|-------|
| gateway_config_id | uuid FK → payment_gateway_configs | |
| reconciliation_date | date | |
| total_gateway_amount | decimal(14,2) | |
| total_internal_amount | decimal(14,2) | |
| discrepancy | decimal(14,2) | |
| status | reconciliation_status enum | PENDING, MATCHED, DISCREPANCY, RESOLVED |
| notes | varchar(500) | nullable |

#### discounts

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(100) | |
| discount_type | discount_type enum | PERCENTAGE, FIXED |
| value | decimal(14,2) | percentage (0-100) or fixed amount |
| condition | discount_condition enum | EARLY_PAYMENT, SIBLING, EMPLOYEE, CUSTOM, NONE |
| max_applications | integer | nullable, null = unlimited |
| valid_from | date | nullable |
| valid_to | date | nullable |
| applicable_session_ids | json | nullable, array of session IDs; null = all |
| status | discount_status enum | DRAFT, ACTIVE, INACTIVE |

#### discount_applications

| Column | Type | Notes |
|--------|------|-------|
| discount_id | uuid FK → discounts | |
| invoice_id | uuid FK → invoices | |
| student_person_id | uuid FK → (People domain Student) | |
| applied_amount | decimal(14,2) | calculated discount amount |
| applied_at | timestamptz | default now() |

#### scholarships

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(200) | |
| scholarship_type | scholarship_type enum | FULL, PARTIAL, SPONSORSHIP, GRANT, FEE_WAIVER, CUSTOM |
| fund_limit | decimal(14,2) | nullable, null = unlimited |
| awarded_amount | decimal(14,2) | sum of all awards, default 0 |
| academic_session_id | uuid FK → (Academic Management sessions) | |
| description | varchar(1000) | nullable |
| status | scholarship_status enum | ACTIVE, SUSPENDED, CLOSED |

#### scholarship_awards

| Column | Type | Notes |
|--------|------|-------|
| scholarship_id | uuid FK → scholarships | |
| student_person_id | uuid FK → (People domain Student) | |
| amount | decimal(14,2) | |
| award_date | date | |
| notes | varchar(500) | nullable |
| status | scholarship_award_status enum | ACTIVE, COMPLETED, REVOKED |

UNIQUE (tenant_id, scholarship_id, student_person_id).

#### refunds

| Column | Type | Notes |
|--------|------|-------|
| invoice_id | uuid FK → invoices | |
| payment_id | uuid FK → payments | nullable, original payment reference |
| student_person_id | uuid FK → (People domain Student) | |
| amount | decimal(14,2) | |
| refund_method | refund_method enum | ORIGINAL_PAYMENT, BANK_TRANSFER, CASH, CREDIT_NOTE |
| reason | varchar(500) | |
| approved_by | uuid | nullable |
| approved_at | timestamptz | nullable |
| processed_at | timestamptz | nullable |
| status | refund_status enum | REQUESTED, APPROVED, REJECTED, PROCESSED |

#### financial_adjustments

| Column | Type | Notes |
|--------|------|-------|
| invoice_id | uuid FK → invoices | |
| adjustment_type | adjustment_type enum | CHARGE_CORRECTION, INVOICE_ADJUSTMENT, PAYMENT_REVERSAL, MANUAL |
| amount | decimal(14,2) | |
| reason | varchar(500) | |
| posted_by | uuid | |
| posted_at | timestamptz | default now() |
| reversed | boolean | default false |
| reversed_by | uuid | nullable |
| reversed_at | timestamptz | nullable |

#### write_offs

| Column | Type | Notes |
|--------|------|-------|
| invoice_id | uuid FK → invoices | |
| amount | decimal(14,2) | |
| reason | varchar(500) | |
| approved_by | uuid | |
| approved_at | timestamptz | |
| posted_at | timestamptz | nullable |

#### installment_plans

| Column | Type | Notes |
|--------|------|-------|
| invoice_id | uuid FK → invoices | UNIQUE |
| frequency | installment_frequency enum | MONTHLY, TERM, CUSTOM |
| installment_count | integer | |
| total_amount | decimal(14,2) | must equal invoice outstanding balance |
| status | installment_plan_status enum | ACTIVE, COMPLETED, DEFAULTED |

#### installment_schedules

| Column | Type | Notes |
|--------|------|-------|
| installment_plan_id | uuid FK → installment_plans | |
| installment_number | integer | |
| amount | decimal(14,2) | |
| due_date | date | |
| paid_date | date | nullable |
| paid_amount | decimal(14,2) | nullable |
| status | installment_status enum | PENDING, PAID, OVERDUE, WRITTEN_OFF |

UNIQUE (tenant_id, installment_plan_id, installment_number).

#### late_fees

| Column | Type | Notes |
|--------|------|-------|
| installment_schedule_id | uuid FK → installment_schedules | |
| amount | decimal(14,2) | |
| rate_applied | decimal(5,2) | daily rate percentage |
| days_overdue | integer | |
| applied_date | date | |
| invoiced | boolean | default false |

#### financial_policies

| Column | Type | Notes |
|--------|------|-------|
| policy_type | varchar(50) | CURRENCY, TAX, NUMBERING, PENALTY, REFUND, SCHOLARSHIP, DISCOUNT, INSTALLMENT |
| policy_key | varchar(100) | |
| value | json | |
| description | varchar(500) | nullable |
| version | integer | default 1 |
| effective_from | date | |
| effective_to | date | nullable |
| status | policy_status enum | DRAFT, ACTIVE, SUPERSEDED |

UNIQUE (tenant_id, institution_id, policy_type, policy_key, version).

#### ledger_accounts

| Column | Type | Notes |
|--------|------|-------|
| code | varchar(20) | UNIQUE per institution |
| name | varchar(100) | UNIQUE per institution |
| account_type | account_type enum | ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE |
| description | varchar(500) | nullable |
| is_active | boolean | default true |

#### journal_entries

| Column | Type | Notes |
|--------|------|-------|
| entry_number | varchar(50) | UNIQUE per institution, sequential |
| description | varchar(500) | |
| reference_type | varchar(50) | PAYMENT, REFUND, ADJUSTMENT, WRITE_OFF, MANUAL |
| reference_id | uuid | |
| financial_period_id | uuid FK → financial_periods | |
| total_debit | decimal(14,2) | |
| total_credit | decimal(14,2) | must equal total_debit |
| posted_at | timestamptz | |
| reversed | boolean | default false |
| reversed_by | uuid FK → journal_entries | nullable |

#### journal_entry_lines

| Column | Type | Notes |
|--------|------|-------|
| journal_entry_id | uuid FK → journal_entries | |
| ledger_account_id | uuid FK → ledger_accounts | |
| debit | decimal(14,2) | ≥ 0 |
| credit | decimal(14,2) | ≥ 0 |
| description | varchar(500) | nullable |

CHECK: exactly one of debit or credit must be non-zero per line.
UNIQUE (tenant_id, journal_entry_id, ledger_account_id, line_number).

#### account_balances

| Column | Type | Notes |
|--------|------|-------|
| ledger_account_id | uuid FK → ledger_accounts | |
| financial_period_id | uuid FK → financial_periods | |
| opening_balance | decimal(14,2) | default 0 |
| total_debit | decimal(14,2) | default 0 |
| total_credit | decimal(14,2) | default 0 |
| closing_balance | decimal(14,2) | computed |

UNIQUE (tenant_id, ledger_account_id, financial_period_id).

#### financial_periods

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(50) | UNIQUE per institution |
| academic_session_id | uuid FK → (Academic Management sessions) | |
| start_date | date | |
| end_date | date | |
| status | financial_period_status enum | OPEN, CLOSING, CLOSED |

#### payment_gateway_configs

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(100) | display name |
| provider | gateway_provider enum | PAYSTACK, FLUTTERWAVE, STRIPE |
| public_key | varchar(500) | encrypted |
| secret_key | varchar(500) | encrypted |
| webhook_secret | varchar(500) | encrypted, nullable |
| is_active | boolean | default true |
| config | json | provider-specific configuration |

### 7.3 Constraints

| Table | Type | Columns |
|-------|------|---------|
| fee_categories | UNIQUE | (tenant_id, institution_id, name) |
| fee_schedules | UNIQUE | (tenant_id, institution_id, academic_session_id, name) |
| fee_schedule_items | UNIQUE | (tenant_id, fee_schedule_id, fee_item_id) |
| invoices | UNIQUE | (tenant_id, institution_id, invoice_number) |
| payments | UNIQUE | (tenant_id, institution_id, reference) |
| payment_allocations | UNIQUE | (tenant_id, payment_id, invoice_id) |
| scholarship_awards | UNIQUE | (tenant_id, scholarship_id, student_person_id) |
| installment_plans | UNIQUE | (invoice_id) |
| installment_schedules | UNIQUE | (tenant_id, installment_plan_id, installment_number) |
| financial_policies | UNIQUE | (tenant_id, institution_id, policy_type, policy_key, version) |
| ledger_accounts | UNIQUE | (tenant_id, institution_id, code) |
| ledger_accounts | UNIQUE | (tenant_id, institution_id, name) |
| journal_entries | UNIQUE | (tenant_id, institution_id, entry_number) |
| account_balances | UNIQUE | (tenant_id, ledger_account_id, financial_period_id) |
| financial_periods | UNIQUE | (tenant_id, institution_id, name) |
| payment_gateway_configs | UNIQUE | (tenant_id, institution_id, name) |

### 7.4 Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| invoices | idx_inv_student | (student_person_id) | Student invoices |
| invoices | idx_inv_session | (academic_session_id) | Session invoices |
| invoices | idx_inv_status | (tenant_id, institution_id, status) | Status filtering |
| invoices | idx_inv_due_date | (due_date) | Overdue processing |
| invoices | idx_inv_number | (tenant_id, institution_id, invoice_number) | Number lookup |
| payments | idx_pay_student | (student_person_id) | Student payments |
| payments | idx_pay_status | (tenant_id, status) | Status filtering |
| payments | idx_pay_date | (payment_date) | Date range queries |
| payment_allocations | idx_pa_invoice | (invoice_id) | Invoice allocations |
| payment_allocations | idx_pa_payment | (payment_id) | Payment allocations |
| gateway_transactions | idx_gt_payment | (payment_id) | Payment gateway record |
| gateway_transactions | idx_gt_reference | (gateway_reference) | Gateway reference lookup |
| discount_applications | idx_da_invoice | (invoice_id) | Invoice discounts |
| discount_applications | idx_da_student | (student_person_id) | Student discounts |
| scholarship_awards | idx_sa_student | (student_person_id) | Student awards |
| scholarship_awards | idx_sa_scholarship | (scholarship_id) | Scholarship awards |
| refunds | idx_ref_invoice | (invoice_id) | Invoice refunds |
| refunds | idx_ref_status | (tenant_id, status) | Status filtering |
| installment_schedules | idx_is_plan | (installment_schedule_id) → (installment_plan_id) | Plan installments |
| installment_schedules | idx_is_due_date | (due_date) | Overdue processing |
| journal_entries | idx_je_period | (financial_period_id) | Period entries |
| journal_entries | idx_je_reference | (reference_type, reference_id) | Reference lookup |
| journal_entry_lines | idx_jel_account | (ledger_account_id) | Account lines |
| journal_entry_lines | idx_jel_entry | (journal_entry_id) | Entry lines |
| account_balances | idx_ab_period | (financial_period_id) | Period balances |
| ledger_accounts | idx_la_type | (tenant_id, institution_id, account_type) | Type filtering |

### 7.5 Legacy Finance Table Disposition (Phase 6 D-12, decided 2026-09-29)

> **Decided: archive all five legacy tables and create the frozen Finance tables fresh.**
> **No migration is performed and no schema change is made by this decision record.**

Five legacy tables currently occupy the frozen names `FeeStructure`, `Invoice`, `Payment`,
`Scholarship`, and `Refund`, which prevents the spec-conformant `Invoice`, `Payment`, and `Refund`
tables from being created. `DiscountApplication` is blocked for the same reason.

| ID | Rule |
|----|------|
| LEG-01 | All five legacy tables - `FeeStructure`, `Invoice`, `Payment`, `Scholarship`, `Refund` - are **archived**, and the frozen Finance tables are **created fresh**. **In-place `ALTER` is not used** |
| LEG-02 | The **six seeded invoices** and **three seeded fee structures** are **retained in the archive**. Historical and seeded records are not discarded |
| LEG-03 | Because the legacy tables are archived and replaced rather than altered in place, the `Decimal(10,2)` → `decimal(14,2)` widening is **not required** on those archived tables. The new Finance tables use the frozen/current precision requirements in §7.2 |
| LEG-04 | Historical Finance-owned columns and data are **archived intact**. They are not silently discarded unless an explicit data-classification rule already authorises deletion. The new active Finance tables contain **only** the current frozen schema |
| LEG-05 | The five `NOT VALID` legacy foreign-key constraints, four of which are on Finance tables, **must not be carried into the replacement Finance schema**. Obsolete legacy constraints are removed or archived as appropriate, and **valid** constraints are created for the new active Finance schema |

**D-13 remains downstream of D-12.** The disposition decision for those constraints itself is a
separate decision and is **not** made here; only the requirement that they not survive into the
replacement schema is recorded.

**Blocking relationship.** D-12 is the **critical path** for the final Finance implementation
batch: it gates the spec-conformant `Invoice`, `Payment`, and `Refund` tables, and therefore all
settlement work. D-8's canonical arithmetic must be settled before the replacement columns are
created, so the new tables get the right arithmetic. D-12 does **not** depend on D-3.

---

## 8. Phase 4 — Prisma Schema

**File:** `prisma/schema.prisma` within the finance service.

### Enums

| Enum | Values |
|------|--------|
| BillStatus | GENERATED, SENT, CONVERTED, CANCELLED |
| InvoiceStatus | DRAFT, GENERATED, PUBLISHED, PARTIALLY_PAID, PAID, OVERDUE, WRITTEN_OFF, CANCELLED |
| LineItemType | TUITION, LEVY, DISCOUNT, SCHOLARSHIP, TAX, LATE_FEE, ADJUSTMENT |
| PaymentStatus | PENDING, CONFIRMED, FAILED, REFUNDED |
| PaymentMethod | ONLINE, OFFLINE, CASH, BANK_TRANSFER, POS |
| GatewayStatus | INITIATED, PROCESSING, COMPLETED, FAILED |
| GatewayProvider | PAYSTACK, FLUTTERWAVE, STRIPE |
| DiscountType | PERCENTAGE, FIXED |
| DiscountCondition | EARLY_PAYMENT, SIBLING, EMPLOYEE, CUSTOM, NONE |
| ScholarshipType | FULL, PARTIAL, SPONSORSHIP, GRANT, FEE_WAIVER, CUSTOM |
| RefundStatus | REQUESTED, APPROVED, REJECTED, PROCESSED |
| RefundMethod | ORIGINAL_PAYMENT, BANK_TRANSFER, CASH, CREDIT_NOTE |
| AdjustmentType | CHARGE_CORRECTION, INVOICE_ADJUSTMENT, PAYMENT_REVERSAL, MANUAL |
| InstallmentFrequency | MONTHLY, TERM, CUSTOM |
| AccountType | ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE |
| FinancialPeriodStatus | OPEN, CLOSING, CLOSED |
| PolicyStatus | DRAFT, ACTIVE, SUPERSEDED |

### Models

32 models: FeeCategory, FeeItem, FeeTemplate, FeeSchedule, FeeScheduleItem, Bill, Invoice, InvoiceLineItem, ChargeAdjustment, Payment, PaymentAllocation, GatewayTransaction, PaymentReconciliation, Discount, DiscountApplication, Scholarship, ScholarshipAward, Refund, FinancialAdjustment, WriteOff, InstallmentPlan, InstallmentSchedule, LateFee, FinancialPolicy, LedgerAccount, JournalEntry, JournalEntryLine, AccountBalance, FinancialPeriod, PaymentGatewayConfig, and supporting lookup tables.

**Schema Principles:**
- UUID `@default(uuid())` for all primary keys
- `@unique` constraints for business keys
- `@map` for snake_case column names
- Soft delete via `deleted_at` (DateTime?) and `deleted_by` (uuid?)
- Business status via `status` enum (never a deletion marker)
- Optimistic locking via `version` (Int @default(1))
- Audit fields: created_at, created_by, updated_at, updated_by
- `Decimal` type for all monetary amounts (never Float)
- JSON columns for flexible data (metadata, gateway responses, policy values)
- Prisma enums mapped to database types
- Cascade deletes: child entities cascade from parent aggregate root
- Published financial records (invoices, payments, journal entries): no soft delete (immutable records)
- Cross-domain references (Student, Parent, Staff) use uuid FK without DB constraint to domain tables

**Validation:** 2-pass check — all validation checks PASS.

---

## 9. Phase 5 — Backend Implementation

### 9.1 Module Structure

| Module | Responsibility |
|--------|---------------|
| FinanceModule | Root module, orchestrates sub-modules |
| FeeStructureModule | FeeCategory, FeeItem, FeeTemplate, FeeSchedule CRUD |
| BillingModule | Bill generation, invoice creation, line items |
| InvoiceModule | Invoice lifecycle, approval, publication, cancellation |
| PaymentModule | Payment recording, confirmation, failure handling |
| PaymentAllocationModule | Payment-to-invoice allocation |
| GatewayModule | Gateway abstraction, transaction management |
| ReconciliationModule | Gateway-to-internal matching |
| DiscountModule | Discount CRUD, eligibility, application |
| ScholarshipModule | Scholarship CRUD, award management |
| RefundModule | Refund request, approval, processing |
| AdjustmentModule | Charge corrections, adjustments, write-offs |
| InstallmentModule | Installment plans, schedules, late fees |
| AccountingModule | Journal entries, ledger accounts, balances, periods |
| FinancialPolicyModule | Policy CRUD, versioning, retrieval |
| SummerSchoolBillingModule | Receive billing requests, generate invoices |

### 9.2 Repository Layer

| Repository | Entities | Key Operations |
|-----------|----------|----------------|
| FeeStructureRepository | FeeCategory, FeeItem, FeeTemplate, FeeSchedule, FeeScheduleItem | CRUD, findByCategory, findBySchedule, findActiveItems |
| BillingRepository | Bill, Invoice, InvoiceLineItem, ChargeAdjustment | CRUD, generateBill, convertToInvoice, findByStudent, findBySession |
| PaymentRepository | Payment, PaymentAllocation, GatewayTransaction, PaymentReconciliation | CRUD, findByStudent, findByInvoice, confirm, reconcile |
| DiscountRepository | Discount, DiscountApplication | CRUD, findActive, findByInvoice, evaluateEligibility |
| ScholarshipRepository | Scholarship, ScholarshipAward | CRUD, findByStudent, findBySession, checkFundLimit |
| RefundRepository | Refund | CRUD, findByInvoice, findByStatus, approve, process |
| AdjustmentRepository | FinancialAdjustment, WriteOff | CRUD, findByInvoice, post, reverse |
| InstallmentRepository | InstallmentPlan, InstallmentSchedule, LateFee | CRUD, findByInvoice, findOverdue, calculateLateFee |
| AccountingRepository | LedgerAccount, JournalEntry, JournalEntryLine, AccountBalance, FinancialPeriod | CRUD, postEntry, updateBalance, findActivePeriod |
| FinancialPolicyRepository | FinancialPolicy | CRUD, findActive, findByType, supersede |
| PaymentGatewayRepository | PaymentGatewayConfig | CRUD, findActive, findByProvider |

All repositories receive `tenantId` and `institutionId` as first parameters.

### 9.3 Domain Services

| Service | Responsibility |
|---------|---------------|
| FeeStructureService | CRUD operations, schedule publication |
| BillingService | Bill generation from schedules, invoice creation with line items |
| InvoiceService | Lifecycle management, number generation, status transitions |
| PaymentService | Payment recording, confirmation, failure handling, credit balance |
| PaymentAllocationService | Allocate payments to invoices, handle partial/overpayments, credit application |
| GatewayService | Provider abstraction, initiate transaction, handle callback |
| ReconciliationService | Match gateway records, identify discrepancies |
| DiscountService | CRUD, eligibility evaluation, stacking rules, application to invoices |
| ScholarshipService | CRUD, award management, fund limit enforcement |
| RefundService | Request submission, approval workflow, processing, credit note generation |
| AdjustmentService | Charge corrections, invoice adjustments, payment reversals, write-offs |
| InstallmentService | Plan creation, schedule generation, late fee calculation |
| AccountingService | Journal entry posting, balance updates, period management, double-entry validation |
| FinancialPolicyService | Policy CRUD, versioning, default fallback |
| FinancialReportService | Revenue, outstanding, payment, collection, scholarship, discount, refund, audit reports |
| SummerSchoolBillingService | Receive billing requests from Academic Management, generate invoices |

### 9.4 Controllers

| Controller | Route Prefix | Endpoints |
|-----------|-------------|-----------|
| FeeStructureController | /api/v1/finance/fees | FeeCategory CRUD + FeeItem CRUD + FeeTemplate + FeeSchedule |
| BillingController | /api/v1/finance/bills | Bill CRUD + Generate + Convert |
| InvoiceController | /api/v1/finance/invoices | CRUD + Publish + Cancel + Line items + Adjustments |
| PaymentController | /api/v1/finance/payments | CRUD + Confirm + Allocate |
| GatewayController | /api/v1/finance/gateways | Config CRUD + Callback + Transaction status |
| ReconciliationController | /api/v1/finance/reconciliation | List + Run + Resolve |
| DiscountController | /api/v1/finance/discounts | CRUD + Apply + Remove |
| ScholarshipController | /api/v1/finance/scholarships | CRUD + Award + Revoke |
| RefundController | /api/v1/finance/refunds | Request + Approve + Reject + Process |
| AdjustmentController | /api/v1/finance/adjustments | CRUD + WriteOff |
| InstallmentController | /api/v1/finance/installments | Plan CRUD + Schedule + LateFees |
| AccountingController | /api/v1/finance/accounting | LedgerAccount + JournalEntry + Period + Balance |
| FinancialPolicyController | /api/v1/finance/policies | CRUD + Version + History |
| FinancialReportController | /api/v1/finance/reports | Revenue + Outstanding + Payment + Collection + Scholarship + Audit |

### 9.5 Guards

| Guard | Purpose | Owner |
|-------|---------|-------|
| JwtAuthGuard | Validate JWT and extract user | Platform |
| TenantGuard | Validate tenant context from JWT | Platform |
| InstitutionGuard | Validate user has access to requested Institution | Platform |
| FinanceAccessGuard | Validate user has access to requested financial entity | **Finance** (D-7 Q8) |
| ModuleLicenseGuard | Check if Institution has Finance module enabled | **Institution Management — not Finance** (D-7 Q8) |
| FinancialAuthorityGuard | Validate user has authority for approval operations (refund approval, write-off) | **Finance** (D-7 Q8) |
| ImmutabilityGuard | Prevent modification of published invoices, confirmed payments, posted entries | **Finance** (D-7 Q8) |

**Authorization flow:** JwtAuthGuard → TenantGuard → InstitutionGuard → FinanceAccessGuard → ModuleLicenseGuard → controller execution.
For approval operations: FinancialAuthorityGuard is added.
For published records: ImmutabilityGuard prevents writes.

> **Ownership and enforcement constraints (D-7 Q8, decided 2026-09-29).** The owner has assigned
> guard ownership as tabulated. `FinanceAccessGuard` may be satisfied by existing service-level
> Finance access logic **where it correctly enforces relational Finance ownership**, but the
> implementation **must not create a fail-open path**. `ModuleLicenseGuard` is Institution
> Management's, consistent with licensing being out of Finance scope (§1). `FinancialAuthorityGuard`
> enforces the D-7 Q3 threshold (policy P-08) and the D-7 Q4 self-approval block (I-33).
> `ImmutabilityGuard` enforces I-05, I-06, and I-07.
>
> **Database constraints** are used for true data invariants where appropriate and are **not** a
> substitute for authorization guards.
>
> **Status: not implemented.** None of these four guards exists in the repository. They are
> specified, not built.

### 9.6 Event Publishing & Consumers

- Events published via EventEmitter2 (in-process) after transaction commit
- Event naming: see the naming decision below — the **runtime** convention governs, not a single normalised form
- Every event carries a versioned envelope: `eventId`, `causationId`, `schemaVersion`, `emittedAt`, `tenantId`
- **Idempotency:** `eventId` is the deduplication key; consumers check before processing
- The envelope is extended **additively**; existing payload fields are preserved untouched

> **Event contract decisions (Phase 6 D-4, decided 2026-09-29).**
>
> **Naming (Q1).** The **runtime** event naming is adopted as-is. Two conventions coexist in the
> codebase - PascalCase for People-originated events and dotted namespaced names for
> Academics-originated events - and Finance's own shipped events use the dotted form
> (e.g. `finance.fee-schedule.published`). Finance maintains an **explicit event-name mapping** for
> the cases where source modules use different conventions. The 12 Finance event strings are
> **not renamed** merely to normalise naming. The `{Entity}{PastTenseVerb}` form above remains
> accurate for the events that use it and is not withdrawn, but it is **not** the governing rule
> for the whole bus.
>
> **Envelope (Q2).** The existing `emittedAt` envelope is **kept**. `eventVersion` and
> `occurredAt` are **not** added in this batch, because doing so would amend the locked Phase 5
> envelope decision and invalidate the shared-`eventId` audit-dedup contract. The authoritative
> envelope field list is the one implemented in the Phase 5 event envelope: `eventId`,
> `causationId`, `schemaVersion`, `emittedAt`, `tenantId`. An earlier revision of this section
> listed `eventVersion` and `occurredAt`; that list did not match the implementation and is
> corrected here. `correlationId` and `actorId` are not part of the current envelope.
>
> **Conflicting consumer ownership (Q3).** Where two frozen specifications name different
> consumers for the same event, the **authoritative source module's** frozen event contract governs
> the event actually emitted. Finance maintains a mapping rather than introducing a second
> competing event name.
>
> **Billing triggers (Q4).** This specification named `StudentClassEnrolled` and
> `StudentClassTransferred` as billing triggers; no runtime event of either name exists. The
> **trigger mapping is amended to the existing Academics event names**. Academics is **not** made
> to emit duplicate Finance-specific aliases solely for Finance.
>
> **`PersonMerged` / `PersonSoftDeleted` (Q5).** Finance **must** handle these events where they
> affect financial identity or history. Financial history remains intact: accounting history is
> **not** rewritten merely because two Persons merge, and the canonical identity/merge mechanism
> maintains current identity linkage. **Implementation detail flagged, not decided here:** the
> repository does not establish the merge-record representation - no merge model exists in the
> People schema. That representation must not be invented as a side effect of the Finance work.
>
> **Applicant acceptance (Q6).** Applicant acceptance / `StudentEnrolled` is **not** a billing
> trigger. No billing behaviour is added on the basis of that event unless this specification
> explicitly establishes it as a trigger, which it does not.

| Consumer | Events Handled | Action |
|----------|---------------|--------|
| AuditLogConsumer | All state-change events | Create audit log entry |
| AccountingConsumer | PaymentConfirmed, RefundProcessed, WriteOffPosted, AdjustmentCreated | Create journal entries, update balances |
| NotificationConsumer | InvoicePublished, InvoiceOverdue, PaymentConfirmed, RefundProcessed, ScholarshipAwarded | Send notifications |
| AcademicManagementConsumer | StudentClassEnrolled, StudentClassTransferred, SummerSchoolRegistered | Trigger bill/invoice generation |
| PeopleConsumer | StudentWithdrawn, StudentGraduated | Trigger refund eligibility, final billing |
| ReconciliationConsumer | GatewayTransactionCompleted | Update payment status, trigger reconciliation |
| ProgressionConsumer | InvoicePaid | Confirm enrollment financial clearance |
| PolicyConsumer | FinancialPolicyUpdated | Invalidate cached policies |

### 9.7 Transaction Management

- All multi-entity operations wrapped in Prisma Interactive Transactions
- Optimistic concurrency: catch Prisma P2025 error for version conflicts; return 409 Conflict
- Event publishing deferred until transaction commit
- **Event idempotency tracking:** processed `eventId` values stored with TTL (minimum 72 hours)
- **Double-entry enforcement:** Journal entry posting validates balance before commit; rolled back if unbalanced

### 9.8 Key Flows

**Bill → Invoice → Payment Flow:**
1. Academic Management publishes StudentClassEnrolled event
2. BillingModule receives event, finds matching FeeSchedule for student's class + session
3. Bill generated with line items from FeeSchedule
4. Discounts and scholarships evaluated and applied
5. Tax calculated per institution policy
6. Bill converted to Invoice (InvoiceNumber generated)
7. Invoice published → InvoicePublished event
8. Student/parent notified of invoice
9. Payment received (online or offline)
10. Payment recorded (status = PENDING)
11. For online: GatewayService initiates transaction
12. Gateway callback: PaymentConfirmed event
13. PaymentAllocationService allocates payment to invoice
14. Invoice balance updated
15. If fully paid: Invoice status = PAID
16. If partially paid: Invoice status = PARTIALLY_PAID
17. AccountingModule creates journal entries

**Refund Flow:**
1. Admin requests refund for invoice
2. Refund amount validated against invoice paid_amount
3. Refund created (status = REQUESTED)
4. Approval workflow: threshold determines approval level
5. Approver reviews and approves/rejects
6. If approved: RefundApproved event
7. If amount > threshold: additional approval required
8. Refund processed: original payment reversed or credit note issued
9. Invoice balance updated
10. Journal entries created (reversal entries)
11. RefundProcessed event

**Installment Payment Flow:**
1. Admin creates InstallmentPlan for invoice
2. InstallmentSchedule generated based on frequency
3. Each installment has amount and due_date
4. Student pays installments individually
5. Each payment allocated to specific installment
6. If paid on time: Installment status = PAID
7. If overdue: LateFee calculated daily
8. LateFee added to invoice as line item
9. When all installments paid: Plan status = COMPLETED

**Journal Entry Double-Entry Flow:**
1. PaymentConfirmed event received
2. AccountingService retrieves configured ledger accounts
3. Two journal entry lines created:
   - Debit: Cash/Bank account (payment amount)
   - Credit: Student Fees Receivable (payment amount)
4. Entry validated: total_debit = total_credit
5. JournalEntry posted
6. AccountBalance updated for both accounts
7. JournalEntryPosted event

---

## 10. Phase 6 — API Design

### 10.1 Response Envelope

| Type | Shape |
|------|-------|
| Success | `{ "success": true, "data": { ... } }` |
| List | `{ "success": true, "data": { "items": [...], "total": 100, "page": 1, "limit": 20 } }` |
| Error | `{ "success": false, "error": { "code": "ERROR_CODE", "message": "...", "details": [] } }` |

### 10.2 Common Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page (max: 100) |
| search | string | — | Text search (name, reference, invoice number) |
| sortBy | string | created_at | Sort field |
| sortOrder | string | desc | asc or desc |
| status | string | — | Filter by status |
| institutionId | uuid | — | Filter by Institution |
| academicSessionId | uuid | — | Filter by Academic Session |
| studentId | uuid | — | Filter by Student |
| dateFrom | date | — | Start date filter |
| dateTo | date | — | End date filter |

### 10.3 Endpoint Catalogue

#### Fee Categories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/fees/categories | List categories | finance:fee_category:read |
| POST | /api/v1/finance/fees/categories | Create category | finance:fee_category:create |
| PUT | /api/v1/finance/fees/categories/:id | Update category | finance:fee_category:update |

#### Fee Items

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/fees/items | List fee items | finance:fee_item:read |
| POST | /api/v1/finance/fees/items | Create fee item | finance:fee_item:create |
| PUT | /api/v1/finance/fees/items/:id | Update fee item | finance:fee_item:update |

#### Fee Schedules

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/fees/schedules | List schedules | finance:fee_schedule:read |
| GET | /api/v1/finance/fees/schedules/:id | Get schedule | finance:fee_schedule:read |
| POST | /api/v1/finance/fees/schedules | Create schedule | finance:fee_schedule:create |
| PUT | /api/v1/finance/fees/schedules/:id | Update schedule | finance:fee_schedule:update |
| POST | /api/v1/finance/fees/schedules/:id/publish | Publish schedule | finance:fee_schedule:manage |
| POST | /api/v1/finance/fees/schedules/:id/items | Add item | finance:fee_schedule:update |
| DELETE | /api/v1/finance/fees/schedules/:id/items/:itemId | Remove item | finance:fee_schedule:update |

#### Bills

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/bills | List bills | finance:bill:read |
| GET | /api/v1/finance/bills/:id | Get bill | finance:bill:read |
| POST | /api/v1/finance/bills/generate | Generate bills from schedule | finance:bill:create |
| POST | /api/v1/finance/bills/:id/convert | Convert to invoice | finance:bill:convert |
| POST | /api/v1/finance/bills/:id/cancel | Cancel bill | finance:bill:cancel |

#### Invoices

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/invoices | List invoices | finance:invoice:read |
| GET | /api/v1/finance/invoices/:id | Get invoice detail | finance:invoice:read |
| GET | /api/v1/finance/invoices/student/:studentId | Student invoices | finance:invoice:read |
| POST | /api/v1/finance/invoices | Create invoice | finance:invoice:create |
| POST | /api/v1/finance/invoices/:id/publish | Publish invoice | finance:invoice:manage |
| POST | /api/v1/finance/invoices/:id/cancel | Cancel invoice | finance:invoice:cancel |
| GET | /api/v1/finance/invoices/:id/line-items | List line items | finance:invoice:read |
| POST | /api/v1/finance/invoices/:id/line-items | Add line item | finance:invoice:update |
| DELETE | /api/v1/finance/invoices/:id/line-items/:itemId | Remove line item | finance:invoice:update |
| GET | /api/v1/finance/invoices/:id/adjustments | List adjustments | finance:invoice:read |
| POST | /api/v1/finance/invoices/:id/adjustments | Create adjustment | finance:invoice:adjust |

#### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/payments | List payments | finance:payment:read |
| GET | /api/v1/finance/payments/:id | Get payment detail | finance:payment:read |
| POST | /api/v1/finance/payments | Record payment | finance:payment:create |
| POST | /api/v1/finance/payments/:id/confirm | Confirm payment | finance:payment:confirm |
| POST | /api/v1/finance/payments/:id/allocate | Allocate to invoice(s) | finance:payment:allocate |
| GET | /api/v1/finance/payments/:id/allocations | List allocations | finance:payment:read |

#### Payment Gateways

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/gateways | List gateway configs | finance:gateway:read |
| POST | /api/v1/finance/gateways | Create gateway config | finance:gateway:create |
| PUT | /api/v1/finance/gateways/:id | Update gateway config | finance:gateway:update |
| POST | /api/v1/finance/gateways/:id/initiate | Initiate transaction | finance:gateway:transact |
| POST | /api/v1/finance/gateways/callback | Gateway webhook callback | None (verified) |

#### Reconciliation

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/reconciliation | List reconciliation records | finance:reconciliation:read |
| POST | /api/v1/finance/reconciliation/run | Run reconciliation | finance:reconciliation:manage |
| POST | /api/v1/finance/reconciliation/:id/resolve | Resolve discrepancy | finance:reconciliation:manage |

#### Discounts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/discounts | List discounts | finance:discount:read |
| GET | /api/v1/finance/discounts/:id | Get discount | finance:discount:read |
| POST | /api/v1/finance/discounts | Create discount | finance:discount:create |
| PUT | /api/v1/finance/discounts/:id | Update discount | finance:discount:update |
| POST | /api/v1/finance/discounts/:id/apply | Apply to invoice | finance:discount:apply |
| DELETE | /api/v1/finance/discounts/:id/apply/:applicationId | Remove from invoice | finance:discount:apply |

#### Scholarships

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/scholarships | List scholarships | finance:scholarship:read |
| GET | /api/v1/finance/scholarships/:id | Get scholarship | finance:scholarship:read |
| POST | /api/v1/finance/scholarships | Create scholarship | finance:scholarship:create |
| PUT | /api/v1/finance/scholarships/:id | Update scholarship | finance:scholarship:update |
| GET | /api/v1/finance/scholarships/:id/awards | List awards | finance:scholarship:read |
| POST | /api/v1/finance/scholarships/:id/award | Award to student | finance:scholarship:award |
| DELETE | /api/v1/finance/scholarships/:id/awards/:awardId | Revoke award | finance:scholarship:revoke |

#### Refunds

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/refunds | List refunds | finance:refund:read |
| GET | /api/v1/finance/refunds/:id | Get refund | finance:refund:read |
| POST | /api/v1/finance/refunds | Request refund | finance:refund:request |
| POST | /api/v1/finance/refunds/:id/approve | Approve refund | finance:refund:approve |
| POST | /api/v1/finance/refunds/:id/reject | Reject refund | finance:refund:approve |
| POST | /api/v1/finance/refunds/:id/process | Process refund | finance:refund:process |

#### Adjustments & Write-Offs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/adjustments | List adjustments | finance:adjustment:read |
| POST | /api/v1/finance/adjustments | Create adjustment | finance:adjustment:create |
| POST | /api/v1/finance/adjustments/:id/reverse | Reverse adjustment | finance:adjustment:reverse |
| GET | /api/v1/finance/write-offs | List write-offs | finance:write_off:read |
| POST | /api/v1/finance/write-offs | Request write-off | finance:write_off:create |
| POST | /api/v1/finance/write-offs/:id/approve | Approve write-off | finance:write_off:approve |

#### Installment Plans

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/installments | List plans | finance:installment:read |
| GET | /api/v1/finance/installments/:id | Get plan detail | finance:installment:read |
| POST | /api/v1/finance/installments | Create plan | finance:installment:create |
| GET | /api/v1/finance/installments/:id/schedules | List schedule | finance:installment:read |
| GET | /api/v1/finance/installments/overdue | List overdue | finance:installment:read |
| POST | /api/v1/finance/installments/:id/schedules/:scheduleId/pay | Record installment payment | finance:installment:pay |

#### Accounting

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/accounting/ledger-accounts | List accounts | finance:ledger:read |
| POST | /api/v1/finance/accounting/ledger-accounts | Create account | finance:ledger:create |
| GET | /api/v1/finance/accounting/journal-entries | List entries | finance:journal:read |
| GET | /api/v1/finance/accounting/journal-entries/:id | Get entry | finance:journal:read |
| POST | /api/v1/finance/accounting/journal-entries | Post entry | finance:journal:create |
| GET | /api/v1/finance/accounting/balances | Account balances | finance:ledger:read |
| GET | /api/v1/finance/accounting/periods | List periods | finance:period:read |
| POST | /api/v1/finance/accounting/periods | Create period | finance:period:create |
| POST | /api/v1/finance/accounting/periods/:id/close | Close period | finance:period:manage |

#### Financial Policies

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/policies | List policies | finance:policy:read |
| GET | /api/v1/finance/policies/:id | Get policy | finance:policy:read |
| POST | /api/v1/finance/policies | Create policy | finance:policy:create |
| PUT | /api/v1/finance/policies/:id | Update policy (new version) | finance:policy:update |
| GET | /api/v1/finance/policies/history | Version history | finance:policy:read |

#### Financial Reports

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/finance/reports/revenue | Revenue report | finance:report:read |
| GET | /api/v1/finance/reports/outstanding | Outstanding fees | finance:report:read |
| GET | /api/v1/finance/reports/payments | Payment report | finance:report:read |
| GET | /api/v1/finance/reports/collections | Collection report | finance:report:read |
| GET | /api/v1/finance/reports/scholarships | Scholarship report | finance:report:read |
| GET | /api/v1/finance/reports/discounts | Discount report | finance:report:read |
| GET | /api/v1/finance/reports/refunds | Refund report | finance:report:read |
| GET | /api/v1/finance/reports/audit | Audit report | finance:report:read |

#### Summer School Billing

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/v1/finance/billing/summer-school | Receive billing request | finance:billing:summer_school |
| GET | /api/v1/finance/billing/summer-school | List Summer School invoices | finance:billing:summer_school |

---

## 11. Phase 7 — Testing & Verification

### 11.1 Test Strategy

| Category | Framework | Coverage Target |
|----------|-----------|-----------------|
| Unit Tests | Jest | 90%+ line coverage |
| Integration Tests | Jest + Testcontainers | All repository/service interactions |
| E2E Tests | Jest + Supertest | All API endpoints |
| Security Tests | Manual + Automated | OWASP Top 10 |

### 11.2 Test Categories Summary

| Category | Scenarios | Key Coverage |
|----------|-----------|--------------|
| Fee Structure (FEE) | 15 | FeeCategory, FeeItem, FeeTemplate, FeeSchedule CRUD; schedule publication |
| Billing (BIL) | 18 | Bill generation, invoice creation, line item management, bill-to-invoice conversion |
| Invoice (INV) | 20 | Lifecycle, number generation, immutability, status transitions, adjustments |
| Payment (PAY) | 20 | Recording, confirmation, failure, partial/overpayment, credit balance |
| Payment Allocation (PAL) | 15 | Allocation to invoices, partial allocation, overpayment handling |
| Gateway (GW) | 12 | Initiation, callback, failure, reconciliation |
| Discount (DISC) | 12 | CRUD, eligibility, stacking rules, application to invoices |
| Scholarship (SCH) | 12 | CRUD, award management, fund limit enforcement |
| Refund (REF) | 15 | Request, approval workflow, processing, credit notes |
| Adjustments (ADJ) | 10 | Charge corrections, payment reversals, write-offs |
| Installments (INST) | 12 | Plan creation, schedule management, late fees, overdue processing |
| Accounting (ACC) | 18 | Journal entry posting, double-entry balance, period management, balance updates |
| Financial Policies (POL) | 8 | CRUD, versioning, supersede, default fallback |
| Summer School Billing (SSB) | 8 | Billing request reception, invoice generation |
| Tenant Isolation (TENANT) | 12 | Cross-tenant access prevention, institution scoping |
| Authorization (AUTHZ) | 10 | Financial authority guard, immutability guard, module license guard |
| Edge Cases (EDGE) | 12 | Concurrent payments, race conditions, gateway timeout, duplicate prevention |
| Performance (PERF) | 10 | Invoice generation <2s, payment processing <1s, report generation <3s |
| **Total** | **~240+** | |

### 11.3 Tenant Isolation Verification

| Test | Description | Expected |
|------|-------------|----------|
| TI-001 | Institution A queries Institution B's invoices (same tenant) | 404 or empty |
| TI-002 | User accesses financial entity in unassigned Institution | 403 |
| TI-003 | Cross-tenant payment data | Isolated per tenant |
| TI-004 | Cross-tenant scholarship data | Isolated per tenant |
| TI-005 | Cross-tenant journal entries | Isolated per tenant |
| TI-006 | Cross-tenant invoice numbers | Separate sequences per institution |
| TI-007 | Cross-tenant gateway configs | Isolated per tenant |
| TI-008 | Cross-tenant financial reports | Isolated per tenant |

### 11.4 Production Readiness Checklist

- [ ] All unit tests passing (90%+ coverage)
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Security tests passing (OWASP Top 10)
- [ ] Performance benchmarks met
- [ ] Tenant isolation verified
- [ ] Database migrations tested
- [ ] Rollback procedures documented
- [ ] Monitoring/alerting configured
- [ ] Rate limiting implemented
- [ ] Error logging configured
- [ ] Audit trail verified
- [ ] Invoice immutability verified
- [ ] Payment confirmation flow verified
- [ ] Double-entry accounting balance verified
- [ ] Gateway callback handling verified
- [ ] Refund approval workflow verified
- [ ] Financial period closing verified

---

## 12. Payment Gateway Abstraction

Finance integrates with payment providers through an abstracted gateway adapter pattern. The domain remains provider-independent.

### 12.1 Gateway Adapter Interface

Every gateway provider implements the same interface:

| Method | Description |
|--------|-------------|
| initiateTransaction(invoice, amount, metadata) | Create a transaction with the provider |
| verifyTransaction(gatewayReference) | Check transaction status with the provider |
| processWebhook(payload, signature) | Validate and parse provider webhook |
| getTransactionStatus(gatewayReference) | Retrieve current status |

### 12.2 Supported Providers

| Provider | Status | Currency Support |
|----------|--------|-----------------|
| Paystack | Active | NGN, USD, GHS, ZAR |
| Flutterwave | Active | NGN, USD, GHS, KES, UGX |
| Stripe | Future | Multi-currency |

### 12.3 Gateway Callback Flow

1. Student initiates online payment → GatewayService.initiateTransaction()
2. Student redirected to provider payment page
3. Provider processes payment
4. Provider sends webhook to `/api/v1/finance/gateways/callback`
5. GatewayService validates signature via processWebhook()
6. GatewayTransaction updated with response
7. If successful: PaymentConfirmed event → PaymentAllocationService
8. If failed: PaymentFailed event → NotificationModule

### 12.4 Security

- Gateway keys (public, secret, webhook secret) are encrypted at rest
- Webhook signatures are verified before processing
- Gateway transactions store full provider response for audit
- Secret keys are never exposed in API responses

---

## 13. Double-Entry Accounting Foundation

Finance maintains a double-entry accounting system where every financial transaction produces balanced journal entries.

### 13.1 Chart of Accounts Structure

| Account Type | Examples | Normal Balance |
|-------------|----------|---------------|
| ASSET | Cash, Bank, Accounts Receivable, Student Fee Receivable | Debit |
| LIABILITY | Unearned Revenue, Refund Payable, Scholarship Liability | Credit |
| EQUITY | Retained Earnings, Surplus | Credit |
| REVENUE | Tuition Revenue, Development Levy Revenue, Late Fee Revenue | Credit |
| EXPENSE | Scholarship Expense, Refund Expense, Write-Off Expense | Debit |

### 13.2 Journal Entry Rules

- Every journal entry has at least 2 lines (one debit, one credit)
- Total debits must equal total credits for every entry
- Each line references one ledger account and carries either a debit or credit amount
- Journal entries reference their source: PAYMENT, REFUND, ADJUSTMENT, WRITE_OFF, or MANUAL
- Posted journal entries are immutable; reversals create new entries with `reversed_by` reference

### 13.3 Common Entry Templates

| Transaction | Debit | Credit |
|-------------|-------|--------|
| Payment received | Cash/Bank | Student Fee Receivable |
| Invoice generated | Student Fee Receivable | Tuition Revenue / Levy Revenue |
| Refund processed | Refund Expense | Cash/Bank |
| Scholarship awarded | Scholarship Expense | Scholarship Liability |
| Scholarship applied | Scholarship Liability | Student Fee Receivable |
| Late fee charged | Student Fee Receivable | Late Fee Revenue |
| Write-off | Write-Off Expense | Student Fee Receivable |
| Credit note issued | Tuition Revenue | Student Fee Receivable |

### 13.4 Financial Period Management

- Financial periods align with academic sessions
- Only OPEN periods accept journal entries
- Closing a period: validate all entries are balanced, compute final balances
- Closed periods are read-only
- Period closing creates an opening balance entry for the next period

---

## 14. Outstanding Items

| Priority | Item | Status |
|----------|------|--------|
| High | Payment receipt PDF generation | Implementation |
| High | Invoice PDF generation | Implementation |
| High | Bulk bill generation optimization | Implementation |
| High | Gateway failover and retry logic | Future |
| Medium | Multi-currency support | Future |
| Medium | Payment reminder automation | Future |
| Medium | Overdue invoice escalation | Future |
| Medium | Advanced financial reporting dashboard | Future |
| Medium | Export financial reports (CSV/PDF) | Future |
| Low | Parent payment portal | Future |
| Low | Automated reconciliation matching | Future |
| Low | Installment reminder notifications | Future |
| Low | Financial year comparison reports | Future |
| Planned | Rate limiting middleware | Implementation |
| Planned | Security headers middleware | Implementation |

**Aggregate monetary limit values (L-01 … L-03) — owner input required.** The limit *mechanism*,
*storage*, and *breach behaviour* are decided (§6.5.2, BR-32), but the three numeric values — max
line-item amount, max line-item count per document, max document total — have **not** been supplied
and are **not** derivable from any authoritative source. They must be supplied by the owner as
`FinancialPolicy` values. Until then the enforcement path must **fail closed**; no default may be
inferred from `Decimal(14,2)`. This is the only item on this list that blocks part of the final
Finance implementation batch, and it blocks a **configuration value**, not an architectural decision.

**Not outstanding.** The following were open before 2026-09-29 and are now decided: the D-7
authority questions, D-8 rounding, the aggregate-limit mechanism, D-2 configuration ownership,
D-3 currency storage, the D-4 event contract, D-6 payment/refund ownership, and D-12 legacy table
disposition. See revision 1.8.0. **D-1 (expenses) remains undecided and deferred**, and D-13
remains downstream of D-12.

---

## 15. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-17 | Initial creation — All 7 phases complete |
| 1.1.0 | 2026-07-17 | Architecture Review — No changes required; all counts and cross-domain references verified consistent |
| 1.2.0 | 2026-07-20 | Final Refinement — DiscountCondition validation fix (NONE added), InstallmentSchedule lifecycle correction, FeeTemplate/FeeSchedule lifecycle additions, Phase 4 enum count correction (16→17), Phase 7 test count correction (~450+ → ~240+), enum naming example standardization |
| 1.3.0 | 2026-09-26 | D-3 Terminology Decision (documentation only) — Added ADR-036 and a new "Currency Terminology" section under §2 Engineering Principles, locking "institution default currency" as the institution's Finance-owned **settlement currency** and separating it from currency formatting/display. Clarified the Institution Scoping principle, Assumption 9, and validation rule V-INV-07. **No storage, schema, migration, API, or code change.** The disposition of `Institution.currency` remained an open D-3 implementation decision **at the time of this revision; it was decided by Phase 6 D-3 on 2026-09-29 — see revision 1.8.0 and §6.5.3** |
| 1.4.0 | 2026-09-26 | **Phase 5 implementation-status correction (documentation only)** — Per `docs/PHASE_6_FINANCE_PHASE5_IMPLEMENTATION_STATUS_AUDIT.md`, corrected §4 Phase 5 from "Complete" to **"Specified / Not Implemented"**: 0 modules, repositories, domain services, controllers, and event consumers exist in the repository. Added the phase-status vocabulary definition ("Complete" = implemented and verified) and a new §4.1 recording 11 unresolved follow-up discrepancies without reconciling them. **No code, Prisma schema, migration, API, UI, or test change.** Finance build scope, module count, table count, and implementation sequence remain undecided |
| 1.5.0 | 2026-09-26 | **Phases 3, 4, 6, and 7 status conformance correction (documentation only)** — Per `docs/PHASE_3_4_6_7_STATUS_CONFORMANCE_AUDIT.md`, corrected the §4 status rows for Phase 3 (Database Design), Phase 4 (Prisma Schema), Phase 6 (API Design), and Phase 7 (Testing & Verification) from unsupported `Complete` to **"Specified / Not Implemented"**, using the vocabulary established by the 1.4.0 Phase 5 correction. Each row's description now states audited repository evidence: 5 tables / 11 indexes / 4 unique constraints (P3); 5 models / 0 Finance-domain enums / no two-pass validation gate (P4); 0 implemented endpoints of 98 designed (P6); 0 of 239 designed scenarios implemented (P7). Recorded that 32 is the Phase 3 *status claim* while §7.1 catalogues 30, and that this 32-vs-30 gap is internal to the specification. **No code, Prisma schema, migration, API, UI, or test change.** The detailed phase bodies in §7, §8, §10, and §11 are unchanged; all remaining discrepancies stay unresolved, and no implementation phase is assigned or recommended |
| 1.6.0 | 2026-09-26 | **§4.1 audit-trail cleanup (documentation only)** — Refreshed §4.1 after the 1.5.0 status correction so the record no longer states that Phase 3/4/6/7 status correction is "pending a separate decision". Entries 3–5 now record the correction as **completed** and cite `docs/PHASE_3_4_6_7_STATUS_CONFORMANCE_AUDIT.md` §6, while **preserving the original findings and evidence verbatim in substance** and keeping the underlying discrepancies open. Entry 4 additionally records the newly audited Phase 6 endpoint inconsistency: status claim 100+ vs 98 designed in §10.3 vs 0 implemented, with the `65 primary + 35 sub-resource` split unverifiable — recorded as an **internal specification/status-claim inconsistency, not resolved**; neither 98 nor 100+ is treated as authoritative. The §4.1 preamble now cites both audit documents. **No status-table change, no phase-body change, no code, Prisma schema, migration, API, UI, or test change.** Entries 1–2 and 6–11 and all other discrepancies are untouched and remain unresolved |
| 1.7.0 | 2026-09-28 | **Phase 6 D-7 Finance RBAC grant recorded (documentation only)** - Added ADR-037 and a new "Finance Role Permissions" section under §2 Engineering Principles, granting `BURSAR` the billing surface: `finance:fee_schedule` {read, create, update, manage}, `finance:bill` {read, create, convert, cancel}, `finance:invoice` {read, create, manage, cancel, update, adjust}, and **no** `finance:payment` permission. Recorded as an explicit decision because §10.3 defines endpoint → permission mappings while this specification provides no Finance role matrix. **No code, Prisma schema, migration, API, UI, seed, or test change.** `finance:fee_category` / `finance:fee_item`, refund and write-off authority, financial-period approval authority, and all other D-7 approval-authority questions **remained undecided at the time of this revision; they were decided by Phase 6 D-7 on 2026-09-29 — see revision 1.8.0 and §2 *Finance Role Permissions*** |
| 1.8.0 | 2026-09-29 | **Phase 6 Finance owner decisions recorded (documentation only)** — Recorded the owner's Phase 6 Finance D-register answers in `docs/FINANCE_OWNER_DECISIONS_RECORD.md` and reconciled this specification against them. **D-7 (all 8 questions):** added an ADR-037 clarification granting `BURSAR` `finance:fee_category` {read, create, update} and `finance:fee_item` {read, create, update} — a narrow enumerated exception taking the total from 14 to 20 grants, which does **not** relax the payment exclusion (D-7 Q6) or grant general Finance admin authority (D-7 Q2, the other 17 resources stay admin-only); recorded that request/approval authority is separated by permissions with the threshold as `FinancialPolicy` **P-08** (default `50000`, range `1000`–`1000000`); recorded that self-approval is **blocked**, compared as `approved_by` against the record's initiator `createdBy`; period-close authority not extended; no new approval role and no delegation model. **D-7 Q8:** added an **Owner** column to §9.5 — `FinanceAccessGuard`, `FinancialAuthorityGuard`, and `ImmutabilityGuard` are Finance-owned; `ModuleLicenseGuard` is Institution Management-owned — with the no-fail-open constraint recorded; guards remain unimplemented. **D-8:** added **§6.5.1** (R-01 … R-06) *Rounding and Quantisation* — half-up, one canonical helper at the persisted-document boundary, each intermediate step quantised, deterministic discount/tax order, and explicit residue reconciliation across invoice → payment → allocation → journal. **Aggregate document-total limits:** added **§6.5.2** (L-01 … L-03) as a **separate** decision from D-8 — three `FinancialPolicy` limits (max line amount, max line count, max document total) with **reject** on breach and no clamping, saturation, auto-split, or column widening; **numeric defaults remain OPEN and none has been invented or derived from `Decimal(14,2)`**; the path must fail closed until owner-supplied values exist. **D-2:** recorded that Finance is the sole authoritative owner of settlement currency, tax rules, invoice numbering, penalty rules, gateway enablement, and gateway credentials; that gateway credentials must **never** be stored in the institution configuration JSON namespace; and that `financial.*` in `institution_configurations` is retained as a **read-only projection**, confirming the §1 *Out of Scope* line excludes the Institution capability surface rather than transferring value ownership. **D-3:** added **§6.5.3** (CUR-01 … CUR-06) *Settlement Currency Storage* — a `FinancialPolicy` currency row per institution is authoritative, `Institution.currency` is display/compatibility only and is **not independently writable**, there is no second authoritative writer, the "fixed after first invoice" check runs in the Finance-owned currency policy write path against Finance's authoritative invoice history, the policy keeps its `DRAFT → ACTIVE → SUPERSEDED` lifecycle, and historical invoice currency cannot be silently changed. **ADR-036's terminology lock is unchanged and is not reopened**; only the storage question it left open is now answered, and the "remains an open D-3 implementation decision" wording in ADR-036 and in 1.3.0 is corrected. **D-4:** added an event-contract decision block to §9.6 — runtime event naming adopted as-is with an explicit Finance event-name mapping and the 12 Finance event strings **not** renamed; the existing `emittedAt` envelope kept and `eventVersion`/`occurredAt` **not** added, leaving the locked Phase 5 shared-`eventId`/audit-dedup contract intact (this section's envelope field list is corrected to match the implemented Phase 5 envelope `eventId`, `causationId`, `schemaVersion`, `emittedAt`, `tenantId` — the prior list did not match the implementation); the source module's frozen contract governs conflicting consumer ownership; billing triggers amended to the existing Academics event names with no Academics aliases; `PersonMerged`/`PersonSoftDeleted` handling required with financial history preserved, the merge-record representation **not invented** and flagged; applicant acceptance **not** a billing trigger. **D-6:** recorded Finance as sole authoritative owner of payment and refund state with People/Academics fields demoted to read-only projections and client writes removed; cross-module remediation against Phase 4 People and Phase 5 Academics **explicitly authorised**; `REQUESTED`/`APPROVED`/`REJECTED`/`PROCESSED` confirmed as the single canonical refund vocabulary with legacy `DENIED` **mapped to `REJECTED`**; noted that the legacy `Refund` model's reuse of `PaymentStatus` cannot express the workflow and a dedicated `RefundStatus` enum is required when D-12 creates the frozen tables. **D-12:** added **§7.5** (LEG-01 … LEG-05) *Legacy Finance Table Disposition* — archive all five legacy tables (`FeeStructure`, `Invoice`, `Payment`, `Scholarship`, `Refund`) and create the frozen tables fresh with no in-place `ALTER`; retain the six seeded invoices and three seeded fee structures in the archive; `Decimal(10,2)` → `decimal(14,2)` widening not required on archived tables; archive historical Finance-owned columns and data intact unless an explicit data-classification rule authorises deletion; the five `NOT VALID` legacy FK constraints must not be carried into the replacement schema, with D-13 remaining downstream and undecided. **D-5:** recorded **staff-only** invoice access (BR-034), keeping D-5 off the critical path. Added invariants **I-31 … I-33** and business rules **BR-31 … BR-34** for the new decisions. **D-1 (expenses) remains undecided and deferred.** **No code, Prisma schema, migration, controller, service, DTO, guard, seed, People implementation, Academics implementation, API, UI, or test change.** The §4.1 discrepancy list is unchanged; entries 1, 2, 6, 7, 9, 10, and 11 remain unresolved, and the previously recorded D-7 authority questions are now decided by this revision rather than left open. Register-B is untouched |


---

*This document is the permanent engineering specification for the Finance domain. It is approved and frozen for implementation. All architectural decisions, business rules, validation constraints, and verification criteria are captured here. Refer to source code for implementation details.*
