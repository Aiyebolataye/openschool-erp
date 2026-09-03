# OpenSchool ERP

## Component Recipe Library

---

| Field | Value |
|-------|-------|
| **Document** | Component Recipe Library |
| **Version** | 1.0 |
| **Status** | Draft |
| **Date** | July 2026 |
| **Classification** | Internal |
| **Author** | Architecture Team |
| **Owner** | Solution Architect |

---

| Aspect | Detail |
|--------|--------|
| **Purpose** | Canonical specification governing how reusable interface assemblies (Recipes) are constructed from approved Components |
| **Scope** | All reusable interface assemblies across the School ERP |
| **Governing Documents** | Documentation Constitution, Design System and Component Library, Pattern Library, Screen Blueprint Specification, UI Rendering Specification |
| **Derived From** | Approved Engineering Specifications, Design System, Pattern Library, Screen Blueprint Specification |

---

## Table of Contents

1. Position in Documentation Pipeline
2. Recipe Philosophy
3. Recipe Lifecycle
4. Recipe Structure
5. Recipe Categories
6. Component Composition
7. Pattern Integration
8. Selection Rules
9. Validation
10. School ERP Coverage
11. Examples
12. Documentation Standards
13. Architecture Review

---

# 1. Position in Documentation Pipeline

---

## 1.1 Purpose

Define where the Component Recipe Library sits within the documentation ecosystem and how it relates to every other specification.

## 1.2 Scope

This document governs the construction, validation, and usage of reusable interface assemblies called Recipes. It does not define individual components (those belong to 02 Design System and Component Library), visual styling (those belong to UI Rendering Specification), or page-level layouts (those belong to Pattern Library and Screen Blueprint Specification).

## 1.3 Inputs

| Input | Source | What It Provides |
|-------|--------|------------------|
| Component definitions | 02 Design System and Component Library | Available primitives and composites for assembly |
| Design tokens | 02 Design System and Component Library Chapter 1 | Spacing, colour, typography, elevation tokens |
| Pattern definitions | Pattern Library | Structural patterns that Recipes implement |
| Screen Blueprints | Screen Blueprint Specification | Intent, data requirements, actions, states |
| Engineering specifications | 10 domain specs | Data models, API endpoints, business rules |
| UI Rendering rules | UI Rendering Specification | Density, materials, spacing, colour application |

## 1.4 Outputs Produced

| Output | Consumer | How It Is Used |
|--------|----------|----------------|
| Recipe definitions | Figma Generation Workflow | Assembled into screens during Phase 6 |
| Recipe validation rules | Design QA Specification | Automated validation of assembled screens |
| Recipe selection guidance | Opencode AI agent | Deterministic recipe selection for screen construction |
| Composition rules | Screen Blueprint Specification | Blueprint authors reference available recipes |

## 1.5 Dependencies

| Dependency | Relationship | Criticality |
|-----------|-------------|-------------|
| 02 Design System and Component Library | Recipes reuse its components | Mandatory |
| Pattern Library | Recipes implement its patterns | Mandatory |
| UI Rendering Specification | Recipes defer visual styling to it | Mandatory |
| Screen Blueprint Specification | Blueprints consume recipes | Strong |
| Figma Build Roadmap | Phase 6 assembles recipes into screens | Strong |
| Engineering Specifications | Define data that recipes display | Moderate |

## 1.6 Downstream Consumers

| Consumer | How It Consumes Recipes |
|----------|------------------------|
| Figma Generation Workflow (Phase 6) | Selects and assembles recipes into module screens |
| Design QA Specification | Validates recipe composition against rules |
| Screen Blueprint Specification | References available recipes in blueprint structure |
| Opencode AI agent | Uses selection rules to deterministically choose recipes |
| Developer handoff | Recipes document component assemblies for implementation |

## 1.7 Relationship to Engineering Specification

Engineering Specifications define data models, API endpoints, and business rules. Screen Blueprints translate these into design intent. Recipes define how the components that display that data are assembled. The relationship is indirect:

```
Engineering Spec -> Screen Blueprint -> Recipe Selection -> Component Assembly
```

Recipes do not reference engineering specifications directly. They consume the data requirements that Screen Blueprints extract from engineering specs.

## 1.8 Relationship to Screen Blueprint Specification

Screen Blueprints define what a screen contains and why. Recipes define how the UI elements within that screen are assembled. A Blueprint references Patterns; a Recipe defines how a Pattern is built from Components.

```
Blueprint -> Pattern -> Recipe -> Components
```

The Blueprint says "this screen uses the Dashboard pattern." The Recipe says "the KPI Panel Recipe assembles KPI Card plus Trend Indicator plus optional Chart Card within that Dashboard pattern."

## 1.9 Relationship to Pattern Library

Patterns describe structural intent: information hierarchy, primary/secondary/supporting content zones, actions, workflows. Recipes are the concrete implementation of that structural intent using approved Components.

A Pattern is abstract. A Recipe is concrete.

| Pattern (Abstract) | Recipe (Concrete) |
|-------------------|-------------------|
| Dashboard pattern: KPIs plus charts plus activity | KPI Panel Recipe, Chart Summary Recipe, Activity Feed Recipe |
| Workspace pattern: list plus filters plus actions | Data Table Workspace Recipe, Search Toolbar Recipe, Bulk Action Bar Recipe |
| Form pattern: fields plus validation plus submit | Single Section Form Recipe, Multi-Section Form Recipe, Wizard Header Recipe |

## 1.10 Relationship to Component Specifications

02 Design System and Component Library defines individual components (Button, Text Field, Badge, etc.) and their composites (Search Field, Form Field, Pagination, etc.). Recipes compose these components into higher-level assemblies.

Recipes MUST NOT introduce new components. Every component in a Recipe MUST already be defined in 02 Design System and Component Library. If a Recipe requires a component that does not exist, the gap MUST be flagged and the component MUST be defined in 02 Design System and Component Library before the Recipe can be approved.

## 1.11 Relationship to UI Rendering Specification

UI Rendering Specification governs visual styling: colours, spacing, typography, materials, elevation, motion. Recipes govern structural composition: which components are assembled, in what order, with what hierarchy, and with what behaviour.

Recipes MUST NOT specify colours, spacing values, typography, or visual styling. Those decisions belong exclusively to UI Rendering Specification.

## 1.12 Relationship to Figma Generation Workflow

The Figma Build Roadmap defines the build order: Foundation, Primitives, Composites, Patterns, Templates, Screens. The Recipe Library maps to the transition between Patterns and Templates:

| Roadmap Phase | Recipe Library Equivalent |
|--------------|--------------------------|
| Phase 4 - Pattern Components | Recipe definitions (how patterns assemble from composites) |
| Phase 5 - Layout Templates | Recipe placement within page templates |
| Phase 6 - Module Screen Design | Recipe selection and assembly into screens |

## 1.13 Relationship to Design QA Specification

Design QA validates that assembled screens conform to specifications. Recipe validation rules (Section 9) provide the criteria that Design QA checks when validating recipe composition within screens.

---

# 2. Recipe Philosophy

---

## 2.1 What Is a Recipe

A Recipe is a structured composition of multiple Components working together to solve a specific user problem. A Recipe is not a Component. A Recipe is not a Pattern. A Recipe is a named, validated, reusable assembly that bridges the gap between abstract Patterns and concrete Screens.

Every School ERP screen MUST be assembled from approved Recipes. No screen SHOULD require undocumented interface assemblies.

## 2.2 Why Recipes Exist

| Problem | How Recipes Solve It |
|---------|---------------------|
| Screens built ad-hoc from components | Recipes enforce consistent composition |
| Same UI assembled differently across modules | Recipes standardize assembly rules |
| AI agents invent layouts | Recipes provide deterministic selection and assembly |
| Reviewers cannot validate composition | Recipes define pass/fail criteria |
| Components reused inconsistently | Recipes mandate which components compose together |
| No bridge between Patterns and Screens | Recipes connect abstract patterns to concrete assemblies |

## 2.3 Terminology Definitions

### Component

An atomic, indivisible UI element. Defined in 02 Design System and Component Library. Has variants, states, and behaviours. Cannot be decomposed further without losing meaning.

Examples: Button, Text Field, Badge, Avatar, Card, Data Table

### Recipe

A named, structured composition of multiple Components solving a specific user problem. Reusable across screens. Validated against deterministic rules. Does not introduce new components.

Examples: Student Summary Card, KPI Panel, Data Table Workspace, Search Toolbar

### Pattern

A structural template describing information hierarchy, content zones, actions, and workflows for a class of screens. Abstract. Does not specify individual components.

Examples: Dashboard Pattern, Workspace Pattern, Form Pattern, Reporting Pattern

### Screen

A complete application view that a user interacts with. Assembled from Patterns, which are implemented by Recipes, which are built from Components.

Examples: Student List Screen, Grade Book Screen, Fee Management Screen

### Blueprint

A structured intent document describing what a screen contains, why it exists, and what users accomplish. Does not prescribe visual layout. Defined in Screen Blueprint Specification.

### Layout

The spatial arrangement of Components within a container. Governed by UI Rendering Specification (grid, spacing, materials). Recipes define structural hierarchy; layouts define visual positioning.

### Template

A full page structure defining layout composition with named content zones and slot definitions. Defined in 02 Design System and Component Library Section 2.15. Templates are populated by Recipes during Phase 6.

### View

A specific visual state of a screen or component. Includes loaded, loading, empty, error, and success states. Recipes MUST define behaviour for all expected views.

### Workflow

A sequence of screens or states that a user navigates to complete a task. Recipes support workflows by defining transitions, next steps, and completion criteria.

## 2.4 The Composition Hierarchy

The Design System defines a 5-level composition hierarchy. The Recipe Library adds a 6th level:

| Level | Definition | Owner | Examples |
|-------|-----------|-------|----------|
| Primitive | Atomic, indivisible components | 02 Design System | Button, Input, Badge, Icon |
| Composite | Combinations of 2-3 primitives | 02 Design System | Search Field, Form Field, Pagination |
| Pattern | Reusable structural patterns | 02 Design System + Pattern Library | Data Table, Form Layout, Stat Card |
| **Recipe** | **Named compositions solving user problems** | **This document** | **KPI Panel, Student Summary Card, Data Table Workspace** |
| Template | Full page structures with content zones | 02 Design System + Figma Build Roadmap | Dashboard, CRUD List, Detail View |
| Screen | Complete application views | Screen Blueprint Specification + Phase 6 | Student List, Grade Book, Fee Management |

## 2.5 Why Screens Are Assembled From Recipes

Screens SHOULD NOT be assembled by directly combining individual Components. The reasons:

| Reason | Explanation |
|--------|-------------|
| **Consistency** | Same Recipe produces same structure across all screens |
| **Scalability** | New screens reuse existing Recipes rather than inventing new assemblies |
| **Maintainability** | Changing a Recipe updates all screens that use it |
| **AI determinism** | Selection rules eliminate subjective interpretation |
| **Review efficiency** | Reviewers validate against known Recipe rules rather than ad-hoc composition |
| **Reduced cognitive load** | Designers select from named Recipes rather than composing from scratch |

## 2.6 How Recipes Improve Consistency

When every screen uses the same Data Table Workspace Recipe, every data list screen has identical structure: Search Toolbar at top, Filter Bar below, Data Table in the centre, Bulk Action Bar at bottom, Pagination footer. The only variation is the data itself.

## 2.7 How Recipes Improve Scalability

When a new module requires a data list screen, the designer selects the Data Table Workspace Recipe rather than composing a new layout from Button, Text Field, Table, and Pagination components. The Recipe provides the complete assembly.

## 2.8 How Recipes Improve Maintainability

When the Search Toolbar Recipe needs a new filter variant, the change propagates to every screen using that Recipe. Without Recipes, each screen would need individual updates.

## 2.9 How Recipes Improve AI Determinism

The Selection Rules (Section 8) provide deterministic algorithms for choosing Recipes. Given a screen's pattern, business goal, and data characteristics, the algorithm produces exactly one Recipe recommendation. No subjective interpretation remains.

---

# 3. Recipe Lifecycle

---

## 3.1 Lifecycle Stages

```
Business Requirement
    |
    v
Engineering Specification
    |
    v
Screen Blueprint
    |
    v
Pattern Selection
    |
    v
Recipe Selection
    |
    v
Component Assembly
    |
    v
UI Rendering
    |
    v
Figma Generation
    |
    v
Design QA
```

## 3.2 Stage Responsibilities

| Stage | Owner | Responsibility | Input | Output |
|-------|-------|---------------|-------|--------|
| Business Requirement | Product | Define what users need | User research, domain knowledge | Requirement document |
| Engineering Specification | Engineering | Define data models, APIs, business rules | Requirements | 10 domain specs |
| Screen Blueprint | Design | Define what each screen contains and why | Engineering specs | Screen Blueprint per screen |
| Pattern Selection | Design | Select approved Pattern from Pattern Library | Screen Blueprint | Pattern assignment |
| Recipe Selection | Design / AI | Select Recipes that implement the Pattern | Pattern, Blueprint, Selection Rules | Recipe list per screen |
| Component Assembly | Design / Figma | Assemble Components per Recipe definitions | Recipes | Composed UI |
| UI Rendering | Figma / AI | Apply visual styling per UI Rendering Specification | Assembled UI | Styled screen |
| Figma Generation | Figma / AI | Build complete Figma frames with components | Styled screens | Figma designs |
| Design QA | QA | Validate against all specifications | Figma designs | Pass/Fail report |

## 3.3 Gate Rules

| Gate | Criteria | Blocks |
|------|----------|--------|
| Blueprint to Pattern | Blueprint approved, pattern selected | Recipe selection |
| Pattern to Recipe | Pattern selected, selection rules executed | Component assembly |
| Recipe to Assembly | All required recipes identified, no gaps | UI rendering |
| Assembly to Rendering | All recipes assembled, components are library instances | Figma generation |
| Rendering to QA | Visual styling applied per UI Rendering Specification | Design QA |
| QA to Handoff | Zero blocking violations | Developer handoff |

## 3.4 Recipe Approval Process

| Step | Action | Criteria |
|------|--------|----------|
| 1 | Recipe proposed | Problem statement, target users, expected screens |
| 2 | Component inventory listed | All components from 02 Design System identified |
| 3 | Composition defined | Component order, hierarchy, rules documented |
| 4 | Validation checklist created | Pass/fail criteria defined |
| 5 | Pattern compatibility verified | Compatible with at least one Pattern |
| 6 | Review completed | No gaps, no new components, no visual styling |
| 7 | Approved | Added to Recipe Categories (Section 5) |

---

# 4. Recipe Structure

---

## 4.1 Overview

Every Recipe MUST define all fields in this section. Fields are grouped into: Identity, Context, Composition, Behaviour, and Validation.

## 4.2 Identity Fields

### Recipe Identifier

| Aspect | Detail |
|--------|--------|
| **Purpose** | Unique identifier for the Recipe |
| **Accepted Values** | Format: `RC-[CATEGORY]-[NAME]-[VERSION]` where CATEGORY is uppercase abbreviation, NAME is descriptive, VERSION is major number |
| **Validation Rules** | MUST be unique across all Recipes. MUST NOT change once approved. Version increments on breaking changes. |
| **Common Mistakes** | Using abbreviations that are ambiguous. Changing identifiers after approval. |
| **Examples** | `RC-DASH-KPI-PANEL-1`, `RC-DATA-TABLE-WORKSPACE-1`, `RC-STU-SUMMARY-CARD-1` |

### Recipe Name

| Aspect | Detail |
|--------|--------|
| **Purpose** | Human-readable name |
| **Accepted Values** | 2-5 words, Title Case, descriptive |
| **Validation Rules** | MUST be unique. MUST NOT use abbreviations. MUST describe what the Recipe produces. |
| **Common Mistakes** | Names that describe components rather than the assembly. Names too similar to existing Recipes. |
| **Examples** | KPI Panel, Student Summary Card, Data Table Workspace, Search Toolbar |

## 4.3 Context Fields

### Purpose

| Aspect | Detail |
|--------|--------|
| **Purpose** | One sentence describing what this Recipe solves |
| **Accepted Values** | Complete sentence, active voice |
| **Validation Rules** | MUST start with a verb. MUST describe the user problem, not the component assembly. |
| **Common Mistakes** | Describing the components instead of the problem. Vague or overly broad statements. |
| **Examples** | "Display key performance indicators at a glance." "Present a student's essential information in a compact card." |

### Business Objective

| Aspect | Detail |
|--------|--------|
| **Purpose** | Organisational goal served by this Recipe |
| **Accepted Values** | Reference to a business requirement or engineering spec section |
| **Validation Rules** | MUST trace to an approved source. MUST NOT be invented. |
| **Common Mistakes** | Inventing business objectives. Not tracing to approved sources. |
| **Examples** | "Enable administrators to monitor institution health in real time." |

### User Goal

| Aspect | Detail |
|--------|--------|
| **Purpose** | What the user achieves by interacting with this Recipe |
| **Accepted Values** | Complete sentence, user perspective |
| **Validation Rules** | MUST be achievable within the Recipe scope. MUST NOT require navigation to other screens. |
| **Common Mistakes** | Goals that require multiple screens. Goals that describe system behaviour rather than user outcomes. |
| **Examples** | "Understand current fee collection status in under 5 seconds." |

### Parent Pattern

| Aspect | Detail |
|--------|--------|
| **Purpose** | Which Pattern(s) this Recipe implements |
| **Accepted Values** | One or more Pattern IDs from Pattern Library |
| **Validation Rules** | MUST reference approved Patterns. MUST include rationale for each. |
| **Common Mistakes** | Referencing Patterns that do not exist. Selecting multiple conflicting Patterns. |
| **Examples** | `PAT-DASH-EXEC`, `PAT-WORK-LIST`, `PAT-FORM-SINGLE` |

### Typical Screen Types

| Aspect | Detail |
|--------|--------|
| **Purpose** | Which screen types commonly use this Recipe |
| **Accepted Values** | List of screen types from Screen Blueprint Specification |
| **Validation Rules** | MUST reference valid screen types. MUST be non-empty. |
| **Common Mistakes** | Listing screen types that never use this Recipe. |
| **Examples** | Dashboard, List View, Detail View, Report |

### Primary User

| Aspect | Detail |
|--------|--------|
| **Purpose** | Which persona primarily interacts with this Recipe |
| **Accepted Values** | One or more personas from UI Strategy Section 3.2 |
| **Validation Rules** | MUST reference approved personas. |
| **Examples** | Administrator, Teacher, Student, Parent, Platform Operator |

### Usage Frequency

| Aspect | Detail |
|--------|--------|
| **Purpose** | How often this Recipe appears across the application |
| **Accepted Values** | `HIGH` (10+ screens), `MEDIUM` (3-9 screens), `LOW` (1-2 screens) |
| **Validation Rules** | MUST be determined by counting actual screen usage, not estimation. |
| **Common Mistakes** | Overestimating frequency. Not counting actual usage. |
| **Examples** | HIGH for Data Table Workspace, LOW for AI Assistant Panel |

## 4.4 Composition Fields

### Required Components

| Aspect | Detail |
|--------|--------|
| **Purpose** | Components that MUST be present for the Recipe to function |
| **Accepted Values** | List of component names from 02 Design System |
| **Validation Rules** | Every component MUST exist in 02 Design System. MUST NOT be empty. Order matters. |
| **Common Mistakes** | Including components not defined in 02 Design System. Omitting critical components. |
| **Examples** | Data Table, Search Field, Filter Panel, Pagination, Action Bar |

### Optional Components

