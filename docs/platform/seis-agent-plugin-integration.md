# SEIS-Agent Plugin Integration

SEIS-Agent plugin integration keeps the public install surface narrow while preserving focused personal plugin lanes inside the canonical agent package.

## Canonical Manifest

The source of truth is:

```text
content/development/seis-agent-plugin-integration.json
```

The primary install id is `seis-ai-agent@seis-repo`. Specialist SEIS plugin surfaces are embedded lanes, not competing primary installs.

## Runtime Tool

The runtime integration tools are `seis_plugin_integration`,
`seis_ai_core_provider_status`, `seis_ai_core_model_scaling_status`,
`seis_ai_core_read_only_route`,
`seis_ai_core_version_status`, `seis_ai_core_version_promotion_dry_run`,
`seis_ai_core_subagent_model`, `seis_ai_core_subagent_dry_run`, and
`seis_ai_core_subagent_review_ledger`.

These tools are exposed through the SEIS AI tool loop and MCP server so
automation can inspect plugin lane posture, SEIS AI Core v0.1 version binding,
provider status, planned 20B/70B/150B model-scaling posture,
version-promotion-gates readiness, the bounded sub-agent operating model,
five-year plan linkage, generated plan-view evidence, quarterly review ledger,
dry-run decisions, and approval boundaries before making routing, readiness, or
connector claims.

The MCP resource set includes `seis://agent/plugin-integration.json`,
`seis://ai/provider-registry.json`,
`seis://ai/model-scaling-hardware-profile.json`,
`seis://ai/150b-frontier-model-program.json`,
`seis://ai/agi-github-user-readiness-gates.json`,
`seis://ai/version-registry.json`,
`seis://ai/version-promotion-gates.json`,
`seis://ai/subagent-operating-model.json`,
`seis://ai/sub-agent-5-year-plan.json`,
`seis://ai/sub-agent-5-year-plan-view.json`,
`seis://ai/subagent-runtime-fixtures.json`, and
`seis://ai/subagent-review-ledger.json`.

The generated plan-view source is
`apps/seis-demo-web/data/seis-sub-agent-five-year-plan-view.json`. It is
produced from `content/development/seis-sub-agent-5-year-plan.json` by
`scripts/create-sub-agent-five-year-demo-evidence.mjs` and is safe for
Command Center, demo, and MCP read-only display. It is not a second source of
truth and does not authorize background agents, release promotion, GitHub
mutation, provider calls, SSH, cloud deployment, or credential access.

The desktop SEIS AI surface exposes this same integration in two local-demo
panels:

- `Personal SEIS Plugin Bridge` in Plugin Center maps `seis@personal`,
  `seis-cloud@personal`, `seis-code@personal`, `seis-design@personal`, and
  `seis-data@personal` to their embedded lanes, direct status/plan tools, source
  mirrors, and validation gates.
- `AI Core Resource Bridge` in Installed AI displays
  `seis://ai/sub-agent-5-year-plan-view.json` and can export a browser-local
  VFS artifact for review.
- `Installed AI Core Route Matrix` in Installed AI binds Codex, Local Demo,
  Claude Review Profile, Qwen Alternative Review, Gemini Secondary Validation,
  and Ollama Local Candidate to explicit SEIS AI Core version targets, route
  modes, provider states, credential boundaries, and sub-agent duties.
- `Personal Plugin AI Core Lane Matrix` in Installed AI binds
  `seis@personal`, `seis-cloud@personal`, `seis-code@personal`,
  `seis-design@personal`, and `seis-data@personal` to explicit SEIS AI Core
  version gates, direct plan/status tool pairs, validation gates, and
  `plan-only` permission boundaries.
- `MCP Runtime Contract` in Installed AI displays the local newline-delimited stdio JSON-RPC
  contract from `content/development/seis-ai-core-mcp-runtime-contract.json`,
  37 tools, 30 resources, 3 prompts, the no-dependency fallback transport, and
  the smoke-test gate that proves SEIS AI Core can read plugin/provider/model-scaling
  resources, including `seis://ai/model-parameter-ladder.json` and
  `seis://ai/model-frontier-escalation-policy.json`, read
  `seis://ai/mcp-runtime-contract.json`, and execute repo-backed tools without
  external servers.
