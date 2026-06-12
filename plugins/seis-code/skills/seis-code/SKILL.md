---
name: seis-code
description: Use SEIS-Code for architecture-aware implementation, refactors, debugging, tests, CI quality gates, MCP/plugin engineering, Apple-first platform packages, repo automation, and code-review fixes in the SEIS ecosystem. Trigger when Codex needs a full engineering plugin lane rather than a generic coding response.
---

# SEIS-Code

## Workflow

1. Inspect repo safety first: `git status --short`, `git branch --show-current`, and `git remote -v`.
2. Read the nearest operating context before editing: `AGENTS.md`, `README.md`, package manifests, scripts, tests, and nearby docs.
3. Map the affected lane: Apple platform, web, backend/API, MCP/plugin, automation, CI, security, docs, or generated reports.
4. Prefer existing scripts, package commands, typed APIs, and local patterns over new frameworks or ad hoc parsing.
5. Make the smallest durable change that improves architecture, maintainability, reliability, or developer experience.
6. Validate with the lightest reliable checks first, then scale only when risk or blast radius requires it.
7. Record durable decisions in repo docs or generated source files when behavior, governance, or public workflow changes.

## Engineering Lanes

- Apple-first: Swift, SwiftUI, AppKit, UIKit, Metal, CloudKit, Core Data, SPM, and Xcode-centered validation.
- Web and product surfaces: TypeScript, JavaScript, React, Next.js, HTML, CSS, PWA, accessibility, and performance.
- Backend and APIs: Node, Python, Go, Rust, SQL, server adapters, MCP servers, CLI workflows, and data contracts.
- SEIS plugin and agent systems: `plugins`, `mcp`, `packages/seis-ai`, skill manifests, and governed helper routing.
- Repository automation: scripts, generated reports, release checks, quality gates, GitHub readiness, and rollback notes.

## Guardrails

- Never discard uncommitted changes or rewrite unrelated files.
- Do not add dependencies unless they clearly reduce real complexity and fit the existing architecture.
- Never expose secrets, tokens, certificates, API keys, provisioning files, or private data.
- Do not claim GitHub, cloud, plugin, or deployment readiness until a real local check verifies it.
- Keep generated files consistent with their source scripts.

## Validation

Prefer commands already exposed by SEIS:

- `npm run seis:check`
- `npm run check:seis-plugin-bundle`
- `npm run check:seis-platform-kernel`
- `npm run check:seis-agi-system`
- package-local tests when a touched package defines them
