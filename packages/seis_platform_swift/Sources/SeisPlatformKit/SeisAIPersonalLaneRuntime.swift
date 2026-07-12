import Foundation

public enum SeisAIPersonalLaneAction: String, CaseIterable, Codable, Equatable, Hashable, Sendable {
    case inspectCapabilityContract = "inspect-capability-contract"
    case prepareReadOnlyPlan = "prepare-read-only-plan"
    case reviewQualityGate = "review-quality-gate"
    case invokeMCP = "invoke-mcp"
    case networkRequest = "network-request"
    case writeWorkspace = "write-workspace"
    case readPrivateContent = "read-private-content"
    case readSecrets = "read-secrets"
    case ssh = "ssh"
    case deployment = "deployment"
    case githubMutation = "github-mutation"
}

public struct SeisAIPersonalLaneDefinition: Codable, Equatable, Identifiable, Sendable {
    public static let readOnlyActions: Set<SeisAIPersonalLaneAction> = [
        .inspectCapabilityContract,
        .prepareReadOnlyPlan,
        .reviewQualityGate
    ]

    public static let prohibitedActions: Set<SeisAIPersonalLaneAction> = [
        .invokeMCP,
        .networkRequest,
        .writeWorkspace,
        .readPrivateContent,
        .readSecrets,
        .ssh,
        .deployment,
        .githubMutation
    ]

    public let id: String
    public let displayName: String
    public let role: String
    public let declaredMCPToolIDs: [String]
    public let qualityGate: String

    public init(
        id: String,
        displayName: String,
        role: String,
        declaredMCPToolIDs: [String],
        qualityGate: String
    ) {
        self.id = id
        self.displayName = displayName
        self.role = role
        self.declaredMCPToolIDs = declaredMCPToolIDs
        self.qualityGate = qualityGate
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            issues.append("personal lane id must not be empty")
        }
        if displayName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            issues.append("personal lane displayName must not be empty")
        }
        if role.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            issues.append("personal lane role must not be empty")
        }
        if declaredMCPToolIDs.isEmpty || declaredMCPToolIDs.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("personal lane declaredMCPToolIDs must contain only non-empty values")
        }
        if Set(declaredMCPToolIDs).count != declaredMCPToolIDs.count {
            issues.append("personal lane declaredMCPToolIDs must not contain duplicates")
        }
        if qualityGate.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            issues.append("personal lane qualityGate must not be empty")
        }
        return issues
    }
}

public enum SeisAIPersonalLaneRuntimeError: Error, Equatable, Sendable {
    case unsafePluginMesh
    case duplicateLaneIDs([String])
    case invalidLane(laneID: String, issues: [String])
}

public struct SeisAIPersonalLaneTaskRequest: Codable, Equatable, Identifiable, Sendable {
    public static let maximumPurposeLength = 512

    public let id: String
    public let laneID: String
    public let purpose: String
    public let requestedActions: Set<SeisAIPersonalLaneAction>
    public let requestedMCPToolIDs: [String]
    public let inputReferences: [String]

    public init(
        id: String,
        laneID: String,
        purpose: String,
        requestedActions: Set<SeisAIPersonalLaneAction>,
        requestedMCPToolIDs: [String] = [],
        inputReferences: [String] = []
    ) {
        self.id = id
        self.laneID = laneID
        self.purpose = purpose
        self.requestedActions = requestedActions
        self.requestedMCPToolIDs = requestedMCPToolIDs
        self.inputReferences = inputReferences
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            issues.append("personal lane task id must not be empty")
        }
        if laneID.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            issues.append("personal lane task laneID must not be empty")
        }
        let normalizedPurpose = purpose.trimmingCharacters(in: .whitespacesAndNewlines)
        if normalizedPurpose.isEmpty || normalizedPurpose.count > Self.maximumPurposeLength {
            issues.append("personal lane task purpose must contain 1...\(Self.maximumPurposeLength) characters")
        }
        if requestedActions.isEmpty {
            issues.append("personal lane task requestedActions must not be empty")
        }
        if Set(requestedMCPToolIDs).count != requestedMCPToolIDs.count {
            issues.append("personal lane task requestedMCPToolIDs must not contain duplicates")
        }
        if Set(inputReferences).count != inputReferences.count {
            issues.append("personal lane task inputReferences must not contain duplicates")
        }
        if requestedMCPToolIDs.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("personal lane task requestedMCPToolIDs must contain only non-empty values")
        }
        if inputReferences.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("personal lane task inputReferences must contain only non-empty values")
        }
        return issues
    }
}

public enum SeisAIPersonalLanePlanOutcome: String, CaseIterable, Codable, Equatable, Sendable {
    case planned
    case blocked
}

