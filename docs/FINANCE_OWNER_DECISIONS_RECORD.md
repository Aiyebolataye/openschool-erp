# FINANCE OWNER DECISIONS RECORD — PHASE 6

| Field | Value |
|---|---|
| **Document type** | Owner decision record. Records decisions **as answered**. Makes no new decision and adds no owner answer that was not supplied. |
| **Date** | 2026-09-29 |
| **Repository HEAD at time of recording** | `aae6309` |
| **Branch** | `phase/2-rbac` |
| **Register** | **Finance D-register** — `docs/PHASE_6_DECISION_BRIEF.md` Part I / Part II |
| **Source of the answers** | Owner decision pass, 2026-09-29, answering `docs/FINANCE_OWNER_DECISION_PACK.md` §11 |
| **Prior state** | `SAFE-STOPPED — awaiting owner decisions` (owner decision pack §14) |
| **Current state** | **READY FOR FINAL FINANCE IMPLEMENTATION PROMPT**, with one bounded open item — see §4 |
| **Files changed** | Documentation only. No code, Prisma schema, migration, controller, service, DTO, guard, People implementation, Academics implementation, or test was created, modified, or deleted. Nothing committed. |

---

## 0. REGISTER DISCIPLINE

This record concerns the **Finance D-register** only.

The repository contains a separate **Register-B** (`docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md`, `docs/DECISION_D1_SPECIFICATION_AUTHORITY.md`, `docs/DECISION_D2_COUNTABLE_UNITS_AND_GRANULARITY.md`, `docs/DECISION_D3_INVESTIGATION.md`) whose `D-1 … D-10` identifiers overlap the Finance register's `D-1 … D-8`.

- The two registers are **not merged**.
- No Register-B decision is modified, reopened, or superseded by this record.
- No precedence between the registers is asserted.
- Every decision below is written `FINANCE D-n`.

**No implementation dependency in the recorded decisions crosses into Register-B.** Nothing in this record requires a Register-B resolution. If one is later identified, it must be reported separately rather than resolved implicitly.

---

## 1. RESOLUTION SUMMARY

| Decision | Question count | State | Recorded in |
|---|---|---|---|
| **FINANCE D-7** — financial authority | 8 | **RESOLVED** | `engineering/Finance Engineering.md` §2 *Finance Role Permissions*, §9.5, ADR-037 clarification |
| **FINANCE D-8** — rounding / quantisation | 4 | **RESOLVED** | `engineering/Finance Engineering.md` new §6.5.1 |
| **UNNUMBERED** — aggregate document-total limit | 3 | **MECHANISM RESOLVED; numeric defaults OPEN** | `engineering/Finance Engineering.md` new §6.5.2 |
| **FINANCE D-2** — financial configuration ownership | 2 | **RESOLVED** | `engineering/Finance Engineering.md` §1, §6.5, ADR note; Institution Management ADR-031 unchanged |
| **FINANCE D-3** — canonical settlement currency | 4 | **RESOLVED** | `engineering/Finance Engineering.md` §2 *Currency Terminology*, ADR-036 resolution note, V-INV-07, I-13 |
| **FINANCE D-4** — event contract | 6 | **RESOLVED** | `engineering/Finance Engineering.md` §5.8, §9.6, new §9.6.1 |
| **FINANCE D-6** — payment / refund ownership | 4 | **RESOLVED** | `engineering/Finance Engineering.md` §5.6, §6.6, §7.2, §9.6, new §9.6.2 |
| **FINANCE D-12** — legacy table disposition | 5 | **RESOLVED** | `engineering/Finance Engineering.md` §4.1 new item, new §7.5 |
| **FINANCE D-5** — payer and object scope | — | **RESOLVED: staff-only.** Off the critical path | `engineering/Finance Engineering.md` §5.7 |
| **FINANCE D-1** — expenses | — | **NOT DECIDED. Deferred**, as previously scoped | unchanged |

**Counts: 8 required decisions answered (7 numbered + 1 unnumbered), 1 conditional answered (D-5), 1 deferred (D-1).**

### 1.1 Items that remain open after this record

| # | Open item | Why it is open | Does it block the final batch? |
|---|---|---|---|
| **A** | **Aggregate-limit numeric defaults** — the three values: max amount per line item, max number of line items per document, max total amount per document | The owner decided the *mechanism* (FinancialPolicy rows) and the *overflow behaviour* (reject) but supplied **no numeric values**, and no authoritative source already contains them (§4.1) | **No** — bounded. The implementation can build the mechanism and read the values from policy. It must not invent a default. See §4. |
| **B** | `PersonMerged` / `PersonSoftDeleted` **merge-record representation** | The owner explicitly declined to invent one. No merge model exists in the schema (verified: `people.prisma` has no `PersonMerge` / `mergedInto` / `duplicateOf` field; the only `sourcePersonId` at L626 belongs to `PersonRelationship`) | **No** — the Finance handler can consume the canonical identity linkage without asserting a storage shape. Flagged for the implementation batch (§5.3) |
| **C** | `finance:refund:request` permission name | The owner decided the request/approval **split** and the threshold mechanism, but named only the approval-side resources. The repository registers refund actions as `read/create/approve` only — no `request` action exists | **No** — the batch must confirm the action name before adding any permission row. Flagged (§5.4). No permission is added in this task. |
| **D** | **FINANCE D-1** (expenses) | Never decided; deferred | **No** — leaf, no dependents |
| **E** | **FINANCE D-13** (`NOT VALID` constraints) | Explicitly kept downstream of D-12 by the owner | **No** — D-12 Q5 records that the constraints must not be carried forward; the disposition decision itself stays open |

