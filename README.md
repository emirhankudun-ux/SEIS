# SEIS

SEIS is an AI-native open source platform and creative engineering ecosystem
designed to unify software repositories, AI agents, documentation, automation,
design systems, cloud workflows, MCP systems, plugins, and long-term product
intelligence.

It is not only a project or application repository. SEIS is a calm, modular,
and premium operating layer for building, managing, and evolving
creative-engineering systems. It is also a living platform layer for AI systems,
AI agents, MCP servers, skills, plugins, LLM workflows, full-stack products,
design systems, data systems, and long-term engineering governance.

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

## Vision

SEIS exists to become a world-class AI-native command center for modern
software, design, documentation, automation, GitHub, cloud, SSH/VPN, security,
roadmap, and knowledge workflows.

The goal is not to create another generic dashboard. The goal is to build the
operating layer of the SEIS ecosystem: calm, intelligent, modular,
maintainable, and future-ready.

Root system documents:

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) defines the conceptual layers and
  operating flow.
- [`ROADMAP.md`](./ROADMAP.md) defines the staged evolution from foundation to
  professional, enterprise, and supreme capability levels.
- [`docs/governance/seis-god-mode-developer.md`](./docs/governance/seis-god-mode-developer.md)
  defines the SEIS God Mode Developer lane for high-leverage, cross-layer work.

## Runnable SEIS Demo

The current browser demo starts from the SEIS System OS route:

```bash
cd apps/web
python3 -m http.server 50951 --bind 127.0.0.1
```

Then open `http://127.0.0.1:50951/desktop.html`.

The demo is local-first and requires zero cloud AI provider keys for the core
experience. SEIS AI uses clearly labeled Local Demo mode unless a backend
provider is configured and verified. SSH, deployment, provider keys, and live
model routing remain disabled or planned where marked.

For this demo, "full-stack" is treated as the complete product path rather than
only a screen: frontend OS surfaces, browser-local data/state, route wiring,
validator scripts, static packaging, security boundaries, and documented
backend/API/data contracts. The first contract is
`content/development/seis-fullstack-contract.json`, exposed read-only through
the local `node:http` static server as `/_server/session`,
`/_server/provider-status`, and related `/_server/*` Local Demo endpoints. The
current runnable package stays zero-key and local-first; live AI, durable
databases, deployment, auth, and SSH require separate approved backend-only
work.

Primary demo routes:

- `desktop.html` - SEIS System OS, Second Brain, Demo Studio, Search,
  Launchpad, Files, Terminal, Store, Music, Design, Cloud, Agents, and local
  apps.
- `seis-linux-replica.html` - supplied-reference-inspired SEIS System OS /
  Linux-like route with boot, login, top system bar, pinned side rail, live
  activity strip, dock/taskbar, launcher, resizable/draggable windows,
  browser-local VFS, terminal, session persistence, a Live Demo Console,
  Demo Readiness evidence board, source coverage metrics, terminal `live` /
  `readiness` / `sources` commands, 65+ core app
  launch targets, and the live Reference Vault for 219 supplied ZIP modules under
  `apps/web/reference-banks/`. `seis-linux-replica.html?demo=live` is the
  public-demo deep link that auto-enters the browser-local shell and starts the
  live tour without SSH, deployment, provider calls, or host shell access; the
  landing page primary OS CTAs and SEIS OS product page CTA route to this live
  demo path. TR/EN locale persistence uses
  `seis.locale.v1`, and connected SEIS Search, Code, Design, Cloud, Store,
  Website, Music, AI Core, and Reference surfaces open mini workspaces or
  iframe-backed local reference modules with browser-local state changes. The
  focused browser smoke check captures desktop, mobile, and deep-link evidence for the live
  demo console, Demo Readiness gates, source coverage, reference modules,
  terminal commands, and viewport-safe window sizing. It also validates every populated Reference
  Vault route and thumbnail path in `apps/web/reference-banks/reference-apps.js`
  from the static web serving root, so missing supplied-module assets fail the
  demo gate instead of silently shipping broken cards. The focused review packet
  is maintained at
  [`docs/reviews/SEIS_LINUX_REPLICA_LIVE_DEMO_REVIEW.md`](./docs/reviews/SEIS_LINUX_REPLICA_LIVE_DEMO_REVIEW.md),
  the public reviewer quickstart is maintained at
  [`docs/demos/SEIS_PUBLIC_DEMO_REVIEWER_QUICKSTART.md`](./docs/demos/SEIS_PUBLIC_DEMO_REVIEWER_QUICKSTART.md),
  and the public operator walkthrough is maintained at
  [`docs/demos/SEIS_LINUX_REPLICA_PUBLIC_WALKTHROUGH.md`](./docs/demos/SEIS_LINUX_REPLICA_PUBLIC_WALKTHROUGH.md).
