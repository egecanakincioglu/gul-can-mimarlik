# ADR 0001: Architecture and routing without locales

Status: Accepted
Date: 2026-11-05

## Context

The site is a small website for an architecture and interior design office with a few page types: home, services, projects, studio and contact. It is written in Turkish only. The site must be fast, easy to crawl and easy to move to a backend later.

## Options

| Option | Pros | Cons |
|---|---|---|
| Next.js App Router with plain routes and no locale layer | No extra code or dependency; routes follow the folders; fits a single language | Adding a second language later needs a routing change |
| Next.js App Router with an i18n library or a `[locale]` segment | Ready for more languages | Extra concepts and code for a site that has one language |
| A static site generator | Simple output | A different toolchain from the rest of the project; no path to a backend |

## Decision

The project uses the Next.js 16 App Router with React 19 and TypeScript in strict mode. The site has one language, so there is no locale routing and no i18n library. Routes follow the folders under `src/app`. The page language is declared once, in the root layout.

Rules:

1. Public pages live under the route group `src/app/(site)`: `/`, `/hizmetler`, `/projeler`, `/projeler/<slug>`, `/studyo` and `/iletisim`. The admin panel lives under `src/app/(yonetim)/yonetim`. Search engines do not index it, and it is off unless `ADMIN_ENABLED` is `true`.
2. The project detail route is generated from the project list. A slug that is not in the list answers 404.
3. Unknown paths answer 404.
4. All source code is under `src/`.
5. A new page is added to the page list of the site audit in the same pull request.

## Consequences

- Positive: no routing layer to maintain; the route table is the folder tree.
- Negative: a second language needs a new decision and a routing change.
- Open item: the contact form sends nothing today. A backend is planned.

## Sources

- https://nextjs.org/docs/app
