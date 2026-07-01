# Apple-First Strategy

SEIS is Apple-first for native product direction and public-safe in GitHub.
The browser demo remains the public showcase; Apple platforms become the native
long-term product path.

## Platform Priority

1. macOS: primary native Command Center.
2. iPadOS: SEIS Brain, design review, prompt library, and planning workspace.
3. iOS: companion status, notes, GitHub/CI, agent reports, and Brain search.
4. Web: no-key public demo and fast preview.

## Implementation Rule

Use Swift and SwiftUI for Apple-native code. Keep native work modular, tested,
and honest about status. Do not create Swift filler files to influence language
statistics.

## Current Repo Mapping

- Web demo: `apps/web`
- Apple coordination: `apps/apple`
- macOS notes: `apps/macos`
- Swift Package: `packages/seis_platform_swift`
- Apple docs: `docs/apple`

## Safety Boundary

Apple-native metadata may describe providers, local AI, GitHub, and SEIS-SSH,
but first PR work remains demo/scaffolded unless implementation and verification
prove live behavior.
