---
name: seis-swift-concurrency-audit
description: Review bounded, checked-in SEIS Swift concurrency markers without compiling, running, writing, or calling external services.
---

# SEIS Swift Concurrency Audit

Use this public `seis-repo` plugin to inspect only two fixed checked-in Swift
source roots. It summarizes static concurrency markers without treating them as
compiler diagnostics, runtime verification, or release evidence.

## Safety boundary

- Reads only `SeisPlatformKit` and `SeisAppleNativeShell` Swift source roots in
  the selected local SEIS repository.
- Refuses arbitrary audit paths and symlinks; it enforces file-count, per-file,
  total-byte, depth, and reported-path limits.
- Returns aggregate counts plus capped repository-relative filenames only. It
  never returns raw Swift source, raw matched values, or absolute paths.
- Never writes files, compiles or runs Swift, starts an app, signs an artifact,
  installs a plugin, calls a provider, uses a network, or reads secrets.
- An `attention` state can mean a review signal such as `@unchecked Sendable`;
  it is not proof of a compiler error, data race, failed test, or runtime bug.

## Commands

    node scripts/seis-swift-concurrency-audit-mcp-server.mjs --status
    node scripts/seis-swift-concurrency-audit-mcp-server.mjs --audit --path .
    node scripts/seis-swift-concurrency-audit-mcp-server.mjs --evidence

## What it reports

- `@unchecked Sendable`, `@MainActor`, actor declaration, and `Sendable`
  markers.
- `Task.detached`, `Task { @MainActor }`, `DispatchQueue`, and `await` marker
  counts.
- Fixed-root traversal, symlink, size, depth, file-count, total-byte, and
  exact credential-assignment safety boundaries.
- A redacted machine-path marker count when present in checked-in source; no
  matched value is stored or returned.

## Interpretation

Use the output to prioritize a human code review. Do not infer actor isolation,
Sendable correctness, data-race freedom, compiler success, SwiftPM test pass,
device behavior, signing, deployment, App Store readiness, or public release.

## Goal linkage

This public package is the Wave 3 `SEIS-GOAL-021` capability selected after an
overlap review. It complements, rather than replaces, `seis-apple-native-readiness`,
workspace inspection, technology taxonomy, and source provenance packages.
