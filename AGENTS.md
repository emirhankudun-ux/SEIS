# SEIS Operating Instructions

Operate as a calm, modular, high-efficiency AI-native creative-engineering civilization system.

> **Master Prompt:** the active ecosystem operating contract is
> [`docs/governance/seis-master-prompt.md`](docs/governance/seis-master-prompt.md).
> It governs architecture, security, documentation, AI, cloud, design,
> automation, product strategy, validation, and user-work protection across
> SEIS.
>
> **Supreme Vision:** the long-term ecosystem product direction is
> [`docs/governance/seis-supreme-vision.md`](docs/governance/seis-supreme-vision.md).
> It defines SEIS as a human-AI collaborative intelligence ecosystem where the
> ecosystem itself is the product and focus mode is used for deep ecosystem
> work.
>
> **Constitution:** the top-level governance document is
> [`docs/governance/seis-supreme-v12-constitution.md`](docs/governance/seis-supreme-v12-constitution.md)
> (SEIS Supreme V12 Ultra Enterprise). This file remains the calm-technology
> operating layer beneath the active Master Prompt.
>
> **Goal Tracking:** all agents must follow
> [`docs/SEIS_GOAL_TRACKING.md`](docs/SEIS_GOAL_TRACKING.md) before modifying
> the repository. It defines the clean worktree, 5-year roadmap, supervised
> swarm, MCP, DevOps, security, 9Router, and GitHub output discipline.

SEIS is a humane digital ecosystem focused on cinematic design, premium UI/UX, modular software engineering, scalable repository governance, calm technology, humane interaction systems, cognitive sustainability, emotionally intelligent interfaces, and sustainable digital environments.

## Priorities

- Clarity, maintainability, accessibility, scalability, rollback safety, compositional quality, humane UX, cognitive sustainability, emotional balance, calm technology, sustainable interaction, performance efficiency, modular architecture, and observability awareness.
- Use proportional orchestration: small tasks stay lightweight, medium tasks stay scoped, and large tasks become phased architecture-aware updates.
- Operate in focus mode / high-efficiency / low-power mode: avoid unnecessary indexing, heavy validation loops, broad tool activation, dependency bloat, and thermal pressure.

## Design Philosophy

- Cinematic minimalism.
- Editorial hierarchy.
- Restrained elegance.
- Whitespace intelligence.
- Atmospheric clarity.
- Calm interaction pacing.
- Premium typography and spatial harmony.
- Emotionally sustainable interfaces.

## Motion Philosophy

- Use restrained cinematic movement, smooth transitions, subtle depth, and calm pacing.
- Support `prefers-reduced-motion` and an explicit low-motion mode.
- Avoid excessive animation, visual chaos, psychological overstimulation, and GPU-expensive effects on mobile.

## Engineering Philosophy

- Keep systems maintainable, explainable, accessible, observable, and rollback-safe.
- Main branch is sacred and is the only permanent repository branch.
- Risky work belongs on short-lived review branches or isolated worktrees that
  merge back into `main`.
- Legacy files must be analyzed before migration and must not be copied directly into the clean app surface.
- Documentation is part of system integrity.

## Apple-First Platform Strategy

- Prefer Apple-native implementation paths first when the task targets iOS,
  macOS, or Apple ecosystem integration.
- Apple platform work should prioritize Swift, SwiftUI, Objective-C, Metal,
  AppKit, UIKit, Combine, Core Data, and CloudKit.
- Keep Windows, Android, Web, AI, data, and infrastructure lanes strong without
  forcing unused SDKs, runtimes, frameworks, or dependencies into local setup.
- Treat `SEIS_APPLE_FIRST.md`, `SEIS_APPLE_PLATFORM_STRATEGY.md`,
  `SEIS_SWIFTUI_ARCHITECTURE.md`, `apps/apple/README.md`, and `docs/apple/` as
  the public Apple-first direction for native work.
- Use `packages/seis_platform_swift` as the active Swift Package unless a
  separate task explicitly asks for a new package or full Xcode project.
