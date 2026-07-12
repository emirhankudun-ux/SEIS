import Foundation

public enum SeisSecondBrainReviewOutcomeStorageMode: String, Codable, Equatable, Sendable {
    case inMemory = "in-memory"
    case coreData = "core-data"
}

public final class SeisSecondBrainReviewOutcomeRepository: @unchecked Sendable {
    private let historyStore: SeisSecondBrainReviewOutcomeHistoryStore
    public let storageMode: SeisSecondBrainReviewOutcomeStorageMode

#if canImport(CoreData)
    private let persistentStore: SeisSecondBrainReviewOutcomePersistentStore?
#endif

    public init(historyStore: SeisSecondBrainReviewOutcomeHistoryStore = .init()) {
        self.historyStore = historyStore
        storageMode = .inMemory
#if canImport(CoreData)
        persistentStore = nil
#endif
    }

#if canImport(CoreData)
    public init(
        historyStore: SeisSecondBrainReviewOutcomeHistoryStore = .init(),
        persistentStore: SeisSecondBrainReviewOutcomePersistentStore
    ) {
        self.historyStore = historyStore
        self.persistentStore = persistentStore
        storageMode = .coreData
    }

    public static func makePersistent(
        historyStore: SeisSecondBrainReviewOutcomeHistoryStore = .init(),
        inMemory: Bool = false
    ) throws -> SeisSecondBrainReviewOutcomeRepository {
        let persistentStore = try SeisSecondBrainReviewOutcomePersistentStore(inMemory: inMemory)
        return SeisSecondBrainReviewOutcomeRepository(
            historyStore: historyStore,
            persistentStore: persistentStore
        )
    }
#endif

    @discardableResult
    public func save(_ record: SeisSecondBrainReviewOutcomeRecord) throws -> SeisSecondBrainReviewOutcomeRecord {
        guard record.isTraceable else {
            throw SeisSecondBrainReviewOutcomePersistenceError.invalidRecord
        }

#if canImport(CoreData)
        try persistentStore?.save(record)
#endif
        return historyStore.save(record)
    }

    public func snapshot(limit: Int = 100) throws -> SeisSecondBrainReviewOutcomeSnapshot {
#if canImport(CoreData)
        if let persistentStore {
            return try persistentStore.snapshot(limit: limit)
        }
#endif
        return historyStore.snapshot()
    }

    public func hydrate(limit: Int = 100) throws -> SeisSecondBrainReviewOutcomeSnapshot {
#if canImport(CoreData)
        if let persistentStore {
            let snapshot = try persistentStore.snapshot(limit: limit)
            snapshot.records.forEach { _ = historyStore.save($0) }
            return snapshot
        }
#endif
        return historyStore.snapshot()
    }

    public static var expectedSourceTokens: [String] {
        [
            "SeisSecondBrainReviewOutcomeStorageMode",
            "SeisSecondBrainReviewOutcomeRepository",
            "in-memory",
            "core-data",
            "makePersistent",
            "hydrate",
            "invalidRecord",
            "persistentStore?.save(record)"
        ]
    }
}
