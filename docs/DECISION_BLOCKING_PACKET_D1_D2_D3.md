# Decision Packet — Unblocking the D-1 / D-2 / D-3 Chain

**Status:** RESOLVED — 2 of 2 questions answered by the product/architecture owner (A, A), September 2026.
Applied to `governance/Documentation Constitution.md` v1.2. D-1, D-2 and D-3 are closed as not required
for implementation and are not reopened.
**Scope:** minimum decisions required before implementation can proceed. Not a new governance framework.
**Date of evidence:** HEAD `aae6309`, branch `phase/2-rbac`.
**Out of scope by instruction:** the Finance module-ownership decision (Phase 6 D-2) and the
settlement-currency terminology decision. Those are separate and are not reopened here. The `D-numbers`
in this packet are the **counting & status convention register** (`D-1`…`D-10`), which collides with
the Phase 6 and Phase 5 registers; that collision is itself listed as non-blocking debt below.

---

## 1. Current situation

Three investigations are complete and verified:

| Artefact | Conclusion | Own words |
|---|---|---|
| `docs/DECISION_D1_SPECIFICATION_AUTHORITY.md` | Not decidable from evidence. 5 authority models, none eliminated. A human decision on **Q-1** is required. | `D-1:852-877`, `D-1:909-914` |
| `docs/DECISION_D2_COUNTABLE_UNITS_AND_GRANULARITY.md` | Not decidable. Requires a countable unit per category, a named owner, and at least 4 discrepancies that **no further document analysis can resolve**. | `D-2:1101-1103`, `D-2:1137` |
| `docs/DECISION_D3_INVESTIGATION.md` | SAFE-STOP. Not decidable. Needs a scope decision and a per-class tie-break. | `D-3 §11`, `D-3 §12.2` |

**What the three actually govern.** All three govern *how numbers written in specifications are
counted and reconciled*. None of them defines behaviour, an interface, a data model, or a workflow. No
code, schema, migration or test depends on the answer.

**The finding that changes the picture.** A **tracked, approved** governance document already exists and
already covers this ground at document level:

- `governance/Documentation Constitution.md` (v1.1 at the time of writing, **amended to v1.2** by the owner
  decisions in §3 and §4; Status: Approved, **tracked in git**) defines a
  Source of Truth Hierarchy in which Approved Engineering Specifications are Level 3 (§4.1, `:158-166`),
  a conflict-resolution process (§5.1, `:195-203`) and an AI boundary that forbids choosing between
  conflicting authoritative sources (§5.2, `:209`).
- `governance/Documentation Dependency Map.md` Appendix A (`:621-641`) maps information categories to
  authoritative sources. "Domain business rules → Domain Engineering Specs E1–E10". **No row assigns an
  authoritative source for counts.**
- The counting register that invented `D-1`…`D-10` is **untracked**.

So the hierarchy already answers *which document wins*. What it does not answer is *which sub-part of one
specification wins*, and — critically — whether a sub-part conflict is a blocker at all.

**The one rule that actually stops implementation** is a single row:

> `governance/Documentation Constitution.md:212` — **"Continue only after resolution: Implementation must
> not proceed until the conflict is resolved"**

Read literally, this makes each of the 40+ documented count discrepancies a hard stop. That single row,
not D-1/D-2/D-3, is what converts a documentation inconsistency into a project-wide block. It is also why
the three investigations could not simply be closed: closing them would have required deciding a counting
convention, which §19.1 (`:672-675`, "No invented architecture / No guessed business rules") forbids
inventing and §5.2 (`:209`) forbids an assistant from choosing.

---

## 2. What actually blocks progress

**B1 and B2 are RESOLVED (Option A each) and lifted. B3 is the next implementation-blocking item.**

