# D-2 — Countable Units and Granularity

| Field | Value |
|---|---|
| **Document type** | Decision material — investigation only, no convention adopted |
| **Date** | 2026-09-26 |
| **Repository HEAD** | `aae6309` |
| **Branch** | `phase/2-rbac` |
| **Decision** | D-2 from `docs/PROJECT_SPEC_COUNTING_AND_STATUS_CONVENTION_AUDIT.md` |
| **Prerequisite** | D-1 (`docs/DECISION_D1_SPECIFICATION_AUTHORITY.md`) — not resolved |
| **Scope** | D-2 only. D-1 and D-3 … D-10 are **not** resolved here. |
| **Files changed by this document** | **None.** This report is the only artifact created. |
| **Outcome** | **No specification defines any countable unit.** 9 categories were investigated across all 10 specifications. Each category shows 3–5 mutually incompatible counting units. **D-2 is not decidable from existing evidence** — an architecture/product decision is required (§17). |

---

## 1. Decision Question

**When an engineering specification states a number — "35 tables", "15 modules", "13 repositories",
"110+ endpoints", "50+ indexes" — what exactly is being counted?**

Nine countable categories appear in the phase-status tables of all ten specifications:

| # | Category |
|---|---|
| 1 | module |
| 2 | model / table |
| 3 | repository |
| 4 | domain service |
| 5 | controller |
| 6 | endpoint |
| 7 | event consumer |
| 8 | test scenario / test category |
| 9 | index |
| 10 | unique constraint |

For each, D-2 must answer three questions:

1. **Unit** — what is one unit of this category?
2. **Exhaustiveness** — is the specification's enumeration of that unit complete, or illustrative?
3. **Reconciliation** — when the summary figure and the detail enumeration disagree, which is the count?

The purpose is to determine whether a consistent countable-unit definition can be **derived from
existing evidence**, or whether each category requires an **explicit project decision**.

This investigation does not attempt to derive a convention. It establishes what the documents
already mean, and where they mean incompatible things.

---

## 2. Existing Definitions

### 2.1 Method

Every specification was searched for definitional language using, among others, the patterns
`for the purposes of`, `by a module we`, `we define`, `we mean`, `we count`, `definition of`,
`is defined as`, `counting rule`, `counting unit`, `counting convention`, `counts as`,
`definitionally`, `an endpoint is`, `endpoint means`, `one endpoint`, `each endpoint`,
`resource group`, `primary endpoint`, `sub-resource endpoint`, `module is defined`,
`one module per`, `each module`, `composition root`.

Search scope: all 10 files in `engineering/`, plus `engineering/00 README.md`,
`engineering/ROADMAP.md`, `MASTER_SMS_ROADMAP.md`, `docs/`, and `architecture/`.

### 2.2 Result: no countable unit is defined anywhere

| Source | What it defines | Does it define a countable unit? |
|---|---|---|
| `engineering/00 README.md:41-46` — "Conventions" | 7-phase structure; sequential ADR numbering; "Approved & Frozen" means locked; all 10 domains frozen | **No.** Four conventions, none about counting |
| `engineering/ROADMAP.md:67-77` — "Phase Definitions" | The *subject matter* of P1–P7 (e.g. P3 = "PostgreSQL schema, indexes, constraints, foreign keys"; P5 = "Module, controllers, services, repositories, DTOs, guards, events") | **No.** Names the artifact kinds a phase contains; never says what one of them is |
| `engineering/ROADMAP.md:35-41` — "Domain Notes" | Counts Platform Administration as "15 bounded contexts, 62 tables, 55 Prisma models, ~137 API endpoints"; Documents & Learning as "13 bounded contexts" | **No.** Applies five different units without defining any |
| `engineering/ROADMAP.md:83-94` — "Engineering Document Index" | Document size in lines and ADR counts | **No.** Line counts are a different unit again (and stale — see §12.9) |
| `engineering/ROADMAP.md:102-126` — "Session Log" | Phase-completion counts, e.g. Identity P3 "19 tables, 15 sections", P4 "19 models, 12 enums, ~144 columns, 43 indexes" | **No.** "sections" is used as a countable unit with no definition |
| `Naming Conventions` sections (all 10 specs) | snake_case plural table names; camelCase Prisma fields; ID formats | **No.** Naming rules, not counting rules |
| `Finance Engineering.md:232-243` | A phase-**status** vocabulary ("Complete" = implemented and verified) | **No.** Defines a status word, not a countable unit — the only self-defining convention in the set |

### 2.3 The single definitional sentence in `engineering/`

The only occurrence of definitional phrasing in all ten specifications is
`Reporting & Analytics Engineering.md:275`:

```
| ComplianceRule | Core | Audit & Compliance | Definition of a compliance check rule |
```

This describes a domain concept. It is not a counting rule.

### 2.4 Self-describing enumerations (partiality is declared twice)

Only two sections in the entire set declare their own incompleteness:

| Location | Heading | What it declares |
|---|---|---|
| `Operations Engineering.md:1340` | `### 7.4 Indexes (Key Performance Indexes)` | The index list is a **selected** list, not all indexes |
| `Operations Engineering.md:1551` | `### 8.2 Models (Key Models — 48 total)` | The model list is a **selected** list of 48 total |

Every other index and model list is presented as if complete, while its summary figure is larger.

### 2.5 Sub-unit names used without definition

Three specifications introduce named sub-units of "endpoint" and never define them:

- `Platform Administration Engineering.md:3006` — columns `Primary Endpoints | Sub-Resource Endpoints | Total`
- `Identity & Access Engineering.md:171` — "61 endpoints (37 primary + 24 sub-resource), 14 resource groups"
- `Communication Engineering.md:2282`, `Operations Engineering.md:2167` — column `Resource Group | Endpoints`

`resource group` is realised three different ways (§7.4). `primary` / `sub-resource` is realised
zero ways (§7.3).

### 2.6 Conclusion for §2

**0 of 10 specifications define any countable unit. 0 of the 9 categories has a definition anywhere
in the repository** — not in the specifications, not in the README, not in the ROADMAP, not in
`docs/`, not in `architecture/`, not in `MASTER_SMS_ROADMAP.md`.

This is consistent with D-1's finding that no project-wide specification-authority rule exists.
D-2 is a strictly larger gap: D-1 concerns *which section governs*; D-2 concerns *what is being
counted*, and that is undefined everywhere.

---

## 3. Module Counting

### 3.1 Where modules are counted

All ten specifications have a `§9.1 Module Structure` table. All ten state a module count in the
Phase 5 status row.

| Specification | §4 Phase 5 claim | §9.1 rows | Root module present? | Agrees? |
|---|---:|---:|---|---|
| Academic Management | 15 | 15 | yes — `AcademicManagementModule` | yes |
| Communication | 14 | 14 | **no** | yes |
| Documents & Learning | 13 | **15** | yes — `DocumentsLearningModule` | **no** |
| Finance | 16 | 16 | yes — `FinanceModule` | yes |
| Identity & Access | 11 | 11 | yes — `IdentityAccessModule` | yes |
| Institution Management | 8 | **11** | yes — `InstitutionManagementModule` | **no** |
| Operations | 16 | **11** | **no** | **no** |
| People | 11 | 11 | yes — `PeopleModule` | yes |
| Platform Administration | 15 | 15 | **no** | yes |
| Reporting & Analytics | 14 | **13** | yes — `ReportingAnalyticsModule` | **no** |

Six of ten agree. Four do not.

### 3.2 Different counting units found for "module"

**Unit 1 — NestJS module class including the composition root.** Seven specifications list a
root module whose stated responsibility is "Root module, orchestrates sub-modules". Counting rows
includes it. Whether the root is a "module" or a composition root is never stated.

**Unit 2 — functional submodule only, root excluded.** Three specifications (Communication,
Operations, Platform) have no root row. If a project rule counted the root, those three would be
undercounted by one; if it excluded the root, the other seven would be overcounted by one. The
documents support both readings.

**Unit 3 — API area.** `Platform Administration Engineering.md:3004-3024` uses the column header
**`Module`** in §10.1 for API areas ("Tenant Lifecycle", "Subscriptions", "Licensing", …), not
NestJS module names. There are 15 of them and they correspond 1:1 with the 15 §9.1 NestJS modules,
but the labels are different strings and the meaning is different. The same word denotes two units
inside one specification.

**Unit 4 — module directory (repository only, supporting evidence).** The implemented codebase has
**11** module directories under `apps/api/src/modules` (`academics`, `audit`, `auth`, `delivery`,
`events`, `identity`, `institutions`, `invitations`, `onboarding`, `people`, `session`) and
**18** `*.module.ts` files. A directory count and a module-class count are different numbers for
the same word. This is supporting evidence only and is not treated as architecturally authoritative.

### 3.3 Evidence that some module counts were copied from a different category

Comparing Phase 5 claims against each specification's own Phase 2 aggregate count:

