# D-3 - Decision-Readiness Investigation

| Field | Value |
|---|---|
| **Decision** | D-3 - tie-break for a self-contradictory detail section |
| **Register** | Counting & status convention register, `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md` §8 (D-1 … D-10) |
| **Method** | Investigation only. No option selected, no convention adopted, no count corrected, no specification, roadmap, source file, schema, migration, test or configuration modified |
| **Prior decisions** | D-1 `docs/DECISION_D1_SPECIFICATION_AUTHORITY.md` (undecided, 5 models). D-2 `docs/DECISION_D2_COUNTABLE_UNITS_AND_GRANULARITY.md` (undecided, safe-stop) |
| **Result** | **SAFE-STOP.** Not decidable from existing evidence. Two governance decisions are missing before any option can be chosen, and the governing question itself is not yet delimited |
| **Files changed** | None. This report is the only artefact created |

---

## Evidence legend

Every substantive statement below is tagged so that the reader can tell what kind of claim it is.

| Tag | Meaning |
|---|---|
| `[RULE]` | An existing rule that is actually written down and binding today |
| `[REQ]` | A documented requirement in a frozen specification |
| `[DEF]` | A de-facto convention - practice that exists in artefacts but is stated nowhere as a rule |
| `[IMPL]` | Implementation / repository evidence |
| `[INFER]` | An inferred possibility, not established by evidence |
| `[OPEN]` | An unresolved decision or unresolved question |
| `[CONFLICT]` | Evidence that contradicts another claim in this report or in a prior document |

---

## 1. Executive conclusion

**D-3 cannot be decided from existing repository or specification evidence. SAFE-STOP.**

Six findings, each independently verified against the specifications and the repository:

1. **D-3's definition is not unique.** The label "D-3" is used by **four** different decision registers in
   this project for **four unrelated questions** (§2.2). The register that governs this investigation is
   the counting & status convention register; its D-3 is *"when a detail section contradicts itself,
   which sub-part wins"*. D-1 and D-2 collide in the same way.
2. **The governing register is not under version control.** `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md`
   is **untracked** by git, is **not listed** in `engineering/00 README.md`, and is **not referenced** by
   `engineering/ROADMAP.md` or `MASTER_SMS_ROADMAP.md`. The only place D-3 is defined is an uncommitted
   working-tree document. `[CONFLICT]`
3. **The question is not delimited.** The register's own two examples straddle the D-1 boundary
   (`~18` is a §4 summary figure, `48 total` is a section heading; `126` vs `~350+` is genuinely
   intra-detail), and its own evidence base is internally inconsistent about scope: §5.2 says
   *"Three specifications"* in prose and lists **six** conflicts across **five** specifications in the
   table immediately below, while the §8 D-3 row says *"6 of 10 specs affected"*. `[CONFLICT]`
4. **The evidence base inherited from D-1 is both over- and under-inclusive.** Of D-1's "six confirmed
   cases" of self-contradictory detail (§5.1), only **3** are intra-detail by the register's own wording;
   **2** are summary-vs-detail cases that belong to D-1. Conversely, this investigation found **6**
   specifications with a genuine intra-detail contradiction, of which D-1 listed only 3 (§5.1, §5.2). `[CONFLICT]`
5. **No candidate sub-part wins across the evidence.** The enumerated rows are exact but, in the test
   tables, are *unsourced per-category estimates* rather than enumerations. The `Total` row is correct in
   **4 of 10** test tables and wrong in 6, but correct in **2 of 3** Phase 6 summary tables and wrong in 1.
   The section heading is refuted **2 for 2** where it states a total. No single rule survives both classes
   (§4, §8.2).
6. **D-2's undecided status blocks part of D-3 and not all of it.** For the heading-vs-body class
   (Operations §8.2, D&L §8.2) the two conflicting artefacts are enumerations *of the same kind*, so the
   tie-break is evaluable today without knowing what a "model" is. For the test-scenario class it is not:
   the "rows" there are estimates, so "the rows win" is not a well-formed instruction until D-2 fixes the
   unit (§9).

**What is missing:** (a) a **scoping decision** - which of the four contradiction classes D-3 owns and
which D-1 owns; and (b) the **tie-break itself**, per class, taken by a named owner. Neither can be
derived from evidence, because every candidate rule requires an authority claim that no document in the
project supports (§7).

---

## 2. Exact D-3 decision statement

### 2.1 The register's wording

`[REQ]` The counting & status convention register, `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md:693`:

> **D-3** - When a **detail section contradicts itself** (Operations `~18` vs `48 total`; Identity 126 vs
> `~350+`), which sub-part wins - the enumerated rows, the `Total` row, or the section heading?
> *Why it cannot be inferred:* §5.2 - 6 of 10 specs affected; no rule exists.
> *Blocking:* **Yes** - blocks the authority rule from being executable.

`[RULE]` The register's own candidate project-wide convention, which D-3 would complete, is stated at
`:604-607` and assessed at `:611-680`:

> *"Summary counts are derived from the authoritative detailed section they summarize; where summary and
> detail disagree, the discrepancy must be recorded rather than silently choosing a number."*

The register's assessment of clause 1 explicitly names D-3 as one of the three definitional gaps that
must be filled before the convention is applicable: *"(b) how to handle a self-contradictory detail
section"* (`:643-645`).

`[REQ]` D-1 restates the dependency: *"The tie-break applies **within** the section D-1 designates. D-1
cannot specify the tie-break because it does not know which section is authoritative"*
(`docs/DECISION_D1_SPECIFICATION_AUTHORITY.md:707`), and *"Any model adopted must be paired with D-3, or
must itself contain an intra-section tie-break"* (`:634-636`).

### 2.2 The label "D-3" is ambiguous in this project

`[CONFLICT]` Four separate registers use the identifier D-3 for four unrelated questions. Verified:

| Register | Document | D-3 subject | Status |
|---|---|---|---|
| **Counting & status convention** | `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md:693` | Self-contradictory detail tie-break | **Open - this investigation** |
| Phase 6 financial | `docs/PHASE_6_DECISION_BRIEF.md:263-269` | Canonical currency - which field is the authoritative institution settlement currency (class: **BLOCKING**) | Terminology locked by ADR-036; value home open; already investigated in `docs/PHASE_6_D3_CURRENCY_INVESTIGATION.md` |
| Phase 5 academic | `docs/PHASE_5_SCOPE_VERIFICATION_REPORT.md:235`, `docs/PHASE_5_MIGRATION_REPORT.md:175` | Canonical academic-calendar / Department owner across two frozen specs | Resolved by migration (Department moved to Academic) |
| Phase 3 platform | `docs/PHASE_3_IMPLEMENTATION_REPORT.md:1,24` (`D3 / P3.7`) | Redis health readiness | Implemented |

The same collision affects **D-1** (`audit:691` = authority rule; `PHASE_6_DECISION_BRIEF.md:35` =
Expenses; `PHASE_5_SCOPE_VERIFICATION_REPORT.md:233` = legacy academic table disposition) and **D-2**
(`audit:692` = countable unit; `PHASE_6_DECISION_BRIEF.md:137` = financial configuration ownership,
already implemented per `docs/PHASE_6_D2_IMPLEMENTATION_REPORT.md`).

**Consequence for D-3:** any governance action, ADR or register entry referring to "D-3" without naming
its register is ambiguous today, and a reader following `docs/PHASE_6_D3_CURRENCY_INVESTIGATION.md`
would conclude the wrong decision had been investigated. No decision is made about the naming here; the
collision is recorded because it is a factual property of the project's documents.

### 2.3 The four contradiction classes the evidence actually contains

`[OPEN]` The register's sentence "a detail section contradicts itself" does not say which of these is
meant, and the evidence contains all four:

