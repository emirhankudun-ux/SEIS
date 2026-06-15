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
    #expect(snapshot.readinessMetrics.count == 3)
    #expect(snapshot.readinessMetrics.allSatisfy { $0.isReady })
    #expect(snapshot.readinessMetrics.first { $0.id == "apple-languages" }?.requiredItems == ["Swift", "SwiftUI", "Objective-C"])
    #expect(snapshot.readinessMetrics.first { $0.id == "apple-frameworks" }?.requiredItems.contains("AppKit") == true)
    #expect(snapshot.readinessMetrics.first { $0.id == "apple-frameworks" }?.requiredItems.contains("UIKit") == true)
    #expect(snapshot.readinessSummary == "3/3 Apple readiness checks ready")
    #expect(snapshot.isReady)
}

@Test func appleContinuationModelRoutesRequestsIntoAppleSurfaces() {
    let model = SeisAppleContinuationModel()
    model.focus(on: "Build an iOS UIKit CloudKit Core Data surface")
    let frameworks = model.snapshot.readinessMetrics.first { $0.id == "apple-frameworks" }

    #expect(model.snapshot.platforms == [.iOS])
    #expect(model.snapshot.frameworks.contains("UIKit"))
    #expect(model.snapshot.frameworks.contains("CloudKit"))
    #expect(!model.snapshot.frameworks.contains("AppKit"))
    #expect(frameworks?.requiredItems.contains("UIKit") == true)
    #expect(frameworks?.requiredItems.contains("AppKit") == false)
    #expect(frameworks?.isReady == true)
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

@Test func appleContinuationViewRendersReadinessMetrics() throws {
    let root = repositoryRoot()
    let source = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAppleContinuationSurface.swift"),
        encoding: .utf8
    )

    for token in SeisAppleContinuationSnapshot.expectedReadinessViewTokens {
        #expect(source.contains(token), "missing readiness view token: \(token)")
    }
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
    for token in contract.expectedSettingsCommandTokens {
        #expect(app.contains(token), "missing settings command token: \(token)")
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

@Test func applePersistenceReadinessContractDescribesCoreDataCloudKit() {
    let persistence = SeisApplePersistenceReadinessContract.coreDataCloudKit

    #expect(persistence.isReady)
    #expect(persistence.readyCount == persistence.checkCount)
    #expect(persistence.appleFrameworkSymbols.contains("NSPersistentContainer"))
    #expect(persistence.appleFrameworkSymbols.contains("NSPersistentCloudKitContainer"))
    #expect(persistence.appleFrameworkSymbols.contains("NSEntityDescription"))
    #expect(persistence.appleFrameworkSymbols.contains("NSFetchRequest"))
    #expect(persistence.appleFrameworkSymbols.contains("CKContainer"))
    #expect(persistence.appleFrameworkSymbols.contains("CKAccountStatus"))
    #expect(persistence.items.contains { $0.id == "persistent-cloudkit-container" && $0.qualityGate == "coredata_cloudkit_sync_review" })
    #expect(persistence.items.contains { $0.id == "cloudkit-record-privacy" && $0.qualityGate == "app_privacy_review" })
    #expect(persistence.items.contains { $0.id == "diagnostics-history-persistence" && $0.symbol == "NSPersistentContainer" })
    #expect(persistence.accountStates.count == 5)
    #expect(persistence.accountStates.contains { $0.accountStatus == "CKAccountStatus.available" && $0.releaseAction.contains("Enable sync") })
    #expect(persistence.accountStates.contains { $0.accountStatus == "CKAccountStatus.noAccount" && $0.qualityGate == "offline_fallback" })
    #expect(persistence.accountStates.contains { $0.accountStatus == "CKAccountStatus.restricted" && $0.qualityGate == "permission_scope" })
    #expect(persistence.accountStates.contains { $0.accountStatus == "CKAccountStatus.temporarilyUnavailable" && $0.qualityGate == "coredata_cloudkit_sync_review" })
    #expect(persistence.migrationGates.count == 5)
    #expect(persistence.migrationGates.contains { $0.id == "lightweight-migration" && $0.coreDataSurface == "NSMigratePersistentStoresAutomaticallyOption" })
    #expect(persistence.migrationGates.contains { $0.id == "store-description-options" && $0.coreDataSurface == "NSPersistentStoreDescription" })
    #expect(persistence.migrationGates.contains { $0.id == "migration-fixture-test" && $0.qualityGate == "swift_test" })
    #expect(persistence.validationCommands.contains("swift test --package-path packages/seis_platform_swift"))
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
    #expect(runtime.probes.contains { $0.id == "agi-operating-system-contract" && $0.qualityGate == "agent_governance" })
    #expect(runtime.probes.contains { $0.id == "agi-memory-planning-store" && $0.qualityGate == "coredata_cloudkit_sync_review" })
    #expect(runtime.probes.contains { $0.id == "agi-context-compression-runtime" && $0.qualityGate == "token-savings-target" })
    #expect(runtime.probes.contains { $0.id == "agi-agent-orchestration-runtime" && $0.qualityGate == "agent_governance" })
    #expect(runtime.probes.contains { $0.id == "agi-research-automation-runtime" && $0.qualityGate == "primary_source_first" })
    #expect(runtime.probes.contains { $0.id == "agi-agent-handoff-store" && $0.qualityGate == "coredata_cloudkit_sync_review" })
    #expect(runtime.probes.contains { $0.id == "specialist-plugin-readiness" && $0.qualityGate == "plugin_governance" })
    #expect(runtime.probes.contains { $0.id == "specialist-plugin-manifest" && $0.qualityGate == "plugin_governance" })
    #expect(runtime.probes.contains { $0.id == "specialist-plugin-check" && $0.qualityGate == "mcp_smoke_test" })
    #expect(runtime.probes.contains { $0.id == "specialist-code-plugin" && $0.qualityGate == "plugin_governance" })
    #expect(runtime.probes.contains { $0.id == "specialist-design-plugin" && $0.qualityGate == "plugin_governance" })
    #expect(runtime.probes.contains { $0.id == "specialist-data-plugin" && $0.qualityGate == "plugin_governance" })
    #expect(runtime.probes.contains { $0.id == "run-script" && $0.state == .ready })
    #expect(runtime.probes.contains { $0.id == "telemetry-contract" && $0.qualityGate == "observability" })
    #expect(runtime.probes.contains { $0.id == "persistence-readiness" && $0.qualityGate == "coredata_cloudkit_sync_review" })
    #expect(runtime.probes.contains { $0.id == "diagnostics-history" && $0.qualityGate == "observability" })
    #expect(runtime.probes.contains { $0.id == "diagnostics-persistent-store" && $0.qualityGate == "coredata_cloudkit_sync_review" })
    #expect(runtime.accessibilitySummary.contains("SeisAppleNativeShell"))

    let partial = SeisAppleShellRuntimeDiagnostics.make(
        repositoryRoot: root,
        existingRelativePaths: ["packages/seis_platform_swift/Package.swift"]
    )
    #expect(!partial.isReady)
    #expect(partial.probes.first { $0.id == "run-script" }?.state == .watch)
}

@Test func appleShellDiagnosticsHistoryRecordsReadinessSnapshots() throws {
    let diagnostics = SeisAppleShellDiagnosticsContract.appleNativeShell
    let persistence = SeisApplePersistenceReadinessContract.coreDataCloudKit
    let continuation = SeisAppleContinuationSnapshot.current
    let runtime = SeisAppleShellRuntimeDiagnostics.make(
        repositoryRoot: repositoryRoot(),
        existingRelativePaths: Set(SeisAppleShellRuntimeDiagnostics.requiredSurfaces.map(\.relativePath)),
        operatingSystemVersion: "macOS-test",
        processName: "SeisAppleNativeShell"
    )
    let researchAutomation = SeisAGIResearchAutomationPlan.current(recordedAt: "2026-06-12T00:00:00Z")
    let specialistPlugins = try specialistPluginFixtureReadiness(from: .current)
    let agentHandoff = SeisAGIAgentHandoffSnapshot.current(recordedAt: "2026-06-12T00:00:00Z")
    let store = SeisAppleShellDiagnosticsHistoryStore(historyLimit: 2)

    let first = store.record(
        source: "appear",
        continuation: continuation,
        diagnostics: diagnostics,
        persistence: persistence,
        runtime: runtime,
        researchAutomation: researchAutomation,
        specialistPlugins: specialistPlugins,
        agentHandoff: agentHandoff,
        recordedAt: Date(timeIntervalSince1970: 0)
    )
    let second = store.record(
        source: "manual",
        continuation: continuation,
        diagnostics: diagnostics,
        persistence: persistence,
        runtime: runtime,
        researchAutomation: researchAutomation,
        specialistPlugins: specialistPlugins,
        agentHandoff: agentHandoff,
        recordedAt: Date(timeIntervalSince1970: 1)
    )
    let third = store.record(
        source: "command",
        continuation: continuation,
        diagnostics: diagnostics,
        persistence: persistence,
        runtime: runtime,
        researchAutomation: researchAutomation,
        specialistPlugins: specialistPlugins,
        agentHandoff: agentHandoff,
        recordedAt: Date(timeIntervalSince1970: 2)
    )

    #expect(first.statusLabel == "\(first.readyCount)/\(first.checkCount) ready")
    #expect(store.snapshots == [third, second])
    #expect(store.latest == third)
    #expect(third.isReady)
    #expect(third.qualityGateCount == continuation.qualityGates.count)
    #expect(third.runtimeStatusLabel.contains("runtime"))
    #expect(third.persistenceStatusLabel.contains("persistence"))
    #expect(third.agentHandoffReadyCount == 1)
    #expect(third.agentHandoffCheckCount == 1)
    #expect(third.agentHandoffWriterCount == 1)
    #expect(third.agentHandoffStatusLabel.contains("handoffs traceable"))
    #expect(third.agentHandoffStatusSummary.contains("handoff"))
    #expect(third.researchAutomationReadyCount == 1)
    #expect(third.researchAutomationCheckCount == 1)
    #expect(third.researchSelectedSourceCount == researchAutomation.selectedSourceCount)
    #expect(third.researchDeferredSourceCount == researchAutomation.deferredSourceCount)
    #expect(third.researchFreshnessCheckCount == researchAutomation.freshnessCheckCount)
    #expect(third.researchAutomationStatusLabel == researchAutomation.statusLabel)
    #expect(third.researchAutomationStatusSummary.contains("research"))
    #expect(third.specialistPluginReadyCount == specialistPlugins.readyCount)
    #expect(third.specialistPluginCheckCount == specialistPlugins.checkCount)
    #expect(third.specialistPluginLaneCount == specialistPlugins.lanes.count)
    #expect(third.specialistPluginToolCount == specialistPlugins.toolCount)
    #expect(third.specialistPluginStatusLabel == specialistPlugins.statusLabel)
    #expect(third.specialistPluginStatusSummary.contains("specialist plugins"))
}

#if canImport(CoreData)
@Test func appleDiagnosticsPersistentHistoryStoreRoundTripsSnapshots() throws {
    let diagnostics = SeisAppleShellDiagnosticsContract.appleNativeShell
    let persistence = SeisApplePersistenceReadinessContract.coreDataCloudKit
    let continuation = SeisAppleContinuationSnapshot.current
    let runtime = SeisAppleShellRuntimeDiagnostics.make(
        repositoryRoot: repositoryRoot(),
        existingRelativePaths: Set(SeisAppleShellRuntimeDiagnostics.requiredSurfaces.map(\.relativePath)),
        operatingSystemVersion: "macOS-test",
        processName: "SeisAppleNativeShell"
    )
    let researchAutomation = SeisAGIResearchAutomationPlan.current(recordedAt: "2026-06-12T00:00:00Z")
    let specialistPlugins = try specialistPluginFixtureReadiness(from: .current)
    let agentHandoff = SeisAGIAgentHandoffSnapshot.current(recordedAt: "2026-06-12T00:00:00Z")
    let persistentStore = try SeisAppleDiagnosticsPersistentHistoryStore(inMemory: true)
    let store = SeisAppleShellDiagnosticsHistoryStore(
        historyLimit: 3,
        persistentStore: persistentStore
    )

    let snapshot = store.record(
        source: "persistent-test",
        continuation: continuation,
        diagnostics: diagnostics,
        persistence: persistence,
        runtime: runtime,
        researchAutomation: researchAutomation,
        specialistPlugins: specialistPlugins,
        agentHandoff: agentHandoff,
        recordedAt: Date(timeIntervalSince1970: 3)
    )
    let hydratedStore = SeisAppleShellDiagnosticsHistoryStore(
        historyLimit: 3,
        persistentStore: persistentStore
    )

    #expect(try persistentStore.fetch(limit: 1) == [snapshot])
    #expect(hydratedStore.latest == snapshot)
    #expect(snapshot.persistenceReadyCount == persistence.readyCount)
    #expect(snapshot.runtimeReadyCount == runtime.readyCount)
    #expect(snapshot.agentHandoffStatusLabel == agentHandoff.statusLabel)
    #expect(snapshot.agentHandoffWriterCount == agentHandoff.writerCount)
    #expect(snapshot.researchAutomationStatusLabel == researchAutomation.statusLabel)
    #expect(snapshot.researchSelectedSourceCount == researchAutomation.selectedSourceCount)
    #expect(snapshot.specialistPluginStatusLabel == specialistPlugins.statusLabel)
    #expect(snapshot.specialistPluginLaneCount == specialistPlugins.lanes.count)
    #expect(snapshot.specialistPluginToolCount == specialistPlugins.toolCount)
}
#endif

@Test func appleShellTelemetryContractDescribesUnifiedLogging() {
    let telemetry = SeisAppleShellTelemetryContract.appleNativeShell
    #expect(telemetry.subsystem == "com.seis.apple-native-shell")
    #expect(telemetry.focusCategory == "Focus")
    #expect(telemetry.diagnosticsCategory == "Diagnostics")
    #expect(telemetry.verificationCommand == "./script/build_and_run.sh --telemetry")
    #expect(telemetry.events.contains(.focusRouteApplied))
    #expect(telemetry.events.contains(.diagnosticsRefreshRequested))
    #expect(telemetry.events.contains(.diagnosticsRefreshed))
    #expect(telemetry.events.contains(.persistenceReadinessSnapshot))
    #expect(telemetry.events.contains(.agentHandoffSnapshot))
    #expect(telemetry.events.contains(.researchAutomationSnapshot))
    #expect(telemetry.events.contains(.specialistPluginSnapshot))
    #expect(telemetry.category(for: .focusRouteApplied) == "Focus")
    #expect(telemetry.category(for: .diagnosticsRefreshRequested) == "Diagnostics")
    #expect(telemetry.category(for: .runtimeProbeSnapshot) == "Diagnostics")
    #expect(telemetry.category(for: .persistenceReadinessSnapshot) == "Diagnostics")
    #expect(telemetry.category(for: .agentHandoffSnapshot) == "Diagnostics")
    #expect(telemetry.category(for: .researchAutomationSnapshot) == "Diagnostics")
    #expect(telemetry.category(for: .specialistPluginSnapshot) == "Diagnostics")
}

@Test func specialistPluginLaneReadinessDocumentsCodexPluginMesh() throws {
    let readiness = SeisSpecialistPluginLaneReadiness.current
    let fixtureReadiness = try specialistPluginFixtureReadiness(from: readiness)
    let laneIds = Set(readiness.lanes.map(\.id))
    let root = repositoryRoot()
    let source = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisSpecialistPluginLaneReadiness.swift"),
        encoding: .utf8
    )
    let manifest = try String(
        contentsOf: root.appending(path: "data/seis-specialist-plugins-2026-06-12.json"),
        encoding: .utf8
    )

    #expect(readiness.lanes.count == 4)
    #expect(readiness.toolCount == 11)
    #expect(readiness.centralMcpTools == SeisSpecialistPluginLaneReadiness.expectedCentralMcpTools)
    #expect(readiness.marketplacePath.contains(FileManager.default.homeDirectoryForCurrentUser.path))
    #expect(readiness.marketplaceName == "seis-repo")
    #expect(laneIds == ["seis-cloud", "seis-code", "seis-design", "seis-data"])
    #expect(readiness.lanes.allSatisfy { $0.localRoot.contains("/Github/SEIS/plugins/") })
    #expect(readiness.lanes.allSatisfy { $0.installedCacheRoot.contains(".codex/plugins/cache/seis-repo/seis-ai-agent") })
    #expect(readiness.lanes.contains { $0.id == "seis-cloud" && $0.tools.contains("seis_cloud_plan") })
    #expect(readiness.lanes.contains { $0.id == "seis-code" && $0.tools.contains("seis_code_plan") })
    #expect(readiness.lanes.contains { $0.id == "seis-design" && $0.qualityCommands.contains("npm run check:mobile-ergonomics") })
    #expect(readiness.lanes.contains { $0.id == "seis-data" && $0.qualityCommands.contains("npm run check:seis-technology-stack") })
    #expect(fixtureReadiness.isReady)
    #expect(fixtureReadiness.readyCount == fixtureReadiness.checkCount)
    #expect(readiness.validationCommands.contains("npm run check:seis-specialist-plugins"))
    for token in SeisSpecialistPluginLaneReadiness.expectedSourceTokens {
        #expect(source.contains(token), "missing specialist plugin source token: \(token)")
    }
    #expect(!source.contains("/Users/emirhankudun"))
    for token in [
        "\"seis-cloud\"",
        "\"seis-code\"",
        "\"seis-design\"",
        "\"seis-data\""
    ] + SeisSpecialistPluginLaneReadiness.expectedCentralMcpTools.map({ "\"\($0)\"" }) {
        #expect(manifest.contains(token), "missing specialist plugin manifest token: \(token)")
    }
}

private func specialistPluginFixtureReadiness(
    from readiness: SeisSpecialistPluginLaneReadiness
) throws -> SeisSpecialistPluginLaneReadiness {
    let root = repositoryRoot()
    let marketplacePath = try writeSpecialistMarketplaceFixture(from: readiness)
    return SeisSpecialistPluginLaneReadiness(
        marketplacePath: marketplacePath,
        marketplaceName: readiness.marketplaceName,
        installationPolicy: readiness.installationPolicy,
        authenticationPolicy: readiness.authenticationPolicy,
        centralMcpTools: readiness.centralMcpTools,
        centralMcpServerPath: root.appending(path: "mcp/seis-mcp-server.mjs").path,
        lanes: readiness.lanes.map { lane in
            let repoMirrorPath = root.appending(path: lane.repoMirror).path
            return SeisSpecialistPluginLane(
                id: lane.id,
                displayName: lane.displayName,
                category: lane.category,
                repoMirror: lane.repoMirror,
                localRoot: repoMirrorPath,
                installedCacheRoot: repoMirrorPath,
                skillPath: lane.skillPath,
                mcpServer: lane.mcpServer,
                tools: lane.tools,
                laneProfilePath: lane.laneProfilePath,
                qualityCommands: lane.qualityCommands
            )
        },
        validationCommands: readiness.validationCommands
    )
}

private func writeSpecialistMarketplaceFixture(
    from readiness: SeisSpecialistPluginLaneReadiness
) throws -> String {
    let fixtureDirectory = FileManager.default.temporaryDirectory
        .appending(path: "seis-specialist-plugin-readiness-\(UUID().uuidString)")
    try FileManager.default.createDirectory(at: fixtureDirectory, withIntermediateDirectories: true)
    let marketplacePath = fixtureDirectory.appending(path: "marketplace.json")
    let marketplace = """
    {
      "name": "\(readiness.marketplaceName)",
      "plugins": [
        {
          "name": "seis-ai-agent",
          "source": {
            "source": "local",
            "path": "./plugins/seis-ai-agent"
          },
          "policy": {
            "installation": "\(readiness.installationPolicy)",
            "authentication": "\(readiness.authenticationPolicy)"
          },
          "category": "Developer"
        }
      ]
    }
    """
    try marketplace.write(to: marketplacePath, atomically: true, encoding: .utf8)
    return marketplacePath.path
}

@Test func appleShellDiagnosticsFilesMatchSwiftContract() throws {
    let diagnostics = SeisAppleShellDiagnosticsContract.appleNativeShell
    let persistence = SeisApplePersistenceReadinessContract.coreDataCloudKit
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
    let historySource = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAppleShellDiagnosticsHistory.swift"),
        encoding: .utf8
    )
    let persistentStoreSource = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAppleDiagnosticsPersistentHistoryStore.swift"),
        encoding: .utf8
    )
    let specialistPluginSource = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisSpecialistPluginLaneReadiness.swift"),
        encoding: .utf8
    )
    let persistenceSource = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisApplePersistenceReadinessContract.swift"),
        encoding: .utf8
    )
    let agentHandoffSource = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIAgentHandoffStore.swift"),
        encoding: .utf8
    )
    let researchSource = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIResearchAutomationRuntime.swift"),
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
    for token in persistence.expectedSourceTokens {
        #expect(persistenceSource.contains(token), "missing persistence source token: \(token)")
    }
    for token in persistence.expectedDiagnosticsViewTokens {
        #expect(view.contains(token), "missing persistence diagnostics view token: \(token)")
    }
    for token in SeisAppleShellDiagnosticsHistorySnapshot.expectedSourceTokens {
        #expect(historySource.contains(token), "missing diagnostics history source token: \(token)")
    }
    for token in SeisAppleShellDiagnosticsHistorySnapshot.expectedDiagnosticsViewTokens {
        #expect(view.contains(token), "missing diagnostics history view token: \(token)")
    }
    for token in SeisAGIAgentHandoffSnapshot.expectedSourceTokens {
        #expect(agentHandoffSource.contains(token), "missing agent handoff source token: \(token)")
    }
    for token in SeisAGIAgentHandoffSnapshot.expectedDiagnosticsViewTokens {
        #expect(view.contains(token), "missing agent handoff diagnostics view token: \(token)")
    }
    for token in SeisAGIResearchAutomationPlan.expectedDiagnosticsViewTokens {
        #expect(view.contains(token), "missing research automation diagnostics view token: \(token)")
    }
    for token in SeisSpecialistPluginLaneReadiness.expectedSourceTokens {
        #expect(specialistPluginSource.contains(token), "missing specialist plugin source token: \(token)")
    }
    for token in SeisSpecialistPluginLaneReadiness.expectedDiagnosticsViewTokens {
        #expect(view.contains(token), "missing specialist plugin diagnostics view token: \(token)")
    }
    #expect(researchSource.contains("current("))
    #expect(researchSource.contains("redactionStatusLabel"))
    #if canImport(CoreData)
    for token in SeisAppleDiagnosticsPersistentHistoryStore.expectedSourceTokens {
        #expect(persistentStoreSource.contains(token), "missing persistent history source token: \(token)")
    }
    for token in SeisAGIAgentHandoffPersistentStore.expectedSourceTokens {
        #expect(agentHandoffSource.contains(token), "missing persistent agent handoff source token: \(token)")
    }
    #endif
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
    let app = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisAppleNativeShell/App/SeisAppleNativeShellApp.swift"),
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
    for token in telemetry.expectedCommandTelemetryTokens {
        #expect(app.contains(token), "missing command telemetry token: \(token)")
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

@Test func agiSystemContractKeepsAppleFirstBudgetAndTokenEfficiency() {
    let contract = SeisAGISystemContract.master

    #expect(contract.id == "seis-agi-system")
    #expect(contract.isReadyForImplementation)
    #expect(contract.budget.javascriptTargetPercent == 21.0)
    #expect(contract.budget.tokenSavingsTargetPercent == 60)
    #expect(contract.budget.targetReleaseDate == "2026-09-12")
    #expect(contract.budget.appleLanguages.contains("Swift"))
    #expect(contract.budget.appleLanguages.contains("SwiftUI"))
    #expect(contract.budget.appleLanguages.contains("Objective-C"))
    #expect(contract.budget.appleLanguages.contains("Metal"))
    #expect(contract.budget.appleLanguages.contains("AppKit"))
    #expect(contract.budget.appleLanguages.contains("UIKit"))
    #expect(contract.budget.appleLanguages.contains("Combine"))
    #expect(contract.budget.appleLanguages.contains("Core Data"))
    #expect(contract.budget.appleLanguages.contains("CloudKit"))
    #expect(contract.memoryPlanning.isReady)
    #expect(contract.memoryPlanning.ownerRuntime.contains("Core Data"))
    #expect(contract.memoryPlanning.ownerRuntime.contains("CloudKit"))
    #expect(contract.memoryPlanning.storagePolicy.contains("never persist secrets"))
    #expect(contract.releaseMilestones.count == 3)
    #expect(contract.releaseMilestones.allSatisfy { $0.isTraceable })
    #expect(contract.releaseMilestones.first?.id == "month-01-foundation-architecture-docs")
    #expect(contract.releaseMilestones.contains { $0.id == "month-02-memory-planning-mcp" && $0.focusAreas.contains("mcp-skills") })
    #expect(contract.releaseMilestones.contains { $0.id == "month-03-agents-validation-release" && $0.acceptanceGates.contains("release-evidence-current") })
}

@Test func agiSystemContractDocumentsAgentMemoryPlanningResearchAndPluginLanes() {
    let contract = SeisAGISystemContract.master
    let subsystemIds = Set(contract.subsystems.map(\.id))
    let pluginLaneIds = Set(contract.pluginLanes.map(\.id))
    let checkpointIds = Set(contract.memoryPlanning.checkpoints.map(\.id))
    let loopIds = Set(contract.memoryPlanning.loops.map(\.id))
    let milestoneIds = Set(contract.releaseMilestones.map(\.id))

    #expect(subsystemIds.contains("agent-orchestration"))
    #expect(subsystemIds.contains("memory-architecture"))
    #expect(subsystemIds.contains("planning-and-execution"))
    #expect(subsystemIds.contains("research-automation"))
    #expect(subsystemIds.contains("multi-agent-coordination"))
    #expect(subsystemIds.contains("plugin-mcp-skills"))
    #expect(subsystemIds.contains("token-efficiency"))
    #expect(pluginLaneIds.contains("development-read-write"))
    #expect(pluginLaneIds.contains("data-read-write"))
    #expect(pluginLaneIds.contains("design-interactive"))
    #expect(checkpointIds.contains("context-intake"))
    #expect(checkpointIds.contains("task-decomposition"))
    #expect(checkpointIds.contains("research-evidence"))
    #expect(checkpointIds.contains("multi-agent-handoff"))
    #expect(checkpointIds.contains("self-evaluation"))
    #expect(loopIds.contains("retrieve-compress-plan"))
    #expect(loopIds.contains("plan-execute-verify-document"))
    #expect(loopIds.contains("research-synthesize-validate"))
    #expect(loopIds.contains("handoff-review-commit"))
    #expect(milestoneIds.contains("month-01-foundation-architecture-docs"))
    #expect(milestoneIds.contains("month-02-memory-planning-mcp"))
    #expect(milestoneIds.contains("month-03-agents-validation-release"))
    #expect(contract.claimBoundary.contains("does not claim autonomous general intelligence"))
}

@Test func agiSystemGeneratedReportMatchesSwiftContractTokens() throws {
    let root = repositoryRoot()
    let report = try String(
        contentsOf: root.appending(path: "reports/seis-agi-system.md"),
        encoding: .utf8
    )
    let source = try String(
        contentsOf: root.appending(path: "content/development/seis-agi-system.json"),
        encoding: .utf8
    )

    for token in SeisAGISystemContract.expectedReportTokens {
        #expect(report.contains(token), "missing AGI system report token: \(token)")
    }
    #expect(source.contains("\"memoryPlanning\""))
    #expect(source.contains("\"releaseWindow\""))
    #expect(source.contains("\"month-02-memory-planning-mcp\""))
    #expect(source.contains("\"release-evidence-current\""))
    #expect(source.contains("\"context-intake\""))
    #expect(source.contains("\"handoff-review-commit\""))
    for asset in [
        "basic-programming-concepts.jpeg",
        "python-programming-roadmap.jpg",
        "college-projects.jpg",
        "python-important-topics.jpg",
        "advanced-c-projects.jpg",
        "functional-programming-concepts.jpg",
        "dsa-interview-topics.jpg",
        "programming-blogs-websites.jpg"
    ] {
        let path = "content/development/seis-agi-reference-assets/\(asset)"
        #expect(source.contains(path), "missing AGI source asset path: \(path)")
        #expect(FileManager.default.fileExists(atPath: root.appending(path: path).path), "missing AGI reference asset: \(path)")
    }
}

@Test func agiMemoryPlanningSnapshotBootstrapsFromContract() {
    let contract = SeisAGISystemContract.master.memoryPlanning
    let snapshot = SeisAGIMemoryPlanningSnapshot.bootstrap(from: contract)
    let store = SeisAGIMemoryPlanningHistoryStore()

    #expect(snapshot.isReady)
    #expect(snapshot.records.count == contract.checkpoints.count)
    #expect(snapshot.records.allSatisfy { $0.isTraceable })
    #expect(snapshot.records.contains { $0.checkpointId == "context-intake" })
    #expect(snapshot.records.contains { $0.checkpointId == "self-evaluation" })
    #expect(snapshot.records.contains { $0.loopId == "retrieve-compress-plan" })
    #expect(snapshot.records.contains { $0.loopId == "handoff-review-commit" })

    for record in snapshot.records {
        store.save(record)
    }

    let stored = store.snapshot()
    #expect(stored.isReady)
    #expect(memoryPlanningRecordsSortedById(stored.records) == memoryPlanningRecordsSortedById(snapshot.records))
}

@Test func agiMemoryPlanningStoreSourceDocumentsPersistenceTokens() throws {
    let root = repositoryRoot()
    let source = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIMemoryPlanningStore.swift"),
        encoding: .utf8
    )

    for token in SeisAGIMemoryPlanningSnapshot.expectedSourceTokens {
        #expect(source.contains(token), "missing memory planning source token: \(token)")
    }
    #if canImport(CoreData)
    for token in SeisAGIMemoryPlanningPersistentStore.expectedSourceTokens {
        #expect(source.contains(token), "missing memory planning persistence token: \(token)")
    }
    #endif
}

