import Foundation

public enum SeisAGIAgentHandoffStatus: String, Codable, Equatable, Sendable {
    case drafted
    case active
    case reviewed
    case blocked
}

public struct SeisAGIAgentHandoffRecord: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let assignmentId: String
    public let role: SeisAGIAgentRole
    public let subsystemId: String
    public let pluginLaneId: String
    public let activationMode: String
    public let selectedContextIds: [String]
    public let deferredContextIds: [String]
    public let outputArtifact: String
    public let qualityGates: [String]
    public let writeAllowed: Bool
    public let requiresHumanApproval: Bool
    public let status: SeisAGIAgentHandoffStatus
    public let recordedAt: String

    public init(
        id: String,
        assignmentId: String,
        role: SeisAGIAgentRole,
        subsystemId: String,
        pluginLaneId: String,
        activationMode: String,
        selectedContextIds: [String],
        deferredContextIds: [String],
        outputArtifact: String,
        qualityGates: [String],
        writeAllowed: Bool,
        requiresHumanApproval: Bool,
        status: SeisAGIAgentHandoffStatus,
        recordedAt: String
    ) {
        self.id = id
        self.assignmentId = assignmentId
        self.role = role
        self.subsystemId = subsystemId
        self.pluginLaneId = pluginLaneId
        self.activationMode = activationMode
        self.selectedContextIds = selectedContextIds
        self.deferredContextIds = deferredContextIds
        self.outputArtifact = outputArtifact
        self.qualityGates = qualityGates
        self.writeAllowed = writeAllowed
        self.requiresHumanApproval = requiresHumanApproval
        self.status = status
        self.recordedAt = recordedAt
    }

    public var isTraceable: Bool {
        !id.isEmpty &&
            !assignmentId.isEmpty &&
            !subsystemId.isEmpty &&
            !pluginLaneId.isEmpty &&
            activationMode.contains("candidate") &&
            !selectedContextIds.isEmpty &&
            !outputArtifact.isEmpty &&
            qualityGates.contains("no-fake-usage") &&
            requiresHumanApproval
    }
}

public struct SeisAGIAgentHandoffSnapshot: Codable, Equatable, Sendable {
    public static let storagePolicy = "Core Data local agent handoff records, optional CloudKit metadata sync, and never persist secrets."

    public let records: [SeisAGIAgentHandoffRecord]

    public init(records: [SeisAGIAgentHandoffRecord]) {
        self.records = records
    }

    public var writerCount: Int {
        records.filter(\.writeAllowed).count
    }

    public var roleSet: Set<SeisAGIAgentRole> {
        Set(records.map(\.role))
    }

    public var isReady: Bool {
        records.count >= 4 &&
            records.allSatisfy(\.isTraceable) &&
            writerCount == 1 &&
            roleSet.isSuperset(of: [.writer, .reviewer, .researcher, .designer]) &&
            records.contains { $0.assignmentId == "codex-writer" && $0.writeAllowed } &&
            records.contains { $0.assignmentId == "reviewer-sentinel" && !$0.writeAllowed } &&
            records.contains { $0.pluginLaneId == "data-read-write" } &&
            records.contains { $0.pluginLaneId == "design-interactive" }
    }

    public static func bootstrap(
        from plan: SeisAGIAgentOrchestrationPlan,
        recordedAt: String = "2026-06-12T00:00:00Z"
    ) -> SeisAGIAgentHandoffSnapshot {
        let records = plan.assignments.map { assignment in
            SeisAGIAgentHandoffRecord(
                id: "\(assignment.id)-handoff",
                assignmentId: assignment.id,
                role: assignment.role,
                subsystemId: assignment.subsystemId,
                pluginLaneId: assignment.pluginLaneId,
                activationMode: assignment.activationMode,
                selectedContextIds: assignment.selectedContextIds,
                deferredContextIds: assignment.deferredContextIds,
                outputArtifact: assignment.outputArtifact,
                qualityGates: assignment.qualityGates,
                writeAllowed: assignment.writeAllowed,
                requiresHumanApproval: assignment.requiresHumanApproval,
                status: .drafted,
                recordedAt: recordedAt
            )
        }
        return SeisAGIAgentHandoffSnapshot(records: records)
    }

    public static var expectedSourceTokens: [String] {
        [
            "SeisAGIAgentHandoffRecord",
            "SeisAGIAgentHandoffSnapshot",
            "bootstrap(",
            "Core Data",
            "CloudKit",
            "never persist secrets",
            "codex-writer",
            "reviewer-sentinel",
            "no-fake-usage"
        ]
    }
}

public final class SeisAGIAgentHandoffHistoryStore: @unchecked Sendable {
    private let lock = NSLock()
    private var recordsById: [String: SeisAGIAgentHandoffRecord] = [:]

    public init(records: [SeisAGIAgentHandoffRecord] = []) {
        for record in records {
            recordsById[record.id] = record
        }
    }

