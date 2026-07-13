import Foundation

public struct SeisDataSchemaRegistryRecord: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let path: String
    public let lane: String
    public let currentStatus: String
    public let sourceType: String
    public let expectedShape: String
    public let requiredTopLevelKeys: [String]
    public let validationCommands: [String]
    public let freshness: String
    public let secretPolicy: String

    public var isComplete: Bool {
        ![id, path, lane, currentStatus, sourceType, expectedShape, freshness, secretPolicy]
            .contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) &&
            !requiredTopLevelKeys.isEmpty &&
            !validationCommands.isEmpty
    }

    public var isMetadataOnly: Bool {
        isComplete &&
            (lane == "@seis" || lane == "@seis-cloud" || lane == "@seis-code" || lane == "@seis-design" || lane == "@seis-data") &&
            (secretPolicy.localizedCaseInsensitiveContains("secret") ||
                secretPolicy.localizedCaseInsensitiveContains("credential"))
    }
}

public enum SeisDataSchemaRegistrySnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisDataSchemaRegistrySnapshot: Codable, Equatable, Sendable {
    public let schemaVersion: Int
    public let id: String
    public let updated: String
    public let mode: String
    public let statusVocabulary: [String]
    public let records: [SeisDataSchemaRegistryRecord]

    public init(
        schemaVersion: Int,
        id: String,
        updated: String,
        mode: String,
        statusVocabulary: [String],
        records: [SeisDataSchemaRegistryRecord]
    ) {
        self.schemaVersion = schemaVersion
        self.id = id
        self.updated = updated
        self.mode = mode
        self.statusVocabulary = statusVocabulary
        self.records = records
    }

    public static func validated(from data: Data) throws -> SeisDataSchemaRegistrySnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisDataSchemaRegistrySnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisDataSchemaRegistrySnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let expectedStatuses = ["documented", "scaffolded", "validated", "blocked", "planned"]
        let expectedLanes: Set<String> = ["@seis", "@seis-cloud", "@seis-code", "@seis-design", "@seis-data"]
        let expectedShapes: Set<String> = ["object", "array", "text"]

        if schemaVersion != 1 || id != "seis-data-schema-registry" || mode != "static_repository_data_contract" { issues.append("data schema registry identity is invalid") }
        if updated.isEmpty || statusVocabulary != expectedStatuses { issues.append("data schema registry status vocabulary is invalid") }
        if records.count != 18 { issues.append("data schema registry must contain eighteen records") }
        if Set(records.map(\.id).filter({ !$0.isEmpty }).count) != records.count { issues.append("data schema registry record ids must be unique") }
        if Set(records.map(\.lane)) != expectedLanes { issues.append("data schema registry must cover all five SEIS lanes") }
        if records.filter({ $0.currentStatus == "validated" }).count != 16 || records.filter({ $0.currentStatus == "scaffolded" }).count != 2 { issues.append("data schema registry status counts are invalid") }
        if !records.allSatisfy({ $0.isComplete && expectedShapes.contains($0.expectedShape) && $0.isMetadataOnly }) { issues.append("data schema registry records must be complete, shaped, and secret-free") }
        return issues
    }

    public var laneIDs: [String] { Array(Set(records.map(\.lane))).sorted() }
    public var validatedRecordCount: Int { records.filter { $0.currentStatus == "validated" }.count }
    public var scaffoldedRecordCount: Int { records.filter { $0.currentStatus == "scaffolded" }.count }
    public var isMetadataOnly: Bool { validationIssues.isEmpty }
}