| Class | Definition | Instances found (verified, §5) |
|---|---|---|
| **C1 - rows vs `Total` cell** | Enumerated rows and the `Total` row of the same table disagree | 6 specs: D&L, Identity, Institution, People, Platform, Reporting |
| **C2 - heading vs body** | A section heading states a total that its own body contradicts | 2 specs: Operations §8.2 (48 vs 17), D&L §8.2 (34 vs 33) |
| **C3 - §4 summary vs detail** | The phase status row and the detail section disagree | 9 specs, ≥40 figures (`DECISION_D2...md:864-913`) |
| **C4 - materially incomplete detail** | The detail section is knowingly partial, so no complete detail exists | Operations §4 P4 `"~18 models (remainder abbreviated)"` vs §8.2 heading `48 total` |

**The register's own D-3 row mixes C1, C2 and C4 in its two examples** (`~18` is C4/C3, `48 total` is C2,
`126` vs `~350+` is C1). C3 is D-1's subject, not D-3's. **Scoping D-3 against D-1 is therefore a
prerequisite decision, not a detail.**

---

## 3. Decision dependencies

### 3.1 Upstream

| Decision | Relationship to D-3 | Blocks D-3? |
|---|---|---|
| **D-1 authority rule** | D-3's tie-break operates *inside* the section D-1 designates. Under D-1 Model A (summary-first) there is no detail section to tie-break, so D-3 is moot for every C1/C2 case; under Models B, C, D the tie-break is mandatory. D-1's own verdict: B, C and D each **fail on the self-contradictory specs without D-3** (`D-1:707`, `D-1:577`) | **Yes, for adopting the tie-break.** Not for researching it: this investigation compared sub-parts inside sections without needing to know which section is authoritative |
| **D-2 countable unit** | Determines whether "the enumerated rows" is a well-formed instruction. In the test tables the rows are per-category *estimates* (no scenario IDs in 8 of 10 specs), so "rows win" would promote an unsourced estimate total to authority. D-2 also asks, unresolved, *"Are `~` and `+` permitted on a figure derived from an exactly summable set?"* (`D-2:1086`) - which is precisely the `Total`-cell question | **Yes for the C1 test-scenario class. No for C2** (§9) |
| **D-4 section identifiers** | A tie-break phrased positionally (`§11.2`, `§8.2`) silently skips Institution Management, whose Phase 7 is `§16.2` (`audit:447-458`) | Yes for a *writable* rule; no for a decision taken per specification by name |
| **D-9 discrepancy register** | Every option except "heading wins" needs somewhere to record the losing value. Finance §4.1 is the only existing register; the register itself decides whether D-3 lands project-wide | **Yes in practice** - a tie-break with no record location re-creates the drift the register already shows |

### 3.2 Downstream

`[REQ]` From `docs/DECISION_D1_SPECIFICATION_AUTHORITY.md:702-714` and `:716-727`:

| Decision | Depends on D-3 how |
|---|---|
| **D-1 Models B, C, D** | Cannot be adopted without an intra-section tie-break. Model B is *structurally stuck* without it: both 126 and `~350+` sit in the authoritative section (`D-1:613-614`) |
| **D-1 Model E** | The only model that does not *depend* on D-3 to close a conflict: D-1 scores it *"Partly - records it, resolves by decision"* and notes it still *"requires D-3"* *"for automated resolution"* (`D-1:570`, `D-1:577`; option at `D-1:816-827`, and see `D-1:826`) |
| **D-3 → discrepancies** | D-3 is the last gate before count normalisation: it is what makes the register's candidate convention (§7.1) executable |
| **D-6 verification gate** | Inherits: a gate cannot validate a `~400+` scenario claim against 72 enumerated items without a tie-break |
| **D-4, D-10** | Not blocked by D-3. D-1 places D-4 and D-10 downstream of **D-1**, not of D-3, and names only D-5…D-8 as separate axes (`D-1:708`, `D-1:714`, `D-1:725-727`); the D-1 graph puts D-3 and D-4 in the same mutually blocking group off D-1 (`D-1:719-724`). D-2 agrees D-4 "does not define a unit and does not reduce D-2's scope" (`D-2:987-988`) |

`[OPEN]` The register's own sequence (§10.3) treats D-3 as one of the 6 blocking decisions of the 10 it
requires. Nothing in the register sequences D-3 before or after D-1 and D-2; the only ordering statement
is D-1's dependency graph (`D-1:719-727`), which places D-3 downstream of D-1 and in the same
mutually-blocking group as D-4.

---

## 4. Candidate options/models

`[OPEN]` The register names three candidates (rows, `Total` row, heading). The evidence and existing
practice add four more. **None is selected.**

| # | Candidate | Source | Evidence for | Evidence against |
|---|---|---|---|---|
| **O1** | **The enumerated rows win** | `audit:693` | All 10 Phase 7 row sets sum exactly to their own arithmetic (0 arithmetic errors found in any row set, verified by column extraction); the only sub-part that is machine-checkable | In the test tables the rows are per-category *estimates*, not enumerations (0 scenario IDs in 8 of 10 specs), so this promotes an unsourced total; contradicted by the `Total` cell in 6 of 10; contradicted by §4 in 7 of 10 outright and arguably an 8th (Academic 243 vs `~240+`); in Operations the ID-bearing enumeration is 72 items in 7 id families against 20 categories |
| **O2** | **The `Total` row wins** | `audit:693` | Correct in 4 of 10 test tables (Academic, Communication, Finance, Operations); correct in 2 of 3 Phase 6 summary tables (Communication 79, Platform 137); the sub-part most often copied into §4, so adopting it ratifies the 8 §4 figures that repeat a `Total` cell - 5 of them wrong | Wrong in 6 of 10 test tables, by factors of 2.77× (Identity), 1.92× (People), 1.82× (Institution), and absolutely in D&L (+12), Reporting (−10), Platform (3 of 6 columns); wrong in Operations §10.1 (`~121` vs 127); its own numbers are hedged (`~`) on deterministic sums |
| **O3** | **The section heading wins** | `audit:693` | None found | Refuted 2 for 2 where a heading states a total: Operations §8.2 `48 total` vs 17 model blocks; D&L §8.2 `34 Prisma models:` vs 33 numbered items. No supporting instance exists in the project |
| **O4** | **The §4 summary claim wins** | D-1 Model A | §4 is the phase's requirement statement; where §4 and the §10.1 summary agree (Communication 79, Platform 137) the two highest-level figures are mutually consistent | Refuted in ≥40 places (`D-2:969`; the inventory is at `D-2:864-913`); ratifies Identity `~350+` (2.8×) and Operations `~400+` (2×); for C1 it is not a sub-part of the detail at all, so adopting it converts D-3 into a restatement of D-1 |
| **O5** | **The repository wins** | not named in the register | The only artefact that is executable and version-controlled | Contradicts every design figure it could arbitrate: Operations models 17/18/48/55 in the spec vs **8** in `domains/operations.prisma`; Platform 48/55/62 vs **3** in `domains/platform.prisma`; Phase 7 scenarios 126-350+ vs **0 test files** for 4 domains. D-7 (spec → repo mapping) is undecided, and D-1:307 already concluded the repository cannot be the tie-breaker for a design question |
| **O6** | **Record the conflict, resolve nothing** | `[DEF]` Finance §4.1 | The only practice that exists: 11 entries, maintained across 3 revisions, explicitly *"deliberately left unresolved"* and *"none has been decided by implementation"* (`Finance:244-252`) | Produces no number for the reader; the register already drifts - item 1 quotes a §4 row that revision 1.4.0 replaced (`audit:660-664`); 0 of the other 9 specifications have any register |
| **O7** | **Per-conflict adjudication** | D-1 Model E | The only option that closes every case without a rule; D-1 rates it *"the only model that makes progress while D-2 and D-3 are open"* (`D-1:826`) | Substitutes human judgement for structure; produces no project-wide rule, so nothing prevents the next conflict (`D-1:818-823`) |

