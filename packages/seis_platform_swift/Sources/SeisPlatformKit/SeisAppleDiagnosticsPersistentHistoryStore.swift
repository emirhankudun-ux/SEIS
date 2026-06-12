import Foundation

#if canImport(CoreData)
import CoreData

public final class SeisAppleDiagnosticsPersistentHistoryStore: SeisAppleDiagnosticsHistoryPersisting {
    public static let containerName = "SEISDiagnosticsHistory"
    public static let entityName = "SEISDiagnosticsHistorySnapshot"

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
    public func save(_ snapshot: SeisAppleShellDiagnosticsHistorySnapshot) throws -> SeisAppleShellDiagnosticsHistorySnapshot {
        let context = container.viewContext
        var saveError: Error?

        context.performAndWait {
            do {
                let object = try Self.object(for: snapshot.id, in: context)
                    ?? NSEntityDescription.insertNewObject(forEntityName: Self.entityName, into: context)
                object.setValue(snapshot.id, forKey: "id")
                object.setValue(snapshot.source, forKey: "source")
                object.setValue(snapshot.recordedAt, forKey: "recordedAt")
                object.setValue(snapshot.readyCount, forKey: "readyCount")
                object.setValue(snapshot.checkCount, forKey: "checkCount")
                object.setValue(snapshot.qualityGateCount, forKey: "qualityGateCount")
                object.setValue(snapshot.runtimeReadyCount, forKey: "runtimeReadyCount")
                object.setValue(snapshot.runtimeProbeCount, forKey: "runtimeProbeCount")
                object.setValue(snapshot.persistenceReadyCount, forKey: "persistenceReadyCount")
                object.setValue(snapshot.persistenceCheckCount, forKey: "persistenceCheckCount")
                object.setValue(snapshot.agentHandoffReadyCount, forKey: "agentHandoffReadyCount")
                object.setValue(snapshot.agentHandoffCheckCount, forKey: "agentHandoffCheckCount")
                object.setValue(snapshot.agentHandoffWriterCount, forKey: "agentHandoffWriterCount")
                object.setValue(snapshot.agentHandoffStatusLabel, forKey: "agentHandoffStatusLabel")

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
        return snapshot
    }

    public func fetch(limit: Int) throws -> [SeisAppleShellDiagnosticsHistorySnapshot] {
        let context = container.viewContext
        var fetchResult: Result<[SeisAppleShellDiagnosticsHistorySnapshot], Error>?

        context.performAndWait {
            do {
                let request = NSFetchRequest<NSManagedObject>(entityName: Self.entityName)
                request.fetchLimit = max(1, limit)
                request.sortDescriptors = [NSSortDescriptor(key: "recordedAt", ascending: false)]
                let objects = try context.fetch(request)
                fetchResult = .success(objects.compactMap(Self.snapshot(from:)))
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
            "shouldInferMappingModelAutomatically",
            "agentHandoffWriterCount",
            "agentHandoffStatusLabel",
            "defaultValue"
        ]
    }

    private static func object(for id: String, in context: NSManagedObjectContext) throws -> NSManagedObject? {
        let request = NSFetchRequest<NSManagedObject>(entityName: entityName)
        request.predicate = NSPredicate(format: "id == %@", id)
        request.fetchLimit = 1
        return try context.fetch(request).first
    }

    private static func snapshot(from object: NSManagedObject) -> SeisAppleShellDiagnosticsHistorySnapshot? {
        guard
            let id = object.value(forKey: "id") as? String,
            let source = object.value(forKey: "source") as? String,
            let recordedAt = object.value(forKey: "recordedAt") as? String
        else {
            return nil
        }

        return SeisAppleShellDiagnosticsHistorySnapshot(
            id: id,
            source: source,
            recordedAt: recordedAt,
            readyCount: intValue(object, forKey: "readyCount"),
            checkCount: intValue(object, forKey: "checkCount"),
            qualityGateCount: intValue(object, forKey: "qualityGateCount"),
            runtimeReadyCount: intValue(object, forKey: "runtimeReadyCount"),
            runtimeProbeCount: intValue(object, forKey: "runtimeProbeCount"),
            persistenceReadyCount: intValue(object, forKey: "persistenceReadyCount"),
            persistenceCheckCount: intValue(object, forKey: "persistenceCheckCount"),
            agentHandoffReadyCount: intValue(object, forKey: "agentHandoffReadyCount"),
            agentHandoffCheckCount: intValue(object, forKey: "agentHandoffCheckCount"),
            agentHandoffWriterCount: intValue(object, forKey: "agentHandoffWriterCount"),
            agentHandoffStatusLabel: stringValue(object, forKey: "agentHandoffStatusLabel")
        )
    }

    private static func intValue(_ object: NSManagedObject, forKey key: String) -> Int {
        (object.value(forKey: key) as? NSNumber)?.intValue ?? 0
    }

    private static func stringValue(_ object: NSManagedObject, forKey key: String) -> String {
        object.value(forKey: key) as? String ?? ""
    }

    private static func makeManagedObjectModel() -> NSManagedObjectModel {
        let entity = NSEntityDescription()
        entity.name = entityName
        entity.managedObjectClassName = NSStringFromClass(NSManagedObject.self)
        entity.properties = [
            attribute("id", .stringAttributeType),
            attribute("source", .stringAttributeType),
            attribute("recordedAt", .stringAttributeType),
            attribute("readyCount", .integer64AttributeType),
            attribute("checkCount", .integer64AttributeType),
            attribute("qualityGateCount", .integer64AttributeType),
            attribute("runtimeReadyCount", .integer64AttributeType),
            attribute("runtimeProbeCount", .integer64AttributeType),
            attribute("persistenceReadyCount", .integer64AttributeType),
            attribute("persistenceCheckCount", .integer64AttributeType),
            attribute("agentHandoffReadyCount", .integer64AttributeType, defaultValue: 0),
            attribute("agentHandoffCheckCount", .integer64AttributeType, defaultValue: 1),
            attribute("agentHandoffWriterCount", .integer64AttributeType, defaultValue: 0),
            attribute("agentHandoffStatusLabel", .stringAttributeType, defaultValue: "")
        ]

        let model = NSManagedObjectModel()
        model.entities = [entity]
        return model
    }

    private static func attribute(
        _ name: String,
        _ type: NSAttributeType,
        defaultValue: Any? = nil
    ) -> NSAttributeDescription {
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
            .appending(path: "DiagnosticsHistory.sqlite")
    }
}
#endif
