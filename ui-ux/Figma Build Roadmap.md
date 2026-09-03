# OpenSchool ERP

## Figma Build Roadmap

---

| Field | Value |
|-------|-------|
| **Document** | Figma Build Roadmap |
| **Version** | 1.0 |
| **Status** | Approved |
| **Date** | July 2026 |
| **Classification** | Internal |
| **Author** | Architecture Team |
| **Owner** | Solution Architect |

---

| Aspect | Detail |
|--------|--------|
| **Purpose** | Dependency-driven execution roadmap for building the complete OpenSchool ERP Figma project |
| **Scope** | All Figma workspace setup, tokens, components, templates, screens, prototypes, QA, and handoff |
| **Governing Documents** | Documentation Constitution, Design System & Component Library, Figma Standards & Design QA, UI Strategy & Design Direction |
| **Derived From** | Approved Design System, Figma Standards, UI Strategy, Engineering Specifications, Architecture Documentation |

---

| Aspect | Detail |
|--------|--------|
| **Not a design document** | Defines build order, not design decisions |
| **Not a project timeline** | Defines dependencies, not calendar dates |
| **Not a specification** | References approved specifications, does not duplicate them |

---

## Table of Contents

1. Build Philosophy
2. Phase 1 — Foundation
3. Phase 2 — Primitive Components
4. Phase 3 — Composite Components
5. Phase 4 — Pattern Components
6. Phase 5 — Layout Templates
7. Phase 6 — Module Screen Design
8. Phase 7 — Prototype Assembly
9. Phase 8 — Design QA
10. Phase 9 — Developer Handoff
11. AI Workflow
12. Success Criteria
13. Dependency Map

---

# 1. Build Philosophy

---

## 1.1 Why This Order

The Figma build follows a strict dependency chain:

```
Foundation → Primitives → Composites → Patterns → Templates → Screens → Prototypes → QA → Handoff
```

Every later asset depends only on assets that have already been created. This eliminates rework caused by changing foundational elements after dependent assets exist.

---

## 1.2 Core Principles

| Principle | Description |
|-----------|-------------|
| **Smallest first** | Build atoms before molecules; molecules before organisms |
| **Maximise reuse** | Every later asset assembles existing assets, never recreates them |
| **Minimise duplication** | One source of truth for every token, component, and pattern |
| **Dependency satisfaction** | Never begin later work until all prerequisites are complete |
| **Incremental review** | Each phase produces reviewable artifacts before the next begins |
| **Pause and resume** | Any phase can be paused without losing context or breaking dependencies |

---

## 1.3 Build Layers

| Layer | What It Produces | Depends On |
|-------|------------------|------------|
| **Foundation** | Workspace, tokens, libraries | Nothing |
| **Primitives** | Atomic components | Foundation |
| **Composites** | Combined components | Primitives |
| **Patterns** | Reusable interface patterns | Composites |
| **Templates** | Structural page templates | Patterns |
| **Screens** | Module-specific screens | Templates |
| **Prototypes** | Interactive flows | Screens |
| **QA** | Validation reports | All layers |
| **Handoff** | Developer-ready packages | QA |

---

## 1.4 Rework Prevention

| Cause of Rework | How This Roadmap Prevents It |
|-----------------|------------------------------|
| Token values change after components use them | Foundation is built and validated before any components |
| Component API changes after composites depend on it | Primitives are stable before composites are built |
| Layout changes after screens use templates | Templates are validated before screens are built |
| Naming conventions change mid-project | Naming is established in Foundation and enforced throughout |
| New requirements emerge mid-build | Each phase is reviewable before the next begins |

---

# 2. Phase 1 — Foundation

---

## 2.1 Objective

Create the complete Figma workspace with all design tokens, variable libraries, and publishing infrastructure. No components are built in this phase.

---

## 2.2 Build Order

