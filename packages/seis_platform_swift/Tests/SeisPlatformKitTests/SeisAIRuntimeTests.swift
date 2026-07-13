import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Runtime")
struct SeisAIRuntimeTests {
    @Test func localAgentGovernanceBudgetRejectsUnboundedOrBackgroundExecution() {
        let unsafe = SeisAIAgentGovernanceBudget(
            maximumSteps: 0,
            maximumDelegationDepth: -1,
            timeoutMinutes: 0,
            maximumCostTier: .low,
            backgroundExecutionAllowed: true,
            humanApprovalRequiredForExternalActions: false
        )

        #expect(!unsafe.isSafeLocalPlanOnly)
        #expect(unsafe.validationIssues.contains("maximumSteps must be at least 1"))
        #expect(unsafe.validationIssues.contains("maximumDelegationDepth must not be negative"))
        #expect(unsafe.validationIssues.contains("timeoutMinutes must be at least 1"))
        #expect(unsafe.validationIssues.contains("background execution is disabled for the local plan runtime"))
        #expect(unsafe.validationIssues.contains("external actions require human approval"))
    }

    @Test func localRouteInspectionSelectsOnlyTheDeterministicDemoProvider() {
        let request = SeisAIRoutingRequest(
            id: "apple-route-inspection",
            taskType: "repository readiness plan",
            capability: "planning",
            privacyMode: .localOnly,
            contentClassification: .repositoryMetadata,
            localOnly: true,
            maximumCostTier: .zero,
            preferredLatencyTier: .immediate,
            preferLocal: true,
            fallbackPolicy: .none
        )

        let decision = SeisAIModelRouter().route(request, providers: [.localDemo])

        #expect(decision.outcome == .localDemoReady)
        #expect(decision.selectedProviderID == SeisAIProviderDescriptor.localDemo.id)
        #expect(decision.selectedModelIdentifier == SeisAIProviderDescriptor.localDemo.modelIdentifier)
        #expect(decision.routeEligible)
        #expect(!decision.requiresHumanApproval)
        #expect(!decision.fallbackUsed)
        #expect(decision.executionPerformed == false)
        #expect(decision.providerCallPerformed == false)
        #expect(decision.networkCallPerformed == false)
        #expect(decision.isFailClosed == false)
    }

    @Test func localRouteInspectionBlocksToolRequirementsTheDemoCannotSatisfy() throws {
        let request = SeisAIRoutingRequest(
            id: "apple-route-tools-required",
            taskType: "tool-assisted repository plan",
            capability: "planning",
            localOnly: true,
            requiresTools: true,
            maximumCostTier: .zero,
            fallbackPolicy: .none
        )

        let decision = SeisAIModelRouter().route(request, providers: [.localDemo])
        let rejection = try #require(decision.providerRejections.first)

        #expect(decision.outcome == .blocked)
        #expect(decision.selectedProviderID == nil)
        #expect(!decision.routeEligible)
        #expect(decision.isFailClosed)
        #expect(rejection.reasons.contains("tool support is required"))
        #expect(!decision.executionPerformed)
        #expect(!decision.providerCallPerformed)
        #expect(!decision.networkCallPerformed)
    }

    @Test func localDemoExecutionReportsNoModelProviderNetworkOrCredentialUse() async throws {
        let runtime = try SeisAIRuntime()
        let request = localDemoExecutionRequest(id: "local-demo-execution")

        let result = await runtime.execute(request)
        let output = try #require(result.output)

        #expect(result.outcome == .completedLocalDemo)
        #expect(result.routeDecision.outcome == .localDemoReady)
        #expect(result.providerID == SeisAIProviderDescriptor.localDemo.id)
        #expect(result.modelIdentifier == SeisAIProviderDescriptor.localDemo.modelIdentifier)
        #expect(!result.modelGenerated)
        #expect(result.adapterInvocationPerformed)
        #expect(result.executionCompleted)
        #expect(!result.providerCallPerformed)
        #expect(!result.networkCallPerformed)
        #expect(!result.clientCredentialRead)
        #expect(result.blockedReasons.isEmpty)
        #expect(output.contains("No model, provider, network, credential, MCP, SSH, deployment, or GitHub action was used."))

        requireSendable(request)
        requireSendable(result)
        requireSendable(runtime)
    }

