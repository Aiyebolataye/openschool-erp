# School ERP UI Rendering Specification

**Document Class:** Deterministic Rendering Standard
**Status:** Living Document — Part 1 of N
**Audience:** Automated rendering agents (e.g., Opencode via Figma MCP) with no inherent design judgment
**Conformance Model:** RFC 2119 keyword semantics (MUST, MUST NOT, SHALL, SHALL NOT, SHOULD, SHOULD NOT, MAY)

---

## 0. How to Read This Document

0.1 This document is not a source of inspiration. It is a source of instruction.

0.2 Every rule in this document is normative unless explicitly marked as non-normative (informative).

0.3 Where a rule references a proportion, ratio, or relative relationship, that relationship MUST be computed against the stated reference frame (e.g., "workspace width," "container height," "type scale step") rather than any fixed pixel value, unless a fixed value is explicitly and unavoidably required (e.g., minimum touch target size, minimum contrast ratio).

0.4 Where this document is silent on a topic, the rendering agent MUST NOT improvise. The rendering agent SHALL treat silence as an incomplete specification and SHALL flag the gap rather than infer intent. Subsequent parts of this document will progressively eliminate such gaps.

0.5 This document supersedes any default behavior, template, or stylistic convention native to the rendering agent's underlying design tool. Native defaults (default shadows, default corner radii, default color palettes, default spacing scales) MUST NOT be used unless they are explicitly declared compliant by this specification.

0.6 Numbering in this document is stable. New content SHALL be appended as new top-level chapters or new subsections with extended numbers (e.g., 4.7.1) rather than renumbering existing rules, so that future parts of this document can be safely cross-referenced.

---

## 1. Purpose

1.1 The purpose of this specification is to remove all subjective visual decision-making from the process of generating user interface screens for a School ERP SaaS platform.

1.2 This specification exists because the rendering agent consuming it has no design intuition, no aesthetic judgment, and no capacity to infer unstated intent. Every visual outcome the platform requires MUST therefore be expressed as an explicit, checkable rule.

1.3 This specification is not a design system in the conventional sense (i.e., a component library with reusable tokens intended for human designers to apply with judgment). It is a rendering contract: a document that, if followed literally and without interpretation, produces a consistent, professional, enterprise-grade interface across every module of the platform.

1.4 This specification's success criterion is determinism, not inspiration. A successful specification is one where two independent executions of the same instruction, by two different non-creative agents, produce visually indistinguishable results within defined tolerances.

1.5 This specification's secondary success criterion is perceived quality. Determinism alone is insufficient if the deterministic output is visually poor. Therefore every rule in this document encodes a design decision that has already been made on the rendering agent's behalf, so that "following the rule" and "producing a high-quality result" are the same act.

---

## 2. Scope

2.1 This specification covers the School ERP SaaS platform's entire user-facing web application, including but not limited to:

2.1.1 Authentication and onboarding surfaces (login, password reset, first-run setup).

2.1.2 Role-based dashboards (Administrator, Principal, Teacher, Student, Parent, Accountant, Librarian, Transport Coordinator, HR Staff).

2.1.3 Data entry and management modules (Admissions, Attendance, Gradebook, Timetable, Fee Management, Payroll, Inventory, Library, Transport, Hostel, Examinations, Communication/Messaging).

2.1.4 Reporting and analytics surfaces (charts, tabular reports, exportable documents).

2.1.5 Administrative configuration surfaces (roles and permissions, academic year setup, institution settings).

2.1.6 Shared chrome (global navigation, notifications, search, user account controls).

2.2 This specification covers desktop viewports as the primary target and tablet viewports as a secondary target. Mobile phone viewports are explicitly out of scope for this part of the document and will be addressed in a dedicated chapter in a future part.

2.3 This specification does not cover backend data models, API contracts, business logic, or permission logic, except where such logic has direct and unavoidable visual consequences (e.g., a disabled state resulting from a permission check).

2.4 This specification does not cover marketing pages, public-facing websites, or email templates. Those surfaces may reference this document's typography and color chapters but are governed by a separate specification.

2.5 This specification does not cover native mobile applications (iOS/Android). A future, separate specification will govern those platforms.

---

## 3. Definitions

For the purposes of this specification, the following terms apply. Where a term is not defined here, the rendering agent MUST NOT assume a definition and MUST treat the term as undefined until a definition is added.

3.1 **Workspace** — The full viewport area available for application rendering, excluding operating-system or browser chrome.

3.2 **Canvas** — The primary content region of a screen, excluding persistent navigation chrome (sidebar, top bar).

3.3 **Surface** — Any discrete rectangular (or rounded-rectangular) visual container that groups content, including but not limited to cards, panels, modals, and table containers.

3.4 **Material** — The visual treatment applied to a Surface's background and border, categorized in this specification as either Glass or Solid (see Chapter 8).

3.5 **Visual Weight** — The relative degree to which an element attracts and holds visual attention, determined by a combination of size, contrast, color saturation, elevation, and isolation (whitespace surrounding the element).

3.6 **Hierarchy** — The intentional, ranked ordering of visual weight across elements on a screen such that the ranked order matches the ranked order of information importance.

3.7 **Density** — The ratio of content (text, controls, data points) to available space within a given Surface or Canvas region.

3.8 **Primary Action** — The single control on a given screen or Surface that represents the most likely or most important next action a user should take.

3.9 **Secondary Action** — Any action-triggering control that is not the Primary Action.

3.10 **Destructive Action** — Any action that results in data loss, irreversible state change, or removal of an entity (e.g., delete, deactivate, discard).

3.11 **Module** — A top-level functional area of the ERP (e.g., "Fee Management," "Gradebook") that owns its own navigation subtree and primary dashboard.

3.12 **Module Personality** — The permitted narrow variation in tone, accent color, and iconography assigned to a Module, as constrained by Chapter 20 (Module Personalities), which MUST NOT override the base rendering rules defined elsewhere in this document.

3.13 **Reference Frame** — The container against which a proportional or relative rule is computed (e.g., "the Canvas," "the parent Surface," "the current type scale step").

3.14 **Elevation** — The perceived stacking order of a Surface along the z-axis, communicated visually through shadow depth, blur radius, and (where applicable) subtle scale or brightness shifts, and corresponding to a discrete Elevation Level defined in Chapter 11.

3.15 **Focal Point** — Any single element on a screen designed to be the first element the user's attention lands on.

3.16 **Idle State / Hover State / Active State / Disabled State / Focus State** — The five mandatory interaction states every interactive component MUST define, as governed in Chapter 19.

3.17 **Type Scale Step** — A discrete rung on the typographic scale defined in Chapter 12, referenced by name (e.g., "Display," "Heading 1," "Body," "Caption") rather than by pixel size.

3.18 **Data-Dense Surface** — Any Surface whose primary purpose is to present tabular, numeric, or list-based information in volume (e.g., tables, ledgers, timetables, attendance grids).

3.19 **Decorative Element** — Any visual element whose removal would not reduce the user's ability to understand or act on the content (e.g., background gradients, illustrative icons, ambient shapes). Decorative Elements are governed strictly under Chapter 21 (Anti-Patterns).

---

## 4. Rendering Philosophy

4.1 The rendering agent SHALL treat every screen as an instrument, not an artwork. The measure of a correct screen is whether a user under time pressure can locate, understand, and act on the information it presents — not whether the screen is visually impressive in isolation.

4.2 The rendering agent SHALL prioritize legibility and hierarchy over decoration in all cases of conflict.

4.3 The rendering agent SHALL treat whitespace as a first-class layout material with the same intentionality as color or typography, not as leftover space.

4.4 The rendering agent SHALL NOT introduce any visual element whose function cannot be stated in one sentence. If a rendering agent cannot answer "what does this element communicate to the user," the element MUST be removed.

4.5 The rendering agent SHALL treat consistency across screens as equal in priority to quality within a single screen. A screen that is individually beautiful but structurally inconsistent with its siblings is non-compliant.

4.6 The rendering agent SHALL resolve any apparent conflict between two rules in this document by preferring the rule that increases determinism and reduces ambiguity, and SHALL flag the conflict for specification maintainers rather than silently picking one interpretation.

### 4.7 Design Values Translated Into Rendering Behavior

The following subsections translate each required design value (see Project Brief, "Design Philosophy") into deterministic, checkable rendering rules. These translations are normative; the adjectives themselves (premium, calm, fast, spacious, intelligent, professional, trustworthy, modern, effortless, elegant) MUST NOT appear as justification for any design decision elsewhere in this document or in any generated interface. Only the rules below may be cited.

#### 4.7.1 "Calm" → Information Density and Competition Limits

4.7.1.1 A given Canvas view MUST NOT present more than one Focal Point at initial glance (see 15.3 for Focal Point determination rules).

4.7.1.2 No screen SHALL contain more than two colors at full saturation simultaneously, excluding semantic status colors (error, warning, success — see Chapter 9) which are permitted in addition when functionally required.

4.7.1.3 A Data-Dense Surface MUST NOT be layered on or adjacent to a Glass Material surface displaying independent motion (see Chapter 8, Chapter 18).

4.7.1.4 Every Canvas MUST reserve a minimum outer margin (see Chapter 13) before any content begins; content MUST NOT touch the Canvas edge.

4.7.1.5 Animations on a screen containing a Data-Dense Surface MUST be limited to state-transition feedback (see Chapter 18) and MUST NOT include ambient, looping, or decorative motion.

#### 4.7.2 "Fast" (Perceived Speed) → Feedback and Motion Timing Rules

4.7.2.1 Every user-initiated action MUST produce a visible state change within 100ms, even if the underlying operation (e.g., network request) takes longer. This visible change MAY be a pressed/active state, a loading indicator, or a skeleton state, as defined per-component in later chapters.

4.7.2.2 No transition or animation duration governed by this specification SHALL exceed 320ms for micro-interactions (button press, toggle, checkbox) or 400ms for macro-interactions (modal open/close, panel expand/collapse), except where explicitly stated otherwise.

4.7.2.3 Loading states MUST use skeleton placeholders that match the approximate shape and layout of the content they precede, rather than generic spinners, for any Data-Dense Surface. Spinners MAY be used only for single, atomic actions (e.g., form submission) as defined in Chapter 19.

#### 4.7.3 "Spacious" → Whitespace and Proportional Sizing Rules

4.7.3.1 Outer spacing (the margin between a Surface and its container) MUST always be greater than or equal to inner spacing (the padding within that Surface). See Chapter 13 for the full spacing scale and its proportional relationships.

4.7.3.2 Internal spacing within a Surface MUST scale proportionally with the Surface's size tier (Compact, Standard, Comfortable — see 13.6), not remain fixed regardless of container size.

4.7.3.3 A Canvas MUST NOT exceed the maximum content density thresholds defined per-component in Chapters 15–17 (e.g., maximum cards per row, maximum table columns before horizontal scroll is mandated).

#### 4.7.4 "Intelligent" → Adaptive Hierarchy and Contextual Prioritization

4.7.4.1 Every dashboard-class screen MUST visually prioritize time-sensitive or action-required content (e.g., "3 fee payments overdue") above passive, informational content (e.g., "Total students enrolled: 1,204"), regardless of a Module's default layout order, as governed in Chapter 15.

4.7.4.2 Empty states (see Chapter 17.9) MUST communicate the specific reason content is absent (no data yet, filtered out, error) and MUST NOT use a single generic empty-state treatment for all three cases.

4.7.4.3 Notification and alert surfaces MUST visually rank by severity (see Chapter 9.6, semantic color usage) rather than by recency alone.

#### 4.7.5 "Professional / Trustworthy" → Restraint and Precision Rules

4.7.5.1 Corner radii, shadow depth, and color saturation MUST be drawn only from the scales defined in Chapters 8–11. Ad hoc values (e.g., an arbitrary radius not present in the defined scale) are prohibited.

4.7.5.2 Typographic weight MUST be used to establish hierarchy before color is used to establish hierarchy (see Chapter 12.8). Color-only hierarchy is prohibited (see also 21.4).

4.7.5.3 Numeric data (currency, grades, dates, counts) MUST use tabular (fixed-width) figure rendering wherever the typeface supports it, so that columns of numbers align vertically. This is mandatory for all Fee Management, Payroll, and Gradebook surfaces.

#### 4.7.6 "Modern / Elegant / Effortless" → Restrained Ornamentation Rules

4.7.6.1 Gradients MUST be limited to the specific permitted use cases enumerated in Chapter 10 (Gradients) and MUST NOT be applied to Data-Dense Surfaces.

4.7.6.2 Iconography MUST be drawn from a single, consistent icon set (line-weight and corner-radius consistent) across the entire application. Mixing icon sets or icon styles within a single screen is prohibited.

4.7.6.3 Shadows MUST be soft (large blur radius, low opacity — see Chapter 11) rather than hard-edged, and MUST correspond to one of the defined Elevation Levels.

---

## 5. Design Constitution (Non-Negotiable Rules)

The following rules are constitutional: they apply globally, across every chapter, every Module, and every component, and MAY NOT be overridden by any Module Personality, theme variant, or future addendum without an explicit amendment to this chapter.

5.1 **Single Source of Hierarchy.** Every screen MUST have exactly one element serving as the primary Focal Point at any given viewport state. Where a screen appears to require two, the rendering agent MUST restructure the screen (e.g., via sequencing, tabs, or progressive disclosure) rather than present two simultaneous Focal Points.

5.2 **Material Consistency.** A given Surface type (e.g., "stat card," "data table container," "modal") MUST use the same Material treatment across every Module unless Chapter 20 (Module Personality) explicitly permits a narrow, documented variation.

5.3 **Proportional Integrity.** All spacing, sizing, and layout proportions MUST derive from the scales defined in this document (Chapters 12–14). Arbitrary, one-off values are prohibited everywhere in the application.

5.4 **Accessibility Is Not Optional.** Every rule in this specification that could compromise WCAG 2.1 AA compliance is automatically void; the accessibility requirement in Chapter 22 takes precedence over any conflicting aesthetic rule.

5.5 **No Silent Improvisation.** Where the rendering agent encounters a case this document does not address, it MUST NOT invent a treatment. It MUST apply the nearest documented analogous rule and flag the gap.

5.6 **Consistency Over Novelty.** No screen may introduce a new visual pattern (new Material, new corner radius, new shadow depth, new motion curve) solely for that screen. All patterns MUST be drawn from the shared system defined in this document.

5.7 **Data Integrity of Presentation.** No visual treatment may obscure, truncate, or misrepresent underlying data (e.g., truncating a number without indicating truncation, or rounding a grade without labeling it as rounded).

---

## 6. Visual Hierarchy

6.1 Visual Hierarchy is established through a defined, ordered combination of factors, applied in the following priority order. Where two elements conflict, the higher-priority factor governs:

6.1.1 **Position** — Elements positioned higher and/or left (in left-to-right reading contexts) within a Reference Frame are perceived as higher priority than elements positioned lower and/or right, all else being equal.

6.1.2 **Size** — Larger elements carry more Visual Weight than smaller elements of the same type.

6.1.3 **Typographic Weight** — Bolder or heavier type carries more Visual Weight than lighter type at the same size.

6.1.4 **Contrast** — Elements with higher contrast against their immediate background carry more Visual Weight than lower-contrast elements.

6.1.5 **Isolation** — An element surrounded by more whitespace relative to its neighbors carries more Visual Weight than a tightly packed element, even at equal size.

6.1.6 **Color Saturation** — Used only as a final, minor differentiator, never as the primary means of establishing hierarchy (see 5.4, 21.4).

6.2 A screen's hierarchy MUST be legible with color removed (i.e., in grayscale). This is a mandatory, testable compliance check (see Chapter 23).

6.3 The rendering agent MUST establish no more than four distinct hierarchy tiers on any single screen: Primary, Secondary, Tertiary, and Quiet (e.g., disabled, metadata, timestamps). A fifth tier MUST NOT be introduced; if additional differentiation seems necessary, the rendering agent MUST restructure the content grouping instead (see Chapter 7).

6.4 Every interactive control MUST be visually distinguishable from static/display-only content at the same hierarchy tier, through at minimum one of: border, background fill, or icon affordance (see Chapter 19).

---

## 7. Composition and Layout Grid

7.1 **Base Grid.** All Canvas layouts MUST be built on a 12-column responsive grid. Column count MAY reduce at defined breakpoints (see 7.6) but MUST NOT be abandoned in favor of freeform positioning.

7.2 **Gutters.** Gutter width between grid columns MUST be a single consistent value per breakpoint, drawn from the spacing scale in Chapter 13, and MUST NOT vary between Modules.

7.3 **Sidebar Proportion.** The primary navigation sidebar SHALL occupy approximately one-fifth (1/5) of the Workspace width at desktop breakpoints, and MUST NOT exceed one-quarter (1/4) or fall below one-eighth (1/8) of Workspace width, preserving Canvas/content dominance at all times (see 5.1, "Single Source of Hierarchy" — the sidebar MUST NOT compete with Canvas content for primary Visual Weight).

7.4 **Top Bar Proportion.** The global top bar SHALL occupy a height proportional to one type-scale "Heading" step plus its own vertical padding (see Chapter 13), remaining visually subordinate to the Canvas at all times, and MUST remain fixed/sticky during Canvas scroll.

7.5 **Canvas Dominance.** The Canvas region MUST always represent the majority of Workspace area (never less than three-fifths of total Workspace width at desktop breakpoints once sidebar and, where present, secondary panels are accounted for).

7.6 **Breakpoint Behavior.**

7.6.1 **Desktop (primary target):** Full 12-column grid; sidebar expanded and persistent.

7.6.2 **Tablet (secondary target):** Grid MAY collapse to 8 columns; sidebar SHALL collapse to an icon-only rail (approximately one-sixteenth to one-twelfth of Workspace width) or an overlay drawer, but MUST retain the same visual language (identical Material, corner radius, and iconography) as the expanded desktop sidebar — see 5.6.

7.6.3 Visual language (Material, color, typography, radii, shadow scale) MUST NOT change between breakpoints. Only layout density and grid column count MAY adapt.

7.7 **Composition Balance.** Within any Canvas region, the sum of Visual Weight on the left half and right half of the Reference Frame SHOULD NOT differ by more than one hierarchy tier's worth of weight (see Chapter 6.3), to avoid an unbalanced, lopsided screen.