---

## 2. RECORDED DECISIONS

Each entry states the owner's answer verbatim in substance, the contradiction it resolves, and the authoritative location updated. **No answer has been altered, narrowed, or extended.**

### 2.1 FINANCE D-7 — Financial authority

#### D-7 Q1 — New approval role

**Answered: Option 1.** Phase 6 introduces **no** new financial approval role. `BURSAR` is reused and request/approval authority is separated **through permissions**. No approval role and no delegation model is created.

#### D-7 Q2 — The 17 admin-only Finance resources

**Answered: remain admin-only.** They are not assigned to any new role. The named examples — `finance:journal:create`, `finance:ledger:create`, `finance:period:manage`, `finance:refund:approve`, `finance:write_off:approve`, `finance:fee_category:create`, `finance:fee_item:create` — stay with the five admin roles.

**One stated exception:** D-7 Q7 grants `BURSAR` the fee-category and fee-item permissions needed for its billing workflow. The owner instructed that this exception **must not be generalized** to the other admin-only resources.

#### D-7 Q3 — Request vs approval separation, and threshold location

**Answered: Option 1.** Request and approval are separated **through permissions**. The approval threshold is a **`FinancialPolicy` value**, using existing policy **P-08** with its documented values:

| Parameter | Value |
|---|---|
| Default | `50000` |
| Minimum | `1000` |
| Maximum | `1000000` |

No approval role and no delegation record is created.

#### D-7 Q4 — Self-approval

**Answered: Yes, self-approval is blocked.** The identity comparison uses the **authenticated actor identity** against the identity of the user who **initiated/requested** the refund or write-off. An initiator may not approve their own request.

**Identity source — resolved from the repository, not invented.** The frozen refund table (`§7.2`, L1091-1094) already carries `approved_by` as a uuid column, and the Finance models already carry the repository's standard initiator column `createdBy` (`finance.prisma` L18, 43, 97, 122, 151, 179, 239, 286, 313, 343, 366, 389, 425 — `@map("created_by") @db.Uuid`). The comparison is therefore **`approved_by` vs the record's initiator `createdBy`**, both being the canonical authenticated user uuid. No new identity concept is introduced.

#### D-7 Q5 — Period-close authority

**Answered: No.** Financial periods remain restricted to the existing five admin roles. Period-close authority is not extended.

#### D-7 Q6 — Payment permissions

**Answered: No.** No role other than the five admin roles receives `finance:payment:read`, `finance:payment:create`, `finance:payment:confirm`, or `finance:payment:allocate`. `BURSAR` remains explicitly excluded from payment permissions per ADR-037.

#### D-7 Q7 — Fee-category and fee-item permissions for BURSAR

**Answered: Yes.** `BURSAR` receives the fee-category and fee-item permissions required to operate the billing workflow. The owner stated this is **not** a grant of the rest of the admin-only Finance catalogue, and that ADR-037's existing BURSAR boundary remains authoritative for the permissions it already defines.

**Actions are not invented.** The action set is taken from what the repository and this specification already define for exactly these two resources — `read`, `create`, `update`:

- §10.3 L1560-1562 → `finance:fee_category:{read, create, update}`
- §10.3 L1568-1570 → `finance:fee_item:{read, create, update}`
- `apps/api/prisma/seed.ts` L550, L556 register exactly `['read', 'create', 'update']` for both

So the grant is **+6 grants**, taking BURSAR from 14 to **20 Finance grants**.

**ADR-037 reconciliation was required and has been performed** — see §3.1.

#### D-7 Q8 — Guard ownership

**Answered:**

| Guard | Owner | Recorded constraint |
|---|---|---|
| `FinanceAccessGuard` | **Finance** | Existing service-level Finance access logic may remain **where it correctly enforces relational Finance ownership**, but the final implementation **must not create a fail-open path** |
| `ModuleLicenseGuard` | **Institution Management — not Finance** | |
| `FinancialAuthorityGuard` | **Finance** | |
| `ImmutabilityGuard` | **Finance** | |

**Database constraints** are to be used for true data invariants where appropriate, and are **not** a substitute for authorization guards.

The owner explicitly stated: **do not implement the guards in this task.** No guard was created or modified.

#### D-7 — what remains explicitly **not** decided

D-7 Q1 explicitly declines a delegation/threshold **data capability** as a role model. The threshold itself remains a `FinancialPolicy` value (P-08), which is a policy lookup, not a delegation record. No conflict.

---

### 2.2 FINANCE D-8 — Rounding / quantisation

#### D-8 Q1 — Rounding mode

**Answered: half-up.** Finance monetary rounding is **half-up**.

#### D-8 Q2 — Quantisation point

**Answered: Option 1.** One **canonical quantisation helper** is applied at the defined persisted-document boundary. Individual Finance services must not invent their own rounding behaviour. The mode and the quantisation point must be represented consistently in `FinancialPolicy` / documentation.

