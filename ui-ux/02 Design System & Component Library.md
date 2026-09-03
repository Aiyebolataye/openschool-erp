# OpenSchool ERP

## Design System & Component Library

---

| Field | Value |
|-------|-------|
| **Document** | Design System & Component Library |
| **Version** | 1.0 |
| **Status** | Approved |
| **Date** | July 2026 |
| **Classification** | Internal |
| **Author** | Architecture Team |
| **Owner** | Solution Architect |

---

| Aspect | Detail |
|--------|--------|
| **Purpose** | Authoritative reference for every reusable design element across the platform |
| **Scope** | All design tokens, components, patterns, and standards |
| **Governing Documents** | Documentation Constitution, UI Strategy & Design Direction |
| **Derived From** | Approved UI Strategy & Design Direction, System Architecture, Engineering Specifications |

---

## Table of Contents

### Chapter 1 — Design Foundations
1.1 Design Token Philosophy
1.2 Colour System
1.3 Typography System
1.4 Spacing Scale
1.5 Grid System
1.6 Layout System
1.7 Border Radius
1.8 Borders
1.9 Shadows & Elevation
1.10 Blur & Opacity
1.11 Z-Index Scale
1.12 Breakpoints
1.13 Animation & Motion
1.13.1 Design Tokens as Figma Variables
1.14 Data Density Standards

### Chapter 2 — Layout & Navigation
2.1 Desktop Layout
2.2 Tablet Layout
2.3 Mobile Layout
2.4 Containers & Content Widths
2.5 Page Templates
2.6 Sidebar Navigation
2.7 Top Navigation
2.8 Breadcrumbs
2.9 Tabs
2.10 Wizards
2.11 Search
2.12 Command Palette
2.13 Notification Panel
2.14 User Menu
2.15 Reusable Layout Templates

### Chapter 3 — Component Library
3.1 Inputs
3.2 Data Display
3.3 Feedback
3.4 Dashboard
3.5 Permission-Aware Component Behaviour
3.6 Standard Component State Matrix
3.7 Component Composition

### Chapter 4 — Data Visualisation
4.1 Chart Standards
4.2 Line Charts
4.3 Bar Charts
4.4 Pie & Donut Charts
4.5 Area Charts
4.6 Data Tables
4.7 Trend Indicators
4.8 Legends & Labels
4.9 Empty & Error States

### Chapter 5 — Motion, Accessibility & Responsiveness
5.1 Motion Standards
5.2 Accessibility Standards
5.3 Responsive Standards
5.4 Internationalisation & Localisation Support
5.5 Design Performance Budget

### Chapter 6 — Component Governance
6.1 Naming Conventions
6.2 Component Lifecycle
6.3 Versioning
6.4 Deprecation Process
6.5 Approval Process

---

# Chapter 1 — Design Foundations

---

## 1.1 Design Token Philosophy

### Purpose

Design tokens are the atomic values that define the visual language of OpenSchool ERP. They ensure consistency across all interfaces, enable theme customisation, and provide a single source of truth for visual decisions.

### Token Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| **Brand** | Core brand identity | Primary blue, secondary gray |
| **Semantic** | Functional meaning | Error red, success green, warning amber |
| **Neutral** | UI structure | Background, border, text hierarchy |
| **Component** | Component-specific | Button padding, input height, card radius |

### Token Naming Convention

```
{category}-{property}-{variant}-{state}
```

| Segment | Description | Example |
|---------|-------------|---------|
| **category** | Token category | `brand`, `semantic`, `neutral` |
| **property** | Visual property | `color`, `spacing`, `radius` |
| **variant** | Specific variant | `primary`, `error`, `sm` |
| **state** | Interaction state | `default`, `hover`, `active`, `disabled` |

### Token Examples

| Token | Value | Usage |
|-------|-------|-------|
| `brand-color-primary` | `#2563EB` | Primary action buttons, links |
| `semantic-color-error` | `#DC2626` | Error states, destructive actions |
| `neutral-color-bg` | `#FFFFFF` | Page background |
| `neutral-color-text-primary` | `#111827` | Primary text |
| `spacing-md` | `16px` | Standard component padding |
| `radius-md` | `8px` | Standard component radius |

---

## 1.2 Colour System

### Brand Colours

| Colour | Token | Hex | Usage |
|--------|-------|-----|-------|
| **Primary** | `brand-color-primary` | `#2563EB` | Primary actions, links, focus |
| **Primary Light** | `brand-color-primary-light` | `#3B82F6` | Hover states, secondary emphasis |
| **Primary Dark** | `brand-color-primary-dark` | `#1D4ED8` | Active states, pressed |
| **Primary Subtle** | `brand-color-primary-subtle` | `#EFF6FF` | Backgrounds, subtle emphasis |

### Semantic Colours

| Colour | Token | Hex | Usage |
|--------|-------|-----|-------|
| **Success** | `semantic-color-success` | `#16A34A` | Positive outcomes, confirmations |
| **Success Light** | `semantic-color-success-light` | `#22C55E` | Hover states |
| **Success Subtle** | `semantic-color-success-subtle` | `#F0FDF4` | Backgrounds |
| **Warning** | `semantic-color-warning` | `#D97706` | Caution, attention needed |
| **Warning Light** | `semantic-color-warning-light` | `#F59E0B` | Hover states |
| **Warning Subtle** | `semantic-color-warning-subtle` | `#FFFBEB` | Backgrounds |
| **Error** | `semantic-color-error` | `#DC2626` | Errors, destructive actions |
| **Error Light** | `semantic-color-error-light` | `#EF4444` | Hover states |
| **Error Subtle** | `semantic-color-error-subtle` | `#FEF2F2` | Backgrounds |
| **Info** | `semantic-color-info` | `#2563EB` | Information, neutral notices |
| **Info Light** | `semantic-color-info-light` | `#3B82F6` | Hover states |
| **Info Subtle** | `semantic-color-info-subtle` | `#EFF6FF` | Backgrounds |

### Neutral Colours

| Colour | Token | Hex | Usage |
|--------|-------|-----|-------|
| **White** | `neutral-color-white` | `#FFFFFF` | Backgrounds, cards |
| **Gray 50** | `neutral-color-gray-50` | `#F9FAFB` | Subtle backgrounds |
| **Gray 100** | `neutral-color-gray-100` | `#F3F4F6` | Hover backgrounds |
| **Gray 200** | `neutral-color-gray-200` | `#E5E7EB` | Borders, dividers |
| **Gray 300** | `neutral-color-gray-300` | `#D1D5DB` | Disabled borders |
| **Gray 400** | `neutral-color-gray-400` | `#9CA3AF` | Placeholder text |
| **Gray 500** | `neutral-color-gray-500` | `#6B7280` | Secondary text |
| **Gray 600** | `neutral-color-gray-600` | `#4B5563` | Body text |
| **Gray 700** | `neutral-color-gray-700` | `#374151` | Headings |
| **Gray 800** | `neutral-color-gray-800` | `#1F2937` | Primary text |
| **Gray 900** | `neutral-color-gray-900` | `#111827` | Strongest text |

### Colour Usage Rules

| Rule | Description |
|------|-------------|
| **Primary for actions** | Use primary colour for main call-to-action elements |
| **Semantic for status** | Use semantic colours only for their intended meaning |
| **Neutral for structure** | Use neutral colours for borders, backgrounds, text |
| **Consistent mapping** | Same colours for same meanings across all screens |
| **Accessible contrast** | Ensure minimum 4.5:1 contrast for text |

---

## 1.3 Typography System

### Font Family

| Platform | Font | Fallback |
|----------|------|----------|
| **Web** | Inter | -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif |
| **Mobile** | Inter | System default |

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-display-lg` | 36px | 44px | 700 | Hero headings |
| `text-display-md` | 30px | 36px | 700 | Section headings |
| `text-display-sm` | 24px | 32px | 600 | Card headings |
| `text-heading-lg` | 20px | 28px | 600 | Page titles |
| `text-heading-md` | 16px | 24px | 600 | Subsection headings |
| `text-heading-sm` | 14px | 20px | 600 | Card titles |
| `text-body-lg` | 16px | 24px | 400 | Body text (large) |
| `text-body-md` | 14px | 20px | 400 | Body text (standard) |
| `text-body-sm` | 12px | 16px | 400 | Helper text, labels |
| `text-caption` | 12px | 16px | 400 | Captions, metadata |
| `text-overline` | 12px | 16px | 500 | Overlines, labels |
| `text-button-lg` | 14px | 20px | 500 | Large buttons |
| `text-button-md` | 14px | 20px | 500 | Standard buttons |
| `text-button-sm` | 12px | 16px | 500 | Small buttons |

### Font Weights

| Weight | Token | Usage |
|--------|-------|-------|
| 400 | `font-regular` | Body text, descriptions |
| 500 | `font-medium` | Labels, buttons, emphasis |
| 600 | `font-semibold` | Headings, strong emphasis |
| 700 | `font-bold` | Display headings |

### Typography Rules

| Rule | Description |
|------|-------------|
| **Hierarchy** | Use type scale for clear visual hierarchy |
| **Consistency** | Same type scale across all modules |
| **Readability** | Minimum 14px for body text |
| **Line height** | 1.4-1.5x font size for body text |
| **Letter spacing** | Normal for body; slight negative for headings |

---

## 1.4 Spacing Scale

### Spacing Values

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-xs` | 4px | Tight spacing, inline elements |
| `spacing-sm` | 8px | Small gaps, compact layouts |
| `spacing-md` | 16px | Standard spacing, component padding |
| `spacing-lg` | 24px | Section spacing, card padding |
| `spacing-xl` | 32px | Large section spacing |
| `spacing-2xl` | 48px | Page section spacing |
| `spacing-3xl` | 64px | Major section spacing |

### Spacing Rules

| Rule | Description |
|------|-------------|
| **Consistent rhythm** | Use spacing scale for all measurements |
| **Multiples of 4** | All spacing values are multiples of 4px |
| **Generous whitespace** | Prefer larger spacing for readability |
| **Context-appropriate** | Match spacing to content density |

---

## 1.5 Grid System

### Grid Specifications

| Property | Value |
|----------|-------|
| **Columns** | 12 (desktop), 8 (tablet), 4 (mobile) |
| **Gutter** | 24px (desktop), 16px (tablet/mobile) |
| **Margin** | 32px (desktop), 16px (tablet), 16px (mobile) |

### Grid Breakpoints

| Breakpoint | Columns | Gutter | Margin |
|-----------|---------|--------|--------|
| Desktop (> 1024px) | 12 | 24px | 32px |
| Tablet (640-1024px) | 8 | 16px | 16px |
| Mobile (< 640px) | 4 | 16px | 16px |

### Grid Usage

| Pattern | Columns | Description |
|---------|---------|-------------|
| **Full width** | 12 | Dashboards, data tables |
| **Sidebar + content** | 3 + 9 | Navigation with content |
| **Two columns** | 6 + 6 | Side-by-side layouts |
| **Three columns** | 4 + 4 + 4 | Card layouts |
| **Asymmetric** | 4 + 8 | Sidebar with main content |

---

## 1.6 Layout System

### Content Widths

| Token | Width | Usage |
|-------|-------|-------|
| `content-sm` | 640px | Narrow content, forms |
| `content-md` | 768px | Standard content |
| `content-lg` | 1024px | Wide content |
| `content-xl` | 1280px | Full-width layouts |
| `content-full` | 100% | Fluid layouts |

### Layout Patterns

| Pattern | Usage |
|---------|-------|
| **Single column** | Forms, narrow content |
| **Two columns** | Split views, settings |
| **Three columns** | Dashboard widgets |
| **Sidebar** | Navigation with content |
| **Full width** | Data tables, dashboards |

---

## 1.7 Border Radius

### Radius Values

| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0px | No radius |
| `radius-sm` | 4px | Small elements, tags |
| `radius-md` | 8px | Buttons, inputs, cards |
| `radius-lg` | 12px | Modals, drawers |
| `radius-xl` | 16px | Large cards, panels |
| `radius-full` | 9999px | Pills, avatars |

### Radius Rules

| Rule | Description |
|------|-------------|
| **Consistent** | Same radius for same element types |
| **Purposeful** | Radius communicates element hierarchy |
| **Never excessive** | Avoid overly rounded corners |

---

## 1.8 Borders

### Border Values

| Token | Width | Colour | Usage |
|-------|-------|--------|-------|
| `border-default` | 1px | `neutral-color-gray-200` | Default borders |
| `border-strong` | 1px | `neutral-color-gray-300` | Emphasised borders |
| `border-focus` | 2px | `brand-color-primary` | Focus states |
| `border-error` | 1px | `semantic-color-error` | Error states |

### Border Rules

| Rule | Description |
|------|-------------|
| **Subtle** | Use light borders; prefer spacing for separation |
| **Consistent** | Same border styles across all components |
| **Purposeful** | Borders communicate structure, not decoration |

---

## 1.9 Shadows & Elevation

