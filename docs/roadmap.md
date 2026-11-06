# Roadmap

The phases of the project and their status. Details of each decision are in the [decision records](adr/README.md).

| Phase | Scope | Status |
|---|---|---|
| 1. Repository and tooling | Lint, type check, tests, CI, release flow, documentation | In progress |
| 2. Site | Home, services, projects, studio and contact pages, with tests for the code in `src/lib` | In progress |
| 3. Site check | Every page and component checked at all widths: layout, accessibility, image sizes, menus and dialogs | Done |
| 4. Admin panel design | A design for the admin panel, with a screen for every part of the site | In progress |
| 5. Backend | The site is managed from the admin panel; a working contact form | Planned |
| 6. Search and performance pass | Search, performance and structured data at their highest scores; the site audit and Lighthouse return to CI | Planned |
| 7. Security review and 1.0 | Full security tests, first stable release | Planned |

Before 1.0.0, releases use MINOR versions ([ADR 0007](adr/0007-versioning-and-releases.md)).