| Step | Deliverable | Reference |
|------|-------------|-----------|
| 1 | Figma team workspace created | 03 doc §1.2 |
| 2 | Design System file created (`DS - OpenSchool`) | 03 doc §1.1 |
| 3 | Page structure created (Tokens, Components, Patterns, Icons) | 03 doc §1.3 |
| 4 | Section organisation within each page | 03 doc §1.4 |
| 5 | Naming conventions applied | 03 doc §1.5 |
| 6 | Colour variable collection — Brand | 02 doc §1.2, §1.13.1 |
| 7 | Colour variable collection — Semantic | 02 doc §1.2, §1.13.1 |
| 8 | Colour variable collection — Neutral | 02 doc §1.2, §1.13.1 |
| 9 | Light mode values applied to all colour variables | 02 doc §1.13.1 |
| 10 | Typography variable collection — Font family | 02 doc §1.3 |
| 11 | Typography variable collection — Font size | 02 doc §1.3 |
| 12 | Typography variable collection — Font weight | 02 doc §1.3 |
| 13 | Typography variable collection — Line height | 02 doc §1.3 |
| 14 | Spacing variable collection — Spacing scale | 02 doc §1.4 |
| 15 | Spacing variable collection — Density modes | 02 doc §1.4, §1.14 |
| 16 | Radius variable collection | 02 doc §1.7 |
| 17 | Border variable collection — Width | 02 doc §1.8 |
| 18 | Border variable collection — Colour | 02 doc §1.8 |
| 19 | Elevation variable collection — Shadows | 02 doc §1.9 |
| 20 | Elevation variable collection — Z-index levels | 02 doc §1.11 |
| 21 | Blur variable collection | 02 doc §1.10 |
| 22 | Opacity variable collection | 02 doc §1.10 |
| 23 | Motion variable collection — Duration | 02 doc §1.13 |
| 24 | Motion variable collection — Easing | 02 doc §1.13 |
| 25 | Breakpoint variable collection | 02 doc §1.12 |
| 26 | Grid styles (12-col, 8-col, 4-col) | 02 doc §1.5 |
| 27 | Effect styles (shadow-sm, shadow-md, shadow-lg, shadow-xl) | 02 doc §1.9 |
| 28 | Text styles (all type scale tokens) | 02 doc §1.3 |
| 29 | Icon library placeholder page | 03 doc §2.12 |
| 30 | Illustration library placeholder page | 03 doc §2.13 |
| 31 | Library publishing configuration | 03 doc §2.9 |
| 32 | Library versioning setup | 03 doc §2.10 |

---

## 2.3 Variable Collection Summary

| Collection | Variables | Modes |
|------------|-----------|-------|
| **Brand Colour** | 4 (primary, primary-light, primary-dark, primary-subtle) | Light, Dark |
| **Semantic Colour** | 12 (success × 3, warning × 3, error × 3, info × 3) | Light, Dark |
| **Neutral Colour** | 11 (gray-50 through gray-900, white) | Light, Dark |
| **Font Family** | 2 (heading, body) | — |
| **Font Size** | 13 tokens (display-lg through button-sm) | — |
| **Font Weight** | 4 (regular, medium, semibold, bold) | — |
| **Line Height** | 13 tokens (matching font size scale) | — |
| **Spacing** | 7 (xs, sm, md, lg, xl, 2xl, 3xl) | Comfortable, Compact |
| **Radius** | 6 (none, sm, md, lg, xl, full) | — |
| **Border Width** | 2 (sm, md) | — |
| **Border Colour** | 3 (default, strong, focus) | Light, Dark |
| **Shadow/Elevation** | 4 (sm, md, lg, xl) | — |
| **Z-Index** | 7 (base, dropdown, sticky, overlay, modal, toast, tooltip) | — |
| **Blur** | 3 (sm, md, lg) | — |
| **Opacity** | 3 (disabled, hover, overlay) | — |
| **Motion Duration** | 4 (fast, normal, slow, slower) | — |
| **Motion Easing** | 4 (default, in, out, in-out) | — |
| **Breakpoint** | 4 (mobile, tablet, desktop, wide) | — |

---

## 2.4 Validation Checkpoint

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| All variable collections created | 18 collections present | |
| All variables have correct values | Values match 02 doc tables | |
| Light mode correctly applied | All light mode values correct | |
| Naming conventions followed | Hierarchical `/` naming used | |
| Grid styles created | 3 breakpoint-specific grids | |
| Effect styles created | 4 shadow levels | |
| Text styles created | 13 type scale styles | |
| Library publishable | DS file appears in team library | |
| Variable modes functional | Light/Dark mode switching works | |
| No hard-coded values | All values use variables | |

---

## 2.5 Known Gaps

| Gap | Impact | Resolution |
|-----|--------|------------|
| Dark mode hex values not approved | Cannot complete Dark mode values | Build with Light mode; add Dark when approved |
| Specific brand colour hex not finalised | Primary colour may shift | Mark primary as provisional; update when approved |

---

# 3. Phase 2 — Primitive Components

---

## 3.1 Objective

Build all atomic components that composites, patterns, and templates will assemble from. Each primitive is self-contained and uses only Foundation tokens.

---

## 3.2 Build Order

