import Foundation
import Testing
@testable import SeisPlatformKit

@Test func macOSPolicyUsesAppleLanguages() {
    let policy = SeisPlatformPolicy.macOS
    #expect(policy.languages.contains("Swift"))
    #expect(policy.languages.contains("SwiftUI"))
    #expect(policy.languages.contains("Objective-C"))
    #expect(policy.languages.contains("Playground"))
    #expect(policy.languages.contains("AppleScript"))
    #expect(!policy.languages.contains("Python"))
    #expect(policy.frameworks.contains("SwiftUI"))
    #expect(policy.frameworks.contains("AppKit"))
    #expect(policy.frameworks.contains("Metal"))
    #expect(policy.frameworks.contains("Core Data"))
    #expect(policy.frameworks.contains("CloudKit"))
    #expect(policy.isReadyForSEISAgent)
}

@Test func iOSPolicyUsesAppleNativeFrameworks() {
    let policy = SeisPlatformPolicy.iOS
    #expect(policy.languages == ["Swift", "SwiftUI", "Objective-C"])
    #expect(policy.frameworks.contains("UIKit"))
    #expect(policy.frameworks.contains("Metal"))
    #expect(policy.frameworks.contains("Combine"))
    #expect(policy.frameworks.contains("Core Data"))
    #expect(policy.frameworks.contains("CloudKit"))
    #expect(!policy.languages.contains("Kotlin"))
    #expect(policy.isReadyForSEISAgent)
}

@Test func windowsPolicyUsesWindowsLanguages() {
    let policy = SeisPlatformPolicy.windows
    #expect(policy.languages.contains("C#"))
    #expect(policy.languages.contains("F#"))
    #expect(policy.languages.contains("Visual Basic"))
    #expect(policy.languages.contains("PowerShell"))
    #expect(policy.languages.contains("CMD"))
    #expect(policy.languages.contains("C"))
    #expect(policy.languages.contains("C++"))
    #expect(policy.languages.contains("Java"))
    #expect(policy.languages.contains("Kotlin"))
    #expect(!policy.languages.contains("Swift"))
    #expect(policy.languages.count >= 12)
    #expect(policy.isReadyForSEISAgent)
}

@Test func routingFindsBothPlatformFamilies() {
    let result = SeisPlatformPolicy.route(request: "SwiftUI macOS playground and Windows WinUI PowerShell support")
    #expect(result.contains(.macOS))
    #expect(result.contains(.windows))
}

@Test func routingFindsIOSAppleSurface() {
    let result = SeisPlatformPolicy.route(request: "iOS UIKit CloudKit Core Data workflow")
    #expect(result.contains(.iOS))
}

@Test func capabilityLookupReturnsEveryPlatformPolicy() {
    #expect(SeisPlatformPolicy.capability(for: .macOS) == SeisPlatformPolicy.macOS)
    #expect(SeisPlatformPolicy.capability(for: .iOS) == SeisPlatformPolicy.iOS)
    #expect(SeisPlatformPolicy.capability(for: .windows) == SeisPlatformPolicy.windows)
}

@Test func appleContinuationSnapshotMaterializesNativeFrameworkPlan() {
    let snapshot = SeisAppleContinuationSnapshot.current
    #expect(snapshot.platforms == [.macOS, .iOS])
    #expect(snapshot.languages.contains("Swift"))
    #expect(snapshot.languages.contains("SwiftUI"))
    #expect(snapshot.frameworks.contains("AppKit"))
    #expect(snapshot.frameworks.contains("UIKit"))
    #expect(snapshot.frameworks.contains("Metal"))
    #expect(snapshot.frameworks.contains("Combine"))
    #expect(snapshot.frameworks.contains("Core Data"))
    #expect(snapshot.frameworks.contains("CloudKit"))
    #expect(snapshot.qualityGates.contains("appkit_surface_review"))
    #expect(snapshot.qualityGates.contains("uikit_accessibility"))
    #expect(snapshot.focusAreas.contains { $0.framework == "Core Data + CloudKit" })
    #expect(snapshot.isReady)
}

@Test func appleContinuationModelRoutesRequestsIntoAppleSurfaces() {
    let model = SeisAppleContinuationModel()
    model.focus(on: "Build an iOS UIKit CloudKit Core Data surface")
    #expect(model.snapshot.platforms == [.iOS])
    #expect(model.snapshot.frameworks.contains("UIKit"))
    #expect(model.snapshot.frameworks.contains("CloudKit"))
    #expect(!model.snapshot.frameworks.contains("AppKit"))
}

