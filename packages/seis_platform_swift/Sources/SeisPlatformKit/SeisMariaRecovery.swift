import Foundation

/// Fixed error vocabulary: never exposes raw JSON, paths or decoder diagnostics.
public enum SeisMariaRecoveryError: String, Error, Sendable {
    case invalidPayloadSize, invalidJSON, unsupportedVersion, invalidSchema
    case invalidRow, inconsistentSummary, wrongProject
    case unreadableFile, notRegularFile
}

public enum SeisMariaRecoverySeverity: String, Sendable {
    case info, warning, critical, success
}

public enum SeisMariaRecoveryDisposition: String, CaseIterable, Sendable {
    case anchorMissing = "anchor-missing"
    case evidenceRequired = "evidence-required"
    case driftDetected = "drift-detected"
    case alignedReplanRequired = "aligned-replan-required"
    case complete

    public var severity: SeisMariaRecoverySeverity {
        switch self {
        case .anchorMissing, .evidenceRequired: .warning
        case .driftDetected: .critical
        case .alignedReplanRequired: .info
        case .complete: .success
        }
    }

    public var englishLabel: String {
        switch self {
        case .anchorMissing: "Recovery anchor missing"
        case .evidenceRequired: "Current evidence required"
        case .driftDetected: "Context drift detected"
        case .alignedReplanRequired: "Aligned; re-plan required"
        case .complete: "Complete"
        }
    }

    public var turkishLabel: String {
        switch self {
        case .anchorMissing: "Önceki bağlam kaydı eksik"
        case .evidenceRequired: "Güncel doğrulama gerekli"
        case .driftDetected: "Proje bağlamı değişmiş"
        case .alignedReplanRequired: "Bağlam uyumlu; yeniden planla"
        case .complete: "Tamamlanmış kayıt"
        }
    }
}

/// Display data only. Construction belongs to the validated decoder, not UI code.
public struct SeisMariaRecoveryRow: Equatable, Identifiable, Sendable {
    public let projectID: String
    public let workID: String
    public let disposition: SeisMariaRecoveryDisposition
    public let durableSchemaVersion: Int
    public let nextStepID: String?
    public let detailFields: [String]
    // Swift String equality normalizes canonical equivalents; Python IDs do not.
    public var id: Data { Data(workID.utf8) }
    public var replanRequired: Bool { disposition != .complete }
    public var executionAuthorized: Bool { false }
}

public struct SeisMariaRecoverySnapshot: Equatable, Sendable {
    public let wireSchemaVersion: Int
    public let projectID: String
    public let rows: [SeisMariaRecoveryRow]
    public let totalCandidates: Int
    public let replanRequired: Int
    public let driftDetected: Int
    public let evidenceRequired: Int
    public let anchorMissing: Int
    public let alignedReplanRequired: Int
    public let complete: Int
    public var executionAuthorized: Bool { false }
}

/// Reads Python wire v1 and enforces the native adapter's semantic invariants.
/// No filesystem, network, process, resume, permission or provider operations.
public enum SeisMariaRecoveryDecoder {
    public static let maximumBytes = 64 * 1024
    private static let rootFields: Set<String> = [
        "schema_version", "project_id", "rows", "total_candidates", "replan_required",
        "drift_detected", "evidence_required", "anchor_missing", "aligned_replan_required",
        "complete", "execution_authorized"
    ]
    private static let rowFields: Set<String> = [
        "project_id", "work_id", "disposition", "schema_version", "next_step_id",
        "drift_fields", "missing_context", "execution_authorized"
    ]

