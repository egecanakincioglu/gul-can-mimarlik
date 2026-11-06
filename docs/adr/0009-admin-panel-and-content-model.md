# ADR 0009: Admin panel and content model

Status: Accepted
Date: 2026-11-06

## Context

[ADR 0003](0003-content-layer.md) keeps the content as typed data in `src/content`, split into office details and services in `site.ts` and projects in `projects.ts`. Much of the visible text is still written inside page and component files: page headings, the home page, form labels, interface strings, and the labels for concept work. Some links between data items depend on text: a project's scope is matched to a service by name, and a filter matches a regular expression on scope text. Some numbers and dates are repeated by hand (`Dört kategori, on hizmet`, `/ 04`, `Altı adım`, `Aralık 2020` in three places, the copyright year).

An admin panel is now needed so the site owner can edit all content without a code change. The panel lives in the same Next.js application under `/yonetim` and is not indexed. All screens are built on mock data first. Authentication, the database and e-mail follow in the backend phase. Contact form messages go to a panel inbox and trigger an e-mail notification.

Facts that affect the decision:

- The site is Turkish only and has 4 sample projects. All projects and images are concept work with illustrative images; real projects will be added later.
- Demo notes appear in several places (footer, form, services footnote, studio teaser, page description).
- The rule from ADR 0003 stays: no invented clients, awards or numbers; every image has a text alternative.
- The site must keep its current appearance while the content moves.

## Options

| Option | Pros | Cons |
|---|---|---|
| A. Keep texts in components; the panel edits only projects and office details | Smallest change | Most of the site stays fixed; two sources of truth; the panel needs a second change later |
| B. One typed content model (`SiteContent`) for all editable content; relations by ID; derived counts; pure selectors; a repository interface that the backend replaces | One source of truth; renames cannot break links; the panel and the site share types and validation; mock and real data use the same interface | One-time migration of every page; a larger type file |
| C. External headless CMS | Ready-made editing screens | New vendor and cost; the editing model does not match the layout rules (fixed slots, two heading weights, image ratios); content lives outside the repository |
| D. Free-form page builder (blocks) | Maximum flexibility | Breaks the fixed layout and design rules; large build effort; harder to keep the design consistent |

## Decision

Option B. All editable content is one typed object, `SiteContent`, built in `src/content` from seed files and read through pure selectors. Pages read it with `getContent()` and pass slices to client components as props. The admin panel edits the same object through a `ContentRepository` interface. A memory-backed implementation serves the mock phase; the backend phase replaces it.

Rules:

1. Relations use IDs: project to service, project to category, home slot to project, media to every image. A service can be renamed without breaking a project.
2. Counts and dates are derived: the number of categories, services and process steps, the founding date, the copyright year. Texts use tokens, filled by one tested function.
3. Emphasised headings are lists of segments with a weight of 300 or 800. No other markup is possible in a heading.
4. Images are media items with a default text alternative and focal point. A use may override both. Fixed aspect ratios are checked when media is assigned to a slot.
5. Each project has a `concept` flag and each media item has an `illustrative` kind. Labels follow these flags. A real project shows location and year instead. One `demoMode` switch controls every demo note; it does not change the concept labels.
6. The home page has 4 fixed project slots, each with a project picker. A before and after pair belongs to one project and has its own lead text. The home page may reference no pair, which hides the section.
7. Changing a project slug adds a redirect. Redirects are looked up at request time and never form chains.
8. A validation function checks references, uniqueness, required text alternatives and unknown tokens. The seed must have no issues, and a save through the repository runs the same function.
9. Contact form messages are stored as inbox entries. The recipient address for the notification is a setting.
10. `/yonetim` is excluded from indexing and is unavailable in production until authentication exists.
11. Design values stay in code: fonts, colors, spacing, animation, grid and the form validation patterns.

The migration is split into independent pull requests, one per page group, and each keeps the rendered page unchanged. A snapshot test per page guards this. This record supersedes [ADR 0003](0003-content-layer.md); its rules about explicit types, text alternatives, labelled concept work, optional parts and tested helpers remain in force.

## Consequences

- Positive: one source of truth; the panel can edit every text and image; renames and slug changes cannot break links; counts cannot drift from the data; the backend only replaces the repository.
- Negative: the content type is large; every page is converted once; tokens add a small formatting layer; the Turkish locative suffix for the founding year needs a tested table.
- Mock phase limit: edits made in the panel stay in the browser and do not reach the public site. The panel says so.
- Tests required: unit tests for selectors, the token and number helpers, and validation, including a seed with no issues; a fidelity test between the seed and the old data modules; one snapshot test per converted page; tests for the demo switch, the concept flag and the redirect lookup. Pure helpers live in `src/lib` and fall under the coverage gate ([ADR 0004](0004-testing-strategy.md)).
- Open items for the backend phase: database and schema validation, authentication, upload checks including removal of image metadata, e-mail delivery, spam protection on the form, cache revalidation on save, and whether the 404 page, sitemap, robots file, social image and social links become editable.

## Sources

- https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- https://nextjs.org/docs/app/api-reference/functions/permanentRedirect
- https://nextjs.org/docs/app/getting-started/server-and-client-components
