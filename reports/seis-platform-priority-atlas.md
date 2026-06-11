# SEIS Platform Priority Atlas

- Mode: `platform_core_first_website_last`
- Phases: 7
- Website final phase: True
- Apple language count: 5
- Windows language coverage: 41
- Domain coverage: 38
- Runtime install policy: `requirement_led_only`
- Install all languages: False

## Platform Rules

- Apple: AppleScript, Objective-C, Playground, Swift, SwiftUI
- Windows excludes: AppleScript, Objective-C, Playground, Swift, SwiftUI
- SEIS primary agent: True

## Phase Order

| Order | Phase | Platform Focus | Language Policy | Website | Gates |
| ---: | --- | --- | --- | --- | ---: |
| 1 | SEIS Agent Foundation | local, remote, offline | `agent_core_language_agnostic_with_requirement_led_runtime_install` | no | 4 |
| 2 | Apple Native Platform | macos, ios | `apple_languages_only` | no | 4 |
| 3 | Windows Non-Apple Polyglot | windows | `windows_polyglot_except_apple_only` | no | 3 |
| 4 | Engineering Data Security Core | backend, data, cloud, security, ops | `non_js_core_first` | no | 4 |
| 5 | Design Mobile Game Robotics Lab | design, mobile, game, robotics, ai_research | `platform_specific_with_non_js_prototypes_first` | no | 4 |
| 6 | Governance Metrics Refactoring | governance, quality, architecture, delivery | `checked_policy_artifacts_only` | no | 4 |
| 7 | Website Final Release Surface | web_release, publish, documentation | `web_compatibility_only_after_platform_gates` | yes | 5 |

## Phase Detail

### 1. SEIS Agent Foundation

- ID: `seis-agent-foundation`
- Languages: Python, Go, Rust, CUE, Rego, SQL
- Domains: ai-agent-engineering, mcp-skills-plugins, llm-orchestration, artificial-intelligence, algorithms-and-flowcharts, computer-science-foundations, mathematics-foundations, formal-methods
- Done signal: SEIS routes AI, agent, MCP, plugin, skill, and LLM work through checked local contracts.
- Quality gates:
  - `check:universal-capability-kernel`
  - `check:ai-release-manifest`
  - `check:llm-orchestration-policy`
  - `check:seis-nonjs-kernel`

### 2. Apple Native Platform

- ID: `apple-native-platform`
- Languages: AppleScript, Objective-C, Playground, Swift, SwiftUI
- Domains: mobile-development, ux-ui-engineering, product-design-and-creative-systems, software-architecture-and-patterns, test-engineering, sustainable-software
- Done signal: Apple work stays Swift, SwiftUI, Objective-C, Playground, and AppleScript only.
- Quality gates:
  - `swift test`
  - `check:seis-platform-kernel`
  - `check:seis-platform-language-policy`
  - `check:seis-platform-development-tracks`

### 3. Windows Non-Apple Polyglot

- ID: `windows-non-apple-polyglot`
- Languages: Awk, Batch, Bicep, C, C#, C++, CMD, CMake, COBOL, Dart, Dockerfile, F#, Fortran, Go, Groovy, Haskell, JSON Schema, Java, JavaScript, Kotlin, Lua, Make, Nim, OCaml, OpenAPI, PHP, Perl, PowerShell, Python, R, Ruby, Rust, SQL, Scala, Shell, Tcl, Terraform, TypeScript, Visual Basic, YAML, Zig
- Domains: full-stack-engineering, database-management, version-control-systems, cloud-computing, cybersecurity, devops-and-system-management, sre-and-observability, test-engineering
- Done signal: Windows keeps broad non-Apple language coverage and excludes Apple-only surfaces.
- Quality gates:
  - `check:seis-platform-kernel`
  - `check:seis-platform-development-tracks`
  - `check:seis-nonjs-kernel`

### 4. Engineering Data Security Core

- ID: `engineering-data-security-core`
- Languages: Python, Go, Rust, SQL, CUE, Rego, C#, PowerShell
- Domains: data-engineering-and-analytics, data-science, big-data-engineering, database-management, cloud-computing, cybersecurity, devops-and-system-management, sre-and-observability, software-metrics-and-measurement
- Done signal: Data, security, cloud, DevOps, metrics, and SRE gates are encoded before release UI work.
- Quality gates:
  - `go test ./...`
  - `check:cloud-environment`
  - `check:seis-nonjs-kernel`
  - `check:workspace`

### 5. Design Mobile Game Robotics Lab

- ID: `design-mobile-game-robotics-lab`
- Languages: SwiftUI, Kotlin, Dart, Python, Rust, Go, C++
- Domains: web-development, mobile-development, game-development, nlp-and-computer-vision, quantum-programming, low-code-no-code-platforms, ux-ui-engineering, product-design-and-creative-systems, autonomous-vehicles-and-robotics
- Done signal: Design, mobile, game, robotics, NLP/CV, and quantum work is planned before the website release surface.
- Quality gates:
  - `check:fullstack-language-matrix`
  - `check:mobile-ergonomics`
  - `check:motion-evidence`
  - `check:language-distribution`

### 6. Governance Metrics Refactoring

- ID: `governance-metrics-refactoring`
- Languages: Python, CUE, Rego, SQL, Markdown
- Domains: ai-ethics-and-data-governance, compiler-and-language-engineering, requirements-engineering, agile-project-management, software-development-lifecycle, software-metrics-and-measurement, reverse-engineering, software-refactoring, software-architecture-and-patterns, sustainable-software
- Done signal: Governance, metrics, refactoring, reverse engineering, and SDLC checks are stable.
- Quality gates:
  - `check:seis-execution-runway`
  - `check:seis-execution-packages`
  - `check:seis-active-mission-board`
  - `check:workspace`

### 7. Website Final Release Surface

- ID: `website-final-release-surface`
- Languages: HTML, CSS, compatibility JavaScript only
- Domains: web-development, software-development-lifecycle, sre-and-observability
- Done signal: Website changes happen only after platform gates pass and release sync is deterministic.
- Quality gates:
  - `check:release-sync`
  - `check:mobile-ergonomics`
  - `check:motion-evidence`
  - `check:cloud-environment`
  - `check:workspace`

## Covered Domains

- `agile-project-management`
- `ai-agent-engineering`
- `ai-ethics-and-data-governance`
- `algorithms-and-flowcharts`
- `artificial-intelligence`
- `autonomous-vehicles-and-robotics`
- `big-data-engineering`
- `cloud-computing`
- `compiler-and-language-engineering`
- `computer-science-foundations`
- `cybersecurity`
- `data-engineering-and-analytics`
- `data-science`
- `database-management`
- `devops-and-system-management`
- `formal-methods`
- `full-stack-engineering`
- `game-development`
- `llm-orchestration`
- `low-code-no-code-platforms`
- `mathematics-foundations`
- `mcp-skills-plugins`
- `mobile-development`
- `nlp-and-computer-vision`
- `product-design-and-creative-systems`
- `quantum-programming`
- `requirements-engineering`
- `reverse-engineering`
- `software-architecture-and-patterns`
- `software-development-lifecycle`
- `software-metrics-and-measurement`
- `software-refactoring`
- `sre-and-observability`
- `sustainable-software`
- `test-engineering`
- `ux-ui-engineering`
- `version-control-systems`
- `web-development`
