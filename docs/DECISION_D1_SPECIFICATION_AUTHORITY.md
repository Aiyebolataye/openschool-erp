# D-1 — Specification Authority Rule

| Field | Value |
|---|---|
| **Document type** | Decision material — investigation only, no rule adopted |
| **Date** | 2026-09-26 |
| **Repository HEAD** | `aae6309` |
| **Branch** | `phase/2-rbac` |
| **Decision** | D-1 from `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md` |
| **Scope** | D-1 only. D-2 … D-10 are **not** resolved here. |
| **Files changed by this document** | **None.** This report is the only artifact created. |
| **Outcome** | No authority rule exists in documentation. Five models analysed. **D-1 is not decidable from existing evidence** — a human architecture/product decision is required (§10). |

---

## 1. Decision Question

**When a specification contains conflicting statements — particularly where a summary or status
section disagrees with a detailed section — what should determine the authoritative requirement?**

Concretely, for D-1: given `§4 Phase 5 says 14 modules` and `§9.1 lists 16 rows`, which number is the
requirement, and what rule decides it?

This decision is about **document-internal authority**: which part of a specification governs when
the specification contradicts itself. It is **not** about whether the repository is correct, whether
a phase is verified, or whether a document is approved. Those are separate axes, treated
independently in §6.

### 1.1 Why D-1 is first

D-1 is a prerequisite for most of the other nine decisions. Without an authority rule, no count
discrepancy can be resolved, no status can be corrected, and no automated check can be built,
because each of those activities requires deciding which artefact wins. D-1 is the root dependency
(§7).

### 1.2 What D-1 must not do

D-1 must not, by itself, imply any of the following, each of which is a separate open decision:

- a **countable unit** (what a "module", "index", or "endpoint" is) — D-2;
- a **tie-break for self-contradictory detail** — D-3;
- a **section identifier scheme** — D-4;
- a **status vocabulary** — D-5;
- a **verification gate** — D-6;
- a **repository-to-specification mapping** — D-7;
- an **approval authority** — D-8;
- a **discrepancy register location** — D-9;
- a **status-axis reconciliation** — D-10.

---

## 2. Existing State

### 2.1 Summary of the project-wide audit

`docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md` established, across all 10
specifications plus `00 README.md` and `ROADMAP.md`:

| Finding | Detail |
|---|---|
| No counting-authority convention exists | All 38 `authoritative` / `source of truth` / `takes precedence` hits concern **domain data ownership** (e.g. *"Finance is the authoritative owner of financial configuration"*), never count or section precedence. `normative`, `single source`, `in the event of conflict` = **0 hits** |
| No authority map, no conflict policy | A search for `authority map`, `precedence`, `conflict resolution`, `if … disagree`, `errata`, `corrigend` returned **no document-level conflict policy**. All `precedence` hits are ADRs about *domain* precedence (ADR-021, ADR-029, ADR-031, ADR-044) or entity lifecycle states |
| Mismatches are bidirectional | 16 measured categories where the summary **overstates** the detail; 7 where it **understates** it. Neither artefact is systematically more accurate |
| Detail sections are self-contradictory | In 6 of 10 specifications the detail section contains both a right and a wrong number (§5) |
| Section numbers are not portable | Institution Management places Phase 6 at **§15** and Phase 7 at **§16**, not §10/§11 |
| Granularity is not uniform | Platform Administration's §9.2 "Repository **Interfaces**" has per-interface rows; §9.3 "Domain Service **Details**" has per-method rows |
| No status vocabulary | One status value in use (`Complete`), **undefined in 9 of 10**. Finance's definition is audit-introduced and unadopted |
| No verification gate | 10 of 10 assert `2-pass validation`; **no `validate` script exists** in any `package.json`. 8 of 8 readiness checklists are **0% checked** |
| Repository mapping is ambiguous | 11 module directories for 10 specifications; **no directory** for Finance, Operations, Documents & Learning, Reporting & Analytics. Two plausible Prisma homes per domain (`domains/*.prisma` vs the 99-model root `schema.prisma`) |

### 2.2 New evidence found while preparing D-1

Preparing D-1 surfaced material the project-wide audit did not capture, because it lives in
**revision histories** rather than in the status or detail sections. This evidence is the most
direct bearing on D-1 available anywhere in the project, and it changes the picture materially.

#### 2.2.1 The project has corrected counts before — 20+ times — and always in one direction

Seven specifications record count corrections in their revision histories, from two ad-hoc review
passes ("Architecture Review" 2026-07-17, "Final Refinement" 2026-07-20):

| Specification | Ver | Recorded correction |
|---|---|---|
| Academic Management | 1.1.0 | Phase 6 endpoint count (85+ → 110+) |
| Academic Management | 1.2.0 | "test count correction" — **no numbers given** |
| Communication | 1.1 | Phase 4 enum (16→17); **Phase 5 repository (14→27)**; Phase 6 endpoint (95+→**79**); Phase 7 test (~350+→**~215+**) |
| Documents & Learning | 1.1.0 | Phase 4 model (33→34); enum (15→17); Phase 6 endpoint (105+→120); Phase 7 test (~380+→**~285+**) |
| Documents & Learning | 1.2.0 | Phase 4 model (33→34) — **the same correction repeated** |
| Finance | 1.2.0 | Phase 4 enum (16→17); Phase 7 test (~450+ → **~240+**) |
| Finance | 1.4.0 | Phase 5 **status** corrected; 11 discrepancies **recorded without reconciling** |
| Operations | 1.1 | Phase 3 table (48→55); Phase 4 model (**"~18 shown, remainder abbreviated"**); enum (22→23) |
| Operations | 1.2 | Phase 4 enum (23→24) |
| Platform Administration | 1.1.0 | Phase 3 table (48→62); Phase 6 endpoint (120+→137); Phase 7 test (~400+→**~192**) |
| Platform Administration | 1.2.0 | Phase 4 model (48→55); enum (25→22) |
| Reporting & Analytics | 1.1.0 | Phase 3 table (30→31); Phase 4 model (30→31); enum (15→23); Phase 6 endpoint (95+→106); Phase 7 test (~380+→~285+) |
| Reporting & Analytics | 1.2.0 | Phase 7 test (~285+→**~226+**) |
| **Identity & Access** | — | **no count corrections recorded** |
| **Institution Management** | — | **no count corrections recorded** |
| **People** | — | **no count corrections recorded** |

Three observations follow, and they are the core of D-1's evidence base:

1. **Every recorded correction modified the §4 summary count.** No recorded correction ever
   modified a detail section to match a summary. The corrections moved **up and down** — 14→27,
   95+→79, ~350+→~215+, ~400+→~192, ~285+→~226+ — which is only consistent with the **detail
   section having been treated as the fixed point** and the summary as the derived value.
2. **The practice was applied to 7 of 10 specifications and skipped 3.** The three that received no
   correction pass — Identity & Access, Institution Management, People — are **exactly** the three
   the README and ROADMAP both mark "Approved & Frozen". The seven that were corrected are
   **exactly** the seven the ROADMAP marks "Under Review". The correlation is exact.
3. **The practice was never stated as a rule.** It exists only as revision-history prose. No
   specification declares that detail governs summary.

#### 2.2.2 The de facto practice is unreliable, and demonstrably so

The historical corrections moved in the detail-first direction but were **not verified against the
detail**. Verified against the current documents:

