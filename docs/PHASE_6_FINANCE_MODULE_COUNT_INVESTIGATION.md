# Finance Module Count Investigation

| Field | Value |
|---|---|
| **Investigation type** | Read-only; audit and specification reconciliation input |
| **Date** | 2026-09-26 |
| **Repository HEAD** | `aae6309` |
| **Branch** | `phase/2-rbac` |
| **Primary source** | `engineering/Finance Engineering.md` |
| **Question** | Is the Finance module count 14 (§4) or 16 (§9.1)? |
| **Files changed by this investigation** | None. This report is the only artifact created. |
| **Outcome** | **Unresolved — explicit architecture decision required** (§9) |

---

## 1. Issue

The Finance engineering specification states the number of backend modules in two places that
disagree:

- The §4 Engineering Status Phase 5 row originally claimed **14 modules**.
- The §9.1 Module Structure table lists **16 module rows**.

The discrepancy is recorded in §4.1 item 1 as *"§4 summary claims 14 modules; §9.1 defines 16 —
Unresolved: module count not chosen"* and has not been resolved.

This matters now, before implementation begins, because the module decomposition determines
sub-module boundaries, repository/service/controller placement, event-consumer ownership, and the
institution-scoping enforcement points. Implementing against an unresolved decomposition risks
encoding a structure that a later decision contradicts.

**This investigation does not choose 14 or 16.** It establishes what the evidence can and cannot
settle.

---

## 2. Current Claims

### 2.1 Locations where a module count is stated or implied

| Location | Text | Status after prior corrections |
|---|---|---|
| §4 Phase 5 row (line 219) | *"Architecture and design specified (**16 modules defined in 9.1**). **No backend code exists in the repository:** 0 modules, 0 repositories, 0 domain services, 0 controllers, 0 event consumers. The previously claimed "14 modules, 14 repositories, 14 domain services, 14 controllers, 8 event consumers" is **not present**."* | **Rewritten by revision 1.4.0.** The live row no longer asserts 14; it asserts 16 by reference and quotes 14 as a not-present historical claim. |
| §4.1 item 1 (line 255) | *"§4 summary claims 14 modules; §9.1 defines 16"* — *Unresolved — module count not chosen* | Still open. |
| §9.1 Module Structure (lines 1311–1328) | 16-row module table | Untouched, authoritative-looking itemisation. |
| §15 revision 1.4.0 (line 1890) | Quotes the superseded claim: *"14 modules, 14 repositories, 14 domain services, 14 controllers, 8 event consumers"* | Historical record only. |
| `docs/PHASE_6_FINANCE_PHASE5_IMPLEMENTATION_STATUS_AUDIT.md` line 81 | *"**This list contains 16 modules, not the 14 claimed in §4.**"* | Audit record; unchanged by this investigation. |

### 2.2 What each count represents

- **16 (§9.1)** is an *itemised design inventory*: 16 named rows, each with a stated responsibility.
- **14 (§4)** was a *summary headline figure* in a row that asserted four separate per-layer counts
  ("14 modules, 14 repositories, 14 domain services, 14 controllers") plus an event-consumer count.

### 2.3 A documentation-state observation

The live §4 table **no longer contains the string "14 modules" as an assertion** — revision 1.4.0
replaced it. The figure survives only inside the 1.4.0 revision entry and in §4.1 item 1. §4.1 item 1
therefore describes a row that no longer exists in that exact form. This is noted for accuracy and
is **not** corrected here; this investigation makes no specification edits.

---

## 3. The 16 Modules

§9.1 lists exactly 16 rows. The first is a composition root, not a business capability:

| # | Module | Responsibility as stated in §9.1 | Kind |
|---|---|---|---|
| 1 | `FinanceModule` | Root module, orchestrates sub-modules | **Composition root** |
| 2 | `FeeStructureModule` | FeeCategory, FeeItem, FeeTemplate, FeeSchedule CRUD | Business capability |
| 3 | `BillingModule` | Bill generation, invoice creation, line items | Business capability |
| 4 | `InvoiceModule` | Invoice lifecycle, approval, publication, cancellation | Business capability |
| 5 | `PaymentModule` | Payment recording, confirmation, failure handling | Business capability |
| 6 | `PaymentAllocationModule` | Payment-to-invoice allocation | Business capability |
| 7 | `GatewayModule` | Gateway abstraction, transaction management | Business capability |
| 8 | `ReconciliationModule` | Gateway-to-internal matching | Business capability |
| 9 | `DiscountModule` | Discount CRUD, eligibility, application | Business capability |
| 10 | `ScholarshipModule` | Scholarship CRUD, award management | Business capability |
| 11 | `RefundModule` | Refund request, approval, processing | Business capability |
| 12 | `AdjustmentModule` | Charge corrections, adjustments, write-offs | Business capability |
| 13 | `InstallmentModule` | Installment plans, schedules, late fees | Business capability |
| 14 | `AccountingModule` | Journal entries, ledger accounts, balances, periods | Business capability |
| 15 | `FinancialPolicyModule` | Policy CRUD, versioning, retrieval | Business capability |
| 16 | `SummerSchoolBillingModule` | Receive billing requests, generate invoices | Business capability (cross-domain inbound adapter) |