### Shadow Values

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Standard elevation |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Elevated elements |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.1)` | High elevation |

### Elevation Levels

| Level | Shadow | Usage |
|-------|--------|-------|
| **0** | None | Flat elements |
| **1** | `shadow-sm` | Buttons, inputs |
| **2** | `shadow-md` | Cards, dropdowns |
| **3** | `shadow-lg` | Modals, popovers |
| **4** | `shadow-xl` | Toasts, notifications |

### Shadow Rules

| Rule | Description |
|------|-------------|
| **Subtle** | Use subtle shadows; avoid heavy shadows |
| **Purposeful** | Shadows communicate hierarchy, not decoration |
| **Consistent** | Same shadow levels across all components |

---

## 1.10 Blur & Opacity

### Blur Values

| Token | Value | Usage |
|-------|-------|-------|
| `blur-sm` | 4px | Subtle blur effects |
| `blur-md` | 8px | Modal backdrops |
| `blur-lg` | 16px | Glassmorphism (sparingly) |

### Opacity Values

| Token | Value | Usage |
|-------|-------|-------|
| `opacity-disabled` | 0.5 | Disabled elements |
| `opacity-hover` | 0.8 | Hover states |
| `opacity-overlay` | 0.5 | Modal backdrops |

### Blur & Opacity Rules

| Rule | Description |
|------|-------------|
| **Subtle glassmorphism** | Use glass effects sparingly; never sacrifice readability |
| **Disabled states** | Use opacity for disabled elements |
| **Overlay** | Use opacity for modal backdrops |

---

## 1.11 Z-Index Scale

### Z-Index Values

| Token | Value | Usage |
|-------|-------|-------|
| `z-base` | 0 | Base layer |
| `z-dropdown` | 100 | Dropdowns, popovers |
| `z-sticky` | 200 | Sticky elements |
| `z-overlay` | 300 | Modal backdrops |
| `z-modal` | 400 | Modals, dialogs |
| `z-toast` | 500 | Toasts, notifications |
| `z-tooltip` | 600 | Tooltips |

### Z-Index Rules

| Rule | Description |
|------|-------------|
| **Systematic** | Use z-index scale; avoid arbitrary values |
| **Layered** | Higher z-index for elements that appear above others |
| **Minimal** | Use lowest possible z-index for each element |

---

## 1.12 Breakpoints

### Breakpoint Values

| Token | Min Width | Max Width | Target |
|-------|-----------|-----------|--------|
| `bp-mobile` | 0px | 639px | Mobile phones |
| `bp-tablet` | 640px | 1023px | Tablets |
| `bp-desktop` | 1024px | 1439px | Desktops |
| `bp-wide` | 1440px | - | Wide screens |

### Breakpoint Rules

| Rule | Description |
|------|-------------|
| **Mobile-first** | Design for mobile; enhance for desktop |
| **Content-driven** | Breakpoints based on content needs |
| **Consistent** | Same breakpoints across all components |

---

## 1.13 Animation & Motion

### Animation Durations

| Token | Value | Usage |
|-------|-------|-------|
| `duration-fast` | 100ms | Micro-interactions |
| `duration-normal` | 200ms | Standard transitions |
| `duration-slow` | 300ms | Complex transitions |
| `duration-slower` | 500ms | Page transitions |

### Easing Curves

| Token | Value | Usage |
|-------|-------|-------|
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard easing |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Entering elements |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Exiting elements |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | State changes |

### Motion Rules

| Rule | Description |
|------|-------------|
| **Purposeful** | Every animation serves a function |
| **Fast** | Keep animations under 300ms |
| **Subtle** | Avoid distracting animations |
| **Consistent** | Same durations for same animation types |
| **Respectful** | Support prefers-reduced-motion |

---

## 1.13.1 Design Tokens as Figma Variables

### Purpose

Define how every approved design token should be represented inside Figma using Variable Collections. This ensures Figma designs and implementation share identical token values.

### Colour Variables

| Collection | Naming Pattern | Description |
|------------|---------------|-------------|
| **Brand** | `brand/color/primary`, `brand/color/secondary` | Brand identity colours |
| **Semantic** | `semantic/color/success`, `semantic/color/error` | Functional meaning colours |
| **Neutral** | `neutral/color/gray-100`, `neutral/color/gray-200` | UI structure colours |

| Mode | Description |
|------|-------------|
| **Light** | Default light theme values |
| **Dark** | Dark theme values (future) |

### Typography Variables

| Collection | Naming Pattern | Description |
|------------|---------------|-------------|
| **Font Family** | `typography/font/heading`, `typography/font/body` | Type families |
| **Font Size** | `typography/size/xs`, `typography/size/sm` | Type scale |
| **Font Weight** | `typography/weight/regular`, `typography/weight/semibold` | Type weights |
| **Line Height** | `typography/line-height/xs`, `typography/line-height/sm` | Leading values |

### Spacing Variables

| Collection | Naming Pattern | Description |
|------------|---------------|-------------|
| **Spacing** | `spacing/xs`, `spacing/sm`, `spacing/md` | Spacing scale |
| **Density** | `density/comfortable/md`, `density/compact/md` | Density-aware spacing |

### Radius Variables

| Collection | Naming Pattern | Description |
|------------|---------------|-------------|
| **Border Radius** | `radius/none`, `radius/sm`, `radius/md` | Corner radius values |

### Border Variables

| Collection | Naming Pattern | Description |
|------------|---------------|-------------|
| **Border Width** | `border/width/sm`, `border/width/md` | Border thickness |
| **Border Colour** | `border/color/default`, `border/color/focus` | Border colours |

### Shadow Variables

| Collection | Naming Pattern | Description |
|------------|---------------|-------------|
| **Elevation** | `shadow/sm`, `shadow/md`, `shadow/lg` | Shadow depth levels |

### Elevation Variables

| Collection | Naming Pattern | Description |
|------------|---------------|-------------|
| **Elevation Level** | `elevation/0`, `elevation/1`, `elevation/2` | Z-index layering |

### Blur Variables

| Collection | Naming Pattern | Description |
|------------|---------------|-------------|
| **Blur** | `blur/sm`, `blur/md`, `blur/lg` | Blur amounts |

### Opacity Variables

| Collection | Naming Pattern | Description |
|------------|---------------|-------------|
| **Opacity** | `opacity/disabled`, `opacity/hover`, `opacity/overlay` | Transparency levels |

### Motion Variables

| Collection | Naming Pattern | Description |
|------------|---------------|-------------|
| **Duration** | `motion/duration/fast`, `motion/duration/normal` | Animation timing |
| **Easing** | `motion/easing/default`, `motion/easing/in` | Easing curves |

### Breakpoint Variables

| Collection | Naming Pattern | Description |
|------------|---------------|-------------|
| **Breakpoint** | `breakpoint/mobile`, `breakpoint/tablet` | Responsive breakpoints |

### Variable Organisation

| Principle | Description |
|-----------|-------------|
| **Hierarchical naming** | Use `/` separator for clear hierarchy |
| **Consistent prefixes** | Same prefix for same category |
| **Semantic aliases** | Reference primitive values through semantic names |
| **Mode support** | Use modes for theme variations |
| **Scoping** | Scope variables to relevant properties |

### Variable Collections

| Collection | Contents | Modes |
|------------|----------|-------|
| **Primitives** | Raw colour values, spacing values | None |
| **Semantic** | Functional colour assignments, spacing usage | Light, Dark |
| **Component** | Component-specific overrides | Per component |

### Reusability Principles

| Principle | Description |
|-----------|-------------|
| **Reference, don't duplicate** | Use variable references instead of hard-coded values |
| **Semantic first** | Prefer semantic tokens over primitive values |
| **Consistent application** | Same variables for same purposes everywhere |
| **Minimal overrides** | Minimise component-level variable overrides |
| **Documentation** | Document variable purpose and usage |

---

## 1.14 Data Density Standards

### Purpose

Define three standard density modes that control information density across the platform. Ensure consistency with the enterprise productivity goals defined in the Design Direction.

### Density Modes

| Mode | Description | When to Use |
|------|-------------|-------------|
| **Comfortable** | Generous spacing; relaxed reading | Dashboards, summaries, mobile interfaces |
| **Compact** | Balanced spacing; efficient reading | Forms, cards, standard content |
| **Dense** | Minimal spacing; maximum data | Data tables, administrative workspaces |

### Density Specifications

| Property | Comfortable | Compact | Dense |
|----------|-------------|---------|-------|
| **Component padding** | 24px | 16px | 12px |
| **Item spacing** | 16px | 12px | 8px |
| **Row height (tables)** | 56px | 48px | 40px |
| **Font size** | 14px | 14px | 13px |
| **Icon size** | 20px | 18px | 16px |
| **Avatar size** | 48px | 40px | 32px |
| **Card padding** | 32px | 24px | 16px |

### Density Application by Context

| Context | Recommended Density | Reasoning |
|---------|-------------------|-----------|
| **Dashboard overview** | Comfortable | Key metrics need visual breathing room |
| **Data tables** | Dense | Maximise visible rows for data comparison |
| **Forms** | Compact | Balanced readability and efficiency |
| **Lists** | Compact | Balance between scannability and density |
| **Detail views** | Comfortable | Focus on individual item information |
| **Settings** | Comfortable | Configuration needs clarity |
| **Grade book** | Dense | Teachers need maximum data visibility |
| **Fee management** | Compact | Financial data needs clarity without excess |
| **Reports** | Comfortable | Data visualisation needs space |
| **Mobile interfaces** | Comfortable | Touch targets and readability |

### Density Switching

| Rule | Description |
|------|-------------|
| **User preference** | Allow users to select density preference |
| **Context override** | Certain contexts may override preference |
| **Consistent within context** | Same density level within similar screens |
| **Progressive density** | Start with appropriate density; allow customisation |
| **Never overwhelming** | Even dense layouts must remain readable |

### Density Tokens

| Token | Comfortable | Compact | Dense |
|-------|-------------|---------|-------|
| `density-padding-sm` | 16px | 12px | 8px |
| `density-padding-md` | 24px | 16px | 12px |
| `density-padding-lg` | 32px | 24px | 16px |
| `density-gap-sm` | 16px | 12px | 8px |
| `density-gap-md` | 24px | 16px | 12px |
| `density-row-height` | 56px | 48px | 40px |

---

# Chapter 2 — Layout & Navigation

---

## 2.1 Desktop Layout

### Primary Layout

The desktop layout uses a sidebar-and-content pattern optimised for administrative tasks.

```
┌─────────────────────────────────────────────────────┐
│  Top Navigation Bar (56px)                          │
├────────┬────────────────────────────────────────────┤
│        │                                            │
│  Side  │         Main Content Area                  │
│  bar   │                                            │
│  (240) │                                            │
│        │                                            │
│        │                                            │
└────────┴────────────────────────────────────────────┘
```

| Element | Width | Height | Description |
|---------|-------|--------|-------------|
| **Top Nav** | 100% | 56px | Global navigation, search, user menu |
| **Sidebar** | 240px (expanded) / 64px (collapsed) | 100% - 56px | Module navigation |
| **Main Content** | Fluid | 100% - 56px | Primary content area |

### Sidebar States

| State | Width | Description |
|-------|-------|-------------|
| **Expanded** | 240px | Full navigation with labels |
| **Collapsed** | 64px | Icons only; hover reveals labels |
| **Hidden** | 0px | Full-width content (mobile) |

### Content Area

| Property | Value |
|----------|-------|
| **Padding** | `spacing-lg` (24px) |
| **Max width** | 1280px (centred) |
| **Min width** | 320px |

---

## 2.2 Tablet Layout

### Tablet Adaptations

| Element | Desktop | Tablet | Change |
|---------|---------|--------|--------|
| **Sidebar** | 240px | 64px (collapsed) | Collapsed by default |
| **Top Nav** | 56px | 56px | No change |
| **Content** | Fluid | Fluid | Reduced padding |
| **Grid** | 12 columns | 8 columns | Fewer columns |

### Tablet-Specific Patterns

| Pattern | Description |
|---------|-------------|
| **Collapsible sidebar** | Starts collapsed; expandable via toggle |
| **Swipe navigation** | Swipe left/right for sidebar |
| **Touch-friendly** | Larger tap targets (min 44px) |
| **Stacked layouts** | Side-by-side becomes stacked |

---

## 2.3 Mobile Layout

### Mobile Layout

The mobile layout uses a bottom tab bar for primary navigation.

```
┌─────────────────────────────┐
│  Header (56px)              │
├─────────────────────────────┤
│                             │
│     Main Content Area       │
│                             │
│                             │
├─────────────────────────────┤
│  Bottom Tab Bar (56px)      │
└─────────────────────────────┘
```

| Element | Width | Height | Description |
|---------|-------|--------|-------------|
| **Header** | 100% | 56px | Title, back, actions |
| **Content** | 100% | 100% - 112px | Primary content area |
| **Tab Bar** | 100% | 56px | 4-5 primary destinations |

### Mobile Navigation

| Element | Description |
|---------|-------------|
| **Bottom tabs** | 4-5 primary destinations |
| **Hamburger menu** | Secondary navigation |
| **Back button** | Return to previous screen |
| **Search** | Full-screen overlay |

---

## 2.4 Containers & Content Widths

### Container Sizes

| Token | Max Width | Padding | Usage |
|-------|-----------|---------|-------|
| `container-sm` | 640px | 24px | Forms, narrow content |
| `container-md` | 768px | 24px | Standard content |
| `container-lg` | 1024px | 32px | Wide content |
| `container-xl` | 1280px | 32px | Full-width layouts |

### Container Rules

| Rule | Description |
|------|-------------|
| **Centred** | Containers are centred in viewport |
| **Responsive** | Reduce max-width on smaller screens |
| **Consistent padding** | Use spacing scale for padding |

---

## 2.5 Page Templates

### Standard Page Template

```
┌─────────────────────────────────────┐
│  Page Header                        │
│  ┌─────────────────────────────┐   │
│  │  Breadcrumbs                 │   │
│  │  Title                      │   │
│  │  Description                │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Actions Bar                        │
│  ┌─────────────────────────────┐   │
│  │  Filters / Search           │   │
│  │  Primary Action             │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Content Area                       │
│  ┌─────────────────────────────┐   │
│  │  Data / Forms / Widgets     │   │
│  │                             │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Pagination / Footer                │
└─────────────────────────────────────┘
```

### Page Template Variants

| Template | Usage | Description |
|----------|-------|-------------|
| **List** | Data tables, lists | Filters + table + pagination |
| **Detail** | Single item view | Header + content + sidebar |
| **Form** | Data entry | Header + form + actions |
| **Dashboard** | Overview | Header + widget grid |
| **Settings** | Configuration | Header + tabs + form |

---

## 2.6 Sidebar Navigation

### Structure

```
┌────────────────────┐
│  Logo / Brand      │
├────────────────────┤
│  Search            │
├────────────────────┤
│  Navigation Items  │
│  ┌──────────────┐  │
│  │  Item 1      │  │
│  │  Item 2      │  │
│  │  Item 3      │  │
│  └──────────────┘  │
├────────────────────┤
│  Secondary Items   │
│  ┌──────────────┐  │
│  │  Settings    │  │
│  │  Help        │  │
│  └──────────────┘  │
└────────────────────┘
```

### Navigation Item States

| State | Background | Text | Icon | Description |
|-------|------------|------|------|-------------|
| **Default** | Transparent | `gray-600` | `gray-500` | Inactive |
| **Hover** | `gray-100` | `gray-800` | `gray-700` | Mouse over |
| **Active** | `primary-subtle` | `primary` | `primary` | Current page |
| **Active Parent** | `gray-50` | `gray-800` | `gray-700` | Parent of current |

### Navigation Item Layout

| Property | Expanded | Collapsed |
|----------|----------|-----------|
| **Height** | 40px | 40px |
| **Padding** | 12px 16px | 12px |
| **Icon size** | 20px | 20px |
| **Text size** | 14px | Hidden |
| **Gap** | 12px | 0px |

### Section Dividers

| Property | Value |
|----------|-------|
| **Margin top** | 16px |
| **Margin bottom** | 8px |
| **Padding left** | 16px |
| **Text size** | 12px |
| **Text weight** | 500 |
| **Text colour** | `gray-400` |
| **Text transform** | Uppercase |
| **Letter spacing** | 0.05em |

---

## 2.7 Top Navigation

### Structure

```
┌─────────────────────────────────────────────────────┐
│  Hamburger  Logo    Search           Notifications  │
│           (left)   (centre)     Help  User Menu     │
│                                    (right)          │
└─────────────────────────────────────────────────────┘
```

### Element Specifications

| Element | Width | Height | Description |
|---------|-------|--------|-------------|
| **Logo** | Auto | 32px | Brand mark |
| **Search** | 400px max | 40px | Global search |
| **Actions** | Auto | 40px | Right-aligned actions |

### Top Nav States

| State | Background | Description |
|-------|------------|-------------|
| **Default** | `white` | Standard state |
| **Scrolled** | `white` with shadow | When content scrolls beneath |

---

## 2.8 Breadcrumbs

### Breadcrumb Format

```
Home > Module > Section > Page
```

### Breadcrumb Specifications

| Property | Value |
|----------|-------|
| **Font size** | 12px |
| **Font weight** | 400 |
| **Colour (inactive)** | `gray-500` |
| **Colour (hover)** | `primary` |
| **Colour (current)** | `gray-800` |
| **Separator** | `>` or `/` |
| **Separator colour** | `gray-400` |
| **Separator margin** | 0 8px |

### Breadcrumb Rules

| Rule | Description |
|------|-------------|
| **Max depth** | 4 levels |
| **Truncation** | Truncate middle items with `...` |
| **Mobile** | Show only parent + current |
| **Accessibility** | Use `nav` with `aria-label="Breadcrumb"` |

---

## 2.9 Tabs

### Tab Variants

| Variant | Usage | Description |
|---------|-------|-------------|
| **Underline** | Page-level navigation | Bottom border indicator |
| **Pill** | Filter/group selection | Rounded background |
| **Enclosed** | Content sections | Box with border |

### Tab States

| State | Background | Text | Border | Description |
|-------|------------|------|--------|-------------|
| **Default** | Transparent | `gray-500` | `gray-200` | Inactive |
| **Hover** | `gray-50` | `gray-700` | `gray-200` | Mouse over |
| **Active** | Transparent | `primary` | `primary` | Selected |
| **Disabled** | Transparent | `gray-300` | `gray-200` | Unavailable |

### Tab Layout

| Property | Value |
|----------|-------|
| **Height** | 44px |
| **Padding** | 0 16px |
| **Font size** | 14px |
| **Font weight** | 500 |
| **Gap** | 0px |
| **Indicator height** | 2px |
| **Indicator width** | 100% |

### Tab Rules

| Rule | Description |
|------|-------------|
| **Max visible** | 5-7 tabs before scroll |
| **Overflow** | Horizontal scroll with fade |
| **Mobile** | Scrollable or dropdown |
| **Badge** | Optional count badge on tab |

---

## 2.10 Wizards

### Wizard Structure

```
┌─────────────────────────────────────────┐
│  Step 1    Step 2    Step 3    Step 4   │
│  ────────  ────────  ────────  ──────── │
├─────────────────────────────────────────┤
│                                         │
│           Content Area                  │
│                                         │
├─────────────────────────────────────────┤
│  Cancel              Back     Next      │
└─────────────────────────────────────────┘
```

### Wizard Specifications

| Property | Value |
|----------|-------|
| **Step height** | 48px |
| **Step indicator** | Circle with number |
| **Step connector** | Line between circles |
| **Active colour** | `primary` |
| **Completed colour** | `success` |
| **Inactive colour** | `gray-300` |
| **Content padding** | 32px |

### Wizard States

| State | Indicator | Label | Description |
|-------|-----------|-------|-------------|
| **Completed** | ✓ | `gray-800` | Step done |
| **Active** | Number | `primary` | Current step |
| **Upcoming** | Number | `gray-400` | Future step |

### Wizard Rules

| Rule | Description |
|------|-------------|
| **Linear** | Steps must be completed in order |
| **Validation** | Validate before advancing |
| **Save progress** | Auto-save on each step |
| **Mobile** | Stack steps vertically |

---

## 2.11 Search

### Search Components

| Component | Usage | Description |
|-----------|-------|-------------|
| **Global search** | Top navigation | Search across all modules |
| **In-page search** | Content area | Search within current view |
| **Command palette** | Keyboard shortcut | Quick actions and navigation |

### Global Search Specifications

| Property | Value |
|----------|-------|
| **Width** | 400px max |
| **Height** | 40px |
| **Border radius** | 8px |
| **Background** | `gray-50` |
| **Border** | 1px `gray-200` |
| **Placeholder** | "Search students, teachers, fees..." |
| **Shortcut** | `Cmd+K` / `Ctrl+K` |

### Search Results

| Section | Description |
|---------|-------------|
| **Recent** | Recently visited items |
| **Suggestions** | Auto-complete suggestions |
| **Results** | Matching items by type |
| **Actions** | Quick actions |

### Search Rules

| Rule | Description |
|------|-------------|
| **Instant** | Show results as user types |
| **Debounced** | 300ms debounce for API calls |
| **Keyboard** | Navigate results with arrow keys |
| **Accessible** | Announce result count |

---

## 2.12 Command Palette

### Command Palette Structure

```
┌─────────────────────────────────────┐
│  Search input                       │
├─────────────────────────────────────┤
│  Recent Actions                     │
│  ┌─────────────────────────────┐   │
│  │  Action 1                    │   │
│  │  Action 2                    │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Navigation                          │
│  ┌─────────────────────────────┐   │
│  │  Go to Students              │   │
│  │  Go to Teachers              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Command Palette Specifications

