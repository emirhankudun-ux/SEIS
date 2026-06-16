# SEIS Native Polyglot Market Readiness Kernel

Date: 2026-06-11

Machine-readable companion: [`content/development/native-polyglot-market-readiness-kernel.json`](../../content/development/native-polyglot-market-readiness-kernel.json)

## Purpose

This kernel advances SEIS around five durable lanes without adding new JavaScript or Python code:

1. Apple-only native Apple surfaces.
2. Windows and Android non-Apple polyglot surfaces.
3. AI / Agent / MCP / Skills / Plugin / LLM decision core.
4. Repository governance and safe GitHub publication discipline.
5. Market-readiness criteria for a calm, premium, reviewable product surface.

The goal is not to inflate the language bar. The goal is to make platform ownership and release posture explicit before larger implementation starts.

## Language Boundary

| Surface | Allowed first-class language families | Current posture |
| --- | --- | --- |
| Apple-only Apple surfaces | Swift, SwiftUI, Objective-C, Objective-C++, AppleScript, Metal Shading Language, Core ML metadata | Use for macOS, iOS, native inspectors, local automation, and Apple platform bridges. |
| Android surfaces | Kotlin, Java, Gradle metadata, XML, C++, Rust, Go where product-owned | Use for Android shell, emulator validation, accessibility, and low-motion policy. |
| Windows surfaces | C#, F#, PowerShell, Batch, C++, Rust, Go, T-SQL, MSBuild metadata | Use for Windows readiness, release checks, desktop companion planning, and enterprise compatibility. |
| Cross-platform policy surfaces | JSON Schema, YAML, TOML, Rego, CUE, SQL, GraphQL, OpenAPI, AsyncAPI | Use for contracts, governance, data shape, marketplace intake, and reversible release gates. |
| This pass blocks | New JavaScript app code, new Python app code, runtime dependency expansion, automatic deployment | Existing scripts may still be used for validation, but the implementation does not add JS/Python code. |

## Apple-only Apple Lane

Apple-native SEIS work should stay emotionally calm, local-first, privacy-respecting, and aligned with platform conventions.

- macOS inspector: SwiftUI shell for repository, branch, plugin, archive, and handoff status.
- iOS/iPadOS companion: SwiftUI reading and lightweight approval surface after governance records stabilize.
- Apple automation: AppleScript only for installed local apps and explicit user-owned workflows.
- Objective-C bridge: small compatibility layer for legacy Apple SDK or plugin surfaces when Swift interop is not enough.
- Metal/Core ML: only after a real visual or local model feature has a documented budget, fallback, and privacy reason.

### Apple gate

Before Apple implementation expands, document:

- target platform and minimum OS;
- native capability used;
- privacy boundary;
- accessibility and reduced-motion behavior;
- rollback path if the native shell is paused.

## Android and Windows Non-Apple Polyglot Lane

Android and Windows should not depend on Apple-only concepts. They should use their own strongest native or enterprise language families.

### Android

- Kotlin is the preferred Android-native policy and shell language.
- Java remains acceptable for JVM compatibility and release-readiness contracts.
- XML/Gradle metadata should describe platform configuration before runtime expansion.
- Rust/C++ are reserved for product-owned performance or native integration needs.

### Windows

- C# and PowerShell are the preferred Windows readiness pair.
- F# can model policy and release invariants where a functional contract is clearer.
- Batch may exist only for legacy compatibility or very small operator entry points.
- T-SQL/MSBuild metadata can document enterprise deployment and reporting expectations.

## AI / Agent / MCP / Skills / Plugin / LLM Decision Core

SEIS keeps one canonical writer at a time and routes other assistants as reviewers, researchers, planners, or explainers.

| Decision layer | Rule |
| --- | --- |
| Primary writer | Codex / ChatGPT for local repository work, terminal tasks, Git flow, validation, and final integration. |
| Architecture review | Claude is appropriate for high-risk refactors, design reasoning, and architecture critique. |
| Google ecosystem review | Gemini is appropriate for Google Cloud, Workspace, Firebase, broad-document synthesis, and docs validation. |
| Counter-evidence | Qwen or similar tools may provide alternative analysis without overwriting the writer's diff. |
| Local/offline experiments | Ollama-style models remain optional and non-canonical unless explicitly scoped. |
| MCP | Expose only bounded context: repo status, docs, plugin records, marketplace intake, and generated reports. Never expose secrets or personal data. |
| Skills and plugins | Promote only after source, owner, trust level, permission scope, rollback, and maintenance cost are documented. |

## Governance Gate

A safe GitHub push requires all of the following to be true:

1. The worktree has only intentional changes.
2. The current branch and intended remote branch are explicit.
3. No secrets, `.env` contents, personal identity documents, archives, or private media are included.
4. Documentation-only changes pass lightweight validation first.
5. Push is not treated as deployment.
6. Deployment requires a separate target, rollback, owner, and access review.

If a remote is absent or authentication is unavailable, the correct outcome is a local commit plus a blocked-push note, not a false publication claim.

## Market-readiness Gate

Market readiness is broader than build success. A SEIS surface is market-ready only when the following are explicit:

- platform ownership and support route;
- product value and user segment;
- privacy posture and data boundaries;
- accessibility and reduced-motion behavior;
- calm interaction budget;
- plugin marketplace trust and rollback criteria;
- release notes, security contact, and incident response path;
- branch, version, and artifact traceability.

## Current Decision

This update is documentation- and record-first. It strengthens SEIS direction without introducing JavaScript or Python code, runtime dependencies, automatic deploys, or broad generated assets.

## Aggressive Capability Expansion Addendum

The companion operating-system layer is [`docs/capability/seis-total-capability-operating-system.md`](../capability/seis-total-capability-operating-system.md). It expands this kernel across engineering, full stack, data, design, development, AI agents, MCP, skills, plugins, LLM routing, algorithms, mathematics, computer science, web/mobile/game development, data science, databases, version control, cloud, cybersecurity, DevOps, testing, architecture, big data, NLP, computer vision, quantum programming, sustainability, low-code/no-code, UX/UI engineering, robotics, AI ethics, compiler/language engineering, requirements, agile delivery, SDLC, metrics, SRE, reverse engineering, refactoring, and formal methods.

This expansion remains contract-first and runtime-light: do not install every language, do not add new JavaScript application code, and do not add new Python application code until explicitly requested.
