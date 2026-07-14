import Foundation

public enum SeisAICoreProviderState: String, CaseIterable, Codable, Equatable, Hashable, Sendable {
    case available = "Available"
    case missingKey = "Missing Key"
    case disabled = "Disabled"
    case rateLimited = "Rate Limited"
    case error = "Error"
}

public enum SeisAICoreRouteProviderState: String, Codable, Equatable, Hashable, Sendable {
    case available = "Available"
    case disabled = "Disabled"
}

public struct SeisAICoreRuntimeSnapshotSourceOfTruth: Codable, Equatable, Sendable {
    public let providerRegistry: String
    public let routerContract: String
    public let pluginIntegration: String
    public let mcpRuntimeContract: String
    public let applicationIntegration: String
    public let agentRegistry: String
    public let generator: String
    public let output: String
}

public struct SeisAICoreRuntimeSnapshotConsumer: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let root: String
    public let panel: String
    public let panelSelector: String
    public let loadPath: String
    public let interaction: String
}

public struct SeisAICoreRuntimeSnapshotDelivery: Codable, Equatable, Sendable {
    public let builder: String
    public let generator: String
    public let trackedArtifact: String
    public let artifactTracked: Bool
    public let gitignoreException: String
    public let failureState: String
    public let networkFallback: Bool
    public let mcpFallback: Bool
    public let providerFallback: Bool

    public var hasNoLiveFallback: Bool {
        !networkFallback && !mcpFallback && !providerFallback
    }
}

public struct SeisAICoreRuntimeSnapshotNativeConsumer: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let root: String
    public let contract: String
    public let tests: String
    public let decodeMode: String
    public let runtimeAuthority: Bool
    public let sourceArtifact: String

    public var contractPath: String {
        "\(root)/\(contract)"
    }

    public var testsPath: String {
        "\(root)/\(tests)"
    }
}

public struct SeisAICoreApplicationRuntimeBoundary: Codable, Equatable, Sendable {
    public let routeEligible: Bool
    public let executionPerformed: Bool
    public let providerCallsPerformed: Bool
    public let fallbackUsed: Bool
    public let credentialsRead: Bool
    public let promptBodiesIncluded: Bool
    public let privateContentRead: Bool
    public let liveMcpSessionStarted: Bool
    public let sshExecuted: Bool
    public let deploymentPerformed: Bool
    public let githubMutationPerformed: Bool
    public let humanApprovalRequiredForLiveActions: Bool

    public var isSafe: Bool {
        !routeEligible &&
            !executionPerformed &&
            !providerCallsPerformed &&
            !fallbackUsed &&
            !credentialsRead &&
            !promptBodiesIncluded &&
            !privateContentRead &&
            !liveMcpSessionStarted &&
            !sshExecuted &&
            !deploymentPerformed &&
            !githubMutationPerformed &&
            humanApprovalRequiredForLiveActions
    }
}

public struct SeisAICoreRuntimeSnapshotApplicationIntegration: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let consumer: SeisAICoreRuntimeSnapshotConsumer
    public let nativeConsumer: SeisAICoreRuntimeSnapshotNativeConsumer
    public let delivery: SeisAICoreRuntimeSnapshotDelivery
    public let providerStateSemantics: [String: String]
    public let runtimeBoundary: SeisAICoreApplicationRuntimeBoundary

    public func semantics(for state: SeisAICoreProviderState) -> String? {
        providerStateSemantics[state.rawValue]
    }
}

public struct SeisAICoreProviderFixture: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let category: String
    public let publicStatus: SeisAICoreProviderState
    public let credentialRequirement: String
    public let configured: Bool
    public let enabled: Bool
    public let routingEligible: Bool
    public let privacyClass: String
    public let actualModel: String
    public let backendOnly: Bool
    public let frontendSecretAllowed: Bool

    public var respectsCredentialBoundary: Bool {
        backendOnly && !frontendSecretAllowed
    }
}

public struct SeisAICoreProviderRegistrySnapshot: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let truthBoundary: String
    public let coreCredentialRequirement: String
    public let defaultRoutingMode: String
    public let localOnlyRespected: Bool
    public let providerCount: Int
    public let availableProviderCount: Int
    public let routingEligibleProviderCount: Int
    public let missingKeyProviderCount: Int
    public let disabledProviderCount: Int
    public let publicStates: [SeisAICoreProviderState]
    public let providers: [SeisAICoreProviderFixture]
}

public struct SeisAICoreRouteInput: Codable, Equatable, Sendable {
    public let taskType: String
    public let capability: String
    public let privacyMode: String
    public let localOnly: Bool
}

public struct SeisAICoreAgentLane: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let subAgentRole: String
    public let permissionLevel: String
    public let statusTool: String
    public let planTool: String
    public let qualityGate: String
    public let executionPerformed: Bool

    public var isPlanOnly: Bool {
        permissionLevel == "plan-only" && !executionPerformed
    }
}

public struct SeisAICoreRouteSafetyBoundary: Codable, Equatable, Sendable {
    public let credentialsRead: Bool
    public let promptBodyRead: Bool
    public let privateContentRead: Bool
    public let networkCalled: Bool
    public let sshExecuted: Bool
    public let deploymentPerformed: Bool
    public let githubMutationPerformed: Bool

    public var isIsolated: Bool {
        !credentialsRead &&
            !promptBodyRead &&
            !privateContentRead &&
            !networkCalled &&
            !sshExecuted &&
            !deploymentPerformed &&
            !githubMutationPerformed
    }
}

public struct SeisAICoreModelClaimBoundary: Codable, Equatable, Sendable {
    public let isTrainedModel: Bool
    public let isFoundationModel: Bool
    public let isAgi: Bool
    public let parameterCountBillion: Int?
    public let providerRoutingIsModelOwnership: Bool
    public let promptEngineeringIsTraining: Bool
    public let ragIsTraining: Bool

    public var isClaimSafe: Bool {
        !isTrainedModel &&
            !isFoundationModel &&
            !isAgi &&
            parameterCountBillion == nil &&
            !providerRoutingIsModelOwnership &&
            !promptEngineeringIsTraining &&
            !ragIsTraining
    }

    private enum CodingKeys: String, CodingKey {
        case isTrainedModel
        case isFoundationModel
        case isAgi
        case parameterCountBillion
        case providerRoutingIsModelOwnership
        case promptEngineeringIsTraining
        case ragIsTraining
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(isTrainedModel, forKey: .isTrainedModel)
        try container.encode(isFoundationModel, forKey: .isFoundationModel)
        try container.encode(isAgi, forKey: .isAgi)
        if let parameterCountBillion {
            try container.encode(parameterCountBillion, forKey: .parameterCountBillion)
        } else {
            try container.encodeNil(forKey: .parameterCountBillion)
        }
        try container.encode(providerRoutingIsModelOwnership, forKey: .providerRoutingIsModelOwnership)
        try container.encode(promptEngineeringIsTraining, forKey: .promptEngineeringIsTraining)
        try container.encode(ragIsTraining, forKey: .ragIsTraining)
    }
}

public struct SeisAICoreRouteDecision: Codable, Equatable, Sendable {
    public let decisionHash: String
    public let status: String
    public let selectedProvider: String
    public let selectedModel: String
    public let providerState: SeisAICoreRouteProviderState
    public let registryProviderState: SeisAICoreRouteProviderState?
    public let selectionBasis: String
    public let routeEligible: Bool
    public let executionPerformed: Bool
    public let providerCallsPerformed: Bool
    public let fallbackUsed: Bool
    public let fallbackPlan: String
    public let agentLane: SeisAICoreAgentLane
    public let requiredApprovals: [String]
    public let blockedReasons: [String]
    public let safetyBoundary: SeisAICoreRouteSafetyBoundary
    public let modelClaimBoundary: SeisAICoreModelClaimBoundary