Derived counts: **16 rows = 1 composition root + 15 business-capability modules.**

---

## 4. Evidence for the 14-Module Count

### 4.1 No module list in the document contains 14 entries

Every itemised list in §9 and §11 was counted directly:

| List | Rows | Equals 14? |
|---|---|---|
| §9.1 Module Structure | **16** | No |
| §9.2 Repository Layer | **11** | No |
| §9.3 Domain Services | **16** | No |
| §9.4 Controllers | **14** | **Yes** |
| §9.5 Guards | 7 | No |
| §9.6 Event Consumers | 8 | No |
| §11.2 Test Categories (total) | 18 | No |
| §11.2 Test Categories (**functional only**) | **14** | **Yes** |

### 4.2 The superseded §4 row asserted four "14"s, but only one was correct

The original row read *"14 modules, 14 repositories, 14 domain services, 14 controllers, 8 event
consumers"*. Checked against the itemised lists:

| Original assertion | Itemised truth | Verdict |
|---|---|---|
| 14 modules | §9.1 = 16 | **Wrong** |
| 14 repositories | §9.2 = 11 | **Wrong** |
| 14 domain services | §9.3 = 16 | **Wrong** |
| 14 controllers | §9.4 = 14 | **Correct** |
| 8 event consumers | §9.6 = 8 | **Correct** |

The same figure (14) was applied uniformly across three of the four layer counts, yet only the
controller position happened to be true. This pattern is consistent with **14 having been copied
from the controller count** into the module, repository, and service positions.

### 4.3 Why §9.3 has 16 services but §9.4 has 14 controllers

Two services have no dedicated controller:

- `PaymentAllocationService` — allocation is exposed through `PaymentController`
- `SummerSchoolBillingService` — no controller row exists

16 services − 2 = **14 controllers**. The 14 is therefore fully explained by the controller layer
and requires no module-level explanation.

### 4.4 The second, independent route to 14: functional test categories

§11.2 lists 18 categories: 14 functional and 4 cross-cutting.

| Functional (14) | Cross-cutting (4) |
|---|---|
| FEE, BIL, INV, PAY, PAL, GW, DISC, SCH, REF, ADJ, INST, ACC, POL, SSB | TENANT, AUTHZ, EDGE, PERF |

The 14 functional categories map **1:1 onto 14 distinct §9.1 modules**. The one §9.1 business module
with no functional category of its own is **`ReconciliationModule`** — its coverage is folded into
the GW category, whose stated scope is *"Initiation, callback, failure, reconciliation"*.

So 14 is reproducible from **two independent non-module lists**: the controller list and the
functional test-category list. Neither is a module inventory.

### 4.5 What the two "extra" modules are, if 14 is the functional count

Comparing 16 §9.1 rows against the 14 functional test categories, the two additional rows are:

| Extra row | Assessment | Classification |
|---|---|---|
| `FinanceModule` | Described in §9.1 itself as *"Root module, orchestrates sub-modules"*. It is a NestJS composition root, not a business capability, and has no service, controller, repository, table, or test category. | **Not a candidate for exclusion on capability grounds** — but whether a composition root is *counted as a module* is a counting-convention question the document never answers |
| `ReconciliationModule` | Has its own service (`ReconciliationService`), its own controller (`ReconciliationController`, route `/api/v1/finance/reconciliation`), a dedicated event consumer (`ReconciliationConsumer`), and repository duties folded into `PaymentRepository`. Its only missing artefact is a dedicated test category. | **Genuinely distinct module.** Not a duplicate, not a subsection of Payment, not legacy — it appears in four independent lists. Its test coverage is *folded*, not *absent* |

Therefore the two extra rows are **one composition root plus one genuine distinct module**. Neither
is explained away as duplicated terminology, a legacy module, or a subsection of another module.

