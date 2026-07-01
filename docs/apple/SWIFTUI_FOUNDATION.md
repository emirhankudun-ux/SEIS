# SwiftUI Foundation

SEIS Apple-native work starts with Swift Package Manager and SwiftUI. The
current package is `packages/seis_platform_swift`.

## Package Direction

- Keep shared models in `SeisPlatformKit`.
- Keep native SwiftUI shell surfaces in `SeisAppleNativeShell`.
- Add Xcode projects only when signing, entitlements, or explicit platform app
  targets require them.
- Prefer small tested model additions before broad UI prototypes.

## State Model

Use explicit status values:

- planned
- scaffolded
- demo
- implemented

Never claim live AI, provider routing, SSH, GitHub mutation, or private vault
sync from metadata alone.

## Navigation

The long-term native Command Center should use:

- sidebar navigation
- toolbar search and command palette
- module grid
- inspector panel
- public readiness and no-key demo badges

## Previews and Demo Data

SwiftUI views should be preview-friendly and backed by public-safe demo data.
Demo data must not include secrets, private note content, credentials, tokens,
or real hostnames.
