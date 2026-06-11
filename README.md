# SEIS

SEIS is a main-centered, AI-native development operating system for engineering,
full-stack delivery, data, design, security, DevOps, mobile, desktop, research,
and long-horizon software governance.

The website is the final release surface. SEIS first hardens the platform core:
AI, AI agents, MCP, skills, plugins, LLM routing, Apple-native tooling,
Windows-polyglot tooling, Android readiness, architecture, security, testing,
SRE, data governance, and release checks.

## Active Collaboration Stack

SEIS is developed with a small, explicit assistant and IDE surface:

| Surface | Role |
| --- | --- |
| OpenAI Codex | Primary repo execution, code changes, terminal work, validation, and Git flow |
| Claude | Architecture review, long-context reasoning, and second-pass critique |
| Antigravity IDE | Agentic project workflow and local development surface |
| Cursor | Optional editor surface when the user chooses it |
| Xcode | Apple development with Swift, SwiftUI, Playground, Objective-C, and AppleScript |
| Android Studio | Android development, emulator workflows, Java/Kotlin project inspection, and device validation |

SEIS does not claim broad vendor partnership just because a company or product is
well known. Tools are listed only when they are part of the active workflow or a
checked project integration.

## Contributors

- Maintainer: [@emirhankudun-ux](https://github.com/emirhankudun-ux)
- AI collaboration: OpenAI Codex and Claude

GitHub's automatic contributor graph is commit-based. This section names the
AI-assisted workflow so readers understand how the project is being built.

## Platform Policy

| Platform | Policy |
| --- | --- |
| Apple | Use Swift, SwiftUI, Playground, Objective-C, and AppleScript only |
| Windows | Use broad non-Apple language coverage; never use Swift, SwiftUI, Objective-C, Playground, or AppleScript as Windows implementation surfaces |
| Android | Prefer Android Studio validation and Android-native Java/Kotlin surfaces; do not install heavyweight SDKs unless the task requires them |
| Web | Compatibility and final release surface only; JavaScript stays limited because the current repository already has enough |
| Python | Current phase freeze: do not add new Python implementation unless the maintainer explicitly re-enables it |

Runtime installs are requirement-led. SEIS does not install every language just
to increase a language chart.

## Capability Coverage

SEIS is designed to cover:

- AI, AI agents, MCP, skills, plugins, and LLM orchestration
- algorithms, flowcharts, mathematics, and computer science foundations
- web, mobile, game, full-stack, backend, and desktop development
- data science, data engineering, databases, big data, NLP, and computer vision
- cloud computing, cybersecurity, DevOps, SRE, observability, and test engineering
- software architecture, design patterns, refactoring, reverse engineering, and formal methods
- UX/UI engineering, product design, sustainable software, low-code/no-code governance, robotics, compiler and language engineering, requirements, agile delivery, SDLC, and metrics

## Orchestration Gate

SEIS Agent is the only approved remote orchestrator. OpenAI, Claude, Gemini,
Ollama, Qwen, and other helpers stay local-helper lanes unless a future policy
explicitly changes that. MCP, skills, plugins, LLM routing, and credential
boundaries are mandatory gates before any helper can be considered ready.

The machine-readable source for the current platform order is:

- [`content/development/seis-platform-priority-atlas.json`](./content/development/seis-platform-priority-atlas.json)
- [`reports/seis-platform-priority-atlas.md`](./reports/seis-platform-priority-atlas.md)

## Repository Governance

`main` is the only long-lived public center branch. Temporary work branches are
allowed only as short-lived review surfaces and should be merged back into
`main`, then deleted after verification. Existing remote branch cleanup must be
done deliberately; SEIS does not delete remote branches automatically from an
automation run.

Governance references:

- [`docs/governance/branch-policy.md`](./docs/governance/branch-policy.md)
- [`docs/governance/main-only-branch-consolidation.md`](./docs/governance/main-only-branch-consolidation.md)
- [`AGENTS.md`](./AGENTS.md)

## Repository Showcase Gate

GitHub visibility is treated as a product surface, not decoration. The public
repository should always expose the same core signals: active collaboration
stack, contributors, platform policy, capability coverage, orchestration gate,
repository governance, validation commands, and community files.

The gate is implemented in Swift and Go so the README, governance docs, and
GitHub-facing expectations can stay testable without adding new JavaScript or
Python code.

## Key Paths

| Path | Purpose |
| --- | --- |
| [`packages/seis_platform_swift`](./packages/seis_platform_swift) | Apple-native Swift/SwiftUI policy package |
| [`polyglot/objective-c`](./polyglot/objective-c) | Objective-C Apple bridge surfaces |
| [`polyglot/applescript`](./polyglot/applescript) | AppleScript automation surface |
| [`polyglot/android`](./polyglot/android) | Android-native readiness contracts |
| [`polyglot/windows`](./polyglot/windows) | Windows non-Apple language contracts |
| [`packages/seis_kernel_go`](./packages/seis_kernel_go) | Go capability budget checks |
| [`content/development`](./content/development) | Machine-readable SEIS operating contracts |
| [`reports`](./reports) | Human-readable generated reports |
| [`release/web`](./release/web) | Final website release surface |

## Validation

Use the lightest reliable checks first:

```bash
swift test --package-path packages/seis_platform_swift
javac -d /tmp/seis-windows-jvm polyglot/windows/jvm/SeisWindowsPlatform.java polyglot/windows/jvm/SeisWindowsPlatformTest.java
java -cp /tmp/seis-windows-jvm seis.windows.SeisWindowsPlatformTest
javac -d /tmp/seis-android-profile polyglot/android/java/SeisAndroidDevelopmentProfile.java polyglot/android/java/SeisAndroidDevelopmentProfileTest.java
java -cp /tmp/seis-android-profile seis.android.SeisAndroidDevelopmentProfileTest
clang -fobjc-arc -framework Foundation polyglot/objective-c/SEISPlatformBridge.m polyglot/objective-c/SEISPlatformBridgeTest.m -o /tmp/seis-objective-c-platform-test
/tmp/seis-objective-c-platform-test
xcrun clang++ -std=c++20 polyglot/windows/native/seis_windows_toolchain_profile.cpp polyglot/windows/native/seis_windows_toolchain_profile_test.cpp -o /tmp/seis-windows-toolchain-profile-test
/tmp/seis-windows-toolchain-profile-test
cd packages/seis_kernel_go && go test ./...
npm run check:seis-platform-priority-atlas
```

For the full repository refresh:

```bash
npm run automation:refresh-seis-surface -- --summary
```

## Community

- [Contributing](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)
- [MIT License](./LICENSE)