7.8 **Section Transitions.** Distinct content sections within a single Canvas (e.g., "Overview" then "Recent Activity") MUST be separated by a whitespace gap greater than the internal spacing used within either section, and MAY additionally use a hairline divider (see Chapter 10.6) where the sections belong to different semantic categories.

7.9 **Containment.** Related content MUST share a single Surface (card, panel) rather than be presented as loose, ungrouped elements floating on the Canvas background. Grouping communicates relationship; the absence of a shared Surface communicates the absence of relationship (see Gestalt proximity principle, applied deterministically).

7.10 **Reading Flow.** Content within a Surface MUST follow top-to-bottom, left-to-right reading order for all locales using left-to-right scripts. Title and primary label MUST occupy the top-left (or top-center only where explicitly defined, e.g., empty states — Chapter 17.9) position of a Surface. Metadata (timestamps, secondary labels) MUST be positioned either directly beneath the primary label or aligned to the top-right of the Surface, and this choice MUST be made consistently per component type, not varied screen to screen.

---

## 8. Materials: Glass and Solid Surfaces

This chapter defines the two permitted background/surface treatments. No third Material type may be introduced without an amendment to this chapter.

### 8.1 Definitions

8.1.1 **Glass Material** — A semi-transparent Surface treatment combining background blur, low-opacity fill, and a subtle light border, used to create a sense of layering above a background without fully obscuring it.

8.1.2 **Solid Material** — An opaque Surface treatment with a single flat (or near-flat, see 8.5) background fill and full obscuring of any content behind it.

### 8.2 When Glass MAY Be Used

8.2.1 Glass Material MAY be used for: the global top bar, floating action containers, onboarding/marketing-adjacent surfaces within the app (e.g., "What's New" panels), modal scrims (the backdrop behind a modal, not the modal itself), and hero/summary header bands atop a dashboard (above the data-dense content, never behind or beside it).

8.2.2 Glass Material MAY be used where its purpose is explicitly to communicate layering hierarchy — i.e., "this element floats above the rest of the interface" — and MUST NOT be used merely for decorative effect.

### 8.3 When Glass MUST NOT Be Used

8.3.1 Glass Material MUST NOT be used for: data tables, forms, input fields, gradebook grids, attendance grids, financial ledgers, report surfaces, or any Data-Dense Surface as defined in 3.18.

8.3.2 Glass Material MUST NOT be used as the background for body text exceeding two lines, as reduced contrast against a variable backdrop compromises legibility.

8.3.3 Glass Material MUST NOT be stacked more than one layer deep (i.e., a Glass Surface MUST NOT contain a nested child Glass Surface).

8.3.4 Glass Material MUST NOT be applied to any Surface containing a Primary Action button in a Destructive Action context (see 3.10); Destructive confirmation surfaces MUST use Solid Material to eliminate any ambiguity.

### 8.4 Glass Rendering Parameters

8.4.1 Background blur radius MUST fall within a range that keeps background shapes recognizable as blurred shapes but not sharp — informatively, this corresponds to a "frosted," not "misted," appearance. Blur MUST be strong enough that no background text is legible through the Glass Surface.

8.4.2 Fill opacity MUST be low enough that the underlying background's hue is perceptible, and high enough that foreground content maintains WCAG AA contrast (see Chapter 22) against the Glass fill at all times. Where these two constraints conflict, the contrast requirement governs (see 5.4).

8.4.3 Border: Glass Surfaces MUST have a single hairline border at low opacity, brighter (lighter) than the fill, to simulate a light-catching edge. This border MUST be present on all four sides at consistent width.

8.4.4 Reflections/highlights: A Glass Surface MAY include a single, subtle top-edge highlight (a lightening gradient limited to the top ~10% of the surface height) to reinforce the light-catching edge. Multiple highlights or highlights on more than one edge are prohibited as excessive ornamentation (see Chapter 21).

8.4.5 Layering: A Glass Surface's elevation (Chapter 11) MUST be equal to or higher than any Solid Surface immediately behind it in stacking order; Glass MUST NOT appear to sit beneath opaque content it is meant to float above.

### 8.5 Solid Rendering Parameters

8.5.1 Solid Surfaces MUST use a single flat fill color drawn from the neutral surface scale (Chapter 9.3), with no gradient, UNLESS the Surface is explicitly a permitted gradient use case per Chapter 10.

8.5.2 Solid Surfaces MAY use a hairline border at higher opacity than Glass borders, used to define edges cleanly against similarly colored backgrounds (e.g., a card at the same lightness as its Canvas background).

8.5.3 Solid Surfaces MUST be used for all Data-Dense Surfaces, all form containers, and all confirmation/destructive dialogs.

### 8.6 Interaction and State Behavior for Both Materials

8.6.1 **Hover:** A hoverable Glass or Solid Surface (i.e., one that is itself clickable, such as a card acting as a navigation trigger) MUST increase its Elevation by exactly one level (Chapter 11) and MAY increase fill opacity marginally (Solid) or border brightness marginally (Glass). Non-interactive Surfaces MUST NOT exhibit hover behavior.

8.6.2 **Disabled:** A disabled Surface (Solid or Glass) MUST reduce content opacity to the disabled-state value defined in Chapter 19.6 and MUST remove any hover/elevation behavior entirely.

8.6.3 **Dark Mode:** In dark mode, Glass Material's fill MUST lighten relative to the dark background (i.e., Glass always reads as "lighter than its surroundings," regardless of light/dark mode), and Solid Material's neutral scale MUST invert per Chapter 9.7 rather than simply reducing brightness uniformly.

8.6.4 **Light Mode:** In light mode, Glass Material's fill MUST remain lighter than or equal to its background in perceived lightness; Glass MUST NOT be used to create a darkening effect in light mode.

