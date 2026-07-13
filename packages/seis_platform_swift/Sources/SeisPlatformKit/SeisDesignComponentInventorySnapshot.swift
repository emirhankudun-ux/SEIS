import Foundation

public struct SeisDesignComponentInventoryRecord: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let surface: String
    public let status: String
    public let sourceFiles: [String]
    public let selectors: [String]
    public let accessibility: String
    public let motionPolicy: String
    public let validationCommands: [String]

    public var isComplete: Bool {
        ![id, surface, status, accessibility, motionPolicy]
            .contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) &&
            !sourceFiles.isEmpty && !selectors.isEmpty && !validationCommands.isEmpty
    }

    public var isMetadataOnly: Bool {
        isComplete && sourceFiles.allSatisfy { !$0.hasPrefix("/") && !$0.contains("..") }
    }
}

public enum SeisDesignComponentInventorySnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisDesignComponentInventorySnapshot: Codable, Equatable, Sendable {
    public let schemaVersion: Int
    public let id: String
    public let updated: String
    public let mode: String
    public let statusVocabulary: [String]
    public let components: [SeisDesignComponentInventoryRecord]

    public init(
        schemaVersion: Int,
        id: String,
        updated: String,
        mode: String,
        statusVocabulary: [String],
        components: [SeisDesignComponentInventoryRecord]
    ) {
        self.schemaVersion = schemaVersion
        self.id = id
        self.updated = updated
        self.mode = mode
        self.statusVocabulary = statusVocabulary
        self.components = components
    }

    public static func validated(from data: Data) throws -> SeisDesignComponentInventorySnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisDesignComponentInventorySnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisDesignComponentInventorySnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let expectedStatuses = ["documented", "scaffolded", "validated", "needs-browser-qa", "blocked"]

        if schemaVersion != 1 || id != "seis-design-component-inventory" || mode != "static_design_system_inventory" { issues.append("design component inventory identity is invalid") }
        if updated.isEmpty || statusVocabulary != expectedStatuses { issues.append("design component inventory status vocabulary is invalid") }
        if components.count != 12 { issues.append("design component inventory must contain twelve components") }
        if Set(components.map(\.id).filter({ !$0.isEmpty }).count) != components.count { issues.append("design component inventory ids must be unique") }
        if components.filter({ $0.status == "validated" }).count != 12 { issues.append("design component inventory must keep all twelve current components validated") }
        if !components.allSatisfy({ $0.isComplete && $0.isMetadataOnly }) { issues.append("design component inventory components must be complete and repository-relative") }
        return issues
    }

    public var surfaceIDs: [String] { Array(Set(components.map(\.surface))).sorted() }
    public var validatedComponentCount: Int { components.filter { $0.status == "validated" }.count }
    public var selectorCount: Int { components.reduce(0) { $0 + $1.selectors.count } }
    public var isMetadataOnly: Bool { validationIssues.isEmpty }
}