| Specification | P2 aggregates | P5 modules / repositories / services / controllers | Echo? |
|---|---:|---|---|
| Documents & Learning | 13 | 13 / 13 / 13 / 13 | **all four equal the aggregate count** |
| Platform Administration | 15 (bounded contexts and aggregates) | 15 / 15 / 15 / 15 | **all four equal the bounded-context count** |
| Reporting & Analytics | 13 | 14 / 13 / 13 / 13 | three equal the aggregate count |
| Academic Management | 15 | 15 / 15 / 15 / 14 | three equal the aggregate count |
| Communication | 12 | 14 / 27 / 14 / 14 | no (repositories were later corrected to 27) |
| Identity & Access | 6 | 11 / 15 / 9 / 9 | no |
| Institution Management | 7 | 8 / 12 / 8 / — | no |
| People | 10 | 11 / 10 / 11 / 10 | partial |
| Operations | 14 | 16 / 16 / 16 / 16 | no |
| Finance | 11 | 16 / — / — / 14 | no |

In four specifications the Phase 5 figures reproduce the Phase 2 aggregate or bounded-context
count rather than the Phase 5 enumeration. In Documents & Learning the evidence is decisive: the
claim is 13/13/13/13 while the enumerations are **15 modules, 31 repositories, 17 services, and no
controller section at all** (§5, §12.3).

### 3.4 Main ambiguity

"Is one module (a) a NestJS module class, (b) a module directory, (c) a composition root plus its
submodules, (d) a functional submodule excluding the root, or (e) an API area?" All five readings
are instantiated somewhere in the ten specifications.

---

## 4. Model/Table Counting

### 4.1 Four different enumeration formats

