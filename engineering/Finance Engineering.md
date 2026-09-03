# Finance Engineering Specification

**Domain:** Finance
**Scope:** Fee Structure, Billing, Payments, Payment Gateway Integration, Discounts, Scholarships & Financial Aid, Refunds, Financial Adjustments, Summer School Billing, Installment Plans, Financial Policies, Accounting Foundation, Financial Reports
**Created:** 2026-07-17
**Status:** Approved — Frozen for Implementation
**Last Updated:** 2026-07-20

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

---

## 2. Engineering Principles

### Core Philosophy

- **Finance Owns Money:** All financial calculations, invoice generation, payment processing, and accounting records belong exclusively to the Finance domain; other domains send billing requests but never calculate invoices
- **Invoice as Source of Truth:** The Invoice is the authoritative financial document; all payment allocation, refund, scholarship, and discount operations reference invoices
- **Gateway Independence:** Payment gateway integration is abstracted; the domain remains provider-independent with a pluggable gateway adapter pattern
- **Double-Entry Accounting:** Every financial transaction produces balanced journal entries (debits = credits); accounting integrity is non-negotiable
- **Immutable Financial Records:** Published invoices, confirmed payments, and posted journal entries are never modified; corrections create new versioned records
- **Multi-Tenant Isolation by Default:** Every query scoped to tenant context; cross-tenant access = security violation
- **Institution Scoping:** Every entity is scoped to one Institution; currency, tax rules, and numbering are institution-specific
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

---

## 4. Engineering Status

| Phase | Status | Summary |
|-------|--------|---------|
| Phase 1 — Domain Analysis | Complete | 30 entities, 50+ domain events, 30 business rules |
| Phase 2 — Domain Design | Complete | 11 aggregates, 30 invariants, 20 policies, 12 validation rule sets |
| Phase 3 — Database Design | Complete | 32 tables, 45+ indexes, 25 unique constraints |
| Phase 4 — Prisma Schema | Complete | 32 models, 17 enums, 2-pass validation |
| Phase 5 — Backend Implementation | Complete | 14 modules, 14 repositories, 14 domain services, 14 controllers, 8 event consumers |
| Phase 6 — API Design | Complete | 100+ endpoints (65 primary + 35 sub-resource) |
| Phase 7 — Testing & Verification | Complete | 18 test categories, ~240+ test scenarios |

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
9. Currency is institution-scoped and immutable after first invoice
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
| I-13 | Currency fixed after first invoice for institution | Application guard |
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
| V-INV-07 | Currency: institution default if not specified |

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

| Guard | Purpose |
|-------|---------|
| JwtAuthGuard | Validate JWT and extract user |
| TenantGuard | Validate tenant context from JWT |
| InstitutionGuard | Validate user has access to requested Institution |
| FinanceAccessGuard | Validate user has access to requested financial entity |
| ModuleLicenseGuard | Check if Institution has Finance module enabled |
| FinancialAuthorityGuard | Validate user has authority for approval operations (refund approval, write-off) |
| ImmutabilityGuard | Prevent modification of published invoices, confirmed payments, posted entries |

**Authorization flow:** JwtAuthGuard → TenantGuard → InstitutionGuard → FinanceAccessGuard → ModuleLicenseGuard → controller execution.
For approval operations: FinancialAuthorityGuard is added.
For published records: ImmutabilityGuard prevents writes.

### 9.6 Event Publishing & Consumers

- Events published via EventEmitter2 (in-process) after transaction commit
- Event naming: `{Entity}{PastTenseVerb}` (e.g., InvoiceGenerated)
- Every event carries a versioned envelope: `eventId`, `eventVersion`, `schemaVersion`, `occurredAt`, `correlationId`, `causationId`, `tenantId`, `actorId`
- **Idempotency:** `eventId` is the deduplication key; consumers check before processing

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

---

## 15. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-17 | Initial creation — All 7 phases complete |
| 1.1.0 | 2026-07-17 | Architecture Review — No changes required; all counts and cross-domain references verified consistent |
| 1.2.0 | 2026-07-20 | Final Refinement — DiscountCondition validation fix (NONE added), InstallmentSchedule lifecycle correction, FeeTemplate/FeeSchedule lifecycle additions, Phase 4 enum count correction (16→17), Phase 7 test count correction (~450+ → ~240+), enum naming example standardization |

---

*This document is the permanent engineering specification for the Finance domain. It is approved and frozen for implementation. All architectural decisions, business rules, validation constraints, and verification criteria are captured here. Refer to source code for implementation details.*
