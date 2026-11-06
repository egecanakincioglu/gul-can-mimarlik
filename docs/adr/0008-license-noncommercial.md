# ADR 0008: License, noncommercial code and reserved content

Status: Accepted
Date: 2026-11-05

## Context

The repository is public so that others can read the code. The site belongs to an office. Its code may be studied and reused for noncommercial purposes. The office name, logo, texts, contact details and images must not be reused.

## Options

| Option | Pros | Cons |
|---|---|---|
| MIT | Widely accepted | Allows commercial use |
| PolyForm Noncommercial 1.0.0 | Allows reading, study and noncommercial reuse; forbids commercial use | Not an OSI-approved license, so the project is source-available, not open source |
| All rights reserved | Full control | Others cannot reuse the code |

## Decision

The code is licensed under the PolyForm Noncommercial License 1.0.0 (`LICENSE`, with the line `Required Notice: Copyright Egecan Akıncıoğlu`). Commercial use is prohibited. `NOTICE.md` states that the license covers the code only. The name `Gül CAN Mimarlık`, its logo and brand marks, the contact details and texts of the office, and the images in `public/images/` are all rights reserved and are not licensed. Gül CAN has given permission for them to appear in the repository.

Rules:

1. The project calls itself source-available, never open source.
2. Contributions are accepted under the same license ([CONTRIBUTING.md](../../CONTRIBUTING.md)).
3. Contributors do not add, invent or change this content.
4. CodeQL is not available for code that is not under an OSI-approved license. The `semgrep-registry` and `zizmor` jobs cover static analysis instead ([ADR 0005](0005-ci-and-protection-layers.md)).
5. Production dependencies must have permissive licenses.

## Consequences

- Positive: the license matches the aim; commercial use needs a separate agreement with the author.
- Negative: some registries and lists accept only OSI-approved licenses. Semgrep registry rules are pattern-based and find fewer problems than CodeQL data-flow analysis.
- A fork must replace this content with its own.

## Sources

- https://polyformproject.org/licenses/noncommercial/1.0.0/
- https://spdx.org/licenses/PolyForm-Noncommercial-1.0.0.html
- https://github.com/github/codeql-cli-binaries/blob/main/LICENSE.md
