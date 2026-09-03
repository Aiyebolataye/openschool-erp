# OpenSchool ERP

## Foundation Layer Implementation Specification

---

| Field | Value |
|-------|-------|
| **Document** | Foundation Layer Implementation Specification |
| **Version** | 1.0 |
| **Status** | Approved |
| **Date** | July 2026 |
| **Classification** | Internal |
| **Author** | Architecture Team |
| **Owner** | Solution Architect |

---

| Aspect | Detail |
|--------|--------|
| **Purpose** | Complete, machine-readable specification for building the Figma Design System Foundation Layer |
| **Scope** | All variable collections, text styles, effect styles, grid styles, and page organization |
| **Governing Documents** | Design System & Component Library (02), Figma Standards & Design QA (03), UI Rendering Specification, Figma Build Roadmap |
| **Derived From** | Approved 02 doc, 03 doc, UI Rendering Spec, Glass Material System architecture |

---

## Table of Contents

1. File Structure
2. Page Organization
3. Variable Collection: Brand Colour
4. Variable Collection: Semantic Colour
5. Variable Collection: Neutral Colour
6. Variable Collection: Glass Colour
7. Variable Collection: Module Accent
8. Variable Collection: Chart Colour
9. Variable Collection: Font Family
10. Variable Collection: Font Size
11. Variable Collection: Font Weight
12. Variable Collection: Line Height
13. Variable Collection: Spacing
14. Variable Collection: Radius
15. Variable Collection: Border Width
16. Variable Collection: Border Colour
17. Variable Collection: Elevation (Shadow)
18. Variable Collection: Z-Index
19. Variable Collection: Blur
20. Variable Collection: Opacity
21. Variable Collection: Motion Duration
22. Variable Collection: Motion Easing
23. Variable Collection: Breakpoint
24. Text Styles
25. Effect Styles
26. Grid Styles
27. Validation Checklist

---

# 1. File Structure

| Property | Value |
|----------|-------|
| **File name** | `DS - OpenSchool` |
| **File type** | Design System (library) |
| **Team** | OpenSchool Design |

---

# 2. Page Organization

| Page | Purpose | Sections |
|------|---------|----------|
| **Cover** | Document landing | Title, version, status, last updated |
| **Tokens** | Design token reference | Brand Colours, Semantic Colours, Neutral Colours, Glass Colours, Module Accents, Chart Colours, Typography, Spacing, Radius, Borders, Elevation, Blur, Opacity, Motion, Breakpoints |
| **Primitives** | Base components | Button, Input, Badge, Icon, Checkbox, Radio, Switch, Avatar, Tooltip |
| **Composites** | Combined components | Search Field, Form Field, Date Picker, Select, Data Table Row |
| **Patterns** | Reusable patterns | Data Table, Form Layout, Dashboard Card, Empty State |
| **Icons** | Icon library reference | Tabler Icons — 24×24, 1.5px stroke |
| **Documentation** | Component docs | Usage guidelines, examples, anti-patterns |
| **Changelog** | Version history | Updates, deprecations |

---

# 3. Variable Collection: Brand Colour

**Collection name:** `brand`
**Modes:** `Light`, `Dark`

| Variable | Light Value | Dark Value | Usage |
|----------|------------|-----------|-------|
| `brand/color/primary` | `#2563EB` | `#60A5FA` | Primary actions, links, focus |
| `brand/color/primary-light` | `#3B82F6` | `#93C5FD` | Hover states, secondary emphasis |
| `brand/color/primary-dark` | `#1D4ED8` | `#3B82F6` | Active/pressed states |
| `brand/color/primary-subtle` | `#EFF6FF` | `#1E3A5F` | Backgrounds, subtle emphasis |

---

# 4. Variable Collection: Semantic Colour

**Collection name:** `semantic`
**Modes:** `Light`, `Dark`

## Success

| Variable | Light Value | Dark Value | Usage |
|----------|------------|-----------|-------|
| `semantic/color/success` | `#16A34A` | `#4ADE80` | Positive outcomes, confirmations |
| `semantic/color/success-light` | `#22C55E` | `#86EFAC` | Hover states |
| `semantic/color/success-subtle` | `#F0FDF4` | `#14532D` | Backgrounds |

## Warning