8.6.5 **Animation:** Any transition into or out of a Glass or Solid state (e.g., a modal's scrim fading in) MUST use the timing rules in Chapter 18 and MUST animate opacity and/or blur radius only — MUST NOT animate hue or introduce color shifts during the transition.

### 8.7 Anti-Patterns (Materials)

8.7.1 Never use Glass Material behind a data table, gradebook, ledger, or timetable grid.
8.7.2 Never nest Glass within Glass.
8.7.3 Never use Glass as the sole background for a Destructive Action confirmation.
8.7.4 Never use more than one top-edge highlight on a single Glass Surface.
8.7.5 Never allow a Glass Surface's fill opacity to drop low enough that foreground text fails WCAG AA contrast.
8.7.6 Never apply a drop shadow that is dark-colored and hard-edged to any Surface; all shadows MUST follow Chapter 11.

### 8.8 Compliance Checklist (Chapter 8)

- [ ] No Glass Material appears behind or within a Data-Dense Surface.
- [ ] No Glass Surface is nested inside another Glass Surface.
- [ ] Every Glass Surface has exactly one hairline border and at most one top-edge highlight.
- [ ] All foreground text on Glass passes WCAG AA contrast in both light and dark mode.
- [ ] Every Solid Surface uses a flat neutral fill from the defined scale, with gradients only where Chapter 10 permits.

## 9. Color System

### 9.1 Purpose of Color

9.1.1 Color's primary function in this specification is semantic communication (status, category, module identity) and secondary reinforcement of hierarchy already established by position, size, and typographic weight (see 6.1.6). Color MUST NOT be the sole carrier of any meaning that affects a user's ability to complete a task (see 22.4, WCAG 1.4.1).

### 9.2 Color Roles

Every color used anywhere in the application MUST be assigned to exactly one of the following roles. A color MAY NOT be used outside its assigned role.

9.2.1 **Brand Primary** — Used for the single Primary Action per screen, active navigation state, and focus indicators. Exactly one Brand Primary hue exists platform-wide.

9.2.2 **Brand Secondary/Accent** — Used sparingly for supporting emphasis (e.g., a secondary chart series, a highlighted tab). Limited to one hue, used at lower frequency than Brand Primary.

9.2.3 **Neutral Scale** — A ramp of no fewer than 9 and no more than 12 steps from lightest to darkest, used for all backgrounds, borders, dividers, disabled states, and body/metadata text. The Neutral Scale MUST have zero or near-zero saturation (true gray or a saturation not exceeding 4%) so it does not compete with semantic or brand colors.

9.2.4 **Semantic — Success** — A single green hue, used exclusively to indicate positive status (payment received, attendance present, task completed).

9.2.5 **Semantic — Warning** — A single amber/orange hue, used exclusively to indicate attention-required, non-critical status (payment due soon, low attendance threshold approaching).

9.2.6 **Semantic — Error/Destructive** — A single red hue, used exclusively to indicate failure, overdue status, or Destructive Actions.

9.2.7 **Semantic — Informational** — A single blue hue (may coincide with Brand Primary if Brand Primary is itself blue, otherwise distinct), used exclusively for neutral informational callouts (e.g., "New feature available").

9.2.8 **Module Accent** — One narrow hue variation permitted per Module under Chapter 20, used only for the Module's icon and active-navigation indicator, never for body content, buttons, or semantic states.

9.3 **Surface Neutrals.** Solid Material backgrounds MUST be drawn from three fixed steps of the Neutral Scale: Canvas Background (lightest step in light mode / darkest step in dark mode), Surface Background (one step removed from Canvas Background, used for cards/panels), and Sunken Background (used for input fields, code blocks, or recessed content, one step darker/lighter than Surface Background in the direction of increased recession).

9.4 **Semantic Color Consistency.** A given semantic meaning MUST use the same hue across all Modules; e.g., "overdue" MUST always render in the Error hue whether in Fee Management, Attendance, or Library Modules. Module Personality (Chapter 20) MUST NOT override semantic colors.

9.5 **Saturation Ceiling.** No non-semantic decorative use of color at greater than 60% saturation is permitted anywhere in the interface, in accordance with 4.7.1.2.

9.6 **Severity Ranking.** Where multiple semantic colors appear together (e.g., a notification list), Error MUST rank visually above Warning, which MUST rank above Informational, which MUST rank above Success, in terms of position (Error items listed first) and Visual Weight (Error items MAY use a filled badge where others use an outlined badge), per 4.7.4.3.

9.7 **Dark Mode Color Inversion Rules.** Dark mode MUST NOT be produced by simple color inversion of light mode values. Instead:

9.7.1 The Neutral Scale MUST be re-anchored so Canvas Background becomes the darkest neutral step and text becomes the lightest, but the number of intermediate steps and their relative spacing (in perceptual lightness terms) MUST remain the same as light mode.

9.7.2 Brand and semantic hues MUST reduce saturation and increase lightness slightly relative to their light-mode values, to prevent vibration/glare against a dark background, while remaining clearly identifiable as the same hue family.

9.7.3 Shadows (Chapter 11) MUST be replaced with subtle lightness-based elevation cues (a faint lighter border or lighter fill step) in dark mode, since dark-on-dark shadows are imperceptible; shadow-based elevation and lightness-step elevation MUST resolve to equivalent perceived elevation ordering in both modes.

### 9.8 Anti-Patterns (Color)

9.8.1 Never use more than one Brand Primary hue.
9.8.2 Never repurpose a semantic hue (e.g., using Error red for a decorative accent).
9.8.3 Never rely on hue alone to distinguish chart series without an accompanying pattern, label, or legend (see 22.4).
9.8.4 Never introduce a new hue for a single screen or single Module without formal addition to the Color Role table above.
9.8.5 Never produce dark mode via naive inversion.

### 9.9 Compliance Checklist (Chapter 9)

- [ ] Every color in the interface maps to exactly one defined Role.
- [ ] Semantic hues are used identically across all Modules.
- [ ] No non-semantic color exceeds the 60% saturation ceiling.
- [ ] Dark mode preserves relative neutral-scale spacing and re-anchors rather than inverts.
- [ ] All color-coded meaning has a redundant non-color indicator (icon, label, or pattern).

---

## 10. Gradients

10.1 Gradients are a restrained, exception-based tool, not a default surface treatment. A gradient MUST NOT be applied unless the use case matches one of the entries in 10.2.

### 10.2 Permitted Gradient Use Cases

10.2.1 **Hero/Summary Header Bands** — A subtle gradient (two adjacent steps of the same hue, differing only in lightness) MAY be applied to a dashboard's top summary band, positioned above Data-Dense content, never behind it.

10.2.2 **Data Visualization Fills** — Area-chart fills MAY use a vertical gradient fading from the semantic/series color to transparent, to indicate magnitude decay toward the baseline. This is the only permitted use of gradient within a Data-Dense Surface, since its function is informational (indicating direction/magnitude), not decorative.

10.2.3 **Avatar/Placeholder Backgrounds** — Auto-generated user avatar placeholders (when no photo is uploaded) MAY use a two-stop gradient derived from the user's Module or role accent, to aid quick visual differentiation in lists.

10.2.4 **Progress Indicators** — A progress bar or ring MAY use a gradient between two adjacent steps of the same semantic hue to indicate directional progress, never between two unrelated hues.

### 10.3 Prohibited Gradient Use Cases

10.3.1 Gradients MUST NOT be applied to: card backgrounds in Data-Dense Surfaces, table headers, form backgrounds, body text, primary buttons (buttons MUST use flat semantic fill per Chapter 19), or full-page backgrounds.

10.3.2 Multi-hue gradients (more than two color stops, or two stops of different hues) are prohibited everywhere except 10.2.3 (avatar placeholders), where a maximum of two adjacent-on-the-color-wheel hues is permitted.

10.4 **Gradient Angle.** Where used, gradients MUST run in a single consistent direction per use case (e.g., always top-to-bottom for hero bands, always bottom-to-top-transparent for chart fills) across the entire application. Diagonal gradients are prohibited as they read as decorative rather than functional.

10.5 **Gradient Opacity Range.** Gradient stops MUST stay within a lightness/opacity range that preserves WCAG AA contrast for any text overlaid on top at any point along the gradient.

### 10.6 Dividers and Hairlines (Non-Gradient Line Treatments)

10.6.1 Section dividers MUST be a single 1px (or the smallest renderable unit at the target display density) solid hairline at a low-contrast Neutral Scale step, MUST NOT use a gradient or shadow, and MUST span either the full width of its container or be explicitly inset per a documented component rule.

### 10.7 Anti-Patterns (Gradients)

10.7.1 Never place a decorative gradient behind dense information (see also 8.3.1 for the Glass-specific case).
10.7.2 Never use a multi-hue gradient anywhere except avatar placeholders.
10.7.3 Never use a diagonal gradient.
10.7.4 Never allow gradient use to reduce text contrast below WCAG AA at any point along the gradient.

### 10.8 Compliance Checklist (Chapter 10)

- [ ] Every gradient in the interface matches one of the four permitted use cases in 10.2.
- [ ] No gradient exceeds two color stops (except within the single hue family permitted for 10.2.3).
- [ ] No gradient runs diagonally.
- [ ] No gradient appears in a Data-Dense Surface outside the single permitted chart-fill case.

---

## 11. Elevation, Depth, and Shadows

### 11.1 Elevation Model

11.1.1 The interface uses a five-level Elevation scale: **Level 0** (flush with Canvas — e.g., inline text, dividers), **Level 1** (resting Surface — e.g., a static card), **Level 2** (raised/hovered Surface, or a persistently floating element such as the top bar), **Level 3** (dropdowns, tooltips, popovers), **Level 4** (modals, dialogs, and their scrims).

11.1.2 A Surface's Elevation Level MUST be assigned based on its functional stacking need, not arbitrarily. An element MUST NOT skip a level in its resting-to-active transition (e.g., a card MUST go from Level 1 to Level 2 on hover, not Level 1 to Level 4).

11.1.3 Higher Elevation Levels MUST correspond to strictly larger shadow blur radius and offset, and, where two elements of different Elevation Levels visually overlap, the higher-level element MUST render in front, with no exceptions.

### 11.2 Shadow Construction

11.2.1 Every shadow MUST be soft-edged: constructed from a large blur radius relative to its offset, never a hard-edged or sharply defined shadow.

11.2.2 Shadow color MUST be derived from the Neutral Scale's darkest step at low opacity (light mode) or from a pure black at very low opacity with a slight elevation-dependent increase in opacity for higher levels (dark mode, where shadows are secondary to lightness-step cues per 9.7.3).

11.2.3 Shadow offset MUST be vertical-only (no horizontal offset) and downward, simulating a single, consistent overhead light source across the entire application. This light-source direction MUST NOT vary between components or Modules.

11.2.4 Shadow blur radius and vertical offset MUST both increase monotonically with Elevation Level; Level 4 (modal) MUST have the largest blur radius and offset of any element in the system.

### 11.3 Interaction Behavior

11.3.1 A Surface transitioning between Elevation Levels (e.g., card hover) MUST animate the shadow's blur radius and offset smoothly per the timing rules in Chapter 18, MUST NOT snap instantly, and MUST NOT overshoot (no bounce/spring easing on elevation changes — see 18.5).

11.3.2 A Surface MUST NOT combine a shadow-based elevation increase with a scale-based size increase exceeding a barely perceptible amount; elevation is communicated primarily through shadow and secondarily through subtle brightness increase, not through the element visibly growing in size.

### 11.4 Anti-Patterns (Elevation)

11.4.1 Never use a hard-edged, high-opacity shadow.
11.4.2 Never use multiple simultaneous light-source directions across different components.
11.4.3 Never skip an Elevation Level in a single transition.
11.4.4 Never let a lower-Elevation element render in front of a higher-Elevation element.

### 11.5 Compliance Checklist (Chapter 11)

- [ ] All shadows in the interface derive from the five-level Elevation scale.
- [ ] All shadow offsets are vertical-only and downward.
- [ ] Elevation transitions animate smoothly without overshoot.
- [ ] Stacking order in every screen matches Elevation Level ranking with no exceptions.

---

## 12. Typography

### 12.1 Typeface Selection

12.1.1 The application MUST use a single primary typeface family for all UI text (a humanist or grotesque sans-serif optimized for screen legibility at small sizes), and MAY use a single secondary monospace/tabular-figure typeface exclusively for numeric data in Data-Dense Surfaces (Chapter 4.7.5.3).

12.1.2 No more than two typeface families MAY exist in the entire application (primary UI sans-serif, secondary numeric/monospace). Decorative or display typefaces are prohibited.

### 12.2 Type Scale

12.2.1 The application MUST define a fixed type scale with the following named steps, each strictly larger than the previous in both size and, where applicable, weight: **Display** (page-level hero numbers/titles, used sparingly), **Heading 1** (page title), **Heading 2** (section title), **Heading 3** (card/subsection title), **Body Large** (primary reading text, form labels), **Body** (default UI text, table cell content), **Caption** (metadata, timestamps, helper text), **Micro** (badges, tags, smallest permissible legible text).

12.2.2 Every step in the scale MUST maintain a consistent, defined ratio to its neighbors (a modular scale), not arbitrary independent sizes.

12.2.3 No text anywhere in the application may fall below the Micro step's minimum size threshold; the rendering agent MUST treat this as an absolute floor regardless of container constraints (see also 22.3, minimum text size for accessibility).

### 12.3 Line Height

12.3.1 Line height MUST scale inversely with type size on a defined curve: smaller type steps (Caption, Micro) MUST use a proportionally larger line-height multiple than larger steps (Display, Heading 1), because small text requires more relative breathing room for legibility.

12.3.2 Body text used in paragraphs of two or more sentences MUST use a line-height multiple that keeps line length (measure) and vertical rhythm comfortable — informatively, tighter than heading line-height ratios but never tight enough to cause visual crowding between wrapped lines.

### 12.4 Line Length (Measure)

12.4.1 Any Surface containing paragraph-style Body text MUST constrain line length to a maximum character-count-based measure (informative target: not exceeding roughly 75–90 characters per line including spaces) regardless of the Surface's available width; excess width MUST be resolved via increased side padding or a constrained inner content column, not by allowing lines to stretch edge-to-edge.

### 12.5 Alignment

12.5.1 All body text MUST be left-aligned in left-to-right locales. Center alignment is prohibited for any text exceeding one line (see 21.2). Right alignment is permitted only for numeric table columns and explicitly defined metadata positions (7.10).

12.5.2 Justified (full-justified) text is prohibited everywhere in the application, as it produces uneven word spacing incompatible with the legibility requirements of this specification.

### 12.6 Weight Usage

12.6.1 The type scale MUST define exactly which weights are permitted at each step (e.g., Heading steps MUST use a heavier weight than Body steps at their respective sizes). No more than three distinct font weights may be used across the entire application (e.g., Regular, Medium, Semibold/Bold).

12.6.2 Weight MUST be the first tool used to establish hierarchy within text (a heavier weight before a larger size, where both are options), per 4.7.5.2.

### 12.7 Color and Contrast in Typography

12.7.1 Primary text (headings, body) MUST use the darkest/lightest Neutral Scale step reserved for text (not the same step used for large surface fills) to guarantee a minimum contrast ratio independent of the Surface it sits on.

12.7.2 Caption and Micro steps MAY use a lower-contrast (but still WCAG AA-compliant at their size) Neutral Scale step to visually recede, reinforcing their Quiet hierarchy tier (6.3).

### 12.8 Hierarchy Application Order

12.8.1 When establishing a hierarchy relationship between two pieces of text, the rendering agent MUST apply differentiation in this order until sufficient distinction is achieved: (1) type scale step, (2) weight, (3) color/contrast step. Two pieces of text MUST NOT be differentiated by color alone if they are the same scale step and weight (see 5.4, 21.4).

### 12.9 Numeric and Tabular Text

12.9.1 All numeric columns in Data-Dense Surfaces MUST use tabular (fixed-width) figures so digits align vertically across rows, per 4.7.5.3.

12.9.2 Currency values MUST always display their currency symbol/code and MUST right-align within their column; negative values MUST be indicated by both color (Error hue) and a leading minus sign or parenthetical notation, never by color alone (per 22.4).

### 12.10 Anti-Patterns (Typography)

12.10.1 Never use more than two typeface families.
12.10.2 Never use justified text alignment.
12.10.3 Never center-align paragraph text.
12.10.4 Never use color as the only differentiator between two text elements of identical scale and weight.
12.10.5 Never let line length exceed the defined maximum measure.
12.10.6 Never use a decorative or display typeface for UI text.

### 12.11 Compliance Checklist (Chapter 12)

- [ ] Exactly one or two typeface families are used, matching 12.1.
- [ ] All text sizes map to a named Type Scale step; no arbitrary sizes exist.
- [ ] Line length is constrained on every paragraph-containing Surface.
- [ ] All numeric data in Data-Dense Surfaces uses tabular figures and correct alignment.
- [ ] Hierarchy differentiation follows the order: scale → weight → color.

---

## 13. Spacing, Whitespace, and Proportional Sizing

### 13.1 Spacing Scale

13.1.1 The application MUST use a single base spacing unit and a fixed multiplier scale derived from it (e.g., steps at 1×, 2×, 3×, 4×, 6×, 8×, 12×, 16× the base unit), referenced throughout this document by step name (e.g., "Space-1" through "Space-8") rather than raw values, so the scale can be resized globally without breaking proportional relationships.

13.1.2 No spacing value outside this defined scale may be used anywhere in the application. Arbitrary spacing (e.g., an unlisted intermediate value used to "make something fit") is prohibited per 5.3.

### 13.2 Outer vs. Inner Spacing

13.2.1 Per 4.7.3.1, the spacing between a Surface and its containing region (outer spacing/margin) MUST always use a scale step greater than or equal to the spacing used within that Surface (inner spacing/padding).

13.2.2 The relationship in 13.2.1 MUST hold recursively at every nesting level: a child Surface's inner padding MUST be less than or equal to its parent Surface's inner padding, which MUST be less than or equal to the Canvas outer margin.

### 13.3 Canvas Margins

13.3.1 Every Canvas MUST reserve a minimum outer margin on all sides before content begins, drawn from the upper half of the spacing scale (e.g., Space-6 or greater), scaling up (not down) as viewport width increases beyond the desktop baseline.

### 13.4 Vertical Rhythm

13.4.1 Vertical spacing between stacked elements within a single Surface MUST follow a single consistent scale step for elements of the same relationship type (e.g., all form-field-to-form-field gaps use the same step; all section-to-section gaps use a different, larger step).

13.4.2 The gap between a heading and the content it introduces MUST be smaller than the gap between that content block and the next, unrelated heading — proximity MUST always reflect relationship (Gestalt proximity, applied deterministically per 7.9).

### 13.5 Grid Gutters and Column Gaps

13.5.1 Gutter spacing (Chapter 7.2) MUST be drawn from the same base scale defined in 13.1, at a step appropriate to the current breakpoint's density tier (13.6).

### 13.6 Density Tiers

13.6.1 Every Surface MUST be assigned one of three Density Tiers, which govern its internal spacing step selection: **Compact** (Data-Dense Surfaces — tables, grids, ledgers; minimizes padding to maximize visible rows/columns while retaining minimum touch-target and legibility requirements), **Standard** (default for cards, forms, dialogs), **Comfortable** (dashboards' summary/hero areas, empty states, onboarding surfaces).

13.6.2 A single screen MAY mix Density Tiers across different Surfaces (e.g., a Comfortable hero band above a Compact data table) but a single Surface MUST NOT mix Density Tiers internally.

13.6.3 Switching a Surface's Density Tier MUST proportionally scale all of its internal spacing values together (per the ratios fixed in 13.1), never adjust individual spacing values independently within a tier change.

### 13.7 Proportional Sizing Over Fixed Pixels

13.7.1 Component and layout dimensions MUST be expressed as proportions of their Reference Frame (percentages, fractional column spans, or "aspect-ratio locked to content") rather than fixed pixel dimensions, except for: minimum touch-target size (Chapter 22.6), minimum/maximum line length (12.4), and hairline border/divider thickness (10.6), which require fixed values for functional or optical-precision reasons.

13.7.2 Where a component must maintain a fixed aspect ratio regardless of container size (e.g., an avatar, a chart's plotting area), that ratio MUST be explicitly declared and locked, rather than left to stretch.

### 13.8 Anti-Patterns (Spacing)

13.8.1 Never use a spacing value outside the defined scale.
13.8.2 Never let inner padding exceed outer margin at the same nesting level.
13.8.3 Never mix Density Tiers within a single Surface.
13.8.4 Never let unrelated content sit closer together than related content (inverted proximity).

### 13.9 Compliance Checklist (Chapter 13)

- [ ] All spacing values trace back to the defined scale; no arbitrary values are present.
- [ ] Outer-to-inner spacing relationships hold at every nesting level on every screen.
- [ ] Every Surface has exactly one assigned Density Tier.
- [ ] Proximity between elements correctly signals their semantic relationship in every case.

## 14. Iconography

### 14.1 Purpose and Design Rationale

14.1.1 Icons exist to accelerate recognition below the speed of reading. A user scanning a sidebar or a table row recognizes a shape faster than they read a word. Icons in this specification are therefore treated strictly as **recognition accelerators for already-labeled concepts**, not as standalone communicators of new information — because an unlabeled icon depends entirely on the viewer already knowing the icon-to-meaning mapping, which cannot be guaranteed across a diverse ERP user base (teachers, parents, accountants, administrators of varying digital literacy).

14.1.2 Because the rendering agent has no aesthetic judgment, it MUST treat icon selection as a matching problem against a fixed, closed icon set (14.2), never as a creative or generative problem.

### 14.2 Icon Set Constraints

14.2.1 The application MUST use exactly one icon set, defined by a single consistent stroke weight, a single consistent corner radius on rounded terminals, and a single consistent overall grid size (e.g., all icons drawn on the same square pixel grid, such as 24×24, regardless of visual complexity).

14.2.2 Mixing filled and outlined icon styles within the same screen is prohibited, EXCEPT for the single, deliberate case defined in 14.5 (state differentiation via fill).

14.2.3 Every icon used MUST come from the approved set. Where a required concept has no icon in the approved set, the rendering agent MUST flag the gap rather than source an icon from a different family or invent a new glyph (per 5.5).

### 14.3 Icon Sizing

14.3.1 Icon size MUST always be expressed as a ratio of the adjacent text's Type Scale step (Chapter 12), not as an independent fixed value, so icons remain proportionally correct if the type scale is ever adjusted. Informatively, an icon paired with Body text should occupy a visual footprint close to the cap-height-to-ascender range of that text line, not dominate it.

14.3.2 Standalone icons (not paired with text) — e.g., a toolbar icon button — MUST use one of exactly three defined sizes: Small (dense toolbars, inline table actions), Medium (default buttons, navigation items), Large (empty-state illustrations, feature callouts). No fourth size may be introduced.

### 14.4 Icon Placement Relative to Text

14.4.1 Where an icon accompanies a text label (e.g., a navigation item, a button), the icon MUST be positioned to the left of the label in left-to-right locales, vertically centered against the label's cap-height, with a horizontal gap drawn from the spacing scale (Chapter 13) that is smaller than the gap used between separate label groups — this asymmetry (tight icon-label gap, looser group-to-group gap) is what visually binds the icon to "its" label rather than the neighboring one.

14.4.2 Trailing icons (positioned right of a label) are permitted only for a small, closed set of functional cases: a dropdown/disclosure chevron, an external-link indicator, or a sort indicator in a table header. Trailing icons MUST NOT be used as decoration.

### 14.5 Icon Semantic Rules

14.5.1 A given concept (e.g., "students," "attendance," "fees") MUST use exactly the same icon everywhere it appears across the entire application. Icon meaning MUST NOT be reused for a different concept elsewhere (no icon polysemy).

14.5.2 Filled icon variants (of an otherwise outlined set) MAY be used exclusively to indicate an active/selected state (e.g., a filled home icon for the currently active navigation item, outlined for inactive items). This is the only permitted fill/outline mixing case referenced in 14.2.2.

14.5.3 Icon color MUST follow the same hierarchy rules as text (Chapter 12.8): an icon's color MUST match the hierarchy tier of the label it accompanies, never independently colored for decorative variety.

### 14.6 Interaction States

14.6.1 A clickable icon (icon button) MUST expose the same five interaction states required of any control (Idle, Hover, Active, Disabled, Focus — Chapter 19), and MUST meet the minimum touch-target size defined in 22.6 regardless of the icon's own visual size (i.e., a small icon glyph MAY sit inside a larger invisible hit-area).

### 14.7 Responsive Behavior

14.7.1 Icon-only navigation states (e.g., a collapsed sidebar rail at tablet breakpoints, per 7.6.2) MUST retain a tooltip or accessible label on hover/focus, since removing the text label increases reliance on the icon and therefore increases the cost of ambiguity.

### 14.8 Anti-Patterns (Iconography)

14.8.1 Never mix two icon families in one application.
14.8.2 Never use an icon as the sole communicator of a Destructive Action without an accompanying text label at first use.
14.8.3 Never reuse one icon glyph for two different meanings within the same application.
14.8.4 Never scale an icon independently of its paired text's scale step.
14.8.5 Never rely on an icon-only control without an accessible text alternative (22.5).

### 14.9 Compliance Checklist (Chapter 14)

- [ ] Exactly one icon family, one stroke weight, one grid size is used throughout.
- [ ] Every icon glyph maps to exactly one concept, consistently, everywhere.
- [ ] All icon buttons meet minimum touch-target size regardless of glyph size.
- [ ] Icon-only states retain accessible text alternatives.

---

## 15. Dashboards

### 15.1 Purpose and Design Rationale

15.1.1 A dashboard's function is to answer, at a glance, three questions for its specific role/persona: "What needs my attention right now?", "What is the current state of the things I'm responsible for?", and "Where do I go next to act?" A dashboard that fails to visually answer these three questions within roughly the first second of viewing (informative benchmark) is non-compliant regardless of its aesthetic polish, because a dashboard's job is triage, not display.

15.1.2 This is why 4.7.4.1 requires action-required content to outrank passive informational content in Visual Weight even when a Module's raw content order would put "totals" first: totals are comfortable to look at, but they are not what the user came to check first.

### 15.2 Dashboard Zones

15.2.1 Every role-based dashboard MUST be structured into the following zones, top to bottom, in this fixed order: **Attention Zone** (overdue items, alerts, pending approvals — highest Visual Weight, Comfortable density), **Summary Zone** (key metrics/totals as a row of stat cards — Standard density), **Activity/Detail Zone** (recent activity feed, upcoming schedule, or a primary data table relevant to the role — Standard or Compact density depending on content type).

15.2.2 The Attention Zone MUST be omitted entirely (not rendered as an empty shell) when there is nothing requiring attention, per the Empty State rules (17.9); it MUST NOT be rendered as a "0 alerts" card, since a title-only zone with zero content still consumes Visual Weight the user must process for no benefit.

### 15.3 Focal Point Determination

15.3.1 Per 5.1, only one Focal Point is permitted per screen. On a dashboard, the Focal Point MUST be the highest-severity unresolved item in the Attention Zone, if one exists; if the Attention Zone is empty, the Focal Point MUST be the single most important Summary Zone metric for that role (e.g., "Fee collection this month" for an Accountant dashboard, "Attendance today" for a Teacher dashboard), determined per-Module in the Module Personality chapter (20).

### 15.4 Stat Cards

15.4.1 A stat card MUST contain, at minimum: a Caption-scale label (what is being measured), a Heading-scale numeric value (the measurement), and MAY contain a trend indicator (a small delta value plus directional icon, colored per semantic rules — Chapter 9.6) and/or a Micro-scale timeframe qualifier (e.g., "vs. last month").

15.4.2 Stat cards within a single row MUST be visually identical in structure (same internal layout, same Density Tier) even if their content differs in length; content that would overflow MUST truncate with an accessible full-value tooltip rather than resize the card.

15.4.3 No dashboard row MUST contain more than four stat cards at desktop breakpoints (beyond four, competing Visual Weight prevents any single metric from registering, per 4.7.1.1); additional metrics MUST move to a secondary row or a "view all metrics" expansion.

### 15.5 Charts on Dashboards

15.5.1 A dashboard MAY include at most one primary chart in the Summary or Activity zone at Standard density; charts MUST NOT be presented in a Compact density grid of many small charts, as this recreates the competing-focal-point problem at a smaller scale.

15.5.2 Chart color usage MUST follow Chapter 9 semantic rules exactly; a revenue/growth chart MUST use Success-adjacent hues for positive series only where the data is genuinely positive-framed, not decoratively.

### 15.6 Responsive Behavior

15.6.1 At tablet breakpoints, dashboard zones MUST stack in the same top-to-bottom order defined in 15.2; stat card rows MAY reduce from four columns to two, but MUST NOT reduce below two before wrapping to additional rows (a single-column stat card list defeats the "at a glance" comparison purpose of the Summary Zone).

### 15.7 Anti-Patterns (Dashboards)

15.7.1 Never render an empty Attention Zone shell.
15.7.2 Never present more than four stat cards per row at desktop.
15.7.3 Never present more than one primary chart per dashboard screen.
15.7.4 Never let passive totals outrank actionable alerts in Visual Weight.
15.7.5 Never use inconsistent stat card internal structure within one row.

### 15.8 Compliance Checklist (Chapter 15)

- [ ] Every dashboard follows the fixed Attention → Summary → Activity zone order.
- [ ] Exactly one Focal Point is identifiable per dashboard.
- [ ] No stat card row exceeds four cards at desktop.
- [ ] Empty Attention Zones are omitted, not shown empty.

---

## 16. Navigation and Sidebar

### 16.1 Purpose and Design Rationale

16.1.1 Navigation exists to answer two questions continuously and passively, without requiring the user to think about them: "Where am I?" and "Where else can I go?" A navigation system that requires active thought to answer either question has failed, regardless of its visual polish.

### 16.2 Sidebar Structure

16.2.1 The primary sidebar MUST contain, top to bottom: an institution/brand identifier (fixed height, Level 2 elevation matching the top bar), a primary navigation list grouped by Module, and a persistent account/settings control pinned to the bottom of the sidebar (not scrolling with the navigation list).

16.2.2 Navigation items MUST be grouped by Module with visual grouping achieved through whitespace gaps between groups (per 7.9, Containment) rather than through boxed dividers, to keep the sidebar visually quiet relative to Canvas content (per 4.7.1, "Calm").

16.2.3 The currently active navigation item MUST be indicated through no fewer than two simultaneous, redundant signals (e.g., filled icon variant + Brand Primary color + a left-edge indicator bar), so the active state remains identifiable even for users with color vision deficiency (see 22.4).

### 16.3 Navigation Item Structure

16.3.1 Each navigation item MUST use the Medium icon size (14.3.2) paired with a Body-scale label, at a fixed row height consistent across all items regardless of label length; overflowing labels MUST truncate with an ellipsis and an accessible full-label tooltip, never wrap to a second line.

16.3.2 Navigation items with sub-items (a Module with multiple screens) MUST use a disclosure pattern (expand/collapse) rather than instant navigation to a Module landing page that then requires a second navigation action; the parent item MUST remain visually distinguishable from a leaf item via a trailing chevron (14.4.2).

### 16.4 Top Bar

16.4.1 The global top bar MUST contain, left to right: a collapse/expand control for the sidebar (tablet/narrow contexts), a contextual page title reflecting the current screen (kept in sync with the active navigation item), and, right-aligned, global utilities in this fixed order: search trigger, notifications, user account menu.

16.4.2 The top bar MUST remain fixed/sticky during Canvas scroll and MUST use Glass Material per 8.2.1's permitted case, since its function is to persistently float above scrolling content.

### 16.5 Breadcrumbs

16.5.1 Any screen nested more than one level below a Module's landing page MUST display a breadcrumb trail directly above the page title, using Caption scale, with each ancestor level rendered as a clickable link except the current (final) level, which MUST render as static, non-interactive text at slightly higher contrast than the ancestor links.

### 16.6 Responsive Behavior

16.6.1 At tablet breakpoints, the sidebar MUST collapse to an icon-only rail by default (7.6.2) with labels available via tooltip on hover/focus, or MUST become an overlay drawer triggered from the top bar — the choice between rail and drawer MUST be fixed platform-wide, not decided per-screen.

### 16.7 Anti-Patterns (Navigation)

16.7.1 Never indicate active navigation state through color alone.
16.7.2 Never let navigation labels wrap to a second line.
16.7.3 Never change the top bar's utility order between screens.
16.7.4 Never nest more than one level of disclosure within the sidebar (Module → screens is the maximum depth; deeper structures belong inside the Canvas, e.g., as tabs).

### 16.8 Compliance Checklist (Chapter 16)

- [ ] Active navigation state uses at least two redundant signals.
- [ ] Sidebar grouping uses whitespace, not boxed dividers.
- [ ] Top bar utility order is identical across all screens.
- [ ] Breadcrumbs appear on every screen nested more than one level deep.

---

## 17. Core Components

### 17.1 Buttons — Purpose and Design Rationale

17.1.1 A button's visual weight must communicate its consequence before the user reads its label, because users scan interfaces faster than they read them; a button that looks identical to its neighbors regardless of whether it saves data or deletes it is a usability defect, not a stylistic choice.

17.1.2 **Button Tiers.** Exactly three button tiers exist: **Primary** (solid Brand Primary fill, highest contrast, used once per Surface for the single most important action — per 3.8/5.1), **Secondary** (outlined or low-emphasis fill, used for supporting actions coexisting with a Primary button), **Tertiary/Text** (no fill, no border, text-only with hover underline or background tint, used for the lowest-emphasis actions such as "Cancel").

17.1.3 A single Surface (e.g., a form footer, a dialog) MUST contain at most one Primary button. Where two actions seem equally important, the rendering agent MUST demote one to Secondary rather than rendering two Primary buttons (per 5.1).

17.1.4 **Destructive Buttons.** A Destructive Action (3.10) MUST render using the Error semantic hue (9.2.6) in place of Brand Primary, at the same tier structure (a destructive action MAY still be Primary or Secondary tier depending on context) — color communicates consequence, tier communicates emphasis; both are required simultaneously (per 5.4/12.8's "never color alone" rule, this is reinforced by a confirming dialog per 17.4.5, not color in isolation).

17.1.5 **Sizing.** Buttons MUST use one of three fixed height tiers (Small, Medium, Large) tied to Density Tier (13.6), with horizontal padding scaling proportionally to the button's label length within min/max bounds, never a fixed width that could clip longer labels.

17.1.6 **Icon + Label Buttons.** Where a button includes an icon, 14.4.1's placement and gap rules apply; an icon-only button MUST include an accessible label (22.5) and MUST meet minimum touch-target size (22.6).

### 17.2 Forms

17.2.1 **Purpose and Rationale.** A form is the highest-cost interaction in the ERP because it requires sustained user attention and produces real data-entry errors if visually ambiguous; therefore forms use exclusively Solid Material (8.5.3) and the most conservative, least experimental visual treatment in the entire specification.

17.2.2 **Label Placement.** Field labels MUST be positioned directly above their input, left-aligned, at Body or Caption scale, always visible (never used as placeholder-only text that disappears on input, per 22.7 and standard usability principles against placeholder-as-label).

17.2.3 **Field States.** Every input MUST visually support: Idle, Focus (Brand Primary border + focus ring per 22.somewhat), Filled, Error (Error hue border + inline Error-hue helper text replacing or supplementing the default helper text), Disabled (reduced-opacity per 19.6), Read-only (visually distinct from Disabled — Read-only retains full-opacity text but removes the input border/background distinction, signaling "this has a value you cannot edit here" rather than "this is unavailable").

17.2.4 **Grouping.** Related fields (e.g., "First Name" / "Last Name") MUST sit in the same row at desktop breakpoints where semantically parallel, sharing equal column width, and MUST stack vertically at any breakpoint where their combined width would compress either field below a legible minimum.

17.2.5 **Required/Optional Marking.** The specification MUST mark the minority case explicitly rather than both: if most fields in a form are required, only optional fields MUST be labeled "(optional)"; if most fields are optional, only required fields MUST be marked (with an asterisk plus a legend at the top of the form explaining the asterisk, never an asterisk alone with no legend).

17.2.6 **Validation Timing.** Inline field validation MUST fire on blur (leaving the field) for format errors, never on every keystroke (which produces distracting, premature error states while the user is still typing), and MUST fire immediately on submit for all remaining unvalidated required fields.

17.2.7 **Form Footer Actions.** A form's action row MUST place the Primary action (e.g., "Save") in the position consistent with the page's reading flow terminus (bottom-right in left-to-right locales for inline forms; bottom-right within a modal, per 17.4), with Secondary/Tertiary actions (e.g., "Cancel") positioned to its left, at lower Visual Weight (17.1.2).

### 17.3 Tables

17.3.1 **Purpose and Rationale.** A table's job is comparison across rows and columns; every rule in this section exists to preserve the user's ability to visually track a single row and compare a single column without losing their place, which is the primary failure mode of poorly built data tables.

17.3.2 **Density.** Tables are Data-Dense Surfaces (3.18) and MUST use Compact density (13.6) and Solid Material exclusively (8.3.1).

17.3.3 **Row Differentiation.** Alternating row background (zebra striping) MAY be used, drawing the alternate stripe from a Neutral Scale step immediately adjacent to the base Surface background, OR row separation MAY be achieved through hairline dividers (10.6) alone; the application MUST choose exactly one method platform-wide, never mixing striping and dividers within the same table, and never varying the method between tables in different Modules.

17.3.4 **Header Row.** The header row MUST be visually distinguished from data rows via weight (Chapter 12.6) and a stronger bottom border, MUST remain sticky during vertical scroll of long tables, and MUST indicate sortable columns via a trailing chevron/arrow icon (14.4.2) that changes state (up/down/neutral) to reflect current sort direction.

17.3.5 **Column Alignment.** Per 12.9.2, numeric columns MUST right-align; text columns MUST left-align; single-glyph status/icon columns MUST center-align. A column's alignment MUST remain constant regardless of its content on any given row.

17.3.6 **Row Actions.** Row-level actions (edit, delete, view) MUST be presented as icon buttons in a fixed-position trailing column, revealed on row hover at desktop breakpoints (to reduce visual noise across many rows) but MUST remain permanently visible (not hover-only) at touch-primary breakpoints where hover does not exist.

17.3.7 **Selection.** Where multi-row selection is supported, a checkbox column MUST be the first (leftmost) column, with a header checkbox supporting three states (none selected, some selected/indeterminate, all selected).

17.3.8 **Pagination.** Tables exceeding a defined row-count threshold MUST paginate (never infinite-scroll for data requiring precise navigation, e.g., "go to record 214"), with pagination controls positioned at the bottom of the table, right-aligned, showing current range and total count (e.g., "21–40 of 312").

### 17.4 Dialogs and Modals

17.4.1 **Purpose and Rationale.** A modal interrupts the user's flow deliberately; it MUST therefore be reserved for cases requiring focused, blocking attention (confirmations, short focused forms, critical alerts) and MUST NOT be used for content that could instead live inline or in a side panel, because unnecessary interruption directly contradicts the "Calm" and "Effortless" design values (4.7.1, 4.7.6).

17.4.2 Modals use Elevation Level 4 (11.1.1), Solid Material for the modal body, and a Glass or dimmed scrim behind them (8.2.1) to reinforce that background content is temporarily inactive.

17.4.3 A modal MUST include a visible title (Heading 3 scale), a dismiss control (top-right corner, per reading-flow-terminus convention), body content constrained to the maximum line-length measure (12.4) even within the modal's own width, and a footer action row following the same Primary/Secondary placement rules as 17.2.7.

17.4.4 A modal MUST be dismissible via: the explicit dismiss control, a Cancel/Secondary button, the Escape key, and a click on the scrim — UNLESS the modal represents an in-progress, unsaved-data-loss-risk state, in which case scrim-click and Escape MUST be disabled and only explicit button choices remain available, to prevent accidental data loss.

17.4.5 **Destructive Confirmation.** Any Destructive Action (3.10) MUST be confirmed via a modal using Solid Material only (8.3.4), stating in Body text exactly what will be lost/changed, with the Destructive button (17.1.4) positioned as the Primary action and "Cancel" as the Secondary action positioned to its left — the Destructive button MUST NOT be pre-focused by default; focus MUST default to Cancel, so an accidental Enter keypress does not trigger destruction.

### 17.5 Cards

17.5.1 A card is the default Surface for grouping a bounded set of related content that will be scanned as one unit among peers (e.g., a student profile summary, a stat, a list item in a grid view). Cards use Solid Material by default (8.5), Standard density (13.6), and MAY use Glass Material only where 8.2.1 applies.

17.5.2 A card's internal structure MUST follow the reading-flow rules of 7.10: primary label/title top-left (or top-center only for the specific centered-icon empty-state and stat-card patterns explicitly defined elsewhere), supporting metadata beneath or top-right, primary action (if any) bottom-right or as a full-width footer button.

17.5.3 Cards presented in a grid MUST share identical height within a single row (equalized to the tallest card's natural content height, or truncated with "show more" where content is highly variable in length) — uneven card heights within one row are prohibited as they break horizontal scanning.

### 17.6 Tabs

17.6.1 Tabs MUST be used only for switching between views of the same entity at the same hierarchy level (e.g., a student's "Profile," "Attendance," "Grades," "Fees" tabs), never for sequential/wizard-style progression (which requires a Stepper, 17.8) and never for entirely unrelated content.

17.6.2 The active tab MUST be indicated through both a bottom border/indicator in Brand Primary AND a weight/color change on the label text — redundant signaling per 22.4 — and tab order MUST remain fixed across sessions (not reordered based on usage).

### 17.7 Badges and Tags

17.7.1 Badges communicate a single-word or short-phrase status (e.g., "Overdue," "Active," "Draft") and MUST use the semantic color rules of Chapter 9 with a filled-pill Micro-scale treatment; tags communicate categorization (e.g., "Grade 8," "Section A") and MUST use a neutral, outlined-pill treatment to visually distinguish "status" from "category" at a glance, platform-wide.

### 17.8 Steppers/Wizards

17.8.1 A multi-step sequential process (e.g., Student Admission) MUST render a horizontal stepper at the top of the Canvas showing all steps, the current step highlighted per 17.6.2's redundant-signal rule, completed steps marked with a checkmark icon (14.5.1's fixed meaning: checkmark always means "complete," never reused for another meaning), and future steps in the Quiet hierarchy tier (6.3).

### 17.9 Empty States

17.9.1 Per 4.7.4.2, three distinct empty-state treatments MUST exist and MUST NOT be conflated: **No Data Yet** (encouraging tone, Large icon per 14.3.2, Body text explaining what will appear here, a Primary button to create the first item where applicable), **Filtered/No Results** (neutral tone, explains that filters/search produced zero matches, includes a "clear filters" Tertiary action, MUST NOT show a "create new" Primary button since data may already exist elsewhere), **Error** (Error-hue icon accent, explains that content failed to load, includes a "retry" Secondary button, MUST NOT use the encouraging tone of the No Data Yet case).

### 17.10 Anti-Patterns (Core Components)

17.10.1 Never place two Primary-tier buttons in one Surface.
17.10.2 Never use placeholder text as the only field label.
17.10.3 Never validate a text field on every keystroke.
17.10.4 Never mix zebra striping and hairline dividers in the same table.
17.10.5 Never pre-focus a Destructive confirmation button.
17.10.6 Never use a wizard/stepper for non-sequential navigation.
17.10.7 Never render the same empty-state treatment for "no data," "filtered," and "error" cases.
17.10.8 Never allow uneven card heights within a single grid row.

### 17.11 Compliance Checklist (Chapter 17)

- [ ] Every Surface has at most one Primary-tier button.
- [ ] Every form field has a persistent visible label, not placeholder-only.
- [ ] Every table uses exactly one row-differentiation method, platform-wide.
- [ ] Every Destructive confirmation defaults focus to Cancel.
- [ ] All three Empty State treatments are implemented and visually distinct.

---

## 18. Motion

### 18.1 Purpose and Design Rationale

18.1.1 Motion in this specification exists exclusively to communicate state change and spatial relationships (what came from where, what is now where) — never to entertain, brand, or decorate. Motion is the most easily overused tool in interface design because it is cheap to add and immediately "feels" premium in isolation; this specification therefore treats motion as the highest-scrutiny category, permitted only where it serves comprehension.

### 18.2 Permitted Motion Categories

18.2.1 **State Feedback** — button press, toggle switch, checkbox check, hover elevation change (11.3.1). Duration: fastest tier (18.4).

18.2.2 **Spatial Transition** — modal open/close, panel expand/collapse, drawer slide-in, dropdown reveal. Duration: mid tier. MUST animate from/toward the triggering element's position where feasible (e.g., a dropdown grows from its trigger button, not from the screen center) to preserve spatial continuity.

18.2.3 **Content Change Feedback** — skeleton-to-content swap on load (4.7.2.3), success/error toast entrance and exit, inline validation message appearance. Duration: mid tier.

18.2.4 **Page/View Transition** — navigating between screens. MUST be a simple cross-fade or subtral directional slide consistent platform-wide, MUST NOT vary transition style between Modules.

### 18.3 Prohibited Motion Categories

18.3.1 Ambient/looping animation (anything that moves without user action and without communicating a live data change) is prohibited everywhere, per 4.7.1.5.

18.3.2 Decorative entrance animation on static content (e.g., cards "flying in" one by one on page load) is prohibited; content MUST appear ready, not perform for the user.

18.3.3 Parallax scrolling effects are prohibited in all Data-Dense Surfaces and discouraged everywhere else in the application (informative: parallax has no functional purpose in a task-focused enterprise tool and directly contradicts "Calm" and "Fast").

### 18.4 Timing Scale

18.4.1 Three fixed duration tiers exist: **Instant/Fast** (state feedback, 18.2.1 — per 4.7.2.2, MUST NOT exceed 320ms), **Standard** (spatial transitions and content-change feedback, 18.2.2/18.2.3 — MUST NOT exceed 400ms per 4.7.2.2), **Deliberate** (reserved exclusively for onboarding/first-run walkthroughs where slightly slower pacing aids comprehension for new users — MUST NOT exceed 600ms and MUST NOT be used outside first-run contexts).

18.5 **Easing.** All transitions MUST use a decelerating ease-out curve for entrances (elements arriving MUST start fast and settle gently) and an accelerating ease-in curve for exits (elements leaving MUST start gently and accelerate away), never a linear curve (which reads as mechanical) and never a spring/bounce curve with overshoot (per 11.3.1, which would contradict the "Professional/Trustworthy" restraint values of 4.7.5).

### 18.6 Reduced Motion

18.6.1 The application MUST detect and respect the user's operating-system-level reduced-motion preference; when active, all Standard and Deliberate tier animations MUST collapse to instant (near-zero duration) opacity-only cross-fades, and all Instant/Fast tier state feedback MUST remain (since it communicates a state change that must still be perceptible, just without large-scale movement).

### 18.7 Anti-Patterns (Motion)

18.7.1 Never use ambient or looping decorative animation.
18.7.2 Never animate static content into view on page load purely for effect.
18.7.3 Never use spring/bounce easing with overshoot.
18.7.4 Never vary page-transition style between Modules.
18.7.5 Never ignore the operating system's reduced-motion preference.

### 18.8 Compliance Checklist (Chapter 18)

- [ ] Every animation in the application maps to one of the four permitted categories (18.2).
- [ ] No animation exceeds its tier's maximum duration.
- [ ] All entrances use ease-out; all exits use ease-in; no overshoot exists anywhere.
- [ ] Reduced-motion preference is respected application-wide.

---

## 19. Interaction States

### 19.1 Purpose and Design Rationale

19.1.1 Every interactive element must communicate, without ambiguity and without requiring the user to attempt the interaction, whether it is available, currently focused, being pressed, or unavailable. Interaction states exist to make the interface's affordances legible before commitment, which is what separates a professional tool from a prototype.

### 19.2 The Five Mandatory States

19.2.1 Every interactive component (button, input, navigation item, tab, checkbox, card-as-trigger, icon button) MUST define behavior for exactly these five states: **Idle** (default, at-rest appearance), **Hover** (pointer present, no action yet taken — desktop/mouse contexts only), **Active/Pressed** (currently being clicked/tapped, momentary), **Disabled** (unavailable, per current permissions or form state), **Focus** (keyboard-navigated to, regardless of pointer position).

### 19.3 Hover

19.3.1 Hover MUST produce a subtle, immediate (Instant/Fast tier, 18.4) visual change — typically a background lightening/darkening by one Neutral Scale step, or an elevation increase per 11.3.1 for card-like triggers — and MUST NOT change the element's size or position (which would cause adjacent layout to shift, a defect known as layout jank).

### 19.4 Active/Pressed

19.4.1 The Active state MUST visually read as "more pressed" than Hover — informatively, a slight further darkening or a slight scale-down (never scale-up, which reads as the element lifting rather than being pressed) — and MUST last only as long as the pointer/touch is held down, reverting immediately to Hover or Idle on release.

### 19.5 Focus

19.5.1 Focus MUST be indicated by a visible focus ring (a high-contrast outline, in Brand Primary or a dedicated high-contrast focus color, offset slightly from the element's edge) that meets WCAG 2.1 AA non-text contrast requirements against both the element and its background, in every color mode (light and dark).

19.5.2 Focus indication MUST NEVER be removed or suppressed for pointer users (i.e., a common but prohibited pattern of showing focus rings only for keyboard users while suppressing them on mouse click) is permitted ONLY via the standard `:focus-visible` behavior, where the ring appears for keyboard navigation and MAY be suppressed for a direct pointer click — this is the single permitted exception and MUST NOT be extended further (e.g., MUST NOT suppress focus rings for keyboard Tab navigation under any circumstance).

### 19.6 Disabled

19.6.1 Disabled elements MUST reduce to a fixed, defined opacity value applied uniformly platform-wide (not varying per component), MUST remove all Hover/Active/Focus behavior, MUST NOT be fully invisible (an element the user cannot interact with but can still see communicates "not available right now," while a hidden element communicates nothing and causes the user to wonder if a feature exists at all), and SHOULD include a tooltip or helper text explaining why the control is disabled where the reason is not otherwise obvious from context.

### 19.7 State Combination Rules

19.7.1 Disabled MUST override all other states (a disabled element cannot simultaneously show Hover or Focus feedback). Active MUST override Hover during the press. Focus MAY coexist visually with Hover (a keyboard-focused element that the pointer also happens to rest on shows both the focus ring and the hover background change).

### 19.8 Anti-Patterns (Interaction States)

19.8.1 Never omit the Focus state from any interactive component.
19.8.2 Never suppress keyboard focus indicators.
19.8.3 Never let Hover or Active change element size/position (layout jank).
19.8.4 Never render Disabled elements as fully invisible.
19.8.5 Never use a scale-up effect for the Active/Pressed state.

### 19.9 Compliance Checklist (Chapter 19)

- [ ] Every interactive component defines all five mandatory states.
- [ ] Every Focus ring meets WCAG AA non-text contrast in both light and dark mode.
- [ ] No Hover/Active state causes adjacent layout shift.
- [ ] Disabled elements are uniformly reduced in opacity, never hidden.

## 20. Module Personalities

### 20.1 Purpose

20.1.1 This chapter exists to solve a specific, narrow problem: a School ERP contains many functionally distinct Modules (Fee Management, Attendance, Library, Transport, Examinations, and so on), and users benefit from being able to tell, at a glance and without reading text, which Module they are currently inside — the same way a person can tell which room of a building they're in from ambient cues, without reading a room number. Without any differentiation, every screen in the ERP would look identical regardless of Module, which increases the cognitive cost of navigation because the user must rely entirely on reading text labels to reorient themselves.

20.1.2 At the same time, uncontrolled differentiation between Modules is the single greatest threat to the consistency requirements established in Chapter 5 (Design Constitution) and Chapter 9 (Color System). If each Module were allowed to invent its own colors, shadows, corner radii, or component shapes, the application would stop being one product and would instead read as many disconnected mini-products stitched together — which directly contradicts the "Professional/Trustworthy" and "Modern" design values (4.7.5, 4.7.6).

20.1.3 This chapter therefore exists to resolve that tension by defining the **narrowest possible channel** through which Module identity may be expressed, while leaving every structural, typographic, spacing, and material rule defined elsewhere in this specification completely untouched.

### 20.2 Definitions

20.2.1 **Module Personality** — as defined in 3.12, the permitted narrow variation in accent color and iconography assigned to a Module.

20.2.2 **Module Accent** — as defined in 9.2.8, a single hue variation permitted per Module, used only for the Module's icon and active-navigation indicator.

20.2.3 **Structural Rule** — any rule in Chapters 6–19 governing layout, spacing, typography scale, elevation, motion, or component anatomy. Structural Rules are explicitly **not** subject to Module Personality variation.

20.2.4 **Identity Rule** — the narrow set of rules defined in this chapter (accent hue, icon glyph choice within the single approved icon family) that **are** subject to Module Personality variation.

### 20.3 Design Rationale

20.3.1 The distinction between a Structural Rule and an Identity Rule is the entire mechanism by which this chapter avoids contradicting Chapter 5. A Module is permitted to say "I am the Fee Management module" through a consistent accent hue on its icon and active-nav-indicator — a signal a user absorbs peripherally, without reading — but it is never permitted to say "I am also allowed a different card shadow, a different button shape, or a different type scale," because those differences would need to be consciously read and compared to be noticed, which is cognitively expensive and undermines the "Calm" and "Effortless" values rather than serving them.

20.3.2 Informative analogy (non-normative): consider an airport. Every terminal uses identical signage typography, identical floor materials, and identical gate-desk furniture — but each airline may have its own logo color at its own check-in desk. The traveler never confuses which airline they're at, and the airport never feels visually chaotic. This chapter enforces the same relationship between the ERP's Modules and its shared structural system.

### 20.4 Rendering Rules

20.4.1 Each Module MUST be assigned exactly one Module Accent hue, drawn from a reserved sub-palette that is visually distinct from Brand Primary, Brand Secondary, and all four Semantic hues (9.2.4–9.2.7), so that a Module Accent can never be mistaken for a status/semantic signal.

20.4.2 A Module Accent MUST be used only in the following two locations: (a) the Module's icon in the sidebar navigation and in any Module-identifying badge/breadcrumb context, and (b) the active-state left-edge indicator bar and icon fill for that Module's navigation item (16.2.3). A Module Accent MUST NOT be used for: buttons of any tier, form field borders, table headers, chart series, backgrounds of any Surface, or body text color.

20.4.3 Where a Module's own internal content requires a chart (e.g., an attendance trend chart inside the Attendance Module), that chart MUST use the standard semantic/neutral chart color rules of Chapter 9 and Chapter 15.5, NOT the Module Accent — a chart communicates data meaning (up/down, good/bad), and conflating that meaning with a mere navigational identity color would violate 9.4 (Semantic Color Consistency).

20.4.4 All Structural Rules (Chapters 6–19) apply identically and without exception inside every Module. A Module MUST NOT introduce its own spacing scale, its own shadow depth, its own corner radius, its own type scale, its own Material rules, or its own motion timing.

### 20.5 Decision Logic

20.5.1 When the rendering agent encounters a new visual decision while generating a screen within a given Module, it MUST apply the following test, in order:

```
IF the decision concerns layout, spacing, elevation, typography scale,
   motion, or component anatomy (i.e., it is a Structural Rule):
    THEN apply the platform-wide rule from Chapters 6–19 exactly,
         with NO Module-specific variation permitted.

ELSE IF the decision concerns which color appears on the Module's own
   icon or active-navigation indicator (i.e., it is an Identity Rule):
    THEN apply this Module's assigned Module Accent hue.

ELSE IF the decision concerns a semantic meaning (status, severity,
   chart series, validation state):
    THEN apply the Chapter 9 semantic color rules; Module Accent
         MUST NOT be substituted, even if the Module has a strong
         thematic association with that color.

ELSE:
    THEN treat the decision as an unresolved gap per Rule 5.5 and flag
         it rather than inventing a Module-specific default.
```

### 20.6 Proportional and Quantitative Relationships

20.6.1 The reserved Module Accent sub-palette MUST contain enough distinguishable hues to cover every Module listed in Scope (2.1.3) with a minimum perceptual hue separation between adjacent Modules' accents sufficient to distinguish them in a collapsed icon-only sidebar rail (7.6.2) at Small icon size (14.3.2) — informatively, this requires hues spaced apart on the color wheel by a wide enough margin that they remain distinguishable at small size and low saturation, not merely distinguishable in a large isolated swatch.

20.6.2 No more than one Module Accent hue may be "spent" per Module; a Module MUST NOT combine two accent hues (e.g., a gradient) to expand its identity, per 10.3.2 (prohibition on multi-hue gradients) and 5.6 (Consistency Over Novelty).

### 20.7 Allowed Variations

20.7.1 A Module MAY select which specific icon glyph (from the single approved icon family, Chapter 14) best represents its function, provided the glyph is unique to that Module across the whole application (14.5.1).

20.7.2 A Module MAY select its assigned Module Accent hue from the reserved sub-palette at implementation time, provided no two Modules share a hue and the separation rule in 20.6.1 is respected.

### 20.8 Prohibited Variations

20.8.1 A Module MUST NOT alter card corner radius, shadow depth, spacing scale, type scale, button shape, or Material choice relative to any other Module.

20.8.2 A Module MUST NOT use its Module Accent hue as a background fill, button color, or chart series color under any circumstance.

20.8.3 A Module MUST NOT introduce a decorative illustration style, mascot, or thematic imagery unique to itself (e.g., a "bus" motif image treatment exclusive to Transport) beyond its single approved icon glyph, as this would reintroduce the multi-product visual fragmentation this chapter exists to prevent (20.1.2).

### 20.9 Anti-Patterns

20.9.1 Never let a Module's accent color leak into a button, form field, or table.
20.9.2 Never assign the same Module Accent hue to two different Modules.
20.9.3 Never use a Module Accent hue that overlaps perceptually with a Semantic hue (Chapter 9), even if technically a distinct value, since a user must never wonder whether an icon color is signaling "this is the Library module" or "this item has an error."
20.9.4 Never allow a Module's internal charts to substitute Module Accent for the standard semantic chart color rules.
20.9.5 Never introduce Module-specific structural variation (spacing, radius, shadow, type) under the justification of "personality."

### 20.10 Accessibility Considerations

20.10.1 Because Module Accent is the only Module-differentiating signal, it MUST NOT be the sole means of distinguishing one Module's navigation item from another for users with color vision deficiency; each Module's unique, non-reused icon glyph (20.7.1) serves as the required redundant, non-color signal, and this glyph uniqueness is therefore an accessibility requirement, not merely an aesthetic one.

20.10.2 Module Accent hues MUST individually meet the same non-text contrast minimums required of any icon/indicator color against its background (Chapter 22), in both light and dark mode, for every Module in the reserved sub-palette — a hue that fails contrast in dark mode MUST be adjusted per the dark-mode rules in 9.7.2 rather than replaced with an unrelated hue.

### 20.11 Responsive Behavior

20.11.1 Module Personality signals MUST remain visible even in the collapsed icon-only sidebar rail state (7.6.2): the Module Accent on the icon and the unique glyph both persist at Small icon size; only the text label is removed at that breakpoint, per 16.6.1.

### 20.12 Compliance Checklist (Chapter 20)

- [ ] Every Module has exactly one assigned Module Accent hue, unique platform-wide.
- [ ] No Module Accent hue is used on any button, form field, background, or chart series.
- [ ] Every Module's icon glyph is unique and never reused elsewhere in the application.
- [ ] All Structural Rules (Chapters 6–19) are identical across every Module with zero exceptions.
- [ ] Module Accent hues meet contrast minimums in both light and dark mode.

### 20.13 Cross-References

20.13.1 See Chapter 9 (Color System) for the base Role taxonomy that Module Accent is a sub-category of (9.2.8). See Chapter 14 (Iconography) for icon family and glyph-uniqueness rules (14.5.1). See Chapter 16 (Navigation) for how the active-state indicator (16.2.3) combines with Module Accent. See Chapter 22 (Accessibility) for the contrast minimums referenced in 20.10.2. See Chapter 5 (Design Constitution, Rule 5.6, Consistency Over Novelty) for the overriding principle this entire chapter exists to serve without violating.

## 21. Master Anti-Pattern Index

### 21.1 Purpose

21.1.1 Individual anti-pattern lists appear at the end of each preceding chapter so that a rendering agent working within a single topic (e.g., only touching typography) has immediate, local access to relevant prohibitions. This chapter exists for a different purpose: to consolidate every prohibition across the entire specification into one flat, searchable index, because some failure modes span multiple chapters simultaneously and are easiest to catch when checked as a single pass against a finished screen, rather than chapter-by-chapter during construction.

21.1.2 This chapter is not exhaustive on its own; it is a cross-reference index. Where a discrepancy exists between an entry here and the fuller rule in its source chapter, the source chapter governs (this index is a convenience layer, not a new source of authority).

### 21.2 Design Rationale

21.2.1 Most visually "off" enterprise interfaces fail not because of one dramatic error but because of an accumulation of small, individually-plausible violations (a slightly-too-decorative gradient here, a second competing focal point there, one table using dividers while another uses stripes). A single consolidated checklist run at the end of screen generation catches this class of cumulative failure that no single chapter's local anti-pattern list can catch alone, because no single chapter can see the whole screen.

### 21.3 Consolidated Prohibitions (By Category)

**Hierarchy and Composition (Chapters 5–7)**
21.3.1 Never present more than one Focal Point per screen.
21.3.2 Never let hierarchy depend on color alone; it must survive grayscale.
21.3.3 Never introduce more than four hierarchy tiers on one screen.
21.3.4 Never let sidebar width compete with Canvas dominance.
21.3.5 Never let ungrouped, loose elements imply a relationship that a shared Surface should express instead.

**Materials (Chapter 8)**
21.3.6 Never use Glass Material behind or within a Data-Dense Surface.
21.3.7 Never nest Glass Material inside Glass Material.
21.3.8 Never use Glass as the sole background of a Destructive confirmation.
21.3.9 Never allow Glass fill opacity to compromise WCAG AA text contrast.

**Color (Chapter 9)**
21.3.10 Never use more than one Brand Primary hue.
21.3.11 Never repurpose a semantic hue for decorative use.
21.3.12 Never distinguish chart series by hue alone without pattern/label backup.
21.3.13 Never produce dark mode via naive color inversion.

**Gradients (Chapter 10)**
21.3.14 Never place a decorative gradient behind dense information.
21.3.15 Never use a multi-hue gradient outside the single permitted avatar-placeholder case.
21.3.16 Never use a diagonal gradient anywhere in the application.

**Elevation and Shadows (Chapter 11)**
21.3.17 Never use a hard-edged, high-opacity shadow.
21.3.18 Never mix light-source direction between components.
21.3.19 Never let a lower-Elevation element render above a higher-Elevation element.

**Typography (Chapter 12)**
21.3.20 Never use more than two typeface families.
21.3.21 Never justify or center-align paragraph text.
21.3.22 Never differentiate same-scale, same-weight text by color alone.
21.3.23 Never exceed the defined maximum line-length measure.

**Spacing (Chapter 13)**
21.3.24 Never use a spacing value outside the defined scale.
21.3.25 Never let inner padding exceed outer margin at the same nesting level.
21.3.26 Never mix Density Tiers within a single Surface.

**Iconography (Chapter 14)**
21.3.27 Never mix two icon families.
21.3.28 Never reuse one icon glyph for two different meanings.
21.3.29 Never ship an icon-only control without an accessible text alternative.

**Dashboards (Chapter 15)**
21.3.30 Never render an empty Attention Zone as a visible empty shell.
21.3.31 Never exceed four stat cards per row at desktop.
21.3.32 Never present more than one primary chart per dashboard.

**Navigation (Chapter 16)**
21.3.33 Never indicate active navigation state through color alone.
21.3.34 Never let navigation labels wrap to a second line.
21.3.35 Never vary the top bar's utility order between screens.

**Core Components (Chapter 17)**
21.3.36 Never place two Primary-tier buttons in one Surface.
21.3.37 Never use placeholder text as a field's only label.
21.3.38 Never validate a text field on every keystroke.
21.3.39 Never pre-focus a Destructive confirmation's destructive button.
21.3.40 Never render identical empty-state treatment for "no data," "filtered," and "error" cases.
21.3.41 Never allow uneven card heights within one grid row.

**Motion (Chapter 18)**
21.3.42 Never use ambient/looping decorative animation.
21.3.43 Never animate static content into view purely for effect on load.
21.3.44 Never use spring/bounce easing with overshoot.
21.3.45 Never ignore the operating system's reduced-motion preference.

**Interaction States (Chapter 19)**
21.3.46 Never omit the Focus state from any interactive component.
21.3.47 Never suppress keyboard focus indicators.
21.3.48 Never let Hover/Active cause layout shift.
21.3.49 Never render Disabled elements as fully invisible.

**Module Personalities (Chapter 20)**
21.3.50 Never let a Module Accent hue leak into buttons, forms, or backgrounds.
21.3.51 Never assign the same Module Accent to two Modules.
21.3.52 Never introduce Module-specific structural (spacing/radius/shadow/type) variation.

### 21.4 Decision Logic for Applying This Index

```
WHEN a screen is considered complete (per its own chapter-level checks):
  FOR EACH category in 21.3:
    Run every listed prohibition against the finished screen as a whole,
    not just against the component that originally introduced it.
  IF any prohibition is violated:
    Return to the governing chapter, correct the violation, and re-run
    the FULL index (not just the corrected category), since fixing one
    violation can sometimes introduce another (e.g., correcting a
    hierarchy violation by adding a second color accent could
    inadvertently violate 21.3.10, "only one Brand Primary hue").
  ELSE:
    Proceed to Chapter 23 (Quality Assurance) for full compliance sign-off.
```

### 21.5 Compliance Checklist (Chapter 21)

- [ ] Every prohibition listed in 21.3 has been checked against the completed screen as a whole.
- [ ] No fix applied during this pass introduced a new violation elsewhere in the index.

### 21.6 Cross-References

21.6.1 Every entry in 21.3 traces to its full explanation in its source chapter (5 through 20); this chapter is intentionally terse and non-authoritative on its own, per 21.1.2.

---

## 22. Accessibility

### 22.1 Purpose

22.1.1 Accessibility rules in this specification exist to guarantee that every user — regardless of visual acuity, color perception, motor precision, or assistive technology used — can perceive, understand, and operate every screen the rendering agent produces. Per the Design Constitution (5.4), accessibility requirements are never optional and automatically override any conflicting aesthetic preference expressed elsewhere in this document.

22.1.2 Because a School ERP is used by a wide, mandatory population (teachers, parents, administrators, students, some of whom will have visual, motor, or cognitive impairments, and none of whom chose to opt into this specific software the way a consumer might choose a discretionary app), accessibility compliance is treated in this specification as equivalent in seriousness to functional correctness — an inaccessible screen is a broken screen, not a lower-quality one.

### 22.2 Definitions

22.2.1 **WCAG 2.1 AA** — the Web Content Accessibility Guidelines, version 2.1, conformance level AA, the baseline standard this entire specification targets.

22.2.2 **Contrast Ratio** — the measured luminance difference between foreground content (text, icons, meaningful borders) and its immediate background, expressed as a ratio (e.g., 4.5:1).

22.2.3 **Non-Text Contrast** — the contrast requirement applying to meaningful graphical elements that are not text (icons, focus rings, input borders, chart elements), distinct from and slightly more lenient than text contrast requirements.

22.2.4 **Assistive Technology (AT)** — screen readers, switch devices, voice control software, and similar tools used by AT-dependent users to operate the interface.

### 22.3 Rendering Rules — Contrast and Color

22.3.1 All Body-scale and larger text MUST maintain a minimum 4.5:1 contrast ratio against its immediate background in both light and dark mode; large-scale text (Heading steps at or above a defined size/weight threshold) MUST maintain a minimum 3:1 ratio.

22.3.2 All Non-Text meaningful elements (icons carrying meaning, input borders, focus rings, chart lines/bars) MUST maintain a minimum 3:1 contrast ratio against their immediate background.

22.3.3 No information may be conveyed by color alone anywhere in the application (per 5.4, 9.1.1, 12.10.4, 21.3.22); every color-coded meaning MUST carry a redundant non-color signal (icon, text label, pattern, or position).

22.3.4 The application MUST support both light and dark mode at full contrast compliance; contrast MUST be independently verified in each mode, since a value compliant in one mode is not guaranteed compliant in the other (per 9.7).

### 22.4 Rendering Rules — Keyboard and Focus

22.4.1 Every interactive element MUST be reachable and operable via keyboard alone, in a logical tab order matching the visual reading-flow order defined in 7.10 (top-to-bottom, left-to-right).

22.4.2 Every interactive element MUST expose a visible Focus state per Chapter 19.5, meeting the Non-Text Contrast minimum (22.3.2) in both color modes.

22.4.3 Modal dialogs (17.4) MUST trap keyboard focus within the modal while open (Tab cycling MUST NOT escape to background content) and MUST return focus to the triggering element upon close.

22.4.4 Skip-navigation functionality MUST be available to allow keyboard users to bypass the sidebar and top bar and move directly to the Canvas's primary content on each screen.

### 22.5 Rendering Rules — Assistive Technology and Semantics

22.5.1 Every icon-only control (14.6.1, 17.1.6) MUST expose an accessible text label (e.g., via an accessible-name attribute) even though no visible text label is rendered, so AT users receive the same information sighted users receive from the icon's conventional meaning.

22.5.2 Every form field MUST be programmatically associated with its visible label (22.5 depends on 17.2.2's requirement that labels are always visible, never placeholder-only) so AT announces the correct label when the field receives focus.

22.5.3 Status changes that occur without a full page navigation (form validation errors, toast notifications, inline save confirmations) MUST be announced to AT users via an appropriate live-region mechanism, since these users cannot rely on visually noticing the change.

22.5.4 Table structures (17.3) MUST use correct semantic table markup (row/column header associations) so AT users can navigate cell-by-cell with row/column context announced, rather than losing positional context in a large table.

### 22.6 Rendering Rules — Touch and Motor Access

22.6.1 Every interactive element MUST expose a minimum touch-target hit area sufficient for reliable touch interaction (informative industry baseline: no smaller than approximately 44×44 device-independent pixels), regardless of the element's visible glyph or label size — this is one of the few fixed, non-proportional minimums permitted under 13.7.1, because motor accessibility requires an absolute physical minimum rather than a value proportional to its container.

22.6.2 Adjacent interactive elements (e.g., row action icon buttons in a table, 17.3.6) MUST maintain sufficient spacing between their hit areas to prevent accidental mis-taps, drawn from the spacing scale (Chapter 13) at a step appropriate to the Density Tier in use.

### 22.7 Rendering Rules — Motion and Cognitive Load

22.7.1 Per Chapter 18.6, all motion MUST respect the user's reduced-motion preference at the operating-system level.

22.7.2 Time-limited interactions (e.g., a session timeout, an auto-advancing carousel if one is ever introduced) MUST provide the user a way to extend, pause, or disable the time limit; auto-advancing decorative content is separately prohibited outright per 18.3.1 regardless of this rule.

22.7.3 Error messages (17.2.3) MUST describe the problem and, wherever possible, the corrective action in plain language, rather than a generic, unhelpful message, to reduce cognitive burden on users who may already be under stress (e.g., a parent trying to complete a fee payment before a deadline).

### 22.8 Decision Logic

```
WHEN rendering any interactive element:
  CHECK: does it have a visible Focus state meeting Non-Text Contrast? 
    IF NO → non-compliant, add per 19.5 / 22.4.2.
  CHECK: is it operable via keyboard alone, in logical tab order?
    IF NO → non-compliant, fix per 22.4.1.
  CHECK: does it convey any information via color alone?
    IF YES → non-compliant, add redundant non-color signal per 22.3.3.
  CHECK: is its hit area at least the minimum touch-target size?
    IF NO → non-compliant, expand hit area per 22.6.1 (glyph size unchanged).
  CHECK: if icon-only, does it expose an accessible text label?
    IF NO → non-compliant, add per 22.5.1.
  IF all checks pass → element is accessibility-compliant.
```

### 22.9 Allowed Variations

22.9.1 Visible focus ring color MAY differ between light and dark mode, provided both independently meet the Non-Text Contrast minimum against their respective backgrounds.

22.9.2 Touch-target hit area MAY extend invisibly beyond a control's visible boundary to meet the minimum size, without changing the control's rendered visual size, per 22.6.1.

### 22.10 Prohibited Variations

22.10.1 Contrast minimums MUST NOT be reduced for any Module, any Density Tier, or any "premium-looking" low-contrast aesthetic treatment; no aesthetic justification overrides Chapter 22 (per 5.4).

22.10.2 Keyboard focus indicators MUST NOT be removed for any control, including custom-styled controls that replace native browser elements.

### 22.11 Anti-Patterns

22.11.1 Never rely on color alone to convey meaning anywhere in the application.
22.11.2 Never suppress or remove the visible keyboard focus indicator.
22.11.3 Never ship an icon-only control without an accessible name.
22.11.4 Never trap keyboard focus outside of an intentionally modal context (only modals, 17.4.3, may trap focus; everything else must allow normal tab flow).
22.11.5 Never reduce a contrast ratio below the Chapter 22.3 minimums for aesthetic reasons.
22.11.6 Never build a custom interactive control without an equivalent semantic role/label for Assistive Technology.

### 22.12 Compliance Checklist (Chapter 22)

- [ ] All text and non-text elements meet their respective contrast minimums in both light and dark mode.
- [ ] Every interactive element is reachable and operable by keyboard alone, in logical order.
- [ ] No information anywhere in the application depends on color alone.
- [ ] All icon-only controls expose accessible text labels.
- [ ] All touch targets meet the minimum hit-area size regardless of visible glyph size.
- [ ] Modals trap and correctly return focus; no other component traps focus.
- [ ] All motion respects the reduced-motion system preference.

### 22.13 Cross-References

22.13.1 See 5.4 (Design Constitution) for the overriding authority of this chapter. See 9.7 (Dark Mode Color Inversion) for mode-specific contrast implications. See 14.6.1 and 17.1.6 for icon-button accessible-label requirements. See 17.4.3 for modal focus-trapping. See 18.6 for reduced-motion behavior. See 21.3.46–21.3.49 for the consolidated interaction-state anti-patterns this chapter depends on.

## 23. Quality Assurance and Compliance Framework

### 23.1 Purpose

23.1.1 Every preceding chapter defines rules and ends with a local compliance checklist. This chapter exists to define how those local checklists combine into a single, formal sign-off procedure that determines whether a generated screen is considered finished. Without this chapter, "compliance" would remain a diffuse property scattered across twenty-two checklists with no defined order of operations and no defined resolution procedure when checklists conflict or when a fix in one area breaks compliance in another (as noted in 21.4).

23.1.2 This chapter's deeper purpose is to make compliance **testable by a non-creative agent**. A rendering agent with no design judgment cannot evaluate "does this feel premium," but it can mechanically evaluate "does every text/background pair meet its contrast ratio," "does exactly one Focal Point exist," and "does every interactive element expose five states." This chapter converts the entire specification into that mechanically testable form.

### 23.2 Definitions

23.2.1 **Compliance Pass** — a single, complete run of every applicable chapter checklist (Chapters 6 through 22) against one finished screen.

23.2.2 **Blocking Violation** — any failure of a MUST/MUST NOT/SHALL/SHALL NOT rule; a screen containing any Blocking Violation is not compliant and MUST NOT be considered complete.

23.2.3 **Advisory Violation** — any failure of a SHOULD/SHOULD NOT rule; a screen containing only Advisory Violations MAY be considered provisionally complete but MUST have the violation documented and flagged for review, since SHOULD-level rules represent strong defaults with narrow, specification-defined exceptions rather than absolute prohibitions.

23.2.4 **Regression** — a new Blocking or Advisory Violation introduced while correcting a previously identified violation, as described in 21.4.

### 23.3 Design Rationale

23.3.1 The QA model in this chapter deliberately mirrors software testing practice (unit checks per component, integration checks across the whole screen, regression checks after any fix) rather than a traditional design-review practice (a human aesthetic critique), because the rendering agent consuming this specification has no capacity for aesthetic critique. Every "review" performed under this chapter must be reducible to a yes/no check against an explicit rule.

### 23.4 Rendering Rules — The Compliance Pass Sequence

23.4.1 A Compliance Pass MUST be run in the following fixed order, and MUST NOT be reordered, because later checks assume earlier ones have already passed (e.g., the Master Anti-Pattern Index in Chapter 21 assumes the individual chapters it consolidates have already been checked once):

23.4.1.1 **Structural Pass** — Chapters 6 (Visual Hierarchy) and 7 (Composition/Grid): confirm exactly one Focal Point, confirm grid/proportion compliance, confirm Canvas dominance.

23.4.1.2 **Material and Surface Pass** — Chapter 8 (Materials), Chapter 11 (Elevation): confirm every Surface's Material and Elevation assignment is correct for its content type.

23.4.1.3 **Color and Type Pass** — Chapters 9 (Color), 10 (Gradients), 12 (Typography): confirm role-correct color usage, permitted-only gradient usage, and type-scale/weight compliance.

23.4.1.4 **Spacing Pass** — Chapter 13: confirm every spacing value traces to the defined scale and every outer/inner relationship holds.

23.4.1.5 **Component Pass** — Chapters 14 (Icons), 15 (Dashboards, if applicable), 16 (Navigation, if applicable), 17 (Core Components): confirm every component present on the screen matches its chapter's anatomy and state rules.

23.4.1.6 **Motion and Interaction Pass** — Chapters 18 (Motion), 19 (Interaction States): confirm every animation matches a permitted category/duration and every interactive element defines all five states.

23.4.1.7 **Identity Pass** — Chapter 20 (Module Personalities): confirm Module Accent usage is confined to its permitted Identity-Rule locations only.

23.4.1.8 **Consolidated Anti-Pattern Pass** — Chapter 21: run the full master index against the whole screen as a single unit, since this is the only pass capable of catching cross-chapter cumulative failures (21.2.1).

23.4.1.9 **Accessibility Pass** — Chapter 22: this pass is run last and is treated as an overriding gate — even a screen that fully passes Passes 23.4.1.1–23.4.1.8 MUST still fail the overall Compliance Pass if it fails Chapter 22, per the Design Constitution's accessibility-overrides-aesthetics rule (5.4).

23.4.2 A screen MUST NOT be marked complete until all nine passes in 23.4.1 report zero Blocking Violations.

### 23.5 Decision Logic — Handling Violations and Regressions

```
RUN Compliance Pass (23.4.1, in fixed order) ON the finished screen.

IF any Blocking Violation is found in any pass:
    Identify the governing chapter and rule number.
    Apply the correction specified by that chapter.
    RE-RUN the ENTIRE Compliance Pass from Pass 1 (23.4.1.1), not just
      the pass that found the violation, per the Regression definition
      (23.2.4) — a correction in one chapter can silently violate a
      rule in an earlier-numbered chapter that had already passed.
    REPEAT until zero Blocking Violations remain across all nine passes.

IF only Advisory Violations remain:
    Document each Advisory Violation and its governing SHOULD rule.
    Screen MAY be marked provisionally complete.

IF zero Blocking Violations and zero undocumented Advisory Violations remain:
    Mark the screen fully compliant.
```

23.5.1 This full-restart-on-any-fix procedure is intentionally conservative. It is more expensive than only re-checking the affected pass, but it is the only procedure that reliably catches Regressions (23.2.4), and reliability is prioritized over efficiency per this specification's core objective (determinism over speed of generation, per the Project's Quality Standard).

### 23.6 Proportional and Quantitative Relationships

23.6.1 A screen's Compliance Pass MUST report a Blocking Violation count of exactly zero and MUST enumerate every checked rule from Chapters 6–22 that was evaluated, not merely state "passed" without an itemized record, so that the pass itself is auditable by a human reviewer even though it was executed by a non-creative rendering agent.

### 23.7 Allowed Variations

23.7.1 The order of correction within a single Compliance Pass iteration (i.e., which Blocking Violation is fixed first if multiple are found in the same pass) MAY vary at the rendering agent's discretion, provided the full pass sequence (23.4.1) is still re-run from the beginning afterward.

### 23.8 Prohibited Variations

23.8.1 The nine-pass order in 23.4.1 MUST NOT be reordered or partially skipped, even for a screen believed to be simple, since the assumption chain described in 23.4.1 depends on strict ordering.

23.8.2 A screen MUST NOT be marked complete based on a partial Compliance Pass (e.g., stopping after Pass 5 because "the rest looked fine").

### 23.9 Anti-Patterns

23.9.1 Never mark a screen complete with any unresolved Blocking Violation.
23.9.2 Never re-check only the pass that found a violation instead of the full sequence.
23.9.3 Never treat an Advisory Violation as equivalent to a Blocking Violation, or vice versa.
23.9.4 Never skip the Accessibility Pass (23.4.1.9) or treat it as lower-priority than earlier passes.
23.9.5 Never report "compliant" without an itemized, auditable record of what was checked.

### 23.10 Compliance Checklist (Chapter 23 — Meta)

- [ ] All nine passes in 23.4.1 were executed, in order, for the screen under review.
- [ ] Zero Blocking Violations remain across every pass.
- [ ] Every Advisory Violation, if any, is explicitly documented with its governing rule.
- [ ] The full pass sequence was re-run in its entirety after every correction, with no partial re-checks.
- [ ] An itemized, auditable record of the Compliance Pass exists for this screen.

### 23.11 Cross-References

23.11.1 This chapter depends on and sequences every prior chapter's individual compliance checklist (Chapters 6.2–22.12). It is superseded in authority only by Chapter 5 (Design Constitution) and Chapter 22 (Accessibility), per 23.4.1.9.

---

## 24. Rendering Algorithm

### 24.1 Purpose

24.1.1 Chapters 1 through 23 define what correctness looks like. This chapter defines the actual sequence of operations the rendering agent follows to go from a feature request (e.g., "generate the Fee Management overdue-payments screen") to a finished, Chapter-23-compliant screen. Every prior chapter is a rule the agent consults; this chapter is the procedure that tells the agent when to consult which rule, in what order, so that no chapter is forgotten and no chapter is consulted out of a sequence that would force rework.

24.1.2 This chapter exists because a large rule set without an execution order still leaves room for a non-creative agent to become "stuck" — uncertain which decision to make first. This algorithm removes that uncertainty by defining a strict, linear (with defined loops) generation order.

### 24.2 Definitions

24.2.1 **Screen Request** — the input to this algorithm: a named screen, its Module, its primary user role, and its required content/data fields, as provided by whatever system invokes the rendering agent.

24.2.2 **Screen Skeleton** — the intermediate output of Stage 1 (24.4.1): the chosen zone/grid layout before any component-level detail is applied.

24.2.3 **Draft Screen** — the intermediate output after Stages 1–7 but before the Chapter 23 Compliance Pass has been run.

24.2.4 **Compliant Screen** — the final output: a Draft Screen that has passed every stage of the Chapter 23 Compliance Pass with zero Blocking Violations.

### 24.3 Design Rationale

24.3.1 The algorithm is deliberately structured to resolve Structural decisions (layout, grid, zones) before Material decisions, Material decisions before Color/Type decisions, and all of those before Motion/Interaction-state decisions. This order matches the dependency order of the specification itself: a component's Material choice depends on knowing whether it's inside a Data-Dense Surface (a Structural fact established first); a component's color depends on knowing its Material and hierarchy tier (established next); its motion depends on knowing its final component type (established last). Reversing this order would force the agent to make later-stage decisions before the information they depend on exists.

### 24.4 Rendering Rules — The Generation Stages

24.4.1 **Stage 1 — Classify the Screen.** Determine the screen's primary type (Dashboard, Data-Dense List/Table, Form, Detail/Profile View, Settings/Configuration) and its Module (for Chapter 20 Identity Rule assignment). This classification determines which component chapters (15, 17) are primarily in scope for the remaining stages.

24.4.2 **Stage 2 — Establish the Skeleton.** Apply Chapter 7 (Composition and Layout Grid): assign the sidebar, top bar, and Canvas regions; if the screen is a Dashboard, apply the Chapter 15.2 zone order; otherwise establish the Canvas's primary content region and any secondary panels.

24.4.3 **Stage 3 — Assign Materials and Elevation.** For every Surface identified in the Skeleton, apply Chapter 8 (Materials) to classify it as Glass-eligible or Solid-mandatory (per its content type — Data-Dense Surfaces are Solid-mandatory per 8.3.1), and apply Chapter 11 to assign its Elevation Level based on its stacking/floating function.

24.4.4 **Stage 4 — Establish Hierarchy.** Apply Chapter 6: identify the screen's single Focal Point (per 15.3 if the screen is a Dashboard, or per the equivalent judgment for other screen types — the most important action or piece of information on the screen), and assign hierarchy tiers (Primary/Secondary/Tertiary/Quiet, max four per 6.3) to every remaining element.

24.4.5 **Stage 5 — Apply Color and Typography.** Apply Chapter 9 (assign color Roles to every element per its hierarchy tier and semantic meaning), Chapter 10 (apply gradients only to permitted use cases, if any exist on this screen), Chapter 12 (assign Type Scale steps matching each element's hierarchy tier, per the weight-before-color ordering in 12.8), and Chapter 20 (apply Module Accent strictly to Identity-Rule locations only).

24.4.6 **Stage 6 — Apply Spacing.** Apply Chapter 13: assign a Density Tier to every Surface (13.6), then apply the outer-greater-than-or-equal-to-inner spacing rule (13.2) recursively from the Canvas margin down to the smallest nested component.

24.4.7 **Stage 7 — Populate Components.** Apply Chapter 14 (Iconography) and the relevant sections of Chapter 17 (Core Components) to render the actual buttons, forms, tables, cards, tabs, badges, or dialogs the Screen Request requires, following each component's specific anatomy rules. Apply Chapter 16 if the screen affects or introduces new navigation entries. This stage produces the Draft Screen.

24.4.8 **Stage 8 — Apply Motion and Interaction States.** Apply Chapter 18 (assign permitted motion categories and durations to any transitions the Draft Screen requires) and Chapter 19 (define all five interaction states for every interactive component introduced in Stage 7).

24.4.9 **Stage 9 — Run the Compliance Pass.** Apply Chapter 23 in full (all nine passes, in order) against the Draft Screen. Loop per 23.5's decision logic until zero Blocking Violations remain. The output of this stage is the Compliant Screen.

### 24.5 Decision Logic — Full Algorithm

```
INPUT: Screen Request (name, Module, role, required content fields)

STAGE 1: Classify screen type and Module.
STAGE 2: Build Screen Skeleton (Ch. 7, Ch. 15 if Dashboard).
STAGE 3: Assign Material + Elevation to every Surface (Ch. 8, Ch. 11).
STAGE 4: Assign single Focal Point + hierarchy tiers (Ch. 6).
STAGE 5: Assign color, type, gradients, Module Accent (Ch. 9, 10, 12, 20).
STAGE 6: Assign Density Tier + spacing recursively (Ch. 13).
STAGE 7: Populate actual components (Ch. 14, 16, 17) -> Draft Screen.
STAGE 8: Assign motion + interaction states (Ch. 18, 19).
STAGE 9: RUN Compliance Pass (Ch. 23):
    IF Blocking Violations found:
        Correct per governing chapter.
        RETURN to STAGE 9 (re-run full nine-pass sequence, per 23.5).
    ELSE:
        OUTPUT: Compliant Screen.

IF at any stage a required decision has no applicable rule anywhere in
  this specification (per Rule 5.5, No Silent Improvisation):
    HALT that stage.
    FLAG the gap with: stage number, element in question, and the
      nearest analogous rule considered.
    DO NOT invent a treatment to fill the gap.
```

24.5.1 This flagging behavior (the final IF block in 24.5) is the single most important failure-handling rule in the entire specification: it is what prevents the rendering agent from silently reintroducing subjective, undocumented design decisions — the exact failure mode this entire document exists to eliminate (per the Project's Fundamental Principle and Rule 5.5).

### 24.6 Allowed Variations

24.6.1 Stages 1 through 8 MAY be revisited iteratively during initial drafting (e.g., adjusting Stage 4's hierarchy assignment after seeing Stage 7's populated components reveals an imbalance) provided the final Draft Screen still satisfies every stage's rules before Stage 9 begins.

### 24.7 Prohibited Variations

24.7.1 Stage 9 (Compliance Pass) MUST NOT be skipped or abbreviated for any screen, regardless of the screen's perceived simplicity.

24.7.2 A screen MUST NOT be delivered as final output while still in Draft Screen state (i.e., before Stage 9 has reported zero Blocking Violations).

### 24.8 Anti-Patterns

24.8.1 Never assign color or typography (Stage 5) before the Skeleton and Material/Elevation stages (2–3) are complete, since later stages depend on facts established earlier.
24.8.2 Never invent a treatment to resolve a flagged gap (24.5) instead of halting and flagging it.
24.8.3 Never output a Draft Screen as if it were a Compliant Screen.
24.8.4 Never re-run only part of the Compliance Pass after a correction.

### 24.9 Compliance Checklist (Chapter 24)

- [ ] All nine stages were executed in order for this Screen Request.
- [ ] Any specification gap encountered was flagged, not silently resolved.
- [ ] The final output is a Compliant Screen (zero Blocking Violations across all nine Chapter 23 passes), not a Draft Screen.

### 24.10 Cross-References

24.10.1 This chapter is the operational synthesis of the entire specification: Stage 2 depends on Chapter 7 (and 15); Stage 3 on Chapters 8 and 11; Stage 4 on Chapter 6; Stage 5 on Chapters 9, 10, 12, and 20; Stage 6 on Chapter 13; Stage 7 on Chapters 14, 16, and 17; Stage 8 on Chapters 18 and 19; Stage 9 on Chapter 23 in full, which in turn depends on Chapter 21's consolidated index and Chapter 22's overriding accessibility gate. Rule 5.5 (Design Constitution, No Silent Improvisation) governs the gap-handling behavior in 24.5.

---

## 25. Perceptual Psychology and Visual Semantics

### 25.1 Purpose

25.1.1 Every preceding chapter tells the rendering agent *what* to render. This chapter exists to tell the rendering agent *why* those rules work on a human perceiver, so that when a future rule in this specification (or a gap not yet covered) requires the agent to reason from principle rather than from a lookup table, it reasons correctly rather than arbitrarily. A rule followed without understanding its perceptual basis is fragile — the moment a novel situation falls outside the letter of an existing rule, an agent with no underlying model will guess. An agent that understands *why* whitespace separates groups, or *why* a shadow reads as "above," can extend that principle correctly to a case this document has not explicitly enumerated, and then still flag it per Rule 5.5 rather than inventing something arbitrary — but its flag, and its interim reasoning, will be grounded rather than random.

25.1.2 This chapter is explanatory (informative) in nature but the conclusions it feeds into elsewhere in the specification remain normative. Where this chapter explains *why* Chapter 6, 7, 8, or 11 hold, those chapters' MUST/MUST NOT rules remain the binding requirement; this chapter is the reasoning underneath them, not a new source of independent obligation.

### 25.2 Why Position and Size Create Hierarchy (Underlying 6.1.1–6.1.2)

25.2.1 Human vision processes a scene through a fast, pre-attentive stage (occurring in a fraction of a second, before conscious "reading" begins) that registers position, size, contrast, and motion before any symbolic content (text, icon meaning) is consumed. This is why 6.1's priority order places Position and Size above Typographic Weight and Contrast: the eye's pre-attentive stage has already ranked elements by raw visual salience before the viewer starts reading labels. A rendering agent that gets position and size right has already won most of the hierarchy battle before a single word is read.

25.2.2 Top-left positioning (in left-to-right reading contexts) carries elevated perceived importance because reading behavior trained since early literacy acquisition treats the top-left as the canonical "start" of a scanned region — this is why 7.10 mandates that a Surface's primary label and title occupy the top-left position: it aligns the element that most needs early attention with the position the eye visits first by trained habit, rather than fighting that habit.

### 25.3 Why Whitespace Creates Hierarchy and Grouping (Underlying 6.1.5, 7.9, 13.4.2)

25.3.1 Perceptual grouping in human vision follows a small set of predictable principles collectively known (informatively) as Gestalt principles. The two most relevant to this specification are **Proximity** (elements placed close together are perceived as related; elements placed farther apart are perceived as unrelated, regardless of any other similarity) and **Common Region** (elements enclosed within a shared boundary — a card, a panel — are perceived as a single group even more strongly than proximity alone achieves).

25.3.2 This is the entire perceptual mechanism behind 7.9 (Containment: related content MUST share a Surface) and 13.4.2 (a heading's gap to its content MUST be smaller than the gap to the next unrelated heading). The rule is not aesthetic preference — it is a direct application of how human perception assigns relatedness. Violating it (placing unrelated content closer together than related content) does not merely look "less polished"; it actively causes the viewer to misjudge which pieces of information belong together, producing comprehension errors, not just taste-based disappointment.

25.3.3 Isolation (an element surrounded by more whitespace than its neighbors, per 6.1.5) increases perceived importance because pre-attentive vision treats "the only thing in this area" as inherently more salient than "one of several things competing in this area" — this is the perceptual basis for why 4.7.1.4 (Canvas margins) and 15.4.3 (max four stat cards per row) both function: too little isolation between elements collapses their individual salience, and beyond a certain point, adding more elements to a region does not add more information the viewer can register — it only dilutes the salience each individual element receives.

### 25.4 Why Elevation and Shadow Communicate Depth (Underlying Chapter 11)

25.4.1 Human depth perception relies heavily on a lifetime of exposure to a physical world illuminated from above (the sun, and by extension nearly all built overhead lighting). A shape with a soft shadow cast beneath and slightly offset from it is interpreted, almost involuntarily, as physically raised above the surface behind it — because that is the only physical configuration that produces that specific lighting pattern in the real world the viewer has learned to interpret since infancy.

25.4.2 This is why 11.2.3 mandates a single, consistent, downward-only shadow offset platform-wide: a shadow offset in an inconsistent direction, or an upward shadow, contradicts the single-overhead-light-source assumption the viewer's visual system has been trained on their entire life, producing a subtle but real sense that "something is wrong" with the surface even if the viewer cannot articulate why. Consistency of light-source direction is therefore not a stylistic preference; it is a precondition for the depth illusion to register as coherent at all.

25.4.3 Elevation communicates *importance*, not merely *position*, because in the physical intuition described above, an object that is closer to the viewer (higher, more raised) is also the object most immediately available for the viewer to interact with. This is why Chapter 11 assigns modals (which demand immediate, focused interaction) the highest Elevation Level, and static, non-interactive dividers the lowest — the elevation scale is a direct encoding of "how immediately does this demand your attention and hands," not an arbitrary decorative stack order.

### 25.5 Why Opacity and Blur Communicate Layering and Temporariness (Underlying Chapter 8)

25.5.1 A fully opaque surface reads, perceptually, as a permanent, solid object — the same way a solid wall or a printed page reads as fixed and unchanging. A translucent surface, by contrast, reads as something interposed *between* the viewer and another layer that continues to exist behind it — the same intuition a person applies to frosted glass, fog, or a sheer curtain in the physical world: the thing behind a translucent surface is still there, still relevant, just temporarily obscured or backgrounded.

25.5.2 This is precisely why Chapter 8 restricts Glass Material to surfaces that are conceptually temporary, contextual, or floating above ongoing content (a notification, a top bar hovering over scrolling content, a "what's new" panel) and strictly prohibits it for Data-Dense Surfaces (8.3.1): a data table is not conceptually temporary or secondary to something happening behind it — it *is* the primary content the user came to interact with, and dressing it in a Material treatment that perceptually signals "temporary, in front of something more permanent" actively contradicts its actual role, producing a subtle, hard-to-articulate but real usability friction where the interface's visual signals disagree with its functional truth.

25.5.3 Blur specifically communicates that the layer behind is *still present but not currently the focus* — sharp edges are how the visual system identifies "the thing I should be looking at right now"; removing that sharpness from the background is what allows the eye to disengage from it without the background disappearing outright (which would instead communicate "gone" or "hidden," a different and stronger signal reserved for content that has actually been dismissed or removed, not merely backgrounded). This is why 8.4.1 requires blur strong enough that background text becomes illegible: a legible-but-blurred background invites the eye to keep trying to read it, which defeats the entire purpose of backgrounding it in the first place.

### 25.6 Why Borders Matter More on Translucent Materials (Underlying 8.4.3, "Border contrast should exceed shadow contrast on translucent materials")

25.6.1 On a Solid Surface, the edge of the surface is defined primarily by the abrupt change in color/luminance between the surface and its background — the fill itself does most of the work of communicating "here is where this object ends." On a Glass Surface, by design, the fill is low-opacity and therefore does *not* produce a strong luminance break against its background (a busy or similarly colored background behind a Glass Surface can produce almost no fill-based edge at all). Because the surface's own fill can no longer be relied upon to communicate its boundary, the border becomes the primary — sometimes the *only* — reliable cue for where the Glass Surface begins and ends.

25.6.2 This is why 8.4.3 mandates a visible hairline border on every Glass Surface at a brightness distinctly above its fill, and why border contrast on a translucent Material must exceed the contrast contribution a shadow alone would provide beneath a Solid Surface: a Solid Surface can rely on shadow *and* fill-contrast together to define its boundary; a Glass Surface has effectively lost one of those two channels and must compensate by strengthening the remaining one. Skipping or under-specifying the border on a Glass Surface does not produce a "cleaner, more minimal" result — it produces a surface whose boundary is genuinely ambiguous to the eye, which is a comprehension failure, not a stylistic risk.

### 25.7 Why Typography Weight and Scale Guide Scanning (Underlying 12.6.2, 12.8)

25.7.1 Reading is not a linear, left-to-right consumption of every character in sequence when a user is scanning (as opposed to deep-reading) a screen; scanning is closer to a search process where the eye jumps between high-salience anchors (headings, bolded terms, large numerals) and only drops into linear reading once it has located the anchor relevant to its current goal. This is why 12.8 mandates that hierarchy differentiation apply scale and weight *before* color: scale and weight changes are detectable in the same fast, pre-attentive visual stage described in 25.2.1, while color requires slightly more processing to register as *meaningfully different* (as opposed to merely "a different color exists somewhere on this screen") — weight and size are read by the scanning eye before color is consciously parsed as informative.

25.7.2 This is also why 4.7.5.2 requires typographic weight to establish hierarchy before color: a heavier weight at the same size reads as "more important" through the same evolved edge-detection machinery used for object recognition generally (a bolder shape has a stronger, more continuous edge, which is easier for the visual system to lock onto), whereas color differences of equal salience require the viewer to have already fixated on the region to register the hue difference as meaningful.

### 25.8 A Semantic Glossary — What Each Rendering Treatment Communicates

25.8.1 This table is informative and exists to make explicit, in one place, the meaning each major rendering decision carries — so that a rendering agent applying a treatment for a *new* situation this document has not explicitly enumerated can select the treatment whose communicated meaning actually matches the situation, rather than selecting a treatment for its appearance alone.

| Treatment | Perceptual/Semantic Meaning | Correct Use | Incorrect Use |
|---|---|---|---|
| Glass Material | "This is temporary, contextual, or floats above something ongoing behind it." | Top bar, floating notifications, onboarding overlays | Any Data-Dense Surface, any Destructive confirmation |
| Solid Material | "This is the primary, permanent content itself." | Forms, tables, ledgers, confirmation dialogs | Purely decorative chrome with no informational permanence |
| Higher Elevation | "This demands more immediate attention/interaction than what's beneath it." | Modals, active dropdowns, hovered cards | Static, non-interactive decorative elements |
| Reduced Opacity (Disabled) | "This exists and may become available, but is not actionable right now." | Disabled buttons/fields pending a precondition | Hiding a feature the user should not know exists at all (use removal, not disabling) |
| Large Type Scale | "Start here; this is the entry point to this content." | Page titles, Display-scale dashboard numerals | Body copy that is not actually an entry point |
| Muted/Caption Type | "This is supporting, secondary information — read it after the primary content." | Timestamps, helper text, metadata | Any information the user needs to complete their task correctly |
| Isolation (extra whitespace) | "This is the one thing to look at in this region." | A single Focal Point per screen | Multiple simultaneously isolated elements (produces competing Focal Points, 5.1) |
| Semantic Color (Error/Warning/Success) | "This is a status the system is telling you about, independent of navigation or branding." | Validation states, alerts, badges | Module identity, decorative accents |
| Module Accent Color | "You are currently inside this specific functional area." | Sidebar icon and active-nav-indicator only | Anywhere a semantic or brand meaning is required |

### 25.9 Decision Logic — Reasoning From Semantics When a Rule Gap Exists

```
WHEN the rendering agent encounters a visual decision not explicitly
  covered by a specific rule in Chapters 1–24:

  STEP 1: Identify what this element's TRUE FUNCTIONAL ROLE is
          (e.g., "this is primary, permanent content the user must act on").

  STEP 2: Consult the Semantic Glossary (25.8) and this chapter's
          perceptual explanations (25.2–25.7) to identify which
          existing treatment's MEANING matches that functional role
          — not which treatment merely looks similar to nearby elements.

  STEP 3: Apply the Structural, Material, and Color rules already
          defined elsewhere in this specification for that meaning
          (e.g., if Step 2 concludes "this is primary, permanent
          content," apply Solid Material per Ch. 8, not Glass, even
          if a visually similar neighboring element happens to use Glass
          for a different, temporary reason).

  STEP 4: Per Rule 5.5, still FLAG the gap — this reasoning process
          produces a principled interim decision, not a license to
          skip documentation. A future revision of this specification
          MUST formally adopt or correct the interim decision.
```

### 25.10 Anti-Patterns

25.10.1 Never select a Material or Elevation treatment because it "looks nice" for a given surface without first identifying what that treatment perceptually communicates and confirming that meaning matches the surface's true functional role.

25.10.2 Never treat this chapter's explanations as license to override a binding MUST/MUST NOT rule elsewhere in the specification; where an explicit rule exists, it governs regardless of this chapter's reasoning (25.1.2).

25.10.3 Never apply Glass Material to a surface merely because a neighboring, differently-purposed surface uses Glass — match the treatment to the meaning (25.8), not to visual proximity.

### 25.11 Compliance Checklist (Chapter 25)

- [ ] For any decision made via the 25.9 gap-reasoning procedure, the element's true functional role was explicitly identified before a treatment was chosen.
- [ ] The chosen treatment's semantic meaning (25.8) matches the element's true functional role.
- [ ] Every gap resolved via this chapter's reasoning was still flagged per Rule 5.5, not silently finalized.

### 25.12 Cross-References

25.12.1 See Chapter 6 (Visual Hierarchy) for the binding rules underlying 25.2–25.3. See Chapter 8 (Materials) and Chapter 11 (Elevation) for the binding rules underlying 25.4–25.6. See Chapter 12 (Typography) for the binding rules underlying 25.7. See Rule 5.5 (Design Constitution) for the gap-flagging requirement referenced throughout this chapter.

---

## 26. Floating Surfaces

### 26.1 Purpose

26.1.1 Chapter 8 defines Glass and Solid as Material treatments — properties of a Surface's fill, border, and blur. This chapter defines **Floating** as a distinct, orthogonal property: not what a Surface is made of, but *where it sits in the interaction model relative to the Canvas's normal document flow*. A Surface can be Solid and floating (a Solid dropdown menu), Glass and floating (a Glass notification toast), or neither Material and non-floating (a form field, which is always attached). Prior chapters used the word "floating" informally in several places (8.2.1, 8.4.5); this chapter formalizes it as a defined term with its own rule set.

### 26.2 Definitions

26.2.1 **Attached Surface** — a Surface that participates in the Canvas's normal document flow: it occupies a fixed position determined by the layout grid (Chapter 7) and other content reflows around it. Cards, form fields, table containers, and the Canvas's primary content sections are Attached Surfaces.

26.2.2 **Floating Surface** — a Surface that is positioned independent of normal document flow, overlays other content rather than displacing it, and is typically triggered by a specific user action or system event rather than being permanently present. Dropdown menus, tooltips, popovers, toasts/notifications, modals, and the sticky top bar are Floating Surfaces.

26.2.3 **Floating** is distinct from **Elevated** (Chapter 11): Elevation is a visual property (how strong a shadow, how high a stacking order) that any Surface, attached or floating, possesses at some level (even a resting card has Elevation Level 1). Floating is a structural/behavioral property (does this surface overlay content or does content reflow around it). Nearly all Floating Surfaces use a high Elevation Level (because they need to render in front of the content they overlay), but not everything with elevated shadow is Floating — a hovered Attached card (11.3.1) raises its Elevation Level without ever leaving normal document flow.

### 26.3 Design Rationale — Why the Floating/Attached Distinction Matters

26.3.1 A user's mental model of "where is this information permanently, and where did this temporarily appear" depends on this distinction being rendered consistently. If a Floating Surface (e.g., a dropdown) were rendered with the same visual treatment as an Attached Surface, the user would have no reliable way to predict that clicking outside of it, or pressing Escape, should dismiss it — because visually it would look like a permanent part of the page rather than a temporary overlay. Floating Surfaces must therefore look *distinctly* temporary — through elevated shadow, and often through Glass or scrim-backed presentation — precisely so the user's existing intuition about "things that appear and disappear" (informed by a lifetime of physical experience with things that visibly hover versus things that are fixed in place, per 25.4.1) applies correctly.

### 26.4 Rendering Rules

26.4.1 Every Floating Surface MUST use an Elevation Level of at least Level 2 (11.1.1), and interactive floating overlays that block interaction with content beneath them (modals) MUST use Level 4, per the existing Elevation scale — this chapter introduces no new elevation values, only a floor requirement tying Floating status to a minimum Elevation.

26.4.2 A Floating Surface MUST visually and behaviorally disengage from the content beneath it: content beneath a Floating Surface MUST NOT reflow, resize, or shift position as a direct result of the Floating Surface's appearance (the sole exception being a scrim/dimming overlay applied to background content, per 8.2.1 and 17.4.2, which is a permitted opacity/brightness change, not a layout change).

26.4.3 A Floating Surface's appearance and disappearance MUST use the Spatial Transition motion category (18.2.2), animating from or toward its triggering element's position where a clear trigger exists (e.g., a dropdown grows from its trigger button; a tooltip appears adjacent to its trigger; a modal may instead scale/fade from the Canvas center when no single small trigger point applies).

26.4.4 A Floating Surface MUST be dismissible via a method appropriate to its interruption level: non-blocking Floating Surfaces (tooltips, non-critical toasts) MUST auto-dismiss or dismiss on any outside interaction without requiring an explicit close action; blocking Floating Surfaces (modals) MUST follow the explicit dismissal rules of 17.4.4.

26.4.5 A Floating Surface MUST NOT be used to present primary, permanent content that the user is expected to return to as part of their normal workflow (e.g., a core data table MUST NOT be implemented as a permanently-open "floating panel" merely for visual novelty) — per 26.3.1, doing so would misrepresent permanent content as temporary, contradicting the interface's own semantic signaling (25.8).

### 26.5 Decision Logic — Determining Whether a Surface Should Float

```
WHEN determining whether a new Surface should be Attached or Floating:

  IS this Surface's content something the user needs to reference
  or interact with as a stable, ongoing part of this screen
  (e.g., a data table, a form, a persistent summary)?
    IF YES -> Attached Surface. Apply Chapter 7 grid placement.
              Do NOT apply Floating rules even if the Surface
              happens to use a high Elevation Level for other reasons
              (e.g., a hovered card, 11.3.1).

  IS this Surface triggered by a specific, momentary user action or
  system event (a click, a hover, a validation failure, an incoming
  notification) and meant to be dismissed or to disappear once its
  purpose is served?
    IF YES -> Floating Surface. Apply 26.4 rules. Determine minimum
              Elevation Level per whether it blocks interaction with
              background content (Level 4) or merely overlays it
              non-blockingly (Level 2 or 3).

  IF NEITHER condition clearly applies:
    Flag per Rule 5.5 rather than defaulting to either category.
```

### 26.6 Proportional and Quantitative Relationships

26.6.1 A Floating Surface's maximum size relative to the Workspace MUST leave the triggering element (or, for modals, a visible scrim) perceivable around its edges, so the user retains spatial context for what triggered the overlay and what it is layered above; a Floating Surface MUST NOT consume 100% of the Workspace in a way that makes it visually indistinguishable from a full Attached page (the sole exception being a full-screen Modal explicitly used for an immersive, single-task flow, which MUST still use a distinct entrance/exit transition per 26.4.3 to signal its temporary, floating nature despite its full-screen size).

### 26.7 Allowed Variations

26.7.1 A Floating Surface MAY use either Glass or Solid Material depending on its content per the ordinary Chapter 8 rules (e.g., a Floating tooltip with a single line of text MAY use Glass; a Floating dropdown containing a dense list of many rows SHOULD use Solid Material per the same Data-Dense reasoning that governs Attached tables, since "floating" and "dense" are independent properties per 26.2.3).

### 26.8 Prohibited Variations

26.8.1 A Floating Surface MUST NOT use an Elevation Level below Level 2.
26.8.2 A Floating Surface MUST NOT cause background content to reflow (only dimming/scrim opacity changes are permitted).
26.8.3 Primary, permanent workflow content MUST NOT be implemented as a Floating Surface.

### 26.9 Anti-Patterns

26.9.1 Never render a temporary overlay (dropdown, tooltip, toast) with the same Elevation Level as ordinary resting Attached content — it will not read as dismissible.
26.9.2 Never let a Floating Surface's appearance shift the position of Attached content beneath it.
26.9.3 Never implement a core, permanent data view as a floating panel for visual novelty.
26.9.4 Never omit a distinct entrance/exit transition on a full-screen modal merely because its size approaches the full Workspace.

### 26.10 Accessibility Considerations

26.10.1 Every Floating Surface MUST be reachable and dismissible via keyboard (Escape at minimum for non-critical overlays; the full modal focus-trap rules of 22.4.3 for blocking overlays), and MUST be announced to Assistive Technology as a distinct, transient region (per 22.5.3's live-region requirement) rather than silently appearing with no AT signal.

### 26.11 Responsive Behavior

26.11.1 At tablet breakpoints, Floating Surfaces anchored to a specific trigger element (dropdowns, tooltips) MUST reposition to remain fully within the Workspace bounds (never clipped off-screen); where insufficient space exists near the trigger, the Floating Surface MAY reposition to the opposite side of the trigger or convert to a bottom-anchored sheet, but this fallback behavior MUST be applied consistently platform-wide, not decided per-instance.

### 26.12 Compliance Checklist (Chapter 26)

- [ ] Every Surface has been classified as either Attached or Floating per the 26.5 decision logic.
- [ ] Every Floating Surface meets its minimum Elevation Level (2 for non-blocking, 4 for blocking).
- [ ] No Floating Surface causes background reflow.
- [ ] No primary, permanent content is implemented as a Floating Surface.
- [ ] Every Floating Surface is keyboard-dismissible and AT-announced appropriately.

### 26.13 Cross-References

26.13.1 See Chapter 8 (Materials) for how Glass/Solid selection applies independently to Floating Surfaces. See Chapter 11 (Elevation) for the Elevation scale this chapter sets minimums against. See Chapter 17.4 (Dialogs and Modals) for the fullest existing example of a blocking Floating Surface. See Chapter 18.2.2 (Spatial Transition) for the motion category governing Floating Surface entrance/exit. See Chapter 22.4.3 and 22.5.3 for accessibility requirements this chapter extends to all Floating Surfaces, not modals alone.

## Appendix A. Measurable Values Reference

### A.1 Purpose

A.1.1 Chapters 1–26 deliberately favor proportional and relative language ("outer spacing shall exceed inner spacing," "blur strong enough that background text is illegible") over fixed values, per the Project's stated preference for relative relationships over pixel-locked rules that cannot adapt across viewport sizes or a future rescale of the base unit. However, several properties — opacity, blur radius, shadow parameters, corner radius, animation duration, and reflection/highlight intensity — benefit from an explicit numeric *range* even under a proportional philosophy, because "low opacity" or "soft blur" alone still leaves two independent, non-creative rendering agents free to land on visibly different results (one agent's "low" may be 40%, another's may be 5%). This appendix exists to close that residual gap by binding every such property to a concrete range, without abandoning the proportional relationships already established in the chapters above — each range below is expressed alongside the relationship rule it supports, not as a replacement for that rule.

A.1.2 Every range in this appendix is a constraint, not a target: the rendering agent MUST select a specific value within the stated range for each defined use case and MUST apply that same specific value consistently across every instance of that use case platform-wide (per 5.6, Consistency Over Novelty) — the range exists to bound acceptable implementations, not to license per-instance variation.

### A.2 Opacity Ranges

| Property | Context | Range | Governing Chapter |
|---|---|---|---|
| Glass fill opacity | Light mode | 8%–20% | 8.4.2 |
| Glass fill opacity | Dark mode | 12%–28% (higher, per 8.6.3, since dark backgrounds need more fill to remain perceivable as "lighter than surroundings") | 8.4.2, 8.6.3 |
| Glass border opacity | Both modes | 24%–40%, and MUST always exceed the Glass fill opacity of the same surface by at least 10 percentage points | 8.4.3, 25.6 |
| Solid Surface hairline border opacity | Both modes | 8%–16% (lower than Glass borders, since Solid fill already does most edge-defining work per 25.6.1) | 8.5.2 |
| Disabled element content opacity | All components | 38%–48%, applied uniformly platform-wide per 19.6.1 (a single fixed value within this range MUST be chosen once and reused everywhere — this is the one opacity property in this table where zero cross-instance variation is permitted, since 19.6.1 explicitly requires a uniform, non-varying value) | 19.6.1 |
| Scrim/modal backdrop opacity | Behind Level 4 modals | 40%–60% (dark overlay in light mode; 55%–75% in dark mode, where a lighter background needs more darkening to achieve equivalent perceptual dimming) | 17.4.2, 8.2.1 |
| Hover state fill/background shift | Any hoverable Surface | A shift of 4–8 percentage points from the Idle state's own fill opacity or a one-Neutral-Scale-step lightness change, whichever the component's Material calls for | 19.3.1 |

### A.3 Blur Ranges

A.3.1 Glass Material background blur radius MUST be expressed relative to the Glass Surface's own font size / base unit rather than an absolute pixel value across arbitrary viewport scales, but as an implementation range at standard desktop density: blur radius MUST fall between 16px and 32px equivalent, with the specific chosen value held constant across every Glass Surface platform-wide (a top bar and a floating toast MUST use the identical blur radius, since both are instances of the same Material, per 5.6). This range is calibrated to satisfy 8.4.1's requirement that background text becomes fully illegible while background shapes/colors remain recognizably present.

A.3.2 Blur radius MUST NOT scale with a Glass Surface's own size (a large Glass panel and a small Glass badge use the same blur radius) — only the fill opacity and border may differ by Surface type, never the blur radius, since blur radius is a property of the visual "frosting" effect itself, not of the object being frosted.

### A.4 Corner Radius Ranges

A.4.1 Corner radius MUST be expressed as one of exactly four fixed tiers, each proportional to the base spacing unit (13.1) rather than expressed as independent pixel values: **Tier 1 / Small** (0.5×–0.75× base unit — used for: badges, tags, small icon buttons, input fields), **Tier 2 / Standard** (1×–1.5× base unit — used for: buttons, cards, dropdowns), **Tier 3 / Large** (2×–3× base unit — used for: modals, large panels, hero/summary bands), **Tier 4 / Full/Pill** (50% of the element's own height — used exclusively for pill-shaped badges/tags per 17.7.1 and toggle/switch controls).

A.4.2 A single component type MUST use the same Tier across every Module and every screen (per 5.3, 5.6); corner radius Tier MUST NOT vary based on a Module's Personality (per 20.8.1, which already prohibits this, and which this appendix now gives concrete tiers to enforce against).

### A.5 Shadow Parameter Ranges (Extending Chapter 11)

| Elevation Level | Blur Radius (relative to base unit) | Vertical Offset (relative to base unit) | Shadow Opacity (light mode) | Shadow Opacity (dark mode, per 9.7.3) |
|---|---|---|---|---|
| Level 0 | none | none | none | none (use border/lightness-step only) |
| Level 1 (resting card) | 1×–1.5× | 0.25×–0.5× | 6%–10% | 0% shadow; use a 4–8% lighter border-step instead per 9.7.3 |
| Level 2 (hovered/top bar) | 2×–3× | 0.5×–1× | 8%–14% | 0% shadow; use a lighter fill-step increase instead |
| Level 3 (dropdown/tooltip) | 3×–4× | 0.75×–1.25× | 10%–16% | Subtle shadow permitted at 4–8% MAY be combined with a lightness-step border for these floating, non-blocking overlays, since some shadow legibility is still perceivable even in dark mode at this elevation |
| Level 4 (modal) | 4×–6× | 1×–2× | 14%–22% | 8%–14% (the only Elevation Level where dark-mode shadow is mandatory rather than replaced, since a modal's blocking scrim already provides a dark backdrop against which a shadow can register) | 

A.5.1 Blur radius, offset, and opacity MUST each increase monotonically from Level 1 to Level 4 with no exceptions (per 11.2.4); the specific value chosen within each cell's range MUST remain fixed platform-wide once selected, not re-selected per Module or per screen.

### A.6 Animation Duration Ranges (Extending Chapter 18.4)

| Tier | Duration Range | Maximum (per 4.7.2.2/18.4.1) |
|---|---|---|
| Instant/Fast (state feedback) | 100ms–200ms | 320ms hard ceiling |
| Standard (spatial transition, content-change feedback) | 200ms–320ms | 400ms hard ceiling |
| Deliberate (onboarding only) | 320ms–480ms | 600ms hard ceiling |

A.6.1 The specific duration chosen within each tier's range MUST be fixed platform-wide per interaction type (e.g., every button press uses the identical Instant/Fast duration; every modal open uses the identical Standard duration) — variation within the range is permitted only *between* distinct interaction types, never between instances of the *same* interaction type in different Modules.

### A.7 Reflection and Highlight Intensity (Extending 8.4.4)

A.7.1 A Glass Surface's single permitted top-edge highlight (8.4.4) MUST use a lightness increase of 6–14 percentage points above the Glass Surface's own fill lightness, fading to zero by no more than 10%–15% of the Surface's total height, and MUST use full transparency (not a separate opacity value) at its lower fade boundary so it blends seamlessly rather than terminating with a visible seam.

### A.8 Decision Logic — Applying This Appendix

```
WHEN a chapter elsewhere in this specification calls for a qualitative
  property (e.g., "low opacity," "soft blur," "subtle highlight")
  without its own explicit numeric value:

  STEP 1: Locate the property and context in the tables above (A.2–A.7).
  STEP 2: Select ONE specific value within the stated range.
  STEP 3: Record that value as the fixed, platform-wide standard for
          that exact property + context combination.
  STEP 4: Apply that fixed value to every future instance of that
          same property + context combination, with zero per-instance
          re-selection (per 5.6, Consistency Over Novelty).

  IF a property is called for that does not appear in this appendix:
    Flag per Rule 5.5 rather than selecting an arbitrary value.
```

### A.9 Anti-Patterns

A.9.1 Never select a different specific opacity/blur/shadow/duration value for the same property+context combination in different Modules or on different screens.
A.9.2 Never exceed the hard-ceiling maximums in A.6 regardless of how "deliberate" a Standard or Instant-tier animation is meant to feel.
A.9.3 Never scale Glass blur radius with the size of the Glass Surface itself.
A.9.4 Never select a corner radius value outside the four defined Tiers in A.4.1.

### A.10 Compliance Checklist (Appendix A)

- [ ] Every qualitative property referenced elsewhere in the specification has been bound to one specific, documented value from its applicable range in this appendix.
- [ ] That specific value is applied identically across every instance of the same property+context combination, platform-wide.
- [ ] No animation duration exceeds its tier's hard ceiling.
- [ ] No corner radius falls outside the four defined Tiers.

### A.11 Cross-References

A.11.1 This appendix extends, and does not supersede, Chapter 8 (Materials), Chapter 11 (Elevation), Chapter 13 (Spacing — base unit reference), and Chapter 18 (Motion). Where this appendix and a chapter's prose appear to differ in specificity, this appendix's numeric range is the binding implementation constraint; the chapter's prose remains the binding statement of *purpose and relationship* (e.g., "outer exceeds inner," "blur must obscure legibility") that the numeric range exists to satisfy.

<<CONTINUE FROM HERE>>







