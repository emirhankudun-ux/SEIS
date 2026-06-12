import Foundation

public enum SeisAGIResearchSourceKind: String, Codable, Equatable, Sendable {
    case localRepository
    case generatedReport
    case officialDocumentation
    case userProvidedReference
}

public struct SeisAGIResearchSourceManifestItem: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let sourcePath: String
    public let sourceKind: SeisAGIResearchSourceKind
    public let selectedByContext: Bool
    public let requiresFreshnessCheck: Bool
    public let containsSecrets: Bool
    public let qualityGates: [String]

    public init(
        id: String,
        title: String,
        sourcePath: String,
        sourceKind: SeisAGIResearchSourceKind,
        selectedByContext: Bool,
        requiresFreshnessCheck: Bool,
        containsSecrets: Bool,
        qualityGates: [String]
    ) {
        self.id = id
        self.title = title
        self.sourcePath = sourcePath
        self.sourceKind = sourceKind
        self.selectedByContext = selectedByContext
        self.requiresFreshnessCheck = requiresFreshnessCheck
        self.containsSecrets = containsSecrets
        self.qualityGates = qualityGates
    }

    public var isUsable: Bool {
        !id.isEmpty &&
            !title.isEmpty &&
            !sourcePath.isEmpty &&
            !containsSecrets &&
            qualityGates.contains("citation-trace") &&
            qualityGates.contains("claim-boundary")
    }
}

public struct SeisAGIResearchAutomationPlan: Codable, Equatable, Sendable {
    public let researcherAssignmentId: String
    public let outputArtifact: String
    public let selectedSources: [SeisAGIResearchSourceManifestItem]
    public let deferredSources: [SeisAGIResearchSourceManifestItem]
    public let qualityGates: [String]
    public let primarySourcePolicy: String
    public let redactionPolicy: String
    public let claimBoundary: String

    public init(
        researcherAssignmentId: String,
        outputArtifact: String,
        selectedSources: [SeisAGIResearchSourceManifestItem],
        deferredSources: [SeisAGIResearchSourceManifestItem],
        qualityGates: [String],
        primarySourcePolicy: String,
        redactionPolicy: String,
        claimBoundary: String
    ) {
        self.researcherAssignmentId = researcherAssignmentId
        self.outputArtifact = outputArtifact
        self.selectedSources = selectedSources
        self.deferredSources = deferredSources
        self.qualityGates = qualityGates
        self.primarySourcePolicy = primarySourcePolicy
        self.redactionPolicy = redactionPolicy
        self.claimBoundary = claimBoundary
    }

    public var isReady: Bool {
        researcherAssignmentId == "research-synthesizer" &&
            outputArtifact == "source manifest" &&
            selectedSources.contains { $0.id == "research-evidence" } &&
            selectedSources.allSatisfy(\.isUsable) &&
            qualityGates.contains("primary-source-first") &&
            qualityGates.contains("citation-trace") &&
            qualityGates.contains("claim-boundary") &&
            qualityGates.contains("no-fake-usage") &&
            primarySourcePolicy.contains("official documentation") &&
            redactionPolicy.contains("never include secrets") &&
            claimBoundary.contains("does not claim autonomous general intelligence")
    }

    public var allSources: [SeisAGIResearchSourceManifestItem] {
        selectedSources + deferredSources
    }

    public var selectedSourceCount: Int {
        selectedSources.count
    }

    public var deferredSourceCount: Int {
        deferredSources.count
    }

    public var usableSelectedSourceCount: Int {
        selectedSources.filter(\.isUsable).count
    }

    public var freshnessCheckCount: Int {
        allSources.filter(\.requiresFreshnessCheck).count
    }

    public var statusLabel: String {
        "\(usableSelectedSourceCount)/\(selectedSourceCount) selected sources usable"
    }

    public var sourceBalanceLabel: String {
        "\(selectedSourceCount) selected / \(deferredSourceCount) deferred"
    }

    public var freshnessStatusLabel: String {
        "\(freshnessCheckCount) freshness checks"
    }

    public var redactionStatusLabel: String {
        redactionPolicy.contains("never include secrets") ? "secret-safe manifest only" : "redaction review required"
    }

    public static func current(
        contract: SeisAGISystemContract = .master,
        recordedAt: String = "2026-06-12T00:00:00Z"
    ) -> SeisAGIResearchAutomationPlan {
        let memory = SeisAGIMemoryPlanningSnapshot.bootstrap(
            from: contract.memoryPlanning,
            recordedAt: recordedAt
        )
        let orchestration = SeisAGIAgentOrchestrationRuntime().makePlan(
            contract: contract,
            memorySnapshot: memory
        )
        return SeisAGIResearchAutomationRuntime().makePlan(
            contract: contract,
            memorySnapshot: memory,
            orchestrationPlan: orchestration
        )
    }