| Variable | Light Value | Dark Value | Usage |
|----------|------------|-----------|-------|
| `semantic/color/warning` | `#D97706` | `#FBBF24` | Caution, attention needed |
| `semantic/color/warning-light` | `#F59E0B` | `#FCD34D` | Hover states |
| `semantic/color/warning-subtle` | `#FFFBEB` | `#78350F` | Backgrounds |

## Error

| Variable | Light Value | Dark Value | Usage |
|----------|------------|-----------|-------|
| `semantic/color/error` | `#DC2626` | `#F87171` | Errors, destructive actions |
| `semantic/color/error-light` | `#EF4444` | `#FCA5A5` | Hover states |
| `semantic/color/error-subtle` | `#FEF2F2` | `#7F1D1D` | Backgrounds |

## Information

| Variable | Light Value | Dark Value | Usage |
|----------|------------|-----------|-------|
| `semantic/color/info` | `#2563EB` | `#60A5FA` | Information, neutral notices |
| `semantic/color/info-light` | `#3B82F6` | `#93C5FD` | Hover states |
| `semantic/color/info-subtle` | `#EFF6FF` | `#1E3A5F` | Backgrounds |

---

# 5. Variable Collection: Neutral Colour

**Collection name:** `neutral`
**Modes:** `Light`, `Dark`

| Variable | Light Value | Dark Value | Usage |
|----------|------------|-----------|-------|
| `neutral/color/white` | `#FFFFFF` | `#111827` | Backgrounds, cards |
| `neutral/color/gray-50` | `#F9FAFB` | `#1F2937` | Subtle backgrounds |
| `neutral/color/gray-100` | `#F3F4F6` | `#374151` | Hover backgrounds |
| `neutral/color/gray-200` | `#E5E7EB` | `#4B5563` | Borders, dividers |
| `neutral/color/gray-300` | `#D1D5DB` | `#6B7280` | Disabled borders |
| `neutral/color/gray-400` | `#9CA3AF` | `#9CA3AF` | Placeholder text |
| `neutral/color/gray-500` | `#6B7280` | `#D1D5DB` | Secondary text |
| `neutral/color/gray-600` | `#4B5563` | `#E5E7EB` | Body text |
| `neutral/color/gray-700` | `#374151` | `#F3F4F6` | Headings |
| `neutral/color/gray-800` | `#1F2937` | `#F9FAFB` | Primary text |
| `neutral/color/gray-900` | `#111827` | `#FFFFFF` | Strongest text |

---

# 6. Variable Collection: Glass Colour

**Collection name:** `glass`
**Modes:** `Light`, `Dark`

## Glass Fill

| Variable | Light Value | Dark Value | Usage |
|----------|------------|-----------|-------|
| `glass/fill/subtle` | `rgba(255,255,255,0.60)` | `rgba(31,41,55,0.60)` | Tier 1 fill |
| `glass/fill/default` | `rgba(255,255,255,0.72)` | `rgba(31,41,55,0.72)` | Tier 2 fill |
| `glass/fill/strong` | `rgba(255,255,255,0.80)` | `rgba(31,41,55,0.80)` | Tier 3 fill |

## Glass Border

| Variable | Light Value | Dark Value | Usage |
|----------|------------|-----------|-------|
| `glass/border/subtle` | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.06)` | Tier 1 border |
| `glass/border/default` | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.10)` | Tier 2 border |
| `glass/border/strong` | `rgba(255,255,255,0.10)` | `rgba(255,255,255,0.14)` | Tier 3 border |

## Glass Highlight