    public var respectsReadOnlyBoundary: Bool {
        status == "review-only-no-runtime-authority" &&
            !routeEligible &&
            !executionPerformed &&
            !providerCallsPerformed &&
            !fallbackUsed &&
            agentLane.isPlanOnly &&
            safetyBoundary.isIsolated &&
            modelClaimBoundary.isClaimSafe
    }

    private enum CodingKeys: String, CodingKey {
        case decisionHash
        case status
        case selectedProvider
        case selectedModel
        case providerState
        case registryProviderState
        case selectionBasis
        case routeEligible
        case executionPerformed
        case providerCallsPerformed
        case fallbackUsed
        case fallbackPlan
        case agentLane
        case requiredApprovals
        case blockedReasons
        case safetyBoundary
        case modelClaimBoundary
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(decisionHash, forKey: .decisionHash)
        try container.encode(status, forKey: .status)
        try container.encode(selectedProvider, forKey: .selectedProvider)
        try container.encode(selectedModel, forKey: .selectedModel)
        try container.encode(providerState, forKey: .providerState)
        if let registryProviderState {
            try container.encode(registryProviderState, forKey: .registryProviderState)
        } else {
            try container.encodeNil(forKey: .registryProviderState)
        }
        try container.encode(selectionBasis, forKey: .selectionBasis)
        try container.encode(routeEligible, forKey: .routeEligible)
        try container.encode(executionPerformed, forKey: .executionPerformed)
        try container.encode(providerCallsPerformed, forKey: .providerCallsPerformed)
        try container.encode(fallbackUsed, forKey: .fallbackUsed)
        try container.encode(fallbackPlan, forKey: .fallbackPlan)
        try container.encode(agentLane, forKey: .agentLane)
        try container.encode(requiredApprovals, forKey: .requiredApprovals)
        try container.encode(blockedReasons, forKey: .blockedReasons)
        try container.encode(safetyBoundary, forKey: .safetyBoundary)
        try container.encode(modelClaimBoundary, forKey: .modelClaimBoundary)
    }
}

public struct SeisAICoreRouteScenario: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let description: String
    public let input: SeisAICoreRouteInput
    public let decision: SeisAICoreRouteDecision
}

public struct SeisAICoreRouterSnapshot: Codable, Equatable, Sendable {
    public let runtimeId: String
    public let tool: String
    public let status: String
    public let mode: String
    public let scenarioCount: Int
    public let scenarios: [SeisAICoreRouteScenario]
}

public struct SeisAICoreManagedLane: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let status: String
}

public struct SeisAICoreManagedAgent: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let status: String
    public let duty: String
    public let executionAuthority: Bool
}

public struct SeisAICoreAgentRegistrySafetyBoundary: Codable, Equatable, Sendable {
    public let storesSecrets: Bool
    public let providerCalls: Bool
    public let sshExecution: Bool
    public let deployment: Bool
    public let githubMutation: Bool

    public var isSafe: Bool {
        !storesSecrets &&
            !providerCalls &&
            !sshExecution &&
            !deployment &&
            !githubMutation
    }
}

public struct SeisAICoreAgentRegistrySnapshot: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let mode: String
    public let source: String
    public let sourceQualityGate: String
    public let decision: String
    public let truthBoundary: String
    public let managedLaneCount: Int
    public let agentCount: Int
    public let runtimeAuthority: Bool
    public let permissionBoundary: String
    public let managedLanes: [SeisAICoreManagedLane]
    public let agents: [SeisAICoreManagedAgent]
    public let safetyBoundary: SeisAICoreAgentRegistrySafetyBoundary
    public let humanApprovalRequiredForMutation: Bool

    public var isReadOnlySafe: Bool {
        !runtimeAuthority &&
            permissionBoundary == "status-and-plan-only" &&
            agents.allSatisfy { !$0.executionAuthority } &&
            safetyBoundary.isSafe &&
            humanApprovalRequiredForMutation
    }
}

public struct SeisAICorePersonalLane: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let role: String
    public let mcpTools: [String]
    public let qualityGate: String
}

public struct SeisAICorePluginMCPToolInventory: Codable, Equatable, Sendable {
    public let mode: String
    public let toolCount: Int?
    public let toolNames: [String]

    private enum CodingKeys: String, CodingKey {
        case mode
        case toolCount
        case toolNames
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(mode, forKey: .mode)
        if let toolCount {
            try container.encode(toolCount, forKey: .toolCount)
        } else {
            try container.encodeNil(forKey: .toolCount)
        }
        try container.encode(toolNames, forKey: .toolNames)
    }
}

public struct SeisAICorePluginMCPServer: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let serverId: String
    public let pluginRoot: String
    public let configPath: String
    public let pluginManifestPath: String
    public let skillRoot: String
    public let configExists: Bool
    public let pluginManifestExists: Bool
    public let skillRootExists: Bool
    public let command: String?
    public let args: [String]
    public let entrypoint: String?
    public let entrypointExists: Bool
    public let status: String
    public let executionAuthority: Bool
    public let credentialsRead: Bool
    public let networkCalled: Bool
    public let externalMutationPerformed: Bool
    public let toolInventory: SeisAICorePluginMCPToolInventory
}

public struct SeisAICorePluginMCPBoundary: Codable, Equatable, Sendable {
    public let sourceOfTruth: String
    public let transport: String
    public let liveSessionStarted: Bool
    public let probeOptIn: Bool
    public let shell: Bool
    public let credentialsRead: Bool
    public let networkCalled: Bool
    public let externalMutationPerformed: Bool
    public let humanApprovalRequiredForExternalMutation: Bool
}

public struct SeisAICorePluginMCPMeshSnapshot: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let schemaVersion: String
    public let status: String
    public let mode: String
    public let serverCount: Int
    public let configuredServerCount: Int
    public let servers: [SeisAICorePluginMCPServer]
    public let boundary: SeisAICorePluginMCPBoundary
}

public struct SeisAICorePluginMeshSnapshot: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let primaryInstallId: String
    public let installedEnabledCount: Int
    public let notInstalledCount: Int
    public let helperUniquePlugins: Int
    public let helperCapabilityLaneCount: Int
    public let activationPolicy: String
    public let personalLaneCount: Int
    public let personalLaneToolCount: Int
    public let personalLanes: [SeisAICorePersonalLane]
    public let mcpMesh: SeisAICorePluginMCPMeshSnapshot
}

public struct SeisAICoreMCPSurface: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let count: Int
    public let state: String
    public let method: String
    public let evidence: String
    public let duty: String
}

public struct SeisAICoreMCPCounts: Codable, Equatable, Sendable {
    public let tools: Int
    public let resources: Int
    public let prompts: Int

    public init(tools: Int, resources: Int, prompts: Int) {
        self.tools = tools
        self.resources = resources
        self.prompts = prompts
    }
}

public struct SeisAICoreMCPRuntimeSnapshot: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let status: String
    public let transport: String
    public let fallbackRuntime: String
    public let toolCount: Int
    public let resourceCount: Int
    public let promptCount: Int
    public let resourceUri: String
    public let pluginIntegrationResource: String
    public let boundary: String
    public let surfaces: [SeisAICoreMCPSurface]

    public var counts: SeisAICoreMCPCounts {
        SeisAICoreMCPCounts(
            tools: toolCount,
            resources: resourceCount,
            prompts: promptCount
        )
    }
}