- `seis-linux-replica-public-demo.html` - public reviewer entry route for the
  Linux-like demo. It summarizes the seven-minute walkthrough, current evidence,
  supplied asset boundary, and real/local/mock/disabled states before opening
  `seis-linux-replica.html?demo=live`.
- `seis-code.html` - SEIS Code browser IDE route.
- `website/index.html` - SEIS Website hub, with product pages for SEIS AI, OS,
  Code, Design, Search, Cloud, Store, and Agents.
- `wow-gallery.html` - imported SEIS_WOW visual reference catalog.
- `mythic-gacha.html` - playable no-key Mythic Gacha and Bestiary route.
- `showcase/*.html` - four cinematic Video Hero pages.

Key local validation commands:

```bash
npm run check:desktop-os
npm run check:seis-second-brain
npm run report:seis-obsidian-safe-import-dry-run
npm run check:seis-obsidian-safe-import-dry-run
npm run report:seis-read-only-model-router-decision
npm run check:seis-read-only-model-router-decision
npm run report:seis-second-brain-accessibility-focus-report
npm run check:seis-second-brain-accessibility-focus-report
npm run report:seis-second-brain-agent-registry
npm run check:seis-second-brain-agent-registry
npm run check:seis-second-brain-readiness-contracts
npm run check:seis-second-brain-browser-smoke
npm run check:seis-public-demo-go-no-go -- --run-fast-checks
npm run report:seis-public-demo-go-no-go
npm run check:desktop-os-browser-smoke
npm run check:seis-linux-replica-browser-smoke
node scripts/check-seis-linux-replica-public-walkthrough.mjs
node scripts/check-seis-static-demo-routes.mjs
npm run check:seis-code
npm run check:seis-website-pages
npm run check:seis-ultimate-demo
npm run check:seis-ssh-public-access
npm run check:seis-fullstack-contract
npm run check:seis-fullstack-server-smoke
npm run check:seis-fullstack-no-server-fallback-smoke
npm run check:seis-20b-benchmark-dry-run
npm run check:seis-150b-frontier-model-program
npm run check:seis-model-frontier-escalation-policy
npm run check:seis-model-local-hardware-preflight
npm run check:seis-model-scaling-hardware-profile
npm run check:seis-512b-apex-model-program
npm run check:seis-model-parameter-ladder
npm run check:seis-model-scaling-subagent-council
npm run check:mythic-gacha
npm run check:video-hero-showcase
npm run check:video-hero-browser-smoke
npm run check:product-experience-browser-smoke
npm run build:static
npm run check:static-build
```

## SEIS SSH Public GitHub Access

`SEIS-SSH` is the single public-facing SSH alias for SEIS. The public GitHub
contract is:

```text
Keep the same server and port.
Ayni sunucu ve baglanti noktasi korunur.
```

The source-of-truth contract is
`deploy/seis-ssh-public-access-contract.json`, with the runbook at
`docs/deployment/seis-ssh-public-github-access.md`.

Use this static gate before claiming public SSH onboarding is wired:

```bash
npm run check:seis-ssh-public-access
npm run report:seis-ssh-public-access
npm run check:seis-ssh-public-onboarding
npm run report:seis-ssh-public-onboarding
npm run check:seis-ssh-public-contributor-doctor
npm run report:seis-ssh-public-contributor-doctor
npm run check:seis-ssh-live-readiness-evidence
```