*No repository file contains any rounding, quantisation, residue, or mode language* (verified: zero matches for `rounding|quantis|half-up|half-even|residue` across all 1938 lines of `engineering/Finance Engineering.md`). D-8 therefore **adds** a rule; it does not overturn an existing one.

#### D-8 Q3 — Intermediate steps

**Answered: quantise each intermediate monetary step** according to the canonical Finance quantisation rule. Unrounded intermediate values must not produce inconsistent totals. Discount/tax calculation order remains **deterministic** and uses canonical half-up quantisation at the defined calculation boundary. No second rounding convention for individual services.

#### D-8 Q4 — Residue reconciliation

**Answered: explicit residue reconciliation.** The `invoice → payment → allocation → journal` chain must reconcile sub-cent residue deterministically so that:

1. allocation never exceeds outstanding balance;
2. the final allocation can close the outstanding balance correctly;
3. journal debits equal journal credits;
4. persisted Finance amounts remain consistent with the canonical quantisation rule.

Residue must **not** be silently discarded.

#### D-8 — separation from aggregate limits

D-8 is **rounding/quantisation only**. It does **not** resolve `Decimal(14,2)` aggregate overflow, and it does not supply any maximum value. See §2.3 and §4. Rounding and aggregate limits are recorded in two separate, explicitly cross-referenced specification sections (§6.5.1 and §6.5.2).

---

### 2.3 UNNUMBERED — Aggregate document-total limit

This is a **separate specification decision** from D-8.

#### Q1 — Mechanism

**Answered: Finance will have explicit configurable limits** for:

- maximum amount per line item;
- maximum number of line items per document;
- maximum total amount per document;

and **these limits are `FinancialPolicy` values** (Q3).

**Numeric defaults were deliberately not supplied by the owner**, who directed: record the exact initial numeric limits as configuration defaults *only if the existing specification already supplies them*; otherwise SAFE-STOP that specific question rather than inventing numbers. **No authoritative source supplies them** — see §4.1. The three values are therefore recorded as an **open implementation prerequisite requiring explicit values**, and **no number has been invented**.

#### Q2 — Overflow behaviour

**Answered: reject the document when a limit is exceeded**, returning a validation / business-rule error. Explicitly **not** permitted: clamping, silent saturation, automatic splitting, or widening the database column as a workaround.

#### Q3 — Location

**Answered: `FinancialPolicy` rows**, in the versioned Finance policy mechanism. The mechanism already exists: `FinancialPolicy` (`finance.prisma` L412-437) is versioned (`version`), lifecycle-bearing (`PolicyStatus` = `DRAFT | ACTIVE | SUPERSEDED`, L423), and uniquely keyed per `(tenantId, institutionId, policyType, policyKey, version)` (L433). The same shape already bounds max discounts per invoice (P-12, 1–5) and max installment count (P-13, 2–24). **The gap is three missing policy rows, not a missing mechanism.**

---

### 2.4 FINANCE D-2 — Financial configuration ownership

#### D-2 Q1 — Ownership

**Answered: Option 1 — Finance owns the values** for all six concepts:

settlement currency · tax rules · invoice numbering · late-fee/penalty rules · gateway enablement · gateway credentials

**Gateway credentials must never be stored in the institution configuration JSON namespace.** This is consistent with, and reinforces, the existing `Finance Engineering.md` §12.4 requirements ("keys encrypted at rest", "Secret keys are never exposed in API responses") and with Institution Management ADR-031.

**This resolves the D-2 conflict at the specification level.** The frozen Finance specification listed "Institution configuration" in its **Out of Scope** line (L48) while listing "configurable financial policies (currency, tax, numbering, penalties)" in **In Scope** (L46). The owner has now ruled that the *concept ownership* is Finance's. The Out-of-Scope line is therefore **confirmed, not contradicted**: it excludes Institution configuration as a *Finance-owned capability surface*, which is consistent with Finance owning the financial configuration values. No clause required rewriting; the ambiguity is resolved by the recorded answer.

#### D-2 Q2 — The `financial.*` namespace

**Answered: retain `financial.*` in `institution_configurations` as a read-only projection, not an authoritative source.** Finance is authoritative for Finance-owned financial configuration.

This is compatible with the existing write-path rejection: `institution_configurations` and `institution_settings` already **reject** the `financial.*` namespace at the write path (`Institution Management Engineering.md` L1008-1009; `apps/api/src/modules/institutions/reserved-config-namespaces.ts` L31 reserves `financial`), so the namespace cannot become a second writer. **No code change is required or made.**

---

### 2.5 FINANCE D-3 — Canonical settlement currency

**ADR-036 (terminology) is preserved unchanged.** The owner decided the *storage* question that ADR-036 deliberately left open; ADR-036's terminology lock is not reopened, and its "terminology-only" scope statement remains true of ADR-036 itself. A resolution note has been added recording that the storage question is now answered.

#### D-3 Q1 — Authoritative field

**Answered: Option 2.** A **`FinancialPolicy` currency row per institution is authoritative**. `Institution.currency` is retained for **display / compatibility only**. There must **not** be two independent authoritative writers.

#### D-3 Q2 — `Institution.currency` writability

**Answered: No.** `Institution.currency` must **not** remain independently writable as an authoritative Finance value.

#### D-3 Q3 — The "fixed after first invoice" check (BR-015 / ADR-020)

**Answered: the Finance-owned currency policy write path performs the check**, and it must occur **against the authoritative Finance/invoice history state**, not merely against a client-provided field.