public struct SeisAICoreRuntimeBoundary: Codable, Equatable, Sendable {
    public let providerCalls: Bool
    public let credentialsRead: Bool
    public let frontendSecretsAllowed: Bool
    public let liveMcpSessionStarted: Bool
    public let sshExecuted: Bool
    public let deploymentPerformed: Bool
    public let githubMutationPerformed: Bool
    public let privateContentRead: Bool
    public let routeExecutionPerformed: Bool
    public let humanApprovalRequiredForLiveActions: Bool

    public var isSafe: Bool {
        !providerCalls &&
            !credentialsRead &&
            !frontendSecretsAllowed &&
            !liveMcpSessionStarted &&
            !sshExecuted &&
            !deploymentPerformed &&
            !githubMutationPerformed &&
            !privateContentRead &&
            !routeExecutionPerformed &&
            humanApprovalRequiredForLiveActions
    }
}

public struct SeisAICoreRuntimeSnapshotSummaryMetrics: Codable, Equatable, Sendable {
    public let providerCount: Int
    public let availableProviderCount: Int
    public let routingEligibleProviderCount: Int
    public let missingKeyProviderCount: Int
    public let disabledProviderCount: Int
    public let scenarioCount: Int
    public let boundarySafeScenarioCount: Int
    public let managedLaneCount: Int
    public let managedAgentCount: Int
    public let personalLaneCount: Int
    public let personalLaneToolCount: Int
    public let mcpToolCount: Int
    public let mcpResourceCount: Int
    public let mcpPromptCount: Int
    public let runtimeBoundarySafe: Bool

    public init(
        providerCount: Int,
        availableProviderCount: Int,
        routingEligibleProviderCount: Int,
        missingKeyProviderCount: Int,
        disabledProviderCount: Int,
        scenarioCount: Int,
        boundarySafeScenarioCount: Int,
        managedLaneCount: Int,
        managedAgentCount: Int,
        personalLaneCount: Int,
        personalLaneToolCount: Int,
        mcpToolCount: Int,
        mcpResourceCount: Int,
        mcpPromptCount: Int,
        runtimeBoundarySafe: Bool
    ) {
        self.providerCount = providerCount
        self.availableProviderCount = availableProviderCount
        self.routingEligibleProviderCount = routingEligibleProviderCount
        self.missingKeyProviderCount = missingKeyProviderCount
        self.disabledProviderCount = disabledProviderCount
        self.scenarioCount = scenarioCount
        self.boundarySafeScenarioCount = boundarySafeScenarioCount
        self.managedLaneCount = managedLaneCount
        self.managedAgentCount = managedAgentCount
        self.personalLaneCount = personalLaneCount
        self.personalLaneToolCount = personalLaneToolCount
        self.mcpToolCount = mcpToolCount
        self.mcpResourceCount = mcpResourceCount
        self.mcpPromptCount = mcpPromptCount
        self.runtimeBoundarySafe = runtimeBoundarySafe
    }
}

public struct SeisAICoreRuntimeSnapshotValidationError: Error, Equatable, Sendable {
    public let validationIssues: [String]

    public init(validationIssues: [String]) {
        self.validationIssues = validationIssues
    }
}

public struct SeisAICoreRuntimeSnapshotContract: Codable, Equatable, Sendable {
    public static let maximumInputByteCount = 1_048_576
    public static let expectedProviderCount = 7
    public static let expectedScenarioCount = 7
    public static let expectedManagedLaneCount = 9
    public static let expectedManagedAgentCount = 13
    public static let expectedPersonalLaneCount = 5
    public static let expectedMCPCounts = SeisAICoreMCPCounts(tools: 37, resources: 30, prompts: 3)

    public static let expectedProviderIDs = [
        "codex-operator",
        "seis-local-demo",
        "anthropic-claude",
        "openai-general",
        "google-gemini",
        "qwen-review",
        "ollama-local"
    ]

    public static let expectedScenarioIDs = [
        "governance-plan",
        "cloud-preflight",
        "code-validation",
        "design-review",
        "data-provenance",
        "private-vault-block",
        "frontier-model-block"
    ]

    public static let expectedPersonalLaneIDs = [
        "seis",
        "seis-cloud",
        "seis-code",
        "seis-design",
        "seis-data"
    ]

    public static let expectedManagedLaneIDs = [
        "seis",
        "seis-cloud",
        "seis-code",
        "seis-design",
        "seis-data",
        "seis-security",
        "seis-research",
        "seis-automation",
        "seis-product"
    ]

    public static let expectedManagedAgentIDs = [
        "architect-agent",
        "code-agent",
        "design-agent",
        "ui-ux-agent",
        "research-agent",
        "search-agent",
        "security-agent",
        "devops-agent",
        "documentation-agent",
        "qa-agent",
        "cloud-agent",
        "automation-agent",
        "product-agent"
    ]

    public let id: String
    public let schemaVersion: String
    public let status: String
    public let mode: String
    public let purpose: String
    public let sourceOfTruth: SeisAICoreRuntimeSnapshotSourceOfTruth
    public let applicationIntegration: SeisAICoreRuntimeSnapshotApplicationIntegration
    public let providerRegistry: SeisAICoreProviderRegistrySnapshot
    public let router: SeisAICoreRouterSnapshot
    public let agentRegistry: SeisAICoreAgentRegistrySnapshot
    public let pluginMesh: SeisAICorePluginMeshSnapshot
    public let mcpRuntime: SeisAICoreMCPRuntimeSnapshot
    public let runtimeBoundary: SeisAICoreRuntimeBoundary
    public let qualityGates: [String]

    public init(
        id: String,
        schemaVersion: String,
        status: String,
        mode: String,
        purpose: String,
        sourceOfTruth: SeisAICoreRuntimeSnapshotSourceOfTruth,
        applicationIntegration: SeisAICoreRuntimeSnapshotApplicationIntegration,
        providerRegistry: SeisAICoreProviderRegistrySnapshot,
        router: SeisAICoreRouterSnapshot,
        agentRegistry: SeisAICoreAgentRegistrySnapshot,
        pluginMesh: SeisAICorePluginMeshSnapshot,
        mcpRuntime: SeisAICoreMCPRuntimeSnapshot,
        runtimeBoundary: SeisAICoreRuntimeBoundary,
        qualityGates: [String]
    ) {
        self.id = id
        self.schemaVersion = schemaVersion
        self.status = status
        self.mode = mode
        self.purpose = purpose
        self.sourceOfTruth = sourceOfTruth
        self.applicationIntegration = applicationIntegration
        self.providerRegistry = providerRegistry
        self.router = router
        self.agentRegistry = agentRegistry
        self.pluginMesh = pluginMesh
        self.mcpRuntime = mcpRuntime
        self.runtimeBoundary = runtimeBoundary
        self.qualityGates = qualityGates
    }

    /// Decodes the snapshot without applying semantic validation.
    /// Use `validated(from:)` before treating decoded data as an accepted contract.
    public init(data: Data) throws {
        self = try JSONDecoder().decode(Self.self, from: data)
    }