### 4.6 Can a 14-module list be reconstructed?

No defensible reconstruction was found. A count of 14 would require dropping either:

- `FinanceModule` **and** `ReconciliationModule` — but `ReconciliationModule` is a genuine module
  with its own service, controller, and consumer; or
- `FinanceModule` **and** `SummerSchoolBillingModule` — but §9.1, §9.3, §10.3 and §11.2 all carry
  Summer School Billing as a first-class concern (ADR-025 assigns it to Finance); or
- `FinanceModule` **and** `PaymentAllocationModule` — but allocation is the subject of ADR-004 and
  has a dedicated service, test category (PAL), and endpoint group.

Each candidate deletion contradicts at least one ADR or itemised list. **No evidence-supported
14-module decomposition exists.**

---

## 5. Cross-Document Evidence

Other engineering specifications are used here as cross-document evidence only. None is treated as
authoritative.

### 5.1 No other specification names Finance sub-modules

A search of all 9 non-Finance engineering specifications for the 16 §9.1 module names returned
matches in **one** file only — `engineering/People Engineering.md` — and only for the **root**
`FinanceModule`, never for any sub-module:

- Lines 381, 383, 384, 387, 389, 391, 411: event-consumer tables listing `FinanceModule` as a
  subscribing consumer alongside `AcademicsModule`, `AuditModule`, `IdentityAccessModule`.
- Line 1200: *"FinanceModule creates fee assignment"* (Student Enrollment flow).
- Line 1208: *"FinanceModule creates payroll record"* (Staff Onboarding flow).

**Conclusion:** the People specification treats Finance as a single opaque module from the outside.
It provides **no evidence** bearing on internal decomposition, and therefore cannot arbitrate
14 vs 16.

### 5.2 A cross-document capability gap: payroll

People line 1208 states *"FinanceModule creates payroll record"*. The strings `payroll`, `Payroll`,
and `PAYR` appear **nowhere** in `engineering/Finance Engineering.md` — not as a §9.1 module, not in
§7.1's 30 tables, not in §10.3's endpoint catalogue, and not in §11.2's test categories.

This is a **capability referenced by one specification and absent from another**. It is neither the
14 nor the 16 case, and it is recorded here so the module-count decision is not made while a
potentially additional Finance concern is unexamined. It is **not** resolved by this investigation.

### 5.3 The "summary first number = module count" convention is not reliable

Across the specification set, the Phase 5 summary row's first number was compared to that
specification's own §9.1 row count:

| Specification | Phase 5 summary first number | Own §9.1 rows | Agrees? |
|---|---|---|---|
| Finance | 14 (superseded) | 16 | **No — summary is smaller** |
| Operations | 16 | 11 | **No — summary is larger** |
| Reporting & Analytics | 14 | 13 | **No — summary is larger** |
| Communication | 14 | 14 | Yes |

For completeness, other Phase 5 summary rows in the set read: Academic Management
`15/15/15/14/8`, Documents & Learning `13/13/13/13/8`, Identity & Access `11/15/9/9/3/6`, Institution
Management `8/12/8/…/6`, People `11/10/11/10/7`, Platform Administration `15/15/15/15/10`.

**This is the most important cross-document finding.** The disagreement between a summary count and
its own itemised list occurs in **both directions** across the specification set. Therefore the
assumption *"the itemised §9.1 list is authoritative and the §4 summary is simply wrong"* is **not
an established convention** in this codebase — it is an inference that would itself require
ratification. The discrepancy is a systemic instance of the same defect class already recorded in
§4.1 for tables (32 vs 30), indexes (45+ vs 26), and endpoints (100+ vs 98).

---

## 6. Repository Evidence

Implementation evidence is recorded separately from specification evidence, as required. **Because
Finance implementation has not started, the repository cannot confirm or refute either count, and
existing names are not treated as proof that a module belongs in the final architecture.**

| Check | Result |
|---|---|
| `apps/api/src/modules/finance` exists | **No** |
| Contents of `apps/api/src/modules` | `academics, audit, auth, delivery, events, identity, institutions, invitations, onboarding, people, session` — 11 directories, none Finance |
| `Finance*Module` identifiers anywhere in `apps/api/src` | **0** |
| `Finance` references in `apps/api/src/app.module.ts` | **0** (39 `Module` references, none Finance) |
| `fee_structures` / `invoices` / `payments` / `scholarships` / `refunds` | 5 Prisma models exist; these are **data** artefacts, already established as a thin scaffold by the Phase 5 audit, and say nothing about module decomposition |

