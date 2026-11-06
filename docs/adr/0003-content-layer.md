# ADR 0003: Content layer

Status: Superseded: [ADR 0009](0009-admin-panel-and-content-model.md)
Date: 2026-11-05

## Context

The site shows the office details, the services and a set of projects. Today the content is typed data in `src/content`. The project pages show concept work with illustrative images, and the site labels them as such. A backend is planned. The site must not present concept work as finished client work.

## Options

| Option | Pros | Cons |
|---|---|---|
| Components read data files directly | Simple | A backend would touch every component |
| Typed content modules in `src/content`; components receive props | Types check every field; a backend replaces only the data source; no extra layer today | Pages import the modules directly until a backend exists |
| Fetch from a backend now | Final shape | No backend exists; adds work and risk before the design is settled |

## Decision

Content is typed data in `src/content`: office details and services in `site.ts`, projects in `projects.ts`. Components receive content only as typed props. Pages read it through the exported lists and helpers. When a backend arrives, it replaces the data behind these exports.

Rules:

1. Content types are explicit. A missing field is a type error.
2. Every image has a text alternative.
3. Concept work stays labelled on the site. The project does not invent client names, awards or numbers.
4. Optional parts of a project (gallery, before and after view) never block a page.
5. Helpers that find or order projects have unit tests ([ADR 0004](0004-testing-strategy.md)).

## Consequences

- Positive: the backend is a swap of the data source; content types catch broken pages at build time.
- Negative: content changes need a pull request until a backend and an editing tool exist.
- Open item: managed content and a working contact form depend on the backend (planned).

## Sources

- https://nextjs.org/docs/app/getting-started/server-and-client-components
