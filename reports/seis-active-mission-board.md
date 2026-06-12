# SEIS Active Mission Board

- Mode: `first_90_days_execution_board`
- Source plan: `seis-long-horizon-mission-kernel`
- Focus window: 12 weeks
- Lanes: 3
- Month windows: 3
- Cards: 30
- Platform coverage: 5
- Language coverage: 29
- Quality gate coverage: 41
- Acceptance gate coverage: 12
- Runtime install policy: `do_not_install_new_runtime_for_language_percentage`

## Master Goal Trace

- North star: Continuously improve SEIS as a sustainable, high-quality, Apple-first, AI-native, open-source ecosystem.
- Workflow: inspect, analyze, understand-context, identify-risks, plan, validate, document
- Priority focus areas: engineering, architecture, design, ai-agents, mcp-plugins, data, automation, documentation, research, product
- Avoid: unnecessary-dependencies, technical-debt, duplicated-solutions, low-value-changes, runtime-installs-for-language-percentages

## Three Month Windows

| Window | Lane | Theme | Acceptance Gates | Evidence |
| --- | --- | --- | --- | --- |
| Month 1 `0-30` | `now` | Foundation, architecture, documentation | agi-contract-generated, agent-memory-planning-foundation-visible, github-community-health-current, quality-gates-pass | `reports/seis-agi-system.md`, `reports/seis-active-mission-board.md`, `README.md`, `AGENTS.md` |
| Month 2 `31-60` | `next` | Memory, planning, MCP | memory-checkpoints-traceable, planning-loops-deterministic, plugin-mcp-lanes-scoped, apple-first-contract-covered | `content/development/seis-agi-system.json`, `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift`, `reports/plugin-capability-lanes.md`, `reports/seis-execution-runway.md` |
| Month 3 `61-90` | `queued` | Agents, validation, release | agent-roles-separated, security-and-human-review-gates-present, github-community-health-ready, release-evidence-current | `docs/development/agents/README.md`, `SECURITY.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `reports/seis-agi-system.json` |

## Lanes

| Lane | Wave | WIP Limit | Cards | Cadence |
| --- | --- | ---: | ---: | --- |
| `now` | `wave-01-foundation` | 10 | 10 | daily reversible implementation slices |
| `next` | `wave-02-apple-native` | 10 | 10 | weekly Apple-native platform slices |
| `queued` | `wave-03-windows-polyglot` | 10 | 10 | weekly Windows polyglot platform slices |

## First 30 Execution Cards

| Order | Lane | Mission | Platforms | Languages | Gates |
| ---: | --- | --- | --- | --- | --- |
| 1 | `now` | `wave-01-foundation-m01-architecture-contract` | macos, windows, web, backend | CUE, Go, Python, Rust, SQL | docs-updated, maintainability, reviewable-diff, rollback-plan, agi-contract-generated, agent-memory-planning-foundation-visible |
| 2 | `now` | `wave-01-foundation-m02-agent-policy` | macos, windows, web, backend | CUE, Go, Markdown, Python, Rego, Rust | credential-safety, docs-updated, human-approval, offline-fallback, agi-contract-generated, agent-memory-planning-foundation-visible |
| 3 | `now` | `wave-01-foundation-m03-platform-bridge` | macos, windows, web, backend | C#, CUE, Go, PowerShell, Python, Rust | docs-updated, path-safety, permission-scope, platform-syntax, agi-contract-generated, agent-memory-planning-foundation-visible |
| 4 | `now` | `wave-01-foundation-m04-data-plane` | macos, windows, web, backend | CUE, Go, Python, R, Rust, SQL | docs-updated, migration-plan, privacy-review, reviewable-diff, agi-contract-generated, agent-memory-planning-foundation-visible |
| 5 | `now` | `wave-01-foundation-m05-design-engineering` | macos, windows, web, backend | CSS, CUE, Go, HTML, Python, Rust | accessibility, docs-updated, motion-evidence, responsive-fit, agi-contract-generated, agent-memory-planning-foundation-visible |
| 6 | `now` | `wave-01-foundation-m06-quality-gate` | macos, windows, web, backend | CUE, Go, Python, Rust, SQL, Shell | actionable-error, deterministic-check, docs-updated, fail-fast, agi-contract-generated, agent-memory-planning-foundation-visible |
| 7 | `now` | `wave-01-foundation-m07-security-governance` | macos, windows, web, backend | CUE, Go, Python, Rego, Rust, SQL | auditability, docs-updated, least-privilege, reviewable-diff, agi-contract-generated, agent-memory-planning-foundation-visible |
| 8 | `now` | `wave-01-foundation-m08-llm-orchestration` | macos, windows, web, backend | CUE, Go, JSON, Python, Rust, SQL | docs-updated, model-fallback, no-secret-leakage, provider-boundary, agi-contract-generated, agent-memory-planning-foundation-visible |
| 9 | `now` | `wave-01-foundation-m09-runtime-surface` | macos, windows, web, backend | CUE, Go, Java, Kotlin, PHP, Python | docs-updated, documented-owner, no-heavy-install-by-default, reviewable-diff, agi-contract-generated, agent-memory-planning-foundation-visible |
| 10 | `now` | `wave-01-foundation-m10-release-readiness` | macos, windows, web, backend | CUE, Go, Markdown, Python, Rust, SQL | cloud-readiness, docs-updated, language-budget, release-sync, agi-contract-generated, agent-memory-planning-foundation-visible |
| 11 | `next` | `wave-02-apple-native-m01-architecture-contract` | macos, ios | AppleScript, Objective-C, Playground, Swift, SwiftUI | docs-updated, maintainability, reviewable-diff, rollback-plan, memory-checkpoints-traceable, planning-loops-deterministic |
| 12 | `next` | `wave-02-apple-native-m02-agent-policy` | macos, ios | AppleScript, Objective-C, Playground, Swift, SwiftUI | credential-safety, docs-updated, human-approval, offline-fallback, memory-checkpoints-traceable, planning-loops-deterministic |
| 13 | `next` | `wave-02-apple-native-m03-platform-bridge` | macos, ios | AppleScript, Objective-C, Playground, Swift, SwiftUI | docs-updated, path-safety, permission-scope, platform-syntax, memory-checkpoints-traceable, planning-loops-deterministic |
| 14 | `next` | `wave-02-apple-native-m04-data-plane` | macos, ios | AppleScript, Objective-C, Playground, Swift, SwiftUI | docs-updated, migration-plan, privacy-review, reviewable-diff, memory-checkpoints-traceable, planning-loops-deterministic |
| 15 | `next` | `wave-02-apple-native-m05-design-engineering` | macos, ios | AppleScript, Objective-C, Playground, Swift, SwiftUI | accessibility, docs-updated, motion-evidence, responsive-fit, memory-checkpoints-traceable, planning-loops-deterministic |
| 16 | `next` | `wave-02-apple-native-m06-quality-gate` | macos, ios | AppleScript, Objective-C, Playground, Swift, SwiftUI | actionable-error, deterministic-check, docs-updated, fail-fast, memory-checkpoints-traceable, planning-loops-deterministic |
| 17 | `next` | `wave-02-apple-native-m07-security-governance` | macos, ios | AppleScript, Objective-C, Playground, Swift, SwiftUI | auditability, docs-updated, least-privilege, reviewable-diff, memory-checkpoints-traceable, planning-loops-deterministic |
| 18 | `next` | `wave-02-apple-native-m08-llm-orchestration` | macos, ios | AppleScript, Objective-C, Playground, Swift, SwiftUI | docs-updated, model-fallback, no-secret-leakage, provider-boundary, memory-checkpoints-traceable, planning-loops-deterministic |
| 19 | `next` | `wave-02-apple-native-m09-runtime-surface` | macos, ios | AppleScript, Objective-C, Playground, Swift, SwiftUI | docs-updated, documented-owner, no-heavy-install-by-default, reviewable-diff, memory-checkpoints-traceable, planning-loops-deterministic |
| 20 | `next` | `wave-02-apple-native-m10-release-readiness` | macos, ios | AppleScript, Objective-C, Playground, Swift, SwiftUI | cloud-readiness, docs-updated, language-budget, release-sync, memory-checkpoints-traceable, planning-loops-deterministic |
| 21 | `queued` | `wave-03-windows-polyglot-m01-architecture-contract` | windows | Batch, C#, C++, F#, Go, Java | docs-updated, maintainability, reviewable-diff, rollback-plan, agent-roles-separated, security-and-human-review-gates-present |
| 22 | `queued` | `wave-03-windows-polyglot-m02-agent-policy` | windows | Batch, C#, C++, F#, Go, Java | credential-safety, docs-updated, human-approval, offline-fallback, agent-roles-separated, security-and-human-review-gates-present |
| 23 | `queued` | `wave-03-windows-polyglot-m03-platform-bridge` | windows | Batch, C#, C++, F#, Go, Java | docs-updated, path-safety, permission-scope, platform-syntax, agent-roles-separated, security-and-human-review-gates-present |
| 24 | `queued` | `wave-03-windows-polyglot-m04-data-plane` | windows | Batch, C#, C++, F#, Go, Java | docs-updated, migration-plan, privacy-review, reviewable-diff, agent-roles-separated, security-and-human-review-gates-present |
| 25 | `queued` | `wave-03-windows-polyglot-m05-design-engineering` | windows | Batch, C#, C++, F#, Go, Java | accessibility, docs-updated, motion-evidence, responsive-fit, agent-roles-separated, security-and-human-review-gates-present |
| 26 | `queued` | `wave-03-windows-polyglot-m06-quality-gate` | windows | Batch, C#, C++, F#, Go, Java | actionable-error, deterministic-check, docs-updated, fail-fast, agent-roles-separated, security-and-human-review-gates-present |
| 27 | `queued` | `wave-03-windows-polyglot-m07-security-governance` | windows | Batch, C#, C++, F#, Go, Java | auditability, docs-updated, least-privilege, reviewable-diff, agent-roles-separated, security-and-human-review-gates-present |
| 28 | `queued` | `wave-03-windows-polyglot-m08-llm-orchestration` | windows | Batch, C#, C++, F#, Go, Java | docs-updated, model-fallback, no-secret-leakage, provider-boundary, agent-roles-separated, security-and-human-review-gates-present |
| 29 | `queued` | `wave-03-windows-polyglot-m09-runtime-surface` | windows | Batch, C#, C++, F#, Go, Java | docs-updated, documented-owner, no-heavy-install-by-default, reviewable-diff, agent-roles-separated, security-and-human-review-gates-present |
| 30 | `queued` | `wave-03-windows-polyglot-m10-release-readiness` | windows | Batch, C#, C++, F#, Go, Java | cloud-readiness, docs-updated, language-budget, release-sync, agent-roles-separated, security-and-human-review-gates-present |
