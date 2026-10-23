# PHASE 6 SCOPE VERIFICATION REPORT — FINANCE & PAYSTACK

(READ-ONLY RECONCILIATION GATE - no implementation performed during this gate.)

Gate authority: MASTER_SMS_ROADMAP.md Phase 6 (P6.1-P6.6 + Phase 6 gate, lines 670-748).
Frozen requirement source: `engineering/Finance Engineering.md` (1813 lines, "Approved - Frozen for Implementation").
Baseline: branch `phase/2-rbac`, HEAD `aae6309`, base `e8df968` untouched, working tree clean before and after this gate.

## 0. Verdict (summary)

**PHASE 6 BLOCKED - ARCHITECTURAL CONFLICT**

Six independent hard-stop conditions are confirmed against on-disk evidence. Four are
*conflicts between frozen sources* (not implementation gaps), one is an *ambiguous
ownership boundary*, and one is an *unresolved trusted-state boundary*. None can be
resolved by implementation judgement; each requires an architecture decision that
contradicts or amends a currently-frozen document. Per the gate's hard-stop list, this
gate does not proceed to implementation.

## 1. Executive Summary

Finance is not merely unimplemented - it is **contradictorily specified**. The frozen
Finance spec declares "Institution configuration" and "Authorization, Roles, Permissions"
out of scope (Finance spec line 48) while simultaneously mandating institution-scoped
financial policy, payment-gateway configuration (line 46) and four access guards plus 63
`finance:*` permissions (section 9.5). The master roadmap additionally requires an
`expenses` capability (P6.1) for which the frozen Finance spec defines **no Expense
entity** - "Expense" exists there only as a chart-of-accounts account *type*
(lines 1748, 1764-1768). These are specification defects, not build gaps.

The runtime recon is otherwise clean and encouraging: only 5 legacy Finance models exist
(no Finance module, no `finance:` permission, no Finance consumer, and a logging-only
payment worker). That low legacy surface means the blocking conflicts are cheap to fix
*now* and expensive to fix after ~30 tables, 97+ endpoints and 63 permissions land.

## 2. Phase 6 Scope Inventory (roadmap, verbatim - no invention)

From MASTER_SMS_ROADMAP.md lines 676-748:

P6.1 Finance APIs: fee structures; fee configuration; invoices; balances; payments;
receipts; **expenses**; financial reporting inputs; relevant finance administration.

P6.2 Financial correctness: define authoritative financial states; database transactions
where required; prevent duplicate payment records; protect balance calculations; preserve
financial history; prevent unauthorized mutation; add financial audit events.

P6.3 Paystack integration: secure credential configuration; payment initialization;
payment verification; webhook endpoint; webhook signature verification; webhook payload
validation; duplicate-event protection; idempotency; failed/expired payment handling;
**ensure payment state is not trusted from the client**; connect verified payment events
to authoritative records.

P6.4 Reconciliation: workflow design; scheduled reconciliation; mismatch detection;
recorded results; auditable.

P6.5 Payment worker: replace the logging-only worker; define jobs; idempotent processing;
retry/backoff; permanent-failure handling; failure recording; duplicate-job tests.

P6.6 Finance tests: successful payment; failed payment; duplicate webhook; invalid webhook
signature; repeated verification; concurrent payment attempts; unauthorized invoice access;
cross-tenant payment access; balance correctness; reconciliation mismatch.

Phase 6 gate (line 748): "No finance feature is production-ready until payment and
reconciliation tests pass."

Frozen-spec expansion (Finance spec line 46, section 9.4, lines 1638+): the frozen spec is
larger than the roadmap block - 30 tables, 97+ endpoints, 63 permissions, 18 Billing (BIL)
permissions, plus Accounting, Discounts, Scholarships/Financial Aid, Refunds, Installments,
Adjustments/Write-offs, Financial Policies, and Reports.

**Scope delta (roadmap vs frozen spec):** the roadmap names 9 API concerns; the frozen
spec names 18 capability groups. "Expenses" exists in the roadmap only. The roadmap's
"receipts" is not a named entity in the frozen schema inventory. Both deltas are
recorded as decisions (D-1, D-18) rather than silently reconciled.

