# OpenSchool ERP

## Figma Standards & Design QA

---

| Field | Value |
|-------|-------|
| **Document** | Figma Standards & Design QA |
| **Version** | 1.0 |
| **Status** | Approved |
| **Date** | July 2026 |
| **Classification** | Internal |
| **Author** | Architecture Team |
| **Owner** | Solution Architect |

---

| Aspect | Detail |
|--------|--------|
| **Purpose** | Authoritative operational guide for creating, reviewing, maintaining, and handing off all OpenSchool ERP Figma work |
| **Scope** | All Figma files, components, prototypes, and design artifacts |
| **Governing Documents** | Documentation Constitution, Design System & Component Library, UI Strategy & Design Direction |
| **Derived From** | Approved Design System, UI Strategy, Engineering Specifications, Platform Standards |

---

## Table of Contents

### Chapter 1 — Figma Workspace Architecture
1.1 File Structure
1.2 Team & Project Structure
1.3 Page Organisation
1.4 Section Organisation
1.5 Naming Conventions
1.6 Asset Organisation
1.7 Archive Strategy
1.8 Experimental Work Policy
1.9 Version History Management

### Chapter 2 — Variables & Libraries
2.1 Variable Collections
2.2 Variable Modes
2.3 Colour Variables
2.4 Typography Variables
2.5 Spacing Variables
2.6 Radius Variables
2.7 Elevation Variables
2.8 Motion Variables
2.9 Library Publishing
2.10 Library Versioning
2.11 Shared Assets
2.12 Icon Libraries
2.13 Illustration Libraries

### Chapter 3 — Component Library Standards
3.1 Component Sets & Variants
3.2 Component Hierarchy
3.3 Nested Components
3.4 Auto Layout Standards
3.5 Constraints
3.6 Smart Animate Compatibility
3.7 Instance Usage
3.8 Component Documentation
3.9 Component Ownership
3.10 Deprecation
3.11 Component Review Process

### Chapter 4 — Screen Construction Standards
4.1 Layout Composition
4.2 Page Templates
4.3 Responsive Frames
4.4 Reusable Patterns
4.5 Grid Usage
4.6 Spacing Consistency
4.7 Naming Standards
4.8 Annotation Standards
4.9 Design Documentation

### Chapter 5 — Prototyping Standards
5.1 Navigation Flows
5.2 Prototype Links
5.3 Interactive Components
5.4 Smart Animate Usage
5.5 Transition Consistency
5.6 Demonstration Flows
5.7 Presentation Mode
5.8 Stakeholder Review

### Chapter 6 — Design QA Standards
6.1 Component Reuse Audit
6.2 Variable Usage Audit
6.3 Token Compliance
6.4 Alignment & Spacing Audit
6.5 Typography Consistency
6.6 Accessibility Audit
6.7 Responsive Behaviour Audit
6.8 Interaction Consistency
6.9 Naming Compliance
6.10 Documentation Completeness
6.11 Design System Compliance
6.12 QA Checklist

### Chapter 7 — Developer Handoff
7.1 Dev Mode Readiness
7.2 Annotation Standards
7.3 Measurement Standards
7.4 Variable Export
7.5 Asset Export
7.6 Icon Export
7.7 Image Optimisation
7.8 Design Specifications
7.9 Interaction Notes
7.10 Implementation Notes
7.11 Traceability

### Chapter 8 — Version Control & Collaboration
8.1 Branching Strategy
8.2 Merging Standards
8.3 Review Workflow
8.4 Approval Process
8.5 Design Ownership
8.6 Change Tracking
8.7 Release Tagging
8.8 Library Updates
8.9 Rollback Procedures

### Chapter 9 — AI-Assisted Design Workflow
9.1 Required Documentation Loading
9.2 Constitution Compliance
9.3 Design System Compliance
9.4 Component Reuse Requirements
9.5 New Component Validation
9.6 Design Review Expectations
9.7 Human Approval Boundaries
9.8 Handling Uncertainty

### Chapter 10 — Future Evolution
10.1 Component Library Expansion
10.2 New Design Patterns
10.3 Variable Updates
10.4 Component Deprecation
10.5 Backwards Compatibility
10.6 Design System Scaling

---

# Chapter 1 — Figma Workspace Architecture

---

## 1.1 File Structure

### File Organisation

The OpenSchool Figma workspace uses a hierarchical file structure that scales with the product.

| File Type | Purpose | Naming Pattern |
|-----------|---------|----------------|
| **Design System** | Core tokens, components, patterns | `DS - OpenSchool` |
| **Product** | Screen designs per module | `Product - [Module Name]` |
| **Prototype** | Interactive prototypes | `Prototype - [Flow Name]` |
| **Archive** | Completed/archived work | `Archive - [Date] - [Name]` |

### File Naming Convention

```
[Category] - [Name] [Version]
```

| Segment | Description | Example |
|---------|-------------|---------|
| **Category** | File type prefix | `DS`, `Product`, `Prototype`, `Archive` |
| **Name** | Descriptive name | `OpenSchool`, `Students`, `Onboarding Flow` |
| **Version** | Optional version | `v2`, `v3` |

### File Limits

| Guideline | Limit |
|-----------|-------|
| **Maximum pages per file** | 10 |
| **Maximum frames per page** | 50 |
| **Maximum components per file** | 200 |
| **Recommended file size** | Under 100MB |

---

## 1.2 Team & Project Structure

### Project Organisation

```
OpenSchool Figma Workspace
├── Design System
│   ├── Tokens
│   ├── Components
│   └── Patterns
├── Product
│   ├── Web - Administrator
│   ├── Web - Platform Operator
│   ├── Mobile - Teacher
│   ├── Mobile - Student
│   └── Mobile - Parent
├── Prototypes
│   └── [Flow names]
├── Research
│   └── [Research artifacts]
└── Archive
    └── [Completed work]
```

### Team Roles

| Role | Responsibility | Access Level |
|------|---------------|--------------|
| **Design Lead** | Design system governance, review | Full access |
| **Designer** | Screen design, component creation | Edit access |
| **Developer** | Dev Mode, implementation review | View + Dev Mode |
| **Product Manager** | Review, approval | View access |
| **AI Assistant** | Component generation, review support | Edit access (governed) |

---

## 1.3 Page Organisation

### Design System File Pages

| Page | Purpose | Content |
|------|---------|---------|
| **Cover** | Document landing | Title, version, status |
| **Tokens** | Design token reference | Colour, typography, spacing |
| **Primitives** | Base components | Button, Input, Badge, Icon |
| **Composites** | Combined components | Search Field, Form Field |
| **Patterns** | Reusable patterns | Data Table, Form Layout |
| **Documentation** | Component docs | Usage guidelines, examples |
| **Changelog** | Version history | Updates, deprecations |

### Product File Pages

| Page | Purpose | Content |
|------|---------|---------|
| **Cover** | Module landing | Module name, status |
| **Screens** | All screens | Screen designs |
| **Flows** | User flows | Flow diagrams |
| **Components** | Module-specific components | Custom components |
| **Documentation** | Design notes | Implementation notes |

---

## 1.4 Section Organisation

### Section Naming

```
[Module] / [Feature] / [Status]
```

| Segment | Description | Example |
|---------|-------------|---------|
| **Module** | Product module | `Students`, `Fees`, `Grades` |
| **Feature** | Feature area | `Enrollment`, `Payments`, `Reports` |
| **Status** | Current status | `In Progress`, `Review`, `Approved` |

### Section Structure

| Section | Contents |
|---------|----------|
| **In Progress** | Active design work |
| **Review** | Awaiting design review |
| **Approved** | Approved designs |
| **Handoff** | Ready for development |
| **Archive** | Completed work |

---

## 1.5 Naming Conventions

### Frame Naming

| Type | Pattern | Example |
|------|---------|---------|
| **Screen** | `[Module] / [Screen Name]` | `Students / Student List` |
| **Component** | `[Category] / [Name]` | `Button / Primary` |
| **Variant** | `[Property] = [Value]` | `Size = Large` |
| **State** | `[State]` | `Hover`, `Disabled` |

### Layer Naming

| Layer Type | Pattern | Example |
|------------|---------|---------|
| **Container** | `[Type] / [Name]` | `Frame / Content` |
| **Text** | `[Style] / [Content]` | `Heading / Student List` |
| **Icon** | `Icon / [Name]` | `Icon / ChevronRight` |
| **Image** | `Image / [Description]` | `Image / Avatar` |

### Naming Rules

| Rule | Description |
|------|-------------|
| **Hierarchical** | Use `/` for hierarchy |
| **Descriptive** | Name should describe content |
| **Consistent** | Same naming pattern across all files |
| **No special characters** | Avoid `[]`, `{}`, `()` in names |
| **No abbreviations** | Use full words unless standard |

---

## 1.6 Asset Organisation

### Icon Assets

| Category | Naming | Example |
|----------|--------|---------|
| **Navigation** | `icon-[name]` | `icon-chevron-right` |
| **Action** | `icon-[name]` | `icon-plus` |
| **Status** | `icon-[name]` | `icon-check-circle` |
| **Social** | `icon-[name]` | `icon-google` |

### Illustration Assets

| Category | Naming | Example |
|----------|--------|---------|
| **Empty states** | `illustration-[context]` | `illustration-no-students` |
| **Onboarding** | `illustration-[step]` | `illustration-welcome` |
| **Error** | `illustration-[error]` | `illustration-not-found` |

