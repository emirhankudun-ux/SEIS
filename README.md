# SEIS

SEIS is an AI-native open source platform for building, governing, and evolving
software, design, data, automation, and agent systems as one sustainable digital
ecosystem.

It is not just an application repository. SEIS is a living platform layer for AI
systems, AI agents, MCP servers, skills, plugins, LLM workflows, full-stack
products, design systems, data systems, and long-term engineering governance.

## Mission

SEIS aims to become one of the most comprehensive open source AI-native
development ecosystems on GitHub: useful for engineers, designers, AI
researchers, educators, maintainers, and builders who need a clear operating
model for modern digital products.

The repository optimizes for:

- maintainable architecture over shortcuts
- security, reliability, and sustainability over feature volume
- clear governance over branch chaos
- high-quality open source adoption over noisy growth
- AI-assisted engineering with human review and accountable decisions

## Core Scope

| Area | SEIS covers |
| --- | --- |
| AI systems | AI agents, agent orchestration, MCP, skills, plugins, LLM routing, memory, RAG, model evaluation, AI safety |
| Engineering | algorithms, data structures, full stack, frontend, backend, mobile, desktop, game systems, embedded, robotics, compilers, architecture, testing, SRE, DevOps, cloud, cybersecurity |
| Data and ML | data engineering, big data, ML, deep learning, generative AI, NLP, computer vision, knowledge graphs, governance, ethics |
| Design | product design, design systems, UX engineering, UI engineering, interaction, motion, branding, typography, accessibility, calm technology |
| Open source | main-centered governance, contribution quality, security reporting, documentation, discoverability, community growth |

## Repository Model

`main` is the only permanent branch for SEIS.

Temporary working branches may exist only as review or integration staging.
Long-term development must merge back into `main`, and branch cleanup should be
explicit, reviewed, and non-destructive. Do not delete local or remote branches
only because they look stale; first verify merge state, ownership, and rollback
needs.

## Platform Strategy

SEIS is broad, but not careless. It is Apple-first whenever practical while
remaining strong across Windows, Android, Web, AI, data, and infrastructure.
Languages and frameworks are included when they strengthen a platform lane or a
quality gate.

| Platform | Priority languages |
| --- | --- |
| Apple first | Swift, SwiftUI, Objective-C, Metal, AppKit, UIKit, Combine, Core Data, CloudKit |
| Windows | C#, .NET, C++, Rust, WinUI, TypeScript, Go, Zig, Python when needed |
| Android | Kotlin, Java, Jetpack Compose, C++, Rust, TypeScript, Go, Python when needed |
| Web and AI tooling | TypeScript, HTML, CSS, Go, Rust, Python when needed, JavaScript when needed |

Unused SDKs, runtimes, and language toolchains are not installed by default.
Local development should stay fast, simple, and reversible. CI may install
specialized tools only when a specific check requires them.

## Source Languages and Ecosystem Stack

SEIS keeps the GitHub language surface honest: real source languages are counted
from real files, while frameworks, SDKs, cloud products, databases, IDEs, design
tools, and productivity systems live in a separate ecosystem stack.

| Surface | Canonical record | Rule |
| --- | --- | --- |
| GitHub source languages | [`reports/language-distribution.md`](./reports/language-distribution.md) | Count real source languages only and track platform-family balance without filler code. |
| Full-stack language matrix | [`reports/fullstack-language-matrix.md`](./reports/fullstack-language-matrix.md) | Route source/config languages by platform layer. |
| SEIS ecosystem stack | [`reports/seis-technology-stack.md`](./reports/seis-technology-stack.md) | Show frameworks, tools, clouds, databases, and design systems outside the language bar. |
| SEIS AGI system | [`reports/seis-agi-system.md`](./reports/seis-agi-system.md) | Govern agent systems, memory, planning, research automation, MCP, skills, plugins, token efficiency, and the 90-day release window. |

The long-term GitHub language profile should signal a real multi-platform
ecosystem: Apple/Swift 25-30%, AI/Data/Python/SQL 18-22%,
TypeScript/JavaScript tooling 15-20%, Android/JVM 10-15%, Rust/C/C++ systems
10-15%, Go/Infrastructure 5-8%, Windows/.NET 5-8%, and HTML/CSS previews 0-3%.
Do not add filler code to change percentages.

Run `npm run check:seis-technology-stack` after changing stack categories and
`npm run check:seis-agi-system` after changing agent, memory, planning,
research, MCP, skills, plugin, or token-efficiency policy.

## SEIS Master Prompt

