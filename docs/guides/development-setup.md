# Development setup

This guide explains how to set up and run the project on your machine. The Git rules are in the [Git workflow guide](git-workflow.md). The reasoning behind the technology choices is in the [architecture decision records](../adr/README.md).

## Supported environments

- **Windows:** Git Bash and PowerShell 5.1. The setup script (`.sh`) runs in Git Bash. The Node tools (`node tooling/scripts/...ts`) run in both shells.
- **Linux:** the same commands. CI runs on Linux (`ubuntu-latest`). The `tooling (windows)` job also tests the repository tools on Windows.
- **Node:** 24 (`.node-version`). The `engines` field in `package.json` asks for `>=24.12.0 <25`. Node 24 runs `.ts` files without a build step. All code in the project is TypeScript; there is no plain JavaScript.
- **Package manager:** pnpm, pinned in the `packageManager` field of `package.json`. Corepack provides it, so you do not install pnpm yourself.

## First setup

Once per clone, to run the site.

1. Clone the repository and enter the folder: `git clone https://github.com/egecanakincioglu/gul-can-mimarlik.git`, then `cd gul-can-mimarlik`.
2. Enable Corepack: `corepack enable`. On Windows this can fail with `EPERM` when it writes to `C:\Program Files\nodejs`. Run it once in an administrator terminal.
3. Install the dependencies from the lock file: `pnpm install --frozen-lockfile`.
4. Start the site with `pnpm dev` and open http://localhost:3000.

The site needs no database today. One optional environment variable exists. `ADMIN_ENABLED` defaults to `false` (see `.env.example`), and `/yonetim` answers 404 in that case. To open the admin panel locally, set `ADMIN_ENABLED=true` in `.env.local` and restart `pnpm dev`. The panel works on mock data. With the variable set, `/yonetim` opens the panel, and `/yonetim/giris` accepts any input in the demo. The `Demo verisini sıfırla` button on the overview resets the stored data.

Only if you plan to commit:

5. Set up commit signing: `bash tooling/scripts/setup-commit-signing.sh`. Your Git identity (`user.email`) must be set; if it is not, the script stops. An existing `user.signingkey` is kept. Commits are signed with an SSH key.

## Troubleshooting

- **`corepack enable` fails with `EPERM` on Windows.** Corepack cannot write to `C:\Program Files\nodejs`. Run the command once in an administrator terminal.
- **The Node version does not match.** The project asks for the version in `.node-version` (Node 24). Install that version, open a new terminal and check it with `node --version`.

## Daily commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint, with zero warnings allowed |
| `pnpm typecheck` | Next.js type generation, then `tsc` for the application and the tooling |
| `pnpm test` | Vitest with the coverage gate |
| `pnpm format` / `pnpm format:check` | Write or check formatting with Prettier |
| `pnpm knip` | Find unused files, exports and dependencies |
| `pnpm start` | Serve the production build (run `pnpm build` first) |
| `pnpm site-audit --leg pages` | Page audit: status codes, 404 path, overflow, accessibility, image sizes, console errors. Run `pnpm build` first. The audit starts the server itself and needs Chrome (set `CHROME_PATH` if it is not in the default place). `--leg mobile` and `--leg desktop` run Lighthouse |
| `node --test "tooling/**/*.test.ts"` | Tests of the repository tools |
| `pnpm release:prepare` | Prepare a release (see the [release runbook](../runbooks/release-and-rollback.md)) |

Run `pnpm typecheck`, `pnpm lint`, `pnpm format:check` and `pnpm test` before you open a pull request. CI runs the full set of checks.

## Documentation checks

- `node tooling/scripts/check-docs-language.ts` checks that documentation is English and that file names follow the rules.
- `node tooling/scripts/check-doc-links.ts` fails on a relative Markdown link that points to a missing file.
- `node tooling/scripts/check-doc-commands.ts` checks that the commands named in the documentation exist.

## Visual checks

A change to the user interface is checked in a browser at these widths: 360 and 390 (phone), 768 (tablet portrait), 1024 (tablet landscape) and 1440 (desktop). Changes to the fixed header, the menu or dialogs are also checked at 844x390 (phone landscape). Before a release the site is also checked at 1920, 768x1024 and 1024x768. `pnpm site-audit --leg pages` sweeps widths from 320 to 2560 and checks overflow, accessibility, image sizes and console errors ([ADR 0006](../adr/0006-quality-targets-and-thresholds.md)).