    public static var expectedDiagnosticsViewTokens: [String] {
        [
            "Research Automation Status",
            "researchAutomationPlan.statusLabel",
            "researchAutomationPlan.sourceBalanceLabel",
            "freshnessStatusLabel",
            "redactionStatusLabel",
            "selectedSources",
            "requiresFreshnessCheck",
            "sourceKind"
        ]
    }
}

public struct SeisAGIResearchAutomationRuntime: Codable, Equatable, Sendable {
    public let qualityGates: [String]
    public let primarySourcePolicy: String
    public let redactionPolicy: String

    public init(
        qualityGates: [String] = [
            "primary-source-first",
            "version-compatibility",
            "citation-trace",
            "claim-boundary",
            "no-fake-usage",
            "secret-safety"
        ],
        primarySourcePolicy: String = "Prefer local repository evidence first; verify unstable external claims through official documentation before architecture decisions.",
        redactionPolicy: String = "Build source manifests only from paths and summaries; never include secrets, tokens, credentials, or private connector payloads."
    ) {
        self.qualityGates = qualityGates
        self.primarySourcePolicy = primarySourcePolicy
        self.redactionPolicy = redactionPolicy
    }

    public func makePlan(
        contract: SeisAGISystemContract,
        memorySnapshot: SeisAGIMemoryPlanningSnapshot,
        orchestrationPlan: SeisAGIAgentOrchestrationPlan
    ) -> SeisAGIResearchAutomationPlan {
        let researcherAssignment = orchestrationPlan.assignments.first { $0.role == .researcher }
        let selectedContextIds = Set(researcherAssignment?.selectedContextIds ?? [])
        let researchSourceIds = Set(memorySnapshot.records.filter { $0.phase == "research" }.map(\.checkpointId))
        let selectedIds = selectedContextIds.union(researchSourceIds)
        let manifestItems = Self.manifestItems(from: memorySnapshot.records, selectedIds: selectedIds)
        let selected = manifestItems.filter { selectedIds.contains($0.id) }
        let deferred = manifestItems.filter { !selectedIds.contains($0.id) }
        let subsystemGates = contract.subsystems.first { $0.id == "research-automation" }?.qualityGates ?? []
        let assignmentGates = researcherAssignment?.qualityGates ?? []

        return SeisAGIResearchAutomationPlan(
            researcherAssignmentId: researcherAssignment?.id ?? "missing-researcher",
            outputArtifact: researcherAssignment?.outputArtifact ?? "missing-source-manifest",
            selectedSources: selected,
            deferredSources: deferred,
            qualityGates: Array(Set(qualityGates + subsystemGates + assignmentGates)).sorted(),
            primarySourcePolicy: primarySourcePolicy,
            redactionPolicy: redactionPolicy,
            claimBoundary: contract.claimBoundary
        )
    }

    public static func manifestItems(
        from records: [SeisAGIMemoryPlanningRecord],
        selectedIds: Set<String>
    ) -> [SeisAGIResearchSourceManifestItem] {
        records.map { record in
            SeisAGIResearchSourceManifestItem(
                id: record.checkpointId,
                title: record.title,
                sourcePath: record.evidencePath,
                sourceKind: sourceKind(for: record.evidencePath),
                selectedByContext: selectedIds.contains(record.checkpointId),
                requiresFreshnessCheck: record.qualityGates.contains("version-compatibility"),
                containsSecrets: false,
                qualityGates: Array(Set(record.qualityGates + ["citation-trace", "claim-boundary"])).sorted()
            )
        }
    }

    public static var expectedSourceTokens: [String] {
        [
            "SeisAGIResearchAutomationRuntime",
            "SeisAGIResearchAutomationPlan",
            "SeisAGIResearchSourceManifestItem",
            "allSources",
            "primary-source-first",
            "official documentation",
            "citation-trace",
            "claim-boundary",
            "no-fake-usage",
            "never include secrets",
            "research-synthesizer",
            "source manifest",
            "Core Data"
        ]
    }

    private static func sourceKind(for evidencePath: String) -> SeisAGIResearchSourceKind {
        if evidencePath.hasPrefix("reports/") {
            return .generatedReport
        }
        if evidencePath.hasPrefix("content/development/seis-agi-reference-assets/") {
            return .userProvidedReference
        }
        if evidencePath.hasPrefix("https://developer.apple.com/") ||
            evidencePath.hasPrefix("https://docs.github.com/") {
            return .officialDocumentation
        }
        return .localRepository
    }
}

public final class SeisAGIResearchManifestHistoryStore: @unchecked Sendable {
    private let lock = NSLock()
    private var itemsById: [String: SeisAGIResearchSourceManifestItem] = [:]

    public init(items: [SeisAGIResearchSourceManifestItem] = []) {
        for item in items {
            itemsById[item.id] = item
        }
    }

    @discardableResult
    public func save(_ item: SeisAGIResearchSourceManifestItem) -> SeisAGIResearchSourceManifestItem {
        lock.lock()
        defer { lock.unlock() }
        itemsById[item.id] = item
        return item
    }