| Step | Component | Category | Dependencies | Variants | States |
|------|-----------|----------|--------------|----------|--------|
| 1 | **Icon** | Display | Foundation tokens | size (sm, md, lg) | — |
| 2 | **Button** | Action | Icon, Foundation tokens | variant (primary, secondary, ghost, danger), size (sm, md, lg) | default, hover, active, disabled, loading |
| 3 | **Icon Button** | Action | Icon, Foundation tokens | variant, size | default, hover, active, disabled |
| 4 | **Link** | Action | Foundation tokens | variant (inline, standalone) | default, hover, active, disabled |
| 5 | **Text Field** | Input | Foundation tokens | variant (default, error, disabled), size (sm, md, lg) | default, focus, error, disabled |
| 6 | **Select** | Input | Foundation tokens | variant, size | default, focus, error, disabled, open |
| 7 | **Checkbox** | Input | Foundation tokens | size (sm, md) | unchecked, checked, indeterminate, disabled |
| 8 | **Radio** | Input | Foundation tokens | size (sm, md) | unselected, selected, disabled |
| 9 | **Switch** | Input | Foundation tokens | size (sm, md) | off, on, disabled |
| 10 | **Date Picker** | Input | Text Field, Foundation tokens | — | default, focus, error, disabled |
| 11 | **Badge** | Display | Foundation tokens | variant (neutral, success, warning, error, info), size (sm, md) | — |
| 12 | **Avatar** | Display | Foundation tokens | size (xs, sm, md, lg, xl), variant (image, initials, icon) | — |
| 13 | **Tag** | Display | Foundation tokens | variant | default, removable |
| 14 | **Separator** | Display | Foundation tokens | orientation (horizontal, vertical) | — |
| 15 | **Tooltip** | Display | Foundation tokens | position (top, bottom, left, right) | visible |
| 16 | **Alert** | Feedback | Icon, Foundation tokens | variant (info, success, warning, error) | — |
| 17 | **Toast** | Feedback | Icon, Button, Foundation tokens | variant, position (top-right, bottom-right) | visible, dismissing |
| 18 | **Progress** | Feedback | Foundation tokens | variant (linear, circular), size | indeterminate, determinate |
| 19 | **Spinner** | Feedback | Foundation tokens | size (sm, md, lg) | — |
| 20 | **Container** | Layout | Foundation tokens | — | — |
| 21 | **Stack** | Layout | Foundation tokens | direction (horizontal, vertical) | — |
| 22 | **Grid** | Layout | Foundation tokens | columns | — |
| 23 | **Divider** | Layout | Foundation tokens | orientation | — |

---

## 3.3 Build Rules

| Rule | Description |
|------|-------------|
| **Tokens only** | Every primitive uses only Foundation variables, never hard-coded values |
| **Auto Layout** | Every primitive uses Auto Layout per 03 doc §3.4 |
| **All states** | Every interactive primitive includes all states from 02 doc §3.6 |
| **Accessible** | Every primitive meets WCAG 2.1 AA per 02 doc §5.2 |
| **Named correctly** | Every component follows `category/name-variant` naming per 02 doc §6.1 |
| **Component Set** | Multi-variant primitives use Component Sets per 03 doc §3.1 |
| **Documentation** | Each component has description, usage, props, do/don't per 02 doc §6.6 |

---

## 3.4 Validation Checkpoint

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| All 23 primitives created | Complete component inventory | |
| All variants present | Per 02 doc specification | |
| All states present | Per 02 doc §3.6 state matrix | |
| Auto Layout applied | All primitives use Auto Layout | |
| Variables used | Zero hard-coded values | |
| Naming compliant | Follows naming conventions | |
| Documentation complete | Each component documented | |
| Library publishable | Components appear in library | |

---

# 4. Phase 3 — Composite Components

---

## 4.1 Objective

Build combined components by assembling existing primitives. Composites never create new atoms; they compose what already exists.

---

## 4.2 Build Order

| Step | Composite | Primitives Used | Dependencies |
|------|-----------|-----------------|--------------|
| 1 | **Form Field** | Text Field + Badge (label) | Step 5 (Text Field), Step 11 (Badge) |
| 2 | **Select Field** | Select + Badge (label) | Step 6 (Select), Step 11 (Badge) |
| 3 | **Date Field** | Date Picker + Badge (label) | Step 10 (Date Picker), Step 11 (Badge) |
| 4 | **Search Field** | Text Field + Button + Icon | Step 2 (Button), Step 5 (Text Field), Step 1 (Icon) |
| 5 | **File Upload** | Text Field + Button + Icon | Step 2 (Button), Step 5 (Text Field), Step 1 (Icon) |
| 6 | **Pagination** | Button + Text + Select | Step 2 (Button), Step 6 (Select) |
| 7 | **Breadcrumb** | Link + Separator + Icon | Step 3 (Link), Step 14 (Separator), Step 1 (Icon) |
| 8 | **Status Badge** | Badge + Icon | Step 11 (Badge), Step 1 (Icon) |
| 9 | **Avatar Group** | Avatar + Badge | Step 12 (Avatar), Step 11 (Badge) |
| 10 | **Action Bar** | Button + Separator | Step 2 (Button), Step 14 (Separator) |

---

## 4.3 Build Rules

