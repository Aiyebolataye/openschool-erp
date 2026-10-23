# Project Specification Counting and Status Convention Audit

| Field | Value |
|---|---|
| **Audit type** | Read-only; investigation only |
| **Date** | 2026-09-26 |
| **Repository HEAD** | `aae6309` |
| **Branch** | `phase/2-rbac` |
| **Specifications inspected** | **10 of 10** (all files in `engineering/` matching `*Engineering.md`) |
| **Supporting documents inspected** | `engineering/00 README.md`, `engineering/ROADMAP.md` |
| **Repository artefacts inspected** | `apps/api/src/modules/**`, `apps/api/prisma/**`, `apps/api/package.json`, `apps/web/package.json` |
| **Files changed by this audit** | **None.** This report is the only artifact created. |
| **Result** | **B — a project-wide documentation gap.** No counting convention and no status convention exist to have been followed. See §10. |

---

## 1. Scope

This audit investigates whether the Finance specification's internal count discrepancies are an
isolated defect or an instance of a project-wide convention problem.

**All 10 engineering specifications were inspected:**

| # | Specification | Lines | §4 status-table shape |
|---|---|---:|---|
| 1 | Identity & Access | 1,138 | 7 phase rows, `Complete` throughout |
| 2 | Institution Management | 1,395 | 7 phase rows, `Complete` throughout |
| 3 | People | 1,757 | 7 phase rows, `Complete` throughout |
| 4 | Academic Management | 1,944 | 7 phase rows, `Complete` throughout |
| 5 | Finance | 1,897 | 7 phase rows; 5 corrected to `Specified / Not Implemented` by prior audit |
| 6 | Communication | 2,960 | 7 phase rows, `Complete` throughout |
| 7 | Operations | 2,633 | 7 phase rows, `Complete` throughout |
| 8 | Documents & Learning | 2,012 | 7 phase rows, `Complete` throughout |
| 9 | Reporting & Analytics | 1,922 | 7 phase rows, `Complete` throughout |
| 10 | Platform Administration | 3,709 | 7 phase rows, `Complete` throughout |

For each specification the audit extracted, by direct mechanical count of the specification's own
sections:

- summary counts from the §4 Engineering Status table;
- detail counts from the table catalogue, Prisma model listings, module/repository/service/controller
  tables, endpoint catalogues, and test-category tables;
- every explicit statement of counting authority ("authoritative", "source of truth", "derived",
  "takes precedence", "must equal", "must match", "canonical", "binding", "normative");
- every definition of status vocabulary, verification gate, or completion criterion;
- repository, Prisma, and test evidence bearing on implementation claims.

**Methodological caveat, stated up front.** These specifications were authored over time rather
than from one template, so their detail sections are **not at uniform granularity or uniform
section numbers** (§7.2, §7.3). Row counts are therefore a *reliable* comparison only where the
compared sections serve the same purpose. Where they do not, the mismatch is reported as
**"granularity differs — not directly comparable"** rather than as a defect. This limitation is
itself a finding (§7.2).

No specification, code file, Prisma schema, test, UI, or configuration file was modified. No
version was bumped. No count was normalised or corrected. No architectural decision was made.

---

## 2. Existing Conventions

### 2.1 Explicit counting-authority conventions found: **NONE**

A keyword search across all 10 specifications for authority language returned 38 hits. **Every
single one concerns domain data ownership, not document-internal count authority.**

| Term | Hits | What the hits actually say |
|---|---:|---|
| `authoritative` | 8 | Finance: *"the Invoice is the authoritative financial document"*, *"the institution's authoritative **settlement currency**"*, plus the D-3 terminology lock and two audit-trail entries. Academic: *"Published results are authoritative"*. Institution: ADR-031 *"Finance is the authoritative owner of financial configuration"*. Reporting: *"the authoritative record always resides in the owning domain"*. **None refers to a summary or a count.** |
| `source of truth` | 10 | All concern which **domain** owns a record: *"Operational domains are source of truth"* (Reporting ×4), *"internal UUIDs remain the source of truth"* (People), *"the Invoice … is the source of truth"* (Finance ×3), *"ADR-031 takes precedence"* (Institution). **None refers to a count or a section.** |
| `takes precedence` | 2 | Both are the same ADR-031 statement about `financial.*` configuration ownership between two domains. **Not about summary-vs-detail precedence.** |
| `derived` | 5 | All concern read-model projections: *"Report Cards are derived from Results"*, *"Compliance data is derived from operational audit logs"*, *"Report data is derived"*. **None describes a summary count as derived from a detail section.** |
| `must equal` / `must match` | 7 | All are **business rules and validation rules** (e.g. *"Total debits must equal total credits"*, *"Person sub-type attributes must match Person's role context"*). **None is a documentation-counting rule.** |
| `canonical` | 1 | Appears only in the Finance Phase 3 status row written by the *prior* audit, recording that 32 is not canonical. **Not a pre-existing convention.** |
| `normative` | 0 | — |
| `single source` | 0 | — |
| `summary of` | 0 | — |
| `in the event of conflict` | 0 | — |

**Conclusion for §2.1: there is no pre-existing rule, in any specification or supporting document,
that states which artefact wins when a summary count and a detail count disagree.**

### 2.2 Conventions that *are* documented

`engineering/00 README.md` contains a section headed "Conventions". It has exactly three bullets:

1. All specifications follow 7-phase engineering (Domain Analysis → Testing & Verification).
2. ADRs are numbered sequentially within each domain.
3. "Approved & Frozen specs have completed all phases and are locked."

**None addresses counting, derivation, or count authority.** Bullet 3 is the only statement in the
project that ties a status word to a condition, and it is about document approval, not about phase
implementation.

`engineering/ROADMAP.md` contains:

- A **Phase Legend** of 4 symbols: `Approved → Frozen`, `Phase Complete → Under Review`,
  `In Progress`, `Pending`. **No definitions, no completion criteria, no verification gate.**
- A **Phase Definitions** table giving each of P1–P7 a *name* and a one-line *description* of what
  the phase covers. **It defines subject matter, not completion.** Nothing states what evidence
  makes a phase complete.
- A **Domain Notes** table carrying quantified claims (see §2.4).

### 2.3 The one status-vocabulary definition in the project

A definition of the word "Complete" as a **phase status** exists in exactly **one** of the 10
specifications:

> **Finance**, §4, line 223:
> *"**Phase status vocabulary.** **"Complete" denotes implemented repository functionality that
> has passed the applicable verification gates; specification/design completion alone does not
> constitute implementation completion.** A phase must not be marked "Complete" merely because…"*

This definition was **introduced by the prior Phase 5 / Phases 3-4-6-7 audit work** (revision
1.4.0), not by the original specification authors. It is **not** referenced or adopted by any other
specification.

A search of the other 9 specifications for any equivalent definition returned **only false
positives** — entity lifecycle enums (`ACTIVE → COMPLETED`), a work-order route
(`/work-orders/:id/complete`), and two-pass validation prose. Verified individually:

| Specification | Apparent "definition" hit | Actual content |
|---|---|---|
| Academic Management L324 | `SummerSchoolSession` enum | Entity status enum, not phase status |
| Communication L532 | `ACTIVE → COMPLETED` | Notification lifecycle, not phase status |
| Operations L595, L622, L2358 | `ACTIVE → COMPLETED`, `POST /work-orders/:id/complete` | Domain lifecycle / route, not phase status |
| Reporting L557, L568, L1460 | `ACTIVE → COMPLETED`, two-pass prose | Domain lifecycle / schema prose |
| Documents & Learning L1504 | two-pass prose | Schema prose |

**Conclusion for §2.3: 9 of 10 specifications use "Complete" with no definition whatsoever. The
single definition in the project is Finance's, it was added by audit, and it has not been adopted
anywhere. Per the audit brief, Finance's definition is **not** treated as project-wide here.**

### 2.4 Quantified claims in supporting documents

`ROADMAP.md` carries claims that were checked against reality:

| ROADMAP claim | Actual | Result |
|---|---|---|
| Line counts: Identity ~919, Institution ~1,112, People ~1,433, Academic ~1,600, Finance ~1,495, Communication ~2,531, Operations ~2,279, D&L ~1,693, Reporting ~1,616, Platform ~3,159 | 1,138 / 1,395 / 1,757 / 1,944 / 1,897 / 2,960 / 2,633 / 2,012 / 1,922 / 3,709 | **10 of 10 understated**, by 219–550 lines each. No line count is accurate. |
| `Documents & Learning — 13 bounded contexts` | 15 module rows in §9.1 | Mismatch |
| `Platform Administration — 15 bounded contexts, 62 tables, 55 Prisma models, ~137 API endpoints` | §9.1 = 15 ✓, §7.1 = 62 ✓, §8.2 = 55 ✓, §10.1 = 137 ✓ | **All four match** — the ROADMAP note for Platform is the one fully verified quantified claim in the supporting documents |
| Session Log: Identity *"P3 complete (19 tables, 15 sections)"*, *"P4 complete (19 models, 12 enums, ~144 columns, 43 indexes)"* | §7.1 = 19 tables ✓; 12 enums contradicted by 4 in §4 and 0 in `identity.prisma` | Partial match; enums and index counts unsupported |
| `Remaining: "No remaining V1 domains. All 10 domains are complete."` | Contradicted by ROADMAP's own index table, which marks 7 domains "Under Review" | **Self-contradiction within ROADMAP.md** |

### 2.5 Approval-state conflict between the two supporting documents

The README and ROADMAP both publish an approval status for the same 10 specifications. **They
disagree for 7 of 10:**

| Specification | `00 README.md` | `ROADMAP.md` index | Agreement |
|---|---|---|---|
| Identity & Access | Approved & Frozen | Approved & Frozen | ✓ |
| Institution Management | Approved & Frozen | Approved & Frozen | ✓ |
| People | Approved & Frozen | Approved & Frozen | ✓ |
| Academic Management | Approved & Frozen | **Under Review** | **✗ conflict** |
| Finance | Approved & Frozen | **Under Review** | **✗ conflict** |
| Communication | Approved & Frozen | **Under Review** | **✗ conflict** |
| Operations | Approved & Frozen | **Under Review** | **✗ conflict** |
| Documents & Learning | Approved & Frozen | **Under Review** | **✗ conflict** |
| Reporting & Analytics | Approved & Frozen | **Under Review** | **✗ conflict** |
| Platform Administration | Approved & Frozen | **Under Review** | **✗ conflict** |

The README additionally asserts *"All 10 V1 domains are now approved and frozen for
implementation"*, while the ROADMAP's own domain index lists 7 of them as Under Review. **No rule
states which document governs approval state.**

---

## 3. Summary vs Detail Count Audit

Only categories with meaningful, comparable evidence are included. `~` indicates the summary used an
approximation (`+`, `~`) that the detail count neither confirms nor refutes. "n/c" marks a
comparison blocked by differing granularity.

### 3.1 Module counts (§4 Phase 5 vs §9.1 Module Structure)

| Specification | Category | Summary Count | Detail Count | Match? | Authority Evidence |
|---|---|---:|---:|---|---|
| Identity & Access | modules | 11 | 11 | ✓ | none — no rule; agreement appears coincidental |
| Institution Management | modules | 8 | 11 | **✗** | none |
| People | modules | 11 | 11 | ✓ | none |
| Academic Management | modules | 15 | 15 | ✓ | none |
| Finance | modules | 16 (post-audit) | 16 | ✓ | §4.1 records the 14-vs-16 gap as **unresolved**; no authority rule |
| Communication | modules | 14 | 14 | ✓ | none |
| Operations | modules | 16 | 11 | **✗** | none |
| Documents & Learning | modules | 13 | 15 | **✗** | none |
| Reporting & Analytics | modules | 14 | 13 | **✗** | none |
| Platform Administration | modules | 15 | 15 | ✓ | none |

**5 of 10 match; 5 of 10 mismatch.** Mismatches run in **both directions** — Institution (−3),
Operations (−5), Reporting (−1) overstate in the summary; Documents & Learning (+2) understates.
The Finance investigation's finding that "itemised detail is authoritative" was already known not
to hold in a consistent direction: **Operations and Reporting overstate, Documents & Learning
understates, Finance (pre-audit) understated.**

### 3.2 Table counts (§4 Phase 3 vs §7.1 Table Catalogue)

| Specification | Summary Count | Detail Count | Match? | Authority Evidence |
|---|---:|---:|---|---|
| Identity & Access | 19 | 19 | ✓ | none |
| Institution Management | 15 | 15 | ✓ | none |
| People | 20 | 20 | ✓ | none |
| Academic Management | 35 | 31 | **✗** | none |
| Finance | 32 (superseded) | 30 | **✗** | §4.1 item 2; audit states "32 is **not** the canonical §7.1 table count" |
| Communication | 28 | 28 | ✓ | none |
| Operations | 55 | 55 | ✓ | none |
| Documents & Learning | 33 | 34 | **✗** | none — summary **understates** its own catalogue |
| Reporting & Analytics | 31 | 31 | ✓ | none |
| Platform Administration | 62 | 62 | ✓ | none |

**7 of 10 match; 3 of 10 mismatch** (Academic +4, Finance +2, D&L −1). Note that **D&L and Finance
mismatch in the direction where the summary is smaller** — evidence against a blanket "summary
overstates" pattern and equally against a blanket "detail wins" rule being currently applied.

### 3.3 Repository / service / controller counts (§4 Phase 5 vs §9.2–9.4)