| Specification | Correction claimed | §4 today | Detail today | Result |
|---|---|---|---|---|
| Operations | Phase 3 tables 48→55 | 55 | 55 (§7.1) | **agrees** |
| Platform Admin | Phase 3 tables 48→62 | 62 | 62 (§7.1) | **agrees** |
| Platform Admin | Phase 6 endpoints 120+→137 | 137 | 137 (§10.1) | **agrees** |
| Reporting | Phase 6 endpoints 95+→106 | 106 | **102** (§10.3) | **still disagrees by 4** |
| Documents & Learning | Phase 6 endpoints 105+→120 | 120 | **127** (§10.3) | **still disagrees by 7** |
| Documents & Learning | Phase 3 tables — **not corrected** | 33 | **34** (§7.1) | **missed by the same review pass** |
| Documents & Learning | Phase 4 model 33→34 — **corrected twice** | 34 | — | correction repeated, suggesting the first was incomplete |
| Academic | "test count correction" — **no numbers** | ~240+ | 243 (§11.2) | unverifiable from the record |

**So the project's own de facto authority model produced at least 2 known-wrong corrections, missed
1 parallel count, duplicated 1 correction, and produced 1 unverifiable entry.** It is evidence of
what the project has done, not evidence of a rule that works.

#### 2.2.3 The project has used two different behaviours, in the same document

Finance's own revision history contains **both** behaviours:

- **1.2.0** — corrected counts: Phase 4 enum 16→17, Phase 7 test ~450+ → ~240+.
- **1.4.0** — recorded 11 discrepancies in a new §4.1 register **without reconciling them**, on the
  explicit basis that they are unresolved.

These are **mutually exclusive** responses to the same class of problem. Finance 1.2.0 silently
picked a number; Finance 1.4.0 refused to pick and logged instead. The project therefore has no
single settled behaviour even within one specification, and the newer behaviour exists only because
an audit intervened.

#### 2.2.4 Two distinct closing declarations already exist

| Declaration | Specifications | Text |
|---|---|---|
| **"Refer to source code for implementation details"** | **5** — Academic, Documents & Learning, Finance, Identity & Access, Reporting & Analytics | *"It is approved and frozen for implementation. All architectural decisions, business rules, validation constraints, and verification criteria are captured here. Refer to source code for implementation details."* |
| **Modification-policy variant** | **2** — Institution Management, People | *"It has been approved and should only be modified if **future implementation reveals an architectural issue** or a formally approved product requirement changes."* |
| **No closing declaration** | **3** — Communication, Operations, Platform Administration | Document ends at the revision-history table |

The first variant **already asserts a two-axis split** — the specification captures decisions and
rules, the source code captures implementation. That is partial, existing evidence for a typed-axis
model (§6, and Model C in §4).

