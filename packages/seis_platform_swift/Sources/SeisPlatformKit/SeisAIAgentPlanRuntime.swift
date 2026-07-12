import Foundation

public enum SeisAIAgentAction: String, CaseIterable, Codable, Equatable, Hashable, Sendable {
    case inspectRepositoryMetadata = "inspect-repository-metadata"
    case readScopedWorkspaceFiles = "read-scoped-workspace-files"
    case producePlan = "produce-plan"
    case produceReview = "produce-review"
    case runLocalValidation = "run-local-validation"
    case writeWorkspace = "write-workspace"
    case providerCall = "provider-call"
    case networkRequest = "network-request"
    case mcpInvocation = "mcp-invocation"
    case readPrivateContent = "read-private-content"
    case readSecrets = "read-secrets"
    case ssh = "ssh"
    case deployment = "deployment"
    case githubMutation = "github-mutation"
}

public struct SeisAIAgentDefinition: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let displayName: String
    public let purpose: String
    public let allowedActions: Set<SeisAIAgentAction>
    public let forbiddenActions: Set<SeisAIAgentAction>
    public let requiredInputs: [String]
    public let expectedOutputs: [String]
    public let toolPermissions: [String]
    public let approvalRequirements: [String]
    public let validationRules: [String]
    public let failureBehavior: String
    public let executionAuthority: Bool

    public init(
        id: String,
        displayName: String,
        purpose: String,
        allowedActions: Set<SeisAIAgentAction>,
        forbiddenActions: Set<SeisAIAgentAction>,
        requiredInputs: [String],
        expectedOutputs: [String],
        toolPermissions: [String],
        approvalRequirements: [String],
        validationRules: [String],
        failureBehavior: String,
        executionAuthority: Bool
    ) {
        self.id = id
        self.displayName = displayName
        self.purpose = purpose
        self.allowedActions = allowedActions
        self.forbiddenActions = forbiddenActions
        self.requiredInputs = requiredInputs
        self.expectedOutputs = expectedOutputs
        self.toolPermissions = toolPermissions
        self.approvalRequirements = approvalRequirements
        self.validationRules = validationRules
        self.failureBehavior = failureBehavior
        self.executionAuthority = executionAuthority
    }

    public var isStatusAndPlanOnly: Bool {
        !executionAuthority &&
            allowedActions.isSubset(of: Self.planOnlyActions) &&
            Self.mutationActions.isSubset(of: forbiddenActions) &&
            !approvalRequirements.isEmpty &&
            !validationRules.isEmpty &&
            !failureBehavior.isEmpty
    }

    public static let planOnlyActions: Set<SeisAIAgentAction> = [
        .inspectRepositoryMetadata,
        .readScopedWorkspaceFiles,
        .producePlan,
        .produceReview,
        .runLocalValidation
    ]

    public static let mutationActions: Set<SeisAIAgentAction> = [
        .writeWorkspace,
        .providerCall,
        .networkRequest,
        .mcpInvocation,
        .readPrivateContent,
        .readSecrets,
        .ssh,
        .deployment,
        .githubMutation
    ]
}

public enum SeisAIAgentPlanRuntimeError: Error, Equatable, Sendable {
    case unsafeAgentRegistry
    case duplicateAgentIDs([String])
}

public struct SeisAIAgentTaskRequest: Codable, Equatable, Identifiable, Sendable {
    public static let maximumPurposeLength = 512

    public let id: String
    public let agentID: String
    public let purpose: String
    public let requestedActions: Set<SeisAIAgentAction>
    public let requestedToolIDs: [String]
    public let inputReferences: [String]