@Test func agiContextCompressionRuntimeBuildsTokenEfficientPlan() throws {
    let snapshot = SeisAGIMemoryPlanningSnapshot.bootstrap(from: SeisAGISystemContract.master.memoryPlanning)
    let runtime = SeisAGIContextCompressionRuntime()
    let plan = runtime.makePlan(from: snapshot.records)

    #expect(plan.isReady)
    #expect(plan.targetSavingsPercent == 60)
    #expect(plan.savingsPercent >= 60)
    #expect(plan.selectedSources.contains { $0.id == "context-intake" })
    #expect(plan.selectedSources.contains { $0.id == "self-evaluation" })
    #expect(plan.deferredSources.contains { $0.id == "multi-agent-handoff" })
    #expect(plan.redactionPolicy.contains("never include secrets"))

    let root = repositoryRoot()
    let source = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIContextCompressionRuntime.swift"),
        encoding: .utf8
    )
    for token in SeisAGIContextCompressionRuntime.expectedSourceTokens {
        #expect(source.contains(token), "missing context compression source token: \(token)")
    }
}

@Test func agiAgentOrchestrationRuntimeBuildsGovernedMultiAgentPlan() throws {
    let contract = SeisAGISystemContract.master
    let snapshot = SeisAGIMemoryPlanningSnapshot.bootstrap(from: contract.memoryPlanning)
    let runtime = SeisAGIAgentOrchestrationRuntime()
    let plan = runtime.makePlan(contract: contract, memorySnapshot: snapshot)

    #expect(plan.isReady)
    #expect(plan.writerCount == 1)
    #expect(plan.roleSet == Set(SeisAGIAgentRole.allCases))
    #expect(plan.assignments.contains { $0.id == "codex-writer" && $0.writeAllowed })
    #expect(plan.assignments.contains { $0.id == "reviewer-sentinel" && !$0.writeAllowed })
    #expect(plan.assignments.contains { $0.pluginLaneId == "data-read-write" && $0.role == .researcher })
    #expect(plan.assignments.contains { $0.pluginLaneId == "design-interactive" && $0.role == .designer })
    #expect(plan.assignments.allSatisfy { $0.activationMode.contains("candidate") })
    #expect(plan.qualityGates.contains("no-fake-usage"))
    #expect(plan.contextPlan.savingsPercent >= 60)

    let root = repositoryRoot()
    let source = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIAgentOrchestrationRuntime.swift"),
        encoding: .utf8
    )
    for token in SeisAGIAgentOrchestrationRuntime.expectedSourceTokens {
        #expect(source.contains(token), "missing agent orchestration source token: \(token)")
    }
}