| Property | Value |
|----------|-------|
| **Width** | 560px max |
| **Max height** | 400px |
| **Border radius** | 12px |
| **Background** | `white` |
| **Shadow** | `shadow-xl` |
| **Backdrop** | `opacity-overlay` with `blur-md` |

### Command Palette Rules

| Rule | Description |
|------|-------------|
| **Keyboard-first** | Accessible via `Cmd+K` |
| **Fuzzy search** | Match partial text |
| **Categorised** | Group results by type |
| **Keyboard navigation** | Arrow keys + Enter |

---

## 2.13 Notification Panel

### Notification Panel Structure

```
┌─────────────────────────────────────┐
│  Notifications              Mark all │
├─────────────────────────────────────┤
│  Unread                               │
│  ┌─────────────────────────────┐   │
│  │  Notification 1              │   │
│  │  Notification 2              │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Earlier                             │
│  ┌─────────────────────────────┐   │
│  │  Notification 3              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Notification Specifications

| Property | Value |
|----------|-------|
| **Width** | 380px |
| **Max height** | 480px |
| **Border radius** | 12px |
| **Background** | `white` |
| **Shadow** | `shadow-xl` |
| **Item height** | Auto (min 64px) |
| **Item padding** | 16px |

### Notification Item States

| State | Background | Border Left | Description |
|-------|------------|-------------|-------------|
| **Unread** | `primary-subtle` | 2px `primary` | New notification |
| **Read** | `white` | None | Previously seen |
| **Hover** | `gray-50` | Inherits | Mouse over |

### Notification Rules

| Rule | Description |
|------|-------------|
| **Real-time** | Push notifications via WebSocket |
| **Grouped** | Group by type or time |
| **Actionable** | Include action buttons where relevant |
| **Accessible** | Announce new notifications |

---

## 2.14 User Menu

### User Menu Structure

```
┌─────────────────────────────────────┐
│  ┌──────┐                           │
│  │  Avatar  Name                    │
│  │       │  email@example.com       │
│  └──────┘                           │
├─────────────────────────────────────┤
│  Profile                             │
│  Settings                            │
│  Help                                │
├─────────────────────────────────────┤
│  Switch Tenant                       │
│  Sign Out                            │
└─────────────────────────────────────┘
```

### User Menu Specifications

| Property | Value |
|----------|-------|
| **Width** | 240px |
| **Border radius** | 12px |
| **Background** | `white` |
| **Shadow** | `shadow-xl` |
| **Item height** | 40px |
| **Item padding** | 8px 16px |

### User Menu States

| State | Background | Description |
|-------|------------|-------------|
| **Default** | Transparent | Inactive |
| **Hover** | `gray-100` | Mouse over |
| **Active** | `primary-subtle` | Current selection |

### User Menu Rules

| Rule | Description |
|------|-------------|
| **Avatar** | Show user avatar or initials |
| **Tenant context** | Show current tenant name |
| **Sign out** | Destructive action; visually separated |
| **Keyboard** | Full keyboard navigation |

---


---

## 2.15 Reusable Layout Templates

### Purpose

Define standard structural templates that future screens should inherit from. These templates establish layout principles only, not individual screen designs.

### Template Catalogue

| Template | Description | Primary Use |
|----------|-------------|-------------|
| **Dashboard** | Widget grid with KPIs, charts, and activity feeds | Overview and monitoring |
| **CRUD List** | Table with filters, pagination, and bulk actions | Data management |
| **Detail View** | Header with content and sidebar | Single item management |
| **Wizard** | Multi-step progression with clear navigation | Complex workflows |
| **Settings** | Tabbed configuration with form sections | System configuration |
| **Analytics** | Charts, filters, and date range selectors | Data analysis |
| **Calendar** | Month/week/day views with event display | Scheduling |
| **Profile** | User information with editable sections | User management |
| **Report** | Charts, tables, and export options | Report generation |
| **Workspace Landing** | Quick actions, recent items, and summary | Module entry point |

### Dashboard Template

```
┌─────────────────────────────────────────┐
│  Page Header (title + actions)          │
├─────────────────────────────────────────┤
│  Stats Grid (4 columns)                 │
├─────────────────────────────────────────┤
│  Charts Row (2 columns)                 │
├─────────────────────────────────────────┤
│  Activity Feed + Quick Actions          │
└─────────────────────────────────────────┘
```

| Element | Width | Height |
|---------|-------|--------|
| **Stats grid** | 4 columns | Auto |
| **Charts row** | 2 columns | 240-320px |
| **Content rows** | Fluid | Auto |

### CRUD List Template

```
┌─────────────────────────────────────────┐
│  Page Header (title + primary action)   │
├─────────────────────────────────────────┤
│  Filters Bar (search + filters)         │
├─────────────────────────────────────────┤
│  Data Table                             │
│  (sortable, selectable, paginated)      │
├─────────────────────────────────────────┤
│  Pagination / Summary                   │
└─────────────────────────────────────────┘
```

| Element | Description |
|---------|-------------|
| **Filters bar** | Search field, filter dropdowns, clear all |
| **Data table** | Sortable columns, row selection, bulk actions |
| **Pagination** | Page controls, row count, items per page |

### Detail View Template

```
┌─────────────────────────────────────────┐
│  Breadcrumbs + Page Header              │
├────────────────────────┬────────────────┤
│                        │                │
│  Main Content          │  Sidebar       │
│  (detail fields)       │  (actions,     │
│                        │   metadata)    │
│                        │                │
└────────────────────────┴────────────────┘
```

| Element | Width | Description |
|---------|-------|-------------|
| **Main content** | 60-70% | Primary detail fields |
| **Sidebar** | 30-40% | Actions, metadata, related items |

### Wizard Template

```
┌─────────────────────────────────────────┐
│  Step Indicator (1 → 2 → 3 → 4)        │
├─────────────────────────────────────────┤
│                                         │
│  Step Content Area                      │
│                                         │
├─────────────────────────────────────────┤
│  Step Actions (Cancel, Back, Next)      │
└─────────────────────────────────────────┘
```

| Element | Description |
|---------|-------------|
| **Step indicator** | Shows progress, step names, completion status |
| **Step content** | Form or content for current step |
| **Step actions** | Navigation buttons with validation |

### Settings Template

```
┌─────────────────────────────────────────┐
│  Page Header                            │
├─────────────────────────────────────────┤
│  Tabs (General, Security, Notifications)│
├─────────────────────────────────────────┤
│  Section 1 (grouped fields)             │
├─────────────────────────────────────────┤
│  Section 2 (grouped fields)             │
├─────────────────────────────────────────┤
│  Save Actions                           │
└─────────────────────────────────────────┘
```

### Analytics Template

```
┌─────────────────────────────────────────┐
│  Page Header + Date Range Picker        │
├─────────────────────────────────────────┤
│  KPI Row (4 metrics)                    │
├─────────────────────────────────────────┤
│  Primary Chart (full width)             │
├─────────────────────────────────────────┤
│  Secondary Charts (2 columns)           │
├─────────────────────────────────────────┤
│  Data Table (detailed breakdown)        │
└─────────────────────────────────────────┘
```

### Calendar Template

```
┌─────────────────────────────────────────┐
│  Header (month/year + navigation)       │
├─────────────────────────────────────────┤
│  View Switcher (month/week/day)         │
├─────────────────────────────────────────┤
│  Calendar Grid                          │
│  (day cells with event indicators)      │
├─────────────────────────────────────────┤
│  Event List / Detail Panel              │
└─────────────────────────────────────────┘
```

### Profile Template

```
┌─────────────────────────────────────────┐
│  Avatar + Name + Role                   │
├─────────────────────────────────────────┤
│  Tabs (Overview, Activity, Settings)    │
├─────────────────────────────────────────┤
│  Tab Content                            │
└─────────────────────────────────────────┘
```

### Report Template

```
┌─────────────────────────────────────────┐
│  Report Header + Export Actions         │
├─────────────────────────────────────────┤
│  Filters / Parameters                   │
├─────────────────────────────────────────┤
│  Summary Charts                         │
├─────────────────────────────────────────┤
│  Detailed Data Table                    │
├─────────────────────────────────────────┤
│  Footer (generated date, page)          │
└─────────────────────────────────────────┘
```

### Workspace Landing Template

```
┌─────────────────────────────────────────┐
│  Welcome Header + Quick Stats           │
├─────────────────────────────────────────┤
│  Quick Actions Grid                     │
├─────────────────────────────────────────┤
│  Recent Items / Activity Feed           │
├─────────────────────────────────────────┤
│  Related Module Links                   │
└─────────────────────────────────────────┘
```

### Template Rules

| Rule | Description |
|------|-------------|
| **Inherit structure** | New screens inherit from the closest template |
| **Adapt, don't redesign** | Modify templates for specific needs; don't start from scratch |
| **Consistent elements** | Same header, pagination, and action patterns |
| **Responsive adaptation** | Templates reflow appropriately at breakpoints |
| **Progressive complexity** | Start with template; add complexity as needed |

---

# Chapter 3 — Component Library

---

## 3.1 Inputs

---

### 3.1.1 Button

**Purpose:** Trigger actions and events.

**Variants:**

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| **Primary** | `primary` | `white` | None | Main call-to-action |
| **Secondary** | `white` | `gray-700` | `gray-200` | Secondary actions |
| **Ghost** | Transparent | `gray-600` | None | Tertiary actions |
| **Danger** | `error` | `white` | None | Destructive actions |
| **Link** | Transparent | `primary` | None | Inline actions |

**Sizes:**

| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| **Large** | 44px | 16px 24px | 14px | 20px |
| **Medium** | 40px | 12px 16px | 14px | 16px |
| **Small** | 32px | 8px 12px | 12px | 16px |
| **Icon** | 40px | 12px | - | 20px |

**States:**

| State | Background | Text | Border | Description |
|-------|------------|------|--------|-------------|
| **Default** | Inherits | Inherits | Inherits | Normal state |
| **Hover** | Darken 5% | Inherits | Inherits | Mouse over |
| **Active** | Darken 10% | Inherits | Inherits | Pressed |
| **Disabled** | `opacity-disabled` | `opacity-disabled` | None | Unavailable |
| **Loading** | Inherits | + spinner | None | Processing |

**Accessibility:**
- Minimum touch target: 44px
- Keyboard: `Tab` to focus, `Enter`/`Space` to activate
- `aria-label` for icon-only buttons
- `aria-disabled="true"` for disabled state
- `aria-busy="true"` for loading state

**Responsive:**
- Full-width on mobile when used as primary action
- Stack vertically on narrow screens

---

### 3.1.2 Text Field

**Purpose:** Single-line text input.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard text field |
| **With icon** | Icon inside field |
| **With prefix** | Static prefix (e.g., currency) |
| **With suffix** | Static suffix (e.g., unit) |
| **Textarea** | Multi-line text input |

**Sizes:**

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| **Large** | 44px | 12px 16px | 16px |
| **Medium** | 40px | 10px 14px | 14px |
| **Small** | 32px | 8px 12px | 12px |

**States:**

| State | Border | Background | Description |
|-------|--------|------------|-------------|
| **Default** | `gray-200` | `white` | Normal state |
| **Hover** | `gray-300` | `white` | Mouse over |
| **Focus** | `primary` | `white` | Active focus |
| **Error** | `error` | `white` | Validation error |
| **Disabled** | `gray-200` | `gray-50` | Unavailable |
| **Read-only** | `gray-200` | `gray-50` | Non-editable |

**Helper Elements:**

| Element | Position | Description |
|---------|----------|-------------|
| **Label** | Above field | Descriptive label |
| **Placeholder** | Inside field | Hint text |
| **Helper text** | Below field | Guidance text |
| **Error text** | Below field | Validation message |
| **Character count** | Below field | Input length tracking |

**Accessibility:**
- `label` associated with input via `htmlFor`
- `aria-describedby` for helper/error text
- `aria-invalid="true"` for error state
- `aria-required="true"` for required fields
- `autocomplete` attribute for common fields

**Responsive:**
- Full-width on mobile
- Maintain minimum width of 200px

---

### 3.1.3 Select

**Purpose:** Choose from a list of options.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard dropdown select |
| **Multi-select** | Multiple selections |
| **Searchable** | Filterable options |
| **Grouped** | Options grouped by category |

**Sizes:**

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| **Large** | 44px | 12px 16px | 16px |
| **Medium** | 40px | 10px 14px | 14px |
| **Small** | 32px | 8px 12px | 12px |

**States:**

| State | Border | Background | Description |
|-------|--------|------------|-------------|
| **Default** | `gray-200` | `white` | Normal state |
| **Hover** | `gray-300` | `white` | Mouse over |
| **Focus** | `primary` | `white` | Active focus |
| **Error** | `error` | `white` | Validation error |
| **Disabled** | `gray-200` | `gray-50` | Unavailable |

**Dropdown Specifications:**

| Property | Value |
|----------|-------|
| **Max height** | 240px |
| **Border radius** | 8px |
| **Background** | `white` |
| **Shadow** | `shadow-lg` |
| **Item height** | 40px |
| **Item padding** | 8px 12px |

**Accessibility:**
- `role="listbox"` for dropdown
- `role="option"` for items
- `aria-expanded` for open/close state
- `aria-activedescendant` for keyboard navigation
- Arrow keys to navigate options
- `Enter` to select, `Escape` to close

**Responsive:**
- Full-width on mobile
- Bottom sheet on mobile devices

---

### 3.1.4 Checkbox

**Purpose:** Toggle a single option on/off.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard checkbox |
| **Indeterminate** | Partially selected |
| **With label** | Checkbox with text label |
| **Group** | Multiple checkboxes |

**Sizes:**

| Size | Box Size | Icon Size | Description |
|------|----------|-----------|-------------|
| **Default** | 20px | 14px | Standard use |
| **Small** | 16px | 10px | Compact layouts |

**States:**

| State | Border | Background | Check | Description |
|-------|--------|------------|-------|-------------|
| **Unchecked** | `gray-300` | `white` | None | Off state |
| **Checked** | `primary` | `primary` | White ✓ | On state |
| **Indeterminate** | `primary` | `primary` | White — | Partial |
| **Disabled** | `gray-200` | `gray-100` | `gray-400` | Unavailable |
| **Focus** | `primary` ring | Inherits | Inherits | Keyboard focus |

**Accessibility:**
- `role="checkbox"`
- `aria-checked="true"/"false"/"mixed"`
- `aria-label` when no visible label
- `Space` to toggle

---

### 3.1.5 Radio Button

**Purpose:** Select one option from a set.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard radio button |
| **With label** | Radio with text label |
| **Group** | Multiple radios |
| **Card** | Radio as selectable card |

**Sizes:**

| Size | Circle Size | Dot Size | Description |
|------|-------------|----------|-------------|
| **Default** | 20px | 10px | Standard use |
| **Small** | 16px | 8px | Compact layouts |

**States:**

| State | Border | Background | Dot | Description |
|-------|--------|------------|-----|-------------|
| **Unselected** | `gray-300` | `white` | None | Not selected |
| **Selected** | `primary` | `white` | `primary` | Selected |
| **Disabled** | `gray-200` | `gray-100` | `gray-400` | Unavailable |
| **Focus** | `primary` ring | Inherits | Inherits | Keyboard focus |

**Accessibility:**
- `role="radio"`
- `aria-checked="true"/"false"`
- `role="radiogroup"` for groups
- Arrow keys to navigate within group
- `Space` to select

---

### 3.1.6 Toggle

**Purpose:** Switch between two states.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard toggle |
| **With label** | Toggle with text label |
| **With description** | Toggle with helper text |

**Sizes:**

| Size | Track Width | Track Height | Thumb Size | Description |
|------|-------------|--------------|------------|-------------|
| **Default** | 44px | 24px | 20px | Standard use |
| **Small** | 36px | 20px | 16px | Compact layouts |

**States:**

| State | Track | Thumb | Description |
|-------|-------|-------|-------------|
| **Off** | `gray-200` | `white` | Disabled state |
| **On** | `primary` | `white` | Enabled state |
| **Disabled** | `gray-100` | `gray-300` | Unavailable |
| **Focus** | Inherits | ring | Keyboard focus |

**Accessibility:**
- `role="switch"`
- `aria-checked="true"/"false"`
- `Space` to toggle

---

### 3.1.7 Date Picker

**Purpose:** Select a date from a calendar.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Single date** | One date selection |
| **Date range** | Start and end dates |
| **Month picker** | Month and year only |
| **Year picker** | Year only |

**Sizes:**

| Size | Height | Font Size | Description |
|------|--------|-----------|-------------|
| **Large** | 44px | 16px | Standard use |
| **Medium** | 40px | 14px | Forms |

**Calendar Specifications:**

| Property | Value |
|----------|-------|
| **Width** | 280px |
| **Border radius** | 12px |
| **Background** | `white` |
| **Shadow** | `shadow-lg` |
| **Header height** | 48px |
| **Day size** | 36px |
| **Day radius** | 8px |

**States:**

| State | Day Background | Description |
|-------|----------------|-------------|
| **Default** | `white` | Normal day |
| **Today** | `primary-subtle` | Current date |
| **Selected** | `primary` | Chosen date |
| **Range start** | `primary` | Range start |
| **Range end** | `primary` | Range end |
| **In range** | `primary-subtle` | Between start/end |
| **Disabled** | `gray-100` | Unavailable |

**Accessibility:**
- `role="dialog"` for calendar
- Arrow keys to navigate days
- `Enter` to select
- `Escape` to close
- Screen reader announces selected date

**Responsive:**
- Full-width on mobile
- Bottom sheet on mobile devices

---

### 3.1.8 Time Picker

**Purpose:** Select a time.

**Variants:**

| Variant | Description |
|---------|-------------|
| **12-hour** | AM/PM format |
| **24-hour** | 24-hour format |
| **Range** | Start and end times |

**Sizes:**

| Size | Height | Font Size | Description |
|------|--------|-----------|-------------|
| **Large** | 44px | 16px | Standard use |
| **Medium** | 40px | 14px | Forms |

**Time Picker Specifications:**

| Property | Value |
|----------|-------|
| **Width** | 120px (time input) |
| **Dropdown height** | 240px |
| **Item height** | 36px |

**Accessibility:**
- Arrow keys to adjust time
- `Enter` to confirm
- Screen reader announces time

---

### 3.1.9 File Upload

**Purpose:** Upload files.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Dropzone** | Drag-and-drop area |
| **Button** | Click to upload |
| **With preview** | File preview before upload |
| **Multi-file** | Multiple file upload |

**Sizes:**

| Size | Height | Description |
|------|--------|-------------|
| **Large** | 120px | Dropzone |
| **Medium** | 80px | Compact dropzone |
| **Small** | 40px | Button only |

**States:**

| State | Border | Background | Description |
|-------|--------|------------|-------------|
| **Default** | `gray-200` dashed | `gray-50` | Ready |
| **Hover** | `primary` | `primary-subtle` | Drag over |
| **Upload** | `primary` | `primary-subtle` | Processing |
| **Success** | `success` | `success-subtle` | Complete |
| **Error** | `error` | `error-subtle` | Failed |

**File Specifications:**

| Property | Value |
|----------|-------|
| **Max file size** | Configurable (default 10MB) |
| **Accepted types** | Configurable |
| **Max files** | Configurable (default 5) |

**Accessibility:**
- `role="button"` for dropzone
- `aria-label` for upload button
- Keyboard: `Enter`/`Space` to open file picker

---

### 3.1.10 Search Input

**Purpose:** Search for content.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard search field |
| **With autocomplete** | Suggestions as you type |
| **Compact** | Smaller inline search |

**Sizes:**

| Size | Height | Icon Size | Description |
|------|--------|-----------|-------------|
| **Large** | 44px | 20px | Full search |
| **Medium** | 40px | 16px | Standard |
| **Small** | 32px | 16px | Compact |

**States:**

| State | Border | Icon | Description |
|-------|--------|------|-------------|
| **Default** | `gray-200` | `gray-400` | Normal |
| **Focus** | `primary` | `primary` | Active |
| **Loading** | `primary` | Spinner | Searching |

**Accessibility:**
- `role="searchbox"`
- `aria-label="Search"`
- `aria-live="polite"` for result count
- `Escape` to clear

---

### 3.1.11 Number Input

**Purpose:** Enter numeric values.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard number field |
| **With stepper** | Increment/decrement buttons |
| **Currency** | Monetary values |
| **Percentage** | Percentage values |

**Sizes:**

| Size | Height | Font Size | Description |
|------|--------|-----------|-------------|
| **Large** | 44px | 16px | Standard |
| **Medium** | 40px | 14px | Forms |
| **Small** | 32px | 12px | Compact |

**States:**

| State | Border | Description |
|-------|--------|-------------|
| **Default** | `gray-200` | Normal |
| **Focus** | `primary` | Active |
| **Error** | `error` | Invalid value |

**Accessibility:**
- `role="spinbutton"`
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Arrow keys to increment/decrement

---

### 3.1.12 Password Input

**Purpose:** Enter passwords securely.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Hidden characters |
| **With toggle** | Show/hide password |
| **With strength** | Password strength indicator |

**Sizes:**

| Size | Height | Font Size | Description |
|------|--------|-----------|-------------|
| **Large** | 44px | 16px | Standard |
| **Medium** | 40px | 14px | Forms |

**States:**

| State | Border | Description |
|-------|--------|-------------|
| **Default** | `gray-200` | Normal |
| **Focus** | `primary` | Active |
| **Error** | `error` | Invalid |

**Strength Indicator:**

| Level | Colour | Label |
|-------|--------|-------|
| **Weak** | `error` | Weak |
| **Fair** | `warning` | Fair |
| **Good** | `info` | Good |
| **Strong** | `success` | Strong |

**Accessibility:**
- `aria-label="Password"`
- `aria-describedby` for strength indicator
- Toggle button with `aria-label="Show password"`

---

### 3.1.13 Phone Input

**Purpose:** Enter phone numbers.

**Variants:**

| Variant | Description |
|---------|-------------|
| **With country code** | International format |
| **Local** | Local format only |

**Sizes:**

| Size | Height | Font Size | Description |
|------|--------|-----------|-------------|
| **Large** | 44px | 16px | Standard |
| **Medium** | 40px | 14px | Forms |

**Accessibility:**
- `type="tel"`
- `aria-label="Phone number"`
- Country code selector with `role="listbox"`

---

### 3.1.14 Email Input

**Purpose:** Enter email addresses.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard email field |
| **With autocomplete** | Domain suggestions |

**Sizes:**

| Size | Height | Font Size | Description |
|------|--------|-----------|-------------|
| **Large** | 44px | 16px | Standard |
| **Medium** | 40px | 14px | Forms |

**Accessibility:**
- `type="email"`
- `aria-label="Email address"`
- `autocomplete="email"`

---

### 3.1.15 Form

**Purpose:** Container for input groups.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard form layout |
| **Inline** | Horizontal layout |
| **Modal** | Form inside modal |
| **Card** | Form inside card |

**Layout:**

| Property | Value |
|----------|-------|
| **Label position** | Above input |
| **Field spacing** | 24px |
| **Section spacing** | 32px |
| **Section title** | `heading-sm` |

**Form States:**

| State | Description |
|-------|-------------|
| **Pristine** | No user interaction |
| **Dirty** | User has made changes |
| **Submitting** | Processing submission |
| **Success** | Submission complete |
| **Error** | Validation failed |

**Accessibility:**
- `form` element with `aria-label`
- `fieldset` and `legend` for grouped fields
- `aria-invalid` for error states
- `aria-describedby` for error messages
- Focus management on submit

---


---

## 3.2 Data Display

---

### 3.2.1 Card

**Purpose:** Group related content.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard card |
| **Interactive** | Clickable card |
| **With header** | Card with title section |
| **With footer** | Card with action section |
| **Stat** | KPI/metric card |
| **Empty** | Empty state card |

**Sizes:**

| Size | Padding | Border Radius | Description |
|------|---------|---------------|-------------|
| **Default** | 24px | 12px | Standard use |
| **Compact** | 16px | 8px | Dense layouts |
| **Spacious** | 32px | 16px | Emphasis |

**States:**

| State | Border | Shadow | Description |
|-------|--------|--------|-------------|
| **Default** | `gray-200` | `shadow-sm` | Normal |
| **Hover** | `gray-300` | `shadow-md` | Mouse over (interactive) |
| **Selected** | `primary` | `shadow-md` | Selected |
| **Disabled** | `gray-200` | None | Unavailable |

**Card Structure:**

```
┌─────────────────────────────┐
│  Header (optional)          │
│  Title / Actions            │
├─────────────────────────────┤
│  Content                    │
│                             │
├─────────────────────────────┤
│  Footer (optional)          │
│  Actions                    │
└─────────────────────────────┘
```

**Accessibility:**
- `role="article"` for content cards
- `role="button"` for interactive cards
- Keyboard: `Tab` to focus, `Enter` to activate

**Responsive:**
- Full-width on mobile
- Stack content vertically

---

### 3.2.2 Data Table

**Purpose:** Display tabular data.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard table |
| **Sortable** | Clickable column headers |
| **Selectable** | Row selection |
| **Expandable** | Row expansion |
| **Fixed header** | Sticky header row |

**Table Structure:**

```
┌─────────────────────────────────────────┐
│  Table Header                           │
│  ┌─────┬─────┬─────┬─────┬─────────┐  │
│  │ Col1│ Col2│ Col3│ Col4│ Actions │  │
│  └─────┴─────┴─────┴─────┴─────────┘  │
├─────────────────────────────────────────┤
│  Table Body                             │
│  ┌─────┬─────┬─────┬─────┬─────────┐  │
│  │ Row1│     │     │     │         │  │
│  ├─────┼─────┼─────┼─────┼─────────┤  │
│  │ Row2│     │     │     │         │  │
│  └─────┴─────┴─────┴─────┴─────────┘  │
├─────────────────────────────────────────┤
│  Table Footer                           │
│  Pagination / Summary                   │
└─────────────────────────────────────────┘
```

**Specifications:**

| Property | Value |
|----------|-------|
| **Header height** | 48px |
| **Row height** | 48px (compact: 40px) |
| **Cell padding** | 12px 16px |
| **Border bottom** | 1px `gray-200` |
| **Font size** | 14px |

**States:**

| State | Background | Description |
|-------|------------|-------------|
| **Default** | `white` | Normal row |
| **Hover** | `gray-50` | Mouse over |
| **Selected** | `primary-subtle` | Row selected |
| **Striped** | `gray-50` (alt) | Alternating rows |

**Sorting:**

| State | Icon | Description |
|-------|------|-------------|
| **Unsorted** | ⇅ | No sort applied |
| **Ascending** | ↑ | Sort low to high |
| **Descending** | ↓ | Sort high to low |

**Accessibility:**
- `role="table"` for table element
- `role="row"` for rows
- `role="columnheader"` for headers
- `role="cell"` for cells
- `aria-sort` for sorted columns
- Keyboard: Arrow keys to navigate cells

**Responsive:**
- Horizontal scroll on mobile
- Priority columns visible
- Collapse secondary columns

---

### 3.2.3 Badge

**Purpose:** Label or status indicator.

**Variants:**

| Variant | Background | Text | Usage |
|---------|------------|------|-------|
| **Default** | `gray-100` | `gray-700` | Neutral label |
| **Primary** | `primary-subtle` | `primary` | Information |
| **Success** | `success-subtle` | `success` | Positive status |
| **Warning** | `warning-subtle` | `warning` | Caution |
| **Error** | `error-subtle` | `error` | Negative status |
| **Info** | `info-subtle` | `info` | Information |

**Sizes:**

| Size | Height | Padding | Font Size | Description |
|------|--------|---------|-----------|-------------|
| **Default** | 24px | 4px 10px | 12px | Standard |
| **Small** | 20px | 2px 8px | 11px | Compact |
| **Large** | 28px | 4px 12px | 14px | Emphasis |

**States:**

| State | Description |
|-------|-------------|
| **Default** | Normal |
| **Dot** | Coloured dot indicator |
| **Removable** | Close button |

**Accessibility:**
- `role="status"` for status badges
- `aria-label` for context

---

### 3.2.4 Avatar

**Purpose:** User representation.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Image** | User photo |
| **Initials** | Name initials |
| **Icon** | Default icon |
| **Group** | Multiple avatars |

**Sizes:**

| Size | Dimensions | Font Size | Description |
|------|------------|-----------|-------------|
| **XS** | 24px | 10px | Inline |
| **SM** | 32px | 12px | List items |
| **MD** | 40px | 14px | Standard |
| **LG** | 48px | 16px | Cards |
| **XL** | 64px | 20px | Profiles |
| **2XL** | 96px | 28px | Hero profiles |

**States:**

| State | Description |
|-------|-------------|
| **Default** | Normal |
| **Online** | Green dot indicator |
| **Offline** | Gray dot indicator |
| **Busy** | Red dot indicator |

**Group Specifications:**

| Property | Value |
|----------|-------|
| **Overlap** | -8px (negative margin) |
| **Border** | 2px `white` |
| **Max visible** | 3-4 avatars |
| **Overflow** | +N indicator |

**Accessibility:**
- `alt` text for images
- `aria-label` for initials/icon avatars
- `role="img"` for avatar groups

---

### 3.2.5 Progress Bar

**Purpose:** Show completion or loading progress.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Determinate** | Known percentage |
| **Indeterminate** | Unknown duration |
| **Buffer** | Buffered progress |
| **Segmented** | Multi-stage progress |

**Sizes:**

| Size | Track Height | Description |
|------|--------------|-------------|
| **Small** | 4px | Compact |
| **Medium** | 8px | Standard |
| **Large** | 12px | Emphasis |

**States:**

| State | Track Colour | Fill Colour | Description |
|-------|--------------|-------------|-------------|
| **Default** | `gray-200` | `primary` | Normal |
| **Success** | `gray-200` | `success` | Complete |
| **Warning** | `gray-200` | `warning` | Caution |
| **Error** | `gray-200` | `error` | Failed |

**Accessibility:**
- `role="progressbar"`
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- `aria-label` for context

---

### 3.2.6 Skeleton Loader

**Purpose:** Placeholder while content loads.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Text** | Text line placeholder |
| **Circle** | Avatar/icon placeholder |
| **Rectangle** | Card/image placeholder |
| **Custom** | Custom shape |

**Animation:**

| Property | Value |
|----------|-------|
| **Animation** | Pulse/shimmer |
| **Duration** | 1.5s |
| **Easing** | `ease-in-out` |

**Accessibility:**
- `aria-busy="true"` on container
- `aria-label="Loading"` for screen readers

---

### 3.2.7 Tag

**Purpose:** Categorise or label items.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard tag |
| **Removable** | With close button |
| **Selectable** | Clickable tag |

**Sizes:**

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| **Default** | 24px | 4px 10px | 12px |
| **Small** | 20px | 2px 8px | 11px |

**States:**

| State | Background | Description |
|-------|------------|-------------|
| **Default** | `gray-100` | Normal |
| **Selected** | `primary-subtle` | Active |
| **Hover** | `gray-200` | Mouse over |

**Accessibility:**
- `role="listitem"` in tag list
- `aria-label` with tag text

---

### 3.2.8 Separator

**Purpose:** Visually divide content.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Horizontal** | Horizontal line |
| **Vertical** | Vertical line |
| **With text** | Text between lines |

**Specifications:**

| Property | Value |
|----------|-------|
| **Thickness** | 1px |
| **Colour** | `gray-200` |
| **Margin** | 16px 0 (horizontal) |

**Accessibility:**
- `role="separator"`
- `aria-orientation="horizontal"/"vertical"`

---

### 3.2.9 Tooltip

**Purpose:** Display additional information on hover.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard tooltip |
| **With icon** | Icon + text |
| **Rich** | Multi-line content |

**Specifications:**

| Property | Value |
|----------|-------|
| **Max width** | 240px |
| **Padding** | 8px 12px |
| **Border radius** | 6px |
| **Background** | `gray-800` |
| **Text colour** | `white` |
| **Font size** | 12px |
| **Arrow size** | 6px |
| **Delay** | 300ms |

**Accessibility:**
- `role="tooltip"`
- `aria-describedby` on trigger
- Show on focus (keyboard)

---

### 3.2.10 Popover

**Purpose:** Display rich content in a floating panel.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard popover |
| **With arrow** | Arrow pointing to trigger |
| **Modal** | Blocking popover |

**Specifications:**

| Property | Value |
|----------|-------|
| **Max width** | 320px |
| **Padding** | 16px |
| **Border radius** | 12px |
| **Background** | `white` |
| **Shadow** | `shadow-lg` |
| **Border** | 1px `gray-200` |

**Accessibility:**
- `role="dialog"`
- `aria-label` for popover title
- Focus trapped within popover
- `Escape` to close

---

### 3.2.11 Accordion

**Purpose:** Expand/collapse content sections.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard accordion |
| **Bordered** | With borders |
| **Flush** | No borders |

**Specifications:**

| Property | Value |
|----------|-------|
| **Header height** | 48px |
| **Content padding** | 16px |
| **Border** | 1px `gray-200` |
| **Icon** | Chevron (rotation animation) |

**States:**

| State | Description |
|-------|-------------|
| **Collapsed** | Content hidden |
| **Expanded** | Content visible |
| **Disabled** | Unavailable |

**Accessibility:**
- `role="heading"` for header
- `aria-expanded` on trigger
- `aria-controls` linking to content
- `Enter`/`Space` to toggle

---


---

## 3.3 Feedback

---

### 3.3.1 Alert

**Purpose:** Display important messages.

**Variants:**

| Variant | Background | Border | Icon | Usage |
|---------|------------|--------|------|-------|
| **Info** | `info-subtle` | `info` | ℹ️ | Information |
| **Success** | `success-subtle` | `success` | ✓ | Success |
| **Warning** | `warning-subtle` | `warning` | ⚠️ | Caution |
| **Error** | `error-subtle` | `error` | ✕ | Error |

**Sizes:**

| Size | Padding | Icon Size | Font Size | Description |
|------|---------|-----------|-----------|-------------|
| **Default** | 16px | 20px | 14px | Standard |
| **Compact** | 12px | 16px | 13px | Dense layouts |

**Structure:**

```
┌─────────────────────────────────────┐
│  Icon  Title                   Close │
│        Description                  │
│        Action link                  │
└─────────────────────────────────────┘
```

**Accessibility:**
- `role="alert"` for error alerts
- `role="status"` for info/success
- `aria-live="polite"` for non-critical
- `aria-live="assertive"` for critical

---

### 3.3.2 Toast

**Purpose:** Brief, non-blocking notifications.

**Variants:**

| Variant | Background | Icon | Usage |
|---------|------------|------|-------|
| **Default** | `white` | None | Neutral message |
| **Success** | `white` | ✓ | Success |
| **Error** | `white` | ✕ | Error |
| **Warning** | `white` | ⚠️ | Caution |
| **Info** | `white` | ℹ️ | Information |

**Specifications:**

| Property | Value |
|----------|-------|
| **Width** | 380px max |
| **Padding** | 12px 16px |
| **Border radius** | 8px |
| **Background** | `white` |
| **Shadow** | `shadow-lg` |
| **Border left** | 4px (variant colour) |
| **Animation** | Slide in, fade out |
| **Duration** | 3s auto-dismiss |

**Structure:**

```
┌─────────────────────────────────────┐
│  Icon  Message                 Close │
│        Action link                  │
└─────────────────────────────────────┘
```

**Accessibility:**
- `role="status"` for success/info
- `role="alert"` for errors
- `aria-live="polite"` for auto-dismiss
- Don't auto-dismiss on hover

---

### 3.3.3 Dialog / Modal

**Purpose:** Modal window for focused tasks.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Standard dialog |
| **Confirm** | Confirmation dialog |
| **Form** | Form inside dialog |
| **Full-screen** | Full viewport overlay |

**Sizes:**

| Size | Width | Description |
|------|-------|-------------|
| **Small** | 400px | Simple confirmations |
| **Medium** | 560px | Standard forms |
| **Large** | 720px | Complex content |
| **Full** | 100% - 64px | Full-screen |

**Structure:**

```
┌─────────────────────────────────────┐
│  Title                        Close  │
├─────────────────────────────────────┤
│                                     │
│           Content                   │
│                                     │
├─────────────────────────────────────┤
│           Footer                    │
│  Cancel                Primary      │
└─────────────────────────────────────┘
```

**Specifications:**

| Property | Value |
|----------|-------|
| **Border radius** | 16px |
| **Background** | `white` |
| **Shadow** | `shadow-xl` |
| **Backdrop** | `opacity-overlay` + `blur-sm` |
| **Max height** | 80vh |
| **Header padding** | 24px |
| **Content padding** | 24px |
| **Footer padding** | 16px 24px |

**States:**

| State | Description |
|-------|-------------|
| **Opening** | Fade in + scale |
| **Open** | Visible |
| **Closing** | Fade out + scale |

**Accessibility:**
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` pointing to title
- Focus trapped within dialog
- `Escape` to close
- Focus returns to trigger on close