| Rule | Description |
|------|-------------|
| **Assemble, never duplicate** | Every composite uses only instances of existing primitives |
| **Consistent spacing** | Use spacing tokens between composed elements |
| **Accessible composition** | Maintain keyboard navigation and ARIA attributes |
| **Responsive behaviour** | Composites adapt to container width |
| **All states** | Composites handle all relevant state combinations |

---

## 4.4 Validation Checkpoint

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| All 10 composites created | Complete inventory | |
| All instances are library instances | No detached or manual components | |
| Primitives reused correctly | No duplicate atoms | |
| Auto Layout applied | All composites use Auto Layout | |
| Variables used throughout | No hard-coded values | |
| Documentation complete | Props, usage, examples documented | |

---

# 5. Phase 4 — Pattern Components

---

## 5.1 Objective

Build reusable interface patterns that assemble composites into common UI structures. Patterns are the building blocks for templates.

---

## 5.2 Build Order

| Step | Pattern | Composites Used | Dependencies |
|------|---------|-----------------|--------------|
| 1 | **Media Object** | Avatar + Badge + Button | Step 8 (Status Badge), Step 9 (Avatar Group), Step 2 (Button) |
| 2 | **Stat Card** | Badge + Icon + Container | Step 8 (Status Badge), Step 1 (Icon) |
| 3 | **Filter Panel** | Search Field + Select Field + Checkbox | Step 4 (Search Field), Step 2 (Select Field), Step 8 (Checkbox) |
| 4 | **Form Layout** | Form Field + Action Bar | Step 1 (Form Field), Step 10 (Action Bar) |
| 5 | **Card Grid** | Container + Pagination | Step 6 (Pagination) |
| 6 | **Detail View** | Breadcrumb + Action Bar + Container | Step 7 (Breadcrumb), Step 10 (Action Bar) |
| 7 | **Data Table** | Table + Pagination + Filter Panel + Action Bar | Step 4 (Filter Panel), Step 6 (Pagination), Step 10 (Action Bar) |

---

## 5.3 Build Rules

| Rule | Description |
|------|-------------|
| **Assemble composites** | Patterns compose existing composites only |
| **Responsive** | Patterns reflow at defined breakpoints |
| **Accessible** | Maintain keyboard navigation and screen reader support |
| **Stateful** | Patterns include loading, empty, error, and populated states |

---

## 5.4 Validation Checkpoint

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| All 7 patterns created | Complete inventory | |
| All composites are instances | No detached or manual components | |
| Responsive behaviour correct | Patterns reflow at breakpoints | |
| All states included | Loading, empty, error, populated | |
| Variables used | No hard-coded values | |
| Documentation complete | Usage, composition, states documented | |

---

# 6. Phase 5 — Layout Templates

---

## 6.1 Objective

Build structural page templates that define layout composition without module-specific content. Templates are applied in Phase 6 to create module screens.

---

## 6.2 Build Order

| Step | Template | Patterns Used | Reference |
|------|----------|---------------|-----------|
| 1 | **Dashboard** | Stat Card + Card Grid + Media Object | 02 doc §2.15 |
| 2 | **CRUD List** | Data Table + Filter Panel + Pagination | 02 doc §2.15 |
| 3 | **Detail View** | Detail View + Form Layout | 02 doc §2.15 |
| 4 | **Wizard** | Form Layout + Action Bar + Badge (step indicator) | 02 doc §2.15 |
| 5 | **Settings** | Tabs + Form Layout + Action Bar | 02 doc §2.15 |
| 6 | **Analytics** | Stat Card + Card Grid + Filter Panel | 02 doc §2.15 |
| 7 | **Calendar** | Card Grid + Badge + Button | 02 doc §2.15 |
| 8 | **Profile** | Avatar + Form Layout + Badge | 02 doc §2.15 |
| 9 | **Report** | Stat Card + Data Table + Filter Panel | 02 doc §2.15 |
| 10 | **Workspace Landing** | Media Object + Stat Card + Card Grid | 02 doc §2.15 |
| 11 | **Empty State** | Icon + Button + Badge | 02 doc §2.15 |
| 12 | **Error Page** | Icon + Button + Badge | 02 doc §2.15 |

---

## 6.3 Template Specifications

Each template must include:

| Requirement | Description |
|-------------|-------------|
| **Desktop layout** | 12-column grid composition |
| **Tablet layout** | 8-column grid composition |
| **Mobile layout** | 4-column grid composition |
| **Responsive rules** | How elements reflow at each breakpoint |
| **Content zones** | Named regions for content insertion |
| **Slot definitions** | Where module-specific content is placed |

---

## 6.4 Validation Checkpoint

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| All 12 templates created | Complete inventory | |
| Responsive at all breakpoints | Desktop, tablet, mobile | |
| All patterns are instances | No manual recreation | |
| Content zones clearly defined | Slots documented | |
| Variables used throughout | No hard-coded values | |
| Templates follow layout system | Per 02 doc §1.5, §1.6 | |