@Test func agiResearchAutomationRuntimeBuildsSourceManifestPlan() throws {
    let contract = SeisAGISystemContract.master
    let snapshot = SeisAGIMemoryPlanningSnapshot.bootstrap(from: contract.memoryPlanning)
    let orchestration = SeisAGIAgentOrchestrationRuntime().makePlan(
        contract: contract,
        memorySnapshot: snapshot
    )
    let plan = SeisAGIResearchAutomationRuntime().makePlan(
        contract: contract,
        memorySnapshot: snapshot,
        orchestrationPlan: orchestration
    )
    let historyStore = SeisAGIResearchManifestHistoryStore()

    #expect(plan.isReady)
    #expect(plan.researcherAssignmentId == "research-synthesizer")
    #expect(plan.outputArtifact == "source manifest")
    #expect(plan.allSources.count == snapshot.records.count)
    #expect(plan.selectedSources.contains { $0.id == "research-evidence" && $0.sourceKind == .generatedReport })
    #expect(plan.selectedSources.contains { $0.id == "context-intake" && $0.selectedByContext })
    #expect(plan.deferredSources.contains { $0.id == "multi-agent-handoff" })
    #expect(plan.qualityGates.contains("primary-source-first"))
    #expect(plan.qualityGates.contains("no-fake-usage"))
    #expect(plan.primarySourcePolicy.contains("official documentation"))
    #expect(plan.redactionPolicy.contains("never include secrets"))
    #expect(plan.statusLabel.contains("selected sources usable"))
    #expect(plan.sourceBalanceLabel.contains("selected"))
    #expect(plan.freshnessStatusLabel.contains("freshness checks"))
    #expect(plan.redactionStatusLabel == "secret-safe manifest only")
    #expect(SeisAGIResearchAutomationPlan.current().isReady)

    for item in plan.allSources {
        historyStore.save(item)
    }
    #expect(researchManifestItemsSortedById(historyStore.snapshot()) == researchManifestItemsSortedById(plan.allSources))

    let root = repositoryRoot()
    let source = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIResearchAutomationRuntime.swift"),
        encoding: .utf8
    )
    for token in SeisAGIResearchAutomationRuntime.expectedSourceTokens {
        #expect(source.contains(token), "missing research automation source token: \(token)")
    }
    #if canImport(CoreData)
    for token in SeisAGIResearchManifestPersistentStore.expectedSourceTokens {
        #expect(source.contains(token), "missing research manifest persistence token: \(token)")
    }
    #expect(SeisAGIResearchManifestPersistentStore.storagePolicy.contains("never persist secrets"))
    #endif
}

