---
name: GD Demon Timeline
colors:
  surface: '#141218'
  surface-dim: '#141218'
  surface-bright: '#3b383e'
  surface-container-lowest: '#0f0d13'
  surface-container-low: '#1d1b20'
  surface-container: '#211f24'
  surface-container-high: '#2b292f'
  surface-container-highest: '#36343a'
  on-surface: '#e6e0e9'
  on-surface-variant: '#cbc4d2'
  inverse-surface: '#e6e0e9'
  inverse-on-surface: '#322f35'
  outline: '#948e9c'
  outline-variant: '#494551'
  surface-tint: '#cfbcff'
  primary: '#cfbcff'
  on-primary: '#381e72'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#6750a4'
  secondary: '#cdc0e9'
  on-secondary: '#342b4b'
  secondary-container: '#4d4465'
  on-secondary-container: '#bfb2da'
  tertiary: '#e7c365'
  on-tertiary: '#3e2e00'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#141218'
  on-background: '#e6e0e9'
  surface-variant: '#36343a'
typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1440px
  gutter: 20px
---

## Brand & Style

The visual style is a fusion of **Glassmorphism** and **Cyber-Brutalism**. It utilizes deep charcoal voids to create an infinite canvas, where information is stratified through translucent, frosted layers and illuminated by vibrant neon strokes. High-contrast typography ensures readability against complex background effects, while thin, glowing borders provide structural definition without bulk.

## Colors

The palette is anchored in a true-black `#0a0a0a` background to maximize the luminance of neon accents. 

- **Primary Action Color:** Neon Blue is reserved for global navigation, interactive triggers, and system feedback.
- **Difficulty Spectrum:** Five specific neon hues represent the demon progression. These are used for status indicators, progress bars, and card accents.
- **Neutral Surface:** Surfaces utilize low-opacity white overlays (`rgba(255, 255, 255, 0.03)`) to create depth while maintaining background visibility.

## Typography

This design system employs a three-tier typeface strategy to balance expression with technical utility:

1.  **Display (Space Grotesk):** Geometric and futuristic. Used for level names, percentages, and major headers.
2.  **Interface (Inter):** High legibility. Used for all descriptive text, body content, and settings.
3.  **Data (JetBrains Mono):** Monospaced for precision. Used for timestamps, attempt counts, IDs, and technical metadata.

All headings should favor a tighter letter-spacing for a "compressed" high-energy feel.

## Layout & Spacing

The layout follows a **4px baseline grid** for strict alignment, reflecting the "block-based" nature of level design.

- **Desktop:** 12-column fluid grid with 24px gutters. Use wide margins to allow background blurs to "bleed" out.
- **Mobile:** 4-column grid with 16px margins. Components should span the full width to maximize interactive surface area.
- **Timeline Logic:** A vertical or horizontal "track" should act as the central axis, with cards anchored to specific coordinates. Use generous `xl` spacing between major timeline eras to provide visual breathing room.

## Elevation & Depth

Depth is conveyed through **Light Leakage** and **Optical Layers** rather than traditional shadows.

- **Layer 0 (Background):** Pure `#0a0a0a`.
- **Layer 1 (Panels):** Semi-transparent frosted glass (`backdrop-filter: blur(12px)`).
- **Layer 2 (Focus):** Panels with a 1px solid neon border corresponding to the demon difficulty color.
- **Glow Effects:** Use `box-shadow` with 0px offset and 10-15px blur, using high-saturation neon colors at low opacity (20%) to simulate a "display glow."

## Shapes

The design system utilizes **Soft (0.25rem)** corners to maintain a "hard-tech" aesthetic while avoiding the harshness of a pure 0px edge.

- **Standard Elements:** 4px radius.
- **Large Cards:** 8px (rounded-lg).
- **Progress Bars:** 2px or sharp (0px) to represent mathematical accuracy.

## Components

### Buttons
- **Primary:** Solid Neon Blue background with black text. On hover, apply a 10px outer glow.
- **Secondary:** Transparent background with 1px Neon Blue border.
- **Demon-Specific:** Buttons that take the color of the difficulty (e.g., an "Extreme Demon" button is `#bf00ff`).

### Cards & Panels
- Transparent base with `backdrop-filter: blur(20px)`.
- A 1px top-border that is 20% brighter than the surface color to catch "light."
- For demon difficulty cards, the left-hand border should be 4px thick and use the specific difficulty color.

### Progress & Input
- **Trackers:** Use thin neon lines. Completed segments should "glow," while incomplete segments remain at 10% opacity.
- **Input Fields:** Bottom-border only, using JetBrains Mono for the input text.

### Gamified Elements
- **Difficulty Icons:** Large, high-resolution demon faces placed with negative translation (hanging off the edge of cards) to create spatial depth.
- **Timeline Nodes:** Small diamond shapes that pulse when active.