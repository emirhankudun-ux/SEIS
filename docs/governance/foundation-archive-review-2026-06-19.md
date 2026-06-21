# SEIS Foundation Archive Review

Date: 2026-06-19

This note records the approved foundation cleanup boundary for the SEIS
repository. It is intentionally narrow: it documents what may enter the next
cleanup pull request and what must stay out until a later focused review.

## Approved PR Surface

- `.gitignore` hygiene for dependencies, generated files, archives, local
  reports, OS metadata, environment files, and secret material.
- Guardian security workflow wiring for the reviewed Gitleaks configuration.
- Gitleaks configuration for synthetic redaction test fixtures.
- iCloud/GitHub workspace ingestion documentation that names the current SEIS
  repository and branch.
- This foundation/archive review note.

## Excluded From This PR

- Raw iCloud workspace dumps.
- The separate iCloud Drive `SEIS` intake checkout.
- `SEIST/` and other duplicate repository copies.
- Portfolio repository copies.
- Desktop ZIPs, screenshots, and macOS resource-fork metadata.
- `node_modules`, `dist`, `build`, `.build`, `.swiftpm`, cache folders, and
  release ZIPs.
- Real `.env` files, private keys, tokens, credentials, and private memory
  material.
- Unreviewed app, server, cloud, plugin, MCP, polyglot, and generated report
  changes.

## Decision

The next cleanup branch may improve foundation hygiene and documentation only.
Archive material remains source-neutral reference material until a maintainer
promotes individual files through focused review.