| Specification | Layer | Summary | Detail | Match? | Note |
|---|---|---:|---:|---|---|
| Identity & Access | repositories | 15 | 15 | ✓ | |
| Identity & Access | domain services | 9 | 9 | ✓ | |
| Identity & Access | controllers | 9 | 9 | ✓ | |
| Institution Management | repositories | 12 | 15 | **✗** | |
| Institution Management | domain services | 8 | 11 | **✗** | |
| Institution Management | controllers | *omitted from §4* | 10 | n/a | **§4 Phase 5 row omits a controller count entirely** — the only spec that does |
| People | repositories / services / controllers | 10 / 11 / 10 | 10 / 11 / 10 | ✓ ✓ ✓ | only fully consistent spec |
| Academic Management | repositories | 15 | 14 | **✗** | services 15 ✓, controllers 14 ✓ |
| Finance | repositories | 14 (superseded) | 11 | **✗** | |
| Finance | domain services | 14 (superseded) | 16 | **✗** | |
| Finance | controllers | 14 (superseded) | 14 | ✓ | **14 here equals the controller count, not a module count** |
| Communication | repositories / services / controllers | 27 / 14 / 14 | 27 / 14 / 14 | ✓ ✓ ✓ | repositories (27) deliberately ≠ modules (14) |
| Operations | repositories | 16 | 38 | n/c | §9.2 granularity differs |
| Operations | domain services | 16 | 24 | n/c | §9.3 granularity differs |
| Operations | controllers | 16 | 26 | n/c | §9.4 granularity differs |
| Documents & Learning | repositories | 13 | 31 | **✗** | |
| Documents & Learning | domain services | 13 | 17 | **✗** | |
| Documents & Learning | controllers | 13 | **section absent** | **✗** | **§9 has no Controllers section at all** (only 9.1–9.4, ending at Event Publishing) |
| Reporting & Analytics | repositories | 13 | 22 | **✗** | |
| Reporting & Analytics | domain services | 13 | 16 | **✗** | |
| Reporting & Analytics | controllers | 13 | **section absent** | **✗** | **§9 has no Controllers section at all** |
| Platform Administration | repositories | 15 | 44 | n/c | §9.2 "Repository **Interfaces**" — per-interface rows |
| Platform Administration | domain services | 15 | 60 | n/c | §9.3 "Domain Service **Details**" — per-method rows |
| Platform Administration | controllers | 15 | 8 | **✗** | |

**Key structural observation:** there is **no consistent relationship** between module count and
repository/service/controller count. Communication legitimately has 14 modules and 27
repositories. Finance has 16 modules, 11 repositories, 16 services, 14 controllers. Institution
Management's §4 omits controllers entirely. **Two specifications have no controllers detail section
at all while claiming 13 controllers.** Any convention that assumes "counts are derived one from
another" is unsupported.

### 3.4 Endpoint counts (§4 Phase 6 vs the endpoint catalogue)

| Specification | Summary | Detail | Match? | Note |
|---|---:|---:|---|---|
| Identity & Access | 61 (37 primary + 24 sub) | 66 | **✗** | summary understates by 5; the 37/24 split is not labelled in the detail |
| Institution Management | 52 (34 + 18) | §15 catalogue | n/a | **Phase 6 sits at §15, not §10** (§10 is Tenant Provisioning Lifecycle) |
| People | 58 (38 + 20) | 77 | **✗** | summary understates by 19 |
| Academic Management | 110+ | 109 | ~ | consistent in magnitude |
| Finance | 100+ | 98 | **✗** | recorded in §4.1 item 4; 65/35 split unverifiable |
| Communication | 79 | §10.1 summary table, 16 resource groups | n/c | detail is a per-group table, not a route list |
| Operations | 120+ (80 + 40) | §10.1, 28 resource groups | n/c | detail is a per-group table, not a route list |
| Documents & Learning | 120 | 127 | **✗** | summary understates by 7 |
| Reporting & Analytics | 106 | 102 | **✗** | summary **over**states by 4 |
| Platform Administration | 137 (85 + 52) | 137 (85 + 52) | ✓ | **the only fully verified endpoint claim in the project** — 15 module rows sum exactly to the claim |

**Mismatches run in both directions** (−19 to +4). The `primary + sub-resource` decomposition is
asserted in §4 for 5 specifications but is **not labelled anywhere in the corresponding detail
sections** for any of them; only Platform Administration's own detail table carries a
Primary/Sub/Total breakdown, and only there do the numbers reconcile.

### 3.5 Test category and scenario counts (§4 Phase 7 vs §11 detail)

This is the most severe category, because the detail sections contain a **third** level: a
per-category scenario column, a `Total` row, and the §4 summary.

| Specification | §4 categories | Detail categories | Match? | §4 scenarios | Detail `Total` row | Sum of category rows | Match? |
|---|---:|---:|---|---:|---:|---:|---|
| Identity & Access | 15 | 14 | **✗** | ~350+ | ~350+ | **126** | **✗ 2.8× overstated** |
| Institution Management | 14 | 14 (§16.2) | ✓ | ~280+ | ~280+ | **154** | **✗ 1.8× overstated** |
| People | 15 | 18 | **✗** | ~310+ | **~330+** | **172** | **✗ three-way disagreement** |
| Academic Management | 18 | 18 | ✓ | ~240+ | ~240+ | 243 | ✓ |
| Finance | 18 | 18 | ✓ | ~240+ | ~240+ | 239 | ✓ |
| Communication | 18 | 18 | ✓ | ~215+ | (no Total row) | 215 | ✓ |
| Operations | 20 | 20 | ✓ | ~400+ | (no Total row) | **204** | **✗ ~2× overstated** |
| Documents & Learning | 18 | 18 | ✓ | ~285+ | ~285+ | 273 | ~ |
| Reporting & Analytics | 18 | 18 | ✓ | ~226+ | ~226+ | **236** | **✗ sum exceeds claim** |
| Platform Administration | 20 | 20 | ✓ | ~192 | (no scenario column) | n/a | n/a |

**Findings:**

1. **Identity & Access, Institution Management and Operations each overstate test scenarios by
   roughly 2–2.8×** relative to the sum of their own category rows. The §4 summary agrees with the
   detail's `Total` row in all three cases — so both "summary" and "detail total" are wrong
   together, and only the category rows are self-consistent.
2. **People shows a genuine three-way split**: §4 says `~310+`, the detail `Total` row says
   `~330+`, and the category rows sum to `172`. §4 and the detail total contradict **each other**
   within one specification.
3. **Reporting & Analytics runs the opposite way**: its category rows sum to 236, *exceeding* its
   own `~226+` claim.
4. **§4 category counts mismatch for 3 specs** (Identity −1, People −3), and mismatch in opposite
   directions.
5. Only **Academic Management, Finance and Communication** have fully self-consistent test counts.

### 3.6 Prisma model counts (§4 Phase 4 vs §8 detail and repository)

| Specification | §4 claim | §8 detail section | Repository domain file | Result |
|---|---:|---|---|---|
| Identity & Access | 19 models, 4 enums | no `8.2 Models` section | `identity.prisma` = 15 models | **✗ unsupported** |
| Institution Management | 15 models, 6 enums | no `8.2 Models` section | `institution.prisma` 2 + `institution-configuration.prisma` 2 = 4 | **✗ unsupported** |
| People | 20 models, 10 enums | no `8.2 Models` section | `people.prisma` = 20 | ✓ models |
| Academic Management | 35 models, 12 enums | no `8.2 Models` section | `academic.prisma` = 32 | **✗** |
| Finance | *corrected to 5 actual* | — | `finance.prisma` = 5 | ✓ post-audit |
| Communication | 28 models, 17 enums | `8.2` = 28 | `communication.prisma` = 3 | ✓ spec-internal; repo thin |
| Operations | **~18 models** | **`8.2 Models (Key Models - 48 total)`** = 17 blocks | `operations.prisma` = 8 | **✗✗ §4 and §8 contradict each other inside one spec (18 vs 48)** |
| Documents & Learning | 34 models, 17 enums | no prisma blocks in `8.2` | `documents.prisma` = 4 | spec-internal only |
| Reporting & Analytics | 31 models, 23 enums | no prisma blocks in `8.2` | `analytics.prisma` = 5 | spec-internal only |
| Platform Administration | **~48 models** | `8.2` = 55 | `platform.prisma` = 3 | **✗ ✗ vs its own §8.2** |