**Hybrid noted but not analysed as an option:** O1 for C2 (heading-vs-body, 2/2 refuted), O1 for Phase 6
route rows, O4 for §10.1-style summaries. This is recorded as an `[INFER]` possibility in §8.4; it is
**not** a proposal, because selecting it is the decision D-3 exists to take.

---

## 5. Existing specification evidence

All figures in this section were counted directly from the specification files during this
investigation. Method: table-row extraction between heading boundaries, then arithmetic. No figure is
taken from a prior report without being recomputed.

### 5.1 Class C1 - enumerated rows vs `Total` cell (the largest class)

| Specification | Section | Rows | Row sum | `Total` cell | Ratio | Verdict |
|---|---|---:|---:|---:|---:|---|
| Academic Management | §11.2 (`:1744-1766`) | 18 | **243** | `~240+` | 1.01 | reconciles inside the hedge |
| Communication | §11.1 (`:2619-2641`) | 18 | **215** | `~215+` | 1.00 | reconciles exactly |
| Documents & Learning | §11.2 (`:1863-1885`) | 18 | **273** | `~285+` | 0.96 | **`Total` overstates by 12** |
| Finance | §11.2 (`:1712-1734`) | 18 | **239** | `~240` | 1.00 | reconciles |
| Identity & Access | §11.2 (`:1067-1085`) | 14 | **126** | `~350+` | 0.36 | **`Total` overstates by 2.77×** |
| Institution Management | §16.2 (`:1313-1331`) | 14 | **154** | `~280+` | 0.55 | **`Total` overstates by 1.82×** |
| Operations | §11.1 (`:2404-2428`) | 20 | **204** | `~204+` | 1.00 | reconciles exactly |
| People | §11.2 (`:1430-1452`) | 18 | **172** | `~330+` | 0.52 | **`Total` overstates by 1.92×** |
| Platform Administration | §11.3 (`:3574-3594`) | 16 | **202 / 99 / 43 / 30 / 13 / 15** | `192 / 98 / 43 / 29 / 13 / 15` | - | **3 of 6 columns wrong** (Scenarios −10, Unit −1, Validation −1) |
| Reporting & Analytics | §11.2 (`:1781-1803`) | 18 | **236** | `~226+` | 1.04 | **`Total` understates by 10** |

`[CONFLICT]` **Result: 6 of 10 specifications carry a C1 contradiction** (D&L, Identity, Institution,
People, Platform, Reporting) and 4 reconcile. This reproduces the register's *"6 of 10 specs affected"*
(`audit:693`) for the `Total`-cell class specifically, while showing that the register reached the same
number by a different and partly mis-scoped route (§8.1).

`[CONFLICT]` **The `Total` cell is the sub-part already propagated upward, which is what makes O2
appealing and dangerous.** **8 of the 10 §4 Phase 7 rows repeat their own section's `Total` cell
verbatim** - Academic `~240+`, Communication `~215+`, D&L `~285+`, Finance `~240`, Identity `~350+`,
Institution `~280+`, Platform `~192`, Reporting `~226+`. The two exceptions are Operations (§4 `~400+`
against a cell of `~204+`) and People (§4 `~310+` against a cell of `~330+`).

Consequences for the candidate rules: **O2 would ratify 8 §4 figures, 5 of which are demonstrably
wrong** (D&L, Identity, Institution, Platform, Reporting). **O1 would contradict 7 of the 10 §4 Phase 7
figures outright** (D&L, Identity, Institution, Operations, People, Platform, Reporting) and arguably an
8th (Academic: rows 243 against `~240+`). Neither rule leaves the §4 table untouched.

### 5.2 Class C2 - section heading vs body

| Specification | Heading | Body | Verdict |
|---|---|---|---|
| Operations | `### 8.2 Models (Key Models - 48 total)` (`:1551`) | **17** `model` blocks in the section (`:1554-1986`) | heading refuted; and §3 P3 claims **55 tables** (`:188`), §4 P4 claims `~18 models (remainder abbreviated)` (`:189`) - four numbers in one phase |
| Documents & Learning | `34 Prisma models:` (`:1466`) | **33** numbered items, ending `33. RetentionPolicy` (`:1468-1500`) | heading refuted by one; the missing model is not identified |

`[CONFLICT]` D-1 §5.3 records the Operations case as *"neither a summary-vs-detail conflict nor a
self-contradiction - it is a materially incomplete detail section"* (`D-1:625-630`). That is class C4.
The same section also contains a genuine C2 (heading `48 total` vs 17 blocks). **The register's D-3 row
cites the C4 case as its primary example of a C2/C1 question.**

### 5.3 Class C3 at Phase 6 - the §10.1 summary tables

Three specifications publish a Phase 6 summary table. All three are internally consistent in two cases
and internally broken in one:

| Specification | §10.1 rows | Row sum | `Total` cell | §4 claim | Route rows in the same phase | Verdict |
|---|---:|---:|---:|---:|---:|---|
| Communication | 15 (`:2282-2299`) | **79** | `79` | 79 (`:194`) | **85** | summary self-consistent; **6 routes undeclared** |
| Platform Administration | 15 (`:3005-3023`) | **137** (85+52) | `137` | 137 (`:204`) | **142** | summary self-consistent, §4 agrees; **5 routes undeclared** |
| Operations | 27 (`:2165-2196`) | **127** | `~121` | `120+` (`:191`) | **117** | **summary internally broken**, and four different figures in one phase |

`[CONFLICT]` **Correction to a prior figure.** `docs/DECISION_D2_COUNTABLE_UNITS_AND_GRANULARITY.md:410`
records the Operations §10.1 group-row sum as **123**. The 27 rows at `Operations:2169-2195` sum to
**127** (recomputed twice, by column extraction and by hand). D-2 is not modified by this investigation;
the corrected figure is recorded here. The correction does not change D-2's conclusion - Operations still
carries four mutually inconsistent endpoint figures - but it widens the gap between the row sum and the
`Total` cell from 2 to 6.

### 5.4 What the "rows" actually are in the test tables

`[CONFLICT]` This is the most decision-relevant finding about candidate O1.

| Specification | Distinct scenario IDs | Where | Coverage of the §11.x category table |
|---|---:|---|---|
| Communication | **131** `TC-*` id rows, all distinct, 10 families (AUTO, CMP, CON, DEL, DIS, NOT, POL, PREF, PUSH, TPL) | `:2647-2817` (§11.x) | 131 items vs a row sum of 215 - the enumeration is itself partial |
| Operations | **72** `TC-*` ids, 7 families (BOR 14, RAL 12, MED 12, VIS 10, AST 12, LF 7, MAINT 5) | `:2434-2530` (§11.2-§11.7) | 72 items in **7 id families against the 20** §11.1 categories; the family-to-category mapping is by prefix only, not stated in the table |
| Other 8 specifications | **0** | - | no enumeration exists at all |

Additionally, `TI-001`…`TI-008` (8 distinct ids) appear in Academic, Finance, Institution and People as
tenant-isolation verification tables. They are unrelated to the scenario counts and do not arbitrate them.

**Consequence:** in 8 of 10 specifications the test table's rows are *estimates of scenarios per
category*, not enumerated scenarios. "The enumerated rows win" (O1) therefore means **"a sum of
unsourced estimates becomes the authoritative count"** for the largest C1 class. In Operations, the only
genuinely enumerated sub-part (72 IDs) is both the most concrete and the most incomplete, and it
contradicts all three other figures (204, `~204+`, `~400+`) simultaneously.

