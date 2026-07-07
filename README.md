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
  `readiness` / `apps` / `refs` / `sources` commands, 65+ core app
  launch targets, a visible SEIS App Library for 219 supplied ZIP modules under
  `apps/web/reference-banks/`. `seis-linux-replica.html?demo=live` is the
  public-demo deep link that auto-enters the browser-local shell and starts the
  live tour without SSH, deployment, provider calls, or host shell access; the
  landing page primary OS CTAs and SEIS OS product page CTA route to this live
  demo path. TR/EN locale persistence uses
  `seis.locale.v1`, and connected SEIS Search, Code, Design, Cloud, Store,
  Website, Music, AI Core, SEIS AI Chat, SEIS Code AI, SEIS AGI Control,
  SEIS SSH Control, Apple Native Shell, and Library surfaces open mini workspaces or
  iframe-backed local app surfaces with browser-local state changes. The
  focused browser smoke check captures desktop, mobile, and deep-link evidence for the live
  demo console, Demo Readiness gates, source coverage, library apps,
  terminal commands, and viewport-safe window sizing. It also validates every populated SEIS App
  Library route and thumbnail path in `apps/web/reference-banks/reference-apps.js`
  from the static web serving root, so missing supplied-module assets fail the
  demo gate instead of silently shipping broken cards. Website Lane and Ubuntu
  Desktop visuals are used as hidden source material; the public UI does not show
  raw source folders. Real AI, AGI, and SSH lanes are separated into
  backend/approval-gated surfaces so the no-key public demo does not fake live
  capability. The Apple Native Shell surface is contained inside the Linux
  Replica as a browser-safe capsule and does not launch host-native apps. The focused review packet
  is maintained at
  [`docs/reviews/SEIS_LINUX_REPLICA_LIVE_DEMO_REVIEW.md`](./docs/reviews/SEIS_LINUX_REPLICA_LIVE_DEMO_REVIEW.md),
  and the public operator walkthrough is maintained at
  [`docs/demos/SEIS_LINUX_REPLICA_PUBLIC_WALKTHROUGH.md`](./docs/demos/SEIS_LINUX_REPLICA_PUBLIC_WALKTHROUGH.md).
  Source lanes are documented as Website / AI Platform and Ubuntu Web Desktop;
  source-focused deep links are `?demo=live&source=website` and
  `?demo=live&source=ubuntu`. The demo uses SEIS placeholder previews when a
  supplied module has no thumbnail. The Apple-native Swift package mirrors this
  route contract through `SeisAppLibraryContract` and `SeisPublicDemoLaneRoute`
  so Xcode surfaces can open the same public-safe Website and Ubuntu lanes
  without exposing raw source folders or faking live AI/AGI/SSH. Focused validation commands:
  `node scripts/check-seis-linux-replica-public-walkthrough.mjs`,
  `node scripts/check-seis-linux-replica-browser-smoke.mjs --static`, and
  `npm run check:seis-reference-banks`.
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
npm run check:seis-brain-context-packs
npm run check:seis-second-brain-readiness-contracts
npm run check:seis-second-brain-browser-smoke
npm run check:seis-public-readiness
npm run check:desktop-os-browser-smoke
npm run check:seis-linux-replica-browser-smoke
npm run check:seis-linux-replica-public-walkthrough
node scripts/check-seis-static-demo-routes.mjs
npm run check:seis-code
npm run check:seis-website-pages
npm run check:seis-ultimate-demo
npm run check:seis-ssh-access-model
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

## SEIS SSH Public Readiness

`SEIS-SSH` is the public-safe SSH/cloud readiness lane for SEIS. The current
contract is:

```text
Keep the same server and port.
Ayni sunucu ve baglanti noktasi korunur.
```

The current source-of-truth contracts are `deploy/seis-ssh-access-model.json`,
`deploy/seis-ssh-cloud-roadmap.json`, and
`deploy/seis-ssh-closed-runtime-contract.json`, with runbooks at
`docs/deployment/seis-ssh-access-model.md`,
`docs/deployment/seis-ssh-cloud-roadmap.md`, and
`docs/deployment/seis-ssh-closed-developer-runtime.md`.

Use these static gates before claiming SSH/cloud readiness is wired:

```bash
npm run check:seis-ssh-access-model
npm run check:seis-ssh-cloud-roadmap
npm run check:seis-ssh-closed-runtime
npm run check:seis-ssh-picker-compatibility
```