    @Test func routerNeverFallsBackWithoutExplicitPolicy() {
        let router = SeisAIModelRouter()
        let noFallbackRequest = SeisAIRoutingRequest(
            id: "no-silent-fallback",
            taskType: "repository readiness plan",
            capability: "planning",
            requestedProviderID: "unregistered-provider",
            fallbackPolicy: .none
        )

        let blocked = router.route(noFallbackRequest, providers: [.localDemo])

        #expect(blocked.outcome == .blocked)
        #expect(blocked.selectedProviderID == nil)
        #expect(!blocked.routeEligible)
        #expect(!blocked.fallbackUsed)
        #expect(blocked.isFailClosed)
        #expect(blocked.blockedReasons.contains("fallback is disabled; the router never switches providers silently"))

        let explicitFallbackRequest = SeisAIRoutingRequest(
            id: "explicit-local-demo-fallback",
            taskType: "repository readiness plan",
            capability: "planning",
            requestedProviderID: "unregistered-provider",
            fallbackPolicy: .explicitLocalDemo
        )
        let explicitFallback = router.route(explicitFallbackRequest, providers: [.localDemo])

        #expect(explicitFallback.outcome == .localDemoReady)
        #expect(explicitFallback.selectedProviderID == SeisAIProviderDescriptor.localDemo.id)
        #expect(explicitFallback.routeEligible)
        #expect(explicitFallback.fallbackUsed)
        #expect(!explicitFallback.requiresHumanApproval)
    }

    @Test func providerRejectionsKeepMissingKeyDistinctFromError() throws {
        let missingKeyProvider = backendDescriptor(
            id: "missing-key-provider",
            publicState: .missingKey
        )
        let errorProvider = backendDescriptor(
            id: "error-provider",
            publicState: .error
        )
        let request = providerRoutingRequest(
            id: "provider-state-semantics",
            requestedProviderID: nil
        )

        let decision = SeisAIModelRouter().route(
            request,
            providers: [missingKeyProvider, errorProvider]
        )
        let rejections = Dictionary(uniqueKeysWithValues: decision.providerRejections.map { ($0.providerID, $0) })
        let missingKeyRejection = try #require(rejections[missingKeyProvider.id])
        let errorRejection = try #require(rejections[errorProvider.id])

        #expect(SeisAICoreProviderState.missingKey != .error)
        #expect(missingKeyRejection.publicState == .missingKey)
        #expect(errorRejection.publicState == .error)
        #expect(missingKeyRejection.reasons.contains("provider state is Missing Key"))
        #expect(errorRejection.reasons.contains("provider state is Error"))
        #expect(decision.outcome == .blocked)
        #expect(decision.isFailClosed)
    }

    @Test func secretUnknownAndLocalOnlyRoutesFailClosed() throws {
        let backend = backendDescriptor(id: "fail-closed-backend")
        let providers = [SeisAIProviderDescriptor.localDemo, backend]

        for classification in [SeisAIContentClassification.secret, .unknown] {
            let request = SeisAIRoutingRequest(
                id: "blocked-\(classification.rawValue)",
                taskType: "classified content review",
                capability: "planning",
                privacyMode: .standard,
                contentClassification: classification,
                localOnly: false,
                maximumCostTier: .low,
                preferLocal: false,
                fallbackPolicy: .explicitLocalDemo
            )
            let decision = SeisAIModelRouter().route(request, providers: providers)

            #expect(decision.outcome == .blocked)
            #expect(decision.selectedProviderID == nil)
            #expect(!decision.routeEligible)
            #expect(!decision.fallbackUsed)
            #expect(decision.isFailClosed)
            #expect(!decision.executionPerformed)
            #expect(!decision.providerCallPerformed)
            #expect(!decision.networkCallPerformed)
        }

        let localOnlyRequest = SeisAIRoutingRequest(
            id: "local-only-backend-block",
            taskType: "local-only repository review",
            capability: "planning",
            privacyMode: .localOnly,
            contentClassification: .repositoryMetadata,
            localOnly: true,
            maximumCostTier: .low,
            requestedProviderID: backend.id,
            fallbackPolicy: .none
        )
        let localOnlyDecision = SeisAIModelRouter().route(localOnlyRequest, providers: [backend])
        let backendRejection = try #require(localOnlyDecision.providerRejections.first)

        #expect(localOnlyDecision.outcome == .blocked)
        #expect(localOnlyDecision.selectedProviderID == nil)
        #expect(localOnlyDecision.isFailClosed)
        #expect(!localOnlyDecision.fallbackUsed)
        #expect(backendRejection.reasons.contains("local-only requests cannot route to backend services"))
    }