This closes the inference recorded in the decision brief (`PHASE_6_DECISION_BRIEF.md` L324-327) that a policy supersession and a column update could diverge silently: the check reads Finance's own invoice history, so a client-supplied `Institution.currency` value cannot influence it.

#### D-3 Q4 — Relationship between policy and column

**Answered: `FinancialPolicy` supersedes `Institution.currency`** as the authoritative settlement-currency source. The policy remains subject to its existing lifecycle `DRAFT → ACTIVE → SUPERSEDED`. The effective settlement currency becomes **immutable for an institution once its first invoice has been issued**. A later policy version must **not** silently change historical invoice currency.

**Lifecycle applicability — verified, not assumed.** `FinancialPolicy.status` uses the shared `PolicyStatus` enum, which already carries exactly these three values (comment at `finance.prisma` L409-411: "§8's `PolicyStatus` (DRAFT, ACTIVE, SUPERSEDED)"). No new lifecycle is introduced.

---

### 2.6 FINANCE D-4 — Event contract

#### D-4 Q1 — Naming convention

**Answered: Option 1 — adopt the runtime event naming as-is.** Finance maintains an **explicit event-name mapping** where source modules use different conventions. The **12 Finance event strings are not renamed** merely to normalise naming.

#### D-4 Q2 — Envelope

**Answered: keep the existing `emittedAt` envelope.** `eventVersion` / `occurredAt` are **not** added in this batch. The locked Phase 5 shared-`eventId` / audit-dedup contract is **not** broken. The Phase 5 event envelope decision (`apps/api/src/modules/events/event-envelope.ts`) is **unchanged**.

#### D-4 Q3 — Conflicting consumer ownership

**Answered: the authoritative source module's frozen event contract governs the event actually emitted.** Finance maintains a mapping rather than inventing a second competing event name.

#### D-4 Q4 — Billing trigger names

**Answered: amend Finance's trigger mapping / documentation to use the existing Academics event names.** Academics is **not** made to emit duplicate Finance-specific aliases solely for Finance.

#### D-4 Q5 — `PersonMerged` / `PersonSoftDeleted`

**Answered: Yes**, Finance must handle them where they affect financial identity/history. Financial history must remain intact; accounting history must **not** be rewritten merely because two Persons merge. The canonical identity/merge mechanism maintains current identity linkage.

**Explicit owner instruction honoured:** where the repository does not establish the exact merge-record representation, it is **not invented** here. Verified absent — `people.prisma` has no `PersonMerge`, `mergedInto`, `mergeRecord`, or `duplicateOf` field; the only `sourcePersonId` (L626) belongs to `PersonRelationship`. The events are named in `engineering/People Engineering.md` (L411 `PersonMerged`, L381 `PersonSoftDeleted`) but **no runtime emitter and no merge model exist**. Recorded as open item **B** (§1.1) and flagged for the implementation batch (§5.3).

#### D-4 Q6 — Applicant acceptance

**Answered: No.** Applicant acceptance / `StudentEnrolled` does **not** trigger billing unless the Finance billing specification explicitly establishes it as a trigger. No billing behaviour is added on the basis of that event alone.

---

### 2.7 FINANCE D-6 — Payment / refund ownership

#### D-6 Q1 — Sole ownership

**Answered: Option 1 — Finance is the sole authoritative owner** of payment and refund state. People / Academics payment and refund fields become **read-only projections**. Client-controlled writes to those authoritative states must be removed.

#### D-6 Q2 — Remediation authorisation

**Answered: Yes — explicitly authorised.** A remediation pass against completed **Phase 4 (People)** and **Phase 5 (Academics)** code is authorised. Those phases are **not** to be treated as immutable in a way that preserves a known Finance payment/refund security bypass.

*Authorisation only — no remediation is performed in this task.*

#### D-6 Q3 — Canonical refund vocabulary

**Answered:**

`REQUESTED` · `APPROVED` · `REJECTED` · `PROCESSED`

No second canonical refund vocabulary is introduced. This matches the frozen specification, which already states this vocabulary in three places (§5.6 L405, V-REF-05 L766, §7.2 `refund_status` L1094, §8 L1316). D-6 therefore **confirms** the frozen vocabulary rather than changing it.

#### D-6 Q4 — `DENIED`

**Answered: map `DENIED` → `REJECTED`.** People's existing `DENIED` state becomes a **projection / mapping concern**, not a second Finance canonical state. Two competing canonical refund workflows are not retained.

*Mapping only — no code, DTO, or schema change is made in this task. The live field `StudentWithdrawalDetail.refundStatus` is `String?` (`schema.prisma` L3104).*

---

### 2.8 FINANCE D-12 — Legacy Finance table disposition

#### D-12 Q1 — Disposition

**Answered: Option 1 — archive all five legacy tables and create the frozen Finance tables fresh.** Affected legacy models: `FeeStructure`, `Invoice`, `Payment`, `Scholarship`, `Refund`. **In-place `ALTER` is not used.**

#### D-12 Q2 — Seeded records

**Answered: retain** the six seeded invoices and three seeded fee structures **in the archive**. Historical/seeded records are not discarded.

#### D-12 Q3 — Precision widening

**Answered: Yes.** Because the legacy tables are archived/replaced rather than altered in place, `Decimal(10,2)` → `decimal(14,2)` widening is **not required** on those archived tables. The new Finance tables use the frozen/current precision requirements.

