---
name: Core Enterprise
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 2rem
  gutter: 1.5rem
  card-padding: 1.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style
The design system is engineered for large-scale administrative environments where clarity, precision, and a sense of calm authority are paramount. It targets educational administrators and platform owners who manage complex, data-heavy workflows. 

The aesthetic is **Corporate / Modern** with a focus on **Tonal Layering**. It moves away from high-vibrancy interfaces toward a more sophisticated, "quiet" luxury. By prioritizing generous whitespace and a refined cool-gray neutral scale, the interface reduces cognitive load while maintaining an air of professional reliability. The emotional response should be one of competence and clarity—ensuring users feel in control of their data, never overwhelmed by it.

## Colors
This design system utilizes a refined palette rooted in a deep, trustworthy blue. 

- **Primary:** A versatile sapphire blue used for key actions and brand presence.
- **Neutral Scale:** A cool slate/gray spectrum. The background is a very light tinted gray (`#F8FAFC`), while text utilizes darker slates to ensure high contrast without the harshness of pure black.
- **Semantic Colors:** Success, Warning, and Error tones are desaturated slightly to integrate seamlessly with the professional palette, appearing as informative signals rather than jarring alerts.
- **Surfaces:** Cards and containers use pure white (`#FFFFFF`) to pop against the slate background, creating clear mental buckets for information.

## Typography
The typography strategy pairings **Plus Jakarta Sans** for headlines and **Inter** for UI and body text.

- **Headlines:** Use Plus Jakarta Sans to provide a modern, slightly rounded, and friendly character to the dashboard headers.
- **UI & Data:** Inter is used for all functional elements, data tables, and body copy. Its high x-height and neutral character ensure legibility even at small sizes in dense data grids.
- **Weight Usage:** Bold weights (700) are reserved for primary page titles. Semi-bold (600) is used for card titles and navigation. Regular (400) is used for all descriptive text to keep the interface light and breathable.

## Layout & Spacing
This design system employs a **Fluid Grid** with a 12-column structure for desktop. 

- **Breathing Room:** We use an 8px base grid. Default card padding is increased to 24px (`1.5rem`) to ensure data doesn't feel cramped.
- **Responsive Behavior:** 
    - **Desktop (>1280px):** 12 columns, 32px margins.
    - **Tablet (768px - 1279px):** 8 columns, 24px margins. Cards stack vertically in 1 or 2 column spans.
    - **Mobile (<768px):** 4 columns, 16px margins. Sidebar transitions to a bottom bar or hidden drawer.
- **Data Density:** While the overall layout is airy, internal component spacing (like list items) remains tight (`0.5rem` to `1rem`) to maintain the functional utility of an ERP.

## Elevation & Depth
Depth is created through a combination of **Tonal Layering** and **Ambient Shadows**.

1.  **Level 0 (Background):** The canvas uses a soft neutral slate (`#F8FAFC`).
2.  **Level 1 (Cards/Sidebar):** White surfaces (`#FFFFFF`) with a subtle 1px border in a light gray (`#E2E8F0`). This level uses a "Soft Ambient" shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.05)`.
3.  **Level 2 (Popovers/Dropdowns):** Elevated surfaces that sit above cards. These use a more pronounced shadow to indicate interactivity: `0 10px 15px -3px rgba(0, 0, 0, 0.1)`.

Avoid heavy dark shadows. The goal is to make elements appear "resting" on the surface rather than floating high above it.

## Shapes
The shape language is **Rounded**, using a 12px (`0.75rem`) radius as the standard for cards and main containers.

- **Buttons & Inputs:** Use a 8px (`0.5rem`) radius to feel precise but modern.
- **Outer Containers:** Main dashboard cards and the sidebar use 12px or 16px to create a sophisticated, "app-like" feel.
- **Tags/Chips:** Utilize pill-shaping (full rounding) to clearly differentiate them from interactive buttons.

## Components
- **Cards:** White background, 12px border-radius, 1px subtle border. Headers should include an optional "action" area for "View All" or "Settings" links.
- **Buttons:**
    - *Primary:* Solid brand blue with white text.
    - *Secondary:* Light gray/slate background with dark slate text. No border.
    - *Tertiary/Ghost:* Transparent background, blue text. Used for less critical actions.
- **Charts:** Bar charts should use the primary blue with a slight 4px top corner radius. Grid lines in charts should be extremely subtle (10% opacity) or removed entirely to emphasize the data trend.
- **Navigation:** The vertical sidebar uses a "Active State Indicator"—a vertical blue line on the left edge and a subtle tinted background (Primary 5% opacity) for the active item.
- **Input Fields:** 1px border that shifts to Primary Blue on focus. Labels should always be visible (never placeholder-only) using the `label-md` type style.
- **Status Chips:** Small, condensed labels with a light tinted background and dark text of the same hue (e.g., Success is light green background, dark green text).