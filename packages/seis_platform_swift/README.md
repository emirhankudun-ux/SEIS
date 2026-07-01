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
- SEIS App Library lane metadata for the Website / AI Platform and Ubuntu Web Desktop demo surfaces

This package can describe public-safe repository metadata without API keys,
SSH access, provider calls, private vault imports, or first-run repository
scans. It may open approved local demo file URLs, but it must not turn the
public route into a live provider, SSH, deployment, or host-shell bridge.

## SEIS App Library Contract

`SeisAppLibraryContract` is the shared native record for the public web demo
library. It keeps the supplied Website and Ubuntu source archives as hidden
inputs while presenting the visible system UI as SEIS App surfaces:

- `SEIS App Library` (`LIB`)
- `Website Lane` (`WEB`, `source=website`, 71 modules)
- `Ubuntu Desktop` (`UBU`, `source=ubuntu`, 148 modules)
- `SEIS AI Chat` (`AI`)
- `SEIS Code AI` (`IDE`)
- `SEIS AGI Control` (`AGI`)
- `SEIS SSH Control` (`SSH`)

AI, Code AI, AGI, and SSH are separate surfaces. Their live behavior remains
backend-gated, evidence-gated, and human-approved; the Swift contract records
those gates and keeps the no-key public demo honest.

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

Codex/Xcode run action modes:

```bash
./script/build_and_run.sh --brain-ssh
./script/build_and_run.sh --verify-brain-ssh
./script/build_and_run.sh --ai-scale
./script/build_and_run.sh --verify-ai-scale
./script/build_and_run.sh --app-library
./script/build_and_run.sh --verify-app-library
./script/build_and_run.sh --website-demo-lane
./script/build_and_run.sh --ubuntu-demo-lane
./script/build_and_run.sh --verify-website-demo-lane
./script/build_and_run.sh --verify-ubuntu-demo-lane
```

The Codex environment exposes matching actions named `Run Brain & SSH`,
`Run AI Scale`, and `Run App Library`. Website and Ubuntu launch lanes resolve
to:

```text
apps/web/seis-linux-replica.html?demo=live&source=website
apps/web/seis-linux-replica.html?demo=live&source=ubuntu
```

Native Website and Ubuntu openings must pass through `SeisPublicDemoLaneRoute`
so only no-key public demo lanes resolve to local file URLs.

The native launcher can carry a public-safe repository snapshot into the app
bundle via `--repository-snapshot`. The generated resource name is
`seis-repository-surface-snapshot.json`, and its package check is:

```bash
npm run check:seis-apple-native-snapshot
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