    public init(
        id: String,
        agentID: String,
        purpose: String,
        requestedActions: Set<SeisAIAgentAction>,
        requestedToolIDs: [String] = [],
        inputReferences: [String] = []
    ) {
        self.id = id
        self.agentID = agentID
        self.purpose = purpose
        self.requestedActions = requestedActions
        self.requestedToolIDs = requestedToolIDs
        self.inputReferences = inputReferences
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            issues.append("task id must not be empty")
        }
        if agentID.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            issues.append("agentID must not be empty")
        }
        let normalizedPurpose = purpose.trimmingCharacters(in: .whitespacesAndNewlines)
        if normalizedPurpose.isEmpty || normalizedPurpose.count > Self.maximumPurposeLength {
            issues.append("purpose must contain 1...\(Self.maximumPurposeLength) characters")
        }
        if requestedActions.isEmpty {
            issues.append("requestedActions must not be empty")
        }
        if Set(requestedToolIDs).count != requestedToolIDs.count {
            issues.append("requestedToolIDs must not contain duplicates")
        }
        if Set(inputReferences).count != inputReferences.count {
            issues.append("inputReferences must not contain duplicates")
        }
        if requestedToolIDs.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("requestedToolIDs must contain only non-empty values")
        }
        if inputReferences.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("inputReferences must contain only non-empty values")
        }
        return issues
    }
}

public enum SeisAIAgentPlanOutcome: String, CaseIterable, Codable, Equatable, Sendable {
    case planned
    case blocked
}

public struct SeisAIAgentTaskPlan: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let taskID: String
    public let agentID: String
    public let outcome: SeisAIAgentPlanOutcome
    public let plannedActions: [SeisAIAgentAction]
    public let blockedActions: [SeisAIAgentAction]
    public let toolPermissions: [String]
    public let requiredApprovals: [String]
    public let validationRules: [String]
    public let expectedOutputs: [String]
    public let failureBehavior: String
    public let blockedReasons: [String]
    public let executionPerformed: Bool

    public init(
        id: String,
        taskID: String,
        agentID: String,
        outcome: SeisAIAgentPlanOutcome,
        plannedActions: [SeisAIAgentAction],
        blockedActions: [SeisAIAgentAction],
        toolPermissions: [String],
        requiredApprovals: [String],
        validationRules: [String],
        expectedOutputs: [String],
        failureBehavior: String,
        blockedReasons: [String],
        executionPerformed: Bool = false
    ) {
        self.id = id
        self.taskID = taskID
        self.agentID = agentID
        self.outcome = outcome
        self.plannedActions = plannedActions
        self.blockedActions = blockedActions
        self.toolPermissions = toolPermissions
        self.requiredApprovals = requiredApprovals
        self.validationRules = validationRules
        self.expectedOutputs = expectedOutputs
        self.failureBehavior = failureBehavior
        self.blockedReasons = blockedReasons
        self.executionPerformed = executionPerformed
    }

    public var isPlanOnly: Bool {
        !executionPerformed
    }
}

public struct SeisAIAgentPlanRuntime: Sendable {
    public let definitions: [SeisAIAgentDefinition]

    public init(definitions: [SeisAIAgentDefinition]) throws {
        let duplicateIDs = definitions
            .reduce(into: [String: Int]()) { counts, definition in counts[definition.id, default: 0] += 1 }
            .filter { $0.value > 1 }
            .map(\.key)
            .sorted()
        guard duplicateIDs.isEmpty else {
            throw SeisAIAgentPlanRuntimeError.duplicateAgentIDs(duplicateIDs)
        }
        self.definitions = definitions
    }

