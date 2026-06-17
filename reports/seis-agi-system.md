# SEIS AGI System

- Generated: 2026-06-12
- Mode: human_owned_agi_inspired_engineering_system
- Target release: 2026-09-12
- JavaScript target: 21.0%
- Token savings target: 60%
- Roadmap domains: 150
- Practical priority domains: 20

## Claim Boundary

This is an AGI-inspired operating architecture for human-helper AI systems; it does not claim autonomous general intelligence.

## North Star

Continuously improve SEIS as a premium AI-native, full-stack, design-driven, open-source ecosystem for real users and contributors.

## Platform Strategy

| lane | policy |
| --- | --- |
| Apple first | Swift, SwiftUI, Objective-C, Metal, AppKit, UIKit, Combine, Core Data, CloudKit |
| Web | TypeScript, JavaScript, HTML, CSS |
| AI and data | Python, Rust |
| Android | Kotlin, Java, Jetpack Compose |
| Windows | C#, .NET, C++, Rust, WinUI |
| Systems and infrastructure | Go, Zig, SQL, Shell, PowerShell |
| Install policy | avoid_unnecessary_sdks_runtimes_frameworks_dependencies_and_toolchain_bloat |
| HTML CSS policy | Keep HTML and CSS stable; do not distort GitHub Linguist just to move source percentages. |

## Subsystems

| subsystem | intent | implementation roots | gates |
| --- | --- | --- | --- |
| Advanced Agent Orchestration | Route Codex, Claude, Gemini, Qwen, local helpers, MCP tools, and plugins through one governed execution layer. | packages/seis-ai/, mcp/, plugins/seis/, docs/development/agents/ | single-writer-mode, tool-minimization, handoff-notes, permission-scope |
| Memory Architecture | Preserve durable project, architecture, governance, deployment, research, and design decisions without leaking secrets. | packages/seis_platform_swift/, packages/seis_kernel/, docs/governance/ | source-backed-memory, secret-safety, retrieval-trace, staleness-awareness |
| Planning and Execution Kernel | Turn large goals into reversible daily packets, 90-day release windows, and long-horizon mission waves. | content/development/seis-active-mission-board.json, reports/seis-execution-packages.md | small-slices, dependency-order, rollback-ready, no-runtime-bloat |
| Research Automation | Prefer primary sources and task-specific research tools before implementation assumptions become architecture. | packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIResearchAutomationRuntime.swift, docs/research/, reports/, content/development/ | primary-source-first, version-compatibility, citation-trace, claim-boundary |
| Multi-Agent Coordination | Coordinate Codex execution, Claude architecture review, Gemini research validation, and local fallback helpers. | AGENTS.md, packages/ai-language/, docs/platform/ | one-writer-at-a-time, reviewer-role-separated, diff-review, human-approval |
| Plugin, MCP, and Skills Mesh | Activate data, development, design, research, deployment, security, and collaboration capabilities only when relevant. | content/development/plugin-capability-lanes.json, reports/plugin-capability-lanes.md | authenticated-scope, read-write-gate, minimum-required-tools, no-fake-usage |
| Token Efficiency Engine | Save at least 60 percent of prompt/runtime budget through retrieval, compression, source manifests, and staged plans. | AGENTS.md, docs/governance/, reports/seis-agi-system.md | bounded-context, source-manifest, summarize-before-expand, avoid-repeated-discovery |
| Human Helper AI | Keep SEIS helpful to real people through calm UX, explainable decisions, accessibility, and human review. | apps/web/, packages/seis_platform_swift/, docs/agi/ | accessibility, humane-ux, explainability, human-in-the-loop |
| Security and Governance | Keep credentials, user data, repository state, and connector writes behind explicit safety gates. | SECURITY.md, docs/governance/, .github/ | least-privilege, secret-safety, auditability, non-destructive-defaults |
| Observability and Evaluation | Measure agent quality, reliability, token efficiency, capability usage, and release readiness. | reports/, scripts/, packages/seis-ai/test/ | deterministic-checks, quality-metrics, regression-tests, release-evidence |