**The Operations row is the sharpest single finding in this audit:** its §4 summary says
`~18 models` while its own §8.2 section heading says `Key Models - 48 total`. A summary/detail
authority rule **cannot resolve this**, because the detail section disagrees with itself about its
own total. Platform Administration has the same class of problem (~48 in §4 vs 55 in §8.2).

### 3.7 "2-pass validation" implementation claims

All 10 specifications assert `2-pass validation` in their §4 Phase 4 row; Identity & Access
strengthens this to `2-pass validation (all checks PASS)`. Two specifications publish the criteria
prose (`Reporting L1460` *"All 31 tables have corresponding Prisma models…"*; `Documents &
Learning L1504` *"All 34 tables…"*).

**Repository evidence: no validation gate exists.**

- `apps/api/package.json` scripts: `lint`, `test`, `test:e2e`, `prisma:merge`, `prisma:generate`,
  `prisma:migrate`, `prisma:seed`. **No `validate` script.**
- `apps/web/package.json` scripts: `lint`. **No `validate` script.**
- No result artefact, report, or CI record of a two-pass check exists anywhere in the repository.
- Applying the published criteria to repository reality: Reporting's domain file holds **5** models
  against a "31 tables have corresponding Prisma models" claim; Documents & Learning's holds **4**
  against "34".

**A `2-pass validation` claim is therefore an unverifiable implementation assertion in 10 of 10
specifications.** There is no documented rule requiring a gate to exist, and no gate to run.

---

## 4. Implementation Status Convention Audit

| Specification | Status Vocabulary Used | Definition Exists? | Repository Evidence Rule? | Verification Rule? |
|---|---|---|---|---|
| Identity & Access | `Complete` (×7) | **No** — no definition of `Complete`; no status legend | **No** | **No** — yet §4 claims *"production readiness verified"* while its own §11.3 checklist is **0 of 12 boxes checked** |
| Institution Management | `Complete` (×7) | **No** | **No** | **No** — §16.x checklist **0 of 15 checked** |
| People | `Complete` (×7) | **No** | **No** | **No** — checklist **0 of 14 checked** |
| Academic Management | `Complete` (×7) | **No** | **No** | **No** — checklist **0 of 15 checked** |
| Finance | `Complete` (×2), `Specified / Not Implemented` (×5) | **Yes** — §4 line 223, added by prior audit | **Yes** — the corrected rows cite repository state explicitly (5 tables, 5 models, 0 endpoints, 0 tests) | **Partial** — cites the absent `package.json` validation gate and the unchecked §11.4 checklist; no gate is *defined* |
| Communication | `Complete` (×7) | **No** | **No** | **No** — **no Production Readiness Checklist exists at all** |
| Operations | `Complete` (×7) | **No** | **No** | **No** — **no checklist exists** |
| Documents & Learning | `Complete` (×7) | **No** | **No** | **No** — checklist **0 of 12 checked** |
| Reporting & Analytics | `Complete` (×7) | **No** | **No** | **No** — checklist **0 of 13 checked** |
| Platform Administration | `Complete` (×7) | **No** | **No** | **No** — **no checklist exists**; has §11.4 "Verification Criteria" but no gate |
| **ROADMAP.md** | `Approved → Frozen`, `Phase Complete → Under Review`, `In Progress`, `Pending` | Symbols only, **no meanings** | **No** | **No** — "Phase Definitions" gives subject matter, not completion criteria |
| **`00 README.md`** | `Approved & Frozen` | One bullet: *"Approved & Frozen specs have completed all phases and are locked"* — **the only status definition in the project** | **No** | **No** |

### 4.1 Status-vocabulary findings

1. **Exactly one status value is used across all 10 specifications: `Complete`.** No specification
   uses `In Progress`, `Pending`, `Under Review`, or any partial-state value in its §4 table. The
   other three symbols in the ROADMAP Phase Legend are **never used** in any specification.
2. **Finance is the only specification with more than one status value**, and the second value was
   introduced by audit rather than by the original authors.
3. **No specification defines `Complete`.** The single definition in the project is Finance's, and
   per the audit brief it is **not** treated as authoritative for the other 9.

### 4.2 Vocabulary requested by the brief, and whether the project distinguishes it

| Term | Distinguished anywhere in the project? | Evidence |
|---|---|---|
| **specified** | **No** | Finance uses `Specified / Not Implemented` as one combined value; the other 9 do not use the term at all |
| **designed** | **No** | Not a status value in any §4 table. The word "design" appears only as a phase name |
| **scaffolded** | **No** | Term does not appear. Finance's audit prose uses "thin scaffold" descriptively but never as a status value |
| **implemented** | **No** | Used in prose ("no backend code exists", "0 implemented endpoints") but never as a status value |
| **verified** | **No** | No status value. Identity & Access asserts readiness is "verified" in §4 prose while its checklist is 0/12 — the term is used as an unearned assertion, not a state |
| **complete** | Used as a status value in 10/10 | **Undefined in 9/10**; defined once in Finance by prior audit |

**Result: the project distinguishes none of the six states. It has a single boolean (`Complete` /
not) with no definition and no gate.**

### 4.3 Production Readiness checklists are universally unexecuted

Across the 8 specifications that contain a Production Readiness Checklist:

| Specification | Boxes checked | Boxes unchecked |
|---|---:|---:|
| Identity & Access | **0** | 12 |
| Institution Management | **0** | 15 |
| People | **0** | 14 |
| Academic Management | **0** | 15 |
| Finance | **0** | 18 |
| Documents & Learning | **0** | 12 |
| Reporting & Analytics | **0** | 13 |
| Communication / Operations / Platform Administration | — | no checklist exists |

**Zero boxes are checked in the entire project.** Every one of these specifications nevertheless
carries `Complete` for Phase 7. Identity & Access goes further and claims readiness is *"verified"*.
The checklists are the only artefact in any specification resembling a completion gate, and in
**10 of 10** cases that gate is unexecuted while the status asserts completion.

---

## 5. Cross-Spec Findings

These are systemic patterns, not isolated Finance issues.

### 5.1 Disagreement is bidirectional, so "detail wins" is not currently applied anywhere

Across §3, the summary overstates the detail in 16 measured categories and **understates** it in 7.
Concrete instances of understatement — the direction that a naive "summaries inflate" theory would
miss:

- Documents & Learning: 33 claimed vs 34 catalogued tables (**−1**)
- Documents & Learning: 13 claimed vs 15 listed modules (**−2**)
- People: 58 claimed vs 77 catalogued endpoints (**−19**)
- Identity & Access: 61 claimed vs 66 catalogued endpoints (**−5**)
- Finance (pre-audit): 14 claimed vs 16 listed modules (**−2**)

**No pattern of "summaries are inflated" holds.** A convention premised on that would be wrong
about one-third of the measured cases.

### 5.2 Detail sections are not self-consistent, so "detail is authoritative" is underdetermined

Three specifications contain a **within-detail** contradiction that no summary-vs-detail rule can
resolve:

| Specification | Internal detail conflict |
|---|---|
| Operations | §4 says `~18 models`; §8.2 heading says `Key Models - 48 total`; §8.2 body contains 17 model blocks |
| Platform Administration | §4 says `~48 models`; §8.2 contains 55 `model` blocks |
| Identity & Access | §11.2 category rows sum to 126; the same table's `Total` row says `~350+` |
| Institution Management | §16.2 category rows sum to 154; the same table's `Total` row says `~280+` |
| Operations | §11.1 category rows sum to 204; §4 claims `~400+` |
| People | §4 claims `~310+`; §11.2 `Total` row claims `~330+`; §11.2 rows sum to 172 |

**In each case the detail section contains both the true number and a wrong number.** "The detail
section is authoritative" therefore does not identify a single value. A workable rule must specify
*which part* of the detail section is authoritative.

### 5.3 Section numbering is not portable, so a section-number-keyed rule fails

9 of 10 specifications place Phase 6 at §10 and Phase 7 at §11. **Institution Management does
not:** five non-phase sections (§10 Tenant Provisioning Lifecycle, §11 Institution Configuration
Categories, §12 Subscription Lifecycle, §13 Module Licensing Rules, §14 Future Campus Architecture)
push Phase 6 to **§15** and Phase 7 to **§16**.

Consequences:
- Its Phase 7 test-category table is at **§16.2**, not §11.2.
- Any rule, script, or cross-spec comparison keyed on "§11.2" silently skips Institution Management.
- Its §9.4 Controllers table is the only place its API surface is enumerated — Phase 6 has no
  endpoint-catalogue section comparable to other specs' §10.3.

### 5.4 Detail-section granularity is not uniform, so "count the detail rows" is not well-defined

The same-named sections serve different purposes across specifications:

- **§9.2** — "Repository Layer" (Identity, Finance) lists one row per repository; but Platform
  Administration's §9.2 "Repository **Interfaces**" lists per-interface rows, and Communication's
  legitimately has 27 repositories against 14 modules.
- **§9.3** — "Domain Services" vs Platform Administration's "Domain Service **Details**"
  (per-method rows, 60 rows).
- **§10** — "10.3 Endpoint Catalogue" (route-level, 98–127 rows) vs "10.1 API Summary"
  (per-resource-group, 16–28 rows) in Communication, Operations, Platform Administration.

**A rule of the form "the detail section's count is the count" is therefore not executable as
written.** It needs a per-specification definition of what a countable unit is.

### 5.5 Two specifications have no controllers detail section while claiming 13 controllers

Documents & Learning and Reporting & Analytics both end §9 at `9.4 Event Publishing & Consumers`.
Neither has a Controllers section. Both §4 Phase 5 rows claim **13 controllers**. Finance's
module-count investigation found a comparable orphan in the opposite direction (`FinancialReport`
service + controller, no module). **The module ↔ artefact correspondence is broken in at least
four distinct ways across the project**, so it cannot be used to derive counts.

### 5.6 Every quantified implementation claim in the project is unverified by any gate

- **10 of 10** specifications assert `2-pass validation`; **0** have a `validate` script, and **0**
  have a result artefact.
- **8 of 8** Production Readiness Checklists are **0% checked**, while **10 of 10** specifications
  mark Phase 7 `Complete`.
- **0 of 10** specifications cite repository paths, file names, or test names in support of any
  `Complete` status. Finance is the sole exception, and only because the prior audit rewrote it.

### 5.7 The repository has no documented mapping to specification domains

`apps/api/src/modules` contains **11** directories: `academics, audit, auth, delivery, events,
identity, institutions, invitations, onboarding, people, session`. For 10 specifications.

| Specification | Apparent module directory | Notes |
|---|---|---|
| Identity & Access | `auth`, `identity`, `session`, `invitations`, `onboarding` | split across 5 dirs |
| Institution Management | `institutions` | ✓ |
| People | `people` | ✓ |
| Academic Management | `academics` | ✓ |
| Communication | `delivery` | name does not match spec |
| Platform Administration | `audit` only | partial at best |
| **Finance** | **none** | 0 directories |
| **Operations** | **none** | 0 directories |
| **Documents & Learning** | **none** | 0 directories |
| **Reporting & Analytics** | **none** | 0 directories |
| — | `events` | cross-cutting, belongs to no single spec |

Prisma is similarly ambiguous: **11 domain files** (`academic, analytics, communication, documents,
finance, identity, institution-configuration, institution, operations, people, platform`) **plus a
root `schema.prisma` with 99 models** that spans every domain, merged by a `prisma:merge` script.

| Specification | §4 model claim | Domain file | Root-schema models for this domain |
|---|---:|---:|---|
| People | 20 | 20 | 20 (Person, Student, Staff, Guardian, Applicant…) — full |
| Academic Management | 35 | 32 | 31 (Term, Subject, Class, Result, ReportCard…) |
| Finance | 5 (corrected) | 5 | 5 (FeeStructure, Invoice, Payment, Scholarship, Refund) — **no `LedgerAccount`/`JournalEntry`** |
| Communication | 28 | 3 | 2–3 (NotificationTemplate, Notification, Campaign) |
| Institution Management | 15 | 4 | 0 (`OrganizationMembership`, `InstitutionMembership`, `InstitutionConfiguration`, `InstitutionSetting`) |
| Operations | ~18 / 48 | 8 | 4 (Hostel, Vehicle, InventoryItem, MaintenanceRequest) |
| Documents & Learning | 34 | 4 | 3 (Document, LibraryBook, LibraryBookCopy, BookLoan) |
| Reporting & Analytics | 31 | 5 | 5 (Report, Dashboard, KPI, Alert, Trend) |
| Platform Administration | ~48 | 3 | 3 (Tenant, FeatureFlag, AuditLog) |
| Identity & Access | 19 | 15 | 15 |

**Because two different Prisma locations can each plausibly be called "the domain's models", the
instruction "the repository is authoritative" is not executable until a mapping rule exists.** This
is a prerequisite blocker, not a detail.

### 5.8 Supporting-document counts are decayed, and the two disagree on approval state

- **10 of 10** ROADMAP line counts are understated (by 219–550 lines).
- **7 of 10** specifications have conflicting approval status between README and ROADMAP (§2.5).
- ROADMAP contradicts **itself** ("All 10 domains are complete" vs its own index marking 7
  "Under Review").
- The ROADMAP Domain Notes claim for **Platform Administration** (15 contexts, 62 tables, 55 models,
  137 endpoints) is the **only fully verified quantified claim in the supporting documents** —
  which shows accurate cross-referencing is achievable in this project, and therefore that its
  absence elsewhere is not a tooling limitation.

---

## 6. Finance Findings in Project Context

The four Finance discrepancies, placed against the project baseline. **None is resolved here.**

### 6.1 modules: 14 vs 16

| Context | Finding |
|---|---|
| Project baseline | **5 of 10** specs' module counts match their §9.1; **5 do not**. Mismatch is bidirectional: Institution (8 vs 11), Operations (16 vs 11), Reporting (14 vs 13) overstate; Documents & Learning (13 vs 15) and Finance (14 vs 16) understate |
| Finance position | Finance is **not an outlier**. It is one of 5 specs with a module-count mismatch, and it shares the "summary understates" direction with exactly one other spec (Documents & Learning) |
| Aggravating factor specific to Finance | Its 14 was **derived from a different category** — the controller count (§9.4 = 14) and the functional test-category count (14). This cross-category derivation is unique to Finance among the 10 specs; the other 4 mismatches are plain transcription/scope differences |
| Status | Unresolved. Consistent with §4.1 item 1 and the module-count investigation |