This does not execute SSH. Live readiness still requires explicit approval and
strict evidence such as `npm run cloud:ssh:online:strict`.

`npm run report:seis-ssh-public-onboarding` writes a read-only GitHub review
pack under `reports/seis-ssh-public-access/`. It does not write SSH config,
does not open a live connection, and does not create shared credentials; it
documents reviewer, maintainer, and new-contributor paths while preserving the
existing `SEIS-SSH` server and port.

`npm run report:seis-ssh-public-contributor-doctor` adds a local self-service
doctor for GitHub users. It checks local tools and the sanitized `SEIS-SSH`
snapshot without contacting GitHub, opening SSH, or writing SSH config.

The latest approval-gated live probe is tracked in
`content/development/seis-ssh-live-readiness-evidence.json` and
`docs/deployment/seis-ssh-live-readiness-evidence.md`. As of 2026-06-29, live
readiness is blocked by a GitHub Codespaces billing issue; the same server and
port policy remains preserved, but online/mobile-ready claims are not allowed.

## SEIS Brain and Obsidian Memory

SEIS ships a markdown-first second-brain layer under `seis-brain/vault` for
agent/context continuity and public-safe project memory.

- `SEIS_SECOND_BRAIN.md` explains the memory model and operating rules.
- `SEIS_OBSIDIAN_VAULT.md` explains folder structure and backlinks.
- `docs/OBSIDIAN_SECOND_BRAIN.md` mirrors onboarding notes for contributors.
- `seis-brain/vault/00_Index/SEIS Home.md` is the memory entry point.

Do not store credentials, private keys, hostnames, raw secrets, or private data
in these notes. Use `docs/PUBLIC_READINESS.md` for release-safe checks.

## Installed AI / Local AI Registry

SEIS tracks installed and available AI capabilities in:

- `SEIS_INSTALLED_AI_TOOLS.md`
- `seis-brain/vault/04_AI/`
- `docs/LOCAL_AI_SETUP.md`
- `docs/OBSIDIAN_SECOND_BRAIN.md`

The repo does not require keys for core demo operation. Local or provider-based AI
features are explicitly labeled by mode.

## SEIS-SSH and Cloud Readiness

SEIS remote-development and cloud-readiness concepts are documented in:

- `SEIS_SSH.md`
- `docs/SEIS_SSH_SETUP.md`
- `seis-brain/vault/07_SSH_Cloud/`

Real SSH credentials are never committed. SEIS-SSH docs provide sample-safe
metadata and deployment readiness gate names.

`npm run check:seis-second-brain-readiness-contracts` validates the Second
Brain readiness contracts for the Obsidian bridge safe import plan,
accessibility/focus QA, provider-neutral read-only model-router boundary, and
PR #54 public demo release checklist without enabling private vault import,
live provider routing, SSH, deployment, merge, or publication.

`npm run check:seis-public-demo-go-no-go -- --run-fast-checks` is the read-only
public demo release gate. It is expected to report `NO-GO` until current browser
smoke evidence exists, the worktree is reviewed, and the human owner explicitly
approves release. Second Brain readiness contracts stay review-gated until human
approval.

`npm run report:seis-obsidian-safe-import-dry-run` writes the repo-owned
Obsidian safe-import dry-run artifacts under `reports/seis-public-demo/`.
Those artifacts are generated from SEIS seed note metadata only; they do not
scan a private Obsidian vault, copy note bodies, install plugins, call
providers, execute SSH, mutate GitHub, deploy, or approve publication.

`npm run report:seis-read-only-model-router-decision` writes the provider-neutral
read-only router decision artifacts under `reports/seis-public-demo/`. Those
artifacts include installed AI profile fixtures and blocked route decisions
without validating credentials, storing prompt bodies, calling providers,
routing private Obsidian content, using silent fallback, executing SSH,
mutating GitHub, deploying, or approving live model routing.

