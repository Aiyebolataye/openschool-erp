# OpenSchool ERP

## Screen Blueprint Specification

---

| Field | Value |
|-------|-------|
| **Document** | Screen Blueprint Specification — Governing Standard |
| **Version** | 1.0 |
| **Status** | Draft |
| **Date** | July 2026 |
| **Classification** | Internal |
| **Author** | Architecture Team |
| **Owner** | Solution Architect |

---

| Aspect | Detail |
|--------|--------|
| **Purpose** | Governing standard for authoring, validating, and maintaining Screen Blueprints across the entire OpenSchool ERP project |
| **Scope** | Every screen blueprint authored for any module, workspace, or platform surface |
| **Authority** | Medium — derives authority from Documentation Constitution, Engineering Specifications, and UI/UX Documentation |
| **Compliance** | Mandatory for all contributors authoring screen blueprints |

---

## Table of Contents

1. [Position in the Documentation Pipeline](#1-position-in-the-documentation-pipeline)
2. [Introduction](#2-introduction)
3. [Purpose](#3-purpose)
4. [Scope](#4-scope)
5. [Position in Documentation Architecture](#5-position-in-documentation-architecture)
6. [Blueprint Philosophy](#6-blueprint-philosophy)
7. [Blueprint Lifecycle](#7-blueprint-lifecycle)
8. [Blueprint Structure](#8-blueprint-structure)
9. [Mandatory Metadata](#9-mandatory-metadata)
10. [Screen Classification](#10-screen-classification)
11. [User Intent](#11-user-intent)
12. [Business Intent](#12-business-intent)
13. [Information Hierarchy](#13-information-hierarchy)
14. [Task Hierarchy](#14-task-hierarchy)
15. [Navigation Context](#15-navigation-context)
16. [Workflow Context](#16-workflow-context)
17. [Pattern Assignment](#17-pattern-assignment)
18. [Screen States](#18-screen-states)
19. [Required Data](#19-required-data)
20. [Optional Data](#20-optional-data)
21. [Actions](#21-actions)
22. [Permissions](#22-permissions)
23. [Dependencies](#23-dependencies)
24. [Integrations](#24-integrations)
25. [Accessibility Requirements](#25-accessibility-requirements)
26. [Responsive Requirements](#26-responsive-requirements)
27. [AI Features](#27-ai-features)
28. [Analytics Requirements](#28-analytics-requirements)
29. [Validation Rules](#29-validation-rules)
30. [Anti-Patterns](#30-anti-patterns)
31. [Compliance Checklist](#31-compliance-checklist)
32. [Governance](#32-governance)
33. [Versioning](#33-versioning)
34. [Maintenance Process](#34-maintenance-process)
35. [Example Blueprints](#35-example-blueprints)
36. [Revision History](#36-revision-history)

---

# 1. Position in the Documentation Pipeline

---

## 1.1 Purpose

This section establishes where the Screen Blueprint Specification sits within the documentation pipeline, what it consumes, what it produces, and how it relates to every other specification in the repository.

## 1.2 Pipeline Position

```
Engineering Specifications (domain entities, workflows, APIs, events)
         │
         ▼
Screen Blueprint Specification (THIS DOCUMENT — governing standard)
         │
         ▼
Screen Blueprints (individual screen intent documents — authored per this spec)
         │
         ▼
Layout Templates (structural page compositions — referenced by blueprints)
         │
         ▼
UI Rendering Specification (visual implementation — pixel-level design)
         │
         ▼
Figma Designs (visual artifacts — design system compliant)
```

## 1.3 Inputs Consumed

| Input | Source | What It Provides |
|-------|--------|-----------------|
| Domain entities and aggregates | Engineering Specifications | What data exists, its states, relationships |
| Workflows and business processes | Engineering Specifications | What users need to accomplish |
| API endpoints and contracts | Engineering Specifications, API Style Guide | What operations are available |
| Domain events | Platform Event Catalogue | What cross-domain data flows exist |
| Roles and permissions | Identity & Access Engineering | Who can access what |
| User personas | UI Strategy & Design Direction §3.2 | Who uses each screen |
| Design philosophy | UI Strategy & Design Direction | How screens should feel |
| Page templates | Figma Build Roadmap Phase 5, 02 Design System §3.7 | Structural compositions available |
| Component inventory | 02 Design System & Component Library §3.7 | Available components for assembly |
| Workspace catalogue | Product Documentation §05 | What screens exist per workspace |
| System architecture | 01 System Architecture | Technical constraints and patterns |

## 1.4 Outputs Produced

| Output | Consumer | What It Provides |
|--------|----------|-----------------|
| Screen Blueprints | Figma Build Roadmap Phase 6 | Structured design intent for each screen |
| Pattern selection guidance | Pattern Library (future) | Which patterns are used where |
| Screen state specifications | UI Rendering Specification | What states each screen must support |
| Data display requirements | Implementation team | What data to fetch and display |
| Action specifications | Implementation team | What operations each screen supports |

## 1.5 Dependencies

| Document | Relationship | Nature |
|----------|-------------|--------|
| Documentation Constitution | Upstream authority | This spec must comply with all Constitution rules |
| Engineering Specifications | Upstream input | Blueprints derive screen intent from engineering specs |
| UI Strategy & Design Direction | Upstream input | Blueprints align with design philosophy |
| 02 Design System & Component Library | Upstream input | Blueprints reference templates and components |
| 03 Figma Standards & Design QA | Peer document | Blueprints inform Figma construction standards |
| Figma Build Roadmap | Downstream consumer | Phase 6 uses blueprints to build screens |
| Product Documentation | Upstream input | Workspace catalogue defines screen inventory |

## 1.6 Downstream Consumers

| Consumer | How They Use Blueprints |
|----------|------------------------|
| **Figma Build Roadmap Phase 6** | Each blueprint maps to a screen design task |
| **Figma designers** | Blueprints provide design intent before visual design begins |
| **UI Rendering Specification** | Blueprints define what the rendering spec must cover |
| **Implementation team** | Blueprints clarify screen requirements beyond API contracts |
| **QA team** | Blueprints define expected screen behaviour for validation |
| **Future Pattern Library** | Blueprints identify which patterns are used on which screens |

## 1.7 Relationship to Engineering Specification

The Engineering Specification defines **what** to build — entities, aggregates, events, APIs, business rules, and workflows. The Screen Blueprint defines **what the user sees and does** — which data is displayed, in what order, with what actions, for what purpose.

A Screen Blueprint MUST reference its source Engineering Specification. It MUST NOT redefine business rules, entity definitions, or API contracts. It translates engineering intent into user-facing design intent.

## 1.8 Relationship to Information Architecture

The Product Documentation workspace catalogue defines **which screens exist** for each workspace. The Screen Blueprint Specification defines **how each screen is structured**. The workspace catalogue is the authoritative inventory; blueprints are the authoritative structure for each listed screen.

## 1.9 Relationship to UI Rendering Specification

The UI Rendering Specification defines **how screens are visually implemented** — pixel dimensions, colours, typography, component states, and responsive behaviour. The Screen Blueprint defines **what the screen contains and why** — without prescribing visual treatment.

A Screen Blueprint MUST be authored before the UI Rendering Specification covers that screen. The blueprint is the design intent; the rendering spec is the visual implementation.

## 1.10 Relationship to Future Pattern Library

The Screen Blueprint selects a Pattern from the Pattern Library. It MUST NOT invent patterns. When the Pattern Library is created, each approved pattern will be referenced by blueprints using a stable identifier. Blueprints that reference patterns not yet in the library MUST flag the gap rather than inventing a pattern.

## 1.11 Relationship to Future Component Recipe Library

The Component Recipe Library will define how patterns compose into page layouts. Screen Blueprints reference templates (page-level compositions) from the Figma Build Roadmap, not individual component recipes. The relationship is indirect: Blueprint → Template → Patterns → Components.

## 1.12 Relationship to Future Figma Generation Workflow

When automated Figma generation is implemented, Screen Blueprints will serve as the structured input. The blueprint's metadata, pattern assignment, data requirements, and action specifications will drive template selection, component instantiation, and content zone population. The blueprint must be sufficiently structured to support this automation.

---

# 2. Introduction

---

## 2.1 The Problem

Engineering specifications define entities, workflows, and APIs. Design systems define components and tokens. But between these two layers exists a gap: **what should each screen contain, why, and for whom?**

Without a structured bridge, designers and engineers make independent assumptions about screen content, leading to:
- Screens that display data users do not need
- Missing data that users require
- Incorrect information hierarchy
- Workflows that do not match business processes
- Inconsistent screen patterns across modules

## 2.2 The Solution

The Screen Blueprint is a structured document that translates engineering requirements into design intent. It captures **what** the screen is, **why** it exists, **who** uses it, **what** it contains, and **what** users accomplish — without prescribing **how** it looks.

## 2.3 What a Blueprint Is

| Characteristic | Description |
|---------------|-------------|
| **Intent document** | Describes what the screen should achieve |
| **Structured** | Follows a canonical template with mandatory fields |
| **Traceable** | Every field references an approved source |
| **Reviewable** | Objectively validated against deterministic rules |
| **Visualisation-agnostic** | Does not prescribe colours, typography, or pixel dimensions |

## 2.4 What a Blueprint Is Not

| Characteristic | Description |
|---------------|-------------|
| **Not a wireframe** | Does not show visual layout |
| **Not a mockup** | Does not show visual design |
| **Not a spec** | Does not define API contracts or database schemas |
| **Not a user story** | Does not follow user story format |
| **Not a task list** | Does not define implementation tasks |

---

# 3. Purpose

---

## 3.1 Primary Purpose

The Screen Blueprint Specification establishes the canonical structure, lifecycle, rules, validation, and usage of Screen Blueprints across the entire OpenSchool ERP project.

## 3.2 Specific Objectives

| Objective | Description |
|-----------|-------------|
| **Standardise screen intent** | Every screen follows the same blueprint structure |
| **Enforce traceability** | Every screen decision traces to an approved source |
| **Eliminate assumptions** | Required fields force explicit design decisions |
| **Enable review** | Deterministic validation rules enable objective review |
| **Support automation** | Structured blueprints enable future Figma generation |
| **Bridge engineering and design** | Translate engineering requirements into design intent |

## 3.3 Non-Objectives

| Non-Objective | Why Excluded |
|---------------|-------------|
| Defining visual design | Belongs to UI Rendering Specification |
| Defining page layouts | Belongs to Pattern Library and Component Recipe Library |
| Defining component behaviour | Belongs to 02 Design System & Component Library |
| Defining API contracts | Belongs to Engineering Specifications and API Style Guide |
| Defining business rules | Belongs to Engineering Specifications |

---

# 4. Scope

---

## 4.1 In Scope

| Category | Coverage |
|----------|----------|
| **Screen types** | All screen categories defined in §10 |
| **Workspaces** | All workspaces defined in the Product Documentation workspace catalogue |
| **Modules** | All 10 domain modules |
| **Platforms** | Web (Next.js) and Mobile (Flutter) |
| **Roles** | All user personas defined in 01 UI Strategy §3.2 |

## 4.2 Out of Scope

| Category | Reason |
|----------|--------|
| Visual implementation | Belongs to UI Rendering Specification |
| Component specification | Belongs to 02 Design System & Component Library |
| Figma construction | Belongs to 03 Figma Standards & Design QA |
| Business rule definition | Belongs to Engineering Specifications |
| API contract definition | Belongs to API Style Guide |

---

# 5. Position in Documentation Architecture

---

## 5.1 Authority Level

| Level | Document | Authority |
|-------|----------|-----------|
| 1 | Documentation Constitution | Highest — governs all documentation |
| 2 | Product Vision, Roadmap | High |
| 3 | Architecture Documents, Platform Standards | High |
| 4 | Engineering Specifications | High |
| **5** | **Screen Blueprint Specification (this document)** | **Medium — governs screen blueprint authoring** |
| 6 | UI/UX Documentation (01, 02, 03, Roadmap) | Medium |
| 7 | Screen Blueprints (authored per this spec) | Lower — individual screen intent |
| 8 | Implementation Documentation | Lowest |

## 5.2 Compliance Chain

Every Screen Blueprint MUST comply with:
1. This Screen Blueprint Specification (authoring rules)
2. The Documentation Constitution (writing standards, terminology, cross-references)
3. The relevant Engineering Specification (source entities, workflows, permissions)
4. The UI Strategy & Design Direction (design philosophy alignment)

---

# 6. Blueprint Philosophy

---

## 6.1 Core Principles

| Principle | Description | Implication |
|-----------|-------------|-------------|
| **Intent over implementation** | Describe what the screen should achieve, not how it looks | No visual specifications |
| **Source-derived content** | Every field traces to an approved engineering or product document | No invented business rules |
| **Structured for automation** | Fields are machine-parseable where possible | Consistent field names, enumerated values |
| **Completeness over brevity** | Every mandatory field must be completed or explicitly marked as not applicable | No empty required fields |
| **One screen, one blueprint** | Each screen has exactly one blueprint | No multi-screen blueprints |
| **Living documents** | Blueprints update when engineering specs change | Version-tracked, change-managed |

## 6.2 What Blueprints Capture

| Category | Examples |
|----------|---------|
| **Identity** | Screen name, classification, workspace, module |
| **Purpose** | Why this screen exists, what problem it solves |
| **Audience** | Who uses it, what role, what context |
| **Content** | What data is displayed, in what hierarchy |
| **Interaction** | What users can do, what actions are available |
| **State** | What screen states exist (loading, empty, error, populated) |
| **Navigation** | How users arrive, where they can go |
| **Workflow** | Where this screen fits in a larger workflow |
| **Access** | Who can see this screen, what permissions are required |
| **Dependencies** | What other screens, data, or services this screen depends on |

## 6.3 What Blueprints Do Not Capture

| Category | Where It Belongs |
|----------|-----------------|
| Pixel dimensions, colours, typography | UI Rendering Specification |
| Component props and variants | 02 Design System & Component Library |
| API endpoint contracts | Engineering Specifications, API Style Guide |
| Database queries | Implementation code |
| Business rule logic | Engineering Specifications |
| Visual layout composition | Pattern Library, Component Recipe Library |

---

# 7. Blueprint Lifecycle

---

## 7.1 Lifecycle Stages

```
Authoring → Review → Approval → Implementation → Maintenance → Deprecation
```

## 7.2 Stage Definitions

| Stage | Description | Entry Criteria | Exit Criteria |
|-------|-------------|---------------|---------------|
| **Authoring** | Blueprint is being written | Engineering spec approved for the domain | All mandatory fields completed |
| **Review** | Blueprint is under validation | All mandatory fields completed | All validation rules pass |
| **Approval** | Blueprint is approved for design | Review passes | Human approval granted |
| **Implementation** | Blueprint drives Figma design and development | Approval granted | Screen implemented and QA'd |
| **Maintenance** | Blueprint updated due to engineering changes | Engineering spec change approved | Blueprint updated, re-reviewed |
| **Deprecation** | Screen is removed or replaced | Deprecation decision approved | Blueprint archived with reason |

## 7.3 Gate Rules

| Gate | Requirement |
|------|-------------|
| **Authoring → Review** | All mandatory fields completed; all cross-references valid |
| **Review → Approval** | All validation rules pass; no unresolved outstanding design decisions |
| **Approval → Implementation** | Human approval recorded; Figma design aligned with blueprint |
| **Implementation → Maintenance** | Engineering spec change approved and documented |
| **Any → Deprecation** | Deprecation approved; replacement blueprint exists if applicable |

## 7.4 Traceability Requirements

| From | To | Requirement |
|------|----|-------------|
| Blueprint | Engineering Specification | Every blueprint references at least one engineering spec |
| Blueprint | Workspace Catalogue | Every blueprint maps to a screen in the workspace catalogue |
| Blueprint | Pattern | Every blueprint selects an approved pattern |
| Screen implementation | Blueprint | Every implemented screen has an approved blueprint |
| Blueprint change | Engineering spec change | Blueprint changes trace to engineering spec changes |

---

# 8. Blueprint Structure

---

## 8.1 Canonical Template

Every Screen Blueprint MUST follow this template. Every field is defined in the subsequent chapters.

```markdown
# [Screen Name] — Screen Blueprint

## Metadata
- Blueprint ID: [unique identifier]
- Screen Name: [human-readable name]
- Screen Classification: [from §10]
- Module: [domain module name]
- Workspace: [workspace from catalogue]
- Platform: [Web / Mobile / Both]
- Engineering Spec Reference: [document and section]
- Workspace Catalogue Reference: [workspace and section]
- Status: [Authoring / Review / Approved / Deprecated]
- Version: [Major.Minor]
- Author: [name or role]
- Date Created: [ISO 8601]
- Last Updated: [ISO 8601]

## Purpose
- Why This Screen Exists: [description]
- Problem It Solves: [description]
- User Value: [description]

## Users
- Primary Persona: [from §10 persona list]
- Secondary Personas: [additional personas]
- Usage Context: [when/where/how often this screen is used]

## User Intent
- Primary Goal: [what the user wants to accomplish]
- Secondary Goals: [additional goals]
- Success Criteria: [what success looks like for the user]

## Business Intent
- Business Objective: [what the institution achieves]
- Operational Impact: [how this screen improves operations]
- Compliance Requirements: [any regulatory or policy requirements]

## Information Hierarchy
- Tier 1 (Primary): [most important information]
- Tier 2 (Secondary): [supporting information]
- Tier 3 (Tertiary): [reference or supplementary information]
- Justification: [why this hierarchy]

## Task Hierarchy
- Primary Task: [most common action]
- Secondary Tasks: [less frequent actions]
- Tertiary Tasks: [rare or administrative actions]
- Task Frequency: [how often each task is performed]

## Navigation Context
- Entry Points: [how users arrive at this screen]
- Exit Points: [where users can go from this screen]
- Breadcrumb Path: [navigation trail]
- Sidebar Position: [where this screen sits in navigation]

## Workflow Context
- Workflow Name: [larger workflow this screen belongs to]
- Workflow Position: [where this screen sits in the sequence]
- Preceding Screen: [what screen comes before]
- Following Screen: [what screen comes after]
- Parallel Screens: [screens that can be accessed from this one]

## Pattern Assignment
- Primary Pattern: [from approved pattern list]
- Pattern Rationale: [why this pattern was selected]
- Pattern Alternatives Considered: [other patterns evaluated]
- Pattern Library Reference: [link to pattern when available]

## Screen States
- Populated: [normal state with data]
- Loading: [data is being fetched]
- Empty: [no data available]
- Error: [something went wrong]
- Partial: [some data loaded, some failed]
- Permitted: [user lacks permission for some content]

## Required Data
[Table of every data element that MUST appear on this screen]

| Data Element | Source Entity | Source Field | Display Priority | Tier | Format |
|-------------|---------------|--------------|-----------------|------|--------|

## Optional Data
[Table of data elements that MAY appear based on context]

| Data Element | Source Entity | Source Field | Condition | Tier | Format |
|-------------|---------------|--------------|-----------|------|--------|

## Actions
[Table of every action the user can perform on this screen]

| Action | Trigger | Scope | Permission | Confirmation | Feedback |
|--------|---------|-------|------------|-------------|----------|

## Permissions
- Required Role: [minimum role to access this screen]
- Required Permission: [specific permission string from IAM spec]
- Permission Behaviour: [what happens when permission is absent]
- Role-Specific Variations: [how different roles see this screen differently]

## Dependencies
- Upstream Screens: [screens that must be visited before this one]
- Downstream Screens: [screens this one leads to]
- Data Dependencies: [other domains or screens this screen reads from]
- Service Dependencies: [APIs or services required]

## Integrations
- Cross-Domain Events: [events consumed or produced]
- External Services: [third-party integrations]
- Real-Time Data: [WebSocket or polling requirements]

## Accessibility Requirements
- Keyboard Navigation: [tab order, shortcuts]
- Screen Reader: [ARIA labels, live regions]
- Focus Management: [where focus moves on interaction]
- Colour Independence: [information not conveyed by colour alone]

## Responsive Requirements
- Mobile: [how this screen adapts to mobile]
- Tablet: [how this screen adapts to tablet]
- Desktop: [default desktop layout]
- Content Priority: [what to show/hide at each breakpoint]

## AI Features
- AI Assistance: [whether AI features are available on this screen]
- AI Data Requirements: [what data AI needs]
- AI Interaction Model: [how AI interacts with the user]

## Analytics Requirements
- Tracked Events: [user interactions to track]
- Metrics: [key metrics to measure]
- Success Indicators: [what indicates the screen is working well]

## Outstanding Design Decisions
[Table of decisions that require human approval]

| Decision | Context | Options | Recommendation | Status |
|----------|---------|---------|----------------|--------|
```

---

# 9. Mandatory Metadata

---

## 9.1 Blueprint ID

| Field | Specification |
|-------|--------------|
| **Purpose** | Uniquely identifies the blueprint across the entire project |
| **Format** | `SB-[MODULE]-[SCREEN-CLASS]-[SEQUENCE]` |
| **Example** | `SB-PEOPLE-CRUD-001` |
| **Rules** | Globally unique; never reused; assigned at authoring initiation |
| **Module codes** | IAM, INST, PEOPLE, ACAD, FIN, COMM, OPS, DOC, ANA, PLAT |
| **Classification codes** | See §10 screen classification codes |
| **Sequence** | Three-digit zero-padded number within module-class pair |

## 9.2 Screen Name

| Field | Specification |
|-------|--------------|
| **Purpose** | Human-readable identifier for the screen |
| **Format** | Noun or Noun Phrase; no verbs |
| **Examples** | `Student List`, `Fee Payment`, `Attendance Workspace` |
| **Rules** | Must match the name used in the workspace catalogue; must be unique within a workspace |
| **Anti-patterns** | `Manage Students` (verb), `Student CRUD List` (implementation detail), `Students` (ambiguous) |

## 9.3 Screen Classification

| Field | Specification |
|-------|--------------|
| **Purpose** | Categorises the screen by its structural type |
| **Values** | From the approved classification list (§10) |
| **Rules** | Exactly one classification per blueprint; determines expected template and structure |

## 9.4 Module

| Field | Specification |
|-------|--------------|
| **Purpose** | Identifies which domain module this screen belongs to |
| **Values** | One of the 10 approved domain modules |
| **Rules** | Exactly one module per blueprint; must match an approved engineering specification |

## 9.5 Workspace

| Field | Specification |
|-------|--------------|
| **Purpose** | Identifies which workspace (user role context) this screen belongs to |
| **Values** | From the Product Documentation workspace catalogue |
| **Rules** | Must match a workspace defined in the catalogue; a screen may serve multiple workspaces |

## 9.6 Platform

| Field | Specification |
|-------|--------------|
| **Purpose** | Identifies which platform(s) this screen is designed for |
| **Values** | `Web`, `Mobile`, or `Both` |
| **Rules** | Must reflect the engineering specification's platform scope |

## 9.7 Engineering Spec Reference

| Field | Specification |
|-------|--------------|
| **Purpose** | Links the blueprint to its source engineering specification |
| **Format** | `[Document Name] §[Section Number]` |
| **Example** | `People Engineering Specification §5.1` |
| **Rules** | Must reference a specific section; must be a valid reference |

## 9.8 Status

| Field | Specification |
|-------|--------------|
| **Purpose** | Tracks the blueprint's lifecycle stage |
| **Values** | `Authoring`, `Review`, `Approved`, `Deprecated` |
| **Rules** | Status transitions follow §7 lifecycle |

## 9.9 Version

| Field | Specification |
|-------|--------------|
| **Purpose** | Tracks blueprint revisions |
| **Format** | `Major.Minor` |
| **Rules** | Major = structural changes (classification, pattern, purpose); Minor = content updates (data elements, actions, permissions) |

---

# 10. Screen Classification

---

## 10.1 Classification Codes

| Code | Classification | Description |
|------|---------------|-------------|
| `DASH` | Dashboard | Aggregated overview screen with KPIs, charts, and widgets |
| `CRUD` | CRUD Workspace | List screen for creating, reading, updating, and deleting entities |
| `DTL` | Detail Workspace | Single-entity detail view with related information |
| `PRF` | Profile | User or entity profile with personal information and activity |
| `WIZ` | Wizard | Multi-step guided workflow |
| `ANL` | Analytics | Data analysis screen with charts, filters, and drill-down |
| `RPT` | Reports | Report generation, configuration, and viewing screen |
| `CAL` | Calendar | Date-based event and schedule view |
| `COM` | Communication | Messaging, notification, or announcement screen |
| `SRC` | Search | Dedicated search interface |
| `AIW` | AI Workspace | AI-assisted workspace with intelligent features |
| `AUTH` | Authentication | Login, registration, MFA, or account recovery screen |
| `SET` | Settings | Configuration and preferences screen |
| `MON` | Monitoring | System health, audit logs, or operational monitoring |
| `ADM` | Administration | Platform or institution administration screen |

## 10.2 Classification Details

### Dashboard (`DASH`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | Provide an aggregated overview of key metrics and activities |
| **User Expectations** | Quick glance; identify issues; access drill-down paths |
| **Information Characteristics** | KPIs, charts, recent activity, alerts, quick actions |
| **Interaction Characteristics** | Minimal primary interaction; mostly read-only with drill-down |
| **Typical Workflows** | Start of session; check status; identify what needs attention |
| **Expected Blueprint Structure** | Stat Cards (top), Charts (middle), Activity Feed (bottom), Quick Actions (sidebar) |
| **Engineering Reference** | Dashboard KPIs derive from entity aggregations across modules |

### CRUD Workspace (`CRUD`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | List, create, edit, and delete entities of a specific type |
| **User Expectations** | See all entities; filter and search; perform bulk operations |
| **Information Characteristics** | Tabular or card-based entity list; filters; pagination; bulk selection |
| **Interaction Characteristics** | Search, filter, sort, select, create, edit, delete, bulk actions |
| **Typical Workflows** | Find entity → View detail → Edit or delete; Bulk select → Bulk action |
| **Expected Blueprint Structure** | Header with actions, Filter Bar, Data Table or Card Grid, Pagination, Bulk Action Bar |
| **Engineering Reference** | Derived from entity list endpoints in the relevant engineering spec |

### Detail Workspace (`DTL`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | Display comprehensive information about a single entity |
| **User Expectations** | See all entity details; related information; perform entity-specific actions |
| **Information Characteristics** | Entity header, attribute groups, related entities, activity history |
| **Interaction Characteristics** | View details; edit inline or via modal; related entity navigation |
| **Typical Workflows** | From list → View detail → Edit; From related entity → View parent |
| **Expected Blueprint Structure** | Entity Header, Tabbed Content or Sidebar Layout, Related Entities, Activity Log |
| **Engineering Reference** | Derived from entity detail endpoints and aggregate structure |

### Profile (`PRF`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | Display personal or entity profile information with activity context |
| **User Expectations** | View personal info; edit profile; see activity history |
| **Information Characteristics** | Avatar, personal details, role information, recent activity, linked accounts |
| **Interaction Characteristics** | View, edit, upload avatar, manage linked accounts |
| **Typical Workflows** | View profile → Edit details → Save; View linked entities |
| **Expected Blueprint Structure** | Profile Header, Info Cards, Activity Timeline, Related Entities |
| **Engineering Reference** | Derived from Person/Student/Staff entity structure |

### Wizard (`WIZ`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | Guide users through a multi-step process |
| **User Expectations** | Clear progress; ability to go back; validation at each step |
| **Information Characteristics** | Step indicator, form fields per step, progress information |
| **Interaction Characteristics** | Navigate steps; fill forms; validate; submit |
| **Typical Workflows** | Start wizard → Complete steps → Review → Submit |
| **Expected Blueprint Structure** | Step Indicator, Form Content Area, Navigation Buttons, Summary/Review |
| **Engineering Reference** | Derived from multi-step workflows in engineering specs (e.g., admission, enrollment) |

### Analytics (`ANL`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | Analyse data with interactive charts, filters, and drill-down |
| **User Expectations** | Explore data; change filters; drill into details |
| **Information Characteristics** | Charts, pivot tables, date ranges, dimension selectors |
| **Interaction Characteristics** | Filter, drill-down, export, date range selection, dimension switching |
| **Typical Workflows** | Select metric → Apply filters → Drill down → Export |
| **Expected Blueprint Structure** | Filter Panel, Chart Area, Data Table, Export Controls |
| **Engineering Reference** | Derived from Reporting & Analytics domain capabilities |

### Reports (`RPT`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | Generate, configure, and view formatted reports |
| **User Expectations** | Configure report parameters; generate; view; export |
| **Information Characteristics** | Report configuration, generated report, export options |
| **Interaction Characteristics** | Configure parameters, generate, preview, export, schedule |
| **Typical Workflows** | Select report type → Configure → Generate → View → Export |
| **Expected Blueprint Structure** | Report Selector, Configuration Panel, Report Preview, Export Controls |
| **Engineering Reference** | Derived from Reporting & Analytics report definitions |

### Calendar (`CAL`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | Display events, schedules, and date-based information |
| **User Expectations** | See schedule; navigate dates; create/edit events |
| **Information Characteristics** | Calendar grid, event cards, date indicators, time slots |
| **Interaction Characteristics** | Navigate months/weeks/days; create event; view event details |
| **Typical Workflows** | View schedule → Navigate to date → Create or view event |
| **Expected Blueprint Structure** | Calendar Navigation, Date Grid, Event List/Detail Panel |
| **Engineering Reference** | Derived from Academic Calendar and Operations scheduling |

### Communication (`COM`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | Compose, send, and manage messages or notifications |
| **User Expectations** | Compose message; select recipients; track delivery |
| **Information Characteristics** | Message composer, recipient selector, delivery status, templates |
| **Interaction Characteristics** | Compose, select recipients, send, track, template management |
| **Typical Workflows** | Compose → Select recipients → Send → Track delivery |
| **Expected Blueprint Structure** | Composer, Recipient Panel, Template Library, Delivery Status |
| **Engineering Reference** | Derived from Communication domain capabilities |

### Search (`SRC`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | Dedicated search interface for finding entities across the platform |
| **User Expectations** | Fast results; relevant matches; filter within results |
| **Information Characteristics** | Search input, result groups, filters, recent searches |
| **Interaction Characteristics** | Type query, filter results, navigate to result |
| **Typical Workflows** | Type query → Review results → Navigate to entity |
| **Expected Blueprint Structure** | Search Input, Result Groups, Filters, Recent/Saved Searches |
| **Engineering Reference** | Derived from cross-domain search capabilities |

### AI Workspace (`AIW`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | Provide AI-assisted features for data analysis or task completion |
| **User Expectations** | AI suggestions; intelligent automation; natural language interaction |
| **Information Characteristics** | AI chat, suggestions, predictions, automated actions |
| **Interaction Characteristics** | Chat, accept/reject suggestions, configure AI preferences |
| **Typical Workflows** | Ask question → Review suggestion → Accept or modify → Apply |
| **Expected Blueprint Structure** | AI Chat Interface, Suggestion Cards, Action Confirmation, Context Panel |
| **Engineering Reference** | Derived from AI feature requirements in Product Documentation |

### Authentication (`AUTH`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | Authenticate users and manage account access |
| **User Expectations** | Fast, secure login; clear error messages; recovery options |
| **Information Characteristics** | Login form, MFA input, recovery options, branding |
| **Interaction Characteristics** | Enter credentials, complete MFA, recover account |
| **Typical Workflows** | Enter email → Enter password → Complete MFA → Access platform |
| **Expected Blueprint Structure** | Auth Form, Branding Area, Help Links |
| **Engineering Reference** | Derived from Identity & Access authentication flows |

### Settings (`SET`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | Configure system or user preferences |
| **User Expectations** | Clear categories; safe defaults; easy to find specific setting |
| **Information Characteristics** | Setting categories, toggles, inputs, save indicators |
| **Interaction Characteristics** | Navigate categories, modify settings, save, reset |
| **Typical Workflows** | Navigate to category → Modify setting → Save |
| **Expected Blueprint Structure** | Category Navigation, Setting Groups, Save/Reset Actions |
| **Engineering Reference** | Derived from configurable policies in engineering specs |

### Monitoring (`MON`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | Monitor system health, audit logs, or operational metrics |
| **User Expectations** | Real-time data; clear status indicators; drill-down into issues |
| **Information Characteristics** | Status indicators, log entries, metric charts, alert lists |
| **Interaction Characteristics** | Filter logs, drill into alerts, acknowledge issues |
| **Typical Workflows** | Check status → Identify issue → Drill down → Resolve |
| **Expected Blueprint Structure** | Status Dashboard, Log Viewer, Alert Panel, Drill-Down Views |
| **Engineering Reference** | Derived from platform monitoring and audit requirements |

### Administration (`ADM`)

| Aspect | Description |
|--------|-------------|
| **Purpose** | Manage platform or institution configuration and operations |
| **User Expectations** | Complete control; clear impact warnings; audit trail |
| **Information Characteristics** | Configuration forms, impact warnings, audit history |
| **Interaction Characteristics** | Configure, enable/disable, assign, audit |
| **Typical Workflows** | Review configuration → Modify → Confirm impact → Save |
| **Expected Blueprint Structure** | Configuration Panel, Impact Warning, Confirmation, Audit Trail |
| **Engineering Reference** | Derived from Platform Administration and Institution Management specs |

---

# 11. User Intent

---

## 11.1 Purpose

User Intent captures what the user wants to accomplish on this screen. It is the primary design driver — every element on the screen must serve a user intent.

## 11.2 Primary Goal

| Field | Specification |
|-------|--------------|
| **Purpose** | The single most important thing the user wants to accomplish |
| **Format** | Verb + Noun phrase (e.g., "View student attendance") |
| **Rules** | Must be derivable from the engineering spec workflow; must be singular |
| **Anti-patterns** | Multiple primary goals; vague goals ("manage data"); implementation goals ("load the page") |

## 11.3 Secondary Goals

| Field | Specification |
|-------|--------------|
| **Purpose** | Additional things the user may want to accomplish |
| **Format** | List of Verb + Noun phrases |
| **Rules** | Must be derivable from the engineering spec; must be fewer than 5 |
| **Anti-patterns** | Goals that belong on a different screen; goals that contradict the primary goal |

## 11.4 Success Criteria

| Field | Specification |
|-------|--------------|
| **Purpose** | What indicates the user has successfully accomplished their goal |
| **Format** | Observable outcomes |
| **Rules** | Must be measurable or verifiable; must align with the engineering spec success states |
| **Examples** | "User can see today's attendance for their class"; "User can filter students by grade" |

## 11.5 Usage Context

| Field | Specification |
|-------|--------------|
| **Purpose** | When, where, and how often this screen is used |
| **Fields** | Frequency (daily, weekly, on-demand), Time pressure (urgent, routine), Device (desktop, mobile), Environment (office, classroom, on-the-go) |
| **Rules** | Must reflect the workspace catalogue description and engineering spec workflows |

---

# 12. Business Intent

---

## 12.1 Purpose

Business Intent captures why this screen exists from the institution's perspective. It connects the screen to business outcomes.

## 12.2 Business Objective

| Field | Specification |
|-------|--------------|
| **Purpose** | What business outcome this screen supports |
| **Format** | Statement linking screen to institutional value |
| **Rules** | Must derive from the engineering spec's stated business purpose; must be concrete |
| **Examples** | "Enable administrators to track student attendance compliance"; "Allow finance staff to process fee payments efficiently" |

## 12.3 Operational Impact

| Field | Specification |
|-------|--------------|
| **Purpose** | How this screen improves institutional operations |
| **Format** | Statement of operational improvement |
| **Rules** | Must be measurable or observable; must align with product goals |

## 12.4 Compliance Requirements

| Field | Specification |
|-------|--------------|
| **Purpose** | Any regulatory or policy requirements this screen must satisfy |
| **Format** | List of compliance requirements with references |
| **Rules** | If none, explicitly state "None"; do not leave empty |
| **Examples** | "Student data must be displayed in compliance with data protection policy"; "Financial records must maintain audit trail per Finance Engineering §6" |

---

# 13. Information Hierarchy

---

## 13.1 Purpose

Information Hierarchy defines the relative importance of data elements on the screen. It drives layout decisions — the most important information is most prominent.

## 13.2 Tier Definitions

| Tier | Description | Visual Prominence | Examples |
|------|-------------|-------------------|----------|
| **Tier 1 (Primary)** | Information the user needs immediately upon arriving at the screen | Highest — above the fold, largest, most prominent | KPIs, entity name, status, primary metric |
| **Tier 2 (Secondary)** | Information the user needs to complete their primary task | Medium — visible without scrolling, clearly grouped | Filter options, list columns, form fields |
| **Tier 3 (Tertiary)** | Information that provides context or supports secondary tasks | Lower — may require scrolling, placed in sidebars or tabs | Activity history, related entities, metadata, audit trail |

## 13.3 Hierarchy Rules

| Rule | Description |
|------|-------------|
| **Tier 1 must be scannable** | User must understand the screen's key information in under 3 seconds |
| **Tier 2 must be actionable** | User must be able to complete their primary task without leaving the visible area |
| **Tier 3 must be accessible** | User must be able to find additional context with one interaction (scroll, click tab) |
| **Hierarchy must be justified** | Each tier assignment must be explained in terms of user goals |
| **No orphan tiers** | If a tier has no items, state "None" explicitly |

## 13.4 Hierarchy Anti-Patterns

| Anti-Pattern | Why It Conflicts |
|-------------|-----------------|
| All items at Tier 1 | Nothing stands out; cognitive overload |
| Critical data at Tier 3 | Users cannot find essential information |
| Inconsistent hierarchy across similar screens | Users cannot transfer learning between screens |
| Hierarchy based on data model structure | Should be based on user goals, not entity relationships |

---

# 14. Task Hierarchy

---

## 14.1 Purpose

Task Hierarchy defines the actions users perform on this screen, ordered by frequency and importance.

## 14.2 Task Levels

| Level | Description | Frequency | Design Priority |
|-------|-------------|-----------|-----------------|
| **Primary Task** | The most common action performed on this screen | Multiple times per session | Highest — optimise for speed and ease |
| **Secondary Tasks** | Important but less frequent actions | Daily or weekly | High — accessible but not dominant |
| **Tertiary Tasks** | Rare or administrative actions | Monthly or on-demand | Medium — available but not prominent |

## 14.3 Task Rules

| Rule | Description |
|------|-------------|
| **One primary task** | Each screen has exactly one primary task |
| **Tasks trace to workflows** | Every task must be traceable to an engineering spec workflow |
| **Task frequency informs placement** | High-frequency tasks get prime screen real estate |
| **Task importance informs prominence** | Important tasks are more visually prominent regardless of frequency |

## 14.4 Task Anti-Patterns

| Anti-Pattern | Why It Conflicts |
|-------------|-----------------|
| Multiple primary tasks | Users cannot identify the screen's main purpose |
| Tasks not traceable to engineering specs | May represent invented functionality |
| Primary task that is rarely performed | Misleading screen classification |

---

# 15. Navigation Context

---

## 15.1 Purpose

Navigation Context defines how users arrive at this screen and where they can go from it.

## 15.2 Entry Points

| Field | Specification |
|-------|--------------|
| **Purpose** | Every way a user can arrive at this screen |
| **Format** | List of navigation paths with source screen |
| **Rules** | Must include all navigation paths from the sidebar, breadcrumbs, links, and workflow transitions |
| **Reference** | 01 UI Strategy §10 Navigation Philosophy; 02 Design System §2.5 Sidebar Navigation |

## 15.3 Exit Points

| Field | Specification |
|-------|--------------|
| **Purpose** | Every screen the user can navigate to from this screen |
| **Format** | List of navigation paths with destination screen |
| **Rules** | Must include sidebar navigation, in-content links, and action-triggered navigation |

## 15.4 Breadcrumb Path

| Field | Specification |
|-------|--------------|
| **Purpose** | The navigation trail shown in the breadcrumb component |
| **Format** | Slash-separated path (e.g., "Academic > Students > John Doe") |
| **Rules** | Must follow the navigation hierarchy defined in the workspace catalogue |
| **Reference** | 02 Design System §2.6 Breadcrumbs |

## 15.5 Sidebar Position

| Field | Specification |
|-------|--------------|
| **Purpose** | Where this screen sits in the sidebar navigation hierarchy |
| **Format** | Sidebar section and position |
| **Rules** | Must match the workspace catalogue navigation structure |

---

# 16. Workflow Context

---

## 16.1 Purpose

Workflow Context places the screen within a larger business workflow. Most screens are not standalone — they are steps in a process.

## 16.2 Workflow Identification

| Field | Specification |
|-------|--------------|
| **Workflow Name** | The name of the larger workflow |
| **Workflow Source** | The engineering spec section defining the workflow |
| **Screen Position** | The step number or position in the workflow |
| **Relationship** | Entry point, intermediate step, decision point, or exit point |

## 16.3 Workflow Transitions

| Field | Specification |
|-------|--------------|
| **Preceding Screen** | The screen that leads to this one in the workflow |
| **Following Screen** | The screen this one leads to in the workflow |
| **Parallel Screens** | Screens that can be accessed concurrently |
| **Conditional Transitions** | Screens reached only under specific conditions |

## 16.4 Workflow Rules

| Rule | Description |
|------|-------------|
| **Workflows derive from engineering specs** | Do not invent workflows not defined in engineering specifications |
| **Transition conditions must be explicit** | Document what triggers each transition |
| **Error paths must be documented** | What happens when a workflow step fails |

---

# 17. Pattern Assignment

---

## 17.1 Purpose

Pattern Assignment selects the approved UI pattern that will be used to implement this screen's layout.

## 17.2 Available Patterns

The following patterns are defined in the Figma Build Roadmap Phase 5 and referenced in 02 Design System §3.7:

| Pattern | Source Reference | Description |
|---------|-----------------|-------------|
| **Dashboard** | Figma Build Roadmap §6.2 Step 1 | KPI cards, charts, activity feed |
| **CRUD List** | Figma Build Roadmap §6.2 Step 2 | Data table, filters, pagination, bulk actions |
| **Detail View** | Figma Build Roadmap §6.2 Step 3 | Header, content, sidebar |
| **Wizard** | Figma Build Roadmap §6.2 Step 4 | Step indicator, form, navigation |
| **Settings** | Figma Build Roadmap §6.2 Step 5 | Tabs, form layout, save actions |
| **Analytics** | Figma Build Roadmap §6.2 Step 6 | Charts, filters, data table |
| **Calendar** | Figma Build Roadmap §6.2 Step 7 | Date grid, event list, creation |
| **Profile** | Figma Build Roadmap §6.2 Step 8 | Avatar, info cards, activity |
| **Report** | Figma Build Roadmap §6.2 Step 9 | Configuration, preview, export |
| **Workspace Landing** | Figma Build Roadmap §6.2 Step 10 | Quick access, recent items, overview |
| **Empty State** | Figma Build Roadmap §6.2 Step 11 | Icon, message, call-to-action |
| **Error Page** | Figma Build Roadmap §6.2 Step 12 | Error icon, message, recovery action |

## 17.3 Pattern Selection Rules

| Rule | Description |
|------|-------------|
| **Select from approved list** | Must select one of the patterns listed above |
| **One primary pattern** | Each screen has exactly one primary pattern |
| **No invented patterns** | If no pattern fits, flag the gap for Pattern Library development |
| **Rationale required** | Must explain why this pattern was selected over alternatives |
| **Alternatives considered** | Must list at least one other pattern evaluated |

## 17.4 Pattern Anti-Patterns

| Anti-Pattern | Why It Conflicts |
|-------------|-----------------|
| Inventing a new pattern | Violates the approved pattern constraint |
| Selecting pattern without rationale | Makes review impossible |
| Multiple primary patterns | Conflicting layout compositions |
| Pattern mismatch with classification | Dashboard pattern on a CRUD screen |

---

# 18. Screen States

---

## 18.1 Purpose

Screen States define every state the screen must handle. States derive from engineering spec error handling, data availability, and permission models.

## 18.2 Required States

| State | Description | When It Occurs | Source Reference |
|-------|-------------|---------------|-----------------|
| **Populated** | Normal state with data loaded | Data successfully fetched | Engineering spec API response |
| **Loading** | Data is being fetched | Initial load, filter change, refresh | 01 UI Strategy §18 Motion Philosophy |
| **Empty** | No data available | No entities match filters or no entities exist | Engineering spec empty state handling |
| **Error** | Something went wrong | API failure, network error, server error | Engineering spec error handling |
| **Partial** | Some data loaded, some failed | Dependent data sources with mixed results | Engineering spec error handling |
| **Permitted** | User lacks permission for some content | Role-based access restrictions | IAM spec permission model |

## 18.3 State Rules

| Rule | Description |
|------|-------------|
| **All required states must be documented** | Each state must describe what the user sees and can do |
| **States derive from engineering specs** | Do not invent states not supported by the API or business rules |
| **State transitions must be explicit** | Document what causes each state transition |
| **Each state must have a recovery path** | Users must be able to move from any error/loading state to the populated state |

## 18.4 State Descriptions

For each state, the blueprint MUST describe:
1. **What the user sees** — content, messaging, visual treatment
2. **What the user can do** — available actions in this state
3. **What triggers the state** — API response, permission check, data availability
4. **How to recover** — what the user can do to return to the populated state

---

# 19. Required Data

---

## 19.1 Purpose

Required Data defines every data element that MUST appear on this screen. These are non-negotiable — removing any required element would prevent the user from accomplishing their primary goal.

## 19.2 Data Element Specification

For each required data element:

| Field | Specification |
|-------|--------------|
| **Data Element** | Human-readable name of the data element |
| **Source Entity** | The engineering spec entity this data comes from |
| **Source Field** | The specific field or property on the entity |
| **Display Priority** | Tier 1, 2, or 3 (from §13) |
| **Tier Justification** | Why this element is at this tier |
| **Format** | How the data is displayed (text, number, date, status badge, avatar, etc.) |
| **Conditional Display** | Whether the element is always shown or only under specific conditions |

## 19.3 Data Element Rules

| Rule | Description |
|------|-------------|
| **Every required element must trace to an entity field** | Do not invent data elements not defined in the engineering spec |
| **Format must be specified** | Vague formats like "displayed" are insufficient |
| **Conditional display must be explicit** | If the element is sometimes hidden, document the condition |
| **Entities and fields must be valid** | Must reference entities and fields that exist in the approved engineering spec |

## 19.4 Data Element Anti-Patterns

| Anti-Pattern | Why It Conflicts |
|-------------|-----------------|
| Data elements without source entities | May represent invented data |
| All elements at Tier 1 | No hierarchy; cognitive overload |
| Missing format specification | Ambiguity for designers |
| Data elements that belong on a different screen | Wrong screen boundary |

---

# 20. Optional Data

---

## 20.1 Purpose

Optional Data defines data elements that MAY appear on this screen based on context, configuration, or user role.

## 20.2 Optional Data Specification

For each optional data element:

| Field | Specification |
|-------|--------------|
| **Data Element** | Human-readable name |
| **Source Entity** | Engineering spec entity |
| **Source Field** | Specific field or property |
| **Condition** | The condition under which this element appears |
| **Tier** | 1, 2, or 3 |
| **Format** | Display format |

## 20.3 Condition Types

| Condition Type | Examples |
|---------------|----------|
| **Role-based** | Visible only to administrators; visible only to teachers |
| **Data-dependent** | Visible only when the entity has related records |
| **Configuration-based** | Visible only when the feature is enabled for the institution |
| **State-dependent** | Visible only when the entity is in a specific status |
| **Platform-dependent** | Visible only on mobile; visible only on desktop |

---

# 21. Actions

---

## 21.1 Purpose

Actions define every operation the user can perform on this screen. Actions derive from the engineering spec's API endpoints and business workflows.

## 21.2 Action Specification

For each action:

| Field | Specification |
|-------|--------------|
| **Action Name** | Verb + Noun (e.g., "Create Student", "Export Report") |
| **Trigger** | How the user initiates the action (button, row action, keyboard shortcut) |
| **Scope** | Single entity, selected entities, or all entities |
| **Permission** | Required permission string from the IAM spec |
| **Confirmation Required** | Whether a confirmation dialog is needed before execution |
| **Feedback** | How the user knows the action succeeded or failed |
| **Source Endpoint** | The API endpoint this action calls (from the engineering spec) |

## 21.3 Action Rules

| Rule | Description |
|------|-------------|
| **Actions trace to API endpoints** | Every action must map to an endpoint in the engineering spec |
| **Destructive actions require confirmation** | Delete, deactivate, and similar actions must have confirmation |
| **Permissions must be specified** | Every action must have a permission reference from the IAM spec |
| **Feedback must be defined** | User must know whether the action succeeded or failed |
| **Bulk actions must specify scope** | Whether the action applies to selected entities or all filtered entities |

## 21.4 Action Anti-Patterns

| Anti-Pattern | Why It Conflicts |
|-------------|-----------------|
| Actions without API endpoints | May represent invented functionality |
| Destructive actions without confirmation | Risk of accidental data loss |
| Actions without permissions | Security gap |
| Actions that belong on a different screen | Wrong screen boundary |

---

# 22. Permissions

---

## 22.1 Purpose

Permissions define who can access this screen and what they can see and do.

## 22.2 Permission Specification

| Field | Specification |
|-------|--------------|
| **Required Role** | Minimum role to access this screen |
| **Required Permission** | Specific permission string from IAM spec (e.g., `people:student:read`) |
| **Permission Behaviour** | What happens when the permission is absent (hidden, disabled, error page) |
| **Role Variations** | How different roles see different content or actions on this screen |

## 22.3 Permission Rules

| Rule | Description |
|------|-------------|
| **Permissions derive from IAM spec** | Use the permission format `{domain}:{resource}:{action}` |
| **Default deny** | If no permission is specified, access is denied |
| **Visible vs accessible** | Some screens are visible but with restricted content; document this explicitly |
| **Role variations must be explicit** | If different roles see different content, describe each variation |

## 22.4 Permission Reference Format

| Element | Format | Example |
|---------|--------|---------|
| **Permission string** | `{domain}:{resource}:{action}` | `people:student:read` |
| **Engineering spec reference** | `IAM Engineering §[section]` | `IAM Engineering §5.1` |

---

# 23. Dependencies

---

## 23.1 Purpose

Dependencies define what this screen requires from other screens, domains, or services.

## 23.2 Dependency Types

| Type | Description | Example |
|------|-------------|---------|
| **Upstream Screens** | Screens that must be visited before this one | Student List → Student Detail |
| **Downstream Screens** | Screens that this one leads to | Student Detail → Edit Student |
| **Data Dependencies** | Data from other domains required by this screen | Attendance screen needs People domain data |
| **Service Dependencies** | APIs or services required | Depends on File Storage service for document display |

## 23.3 Dependency Rules

| Rule | Description |
|------|-------------|
| **Dependencies derive from engineering specs** | Cross-domain dependencies are defined in the engineering spec integration sections |
| **Dependency failures must be documented** | What happens when a dependency is unavailable |
| **Circular dependencies are prohibited** | If screen A depends on screen B, screen B must not depend on screen A |

---

# 24. Integrations

---

## 24.1 Purpose

Integrations define cross-domain events and external services that this screen consumes or produces.

## 24.2 Integration Specification

| Field | Specification |
|-------|--------------|
| **Cross-Domain Events Consumed** | Events from other domains that populate data on this screen |
| **Cross-Domain Events Produced** | Events this screen's actions generate for other domains |
| **External Services** | Third-party services accessed from this screen |
| **Real-Time Requirements** | WebSocket connections or polling intervals |

## 24.3 Integration Rules

| Rule | Description |
|------|-------------|
| **Events derive from the Platform Event Catalogue** | Reference event names and catalogue sections |
| **Real-time requirements must be justified** | Explain why real-time updates are needed |
| **External service failures must be documented** | What happens when an external service is unavailable |

---

# 25. Accessibility Requirements

---

## 25.1 Purpose

Accessibility Requirements define how this screen must be accessible to users with disabilities.

## 25.2 Requirements

| Requirement | Specification |
|-------------|--------------|
| **Keyboard Navigation** | Tab order, shortcuts, focus trapping in modals |
| **Screen Reader** | ARIA labels, live regions for dynamic content, heading hierarchy |
| **Focus Management** | Where focus moves after actions, returns, and state changes |
| **Colour Independence** | No information conveyed solely through colour |
| **Text Alternatives** | Alt text for images, labels for form inputs |
| **Error Identification** | Errors identified by more than just colour |
| **Target Size** | Minimum 44px touch targets per 01 UI Strategy §20 |

## 25.3 Accessibility Rules

| Rule | Description |
|------|-------------|
| **WCAG 2.1 AA compliance** | All screens must meet WCAG 2.1 AA standards |
| **Reference 01 UI Strategy §20** | Accessibility Philosophy provides the governing principles |
| **Reference 02 Design System §5.2** | Accessibility Standards provide implementation guidance |

---

# 26. Responsive Requirements

---

## 26.1 Purpose

Responsive Requirements define how the screen adapts across breakpoints.

## 26.2 Breakpoint Behaviour

| Breakpoint | Width | Expected Behaviour |
|-----------|-------|-------------------|
| **Mobile** | < 640px | Single column; stacked elements; bottom tab bar |
| **Tablet** | 640-1024px | Two columns; collapsed sidebar; 8-column grid |
| **Desktop** | 1024-1440px | Full layout; expanded sidebar; 12-column grid |
| **Wide** | > 1440px | Full layout; expanded sidebar; 12-column grid; increased density |

## 26.3 Content Priority

| Field | Specification |
|-------|--------------|
| **Mobile Priority** | What content is shown on mobile (must include Tier 1) |
| **Tablet Priority** | What content is shown on tablet (must include Tier 1 + Tier 2) |
| **Desktop Priority** | All content shown on desktop |
| **Hidden Elements** | What is hidden at each breakpoint and why |

## 26.4 Responsive Rules

| Rule | Description |
|------|-------------|
| **Reference 01 UI Strategy §21** | Responsive Design Philosophy governs responsive behaviour |
| **Reference 02 Design System §5.3** | Responsive Standards provide breakpoint specifications |
| **Content priority must be justified** | Explain why certain content is hidden at smaller breakpoints |

---

# 27. AI Features

---

## 27.1 Purpose

AI Features define whether this screen includes AI-assisted functionality.

## 27.2 AI Feature Specification

| Field | Specification |
|-------|--------------|
| **AI Assistance Available** | Yes / No |
| **AI Feature Description** | What the AI does on this screen |
| **AI Data Requirements** | What data the AI needs to function |
| **AI Interaction Model** | How the user interacts with the AI (chat, suggestions, automation) |
| **AI Confidence Display** | How confidence levels are communicated |
| **AI Override** | How users can override or reject AI suggestions |

## 27.3 AI Rules

| Rule | Description |
|------|-------------|
| **AI features must be justified** | Explain the value AI adds to this screen |
| **AI must be optional** | Users must be able to accomplish all tasks without AI |
| **AI must not replace user judgment** | AI provides suggestions; users make decisions |
| **Reference 01 UI Strategy §23** | AI-Assisted User Experience governs AI interaction |

---

# 28. Analytics Requirements

---

## 28.1 Purpose

Analytics Requirements define what user interactions are tracked on this screen.

## 28.2 Tracking Specification

| Field | Specification |
|-------|--------------|
| **Tracked Events** | User interactions to track (click, filter, search, export) |
| **Metrics** | Key metrics to measure (task completion time, error rate) |
| **Success Indicators** | What indicates the screen is working well |

## 28.3 Analytics Rules

| Rule | Description |
|------|-------------|
| **Analytics must align with product goals** | Track events that inform product decisions |
| **Privacy compliance** | Analytics must comply with data protection requirements |
| **Minimal tracking** | Track only what is needed; avoid excessive tracking |

---

# 29. Validation Rules

---

## 29.1 Blueprint Validation

Every blueprint MUST pass these validation rules before it can be approved:

| # | Rule | Type | Description |
|---|------|------|-------------|
| V01 | Blueprint ID format | Format | Must match `SB-[MODULE]-[CLASS]-[SEQ]` format |
| V02 | Blueprint ID uniqueness | Uniqueness | Must be globally unique |
| V03 | Screen Name matches catalogue | Reference | Must match the workspace catalogue screen name |
| V04 | Classification is approved value | Enumeration | Must be one of the codes in §10.1 |
| V05 | Module is approved value | Reference | Must be one of the 10 domain modules |
| V06 | Workspace is approved value | Reference | Must exist in the workspace catalogue |
| V07 | Engineering spec reference valid | Reference | Must reference an existing document and section |
| V08 | Purpose is non-empty | Completeness | Must not be empty |
| V09 | Primary persona specified | Completeness | Must specify at least one persona |
| V10 | Primary goal specified | Completeness | Must specify exactly one primary goal |
| V11 | Information hierarchy has all tiers | Completeness | Must specify Tier 1, Tier 2, and Tier 3 (or "None") |
| V12 | Task hierarchy has primary task | Completeness | Must specify exactly one primary task |
| V13 | Navigation entry points listed | Completeness | Must list at least one entry point |
| V14 | Pattern is approved value | Reference | Must select from the approved pattern list in §17.2 |
| V15 | Pattern rationale provided | Completeness | Must explain pattern selection |
| V16 | All required states documented | Completeness | Must document all 6 required states from §18.2 |
| V17 | Required data has source references | Reference | Every required data element must reference a source entity and field |
| V18 | Actions have permission references | Reference | Every action must have a permission string |
| V19 | Permission string format valid | Format | Must match `{domain}:{resource}:{action}` format |
| V20 | No duplicate blueprint IDs | Uniqueness | Must not duplicate an existing blueprint |
| V21 | Version follows format | Format | Must match `Major.Minor` format |
| V22 | Outstanding decisions documented | Completeness | Must document all outstanding design decisions |
| V23 | Cross-references are valid | Reference | All referenced documents and sections must exist |
| V24 | Terminology matches Constitution | Compliance | Must use terminology from Documentation Constitution §17 |

## 29.2 Validation Process

| Step | Action |
|------|--------|
| 1 | Author completes all mandatory fields |
| 2 | Author runs self-validation against §29.1 rules |
| 3 | Author records validation results |
| 4 | Reviewer validates independently |
| 5 | All V-rules must pass for approval |

---

# 30. Anti-Patterns

---

## 30.1 Blueprint Anti-Patterns

| Anti-Pattern | Description | Why It Conflicts |
|-------------|-------------|-----------------|
| **Visual prescription** | Blueprint specifies colours, fonts, or pixel dimensions | Visual implementation belongs to UI Rendering Specification |
| **Business rule invention** | Blueprint defines business logic not in the engineering spec | Violates derivation principle |
| **Missing source reference** | Blueprint contains data or actions without source references | Cannot be validated; may represent invented content |
| **Multi-screen blueprint** | Blueprint covers multiple screens | Each screen must have its own blueprint |
| **Implementation blueprint** | Blueprint describes code structure, API calls, or database queries | Implementation details belong in code, not blueprints |
| **Pattern invention** | Blueprint selects a pattern not in the approved list | Must flag gap rather than invent |
| **Incomplete hierarchy** | Information or task hierarchy is missing tiers | Must explicitly state "None" for empty tiers |
| **Vague descriptions** | Fields contain "TBD", "TBD", or "varies" | Must be completed or explicitly marked as not applicable with justification |

---

# 31. Compliance Checklist

---

## 31.1 Blueprint Compliance

| # | Check | Category |
|---|-------|----------|
| C01 | Blueprint ID follows format and is unique | Metadata |
| C02 | Screen name matches workspace catalogue | Metadata |
| C03 | Classification is from approved list | Metadata |
| C04 | Module matches an approved engineering spec | Metadata |
| C05 | Workspace exists in the catalogue | Metadata |
| C06 | Engineering spec reference is valid | Traceability |
| C07 | Purpose is clear and justified | Intent |
| C08 | Primary persona is from the approved persona list | Audience |
| C09 | Primary goal is singular and specific | Intent |
| C10 | Information hierarchy has all tiers with justification | Hierarchy |
| C11 | Task hierarchy has exactly one primary task | Tasks |
| C12 | Navigation entry and exit points are complete | Navigation |
| C13 | Workflow context is documented | Workflow |
| C14 | Pattern is from approved list with rationale | Pattern |
| C15 | All 6 screen states are documented | States |
| C16 | Required data elements trace to source entities | Data |
| C17 | Optional data has explicit conditions | Data |
| C18 | All actions trace to API endpoints | Actions |
| C19 | All actions have permission references | Permissions |
| C20 | Permission strings follow IAM format | Permissions |
| C21 | Dependencies are documented | Dependencies |
| C22 | Cross-domain events reference the Event Catalogue | Integrations |
| C23 | Accessibility requirements are complete | Accessibility |
| C24 | Responsive requirements cover all breakpoints | Responsive |
| C25 | AI features are documented (even if "None") | AI |
| C26 | Analytics requirements are documented | Analytics |
| C27 | Outstanding design decisions are documented | Governance |
| C28 | All cross-references are valid | Compliance |
| C29 | Terminology matches Documentation Constitution | Compliance |
| C30 | No visual implementation details included | Scope |

---

# 32. Governance

---

## 32.1 Authorship

| Role | Responsibility |
|------|---------------|
| **Blueprint Author** | Writes the blueprint following this specification |
| **Domain SME** | Validates business intent and workflow context |
| **UI/UX Lead** | Validates pattern assignment and information hierarchy |
| **Solution Architect** | Approves the blueprint |

## 32.2 Review Process

| Step | Action | Reviewer |
|------|--------|---------|
| 1 | Author completes self-validation (§29.2) | Author |
| 2 | Domain SME reviews business intent and workflow | Domain SME |
| 3 | UI/UX Lead reviews pattern and hierarchy | UI/UX Lead |
| 4 | Solution Architect reviews completeness and compliance | Solution Architect |
| 5 | Blueprint status updated to Approved | Solution Architect |

## 32.3 Change Control

| Change Type | Process |
|-------------|---------|
| **Content update** (data elements, actions, states) | Author updates; re-validates; minor version increment |
| **Structural change** (classification, pattern, purpose) | Requires full re-review; major version increment |
| **Blueprint deprecation** | Requires Solution Architect approval; archive with reason |

## 32.4 Storage

| Rule | Description |
|------|-------------|
| **Location** | Screen blueprints are stored in `ui-ux/screen-blueprints/` directory |
| **Naming** | `[Blueprint-ID] [Screen Name].md` (e.g., `SB-PEOPLE-CRUD-001 Student List.md`) |
| **Versioning** | Tracked via document version field and revision history |

---

# 33. Versioning

---

## 33.1 Version Format

| Format | Example | Usage |
|--------|---------|-------|
| `Major.Minor` | `1.0` | Standard versioning |
| `Major.Minor.Patch` | `1.0.1` | Typo or formatting correction |

## 33.2 Version Change Rules

| Change Type | When to Use |
|-------------|-------------|
| **Major** (1.0 → 2.0) | Classification change, pattern change, purpose change, primary goal change |
| **Minor** (1.0 → 1.1) | Data element added/removed, action added/removed, state updated, permission changed |
| **Patch** (1.0.0 → 1.0.1) | Typo fix, formatting correction, cross-reference update |

---

# 34. Maintenance Process

---

## 34.1 Triggers

| Trigger | Action |
|---------|--------|
| **Engineering spec updated** | Review blueprint for impact; update affected fields |
| **New entity or field added** | Add to required or optional data table |
| **API endpoint added or removed** | Update actions table |
| **Permission changed** | Update permissions section |
| **New pattern approved** | Consider re-evaluating pattern assignment |
| **User feedback** | Update user intent and hierarchy if needed |

## 34.2 Impact Assessment

| Check | Description |
|-------|-------------|
| **Data impact** | Do new entities or fields affect this screen? |
| **Action impact** | Do new or changed API endpoints affect this screen? |
| **Permission impact** | Do permission changes affect this screen? |
| **Workflow impact** | Do workflow changes affect this screen's position? |
| **Pattern impact** | Does the pattern still fit the screen's purpose? |

---

# 35. Example Blueprints

---

## 35.1 Example: Student List (CRUD Workspace)

```markdown
# Student List — Screen Blueprint

## Metadata
- Blueprint ID: SB-PEOPLE-CRUD-001
- Screen Name: Student List
- Screen Classification: CRUD Workspace
- Module: People
- Workspace: Institution Administrator
- Platform: Web
- Engineering Spec Reference: People Engineering Specification §5.1, §10
- Workspace Catalogue Reference: Institution Administrator Workspace §6
- Status: Authoring
- Version: 1.0
- Author: Architecture Team
- Date Created: 2026-07-23
- Last Updated: 2026-07-23

## Purpose
- Why This Screen Exists: Allow administrators to view, search, and manage all students in the institution
- Problem It Solves: Provides a centralised view of the student body for administrative operations
- User Value: Enables efficient student management, bulk operations, and quick access to student details

## Users
- Primary Persona: Administrator
- Secondary Personas: Teacher (limited view)
- Usage Context: Multiple times daily; office or mobile; time-sensitive during admissions

## User Intent
- Primary Goal: Find and access a specific student's information
- Secondary Goals: Create new student, bulk update student status, export student data
- Success Criteria: User can locate any student in under 10 seconds using search or filters

## Business Intent
- Business Objective: Maintain accurate, up-to-date student records
- Operational Impact: Reduces time spent on student information lookups by 60%
- Compliance Requirements: Student data display must comply with data protection policy

## Information Hierarchy
- Tier 1 (Primary): Student name, public ID (STU-YYYY-NNNNNN), status, class/arm, guardian name
- Tier 2 (Secondary): Admission date, age, gender, contact information, enrollment status
- Tier 3 (Tertiary): Emergency contacts, medical notes, documents, audit history
- Justification: Administrators need to identify students quickly (Tier 1), verify details for operations (Tier 2), and access full records when needed (Tier 3)

## Task Hierarchy
- Primary Task: Search for and locate a specific student
- Secondary Tasks: Create new student, edit student details, bulk select and export
- Tertiary Tasks: View student audit history, restore soft-deleted students
- Task Frequency: Search = multiple times per hour; Create = daily; Bulk export = weekly

## Navigation Context
- Entry Points: Sidebar > People > Students; Command palette search; Dashboard quick action
- Exit Points: Student Detail (click row), Create Student (add button), Dashboard (breadcrumb)
- Breadcrumb Path: People > Students
- Sidebar Position: People > Students

## Workflow Context
- Workflow Name: Student Lifecycle
- Workflow Position: List view — entry point for all student operations
- Preceding Screen: Dashboard, any screen with student link
- Following Screen: Student Detail, Create Student
- Parallel Screens: Student Profile, Attendance List

## Pattern Assignment
- Primary Pattern: CRUD List
- Pattern Rationale: Screen needs to display a filterable, sortable list of entities with bulk actions
- Pattern Alternatives Considered: Dashboard (no KPIs needed), Card Grid (tabular data more appropriate)
- Pattern Library Reference: Figma Build Roadmap §6.2 Step 2

## Screen States
- Populated: Student list displayed with filters applied
- Loading: Spinner with skeleton table rows
- Empty: "No students found" message with Create Student CTA
- Error: "Unable to load students" with retry button
- Partial: Table loaded but avatar images loading
- Permitted: Some columns hidden based on role permissions

## Required Data
| Data Element | Source Entity | Source Field | Display Priority | Tier | Format |
|-------------|---------------|--------------|-----------------|------|--------|
| Student Name | Student → Person | first_name + last_name | Required | 1 | Text with avatar |
| Public ID | Student | public_id | Required | 1 | Monospace text (STU-YYYY-NNNNNN) |
| Status | Student | status | Required | 1 | Status badge (Active/Inactive) |
| Class/Arm | StudentClassEnrollment → Class → Arm | class.name + arm.name | Required | 1 | Text |
| Guardian Name | PersonRelationship → Person | first_name + last_name | Required | 1 | Text |
| Admission Date | Student | admission_date | Required | 2 | Date (DD MMM YYYY) |
| Age | Person | date_of_birth | Required | 2 | Calculated (years) |
| Gender | Person | gender | Required | 2 | Text |
| Contact Email | Person | email | Required | 2 | Email |
| Contact Phone | Person | phone | Required | 2 | Phone |
| Enrollment Status | StudentClassEnrollment | status | Required | 2 | Badge |

## Optional Data
| Data Element | Source Entity | Source Field | Condition | Tier | Format |
|-------------|---------------|--------------|-----------|------|--------|
| Profile Photo | Person | avatar_url | When uploaded | 1 | Avatar |
| Medical Conditions | Student | medical_conditions | When present and user has permission | 3 | Text |
| Fee Balance | Invoice (Finance) | outstanding_balance | When Finance module enabled | 2 | Currency |
| Attendance Rate | AttendanceRecord | Calculated percentage | When Attendance module enabled | 2 | Percentage badge |

## Actions
| Action | Trigger | Scope | Permission | Confirmation | Feedback |
|--------|---------|-------|------------|-------------|----------|
| Search students | Search input | All | people:student:read | No | Results update live |
| Filter students | Filter bar | All | people:student:read | No | Results update live |
| Sort students | Column header | All | people:student:read | No | Results re-sort |
| View student detail | Row click | Single | people:student:read | No | Navigate to detail |
| Create student | Add button | N/A | people:student:create | No | Navigate to wizard |
| Bulk select | Checkbox | Multiple | people:student:read | No | Selection bar appears |
| Bulk export | Export button | Selected/All | people:student:read | No | Download file |
| Bulk status change | Status action | Selected | people:student:update | Yes | Confirmation dialog |

## Permissions
- Required Role: Institution Staff with people:student:read permission
- Required Permission: people:student:read
- Permission Behaviour: Screen is hidden from navigation if permission absent
- Role Variations:
  - Administrator: Full access (all columns, all actions)
  - Teacher: Read-only; limited columns (no financial data, no medical data)
  - Finance Staff: Read-only; includes financial columns

## Dependencies
- Upcoming Screens: Dashboard (quick action), any screen linking to student
- Downcoming Screens: Student Detail, Create Student, Edit Student
- Data Dependencies: People domain (Student, Person, PersonRelationship); Academic domain (Class, Arm); Finance domain (Invoice — optional)
- Service Dependencies: People API, Academic API, Finance API (optional)

## Integrations
- Cross-Domain Events Consumed: StudentCreated, StudentUpdated, StudentStatusChanged
- Cross-Domain Events Produced: None (read-only screen)
- External Services: None
- Real-Time Data: None (manual refresh)

## Accessibility Requirements
- Keyboard Navigation: Tab through search, filters, table rows; Enter to open detail; Space to select row
- Screen Reader: Table with proper th/td markup; status announced as "Active" or "Inactive"; student name announced with public ID
- Focus Management: Focus moves to search on load; focus returns to table after filter change
- Colour Independence: Status indicated by badge text, not colour alone

## Responsive Requirements
- Mobile: Card-based list instead of table; search at top; filters in bottom sheet
- Tablet: Condensed table with fewer columns; collapsed sidebar
- Desktop: Full table with all columns; expanded sidebar
- Content Priority: Mobile shows Tier 1 only; Tablet shows Tier 1 + 2; Desktop shows all

## AI Features
- AI Assistance: No
- AI Data Requirements: N/A
- AI Interaction Model: N/A

## Analytics Requirements
- Tracked Events: search_performed, filter_applied, sort_applied, student_clicked, create_initiated, export_performed
- Metrics: average_search_time, list_scroll_depth, filter_usage_rate
- Success Indicators: Low search time, high filter usage, low empty state rate

## Outstanding Design Decisions
| Decision | Context | Options | Recommendation | Status |
|----------|---------|---------|----------------|--------|
| Should student financial data be shown in the list? | Finance integration | Show balance in list vs. only in detail | Show in detail only (privacy) | Pending |
| Should soft-deleted students appear in the list? | Data recovery | Include with filter vs. hidden by default | Include with "Show deleted" filter | Pending |
```

## 35.2 Example: Fee Payment (Wizard)

```markdown
# Fee Payment — Screen Blueprint

## Metadata
- Blueprint ID: SB-FIN-WIZ-001
- Screen Name: Fee Payment
- Screen Classification: Wizard
- Module: Finance
- Workspace: Institution Administrator, Finance Staff
- Platform: Web
- Engineering Spec Reference: Finance Engineering Specification §5, §10
- Workspace Catalogue Reference: Institution Administrator Workspace §8; Finance Staff Workspace §4
- Status: Authoring
- Version: 1.0
- Author: Architecture Team
- Date Created: 2026-07-23
- Last Updated: 2026-07-23

## Purpose
- Why This Screen Exists: Guide finance staff through processing a fee payment for a student
- Problem It Solves: Ensures payments are correctly allocated to invoices with proper audit trail
- User Value: Reduces payment processing errors; ensures financial accuracy

## Users
- Primary Persona: Administrator (Finance Staff)
- Secondary Personas: Parent (self-service payment)
- Usage Context: Multiple times daily during payment collection; office environment

## User Intent
- Primary Goal: Process a payment against a student's outstanding invoice(s)
- Secondary Goals: Apply discount, apply scholarship, generate receipt
- Success Criteria: Payment is recorded, allocated to correct invoices, receipt generated

## Business Intent
- Business Objective: Accurately record and allocate student fee payments
- Operational Impact: Reduces payment processing time; eliminates allocation errors
- Compliance Requirements: Financial records must maintain audit trail per Finance Engineering §6

## Information Hierarchy
- Tier 1 (Primary): Student name, outstanding invoices, payment amount, payment method
- Tier 2 (Secondary): Invoice line items, discount eligibility, scholarship application
- Tier 3 (Tertiary): Payment history, audit trail, receipt preview
- Justification: Finance staff need to verify student identity and outstanding balance (Tier 1), review invoices being paid (Tier 2), and have access to history for reconciliation (Tier 3)

## Task Hierarchy
- Primary Task: Select student, select invoices, process payment
- Secondary Tasks: Apply discount, apply scholarship, generate receipt
- Tertiary Tasks: View payment history, reverse payment (admin only)
- Task Frequency: Primary task = multiple times per hour

## Navigation Context
- Entry Points: Finance > Payments > Make Payment; Student Detail > Pay Fees; Bulk Payment
- Exit Points: Payment Confirmation, Payment List, Student Detail
- Breadcrumb Path: Finance > Payments > Make Payment
- Sidebar Position: Finance > Payments

## Workflow Context
- Workflow Name: Fee Payment Processing
- Workflow Position: Step 1 of 3 (Select → Pay → Confirm)
- Preceding Screen: Payment List or Student Detail
- Following Screen: Payment Confirmation
- Parallel Screens: Bulk Payment, Payment Reconciliation

## Pattern Assignment
- Primary Pattern: Wizard
- Pattern Rationale: Payment is a multi-step process requiring sequential data entry with validation
- Pattern Alternatives Considered: CRUD List (not a list operation), Detail View (not a single entity view)
- Pattern Library Reference: Figma Build Roadmap §6.2 Step 4

## Screen States
- Populated: Step 1 — Student selected; outstanding invoices displayed
- Loading: Searching for student; loading invoices
- Empty: No outstanding invoices for selected student
- Error: Payment processing failed; gateway error
- Partial: Student found but no invoices loaded
- Permitted: Finance staff can process; administrators can reverse

## Required Data
| Data Element | Source Entity | Source Field | Display Priority | Tier | Format |
|-------------|---------------|--------------|-----------------|------|--------|
| Student Name | Student → Person | first_name + last_name | Required | 1 | Text |
| Student Public ID | Student | public_id | Required | 1 | Monospace |
| Outstanding Invoices | Invoice | Filtered by student, status = PUBLISHED/PARTIALLY_PAID | Required | 1 | Table |
| Invoice Number | Invoice | invoice_number | Required | 1 | Monospace |
| Invoice Amount | Invoice | total_amount | Required | 1 | Currency |
| Outstanding Balance | Invoice | outstanding_balance | Required | 1 | Currency |
| Payment Amount | User Input | N/A | Required | 1 | Currency input |
| Payment Method | User Selection | N/A | Required | 1 | Select (Cash, Bank Transfer, POS, Online) |

## Optional Data
| Data Element | Source Entity | Source Field | Condition | Tier | Format |
|-------------|---------------|--------------|-----------|------|--------|
| Discount Eligibility | Discount | Discount rules | When student qualifies | 2 | Badge + apply button |
| Scholarship Balance | Scholarship | remaining_amount | When scholarship active | 2 | Currency |
| Payment History | Payment | Filtered by student | When "View History" clicked | 3 | Table |

## Actions
| Action | Trigger | Scope | Permission | Confirmation | Feedback |
|--------|---------|-------|------------|-------------|----------|
| Search student | Search input | N/A | finance:payment:create | No | Student found |
| Select invoices | Checkbox | Multiple | finance:payment:create | No | Total updates |
| Enter payment amount | Input field | Single | finance:payment:create | No | Validation |
| Select payment method | Dropdown | Single | finance:payment:create | No | Method selected |
| Apply discount | Button | Single | finance:payment:create | No | Discount applied |
| Process payment | Submit button | Single | finance:payment:create | Yes | Confirmation dialog |
| Generate receipt | Button | Single | finance:payment:read | No | Receipt downloaded |

## Permissions
- Required Role: Finance Staff or Administrator
- Required Permission: finance:payment:create
- Permission Behaviour: Screen hidden from navigation without permission
- Role Variations:
  - Finance Staff: Can process payments
  - Administrator: Can process and reverse payments

## Dependencies
- Upcoming Screens: Payment List, Student Detail
- Downcoming Screens: Payment Confirmation, Receipt View
- Data Dependencies: Finance domain (Invoice, Payment, Discount, Scholarship); People domain (Student, Person)
- Service Dependencies: Payment Gateway (for online payments)

## Integrations
- Cross-Domain Events Consumed: InvoiceGenerated, ScholarshipApplied
- Cross-Domain Events Produced: PaymentProcessed, InvoiceUpdated
- External Services: Payment Gateway (Paystack, Flutterwave, Stripe)
- Real-Time Data: None (transaction-based)

## Accessibility Requirements
- Keyboard Navigation: Tab through form fields; Enter to submit; Escape to cancel
- Screen Reader: Step indicator announced; form fields labelled; validation errors announced
- Focus Management: Focus moves to student search on load; focus moves to next step on advance
- Colour Independence: Validation errors use icon + text, not colour alone

## Responsive Requirements
- Mobile: Single-column wizard steps; full-width inputs
- Tablet: Two-column layout for invoice selection
- Desktop: Full wizard layout with sidebar summary
- Content Priority: Mobile shows steps sequentially; Desktop shows summary sidebar

## AI Features
- AI Assistance: No
- AI Data Requirements: N/A
- AI Interaction Model: N/A

## Analytics Requirements
- Tracked Events: student_searched, invoice_selected, payment_processed, payment_failed, receipt_generated
- Metrics: payment_processing_time, payment_success_rate, average_payment_amount
- Success Indicators: High success rate, low processing time

## Outstanding Design Decisions
| Decision | Context | Options | Recommendation | Status |
|----------|---------|---------|----------------|--------|
| Should parents see this wizard or a simplified version? | Parent self-service | Same wizard vs. simplified parent payment | Simplified parent payment (single invoice) | Pending |
| Should online payment be inline or redirect? | UX flow | Inline gateway vs. redirect to gateway | Inline with iframe (better UX) | Pending |
```

## 35.3 Example: Super Admin Dashboard (Dashboard)

```markdown
# Super Admin Dashboard — Screen Blueprint

## Metadata
- Blueprint ID: SB-PLAT-DASH-001
- Screen Name: Super Admin Dashboard
- Screen Classification: Dashboard
- Module: Platform Administration
- Workspace: Platform Super Administrator
- Platform: Web
- Engineering Spec Reference: Platform Administration Engineering §5; Product Documentation §05 Workspace 1 §2
- Workspace Catalogue Reference: Platform Super Administrator Workspace §2
- Status: Authoring
- Version: 1.0
- Author: Architecture Team
- Date Created: 2026-07-23
- Last Updated: 2026-07-23

## Purpose
- Why This Screen Exists: Provide platform operators with real-time overview of platform health and business operations
- Problem It Solves: Enables quick identification of issues, opportunities, and operational status
- User Value: Reduces time to identify and respond to platform issues

## Users
- Primary Persona: Platform Operator
- Secondary Personas: Platform Super Administrator
- Usage Context: Start of every session; multiple times daily; office environment

## User Intent
- Primary Goal: Assess platform health and identify items requiring attention
- Secondary Goals: Review institution growth, monitor revenue, check support status
- Success Criteria: User can assess platform status in under 30 seconds

## Business Intent
- Business Objective: Maintain platform reliability and business visibility
- Operational Impact: Reduces mean time to detection of platform issues
- Compliance Requirements: Audit events must be visible for compliance review

## Information Hierarchy
- Tier 1 (Primary): Total institutions, active users, system health, revenue, support tickets
- Tier 2 (Secondary): Institution growth chart, subscription distribution, user growth, revenue trends
- Tier 3 (Tertiary): Recent audit events, pending approvals, scheduled maintenance, feature adoption
- Justification: Operators need immediate health indicators (Tier 1), trend analysis (Tier 2), and detailed context (Tier 3)

## Task Hierarchy
- Primary Task: Review platform status and identify issues
- Secondary Tasks: Drill into institution details, review support tickets, check audit logs
- Tertiary Tasks: Configure platform settings, manage subscriptions
- Task Frequency: Primary = start of every session; Secondary = as needed

## Navigation Context
- Entry Points: Sidebar > Dashboard; Application launch (default screen)
- Exit Points: All sidebar navigation items; drill-down links from widgets
- Breadcrumb Path: Dashboard (root)
- Sidebar Position: First item in sidebar

## Workflow Context
- Workflow Name: Platform Operations Daily Routine
- Workflow Position: Entry point — first screen of the day
- Preceding Screen: Login
- Following Screen: Any operational screen based on dashboard insights
- Parallel Screens: System Health, Audit Logs

## Pattern Assignment
- Primary Pattern: Dashboard
- Pattern Rationale: Screen provides aggregated KPIs, charts, and activity for operational overview
- Pattern Alternatives Considered: Analytics (not a deep analysis screen), Workspace Landing (more operational than landing)
- Pattern Library Reference: Figma Build Roadmap §6.2 Step 1

## Screen States
- Populated: All KPIs and charts loaded with data
- Loading: Skeleton KPI cards and chart placeholders
- Empty: "No data available" for each widget (unlikely for platform dashboard)
- Error: Individual widget error states with retry
- Partial: Some widgets loaded, others in error
- Permitted: N/A (single role)

## Required Data
| Data Element | Source Entity | Source Field | Display Priority | Tier | Format |
|-------------|---------------|--------------|-----------------|------|--------|
| Total Institutions | Institution | COUNT(status) | Required | 1 | KPI Card |
| Active Institutions | Institution | COUNT(status = ACTIVE) | Required | 1 | KPI Card |
| Total Users | User | COUNT(status) | Required | 1 | KPI Card |
| Monthly Active Users | User | COUNT(last_login > 30 days) | Required | 1 | KPI Card |
| System Health | Platform Health | Status aggregate | Required | 1 | Status indicator |
| Monthly Revenue | Invoice | SUM(payments, current month) | Required | 1 | KPI Card |
| Open Support Tickets | Support Ticket | COUNT(status = OPEN) | Required | 1 | KPI Card |
| Institution Growth | Institution | COUNT by month | Required | 2 | Line chart |
| Revenue Trends | Invoice | SUM by month | Required | 2 | Line chart |
| User Growth | User | COUNT by month | Required | 2 | Line chart |

## Optional Data
| Data Element | Source Entity | Source Field | Condition | Tier | Format |
|-------------|---------------|--------------|-----------|------|--------|
| Pending Approvals | Institution | status = PENDING_APPROVAL | When > 0 | 2 | Alert card |
| Recent Audit Events | AuditLog | Last 10 events | Always | 3 | Activity feed |
| Scheduled Maintenance | Maintenance | Next scheduled | When scheduled | 3 | Alert card |

## Actions
| Action | Trigger | Scope | Permission | Confirmation | Feedback |
|--------|---------|-------|------------|-------------|----------|
| Drill into institution | KPI click | Single | platform:institution:read | No | Navigate to detail |
| View support ticket | Ticket click | Single | platform:support:read | No | Navigate to ticket |
| View audit log | Link click | All | platform:audit:read | No | Navigate to audit log |
| Refresh dashboard | Refresh button | All | platform:dashboard:read | No | Data refreshes |

## Permissions
- Required Role: Platform Super Administrator
- Required Permission: platform:dashboard:read
- Permission Behaviour: Screen is the default and only visible screen for this role
- Role Variations: N/A (single role for this screen)

## Dependencies
- Upcoming Screens: Login
- Downcoming Screens: Institution Detail, Support Ticket Detail, Audit Log
- Data Dependencies: Institution Management (institutions), Identity & Access (users), Platform Administration (health, audit)
- Service Dependencies: Platform Health API, Analytics API

## Integrations
- Cross-Domain Events Consumed: InstitutionCreated, UserCreated, PaymentProcessed
- Cross-Domain Events Produced: None (read-only dashboard)
- External Services: None
- Real-Time Data: System health status (30-second refresh)

## Accessibility Requirements
- Keyboard Navigation: Tab through KPI cards; Enter to drill down; arrow keys between charts
- Screen Reader: KPI values announced with labels; chart data tables available
- Focus Management: Focus moves to first KPI card on load
- Colour Independence: Health status uses icon + text, not colour alone

## Responsive Requirements
- Mobile: Stacked KPI cards; charts hidden; recent activity feed
- Tablet: 2-column KPI grid; smaller charts
- Desktop: 4-column KPI grid; full charts; activity sidebar
- Content Priority: Mobile shows Tier 1 only; Desktop shows all

## AI Features
- AI Assistance: Future — AI-powered anomaly detection for platform health
- AI Data Requirements: N/A (future feature)
- AI Interaction Model: N/A (future feature)

## Analytics Requirements
- Tracked Events: dashboard_viewed, kpi_clicked, chart_drilled, refresh_performed
- Metrics: dashboard_load_time, time_to_first_interaction, drill_down_rate
- Success Indicators: Fast load time, high drill-down rate (indicates useful data)

## Outstanding Design Decisions
| Decision | Context | Options | Recommendation | Status |
|----------|---------|---------|----------------|--------|
| Should real-time updates use WebSocket or polling? | System health | WebSocket vs. 30s polling | 30s polling (simpler, sufficient) | Pending |
| Should revenue show all currencies or single currency? | Multi-institution | Aggregate vs. per-currency | Per-currency with toggle | Pending |
```

---

# 36. Revision History

---

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | July 2026 | Architecture Team | Initial specification |

---

*Document Version: 1.0*
*Last Updated: July 2026*
*Status: Draft*
*Classification: Internal*

---

**END OF DOCUMENT**
