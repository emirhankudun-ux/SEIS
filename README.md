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

## GitHub Growth Strategy

SEIS should be discoverable, useful, and trustworthy before it tries to be loud.
The GitHub surface should continuously improve through:

- clear README, repository metadata, and topic positioning
- strong issue and PR templates
- structured Discussions for ideas, Q&A, and show-and-tell
- release notes and GitHub Pages links that explain what changed
- accurate contributor attribution
- quality-first examples and demos
- security and governance transparency
- approachable docs for agents, MCP, skills, plugins, and platform lanes

Use issues for actionable bugs and scoped work. Use Discussions for architecture
questions, broad ideas, and examples that need community shaping before they
become work items.

## Repository Metadata

The public GitHub repository should describe SEIS as an AI-native,
Apple-first, full-stack, design-driven open source ecosystem. Topics should
reflect the real architecture: AI agents, MCP, LLM workflows, Swift, SwiftUI,
TypeScript, Rust, design systems, DevOps, security, and GitHub Pages.

## Current Status

SEIS is actively evolving. Some historical documents still record earlier
private or consolidation phases. The current direction is open source,
main-centered, AI-native, security-conscious, and architecture-led.
