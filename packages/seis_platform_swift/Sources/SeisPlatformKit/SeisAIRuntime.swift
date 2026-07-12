import Foundation

public struct SeisAIProviderExecutionRequest: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let routing: SeisAIRoutingRequest

    public init(id: String, routing: SeisAIRoutingRequest) {
        self.id = id
        self.routing = routing
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            issues.append("execution request id must not be empty")
        }
        if routing.contentClassification == .secret || routing.contentClassification == .unknown {
            issues.append("secret or unknown content is not executable")
        }
        return issues
    }
}

public struct SeisAIProviderResponse: Codable, Equatable, Sendable {
    public static let maximumOutputLength = 65_536

    public let providerID: String
    public let modelIdentifier: String
    public let output: String
    public let modelGenerated: Bool
    public let providerCallPerformed: Bool
    public let networkCallPerformed: Bool
    public let clientCredentialRead: Bool

    public init(
        providerID: String,
        modelIdentifier: String,
        output: String,
        modelGenerated: Bool,
        providerCallPerformed: Bool,
        networkCallPerformed: Bool,
        clientCredentialRead: Bool
    ) {
        self.providerID = providerID
        self.modelIdentifier = modelIdentifier
        self.output = output
        self.modelGenerated = modelGenerated
        self.providerCallPerformed = providerCallPerformed
        self.networkCallPerformed = networkCallPerformed
        self.clientCredentialRead = clientCredentialRead
    }
}

public protocol SeisAIProviderAdapter: Sendable {
    var descriptor: SeisAIProviderDescriptor { get }
    func execute(_ request: SeisAIProviderExecutionRequest) async throws -> SeisAIProviderResponse
}

public struct SeisAILocalDemoProviderAdapter: SeisAIProviderAdapter, Sendable {
    public let descriptor = SeisAIProviderDescriptor.localDemo

    public init() {}

    public func execute(_ request: SeisAIProviderExecutionRequest) async throws -> SeisAIProviderResponse {
        let capabilities = request.routing.requiredCapabilities.sorted().joined(separator: ", ")
        let output = [
            "SEIS Local Demo produced a deterministic plan envelope.",
            "Task: \(request.routing.taskType)",
            "Capabilities: \(capabilities)",
            "No model, provider, network, credential, MCP, SSH, deployment, or GitHub action was used."
        ].joined(separator: "\n")

        return SeisAIProviderResponse(
            providerID: descriptor.id,
            modelIdentifier: descriptor.modelIdentifier,
            output: output,
            modelGenerated: false,
            providerCallPerformed: false,
            networkCallPerformed: false,
            clientCredentialRead: false
        )
    }
}

public enum SeisAIExecutionOutcome: String, CaseIterable, Codable, Equatable, Sendable {
    case completedLocalDemo = "completed-local-demo"
    case completedApprovedProvider = "completed-approved-provider"
    case approvalRequired = "approval-required"
    case blocked
    case failed
}

public struct SeisAIExecutionResult: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let requestID: String
    public let routeDecision: SeisAIRouteDecision
    public let outcome: SeisAIExecutionOutcome
    public let providerID: String?
    public let modelIdentifier: String?
    public let output: String?
    public let modelGenerated: Bool
    public let adapterInvocationPerformed: Bool
    public let executionCompleted: Bool
    public let providerCallPerformed: Bool
    public let networkCallPerformed: Bool
    public let clientCredentialRead: Bool
    public let blockedReasons: [String]

    public init(
        id: String,
        requestID: String,
        routeDecision: SeisAIRouteDecision,
        outcome: SeisAIExecutionOutcome,
        providerID: String?,
        modelIdentifier: String?,
        output: String?,
        modelGenerated: Bool,
        adapterInvocationPerformed: Bool,
        executionCompleted: Bool,
        providerCallPerformed: Bool,
        networkCallPerformed: Bool,
        clientCredentialRead: Bool,
        blockedReasons: [String]
    ) {
        self.id = id
        self.requestID = requestID
        self.routeDecision = routeDecision
        self.outcome = outcome
        self.providerID = providerID
        self.modelIdentifier = modelIdentifier
        self.output = output
        self.modelGenerated = modelGenerated
        self.adapterInvocationPerformed = adapterInvocationPerformed
        self.executionCompleted = executionCompleted
        self.providerCallPerformed = providerCallPerformed
        self.networkCallPerformed = networkCallPerformed
        self.clientCredentialRead = clientCredentialRead
        self.blockedReasons = blockedReasons
    }

    public var respectsClientSecretBoundary: Bool {
        !clientCredentialRead
    }
}

public enum SeisAIRuntimeConfigurationError: Error, Equatable, Sendable {
    case duplicateProviderIDs([String])
    case invalidProvider(providerID: String, issues: [String])
    case nonDemoAdapters([String])
}

