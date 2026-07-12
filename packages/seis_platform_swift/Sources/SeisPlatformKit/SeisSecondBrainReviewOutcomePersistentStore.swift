import Foundation

public enum SeisSecondBrainReviewOutcomePersistenceError: Error, Equatable, Sendable {
    case invalidRecord
}

#if canImport(CoreData)
import CoreData

public final class SeisSecondBrainReviewOutcomePersistentStore {
    nonisolated public static let containerName = "SEISSecondBrainReviewOutcomes"
    nonisolated public static let entityName = "SEISSecondBrainReviewOutcomeRecord"

    private let container: NSPersistentContainer

    public init(storeURL: URL? = nil, inMemory: Bool = false) throws {
        let model = Self.makeManagedObjectModel()
        container = NSPersistentContainer(name: Self.containerName, managedObjectModel: model)

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
    public func save(_ record: SeisSecondBrainReviewOutcomeRecord) throws -> SeisSecondBrainReviewOutcomeRecord {
        guard record.isTraceable else {
            throw SeisSecondBrainReviewOutcomePersistenceError.invalidRecord
        }

        let context = container.viewContext
        var saveError: Error?
        context.performAndWait {
            do {
                let object = try Self.object(for: record.id, in: context)
                    ?? NSEntityDescription.insertNewObject(forEntityName: Self.entityName, into: context)
                object.setValue(record.id, forKey: "id")
                object.setValue(record.assignmentId, forKey: "assignmentId")
                object.setValue(record.agentRole, forKey: "agentRole")
                object.setValue(record.pluginLaneId, forKey: "pluginLaneId")
                object.setValue(record.brief, forKey: "brief")
                object.setValue(record.outcome.rawValue, forKey: "outcome")
                object.setValue(record.requiresHumanApproval, forKey: "requiresHumanApproval")
                object.setValue(record.externalActionAllowed, forKey: "externalActionAllowed")
                object.setValue(record.agentExecutionAllowed, forKey: "agentExecutionAllowed")
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

    public func fetch(limit: Int = 100) throws -> [SeisSecondBrainReviewOutcomeRecord] {
        let context = container.viewContext
        var fetchResult: Result<[SeisSecondBrainReviewOutcomeRecord], Error>?

        context.performAndWait {
            do {
                let request = NSFetchRequest<NSManagedObject>(entityName: Self.entityName)
                request.fetchLimit = max(1, limit)
                request.sortDescriptors = [
                    NSSortDescriptor(key: "recordedAt", ascending: true),
                    NSSortDescriptor(key: "id", ascending: true)
                ]
                let objects = try context.fetch(request)
                fetchResult = .success(objects.compactMap(Self.record(from:)))
            } catch {
                fetchResult = .failure(error)
            }
        }

        return try fetchResult?.get() ?? []
    }

    public func snapshot(limit: Int = 100) throws -> SeisSecondBrainReviewOutcomeSnapshot {
        SeisSecondBrainReviewOutcomeSnapshot(records: try fetch(limit: limit))
    }

    nonisolated public static var expectedSourceTokens: [String] {
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
            "shouldInferMappingModelAutomatically",
            "invalidRecord",
            "externalActionAllowed",
            "agentExecutionAllowed"
        ]
    }

    nonisolated private static func object(for id: String, in context: NSManagedObjectContext) throws -> NSManagedObject? {
        let request = NSFetchRequest<NSManagedObject>(entityName: entityName)
        request.predicate = NSPredicate(format: "id == %@", id)
        request.fetchLimit = 1
        return try context.fetch(request).first
    }

    nonisolated private static func record(from object: NSManagedObject) -> SeisSecondBrainReviewOutcomeRecord? {
        guard
            let id = object.value(forKey: "id") as? String,
            let assignmentId = object.value(forKey: "assignmentId") as? String,
            let agentRole = object.value(forKey: "agentRole") as? String,
            let pluginLaneId = object.value(forKey: "pluginLaneId") as? String,
            let brief = object.value(forKey: "brief") as? String,
            let outcomeRawValue = object.value(forKey: "outcome") as? String,
            let outcome = SeisSecondBrainReviewOutcome(rawValue: outcomeRawValue),
            let recordedAt = object.value(forKey: "recordedAt") as? String
        else {
            return nil
        }

        return SeisSecondBrainReviewOutcomeRecord(
            id: id,
            assignmentId: assignmentId,
            agentRole: agentRole,
            pluginLaneId: pluginLaneId,
            brief: brief,
            outcome: outcome,
            requiresHumanApproval: boolValue(object, forKey: "requiresHumanApproval"),
            externalActionAllowed: boolValue(object, forKey: "externalActionAllowed"),
            agentExecutionAllowed: boolValue(object, forKey: "agentExecutionAllowed"),
            recordedAt: recordedAt
        )
    }

    nonisolated private static func boolValue(_ object: NSManagedObject, forKey key: String) -> Bool {
        (object.value(forKey: key) as? NSNumber)?.boolValue ?? false
    }

    private static func makeManagedObjectModel() -> NSManagedObjectModel {
        let entity = NSEntityDescription()
        entity.name = entityName
        entity.managedObjectClassName = NSStringFromClass(NSManagedObject.self)
        entity.properties = [
            attribute("id", .stringAttributeType),
            attribute("assignmentId", .stringAttributeType),
            attribute("agentRole", .stringAttributeType),
            attribute("pluginLaneId", .stringAttributeType),
            attribute("brief", .stringAttributeType),
            attribute("outcome", .stringAttributeType),
            attribute("requiresHumanApproval", .booleanAttributeType, defaultValue: true),
            attribute("externalActionAllowed", .booleanAttributeType, defaultValue: false),
            attribute("agentExecutionAllowed", .booleanAttributeType, defaultValue: false),
            attribute("recordedAt", .stringAttributeType)
        ]

        let model = NSManagedObjectModel()
        model.entities = [entity]
        return model
    }

    private static func attribute(_ name: String, _ type: NSAttributeType, defaultValue: Any? = nil) -> NSAttributeDescription {
        let attribute = NSAttributeDescription()
        attribute.name = name
        attribute.attributeType = type
        attribute.isOptional = false
        attribute.defaultValue = defaultValue
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
            .appending(path: "SecondBrainReviewOutcomes.sqlite")
    }
}
#endif