### Image Assets

| Category | Naming | Example |
|----------|--------|---------|
| **Avatars** | `avatar-[context]` | `avatar-default` |
| **Photos** | `[module]-[description]` | `students-classroom` |
| **Backgrounds** | `bg-[context]` | `bg-gradient-primary` |

---

## 1.7 Archive Strategy

### Archive Trigger

| Condition | Action |
|-----------|--------|
| **Feature shipped** | Move to Archive after 30 days |
| **Design abandoned** | Move to Archive immediately |
| **Superseded by new design** | Move to Archive |
| **Project cancelled** | Move to Archive |

### Archive Structure

```
Archive/
├── [Year]
│   ├── [Month]
│   │   ├── [Project Name]
│   │   │   ├── Files
│   │   │   ├── Screenshots
│   │   │   └── Documentation
```

### Archive Naming

```
[Year]-[Month] - [Project Name]
```

Example: `2026-07 - Student Enrollment Redesign`

---

## 1.8 Experimental Work Policy

### Experimental Work Rules

| Rule | Description |
|------|-------------|
| **Separate file** | Experimental work in dedicated file |
| **Clear naming** | Prefix with `EXP -` |
| **No library publishing** | Never publish experimental components |
| **Time limit** | Maximum 2 weeks before decision |
| **Review required** | Must be reviewed before promotion |

### Experimental Work Lifecycle

| Stage | Duration | Action |
|-------|----------|--------|
| **Experiment** | 2 weeks | Explore new patterns |
| **Decision** | 1 day | Accept, iterate, or abandon |
| **Promotion** | If accepted | Move to production file |
| **Archive** | If abandoned | Move to Archive |

---

## 1.9 Version History Management

### Version Naming

| Version | Naming | Description |
|---------|--------|-------------|
| **Major** | `v1.0`, `v2.0` | Breaking changes |
| **Minor** | `v1.1`, `v1.2` | New features |
| **Patch** | `v1.0.1`, `v1.0.2` | Bug fixes |

### Version History Requirements

| Requirement | Description |
|-------------|-------------|
| **Document all changes** | Record every significant change |
| **Include rationale** | Explain why changes were made |
| **Reference tickets** | Link to design tickets |
| **Date stamp** | Include date of change |
| **Author stamp** | Include who made the change |

### Version History Format

```markdown
## v1.2 - 2026-07-21
- Added new Button variants (Ghost, Link)
- Updated colour tokens for accessibility
- Deprecated old Badge component
```

---


---

# Chapter 2 — Variables & Libraries

---

## 2.1 Variable Collections

### Collection Structure

| Collection | Purpose | Scope |
|------------|---------|-------|
| **Primitives** | Raw design values | Global |
| **Semantic** | Functional meaning tokens | Global |
| **Component** | Component-specific tokens | Per component |

### Collection Naming

| Collection | Naming Pattern | Example |
|------------|---------------|---------|
| **Primitives** | `primitives` | `primitives` |
| **Semantic** | `semantic` | `semantic` |
| **Component** | `comp-[name]` | `comp-button`, `comp-input` |

### Collection Rules

| Rule | Description |
|------|-------------|
| **Single source** | Each value defined once in Primitives |
| **Semantic mapping** | Semantic references Primitives |
| **Component scoping** | Component collections reference Semantic |
| **No hard-coded values** | Never use raw hex/px in components |

---

## 2.2 Variable Modes

### Mode Definition

| Mode | Description | Usage |
|------|-------------|-------|
| **Light** | Default light theme | Standard interface |
| **Dark** | Dark theme | Future implementation |

### Mode Naming

| Mode | Figma Name | Description |
|------|------------|-------------|
| **Light** | `Light` | Default mode |
| **Dark** | `Dark` | Dark theme |

### Mode Rules

| Rule | Description |
|------|-------------|
| **Light first** | Always design in Light mode first |
| **Dark support** | All variables must support Dark mode |
| **Consistent mapping** | Same variable name in both modes |
| **Accessible contrast** | Both modes must meet WCAG 2.1 AA |

---

## 2.3 Colour Variables

### Colour Collection Structure

| Group | Naming Pattern | Examples |
|-------|---------------|----------|
| **Brand** | `brand/color/[name]` | `brand/color/primary`, `brand/color/secondary` |
| **Semantic** | `semantic/color/[name]` | `semantic/color/success`, `semantic/color/error` |
| **Neutral** | `neutral/color/[name]` | `neutral/color/gray-100`, `neutral/color/gray-900` |

### Colour Variable Naming

| Category | Pattern | Example |
|----------|---------|---------|
| **Brand primary** | `brand/color/primary` | `brand/color/primary` |
| **Brand primary light** | `brand/color/primary-light` | `brand/color/primary-light` |
| **Brand primary dark** | `brand/color/primary-dark` | `brand/color/primary-dark` |
| **Brand primary subtle** | `brand/color/primary-subtle` | `brand/color/primary-subtle` |
| **Semantic success** | `semantic/color/success` | `semantic/color/success` |
| **Semantic error** | `semantic/color/error` | `semantic/color/error` |
| **Neutral gray** | `neutral/color/gray-[shade]` | `neutral/color/gray-100` |

### Colour Variable Rules

| Rule | Description |
|------|-------------|
| **Use semantic tokens** | Prefer semantic over primitive colours |
| **Consistent naming** | Same name for same meaning everywhere |
| **Accessible contrast** | Minimum 4.5:1 for text, 3:1 for UI |
| **No hard-coded hex** | Always use variables |

---

## 2.4 Typography Variables

### Typography Collection Structure

| Group | Naming Pattern | Examples |
|-------|---------------|----------|
| **Font Family** | `typography/font/[name]` | `typography/font/heading`, `typography/font/body` |
| **Font Size** | `typography/size/[name]` | `typography/size/xs`, `typography/size/sm` |
| **Font Weight** | `typography/weight/[name]` | `typography/weight/regular`, `typography/weight/semibold` |
| **Line Height** | `typography/line-height/[name]` | `typography/line-height/xs`, `typography/line-height/sm` |

### Typography Variable Naming

| Property | Pattern | Example |
|----------|---------|---------|
| **Font family** | `typography/font/[role]` | `typography/font/heading` |
| **Font size** | `typography/size/[scale]` | `typography/size/lg` |
| **Font weight** | `typography/weight/[weight]` | `typography/weight/semibold` |
| **Line height** | `typography/line-height/[scale]` | `typography/line-height/lg` |

### Typography Variable Rules

| Rule | Description |
|------|-------------|
| **Use text styles** | Apply typography variables through text styles |
| **Consistent scale** | Use approved type scale |
| **Role-based naming** | Name by role, not by size |
| **Accessible sizing** | Minimum 14px for body text |

---

## 2.5 Spacing Variables

### Spacing Collection Structure

| Group | Naming Pattern | Examples |
|-------|---------------|----------|
| **Spacing** | `spacing/[scale]` | `spacing/xs`, `spacing/sm`, `spacing/md` |
| **Density** | `density/[mode]/[scale]` | `density/comfortable/md`, `density/compact/md` |

### Spacing Variable Naming

| Scale | Value | Usage |
|-------|-------|-------|
| `spacing/xs` | 4px | Tight spacing, inline elements |
| `spacing/sm` | 8px | Small gaps, compact layouts |
| `spacing/md` | 16px | Standard spacing, component padding |
| `spacing/lg` | 24px | Section spacing, card padding |
| `spacing/xl` | 32px | Large section spacing |
| `spacing/2xl` | 48px | Page section spacing |
| `spacing/3xl` | 64px | Major section spacing |

### Spacing Variable Rules

| Rule | Description |
|------|-------------|
| **Use variables** | Always use spacing variables |
| **Multiples of 4** | All values multiples of 4px |
| **Consistent rhythm** | Maintain consistent spacing |
| **Density support** | Use density variants for context |

---

## 2.6 Radius Variables

### Radius Collection Structure

| Group | Naming Pattern | Examples |
|-------|---------------|----------|
| **Border Radius** | `radius/[scale]` | `radius/none`, `radius/sm`, `radius/md` |

### Radius Variable Naming

| Scale | Value | Usage |
|-------|-------|-------|
| `radius/none` | 0px | No radius |
| `radius/sm` | 4px | Small elements, tags |
| `radius/md` | 8px | Buttons, inputs, cards |
| `radius/lg` | 12px | Modals, drawers |
| `radius/xl` | 16px | Large cards, panels |
| `radius/full` | 9999px | Pills, avatars |

### Radius Variable Rules

| Rule | Description |
|------|-------------|
| **Use variables** | Always use radius variables |
| **Consistent application** | Same radius for same element types |
| **Never excessive** | Avoid overly rounded corners |

---

## 2.7 Elevation Variables

### Elevation Collection Structure

| Group | Naming Pattern | Examples |
|-------|---------------|----------|
| **Shadow** | `shadow/[scale]` | `shadow/sm`, `shadow/md`, `shadow/lg` |

### Elevation Variable Naming

