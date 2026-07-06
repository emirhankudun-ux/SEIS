# SEIS Swift Apple Bridge Manifest

## Purpose

This manifest connects the new public-safe development contracts to the existing Swift package without editing Swift source in this slice.

The machine-readable source is `content/development/seis-swift-apple-bridge-manifest.json`.

## Current Swift Baseline

The existing Swift package is `packages/seis_platform_swift`:

- Package: `SeisPlatformKit`.
- Platforms: macOS v13 and iOS v16.
- Library product: `SeisPlatformKit`.
- Executable product: `SeisAppleNativeShell`.
- Test target: `SeisPlatformKitTests`.

This slice does not touch Swift source. It defines the next safe Swift model and SwiftUI shell direction.

## Bridge Inputs

The bridge uses:

- Five-year agency orchestration contract.
- Source provenance intake manifest.
- MCP permission risk matrix.
- Stitch UX screen catalog.
- AGENTS.md.
- Existing Swift package contract.

## Planned Swift Models

The manifest proposes Codable-ready models for:

- Agency orchestration.
- MCP permission risk records.
- Stitch module families.
- Source provenance archives.
- Agent run rounds.
- Apple shell modules.

These models should be implemented only in a later Swift-source PR with tests.

## Planned SwiftUI Panels

The manifest queues these native shell surfaces:

- Agency command center panel.
- Agent swarm ledger panel.
- MCP risk panel.
- Stitch module gallery panel.
- AI Core boundary panel.

Each panel has an accessibility requirement and demo boundary. None of these panels are implemented in this slice.

## Verification

Run:

```bash
node scripts/check-seis-swift-apple-bridge-manifest.mjs
```

Swift checks are required when Swift source, Swift resources, or `Package.swift` changes:

```bash
swift package describe --package-path packages/seis_platform_swift
swift test --package-path packages/seis_platform_swift
```

Do not claim Swift checks were run unless they actually ran.

## Next Handoff

The next Swift PR should add a very small model/test slice first, preferably:

- `SeisMCPPermissionRiskRecord`
- `SeisStitchModuleFamily`
- Fixture-loading tests against the public-safe JSON files

SwiftUI shell panels should wait until model tests pass.