#### D-12 Q4 — Historical columns

**Answered: do not silently discard historical Finance-owned columns or data.** Archive the legacy data **intact** unless an explicit data-classification rule already authorises deletion. New active Finance tables contain **only** the current frozen schema.

#### D-12 Q5 — `NOT VALID` constraints

**Answered: the five `NOT VALID` legacy foreign-key constraints must not be carried into the replacement Finance schema.** As part of D-12 implementation, remove/archive obsolete legacy constraints as appropriate and create **valid** constraints for the new active Finance schema.

**FINANCE D-13 remains downstream of D-12 and is not invented in this task.** The D-13 disposition decision stays open (open item **E**).

---

### 2.9 FINANCE D-5 — Conditional

**Answered: staff-only.** For the current product requirement, Phase 6 exposes invoice access to staff only. D-5 therefore remains **off the critical path**. No non-student invoice access and no payment initiation is to be implemented.

This is consistent with the frozen specification, which places the parent payment portal in Future (§14 Outstanding Items, "Low | Parent payment portal | Future") and names no "payer" concept.

---

### 2.10 FINANCE D-1 — Expenses

**Not decided. Deferred**, as previously scoped. A leaf with no blocking dependents. No Finance decision in this record depends on it. Unchanged from the prior state.

---

## 3. EXACT CONTRADICTIONS RESOLVED

### 3.1 ADR-037 vs D-7 Q7 — **ADR-037 reconciliation was required**

**The contradiction.** `engineering/Finance Engineering.md` stated, in two places, that the fee-structure catalogue was **explicitly outside ADR-037 and undecided**:

- §2 *Finance Role Permissions* L137-141 — under the heading "**Explicitly outside ADR-037.** The following are *not* decided here…":
  `- finance:fee_category and finance:fee_item - the fee-structure catalogue, governed separately`
- §3 ADR table, ADR-037 rationale — "…leaves `finance:fee_category` / `finance:fee_item`, refund and write-off authority, financial-period approval authority, and every other D-7 approval-authority question **undecided**"
- §15 Revision History 1.7.0 — same "remain undecided" statement

ADR-037 also stated (L131) that `BURSAR` receives no `finance:payment` permission and, in its title row, that `BURSAR` receives the three billing resources — an exhaustive-sounding 14-grant list.

**The owner's decision resolves it.** D-7 Q7 grants `BURSAR` the fee-category and fee-item permissions, and instructs: *"If this creates an actual contradiction with ADR-037's exhaustive 14-grant wording, update ADR-037 explicitly to record the owner's new decision rather than silently changing the seed."*

**It did create a direct contradiction.** The two L140 / L247 statements place the exact two resources in the "undecided / outside ADR-037" list, while Q7 decides them.

**Resolution applied — documentation only.** ADR-037 is **preserved** (its decision row, its billing grants, and its payment-exclusion are unchanged) and a **clarifying amendment is recorded on top of it** stating that D-7 Q7 grants `BURSAR` `finance:fee_category:{read, create, update}` and `finance:fee_item:{read, create, update}`, that the exception is **not** generalised to other admin-only resources, and that BURSAR's payment exclusion and lack of general Finance admin authority are unchanged. The three "undecided / outside ADR-037" statements have been corrected to reference the now-decided answer. **The seed was not touched** — it still carries the original 14 BURSAR grants, and the delta is recorded as a required, not-yet-applied change.

### 3.2 Full contradiction map

