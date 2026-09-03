# OpenSchool ERP

## Pattern Library

---

| Field | Value |
|-------|-------|
| **Document** | Pattern Library — Page Pattern Standard |
| **Version** | 1.0 |
| **Status** | Draft |
| **Date** | July 2026 |
| **Classification** | Internal |
| **Author** | Architecture Team |
| **Owner** | Solution Architect |

---

| Aspect | Detail |
|--------|--------|
| **Purpose** | Canonical specification defining every approved page pattern used throughout the School ERP |
| **Scope** | Every screen across all 10 domain modules, all 5 user personas, web and mobile platforms |
| **Authority** | Medium — derives authority from Documentation Constitution, Engineering Specifications, and UI/UX Documentation |
| **Compliance** | Mandatory — no screen may invent its own layout; every screen MUST inherit from an approved Pattern |

---

## Table of Contents

1. [Position in the Documentation Pipeline](#1-position-in-the-documentation-pipeline)
2. [Pattern Philosophy](#2-pattern-philosophy)
3. [Pattern Lifecycle](#3-pattern-lifecycle)
4. [Pattern Selection](#4-pattern-selection)
5. [Pattern Categories](#5-pattern-categories)
6. [Dashboard Patterns](#6-dashboard-patterns)
7. [Workspace Patterns](#7-workspace-patterns)
8. [Form Patterns](#8-form-patterns)
9. [Reporting Patterns](#9-reporting-patterns)
10. [Communication Patterns](#10-communication-patterns)
11. [Planning Patterns](#11-planning-patterns)
12. [AI Patterns](#12-ai-patterns)
13. [Authentication Patterns](#13-authentication-patterns)
14. [Administration Patterns](#14-administration-patterns)
15. [Pattern Variants](#15-pattern-variants)
16. [Pattern Decision Trees](#16-pattern-decision-trees)
17. [Pattern Governance](#17-pattern-governance)
18. [Pattern Examples](#18-pattern-examples)
19. [Documentation Standards](#19-documentation-standards)
20. [Appendix A — Pattern ID Registry](#appendix-a--pattern-id-registry)
21. [Appendix B — Cross-Reference Index](#appendix-b--cross-reference-index)

---

# 1. Position in the Documentation Pipeline

---

## 1.1 Purpose

The Pattern Library is the canonical specification defining every approved page pattern used throughout the School ERP. No screen in the system may invent its own layout. Every screen MUST inherit from an approved Pattern. Patterns define structural organization, information flow, interaction models, and content composition. Patterns DO NOT define colours, spacing, typography, materials, shadows, glassmorphism, motion, or visual styling. Those belong exclusively to the UI Rendering Specification.

## 1.2 Inputs

| Input | Source | What It Provides |
|-------|--------|-----------------|
| Domain entities and aggregates | Engineering Specifications (E1–E10) | What data exists, its states, relationships |
| User personas | 01 UI Strategy & Design Direction §3.2 | Who uses each screen |
| Design philosophy | 01 UI Strategy & Design Direction | How screens should feel |
| Component inventory | 02 Design System & Component Library §3.7 | Available components for assembly |
| Composition hierarchy | 02 Design System & Component Library §3.7 | Primitive → Composite → Pattern → Template → Screen |
| Layout templates | Figma Build Roadmap Phase 5, 02 Design System §2.15 | Structural compositions available |
| Screen classifications | Screen Blueprint Specification §10 | Structural type taxonomy (15 types) |
| Workspace catalogue | Product Documentation §05 | What screens exist per workspace |
| System architecture | 01 System Architecture | Technical constraints and patterns |

## 1.3 Outputs Produced

| Output | Consumer | What It Provides |
|--------|----------|-----------------|
| Approved pattern definitions | Screen Blueprint Specification | Which patterns are available for selection |
| Pattern selection rules | Screen Blueprint Specification §17 | Deterministic algorithm for pattern assignment |
| Structural blueprints | Figma Build Roadmap Phase 6 | Page-level structural specifications |
| Component recipe inputs | Component Recipe Library (future) | Pattern-to-component mapping |

## 1.4 Dependencies

| Document | Relationship | Nature |
|----------|-------------|--------|
| Documentation Constitution | Upstream authority | This document must comply with all Constitution rules |
| Engineering Specifications | Upstream input | Patterns derive from entity structures and workflows |
| 01 UI Strategy & Design Direction | Upstream input | Patterns align with design philosophy and personas |
| 02 Design System & Component Library | Upstream input | Patterns reference composition hierarchy and templates |
| Screen Blueprint Specification | Peer document | Blueprints select patterns from this library |
| UI Rendering Specification | Peer document | Rendering spec covers visual treatment; this doc covers structure |
| Figma Build Roadmap | Downstream consumer | Phase 6 uses patterns to build screens |

## 1.5 Downstream Consumers

| Consumer | How They Use Patterns |
|----------|----------------------|
| **Screen Blueprint Specification** | Blueprints select a pattern from this library using pattern ID |
| **Figma Build Roadmap Phase 6** | Each pattern maps to a structural template for screen design |
| **Figma designers** | Patterns provide structural intent before visual design begins |
| **UI Rendering Specification** | Patterns define what the rendering spec must visually cover |
| **Implementation team** | Patterns clarify screen structure beyond API contracts |
| **QA team** | Patterns define expected structural behaviour for validation |
| **Component Recipe Library (future)** | Patterns define which component recipes are composed |

## 1.6 Relationship to Engineering Specification

The Engineering Specification defines **what** to build — entities, aggregates, events, APIs, business rules, and workflows. The Pattern Library defines **how the screen is structurally organized** — which zones exist, what content fills each zone, and how users interact with the structure.

A Pattern MUST reference entity structures from engineering specifications. It MUST NOT redefine business rules, entity definitions, or API contracts. It translates engineering intent into structural layout.

## 1.7 Relationship to Screen Blueprint Specification

The Screen Blueprint selects a Pattern from this library. It MUST NOT invent patterns. Each approved pattern is identified by a stable Pattern ID. Blueprints that reference patterns not yet in the library MUST flag the gap rather than inventing a pattern.

The Screen Blueprint provides the **intent** (what the screen should achieve). The Pattern provides the **structure** (how the screen is organized). The UI Rendering Specification provides the **visual treatment** (how the screen looks).

## 1.8 Relationship to UI Rendering Specification

The UI Rendering Specification defines **how screens are visually implemented** — pixel dimensions, colours, typography, component states, materials, shadows, motion, and responsive behaviour. The Pattern Library defines **what the screen contains structurally** — zones, content areas, interaction models, and information flow.

A Pattern MUST be selected before the UI Rendering Specification covers that screen. The pattern is the structural blueprint; the rendering spec is the visual implementation. There MUST be no overlap between the two documents.

## 1.9 Relationship to Component Recipe Library

The Component Recipe Library (future) will define how patterns compose into page layouts using specific component instances. Screen Blueprints reference Patterns from this library, not individual component recipes. The relationship is: Blueprint → Pattern → Component Recipes → Components.

## 1.10 Relationship to Figma Generation Workflow

When automated Figma generation is implemented, Screen Blueprints will serve as the structured input. The blueprint's metadata, pattern assignment, data requirements, and action specifications will drive pattern selection, component instantiation, and content zone population. The pattern must be sufficiently structured to support this automation.

---

# 2. Pattern Philosophy

---

## 2.1 What a Pattern Is

| Characteristic | Description |
|---------------|-------------|
| **Structural blueprint** | Defines the spatial organization of a page |
| **Reusable** | Applied across multiple screens in multiple modules |
| **Deterministic** | Selected by algorithm, not by judgment |
| **Composable** | Assembled from approved components and composites |
| **Platform-agnostic** | Works on web and mobile with responsive adaptation |
| **Visualisation-agnostic** | Does not prescribe colours, typography, or pixel dimensions |

## 2.2 What a Pattern Is Not

| Characteristic | Description |
|---------------|-------------|
| **Not a wireframe** | Does not show specific layout dimensions |
| **Not a mockup** | Does not show visual design |
| **Not a component** | Does not define individual UI elements |
| **Not a template** | Does not define module-specific content |
| **Not a screen** | Does not define a complete application screen |
| **Not a workflow** | Does not define business process logic |

## 2.3 Terminology Definitions

| Term | Definition | Relationship to Pattern |
|------|-----------|----------------------|
| **Screen** | A complete application view that a user sees at a URL or route | A screen inherits from one Pattern |
| **Blueprint** | A structured document defining a screen's intent, content, and actions | A blueprint selects one Pattern |
| **Pattern** | A reusable structural organization for page content | The pattern provides the structure |
| **Component** | A single reusable UI element (button, input, card) | Components are assembled within patterns |
| **Layout** | The spatial arrangement of zones within a pattern | Layout is a property of a pattern |
| **Template** | A pre-composed page structure combining patterns and components | Templates instantiate patterns with module content |
| **Workflow** | A sequence of screens forming a business process | Workflows reference multiple screens, each using a pattern |
| **View** | A specific state or mode of a screen (e.g., list view, grid view) | Views are variants within a pattern |

## 2.4 Why Patterns Exist

| Reason | Description |
|--------|-------------|
| **Consistency** | Every screen of the same type uses the same structural organization |
| **Scalability** | New screens inherit proven structures rather than inventing new ones |
| **Efficiency** | Designers and engineers select patterns rather than designing from scratch |
| **Quality** | Patterns encode proven UX solutions validated across modules |
| **Automation** | Deterministic patterns enable automated Figma generation |
| **Cognitive load** | Users learn screen structures once; consistent patterns reduce relearning |

## 2.5 Why Screens Inherit Patterns

Every screen in the School ERP MUST inherit from an approved Pattern. Screens MUST NOT invent their own layout.

| Principle | Implication |
|-----------|-------------|
| **No ad hoc layouts** | Every structural decision is pre-approved |
| **No novel compositions** | Every zone arrangement is proven |
| **No inconsistent spacing** | Structural rhythm is predetermined |
| **No surprise navigation** | Entry/exit points follow pattern rules |
| **No orphan screens** | Every screen has a pattern lineage |

---

# 3. Pattern Lifecycle

---

## 3.1 Lifecycle Stages

```
Business Requirement
        ↓
Engineering Specification
        ↓
Screen Blueprint
        ↓
Pattern Selection
        ↓
Component Recipes
        ↓
UI Rendering
        ↓
Figma Generation
        ↓
QA
```

## 3.2 Stage Responsibilities

| Stage | Owner | Responsibility | Input | Output |
|-------|-------|---------------|-------|--------|
| **Business Requirement** | Product | Define what users need | User research, stakeholder input | Approved requirement |
| **Engineering Specification** | Engineering | Define entities, APIs, workflows | Business requirement | Approved engineering spec |
| **Screen Blueprint** | Design | Define screen intent, content, actions | Engineering spec, workspace catalogue | Approved blueprint |
| **Pattern Selection** | Design | Select approved pattern from library | Blueprint, pattern library | Pattern assignment with rationale |
| **Component Recipes** | Design | Compose components within pattern zones | Pattern, design system | Component recipe document |
| **UI Rendering** | Design | Apply visual treatment to structure | Component recipes, rendering spec | Visual design |
| **Figma Generation** | Design/AI | Generate Figma frames from specification | Blueprint + pattern + rendering | Figma designs |
| **QA** | QA | Validate against all specifications | Figma designs, all specs | QA report |

## 3.3 Gate Rules

| Gate | Requirement |
|------|-------------|
| **Blueprint → Pattern Selection** | Blueprint must be approved; pattern must exist in library |
| **Pattern Selection → Component Recipes** | Pattern must be validated; component inventory must cover pattern zones |
| **Component Recipes → UI Rendering** | All pattern zones must have component assignments |
| **UI Rendering → Figma Generation** | Visual design must comply with rendering spec |
| **Figma Generation → QA** | All specifications must be referenced for validation |

---

# 4. Pattern Selection

---

## 4.1 Selection Principles

Pattern selection MUST be deterministic. No subjective interpretation is permitted. Selection is based on measurable factors derived from the Screen Blueprint and Engineering Specification.

## 4.2 Selection Factors

| Factor | Source | Values |
|--------|--------|--------|
| **User Goal** | Screen Blueprint §User Intent | View, Create, Edit, Delete, Analyse, Communicate, Plan, Configure |
| **Screen Purpose** | Screen Blueprint §Purpose | Overview, List, Detail, Form, Report, Calendar, Message, Auth, Settings |
| **Information Density** | Screen Blueprint §Information Hierarchy | Low, Medium, High, Very High |
| **Workflow Complexity** | Screen Blueprint §Workflow Context | None, Simple, Multi-step, Complex |
| **Primary Task** | Screen Blueprint §Task Hierarchy | Read-only, Create, Edit, Bulk operate, Analyse, Configure |
| **Navigation Context** | Screen Blueprint §Navigation Context | Entry, Intermediate, Exit, Standalone |
| **Decision Frequency** | Engineering Specification | Rarely, Sometimes, Often, Always |
| **Interaction Frequency** | Engineering Specification | Read-only, Low, Medium, High |
| **Data Complexity** | Engineering Specification §Entities | Single entity, Related entities, Cross-domain, Aggregate |
| **Business Objective** | Screen Blueprint §Business Intent | Monitor, Manage, Process, Report, Configure |

## 4.3 Selection Algorithm

```
Step 1: Determine Screen Purpose
    ├── Overview → Dashboard Pattern
    ├── List → Workspace Pattern (CRUD or Search)
    ├── Detail → Workspace Pattern (Detail or Profile)
    ├── Form → Form Pattern
    ├── Multi-step process → Form Pattern (Wizard)
    ├── Analysis → Reporting Pattern (Analytics or Trend)
    ├── Report generation → Reporting Pattern (Summary or Detailed)
    ├── Date/schedule → Planning Pattern
    ├── Message/notification → Communication Pattern
    ├── AI-assisted → AI Pattern
    ├── Authentication → Authentication Pattern
    ├── Configuration → Administration Pattern
    └── Monitoring → Administration Pattern (Monitoring)

Step 2: Determine Primary User Task
    ├── Read-only → Workspace (Detail) or Dashboard
    ├── Create single → Form Pattern (Single-Step)
    ├── Create multi-step → Form Pattern (Multi-Step Wizard)
    ├── Read + Write → Workspace Pattern (CRUD)
    ├── Bulk operations → Workspace Pattern (CRUD with bulk)
    ├── Analyse data → Reporting Pattern (Analytics)
    ├── Generate report → Reporting Pattern (Report)
    ├── Schedule/plan → Planning Pattern
    └── Configure system → Administration Pattern

Step 3: Determine Information Density
    ├── Low (< 5 data elements) → Workspace (Detail) or Settings
    ├── Medium (5-15 data elements) → Workspace (CRUD) or Form
    ├── High (15-30 data elements) → Workspace (CRUD with tabs)
    └── Very High (30+ data elements) → Workspace (Master-Detail)

Step 4: Determine Workflow Complexity
    ├── None → Workspace Pattern
    ├── Simple (1-2 screens) → Workspace Pattern
    ├── Multi-step (3-5 screens) → Form Pattern (Wizard)
    └── Complex (6+ screens) → Form Pattern (Progressive)

Step 5: Select Pattern Variant
    ├── Apply variant rules from §15
    └── Validate selection against §4.4

Step 6: Validate Selection
    ├── Check against anti-patterns
    ├── Verify pattern covers all required zones
    ├── Confirm pattern supports all required screen states
    └── Record selection rationale
```

## 4.4 Selection Validation Rules

| Rule | Description |
|------|-------------|
| **R-SELECT-01** | Every screen MUST select exactly one primary pattern |
| **R-SELECT-02** | Pattern selection MUST be traceable to blueprint factors |
| **R-SELECT-03** | No screen MAY invent a pattern not in the approved library |
| **R-SELECT-04** | If no pattern fits, the gap MUST be flagged for pattern development |
| **R-SELECT-05** | Pattern alternatives MUST be documented with rejection rationale |
| **R-SELECT-06** | Pattern selection MUST be validated before blueprint approval |
| **R-SELECT-07** | Pattern variants MUST be selected based on data characteristics |

## 4.5 Selection Anti-Patterns

| Anti-Pattern | Why It Conflicts |
|-------------|-----------------|
| Inventing a new pattern | Violates the approved pattern constraint |
| Selecting pattern without rationale | Makes review impossible |
| Multiple primary patterns | Conflicting structural compositions |
| Pattern mismatch with classification | Dashboard pattern on a CRUD screen |
| Choosing pattern by visual preference | Selection must be structural, not aesthetic |
| Skipping variant selection | Variants handle critical data density differences |

---

# 5. Pattern Categories

---

## 5.1 Category Registry

| Category | Pattern Count | Description |
|----------|--------------|-------------|
| **Dashboard** | 7 | Aggregated overview screens with KPIs, charts, and widgets |
| **Workspace** | 7 | Data management screens with CRUD, detail, and search operations |
| **Form** | 4 | Data entry screens with single-step, multi-step, and configuration |
| **Reporting** | 6 | Data analysis and report generation screens |
| **Communication** | 5 | Messaging, notification, and announcement screens |
| **Planning** | 4 | Date-based schedule and calendar screens |
| **AI** | 4 | AI-assisted workspace and interaction screens |
| **Authentication** | 5 | Login, registration, MFA, and account recovery screens |
| **Administration** | 5 | System configuration, monitoring, and management screens |
| **Total** | **47** | |

## 5.2 Category Selection Matrix

| Category | Primary User Goal | Information Density | Interaction Frequency |
|----------|------------------|--------------------|-----------------------|
| **Dashboard** | Monitor, overview | Medium-High | Low (read + drill-down) |
| **Workspace** | Manage, operate | Medium-High | High (CRUD operations) |
| **Form** | Create, configure | Low-Medium | High (data entry) |
| **Reporting** | Analyse, report | High | Medium (filter + export) |
| **Communication** | Message, notify | Low-Medium | Medium (read + respond) |
| **Planning** | Schedule, plan | Medium | Medium (navigate + create) |
| **AI** | Assist, recommend | Variable | Medium (interact + review) |
| **Authentication** | Authenticate | Low | High (one-time) |
| **Administration** | Configure, monitor | Medium-High | Low-Medium (configure + monitor) |

---

# 6. Dashboard Patterns

---

## 6.1 Pattern: Executive Dashboard

**Pattern ID:** `PAT-DASH-EXEC`

### Purpose

Provide a high-level overview of platform or institution health for executive decision-makers. Designed for quick scanning and issue identification.

### Problem Solved

Executives need to understand overall platform health at a glance without navigating through individual modules.

### Typical Users

Platform Operators, Institution Administrators, Principals

### Business Goals

- Enable rapid identification of issues requiring attention
- Provide confidence that operations are running normally
- Surface trends that require executive action

### User Goals

- Understand platform/institution health in under 30 seconds
- Identify areas requiring immediate attention
- Access drill-down paths to detailed views

### Information Hierarchy

| Tier | Content | Justification |
|------|---------|---------------|
| **Tier 1** | Primary KPIs (4-6 key metrics), health status indicators | Must be scannable in under 3 seconds |
| **Tier 2** | Trend charts (2-3), recent alerts, quick action buttons | Support identification of trends and issues |
| **Tier 3** | Activity feed, secondary metrics, system status | Provide context when drilling down |

### Primary Content

- KPI stat cards (4-6) with trend indicators
- Trend line charts (2-3) showing time-series data
- Alert/notification panel for issues requiring attention
- Quick action buttons for common executive tasks

### Secondary Content

- Recent activity feed (last 10 items)
- Distribution charts (pie/donut for categorical breakdown)
- System health indicators

### Supporting Content

- Secondary KPIs (4-6 additional metrics)
- Scheduled maintenance notices
- Platform announcements

### Primary Actions

- Click KPI card → navigate to detailed view
- Click alert → navigate to alert detail
- Click quick action → navigate to action workspace

### Secondary Actions

- Change date range for charts
- Dismiss alerts
- Access notification panel

### Navigation Relationships

| Direction | Pattern | Description |
|-----------|---------|-------------|
| **Entry from** | Authentication, Sidebar Navigation | Users arrive after login or from sidebar |
| **Exit to** | Workspace (CRUD, Detail), Reporting (Analytics), Administration | Drill-down from KPIs and charts |

### Typical Workflows

1. User logs in → lands on executive dashboard → scans KPIs → identifies issue → clicks KPI → navigates to detail
2. User opens sidebar → clicks Dashboard → reviews trends → clicks alert → navigates to alert workspace

### Entry Points

- Default landing after login (for executive roles)
- Sidebar navigation "Dashboard" link
- Breadcrumb navigation

### Exit Points

- KPI card click → detail workspace
- Alert click → alert workspace
- Quick action click → action workspace
- Sidebar navigation → any module

### Screen Complexity

Low — designed for quick scanning, not deep interaction.

### Information Density

Medium — 4-6 KPIs, 2-3 charts, activity feed, alerts.

### Expected Interactions

- Read KPIs (primary)
- Click to drill down (secondary)
- Change date range (tertiary)
- Dismiss alerts (tertiary)

### Data Characteristics

- Aggregated metrics from multiple domains
- Time-series data for trend charts
- Real-time or near-real-time updates
- Cross-domain data aggregation

### Permissions

| Role | Behaviour |
|------|-----------|
| **Platform Operator** | Full dashboard with platform-wide metrics |
| **Institution Admin** | Institution-scoped metrics only |
| **Principal** | Institution-scoped with academic focus |
| **Teacher** | Class-scoped dashboard (variant) |
| **Student** | Personal dashboard (variant) |
| **Parent** | Child-scoped dashboard (variant) |

### Accessibility Considerations

- KPI values MUST be readable by screen readers
- Charts MUST have text alternatives
- Trend indicators MUST use icons + text, not colour alone
- Focus order MUST follow visual hierarchy

### Responsive Considerations

| Breakpoint | Behaviour |
|-----------|-----------|
| **Desktop** | Multi-column grid, all KPIs visible |
| **Tablet** | Stacked KPIs, 2-column chart layout |
| **Mobile** | Single column, KPIs stacked, charts full-width |

### AI Interaction Opportunities

- AI-generated insights summarising KPI trends
- Anomaly detection highlighting unusual metrics
- Predictive alerts based on trend analysis

### Common Mistakes

- Displaying too many KPIs (cognitive overload)
- Using colour alone to indicate status
- Placing interactive elements above the fold without clear purpose
- Mixing read-only and actionable content without clear distinction

### Anti-Patterns

| Anti-Pattern | Why It Conflicts |
|-------------|-----------------|
| KPIs without trend indicators | No context for whether metrics are improving or declining |
| Charts without text alternatives | Accessibility violation |
| More than 6 primary KPIs | Cognitive overload; defeats quick-scanning purpose |
| No drill-down paths | Dashboard becomes a dead end |

### Validation Checklist

- [ ] 4-6 primary KPIs with trend indicators
- [ ] 2-3 trend charts with time-series data
- [ ] Alert/notification panel
- [ ] Quick action buttons (2-4)
- [ ] Activity feed or recent items
- [ ] All KPIs have text alternatives for charts
- [ ] Focus order follows visual hierarchy
- [ ] Responsive at all breakpoints
- [ ] Loading, empty, and error states defined

### Pass/Fail Criteria

| Criterion | Pass | Fail |
|-----------|------|------|
| KPI count | 4-6 primary KPIs | More than 6 or fewer than 3 |
| Scan time | User identifies key metrics in < 5 seconds | Requires more than 10 seconds |
| Drill-down | Every KPI has a drill-down path | Any KPI is a dead end |
| Accessibility | All content readable by screen reader | Any content inaccessible |
| Responsiveness | Functional at all breakpoints | Broken at any breakpoint |

### Cross-References

| Document | Reference |
|----------|-----------|
| 02 Design System §3.4 | Dashboard components (Stat Card, Chart) |
| 02 Design System §4.1 | Chart standards |
| Figma Build Roadmap §6.2 Step 1 | Dashboard template |
| Screen Blueprint §10 `DASH` | Dashboard classification |
| UI Rendering Specification | Visual treatment for dashboard surfaces |

---

## 6.2 Pattern: Operational Dashboard

**Pattern ID:** `PAT-DASH-OPS`

### Purpose

Provide a role-specific overview of daily operations for staff members. Designed for action-oriented monitoring.

### Problem Solved

Teachers, accountants, and operational staff need to see their daily workload and pending actions without navigating multiple modules.

### Typical Users

Teachers, Accountants, Librarians, Transport Coordinators

### Business Goals

- Surface daily priorities and pending actions
- Reduce time to identify and complete tasks
- Provide operational confidence

### User Goals

- See today's tasks and pending actions
- Identify items requiring immediate attention
- Access workspaces quickly from the dashboard

### Information Hierarchy

| Tier | Content | Justification |
|------|---------|---------------|
| **Tier 1** | Pending action count, today's schedule, urgent alerts | Must identify daily priorities instantly |
| **Tier 2** | Recent activity, pending items list, quick links | Support task completion |
| **Tier 3** | Historical trends, secondary metrics | Provide context |

### Primary Content

- Pending action cards (count + list)
- Today's schedule/timetable
- Urgent alert banners
- Quick link buttons to common workspaces

### Secondary Content

- Recent activity feed
- Pending approval items
- Upcoming deadlines

### Supporting Content

- Weekly trend mini-charts
- Secondary operational metrics

### Primary Actions

- Click pending item → navigate to workspace
- Click schedule item → navigate to detail
- Click quick link → navigate to module

### Secondary Actions

- Mark items as complete
- Dismiss alerts
- Change date view

### Navigation Relationships

| Direction | Pattern | Description |
|-----------|---------|-------------|
| **Entry from** | Authentication, Sidebar Navigation | After login or from sidebar |
| **Exit to** | Workspace (CRUD, Detail), Form (Single-Step), Planning (Calendar) | Action-oriented drill-down |

### Screen Complexity

Low-Medium — designed for quick action, not deep analysis.

### Information Density

Medium — focused on actionable items, not comprehensive metrics.

### Expected Interactions

- Review pending items (primary)
- Click to complete action (secondary)
- Navigate to workspace (secondary)

### Data Characteristics

- Role-specific filtered data
- Today-focused with upcoming items
- Action-oriented (pending items, not historical trends)

### Permissions

| Role | Behaviour |
|------|-----------|
| **Teacher** | Class-scoped: attendance pending, grading pending, today's classes |
| **Accountant** | Finance-scoped: pending payments, today's transactions |
| **Librarian** | Library-scoped: overdue books, pending returns |

### Accessibility Considerations

- Same as Executive Dashboard (§6.1)
- Pending action counts MUST be announced by screen readers
- Schedule items MUST have clear time labels

### Responsive Considerations

| Breakpoint | Behaviour |
|-----------|-----------|
| **Desktop** | Multi-column: schedule + pending items + alerts |
| **Tablet** | Stacked sections |
| **Mobile** | Single column, priority-ordered |

### AI Interaction Opportunities

- AI-suggested task prioritisation
- Predictive workload balancing
- Smart scheduling recommendations

### Common Mistakes

- Showing historical data prominently (operational dashboards are forward-looking)
- Too many quick links (overwhelming)
- No clear visual hierarchy between urgent and routine items

### Anti-Patterns

| Anti-Pattern | Why It Conflicts |
|-------------|-----------------|
| Historical trends as primary content | Operational dashboards focus on today and upcoming |
| More than 6 quick links | Cognitive overload |
| No pending action summary | Defeats the action-oriented purpose |

### Validation Checklist

- [ ] Pending action summary with counts
- [ ] Today's schedule or workload
- [ ] Urgent alert area
- [ ] Quick links to common workspaces (≤6)
- [ ] Activity feed or recent items
- [ ] Responsive at all breakpoints
- [ ] Loading, empty, and error states defined

### Cross-References

| Document | Reference |
|----------|-----------|
| 02 Design System §3.4 | Dashboard components |
| 02 Design System §3.7 | Pattern: Stat Card, Media Object |
| Figma Build Roadmap §6.2 Step 1 | Dashboard template |
| Screen Blueprint §10 `DASH` | Dashboard classification |

---

## 6.3 Pattern: Role-Specific Dashboard

**Pattern ID:** `PAT-DASH-ROLE`

### Purpose

Provide a customised overview for a specific user role (Student, Teacher, Parent, Principal) with role-relevant metrics and actions.

### Problem Solved

Different user roles have different information needs. A one-size-fits-all dashboard wastes attention on irrelevant information.

### Typical Users

Students, Teachers, Parents, Principals

### Business Goals

- Deliver role-relevant information efficiently
- Reduce navigation to find role-specific data
- Increase engagement by showing relevant content

### User Goals

- See information relevant to my role
- Access my most common actions quickly
- Understand my current status and upcoming items

### Information Hierarchy

| Tier | Content | Justification |
|------|---------|---------------|
| **Tier 1** | Role-specific primary metrics (3-4), status indicators | Must understand current status instantly |
| **Tier 2** | Role-specific lists, upcoming items, recent activity | Support daily tasks |
| **Tier 3** | Secondary metrics, historical trends | Provide context |

### Primary Content

- Role-specific stat cards (3-4)
- Status indicators (attendance, grades, fees)
- Upcoming items list
- Quick action buttons

### Secondary Content

- Recent activity feed
- Notification summary
- Role-specific charts

### Supporting Content

- Historical trends
- Secondary metrics
- Help/guidance links

### Primary Actions

- Click stat card → navigate to detail
- Click upcoming item → navigate to item
- Click quick action → navigate to workspace

### Secondary Actions

- View all notifications
- Access settings
- View help

### Navigation Relationships

| Direction | Pattern | Description |
|-----------|---------|-------------|
| **Entry from** | Authentication, Sidebar Navigation | Default landing for role |
| **Exit to** | Workspace (Detail), Planning (Calendar), Communication | Role-specific drill-down |

### Screen Complexity

Low — designed for quick daily check-in.

### Information Density

Low-Medium — focused on the most relevant items for the role.

### Expected Interactions

- Review status (primary)
- Click to view detail (secondary)
- Access quick action (secondary)

### Data Characteristics

- Role-scoped data
- Personal or class-scoped
- Current status focused

### Permissions

Each role sees a different dashboard variant with different data.

### Accessibility Considerations

- Same as Executive Dashboard (§6.1)
- Role-specific content MUST be clearly labelled
- Status indicators MUST use icons + text

### Responsive Considerations

| Breakpoint | Behaviour |
|-----------|-----------|
| **Desktop** | Multi-column grid |
| **Tablet** | 2-column layout |
| **Mobile** | Single column, priority stack |

### AI Interaction Opportunities

- Personalised content based on usage patterns
- Smart notifications based on role behaviour
- Predictive suggestions for next actions

### Common Mistakes

- Showing all data regardless of role
- No clear primary metric
- Missing quick actions for common tasks

### Anti-Patterns

| Anti-Pattern | Why It Conflicts |
|-------------|-----------------|
| Generic content for all roles | Defeats the purpose of role-specific design |
| More than 4 primary metrics | Cognitive overload for quick check-in |
| No quick actions | Forces navigation for every task |

### Validation Checklist

- [ ] Role-specific primary metrics (3-4)
- [ ] Status indicators with icons + text
- [ ] Upcoming items list
- [ ] Quick action buttons (2-4)
- [ ] Responsive at all breakpoints
- [ ] Loading, empty, and error states defined

### Cross-References

| Document | Reference |
|----------|-----------|
| 02 Design System §3.4 | Dashboard components |
| 01 UI Strategy §3.2 | User personas |
| Figma Build Roadmap §6.2 Step 1 | Dashboard template |
| Screen Blueprint §10 `DASH` | Dashboard classification |

---

## 6.4 Pattern: Finance Dashboard

**Pattern ID:** `PAT-DASH-FIN`

### Purpose

Provide a financial overview with revenue, payments, outstanding balances, and financial health indicators.

### Problem Solved

Financial staff need to monitor revenue, track outstanding payments, and identify financial issues without navigating multiple finance workspaces.

### Typical Users

Accountants, Institution Administrators, Platform Operators

### Business Goals

- Monitor financial health at a glance
- Identify outstanding payments requiring action
- Track revenue trends and forecasts

### User Goals

- See total revenue, outstanding, and collection rate
- Identify overdue payments
- Access finance workspaces quickly

### Information Hierarchy

| Tier | Content | Justification |
|------|---------|---------------|
| **Tier 1** | Revenue, outstanding balance, collection rate, payment count | Financial health must be visible instantly |
| **Tier 2** | Revenue trend chart, payment method breakdown, overdue list | Support financial analysis |
| **Tier 3** | Monthly comparison, category breakdown, forecasts | Provide depth |

### Primary Content

- Revenue KPI card
- Outstanding balance KPI card
- Collection rate KPI card
- Payment count KPI card
- Revenue trend line chart
- Overdue payments alert list

### Secondary Content

- Payment method pie chart
- Revenue by category bar chart
- Monthly comparison chart

### Supporting Content

- Forecast indicators
- Subscription status summary
- Recent transactions list

### Primary Actions

- Click outstanding → navigate to payment list
- Click overdue → navigate to overdue list
- Click revenue trend → navigate to financial report

### Secondary Actions

- Export financial summary
- Change date range
- Filter by category

### Navigation Relationships

| Direction | Pattern | Description |
|-----------|---------|-------------|
| **Entry from** | Sidebar Navigation, Authentication | Finance module entry |
| **Exit to** | Workspace (CRUD), Reporting (Financial), Detail | Finance workspaces |

### Screen Complexity

Medium — multiple charts and metrics require clear hierarchy.

### Information Density

High — financial data is inherently dense.

### Expected Interactions

- Review financial metrics (primary)
- Click to drill down to payment lists (secondary)
- Change date range (secondary)
- Export data (tertiary)

### Data Characteristics

- Financial aggregates from Finance domain
- Time-series revenue data
- Payment status data
- Cross-reference to People domain for student/parent

### Permissions

| Role | Behaviour |
|------|-----------|
| **Accountant** | Full financial dashboard |
| **Institution Admin** | Institution-scoped financial overview |
| **Platform Operator** | Platform-wide revenue metrics |

### Accessibility Considerations

- Financial figures MUST be readable by screen readers
- Charts MUST have text alternatives
- Colour-blind safe palette for charts
- Currency formatting MUST be locale-aware

### Responsive Considerations

| Breakpoint | Behaviour |
|-----------|-----------|
| **Desktop** | 4-column KPI grid, 2-column chart layout |
| **Tablet** | 2-column KPI grid, stacked charts |
| **Mobile** | Single column, KPIs stacked, charts full-width |

### AI Interaction Opportunities

- Revenue forecasting
- Anomaly detection in payment patterns
- Smart categorisation of transactions

### Common Mistakes

- Displaying raw numbers without context (comparisons, trends)
- No clear distinction between revenue and outstanding
- Missing overdue payment alerts

### Anti-Patterns

| Anti-Pattern | Why It Conflicts |
|-------------|-----------------|
| Revenue without outstanding balance | Incomplete financial picture |
| No trend indicators | Cannot assess financial trajectory |
| Charts without text alternatives | Accessibility violation |

### Validation Checklist

- [ ] Revenue, outstanding, collection rate, payment count KPIs
- [ ] Revenue trend chart
- [ ] Overdue payment alerts
- [ ] Payment method breakdown
- [ ] All charts have text alternatives
- [ ] Currency formatting locale-aware
- [ ] Responsive at all breakpoints
- [ ] Loading, empty, and error states defined

### Cross-References

| Document | Reference |
|----------|-----------|
| 02 Design System §3.4 | Dashboard components |
| 02 Design System §4.1-4.5 | Chart standards |
| Finance Engineering | Financial entities and aggregations |
| Figma Build Roadmap §6.2 Step 1 | Dashboard template |
| Screen Blueprint §10 `DASH` | Dashboard classification |

---

## 6.5 Pattern: Analytics Dashboard

**Pattern ID:** `PAT-DASH-ANL`

### Purpose

Provide interactive data exploration with charts, filters, and drill-down capabilities for analytical decision-making.

### Problem Solved

Decision-makers need to explore data across dimensions, apply filters, and drill into details to understand trends and patterns.

### Typical Users

Principals, Institution Administrators, Platform Operators, Teachers (academic analytics)

### Business Goals

- Enable data-driven decision making
- Provide visibility into academic, operational, and financial trends
- Support comparative analysis across time periods and categories

### User Goals

- Explore data across dimensions
- Apply filters to segment data
- Drill down from summary to detail
- Export analysis results

### Information Hierarchy

| Tier | Content | Justification |
|------|---------|---------------|
| **Tier 1** | Primary metric, dimension selector, filter controls | Must enable immediate data exploration |
| **Tier 2** | Charts (2-3), data table, drill-down links | Support analysis |
| **Tier 3** | Secondary metrics, export controls, comparison tools | Provide depth |

### Primary Content

- Primary metric display
- Dimension selector (time, category, group)
- Filter panel (date range, category, status)
- Main chart area (1-2 primary charts)
- Data table with sortable columns

### Secondary Content

- Secondary charts (1-2)
- Drill-down links from chart elements
- Comparison period selector

### Supporting Content

- Export controls (CSV, Excel, PDF)
- Saved filter presets
- Help/guidance for analysis

### Primary Actions

- Change filters → update charts and table
- Click chart element → drill down to detail
- Sort table → reorder data

### Secondary Actions

- Export data
- Save filter preset
- Switch chart type
- Change date range

### Navigation Relationships

| Direction | Pattern | Description |
|-----------|---------|-------------|
| **Entry from** | Dashboard (click drill-down), Sidebar Navigation | From overview to analysis |
| **Exit to** | Workspace (Detail, CRUD), Reporting (Report) | From analysis to action |

### Screen Complexity

Medium-High — multiple interactive elements require careful layout.

### Information Density

High — charts, tables, and filters in a single view.

### Expected Interactions

- Filter data (primary)
- Explore charts (primary)
- Sort and search table (secondary)
- Export results (tertiary)

### Data Characteristics

- Cross-domain aggregated data
- Time-series and categorical data
- Large datasets requiring pagination
- Multiple dimensions for filtering

### Permissions

| Role | Behaviour |
|------|-----------|
| **Principal** | Institution-wide analytics |
| **Teacher** | Class-scoped analytics |
| **Platform Operator** | Platform-wide analytics |

### Accessibility Considerations

- Charts MUST have text alternatives and data tables
- Filter controls MUST be keyboard accessible
- Sort indicators MUST use icons + text
- Focus management for filter interactions

### Responsive Considerations

| Breakpoint | Behaviour |
|-----------|-----------|
| **Desktop** | Filter panel + chart area + data table side by side |
| **Tablet** | Filter panel collapsible, charts stacked |
| **Mobile** | Filters in bottom sheet, charts full-width, table scrollable |

### AI Interaction Opportunities

- AI-suggested filters based on data patterns
- Natural language query interface
- Automated insight generation

### Common Mistakes

- Too many filters visible simultaneously
- Charts without data table fallback
- No clear drill-down path from chart elements

### Anti-Patterns

| Anti-Pattern | Why It Conflicts |
|-------------|-----------------|
| Charts without data table | Accessibility violation; no text alternative |
| Filters without clear reset | Users cannot return to default view |
| No drill-down from charts | Analysis becomes a dead end |

### Validation Checklist

- [ ] Primary metric with dimension selector
- [ ] Filter panel with date range, category, status
- [ ] 2-3 charts with data table alternatives
- [ ] Drill-down links from chart elements
- [ ] Export controls
- [ ] Responsive at all breakpoints
- [ ] Loading, empty, and error states defined

### Cross-References

| Document | Reference |
|----------|-----------|
| 02 Design System §3.4 | Dashboard components |
| 02 Design System §3.7 | Pattern: Data Table, Filter Panel |
| 02 Design System §4.1-4.9 | Chart standards |
| Figma Build Roadmap §6.2 Step 6 | Analytics template |
| Screen Blueprint §10 `ANL` | Analytics classification |

---

## 6.6 Pattern: Student Dashboard

**Pattern ID:** `PAT-DASH-STU`

### Purpose

Provide students with a personalised view of their academic progress, upcoming assignments, grades, and attendance.

### Problem Solved

Students need a single view of their academic status without navigating multiple modules.

### Typical Users

Students

### Business Goals

- Increase student engagement with their academic progress
- Reduce support queries about grades and attendance
- Promote self-service academic management

### User Goals

- See my grades and academic progress
- View upcoming assignments and deadlines
- Check my attendance record
- Access notifications

### Information Hierarchy

| Tier | Content | Justification |
|------|---------|---------------|
| **Tier 1** | Current GPA/average, attendance %, upcoming deadlines (3-4) | Must understand academic status instantly |
| **Tier 2** | Recent grades, assignment list, class schedule | Support daily academic tasks |
| **Tier 3** | Historical trends, subject breakdown, teacher comments | Provide depth |

### Primary Content

- Current GPA/average card with trend
- Attendance percentage card
- Upcoming assignments list (3-5)
- Today's class schedule

### Secondary Content

- Recent grades list
- Subject-wise performance chart
- Notification summary

### Supporting Content

- Historical grade trends
- Teacher feedback
- Announcements

### Primary Actions

- Click assignment → view assignment detail
- Click subject → view subject detail
- Click grade → view grade detail

### Secondary Actions

- View full timetable
- View all notifications
- Access settings

### Navigation Relationships

| Direction | Pattern | Description |
|-----------|---------|-------------|
| **Entry from** | Authentication (student login), Sidebar Navigation | Default student landing |
| **Exit to** | Workspace (Detail), Planning (Calendar), Communication | Academic detail views |

### Screen Complexity

Low — designed for quick daily check-in.

### Information Density

Low-Medium — focused on the most relevant items.

### Data Characteristics

- Student-scoped data from Academic domain
- Personal academic records
- Attendance data
- Assignment data from Teachers

### Permissions

| Role | Behaviour |
|------|-----------|
| **Student** | Own data only |
| **Parent** | Child's data (via role-scoped dashboard) |

### Accessibility Considerations

- Same as Executive Dashboard (§6.1)
- Grade information MUST be clear and unambiguous
- Colour-blind safe grade indicators

### Responsive Considerations

| Breakpoint | Behaviour |
|-----------|-----------|
| **Desktop** | 2-column layout: metrics + schedule |
| **Tablet** | Stacked sections |
| **Mobile** | Single column, priority stack |

### AI Interaction Opportunities

- Study recommendations based on performance
- Predicted grade calculations
- Smart deadline reminders

### Common Mistakes

- Showing too many subjects simultaneously
- No clear upcoming deadlines
- Missing attendance indicator

### Anti-Patterns

| Anti-Pattern | Why It Conflicts |
|-------------|-----------------|
| All grades without priority | Cannot identify areas needing attention |
| No upcoming deadlines | Students miss assignments |
| No attendance indicator | Critical academic metric missing |

### Validation Checklist

- [ ] GPA/average with trend indicator
- [ ] Attendance percentage
- [ ] Upcoming assignments (3-5)
- [ ] Today's schedule
- [ ] Recent grades
- [ ] Responsive at all breakpoints
- [ ] Loading, empty, and error states defined

### Cross-References

| Document | Reference |
|----------|-----------|
| 02 Design System §3.4 | Dashboard components |
| Academic Management Engineering | Grade and attendance entities |
| People Engineering | Student entity |
| Figma Build Roadmap §6.2 Step 1 | Dashboard template |

---

## 6.7 Pattern: Parent Dashboard

**Pattern ID:** `PAT-DASH-PAR`

### Purpose

Provide parents with a view of their child's academic progress, attendance, fees, and school communications.

### Problem Solved

Parents need to monitor their child's school experience without navigating multiple modules.

### Typical Users

Parents, Guardians

### Business Goals

- Increase parent engagement
- Reduce communication overhead
- Promote transparency in student progress

### User Goals

- See my child's academic progress
- Check attendance record
- View fee status and payment history
- Read school communications

### Information Hierarchy

| Tier | Content | Justification |
|------|---------|---------------|
| **Tier 1** | Child's name/avatar, attendance %, fee status, unread messages (3-4) | Must understand child's status instantly |
| **Tier 2** | Recent grades, upcoming events, fee summary | Support daily monitoring |
| **Tier 3** | Historical trends, school announcements, teacher feedback | Provide depth |

### Primary Content

- Child profile header (name, class, avatar)
- Attendance percentage card
- Fee status card
- Unread message count
- Recent grades list

### Secondary Content

- Upcoming school events
- Fee summary with next due date
- Teacher feedback summary

### Supporting Content

- School announcements
- Historical attendance trends
- Academic performance trends

### Primary Actions

- Click grade → view grade detail
- Click attendance → view attendance detail
- Click fee → view fee/payment workspace
- Click message → view communication

### Secondary Actions

- View full report card
- View all notifications
- Access settings

### Navigation Relationships

| Direction | Pattern | Description |
|-----------|---------|-------------|
| **Entry from** | Authentication (parent login), Sidebar Navigation | Default parent landing |
| **Exit to** | Workspace (Detail), Communication, Reporting | Child detail views |

### Screen Complexity

Low — designed for quick daily check-in.

### Information Density

Low-Medium — focused on the most relevant items.

### Data Characteristics

- Child-scoped data from Academic, Finance, Communication domains
- Personal academic records
- Fee and payment data
- Communication data

### Permissions

| Role | Behaviour |
|------|-----------|
| **Parent** | Own child's data only |
| **Guardian** | Linked children's data |

### Accessibility Considerations

- Same as Executive Dashboard (§6.1)
- Fee amounts MUST be clearly formatted
- Status indicators MUST use icons + text

### Responsive Considerations

| Breakpoint | Behaviour |
|-----------|-----------|
| **Desktop** | 2-column layout |
| **Tablet** | Stacked sections |
| **Mobile** | Single column, priority stack |

### AI Interaction Opportunities

- Smart notifications about child's progress
- Predictive alerts for attendance issues
- Fee payment reminders

### Common Mistakes

- No clear child identification (for parents with multiple children)
- Missing fee status
- No communication summary

### Anti-Patterns

| Anti-Pattern | Why It Conflicts |
|-------------|-----------------|
| No child selector for multiple children | Parents cannot switch between children |
| Fee status without payment history link | Dead end for payment actions |
| No attendance indicator | Critical metric for parents |

### Validation Checklist

- [ ] Child profile header with avatar
- [ ] Attendance, fee status, message count cards
- [ ] Recent grades list
- [ ] Upcoming events
- [ ] Responsive at all breakpoints
- [ ] Loading, empty, and error states defined

### Cross-References

| Document | Reference |
|----------|-----------|
| 02 Design System §3.4 | Dashboard components |
| Academic Management Engineering | Grade and attendance entities |
| Finance Engineering | Fee and payment entities |
| Communication Engineering | Notification entities |
| Figma Build Roadmap §6.2 Step 1 | Dashboard template |

---

## 15. Pattern Variants

Each base pattern may have data-density variants that adapt the layout to different content volumes and user needs.

### Variant Selection Rules

| Pattern Category | Light Variant | Standard Variant | Dense Variant |
|-----------------|---------------|------------------|---------------|
| **Dashboard** | ≤3 metrics, single column | 4-8 metrics, 2-column | 9+ metrics, grid with tabs |
| **Workspace** | ≤10 items, simple filters | 11-50 items, standard filters | 50+ items, advanced filters + saved views |
| **Form** | ≤4 fields, single section | 5-12 fields, multi-section | 13+ fields, wizard with progress |
| **Reporting** | Single metric, simple chart | 2-4 metrics, multiple charts | 5+ metrics, drill-down dashboard |
| **Communication** | Single thread view | Thread list + detail | Multi-channel with search |
| **Planning** | Single term, simple calendar | Multi-term, calendar + list | Year view with overlays |
| **AI** | Simple suggestion chip | Inline recommendation panel | Full AI assistant sidebar |
| **Authentication** | Single step login | Multi-step with MFA | SSO + device trust |
| **Administration** | Single setting group | Multi-group settings | System-wide admin console |

### Variant Selection Algorithm

```
FUNCTION selectVariant(patternCategory, itemCount, fieldCount, metricCount):
    dataVolume = MAX(itemCount, fieldCount, metricCount)
    
    SWITCH patternCategory:
        CASE "Dashboard":
            IF dataVolume ≤ 3 THEN return "light"
            IF dataVolume ≤ 8 THEN return "standard"
            RETURN "dense"
        
        CASE "Workspace":
            IF dataVolume ≤ 10 THEN return "light"
            IF dataVolume ≤ 50 THEN return "standard"
            RETURN "dense"
        
        CASE "Form":
            IF dataVolume ≤ 4 THEN return "light"
            IF dataVolume ≤ 12 THEN return "standard"
            RETURN "dense"
        
        CASE "Reporting":
            IF dataVolume ≤ 1 THEN return "light"
            IF dataVolume ≤ 4 THEN return "standard"
            RETURN "dense"
        
        DEFAULT:
            IF dataVolume ≤ 3 THEN return "light"
            IF dataVolume ≤ 6 THEN return "standard"
            RETURN "dense"
```

### Variant Override Rules

1. **User preference override**: If the user has explicitly selected a density preference, honour it regardless of data volume
2. **Device override**: On mobile, force "light" variant for Dashboard and Reporting patterns
3. **Role override**: Administrators may default to "dense" variant for any pattern
4. **Accessibility override**: If `prefers-reduced-motion` is active, reduce transition complexity in dense variants

---

## 16. Decision Trees

### Master Decision Tree

```
START: New screen required
│
├─ Is this a first-time setup or configuration?
│  ├─ YES → Authentication or Administration pattern
│  │  ├─ Login/registration flow? → Authentication
│  │  └─ System configuration? → Administration
│  └─ NO → Continue
│
├─ Is this a summary/overview of aggregated data?
│  ├─ YES → Dashboard pattern
│  │  ├─ Role-specific summary? → Role Dashboard
│  │  ├─ Cross-domain overview? → Overview Dashboard
│  │  └─ Real-time monitoring? → Operations Dashboard
│  └─ NO → Continue
│
├─ Does this involve viewing/managing a list of records?
│  ├─ YES → Workspace pattern
│  │  ├─ Simple list with basic filters? → List Workspace
│  │  ├─ Kanban board workflow? → Board Workspace
│  │  ├─ File/document management? → File Workspace
│  │  ├─ Calendar-based view? → Calendar Workspace
│  │  ├─ Relationship management? → Relationship Workspace
│  │  ├─ Activity/event stream? → Activity Workspace
│  │  └─ Data records with CRUD? → Data Workspace
│  └─ NO → Continue
│
├─ Does this involve creating or editing data?
│  ├─ YES → Form pattern
│  │  ├─ Simple ≤4 fields? → Single Form
│  │  ├─ Complex multi-section? → Multi-Section Form
│  │  ├─ Multi-step process? → Wizard Form
│  │  └─ Quick inline edit? → Inline Form
│  └─ NO → Continue
│
├─ Does this involve viewing reports or analytics?
│  ├─ YES → Reporting pattern
│  │  ├─ Single metric KPI? → KPI Card
│  │  ├─ Time-series chart? → Chart Report
│  │  ├─ Data table with sort/filter? → Table Report
│  │  ├─ Visual data representation? → Visual Report
│  │  ├─ Data export? → Export Report
│  │  └─ Comparative analysis? → Comparison Report
│  └─ NO → Continue
│
├─ Does this involve messaging or communication?
│  ├─ YES → Communication pattern
│  │  ├─ Direct messaging? → Messaging Interface
│  │  ├─ Broadcast notification? → Notification Center
│  │  ├─ Discussion thread? → Discussion Forum
│  │  ├─ File sharing with comments? → Shared Workspace
│  │  └─ Public bulletin? → Announcement Board
│  └─ NO → Continue
│
├─ Does this involve scheduling or planning?
│  ├─ YES → Planning pattern
│  │  ├─ Class/course timetable? → Timetable
│  │  ├─ Exam scheduling? → Exam Planner
│  │  ├─ Event management? → Event Planner
│  │  └─ Long-term academic planning? → Academic Planner
│  └─ NO → Continue
│
├─ Does this involve AI-powered features?
│  ├─ YES → AI pattern
│  │  ├─ Contextual suggestion? → AI Suggestion Chip
│  │  ├─ Inline recommendation? → AI Recommendation Panel
│  │  ├─ Conversational assistant? → AI Chat Interface
│  │  └─ Automated workflow? → AI Automation Panel
│  └─ NO → Continue
│
└─ Consult 01 UI Strategy for custom pattern requirements
```

### Workspace Sub-Decision Tree

```
START: Workspace pattern selected
│
├─ Primary interaction is viewing items in sequence?
│  ├─ YES → List Workspace
│  │  ├─ Items have status workflow? → Add status column + filters
│  │  ├─ Items need bulk actions? → Add selection checkboxes
│  │  └─ Items have attachments? → Add file preview column
│  └─ NO → Continue
│
├─ Primary interaction is managing workflow stages?
│  ├─ YES → Board Workspace
│  │  ├─ Fixed stages (e.g., To Do/Done)? → Kanban board
│  │  ├─ Custom stages per user? → Configurable board
│  │  └─ Time-based stages? → Timeline board
│  └─ NO → Continue
│
├─ Primary content is files/documents?
│  ├─ YES → File Workspace
│  │  ├─ Hierarchical folders? → Tree + grid view
│  │  ├─ Flat with tags? → Grid + tag filter
│  │  └─ Version-controlled? → Version history panel
│  └─ NO → Continue
│
├─ Primary content is time-based?
│  ├─ YES → Calendar Workspace
│  │  ├─ Daily/weekly schedule? → Calendar grid
│  │  ├─ Term-level planning? → Term planner
│  │  └─ One-time events? → Event list + map
│  └─ NO → Continue
│
├─ Primary content is people/relationships?
│  ├─ YES → Relationship Workspace
│  │  ├─ Directory listing? → Card grid
│  │  ├─ Organizational chart? → Tree view
│  │  └─ Group management? → Group list + members
│  └─ NO → Continue
│
├─ Primary content is activity stream?
│  ├─ YES → Activity Workspace
│  │  ├─ Real-time feed? → Live activity stream
│  │  ├─ Audit trail? → Filterable log
│  │  └─ Recent actions? → Timeline view
│  └─ NO → Continue
│
└─ Primary content is structured data records?
   └─ YES → Data Workspace
      ├─ ≤10 fields per record? → Table view
      ├─ >10 fields per record? → Table + detail panel
      └─ Records have complex relationships? → Table + relation columns
```

### Dashboard Sub-Decision Tree

```
START: Dashboard pattern selected
│
├─ Who is the primary audience?
│  ├─ Administrator → Admin Dashboard
│  │  ├─ System health focus? → Operations Dashboard
│  │  ├─ Financial overview? → Finance Dashboard
│  │  └─ User management? → IAM Dashboard
│  ├─ Teacher → Teacher Dashboard
│  │  ├─ Class performance focus? → Academic Dashboard
│  │  ├─ Schedule focus? → Schedule Dashboard
│  │  └─ Communication focus? → Communication Dashboard
│  ├─ Student → Student Dashboard
│  │  ├─ Academic progress? → Progress Dashboard
│  │  ├─ Upcoming deadlines? → Deadline Dashboard
│  │  └─ Activity summary? → Activity Dashboard
│  ├─ Parent → Parent Dashboard
│  │  ├─ Multi-child overview? → Family Dashboard
│  │  ├─ Single child focus? → Child Dashboard
│  │  └─ Financial (fees)? → Fee Dashboard
│  └─ Platform Operator → Operator Dashboard
│     ├─ System metrics? → Monitoring Dashboard
│     ├─ Tenant management? → Tenant Dashboard
│     └─ Support tickets? → Support Dashboard
│
├─ How many key metrics?
│  ├─ ≤3 → Light variant (single column)
│  ├─ 4-8 → Standard variant (2-column)
│  └─ 9+ → Dense variant (grid with tabs)
│
└─ Data refresh requirements?
   ├─ Real-time (< 5s) → Live indicator + auto-refresh
   ├─ Near-real-time (5s-60s) → Periodic refresh with timestamp
   └─ On-demand → Manual refresh button
```

### Form Sub-Decision Tree

```
START: Form pattern selected
│
├─ How many fields?
│  ├─ ≤4 → Single Form
│  │  ├─ All fields visible? → Vertical stack
│  │  └─ Fields need grouping? → 2-column with labels
│  └─ Continue
│
├─ 5-12 fields?
│  ├─ YES → Multi-Section Form
│  │  ├─ Fields group logically? → Collapsible sections
│  │  ├─ Fields have dependencies? → Conditional sections
│  │  └─ Fields need validation per section? → Section-level validation
│  └─ Continue
│
├─ 13+ fields?
│  ├─ YES → Wizard Form
│  │  ├─ Linear process? → Step-by-step wizard
│  │  ├─ Non-linear (skip possible)? → Branching wizard
│  │  └─ Long process (> 5 min)? → Save progress + resume
│  └─ Continue
│
└─ Quick edit of existing data?
   └─ YES → Inline Form
      ├─ Single field? → Click-to-edit
      ├─ 2-3 fields? → Popover form
      └─ Related fields? → Expandable row
```

---

## 17. Pattern Governance

### Version Control

| Version | Date | Changes | Approved By |
|---------|------|---------|-------------|
| 1.0 | 2026-07-23 | Initial pattern library with 47 patterns | Documentation Constitution |
| 1.1 | — | (Reserved for variant rules additions) | — |
| 1.2 | — | (Reserved for decision tree expansions) | — |

### Approval Process

1. **New pattern proposal**: Must include problem statement, information hierarchy, content zones, actions, and validation checklist
2. **Review criteria**: Alignment with 01 UI Strategy, consistency with existing patterns, accessibility compliance, responsive behaviour defined
3. **Approval authority**: Documentation Constitution (derives from approved docs only)
4. **Deprecation**: Patterns may be deprecated with 90-day notice and migration guide

### Change Management

| Change Type | Process | Documentation Required |
|------------|---------|----------------------|
| **New pattern** | Propose → Review → Approve → Implement | Full pattern definition (§5-14 format) |
| **Pattern modification** | Propose → Impact analysis → Approve → Implement | Diff against current, rationale |
| **Pattern deprecation** | Propose → Migration plan → Approve → Sunset | Deprecation notice, replacement pattern |
| **Variant addition** | Propose → Validate algorithm → Approve | Variant definition, selection rules |
| **Decision tree update** | Propose → Trace path → Approve | Updated tree diagram |

### Quality Gates

Before a pattern is approved, it must pass:

- [ ] **Completeness check**: All required sections present (§5-14)
- [ ] **Consistency check**: No contradictions with existing patterns
- [ ] **Accessibility check**: WCAG 2.1 AA compliance defined
- [ ] **Responsive check**: All breakpoints addressed
- [ ] **Cross-reference check**: Links to relevant engineering specs and design system docs
- [ ] **Validation checklist**: Pass/fail criteria defined
- [ ] **Anti-patterns documented**: Known failure modes identified

---

## 18. Pattern Examples

### Example 1: Student Dashboard → Dashboard Pattern (Light Variant)

**Pattern ID**: DASH-01-L  
**Real screen**: Student home dashboard  
**Data volume**: 3 metrics (attendance %, pending assignments, next class)  
**Variant rationale**: ≤3 metrics triggers light variant  

**Content mapping**:
- Primary: Attendance percentage (large number + trend arrow)
- Secondary: Pending assignment count, next class name + time
- Supporting: Quick links to timetable, grades, messages

### Example 2: Teacher Class List → Workspace Pattern (List Variant)

**Pattern ID**: WS-LIST-01  
**Real screen**: Teacher's class roster  
**Data volume**: 25-30 students, 5 visible columns  
**Variant rationale**: Standard list with selection for bulk actions  

**Content mapping**:
- Primary: Student name, avatar, ID
- Secondary: Attendance status, last grade, parent contact
- Supporting: Status indicators, action menu per row

### Example 3: Fee Invoice Form → Form Pattern (Multi-Section Variant)

**Pattern ID**: FORM-MS-01  
**Real screen**: Create/edit fee invoice  
**Data volume**: 8 fields across 3 sections  
**Variant rationale**: 5-12 fields triggers multi-section  

**Content mapping**:
- Section 1: Student selection, fee type, amount
- Section 2: Due date, payment terms, late fee policy
- Section 3: Notes, attachment upload

### Example 4: Attendance Report → Reporting Pattern (Chart Variant)

**Pattern ID**: RPT-CHART-01  
**Real screen**: Class attendance over time  
**Data volume**: 3 metrics (daily %, weekly avg, trend)  
**Variant rationale**: Standard variant with time-series chart  

**Content mapping**:
- Primary: Line chart (attendance % over 30 days)
- Secondary: KPI cards (today, this week, this term)
- Supporting: Class selector, date range picker, export button

### Example 5: Parent-Teacher Messaging → Communication Pattern (Messaging Variant)

**Pattern ID**: COM-MSG-01  
**Real screen**: Parent-teacher chat  
**Data volume**: Single thread, 2 participants  
**Variant rationale**: Simple messaging interface  

**Content mapping**:
- Primary: Message thread (chronological)
- Secondary: Participant info sidebar (student context)
- Supporting: Attachment upload, read receipts, typing indicator

### Example 6: Exam Timetable → Planning Pattern (Timetable Variant)

**Pattern ID**: PLAN-TT-01  
**Real screen**: Exam schedule for term  
**Data volume**: 12 exams across 2 weeks  
**Variant rationale**: Calendar-based planning view  

**Content mapping**:
- Primary: Calendar grid with exam blocks
- Secondary: Exam details panel (subject, room, duration)
- Supporting: Conflict checker, print/export, student-specific view

### Example 7: AI Study Suggestions → AI Pattern (Suggestion Chip Variant)

**Pattern ID**: AI-SUGGEST-01  
**Real screen**: Personalized study recommendations  
**Data volume**: 3-5 suggestions  
**Variant rationale**: Lightweight AI interaction  

**Content mapping**:
- Primary: Suggestion chips (topic + confidence %)
- Secondary: Explanation panel (why recommended)
- Supporting: Action buttons (start practice, view resource, dismiss)

### Example 8: Admin User Management → Administration Pattern (Admin Console Variant)

**Pattern ID**: ADMIN-CONSOLE-01  
**Real screen**: Platform user administration  
**Data volume**: 500+ users, 8 filter options  
**Variant rationale**: Dense variant for administrator workflow  

**Content mapping**:
- Primary: User table with advanced filters
- Secondary: User detail drawer (profile, roles, activity)
- Supporting: Bulk actions, import/export, role assignment

### Example 9: Student Progress Dashboard → Dashboard Pattern (Standard Variant)

**Pattern ID**: DASH-02-S  
**Real screen**: Student academic progress overview  
**Data volume**: 6 metrics (GPA, attendance, assignments, grades trend, upcoming exams, class rank)  
**Variant rationale**: 4-8 metrics triggers standard 2-column variant  

**Content mapping**:
- Left column: GPA card, attendance card, assignment status
- Right column: Grade trend chart, upcoming exams list, class rank
- Footer: Quick action buttons (view report card, contact teacher, view timetable)

### Example 10: Class Timetable → Planning Pattern (Timetable Variant)

**Pattern ID**: PLAN-TT-02  
**Real screen**: Weekly class schedule  
**Data volume**: 35 time slots (7 periods × 5 days)  
**Variant rationale**: Dense timetable with colour-coded subjects  

**Content mapping**:
- Primary: Weekly grid (periods × days) with subject blocks
- Secondary: Teacher name, room number per block
- Supporting: Current period highlight, today indicator, print view

---

## 19. Documentation Standards

### Language Requirements

This document uses RFC 2119 terminology:

| Term | Meaning |
|------|---------|
| **MUST** | Absolute requirement, non-negotiable |
| **MUST NOT** | Absolute prohibition |
| **SHOULD** | Recommended, may deviate with documented rationale |
| **MAY** | Optional, at implementer's discretion |

### Pattern Definition Format

Every pattern MUST include the following sections in order:

1. **Pattern ID** (§5 format)
2. **Purpose** — one sentence describing what this pattern solves
3. **Problem Statement** — the specific problem this pattern addresses
4. **Typical Users** — which personas use this pattern
5. **Business Goal** — organizational objective served
6. **User Goal** — what the user achieves
7. **Information Hierarchy** — primary → secondary → supporting content
8. **Primary Content Zone** — main content with field count, grouping, layout
9. **Secondary Content Zone** — supporting information placement
10. **Supporting Content Zone** — contextual help, metadata
11. **Actions** — primary, secondary, destructive actions
12. **Navigation** — breadcrumbs, back actions, next steps
13. **Workflows** — creation, editing, approval flows
14. **Complexity Level** — simple / moderate / complex
15. **Content Density** — comfortable / standard / compact
16. **Interactions** — click, hover, drag, keyboard shortcuts
17. **Data Characteristics** — creation, reads, updates, deletions
18. **Permission Requirements** — role-based access
19. **Accessibility Considerations** — WCAG compliance details
20. **Responsive Behaviour** — breakpoint-specific layouts
21. **AI Interaction Opportunities** — where AI can enhance
22. **Common Mistakes** — known implementation errors
23. **Anti-Patterns** — conflicting patterns with rationale
24. **Validation Checklist** — pass/fail criteria
25. **Cross-References** — links to engineering specs and design docs

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Pattern ID | `{CATEGORY}-{TYPE}-{NUMBER}` | `WS-LIST-01` |
| Category prefix | 3-4 uppercase letters | `DASH`, `WS`, `FORM`, `RPT`, `COM`, `PLAN`, `AI`, `AUTH`, `ADMIN` |
| Type descriptor | Descriptive uppercase | `LIST`, `BOARD`, `FILE`, `CAL`, `REL`, `ACT`, `DATA` |
| Variant suffix | `-L` (light), `-S` (standard), `-D` (dense) | `DASH-01-L` |

---

## 20. Appendix A — Pattern ID Registry

| Pattern ID | Category | Type | Variant | Description |
|-----------|----------|------|---------|-------------|
| DASH-01 | Dashboard | Overview | L/S/D | Role-specific summary dashboard |
| DASH-02 | Dashboard | Progress | L/S/D | Academic progress tracking |
| DASH-03 | Dashboard | Operations | L/S/D | System health monitoring |
| DASH-04 | Dashboard | Finance | L/S/D | Financial overview |
| DASH-05 | Dashboard | Family | L/S/D | Parent multi-child view |
| DASH-06 | Dashboard | Activity | L/S/D | Activity stream summary |
| DASH-07 | Dashboard | Monitoring | L/S/D | Real-time operations |
| WS-LIST-01 | Workspace | List | L/S/D | Standard list with filters |
| WS-BOARD-01 | Workspace | Board | L/S/D | Kanban workflow board |
| WS-FILE-01 | Workspace | File | L/S/D | File/document management |
| WS-CAL-01 | Workspace | Calendar | L/S/D | Calendar-based view |
| WS-REL-01 | Workspace | Relationship | L/S/D | People/relationship management |
| WS-ACT-01 | Workspace | Activity | L/S/D | Activity/event stream |
| WS-DATA-01 | Workspace | Data | L/S/D | CRUD data records |
| FORM-SINGLE-01 | Form | Single | — | ≤4 fields, single section |
| FORM-MS-01 | Form | Multi-Section | — | 5-12 fields, grouped sections |
| FORM-WIZARD-01 | Form | Wizard | — | 13+ fields, step-by-step |
| FORM-INLINE-01 | Form | Inline | — | Quick edit, click-to-edit |
| RPT-KPI-01 | Reporting | KPI Card | — | Single metric display |
| RPT-CHART-01 | Reporting | Chart | — | Time-series visualization |
| RPT-TABLE-01 | Reporting | Table | — | Data table with sort/filter |
| RPT-VISUAL-01 | Reporting | Visual | — | Gauge, heatmap, treemap |
| RPT-EXPORT-01 | Reporting | Export | — | CSV/PDF/data export |
| RPT-COMPARE-01 | Reporting | Comparison | — | Side-by-side analysis |
| COM-MSG-01 | Communication | Messaging | — | Direct messaging interface |
| COM-NOTIF-01 | Communication | Notification | — | Notification center |
| COM-FORUM-01 | Communication | Forum | — | Discussion thread |
| COM-SHARE-01 | Communication | Shared | — | File sharing with comments |
| COM-ANNOUNCE-01 | Communication | Announcement | — | Public bulletin board |
| PLAN-TT-01 | Planning | Timetable | — | Class/course schedule |
| PLAN-EXAM-01 | Planning | Exam | — | Exam scheduling |
| PLAN-EVENT-01 | Planning | Event | — | Event management |
| PLAN-ACADEMIC-01 | Planning | Academic | — | Long-term academic planning |
| AI-SUGGEST-01 | AI | Suggestion | — | Contextual suggestion chip |
| AI-RECOMMEND-01 | AI | Recommendation | — | Inline recommendation panel |
| AI-CHAT-01 | AI | Chat | — | Conversational assistant |
| AI-AUTO-01 | AI | Automation | — | Automated workflow panel |
| AUTH-LOGIN-01 | Auth | Login | — | Single sign-on |
| AUTH-MFA-01 | Auth | MFA | — | Multi-factor authentication |
| AUTH-REGISTER-01 | Auth | Register | — | Account creation |
| AUTH-RESET-01 | Auth | Reset | — | Password recovery |
| AUTH-SSO-01 | Auth | SSO | — | Single sign-on integration |
| ADMIN-SETTINGS-01 | Admin | Settings | — | System configuration |
| ADMIN-USERS-01 | Admin | Users | — | User administration |
| ADMIN-ROLES-01 | Admin | Roles | — | Role/permission management |
| ADMIN-LOGS-01 | Admin | Logs | — | Audit log viewer |
| ADMIN-CONFIG-01 | Admin | Config | — | System-wide configuration |

---

## 21. Appendix B — Cross-Reference Index

### Pattern to Engineering Spec Mapping

| Pattern ID | Engineering Spec | Key Entities |
|-----------|-----------------|--------------|
| DASH-01 to DASH-07 | Multiple (role-dependent) | Aggregated from all domains |
| WS-LIST-01 | Academic Management | Student, Class, Enrollment |
| WS-BOARD-01 | Academic Management | Assignment, Submission |
| WS-FILE-01 | Document & Learning Management | Document, Folder, Version |
| WS-CAL-01 | Academic Management | Schedule, Event, Term |
| WS-REL-01 | People Management | Person, Relationship, Group |
| WS-ACT-01 | Cross-Domain Integration | Activity, Audit, Event |
| WS-DATA-01 | Multiple (domain-dependent) | Varies by context |
| FORM-SINGLE-01 | Multiple | Varies by entity |
| FORM-MS-01 | Finance Management | Invoice, Payment, Fee |
| FORM-WIZARD-01 | Institution Management | Setup, Configuration |
| FORM-INLINE-01 | Academic Management | Grade, Attendance |
| RPT-KPI-01 | Reporting & Analytics | Metric, KPI |
| RPT-CHART-01 | Reporting & Analytics | TimeSeries, DataPoint |
| RPT-TABLE-01 | Reporting & Analytics | Record, Column, Filter |
| RPT-VISUAL-01 | Reporting & Analytics | Visual, Gauge, Heatmap |
| RPT-EXPORT-01 | Reporting & Analytics | Export, Format |
| RPT-COMPARE-01 | Reporting & Analytics | Comparison, Benchmark |
| COM-MSG-01 | Communication | Message, Thread, Participant |
| COM-NOTIF-01 | Communication | Notification, Preference |
| COM-FORUM-01 | Communication | Thread, Post, Reply |
| COM-SHARE-01 | Document & Learning Management | SharedFile, Comment |
| COM-ANNOUNCE-01 | Communication | Announcement, Audience |
| PLAN-TT-01 | Academic Management | Timetable, Period, Class |
| PLAN-EXAM-01 | Academic Management | Exam, Room, Invigilator |
| PLAN-EVENT-01 | Operations Management | Event, Venue, Attendee |
| PLAN-ACADEMIC-01 | Academic Management | Term, Year, Plan |
| AI-SUGGEST-01 | Platform Administration | Suggestion, Model, Confidence |
| AI-RECOMMEND-01 | Platform Administration | Recommendation, Context |
| AI-CHAT-01 | Platform Administration | Conversation, Message, Intent |
| AI-AUTO-01 | Platform Administration | Workflow, Trigger, Action |
| AUTH-LOGIN-01 | Identity & Access Management | User, Session, Token |
| AUTH-MFA-01 | Identity & Access Management | MFA Factor, Verification |
| AUTH-REGISTER-01 | Identity & Access Management | User, Profile, Invitation |
| AUTH-RESET-01 | Identity & Access Management | ResetToken, Password |
| AUTH-SSO-01 | Identity & Access Management | SSO Provider, SAML, OAuth |
| ADMIN-SETTINGS-01 | Platform Administration | Setting, Category, Value |
| ADMIN-USERS-01 | Identity & Access Management | User, Role, Status |
| ADMIN-ROLES-01 | Identity & Access Management | Role, Permission, Scope |
| ADMIN-LOGS-01 | Platform Administration | AuditLog, Event, Timestamp |
| ADMIN-CONFIG-01 | Platform Administration | Config, Key, Environment |

### Pattern to Design System Mapping

| Pattern ID | Design System Reference | Components Used |
|-----------|------------------------|-----------------|
| All Dashboard patterns | 02 Design System §3.4 | MetricCard, ChartWidget, ActivityFeed |
| All Workspace patterns | 02 Design System §3.2 | DataTable, FilterBar, SearchInput |
| All Form patterns | 02 Design System §3.3 | TextField, Select, Checkbox, DatePicker |
| All Reporting patterns | 02 Design System §3.4 | Chart, Table, KPI, ExportButton |
| All Communication patterns | 02 Design System §3.5 | MessageThread, NotificationBadge, Input |
| All Planning patterns | 02 Design System §3.6 | Calendar, TimeSlot, EventCard |
| All AI patterns | 02 Design System §3.7 | SuggestionChip, ChatBubble, Panel |
| All Auth patterns | 02 Design System §3.1 | Input, Button, Checkbox, Alert |
| All Admin patterns | 02 Design System §3.8 | SettingsGroup, Table, Toggle, Drawer |

### Pattern to Figma Build Roadmap Mapping

| Pattern ID | Roadmap Phase | Build Priority |
|-----------|--------------|----------------|
| DASH-01 to DASH-07 | Phase 2 (Core Components) | High |
| WS-LIST-01 | Phase 3 (Page Templates) | High |
| WS-BOARD-01 | Phase 3 (Page Templates) | Medium |
| FORM-SINGLE-01 | Phase 2 (Core Components) | High |
| FORM-MS-01 | Phase 3 (Page Templates) | High |
| RPT-KPI-01 | Phase 2 (Core Components) | High |
| RPT-CHART-01 | Phase 3 (Page Templates) | High |
| COM-MSG-01 | Phase 4 (Advanced Patterns) | Medium |
| PLAN-TT-01 | Phase 4 (Advanced Patterns) | High |
| AI-SUGGEST-01 | Phase 7 (AI Features) | Low |
| AUTH-LOGIN-01 | Phase 1 (Foundation) | Critical |
| ADMIN-USERS-01 | Phase 5 (Domain Screens) | High |

---

*Document version: 1.0*  
*Last updated: 2026-07-23*  
*Total patterns: 47*  
*Pattern categories: 9*  
*Decision trees: 4*  
*Pattern examples: 10*