    public static func validated(from data: Data) throws -> Self {
        guard data.count <= maximumInputByteCount else {
            throw SeisAICoreRuntimeSnapshotValidationError(
                validationIssues: [
                    "input byte count \(data.count) exceeds maximumInputByteCount \(maximumInputByteCount)."
                ]
            )
        }

        let preflightIssues = try structuralPreflightIssues(in: data)
        guard preflightIssues.isEmpty else {
            throw SeisAICoreRuntimeSnapshotValidationError(validationIssues: preflightIssues)
        }

        let snapshot = try Self(data: data)
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAICoreRuntimeSnapshotValidationError(validationIssues: issues)
        }
        return snapshot
    }

    public var providerFixtures: [SeisAICoreProviderFixture] {
        providerRegistry.providers
    }

    public var routeScenarios: [SeisAICoreRouteScenario] {
        router.scenarios
    }

    public var summaryMetrics: SeisAICoreRuntimeSnapshotSummaryMetrics {
        SeisAICoreRuntimeSnapshotSummaryMetrics(
            providerCount: providerFixtures.count,
            availableProviderCount: providerFixtures.filter { $0.publicStatus == .available }.count,
            routingEligibleProviderCount: providerFixtures.filter(\.routingEligible).count,
            missingKeyProviderCount: providerFixtures.filter { $0.publicStatus == .missingKey }.count,
            disabledProviderCount: providerFixtures.filter { $0.publicStatus == .disabled }.count,
            scenarioCount: routeScenarios.count,
            boundarySafeScenarioCount: routeScenarios.filter { $0.decision.respectsReadOnlyBoundary }.count,
            managedLaneCount: agentRegistry.managedLanes.count,
            managedAgentCount: agentRegistry.agents.count,
            personalLaneCount: pluginMesh.personalLanes.count,
            personalLaneToolCount: pluginMesh.personalLanes.reduce(0) { $0 + $1.mcpTools.count },
            mcpToolCount: mcpRuntime.toolCount,
            mcpResourceCount: mcpRuntime.resourceCount,
            mcpPromptCount: mcpRuntime.promptCount,
            runtimeBoundarySafe: runtimeBoundary.isSafe
        )
    }

    public var validationIssues: [String] {
        var issues: [String] = []

        func check(_ condition: Bool, _ issue: String) {
            if !condition {
                issues.append(issue)
            }
        }

        check(id == "seis-ai-core-runtime-snapshot", "id must identify the SEIS AI Core runtime snapshot.")
        check(schemaVersion == "1.0.0", "schemaVersion must be 1.0.0.")
        check(status == "local-readiness-linked", "status must remain local-readiness-linked.")
        check(mode == "Local Demo", "mode must remain Local Demo.")
        check(!purpose.isEmpty, "purpose must not be empty.")
        check(
            sourceOfTruth.output == "apps/seis-core/data/seis-ai-core-runtime-snapshot.json",
            "sourceOfTruth.output must point to the tracked runtime snapshot."
        )

        validateApplicationIntegration(check: check)
        validateProviderRegistry(check: check)
        validateRouter(check: check)
        validateAgentRegistry(check: check)
        validatePluginMesh(check: check)
        validateMCPRuntime(check: check)
        validateRuntimeBoundary(check: check)
        validateCrossReferences(check: check)

        check(!qualityGates.isEmpty, "qualityGates must not be empty.")
        check(
            qualityGates.contains("swift test --package-path packages/seis_platform_swift") ||
                qualityGates.contains("node --test packages/seis-ai/test/core-runtime-snapshot.test.mjs"),
            "qualityGates must include a runtime snapshot validation command."
        )

        return issues
    }

    public var isValid: Bool {
        validationIssues.isEmpty
    }
}

private extension SeisAICoreRuntimeSnapshotContract {
    typealias ValidationCheck = (Bool, String) -> Void

    static func structuralPreflightIssues(in data: Data) throws -> [String] {
        let jsonObject = try JSONSerialization.jsonObject(with: data)
        guard
            let root = jsonObject as? [String: Any],
            let router = root["router"] as? [String: Any],
            let scenarios = router["scenarios"] as? [Any]
        else {
            return []
        }

        var issues: [String] = []
        for (index, value) in scenarios.enumerated() {
            guard let scenario = value as? [String: Any] else {
                continue
            }
            let scenarioID = scenario["id"] as? String ?? String(index)
            let scenarioPath = "router.scenarios[\(scenarioID)]"
            guard let decision = scenario["decision"] as? [String: Any] else {
                continue
            }

            if !decision.keys.contains("registryProviderState") {
                issues.append(
                    "\(scenarioPath).decision.registryProviderState is required; use explicit null when absent."
                )
            }

            guard let modelClaimBoundary = decision["modelClaimBoundary"] as? [String: Any] else {
                continue
            }
            if !modelClaimBoundary.keys.contains("parameterCountBillion") {
                issues.append(
                    "\(scenarioPath).decision.modelClaimBoundary.parameterCountBillion is required; " +
                        "use explicit null when absent."
                )
            }
        }

        return issues
    }

    func validateApplicationIntegration(check: ValidationCheck) {
        check(
            applicationIntegration.id == "seis-ai-core-application-integration",
            "applicationIntegration.id must identify the read-only application contract."
        )
        check(
            applicationIntegration.status == "active-read-only",
            "applicationIntegration.status must remain active-read-only."
        )
        check(
            applicationIntegration.delivery.artifactTracked,
            "applicationIntegration.delivery.artifactTracked must be true."
        )
        check(
            applicationIntegration.delivery.trackedArtifact == sourceOfTruth.output,
            "applicationIntegration delivery and source-of-truth output must match."
        )
        check(
            applicationIntegration.delivery.hasNoLiveFallback,
            "applicationIntegration delivery must not enable network, MCP, or provider fallback."
        )

        let nativeConsumer = applicationIntegration.nativeConsumer
        check(
            nativeConsumer.id == "seis-platform-kit",
            "applicationIntegration.nativeConsumer.id must identify SeisPlatformKit."
        )
        check(
            nativeConsumer.root == "packages/seis_platform_swift",
            "applicationIntegration.nativeConsumer.root must identify the Swift package."
        )
        check(
            nativeConsumer.contract == "Sources/SeisPlatformKit/SeisAICoreRuntimeSnapshotContract.swift",
            "applicationIntegration.nativeConsumer.contract must identify this contract."
        )
        check(
            nativeConsumer.tests == "Tests/SeisPlatformKitTests/SeisAICoreRuntimeSnapshotContractTests.swift",
            "applicationIntegration.nativeConsumer.tests must identify this contract's tests."
        )
        check(
            nativeConsumer.decodeMode == "injected-data-read-only-validation",
            "applicationIntegration.nativeConsumer.decodeMode must remain injected-data-read-only-validation."
        )
        check(
            !nativeConsumer.runtimeAuthority,
            "applicationIntegration.nativeConsumer.runtimeAuthority must be false."
        )
        check(
            nativeConsumer.sourceArtifact == sourceOfTruth.output,
            "applicationIntegration.nativeConsumer.sourceArtifact must match sourceOfTruth.output."
        )
        check(
            nativeConsumer.contractPath ==
                "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAICoreRuntimeSnapshotContract.swift",
            "applicationIntegration.nativeConsumer contract path must resolve inside its declared root."
        )
        check(
            nativeConsumer.testsPath ==
                "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisAICoreRuntimeSnapshotContractTests.swift",
            "applicationIntegration.nativeConsumer tests path must resolve inside its declared root."
        )

        let browserArtifactPath = "\(applicationIntegration.consumer.root)/\(applicationIntegration.consumer.loadPath)"
        check(
            browserArtifactPath == sourceOfTruth.output,
            "applicationIntegration consumer root and loadPath must resolve to sourceOfTruth.output."
        )
        validateApplicationRuntimeBoundary(applicationIntegration.runtimeBoundary, check: check)

        let documentedStates = Set(applicationIntegration.providerStateSemantics.keys)
        let expectedStates = Set(SeisAICoreProviderState.allCases.map(\.rawValue))
        check(
            documentedStates == expectedStates,
            "applicationIntegration must document every typed provider state."
        )
    }

