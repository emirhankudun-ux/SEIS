# Open Source Governance

SEIS is operated as a main-centered open source AI-native platform. Governance
exists to keep the ecosystem understandable, trustworthy, and useful as it grows.

## Public Surface Requirements

The GitHub-facing surface must stay current:

- `README.md` explains the open source mission, platform scope, architecture map,
  language policy, quality gates, and contribution path.
- `CONTRIBUTING.md` explains branch flow, AI-assisted contribution rules,
  dependency discipline, and validation expectations.
- `SECURITY.md` explains private vulnerability reporting, supported versions,
  dependency policy, MCP/plugin/agent risk, and response targets.
- `CODE_OF_CONDUCT.md` keeps a professional, inclusive community standard.
- `LICENSE` remains MIT unless the maintainer explicitly changes licensing.
- `CONTRIBUTORS.md` separates real maintainers and AI-assisted workflow
  attribution from tool or company references.
- `.github/ISSUE_TEMPLATE/config.yml` routes public support toward structured
  issues, Discussions, and private security reporting.
- `.github/DISCUSSION_TEMPLATE/` keeps ideas, Q&A, and show-and-tell useful
  before they become issues or pull requests.
- Repository description, homepage, and topics must accurately present SEIS as
  an AI-native, Apple-first, full-stack, design-driven open source ecosystem.

## Adoption Strategy

SEIS should earn GitHub adoption through substance:

- clear onboarding for developers, designers, and AI researchers
- useful AI-agent, MCP, skill, plugin, and LLM workflow examples
- strong validation gates before large feature expansion
- transparent security and governance docs
- focused issue and PR templates
- structured discussion forms for community shaping
- repository metadata and topics that match the real architecture
- practical platform lanes instead of dependency bloat

## Toolchain Discipline

Unused local runtimes and SDKs are not installed by default. CI may install
specialized tools only for explicit checks, and local checks should skip optional
toolchains when possible.

Apple-first work stays focused on Swift, SwiftUI, Objective-C, Metal, AppKit,
UIKit, Combine, Core Data, and CloudKit. Windows and Android work may use C#,
.NET, C++, Rust, WinUI, Kotlin, Java, Jetpack Compose, TypeScript, Go, Zig,
Python when needed, and JavaScript when needed.

## GitHub Update Rule

Before claiming GitHub is updated, verify:

1. `git status --short`
2. `git branch --show-current`
3. `git remote -v`
4. relevant local checks
5. push or PR state, when publishing is part of the task

No remote update should be claimed without evidence.