| # | Contradiction | Where | Resolved by | How recorded |
|---|---|---|---|---|
| 1 | ADR-037 places `finance:fee_category` / `finance:fee_item` **outside ADR-037 and undecided**; D-7 Q7 grants them to BURSAR | `Finance Engineering.md` L140, L247, L1933 (rev 1.7.0) | **D-7 Q7** | ADR-037 clarification added; the three statements corrected. Seed untouched. |
| 2 | ADR-037's role/period/payment authority questions recorded as **undecided**; D-7 Q2/Q5/Q6 decide them (admin-only, admin-only, admin-only) | `Finance Engineering.md` L142-145, L247 | **D-7 Q2, Q5, Q6** | Corrected to record the decided answers |
| 3 | Refund/write-off authority and self-approval recorded as **undecided**; D-7 Q3/Q4 decide them | `Finance Engineering.md` L142, L247 | **D-7 Q3, Q4** | Recorded in §2 role permissions; threshold P-08 confirmed; self-approval comparison recorded |
| 4 | §9.5 lists 7 guards with **no ownership**, including `ModuleLicenseGuard` presented inside the Finance spec; D-7 Q8 assigns ownership | `Finance Engineering.md` L1435-1438 | **D-7 Q8** | Ownership column added; `ModuleLicenseGuard` marked Institution Management–owned |
| 5 | **No rounding or quantisation rule exists anywhere** in the frozen spec (zero matches for rounding/quantisation/residue across 1938 lines) while every monetary column is `decimal(14,2)` and I-04 requires balanced entries | `Finance Engineering.md` §7.2, I-04 | **D-8 Q1-Q4** | New §6.5.1 *Rounding and Quantisation* added |
| 6 | **No maximum-value rule exists** for line amount, line count, or document total, so `decimal(14,2)` overflow has no specified behaviour | `Finance Engineering.md` §7.2, §6.5 | **UNNUMBERED Q1-Q3** | New §6.5.2 *Aggregate Monetary Limits* added; **numeric defaults left open, none invented** |
| 7 | Finance §1 lists "Institution configuration" as **Out of Scope** (L48) while requiring Finance to own currency/tax/numbering/penalties (L46); two frozen specs claim the same configuration surface | `Finance Engineering.md` L46, L48; brief D-2 §D | **D-2 Q1** | Ownership recorded as Finance's. The Out-of-Scope line is **confirmed, not contradicted** — it excludes the Institution capability surface, not Finance's ownership of the values |
| 8 | `institution_configurations` could hold a `financial.*` key and a `FinancialPolicy` row with **divergent values**, nothing detecting it; `financial.*` is ordinary readable configuration and cannot hold encrypted gateway secrets | Brief D-2 §D; `Institution Management` L992, L1008; `institution-settings.service.ts` L90-157 | **D-2 Q1, Q2** | `financial.*` recorded as a **read-only projection**; Finance authoritative; gateway credentials never in the JSON namespace. Existing write-path rejection already enforces the projection property — no code change needed |
| 9 | **Four on-disk currency homes**; no document names the authoritative one, making BR-015 / I-13 ("currency fixed after first invoice") unimplementable | `institution.prisma` L72; legacy Finance tables; `schema.prisma`; `Finance Engineering.md` I-13, V-INV-07 | **D-3 Q1-Q4** | `FinancialPolicy` currency row recorded as authoritative; `Institution.currency` display/compatibility only and not independently writable; V-INV-07 and I-13 updated to name the authoritative source and the check location |
| 10 | ADR-036 and revision 1.3.0 state the **disposition of `Institution.currency` "remains an open D-3 implementation decision"** | `Finance Engineering.md` L109, L246, L1929 | **D-3 Q1, Q2** | Resolution note added. **ADR-036's terminology lock itself is unchanged**; only the "still open" status of the storage question is updated |
| 11 | `Institution Management` L1012-1014 states settlement-currency storage and the `institution.currency` disposition are **"not decided here"** and remain open D-3 questions | `Institution Management Engineering.md` L1012-1014 | **D-3 Q1, Q2** | Noted. **This document is not edited** — it is a different domain's frozen specification, and it remains *accurate as written* because it says the question is not decided **there**, which is still true. The Finance register now holds the answer. |
| 12 | **Two event naming conventions live in the codebase** (PascalCase for People, dotted for Academics) while §9.6 states `{Entity}{PastTenseVerb}` and Finance's own 12 events use a third (dotted) form; Finance has 12 producers and 0 consumers | `Finance Engineering.md` L1447; `finance.events.ts`; brief D-4 §D | **D-4 Q1** | Runtime naming adopted as-is; explicit Finance event-name mapping required; the 12 Finance event strings are not renamed |
| 13 | The envelope would need `eventVersion` / `occurredAt`, which would **amend a locked Phase 5 decision** and invalidate shared-`eventId` audit dedup | `event-envelope.ts`; brief D-4 §D | **D-4 Q2** | Existing `emittedAt` kept; Phase 5 envelope unchanged |
| 14 | Finance names `StudentClassEnrolled` / `StudentClassTransferred` as billing triggers; **no runtime event of either name exists** | `Finance Engineering.md` §5.8; brief D-4 §D | **D-4 Q4** | Finance trigger mapping amended to Academics event names; Academics emits no Finance aliases |
| 15 | Finance and People name different consumers for the same events (`StudentGraduated`, `StudentWithdrawn`) | Brief D-4 §D | **D-4 Q3** | Source module's frozen contract governs; Finance maintains a mapping |
| 16 | `PersonMerged` / `PersonSoftDeleted` affect financial identity but **no merge model exists** | `People Engineering.md` L381, L411; `people.prisma` | **D-4 Q5** | Handling required; representation **not invented**; flagged as open item **B** |
| 17 | Applicant acceptance emits `StudentEnrolled`, which is **not named as a billing trigger** in either the Finance event table or the People consumer tables | `Finance Engineering.md` §5.8/§9.6 | **D-4 Q6** | Recorded as **not** a billing trigger |
| 18 | **Two live bypasses**: `students.service.ts` writes withdrawal `refundStatus`; `summer-school.service.ts` writes free-text `paymentStatus`; roadmap requires payment state not be trusted from the client (P6.3) | `students.service.ts`; `summer-school.service.ts`; `academic-admin.dto.ts` | **D-6 Q1, Q2** | Finance recorded as sole owner; fields become read-only projections; **remediation explicitly authorised** (not performed) |
| 19 | Canonical refund vocabulary conflict: frozen `REQUESTED/APPROVED/REJECTED/PROCESSED` vs People's live `PENDING/PROCESSED/DENIED`; legacy `Refund` **reuses `PaymentStatus`**, which cannot express the workflow; no `RefundStatus` enum exists | `Finance Engineering.md` L405, L766, L1094, L1316; `schema.prisma` L206-211, L3104 | **D-6 Q3, Q4** | Frozen vocabulary confirmed as the single canonical set; `DENIED` → `REJECTED` as a projection mapping; no second vocabulary |
| 20 | The spec-conformant `Invoice` / `Payment` / `Refund` tables **cannot be created** while the legacy tables occupy the frozen names; `DiscountApplication` blocked for the same reason | `finance.prisma` (22 models); brief D-12 | **D-12 Q1** | Archive-all-five + create-fresh recorded; `ALTER` not used |
| 21 | `Decimal(10,2)` → `decimal(14,2)` widening question is moot once the tables are replaced | Brief D-12 | **D-12 Q3** | Recorded as not required on archived tables |
| 22 | Five `NOT VALID` FK constraints, four on Finance tables, would be **carried into** a replacement schema | Brief D-13; D-12 | **D-12 Q5** | Must not be carried forward; valid constraints created for the new schema; D-13 kept downstream and undecided |
| 23 | Legacy seeded data (3 fee structures, 6 invoices) risked **discard** during archive | `seed.ts` L1344-1351, L1352-1368 | **D-12 Q2** | Retained in the archive |
| 24 | Legacy Finance-owned columns risked **silent discard** during archive/replacement | Brief D-12 | **D-12 Q4** | Archived intact absent an explicit data-classification rule; new active tables hold only the frozen schema |
| 25 | A `parent/fees` prototype with a pay action exists, so the payer surface was ambiguous | `parent/fees/page.tsx`; brief D-5 | **D-5** | **staff-only**; D-5 off the critical path |

