# SeisPlatformKit

`SeisPlatformKit` is the active Swift Package for SEIS Apple-first native work.
It provides shared platform policy, Apple continuation models, native shell
contracts, diagnostics metadata, and the current SwiftUI demo shell.

## Products

- `SeisPlatformKit`: shared library for Apple-first models and policy.
- `SeisAppleNativeShell`: SwiftUI executable shell used for native demo and
  local diagnostics work.

## Current Role

This package is the native foundation for:

- macOS Command Center development
- iPadOS and iOS shared model reuse
- public-safe Apple-first readiness metadata
- no-key demo contracts
- SwiftUI-native shell experiments

This package can describe public-safe repository metadata without API keys,
SSH access, provider calls, private vault imports, or first-run repository
scans. This PR does not change browser demo routing or add native launch
bridges into web demo lanes.

## Validation

Run from the repository root:

```bash
swift package describe --package-path packages/seis_platform_swift
swift build --package-path packages/seis_platform_swift
swift test --package-path packages/seis_platform_swift
```

## Xcode Development

Open the Swift package directly in Xcode:

```bash
open packages/seis_platform_swift/Package.swift
```

Use the `SeisAppleNativeShell` scheme for the macOS native demo shell. The
matching command-line Xcode build path is:

```bash
cd packages/seis_platform_swift
xcodebuild -scheme SeisAppleNativeShell -destination 'platform=macOS' -derivedDataPath .xcode-derived-data build
```

If Xcode opens with SeisPlatformKit-Package selected, switch the active scheme to SeisAppleNativeShell before using Run for the native demo shell.

## Local Tool Handoff

The current Apple-native handoff is:

- Xcode 26.6: observed with the recent `seis_platform_swift` package selected.
  Use it for SwiftPM navigation, SwiftUI native shell review, and macOS
  Command Center prototype work. Xcode can write repository files, so Codex
  remains the single writer unless a human explicitly hands off the writer role.

The repository-level run action still stages a local app bundle and launches it
with demo-safe metadata:

```bash
./script/build_and_run.sh --verify
```

The launcher path is demo-safe metadata only. It must not become a live
provider, SSH, deployment, or private-vault bridge without a separate verified
implementation PR.

## Public-Safe Brain And SSH Metadata

The shared library carries a typed public-safe snapshot for:

- SEIS Brain note metadata and context packs
- Obsidian/private-vault exclusion boundaries
- SEIS-SSH demo profile and approval-gated cloud status
- safe validation commands for second-brain and SSH readiness

This is metadata only. It does not import a private vault, open SSH, store
credentials, call providers, train weights, run inference, or claim live cloud
or model readiness.

## Safety

The package must not include real provider API keys, tokens, SSH private keys,
host credentials, or private vault content. Demo status must remain honest:
planned, scaffolded, demo, or implemented.