    public func snapshot() -> [SeisAGIResearchSourceManifestItem] {
        lock.lock()
        defer { lock.unlock() }
        return Self.sorted(itemsById.values)
    }

    private static func sorted(
        _ items: Dictionary<String, SeisAGIResearchSourceManifestItem>.Values
    ) -> [SeisAGIResearchSourceManifestItem] {
        items.sorted { lhs, rhs in
            if lhs.selectedByContext == rhs.selectedByContext {
                return lhs.id < rhs.id
            }
            return lhs.selectedByContext && !rhs.selectedByContext
        }
    }
}

#if canImport(CoreData)
import CoreData

public final class SeisAGIResearchManifestPersistentStore {
    public static let containerName = "SEISAGIResearchManifest"
    public static let entityName = "SEISAGIResearchSourceManifestItem"
    public static let storagePolicy = "Core Data local research source manifest records, optional CloudKit metadata sync, and never persist secrets."

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
    public func save(
        _ item: SeisAGIResearchSourceManifestItem
    ) throws -> SeisAGIResearchSourceManifestItem {
        let context = container.viewContext
        var saveError: Error?

        context.performAndWait {
            do {
                let object = try Self.object(for: item.id, in: context)
                    ?? NSEntityDescription.insertNewObject(forEntityName: Self.entityName, into: context)
                object.setValue(item.id, forKey: "id")
                object.setValue(item.title, forKey: "title")
                object.setValue(item.sourcePath, forKey: "sourcePath")
                object.setValue(item.sourceKind.rawValue, forKey: "sourceKind")
                object.setValue(item.selectedByContext, forKey: "selectedByContext")
                object.setValue(item.requiresFreshnessCheck, forKey: "requiresFreshnessCheck")
                object.setValue(item.containsSecrets, forKey: "containsSecrets")
                object.setValue(item.qualityGates.joined(separator: "\n"), forKey: "qualityGates")

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
        return item
    }

    public func fetch(limit: Int) throws -> [SeisAGIResearchSourceManifestItem] {
        let context = container.viewContext
        var fetchResult: Result<[SeisAGIResearchSourceManifestItem], Error>?

        context.performAndWait {
            do {
                let request = NSFetchRequest<NSManagedObject>(entityName: Self.entityName)
                request.fetchLimit = max(1, limit)
                request.sortDescriptors = [
                    NSSortDescriptor(key: "selectedByContext", ascending: false),
                    NSSortDescriptor(key: "id", ascending: true)
                ]
                let objects = try context.fetch(request)
                fetchResult = .success(objects.compactMap(Self.item(from:)))
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
            "Core Data local research source manifest records",
            "CloudKit",
            "never persist secrets"
        ]
    }

    private static func object(for id: String, in context: NSManagedObjectContext) throws -> NSManagedObject? {
        let request = NSFetchRequest<NSManagedObject>(entityName: entityName)
        request.predicate = NSPredicate(format: "id == %@", id)
        request.fetchLimit = 1
        return try context.fetch(request).first
    }

    private static func item(from object: NSManagedObject) -> SeisAGIResearchSourceManifestItem? {
        guard
            let id = object.value(forKey: "id") as? String,
            let title = object.value(forKey: "title") as? String,
            let sourcePath = object.value(forKey: "sourcePath") as? String,
            let sourceKindRawValue = object.value(forKey: "sourceKind") as? String,
            let sourceKind = SeisAGIResearchSourceKind(rawValue: sourceKindRawValue),
            let qualityGates = object.value(forKey: "qualityGates") as? String
        else {
            return nil
        }

        return SeisAGIResearchSourceManifestItem(
            id: id,
            title: title,
            sourcePath: sourcePath,
            sourceKind: sourceKind,
            selectedByContext: object.value(forKey: "selectedByContext") as? Bool ?? false,
            requiresFreshnessCheck: object.value(forKey: "requiresFreshnessCheck") as? Bool ?? false,
            containsSecrets: object.value(forKey: "containsSecrets") as? Bool ?? false,
            qualityGates: qualityGates.split(separator: "\n").map(String.init)
        )
    }

    private static func makeManagedObjectModel() -> NSManagedObjectModel {
        let entity = NSEntityDescription()
        entity.name = entityName
        entity.managedObjectClassName = NSStringFromClass(NSManagedObject.self)
        entity.properties = [
            attribute("id", .stringAttributeType),
            attribute("title", .stringAttributeType),
            attribute("sourcePath", .stringAttributeType),
            attribute("sourceKind", .stringAttributeType),
            attribute("selectedByContext", .booleanAttributeType),
            attribute("requiresFreshnessCheck", .booleanAttributeType),
            attribute("containsSecrets", .booleanAttributeType),
            attribute("qualityGates", .stringAttributeType)
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
            .appending(path: "AGIResearchManifest.sqlite")
    }
}
#endif