### 6.2 tables: 32 vs 30

| Context | Finding |
|---|---|
| Project baseline | **7 of 10** table counts match §7.1 exactly. Only 3 mismatch: Academic (35 vs 31), Finance (32 vs 30), Documents & Learning (33 vs 34) |
| Finance position | Finance's +2 overstatement is the **second-smallest** table discrepancy in the project, and is the same magnitude as Academic's and half the ROADMAP's Platform-independent claims |
| Status | Unresolved per §4.1 item 2. The prior audit noted 32 is not canonical; **no project rule establishes canonicality** |

### 6.3 indexes: 45+ vs 26

| Context | Finding |
|---|---|
| Project baseline | Index counts are asserted in **10 of 10** §4 Phase 3 rows, always with `+` or `~` approximation (43, 45+, 50+, 55+, 65+, 30+, 40+, 70+). **No specification publishes a verifiable index total**, and no specification defines what an index "is" for counting purposes (per-table? per-column? composite counted once or per column?) |
| Finance position | Finance's `45+` vs §7.4's `26` is the **largest proportional gap** in the project, but it is uninterpretable because **no spec defines an index-counting unit** |
| Note | `Unique constraints` is a separate §4 claim in all 10 specs, again unverified project-wide |
| Status | Unresolved |

### 6.4 endpoints: 100+ vs 98

| Context | Finding |
|---|---|
| Project baseline | Endpoint counts are the **worst-performing category**: mismatches in 6 of 9 measurable specs, ranging from −19 (People) to +4 (Reporting). The `primary + sub-resource` split is asserted in 5 §4 rows but labelled in **no** detail section except Platform Administration's own §10.1 |
| Finance position | Finance's `100+` vs `98` is a **−2 understatement**, one of the *smallest* endpoint gaps in the project. People (−19) and Identity (−5) are worse |
| Status | Unresolved per §4.1 item 4, which already records the 98-vs-100+ gap and the unverifiable 65/35 split |

### 6.5 The pattern Finance belongs to

**Finance's four discrepancies are quantitatively typical of the project, with one exception.** The
table (+2), module (−2), and endpoint (−2) gaps all sit inside the normal spread of the other 9
specifications. The index gap (45+ vs 26) is Finance's largest relative discrepancy but is
uninterpretable project-wide because index counting is undefined everywhere.

**What is genuinely Finance-specific is the status layer, not the count layer.** Finance is the
only specification whose §4 rows cite repository evidence; the other 9 assert `Complete` with no
evidence and with universally unchecked readiness checklists. Finance is also the only spec with a
status vocabulary definition — introduced by audit, not by its authors.

**Therefore the Finance count discrepancies are not evidence of a Finance-specific failure to follow
a convention, because no such convention exists to follow. They are instances of a project-wide
gap (§10, result B), plus one Finance-specific issue (a status definition that exists but has not
been adopted).**

---

## 7. Candidate Project-Wide Convention

The candidate rule put forward for evaluation was:

> *"Summary counts are derived from the authoritative detailed section they summarize; where summary
> and detail disagree, the discrepancy must be recorded rather than silently choosing a number."*

**It is not adopted here.** Assessed on three axes:

### 7.1 First clause — "summary counts are derived from the authoritative detailed section"

**Mildly supported as an aspiration, but not currently a practice, and underdetermined as written.**

*Supporting:*
- The rule is **achievable** in this project: 5/10 module counts, 7/10 table counts, 6/10 service
  counts, 7/10 test-category counts, and Platform Administration's entire endpoint claim already
  reconcile exactly. The specification set demonstrably *can* be internally consistent.
- The one place the project published a full derivation — Platform Administration's §10.1 Primary /
  Sub-Resource / **Total** table — reconciles to 137 = 85 + 52 exactly. **The project has already
  produced a worked example of the convention.** It is a precedent, not a rule.

*Conflicting / blocking:*
- **The rule does not identify a value where the detail section contradicts itself** (§5.2).
  Operations (`~18` vs `48 total` vs 17 blocks), Platform Administration (`~48` vs 55 blocks),
  Identity (`126` vs `~350+`), Institution Management (`154` vs `~280+`), Operations tests (`204` vs
  `~400+`), People (`~310+` vs `~330+` vs `172`). In 6 of 10 specifications the detail section
  contains both a right and a wrong number, so "the detail section" is not a single authority.
- **Section numbers are not portable** (§5.3), so a rule keyed on "§7.1 / §9.1 / §10.3 / §11.2"
  silently skips Institution Management and misidentifies Communication, Operations and Platform
  Administration.
- **Granularity is not uniform** (§5.4), so "count the detail rows" is not a well-defined
  operation. Platform's 44 repository-interface rows and 60 service-detail rows are not 15
  repositories and 15 services.
- **The detail sections are not always the more accurate side.** The category-row sums contradict
  the detail `Total` rows in 4 specs; and D&L's detail catalogue (34) exceeds its summary (33),
  showing the detail is not systematically more accurate either.
- **Only 3 of 10 specs even have a comparable detail section for two of the measured categories.**
  Documents & Learning and Reporting & Analytics have no controllers section at all; Institution
  Management has no Phase 6 endpoint catalogue. There is nothing for the rule to point at.

**Verdict on clause 1: partially supported, not currently practised, and insufficient as written.**
It requires three additional definitions before it can be applied: (a) which granularity counts,
(b) how to handle a self-contradictory detail section, (c) a section-identifier scheme that is not
positional.

### 7.2 Second clause — "the discrepancy must be recorded rather than silently choosing a number"

**This is a genuinely new project decision. Nothing supports it as existing practice; the evidence
is neutral-to-supportive, and it is the clause with the strongest justification.**

- **No specification records a count discrepancy.** 9 of 10 silently present a summary and a detail
  section that disagree, with no note. Only Finance §4.1 records discrepancies — and that register
  was **created by audit**, in revisions 1.4.0–1.6.0, not by the original authors.
- **There is no designated location** for such a register. Finance has §4.1; no other spec has any
  equivalent. The README and ROADMAP contain no discrepancy log.
- **Positive signal:** the Finance register has now been maintained across three revision entries
  without being collapsed into a chosen number — evidence that the practice is workable and was
  not resisted. But one adopted-by-audit instance in one specification is not a project convention.
- **Complication:** the register is not currently consistent with itself. Finance §4.1 item 1 says
  *"§4 summary claims 14 modules"*, but the live §4 row no longer asserts 14 — revision 1.4.0
  replaced it, and the 14 survives only in the revision history. **Recording a discrepancy requires
  a rule for recording discrepancies about already-corrected rows**, or the register drifts from
  the document it describes.

**Verdict on clause 2: not an existing convention; a new project decision, weakly supported by the
Finance register's precedent and otherwise untested.**

### 7.3 Overall assessment of the candidate rule

