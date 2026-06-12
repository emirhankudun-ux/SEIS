# SEIS Platform Development Tracks

- Mode: `apple_native_continuation_and_windows_polyglot_execution_tracks`
- Tracks: 4
- Apple language count: 5
- Apple native frameworks: SwiftUI, AppKit, UIKit, Metal, Combine, Core Data, CloudKit, Foundation, PlaygroundSupport, AppleScript
- Windows required languages: 18
- Windows extended languages: 23
- Windows language coverage: 41
- Quality gates: 31
- JavaScript policy: `compatibility_only_keep_under_language_budget`

## Platform Boundaries

- Apple only: AppleScript, Objective-C, Playground, Swift, SwiftUI
- Apple frameworks: SwiftUI, AppKit, UIKit, Metal, Combine, Core Data, CloudKit, Foundation, PlaygroundSupport, AppleScript
- Windows excludes: AppleScript, Objective-C, Playground, Swift, SwiftUI

## Track Index

| Track | Platforms | Languages | Validation | Rule |
| --- | --- | --- | --- | --- |
| Apple Native Continuation Track | macos, ios | AppleScript, Objective-C, Playground, Swift, SwiftUI | `swift test --package-path packages/seis_platform_swift`<br>`xcrun swift --version`<br>`xcodebuild -version`<br>`xcrun clang -fsyntax-only -fobjc-arc -framework Foundation polyglot/objective-c/SEISPlatformBridge.m` | Apple platform work continues through Swift, SwiftUI, Objective-C, Playground, and AppleScript surfaces first. |
| Windows Required Polyglot Track | windows | C#, F#, Visual Basic, PowerShell, Batch, CMD, C, C++, Rust, Go, Python, Java, Kotlin, SQL, R, Lua, Ruby, PHP | `dotnet --info`<br>`pwsh --version`<br>`python3 --version`<br>`go version` | Windows work is broad polyglot and must never use Swift, SwiftUI, Objective-C, Playground, or AppleScript surfaces. |
| Windows Extended Polyglot Track | windows | TypeScript, JavaScript, Dart, Scala, Groovy, Haskell, OCaml, Nim, Zig, Fortran, COBOL, Perl, Awk, Tcl, Shell, YAML, JSON Schema, OpenAPI, Terraform, Bicep, Dockerfile, Make, CMake | `npm run check:fullstack-language-matrix`<br>`npm run check:language-distribution`<br>`npm run check:seis-nonjs-kernel` | Extended Windows languages are allowed as needed; JavaScript stays compatibility-only and below the language budget. |
| SEIS Platform Boundary Governance Track | macos, ios, windows | policy-only | `npm run check:seis-platform-language-policy`<br>`npm run check:seis-platform-kernel`<br>`npm run check:seis-nonjs-kernel`<br>`npm run automation:refresh-seis-surface -- --summary` | SEIS stays primary; platform tracks only constrain safe execution boundaries. |

## Required Gates

### Apple Native Continuation Track
- `swift_test`
- `swiftui_playground_surface`
- `objective_c_syntax`
- `applescript_syntax_when_available`
- `xcode_toolchain_verified`
- `metal_rendering_budget`
- `appkit_uikit_surface_review`
- `combine_state_flow_review`
- `coredata_cloudkit_sync_review`
- `accessibility_when_ui`
- `sandbox_permission_review`
- `notarization_awareness`

### Windows Required Polyglot Track
- `no_swift_windows_surface`
- `dotnet_readiness_when_available`
- `powershell_policy`
- `cmd_batch_path_safety`
- `native_cpp_syntax_when_available`
- `jvm_syntax_when_available`
- `offline_fallback`
- `remote_agent_reasoning_only`

### Windows Extended Polyglot Track
- `no_swift_windows_surface`
- `language_budget_kept_under_target`
- `runtime_install_requirement_led`
- `artifact_root_declared`
- `polyglot_matrix_consistent`
- `generated_output_idempotent`

### SEIS Platform Boundary Governance Track
- `apple_native_only_boundary`
- `windows_no_apple_only_boundary`
- `javascript_compatibility_only`
- `explicit_commit_approval`
- `explicit_push_approval`
- `deterministic_refresh`