| # | Blocker | Nature | Blocks implementation? |
|---|---|---|---|
| B1 | `Documentation Constitution.md:212` made **every** documented conflict a stop condition, including count metadata | Governance rule, already existed, too broad | **RESOLVED — Constitution v1.2 §5.2 now scopes it to material conflicts; rest is documentation debt** |
| B2 | No rule said whether a specification number or the repository is normative when they disagree (`Constitution:186` said "Code or documentation must be updated to align" — either may change) | Missing direction | **RESOLVED — Constitution v1.2 §4.3: code + Prisma schema record what exists, the approved specification is the implementation target** |
| B3 | 9 of 10 specifications mark Phase 7 `Complete` with 0 of 10 having a `validate` script and 8 of 8 readiness checklists 0% checked (`audit:485-488`; Finance is the only exception) | Verification gate undefined (D-5/D-6) | No for building. **This is the next blocking item**: it is the "how the implementation is verified" limb of the newly scoped §5.2 rule, so it will hard-stop any completion claim |
| B4 | D-1 → D-2 → D-3 chain undecided | Counting convention | **CLOSED — not required for implementation under B1 Option A; retained as documentation debt** |

**Explicitly not blockers:** the 6 intra-detail `Total`-vs-rows contradictions, the 2 heading-vs-body
cases, the Phase 6 `§10.1` route-row gaps, the `§4`-vs-detail count gaps, the 4-way `D-3` label collision,
and the untracked status of the counting register. None of these changes a line of code. They are listed
in §6.

---

## 3. Decision 1 — USER DECISION REQUIRED — **RESOLVED: Option A**

**Owner decision, September 2026: A.** The implementation-blocking rule applies only to contradictions
that materially change what is built, how the system behaves, or how the implementation is verified. All
other documentation and count discrepancies are documentation debt and do not block implementation.

**Applied to** `governance/Documentation Constitution.md` v1.2 §5.2: the `Continue only after resolution`
row is now scoped to material conflicts, and a new `Documentation debt` row defines the remainder.

**Question (answer with one letter):**

> **Should the rule at `governance/Documentation Constitution.md:212` — "implementation must not proceed
> until the conflict is resolved" — apply to (a) every documented contradiction, or (b) only contradictions
> that change what is built, how it behaves, or how it is verified, with all other contradictions
> classified as recorded, non-blocking documentation debt?**

**Why it is necessary.** It is the only rule that converts the D-1/D-2/D-3 chain into a block. Option (a)
makes the project wait on a per-category countable unit (`D-2:1059-1073`), an intra-section tie-break
(`D-3 §12.2`) and a scope decision, all of which are questions of intent, not fact. Option (b) removes the
block without deciding any counting rule.

| Option | Practical consequence |
|---|---|
| **A. Narrow the rule (recommended)** | Counts in specifications become explicitly non-normative metadata. All 40+ count discrepancies become recorded debt. **D-1, D-2 and D-3 are answered "not needed for implementation" in one stroke** and stay open only as documentation work. Amendment = one sentence plus a version increment, per `Constitution:993-1003` |
| **B. Keep the rule as written** | The full chain becomes REQUIRED NOW: a countable unit per category, a per-class tie-break, and a scope decision must all be taken by the owner before any code is written. Realistic cost is weeks of specification work with no implementation output. Consistent with `D-1:906` ("D-2, D-3, D-4 and D-9 cannot usefully proceed without D-1") |
| **C. Keep the rule, grandfather the existing corpus** | The 40+ known discrepancies are recorded once as a single exception; the strict rule applies prospectively. Unblocks today, but you still owe a countable unit before any automated count check, and a new rule is being created rather than an old one scoped |

**Blocked by it:** implementation of anything at all (Option A unblocks immediately); the counting
register's 6 "blocking" decisions (`audit:791`); any CI count check.

**Safely left unresolved under Option A:** which sub-part of a specification wins (D-1/D-3); what a
"module" or "endpoint" is (D-2); every individual count discrepancy; the `§4` purpose question (`D-1:885`).

**Classification: REQUIRED NOW.**

**Note on what Option A is not.** `D-1:835-842` lists two moves as unavailable: "do nothing" (30+
discrepancies remain, 9 specifications keep asserting an undefined `Complete`) and "defer D-1 and
normalise Finance's counts first". Option A is neither — it is an explicit classification of the
existing corpus as non-blocking, plus one bounded rule change. Option B is the closest to what D-1
assumed, and D-1 was written before the Constitution was located.