| Scale | Value | Usage |
|-------|-------|-------|
| `shadow/sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `shadow/md` | `0 4px 6px rgba(0,0,0,0.07)` | Standard elevation |
| `shadow/lg` | `0 10px 15px rgba(0,0,0,0.1)` | Elevated elements |
| `shadow/xl` | `0 20px 25px rgba(0,0,0,0.1)` | High elevation |

### Elevation Variable Rules

| Rule | Description |
|------|-------------|
| **Use variables** | Always use elevation variables |
| **Subtle shadows** | Use subtle shadows; avoid heavy shadows |
| **Purposeful** | Shadows communicate hierarchy |
| **Consistent levels** | Same shadow levels across all components |

---

## 2.8 Motion Variables

### Motion Collection Structure

| Group | Naming Pattern | Examples |
|-------|---------------|----------|
| **Duration** | `motion/duration/[scale]` | `motion/duration/fast`, `motion/duration/normal` |
| **Easing** | `motion/easing/[name]` | `motion/easing/default`, `motion/easing/in` |

### Motion Variable Naming

| Property | Pattern | Example |
|----------|---------|---------|
| **Duration** | `motion/duration/[scale]` | `motion/duration/fast` |
| **Easing** | `motion/easing/[name]` | `motion/easing/default` |

### Motion Variable Values

| Variable | Value | Usage |
|----------|-------|-------|
| `motion/duration/instant` | 0ms | Immediate feedback |
| `motion/duration/fast` | 100ms | Micro-interactions |
| `motion/duration/normal` | 200ms | Standard transitions |
| `motion/duration/slow` | 300ms | Complex transitions |
| `motion/easing/default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General purpose |
| `motion/easing/in` | `cubic-bezier(0.4, 0, 1, 1)` | Exiting elements |
| `motion/easing/out` | `cubic-bezier(0, 0, 0.2, 1)` | Entering elements |

### Motion Variable Rules

| Rule | Description |
|------|-------------|
| **Use variables** | Always use motion variables |
| **Fast animations** | Keep animations under 300ms |
| **Purposeful** | Every animation serves a function |
| **Consistent** | Same durations for same types |

---

## 2.9 Library Publishing

### Publishing Schedule

| Event | Action |
|-------|--------|
| **Component update** | Publish immediately after review |
| **Token update** | Publish after design lead approval |
| **New component** | Publish after full review cycle |
| **Breaking change** | Publish with version bump + migration guide |

### Publishing Rules

| Rule | Description |
|------|-------------|
| **Test before publish** | Verify all instances update correctly |
| **Version bump** | Update version before publishing |
| **Changelog update** | Document all changes |
| **Notify consumers** | Announce breaking changes |

### Library Naming

| Library | Name | Description |
|---------|------|-------------|
| **Core** | `OpenSchool Design System` | Tokens and primitives |
| **Components** | `OpenSchool Components` | Reusable components |
| **Patterns** | `OpenSchool Patterns` | Complex patterns |

---

## 2.9 Library Versioning

### Version Numbering

| Version | Naming | Description |
|---------|--------|-------------|
| **Major** | `1.0.0` | Breaking changes |
| **Minor** | `1.1.0` | New features |
| **Patch** | `1.0.1` | Bug fixes |

### Version Bumping Rules

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| **Breaking prop change** | MAJOR | 1.0.0 → 2.0.0 |
| **New optional prop** | MINOR | 1.0.0 → 1.1.0 |
| **Bug fix** | PATCH | 1.0.0 → 1.0.1 |
| **Deprecation** | MINOR | 1.0.0 → 1.1.0 |
| **Removal** | MAJOR | 1.1.0 → 2.0.0 |

### Version History Format

```markdown
## v1.2.0 - 2026-07-21

### Added
- New Button variants (Ghost, Link)

### Changed
- Updated colour tokens for accessibility

### Deprecated
- Old Badge component (use new Badge)
```

---

## 2.10 Shared Assets

### Asset Types

| Asset Type | Purpose | Organisation |
|------------|---------|--------------|
| **Icons** | UI icons | By category |
| **Illustrations** | Empty states, onboarding | By context |
| **Logos** | Brand marks | By variant |
| **Photos** | User content | By module |

### Asset Naming Rules

| Rule | Description |
|------|-------------|
| **Consistent naming** | Same pattern across all assets |
| **Descriptive** | Name describes content |
| **No special characters** | Avoid `[]`, `{}`, `()` |
| **Hierarchical** | Use `/` for hierarchy |

---

## 2.11 Icon Libraries

### Icon Library Structure

| Category | Naming | Examples |
|----------|--------|----------|
| **Navigation** | `icon-nav-[name]` | `icon-nav-chevron-right` |
| **Action** | `icon-action-[name]` | `icon-action-plus` |
| **Status** | `icon-status-[name]` | `icon-status-check-circle` |
| **Social** | `icon-social-[name]` | `icon-social-google` |

### Icon Standards

| Standard | Value |
|----------|-------|
| **Grid size** | 24px × 24px |
| **Stroke width** | 1.5px |
| **Corner radius** | 0px (outline) or 2px (rounded) |
| **Colour** | Current colour (inherit) |

### Icon Rules

| Rule | Description |
|------|-------------|
| **Consistent style** | Same stroke weight across all icons |
| **Optical alignment** | Icons optically centred in grid |
| **Accessible** | Include `aria-hidden` for decorative icons |
| **Export ready** | Export as SVG with optimised paths |

---

## 2.12 Illustration Libraries

### Illustration Categories

| Category | Usage | Naming |
|----------|-------|--------|
| **Empty states** | No data available | `illustration-empty-[context]` |
| **Onboarding** | First-time user flows | `illustration-onboarding-[step]` |
| **Error** | Error pages | `illustration-error-[type]` |
| **Success** | Success confirmations | `illustration-success-[context]` |

### Illustration Standards

| Standard | Value |
|----------|-------|
| **Style** | Flat, minimal, friendly |
| **Colours** | Use design system colours |
| **Size** | 120px × 120px (default) |
| **Format** | SVG preferred |

### Illustration Rules

| Rule | Description |
|------|-------------|
| **Consistent style** | Same illustration style across all |
| **On-brand** | Use design system colours |
| **Accessible** | Include alt text description |
| **Scalable** | Vector format for all sizes |

---


---

# Chapter 3 — Component Library Standards

---

## 3.1 Component Sets & Variants

### Component Set Structure

| Level | Description | Example |
|-------|-------------|---------|
| **Component Set** | Container for variants | `Button` |
| **Variant** | Specific combination | `Button / Primary / Large` |
| **Property** | Variant attribute | `Size`, `State`, `Icon` |

### Variant Naming

| Property | Naming | Values |
|----------|--------|--------|
| **Size** | `Size` | `Small`, `Medium`, `Large` |
| **State** | `State` | `Default`, `Hover`, `Active`, `Disabled` |
| **Variant** | `Variant` | `Primary`, `Secondary`, `Ghost`, `Danger` |
| **Icon** | `Icon` | `None`, `Left`, `Right` |

### Component Set Rules

| Rule | Description |
|------|-------------|
| **Logical grouping** | Group related variants together |
| **Consistent properties** | Same properties across similar components |
| **Descriptive names** | Variant names describe visual difference |
| **Exhaustive variants** | Cover all required states and sizes |

---

## 3.2 Component Hierarchy

### Composition Levels

| Level | Description | Examples |
|-------|-------------|----------|
| **Primitive** | Atomic,不可再分 | Button, Input, Badge, Icon |
| **Composite** | Combinations of primitives | Search Field, Form Field |
| **Pattern** | Reusable interface patterns | Data Table, Form Layout |
| **Template** | Full page structures | Dashboard, CRUD List |

### Hierarchy Rules

| Rule | Description |
|------|-------------|
| **Assemble, don't duplicate** | Combine existing components |
| **Single responsibility** | Each component does one thing well |
| **Predictable composition** | Same components combine same way |
| **Consistent spacing** | Use design tokens for spacing |

---

## 3.3 Nested Components

### Nesting Guidelines

| Guideline | Description |
|-----------|-------------|
| **Maximum depth** | 4 levels of nesting |
| **Shared components** | Use instances for shared elements |
| **Consistent composition** | Same nesting pattern everywhere |
| **Document dependencies** | Document all nested components |

### Nesting Rules

| Rule | Description |
|------|-------------|
| **Instance over copy** | Always use instances, never copies |
| **Override tracking** | Track all overrides |
| **Break when needed** | Detach only when absolutely necessary |
| **Document detachments** | Document why detachment was needed |

---

## 3.4 Auto Layout Standards

### Auto Layout Properties

| Property | Value | Usage |
|----------|-------|-------|
| **Direction** | Horizontal / Vertical | Based on content flow |
| **Spacing** | Use spacing tokens | Consistent gaps |
| **Padding** | Use spacing tokens | Consistent padding |
| **Alignment** | MIN / CENTER / MAX | Based on layout needs |
| **Sizing** | HUG / FILL / FIXED | Based on context |

### Auto Layout Rules

| Rule | Description |
|------|-------------|
| **Always use Auto Layout** | Never use manual positioning |
| **Use spacing tokens** | Consistent gaps via variables |
| **Responsive behaviour** | Set appropriate sizing modes |
| **Nested Auto Layout** | Use for complex layouts |

### Auto Layout Patterns

