# ADR 0002: Styling with Tailwind CSS 4 and design tokens

Status: Accepted
Date: 2026-11-05

## Context

The site has a consistent visual system: colors, type and spacing. It must look correct at widths from 320 to 2560 pixels. Styles should stay close to the components and have no unused code.

## Options

| Option | Pros | Cons |
|---|---|---|
| Tailwind CSS 4 with tokens in CSS | Utility classes; tokens as CSS variables; unused styles are not shipped; works with the App Router | Long class lists in markup |
| CSS modules | Scoped styles; no dependency | Tokens and responsive rules are repeated by hand |
| A component library | Fast start | A look that is hard to bend to the site's own design; extra weight |

## Decision

The project uses Tailwind CSS 4. Design tokens (colors and fonts) are CSS variables defined in `src/app/globals.css`, and components use them through utility classes.

Rules:

1. A color or font that repeats is a token. Components do not hard-code it.
2. Layout is checked at 360, 390, 768, 1024 and 1440 pixels and at 844x390 in landscape. Before a release it is also checked at 1920, 768x1024 and 1024x768. The site audit sweeps widths from 320 to 2560.
3. Text has enough contrast; the site audit runs axe on every page.

## Consequences

- Positive: one place to change the look; small CSS output.
- Negative: contributors must know the token names.
- The stylesheet size is limited by a budget in `tooling/site-audit/thresholds.json` ([ADR 0006](0006-quality-targets-and-thresholds.md)).

## Sources

- https://tailwindcss.com/docs