---

## 4. Decision 2 — USER DECISION REQUIRED — **RESOLVED: Option A**

**Owner decision, September 2026: A.** The repository, source code and Prisma schema are the authoritative
record of what currently exists. The engineering specifications define the intended target behaviour and
design. Where they differ, the delta is recorded and the specification is the implementation target
unless a later explicit architecture or product decision supersedes it.

**Applied to** `governance/Documentation Constitution.md` v1.2 §4.3: the `Code or Prisma schema
contradicts documentation` row now fixes the direction, the delta-recording location, and leaves a
project-wide delta register as an open §19.3 decision rather than inventing one here.

**Question (answer with one letter):**

> **When a specification number and the repository disagree, which one is normative for implementation —
> the specification text, or the code and Prisma schema?**

**Why it is necessary.** `Constitution:186` currently says "Code or documentation must be updated to
align" — it permits either. In practice this decides what goes on the build list. The repository holds
**99 models** across `apps/api/prisma/schema.prisma` and the domain files, **27 test files / 252 test
cases**, and **no test files at all** for Finance, Operations, Documents & Learning or Reporting, while
specifications claim `Complete` phases. Under one answer, the count gaps *are* the backlog; under the
other, they are not.

| Option | Practical consequence |
|---|---|
| **A. Code + schema are the record of what exists; specifications state intent (recommended)** | A spec number contradicted by the repository is corrected in the spec **when that spec is next edited**. No implementation is blocked, reverted, or re-scoped by a wrong count. Backlog comes from behaviour and acceptance criteria, not from counts |
| **B. Specifications are normative in both directions** | Every spec number becomes a requirement. Finance's 30 designed tables against 5 in the schema, and the 0-test-file domains, become implementation work items. Consistent with `Constitution:172` ("Lower-level documents must never contradict higher-level documents") but makes counts load-bearing |
| **C. Normative per domain, decided domain by domain** | Permitted by `Constitution:174-175` (specificity / gap filling) but requires a per-domain map before it can be applied — which is D-7 work (`D-1:899-900` places D-7 on a separate axis, required before any implementation claim can be checked) |

**Blocked by it:** the definition of the implementation backlog; whether a phase-level count gap is
raised as a defect.

**Safely left unresolved:** nothing in this decision touches D-1, D-2 or D-3. It is independent of them
and can be answered in isolation.

**Classification: REQUIRED NOW** — unless Decision 1 = Option B, in which case this question is subsumed
by the counting chain and should be answered inside it.

**Recommended order:** answer Decision 2 first if you want the smaller question settled; it is answerable
without reference to any counting decision.

---

## 5. Decisions that can be deferred

None of these is required to write code. They stay open as documentation work.

| Decision | Register status | Why it can wait | Trigger to revisit |
|---|---|---|---|
| **D-1** authority within a specification | Blocking (`audit:691`) | Governs which sub-part is authoritative — a documentation question. `D-1:909-914` safe-stop already stands | Only if spec numbers are ever machine-enforced |
| **D-2** countable unit per category | Blocking (`audit:692`) | Required only to count spec rows. `D-2:1176-1201` records 0 definitions in the corpus | Only if automated count verification is wanted |
| **D-3** intra-section tie-break | Blocking (`audit:693`) | No code depends on a `Total` cell. C2 (2 cases) is decidable today; C1 needs D-2 first | Only if counts are enforced |
| **D-4** section identifiers | Blocking | Only matters if a rule cites `§11.2`; Institution Management's phases are `§15`/`§16` | If any rule becomes section-number-keyed |
| **D-5** status vocabulary | Partially independent (`D-1:903-904`) | Finance already defines `Complete = implemented and verified`; adopting it project-wide is a D-5 matter (`D-1:839`) | When a phase must be closed |
| **D-6** verification gate | Blocking, separate axis (`D-1:897-898`) | Affects when work can be *declared* done, not what is built | Before the next `Complete` claim |
| **D-7** repository-to-spec mapping | Separate axis (`D-1:899-900`) | Only needed to check an implementation claim automatically | If Decision 2 = C, or a count gate is wanted |
| **D-8** approval authority | Separate axis (`D-1:900-902`) | Blocks **release gating** for 7 of 10 specs, not implementation | Before the next release |
| **D-9** discrepancy register location | Non-blocking (`audit:699`) | No decision needed: **adopt Finance `§4.1` as the pattern** — record both values, resolve nothing, cite the document. It already exists and needs no new location | — |
| **D-10** status-axis reconciliation | — | Folded into Decision 2: status is a separate axis from design counts (`D-1:640-698`) | — |