- The same plugin integration resource exposes the six-entrypoint local MCP mesh
  from the bundled `.mcp.json` files. `npm run check:seis-plugin-mcp-mesh` probes
  each local entrypoint through shell-free stdio `tools/list` and exactly one
  allowlisted local status tool; it does not start remote sessions, read
  credentials, or perform mutation.

Both panels are evidence views. They do not store credentials, authenticate
connectors, call live model providers, execute SSH, mutate GitHub, deploy, or
promote SEIS AI Core versions.

The dedicated `apps/seis-core` Command Center consumes the same evidence through
`content/development/seis-ai-core-application-integration.json`. The deterministic
builder at `packages/seis-ai/src/model/core-runtime-snapshot.mjs` joins the
provider registry, executable read-only router, canonical Second Brain managed
agent roster, unified plugin audit, five personal lanes, and MCP runtime metadata into the tracked static artifact
`apps/seis-core/data/seis-ai-core-runtime-snapshot.json`.

The same artifact now includes the source-backed
`seis-plugin-capability-catalog`. It projects all six bundled plugin manifests,
the five personal plugin manifests and their 51 declared capabilities, the four
  specialist lane profiles and their 18 quality-command declarations, every
  declared capability/path/guardrail/helper family, and their Core lane quality
  gate bindings. Missing source files remain explicit:
the SEIS hub lane profile is not fabricated when
`plugins/seis/assets/lane-profile.json` is absent. This catalog is local,
read-only evidence; it does not install, activate, authenticate, or invoke a
plugin.

The AI Core Runtime panel can switch among source-generated decision scenarios
and copy a credential-free handoff. It does not embed the MCP server, read
credentials, call providers, start a live MCP session, execute SSH, deploy,
read private content, or mutate GitHub. `Available` is repository-fixture status,
not proof of browser provider connectivity. Validate delivery drift with
`npm run check:seis-core-ai-runtime-snapshot`.

The Agents surface reads the whitelisted 9-lane/13-agent roster from the same
snapshot. Its authority is `status-and-plan-only`; every managed agent has
`executionAuthority: false`, mutation requires human approval, and the browser
does not receive vault paths, training paths, installed provider profiles,
credentials, prompt bodies, or private note content. The scoped source is
`content/development/seis-second-brain-system.json`; generated public-demo
reports remain audit evidence rather than runtime authority.

`SeisPlatformKit` consumes this artifact through
`SeisAICoreRuntimeSnapshotContract`. Swift decoding uses injected `Data` and
validates the native consumer, application boundary, managed agents, providers,
routes, plugin lanes, MCP metrics, and no-live runtime claims. It does not start
a provider, router, MCP client, SSH session, deployment, or GitHub mutation.

The SEIS MCP stdio entrypoint also has a no-dependency local fallback transport
for repository smoke tests. It serves the same repo-backed tools, prompts, and
resources when `@modelcontextprotocol/sdk` is unavailable in the local package
install, so `node --test packages/seis-ai/test/mcp-smoke.test.mjs` can verify
the SEIS AI Core plugin tools without installing dependencies or calling remote
MCP servers.

The version registry source is
`content/development/seis-ai-core-version-registry.json`; it exposes SEIS AI
Core v0.1 through `seis_ai_core_version_status` as a zero-key, status/plan-only
application-layer profile.

The provider registry source is
`content/development/seis-ai-core-provider-registry.json`; it exposes
`seis_ai_core_provider_status` and `seis://ai/provider-registry.json` as
repository-local status evidence only. It performs no live provider calls,
credential validation, network health checks, SSH, deployment, or GitHub
mutation.

The model-scaling source is
`content/development/seis-model-scaling-hardware-profile.json`; it exposes
`seis_ai_core_model_scaling_status` and
`seis://ai/model-scaling-hardware-profile.json` as planned 20B local
compatibility, future 70B roadmap, and 150B frontier research evidence only. It does not create
weights, run inference, download models, run benchmarks, call providers, train
models, or grant runtime authority.

The 150B Frontier Model Program source is
`content/development/seis-150b-frontier-model-program.json`; it exposes
`seis://ai/150b-frontier-model-program.json` as plan-only frontier governance
evidence validated by `npm run check:seis-150b-frontier-model-program`. It does
not authorize routeable 150B inference, model downloads, training, benchmarks,
cloud/GPU provisioning, SSH, deployment, or provider credentials.

