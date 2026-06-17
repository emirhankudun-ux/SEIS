import Foundation

public enum SeisAGIMemoryPlanningRecordStatus: String, Codable, Equatable, Sendable {
    case proposed
    case active
    case verified
    case blocked
}

public struct SeisAGIMemoryPlanningRecord: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let checkpointId: String
    public let loopId: String
    public let phase: String
    public let title: String
    public let summary: String
    public let evidencePath: String
    public let qualityGates: [String]
    public let status: SeisAGIMemoryPlanningRecordStatus
    public let recordedAt: String

    public init(
        id: String,
        checkpointId: String,
        loopId: String,
        phase: String,
        title: String,
        summary: String,
        evidencePath: String,
        qualityGates: [String],
        status: SeisAGIMemoryPlanningRecordStatus,
        recordedAt: String
    ) {
        self.id = id
        self.checkpointId = checkpointId
        self.loopId = loopId
        self.phase = phase
        self.title = title
        self.summary = summary
        self.evidencePath = evidencePath
        self.qualityGates = qualityGates
        self.status = status
        self.recordedAt = recordedAt
    }

    public var isTraceable: Bool {
        !id.isEmpty &&
            !checkpointId.isEmpty &&
            !loopId.isEmpty &&
            !phase.isEmpty &&
            !title.isEmpty &&
            !summary.isEmpty &&
            !evidencePath.isEmpty &&
            qualityGates.count >= 3
    }
}

public struct SeisAGIMemoryPlanningSnapshot: Codable, Equatable, Sendable {
    public let records: [SeisAGIMemoryPlanningRecord]

    public init(records: [SeisAGIMemoryPlanningRecord]) {
        self.records = records
    }

    public var isReady: Bool {
        records.count >= 5 &&
            records.allSatisfy(\.isTraceable) &&
            records.contains { $0.checkpointId == "context-intake" } &&
            records.contains { $0.checkpointId == "self-evaluation" } &&
            records.contains { $0.loopId == "retrieve-compress-plan" } &&
            records.contains { $0.loopId == "handoff-review-commit" }
    }

    public static func bootstrap(
        from contract: SeisAGIMemoryPlanningContract,
        recordedAt: String = "2026-06-12T00:00:00Z"
    ) -> SeisAGIMemoryPlanningSnapshot {
        let loops = contract.loops
        let records = contract.checkpoints.enumerated().map { index, checkpoint in
            let loop = loops[index % loops.count]
            return SeisAGIMemoryPlanningRecord(
                id: "\(checkpoint.id)-\(loop.id)",
                checkpointId: checkpoint.id,
                loopId: loop.id,
                phase: checkpoint.phase,
                title: checkpoint.label,
                summary: "\(checkpoint.label) uses \(checkpoint.appleStorageSurface) and writes evidence to \(checkpoint.evidencePath).",
                evidencePath: checkpoint.evidencePath,
                qualityGates: checkpoint.qualityGates + loop.evaluationGates,
                status: .proposed,
                recordedAt: recordedAt
            )
        }
        return SeisAGIMemoryPlanningSnapshot(records: records)
    }

    public static var expectedSourceTokens: [String] {
        [
            "SeisAGIMemoryPlanningRecord",
            "SeisAGIMemoryPlanningSnapshot",
            "bootstrap(",
            "Core Data",
            "CloudKit",
            "never persist secrets",
            "retrieve-compress-plan",
            "handoff-review-commit"
        ]
    }
}

public final class SeisAGIMemoryPlanningHistoryStore: @unchecked Sendable {
    private let lock = NSLock()
    private var recordsById: [String: SeisAGIMemoryPlanningRecord] = [:]

    public init(records: [SeisAGIMemoryPlanningRecord] = []) {
        for record in records {
            recordsById[record.id] = record
        }
    }

    @discardableResult
    public func save(_ record: SeisAGIMemoryPlanningRecord) -> SeisAGIMemoryPlanningRecord {
        lock.lock()
        defer { lock.unlock() }
        recordsById[record.id] = record
        return record
    }

    public func snapshot() -> SeisAGIMemoryPlanningSnapshot {
        lock.lock()
        defer { lock.unlock() }
        return SeisAGIMemoryPlanningSnapshot(
            records: recordsById.values.sorted { lhs, rhs in
                if lhs.recordedAt == rhs.recordedAt {
                    return lhs.id < rhs.id
                }
                return lhs.recordedAt < rhs.recordedAt
            }
        )
    }
}

#if canImport(CoreData)
import CoreData

public final class SeisAGIMemoryPlanningPersistentStore {
    public static let containerName = "SEISAGIMemoryPlanning"
    public static let entityName = "SEISAGIMemoryPlanningRecord"

    private let container: NSPersistentContainer

    public init(storeURL: URL? = nil, inMemory: Bool = false) throws {
        let model = Self.makeManagedObjectModel()
        self.container = NSPersistentContainer(name: Self.containerName, managedObjectModel: model)

        let description = NSPersistentStoreDescription()
        if inMemory {
            description.type = NSInMemoryStoreType
        } else {
            let resolvedURL = storeURL ?? Self.defaultStoreURL()
            try FileManager.default.createDirectory(
                at: resolvedURL.deletingLastPathComponent(),
                withIntermediateDirectories: true
            )
            description.type = NSSQLiteStoreType
            description.url = resolvedURL
        }
        description.shouldMigrateStoreAutomatically = true
        description.shouldInferMappingModelAutomatically = true

        container.persistentStoreDescriptions = [description]
        try Self.loadPersistentStores(for: container)
        container.viewContext.mergePolicy = NSMergePolicy(merge: .mergeByPropertyObjectTrumpMergePolicyType)
        container.viewContext.automaticallyMergesChangesFromParent = true
    }

