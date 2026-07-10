# SEIS Sub-Agent Five-Year Demo Evidence

## Purpose

Provide a deterministic repository-local evidence artifact for the five-year sub-agent Local Demo.

## Current Status

- Status: repo-local-demo-evidence
- Mode: deterministic-plan-simulation
- Boundary: local-demo-only
- Recorded quarters: 20/20
- Completion: 100%
- AI Core version registry: content/development/seis-ai-core-version-registry.json
- AI Core provider registry: content/development/seis-ai-core-provider-registry.json
- AI Core promotion gates: content/development/seis-ai-core-version-promotion-gates.json
- SEIS-Agent plugin integration: content/development/seis-agent-plugin-integration.json
- SEIS AI Core MCP runtime contract: content/development/seis-ai-core-mcp-runtime-contract.json
- Demo plan view: apps/seis-demo-web/data/seis-sub-agent-five-year-plan-view.json
- Installed AI Core routes: 6
- Personal plugin lanes: 5
- MCP runtime: 35 tools, 30 resources, 3 prompts over stdio JSON-RPC
- Provider registry: 7 providers, 0 required for core, 3 no-key profiles
- Release promotion allowed: false

This report does not prove real five-year autonomous execution, background agents, deploys, SSH execution, credential access, merges, or production writes.

## Validation

- `npm run check:seis-sub-agent-5-year-plan`
- `npm run check:seis-sub-agent-five-year-demo-evidence`
- `npm run check:seis-ai-core-version-registry`
- `npm run check:seis-ai-core-provider-registry`
- `npm run check:seis-ai-core-version-promotion-gates`
- `node --test packages/seis-ai/test/mcp-smoke.test.mjs`
- `npm run check:product-experience-browser-smoke`

## Lane Coverage

| Lane | Authority | Recorded Quarters |
| --- | --- | --- |
| architecture-agent | review-only | 9 |
| implementation-agent | scoped-worker | 11 |
| security-agent | review-only | 13 |
| documentation-agent | scoped-worker | 9 |
| validation-agent | review-only-or-scoped-worker | 14 |
| design-agent | proposal-or-scoped-worker | 4 |

## AI Core Version Promotion Map

| Year | Version Target | Theme | Dry-Run Decision | Release Allowed | Next Safe Action |
| --- | --- | --- | --- | --- | --- |
| 1 | v0.1-foundation | Version identity and bounded sub-agent evidence | eligible-for-internal-review | false | Surface v0.1 as internal, zero-key, status-and-plan-only SEIS AI Core evidence. |
| 2 | v0.2-read-only-intelligence | Read-only evidence dashboards and stale-data UX | blocked-until-evidence | false | Create provider registry and Command Center read-only evidence fixtures before claiming v0.2 readiness. |
| 3 | v0.3-write-gated-runtime | Human-approved write lanes | blocked-human-approval | false | Promote permission matrix fixtures into executable tests before enabling write-gated lanes. |
| 4 | v0.4-multi-workspace-readiness | Cloud, SSH, workspace, and provider readiness | blocked-human-approval | false | Keep cloud and SSH surfaces disabled until explicit target, rollback, and approval evidence exists. |
| 5 | v1.0-public-enterprise-candidate | Public, enterprise, and SEIS Universe governance | blocked-until-evidence | false | Build public and release readiness evidence before claiming v1.0 candidacy. |

## Installed AI Core Route Matrix

| Installed AI | Version Target | Provider State | Route Mode | Sub-Agent Duty |
| --- | --- | --- | --- | --- |
| Codex | v0.1-foundation | Available | supervised-operator | Implementation, validation, and repository-safe edits |
| SEIS Local Demo Runtime | v0.1-foundation | Available | no-key-local-demo | AI shell, Claude-style REPL demo, tool-call ledger, and VFS evidence |
| Claude Review Profile | v0.2-read-only-intelligence | Missing Key | backend-only-planned | Architecture, safety, PR review, and large-context review lane |
| Qwen Alternative Review | v0.3-write-gated-runtime | Disabled | alternative-review-planned | Contradiction detection, archive review, and second-opinion risk checks |
| Gemini Secondary Validation | v0.4-multi-workspace-readiness | Disabled | secondary-validation-planned | Multimodal, product, and secondary validation after provider audit |
| Ollama Local Candidate | v0.2-read-only-intelligence | Disabled | zero-key-local-provider-planned | Local/private inference candidate for local-only workspaces |

## Personal SEIS Plugin Lane Matrix

| Plugin | Embedded Lane | Version Target | Permission | Tool Pair | Gate |
| --- | --- | --- | --- | --- | --- |
| seis@personal | SEIS Hub | v0.1-foundation | plan-only | seis_hub_status / seis_hub_plan | npm run check:seis-ai-agent |
| seis-cloud@personal | SEIS Cloud | v0.4-multi-workspace-readiness | plan-only | seis_cloud_status / seis_cloud_plan | npm run check:cloud-access-policy |
| seis-code@personal | SEIS-Code | v0.1-foundation | plan-only | seis_code_status / seis_code_plan | npm run check:seis-plugin-bundle |
| seis-design@personal | SEIS-Design | v0.2-read-only-intelligence | plan-only | seis_design_status / seis_design_plan | npm run check:motion-evidence |
| seis-data@personal | SEIS-DATA | v0.2-read-only-intelligence | plan-only | seis_data_status / seis_data_plan | npm run check:plugin-capability-lanes |

## MCP Runtime Contract