This does not execute SSH. Live readiness still requires explicit approval and
strict evidence such as `npm run cloud:ssh:online:strict`.

The static checks do not write SSH config, open a live connection, create
shared credentials, mutate GitHub, or deploy infrastructure. Live online/mobile
claims remain blocked until a strict live probe passes with explicit approval.

`npm run check:seis-second-brain-readiness-contracts` validates the Second Brain readiness contracts for the Obsidian bridge safe import plan,
accessibility/focus QA, provider-neutral read-only model-router boundary, and
PR #54 public demo release checklist without enabling private vault import,
live provider routing, SSH, deployment, merge, or publication.

`npm run check:seis-public-readiness` is the current no-key public-readiness
gate. It validates the environment template, public docs command wiring,
public-readiness docs and status matrix, plus public-safe SEIS Brain context
packs. It is not a public launch, release, Pages publication, deployment, live
AI, live SSH, merge, or approval claim.

The Obsidian safe-import plan, read-only model-router boundary, Second Brain
accessibility/focus QA, and PR #54 public demo checklist are currently
validated together by `npm run check:seis-second-brain-readiness-contracts`.
They remain review-gated contracts, not report-writing commands, private vault
imports, provider calls, SSH actions, GitHub mutations, deployments, or release
approvals.

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

Apple-first native product direction is documented in
[`SEIS_APPLE_FIRST.md`](./SEIS_APPLE_FIRST.md) and
[`SEIS_APPLE_PLATFORM_STRATEGY.md`](./SEIS_APPLE_PLATFORM_STRATEGY.md). The
web demo remains the public no-key showcase, macOS is the primary native Command
Center target, iPadOS is the SEIS Brain and design review surface, and iOS is a
companion for status, notes, agent reports, GitHub/CI, and Brain search.
SwiftUI architecture and public-safe design rules are documented in
[`SEIS_SWIFTUI_ARCHITECTURE.md`](./SEIS_SWIFTUI_ARCHITECTURE.md),
[`SEIS_MAC_APP.md`](./SEIS_MAC_APP.md),
[`SEIS_IOS_IPADOS_APP.md`](./SEIS_IOS_IPADOS_APP.md),
[`SEIS_APPLE_DESIGN_SYSTEM.md`](./SEIS_APPLE_DESIGN_SYSTEM.md), and
[`docs/apple`](./docs/apple). Native Apple coordination lives in
[`apps/apple`](./apps/apple), while the active Swift Package remains
[`packages/seis_platform_swift`](./packages/seis_platform_swift).

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
| [`apps/apple`](./apps/apple)                                     | Apple-first native coordination surface for macOS, iPadOS, iOS, and shared Swift package work                            |
| [`apps/android`](./apps/android)                                 | Android direction and validation notes                                                                                   |
| [`apps/macos`](./apps/macos)                                     | macOS direction and Apple-native notes                                                                                   |
| [`docs/apple`](./docs/apple)                                     | Apple-first strategy, SwiftUI architecture, design, accessibility, and public-readiness records                          |
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

- [`docs/GETTING_STARTED.md`](./docs/GETTING_STARTED.md) for the public
  onboarding path, no-key demo boundary, and lane picker
- [`docs/development/first-run-quickstart.md`](./docs/development/first-run-quickstart.md)
  for clone, first validation, lane selection, and no-bloat setup
- [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) for common local
  blockers, auth-gated assistant states, and safe failure handling
- [`docs/PUBLIC_READINESS.md`](./docs/PUBLIC_READINESS.md) for the public
  GitHub readiness checklist across web demo, Apple, Brain, AI, and SEIS-SSH
- [`docs/governance/public-readiness-status.md`](./docs/governance/public-readiness-status.md)
  and [`content/development/seis-public-readiness-status.json`](./content/development/seis-public-readiness-status.json)
  for the current machine-readable public-readiness review matrix
- [`docs/OBSIDIAN_SECOND_BRAIN.md`](./docs/OBSIDIAN_SECOND_BRAIN.md) for the
  public-safe Obsidian-compatible Second Brain setup boundary
- [`docs/LOCAL_AI_SETUP.md`](./docs/LOCAL_AI_SETUP.md) for optional Ollama/local
  AI usage without changing the canonical writer model
- [`docs/SEIS_SSH_SETUP.md`](./docs/SEIS_SSH_SETUP.md) for credential-free
  SEIS-SSH setup boundaries and live-claim gates
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
