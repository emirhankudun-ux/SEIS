# SEIS Apple Workspace

`apps/apple` is the Apple-first coordination surface for SEIS. It does not
create a duplicate Swift package. The active native package already lives at:

```text
packages/seis_platform_swift
```

Use this folder to orient contributors, reviewers, and future PRs around the
Apple-first product model while preserving the existing web demo.

## Current Native Source

- Swift Package: `packages/seis_platform_swift/Package.swift`
- Shared models and platform policy: `packages/seis_platform_swift/Sources/SeisPlatformKit`
- Native shell: `packages/seis_platform_swift/Sources/SeisAppleNativeShell`
- macOS lane notes: `apps/macos/README.md`

## Platform Roles

- macOS: primary native SEIS Command Center
- iPadOS: SEIS Brain, design review, prompt library, creative workspace
- iOS: companion for status, notes, agent reports, GitHub/CI, and Brain search
- Web: public demo, browser showcase, documentation preview, and no-key demo

## Setup

From the repository root:

```bash
swift package describe --package-path packages/seis_platform_swift
swift build --package-path packages/seis_platform_swift
swift test --package-path packages/seis_platform_swift
```

For the current macOS shell run path:

```bash
./script/build_and_run.sh --verify
```

## No-Key Policy

Apple-native SEIS starts from demo metadata. It does not require provider API
keys, real SSH credentials, private Obsidian vault access, or live cloud
connection to build or inspect the foundation.

## Roadmap

1. Keep Apple-first documentation public-safe.
2. Expand `SeisPlatformKit` shared models and tests.
3. Prototype macOS Command Center surfaces with demo data.
4. Add iPadOS SEIS Brain reading/review surfaces.
5. Add iOS companion status and search flows.
6. Add SEIS-SSH metadata panels before any live command execution.
7. Add local AI/Ollama metadata before optional local endpoint checks.
