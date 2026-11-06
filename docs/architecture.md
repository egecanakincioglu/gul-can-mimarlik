# Architecture

This document describes how the application is built. Items marked "planned" do not exist yet. The reasons for each choice are in the [decision records](adr/README.md).

## Overview

The project is one Next.js 16 application (App Router) with React 19 and TypeScript in strict mode. It serves the public website of Gül CAN in Turkish. All source code is under `src/`.

```text
src/app/          routes, the root layout and the global stylesheet
src/app/(site)/   public routes, with the header, skip link and main element
src/app/(yonetim)/yonetim/   admin panel routes
src/components/   presentational components (header, footer, gallery, contact form)
src/content/      typed content: office details, services and projects
public/           static files, including the images in public/images/
tooling/          repository tools, site audit and Semgrep rules
```

## Routing

The site is Turkish only, so it has no language routing ([ADR 0001](adr/0001-architecture-and-routing.md)). Routes follow the folders under `src/app`. Public routes live in the route group `src/app/(site)`. The admin panel lives in `src/app/(yonetim)/yonetim`. Group names do not appear in URLs. The root layout holds only the document, the fonts, the stylesheet and the boot script. `src/app/not-found.tsx` renders the 404 page with the site header.

| Route | Page |
|---|---|
| `/` | Home |
| `/hizmetler` | Services |
| `/projeler` | Project list |
| `/projeler/<slug>` | Project detail (`avlulu-konut`, `daire-yenileme`, `yamac-evi`, `kose-kafe`) |
| `/studyo` | Studio |
| `/iletisim` | Contact |

- The project detail route is generated from the project list in `src/content/projects.ts`. An unknown slug answers 404.
- Unknown paths answer 404.
- The page list used by the site audit is in `tooling/site-audit/pages.ts`. A new page is added there in the same pull request.

## Styling

Tailwind CSS 4 with design tokens defined in `src/app/globals.css` ([ADR 0002](adr/0002-styling-tailwind-4-with-tokens.md)).

## Content layer

Components receive content as typed props. The data lives in `src/content` ([ADR 0003](adr/0003-content-layer.md)): office details and navigation in `site.ts`, services in `site.ts`, and projects in `projects.ts`.

All editable content is becoming one typed object in `src/content`: types, seed files, selectors and validation ([ADR 0009](adr/0009-admin-panel-and-content-model.md)). Pages read it through `getContent()`. The migration happens page by page. The old `site.ts` and `projects.ts` modules stay until the migration ends.

The project pages show concept work with illustrative images. The site labels this on the page. The images are in `public/images/`.

## Contact form

The contact form validates its input in the browser and sends nothing. A backend that receives the message is planned.

## Backend (planned)

No database, API route or authentication exists yet. When a backend arrives, it replaces the data behind the content layer, and the contact form sends its message to it.

## Quality and delivery

- Tests, coverage and thresholds: [ADR 0004](adr/0004-testing-strategy.md) and [ADR 0006](adr/0006-quality-targets-and-thresholds.md).
- CI and branch protection: [ADR 0005](adr/0005-ci-and-protection-layers.md).
- Releases and deploys: [ADR 0007](adr/0007-versioning-and-releases.md) and the [release runbook](runbooks/release-and-rollback.md).