public actor SeisAIRuntime {
    private let router: SeisAIModelRouter
    private let adaptersByID: [String: any SeisAIProviderAdapter]
    private let agentRuntime: SeisAIAgentPlanRuntime?
    private let personalLaneRuntime: SeisAIPersonalLaneRuntime?
    private let evidenceLedger: SeisAIExecutionEvidenceLedger

    public init(
        adapters: [any SeisAIProviderAdapter] = [SeisAILocalDemoProviderAdapter()],
        router: SeisAIModelRouter = SeisAIModelRouter(),
        agentRuntime: SeisAIAgentPlanRuntime? = nil,
        personalLaneRuntime: SeisAIPersonalLaneRuntime? = nil,
        evidenceLedger: SeisAIExecutionEvidenceLedger = SeisAIExecutionEvidenceLedger()
    ) throws {
        let duplicateProviderIDs = adapters
            .reduce(into: [String: Int]()) { counts, adapter in
                counts[adapter.descriptor.id, default: 0] += 1
            }
            .filter { $0.value > 1 }
            .map(\.key)
            .sorted()
        guard duplicateProviderIDs.isEmpty else {
            throw SeisAIRuntimeConfigurationError.duplicateProviderIDs(duplicateProviderIDs)
        }

        let nonDemoAdapterIDs = adapters
            .filter { $0.descriptor.transport != .deterministicLocalDemo }
            .map(\.descriptor.id)
            .sorted()
        guard nonDemoAdapterIDs.isEmpty else {
            throw SeisAIRuntimeConfigurationError.nonDemoAdapters(nonDemoAdapterIDs)
        }

        for adapter in adapters where !adapter.descriptor.validationIssues.isEmpty {
            throw SeisAIRuntimeConfigurationError.invalidProvider(
                providerID: adapter.descriptor.id,
                issues: adapter.descriptor.validationIssues
            )
        }

        self.adaptersByID = Dictionary(uniqueKeysWithValues: adapters.map { ($0.descriptor.id, $0) })
        self.router = router
        self.agentRuntime = agentRuntime
        self.personalLaneRuntime = personalLaneRuntime
        self.evidenceLedger = evidenceLedger
    }

    public static func localDemo(
        snapshotData: Data,
        evidenceLedger: SeisAIExecutionEvidenceLedger = SeisAIExecutionEvidenceLedger()
    ) throws -> SeisAIRuntime {
        let snapshot = try SeisAICoreRuntimeSnapshotContract.validated(from: snapshotData)
        let agentRuntime = try SeisAIAgentPlanRuntime.statusAndPlanOnly(from: snapshot)
        let personalLaneRuntime = try SeisAIPersonalLaneRuntime.readOnly(from: snapshot)
        return try SeisAIRuntime(
            agentRuntime: agentRuntime,
            personalLaneRuntime: personalLaneRuntime,
            evidenceLedger: evidenceLedger
        )
    }

    public func registeredProviders() -> [SeisAIProviderDescriptor] {
        adaptersByID.values.map(\.descriptor).sorted { $0.id < $1.id }
    }

    public func route(_ request: SeisAIRoutingRequest) -> SeisAIRouteDecision {
        router.route(request, providers: adaptersByID.values.map(\.descriptor))
    }

    public func planAgentTask(_ request: SeisAIAgentTaskRequest) async -> SeisAIAgentTaskPlan {
        let plan: SeisAIAgentTaskPlan
        if let agentRuntime {
            plan = agentRuntime.makePlan(for: request)
        } else {
            plan = SeisAIAgentTaskPlan(
                id: "agent-plan:\(request.id):blocked",
                taskID: request.id,
                agentID: request.agentID,
                outcome: .blocked,
                plannedActions: [],
                blockedActions: request.requestedActions.sorted { $0.rawValue < $1.rawValue },
                toolPermissions: [],
                requiredApprovals: [],
                validationRules: ["fail-closed-without-agent-registry"],
                expectedOutputs: ["blocked plan with reasons"],
                failureBehavior: "Return blocked; do not infer runtime authority.",
                blockedReasons: ["no validated agent registry was injected"]
            )
        }
        await evidenceLedger.recordAgentPlan(plan, inputReferenceCount: request.inputReferences.count)
        return plan
    }

    public func planPersonalLaneTask(
        _ request: SeisAIPersonalLaneTaskRequest
    ) async -> SeisAIPersonalLaneTaskPlan {
        let plan: SeisAIPersonalLaneTaskPlan
        if let personalLaneRuntime {
            plan = personalLaneRuntime.makePlan(for: request)
        } else {
            plan = SeisAIPersonalLaneTaskPlan.blockedWithoutValidatedRuntime(request: request)
        }
        await evidenceLedger.recordPersonalLanePlan(plan, inputReferenceCount: request.inputReferences.count)
        return plan
    }

    public func evidenceSnapshot(limit: Int = 64) async -> [SeisAIExecutionEvidence] {
        await evidenceLedger.snapshot(limit: limit)
    }

    public func clearEvidence() async {
        await evidenceLedger.clear()
    }

    public func evidencePersistenceState() async -> SeisAIExecutionEvidencePersistenceState {
        await evidenceLedger.persistenceState
    }

    public func execute(_ request: SeisAIProviderExecutionRequest) async -> SeisAIExecutionResult {
        let decision = route(request.routing)
        var preflightIssues = request.validationIssues
        if request.routing.id != request.id {
            preflightIssues.append("routing request id must match the execution request id")
        }
        if decision.outcome == .approvalRequired {
            preflightIssues.append("local-only runtime does not execute approval-required routes")
        }
        if decision.outcome == .blocked {
            preflightIssues.append(contentsOf: decision.blockedReasons)
        }
        guard preflightIssues.isEmpty else {
            return await finish(result(
                request: request,
                decision: decision,
                outcome: .blocked,
                blockedReasons: Array(Set(preflightIssues)).sorted()
            ))
        }

        guard let providerID = decision.selectedProviderID else {
            return await finish(result(
                request: request,
                decision: decision,
                outcome: .blocked,
                blockedReasons: ["selected provider was not resolved"]
            ))
        }

        guard let adapter = adaptersByID[providerID] else {
            return await finish(result(
                request: request,
                decision: decision,
                outcome: .blocked,
                blockedReasons: ["selected provider adapter is not registered"]
            ))
        }

        do {
            let response = try await adapter.execute(request)
            let responseIssues = validate(response: response, descriptor: adapter.descriptor)
            guard responseIssues.isEmpty else {
                return await finish(result(
                    request: request,
                    decision: decision,
                    outcome: .failed,
                    response: nil,
                    adapterInvocationPerformed: true,
                    blockedReasons: responseIssues
                ))
            }

            return await finish(result(
                request: request,
                decision: decision,
                outcome: .completedLocalDemo,
                response: response,
                adapterInvocationPerformed: true,
                blockedReasons: []
            ))
        } catch {
            return await finish(result(
                request: request,
                decision: decision,
                outcome: .failed,
                adapterInvocationPerformed: true,
                blockedReasons: ["provider adapter failed; inspect redacted adapter logs"]
            ))
        }
    }

    private func finish(_ result: SeisAIExecutionResult) async -> SeisAIExecutionResult {
        await evidenceLedger.recordExecution(result)
        return result
    }

    private func validate(
        response: SeisAIProviderResponse,
        descriptor: SeisAIProviderDescriptor
    ) -> [String] {
        var issues: [String] = []
        if response.providerID != descriptor.id {
            issues.append("adapter response providerID does not match its descriptor")
        }
        if response.modelIdentifier != descriptor.modelIdentifier {
            issues.append("adapter response modelIdentifier does not match its descriptor")
        }
        let normalizedOutput = response.output.trimmingCharacters(in: .whitespacesAndNewlines)
        if normalizedOutput.isEmpty || normalizedOutput.count > SeisAIProviderResponse.maximumOutputLength {
            issues.append("adapter output must be non-empty and within the output limit")
        }
        if response.clientCredentialRead {
            issues.append("an AI adapter must never read credentials in the client runtime")
        }
        switch descriptor.transport {
        case .deterministicLocalDemo:
            if response.modelGenerated || response.providerCallPerformed || response.networkCallPerformed {
                issues.append("Local Demo must not claim model, provider, or network execution")
            }
        case .localProcess:
            if response.networkCallPerformed {
                issues.append("local-process adapters must not report network execution")
            }
            if descriptor.modelBacked && !response.modelGenerated {
                issues.append("model-backed local adapters must report model-generated output")
            }
        case .backendService:
            if !response.modelGenerated || !response.providerCallPerformed || !response.networkCallPerformed {
                issues.append("backend adapters must report model, provider, and network execution truthfully")
            }
        }
        return issues
    }

    private func result(
        request: SeisAIProviderExecutionRequest,
        decision: SeisAIRouteDecision,
        outcome: SeisAIExecutionOutcome,
        response: SeisAIProviderResponse? = nil,
        adapterInvocationPerformed: Bool = false,
        blockedReasons: [String]
    ) -> SeisAIExecutionResult {
        SeisAIExecutionResult(
            id: "execution:\(request.id):\(outcome.rawValue)",
            requestID: request.id,
            routeDecision: decision,
            outcome: outcome,
            providerID: response?.providerID ?? decision.selectedProviderID,
            modelIdentifier: response?.modelIdentifier ?? decision.selectedModelIdentifier,
            output: response?.output,
            modelGenerated: response?.modelGenerated ?? false,
            adapterInvocationPerformed: adapterInvocationPerformed,
            executionCompleted: outcome == .completedLocalDemo || outcome == .completedApprovedProvider,
            providerCallPerformed: response?.providerCallPerformed ?? false,
            networkCallPerformed: response?.networkCallPerformed ?? false,
            clientCredentialRead: response?.clientCredentialRead ?? false,
            blockedReasons: blockedReasons
        )
    }
}
