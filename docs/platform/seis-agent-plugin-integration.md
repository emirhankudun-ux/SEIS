# SEIS-Agent Plugin Integration

SEIS-Agent plugin integration keeps SEIS AI as the orchestrator and exposes one
versioned public install surface. Focused lane packages remain preserved
repo-local source modules, not additional public installs.

## Canonical Manifest

The source of truth is:

```text
content/development/seis-agent-plugin-integration.json
```

The primary install id is `seis-ai-agent@seis-repo`. It is the one default
public SEIS install. The source modules for governance, cloud, code, design,
data, security, research, automation, and product are exposed through its
embedded skills and lane tools. They do not have standalone public install ids.

## Runtime Tools

The runtime integration tools are:

- `seis_plugin_integration`
- `seis_public_plugin_family`

These tools are exposed through the SEIS AI tool loop and MCP server so
automation can inspect plugin lane posture, public-family readiness, lifecycle
status, release channel, compatibility, and approval boundaries before making
routing, readiness, release, or connector claims.

The MCP resources are:

- `seis://agent/plugin-integration.json`
- `seis://agent/public-plugin-family.json`
- `seis://agent/public-plugin-lifecycle.json`

## Personal SEIS Plugin Bridge

The legacy Personal SEIS Plugin Bridge remains available for compatibility and
for historical audit evidence. Direct lane tools remain wired for local routing:

- `seis_hub_status`
- `seis_hub_plan`
- `seis_cloud_status`
- `seis_cloud_plan`
- `seis_code_status`
- `seis_code_plan`
- `seis_design_status`
- `seis_design_plan`
- `seis_data_status`
- `seis_data_plan`

## AI Core Resource Bridge

The AI Core Resource Bridge keeps provider, model, version, and sub-agent claims
grounded in repo evidence rather than marketing copy. Runtime tools include
`seis_ai_core_provider_status`, `seis_ai_core_model_scaling_status`,
`seis_ai_core_version_status`, `seis_ai_core_version_promotion_dry_run`, and
`seis_ai_core_subagent_model`.

`SEIS AI Core v0.1` remains a zero-key, status-and-plan-only profile. Its
version registry is `content/development/seis-ai-core-version-registry.json`,
its promotion gates are
`content/development/seis-ai-core-version-promotion-gates.json`, and the MCP
runtime contract is exposed through `seis://ai/mcp-runtime-contract.json`.

The Installed AI Core Route Matrix and Personal Plugin AI Core Lane Matrix bind
these records to SEIS-Agent lane routing. The MCP Runtime Contract lives at
`content/development/seis-ai-core-mcp-runtime-contract.json` and is exposed as
`seis://ai/mcp-runtime-contract.json` through the no-dependency local fallback transport.

AI Core source records and resources include:

- `content/development/seis-ai-core-provider-registry.json`
- `content/development/seis-ai-core-version-registry.json`
- `content/development/seis-ai-core-version-promotion-gates.json`
- `content/development/seis-ai-core-mcp-runtime-contract.json`
- `content/development/seis-model-scaling-hardware-profile.json`
- `seis://ai/mcp-runtime-contract.json`
- `seis://ai/provider-registry.json`
- `seis://ai/version-registry.json`
- `seis://ai/version-promotion-gates.json`
- `seis://ai/model-scaling-hardware-profile.json`
- `seis://ai/model-parameter-ladder.json`
- `seis://ai/model-frontier-escalation-policy.json`
- `seis://ai/150b-frontier-model-program.json`
- `seis://ai/agi-github-user-readiness-gates.json`
- `seis://ai/sub-agent-5-year-plan-view.json`

The personal plugin source boundary belongs to the SEIS Command Center
application:

- source root: `plugins/seis-core`
- source inventory: `apps/seis-core/data/seis-core-plugin-sources.json`
- release train: `content/development/seis-core-plugin-release-train.json` (`0.000000012` / `0.0.12`)
- registry projection: `content/development/seis-ai-core-plugin-registry.json`
- current app-owned source count: 60
- direct repo surface: `apps/seis-core` reads and activates these packages through the bounded local catalog

