import Combine
import Foundation

public protocol SeisAppleDiagnosticsHistoryPersisting {
    @discardableResult
    func save(_ snapshot: SeisAppleShellDiagnosticsHistorySnapshot) throws -> SeisAppleShellDiagnosticsHistorySnapshot
    func fetch(limit: Int) throws -> [SeisAppleShellDiagnosticsHistorySnapshot]
}

public struct SeisAppleShellDiagnosticsHistorySnapshot: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let source: String
    public let recordedAt: String
    public let readyCount: Int
    public let checkCount: Int
    public let qualityGateCount: Int
    public let runtimeReadyCount: Int
    public let runtimeProbeCount: Int
    public let persistenceReadyCount: Int
    public let persistenceCheckCount: Int
    public let agentHandoffReadyCount: Int
    public let agentHandoffCheckCount: Int
    public let agentHandoffWriterCount: Int
    public let agentHandoffStatusLabel: String

    public init(
        id: String,
        source: String,
        recordedAt: String,
        readyCount: Int,
        checkCount: Int,
        qualityGateCount: Int,
        runtimeReadyCount: Int,
        runtimeProbeCount: Int,
        persistenceReadyCount: Int,
        persistenceCheckCount: Int,
        agentHandoffReadyCount: Int,
        agentHandoffCheckCount: Int,
        agentHandoffWriterCount: Int,
        agentHandoffStatusLabel: String
    ) {
        self.id = id
        self.source = source
        self.recordedAt = recordedAt
        self.readyCount = readyCount
        self.checkCount = checkCount
        self.qualityGateCount = qualityGateCount
        self.runtimeReadyCount = runtimeReadyCount
        self.runtimeProbeCount = runtimeProbeCount
        self.persistenceReadyCount = persistenceReadyCount
        self.persistenceCheckCount = persistenceCheckCount
        self.agentHandoffReadyCount = agentHandoffReadyCount
        self.agentHandoffCheckCount = agentHandoffCheckCount
        self.agentHandoffWriterCount = agentHandoffWriterCount
        self.agentHandoffStatusLabel = agentHandoffStatusLabel
    }

    public static func make(
        source: String,
        continuation: SeisAppleContinuationSnapshot,
        diagnostics: SeisAppleShellDiagnosticsContract,
        persistence: SeisApplePersistenceReadinessContract,
        runtime: SeisAppleShellRuntimeDiagnostics,
        agentHandoff: SeisAGIAgentHandoffSnapshot = .current(),
        recordedAt: Date = Date()
    ) -> SeisAppleShellDiagnosticsHistorySnapshot {
        let agentHandoffReadyCount = agentHandoff.isReady ? 1 : 0
        let agentHandoffCheckCount = 1
        let readyCount = diagnostics.readyCount + persistence.readyCount + runtime.readyCount + agentHandoffReadyCount
        let checkCount = diagnostics.items.count + persistence.checkCount + runtime.probes.count + agentHandoffCheckCount
        let timestamp = Self.timestampString(from: recordedAt)
        let id = "\(source)-\(readyCount)-\(checkCount)-\(timestamp)"
            .replacingOccurrences(of: ":", with: "-")

        return SeisAppleShellDiagnosticsHistorySnapshot(
            id: id,
            source: source,
            recordedAt: timestamp,
            readyCount: readyCount,
            checkCount: checkCount,
            qualityGateCount: continuation.qualityGates.count,
            runtimeReadyCount: runtime.readyCount,
            runtimeProbeCount: runtime.probes.count,
            persistenceReadyCount: persistence.readyCount,
            persistenceCheckCount: persistence.checkCount,
            agentHandoffReadyCount: agentHandoffReadyCount,
            agentHandoffCheckCount: agentHandoffCheckCount,
            agentHandoffWriterCount: agentHandoff.writerCount,
            agentHandoffStatusLabel: agentHandoff.statusLabel
        )
    }

    public var isReady: Bool {
        checkCount > 0 && readyCount == checkCount
    }

    public var statusLabel: String {
        "\(readyCount)/\(checkCount) ready"
    }

    public var runtimeStatusLabel: String {
        "\(runtimeReadyCount)/\(runtimeProbeCount) runtime"
    }

    public var persistenceStatusLabel: String {
        "\(persistenceReadyCount)/\(persistenceCheckCount) persistence"
    }

    public var agentHandoffStatusSummary: String {
        "\(agentHandoffReadyCount)/\(agentHandoffCheckCount) handoff / \(agentHandoffWriterCount)/1 writer / \(agentHandoffStatusLabel)"
    }

    public static var expectedSourceTokens: [String] {
        [
            "import Combine",
            "ObservableObject",
            "@Published",
            "SeisAppleDiagnosticsHistoryPersisting",
            "SeisAppleShellDiagnosticsHistorySnapshot",
            "qualityGateCount",
            "runtimeStatusLabel",
            "persistenceStatusLabel",
            "agentHandoffStatusLabel",
            "agentHandoffStatusSummary"
        ]
    }

    public static var expectedDiagnosticsViewTokens: [String] {
        [
            "Diagnostics Timeline",
            "historyStore.snapshots",
            "historySnapshot.statusLabel",
            "historySnapshot.runtimeStatusLabel",
            "historySnapshot.persistenceStatusLabel",
            "historySnapshot.agentHandoffStatusSummary"
        ]
    }

    private static func timestampString(from date: Date) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.string(from: date)
    }
}