SEIS uses a central operating prompt as its ecosystem governance contract. The
current contract is maintained at
[`docs/governance/seis-master-prompt.md`](./docs/governance/seis-master-prompt.md)
and defines how architecture, security, documentation, AI, cloud, design,
automation, product strategy, validation, and user-work protection should be
handled across the repository.

The long-term ecosystem vision is maintained at
[`docs/governance/seis-supreme-vision.md`](./docs/governance/seis-supreme-vision.md).
It defines SEIS as a human-AI collaborative intelligence ecosystem where the
ecosystem itself is the product.

Operational GitHub controls for this prompt are documented in
[`docs/governance/seis-master-prompt-github-controls.md`](./docs/governance/seis-master-prompt-github-controls.md).

The contract is enforced by a dedicated Master Prompt check and is also covered
by the broader open-source governance check:

```bash
npm run check:seis-master-prompt-report
npm run check:seis-master-prompt
```

The implementation map at
[`data/seis-master-prompt-implementation-map.json`](./data/seis-master-prompt-implementation-map.json)
links the Master Prompt principles to concrete architecture, security,
documentation, AI/agent, cloud/automation, and product/design repository
surfaces.

The acceptance criteria at
[`data/seis-master-prompt-acceptance-criteria.json`](./data/seis-master-prompt-acceptance-criteria.json)
define what evidence is required before Master Prompt alignment can be treated
as complete.

The operational goal tracker at
[`data/seis-operational-goal-tracker.json`](./data/seis-operational-goal-tracker.json)
keeps active SEIS work explicit across goal, priority, status, risks,
validation, and next step fields.

The objective coverage matrix at
[`data/seis-master-objective-coverage.json`](./data/seis-master-objective-coverage.json)
maps the current SEIS Master Prompt objective to concrete evidence, checks,
status, and remaining gaps.

The generated objective coverage report at
[`reports/seis-master-objective-coverage.md`](./reports/seis-master-objective-coverage.md)
makes the same coverage matrix readable for reviews and handoffs.

The decision record at
[`docs/governance/adr-0001-seis-master-prompt-operating-contract.md`](./docs/governance/adr-0001-seis-master-prompt-operating-contract.md)
documents why the Master Prompt is treated as an active repository operating
contract.

The change checklist at
[`docs/governance/seis-master-prompt-change-checklist.md`](./docs/governance/seis-master-prompt-change-checklist.md)
turns the workflow into a reusable review path for architecture, security,
documentation, validation, and handoff.

Use the GitHub issue template at
[`.github/ISSUE_TEMPLATE/master_prompt_governance.md`](./.github/ISSUE_TEMPLATE/master_prompt_governance.md)
to propose Master Prompt governance changes with goal, priority, risk,
validation, and acceptance criteria captured upfront.

The focused GitHub Actions workflow at
[`.github/workflows/seis-master-prompt-governance.yml`](./.github/workflows/seis-master-prompt-governance.yml)
runs the generated report and Master Prompt governance checks on relevant
pull requests and `main` pushes.

The ownership rules at
[`.github/CODEOWNERS`](./.github/CODEOWNERS) keep Master Prompt operating
contract changes reviewable by the maintainer on GitHub.

The SEIS plugin skill at
[`plugins/seis/skills/seis-master-prompt/SKILL.md`](./plugins/seis/skills/seis-master-prompt/SKILL.md)
connects this operating contract to Codex skill/plugin workflows inside the
repository.

The SEIS security review skill at
[`plugins/seis/skills/seis-security-review/SKILL.md`](./plugins/seis/skills/seis-security-review/SKILL.md)
routes secret-safety, least-privilege, SSH/cloud, rollback, GitHub readiness,
and validation-claim review through the SEIS plugin bundle.

The governance status report at
[`reports/seis-master-prompt-governance.md`](./reports/seis-master-prompt-governance.md)
tracks goal, priority, status, risks, validation, and next step for the active
contract.

## AGI System and Three-Month Roadmap

SEIS now tracks its AGI direction as a human-owned, Apple-first assistant
architecture: advanced agents, memory systems, planning systems, research
automation, MCP, skills, plugins, data, design, development, and interactive
read/write workflows are routed through explicit safety gates.