`[CONFLICT]` **Correction to a prior figure, with the method stated.** `docs/DECISION_D2_COUNTABLE_UNITS_AND_GRANULARITY.md:1169`
records *"Test scenario ids … Communication 132"*. A raw regex sweep of `Communication Engineering.md`
for `TC-[A-Z]+-\d{3}` returns **132 matches but only 131 distinct ids**, and all **131** of them are
table rows; the extra match is the changelog cell at `:2960`, which cites `TC-DEL-011` in a revision
note (`TC-DEL-011` is a real row at `:2801`). The 131 ids are contiguous per family, with no gaps:
`AUTO` 12, `CMP` 14, `CON` 20, `DEL` 14, `DIS` 18, `NOT` 15, `POL` 4, `PREF` 14, `PUSH` 4, `TPL` 16 =
131. So 131 is the count of enumerated scenarios and 132 is a match count that includes a
revision-history mention; the difference is a method difference, not a missing id. D-2 is not modified.

---

## 6. Repository/implementation evidence

`[IMPL]` All figures below were counted from the working tree. No build, test, lint, Prisma or migration
command was run; Prisma files were read as text and `git ls-files` was used for the test inventory.

### 6.1 Prisma model counts against the C2/C3 model contradictions

| Domain | Spec figures in dispute | `apps/api/prisma/domains/*.prisma` | Root `schema.prisma` |
|---|---|---:|---:|
| Operations | 17 blocks / `~18` / `48 total` / 55 tables | **8** models | 4 named (Hostel, Vehicle, InventoryItem, MaintenanceRequest) per `audit:522` |
| Platform Administration | `~48` / 55 blocks / 62 tables | **3** models | 3 (Tenant, FeatureFlag, AuditLog) |
| Finance | 30 rows / `32` | **5** models | 5 |
| People | 20 | **20** | 20 |
| Academic | 31 rows / `35` | **32** | 31 |
| Identity | 19 | **15** | 15 |
| Documents & Learning | 34 rows | **4** | 3 |
| Communication | 28 | **3** | 2-3 |
| Reporting | 31 | **5** | 5 |
| Institution | 15 | **2 + 2** | 0 |

`schema.prisma` totals: **99 models, 54 enums, 120 `@@index`, 80 `@@unique`**. Enums exist only in
`schema.prisma` (54) and `domains/people.prisma` (12) - the other ten domain files declare none.

`[IMPL]` **The repository supplies a fifth and sixth number, not a tie-break.** For Operations the
candidate figures are 17, 18, 48, 55 (spec) and 8 or 4 (repository). For Platform: 48, 55, 62 and 3.
`[OPEN]` Which repository artefact is even comparable is itself undecided - D-7 (spec → repo mapping) is
open, and `audit:511-530` records that two Prisma locations can each plausibly be called "the domain's
models". D-1:307 already concluded the repository *"could never be the tie-breaker for a design
question"*. O5 is therefore not evaluable, and this is not a judgement about which Prisma file is right.

### 6.2 Test inventory against the Phase 7 contradictions

`[IMPL]` 27 tracked `*.spec.ts` / `*.test.ts` files, **252 test cases** (`it(` / `test(` at line start):

| Module | Files | Cases | Nearest specification figure |
|---|---:|---:|---|
| people | 10 | 93 | People §11.2: 172 rows / `~330+` / `~310+` |
| config | 1 | 34 | (not domain-specific) |
| institutions | 4 | 32 | Institution §16.2: 154 / `~280+` |
| identity | 2 | 30 | Identity §11.2: 126 / `~350+` |
| academics | 3 | 19 | Academic §11.2: 243 / `~240+` |
| audit (Platform) | 2 | 11 | Platform §11.3: 202 / `192` |
| events | 2 | 11 | cross-cutting |
| session | 1 | 10 | Identity-related |
| common | 1 | 7 | cross-cutting |
| delivery (Communication) | 1 | 5 | Communication §11.1: 215 / `~215+` |
| **Finance, Operations, Documents & Learning, Reporting** | **0** | **0** | 239 / 204 / 273 / 236 scenarios specified |

`[CONFLICT]` **9 of 10 specifications mark Phase 7 `Complete`** while the repository holds 252 test cases
in total, 0 test files for 4 domains, and never more than 93 in any one. Phase 7 status is D-5/D-6/D-10
territory, but it matters here for one reason: **no Phase 7 figure in the project has ever been
executed, so no `Total` cell and no row sum has ever been checked by running anything.** The hedged
`~350+`, `~400+`, `~330+`, `~280+` figures are not stale measurements - they were never measurements.

`[INFER]` The audit's own note that *"0 of 10 specifications cite repository paths, file names, or test
names in support of any `Complete` status"* (`audit:489-490`) is consistent with the above and explains
why the repository cannot arbitrate C1: it does not contain the artefacts the C1 numbers claim to count.

### 6.3 Implementation evidence summary

| D-3 class | Does the repository arbitrate it? |
|---|---|
| C1 rows vs `Total` (test scenarios) | **No.** No artefacts exist to count; the repository contradicts both values with a third, much smaller one |
| C2 heading vs body (model lists) | **No.** The repository has a different, unmapped set of models; D-7 undecided |
| C3 §4 vs detail | **No.** Out of D-3's scope; and `audit:492-530` shows mapping is undefined |
| C4 incomplete detail | **No.** Nothing to complete it |

---

## 7. De-facto convention, if any

### 7.1 Is there an existing rule? No.

`[RULE]` **None exists.** Verified by targeted search:

- `engineering/00 README.md:41-46` (`## Conventions`) states the 7-phase structure, ADR numbering and
  freeze status. It contains **no** count-authority, precedence or tie-break rule.
- `docs/API-ENGINEERING-CONVENTIONS.md` (205 lines) is a code convention document. Its only use of
  "authoritative" is `:73` - *"The frozen Identity/API specification is authoritative over earlier wording
  in this document"* - which is a statement about that document, not about counts.
- `engineering/ROADMAP.md` (126 lines) and `MASTER_SMS_ROADMAP.md` (1640 lines) contain **no** D-number
  reference and no counting rule.
- The register already searched the specifications for `authoritative`, `source of truth`, `takes
  precedence`, `derived`, `canonical`, `must equal`, `must match`, `binding`, `normative` and found that
  **all 38 hits concern domain data ownership** - which domain owns a record - not document precedence
  (`audit:62-81`; the 38-hit count is stated at `audit:768`). This investigation re-ran the search for
  `canonical|source of truth|derived from|
  wins|tie-break|precedence|supersedes|in conflict` and reached the same result: the only
  count-adjacent use of "canonical" in any specification is the Finance Phase 3 status row **written by a
  prior audit** (`Finance:217`, "32 is **not** the canonical §7.1 table count").
- `audit:768` records the same conclusion as a ruled-out classification: *"A. An existing documented
  convention that Finance failed to follow"* → **RULED OUT**.

### 7.2 Is there a de-facto convention? Yes, in exactly one document, and it is not a tie-break.

`[DEF]` **Finance is the only specification that contains reconciliation practice**, and it is
audit-authored:

| Evidence | Location | What it does |
|---|---|---|
| §4.1 discrepancy register, 11 entries | `Finance:244-266` | Records discrepancies; explicitly *"deliberately left unresolved"*; *"No entry here has been reconciled by count, and none has been decided by implementation"* (`:250-252`) |
| §4 P5 row | `Finance:219` | Replaced the placeholder 14 with the §9.1 row count: *"16 modules defined in 9.1"*, retaining the superseded claim in the same cell |
| §4 P7 row | `Finance:221` | Annotates the claim with the audit's own row count: *"~240; the audit counted **239** across the 18 categories in §11.2, consistent with this phase's status claim - the only phase whose detail section matches its §4 summary"* |
| §4 P3 row | `Finance:217` | Records the internal 32-vs-30 gap and states 32 is not canonical |
| Revision history 1.4.0-1.6.0 | `Finance:1890-1892` | Three revisions maintaining the register without collapsing it into a chosen number |