| Axis | Result |
|---|---|
| Does existing documentation **state** this rule? | **No.** Zero supporting statements across 10 specifications, the README, and the ROADMAP |
| Does existing practice **follow** it? | **No.** 6 of 9 measurable categories mismatch in at least one spec; only 1 of 10 specs records any discrepancy, and it did so by audit intervention |
| Does existing documentation **conflict** with it? | **Partially.** The rule assumes a single authoritative detail section, but detail sections are self-contradictory in 6 of 10 specs and non-comparable in 3. The rule as worded cannot be applied without the three added definitions in §7.1 |
| Is the idea **left undecided**? | **Yes.** No document takes a position either way. The project has simply never addressed the question |

**Conclusion: the candidate convention is UNDECIDED, and as written is not sufficient to adopt.**
Its first clause is a sound aspiration blocked by three concrete definitional gaps; its second
clause is a new decision with one working precedent.

---

## 8. Decision Requirements

Only decisions that genuinely require explicit project-level agreement. Each is genuinely open; none
is answerable from existing documentation.

| # | Decision | Why it cannot be inferred | Blocking? |
|---|---|---|---|
| **D-1** | For **design counts** (modules, tables, endpoints, tests), which artefact is authoritative when §4 and the detail section disagree — and is the answer the same as for implementation status? | No document states a rule; mismatches run in both directions, so neither "summary" nor "detail" is reliably more accurate | **Yes** — blocks all count normalisation |
| **D-2** | What is the countable **unit and granularity** per category per specification? (index: per-table or per-column? repository: per-entity or per-interface? endpoint: route-level or resource-group?) | §5.4 — the same section name serves different purposes in different specs; "count the rows" is undefined | **Yes** — blocks any automated count check |
| **D-3** | When a **detail section contradicts itself** (Operations `~18` vs `48 total`; Identity 126 vs `~350+`), which sub-part wins — the enumerated rows, the `Total` row, or the section heading? | §5.2 — 6 of 10 specs affected; no rule exists | **Yes** — blocks the authority rule from being executable |
| **D-4** | Does a **positional** section reference (§7.1, §9.1, §10.3, §11.2) govern, or a **named** section? Institution Management offsets Phase 6→§15, Phase 7→§16 | §5.3 — positional references silently skip one specification | Yes, for tooling |
| **D-5** | What is the **project-wide phase-status vocabulary**, and who owns it? | §4.1 — 9 of 10 specs use an undefined `Complete`; Finance's definition exists but is audit-introduced and unadopted | **Yes** — blocks all status correction |
| **D-6** | What **verification gate** must a phase pass to be `Complete`? | §4.3 / §5.6 — 10 of 10 assert `2-pass validation` with no `validate` script in any `package.json`; 8 of 8 readiness checklists are 0% checked | **Yes** — `Complete` is currently unfalsifiable |
| **D-7** | What is the **specification-domain → repository** mapping rule? | §5.7 — 11 module dirs for 10 specs, and two plausible Prisma locations per domain (`domains/*.prisma` vs the 99-model root `schema.prisma`) | **Yes** — "the repository is authoritative" is not executable without it |
| **D-8** | Which document governs **approval state** — `00 README.md` or `ROADMAP.md`? | §2.5 — they conflict for 7 of 10 specs, and ROADMAP contradicts itself | Yes, for release gating |
| **D-9** | Should the **Finance §4.1 discrepancy register** be adopted project-wide, and if so where does it live and who maintains it? | §7.2 — one instance exists, created by audit; no designated location; already drifting (§4.1 item 1 describes a row that no longer says what it quotes) | No, but needed before any count is corrected |
| **D-10** | Do `Complete`, `Approved & Frozen`, and `Specified / Not Implemented` denote the **same** axis, or different ones? | §4 — `Approved & Frozen` is a *document* state in README/ROADMAP; `Complete` is a *phase* state in §4; Finance's `Specified / Not Implemented` is a third. No document reconciles them | Yes, for coherent reporting |

---

## 9. Risks of Proceeding Without a Convention

### 9.1 Estimation and planning risk (immediate, quantified)

| Risk | Evidence | Magnitude |
|---|---|---|
| Test-effort estimates built on §4 scenario counts are unreliable by up to **2.8×** | Identity 126 actual vs `~350+` claimed; Institution 154 vs `~280+`; Operations 204 vs `~400+` | A test plan sized from these claims is short by 60–72% in 3 of 10 domains |
| Schema work estimates are unreliable | Operations §4 `~18 models` vs its own §8.2 `48 total`; Platform `~48` vs 55 | Up to **2.7×** misestimate on one domain |
| Endpoint-based scoping is unreliable in both directions | People −19, D&L −7, Identity −5, Reporting +4 | Scope can be under- **or** over-built with no signal as to which |
| Module-based ownership assignment is unreliable | 5 of 10 module counts wrong; 2 specs claim 13 controllers with no controllers section | Ownership cannot be assigned from the specs |

### 9.2 Verification risk (structural)

- **No falsifiable completion criterion exists.** 9 of 10 specifications assert `Complete` for all 7
  phases while their own readiness checklists are 0% checked and no validation gate exists in any
  `package.json`. **`Complete` cannot currently be disproved by any evidence**, because no rule
  says what would disprove it.
- **The `2-pass validation` claim is unfalsifiable in 10 of 10 specs.** No script, no artefact.
  Anyone relying on it is relying on an unverifiable assertion.
- **Identity & Access asserts "production readiness verified" with a 0-of-12 checklist.** This is the
  clearest single instance of a status claim contradicted by the spec's own evidence, and it is
  currently the *most* implemented-looking spec in the set (19 tables, 15 repositories, root-schema
  models present) — so it is the one most likely to be trusted.

### 9.3 Authorisation and scope risk

- **7 of 10 specifications have conflicting approval state** between README and ROADMAP. Work
  scoped against "Approved & Frozen" may be starting on a document the ROADMAP considers Under
  Review — or the reverse. There is no way to tell which is right.
- **"Approved & Frozen" is undefined** beyond one README bullet, and that bullet ties it to
  *"completed all phases"* — which, per §4.3, 9 of 10 specifications assert while their checklists
  are unexecuted. **The freeze is therefore self-certified against an undefined criterion.**

### 9.4 Tooling and comparability risk

- **Positional section references are not portable** (§5.3) and **granularity is not uniform**
  (§5.4), so no automated cross-specification count checker can be built without D-2 and D-4 first.
- **Two plausible Prisma homes per domain** (§5.7) mean an automated implementation checker would
  report different model counts depending on which file it reads. Building such a tool before D-7
  would produce confidently wrong numbers.

### 9.5 Documentation-drift risk

- **10 of 10 ROADMAP line counts are stale** by 219–550 lines, and ROADMAP contradicts itself on
  completion. The supporting documents are not being maintained, so they cannot serve as the place
  to record a new convention without first being brought under control.
- **The one existing discrepancy register has already drifted** from the document it describes
  (§7.2), which is evidence that a hand-maintained register decays without a maintenance rule.

### 9.6 Sequencing risk

Normalising Finance's counts first — before D-1 through D-4 — would require choosing a number with
no rule to choose it by, and would set a precedent for the other 9 specifications. Conversely,
leaving all 10 uncorrected leaves 9 specifications asserting unverifiable `Complete` statuses,
which is the higher-exposure risk given that `Complete` currently has no definition.

---

## 10. Conclusion

### 10.1 Against the four candidate classifications