## Plugin MCP Skill Lanes

| lane | examples | activation gate |
| --- | --- | --- |
| Development read/write | GitHub, Build Web Apps, Build iOS Apps, Build macOS Apps, Expo, Vercel, Cloudflare | Use only for scoped implementation, repo inspection, CI, deploy, or native platform validation. |
| Data read/write | Airtable, Supabase, Neon Postgres, MotherDuck, Data Analytics, Mixpanel, PostHog | Use only with schema, date range, account scope, privacy boundary, and rollback path. |
| Design interactive | Figma, Canva, Adobe, Product Design, Creative Production, Fal, Shutterstock | Use only with a design brief, asset rights, accessibility notes, and visual QA target. |
| Research and knowledge | Hugging Face, Scite, Zotero, Google Drive, Notion, Hebbia, Readwise | Use only when source-backed evidence or durable knowledge retrieval is needed. |
| Collaboration and operations | Slack, Asana, Linear, Jira, Google Calendar, HubSpot, Intercom | Use only with clear write intent, user approval, and communication scope. |

## Memory Planning Automation

- Runtime: Swift + Foundation + Core Data + CloudKit
- Storage policy: Use Core Data for local agent context records, CloudKit for optional sync metadata, and Foundation JSON for generated evidence manifests; never persist secrets.

| checkpoint | phase | storage surface | evidence | gates |
| --- | --- | --- | --- | --- |
| Context Intake | inspect | Core Data local context cache | `AGENTS.md` | repo-state-read, instruction-boundary, secret-safety |
| Task Decomposition | plan | Core Data task packet records | `reports/seis-execution-packages.md` | small-slices, rollback-ready, dependency-order |
| Research Evidence | research | Foundation JSON source manifest | `reports/seis-agi-system.md` | primary-source-first, citation-trace, claim-boundary |
| Multi-Agent Handoff | coordinate | Core Data handoff notes plus git diff summary | `docs/agi/seis-agi-system.md` | single-writer-mode, reviewer-role-separated, human-approval |
| Self Evaluation | verify | Foundation check transcript plus generated reports | `reports/seis-agi-system.json` | deterministic-checks, coverage-evidence, residual-risk-log |

| loop | trigger | output | gates |
| --- | --- | --- | --- |
| Retrieve Compress Plan | large or recurring SEIS goal | `content/development/seis-agi-system.json` | bounded-context, source-backed-memory, token-savings-target |
| Plan Execute Verify Document | repo modification request | `reports/seis-agi-system.md` | git-diff-reviewable, swift-test, docs-updated |
| Research Synthesize Validate | unstable or source-sensitive claim | `docs/agi/seis-agi-system.md` | primary-source-first, version-compatibility, citation-trace |
| Handoff Review Commit | agent writer role changes or commit handoff | `git commit` | one-writer-at-a-time, human-readable-handoff, no-unrelated-reverts |

## Implementation Surfaces

| surface | path |
| --- | --- |
| swiftContract | `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift` |
| swiftMemoryPlanningStore | `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIMemoryPlanningStore.swift` |
| swiftContextCompressionRuntime | `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIContextCompressionRuntime.swift` |
| swiftAgentOrchestrationRuntime | `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIAgentOrchestrationRuntime.swift` |
| swiftResearchAutomationRuntime | `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIResearchAutomationRuntime.swift` |
| swiftAgentHandoffStore | `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIAgentHandoffStore.swift` |
| generator | `scripts/create-seis-agi-system.py` |
| sourceContract | `content/development/seis-agi-system.json` |
| report | `reports/seis-agi-system.md` |
| documentation | `docs/agi/seis-agi-system.md` |

## Visual Sources Used