| Variable | Light Value | Dark Value | Usage |
|----------|------------|-----------|-------|
| `glass/highlight/subtle` | `rgba(255,255,255,0.03)` | `rgba(255,255,255,0.03)` | Tier 1 top highlight |
| `glass/highlight/default` | `rgba(255,255,255,0.05)` | `rgba(255,255,255,0.05)` | Tier 2 top highlight |
| `glass/highlight/strong` | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.06)` | Tier 3 top highlight |

---

# 7. Variable Collection: Module Accent

**Collection name:** `module`
**Modes:** `Light`, `Dark`
**Status:** Placeholder values — to be assigned during Phase 5 (Module Screen Design)

| Variable | Light Placeholder | Dark Placeholder | Module |
|----------|------------------|-----------------|--------|
| `module/accent/iam` | `#8B5CF6` | `#A78BFA` | Identity & Access Management |
| `module/accent/institution` | `#06B6D4` | `#22D3EE` | Institution Management |
| `module/accent/people` | `#8B5CF6` | `#C084FC` | People Management |
| `module/accent/academic` | `#3B82F6` | `#60A5FA` | Academic Management |
| `module/accent/finance` | `#10B981` | `#34D399` | Finance & Accounting |
| `module/accent/communication` | `#F59E0B` | `#FBBF24` | Communication & Messaging |
| `module/accent/operations` | `#EF4444` | `#F87171` | Operations Management |
| `module/accent/documents` | `#6366F1` | `#818CF8` | Documents & Learning |
| `module/accent/reporting` | `#EC4899` | `#F472B6` | Reporting & Analytics |
| `module/accent/platform` | `#14B8A6` | `#2DD4BF` | Platform Administration |

---

# 8. Variable Collection: Chart Colour

**Collection name:** `chart`
**Modes:** `Light`, `Dark`
**Derived from:** Semantic and neutral palettes per UI Rendering Spec §9.2

| Variable | Light Value | Dark Value | Usage |
|----------|------------|-----------|-------|
| `chart/series/1` | `#2563EB` | `#60A5FA` | Primary data series (info) |
| `chart/series/2` | `#16A34A` | `#4ADE80` | Positive data series (success) |
| `chart/series/3` | `#D97706` | `#FBBF24` | Caution data series (warning) |
| `chart/series/4` | `#DC2626` | `#F87171` | Negative data series (error) |
| `chart/series/5` | `#6B7280` | `#D1D5DB` | Neutral data series |
| `chart/series/6` | `#D1D5DB` | `#6B7280` | Muted data series |

---

# 9. Variable Collection: Font Family

**Collection name:** `typography/font`
**Modes:** None (single mode)

| Variable | Value | Usage |
|----------|-------|-------|
| `typography/font/heading` | `Inter` | All headings and display text |
| `typography/font/body` | `Inter` | All body text, labels, UI |
| `typography/font/mono` | `JetBrains Mono` | Code blocks, numeric data |