@Test func agiAgentHandoffSnapshotBootstrapsFromOrchestrationPlan() throws {
    let contract = SeisAGISystemContract.master
    let memory = SeisAGIMemoryPlanningSnapshot.bootstrap(from: contract.memoryPlanning)
    let orchestration = SeisAGIAgentOrchestrationRuntime().makePlan(contract: contract, memorySnapshot: memory)
    let snapshot = SeisAGIAgentHandoffSnapshot.bootstrap(from: orchestration)
    let store = SeisAGIAgentHandoffHistoryStore()

    #expect(snapshot.isReady)
    #expect(snapshot.records.count == orchestration.assignments.count)
    #expect(snapshot.writerCount == 1)
    #expect(snapshot.roleSet == Set(SeisAGIAgentRole.allCases))
    #expect(snapshot.records.contains { $0.assignmentId == "codex-writer" && $0.writeAllowed })
    #expect(snapshot.records.contains { $0.assignmentId == "reviewer-sentinel" && !$0.writeAllowed })
    #expect(snapshot.records.allSatisfy { $0.status == .drafted })
    #expect(SeisAGIAgentHandoffSnapshot.storagePolicy.contains("never persist secrets"))
    #expect(SeisAGIAgentHandoffSnapshot.current().isReady)
    #expect(snapshot.statusLabel.contains("handoffs traceable"))
    #expect(snapshot.writerStatusLabel == "1/1 writer")
    #expect(snapshot.pluginLaneSummary.contains("development-read-write"))

    for record in snapshot.records {
        store.save(record)
    }

    let stored = store.snapshot()
    #expect(stored.isReady)
    #expect(agentHandoffRecordsSortedById(stored.records) == agentHandoffRecordsSortedById(snapshot.records))

    let root = repositoryRoot()
    let source = try String(
        contentsOf: root.appending(path: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIAgentHandoffStore.swift"),
        encoding: .utf8
    )
    for token in SeisAGIAgentHandoffSnapshot.expectedSourceTokens {
        #expect(source.contains(token), "missing agent handoff source token: \(token)")
    }
    #if canImport(CoreData)
    for token in SeisAGIAgentHandoffPersistentStore.expectedSourceTokens {
        #expect(source.contains(token), "missing agent handoff persistence token: \(token)")
    }
    #endif
}

#if canImport(CoreData)
@Test func agiMemoryPlanningPersistentStoreRoundTripsBootstrapRecords() throws {
    let snapshot = SeisAGIMemoryPlanningSnapshot.bootstrap(
        from: SeisAGISystemContract.master.memoryPlanning,
        recordedAt: "2026-06-12T16:55:00Z"
    )
    let persistentStore = try SeisAGIMemoryPlanningPersistentStore(inMemory: true)

    for record in snapshot.records {
        try persistentStore.save(record)
    }

    let fetched = try persistentStore.fetch(limit: 10)
    #expect(memoryPlanningRecordsSortedById(fetched) == memoryPlanningRecordsSortedById(snapshot.records))
    #expect(SeisAGIMemoryPlanningSnapshot(records: fetched).isReady)
}

@Test func agiAgentHandoffPersistentStoreRoundTripsRecords() throws {
    let contract = SeisAGISystemContract.master
    let memory = SeisAGIMemoryPlanningSnapshot.bootstrap(from: contract.memoryPlanning)
    let orchestration = SeisAGIAgentOrchestrationRuntime().makePlan(contract: contract, memorySnapshot: memory)
    let snapshot = SeisAGIAgentHandoffSnapshot.bootstrap(
        from: orchestration,
        recordedAt: "2026-06-12T18:05:00Z"
    )
    let persistentStore = try SeisAGIAgentHandoffPersistentStore(inMemory: true)

    for record in snapshot.records {
        try persistentStore.save(record)
    }

    let fetched = try persistentStore.fetch(limit: 10)
    #expect(agentHandoffRecordsSortedById(fetched) == agentHandoffRecordsSortedById(snapshot.records))
    #expect(SeisAGIAgentHandoffSnapshot(records: fetched).isReady)
}

@Test func agiResearchManifestPersistentStoreRoundTripsSources() throws {
    let contract = SeisAGISystemContract.master
    let memory = SeisAGIMemoryPlanningSnapshot.bootstrap(from: contract.memoryPlanning)
    let orchestration = SeisAGIAgentOrchestrationRuntime().makePlan(
        contract: contract,
        memorySnapshot: memory
    )
    let plan = SeisAGIResearchAutomationRuntime().makePlan(
        contract: contract,
        memorySnapshot: memory,
        orchestrationPlan: orchestration
    )
    let persistentStore = try SeisAGIResearchManifestPersistentStore(inMemory: true)

    for item in plan.allSources {
        try persistentStore.save(item)
    }

    let fetched = try persistentStore.fetch(limit: 10)
    #expect(researchManifestItemsSortedById(fetched) == researchManifestItemsSortedById(plan.allSources))
    #expect(fetched.contains { $0.id == "research-evidence" && $0.selectedByContext })
    #expect(fetched.allSatisfy { !$0.containsSecrets })
}
#endif

@Test func githubLanguageBalanceContractDefinesNoFillerTargets() {
    let targets = SeisGitHubLanguageBalanceContract.targets
    let appleTarget = SeisGitHubLanguageBalanceContract.target(for: "apple-swift-ecosystem")
    let previewTarget = SeisGitHubLanguageBalanceContract.target(for: "html-css-preview")

    #expect(targets.count == 8)
    #expect(SeisGitHubLanguageBalanceContract.isReady)
    #expect(SeisGitHubLanguageBalanceContract.noFillerPolicy.contains("Do not add filler code"))
    #expect(SeisGitHubLanguageBalanceContract.validationCommands.contains("swift test --package-path packages/seis_platform_swift"))
    #expect(SeisGitHubLanguageBalanceContract.validationCommands.contains("npm run quality"))
    #expect(Set(SeisGitHubLanguageBalanceContract.migrationOrder).isSuperset(of: SeisGitHubLanguageBalanceContract.targetIDs))

    #expect(appleTarget?.minPercent == 25.0)
    #expect(appleTarget?.maxPercent == 30.0)
    #expect(appleTarget?.sourceLanguages == ["Swift", "Objective-C", "AppleScript"])
    #expect(appleTarget?.ecosystemSurfaces.contains("SwiftUI") == true)
    #expect(appleTarget?.ecosystemSurfaces.contains("CloudKit") == true)
    #expect(appleTarget?.owningIdentity == "SEIS")
    #expect(appleTarget?.status(for: 10.27) == .belowTarget)
    #expect(appleTarget?.status(for: 27.0) == .withinTarget)
    #expect(appleTarget?.status(for: 35.0) == .aboveTarget)
    #expect(previewTarget?.status(for: 6.38) == .aboveTarget)
}

@Test func githubLanguageBalanceContractMatchesGeneratedReportTargets() throws {
    let root = repositoryRoot()
    let reportURL = root.appending(path: "reports/language-distribution.json")
    let report = try JSONDecoder().decode(
        LanguageDistributionReport.self,
        from: Data(contentsOf: reportURL)
    )
    let contractTargetsByID = Dictionary(
        uniqueKeysWithValues: SeisGitHubLanguageBalanceContract.targets.map { ($0.id, $0) }
    )

    #expect(report.languageBalanceTargets.mode == SeisGitHubLanguageBalanceContract.mode)
    #expect(report.languageBalanceTargets.status == "needs_real_platform_work")
    #expect(report.languageBalanceTargets.noFillerPolicy == SeisGitHubLanguageBalanceContract.noFillerPolicy)
    #expect(Set(report.languageBalanceTargets.targets.map(\.id)) == Set(SeisGitHubLanguageBalanceContract.targetIDs))

    for reportTarget in report.languageBalanceTargets.targets {
        let contractTarget = try #require(contractTargetsByID[reportTarget.id])
        #expect(reportTarget.label == contractTarget.label)
        #expect(reportTarget.minPercent == contractTarget.minPercent)
        #expect(reportTarget.maxPercent == contractTarget.maxPercent)
        #expect(reportTarget.sourceLanguages == contractTarget.sourceLanguages)
        #expect(reportTarget.purpose == contractTarget.purpose)
        #expect(reportTarget.noFillerRule == contractTarget.noFillerRule)
        #expect(contractTarget.status(for: reportTarget.percent).rawValue == reportTarget.status)
    }
}

private struct LanguageDistributionReport: Decodable {
    let languageBalanceTargets: ReportLanguageBalanceTargets
}

private struct ReportLanguageBalanceTargets: Decodable {
    let mode: String
    let status: String
    let noFillerPolicy: String
    let targets: [ReportLanguageBalanceTarget]
}

private struct ReportLanguageBalanceTarget: Decodable {
    let id: String
    let label: String
    let percent: Double
    let minPercent: Double
    let maxPercent: Double
    let status: String
    let sourceLanguages: [String]
    let purpose: String
    let noFillerRule: String
}

private func agentHandoffRecordsSortedById(
    _ records: [SeisAGIAgentHandoffRecord]
) -> [SeisAGIAgentHandoffRecord] {
    records.sorted { $0.id < $1.id }
}

private func memoryPlanningRecordsSortedById(
    _ records: [SeisAGIMemoryPlanningRecord]
) -> [SeisAGIMemoryPlanningRecord] {
    records.sorted { $0.id < $1.id }
}

private func researchManifestItemsSortedById(
    _ items: [SeisAGIResearchSourceManifestItem]
) -> [SeisAGIResearchSourceManifestItem] {
    items.sorted { $0.id < $1.id }
}

private func repositoryRoot() -> URL {
    var url = URL(fileURLWithPath: #filePath)
    for _ in 0..<5 {
        url.deleteLastPathComponent()
    }
    return url
}