`[CONFLICT]` **Finance's own practice is not internally consistent, so it cannot be promoted to a
convention as it stands.** Within one specification, one category was aligned to the detail row count
(modules, 14→16), one was annotated with the row sum (scenarios, 239), and two were left in conflict
(tables 32 vs 30, endpoints `100+` vs 98). `[OPEN]` Whether the register's *"deliberately left
unresolved"* posture and the §4 P5/P7 reconciliations are the same practice is not stated anywhere.

`[CONFLICT]` **The register itself is already drifting**, which is the concrete cost of the practice:
`Finance:255` (item 1) states *"§4 summary claims 14 modules; §9.1 defines 16"*, but the live §4 row no
longer claims 14 - revision 1.4.0 replaced it (`audit:660-664`, confirmed at `Finance:219`).

`[DEF]` **The only other recorded response to an unresolvable figure is to record the limitation instead
of a number**: Operations revision 1.1 replaced its model count with *"~18 shown, remainder abbreviated"*
and the reviewer *"declined to state a number and recorded the limitation instead"* (`D-1:625-627`,
text at `Operations:189`). This is class C4 behaviour, and it is a single instance.

### 7.3 Is the de-facto convention consistent enough to adopt?

**No.** Three independent reasons, each sufficient:

1. **Coverage: 1 of 10 specifications.** The other nine contain no reconciliation annotation at all
   (verified by searching all ten for `the audit|docs/PHASE|recorded in|Unable to Verify|Unresolved -`:
   Finance 12 hits, every other specification 0-2 hits, all of which are unrelated uses of the word
   "audit log").
2. **Provenance: authored by audits, not by the specification owners.** `Finance:246-248` names the
   audits that created the register. No ADR records it, and no specification declares it.
3. **Consistency: it does not agree with itself** (§7.2). It both reconciles and declines to reconcile,
   within one document, and its record already misdescribes the document it describes.

**None of the three is a statement against recording.** `[INFER]` The recording practice is the most
likely candidate for adoption, because it is the only thing the project has actually done. Adopting it
is D-9's decision (register location and ownership), not D-3's - and D-9 is marked non-blocking in the
register (`audit:699`).

---

## 8. Conflicts and contradictions

### 8.1 The governing register is internally inconsistent about D-3's own scope

| Location | Statement | Problem |
|---|---|---|
| `audit:431-432` (§5.2 prose) | *"**Three** specifications contain a within-detail contradiction"* | The table beneath it lists **6** conflicts across **5** specifications, and the §8 row says **6 of 10** |
| `audit:436` (row 3) | Operations §11.1 rows 204 vs **§4** `~400+` | Not a within-detail contradiction: §11.1's own `Total` (`~204+`) equals its row sum. This is class C3, i.e. D-1's subject |
| `audit:437` (row 4) | Platform §4 `~48` vs §8.2's 55 blocks | Also §4-vs-detail, i.e. class C3, not C1/C2 |
| `audit:693` (D-3 row) | Examples `~18` vs `48 total`; `126` vs `~350+` | The first example spans C4 + C2 + C3; only the second is a clean C1 case |

`[CONFLICT]` **Net effect: 2 of the 6 cases D-1 relies on are not D-3 cases, and 3 specifications with
genuine C1 or C2 contradictions (D&L, Reporting, Platform §11.3) plus D&L §8.2 are absent from the
list.** Verified full C1/C2 set from §5: C1 in 6 specs, C2 in 2 specs, union = 7 specifications.
`D-1:598-607` should be read as a list of *summary-vs-detail* conflicts, of which 3 happen also to be
intra-detail.

`[CONFLICT]` **The affected-specification count is unstable across the two governing documents.** D-1's
comparison table scores Model B as *"No - fails on 4 of 10"* on self-contradictory detail (`D-1:570`),
repeated in prose at `D-1:583`; the register says *"6 of 10 specs affected"* (`audit:693`); D-1's own
§5.1 lists 6 cases across 5 specifications; and the register's §5.2 prose says *"Three specifications"*.
Four different counts of the same question, none of them reconciled. The verified count for the
`Total`-cell class is **6 of 10** (§5.1).

### 8.2 No candidate sub-part survives both contradiction classes

| Candidate | C1 (test tables) | C2 (headings) | Phase 6 §10.1 |
|---|---|---|---|
| O1 rows | supported arithmetically, undermined by unit (8 of 10 tables are estimates) | supported 2/2 (body refutes heading) | refuted twice (Communication, Platform both under-declare their route rows) |
| O2 `Total` row | **refuted 6 of 10** | not applicable (no `Total` row in a model block section) | **supported 2 of 3** |
| O3 heading | **refuted 6 of 10** (it *is* the wrong side) | **refuted 2 of 2** | not applicable |

`[CONFLICT]` A single rule therefore **fails in both directions**: O2 is the better rule for Phase 6
summary tables and the worse rule for Phase 7 test tables; O3 is refuted everywhere it is testable. This
is the same structural conclusion D-2 reached for countable units (`D-2:1107-1117`), reached here by a
different route: **the evidence does not support one rule for D-3 either.**

### 8.3 Ownership overlaps

| Overlap | Detail |
|---|---|
| D-3 vs D-1 | C3 (summary vs detail) belongs to D-1. Two of the register's six cases are C3. If D-3 is not scoped to exclude C3, D-1 Model A and D-3 O4 become the same decision taken twice |
| D-3 vs D-2 | "The enumerated rows" is a unit-bearing phrase. D-2 §16.1 item 8 asks whether a scenario is a summary-cell number, a `TC-` id row, or a test case (`D-2:1070`); D-3 cannot say "rows win" before that is answered (§9) |
| D-3 vs D-4 | A positional tie-break (`§11.2`) skips Institution Management (`§16.2`). Not a conflict, a portability defect |
| D-3 vs D-9 | Every option except O3 requires a place to record the rejected value. D-9 is where that place is decided |
| D-3 vs D-6 | A verification gate cannot validate a hedged scenario claim without a tie-break; conversely a tie-break without a gate is untested |
| **Label vs register** | Four D-3s (§2.2). Any ADR numbered "D-3" is ambiguous today |

### 8.4 Unresolved terminology

`[OPEN]` Terms D-3 needs and the project does not have:

| Term | Problem | Owner |
|---|---|---|
| "detail section" | Not a stable referent: Institution Management's Phase 6/7 are `§15`/`§16`; **2 of 10 specifications have no controller detail section at all** - Documents & Learning and Reporting & Analytics, each claiming 13 controllers, both ending `§9` at `9.4 Event Publishing & Consumers` (`audit:475-481`) - and Platform has no `Controllers` section either, mapping controllers per module at `:2784-2800` instead. Platform also has three repository enumerations in one category (`audit:447-473`, `D-2:255-320`) | D-1 + D-4 |
| "enumerated rows" | In 8 of 10 test tables the rows are estimates, not enumerations (§5.4) | D-2 |
| "the `Total` row" | Exists as a row in **13 tables across 10 specifications** - one Phase 7 test table each, plus the three Phase 6 `§10.1` endpoint tables - in 4 different column shapes (`Category\|Scenarios`, `#\|Category\|Scenarios`, `Category\|Scenarios\|Unit\|Integration\|…`, `Primary\|Sub-resource\|Total`) | D-2 |
| "wins" | No precedence concept exists in any document (§7.1) | D-1 + D-3 |
| hedged figures (`~`, `+`) | Permitted on exactly summable sets? Unresolved at `D-2:1086`. Identity's `~350+` and Operations' `~204+` are the same notation on a deterministic quantity | D-2, consumed by D-3 |
| "a stated `Total`" | D-2 already asks the D-3 question in its own words: *"Must a stated `Total` equal the sum of its own rows? (8 of 10 currently do not.)"* (`D-2:1085`). The verified figure for the `Total`-cell class in this investigation is **6 of 10** (§5.1); the difference is whether a hedged cell that contains the row sum (Academic 243 in `~240+`) counts as non-equal. That definitional question is unstated | D-3 primarily; D-2 for the unit |
| "complete detail" | Class C4 has no test: Operations §4 P4 declares its own detail abbreviated, and no document says what a complete detail section must contain | D-3 |