The second variant is materially different and has a direct D-1 consequence: it makes the
**repository a feedback source into the specification** ("modified if future implementation reveals
an architectural issue"). Under that reading, implementation evidence can legitimately change a
specification requirement — which is at odds with any model in which the specification is
unilaterally authoritative over design. **Two specifications already permit what Model A would
forbid.**

#### 2.2.5 Typed requirement-ID conventions exist but are inconsistent

| Convention | Specifications using it |
|---|---|
| `V-` (validation rules) only | Academic (73), Finance (65), Identity (53), Institution (46), People (53) |
| `BR-` / `TC-` / `INV-` / `POL-` / `CP-` / `VRS-` | Communication (TC 132, BR 32, INV 28, POL 20, CP 20, VRS 12), Operations (TC 67, BR 35, INV 35, CP 25, VRS 20, POL 20), Documents & Learning (BR 36, INV 35, CP 25, POL 20, VRS 12), Reporting & Analytics (INV 35, BR 35, CP 25, POL 20, VRS 12), Platform Administration (BR 40, CP 25, INV 20) |

IDs are domain-scoped where multi-type (e.g. `BR-DL-021`, `BR-COM-004`). **This is a partial
existing basis for typed authority** (Model C): requirements are already addressable by type and
domain, so a type-to-section authority map is mechanically constructible — but the convention is
present in only 5 of 10 specifications and the two families do not align.

### 2.3 Net position entering D-1

| Question | Answer from existing evidence |
|---|---|
| Does a documented authority rule exist? | **No.** Nothing in 10 specifications, the README, or the ROADMAP states one |
| Does a consistent *practice* exist? | **No.** 7 of 10 specs, two ad-hoc passes, no stated rule, and 2 known-wrong outcomes (§2.2.2) |
| Is the practice identifiable? | **Yes, and it is detail-first for counts** — every recorded correction moved the summary toward the detail, never the reverse (§2.2.1) |
| Is the practice successful? | **No.** It produced wrong, missed, duplicated, and unverifiable corrections |
| Do any two specifications behave the same way? | **No.** Three never corrected; seven corrected; two of the seven carry a modification policy that lets the repository feed back into the spec |
| Is D-1 decidable from evidence? | **No** (§8, §9, §10) |

---

## 3. Authority Models Considered

### Model A — Summary-first

> The §4 summary/status section is authoritative. Detailed sections elaborate it. Conflicts are
> resolved in favour of the summary.

**Rationale a stakeholder might offer:** the status table is the document's table of contents of
record; it is what planning, reporting, and dashboards read. It is one place, visible, stable, and
short. Detail sections are long, volatile, and (per §2.2.2) demonstrably error-prone.

### Model B — Detail-first

> Detailed sections are authoritative. Summary counts and statuses are derived from them. Conflicts
> are resolved in favour of the detail.

**Rationale a stakeholder might offer:** this is what the project has actually done 20+ times
(§2.2.1). Detail sections enumerate items one-by-one and are therefore checkable; a summary is a
hand-maintained assertion. The project already contains a fully reconciled worked example
(Platform Administration §10.1 = 137 = 85 + 52).

### Model C — Typed authority

> Authority is assigned per category, not per section position. Requirements and behaviour →
> requirement section; data model → schema section; API → API section; implementation status →
> status/verification section. A conflict is resolved according to the category involved.

**Rationale a stakeholder might offer:** the audit showed that different categories have different
reliability. Test-scenario counts are the worst category (up to 2.8× overstatement) while
module/table counts are mostly reconcilable; a single rule applied uniformly would be
suboptimal. Typed-ID conventions already exist in 5 of 10 specs (§2.2.5), so the machinery is
partly present.

### Model D — Explicit authority markers

> Every specification declares an authority map. Sections without an authority designation cannot
> override designated authoritative sections. Conflicts are recorded until resolved.

**Rationale a stakeholder might offer:** it is the only model that makes the absence of authority
visible and therefore fixable, and it pairs naturally with a discrepancy register (D-9). It is also
the only model that explicitly requires conflict **recording** rather than silent resolution —
which matches the Finance 1.4.0 behaviour and directly prevents the §2.2.2 failure mode.

### Model E — Recorded conflict with per-conflict adjudication (evidence-supported alternative)

> No standing structural default. Each conflict is recorded with both candidate values and their
> evidence, and is adjudicated by a named human decision, which is then recorded. Authority is
> assigned **per conflict**, not per section type.

**Why this is evidence-supported:** it is the only model consistent with **all** the observed
evidence simultaneously.

- It explains why counts were corrected toward the detail (§2.2.1): each correction was a
  per-conflict adjudication that happened to land on the detail value.
- It explains Operations 1.1's *"Phase 4 model count (~18 shown, remainder abbreviated)"*: rather
  than inventing a number, the reviewer **recorded** that the summary was abbreviated — a
  per-conflict record, not a resolution. §8.2 still says "48 total", so the conflict remains open
  today, exactly as this model predicts.
- It explains Finance 1.4.0's §4.1 register.
- It explains why the corrections failed (§2.2.2): under this model, an unverified correction is a
  *decision that was recorded but not checked*, and the failures are exactly the unverified ones
  (Reporting 106, D&L 120, Academic's numberless entry).
- It requires no countable-unit rule to be settled in advance to make progress, because a conflict
  can be *recorded* before it can be *resolved*.

**Caveat, stated plainly:** Model E may be a *complement* to B, C, or D rather than an alternative to
them. It specifies the **conflict-handling procedure**, whereas A–D specify the **authority
structure**. A project could adopt Model E's recording procedure together with Model B's
detail-first structure. This possibility is left open in §9.

### Models explicitly considered and set aside

| Model | Why set aside |
|---|---|
| **Repository-first for everything** | Conflates axes. A specification defines what *should* exist; the repository shows what *does*. The 5 specs declaring *"Refer to source code for implementation details"* scope the repository to **implementation only**, not requirements. Adopting this would mean the repository overwrites design intent — a category error |
| **Recency-wins (latest edit governs)** | The revision histories show corrections were made to §4 only; detail sections were untouched. Recency therefore cannot discriminate — both artefacts have equal or greater recency in the conflicting pairs |
| **Majority-vote across the 10 specs** | The audit shows no consistent majority behaviour: 5 of 10 module counts match, 7 of 10 table counts match, 3 of 10 specs never corrected. There is no dominant practice to inherit |
| **Leave every conflict unresolved forever** | Not a viable steady state; it converts 30+ known discrepancies into permanent untracked risk (§9 of the project-wide audit) |

---

## 4. Model-by-Model Analysis

### 4.1 Model A — Summary-first

**Mechanics.** §4 is designated authoritative. If §4 says 16 modules, the requirement is 16 modules
and §9.1's 16 rows are the corroborating elaboration. A conflict is closed by editing the detail.

**Advantages.**
- **Single, short, stable surface.** §4 is 7 rows per specification. It is what dashboards, plans
  and status reports read, so making it authoritative concentrates the maintenance burden.
- **Cannot be defeated by detail-section noise.** Given §2.2.2 — detail sections contain their own
  contradictions — a model that makes them authoritative inherits their errors. Model A would have
  avoided the Reporting 106-vs-102 and D&L 120-vs-127 residuals by instead correcting 102→106 and
  127→120.
- **Aligns with the "status table" axis.** §4 is the only place implementation status is expressed
  across all 10 specs, so A gives status a single home.
- **Matches the 2 specifications' modification policy** (§2.2.4): if the spec may only change when
  "a formally approved product requirement changes", the summary is the natural place that decision
  lands.

**Failure modes.**
1. **Inverts 20+ historical corrections.** Every recorded correction moved the summary toward the
   detail. Model A would reverse all of them (§4.1.4). This is a large, visible reversal of
   established practice.
2. **The summary is hand-maintained and has no enumeration to check it against.** §4's numbers have
   no internal consistency check. A model that makes them authoritative removes the only available
   cross-check — the detail.
3. **Eliminates the audit mechanism.** The project-wide audit worked *because* §4 and the detail
   disagreed. Under Model A, disagreement is definitionally an error in the detail, so the
   discrepancy class stops being detectable.
4. **Fails badly on the Finance test-scenario category.** Identity's §4 `~350+` and Operations' §4
   `~400+` are the numbers most disconnected from reality. Making those authoritative would ratify
   2.8× and 2× overstatements as requirements.
5. **Directly conflicts with the modification policy** of Institution Management and People, which
   allows the spec to change when *implementation* reveals an issue. Under strict Model A, the
   repository could never be the tie-breaker for a design question.

**Finance behaviour under Model A.**

| Discrepancy | Result under A | Assessment |
|---|---|---|
| 14 vs 16 modules | §4 wins → **16** (already corrected). §9.1's 16 rows corroborate. | Coincidentally the right answer, but for the wrong reason — it agrees with B here |
| 32 vs 30 tables | §4 wins → **32**. But the prior audit found 30 in §7.1 and the repository has **5**. Model A would ratify 32 as the requirement, contradicting both the detail and the repository | **Poor outcome.** §4.1 item 2 would have to record 30 as a known error |
| 45+ vs 26 indexes | §4 wins → **45+**. Uninterpretable, because no spec defines an index-counting unit (D-2 open) | **Cannot be evaluated.** Model A cannot even state the requirement |
| 100+ vs 98 endpoints | §4 wins → **100+**, a non-specific lower bound | Weak; preserves an unverifiable figure |

**Cross-spec test under Model A.**

| Spec | §4 claim | Detail | Model A verdict | Sane? |
|---|---:|---:|---|---|
| People | 58 endpoints | 77 | 58 wins; §10.3's 77 is "wrong" | Understates API surface by 26% |
| Documents & Learning | 33 tables | 34 | 33 wins | Rejects a correct catalogue count |
| Identity & Access | ~350+ scenarios | 126 | ~350+ wins | **Ratifies a 2.8× overstatement** |
| Operations | ~400+ scenarios | 204 | ~400+ wins | **Ratifies a 2× overstatement** |
| Operations | ~18 models | §8.2 "48 total" | ~18 wins | **Ratifies a figure its own revision history calls "abbreviated"** |
| Reporting | 106 endpoints | 102 | 106 wins | Closes a conflict in the wrong direction, against the detail |
| Platform Admin | 137 endpoints | 137 | agrees | ✓ |
| Communication | 27 repositories / 14 modules | 27 / 14 | agrees | ✓ — and A correctly preserves a legitimate non-1:1 relationship |

Model A produces 2 clearly unreasonable outcomes (Identity, Operations test scenarios) and 1
uninterpretable one (indexes) out of 8 tests.

**Dependencies.** Requires D-2 to state the countable unit even to express "45+ indexes" (§4.5).
Requires D-4 to locate §4 reliably, though §4 is positionally stable at section 4 in all 10 specs —
its one structural advantage. **Does not** require D-3 (a self-contradictory detail is simply
overridden). **Does not** require D-9 (conflicts are resolved, not recorded) — which is arguably a
weakness, since D-9 is what makes conflicts visible. Independent of D-5/D-6/D-7/D-8/D-10 on the
requirement axis.

---

### 4.2 Model B — Detail-first

**Mechanics.** The enumerated detail sections are designated authoritative. §4 is a derived view
and is corrected to match. A conflict is closed by editing the summary.

**Advantages.**
- **It is what the project already does.** 20+ recorded corrections, uniformly in this direction
  (§2.2.1). Adopting B ratifies existing practice rather than reversing it — by far the smallest
  behavioural change of any model.
- **Checkable.** A detail section enumerates items one-by-one, so the number is verifiable by
  counting. A summary is an unverifiable assertion. B creates a self-checking structure.
- **It has a working precedent in the project.** Platform Administration §10.1 carries
  Primary / Sub-Resource / **Total** columns that sum exactly to 137 — a fully derived, reconciled
  summary. B is achievable here, and has been achieved once.
- **It makes the audit method permanent.** Discrepancies stay detectable because the summary is a
  claim that can be falsified against the enumeration.

**Failure modes.**
1. **Inherits detail-section self-contradiction — the decisive weakness.** In 6 of 10 specs the
  detail section contains both a right and a wrong number (§5). "Detail is authoritative" does not
   identify which one. Concretely: Identity §11.2 rows sum to 126 while the same table's `Total`
   row says `~350+`; Institution §16.2 rows sum to 154 against its own `~280+`; Operations §11.1
   sums to 204 against §4's `~400+`. **Model B as stated cannot resolve these at all.**
2. **Granularity varies, so "the count" is ambiguous.** Platform's §9.2 has 44 interface rows and
   §9.3 has 60 method rows against §4's 15 repositories and 15 services. B says "take the detail
   count" — but 44 is not a repository count, so B produces a wrong number unless D-2 is settled
   first. **B is not executable before D-2.**
3. **Section numbering is not portable.** B requires naming the authoritative section. Institution
   Management's tables are at §7.1/§9.1/§15/§16.2, not §10.3/§11.2. A rule keyed positionally
   silently skips it. Requires D-4.
4. **Cannot validate the detail against anything.** B has no further authority to appeal to, so a
   wrong detail is final. This is exactly what produced the residuals in §2.2.2 — the corrections
   were never checked.
5. **Rewards enumeration volume, not correctness.** A longer detail section wins by default.
   Operations §8.2's "48 total" beats §4's "~18" under B, and the project has no basis to prefer
   either.
6. **Overwrites legitimate summary-only information.** Under B, a summary claim with no detail
   counterpart must be deleted or back-filled. Institution Management's "14 test categories" and the
   §4-only controller counts in several specs have no natural detail home.

**Finance behaviour under Model B.**

| Discrepancy | Result under B | Assessment |
|---|---|---|
| 14 vs 16 modules | §9.1 wins → **16** | Consistent with the current corrected §4 |
| 32 vs 30 tables | §7.1 wins → **30** | Consistent with the audit's finding; repository has 5, so B still needs the implementation axis to say "designed 30, implemented 5" |
| 45+ vs 26 indexes | §7.4 wins → **26** | Still uninterpretable without D-2; the 26 itself is unverifiable |
| 100+ vs 98 endpoints | §10.3 wins → **98** | Consistent with §4.1 item 4; the 65/35 split remains unverifiable because it is a *summary-only* claim with no detail counterpart — B deletes it |

**Cross-spec test under Model B.**

| Spec | §4 claim | Detail | Model B verdict | Sane? |
|---|---:|---:|---|---|
| Identity & Access | ~350+ scenarios | 126 (rows) / ~350+ (Total row) | **ambiguous — detail contradicts itself** | **Fails** |
| Institution Management | ~280+ scenarios | 154 (rows) / ~280+ (Total row) | **ambiguous** | **Fails** |
| Operations | ~400+ scenarios | 204 | 204 | Reasonable |
| Operations | ~18 models | §8.2 "48 total" + 17 blocks | **ambiguous — three candidates** | **Fails** |
| Platform Admin | ~48 models | 55 | 55 | Reasonable |
| Documents & Learning | 120 endpoints | 127 | 127 | Reasonable |
| Reporting & Analytics | 106 endpoints | 102 | 102 | Reasonable |
| Reporting & Analytics | ~226+ scenarios | 236 (rows) / ~226+ (Total row) | **ambiguous** | **Fails** |
| People | 58 endpoints | 77 | 77 | Reasonable |
| Communication | 27 repos / 14 modules | 27 / 14 | agrees | ✓ |
| Platform Admin | 137 endpoints | 137 | agrees | ✓ |

Model B yields 6 sane results and **4 unresolvable** ones — every one of the 4 being a
self-contradictory detail section. That is the model's structural limit, not a data problem.

**Dependencies.** **Requires D-2** (countable unit) before it can produce a number for repositories,
services, indexes, and controllers. **Requires D-3** (self-contradictory detail tie-break) or it
fails on 4 of 10 specs. **Requires D-4** (section identifiers) to be non-positional. Compatible with
D-5/D-6/D-7 on the requirement axis; does not by itself settle them.

---

### 4.3 Model C — Typed authority

**Mechanics.** Authority is assigned per *category* of content, not per section. Each category
(requirements, data model, API, tests, implementation status) names its own authoritative section.
A conflict is resolved by looking up the category.

**Advantages.**
1. **It matches the observed reliability profile.** The audit found the categories behave very
   differently: test-scenario counts are the worst (2.8× and 2× overstatements, 4 self-contradictory
   cases), while module and table counts reconcile in 5–7 of 10 specs. A uniform rule is
   demonstrably suboptimal; a per-category rule is not.
2. **It matches existing document architecture.** All 10 specs already organise content by category
   (§7 Database, §8 Prisma, §9 Backend, §10 API, §11 Testing, §4 Status). C formalises a structure
   that already exists rather than imposing a new one.
3. **Typed requirement IDs already exist** in 5 of 10 specs — `V-`, `BR-`, `TC-`, `INV-`, `POL-`,
   `CP-`, `VRS-`, domain-scoped (`BR-DL-021`) (§2.2.5). The addressability C needs is partly
   present, so requirements could be routed to an authority without rewriting them.
4. **It is the only model that can legitimately give status its own axis.** Implementation status is
   a different kind of claim from a design count, and C allows §4 to be authoritative for status
   while a detail section is authoritative for a count. This is the shape the Finance correction
   already took.
5. **It degrades gracefully.** Where a category has no detail section — Documents & Learning and
   Reporting & Analytics have **no Controllers section**; Institution Management has **no Phase 6
   endpoint catalogue** — C can designate the summary as the fallback for that category instead of
   failing.

**Failure modes.**
1. **Requires a countable unit per category — D-2, in the strongest form.** C says "the data-model
   section is authoritative for data-model counts". It does not say whether a repository-interface
   row is a repository. Without D-2, C's data-model authority is unusable.
2. **Category boundaries are themselves disputed.** Finance's `45+ indexes` is a data-model claim;
   its `100+ endpoints` is an API claim. But Finance §7.1 catalogues 30 tables while §8.4 Prisma
   lists models — **are tables and models one category or two?** The specs treat them as separate
   phases yet the counts must correspond. C must resolve this, and the answer is a D-2/D-3 matter
   wearing C's clothes.
3. **The most reliable category has no typed anchors.** The 5 specs with `BR-`/`TC-`/`INV-` typed IDs
   are Communication, Operations, Documents & Learning, Reporting & Analytics, Platform
   Administration. The 5 using `V-` only are Academic, Finance, Identity & Access, Institution,
   People. **The convention does not correlate with the specifications that most need typing.**
4. **Highest authoring cost.** 10 specifications × 5–7 categories, each needing a declared
   authoritative section, plus resolution where a category has two plausible homes (Finance tables
   in §7.1 vs models in §8.4).
5. **Can still be defeated by self-contradiction within a category.** Typing does not help Identity
   §11.2, where the test category's own rows and Total row disagree. C routes the conflict to "the
   testing section" and then finds two answers inside it. **Requires D-3.**
6. **Does not specify what happens when two sections share a category.** Institution Management's
   Phase 7 lives at §16 while its §11 is configuration categories — so "the testing section" is
   ambiguous by name. **Requires D-4.**

**Finance behaviour under Model C.**

| Discrepancy | Category | Result under C | Assessment |
|---|---|---|---|
| 14 vs 16 modules | module structure | §9.1 authoritative → **16** | Works |
| 32 vs 30 tables | database design | §7.1 authoritative → **30** | Works, but the same category also contains §7.4 indexes — see next row |
| 45+ vs 26 indexes | database design | §7.4 authoritative → **26** | Works **only if** D-2 defines an index unit; C cannot express "45+" as a requirement without one |
| 100+ vs 98 endpoints | API design | §10.3 authoritative → **98**; the 65/35 split has no detail home and falls back to §4 | Works, and C's fallback rule is a genuine advantage here |
| §4 Phase 3–7 status | implementation status | §4 authoritative (no competing detail) | **C cleanly assigns status to its own axis** — the Finance correction's shape, and the reason C fits Finance better than A or B |

**Cross-spec test under Model C.** C can be made to produce a sane verdict on all 8 cross-spec tests
in §4.2 **except the 4 self-contradictory ones** — because those contradictions occur *within* a
single category, which is exactly where C offers no guidance. So C's coverage is 6 sane + 4
unresolved, the same 4 as Model B, plus a materially higher authoring cost. Its genuine wins are:
status gets its own axis; the 65/35 summary-only claim gets a principled fallback; and the
no-detail-section specs (D&L, Reporting controllers; Institution Phase 6) get a defined fallback
instead of a dead end.

**Dependencies.** **Requires D-2** (per category), **D-3**, and **D-4**. D-9 becomes *necessary*
rather than optional, because a typed map needs somewhere to record conflicts that do not yet have
a resolution. On the status axis it **interacts with D-5/D-6/D-10** but does not settle them.

---

### 4.4 Model D — Explicit authority markers

**Mechanics.** Each specification publishes an authority map — a declaration naming, per section or
per category, whether it is authoritative. Sections without a designation cannot override
designated sections. Conflicts are **recorded** until resolved.

**Advantages.**
1. **The only model that makes the absence of authority visible.** The root finding of the
   project-wide audit is that authority is unstated everywhere. D converts that from an invisible
   defect into a declared, reviewable artefact — and makes the *unmarked* sections explicitly
   non-authoritative, which is a real constraint rather than a default.
2. **It is the only model that mandates conflict recording.** This directly prevents the §2.2.2
   failure mode: under D, a conflict cannot be closed by an unverified edit, because the rule
   requires the conflict to be recorded and only a declared authority (or an explicit decision) can
   close it.
3. **It is self-documenting and auditable.** An authority map is a single reviewable table per
   specification, and its absence is detectable — enabling a project-wide conformance check that
   Model A, B, and C cannot support.
4. **It subsumes the Finance precedent.** Finance §4.1 is a single-section instance of D's
   recording requirement. D generalises it rather than replacing it.
5. **It degrades safely.** Where nothing is designated, D's default is "no authority" → record the
   conflict. This is the safe failure direction: an unrecorded silent choice is impossible.
6. **It composes with A, B, or C.** D is arguably an *orthogonal* mechanism — a declaration of which
   model applies, plus a recording duty — rather than a competitor. A project could adopt
   "B, declared explicitly" or "C, declared explicitly".

**Failure modes.**
1. **Most authoring cost of any model.** 10 specifications × every section, including the ones with
   no summary counterpart. The audit already found sections with no counterpart (§9 Controllers
   absent in 2 specs; Institution Phase 6 catalogue absent), so the map would contain explicit
   *gaps* — which is honest but large.
2. **A declaration is not a decision.** D specifies *where* authority lives, not *what the answer
   is**. D alone does not resolve 14 vs 16; it only guarantees the question is routed and recorded.
   This is a feature for a governance rule, but it means **D cannot by itself close any open
   discrepancy** — a real limitation to weigh.
3. **Requires D-9 to function.** Recording without a designated register location is how Finance
   §4.1 already drifted (item 1 still says *"§4 summary claims 14 modules"* although the live row
   no longer says 14). D without D-9 repeats that failure.
4. **Drift risk on the map itself.** A declared authority map is a new artefact that will go stale,
   exactly as the ROADMAP's 10 stale line counts did. It needs a maintenance owner, which is itself
   a governance decision not currently in scope.
5. **Does not resolve self-contradiction inside a designated section.** If §11.2 is designated
   authoritative for test counts, Identity's 126-vs-`~350+` is still two numbers inside the
   authoritative section. **Requires D-3.**
6. **Inert without enforcement.** A declared map that nothing checks will drift. D is only as strong
   as the conformance process attached to it — which no current project artefact provides.

**Finance behaviour under Model D.**

| Discrepancy | Result under D | Assessment |
|---|---|---|
| 14 vs 16 modules | Routed to whichever section Finance's authority map designates; **recorded, not silently closed** | **The right shape** — matches Finance §4.1 item 1, which is correctly left open |
| 32 vs 30 tables | Routed and recorded; remains open until a declared authority or a decision closes it | Matches §4.1 item 2 |
| 45+ vs 26 indexes | Routed and recorded; **cannot be closed** until D-2 defines an index unit | Honest — D surfaces that this conflict is not yet resolvable, which is true |
| 100+ vs 98 endpoints | Routed and recorded; remains open per §4.1 item 4 | Matches current state exactly |

Under D, **all four Finance discrepancies remain open and correctly recorded** — which is precisely
the state §4.1 already describes. D is the only model that is *descriptively accurate* about the
current state without adopting a substantive answer.

**Cross-spec test under Model D.** D does not attempt to produce a verdict on any of the 8
cross-spec tests; it routes each to a declared authority. That is a **feature for governance** (no
false precision) and a **limitation for resolution** (no discrepancy is actually closed). Where D
is combined with B, the 6 sane cross-spec cases resolve as in §4.2 and the 4 self-contradictory
cases still require D-3.

**Dependencies.** **Requires D-9** (register location) to be functional. **Requires D-3** for
self-contradictory detail. **Requires D-4** so the map can name sections non-positionally.
**Requires D-2** to make data-model authority expressible. On the status axis it is silent — D says
nothing about *what* status means, so **D-5, D-6, D-7, D-8 and D-10 all remain fully open under D**.

---

### 4.5 Summary comparison

| Criterion | A — Summary-first | B — Detail-first | C — Typed authority | D — Authority markers | E — Per-conflict adjudication |
|---|---|---|---|---|---|
| Reverses recorded practice? | **Yes — all 20+ corrections** | No — ratifies it | Partly — formalises it | No | No |
| Resolves Finance 4 discrepancies? | 2 of 4 (2 poor, 1 uninterpretable) | 3 of 4 | 4 of 4 routed, 3 resolved | **0 of 4 — routed and recorded** | 0 of 4 — recorded, then adjudicated |
| Handles self-contradictory detail? | Yes (overrides it) | **No — fails on 4 of 10** | No (within-category) | No (needs D-3) | Partly — records it, resolves by decision |
| Handles non-portable section numbers? | **Yes — §4 is stable in all 10** | No (needs D-4) | No (needs D-4) | No (needs D-4) | Not applicable |
| Handles differing granularity? | Weakly (ignores detail) | **No — needs D-2** | No (needs D-2) | No (needs D-2) | Not applicable until resolution |
| Handles summary **understating**? | **No — ratifies the understatement** | Yes | Yes | Records it | Records it |
| Handles summary **overstating**? | **No — ratifies the overstatement** | Yes | Yes | Records it | Records it |
| Separates status from design? | No | No | **Yes** | Not addressed | Not addressed |
| Requires countable unit (D-2)? | Yes | **Yes, blocking** | **Yes, blocking** | Yes | Deferred until resolution |
| Requires D-3? | No | **Yes** | **Yes** | **Yes** | Yes, for automated resolution |
| Requires D-9? | No | No | Yes | **Yes, blocking** | **Yes, blocking** |
| Produces a ratifiable outcome? | Yes, but partly unsound | Partly | Yes, at high cost | **No — routes only** | No — routes, then decides |
| Authoring cost | Low | Low | High | **Highest** | Medium (grows with conflicts) |

**No model is uniformly superior.** A is cheapest and structurally simplest but ratifies known
overstatements. B matches existing practice but is structurally unable to resolve 4 of 10
specifications. C is the best fit for the observed category reliability and the only model that
separates the status axis, at the highest structural cost after D. D is the only model that records
by obligation and therefore cannot produce a wrong silent answer, but it closes nothing by itself.
E is the only model consistent with all observed evidence, but may be complementary rather than
alternative.

---

## 5. Self-Contradictory Detail Problem

**A summary-vs-detail authority rule cannot resolve a contradiction *inside* the detail section.** This
is the single most important limitation on Models B, C, and D, and it is why D-3 exists as a
separate decision.

### 5.1 The six confirmed cases

| Specification | Section | The two conflicting values inside the *detail* section |
|---|---|---|
| Identity & Access | §11.2 | Per-category scenario rows sum to **126**; the same table's `Total` row says **`~350+`** |
| Institution Management | §16.2 | Category rows sum to **154**; the same table's `Total` row says **`~280+`** |
| Operations | §8.2 | Section heading says **`Key Models - 48 total`**; the body contains **17** `model` blocks |
| Operations | §11.1 vs §4 | Category rows sum to **204**; §4 claims **`~400+`** |
| Platform Administration | §8 | §4 claims **`~48` models**; the section contains **55** `model` blocks |
| People | §11.2 vs §4 | §4 claims **`~310+`**; the `Total` row claims **`~330+`**; category rows sum to **172** |

### 5.2 Why each model is affected

- **Model A** is immune — it overrides the whole section with the summary. But it thereby adopts the
  summary's own errors (§4.1: ratifying Identity's `~350+` and Operations' `~400+`).
- **Model B** is **structurally stuck.** "The detail section is authoritative" does not select
  between 126 and `~350+`; both are in the authoritative section. The same applies to all 6 cases.
- **Model C** routes the conflict into the right category and then finds two answers inside it.
  Typing adds no guidance for an intra-category contradiction.
- **Model D** designates a section and then finds two answers inside it. D's recording duty at least
  makes the conflict visible, but the authority rule alone does not close it.
- **Model E** handles it best: the conflict is recorded with both values and adjudicated by a named
  decision. But it substitutes human judgement for a structural rule, which is precisely why it
  cannot be derived from the documents.

### 5.3 A second, related problem: the abbreviation

Operations revision 1.1 recorded *"Phase 4 model count (~18 shown, remainder abbreviated)"*. The
reviewer **declined to state a number** and recorded the limitation instead. §8.2 still says
"48 total". This is neither a summary-vs-detail conflict nor a self-contradiction — it is a
**materially incomplete detail section**. No authority model has anything to say about it, because
there is no complete detail to defer to. Model B would have to pick 48, 17, or `~18`; Model A would
pick `~18`; both would be assertions rather than derivations.

### 5.4 Implication for D-1

**D-1 alone cannot produce a correct answer for all 10 specifications.** Any model adopted must be
paired with D-3, or must itself contain an intra-section tie-break. This is stated as a dependency
in §7, not as a recommendation.

---

## 6. Separation of Authority Axes

The audit brief requires that four axes not be conflated. They are distinct, and the evidence
already partially separates them.

### 6.1 The four axes

| Axis | Question it answers | Authoritative artefact | Current state |
|---|---|---|---|
| **Specification / requirement authority** | What *should* exist | The specification's designated requirement section — **undeclared** | No authority declared in any of 10 specs. **This is D-1.** |
| **Implementation / repository authority** | What *does* exist | The repository | Partially asserted: 5 specs declare *"Refer to source code for implementation details"*. No spec-domain→repository mapping exists (D-7) |
| **Verification authority** | Whether a claim has been proven | A verification artefact — **none exists** | No `validate` script in any `package.json`; 8 of 8 readiness checklists 0% checked. **This is D-6** |
| **Approval authority** | Whether a document is frozen/released | A governance document — **contested** | README and ROADMAP conflict for 7 of 10 specs. **This is D-8** |

### 6.2 Why the axes must stay separate

A specification defines what **should** exist; the repository establishes what **does** exist. A
phase can be fully specified and entirely unimplemented — Finance is exactly this state, and the
correct description is `Specified / Not Implemented`, not "wrong". Collapsing the axes produces two
distinct errors:

- **Treating the repository as design authority** would silently delete unimplemented-but-required
  behaviour. Finance's 30 designed tables and 98 designed endpoints would vanish because 5 tables
  and 0 endpoints exist. The 2 specs whose modification policy says the spec changes when
  *"future implementation reveals an architectural issue"* (§2.2.4) explicitly contemplate a
  narrower version of this, but only for **architectural issues**, not as a general rule.
- **Treating the specification as implementation authority** would ratify 30 designed tables as
  "delivered" when the repository has 5.

### 6.3 Existing evidence that already separates the axes

The project is further along on axis separation than the audit's summary suggests:

1. **5 specifications explicitly scope the repository to implementation:** *"All architectural
   decisions, business rules, validation constraints, and verification criteria are captured here.
   **Refer to source code for implementation details.**"* This is a two-axis statement in a closing
   line of 5 documents.
2. **2 specifications state a modification policy that admits implementation feedback** into the
   requirement axis, but narrowly — *"should only be modified if future implementation reveals an
   architectural issue or a formally approved product requirement changes."* Note the second
   clause: a **product** requirement can also change the spec, which means the requirement axis has
   an input outside both the spec and the repository.
3. **Finance's corrected §4 already separates them explicitly**, citing repository state (5 tables,
   5 models, 0 endpoints, 0 tests) as distinct from design state (30 tables, 98 endpoints, 239
   scenarios). This is the shape the other 9 specs lack.

### 6.4 Consequence for D-1

**D-1 governs only the specification/requirement axis.** It must not be written to also settle
implementation, verification, or approval authority, or it will silently pre-empt D-6, D-7 and D-8.
In particular:

- A D-1 rule of "detail sections are authoritative" applies to **what is specified**, and says
  nothing about whether any of it is built.
- The Finance status corrections are **not** D-1 decisions. They are axis-2 (repository) findings
  that happened to be recorded in a requirement document.
- Whether `Complete` requires a verification artefact is D-6, not D-1.

---

## 7. Decision Dependencies

### 7.1 Decisions that depend on D-1

| Decision | Depends on D-1 how | Blocked without D-1? |
|---|---|---|
| **D-2 countable unit** | D-1 says *which section* governs; D-2 says *what to count inside it*. Without D-1 there is no section to define a unit for. Conversely, **D-2 blocks D-1 for B, C and D** — they cannot produce a number without it | **Mutually blocking for B/C/D.** A can proceed with a summary-only unit |
| **D-3 self-contradictory detail** | The tie-break applies *within* the section D-1 designates. D-1 cannot specify the tie-break because it does not know which section is authoritative | **Yes** — B, C and D each fail on 6 specs without it |
| **D-4 section identifiers** | D-1 must name authoritative sections. Institution Management's offset numbering (§15/§16) makes positional names unsafe. A is the only model whose designated section (§4) is positionally stable in all 10 | **Yes** for B, C, D; **No** for A |
| **D-5 status vocabulary** | Independent of D-1 on the requirement axis, but D-1 determines whether status lives in a section subject to D-1's rule or on its own axis | Partially |
| **D-6 verification gate** | **Separate axis** (§6). D-1 does not pre-empt it | No |
| **D-7 repository mapping** | **Separate axis** (§6). Needed for any implementation claim, not for D-1 | No |
| **D-8 approval authority** | **Separate axis** (§6) | No |
| **D-9 discrepancy register** | A recording duty only makes sense once there is something to record. D and E require it; C benefits. If D-1 lands as A or B, recording is optional | **Yes for D and E** |
| **D-10 status-axis reconciliation** | Requires D-1 to have separated requirement authority from status authority (§6.4) | Yes, for correctness |

### 7.2 The dependency structure

```
D-1 (authority rule)  ──┬──> D-3 (self-contradictory tie-break)  ──┐
                        ├──> D-4 (section identifiers)  ───────────┤
                        ├──> D-2 (countable unit)  <──BLOCKS──────┤
                        │                                        ├──> closes discrepancies
                        └──> D-9 (register)  ─── required by D, E ─┘

Separate axes, not blocked by D-1:
   D-5 (status vocabulary) · D-6 (verification gate) · D-7 (repo mapping) · D-8 (approval)
```

### 7.3 A genuine circularity, stated rather than hidden

**D-1 ↔ D-2 are mutually blocking for Models B, C, and D.** Each needs the other:

- D-1 cannot designate "the data-model section is authoritative" without knowing whether a
  repository-interface row is a repository (D-2).
- D-2 cannot define "a module is a row in the module-structure table" without knowing that section
  is authoritative (D-1).

This circularity is **not** present under Model A, which needs only a summary-level unit, nor under
Model E, which can record a conflict before it can be resolved. **The choice among A, B, C, D and E
therefore determines whether the project faces a circular dependency or a linear one** — which is a
substantive consequence of D-1 and should be weighed as such.

---

## 8. Unresolved Questions

Only questions genuinely required *before* D-1 can be chosen. Each is unanswerable from the
documentation.

| # | Question | Why it cannot be answered from evidence |
|---|---|---|
| **Q-1** | **Is the §4 summary a claim to be audited, or a decision to be trusted?** | This is the A-vs-B fork and it is a statement of intent, not a fact. The evidence shows both behaviours (7 specs corrected the summary; 5 specs declare the spec "approved and frozen" while the repository contradicts them) but no document says which the summary *is* |
| **Q-2** | **Should §4 be derived, or independently authored?** | The project's two review passes edited §4 to match detail, implying derivation. But 5 specs also declare §4's freeze status in a closing line, implying it is independently authored. The two roles are incompatible and both are present |
| **Q-3** | **Which categories, if any, deserve their own authority?** | Requires knowing whether test-scenario counts, index counts, and module counts are the same *kind* of claim. The audit shows they behave very differently, but that is evidence of difference, not of what the project wants |
| **Q-4** | **Is recording a conflict an obligation or an option?** | Finance 1.2.0 silently corrected; Finance 1.4.0 recorded. Both are in one document's history. Only a project decision can say which is required |
| **Q-5** | **Who adjudicates, and where is the decision recorded?** | Model E is unworkable without an owner. No artefact names an adjudicator for specification conflicts |
| **Q-6** | **Does D-1 apply to the correction of the 30+ known discrepancies, or only to future ones?** | Determines whether adopting D-1 forces an immediate project-wide correction pass, or applies only going forward. Materially different amounts of work |
| **Q-7** | **Should §4 be allowed to carry claims with no detail counterpart at all** — e.g. Finance's `65 primary + 35 sub-resource` split, or Institution Management's endpoint counts? | Under B these must be deleted or back-filled; under A they stand; under D they must be recorded as unsupported. **No evidence indicates the project's intent** |
| **Q-8** | **Is the goal correctness, or traceability?** | A rule optimised for traceability (D, E) preserves uncertainty and makes it visible. A rule optimised for correctness (A, B) demands a number now, even where no basis for it exists — as Operations 1.1's "abbreviated" entry shows the project has previously refused to do |

**Q-8 is the deepest of these.** The two goals produce genuinely different rules, and the project
has pursued both at different times without noticing.

---

## 9. Decision Options

Presented neutrally. **No option is selected or recommended.**

### Option 1 — Adopt Model A (Summary-first)

§4 designated authoritative for all design and status claims; detail sections are elaborations;
conflicts closed by editing the detail.

- **Resolves immediately:** 2 of 4 Finance discrepancies.
- **Cost:** ratifies Identity's `~350+` and Operations' `~400+` as requirements; ratifies Finance's
  32 tables and 45+ indexes; **reverses 20+ historical corrections**.
- **Blocked on:** D-2 (summary-level unit only). **Not blocked on** D-3, D-4, D-9.
- **Structural note:** the only model whose designated section is positionally stable across all 10
  specs.

### Option 2 — Adopt Model B (Detail-first)

Detail sections designated authoritative; §4 derived.

- **Resolves immediately:** 3 of 4 Finance discrepancies.
- **Cost:** **fails on 4 of 10 specifications** without D-3; produces wrong repository/service counts
  without D-2; skipped on non-portable numbering without D-4.
- **Ratifies** the direction of all 20+ historical corrections.
- **Blocked on:** D-2, D-3, D-4. **Circular with D-2** (§7.3).

### Option 3 — Adopt Model C (Typed authority)

Per-category authority map; conflicts routed by category; summary as declared fallback where a
category has no detail section.

- **Resolves immediately:** 3 of 4 Finance discrepancies, and cleanly separates implementation
  status onto its own axis.
- **Cost:** highest structural authoring burden after D; requires per-category countable units
  (D-2); still fails on the 4 self-contradictory specs without D-3.
- **Blocked on:** D-2, D-3, D-4, D-9.

### Option 4 — Adopt Model D (Explicit authority markers)

Each specification declares an authority map; undesignated sections cannot override designated ones;
conflicts recorded until resolved.

- **Resolves immediately:** **0 of 4** — routes and records all four, matching Finance §4.1's
  current state.
- **Cost:** highest authoring burden; a declaration without enforcement drifts; closes nothing by
  itself.
- **Blocked on:** D-3, D-4, D-2, and **D-9 (blocking)**.
- **Structural note:** may compose with B or C — "B, declared explicitly" is a coherent variant not
  listed separately above.

### Option 5 — Adopt Model E (Per-conflict adjudication)

No standing structural default; every conflict recorded with both candidates and adjudicated by a
named decision.

- **Resolves immediately:** 0 of 4 directly; each is recorded, then decided.
- **Cost:** no automation possible; resolution throughput depends entirely on adjudicator capacity;
  requires D-9 to function and an owner to exist (Q-5).
- **Blocked on:** D-9 (blocking), Q-4, Q-5.
- **Not blocked on** D-2 — a conflict can be recorded before it is resolvable. **This is E's main
  practical advantage: it is the only model that makes progress while D-2 and D-3 are open.**
- **Structural note:** may be complementary to B/C/D rather than an alternative (§3).

### Option 6 — Adopt a hybrid (explicitly combining elements)

For example: typed authority (C) for the requirement axis, mandatory recording (D/E) for anything
D-1 cannot resolve, and summary-as-derived. This is a legitimate choice but was **not** among the
models specified in the brief, and is listed only to note that the brief's A–D are not exhaustive.

### Options explicitly not available

| Not available | Reason |
|---|---|
| Adopt Finance's `Complete` definition project-wide | The brief prohibits it, and the audit found it is audit-introduced and unadopted. It is a D-5 matter, not D-1 |
| Adopt the audit's candidate "detail-over-summary" rule as-is | The audit found it **undecided and insufficient as written** — it is not a resolution, and adopting it silently would pre-empt D-2/D-3/D-4 |
| Defer D-1 and normalise Finance's counts first | Requires choosing a number with no rule to choose it by, and sets a precedent for 9 other specifications without a governing rule |
| Do nothing | 30+ known discrepancies remain, and 9 specifications continue to assert an undefined `Complete` |

---

## 10. Recommendation for Decision Process

**This document does not recommend which authority model the project should adopt.** The evidence
does not distinguish between the viable models. What follows is what would be required to select
one.

### 10.1 Why D-1 is not decidable from existing evidence

1. **No documented rule exists to inherit.** All 38 authority-keyword hits concern domain data
   ownership, never count or section precedence. There is no rule Finance failed to follow,
   because there is no rule.
2. **The observed practice is contradictory at the level of intent.** Every recorded count
   correction moved summary→detail, which implies derivation. But 5 specifications declare §4's
   frozen status in prose and 2 declare a modification policy admitting external change — which
   implies independent authorship. Both models are present in the corpus simultaneously.
3. **The observed practice failed when applied.** 2 corrections remain wrong, 1 parallel count was
   missed, 1 was duplicated, 1 recorded no numbers. The precedent does not demonstrate that
   detail-first works.
4. **The models are not separated by the evidence.** §4.5 shows A, B, C, D and E each fail on
   *different* known cases, and each resolves *different* ones. There is no case that eliminates a
   model, and no case that uniquely favours one.
5. **The deepest fork is a matter of intent, not fact.** Q-1 — *is the summary a claim to be audited
   or a decision to be trusted?* — cannot be answered by inspecting documents. It is a statement of
   what the summary is for.

### 10.2 A human architecture/product decision is required

D-1 requires a decision from the architecture or product owner on **Q-1** above all, and secondarily
on **Q-2, Q-3, Q-4 and Q-8**. No amount of further inspection of the specifications will resolve
them, because the corpus contains both behaviours by design history and declares neither as
intended.

### 10.3 Evidence that would discriminate between the models

If the decision owner wants additional input before choosing, these are the specific artefacts that
would actually discriminate, in descending order of value:

| Artefact | What it would settle |
|---|---|
| **A statement of what the §4 summary is for** — reporting, planning, or both | **Q-1, the A-vs-B fork.** If §4 is a reporting surface, B (derived). If it is a commitment register, A. This single answer eliminates one model outright |
| **Whether any consumer parses §4 programmatically** — dashboards, generators, CI | Whether §4 must be *correct* (A/B) or merely *honest* (D/E). Currently no consumer was found, which is itself evidence that the question has never been forced |
| **The intended relationship of the two 2026-07 review passes** — were they a conformance check against detail, or an independent re-estimate? | Whether the 20+ corrections were *derivations* or *re-estimates*. If re-estimates, B's precedent claim is void |
| **A decision on D-2 for indexes and repositories specifically** | Would unblock B, C and D for the two categories where they currently cannot produce a number |
| **Whether D-1 applies retroactively to the 30+ known discrepancies** (Q-6) | Determines whether choosing A or B triggers an immediate project-wide correction pass |
| **An owner for conflict adjudication** (Q-5) | The precondition for Model E, which is otherwise unworkable |

### 10.4 What can proceed in parallel without D-1

To avoid a total block, these audit-recommended decisions are on **separate axes** (§6) and are not
pre-empted by D-1:

- **D-6 (verification gate)** — independent; defines what evidence proves a claim, not which section
  is authoritative.
- **D-7 (repository-to-spec mapping)** — independent; required before any implementation claim can be
  checked.
- **D-8 (approval authority)** — independent; resolves the README/ROADMAP conflict for 7 of 10
  specs, which blocks release gating regardless of D-1.
- **D-5 (status vocabulary)** — partially independent; D-1 determines only whether status is subject
  to the requirement rule or sits on its own axis.

**D-2, D-3, D-4 and D-9 cannot usefully proceed without D-1**, since each defines the content of a
section that D-1 designates.

### 10.5 Safe-stop

**No existing authority rule was found, so there is nothing to report in place of creating
alternatives.** Models A, B, C, D and E were constructed from the brief and from observed project
behaviour. **The evidence does not distinguish between them, so a human architecture/product decision
is required.**

**Nothing was decided, adopted, or applied.** No engineering specification was edited. No project-wide
convention was added. Finance was not modified — no status changed, no version bumped, no §4.1
edited. D-2 and D-3 were not touched. No existing audit document was modified, including
`docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md` and
`docs/PHASE_6_FINANCE_MODULE_COUNT_INVESTIGATION.md`. No code, Prisma, test, UI, or configuration
file was modified. Nothing was committed.

---

## 11. Verification Performed

All checks were read-only. No build, test, Prisma, migration, or lint command was executed.

| # | Check | Established |
|---|---|---|
| 1 | Enumerated requirement/business-rule ID prefixes across all 10 specs | 7 typed families (`V-`, `BR-`, `TC-`, `INV-`, `POL-`, `CP-`, `VRS-`); present in 5 of 10 specs, `V-`-only in the other 5 — partial basis for typed authority (§2.2.5) |
| 2 | Searched all specs for `authority map`, `precedence`, `conflict resolution`, `disagree`, `discrepancy`, `errata`, `corrigend`, `supersede` | **No document-level authority map or conflict policy.** All hits are domain ADRs or entity lifecycle states (§2.1) |
| 3 | Read every specification's closing declaration | 5 declare *"Refer to source code for implementation details"*; 2 declare a modification policy admitting implementation feedback; 3 have no closing declaration (§2.2.4) |
| 4 | Extracted the complete revision history of Documents & Learning | Two count-correction entries, incl. a **duplicated** model-count correction (33→34 in both 1.1.0 and 1.2.0) |
| 5 | Extracted recorded count corrections from all 10 revision histories | 20+ corrections across 7 specs; **all** applied to §4 summary counts; **none** modified a detail section; 3 specs recorded none (§2.2.1) |
| 6 | Verified whether each "corrected" count now agrees with its detail section | Operations Phase 3 and Platform Phase 3/6 **agree**; **Reporting Phase 6 (106 vs 102) and D&L Phase 6 (120 vs 127) still disagree**; D&L Phase 3 (33 vs 34) was **missed** (§2.2.2) |
| 7 | Verified the correction/no-correction split against approval status | The 7 corrected specs are **exactly** the 7 ROADMAP marks "Under Review"; the 3 uncorrected are **exactly** the 3 marked "Approved & Frozen" in both documents (§2.2.1) |
| 8 | Re-read Finance revisions 1.2.0 and 1.4.0 | Two mutually exclusive behaviours inside one document: silently correct (1.2.0) vs record without reconciling (1.4.0) (§2.2.3) |
| 9 | Confirmed the six self-contradictory detail cases and their current values | Identity 126/`~350+`; Institution 154/`~280+`; Operations §8.2 "48 total"/17 blocks; Operations tests 204/`~400+`; Platform §4 ~48/55 blocks; People `~310+`/`~330+`/172 (§5.1) |
| 10 | Confirmed no programmatic consumer of the §4 status table exists | Repo-wide search: every reference to `engineering/*.md` is prose or a code comment (e.g. `// Authoritative design source:` in `apps/api/prisma/domains/academic.prisma`, `apps/api/prisma/domains/people.prisma`, `apps/api/src/modules/people/people.utils.ts`) — **no parser, generator or dashboard**, and **no CI of any kind** (`.github`, `.gitlab-ci.yml`, `azure-pipelines.yml`, `Jenkinsfile`, `.circleci` all absent) — so the A-vs-B fork has never been forced by a consumer (§10.3) |

---

*End of D-1 decision material. Investigation only: no engineering specification edited, no
project-wide convention added, Finance unmodified (no status change, no version bump, no §4.1 edit),
D-2 and D-3 untouched, no existing audit document modified, no code/Prisma/test/UI/configuration
change. No model adopted and no option selected. Nothing was committed.*