    public static func statusAndPlanOnly(
        from snapshot: SeisAICoreRuntimeSnapshotContract
    ) throws -> SeisAIAgentPlanRuntime {
        guard snapshot.isValid, snapshot.agentRegistry.isReadOnlySafe else {
            throw SeisAIAgentPlanRuntimeError.unsafeAgentRegistry
        }

        let definitions = snapshot.agentRegistry.agents.map { agent in
            SeisAIAgentDefinition(
                id: agent.id,
                displayName: agent.displayName,
                purpose: agent.duty,
                allowedActions: SeisAIAgentDefinition.planOnlyActions,
                forbiddenActions: SeisAIAgentDefinition.mutationActions,
                requiredInputs: [
                    "scoped task purpose",
                    "explicit repository or artifact references",
                    "requested non-mutating actions"
                ],
                expectedOutputs: [
                    "bounded execution plan",
                    "validation checklist",
                    "blocked actions and approval requirements"
                ],
                toolPermissions: [],
                approvalRequirements: [
                    "human approval before any mutation, provider, network, MCP, SSH, deployment, or GitHub action"
                ],
                validationRules: [
                    "status-and-plan-only",
                    "no-secret-access",
                    "no-private-content-read",
                    "no-runtime-authority",
                    "fail-closed-on-unknown-action"
                ],
                failureBehavior: "Return a blocked plan with reasons; never expand permissions or execute a fallback.",
                executionAuthority: agent.executionAuthority
            )
        }
        guard definitions.allSatisfy(\.isStatusAndPlanOnly) else {
            throw SeisAIAgentPlanRuntimeError.unsafeAgentRegistry
        }
        return try SeisAIAgentPlanRuntime(definitions: definitions)
    }

    public func makePlan(for request: SeisAIAgentTaskRequest) -> SeisAIAgentTaskPlan {
        let definitionsByID = Dictionary(uniqueKeysWithValues: definitions.map { ($0.id, $0) })
        guard let definition = definitionsByID[request.agentID] else {
            return blockedPlan(
                request: request,
                reasons: ["agent \(request.agentID) is not registered"],
                blockedActions: request.requestedActions
            )
        }

        var reasons = request.validationIssues
        if !definition.isStatusAndPlanOnly {
            reasons.append("agent definition is not status-and-plan-only safe")
        }

        let forbidden = request.requestedActions.intersection(definition.forbiddenActions)
        let unsupported = request.requestedActions.subtracting(definition.allowedActions)
        let blockedActions = forbidden.union(unsupported)
        if !forbidden.isEmpty {
            reasons.append("requested actions cross the agent permission boundary")
        }
        if !unsupported.subtracting(forbidden).isEmpty {
            reasons.append("requested actions are not in the agent allow-list")
        }

        let unapprovedTools = Set(request.requestedToolIDs).subtracting(definition.toolPermissions)
        if !unapprovedTools.isEmpty {
            reasons.append("requested tools are not registered for this plan-only agent: \(unapprovedTools.sorted().joined(separator: ", "))")
        }

        guard reasons.isEmpty else {
            return blockedPlan(
                request: request,
                definition: definition,
                reasons: reasons,
                blockedActions: blockedActions
            )
        }

        return SeisAIAgentTaskPlan(
            id: "agent-plan:\(request.id):\(definition.id)",
            taskID: request.id,
            agentID: definition.id,
            outcome: .planned,
            plannedActions: request.requestedActions.sorted { $0.rawValue < $1.rawValue },
            blockedActions: [],
            toolPermissions: request.requestedToolIDs,
            requiredApprovals: definition.approvalRequirements,
            validationRules: definition.validationRules,
            expectedOutputs: definition.expectedOutputs,
            failureBehavior: definition.failureBehavior,
            blockedReasons: []
        )
    }

    private func blockedPlan(
        request: SeisAIAgentTaskRequest,
        definition: SeisAIAgentDefinition? = nil,
        reasons: [String],
        blockedActions: Set<SeisAIAgentAction>
    ) -> SeisAIAgentTaskPlan {
        SeisAIAgentTaskPlan(
            id: "agent-plan:\(request.id):blocked",
            taskID: request.id,
            agentID: request.agentID,
            outcome: .blocked,
            plannedActions: [],
            blockedActions: blockedActions.sorted { $0.rawValue < $1.rawValue },
            toolPermissions: [],
            requiredApprovals: definition?.approvalRequirements ?? [],
            validationRules: definition?.validationRules ?? ["fail-closed-on-unknown-agent"],
            expectedOutputs: definition?.expectedOutputs ?? ["blocked plan with reasons"],
            failureBehavior: definition?.failureBehavior ?? "Return blocked; do not infer or create an agent.",
            blockedReasons: reasons
        )
    }
}
