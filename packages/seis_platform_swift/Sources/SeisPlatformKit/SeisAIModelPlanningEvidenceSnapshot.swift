import Foundation

public struct SeisAIModelPlanningEvidenceRecord: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let version: String?
    public let status: String
    public let routeEligibleToday: Bool?
    public let runtimeAuthority: Bool?
    public let productionReady: Bool?
    public let trainingStatus: String?
    public let benchmarkStatus: String?
    public let agiClaimAllowed: Bool?
    public let publicReadyAsAgi: Bool?
    public let publicReadyAsLocalDemo: Bool?
    public let truthBoundary: String
    public let forbiddenClaimsCount: Int
    public let humanApprovalCount: Int
    public let nextSafeActionsCount: Int

    public init(
        id: String,
        version: String?,
        status: String,
        routeEligibleToday: Bool?,
        runtimeAuthority: Bool?,
        productionReady: Bool?,
        trainingStatus: String?,
        benchmarkStatus: String?,
        agiClaimAllowed: Bool?,
        publicReadyAsAgi: Bool?,
        publicReadyAsLocalDemo: Bool?,
        truthBoundary: String,
        forbiddenClaimsCount: Int,
        humanApprovalCount: Int,
        nextSafeActionsCount: Int
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.routeEligibleToday = routeEligibleToday
        self.runtimeAuthority = runtimeAuthority
        self.productionReady = productionReady
        self.trainingStatus = trainingStatus
        self.benchmarkStatus = benchmarkStatus
        self.agiClaimAllowed = agiClaimAllowed
        self.publicReadyAsAgi = publicReadyAsAgi
        self.publicReadyAsLocalDemo = publicReadyAsLocalDemo
        self.truthBoundary = truthBoundary
        self.forbiddenClaimsCount = forbiddenClaimsCount
        self.humanApprovalCount = humanApprovalCount
        self.nextSafeActionsCount = nextSafeActionsCount
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        version = try container.decodeIfPresent(String.self, forKey: .version)
        status = try container.decode(String.self, forKey: .status)
        routeEligibleToday = try container.decodeIfPresent(Bool.self, forKey: .routeEligibleToday)
        runtimeAuthority = try container.decodeIfPresent(Bool.self, forKey: .runtimeAuthority)
        productionReady = try container.decodeIfPresent(Bool.self, forKey: .productionReady)
        trainingStatus = try container.decodeIfPresent(String.self, forKey: .trainingStatus)
        benchmarkStatus = try container.decodeIfPresent(String.self, forKey: .benchmarkStatus)
        agiClaimAllowed = try container.decodeIfPresent(Bool.self, forKey: .agiClaimAllowed)
        publicReadyAsAgi = try container.decodeIfPresent(Bool.self, forKey: .publicReadyAsAgi)
        publicReadyAsLocalDemo = try container.decodeIfPresent(Bool.self, forKey: .publicReadyAsLocalDemo)
        truthBoundary = try container.decode(String.self, forKey: .truthBoundary)
        let forbiddenClaims = try container.decodeIfPresent([String].self, forKey: .forbiddenClaims)
        let forbiddenClaimRules = try container.decodeIfPresent([String].self, forKey: .forbiddenClaimRules)
        forbiddenClaimsCount = forbiddenClaims?.count ?? forbiddenClaimRules?.count ?? 0
        humanApprovalCount = try container.decodeIfPresent([String].self, forKey: .humanApprovalRequiredFor)?.count ?? 0
        nextSafeActionsCount = try container.decodeIfPresent([String].self, forKey: .nextSafeActions)?.count ?? 0
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("model evidence id must not be empty") }
        if status.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("model evidence status must not be empty") }
        if truthBoundary.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("model evidence truth boundary must not be empty") }
        if forbiddenClaimsCount < 0 || humanApprovalCount < 0 || nextSafeActionsCount < 0 {
            issues.append("model evidence counts must not be negative")
        }
        if routeEligibleToday == true { issues.append("model evidence \(id) cannot be route eligible today") }
        if runtimeAuthority == true { issues.append("model evidence \(id) cannot have runtime authority") }
        if productionReady == true { issues.append("model evidence \(id) cannot be production ready") }
        if agiClaimAllowed == true || publicReadyAsAgi == true {
            issues.append("model evidence \(id) cannot authorize an AGI claim")
        }
        return issues
    }

    public var isPlanOnly: Bool {
        routeEligibleToday != true &&
            runtimeAuthority != true &&
            productionReady != true &&
            agiClaimAllowed != true &&
            publicReadyAsAgi != true
    }

    public var statusLabel: String {
        "\(status) · route today: \(routeEligibleToday == true ? "yes" : "no")"
    }

    private enum CodingKeys: String, CodingKey {
        case id
        case version
        case status
        case routeEligibleToday
        case runtimeAuthority
        case productionReady
        case trainingStatus
        case benchmarkStatus
        case agiClaimAllowed
        case publicReadyAsAgi
        case publicReadyAsLocalDemo
        case truthBoundary
        case forbiddenClaims
        case forbiddenClaimRules
        case humanApprovalRequiredFor
        case nextSafeActions
    }
}

public enum SeisAIModelPlanningEvidenceSnapshotError: Error, Equatable, Sendable {
    case invalidData(String)
    case invalidSnapshot([String])
}

public struct SeisAIModelPlanningEvidenceSnapshot: Codable, Equatable, Sendable {
    public static let canonicalIDs = [
        "seis-model-scaling-hardware-profile",
        "seis-model-parameter-ladder",
        "seis-model-frontier-escalation-policy",
        "seis-150b-frontier-model-program",
        "seis-512b-apex-model-program",
        "seis-agi-public-readiness-evidence"
    ]

    public let records: [SeisAIModelPlanningEvidenceRecord]

    public init(records: [SeisAIModelPlanningEvidenceRecord]) {
        self.records = records
    }

    public static func validated(from data: Data, sourceID: String? = nil) throws -> SeisAIModelPlanningEvidenceRecord {
        guard let record = try? JSONDecoder().decode(SeisAIModelPlanningEvidenceRecord.self, from: data) else {
            throw SeisAIModelPlanningEvidenceSnapshotError.invalidData(sourceID ?? "unknown")
        }
        let issues = record.validationIssues
        guard issues.isEmpty else {
            throw SeisAIModelPlanningEvidenceSnapshotError.invalidSnapshot(issues)
        }
        return record
    }

    public static func validated(from dataByID: [String: Data]) throws -> SeisAIModelPlanningEvidenceSnapshot {
        let records = try canonicalIDs.map { id in
            guard let data = dataByID[id] else {
                throw SeisAIModelPlanningEvidenceSnapshotError.invalidData(id)
            }
            return try validated(from: data, sourceID: id)
        }
        let snapshot = SeisAIModelPlanningEvidenceSnapshot(records: records)
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAIModelPlanningEvidenceSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if records.count != Self.canonicalIDs.count { issues.append("model planning evidence must include six canonical records") }
        if Set(records.map(\.id) ) != Set(Self.canonicalIDs) { issues.append("model planning evidence IDs must match the canonical set") }
        for record in records {
            issues.append(contentsOf: record.validationIssues.map { "\(record.id): \($0)" })
        }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isMetadataOnly: Bool { isValid && records.count == Self.canonicalIDs.count && records.allSatisfy(\.isPlanOnly) }
    public var agiClaimIsBlocked: Bool { records.contains { $0.agiClaimAllowed == false || $0.publicReadyAsAgi == false } }
    public var localDemoIsAllowed: Bool { records.contains { $0.publicReadyAsLocalDemo == true } }
}