| Pattern | Usage | Settings |
|---------|-------|----------|
| **Row** | Horizontal items | Direction: Horizontal, Spacing: token |
| **Column** | Vertical items | Direction: Vertical, Spacing: token |
| **Stack** | Overlapping items | Direction: Horizontal, Position: Absolute |
| **Wrap** | Wrapping items | Direction: Horizontal, Wrap: Wrap |

---

## 3.5 Constraints

### Constraint Types

| Type | Usage | Description |
|------|-------|-------------|
| **Left** | Fixed left position | Anchored to left edge |
| **Right** | Fixed right position | Anchored to right edge |
| **Top** | Fixed top position | Anchored to top edge |
| **Bottom** | Fixed bottom position | Anchored to bottom edge |
| **Left & Right** | Stretch horizontally | Fills width |
| **Top & Bottom** | Stretch vertically | Fills height |
| **Center** | Centers in parent | Centers both axes |
| **Scale** | Scales with parent | Proportional scaling |

### Constraint Rules

| Rule | Description |
|------|-------------|
| **Responsive constraints** | Use constraints for responsive behaviour |
| **Consistent patterns** | Same constraint patterns for same components |
| **Test at breakpoints** | Verify constraints at all breakpoints |
| **Document exceptions** | Document any non-standard constraints |

---

## 3.6 Smart Animate Compatibility

### Smart Animate Requirements

| Requirement | Description |
|-------------|-------------|
| **Matching layer names** | Same layer names for animated elements |
| **Consistent structure** | Same component structure across states |
| **Appropriate properties** | Only animate position, size, opacity |
| **Matching instances** | Same component instances for transitions |

### Smart Animate Rules

| Rule | Description |
|------|-------------|
| **Consistent naming** | Same layer names for animated elements |
| **Same component** | Use same component for start/end states |
| **Minimal properties** | Animate only position, size, opacity |
| **Test transitions** | Verify all prototype transitions work |

---

## 3.7 Instance Usage

### Instance Rules

| Rule | Description |
|------|-------------|
| **Always use instances** | Never duplicate components |
| **Override tracking** | Track all instance overrides |
| **Minimal overrides** | Minimise instance overrides |
| **Reset when needed** | Reset overrides when appropriate |

### Instance Management

| Action | When | How |
|--------|------|-----|
| **Swap** | Need different variant | Swap instance |
| **Override** | Need local modification | Override property |
| **Reset** | Need to revert | Reset all overrides |
| **Detach** | Need full customisation | Detach (last resort) |

---

## 3.8 Component Documentation

### Documentation Requirements

| Requirement | Description |
|-------------|-------------|
| **Purpose** | Why the component exists |
| **Usage** | When and how to use |
| **Variants** | All available variants |
| **Props** | All properties with types |
| **Accessibility** | ARIA requirements |
| **Responsive** | Behaviour at breakpoints |
| **Examples** | Usage examples |
| **Do's and Don'ts** | Usage guidelines |

### Documentation Location

| Location | Content |
|----------|---------|
| **Component description** | Brief purpose statement |
| **Figma page** | Detailed documentation |
| **Design System doc** | Full specification |

---

## 3.9 Component Ownership

### Ownership Model

| Role | Responsibility |
|------|---------------|
| **Design Lead** | Final approval for new components |
| **Designer** | Component creation and maintenance |
| **Developer** | Implementation review |
| **AI Assistant** | Component generation support |

### Ownership Rules

| Rule | Description |
|------|-------------|
| **Clear ownership** | Every component has an owner |
| **Review required** | All changes require review |
| **Documentation updated** | Update docs with every change |
| **Deprecation process** | Follow deprecation process |

---

## 3.10 Deprecation

### Deprecation Process

| Step | Action |
|------|--------|
| 1 | Mark component as deprecated |
| 2 | Add deprecation notice |
| 3 | Document replacement |
| 4 | Update all references |
| 5 | Remove after grace period |

### Deprecation Rules

| Rule | Description |
|------|-------------|
| **Grace period** | Minimum 30 days before removal |
| **Clear replacement** | Document replacement component |
| **Migration guide** | Provide migration instructions |
| **No breaking changes** | Don't break existing usage |

---

## 3.11 Component Review Process

### Review Checklist

| Check | Description |
|-------|-------------|
| **Variants** | All required variants present |
| **States** | All states implemented |
| **Accessibility** | WCAG 2.1 AA compliant |
| **Responsive** | Works at all breakpoints |
| **Auto Layout** | Proper Auto Layout usage |
| **Naming** | Consistent naming conventions |
| **Documentation** | Complete documentation |
| **Instance usage** | Proper instance usage |

### Review Process

| Step | Action |
|------|--------|
| 1 | Self-review against checklist |
| 2 | Peer review |
| 3 | Design lead approval |
| 4 | Publish to library |

---


---

# Chapter 4 — Screen Construction Standards

---

## 4.1 Layout Composition

### Layout Principles

| Principle | Description |
|-----------|-------------|
| **Template-first** | Start from approved template |
| **Component-based** | Assemble from approved components |
| **Consistent spacing** | Use design tokens for all spacing |
| **Responsive** | Design for all breakpoints |

### Layout Rules

| Rule | Description |
|------|-------------|
| **Use templates** | Always start from approved template |
| **Assemble components** | Never manually recreate components |
| **Use Auto Layout** | Always use Auto Layout for layouts |
| **Consistent spacing** | Use spacing tokens consistently |

---

## 4.2 Page Templates

### Template Usage

| Template | When to Use |
|----------|-------------|
| **Dashboard** | Overview and monitoring |
| **CRUD List** | Data management |
| **Detail View** | Single item management |
| **Wizard** | Complex workflows |
| **Settings** | System configuration |
| **Analytics** | Data analysis |
| **Calendar** | Scheduling |
| **Profile** | User management |
| **Report** | Report generation |
| **Workspace Landing** | Module entry point |

### Template Rules

| Rule | Description |
|------|-------------|
| **Inherit structure** | New screens inherit from closest template |
| **Adapt, don't redesign** | Modify templates for specific needs |
| **Consistent elements** | Same header, pagination, actions |
| **Responsive adaptation** | Templates reflow at breakpoints |

---

## 4.3 Responsive Frames

### Breakpoint Frames

| Breakpoint | Width | Frame Name |
|-----------|-------|------------|
| **Mobile** | 375px | `Mobile / 375` |
| **Tablet** | 768px | `Tablet / 768` |
| **Desktop** | 1024px | `Desktop / 1024` |
| **Wide** | 1440px | `Wide / 1440` |

### Responsive Frame Rules

| Rule | Description |
|------|-------------|
| **Design at all breakpoints** | Create frames for each breakpoint |
| **Consistent content** | Same content across all breakpoints |
| **Appropriate layout** | Layout adapts to breakpoint |
| **Test at breakpoints** | Verify behaviour at each breakpoint |

---

## 4.4 Reusable Patterns

### Pattern Usage

| Pattern | Usage |
|---------|-------|
| **Data Table** | Tabular data display |
| **Form Layout** | Data entry forms |
| **Card Grid** | Content listing |
| **Detail View** | Single item display |
| **Filter Panel** | Advanced filtering |
| **Media Object** | List items |
| **Stat Card** | Dashboard metrics |

### Pattern Rules

| Rule | Description |
|------|-------------|
| **Use approved patterns** | Always use approved patterns |
| **Consistent implementation** | Same pattern, same implementation |
| **Component-based** | Patterns built from components |
| **Responsive** | Patterns work at all breakpoints |

---

## 4.5 Grid Usage

### Grid System

| Breakpoint | Columns | Gutter | Margin |
|-----------|---------|--------|--------|
| **Desktop** | 12 | 24px | 32px |
| **Tablet** | 8 | 16px | 16px |
| **Mobile** | 4 | 16px | 16px |

### Grid Rules

| Rule | Description |
|------|-------------|
| **Use grid** | Always use grid for layout |
| **Consistent gutters** | Use consistent gutter widths |
| **Align to grid** | All content aligns to grid |
| **Responsive grid** | Grid adapts to breakpoint |

---

## 4.6 Spacing Consistency

### Spacing Rules

| Rule | Description |
|------|-------------|
| **Use tokens** | Always use spacing tokens |
| **Consistent rhythm** | Maintain consistent spacing |
| **Component spacing** | Use consistent component spacing |
| **Section spacing** | Use consistent section spacing |

### Spacing Application

| Context | Token |
|---------|-------|
| **Component padding** | `spacing/md` |
| **Section spacing** | `spacing/lg` |
| **Page padding** | `spacing/xl` |
| **Item spacing** | `spacing/sm` |

---

## 4.7 Naming Standards

### Screen Naming

| Element | Pattern | Example |
|---------|---------|---------|
| **Screen** | `[Module] / [Screen Name]` | `Students / Student List` |
| **Frame** | `[Type] / [Name]` | `Frame / Content` |
| **Layer** | `[Type] / [Name]` | `Text / Heading` |

### Naming Rules

| Rule | Description |
|------|-------------|
| **Hierarchical** | Use `/` for hierarchy |
| **Descriptive** | Name describes content |
| **Consistent** | Same naming pattern everywhere |
| **No special characters** | Avoid `[]`, `{}`, `()` |

---

## 4.8 Annotation Standards

### Annotation Types

| Type | Usage | Colour |
|------|-------|--------|
| **Measurement** | Dimensions and spacing | Blue |
| **Interaction** | User interactions | Green |
| **State** | Component states | Orange |
| **Accessibility** | A11y requirements | Purple |
| **Responsive** | Breakpoint behaviour | Red |