| Aspect | Detail |
|--------|--------|
| **Purpose** | Components that MAY be present based on screen requirements |
| **Accepted Values** | List of component names from 02 Design System with inclusion criteria |
| **Validation Rules** | Every component MUST exist in 02 Design System. MUST include criteria for when to include. |
| **Common Mistakes** | Making too many components optional. Not defining inclusion criteria. |
| **Examples** | Bulk Action Bar (include when bulk operations supported), Export Button (include when data export required) |

### Component Order

| Aspect | Detail |
|--------|--------|
| **Purpose** | The reading/interaction order of components within the Recipe |
| **Accepted Values** | Numbered list from top-left to bottom-right reading order |
| **Validation Rules** | MUST follow top-to-bottom, left-to-right reading order per UI Rendering Specification. MUST be deterministic. |
| **Common Mistakes** | Ambiguous ordering. Order that violates reading direction. |
| **Examples** | 1. Search Toolbar, 2. Filter Bar, 3. Data Table, 4. Bulk Action Bar, 5. Pagination Footer |

### Hierarchy Rules

| Aspect | Detail |
|--------|--------|
| **Purpose** | How components are nested and grouped |
| **Accepted Values** | Description of container relationships and nesting |
| **Validation Rules** | MUST NOT exceed 4 levels of component nesting per 02 Design System Section 5.5. MUST use Auto Layout. |
| **Common Mistakes** | Deep nesting that breaks accessibility. Containers without purpose. |
| **Examples** | Search Toolbar wraps Search Field and Filter Toggle. Data Table wraps Table, column headers, and row content. |

### Content Rules

| Aspect | Detail |
|--------|--------|
| **Purpose** | Constraints on what content each component displays |
| **Accepted Values** | Per-component content rules (max length, format, required fields) |
| **Validation Rules** | MUST reference data requirements from Screen Blueprint. MUST NOT invent data fields. |
| **Common Mistakes** | Specifying content that the data model does not support. |
| **Examples** | Student Summary Card MUST display: name, ID, grade, status. MAY display: photo, attendance %. |

### Data Requirements

| Aspect | Detail |
|--------|--------|
| **Purpose** | What data the Recipe requires to render |
| **Accepted Values** | List of data fields with types and source API |
| **Validation Rules** | MUST trace to engineering specification entities and fields. MUST NOT invent fields. |
| **Common Mistakes** | Referencing fields that do not exist in the data model. |
| **Examples** | student.name (string), student.publicId (string), student.status (enum), student.grade.name (string) |

## 4.5 Action Fields

### Primary Actions

| Aspect | Detail |
|--------|--------|
| **Purpose** | The main actions users take within this Recipe |
| **Accepted Values** | List of action names with trigger and outcome |
| **Validation Rules** | MUST align with Screen Blueprint action definitions. MUST have clear trigger (click, tap, keyboard) and outcome. |
| **Common Mistakes** | Actions without clear outcomes. Too many primary actions (max 2). |
| **Examples** | View Details (click row -> navigate to detail), Create New (click button -> open form) |

### Secondary Actions

| Aspect | Detail |
|--------|--------|
| **Purpose** | Supporting actions available but not primary |
| **Accepted Values** | List of action names with trigger and outcome |
| **Validation Rules** | MUST be visually subordinate to primary actions. MUST NOT compete for attention. |
| **Common Mistakes** | Making secondary actions too prominent. |
| **Examples** | Export (click icon -> download), Filter (click toggle -> show filter panel) |

## 4.6 State Fields

### Empty State

| Aspect | Detail |
|--------|--------|
| **Purpose** | What displays when the Recipe has no data |
| **Accepted Values** | Empty State component configuration per 02 Design System Section 3.3.7 |
| **Validation Rules** | MUST include headline, description, and optional action. MUST NOT show blank space. |
| **Common Mistakes** | Blank screen with no guidance. Generic "No data" message without context. |
| **Examples** | "No students enrolled yet. Create your first student to get started." with Create button |

### Loading State

| Aspect | Detail |
|--------|--------|
| **Purpose** | What displays while data is being fetched |
| **Accepted Values** | Skeleton Loader or Loading Spinner per 02 Design System Section 3.3.6 |
| **Validation Rules** | MUST match the layout of the loaded state. MUST appear within 300ms of initiation. |
| **Common Mistakes** | Loading spinner on a full page (use skeleton). No loading indicator. |
| **Examples** | Skeleton rows matching Data Table layout during data fetch |

### Error State

| Aspect | Detail |
|--------|--------|
| **Purpose** | What displays when data fetching fails |
| **Accepted Values** | Error State component per 02 Design System Section 3.3.8 |
| **Validation Rules** | MUST include error description and retry action. MUST NOT expose technical details. |
| **Common Mistakes** | Showing raw error messages. No retry mechanism. |
| **Examples** | "Unable to load student data. Check your connection and try again." with Retry button |

## 4.7 Permission Fields

### Permissions

| Aspect | Detail |
|--------|--------|
| **Purpose** | How the Recipe adapts based on user permissions |
| **Accepted Values** | Permission matrix mapping roles to component visibility/editability |
| **Validation Rules** | MUST follow 02 Design System Section 3.5 permission states. MUST include all 7 states where applicable. |
| **Common Mistakes** | Assuming all users see all components. Not handling permission-denied gracefully. |
| **Examples** | Admin: full access. Teacher: read-only on student data. Student: own data only. |

## 4.8 Behaviour Fields

### Responsive Behaviour

| Aspect | Detail |
|--------|--------|
| **Purpose** | How the Recipe adapts at different breakpoints |
| **Accepted Values** | Breakpoint-specific layout rules per 02 Design System Section 1.12 |
| **Validation Rules** | MUST define behaviour at Desktop, Tablet, and Mobile. MUST use responsive tokens. |
| **Common Mistakes** | Only defining desktop layout. Not accounting for touch targets on mobile. |
| **Examples** | Desktop: horizontal filter bar. Tablet: stacked filters. Mobile: filter drawer. |

### Accessibility Considerations

| Aspect | Detail |
|--------|--------|
| **Purpose** | Accessibility requirements specific to this Recipe |
| **Accepted Values** | ARIA roles, keyboard navigation, screen reader labels |
| **Validation Rules** | MUST meet WCAG 2.1 AA per 02 Design System Section 5.2. MUST include keyboard navigation order. |
| **Common Mistakes** | Missing ARIA labels. Tab order that does not match visual order. |
| **Examples** | Data Table: role="grid", row headers, column sort keyboard shortcuts |

## 4.9 Intelligence Fields

### AI Opportunities

| Aspect | Detail |
|--------|--------|
| **Purpose** | Where AI can enhance the Recipe |
| **Accepted Values** | List of AI enhancement opportunities with expected behaviour |
| **Validation Rules** | MUST reference approved AI patterns from Pattern Library. MUST NOT require AI to function. |
| **Common Mistakes** | Making the Recipe dependent on AI. Vague AI suggestions. |
| **Examples** | Suggested filters based on user history. Auto-categorisation of items. |

### Analytics Events

| Aspect | Detail |
|--------|--------|
| **Purpose** | What user interactions should be tracked |
| **Accepted Values** | List of event names with properties |
| **Validation Rules** | MUST include at minimum: recipe_viewed, primary_action_triggered, empty_state_shown |
| **Common Mistakes** | Not tracking empty states. Not tracking error states. |
| **Examples** | recipe_viewed, filter_applied, row_clicked, export_triggered |

## 4.10 Dependency Fields

### Dependencies

| Aspect | Detail |
|--------|--------|
| **Purpose** | Other Recipes or components this Recipe depends on |
| **Accepted Values** | List of Recipe IDs or component names |
| **Validation Rules** | MUST be non-circular. MUST be satisfiable with existing Recipes/components. |
| **Common Mistakes** | Circular dependencies. Dependencies on undefined Recipes. |
| **Examples** | Data Table Workspace depends on Search Toolbar Recipe |

## 4.11 Validation Fields

### Anti-Patterns

| Aspect | Detail |
|--------|--------|
| **Purpose** | Known failure modes and conflicting compositions |
| **Accepted Values** | List of anti-patterns with rationale |
| **Validation Rules** | MUST include at least one anti-pattern. MUST explain why each conflicts. |
| **Common Mistakes** | Omitting anti-patterns. Anti-patterns that are too vague. |
| **Examples** | Do not embed a full Form within a KPI Panel. Do not nest Data Table within Data Table. |

### Validation Checklist

| Aspect | Detail |
|--------|--------|
| **Purpose** | Checklist for reviewing Recipe compliance |
| **Accepted Values** | Numbered checklist items |
| **Validation Rules** | MUST cover: required components present, optional components justified, order correct, states defined, permissions defined, responsive defined. |
| **Common Mistakes** | Checklists that are too vague to be actionable. |
| **Examples** | 1. All required components present. 2. Component order matches reading order. 3. Empty state defined. |

### Pass/Fail Criteria

| Aspect | Detail |
|--------|--------|
| **Purpose** | Objective criteria for approving or rejecting a Recipe |
| **Accepted Values** | Binary pass/fail criteria |
| **Validation Rules** | MUST be objectively measurable. MUST NOT require subjective judgement. |
| **Common Mistakes** | Criteria that require interpretation. |
| **Examples** | PASS: all required components present AND order correct AND states defined. FAIL: any criterion not met. |

---

# 5. Recipe Categories

---

## 5.1 Category Registry

| Category | Abbreviation | Recipe Count | Description |
|----------|-------------|-------------|-------------|
| Dashboard | DASH | 8 | Overview panels, KPI displays, metric summaries |
| Data | DATA | 8 | List management, filtering, search, import/export |
| Student | STU | 7 | Student-specific information displays |
| Teacher | TCH | 4 | Teacher-specific information displays |
| Finance | FIN | 6 | Financial information and transaction displays |
| Academic | ACA | 6 | Academic performance and curriculum displays |
| Administration | ADM | 6 | System configuration and management displays |
| AI | AI | 5 | AI-assisted interface assemblies |
| Communication | COM | 4 | Messaging and notification displays |
| Planning | PLAN | 4 | Calendar and schedule displays |
| **Total** | | **58** | |

## 5.2 Category Selection Matrix

| Category | Primary User Goal | Typical Patterns | Density |
|----------|------------------|-----------------|---------|
| Dashboard | Monitor, overview | PAT-DASH-* | Medium-High |
| Data | Manage, operate | PAT-WORK-* | Medium-High |
| Student | View student info | PAT-WORK-*, PAT-DASH-* | Medium |
| Teacher | View teaching info | PAT-WORK-*, PAT-DASH-* | Medium |
| Finance | View financial data | PAT-WORK-*, PAT-RPT-* | Medium-High |
| Academic | View academic data | PAT-WORK-*, PAT-RPT-* | Medium |
| Administration | Configure, monitor | PAT-WORK-*, PAT-ADM-* | Medium-High |
| AI | Assist, recommend | PAT-AI-* | Variable |
| Communication | Message, notify | PAT-COM-* | Low-Medium |
| Planning | Schedule, plan | PAT-PLAN-* | Medium |

---

# 5A. Dashboard Recipes

---

## 5A.1 KPI Panel

**Recipe ID:** `RC-DASH-KPI-PANEL-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display 2-6 key performance indicators in a scannable grid |
| **Business Objective** | Enable rapid assessment of critical metrics without navigation |
| **User Goal** | Understand current performance status in under 5 seconds |
| **Parent Pattern** | PAT-DASH-EXEC, PAT-DASH-OPS, PAT-DASH-ROLE |
| **Typical Screen Types** | Dashboard, Report Landing, Analytics Overview |
| **Primary User** | Administrator, Principal, Platform Operator |
| **Usage Frequency** | HIGH (15+ screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | Low (read + drill-down) |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container for each KPI |
| Text Field (heading) | Yes | 2 | KPI label |
| Text Field (value) | Yes | 3 | KPI value |
| Badge | Yes | 4 | Trend indicator (up/down/stable) |
| Icon | Optional | 5 | Status icon (include when status has visual meaning) |
| Progress Bar | Optional | 6 | Progress toward target (include when target exists) |
| Tooltip | Optional | 7 | Additional context on hover |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card container wraps all. 2. Heading at top. 3. Value prominently centred. 4. Trend badge at right of value. 5. Icon at left of heading (if applicable). 6. Progress bar at bottom (if applicable). |
| **Hierarchy Rules** | Each KPI is an independent Card. Cards are arranged in a responsive grid (4 columns desktop, 2 tablet, 1 mobile). No nesting within Cards. |
| **Content Rules** | Heading: max 3 words. Value: formatted number or percentage. Trend: single arrow plus percentage change. |
| **Data Requirements** | metric.value (number), metric.label (string), metric.trend (enum: up/down/stable), metric.trendValue (percentage) |
| **Primary Actions** | Drill Down (click card -> navigate to detailed view) |
| **Secondary Actions** | None |
| **Empty State** | Show Card with "--" value and "No data available" tooltip |
| **Loading State** | Skeleton Loader matching Card layout |
| **Error State** | Card with "Unable to load" and Retry link |
| **Permissions** | All roles: read-only. Admin: full visibility. Teacher: own metrics only. Student: own metrics only. |
| **Responsive** | Desktop: 4-column grid. Tablet: 2-column grid. Mobile: single column stack. |
| **Accessibility** | Card role="article", heading level h3, value as aria-label |
| **AI Opportunities** | Anomaly detection on trend values. Predictive next-period projections. |
| **Analytics Events** | kpi_panel_viewed, kpi_card_clicked, kpi_drill_down |
| **Anti-Patterns** | More than 6 KPIs in one panel. KPIs without trend indicators. Values without context (raw numbers without labels). |
| **Validation Checklist** | 1. All required components present. 2. Grid responsive at all breakpoints. 3. Each KPI has heading, value, trend. 4. Empty/loading/error states defined. |
| **Pass/Fail** | PASS: 2-6 KPIs, each with Card plus heading plus value plus trend, responsive grid, states defined. FAIL: any criterion not met. |

---

## 5A.2 Metric Grid

**Recipe ID:** `RC-DASH-METRIC-GRID-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display a dense grid of 7+ metrics with compact formatting |
| **Business Objective** | Provide comprehensive metric overview for data-dense dashboards |
| **User Goal** | Scan many metrics simultaneously to identify outliers |
| **Parent Pattern** | PAT-DASH-OPS, PAT-DASH-EXEC |
| **Typical Screen Types** | Operations Dashboard, Analytics Overview |
| **Primary User** | Platform Operator, Administrator |
| **Usage Frequency** | MEDIUM (5 screens) |
| **Information Density** | High |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container for each metric |
| Text Field (label) | Yes | 2 | Metric name |
| Text Field (value) | Yes | 3 | Metric value |
| Badge | Yes | 4 | Status badge (healthy/warning/critical) |
| Separator | Optional | 5 | Visual divider between metric groups |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Grid of Cards. 2. Each Card: label top, value centre, status badge bottom-right. 3. Separator between logical groups. |
| **Hierarchy Rules** | Compact grid layout. Cards are smaller than KPI Panel Cards. No nesting. |
| **Content Rules** | Label: max 2 words. Value: compact format (1.2K, 99%, etc.). Status: colour-coded badge. |
| **Data Requirements** | metric.label (string), metric.value (string), metric.status (enum: healthy/warning/critical) |
| **Primary Actions** | Click metric -> detailed view |
| **Empty State** | Grid with placeholder Cards showing "--" |
| **Loading State** | Skeleton grid matching layout |
| **Error State** | Individual metric Cards show error state independently |
| **Permissions** | Platform Operator: full. Administrator: institution metrics only. |
| **Responsive** | Desktop: 4-6 column grid. Tablet: 3 column. Mobile: 2 column. |
| **Accessibility** | Each Card role="article", label as heading, value as aria-label |
| **Anti-Patterns** | More than 12 metrics in one grid. Metrics without status indicators. Inconsistent value formatting. |
| **Validation Checklist** | 1. Grid responsive. 2. Each metric has label, value, status. 3. Compact density. |

---

## 5A.3 Performance Summary