**Fallback stack (all):** `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

---

# 10. Variable Collection: Font Size

**Collection name:** `typography/size`
**Modes:** None

| Variable | Value | Usage |
|----------|-------|-------|
| `typography/size/display-lg` | `36px` | Hero headings |
| `typography/size/display-md` | `30px` | Section headings |
| `typography/size/display-sm` | `24px` | Card headings |
| `typography/size/heading-lg` | `20px` | Page titles |
| `typography/size/heading-md` | `16px` | Subsection headings |
| `typography/size/heading-sm` | `14px` | Card titles |
| `typography/size/body-lg` | `16px` | Body text (large) |
| `typography/size/body-md` | `14px` | Body text (standard) |
| `typography/size/body-sm` | `12px` | Helper text, labels |
| `typography/size/caption` | `12px` | Captions, metadata |
| `typography/size/overline` | `12px` | Overlines, labels |
| `typography/size/button-lg` | `14px` | Large buttons |
| `typography/size/button-md` | `14px` | Standard buttons |
| `typography/size/button-sm` | `12px` | Small buttons |

---

# 11. Variable Collection: Font Weight

**Collection name:** `typography/weight`
**Modes:** None

| Variable | Value | Usage |
|----------|-------|-------|
| `typography/weight/regular` | `400` | Body text, descriptions |
| `typography/weight/medium` | `500` | Labels, buttons, emphasis |
| `typography/weight/semibold` | `600` | Headings, strong emphasis |
| `typography/weight/bold` | `700` | Display headings |

---

# 12. Variable Collection: Line Height

**Collection name:** `typography/line-height`
**Modes:** None

| Variable | Value | Usage |
|----------|-------|-------|
| `typography/line-height/display-lg` | `44px` | Line height for display-lg |
| `typography/line-height/display-md` | `36px` | Line height for display-md |
| `typography/line-height/display-sm` | `32px` | Line height for display-sm |
| `typography/line-height/heading-lg` | `28px` | Line height for heading-lg |
| `typography/line-height/heading-md` | `24px` | Line height for heading-md |
| `typography/line-height/heading-sm` | `20px` | Line height for heading-sm |
| `typography/line-height/body-lg` | `24px` | Line height for body-lg |
| `typography/line-height/body-md` | `20px` | Line height for body-md |
| `typography/line-height/body-sm` | `16px` | Line height for body-sm |
| `typography/line-height/caption` | `16px` | Line height for caption |
| `typography/line-height/overline` | `16px` | Line height for overline |
| `typography/line-height/button-lg` | `20px` | Line height for button-lg |
| `typography/line-height/button-md` | `20px` | Line height for button-md |
| `typography/line-height/button-sm` | `16px` | Line height for button-sm |

---

# 13. Variable Collection: Spacing

**Collection name:** `spacing`
**Modes:** `Comfortable`, `Compact`, `Dense`

| Variable | Comfortable | Compact | Dense | Usage |
|----------|------------|---------|-------|-------|
| `spacing/xs` | `4px` | `4px` | `4px` | Tight spacing, inline elements |
| `spacing/sm` | `8px` | `8px` | `8px` | Small gaps, compact layouts |
| `spacing/md` | `16px` | `12px` | `8px` | Standard spacing, component padding |
| `spacing/lg` | `24px` | `16px` | `12px` | Section spacing, card padding |
| `spacing/xl` | `32px` | `24px` | `16px` | Large section spacing |
| `spacing/2xl` | `48px` | `32px` | `24px` | Page section spacing |
| `spacing/3xl` | `64px` | `48px` | `32px` | Major section spacing |

---

# 14. Variable Collection: Radius

**Collection name:** `radius`
**Modes:** None

| Variable | Value | Usage |
|----------|-------|-------|
| `radius/none` | `0px` | No radius |
| `radius/sm` | `4px` | Small elements, tags |
| `radius/md` | `8px` | Buttons, inputs, cards |
| `radius/lg` | `12px` | Modals, drawers |
| `radius/xl` | `16px` | Large cards, panels |
| `radius/full` | `9999px` | Pills, avatars |

---

# 15. Variable Collection: Border Width

**Collection name:** `border/width`
**Modes:** None

| Variable | Value | Usage |
|----------|-------|-------|
| `border/width/sm` | `1px` | Default borders, hairlines |
| `border/width/md` | `2px` | Focus rings, emphasised borders |

---

# 16. Variable Collection: Border Colour

**Collection name:** `border/color`
**Modes:** `Light`, `Dark`

| Variable | Light Value | Dark Value | Usage |
|----------|------------|-----------|-------|
| `border/color/default` | `#E5E7EB` | `#4B5563` | Default borders |
| `border/color/strong` | `#D1D5DB` | `#6B7280` | Emphasised borders |
| `border/color/focus` | `#2563EB` | `#60A5FA` | Focus states |
| `border/color/error` | `#DC2626` | `#F87171` | Error states |

---

# 17. Variable Collection: Elevation (Shadow)

**Collection name:** `shadow`
**Modes:** `Light`, `Dark`