**Conclusion:** there is **zero** implementation evidence on either side of this question. The
repository cannot break the tie, and the one place a name could have been mistaken for architecture
(Finance as a single `FinanceModule`, per the People specification's usage) is *not* present in the
repository and must not be read as confirmation of a 1-module design.

---

## 7. Impact Analysis

### 7.1 Module count is not 1:1 with any per-layer count

The specification already breaks the assumed module↔artefact correspondence in five places, so the
module count is **not** the master number that the other layers are derived from:

| Observation | Evidence |
|---|---|
| `InvoiceModule` has **no repository of its own** | `Invoice` and `InvoiceLineItem` sit under `BillingRepository` (§9.2) |
| `PaymentModule` and `GatewayModule` share `PaymentRepository` | §9.2 gives `PaymentRepository` the entities Payment, PaymentAllocation, GatewayTransaction, PaymentReconciliation |
| `ReconciliationModule` has no dedicated test category | Folded into GW (§11.2) |
| `PaymentAllocationModule` and `SummerSchoolBillingModule` have no controller | Folded into `PaymentController` / absent (§9.4) |
| `FinancialReportService` and `FinancialReportController` exist with **no module** | §9.3 line and §9.4 line; no `FinancialReportModule` in §9.1 |

Therefore **changing the module count does not mechanically change** the repository (11), service
(16), controller (14), guard (7), consumer (8), table (30), endpoint (98 in 18 groups), or test
category (18) counts. Those are independently itemised. The impact is on **structure and
ownership**, not on arithmetic.

### 7.2 Ownership boundaries

No ADR in §3 governs module decomposition. ADR-001 through ADR-035 are domain and business
decisions; ADR-036 is the D-3 terminology decision. The closest are:

- **ADR-004** — payments allocated via `PaymentAllocation` (supports `PaymentAllocationModule` as a
  first-class concept)
- **ADR-007 / ADR-027** — gateway-independent payments and reconciliation (support
  `GatewayModule` and `ReconciliationModule` as distinct)
- **ADR-025** — Summer School billing triggered by Academic Management events (makes
  `SummerSchoolBillingModule` a **cross-domain inbound adapter**, a boundary question in its own
  right)
- **ADR-032** — *"Financial reports are read-optimized projections"* (bears on the
  `FinancialReport` orphan; see §9.2 below)

**No ADR fixes the module count.** Nothing locks 14 or 16, so the choice is genuinely open.

### 7.3 Institution scoping and tenant isolation

- **ADR-016** — application-level tenant isolation, no database RLS.
- §9.5 defines 7 guards, all applied at the **controller** layer via a fixed authorisation flow
  (`JwtAuthGuard → TenantGuard → InstitutionGuard → FinanceAccessGuard → ModuleLicenseGuard`).

Scoping is enforced by guards, not by module boundaries, so the module count does not change the
scoping mechanism. It would change *at how many points* `ModuleLicenseGuard` and `InstitutionGuard`
are applied, and therefore the number of enforcement boundaries a reviewer must verify.

### 7.4 Layer-by-layer summary of what the choice touches

| Layer | Itemised count | Coupled to module count? |
|---|---|---|
| Modules | disputed: 16 / 15 / other | **This is the decision** |
| Repositories | 11 | Loosely — repository-to-module assignment is undefined for `InvoiceModule` |
| Domain services | 16 | Loosely — 16 services against 15 business modules, offset by `FinancialReport` |
| Controllers | 14 | No — 2 services already folded |
| Guards | 7 | No |
| Event consumers | 8 | Yes — consumer-to-module ownership is a real consequence |
| Database tables | 30 (§7.1) | No — independently catalogued |
| API endpoints | 98 in 18 groups (§10.3) | Yes — group-to-module ownership is a real consequence |
| Test categories | 18 (14 functional + 4 cross-cutting) | Yes — functional categories already track modules 1:1 |
| Ownership boundaries | undefined by ADR | **This is the decision** |
| Institution scoping | 7 guards, controller-layer | Indirectly — number of enforcement points |

---

## 8. D-2 / D-3 Compatibility

**Neither interpretation conflicts with either locked decision. Both D-2 and D-3 remain closed.**

| Check | Result |
|---|---|
| ADR-036 (D-3) references to module names or module counts | **0** |
| ADR-036 scope | Explicitly *"terminology-only"*; states it *"does not decide where settlement currency is [stored]"* |
| `financial.*` (D-2 reserved config namespace) occurrences in the Finance specification | **0** — the namespace concept lives in Institution Management ADR-031 and the `reserved-config-namespaces.ts` guard, not in Finance's module design |
| D-2 dependency on module count | **None.** A reserved configuration namespace is keyed by string prefix and is orthogonal to how many modules exist |
| D-3 dependency on module count | **None.** "Finance-owned settlement currency" is an ownership statement about the *domain*, not about a module decomposition. Both a 15-module and a 16-module Finance satisfy it identically |

**Conclusion: the module-count decision is orthogonal to both frozen decisions and neither
constrains nor is constrained by it. D-2 and D-3 are not reopened by this investigation.**

---

## 9. Resolution

### 9.1 What the evidence *does* establish

Stated plainly, because these findings are firm:

1. **No module list anywhere in the Finance specification contains 14 entries.** §9.1 contains 16.
2. **14 corresponds exactly to two non-module lists**: the §9.4 controller count and the §11.2
   functional test-category count. Both are explained arithmetically (§4.3, §4.4).
3. **The superseded §4 row's three "14"s were wrong** on two of three layer positions (repositories
   are 11, services are 16) and right only on controllers.
