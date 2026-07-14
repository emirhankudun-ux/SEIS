# SEIS Goal Tracking Constitution

Status: active public-safe operating rule

Canonical companion documents are the focused entry points linked from root
`AGENTS.md`: architecture, AI Core, MCP and agent registries, design system,
Apple platform strategy, security, roadmap, rollback, testing, accessibility,
DevOps, release, and the public/private boundary.

The current execution prompt names its governance milestone `SEIS-GOAL-001`,
but the existing file-backed registry already uses that id for AI Core. The
public-safe focused record is therefore namespaced as `SEIS-EXEC-001`, maps
`requested_goal_id` to `SEIS-GOAL-001`, and maps `canonical_goal_id` to Goal
Tracking OS record `SEIS-GOAL-003`. This avoids creating a second goal with the
same id while preserving the owner-requested milestone label.

SEIS is an Apple-first, AI-native creative engineering operating system. This
document is the practical goal-tracking layer for long-term development,
supervised subagent orchestration, clean worktree discipline, MCP integration,
GitHub workflow, DevOps gates, design quality, AI/LLM architecture, and
repository update strategy.

SEIS is not a normal website, random app, short-term demo, fake live AI wrapper,
or uncontrolled automation playground. SEIS is a five-year creative engineering
ecosystem.

For the concise operational workflow, source map, evidence rules, and validation
commands, see [`docs/goals/goal-tracking.md`](goals/goal-tracking.md).

## Goal-tracking update prompt

The canonical prompt for updating this file-backed Goal Tracking OS is
[`docs/governance/seis-goal-tracking-update-prompt.md`](governance/seis-goal-tracking-update-prompt.md).
Its machine-readable prompt contract is
[`data/seis-goal-tracking-update-prompt.json`](../data/seis-goal-tracking-update-prompt.json),
and its structured proposal output is validated by
[`schemas/seis-goal-tracking-update.schema.json`](../schemas/seis-goal-tracking-update.schema.json).

The related Enterprise Expansion V3 governance registry is
[`docs/governance/seis-enterprise-expansion-v3.md`](governance/seis-enterprise-expansion-v3.md),
with machine-readable terms in
[`data/seis-enterprise-expansion-v3.json`](../data/seis-enterprise-expansion-v3.json)
and validation in `npm run check:seis-enterprise-expansion-v3`. Its terms are
specification-only until separate implementation evidence exists.

The requested five-million-character context is recorded as a ceiling, not as a
literal prompt-body target. The Prompt Engine keeps each rendered prompt within
16,384 characters; relevant context is loaded through bounded, source-linked
chunks. Padding, duplicate source text, fake progress, and unsupported
completion claims are forbidden.

Validate the prompt contract with:

```bash
npm run check:seis-goal-tracking-update-prompt
```

## Master Goal

Build SEIS into an enterprise-grade, Apple-first, AI-native creative engineering
operating system that can compete through discipline: design quality, software
architecture, AI capability, developer experience, documentation, automation,
reliability, security, and maintainability.

SEIS must grow as:

- premium creative operating system
- AI-native command center
- design, development, and automation ecosystem
- model-router and agent-router layer
- GitHub-first public engineering project
- clean and scalable codebase
- design system laboratory
- DevOps-ready engineering platform
- future Apple-native app family
- second-brain-compatible knowledge system
- safe agent-swarm workspace

## Clean Worktree Rule

Before work:

```bash
git status --short
```

After work:

```bash
git status --short
```

No final handoff may claim success while the worktree is dirty, generated junk
is unexplained, secrets are possible, or validation is unreported.

Forbidden by default: `git reset --hard`, `git push --force`, `git clean -fd`,
`rm -rf`, broad checkout/restore of user changes, destructive remote mutation,
and unreviewed deployment.

## Goal Record Shape

Every meaningful SEIS goal should be expressible as:

