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

## Platform Language Policy

SEIS is broad, but not careless. Languages are included when they strengthen a
platform lane or a quality gate.

| Platform | Priority languages |
| --- | --- |
| Apple | Swift, SwiftUI, Objective-C |
| Windows | C#, C++, Rust, TypeScript, Go, Zig, Dart, Python when needed, JavaScript when needed |
| Android | Kotlin, Java, C++, Rust, TypeScript, Go, Dart, Python when needed, JavaScript when needed |
| Web and AI tooling | TypeScript, HTML, CSS, Go, Rust, Python when needed, JavaScript when needed |

Unused SDKs, runtimes, and language toolchains are not installed by default.
Local development should stay fast, simple, and reversible. CI may install
specialized tools only when a specific check requires them.

## Architecture Map

| Path | Purpose |
| --- | --- |
| [`packages/seis-ai`](./packages/seis-ai) | AI agent CLI, MCP server, audit tools, prompts, resources, and tests |
| [`mcp`](./mcp) | SEIS MCP server entrypoints and integration surface |
| [`plugins/seis`](./plugins/seis) | Codex plugin bundle, scripts, and SEIS skill entrypoints |
| [`packages/seis_platform_swift`](./packages/seis_platform_swift) | Apple platform policy package |
| [`packages/seis_windows_csharp`](./packages/seis_windows_csharp) | Windows platform policy package |
| [`packages/seis_kernel`](./packages/seis_kernel) | Capability, language, plugin, and platform contract builders |
| [`packages/seis_kernel_go`](./packages/seis_kernel_go) | Go governance and readiness policy contracts |
| [`polyglot`](./polyglot) | Cross-language audit lanes and platform proof-of-concept surfaces |
| [`apps/web`](./apps/web) | Browser-facing product and documentation surface |
| [`apps/android`](./apps/android) | Android direction and validation notes |
| [`apps/macos`](./apps/macos) | macOS direction and Apple-native notes |
| [`docs`](./docs) | Architecture, governance, deployment, strategy, quality, and research records |
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
npm run seis:check
npm run check:seis-platform-language-policy
npm run check:seis-platform-kernel
```

No command above installs a new local language runtime. Some checks skip optional
toolchains when they are not present.

## Contribution Path

Start with:

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) for contribution rules
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) for community expectations
- [`SECURITY.md`](./SECURITY.md) for private vulnerability reporting
- [`LICENSE`](./LICENSE) for the MIT license
- [`AGENTS.md`](./AGENTS.md) for AI operating instructions inside this repo

Good contributions are small, reviewed, reversible, documented, and aligned with
the long-term platform model.

## Documentation Navigation

For the current foundation status and roadmap, start with:

- [`docs/INDEX.md`](./docs/INDEX.md) for the documentation map
- [`docs/STATUS.md`](./docs/STATUS.md) for current repository readiness
- [`docs/goals/seis-vision.md`](./docs/goals/seis-vision.md) for the long-term vision
- [`docs/goals/long-term-goals.md`](./docs/goals/long-term-goals.md) for the goal registry
- [`docs/goals/goal-tracking-system.md`](./docs/goals/goal-tracking-system.md) for the Goal Tracking OS foundation
- [`docs/product/SEIS_NON_LLM_PLATFORM_MISSION.md`](./docs/product/SEIS_NON_LLM_PLATFORM_MISSION.md) for the non-LLM Command Center and Platform OS mission
- [`docs/architecture/SEIS_PLATFORM_OS_ARCHITECTURE.md`](./docs/architecture/SEIS_PLATFORM_OS_ARCHITECTURE.md) for the deterministic platform architecture
- [`docs/architecture/REPOSITORY_INTELLIGENCE_SYSTEM.md`](./docs/architecture/REPOSITORY_INTELLIGENCE_SYSTEM.md) for the repository intelligence plan
- [`docs/roadmap/MASTER_BACKLOG.md`](./docs/roadmap/MASTER_BACKLOG.md) for the consolidated backlog
- [`docs/roadmap/NEXT_PR_QUEUE.md`](./docs/roadmap/NEXT_PR_QUEUE.md) for the next safe PR sequence
- [`docs/reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md`](./docs/reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md) for the latest foundation review

## GitHub Growth Strategy

SEIS should be discoverable, useful, and trustworthy before it tries to be loud.
The GitHub surface should continuously improve through:

- clear README and topic positioning
- strong issue and PR templates
- accurate contributor attribution
- quality-first examples and demos
- security and governance transparency
- approachable docs for agents, MCP, skills, plugins, and platform lanes

## Current Status

SEIS is actively evolving. Some historical documents still record earlier
private or consolidation phases. The current direction is open source,
main-centered, AI-native, security-conscious, and architecture-led.

SEIS is also a non-LLM platform mission: Command Center and Platform OS must be
useful with static/manual data, deterministic scans, mock data, and future
approved live integrations even when no model provider is connected.