`npm run report:seis-second-brain-accessibility-focus-report` writes the
Second Brain accessibility/focus QA artifacts under `reports/seis-public-demo/`.
Those artifacts validate repo-static ARIA/focus markers and browser-smoke
coverage while keeping manual keyboard transcript, screen-reader transcript,
reduced-motion review, and human accessibility approval blocked until review.

`npm run report:seis-second-brain-agent-registry` writes the Second Brain agent
registry artifacts under `reports/seis-public-demo/`. Those artifacts join the
installed AI profiles, supervised AI workforce assignments, bounded sub-agent
roster, Obsidian bridge boundary, plugin inventory, MCP surfaces, and connector
activation rules without reading a private Obsidian vault, validating
credentials, calling providers, enabling autonomous writes, executing SSH,
mutating GitHub, deploying, or approving release.

`npm run report:seis-public-demo-go-no-go` writes PR/release-review artifacts
under `reports/seis-public-demo/`, including the evidence manifest and
`reports/seis-public-demo/pr54-review-packet-latest.md` plus the read-only
`reports/seis-public-demo/worktree-review-latest.md` and
`reports/seis-public-demo/pr54-stage-plan-latest.md`, without changing GitHub,
importing Obsidian, calling providers, executing SSH, staging files, committing,
pushing, or deploying.

## Yeni Nesil AGI Araştırma Hedefi

SEIS AGI hedefi şu an kanıt-gated bir araştırma ve uygulama mimarisi olarak
tutulur. Bu repo gerçek AGI, eğitilmiş 512B ağırlık, benchmark sonucu,
checkpoint veya canlı inference iddiası yapmaz.

Bu hedefin kısa hali:

- **Başlangıç hattı:** `16GB+ RAM` için `20B` yerel-uyumluluk hedefi (planlı, test edilmemiş).
- **Sonraki merdiven:** `70B` araştırma yolu, ardından frontier/long-horizon yolları.
- **Üst hedef:** `150B`, `300B+`, `512B` ve en yüksek (`highest-available`) parametre sınıfı için tek tek uygun güvenlik, bütçe ve onay kanıtları toplandıktan sonra yol haritası açılır.

- **512B Apex Programı:** `content/development/seis-512b-apex-model-program.json` ile internet-araştırmalı, plan-only ve route-blocked tutulur; AGI tanımı `definition-only-not-demonstrated` durumundadır.
- **Alt Ajan Konseyi:** Tüm kurulu AI/sub-agent rolleri 512B için ayrı görev matrisine sahiptir, ama yalnızca planlama, inceleme ve doğrulama görevleri alır.
- **Güvenli AI Core:** Local Demo varsayılandır; provider key, cloud/GPU, SSH, benchmark ve training insan onayı olmadan kapalıdır.
- **AGI Kanıt Kuralı:** Gerçek AGI iddiası için bağımsız evaluation, safety review, training logs, checkpoint governance, model card ve explicit approval gerekir.

## Core Scope

| Area        | SEIS covers                                                                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI systems  | AI agents, agent orchestration, MCP, skills, plugins, LLM routing, memory, RAG, model evaluation, AI safety                                                                        |
| Engineering | algorithms, data structures, full stack, frontend, backend, mobile, desktop, game systems, embedded, robotics, compilers, architecture, testing, SRE, DevOps, cloud, cybersecurity |
| Data and ML | data engineering, big data, ML, deep learning, generative AI, NLP, computer vision, knowledge graphs, governance, ethics                                                           |
| Design      | product design, design systems, UX engineering, UI engineering, interaction, motion, branding, typography, accessibility, calm technology                                          |
| Open source | main-centered governance, contribution quality, security reporting, documentation, discoverability, community growth                                                               |

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