### Annotation Rules

| Rule | Description |
|------|-------------|
| **Clear annotations** | Annotations are easy to understand |
| **Consistent style** | Same annotation style everywhere |
| **Non-intrusive** | Annotations don't obscure design |
| **Comprehensive** | All important details annotated |

---

## 4.9 Design Documentation

### Documentation Requirements

| Requirement | Description |
|-------------|-------------|
| **Screen purpose** | Why the screen exists |
| **User flow** | How users reach the screen |
| **Key interactions** | Primary user actions |
| **Responsive behaviour** | Behaviour at breakpoints |
| **Accessibility** | A11y requirements |
| **Implementation notes** | Technical considerations |

### Documentation Location

| Location | Content |
|----------|---------|
| **Figma page** | Design annotations |
| **Figma description** | Screen purpose |
| **Design ticket** | Full specification |
| **Handoff notes** | Implementation notes |

---


---

# Chapter 5 — Prototyping Standards

---

## 5.1 Navigation Flows

### Flow Types

| Flow Type | Purpose | Complexity |
|-----------|---------|------------|
| **Primary** | Core user tasks | High |
| **Secondary** | Supporting tasks | Medium |
| **Edge cases** | Error and edge cases | Low |

### Flow Documentation

| Element | Description |
|---------|-------------|
| **Starting point** | Where the flow begins |
| **Steps** | Each step in the flow |
| **Decision points** | Where users make choices |
| **End points** | Where the flow ends |
| **Error states** | How errors are handled |

### Flow Rules

| Rule | Description |
|------|-------------|
| **Document all flows** | Every prototype has documented flows |
| **Start with entry point** | Flows start at logical entry points |
| **Include error states** | Flows include error handling |
| **Test all paths** | Verify all possible paths work |

---

## 5.2 Prototype Links

### Link Types

| Type | Usage | Animation |
|------|-------|-----------|
| **Navigate to** | Screen transitions | Slide left/right |
| **Open overlay** | Modals, popovers | Fade in |
| **Close overlay** | Dismiss overlays | Fade out |
| **Swap overlay** | Replace overlay | Fade in/out |
| **Back** | Return to previous | Slide right/left |

### Link Rules

| Rule | Description |
|------|-------------|
| **Consistent transitions** | Same transition for same type |
| **Appropriate animation** | Match animation to context |
| **Test all links** | Verify all prototype links work |
| **Document interactions** | Annotate all interactions |

---

## 5.3 Interactive Components

### Interactive Component Usage

| Component | Interaction | Trigger |
|-----------|-------------|---------|
| **Button** | Hover, Press, Disabled | While hovering, while pressing |
| **Input** | Focus, Error, Disabled | While focused, while typing |
| **Toggle** | On, Off | On click |
| **Checkbox** | Checked, Unchecked | On click |
| **Dropdown** | Open, Closed | On click |

### Interactive Component Rules

| Rule | Description |
|------|-------------|
| **Use interactive components** | For all interactive states |
| **Consistent triggers** | Same trigger for same interaction |
| **Test all states** | Verify all interactive states work |
| **Document interactions** | Annotate all interactions |

---

## 5.4 Smart Animate Usage

### Smart Animate Properties

| Property | Animate | Don't Animate |
|----------|---------|---------------|
| **Position** | Yes | - |
| **Size** | Yes | - |
| **Opacity** | Yes | - |
| **Rotation** | Yes | - |
| **Colour** | Yes | - |
| **Text content** | No | - |
| **Layer order** | No | - |

### Smart Animate Rules

| Rule | Description |
|------|-------------|
| **Matching names** | Same layer names for animated elements |
| **Same component** | Use same component for start/end |
| **Minimal properties** | Animate only position, size, opacity |
| **Test transitions** | Verify all transitions work smoothly |

---

## 5.5 Transition Consistency

### Transition Standards

| Transition | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| **Screen change** | 300ms | Ease in/out | Page navigation |
| **Overlay open** | 200ms | Ease out | Modal, popover |
| **Overlay close** | 150ms | Ease in | Dismiss overlay |
| **State change** | 200ms | Ease in/out | Toggle, checkbox |
| **Hover** | 100ms | Ease out | Hover states |

### Transition Rules

| Rule | Description |
|------|-------------|
| **Consistent timing** | Same duration for same type |
| **Appropriate easing** | Match easing to context |
| **Fast transitions** | Keep transitions under 300ms |
| **Test all transitions** | Verify all transitions work |

---

## 5.6 Demonstration Flows

### Demo Flow Types

| Type | Purpose | Audience |
|------|---------|----------|
| **Happy path** | Primary user flow | Stakeholders |
| **Edge cases** | Error handling | Development |
| **Accessibility** | A11y flows | QA team |
| **Responsive** | Breakpoint behaviour | Development |

### Demo Flow Rules

| Rule | Description |
|------|-------------|
| **Document purpose** | Explain what the demo shows |
| **Include narration** | Add explanatory notes |
| **Cover key scenarios** | Include all important paths |
| **Keep focused** | One demo per key flow |

---

## 5.7 Presentation Mode

### Presentation Settings

| Setting | Value |
|---------|-------|
| **Background** | `#F5F5F5` (light gray) |
| **Show UI** | Yes |
| **Show flow** | Yes |
| **Present at** | 100% zoom |

### Presentation Rules

| Rule | Description |
|------|-------------|
| **Clean presentation** | Remove unnecessary elements |
| **Consistent background** | Same background for all presentations |
| **Clear narration** | Explain what users see |
| **Interactive where possible** | Use interactive prototypes |

---

## 5.8 Stakeholder Review

### Review Preparation

| Step | Action |
|------|--------|
| 1 | Clean up prototype |
| 2 | Test all interactions |
| 3 | Prepare narration |
| 4 | Document questions |
| 5 | Schedule review |

### Review Documentation

| Element | Description |
|---------|-------------|
| **Flow overview** | What the prototype shows |
| **Key decisions** | Decisions needed |
| **Open questions** | Questions for stakeholders |
| **Feedback capture** | How feedback will be captured |

### Review Rules

| Rule | Description |
|------|-------------|
| **Prepare thoroughly** | Test everything before review |
| **Document feedback** | Capture all feedback |
| **Follow up** | Address feedback promptly |
| **Update prototype** | Update prototype based on feedback |

---


---

# Chapter 6 — Design QA Standards

---

## 6.1 Component Reuse Audit

### Audit Checks

| Check | Description | Pass Criteria |
|-------|-------------|---------------|
| **No manual recreation** | All components from library | 100% library usage |
| **Instance usage** | Components used as instances | All components are instances |
| **No detached components** | Components not detached unnecessarily | Zero unjustified detachments |
| **Override tracking** | All overrides documented | All overrides intentional |

### Audit Process

| Step | Action |
|------|--------|
| 1 | Scan file for manual components |
| 2 | Verify instance usage |
| 3 | Check for detached components |
| 4 | Document override usage |
| 5 | Report findings |

---

## 6.2 Variable Usage Audit

### Audit Checks

| Check | Description | Pass Criteria |
|-------|-------------|---------------|
| **No hard-coded colours** | All colours use variables | Zero hard-coded hex |
| **No hard-coded spacing** | All spacing uses variables | Zero hard-coded px |
| **No hard-coded typography** | All typography uses variables | Zero hard-coded sizes |
| **Consistent token usage** | Same tokens for same purposes | Consistent token mapping |

### Audit Process

| Step | Action |
|------|--------|
| 1 | Scan for hard-coded values |
| 2 | Verify variable usage |
| 3 | Check for consistency |
| 4 | Document exceptions |
| 5 | Report findings |

---

## 6.3 Token Compliance

### Compliance Checks

| Check | Description | Pass Criteria |
|-------|-------------|---------------|
| **Brand tokens** | Brand colours used correctly | Approved brand tokens only |
| **Semantic tokens** | Functional colours correct | Correct semantic mapping |
| **Neutral tokens** | UI colours consistent | Consistent neutral usage |
| **Spacing tokens** | Spacing values correct | Approved spacing tokens |

### Compliance Rules

| Rule | Description |
|------|-------------|
| **Use approved tokens** | Only approved design tokens |
| **Consistent application** | Same tokens for same purposes |
| **No custom tokens** | Don't create custom tokens |
| **Document exceptions** | Document any token exceptions |

---

## 6.4 Alignment & Spacing Audit

### Audit Checks

| Check | Description | Pass Criteria |
|-------|-------------|---------------|
| **Pixel-perfect alignment** | Elements properly aligned | No misalignment |
| **Consistent spacing** | Spacing follows grid | Consistent spacing |
| **Grid adherence** | Content aligns to grid | Grid alignment |
| **Responsive alignment** | Alignment maintained at breakpoints | Consistent alignment |

### Audit Process

| Step | Action |
|------|--------|
| 1 | Check alignment at breakpoints |
| 2 | Verify spacing consistency |
| 3 | Check grid adherence |
| 4 | Test responsive behaviour |
| 5 | Report findings |

---

## 6.5 Typography Consistency

### Audit Checks

| Check | Description | Pass Criteria |
|-------|-------------|---------------|
| **Type scale usage** | Approved type scale only | No custom sizes |
| **Weight usage** | Correct font weights | Approved weights only |
| **Line height** | Correct line heights | Consistent line heights |
| **Colour usage** | Correct text colours | Approved text colours |

