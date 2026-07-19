# SEIS Legacy Personal Plugin Reconciliation

Date: 2026-07-14
Status: active migration evidence; 50 local packages copied into the SEIS Command Center application boundary; not a public release confirmation

## Purpose

This record explains how legacy, local-only SEIS plugin sources are reconciled
with the canonical public-safe source modules in this repository. It preserves
the useful source material while preventing a personal marketplace, machine
paths, credentials, archives, caches, or runtime side effects from becoming a
second source of truth.

The canonical default installation surface remains
`seis-ai-agent@seis-repo`. The five root modules listed below are additionally
published as direct `seis-repo` cards while remaining embedded through that
package; this replaces their historical personal-marketplace visibility without
creating another default install target.

## Discovery Boundary

The local audit discovers only plugin roots whose names are `seis` or start
with `seis-`. Its supported discovery categories are:

- explicitly configured plugin roots;
- `$HOME/plugins`; and
- every readable version root in the Codex personal plugin cache.

It is read-only. It validates manifests and portable source paths but never
executes a legacy MCP server, invokes a provider, changes a personal
marketplace, or copies a local folder into the repository.

## Reconciliation Matrix

| Legacy personal source | Canonical repository mirror | Result |
| --- | --- | --- |
| `seis` | `plugins/seis` | Direct `seis@seis-repo` card and embedded governance lane. |
| `seis-cloud` | `plugins/seis-cloud` | Direct `seis-cloud@seis-repo` card and embedded Cloud lane. |
| `seis-code` | `plugins/seis-code` | Direct `seis-code@seis-repo` card and embedded Code lane. |
| `seis-design` | `plugins/seis-design` | Direct `seis-design@seis-repo` card and embedded Design lane. |
| `seis-data` | `plugins/seis-data` | Direct `seis-data@seis-repo` card and embedded Data lane. |

Repo-only modules such as Security, Research, Automation, Product, and the
SEIS-Agent orchestrator do not require a legacy personal-cache counterpart.
They are intentional additions to the repository-owned suite.

## SEIS Command Center application migration

On 2026-07-15, the 50 personal-only SEIS plugin packages that were absent from
the repository were copied, without execution or overwrite, into:

```text
plugins/seis-core/
```

The migration intentionally excludes macOS metadata, symlinks, private
filenames, credentials, environment files, keys, caches, and personal
marketplace mutation. The canonical Plugin Registry records the migrated
packages and preserves their local-only license and implementation states:

```text
content/development/seis-ai-core-plugin-registry.json
```

The complete 55-name personal coverage evidence is recorded in:

```text
content/development/seis-ai-core-personal-plugin-coverage.json
```

It records 55 repository counterparts, five existing-module overlaps and 50
packages migrated into the SEIS Command Center application source boundary
without storing the local machine path or mutating the personal marketplace.

The app-owned source inventory is recorded in:

```text
apps/seis-core/data/seis-core-plugin-sources.json
```

`packages/seis-ai` owns only the registry projection, contracts, permission
policy, and read-only inspection runtime. It must not become a second source
root for the personal packages.

The five overlapping personal lane identities now have direct public
repository-card counterparts. Their older local folders remain compatibility
evidence and are not deleted or rewritten by repository tooling; removing a
personal marketplace source from the Codex client is an explicit, reversible
user-side configuration operation.

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
npm run check:seis-personal-plugin-marketplace-migration
npm run check:seis-public-plugin-family
npm run check:seis-public-plugin-lifecycle
npm run check:seis-ai-agent
```

For long-horizon admission, maintenance, and archival rules, see the
[SEIS plugin ecosystem stewardship roadmap](../roadmap/seis-plugin-ecosystem-10-year-stewardship.md).