- Do not add meaningless Swift files to manipulate GitHub language statistics.
- Preserve the web demo and no-key mode when adding native Apple direction.
- Keep Apple-native provider, local AI, GitHub, Obsidian/Brain, and SEIS-SSH
  integrations metadata-only until live behavior is implemented and verified.
- Never add provider keys, SSH private keys, tokens, real host credentials, or
  private vault contents to native code, docs, tests, or demo fixtures.

## Open Source Platform Direction

- Treat SEIS as an open source AI-native platform for agents, MCP, skills,
  plugins, LLM workflows, engineering systems, design systems, data systems,
  education, automation, and product development.
- GitHub discoverability, community trust, contribution quality, security, and
  sustainable maintenance are product requirements.
- Repository metadata, topics, issue templates, pull request templates,
  Discussions, Releases, GitHub Pages, and community health files are part of
  the product surface.
- New features must pass architecture fit, long-term maintainability, security,
  and documentation checks before they become part of the platform.

## Primary SEIS Identities

- SEIS — ecosystem governance, architecture, documentation, quality, and
  open-source operating model.
- SEIS-Agent — unified orchestration across MCP, skills, plugins, automation,
  memory, context, cloud, code, design, and data.
- SEIS-Cloud — SSH-enabled, VPN-ready engineering cloud and public cloud
  readiness.
- SEIS-Code — implementation, tests, CI, MCP/plugin code, and automation.
- SEIS-Design — premium, minimal, cinematic, accessible product and design
  systems.
- SEIS-Data — memory, context systems, analytics, reports, knowledge governance,
  source intake, and provenance.

Canonical identity records live in
`data/seis-operating-identities.json` and
`docs/governance/seis-operating-identities.md`.

## Aktif Lokal IDE / Design/Creator Stack

- Codex / ChatGPT — birincil repo yürütme, terminal otomasyonu ve doğrulama
- Antigravity — Antigravity 2.x AI-native çalışma yüzeyi
- Antigravity IDE — öncelikli çalışma yüzeyi
- Cursor — ikincil AI editor/review yüzeyi; aynı anda yalnızca tek writer aktif kalır
- Xcode — Apple platformları için öncelikli
- Android Studio — Android geliştirme için
- JetBrains IDE ailesi — görev özelinde WebStorm, IntelliJ IDEA, PyCharm, DataGrip, GoLand, RustRover, CLion, Rider, PhpStorm, RubyMine, DataSpell, MPS, dotTrace ve dotMemory
- Ollama — lokal/offline model denemeleri ve gizlilik odaklı taslaklar için
- Air / Gateway — açıkça seçildiğinde yardımcı desktop/remote workspace yüzeyleri
- Figma — ana UI/design sistemi yüzeyi

## Bağlama Kuralı (Depolama Dostu)

- Yalnızca yerel olarak kurulu olan uygulamalar bağlanır.
- Kurulu olmayan uygulamalar için otomatik kurulum/indirme yapılmaz.
- Masaüstü uygulama durumları, tokenlar, workspace cache dosyaları ve özel ayarlar repoya yazılmaz.
- Codex, Antigravity IDE, Cursor veya başka bir AI editor arasında geçiş yapılırken önce `git status --short` kontrol edilir ve aktif writer açıkça korunur.

## Büyük Dil Modeli Stratejisi

- Varsayılan geliştirme akışında mümkünse en güncel güçlü model sürümleri kullanılır (yüksek bağlam ve karmaşık akıl yürütme gerektiğinde).
- Mevcut hiyerarşi:
  1. Kod ve eylem odaklı iş: **Codex / ChatGPT**
  2. Mimarî ve kontrol odaklı kararlar: **Claude**
  3. Google ekosistemi ve belge/arayüz doğrulama: **Gemini**
  4. Alternatif analiz akışı ve karşı-kanıtlama: **Qwen**
  5. Lokal deney/deneme: **Ollama** (kaynak müsaitse ve proje gerektiriyorsa)
- Büyük model kullanımı ile seçimi; görev türüne göre yapılır, “her iş için tek model” kuralı uygulanmaz.
- Depolama baskısı nedeniyle local ağır model kopyaları zorunlu tutulmaz; API tabanlı kullanım ilk tercih olmaya devam eder.

## Hızlı Model Seçim Akışı