    @discardableResult
    public func save(_ record: SeisAGIMemoryPlanningRecord) throws -> SeisAGIMemoryPlanningRecord {
        let context = container.viewContext
        var saveError: Error?

        context.performAndWait {
            do {
                let object = try Self.object(for: record.id, in: context)
                    ?? NSEntityDescription.insertNewObject(forEntityName: Self.entityName, into: context)
                object.setValue(record.id, forKey: "id")
                object.setValue(record.checkpointId, forKey: "checkpointId")
                object.setValue(record.loopId, forKey: "loopId")
                object.setValue(record.phase, forKey: "phase")
                object.setValue(record.title, forKey: "title")
                object.setValue(record.summary, forKey: "summary")
                object.setValue(record.evidencePath, forKey: "evidencePath")
                object.setValue(record.qualityGates.joined(separator: "\n"), forKey: "qualityGates")
                object.setValue(record.status.rawValue, forKey: "status")
                object.setValue(record.recordedAt, forKey: "recordedAt")

                if context.hasChanges {
                    try context.save()
                }
            } catch {
                saveError = error
            }
        }

        if let saveError {
            throw saveError
        }
        return record
    }

    public func fetch(limit: Int) throws -> [SeisAGIMemoryPlanningRecord] {
        let context = container.viewContext
        var fetchResult: Result<[SeisAGIMemoryPlanningRecord], Error>?

        context.performAndWait {
            do {
                let request = NSFetchRequest<NSManagedObject>(entityName: Self.entityName)
                request.fetchLimit = max(1, limit)
                request.sortDescriptors = [NSSortDescriptor(key: "recordedAt", ascending: true)]
                let objects = try context.fetch(request)
                fetchResult = .success(objects.compactMap(Self.record(from:)))
            } catch {
                fetchResult = .failure(error)
            }
        }

        return try fetchResult?.get() ?? []
    }

    public static var expectedSourceTokens: [String] {
        [
            "import CoreData",
            "NSPersistentContainer",
            "NSPersistentStoreDescription",
            "NSManagedObjectModel",
            "NSEntityDescription",
            "NSFetchRequest",
            "NSSQLiteStoreType",
            "NSInMemoryStoreType",
            "NSMergePolicy",
            "shouldMigrateStoreAutomatically",
            "shouldInferMappingModelAutomatically"
        ]
    }

    private static func object(for id: String, in context: NSManagedObjectContext) throws -> NSManagedObject? {
        let request = NSFetchRequest<NSManagedObject>(entityName: entityName)
        request.predicate = NSPredicate(format: "id == %@", id)
        request.fetchLimit = 1
        return try context.fetch(request).first
    }

    private static func record(from object: NSManagedObject) -> SeisAGIMemoryPlanningRecord? {
        guard
            let id = object.value(forKey: "id") as? String,
            let checkpointId = object.value(forKey: "checkpointId") as? String,
            let loopId = object.value(forKey: "loopId") as? String,
            let phase = object.value(forKey: "phase") as? String,
            let title = object.value(forKey: "title") as? String,
            let summary = object.value(forKey: "summary") as? String,
            let evidencePath = object.value(forKey: "evidencePath") as? String,
            let qualityGates = object.value(forKey: "qualityGates") as? String,
            let status = object.value(forKey: "status") as? String,
            let recordedAt = object.value(forKey: "recordedAt") as? String,
            let resolvedStatus = SeisAGIMemoryPlanningRecordStatus(rawValue: status)
        else {
            return nil
        }

        return SeisAGIMemoryPlanningRecord(
            id: id,
            checkpointId: checkpointId,
            loopId: loopId,
            phase: phase,
            title: title,
            summary: summary,
            evidencePath: evidencePath,
            qualityGates: qualityGates.split(separator: "\n").map(String.init),
            status: resolvedStatus,
            recordedAt: recordedAt
        )
    }

    private static func makeManagedObjectModel() -> NSManagedObjectModel {
        let entity = NSEntityDescription()
        entity.name = entityName
        entity.managedObjectClassName = NSStringFromClass(NSManagedObject.self)
        entity.properties = [
            attribute("id", .stringAttributeType),
            attribute("checkpointId", .stringAttributeType),
            attribute("loopId", .stringAttributeType),
            attribute("phase", .stringAttributeType),
            attribute("title", .stringAttributeType),
            attribute("summary", .stringAttributeType),
            attribute("evidencePath", .stringAttributeType),
            attribute("qualityGates", .stringAttributeType),
            attribute("status", .stringAttributeType),
            attribute("recordedAt", .stringAttributeType)
        ]

        let model = NSManagedObjectModel()
        model.entities = [entity]
        return model
    }

    private static func attribute(_ name: String, _ type: NSAttributeType) -> NSAttributeDescription {
        let attribute = NSAttributeDescription()
        attribute.name = name
        attribute.attributeType = type
        attribute.isOptional = false
        return attribute
    }

    private static func loadPersistentStores(for container: NSPersistentContainer) throws {
        let semaphore = DispatchSemaphore(value: 0)
        var loadResult: Result<Void, Error>?
        container.loadPersistentStores { _, error in
            if let error {
                loadResult = .failure(error)
            } else {
                loadResult = .success(())
            }
            semaphore.signal()
        }
        semaphore.wait()
        try loadResult?.get()
    }

    private static func defaultStoreURL() -> URL {
        let baseURL = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSTemporaryDirectory())
        return baseURL
            .appending(path: "SEIS", directoryHint: .isDirectory)
            .appending(path: "AGIMemoryPlanning.sqlite")
    }
}
#endif
