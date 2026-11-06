# Security

Security notes for the project. To report a vulnerability, follow [SECURITY.md](../../SECURITY.md).

## Current state

- The site has no accounts and stores no visitor data.
- The contact form validates input in the browser and sends nothing.
- No backend, database or authentication exists yet (planned).

## Automated checks

CI runs Semgrep (project rules and registry rule sets), zizmor on the workflow files, a dependency audit, a license check for production dependencies, and a secret scan. See [ADR 0005](../adr/0005-ci-and-protection-layers.md).

## Review

A security review is planned before 1.0 ([roadmap](../roadmap.md)). Its findings will be added to this folder.
