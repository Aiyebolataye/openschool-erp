# OpenSchool ERP

## Documentation Dependency Map

---

| Field | Value |
|-------|-------|
| **Document** | Documentation Dependency Map |
| **Version** | 1.0 |
| **Status** | Approved |
| **Date** | July 2026 |
| **Classification** | Internal |
| **Author** | Architecture Team |
| **Owner** | Solution Architect |

---

| Aspect | Detail |
|--------|--------|
| **Purpose** | Complete reference of how every specification relates to every other specification in the repository |
| **Scope** | All 32 specification documents across 5 directories |
| **Authority** | Informational — derives from the stated Governing Documents fields of each specification |
| **Compliance** | Reference document; no compliance requirements |

---

## Table of Contents

1. [Repository Inventory](#1-repository-inventory)
2. [Authority Hierarchy](#2-authority-hierarchy)
3. [Dependency Map by Directory](#3-dependency-map-by-directory)
4. [Cross-Reference Matrix](#4-cross-reference-matrix)
5. [Dependency Graph](#5-dependency-graph)
6. [Orphan Detection](#6-orphan-detection)
7. [Circular Dependency Check](#7-circular-dependency-check)
8. [Staleness Risk Analysis](#8-staleness-risk-analysis)
9. [Gap Analysis](#9-gap-analysis)
10. [Maintenance Guide](#10-maintenance-guide)

---

## 1. Repository Inventory

### 1.1 Document Count by Directory

| Directory | Documents | Status Range |
|-----------|-----------|--------------|
| `governance/` | 1 | Approved |
| `architecture/` | 5 | Approved, Draft |
| `platform standards/` | 7 (6 individual + 1 consolidated) | Approved, Frozen |
| `engineering/` | 11 (10 domain specs + README) | Approved & Frozen |
| `ui-ux/` | 6 | Approved, Draft, Living |
| `Product Documentation/` | 6 (source material) | Reference |
| **Total** | **36** | |

### 1.2 Complete Document Registry

| ID | Short Name | Full Path | Status | Version |
|----|-----------|-----------|--------|---------|
| G1 | Documentation Constitution | `governance/Documentation Constitution.md` | Approved | 1.1 |
| A1 | System Architecture | `architecture/01 System Architecture.md` | Approved (Refined) | 1.0.0 |
| A2 | Database Architecture | `architecture/02 Database Architecture.md` | Draft | 1.0.0 |
| A3 | Implementation Roadmap | `architecture/03 Implementation Roadmap.md` | Draft | 1.0.0 |
| A4 | Architecture Freeze | `architecture/04 Architecture Freeze.md` | Approved | 1.0 |
| A5 | Implementation Playbook | `architecture/05 Implementation Playbook.md` | Approved | 1.0 |
| P1 | Engineering Standards | `platform standards/01 Engineering Standards.md` | Approved | 1.0.0 |
| P2 | Cross-Domain Integration | `platform standards/02 Cross-Domain Integration Specification.md` | Approved (Frozen) | 1.0.0 |
| P3 | Platform Event Catalogue | `platform standards/03 Platform Event Catalogue.md` | Approved (Frozen) | 1.0.0 |
| P4 | API Style Guide | `platform standards/04 API Style Guide.md` | Approved | 1.0.0 |
| P5 | Development Standards | `platform standards/05 Development Standards.md` | Approved | 1.0.0 |
| P6 | DevOps & Deployment Standards | `platform standards/06 DevOps & Deployment Standards.md` | Approved | 1.0.0 |
| P7 | Platform Standards (Consolidated) | `platform standards/PLATFORM STANDARDS - Consolidated.md` | Approved | 1.0.0 |
| E1 | Identity & Access | `engineering/Identity & Access Engineering.md` | Approved & Frozen | 1.0 |
| E2 | Institution Management | `engineering/Institution Management Engineering.md` | Approved & Frozen | 1.0 |
| E3 | People | `engineering/People Engineering.md` | Approved & Frozen | 1.0 |
| E4 | Academic Management | `engineering/Academic Management Engineering.md` | Approved & Frozen | 1.0 |
| E5 | Finance | `engineering/Finance Engineering.md` | Approved & Frozen | 1.0 |
| E6 | Communication | `engineering/Communication Engineering.md` | Approved & Frozen | 1.0 |
| E7 | Operations | `engineering/Operations Engineering.md` | Approved & Frozen | 1.0 |
| E8 | Documents & Learning | `engineering/Documents & Learning Engineering.md` | Approved & Frozen | 1.0 |
| E9 | Reporting & Analytics | `engineering/Reporting & Analytics Engineering.md` | Approved & Frozen | 1.0 |
| E10 | Platform Administration | `engineering/Platform Administration Engineering.md` | Approved & Frozen | 1.0 |
| U1 | UI Strategy & Design Direction | `ui-ux/01 UI Strategy & Design Direction.md` | Approved | 1.1 |
| U2 | Design System & Component Library | `ui-ux/02 Design System & Component Library.md` | Approved | 1.0 |
| U3 | Figma Standards & Design QA | `ui-ux/03 Figma Standards & Design QA.md` | Approved | 1.0 |
| U4 | Figma Build Roadmap | `ui-ux/Figma Build Roadmap.md` | Approved | 1.0 |
| U5 | Screen Blueprint Specification | `ui-ux/Screen Blueprint Specification.md` | Draft | 1.0 |
| U6 | UI Rendering Specification | `ui-ux/school-erp-ui-rendering-specification.md` | Living | Part 1 of N |

---

## 2. Authority Hierarchy

### 2.1 Governing Authority Levels

The Documentation Constitution defines the following authority hierarchy:

```
Level 1 (Highest)
  └── G1  Documentation Constitution
  
Level 2 (High)
  ├── A4  Architecture Freeze
  └── P1  Engineering Standards (platform-wide)
  
Level 3 (Medium)
  ├── A1  System Architecture
  ├── A2  Database Architecture
  ├── P2  Cross-Domain Integration
  ├── P3  Platform Event Catalogue
  ├── P4  API Style Guide
  ├── P5  Development Standards
  ├── P6  DevOps & Deployment Standards
  └── E1–E10  Engineering Specifications (10 domains)
  
Level 4 (Medium-Low)
  ├── U1  UI Strategy & Design Direction
  ├── U2  Design System & Component Library
  └── U6  UI Rendering Specification
  
Level 5 (Low — operational)
  ├── U3  Figma Standards & Design QA
  ├── U4  Figma Build Roadmap
  └── U5  Screen Blueprint Specification
  
Level 6 (Reference only)
  └── P7  Platform Standards (Consolidated) [mirror of P1–P6]
```

### 2.2 Authority Flow Rules

Per Documentation Constitution §6:
- Lower-level documents **must comply** with higher-level documents
- Higher-level documents **never derive** from lower-level documents
- Conflicts between documents at the same level are resolved by the Documentation Constitution
- All documents derive ultimate authority from the Documentation Constitution (G1)

---

## 3. Dependency Map by Directory

### 3.1 Governance (1 document)

#### G1 — Documentation Constitution
| Field | Documents |
|-------|-----------|
| **Governs** | ALL documents in the repository |
| **Depends on** | Nothing (root authority) |
| **References** | Product Documentation (source material), Architecture Freeze (§6.2 authority levels) |
| **Referenced by** | Every document in the repository |

---

### 3.2 Architecture (5 documents)

#### A1 — System Architecture
| Field | Documents |
|-------|-----------|
| **Governing Documents** | *(not explicitly declared — inherits from G1)* |
| **Derived From** | Engineering Specifications (E1–E10), Platform Standards (P1–P6) |
| **References** | P4 (API Style Guide), P5 (Development Standards), P6 (DevOps Standards), P3 (Event Catalogue) |
| **Referenced by** | U1, U2, A3, A4, A5, P7 |

#### A2 — Database Architecture
| Field | Documents |
|-------|-----------|
| **Governing Documents** | *(not explicitly declared — inherits from G1)* |
| **Derived From** | Engineering Specifications (E1–E10) |
| **References** | P4 (API Style Guide), P5 (Development Standards), P6 (DevOps Standards) |
| **Referenced by** | A4, A5, P7, G1 (via §7 compliance) |

#### A3 — Implementation Roadmap
| Field | Documents |
|-------|-----------|
| **Governing Documents** | *(not explicitly declared — inherits from G1)* |
| **Derived From** | Engineering Specifications (E1–E10), System Architecture (A1) |
| **References** | P4 (API Style Guide), P5 (Development Standards), P6 (DevOps Standards), P3 (Event Catalogue), A1 |
| **Referenced by** | A5, A4 |

#### A4 — Architecture Freeze
| Field | Documents |
|-------|-----------|
| **Governing Documents** | Engineering Specifications (E1–E10), Platform Standards (P1–P6), System Architecture (A1), Database Architecture (A2), Implementation Roadmap (A3) |
| **Derived From** | All of the above |
| **References** | E1–E10, P1–P6, A1, A2, A3 |
| **Referenced by** | A5, G1 |

#### A5 — Implementation Playbook
| Field | Documents |
|-------|-----------|
| **Governing Documents** | Engineering Specifications (E1–E10), Platform Standards (P1–P6), System Architecture (A1), Database Architecture (A2), Implementation Roadmap (A3), Architecture Freeze (A4) |
| **Derived From** | All of the above |
| **References** | A1, A2, A3, A4, P1, P3, P4, P5, P6, P2, E1–E10 |
| **Referenced by** | *(operational — referenced by developers during implementation)* |

---

### 3.3 Platform Standards (7 documents)

#### P1 — Engineering Standards
| Field | Documents |
|-------|-----------|
| **Authority** | Architecture baseline established from 10 approved domain specifications |
| **Governing Documents** | *(not explicitly declared — inherits from G1, A4)* |
| **Derived From** | E1–E10 |
| **References** | E1–E10 (for entity/event patterns) |
| **Referenced by** | P2, P3, P4, P5, P6, P7, A4, A5, U1, U2 |

#### P2 — Cross-Domain Integration Specification
| Field | Documents |
|-------|-----------|
| **Authority** | Derived from 10 approved V1 domain specifications and Engineering Standards |
| **Governing Standard** | P1 (Engineering Standards) |
| **Derived From** | E1–E10, P1 |
| **References** | P1, E1–E10 |
| **Referenced by** | P3, P7, A5 |

#### P3 — Platform Event Catalogue
| Field | Documents |
|-------|-----------|
| **Authority** | Derived from 10 approved V1 domain specifications |
| **Governing Standards** | P1 (Engineering Standards), P2 (Cross-Domain Integration) |
| **Derived From** | E1–E10, P1, P2 |
| **References** | P1, P2, E1–E10 |
| **Referenced by** | A1, A3, A5, P7 |

#### P4 — API Style Guide
| Field | Documents |
|-------|-----------|
| **Governing Documents** | *(not explicitly declared — inherits from G1, A4)* |
| **Derived From** | P1 (Engineering Standards for naming/entity/audit/validation), E1–E10 (for domain-specific API contracts) |
| **References** | P1, E1–E10 |
| **Referenced by** | A1, A2, A3, A5, P7 |

#### P5 — Development Standards
| Field | Documents |
|-------|-----------|
| **Governing Documents** | *(not explicitly declared — inherits from G1, A4)* |
| **Derived From** | P1 (Engineering Standards) |
| **References** | P1, E1–E10 (domain engineering specs define business rules; this guide governs code structure) |
| **Referenced by** | A1, A2, A3, A5, P7 |

#### P6 — DevOps & Deployment Standards
| Field | Documents |
|-------|-----------|
| **Governing Documents** | *(not explicitly declared — inherits from G1, A4)* |
| **Derived From** | P1 (Engineering Standards) |
| **References** | P1 |
| **Referenced by** | A1, A2, A3, A5, P7 |

#### P7 — Platform Standards (Consolidated)
| Field | Documents |
|-------|-----------|
| **Nature** | Mirror/concatenation of P1–P6 (not a separate specification) |
| **Contains** | P1 + P2 + P3 + P4 + P5 + P6 |
| **Note** | Single-file convenience copy; all authority resides in P1–P6 |

---

### 3.4 Engineering Specifications (10 domain specs)

All 10 engineering specifications share identical structural dependencies:

#### E1–E10 — All Domain Engineering Specs (Universal Dependencies)
| Field | Documents |
|-------|-----------|
| **Governing Documents** | P1 (Engineering Standards) — all follow its naming, entity, audit, validation, and error standards |
| **Derived From** | Product Documentation (source material: `01 Product Foundation.txt` through `05 Workspace Catalogue.txt`) |
| **References** | P1 (standards compliance), P2 (cross-domain integration for their domain), P3 (events they publish) |
| **Referenced By** | A1, A2, A3, A4, P1, P2, P3, P4, P5, U1, U2 |

#### Domain-Specific Cross-Dependencies

```
E1  Identity & Access        ← (consumed by all domains for auth)
E2  Institution Management   ← (consumed by all domains for tenant scoping)
E3  People                   ← E4 (Academic), E5 (Finance), E6 (Communication)
E4  Academic Management      ← E5 (Finance), E7 (Operations)
E5  Finance                  ← (standalone; publishes events for others)
E6  Communication            ← (consumed by all; owns no entity data)
E7  Operations               ← E4 (Academic), E8 (Documents & Learning)
E8  Documents & Learning     ← E7 (Operations)
E9  Reporting & Analytics    ← (reads from all domains)
E10 Platform Administration  ← (manages the platform itself)
```

---

### 3.5 UI/UX (6 documents)

#### U1 — UI Strategy & Design Direction
| Field | Documents |
|-------|-----------|
| **Governing Documents** | G1 (Documentation Constitution), A1 (System Architecture), E1–E10 (Engineering Specifications) |
| **Derived From** | E1–E10, P1–P6, A1 |
| **References** | G1, A1, E1–E10 |
| **Referenced by** | U2, U3, U4, U5, U6 |

#### U2 — Design System & Component Library
| Field | Documents |
|-------|-----------|
| **Governing Documents** | G1 (Documentation Constitution), U1 (UI Strategy & Design Direction) |
| **Derived From** | U1, A1, E1–E10 |
| **References** | G1, U1, A1, E1–E10 |
| **Referenced by** | U3, U4, U5, U6 |

#### U3 — Figma Standards & Design QA
| Field | Documents |
|-------|-----------|
| **Governing Documents** | G1 (Documentation Constitution), U2 (Design System), U1 (UI Strategy) |
| **Derived From** | U2, U1, E1–E10, P1–P6 |
| **References** | G1, U1, U2, P1–P6, E1–E10 |
| **Referenced by** | U4 |

#### U4 — Figma Build Roadmap
| Field | Documents |
|-------|-----------|
| **Governing Documents** | G1 (Documentation Constitution), U2 (Design System), U3 (Figma Standards), U1 (UI Strategy) |
| **Derived From** | U2, U3, U1, E1–E10, A1 |
| **References** | G1, U1, U2, U3, E1–E10, A1 |
| **Referenced by** | U5 (for Phase 5 templates) |

#### U5 — Screen Blueprint Specification
| Field | Documents |
|-------|-----------|
| **Authority** | Medium — derives authority from G1, E1–E10, and UI/UX documentation |
| **Governing Documents** | G1 (Documentation Constitution) |
| **Derived From** | E1–E10, U1, U2, U4, Product Documentation (Workspace Catalogue) |
| **References** | G1 (§17 terminology, compliance), U1 (§3.2 personas, §10 navigation, §18 motion, §20 a11y, §21 responsive, §23 AI), U2 (§2.5 sidebar, §2.6 breadcrumbs, §3.7 composition hierarchy, §5.2 a11y, §5.3 responsive), U4 (Phase 5 templates), E1–E10 (domain entities), Product Documentation (Workspace Catalogue for screen inventories) |
| **Referenced by** | *(operational — governs all future screen blueprint authoring)* |

#### U6 — UI Rendering Specification
| Field | Documents |
|-------|-----------|
| **Nature** | Living document, deterministic rendering standard for AI agents |
| **Governing Documents** | *(not explicitly declared — self-governing via §5 Design Constitution)* |
| **Derived From** | U1 (design philosophy/values), U2 (design tokens/components) |
| **References** | U1 (design values translated to rendering rules in §4.7), U2 (tokens, components) |
| **Referenced by** | *(operational — governs Figma MCP rendering agents)* |

---

## 4. Cross-Reference Matrix

### 4.1 Reading the Matrix

- **Row** = document that contains the reference
- **Column** = document being referenced
- **●** = governing/authority relationship (row governs column OR column governs row)
- **→** = row derives from / depends on column
- **←** = row feeds into / is referenced by column
- **↔** = mutual reference
- **R** = row references column (informational)

### 4.2 Full Matrix

|  | G1 | A1 | A2 | A3 | A4 | A5 | P1 | P2 | P3 | P4 | P5 | P6 | E* | U1 | U2 | U3 | U4 | U5 | U6 |
|--|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| **G1** | — | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| **A1** | → | — | ↔ | ↔ | ← | ← | R | R | R | R | R | R | → | R | R | | | | |
| **A2** | → | ↔ | — | ← | ← | ← | | | | R | R | R | → | | | | | | |
| **A3** | → | ↔ | R | — | ← | ← | | | R | R | R | R | → | | | | | | |
| **A4** | → | → | → | → | — | ● | → | → | → | → | → | → | → | | | | | | |
| **A5** | → | R | R | R | → | — | R | R | R | R | R | R | → | | | | | | |
| **P1** | → | | | | ← | ← | — | ● | ● | ↔ | ↔ | ↔ | → | R | R | | | | |
| **P2** | → | | | | | ← | → | — | ● | | | | → | | | | | | |
| **P3** | → | R | | R | | ← | → | → | — | | | | → | | | | | | |
| **P4** | → | R | R | R | | ← | → | | | — | | | → | | | | | | |
| **P5** | → | R | R | R | | ← | → | | | | — | | → | | | | | | |
| **P6** | → | | | | | ← | → | | | | | — | | | | | | | |
| **E*** | → | R | R | R | | R | → | → | → | R | R | | — | R | R | | | R | |
| **U1** | → | R | | | | | R | | | | | | → | — | ● | → | → | → | ↔ |
| **U2** | → | R | | | | | R | | | | | | → | → | — | → | → | → | ↔ |
| **U3** | → | | | | | | R | | | | | | R | → | → | — | → | | |
| **U4** | → | R | | | | | | | | | | | R | → | → | → | — | R | |
| **U5** | → | | | | | | | | | | | | R | → | → | | R | — | |
| **U6** | | | | | | | | | | | | | | → | → | | | | — |

*(E* = all 10 engineering specs; R = informational reference)*

---

## 5. Dependency Graph

### 5.1 Textual Dependency Flow

```
                    ┌─────────────────────────────┐
                    │   G1: Documentation         │
                    │   Constitution              │
                    │   (ROOT AUTHORITY)           │
                    └─────────────┬───────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
    ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
    │ E1–E10:         │  │ A1: System       │  │ P1: Engineering │
    │ Engineering     │  │ Architecture     │  │ Standards       │
    │ Specifications  │  │                  │  │                 │
    │ (10 domains)    │  │                  │  │                 │
    └────────┬────────┘  └────────┬─────────┘  └────────┬────────┘
             │                    │                     │
             │    ┌───────────────┼──────────────┐      │
             │    │               │              │      │
             ▼    ▼               ▼              ▼      ▼
    ┌──────────────────┐  ┌───────────────┐  ┌──────────────────┐
    │ A2: Database     │  │ A3: Impl.     │  │ P2: Cross-Domain │
    │ Architecture     │  │ Roadmap       │  │ Integration      │
    └────────┬─────────┘  └───────┬───────┘  └────────┬─────────┘
             │                    │                    │
             │    ┌───────────────┼────────────┐       │
             │    │               │            │       │
             ▼    ▼               ▼            ▼       ▼
    ┌──────────────────────────────────────────────────────────┐
    │                    P3–P6: Platform Standards             │
    │    P3: Event Catalogue │ P4: API Guide │ P5: Dev        │
    │    P6: DevOps          │                              │
    └──────────────────────────┬───────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ A4: Architecture    │
                    │ Freeze              │
                    │ (consolidates all)  │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ A5: Implementation  │
                    │ Playbook            │
                    │ (operational guide) │
                    └─────────────────────┘

    UI/UX STREAM (parallel, derives from engineering + architecture):

    ┌──────────────────────────────────────────────────────────────┐
    │                                                              │
    │  U1: UI Strategy ← (G1, A1, E1–E10)                         │
    │       │                                                      │
    │       ▼                                                      │
    │  U2: Design System ← (G1, U1, A1, E1–E10)                   │
    │       │                                                      │
    │       ├──→ U3: Figma Standards ← (G1, U1, U2, P1–P6, E*)    │
    │       │         │                                            │
    │       │         ▼                                            │
    │       │    U4: Figma Build Roadmap ← (G1, U1, U2, U3, E*)   │
    │       │         │                                            │
    │       │         ▼                                            │
    │       │    U5: Screen Blueprint Spec ← (G1, U1, U2, U4, E*) │
    │       │                                                      │
    │       └──→ U6: UI Rendering Spec ← (U1, U2)                 │
    │                                                              │
    └──────────────────────────────────────────────────────────────┘
```

### 5.2 Simplified Layer Model

```
Layer 0 (Root):         G1  Documentation Constitution
                            │
Layer 1 (Foundation):   E1–E10  Engineering Specifications
                        A1  System Architecture
                        P1  Engineering Standards
                            │
Layer 2 (Standards):    A2  Database Architecture
                        A3  Implementation Roadmap
                        P2  Cross-Domain Integration
                        P3  Platform Event Catalogue
                        P4  API Style Guide
                        P5  Development Standards
                        P6  DevOps & Deployment Standards
                        U1  UI Strategy & Design Direction
                            │
Layer 3 (Consolidation): A4  Architecture Freeze
                        U2  Design System & Component Library
                            │
Layer 4 (Operational):  A5  Implementation Playbook
                        U3  Figma Standards & Design QA
                        U4  Figma Build Roadmap
                        U5  Screen Blueprint Specification
                        U6  UI Rendering Specification
```

---

## 6. Orphan Detection

### 6.1 Definition

An **orphan** is a document that is not referenced by any other document in the repository (excluding the root G1 which governs all).

### 6.2 Results

| Document | Referenced By | Status |
|----------|--------------|--------|
| A5 (Implementation Playbook) | No other document formally references it | **Operational orphan** — consumed by developers, not by other specs |
| P6 (DevOps Standards) | A4, A5, P7 (mirror only) | Low risk — operational document |
| U6 (UI Rendering Specification) | No other document formally references it | **Parallel standard** — self-contained rendering rules for AI agents |

**Assessment:** No true orphans detected. A5 and U6 are operational documents consumed by practitioners rather than referenced by other specifications. This is by design.

---

## 7. Circular Dependency Check

### 7.1 Definition

A **circular dependency** exists when document A depends on document B, and document B depends on document A at the same authority level.

### 7.2 Results

| Check | Result |
|-------|--------|
| A1 ↔ A2 | **Mutual reference** — acceptable (peer architecture documents, neither governs the other) |
| P1 ↔ P4 | **Mutual reference** — acceptable (P1 governs naming; P4 governs API patterns; neither supersedes) |
| P1 ↔ P5 | **Mutual reference** — acceptable (same pattern as P4) |
| U1 ↔ U6 | **Mutual reference** — acceptable (U1 provides philosophy; U6 provides deterministic rules; different scope) |
| U2 ↔ U6 | **Mutual reference** — acceptable (U2 defines components; U6 defines rendering rules for those components) |

**Assessment:** All mutual references are **peer-to-peer** at the same authority level with non-overlapping scope. No circular authority dependencies exist. The hierarchy remains acyclic.

---

## 8. Staleness Risk Analysis

### 8.1 High-Risk Staleness Candidates

Documents that many others depend on, where a change would cascade:

| Document | Downstream Count | Staleness Risk | Mitigation |
|----------|-----------------|----------------|------------|
| G1 (Documentation Constitution) | All 35 documents | **Critical** | Change requires approval per Constitution §8 |
| P1 (Engineering Standards) | P2, P3, P4, P5, P6, A4, A5, E1–E10 | **High** | Architecture review required |
| E1–E10 (Engineering Specs) | P1, P2, P3, P4, P5, A1, A2, A3, U1, U2, U5 | **High** | Frozen — changes require de-freeze process |
| U1 (UI Strategy) | U2, U3, U4, U5, U6 | **Medium** | Version bump + cascade review |
| U2 (Design System) | U3, U4, U5, U6 | **Medium** | Version bump + cascade review |

### 8.2 Low-Risk Documents

Documents that depend on many others but are rarely depended upon:

| Document | Risk | Reason |
|----------|------|--------|
| A5 (Implementation Playbook) | **Low** | Operational guide; changes are local |
| U4 (Figma Build Roadmap) | **Low** | Execution plan; changes don't affect specifications |
| U5 (Screen Blueprint Spec) | **Low** | New document; no downstream dependents yet |

---

## 9. Gap Analysis

### 9.1 Documents Without Explicit Governing Declarations

| Document | Governing Documents Field | Gap |
|----------|--------------------------|-----|
| A1 (System Architecture) | Not declared in header | Should declare G1, E1–E10, P1–P6 |
| A2 (Database Architecture) | Not declared in header | Should declare G1, E1–E10 |
| A3 (Implementation Roadmap) | Not declared in header | Should declare G1, E1–E10, A1 |
| P1 (Engineering Standards) | Not declared in header | Should declare G1, A4 |
| P4 (API Style Guide) | Not declared in header | Should declare G1, A4, P1 |
| P5 (Development Standards) | Not declared in header | Should declare G1, A4, P1 |
| P6 (DevOps Standards) | Not declared in header | Should declare G1, A4, P1 |
| U6 (UI Rendering Spec) | Not declared | Should declare G1, U1, U2 |

**Recommendation:** Add formal `Governing Documents` and `Derived From` table rows to the headers of A1, A2, A3, P1, P4, P5, P6, and U6 for consistency with G1's requirements.

### 9.2 Missing Cross-References

| Gap | Description | Severity |
|-----|-------------|----------|
| U5 → P3 (Event Catalogue) | Screen blueprints reference data flows but don't formally link to event contracts | Low |
| U6 → U3 (Figma Standards) | Rendering spec doesn't reference Figma QA standards | Low |
| A1 → U1 (UI Strategy) | System Architecture doesn't reference UI Strategy (one-way gap) | Low |

---

## 10. Maintenance Guide

### 10.1 When a Document Changes

| Change Type | Action Required |
|-------------|-----------------|
| **G1 changes** | Review ALL 35 downstream documents for compliance |
| **E1–E10 change** | Review P1, P2, P3, P4, P5, A1, A2, A3, U1, U2, U5 |
| **P1 changes** | Review P2, P3, P4, P5, P6, A4, A5 |
| **U1 changes** | Review U2, U3, U4, U5, U6 |
| **U2 changes** | Review U3, U4, U5, U6 |
| **A1 changes** | Review A2, A3, A4, A5, U1 |
| **Operational doc changes** (A5, U4, U5, U6) | No cascade required |

### 10.2 Validation Checklist

When updating any document, verify:

- [ ] `Governing Documents` field lists all higher-authority documents
- [ ] `Derived From` field lists all source documents
- [ ] All `§section` internal references are valid
- [ ] All document name external references point to existing files
- [ ] Version number is incremented
- [ ] Revision History table is updated
- [ ] Status is accurate

### 10.3 Automated Checks (Recommended)

| Check | Frequency | Scope |
|-------|-----------|-------|
| Broken `§section` references | On every document edit | Internal |
| Broken document-name references | Weekly | Cross-document |
| Orphan detection | Monthly | Full repository |
| Circular dependency scan | Monthly | Full repository |
| Governing Documents field completeness | Quarterly | Full repository |

---

## Appendix A — Source of Truth Map

For any piece of information, this table identifies the single authoritative source:

| Information Category | Authoritative Source | Document ID |
|---------------------|---------------------|-------------|
| Documentation practices | Documentation Constitution | G1 |
| System topology & modules | System Architecture | A1 |
| Database schemas & patterns | Database Architecture | A2 |
| Implementation sequencing | Implementation Roadmap | A3 |
| Architecture baseline lock | Architecture Freeze | A4 |
| Developer workflows | Implementation Playbook | A5 |
| Naming, entity, audit standards | Engineering Standards | P1 |
| Domain-to-domain contracts | Cross-Domain Integration | P2 |
| Event definitions | Platform Event Catalogue | P3 |
| REST API design | API Style Guide | P4 |
| Code organization | Development Standards | P5 |
| Deployment procedures | DevOps Standards | P6 |
| Domain business rules | Domain Engineering Specs | E1–E10 |
| Design philosophy & UX principles | UI Strategy & Design Direction | U1 |
| Design tokens & components | Design System & Component Library | U2 |
| Figma file structure & QA | Figma Standards & Design QA | U3 |
| Figma build execution order | Figma Build Roadmap | U4 |
| Screen blueprint authoring | Screen Blueprint Specification | U5 |
| Deterministic rendering rules | UI Rendering Specification | U6 |

---

## Appendix B — Product Documentation References

The following source material files in `Product Documentation/` are referenced by engineering specifications:

| Source File | Referenced By |
|-------------|--------------|
| `01 Product Foundation.txt` | E1–E10 |
| `02 Platform Architecture.txt` | E1–E10, A1 |
| `03 Workspace Architecture.txt` | E1–E10 |
| `04 Core Platform Capabilities.txt` | E1–E10 |
| `05 Workspace Catalogue.txt` | E1–E10, U5 |
| `Backlog.txt` | *(not referenced by any specification)* |

---

*This document was generated from explicit Governing Documents, Derived From, and cross-reference fields declared in each specification. All relationships are factual and derived from the documents themselves.*
