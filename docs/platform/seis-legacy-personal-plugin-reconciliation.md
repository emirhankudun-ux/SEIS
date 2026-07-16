# SEIS Legacy Personal Plugin Reconciliation

Date: 2026-07-14
Status: active migration evidence; not a public release confirmation

## Purpose

This record explains how legacy, local-only SEIS plugin sources are reconciled
with the canonical public-safe source modules in this repository. It preserves
the useful source material while preventing a personal marketplace, machine
paths, credentials, archives, caches, or runtime side effects from becoming a
second source of truth.

The canonical public installation surface remains
`seis-ai-agent@seis-repo`. The source modules listed below remain repository
owned and are embedded through that package rather than being separate public
marketplace entries.

## Discovery Boundary

The local audit discovers only plugin roots whose names are `seis` or start
with `seis-`. Its supported discovery categories are:

- explicitly configured plugin roots;
- `$HOME/plugins`; and
- the Codex personal plugin cache.

It is read-only. It validates manifests and portable source paths but never
executes a legacy MCP server, invokes a provider, changes a personal
marketplace, or copies a local folder into the repository.

## Reconciliation Matrix

| Legacy personal source | Canonical repository mirror | Result |
| --- | --- | --- |
| `seis` | `plugins/seis` | Preserved as the governance/source module with portable repository defaults. |
| `seis-cloud` | `plugins/seis-cloud` | Preserved as the Cloud source module and embedded SEIS-Agent lane. |
| `seis-code` | `plugins/seis-code` | Preserved as the Code source module and embedded SEIS-Agent lane. |
| `seis-design` | `plugins/seis-design` | Preserved as the Design source module and embedded SEIS-Agent lane. |
| `seis-data` | `plugins/seis-data` | Preserved as the Data source module and embedded SEIS-Agent lane. |

Repo-only modules such as Security, Research, Automation, Product, and the
SEIS-Agent orchestrator do not require a legacy personal-cache counterpart.
They are intentional additions to the repository-owned suite.

## Public-Safe Divergence Rules

A local mirror is source evidence, not a file-by-file release artifact. The
repository version is deliberately allowed to differ when it removes or
replaces:

- `UNLICENSED` personal manifests with the public MIT manifest;
- absolute home-directory paths and machine-specific workspace defaults;
- personal-marketplace install commands and cache-refresh instructions;
- historical branch assumptions; and
- operating-system metadata such as `.DS_Store`.

Repository modules may also contain newer skills, stronger validation, or
portable documentation that has no legacy counterpart. These additions are not
evidence of a missing local source.

No local plugin file may be promoted when its path is an environment file,
credential file, token file, private key, PEM, or key material. A newly
discovered portable source path without a repository counterpart is a failed
migration audit and must be reviewed in a focused follow-up change.

## Verification

Run the local, non-executing reconciliation audit when personal sources are
available:

```bash
npm run check:seis-specialist-plugins -- --include-legacy-personal
```

The output names only discovered SEIS packages, source-root count, and discovery
categories. It does not print local root paths or execute local MCP code. Then run the
repository checks:

```bash
npm run check:seis-specialist-plugins
npm run check:seis-public-plugin-family
npm run check:seis-public-plugin-lifecycle
npm run check:seis-ai-agent
```

For long-horizon admission, maintenance, and archival rules, see the
[SEIS plugin ecosystem stewardship roadmap](../roadmap/seis-plugin-ecosystem-10-year-stewardship.md).