---

## 4. AGGREGATE-LIMIT NUMERIC DEFAULTS — THE ONE BOUNDED OPEN ITEM

### 4.1 Verification that no authoritative numeric defaults exist

Searched the authoritative Finance specification and the repository for any supplied value:

| Source searched | Result |
|---|---|
| `engineering/Finance Engineering.md` §6.5 Configurable Policies (P-01 … P-20, L642-663) | **No policy row for max line amount, max line count, or max document total.** P-12 bounds *max discounts per invoice* (1–5) and P-13 bounds *installment max count* (2–24) — different concepts |
| `engineering/Finance Engineering.md` §6.6 Validation Rules (V-*) | **No rule states a maximum monetary amount** for a line item, and no rule bounds line-item count. V-ILI-03 is "Amount: required, decimal" with no ceiling; V-FI-03 is "decimal ≥ 0" with no ceiling |
| `engineering/Finance Engineering.md` §6.4 Aggregate Invariants (I-01 … I-30) | No maximum-value invariant. I-01/I-02/I-03 are arithmetic bounds, not value ceilings |
| `engineering/Finance Engineering.md` §7.2 Column Catalogue | `decimal(14,2)` appears as a **storage** type on 34 columns. This is a **storage** ceiling, **not** a business limit |
| Search for `9999999`, `max_line`, `max total`, `maximum amount`, `per line item`, `line_count`, `document total` | **No matches** |
| `MASTER_SMS_ROADMAP.md`; decision brief; owner pack §10.4 | No numeric default supplied |

**Conclusion: no authoritative numeric default exists.** The `Decimal(14,2)` column maximum has **not** been adopted as the business limit, and no number has been inferred from it.

### 4.2 How this is recorded

Per the owner's instruction, the **mechanism is recorded as decided** and the **numeric values are recorded as an implementation prerequisite requiring explicit values**:

- The three limits are `FinancialPolicy` rows, in the existing versioned policy mechanism.
- Exceeding any limit **rejects the document** with a validation / business-rule error.
- **No default value is stated, implied, or seeded.** The policy rows must be created with owner-supplied values.
- Any implementation that reaches this code path before values are supplied **must fail closed** and must not substitute a number.

### 4.3 Scope of the open item

This is the **only** owner decision that is not fully closed. It is **bounded and non-blocking** for the rest of the batch: the mechanism, the location, and the overflow behaviour are all decided, so the implementation can build and wire the policy lookup. What is missing is three values, which is a configuration prerequisite, not an architectural ambiguity.

---

## 5. FLAGGED FOR THE FINAL IMPLEMENTATION BATCH

Documentation-only observations for whoever writes the implementation prompt. **No decision is made here.**

### 5.1 Guards (D-7 Q8) — not implemented by instruction

`FinanceAccessGuard`, `FinancialAuthorityGuard`, and `ImmutabilityGuard` are Finance-owned and **absent** from the repository. `ModuleLicenseGuard` is Institution Management–owned and also absent. §9.5 currently lists 7 guards; none of the 4 is implemented. The owner instructed that the guards are **not** implemented in the documentation task.

### 5.2 Seed delta (D-7 Q7) — not applied

`apps/api/prisma/seed.ts` L929-934 still grants `BURSAR` the original 14. The recorded decision requires **+6** grants (`finance:fee_category` and `finance:fee_item` × `read, create, update`), taking the total to 20. The seed was **not** modified, as instructed. The implementation batch must apply it, and must not silently change the seed in a way that obscures the ADR-037 amendment.

### 5.3 `PersonMerged` handling (D-4 Q5) — representation not established

Both events are named in `engineering/People Engineering.md` (L381, L411) but **neither has a runtime emitter** and **no merge model exists** in `people.prisma`. Finance must handle these events and must not rewrite accounting history, but the repository does not establish the merge-record representation. The implementation batch must use the canonical identity linkage available at that time and must not invent a merge schema as a side effect of the Finance work.

### 5.4 Refund request permission name (D-7 Q3) — action name to confirm