| Surface | Canonical record | Rule |
| --- | --- | --- |
| AGI system contract | [`reports/seis-agi-system.md`](./reports/seis-agi-system.md) | Track the 150-domain capability atlas, plugin/MCP lanes, token efficiency target, and release window. |
| Active mission board | [`reports/seis-active-mission-board.md`](./reports/seis-active-mission-board.md) | Convert the three-month goal into Month 1/2/3 execution lanes with acceptance gates and evidence paths. |
| AI Core and Command Center five-year program | [`roadmap/seis-ai-core-command-center-5-year-development-program.md`](./roadmap/seis-ai-core-command-center-5-year-development-program.md) | Govern the AI Core and app dual-build from foundation contracts to evidence-backed product and research maturity. |
| Apple-first Swift contract | [`packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift`](./packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift) | Keep the implementation path tied to Swift, SwiftUI, Objective-C, Metal, AppKit, UIKit, Combine, Core Data, and CloudKit. |
| Generated implementation doc | [`docs/agi/seis-agi-system.md`](./docs/agi/seis-agi-system.md) | Explain implementation roots, token efficiency, plugin use, and visual source policy. |

## Architecture Map

| Path | Purpose |
| --- | --- |
| [`packages/seis-ai`](./packages/seis-ai) | AI agent CLI, MCP server, audit tools, prompts, resources, and tests |
| [`packages/model-router`](./packages/model-router) | Foundation contract for provider-neutral model routing and privacy modes |
| [`packages/prompt-engine`](./packages/prompt-engine) | Foundation contract for prompt versioning, metadata, and regression support |
| [`packages/agent-runtime`](./packages/agent-runtime) | Foundation contract for supervised agent roles, approvals, and audit state |
| [`packages/evals`](./packages/evals) | Foundation contract for prompt, route, agent, app-state, and future model evaluations |
| [`packages/tool-registry`](./packages/tool-registry) | Foundation contract for tools, plugins, permissions, and risk classes |
| [`packages/shared-types`](./packages/shared-types) | Foundation contract for shared AI Core and Command Center data shapes |
| [`mcp`](./mcp) | SEIS MCP server entrypoints and integration surface |
| [`plugins/seis`](./plugins/seis) | Codex plugin bundle, scripts, and SEIS skill entrypoints |
| [`plugins/seis-ai-agent`](./plugins/seis-ai-agent) | SEIS-Agent unified orchestration across cloud, code, design, data, memory, context, MCP, skills, plugins, and automation |
| [`plugins/seis-cloud`](./plugins/seis-cloud) | Dedicated SEIS Cloud deployment, server-target, and cloud-readiness plugin package |
| [`plugins/seis-code`](./plugins/seis-code) | Dedicated SEIS-Code engineering plugin package |
| [`plugins/seis-design`](./plugins/seis-design) | Dedicated SEIS-Design product and design-system plugin package |
| [`plugins/seis-data`](./plugins/seis-data) | Dedicated SEIS-DATA analytics and knowledge-governance plugin package |
| [`packages/seis_platform_swift`](./packages/seis_platform_swift) | Apple platform policy package |
| [`packages/seis_windows_csharp`](./packages/seis_windows_csharp) | Windows platform policy package |
| [`packages/seis_kernel`](./packages/seis_kernel) | Capability, language, plugin, platform, and AGI-system contract builders |
| [`packages/seis_kernel_go`](./packages/seis_kernel_go) | Go governance and readiness policy contracts |
| [`polyglot`](./polyglot) | Cross-language audit lanes and platform proof-of-concept surfaces |
| [`apps/web`](./apps/web) | Browser-facing product and documentation surface |
| [`apps/command-center`](./apps/command-center) | Command Center documentation placeholder; current implementation evidence remains in `apps/seis-core` |
| [`apps/android`](./apps/android) | Android direction and validation notes |
| [`apps/macos`](./apps/macos) | macOS direction and Apple-native notes |
| [`docs`](./docs) | Architecture, governance, deployment, strategy, quality, and research records |
| [`docs/product`](./docs/product) | SEIS App, AI App, Command Center, LLM surfaces, assistants, approvals, and evidence contracts |
| [`roadmap`](./roadmap) | 30/90/365-day, 18-60-month, five-year AI Core/App, native demo, and long-horizon operating plans |
| [`reports`](./reports) | Generated ecosystem, language, capability, and readiness reports |

## AI-Assisted Development

SEIS is built with human ownership and AI assistance.