**Recipe ID:** `RC-DASH-PERF-SUMMARY-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display aggregated performance data with trend chart |
| **Business Objective** | Show performance over time alongside current values |
| **User Goal** | Understand current performance and recent trend in one view |
| **Parent Pattern** | PAT-DASH-ROLE, PAT-DASH-ACADEMIC |
| **Typical Screen Types** | Teacher Dashboard, Student Dashboard, Class Dashboard |
| **Primary User** | Teacher, Student, Parent |
| **Usage Frequency** | MEDIUM (7 screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | Low-Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Text Field (heading) | Yes | 2 | Performance title |
| Text Field (value) | Yes | 3 | Current score/grade |
| Badge | Yes | 4 | Trend indicator |
| Chart Card | Yes | 5 | Trend line chart |
| Separator | Optional | 6 | Divider before detail |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card wraps all. 2. Heading top-left. 3. Value top-right. 4. Trend badge beside value. 5. Chart Card fills remaining width. 6. Separator before optional detail row. |
| **Hierarchy Rules** | Single Card containing header row and chart. Chart is primary visual element. |
| **Data Requirements** | performance.title (string), performance.currentValue (number), performance.trend (enum), performance.history (array of {date, value}) |
| **Primary Actions** | Click chart -> detailed analytics view |
| **Empty State** | Card with "No performance data yet" |
| **Loading State** | Skeleton Card with chart placeholder |
| **Accessibility** | Chart has aria-label, data table fallback for screen readers |
| **Anti-Patterns** | Chart without axis labels. Multiple trend lines without legend. Values without time context. |
| **Validation Checklist** | 1. Header with value and trend. 2. Chart with labels. 3. Responsive. 4. States defined. |

---

## 5A.4 Attendance Overview

**Recipe ID:** `RC-DASH-ATTEND-OVERVIEW-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display attendance summary with today's status and recent trend |
| **Business Objective** | Provide quick attendance insight for students, teachers, parents |
| **User Goal** | Check attendance status and identify patterns in under 5 seconds |
| **Parent Pattern** | PAT-DASH-ROLE, PAT-DASH-ACADEMIC |
| **Typical Screen Types** | Student Dashboard, Teacher Dashboard, Parent Dashboard |
| **Primary User** | Student, Teacher, Parent |
| **Usage Frequency** | MEDIUM (6 screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Text Field (heading) | Yes | 2 | "Attendance" label |
| Text Field (value) | Yes | 3 | Percentage or today's status |
| Badge | Yes | 4 | Status badge (present/absent/tardy) |
| Progress Bar | Yes | 5 | Term attendance progress |
| Chart Card | Optional | 6 | Weekly trend chart |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card. 2. Heading top-left. 3. Percentage value top-right. 4. Status badge for today. 5. Progress bar below. 6. Chart at bottom (optional). |
| **Data Requirements** | attendance.percentage (number), attendance.todayStatus (enum: present/absent/tardy/excused), attendance.termProgress (number 0-100), attendance.weeklyHistory (array) |
| **Primary Actions** | Click -> full attendance history |
| **Empty State** | "No attendance records yet" |
| **Loading State** | Skeleton Card |
| **Permissions** | Student: own attendance. Teacher: own class. Parent: own children. |
| **Anti-Patterns** | Percentage without context. Status without today's date. |
| **Validation Checklist** | 1. Percentage displayed. 2. Today's status shown. 3. Progress bar present. 4. States defined. |

---

## 5A.5 Financial Snapshot

**Recipe ID:** `RC-DASH-FIN-SNAPSHOT-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display key financial metrics (collected, outstanding, overdue) |
| **Business Objective** | Provide financial health overview at a glance |
| **User Goal** | Assess collection status and outstanding amounts in under 10 seconds |
| **Parent Pattern** | PAT-DASH-FINANCE |
| **Typical Screen Types** | Finance Dashboard, Administrator Dashboard |
| **Primary User** | Administrator, Finance Officer |
| **Usage Frequency** | LOW (3 screens) |
| **Information Density** | Medium-High |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Text Field (heading) | Yes | 2 | Metric label |
| Text Field (value) | Yes | 3 | Currency-formatted value |
| Badge | Yes | 4 | Trend indicator |
| Progress Bar | Optional | 5 | Collection rate |
| Chart Card | Optional | 6 | Monthly collection trend |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Grid of Cards (collected, outstanding, overdue, collection rate). 2. Each Card: label, currency value, trend. 3. Collection rate Card has Progress Bar. 4. Trend chart below grid. |
| **Data Requirements** | finance.collected (currency), finance.outstanding (currency), finance.overdue (currency), finance.collectionRate (percentage), finance.monthlyTrend (array) |
| **Primary Actions** | Click outstanding -> invoice list. Click overdue -> overdue list. |
| **Empty State** | "No financial data for this period" |
| **Loading State** | Skeleton grid |
| **Permissions** | Administrator: full. Finance Officer: full. Teacher: class-level only. |
| **Anti-Patterns** | Currency values without formatting. No distinction between outstanding and overdue. |
| **Validation Checklist** | 1. Currency values formatted. 2. Trend indicators present. 3. Collection rate displayed. 4. States defined. |

---

## 5A.6 Quick Actions

**Recipe ID:** `RC-DASH-QUICK-ACTIONS-1`

| Field | Value |
|-------|-------|
| **Purpose** | Provide shortcuts to common tasks from a dashboard |
| **Business Objective** | Reduce time to complete frequent operations |
| **User Goal** | Access most common tasks in one click |
| **Parent Pattern** | PAT-DASH-EXEC, PAT-DASH-ROLE |
| **Typical Screen Types** | Any Dashboard |
| **Primary User** | All roles |
| **Usage Frequency** | HIGH (12+ screens) |
| **Information Density** | Low |
| **Interaction Complexity** | Low (single click) |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Button | Yes | 2 | Action buttons |
| Icon | Yes | 3 | Icon for each action |
| Text Field | Yes | 4 | Action label |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card. 2. Grid of action items (2-6 actions). 3. Each item: Icon above, label below, entire item clickable. |
| **Hierarchy Rules** | Grid layout, 3 columns desktop, 2 tablet, 1 mobile. Each action is an equal-size tile. |
| **Content Rules** | Max 6 actions. Label: max 2 words. Icon: from approved icon library. |
| **Data Requirements** | actions[] (array of {label, icon, route}) |
| **Primary Actions** | Click action -> navigate to target route |
| **Empty State** | Not applicable (recipe only shows when actions exist) |
| **Loading State** | Not applicable |
| **Permissions** | Actions filtered by user role permissions |
| **Anti-Patterns** | More than 6 actions. Actions without icons. Nested actions. |
| **Validation Checklist** | 1. 2-6 actions. 2. Each has icon and label. 3. Grid responsive. 4. Permissions filtered. |

---

## 5A.7 Recent Activity

**Recipe ID:** `RC-DASH-RECENT-ACTIVITY-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display chronological list of recent system events |
| **Business Objective** | Provide audit trail visibility and situational awareness |
| **User Goal** | Understand what happened recently without navigating to audit logs |
| **Parent Pattern** | PAT-DASH-EXEC, PAT-DASH-OPS |
| **Typical Screen Types** | Dashboard, Operations Dashboard |
| **Primary User** | Administrator, Platform Operator |
| **Usage Frequency** | MEDIUM (8 screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | Low (scroll + click) |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Media Object | Yes | 2 | Each activity item |
| Avatar | Yes | 3 | Actor avatar |
| Text Field | Yes | 4 | Activity description |
| Badge | Yes | 5 | Activity type badge |
| Separator | Yes | 6 | Divider between items |
| Button | Optional | 7 | "View all" link |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card. 2. Heading "Recent Activity". 3. List of Media Objects. 4. Each: Avatar left, description centre, type badge right. 5. Separator between items. 6. "View all" button at bottom. |
| **Content Rules** | Max 10 items. Description: max 80 characters with ellipsis. Relative timestamps ("2 min ago"). |
| **Data Requirements** | activity[].actor (person), activity[].action (string), activity[].target (string), activity[].timestamp (datetime), activity[].type (enum) |
| **Primary Actions** | Click item -> navigate to detail |
| **Secondary Actions** | View all (navigate to full activity log) |
| **Empty State** | "No recent activity" |
| **Loading State** | Skeleton list with 5 placeholder items |
| **Anti-Patterns** | More than 10 items without pagination. Timestamps as absolute dates only. Descriptions without actor context. |
| **Validation Checklist** | 1. Max 10 items. 2. Each has avatar, description, timestamp, type. 3. Scrollable. 4. States defined. |

---

## 5A.8 Upcoming Events

**Recipe ID:** `RC-DASH-UPCOMING-EVENTS-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display upcoming calendar events and deadlines |
| **Business Objective** | Keep users informed of upcoming commitments |
| **User Goal** | See what is coming up in the next 7 days without navigating to calendar |
| **Parent Pattern** | PAT-DASH-ROLE, PAT-PLAN-EVENT |
| **Typical Screen Types** | Any Dashboard |
| **Primary User** | All roles |
| **Usage Frequency** | MEDIUM (9 screens) |
| **Information Density** | Low-Medium |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Media Object | Yes | 2 | Each event item |
| Badge | Yes | 3 | Event type badge |
| Text Field | Yes | 4 | Event title |
| Text Field | Yes | 5 | Event date/time |
| Button | Optional | 6 | "View calendar" link |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card. 2. Heading "Upcoming". 3. List of events. 4. Each: date on left, title centre, type badge right. 5. "View calendar" at bottom. |
| **Content Rules** | Max 5 events. Date format: relative ("Tomorrow", "In 3 days") or absolute for distant events. |
| **Data Requirements** | events[].title (string), events[].date (datetime), events[].type (enum: exam/assignment/event/meeting), events[].color (string) |
| **Primary Actions** | Click event -> event detail |
| **Secondary Actions** | View calendar -> full calendar view |
| **Empty State** | "No upcoming events" |
| **Loading State** | Skeleton list |
| **Anti-Patterns** | Events without dates. More than 5 items without "show more". Past events mixed with future. |
| **Validation Checklist** | 1. Max 5 events. 2. Each has title, date, type. 3. Sorted by date ascending. 4. States defined. |

---

# 5B. Data Recipes

---

## 5B.1 Data Table Workspace

**Recipe ID:** `RC-DATA-TABLE-WORKSPACE-1`

| Field | Value |
|-------|-------|
| **Purpose** | Complete data management workspace with search, filter, table, pagination, and bulk actions |
| **Business Objective** | Provide consistent data management across all modules |
| **User Goal** | Find, view, and manage records efficiently |
| **Parent Pattern** | PAT-WORK-LIST, PAT-WORK-DATA |
| **Typical Screen Types** | CRUD List, Data Management |
| **Primary User** | All roles |
| **Usage Frequency** | HIGH (127 screens) |
| **Information Density** | High |
| **Interaction Complexity** | High |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Search Field | Yes | 1 | Full-text search |
| Filter Panel | Yes | 2 | Advanced filtering |
| Data Table | Yes | 3 | Record display |
| Pagination | Yes | 4 | Page navigation |
| Action Bar | Yes | 5 | Primary actions (Create, Export) |
| Button | Yes | 6 | Bulk action trigger |
| Empty State | Yes | 7 | No records state |
| Skeleton Loader | Yes | 8 | Loading state |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Action Bar (top-right: Create button, Export button). 2. Search Field (full width). 3. Filter Panel (collapsible below search). 4. Data Table (fills remaining space). 5. Bulk Action Bar (appears when rows selected). 6. Pagination (below table). |
| **Hierarchy Rules** | Vertical stack: actions -> search -> filters -> table -> pagination. Bulk Action Bar overlays bottom of table when visible. |
| **Content Rules** | Table columns defined by Screen Blueprint data requirements. Search placeholder: "Search [entity]..." Filter count shown as badge on Filter toggle. |
| **Data Requirements** | records[] (array matching entity schema), totalCount (number), filters (object), searchQuery (string), page (number), pageSize (number) |
| **Primary Actions** | Create (navigate to form), View (click row -> detail), Edit (click edit icon -> form), Delete (click delete icon -> confirmation) |
| **Secondary Actions** | Export (download CSV/PDF), Bulk Select (checkbox column), Bulk Delete, Bulk Status Change |
| **Empty State** | "No [entity] found. Create your first [entity] to get started." with Create button |
| **Loading State** | Skeleton rows matching table layout (5 rows) |
| **Error State** | "Unable to load [entity] data. Check your connection and try again." with Retry |
| **Permissions** | Admin: full CRUD. Teacher: read + own records. Student: read own only. |
| **Responsive** | Desktop: full table. Tablet: condensed columns. Mobile: card-based list instead of table. |
| **Accessibility** | Table role="grid", sortable column headers, row selection with checkbox, keyboard navigation |
| **AI Opportunities** | Smart filter suggestions. Predictive search. Anomaly highlighting in data. |
| **Analytics Events** | workspace_viewed, search_performed, filter_applied, row_clicked, create_clicked, export_triggered, bulk_action_performed |
| **Anti-Patterns** | Table without search. Table without pagination (for 20+ records). Bulk actions without confirmation. |
| **Validation Checklist** | 1. Search present. 2. Filter Panel present. 3. Table with sortable columns. 4. Pagination present. 5. Create action present. 6. Empty/loading/error states. 7. Responsive at all breakpoints. |
| **Pass/Fail** | PASS: all 7 required components present, order correct, states defined, responsive. FAIL: any component missing or state undefined. |

---

## 5B.2 Search Toolbar

**Recipe ID:** `RC-DATA-SEARCH-TOOLBAR-1`

| Field | Value |
|-------|-------|
| **Purpose** | Provide search and basic filtering for a data workspace |
| **Business Objective** | Enable rapid record discovery |
| **User Goal** | Find specific records within a dataset |
| **Parent Pattern** | PAT-WORK-LIST |
| **Typical Screen Types** | Any list view |
| **Primary User** | All roles |
| **Usage Frequency** | HIGH (50+ screens) |
| **Information Density** | Low |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Search Field | Yes | 1 | Text search |
| Button (filter toggle) | Yes | 2 | Show/hide filter panel |
| Badge | Optional | 3 | Active filter count |
| Button (export) | Optional | 4 | Export action |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Search Field (left, fills available width). 2. Filter toggle button (right of search). 3. Filter count badge (on toggle button). 4. Export button (far right, optional). |
| **Content Rules** | Search placeholder: "Search [entity name]..." Debounce: 300ms. Min search length: 2 characters. |
| **Data Requirements** | searchQuery (string), activeFilterCount (number) |
| **Primary Actions** | Type -> search results update. Click filter toggle -> filter panel visible. |
| **Responsive** | Desktop: horizontal layout. Mobile: search full width, filter icon below. |
| **Anti-Patterns** | Search without debounce. Search without clear button. Filter badge without count. |
| **Validation Checklist** | 1. Search Field present. 2. Filter toggle present. 3. Debounce configured. 4. Clear button present. |

---

## 5B.3 Filter Bar

**Recipe ID:** `RC-DATA-FILTER-BAR-1`

| Field | Value |
|-------|-------|
| **Purpose** | Provide structured filtering controls for data narrowing |
| **Business Objective** | Enable precise data subsetting |
| **User Goal** | Narrow dataset to relevant subset |
| **Parent Pattern** | PAT-WORK-LIST |
| **Typical Screen Types** | CRUD List, Report |
| **Primary User** | All roles |
| **Usage Frequency** | HIGH (40+ screens) |
| **Information Density** | Low |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Select | Yes | 1 | Dropdown filters |
| Checkbox | Optional | 2 | Boolean filters |
| Date Picker | Optional | 3 | Date range filters |
| Button (clear) | Yes | 4 | Clear all filters |
| Badge | Yes | 5 | Active filter indicators |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Row of Select dropdowns (horizontally arranged). 2. Checkbox filters (if applicable). 3. Date Pickers (if date filtering needed). 4. Clear all button at right. 5. Active filter Badges below the filter row. |
| **Content Rules** | Filter options derived from data model enum values. Default: "All" selected. Max 6 simultaneous filters. |
| **Data Requirements** | filters{} (object matching filter schema), availableFilters[] (array of filter definitions) |
| **Primary Actions** | Select option -> filter applied. Clear -> all filters reset. |
| **Empty State** | Not applicable (filter bar always shows) |
| **Loading State** | Not applicable |
| **Responsive** | Desktop: horizontal row. Tablet: wrapping row. Mobile: stacked vertically or drawer. |
| **Anti-Patterns** | More than 6 filters visible simultaneously. Filters without clear option. Filters without visual indicator of active state. |
| **Validation Checklist** | 1. Filters match data model. 2. Clear button present. 3. Active state indicators present. 4. Responsive. |

---

## 5B.4 Bulk Action Bar

**Recipe ID:** `RC-DATA-BULK-ACTION-BAR-1`

| Field | Value |
|-------|-------|
| **Purpose** | Provide actions that apply to multiple selected records |
| **Business Objective** | Enable efficient batch operations |
| **User Goal** | Act on multiple records simultaneously |
| **Parent Pattern** | PAT-WORK-LIST |
| **Typical Screen Types** | CRUD List with bulk operations |
| **Primary User** | Administrator, Teacher |
| **Usage Frequency** | MEDIUM (20 screens) |
| **Information Density** | Low |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Text Field | Yes | 1 | Selected count display |
| Button | Yes | 2 | Bulk action buttons |
| Separator | Yes | 3 | Visual separation |
| Button (deselect) | Yes | 4 | Clear selection |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Bar appears at bottom of table (fixed position). 2. Left: "X selected" text. 3. Centre: action buttons (Delete, Status Change, etc.). 4. Right: Deselect All button. |
| **Content Rules** | Count format: "X selected" or "X of Y selected". Actions context-dependent per entity. |
| **Data Requirements** | selectedCount (number), availableActions[] (array of {label, confirmationRequired}) |
| **Primary Actions** | Click action -> confirmation dialog -> execute on all selected |
| **Permissions** | Only actions the user has permission for are shown |
| **Responsive** | Desktop: horizontal bar. Mobile: action sheet (bottom drawer). |
| **Anti-Patterns** | Destructive bulk action without confirmation. Actions that exceed user permissions. |
| **Validation Checklist** | 1. Selected count displayed. 2. At least one action present. 3. Confirmation for destructive actions. 4. Deselect option present. |

---

## 5B.5 Pagination Footer

**Recipe ID:** `RC-DATA-PAGINATION-FOOTER-1`

| Field | Value |
|-------|-------|
| **Purpose** | Navigate through pages of data |
| **Business Objective** | Support large datasets without performance degradation |
| **User Goal** | Navigate to specific page or browse pages |
| **Parent Pattern** | PAT-WORK-LIST |
| **Typical Screen Types** | Any list with 20+ records |
| **Primary User** | All roles |
| **Usage Frequency** | HIGH (50+ screens) |
| **Information Density** | Low |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Pagination | Yes | 1 | Page navigation control |
| Text Field | Yes | 2 | Record count display |
| Select | Optional | 3 | Page size selector |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Left: record count ("Showing 1-20 of 156"). 2. Centre: page navigation (prev, page numbers, next). 3. Right: page size selector (10, 25, 50, 100). |
| **Content Rules** | Default page size: 25. Available sizes: 10, 25, 50, 100. Record count: "Showing X-Y of Z". |
| **Data Requirements** | currentPage (number), totalPages (number), totalRecords (number), pageSize (number) |
| **Responsive** | Desktop: full footer. Mobile: simplified (prev/next + page indicator). |
| **Anti-Patterns** | Pagination without record count. No page size option. Page numbers that exceed 7 visible. |
| **Validation Checklist** | 1. Page navigation present. 2. Record count displayed. 3. Page size selector present. 4. Responsive. |

---

## 5B.6 Empty Dataset

**Recipe ID:** `RC-DATA-EMPTY-DATASET-1`

| Field | Value |
|-------|-------|
| **Purpose** | Guide users when a data workspace has no records |
| **Business Objective** | Prevent dead-end experiences and guide first action |
| **User Goal** | Understand why the list is empty and what to do next |
| **Parent Pattern** | PAT-WORK-LIST |
| **Typical Screen Types** | Any empty list view |
| **Primary User** | All roles |
| **Usage Frequency** | HIGH (every list screen) |
| **Information Density** | Low |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Empty State | Yes | 1 | Empty state container |
| Icon | Yes | 2 | Contextual illustration |
| Text Field (heading) | Yes | 3 | Empty state headline |
| Text Field (description) | Yes | 4 | Empty state guidance |
| Button | Yes | 5 | Primary action (Create/Import) |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Icon (centred). 2. Heading below icon. 3. Description below heading. 4. Action button below description. All centred. |
| **Content Rules** | Heading: specific to entity ("No students enrolled"). Description: explains why and what to do. Button: actionable ("Create student"). |
| **Data Requirements** | None (static content based on entity type) |
| **Primary Actions** | Click button -> create first record |
| **Anti-Patterns** | Generic "No data" message. No action button. Icon without context. |
| **Validation Checklist** | 1. Icon present. 2. Heading specific to entity. 3. Description provides guidance. 4. Action button present. |

---

## 5B.7 No Search Results

**Recipe ID:** `RC-DATA-NO-RESULTS-1`

| Field | Value |
|-------|-------|
| **Purpose** | Guide users when search or filter returns no matches |
| **Business Objective** | Prevent dead-end experiences during search |
| **User Goal** | Understand why no results appeared and how to adjust |
| **Parent Pattern** | PAT-WORK-LIST |
| **Typical Screen Types** | Any search/filter view |
| **Primary User** | All roles |
| **Usage Frequency** | HIGH (every search view) |
| **Information Density** | Low |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Empty State | Yes | 1 | Container |
| Icon | Yes | 2 | Search icon |
| Text Field (heading) | Yes | 3 | "No results found" |
| Text Field (description) | Yes | 4 | Suggestion text |
| Button | Yes | 5 | Clear search/filters |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Icon (search icon). 2. Heading "No results found". 3. Description with search query echoed back. 4. "Clear search" button. |
| **Content Rules** | Heading: "No results for [query]". Description: "Try adjusting your search or filters." |
| **Primary Actions** | Click clear -> reset search and filters |
| **Anti-Patterns** | Generic "No results" without the search query. No clear action. |
| **Validation Checklist** | 1. Search query reflected. 2. Suggestion text present. 3. Clear button present. |

---

## 5B.8 Import Panel

**Recipe ID:** `RC-DATA-IMPORT-PANEL-1`

| Field | Value |
|-------|-------|
| **Purpose** | Guide users through bulk data import from files |
| **Business Objective** | Enable efficient bulk data entry |
| **User Goal** | Import data from CSV/Excel without manual entry |
| **Parent Pattern** | PAT-WORK-LIST, PAT-FORM-WIZARD |
| **Typical Screen Types** | CRUD List (import action), Wizard |
| **Primary User** | Administrator |
| **Usage Frequency** | MEDIUM (10 screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | High (multi-step) |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Text Field (heading) | Yes | 2 | "Import Data" |
| File Upload | Yes | 3 | File selection |
| Data Table | Yes | 4 | Preview of imported data |
| Button (validate) | Yes | 5 | Validate data |
| Button (import) | Yes | 6 | Execute import |
| Progress Toast | Yes | 7 | Import progress |
| Alert | Yes | 8 | Validation errors |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Heading and instructions. 2. File Upload area. 3. Preview table (after file selected). 4. Validate button. 5. Validation results (errors/success). 6. Import button (enabled only after validation). 7. Progress Toast during import. |
| **Hierarchy Rules** | Single Card. Steps are sequential: upload -> preview -> validate -> import. |
| **Content Rules** | Accepted formats: CSV, XLSX. Max file size: 10MB. Preview: first 10 rows. |
| **Data Requirements** | importedFile (file), previewRows (array), validationErrors (array), importProgress (number) |
| **Primary Actions** | Upload file, Validate, Import |
| **Empty State** | File upload prompt |
| **Loading State** | Spinner during file parsing and validation |
| **Error State** | Alert with specific validation errors and row numbers |
| **Anti-Patterns** | Import without validation. Import without preview. Import without progress indication. |
| **Validation Checklist** | 1. File upload present. 2. Preview table present. 3. Validate button present. 4. Import button present. 5. Progress indicator present. 6. Error display present. |

---

## 5B.9 Export Panel

**Recipe ID:** `RC-DATA-EXPORT-PANEL-1`

| Field | Value |
|-------|-------|
| **Purpose** | Configure and execute data export to file |
| **Business Objective** | Enable data portability and offline analysis |
| **User Goal** | Export filtered data in preferred format |
| **Parent Pattern** | PAT-WORK-LIST, PAT-RPT-EXPORT |
| **Typical Screen Types** | CRUD List, Report |
| **Primary User** | All roles |
| **Usage Frequency** | MEDIUM (25 screens) |
| **Information Density** | Low |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container or modal |
| Select | Yes | 2 | Format selector (CSV, PDF, Excel) |
| Checkbox | Optional | 3 | Column selection |
| Button | Yes | 4 | Export trigger |
| Progress Toast | Yes | 5 | Export progress |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Heading "Export". 2. Format selector. 3. Column selection (optional). 4. Export button. 5. Progress toast during export. |
| **Content Rules** | Formats: CSV (default), PDF, XLSX. Default: all columns selected. |
| **Data Requirements** | format (enum), selectedColumns (array), exportStatus (enum: idle/processing/complete/failed) |
| **Primary Actions** | Click Export -> download file |
| **Responsive** | Desktop: inline panel. Mobile: bottom sheet. |
| **Anti-Patterns** | Export without format selection. Export without progress. Export without column selection for wide tables. |
| **Validation Checklist** | 1. Format selector present. 2. Export button present. 3. Progress indicator present. 4. Download trigger present. |

---

# 5C. Student Recipes

---

## 5C.1 Student Profile Card

**Recipe ID:** `RC-STU-PROFILE-CARD-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display a student's key identity and status in a compact, scannable format |
| **Business Objective** | Enable quick student identification and status assessment |
| **User Goal** | Quickly confirm who the student is and their current standing |
| **Parent Pattern** | PAT-WORK-DETAIL, PAT-COMM-NOTIF |
| **Typical Screen Types** | Student Detail, Class Roster, Communication compose |
| **Primary User** | Teacher, Administrator |
| **Usage Frequency** | HIGH (80+ screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Avatar | Yes | 2 | Student photo |
| Text Field (name) | Yes | 3 | Full name |
| Badge | Yes | 4 | Status (active/inactive/expelled) |
| Tag | Optional | 5 | Grade level / class |
| Icon | Optional | 6 | Gender indicator |
| Separator | Optional | 7 | Visual break |
| Text Field (meta) | Optional | 8 | Student ID, enrollment date |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card. 2. Avatar (left, 48px). 3. Name (right of avatar, bold). 4. Badge (right of name). 5. Tag (below name, grade/class). 6. Separator (below tags). 7. Meta text (student ID, enrollment date). |
| **Hierarchy Rules** | Horizontal layout within card. Avatar and text side by side. |
| **Content Rules** | Name: full name, max 2 lines with ellipsis. Status badge colour per state. Meta: "ID: 2024-001 | Enrolled: Sep 2024". |
| **Data Requirements** | name (string), photoUrl (string\|null), status (enum), grade (string), class (string), studentId (string), enrollmentDate (date) |
| **Primary Actions** | Click card -> navigate to student detail view |
| **Hover State** | Card border colour shifts (surface-subtle). Cursor: pointer. |
| **Responsive** | Desktop: horizontal layout. Mobile: vertical stack (avatar top, text below). |
| **Anti-Patterns** | Name without status. No avatar fallback (use initials). Photo without alt text. |
| **Validation Checklist** | 1. Avatar with fallback. 2. Name present. 3. Status badge present. 4. Clickable. 5. Responsive. |

---

## 5C.2 Student Detail Header

**Recipe ID:** `RC-STU-DETAIL-HEADER-1`

| Field | Value |
|-------|-------|
| **Purpose** | Present comprehensive student identity and key metrics at the top of a detail view |
| **Business Objective** | Provide immediate student context before diving into sub-views |
| **User Goal** | See who the student is, their status, and key metrics at a glance |
| **Parent Pattern** | PAT-WORK-DETAIL |
| **Typical Screen Types** | Student Detail (all sub-views) |
| **Primary User** | Administrator, Teacher |
| **Usage Frequency** | HIGH (every student detail screen) |
| **Information Density** | High |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Header container |
| Avatar | Yes | 2 | Student photo (large) |
| Text Field (name) | Yes | 3 | Full name |
| Badge | Yes | 4 | Status |
| Tag | Yes | 5 | Grade, class, section |
| Separator | Yes | 6 | Break before metrics |
| Stat Card | Yes | 7 | Key metrics row |
| Button | Optional | 8 | Edit / Actions |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card (full width). 2. Avatar (left, 72px, rounded-full). 3. Name (right, heading). 4. Badge (right of name, status). 5. Tags below name (grade, class, section). 6. Separator. 7. Stat Card row (Attendance %, Current GPA, Fee Balance, Pending Assignments). 8. Edit button (top-right of card). |
| **Hierarchy Rules** | Two rows: identity row (avatar + name + tags) and metrics row (stat cards). |
| **Content Rules** | Stat cards: max 4 visible. Metrics derived from student data. Each stat has label, value, trend indicator. |
| **Data Requirements** | student{name, photoUrl, status, grade, class, section, studentId}, metrics{attendance, gpa, feeBalance, pendingAssignments} |
| **Primary Actions** | Click Edit -> edit student form. Click stat card -> navigate to relevant sub-view. |
| **Responsive** | Desktop: 2-row layout. Tablet: stat cards wrap. Mobile: stat cards 2-column grid. |
| **Anti-Patterns** | Header without metrics. More than 4 stat cards. Metrics without context (no label). |
| **Validation Checklist** | 1. Avatar present. 2. Name and status present. 3. Grade/class tags present. 4. At least 2 stat cards. 5. Edit action present. 6. Responsive. |

---

## 5C.3 Class Roster List

**Recipe ID:** `RC-STU-CLASS-ROSTER-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display all students in a class as a scannable list with quick actions |
| **Business Objective** | Enable teachers to quickly find and act on individual students |
| **User Goal** | See all students in a class and access their profiles or record actions |
| **Parent Pattern** | PAT-WORK-LIST |
| **Typical Screen Types** | Class Roster, Attendance Take |
| **Primary User** | Teacher |
| **Usage Frequency** | HIGH (daily for teachers) |
| **Information Density** | Medium |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Each student row is a card or table row |
| Avatar | Yes | 2 | Student photo/initials |
| Text Field (name) | Yes | 3 | Student name |
| Badge | Yes | 4 | Attendance status (present/absent/late) |
| Button | Optional | 5 | Quick action (mark attendance, view profile) |
| Separator | Yes | 6 | Between rows |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Student name with avatar. 2. Attendance badge (colour-coded). 3. Quick action buttons (right side). 4. Separator between rows. |
| **Content Rules** | Avatar: photo or initials fallback. Name: full name. Badge: Present (green), Absent (red), Late (amber), Excused (blue). |
| **Data Requirements** | students[] (array of {id, name, photoUrl, attendanceStatus, studentId}) |
| **Primary Actions** | Click student -> navigate to profile. Click attendance badge -> cycle status. |
| **Empty State** | "No students enrolled in this class." |
| **Loading State** | Skeleton rows (10 rows) |
| **Responsive** | Desktop: table or horizontal card. Mobile: vertical card list. |
| **Anti-Patterns** | Roster without attendance status. No quick action for attendance. Roster without search. |
| **Validation Checklist** | 1. Student avatar present. 2. Name present. 3. Status badge present. 4. Quick action present. 5. Search present. 6. Empty state defined. |

---

## 5C.4 Attendance Tracker

**Recipe ID:** `RC-STU-ATTENDANCE-TRACKER-1`

| Field | Value |
|-------|-------|
| **Purpose** | Enable teachers to record and review daily attendance for a class |
| **Business Objective** | Ensure accurate attendance records for compliance and parent communication |
| **User Goal** | Mark attendance for all students in a class quickly |
| **Parent Pattern** | PAT-WORK-DATA, PAT-FORM-QUICK |
| **Typical Screen Types** | Attendance Take, Attendance Review |
| **Primary User** | Teacher |
| **Usage Frequency** | HIGH (daily) |
| **Information Density** | Medium |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Date Picker | Yes | 2 | Select attendance date |
| Select | Yes | 3 | Class/section selector |
| Avatar | Yes | 4 | Student identifier |
| Text Field (name) | Yes | 5 | Student name |
| Button (toggle) | Yes | 6 | Mark present/absent/late |
| Button (submit) | Yes | 7 | Save attendance |
| Badge | Yes | 8 | Status indicator |
| Alert | Yes | 9 | Confirmation/error |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Top bar: Date Picker (left), Class selector (right). 2. Student list: Avatar + Name (left), Toggle buttons (centre), Status badge (right). 3. Bottom: Submit button (full width, primary). |
| **Hierarchy Rules** | Single Card. Date/class selectors at top. Student list scrollable. Submit fixed at bottom. |
| **Content Rules** | Toggle: three states (Present/Absent/Late). Default: all present. Today's date default. |
| **Data Requirements** | date (date), classId (string), students[] (array of {id, name, photoUrl, status}) |
| **Primary Actions** | Toggle student status, Submit attendance |
| **Empty State** | "No students in this class. Select a different class." |
| **Loading State** | Skeleton list while loading students |
| **Error State** | "Failed to save attendance. Please try again." |
| **Permissions** | Teacher: own classes only. Admin: all classes. |
| **Responsive** | Desktop: table layout. Mobile: card list with swipe to mark. |
| **Anti-Patterns** | Attendance without confirmation. No way to edit after submit. All students default to absent. |
| **Validation Checklist** | 1. Date selector present. 2. Class selector present. 3. All students listed. 4. Status toggle present. 5. Submit button present. 6. Confirmation shown. |

---

## 5C.5 Report Card View

**Recipe ID:** `RC-STU-REPORT-CARD-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display a student's academic results across subjects for a term |
| **Business Objective** | Provide parents and students with academic performance summary |
| **User Goal** | View grades, attendance, and teacher comments for a reporting period |
| **Parent Pattern** | PAT-RPT-SUMMARY |
| **Typical Screen Types** | Report Card, Student Academic Summary |
| **Primary User** | Parent, Student |
| **Usage Frequency** | MEDIUM (termly) |
| **Information Density** | High |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Student Detail Header | Yes | 2 | Student identity |
| Data Table | Yes | 3 | Subject results |
| Stat Card | Yes | 4 | Overall metrics |
| Badge | Yes | 5 | Term/academic year |
| Text Field | Yes | 6 | Teacher comments |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Student Detail Header (compact variant). 2. Term/Year badge. 3. Stat cards (Overall GPA, Attendance %, Rank, Total Marks). 4. Data Table (Subject, Score, Grade, Teacher Comment). 5. Overall comments section. |
| **Hierarchy Rules** | Vertical stack. Header -> metrics -> results table -> comments. |
| **Content Rules** | Table columns: Subject Name, Continuous Assessment, Exam, Total, Grade, Remark. Grade scale: A-F. |
| **Data Requirements** | student{}, term (string), results[] (array of {subject, ca, exam, total, grade, comment}), overallGpa, attendance, rank |
| **Primary Actions** | Download PDF, Print |
| **Responsive** | Desktop: full table. Mobile: stacked cards per subject. |
| **Anti-Patterns** | Report card without teacher comments. No grade scale legend. Report without print option. |
| **Validation Checklist** | 1. Student header present. 2. Term/year indicated. 3. Results table present. 4. Overall metrics present. 5. Comments present. 6. Download/print present. |

---

## 5C.6 Fee Statement

**Recipe ID:** `RC-STU-FEE-STATEMENT-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display a student's fee balance, payment history, and due amounts |
| **Business Objective** | Enable fee tracking and payment follow-up |
| **User Goal** | See what fees are owed, what has been paid, and what is upcoming |
| **Parent Pattern** | PAT-RPT-SUMMARY, PAT-WORK-LIST |
| **Typical Screen Types** | Fee Detail, Student Finance View |
| **Primary User** | Administrator, Parent |
| **Usage Frequency** | MEDIUM (20 screens) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Student Detail Header | Yes | 2 | Student identity |
| Stat Card | Yes | 3 | Balance summary |
| Data Table | Yes | 4 | Transaction history |
| Badge | Yes | 5 | Payment status |
| Button | Yes | 6 | Record payment |
| Alert | Yes | 7 | Overdue notice |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Student Detail Header (compact). 2. Stat cards (Total Billed, Total Paid, Outstanding Balance, Next Due Date). 3. Alert (if overdue: "X payment(s) overdue"). 4. Data Table (Date, Description, Amount, Status, Reference). 5. Record Payment button (top-right). |
| **Data Requirements** | student{}, stats{totalBilled, totalPaid, outstanding, nextDueDate}, transactions[] (array), overdueCount (number) |
| **Primary Actions** | Record payment, Download statement PDF, Print |
| **Empty State** | "No fee records for this student." |
| **Responsive** | Desktop: full table. Mobile: card-based transaction list. |
| **Anti-Patterns** | Fee statement without balance summary. No payment history. No overdue indicator. |
| **Validation Checklist** | 1. Student header present. 2. Balance stats present. 3. Transaction table present. 4. Payment action present. 5. Overdue alert present. 6. Download/print present. |

---

## 5C.7 Enrollment Wizard

**Recipe ID:** `RC-STU-ENROLLMENT-WIZARD-1`

| Field | Value |
|-------|-------|
| **Purpose** | Guide administrators through the student enrollment process step by step |
| **Business Objective** | Ensure complete and accurate student enrollment |
| **User Goal** | Enroll a new student without missing required information |
| **Parent Pattern** | PAT-FORM-WIZARD |
| **Typical Screen Types** | Wizard |
| **Primary User** | Administrator |
| **Usage Frequency** | MEDIUM (seasonal peaks) |
| **Information Density** | Medium |
| **Interaction Complexity** | High (multi-step) |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Step container |
| Progress Bar | Yes | 2 | Step indicator |
| Text Field | Yes | 3 | Form inputs |
| Select | Yes | 4 | Dropdown selections |
| Date Picker | Yes | 5 | Date inputs |
| File Upload | Yes | 6 | Document upload |
| Button (next) | Yes | 7 | Advance to next step |
| Button (back) | Yes | 8 | Return to previous step |
| Button (submit) | Yes | 9 | Final submission |
| Alert | Yes | 10 | Validation errors |
| Badge | Yes | 11 | Step completion indicators |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Progress Bar (top, showing steps: Personal Info -> Academic Info -> Documents -> Guardian Info -> Review). 2. Card (form content for current step). 3. Navigation bar (Back left, Next/Submit right). |
| **Hierarchy Rules** | Single Card. Steps are sequential. Progress bar always visible. |
| **Content Rules** | Steps: (1) Personal Info: name, DOB, gender, address, photo. (2) Academic Info: grade, class, section, previous school. (3) Documents: birth certificate, previous records, medical. (4) Guardian Info: parent/guardian details, emergency contact. (5) Review: summary of all entered data. |
| **Data Requirements** | currentStep (number), formData{} (accumulated across steps), validationErrors{} (per step) |
| **Primary Actions** | Next, Back, Submit |
| **Empty State** | Not applicable |
| **Loading State** | Spinner on submit |
| **Error State** | Inline validation per field. Submit errors: Alert banner. |
| **Permissions** | Admin only |
| **Responsive** | Desktop: full form layout. Mobile: simplified single-column. |
| **Anti-Patterns** | Wizard without progress indicator. No back button. Submit without review step. Losing data on back navigation. |
| **Validation Checklist** | 1. Progress bar present. 2. All 5 steps defined. 3. Back/Next/Submit buttons. 4. Review step present. 5. Validation per step. 6. Data persistence across steps. |

---

# 5D. Teacher Recipes

---

## 5D.1 Lesson Plan Builder

**Recipe ID:** `RC-TCH-LESSON-PLAN-1`

| Field | Value |
|-------|-------|
| **Purpose** | Enable teachers to create and structure lesson plans with objectives, materials, and timing |
| **Business Objective** | Standardise lesson planning and ensure curriculum coverage |
| **User Goal** | Create a complete lesson plan efficiently |
| **Parent Pattern** | PAT-FORM-WIZARD, PAT-WORK-DATA |
| **Typical Screen Types** | Lesson Plan Create/Edit, Curriculum Planning |
| **Primary User** | Teacher |
| **Usage Frequency** | HIGH (weekly) |
| **Information Density** | High |
| **Interaction Complexity** | High |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Section containers |
| Text Field | Yes | 2 | Title, objectives, content |
| Select | Yes | 3 | Subject, class, topic |
| Date Picker | Yes | 4 | Lesson date |
| File Upload | Yes | 5 | Attach materials |
| Button | Yes | 6 | Save, Add section |
| Badge | Yes | 7 | Status (draft/published) |
| Progress Bar | Optional | 8 | Completeness indicator |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Status badge + Save button (top bar). 2. Card: Basic info (subject, class, topic, date, duration). 3. Card: Learning Objectives (bulleted list with add/remove). 4. Card: Lesson Steps (numbered list with timing). 5. Card: Materials & Resources (file uploads). 6. Card: Assessment (description). |
| **Content Rules** | Min 3 objectives. Each step must have title, description, duration (minutes). Total duration auto-calculated. |
| **Data Requirements** | lessonPlan{title, subject, class, topic, date, duration, objectives[], steps[], materials[], assessment, status} |
| **Primary Actions** | Save draft, Publish, Add objective, Add step, Attach material |
| **Empty State** | "Create your first lesson plan for [class/topic]." |
| **Responsive** | Desktop: two-column (form left, preview right). Mobile: single column stacked. |
| **Anti-Patterns** | Lesson plan without objectives. No duration on steps. No save draft option. |
| **Validation Checklist** | 1. Subject/class/topic fields. 2. Objectives list (min 3). 3. Steps with timing. 4. Materials upload. 5. Save/Publish actions. 6. Status badge. |

---

## 5D.2 Gradebook Entry

**Recipe ID:** `RC-TCH-GRADEBOOK-1`

| Field | Value |
|-------|-------|
| **Purpose** | Enable teachers to enter and manage student grades for assessments |
| **Business Objective** | Ensure timely and accurate grade recording |
| **User Goal** | Enter grades for all students in a class efficiently |
| **Parent Pattern** | PAT-WORK-DATA |
| **Typical Screen Types** | Gradebook, Assessment Entry |
| **Primary User** | Teacher |
| **Usage Frequency** | HIGH (per assessment) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Select | Yes | 2 | Class, assessment type |
| Data Table | Yes | 3 | Student grades grid |
| Button | Yes | 4 | Save grades |
| Badge | Yes | 5 | Save status |
| Alert | Yes | 6 | Validation warnings |
| Progress Bar | Optional | 7 | Grading progress |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Selectors: Class, Assessment Type, Assessment Name. 2. Progress bar: "X of Y graded". 3. Data Table: Student Name | Grade input | Status | Comment. 4. Save button (sticky bottom). |
| **Content Rules** | Grade input: number field with min/max validation. Status: Graded/Ungraded. Comment: optional text. |
| **Data Requirements** | classId, assessmentType, grades[] (array of {studentId, grade, maxGrade, comment, status}) |
| **Primary Actions** | Enter grade, Add comment, Save all, Bulk import |
| **Empty State** | "No students in this class or no assessments configured." |
| **Responsive** | Desktop: full table. Mobile: card per student with grade input. |
| **Anti-Patterns** | Gradebook without save confirmation. No validation for grade range. No undo for accidental grade changes. |
| **Validation Checklist** | 1. Class selector. 2. Assessment selector. 3. All students listed. 4. Grade input with validation. 5. Save button. 6. Progress indicator. |

---

## 5D.3 Student Progress Dashboard

**Recipe ID:** `RC-TCH-STUDENT-PROGRESS-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display a teacher's overview of student performance across their classes |
| **Business Objective** | Enable data-driven teaching decisions |
| **User Goal** | Identify students needing attention and track class performance trends |
| **Parent Pattern** | PAT-DASH-OVERVIEW |
| **Typical Screen Types** | Teacher Dashboard, Analytics View |
| **Primary User** | Teacher |
| **Usage Frequency** | HIGH (daily) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Section container |
| Stat Card | Yes | 2 | Key metrics |
| Data Table | Yes | 3 | Student list with performance |
| Badge | Yes | 4 | Performance indicators |
| Select | Yes | 5 | Class/subject filter |
| Bar Chart | Optional | 6 | Grade distribution |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Class/Subject selector. 2. Stat cards (Average Grade, Attendance Rate, At-Risk Students, Assignments Due). 3. Bar chart (grade distribution). 4. Student list table (Name, Average, Trend, Status, Actions). |
| **Content Rules** | At-Risk: students with average below 50% or attendance below 80%. Trend: improving/declining/stable. |
| **Data Requirements** | classId, stats{}, gradeDistribution[], students[] (with averages and trends) |
| **Primary Actions** | Click student -> detail view. Export report. Filter by class/subject. |
| **Responsive** | Desktop: 2-column (stats top, table below). Mobile: stacked cards. |
| **Anti-Patterns** | Dashboard without at-risk highlighting. No drill-down to individual student. Stats without context. |
| **Validation Checklist** | 1. Stats present. 2. Student list with grades. 3. At-risk flagging. 4. Drill-down to student detail. 5. Class/subject filter. |

---

## 5D.4 Timetable View

**Recipe ID:** `RC-TCH-TIMETABLE-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display a teacher's weekly class schedule in a visual grid |
| **Business Objective** | Help teachers plan and prepare for upcoming classes |
| **User Goal** | See weekly schedule at a glance with class details |
| **Parent Pattern** | PAT-WORK-DATA |
| **Typical Screen Types** | Teacher Timetable, Schedule View |
| **Primary User** | Teacher |
| **Usage Frequency** | HIGH (daily reference) |
| **Information Density** | High |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Time slot containers |
| Badge | Yes | 2 | Subject indicators |
| Text Field | Yes | 3 | Class/room info |
| Button | Optional | 4 | View lesson plan |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Grid: columns = days (Mon-Fri), rows = time slots. 2. Each cell: Card with subject badge, class name, room number, time. 3. Current slot highlighted. 4. Click slot -> view lesson plan for that class. |
| **Content Rules** | Grid: 5 columns (days), 8+ rows (periods). Current day/time highlighted. Empty slots shown as dashed outline. |
| **Data Requirements** | timetable[] (array of {day, time, subject, class, room, lessonPlanId}) |
| **Primary Actions** | Click slot -> view lesson plan. Click empty slot -> create lesson plan. |
| **Empty State** | "No timetable configured. Contact your administrator." |
| **Responsive** | Desktop: full grid. Tablet: scrollable grid. Mobile: single day view with day selector. |
| **Anti-Patterns** | Timetable without time slots. No current slot highlighting. Timetable without room numbers. |
| **Validation Checklist** | 1. Day columns present. 2. Time slot rows present. 3. Subject/class/room in each slot. 4. Current slot highlighted. 5. Click interaction defined. 6. Mobile day view. |

---

# 5E. Finance Recipes

---

## 5E.1 Invoice Preview Card

**Recipe ID:** `RC-FIN-INVOICE-PREVIEW-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display a summary of an invoice for quick review before sending or payment |
| **Business Objective** | Enable quick invoice verification |
| **User Goal** | Verify invoice details before taking action |
| **Parent Pattern** | PAT-WORK-LIST |
| **Typical Screen Types** | Invoice List, Invoice Detail |
| **Primary User** | Administrator, Accountant |
| **Usage Frequency** | HIGH (30+ screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Text Field (heading) | Yes | 2 | Invoice number |
| Badge | Yes | 3 | Payment status |
| Stat Card | Yes | 4 | Amount, due date |
| Separator | Yes | 5 | Between header and details |
| Button | Yes | 6 | Pay / Send / View |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card. 2. Top row: Invoice # (left), Status badge (right). 3. Middle row: Amount (bold), Due date. 4. Separator. 5. Bottom row: Student name, Class. 6. Action buttons (View / Pay / Send). |
| **Content Rules** | Status: Pending (amber), Paid (green), Overdue (red), Partial (blue). Amount: formatted with currency symbol. |
| **Data Requirements** | invoice{id, number, amount, dueDate, status, studentName, class} |
| **Primary Actions** | Click card -> invoice detail. Click Pay -> payment flow. Click Send -> send to parent. |
| **Hover State** | Card elevation increases. Cursor: pointer. |
| **Responsive** | Desktop: horizontal card. Mobile: vertical card. |
| **Anti-Patterns** | Invoice without due date. No status badge. Amount without currency. |
| **Validation Checklist** | 1. Invoice number present. 2. Status badge present. 3. Amount with currency. 4. Due date present. 5. Action buttons present. |

---

## 5E.2 Payment Form

**Recipe ID:** `RC-FIN-PAYMENT-FORM-1`

| Field | Value |
|-------|-------|
| **Purpose** | Record a payment against an invoice or fee |
| **Business Objective** | Ensure accurate payment recording |
| **User Goal** | Record a payment quickly and accurately |
| **Parent Pattern** | PAT-FORM-SINGLE |
| **Typical Screen Types** | Payment Create, Payment Modal |
| **Primary User** | Administrator, Accountant, Parent |
| **Usage Frequency** | HIGH (20+ screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Text Field | Yes | 2 | Amount, reference |
| Select | Yes | 3 | Payment method |
| Date Picker | Yes | 4 | Payment date |
| Button | Yes | 5 | Submit payment |
| Alert | Yes | 6 | Confirmation/error |
| Badge | Yes | 7 | Invoice summary |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card header: "Record Payment". 2. Invoice summary badge (invoice #, student, amount due). 3. Amount field (pre-filled with due amount, editable). 4. Payment method select. 5. Payment date (default today). 6. Reference number field (optional). 7. Submit button. |
| **Content Rules** | Payment methods: Cash, Bank Transfer, Mobile Money, Card, Cheque. Amount: must not exceed remaining balance. |
| **Data Requirements** | invoiceId, amount (number), paymentMethod (enum), paymentDate (date), reference (string) |
| **Primary Actions** | Submit payment, Cancel |
| **Empty State** | Not applicable |
| **Loading State** | Spinner on submit |
| **Error State** | "Payment failed. Please check details and try again." |
| **Permissions** | Admin/Accountant: all payments. Parent: own student payments only. |
| **Responsive** | Desktop: inline form. Mobile: bottom sheet. |
| **Anti-Patterns** | Payment without confirmation. No reference number field. Amount without validation against balance. |
| **Validation Checklist** | 1. Invoice summary present. 2. Amount field with validation. 3. Payment method selector. 4. Date picker. 5. Submit button. 6. Confirmation shown. |

---

## 5E.3 Fee Collection Dashboard

**Recipe ID:** `RC-FIN-FEE-COLLECTION-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display fee collection status across all students for an institution |
| **Business Objective** | Track revenue collection and identify outstanding payments |
| **User Goal** | See collection rates, outstanding amounts, and overdue invoices at a glance |
| **Parent Pattern** | PAT-DASH-OVERVIEW |
| **Typical Screen Types** | Finance Dashboard, Fee Overview |
| **Primary User** | Administrator, Accountant |
| **Usage Frequency** | HIGH (daily) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Section container |
| Stat Card | Yes | 2 | Summary metrics |
| Bar Chart | Yes | 3 | Collection trend |
| Data Table | Yes | 4 | Invoice list |
| Badge | Yes | 5 | Status indicators |
| Button | Yes | 6 | Actions (Send reminders, Export) |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Stat cards (Total Billed, Total Collected, Collection Rate %, Outstanding). 2. Bar chart (monthly collection trend). 3. Data Table (Student, Invoice #, Amount, Due Date, Status, Actions). 4. Action bar (Send Reminders, Export). |
| **Content Rules** | Stat cards: trend arrows (up/down). Chart: last 6 months. Table: sorted by due date ascending. Overdue rows highlighted. |
| **Data Requirements** | stats{}, collectionTrend[], invoices[] (array) |
| **Primary Actions** | Click invoice -> detail. Send reminders (bulk). Export report. |
| **Responsive** | Desktop: 2-column (stats + chart top, table below). Mobile: stacked. |
| **Anti-Patterns** | Dashboard without collection rate. No trend chart. No overdue highlighting. |
| **Validation Checklist** | 1. Summary stats present. 2. Collection chart present. 3. Invoice table present. 4. Overdue highlighted. 5. Send reminder action. 6. Export action. |

---

## 5E.4 Budget Tracker

**Recipe ID:** `RC-FIN-BUDGET-TRACKER-1`

| Field | Value |
|-------|-------|
| **Purpose** | Track institutional budget allocation and spending across categories |
| **Business Objective** | Enable financial oversight and prevent overspending |
| **User Goal** | Monitor budget utilisation and identify categories nearing limits |
| **Parent Pattern** | PAT-DASH-OVERVIEW |
| **Typical Screen Types** | Budget Overview, Financial Planning |
| **Primary User** | Administrator, Platform Operator |
| **Usage Frequency** | MEDIUM (10 screens) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Stat Card | Yes | 2 | Summary metrics |
| Progress Bar | Yes | 3 | Budget utilisation per category |
| Bar Chart | Yes | 4 | Spending by category |
| Data Table | Yes | 5 | Detailed transactions |
| Badge | Yes | 6 | Status (under/on track, over) |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Stat cards (Total Budget, Spent, Remaining, % Utilised). 2. Horizontal bar chart (spending by category). 3. Category breakdown table (Category, Allocated, Spent, Remaining, Progress Bar, Status). 4. Recent transactions table. |
| **Content Rules** | Progress bar: green (<75%), amber (75-90%), red (>90%). Status: On Track, At Risk, Over Budget. |
| **Data Requirements** | budget{total, spent, remaining, utilisation}, categories[] (with allocated/spent), recentTransactions[] |
| **Primary Actions** | Click category -> detail. Export budget report. |
| **Responsive** | Desktop: full layout. Mobile: stacked cards. |
| **Anti-Patterns** | Budget without utilisation percentage. No category breakdown. No visual indicator for over-budget. |
| **Validation Checklist** | 1. Summary stats. 2. Category breakdown with progress. 3. Chart present. 4. Transaction list. 5. Status indicators. 6. Export present. |

---

# 5F. Academic Recipes

---

## 5F.1 Curriculum Map

**Recipe ID:** `RC-ACAD-CURRICULUM-MAP-1`

| Field | Value |
|-------|-------|
| **Purpose** | Visualise curriculum coverage across subjects, terms, and classes |
| **Business Objective** | Ensure curriculum is delivered on schedule |
| **User Goal** | See what has been taught, what is in progress, and what remains |
| **Parent Pattern** | PAT-WORK-DATA |
| **Typical Screen Types** | Curriculum Overview, Academic Planning |
| **Primary User** | Administrator, Teacher |
| **Usage Frequency** | MEDIUM (15 screens) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Select | Yes | 2 | Class, subject, term filters |
| Data Table | Yes | 3 | Topic coverage grid |
| Badge | Yes | 4 | Coverage status |
| Progress Bar | Yes | 5 | Coverage percentage |
| Button | Optional | 6 | View lesson plans |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Filters: Class, Subject, Term. 2. Summary: Progress bar (% topics covered). 3. Data Table: Topic | Planned Date | Status | Lesson Plan Link. 4. Status badges: Completed (green), In Progress (amber), Not Started (gray). |
| **Content Rules** | Status derived from lesson plan completion. Coverage % = completed topics / total topics. |
| **Data Requirements** | classId, subjectId, termId, topics[] (with planned dates, status, lessonPlanId) |
| **Primary Actions** | Click topic -> view lesson plan. Filter by class/subject/term. |
| **Responsive** | Desktop: full table. Mobile: card list. |
| **Anti-Patterns** | Curriculum map without progress percentage. No status indicators. No link to lesson plans. |
| **Validation Checklist** | 1. Filters present. 2. Progress bar present. 3. Topic table with status. 4. Lesson plan links. 5. Coverage percentage. |

---

## 5F.2 Assessment Builder

**Recipe ID:** `RC-ACAD-ASSESSMENT-BUILDER-1`

| Field | Value |
|-------|-------|
| **Purpose** | Enable creation and configuration of assessments with grading criteria |
| **Business Objective** | Standardise assessment creation and grading |
| **User Goal** | Create an assessment with clear criteria and weightings |
| **Parent Pattern** | PAT-FORM-WIZARD |
| **Typical Screen Types** | Assessment Create/Edit |
| **Primary User** | Teacher, Administrator |
| **Usage Frequency** | MEDIUM (10 screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | High |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Section containers |
| Text Field | Yes | 2 | Title, description |
| Select | Yes | 3 | Subject, class, type |
| Date Picker | Yes | 4 | Due date |
| Number Field | Yes | 5 | Max marks, weight |
| Button | Yes | 6 | Add question/criteria, Save |
| Badge | Yes | 7 | Assessment type |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card: Basic info (title, subject, class, type, date). 2. Card: Grading criteria (type, max marks, weight %). 3. Card: Rubric (optional, add criteria rows). 4. Card: Instructions. 5. Save/Publish buttons. |
| **Content Rules** | Assessment types: Quiz, Test, Exam, Assignment, Project. Weight must sum to 100% per term. |
| **Data Requirements** | assessment{title, subject, class, type, dueDate, maxMarks, weight, criteria[], rubric[], instructions} |
| **Primary Actions** | Save draft, Publish, Add criteria, Add rubric row |
| **Responsive** | Desktop: multi-column. Mobile: stacked. |
| **Anti-Patterns** | Assessment without weight. No rubric for project-type. Assessment without due date. |
| **Validation Checklist** | 1. Basic info fields. 2. Grading criteria. 3. Weight validation (sums to 100%). 4. Due date present. 5. Save/Publish. |

---

## 5F.3 Academic Calendar

**Recipe ID:** `RC-ACAD-CALENDAR-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display the academic year calendar with events, exams, and holidays |
| **Business Objective** | Provide institutional scheduling visibility |
| **User Goal** | View academic events and plan around them |
| **Parent Pattern** | PAT-WORK-DATA |
| **Typical Screen Types** | Calendar View |
| **Primary User** | All roles |
| **Usage Frequency** | MEDIUM (15 screens) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Day/event containers |
| Badge | Yes | 2 | Event type indicators |
| Button | Yes | 3 | Day/event actions |
| Select | Yes | 4 | Month/class filters |
| Separator | Yes | 5 | Between days |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Month/Year header with navigation arrows. 2. Calendar grid (7 columns, 5-6 rows). 3. Each day cell: date number, event badges (coloured by type). 4. Today highlighted. 5. Click day -> event detail or create. 6. Sidebar: upcoming events list. |
| **Content Rules** | Event types: Exam (red), Holiday (green), Term Start/End (blue), Parent Teacher (amber), Sports (purple). |
| **Data Requirements** | events[] (array of {date, title, type, class?, description}) |
| **Primary Actions** | Click day -> view/create events. Click event -> view detail. Navigate months. |
| **Empty State** | "No events this month." |
| **Responsive** | Desktop: full grid + sidebar. Tablet: full grid, no sidebar. Mobile: list view with date grouping. |
| **Anti-Patterns** | Calendar without event type differentiation. No current day highlighting. Calendar without month navigation. |
| **Validation Checklist** | 1. Calendar grid present. 2. Event type badges. 3. Today highlighted. 4. Month navigation. 5. Click interaction. 6. Mobile list view. |

---

## 5F.4 Exam Seating Arrangement

**Recipe ID:** `RC-ACAD-EXAM-SEATING-1`

| Field | Value |
|-------|-------|
| **Purpose** | Generate and display exam seating arrangements for a given exam |
| **Business Objective** | Ensure fair and organised exam seating |
| **User Goal** | View or generate seating arrangements for an exam |
| **Parent Pattern** | PAT-WORK-DATA |
| **Typical Screen Types** | Exam Management, Seating Plan |
| **Primary User** | Administrator |
| **Usage Frequency** | LOW (exam periods) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Room containers |
| Data Table | Yes | 2 | Seating grid |
| Select | Yes | 3 | Exam, class, room |
| Button | Yes | 4 | Generate, Print |
| Badge | Yes | 5 | Room capacity |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Selectors: Exam, Class, Room. 2. Room info: Capacity badge, Room name. 3. Seating grid: Seat # | Student Name | Seat Position. 4. Actions: Generate (auto-assign), Print, Export. |
| **Content Rules** | Seating grid: rows and columns matching room layout. Students assigned by roll number or random. |
| **Data Requirements** | examId, classId, roomId, seating[] (array of {seatNumber, studentName, position}) |
| **Primary Actions** | Generate arrangement, Print seating chart, Export to PDF |
| **Responsive** | Desktop: full grid. Mobile: scrollable list. |
| **Anti-Patterns** | Seating without room capacity check. No print option. No way to regenerate. |
| **Validation Checklist** | 1. Exam/class/room selectors. 2. Seating grid. 3. Capacity badge. 4. Generate button. 5. Print/Export. |

---

# 5G. Administration Recipes

---

## 5G.1 Staff Directory

**Recipe ID:** `RC-ADMIN-STAFF-DIRECTORY-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display all staff members with contact info and role details |
| **Business Objective** | Enable staff discovery and communication |
| **User Goal** | Find staff members by name, role, or department |
| **Parent Pattern** | PAT-WORK-LIST |
| **Typical Screen Types** | Staff List |
| **Primary User** | Administrator |
| **Usage Frequency** | MEDIUM (10 screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Staff member containers |
| Avatar | Yes | 2 | Staff photo |
| Text Field | Yes | 3 | Name, role, department |
| Badge | Yes | 4 | Role type |
| Button | Yes | 5 | Contact, View profile |
| Search Field | Yes | 6 | Search staff |
| Select | Yes | 7 | Department filter |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Search bar + department filter. 2. Staff list: Card per member (Avatar, Name, Role, Department badge, Contact buttons). 3. Click card -> staff detail. |
| **Content Rules** | Role types: Teacher, Administrator, Support, Security, Maintenance. Contact: phone, email icons. |
| **Data Requirements** | staff[] (array of {id, name, photoUrl, role, department, phone, email}) |
| **Primary Actions** | Click card -> detail view. Click phone -> call. Click email -> compose. |
| **Responsive** | Desktop: grid of cards. Mobile: list view. |
| **Anti-Patterns** | Directory without contact info. No search. No department filter. |
| **Validation Checklist** | 1. Search present. 2. Filter present. 3. Avatar with fallback. 4. Name/role/department. 5. Contact actions. 6. Click to detail. |

---

## 5G.2 Inventory Tracker

**Recipe ID:** `RC-ADMIN-INVENTORY-1`

| Field | Value |
|-------|-------|
| **Purpose** | Track school inventory items, quantities, and locations |
| **Business Objective** | Prevent stockouts and track asset utilisation |
| **User Goal** | Monitor inventory levels and reorder when needed |
| **Parent Pattern** | PAT-WORK-LIST, PAT-WORK-DATA |
| **Typical Screen Types** | Inventory List, Inventory Detail |
| **Primary User** | Administrator |
| **Usage Frequency** | MEDIUM (8 screens) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Data Table | Yes | 1 | Inventory list |
| Badge | Yes | 2 | Stock status |
| Stat Card | Yes | 3 | Summary metrics |
| Button | Yes | 4 | Add item, Restock |
| Search Field | Yes | 5 | Search inventory |
| Select | Yes | 6 | Category filter |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Stat cards (Total Items, Low Stock Items, Total Value). 2. Search + category filter. 3. Data Table (Item Name, Category, Quantity, Min Qty, Status, Location, Actions). 4. Low stock items highlighted in red. |
| **Content Rules** | Status: In Stock (green), Low Stock (amber), Out of Stock (red). Low stock = quantity <= minQty. |
| **Data Requirements** | stats{}, items[] (array of {id, name, category, quantity, minQty, location, unitPrice}) |
| **Primary Actions** | Add item, Restock, Edit, View history |
| **Responsive** | Desktop: full table. Mobile: card list. |
| **Anti-Patterns** | Inventory without minimum quantity. No low stock indicator. No restock action. |
| **Validation Checklist** | 1. Summary stats. 2. Search present. 3. Filter present. 4. Table with status. 5. Low stock highlighting. 6. Add/Restock actions. |

---

## 5G.3 Transport Route Manager

**Recipe ID:** `RC-ADMIN-TRANSPORT-1`

| Field | Value |
|-------|-------|
| **Purpose** | Manage school transport routes, vehicles, and driver assignments |
| **Business Objective** | Ensure safe and efficient student transport |
| **User Goal** | View and manage transport routes and assignments |
| **Parent Pattern** | PAT-WORK-LIST |
| **Typical Screen Types** | Transport Management |
| **Primary User** | Administrator |
| **Usage Frequency** | LOW (5 screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Data Table | Yes | 1 | Route list |
| Card | Yes | 2 | Route detail |
| Badge | Yes | 3 | Route status |
| Button | Yes | 4 | Add route, Assign students |
| Select | Yes | 5 | Vehicle, driver selectors |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Route list table (Route Name, Vehicle, Driver, Students, Status). 2. Click route -> detail card with stops list. 3. Assign students button. |
| **Content Rules** | Route status: Active (green), Inactive (gray), Delayed (amber). Stops shown as ordered list. |
| **Data Requirements** | routes[] (array of {id, name, vehicleId, driverId, studentCount, status, stops[]}) |
| **Primary Actions** | Add route, Edit route, Assign students, View stops |
| **Responsive** | Desktop: table + detail. Mobile: card list. |
| **Anti-Patterns** | Route without student count. No status indicator. No driver assignment. |
| **Validation Checklist** | 1. Route table present. 2. Vehicle/driver info. 3. Student count. 4. Status badge. 5. Add/assign actions. |

---

## 5G.4 Hostel Manager

**Recipe ID:** `RC-ADMIN-HOSTEL-1`

| Field | Value |
|-------|-------|
| **Purpose** | Manage hostel/boarding assignments, room allocation, and occupancy |
| **Business Objective** | Optimise hostel occupancy and ensure proper allocation |
| **User Goal** | View room availability and assign students to rooms |
| **Parent Pattern** | PAT-WORK-LIST, PAT-WORK-DATA |
| **Typical Screen Types** | Hostel Management |
| **Primary User** | Administrator |
| **Usage Frequency** | LOW (5 screens) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Data Table | Yes | 1 | Room list |
| Stat Card | Yes | 2 | Occupancy metrics |
| Badge | Yes | 3 | Room status |
| Button | Yes | 4 | Assign student |
| Progress Bar | Yes | 5 | Occupancy rate |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Stat cards (Total Rooms, Occupied, Available, Occupancy Rate %). 2. Progress bar (overall occupancy). 3. Room table (Room #, Block, Capacity, Occupied, Status, Actions). 4. Assign student button. |
| **Content Rules** | Status: Available (green), Full (amber), Under Maintenance (red). Occupancy % = occupied / capacity. |
| **Data Requirements** | stats{}, rooms[] (array of {id, number, block, capacity, occupied, status, students[]}) |
| **Primary Actions** | Assign student, Unassign, View room detail, Edit room |
| **Responsive** | Desktop: table. Mobile: card list. |
| **Anti-Patterns** | Hostel without occupancy rate. No capacity display. No assign action. |
| **Validation Checklist** | 1. Summary stats. 2. Occupancy progress bar. 3. Room table. 4. Status badges. 5. Assign action. 6. Capacity validation. |

---

# 5H. AI Recipes

---

## 5H.1 AI Insights Panel

**Recipe ID:** `RC-AI-INSIGHTS-PANEL-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display AI-generated insights and recommendations contextual to the current view |
| **Business Objective** | Provide actionable intelligence without requiring manual analysis |
| **User Goal** | Get AI-powered suggestions relevant to current data |
| **Parent Pattern** | PAT-WORK-DATA |
| **Typical Screen Types** | Any dashboard, analytics view, detail view |
| **Primary User** | All roles |
| **Usage Frequency** | HIGH (40+ screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Icon | Yes | 2 | AI indicator (sparkle/brain icon) |
| Text Field (heading) | Yes | 3 | "AI Insights" |
| Badge | Yes | 4 | Confidence score |
| Text Field | Yes | 5 | Insight text |
| Button | Yes | 6 | Dismiss, Apply suggestion |
| Separator | Yes | 7 | Between insights |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card with AI icon + "AI Insights" heading + confidence badge. 2. Insight text (1-2 sentences). 3. Action buttons (Apply, Dismiss, Learn more). 4. Separator between multiple insights. |
| **Content Rules** | Max 3 insights visible. Confidence: High (>80%), Medium (50-80%), Low (<50%). Each insight must be actionable. |
| **Data Requirements** | insights[] (array of {id, text, confidence, type, actionable, suggestion}) |
| **Primary Actions** | Apply suggestion, Dismiss insight, Learn more |
| **Permissions** | Insights shown based on user role and data access |
| **Responsive** | Desktop: inline panel (sidebar or below main content). Mobile: collapsible card. |
| **Anti-Patterns** | Insights without confidence score. More than 3 insights. Non-actionable insights. Insights without dismiss option. |
| **Validation Checklist** | 1. AI icon present. 2. Confidence badge. 3. Actionable text. 4. Apply/Dismiss buttons. 5. Max 3 visible. 6. Dismiss persisted. |

---

## 5H.2 AI Chat Interface

**Recipe ID:** `RC-AI-CHAT-1`

| Field | Value |
|-------|-------|
| **Purpose** | Provide a conversational AI assistant interface for querying school data |
| **Business Objective** | Enable natural language access to school information |
| **User Goal** | Ask questions about school data in natural language and get answers |
| **Parent Pattern** | PAT-WORK-DATA |
| **Typical Screen Types** | AI Assistant, Chat View |
| **Primary User** | All roles |
| **Usage Frequency** | MEDIUM (new feature) |
| **Information Density** | Medium |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Chat container |
| Text Field | Yes | 2 | Message input |
| Button | Yes | 3 | Send button |
| Avatar | Yes | 4 | User/AI avatars |
| Badge | Yes | 5 | AI typing indicator |
| Icon | Yes | 6 | Suggested questions |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Chat header: "AI Assistant" + status badge. 2. Message area (scrollable, messages with avatars). 3. Suggested questions (if no messages yet). 4. Input area: Text field + Send button (sticky bottom). |
| **Content Rules** | Messages: User (right-aligned, primary colour), AI (left-aligned, surface colour). Typing indicator: animated dots. Suggested questions: 3-4 contextual prompts. |
| **Data Requirements** | messages[] (array of {id, role, content, timestamp}), suggestions[] (string array), isTyping (boolean) |
| **Primary Actions** | Type message, Send, Click suggestion, Copy response |
| **Empty State** | Suggested questions: "What classes have low attendance?", "Show me fee collection trends", "Which students need academic support?" |
| **Loading State** | Typing indicator while AI generates response |
| **Error State** | "I couldn't process that request. Please try rephrasing." |
| **Responsive** | Desktop: panel (320px sidebar or modal). Mobile: full screen. |
| **Anti-Patterns** | Chat without suggested questions on empty. No typing indicator. No way to copy AI response. Messages without timestamps. |
| **Validation Checklist** | 1. Chat header present. 2. Message area present. 3. Input with send button. 4. Suggested questions on empty. 5. Typing indicator. 6. Avatar per message. 7. Responsive. |

---

## 5H.3 Predictive Analytics Card

**Recipe ID:** `RC-AI-PREDICTIVE-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display AI predictions for student outcomes, attendance, or performance |
| **Business Objective** | Enable proactive intervention based on predictive data |
| **User Goal** | Identify at-risk students or predicted trends before they occur |
| **Parent Pattern** | PAT-DASH-OVERVIEW |
| **Typical Screen Types** | Analytics Dashboard, Student Risk View |
| **Primary User** | Administrator, Teacher |
| **Usage Frequency** | MEDIUM (10 screens) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Stat Card | Yes | 2 | Prediction metric |
| Badge | Yes | 3 | Risk level |
| Progress Bar | Yes | 4 | Confidence |
| Button | Yes | 5 | Take action |
| Separator | Yes | 6 | Between predictions |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card header: "Predictive Analytics" + AI icon. 2. Prediction: Student/Entity name, Prediction text, Risk badge, Confidence progress bar. 3. Action button ("Intervene", "View details"). 4. Separator between predictions. |
| **Content Rules** | Risk levels: High (red), Medium (amber), Low (green). Confidence: visual progress bar with percentage. Max 5 predictions visible. |
| **Data Requirements** | predictions[] (array of {entityId, entityName, prediction, riskLevel, confidence, suggestedAction}) |
| **Primary Actions** | Take action (navigate to intervention form), View detail, Dismiss |
| **Responsive** | Desktop: card grid. Mobile: stacked cards. |
| **Anti-Patterns** | Prediction without confidence score. No suggested action. More than 5 predictions. No risk level indicator. |
| **Validation Checklist** | 1. AI icon present. 2. Prediction text. 3. Risk badge. 4. Confidence bar. 5. Action button. 6. Max 5 visible. |

---

## 5H.4 Smart Recommendation Feed

**Recipe ID:** `RC-AI-RECOMMENDATION-FEED-1`

| Field | Value |
|-------|-------|
| **Purpose** | Provide a stream of AI-curated recommendations and actions |
| **Business Objective** | Surface important actions the user should take |
| **User Goal** | See prioritised recommendations without searching |
| **Parent Pattern** | PAT-DASH-OVERVIEW |
| **Typical Screen Types** | Home Dashboard, Notification Center |
| **Primary User** | All roles |
| **Usage Frequency** | HIGH (daily) |
| **Information Density** | Medium |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Each recommendation |
| Icon | Yes | 2 | Category icon |
| Text Field | Yes | 3 | Recommendation text |
| Badge | Yes | 4 | Priority (high/medium/low) |
| Button | Yes | 5 | Act / Dismiss |
| Separator | Yes | 6 | Between items |

| Field | Value |
|-------|-------|
| **Component Order** | 1. List of recommendation cards. 2. Each: Icon (category) + Text + Priority badge + Action/Dismiss buttons. 3. Separator between cards. |
| **Content Rules** | Priority: High (red border), Medium (amber), Low (green). Categories: Academic, Attendance, Finance, Communication. |
| **Data Requirements** | recommendations[] (array of {id, text, category, priority, actionUrl, dismissible}) |
| **Primary Actions** | Act (navigate to action), Dismiss (remove from feed) |
| **Responsive** | Desktop: card list. Mobile: compact list. |
| **Anti-Patterns** | Recommendations without priority. No dismiss option. No category indication. |
| **Validation Checklist** | 1. Category icon. 2. Recommendation text. 3. Priority badge. 4. Action button. 5. Dismiss button. 6. Separator between items. |

---

# 5I. Communication Recipes

---

## 5I.1 Announcement Composer

**Recipe ID:** `RC-COMM-ANNOUNCEMENT-COMPOSER-1`

| Field | Value |
|-------|-------|
| **Purpose** | Compose and target announcements to specific audiences |
| **Business Objective** | Enable effective institutional communication |
| **User Goal** | Create an announcement and send it to the right people |
| **Parent Pattern** | PAT-FORM-SINGLE |
| **Typical Screen Types** | Announcement Create, Compose Modal |
| **Primary User** | Administrator |
| **Usage Frequency** | MEDIUM (10 screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Text Field | Yes | 2 | Title, body |
| Select | Yes | 3 | Audience, priority |
| File Upload | Optional | 4 | Attachments |
| Button | Yes | 5 | Send, Schedule, Save draft |
| Badge | Yes | 6 | Priority indicator |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card: Title field. 2. Body field (rich text). 3. Audience selector (multi-select: All, Teachers, Students, Parents, Class-specific). 4. Priority select (Normal, Urgent). 5. File upload for attachments. 6. Bottom bar: Save Draft, Schedule, Send Now. |
| **Content Rules** | Title: max 100 chars. Body: max 2000 chars. Urgent announcements get special styling. Schedule: future date/time picker. |
| **Data Requirements** | title (string), body (string), audience (enum[]), priority (enum), attachments (file[]), scheduledFor (date\|null) |
| **Primary Actions** | Send Now, Schedule, Save Draft |
| **Empty State** | Not applicable |
| **Responsive** | Desktop: full form. Mobile: simplified. |
| **Anti-Patterns** | Announcement without audience targeting. No priority option. No schedule option. No draft save. |
| **Validation Checklist** | 1. Title field. 2. Body field. 3. Audience selector. 4. Priority selector. 5. Send/Schedule/Draft buttons. 6. Attachment option. |

---

## 5I.2 Message Thread

**Recipe ID:** `RC-COMM-MESSAGE-THREAD-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display a conversation thread between users with message history |
| **Business Objective** | Enable persistent communication records |
| **User Goal** | Read and respond to messages in context |
| **Parent Pattern** | PAT-WORK-DATA |
| **Typical Screen Types** | Message Detail, Chat View |
| **Primary User** | All roles |
| **Usage Frequency** | HIGH (30+ screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Message containers |
| Avatar | Yes | 2 | Sender avatar |
| Text Field | Yes | 3 | Message content |
| Badge | Yes | 4 | Read/unread status |
| Button | Yes | 5 | Reply, Attach |
| Separator | Yes | 6 | Between messages |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Thread header: participant names/avatar. 2. Message list (scrollable): Avatar + Name + Timestamp (left), Message content. 3. Messages grouped by date. 4. Input area: Text field + Reply button + Attach button (sticky bottom). |
| **Content Rules** | Messages grouped by date. Read status shown. Attachments displayed inline. Timestamps relative ("2 hours ago"). |
| **Data Requirements** | thread{participants[], messages[] (array of {id, senderId, content, timestamp, read, attachments[]})} |
| **Primary Actions** | Type reply, Send, Attach file, Mark as read |
| **Empty State** | "Start a conversation." |
| **Responsive** | Desktop: full thread view. Mobile: full screen conversation. |
| **Anti-Patterns** | Messages without timestamps. No read status. No attachment support. Thread without participant header. |
| **Validation Checklist** | 1. Participant header. 2. Messages with avatars. 3. Timestamps present. 4. Read status. 5. Reply input. 6. Attach button. 7. Date grouping. |

---

## 5I.3 SMS/Email Template Editor

**Recipe ID:** `RC-COMM-TEMPLATE-EDITOR-1`

| Field | Value |
|-------|-------|
| **Purpose** | Create and manage reusable communication templates |
| **Business Objective** | Standardise institutional messaging |
| **User Goal** | Create a template with merge fields for repeated use |
| **Parent Pattern** | PAT-FORM-SINGLE |
| **Typical Screen Types** | Template Create/Edit |
| **Primary User** | Administrator |
| **Usage Frequency** | LOW (5 screens) |
| **Information Density** | Medium |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Container |
| Text Field | Yes | 2 | Template name, content |
| Select | Yes | 3 | Template type (SMS/Email) |
| Badge | Yes | 4 | Merge field indicators |
| Button | Yes | 5 | Save, Preview, Test |
| Alert | Yes | 6 | Merge field errors |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card: Template name. 2. Type selector (SMS/Email). 3. Content area (for email: rich text editor; for SMS: plain text with char count). 4. Merge field panel (available fields: {{student_name}}, {{parent_name}}, {{fee_balance}}, etc.). 5. Bottom: Save, Preview, Test Send. |
| **Content Rules** | SMS: 160 chars per segment, count displayed. Email: rich text with formatting. Merge fields highlighted in content. |
| **Data Requirements** | template{name, type, content, mergeFields[], lastUsed (date), usageCount (number)} |
| **Primary Actions** | Save, Preview, Test send (to admin email/phone) |
| **Responsive** | Desktop: full editor. Mobile: simplified text editor. |
| **Anti-Patterns** | Template without merge fields. No preview option. No test send. SMS template without char count. |
| **Validation Checklist** | 1. Name field. 2. Type selector. 3. Content editor. 4. Merge field panel. 5. Save/Preview/Test buttons. 6. Char count for SMS. |

---

## 5I.4 Notification Preferences

**Recipe ID:** `RC-COMM-NOTIF-PREFERENCES-1`

| Field | Value |
|-------|-------|
| **Purpose** | Enable users to configure their notification delivery preferences |
| **Business Objective** | Respect user communication preferences and reduce notification fatigue |
| **User Goal** | Control which notifications they receive and how |
| **Parent Pattern** | PAT-FORM-SINGLE |
| **Typical Screen Types** | Settings, Profile |
| **Primary User** | All roles |
| **Usage Frequency** | LOW (5 screens) |
| **Information Density** | Low |
| **Interaction Complexity** | Low |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Section containers |
| Switch | Yes | 2 | Toggle notification types |
| Select | Yes | 3 | Delivery method |
| Badge | Yes | 4 | Category labels |
| Button | Yes | 5 | Save preferences |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Card per category (Academic, Finance, Communication, System). 2. Each: Category badge + Switch per notification type. 3. Delivery method: In-App, Email, SMS, Push (multi-select). 4. Save button. |
| **Content Rules** | Categories match notification types. Each type has default enabled/disabled. Delivery method per category. |
| **Data Requirements** | preferences{} (object matching notification type schema), deliveryMethods[] |
| **Primary Actions** | Toggle switches, Change delivery method, Save |
| **Responsive** | Desktop: full layout. Mobile: stacked cards. |
| **Anti-Patterns** | No save button. Notification preferences without categories. No delivery method option. |
| **Validation Checklist** | 1. Categories present. 2. Switches per type. 3. Delivery method selector. 4. Save button. 5. Default values set. |

---

# 5J. Planning Recipes

---

## 5J.1 Exam Timetable Builder

**Recipe ID:** `RC-PLAN-EXAM-TIMETABLE-1`

| Field | Value |
|-------|-------|
| **Purpose** | Create and manage examination schedules with room and supervisor assignments |
| **Business Objective** | Ensure orderly exam administration |
| **User Goal** | Build an exam timetable that avoids conflicts and allocates resources |
| **Parent Pattern** | PAT-FORM-WIZARD, PAT-WORK-DATA |
| **Typical Screen Types** | Exam Timetable Create, Exam Management |
| **Primary User** | Administrator |
| **Usage Frequency** | LOW (exam periods) |
| **Information Density** | High |
| **Interaction Complexity** | High |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Section containers |
| Data Table | Yes | 2 | Timetable grid |
| Select | Yes | 3 | Subject, room, supervisor |
| Date Picker | Yes | 4 | Exam dates |
| Badge | Yes | 5 | Conflict indicators |
| Alert | Yes | 6 | Conflict warnings |
| Button | Yes | 7 | Add exam, Publish |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Exam session selector (name, academic year). 2. Timetable grid: Date | Time | Subject | Class | Room | Supervisor. 3. Add exam row button. 4. Conflict detection alert. 5. Publish button. |
| **Content Rules** | Conflict: same room/supervisor at same time. Auto-detect conflicts on add. Conflict rows highlighted red. |
| **Data Requirements** | session{}, exams[] (array of {date, time, subject, class, room, supervisor, duration}), conflicts[] |
| **Primary Actions** | Add exam, Edit exam, Remove exam, Publish, Auto-detect conflicts |
| **Responsive** | Desktop: full table. Mobile: day-by-day view. |
| **Anti-Patterns** | Timetable without conflict detection. No room assignment. No supervisor assignment. Publish without conflict check. |
| **Validation Checklist** | 1. Grid present. 2. All fields per exam. 3. Conflict detection. 4. Add/Edit/Remove actions. 5. Publish action. 6. Conflict alert. |

---

## 5J.2 Academic Year Planner

**Recipe ID:** `RC-ACAD-YEAR-PLANNER-1`

| Field | Value |
|-------|-------|
| **Purpose** | Plan and visualise the academic year with terms, holidays, and key events |
| **Business Objective** | Provide institutional planning overview |
| **User Goal** | See the full academic year structure at a glance |
| **Parent Pattern** | PAT-WORK-DATA |
| **Typical Screen Types** | Academic Planning, Year Overview |
| **Primary User** | Administrator |
| **Usage Frequency** | LOW (annual planning) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Month containers |
| Badge | Yes | 2 | Event type indicators |
| Button | Yes | 3 | Add term/event |
| Separator | Yes | 4 | Between months |
| Progress Bar | Yes | 5 | Year progress |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Year progress bar (current position). 2. Horizontal timeline: 12 months. 3. Each month: Card with events listed (term start/end, holidays, exams, breaks). 4. Events colour-coded by type. 5. Add event button. |
| **Content Rules** | Event types: Term (blue), Holiday (green), Exam (red), Break (amber), Event (purple). Current month highlighted. |
| **Data Requirements** | year (number), events[] (array of {date, endDate, title, type}), currentProgress (number) |
| **Primary Actions** | Add event, Edit event, Remove event |
| **Responsive** | Desktop: horizontal timeline. Mobile: vertical month list. |
| **Anti-Patterns** | Year planner without current position. No event type differentiation. No add event option. |
| **Validation Checklist** | 1. Year progress bar. 2. 12 months displayed. 3. Events with types. 4. Add event action. 5. Current month highlighted. 6. Responsive. |

---

## 5J.3 Staff Schedule

**Recipe ID:** `RC-PLAN-STAFF-SCHEDULE-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display and manage staff duty schedules, break coverage, and assignments |
| **Business Objective** | Ensure adequate staff coverage at all times |
| **User Goal** | View staff schedules and identify coverage gaps |
| **Parent Pattern** | PAT-WORK-DATA |
| **Typical Screen Types** | Staff Scheduling |
| **Primary User** | Administrator |
| **Usage Frequency** | MEDIUM (10 screens) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Data Table | Yes | 1 | Schedule grid |
| Badge | Yes | 2 | Duty status |
| Select | Yes | 3 | Date range, staff filter |
| Button | Yes | 4 | Assign, Swap |
| Alert | Yes | 5 | Coverage warnings |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Filters: Date range, Staff member. 2. Schedule grid: Staff Name | Mon | Tue | Wed | Thu | Fri. 3. Each cell: duty assignment with badge. 4. Coverage alert if gaps detected. 5. Assign/Swap buttons. |
| **Content Rules** | Duty types: Teaching (blue), Duty (amber), Break (green), Off (gray). Gaps shown as red outline. |
| **Data Requirements** | schedule[] (array of {staffId, staffName, days[] (array of {duty, time, location})}), coverageGaps[] |
| **Primary Actions** | Assign duty, Swap duties, View staff detail |
| **Responsive** | Desktop: full grid. Mobile: single day view. |
| **Anti-Patterns** | Schedule without coverage check. No swap option. No gap indicator. |
| **Validation Checklist** | 1. Grid present. 2. Duty types with badges. 3. Coverage alert. 4. Assign/Swap actions. 5. Date range filter. |

---

## 5J.4 Resource Allocation Board

**Recipe ID:** `RC-PLAN-RESOURCE-BOARD-1`

| Field | Value |
|-------|-------|
| **Purpose** | Track allocation and availability of shared resources (rooms, equipment, vehicles) |
| **Business Objective** | Prevent resource conflicts and optimise utilisation |
| **User Goal** | See resource availability and book/allocate resources |
| **Parent Pattern** | PAT-WORK-DATA |
| **Typical Screen Types** | Resource Management |
| **Primary User** | Administrator |
| **Usage Frequency** | MEDIUM (8 screens) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Resource containers |
| Badge | Yes | 2 | Availability status |
| Data Table | Yes | 3 | Booking list |
| Button | Yes | 4 | Book resource |
| Select | Yes | 5 | Resource type filter |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Resource type filter (Rooms, Equipment, Vehicles). 2. Resource list: Card per resource (name, type, availability badge, current booking). 3. Booking table below: Resource | Booked By | Date | Time | Status. 4. Book resource button. |
| **Content Rules** | Status: Available (green), Booked (amber), Maintenance (red). Availability based on current date/time. |
| **Data Resources** | resources[] (array of {id, name, type, status, currentBooking{}}), bookings[] (array) |
| **Primary Actions** | Book resource, Cancel booking, View history |
| **Responsive** | Desktop: grid + table. Mobile: card list. |
| **Anti-Patterns** | Resource without availability status. No booking conflict detection. No cancel option. |
| **Validation Checklist** | 1. Resource type filter. 2. Resource cards with status. 3. Booking table. 4. Book action. 5. Conflict detection. 6. Cancel action. |

---

# 5K. Administration Recipes (Platform-level)

---

## 5K.1 System Health Dashboard

**Recipe ID:** `RC-ADMIN-SYS-HEALTH-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display real-time system health metrics and service status |
| **Business Objective** | Enable platform operators to monitor system reliability |
| **User Goal** | Quickly identify system issues and their impact |
| **Parent Pattern** | PAT-DASH-OVERVIEW |
| **Typical Screen Types** | Platform Admin Dashboard |
| **Primary User** | Platform Operator |
| **Usage Frequency** | HIGH (continuous monitoring) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Section containers |
| Stat Card | Yes | 2 | System metrics |
| Badge | Yes | 3 | Service status |
| Progress Bar | Yes | 4 | Resource utilisation |
| Alert | Yes | 5 | Active incidents |
| Data Table | Yes | 6 | Service status list |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Alert banner (if active incidents). 2. Stat cards (Uptime %, Response Time, Active Users, Error Rate). 3. Service status table (Service Name, Status badge, Latency, Last Check). 4. Resource utilisation (CPU, Memory, Disk with progress bars). |
| **Content Rules** | Status: Healthy (green), Degraded (amber), Down (red). Uptime: 30-day rolling. Response Time: p95. |
| **Data Requirements** | metrics{uptime, responseTime, activeUsers, errorRate}, services[] (with status, latency), resources{cpu, memory, disk} |
| **Primary Actions** | Click service -> detail/logs. Acknowledge incident. View history. |
| **Responsive** | Desktop: full dashboard. Mobile: stacked cards. |
| **Anti-Patterns** | Dashboard without uptime metric. No latency display. No incident alert. Status without last check time. |
| **Validation Checklist** | 1. Alert banner. 2. System stats. 3. Service status table. 4. Resource utilisation bars. 5. Incident alerts. 6. Drill-down to detail. |

---

## 5K.2 Audit Log Viewer

**Recipe ID:** `RC-ADMIN-AUDIT-LOG-1`

| Field | Value |
|-------|-------|
| **Purpose** | Display system audit trail of user actions and system events |
| **Business Objective** | Ensure accountability and support compliance |
| **User Goal** | Search and review system activity for security and compliance |
| **Parent Pattern** | PAT-WORK-LIST |
| **Typical Screen Types** | Audit Log, Security View |
| **Primary User** | Platform Operator, Administrator |
| **Usage Frequency** | MEDIUM (8 screens) |
| **Information Density** | High |
| **Interaction Complexity** | Medium |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Data Table | Yes | 1 | Audit entries |
| Search Field | Yes | 2 | Search logs |
| Select | Yes | 3 | Action type, user, date range |
| Badge | Yes | 4 | Action type indicators |
| Button | Yes | 5 | Export, Filter |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Search + filters (action type, user, date range, resource type). 2. Data Table (Timestamp, User, Action, Resource, Details, IP Address). 3. Action badges: Create (green), Update (blue), Delete (red), Login (gray). 4. Export button. |
| **Content Rules** | Timestamp: ISO format with timezone. Actions categorised. Details: expandable JSON. IP address recorded. |
| **Data Requirements** | logs[] (array of {timestamp, userId, userName, action, resourceType, resourceId, details, ipAddress}) |
| **Primary Actions** | Search, Filter, Export, Expand details |
| **Responsive** | Desktop: full table. Mobile: card list. |
| **Anti-Patterns** | Log without timestamp. No user identification. No export option. Log without IP address. |
| **Validation Checklist** | 1. Table with all columns. 2. Search present. 3. Filters present. 4. Action badges. 5. Export present. 6. Expandable details. |

---

## 5K.3 School Setup Wizard

**Recipe ID:** `RC-ADMIN-SCHOOL-SETUP-1`

| Field | Value |
|-------|-------|
| **Purpose** | Guide administrators through initial school configuration |
| **Business Objective** | Ensure complete school setup for platform operation |
| **User Goal** | Configure the school profile, departments, and initial data |
| **Parent Pattern** | PAT-FORM-WIZARD |
| **Typical Screen Types** | Onboarding Wizard |
| **Primary User** | Administrator, Platform Operator |
| **Usage Frequency** | LOW (one-time per school) |
| **Information Density** | Medium |
| **Interaction Complexity** | High (multi-step) |

| Component | Required | Order | Role |
|-----------|----------|-------|------|
| Card | Yes | 1 | Step containers |
| Progress Bar | Yes | 2 | Step indicator |
| Text Field | Yes | 3 | Form inputs |
| Select | Yes | 4 | Dropdown selections |
| File Upload | Yes | 5 | Logo/documents |
| Button | Yes | 6 | Next, Back, Complete |

| Field | Value |
|-------|-------|
| **Component Order** | 1. Progress bar (Steps: School Profile -> Departments -> Academic Structure -> Staff Import -> Students Import -> Complete). 2. Card: form for current step. 3. Navigation: Back, Next, Complete. |
| **Content Rules** | Steps: (1) School Profile: name, address, logo, contact. (2) Departments: create departments. (3) Academic Structure: classes, sections, subjects. (4) Staff Import: CSV upload. (5) Student Import: CSV upload. (6) Complete: summary + launch. |
| **Data Requirements** | currentStep (number), formData{} (accumulated across steps) |
| **Primary Actions** | Next, Back, Complete, Import CSV |
| **Responsive** | Desktop: full form. Mobile: simplified. |
| **Anti-Patterns** | Setup without progress indicator. No import option. No review/complete step. |
| **Validation Checklist** | 1. Progress bar. 2. All steps defined. 3. Back/Next/Complete. 4. CSV import per step. 5. Review step. 6. Complete action. |

---

# 6. Component Composition Rules

---

## 6.1 Composition Principles

Recipes compose Components following these rules:

### Rule 1: Composition Hierarchy

```
Primitive → Composite → Pattern → Recipe → Template → Screen
```

- A Recipe contains **Components** (Primitives or Composites).
- A Recipe **never** contains another Recipe.
- A Recipe **never** contains a Pattern (Patterns are abstractions, not components).
- A Recipe **never** contains a Template.

### Rule 2: Component Origin

- Components in a Recipe must exist in the Component Library (§3.2-3.5 of Design System).
- If a needed component does not exist, it must be designed and added to the Component Library before the Recipe can be finalised.
- New components follow the Component Lifecycle (§3.6 of Design System).

### Rule 3: Composition Limits

| Constraint | Limit |
|-----------|-------|
| Minimum components per Recipe | 2 |
| Maximum components per Recipe | 12 |
| Maximum nesting depth | 3 levels (Card > Card > Button) |
| Maximum instances of same component | 4 (unless data-driven, e.g., table rows) |

### Rule 4: Required Components

Every Recipe **must** include:

| Required Component | Purpose |
|-------------------|---------|
| Container (Card or Frame) | Structural containment |
| At least one text element | Content delivery |
| At least one interactive element | User action |

### Rule 5: State Coverage

Every Recipe **must** define all applicable states:

| State | Required? |
|-------|-----------|
| Default | Yes (always) |
| Empty | Yes (if data-dependent) |
| Loading | Yes (if data-dependent) |
| Error | Yes (if data-dependent) |
| Hover/Focus | Yes (if interactive) |
| Disabled | Conditional (if applicable) |
| Responsive | Yes (always) |

---

## 6.2 Component Interaction Patterns

### Input → Display Pattern
```
Text Field → triggers → Data Table updates
Select → triggers → Filter Panel updates
Search Field → triggers → Results refresh
```

### Action → Confirmation Pattern
```
Button (destructive) → triggers → Alert (confirmation) → executes action
Button (submit) → triggers → Loading state → displays result
```

### Navigation Pattern
```
Card click → navigates → Detail view
Button click → navigates → Form view
Tab click → switches → Content panel
```

### Data Flow Pattern
```
Parent component passes data → Child components receive via props
Child action → calls → Parent callback → Parent updates state
```

---

# 7. Pattern Integration

---

## 7.1 Recipe-to-Pattern Mapping

Each Recipe is associated with one or more Patterns. The Recipe is a concrete implementation of the Pattern's abstract guidance.

| Recipe Category | Primary Pattern | Secondary Patterns |
|----------------|----------------|-------------------|
| Dashboard Recipes (5A) | PAT-DASH-OVERVIEW | PAT-DASH-METRIC, PAT-DASH-SUMMARY |
| Data Recipes (5B) | PAT-WORK-LIST | PAT-WORK-DATA |
| Student Recipes (5C) | PAT-WORK-DETAIL | PAT-WORK-LIST, PAT-FORM-WIZARD |
| Teacher Recipes (5D) | PAT-WORK-DATA | PAT-FORM-WIZARD, PAT-DASH-OVERVIEW |
| Finance Recipes (5E) | PAT-RPT-SUMMARY | PAT-WORK-LIST, PAT-FORM-SINGLE |
| Academic Recipes (5F) | PAT-WORK-DATA | PAT-FORM-WIZARD |
| Administration Recipes (5G) | PAT-WORK-LIST | PAT-WORK-DATA |
| AI Recipes (5H) | PAT-WORK-DATA | PAT-DASH-OVERVIEW |
| Communication Recipes (5I) | PAT-FORM-SINGLE | PAT-WORK-DATA |
| Planning Recipes (5J) | PAT-WORK-DATA | PAT-FORM-WIZARD |
| Platform Admin Recipes (5K) | PAT-DASH-OVERVIEW | PAT-WORK-LIST |

## 7.2 Pattern Rules Inherited by Recipes

Recipes inherit all rules from their parent Pattern. When a Recipe conflicts with a Pattern, the Pattern takes precedence and the Recipe must be adjusted.

| Pattern Rule | Inheritance |
|-------------|-------------|
| Information density | Inherited (may be adjusted within density band) |
| Interaction complexity | Inherited (must match) |
| Navigation rules | Inherited (must follow) |
| Content rules | Inherited (may add specificity) |
| Responsive rules | Inherited (may add breakpoint specifics) |
| Accessibility rules | Inherited (must comply) |

## 7.3 Multi-Pattern Recipes

Some Recipes combine elements from multiple Patterns. When this occurs:

1. **Primary Pattern** determines the overall layout and structure.
2. **Secondary Patterns** contribute specific component arrangements.
3. **Pattern priority** resolves conflicts: Primary > Secondary.
4. **Documentation** must explicitly state which Pattern governs which aspect.

---

# 8. Selection Rules (Deterministic Algorithms)

---

## 8.1 Recipe Selection Algorithm

When a designer needs to implement a screen, follow this algorithm:

### Step 1: Identify Screen Type

```
IF screen is a DASHBOARD or OVERVIEW
  → Go to Step 2A (Dashboard Recipe Selection)
ELSE IF screen is a LIST or DATA MANAGEMENT
  → Go to Step 2B (List Recipe Selection)
ELSE IF screen is a DETAIL or PROFILE
  → Go to Step 2C (Detail Recipe Selection)
ELSE IF screen is a FORM or EDITOR
  → Go to Step 2D (Form Recipe Selection)
ELSE IF screen is a WIZARD or MULTI-STEP
  → Go to Step 2E (Wizard Recipe Selection)
ELSE IF screen is a REPORT or ANALYTICS
  → Go to Step 2F (Report Recipe Selection)
ELSE IF screen is a COMMUNICATION or MESSAGE
  → Go to Step 2G (Communication Recipe Selection)
ELSE IF screen is SETTINGS or CONFIGURATION
  → Go to Step 2H (Settings Recipe Selection)
```

### Step 2A: Dashboard Recipe Selection

```
IF primary purpose is "show KPIs at a glance"
  → RC-DASH-KPI-PANEL-1
ELSE IF primary purpose is "show multiple metrics in grid"
  → RC-DASH-METRIC-GRID-1
ELSE IF primary purpose is "academic performance overview"
  → RC-DASH-PERF-SUMMARY-1
ELSE IF primary purpose is "attendance overview"
  → RC-DASH-ATTENDANCE-OVERVIEW-1
ELSE IF primary purpose is "financial summary"
  → RC-DASH-FIN-SNAPSHOT-1
ELSE IF primary purpose is "navigation + quick actions"
  → RC-DASH-QUICK-ACTIONS-1
ELSE IF primary purpose is "recent activity feed"
  → RC-DASH-RECENT-ACTIVITY-1
ELSE IF primary purpose is "upcoming events"
  → RC-DASH-UPCOMING-EVENTS-1
ELSE
  → RC-DASH-KPI-PANEL-1 (default)
```

### Step 2B: List Recipe Selection

```
IF entity count is unpredictable AND search is needed
  → RC-DATA-TABLE-WORKSPACE-1
ELSE IF entity count is small (<20) AND no search needed
  → RC-STU-CLASS-ROSTER-1 or equivalent domain list
ELSE IF list is for a specific entity type
  → Check domain-specific recipes (5C-5K)
ELSE
  → RC-DATA-TABLE-WORKSPACE-1 (default)
```

### Step 2C: Detail Recipe Selection

```
IF entity is a student
  → RC-STU-DETAIL-HEADER-1 (header) + domain sub-view
ELSE IF entity is staff
  → RC-ADMIN-STAFF-DIRECTORY-1 (card variant)
ELSE IF entity is a fee invoice
  → RC-FIN-INVOICE-PREVIEW-1
ELSE IF entity is generic
  → Compose from Pattern PAT-WORK-DETAIL
```

### Step 2D: Form Recipe Selection

```
IF form is single-step AND fields < 8
  → Compose from Pattern PAT-FORM-SINGLE
ELSE IF form is single-step AND fields >= 8
  → Compose from Pattern PAT-FORM-COMPLEX
ELSE IF form has conditional fields
  → Compose from Pattern PAT-FORM-CONDITIONAL
ELSE IF form is for quick inline editing
  → Compose from Pattern PAT-FORM-QUICK
```

### Step 2E: Wizard Recipe Selection

```
IF wizard is enrollment-related
  → RC-STU-ENROLLMENT-WIZARD-1
ELSE IF wizard is school setup
  → RC-ADMIN-SCHOOL-SETUP-1
ELSE IF wizard is exam-related
  → RC-PLAN-EXAM-TIMETABLE-1
ELSE
  → Compose from Pattern PAT-FORM-WIZARD
```

## 8.2 Component Selection Algorithm

Once a Recipe is selected, components within it are determined by the Recipe definition. The designer follows the Recipe's component table exactly.

**Override rules:**
- Components marked Required must always be included.
- Components marked Optional may be omitted if:
  - The screen context does not need them (e.g., no file attachments needed)
  - The mobile breakpoint cannot accommodate them
  - The user role does not need them
- Component order must be preserved unless responsive rules require rearrangement.

---

# 9. Validation Rules

---

## 9.1 Recipe Validation Checklist

Every Recipe implementation must pass this validation:

### Structural Validation

| Rule | Check |
|------|-------|
| Required components present | All components marked "Required" are included |
| Component order matches | Components are arranged in the specified order |
| States defined | All applicable states are implemented |
| Responsive rules applied | All breakpoint adaptations are implemented |

### Content Validation

| Rule | Check |
|------|-------|
| Data requirements met | All data fields listed are available |
| Content rules followed | Text limits, formats, and defaults are correct |
| Empty state present | Empty state message and action defined |
| Loading state present | Loading indicator defined |
| Error state present | Error message and retry action defined |

### Interaction Validation

| Rule | Check |
|------|-------|
| Primary actions defined | At least one primary action exists |
| Secondary actions defined | Secondary actions listed and functional |
| Permissions applied | Role-based access is enforced |
| Keyboard navigation works | All interactive elements are keyboard accessible |
| Focus management correct | Focus order follows visual order |

### Accessibility Validation

| Rule | Check |
|------|-------|
| ARIA labels present | All interactive elements have labels |
| Colour contrast meets AA | Text and interactive elements pass 4.5:1 |
| Touch targets >= 44px | All interactive elements meet minimum size |
| Screen reader compatible | Content reads logically without visual context |

## 9.2 Pass/Fail Criteria

A Recipe implementation **passes** if:
- All Required components are present
- Component order is preserved (or justified by responsive rules)
- All states are defined and implemented
- Accessibility rules are met
- No anti-patterns are present

A Recipe implementation **fails** if:
- Any Required component is missing
- States are undefined
- Anti-patterns are present
- Accessibility rules are violated

---

# 10. School ERP Coverage

---

## 10.1 Recipe Coverage by Domain Module

| Module | Recipes | Screens Covered | Coverage |
|--------|---------|----------------|----------|
| IAM (Identity & Access) | 2K.2, 2K.3 | ~15 | 60% |
| Institution Management | 5K.3 | ~20 | 40% |
| People Management | 5C.1-5C.7, 5D.1-5D.4, 5G.1 | ~120 | 85% |
| Academic Management | 5F.1-5F.4 | ~50 | 70% |
| Finance Management | 5E.1-5E.4 | ~40 | 75% |
| Communication | 5I.1-5I.4 | ~30 | 80% |
| Operations | 5G.2-5G.4 | ~20 | 60% |
| Documents & Learning | 5A.8 (Import), 5B.8 | ~15 | 40% |
| Reporting & Analytics | 5A.1-5A.7, 5H.1-5H.4 | ~80 | 70% |
| Platform Admin | 5K.1-5K.2 | ~10 | 50% |

## 10.2 Coverage Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| Document management recipes | Medium | Add Section 5L: Document Recipes |
| Library management recipes | Low | Add to Operations category |
| Hostel-specific workflows | Low | Extend 5G.4 Hostel Manager |
| Parent-specific views | Medium | Add Section 5M: Parent Recipes |
| Notification management | Medium | Extend 5I.4 Notification Preferences |
| Report builder (custom) | Medium | Add recipe for drag-and-drop report builder |
| Audit trail viewer | Covered | 5K.2 Audit Log Viewer |
| System health monitoring | Covered | 5K.1 System Health Dashboard |

---

# 11. Worked Examples

---

## 11.1 Example: Implementing Student Attendance Screen

### Screen Requirements
- Teacher takes daily attendance for a class
- 30 students per class
- Mark each as Present/Absent/Late
- Submit attendance once per day

### Recipe Selection (using §8.1 algorithm)
1. Screen type: DATA MANAGEMENT (attendance)
2. Entity: Student (class roster)
3. Check student recipes: 5C.4 Attendance Tracker ✓

### Component Assembly (from RC-STU-ATTENDANCE-TRACKER-1)

```
┌─────────────────────────────────────────────┐
│ [Date Picker: Today]  [Class: Form 4A  ▼]  │  ← Selectors
├─────────────────────────────────────────────┤
│ ┌───┬──────────────────┬──────────────────┐ │
│ │ 👤│ Amina Okonkwo    │ [✓] [✗] [~]     │ │  ← Student row
│ ├───┼──────────────────┼──────────────────┤ │
│ │ 👤│ Chen Wei          │ [✓] [✗] [~]     │ │
│ ├───┼──────────────────┼──────────────────┤ │
│ │ 👤│ Priya Sharma      │ [✓] [✗] [~]     │ │
│ │   │                   │          ●Present│ │  ← Status badge
│ ├───┼──────────────────┼──────────────────┤ │
│ │   │ ... (27 more)    │                  │ │
│ └───┴──────────────────┴──────────────────┘ │
├─────────────────────────────────────────────┤
│ [████████████████████████ Save Attendance  ] │  ← Submit (full width)
└─────────────────────────────────────────────┘
```

### Validation Result
- ✓ Date selector present
- ✓ Class selector present
- ✓ All students listed (30)
- ✓ Status toggle (Present/Absent/Late)
- ✓ Submit button present
- ✓ Status badge present
- **PASS**

---

## 11.2 Example: Implementing Fee Collection Dashboard

### Screen Requirements
- Administrator views fee collection status
- Shows total billed, collected, outstanding
- Lists invoices with status
- Allows sending reminders

### Recipe Selection
1. Screen type: DASHBOARD / OVERVIEW
2. Domain: Finance
3. Check finance recipes: 5E.3 Fee Collection Dashboard ✓

### Component Assembly (from RC-FIN-FEE-COLLECTION-1)

```
┌─────────────────────────────────────────────────────┐
│  [Stat: ₦2.4M]  [Stat: ₦1.8M]  [Stat: 75%] [Stat: ₦600K] │  ← Stats
│  Total Billed  Collected   Rate    Outstanding     │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐    │
│  │ Bar Chart: Monthly Collection (6 months)    │    │  ← Chart
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│  Student    │ Invoice  │ Amount │ Due    │ Status   │  ← Table
│  Amina O.   │ INV-001  │ ₦50K   │ Jan 15 │ ● Paid   │
│  Chen W.    │ INV-002  │ ₦75K   │ Jan 20 │ ● Overdue│
│  Priya S.   │ INV-003  │ ₦50K   │ Feb 01 │ ● Pending│
├─────────────────────────────────────────────────────┤
│  [Send Reminders]  [Export Report]                  │  ← Actions
└─────────────────────────────────────────────────────┘
```

### Validation Result
- ✓ Summary stats present (4 metrics)
- ✓ Collection chart present
- ✓ Invoice table present
- ✓ Overdue highlighted (red)
- ✓ Send reminder action
- ✓ Export action
- **PASS**

---

## 11.3 Example: Implementing Student Profile Detail

### Screen Requirements
- Administrator views full student profile
- Shows identity, academics, fees, attendance

### Recipe Selection
1. Screen type: DETAIL / PROFILE
2. Entity: Student
3. Check student recipes: 5C.2 Student Detail Header ✓ (header)
4. Sub-views composed from domain-specific recipes

### Component Assembly
- Header: RC-STU-DETAIL-HEADER-1 (always present)
- Tab 1 (Academic): Data table from RC-TCH-GRADEBOOK-1
- Tab 2 (Attendance): Calendar grid from 5F.3 Academic Calendar
- Tab 3 (Fees): RC-STU-FEE-STATEMENT-1
- Tab 4 (Communication): Message thread from RC-COMM-MESSAGE-THREAD-1

### Validation Result
- ✓ Student header with avatar, name, status, tags
- ✓ Stat cards (attendance, GPA, fee balance, pending)
- ✓ Tabbed sub-views
- ✓ Edit action present
- ✓ Responsive at all breakpoints
- **PASS**

---

# 12. Documentation Standards

---

## 12.1 Recipe Documentation Template

Every Recipe must be documented using this structure:

```
## [Recipe Name]

**Recipe ID:** `RC-[CATEGORY]-[NAME]-[VERSION]`

| Field | Value |
|-------|-------|
| **Purpose** | [One sentence] |
| **Business Objective** | [Why this recipe exists] |
| **User Goal** | [What the user achieves] |
| **Parent Pattern** | [Pattern(s) this recipe implements] |
| **Typical Screen Types** | [Where this recipe is used] |
| **Primary User** | [Who uses this recipe] |
| **Usage Frequency** | [HIGH/MEDIUM/LOW with estimate] |
| **Information Density** | [Low/Medium/High] |
| **Interaction Complexity** | [Low/Medium/High] |

### Component Table
| Component | Required | Order | Role |
|-----------|----------|-------|------|
| [name] | Yes/No | [n] | [purpose] |

### Field Table
| Field | Value |
|-------|-------|
| **Component Order** | [Detailed arrangement] |
| **Hierarchy Rules** | [Layout constraints] |
| **Content Rules** | [Text/data rules] |
| **Data Requirements** | [Data fields needed] |
| **Primary Actions** | [User actions] |
| **Secondary Actions** | [Additional actions] |
| **Empty State** | [When no data] |
| **Loading State** | [While loading] |
| **Error State** | [On error] |
| **Permissions** | [Role-based access] |
| **Responsive** | [Breakpoint behavior] |
| **Accessibility** | [a11y requirements] |
| **AI Opportunities** | [AI integration points] |
| **Analytics Events** | [Tracking events] |
| **Anti-Patterns** | [What to avoid] |
| **Validation Checklist** | [Pass/fail criteria] |
| **Pass/Fail** | [PASS: criteria / FAIL: criteria] |
```

## 12.2 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Recipe ID | `RC-[CATEGORY]-[NAME]-[VERSION]` | `RC-STU-PROFILE-CARD-1` |
| Category prefix | 3 uppercase letters | `STU`, `FIN`, `TCH`, `AI` |
| Recipe name | Hyphenated lowercase | `profile-card`, `fee-statement` |
| Version | Integer starting at 1 | `1`, `2`, `3` |
| Component reference | Use exact Component Library name | `Card`, `Data Table`, `Badge` |
| Pattern reference | Use exact Pattern Library ID | `PAT-WORK-LIST`, `PAT-DASH-OVERVIEW` |

## 12.3 Version Control

| Change Type | Version Impact |
|-------------|---------------|
| Add optional component | Minor (no version change) |
| Remove optional component | Minor (no version change) |
| Add required component | Major (version +1) |
| Remove required component | Major (version +1) |
| Change component order | Major (version +1) |
| Change data requirements | Major (version +1) |
| Add anti-pattern | Minor (no version change) |
| Fix typo/clarification | Patch (no version change) |

---

# 13. Architecture Review

---

## 13.1 Component Library Integration

| Design System Section | Recipe Library Integration |
|----------------------|---------------------------|
| §3.1 Principles | Recipes inherit all 6 principles |
| §3.2 Primitives | Used directly in Recipes |
| §3.3 Composites | Used directly in Recipes |
| §3.4 Patterns | Patterns provide guidance; Recipes implement |
| §3.5 Templates | Templates may compose multiple Recipes |
| §3.6 Lifecycle | Recipes follow same lifecycle as Components |
| §3.7 Composition | Recipe = composition of Components solving a user problem |

## 13.2 Pattern Library Integration

| Pattern Library Section | Recipe Library Integration |
|------------------------|---------------------------|
| §2 Philosophy | Recipes inherit "compose, don't create" philosophy |
| §3 Pattern Lifecycle | Recipes are authored after Pattern is Approved |
| §4 Pattern Structure | Recipes implement Pattern's component guidance |
| §5 Pattern Variants | Recipes may implement a specific Variant |
| §6 Decision Tree | Decision Tree selects the Pattern; Recipe implements it |
| §7 Selection Algorithm | Recipe Selection Algorithm (§8) extends Pattern Selection |

## 13.3 Cross-Reference Map

| Document | References |
|----------|-----------|
| UI Strategy | §8.6 (Component Library) — Recipe Library extends this |
| Design System | §3.1-3.7 — Recipes are compositions of these Components |
| Figma Build Roadmap | Phase 3-5 — Recipes are used in Phase 4-5 |
| Pattern Library | §1-21 — Recipes implement Patterns |
| Screen Blueprint Spec | §12-14 — Recipes are referenced in Screen Blueprints |
| Engineering-to-Pattern Mapping | §3 — Patterns mapped; Recipes are implementations |
| **This document** | **§1-13 — Component Recipe Library** |

## 13.4 Derivation Chain

```
UI Strategy (§8.6)
    ↓ defines
Design System (§3.1-3.7)
    ↓ specifies components and patterns
Pattern Library (§47 patterns)
    ↓ provides abstraction guidance
Component Recipe Library (this document)
    ↓ composes components into solutions
Screen Blueprints
    ↓ define specific screens
Engineering Specs
    ↓ implement screens in code
```

---

# Appendix A: Recipe ID Registry

| Recipe ID | Name | Category |
|-----------|------|----------|
| RC-DASH-KPI-PANEL-1 | KPI Panel | Dashboard |
| RC-DASH-METRIC-GRID-1 | Metric Grid | Dashboard |
| RC-DASH-PERF-SUMMARY-1 | Performance Summary | Dashboard |
| RC-DASH-ATTENDANCE-OVERVIEW-1 | Attendance Overview | Dashboard |
| RC-DASH-FIN-SNAPSHOT-1 | Financial Snapshot | Dashboard |
| RC-DASH-QUICK-ACTIONS-1 | Quick Actions | Dashboard |
| RC-DASH-RECENT-ACTIVITY-1 | Recent Activity | Dashboard |
| RC-DASH-UPCOMING-EVENTS-1 | Upcoming Events | Dashboard |
| RC-DATA-TABLE-WORKSPACE-1 | Data Table Workspace | Data |
| RC-DATA-SEARCH-TOOLBAR-1 | Search Toolbar | Data |
| RC-DATA-FILTER-BAR-1 | Filter Bar | Data |
| RC-DATA-BULK-ACTION-BAR-1 | Bulk Action Bar | Data |
| RC-DATA-PAGINATION-FOOTER-1 | Pagination Footer | Data |
| RC-DATA-EMPTY-DATASET-1 | Empty Dataset | Data |
| RC-DATA-NO-RESULTS-1 | No Search Results | Data |
| RC-DATA-IMPORT-PANEL-1 | Import Panel | Data |
| RC-DATA-EXPORT-PANEL-1 | Export Panel | Data |
| RC-STU-PROFILE-CARD-1 | Student Profile Card | Student |
| RC-STU-DETAIL-HEADER-1 | Student Detail Header | Student |
| RC-STU-CLASS-ROSTER-1 | Class Roster List | Student |
| RC-STU-ATTENDANCE-TRACKER-1 | Attendance Tracker | Student |
| RC-STU-REPORT-CARD-1 | Report Card View | Student |
| RC-STU-FEE-STATEMENT-1 | Fee Statement | Student |
| RC-STU-ENROLLMENT-WIZARD-1 | Enrollment Wizard | Student |
| RC-TCH-LESSON-PLAN-1 | Lesson Plan Builder | Teacher |
| RC-TCH-GRADEBOOK-1 | Gradebook Entry | Teacher |
| RC-TCH-STUDENT-PROGRESS-1 | Student Progress Dashboard | Teacher |
| RC-TCH-TIMETABLE-1 | Timetable View | Teacher |
| RC-FIN-INVOICE-PREVIEW-1 | Invoice Preview Card | Finance |
| RC-FIN-PAYMENT-FORM-1 | Payment Form | Finance |
| RC-FIN-FEE-COLLECTION-1 | Fee Collection Dashboard | Finance |
| RC-FIN-BUDGET-TRACKER-1 | Budget Tracker | Finance |
| RC-ACAD-CURRICULUM-MAP-1 | Curriculum Map | Academic |
| RC-ACAD-ASSESSMENT-BUILDER-1 | Assessment Builder | Academic |
| RC-ACAD-CALENDAR-1 | Academic Calendar | Academic |
| RC-ACAD-EXAM-SEATING-1 | Exam Seating Arrangement | Academic |
| RC-ADMIN-STAFF-DIRECTORY-1 | Staff Directory | Administration |
| RC-ADMIN-INVENTORY-1 | Inventory Tracker | Administration |
| RC-ADMIN-TRANSPORT-1 | Transport Route Manager | Administration |
| RC-ADMIN-HOSTEL-1 | Hostel Manager | Administration |
| RC-AI-INSIGHTS-PANEL-1 | AI Insights Panel | AI |
| RC-AI-CHAT-1 | AI Chat Interface | AI |
| RC-AI-PREDICTIVE-1 | Predictive Analytics Card | AI |
| RC-AI-RECOMMENDATION-FEED-1 | Smart Recommendation Feed | AI |
| RC-COMM-ANNOUNCEMENT-COMPOSER-1 | Announcement Composer | Communication |
| RC-COMM-MESSAGE-THREAD-1 | Message Thread | Communication |
| RC-COMM-TEMPLATE-EDITOR-1 | SMS/Email Template Editor | Communication |
| RC-COMM-NOTIF-PREFERENCES-1 | Notification Preferences | Communication |
| RC-PLAN-EXAM-TIMETABLE-1 | Exam Timetable Builder | Planning |
| RC-ACAD-YEAR-PLANNER-1 | Academic Year Planner | Planning |
| RC-PLAN-STAFF-SCHEDULE-1 | Staff Schedule | Planning |
| RC-PLAN-RESOURCE-BOARD-1 | Resource Allocation Board | Planning |
| RC-ADMIN-SYS-HEALTH-1 | System Health Dashboard | Platform Admin |
| RC-ADMIN-AUDIT-LOG-1 | Audit Log Viewer | Platform Admin |
| RC-ADMIN-SCHOOL-SETUP-1 | School Setup Wizard | Platform Admin |

---

# Appendix B: Glossary

| Term | Definition |
|------|-----------|
| **Recipe** | A structured composition of multiple Components that solves a specific user problem within a defined context |
| **Component** | A single, reusable UI element (Primitive or Composite) from the Component Library |
| **Pattern** | An abstract UI solution to a recurring design problem, providing guidance without specific implementation |
| **Template** | A page-level layout structure that arranges Patterns and Recipes into a complete screen |
| **Screen Blueprint** | A complete specification for a single screen, including layout, components, data, interactions, and states |
| **Parent Pattern** | The Pattern that a Recipe implements |
| **Component Order** | The sequential arrangement of components in a Recipe |
| **Required Component** | A component that must be present in every implementation of the Recipe |
| **Optional Component** | A component that may be omitted based on context |
| **Recipe Version** | Integer version tracking changes to the Recipe definition |

---

*Document Version: 1.0*
*Total Recipes: 55*
*Total Categories: 11 (Dashboard 8, Data 9, Student 7, Teacher 4, Finance 4, Academic 4, Administration 4, AI 4, Communication 4, Planning 4, Platform Admin 3)*
*Last Updated: 2026-07-23*
*Status: Complete — Sections 1-13, Appendices A-B.*
