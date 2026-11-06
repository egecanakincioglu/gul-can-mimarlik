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

- The project detail route is generated from the project list in the content model. An unknown slug answers 404.
- Unknown paths answer 404.
- The page list used by the site audit is in `tooling/site-audit/pages.ts`. A new page is added there in the same pull request.

## Styling

Tailwind CSS 4 with design tokens defined in `src/app/globals.css` ([ADR 0002](adr/0002-styling-tailwind-4-with-tokens.md)).

## Content layer

Components receive content as typed props. The data lives in `src/content` ([ADR 0003](adr/0003-content-layer.md)): the types in `types.ts`, the seed files, the selectors in `select.ts` and the validation.

All editable content is one typed object in `src/content`: types, seed files, selectors and validation ([ADR 0009](adr/0009-admin-panel-and-content-model.md)). Every public page reads it through `getContent()` and the selectors in `src/content/select.ts`. The image type `Img` is in `src/content/types.ts`.

Each public page exports a synchronous render function: `renderHome`, `renderServices`, `renderProjects`, `renderProject(content, slug)`, `renderStudio` and `renderContact`. `renderProject` returns nothing for an unknown slug. The site layout exports `renderShell(content, children)`. The footer and the service bands have synchronous views, `FooterView` and `ServicesBandsView`. The default page exports call these functions with `await getContent()`. The admin preview calls the same functions with draft content.

A before/after pair has an optional display mode: slider (default) or toggle. The toggle suits pairs whose images are not exactly aligned.

The title and description of every page, including the contact page, come from the content model.

The project pages show concept work with illustrative images. The site labels this on the page. The images are in `public/images/`.

## Admin panel

The admin panel is built on mock data ([ADR 0009](adr/0009-admin-panel-and-content-model.md)). Its code is in `src/admin`: `store` (editing state), `ui` (shared components) and `shell` (layout and navigation).

- `/yonetim` and its sub-routes render inside a shell. The shell has a sidebar with grouped links, and a top bar with a breadcrumb, the save status, and the publish and discard buttons.
- `/yonetim/giris` is the login screen. It has no shell. It is a demo until authentication exists.
- Screens that are not built yet show a placeholder page.
- The mock store keeps a draft and a published copy of the content in the browser's local storage under a versioned name (`gcm-admin:v1`). When storage is unavailable, it falls back to the seed content and shows a save error.
- Publishing runs the content validation. It is blocked while issues exist.
- In the mock phase, edits stay in the browser and do not reach the public site.
- Below 1024 pixels, the sidebar opens from a `Menü` button. Screens that need width show a notice below 768 pixels.

The screens live in `src/admin/screens` and each has its own route. The groups are:

- Site settings, with the demo mode switch, contact details, navigation, SEO, texts and footer.
- The media library, with the image picker and the focal point picker.
- The inbox and the redirects.
- Page editors for the home page (with four fixed project slots), services, process steps, studio, the contact page and the projects page.

Heading fields use a small emphasis syntax: `*word*` is bold (weight 800) and `_word_` is light (weight 300).

## Contact form

The contact form validates its input in the browser and sends nothing. A backend that receives the message is planned.

In the demo phase a valid submission is not sent anywhere. It is queued in the browser's local storage, and the admin panel adds queued messages to its demo inbox when it loads.

## Backend (planned)

No database, API route or authentication exists yet. When a backend arrives, it replaces the data behind the content layer, and the contact form sends its message to it.

## Quality and delivery

- Tests, coverage and thresholds: [ADR 0004](adr/0004-testing-strategy.md) and [ADR 0006](adr/0006-quality-targets-and-thresholds.md).
- CI and branch protection: [ADR 0005](adr/0005-ci-and-protection-layers.md).
- Releases and deploys: [ADR 0007](adr/0007-versioning-and-releases.md) and the [release runbook](runbooks/release-and-rollback.md).