---

# 7. Phase 6 — Module Screen Design

---

## 7.1 Objective

Design module-specific screens by applying layout templates to engineering domain requirements. This is the largest phase and is sequenced by cross-domain dependencies.

---

## 7.2 Module Priority Order

The order below follows the engineering dependency graph. Modules with no downstream dependencies are built first, ensuring that shared components and patterns are validated before dependent modules consume them.

```
Layer 0:  Identity & Access (dependency of all modules)
Layer 1:  Institution Management (dependency of all modules)
Layer 2:  People (dependency of Academic, Finance, Communication)
Layer 3:  Academic Management (dependency of Finance, Operations)
Layer 3:  Finance (standalone, publishes events)
Layer 3:  Communication (consumed by all, no entity data)
Layer 4:  Operations (depends on Academic, Documents & Learning)
Layer 4:  Documents & Learning (depends on Operations)
Layer 5:  Reporting & Analytics (reads from all domains)
Layer 5:  Platform Administration (manages the platform)
```

---

## 7.3 Screen Design Order

| Step | Module | Layer | Key Screens | Template(s) |
|------|--------|-------|-------------|-------------|
| 1 | **Authentication** | 0 | Login, Register, Forgot Password, MFA | Auth Layout |
| 2 | **Institution Management** | 1 | Institution List, Institution Detail, Department List, Academic Structure, Branding | CRUD List, Detail View, Settings |
| 3 | **Identity & Access** | 0 | User List, Role Management, Permission Matrix, Tenant Settings | CRUD List, Detail View, Settings |
| 4 | **Dashboard** | — | Overview Dashboard, Role-based Dashboards | Dashboard |
| 5 | **People — Students** | 2 | Student List, Student Profile, Admission Form, Student Detail | CRUD List, Profile, Wizard, Detail View |
| 6 | **People — Staff** | 2 | Staff List, Staff Profile, Staff Detail | CRUD List, Profile, Detail View |
| 7 | **People — Parents** | 2 | Parent List, Parent Detail, Guardian Linking | CRUD List, Detail View |
| 8 | **Academic Management** | 3 | Session List, Term List, Class List, Subject List, Enrollment, Grading, Report Cards, Timetable | CRUD List, Detail View, Wizard |
| 9 | **Attendance** | 3 | Daily Attendance, Attendance Report, Attendance Calendar | CRUD List, Calendar, Report |
| 10 | **Assessments** | 3 | Assessment List, Grade Book, Exam Schedule | CRUD List, Detail View, Calendar |
| 11 | **Finance** | 3 | Fee Structure, Billing, Invoice List, Payment History, Scholarships, Accounting | CRUD List, Detail View, Wizard |
| 12 | **Admissions** | 3 | Application List, Application Detail, Admission Wizard, Enrollment | CRUD List, Detail View, Wizard |
| 13 | **Communication** | 3 | Notification List, Message Centre, Template Manager, Announcement Creator | CRUD List, Detail View, Wizard |
| 14 | **Operations — Library** | 4 | Book Catalogue, Lending Records, Fines | CRUD List, Detail View |
| 15 | **Operations — Hostel** | 4 | Room List, Allocation, Check-in/Check-out | CRUD List, Detail View |
| 16 | **Operations — Transport** | 4 | Route List, Vehicle List, Driver Assignments | CRUD List, Detail View |
| 17 | **Operations — Clinic** | 4 | Health Records, Visit Log, Medication Tracking | CRUD List, Detail View |
| 18 | **Operations — Visitor** | 4 | Visitor Log, Check-in/out | CRUD List |
| 19 | **Operations — Assets & Inventory** | 4 | Asset Register, Inventory List, Stock Management | CRUD List, Detail View |
| 20 | **Documents & Learning** | 4 | Document Library, Template Manager, Learning Resources, CBT Content | CRUD List, Detail View, Wizard |
| 21 | **Reporting & Analytics** | 5 | Report Builder, Dashboard Gallery, Data Export, Scheduled Reports | Analytics, Dashboard, Report |
| 22 | **Platform Administration** | 5 | Tenant Lifecycle, Subscription Management, Feature Flags, Integration Hub, API Keys, Webhooks, Monitoring, Audit Log | CRUD List, Detail View, Settings |

---

## 7.4 Screen Design Rules

| Rule | Description |
|------|-------------|
| **Template-first** | Every screen uses an approved layout template |
| **Component reuse** | All UI elements are instances of library components |
| **Token compliance** | All values use design tokens |
| **Responsive** | Every screen designed at desktop, tablet, mobile |
| **Empty states** | Every data screen includes empty state design |
| **Error states** | Every data screen includes error state design |
| **Loading states** | Every data screen includes loading state design |
| **Permission-aware** | Role-based visibility indicated per 02 doc §3.5 |
| **Accessible** | Keyboard navigation and ARIA labels documented |