`packages/seis-ai` remains the core contract, permission, registry, and
read-only inspection layer. It must not own or execute the personal source
packages as a second source root. The app source gate is
`npm run check:seis-core-plugin-sources`.

## Public Plugin Distribution

SEIS has one public plugin:

| Public Plugin | Role |
| --- | --- |
| `seis-ai-agent@seis-repo` | SEIS AI orchestrator, cross-lane router, and sole public install. |

Its embedded source modules are preserved in the repository and exposed through
the installed agent:

| Module | Role |
| --- | --- |
| `seis` | Core SEIS governance and hub lane. |
| `seis-cloud` | Cloud and deployment operations lane. |
| `seis-code` | Code automation and implementation lane. |
| `seis-design` | Design systems and product experience lane. |
| `seis-data` | Data, analytics, and reporting lane. |
| `seis-security` | Threat modeling, secret-safety, access, and release-risk lane. |
| `seis-research` | Official-source research, evidence, version, and decision-support lane. |
| `seis-automation` | Repeatable scripts, checks, CI, runbooks, and workflow lane. |
| `seis-product` | Roadmap, requirements, acceptance, and launch-readiness lane. |

The public-family contract is generated at `content/development/seis-public-plugin-family.json` and summarized at `reports/seis-public-plugin-family.md`.
The one-file suite installed by default is
`plugins/seis-ai-agent/assets/unified-suite.json`. It records every current
SEIS public component, the shared `0.3.0+codex.20260712` release version, the
60 app-owned `plugins/seis-core/*` source packages, canonical
`seis-ai-agent@seis-repo` install id, and the future plugin intake rules. A
new public `plugins/seis-*` manifest must be registered as an embedded source
module. A new package for the user's Command Center application must be
created under `plugins/seis-core/<plugin-name>`, regenerated into the app
inventory/catalog, and covered by the app-owned section of this suite.
The canonical alias contract is
`content/development/seis-plugin-canonicalization.json`; the sanitized external
proof intake contract is
`content/development/seis-public-plugin-independent-runner-evidence-contract.json`.
The long-horizon release and compatibility lifecycle is generated at
`content/development/seis-public-plugin-lifecycle.json` and summarized at
`reports/seis-public-plugin-lifecycle.md`.
The fresh-task reload proof contract is generated at
`content/development/seis-public-plugin-fresh-task-proof.json` and summarized
at `reports/seis-public-plugin-fresh-task-proof.md`.
The fresh-task reload evidence snapshot is captured at
`content/development/seis-public-plugin-fresh-task-reload-evidence.json` and
summarized at `reports/seis-public-plugin-fresh-task-reload-evidence.md`.
The repo-local security/provenance review is generated at
`content/development/seis-public-plugin-security-provenance-review.json` and
summarized at `reports/seis-public-plugin-security-provenance-review.md`.
The clean-artifact and independent-install proof is generated at
`content/development/seis-public-plugin-external-install-proof.json` and
summarized at `reports/seis-public-plugin-external-install-proof.md`.

Local installation smoke evidence is produced by
`npm run check:seis-public-plugin-install-smoke`. On a machine where the Codex
plugins have actually been installed, use
`npm run check:seis-public-plugin-install-smoke:local` to require all ten
source modules through the one `seis-ai-agent@seis-repo` cache entry. Use
`npm run check:seis-public-plugin-install-smoke:local:mcp` when the installed
agent cache must also prove its MCP server can initialize, list tools, and
execute representative embedded-lane status/plan calls.

## Single Public Suite

Run the default install plan with:

```bash
npm run install:seis-ai-agent
```

It plans one target: `seis-ai-agent@seis-repo`. The suite embeds governance,
cloud, code, design, data, security, research, automation, and product lanes
inside SEIS AI. Source module directories remain for provenance, validation,
and long-horizon development; they are not standalone installation targets.
The app-owned packages remain under `plugins/seis-core` for direct repository
use by `apps/seis-core`; they do not create separate marketplace cards and do
not transfer source ownership into `packages/seis-ai`.