| Variable | Light Value | Dark Value | Usage |
|----------|------------|-----------|-------|
| `shadow/sm` | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.20)` | Subtle elevation (Level 1) |
| `shadow/md` | `0 4px 6px rgba(0,0,0,0.07)` | `0 4px 6px rgba(0,0,0,0.24)` | Standard elevation (Level 2) |
| `shadow/lg` | `0 10px 15px rgba(0,0,0,0.10)` | `0 10px 15px rgba(0,0,0,0.28)` | Elevated elements (Level 3) |
| `shadow/xl` | `0 20px 25px rgba(0,0,0,0.10)` | `0 20px 25px rgba(0,0,0,0.32)` | High elevation (Level 4) |

---

# 18. Variable Collection: Z-Index

**Collection name:** `z-index`
**Modes:** None

| Variable | Value | Usage |
|----------|-------|-------|
| `z-index/base` | `0` | Base layer |
| `z-index/dropdown` | `100` | Dropdowns, popovers |
| `z-index/sticky` | `200` | Sticky elements |
| `z-index/overlay` | `300` | Modal backdrops |
| `z-index/modal` | `400` | Modals, dialogs |
| `z-index/toast` | `500` | Toasts, notifications |
| `z-index/tooltip` | `600` | Tooltips |

---

# 19. Variable Collection: Blur

**Collection name:** `blur`
**Modes:** None

| Variable | Value | Usage |
|----------|-------|-------|
| `blur/sm` | `4px` | Glass Subtle, subtle blur effects |
| `blur/md` | `8px` | Glass Default, modal backdrops |
| `blur/lg` | `16px` | Glass Strong |

---

# 20. Variable Collection: Opacity

**Collection name:** `opacity`
**Modes:** None

| Variable | Value | Usage |
|----------|-------|-------|
| `opacity/disabled` | `0.5` | Disabled elements |
| `opacity/hover` | `0.8` | Hover states (legacy — prefer elevation) |
| `opacity/overlay` | `0.5` | Modal backdrops (non-glass) |

---

# 21. Variable Collection: Motion Duration

**Collection name:** `motion/duration`
**Modes:** None

| Variable | Value | Usage |
|----------|-------|-------|
| `motion/duration/instant` | `0ms` | Immediate feedback |
| `motion/duration/fast` | `100ms` | Micro-interactions (button press, toggle) |
| `motion/duration/normal` | `200ms` | Standard transitions |
| `motion/duration/slow` | `300ms` | Complex transitions (max per UI Rendering §4.7.2.2) |

**Note:** `duration-slower` (500ms) has been dropped. Maximum duration is 300ms per UI Rendering Spec §4.7.2.2 macro-interaction cap of 400ms.

---

# 22. Variable Collection: Motion Easing

**Collection name:** `motion/easing`
**Modes:** None

| Variable | Value | Usage |
|----------|-------|-------|
| `motion/easing/default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General purpose |
| `motion/easing/in` | `cubic-bezier(0.4, 0, 1, 1)` | Exiting elements (accelerating) |
| `motion/easing/out` | `cubic-bezier(0, 0, 0.2, 1)` | Entering elements (decelerating) |

---

# 23. Variable Collection: Breakpoint

**Collection name:** `breakpoint`
**Modes:** None

| Variable | Value | Usage |
|----------|-------|-------|
| `breakpoint/mobile` | `0px` | Mobile phones (< 640px) |
| `breakpoint/tablet` | `640px` | Tablets (640–1023px) |
| `breakpoint/desktop` | `1024px` | Desktops (1024–1439px) |
| `breakpoint/wide` | `1440px` | Wide screens (≥ 1440px) |

---

# 24. Text Styles

All text styles reference variable collections. No hard-coded values.

| Style Name | Font Family | Font Size | Font Weight | Line Height |
|-----------|------------|-----------|-------------|-------------|
| `Display/Large` | `typography/font/heading` | `typography/size/display-lg` | `typography/weight/bold` | `typography/line-height/display-lg` |
| `Display/Medium` | `typography/font/heading` | `typography/size/display-md` | `typography/weight/bold` | `typography/line-height/display-md` |
| `Display/Small` | `typography/font/heading` | `typography/size/display-sm` | `typography/weight/semibold` | `typography/line-height/display-sm` |
| `Heading/Large` | `typography/font/heading` | `typography/size/heading-lg` | `typography/weight/semibold` | `typography/line-height/heading-lg` |
| `Heading/Medium` | `typography/font/heading` | `typography/size/heading-md` | `typography/weight/semibold` | `typography/line-height/heading-md` |
| `Heading/Small` | `typography/font/heading` | `typography/size/heading-sm` | `typography/weight/semibold` | `typography/line-height/heading-sm` |
| `Body/Large` | `typography/font/body` | `typography/size/body-lg` | `typography/weight/regular` | `typography/line-height/body-lg` |
| `Body/Medium` | `typography/font/body` | `typography/size/body-md` | `typography/weight/regular` | `typography/line-height/body-md` |
| `Body/Small` | `typography/font/body` | `typography/size/body-sm` | `typography/weight/regular` | `typography/line-height/body-sm` |
| `Caption` | `typography/font/body` | `typography/size/caption` | `typography/weight/regular` | `typography/line-height/caption` |
| `Overline` | `typography/font/body` | `typography/size/overline` | `typography/weight/medium` | `typography/line-height/overline` |
| `Button/Large` | `typography/font/body` | `typography/size/button-lg` | `typography/weight/medium` | `typography/line-height/button-lg` |
| `Button/Medium` | `typography/font/body` | `typography/size/button-md` | `typography/weight/medium` | `typography/line-height/button-md` |
| `Button/Small` | `typography/font/body` | `typography/size/button-sm` | `typography/weight/medium` | `typography/line-height/button-sm` |
| `Code` | `typography/font/mono` | `typography/size/body-md` | `typography/weight/regular` | `typography/line-height/body-md` |