---

### 3.3.4 Confirmation Dialog

**Purpose:** Confirm destructive or important actions.

**Variants:**

| Variant | Icon Colour | Usage |
|---------|-------------|-------|
| **Destructive** | `error` | Delete, remove |
| **Warning** | `warning` | Irreversible action |
| **Info** | `info` | Important notice |

**Structure:**

```
┌─────────────────────────────────────┐
│  [Icon]                             │
│  Title                              │
│  Description                        │
│                                     │
│  Cancel                Confirm      │
└─────────────────────────────────────┘
```

**Accessibility:**
- Focus on cancel button by default
- Destructive action visually prominent but keyboard secondary

---

### 3.3.5 Drawer

**Purpose:** Slide-in panel for secondary content.

**Variants:**

| Variant | Position | Description |
|---------|----------|-------------|
| **Right** | Right edge | Detail views, forms |
| **Left** | Left edge | Navigation, filters |
| **Bottom** | Bottom edge | Mobile sheets |

**Sizes:**

| Size | Width | Description |
|------|-------|-------------|
| **Small** | 320px | Quick actions |
| **Medium** | 480px | Forms |
| **Large** | 640px | Complex content |
| **Full** | 100% - 64px | Full content |

**Specifications:**

| Property | Value |
|----------|-------|
| **Background** | `white` |
| **Shadow** | `shadow-xl` |
| **Backdrop** | `opacity-overlay` |
| **Animation** | Slide in/out |
| **Duration** | 300ms |
| **Header padding** | 16px 24px |
| **Content padding** | 24px |