    func validateApplicationRuntimeBoundary(
        _ boundary: SeisAICoreApplicationRuntimeBoundary,
        check: ValidationCheck
    ) {
        check(!boundary.routeEligible, "applicationIntegration.runtimeBoundary.routeEligible must be false.")
        check(!boundary.executionPerformed, "applicationIntegration.runtimeBoundary.executionPerformed must be false.")
        check(
            !boundary.providerCallsPerformed,
            "applicationIntegration.runtimeBoundary.providerCallsPerformed must be false."
        )
        check(!boundary.fallbackUsed, "applicationIntegration.runtimeBoundary.fallbackUsed must be false.")
        check(!boundary.credentialsRead, "applicationIntegration.runtimeBoundary.credentialsRead must be false.")
        check(
            !boundary.promptBodiesIncluded,
            "applicationIntegration.runtimeBoundary.promptBodiesIncluded must be false."
        )
        check(!boundary.privateContentRead, "applicationIntegration.runtimeBoundary.privateContentRead must be false.")
        check(
            !boundary.liveMcpSessionStarted,
            "applicationIntegration.runtimeBoundary.liveMcpSessionStarted must be false."
        )
        check(!boundary.sshExecuted, "applicationIntegration.runtimeBoundary.sshExecuted must be false.")
        check(
            !boundary.deploymentPerformed,
            "applicationIntegration.runtimeBoundary.deploymentPerformed must be false."
        )
        check(
            !boundary.githubMutationPerformed,
            "applicationIntegration.runtimeBoundary.githubMutationPerformed must be false."
        )
        check(
            boundary.humanApprovalRequiredForLiveActions,
            "applicationIntegration.runtimeBoundary.humanApprovalRequiredForLiveActions must be true."
        )
    }

    func validateProviderRegistry(check: ValidationCheck) {
        let fixtures = providerRegistry.providers
        let providerIDs = fixtures.map(\.id)
        let metrics = summaryMetrics

        check(
            providerRegistry.id == "seis-ai-core-provider-registry",
            "providerRegistry.id must identify the SEIS AI Core provider registry."
        )
        check(
            providerRegistry.coreCredentialRequirement == "none",
            "providerRegistry.coreCredentialRequirement must remain none."
        )
        check(providerRegistry.localOnlyRespected, "providerRegistry.localOnlyRespected must be true.")
        check(
            providerRegistry.providerCount == fixtures.count,
            "providerRegistry.providerCount must match decoded provider fixtures."
        )
        check(
            providerRegistry.providerCount == Self.expectedProviderCount,
            "providerRegistry must contain exactly 7 provider fixtures for schema 1.0.0."
        )
        check(
            Set(providerIDs) == Set(Self.expectedProviderIDs) && Set(providerIDs).count == providerIDs.count,
            "providerRegistry provider fixture IDs must match the schema 1.0.0 inventory without duplicates."
        )
        check(
            providerRegistry.availableProviderCount == metrics.availableProviderCount,
            "providerRegistry.availableProviderCount must match typed provider states."
        )
        check(
            providerRegistry.routingEligibleProviderCount == metrics.routingEligibleProviderCount,
            "providerRegistry.routingEligibleProviderCount must match provider fixtures."
        )
        check(
            providerRegistry.missingKeyProviderCount == metrics.missingKeyProviderCount,
            "providerRegistry.missingKeyProviderCount must match typed provider states."
        )
        check(
            providerRegistry.disabledProviderCount == metrics.disabledProviderCount,
            "providerRegistry.disabledProviderCount must match typed provider states."
        )
        check(
            Set(providerRegistry.publicStates) == Set(SeisAICoreProviderState.allCases) &&
                Set(providerRegistry.publicStates).count == providerRegistry.publicStates.count,
            "providerRegistry.publicStates must contain every typed state exactly once."
        )

        for fixture in fixtures {
            let path = "providerRegistry.providers[\(fixture.id)]"
            check(!fixture.id.isEmpty, "\(path).id must not be empty.")
            check(!fixture.displayName.isEmpty, "\(path).displayName must not be empty.")
            check(fixture.backendOnly, "\(path).backendOnly must be true.")
            check(!fixture.frontendSecretAllowed, "\(path).frontendSecretAllowed must be false.")

            if fixture.routingEligible {
                check(fixture.configured, "\(path) must be configured when routingEligible is true.")
                check(fixture.enabled, "\(path) must be enabled when routingEligible is true.")
                check(
                    fixture.publicStatus == .available,
                    "\(path) must be Available when routingEligible is true."
                )
            }

            switch fixture.publicStatus {
            case .available:
                check(fixture.configured, "\(path) Available fixture must be configured.")
                check(fixture.enabled, "\(path) Available fixture must be enabled.")
            case .missingKey:
                check(!fixture.configured, "\(path) Missing Key fixture must not be configured.")
                check(!fixture.enabled, "\(path) Missing Key fixture must not be enabled.")
                check(!fixture.routingEligible, "\(path) Missing Key fixture must not be routing eligible.")
            case .disabled, .rateLimited, .error:
                check(!fixture.routingEligible, "\(path) unavailable fixture must not be routing eligible.")
            }
        }
    }

