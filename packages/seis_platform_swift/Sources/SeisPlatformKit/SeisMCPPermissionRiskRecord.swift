import Foundation

public struct SeisMCPPermissionRiskMatrix: Codable, Equatable, Sendable {
    public let schema: String?
    public let id: String
    public let version: String
    public let status: String
    public let visibility: String
    public let purpose: String
    public let activationPolicy: SeisMCPActivationPolicy
    public let records: [SeisMCPPermissionRiskRecord]

    public init(
        schema: String? = nil,
        id: String,
        version: String,
        status: String,
        visibility: String,
        purpose: String,
        activationPolicy: SeisMCPActivationPolicy,
        records: [SeisMCPPermissionRiskRecord]
    ) {
        self.schema = schema
        self.id = id
        self.version = version
        self.status = status
        self.visibility = visibility
        self.purpose = purpose
        self.activationPolicy = activationPolicy
        self.records = records
    }

    public func record(id: String) -> SeisMCPPermissionRiskRecord? {
        records.first { $0.id == id }
    }

    private enum CodingKeys: String, CodingKey {
        case schema = "$schema"
        case id
        case version
        case status
        case visibility
        case purpose
        case activationPolicy
        case records
    }
}

public struct SeisMCPActivationPolicy: Codable, Equatable, Sendable {
    public let activationDefault: String
    public let installedMcpUse: String
    public let candidateUse: String
    public let packageRunnerDefault: String
    public let externalMutationRequiresUserConfirmation: Bool
    public let noBlanketActivation: Bool
    public let noSecretDisclosure: Bool
    public let credentialStorageAllowed: Bool
    public let providerCallsAllowedByDefault: Bool

    public init(
        activationDefault: String,
        installedMcpUse: String,
        candidateUse: String,
        packageRunnerDefault: String,
        externalMutationRequiresUserConfirmation: Bool,
        noBlanketActivation: Bool,
        noSecretDisclosure: Bool,
        credentialStorageAllowed: Bool,
        providerCallsAllowedByDefault: Bool
    ) {
        self.activationDefault = activationDefault
        self.installedMcpUse = installedMcpUse
        self.candidateUse = candidateUse
        self.packageRunnerDefault = packageRunnerDefault
        self.externalMutationRequiresUserConfirmation = externalMutationRequiresUserConfirmation
        self.noBlanketActivation = noBlanketActivation
        self.noSecretDisclosure = noSecretDisclosure
        self.credentialStorageAllowed = credentialStorageAllowed
        self.providerCallsAllowedByDefault = providerCallsAllowedByDefault
    }
}

public struct SeisMCPPermissionRiskRecord: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let name: String
    public let source: String
    public let officialStatus: String
    public let purpose: String
    public let permissions: [String]
    public let authentication: String
    public let secretsRequired: SeisMCPRequirementValue
    public let localOrCloud: String
    public let externalMutationRisk: String
    public let publicRepoSafety: String
    public let seisValue: String
    public let recommendedPriority: String
    public let riskLevel: String
    public let allowedMode: String
    public let requiredEvidence: [String]
    public let safeConfigurationNotes: String

    public init(
        id: String,
        name: String,
        source: String,
        officialStatus: String,
        purpose: String,
        permissions: [String],
        authentication: String,
        secretsRequired: SeisMCPRequirementValue,
        localOrCloud: String,
        externalMutationRisk: String,
        publicRepoSafety: String,
        seisValue: String,
        recommendedPriority: String,
        riskLevel: String,
        allowedMode: String,
        requiredEvidence: [String],
        safeConfigurationNotes: String
    ) {
        self.id = id
        self.name = name
        self.source = source
        self.officialStatus = officialStatus
        self.purpose = purpose
        self.permissions = permissions
        self.authentication = authentication
        self.secretsRequired = secretsRequired
        self.localOrCloud = localOrCloud
        self.externalMutationRisk = externalMutationRisk
        self.publicRepoSafety = publicRepoSafety
        self.seisValue = seisValue
        self.recommendedPriority = recommendedPriority
        self.riskLevel = riskLevel
        self.allowedMode = allowedMode
        self.requiredEvidence = requiredEvidence
        self.safeConfigurationNotes = safeConfigurationNotes
    }

    public var isDocumentationOnly: Bool {
        allowedMode.localizedCaseInsensitiveContains("document-only") ||
            officialStatus.localizedCaseInsensitiveContains("candidate")
    }

    public var requiresApprovalBeforeUse: Bool {
        riskLevel == "high" ||
            riskLevel == "blocked" ||
            allowedMode.localizedCaseInsensitiveContains("approval") ||
            allowedMode.localizedCaseInsensitiveContains("gated")
    }

    public var isExternalMutationCapable: Bool {
        let normalized = externalMutationRisk.lowercased()
        return normalized != "none" &&
            normalized != "none-by-contract" &&
            normalized != "low"
    }
}

public enum SeisMCPRequirementValue: Codable, Equatable, Sendable {
    case bool(Bool)
    case text(String)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let boolValue = try? container.decode(Bool.self) {
            self = .bool(boolValue)
            return
        }
        self = .text(try container.decode(String.self))
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .bool(let value):
            try container.encode(value)
        case .text(let value):
            try container.encode(value)
        }
    }

    public var requiresSecretMaterial: Bool {
        switch self {
        case .bool(let value):
            return value
        case .text(let value):
            let normalized = value.lowercased()
            return normalized != "false" &&
                normalized != "none" &&
                normalized != "unknown"
        }
    }
}