    @Test func nonDemoAdaptersAreRejectedFromLocalRuntime() throws {
        let adapter = FakeLocalDemoAdapter(descriptor: backendDescriptor(id: "backend-preview"))
        let error = try runtimeConfigurationError(adapters: [adapter])

        #expect(error == .nonDemoAdapters([adapter.descriptor.id]))
        #expect(await adapter.invocationCount() == 0)
        requireSendable(error)
    }

    @Test func executionRemainsBlockedWhenRouteNeedsApproval() async throws {
        let runtime = try SeisAIRuntime(
            adapters: [SeisAILocalDemoProviderAdapter()],
            router: SeisAIModelRouter()
        )
        let blockedRequest = SeisAIProviderExecutionRequest(
            id: "approval-route-block",
            routing: SeisAIRoutingRequest(
                id: "approval-route-block",
                taskType: "provider execution",
                capability: "planning",
                requestedProviderID: "unregistered-provider",
                fallbackPolicy: .none
            )
        )

        let result = await runtime.execute(blockedRequest)

        #expect(result.outcome == .blocked)
        #expect(result.routeDecision.outcome == .blocked)
        #expect(!result.executionCompleted)
        #expect(!result.adapterInvocationPerformed)
        #expect(result.modelGenerated == false)
        #expect(result.blockedReasons.contains("requested provider unregistered-provider is not registered"))
    }

    @Test func duplicateProviderIDsAreRejectedBeforeInvocation() async throws {
        let first = FakeLocalDemoAdapter(descriptor: SeisAIProviderDescriptor.localDemo)
        let second = FakeLocalDemoAdapter(descriptor: SeisAIProviderDescriptor.localDemo)

        let error = try runtimeConfigurationError(adapters: [first, second])

        #expect(error == .duplicateProviderIDs([SeisAIProviderDescriptor.localDemo.id]))
        #expect(await first.invocationCount() == 0)
        #expect(await second.invocationCount() == 0)
        requireSendable(error)
    }

    @Test func snapshotBackedPlanRuntimeBuildsThirteenPlanOnlyAgents() async throws {
        let snapshotData = try runtimeSnapshotData()
        let snapshot = try SeisAICoreRuntimeSnapshotContract.validated(from: snapshotData)
        let agentRuntime = try SeisAIAgentPlanRuntime.statusAndPlanOnly(from: snapshot)
        let runtime = try SeisAIRuntime.localDemo(snapshotData: snapshotData)

        #expect(agentRuntime.definitions.count == 13)
        #expect(agentRuntime.definitions.map(\.id) == SeisAICoreRuntimeSnapshotContract.expectedManagedAgentIDs)
        #expect(agentRuntime.definitions.allSatisfy(\.isStatusAndPlanOnly))

        for agentID in SeisAICoreRuntimeSnapshotContract.expectedManagedAgentIDs {
            let plan = await runtime.planAgentTask(
                SeisAIAgentTaskRequest(
                    id: "plan-\(agentID)",
                    agentID: agentID,
                    purpose: "Produce a bounded readiness plan for \(agentID).",
                    requestedActions: [.inspectRepositoryMetadata, .producePlan]
                )
            )

            #expect(plan.outcome == .planned)
            #expect(plan.agentID == agentID)
            #expect(plan.plannedActions == [.inspectRepositoryMetadata, .producePlan])
            #expect(plan.blockedActions.isEmpty)
            #expect(plan.isPlanOnly)
            #expect(plan.requiredApprovals.count == 1)
            #expect(plan.validationRules.contains("status-and-plan-only"))
            #expect(plan.governanceBudget.maximumSteps == 8)
            #expect(plan.governanceBudget.maximumDelegationDepth == 1)
            #expect(plan.governanceBudget.timeoutMinutes == 30)
            #expect(plan.governanceBudget.maximumCostTier == .zero)
            #expect(!plan.governanceBudget.backgroundExecutionAllowed)
            #expect(plan.governanceBudget.humanApprovalRequiredForExternalActions)
            #expect(plan.governanceBudget.isSafeLocalPlanOnly)
        }

        requireSendable(snapshot)
        requireSendable(agentRuntime)
        requireSendable(runtime)
    }