    func validateRouter(check: ValidationCheck) {
        let scenarios = router.scenarios
        let scenarioIDs = scenarios.map(\.id)
        let providerByID = Dictionary(
            providerRegistry.providers.map { ($0.id, $0) },
            uniquingKeysWith: { first, _ in first }
        )

        check(
            router.runtimeId == "seis-ai-core-read-only-router-runtime-v1",
            "router.runtimeId must identify the read-only runtime contract."
        )
        check(router.status == "review-only-no-runtime-authority", "router.status must deny runtime authority.")
        check(router.mode == "provider-neutral-read-only", "router.mode must remain provider-neutral-read-only.")
        check(router.scenarioCount == scenarios.count, "router.scenarioCount must match decoded scenarios.")
        check(
            router.scenarioCount == Self.expectedScenarioCount,
            "router must contain exactly 7 scenarios for schema 1.0.0."
        )
        check(
            Set(scenarioIDs) == Set(Self.expectedScenarioIDs) && Set(scenarioIDs).count == scenarioIDs.count,
            "router scenario IDs must match the schema 1.0.0 inventory without duplicates."
        )

        for scenario in scenarios {
            let decision = scenario.decision
            let path = "router.scenarios[\(scenario.id)].decision"
            check(!scenario.label.isEmpty, "router.scenarios[\(scenario.id)].label must not be empty.")
            check(!scenario.description.isEmpty, "router.scenarios[\(scenario.id)].description must not be empty.")
            check(
                hasOpaqueTraceIdentifierFormat(decision.decisionHash),
                "\(path).decisionHash must use the 64-character lowercase hexadecimal opaque trace format; " +
                    "format validation does not establish integrity or authenticity."
            )
            check(
                decision.status == "review-only-no-runtime-authority",
                "\(path).status must deny runtime authority."
            )
            check(!decision.routeEligible, "\(path).routeEligible must be false.")
            check(!decision.executionPerformed, "\(path).executionPerformed must be false.")
            check(!decision.providerCallsPerformed, "\(path).providerCallsPerformed must be false.")
            check(!decision.fallbackUsed, "\(path).fallbackUsed must be false.")
            check(decision.fallbackPlan == "feature-disabled", "\(path).fallbackPlan must disable the feature.")
            check(decision.agentLane.isPlanOnly, "\(path).agentLane must remain plan-only and non-executing.")
            check(!decision.requiredApprovals.isEmpty, "\(path).requiredApprovals must not be empty.")
            check(!decision.blockedReasons.isEmpty, "\(path).blockedReasons must not be empty.")
            validateRouteSafetyBoundary(decision.safetyBoundary, path: path, check: check)
            check(decision.modelClaimBoundary.isClaimSafe, "\(path).modelClaimBoundary must remain claim-safe.")

            if decision.selectedProvider == "none" {
                check(decision.selectedModel == "none", "\(path).selectedModel must be none without a provider.")
                check(decision.providerState == .disabled, "\(path).providerState must be Disabled without a provider.")
                check(
                    decision.registryProviderState == nil,
                    "\(path).registryProviderState must be nil without a provider."
                )
            } else if let fixture = providerByID[decision.selectedProvider] {
                check(
                    decision.providerState.rawValue == fixture.publicStatus.rawValue,
                    "\(path).providerState must match the selected provider fixture."
                )
                check(
                    decision.registryProviderState?.rawValue == fixture.publicStatus.rawValue,
                    "\(path).registryProviderState must match the selected provider fixture."
                )
                check(
                    decision.selectedModel == fixture.actualModel,
                    "\(path).selectedModel must match the selected provider fixture."
                )
                check(fixture.routingEligible, "\(path) may reference only a fixture marked routing eligible.")
                if scenario.input.localOnly {
                    check(
                        !fixture.privacyClass.lowercased().contains("cloud"),
                        "\(path) local-only scenario must not select a cloud provider."
                    )
                }
            } else {
                check(false, "\(path).selectedProvider must reference a decoded provider fixture or none.")
            }
        }

        if let privateVault = scenarios.first(where: { $0.id == "private-vault-block" }) {
            let decision = privateVault.decision
            check(privateVault.input.localOnly, "private-vault-block must remain local-only.")
            check(decision.selectedProvider == "none", "private-vault-block must not select a provider.")
            check(decision.selectedModel == "none", "private-vault-block must not select a model.")
            check(decision.providerState == .disabled, "private-vault-block provider state must be Disabled.")
            check(!decision.routeEligible, "private-vault-block must not be route eligible.")
            check(
                decision.blockedReasons.contains { $0.lowercased().contains("private obsidian") },
                "private-vault-block must explain the private content boundary."
            )
        } else {
            check(false, "router must include the private-vault-block scenario.")
        }

        if let frontier = scenarios.first(where: { $0.id == "frontier-model-block" }) {
            check(frontier.decision.selectedProvider == "none", "frontier-model-block must not select a provider.")
            check(frontier.decision.providerState == .disabled, "frontier-model-block provider state must be Disabled.")
            check(!frontier.decision.routeEligible, "frontier-model-block must not be route eligible.")
        } else {
            check(false, "router must include the frontier-model-block scenario.")
        }
    }

    func validateRouteSafetyBoundary(
        _ boundary: SeisAICoreRouteSafetyBoundary,
        path: String,
        check: ValidationCheck
    ) {
        check(!boundary.credentialsRead, "\(path).safetyBoundary.credentialsRead must be false.")
        check(!boundary.promptBodyRead, "\(path).safetyBoundary.promptBodyRead must be false.")
        check(!boundary.privateContentRead, "\(path).safetyBoundary.privateContentRead must be false.")
        check(!boundary.networkCalled, "\(path).safetyBoundary.networkCalled must be false.")
        check(!boundary.sshExecuted, "\(path).safetyBoundary.sshExecuted must be false.")
        check(!boundary.deploymentPerformed, "\(path).safetyBoundary.deploymentPerformed must be false.")
        check(!boundary.githubMutationPerformed, "\(path).safetyBoundary.githubMutationPerformed must be false.")
    }

    func validateAgentRegistry(check: ValidationCheck) {
        let lanes = agentRegistry.managedLanes
        let agents = agentRegistry.agents
        let laneIDs = lanes.map(\.id)
        let agentIDs = agents.map(\.id)

        check(
            agentRegistry.id == "seis-second-brain-system",
            "agentRegistry.id must identify the canonical Second Brain system."
        )
        check(
            agentRegistry.status == "review-only-agent-registry",
            "agentRegistry.status must remain review-only-agent-registry."
        )
        check(agentRegistry.mode == "local-demo", "agentRegistry.mode must remain local-demo.")
        check(
            sourceOfTruth.agentRegistry == "content/development/seis-second-brain-system.json",
            "sourceOfTruth.agentRegistry must identify the canonical Second Brain contract."
        )
        check(
            agentRegistry.source == sourceOfTruth.agentRegistry,
            "agentRegistry.source must match sourceOfTruth.agentRegistry."
        )
        check(
            agentRegistry.sourceQualityGate == "npm run check:seis-second-brain",
            "agentRegistry.sourceQualityGate must identify the canonical Second Brain check."
        )
        check(
            agentRegistry.decision == "NO-GO-autonomous-execution-not-approved",
            "agentRegistry.decision must keep autonomous execution at NO-GO."
        )
        check(
            agentRegistry.truthBoundary ==
                "Whitelisted public Second Brain contract only. Vault paths, training paths, installed AI profiles, " +
                "generated audit reports, credentials, prompts, and private note content are excluded.",
            "agentRegistry.truthBoundary must preserve the public whitelist and private/local exclusions."
        )
        check(
            agentRegistry.managedLaneCount == lanes.count,
            "agentRegistry.managedLaneCount must match decoded managed lanes."
        )
        check(
            agentRegistry.managedLaneCount == Self.expectedManagedLaneCount,
            "agentRegistry must contain exactly 9 managed lanes for schema 1.0.0."
        )
        check(
            laneIDs == Self.expectedManagedLaneIDs,
            "agentRegistry managed lane IDs must exactly match the schema 1.0.0 inventory."
        )
        check(
            agentRegistry.agentCount == agents.count,
            "agentRegistry.agentCount must match decoded managed agents."
        )
        check(
            agentRegistry.agentCount == Self.expectedManagedAgentCount,
            "agentRegistry must contain exactly 13 managed agents for schema 1.0.0."
        )
        check(
            agentIDs == Self.expectedManagedAgentIDs,
            "agentRegistry managed agent IDs must exactly match the schema 1.0.0 inventory."
        )
        check(!agentRegistry.runtimeAuthority, "agentRegistry.runtimeAuthority must be false.")
        check(
            agentRegistry.permissionBoundary == "status-and-plan-only",
            "agentRegistry.permissionBoundary must remain status-and-plan-only."
        )

        for lane in lanes {
            let path = "agentRegistry.managedLanes[\(lane.id)]"
            check(!lane.displayName.isEmpty, "\(path).displayName must not be empty.")
            check(lane.status == "status-and-plan-only", "\(path).status must remain status-and-plan-only.")
        }

        for agent in agents {
            let path = "agentRegistry.agents[\(agent.id)]"
            check(!agent.displayName.isEmpty, "\(path).displayName must not be empty.")
            check(!agent.duty.isEmpty, "\(path).duty must not be empty.")
            check(!agent.executionAuthority, "\(path).executionAuthority must be false.")
            if agent.id == "security-agent" {
                check(
                    agent.status == "blocking-review-gate",
                    "agentRegistry.agents[security-agent].status must remain blocking-review-gate."
                )
            } else {
                check(agent.status == "status-plan-only", "\(path).status must remain status-plan-only.")
            }
        }

        let safetyClaims: [(String, Bool)] = [
            ("storesSecrets", agentRegistry.safetyBoundary.storesSecrets),
            ("providerCalls", agentRegistry.safetyBoundary.providerCalls),
            ("sshExecution", agentRegistry.safetyBoundary.sshExecution),
            ("deployment", agentRegistry.safetyBoundary.deployment),
            ("githubMutation", agentRegistry.safetyBoundary.githubMutation)
        ]
        for (name, value) in safetyClaims {
            check(!value, "agentRegistry.safetyBoundary.\(name) must be false.")
        }
        check(
            agentRegistry.humanApprovalRequiredForMutation,
            "agentRegistry.humanApprovalRequiredForMutation must be true."
        )
    }