| Surface | State | Count | Duty |
| --- | --- | --- | --- |
| Tool registry | verified | 35 | Expose repo-backed SEIS AI checks, provider-neutral read-only route decisions, personal plugin lane tools, provider registry status, model scaling status, and AI Core version/sub-agent tools. |
| Resource registry | verified | 30 | Expose source-of-truth JSON resources for plugin integration, provider states, executable read-only route policy, planned model scaling, parameter ladder boundaries, no-skip-20B frontier policy, 150B frontier program, 512B apex AGI program, AGI evidence protocol, AGI public-readiness claim gates, AGI GitHub user-readiness gates, 20B clean-room evidence templates, MCP runtime, version gates, fixtures, and generated plan views. |
| Prompt registry | verified | 3 | Provide bounded audit, i18n, and review prompts without embedding secrets. |
| Transport boundary | verified | 1 | Keep MCP available for local verification while official SDK compatibility remains a separate hardening path. |

Runtime boundary: No provider keys, SSH credentials, browser secrets, live deploys, GitHub mutation, or external mutation; local MCP smoke contract only.

## Quarter Records

| Quarter | Year | Version Target | Promotion Decision | Primary Lanes | Gates |
| --- | --- | --- | --- | --- | --- |
| Y1-Q1 | 1 | v0.1-foundation | eligible-for-internal-review | documentation-agent, validation-agent, security-agent | docs-updated, deterministic-check, single-writer-policy, no-secret-leakage |
| Y1-Q2 | 1 | v0.1-foundation | eligible-for-internal-review | architecture-agent, security-agent, validation-agent | schema-validation, approval-boundary, cancellation-fixture, path-safety |
| Y1-Q3 | 1 | v0.1-foundation | eligible-for-internal-review | implementation-agent, design-agent, validation-agent | mock-vs-live-labels, accessibility, browser-smoke, rollback-plan |
| Y1-Q4 | 1 | v0.1-foundation | eligible-for-internal-review | architecture-agent, implementation-agent, security-agent | no-key-startup, provider-honesty, redaction, human-approval |
| Y2-Q1 | 2 | v0.2-read-only-intelligence | blocked-until-evidence | implementation-agent, design-agent, validation-agent | interactivity-rate, mobile-fit, indexeddb-persistence, no-host-os-claim |
| Y2-Q2 | 2 | v0.2-read-only-intelligence | blocked-until-evidence | architecture-agent, implementation-agent, security-agent | dry-run-only, bounded-recursion, timeout, audit-event |
| Y2-Q3 | 2 | v0.2-read-only-intelligence | blocked-until-evidence | implementation-agent, documentation-agent, validation-agent | read-only-live, evidence-linked, stale-data-label, no-fake-health |
| Y2-Q4 | 2 | v0.2-read-only-intelligence | blocked-until-evidence | security-agent, architecture-agent, validation-agent | least-privilege, tool-allowlist, destructive-approval, prompt-injection-resistance |
| Y3-Q1 | 3 | v0.3-write-gated-runtime | blocked-human-approval | implementation-agent, design-agent, documentation-agent | real-actions-only, keyboard-navigation, provider-identity, fallback-transparency |
| Y3-Q2 | 3 | v0.3-write-gated-runtime | blocked-human-approval | architecture-agent, security-agent, implementation-agent | server-only-secrets, missing-key-state, capability-fallback, redacted-errors |
| Y3-Q3 | 3 | v0.3-write-gated-runtime | blocked-human-approval | implementation-agent, security-agent, validation-agent | path-traversal-denied, approval-required, audit-log, rollback-notes |
| Y3-Q4 | 3 | v0.3-write-gated-runtime | blocked-human-approval | validation-agent, documentation-agent, design-agent | build-pass, smoke-pass, a11y-review, release-evidence |
| Y4-Q1 | 4 | v0.4-multi-workspace-readiness | blocked-human-approval | architecture-agent, documentation-agent, security-agent | source-of-truth, read-only-default, scope-control, human-approval |
| Y4-Q2 | 4 | v0.4-multi-workspace-readiness | blocked-human-approval | security-agent, validation-agent, implementation-agent | redacted-logs, cost-budget, cancellation, postmortem-template |
| Y4-Q3 | 4 | v0.4-multi-workspace-readiness | blocked-human-approval | architecture-agent, implementation-agent, security-agent | no-cloud-fallback, context-minimization, memory-boundary, no-secret-storage |
| Y4-Q4 | 4 | v0.4-multi-workspace-readiness | blocked-human-approval | documentation-agent, security-agent, validation-agent | secret-scan, license-review, SBOM-plan, branch-protection-docs |
| Y5-Q1 | 5 | v1.0-public-enterprise-candidate | blocked-until-evidence | implementation-agent, validation-agent, security-agent | bounded-delegation, failure-mode-tests, operator-cancel, auditability |
| Y5-Q2 | 5 | v1.0-public-enterprise-candidate | blocked-until-evidence | architecture-agent, documentation-agent, validation-agent | no-fake-model-claims, dataset-provenance, benchmark-integrity, model-card-template |
| Y5-Q3 | 5 | v1.0-public-enterprise-candidate | blocked-until-evidence | documentation-agent, validation-agent, security-agent | community-health, security-triage, CODEOWNERS-policy, release-cadence |
| Y5-Q4 | 5 | v1.0-public-enterprise-candidate | blocked-until-evidence | architecture-agent, documentation-agent, validation-agent | evidence-complete, known-limits, human-review, next-safe-action |

## Next Safe Action

Keep the browser Local Demo and this repository evidence report in sync before promoting any sub-agent workflow beyond dry-run or status-only behavior.
