# ADR 0006: Quality targets and thresholds

Status: Accepted
Date: 2026-11-05

## Context

The site is the public face of an office. It must be fast, accessible and correct at every screen size. Targets without measurement drift, so each one needs a check.

## Options

| Option | Pros | Cons |
|---|---|---|
| Manual review only | No tooling | Not repeatable; regressions go unseen |
| Automated audit with thresholds in CI | Every pull request is measured | Scores vary a little between runs |
| Perfect score as a gate | Highest bar | Flaky gate; blocks work on noise |

## Decision

`pnpm site-audit` audits the pages of the built site. It runs locally and is not a CI check, so CI stays fast. It returns to CI in the search and performance pass on the [roadmap](../roadmap.md). The Lighthouse gate is 90 in all four categories (performance, accessibility, best practices, SEO), on mobile and on desktop. Lighthouse runs only these four categories, so the stored reports hold nothing else. The expected score is 95 or more. Thresholds are in `tooling/site-audit/thresholds.json` and only go up.

Rules:

1. **Status codes:** every page in `tooling/site-audit/pages.ts` answers 200, and an unknown path answers 404. The audit loads every page without the browser cache. A test checks that every project in the content seed (`src/content/seed/projects.ts`) has its page in that list.
2. **Responsive:** no horizontal overflow at the audited device sizes (320 to 2560 pixels wide, including phone landscape).
3. **Accessibility:** no axe violations; text has enough contrast.
4. **Images:** an image that is much larger than its display size fails the audit, and so does one that is too small. A source that is as wide as its original file passes.
5. **Console:** no errors or warnings on audited pages.
6. **Dialogs:** no dialog is open when a page loads. A hidden menu panel does not count.
7. **Budgets:** script, stylesheet, font and total transfer sizes stay within the budgets in `thresholds.json`.

## Consequences

- Positive: one command measures every page against the same thresholds.
- Negative: Lighthouse scores vary between runs. The gate is 90, below the 95+ expected, to leave room for noise.
- The audit has three legs (pages, mobile, desktop). It is not a required check, so a regression shows up only when the audit is run.

## Sources

- https://developer.chrome.com/docs/lighthouse/overview
- https://github.com/dequelabs/axe-core
- https://www.w3.org/WAI/standards-guidelines/wcag/