4. **The two rows beyond a 14-functional-module reading are `FinanceModule` (a composition root) and
   `ReconciliationModule` (a genuine, distinct module)** — see §4.5. Neither is duplicated
   terminology, a legacy module, or a mere subsection of another module.
5. **No defensible 14-module reconstruction exists**; every candidate deletion contradicts an ADR or
   an itemised list (§4.6).
6. **There is no implementation evidence** on either side (§6).
7. **No other specification adjudicates the question**; the People specification treats Finance as
   opaque (§5.1).
8. **The `FinancialReport` orphan is explicable but not settled by a stated rule.** ADR-032 says
   financial reports are *"read-optimized projections"*; `FinancialReportService` and
   `FinancialReportController` exist, but there is **no** report table in §7.1 and **no**
   `ReportRepository` in §9.2. That is consistent with reports being projections that correctly own
   no module — but the document never states this rule, so it remains an inference.

### 9.2 Why this is nonetheless **not resolvable** from existing evidence

**An explicit architecture decision is required.** The safe-stop condition is met. Four questions
have no answer in the document, and answering them by intuition would be exactly the failure mode
this investigation exists to prevent:

1. **Does the module count include the composition root?** §9.1's 16 includes `FinanceModule`, which
   §9.1 itself calls a *"Root module [that] orchestrates sub-modules"*. A count of 16 (rows) and a
   count of 15 (business capabilities) are both defensible readings of the same table. The document
   defines no counting convention, and no other specification resolves it (Operations and Reporting &
   Analytics both disagree with their own §9.1, in the opposite direction — §5.3).
2. **Is `FinancialReport` correctly moduleless?** It has a service and a controller but no module,
   no table, and no repository. ADR-032 is consistent with this being intentional, but no rule
   states it. If a module *is* required, the count becomes 17.
3. **Do the two folded concerns stand as modules?** `PaymentAllocationModule` has no controller and
   `SummerSchoolBillingModule` is a cross-domain inbound adapter under ADR-025. A module with no
   API surface, and a module that exists to serve another domain, are both legitimate designs and
   both change the count.
4. **Which artefact is authoritative when §4 and §9.1 disagree?** §9.1 is more detailed, but the
   cross-spec comparison shows the specification set does not treat itemised lists as
   automatically authoritative (§5.3). Ratifying "§9.1 wins" is itself a decision.

**Therefore: not resolvable from existing evidence. No winner is selected. Safe-stop reached.**

---

## 10. Recommended Next Action

**One decision is required, and it should be taken before any Finance implementation begins.**
It is a single architecture decision with four sub-questions, all answerable in one sitting by the
architecture owner:

> **Finance Module Decomposition Decision**
>
> 1. **Counting convention** — Does the reported module count include the `FinanceModule`
>    composition root? (Yields 16 as §9.1 reads today, or 15 business-capability modules.)
> 2. **`FinancialReport`** — Confirm it remains a projection concern with no dedicated module
>    (consistent with ADR-032, and no table/repository), **or** designate a
>    `FinancialReportModule`, which would raise the count by one.
> 3. **Folded concerns** — Confirm `PaymentAllocationModule` and `SummerSchoolBillingModule`
>    remain separate modules despite having no controller of their own, **or** fold them into
>    `PaymentModule` / `BillingModule` respectively (which would reduce the count).
> 4. **Authority rule** — Ratify which artefact wins when a §4 summary count and its own detail
>    section disagree. This rule should apply to the table, index, endpoint, and test-scenario
>    discrepancies in §4.1 as well, not only to the module count.