---

## 7.5 Module File Organisation

| File | Contents |
|------|----------|
| `Product - Identity & Access` | Login, Register, MFA, User Management screens |
| `Product - Institution` | Institution, Department, Academic Structure screens |
| `Product - People` | Student, Staff, Parent screens |
| `Product - Academics` | Session, Term, Class, Enrollment, Grading screens |
| `Product - Finance` | Fee, Billing, Invoice, Payment screens |
| `Product - Communication` | Notification, Message, Template screens |
| `Product - Operations` | Library, Hostel, Transport, Clinic, Visitor, Asset screens |
| `Product - Documents` | Document, Template, Learning Resource screens |
| `Product - Reporting` | Report Builder, Dashboard, Export screens |
| `Product - Platform Admin` | Tenant, Subscription, Integration, Monitoring screens |

---

## 7.6 Validation Checkpoint (Per Module)

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| All screens designed | Per engineering spec | |
| Templates applied correctly | Structural consistency | |
| Components are library instances | No manual recreation | |
| Responsive designs complete | Desktop, tablet, mobile | |
| Empty/error/loading states | All data screens covered | |
| Variables used | No hard-coded values | |
| Permission visibility marked | Role-based UI documented | |
| Naming compliant | File and frame naming correct | |

---

# 8. Phase 7 — Prototype Assembly

---

## 8.1 Objective

Link screens into interactive prototypes that demonstrate key user flows for stakeholder review and usability testing.

---

## 8.2 Build Order

| Step | Prototype | Screens Used | User Role |
|------|-----------|--------------|-----------|
| 1 | **Login Flow** | Login → MFA → Dashboard | All |
| 2 | **Student Onboarding** | Admission Form → Wizard → Profile → Confirmation | Administrator |
| 3 | **Staff Management** | Staff List → Profile → Edit → Save | Administrator |
| 4 | **Attendance Flow** | Class List → Attendance Sheet → Submit → Confirmation | Teacher |
| 5 | **Grade Entry** | Class List → Grade Book → Enter Grades → Submit | Teacher |
| 6 | **Fee Payment** | Invoice List → Invoice Detail → Payment → Confirmation | Administrator/Parent |
| 7 | **Report Generation** | Report Builder → Configure → Preview → Export | Administrator |
| 8 | **Document Upload** | Document Library → Upload → Tag → Save | Teacher/Administrator |
| 9 | **Message Broadcast** | Message Centre → Compose → Select Recipients → Send | Administrator |
| 10 | **Tenant Setup** | Tenant List → Create Tenant → Configure → Activate | Platform Operator |

---

## 8.3 Prototype Standards

| Standard | Reference |
|----------|-----------|
| Navigation flows match architecture | 03 doc §5.1 |
| Prototype links use On Tap triggers | 03 doc §5.2 |
| Interactive components for all buttons/inputs | 03 doc §5.3 |
| Smart Animate for state transitions | 03 doc §5.4 |
| Consistent transitions (200ms default) | 03 doc §5.5 |
| Flow branching for error/cancel paths | 03 doc §5.1 |

---

## 8.4 Validation Checkpoint

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| All 10 prototypes assembled | Complete inventory | |
| All interactions functional | Links work correctly | |
| Interactive components used | Buttons, inputs, toggles | |
| Transitions consistent | 200ms default | |
| Error/cancel paths included | Alternative flows covered | |
| Prototype narrated | Flow description for each | |

---

# 9. Phase 8 — Design QA

---

## 9.1 Objective

Validate every layer of the build against the Design System and Figma Standards before developer handoff.

---

## 9.2 QA Checkpoints by Phase

| After Phase | QA Focus | Reference |
|-------------|----------|-----------|
| Foundation | Token values, naming, publishing | 03 doc §6.2, §6.3 |
| Primitives | Component states, Auto Layout, tokens | 03 doc §6.1, §6.4 |
| Composites | Instance reuse, spacing, accessibility | 03 doc §6.1, §6.5 |
| Patterns | Responsive, states, composition | 03 doc §6.6, §6.7 |
| Templates | Layout, grid, responsive | 03 doc §6.4, §6.7 |
| Screens | Naming, documentation, completeness | 03 doc §6.9, §6.10 |
| Prototypes | Interaction consistency, flow accuracy | 03 doc §6.8 |
| All | Design System compliance | 03 doc §6.11 |

---

## 9.3 Master QA Checklist