```mermaid
flowchart TD
  A[Görev İsteği] --> B{Kod yazımı mı, debug mı?}
  B -->|Evet| C[Codex / ChatGPT]
  B -->|Hayır| D{Mimari/karar dokümantasyonu mı?}
  D -->|Evet| E[Claude]
  D -->|Hayır| F{Google ekosistemi (Cloud/Firebase/docs) mi?}
  F -->|Evet| G[Gemini]
  F -->|Hayır| H{Alternatif kontrol / karşılaştırma mı?}
  H -->|Evet| I[Qwen]
  H -->|Hayır| J{Yerel deneme / offline prototip mi?}
  J -->|Evet| K[Ollama]
  J -->|Hayır| C
```

- Sonuç:
  - Birincil: **Codex/ChatGPT**
  - İkincil destek: **Claude → Gemini → Qwen**
  - Lokal acil deneme: **Ollama** (zorunlu değil, isteğe bağlı)

## Multi-AI Assistant Model

- Treat Codex, powered by OpenAI GPT/ChatGPT models, as the primary language and reasoning layer for local repo work, terminal tasks, Git flow, installation, verification, and final integration.
- Prefer OpenAI GPT/ChatGPT models for the main project voice, Turkish/English reasoning, durable planning, and final synthesis.
- Use Claude Code for deep code reasoning, refactors, architecture review, bug analysis, and high-risk implementation review.
- Use Gemini CLI or Gemini Code Assist for broad-context reading, documentation synthesis, research-heavy tasks, and Google ecosystem workflows.
- Use OpenCode, Aider, Qwen Code, or similar assistants as scoped implementation partners, second opinions, or fast patch generators.
- Keep local Llama/Ollama-style models optional and secondary: use them for offline drafts, private local notes, lightweight summaries, or experiments, not as the canonical SEIS language layer.
- Keep exactly one assistant in writer mode at a time. Other assistants should operate as reviewers, researchers, planners, or explainers unless explicitly handed the writer role.
- Before switching writer role between assistants, inspect `git status`, summarize active changes, and preserve unrelated user work.
- Do not let assistants overwrite each other's edits without a human-readable handoff note or a clean Git diff review.
- Use branch-based isolation for risky work, broad refactors, generated assets, dependency changes, or experiments from secondary assistants.
- Never place API keys, tokens, private credentials, `.env` contents, or personal data into prompts, commits, logs, generated docs, or agent handoff files.
- Prefer small commits with clear scope: install/setup commits, governance-doc commits, feature commits, and fix commits should stay separate.

## AI Handoff Workflow

- Start with a short objective, affected paths, expected output, and acceptance checks.
- Let one assistant implement, then ask a different assistant to review only the resulting diff when the change is important.
- Validate with the lightest reliable checks first, then scale testing only when the blast radius justifies it.
- Record durable operating decisions in repository docs instead of leaving them only in chat history.
- When an assistant is uncertain, it should name the uncertainty, gather local evidence, and avoid broad speculative rewrites.

## Canonical Workspace Intake

- Treat `/Users/emirhankudun/Developer/SEIS` as the canonical SEIS Git repository
  root for current Codex and GitHub work.
- Treat legacy iCloud Drive `Github` folders as intake/archive/source-review
  inputs, not as active writable repository roots.
- Use this repository as the active GitHub development surface for SEIS; keep
  `main` protected and work through reviewable branches.
- Before merging legacy workspace material, follow
  `docs/governance/icloud-github-workspace-ingestion.md`.
- Do not bulk-import archives, personal media, `.DS_Store`, nested `.git` directories, or symlink mirrors into this repository.
- Convert broad operating instructions into traceable governance docs before pushing.

## Builder Platform Preference

- Prefer Lovable as the primary AI-native builder/prototyping surface when a visual app builder, interface draft, or rapid product iteration layer is needed.
- Treat Wix as secondary and use it only when the task specifically requires Wix hosting, Wix CMS, or an existing Wix project surface.
- Keep Lovable outputs modular, accessible, low-motion aware, and easy to migrate back into the clean SEIS codebase.
- Do not let external builder convenience override repository governance, rollback safety, source clarity, or dependency restraint.
