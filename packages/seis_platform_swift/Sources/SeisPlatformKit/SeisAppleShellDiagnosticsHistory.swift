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
        persistenceCheckCount: Int
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
    }

    public static func make(
        source: String,
        continuation: SeisAppleContinuationSnapshot,
        diagnostics: SeisAppleShellDiagnosticsContract,
        persistence: SeisApplePersistenceReadinessContract,
        runtime: SeisAppleShellRuntimeDiagnostics,
        recordedAt: Date = Date()
    ) -> SeisAppleShellDiagnosticsHistorySnapshot {
        let readyCount = diagnostics.readyCount + persistence.readyCount + runtime.readyCount
        let checkCount = diagnostics.items.count + persistence.checkCount + runtime.probes.count
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
            persistenceCheckCount: persistence.checkCount
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

    public static var expectedSourceTokens: [String] {
        [
            "import Combine",
            "ObservableObject",
            "@Published",
            "SeisAppleDiagnosticsHistoryPersisting",
            "SeisAppleShellDiagnosticsHistorySnapshot",
            "qualityGateCount",
            "runtimeStatusLabel",
            "persistenceStatusLabel"
        ]
    }

    public static var expectedDiagnosticsViewTokens: [String] {
        [
            "Diagnostics Timeline",
            "historyStore.snapshots",
            "historySnapshot.statusLabel",
            "historySnapshot.runtimeStatusLabel",
            "historySnapshot.persistenceStatusLabel"
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
        recordedAt: Date = Date()
    ) -> SeisAppleShellDiagnosticsHistorySnapshot {
        let snapshot = SeisAppleShellDiagnosticsHistorySnapshot.make(
            source: source,
            continuation: continuation,
            diagnostics: diagnostics,
            persistence: persistence,
            runtime: runtime,
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
