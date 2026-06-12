import Foundation

public struct SeisAppleShellRuntimeSurface: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let relativePath: String
    public let qualityGate: String

    public init(id: String, title: String, relativePath: String, qualityGate: String) {
        self.id = id
        self.title = title
        self.relativePath = relativePath
        self.qualityGate = qualityGate
    }
}

public struct SeisAppleShellRuntimeProbe: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let relativePath: String
    public let state: SeisAppleShellDiagnosticState
    public let evidence: String
    public let qualityGate: String

    public init(
        id: String,
        title: String,
        relativePath: String,
        state: SeisAppleShellDiagnosticState,
        evidence: String,
        qualityGate: String
    ) {
        self.id = id
        self.title = title
        self.relativePath = relativePath
        self.state = state
        self.evidence = evidence
        self.qualityGate = qualityGate
    }
}

public struct SeisAppleShellRuntimeDiagnostics: Codable, Equatable, Sendable {
    public let repositoryRootPath: String
    public let processName: String
    public let operatingSystemVersion: String
    public let probes: [SeisAppleShellRuntimeProbe]

    public init(
        repositoryRootPath: String,
        processName: String,
        operatingSystemVersion: String,
        probes: [SeisAppleShellRuntimeProbe]
    ) {
        self.repositoryRootPath = repositoryRootPath
        self.processName = processName
        self.operatingSystemVersion = operatingSystemVersion
        self.probes = probes
    }

    public static let requiredSurfaces: [SeisAppleShellRuntimeSurface] = [
        SeisAppleShellRuntimeSurface(
            id: "swiftpm-manifest",
            title: "SwiftPM Manifest",
            relativePath: "packages/seis_platform_swift/Package.swift",
            qualityGate: "swift_test"
        ),
        SeisAppleShellRuntimeSurface(
            id: "agi-operating-system-contract",
            title: "AGI System Contract",
            relativePath: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift",
            qualityGate: "agent_governance"
        ),
        SeisAppleShellRuntimeSurface(
            id: "run-script",
            title: "Run Script",
            relativePath: "script/build_and_run.sh",
            qualityGate: "offline_fallback"
        ),
        SeisAppleShellRuntimeSurface(
            id: "codex-run-action",
            title: "Codex Run Action",
            relativePath: ".codex/environments/environment.toml",
            qualityGate: "permission_scope"
        ),
        SeisAppleShellRuntimeSurface(
            id: "diagnostics-view",
            title: "Diagnostics View",
            relativePath: "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/AppleShellDiagnosticsView.swift",
            qualityGate: "accessibility_when_ui"
        ),
        SeisAppleShellRuntimeSurface(
            id: "runtime-diagnostics",
            title: "Runtime Diagnostics",
            relativePath: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAppleShellRuntimeDiagnostics.swift",
            qualityGate: "notarization_awareness"
        ),
        SeisAppleShellRuntimeSurface(
            id: "telemetry-contract",
            title: "Telemetry Contract",
            relativePath: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAppleShellTelemetry.swift",
            qualityGate: "observability"
        ),
        SeisAppleShellRuntimeSurface(
            id: "persistence-readiness",
            title: "Persistence Readiness",
            relativePath: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisApplePersistenceReadinessContract.swift",
            qualityGate: "coredata_cloudkit_sync_review"
        ),
        SeisAppleShellRuntimeSurface(
            id: "diagnostics-history",
            title: "Diagnostics History",
            relativePath: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAppleShellDiagnosticsHistory.swift",
            qualityGate: "observability"
        ),
        SeisAppleShellRuntimeSurface(
            id: "diagnostics-persistent-store",
            title: "Diagnostics Persistent Store",
            relativePath: "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAppleDiagnosticsPersistentHistoryStore.swift",
            qualityGate: "coredata_cloudkit_sync_review"
        )
    ]

    public static func current(repositoryRoot: URL? = nil) -> SeisAppleShellRuntimeDiagnostics {
        let root = repositoryRoot ?? defaultRepositoryRoot()
        let existingPaths = Set(
            requiredSurfaces
                .map(\.relativePath)
                .filter { FileManager.default.fileExists(atPath: root.appending(path: $0).path) }
        )

        return make(
            repositoryRoot: root,
            existingRelativePaths: existingPaths,
            operatingSystemVersion: ProcessInfo.processInfo.operatingSystemVersionString,
            processName: ProcessInfo.processInfo.processName
        )
    }

    public static func make(
        repositoryRoot: URL,
        existingRelativePaths: Set<String>,
        operatingSystemVersion: String = "test-os",
        processName: String = "test-process"
    ) -> SeisAppleShellRuntimeDiagnostics {
        let rootPath = repositoryRoot.path
        let probes = requiredSurfaces.map { surface in
            let exists = existingRelativePaths.contains(surface.relativePath)
            return SeisAppleShellRuntimeProbe(
                id: surface.id,
                title: surface.title,
                relativePath: surface.relativePath,
                state: exists ? .ready : .watch,
                evidence: exists
                    ? "\(surface.relativePath) exists under \(rootPath)."
                    : "\(surface.relativePath) is missing under \(rootPath).",
                qualityGate: surface.qualityGate
            )
        }

        return SeisAppleShellRuntimeDiagnostics(
            repositoryRootPath: rootPath,
            processName: processName,
            operatingSystemVersion: operatingSystemVersion,
            probes: probes
        )
    }

    public var readyCount: Int {
        probes.filter { $0.state == .ready }.count
    }

    public var isReady: Bool {
        !probes.isEmpty && readyCount == probes.count
    }

    public var accessibilitySummary: String {
        "Runtime diagnostics. \(readyCount) of \(probes.count) probes ready. Process \(processName)."
    }

    public var expectedRuntimeViewTokens: [String] {
        [
            "runtimeDiagnostics",
            "Runtime Probes",
            "repositoryRootPath",
            "operatingSystemVersion",
            "processName",
            "runtimeDiagnostics.probes",
            "Refresh Diagnostics",
            "refreshDiagnostics",
            "State(initialValue"
        ]
    }

    private static func defaultRepositoryRoot() -> URL {
        let environment = ProcessInfo.processInfo.environment
        let explicitRoot = environment["SEIS_REPOSITORY_ROOT"].map(URL.init(fileURLWithPath:))
        let workingRoot = environment["PWD"].map(URL.init(fileURLWithPath:))
        let currentRoot = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
        let bundleRoot = Bundle.main.bundleURL
            .deletingLastPathComponent()
            .deletingLastPathComponent()

        let candidates = [explicitRoot, workingRoot, currentRoot, bundleRoot].compactMap(\.self)
        return candidates.first { candidate in
            FileManager.default.fileExists(
                atPath: candidate.appending(path: "packages/seis_platform_swift/Package.swift").path
            )
        } ?? currentRoot
    }
}