### Audit Process

| Step | Action |
|------|--------|
| 1 | Scan for type inconsistencies |
| 2 | Verify type scale usage |
| 3 | Check weight and line height |
| 4 | Verify colour usage |
| 5 | Report findings |

---

## 6.6 Accessibility Audit

### Audit Checks

| Check | Description | Pass Criteria |
|-------|-------------|---------------|
| **Colour contrast** | WCAG 2.1 AA contrast | 4.5:1 for text, 3:1 for UI |
| **Touch targets** | Minimum 44px touch targets | All targets ≥ 44px |
| **Focus indicators** | Visible focus states | All interactive elements |
| **Screen reader** | Semantic structure | Proper heading hierarchy |

### Audit Process

| Step | Action |
|------|--------|
| 1 | Check colour contrast |
| 2 | Verify touch targets |
| 3 | Check focus indicators |
| 4 | Verify semantic structure |
| 5 | Report findings |

---

## 6.7 Responsive Behaviour Audit

### Audit Checks

| Check | Description | Pass Criteria |
|-------|-------------|---------------|
| **Breakpoint coverage** | All breakpoints designed | All 4 breakpoints |
| **Content reflow** | Content reflows properly | No content overflow |
| **Touch targets** | Touch targets appropriate | ≥ 44px on mobile |
| **Text readability** | Text readable at all sizes | Minimum 14px |

### Audit Process

| Step | Action |
|------|--------|
| 1 | Verify breakpoint coverage |
| 2 | Test content reflow |
| 3 | Check touch targets |
| 4 | Verify text readability |
| 5 | Report findings |

---

## 6.8 Interaction Consistency

### Audit Checks

| Check | Description | Pass Criteria |
|-------|-------------|---------------|
| **Hover states** | Consistent hover states | All interactive elements |
| **Focus states** | Consistent focus states | All interactive elements |
| **Active states** | Consistent active states | All interactive elements |
| **Disabled states** | Consistent disabled states | All interactive elements |

### Audit Process

| Step | Action |
|------|--------|
| 1 | Check hover states |
| 2 | Verify focus states |
| 3 | Check active states |
| 4 | Verify disabled states |
| 5 | Report findings |

---

## 6.9 Naming Compliance

### Audit Checks

| Check | Description | Pass Criteria |
|-------|-------------|---------------|
| **Frame naming** | Consistent frame naming | Hierarchical naming |
| **Layer naming** | Consistent layer naming | Descriptive naming |
| **Component naming** | Consistent component naming | Library naming conventions |
| **Section naming** | Consistent section naming | Module/Feature/Status |

### Audit Process

| Step | Action |
|------|--------|
| 1 | Scan frame names |
| 2 | Check layer names |
| 3 | Verify component names |
| 4 | Check section names |
| 5 | Report findings |

---

## 6.10 Documentation Completeness

### Audit Checks

| Check | Description | Pass Criteria |
|-------|-------------|---------------|
| **Screen purpose** | Each screen documented | Purpose statement |
| **User flow** | Flows documented | Flow diagrams |
| **Interaction notes** | Interactions annotated | All interactions |
| **Implementation notes** | Technical notes | All technical details |

### Audit Process

| Step | Action |
|------|--------|
| 1 | Check screen documentation |
| 2 | Verify flow documentation |
| 3 | Check interaction annotations |
| 4 | Verify implementation notes |
| 5 | Report findings |

---

## 6.11 Design System Compliance

### Compliance Checks

| Check | Description | Pass Criteria |
|-------|-------------|---------------|
| **Token usage** | Design tokens used correctly | Approved tokens only |
| **Component usage** | Components used correctly | Library components only |
| **Pattern usage** | Patterns used correctly | Approved patterns only |
| **Style consistency** | Visual style consistent | Consistent application |

### Compliance Rules

| Rule | Description |
|------|-------------|
| **Use approved elements** | Only approved design system elements |
| **Consistent application** | Same elements, same application |
| **Document exceptions** | Document any deviations |
| **Review required** | All deviations require review |

---

## 6.12 QA Checklist

### Pre-Release Checklist

| Category | Check | Status |
|----------|-------|--------|
| **Components** | All components from library | [ ] |
| **Variables** | All values use variables | [ ] |
| **Tokens** | Approved tokens only | [ ] |
| **Alignment** | Pixel-perfect alignment | [ ] |
| **Spacing** | Consistent spacing | [ ] |
| **Typography** | Consistent typography | [ ] |
| **Accessibility** | WCAG 2.1 AA compliant | [ ] |
| **Responsive** | All breakpoints covered | [ ] |
| **Interactions** | Consistent interactions | [ ] |
| **Naming** | Consistent naming | [ ] |
| **Documentation** | Complete documentation | [ ] |
| **Design System** | Design System compliant | [ ] |

### QA Process

| Step | Action |
|------|--------|
| 1 | Complete checklist |
| 2 | Document findings |
| 3 | Fix issues |
| 4 | Re-review |
| 5 | Approve for handoff |

---


---

# Chapter 7 — Developer Handoff

---

## 7.1 Dev Mode Readiness

### Readiness Requirements

| Requirement | Description |
|-------------|-------------|
| **Screens complete** | All screens finalised |
| **QA passed** | Design QA checklist complete |
| **Annotations complete** | All annotations added |
| **Export settings** | All assets export-ready |
| **Documentation** | Implementation notes complete |

### Readiness Checklist

| Check | Description | Status |
|-------|-------------|--------|
| **Screens finalised** | No pending design changes | [ ] |
| **QA checklist passed** | All QA checks passed | [ ] |
| **Annotations complete** | All interactions annotated | [ ] |
| **Assets ready** | All assets export-ready | [ ] |
| **Documentation complete** | All implementation notes | [ ] |

---

## 7.2 Annotation Standards

### Annotation Types

| Type | Colour | Usage |
|------|--------|-------|
| **Measurement** | Blue | Dimensions and spacing |
| **Interaction** | Green | User interactions |
| **State** | Orange | Component states |
| **Accessibility** | Purple | A11y requirements |
| **Responsive** | Red | Breakpoint behaviour |
| **Technical** | Gray | Implementation notes |

### Annotation Format

| Element | Format |
|---------|--------|
| **Measurement** | `[Value]px` or `[Token name]` |
| **Interaction** | `[Trigger] → [Action]` |
| **State** | `[Component]: [State]` |
| **Accessibility** | `aria-[attribute]: [value]` |
| **Responsive** | `[Breakpoint]: [Behaviour]` |

### Annotation Rules

| Rule | Description |
|------|-------------|
| **Clear and concise** | Annotations easy to understand |
| **Consistent style** | Same annotation style everywhere |
| **Non-intrusive** | Annotations don't obscure design |
| **Comprehensive** | All important details annotated |

---

## 7.3 Measurement Standards

### Measurement Types

| Type | Description | Example |
|------|-------------|---------|
| **Width** | Horizontal dimension | `320px` |
| **Height** | Vertical dimension | `48px` |
| **Padding** | Internal spacing | `16px` |
| **Margin** | External spacing | `24px` |
| **Gap** | Space between items | `8px` |

### Measurement Rules

| Rule | Description |
|------|-------------|
| **Use tokens** | Reference design tokens |
| **Pixel values** | Include pixel equivalents |
| **Consistent units** | Always use px |
| **Document exceptions** | Note any non-token values |

---

## 7.4 Variable Export

### Variable Documentation

| Variable Type | Documentation |
|---------------|---------------|
| **Colour** | Name, value, usage |
| **Typography** | Name, value, usage |
| **Spacing** | Name, value, usage |
| **Radius** | Name, value, usage |
| **Shadow** | Name, value, usage |

### Variable Rules

| Rule | Description |
|------|-------------|
| **Use token names** | Reference variable names |
| **Document values** | Include actual values |
| **Explain usage** | Document when to use |
| **Reference documentation** | Link to Design System |

---

## 7.5 Asset Export

### Export Formats

| Asset Type | Format | Settings |
|------------|--------|----------|
| **Icons** | SVG | Optimised paths |
| **Illustrations** | SVG | Optimised paths |
| **Photos** | PNG/JPG | Appropriate quality |
| **Backgrounds** | PNG/JPG | Appropriate quality |

### Export Rules

| Rule | Description |
|------|-------------|
| **Optimise assets** | Optimise file size |
| **Consistent naming** | Same naming as Figma |
| **Multiple sizes** | Export at 1x, 2x, 3x |
| **Document settings** | Document export settings |

---

## 7.6 Icon Export

### Icon Export Settings

| Setting | Value |
|---------|-------|
| **Format** | SVG |
| **Optimisation** | Optimise paths |
| **Colour** | Current colour (inherit) |
| **Size** | 24px × 24px |

### Icon Rules

| Rule | Description |
|------|-------------|
| **Consistent format** | Same format for all icons |
| **Optimised** | Optimise file size |
| **Accessible** | Include aria-hidden |
| **Document usage** | Document icon usage |

---

## 7.7 Image Optimisation

### Optimisation Rules

| Rule | Description |
|------|-------------|
| **Compress** | Optimise file size |
| **Appropriate format** | Use correct format |
| **Multiple sizes** | Export at required sizes |
| **Document settings** | Document optimisation settings |

