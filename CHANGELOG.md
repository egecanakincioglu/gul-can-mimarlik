# Changelog

All notable changes to this project are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The Turkish site of Gül CAN: home, services, project list, four project pages, studio and contact pages, and a 404 page.
- Concept project pages with illustrative images, labelled on the site as such.
- A contact form that validates input and sends nothing.
- Typed content in `src/content` and Tailwind CSS 4 styling with design tokens.
- Tests with Vitest and Testing Library, with a coverage gate for `src/lib` and `src/server`.
- Repository tooling in `tooling/`: documentation, commit, branch, signature, coverage, release and dependency checks, and Semgrep rules.
- A site audit, run locally, that checks status codes, the 404 path, overflow, accessibility, image sizes, console errors and Lighthouse scores.
- CI with 9 required checks, a release workflow that deploys from a signed `vX.Y.Z` tag, and a release rehearsal workflow.
- Documentation: architecture, roadmap, decision records, guides, a security policy and a release runbook.
- The PolyForm Noncommercial 1.0.0 license for the code, and a notice for the content that the license does not cover.