| Category | Check | Pass/Fail |
|----------|-------|-----------|
| **Component Reuse** | All components from library (no manual recreation) | |
| **Component Reuse** | All components used as instances | |
| **Component Reuse** | No unjustified detached components | |
| **Variable Usage** | No hard-coded colours | |
| **Variable Usage** | No hard-coded spacing | |
| **Variable Usage** | No hard-coded typography | |
| **Token Compliance** | Brand tokens used correctly | |
| **Token Compliance** | Semantic tokens mapped correctly | |
| **Token Compliance** | Neutral tokens consistent | |
| **Alignment** | All elements aligned to grid | |
| **Alignment** | Consistent spacing between elements | |
| **Typography** | Type hierarchy consistent | |
| **Typography** | Font sizes from type scale | |
| **Accessibility** | Colour contrast ≥ 4.5:1 | |
| **Accessibility** | Touch targets ≥ 44px | |
| **Accessibility** | Keyboard navigation logical | |
| **Responsive** | Desktop layout correct | |
| **Responsive** | Tablet layout correct | |
| **Responsive** | Mobile layout correct | |
| **Naming** | File naming compliant | |
| **Naming** | Frame naming compliant | |
| **Naming** | Layer naming compliant | |
| **Documentation** | Component descriptions complete | |
| **Documentation** | Screen annotations complete | |
| **Documentation** | Interaction notes documented | |

---

## 9.4 QA Process

| Step | Action | Owner |
|------|--------|-------|
| 1 | Complete QA checklist | Designer |
| 2 | Fix all issues found | Designer |
| 3 | Re-run QA checklist | Designer |
| 4 | Submit for design lead review | Designer |
| 5 | Address review feedback | Designer |
| 6 | Final approval | Design Lead |

---

# 10. Phase 9 — Developer Handoff

---

## 10.1 Objective

Prepare complete, engineering-ready packages for every designed screen and component.

---

## 10.2 Handoff Checklist

| Category | Check | Reference | Pass/Fail |
|----------|-------|-----------|-----------|
| **Dev Mode** | All frames prepared for Dev Mode | 03 doc §7.1 | |
| **Annotations** | All interactions annotated | 03 doc §7.2 | |
| **Measurements** | All spacing and sizing marked | 03 doc §7.3 | |
| **Variables** | All variables exported | 03 doc §7.4 | |
| **Assets** | All images and icons exported | 03 doc §7.5 | |
| **Icons** | All icons exported as SVG | 03 doc §7.6 | |
| **Images** | All images optimised | 03 doc §7.7 | |
| **Specifications** | All screens have design specs | 03 doc §7.8 | |
| **Interactions** | All interactions documented | 03 doc §7.9 | |
| **Implementation** | Implementation notes included | 03 doc §7.10 | |
| **Traceability** | Each screen linked to engineering spec | 03 doc §7.11 | |
| **Documentation** | All documentation cross-checked | 03 doc §6.10 | |

---

## 10.3 Handoff Package Structure

For each module:

```
Handoff - [Module Name]
├── Design Specifications (annotations, measurements)
├── Asset Exports (icons, images, SVGs)
├── Variable Export (token values)
├── Interaction Notes (flows, transitions)
├── Implementation Notes (technical considerations)
└── Traceability Matrix (screen → spec mapping)
```

---

## 10.4 Final Approval

| Step | Action | Approver |
|------|--------|----------|
| 1 | Complete handoff checklist | Designer |
| 2 | Engineering review | Engineering Lead |
| 3 | Address feedback | Designer |
| 4 | Final sign-off | Solution Architect |

---

# 11. AI Workflow

---

## 11.1 Execution Protocol

For every phase, OpenCode must:

| Step | Action |
|------|--------|
| 1 | Load all governing documents (01, 02, 03, Constitution) |
| 2 | Verify all dependencies from prior phases are complete |
| 3 | Build only the current phase |
| 4 | Validate every deliverable against the Design System |
| 5 | Run the phase-specific QA checklist |
| 6 | Pause for review before continuing to the next phase |

---

## 11.2 Rules

| Rule | Description |
|------|-------------|
| **No skipping** | Never skip a phase or build dependent assets before prerequisites |
| **No inventing** | Never create components, tokens, or patterns not defined in approved documents |
| **No hard-coded values** | Every element must use approved design tokens |
| **Document gaps** | If required information is missing, identify the gap instead of making assumptions |
| **Single source of truth** | Reference approved documents; never duplicate their content |
| **Pause for review** | Every phase ends with a validation checkpoint and review gate |

---

## 11.3 Document Loading Requirements

| Phase | Required Documents |
|-------|--------------------|
| Foundation | 02 doc (tokens), 03 doc (workspace, variables) |
| Primitives | 01 doc (principles), 02 doc (components, states) |
| Composites | 02 doc (composition), 03 doc (component standards) |
| Patterns | 02 doc (patterns, composition) |
| Templates | 01 doc (layout philosophy), 02 doc (layout templates) |
| Screens | 01 doc (all sections), 02 doc (all sections), Engineering Specs |
| Prototypes | 01 doc (interaction philosophy), 03 doc (prototyping) |
| QA | 02 doc (all sections), 03 doc (QA standards) |
| Handoff | 03 doc (handoff, version control) |