---

## 9. Impact of D-2 being undecided

### 9.1 What D-2 blocks

`[OPEN]` **D-2 blocks D-3 for the C1 test-scenario class - the largest class (6 of 10 specifications).**
The reason is specific, not general: adopting O1 there means asserting that a sum of per-category
*estimates* is the count. Whether a scenario is a summary-cell number, an ID-bearing row, or a test case
is exactly D-2 §16.1 item 8 (`D-2:1070`), and it is unanswered. Until it is answered, "the enumerated
rows win" is not a well-formed instruction for 6 specifications.

The same applies to O2 in reverse: whether a hedged `Total` cell may stand as a count at all is
`D-2:1086`, and Identity's `~350+`, Institution's `~280+`, People's `~330+`, D&L's `~285+` and
Reporting's `~226+` are all hedged cells. **D-2's undecided status is therefore not a formality for this
class - it removes the unit that both candidate rules operate on.**

### 9.2 What D-2 does not block - demonstrated

`[INFER]` **D-3 can be researched, and partly decided, for the C2 heading-vs-body class without D-2.**
Demonstration from verified evidence:

- The two C2 conflicts are between a **heading string** and **the model declarations in the same
  section**: `Operations:1551` `48 total` against **17** `model` blocks at `:1554-1986`; and
  `Documents & Learning:1466` `34 Prisma models:` against **33** numbered items at `:1468-1500`.
- In both cases the competing artefacts are enumerations **of the same kind** - model declarations versus
  model declarations. Deciding which one wins requires no definition of what a "model" or a "table" is
  (`D-2 §4`): it requires only which list is authoritative.
- The comparison is already decisive on the evidence: the heading is refuted **2 for 2**, by direct
  counting, with a margin of 31 and 1 respectively.
- The same independence applies to the *arithmetic* part of the Phase 6 §10.1 tables: Communication's 15
  rows summing to 79 and Platform's 15 rows summing to 137 are checkable without knowing what an
  "endpoint" is (`D-2 §7`), and both reconcile internally.

**Therefore D-3 is partially blocked by D-2, not wholly blocked.** The blocked part is the class with the
most instances; the unblocked part is the class with the fewest instances but the clearest evidence.
`[OPEN]` Whether D-3 should be *decided* in stages (C2 first, C1 after D-2) is itself a sequencing
decision for the owner; it is not made here.

### 9.3 The circularity, stated rather than hidden

`[CONFLICT]` D-1 and D-2 are mutually blocking for Models B, C and D (`D-1:729-741`, `D-2:975-980`).
D-3 sits inside that circle: it needs D-1 to designate the container and D-2 to define the unit, while
D-1's Models B/C/D need D-3 to be executable. **D-1 Model E (per-conflict adjudication) is the only
model that can make progress while D-2 and D-3 are open** (`D-1:826`) - a fact about the option set, not
a recommendation. D-1 also records that E still requires D-3 for *automated* resolution and D-9 to
function (`D-1:577`, `D-1:821-824`).

---

## 10. Downstream decisions affected

| Decision | Effect of D-3 | Verified source |
|---|---|---|
| **D-1 Model B (detail-first)** | Structurally undecidable without D-3: both 126 and `~350+` sit inside the authoritative section | `D-1:613-614`, `audit:624-628` |
| **D-1 Models C, D** | Require an intra-section tie-break to be adoptable | `D-1:707`, `D-1:577` |
| **D-1 Model A** | Renders D-3's C1/C2 classes moot by overriding them, at the cost of ratifying `~350+` and `~400+` | `D-1:611-612` |
| **D-1 Model E** | The only model that does not *depend* on D-3 to close a conflict (D-1:570, `D-1:577`) | `D-1:816-827` |
| **D-9 (register location)** | Every option except O3 needs a record location; D-3 is the first decision that would need one | `audit:699`, `D-1:713` |
| **D-6 (verification gate)** | Cannot validate a Phase 7 claim until a tie-break defines the count | `audit:696` |
| **D-2 (unit)** | Consumes D-3's answer for scenario units; and its `~`/`+` policy is a D-3 input | `D-2:1070`, `D-2:1086` |
| **Count normalisation** | Blocked. The register treats D-3 as one of 6 blocking decisions gating all count work | `audit:689-700`, `audit:791` |
| **D-4, D-5, D-7, D-8, D-10** | Not blocked by D-3; separate axes | `D-1:725-726`, `D-2:987` |

---

## 11. Decision-readiness assessment

| Question | Answer | Basis |
|---|---|---|
| Is D-3 a real, open decision? | **Yes** | `audit:693`; D-1 §5, §7.1 |
| Is its question precisely stated? | **No** | Four contradiction classes exist; the register's own prose, examples and evidence count disagree (§2.3, §8.1) |
| Is the governing definition durable? | **No** | The register is untracked by git and unlisted in `engineering/00 README.md` (§1, finding 2) |
| Is there an existing rule? | **No** | §7.1 |
| Is there a de-facto convention? | **Yes, in 1 of 10 specifications, audit-authored, self-inconsistent** | §7.2 |
| Is it consistent enough to adopt? | **No** | §7.3, three independent reasons |
| Does the repository arbitrate? | **No** | §6.3 |
| Do the specifications arbitrate? | **No** | §8.2, no candidate survives both classes |
| Does D-2 block it? | **Partially** - blocks C1 test scenarios; does not block C2 | §9.1, §9.2 |
| Does D-1 block it? | **Yes for adoption** (no designated container); **no for research** | §3.1, `D-1:707` |
| Is D-3 decidable from evidence? | **No** | §1, §4, §8.2 |
| Is D-3 a governance decision? | **Yes.** Every candidate requires an authority claim no document supports, and two of them (O4, O7) are re-statements of D-1 | §4, §7.1 |

**Classification:** D-3 is a **governance decision**, not a measurement problem. The measurements are
available and were made here; what is missing is the authority to prefer one artefact over another, and
the scope delimitation that says which contradictions D-3 owns.

---

## 12. SAFE-STOP / recommendation for the next governance action

### 12.1 SAFE-STOP

**No option is selected. No sub-part is declared authoritative. No count is corrected.** O1 through O7
are recorded as candidates with their evidence; the evidence does not distinguish a winner, and selecting
one would be a governance act, not a finding.

`[OPEN]` Specifically **not** concluded: that the enumerated rows win; that `Total` rows win; that
headings lose in all circumstances; that the repository is irrelevant; that Finance's practice should
become project-wide; that D-3 should be taken per-class or as a single rule.

### 12.2 The precise missing decisions

Two, in this order. Neither can be derived from evidence.

**Missing decision 1 - scope.** *Which contradiction classes does D-3 own?* Specifically: does D-3 cover
C1 (rows vs `Total`) and C2 (heading vs body) only, leaving C3 to D-1 and C4 unassigned? Until this is
answered, D-3 and D-1 overlap on 2 of the register's 6 cases, and "adopt D-3" is not a well-formed
instruction.

**Missing decision 2 - the tie-break**, per class, by a named owner. For C1 the instruction is currently
unavailable because the unit is undefined (§9.1); for C2 the evidence is complete and a choice is ready
to be made; for C4 no completeness test exists.

