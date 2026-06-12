# SEIS Platform Language Policy

- Mode: `apple_native_continuation_first_with_windows_polyglot_support`
- Apple language surfaces: AppleScript, Objective-C, Playground, Swift, SwiftUI
- Apple native frameworks: SwiftUI, AppKit, UIKit, Metal, Combine, Core Data, CloudKit, Foundation, PlaygroundSupport, AppleScript
- Windows language surfaces: 41
- Windows excluded surfaces: AppleScript, Objective-C, Playground, Swift, SwiftUI

## Apple Rule

Apple platform work continues through Swift, SwiftUI, Objective-C, Playground, and AppleScript surfaces first.
New SEIS platform implementation should default to Apple-native surfaces before adding compatibility work elsewhere.

## Windows Rule

Windows work is broad polyglot and excludes Apple-only Swift, SwiftUI, Objective-C, Playground, and AppleScript surfaces.

## Windows Required Language Surfaces

- C#
- F#
- Visual Basic
- PowerShell
- Batch
- CMD
- C
- C++
- Rust
- Go
- Python
- Java
- Kotlin
- SQL
- R
- Lua
- Ruby
- PHP

## Windows Extended Language Surfaces

- Awk
- Bicep
- CMake
- COBOL
- Dart
- Dockerfile
- Fortran
- Groovy
- Haskell
- JSON Schema
- JavaScript
- Make
- Nim
- OCaml
- OpenAPI
- Perl
- Scala
- Shell
- Tcl
- Terraform
- TypeScript
- YAML
- Zig