    func validatePluginMesh(check: ValidationCheck) {
        let lanes = pluginMesh.personalLanes
        let laneIDs = lanes.map(\.id)
        let toolCount = lanes.reduce(0) { $0 + $1.mcpTools.count }

        check(pluginMesh.id == "seis-agent-plugin-integration", "pluginMesh.id must identify the plugin integration.")
        check(pluginMesh.status == "active", "pluginMesh.status must remain active.")
        check(pluginMesh.installedEnabledCount >= 0, "pluginMesh.installedEnabledCount must not be negative.")
        check(pluginMesh.notInstalledCount >= 0, "pluginMesh.notInstalledCount must not be negative.")
        check(pluginMesh.helperUniquePlugins >= 0, "pluginMesh.helperUniquePlugins must not be negative.")
        check(pluginMesh.helperCapabilityLaneCount >= 0, "pluginMesh.helperCapabilityLaneCount must not be negative.")
        check(pluginMesh.personalLaneCount == lanes.count, "pluginMesh.personalLaneCount must match decoded lanes.")
        check(
            pluginMesh.personalLaneCount == Self.expectedPersonalLaneCount,
            "pluginMesh must contain exactly 5 personal lanes for schema 1.0.0."
        )
        check(
            Set(laneIDs) == Set(Self.expectedPersonalLaneIDs) && Set(laneIDs).count == laneIDs.count,
            "pluginMesh personal lane IDs must match the schema 1.0.0 inventory without duplicates."
        )
        check(pluginMesh.personalLaneToolCount == toolCount, "pluginMesh.personalLaneToolCount must match lane tools.")
        check(pluginMesh.personalLaneToolCount == 10, "pluginMesh must expose exactly 10 personal lane tools.")
        check(pluginMesh.mcpMesh.id == "seis-plugin-mcp-mesh", "pluginMesh.mcpMesh.id must identify the local MCP mesh.")
        check(pluginMesh.mcpMesh.schemaVersion == "1.0.0", "pluginMesh.mcpMesh.schemaVersion must remain 1.0.0.")
        check(pluginMesh.mcpMesh.serverCount == pluginMesh.mcpMesh.servers.count, "pluginMesh.mcpMesh.serverCount must match decoded servers.")
        check(pluginMesh.mcpMesh.serverCount == 6, "pluginMesh.mcpMesh must expose exactly six bundled MCP entrypoints.")
        check(pluginMesh.mcpMesh.configuredServerCount == 6, "pluginMesh.mcpMesh must expose six configured MCP entrypoints.")
        check(pluginMesh.mcpMesh.status == "configured-local-read-only", "pluginMesh.mcpMesh must remain configured and read-only.")
        check(pluginMesh.mcpMesh.boundary.liveSessionStarted == false, "pluginMesh.mcpMesh must not claim a live MCP session.")
        check(pluginMesh.mcpMesh.boundary.probeOptIn, "pluginMesh.mcpMesh probing must remain opt-in.")
        check(pluginMesh.mcpMesh.boundary.shell == false, "pluginMesh.mcpMesh must not enable a shell.")
        check(pluginMesh.mcpMesh.boundary.credentialsRead == false, "pluginMesh.mcpMesh must not read credentials.")
        check(pluginMesh.mcpMesh.boundary.networkCalled == false, "pluginMesh.mcpMesh must not call the network.")
        check(pluginMesh.mcpMesh.boundary.externalMutationPerformed == false, "pluginMesh.mcpMesh must not perform external mutation.")
        check(pluginMesh.mcpMesh.boundary.humanApprovalRequiredForExternalMutation, "pluginMesh.mcpMesh must require approval for external mutation.")
        check(Set(pluginMesh.mcpMesh.servers.map(\.id)).count == pluginMesh.mcpMesh.servers.count, "pluginMesh.mcpMesh server IDs must be unique.")
        for server in pluginMesh.mcpMesh.servers {
            let path = "pluginMesh.mcpMesh.servers[\(server.id)]"
            check(server.status == "configured", "\(path).status must be configured in the static native snapshot.")
            check(server.serverId == server.id, "\(path).serverId must match id.")
            check(server.configExists && server.pluginManifestExists && server.skillRootExists && server.entrypointExists, "\(path) must have local source files.")
            check(server.command == "node", "\(path).command must remain node.")
            check(server.args.count == 1 && server.args.first?.isEmpty == false, "\(path).args must contain one entrypoint argument.")
            check(server.entrypoint?.isEmpty == false, "\(path).entrypoint must not be empty.")
            check(server.executionAuthority == false, "\(path).executionAuthority must be false.")
            check(server.credentialsRead == false, "\(path).credentialsRead must be false.")
            check(server.networkCalled == false, "\(path).networkCalled must be false.")
            check(server.externalMutationPerformed == false, "\(path).externalMutationPerformed must be false.")
            check(server.toolInventory.mode == "not-probed", "\(path).toolInventory must remain static until opt-in probe evidence is supplied.")
            check(server.toolInventory.toolCount == nil, "\(path).toolInventory.toolCount must remain nil until probed.")
            check(server.toolInventory.toolNames.isEmpty, "\(path).toolInventory.toolNames must remain empty until probed.")
        }

        for lane in lanes {
            let path = "pluginMesh.personalLanes[\(lane.id)]"
            check(!lane.displayName.isEmpty, "\(path).displayName must not be empty.")
            check(!lane.role.isEmpty, "\(path).role must not be empty.")
            check(lane.mcpTools.count == 2, "\(path).mcpTools must contain status and plan tools.")
            check(Set(lane.mcpTools).count == lane.mcpTools.count, "\(path).mcpTools must not contain duplicates.")
            check(!lane.qualityGate.isEmpty, "\(path).qualityGate must not be empty.")
        }
    }

    func validateMCPRuntime(check: ValidationCheck) {
        let counts = mcpRuntime.counts
        let surfaceIDs = mcpRuntime.surfaces.map(\.id)
        let surfaceByID = Dictionary(
            mcpRuntime.surfaces.map { ($0.id, $0) },
            uniquingKeysWith: { first, _ in first }
        )

        check(mcpRuntime.id == "seis-ai-core-mcp-runtime-contract", "mcpRuntime.id must identify the MCP contract.")
        check(mcpRuntime.status == "local-smoke-verified", "mcpRuntime.status must remain local-smoke-verified.")
        check(mcpRuntime.transport == "stdio JSON-RPC", "mcpRuntime.transport must remain local stdio JSON-RPC.")
        check(counts == Self.expectedMCPCounts, "mcpRuntime must report exactly 37 tools, 30 resources, and 3 prompts.")
        check(Set(surfaceIDs).count == surfaceIDs.count, "mcpRuntime.surfaces must not contain duplicate IDs.")
        check(surfaceByID["tools"]?.count == counts.tools, "mcpRuntime tools surface count must match toolCount.")
        check(
            surfaceByID["resources"]?.count == counts.resources,
            "mcpRuntime resources surface count must match resourceCount."
        )
        check(surfaceByID["prompts"]?.count == counts.prompts, "mcpRuntime prompts surface count must match promptCount.")
        check(!mcpRuntime.boundary.isEmpty, "mcpRuntime.boundary must not be empty.")
    }