    public static func decode(_ data: Data, expectedProjectID: String? = nil) throws -> SeisMariaRecoverySnapshot {
        var reader = try SeisMariaRecoveryJSONReader(data)
        guard case .object(let root) = try reader.read(), Set(root.keys) == rootFields else {
            throw SeisMariaRecoveryError.invalidSchema
        }
        guard case .integer(1) = root["schema_version"] else { throw SeisMariaRecoveryError.unsupportedVersion }
        try noAuthority(root["execution_authorized"])
        let project = try text(root["project_id"])
        if let expectedProjectID, !scalarEqual(project, expectedProjectID) {
            throw SeisMariaRecoveryError.wrongProject
        }
        guard case .array(let rawRows) = root["rows"] else { throw SeisMariaRecoveryError.invalidSchema }
        let rows = try rawRows.map { try row($0, project: project) }
        // Python orders strings by Unicode scalar, not locale or grapheme order.
        var previous: String?
        for row in rows {
            if let previous, !previous.unicodeScalars.lexicographicallyPrecedes(row.workID.unicodeScalars) {
                throw SeisMariaRecoveryError.invalidRow
            }
            previous = row.workID
        }
        let actual: [String: Int] = [
            "total_candidates": rows.count,
            "replan_required": rows.filter(\.replanRequired).count,
            "drift_detected": rows.filter { $0.disposition == .driftDetected }.count,
            "evidence_required": rows.filter { $0.disposition == .evidenceRequired }.count,
            "anchor_missing": rows.filter { $0.disposition == .anchorMissing }.count,
            "aligned_replan_required": rows.filter { $0.disposition == .alignedReplanRequired }.count,
            "complete": rows.filter { $0.disposition == .complete }.count
        ]
        for (key, count) in actual {
            guard case .integer(let declared) = root[key], declared == count else {
                throw SeisMariaRecoveryError.inconsistentSummary
            }
        }
        return SeisMariaRecoverySnapshot(
            wireSchemaVersion: 1, projectID: project, rows: rows,
            totalCandidates: rows.count, replanRequired: rows.filter(\.replanRequired).count,
            driftDetected: actual["drift_detected"]!, evidenceRequired: actual["evidence_required"]!,
            anchorMissing: actual["anchor_missing"]!, alignedReplanRequired: actual["aligned_replan_required"]!,
            complete: actual["complete"]!
        )
    }

    private static func row(_ value: SeisMariaRecoveryJSON, project: String) throws -> SeisMariaRecoveryRow {
        guard case .object(let item) = value, Set(item.keys) == rowFields else { throw SeisMariaRecoveryError.invalidRow }
        try noAuthority(item["execution_authorized"])
        let rowProject = try text(item["project_id"])
        guard scalarEqual(rowProject, project) else { throw SeisMariaRecoveryError.wrongProject }
        let workID = try text(item["work_id"])
        let status = try text(item["disposition"])
        guard let disposition = SeisMariaRecoveryDisposition(rawValue: status),
              case .integer(let version) = item["schema_version"], version > 0 else {
            throw SeisMariaRecoveryError.invalidRow
        }
        let next: String?
        if case .null = item["next_step_id"] { next = nil } else { next = try text(item["next_step_id"]) }
        guard (disposition == .complete) == (next == nil) else { throw SeisMariaRecoveryError.invalidRow }
        let drift = try fields(item["drift_fields"])
        let missing = try fields(item["missing_context"])
        let details: [String]
        switch disposition {
        case .driftDetected:
            guard !drift.isEmpty, missing.isEmpty else { throw SeisMariaRecoveryError.invalidRow }
            details = drift
        case .evidenceRequired:
            guard !missing.isEmpty, drift.isEmpty else { throw SeisMariaRecoveryError.invalidRow }
            details = missing
        default:
            guard drift.isEmpty, missing.isEmpty else { throw SeisMariaRecoveryError.invalidRow }
            details = []
        }
        return SeisMariaRecoveryRow(projectID: project, workID: workID, disposition: disposition,
                                   durableSchemaVersion: version, nextStepID: next, detailFields: details)
    }

    private static func noAuthority(_ value: SeisMariaRecoveryJSON?) throws {
        guard case .boolean(false) = value else { throw SeisMariaRecoveryError.invalidSchema }
    }

    private static func text(_ value: SeisMariaRecoveryJSON?) throws -> String {
        guard case .string(let string) = value,
              !string.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw SeisMariaRecoveryError.invalidSchema
        }
        return string
    }

    private static func fields(_ value: SeisMariaRecoveryJSON?) throws -> [String] {
        guard case .array(let values) = value, values.count <= 16 else { throw SeisMariaRecoveryError.invalidRow }
        let strings = try values.map { try text($0) }
        // UTF-8 bytes preserve Python's distinction between canonical equivalents.
        guard Set(strings.map { Array($0.utf8) }).count == strings.count else { throw SeisMariaRecoveryError.invalidRow }
        return strings
    }

    private static func scalarEqual(_ left: String, _ right: String) -> Bool {
        left.unicodeScalars.elementsEqual(right.unicodeScalars)
    }
}