### Image Formats

| Format | Usage | Quality |
|--------|-------|---------|
| **PNG** | Icons, illustrations | Lossless |
| **JPG** | Photos | Lossy |
| **SVG** | Vector graphics | Scalable |
| **WebP** | Modern web | Optimised |

---

## 7.8 Design Specifications

### Specification Contents

| Element | Description |
|---------|-------------|
| **Layout** | Grid, spacing, alignment |
| **Components** | Component usage and variants |
| **Typography** | Font, size, weight, colour |
| **Colours** | Background, text, accent colours |
| **Spacing** | Padding, margin, gap values |
| **Interactions** | User interactions and states |
| **Responsive** | Breakpoint behaviour |
| **Accessibility** | A11y requirements |

### Specification Format

| Format | Usage |
|--------|-------|
| **Figma Dev Mode** | Primary specification |
| **Annotations** | Inline annotations |
| **Documentation** | Written specifications |
| **Prototype** | Interactive demonstrations |

---

## 7.9 Interaction Notes

### Interaction Documentation

| Element | Description |
|---------|-------------|
| **Trigger** | What initiates the interaction |
| **Action** | What happens |
| **Feedback** | How user sees result |
| **Error handling** | What happens on error |
| **Accessibility** | A11y considerations |

### Interaction Format

```
[Trigger] → [Action]
Feedback: [How user sees result]
Error: [Error handling]
A11y: [Accessibility considerations]
```

### Interaction Rules

| Rule | Description |
|------|-------------|
| **Clear description** | Interactions easy to understand |
| **Complete documentation** | All aspects documented |
| **Consistent format** | Same format everywhere |
| **Reference prototypes** | Link to interactive prototypes |

---

## 7.10 Implementation Notes

### Technical Documentation

| Element | Description |
|---------|-------------|
| **Component structure** | How components are built |
| **State management** | How states are managed |
| **Responsive logic** | How responsiveness works |
| **Accessibility** | How accessibility is implemented |
| **Performance** | Performance considerations |

### Implementation Format

```markdown
## Component: [Name]

### Structure
- [Component structure details]

### States
- [State management details]

### Responsive
- [Responsive behaviour details]

### Accessibility
- [A11y implementation details]

### Performance
- [Performance considerations]
```

---

## 7.11 Traceability

### Traceability Requirements

| From | To | Requirement |
|------|----|-------------|
| **Screen** | Specification | Every screen traces to spec |
| **Component** | Design System | Every component from library |
| **Interaction** | User flow | Every interaction in flow |
| **Token** | Design token | Every token from system |

### Traceability Rules

| Rule | Description |
|------|-------------|
| **Document references** | Reference all specifications |
| **Link to source** | Link to original designs |
| **Version tracking** | Track design versions |
| **Change documentation** | Document all changes |

---


---

# Chapter 8 — Version Control & Collaboration

---

## 8.1 Branching Strategy

### Branch Types

| Branch Type | Purpose | Lifetime |
|-------------|---------|----------|
| **Main** | Production-ready designs | Permanent |
| **Feature** | New feature development | Temporary |
| **Release** | Release preparation | Temporary |
| **Hotfix** | Critical fixes | Temporary |

### Branch Naming

| Branch Type | Pattern | Example |
|-------------|---------|---------|
| **Feature** | `feature/[name]` | `feature/student-enrollment` |
| **Release** | `release/[version]` | `release/v1.2.0` |
| **Hotfix** | `hotfix/[name]` | `hotfix/fix-login-flow` |

### Branch Rules

| Rule | Description |
|------|-------------|
| **One feature per branch** | Each branch handles one feature |
| **Short-lived branches** | Merge within 1 week |
| **No direct changes** | Never change main directly |
| **Review required** | All merges require review |

---

## 8.2 Merging Standards

### Merge Requirements

| Requirement | Description |
|-------------|-------------|
| **Design review** | All designs reviewed before merge |
| **QA passed** | Design QA checklist complete |
| **Conflicts resolved** | All merge conflicts resolved |
| **Documentation updated** | Documentation current |

### Merge Process

| Step | Action |
|------|--------|
| 1 | Complete design work |
| 2 | Run design QA |
| 3 | Request review |
| 4 | Address feedback |
| 5 | Merge to main |

### Merge Rules

| Rule | Description |
|------|-------------|
| **Review required** | All merges require review |
| **No force merges** | Never force merge |
| **Clean history** | Maintain clean commit history |
| **Document changes** | Document all changes |

---

## 8.3 Review Workflow

### Review Types

| Review Type | Purpose | Reviewers |
|-------------|---------|-----------|
| **Design review** | Visual quality | Design team |
| **Technical review** | Implementation feasibility | Development team |
| **Accessibility review** | A11y compliance | A11y specialist |
| **QA review** | Quality assurance | QA team |

### Review Process

| Step | Action |
|------|--------|
| 1 | Self-review against checklist |
| 2 | Request peer review |
| 3 | Address feedback |
| 4 | Request design lead review |
| 5 | Final approval |

### Review Rules

| Rule | Description |
|------|-------------|
| **Timely reviews** | Complete reviews within 24 hours |
| **Constructive feedback** | Provide actionable feedback |
| **Document decisions** | Record all design decisions |
| **No blocking** | Don't block without reason |

---

## 8.4 Approval Process

### Approval Levels

| Level | Approver | Scope |
|-------|----------|-------|
| **Component** | Design Lead | New/changed components |
| **Screen** | Design Lead | New/changed screens |
| **Pattern** | Design Lead | New/changed patterns |
| **Token** | Design Lead | New/changed tokens |

### Approval Process

| Step | Action |
|------|--------|
| 1 | Complete design work |
| 2 | Complete QA checklist |
| 3 | Submit for approval |
| 4 | Address feedback |
| 5 | Receive approval |

### Approval Rules

| Rule | Description |
|------|-------------|
| **Required approval** | All changes require approval |
| **Timely approval** | Complete approvals within 48 hours |
| **Document approval** | Record all approvals |
| **No unapproved changes** | Never ship unapproved changes |

---

## 8.5 Design Ownership

### Ownership Model

| Element | Owner | Responsibility |
|---------|-------|---------------|
| **Design System** | Design Lead | Governance, review |
| **Tokens** | Design Lead | Token management |
| **Components** | Assigned Designer | Component maintenance |
| **Screens** | Assigned Designer | Screen design |
| **Documentation** | Assigned Designer | Documentation |

### Ownership Rules

| Rule | Description |
|------|-------------|
| **Clear ownership** | Every element has an owner |
| **Accountable** | Owners accountable for quality |
| **Transferable** | Ownership can be transferred |
| **Documented** | Ownership documented |

---

## 8.6 Change Tracking

### Change Types

| Change Type | Description | Documentation |
|-------------|-------------|---------------|
| **Addition** | New element | Full documentation |
| **Modification** | Changed element | Change notes |
| **Deprecation** | Deprecated element | Migration guide |
| **Removal** | Removed element | Removal notes |

### Change Documentation

| Element | Description |
|---------|-------------|
| **What changed** | Description of change |
| **Why changed** | Rationale for change |
| **Impact** | Impact on existing designs |
| **Migration** | Migration instructions |

### Change Rules

| Rule | Description |
|------|-------------|
| **Document all changes** | Record every significant change |
| **Include rationale** | Explain why changes were made |
| **Reference tickets** | Link to design tickets |
| **Date stamp** | Include date of change |

---

## 8.7 Release Tagging

### Release Types

| Release Type | Version | Description |
|--------------|---------|-------------|
| **Major** | `v1.0.0` | Breaking changes |
| **Minor** | `v1.1.0` | New features |
| **Patch** | `v1.0.1` | Bug fixes |

### Release Process

| Step | Action |
|------|--------|
| 1 | Complete all changes |
| 2 | Update version number |
| 3 | Update changelog |
| 4 | Test all changes |
| 5 | Publish release |

### Release Rules

| Rule | Description |
|------|-------------|
| **Semantic versioning** | Follow semantic versioning |
| **Changelog required** | Document all changes |
| **Test before release** | Verify all changes work |
| **Notify consumers** | Announce releases |

---

## 8.8 Library Updates

### Update Process

| Step | Action |
|------|--------|
| 1 | Complete design changes |
| 2 | Review all changes |
| 3 | Update version number |
| 4 | Publish library |
| 5 | Notify consumers |

### Update Rules

| Rule | Description |
|------|-------------|
| **Review required** | All updates require review |
| **Test before publish** | Verify all instances update |
| **Version bump** | Update version before publish |
| **Document changes** | Document all changes |

---

## 8.9 Rollback Procedures

### Rollback Triggers

| Trigger | Action |
|---------|--------|
| **Critical bug** | Immediate rollback |
| **Breaking change** | Rollback if unfixable |
| **Consumer issues** | Rollback if widespread |

### Rollback Process

| Step | Action |
|------|--------|
| 1 | Identify issue |
| 2 | Assess impact |
| 3 | Rollback to previous version |
| 4 | Notify consumers |
| 5 | Fix and re-release |

### Rollback Rules

| Rule | Description |
|------|-------------|
| **Quick rollback** | Rollback within 1 hour |
| **Notify consumers** | Inform all consumers |
| **Document issue** | Document the issue |
| **Fix and re-release** | Fix and release properly |

