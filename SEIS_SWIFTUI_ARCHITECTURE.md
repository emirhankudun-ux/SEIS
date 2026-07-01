# SEIS SwiftUI Architecture

SEIS native Apple work uses Swift Package Manager first. A full Xcode project
should be added only when app signing, entitlements, multi-target deployment,
or store-style packaging becomes part of an explicit task.

## Current Native Package

The current native foundation is:

```text
packages/seis_platform_swift/
  Package.swift
  Sources/
    SeisPlatformKit/
    SeisAppleNativeShell/
  Tests/
    SeisPlatformKitTests/
```

`SeisPlatformKit` is the shared model and policy layer. `SeisAppleNativeShell`
is the current native shell surface. `apps/apple` is a coordination folder that
points reviewers to the active package and platform roadmap without creating a
duplicate package.

## Module Boundaries

- `SeisPlatformKit`: shared domain models, platform policy, public readiness,
  demo metadata, safety boundaries, route/readiness decisions.
- `SeisAppleNativeShell`: SwiftUI macOS shell and demo-native surfaces.
- `apps/web`: public browser demo and GitHub showcase.
- `docs/apple`: public-safe Apple platform strategy and design/architecture
  records.

## State Model

Native state should remain small and inspectable:

- immutable demo metadata by default
- explicit `planned`, `scaffolded`, `demo`, or `implemented` status
- no hidden provider calls
- no real SSH execution
- no private vault access from public demo code
- local-only or user-configured endpoints in future work

## SwiftUI Rules

- Use SwiftUI for native UI, with AppKit/UIKit only where platform behavior
  requires it.
- Keep views small, preview-friendly, and backed by demo data.
- Prefer semantic labels and system-compatible icon names.
- Support dark mode, keyboard navigation, VoiceOver labels, clear focus states,
  and reduced motion.
- Avoid fake live status. A demo panel must say demo.

## Demo Data

Demo data belongs in shared models or resource files and must be explicitly
public-safe. Demo provider, local AI, GitHub, and SSH records should describe
metadata and readiness only.

## Secret Policy

Native code must not contain API keys, SSH private keys, host credentials,
tokens, personal vault paths, or provider secrets. Live integrations require a
separate backend/local implementation and explicit verification.