The parameter ladder resource is `seis://ai/model-parameter-ladder.json`.
It binds the planned 20B, 70B, 150B, 300B+, and highest-future parameter
classes to source-controlled evidence gates while keeping every non-demo class
route-ineligible until real evidence and human approval exist.

The version-promotion-gates source is
`content/development/seis-ai-core-version-promotion-gates.json`; it exposes
`seis_ai_core_version_promotion_dry_run` as internal readiness evidence only.
It does not approve releases, provider calls, GitHub mutation, cloud/SSH
execution, credential access, dataset downloads, benchmarks, or model training.

## Direct Lane Tools

SEIS AI also exposes read-only status and plan-only tools for the embedded
personal plugin lanes. These tools read repository evidence and return scoped
execution guidance; they do not mutate GitHub, cloud targets, SSH hosts,
providers, credentials, or local files.

| Lane | Status tool | Plan tool |
| --- | --- | --- |
| `seis` | `seis_hub_status` | `seis_hub_plan` |
| `seis-cloud` | `seis_cloud_status` | `seis_cloud_plan` |
| `seis-code` | `seis_code_status` | `seis_code_plan` |
| `seis-design` | `seis_design_status` | `seis_design_plan` |
| `seis-data` | `seis_data_status` | `seis_data_plan` |

The status tools report manifest, skill, source-mirror, profile, quality-gate,
and authentication-claim posture. The plan tools return lane-specific safe
steps and approval boundaries for the request.

The `seis-cloud` surfaces also carry a sanitized `sshBinding` record through
`seis_cloud_status` and `seis_cloud_plan`. It identifies the single
`SEIS-SSH` alias, the public access contract, the current server-and-port
preservation policy, and the blocked live-readiness state without opening SSH,
reading credentials, or changing local configuration.

## Embedded Personal Plugins

The current personal SEIS plugin lanes are:

| Plugin | Role |
| --- | --- |
| `seis@personal` | Core SEIS governance and hub lane. |
| `seis-cloud@personal` | Cloud and deployment operations lane. |
| `seis-code@personal` | Code automation and implementation lane. |
| `seis-design@personal` | Design systems and product experience lane. |
| `seis-data@personal` | Data, analytics, and reporting lane. |

## Embedded Specialist Skills

The 2026-06-19 specialist expansion adds repo-contained skills inside
`plugins/seis-ai-agent/skills` without creating standalone marketplace cards:

| Skill | Role |
| --- | --- |
| `seis-security` | Threat modeling, secret-safety review, access control, SSH/VPN hardening, and release risk. |
| `seis-research` | Evidence-led source review, official documentation checks, version context, and decision synthesis. |
| `seis-automation` | Repeatable scripts, CI checks, runbooks, scheduled jobs, and human-approved agent workflows. |
| `seis-product` | Roadmap slices, requirements, acceptance criteria, launch readiness, and product scope. |

## Operating Rules

- Treat `seis-ai-agent@seis-repo` as the single user-facing SEIS-Agent install.
- Treat `content/development/seis-agent-registry.json` as the canonical machine-readable aggregate while each referenced source contract remains authoritative for its own scoped records.
- Keep `seis@personal`, `seis-cloud@personal`, `seis-code@personal`, `seis-design@personal`, and `seis-data@personal` as embedded capability lanes.
- Keep `seis-security`, `seis-research`, `seis-automation`, and `seis-product` embedded under SEIS-Agent rather than publishing standalone cards.
- Do not claim connector authentication readiness from plugin inventory alone.
- Treat the six local MCP servers and six allowlisted status probes as a separate
  Local Demo readiness gate; the probe evidence does not authorize live sessions,
  credentials, network access, shell execution, or external mutation.
- Validate the integration with `npm run check:seis-agent-plugin-integration`.
- Validate the local probe gate with `npm run check:seis-plugin-mcp-mesh`.
- Validate global registry parity with `npm run check:seis-agent-registry`.
- Validate SEIS AI Core promotion readiness wiring with `npm run check:seis-ai-core-version-promotion-gates`.
- Validate the tracked SEIS Core read model with `npm run check:seis-core-ai-runtime-snapshot`.
- Validate the native typed consumer with `swift test --package-path packages/seis_platform_swift`.
- Keep Command Center and demo surfaces aligned with the manifest before release or handoff claims.

## Quality Gate

```bash
npm run check:seis-agent-plugin-integration
```