**Accessibility:**
- `role="dialog"`
- `aria-modal="true"`
- Focus trapped within drawer
- `Escape` to close

---

### 3.3.6 Loading Spinner

**Purpose:** Indicate loading state.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Circular** | Spinning circle |
| **Linear** | Progress bar |
| **Dots** | Three dots |
| **Skeleton** | Content placeholder |

**Sizes:**

| Size | Dimensions | Description |
|------|------------|-------------|
| **Small** | 16px | Inline |
| **Medium** | 24px | Standard |
| **Large** | 32px | Emphasis |
| **Full page** | 48px | Page loading |

**States:**

| State | Description |
|-------|-------------|
| **Spinning** | Active loading |
| **Static** | Paused |

**Accessibility:**
- `role="status"`
- `aria-label="Loading"`
- `aria-live="polite"`

---

### 3.3.7 Empty State

**Purpose:** Display when no data is available.

**Variants:**

| Variant | Description |
|---------|-------------|
| **No data** | Empty table/list |
| **No results** | Search returns nothing |
| **First use** | Onboarding/welcome |
| **Error** | Failed to load |

**Structure:**

```
┌─────────────────────────────────────┐
│                                     │
│           [Illustration]            │
│                                     │
│           Title                     │
│           Description               │
│           [Action Button]           │
│                                     │
└─────────────────────────────────────┘
```