```yaml
id: SEIS-GOAL-000
title: Clear goal title
category: architecture | apple | design | development | ai | llm | mcp | devops | security | testing | accessibility | performance | documentation | release
priority: critical | high | medium | low
status: backlog | planned | in-progress | review | blocked | completed | archived
owner_agent: Agent name
supporting_agents:
  - Agent name
time_horizon: now | 30-days | 90-days | 1-year | 3-years | 5-years
repo_areas:
  - path/or/module
dependencies:
  - dependency
definition_of_done:
  - measurable completion rule
validation:
  - command or review gate
risks:
  - known risk
rollback_plan:
  - rollback method
github_output:
  issue: true
  branch: true
  pull_request: true
  commit: true
```

## Five-Year Roadmap Order

1. Phase 0: repository hygiene, security scan, clean goal tracking, public-safe
   docs, branch safety, and validation scripts.
2. Phase 1: SEIS foundation, command center architecture, design tokens,
   component library, information architecture, AI Core skeleton, Model Router,
   Agent Router, Prompt Registry, Task Registry, MCP Registry, testing,
   accessibility, and performance baseline.
3. Phase 2: AI-native system with provider registry, fallback routing,
   cost-aware routing, latency-aware routing, local/cloud switching, prompt
   versioning, evaluation, and human approval gates.
4. Phase 3: MCP integration layer with official/vendor-owned sources,
   read-only-first permissions, threat-model notes, rollback instructions, and
   no unreviewed write access.
5. Phase 4: Apple-native foundation with reusable Swift contracts, package
   tests, macOS Command Center boundaries, and iPadOS/iOS companion strategy.
6. Phase 5: product, release, education, extensibility, and research maturity
   with evidence-bound status labels and public-safe operations.

## Required Agent-Swarm Roles

The conceptual swarm includes Chief Architect, Product Strategy, Design Systems,
UI/UX, Motion and Interaction, Frontend, Backend, Apple-First Engineering, AI
Core, LLM Router, MCP Integration, DevOps, Security, Testing and QA,
Documentation, Accessibility, Performance, Repository Hygiene, GitHub Workflow,
Release Manager, Research, Automation, Observability, Data Architecture,
Governance, Rollback and Recovery, Prompt Engineering, Local AI/Ollama, Cloud
Infrastructure, and SEIS-SSH agents.

Runtime subagents may be temporary, but the repo-tracked lanes must persist.
Codex remains the single writer unless an explicit future handoff says
otherwise. Subagents default to read-only review.

The public-safe machine-readable registry for these 30 roles is
`content/development/seis-agent-registry.json`. It keeps helper roles read-only
or plan-only by default and links each role to verification, handoff, rollback,
and evidence-boundary requirements.

## MCP Rule

MCP is infrastructure, not decoration. Prefer official or vendor-owned MCP
servers, least privilege, read-only-first operation, documented permissions,
security review, rollback notes, and public-safe credential boundaries.

Allowed MCP categories include GitHub, Figma, Microsoft Learn, Azure, Google
Workspace, Slack, Notion, Postgres, Filesystem, Git, Puppeteer/Playwright,
OpenAI remote MCP, and custom SEIS MCP. External write-capable MCP use remains
blocked without explicit owner approval.

## 9Router / Model Router Layer

SEIS must support a multi-provider routing concept similar in spirit to a
router, without copying any brand or making fake live claims. The router must
track provider selection, model fallback, cost-aware routing, latency-aware
routing, capability routing, coding/design/vision/reasoning routes,
local/cloud switching, offline fallback, rate-limit fallback, and
evaluation-based selection.

Route families should include:

- `coding_fast`
- `architecture_deep`
- `design_review`
- `vision_review`
- `offline_mode`
- `local_private`
- `low_cost`
- `high_reasoning`
- `safe_mode`

No model call should be hardcoded without configuration, backend/credential
boundary, evidence, and fallback policy.

## Definition Of Done

A SEIS task is not complete until architecture, docs, validation, accessibility,
performance, security, rollback, and public/private boundaries are considered.
Failed or skipped checks must be reported honestly.

## Final Swarm Summary Shape

Every agent-swarm run should report:

- Goal ID
- Branch
- Completed
- Changed files
- Validation
- Risks
- Blockers
- MCP changes
- Security notes
- Design notes
- DevOps notes
- GitHub output
- Next recommended goal
- Worktree status

Final status must say: `Repository state: clean`, `dirty`, `blocked`, or
`not verified`.
