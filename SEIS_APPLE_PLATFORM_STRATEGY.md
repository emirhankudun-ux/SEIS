# SEIS Apple Platform Strategy

SEIS is a multi-surface product ecosystem. The web demo stays public and
browser-first, while Apple platforms become the primary native direction.

## Platform Roles

| Surface | Role | Primary Scope | Status |
| --- | --- | --- | --- |
| SEIS Web | Public demo and GitHub showcase | Browser OS, product preview, docs, local no-key demo | Preserved |
| SEIS Mac | Native Command Center | AI Core dashboard, SEIS Brain manager, SEIS-SSH center, GitHub/CI, local AI monitor, agent workforce | Primary native target |
| SEIS iPad | Brain and creative workspace | Obsidian-style knowledge review, prompt library, design review, roadmap and agent reports | Planned shared model |
| SEIS iPhone | Companion | Quick status, notes, PR/CI alerts, agent reports, SEIS Brain search | Planned companion |
| Apple Shared Core | Reusable domain layer | Shared models, demo metadata, design tokens, safety boundaries | Implemented through `packages/seis_platform_swift` |

## Why macOS Leads

macOS is the natural first native target because SEIS is a creative engineering
operating system. Local development, Git, Xcode, terminal workflows, local AI,
Ollama, repository inspection, CI review, and SSH safety are desktop-centered.

## Why iPadOS Matters

iPadOS should become the SEIS Brain and design thinking surface. It is not a
smaller desktop clone. Its best role is reading, annotating, planning, reviewing
context packs, browsing decision records, and evaluating design systems.

## Why iOS Is Companion-First

iOS should stay lightweight: fast status, agent reports, quick notes, CI/GitHub
glance, and SEIS Brain search. It should not force full desktop workflows onto a
phone.

## Shared Core

The shared native foundation lives in
`packages/seis_platform_swift`. It should contain platform policy, Apple-first
product roles, public-safety metadata, demo-only provider and SSH records,
readiness checks, and future shared UI/design-token models.

## Roadmap

| Phase | Focus | Output |
| --- | --- | --- |
| A0 | Apple-first strategy | Platform docs, public-safe rules, README/AGENTS links |
| A1 | SwiftUI foundation | Shared models, design tokens, demo metadata, tests |
| A2 | macOS Command Center | Native sidebar, module grid, inspector, no-key demo state |
| A3 | iPadOS Brain | Note browser, context packs, decision ledger, visibility badges |
| A4 | iOS companion | Quick status, notes, PR/CI, agent reports, search |
| A5 | SEIS-SSH native center | Demo SSH profiles, readiness, rollback, safety checklist |
| A6 | Local AI/Ollama panel | Local model metadata, endpoint health concept, demo prompt tests |
| A7 | Public release readiness | Docs complete, web stable, Swift verified, no secrets |
