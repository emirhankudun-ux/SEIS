# SEIS Plugin Ecosystem — Ten-Year Stewardship Roadmap

Status: planned, evidence-led
Date: 2026-07-14
Scope: repository-contained SEIS plugins, embedded skills, MCP surfaces, and
their public installation contract

## Purpose

Keep the SEIS plugin ecosystem together in the canonical `SEIS` repository for
the next ten years while preserving a small public installation surface,
explicit ownership, and reversible upgrades. This is a stewardship roadmap,
not a claim of background execution. Each future increment must be performed
in an active, reviewable session or an explicitly configured automation with
recorded evidence.

## Canonical shape

The public installation surface is `seis-ai-agent@seis-repo`. Its source
package embeds the following SEIS lanes and supporting modules:

- `seis`
- `seis-cloud`
- `seis-code`
- `seis-design`
- `seis-data`
- `seis-security`
- `seis-research`
- `seis-automation`
- `seis-product`
- `seis-ai-agent`

The lane directories remain in the repository as inspectable source modules.
The marketplace does not need ten separate public cards for one coordinated
installation. Personal plugin folders, personal marketplace mirrors, caches,
screenshots, archives, credentials, and machine-specific metadata remain local
and are never treated as public source without a separate review.

## Ten-year phases

| Phase | Horizon | Reviewable outcome |
| --- | --- | --- |
| 1 | Year 1 | Consolidate the ten source modules, manifests, embedded skills, MCP contracts, validators, and public/private boundary. |
| 2 | Year 2 | Stabilize versioned lane contracts, deterministic smoke tests, compatibility fixtures, and release notes. |
| 3 | Year 3 | Expand supervised agent routing, approval gates, audit events, and local/offline operation without weakening least privilege. |
| 4 | Year 4 | Add well-scoped extension interfaces, provider-neutral adapters, and migration guides only where a real consumer exists. |
| 5 | Year 5 | Mature documentation, accessibility, performance, supply-chain, dependency, and public-readiness gates. |
| 6 | Year 6 | Improve cross-repository contracts and interoperability while retaining one canonical owner for every module. |
| 7 | Year 7 | Strengthen privacy-aware data handling, provenance, local-first workflows, retention, and rollback evidence. |
| 8 | Year 8 | Review marketplace and SDK evolution, deprecate redundant lanes, and keep compatibility aliases explicit. |
| 9 | Year 9 | Exercise recovery, archival, security incident, and long-term migration procedures against recorded fixtures. |
| 10 | Year 10 | Publish a stable platform assessment, refresh the next horizon, and archive or renew capabilities based on evidence. |

## Annual review contract

At least once per annual planning cycle, the owner should record:

1. repository and branch state;
2. canonical ownership and public/private boundary review;
3. plugin and skill manifest validation;
4. MCP/tool permission and secret-safety review;
5. compatibility, accessibility, performance, and security evidence;
6. deprecated, blocked, and newly proposed modules;
7. rollback and archival decisions; and
8. the next bounded Goal and its acceptance criteria.

An annual review that cannot run in the current environment must be marked
planned or blocked with the exact missing evidence. It must not be reported as
completed merely because the roadmap exists.

## New plugin admission

Every new SEIS-related plugin must provide a manifest, README, skill or runtime
contract, owner, maturity, permissions, validation commands, rollback note, and
an explicit decision about whether it is an embedded lane or a public install
surface. A local personal plugin is eligible for promotion only after its
source is inspected for secrets, personal paths, private media, unsupported
claims, and duplicated ownership.

## Definition of done for each phase

- The phase has a project-aware Goal and a narrow scope.
- Changes are made on a reviewable branch and linked to an issue or PR.
- Applicable plugin, skill, runtime, security, accessibility, and regression
  checks have reproducible evidence.
- Failed or unavailable checks are recorded.
- Documentation, ownership, and rollback are updated.
- The repository state is reported honestly.

The ten-year commitment is therefore a sequence of evidence-backed decisions,
not an unbounded request for autonomous work after this session ends.