| Candidate | Verdict | Basis |
|---|---|---|
| **A. An existing documented convention that Finance failed to follow** | **RULED OUT** | No counting-authority convention exists in any of the 10 specifications, the README, or the ROADMAP. All 38 "authoritative" / "source of truth" / "takes precedence" hits concern **domain data ownership**, never count or section precedence (§2.1). There is no convention to have failed |
| **B. A project-wide documentation gap** | **CONFIRMED — this is the result** | Zero conventions for counting authority (§2.1), zero verification gates (§5.6), 9 of 10 status vocabularies undefined (§4.1), 0 of 10 production-readiness checklists executed (§4.3), and no discrepancy-recording practice in 9 of 10 specs (§7.2) |
| **C. Multiple incompatible conventions** | **PARTIALLY TRUE, but not the root cause** | There is genuine inconsistency (§5.1 bidirectional mismatches, §5.3 non-portable section numbers, §5.4 non-uniform granularity, §5.7 ambiguous repository mapping). But this is **inconsistency arising from the absence of any convention**, not the coexistence of two or more competing conventions. Only one convention-like artefact exists — Finance's audit-introduced status definition — and it was never adopted elsewhere |
| **D. Something else** | — | Not supported. The evidence is fully accounted for by B, with C as a symptom |

### 10.2 Result

**The evidence establishes B: a project-wide documentation gap.**

The 10 specifications share a **common document skeleton** (the same 7 phase names, the same §4
status table, broadly the same section ordering) but **no common counting convention, no common
status convention, and no common verification rule**. What looks like a shared convention is
actually a shared *template*; the conventions that a template implies were never written down in
any of them.

### 10.3 Direct answers to the audit questions

| Question | Answer |
|---|---|
| All 10 specifications inspected? | **Yes** — 10 of 10, plus README and ROADMAP |
| Does a project-wide convention already exist? | **No.** Not for counting authority, not for status vocabulary, not for verification. The only status definition in the project is Finance's, audit-introduced and unadopted |
| Is the proposed detail-over-summary convention supported, contradicted, or undecided? | **Undecided** — and insufficient as written. Supported as an aspiration (the project already contains one fully reconciled example in Platform Administration's §10.1); not currently practised; and blocked by three definitional gaps: self-contradictory detail sections (6/10), non-portable section numbers (1/10 offset), non-uniform granularity (3/10). Its second clause — "record rather than silently choose" — is a **new** decision with exactly one working precedent |
| Implementation-status convention findings? | **One status value in use (`Complete`), undefined in 9 of 10, defined once by audit in Finance. None of the six requested states (specified / designed / scaffolded / implemented / verified / complete) is distinguished anywhere. No verification gate exists in 10 of 10; readiness checklists are 0% executed in 8 of 8 that exist** |
| Decisions that remain necessary? | **10** (D-1 … D-10), of which **6 are blocking**: the authority rule, the countable unit, the self-contradictory-detail tie-break, the section-identifier scheme, the status vocabulary, the verification gate, and the repository mapping rule |

### 10.4 Safe-stop

**No conflicting definitions of authority were found that required a choice between them — because
no definitions of authority were found at all.** There is therefore nothing to reconcile and no
conflict to adjudicate. This audit records the absence and stops.

**Nothing was adopted, chosen, normalised, or decided.** No count was corrected. No status was
changed. No specification, code file, Prisma schema, test, UI, or configuration file was modified.
No version was bumped. D-2 and D-3 were not touched. The Finance module-count investigation was not
modified. Nothing was committed.

---

## 11. Verification Performed

All checks were read-only. No build, test, Prisma, migration, or lint command was executed.

| # | Check | Established |
|---|---|---|
| 1 | Enumerated `engineering/*.md`; confirmed exactly 10 `*Engineering.md` files plus README and ROADMAP; confirmed no nested spec directories | 10 specs, 12 documents |
| 2 | Searched all 10 specs for 12 authority keywords | 38 hits, **all** about domain data ownership; `normative`, `single source`, `summary of`, `in the event of conflict` = 0 |
| 3 | Read `engineering/00 README.md` and `engineering/ROADMAP.md` in full | README has 3 convention bullets, none about counting; ROADMAP has 4 undefined phase symbols and subject-matter-only phase definitions |
| 4 | Compared README vs ROADMAP approval status per specification | **7 of 10 conflict** |
| 5 | Compared ROADMAP claimed line counts to actual | **10 of 10 understated**, 219–550 lines |
| 6 | Extracted the §4 status table for all 10 specs | Identical 7-row shape; `Complete` in all; Finance the only spec with a second value |
| 7 | Extracted §4 summary counts for all 7 phases × 10 specs | Complete summary dataset |
| 8 | Counted §7.1 table rows per spec, correcting two counter bugs (a `[\s:-|]` character-range error and an `11.1`/`11.2` regex collision) | Validated against Finance's known 30 |
| 9 | Counted §9.1/9.2/9.3/9.4 rows per spec | Module/repo/service/controller detail counts; flagged granularity-divergent specs as `n/c` |
| 10 | Counted §10.3 / §10.1 / §15 endpoint rows per spec | Endpoint detail counts; identified 3 specs using a resource-group summary rather than a route catalogue |
| 11 | Counted test categories and summed per-category scenario rows for all 10 specs | Found Identity 126 vs `~350+`, Institution 154 vs `~280+`, Operations 204 vs `~400+`, People three-way split, Reporting 236 vs `~226+` |
| 12 | Verified Platform Administration §10.1 Primary/Sub/Total arithmetic | Sums exactly to 137 = 85 + 52 — the one fully reconciled endpoint claim |
| 13 | Located Institution Management's Phase 6 and Phase 7 | Found at **§15 and §16**, not §10 and §11; test categories at §16.2 |
| 14 | Checked Documents & Learning and Reporting & Analytics §9 subsections | **No Controllers section exists** in either, despite both claiming 13 controllers |
| 15 | Counted `model X {` blocks per Prisma domain file; enumerated the 99 root-schema models | Domain files range 2–32 models; root schema spans all 10 domains |
| 16 | Probed the root schema for domain-specific model names | Confirms the double-homed Prisma ambiguity |
| 17 | Enumerated `apps/api/src/modules` and counted controllers/tests per directory | 11 dirs; **no** dir for Finance, Operations, Documents & Learning, Reporting & Analytics |
| 18 | Read `apps/api/package.json` and `apps/web/package.json` scripts | **No `validate` script anywhere** — `2-pass validation` is ungated in all 10 specs |
| 19 | Searched all 10 specs for status-vocabulary definitions; individually inspected all 9 apparent hits | **All false positives** (entity lifecycle enums, route names, two-pass prose). Finance §4 L223 is the sole real definition |
| 20 | Counted checked vs unchecked Production Readiness Checklist boxes across all 10 specs | **0 checked project-wide**; 8 specs have checklists (12–18 boxes each), 3 have none |
| 21 | Grepped the 10 specs for the 16 Finance module names | Only `People Engineering.md` matched, and only the root `FinanceModule`; it also references a payroll capability absent from Finance |

---

*End of audit. Read-only: no engineering specification, code, Prisma schema, migration, test, UI, or
configuration file was modified; no version was bumped; no count was normalised; no architectural
decision was made or adopted; D-2 and D-3 were not touched; the Finance module-count investigation
was not modified. Nothing was committed.*