public struct SeisAIPersonalLaneTaskPlan: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let taskID: String
    public let laneID: String
    public let outcome: SeisAIPersonalLanePlanOutcome
    public let plannedActions: [SeisAIPersonalLaneAction]
    public let blockedActions: [SeisAIPersonalLaneAction]
    public let declaredMCPToolIDs: [String]
    public let requestedMCPToolIDs: [String]
    public let acceptedInputReferences: [String]
    public let qualityGate: String?
    public let validationRules: [String]
    public let requiredApprovals: [String]
    public let blockedReasons: [String]
    public let mcpInvocationPerformed: Bool
    public let executionPerformed: Bool

    public init(
        id: String,
        taskID: String,
        laneID: String,
        outcome: SeisAIPersonalLanePlanOutcome,
        plannedActions: [SeisAIPersonalLaneAction],
        blockedActions: [SeisAIPersonalLaneAction],
        declaredMCPToolIDs: [String],
        requestedMCPToolIDs: [String],
        acceptedInputReferences: [String] = [],
        qualityGate: String?,
        validationRules: [String],
        requiredApprovals: [String],
        blockedReasons: [String],
        mcpInvocationPerformed: Bool = false,
        executionPerformed: Bool = false
    ) {
        self.id = id
        self.taskID = taskID
        self.laneID = laneID
        self.outcome = outcome
        self.plannedActions = plannedActions
        self.blockedActions = blockedActions
        self.declaredMCPToolIDs = declaredMCPToolIDs
        self.requestedMCPToolIDs = requestedMCPToolIDs
        self.acceptedInputReferences = acceptedInputReferences
        self.qualityGate = qualityGate
        self.validationRules = validationRules
        self.requiredApprovals = requiredApprovals
        self.blockedReasons = blockedReasons
        self.mcpInvocationPerformed = mcpInvocationPerformed
        self.executionPerformed = executionPerformed
    }

    public var isReadOnly: Bool {
        !mcpInvocationPerformed && !executionPerformed
    }

    public static func blockedWithoutValidatedRuntime(
        request: SeisAIPersonalLaneTaskRequest
    ) -> SeisAIPersonalLaneTaskPlan {
        SeisAIPersonalLaneTaskPlan(
            id: "personal-lane-plan:\(request.id):blocked",
            taskID: request.id,
            laneID: request.laneID,
            outcome: .blocked,
            plannedActions: [],
            blockedActions: request.requestedActions.sorted { $0.rawValue < $1.rawValue },
            declaredMCPToolIDs: [],
            requestedMCPToolIDs: request.requestedMCPToolIDs,
            acceptedInputReferences: [],
            qualityGate: nil,
            validationRules: ["fail-closed-without-personal-lane-runtime"],
            requiredApprovals: [],
            blockedReasons: ["no validated personal lane runtime was injected"]
        )
    }
}

public struct SeisAIPersonalLaneRuntime: Sendable {
    public static let permittedLocalDemoInputReferences: Set<String> = [
        "apps/seis-core/data/seis-ai-core-runtime-snapshot.json"
    ]

    public let definitions: [SeisAIPersonalLaneDefinition]
    private let definitionsByID: [String: SeisAIPersonalLaneDefinition]

    public init(definitions: [SeisAIPersonalLaneDefinition]) throws {
        let duplicateLaneIDs = definitions
            .reduce(into: [String: Int]()) { counts, definition in
                counts[definition.id, default: 0] += 1
            }
            .filter { $0.value > 1 }
            .map(\.key)
            .sorted()
        guard duplicateLaneIDs.isEmpty else {
            throw SeisAIPersonalLaneRuntimeError.duplicateLaneIDs(duplicateLaneIDs)
        }

        for definition in definitions where !definition.validationIssues.isEmpty {
            throw SeisAIPersonalLaneRuntimeError.invalidLane(
                laneID: definition.id,
                issues: definition.validationIssues
            )
        }

        self.definitions = definitions
        self.definitionsByID = Dictionary(uniqueKeysWithValues: definitions.map { ($0.id, $0) })
    }