**Recommended without a decision:** adopt D-1 Model E (record the conflict, adjudicate per conflict) as the
standing practice for counts — `D-1:816-827` records it as the only model that makes progress while D-2 and
D-3 are open. This needs no rule change; it is how Finance `§4.1` already works.

---

## 6. Documentation discrepancies that are non-blocking

None of these changes behaviour, an interface, a schema, or a test. They are recorded, not decided.

| Discrepancy | Scale | Reference |
|---|---|---|
| `§4` summary figure vs its own detail section | 40+ places, both directions | `D-2 §12.9` (`:864-913`) |
| Test `Total` cell vs its own row sum | 6 of 10 specifications | `D-3 §5.1` |
| Section heading vs body (Operations `48 total` vs 17 blocks; D&L `34 Prisma models:` vs 33 items) | 2 cases | `D-3 §5.2` |
| Phase 6 `§10.1` summary vs route rows (Communication 79 vs 85, Platform 137 vs 142, Operations 127 vs `~121` vs 117) | 3 cases | `D-3 §5.3` |
| `TI-*` tenant-isolation ids counted alongside `TC-*` scenario ids | 8 ids in 4 specs | `D-3 §5.4` |
| Counting register §5.2 says "Three specifications" then lists six cases; the `§8` D-3 row says 6 of 10; `D-1:570` says 4 of 10 | 4 counts of one question | `D-3 §8.1` |
| `D-3` label used by four registers for four unrelated questions | naming | `D-3 §2.2` |
| Counting register is untracked and unlisted in `engineering/00 README.md` | hygiene | `D-3 §1` finding 2 |
| Institution Management's phases are `§15`/`§16`, not `§11` | numbering | `D-1:708` |
| 2 numeric corrections owed to D-1/D-2 (Operations `§10.1` sum is 127 not 123; Communication has 131 `TC-*` id rows, not 132) | 2 figures | `D-3 §5.3`, `D-3 §5.4` |

---

## 7. Dependency / unblocking map

**Outcome: the Option A path was taken.** The block is lifted. `D-1`, `D-2` and `D-3` are closed as
"not required for implementation" and remain only as documentation debt.

```
RESOLVED
  governance/Documentation Constitution.md v1.2
    §5.2  "Continue only after resolution" -> scoped to material conflicts
    §5.2  "Documentation debt"             -> everything else, recorded, non-blocking
    §4.3  code + Prisma schema = record of what exists
          approved specification         = implementation target
        |
        v
  D-1, D-2, D-3 CLOSED as documentation debt  -->  IMPLEMENTATION PROCEEDS
  Remaining blockers are on other axes:
    D-5 / D-6  -> phase status and definition of done  (blocks claiming Complete)
    D-8        -> approval authority                  (blocks release, not implementation)

SUPERSEDED PATHS (not taken)
  Option B  -> D-1 (Q-1) -> D-2 (unit per category) -> D-3 (tie-break) -> D-7 -> implementation
  Option C  -> grandfather, chain still owed prospectively
```

---

## 8. Recommended next implementation step after the required decisions

**Steps 1 and 2 are DONE** (Option A / Option A, applied as `Constitution` v1.2 — see §3, §4 and §10.2).
Step 3 does not apply. Steps 4 and 5 are now the live position.

1. **Record the two answers in the format the Constitution already requires** — question, context, options,
   recommendation, status, resolution (`Constitution:698-707`, "Outstanding Design Decisions" template).
   One short section; no new document class.
2. **If Decision 1 = A:** amend `Constitution:212` to scope the stop condition to implementation-affecting
   conflicts, and bump the version per `Constitution:993-1003`. Then treat the §6 table as a debt list and
   stop investigating it.
