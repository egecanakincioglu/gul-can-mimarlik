# Gül CAN

The website of Gül CAN, an architecture and interior design office. It presents the services, selected projects, the studio and the contact details. The site is in Turkish only.

## Status

The site is built and runs. The project pages show concept work with illustrative images, and the site labels them as such. The contact form checks the input but sends nothing. A backend is planned. See the [roadmap](docs/roadmap.md).

## Pages

| Route | Page |
|---|---|
| `/` | Home |
| `/hizmetler` | Services |
| `/projeler` | Project list |
| `/projeler/<slug>` | Project detail: `avlulu-konut`, `daire-yenileme`, `yamac-evi`, `kose-kafe` |
| `/studyo` | Studio |
| `/iletisim` | Contact |

Unknown paths show a 404 page.

## Run it locally

1. Install Node 24 (see `.node-version`) and enable Corepack: `corepack enable`.
2. Install the dependencies: `pnpm install --frozen-lockfile`.
3. Start the development server: `pnpm dev`. Open http://localhost:3000.

The site needs no environment variables and no database. The [development setup guide](docs/guides/development-setup.md) has the details, the daily commands and troubleshooting.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) first. In short: one branch per piece of work, signed Conventional Commits in English, a pull request, and all required CI checks green. The [Git workflow guide](docs/guides/git-workflow.md) has the details. To report a security problem, follow [SECURITY.md](SECURITY.md).

## Documentation

The [docs folder](docs/README.md) holds the architecture, the roadmap, the decision records, the guides and the runbooks.

## License

The source code is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE). The office name, logo, texts, contact details and images are not covered; see [NOTICE.md](NOTICE.md).