    public static func readOnly(
        from snapshot: SeisAICoreRuntimeSnapshotContract
    ) throws -> SeisAIPersonalLaneRuntime {
        let lanes = snapshot.pluginMesh.personalLanes
        let laneIDs = lanes.map(\.id)
        let expectedLaneIDs = SeisAICoreRuntimeSnapshotContract.expectedPersonalLaneIDs
        let expectedToolCount = lanes.reduce(0) { partialResult, lane in
            partialResult + lane.mcpTools.count
        }

        guard
            snapshot.isValid,
            snapshot.runtimeBoundary.isSafe,
            snapshot.applicationIntegration.runtimeBoundary.isSafe,
            snapshot.pluginMesh.personalLaneCount == SeisAICoreRuntimeSnapshotContract.expectedPersonalLaneCount,
            Set(laneIDs) == Set(expectedLaneIDs),
            Set(laneIDs).count == expectedLaneIDs.count,
            snapshot.pluginMesh.personalLaneToolCount == expectedToolCount,
            lanes.allSatisfy({ !$0.mcpTools.isEmpty })
        else {
            throw SeisAIPersonalLaneRuntimeError.unsafePluginMesh
        }

        let definitions = expectedLaneIDs.compactMap { laneID in
            guard let lane = lanes.first(where: { $0.id == laneID }) else {
                return nil
            }
            SeisAIPersonalLaneDefinition(
                id: lane.id,
                displayName: lane.displayName,
                role: lane.role,
                declaredMCPToolIDs: lane.mcpTools,
                qualityGate: lane.qualityGate
            )
        }
        guard definitions.count == expectedLaneIDs.count else {
            throw SeisAIPersonalLaneRuntimeError.unsafePluginMesh
        }
        return try SeisAIPersonalLaneRuntime(definitions: definitions)
    }

    public func makePlan(
        for request: SeisAIPersonalLaneTaskRequest
    ) -> SeisAIPersonalLaneTaskPlan {
        var issues = request.validationIssues
        guard let definition = definitionsByID[request.laneID] else {
            issues.append("personal lane \(request.laneID) is not registered")
            return blockedPlan(
                request: request,
                definition: nil,
                issues: issues
            )
        }

        let prohibitedActions = request.requestedActions
            .intersection(SeisAIPersonalLaneDefinition.prohibitedActions)
        if !prohibitedActions.isEmpty {
            issues.append("requested actions cross the personal lane read-only boundary")
        }

        let unsupportedActions = request.requestedActions
            .subtracting(SeisAIPersonalLaneDefinition.readOnlyActions)
        if !unsupportedActions.isEmpty {
            issues.append("requested actions are not supported by the personal lane runtime")
        }

        let undeclaredToolIDs = request.requestedMCPToolIDs
            .filter { !definition.declaredMCPToolIDs.contains($0) }
        if !undeclaredToolIDs.isEmpty {
            issues.append("requested MCP tools are not declared by lane \(definition.id): \(undeclaredToolIDs.sorted().joined(separator: ", "))")
        }

        let unpermittedInputReferences = request.inputReferences
            .filter { !Self.permittedLocalDemoInputReferences.contains($0) }
        if !unpermittedInputReferences.isEmpty {
            issues.append(
                "input references are outside the Local Demo allow-list: \(unpermittedInputReferences.sorted().joined(separator: ", "))"
            )
        }

        guard issues.isEmpty else {
            return blockedPlan(
                request: request,
                definition: definition,
                issues: issues
            )
        }

        return SeisAIPersonalLaneTaskPlan(
            id: "personal-lane-plan:\(request.id):planned",
            taskID: request.id,
            laneID: definition.id,
            outcome: .planned,
            plannedActions: request.requestedActions.sorted { $0.rawValue < $1.rawValue },
            blockedActions: [],
            declaredMCPToolIDs: definition.declaredMCPToolIDs,
            requestedMCPToolIDs: request.requestedMCPToolIDs,
            acceptedInputReferences: request.inputReferences,
            qualityGate: definition.qualityGate,
            validationRules: [
                "read-only-personal-lane-plan",
                "declared-tools-only",
                "no-live-mcp-invocation",
                "no-secret-access"
            ],
            requiredApprovals: [
                "human approval before any MCP invocation, network, workspace mutation, SSH, deployment, or GitHub action"
            ],
            blockedReasons: []
        )
    }

    private func blockedPlan(
        request: SeisAIPersonalLaneTaskRequest,
        definition: SeisAIPersonalLaneDefinition?,
        issues: [String]
    ) -> SeisAIPersonalLaneTaskPlan {
        SeisAIPersonalLaneTaskPlan(
            id: "personal-lane-plan:\(request.id):blocked",
            taskID: request.id,
            laneID: request.laneID,
            outcome: .blocked,
            plannedActions: [],
            blockedActions: request.requestedActions.sorted { $0.rawValue < $1.rawValue },
            declaredMCPToolIDs: definition?.declaredMCPToolIDs ?? [],
            requestedMCPToolIDs: request.requestedMCPToolIDs,
            acceptedInputReferences: [],
            qualityGate: definition?.qualityGate,
            validationRules: ["read-only-personal-lane-plan", "fail-closed-on-invalid-request"],
            requiredApprovals: [
                "human approval before any MCP invocation, network, workspace mutation, SSH, deployment, or GitHub action"
            ],
            blockedReasons: Array(Set(issues)).sorted()
        )
    }
}