Validate the generated suite with `npm run check:seis-unified-plugin-suite`.
The discovery rules cover both `plugins/seis-*` and
`plugins/seis-core/*/.codex-plugin/plugin.json`: new public modules join the
one SEIS-Agent suite, while new Command Center packages join the app-owned
repo-source inventory. Neither path creates another default install target.
The machine-readable modes are `single-public-plugin` for installation and
`source-module-only` for the embedded lane packages.

## Fresh Task Reload Proof

Fresh-task reload proof is the next public-preview blocker. It is intentionally
not marked complete by local install smoke alone. The proof contract keeps
`publicReleaseAllowed` false until a new Codex task records:

- a fresh task/thread id opened after local plugin installation,
- `npm run check:seis-public-plugin-install-smoke:local:mcp`,
- `npm run check:seis-agent-plugin-integration`,
- `npm test --prefix packages/seis-ai`,
- the `seis_public_plugin_family` result showing 1 public plugin, every embedded module connected, and `runtimeConnected=true`,
- the fresh task MCP inventory showing the SEIS AI bridge and public plugin family.

Validate the proof protocol with `npm run check:seis-public-plugin-fresh-task-proof`.
Capture and validate the current task evidence with
`npm run automation:seis-public-plugin-fresh-task-reload-evidence` followed by
`npm run check:seis-public-plugin-fresh-task-reload-evidence`. This evidence
does not approve public preview; it only records the fresh task id, command
summaries, MCP inventory, and SEIS AI bridge status. Security/provenance review
and human approval remain required.

## Security Provenance Review

Run `npm run automation:seis-public-plugin-security-provenance-review` and
`npm run check:seis-public-plugin-security-provenance-review` before any public
preview claim. The review verifies the one public plugin and all embedded source
module mirrors, manifests,
MIT license declarations, README files, MCP manifests, repo-local MCP commands,
and high-confidence secret patterns without storing raw secret values. It does
not approve publication; human approval and external clean-runner or public
package installation proof remain required.

## Clean Artifact and Independent Runner Proof

Run `npm run automation:seis-public-plugin-external-install-proof` followed by
`npm run check:seis-public-plugin-external-install-proof` before discussing a
public preview. The check creates a disposable local staging directory, copies
only the public SEIS-Agent marketplace artifact, validates its manifest, README,
MCP manifest, MCP entry script, and embedded module contract, then removes the stage. It excludes
macOS `.DS_Store` metadata from the staged artifact and blocks secret-like,
credential, archive, build-cache, and symlink artifact classes.

This is deliberately a repo-local artifact proof, not a public installation
claim. It does not use the network, an existing Codex plugin cache, a public
marketplace publication, live providers, or SSH. A release owner must still
record a sanitized independent clean-runner or public-package installation with
the one installed plugin id, embedded module inventory, MCP results, fresh-task
SEIS AI bridge result, and runner versions. Human approval remains required before any publish, push,
merge, tag, deployment, or public-preview claim.

## Legacy Personal Aliases

The legacy personal SEIS plugin mirrors remain compatibility evidence from the
2026-06-19 audit. They are aliases to embedded SEIS-Agent modules, not separate
SEIS AI lanes. Nothing removes, disables, rewrites, or replaces them:

| Legacy Plugin | Canonical Suite Component |
| --- | --- |
| `seis@personal` | `seis-ai-agent@seis-repo` / `seis` |
| `seis-cloud@personal` | `seis-ai-agent@seis-repo` / `seis-cloud` |
| `seis-code@personal` | `seis-ai-agent@seis-repo` / `seis-code` |
| `seis-design@personal` | `seis-ai-agent@seis-repo` / `seis-design` |
| `seis-data@personal` | `seis-ai-agent@seis-repo` / `seis-data` |

## Specialist Skills

The specialist skills remain embedded inside `plugins/seis-ai-agent/skills` for
SEIS AI routing and are mirrored into preserved source-module packages for
validation and provenance:

| Skill | Role |
| --- | --- |
| `seis-security` | Threat modeling, secret-safety review, access control, SSH/VPN hardening, and release risk. |
| `seis-research` | Evidence-led source review, official documentation checks, version context, and decision synthesis. |
| `seis-automation` | Repeatable scripts, CI checks, runbooks, scheduled jobs, and human-approved agent workflows. |
| `seis-product` | Roadmap slices, requirements, acceptance criteria, launch readiness, and product scope. |

## Runtime Readiness Lanes

The SEIS Agent also includes two runtime lanes to validate plugin and MCP surfaces:

| Lane | Role |
| --- | --- |
| `seis-plugin-runtime` | Plugin manifest health, capability lane drift checks, and safe publish-readiness evidence. |
| `seis-mcp-runtime` | MCP endpoint compatibility, tool boundary checks, and runtime connector evidence. |

## Operating Rules

- Treat `seis-ai-agent@seis-repo` as the single default orchestrator install.
- Keep `seis`, `seis-cloud`, `seis-code`, `seis-design`, `seis-data`, `seis-security`, `seis-research`, `seis-automation`, and `seis-product` as embedded source modules inside the one public suite, never as separate public installs.
- Keep `seis@personal`, `seis-cloud@personal`, `seis-code@personal`, `seis-design@personal`, and `seis-data@personal` as preserved aliases only.
- Route every new `plugins/seis-*` package through `assets/unified-suite.json`, SEIS AI status, MCP routing, the suite generator, and its shared release version before treating it as an embedded SEIS capability.
- Keep `seis-plugin-runtime` and `seis-mcp-runtime` embedded under SEIS-Agent for runtime contract evidence.
- Keep personal plugin source packages under `plugins/seis-core`; keep `packages/seis-ai` limited to contracts, registry metadata, permission policy, and read-only inspection.
- Keep the 60 app-owned packages on one gradual shared release ladder; the current release is `0.000000012`, large-code changes advance exactly one micro/revision step, annual updates advance one major step, and the supported range ends at `45.0000` without bulk jumps.
- Keep every app-owned package directly in the SEIS repository under `plugins/seis-core` and consumed by `apps/seis-core`; a new package must not be placed under `packages/seis-ai` or published as a separate marketplace card.
- Do not claim connector authentication readiness from plugin inventory alone.
- Validate the integration with `npm run check:seis-unified-plugin-suite`, `npm run check:seis-plugin-canonicalization`, `npm run check:seis-agent-plugin-integration`, `npm run check:seis-public-plugin-lifecycle`, `npm run check:seis-public-plugin-family`, `npm run check:seis-public-plugin-fresh-task-proof`, `npm run check:seis-public-plugin-fresh-task-reload-evidence`, `npm run check:seis-public-plugin-security-provenance-review`, `npm run check:seis-public-plugin-external-install-proof`, `npm run check:seis-public-plugin-independent-runner-evidence-contract`, `npm run check:seis-public-plugin-independent-runner-evidence`, `npm run check:seis-public-plugin-install-smoke`, and `npm run check:seis-public-plugin-install-smoke:mcp`.
- Keep Command Center and demo surfaces aligned with the manifest before release or handoff claims.

## Quality Gate

```bash
npm run check:seis-agent-plugin-integration
npm run check:seis-unified-plugin-suite
npm run check:seis-plugin-canonicalization
npm run check:seis-public-plugin-lifecycle
npm run check:seis-public-plugin-family
npm run check:seis-public-plugin-fresh-task-proof
npm run check:seis-public-plugin-fresh-task-reload-evidence
npm run check:seis-public-plugin-security-provenance-review
npm run check:seis-public-plugin-external-install-proof
npm run check:seis-public-plugin-independent-runner-evidence-contract
npm run check:seis-public-plugin-independent-runner-evidence
npm run check:seis-public-plugin-independent-runner-evidence:recorded
npm run check:seis-public-plugin-install-smoke
npm run check:seis-public-plugin-install-smoke:mcp
npm run check:seis-public-plugin-install-smoke:local
npm run check:seis-public-plugin-install-smoke:local:mcp
```