| Format | Specifications | Example |
|---|---|---|
| **Prose comma list** | Academic, Finance, Identity, Institution, People | `Academic Management Engineering.md:1315` — "35 models: AcademicYear, …, SummerSchoolResult, **and 3 join/lookup tables**" |
| **Numbered list** | Documents & Learning, Reporting | `Documents & Learning Engineering.md:1464-1466` — "34 Prisma models:" followed by `1.` … `33.` |
| **Prisma code blocks** (`model X {`) | Communication (28), Operations (17), Platform (55) | `Communication Engineering.md:1468-1469` — ` ```prisma ` / `model NotificationTemplate {` |
| **SQL DDL** (`CREATE TABLE`) | **none** | — |

### 4.2 The prose "remainder" is quantified in one specification and not in another

- `Academic Management Engineering.md:1315` — 32 models named, then "**and 3 join/lookup tables**".
  The remainder is explicit: 32 + 3 = 35.
- `Finance Engineering.md:1286` — 30 models named, then "**and supporting lookup tables**". The
  remainder is *unquantified*: the figure 32 is asserted, not derived. The same sentence is the
  reason §4 Phase 3 claims 32 tables while `§7.1` catalogues 30.

This is a countable-unit problem, not a counting error: the two specifications use the same word
("models") with the same construction ("N named plus join/lookup tables") and a different
arithmetic contract.

### 4.3 Phase 3 table count vs Phase 4 model count vs the enumerations

| Specification | P3 tables claim | §7.1 rows | P4 models claim | Model enumeration | Tables = models? |
|---|---:|---:|---:|---|---|
| Academic Management | 35 | **31** | 35 | 32 named + 3 join/lookup = 35 | yes, both 35 — but §7.1 lists 31 |
| Communication | 28 | 28 | 28 | 28 `model` blocks | yes |
| Documents & Learning | 33 | **34** | 34 | heading says 34, list has **33** items | **no** |
| Finance | 32 | **30** | 32 | 30 named + unquantified remainder | **no** (§7.1 says 30) |
| Identity & Access | 19 | 19 | 19 | 19 named | yes |
| Institution Management | 15 | 15 | 15 | 15 named | yes |
| Operations | 55 | 55 | **~18** ("remainder abbreviated") | 17 `model` blocks; §8.2 heading says "48 total" | **no — three different figures** |
| People | 20 | 20 | 20 | 20 named | yes |
| Platform Administration | 62 | 62 | **~48** | **55** `model` blocks | **no** |
| Reporting & Analytics | 31 | 31 | 31 | 31 numbered items | yes |

Seven of ten have `tables = models`. Three do not, and in those three the *same specification*
carries three or four mutually exclusive figures.

### 4.4 "Table" is never disambiguated from the ER-diagram table

Phase 2 mandates "Mermaid ER diagrams" (`engineering/ROADMAP.md:72`), so "table" also appears in a
design-artifact sense. No specification states whether the Phase 3 count includes join tables,
lookup tables, junction tables, or "future"-marked tables — all of which are present:

- `Academic Management Engineering.md:859` — "Subject-to-subject_group is many-to-many via the `subject_subject_groups` **join table**."
- `Institution Management Engineering.md:844-845` — `RegionRepository`, `CampusRepository` marked "(future)" but counted.

### 4.5 Main ambiguity

"Is one model/table (a) a physical database table, (b) a Prisma `model` declaration, (c) an entity
in the domain model, (d) a row in the §7.1 catalogue, or (e) a box in an ER diagram — and do join,
lookup and future-marked tables count?"

---

## 5. Repository Counting

### 5.1 Three incompatible granularities are in active use

| Specification | P5 repositories claim | §9.2 rows | Tables | Ratio | Implied unit |
|---|---:|---:|---:|---|---|
| Academic Management | 15 | **14** | 35 | 0.40 | one per **module** (15 modules − root = 14) |
| Communication | 27 | 27 | 28 | 0.96 | ~one per **table** |
| Documents & Learning | 13 | **31** | 34 | 0.91 | ~one per **table** |
| Finance | — (14 previously) | **11** | 30 | 0.37 | one per **aggregate** (11 aggregates) |
| Identity & Access | 15 | 15 | 19 | 0.79 | ~one per **entity** |
| Institution Management | 12 | **15** | 15 | 1.00 | exactly one per **table** |
| Operations | 16 | **38** | 55 | 0.69 | ~one per **entity** |
| People | 10 | 10 | 20 | 0.50 | one per **module** |
| Platform Administration | 15 | **44** | 62 | 0.71 | one per **entity group** |
| Reporting & Analytics | 13 | **22** | 31 | 0.71 | ~one per **entity** |

The same word is used for repositories keyed on modules, on aggregates, on entities and on tables.

### 5.2 The design-interface vs concrete-class distinction is used but never declared

`Platform Administration Engineering.md:2802` titles the section `### 9.2 Repository **Interfaces**`
and its table has no entity column — only "Key Methods". Every other specification titles it
"Repository Layer" and carries an explicit `Entities` column. Platform's Phase 5 row nonetheless
counts "15 repositories" in the same list as "15 modules, 15 domain services, 15 controllers" —
i.e. it counts a *design-time interface* alongside *implementation artifacts*. Institution
Management's Phase 5 row is silent about controllers entirely (§5.5).

### 5.3 Platform carries three repository counts inside Phase 5 alone

| Source | Count |
|---|---:|
| `§4` Phase 5 status claim | 15 |
| `§9.1` `Repositories` column, comma-separated across 15 module rows | **40** |
| `§9.2 Repository Interfaces` table rows | **44** |

They do not agree with each other. Six repositories appear in §9.2 but not in §9.1's column
(`TenantDeletionWorkflowRepository`, `LicenseHistoryRepository`, `FeatureFlagAuditRepository`,
`WebhookEventSubscriptionRepository`, `ScheduledJobConfigurationRepository`,
`WorkerHealthSnapshotRepository`); one appears in §9.1 but not in §9.2
(`AuditExportConfigurationRepository`).

### 5.4 One row represents multiple things

- `Finance Engineering.md:1335` — `BillingRepository` owns **Bill, Invoice, InvoiceLineItem, ChargeAdjustment** (4 tables in one row).
- `Finance Engineering.md:1342` — `AccountingRepository` owns **LedgerAccount, JournalEntry, JournalEntryLine, AccountBalance, FinancialPeriod** (5 tables).
- `Academic Management Engineering.md:1361` — `AcademicCalendarRepository` owns **AcademicYear, AcademicSession, Term** (3).
- `Documents & Learning Engineering.md:1537` — `DocumentRepository` owns **Document, DocumentTagJunction** — an entity and a junction table in one row.

Contrast `Operations Engineering.md:2027-2064`, where 38 rows each name exactly one entity. Both
styles are "one repository row"; they represent 4–5 different numbers of tables.

### 5.5 Categories present in the detail but absent from the summary

`Institution Management Engineering.md:168` — the Phase 5 row reads
`8 modules, 12 repositories, 8 domain services, 6 event consumers`. **No controller count is
claimed**, yet `§9.4 Controllers` enumerates 10. A category that exists in the document is simply
missing from the summary, so the summary cannot be used to detect its absence.

### 5.6 Main ambiguity

"Is one repository (a) a TypeScript interface, (b) an abstract class, (c) a concrete Prisma-backed
provider, (d) one per table, (e) one per module, or (f) one per aggregate — and does a repository
that spans five tables count once or five times?"

---

## 6. Service Counting

### 6.1 Claim vs enumeration

| Specification | P5 services claim | §9.3 rows | Agrees? |
|---|---:|---:|---|
| Academic Management | 15 | 15 | yes |
| Communication | 14 | 14 | yes |
| Documents & Learning | 13 | **17** | **no** |
| Finance | — (14 previously) | 16 | — |
| Identity & Access | 9 | 9 | yes |
| Institution Management | 8 | **11** | **no** |
| Operations | 16 | **24** | **no** |
| People | 11 | 11 | yes |
| Platform Administration | 15 | **60** | **no** |
| Reporting & Analytics | 13 | **16** | **no** |

### 6.2 Platform's service count has three values and two granularities

| Source | Count | Granularity |
|---|---:|---|
| `§4` Phase 5 claim | 15 | one per module |
| `§9.1` `Services` column (comma-separated) | **18** | one per module, but `TenantLifecycleModule` alone lists 3 |
| `§9.3 Domain Service Details` — `#### <ServiceName>` subsections | **60** | one per service class |

The §9.1 column and the §9.3 subsection list are two enumerations of the same category in the same
section pair, and they differ by 42.

### 6.3 "Domain service" does not mean one thing

The label is used identically for at least three kinds of component:

- **Domain/orchestration service** — `Platform Administration Engineering.md:2786` `TenantLifecycleService`.
- **Workflow service** — same row: `TenantProvisioningService`, `TenantDeletionService`.
- **Read-model projection service** — `Finance Engineering.md:1366` `FinancialReportService`, whose stated job is report generation from projections, not domain behaviour.

No specification defines the boundary between a "domain service" and an application service, and
`§6.3 Domain Services` (Phase 2) and `§9.3 Domain Services` (Phase 5) use the identical term for
different levels of design.

### 6.4 One service with no module

`Finance Engineering.md:1366` defines `FinancialReportService` and `Finance Engineering.md:1386`
defines `FinancialReportController`, but `§9.1 Module Structure` (`:1313-1328`) has **no**
`FinancialReportModule`. The 16 modules and 16 services coincide numerically while not
corresponding one-to-one. Conversely `PaymentAllocationModule` (`:1318`) has no
`PaymentAllocationRepository` in §9.2 and no resource group in §10.3.

### 6.5 Main ambiguity

"Is one service (a) a class, (b) a §9.3 table row, (c) a §9.3 detail subsection, or (d) a
responsibility — and is a read-model projector a 'domain service'?"

---

## 7. Controller/Endpoint Counting

### 7.1 The endpoint row is the one well-defined unit in the whole set

Every endpoint catalogue row is a `Method | Endpoint | …` pair. A duplicate check within each of the
ten catalogues found **zero** duplicate method+path pairs in every one of them:

| Specification | Rows | Distinct method+path | Duplicates |
|---|---:|---:|---:|
| Academic Management | 109 | 109 | 0 |
| Communication | 85 | 85 | 0 |
| Documents & Learning | 127 | 127 | 0 |
| Finance | 98 | 98 | 0 |
| Identity & Access | 66 | 66 | 0 |
| Institution Management | 65 | 65 | 0 |
| Operations | 117 | 117 | 0 |
| People | 77 | 77 | 0 |
| Platform Administration | 142 | 142 | 0 |
| Reporting & Analytics | 102 | 102 | 0 |

So an endpoint row is unambiguous *as a row*. The problems are all in the figures that are
supposed to summarise those rows.

### 7.1a The same check pooled across specifications: 8 method+path pairs are claimed more than once

The zero-duplicate result above holds **within** each catalogue. Pooling all 988 rows into a single
namespace — the check a project-wide route registry would perform — gives **976** distinct
method+path pairs, i.e. **8 pairs are claimed by more than one specification**. All 8 lie on a single
prefix, `/api/v1/templates`:

| method+path | claimed by |
|---|---:|
| `GET /api/v1/templates` | 3 |
| `POST /api/v1/templates` | 3 |
| `GET /api/v1/templates/:id` | 3 |
| `DELETE /api/v1/templates/:id` | 3 |
| `POST /api/v1/templates/:id/publish` | 2 |
| `GET /api/v1/templates/:id/versions` | 2 |
| `POST /api/v1/templates/:id/preview` | 2 |
| `PUT /api/v1/templates/:id` | 2 |

Source rows: `Communication Engineering.md:2349-2357` (9 rows),
`Documents & Learning Engineering.md:1734-1745` (12 rows),
`Institution Management Engineering.md:1292-1298` (7 rows).

This is recorded, **not resolved**. Whether these are three specifications designing one shared
templates API, three independent APIs that must be routed apart, or an unrecognised duplication is
an ownership question this investigation does not answer. It is noted because it is direct evidence
that "an endpoint" is not globally unique even when each document's own rows are: a count is
well-defined per specification and undefined across specifications, which is the same defect found in
§3 (module) and §5 (repository) expressed in routes.

### 7.2 Claim vs enumerated rows

| Specification | P6 claim | Summary table | Summary rows sum | Detail rows enumerated | Groups |
|---|---:|---|---:|---:|---:|
| Academic Management | 110+ | none | — | 109 | 18 |
| Communication | 79 | `§10.1` | **79 ✓** | **85** | 15 |
| Documents & Learning | 120 | none | — | **127** | 18 |
| Finance | 100+ (65+35) | none | — | **98** | **16** (claim says 18) |
| Identity & Access | 61 (37+24) | none | — | **66** | 14 ✓ |
| Institution Management | 52 (34+18) | none | — | **65** | 11 |
| Operations | 120+ (80+40) | `§10.1` | 123, Total row `~121` | **117** | 9 areas |
| People | 58 (38+20) | none | — | **77** | 18 |
| Platform Administration | 137 (85+52) | `§10.1` | **137 ✓** | **142** | 15 |
| Reporting & Analytics | 106 | none | — | **102** | 18 |

Only 2 of 10 have a summary table whose total equals the Phase 6 claim. Operations carries **four**
different figures for its own endpoint count: `120+` (P6 row), `~121` (§10.1 Total row), `123` (sum
of §10.1 group rows), `117` (rows in §10.2–§10.10).

### 7.3 The "primary / sub-resource" split is declared six times and is reproducible zero times

Claimed splits: Identity 37+24, Institution 34+18, People 38+20, Operations 80+40, Platform 85+52,
Finance 65+35.

A natural candidate rule — *a route containing a path parameter is sub-resource, otherwise primary* —
was tested against every catalogue:

| Specification | Claimed split | Routes with no path parameter | Routes with a path parameter |
|---|---|---:|---:|
| Identity & Access | 37 + 24 | 29 | 37 |
| Institution Management | 34 + 18 | 6 | 59 |
| People | 38 + 20 | 6 | 71 |
| Operations | 80 + 40 | 53 | 64 |
| Platform Administration | 85 + 52 | 36 | 106 |
| Finance | 65 + 35 | 50 | 48 |

**No specification's split is reproduced by this or any equivalent path-shape rule.** Institution
Management and People expose only 6 parameterless routes each because their APIs are almost entirely
nested under `/api/v1/people/:personId/…`; a nesting-based "primary/sub-resource" reading would be
95/6, not 34/18. The split is therefore an unsourced assertion in all six cases. This extends the
Finance finding already recorded at `Finance Engineering.md:220` ("not labelled anywhere in §10.3
and is **Unable to Verify**") to five further specifications.

### 7.4 "Resource group" is realised three different ways

| Style | Specifications | Count of groups |
|---|---|---|
| `####` sub-heading inside one catalogue | Academic (18), Identity (14), People (18), D&L (18), Reporting (18), Finance (16) | 14–18 |
| `###` section per area | Operations (§10.2–§10.10, 9), Platform (§10.2–§10.16, 15) | 9–15 |
| a summary-table column | Communication (15 rows), Operations (27 rows), Platform (15 rows) | 15–27 |

The same term denotes between 9 and 27 things depending on the specification. A "resource group"
is not a portable unit.

### 7.5 Controller ≠ endpoint, and two specifications claim controllers they never enumerate

| Specification | P5 controllers claim | §9.4 rows | Enumerated endpoints |
|---|---:|---:|---:|
| Academic Management | 14 | 14 | 109 |
| Communication | 14 | 14 | 85 |
| Documents & Learning | 13 | **no controller section exists** | 127 |
| Finance | 14 | 14 | 98 |
| Identity & Access | 9 | 9 | 66 |
| Institution Management | **no claim** | 10 | 65 |
| Operations | 16 | **26** | 117 |
| People | 10 | 10 | 77 |
| Platform Administration | 15 | **no controller section exists** | 142 |
| Reporting & Analytics | 13 | **no controller section exists** | 102 |

Documents & Learning, Platform Administration and Reporting & Analytics each claim a controller
count while having no section that enumerates controllers. Institution Management enumerates 10
controllers while claiming none.

The §9.4 `Route Prefix` column and the §10.3 concrete paths are two granularities of one API
surface: `Finance Engineering.md:1373` gives `/api/v1/finance/fees` as a prefix, while
`§10.3` lists 7 distinct method+path rows under that prefix. A controller-based count and an
endpoint-row count differ by roughly 7× in Finance.

### 7.6 Main ambiguity

"Is one endpoint (a) a method+path row, (b) a route template, (c) a controller, (d) a resource, or
(e) a resource group — and what is a 'primary' versus a 'sub-resource' endpoint?"

---

## 8. Event Consumer Counting

### 8.1 Claim vs enumeration

| Specification | P5 consumers claim | §9.x rows | Agrees? |
|---|---:|---:|---|
| Academic Management | 8 | 8 | yes |
| Communication | 8 | 8 | yes |
| Documents & Learning | 8 | 8 | yes |
| Finance | 8 | 8 | yes |
| Identity & Access | 6 | 6 | yes |
| Institution Management | 6 | 6 | yes |
| Operations | 10 | **7** | **no** |
| People | 7 | 7 | yes |
| Platform Administration | 10 | **8** | **no** |
| Reporting & Analytics | 8 | 8 | yes |

Eight of ten agree. The term used is "Consumer" in all ten; **no specification ever uses
"handler"**, and none defines a consumer.

### 8.2 Direction of the consumer is not stated

Names are ambiguous as to which domain owns the component:

- `Academic Management Engineering.md:1431-1448` lists `PeopleConsumer`, `FinanceConsumer` inside
  the **Academic** specification. These consume *People* and *Finance* events.
- `Finance Engineering.md:1411-1420` lists `AcademicManagementConsumer`, `PeopleConsumer`,
  `ProgressionConsumer` inside the **Finance** specification. These consume *Academic* events.

`PeopleConsumer` therefore names two different components in two different specifications, and
nothing in either document says whether "XConsumer" means "a consumer that lives in the domain
that owns X" or "a consumer of X's events". Counting consumers per domain is therefore ambiguous in
principle, not merely in practice.

### 8.3 The same logical component is counted in up to eight specifications

| Consumer name | Appears in |
|---|---|
| `AuditLogConsumer` | Academic, D&L, Finance, Identity, Institution, People, Platform, Reporting — **8** |
| `NotificationConsumer` | Academic, D&L, Finance, Institution, People, Reporting — **6** |
| `PolicyConsumer` | Academic, D&L — 2 |
| `CleanupConsumer` | Identity, People — 2 |

If a "consumer" is a code unit, one class is counted eight times across the project. If it is a
per-domain subscription, they are eight distinct things. The documents support both readings and
choose neither.

### 8.4 Inbound consumers are counted as the domain's own Phase 5 artifacts

`Communication Engineering.md:2190-2202` counts 8 consumers as Communication's Phase 5 output, yet
5 of the 8 (`UserCreatedConsumer`, `PasswordResetConsumer`, `StudentEnrolledConsumer`,
`StaffHiredConsumer`, `AcademicEventConsumer`, `FinanceEventConsumer`, `InstitutionEventConsumer`)
subscribe to events published by *other* domains. Meanwhile
`engineering/00 README.md:34` states Communication "owns no entity data". A count of "event
consumers" therefore mixes domain-owned processors with inbound subscribers, in unknown proportion,
in every specification.

### 8.5 Main ambiguity

"Is one event consumer (a) a class in this domain, (b) a subscription to an external event,
(c) a handler, or (d) a logical responsibility — and are consumers shared across domains counted
once per project or once per domain?"

---

## 9. Test Counting

### 9.1 Category count

| Specification | P7 categories claim | Summary rows | Agrees? |
|---|---:|---:|---|
| Academic Management | 18 | 18 | yes |
| Communication | 18 | 18 | yes |
| Documents & Learning | 18 | 18 | yes |
| Finance | 18 | 18 | yes |
| Identity & Access | 15 | **14** | **no** |
| Institution Management | 14 | 14 | yes |
| Operations | 20 | 20 | yes |
| People | 15 | **18** | **no** |
| Platform Administration | 20 | **16** | **no** |
| Reporting & Analytics | 18 | 18 | yes |

### 9.2 Scenario count: summary number vs the sum of its own rows

| Specification | P7 claim | Stated Total row | **Sum of category rows** | Consistent? |
|---|---:|---:|---:|---|
| Academic Management | ~240+ | ~240+ | **243** | yes |
| Communication | ~215+ | ~215+ | **215** | yes — exact |
| Documents & Learning | ~285+ | ~285+ | **273** | **no — stated exceeds the rows by 12** |
| Finance | ~240 | ~240 | **239** | yes |
| Identity & Access | ~350+ | ~350+ | **126** | **no — stated exceeds the rows by 224** |
| Institution Management | ~280+ | ~280+ | **154** | **no — stated exceeds the rows by 126** |
| Operations | **~400+** | **~204+** | **204** | **no — two irreconcilable figures inside one specification** |
| People | **~310+** | **~330+** | **172** | **no — three figures: 310+, 330+, 172** |
| Platform Administration | ~192 | **192** | **202** | **no — stated is 10 *below* its own rows** |
| Reporting & Analytics | ~226+ | ~226+ | **236** | **no — stated is below the rows, so `+` cannot cover it** |

Only Communication is internally consistent, and only because its stated total happens to equal the
exact sum. Every other specification states a `~`/`+` hedged figure for a set that is exactly
summable — Finance's 239 is written `~240`, Platform's 202 is written `192`.

### 9.3 Platform counts scenarios three incompatible ways inside one table

`Platform Administration Engineering.md:3576-3592` breaks each scenario down by test type:

| Column | Total row |
|---|---:|
| Scenarios | 192 |
| Unit | 98 |
| Integration | 43 |
| Validation | 29 |
| Concurrency | 13 |
| Authorization | 15 |

The `Scenarios` column sums to **202**, the `Total` cell says **192**, and the type columns sum to
**198**. A single scenario evidently belongs to a type column and to the Scenarios column, so the
type breakdown cannot be a partition of the scenario count. Three numbers, one table.

### 9.4 Only 2 of 10 specifications enumerate scenarios as countable rows

| Specification | Distinct `TC-<AREA>-<NNN>` ids | Stated scenarios | Ratio |
|---|---:|---:|---:|
| Communication | **132** | 215 | 0.61 |
| Operations | **72** | 204 | 0.35 |
| Academic Management | 0 (8 `TI-00n` tenant-isolation checks only) | ~240+ | — |
| Documents & Learning | 0 | ~285+ | — |
| Finance | 0 | ~240 | — |
| Identity & Access | 0 | ~350+ | — |
| Institution Management | 0 | ~280+ | — |
| People | 0 | ~310+ | — |
| Platform Administration | 0 | ~192 | — |
| Reporting & Analytics | 0 | ~226+ | — |

In the eight specifications with no ID-bearing scenarios, the scenario count is an unsourced number
in a table cell with no rows behind it. In the two that do enumerate scenarios, the enumeration is
itself incomplete (61% and 35% of the stated figure), and in Operations only 6 of the 20 claimed
categories have a detail section at all (§11.2–§11.7 versus 20 rows in §11.1).

### 9.5 Main ambiguity

"Is one test scenario (a) a row in the category summary, (b) a `TC-` id in a detail section,
(c) a test case, or (d) a test-type cell — and is a 'category' a row, a §11.x section, or a
bounded context?"

---

## 10. Index and Constraint Counting

### 10.1 Index claims against every available enumeration

| Specification | P3 indexes claim | §7.4 rows | `@@index(` in Prisma blocks | Enumeration exists? |
|---|---:|---:|---:|---|
| Academic Management | 50+ | 35 | n/a (no Prisma block) | partial |
| Communication | 45+ | 20 | **52** | partial |
| Documents & Learning | 55+ | **no §7.4 section** | n/a | **none** |
| Finance | 45+ | 26 | n/a | partial |
| Identity & Access | 43 | 19 | n/a | partial |
| Institution Management | 30+ | 21 | n/a | partial |
| Operations | 65+ | 14 (`### 7.4 Indexes (Key Performance Indexes)`) | **29** | **declared partial** |
| People | 40+ | 27 | n/a | partial |
| Platform Administration | 70+ | **no §7.4 section** | **100** | **none** |
| Reporting & Analytics | 50+ | **no §7.4 section** | n/a | **none** |

In **every** specification the enumerated index count is below the claimed count. Three
specifications claim 55+, 70+ and 50+ indexes with **no index section at all**. Operations is the
only one that says so — its heading reads "(Key Performance Indexes)".

Where Prisma blocks exist they give a third, machine-countable figure that agrees with neither the
claim nor the table: Communication 52 (claim 45+, table 20); Operations 29 (claim 65+, table 14);
Platform 100 (claim 70+, no table).

### 10.2 Unique constraints

| Specification | P3 unique constraints claim | §7.3/§7.5 `UNIQUE` rows | `@@unique(` in Prisma blocks | Agrees? |
|---|---:|---:|---:|---|
| Academic Management | 20 | **27** | n/a | no |
| Communication | 25 | **10** | **11** | no |
| Documents & Learning | 30 | **18** | n/a | no |
| Finance | 25 | **16** | n/a | no |
| Identity & Access | 16 | **11** | n/a | no |
| Institution Management | 12 | **12** | n/a | **yes** |
| Operations | 35 | **10** | **10** | no |
| People | 15 | **19** | n/a | no |
| Platform Administration | 40 | **no §7.3 section** | **14** | no |
| Reporting & Analytics | 25 | **15** | n/a | no |

One specification of ten agrees. Four of the ten constraint tables produce a *third* number if
counted by rows instead of by type:

- `Documents & Learning Engineering.md:1415-1463` — 35 rows, of which only **18** are `UNIQUE`; the other 16 are enum-value rows (`DRAFT, PUBLISHED, ARCHIVED`, etc.).
- `Reporting & Analytics Engineering.md:1370-1421` — 38 rows, of which only **15** are `UNIQUE`; 22 are enum-value rows.
- `Operations Engineering.md:1359-1370` — 10 rows, of which 8 are `UNIQUE` and 2 are `UNIQUE (partial, …)`.
- `Academic Management Engineering.md:1204` — 27 rows, all `UNIQUE`.

### 10.3 An index is not an indexed field, and a unique constraint is not a unique field

`Institution Management Engineering.md:759` lists
`academic_sessions | idx_sessions_active | (institution_id, is_active) | Active session lookup`
as **one** row. That single index covers **two** columns. The same table lists
`idx_sessions_institution` on `(institution_id)` separately. So within one table, "index" is
sometimes one column and sometimes two, and nothing marks which.

The same ambiguity applies to unique constraints: `Academic Management Engineering.md:1220` gives
`timetables | UNIQUE | (tenant_id, institution_id, class_id, term_id)` — one compound constraint
over four columns, counted as one.

### 10.4 A fourth kind of unique constraint appears without a label

`Operations Engineering.md:1361-1370` includes `UNIQUE (partial, isbn not null)` and
`UNIQUE (partial, status=ACTIVE)`. These are *partial* (filtered) unique indexes, a distinct
PostgreSQL object type from a table-level unique constraint, counted in the same column with no
distinguishing label.

### 10.5 Main ambiguity

"Is one index (a) a `CREATE INDEX` statement, (b) an `@@index` declaration, (c) a row in a design
table, (d) an indexed column, or (e) a keyset — and is one unique constraint (a) a `UNIQUE`
constraint, (b) an `@@unique`, (c) a unique *field*, (d) a compound unique, or (e) a partial unique
index?"

---

## 11. Cross-Spec Comparison

| Category | Specifications with explicit definition | Different counting units found | Main ambiguity |
|---|---:|---:|---|
| Module | 0 | 5 | NestJS class, root/composition root, submodule, module directory (11 dirs vs 18 classes), API area |
| Model / table | 0 | 5 | database table, Prisma `model`, §7.1 row, ER-diagram table, prose "named + unquantified remainder" |
| Repository | 0 | 4 | interface, concrete provider, one-per-table, one-per-module, one-per-aggregate |
| Domain service | 0 | 3 | class, §9.3 row, §9.3 detail subsection, orchestration vs read-model projector |
| Controller | 0 | 3 | controller class, controller row, route prefix, concrete endpoint path |
| Endpoint | 0 | 5 | method+path row, route template, controller, resource, resource group; plus an unreproducible primary/sub-resource split and 8 method+path pairs claimed by 2–3 specifications (§7.1a) |
| Event consumer | 0 | 4 | class, subscription, inbound vs domain-owned, shared cross-domain component |
| Test scenario / category | 0 | 4 | summary-row number, `TC-` id row, test case, test-type cell; category = row, section or bounded context |
| Index | 0 | 5 | `CREATE INDEX`, `@@index`, design-table row, indexed column, keyset; 3 specs have no index section at all |
| Unique constraint | 0 | 5 | `UNIQUE` constraint, `@@unique`, unique field, compound unique, partial unique index; 1 spec has no constraint section |

**Every category has zero definitions and three or more incompatible units.** No category is
currently governed by a single unit anywhere in the project.

---

## 12. Known Contradictions

All figures below were read directly from the specifications during this investigation. Row counts
are the number of data rows in the named table; sums are the arithmetic sum of the stated
per-row scenario numbers.

### 12.1 Finance — modules: 14 vs 16

| Location | Figure |
|---|---|
| `Finance Engineering.md:255` (§4.1 item 1) | "§4 summary claims 14 modules; §9.1 defines 16 — Unresolved" |
| `Finance Engineering.md:219` (Phase 5 row) | "16 modules defined in 9.1"; the superseded claim was "14 modules, 14 repositories, 14 domain services, 14 controllers, 8 event consumers" |
| `Finance Engineering.md:1313-1328` (§9.1) | **16 rows**, including `FinanceModule` (root) |
| `Finance Engineering.md:1373-1386` (§9.4) | **14 controller rows** |

The superseded claim used **14 for four different categories simultaneously** (modules,
repositories, domain services, controllers). 14 matches only the controller count. The actual
enumerations are 16 modules, 11 repositories, 16 services, 14 controllers, 7 guards, 8 consumers —
so the uniform "14" corresponds to nothing except one category and appears to be a template
placeholder rather than a derived count.

### 12.2 Finance — tables: 32 vs 30

| Location | Figure |
|---|---|
| `Finance Engineering.md:217` (Phase 3 row) | status claim of 32 tables; explicitly notes "§7.1 separately catalogues **30** tables … 32 is **not** the canonical §7.1 table count" |
| `Finance Engineering.md:794-825` (§7.1) | **30 rows** |
| `Finance Engineering.md:1286` (§8 Models) | "32 models: " + 30 named + "and supporting lookup tables" — remainder unquantified |

### 12.3 Documents & Learning — tables: 33 vs 34

| Location | Figure |
|---|---|
| `Documents & Learning Engineering.md:193` (P3 row) | **33 tables** |
| `Documents & Learning Engineering.md:194` (P4 row) | **34 models** |
| `Documents & Learning Engineering.md:729-764` (§7.1) | **34 rows** |
| `Documents & Learning Engineering.md:1466` (§8.2 heading) | "34 Prisma models:" |
| `Documents & Learning Engineering.md:1468-1500` (§8.2 list) | numbered list ends at **33** (`RetentionPolicy`) |
| `Documents & Learning Engineering.md:1504` (Pass 1) | "All **34** tables have corresponding Prisma models" |
| `Documents & Learning Engineering.md:1517-1531` (§9.1) | **15 module rows** (P5 claims 13) |
| `Documents & Learning Engineering.md:1537-1567` (§9.2) | **31 repository rows** (P5 claims 13) |
| `Documents & Learning Engineering.md:1573-1591` (§9.3) | **17 service rows** (P5 claims 13) |
| — | **no controller section exists** (P5 claims 13 controllers) |

### 12.4 Finance — indexes: 45+ vs 26

| Location | Figure |
|---|---|
| `Finance Engineering.md:217` (P3 row) | 45+ indexes |
| `Finance Engineering.md:1227-1258` (§7.4) | **26 rows** |
| `Finance Engineering.md:1284-1307` (§8) | prose model list only — no `@@index` declarations exist to cross-check |

The `+` hedge is doing the work of an unstated "this list is not exhaustive".

### 12.5 Finance — endpoints: 100+ vs 98, and resource groups 18 vs 16

| Location | Figure |
|---|---|
| `Finance Engineering.md:220` (P6 row) | 100+ endpoints; "65 primary + 35 sub-resource"; "**98** endpoints … across **18** resource groups" |
| `Finance Engineering.md:1520-1700` (§10.3) | **98 method+path rows** |
| `Finance Engineering.md:1516-1692` (§10.3 group headings) | **16 `####` resource-group headings** |

The 98 figure is confirmed exactly. The **18 resource groups is not** — §10.3 has 16. This is a
discrepancy introduced by the 1.5.0 status-correction revision itself, and it is not recorded in
`§4.1`. The `65 + 35` split remains unverifiable: §10.3 has 50 parameterless and 48 parameterised
routes, matching neither figure.

### 12.6 People — endpoints: 58 vs 77

| Location | Figure |
|---|---|
| `People Engineering.md:255` (P6 row) | "58 endpoints (38 primary + 20 sub-resource)" |
| `People Engineering.md:1244-1408` (§10.3) | **77 method+path rows** across **18** `####` resource groups |
| — | parameterless routes: **6**; parameterised: **71** — the 38/20 split is not reproducible |

### 12.7 Operations — models ~18 vs "48 total", and four endpoint figures

| Location | Figure |
|---|---|
| `Operations Engineering.md:189` (P4 row) | "~18 models (**remainder abbreviated**)" |
| `Operations Engineering.md:1551` (§8.2 heading) | "Models (**Key Models — 48 total**)" |
| `Operations Engineering.md:1554+` | **17** `model X {` blocks |
| `Operations Engineering.md:188` (P3 row) | **55 tables**; §7.1 has **55 rows** |
| `Operations Engineering.md:191` (P6 row) | "120+ endpoints (80 primary + 40 sub-resource)" |
| `Operations Engineering.md:2168-2196` (§10.1) | group rows sum to **123**; `Total` cell says **~121** |
| `Operations Engineering.md:2198-2359` (§10.2–§10.10) | **117** method+path rows |
| `Operations Engineering.md:192` (P7 row) | "20 test categories, **~400+** test scenarios" |
| `Operations Engineering.md:2407-2428` (§11.1) | 20 category rows summing to exactly **204**; `Total` cell says **~204+** |

The P4 revision note at `Operations Engineering.md:2632` records the change as "Correct … Phase 4
model count (~18 shown, remainder abbreviated)" — i.e. the figure was replaced by *the number of
models actually displayed*, and the "48 total" in the section heading was left in place. The
section heading is therefore the only surviving statement of the intended total, and it is
contradicted by the P3 figure of 55 tables.

### 12.8 Identity — test scenarios 126 vs ~350+

| Location | Figure |
|---|---|
| `Identity & Access Engineering.md:172` (P7 row) | "**15** test categories, **~350+** test scenarios" |
| `Identity & Access Engineering.md:1069-1085` (§11.2) | **14** category rows; the 14 scenario values sum to exactly **126** |
| `Identity & Access Engineering.md:1085` | `Total` cell says **~350+** |
| `engineering/ROADMAP.md:109` | "Testing & Verification complete (14 sections, pending approval)" |

126 is exact and verifiable; ~350+ is 2.8× larger and appears in both the P7 row and the table's own
Total cell. The category count is 15 claimed vs 14 listed. Notably, the ROADMAP records **14
sections** for this phase, matching the row count rather than the claim.

### 12.9 Contradictions newly identified by this investigation

These were not in the earlier audits and are recorded here for the first time.

| # | Specification | Contradiction | Claim | Enumeration |
|---|---|---|---:|---:|
| a | Communication | P6 endpoints vs §10.2–§10.15 | 79 | **85** |
| b | Platform Administration | P6 endpoints vs §10.2–§10.16 | 137 | **142** |
| c | Platform Administration | P4 models vs `model` blocks vs §7.1 | ~48 | **55** / 62 tables |
| d | Platform Administration | P7 scenarios: Scenarios column vs Total cell vs type columns | 192 | **202** / 198 |
| e | Platform Administration | P7 categories | 20 | **16** |
| f | Platform Administration | Phase 5 repositories: claim / §9.1 column / §9.2 rows | 15 | **40** / **44** |
| g | Platform Administration | Phase 5 services: claim / §9.1 column / §9.3 subsections | 15 | **18** / **60** |
| h | Platform Administration | Phase 5 consumers | 10 | **8** |
| i | Platform Administration | no §7.3 Constraints and no §7.4 Indexes section, yet claims 40 unique constraints and 70+ indexes | 40 / 70+ | **absent** (14 `@@unique`, 100 `@@index` in Prisma blocks) |
| j | Operations | Phase 5 modules / repositories / services / controllers | 16 / 16 / 16 / 16 | **11 / 38 / 24 / 26** |
| k | Operations | Phase 5 consumers | 10 | **7** |
| l | Operations | P7 scenarios, §4 row vs §11.1 Total | ~400+ | **~204+** |
| m | Institution Management | Phase 5 modules / repositories / services | 8 / 12 / 8 | **11 / 15 / 11** |
| n | Institution Management | no controller count claimed, but §9.4 enumerates 10 | — | **10** |
| o | Institution Management | P6 endpoints vs §15.3 | 52 | **65** |
| p | Institution Management | P3 indexes vs §7.4 | 30+ | **21** |
| q | Institution Management | P7 scenarios vs §16.2 sum | ~280+ | **154** |
| r | Reporting & Analytics | Phase 5 modules / repositories / services | 14 / 13 / 13 | **13 / 22 / 16** |
| s | Reporting & Analytics | claims 13 controllers, no controller section exists | 13 | **absent** |
| t | Reporting & Analytics | P7 scenarios: claim/Total vs sum | ~226+ | **236** |
| u | Reporting & Analytics | no §7.4 Indexes section, yet claims 50+ indexes | 50+ | **absent** |
| v | Academic Management | P3 tables vs §7.1 rows | 35 | **31** |
| w | Academic Management | P3 indexes vs §7.4 rows | 50+ | **35** |
| x | Academic Management | P3 unique constraints vs §7.3 rows | 20 | **27** |
| y | Academic Management | Phase 5 repositories vs §9.2 rows | 15 | **14** |
| z | Academic Management | P6 endpoints vs §10.3 rows | 110+ | **109** |
| aa | Documents & Learning | §8.2 heading "34 Prisma models" vs numbered list | 34 | **33 items** |
| bb | Documents & Learning | P7 scenarios: claim/Total vs sum | ~285+ | **273** |
| cc | Finance | Phase 6 row claims 18 resource groups; §10.3 has 16 `####` headings | 18 | **16** |
| dd | People | P7 categories vs §11.2 rows | 15 | **18** |
| ee | People | P7 scenarios: §4 row / §11.2 Total cell / sum | ~310+ / ~330+ | **172** |
| ff | Identity | P6 endpoints vs §10.3 rows | 61 | **66** |
| gg | Identity | P7 categories vs §11.2 rows | 15 | **14** |
| hh | Documents & Learning | P6 endpoints vs §10.3 rows | 120 | **127** |
| ii | Documents & Learning | P3 unique constraints vs §7.3 `UNIQUE` rows | 30 | **18** |
| jj | Reporting & Analytics | P3 unique constraints vs §7.3 `UNIQUE` rows | 25 | **15** |
| kk | Communication | P3 unique constraints vs §7.5 rows | 25 | **10** |
| ll | Communication | P3 indexes vs §7.4 rows / `@@index(` | 45+ | **20 / 52** |
| mm | Operations | P3 indexes vs §7.4 "Key Performance Indexes" rows / `@@index(` | 65+ | **14 / 29** |
| nn | Operations | P3 unique constraints vs §7.5 rows | 35 | **10** |
| oo | Finance | P3 unique constraints vs §7.3 rows | 25 | **16** |
| pp | Identity | P3 indexes / unique constraints vs §7.4 / §7.3 | 43 / 16 | **19 / 11** |
| qq | People | P3 indexes / unique constraints vs §7.4 / §7.3 | 40+ / 15 | **27 / 19** |
| rr | Academic Management | P6 endpoints vs §10.3 rows | 110+ | **109** |

---

## 13. Root-Cause Classification

Each discrepancy is classified as **counting-unit difference**, **documentation inconsistency**,
**genuine missing/extra artifact**, **mixed**, or **unable to determine**.

| Discrepancy | Classification | Reasoning |
|---|---|---|
| Finance 14 vs 16 modules | **mixed** — counting-unit + documentation | 16 rows exist. 14 matches only the controller count and was applied uniformly to four categories, so it is a placeholder, not a unit choice. The remaining ambiguity is whether the root `FinanceModule` counts. |
| Finance 32 vs 30 tables | **mixed** — documentation + counting-unit | §7.1 has 30 rows; the P3 row says 32. The 32 is produced by a prose list of 30 named models plus an **unquantified** "supporting lookup tables" remainder — so it is not a row count. Whether join/lookup tables count is a live unit question. |
| Finance 45+ vs 26 indexes | **counting-unit difference** | §7.4 is a design list; `45+` asserts more than the list contains. No `@@index` declarations exist in Finance to arbitrate. The `+` is the tell. |
| Finance 100+ vs 98 endpoints | **documentation inconsistency** | 98 rows exist and are exact. The claim of 100+ is simply higher. The unverifiable 65/35 split is a separate **counting-unit** problem layered on top. |
| Finance 18 vs 16 resource groups | **documentation inconsistency** | §10.3 has 16 `####` headings. The figure 18 has no derivation at all. |
| People 58 vs 77 endpoints | **counting-unit difference** | 77 rows exist; the 38+20 split is not reproducible from the tables by any path-shape rule. The gap is a decomposition asserted without a definition. |
| D&L 33 vs 34 tables | **documentation inconsistency** + **unable to determine** (which side is wrong) | Four locations say 34, two say 33. The numbered model list has 33 items while §7.1 has 34 rows, so one table has no model or one model has no table — the evidence does not identify which. |
| Operations ~18 vs "48 total" | **documentation inconsistency** | The 1.1 revision replaced the count with the number of models displayed. The heading's "48 total" was left untouched and is contradicted by the P3 figure of 55 tables. The intended total cannot be recovered. |
| Operations 4 endpoint figures (120+ / ~121 / 123 / 117) | **documentation inconsistency** | All four are internally recorded in one specification; no two agree. Not a unit problem — an arithmetic/synchronisation problem. |
| Identity 126 vs ~350+ | **documentation inconsistency** | 126 is the exact sum of the 14 rows. `~350+` appears in both the P7 row and the table's own Total cell with no derivation. The category count 15 vs 14 matches the ROADMAP's 14 sections, suggesting 15 is the error. |
| Communication 79 vs 85 | **documentation inconsistency** | The §10.1 summary sums to exactly 79 and the P6 row says 79; the 85 detail rows were never reconciled. |
| Platform 137 vs 142 | **documentation inconsistency** | The §10.1 summary sums to exactly 137 and the P6 row says 137; the 142 detail rows were never reconciled. |
| Platform ~48 vs 55 models vs 62 tables | **documentation inconsistency** | 55 `model` blocks are countable and exact. `~48` matches neither 55 nor 62. |
| Platform P7 192 / 202 / 198 | **counting-unit difference** + documentation | The type columns cannot be a partition of the Scenarios column (198 vs 202), so "scenario" is being counted on two incompatible bases inside one table. |
| Platform Phase 5 repositories 15 / 40 / 44 | **counting-unit difference** | Three enumerations of the same category at three granularities inside one phase. |
| Platform Phase 5 services 15 / 18 / 60 | **counting-unit difference** | §9.1 counts services per module; §9.3 counts one subsection per service class. |
| Operations Phase 5 16/16/16/16 vs 11/38/24/26 | **mixed** | Every category is wrong, and the four identical figures match neither the aggregates (14) nor the enumerations. Consistent with a copied placeholder plus no synchronisation with §9. |
| Institution Phase 5 8/12/8 vs 11/15/11 | **mixed** | §9.1/§9.2/§9.3 are internally coherent (11 modules, 15 repositories = 15 tables, 11 services); the Phase 5 row matches none of them. |
| D&L Phase 5 13/13/13/13 vs 15/31/17/none | **counting-unit difference** + documentation | The four 13s equal the specification's own Phase 2 aggregate count, so they were not derived from §9 at all. |
| Reporting Phase 5 14/13/13/13 vs 13/22/16/none | **counting-unit difference** + documentation | As D&L: the three 13s equal the aggregate count; a controller count is claimed with no section. |
| Academic Phase 5 15 repositories vs 14 | **counting-unit difference** | 14 = 15 modules − root module. The root module has no repository, so the claim counted modules while calling them repositories. |
| Index counts in **all 10** specifications | **counting-unit difference** | In every specification the enumerated list is smaller than the claim, and in three there is no index list at all. The `+` and `(Key Performance Indexes)` are the only signals of non-exhaustiveness. |
| Unique-constraint counts in 9 of 10 | **counting-unit difference** + documentation | Only Institution agrees. D&L and Reporting constraint tables mix `UNIQUE` rows with enum-value rows, so a row count is not a constraint count. Operations mixes full and partial unique indexes in one column. |
| Consumer counts (Operations 10/7, Platform 10/8) | **documentation inconsistency** | Enumerations are exact; the claims are higher. |
| `resource group` = 9, 11, 14, 15, 16, 18 or 27 | **counting-unit difference** | Three different realisations of one term across the set. |
| "primary / sub-resource" splits (6 specifications) | **counting-unit difference** | Declared six times, defined zero times, reproducible zero times. |
| Test scenario totals in 8 of 10 | **counting-unit difference** + documentation | Scenario counts are unsourced numbers in 8 specifications; in 2 they are ID-bearing rows that are themselves incomplete (61%, 35%). |
| Stated scenario totals that differ from their own row sums | **documentation inconsistency** | The rows are exactly summable, so a `~`/`+` hedge is being applied to a deterministic quantity. |

**Summary of causes:** the discrepancies are **not** primarily caused by missing or extra
artifacts. Only one case (D&L 33 vs 34) plausibly involves a genuinely missing artifact, and even
there the evidence does not identify which side is short. The dominant causes are
(a) summary figures never synchronised with their own detail sections, and (b) the same word used
with different units in different specifications, or even within one.

---

## 14. Dependencies on D-1

D-1 concluded that Models A–E cannot be distinguished from existing evidence. D-2 sharpens that:
**two of the five D-1 models cannot even be stated without D-2**, and the remaining three are
affected in different ways.

| D-1 model | Relationship to D-2 |
|---|---|
| **A — Summary-first** | **Requires D-2 first, unconditionally.** Under A the §4 figure is the requirement. §4 currently contains figures contradicted by their own detail sections in at least 40 places (§12.9). Adopting A without D-2 would make demonstrably wrong numbers authoritative. D-2 defines what A is authoritative *about*. |
| **B — Detail-first** | **Requires D-2 first.** Under B the detail section governs. But "detail" is not singular: Platform has three repository enumerations, and §9.1/§9.2/§9.3/§9.4 are all detail. B additionally requires D-2 to decide whether a detail enumeration is exhaustive — Operations declares its index list partial, and 8 specifications have no scenario enumeration at all. Without D-2, B cannot say *which* detail wins. |
| **C — Typed authority** | **Blocked by D-2 in a way D-1 did not surface.** Typed ID families exist for requirements (`V-`, `BR-`, `TC-`, `INV-`, `POL-`, `CP-`, `VRS-`) in 5 of 10 specifications. **No typed ID family exists for any countable category** — there is no `MOD-`, `TBL-`, `EP-`, `REPO-`, `SRV-`, `IDX-` or `UC-` prefix anywhere. C cannot type a module, a table or an endpoint because those artifacts carry no identifier. D-2 must create the ID families before C can be applied to counting. |
| **D — Explicit authority markers** | **Requires D-2 to know what a marker attaches to.** A marker such as "authoritative" must be attached to a unit. With five live readings of "module" and five of "endpoint" (§11), D would place markers on rows whose unit is undefined, producing markers that are precise about authority and silent about scope. |
| **E — Per-conflict adjudication** | **The only model that does not strictly require D-2.** Each conflict is judged on its own facts, so the unit question can be settled case-by-case. E is the only model that can close the "unable to determine" rows in §13 without a convention — at the cost of producing no project-wide rule, and therefore no protection against the next conflict. |

### 14.1 Mutual blocking

D-1 and D-2 are **mutually blocking for Models B, C and D**: B needs D-2 to know which detail
enumeration governs, and D-2 needs D-1 to know whether the §4 summary or the detail section is the
figure being defined. This is the same circularity D-1 recorded at §7.3, now shown to be concrete
rather than hypothetical.

### 14.2 Downstream effects

- **D-3** (self-contradictory detail) inherits D-2 directly: Operations' §8.2 heading versus its
  Phase 4 row, and Identity's 126 versus ~350+, are only resolvable once it is settled which
  figure is a count and which is a narrative total.
- **D-4** (non-positional section identifiers) would let a rule say "§9.2 of *this* document"
  instead of "§9.2", but it does not define a unit and does not reduce D-2's scope.
- **D-9** (discrepancy-register location) is unaffected in substance: a register is needed
  regardless, and §12.9 substantially enlarges the set of entries it would need to hold.
- **D-5, D-6, D-7, D-8, D-10** remain on separate axes and are not pre-empted by D-2.

---

## 15. Decision Options

Presented neutrally. **No option is selected.**

**Option 1 — One universal definition per category, project-wide.**
Write one definition for each of the 9 categories into `engineering/00 README.md`, and require every
§4 figure to be computed from it. *Consequence:* would require re-deriving or removing roughly 40
existing figures, and would need a rule for the three categories whose enumerations do not exist
(§12.9 i, s, u).

**Option 2 — Per-category definitions that differ from one another.**
Accept that "endpoint" means a method+path row, "index" means an `@@index` declaration or a design
row, "repository" means a repository *interface*, "test scenario" means a `TC-` id, and so on — each
defined on its own terms. *Consequence:* the words stop being interchangeable, which is the actual
defect; but the resulting definitions are not uniform, and three categories have no enumeration to
apply a definition to.

**Option 3 — Derive-from-enumeration rule.**
Do not define units in the abstract. Instead require every §4 figure to name the section it is
counted from, and to equal the number of data rows in that section. *Consequence:* mechanically
checkable and would have caught most of §12.9; but it fails for the categories whose sections are
declared partial (Operations indexes), whose figures are not row counts (all `~`/`+` scenario
totals, Finance's 32 models), or whose sections are absent (3 specifications claim indexes with no
index section).

**Option 4 — Mark figures as exhaustive or illustrative and stop counting where neither is possible.**
Keep the numbers but tag each one, and remove any figure that cannot be tagged. *Consequence:*
lowest disruption and immediately honest; produces fewer numbers, not a convention.

**Option 5 — Per-specification legacy preservation.**
Accept that each specification counts on its own terms and forbid cross-specification comparison.
*Consequence:* makes the ten specifications mutually incomparable and leaves all §12.9
contradictions in place inside each document.

**Option 6 — Hybrid: strict rule where an enumeration is machine-countable, no count elsewhere.**
Apply Option 3 to categories with a countable enumeration (endpoints, modules, repositories,
controllers, consumers, test categories) and apply Option 4 to the rest (indexes, unique
constraints, test scenarios). *Consequence:* matches the evidence — the first group is exactly
where row counts were verifiable, the second is exactly where every claim exceeded its own
enumeration.

**Option 7 — Adopt a typed-identifier scheme as the prerequisite (extends D-1 Model C).**
Before any counting rule, assign identifiers to countable artifacts so that a count has an
unambiguous referent. *Consequence:* resolves D-1 Model C's blocker; is the largest change and would
require reworking all 10 specifications.

### 15.1 Options that the evidence does not support

- **A single universal rule covering all 9 categories.** The evidence contradicts this directly:
  endpoint enumerations are exhaustive and machine-countable (zero duplicate rows within any of the
  10 catalogues, 988 rows total), while index and unique-constraint lists are demonstrably illustrative
  in every specification and absent in three. One rule cannot be simultaneously "count the rows" and
  "count the design intent".
- **Deriving the missing definitions retrospectively from the documents.** Every candidate reading
  was tested against the data and at least one specification contradicts it — the
  primary/sub-resource split in all six specifications that use it, the root-module convention in
  three, the repository granularity in three (§5.1).

---

## 16. Decision Requirements

To close D-2, the following must be decided. Each is stated as a question with no implied answer.

### 16.1 Unit definitions — one decision per category

| # | Category | What must be decided |
|---|---|---|
| 1 | module | NestJS module class, module directory, or functional area? Does the root/composition module count? |
| 2 | model / table | Database table, Prisma `model`, or §7.1 row? Are join, junction, lookup and "future"-marked tables counted? |
| 3 | repository | Interface, abstract class, or concrete provider? One per table, per module, or per aggregate? |
| 4 | domain service | Class or §9.3 row? Are workflow services and read-model projectors "domain services"? |
| 5 | controller | Class, §9.4 row, or route prefix? |
| 6 | endpoint | Method+path row, route template, controller, or resource? **What is a "primary" endpoint and what is a "sub-resource" endpoint?** Is a "resource group" a fixed unit, and if so at what level? |
| 7 | event consumer | Domain-owned class, inbound subscription, or handler? Are consumers shared across domains counted once per project or once per domain? |
| 8 | test scenario / category | Summary-cell number, `TC-` id row, or test case? Is a category a row, a §11.x section, or a bounded context? |
| 9 | index | `CREATE INDEX`, `@@index`, design-table row, or indexed column? Is a composite index one index or N? |
| 10 | unique constraint | `UNIQUE`, `@@unique`, unique field, compound unique, or partial unique index? |

### 16.2 Exhaustiveness

- Must every §4 figure name the section it is counted from?
- Are illustrative lists permitted, and if so must they be labelled as such in the section heading
  (as Operations does for indexes)?
- What happens to figures whose enumeration does not exist — the 3 specifications claiming indexes
  with no index section, the 3 claiming controllers with no controller section, and the 8
  specifications whose scenario counts have no ID-bearing rows?

### 16.3 Arithmetic and hedging policy

- Must a stated `Total` equal the sum of its own rows? (8 of 10 currently do not.)
- Are `~` and `+` permitted on a figure derived from an exactly summable set? (Finance's 239 is
  written `~240`.)
- May a summary figure exceed its own enumeration, and if so under what stated condition?
- Must the sub-decomposition of a total (primary + sub-resource, or by test type) be labelled in the
  table it describes?

### 16.4 Scope and precedence

- Does the decision apply retroactively to the 40+ discrepancies in §12.9, or only prospectively?
- Does D-1 (summary-first vs detail-first) need to be decided first, jointly, or can D-2 be decided
  as a pure definitional matter that D-1 then applies?
- Who adjudicates a category where the decision owner cannot reach a definition?

### 16.5 Owner

A named architecture/product owner is required. §13 shows at least 4 discrepancies that no amount
of further document analysis can resolve, because the documents contain no information bearing on
them.

---

## 17. Conclusion

**Existing evidence is not sufficient to establish a project-wide countable-unit convention.**

Three findings support this conclusion.

**First, nothing is defined.** 0 of 10 specifications define any countable unit. Neither does
`engineering/00 README.md`, `engineering/ROADMAP.md`, `MASTER_SMS_ROADMAP.md`, `docs/`, or
`architecture/`. The only self-defined convention in the set is a phase-**status** vocabulary in
Finance, and it says nothing about counting.

**Second, every category is already ambiguous, and the ambiguity is instantiated rather than
theoretical.** Each of the 9 categories shows 3–5 mutually incompatible units, and in every case
more than one reading is actually used by a real specification:

- Five readings of "module" (§3.2), including one specification that uses the word for two
  different things in two sections.
- Four readings of "repository", demonstrated by ratios to table count ranging from 0.37 to 1.00
  across the ten specifications (§5.1).
- Three readings of "domain service" inside Platform Administration alone: 15, 18, and 60 (§6.2).
- Three realisations of "resource group", yielding counts from 9 to 27 (§7.4).
- Five readings of "index", with three specifications claiming index counts and having no index
  section at all (§10.1).

**Third, the named discrepancies have at least four different causes, so no single fix resolves
them.** The Finance module gap is a placeholder; the Finance table gap is an unquantified prose
remainder; the index gaps are illustrative-versus-exhaustive lists; the Identity scenario gap is a
Total cell contradicting the rows beneath it; the Documents & Learning table gap may be a genuinely
missing artifact. A rule that fixed one would leave the others untouched.

### 17.1 Safe-stop

**Different categories demonstrably require different counting rules, so no single universal rule
is proposed.** This is not a judgement call; it follows from the structure of the evidence.
Endpoint catalogues are exhaustive, machine-countable, and duplicate-free *within each
specification* — 988 rows across 10 specifications, 0 repeated method+path pairs inside any one of
them — and 8 pairs collide only when the ten catalogues are pooled (§7.1a). Index and
unique-constraint lists are illustrative design selections, declared as such in one specification and
silently treated as complete in nine, and missing entirely in three. Test scenario figures are
unsourced numbers in 8 specifications and incomplete row enumerations in 2. A rule that fits the
first group miscounts the second.

**The evidence is also insufficient to choose between the viable conventions in §15.** Every
candidate rule was tested against the data:

- The primary/sub-resource split was tested in all six specifications that use it and is
  reproducible in **none** of them.
- The root-module convention is contradicted by three specifications that have no root module.
- The repository granularity is contradicted by three specifications each.
- The "count the rows" rule is contradicted by three specifications with no rows, one with rows
  explicitly declared partial, and 8 with figures that are not row counts at all.

**An architecture/product decision is required.** The decision must be taken per category, because
the evidence supports per-category decisions and does not support a universal one. §16 states the
exact questions; §15 states the viable options without selecting among them.

### 17.2 What was not done

Nothing was decided, adopted, or applied. No engineering specification was edited — including
Finance, whose §4.1 discrepancy register is unchanged. No count was corrected, chosen, or removed.
D-1 was not modified. No D-2/D-3 or other existing decision document was modified. No code, Prisma
schema, migration, API, UI, test or configuration file was modified. No status was changed.
Nothing was committed. No build, test, lint, Prisma or migration command was executed; all
verification was read-only inspection and arithmetic over document text.

---

## Appendix A — Evidence Index

### A.1 Definitional search (0 results)

Patterns searched across `engineering/`, `docs/`, `architecture/`, `MASTER_SMS_ROADMAP.md`:
`for the purposes of`, `by a module we`, `we define`, `we mean`, `we count`, `definition of`,
`is defined as`, `counting rule`, `counting unit`, `counting convention`, `counts as`,
`definitionally`, `an endpoint is`, `endpoint means`, `one endpoint`, `each endpoint`,
`resource group`, `primary endpoint`, `sub-resource endpoint`, `module is defined`,
`one module per`, `each module`, `composition root`.

Only relevant hit: `Reporting & Analytics Engineering.md:275` — a domain concept, not a counting
rule.

### A.2 Machine-countable measures

| Measure | Method | Result |
|---|---|---|
| Endpoint duplicates | method+path pair uniqueness within each catalogue | 988 rows, **0 duplicates in any single catalogue** |
| Endpoint duplicates (pooled) | method+path pair uniqueness across all 10 catalogues pooled | 976 distinct of 988 → **8 pairs claimed by 2–3 specifications**, all on `/api/v1/templates` (§7.1a) |
| Primary/sub-resource test | routes with vs without a path parameter | claimed split reproduced in **0 of 6** specifications |
| Prisma models | `^model \w+` | Communication 28, Operations 17, Platform 55; **0 in the other 7** |
| Prisma enums | `^enum \w+` | Communication 17, Operations 24, Platform 22 |
| Prisma indexes | `@@index(` | Communication 52, Operations 29, Platform 100 |
| Prisma unique | `@@unique(` | Communication 11, Operations 10, Platform 14 |
| SQL DDL | `CREATE TABLE` | **0 in all 10** |
| Test scenario ids | `\bTC-[A-Z]+-\d{3}\b` distinct | Communication 132, Operations 72; **0 in the other 8** |
| Constraint table types | `Type` column distribution | D&L 18 `UNIQUE` of 35 rows; Reporting 15 of 38; Operations 8 `UNIQUE` + 2 partial |

### A.3 Repository structure (supporting evidence only — not architecturally authoritative)

| Measure | Value |
|---|---|
| Module directories under `apps/api/src/modules` | 11 |
| `*.module.ts` files | 18 |
| Prisma domain files under `apps/api/prisma/domains` | 11 |

The 11-vs-18 divergence is recorded because "module" is already ambiguous on paper; it is **not**
treated as evidence of what any specification should count.

---

*End of D-2 decision material. Investigation only: no engineering specification edited, no counting
convention adopted, no discrepancy resolved, no count corrected, Finance unmodified, D-1 and D-3
untouched, no existing document modified, no code/Prisma/test/UI/configuration change. No category
assigned a counting unit. Nothing was committed.*