Once decided, the following would follow **as a separate, later task** and are explicitly **not**
authorised by this investigation:

- update §9.1 and the §4 Phase 5 row to the decided count;
- close §4.1 item 1 with the decision recorded;
- reconcile the `FinancialReport` service/controller against the decided module structure;
- address the §5.2 payroll capability gap with the People specification;
- consider whether the systemic summary-vs-detail defect class (tables 32 vs 30, indexes 45+ vs 26,
  endpoints 100+ vs 98) needs a project-wide rule.

### 10.1 Interim position

Until the decision is taken:

- **Do not begin Finance implementation.** Any module created now risks contradicting the decision.
- The status rows for Phases 3, 4, 5, 6, and 7 remain `Specified / Not Implemented`, which remains
  accurate: this investigation found **no** Finance implementation to contradict it.
- §4.1 item 1 remains open. This investigation does not close it.

---

## 11. Verification Performed

All checks were read-only. No build, test, Prisma, migration, or lint command was executed, and no
specification, code, or schema file was modified.

| # | Check | Established |
|---|---|---|
| 1 | Grepped the Finance specification for every module-count statement or implication | 4 locations: §4 Phase 5 row, §4.1 item 1, §9.1 table, §15 revision 1.4.0 |
| 2 | Counted §9.1 Module Structure rows | 16 (1 composition root + 15 capabilities) |
| 3 | Counted §9.2, §9.3, §9.4, §9.5, §9.6 rows | 11 repositories, 16 services, 14 controllers, 7 guards, 8 consumers |
| 4 | Compared the superseded §4 row's four "14"s against the itemised lists | modules 16 ✗, repositories 11 ✗, services 16 ✗, controllers 14 ✓ |
| 5 | Differenced §9.3 services against §9.4 controllers | `PaymentAllocation`, `SummerSchoolBilling` have no controller → 16 − 2 = 14 |
| 6 | Counted §11.2 test categories and split functional vs cross-cutting | 18 total = 14 functional (FEE…SSB) + 4 cross-cutting (TENANT, AUTHZ, EDGE, PERF) |
| 7 | Mapped the 14 functional categories 1:1 onto §9.1 modules | 14 distinct modules matched; only `ReconciliationModule` unmapped (folded into GW) |
| 8 | Audited module↔service↔controller correspondence | 5 asymmetries, including `FinancialReport` (service + controller, no module) and `InvoiceModule` (no repository) |
| 9 | Searched all 9 other engineering specifications for the 16 module names | Only `People Engineering.md` matched, and only the root `FinanceModule` |
| 10 | Grepped the People specification for `FinanceModule` usage | 8 event-consumer rows + 2 flow steps; Finance treated as opaque |
| 11 | Grepped the Finance specification for `payroll` | **0 matches** — payroll is absent from modules, tables, endpoints, and tests |
| 12 | Compared every specification's Phase 5 summary first number to its own §9.1 row count | Finance 14 vs 16 ✗, Operations 16 vs 11 ✗, Reporting & Analytics 14 vs 13 ✗, Communication 14 vs 14 ✓ |
| 13 | Enumerated §3 ADRs (ADR-001…ADR-036) and checked for a module-decomposition ADR | **None exists**; noted ADR-004, ADR-007, ADR-025, ADR-027, ADR-032 as the nearest |
| 14 | Checked `apps/api/src/modules`, `apps/api/src` for `Finance*Module`, and `app.module.ts` | No finance directory, 0 identifiers, 0 `Finance` references in `app.module.ts` |
| 15 | Grepped the Finance specification for `financial.*` (D-2) | **0 matches** — D-2 is orthogonal to module design |
| 16 | Grepped ADR-036 (D-3) text for module names and counts | **0 matches**; scope confirmed terminology-only |
| 17 | Grepped §7.1 for report tables and §9.2 for `*Report*Repository` | 0 and 0 — confirms the projection reading of `FinancialReport` |
| 18 | Checked for a second module list in §9 | §9 has 8 subsections; only §9.1 lists modules |

---

*End of investigation. No Finance specification edit, status change, version bump, code, Prisma,
migration, test, or UI change was made. D-2 and D-3 were not modified or reopened. Nothing was
committed.*
