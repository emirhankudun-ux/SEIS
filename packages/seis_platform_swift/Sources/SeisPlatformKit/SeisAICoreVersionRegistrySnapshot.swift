import Foundation

public struct SeisAICoreVersionIdentity: Codable, Equatable, Sendable {
    public let id: String
    public let displayName: String
    public let maturity: String
    public let scope: String
    public let releaseClass: String
    public let runtimeBoundary: String
    public let providerMode: String
    public let languageVersion: String
    public let agentRuntimeVersion: String
    public let modelRouterVersion: String
    public let promptEngineVersion: String
    public let commandIntelligenceVersion: String

    public init(
        id: String,
        displayName: String,
        maturity: String,
        scope: String,
        releaseClass: String,
        runtimeBoundary: String,
        providerMode: String,
        languageVersion: String,
        agentRuntimeVersion: String,
        modelRouterVersion: String,
        promptEngineVersion: String,
        commandIntelligenceVersion: String
    ) {
        self.id = id
        self.displayName = displayName
        self.maturity = maturity
        self.scope = scope
        self.releaseClass = releaseClass
        self.runtimeBoundary = runtimeBoundary
        self.providerMode = providerMode
        self.languageVersion = languageVersion
        self.agentRuntimeVersion = agentRuntimeVersion
        self.modelRouterVersion = modelRouterVersion
        self.promptEngineVersion = promptEngineVersion
        self.commandIntelligenceVersion = commandIntelligenceVersion
    }

    public var validationIssues: [String] {
        let values = [
            id, displayName, maturity, scope, releaseClass, runtimeBoundary,
            providerMode, languageVersion, agentRuntimeVersion, modelRouterVersion,
            promptEngineVersion, commandIntelligenceVersion
        ]
        return values.contains { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
            ? ["version identity fields must not be empty"]
            : []
    }
}

public struct SeisAICoreVersionTruthBoundaries: Codable, Equatable, Sendable {
    public let isFoundationModel: Bool
    public let isTrainedModel: Bool
    public let providerRoutingIsModelOwnership: Bool
    public let promptEngineeringIsTraining: Bool
    public let ragIsTraining: Bool
    public let autonomousWriteRuntimeEnabled: Bool
    public let externalMutationPerformed: Bool
    public let credentialAccessPerformed: Bool

    public init(
        isFoundationModel: Bool,
        isTrainedModel: Bool,
        providerRoutingIsModelOwnership: Bool,
        promptEngineeringIsTraining: Bool,
        ragIsTraining: Bool,
        autonomousWriteRuntimeEnabled: Bool,
        externalMutationPerformed: Bool,
        credentialAccessPerformed: Bool
    ) {
        self.isFoundationModel = isFoundationModel
        self.isTrainedModel = isTrainedModel
        self.providerRoutingIsModelOwnership = providerRoutingIsModelOwnership
        self.promptEngineeringIsTraining = promptEngineeringIsTraining
        self.ragIsTraining = ragIsTraining
        self.autonomousWriteRuntimeEnabled = autonomousWriteRuntimeEnabled
        self.externalMutationPerformed = externalMutationPerformed
        self.credentialAccessPerformed = credentialAccessPerformed
    }

    public var isSafe: Bool {
        !isFoundationModel &&
            !isTrainedModel &&
            !providerRoutingIsModelOwnership &&
            !promptEngineeringIsTraining &&
            !ragIsTraining &&
            !autonomousWriteRuntimeEnabled &&
            !externalMutationPerformed &&
            !credentialAccessPerformed
    }
}

public struct SeisAICoreVersionRuntimeBoundary: Codable, Equatable, Sendable {
    public let currentLevel: String
    public let writeExecution: String
    public let backgroundAutomation: String
    public let externalMutation: String
    public let credentialAccess: String
    public let liveProviderCalls: String
    public let localDemoAllowed: Bool
    public let coreRequiresCloudApiKey: Bool

    public init(
        currentLevel: String,
        writeExecution: String,
        backgroundAutomation: String,
        externalMutation: String,
        credentialAccess: String,
        liveProviderCalls: String,
        localDemoAllowed: Bool,
        coreRequiresCloudApiKey: Bool
    ) {
        self.currentLevel = currentLevel
        self.writeExecution = writeExecution
        self.backgroundAutomation = backgroundAutomation
        self.externalMutation = externalMutation
        self.credentialAccess = credentialAccess
        self.liveProviderCalls = liveProviderCalls
        self.localDemoAllowed = localDemoAllowed
        self.coreRequiresCloudApiKey = coreRequiresCloudApiKey
    }

    public var isSafeLocalDemo: Bool {
        currentLevel == "status-and-plan-only" &&
            writeExecution == "disabled" &&
            backgroundAutomation == "disabled" &&
            externalMutation == "requires-explicit-human-approval" &&
            credentialAccess == "forbidden" &&
            liveProviderCalls == "disabled" &&
            localDemoAllowed &&
            !coreRequiresCloudApiKey
    }
}

public struct SeisAICoreVersionComponent: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let name: String
    public let kind: String
    public let status: String
    public let source: String
    public let validation: String

    public init(id: String, name: String, kind: String, status: String, source: String, validation: String) {
        self.id = id
        self.name = name
        self.kind = kind
        self.status = status
        self.source = source
        self.validation = validation
    }

    public var validationIssues: [String] {
        [id, name, kind, status, source, validation].contains { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
            ? ["version component \(id) has empty fields"]
            : []
    }
}

public struct SeisAICoreVersionLaneBinding: Codable, Equatable, Identifiable, Sendable {
    public let laneId: String
    public let displayName: String
    public let statusTool: String
    public let planTool: String
    public let permissionLevel: String
    public let versionDuty: String