---

# 25. Effect Styles

## Shadow Effects

| Effect Name | Type | Values | Reference |
|-------------|------|--------|-----------|
| `Shadow/Small` | Drop shadow | `shadow/sm` | Elevation Level 1 |
| `Shadow/Medium` | Drop shadow | `shadow/md` | Elevation Level 2 |
| `Shadow/Large` | Drop shadow | `shadow/lg` | Elevation Level 3 |
| `Shadow/XLarge` | Drop shadow | `shadow/xl` | Elevation Level 4 |

## Glass Effects

| Effect Name | Composition | Reference |
|-------------|-------------|-----------|
| `Glass/Subtle` | Backdrop blur 4px + fill `glass/fill/subtle` | Tier 1 |
| `Glass/Default` | Backdrop blur 8px + fill `glass/fill/default` + shadow-sm | Tier 2 |
| `Glass/Strong` | Backdrop blur 16px + fill `glass/fill/strong` + shadow-md | Tier 3 |

---

# 26. Grid Styles

| Grid Name | Columns | Gutter | Margin | Breakpoint |
|-----------|---------|--------|--------|-----------|
| `Grid/Desktop` | 12 | 24px | 32px | ≥ 1024px |
| `Grid/Tablet` | 8 | 16px | 16px | 640–1023px |
| `Grid/Mobile` | 4 | 16px | 16px | < 640px |

---

# 27. Validation Checklist

## Variable Completeness

- [ ] 18 variable collections created
- [ ] Brand colour: 4 variables × 2 modes = 8 values
- [ ] Semantic colour: 12 variables × 2 modes = 24 values
- [ ] Neutral colour: 11 variables × 2 modes = 22 values
- [ ] Glass colour: 9 variables × 2 modes = 18 values
- [ ] Module accent: 10 variables × 2 modes = 20 values (placeholders)
- [ ] Chart colour: 6 variables × 2 modes = 12 values
- [ ] Font family: 3 variables (no modes)
- [ ] Font size: 14 variables (no modes)
- [ ] Font weight: 4 variables (no modes)
- [ ] Line height: 14 variables (no modes)
- [ ] Spacing: 7 variables × 3 modes = 21 values
- [ ] Radius: 6 variables (no modes)
- [ ] Border width: 2 variables (no modes)
- [ ] Border colour: 4 variables × 2 modes = 8 values
- [ ] Shadow/elevation: 4 variables × 2 modes = 8 values
- [ ] Z-index: 7 variables (no modes)
- [ ] Blur: 3 variables (no modes)
- [ ] Opacity: 3 variables (no modes)
- [ ] Motion duration: 4 variables (no modes)
- [ ] Motion easing: 3 variables (no modes)
- [ ] Breakpoint: 4 variables (no modes)

**Total: 130 unique variables, 186 total values (including modes)**

## Quality Checks

- [ ] All colour values satisfy WCAG 2.1 AA contrast (4.5:1 for text, 3:1 for UI)
- [ ] All variables use semantic naming, not hard-coded values
- [ ] No duplicated variable values across different names
- [ ] Light and Dark modes are both populated for all colour variables
- [ ] Spacing modes (Comfortable/Compact/Dense) are correctly differentiated
- [ ] Typography hierarchy is consistent (display > heading > body > caption)
- [ ] Glass values match the Glass Material System specification
- [ ] Shadow values increase monotonically with elevation level
- [ ] All text styles reference variable collections
- [ ] All effect styles reference variable collections
- [ ] Naming conventions follow `{category}/{property}/{variant}` pattern
- [ ] The foundation supports ~750 screens without modification

## Style Completeness

- [ ] 15 text styles created
- [ ] 4 shadow effect styles created
- [ ] 3 glass effect styles created
- [ ] 3 grid styles created

---

*Document Version: 1.0*
*Total Variable Collections: 18*
*Total Unique Variables: 130*
*Total Values (with modes): 186*
*Total Text Styles: 15*
*Total Effect Styles: 7*
*Total Grid Styles: 3*
*Last Updated: 2026-07-24*
*Status: Complete*