| source | repository path | used | signals |
| --- | --- | --- | --- |
| images.jpeg | `content/development/seis-agi-reference-assets/basic-programming-concepts.jpeg` | yes | program-development, problem-analysis, algorithm-design, debugging, documentation, structured-programming |
| Unknown-7.jpg | `content/development/seis-agi-reference-assets/python-programming-roadmap.jpg` | yes | python-basics, oop, data-structures, automation, testing, web-frameworks, data-science |
| Unknown-6.jpg | `content/development/seis-agi-reference-assets/college-projects.jpg` | yes | starter-projects, javascript, python, c-plus-plus, java, apps, automation |
| Unknown-5.jpg | `content/development/seis-agi-reference-assets/python-important-topics.jpg` | yes | syntax, data-structures, oop, file-handling, web-development, data-analysis, machine-learning, concurrency |
| Unknown-4.jpg | `content/development/seis-agi-reference-assets/advanced-c-projects.jpg` | yes | c, systems-programming, data-structures, file-handling, graphics, simulation |
| Unknown-3.jpg | `content/development/seis-agi-reference-assets/functional-programming-concepts.jpg` | yes | pure-functions, immutability, higher-order-functions, recursion, referential-transparency, lazy-evaluation |
| Unknown-2.jpg | `content/development/seis-agi-reference-assets/dsa-interview-topics.jpg` | yes | arrays, trees, graphs, sorting, searching, two-pointers, dynamic-programming, greedy |
| Unknown.jpg | `content/development/seis-agi-reference-assets/programming-blogs-websites.jpg` | yes | learning-resources, programming-blogs, real-python, css-tricks, knowledge-sources |

## 90 Day Roadmap

| window | theme | focus | acceptance gates | evidence |
| --- | --- | --- | --- | --- |
| 0-30 | Foundation, architecture, documentation | computer-science-foundation, software-architecture, documentation, open-source-health | agi-contract-generated, agent-memory-planning-foundation-visible, github-community-health-current, quality-gates-pass | reports/seis-agi-system.md, reports/seis-active-mission-board.md, README.md, AGENTS.md |
| 31-60 | Memory, planning, MCP | memory-architecture, planning-kernel, mcp-skills, plugin-read-write-lanes | memory-checkpoints-traceable, planning-loops-deterministic, plugin-mcp-lanes-scoped, apple-first-contract-covered | content/development/seis-agi-system.json, packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift, reports/plugin-capability-lanes.md, reports/seis-execution-runway.md |
| 61-90 | Agents, validation, release | agent-orchestration, multi-agent-coordination, security-validation, release-readiness | agent-roles-separated, security-and-human-review-gates-present, github-community-health-ready, release-evidence-current | docs/development/agents/README.md, SECURITY.md, .github/PULL_REQUEST_TEMPLATE.md, reports/seis-agi-system.json |

## Practical Priority Domains

The full 150-domain taxonomy is stored in `content/development/seis-agi-system.json` as long-term roadmap material. This compact report keeps the implementation priorities visible first.

| # | domain | lane |
| ---: | --- | --- |
| 1 | Computer Foundations | core-computing |
| 2 | Programming Foundations | core-computing |
| 3 | Data Structures | core-computing |
| 4 | Algorithms | core-computing |
| 5 | Mathematics | mathematics |
| 8 | Software Architecture | architecture |
| 13 | Mobile Development | mobile |
| 14 | Desktop Development | desktop |
| 17 | DevOps | devops |
| 18 | Cybersecurity | security-governance |
| 19 | Artificial Intelligence | ai-intelligence |
| 23 | Testing and Quality | quality |
| 24 | Open Source | open-source |
| 30 | Data Engineering | data-engineering |
| 34 | Design Technologies | design-systems |
| 43 | AI Native Systems | ai-intelligence |
| 47 | Documentation Engineering | documentation |
| 48 | Platform Engineering | platform |
| 73 | AI Agent Ecosystems | agent-ecosystem |
| 102 | Research Engineering | research-engineering |

## Domain Lanes