    func validateRuntimeBoundary(check: ValidationCheck) {
        check(!runtimeBoundary.providerCalls, "runtimeBoundary.providerCalls must be false.")
        check(!runtimeBoundary.credentialsRead, "runtimeBoundary.credentialsRead must be false.")
        check(!runtimeBoundary.frontendSecretsAllowed, "runtimeBoundary.frontendSecretsAllowed must be false.")
        check(!runtimeBoundary.liveMcpSessionStarted, "runtimeBoundary.liveMcpSessionStarted must be false.")
        check(!runtimeBoundary.sshExecuted, "runtimeBoundary.sshExecuted must be false.")
        check(!runtimeBoundary.deploymentPerformed, "runtimeBoundary.deploymentPerformed must be false.")
        check(!runtimeBoundary.githubMutationPerformed, "runtimeBoundary.githubMutationPerformed must be false.")
        check(!runtimeBoundary.privateContentRead, "runtimeBoundary.privateContentRead must be false.")
        check(!runtimeBoundary.routeExecutionPerformed, "runtimeBoundary.routeExecutionPerformed must be false.")
        check(
            runtimeBoundary.humanApprovalRequiredForLiveActions,
            "runtimeBoundary.humanApprovalRequiredForLiveActions must be true."
        )
    }

    func validateCrossReferences(check: ValidationCheck) {
        let personalLaneIDs = Set(pluginMesh.personalLanes.map(\.id))
        let managedLaneIDs = Set(agentRegistry.managedLanes.map(\.id))
        let routedLaneIDs = Set(router.scenarios.map(\.decision.agentLane.id))
        let applicationBoundary = applicationIntegration.runtimeBoundary

        check(
            routedLaneIDs == Set(Self.expectedPersonalLaneIDs),
            "router scenarios must cover every schema 1.0.0 personal agent lane."
        )
        check(
            routedLaneIDs.isSubset(of: personalLaneIDs),
            "every route decision agent lane must exist in pluginMesh.personalLanes."
        )
        check(
            personalLaneIDs.isSubset(of: managedLaneIDs),
            "every pluginMesh personal lane must exist in agentRegistry.managedLanes."
        )
        check(
            routedLaneIDs.isSubset(of: managedLaneIDs),
            "every route decision agent lane must exist in agentRegistry.managedLanes."
        )

        check(
            applicationBoundary.routeEligible == router.scenarios.contains { $0.decision.routeEligible },
            "applicationIntegration runtime route eligibility must match route scenarios."
        )
        check(
            applicationBoundary.executionPerformed ==
                router.scenarios.contains { $0.decision.executionPerformed } &&
                applicationBoundary.executionPerformed == runtimeBoundary.routeExecutionPerformed,
            "applicationIntegration runtime execution state must match route and top-level boundaries."
        )
        check(
            applicationBoundary.providerCallsPerformed ==
                router.scenarios.contains { $0.decision.providerCallsPerformed } &&
                applicationBoundary.providerCallsPerformed == runtimeBoundary.providerCalls,
            "applicationIntegration provider-call state must match route and top-level boundaries."
        )
        check(
            applicationBoundary.fallbackUsed == router.scenarios.contains { $0.decision.fallbackUsed },
            "applicationIntegration fallback state must match route scenarios."
        )
        check(
            applicationBoundary.credentialsRead ==
                router.scenarios.contains { $0.decision.safetyBoundary.credentialsRead } &&
                applicationBoundary.credentialsRead == runtimeBoundary.credentialsRead,
            "applicationIntegration credential state must match route and top-level boundaries."
        )
        check(
            applicationBoundary.promptBodiesIncluded ==
                router.scenarios.contains { $0.decision.safetyBoundary.promptBodyRead },
            "applicationIntegration prompt-body state must match route safety boundaries."
        )
        check(
            applicationBoundary.privateContentRead ==
                router.scenarios.contains { $0.decision.safetyBoundary.privateContentRead } &&
                applicationBoundary.privateContentRead == runtimeBoundary.privateContentRead,
            "applicationIntegration private-content state must match route and top-level boundaries."
        )
        check(
            applicationBoundary.liveMcpSessionStarted == runtimeBoundary.liveMcpSessionStarted,
            "applicationIntegration live MCP state must match the top-level runtime boundary."
        )
        check(
            applicationBoundary.sshExecuted ==
                router.scenarios.contains { $0.decision.safetyBoundary.sshExecuted } &&
                applicationBoundary.sshExecuted == runtimeBoundary.sshExecuted,
            "applicationIntegration SSH state must match route and top-level boundaries."
        )
        check(
            applicationBoundary.deploymentPerformed ==
                router.scenarios.contains { $0.decision.safetyBoundary.deploymentPerformed } &&
                applicationBoundary.deploymentPerformed == runtimeBoundary.deploymentPerformed,
            "applicationIntegration deployment state must match route and top-level boundaries."
        )
        check(
            applicationBoundary.githubMutationPerformed ==
                router.scenarios.contains { $0.decision.safetyBoundary.githubMutationPerformed } &&
                applicationBoundary.githubMutationPerformed == runtimeBoundary.githubMutationPerformed,
            "applicationIntegration GitHub state must match route and top-level boundaries."
        )
        check(
            applicationBoundary.humanApprovalRequiredForLiveActions ==
                runtimeBoundary.humanApprovalRequiredForLiveActions,
            "applicationIntegration approval state must match the top-level runtime boundary."
        )
        check(
            agentRegistry.safetyBoundary.providerCalls == runtimeBoundary.providerCalls &&
                agentRegistry.safetyBoundary.sshExecution == runtimeBoundary.sshExecuted &&
                agentRegistry.safetyBoundary.deployment == runtimeBoundary.deploymentPerformed &&
                agentRegistry.safetyBoundary.githubMutation == runtimeBoundary.githubMutationPerformed,
            "agentRegistry safety flags must match the corresponding top-level runtime boundaries."
        )

        let laneByID = Dictionary(
            pluginMesh.personalLanes.map { ($0.id, $0) },
            uniquingKeysWith: { first, _ in first }
        )
        for scenario in router.scenarios {
            let agentLane = scenario.decision.agentLane
            guard let personalLane = laneByID[agentLane.id] else {
                continue
            }
            check(
                personalLane.mcpTools.contains(agentLane.statusTool),
                "router.scenarios[\(scenario.id)] status tool must exist in its personal lane."
            )
            check(
                personalLane.mcpTools.contains(agentLane.planTool),
                "router.scenarios[\(scenario.id)] plan tool must exist in its personal lane."
            )
        }
    }

    /// Checks only the serialized trace-id shape. It does not authenticate the decision or its contents.
    func hasOpaqueTraceIdentifierFormat(_ value: String) -> Bool {
        let lowercaseHexCharacters = Set("0123456789abcdef")
        return value.count == 64 && value.allSatisfy(lowercaseHexCharacters.contains)
    }
}