| Platform           | Priority languages                                                              |
| ------------------ | ------------------------------------------------------------------------------- |
| Apple first        | Swift, SwiftUI, Objective-C, Metal, AppKit, UIKit, Combine, Core Data, CloudKit |
| Windows            | C#, .NET, C++, Rust, WinUI, TypeScript, Go, Zig, Python when needed             |
| Android            | Kotlin, Java, Jetpack Compose, C++, Rust, TypeScript, Go, Python when needed    |
| Web and AI tooling | TypeScript, HTML, CSS, Go, Rust, Python when needed, JavaScript when needed     |

Unused SDKs, runtimes, and language toolchains are not installed by default.
Local development should stay fast, simple, and reversible. CI may install
specialized tools only when a specific check requires them.

## Source Languages and Ecosystem Stack

SEIS keeps the GitHub language surface honest: real source languages are counted
from real files, while frameworks, SDKs, cloud products, databases, IDEs, design
tools, and productivity systems live in a separate ecosystem stack.

| Surface                    | Canonical record                                                                 | Rule                                                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| GitHub source languages    | [`reports/language-distribution.md`](./reports/language-distribution.md)         | Count real source languages only and track platform-family balance without filler code.                                             |
| Full-stack language matrix | [`reports/fullstack-language-matrix.md`](./reports/fullstack-language-matrix.md) | Route source/config languages by platform layer.                                                                                    |
| SEIS ecosystem stack       | [`reports/seis-technology-stack.md`](./reports/seis-technology-stack.md)         | Show frameworks, tools, clouds, databases, and design systems outside the language bar.                                             |
| SEIS AGI system            | [`reports/seis-agi-system.md`](./reports/seis-agi-system.md)                     | Govern agent systems, memory, planning, research automation, MCP, skills, plugins, token efficiency, and the 90-day release window. |

The long-term GitHub language profile should signal a real multi-platform
ecosystem: Apple/Swift 25-30%, AI/Data/Python/SQL 18-22%,
TypeScript/JavaScript tooling 15-20%, Android/JVM 10-15%, Rust/C/C++ systems
10-15%, Go/Infrastructure 5-8%, Windows/.NET 5-8%, and HTML/CSS previews 0-3%.
Do not add filler code to change percentages.

Run `npm run check:seis-technology-stack` after changing stack categories and
`npm run check:seis-agi-system` after changing agent, memory, planning,
research, MCP, skills, plugin, or token-efficiency policy.

## SEIS Master Prompt

SEIS uses a central operating prompt as its ecosystem governance contract. The
current contract is maintained at
[`docs/governance/seis-master-prompt.md`](./docs/governance/seis-master-prompt.md)
and defines how architecture, security, documentation, AI, cloud, design,
automation, product strategy, validation, and user-work protection should be
handled across the repository.

The long-term ecosystem vision is maintained at
[`docs/governance/seis-supreme-vision.md`](./docs/governance/seis-supreme-vision.md).
It defines SEIS as a human-AI collaborative intelligence ecosystem where the
ecosystem itself is the product.

Operational GitHub controls for this prompt are documented in
[`docs/governance/seis-master-prompt-github-controls.md`](./docs/governance/seis-master-prompt-github-controls.md).

The contract is enforced by a dedicated Master Prompt check and is also covered
by the broader open-source governance check:

```bash
npm run check:seis-master-prompt-report
npm run check:seis-master-prompt
```

The implementation map at
[`data/seis-master-prompt-implementation-map.json`](./data/seis-master-prompt-implementation-map.json)
links the Master Prompt principles to concrete architecture, security,
documentation, AI/agent, cloud/automation, and product/design repository
surfaces.

The acceptance criteria at
[`data/seis-master-prompt-acceptance-criteria.json`](./data/seis-master-prompt-acceptance-criteria.json)
define what evidence is required before Master Prompt alignment can be treated
as complete.

The operational goal tracker at
[`data/seis-operational-goal-tracker.json`](./data/seis-operational-goal-tracker.json)
keeps active SEIS work explicit across goal, priority, status, risks,
validation, and next step fields.

The objective coverage matrix at
[`data/seis-master-objective-coverage.json`](./data/seis-master-objective-coverage.json)
maps the current SEIS Master Prompt objective to concrete evidence, checks,
status, and remaining gaps.