### 12.3 Recommended next governance actions, in order

None of these is a decision, and none is taken here. They are the minimum set that would make D-3
decidable.

1. **Put the register under version control and name it.** `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md`
   is untracked; `engineering/00 README.md:7-24` does not list it. Until the D-1…D-10 register is a
   tracked artefact, every decision in this series - D-1, D-2, D-3 - rests on an uncommitted file.
2. **Disambiguate the D-number namespace.** Four registers use `D-3` (§2.2), and D-1/D-2 collide too.
   A prefix or a naming rule per register is a prerequisite for writing any ADR that cites "D-3".
3. **Record the scope decision (Missing decision 1) and fix the register's own §5.2 inconsistency** -
   four different counts of the same question (3 in §5.2 prose, 6 in its table, 6 of 10 in the §8 D-3
   row, 4 of 10 in D-1), and 2 cases that are not D-3 cases (§8.1). This is a documentation
   correction to an untracked file plus a scoping decision; it needs the owner, not evidence.
4. **Then take the tie-break class by class, in evidence order:** C2 first (2 instances, 2/2 refuted,
   D-2-independent), then the Phase 6 §10.1 class (3 instances, 2 of 3 internally consistent), then C1
   test scenarios **after D-2** fixes the scenario unit, and C4 last (it needs a completeness test
   before it can be a rule).
5. **Settle D-9 alongside or before the first tie-break.** O1, O2, O4, O5, O6 and O7 all need somewhere
   to record the rejected value. Finance §4.1 is the only candidate location and it already drifts
   (§7.2). D-9 is marked non-blocking in the register (`audit:699`), which this investigation disputes on
   practical grounds - not a decision, an observation for the owner.

### 12.4 What was not done

No D-3 decision was made, adopted or applied. No specification was edited, including the two
specifications whose §4 rows were read most closely (Finance, Operations) and the two whose internal
contradictions are largest (Identity, People). No count was corrected, chosen or removed. D-1 and D-2
were not modified, and the two numeric discrepancies found in them (§5.3, §5.4) were **recorded here
only**. No D-9 register was created or extended. No ADR was written. No code, Prisma schema, migration,
API, test, UI or configuration file was touched. No status was changed. Nothing was committed. No build,
test, lint, Prisma or migration command was run; all verification was read-only inspection, text
extraction, arithmetic, `git ls-files` and `git status`.

---

## 13. Evidence index

Paths are relative to the repository root `C:\Users\USER\Documents\SMS`. "Untracked" means absent from
`git ls-files` at the time of this investigation (HEAD `aae6309`, branch `phase/2-rbac`).

### 13.1 Governing register (untracked)

| Path | Lines | What was taken |
|---|---|---|
| `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md` | 839 | **D-3 definition** `:693`; §5.1 bidirectional disagreement `:414-427`; §5.2 self-contradictory detail `:429-445`; §5.3 non-portable numbering `:447-458`; §5.4 non-uniform granularity `:460-473`; §5.7 repo mapping `:492-530`; candidate convention `:602-607`; clause 1 assessment and the three gaps `:611-645`; clause 2 assessment `:647-667`; overall `:669-680`; decision table D-1…D-10 `:684-700`; ruling-out of an existing convention `:768`; 10 decisions, 6 blocking `:791`; safe-stop `:793-805` |

### 13.2 Prior decision investigations (untracked)

| Path | Lines | What was taken |
|---|---|---|
| `docs/DECISION_D1_SPECIFICATION_AUTHORITY.md` | 947 | D-3 named as tie-break `:41`; D-1 not decidable `:852-870`; Model B wording `:202-211`; models set aside incl. recency-wins `:261-270`; Model A failures `:313-327`; Model B failures `:387-390`; **self-contradictory detail problem** `:592-637` (six cases `:598-607`, per-model effect `:609-621`, abbreviation `:623-630`, implication `:632-636`); dependency row for D-3 `:707`; dependency graph `:716-727`; circularity `:729-741`; option table incl. Model E `:816-826`; verification `:925-946` |
| `docs/DECISION_D2_COUNTABLE_UNITS_AND_GRANULARITY.md` | 1219 | D-3 inherits D-2 `:984-987`; C3 inventory `:864-913`; root-cause classification `:917-957`; per-model dependency table `:967-973`; Phase 6 claim-vs-rows table `:429-447` (Operations §10.1 sum recorded as 123 - see §5.3); hedged-figure question `:1083-1091`; machine-countable measures incl. TC- ids `:1188-1201` (Communication recorded as 132 - a regex *match* count that includes a `:2960` changelog mention; 131 id rows - see §5.4) |

### 13.3 Specification evidence (all tracked; read-only)

| Path | Lines used | Finding |
|---|---|---|
| `engineering/Identity & Access Engineering.md` | `:1067-1085` (§11.2, `Total` `:1085`); `:172` (§4 P7) | C1: 14 rows = 126 vs `~350+` |
| `engineering/Institution Management Engineering.md` | `:1313-1331` (§16.2, `Total` `:1331`); `:170` | C1: 14 rows = 154 vs `~280+`; Phase 7 is `§16`, not `§11` |
| `engineering/People Engineering.md` | `:1430-1452` (§11.2, `Total` `:1452`); `:256` (§4 P7 `~310+`) | C1: 18 rows = 172 vs `~330+`; third figure `~310+` in §4 |
| `engineering/Operations Engineering.md` | `:2404-2428` (§11.1, `Total` `:2428`); `:192` | §11.1 reconciles at 204; §4 says `~400+` (C3) |
| " | `:1551` (heading `48 total`); `:1554-1986` (17 blocks); `:188-189` (§4 P3 55 tables, P4 `~18 … abbreviated`) | C2 + C4 |
| " | `:2165-2196` (§10.1, 27 rows, `Total` `:2196`); `:191` | §10.1 rows = 127 vs `~121`; four Phase 6 figures |
| " | `:2434-2530` (72 `TC-*` ids, 7 families) | Partial enumeration, 7 id families against 20 §11.1 categories |
| `engineering/Platform Administration Engineering.md` | `:3574-3594` (§11.3, `Total` `:3594`); `:205` | C1: 3 of 6 columns wrong (202/192, 99/98, 30/29) |
| " | `:1684-2765` (§8.2, 55 `model` blocks); `:1516-1682` (§8.1, 22 enums); `:202` (§4 P4 `~48`) | §8.2 internally consistent; 55 vs `~48` is C3 |
| " | `:3005-3023` (§10.1, `Total` `:3023`); `:204` | §10.1 reconciles at 137 = 85+52; §4 agrees; 142 route rows |
| `engineering/Documents & Learning Engineering.md` | `:1863-1885` (§11.2, `Total` `:1885`); `:197` | C1: 18 rows = 273 vs `~285+` |
| " | `:1466` (`34 Prisma models:`); `:1468-1500` (33 numbered items) | C2 |
| `engineering/Reporting & Analytics Engineering.md` | `:1781-1803` (§11.2, `Total` `:1803`); `:197` | C1: 18 rows = 236 vs `~226+` (understates) |
| `engineering/Academic Management Engineering.md` | `:1744-1766` (§11.2, `Total` `:1766`); `:194` | reconciles at 243 inside `~240+` |
| `engineering/Communication Engineering.md` | `:2619-2641` (§11.1, `Total` `:2641`); `:195`; `TC-*` id rows `:2647-2817` | reconciles at 215; 131 `TC-*` id rows - 132 regex matches, the extra being the `:2960` changelog mention |
| " | `:2282-2299` (§10.1, `Total` `:2299`); `:194` | §10.1 reconciles at 79; 85 route rows |
| `engineering/Finance Engineering.md` | `:244-266` (§4.1 register, 11 entries, "deliberately left unresolved" `:250-252`); `:219` (§4 P5, 16 from §9.1); `:221` (§4 P7, audit counted 239); `:217` (§4 P3, 32 not canonical); `:1712-1734` (§11.2, `Total` `:1734`); `:1890-1892` (revisions 1.4.0-1.6.0) | de-facto practice, §7.2 |