The repository registers refund actions as `read`, `create`, `approve` — there is **no `request` action**. D-7 Q3 decides the request/approval **split** but does not name the request-side permission. The implementation batch must confirm the action name against §10.3 before adding any permission row. No permission is added in this task.

### 5.5 Live bypasses to remediate (D-6 Q1, Q2) — authorised, not performed

Two client-writable financial state fields remain writable:

| Field | Location | Writer |
|---|---|---|
| `StudentWithdrawalDetail.refundStatus` (`String?`) | `apps/api/prisma/schema.prisma` L3104 | `apps/api/src/modules/people/students.service.ts`; validated as free text by `apps/api/src/modules/people/dto/student.dto.ts` |
| Summer School `paymentStatus` (free text) | Academics | `apps/api/src/modules/academics/services/summer-school.service.ts`; caller-controlled via `apps/api/src/modules/academics/dto/academic-admin.dto.ts` |

Remediation is **explicitly authorised** by D-6 Q2. **None was performed.**

### 5.6 Pre-existing §4.1 discrepancies — unchanged

The 11 entries in `engineering/Finance Engineering.md` §4.1 are **untouched** by these decisions. In particular, entries 1, 2, 6, 7, 8, and 9 (module count, table count, `fee_structures` basis, enum placement, `invoices.currency` absence, the "2-pass check" statement) are **not** resolved by any recorded Finance decision. Entry 8 is *partially* informed by D-3 Q1 — the authoritative currency source is now named — but the `Invoice.currency` **field itself is still absent** from the model, which is a schema question the owner did not decide and which D-12's table-replacement will resolve as a consequence, not as a separate decision.

---

## 6. READ-ONLY FINAL IMPLEMENTATION READINESS REVIEW

### 6.1 Which decisions are now fully resolved

| Decision | State |
|---|---|
| FINANCE D-7 (all 8 questions) | **Fully resolved** |
| FINANCE D-8 (all 4 questions) | **Fully resolved** |
| FINANCE D-2 (both questions) | **Fully resolved** |
| FINANCE D-3 (all 4 questions) | **Fully resolved** |
| FINANCE D-4 (all 6 questions) | **Fully resolved** |
| FINANCE D-6 (all 4 questions) | **Fully resolved** |
| FINANCE D-12 (all 5 questions) | **Fully resolved** |
| FINANCE D-5 | **Fully resolved (staff-only)** — off the critical path |
| UNNUMBERED aggregate limit | **Mechanism, location, and behaviour resolved. Numeric defaults open.** |
| FINANCE D-1 | Deferred — not required |

### 6.2 Does any documentation contradiction remain

**No, for every decision in scope.** All 25 identified contradictions are recorded in §3.2 with their resolution. One cross-document note is recorded (row 11): `engineering/Institution Management Engineering.md` L1012-1014 still says the currency-storage question is undecided — that statement remains **true as written**, because it says the question is not decided *in that document*, and it is not edited here. It is not a contradiction, and editing another domain's frozen specification is out of scope.

### 6.3 Is any owner decision still genuinely unresolved

**One, and it is narrow.** The three aggregate-limit **numeric defaults** (max line amount, max line count, max document total). Everything else is answered. This is a value-supply prerequisite, not an open architectural question, and the owner explicitly anticipated it.

Two further items are **implementation details the owner explicitly declined to invent** (§1.1 B and C) and are flagged, not unresolved decisions.

### 6.4 Are the aggregate-limit numeric defaults available

**No.** See §4.1 for the verification. No authoritative source supplies them, and none has been invented or inferred from `Decimal(14,2)`.

### 6.5 Can the final Finance implementation batch be written safely

**Yes, with one bounded prerequisite stated up front in the implementation prompt.**

Every blocking decision is answered. The dependency order from the prior analysis is now fully determined and no longer has open inputs:

- **D-12** (archive five legacy tables, create frozen tables fresh) is the critical path and gates D-8 implementation and D-6.
- **D-8** must precede the D-12 replacement columns so the arithmetic is right.
- **D-2 → D-3** are settled in that order; D-3 does not gate D-12.
- **D-7** unblocks the guards, refund approval, and write-off authority, and gates D-6's approval path.
- **D-6** has remediation authorised against People and Academics.
- **D-4** leaves the event envelope and all 12 Finance event names untouched, so it constrains but does not expand the batch.

**The one prerequisite:** the implementation prompt must state that the three aggregate-limit values are owner-supplied configuration and that the code must fail closed until they exist, rather than proceeding as though a value were known.

---

## 7. FINAL STATUS

**READY FOR FINAL FINANCE IMPLEMENTATION PROMPT**

with one bounded open item carried forward as an explicit prerequisite rather than a blocker:

> **SAFE-STOP (scoped) — aggregate-limit numeric defaults.** Max line-item amount, max line-item count per document, and max document total must be supplied by the owner as `FinancialPolicy` values. The mechanism, storage, and rejection behaviour are decided; **the three numbers are not**, and no value has been inferred from `Decimal(14,2)`. The implementation must fail closed on this path until values are supplied.

Two implementation details were explicitly declined for invention and are flagged for the batch: the `PersonMerged` merge-record representation (§5.3) and the refund request-permission action name (§5.4).

**No code, Prisma schema, migration, controller, service, DTO, guard, People implementation, Academics implementation, or test was created, modified, or deleted. Nothing was committed. Register-B was not modified.**
