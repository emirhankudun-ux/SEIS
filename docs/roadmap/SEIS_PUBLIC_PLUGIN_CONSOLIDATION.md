# SEIS Public Capability-Package Consolidation

**Goal:** `SEIS-GOAL-0024`
**Parent goal:** `SEIS-GOAL-021`
**Scope:** Public `SEIS Repo` marketplace projection only
**Status:** Implemented repository-locally; not pushed, published, signed, or released

SEIS Repo now projects 34 public cards instead of 381 individual discovery
cards. `seis-ai-agent@seis-repo` remains the only canonical default install.
The other 33 cards are optional selection bundles; they do not bulk-install
their members and they grant no provider, network, secret, deployment, or
external-write authority.

## Implemented Experience

| Surface | Cards | Retained capabilities | Default install |
| --- | ---: | ---: | --- |
| SEIS-Agent | 1 | Existing unified suite | Yes |
| Application journey bundles | 6 | 75 application packages | No |
| Topic-boundary bundles | 27 | 300 topic packages | No |
| Total marketplace | 34 | 375 bundled source packages | One canonical install |

Every application and topic package appears in exactly one deterministic
bundle. Bundles contain no more than 15 members. Large categories are balanced
across multiple numbered parts rather than leaving a one-member remainder.
The smallest current bundle contains six capabilities and the largest contains
15.

Application packages are curated into four user journeys: AI and Data,
Product Design and Operations, Security, and Developer Engineering. The last
journey is balanced across three parts. Topic packages keep one category per
bundle; large categories are balanced across multiple parts.

Dedicated `ELENI-NEFERI`, `PANTECHNOEPISTEMONOESIS`, and `SEIS` topic bundles
preserve the three product identities. Marketplace consolidation changes
discovery and installation choice only; it does not combine those products or
their canonical repositories.

## Source-Retention Boundary

- All five historical root source modules remain embedded in SEIS-Agent.
- All 75 application source packages remain under `plugins/seis-core`.
- All 300 topic source packages remain under `plugins/seis-topics`.
- No source package was deleted, moved, or physically merged.
- Bundle membership is a reviewable projection, not proof of behavioral
  equivalence.

The machine-readable sources of truth are:

- `content/development/seis-public-plugin-family.json`
- `content/development/seis-public-plugin-bundle-catalog.json`
- `content/development/seis-public-plugin-consolidation.json`
- `.agents/plugins/marketplace.json`

## Runtime and Security Boundary

Each bundle includes a local read-only MCP runtime that reports bundle status,
lists its bounded member map, and produces a planning outline. Generated
runtimes:

- cap MCP headers, frames, pending buffers, and planning requests;
- cap serialized responses and pause input while stdout applies backpressure;
- reject duplicate or oversized `Content-Length` framing;
- read only bounded regular files below a validated repository root;
- reject symbolic-link and path-escape candidates;
- validate profile identity, member count, exact member metadata, installation
  policy, and deny-by-default permissions against embedded generated values;
- verify a closed-world allowlist of 198 generated files and reject extra files,
  directories, links, or special filesystem entries;
- expose no filesystem writes, network clients, child processes, credentials,
  deployment commands, or publication authority.

Path components are revalidated and read targets use no-follow file opens.
A low-likelihood local TOCTOU residual remains if a hostile process can replace
an already-validated ancestor concurrently; generation therefore assumes a
trusted checkout with no untrusted concurrent filesystem writer and fails
closed when drift is detected.

SEIS-Agent remains the recommended install. A bundle should be selected only
when its named journey or topic boundary fits the current task.

## Rollback

Revert the focused capability-package commit to restore the previous generated
marketplace projection. The canonical SEIS-Agent and every retained source
package remain intact, so no data migration or source recovery is required.
GitHub push, pull request, publication, signing, and release remain separate
human-approved actions.

## Validation

```bash
npm run check:seis-public-plugin-family
npm run check:seis-public-plugin-bundles
npm run check:seis-public-plugin-consolidation
node --test plugins/seis-core/test/public-plugin-bundles.test.mjs
node --test plugins/seis-core/test/public-plugin-consolidation.test.mjs
npm run check:seis-repo-marketplace
git diff --check
```