### 13.4 Repository evidence (read-only; no command that mutates or executes)

| Path / source | Measurement | Result |
|---|---|---|
| `apps/api/prisma/schema.prisma` | `^model`, `^enum`, `@@index(`, `@@unique(` | 99 / 54 / 120 / 80 |
| `apps/api/prisma/domains/*.prisma` | same | operations 8, platform 3, finance 5, people 20 (+12 enums), academic 32, identity 15, communication 3, documents 4, analytics 5, institution 2, institution-configuration 2 |
| `git ls-files` + `^(it|test)\(` | test inventory | 27 files, 252 cases; people 93/10, config 34/1, institutions 32/4, identity 30/2, academics 19/3, audit 11/2, events 11/2, session 10/1, common 7/1, delivery 5/1; **0 files for Finance, Operations, D&L, Reporting** |
| `git ls-files --error-unmatch docs/PROJECT_..._AUDIT.md` | tracking | **error: pathspec did not match** - register is untracked |
| `git status --short`, `git rev-parse --short HEAD`, `git branch --show-current` | working tree, re-checked after this report was written | **4 modified** (all pre-existing, unrelated: 2 institution services, Finance and Institution Management specs), **14 untracked** = 13 pre-existing + this report; HEAD `aae6309`, branch `phase/2-rbac`; nothing committed, nothing staged |

### 13.5 Label-collision evidence

| Path | Line | Register | D-3 subject |
|---|---|---|---|
| `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md` | 693 | Counting & status | Self-contradictory detail tie-break (**governs this report**) |
| `docs/PHASE_6_DECISION_BRIEF.md` | 263-269 | Phase 6 financial | Canonical currency (BLOCKING) |
| `docs/PHASE_6_SCOPE_VERIFICATION_REPORT.md` | 405 | Phase 6 financial | Authoritative institution currency column |
| `docs/PHASE_6_D3_CURRENCY_INVESTIGATION.md` | 1, 5 | Phase 6 financial | Existing investigation of the currency D-3 (untracked, pre-existing, **not read for this decision's evidence and not modified**) |
| `docs/PHASE_5_SCOPE_VERIFICATION_REPORT.md` | 235 | Phase 5 academic | Academic calendar / Department owner |
| `docs/PHASE_5_MIGRATION_REPORT.md` | 175 | Phase 5 academic | Canonical calendar owner (resolved) |
| `docs/PHASE_3_IMPLEMENTATION_REPORT.md` | 1, 24 | Phase 3 platform | Redis health readiness (implemented) |
| `engineering/Finance Engineering.md` | 1889 | Phase 6 financial | Revision 1.3.0 "D-3 Terminology Decision" (ADR-036) |

### 13.6 Negative searches (absence of a rule)

| Search | Scope | Result |
|---|---|---|
| `canonical`, `source of truth`, `derived from`, `wins`, `tie-break`, `tiebreak`, `precedence`, `supersedes`, `in conflict`, `conflict resolution` | `engineering/*.md`, `docs/*.md` | No document-level count-authority or tie-break rule. All authority language concerns domain data ownership or, in `docs/API-ENGINEERING-CONVENTIONS.md:73`, that document's own deference to the frozen spec |
| `the audit`, `docs/PHASE`, `recorded in`, `Unable to Verify`, `Unresolved -` | all 10 specifications | Finance 12 hits (all reconciliation annotations); every other specification 0-2 hits, all unrelated (`audit log`) |
| `\bD-\d\b`, `decision register` | `engineering/ROADMAP.md`, `MASTER_SMS_ROADMAP.md` | 0 hits - no roadmap defines or references the register |
| `## Conventions` block | `engineering/00 README.md:41-46` | 7-phase structure, ADR numbering, freeze status. No counting rule |
| `^#{2,4} D-\d+` | `docs/PHASE_6_DECISION_BRIEF.md` | 18 decisions, D-1 = Expenses, D-2 = financial configuration ownership, D-3 = canonical currency |

### 13.7 Post-write verification record

Every quantitative claim in §5, §6 and §8 was re-derived after this report was written, by re-reading
the cited lines and re-running the counts. Result: **all section order, headings and figures verified;
six citation or arithmetic defects in this report's own first draft were found and corrected** (listed
below, so the corrections are auditable rather than silent).

| # | Defect found in the first draft | Correction applied |
|---|---|---|
| 1 | §5.1 stated "in 4 specifications the §4 row repeats the `Total` cell" and then listed 6 | Rewritten: 8 of 10 §4 Phase 7 rows repeat their own section's `Total` cell; the 2 exceptions are Operations and People |
| 2 | §4/§5.1 claimed §4 is contradicted "9 of 10" | Corrected to 7 of 10 outright, plus arguably an 8th (Academic 243 vs `~240+`) |
| 3 | §5.4 gave a wrong Communication family breakdown (NOT 12, DEL 14) | Corrected by re-counting id rows: AUTO 12, CMP 14, CON 20, DEL 14, DIS 18, NOT 15, POL 4, PREF 14, PUSH 4, TPL 16 = 131 |
| 4 | §5.4 called D-2's "132" simply wrong | Corrected: 132 is a regex *match* count including the `:2960` changelog mention; 131 is the count of id rows. D-2's figure is method-different, not missing ids |
| 5 | Six `Total`-row line citations were off by one (Identity, Institution, D&L, Reporting, Academic, Finance), and Communication's `§10.1` range excluded its `Total` row | All corrected to the verified lines (`:1085`, `:1331`, `:1885`, `:1803`, `:1766`, `:1734`, `:2282-2299`) |
| 6 | §8.4 said the `Total` row exists "in 12 tables ... 3 different column shapes" | Corrected to 13 tables across 10 specifications in 4 column shapes (a counted `\| Total \|` sweep; the 14th match was a header row) |

Also corrected: two citations pointing outside the cited document (`D-1:962`, which does not exist - D-1
has 947 lines), one citation range that over-reached (`audit:447-475` -> `447-473`, with the controllers
finding separated to `audit:475-481` and re-verified directly: 2 specifications have no controller
section at all, and Platform maps controllers per module at `:2784-2800`), the "38 hits" attribution
(moved to `audit:768`, where the count is stated), and four over-general statements about D-1 Model E
(D-1 scores it as requiring D-3 "for automated resolution", `D-1:577`).

Re-derived and confirmed unchanged: all 10 Phase 7 row sums (126, 154, 172, 204, 202/99/43/30/13/15,
273, 236, 243, 215, 239) with 0 arithmetic errors; the 3 Phase 6 `§10.1` sums (27 rows = 127, 15 = 79,
15 = 137); Platform's 6-column `Total` row; Operations' 17 model blocks and Platform's 55; D&L's 33
numbered items under a `34 Prisma models:` heading; 131 Communication `TC-*` id rows at `:2647-2817`
and 72 Operations ids; 9 of 10 specifications marking Phase 7 `Complete`; 14 `Total` rows in the 10
specifications; the source line counts (audit 839, D-1 947, D-2 1219).

---

*End of D-3 decision-readiness investigation. Investigation only: no D-3 option selected, no convention
adopted, no sub-part declared authoritative, no count corrected, no specification modified (Finance,
Operations, Identity, People, D&L, Platform, Communication, Academic, Reporting, Institution all
untouched), D-1 and D-2 not modified, no new discrepancy register created, no ADR written, no
code/schema/migration/test/UI/configuration change. No D-3 decision made. Nothing committed.*