## 3. Existing-Finance Recon (actual repository state)

Verified by direct read of on-disk sources this session.

| Artifact | State | Evidence |
|---|---|---|
| `apps/api/prisma/domains/finance.prisma` | 5 models only | `FeeStructure` (L1), `Invoice` (L28), `Payment` (L59), `Scholarship` (L83), `Refund` (L103) |
| Money precision | `Decimal(10,2)` on all 5 models | conflicts with frozen `decimal(14,2)` (Finance spec line 752) |
| Finance NestJS module | **absent** | not in `apps/api/src/app.module.ts` |
| `finance:*` permission literals | **none anywhere** | repo-wide search returned no files |
| Finance event consumers | **none** | no consumer references finance |
| `apps/api/src/workers/payment.worker.ts` | logging-only stub | `PAYMENT_VERIFY` / `PAYMENT_RECONCILE` handlers only log |
| Frozen tables implemented | **0 of 30** | >=26 named tables absent (fee_categories, fee_items, fee_templates, fee_schedules, bills, invoice_line_items, charge_adjustments, payment_allocations, gateway_transactions, payment_reconciliations, discounts, scholarship_awards, write_offs, installment_plans, late_fees, financial_policies, ledger_accounts, journal_entries, journal_entry_lines, account_balances, financial_periods, payment_gateway_configs, ...) |
| Seed data | 3 `FeeStructure` + 6 `Invoice` rows | `apps/api/prisma/seed.ts:1193-1220` (Tuition 450000, Hostel 120000, Transport 80000, NGN) |

Conclusion: the legacy Finance schema is a Phase-0-era sketch. It predates every frozen
Finance rule (no allocation table, no gateway-transaction table, no journal-entry table),
so **no legacy table can satisfy the frozen spec as-is**. This is a greenfield domain
mounted on a legacy-shaped namespace - the friendliest possible migration posture, and the
strongest argument for resolving D-1..D-8 before any DDL is written.

## 4. Dependency Map

Finance consumes (upstream, must exist first or be contractually fixed):

- People - Student, Staff, Parent, Guardian, `PersonRelationship` (payer authorization
  substrate: `people.prisma:623-652`, carries `relationshipType`, `startDate`, `endDate`,
  `isActive`); Student/WithdrawalDetail for refund eligibility.
- Academic - AcademicYear, AcademicSession, Term, Class, StudentClassEnrollment,
  SummerSchoolSession, SummerSchoolRegistration (`academic.prisma:36,65,93,282,451,872,905`).
  Fee schedules are session-scoped (BR-029).
- Institution - Institution, InstitutionMembership, licensing/module enablement.
- Identity & Access - JWT tenant/institution context, Role, Permission, session.
- Communication - publishes events; does not own notification (Finance spec line 44).
- Operations - Receivable/payable row already reserves finance-owned amounts
  (`Operations Engineering.md:1032-1033`: amount + currency "Calculated by Finance").
- Documents & Learning - BookLoan carries a NOT VALID term FK (migration line 1156).
- Platform Administration - subscription billing (see D-14).

Finance publishes downstream: invoice/bill/payment/refund/scholarship/adjustment events to
Audit, Accounting, Notification, Progression, Policy consumers and to Academic/People.

## 5. Legacy Finance Table Classification

| Legacy table | Disposition | Rationale |
|---|---|---|
| `fee_structures` | **ARCHIVE** (not extend) | Frozen model is a 4-table hierarchy (categories -> items -> templates -> schedules). The legacy flat table collapses all four. 3 seeded rows are demo fixtures; 3 rows hold orphaned academic FKs (see section 14). |
| `invoices` | **REPLACE** | Legacy table lacks line items, discounts, scholarships, tax, late fees, installments, credit balance, notes, and financial-period linkage. BR-02/BR-04/BR-008 cannot be represented. 6 seeded rows are demo fixtures; 6 rows hold orphaned academic FKs. |
| `payments` | **REPLACE** | Legacy table lacks allocation (BR-05/BR-06/BR-07 unachievable without `payment_allocations`), gateway transaction linkage (BR-027), and journal linkage (BR-012). |
| `scholarships` | **REPLACE** | Frozen model separates the *fund* from *awards*; BR-024 (awards cannot exceed fund limit) is unenforceable on the legacy shape. |
| `refunds` | **REPLACE** | Legacy table lacks the approval workflow and threshold escalation (BR-09). |
| (none) | **MIGRATE** | No legacy column survives into the frozen schema without loss. Decision D-12. |