---

## 11.4 Phase Completion Criteria

Each phase is complete when:

| Criterion | Description |
|-----------|-------------|
| All deliverables created | Every item in the phase deliverable list exists |
| QA checklist passed | Every check in the phase QA section passes |
| No hard-coded values | All elements use approved tokens |
| Documentation complete | Every deliverable has required documentation |
| Review gate passed | Design lead has reviewed and approved |

---

# 12. Success Criteria

---

## 12.1 Design System Completion

| Criterion | Measurement |
|-----------|-------------|
| All token collections created | 18 collections with correct values |
| All variable modes functional | Light mode complete; Dark mode provisionally set |
| All grid styles created | 3 breakpoint-specific grids |
| All text styles created | 13 type scale styles |
| All effect styles created | 4 shadow levels |
| Library published and accessible | Team members can access library |

---

## 12.2 Component Library Completion

| Criterion | Measurement |
|-----------|-------------|
| All 23 primitives complete | With all variants and states |
| All 10 composites complete | Assembled from primitives |
| All 7 patterns complete | Assembled from composites |
| All components documented | Props, usage, examples |
| All components accessible | WCAG 2.1 AA compliance |
| Zero detached components | 100% instance usage |

---

## 12.3 Template Completion

| Criterion | Measurement |
|-----------|-------------|
| All 12 templates complete | With responsive variants |
| All templates use patterns | Instances of pattern components |
| All templates have responsive layouts | Desktop, tablet, mobile |
| All templates have content zones | Slots documented |

---

## 12.4 Screen Completion

| Criterion | Measurement |
|-----------|-------------|
| All module screens designed | Per engineering specs |
| All screens use templates | Structural consistency |
| All screens are responsive | Desktop, tablet, mobile |
| All screens include states | Loading, empty, error |
| All screens use components | 100% library usage |
| All screens token-compliant | Zero hard-coded values |

---

## 12.5 Prototype Completion

| Criterion | Measurement |
|-----------|-------------|
| All 10 key flows prototyped | Interactive navigation |
| All interactions functional | Links, components, transitions |
| All flows narrated | Documentation for each |
| Error/cancel paths included | Alternative flows covered |

---

## 12.6 QA Completion

| Criterion | Measurement |
|-----------|-------------|
| All QA checklists passed | Every check passes |
| All issues resolved | Zero outstanding issues |
| Design lead approved | Formal approval received |
| Design System compliance verified | 03 doc §6.11 |

---

## 12.7 Handoff Completion

| Criterion | Measurement |
|-----------|-------------|
| All modules handed off | Complete handoff packages |
| All assets exported | Icons, images, SVGs |
| All variables exported | Token values available |
| All screens annotated | Interactions documented |
| All screens traced | Linked to engineering specs |
| Engineering approved | Engineering lead sign-off |

---

# 13. Dependency Map

---

## 13.1 Phase Dependencies

```
Phase 1: Foundation
    ↓
Phase 2: Primitives ──────────────────────── Depends on: Phase 1
    ↓
Phase 3: Composites ──────────────────────── Depends on: Phase 2
    ↓
Phase 4: Patterns ────────────────────────── Depends on: Phase 3
    ↓
Phase 5: Templates ───────────────────────── Depends on: Phase 4
    ↓
Phase 6: Screens ─────────────────────────── Depends on: Phase 5 + Engineering Specs
    ↓
Phase 7: Prototypes ──────────────────────── Depends on: Phase 6
    ↓
Phase 8: QA ──────────────────────────────── Depends on: All prior phases
    ↓
Phase 9: Handoff ─────────────────────────── Depends on: Phase 8
```

---

## 13.2 Module Dependency Graph

```
Layer 0:  Authentication, Identity & Access
              ↓
Layer 1:  Institution Management
              ↓
Layer 2:  People (Students, Staff, Parents)
              ↓
Layer 3:  Academic Management, Finance, Communication
              ↓
Layer 4:  Operations, Documents & Learning
              ↓
Layer 5:  Reporting & Analytics, Platform Administration
```

---

## 13.3 Component Dependency Chain

```
Foundation Tokens
    ↓
Primitive Components (23)
    ↓
Composite Components (10)
    ↓
Pattern Components (7)
    ↓
Layout Templates (12)
    ↓
Module Screens (200+)
    ↓
Prototypes (10 key flows)
```

---

# Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | July 2026 | Architecture Team | Initial Figma build roadmap |

---

*Document Version: 1.0*  
*Last Updated: July 2026*  
*Status: Approved*  
*Classification: Internal*

---

**END OF DOCUMENT**
