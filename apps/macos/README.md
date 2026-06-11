# macOS Lane

macOS is the Apple-native SEIS lane.

## Active Direction

- Use Xcode and SwiftPM for Apple platform work.
- Keep Apple implementation languages to Swift, SwiftUI, Playground, Objective-C, and AppleScript.
- Keep website release work behind platform gates.
- Do not use Python or JavaScript as new macOS implementation surfaces in the current phase.
- Do not delete repos, branches, archives, or local files from a UI until verification gates are satisfied.

## Current Contracts

- Swift package: `packages/seis_platform_swift`
- Objective-C bridge: `polyglot/objective-c`
- AppleScript bridge: `polyglot/applescript`
- Swift active toolchain profile: `SeisActiveToolchain.current`

## Validation

```bash
swift test --package-path packages/seis_platform_swift
xcrun clang -fsyntax-only -fobjc-arc -framework Foundation polyglot/objective-c/SEISPlatformBridge.m
osacompile -o /tmp/seis-platform-automation.scpt polyglot/applescript/seis_platform_automation.applescript
```

## Plugin / Tool Stack

- OpenAI Codex
- Claude
- Xcode
- Build macOS Apps when app-level build/debug workflow is required
- GitHub
- SEIS plugin