**Specifications:**

| Property | Value |
|----------|-------|
| **Illustration size** | 120px |
| **Title** | `heading-md` |
| **Description** | `body-md` + `gray-500` |
| **Max width** | 400px |
| **Text align** | Centre |

**Accessibility:**
- `role="status"`
- Descriptive text for screen readers

---

### 3.3.8 Error State

**Purpose:** Display when something goes wrong.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Page error** | Full page error |
| **Component error** | Inline error |
| **Network error** | Connectivity issue |

**Structure:**

```
┌─────────────────────────────────────┐
│                                     │
│           [Error Icon]              │
│                                     │
│           Title                     │
│           Description               │
│           [Retry Button]            │
│                                     │
└─────────────────────────────────────┘
```

**Accessibility:**
- `role="alert"`
- `aria-live="assertive"`
- Clear error description

---

### 3.3.9 Success State

**Purpose:** Confirm successful completion.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Inline** | Small success indicator |
| **Page** | Full page success |
| **Modal** | Success dialog |

**Structure:**

```
┌─────────────────────────────────────┐
│                                     │
│           [Success Icon]            │
│                                     │
│           Title                     │
│           Description               │
│           [Action Button]           │
│                                     │
└─────────────────────────────────────┘
```

**Accessibility:**
- `role="status"`
- `aria-live="polite"`

---

### 3.3.10 Progress Toast

**Purpose:** Show progress of long-running operations.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Determinate** | Known progress |
| **Indeterminate** | Unknown duration |

**Structure:**

```
┌─────────────────────────────────────┐
│  Icon  Message                 Close │
│        Progress bar                 │
│        50% complete                 │
└─────────────────────────────────────┘
```

**Accessibility:**
- `role="progressbar"`
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

---

### 3.3.11 Notification Badge

**Purpose:** Indicate unread notifications.

**Variants:**

| Variant | Description |
|---------|-------------|
| **Dot** | Simple indicator |
| **Count** | Number badge |
| **Text** | Text badge |

**Sizes:**

| Size | Min Width | Height | Font Size |
|------|-----------|--------|-----------|
| **Dot** | 8px | 8px | - |
| **Count** | 20px | 20px | 11px |
| **Text** | Auto | 20px | 12px |

**States:**

| State | Background | Description |
|-------|------------|-------------|
| **Default** | `error` | New notifications |
| **Muted** | `gray-400` | Muted notifications |

**Accessibility:**
- `aria-label="X new notifications"`

---


---

## 3.4 Dashboard

---

### 3.4.1 KPI Card

**Purpose:** Display key performance indicator with value and trend.

**Structure:**

```
┌─────────────────────────────────────┐
│  Label                      Icon    │
│  Value                             │
│  Trend  ▲ +12% from last month     │
└─────────────────────────────────────┘
```

**Specifications:**

| Property | Value |
|----------|-------|
| **Padding** | 24px |
| **Border radius** | 12px |
| **Background** | `white` |
| **Border** | 1px `gray-200` |
| **Label size** | 14px `gray-500` |
| **Value size** | 32px `gray-900` |
| **Trend size** | 14px |

**Variants:**

| Variant | Trend Colour | Description |
|---------|--------------|-------------|
| **Positive** | `success` | Good trend |
| **Negative** | `error` | Bad trend |
| **Neutral** | `gray-500` | No change |
| **Warning** | `warning` | Caution |

**Accessibility:**
- `role="article"`
- `aria-label` with full context
- Trend announced for screen readers

---

### 3.4.2 Chart Card

**Purpose:** Display chart with title and controls.

**Structure:**

```
┌─────────────────────────────────────┐
│  Title                      Controls │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │           Chart             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│  Legend                              │
└─────────────────────────────────────┘
```

**Specifications:**

| Property | Value |
|----------|-------|
| **Padding** | 24px |
| **Border radius** | 12px |
| **Background** | `white` |
| **Border** | 1px `gray-200` |
| **Min height** | 240px |
| **Chart height** | 200px |

---

### 3.4.3 Activity Feed

**Purpose:** Display recent activities.

**Structure:**

```
┌─────────────────────────────────────┐
│  Recent Activity             View All│
├─────────────────────────────────────┤
│  ┌─────┐                           │
│  │ Avtr│  John added a new student  │
│  │     │  2 minutes ago            │
│  └─────┘                           │
├─────────────────────────────────────┤
│  ┌─────┐                           │
│  │ Avtr│  Fee payment received      │
│  │     │  5 minutes ago            │
│  └─────┘                           │
└─────────────────────────────────────┘
```

**Specifications:**

| Property | Value |
|----------|-------|
| **Item height** | Auto (min 64px) |
| **Item padding** | 16px |
| **Avatar size** | 40px |
| **Time text** | 12px `gray-400` |
| **Max items** | 5-10 |

---

### 3.4.4 Quick Actions

**Purpose:** Provide shortcuts to common tasks.

**Structure:**

```
┌─────────────────────────────────────┐
│  Quick Actions                      │
├─────────────────────────────────────┤
│  ┌───────┐  ┌───────┐  ┌───────┐  │
│  │  Add  │  │  Add  │  │  Run  │  │
│  │Student│  │Teacher│  │ Report│  │
│  └───────┘  └───────┘  └───────┘  │
│  ┌───────┐  ┌───────┐  ┌───────┐  │
│  │ Record│  │ Send  │  │ View  │  │
│  │ Fee   │  │Notice │  │Calendar│ │
│  └───────┘  └───────┘  └───────┘  │
└─────────────────────────────────────┘
```

**Specifications:**

| Property | Value |
|----------|-------|
| **Grid** | 3 columns |
| **Gap** | 12px |
| **Item height** | 80px |
| **Icon size** | 24px |
| **Label size** | 12px |
| **Border radius** | 8px |

---

### 3.4.5 Calendar Widget

**Purpose:** Display upcoming events.

**Structure:**

```
┌─────────────────────────────────────┐
│  July 2026              < Month >   │
├─────┬─────┬─────┬─────┬─────┬─────┤
│ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │
├─────┼─────┼─────┼─────┼─────┼─────┤
│     │     │  1  │  2  │  3  │  4  │  5  │
├─────┼─────┼─────┼─────┼─────┼─────┤
│  6  │  7  │  8  │  9  │ 10  │ 11  │ 12  │
└─────┴─────┴─────┴─────┴─────┴─────┘
├─────────────────────────────────────┤
│  Upcoming                           │
│  • Staff Meeting - 10:00 AM        │
│  • Parent Conference - 2:00 PM     │
└─────────────────────────────────────┘
```

**Specifications:**

| Property | Value |
|----------|-------|
| **Day cell size** | 36px |
| **Today highlight** | `primary-subtle` |
| **Selected** | `primary` |
| **Event dot** | 4px circle |

---

### 3.4.6 Stats Grid

**Purpose:** Display multiple KPIs in grid layout.

**Specifications:**

| Property | Value |
|----------|-------|
| **Columns** | 4 (desktop), 2 (tablet), 1 (mobile) |
| **Gap** | 16px |
| **Card min height** | 120px |

**Responsive:**

| Breakpoint | Columns |
|------------|---------|
| Desktop | 4 |
| Tablet | 2 |
| Mobile | 1 |

---


---

## 3.5 Permission-Aware Component Behaviour

### Purpose

UI components must adapt their visual state and behaviour based on user permissions. This ensures users only see and interact with functionality their role permits.

### Permission States

| State | Visual Treatment | Interaction | Description |
|-------|-----------------|-------------|-------------|
| **Hidden** | Not rendered | None | Component completely removed from view |
| **Disabled** | 50% opacity | No interaction | Component visible but non-interactive |
| **Read-only** | Normal appearance | View only | Component displays data but cannot be edited |
| **Restricted** | Dimmed with indicator | Tooltip explains | Component visible but access denied |
| **Pending approval** | Normal with pending badge | Limited interaction | Component awaiting approval workflow |
| **Feature unavailable** | Hidden or replaced | None | Feature not included in subscription |
| **Subscription restricted** | Upgrade prompt | CTA to upgrade | Feature requires higher subscription tier |

### Component Adaptation Rules

| Component | Permission Behaviour |
|-----------|---------------------|
| **Button** | Disabled state for restricted actions; hidden for unavailable features |
| **Form fields** | Read-only for view-only permissions; disabled for restricted edits |
| **Table actions** | Hide action columns when user lacks permission |
| **Navigation items** | Hide menu items for unavailable modules |
| **Dashboard widgets** | Hide widgets for restricted data; show upgrade prompt for subscription |
| **Bulk actions** | Disable when bulk operation exceeds permission scope |

### Permission Visual Indicators

| Indicator | Usage |
|-----------|-------|
| **Lock icon** | Indicates restricted access |
| **Upgrade badge** | Indicates subscription requirement |
| **Pending badge** | Indicates approval workflow |
| **Tooltip** | Explains restriction reason on hover |

### Permission Rules

| Rule | Description |
|------|-------------|
| **Graceful degradation** | Components degrade gracefully based on permissions |
| **Consistent patterns** | Same permission behaviour across all modules |
| **Clear communication** | Users understand why functionality is restricted |
| **No dead ends** | Restricted components provide alternative paths where possible |

---

## 3.6 Standard Component State Matrix

### Purpose

Define the standard interactive states expected across the design system. Components inherit from this common state model unless a documented exception exists.

### Core States

| State | Description | Visual Treatment |
|-------|-------------|-----------------|
| **Default** | Initial state before interaction | Standard appearance |
| **Hover** | Mouse pointer over element | Subtle background or border change |
| **Focus** | Keyboard focus on element | Visible focus ring |
| **Active** | Element being activated | Slightly darker or pressed appearance |
| **Pressed** | Button or control being held | Darker background, subtle scale |
| **Selected** | Item chosen from set | Primary colour indicator |
| **Disabled** | Non-interactive state | 50% opacity, no cursor change |
| **Loading** | Processing in progress | Spinner or progress indicator |
| **Error** | Validation or operation failure | Red border, error message |
| **Success** | Operation completed | Green indicator, success message |
| **Empty** | No content available | Empty state illustration |
| **Read-only** | View only, no editing | Normal appearance, no edit affordance |

### State Application by Component Type

| Component | Applicable States |
|-----------|-------------------|
| **Button** | Default, hover, focus, active, pressed, disabled, loading |
| **Input field** | Default, hover, focus, disabled, error, success, read-only |
| **Select** | Default, hover, focus, disabled, error |
| **Checkbox/Radio** | Default, hover, focus, selected, disabled |
| **Toggle** | Default, hover, focus, selected, disabled |
| **Card** | Default, hover, focus, selected, disabled |
| **Table row** | Default, hover, selected, disabled |
| **Navigation item** | Default, hover, focus, active, disabled |

### State Transition Rules

| Rule | Description |
|------|-------------|
| **Immediate feedback** | State changes reflect immediately |
| **Smooth transitions** | Use 100-200ms transitions between states |
| **Consistent order** | State priority: error > success > disabled > loading > default |
| **Keyboard parity** | All hover states have equivalent focus states |
| **No dead ends** | Users can always understand current state |

### State Documentation Requirements

| Requirement | Description |
|-------------|-------------|
| **Every component** | Document all applicable states |
| **State diagram** | Provide visual state diagram for complex components |
| **Transition notes** | Document timing and easing for state transitions |
| **Exception handling** | Document any deviations from standard state model |

---

## 3.7 Component Composition

### Purpose

Define how primitive components combine into larger reusable interface patterns. Promote reuse and consistency by assembling components rather than duplicating them.

### Composition Hierarchy

| Level | Description | Examples |
|-------|-------------|----------|
| **Primitive** | Atomic,不可再分的组件 | Button, Input, Badge, Icon |
| **Composite** | Combinations of primitives | Search Field (Input + Button + Icon), Form Field (Label + Input + Helper) |
| **Pattern** | Reusable interface patterns | Data Table, Form Layout, Card Grid |
| **Template** | Full page structures | Dashboard, CRUD List, Detail View |
| **Screen** | Complete application screens | Student List, Grade Book, Fee Management |

### Composition Principles

| Principle | Description |
|-----------|-------------|
| **Assemble, don't duplicate** | Combine existing components rather than creating new ones |
| **Single responsibility** | Each component does one thing well |
| **Predictable composition** | Same components combine the same way everywhere |
| **Flexible arrangement** | Components adapt to different container contexts |
| **Consistent spacing** | Use design tokens for all spacing between composed elements |

### Primitive Components

| Category | Components |
|----------|------------|
| **Action** | Button, Icon Button, Link, Toggle |
| **Input** | Text Field, Select, Checkbox, Radio, Switch, Date Picker |
| **Display** | Badge, Avatar, Tag, Separator, Tooltip |
| **Feedback** | Alert, Toast, Progress, Spinner |
| **Layout** | Container, Stack, Grid, Divider |

### Composite Components

| Composite | Primitives | Purpose |
|-----------|------------|---------|
| **Search Field** | Text Field + Button + Icon | Combined search input |
| **Form Field** | Label + Input + Helper Text + Error | Complete form input |
| **Select Field** | Label + Select + Helper Text | Enhanced select |
| **Date Field** | Label + Date Picker + Helper Text | Date input group |
| **File Upload** | Dropzone + Button + File List | Complete file upload |
| **Pagination** | Button + Text + Select | Page navigation |
| **Breadcrumb** | Link + Separator + Text | Navigation trail |
| **Status Badge** | Badge + Icon + Text | Status indicator |
| **Avatar Group** | Avatar + Badge + Text | User group display |
| **Action Bar** | Button + Button + Separator | Grouped actions |