    public var id: String { laneId }

    public init(laneId: String, displayName: String, statusTool: String, planTool: String, permissionLevel: String, versionDuty: String) {
        self.laneId = laneId
        self.displayName = displayName
        self.statusTool = statusTool
        self.planTool = planTool
        self.permissionLevel = permissionLevel
        self.versionDuty = versionDuty
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if [laneId, displayName, statusTool, planTool, permissionLevel, versionDuty].contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("version lane \(laneId) has empty fields")
        }
        if permissionLevel != "plan-only" { issues.append("version lane \(laneId) must remain plan-only") }
        return issues
    }
}

public struct SeisAICoreVersionRoadmapEntry: Codable, Equatable, Identifiable, Sendable {
    public let year: Int
    public let versionTarget: String
    public let theme: String
    public let promotionGate: String

    public var id: String { versionTarget }

    public init(year: Int, versionTarget: String, theme: String, promotionGate: String) {
        self.year = year
        self.versionTarget = versionTarget
        self.theme = theme
        self.promotionGate = promotionGate
    }

    public var validationIssues: [String] {
        if year < 1 || versionTarget.isEmpty || theme.isEmpty || promotionGate.isEmpty {
            return ["version roadmap entry \(versionTarget) is incomplete"]
        }
        return []
    }
}

public enum SeisAICoreVersionRegistrySnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAICoreVersionRegistrySnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let updatedAt: String
    public let purpose: String
    public let qualityGate: String
    public let sourceOfTruth: [String: String]
    public let currentVersion: SeisAICoreVersionIdentity
    public let truthBoundaries: SeisAICoreVersionTruthBoundaries
    public let runtimeBoundary: SeisAICoreVersionRuntimeBoundary
    public let versionComponents: [SeisAICoreVersionComponent]
    public let linkedSubAgentLanes: [SeisAICoreVersionLaneBinding]
    public let fiveYearVersionRoadmap: [SeisAICoreVersionRoadmapEntry]
    public let promotionEvidenceRequired: [String]
    public let nextSafeActions: [String]

    public init(
        id: String,
        version: String,
        status: String,
        updatedAt: String,
        purpose: String,
        qualityGate: String,
        sourceOfTruth: [String: String],
        currentVersion: SeisAICoreVersionIdentity,
        truthBoundaries: SeisAICoreVersionTruthBoundaries,
        runtimeBoundary: SeisAICoreVersionRuntimeBoundary,
        versionComponents: [SeisAICoreVersionComponent],
        linkedSubAgentLanes: [SeisAICoreVersionLaneBinding],
        fiveYearVersionRoadmap: [SeisAICoreVersionRoadmapEntry],
        promotionEvidenceRequired: [String],
        nextSafeActions: [String]
    ) {
        self.id = id
        self.version = version
        self.status = status
        self.updatedAt = updatedAt
        self.purpose = purpose
        self.qualityGate = qualityGate
        self.sourceOfTruth = sourceOfTruth
        self.currentVersion = currentVersion
        self.truthBoundaries = truthBoundaries
        self.runtimeBoundary = runtimeBoundary
        self.versionComponents = versionComponents
        self.linkedSubAgentLanes = linkedSubAgentLanes
        self.fiveYearVersionRoadmap = fiveYearVersionRoadmap
        self.promotionEvidenceRequired = promotionEvidenceRequired
        self.nextSafeActions = nextSafeActions
    }

    public static func validated(from data: Data) throws -> SeisAICoreVersionRegistrySnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAICoreVersionRegistrySnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAICoreVersionRegistrySnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-ai-core-version-registry" { issues.append("version registry id must identify the canonical registry") }
        if [version, status, updatedAt, purpose, qualityGate].contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("version registry identity fields must not be empty")
        }
        issues.append(contentsOf: currentVersion.validationIssues)
        if currentVersion.id != "seis-ai-core-v0.1" { issues.append("current AI Core version must be seis-ai-core-v0.1") }
        if currentVersion.providerMode != "zero-key-core" { issues.append("current AI Core version must remain zero-key-core") }
        if !truthBoundaries.isSafe { issues.append("version registry truth boundaries are unsafe") }
        if !runtimeBoundary.isSafeLocalDemo { issues.append("version registry runtime boundary is unsafe") }
        if versionComponents.count != 7 { issues.append("version registry must contain seven components") }
        if linkedSubAgentLanes.count != 5 { issues.append("version registry must contain five linked sub-agent lanes") }
        if fiveYearVersionRoadmap.count != 5 { issues.append("version registry must contain five roadmap entries") }
        if promotionEvidenceRequired.count != 10 { issues.append("version registry must contain ten promotion evidence requirements") }
        if nextSafeActions.isEmpty { issues.append("version registry next safe actions must not be empty") }
        for component in versionComponents { issues.append(contentsOf: component.validationIssues) }
        for lane in linkedSubAgentLanes { issues.append(contentsOf: lane.validationIssues) }
        for entry in fiveYearVersionRoadmap { issues.append(contentsOf: entry.validationIssues) }
        let laneIDs = linkedSubAgentLanes.map(\.laneId)
        if Set(laneIDs).count != laneIDs.count { issues.append("version registry lane IDs must be unique") }
        let roadmapIDs = fiveYearVersionRoadmap.map(\.versionTarget)
        if Set(roadmapIDs).count != roadmapIDs.count { issues.append("version registry roadmap targets must be unique") }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }
    public var isMetadataOnly: Bool {
        isValid &&
            truthBoundaries.isSafe &&
            runtimeBoundary.isSafeLocalDemo &&
            linkedSubAgentLanes.allSatisfy { $0.permissionLevel == "plan-only" }
    }
}
