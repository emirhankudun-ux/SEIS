# SEIS AGI System Implementation

This document is generated from `packages/seis_kernel/agi_system.py`.

SEIS uses the phrase AGI system as a human-owned, AGI-inspired operating architecture for advanced assistants. It is not a claim that the repository contains autonomous general intelligence.

## Implementation Roots

- `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift`
- `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIMemoryPlanningStore.swift`
- `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIContextCompressionRuntime.swift`
- `scripts/create-seis-agi-system.py`
- `content/development/seis-agi-system.json`
- `reports/seis-agi-system.md`
- `docs/agi/seis-agi-system.md`

## Apple First Implementation Surface

`SeisAGISystemContract` in Swift keeps the Apple-native contract close to Swift, SwiftUI, Objective-C, Metal, AppKit, UIKit, Combine, Core Data, and CloudKit priorities.

## Token Efficiency

The system target is 60% token savings through retrieval, bounded reports, source manifests, and minimum required tool activation.

## Memory Planning Automation

`seis-memory-planning-runtime` runs on Swift + Foundation + Core Data + CloudKit and defines context intake, task decomposition, research evidence, multi-agent handoff, and self-evaluation checkpoints.

## Three Month Release Cycle

The active release window runs from 2026-06-12 to 2026-09-12 with three monthly acceptance-gated milestones.

- 0-30: Foundation, architecture, documentation -> agi-contract-generated, agent-memory-planning-foundation-visible, github-community-health-current, quality-gates-pass
- 31-60: Memory, planning, MCP -> memory-checkpoints-traceable, planning-loops-deterministic, plugin-mcp-lanes-scoped, apple-first-contract-covered
- 61-90: Agents, validation, release -> agent-roles-separated, security-and-human-review-gates-present, github-community-health-ready, release-evidence-current

## Plugin Use Policy

Plugins, MCP servers, and skills are used only when relevant, authenticated, scoped, and safe. Reports must list only actual usage.

## Visual Source Policy

The eight submitted programming visuals are copied under `content/development/seis-agi-reference-assets/` and recorded with basenames, repository paths, dimensions, signals, and hashes.