- Maintainer: Emirhan Kudun ([@emirhankudun-ux](https://github.com/emirhankudun-ux))
- Primary execution assistant: OpenAI Codex / ChatGPT
- Architecture and review assistant: Claude

Technology names in this repository may appear as platform references,
compatibility targets, or tool integrations. They do not imply endorsement,
employment, sponsorship, or direct contribution unless explicitly stated by the
maintainer.

## Quality Gates

Use the lightest reliable check first, then scale validation with risk:

```bash
npm run check:open-source-governance
npm run check:ai-core-app-contracts
npm run check:prompt-regression-fixtures
npm run seis:check
npm run check:seis-platform-language-policy
npm run check:seis-platform-kernel
npm run check:seis-active-mission-board
```

No command above installs a new local language runtime. Some checks skip optional
toolchains when they are not present.

GitHub Actions also runs CodeQL code scanning for JavaScript, TypeScript, and
Python on relevant pull requests, `main` pushes, weekly scheduled scans, and
manual dispatches. This keeps security scanning in GitHub without asking local
contributors to install every platform SDK.

## Security & Operations Tooling

`scripts/ultra_ssh_manager.py` is SEIS' server-hardening utility for SSH and
firewall baseline operations. It supports six modes:

- `--mode interactive` (wizard flow, default)
- `--mode harden` (harden existing host; no new user provisioning)
- `--mode full-setup` (adds user/provisioning + hardening)
- `--mode audit` (deep audit report)
- `--mode dashboard` (runtime security dashboard)
- `--mode verify` (non-mutating SSH, firewall, service, and Fail2Ban evidence report)

Use `--dry-run` before any live host change. Dry-run mode does not require root,
does not install packages, does not restart services, and does not write `/etc`;
it writes a JSON execution plan plus a recovery playbook under the manager report
directory. By default, dry-run CLI output uses
`~/.local/state/ultra_ssh_manager`; live runs keep the root-owned `/var/lib` and
`/var/log` defaults.

```bash
python3 scripts/ultra_ssh_manager.py --mode full-setup --port 2222 --user deploy --dry-run --no-audit
```

Design goals for this script:

- mode-specific execution paths are explicit and logged
- command execution is injected so unit tests can safely validate behavior
- dry-run output documents planned commands, file writes, warnings, and recovery
  steps before live execution
- live hardening writes an apply plan and recovery playbook before mutating SSH,
  firewall, kernel, or service state
- SSH config changes are staged as a candidate file and validated with
  `sshd -t -f` before replacing the active config when `sshd` is available
- `--mode verify` writes a verification report without package installs, service
  restarts, account changes, or firewall mutations
- port-knocking and firewall flows are separated and ordered by explicit config
- rescue user path is constrained in SSH policy
- sensitive artifacts (state, credentials, reports, auth helpers) use strict file
  permissions

Local unit tests for the script are maintained under:

- `scripts/tests/test_ultra_ssh_manager.py`

Run them directly with:

```bash
python3 -m unittest scripts.tests.test_ultra_ssh_manager
```

## Contribution Path

Start with:

- [`docs/development/first-run-quickstart.md`](./docs/development/first-run-quickstart.md)
  for clone, first validation, lane selection, and no-bloat setup
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) for contribution rules
- [`docs/deployment/seis-codespaces-cloud-workspace.md`](./docs/deployment/seis-codespaces-cloud-workspace.md) for a cloud-only dev workflow
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) for community expectations
- [`SUPPORT.md`](./SUPPORT.md) for questions, ideas, bugs, features, and safe
  support routing
- [`SECURITY.md`](./SECURITY.md) for private vulnerability reporting
- [`LICENSE`](./LICENSE) for the MIT license
- [`AGENTS.md`](./AGENTS.md) for AI operating instructions inside this repo
- [`CODEX.md`](./CODEX.md) for Codex Cloud, branch, PR, SSH, and quality workflow
- [`CLAUDE.md`](./CLAUDE.md) for Claude Code review and MCP workflow

Good contributions are small, reviewed, reversible, documented, and aligned with
the long-term platform model.

## GitHub Growth Strategy

SEIS should be discoverable, useful, and trustworthy before it tries to be loud.
The GitHub surface should continuously improve through:

- clear README, repository metadata, and topic positioning
- strong issue and PR templates
- structured Discussions for ideas, Q&A, and show-and-tell
- a visible support path that keeps questions, bugs, features, and security
  reports in the right place
- release notes and GitHub Pages links that explain what changed
- accurate contributor attribution
- quality-first examples and demos
- security and governance transparency
- approachable docs for agents, MCP, skills, plugins, and platform lanes

Use issues for actionable bugs and scoped work. Use Discussions for architecture
questions, broad ideas, and examples that need community shaping before they
become work items.

The GitHub adoption model is tracked in
[`docs/governance/github-market-readiness.md`](./docs/governance/github-market-readiness.md).

## Repository Metadata

The public GitHub repository should describe SEIS as an AI-native,
Apple-first, full-stack, design-driven open source ecosystem. Topics should
reflect the real architecture: AI agents, MCP, LLM workflows, Swift, SwiftUI,
TypeScript, Rust, design systems, DevOps, security, and GitHub Pages.

## Current Status

SEIS is actively evolving. Some historical documents still record earlier
private or consolidation phases. The current direction is open source,
main-centered, AI-native, security-conscious, and architecture-led.