Net: **0 retain, 0 extend, 5 archive/replace, 25+ create, 0 unresolved-by-omission.** The
"archive" disposition follows the established Phase 5 D-1 precedent (archived legacy
academic tables rather than destructive rewrite).

## 6. Ownership Model

Frozen Finance ownership (Finance spec lines 43, 56, 349):

- "Finance owns all invoice calculation; other domains send billing requests but never
  calculate invoices" (BR-026, line 349).
- "Payment state owned by Finance" (BR-027, line 350).
- Invoice is the authoritative financial document (line 57, BR-02).

**Conflict - configuration ownership (HARD STOP, D-2).** Finance spec line 48 places
"Institution configuration" out of scope and assigns it to Institution Management, yet
line 46 requires Finance to own "configurable financial policies (currency, tax,
numbering, penalties)". `Institution Management Engineering.md:992` assigns Institution
`financial.*` configuration covering fee categories/structures, discounts, scholarships,
payment plans, **payment gateways**, and tax settings. The on-disk substrate for that claim
is `InstitutionConfiguration` / `InstitutionSetting` - an unkeyed JSON key/value pair
(`institution-configuration.prisma:17-56`, `value Json`, `@@unique([institutionId, key])`)
with no financial typing and no validation. So both frozen specs claim the same
configuration, and the existing table can hold either shape with no constraint preventing
divergence.

**Conflict - currency source of truth (HARD STOP, D-3).** Three candidate homes for
institution currency, none reconciled:

1. `Institution.currency String @default("NGN")` - already on disk, `institution.prisma:72`.
2. `institution_configurations` JSON `financial.*` key (D-2).
3. Finance `FinancialPolicy` currency (frozen spec line 46, BR-015 line 338).

BR-015 fixes currency after the first invoice. Which column is authoritative at invoice
time determines whether a currency change is even detectable. Two live currency columns
with different values is a second financial source of truth - an explicit hard stop.

**Conflict - subscription billing (D-14).** ADR-015 assigns subscription billing to
Finance, while Finance spec line 48 excludes "Subscription management (Institution
Management)" and Platform Administration owns subscriptions.

## 7. Money Model

- **Precision:** frozen spec mandates `decimal(14,2)`, "never Float" (line 752). Legacy
  schema is `Decimal(10,2)`. `decimal(10,2)` caps at 99,999,999.99 and **cannot** hold
  institution-scale turnover totals, nor `total_gateway_amount` aggregates. Every legacy
  monetary column must widen, not reuse (D-12).
- **Arithmetic type:** Prisma returns `Decimal` (decimal.js). No rounding/quantization
  helper is present anywhere in `apps/api/src`. Confirmed by repo-wide search: the frozen
  spec contains **no** rounding-mode statement (no `rounding`, `half-up`, `half-even`, or
  `toFixed` occurrence). BR-004 (line 327) composes five additively-reduced terms
  (`sum - discounts + tax + late fees`) and BR-012/BR-013 require a *balanced* journal
  entry, so residual sub-cent dust would surface as unbalanced entries and 409/rollback
  loops. A single canonical quantization point and mode is required (D-8, HARD STOP
  class: financial-correctness gap).
- **Tax:** BR-016, per-institution, configurable - belongs to whichever side wins D-2.
- **Currency:** institution-scoped, fixed after first invoice (BR-015).
- **Numbering:** sequential, institution-scoped, **gap-free** (BR-017, line 340). Gap-free
  under concurrency requires a serialization point; a `max()+1` read is unsafe under
  concurrent invoice creation. Sequence ownership must be explicit (D-17).