public final class SeisAppleShellDiagnosticsHistoryStore: ObservableObject {
    @Published public private(set) var snapshots: [SeisAppleShellDiagnosticsHistorySnapshot]
    private let historyLimit: Int
    private let persistentStore: SeisAppleDiagnosticsHistoryPersisting?

    public init(
        historyLimit: Int = 5,
        snapshots: [SeisAppleShellDiagnosticsHistorySnapshot] = [],
        persistentStore: SeisAppleDiagnosticsHistoryPersisting? = nil
    ) {
        self.historyLimit = max(1, historyLimit)
        self.persistentStore = persistentStore
        let persistedSnapshots = (try? persistentStore?.fetch(limit: self.historyLimit)) ?? []
        let initialSnapshots = persistedSnapshots.isEmpty ? snapshots : persistedSnapshots
        self.snapshots = Array(initialSnapshots.prefix(self.historyLimit))
    }

    public static func appleNative(historyLimit: Int = 5) -> SeisAppleShellDiagnosticsHistoryStore {
        #if canImport(CoreData)
        SeisAppleShellDiagnosticsHistoryStore(
            historyLimit: historyLimit,
            persistentStore: try? SeisAppleDiagnosticsPersistentHistoryStore()
        )
        #else
        SeisAppleShellDiagnosticsHistoryStore(historyLimit: historyLimit)
        #endif
    }

    @discardableResult
    public func record(
        source: String,
        continuation: SeisAppleContinuationSnapshot,
        diagnostics: SeisAppleShellDiagnosticsContract,
        persistence: SeisApplePersistenceReadinessContract,
        runtime: SeisAppleShellRuntimeDiagnostics,
        agentHandoff: SeisAGIAgentHandoffSnapshot = .current(),
        recordedAt: Date = Date()
    ) -> SeisAppleShellDiagnosticsHistorySnapshot {
        let snapshot = SeisAppleShellDiagnosticsHistorySnapshot.make(
            source: source,
            continuation: continuation,
            diagnostics: diagnostics,
            persistence: persistence,
            runtime: runtime,
            agentHandoff: agentHandoff,
            recordedAt: recordedAt
        )
        _ = try? persistentStore?.save(snapshot)
        snapshots.insert(snapshot, at: 0)
        if snapshots.count > historyLimit {
            snapshots.removeLast(snapshots.count - historyLimit)
        }
        return snapshot
    }

    public var latest: SeisAppleShellDiagnosticsHistorySnapshot? {
        snapshots.first
    }
}