    @Test func forbiddenMutationAndUnknownAgentPlansAreBlocked() async throws {
        let runtime = try SeisAIRuntime.localDemo(snapshotData: runtimeSnapshotData())
        let mutationPlan = await runtime.planAgentTask(
            SeisAIAgentTaskRequest(
                id: "forbidden-mutation-plan",
                agentID: "code-agent",
                purpose: "Plan and execute a workspace mutation.",
                requestedActions: [.producePlan, .writeWorkspace, .providerCall]
            )
        )

        #expect(mutationPlan.outcome == .blocked)
        #expect(mutationPlan.plannedActions.isEmpty)
        #expect(Set(mutationPlan.blockedActions) == Set([.writeWorkspace, .providerCall]))
        #expect(mutationPlan.isPlanOnly)
        #expect(mutationPlan.blockedReasons.contains("requested actions cross the agent permission boundary"))

        let unknownAgentPlan = await runtime.planAgentTask(
            SeisAIAgentTaskRequest(
                id: "unknown-agent-plan",
                agentID: "unregistered-agent",
                purpose: "Produce a bounded readiness plan.",
                requestedActions: [.producePlan]
            )
        )

        #expect(unknownAgentPlan.outcome == .blocked)
        #expect(unknownAgentPlan.plannedActions.isEmpty)
        #expect(unknownAgentPlan.blockedActions == [.producePlan])
        #expect(unknownAgentPlan.validationRules == ["fail-closed-on-unknown-agent"])
        #expect(unknownAgentPlan.isPlanOnly)
        #expect(unknownAgentPlan.blockedReasons == ["agent unregistered-agent is not registered"])
    }
}

private actor FakeLocalDemoAdapter: SeisAIProviderAdapter {
    nonisolated let descriptor: SeisAIProviderDescriptor
    private var invocations = 0

    init(descriptor: SeisAIProviderDescriptor) {
        self.descriptor = descriptor
    }

    func execute(_ request: SeisAIProviderExecutionRequest) async throws -> SeisAIProviderResponse {
        invocations += 1
        return SeisAIProviderResponse(
            providerID: descriptor.id,
            modelIdentifier: descriptor.modelIdentifier,
            output: "test response for \(request.id)",
            modelGenerated: false,
            providerCallPerformed: false,
            networkCallPerformed: false,
            clientCredentialRead: false
        )
    }

    func invocationCount() -> Int {
        invocations
    }
}

private enum SeisAIRuntimeTestError: Error {
    case expectedConfigurationError
}

private func backendDescriptor(
    id: String,
    publicState: SeisAICoreProviderState = .available
) -> SeisAIProviderDescriptor {
    SeisAIProviderDescriptor(
        id: id,
        displayName: "Test Backend",
        modelIdentifier: "test-backend-model",
        publicState: publicState,
        enabled: true,
        routingEligible: true,
        transport: .backendService,
        credentialBoundary: .backendOnly,
        modelBacked: true,
        capabilities: ["planning"],
        allowedContent: [.publicContent, .repositoryMetadata],
        maximumContextTokens: 8_192,
        supportsTools: false,
        costTier: .low,
        latencyTier: .interactive,
        requiresHumanApproval: true
    )
}

private func providerRoutingRequest(
    id: String,
    requestedProviderID: String?
) -> SeisAIRoutingRequest {
    SeisAIRoutingRequest(
        id: id,
        taskType: "approved backend planning",
        capability: "planning",
        privacyMode: .standard,
        contentClassification: .publicContent,
        localOnly: false,
        maximumCostTier: .low,
        preferredLatencyTier: .interactive,
        preferLocal: false,
        requestedProviderID: requestedProviderID,
        fallbackPolicy: .none
    )
}

private func localDemoExecutionRequest(id: String) -> SeisAIProviderExecutionRequest {
    SeisAIProviderExecutionRequest(
        id: id,
        routing: SeisAIRoutingRequest(
            id: id,
            taskType: "repository readiness plan",
            capability: "planning",
            fallbackPolicy: .explicitLocalDemo
        )
    )
}

private func runtimeConfigurationError(
    adapters: [any SeisAIProviderAdapter]
) throws -> SeisAIRuntimeConfigurationError {
    do {
        _ = try SeisAIRuntime(adapters: adapters)
    } catch let error as SeisAIRuntimeConfigurationError {
        return error
    }
    throw SeisAIRuntimeTestError.expectedConfigurationError
}

private func runtimeSnapshotData() throws -> Data {
    let snapshotURL = repositoryRoot()
        .appendingPathComponent("apps")
        .appendingPathComponent("seis-core")
        .appendingPathComponent("data")
        .appendingPathComponent("seis-ai-core-runtime-snapshot.json")
    return try Data(contentsOf: snapshotURL)
}

private func repositoryRoot() -> URL {
    var url = URL(fileURLWithPath: #filePath)
    for _ in 0..<5 {
        url.deleteLastPathComponent()
    }
    return url
}

private func requireSendable<T: Sendable>(_: T) {}