    @discardableResult
    public func save(_ record: SeisAGIAgentHandoffRecord) -> SeisAGIAgentHandoffRecord {
        lock.lock()
        defer { lock.unlock() }
        recordsById[record.id] = record
        return record
    }

    public func snapshot() -> SeisAGIAgentHandoffSnapshot {
        lock.lock()
        defer { lock.unlock() }
        return SeisAGIAgentHandoffSnapshot(records: Self.sorted(recordsById.values))
    }

    private static func sorted(_ records: Dictionary<String, SeisAGIAgentHandoffRecord>.Values) -> [SeisAGIAgentHandoffRecord] {
        records.sorted { lhs, rhs in
            if lhs.recordedAt == rhs.recordedAt {
                return lhs.id < rhs.id
            }
            return lhs.recordedAt < rhs.recordedAt
        }
    }
}

#if canImport(CoreData)
import CoreData

public final class SeisAGIAgentHandoffPersistentStore {
    public static let containerName = "SEISAGIAgentHandoff"
    public static let entityName = "SEISAGIAgentHandoffRecord"

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
    public func save(_ record: SeisAGIAgentHandoffRecord) throws -> SeisAGIAgentHandoffRecord {
        let context = container.viewContext
        var saveError: Error?

        context.performAndWait {
            do {
                let object = try Self.object(for: record.id, in: context)
                    ?? NSEntityDescription.insertNewObject(forEntityName: Self.entityName, into: context)
                object.setValue(record.id, forKey: "id")
                object.setValue(record.assignmentId, forKey: "assignmentId")
                object.setValue(record.role.rawValue, forKey: "role")
                object.setValue(record.subsystemId, forKey: "subsystemId")
                object.setValue(record.pluginLaneId, forKey: "pluginLaneId")
                object.setValue(record.activationMode, forKey: "activationMode")
                object.setValue(record.selectedContextIds.joined(separator: "\n"), forKey: "selectedContextIds")
                object.setValue(record.deferredContextIds.joined(separator: "\n"), forKey: "deferredContextIds")
                object.setValue(record.outputArtifact, forKey: "outputArtifact")
                object.setValue(record.qualityGates.joined(separator: "\n"), forKey: "qualityGates")
                object.setValue(record.writeAllowed, forKey: "writeAllowed")
                object.setValue(record.requiresHumanApproval, forKey: "requiresHumanApproval")
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

    public func fetch(limit: Int) throws -> [SeisAGIAgentHandoffRecord] {
        let context = container.viewContext
        var fetchResult: Result<[SeisAGIAgentHandoffRecord], Error>?

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

    private static func record(from object: NSManagedObject) -> SeisAGIAgentHandoffRecord? {
        guard
            let id = object.value(forKey: "id") as? String,
            let assignmentId = object.value(forKey: "assignmentId") as? String,
            let roleRawValue = object.value(forKey: "role") as? String,
            let role = SeisAGIAgentRole(rawValue: roleRawValue),
            let subsystemId = object.value(forKey: "subsystemId") as? String,
            let pluginLaneId = object.value(forKey: "pluginLaneId") as? String,
            let activationMode = object.value(forKey: "activationMode") as? String,
            let selectedContextIds = object.value(forKey: "selectedContextIds") as? String,
            let deferredContextIds = object.value(forKey: "deferredContextIds") as? String,
            let outputArtifact = object.value(forKey: "outputArtifact") as? String,
            let qualityGates = object.value(forKey: "qualityGates") as? String,
            let status = object.value(forKey: "status") as? String,
            let resolvedStatus = SeisAGIAgentHandoffStatus(rawValue: status),
            let recordedAt = object.value(forKey: "recordedAt") as? String
        else {
            return nil
        }

        return SeisAGIAgentHandoffRecord(
            id: id,
            assignmentId: assignmentId,
            role: role,
            subsystemId: subsystemId,
            pluginLaneId: pluginLaneId,
            activationMode: activationMode,
            selectedContextIds: selectedContextIds.split(separator: "\n").map(String.init),
            deferredContextIds: deferredContextIds.split(separator: "\n").map(String.init),
            outputArtifact: outputArtifact,
            qualityGates: qualityGates.split(separator: "\n").map(String.init),
            writeAllowed: object.value(forKey: "writeAllowed") as? Bool ?? false,
            requiresHumanApproval: object.value(forKey: "requiresHumanApproval") as? Bool ?? false,
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
            attribute("assignmentId", .stringAttributeType),
            attribute("role", .stringAttributeType),
            attribute("subsystemId", .stringAttributeType),
            attribute("pluginLaneId", .stringAttributeType),
            attribute("activationMode", .stringAttributeType),
            attribute("selectedContextIds", .stringAttributeType),
            attribute("deferredContextIds", .stringAttributeType),
            attribute("outputArtifact", .stringAttributeType),
            attribute("qualityGates", .stringAttributeType),
            attribute("writeAllowed", .booleanAttributeType),
            attribute("requiresHumanApproval", .booleanAttributeType),
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
            .appending(path: "AGIAgentHandoff.sqlite")
    }
}
#endif
