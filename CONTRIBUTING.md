# Contributing to SEIS

Thank you for helping SEIS become a main-first, marketplace-grade, calm AI-native engineering system.

## Current Focus

The current acceleration lane prioritizes:

- engineering, full stack, data, design, development, and product governance;
- AI / Agent / MCP / Skills / Plugin / LLM routing;
- algorithms, mathematics, computer science, software architecture, and formal methods;
- web, mobile, game, database, cloud, cybersecurity, DevOps, SRE, testing, and metrics readiness;
- NLP, computer vision, big data, quantum research, robotics, AI ethics, and data governance;
- sustainable software, low-code/no-code intake, UX/UI engineering, requirements, agile delivery, SDLC, refactoring, and reverse-engineering safety.

## Language Policy for This Pass

- Do **not** add new JavaScript or Python application code unless the maintainer explicitly asks for it later.
- Apple surfaces should use Apple languages first: Swift, SwiftUI, Objective-C, Objective-C++, AppleScript, Metal Shading Language, and Apple platform metadata.
- Android surfaces should use Android-native and non-Apple languages first: Kotlin, Java, XML, Gradle metadata, C++, Rust, Go, and SQL contracts.
- Windows surfaces should use Windows and non-Apple languages first: C#, F#, PowerShell, Batch, C++, Rust, Go, T-SQL, MSBuild metadata, and SQL contracts.
- Cross-platform policy should start as SQL, YAML, TOML, CUE, Rego, JSON Schema, GraphQL, OpenAPI, AsyncAPI, or Markdown before runtime services.
- Do not install every language runtime. Add a runtime only when product need, owner, validation, storage/security cost, and rollback are documented.

## Branch and Pull Request Rules

- `main` is the canonical public product branch.
- Keep changes small, reversible, and easy to review.
- Branches are temporary workspaces; long-lived branch knowledge should be represented under `main` as docs, data, or source snapshots.
- Before switching writer role between AI assistants, inspect `git status` and preserve unrelated work.
- PRs should include motivation, changed paths, validation commands, risk/rollback notes, and AI-assistance disclosure when relevant.

## Contribution Checklist

1. Read [`README.md`](README.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and [`SECURITY.md`](SECURITY.md).
2. Open an issue or proposal for broad feature, architecture, runtime, dependency, or marketplace changes.
3. Keep secrets, personal data, `.env` contents, generated archives, and private media out of commits.
4. Add or update documentation when behavior, policy, architecture, or market-readiness changes.
5. Run the lightest reliable checks first, then scale validation based on risk.

## AI Partner Attribution

It is acceptable to state that a contribution was developed with Codex / ChatGPT, Claude, Gemini, Qwen, or another assistant. The human contributor remains responsible for correctness, licensing, testing, and safety.