The generated objective coverage report at
[`reports/seis-master-objective-coverage.md`](./reports/seis-master-objective-coverage.md)
makes the same coverage matrix readable for reviews and handoffs.

The decision record at
[`docs/governance/adr-0001-seis-master-prompt-operating-contract.md`](./docs/governance/adr-0001-seis-master-prompt-operating-contract.md)
documents why the Master Prompt is treated as an active repository operating
contract.

The change checklist at
[`docs/governance/seis-master-prompt-change-checklist.md`](./docs/governance/seis-master-prompt-change-checklist.md)
turns the workflow into a reusable review path for architecture, security,
documentation, validation, and handoff.

Use the GitHub issue template at
[`.github/ISSUE_TEMPLATE/master_prompt_governance.md`](./.github/ISSUE_TEMPLATE/master_prompt_governance.md)
to propose Master Prompt governance changes with goal, priority, risk,
validation, and acceptance criteria captured upfront.

The focused GitHub Actions workflow at
[`.github/workflows/seis-master-prompt-governance.yml`](./.github/workflows/seis-master-prompt-governance.yml)
runs the generated report and Master Prompt governance checks on relevant
pull requests and `main` pushes.

The ownership rules at
[`.github/CODEOWNERS`](./.github/CODEOWNERS) keep Master Prompt operating
contract changes reviewable by the maintainer on GitHub.

The SEIS plugin skill at
[`plugins/seis/skills/seis-master-prompt/SKILL.md`](./plugins/seis/skills/seis-master-prompt/SKILL.md)
connects this operating contract to Codex skill/plugin workflows inside the
repository.

The SEIS security review skill at
[`plugins/seis/skills/seis-security-review/SKILL.md`](./plugins/seis/skills/seis-security-review/SKILL.md)
routes secret-safety, least-privilege, SSH/cloud, rollback, GitHub readiness,
and validation-claim review through the SEIS plugin bundle.

The governance status report at
[`reports/seis-master-prompt-governance.md`](./reports/seis-master-prompt-governance.md)
tracks goal, priority, status, risks, validation, and next step for the active
contract.

## AGI System and Three-Month Roadmap

SEIS now tracks its AGI direction as a human-owned, Apple-first assistant
architecture: advanced agents, memory systems, planning systems, research
automation, MCP, skills, plugins, data, design, development, and interactive
read/write workflows are routed through explicit safety gates.

| Surface                      | Canonical record                                                                                                                                                         | Rule                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| AGI system contract          | [`reports/seis-agi-system.md`](./reports/seis-agi-system.md)                                                                                                             | Track the 150-domain capability atlas, plugin/MCP lanes, token efficiency target, and release window.                     |
| Active mission board         | [`reports/seis-active-mission-board.md`](./reports/seis-active-mission-board.md)                                                                                         | Convert the three-month goal into Month 1/2/3 execution lanes with acceptance gates and evidence paths.                   |
| Apple-first Swift contract   | [`packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift`](./packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift) | Keep the implementation path tied to Swift, SwiftUI, Objective-C, Metal, AppKit, UIKit, Combine, Core Data, and CloudKit. |
| Generated implementation doc | [`docs/agi/seis-agi-system.md`](./docs/agi/seis-agi-system.md)                                                                                                           | Explain implementation roots, token efficiency, plugin use, and visual source policy.                                     |

## Architecture Map

