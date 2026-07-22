# SEIS Public Plugin User Readiness

This readiness gate reflects the active v2 distribution, not historical
34-card evidence.

## What it verifies automatically

- The repository marketplace exposes exactly ten public general plugins.
- `SEIS-Agent` is the default public card.
- Thirty hidden internal packages cover retained source capabilities, with a
  maximum of 15 capabilities in each package.
- A user selects one general plugin per scoped task; internal packages are not
  direct installation targets.
- The unified suite, version-increase policy, agent contract, and foreground
  Auto Mode record are internally consistent.
- The active cadence contains five 30-step rounds before five 100-step waves,
  and the distribution roadmap delegates execution to the hardened Goal 0025
  runner instead of defining a second editable command allowlist.

## Commands

Repository-only, suitable for CI:

```bash
npm run check:seis-public-plugin-user-readiness
```

Optional read-only local configuration review:

```bash
npm run check:seis-public-plugin-user-readiness:local
```

The local review never writes the Codex configuration. It only detects legacy
`@personal`, numbered bundle, or directly embedded source records and then
asks for an explicit reviewed cleanup action.

## Status values

| Status | Meaning |
| --- | --- |
| `repo-ready-local-config-unverified` | Repository artifacts are valid; no local Codex configuration was read. |
| `ready-for-manual-codex-ui-review` | Local configuration has no detected legacy records; refresh Codex to verify the rendered UI. |
| `local-config-attention` | Retired personal, numbered-bundle, or direct source records still need a reviewed migration plan. |
| `invalid-repository-contract` | Generated package, version, suite, or Auto Mode validation failed. |

## Manual proof remains necessary

Refresh Codex and verify that the **SEIS Repo** section shows ten concise
general plugin names without `Topic … 01/02` duplicates. A static file cannot
prove what the desktop app is currently rendering.

Public marketplace publication, release tags, deployments, provider use, and
external writes stay human-approved. Auto Mode works only in the current
foreground task and does not create a persistent background agent.
