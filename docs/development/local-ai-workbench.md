# SEIS Local AI Workbench

SEIS uses the local development apps as a coordinated workbench, not as
competing sources of truth. Git, repository docs, generated reports, and SEIS
governance remain canonical.

## Purpose

This workbench connects Codex, Antigravity, Antigravity IDE, Cursor, Xcode,
Ollama, JetBrains IDEs, Air, Gateway, Open Design, Figma, and supporting tools
to SEIS task routing.

The goal is to make local tools useful without creating editor chaos,
dependency bloat, private app-state commits, or conflicting AI edits.

## Primary Routes

| Surface              | SEIS role                     | Use when                                                                                                        |
| -------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Codex / ChatGPT      | Primary repo execution        | Editing files, terminal automation, validation, Git handoff                                                     |
| Antigravity IDE      | Preferred IDE workspace       | Opening SEIS repos/worktrees for agentic IDE work                                                               |
| Antigravity          | Antigravity 2.x workspace     | AI-native ideation or workspace sessions when explicitly selected                                               |
| Cursor               | Secondary AI editor           | Focused review or manual editor pass after Git state is checked                                                 |
| Xcode                | Apple platform IDE            | Swift, SwiftUI, iOS/macOS builds, signing, simulators                                                           |
| Ollama               | Local model runtime           | Offline/private drafts, local experiments, fallback when useful                                                 |
| JetBrains IDEs       | Task-specific specialist IDEs | WebStorm, IntelliJ IDEA, PyCharm, DataGrip, GoLand, RustRover, CLion, Rider, PhpStorm, RubyMine, DataSpell, MPS |
| dotTrace / dotMemory | Diagnostics                   | Targeted performance or memory investigations                                                                   |
| Air / Gateway        | Experimental/remote workspace | Only when explicitly selected for the task                                                                      |
| Open Design / Figma  | Design surface                | Product/design artifacts, previews, design-system review                                                        |

## Launcher Routes

SEIS exposes the main local surfaces through the repo launcher:

```bash
npm run ai -- list
npm run ai -- antigravity
npm run ai -- antigravity-ide
npm run ai -- cursor
npm run ai -- xcode
npm run ai -- codex
npm run ai -- ollama list
```

`auto` routing can also select these surfaces from intent text, but governance,
security, release, and cross-tool orchestration still route through
`seis-agent`.

## Operating Rules

- Keep exactly one AI/editor surface in writer mode at a time.
- Before switching between Codex, Antigravity IDE, Cursor, or another editor,
  run `git status --short` and preserve unrelated changes.
- Do not commit app caches, workspace state, tokens, credentials, model files,
  private prompts, or local settings.
- Use desktop apps through command/path/workflow boundaries; do not copy
  proprietary bundled app source into SEIS.
- Use Ollama as optional local fallback, not as the canonical SEIS language
  layer.
- Use JetBrains tools only when their specialist capability matches the task.
- Do not install missing tools or large SDKs without explicit confirmation.

## Source Of Truth

The generated records are:

- `content/development/desktop-app-integration.json`
- `reports/desktop-app-integration.md`
- `content/development/toolchain-runtime-readiness.json`
- `reports/toolchain-runtime-readiness.md`
- `reports/local-ai-tool-readiness.json`
- `deploy/cloud-environment.json`

Refresh and verify them with:

```bash
npm run automation:ecosystem-intake
npm run automation:plugin-environment-sources
npm run check:ecosystem-intake
npm run check:plugin-environment-sources
npm run check:cloud-environment
npm run check:ai-stack
```