| Path                                                             | Purpose                                                                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [`packages/seis-ai`](./packages/seis-ai)                         | AI agent CLI, MCP server, audit tools, prompts, resources, and tests                                                     |
| [`mcp`](./mcp)                                                   | SEIS MCP server entrypoints and integration surface                                                                      |
| [`plugins/seis`](./plugins/seis)                                 | Codex plugin bundle, scripts, and SEIS skill entrypoints                                                                 |
| [`plugins/seis-ai-agent`](./plugins/seis-ai-agent)               | SEIS-Agent unified orchestration across cloud, code, design, data, memory, context, MCP, skills, plugins, and automation |
| [`plugins/seis-cloud`](./plugins/seis-cloud)                     | Dedicated SEIS Cloud deployment, server-target, and cloud-readiness plugin package                                       |
| [`plugins/seis-code`](./plugins/seis-code)                       | Dedicated SEIS-Code engineering plugin package                                                                           |
| [`plugins/seis-design`](./plugins/seis-design)                   | Dedicated SEIS-Design product and design-system plugin package                                                           |
| [`plugins/seis-data`](./plugins/seis-data)                       | Dedicated SEIS-DATA analytics and knowledge-governance plugin package                                                    |
| [`packages/seis_platform_swift`](./packages/seis_platform_swift) | Apple platform policy package                                                                                            |
| [`packages/seis_windows_csharp`](./packages/seis_windows_csharp) | Windows platform policy package                                                                                          |
| [`packages/seis_kernel`](./packages/seis_kernel)                 | Capability, language, plugin, platform, and AGI-system contract builders                                                 |
| [`packages/seis_kernel_go`](./packages/seis_kernel_go)           | Go governance and readiness policy contracts                                                                             |
| [`polyglot`](./polyglot)                                         | Cross-language audit lanes and platform proof-of-concept surfaces                                                        |
| [`apps/web`](./apps/web)                                         | Browser-facing product and documentation surface                                                                         |
| [`apps/android`](./apps/android)                                 | Android direction and validation notes                                                                                   |
| [`apps/macos`](./apps/macos)                                     | macOS direction and Apple-native notes                                                                                   |
| [`docs`](./docs)                                                 | Architecture, governance, deployment, strategy, quality, and research records                                            |
| [`reports`](./reports)                                           | Generated ecosystem, language, capability, and readiness reports                                                         |

## AI-Assisted Development

SEIS is built with human ownership and AI assistance.