| lane | domains |
| --- | ---: |
| aerospace | 1 |
| agent-ecosystem | 1 |
| agent-organization | 1 |
| agi-research | 1 |
| ai-intelligence | 2 |
| ai-safety | 1 |
| ambient-computing | 1 |
| api | 1 |
| architecture | 1 |
| archives | 1 |
| artificial-life | 1 |
| automation | 1 |
| autonomy | 1 |
| bci | 1 |
| bioinformatics | 1 |
| civic | 1 |
| civilization | 3 |
| civilization-ai | 1 |
| civilization-simulation | 1 |
| climate | 1 |
| cloud | 1 |
| cognitive | 1 |
| cognitive-research | 1 |
| collective-intelligence | 2 |
| community | 1 |
| complexity | 1 |
| computational-society | 1 |
| core-computing | 4 |
| cosmic-computing | 1 |
| creative | 2 |
| creative-ai | 1 |
| culture | 1 |
| data-engineering | 2 |
| data-governance | 1 |
| decision-intelligence | 1 |
| design-ops | 1 |
| design-systems | 2 |
| desktop | 1 |
| developer-experience | 1 |
| devops | 1 |
| digital-twins | 1 |
| distributed-systems | 1 |
| documentation | 1 |
| domain-systems | 2 |
| economic-simulation | 1 |
| ecosystem | 1 |
| education | 2 |
| embedded | 1 |
| energy | 1 |
| enterprise | 1 |
| enterprise-ai | 1 |
| enterprise-knowledge | 1 |
| evolutionary-ai | 1 |
| finance | 1 |
| foresight | 1 |
| future-civilization | 1 |
| future-os | 1 |
| future-systems | 1 |
| future-work | 1 |
| game-systems | 1 |
| geospatial | 1 |
| global-systems | 1 |
| graphics | 1 |
| hci | 1 |
| health | 1 |
| human-ai | 1 |
| human-augmentation | 1 |
| human-performance | 1 |
| humane-tech | 1 |
| humanities | 1 |
| identity | 1 |
| industry | 1 |
| information-retrieval | 1 |
| innovation | 1 |
| knowledge | 1 |
| knowledge-economy | 1 |
| language-engineering | 1 |
| legal-tech | 2 |
| low-code | 1 |
| machine-economies | 1 |
| mathematics | 1 |
| media | 1 |
| meta-systems | 1 |
| metaverse | 1 |
| mlops | 1 |
| mobile | 1 |
| molecular-computing | 1 |
| neuromorphic | 1 |
| neuroscience | 1 |
| open-source | 1 |
| organization | 1 |
| personal-knowledge | 1 |
| planetary-computing | 1 |
| planetary-engineering | 1 |
| platform | 2 |
| product-ecosystem | 1 |
| product-engineering | 2 |
| product-governance | 1 |
| productivity | 1 |
| quality | 2 |
| quantum | 1 |
| release | 1 |
| reliability | 3 |
| research-engineering | 1 |
| research-lab | 1 |
| robotics | 1 |
| scientific-discovery | 2 |
| security-governance | 2 |
| simulation | 1 |
| skill-graph | 1 |
| smart-cities | 1 |
| social-tech | 1 |
| software-engineering | 2 |
| software-factory | 1 |
| space | 2 |
| space-civilization | 1 |
| spatial | 2 |
| sustainability | 1 |
| synthetic-biology | 1 |
| synthetic-minds | 1 |
| synthetic-worlds | 1 |
| systems | 3 |
| systems-thinking | 1 |
| trust | 1 |
| universal-knowledge | 1 |

## Quality Gates

- agent_subsystems_at_least_10
- visual_sources_marked_used
- plugin_lanes_cover_data_development_design
- javascript_target_is_21_percent
- token_savings_target_is_60_percent
- apple_first_language_contract_present
- apple_native_memory_store_present
- apple_native_context_compression_present
- apple_native_agent_orchestration_present
- apple_native_research_automation_present
- apple_native_agent_handoff_store_present
- no_runtime_install_for_language_percentage
- security_and_human_review_gates_present
