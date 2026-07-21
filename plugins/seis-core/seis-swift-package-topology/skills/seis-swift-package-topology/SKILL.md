---
name: seis-swift-package-topology
description: Inspect one fixed checked-in SEIS Swift Package manifest and report bounded declared topology without resolving, compiling, running, writing, or using external services.
---

# SEIS Swift Package Topology

Use this public `seis-repo` plugin to inspect only the checked-in
`packages/seis_platform_swift/Package.swift` manifest. It reports declared
relationships, not executable Swift Package Manager behavior.

## Safety boundary

- Reads exactly one fixed manifest below the selected local SEIS repository.
- Refuses arbitrary paths, missing files, non-regular files, symlinks,
  oversized manifests, malformed declarations, and unsupported syntax.
- Returns only derived platform, product, target, dependency, test-target, and
  resource records. It never returns raw manifest text, raw matching fragments,
  absolute paths, or machine-specific paths.
- Never writes files, resolves or describes Swift packages, compiles or runs
  Swift, starts an app, signs an artifact, installs a plugin, calls a provider,
  uses a network, or reads secrets.
- An `attention` state means the bounded static contract could not be fully
  established. It is not proof of a SwiftPM, compiler, test, runtime, device,
  deployment, installation, or release failure.

## Commands

    node scripts/seis-swift-package-topology-mcp-server.mjs --status
    node scripts/seis-swift-package-topology-mcp-server.mjs --audit --path .
    node scripts/seis-swift-package-topology-mcp-server.mjs --evidence

## What it reports

- Declared macOS and iOS platform versions in the supported grammar subset.
- Declared library and executable product-to-target mappings.
- Declared target, executable-target, and test-target kinds.
- Declared non-test and test-target dependency edges.
- Declared executable resource mappings.

## Interpretation

Use the output to understand the checked-in manifest's bounded static shape.
Do not infer package resolution, dependency graph validity, compiler
diagnostics, SwiftPM tests, binary behavior, code signing, independent
installation, provider access, deployment, or public release.

## Goal linkage

This public package is the Wave 4 `SEIS-GOAL-021` capability. It complements,
rather than replaces, `seis-apple-native-readiness`,
`seis-swift-concurrency-audit`, package-adoption, workspace inspection,
technology taxonomy, and source provenance packages.