3. **If Decision 1 = B:** do not start D-2. Start with D-1's Q-1 (`D-1:885` — *is the `§4` summary a
   reporting surface or a commitment register?*). One answer eliminates one model and unblocks the rest.
4. **Then build.** Implementation should be scoped from behaviour and acceptance criteria, with the Prisma
   schema and the test suite as the record of what exists (Decision 2 = A), and with the spec-vs-repo delta
   recorded at implementation time using the Finance `§4.1` pattern rather than pre-normalised.
5. **Do not** open a new count-normalisation workstream. Nothing in the current implementation backlog
   requires it.

---

## 9. Evidence references

| Source | Lines | What was used |
|---|---|---|
| `governance/Documentation Constitution.md` | `:154-176`, `:178-186` | Source of Truth Hierarchy (specs are Level 3, `:158-166`); `:186` — "Code or documentation must be updated to align" |
| " | `:191-213` | Mandatory conflict process (flag, do not resolve, record, await approval); **`:212` is the blocking rule**; `:209` forbids an assistant from choosing |
| " | `:666-687`, `:689-707` | No undocumented assumptions; flag and record missing information; Outstanding Decisions format and template |
| " | `:942-952`, `:993-1003`, `:1011-1018` | Implementation-completion criteria; amendment process (approve + version increment); v1.1 Approved (now v1.2), **tracked in git** |
| `governance/Documentation Dependency Map.md` | `:617-641` | Appendix A source-of-truth map; no row for counts |
| `docs/DECISION_D1_SPECIFICATION_AUTHORITY.md` | `:36-48`, `:564-588`, `:640-698` | D-1 must not decide D-2…D-10; A–E each fail on different cases; status is a separate axis |
| " | `:816-827`, `:835-842` | Model E progresses while D-2/D-3 are open; options explicitly not available |
| " | `:852-877`, `:883-890` | D-1 not decidable; `:885` — the `§4`-purpose answer eliminates one model outright |
| " | `:892-907` | D-5/D-6/D-7/D-8 on separate axes; D-2/D-3/D-4/D-9 blocked behind D-1; D-8 blocks release |
| " | `:909-921` | D-1 safe-stop; nothing decided, no specification edited |
| `docs/DECISION_D2_COUNTABLE_UNITS_AND_GRANULARITY.md` | `:864-913`, `:1059-1103`, `:1176-1201` | 40+ `§12.9` discrepancies; per-category unit decisions; a named owner is required, ≥4 unresolvable by analysis; 0 unit definitions in the corpus |
| `docs/DECISION_D3_INVESTIGATION.md` | `§5.1-§5.4`, `§11-§13` | 6 of 10 `Total` contradictions; 2 heading cases; Phase 6 rows; id-vs-estimate rows; not decidable; post-write verification |
| `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md` | `:691-699` | The `D-1`…`D-10` register rows, blocking flags |
| " | `:485-490` | 0 of 10 `validate` scripts; 8 of 8 checklists 0%; 0 of 10 cite repository evidence |
| " | `:791` | 10 decisions required, 6 blocking |
| `engineering/*.md` (10 specs) | read-only | Phase 7 status rows (9 of 10 `Complete`); Prisma/test inventory via `git ls-files` |
| `docs/PHASE_6_D2_DECISION_PACKET.md` | `§7` | Existing precedent for a "human decision" packet — format only, content not reopened |

---

## 10. Verification record

### 10.1 Verification before proposing (original packet)

**Verified before proposing anything here:**

- Every rule quoted in §3 and §4 was read at the cited line in `governance/Documentation Constitution.md`
  and `governance/Documentation Dependency Map.md`. Both are **tracked** in git
  (`git ls-files governance architecture`).
- The claim that the counting register is untracked was re-confirmed; the Constitution and Dependency Map
  are tracked. This is the basis for treating the Constitution as the governing authority.
- The claim that no existing rule assigns authority to specification-internal counts was checked against
  Appendix A of the Dependency Map (`:621-641`) and against the `D-1` definitional search (`:854-856`).