### Pattern Components

| Pattern | Composites | Purpose |
|---------|------------|---------|
| **Data Table** | Table + Pagination + Filters + Bulk Actions | Complete data management |
| **Form Layout** | Form Fields + Action Bar | Complete form structure |
| **Card Grid** | Cards + Pagination | Content listing |
| **Detail View** | Header + Content + Sidebar | Item detail display |
| **Filter Panel** | Search + Selects + Checkboxes | Advanced filtering |
| **Media Object** | Avatar + Text + Actions | List item pattern |
| **Stat Card** | KPI + Trend + Chart | Dashboard metric |

### Composition Rules

| Rule | Description |
|------|-------------|
| **Consistent spacing** | Use spacing tokens between composed elements |
| **Flexible sizing** | Composed components adapt to container width |
| **Accessible composition** | Maintain accessibility when combining components |
| **Keyboard navigation** | Ensure logical tab order through composed elements |
| **Responsive behaviour** | Composed components reflow appropriately at breakpoints |

### Composition Anti-Patterns

| Anti-Pattern | Why It Conflicts |
|--------------|------------------|
| **Duplicating primitives** | Creates inconsistency; violates reuse principle |
| **Deeply nested composition** | Increases complexity; reduces maintainability |
| **Tight coupling** | Components depend on specific parent context |
| **Inconsistent spacing** | Different spacing between same component patterns |
| **Missing states** | Composed components lack proper state handling |

---

# Chapter 4 — Data Visualisation

---

## 4.1 Chart Standards

### Colour Palette

| Colour | Hex | Usage |
|--------|-----|-------|
| **Primary** | `#2563EB` | Primary data series |
| **Secondary** | `#7C3AED` | Secondary data series |
| **Tertiary** | `#059669` | Tertiary data series |
| **Quaternary** | `#D97706` | Quaternary data series |
| **Quinary** | `#DC2626` | Quinary data series |
| **Success** | `#16A34A` | Positive values |
| **Warning** | `#D97706` | Caution values |
| **Error** | `#DC2626` | Negative values |

### Chart Typography

| Element | Size | Weight | Colour |
|---------|------|--------|--------|
| **Title** | 16px | 600 | `gray-800` |
| **Subtitle** | 14px | 400 | `gray-500` |
| **Axis label** | 12px | 400 | `gray-500` |
| **Tick label** | 12px | 400 | `gray-400` |
| **Legend** | 12px | 400 | `gray-600` |
| **Tooltip** | 12px | 500 | `white` |

### Chart Grid

| Property | Value |
|----------|-------|
| **Grid colour** | `gray-200` |
| **Grid style** | Dashed |
| **Grid opacity** | 0.5 |
| **Axis line** | `gray-300` |
| **Axis width** | 1px |

### Chart Spacing

| Property | Value |
|----------|-------|
| **Padding top** | 16px |
| **Padding right** | 16px |
| **Padding bottom** | 32px |
| **Padding left** | 48px |
| **Legend gap** | 16px |

### Chart Rules

| Rule | Description |
|------|-------------|
| **Consistent colours** | Same colours for same data across charts |
| **Meaningful labels** | Clear, descriptive axis labels |
| **Accessible colours** | Sufficient contrast; avoid colour-only encoding |
| **Responsive** | Charts resize with container |
| **Empty states** | Show message when no data |

---

## 4.2 Line Charts

**Purpose:** Show trends over time.

**Specifications:**

| Property | Value |
|----------|-------|
| **Line width** | 2px |
| **Point size** | 6px |
| **Point border** | 2px `white` |
| **Curve** | Monotone (smooth) |
| **Grid** | Horizontal only |
| **Tooltip** | On hover |

**Variants:**

| Variant | Description |
|---------|-------------|
| **Single line** | One data series |
| **Multi-line** | Multiple data series |
| **Area** | Filled area under line |
| **Gradient** | Gradient fill |

**States:**

| State | Description |
|-------|-------------|
| **Default** | Full opacity |
| **Hover** | Highlighted line, dimmed others |
| **Selected** | Thickened line |

**Accessibility:**
- Patterns for colour-blind users
- Keyboard navigation to data points
- Screen reader announces values

---

## 4.3 Bar Charts

**Purpose:** Compare values across categories.

**Specifications:**

| Property | Value |
|----------|-------|
| **Bar radius** | 4px (top) |
| **Bar gap** | 8px |
| **Group gap** | 16px |
| **Min width** | 32px |
| **Max width** | 64px |

**Variants:**

| Variant | Description |
|---------|-------------|
| **Vertical** | Bars go up |
| **Horizontal** | Bars go right |
| **Stacked** | Stacked segments |
| **Grouped** | Side-by-side bars |

**Accessibility:**
- Patterns for colour-blind users
- Keyboard navigation to bars
- Screen reader announces values

---

## 4.4 Pie & Donut Charts

**Purpose:** Show proportion of parts to whole.

**Specifications:**

| Property | Value |
|----------|-------|
| **Size** | 200px diameter |
| **Inner radius (donut)** | 60% |
| **Padding** | 2px between segments |
| **Stroke** | None |

**Variants:**

| Variant | Description |
|---------|-------------|
| **Pie** | Full circle |
| **Donut** | Hollow centre |
| **Donut with value** | Centre shows total/selected |

**Accessibility:**
- Patterns for colour-blind users
- Keyboard navigation to segments
- Screen reader announces percentages

---

## 4.5 Area Charts

**Purpose:** Show volume over time.

**Specifications:**

| Property | Value |
|----------|-------|
| **Fill opacity** | 0.1 |
| **Stroke width** | 2px |
| **Curve** | Monotone |

**Variants:**

| Variant | Description |
|---------|-------------|
| **Single area** | One data series |
| **Stacked area** | Multiple series |
| **Gradient** | Gradient fill |

---

## 4.6 Data Tables

### Table Design Standards

| Property | Value |
|----------|-------|
| **Header background** | `gray-50` |
| **Header font** | 12px 600 `gray-600` uppercase |
| **Row font** | 14px 400 `gray-800` |
| **Row height** | 48px |
| **Cell padding** | 12px 16px |
| **Border** | 1px `gray-200` bottom |

### Table Features

| Feature | Description |
|---------|-------------|
| **Sorting** | Click column header to sort |
| **Filtering** | Filter controls above table |
| **Pagination** | 10/25/50/100 rows per page |
| **Search** | Filter rows by text |
| **Bulk actions** | Select multiple rows |
| **Export** | CSV/Excel export |

### Table States

| State | Description |
|-------|-------------|
| **Loading** | Skeleton loader |
| **Empty** | No data message |
| **Error** | Error message with retry |
| **Success** | Data displayed |

---

## 4.7 Trend Indicators

### Arrow Indicators

| Indicator | Colour | Usage |
|-----------|--------|-------|
| **Up arrow** | `success` | Positive change |
| **Down arrow** | `error` | Negative change |
| **Dash** | `gray-400` | No change |

### Trend Formatting

| Format | Example | Usage |
|--------|---------|-------|
| **Percentage** | +12.5% | Relative change |
| **Absolute** | +2,340 | Absolute change |
| **Mixed** | +12.5% (+2,340) | Both |

### Trend Rules

| Rule | Description |
|------|-------------|
| **Consistent** | Same format across dashboard |
| **Contextual** | Include comparison period |
| **Colour-coded** | Green for positive, red for negative |

---

## 4.8 Legends & Labels

### Legend Specifications

| Property | Value |
|----------|-------|
| **Position** | Bottom of chart |
| **Item gap** | 16px |
| **Indicator size** | 12px |
| **Font size** | 12px |
| **Font colour** | `gray-600` |

### Label Specifications

| Property | Value |
|----------|-------|
| **Font size** | 12px |
| **Font colour** | `gray-500` |
| **Position** | Centre of segment or end of line |

### Legend Rules

| Rule | Description |
|------|-------------|
| **Clickable** | Click to toggle series |
| **Accessible** | Keyboard navigable |
| **Responsive** | Wrap on narrow screens |

---

## 4.9 Empty & Error States

### Empty Chart State

```
┌─────────────────────────────────────┐
│                                     │
│           [Chart Icon]              │
│                                     │
│           No data available         │
│           Check back later          │
│                                     │
└─────────────────────────────────────┘
```

### Error Chart State

```
┌─────────────────────────────────────┐
│                                     │
│           [Error Icon]              │
│                                     │
│           Unable to load data       │
│           [Retry]                   │
│                                     │
└─────────────────────────────────────┘
```

---


---

# Chapter 5 — Motion, Accessibility & Responsiveness

---

## 5.1 Motion Standards

### Motion Philosophy

Motion in OpenSchool ERP is purposeful, subtle, and respectful. Every animation serves a functional purpose: guiding attention, providing feedback, or maintaining context during transitions.

| Principle | Description |
|-----------|-------------|
| **Purposeful** | Every animation serves a function |
| **Fast** | Keep animations under 300ms |
| **Subtle** | Avoid distracting animations |
| **Consistent** | Same durations for same types |
| **Respectful** | Support prefers-reduced-motion |

### Animation Durations

| Token | Value | Usage |
|-------|-------|-------|
| `duration-instant` | 0ms | Immediate feedback |
| `duration-fast` | 100ms | Micro-interactions |
| `duration-normal` | 200ms | Standard transitions |
| `duration-slow` | 300ms | Complex transitions |
| `duration-slower` | 500ms | Page transitions |

### Easing Curves

| Token | Value | Usage |
|-------|-------|-------|
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General purpose |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exiting elements |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Entering elements |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | State changes |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy (sparingly) |

### Transition Patterns

| Pattern | Duration | Easing | Usage |
|---------|----------|--------|-------|
| **Fade in** | 200ms | `ease-out` | Content appearing |
| **Fade out** | 150ms | `ease-in` | Content disappearing |
| **Slide up** | 200ms | `ease-out` | Bottom sheet, modal |
| **Slide down** | 200ms | `ease-in` | Closing bottom sheet |
| **Scale up** | 200ms | `ease-out` | Popover, dropdown |
| **Scale down** | 150ms | `ease-in` | Closing popover |

### Micro-Interactions

| Element | Animation | Duration |
|---------|-----------|----------|
| **Button hover** | Background darken | 100ms |
| **Button active** | Scale 0.98 | 100ms |
| **Checkbox** | Check mark draw | 200ms |
| **Toggle** | Thumb slide | 200ms |
| **Icon rotation** | 90° rotation | 200ms |
| **Badge appear** | Scale from 0 | 200ms |
| **Tooltip** | Fade + slide 4px | 150ms |
| **Toast** | Slide in from right | 300ms |

### Page Transitions

| Transition | Duration | Description |
|------------|----------|-------------|
| **Route change** | 200ms | Content swap |
| **Modal open** | 300ms | Backdrop + content |
| **Modal close** | 200ms | Content + backdrop |
| **Drawer open** | 300ms | Slide from edge |
| **Drawer close** | 200ms | Slide to edge |

### Motion Rules

| Rule | Description |
|------|-------------|
| **No delay on interaction** | Respond immediately to user input |
| **Stagger lists** | 50ms delay between items |
| **Avoid motion sickness** | Don't move entire viewport |
| **Respect reduced motion** | Use `prefers-reduced-motion` |
| **Test at 60fps** | Ensure smooth animation |

---

## 5.2 Accessibility Standards

### WCAG 2.1 AA Compliance

All interfaces must meet WCAG 2.1 Level AA standards.

### Colour Contrast

| Element | Minimum Ratio | Description |
|---------|---------------|-------------|
| **Normal text** | 4.5:1 | Body text, labels |
| **Large text** | 3:1 | Headings (18px+ bold, 24px+) |
| **UI components** | 3:1 | Borders, icons |
| **Focus indicators** | 3:1 | Keyboard focus |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move to next focusable element |
| `Shift+Tab` | Move to previous focusable element |
| `Enter` / `Space` | Activate button/link |
| `Arrow keys` | Navigate within components |
| `Escape` | Close modal/dropdown |
| `Home` | Move to first item |
| `End` | Move to last item |

### Focus Management

| Property | Value |
|----------|-------|
| **Focus ring colour** | `primary` |
| **Focus ring width** | 2px |
| **Focus ring offset** | 2px |
| **Focus ring style** | Solid |

### Focus Rules

| Rule | Description |
|------|-------------|
| **Visible** | Always show focus indicator |
| **Logical** | Follow visual reading order |
| **Trapped** | Trap focus in modals |
| **Restored** | Return focus on close |
| **No focus on scroll** | Don't steal focus |

### Screen Reader Support

| Element | ARIA Attribute |
|---------|----------------|
| **Page title** | `document.title` |
| **Landmarks** | `role="banner"`, `role="main"`, etc. |
| **Headings** | `h1`-`h6` hierarchy |
| **Live regions** | `aria-live="polite"` |
| **Status** | `role="status"` |
| **Alerts** | `role="alert"` |

### Touch Targets

| Property | Minimum |
|----------|---------|
| **Touch target** | 44px × 44px |
| **Spacing between targets** | 8px |

### Text Scaling

| Requirement | Description |
|-------------|-------------|
| **Support up to 200%** | Interface must work at 200% zoom |
| **No horizontal scroll** | Text reflows at larger sizes |
| **No content loss** | All content remains accessible |

### Motion Sensitivity

| Requirement | Description |
|-------------|-------------|
| **prefers-reduced-motion** | Disable non-essential animations |
| **Essential motion** | Keep functional transitions |
| **No auto-play** | Never auto-play animation |

### Colour Blindness

| Requirement | Description |
|-------------|-------------|
| **Don't rely on colour alone** | Use icons, text, patterns |
| **Test with simulators** | Verify with colour blindness tools |
| **Sufficient contrast** | Meet WCAG contrast ratios |

### Accessibility Testing

| Tool | Usage |
|------|-------|
| **axe** | Automated testing |
| **Lighthouse** | Performance + accessibility |
| **VoiceOver** | Screen reader testing |
| **NVDA** | Screen reader testing |
| **Keyboard only** | Manual testing |

---

## 5.3 Responsive Standards

### Breakpoint Behaviour

| Breakpoint | Layout | Navigation | Grid |
|-----------|--------|------------|------|
| **Mobile** (< 640px) | Single column | Bottom tab bar | 4 columns |
| **Tablet** (640-1024px) | Two column | Collapsed sidebar | 8 columns |
| **Desktop** (1024-1440px) | Full layout | Expanded sidebar | 12 columns |
| **Wide** (> 1440px) | Full layout | Expanded sidebar | 12 columns |

### Responsive Patterns