- Maintainer: Emirhan Kudun ([@emirhankudun-ux](https://github.com/emirhankudun-ux))
- Primary execution assistant: OpenAI Codex / ChatGPT
- Architecture and review assistant: Claude
- Local workbench: Codex, Antigravity, Antigravity IDE, Cursor, Xcode,
  Ollama, JetBrains IDEs, Air, Gateway, Open Design, and Figma are coordinated
  through [`docs/development/local-ai-workbench.md`](./docs/development/local-ai-workbench.md)
  and the generated desktop/readiness reports.

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
npm run check:seis-active-mission-board
```

No command above installs a new local language runtime. Some checks skip optional
toolchains when they are not present.

GitHub Actions also runs CodeQL code scanning for JavaScript, TypeScript, and
Python on relevant pull requests, `main` pushes, weekly scheduled scans, and
manual dispatches. This keeps security scanning in GitHub without asking local
contributors to install every platform SDK.

## Security & Operations Tooling

`scripts/ultra_ssh_manager.py` is SEIS' server-hardening utility for SSH and
firewall baseline operations. It supports six modes:

- `--mode interactive` (wizard flow, default)
- `--mode harden` (harden existing host; no new user provisioning)
- `--mode full-setup` (adds user/provisioning + hardening)
- `--mode audit` (deep audit report)
- `--mode dashboard` (runtime security dashboard)
- `--mode verify` (non-mutating SSH, firewall, service, and Fail2Ban evidence report)

Use `--dry-run` before any live host change. Dry-run mode does not require root,
does not install packages, does not restart services, and does not write `/etc`;
it writes a JSON execution plan plus a recovery playbook under the manager report
directory. By default, dry-run CLI output uses
`~/.local/state/ultra_ssh_manager`; live runs keep the root-owned `/var/lib` and
`/var/log` defaults.

```bash
python3 scripts/ultra_ssh_manager.py --mode full-setup --port 2222 --user deploy --dry-run --no-audit
```

Design goals for this script:

- mode-specific execution paths are explicit and logged
- command execution is injected so unit tests can safely validate behavior
- dry-run output documents planned commands, file writes, warnings, and recovery
  steps before live execution
- live hardening writes an apply plan and recovery playbook before mutating SSH,
  firewall, kernel, or service state
- SSH config changes are staged as a candidate file and validated with
  `sshd -t -f` before replacing the active config when `sshd` is available
- `--mode verify` writes a verification report without package installs, service
  restarts, account changes, or firewall mutations
- port-knocking and firewall flows are separated and ordered by explicit config
- rescue user path is constrained in SSH policy
- sensitive artifacts (state, credentials, reports, auth helpers) use strict file
  permissions

Local unit tests for the script are maintained under:

- `scripts/tests/test_ultra_ssh_manager.py`

Run them directly with:

```bash
python3 -m unittest scripts.tests.test_ultra_ssh_manager
```

## Contribution Path

Start with:

- [`docs/development/first-run-quickstart.md`](./docs/development/first-run-quickstart.md)
  for clone, first validation, lane selection, and no-bloat setup
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) for contribution rules
- [`docs/deployment/seis-codespaces-cloud-workspace.md`](./docs/deployment/seis-codespaces-cloud-workspace.md) for a cloud-only dev workflow
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) for community expectations
- [`SUPPORT.md`](./SUPPORT.md) for questions, ideas, bugs, features, and safe
  support routing
- [`SECURITY.md`](./SECURITY.md) for private vulnerability reporting
- [`LICENSE`](./LICENSE) for the MIT license
- [`AGENTS.md`](./AGENTS.md) for AI operating instructions inside this repo
- [`CODEX.md`](./CODEX.md) for Codex Cloud, branch, PR, SSH, and quality workflow
- [`CLAUDE.md`](./CLAUDE.md) for Claude Code review and MCP workflow

Good contributions are small, reviewed, reversible, documented, and aligned with
the long-term platform model.

## GitHub Growth Strategy

SEIS should be discoverable, useful, and trustworthy before it tries to be loud.
The GitHub surface should continuously improve through:

- clear README, repository metadata, and topic positioning
- strong issue and PR templates
- structured Discussions for ideas, Q&A, and show-and-tell
- a visible support path that keeps questions, bugs, features, and security
  reports in the right place
- release notes and GitHub Pages links that explain what changed
- accurate contributor attribution
- quality-first examples and demos
- security and governance transparency
- approachable docs for agents, MCP, skills, plugins, and platform lanes

Use issues for actionable bugs and scoped work. Use Discussions for architecture
questions, broad ideas, and examples that need community shaping before they
become work items.

The GitHub adoption model is tracked in
[`docs/governance/github-market-readiness.md`](./docs/governance/github-market-readiness.md).

## Repository Metadata

The public GitHub repository should describe SEIS as an AI-native,
Apple-first, full-stack, design-driven open source ecosystem. Topics should
reflect the real architecture: AI agents, MCP, LLM workflows, Swift, SwiftUI,
TypeScript, Rust, design systems, DevOps, security, and GitHub Pages.

## Current Status

SEIS is actively evolving. Some historical documents still record earlier
private or consolidation phases. The current direction is open source,
main-centered, AI-native, security-conscious, and architecture-led.

## SEIS Brain

SEIS is backed by a markdown-first, Obsidian-compatible second brain.

- `SEIS_SECOND_BRAIN.md` and `SEIS_OBSIDIAN_VAULT.md` define the memory model.
- `seis-brain/vault` stores public-safe memory, links, context packs, and ADRs.
- The second brain helps AI agents and contributors get correct context quickly.

## Obsidian Vault

The vault path is `seis-brain/vault`.

- Open in Obsidian directly.
- No plugins are required.
- Private/local-only material is intentionally not committed.

## Local AI / Ollama

- Local AI is optional.
- Core demo works in no-key mode.
- Ollama can help local summaries and documentation drafting.

## SEIS-SSH

- `SEIS_SSH.md` and `docs/SEIS_SSH_SETUP.md` document the safe remote-development concept.
- Real credentials and live SSH are not included by default.

## Public Readiness

See `docs/PUBLIC_READINESS.md` for the readiness checklist and blockers.