- `9 of 10` Phase 7 `Complete` was re-counted from the specification status rows.
- Repository figures (99 models; 27 test files / 252 cases; 4 domains with no test files) come from the
  D-3 investigation's read-only inventory and were not re-measured for this packet; they are cited as
  recorded evidence, not as new measurements.

**Necessity test applied to each proposed decision:**

- **Decision 1** is necessary because `Constitution:212` is the only rule that stops implementation, and it
  is currently absolute. Removing the block requires an owner decision; no analysis can supply it
  (`Constitution:209`, `:672-675`).
- **Decision 2** is necessary because `Constitution:186` explicitly permits either artefact to change, so
  the direction that decides the backlog does not exist yet. It is a statement of intent, not a fact
  retrievable from documents.
- **No third decision was added.** D-4, D-7, D-8, D-9 and D-10 were each tested against "does any
  implementation work wait on this?" and all five came back negative (§5). D-9 was eliminated rather than
  decided: the existing Finance `§4.1` register is a sufficient location, so no new location is needed.
- **No unnecessary decision was included by force.** The 40+ count discrepancies were not turned into
  decisions. The 6 intra-detail contradictions, the 2 heading cases and the Phase 6 route-row gaps are
  listed as debt (§6), not as questions.

**Not done at proposal time:** no specification, schema, migration, source file, test, roadmap,
`governance/` document or existing decision document was modified. `governance/Documentation
Constitution.md` was **read only** — the proposed amendment in §8 was a recommendation, not an applied
change. No counting convention was created. No D-4-or-later decision was investigated. No build, test,
lint, Prisma or migration command was run. No commit.

**Files created by this packet:** this file only.

### 10.2 Verification of the applied owner decisions

**Scope check performed before editing anything** (owner instruction: confirm the minimum artifact set,
and SAFE-STOP if broader changes would be required):

- A repository-wide phrase search for the two rule texts (`must not proceed until`, `Continue only after
  resolution`, `Code or documentation`, `updated to align`, `higher-level document`, `pre-empts`, plus
  `higher document` / `not proceed until the conflict`) returned only three files: this packet,
  `governance/Documentation Constitution.md`, and `governance/Documentation Dependency Map.md:134-136`
  plus one unrelated use in `docs/PHASE_6_SCOPE_VERIFICATION_REPORT.md:207`.
- `Dependency Map:134-136` restates `Constitution §4.2` (lower-level complies, higher prevails) and stays
  consistent with the v1.2 amendment, so it was **not** edited. It is a derived map; the Constitution is the
  authority.
- `architecture/04 Architecture Freeze.md:101` ("single authoritative reference for all implementation
  work") was checked: it defines the approved **design** baseline, which Option A preserves, so it was
  **not** edited.
- No agent instruction file (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`) exists in the repository, so no
  duplicate rule needed updating.
- **SAFE-STOP not triggered:** exactly two artifacts required change, and no third file, and no source,
  schema, migration, test, specification or roadmap file, had to be touched.

**Files changed to apply the decisions — the minimum set:**

| File | Change |
|---|---|
| `governance/Documentation Constitution.md` | §4.3 code-versus-documentation row given direction and a delta-recording location; §5.2 blocking rule scoped to material conflicts plus a new `Documentation debt` row; version 1.1 -> 1.2, date and footer updated; revision history row 1.2 added, per `Constitution:993-1003` |
| `docs/DECISION_BLOCKING_PACKET_D1_D2_D3.md` | Status set to RESOLVED; both decisions recorded as Option A with the amendment they produced; §2 and §7 updated to the resolved state; this record |

**Not changed:** `D-1`, `D-2`, `D-3`, the counting register, the 10 engineering specifications, the
Dependency Map, the Architecture Freeze, all phase reports, roadmaps, source, schema, migrations and
tests. No build, test, lint, Prisma or migration command was run. No commit.

**Known gap left open on purpose:** `Constitution:19.3` says resolved decisions are documented as ADRs,
and the repository has no ADR location. Creating an ADR series for these two decisions is a larger change
than the owner authorised, so it is left as an open decision rather than done by assumption.