| Pattern | Description |
|---------|-------------|
| **Stack** | Side-by-side becomes stacked |
| **Collapse** | Sidebar collapses to icons |
| **Reflow** | Content reflows to fit |
| **Hide/Show** | Show/hide elements by breakpoint |
| **Resize** | Elements resize with container |

### Component Responsive Behaviour

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| **Sidebar** | Hidden | Collapsed | Expanded |
| **Top nav** | Hamburger | Logo + hamburger | Full |
| **Table** | Cards | Horizontal scroll | Full |
| **Form** | Full width | Two columns | Two columns |
| **Card grid** | 1 column | 2 columns | 3-4 columns |
| **Modal** | Full screen | 80% width | Fixed width |
| **Toast** | Full width | 380px | 380px |
| **Tooltip** | Disable | Bottom | Smart position |

### Mobile-Specific Patterns

| Pattern | Description |
|---------|-------------|
| **Bottom sheet** | Replace dropdowns on mobile |
| **Swipe actions** | Swipe to delete/archive |
| **Pull to refresh** | Refresh list content |
| **Touch gestures** | Pinch to zoom, swipe to navigate |

### Tablet-Specific Patterns

| Pattern | Description |
|---------|-------------|
| **Split view** | List + detail side by side |
| **Adaptive layout** | Adjust to orientation |
| **Keyboard support** | External keyboard support |

### Responsive Typography

| Breakpoint | Heading Size | Body Size |
|-----------|--------------|-----------|
| **Mobile** | 24px | 14px |
| **Tablet** | 28px | 16px |
| **Desktop** | 32px | 16px |

### Responsive Spacing

| Breakpoint | Container Padding |
|------------|-------------------|
| **Mobile** | 16px |
| **Tablet** | 24px |
| **Desktop** | 32px |

---


---

## 5.4 Internationalisation & Localisation Support

### Purpose

All design system components must accommodate international text, locale-specific formatting, and layout direction without requiring modification.

### Text Expansion

| Rule | Description |
|------|-------------|
| **Flexible containers** | Components must not assume fixed text length |
| **Minimum width** | Define minimum widths based on content, not text |
| **Truncation strategy** | Truncate with ellipsis when text exceeds container |
| **Wrapping** | Allow text wrapping where layout permits |

### Locale-Aware Formatting

| Element | Consideration |
|---------|---------------|
| **Dates** | DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD variations |
| **Time** | 12-hour and 24-hour formats |
| **Numbers** | Decimal separators (comma vs period) |
| **Currency** | Symbol position, decimal places, grouping |
| **Phone numbers** | Country code formats, spacing |

### Right-to-Left Support

| Element | RTL Behaviour |
|---------|---------------|
| **Text alignment** | Mirror to right edge |
| **Icon placement** | Mirror horizontal icons |
| **Navigation flow** | Reverse horizontal direction |
| **Form layout** | Mirror field order |
| **Scrollbars** | Position on left side |
| **Chevrons/arrows** | Mirror direction |
| **Number input** | Keep left-to-right for numerals |

### Icon Mirroring Rules

| Icon Type | Mirror in RTL |
|-----------|---------------|
| **Directional arrows** | Yes |
| **Chevrons** | Yes |
| **Progress indicators** | Yes |
| **Symmetrical icons** | No |
| **Logos** | No |
| **Numbers/text** | No |

### Locale-Aware Spacing

| Rule | Description |
|------|-------------|
| **Relative units** | Use relative spacing that adapts to content |
| **No hardcoded left/right** | Use start/end instead of left/right |
| **Padding consistency** | Maintain padding balance in mirrored layouts |

### Layout Adaptation

| Breakpoint | RTL Consideration |
|------------|-------------------|
| **Mobile** | Mirror bottom tab bar order |
| **Tablet** | Mirror sidebar position |
| **Desktop** | Mirror full layout direction |

---

## 5.5 Design Performance Budget

### Purpose

Establish practical limits that maintain visual performance, scalable design files, and efficient implementation.

### Visual Effects Budget

| Effect | Maximum Per Screen | Description |
|--------|-------------------|-------------|
| **Shadows** | 8 active shadows | Avoid excessive elevation layering |
| **Blur effects** | 2 active blurs | Reserve for modals and overlays only |
| **Glass effects** | 1 active glass panel | Use sparingly; never sacrifice readability |
| **Gradients** | 3 active gradients | Subtle use only; never for primary content |
| **Drop shadows** | Consistent with elevation scale | Never exceed shadow-xl |

### Animation Budget

| Category | Limit | Description |
|----------|-------|-------------|
| **Simultaneous animations** | Maximum 3 | Avoid overwhelming the viewport |
| **Animation duration** | Maximum 500ms | Keep all animations fast |
| **Staggered animations** | Maximum 8 items | Limit list stagger effects |
| **Page transition** | Maximum 300ms | Keep route changes fast |
| **Loading animation** | Maximum 3 concurrent | Avoid multiple spinners |

### Component Nesting Budget

| Pattern | Maximum Depth | Description |
|---------|---------------|-------------|
| **Auto-layout nesting** | 6 levels | Prevent deeply nested layouts |
| **Component nesting** | 4 levels | Keep component trees shallow |
| **Frame nesting** | 5 levels | Maintain manageable file structure |
| **Group nesting** | 3 levels | Prefer components over groups |

### Asset Optimisation

| Asset Type | Guideline |
|------------|-----------|
| **Icons** | Use vector; optimise paths; consistent stroke weight |
| **Illustrations** | SVG preferred; optimise for file size |
| **Photographs** | Compress; use appropriate format |
| **Lottie animations** | Keep under 50KB per animation |
| **Fonts** | Subset to required characters; use variable fonts |

### File Performance

| Guideline | Description |
|-----------|-------------|
| **Component instances** | Prefer instances over copies |
| **Shared styles** | Use shared styles for consistency |
| **Page organisation** | One page per component category |
| **Naming discipline** | Consistent naming reduces file overhead |
| **Unused elements** | Remove unused components and styles |

### Implementation Budget

| Metric | Target |
|--------|--------|
| **Component bundle size** | Under 5KB gzipped per component |
| **Font loading** | Under 100KB total font weight |
| **Icon set** | Under 50KB for standard icon set |
| **Animation library** | Under 100KB for animation utilities |
| **Total design system** | Under 200KB gzipped |

---

# Chapter 6 — Component Governance

---

## 6.1 Naming Conventions

### Design Token Naming

```
{category}-{property}-{variant}-{state}
```

| Segment | Description | Example |
|---------|-------------|---------|
| **category** | Token category | `brand`, `semantic`, `neutral` |
| **property** | Visual property | `color`, `spacing`, `radius` |
| **variant** | Specific variant | `primary`, `error`, `sm` |
| **state** | Interaction state | `default`, `hover`, `active`, `disabled` |

### Component Naming

| Pattern | Example | Description |
|---------|---------|-------------|
| **PascalCase** | `Button` | Component name |
| **kebab-case** | `button-group` | CSS class / file name |
| **camelCase** | `buttonGroup` | Variable / prop name |

### File Naming

| Type | Pattern | Example |
|------|---------|---------|
| **Component** | `PascalCase` | `Button` |
| **Style** | `kebab-case` | `button` |
| **Test** | `PascalCase.test` | `Button.test` |
| **Story** | `PascalCase.stories` | `Button.stories` |
| **Token** | `kebab-case` | `colors` |

### Icon Naming

```
{category}-{name}-{variant}
```

| Segment | Example |
|---------|---------|
| **category** | `icon` |
| **name** | `chevron`, `plus`, `check` |
| **variant** | `right`, `left`, `solid` |

Example: `icon-chevron-right`

### Asset Naming

```
{type}-{name}-{size}-{variant}.{ext}
```

| Segment | Example |
|---------|---------|
| **type** | `logo`, `illustration` |
| **name** | `school`, `student` |
| **size** | `sm`, `md`, `lg` |
| **variant** | `dark`, `light` |
| **ext** | `svg`, `png` |

Example: `logo-school-md-dark.svg`

---

## 6.2 Component Lifecycle

### Lifecycle Stages

| Stage | Description | Duration |
|-------|-------------|----------|
| **Proposed** | New component idea | 1-2 weeks |
| **Design** | Design exploration | 2-4 weeks |
| **Review** | Design review | 1 week |
| **Development** | Implementation | 2-4 weeks |
| **Testing** | QA and accessibility | 1-2 weeks |
| **Documentation** | Documentation update | 1 week |
| **Release** | Ship to production | 1 week |
| **Maintenance** | Ongoing support | Indefinite |

### Stage Definitions

| Stage | Activities | Deliverables |
|-------|------------|--------------|
| **Proposed** | Problem definition, research | RFC document |
| **Design** | Mockups, prototypes, variants | Figma designs |
| **Review** | Design critique, accessibility review | Approved designs |
| **Development** | Component implementation, tests | Component code |
| **Testing** | Visual, functional, accessibility | Test results |
| **Documentation** | Props, usage, examples | Documentation |
| **Release** | Changelog, migration guide | Release notes |
| **Maintenance** | Bug fixes, improvements | Updates |

---

## 6.3 Versioning

### Semantic Versioning

```
MAJOR.MINOR.PATCH
```

| Segment | Description | Example |
|---------|-------------|---------|
| **MAJOR** | Breaking changes | 2.0.0 |
| **MINOR** | New features | 1.1.0 |
| **PATCH** | Bug fixes | 1.0.1 |

### Versioning Rules

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| **Breaking prop change** | MAJOR | 1.0.0 → 2.0.0 |
| **New optional prop** | MINOR | 1.0.0 → 1.1.0 |
| **Bug fix** | PATCH | 1.0.0 → 1.0.1 |
| **Deprecation** | MINOR | 1.0.0 → 1.1.0 |
| **Removal** | MAJOR | 1.1.0 → 2.0.0 |

### Changelog Format

```markdown
## [2.0.0] - 2026-07-21

### Breaking Changes
- Button `size` prop renamed to `variant`

### Added
- Button `loading` prop

### Fixed
- Button hover state on disabled

### Deprecated
- Button `isLoading` prop (use `loading`)
```

---

## 6.4 Deprecation Process

### Deprecation Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| **Announcement** | 2 weeks | Announce deprecation |
| **Warning** | 4 weeks | Show console warnings |
| **Removal** | Next MAJOR | Remove deprecated API |

### Deprecation Rules

| Rule | Description |
|------|-------------|
| **Console warnings** | Show deprecation warnings in development |
| **Migration guide** | Provide clear migration path |
| **Codemods** | Provide automated migration tools when possible |
| **Documentation** | Mark deprecated in documentation |
| **Timeline** | Minimum 6 months before removal |

### Deprecation Example

```typescript
// Before (deprecated)
<Button isLoading={true}>Submit</Button>

// After (current)
<Button loading={true}>Submit</Button>

// Console warning:
// Button: `isLoading` is deprecated. Use `loading` instead.
```

---

## 6.5 Approval Process

### Component Approval

| Step | Reviewer | Criteria |
|------|----------|----------|
| **Design review** | Design lead | Visual quality, consistency |
| **Accessibility review** | A11y specialist | WCAG 2.1 AA compliance |
| **Code review** | Senior engineer | Code quality, performance |
| **Documentation review** | Tech writer | Documentation completeness |

### Approval Checklist

| Category | Item |
|----------|------|
| **Design** | Matches Figma design |
| **Design** | All variants implemented |
| **Design** | All states implemented |
| **Accessibility** | Keyboard navigation works |
| **Accessibility** | Screen reader tested |
| **Accessibility** | Colour contrast meets standards |
| **Code** | Type definitions correct |
| **Code** | Unit tests passing |
| **Code** | No performance issues |
| **Documentation** | Props documented |
| **Documentation** | Usage examples provided |
| **Documentation** | Accessibility notes included |

### Review Meeting

| Item | Duration | Attendees |
|------|----------|-----------|
| **Design review** | 30 min | Design team |
| **Accessibility review** | 30 min | A11y specialist |
| **Code review** | 60 min | Engineering team |

---

## 6.6 Component Documentation

### Documentation Template

```markdown
# Component Name

## Purpose
Brief description of component purpose.

## Usage
When and how to use this component.

## Variants
List of available variants.

## Props
Table of all props with types and defaults.

## Accessibility
Accessibility considerations and ARIA attributes.

## Responsive
Responsive behaviour at different breakpoints.

## Examples
Code examples for common use cases.

## Do's and Don'ts
Usage guidelines.
```

### Documentation Standards

| Standard | Description |
|----------|-------------|
| **Complete** | Document all props and variants |
| **Current** | Update with every change |
| **Accessible** | Include accessibility notes |
| **Responsive** | Document responsive behaviour |
| **Tested** | Verify all examples work |

---

## 6.7 Component Review Checklist

### Design Review

| Check | Status |
|-------|--------|
| Matches Figma design | [ ] |
| All variants implemented | [ ] |
| All states implemented | [ ] |
| Consistent with design system | [ ] |
| Responsive design | [ ] |

### Accessibility Review

| Check | Status |
|-------|--------|
| Keyboard navigation | [ ] |
| Screen reader support | [ ] |
| Colour contrast | [ ] |
| Focus management | [ ] |
| ARIA attributes | [ ] |

### Code Review

| Check | Status |
|-------|--------|
| Type definitions | [ ] |
| Unit tests | [ ] |
| Performance | [ ] |
| Bundle size | [ ] |
| Dependencies | [ ] |

### Documentation Review

| Check | Status |
|-------|--------|
| Props documented | [ ] |
| Usage examples | [ ] |
| Accessibility notes | [ ] |
| Responsive notes | [ ] |
| Do's and Don'ts | [ ] |

---

## 6.8 Future Evolution

### Planned Enhancements

| Enhancement | Timeline | Description |
|-------------|----------|-------------|
| **Theme customisation** | Phase 2 | Custom colour themes |
| **Dark mode** | Phase 3 | Dark theme support |
| **Animation library** | Phase 2 | Advanced animations |
| **Icon library** | Phase 1 | Comprehensive icons |
| **Chart library** | Phase 2 | Advanced charts |

### Component Roadmap

| Quarter | Components |
|---------|------------|
| **Q1** | Button, Input, Select, Card, Badge |
| **Q2** | Table, Modal, Toast, Avatar, Tabs |
| **Q3** | Chart, Calendar, Upload, Accordion |
| **Q4** | Tree, Rich Text, Code Editor |

### Design System Maturity

| Level | Description | Target |
|-------|-------------|--------|
| **L1** | Basic tokens and components | Q1 |
| **L2** | Complete component library | Q2 |
| **L3** | Advanced patterns and templates | Q3 |
| **L4** | Theme customisation | Q4 |
| **L5** | Self-service design system | Y2 |

---

*Document ends*