---


---

# Chapter 9 — AI-Assisted Design Workflow

---

## 9.1 Required Documentation Loading

### Pre-Design Documentation

| Document | When Required | Purpose |
|----------|---------------|---------|
| **Documentation Constitution** | Always | Governing standard |
| **Design System** | Always | Design tokens and components |
| **UI Strategy** | Always | Design philosophy and principles |
| **Engineering Specs** | When implementing | Technical specifications |
| **Platform Standards** | When implementing | Engineering standards |
| **Architecture Docs** | When making decisions | Architectural context |

### Loading Rules

| Rule | Description |
|------|-------------|
| **Load before designing** | Always load documentation first |
| **Relevant context only** | Only load relevant documentation |
| **Document what was loaded** | Record which documents were read |
| **Avoid context overflow** | Don't load unnecessary documentation |

---

## 9.2 Constitution Compliance

### Mandatory Rules

| Rule | Description |
|------|-------------|
| **Never invent design patterns** | Patterns come only from approved documentation |
| **Never create undocumented components** | Components must be documented before reuse |
| **Never bypass the Design System** | All UI must use approved tokens and components |
| **All designs use approved tokens** | Design tokens must match approved system |
| **New components documented first** | Document before using |
| **Visual consistency** | Maintain consistency across platform |
| **Traceable decisions** | Design decisions trace to approved documentation |

### Compliance Checks

| Check | Description |
|-------|-------------|
| **No assumptions** | Verify no undocumented assumptions |
| **No contradictions** | Verify no contradictions with approved docs |
| **No inventions** | Verify no patterns, components, or tokens invented |
| **References valid** | Verify all cross-references point to existing content |
| **Terminology consistent** | Verify terminology matches approved documentation |

---

## 9.3 Design System Compliance

### Compliance Requirements

| Requirement | Description |
|-------------|-------------|
| **Use approved tokens** | Only approved design tokens |
| **Use approved components** | Only library components |
| **Use approved patterns** | Only approved patterns |
| **Follow responsive guidelines** | Follow approved breakpoints |
| **Follow accessibility standards** | Follow WCAG 2.1 AA |

### Compliance Rules

| Rule | Description |
|------|-------------|
| **Derive, don't invent** | Derive from approved sources |
| **Reference, don't duplicate** | Reference existing documentation |
| **Extend, don't contradict** | Extend without contradicting |
| **Fill gaps, don't replace** | Fill gaps without replacing |

---

## 9.4 Component Reuse Requirements

### Reuse Rules

| Rule | Description |
|------|-------------|
| **Always check library** | Check library before creating |
| **Use instances** | Always use component instances |
| **Don't duplicate** | Never duplicate existing components |
| **Document new components** | Document before using |

### Reuse Process

| Step | Action |
|------|--------|
| 1 | Check existing library |
| 2 | Find matching component |
| 3 | Use instance |
| 4 | Override if needed |
| 5 | Document any new components |

---

## 9.5 New Component Validation

### Validation Requirements

| Requirement | Description |
|-------------|-------------|
| **No existing component** | Verify no matching component exists |
| **Genuine need** | Verify genuine need for new component |
| **Design review** | All new components require review |
| **Documentation** | Document before using |
| **Accessibility** | Meet WCAG 2.1 AA |

### Validation Process

| Step | Action |
|------|--------|
| 1 | Search existing library |
| 2 | Document why existing components insufficient |
| 3 | Design new component |
| 4 | Document component |
| 5 | Submit for review |

---

## 9.6 Design Review Expectations

### Review Requirements

| Requirement | Description |
|-------------|-------------|
| **Self-review** | Complete self-review first |
| **Checklist complete** | Complete QA checklist |
| **Documentation complete** | All documentation current |
| **Accessibility reviewed** | A11y requirements met |
| **Responsive reviewed** | All breakpoints covered |

### Review Process

| Step | Action |
|------|--------|
| 1 | Complete self-review |
| 2 | Complete QA checklist |
| 3 | Document decisions |
| 4 | Submit for review |
| 5 | Address feedback |

---

## 9.7 Human Approval Boundaries

### Reserved Decisions

| Decision Type | Description |
|---------------|-------------|
| **Business requirements** | Feature scope, user stories |
| **Product scope** | Which features included/excluded |
| **UI/UX philosophy changes** | Design system changes |
| **Breaking changes** | Any breaking change |
| **New design patterns** | New interaction patterns |

### AI Limitations

| AI May | AI May Not |
|--------|-----------|
| Implement approved designs | Decide which designs to implement |
| Follow approved patterns | Choose new patterns |
| Generate per specifications | Invent new specifications |
| Document approved decisions | Make design decisions |
| Flag issues for review | Resolve issues independently |

---

## 9.8 Handling Uncertainty

### Uncertainty Rules

| Rule | Description |
|------|-------------|
| **Flag uncertainty** | Don't make assumptions |
| **Ask when unsure** | Request clarification |
| **Document gaps** | Record missing information |
| **Wait for approval** | Don't proceed without clarity |

### Uncertainty Process

| Step | Action |
|------|--------|
| 1 | Identify uncertainty |
| 2 | Document the gap |
| 3 | Flag for review |
| 4 | Wait for clarification |
| 5 | Proceed with approved guidance |

---


---

# Chapter 10 — Future Evolution

---

## 10.1 Component Library Expansion

### Expansion Strategy

| Phase | Focus | Timeline |
|-------|-------|----------|
| **Phase 1** | Core components, tokens, basic patterns | Q1 |
| **Phase 2** | Advanced components, complex patterns | Q2 |
| **Phase 3** | Platform-specific patterns, advanced interactions | Q3 |
| **Phase 4** | AI-assisted design, predictive UI | Q4 |

### Expansion Rules

| Rule | Description |
|------|-------------|
| **Need-based expansion** | Expand based on product needs |
| **Review required** | All new components require review |
| **Documentation first** | Document before implementing |
| **Consistent quality** | Maintain quality standards |

### Component Roadmap

| Quarter | Components |
|---------|------------|
| **Q1** | Button, Input, Select, Card, Badge |
| **Q2** | Table, Modal, Toast, Avatar, Tabs |
| **Q3** | Chart, Calendar, Upload, Accordion |
| **Q4** | Tree, Rich Text, Code Editor |

---

## 10.2 New Design Patterns

### Pattern Introduction Process

| Step | Action |
|------|--------|
| 1 | Identify pattern need |
| 2 | Research existing solutions |
| 3 | Design pattern |
| 4 | Document pattern |
| 5 | Review and approve |

### Pattern Rules

| Rule | Description |
|------|-------------|
| **Genuine need** | Verify genuine need for new pattern |
| **Review required** | All new patterns require review |
| **Documentation required** | Document before using |
| **Consistent with existing** | Must align with existing patterns |

---

## 10.3 Variable Updates

### Update Process

| Step | Action |
|------|--------|
| 1 | Identify variable need |
| 2 | Design variable |
| 3 | Document variable |
| 4 | Review and approve |
| 5 | Publish update |

### Update Rules

| Rule | Description |
|------|-------------|
| **Need-based updates** | Update based on product needs |
| **Review required** | All updates require review |
| **Backwards compatible** | Maintain backwards compatibility |
| **Document changes** | Document all changes |

---

## 10.4 Component Deprecation

### Deprecation Process

| Step | Action |
|------|--------|
| 1 | Mark component as deprecated |
| 2 | Add deprecation notice |
| 3 | Document replacement |
| 4 | Update all references |
| 5 | Remove after grace period |

### Deprecation Rules

| Rule | Description |
|------|-------------|
| **Grace period** | Minimum 30 days before removal |
| **Clear replacement** | Document replacement component |
| **Migration guide** | Provide migration instructions |
| **No breaking changes** | Don't break existing usage |

---

## 10.5 Backwards Compatibility

### Compatibility Rules

| Rule | Description |
|------|-------------|
| **Maintain compatibility** | Keep backwards compatibility |
| **Deprecation period** | Provide deprecation period |
| **Migration support** | Provide migration guides |
| **Version tracking** | Track version changes |

### Breaking Changes

| Change Type | Process |
|-------------|---------|
| **Prop removal** | Deprecate, then remove |
| **Prop rename** | Deprecate old, add new |
| **Behaviour change** | Version bump, document |
| **Visual change** | Version bump, document |

---

## 10.6 Design System Scaling

### Scaling Strategy

| Dimension | Strategy |
|-----------|----------|
| **Components** | Modular component architecture |
| **Tokens** | Hierarchical token system |
| **Patterns** | Composable pattern library |
| **Documentation** | Scalable documentation |

### Scaling Rules

| Rule | Description |
|------|-------------|
| **Modular architecture** | Build for modularity |
| **Consistent patterns** | Maintain consistent patterns |
| **Document everything** | Document all decisions |
| **Review required** | All changes require review |

### Scaling Considerations

| Consideration | Description |
|---------------|-------------|
| **Performance** | Maintain design file performance |
| **Organisation** | Keep files organised |
| **Collaboration** | Support team collaboration |
| **Quality** | Maintain quality standards |

---

# Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | July 2026 | Architecture Team | Initial Figma standards and design QA |

---

*Document Version: 1.0*  
*Last Updated: July 2026*  
*Status: Approved*  
*Classification: Internal*

---

**END OF DOCUMENT**

