# SEIS Long-Horizon Mission Kernel

- Mode: `aggressive_long_duration_execution_backlog`
- Duration: 52 weeks
- Waves: 12
- Missions: 120
- Domain coverage: 38
- Language coverage: 35
- Apple missions: 20
- Windows missions: 20
- Minimum quality gates per mission: 6

## Install Policy

- Default: `do_not_install_new_runtime_for_language_percentage`
- Allowed when: a mission has a real build, test, deploy, or product runtime requirement
- Allowed when: the runtime is needed to validate a user-approved platform target
- Allowed when: the dependency can be removed or isolated if the mission is reverted

## Waves

| Wave | Horizon | Agent | Mission Count |
| --- | --- | --- | ---: |
| Foundation and Computer Science Core | `weeks-01-04` | `cs-foundation-agent` | 10 |
| Apple Native Studio | `weeks-05-08` | `apple-platform-agent` | 10 |
| Windows Polyglot Studio | `weeks-09-12` | `windows-agent` | 10 |
| AI Agent and LLM Orchestration | `weeks-13-16` | `llm-routing-agent` | 10 |
| MCP Skills and Plugin Governance | `weeks-17-20` | `integration-agent` | 10 |
| Full Stack Product Surfaces | `weeks-21-24` | `full-stack-agent` | 10 |
| Data Science and Intelligence | `weeks-25-28` | `data-science-agent` | 10 |
| Design, UX, and Creative Production | `weeks-29-32` | `ux-ui-agent` | 10 |
| Security SRE and Observability | `weeks-33-36` | `sre-agent` | 10 |
| Research Labs and Advanced Computing | `weeks-37-40` | `research-agent` | 10 |
| Compiler and Language Engineering | `weeks-41-46` | `language-engineering-agent` | 10 |
| Delivery Metrics and Sustainable Operations | `weeks-47-52` | `delivery-agent` | 10 |

## First 20 Missions

| Order | Mission | Domain | Languages | Gates |
| ---: | --- | --- | --- | --- |
| 1 | `wave-01-foundation-m01-architecture-contract` | `algorithms-and-flowcharts` | CUE, Go, Python, Rust, SQL | docs-updated, maintainability, reviewable-diff, rollback-plan |
| 2 | `wave-01-foundation-m02-agent-policy` | `mathematics-foundations` | CUE, Go, Markdown, Python, Rego | credential-safety, docs-updated, human-approval, offline-fallback |
| 3 | `wave-01-foundation-m03-platform-bridge` | `computer-science-foundations` | C#, CUE, Go, PowerShell, Python | docs-updated, path-safety, permission-scope, platform-syntax |
| 4 | `wave-01-foundation-m04-data-plane` | `web-development` | CUE, Go, Python, R, Rust | docs-updated, migration-plan, privacy-review, reviewable-diff |
| 5 | `wave-01-foundation-m05-design-engineering` | `mobile-development` | CSS, CUE, Go, HTML, Python | accessibility, docs-updated, motion-evidence, responsive-fit |
| 6 | `wave-01-foundation-m06-quality-gate` | `game-development` | CUE, Go, Python, Rust, SQL | actionable-error, deterministic-check, docs-updated, fail-fast |
| 7 | `wave-01-foundation-m07-security-governance` | `full-stack-engineering` | CUE, Go, Python, Rego, Rust | auditability, docs-updated, least-privilege, reviewable-diff |
| 8 | `wave-01-foundation-m08-llm-orchestration` | `data-engineering-and-analytics` | CUE, Go, JSON, Python, Rust | docs-updated, model-fallback, no-secret-leakage, provider-boundary |
| 9 | `wave-01-foundation-m09-runtime-surface` | `data-science` | CUE, Go, Java, Kotlin, PHP | docs-updated, documented-owner, no-heavy-install-by-default, reviewable-diff |
| 10 | `wave-01-foundation-m10-release-readiness` | `artificial-intelligence` | CUE, Go, Markdown, Python, Rust | cloud-readiness, docs-updated, language-budget, release-sync |
| 11 | `wave-02-apple-native-m01-architecture-contract` | `ai-agent-engineering` | AppleScript, Objective-C, Playground, Swift, SwiftUI | docs-updated, maintainability, reviewable-diff, rollback-plan |
| 12 | `wave-02-apple-native-m02-agent-policy` | `llm-orchestration` | AppleScript, Objective-C, Playground, Swift, SwiftUI | credential-safety, docs-updated, human-approval, offline-fallback |
| 13 | `wave-02-apple-native-m03-platform-bridge` | `mcp-skills-plugins` | AppleScript, Objective-C, Playground, Swift, SwiftUI | docs-updated, path-safety, permission-scope, platform-syntax |
| 14 | `wave-02-apple-native-m04-data-plane` | `database-management` | AppleScript, Objective-C, Playground, Swift, SwiftUI | docs-updated, migration-plan, privacy-review, reviewable-diff |
| 15 | `wave-02-apple-native-m05-design-engineering` | `version-control-systems` | AppleScript, Objective-C, Playground, Swift, SwiftUI | accessibility, docs-updated, motion-evidence, responsive-fit |
| 16 | `wave-02-apple-native-m06-quality-gate` | `cloud-computing` | AppleScript, Objective-C, Playground, Swift, SwiftUI | actionable-error, deterministic-check, docs-updated, fail-fast |
| 17 | `wave-02-apple-native-m07-security-governance` | `cybersecurity` | AppleScript, Objective-C, Playground, Swift, SwiftUI | auditability, docs-updated, least-privilege, reviewable-diff |
| 18 | `wave-02-apple-native-m08-llm-orchestration` | `devops-and-system-management` | AppleScript, Objective-C, Playground, Swift, SwiftUI | docs-updated, model-fallback, no-secret-leakage, provider-boundary |
| 19 | `wave-02-apple-native-m09-runtime-surface` | `test-engineering` | AppleScript, Objective-C, Playground, Swift, SwiftUI | docs-updated, documented-owner, no-heavy-install-by-default, reviewable-diff |
| 20 | `wave-02-apple-native-m10-release-readiness` | `software-architecture-and-patterns` | AppleScript, Objective-C, Playground, Swift, SwiftUI | cloud-readiness, docs-updated, language-budget, release-sync |
