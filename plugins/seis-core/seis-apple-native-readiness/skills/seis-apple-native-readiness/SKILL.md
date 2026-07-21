---
name: seis-apple-native-readiness
description: Audit bounded SEIS Apple-native Swift Package, source/test, and strategy evidence without compiling, signing, writing, or calling external services.
---

# SEIS Apple Native Readiness

Use this public `seis-repo` plugin to inspect the checked-in Apple-native
foundation without treating static evidence as a device, build, signing,
deployment, App Store, provider, or release result.

## Safety boundary

- Reads only the declared Swift Package manifest, bounded source/test filenames,
  and Apple platform strategy markers within the selected local repository.
- Never writes files, compiles Swift, starts an app, signs an artifact, installs
  a plugin, calls a provider, uses a network, or reads secrets.
- Refuses audit paths outside the local repository boundary, direct source-area
  symlinks, and source trees that exceed its declared traversal limits.
- A `ready` result means bounded static evidence is coherent; it is not native
  runtime, distribution, or human-approval proof.

## Commands

    node scripts/seis-apple-native-readiness-mcp-server.mjs --status
    node scripts/seis-apple-native-readiness-mcp-server.mjs --audit --path .
    node scripts/seis-apple-native-readiness-mcp-server.mjs --evidence

## What it checks

- `packages/seis_platform_swift/Package.swift` target and platform markers.
- Presence of bounded Swift source areas for `SeisPlatformKit` and
  `SeisAppleNativeShell`.
- Source-area depth, file-count, and readability limits; a reached limit is an
  explicit `attention` result rather than partial-readiness proof.
- Presence of the focused Swift test files.
- Platform-role and anti-symbolic-code markers in `docs/APPLE_PLATFORM_STRATEGY.md`.

## Goal linkage

Use within `SEIS-GOAL-021` Wave 2. This fills the gap between generic workspace
manifest discovery and a jointly checked Apple/Swift Package static-readiness
contract. It does not replace SwiftPM testing, native QA, signing, or release
gates when those become applicable.
