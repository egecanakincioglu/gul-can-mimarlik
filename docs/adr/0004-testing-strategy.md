# ADR 0004: Testing strategy

Status: Accepted
Date: 2026-11-05

## Context

The site contains typed content, helpers that find and order projects, and interactive components such as the contact form and the project gallery. Mistakes in these are easy to ship and hard to see. A coverage target without a rule for new code is not enough.

## Options

| Option | Pros | Cons |
|---|---|---|
| Vitest with Testing Library | Fast; TypeScript without a build step; works with React 19 | Browser behavior is only approximated by jsdom |
| Jest | Common | Slower setup with ESM and TypeScript |
| Only end-to-end tests | Real browser | Slow; weak at checking calculations |

## Decision

The project uses Vitest with Testing Library and jsdom. Browser-level checks are done by `pnpm site-audit`, run locally ([ADR 0006](0006-quality-targets-and-thresholds.md)).

Rules:

1. Any change to TypeScript under `src/` comes with tests in the same pull request. Pull requests that only delete code, or only change styles, content or documentation, are exempt. The `policy` job checks this.
2. Line coverage of `src/lib` and `src/server` is at least 80%. The thresholds are in `tooling/coverage-thresholds.json` and only go up. `src/server` does not exist yet and counts once it does.
3. Logic lives in plain functions where possible and is tested with known values.
4. Interactive components have component tests, for example the contact form validation.
5. Tests do not depend on the network or on the current date.

## Consequences

- Positive: new logic is tested when it is written; coverage cannot slip back.
- Negative: component tests in jsdom do not replace a look in a real browser. The visual check and `site-audit` cover that.

## Sources

- https://vitest.dev/
- https://testing-library.com/docs/react-testing-library/intro/