@Test func appleRunHandoffContractDescribesCodexRunSurface() {
    let contract = SeisAppleRunHandoffContract.appleNativeShell
    #expect(contract.productName == "SeisAppleNativeShell")
    #expect(contract.bundleIdentifier == "com.seis.apple-native-shell")
    #expect(contract.bundleDisplayName == "SEIS Apple Native")
    #expect(contract.packageRelativePath == "packages/seis_platform_swift")
    #expect(contract.runScriptRelativePath == "script/build_and_run.sh")
    #expect(contract.codexRunCommand == "./script/build_and_run.sh")
    #expect(contract.supportedModes.contains("--verify"))
    #expect(contract.requiredInfoPlistKeys.contains("NSPrincipalClass"))
}

@Test func appleRunHandoffFilesMatchSwiftContract() throws {
    let contract = SeisAppleRunHandoffContract.appleNativeShell
    let root = repositoryRoot()
    let script = try String(contentsOf: root.appending(path: contract.runScriptRelativePath), encoding: .utf8)
    let environment = try String(contentsOf: root.appending(path: ".codex/environments/environment.toml"), encoding: .utf8)

    for token in contract.expectedScriptTokens {
        #expect(script.contains(token), "missing script token: \(token)")
    }
    for token in contract.expectedEnvironmentTokens {
        #expect(environment.contains(token), "missing environment token: \(token)")
    }
}

@Test func appleShellSettingsContractDefinesNativePreferences() {
    let contract = SeisAppleShellSettingsContract.appleNativeShell
    #expect(contract.defaultLowMotion)
    #expect(contract.defaultPreferredFocus == .appleNative)
    #expect(contract.defaultShowsQualityGates)
    #expect(contract.appStorageKeys == [
        "seis.apple.shell.lowMotion",
        "seis.apple.shell.preferredFocus",
        "seis.apple.shell.showsQualityGates"
    ])
    #expect(SeisAppleShellFocusPreference.macOS.request.contains("AppKit"))
    #expect(SeisAppleShellFocusPreference.iOS.request.contains("UIKit"))
    #expect(contract.focusPreference(for: "ios") == .iOS)
    #expect(contract.focusPreference(for: "unknown") == .appleNative)
    #expect(contract.request(for: "macos").contains("AppKit"))
}

@Test func appleShellSettingsFilesMatchSwiftContract() throws {
    let contract = SeisAppleShellSettingsContract.appleNativeShell
    let root = repositoryRoot()
    let app = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisAppleNativeShell/App/SeisAppleNativeShellApp.swift"),
        encoding: .utf8
    )
    let settings = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/AppleShellSettingsView.swift"),
        encoding: .utf8
    )
    let continuation = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/AppleContinuationWindow.swift"),
        encoding: .utf8
    )

    #expect(app.contains("Settings {"))
    #expect(app.contains("AppleShellSettingsView()"))
    for token in contract.expectedSettingsViewTokens {
        #expect(settings.contains(token), "missing settings token: \(token)")
    }
    for token in contract.expectedContinuationWindowTokens {
        #expect(continuation.contains(token), "missing continuation token: \(token)")
    }
}

@Test func appleShellDiagnosticsContractDescribesNativeReadiness() {
    let diagnostics = SeisAppleShellDiagnosticsContract.appleNativeShell
    #expect(diagnostics.isReady)
    #expect(diagnostics.readyCount == diagnostics.items.count)
    #expect(diagnostics.items.contains { $0.id == "run-handoff" && $0.qualityGate == "offline_fallback" })
    #expect(diagnostics.items.contains { $0.id == "apple-framework-policy" && $0.evidence.contains("CloudKit") })
    #expect(diagnostics.validationCommands.contains("swift test --package-path packages/seis_platform_swift"))
    #expect(diagnostics.validationCommands.contains("./script/build_and_run.sh --verify"))
}

@Test func appleShellRuntimeDiagnosticsTrackRepositorySurfaces() {
    let root = repositoryRoot()
    let requiredPaths = Set(SeisAppleShellRuntimeDiagnostics.requiredSurfaces.map(\.relativePath))
    let runtime = SeisAppleShellRuntimeDiagnostics.make(
        repositoryRoot: root,
        existingRelativePaths: requiredPaths,
        operatingSystemVersion: "macOS-test",
        processName: "SeisAppleNativeShell"
    )

    #expect(runtime.isReady)
    #expect(runtime.readyCount == runtime.probes.count)
    #expect(runtime.probes.contains { $0.id == "run-script" && $0.state == .ready })
    #expect(runtime.probes.contains { $0.id == "telemetry-contract" && $0.qualityGate == "observability" })
    #expect(runtime.accessibilitySummary.contains("SeisAppleNativeShell"))

    let partial = SeisAppleShellRuntimeDiagnostics.make(
        repositoryRoot: root,
        existingRelativePaths: ["packages/seis_platform_swift/Package.swift"]
    )
    #expect(!partial.isReady)
    #expect(partial.probes.first { $0.id == "run-script" }?.state == .watch)
}