## 8. State Authority

Frozen authority (BR-027, line 350; P6.3 "ensure payment state is not trusted from the
client"): Finance owns payment state; gateway transactions are audit records.

**Conflict - existing client-writable payment state (HARD STOP, D-6).** Two Phase 4/5
surfaces already hold client-controlled financial-status free text:

1. `SummerSchoolRegistration.paymentStatus String? @db.VarChar(50)`
   (`academic.prisma:912`) is populated from client DTO
   `RegisterForSummerSchoolDto.paymentStatus`, validated only with `@IsString()`
   (`academic-admin.dto.ts:242`), and is **mutable** through
   `updateRegistration` (`summer-school.service.ts:233, 259, 267`). No enum, no
   server-derived state, no Finance write-back. BR-025 (line 348) says Summer School
   billing is "triggered by Academic Management events only" - so this field is a
   *second*, client-owned source of truth for the exact state BR-027 assigns to Finance.
2. People `refundStatus` is client-supplied free text: DTO regex-validated
   (`student.dto.ts:199-200`) and written in `students.service.ts:708, 716`, stored
   `VARCHAR(50)` (`people.prisma:353`). This pre-empts BR-09's Finance refund authority.

P6.3's checklist item is therefore not a new requirement - it is remediation of an existing
violation, and it crosses a Phase-5 boundary (Academic) that this gate must not modify.
Decision required before P6.3 can even be specified.

Authoritative state chain that must be defined: gateway callback (signature-verified) ->
`gateway_transactions` -> Finance-owned `payments` + `payment_allocations` ->
`invoices.paid_amount/outstanding_balance` -> balanced `journal_entries`. Only after that
chain is server-derived may any client-facing status field be read-only or removed.

## 9. Payment-Provider Boundary

Frozen: provider-independent adapter pattern (line 58); Paystack + Flutterwave **Active**,
Stripe **Future**; webhook at `/api/v1/finance/gateways/callback`; signature verification
mandatory (lines 1693-1731). `PaymentConfirmed` / `PaymentFailed` events are emitted
(lines 1693-1731).

Boundary observations requiring decisions:

- **D-9 - provider set and secret custody.** Two active providers doubles the signature
  schemes, payload shapes, and reconciliation field mappings versus roadmap P6.3's
  Paystack-only framing. Secrets must not enter Prisma plaintext (legacy pattern uses a
  plain `String` for `currency`, so no precedent for secret columns exists). The
  frozen spec's provider set is a superset of the roadmap's - whether Flutterwave ships
  in Phase 6 is unresolved, and it is an external-dependency authorization question.
- **D-10 - single shared callback path.** One endpoint for all providers requires a
  provider discriminator in an *unauthenticated* route; that is an unauthenticated
  parsing surface and needs an explicit raw-body/signature-before-parse ordering rule.
- **D-17 - provider-reference uniqueness.** `payment_allocations`/gateway records need a
  provider-scoped unique reference plus a globally unique internal payment id; without
  both, webhook replay across providers can double-allocate.

## 10. RBAC + ObjectScope Matrix (preliminary - Phase 2 substrate)

Existing Phase 2 guards, verified on disk:

- `PermissionGuard` (`permission.guard.ts:14-16`) **fails open** when a handler carries no
  `@Permissions` metadata. Any Finance controller that omits the decorator is silently
  unprotected. Every Finance route must be decorator-complete and lint-enforced.
- `ObjectScopeGuard` (`object-scope.guard.ts`) supports only scope types
  `tenant`, `self`, `institution`, `none`, `authOnly`; its model registry contains **no
  Finance model**, and it returns `true` when a decorated object is absent (no `:id`, or
  model not resolvable) and for list routes without an object id.

Consequences (HARD STOP, D-5 and D-11):

| Finance concern | Required scope | Available today |
|---|---|---|
| Student/parent views their own invoices & pays | payer scope (person-scoped) | **absent** - no payer scope type exists |
| Staff/student reads own record | `self` | present, but `self` semantics are undefined for a payer who is not the student |
| Institution finance staff | `institution` | present, but requires registry entries for ~30 new models |
| Cross-tenant denial | `tenant` | present |
| 63 `finance:*` permissions | permission catalogue | **0 exist**; spec declares RBAC out of scope (line 48) yet mandates 4 guards (section 9.5) |
| `FinancialAuthorityGuard` (refund approval, write-off) | threshold-based authority | guard does not exist; out of scope per line 48 |
| `ImmutabilityGuard` (published invoice/confirmed payment/posted entry) | write-blocking | guard does not exist |

**D-5 - payer authorization boundary (HARD STOP).** The frozen spec requires a
`FinanceAccessGuard` to "validate user has access to requested financial entity" but
defines **no payer entity, no invoice-to-payer relation, and no payer scope**. The natural
substrate exists - `PersonRelationship` with `relationshipType`/`isActive`/date bounds
(`people.prisma:623-652`) - yet no Finance model references it, and `ObjectScopeGuard` has
no way to express "this payer may see this student's invoice". P6.6's "unauthorized
invoice access" test is unbuildable until this is decided. Under the gate's hard-stop
list this is an explicit "unclear payer/authorization boundary".

**D-7 - RBAC ownership contradiction (HARD STOP).** Line 48 excludes Roles/Permissions;
section 9.5 mandates `FinanceAccessGuard`, `ModuleLicenseGuard`,
`FinancialAuthorityGuard`, `ImmutabilityGuard` and 63 `finance:*` permissions. Either the
frozen scope statement or the guard/permission model must be amended. Adding a global
finance role set is on the gate's hard-stop list, so it cannot be assumed here.

## 11. Lifecycle & Immutability

Frozen transitions (Finance spec section 5.6, lines 316-318 and the Invoice/Bill/Payment
lifecycles immediately preceding): `FinancialPolicy: Draft -> Active -> Superseded`;
`PaymentGatewayConfig: Active -> Inactive`; Invoice `DRAFT -> PUBLISHED -> ...`; Bill is a
draft charge converted on publish (BR-03); published invoices immutable with corrections
as credit/debit notes (BR-08, BR-010); confirmed payments immutable; posted journal entries
immutable; write-offs require authorization and post journal entries (BR-011).

Immutability is currently **unenforceable in the runtime**: the only existing guard set is
`PermissionGuard` (fails open) and `ObjectScopeGuard` (fails open on absent objects).
`ImmutabilityGuard` does not exist, and the guard is declared out of scope. Soft delete is
additionally restricted - published invoices and confirmed payments are never soft-deleted
(line 96), which the existing `deleted_at` convention alone cannot express.

Also unresolved: the `PaymentGatewayConfig: Active -> Inactive` transition interacts with
in-flight gateway transactions. Whether deactivation blocks new initiations, stops
callbacks, or both is unspecified (D-9).

## 12. Concurrency & Idempotency

Frozen mechanisms: Prisma interactive transactions for multi-entity operations; optimistic
concurrency via `version` with P2025 -> 409; event publish deferred to post-commit; event
idempotency by `eventId` with >=72h TTL; journal balance validated pre-commit and rolled
back if unbalanced (section 9.7, lines 1343-1349).

Existing runtime envelope (`event-envelope.ts`): `EVENT_SCHEMA_VERSION = 1`,
`EVENT_DEDUP_TTL_SECONDS = 72*60*60` (matches the >=72h floor);
`BaseEventEnvelope` = `eventId`, `causationId`, `schemaVersion`, `emittedAt`, `tenantId`.

**Event-envelope contract conflict (HARD STOP, D-4).** The frozen Finance spec requires
each event to carry `eventId`, `eventVersion`, `schemaVersion`, `occurredAt`,
`correlationId`, `causationId`, `tenantId`, `actorId` (Finance spec line 1329). The
implemented `BaseEventEnvelope` has **no** `eventVersion`, **no** `correlationId`, **no**
`occurredAt` (it has `emittedAt`), and **no** `actorId`; and its field names are
PascalCase while the frozen spec's naming convention mandates PascalCase past-tense
`{Entity}{PastTenseVerb}` events (line 81) whereas actual runtime events are dotted
namespace names (e.g. `academics.summer-school.registered`,
`academics.events.ts:130-149`). Three frozen consumers also disagree about *who consumes
what* (section 13). Resolving this is a Phase-1/2 event-infrastructure amendment.

Concurrency hotspots requiring an explicit serialization decision: gap-free invoice
numbering (D-17), concurrent allocation to one invoice (P6.6 "concurrent payment
attempts"), balance recalculation vs journal posting, and daily late-fee accrual against
a concurrently-published invoice.

## 13. Academic <-> Finance and People <-> Finance Boundaries

**Direction is one-way:** Academic/People publish facts; Finance consumes and responds with
billing facts. BR-025: Summer School billing is "triggered by Academic Management events
only". BR-026: Finance owns all invoice calculation.

**Consumer-assignment conflict (HARD STOP, D-4).** The three frozen specs assign Finance's
event subscriptions inconsistently:

| Source | Claim |
|---|---|
| Finance spec line 1337 | `AcademicManagementConsumer` handles `StudentClassEnrolled`, `StudentClassTransferred`, `SummerSchoolRegistered` -> trigger bill/invoice generation |
| Academic spec line 388 | those same events route to Audit/Attendance/People, **not** Finance |
| Academic spec line 1443 | `FinanceConsumer` consumes `SummerSchoolRegistered` |
| People spec line 1179 | `FinanceConsumer` consumes `StudentEnrolled` / `StudentGraduated` / `StaffHired` / `StaffSeparated` |
| Finance spec line 1338 | `PeopleConsumer` (not Finance) handles `StudentWithdrawn`, `StudentGraduated` |

Note the direct contradiction on `StudentGraduated` (People spec assigns it to
`FinanceConsumer`; Finance spec assigns it to `PeopleConsumer`) and on Summer School
(Academic spec line 388 excludes Finance while line 1443 includes it). None of these names
match the dotted runtime naming. No implementation can satisfy both readings.

**People -> Finance refund boundary.** `StudentWithdrawn`/`StudentGraduated` drive refund
eligibility and final billing (Finance spec line 1338), but the People-owned
`refundStatus` free-text field (`people.prisma:353`, `students.service.ts:708, 716`) lets
a client assert refund state before Finance approves anything - directly contradicting
BR-09 (D-6).

**Academic -> Finance status duplication.** Finance's `PaymentConfirmed` is meant to drive
financial clearance, but `SummerSchoolRegistration.paymentStatus` is a separately
client-written field (D-6). Two writable representations of one fact.

## 14. Migration Risk

- **`NOT VALID` legacy FKs, unresolved:** Phase 5 migration
  `20260924110000_p5_2_academic_management/migration.sql` left FKs `NOT VALID`:
  `fee_structures_academicYearId_fkey` (line 1163), `fee_structures_termId_fkey`
  (line 1167), `invoices_academicYearId_fkey` (line 1173), `book_loans_termId_fkey`
  (line 1156). Per `docs/PHASE_5_MIGRATION_REPORT.md`: 3 orphaned `fee_structures` and
  6 orphaned `invoices` rows.
- **Every one of those 9 rows is legacy Finance data** and every one is demo-scale
  (seed fixtures). They are exactly the rows that cannot be migrated (§5), so the archive
  path (D-13) is low-risk **only if** the archive is non-destructive and the `NOT VALID`
  constraints are retired deliberately rather than validated against archived rows.
- **Precision widening:** `Decimal(10,2)` -> `decimal(14,2)` on all legacy monetary columns
  is a safe widening, but must be ordered before any frozen table reuses those names.
- **Name collision risk:** the frozen spec reuses legacy table names (`invoices`,
  `payments`, `scholarships`, `refunds`) with incompatible shapes. An in-place `ALTER` would
  be a destructive Finance migration - an explicit hard stop. Archive-then-create is the
  only non-destructive sequencing, and it needs sign-off (D-12).
- No Finance migration may be authored in this gate; no schema, migration, seed, or
  permission change was made.

## 15. External-Service Boundary

- **Providers:** Paystack (roadmap P6.3) and Flutterwave (frozen spec) - both external
  HTTP/JSON dependencies with signature-verified webhooks. Stripe deferred. No provider SDK
  or dependency is present in the repo, and no dependency was added.
- **Secret custody:** undecided (D-9). Legacy `currency String` gives no precedent for
  secret columns; gateway secrets must not be stored in plaintext in a tenant-scoped table
  that Finance or Institution staff can read.
- **Unauthenticated ingress:** `/api/v1/finance/gateways/callback` is a public route. It is
  outside the JwtAuthGuard/TenantGuard flow, so tenant resolution must come from the
  verified transaction reference, never from client input (D-10).
- **Outbound:** notifications for invoice/payment/refund/scholarship events route to
  Communication, which Finance does not own (line 44).
- **Operations coupling:** the Operations receivable row already assumes Finance-computed
  `amount`/`currency` (`Operations Engineering.md:1032-1033`) - Finance must supply it.
- **Licensing:** `ModuleLicenseGuard` implies per-institution module enablement; the
  licensing source of truth is outside Finance scope (line 48) (D-2/D-7).

## 16. Decision Register

Numbering starts at D-1. **BLOCKING** = a gate hard-stop; must be resolved by architecture
before any Phase 6 code, DDL, or permission work begins.

| ID | Decision required | Class | Evidence |
|---|---|---|---|
| D-1 | Does Phase 6 include Expenses? Roadmap P6.1 requires `expenses`; the frozen Finance spec defines **no Expense entity** - only a chart-of-accounts account *type*. Either the roadmap drops it, or the frozen schema gains an Expense model. | BLOCKING - conflicting frozen specs | Roadmap:686; Finance spec:1748, 1764-1768 |
| D-2 | Who owns institution financial configuration? Finance spec:48 excludes "Institution configuration" yet :46 requires Finance-owned `FinancialPolicy` (currency/tax/numbering/penalties) + `PaymentGatewayConfig`; Institution spec:992 claims `financial.*` incl. payment gateways and tax settings. Existing substrate is untyped JSON (`institution-configuration.prisma:17-56`), so divergence is unconstrained. | BLOCKING - ambiguous financial ownership | Finance spec:46,48; Institution spec:992; `institution-configuration.prisma:17-56` |
| D-3 | Which single column is the authoritative institution currency: `Institution.currency` (`institution.prisma:72`), `institution_configurations` `financial.*` JSON, or Finance `FinancialPolicy`? BR-015 fixes currency after first invoice, so the authoritative column determines detectability. | BLOCKING - second financial source of truth | `institution.prisma:72`; Finance spec:46, 338 (BR-015) |
| D-4 | Reconcile event contracts. Envelope field set differs (frozen requires `eventVersion`, `correlationId`, `occurredAt`, `actorId`; runtime has `emittedAt` and none of the others); naming differs (frozen PascalCase past-tense vs runtime dotted); and `StudentGraduated` / Summer School consumer ownership is contradictory across the three frozen specs. | BLOCKING - conflicting frozen specs | Finance spec:1329, 1337-1338; Academic spec:388, 1443; People spec:1179; `event-envelope.ts`; `academics.events.ts:130-149` |
| D-5 | Define the payer/authorization model: a payer entity, the invoice-to-payer relation, and a `payer` object scope. `ObjectScopeGuard` supports only tenant/self/institution and registers no Finance model; the substrate `PersonRelationship` is unused by Finance. P6.6 "unauthorized invoice access" is unbuildable until this exists. | BLOCKING - unclear payer/authorization boundary | `object-scope.guard.ts`; `people.prisma:623-652`; Finance spec:1316 |
| D-6 | Define the trusted payment-state boundary and remediation for existing client-writable financial status: `SummerSchoolRegistration.paymentStatus` (free-text, mutable) and People `refundStatus` (client-supplied). BR-027/BR-025 assign this state to Finance; remediation crosses Phase 4/5 boundaries. | BLOCKING - unclear trusted payment-state boundary | `academic.prisma:912`; `academic-admin.dto.ts:242`; `summer-school.service.ts:233,259,267`; `people.prisma:353`; `student.dto.ts:199-200`; `students.service.ts:708,716`; Finance spec:348, 350 |
| D-7 | Resolve the RBAC contradiction: line 48 excludes Roles/Permissions while section 9.5 mandates 4 guards and 63 `finance:*` permissions. Also note `PermissionGuard` fails open when `@Permissions` is absent (`permission.guard.ts:14-16`), so decorator completeness must be enforced. | BLOCKING - conflicting frozen specs | Finance spec:48, 1309-1323, 1638; `permission.guard.ts:14-16` |
| D-8 | Choose a canonical monetary quantization point and rounding mode. The spec mandates `decimal(14,2)` but states **no** rounding rule; BR-004 composes five reduced terms and BR-012/013 require balanced journal entries, so sub-cent residue causes unbalanced-entry rollbacks. | BLOCKING - financial-correctness gap | Finance spec:327, 752, 1349; no rounding occurrence in spec |
| D-9 | Authorize the provider set and secret custody: Flutterwave is Active in the frozen spec but absent from roadmap P6.3; secrets have no storage precedent. | Required | Finance spec:46, 1693-1731; Roadmap:700-712 |
| D-10 | Define the unauthenticated callback contract: shared path for multiple providers, provider discriminator, and raw-body/signature-before-parse ordering. | Required | Finance spec:1693-1731 |
| D-11 | Extend `ObjectScopeGuard` for ~30 Finance models and decide its fail-open-on-absent-object and unprotected-list-route behavior. | Required | `object-scope.guard.ts` |
| D-12 | Approve archive-then-create for all 5 legacy Finance tables (no in-place `ALTER`; no legacy column survives intact) plus the `Decimal(10,2)` -> `decimal(14,2)` widening. | Required - destructive-migration gate | `finance.prisma`; Finance spec:752 |
| D-13 | Decide disposal of the 9 `NOT VALID`-FK legacy Finance rows (3 `fee_structures`, 6 `invoices`) and whether those constraints are retired or validated. | Required | P5 migration:1156-1173; `docs/PHASE_5_MIGRATION_REPORT.md` |
| D-14 | Resolve subscription-billing ownership: ADR-015 assigns it to Finance while Finance spec:48 excludes subscription management and Platform Administration owns subscriptions. | Required - ownership | Finance spec:48; Institution spec:140 |
| D-15 | Specify payment-worker jobs: queue names, deterministic job ids, attempt/backoff policy, and permanent-failure/DLQ handling, replacing the logging-only stub. | Required | `apps/api/src/workers/payment.worker.ts`; Roadmap:722-731 |
| D-16 | Define financial-period/session alignment and the daily late-fee accrual job, including interaction with concurrently published invoices. | Required | BR-014 (:337), BR-018 (:341) |
| D-17 | Choose a concurrency-safe gap-free invoice-number source (BR-017 forbids `max()+1`) and provider-reference uniqueness for allocation. | Required | BR-017 (:340); BR-027 (:350) |
| D-18 | Decide disposition of the 9 legacy seed rows (`seed.ts:1193-1220`) and whether roadmap "receipts" needs a named entity, given it is absent from the frozen schema inventory. | Required | `seed.ts:1193-1220`; Roadmap:685 |

Blocking count: **8** (D-1 through D-8).

## 17. Gate Outcome

Read-only gate completed. Findings are specification conflicts and ownership gaps, not
implementation defects. Because the blocking items include conflicting frozen documents
(D-1, D-4, D-7), ambiguous financial ownership (D-2, D-14), a second financial source of
truth (D-3), an unclear payer/authorization boundary (D-5), an unresolved trusted
payment-state boundary (D-6), and a financial-correctness gap (D-8), Phase 6 must not
proceed to implementation. No Finance code, schema, migration, seed, permission, or history
change was made; this report is the only file written by this gate.

PHASE 6 BLOCKED - ARCHITECTURAL CONFLICT
