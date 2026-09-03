# Figma Generation Workflow & Opencode Execution Specification

| Field | Value |
|-------|-------|
| **Document ID** | OPS-UIUX-FIGMA-WORKFLOW-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Authority Level** | 6 (below Documentation Constitution, Architecture, and Platform Standards; peer with UI/UX Specifications) |
| **Target Audience** | Opencode (AI agent), Human reviewers, Figma engineers |
| **Scope** | Deterministic orchestration of all repository specifications into production-quality Figma designs |
| **Compliance** | RFC 2119 keyword semantics (MUST, SHALL, SHOULD, MAY) throughout |

---

## Table of Contents

1. [Position in Documentation Pipeline](#1-position-in-documentation-pipeline)
2. [Execution Philosophy](#2-execution-philosophy)
3. [Execution Lifecycle](#3-execution-lifecycle)
4. [Opencode Responsibilities](#4-opencode-responsibilities)
5. [AI Design Team](#5-ai-design-team)
6. [Workflow Stages](#6-workflow-stages)
7. [Decision Algorithms](#7-decision-algorithms)
8. [Figma Construction Standards](#8-figma-construction-standards)
9. [Figma MCP Standards](#9-figma-mcp-standards)
10. [Validation Pipeline](#10-validation-pipeline)
11. [Failure Recovery](#11-failure-recovery)
12. [Output Standards](#12-output-standards)
13. [Governance](#13-governance)
14. [Final Standard](#14-final-standard)
15. [Appendix A: Document Reference Index](#appendix-a-document-reference-index)
16. [Appendix B: Complete Dependency Graph](#appendix-b-complete-dependency-graph)
17. [Appendix C: Glossary](#appendix-c-glossary)

---

# 1. Position in Documentation Pipeline

---

## 1.1 What This Document Is

This specification is the **execution engine** for the School ERP UI/UX documentation suite. It defines the deterministic workflow that Opencode MUST follow when consuming approved repository specifications and generating production-quality Figma designs.

It is NOT a UI specification. It does not define what the interface looks like.
It is NOT a design specification. It does not define aesthetic choices.
It is NOT a component specification. It does not define component anatomy.

It is the **orchestration layer** that reads every other specification and translates their collective authority into a reproducible generation process.

## 1.2 Document Classification

| Property | Value |
|----------|-------|
| Type | Execution Specification |
| Domain | UI/UX Generation Orchestration |
| Authority Level | 6 |
| Governing Document | Documentation Constitution (§1.3, Authority Level 1) |
| Peer Documents | Screen Blueprint Specification, Pattern Library, Component Recipe Library, UI Rendering Specification |
| Downstream Consumers | Opencode (primary), Figma engineers (secondary), QA reviewers (tertiary) |

## 1.3 Position in Authority Hierarchy

```
Level 1: Documentation Constitution
Level 2: System Architecture, Product Vision
Level 3: Platform Standards, Database Architecture
Level 4: Engineering Specifications (10 domains)
Level 5: UI/UX Specifications (01, 02, 03), Screen Blueprint Specification
Level 6: THIS DOCUMENT, Pattern Library, Component Recipe Library,
         UI Rendering Specification, Engineering-to-Pattern Mapping
Level 7: Individual Screen Blueprints (when authored)
Level 8: Implementation Documentation
```

This document operates at Level 6. It consumes documents from Levels 1-5 and produces guidance for Level 7 (Screen Blueprints) and Level 8 (Figma implementations).

## 1.4 Relationship to Every Existing Specification

### Governance Documents

| Document | Relationship |
|----------|-------------|
| Documentation Constitution | This document MUST comply with all constitution rules. The Constitution's AI success principles (§16) and prompt execution workflow (§17) are embedded in this workflow. |
| Documentation Dependency Map | This document extends the dependency map by defining the execution order for UI/UX generation. |

### Architecture Documents

| Document | Relationship |
|----------|-------------|
| System Architecture | Constrains technical feasibility of generated designs. Authentication architecture, multi-tenant patterns, and API patterns inform navigation and data display decisions. |
| Database Architecture | Entity relationships inform data display hierarchies. Schema structure informs form field ordering. |
| Implementation Roadmap | Defines module implementation order, which this document uses for Phase 6 sequencing. |
| Architecture Freeze | Frozen architectural decisions cannot be violated by generated designs. |
| Implementation Playbook | Frontend workflow standards (§11) inform Figma construction conventions. |

### Platform Standards Documents

| Document | Relationship |
|----------|-------------|
| Engineering Standards | Naming standards (§3), entity standards (§4), and validation standards (§7) are reflected in component naming and form design. |
| Cross-Domain Integration | Domain interaction patterns inform navigation flows and data display across modules. |
| Platform Event Catalogue | Event types inform notification design and real-time data display patterns. |
| API Style Guide | Pagination, filtering, sorting, and error response patterns inform component behaviour. |
| Development Standards | Frontend standards (§6.6) define the code-side contract that Figma designs must satisfy. |
| DevOps Standards | Deployment environment constraints inform responsive breakpoint decisions. |

### Engineering Specification Documents (10 domains)

| Document | Relationship |
|----------|-------------|
| Identity & Access Engineering | Authentication flows, RBAC patterns, and session management inform auth screens and permission-aware components. |
| Institution Management Engineering | Organisation/institution hierarchy informs navigation structure and entity relationships. |
| People Engineering | Person lifecycle (student, staff, parent) informs profile screens, enrollment wizards, and directory views. |
| Academic Management Engineering | Class structures, enrollment, grading, and timetable inform academic screens and calendar views. |
| Finance Engineering | Fee structures, billing, invoicing, and payment flows inform financial screens and transaction tables. |
| Communication Engineering | Notification engine, channels, templates, and announcements inform communication screens and messaging UI. |
| Operations Engineering | Library, hostel, transport, clinic, visitor, and inventory management inform operational screens. |
| Documents & Learning Engineering | Document management, templates, and learning resources inform file management and content screens. |
| Reporting & Analytics Engineering | Dashboards, reports, KPIs, and analytics inform data visualization screens and chart components. |
| Platform Administration Engineering | Tenant lifecycle, subscriptions, feature flags, and monitoring inform admin screens and system health dashboards. |

### UI/UX Specification Documents

| Document | Relationship |
|----------|-------------|
| 01 UI Strategy & Design Direction | Design vision, personality, UX philosophy, and principles are the highest-authority UI/UX input. Every generated design must embody these principles. |
| 02 Design System & Component Library | Component definitions, tokens, variants, states, and composition rules are the building blocks that this workflow assembles. |
| 03 Figma Standards & Design QA | Figma workspace architecture, variable management, component standards, and QA processes are the construction standards for generated Figma files. |
| Screen Blueprint Specification | Individual screen blueprints (when authored) are the primary input for screen generation. This workflow defines how blueprints are consumed. |
| Pattern Library | Approved patterns (47 across 9 categories) are the layout solutions that this workflow selects and implements. |
| Component Recipe Library | Approved recipes (55 across 11 categories) are the component compositions that this workflow assembles into screens. |
| UI Rendering Specification | Deterministic rendering rules (RFC 2119) are the visual construction rules that every generated element MUST follow. |
| Engineering-to-Pattern Mapping | Maps 746 screens from engineering specs to patterns, providing the lookup table for pattern selection. |
| Figma Build Roadmap | Defines the 9-phase build sequence that this workflow executes. |

### Product Documentation

| Document | Relationship |
|----------|-------------|
| Product Foundation | Product vision and objectives inform design priorities. |
| Platform Architecture | Platform hierarchy (Platform > Organization > Institution > Campus) informs navigation depth. |
| Workspace Architecture | Workspace structure informs page layout and navigation patterns. |
| Core Platform Capabilities | Capability inventory informs feature coverage in generated designs. |
| Workspace Catalogue | Screen inventory per workspace provides the complete list of screens to generate. |
| Domain Model | Entity definitions inform data display and form design. |
| Technical Architecture | Technology stack (Next.js, Flutter, Tailwind) constrains component design to what the frontend can render. |

## 1.5 Dependency Graph

```
                         DOCUMENTATION CONSTITUTION
                                  |
                    +-------------+-------------+
                    |             |             |
              ARCHITECTURE   PLATFORM      UI STRATEGY
              (5 docs)      STANDARDS     & DIRECTION
                    |       (7 docs)         (01)
                    |             |             |
                    +------+------+------+------+
                           |      |      |
                    ENGINEERING  PRODUCT  RENDERING
                    SPECS (10)  DOCS(10) SPEC
                           |             |
                    +------+------+------+
                    |      |      |
              SCREEN    PATTERN  COMPONENT
              BLUEPRINT LIBRARY  RECIPE
              SPEC      (47)    LIBRARY
              (input)          (55)
                    |      |      |
                    +------+------+
                           |
                    THIS DOCUMENT
                    (Execution Engine)
                           |
                    +------+------+
                    |             |
              FIGMA BUILD    FIGMA STANDARDS
              ROADMAP        & DESIGN QA (03)
              (9 phases)
                           |
                    +------+------+
                    |             |
              PRODUCTION-    DEVELOPER
              QUALITY        HANDOFF
              FIGMA FILES
```

## 1.6 Inputs and Outputs

### Inputs (what this document consumes)

| Input | Source | Granularity |
|-------|--------|-------------|
| Design principles | 01 UI Strategy & Design Direction | Global |
| Design tokens | 02 Design System & Component Library §1 | Token-level |
| Component definitions | 02 Design System & Component Library §3 | Component-level |
| Composition rules | 02 Design System & Component Library §3.7 | Rule-level |
| Figma construction rules | 03 Figma Standards & Design QA | File-level |
| Layout patterns | Pattern Library (47 patterns) | Pattern-level |
| Component recipes | Component Recipe Library (55 recipes) | Recipe-level |
| Screen blueprints | Screen Blueprint Specification (individual blueprints) | Screen-level |
| Rendering rules | UI Rendering Specification | Rule-level |
| Screen-to-pattern map | Engineering-to-Pattern Mapping | Lookup table |
| Build sequence | Figma Build Roadmap (9 phases) | Phase-level |
| Entity definitions | Engineering Specifications (10 domains) | Entity-level |
| Screen inventory | Workspace Catalogue | Screen-level |
| Validation rules | Documentation Constitution §20-21 | Rule-level |

### Outputs (what this document produces)

| Output | Consumer | Format |
|--------|----------|--------|
| Deterministic generation workflow | Opencode | Step-by-step protocol |
| Decision algorithms | Opencode | Decision trees |
| Figma construction instructions | Opencode | Construction specifications |
| Validation pipeline | Opencode, QA reviewers | Checklist-driven |
| Failure recovery procedures | Opencode | Protocol-driven |
| Output quality standards | QA reviewers | Pass/fail criteria |

## 1.7 How This Document Differs from Its Peers

| Peer Document | What It Does | What This Document Adds |
|---------------|-------------|------------------------|
| Screen Blueprint Specification | Defines how to author individual screen blueprints | Defines how to consume blueprints and generate Figma from them |
| Pattern Library | Defines approved layout patterns | Defines how to select and apply patterns during generation |
| Component Recipe Library | Defines component compositions | Defines how to assemble recipes into screens |
| UI Rendering Specification | Defines visual rendering rules | Defines how to apply rendering rules during Figma construction |
| Figma Build Roadmap | Defines build phases and sequence | Defines the execution protocol for each phase |
| Figma Standards & Design QA | Defines Figma construction standards | Defines how Opencode applies those standards via MCP |

---

# 2. Execution Philosophy

---

## 2.1 Why Execution Must Be Deterministic

Determinism is the foundational requirement of this workflow. Given identical inputs, the generation process MUST produce nearly identical outputs regardless of:

- Execution order
- Time of execution
- AI model version
- Session context
- Prior generation history

This requirement exists because:

1. **Reproducibility.** If a screen is regenerated, the result must match the original. Design drift is unacceptable.
2. **Auditability.** Every design decision must be traceable to a specification. Subjective choices cannot be traced.
3. **Scalability.** 200+ screens must be generated consistently. Human-level variation across screens would be a defect.
4. **Quality.** Determinism eliminates the risk of AI hallucination producing invalid designs.

## 2.2 Why Opencode Must Never Improvise

Improvisation is the introduction of decisions not present in the source specifications. It is prohibited because:

1. **Every specification exists for a reason.** If a rule is not in the specifications, either the rule is unnecessary or the specification has a gap. Gaps must be flagged, not filled with invented rules.
2. **Invented rules propagate errors.** One improvisation can cascade through dozens of screens, creating systematic defects.
3. **Invented rules are unauditable.** If a design decision cannot be traced to a specification, it cannot be reviewed, approved, or corrected.
4. **The repository is the source of truth.** The AI's role is execution, not authorship.

## 2.3 Why Repository Documents Are the Source of Truth

The repository contains 45 approved/frozen documents totalling ~92,000 lines. These documents collectively define:

- What the product is (Product Documentation)
- How it is built (Architecture, Engineering Specifications)
- What standards it follows (Platform Standards)
- How it looks and behaves (UI/UX Specifications)
- How it is governed (Documentation Constitution)

No generated design may contradict any repository document. When documents conflict, the authority hierarchy (Constitution §1.3) resolves the conflict. This workflow MUST NOT resolve conflicts independently.

## 2.4 Why Figma Is an Output Rather Than a Design Tool

In this workflow, Figma is a **construction target**, not a design environment:

1. **All design decisions are made in specifications, not in Figma.** Figma receives pre-determined instructions.
2. **Figma is the rendering engine.** It applies tokens, assembles components, and constructs layouts per specification.
3. **Human interaction with Figma is for review, not creation.** Humans review generated output; they do not design in Figma during the generation workflow.
4. **MCP is the interface.** Opencode interacts with Figma programmatically, not through the GUI.

## 2.5 The Five Execution Axioms

| # | Axiom | Implication |
|---|-------|-------------|
| A1 | **Specifications before construction** | Every generation session begins by loading specifications, not by opening Figma. |
| A2 | **Validation before progression** | No stage completes without passing its validation gate. |
| A3 | **Reference before invention** | Every component, token, and layout choice must cite a source specification. |
| A4 | **Explicit over implicit** | Ambiguity is resolved by asking, not by assuming. |
| A5 | **Traceability over speed** | A slower, fully traceable generation is preferred over a fast, untraceable one. |

---

# 3. Execution Lifecycle

---

## 3.1 Complete Lifecycle Overview

The execution lifecycle defines the end-to-end sequence from business requirement to Figma output. Every generation MUST follow this lifecycle without skipping stages.

```
BUSINESS REQUIREMENT
        |
        v
ENGINEERING SPECIFICATION
        |
        v
SCREEN BLUEPRINT
        |
        v
PATTERN SELECTION
        |
        v
RECIPE SELECTION
        |
        v
INFORMATION ARCHITECTURE VALIDATION
        |
        v
LAYOUT COMPOSITION
        |
        v
VISUAL RENDERING
        |
        v
ACCESSIBILITY VALIDATION
        |
        v
RESPONSIVE VALIDATION
        |
        v
DESIGN QA
        |
        v
FIGMA CONSTRUCTION
        |
        v
FINAL VALIDATION
        |
        v
OUTPUT
```

## 3.2 Stage Definitions

### Stage 1: Business Requirement

| Field | Value |
|-------|-------|
| **Input** | Product vision, workspace catalogue |
| **Output** | Identified need for a specific screen |
| **Owner** | Product (upstream) |
| **Opencode Role** | Documentation Reader |
| **Gate** | Requirement exists in workspace catalogue or engineering spec |

The business requirement stage is upstream of Opencode's execution. Opencode does not create requirements; it receives them. The requirement is expressed as either:

- A screen listed in the Workspace Catalogue (`Product Documentation/05 Workspace Catalogue.txt`)
- A workflow described in an Engineering Specification
- A user story in the product backlog

### Stage 2: Engineering Specification

| Field | Value |
|-------|-------|
| **Input** | Business requirement, domain model |
| **Output** | Entity definitions, API endpoints, business rules, role permissions |
| **Owner** | Engineering (upstream) |
| **Opencode Role** | Repository Architect |
| **Gate** | Engineering spec exists and is approved/frozen |

Opencode reads the relevant Engineering Specification to understand:

- What entities exist and their states
- What API operations are available
- What business rules apply
- What permissions control access
- What domain events are emitted

### Stage 3: Screen Blueprint

| Field | Value |
|-------|-------|
| **Input** | Engineering spec, UI Strategy, Screen Blueprint Specification |
| **Output** | Complete screen blueprint per the canonical template |
| **Owner** | UI/UX (or Opencode per Screen Blueprint Specification) |
| **Opencode Role** | Information Architect |
| **Gate** | Blueprint passes all 24 validation rules (V01-V24) and 30 compliance checks (C01-C30) |

If no screen blueprint exists for the target screen, Opencode MUST author one following the Screen Blueprint Specification exactly. The blueprint MUST reference the relevant Engineering Specification and MUST NOT invent business rules, entity definitions, or API contracts.

### Stage 4: Pattern Selection

| Field | Value |
|-------|-------|
| **Input** | Screen blueprint (classification, data requirements, task hierarchy), Pattern Library |
| **Output** | Selected pattern (with variant if applicable) |
| **Owner** | Opencode (Pattern Selector role) |
| **Gate** | Selected pattern exists in Pattern Library; selection is deterministic per §7.1 |

Pattern selection follows the deterministic algorithm defined in §7.1. The blueprint's Screen Classification code maps to a pattern category, and the task hierarchy determines the specific pattern.

### Stage 5: Recipe Selection

| Field | Value |
|-------|-------|
| **Input** | Selected pattern, screen blueprint (data requirements, actions), Component Recipe Library |
| **Output** | Selected recipe(s) with component tables |
| **Owner** | Opencode (Recipe Selector role) |
| **Gate** | Selected recipe(s) exist in Component Recipe Library; selection is deterministic per §7.2 |

Recipe selection follows the deterministic algorithm defined in §7.2. The pattern determines the recipe category, and the screen's data requirements and actions determine the specific recipe.

### Stage 6: Information Architecture Validation

| Field | Value |
|-------|-------|
| **Input** | Screen blueprint, selected pattern, selected recipe |
| **Output** | Validated information architecture |
| **Owner** | Opencode (Information Architect role) |
| **Gate** | Information density within approved tier; task hierarchy is achievable; all data elements have display locations |

This stage validates that:

- The selected pattern can accommodate the blueprint's information hierarchy
- The selected recipe includes components for all required data elements
- The information density matches the blueprint's density tier
- The task hierarchy is achievable within the selected pattern

### Stage 7: Layout Composition

| Field | Value |
|-------|-------|
| **Input** | Validated IA, pattern, recipe, Design System (§2, §3), Rendering Specification (§7) |
| **Output** | Deterministic layout specification (component arrangement, spacing, sizing) |
| **Owner** | Opencode (Layout Composer role) |
| **Gate** | Layout uses only approved components; spacing from approved scale; grid alignment verified |

Layout composition assembles the recipe's components into a specific arrangement following:

- Pattern layout rules (from Pattern Library)
- Recipe component order (from Component Recipe Library)
- Grid system (12-column desktop, 8-column tablet, 4-column mobile per Rendering Spec §7)
- Spacing scale (Space-1 through Space-8 per Rendering Spec §13)
- Density tier (Compact, Standard, or Comfortable per Rendering Spec §13.6)

### Stage 8: Visual Rendering

| Field | Value |
|-------|-------|
| **Input** | Layout specification, Rendering Specification (all chapters), Design Tokens (02 doc §1) |
| **Output** | Visually complete design specification |
| **Owner** | Opencode (Visual Renderer role) |
| **Gate** | All rendering rules applied; all tokens used from approved set; zero hard-coded values |

Visual rendering applies:

- Materials (Glass or Solid per Rendering Spec §8)
- Colour system (Brand, Semantic, Neutral per Rendering Spec §9)
- Typography (type scale, weights, line heights per Rendering Spec §12)
- Elevation (4-level shadow scale per Rendering Spec §11)
- Spacing (proportional sizing per Rendering Spec §13)
- Iconography (per Rendering Spec §14)
- Motion (tier-based durations per Rendering Spec §18)
- Interaction states (5 mandatory states per Rendering Spec §19)

### Stage 9: Accessibility Validation

| Field | Value |
|-------|-------|
| **Input** | Visually complete design, Rendering Specification (§22), Screen Blueprint (accessibility requirements) |
| **Output** | Accessibility compliance report |
| **Owner** | Opencode (Accessibility Validator role) |
| **Gate** | WCAG 2.1 AA compliance verified; screen passes accessibility even if all other validations fail |

Accessibility validation is the **overriding gate**. Per Rendering Specification §22, a screen that fails accessibility validation fails overall regardless of all other validations passing. Checks include:

- Colour contrast >= 4.5:1 (text), >= 3:1 (non-text)
- Touch targets >= 44px
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Reduced motion support
- No information conveyed by colour alone

### Stage 10: Responsive Validation

| Field | Value |
|-------|-------|
| **Input** | Design at all breakpoints, Rendering Specification (§7.6), Design System (§1.12) |
| **Output** | Responsive compliance report |
| **Owner** | Opencode (Responsive Validator role) |
| **Gate** | Design valid at Desktop (12-col), Tablet (8-col), and Mobile (4-col) breakpoints |

Responsive validation confirms:

- Grid column count adapts correctly
- Component layout adapts (stacking, hiding, reflowing)
- Spacing scales proportionally
- Material, colour, typography, and radius do NOT change between breakpoints
- Content priority matches blueprint requirements
- Touch targets maintain minimum size on mobile

### Stage 11: Design QA

| Field | Value |
|-------|-------|
| **Input** | All prior validation reports, Figma Standards (§6), QA checklist |
| **Output** | QA pass/fail report |
| **Owner** | Opencode (Design QA Reviewer role) |
| **Gate** | All 24 QA checks pass (per Figma Build Roadmap §9) |

Design QA runs the master QA checklist from the Figma Build Roadmap:

- Component reuse (library instances, no detached components)
- Variable usage (no hard-coded values)
- Token compliance (brand/semantic/neutral correct)
- Alignment (grid alignment, consistent spacing)
- Typography (hierarchy consistent, sizes from scale)
- Accessibility (contrast, touch targets, keyboard)
- Responsive (desktop, tablet, mobile)
- Naming (files, frames, layers)
- Documentation (descriptions, annotations, interaction notes)

### Stage 12: Figma Construction

| Field | Value |
|-------|-------|
| **Input** | Validated design specification, Figma Standards (§1-4), Figma MCP tools |
| **Output** | Production-quality Figma page/frame/components |
| **Owner** | Opencode (Figma Engineer role) |
| **Gate** | Figma construction follows all standards in §8 and §9 |

Figma construction translates the validated design specification into actual Figma objects using MCP tools. This is the only stage that modifies Figma.

### Stage 13: Final Validation

| Field | Value |
|-------|-------|
| **Input** | Constructed Figma output, all prior validation criteria |
| **Output** | Final pass/fail report with generation summary |
| **Owner** | Opencode (Final Reviewer role) |
| **Gate** | All validations pass; output matches specification; no gaps identified |

Final validation is a holistic review confirming:

- The Figma output matches the screen blueprint
- All components are library instances
- All tokens are from approved variables
- All states are implemented
- All breakpoints are implemented
- Accessibility is compliant
- Documentation is complete
- No gaps or improvisations exist

### Stage 14: Output

| Field | Value |
|-------|-------|
| **Input** | Validated Figma output |
| **Output** | Production-ready Figma page with documentation |
| **Owner** | Opencode (Final Reviewer role) |
| **Gate** | Output meets all standards in §12 |

The final output is a complete, developer-ready Figma artifact with:

- Clean layer hierarchy
- Named frames and layers
- Component instances (not detached)
- Variable bindings
- Responsive variants
- Documentation annotations
- Interaction notes
- Developer handoff metadata

## 3.3 Stage Exit Criteria

Every stage MUST satisfy its exit criteria before the next stage begins. Exit criteria are:

| Stage | Exit Criteria |
|-------|--------------|
| 1. Business Requirement | Requirement identified and documented |
| 2. Engineering Specification | Relevant spec located and read |
| 3. Screen Blueprint | Blueprint passes V01-V24 and C01-C30 |
| 4. Pattern Selection | Pattern selected; selection traceable to algorithm |
| 5. Recipe Selection | Recipe(s) selected; selection traceable to algorithm |
| 6. IA Validation | All data elements have display locations; density validated |
| 7. Layout Composition | Component arrangement specified; grid/spacing applied |
| 8. Visual Rendering | All tokens applied; zero hard-coded values |
| 9. Accessibility Validation | WCAG 2.1 AA verified; all checks pass |
| 10. Responsive Validation | All 3 breakpoints validated |
| 11. Design QA | All 24 QA checks pass |
| 12. Figma Construction | Figma objects created per standards |
| 13. Final Validation | Holistic review passes |
| 14. Output | Complete deliverable produced |

## 3.4 Stage Failure and Recovery

If any stage fails its exit criteria:

1. **STOP.** Do not proceed to the next stage.
2. **Diagnose.** Identify the specific failure using the failure recovery procedures in §11.
3. **Resolve.** Apply the appropriate recovery procedure.
4. **Re-validate.** Re-run the failed stage's validation.
5. **Document.** Record the failure, resolution, and re-validation in the generation report.

Failure recovery is detailed in §11.

---

# 4. Opencode Responsibilities

---

## 4.1 What Opencode IS Responsible For

| Responsibility | Description |
|---------------|-------------|
| Reading specifications | Loading and understanding all relevant repository documents before generation |
| Blueprint authoring | Creating screen blueprints when none exist (following Screen Blueprint Specification exactly) |
| Pattern selection | Applying the deterministic algorithm to select the correct pattern for each screen |
| Recipe selection | Applying the deterministic algorithm to select the correct recipe(s) for each screen |
| Layout composition | Assembling components into the correct arrangement per pattern and recipe |
| Visual rendering | Applying all design tokens and rendering rules per the Rendering Specification |
| Figma construction | Using MCP tools to create Figma objects per the Figma Standards |
| Validation | Running all validation checks at every stage |
| Failure recovery | Identifying and resolving failures using prescribed procedures |
| Documentation | Annotating generated Figma output with metadata, interaction notes, and developer guidance |
| Gap identification | Flagging missing information, conflicting specifications, or undefined rules |
| Generation reporting | Producing a complete audit trail of every decision made during generation |

## 4.2 What Opencode MUST NOT Do

| Prohibition | Rationale |
|-------------|-----------|
| MUST NOT invent layouts | Layouts come from Patterns and Recipes, not from AI judgment |
| MUST NOT invent spacing systems | Spacing comes from the approved scale (Rendering Spec §13), not from estimation |
| MUST NOT invent components | Components come from the Design System (02 doc §3), not from AI creation |
| MUST NOT invent interactions | Interactions come from the Screen Blueprint and Rendering Spec §19, not from AI preference |
| MUST NOT invent colour values | Colours come from approved tokens (02 doc §1.2, Rendering Spec §9), not from AI selection |
| MUST NOT invent typography values | Typography comes from approved tokens (02 doc §1.3, Rendering Spec §12), not from AI selection |
| MUST NOT invent animation | Motion comes from approved tiers (Rendering Spec §18), not from AI creativity |
| MUST NOT use subjective language | Words like "premium", "modern", "elegant" are not actionable; use specific token references |
| MUST NOT skip validation | Every stage MUST be validated; skipping validation is a critical failure |
| MUST NOT proceed after failure | A failed validation MUST stop the workflow until resolved |
| MUST NOT hard-code values | Every visual property MUST trace to an approved variable or token |
| MUST NOT detach components | All components MUST remain as library instances |
| MUST NOT deviate from the Rendering Specification | The Rendering Specification is normative; deviation is a critical failure |
| MUST NOT resolve specification conflicts independently | Conflicts are escalated per §11.3 |
| MUST NOT make aesthetic judgments | Aesthetic decisions are made in specifications, not during generation |
| MUST NOT add decorative elements | Every element must serve a functional purpose traceable to the blueprint |
| MUST NOT skip accessibility checks | Accessibility is the overriding gate; skipping is a critical failure |
| MUST NOT proceed without a blueprint | Every screen MUST have an approved blueprint before generation begins |

## 4.3 The Opencode Execution Contract

By executing this workflow, Opencode enters into the following contract:

1. **I will read before I write.** Every generation session begins with specification loading.
2. **I will follow the algorithm.** Every decision follows a deterministic algorithm, not a judgment call.
3. **I will validate at every stage.** No stage completes without passing validation.
4. **I will stop on failure.** A failed validation halts the workflow.
5. **I will flag gaps.** Missing information is flagged, not assumed.
6. **I will trace every decision.** Every component, token, and layout choice cites a source.
7. **I will not improvise.** The repository is the source of truth; I am the executor.
8. **I will produce auditable output.** Every generation produces a complete audit trail.

---

# 5. AI Design Team

---

## 5.1 Overview

Instead of treating Opencode as a single designer, this specification defines internal execution roles. Each role has a defined scope, inputs, outputs, responsibilities, validation criteria, failure conditions, and handoff rules.

Opencode executes all roles sequentially. Roles are not parallelised; each role completes before the next begins.

## 5.2 Role Definitions

---

### Role 1: Documentation Reader

| Field | Value |
|-------|-------|
| **Purpose** | Load and understand all relevant repository specifications before any generation begins |
| **Inputs** | Repository file system, Screen Blueprint (if exists) |
| **Outputs** | Loaded specification context (in-memory knowledge base) |
| **Responsibilities** | Identify all relevant documents based on the target screen; read each document completely; extract relevant rules, tokens, components, and patterns; build an in-memory context map |
| **Validation** | All documents listed in §1.6 Inputs are loaded; no document is partially read; context map covers all relevant specifications |
| **Failure Conditions** | Document not found; document is empty; document is malformed; document conflicts with another |
| **Handoff Rules** | Pass loaded context to Repository Architect |

---

### Role 2: Repository Architect

| Field | Value |
|-------|-------|
| **Purpose** | Map the target screen to its source engineering specification and understand the technical context |
| **Inputs** | Loaded specification context, target screen identifier |
| **Outputs** | Entity mapping, API mapping, business rule extraction, permission model |
| **Responsibilities** | Locate the target screen in the Workspace Catalogue; identify the corresponding Engineering Specification; extract entity definitions, states, and relationships; extract API endpoints; extract business rules; extract permission model |
| **Validation** | Target screen exists in Workspace Catalogue; Engineering Specification is approved/frozen; entity mapping is complete; API mapping is complete; permissions are defined |
| **Failure Conditions** | Screen not in Workspace Catalogue; Engineering Specification not found; entities undefined; APIs undefined; permissions undefined |
| **Handoff Rules** | Pass technical context to Information Architect |

---

### Role 3: Information Architect

| Field | Value |
|-------|-------|
| **Purpose** | Author or validate the screen blueprint, ensuring all mandatory sections are complete |
| **Inputs** | Technical context (from Repository Architect), Screen Blueprint Specification |
| **Output** | Validated screen blueprint |
| **Responsibilities** | If no blueprint exists: author one following the canonical template exactly. If blueprint exists: validate it against V01-V24 and C01-C30. Ensure all 22 template sections are populated. Ensure information hierarchy has all 3 tiers. Ensure task hierarchy has exactly 1 primary task. Ensure all 6 screen states are documented. |
| **Validation** | Blueprint passes all 24 validation rules (V01-V24); blueprint passes all 30 compliance checks (C01-C30); all mandatory metadata fields are populated |
| **Failure Conditions** | Blueprint cannot be authored (insufficient information); validation rules fail; compliance checks fail |
| **Handoff Rules** | Pass validated blueprint to Pattern Selector |

---

### Role 4: Pattern Selector

| Field | Value |
|-------|-------|
| **Purpose** | Select the correct pattern for the screen using the deterministic algorithm |
| **Inputs** | Validated screen blueprint, Pattern Library, Engineering-to-Pattern Mapping |
| **Outputs** | Selected pattern ID, variant (if applicable), selection rationale |
| **Responsibilities** | Apply the selection algorithm from §7.1; verify the selected pattern exists in the Pattern Library; verify the pattern variant (if applicable); document the selection rationale; verify the pattern's component requirements are achievable |
| **Validation** | Selected pattern exists in Pattern Library; selection is traceable to the algorithm; pattern variant is approved; pattern component requirements are achievable with approved components |
| **Failure Conditions** | No pattern matches the screen classification; pattern does not exist in Pattern Library; pattern variant does not exist; pattern requires components not in the Design System |
| **Handoff Rules** | Pass selected pattern to Recipe Selector |

---

### Role 5: Recipe Selector

| Field | Value |
|-------|-------|
| **Purpose** | Select the correct recipe(s) for the screen using the deterministic algorithm |
| **Inputs** | Selected pattern, validated blueprint, Component Recipe Library |
| **Outputs** | Selected recipe ID(s), component tables |
| **Responsibilities** | Apply the selection algorithm from §7.2; verify the selected recipe(s) exist in the Component Recipe Library; verify recipe component tables; verify recipe data requirements match blueprint data; document the selection rationale |
| **Validation** | Selected recipe(s) exist in Recipe Library; selection is traceable to the algorithm; recipe components cover all blueprint data elements; recipe actions cover all blueprint actions |
| **Failure Conditions** | No recipe matches; recipe does not exist; recipe components are insufficient; recipe actions are insufficient |
| **Handoff Rules** | Pass selected recipe(s) to Layout Composer |

---

### Role 6: Layout Composer

| Field | Value |
|-------|-------|
| **Purpose** | Arrange the recipe's components into a specific layout following grid, spacing, and hierarchy rules |
| **Inputs** | Selected recipe(s), pattern layout rules, Design System (grid, spacing), Rendering Specification (§7, §13) |
| **Outputs** | Deterministic layout specification (component positions, sizes, arrangement) |
| **Responsibilities** | Apply the 12-column grid system; apply spacing from the approved scale; arrange components per recipe's component order; apply density tier; apply hierarchy rules; ensure proportional sizing; apply responsive rules for all breakpoints |
| **Validation** | Grid alignment verified; spacing from approved scale; component order matches recipe; density tier is consistent within each surface; proportional sizing applied; responsive rules defined for all 3 breakpoints |
| **Failure Conditions** | Components exceed grid capacity; spacing outside approved scale; recipe order conflicts with pattern layout; density tier mismatch |
| **Handoff Rules** | Pass layout specification to Visual Renderer |

---

### Role 7: Visual Renderer

| Field | Value |
|-------|-------|
| **Purpose** | Apply all design tokens and visual rendering rules to the layout |
| **Inputs** | Layout specification, Rendering Specification (all chapters), Design Tokens (02 doc §1) |
| **Outputs** | Visually complete design specification with all tokens applied |
| **Responsibilities** | Apply materials (Glass/Solid per §8); apply colour system per §9; apply typography per §12; apply elevation per §11; apply spacing per §13; apply iconography per §14; apply motion per §18; apply interaction states per §19; apply module personality per §20 (if applicable); ensure zero hard-coded values |
| **Validation** | All visual properties trace to approved tokens; materials are consistent; colour system is correct; typography hierarchy is correct; elevation is correct; spacing is correct; zero hard-coded values |
| **Failure Conditions** | Token not found for a visual property; material conflict; colour contrast failure; typography mismatch; hard-coded value detected |
| **Handoff Rules** | Pass complete design to Accessibility Validator |

---

### Role 8: Accessibility Validator

| Field | Value |
|-------|-------|
| **Purpose** | Verify WCAG 2.1 AA compliance for the complete design |
| **Inputs** | Complete design, Rendering Specification (§22), Screen Blueprint (accessibility requirements) |
| **Outputs** | Accessibility compliance report (pass/fail with specific findings) |
| **Responsibilities** | Check colour contrast ratios; check touch target sizes; check keyboard navigation paths; check screen reader compatibility; check focus management; check reduced motion support; check colour-independent information; verify against the blueprint's accessibility requirements |
| **Validation** | All WCAG 2.1 AA criteria pass; all blueprint accessibility requirements are met; focus order is logical; all interactive elements have ARIA labels |
| **Failure Conditions** | Any WCAG criterion fails; any blueprint requirement unmet; focus order is illogical; interactive element missing ARIA label |
| **Handoff Rules** | Accessibility is the overriding gate. If it fails, STOP and do not proceed. If it passes, pass to Responsive Validator. |

---

### Role 9: Responsive Validator

| Field | Value |
|-------|-------|
| **Purpose** | Verify the design works correctly at all defined breakpoints |
| **Inputs** | Design at all breakpoints, Rendering Specification (§7.6), Design System (§1.12) |
| **Outputs** | Responsive compliance report (pass/fail per breakpoint) |
| **Responsibilities** | Verify desktop layout (12-column grid); verify tablet layout (8-column grid); verify mobile layout (4-column grid); verify component adaptation (stacking, hiding, reflowing); verify spacing proportionality; verify material/colour/typography consistency across breakpoints; verify content priority |
| **Validation** | All 3 breakpoints validated; grid column counts correct; component adaptations correct; spacing proportionally scaled; visual properties consistent; content priority matches blueprint |
| **Failure Conditions** | Grid columns incorrect; component adaptation missing; spacing not proportional; visual property changes between breakpoints; content priority mismatch |
| **Handoff Rules** | Pass to Design QA Reviewer |

---

### Role 10: Design QA Reviewer

| Field | Value |
|-------|-------|
| **Purpose** | Run the master QA checklist against the complete design |
| **Inputs** | Complete design, all prior validation reports, Figma Standards (§6), QA checklist |
| **Outputs** | QA pass/fail report |
| **Responsibilities** | Run all 24 QA checks from the Figma Build Roadmap; verify component reuse; verify variable usage; verify token compliance; verify alignment; verify typography; verify accessibility (re-check); verify responsive (re-check); verify naming; verify documentation |
| **Validation** | All 24 QA checks pass; no outstanding issues; design lead review (if applicable) |
| **Failure Conditions** | Any QA check fails; outstanding issues remain |
| **Handoff Rules** | Pass to Figma Engineer |

---

### Role 11: Figma Engineer

| Field | Value |
|-------|-------|
| **Purpose** | Construct the validated design in Figma using MCP tools |
| **Inputs** | Validated design, Figma Standards (§1-4), Figma MCP tools |
| **Output** | Production-quality Figma page with all objects constructed |
| **Responsibilities** | Create page and frame hierarchy; create component instances; apply variable bindings; apply auto layout; apply constraints; create responsive variants; apply naming conventions; add documentation annotations; add interaction notes; create prototype connections |
| **Validation** | All Figma objects created; all components are library instances; all variables bound; auto layout applied; constraints applied; naming correct; documentation complete |
| **Failure Conditions** | MCP tool failure; component not available in library; variable not available; auto layout cannot accommodate arrangement |
| **Handoff Rules** | Pass to Final Reviewer |

---

### Role 12: Final Reviewer

| Field | Value |
|-------|-------|
| **Purpose** | Holistic review of the complete generation, confirming all specifications are satisfied |
| **Inputs** | Figma output, all validation reports, generation log |
| **Outputs** | Final pass/fail verdict, generation report, validation summary |
| **Responsibilities** | Re-read the screen blueprint; compare Figma output against blueprint; verify all data elements are displayed; verify all actions are available; verify all states are implemented; verify all breakpoints work; verify accessibility; verify documentation; produce generation report |
| **Validation** | Figma output matches blueprint; no gaps; no improvisations; no hard-coded values; no detached components; generation is complete and auditable |
| **Failure Conditions** | Output does not match blueprint; gaps exist; improvisations detected; hard-coded values found; detached components found |
| **Handoff Rules** | Final output delivered. Generation complete. |

---

## 5.3 Role Execution Sequence

```
Documentation Reader
        |
        v
Repository Architect
        |
        v
Information Architect
        |
        v
Pattern Selector
        |
        v
Recipe Selector
        |
        v
Layout Composer
        |
        v
Visual Renderer
        |
        v
Accessibility Validator ---FAIL---> STOP (§11)
        |
        PASS
        v
Responsive Validator
        |
        v
Design QA Reviewer
        |
        v
Figma Engineer
        |
        v
Final Reviewer
        |
        v
OUTPUT
```

## 5.4 Role Failure Escalation

| Role | Failure Action |
|------|---------------|
| Documentation Reader | Flag missing document; attempt alternative sources; escalate if unresolved |
| Repository Architect | Flag screen not in catalogue; flag missing engineering spec; escalate |
| Information Architect | Flag blueprint validation failure; flag insufficient information; escalate |
| Pattern Selector | Flag pattern gap; document the gap; attempt closest match with explicit justification; escalate |
| Recipe Selector | Flag recipe gap; document the gap; compose from pattern guidance with explicit justification; escalate |
| Layout Composer | Flag layout conflict; document the conflict; escalate |
| Visual Renderer | Flag token gap; flag rendering conflict; escalate |
| Accessibility Validator | **STOP.** Accessibility failure is non-negotiable. Do not proceed until resolved. |
| Responsive Validator | Flag breakpoint failure; document the failure; escalate |
| Design QA Reviewer | Flag QA failure; document the failure; escalate |
| Figma Engineer | Flag MCP failure; flag component unavailability; escalate |
| Final Reviewer | Flag output mismatch; document the mismatch; escalate |

---

# 6. Workflow Stages

---

## 6.1 Stage: Repository Analysis

| Field | Value |
|-------|-------|
| **Role** | Documentation Reader |
| **Inputs** | Repository file system |
| **Outputs** | Loaded specification context |
| **Decision Rules** | Load every document listed in section 1.6 Inputs. Load in authority order (Level 1 first). |

### Process

1. **Identify target screen.** Read the Workspace Catalogue to locate the screen by name or module.
2. **Identify relevant Engineering Specification.** Based on the screen's module, load the corresponding Engineering Specification.
3. **Load UI/UX specifications.** Load all 9 UI/UX documents in order: 01, 02, 03, Pattern Library, Recipe Library, Screen Blueprint Spec, Rendering Spec, Engineering-to-Pattern Mapping, Figma Build Roadmap.
4. **Load governance.** Load Documentation Constitution and Documentation Dependency Map.
5. **Build context map.** Create an in-memory map of: entities, states, APIs, permissions, tokens, components, patterns, recipes, and rendering rules relevant to the target screen.

### Validation

| Check | Rule |
|-------|------|
| All 9 UI/UX docs loaded | Verify each file was read completely |
| Relevant Engineering Spec loaded | Verify the correct domain spec is loaded |
| Workspace Catalogue loaded | Verify screen is locatable |
| Context map complete | Verify all relevant entities, APIs, tokens, and components are mapped |

### Failure Conditions

| Failure | Recovery |
|---------|----------|
| Document not found | Flag the gap; check alternative file locations; escalate if unresolved |
| Document is empty | Flag the gap; check version history; escalate |
| Document conflicts with another | Flag the conflict; apply authority hierarchy (section 1.3); escalate if unresolved |
| Screen not in Workspace Catalogue | Flag the gap; check Engineering Specs for screen definition; escalate |

---

## 6.2 Stage: Specification Validation

| Field | Value |
|-------|-------|
| **Role** | Repository Architect |
| **Inputs** | Loaded context, target screen identifier |
| **Outputs** | Validated technical context |
| **Decision Rules** | Verify the target screen has a complete technical foundation before proceeding. |

### Process

1. **Locate screen in Workspace Catalogue.** Extract: screen name, module, user role, navigation context.
2. **Locate screen in Engineering Specification.** Extract: entity definitions, states, API endpoints, business rules, permissions.
3. **Verify cross-references.** Ensure the Engineering Specification references the same entities and workflows as the Workspace Catalogue.
4. **Map domain events.** Identify which domain events affect this screen (from Platform Event Catalogue).
5. **Build technical context.** Compile entity mapping, API mapping, business rule extraction, and permission model.

### Validation

| Check | Rule |
|-------|------|
| Screen exists in Catalogue | Screen name matches catalogue entry exactly |
| Engineering Spec is approved | Spec status is "Approved" or "Frozen" |
| Entity mapping complete | Every data element in the screen maps to an entity field |
| API mapping complete | Every action maps to an API endpoint |
| Permission model defined | Every action has a permission string |

### Failure Conditions

| Failure | Recovery |
|---------|----------|
| Screen not in Catalogue | Flag gap; check engineering spec; escalate |
| Engineering Spec not approved | STOP; do not generate from draft specs |
| Entity undefined | Flag gap; document what entity is needed; escalate |
| API undefined | Flag gap; document what API is needed; escalate |
| Permissions undefined | Flag gap; default to deny; escalate |

---

## 6.3 Stage: Blueprint Parsing

| Field | Value |
|-------|-------|
| **Role** | Information Architect |
| **Inputs** | Technical context, Screen Blueprint Specification |
| **Outputs** | Validated screen blueprint |
| **Decision Rules** | If no blueprint exists, author one. If blueprint exists, validate it. |

### Process

1. **Check for existing blueprint.** Search `ui-ux/screen-blueprints/` for a blueprint matching the target screen.
2. **If blueprint exists:**
   a. Validate against all 24 rules (V01-V24).
   b. Validate against all 30 checks (C01-C30).
   c. If all pass, proceed with the validated blueprint.
   d. If any fail, repair the blueprint and re-validate.
3. **If no blueprint exists:**
   a. Author a new blueprint using the canonical template (Screen Blueprint Specification section 8.1).
   b. Fill all mandatory metadata (section 9).
   c. Populate all 22 template sections.
   d. Run V01-V24 and C01-C30 validation.
   e. If validation passes, proceed.
   f. If validation fails, repair and re-validate.

### Blueprint Validation Rules (Summary)

| Rule | Category | Check |
|------|----------|-------|
| V01 | Format | Blueprint ID matches `SB-[MODULE]-[CLASS]-[SEQ]` |
| V02 | Uniqueness | Blueprint ID is globally unique |
| V03 | Reference | Screen name matches Workspace Catalogue |
| V04 | Enumeration | Classification is one of 15 approved codes |
| V05 | Reference | Module is one of 10 approved domains |
| V06 | Reference | Workspace exists in Catalogue |
| V07 | Reference | Engineering Spec reference is valid |
| V08 | Completeness | Purpose is non-empty |
| V09 | Completeness | Primary persona specified |
| V10 | Completeness | Primary goal is singular |
| V11 | Completeness | Information hierarchy has all 3 tiers |
| V12 | Completeness | Exactly one primary task |
| V13 | Completeness | At least one navigation entry point |
| V14 | Reference | Pattern is from approved list |
| V15 | Completeness | Pattern rationale provided |
| V16 | Completeness | All 6 screen states documented |
| V17 | Reference | Required data has source references |
| V18 | Reference | Actions have permission references |
| V19 | Format | Permission string matches `{domain}:{resource}:{action}` |
| V20 | Uniqueness | No duplicate blueprint IDs |
| V21 | Format | Version matches `Major.Minor` |
| V22 | Completeness | Outstanding decisions documented |
| V23 | Reference | All cross-references valid |
| V24 | Compliance | Terminology matches Constitution |

### Failure Conditions

| Failure | Recovery |
|---------|----------|
| Blueprint validation fails | Repair the specific failing section; re-validate; if unrecoverable, escalate |
| Insufficient information to author blueprint | Flag the gap; document what is missing; escalate |
| Blueprint conflicts with Engineering Spec | Engineering Spec takes precedence; flag the conflict; escalate |

---

## 6.4 Stage: Pattern Selection

| Field | Value |
|-------|-------|
| **Role** | Pattern Selector |
| **Inputs** | Validated blueprint, Pattern Library, Engineering-to-Pattern Mapping |
| **Outputs** | Selected pattern ID, variant, rationale |
| **Decision Rules** | Follow the deterministic algorithm in section 7.1 exactly. |

### Process

1. **Read blueprint Screen Classification code.** This is the primary input.
2. **Apply section 7.1 algorithm.** Follow the decision tree to select the pattern.
3. **Verify pattern exists.** Confirm the selected pattern is in the Pattern Library.
4. **Select variant if applicable.** If the pattern has variants, select the correct one based on the blueprint data requirements.
5. **Check Engineering-to-Pattern Mapping.** Cross-reference the selection with the mapping document to verify consistency.
6. **Document selection.** Record: selected pattern ID, variant, rationale, and algorithm path.

### Validation

| Check | Rule |
|-------|------|
| Pattern exists in Library | Verified against Pattern Library |
| Selection is algorithmic | Traceable to section 7.1 decision tree |
| Variant is approved | If variant selected, it exists in Pattern Library |
| Mapping consistent | Selection consistent with Engineering-to-Pattern Mapping |

### Failure Conditions

| Failure | Recovery |
|---------|----------|
| No pattern matches classification | Flag gap in Pattern Library; document the need; escalate |
| Pattern exists but variant does not | Use base pattern; flag variant gap; escalate |
| Mapping contradicts selection | Blueprint classification takes precedence; flag inconsistency; escalate |

---

## 6.5 Stage: Recipe Selection

| Field | Value |
|-------|-------|
| **Role** | Recipe Selector |
| **Inputs** | Selected pattern, validated blueprint, Component Recipe Library |
| **Outputs** | Selected recipe ID(s), component tables |
| **Decision Rules** | Follow the deterministic algorithm in section 7.2 exactly. |

### Process

1. **Read blueprint data requirements and actions.** These determine which recipe(s) are needed.
2. **Apply section 7.2 algorithm.** Follow the decision tree to select the recipe.
3. **Verify recipe exists.** Confirm the selected recipe is in the Component Recipe Library.
4. **Verify component coverage.** Ensure the recipe components cover all blueprint data elements and actions.
5. **Check for multi-recipe screens.** Some screens require multiple recipes (e.g., header + content). Identify all needed recipes.
6. **Document selection.** Record: selected recipe ID(s), component tables, rationale.

### Validation

| Check | Rule |
|-------|------|
| Recipe exists in Library | Verified against Recipe Library |
| Selection is algorithmic | Traceable to section 7.2 decision tree |
| Component coverage complete | Recipe components cover all blueprint data elements |
| Action coverage complete | Recipe actions cover all blueprint actions |

### Failure Conditions

| Failure | Recovery |
|---------|----------|
| No recipe matches | Flag gap; compose from pattern guidance with explicit documentation; escalate |
| Recipe components insufficient | Flag gap; identify missing components; compose from approved components; escalate |
| Recipe actions insufficient | Flag gap; identify missing actions; document; escalate |

---

## 6.6 Stage: Layout Composition

| Field | Value |
|-------|-------|
| **Role** | Layout Composer |
| **Inputs** | Selected recipe(s), pattern layout rules, Design System, Rendering Specification |
| **Outputs** | Deterministic layout specification |
| **Decision Rules** | Follow the Rendering Specification section 7 (grid), section 13 (spacing), and recipe component order. |

### Process

1. **Determine grid configuration.** Desktop: 12 columns. Tablet: 8 columns. Mobile: 4 columns.
2. **Apply sidebar proportion.** Sidebar: approximately 1/5 of workspace width (Rendering Spec section 7.3). Canvas: >= 3/5 of workspace width (section 7.5).
3. **Arrange components per recipe order.** Follow the recipe Component Order field exactly.
4. **Apply spacing scale.** Use only Space-1 through Space-8 from the approved scale (section 13.1).
5. **Apply density tier.** Determine the screen density tier from the blueprint (Compact, Standard, or Comfortable).
6. **Apply proportional sizing.** All dimensions as proportions of reference frame; no fixed pixels except minimums (section 13.7).
7. **Define responsive adaptations.** For each breakpoint: column count, component stacking/hiding, spacing adjustments.
8. **Document the layout.** Record: component positions, sizes, arrangement, spacing values, responsive rules.

### Validation

| Check | Rule |
|-------|------|
| Grid alignment | All components align to grid columns |
| Spacing scale | All spacing values from approved scale |
| Component order | Matches recipe specification |
| Density tier | Consistent within each surface |
| Proportional sizing | No fixed pixel values (except minimums) |
| Responsive rules | Defined for all 3 breakpoints |

### Failure Conditions

| Failure | Recovery |
|---------|----------|
| Components exceed grid | Re-arrange using responsive wrapping; flag if impossible |
| Spacing outside scale | Replace with nearest approved value; document the change |
| Recipe order conflicts with pattern | Pattern layout takes precedence; document the deviation |
| Density tier mismatch | Standardise to one tier per surface; document |

---

## 6.7 Stage: Hierarchy Validation

| Field | Value |
|-------|-------|
| **Role** | Information Architect (re-validation) |
| **Inputs** | Layout specification, blueprint information hierarchy |
| **Outputs** | Validated hierarchy alignment |
| **Decision Rules** | Verify the layout visual hierarchy matches the blueprint information hierarchy. |

### Process

1. **Map blueprint tiers to layout positions.** Tier 1 elements MUST be in the most prominent positions (top, large, bold). Tier 2 elements secondary. Tier 3 elements tertiary.
2. **Verify single focal point.** Exactly one Focal Point per screen (Rendering Spec section 5.1).
3. **Verify hierarchy legibility.** Hierarchy MUST be legible in grayscale (Rendering Spec section 6.1).
4. **Verify maximum 4 tiers.** Maximum 4 hierarchy tiers per screen: Primary, Secondary, Tertiary, Quiet (section 6.1).

### Validation

| Check | Rule |
|-------|------|
| Tier 1 prominence | Most prominent position, size, and weight |
| Single focal point | Exactly one per screen |
| Grayscale legibility | Hierarchy readable without colour |
| Max 4 tiers | No more than 4 hierarchy levels |

### Failure Conditions

| Failure | Recovery |
|---------|----------|
| Multiple focal points | Reduce to one; re-arrange other elements to secondary positions |
| Hierarchy not legible in grayscale | Increase size/weight differences; reduce reliance on colour |
| More than 4 tiers | Merge tiers; simplify hierarchy |

---

## 6.8 Stage: Rendering

| Field | Value |
|-------|-------|
| **Role** | Visual Renderer |
| **Inputs** | Layout specification, Rendering Specification (all chapters), Design Tokens |
| **Outputs** | Visually complete design with all tokens applied |
| **Decision Rules** | Every visual property MUST trace to an approved token or rule. Zero exceptions. |

### Process

1. **Apply materials.** Determine Glass vs. Solid for each surface (Rendering Spec section 8). Top bar: Glass. Data surfaces: Solid. Floating surfaces: per section 26.
2. **Apply colour system.** Brand Primary for primary actions and active nav. Semantic for status. Neutral for backgrounds, borders, text. Module Accent for module icons only (section 9).
3. **Apply typography.** Select type scale step for each text element. Apply weight, size, line height from tokens (section 12). Maximum 2 typeface families, 3 weights.
4. **Apply elevation.** Level 0-4 based on surface type and state (section 11). Shadows: soft-edged, vertical-only.
5. **Apply spacing.** All padding, margin, gap from spacing scale (section 13). Outer spacing >= inner spacing at every nesting level (section 13.2).
6. **Apply iconography.** Use approved icon set. Icon sizes from tokens. Consistent style (section 14).
7. **Apply motion.** Define transitions per tier (section 18): Instant (100-200ms), Standard (200-320ms), Deliberate (320-480ms). Easing: ease-out for entrances, ease-in for exits.
8. **Apply interaction states.** All 5 mandatory states for every interactive element: Idle, Hover, Active, Disabled, Focus (section 19). Disabled opacity: 38%-48%.
9. **Apply module personality.** If applicable, apply module-specific colour accent per section 20.
10. **Verify zero hard-coded values.** Every visual property must trace to an approved token.

### Validation

| Check | Rule |
|-------|------|
| Materials correct | Glass/Solid per Rendering Specification section 8 |
| Colour system correct | Brand/Semantic/Neutral per section 9 |
| Typography correct | Type scale, weights, line heights per section 12 |
| Elevation correct | Level 0-4 per section 11 |
| Spacing correct | Scale values per section 13 |
| Icons correct | Approved set, sizes per section 14 |
| Motion defined | Tier-based durations per section 18 |
| States defined | 5 mandatory states per section 19 |
| Zero hard-coded values | Every property traces to a token |

### Failure Conditions

| Failure | Recovery |
|---------|----------|
| Token not found | Flag gap; use nearest approved value; document; escalate |
| Material conflict | Apply Rendering Specification section 8 rules; resolve per hierarchy |
| Colour contrast failure | Adjust within approved palette; re-check accessibility |
| Hard-coded value detected | Replace with nearest token; document the change |

---

## 6.9 Stage: Accessibility

| Field | Value |
|-------|-------|
| **Role** | Accessibility Validator |
| **Inputs** | Complete design, Rendering Specification section 22, Blueprint accessibility requirements |
| **Outputs** | Accessibility compliance report |
| **Decision Rules** | WCAG 2.1 AA is the minimum. If any check fails, the ENTIRE design fails. |

### Process

1. **Check colour contrast.** Text: >= 4.5:1. Non-text: >= 3:1. Large text: >= 3:1 (section 22.3).
2. **Check touch targets.** All interactive elements >= 44px (section 22.4).
3. **Check keyboard navigation.** All interactive elements keyboard-accessible. Logical tab order (section 22.5).
4. **Check focus management.** Visible focus ring meeting AA non-text contrast. Focus order follows visual order (section 22.6).
5. **Check screen reader.** All content readable without visual context. ARIA labels on interactive elements (section 22.7).
6. **Check reduced motion.** All animations respect prefers-reduced-motion (section 22.8).
7. **Check colour independence.** No information conveyed by colour alone (section 22.9).
8. **Check text alternatives.** All images have alt text. All icons have labels (section 22.10).
9. **Check form accessibility.** All form fields have labels. Error messages are associated with fields (section 22.11).
10. **Check content structure.** Heading hierarchy is logical. Landmark regions are defined (section 22.12).

### Validation

| Check | Rule | Threshold |
|-------|------|-----------|
| Text contrast | >= 4.5:1 | WCAG AA |
| Non-text contrast | >= 3:1 | WCAG AA |
| Large text contrast | >= 3:1 | WCAG AA |
| Touch targets | >= 44px | WCAG AAA (target size) |
| Keyboard navigation | All elements accessible | WCAG 2.1.1 |
| Focus visibility | Visible focus ring | WCAG 2.4.7 |
| Reduced motion | Respects prefers-reduced-motion | WCAG 2.3.3 |
| Colour independence | Not sole indicator | WCAG 1.4.1 |
| Alt text | All images/icons | WCAG 1.1.1 |
| Form labels | All fields labeled | WCAG 1.3.1 |
| Heading hierarchy | Logical structure | WCAG 1.3.1 |

### Failure Conditions

| Failure | Recovery |
|---------|----------|
| Any contrast failure | Adjust colours within approved palette; re-check |
| Touch target too small | Increase size to minimum 44px |
| Keyboard trap | Fix navigation order; ensure escape paths |
| Missing focus ring | Add visible focus ring per section 22.6 |
| Missing ARIA label | Add appropriate ARIA label |
| Animation not respecting reduced-motion | Add prefers-reduced-motion media query |
| Colour-only information | Add text/icon alternative |

---

## 6.10 Stage: Responsiveness

| Field | Value |
|-------|-------|
| **Role** | Responsive Validator |
| **Inputs** | Design at all breakpoints, Rendering Specification section 7.6, Design System section 1.12 |
| **Outputs** | Responsive compliance report |
| **Decision Rules** | All 3 breakpoints MUST pass. Material, colour, typography, and radius MUST NOT change between breakpoints. |

### Process

1. **Verify desktop layout.** 12-column grid. Sidebar expanded. Full component arrangement.
2. **Verify tablet layout.** 8-column grid. Sidebar collapsed to icon rail or overlay. Components may reflow.
3. **Verify mobile layout.** 4-column grid. Sidebar as drawer. Components stack vertically.
4. **Verify component adaptation.** Each component adapts correctly: tables become card lists, multi-column forms become single-column, etc.
5. **Verify spacing proportionality.** Spacing scales proportionally with viewport; outer spacing >= inner spacing.
6. **Verify visual consistency.** Material, colour, typography, radius, shadow scale DO NOT change between breakpoints (section 7.6.3).

### Validation

| Check | Rule |
|-------|------|
| Desktop 12-col | Grid correct, sidebar expanded |
| Tablet 8-col | Grid correct, sidebar collapsed |
| Mobile 4-col | Grid correct, sidebar as drawer |
| Component adaptation | Correct stacking/hiding/reflow |
| Spacing proportionality | Scales with viewport |
| Visual consistency | No material/colour/typography/radius changes |

### Failure Conditions

| Failure | Recovery |
|---------|----------|
| Grid columns incorrect | Adjust to correct column count |
| Component not adapting | Define adaptation rules per component |
| Spacing not proportional | Rescale using approved values |
| Visual property changes between breakpoints | Revert to desktop values; only layout may change |

---

## 6.11 Stage: QA

| Field | Value |
|-------|-------|
| **Role** | Design QA Reviewer |
| **Inputs** | Complete design, all validation reports, Figma Standards section 6 |
| **Outputs** | QA pass/fail report |
| **Decision Rules** | All 24 QA checks from Figma Build Roadmap section 9 MUST pass. |

### Process

Run the master QA checklist (24 checks across 9 categories):

| Category | Checks | Rules |
|----------|--------|-------|
| Component Reuse | 3 | Library instances only; no detached; no unjustified detached |
| Variable Usage | 3 | No hard-coded colours; no hard-coded spacing; no hard-coded typography |
| Token Compliance | 3 | Brand tokens correct; Semantic tokens correct; Neutral tokens correct |
| Alignment | 2 | Grid alignment; consistent spacing |
| Typography | 2 | Hierarchy consistent; sizes from type scale |
| Accessibility | 3 | Contrast >= 4.5:1; touch targets >= 44px; keyboard navigation |
| Responsive | 3 | Desktop correct; tablet correct; mobile correct |
| Naming | 3 | File naming; frame naming; layer naming |
| Documentation | 3 | Component descriptions; screen annotations; interaction notes |

### Validation

| Check | Rule |
|-------|------|
| 24/24 checks pass | All checks must pass |
| No outstanding issues | Zero unresolved findings |
| Documentation complete | All annotations and notes present |

### Failure Conditions

| Failure | Recovery |
|---------|----------|
| Any QA check fails | Fix the specific issue; re-run the check; if systemic, escalate |
| Outstanding issues remain | Resolve each issue individually; re-check |

---

## 6.12 Stage: Figma Generation

| Field | Value |
|-------|-------|
| **Role** | Figma Engineer |
| **Inputs** | Validated design, Figma Standards sections 1-4, Figma MCP tools |
| **Outputs** | Production-quality Figma page |
| **Decision Rules** | Follow all construction standards in section 8 and section 9. Every Figma object must be traceable to the validated design. |

### Process

1. **Create page.** Follow page naming convention (section 8.1).
2. **Create frame hierarchy.** Top-level frame per breakpoint. Nested frames per section.
3. **Apply auto layout.** All frames use auto layout with correct direction, spacing, and padding.
4. **Insert component instances.** Use library instances only. Never detach.
5. **Apply variable bindings.** Bind all visual properties to approved variables.
6. **Apply constraints.** Set responsive constraints per component type.
7. **Create responsive variants.** Desktop, tablet, mobile frames with correct adaptations.
8. **Apply naming conventions.** Frame names, layer names per section 8.3.
9. **Add documentation.** Component descriptions, screen annotations, interaction notes.
10. **Create prototype connections.** If applicable, link screens with navigation flows.

### Validation

| Check | Rule |
|-------|------|
| Page structure correct | Follows section 8.1 |
| Frame hierarchy correct | Logical nesting, proper auto layout |
| Components are instances | Zero detached components |
| Variables bound | All visual properties use variables |
| Constraints applied | Responsive constraints set |
| Naming correct | Follows conventions |
| Documentation present | All annotations complete |

### Failure Conditions

| Failure | Recovery |
|---------|----------|
| MCP tool failure | Retry; if persistent, document and escalate |
| Component not in library | Flag gap; do not create ad-hoc; escalate |
| Variable not available | Use nearest approved value; flag gap; escalate |
| Auto layout conflict | Adjust arrangement; document the workaround |

---

## 6.13 Stage: Output Verification

| Field | Value |
|-------|-------|
| **Role** | Final Reviewer |
| **Inputs** | Figma output, all validation reports, generation log |
| **Outputs** | Final pass/fail, generation report, validation summary |
| **Decision Rules** | The output is complete ONLY if every stage has passed its validation. |

### Process

1. **Re-read the screen blueprint.** Load the blueprint from section 6.3 output.
2. **Compare Figma output against blueprint.** Verify: data elements displayed, actions available, states implemented, navigation correct, permissions reflected.
3. **Verify generation report.** Review the complete audit trail of decisions.
4. **Verify validation summary.** Confirm all stages passed validation.
5. **Produce final verdict.** PASS if all checks succeed. FAIL if any check fails.

### Validation

| Check | Rule |
|-------|------|
| Output matches blueprint | All blueprint requirements satisfied |
| Generation report complete | Every decision has a traceable source |
| All stages passed | No stage has a failing status |
| No gaps | All data elements, actions, and states implemented |
| No improvisations | Every choice traces to a specification |

### Failure Conditions

| Failure | Recovery |
|---------|----------|
| Output does not match blueprint | Identify mismatch; return to the stage that introduced it; fix and re-validate |
| Generation report incomplete | Complete the report; fill missing entries |
| Stage failed | Return to failed stage; resolve; re-validate all subsequent stages |
| Gaps found | Document gaps; escalate; do not ship with gaps |
| Improvisations found | Identify source; replace with specification-based decision; document |


---

# 7. Decision Algorithms

---

## 7.1 Pattern Selection Algorithm

This algorithm MUST be followed exactly. No subjective judgment is permitted.

### Input

The primary input is the **Screen Classification code** from the screen blueprint (Screen Blueprint Specification section 10.1).

### Decision Tree

```
START
  |
  v
Read Screen Classification Code
  |
  +-- DASH (Dashboard)
  |     |
  |     v
  |   Has KPI/stat cards? ---YES---> PAT-DASH-01 (Dashboard Overview)
  |     |                           |
  |     NO                          +-- Has chart-heavy content? ---YES---> PAT-DASH-02 (Analytics Dashboard)
  |     |                           |
  |     v                           NO
  |   Primarily navigation? ---YES---> PAT-WORK-01 (Workspace Landing)
  |     |
  |     NO
  |     |
  |     v
  |   PAT-DASH-01 (default for DASH)
  |
  +-- CRUD (CRUD Workspace)
  |     |
  |     v
  |   Has data table with > 10 records? ---YES---> PAT-WORK-02 (List Workspace)
  |     |                                         |
  |     NO                                        +-- Needs advanced filtering? ---YES---> PAT-WORK-03 (Filtered List)
  |     |                                         |
  |     v                                         NO
  |   Has < 10 records? ---YES---> PAT-WORK-02 (List Workspace - compact variant)
  |     |
  |     NO
  |     |
  |     v
  |   PAT-WORK-02 (default for CRUD)
  |
  +-- DTL (Detail Workspace)
  |     |
  |     v
  |   Has tabbed sub-views? ---YES---> PAT-WORK-04 (Detail View with Tabs)
  |     |                              |
  |     NO                             +-- Sub-views are read-only? ---YES---> PAT-WORK-05 (Read-Only Detail)
  |     |                              |
  |     v                              NO
  |   Single-view detail? ---YES---> PAT-WORK-04 (Detail View)
  |     |
  |     v
  |   PAT-WORK-04 (default for DTL)
  |
  +-- PRF (Profile)
  |     |
  |     v
  |   PAT-WORK-05 (Profile View)
  |
  +-- WIZ (Wizard)
  |     |
  |     v
  |   Steps < 5? ---YES---> PAT-FORM-03 (Short Wizard)
  |     |                   |
  |     NO                  +-- Has file uploads? ---YES---> PAT-FORM-04 (Wizard with Uploads)
  |     |                   |
  |     v                   NO
  |   PAT-FORM-03 (default short wizard)
  |
  |   Steps >= 5? ---YES---> PAT-FORM-05 (Long Wizard with Progress)
  |
  +-- ANL (Analytics)
  |     |
  |     v
  |   PAT-DASH-02 (Analytics Dashboard)
  |
  +-- RPT (Reports)
  |     |
  |     v
  |   Has data table? ---YES---> PAT-RPT-01 (Report with Table)
  |     |                        |
  |     NO                       +-- Has charts? ---YES---> PAT-RPT-02 (Report with Charts)
  |     |                        |
  |     v                        NO
  |   PAT-RPT-01 (default for RPT)
  |
  +-- CAL (Calendar)
  |     |
  |     v
  |   PAT-WORK-06 (Calendar View)
  |
  +-- COM (Communication)
  |     |
  |     v
  |   Has message thread? ---YES---> PAT-COMM-01 (Message Thread)
  |     |                            |
  |     NO                           +-- Has compose form? ---YES---> PAT-COMM-02 (Compose View)
  |     |                            |
  |     v                            NO
  |   PAT-COMM-01 (default for COM)
  |
  +-- SRC (Search)
  |     |
  |     v
  |   PAT-WORK-02 (List Workspace with search focus)
  |
  +-- AIW (AI Workspace)
  |     |
  |     v
  |   Has chat interface? ---YES---> PAT-AI-01 (AI Chat)
  |     |                            |
  |     NO                           +-- Has insights panel? ---YES---> PAT-AI-02 (AI Insights)
  |     |                            |
  |     v                            NO
  |   PAT-AI-01 (default for AIW)
  |
  +-- AUTH (Authentication)
  |     |
  |     v
  |   PAT-AUTH-01 (Auth Layout)
  |
  +-- SET (Settings)
  |     |
  |     v
  |   Has tabbed sections? ---YES---> PAT-WORK-07 (Settings with Tabs)
  |     |                             |
  |     NO                            +-- Single section? ---YES---> PAT-FORM-01 (Single Form)
  |     |                             |
  |     v                             NO
  |   PAT-WORK-07 (default for SET)
  |
  +-- MON (Monitoring)
  |     |
  |     v
  |   PAT-DASH-01 (Dashboard Overview - monitoring variant)
  |
  +-- ADM (Administration)
  |     |
  |     v
  |   PAT-WORK-02 (List Workspace - admin variant)
  |
  +-- UNKNOWN/MISSING
        |
        v
      FLAG: Screen classification not recognized
      ESCALATE: Do not proceed
```

### Post-Selection Validation

After selecting a pattern, the algorithm MUST:

1. Verify the pattern exists in the Pattern Library (47 approved patterns).
2. Verify the pattern variant (if selected) is approved.
3. Verify the pattern component requirements are achievable with approved Design System components.
4. Record the algorithm path (which branches were taken).
5. If any verification fails, STOP and escalate.

---

## 7.2 Recipe Selection Algorithm

This algorithm MUST be followed exactly after pattern selection is complete.

### Input

The inputs are: the **selected pattern**, the **screen blueprint** (data requirements, actions, screen states), and the **Component Recipe Library**.

### Decision Tree

```
START
  |
  v
Read Selected Pattern
  |
  +-- Pattern is PAT-DASH-01 or PAT-DASH-02 (Dashboard)
  |     |
  |     v
  |   Primary purpose? ---KPIs at a glance---> RC-DASH-KPI-PANEL-1
  |     |
  |     +--- Multiple metrics grid---> RC-DASH-METRIC-GRID-1
  |     |
  |     +--- Academic performance---> RC-DASH-PERF-SUMMARY-1
  |     |
  |     +--- Attendance overview---> RC-DASH-ATTENDANCE-OVERVIEW-1
  |     |
  |     +--- Financial summary---> RC-DASH-FIN-SNAPSHOT-1
  |     |
  |     +--- Navigation + quick actions---> RC-DASH-QUICK-ACTIONS-1
  |     |
  |     +--- Recent activity---> RC-DASH-RECENT-ACTIVITY-1
  |     |
  |     +--- Upcoming events---> RC-DASH-UPCOMING-EVENTS-1
  |     |
  |     v
  |   Default: RC-DASH-KPI-PANEL-1
  |
  +-- Pattern is PAT-WORK-02 or PAT-WORK-03 (List Workspace)
  |     |
  |     v
  |   Has search AND > 20 records? ---YES---> RC-DATA-TABLE-WORKSPACE-1
  |     |                                    |
  |     NO                                   +--- Also needs import? ---YES---> Add RC-DATA-IMPORT-PANEL-1
  |     |                                    |
  |     |                                    +--- Also needs export? ---YES---> Add RC-DATA-EXPORT-PANEL-1
  |     |                                    |
  |     v                                    NO
  |   Has < 20 records? ---YES---> Domain-specific roster (e.g., RC-STU-CLASS-ROSTER-1)
  |     |
  |     v
  |   Default: RC-DATA-TABLE-WORKSPACE-1
  |
  +-- Pattern is PAT-WORK-04 or PAT-WORK-05 (Detail View)
  |     |
  |     v
  |   Entity is Student? ---YES---> RC-STU-DETAIL-HEADER-1 + domain sub-view
  |     |
  |     NO
  |     |
  |     +--- Entity is Staff? ---YES---> RC-ADMIN-STAFF-DIRECTORY-1 (card variant)
  |     |
  |     +--- Entity is Invoice? ---YES---> RC-FIN-INVOICE-PREVIEW-1
  |     |
  |     v
  |   Compose from pattern guidance (PAT-WORK-04)
  |
  +-- Pattern is PAT-FORM-01 or PAT-FORM-02 (Form)
  |     |
  |     v
  |   Fields < 8 AND single-step? ---YES---> Compose from PAT-FORM-01 guidance
  |     |
  |     +--- Fields >= 8? ---YES---> Compose from PAT-FORM-02 guidance
  |     |
  |     +--- Has conditional fields? ---YES---> Compose from PAT-FORM-CONDITIONAL guidance
  |     |
  |     +--- Quick inline edit? ---YES---> Compose from PAT-FORM-QUICK guidance
  |
  +-- Pattern is PAT-FORM-03, PAT-FORM-04, or PAT-FORM-05 (Wizard)
  |     |
  |     v
  |   Enrollment-related? ---YES---> RC-STU-ENROLLMENT-WIZARD-1
  |     |
  |     +--- School setup? ---YES---> RC-ADMIN-SCHOOL-SETUP-1
  |     |
  |     +--- Exam-related? ---YES---> RC-PLAN-EXAM-TIMETABLE-1
  |     |
  |     v
  |   Default: Compose from PAT-FORM-03/04/05 guidance
  |
  +-- Pattern is PAT-RPT-01 or PAT-RPT-02 (Report)
  |     |
  |     v
  |   Financial report? ---YES---> RC-FIN-FEE-COLLECTION-1 or RC-FIN-BUDGET-TRACKER-1
  |     |
  |     +--- Academic report? ---YES---> RC-STU-REPORT-CARD-1
  |     |
  |     v
  |   Compose from pattern guidance (PAT-RPT-01/02)
  |
  +-- Pattern is PAT-COMM-01 or PAT-COMM-02 (Communication)
  |     |
  |     v
  |   Announcement? ---YES---> RC-COMM-ANNOUNCEMENT-COMPOSER-1
  |     |
  |     +--- Message thread? ---YES---> RC-COMM-MESSAGE-THREAD-1
  |     |
  |     +--- Template? ---YES---> RC-COMM-TEMPLATE-EDITOR-1
  |     |
  |     v
  |   Compose from pattern guidance
  |
  +-- Pattern is PAT-AI-01 or PAT-AI-02 (AI)
  |     |
  |     v
  |   Chat interface? ---YES---> RC-AI-CHAT-1
  |     |
  |     +--- Insights panel? ---YES---> RC-AI-INSIGHTS-PANEL-1
  |     |
  |     +--- Predictive? ---YES---> RC-AI-PREDICTIVE-1
  |     |
  |     +--- Recommendation feed? ---YES---> RC-AI-RECOMMENDATION-FEED-1
  |
  +-- Pattern is PAT-WORK-06 (Calendar)
  |     |
  |     v
  |   Academic calendar? ---YES---> RC-ACAD-CALENDAR-1
  |     |
  |     +--- Exam timetable? ---YES---> RC-PLAN-EXAM-TIMETABLE-1
  |     |
  |     +--- Staff schedule? ---YES---> RC-PLAN-STAFF-SCHEDULE-1
  |     |
  |     v
  |   Default: Compose from PAT-WORK-06 guidance
  |
  +-- Pattern is PAT-WORK-07 (Settings)
  |     |
  |     v
  |   Notification preferences? ---YES---> RC-COMM-NOTIF-PREFERENCES-1
  |     |
  |     v
  |   Compose from PAT-WORK-07 guidance
  |
  +-- UNKNOWN PATTERN
        |
        v
      FLAG: No recipe mapping for this pattern
      ESCALATE: Do not proceed
```

### Post-Selection Validation

After selecting a recipe, the algorithm MUST:

1. Verify the recipe exists in the Component Recipe Library (55 approved recipes).
2. Verify the recipe components cover ALL blueprint data elements.
3. Verify the recipe actions cover ALL blueprint actions.
4. If the recipe is insufficient, identify gaps and flag them.
5. Record the algorithm path.
6. If any verification fails, STOP and escalate.

---

## 7.3 Layout Composition Algorithm

Once a recipe is selected, this algorithm determines the exact component arrangement.

### Input

The inputs are: the **selected recipe** (component table with order), the **pattern layout rules**, the **Rendering Specification grid system**, and the **spacing scale**.

### Algorithm

```
START
  |
  v
Read Recipe Component Table
  |
  v
Determine Layout Template
  |
  +--- Recipe is Dashboard (5A)? ---> Use Dashboard Template
  |     Stat cards: max 4 per row, horizontal flex
  |     Charts: full width or half width
  |     Tables: full width
  |
  +--- Recipe is Data/Table (5B)? ---> Use CRUD List Template
  |     Search: full width top
  |     Filters: collapsible below search
  |     Table: fills remaining space
  |     Pagination: below table
  |
  +--- Recipe is Detail (5C, DTL)? ---> Use Detail View Template
  |     Header: full width top
  |     Tabs: below header
  |     Content: fills remaining space
  |
  +--- Recipe is Form (all Form recipes)? ---> Use Form Layout Template
  |     Single column for < 6 fields
  |     Two columns for 6-12 fields
  |     Actions: bottom right
  |
  +--- Recipe is Wizard? ---> Use Wizard Template
  |     Progress bar: full width top
  |     Step content: fills middle
  |     Navigation: bottom (back left, next right)
  |
  +--- Recipe is Report? ---> Use Report Template
  |     Filters: top
  |     Charts: upper section
  |     Table: lower section
  |     Actions: top right
  |
  +--- Recipe is Calendar? ---> Use Calendar Template
  |     Month header: top
  |     Grid: 7 columns x 5-6 rows
  |     Events: sidebar
  |
  +--- Default: ---> Use Layout from Pattern Library
  |
  v
Apply Grid System
  |
  Desktop: 12 columns
  Tablet: 8 columns
  Mobile: 4 columns
  |
  v
Apply Spacing
  |
  Outer margin: Space-6 or Space-7
  Between sections: Space-4 or Space-5
  Between items: Space-3
  Inner padding: Space-2 or Space-3
  |
  v
Apply Density Tier
  |
  Compact: minimize padding, maximize data
  Standard: balanced
  Comfortable: maximum breathing room
  |
  v
Apply Proportional Sizing
  |
  All dimensions as % of parent
  No fixed pixels (except min 44px touch targets)
  |
  v
Define Responsive Adaptations
  |
  Desktop (12-col): full layout
  Tablet (8-col): sidebar collapse, component reflow
  Mobile (4-col): stack vertically, sidebar drawer
  |
  v
Document Layout Specification
  |
  Component positions, sizes, arrangement
  Spacing values per surface
  Responsive rules per breakpoint
  |
  v
END
```

---

# 8. Figma Construction Standards

---

## 8.1 Page Organization

### File Structure

The Figma project MUST follow the structure defined in the Figma Build Roadmap and Figma Standards (03 doc).

```
DS - OpenSchool (Design System File)
  |
  +-- Pages
       +-- Tokens (design tokens, variables)
       +-- Components (all component definitions)
       +-- Patterns (pattern compositions)
       +-- Icons (icon library)
       +-- Documentation (component docs)

Product - [Module Name] (Product Files, one per module)
  |
  +-- Pages
       +-- Screens (all screen designs)
       +-- Prototypes (prototype flows)
       +-- Documentation (screen docs)
       +-- Handoff (developer handoff)
```

### Product File Naming

| Module | File Name |
|--------|-----------|
| Identity & Access | Product - Identity & Access |
| Institution Management | Product - Institution |
| People | Product - People |
| Academic Management | Product - Academics |
| Finance | Product - Finance |
| Communication | Product - Communication |
| Operations | Product - Operations |
| Documents & Learning | Product - Documents |
| Reporting & Analytics | Product - Reporting |
| Platform Administration | Product - Platform Admin |

### Page Naming Convention

```
Screens - [Module Name] - [Pattern Type]
```

Examples:
- `Screens - People - CRUD Lists`
- `Screens - Finance - Detail Views`
- `Screens - Academics - Wizards`
- `Screens - Dashboards - Overview`

### Section Organization

Within each page, group screens by pattern type:

```
Section: List Views
  Frame: Student List - Desktop
  Frame: Student List - Tablet
  Frame: Student List - Mobile

Section: Detail Views
  Frame: Student Detail - Desktop
  Frame: Student Detail - Tablet
  Frame: Student Detail - Mobile

Section: Forms
  Frame: Enrollment Form - Desktop
  Frame: Enrollment Form - Tablet
  Frame: Enrollment Form - Mobile
```

---

## 8.2 Frame Hierarchy

### Top-Level Frame Structure

Every screen is contained in a top-level frame following this hierarchy:

```
Frame: [Screen Name] - [Breakpoint]
  |
  +-- Frame: Workspace (auto layout, horizontal)
       |
       +-- Frame: Sidebar (auto layout, vertical)
       |    |
       |    +-- Frame: Logo
       |    +-- Frame: Navigation Items
       |    +-- Frame: User Section
       |
       +-- Frame: Main (auto layout, vertical, fills remaining)
            |
            +-- Frame: Top Bar (auto layout, horizontal, sticky)
            |    |
            |    +-- Frame: Breadcrumb
            |    +-- Frame: Search
            |    +-- Frame: Actions
            |    +-- Frame: Notifications
            |    +-- Frame: User Avatar
            |
            +-- Frame: Canvas (auto layout, vertical, fills remaining)
                 |
                 +-- Frame: Page Header (optional)
                 +-- Frame: Page Content
                 +-- Frame: Page Footer (optional)
```

### Frame Sizing Rules

| Frame | Width | Height | Sizing Mode |
|-------|-------|--------|-------------|
| Workspace | 1440px (desktop), 1024px (tablet), 375px (mobile) | 900px (desktop), 768px (tablet), auto (mobile) | Fixed width, hug height |
| Sidebar | approximately 1/5 of Workspace | Same as Workspace | Fixed width, fill height |
| Main | approximately 4/5 of Workspace | Same as Workspace | Fill width, fill height |
| Top Bar | Same as Main width | Hug height | Fill width, hug height |
| Canvas | Same as Main width | Fill remaining | Fill width, fill height |
| Content sections | Fill Canvas width | Hug or fill | Per recipe specification |

### Auto Layout Defaults

| Property | Value | Reference |
|----------|-------|-----------|
| Sidebar direction | Vertical | Figma Standards section 3.4 |
| Top Bar direction | Horizontal | Figma Standards section 3.4 |
| Canvas direction | Vertical | Figma Standards section 3.4 |
| Sidebar item spacing | Space-3 | Rendering Spec section 13 |
| Top Bar item spacing | Space-3 | Rendering Spec section 13 |
| Canvas section spacing | Space-4 or Space-5 | Rendering Spec section 13 |
| Sidebar padding | Space-3 all sides | Rendering Spec section 13 |
| Top Bar padding | Space-2 vertical, Space-4 horizontal | Rendering Spec section 13 |
| Canvas padding | Space-4 or Space-5 all sides | Rendering Spec section 13 |

---

## 8.3 Naming Conventions

### Layer Naming Format

```
[Type] - [Name] - [State/Variant]
```

Examples:
- `Frame - Student List - Desktop`
- `Component - Button - Primary/Default`
- `Text - Page Title`
- `Icon - Search`
- `Separator - Horizontal`

### Type Prefixes

| Prefix | Type |
|--------|------|
| Frame | Frame |
| Component | Component instance |
| Text | Text layer |
| Icon | Icon layer |
| Separator | Divider line |
| Image | Image layer |
| Group | Group (temporary, avoid) |

### State Suffixes

| Suffix | State |
|--------|-------|
| /Default | Default state |
| /Hover | Hover state |
| /Active | Active/pressed state |
| /Disabled | Disabled state |
| /Focus | Focus state |
| /Error | Error state |
| /Loading | Loading state |
| /Empty | Empty state |

---

## 8.4 Component Usage Standards

### Library Instances Only

Every component in the generated Figma file MUST be a library instance. The following are PROHIBITED:

| Prohibition | Rationale |
|-------------|-----------|
| Detached components | Lose connection to library; cannot receive updates |
| Manually recreated components | Diverge from library definition |
| Ad-hoc components | Not in the approved component set |
| Copy-pasted components | May lose instance connection |

### Instance Swap Protocol

When the recipe specifies a component variant:

1. Insert the base component as an instance.
2. Swap the variant using the component property panel.
3. Verify the variant matches the recipe specification.
4. Never detach to modify; always use variant properties.

### Variable Binding Protocol

Every visual property on every component MUST be bound to a variable:

| Property | Variable Collection |
|----------|-------------------|
| Fill colour | Brand Colour, Semantic Colour, or Neutral Colour |
| Text colour | Neutral Colour (text scale) |
| Border colour | Border Colour |
| Border width | Border Width |
| Spacing (padding, gap) | Spacing |
| Border radius | Radius |
| Shadow/elevation | Shadow/Elevation |
| Font family | Font Family |
| Font size | Font Size |
| Font weight | Font Weight |
| Line height | Line Height |
| Opacity | Opacity |

### Constraint Protocol

Every component MUST have constraints set for responsive behaviour:

| Component Type | Horizontal Constraint | Vertical Constraint |
|---------------|----------------------|---------------------|
| Sidebar | Left, fixed width | Top + Bottom, stretch |
| Top Bar | Left + Right, stretch | Top, fixed height |
| Content sections | Left + Right, stretch | Top, hug height |
| Buttons | Center or right | Top, fixed height |
| Form fields | Left + Right, stretch | Top, fixed height |
| Tables | Left + Right, stretch | Top + Bottom, stretch |

---

## 8.5 Responsive Variant Structure

Every screen MUST have three variants (frames) in the same page section:

```
Frame: [Screen Name] - Desktop
  Width: 1440px
  Grid: 12 columns
  Sidebar: Expanded

Frame: [Screen Name] - Tablet
  Width: 1024px
  Grid: 8 columns
  Sidebar: Collapsed (icon rail or overlay)

Frame: [Screen Name] - Mobile
  Width: 375px
  Grid: 4 columns
  Sidebar: Drawer (hidden by default)
```

### Responsive Adaptation Rules

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Sidebar | Expanded with labels | Icon-only rail | Hidden (drawer) |
| Top Bar | Full (search + actions) | Condensed | Hamburger + search |
| Data Table | Full table layout | Condensed columns | Card list |
| Multi-column form | 2 columns | 1 column | 1 column stacked |
| Stat cards | 4 per row | 2 per row | 1 per row (or 2 grid) |
| Charts | Full width | Full width | Full width (smaller) |
| Filters | Inline panel | Collapsible panel | Bottom sheet |

---

## 8.6 Documentation Annotations

Every generated screen MUST include the following documentation:

### Component-Level Documentation

For each component instance, add a description in the Figma description field:

```
Component: [Recipe ID]
Source: [Recipe Library reference]
Data: [Data element from blueprint]
Action: [Action from blueprint, if interactive]
Permission: [Permission string, if restricted]
```

### Screen-Level Documentation

In the frame description, include:

```
Screen: [Screen Name]
Blueprint: [Blueprint ID]
Pattern: [Pattern ID]
Recipe: [Recipe ID(s)]
Module: [Module name]
Engineering Spec: [Reference]
Density Tier: [Compact/Standard/Comfortable]
Breakpoint: [Desktop/Tablet/Mobile]
```

### Interaction Notes

For each interactive element, add an annotation:

```
On Click: [Action description]
Feedback: [Toast/Alert/Navigation/None]
Confirmation: [Required/Not required]
Permission: [Permission string]
```

---

## 8.7 File Cleanliness Standards

### Prohibited Elements

| Element | Reason |
|---------|--------|
| Stray layers | Unused or accidental layers |
| Empty frames | Frames with no content |
| Hidden layers (unjustified) | Hidden layers without documented reason |
| Unbound variables | Visual properties not connected to variables |
| Manual overrides (unjustified) | Overrides not documented |
| Duplicate components | Same component created multiple times |
| Outdated instances | Instances from older component versions |

### Required Cleanup Steps

Before marking a screen as complete:

1. **Flatten unnecessary groups.** Reduce nesting depth where possible.
2. **Remove empty frames.** Every frame must contain content.
3. **Verify all layers named.** No "Frame 123" or "Group 456" names.
4. **Verify all variables bound.** No hard-coded values.
5. **Verify all instances current.** No outdated component versions.
6. **Verify naming consistency.** All names follow section 8.3 conventions.
7. **Verify documentation complete.** All annotations present per section 8.6.


---

# 9. Figma MCP Standards

---

## 9.1 MCP Interaction Protocol

Opencode interacts with Figma exclusively through the MCP (Model Context Protocol) tools. This section defines the standards for every MCP operation.

### Available MCP Tools Reference

| Tool | Purpose | When Used |
|------|---------|-----------|
| `join_channel` | Connect to a Figma channel | Session start |
| `get_document_info` | Read document structure | Stage 6.1 (Repository Analysis) |
| `create_frame` | Create frames with auto layout | Stage 6.12 (Figma Generation) |
| `create_rectangle` | Create rectangles for backgrounds | Stage 6.12 |
| `create_text` | Create text elements | Stage 6.12 |
| `create_component_instance` | Insert library component instances | Stage 6.12 |
| `set_fill_color` | Apply fill colours from variables | Stage 6.8 (Rendering) |
| `set_stroke_color` | Apply stroke colours | Stage 6.8 |
| `set_corner_radius` | Apply border radius | Stage 6.8 |
| `set_layout_mode` | Set auto layout direction | Stage 6.12 |
| `set_layout_sizing` | Set horizontal/vertical sizing | Stage 6.12 |
| `set_padding` | Set padding values | Stage 6.12 |
| `set_item_spacing` | Set gap between children | Stage 6.12 |
| `set_axis_align` | Set alignment within auto layout | Stage 6.12 |
| `set_text_content` | Set text content | Stage 6.12 |
| `set_focus` | Focus viewport on a node | Stage 6.12 |
| `get_selection` | Read current selection | Validation stages |
| `get_node_info` | Read node properties | Validation stages |
| `get_nodes_info` | Read multiple node properties | Validation stages |
| `scan_nodes_by_types` | Find nodes by type | Validation stages |
| `scan_text_nodes` | Find all text nodes | Validation stages |
| `move_node` | Reposition nodes | Stage 6.12 |
| `resize_node` | Resize nodes | Stage 6.12 |
| `delete_node` | Remove nodes | Cleanup |
| `delete_multiple_nodes` | Remove multiple nodes | Cleanup |
| `clone_node` | Duplicate nodes | Stage 6.12 |
| `create_connections` | Create prototype links | Stage 7 (Prototypes) |
| `set_multiple_text_contents` | Batch text updates | Stage 6.12 |
| `get_local_components` | List available library components | Stage 6.1 (analysis) |
| `get_styles` | List available styles | Stage 6.1 (analysis) |
| `export_node_as_image` | Export for QA review | Stage 6.11 (QA) |

### MCP Session Protocol

```
1. JOIN CHANNEL
   Opencode joins the designated Figma channel
   |
2. READ DOCUMENT
   get_document_info to understand current file state
   |
3. ANALYSE EXISTING COMPONENTS
   get_local_components to catalogue available library components
   |
4. ANALYSE EXISTING STYLES
   get_styles to catalogue available styles and variables
   |
5. EXECUTE GENERATION
   Use create/update tools per sections 8 and 9
   |
6. VALIDATE
   Use read/scan tools to verify output
   |
7. REPORT
   Export summary of all changes made
```

---

## 9.2 Component Creation via MCP

### Creating Component Instances

When inserting a component from the library:

```
Step 1: get_local_components
  - Identify the component by name
  - Get the componentKey (published) or componentId (local)

Step 2: create_component_instance
  - Use componentKey for published library components
  - Use componentId for local components
  - Set x, y position
  - Set parentId (the frame to place it in)

Step 3: set_layout_sizing
  - Set horizontal sizing: FIXED, HUG, or FILL
  - Set vertical sizing: FIXED, HUG, or FILL

Step 4: set_focus (optional)
  - Focus viewport on the new instance for verification
```

### Variant Swapping via MCP

To swap a component instance to a different variant:

```
Step 1: get_instance_overrides
  - Get the current instance properties
  - Identify which properties to change

Step 2: Clone the instance if needed
  - clone_node to create a copy before modification

Step 3: Apply overrides
  - Use set_multiple_text_contents for text overrides
  - Use set_fill_color for colour overrides
  - Use MCP property tools for other overrides
```

### Component Positioning Rules

| Context | Position | Parent |
|---------|----------|--------|
| Sidebar item | x: 0, auto-spaced vertically | Sidebar frame |
| Top Bar element | Auto-spaced horizontally | Top Bar frame |
| Content section | x: 0, auto-spaced vertically | Canvas frame |
| Modal overlay | Centered in Workspace | Workspace frame |
| Toast notification | Top-right, fixed position | Workspace frame |

---

## 9.3 Frame Construction via MCP

### Creating Auto Layout Frames

```
Step 1: create_frame
  - Set x, y position
  - Set width, height
  - Set name (per section 8.3)
  - Set parentId
  - Set fillColor (from variables)
  - Set strokeColor (if applicable)
  - Set strokeWeight (if applicable)

Step 2: set_layout_mode
  - Set layoutMode: HORIZONTAL, VERTICAL, or NONE
  - Set layoutWrap: NO_WRAP or WRAP (if needed)

Step 3: set_layout_sizing
  - Set layoutSizingHorizontal: FIXED, HUG, or FILL
  - Set layoutSizingVertical: FIXED, HUG, or FILL

Step 4: set_padding
  - Set paddingTop, paddingRight, paddingBottom, paddingLeft
  - Values from spacing scale only

Step 5: set_item_spacing
  - Set gap between children
  - Values from spacing scale only

Step 6: set_axis_align
  - Set primaryAxisAlignItems: MIN, MAX, CENTER, SPACE_BETWEEN
  - Set counterAxisAlignItems: MIN, MAX, CENTER, BASELINE
```

### Grid Frame Creation

For 12-column grid containers:

```
Step 1: create_frame (outer container)
  - Width: 1440px (desktop) or appropriate breakpoint
  - Height: HUG content
  - Layout: VERTICAL
  - Padding: Space-5 all sides

Step 2: create_frame (grid row)
  - Width: FILL parent
  - Height: HUG content
  - Layout: HORIZONTAL
  - Item spacing: Space-3 (gutter)

Step 3: create_frame (grid columns)
  - Create 12 equal-width frames within the row
  - Each: width = (container width - 11 * gutter) / 12
  - Layout: VERTICAL
  - These are reference frames; content spans across them
```

---

## 9.4 Text Construction via MCP

### Creating Text Elements

```
Step 1: create_text
  - Set x, y position
  - Set text content
  - Set fontSize (from Font Size variables)
  - Set fontWeight (from Font Weight variables)
  - Set fontColor (from Neutral Colour variables)
  - Set name (per section 8.3)
  - Set parentId

Step 2: set_layout_sizing (if inside auto layout)
  - Typically HUG for text
  - Or FILL if text should expand
```

### Text Variable Binding

Every text element MUST use variables for:

| Property | Variable Collection |
|----------|-------------------|
| Font family | Font Family (heading or body) |
| Font size | Font Size |
| Font weight | Font Weight |
| Line height | Line Height |
| Colour | Neutral Colour (text scale) |

### Text Hierarchy Mapping

| Blueprint Tier | Type Scale Step | Font Weight | Colour |
|---------------|----------------|-------------|--------|
| Primary (Tier 1) | Heading 1 or Heading 2 | Bold (700) | Neutral-900 |
| Secondary (Tier 2) | Heading 3 or Body Large | Semibold (600) | Neutral-700 |
| Tertiary (Tier 3) | Body or Caption | Regular (400) | Neutral-500 |
| Quiet | Caption or Micro | Regular (400) | Neutral-400 |

---

## 9.5 Colour Application via MCP

### Applying Fill Colours

```
Step 1: Identify the surface type
  - Canvas background: Neutral-50
  - Card surface: Neutral-0 (white)
  - Sunken surface: Neutral-100
  - Top bar: Glass material (blur + opacity)

Step 2: set_fill_color
  - Set nodeId (target element)
  - Set r, g, b (normalized 0-1)
  - Set a (alpha, 0-1)
```

### Colour Conversion

The rendering specification defines colours in hex or HSL. For MCP, convert to normalized RGBA:

| Token | Light Mode RGB | Alpha |
|-------|---------------|-------|
| Neutral-50 | #F9FAFB → rgb(249,250,251) → r:0.976, g:0.980, b:0.984 | 1.0 |
| Neutral-0 (white) | #FFFFFF → r:1.0, g:1.0, b:1.0 | 1.0 |
| Brand Primary | [from approved tokens] | 1.0 |
| Semantic-Success | [from approved tokens] | 1.0 |
| Semantic-Error | [from approved tokens] | 1.0 |
| Glass fill | [from approved tokens] | 0.08-0.20 |

### Glass Material Application

For Glass surfaces (top bar, floating panels):

```
Step 1: set_fill_color (base fill)
  - Low opacity: 0.08-0.20 (light mode)

Step 2: Apply blur effect (if MCP supports)
  - Background blur: 16-32px equivalent

Step 3: set_stroke_color (border)
  - Border opacity: 0.24-0.40
  - Must exceed fill opacity by >= 10 percentage points

Step 4: set_corner_radius
  - Tier appropriate for the surface
```

---

## 9.6 Spacing Application via MCP

### Spacing Scale Mapping

| Token Name | Scale Step | Typical Use |
|-----------|-----------|-------------|
| Space-1 | 1x base | Icon-to-text gap, inline elements |
| Space-2 | 2x base | Small padding, tight spacing |
| Space-3 | 3x base | Standard padding, component gaps |
| Space-4 | 4x base | Section padding, card padding |
| Space-5 | 6x base | Canvas padding, major sections |
| Space-6 | 8x base | Outer margins (desktop) |
| Space-7 | 12x base | Large outer margins |
| Space-8 | 16x base | Maximum spacing |

### Applying Spacing via MCP

```
For padding:
  set_padding(nodeId, paddingTop, paddingRight, paddingBottom, paddingLeft)
  - All values from the spacing scale

For gaps between siblings:
  set_item_spacing(nodeId, itemSpacing)
  - Value from the spacing scale

For counter-axis spacing (wrapping):
  set_item_spacing(nodeId, itemSpacing, counterAxisSpacing)
  - Both values from the spacing scale
```

---

## 9.7 Elevation Application via MCP

### Shadow Levels

| Level | Use | Light Mode Shadow |
|-------|-----|-------------------|
| Level 0 | Inline elements | No shadow |
| Level 1 | Resting cards | blur: 8px, y: 2px, colour: rgba(0,0,0,0.08) |
| Level 2 | Hovered cards, top bar | blur: 16px, y: 4px, colour: rgba(0,0,0,0.12) |
| Level 3 | Dropdowns, tooltips | blur: 24px, y: 8px, colour: rgba(0,0,0,0.14) |
| Level 4 | Modals | blur: 48px, y: 16px, colour: rgba(0,0,0,0.18) |

### Applying Shadows via MCP

If MCP supports effect/shadow application:
- Set blur radius, offset x/y, colour, and spread per the level above.
- All shadows are vertical-only (single overhead light source).
- Shadows animate smoothly between levels (no snap).

---

## 9.8 Prototype Connections via MCP

### Creating Navigation Links

```
Step 1: get_reactions (if reading existing prototypes)
  - Understand current prototype state

Step 2: create_connections
  - Set startNodeId (source frame or element)
  - Set endNodeId (destination frame)
  - Set text (optional label)

Step 3: set_default_connector (if custom connector needed)
  - Configure the connector style
```

### Prototype Flow Standards

| Flow Type | Trigger | Animation |
|-----------|---------|-----------|
| Navigation | On Tap | Slide in from right (200ms) |
| Modal open | On Tap | Smart Animate (200ms) |
| Modal close | On Tap | Smart Animate (200ms) |
| Tab switch | On Tap | Crossfade (150ms) |
| Dropdown open | On Tap | Smart Animate (150ms) |
| Toast appear | On trigger | Slide in from right (200ms) |
| Toast dismiss | Auto after 5s or On Tap | Fade out (150ms) |

---

# 10. Validation Pipeline

---

## 10.1 Validation Philosophy

Validation is not a single event at the end of generation. It is a continuous process that occurs at every stage. The pipeline is designed so that:

1. **Early failures prevent late work.** If a blueprint is invalid, no layout work begins.
2. **Each stage validates its own output.** No stage passes invalid output downstream.
3. **Accessibility is the overriding gate.** A screen that fails accessibility fails overall.
4. **Validation is deterministic.** The same input always produces the same validation result.

## 10.2 Complete Validation Pipeline

### Pre-Generation Validation (Stages 1-3)

| Check | Stage | Rule | Pass Criteria |
|-------|-------|------|---------------|
| Document loading | 6.1 | All required docs loaded | 100% of docs in section 1.6 loaded |
| Spec validation | 6.2 | Engineering spec approved | Status is Approved or Frozen |
| Entity mapping | 6.2 | All entities identified | Every data element mapped |
| API mapping | 6.2 | All APIs identified | Every action mapped |
| Blueprint format | 6.3 | V01-V24 pass | 24/24 rules pass |
| Blueprint completeness | 6.3 | C01-C30 pass | 30/30 checks pass |

### Selection Validation (Stages 4-5)

| Check | Stage | Rule | Pass Criteria |
|-------|-------|------|---------------|
| Pattern exists | 6.4 | Pattern in Library | Verified against Pattern Library |
| Pattern selection traceable | 6.4 | Algorithmic selection | Section 7.1 path documented |
| Recipe exists | 6.5 | Recipe in Library | Verified against Recipe Library |
| Recipe selection traceable | 6.5 | Algorithmic selection | Section 7.2 path documented |
| Component coverage | 6.5 | All data elements covered | Recipe components match blueprint data |
| Action coverage | 6.5 | All actions covered | Recipe actions match blueprint actions |

### Composition Validation (Stages 6-7)

| Check | Stage | Rule | Pass Criteria |
|-------|-------|------|---------------|
| Grid alignment | 6.6 | Components on grid | All components align to columns |
| Spacing scale | 6.6 | Approved values only | All spacing from Space-1 to Space-8 |
| Component order | 6.6 | Matches recipe | Order matches recipe specification |
| Density consistency | 6.6 | One tier per surface | No mixed density within a surface |
| Proportional sizing | 6.6 | No fixed pixels | All dimensions proportional |
| Hierarchy alignment | 6.7 | Tiers match layout | Tier 1 most prominent |
| Single focal point | 6.7 | One per screen | Exactly one primary focus |
| Grayscale legible | 6.7 | Hierarchy without colour | Readable in grayscale |

### Rendering Validation (Stage 8)

| Check | Stage | Rule | Pass Criteria |
|-------|-------|------|---------------|
| Materials correct | 6.8 | Glass/Solid per spec | Matching surface type rules |
| Colour correct | 6.8 | Brand/Semantic/Neutral | All colours from approved tokens |
| Typography correct | 6.8 | Type scale compliance | All text from type scale |
| Elevation correct | 6.8 | Level 0-4 | Matching shadow rules |
| Spacing correct | 6.8 | Scale values | All spacing from approved scale |
| Icons correct | 6.8 | Approved set | All icons from approved library |
| Motion defined | 6.8 | Tier-based | All transitions per tier rules |
| States defined | 6.8 | 5 mandatory states | Idle, Hover, Active, Disabled, Focus |
| Zero hard-coded | 6.8 | All variables | Every property traces to token |

### Accessibility Validation (Stage 9)

| Check | Stage | Rule | Pass Criteria |
|-------|-------|------|---------------|
| Text contrast | 6.9 | >= 4.5:1 | WCAG AA |
| Non-text contrast | 6.9 | >= 3:1 | WCAG AA |
| Touch targets | 6.9 | >= 44px | All interactive elements |
| Keyboard nav | 6.9 | All accessible | Tab order logical |
| Focus visible | 6.9 | Focus ring present | AA non-text contrast |
| Screen reader | 6.9 | ARIA labels | All interactive elements labeled |
| Reduced motion | 6.9 | Respects preference | prefers-reduced-motion |
| Colour independence | 6.9 | Not sole indicator | Text/icon alternatives |
| Form labels | 6.9 | All fields labeled | Associated labels |
| Heading hierarchy | 6.9 | Logical structure | H1 > H2 > H3 |

### Responsive Validation (Stage 10)

| Check | Stage | Rule | Pass Criteria |
|-------|-------|------|---------------|
| Desktop 12-col | 6.10 | Grid correct | 12 columns, sidebar expanded |
| Tablet 8-col | 6.10 | Grid correct | 8 columns, sidebar collapsed |
| Mobile 4-col | 6.10 | Grid correct | 4 columns, sidebar drawer |
| Component adaptation | 6.10 | Correct reflow | Tables to cards, columns to stack |
| Spacing proportionality | 6.10 | Scales with viewport | Proportional scaling |
| Visual consistency | 6.10 | No property changes | Material/colour/typography/radius stable |

### QA Validation (Stage 11)

| Check | Stage | Rule | Pass Criteria |
|-------|-------|------|---------------|
| Component reuse | 6.11 | Library instances | 100% instance usage |
| Variable usage | 6.11 | No hard-coded values | All variables bound |
| Token compliance | 6.11 | Approved tokens only | Brand/Semantic/Neutral correct |
| Alignment | 6.11 | Grid + spacing | Consistent throughout |
| Typography | 6.11 | Hierarchy + scale | Consistent and from tokens |
| Accessibility (re-check) | 6.11 | WCAG 2.1 AA | All criteria pass |
| Responsive (re-check) | 6.11 | All breakpoints | Desktop/tablet/mobile correct |
| Naming | 6.11 | Conventions | All names follow section 8.3 |
| Documentation | 6.11 | Complete | All annotations present |

---

## 10.3 Validation Stop Rules

The generation MUST stop immediately if:

| Condition | Action |
|-----------|--------|
| Any accessibility check fails | STOP. Non-negotiable. Fix before proceeding. |
| Blueprint validation fails | STOP. Repair blueprint before continuing. |
| Engineering spec not approved | STOP. Cannot generate from draft specs. |
| Required document missing | STOP. Cannot proceed without source of truth. |
| Conflicting specifications | STOP. Escalate conflict before proceeding. |
| More than 3 validation failures in a row | STOP. Systemic issue; escalate. |

---

# 11. Failure Recovery

---

## 11.1 Failure Categories

| Category | Severity | Action |
|----------|----------|--------|
| **Critical** | Generation cannot continue | STOP. Escalate immediately. |
| **Major** | Output will be incorrect if unresolved | STOP. Resolve before proceeding. |
| **Minor** | Output may be suboptimal but valid | Document. Resolve if possible. Continue. |
| **Informational** | Note for future improvement | Document. Continue. |

## 11.2 Specific Failure Scenarios

### Scenario 1: Required Document Missing

| Field | Value |
|-------|-------|
| **Trigger** | A document listed in section 1.6 cannot be found |
| **Severity** | Critical |
| **Recovery** | 1. Check alternative file paths. 2. Check if document has been renamed. 3. Check if document is referenced but not yet created. 4. If truly missing: FLAG THE GAP. Do not proceed without the missing specification. Escalate to human reviewer. |

### Scenario 2: Conflicting Specifications

| Field | Value |
|-------|-------|
| **Trigger** | Two or more specifications provide contradictory guidance |
| **Severity** | Critical |
| **Recovery** | 1. Identify the exact conflict (quote both specifications). 2. Apply authority hierarchy from section 1.3. 3. If hierarchy resolves the conflict, use the higher-authority document. 4. If hierarchy does not resolve (same level), FLAG THE CONFLICT. Escalate to human reviewer. 5. Document both positions and the resolution rationale. |

### Scenario 3: Pattern Unavailable

| Field | Value |
|-------|-------|
| **Trigger** | The deterministic algorithm selects a pattern that does not exist in the Pattern Library |
| **Severity** | Major |
| **Recovery** | 1. Verify the algorithm was followed correctly. 2. Check if the pattern exists under a different name. 3. Check the Engineering-to-Pattern Mapping for alternative patterns. 4. If no pattern exists: FLAG THE GAP. Document what pattern is needed. Use the closest available pattern with explicit documentation of the deviation. Escalate. |

### Scenario 4: Recipe Unavailable

| Field | Value |
|-------|-------|
| **Trigger** | The deterministic algorithm selects a recipe that does not exist in the Recipe Library |
| **Severity** | Major |
| **Recovery** | 1. Verify the algorithm was followed correctly. 2. Check if the recipe exists under a different name. 3. Check if a similar recipe can be adapted. 4. If no recipe exists: Compose the recipe from the pattern's component guidance in the Pattern Library. Document the composition explicitly. FLAG THE GAP for future recipe creation. Escalate. |

### Scenario 5: Blueprint Incomplete

| Field | Value |
|-------|-------|
| **Trigger** | The screen blueprint is missing required sections or has validation failures |
| **Severity** | Major |
| **Recovery** | 1. Identify the specific missing/invalid section. 2. Attempt to complete the section using the Engineering Specification as source. 3. If the Engineering Specification does not provide the needed information: FLAG THE GAP. Document what information is missing. 4. If the section can be completed from available sources, complete it and re-validate. 5. If unrecoverable: Escalate. |

### Scenario 6: Rendering Rules Conflict

| Field | Value |
|-------|-------|
| **Trigger** | Two rendering rules produce contradictory visual requirements |
| **Severity** | Major |
| **Recovery** | 1. Identify the conflicting rules (quote specific sections). 2. Apply the Rendering Specification internal hierarchy: Accessibility (section 22) > Constitution (section 5) > All other chapters. 3. If the conflict is within the same chapter, apply the more specific rule. 4. Document the conflict and resolution. 5. If unrecoverable: Escalate. |

### Scenario 7: Component Not in Library

| Field | Value |
|-------|-------|
| **Trigger** | The recipe specifies a component that does not exist in the Design System library |
| **Severity** | Major |
| **Recovery** | 1. Verify the component name matches the library. 2. Check for a similar component with a different name. 3. Check if the component is available as a composite of existing primitives. 4. If the component truly does not exist: FLAG THE GAP. Do not create an ad-hoc component. Use the closest available component with explicit documentation. Escalate. |

### Scenario 8: Variable Not Available

| Field | Value |
|-------|-------|
| **Trigger** | A visual property needs a variable that does not exist in the Figma variable collections |
| **Severity** | Major |
| **Recovery** | 1. Verify the variable name matches the collection. 2. Check for a similar variable with a different name. 3. Check if the variable needs to be created as part of Phase 1 Foundation. 4. If the variable is missing from an otherwise complete Foundation: FLAG THE GAP. Use the nearest approved value as a temporary measure. Document. Escalate. |

### Scenario 9: MCP Tool Failure

| Field | Value |
|-------|-------|
| **Trigger** | An MCP tool returns an error or fails to execute |
| **Severity** | Minor (if retryable) or Major (if persistent) |
| **Recovery** | 1. Retry the operation once. 2. If retry fails, check the tool parameters. 3. If parameters are correct and the tool still fails: document the error. 4. Attempt an alternative MCP tool that achieves the same result. 5. If all alternatives fail: document the limitation. Flag for manual intervention. |

### Scenario 10: Validation Failure After Figma Construction

| Field | Value |
|-------|-------|
| **Trigger** | A validation check fails after Figma objects have been created |
| **Severity** | Major |
| **Recovery** | 1. Identify the specific failing validation. 2. Identify the specific Figma object(s) causing the failure. 3. Modify the Figma object(s) to pass validation. 4. Re-run the failing validation. 5. If the fix introduces new failures: revert and escalate. |

---

## 11.3 Escalation Protocol

When a failure cannot be resolved through the recovery procedures above:

1. **Document the failure completely.** Include: what failed, why it failed, what was attempted, what the result was.
2. **Preserve the generation state.** Save all work done so far. Do not discard partial progress.
3. **Flag for human review.** The human reviewer receives: the failure report, the generation state, and a recommendation.
4. **Do not make assumptions.** The escalation must not contain invented solutions.
5. **Wait for resolution.** Do not continue generation until the escalation is resolved.

---

# 12. Output Standards

---

## 12.1 What a Completed Generation Produces

Every completed screen generation MUST produce the following deliverables:

### Primary Deliverable: Figma Page

| Property | Requirement |
|----------|-------------|
| Page structure | Correct per section 8.1 |
| Frame hierarchy | Correct per section 8.2 |
| Component instances | 100% library instances; zero detached |
| Variable bindings | All visual properties bound to variables |
| Auto layout | All frames use auto layout |
| Constraints | Responsive constraints set on all components |
| Naming | All layers named per section 8.3 |
| Documentation | All annotations per section 8.6 |
| Responsive variants | Desktop, tablet, mobile frames |
| Clean file | No stray layers, empty frames, or hidden unjustified layers |

### Secondary Deliverable: Generation Report

The generation report is a complete audit trail documenting:

| Section | Content |
|---------|---------|
| Screen identification | Blueprint ID, screen name, module, classification |
| Documents loaded | List of all documents read during generation |
| Pattern selection | Selected pattern ID, algorithm path, rationale |
| Recipe selection | Selected recipe ID(s), algorithm path, rationale |
| Layout decisions | Grid configuration, spacing values, density tier |
| Rendering decisions | Materials, colours, typography, elevation applied |
| Validation results | Pass/fail for every validation check at every stage |
| Gaps identified | Any missing information, conflicting specs, or unavailable resources |
| Improvisations (if any) | Any deviations from specifications with justification |
| Generation metadata | Timestamp, duration, AI model version |

### Tertiary Deliverable: Validation Summary

| Validation | Result | Details |
|-----------|--------|---------|
| Blueprint validation (V01-V24) | Pass/Fail | Per-rule results |
| Blueprint compliance (C01-C30) | Pass/Fail | Per-check results |
| Pattern selection | Pass/Fail | Traceability confirmed |
| Recipe selection | Pass/Fail | Coverage confirmed |
| Layout composition | Pass/Fail | Grid, spacing, sizing confirmed |
| Rendering | Pass/Fail | All tokens applied; zero hard-coded |
| Accessibility | Pass/Fail | WCAG 2.1 AA confirmed |
| Responsive | Pass/Fail | All 3 breakpoints confirmed |
| QA (24 checks) | Pass/Fail | Per-check results |
| Figma construction | Pass/Fail | All objects created correctly |
| Final review | Pass/Fail | Output matches blueprint |

---

## 12.2 Deliverable Quality Criteria

### Figma File Quality

| Criterion | Threshold |
|-----------|-----------|
| Library instance usage | 100% |
| Variable binding coverage | 100% |
| Auto layout coverage | 100% (except where inappropriate) |
| Naming compliance | 100% |
| Documentation coverage | 100% |
| Responsive variant completeness | 3/3 breakpoints |
| Stray layers | 0 |
| Empty frames | 0 |
| Hard-coded values | 0 |

### Generation Report Quality

| Criterion | Threshold |
|-----------|-----------|
| Traceability | Every decision has a source citation |
| Completeness | Every stage has an entry |
| Accuracy | Validation results match actual state |
| Gaps documented | All gaps identified and flagged |
| No undocumented improvisations | Zero undocumented deviations |

---

## 12.3 Handoff Package Structure

For each module, the complete handoff includes:

```
Handoff - [Module Name]
  |
  +-- Screens/
  |    +-- [Screen Name] - Desktop.fig (or reference)
  |    +-- [Screen Name] - Tablet.fig
  |    +-- [Screen Name] - Mobile.fig
  |
  +-- Documentation/
  |    +-- Generation Reports/
  |    |    +-- [Screen Name] - Generation Report.md
  |    |    +-- [Screen Name] - Validation Summary.md
  |    +-- Blueprints/
  |    |    +-- [Blueprint ID] [Screen Name].md
  |    +-- Interaction Notes/
  |         +-- [Screen Name] - Interactions.md
  |
  +-- Assets/
  |    +-- Icons/ (SVG exports)
  |    +-- Images/ (optimised exports)
  |
  +-- Variables/
  |    +-- Variable Export (token values)
  |
  +-- Traceability/
       +-- Screen-to-Spec Mapping.md
       +-- Screen-to-Blueprint Mapping.md
```

---

# 13. Governance

---

## 13.1 Versioning

| Element | Versioning Rule |
|---------|----------------|
| This document | Semantic versioning (Major.Minor). Breaking workflow changes = Major. Additions/clarifications = Minor. |
| Screen blueprints | Per Screen Blueprint Specification section 33. |
| Patterns | Per Pattern Library lifecycle. |
| Recipes | Per Component Recipe Library section 12.3. |
| Design tokens | Per Design System section 1.14. |
| Components | Per Design System section 3.6 lifecycle. |
| Figma files | Per Figma Standards section 2.10 versioning. |

## 13.2 Execution Updates

When this workflow is updated:

1. **Existing generated output is NOT automatically invalidated.** Previous generations remain valid unless the update explicitly changes rules they depend on.
2. **New generations MUST use the latest version.** No generation may use an outdated workflow.
3. **Migration guidance is provided.** If an update affects existing output, the update includes migration steps.
4. **Version changelog is maintained.** Every change is documented with rationale.

## 13.3 Repository Compatibility

| Document Change | Workflow Impact |
|----------------|----------------|
| Engineering Spec updated | Re-read affected spec; re-validate blueprint if entities/APIs changed |
| Design System component added | New component available for recipes; no workflow change needed |
| Design System component removed | Check all recipes using that component; flag gaps |
| Pattern added | New pattern available for selection; no workflow change needed |
| Pattern modified | Re-validate all screens using that pattern |
| Recipe added | New recipe available for selection; no workflow change needed |
| Recipe modified | Re-validate all screens using that recipe |
| Rendering Spec updated | Re-validate all generated screens against new rules |
| Blueprint modified | Re-generate the affected screen |
| Figma Standards updated | Re-validate Figma construction against new standards |
| Engineering-to-Pattern Mapping updated | Re-check pattern selections for affected screens |

## 13.4 Deprecation

When a specification is deprecated:

1. **Flag all affected screens.** Identify every screen that references the deprecated specification.
2. **Determine replacement.** Identify what replaces the deprecated specification.
3. **Update affected screens.** Re-generate affected screens using the replacement.
4. **Mark Figma output.** Add deprecation notice to affected Figma frames.
5. **Do not ship deprecated output.** Deprecated screens must be updated before developer handoff.

## 13.5 Specification Compatibility

This workflow is compatible with:

| Specification | Minimum Version | Notes |
|---------------|----------------|-------|
| Documentation Constitution | 1.0 | All versions compatible |
| UI Strategy & Design Direction | 1.0 | All versions compatible |
| Design System & Component Library | 1.0 | All versions compatible |
| Figma Standards & Design QA | 1.0 | All versions compatible |
| Screen Blueprint Specification | 1.0 | All versions compatible |
| Pattern Library | 1.0 | All versions compatible |
| Component Recipe Library | 1.0 | All versions compatible |
| UI Rendering Specification | 1.0 | All versions compatible |
| Engineering-to-Pattern Mapping | 1.0 | All versions compatible |
| Figma Build Roadmap | 1.0 | All versions compatible |
| All 10 Engineering Specifications | V1 (frozen) | Future versions require workflow update |

## 13.6 Future Expansion

This workflow is designed for extension. Future versions may add:

| Expansion | Description |
|-----------|-------------|
| Mobile viewport rules | When the Rendering Specification adds mobile chapters |
| Dark mode support | When dark mode tokens are approved |
| Additional pattern types | When new patterns are added to the Pattern Library |
| Additional recipe types | When new recipes are added to the Recipe Library |
| Automated testing | When Figma MCP supports automated QA |
| Multi-language support | When i18n tokens are defined |
| Design-to-code pipeline | When code generation from Figma is supported |

## 13.7 Documentation Ownership

| Document | Owner | Review Cycle |
|----------|-------|-------------|
| This document | UI/UX Architecture Team | Per major release |
| Screen Blueprint Specification | UI/UX Architecture Team | Per major release |
| Pattern Library | UI/UX Architecture Team | Per major release |
| Component Recipe Library | UI/UX Architecture Team | Per major release |
| UI Rendering Specification | UI/UX Architecture Team | Living document |
| Figma Build Roadmap | UI/UX Architecture Team | Per major release |
| Figma Standards & Design QA | UI/UX Architecture Team | Per major release |

---

# 14. Final Standard

---

## 14.1 Completeness Criteria

This workflow is complete and ready for execution if and only if:

1. **A newly initialized Opencode instance** with no previous project knowledge can read the repository.
2. **Following this workflow exactly**, it can generate production-quality School ERP Figma files.
3. **The generated files conform to every repository specification** without requiring subjective design decisions.
4. **Every execution step is deterministic** — given the same inputs, the same outputs are produced.
5. **Every execution step is traceable** — every decision cites a source specification.
6. **Every execution step is reproducible** — a second execution with the same inputs produces equivalent output.
7. **Every execution step is auditable** — a complete generation report documents every decision.

## 14.2 The Determinism Guarantee

Given:
- The same repository (same document versions)
- The same Screen Blueprint
- The same Pattern
- The same Recipe(s)
- The same Rendering Specification

This workflow will consistently produce nearly identical Figma designs regardless of:
- Execution order
- Time of execution
- AI model version
- Session context
- Prior generation history

## 14.3 The Specification Authority

This specification is the canonical operating manual for AI-driven Figma generation across the entire School ERP project. It does not replace any existing specification; it orchestrates all of them.

When in doubt: read the source specification. When specifications conflict: apply the authority hierarchy. When the hierarchy does not resolve: escalate. When you cannot proceed: stop and document.

The repository is the source of truth. This workflow is the execution engine. Figma is the output.

---

# Appendix A: Document Reference Index

---

## A.1 Complete Document Inventory

| # | Document | Directory | Lines | Status | Role in Workflow |
|---|----------|-----------|-------|--------|-----------------|
| 1 | Documentation Constitution | governance/ | ~1,024 | Approved v1.1 | Highest authority; governs all documentation |
| 2 | Documentation Dependency Map | governance/ | ~660 | Approved v1.0 | Cross-reference validation |
| 3 | System Architecture | architecture/ | ~2,936 | Approved v1.0 | Technical feasibility constraints |
| 4 | Database Architecture | architecture/ | ~1,320 | Draft v1.0 | Entity relationship reference |
| 5 | Implementation Roadmap | architecture/ | ~1,239 | Draft v1.0 | Module implementation order |
| 6 | Architecture Freeze | architecture/ | ~963 | Approved v1.0 | Frozen decisions cannot be violated |
| 7 | Implementation Playbook | architecture/ | ~1,326 | Approved v1.0 | Frontend workflow standards |
| 8 | Engineering Standards | platform standards/ | ~978 | Approved v1.0 | Naming, entity, validation standards |
| 9 | Cross-Domain Integration | platform standards/ | ~1,484 | Approved v1.0 | Domain interaction patterns |
| 10 | Platform Event Catalogue | platform standards/ | ~3,153 | Approved v1.0 | Event types for notification design |
| 11 | API Style Guide | platform standards/ | ~2,360 | Approved v1.0 | Pagination, filtering, error patterns |
| 12 | Development Standards | platform standards/ | ~3,169 | Approved v1.0 | Frontend code standards |
| 13 | DevOps Standards | platform standards/ | ~2,058 | Approved v1.0 | Environment constraints |
| 14 | Platform Standards Consolidated | platform standards/ | ~13,341 | Approved v1.0 | Combined reference |
| 15 | Identity & Access Engineering | engineering/ | ~1,138 | Approved/Frozen | Auth flows, RBAC patterns |
| 16 | Institution Management Engineering | engineering/ | ~1,370 | Approved | Org hierarchy, navigation |
| 17 | People Engineering | engineering/ | ~1,757 | Approved v3.0 | Person lifecycle, profiles |
| 18 | Academic Management Engineering | engineering/ | ~1,944 | Approved/Frozen | Classes, grading, timetables |
| 19 | Finance Engineering | engineering/ | ~1,813 | Approved/Frozen | Fees, billing, payments |
| 20 | Communication Engineering | engineering/ | ~2,960 | Approved/Frozen | Notifications, messaging |
| 21 | Operations Engineering | engineering/ | ~2,633 | Approved/Frozen | Library, hostel, transport |
| 22 | Documents & Learning Engineering | engineering/ | ~2,012 | Approved/Frozen | Document management |
| 23 | Reporting & Analytics Engineering | engineering/ | ~1,922 | Approved/Frozen | Dashboards, reports |
| 24 | Platform Administration Engineering | engineering/ | ~3,709 | Approved/Frozen | Tenant lifecycle, monitoring |
| 25 | UI Strategy & Design Direction | ui-ux/ | ~993 | Approved v1.1 | Design vision, personality, principles |
| 26 | Design System & Component Library | ui-ux/ | ~4,392 | Approved v1.0 | Tokens, components, composition |
| 27 | Figma Standards & Design QA | ui-ux/ | ~2,759 | Approved v1.0 | Figma construction standards |
| 28 | Screen Blueprint Specification | ui-ux/ | ~2,176 | Draft v1.0 | Blueprint authoring/validation |
| 29 | Pattern Library | ui-ux/ | ~2,149 | Draft v1.0 | 47 approved patterns |
| 30 | Component Recipe Library | ui-ux/ | ~3,542 | Draft v1.0 | 55 approved recipes |
| 31 | UI Rendering Specification | ui-ux/ | ~1,843 | Living | Deterministic rendering rules |
| 32 | Engineering-to-Pattern Mapping | ui-ux/ | ~1,004 | Draft | 746 screens mapped |
| 33 | Figma Build Roadmap | ui-ux/ | ~954 | Approved v1.0 | 9-phase build sequence |
| 34 | THIS DOCUMENT | ui-ux/ | -- | Draft v1.0 | Execution orchestration |

---

# Appendix B: Complete Dependency Graph

---

## B.1 Document-to-Document Dependencies

```
Documentation Constitution (Level 1)
    |
    +--- governs ---> All documents
    |
System Architecture (Level 2)
    |
    +--- constrains ---> Engineering Specifications
    +--- informs ---> Database Architecture
    |
Platform Standards (Level 3)
    |
    +--- standards for ---> Engineering Specifications
    +--- standards for ---> UI/UX Specifications
    |
Engineering Specifications (Level 4)
    |
    +--- entities/APIs for ---> Screen Blueprints
    +--- workflows for ---> Pattern Selection
    +--- permissions for ---> Component Recipes
    |
UI Strategy & Design Direction (Level 5)
    |
    +--- principles for ---> Design System
    +--- principles for ---> Rendering Specification
    |
Design System & Component Library (Level 5)
    |
    +--- components for ---> Component Recipes
    +--- tokens for ---> Rendering Specification
    +--- composition for ---> Pattern Library
    |
Figma Standards & Design QA (Level 5)
    |
    +--- construction standards for ---> Figma Generation
    +--- QA standards for ---> Validation Pipeline
    |
Screen Blueprint Specification (Level 5)
    |
    +--- blueprint template for ---> Individual Blueprints
    +--- validation rules for ---> Blueprint Validation
    |
Pattern Library (Level 6)
    |
    +--- patterns for ---> Pattern Selection Algorithm
    +--- layout rules for ---> Layout Composition
    |
Component Recipe Library (Level 6)
    |
    +--- recipes for ---> Recipe Selection Algorithm
    +--- component tables for ---> Layout Composition
    |
UI Rendering Specification (Level 6)
    |
    +--- rendering rules for ---> Visual Rendering
    +--- accessibility rules for ---> Accessibility Validation
    +--- responsive rules for ---> Responsive Validation
    |
Engineering-to-Pattern Mapping (Level 6)
    |
    +--- screen-to-pattern map for ---> Pattern Selection Validation
    |
Figma Build Roadmap (Level 6)
    |
    +--- phase sequence for ---> Execution Lifecycle
    +--- QA checklist for ---> Validation Pipeline
    |
THIS DOCUMENT (Level 6)
    |
    +--- orchestrates ---> All of the above
    +--- produces ---> Figma Output
```

---

# Appendix C: Glossary

---

| Term | Definition |
|------|-----------|
| **Auto Layout** | Figma's layout system that automatically positions and sizes child elements based on direction, spacing, and padding rules |
| **Blueprint** | A screen blueprint: a complete specification for a single screen following the Screen Blueprint Specification template |
| **Canvas** | The main content area of a screen, excluding sidebar and top bar |
| **Component Instance** | A linked copy of a library component; changes to the library propagate to all instances |
| **Composite Component** | A component built by assembling two or more primitive components (Design System section 3.3) |
| **Constraint** | A Figma property that defines how an element responds to parent resizing (responsive behavior) |
| **Density Tier** | The spacing density level for a surface: Compact, Standard, or Comfortable (Rendering Specification section 13.6) |
| **Deterministic** | Producing the same output given the same input; no subjective variation |
| **Detached Component** | A component instance that has been broken from its library connection; prohibited in this workflow |
| **Focal Point** | The single most prominent element on a screen; exactly one per screen (Rendering Specification section 5.1) |
| **Frame** | A Figma container that groups and positions child elements |
| **Glass Material** | Semi-transparent surface with background blur, low-opacity fill, and subtle border (Rendering Specification section 8.4) |
| **Grid System** | The 12-column (desktop), 8-column (tablet), 4-column (mobile) layout framework (Rendering Specification section 7) |
| **Handoff** | The process of delivering design artifacts to developers for implementation |
| **Hierarchy Tiers** | The visual importance levels: Primary, Secondary, Tertiary, Quiet (Rendering Specification section 6.1) |
| **MCP** | Model Context Protocol: the interface through which Opencode interacts with Figma programmatically |
| **Module Accent** | A narrow hue assigned to each module, used only for module icons and active-nav indicators (Rendering Specification section 9) |
| **Page** | A top-level container in Figma; one page per screen type or module section |
| **Pattern** | An abstract UI solution to a recurring design problem (Pattern Library) |
| **Primitive Component** | A single, indivisible UI element (Design System section 3.2) |
| **Recipe** | A structured composition of components solving a specific user problem (Component Recipe Library) |
| **Rendering Specification** | The deterministic visual construction rules for all generated output (UI Rendering Specification) |
| **Section** | A grouping within a Figma page; used to organize screens by pattern type |
| **Screen Blueprint** | See Blueprint |
| **Sidebar** | The left navigation panel; approximately 1/5 of workspace width |
| **Solid Material** | Opaque surface with flat fill (Rendering Specification section 8.5) |
| **Spacing Scale** | The approved set of spacing values: Space-1 through Space-8 (Rendering Specification section 13.1) |
| **Surface** | Any visual container in the design: canvas, card, panel, modal, etc. |
| **Token** | A named design value (colour, spacing, typography, etc.) stored in Figma variables |
| **Top Bar** | The horizontal bar at the top of the main content area; uses Glass material |
| **Variable** | A Figma feature that stores design tokens and enables mode switching (light/dark) |
| **Variable Binding** | Connecting a visual property to a variable so it updates automatically |
| **Variant** | A specific version of a component (e.g., Button/Primary/Default vs Button/Secondary/Hover) |
| **WCAG** | Web Content Accessibility Guidelines; WCAG 2.1 AA is the minimum compliance level |
| **Workspace** | The full screen layout including sidebar, top bar, and canvas |

---

*Document Version: 1.0*
*Total Stages: 14 (Business Requirement through Output)*
*Total Roles: 12 (Documentation Reader through Final Reviewer)*
*Total Validation Checks: 80+ across all stages*
*Total Decision Algorithms: 3 (Pattern Selection, Recipe Selection, Layout Composition)*
*Total Failure Scenarios: 10 (with recovery procedures)*
*Total Documents Referenced: 34*
*Last Updated: 2026-07-23*
*Status: Complete*