@Test func appleShellTelemetryContractDescribesUnifiedLogging() {
    let telemetry = SeisAppleShellTelemetryContract.appleNativeShell
    #expect(telemetry.subsystem == "com.seis.apple-native-shell")
    #expect(telemetry.focusCategory == "Focus")
    #expect(telemetry.diagnosticsCategory == "Diagnostics")
    #expect(telemetry.verificationCommand == "./script/build_and_run.sh --telemetry")
    #expect(telemetry.events.contains(.focusRouteApplied))
    #expect(telemetry.events.contains(.diagnosticsRefreshRequested))
    #expect(telemetry.events.contains(.diagnosticsRefreshed))
    #expect(telemetry.category(for: .focusRouteApplied) == "Focus")
    #expect(telemetry.category(for: .diagnosticsRefreshRequested) == "Diagnostics")
    #expect(telemetry.category(for: .runtimeProbeSnapshot) == "Diagnostics")
}

@Test func appleShellDiagnosticsFilesMatchSwiftContract() throws {
    let diagnostics = SeisAppleShellDiagnosticsContract.appleNativeShell
    let root = repositoryRoot()
    let runtime = SeisAppleShellRuntimeDiagnostics.current(repositoryRoot: root)
    let view = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/AppleShellDiagnosticsView.swift"),
        encoding: .utf8
    )
    let runtimeSource = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAppleShellRuntimeDiagnostics.swift"),
        encoding: .utf8
    )
    let continuation = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/AppleContinuationWindow.swift"),
        encoding: .utf8
    )

    #expect(runtime.isReady)
    #expect(runtimeSource.contains("SeisAppleShellRuntimeDiagnostics"))
    #expect(continuation.contains("AppleShellDiagnosticsView(snapshot: model.snapshot)"))
    for token in diagnostics.expectedDiagnosticsViewTokens {
        #expect(view.contains(token), "missing diagnostics view token: \(token)")
    }
    for token in runtime.expectedRuntimeViewTokens {
        #expect(view.contains(token), "missing runtime diagnostics view token: \(token)")
    }
}

@Test func appleShellTelemetryFilesMatchSwiftContract() throws {
    let telemetry = SeisAppleShellTelemetryContract.appleNativeShell
    let root = repositoryRoot()
    let telemetrySource = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAppleShellTelemetry.swift"),
        encoding: .utf8
    )
    let continuation = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/AppleContinuationWindow.swift"),
        encoding: .utf8
    )
    let diagnostics = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/AppleShellDiagnosticsView.swift"),
        encoding: .utf8
    )

    for token in telemetry.expectedTelemetrySourceTokens {
        #expect(telemetrySource.contains(token), "missing telemetry source token: \(token)")
    }
    for token in telemetry.expectedFocusTelemetryTokens {
        #expect(continuation.contains(token), "missing focus telemetry token: \(token)")
    }
    for token in telemetry.expectedDiagnosticsTelemetryTokens {
        #expect(diagnostics.contains(token), "missing diagnostics telemetry token: \(token)")
    }
}

@Test func developmentTracksKeepAppleAndWindowsBoundaries() {
    let tracks = SeisPlatformPolicy.developmentTracks
    let appleTrack = tracks.first { $0.id == "apple-native-macos-track" }
    let iOSTrack = tracks.first { $0.id == "apple-native-ios-track" }
    let windowsTrack = tracks.first { $0.id == "windows-required-polyglot-track" }

    #expect(appleTrack?.languages == ["Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"])
    #expect(appleTrack?.forbiddenLanguages.contains("AppleScript") == false)
    #expect(appleTrack?.qualityGates.contains("coredata_cloudkit_sync_review") == true)
    #expect(iOSTrack?.languages == ["Swift", "SwiftUI", "Objective-C"])
    #expect(iOSTrack?.qualityGates.contains("uikit_accessibility") == true)
    #expect(windowsTrack?.languages.contains("PowerShell") == true)
    #expect(windowsTrack?.languages.contains("CMD") == true)
    #expect(windowsTrack?.languages.contains("Swift") == false)
    #expect(windowsTrack?.forbiddenLanguages.contains("SwiftUI") == true)
    #expect(windowsTrack?.forbiddenLanguages.contains("AppleScript") == true)
}

private func repositoryRoot() -> URL {
    var url = URL(fileURLWithPath: #filePath)
    for _ in 0..<5 {
        url.deleteLastPathComponent()
    }
    return url
}
