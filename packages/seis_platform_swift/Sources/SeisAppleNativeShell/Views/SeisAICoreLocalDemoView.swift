import Foundation
import SeisPlatformKit
import SwiftUI

@MainActor
final class SeisAICoreLocalDemoModel: ObservableObject {
    @Published private(set) var snapshot: SeisAICoreRuntimeSnapshotContract?
    @Published private(set) var workspaceIndex: SeisAppleLocalWorkspaceIndex?
    @Published private(set) var workforceSnapshot: SeisAIWorkforceAssignmentSnapshot?
    @Published private(set) var workforceTrainingSnapshot: SeisAIWorkforceTrainingSnapshot?
    @Published private(set) var modelPlanningSnapshot: SeisAIModelPlanningEvidenceSnapshot?
    @Published private(set) var versionPromotionSnapshot: SeisAICoreVersionPromotionSnapshot?
    @Published private(set) var versionRegistrySnapshot: SeisAICoreVersionRegistrySnapshot?
    @Published private(set) var subagentOperatingModelSnapshot: SeisAISubagentOperatingModelSnapshot?
    @Published private(set) var subagentRuntimeFixturesSnapshot: SeisAISubagentRuntimeFixturesSnapshot?
    @Published private(set) var subagentReviewLedgerSnapshot: SeisAISubagentReviewLedgerSnapshot?
    @Published private(set) var modelScalingCouncilSnapshot: SeisModelScalingSubagentCouncilSnapshot?
    @Published private(set) var mcpRuntimeContractSnapshot: SeisAICoreMCPRuntimeContractSnapshot?
    @Published private(set) var pluginIntegrationSnapshot: SeisAgentPluginIntegrationSnapshot?
    @Published private(set) var providerRegistrySnapshot: SeisAICoreProviderRegistrySnapshot?
    @Published private(set) var readOnlyRouterContractSnapshot: SeisAIReadOnlyModelRouterContractSnapshot?
    @Published private(set) var languageModelIntakeSnapshot: SeisLanguageModelIntakeRegistrySnapshot?
    @Published private(set) var languageModelTrainingCurriculumSnapshot: SeisLanguageModelTrainingCurriculumSnapshot?
    @Published private(set) var publicReadinessProgramSnapshot: SeisAIPublicReadinessProgramSnapshot?
    @Published private(set) var commandCenterOperationsReadinessSnapshot: SeisCommandCenterOperationsReadinessSnapshot?
    @Published private(set) var capabilityMesh: SeisAICapabilityMesh?
    @Published private(set) var orchestrationSnapshot = SeisAGIAgentHandoffSnapshot.current()
    @Published private(set) var readinessReport: SeisAICoreReadinessReport?
    @Published private(set) var statusMessage = "AI Core snapshot has not been loaded."
    @Published private(set) var lastPlan: SeisAIPersonalLaneTaskPlan?
    @Published private(set) var lastAgentPlan: SeisAIAgentTaskPlan?
    @Published private(set) var bulkLanePlanStatus: String?
    @Published private(set) var bulkAgentPlanStatus: String?
    @Published private(set) var routeDecision: SeisAIRouteDecision?
    @Published private(set) var evidence: [SeisAIExecutionEvidence] = []
    @Published private(set) var evidencePersistenceState: SeisAIExecutionEvidencePersistenceState = .memoryOnly
    @Published private(set) var isPlanning = false
    @Published private(set) var isBulkLanePlanning = false
    @Published private(set) var isBulkPlanning = false
    @Published private(set) var isRouting = false

    private let repositoryPath: String
    private let evidenceLedger: SeisAIExecutionEvidenceLedger
    let promptEngine = SeisAIPromptEngine.defaultEngine
    private var runtime: SeisAIRuntime?

    init(repositoryPath: String) {
        self.repositoryPath = repositoryPath
        self.evidenceLedger = SeisAIExecutionEvidenceLedger(storageURL: Self.evidenceStorageURL())
    }

    func load() {
        workspaceIndex = SeisAppleLocalWorkspaceIndex.scan(
            rootURL: URL(fileURLWithPath: repositoryPath)
        )
        workforceSnapshot = try? SeisAIWorkforceAssignmentSnapshot.validated(
            from: Data(contentsOf: workforceURL)
        )
        workforceTrainingSnapshot = try? SeisAIWorkforceTrainingSnapshot.validated(
            from: Data(contentsOf: workforceTrainingURL)
        )
        modelPlanningSnapshot = try? SeisAIModelPlanningEvidenceSnapshot.validated(
            from: modelPlanningData()
        )
        versionPromotionSnapshot = try? SeisAICoreVersionPromotionSnapshot.validated(
            from: Data(contentsOf: versionPromotionURL)
        )
        versionRegistrySnapshot = try? SeisAICoreVersionRegistrySnapshot.validated(
            from: Data(contentsOf: versionRegistryURL)
        )
        subagentOperatingModelSnapshot = try? SeisAISubagentOperatingModelSnapshot.validated(
            from: Data(contentsOf: subagentOperatingModelURL)
        )
        subagentRuntimeFixturesSnapshot = try? SeisAISubagentRuntimeFixturesSnapshot.validated(
            from: Data(contentsOf: subagentRuntimeFixturesURL)
        )
        subagentReviewLedgerSnapshot = try? SeisAISubagentReviewLedgerSnapshot.validated(
            from: Data(contentsOf: subagentReviewLedgerURL)
        )
        modelScalingCouncilSnapshot = try? SeisModelScalingSubagentCouncilSnapshot.validated(
            from: Data(contentsOf: modelScalingCouncilURL)
        )
        mcpRuntimeContractSnapshot = try? SeisAICoreMCPRuntimeContractSnapshot.validated(
            from: Data(contentsOf: mcpRuntimeContractURL)
        )
        pluginIntegrationSnapshot = try? SeisAgentPluginIntegrationSnapshot.validated(
            from: Data(contentsOf: pluginIntegrationURL)
        )
        providerRegistrySnapshot = try? SeisAICoreProviderRegistrySnapshot.validated(
            from: Data(contentsOf: providerRegistryURL)
        )
        readOnlyRouterContractSnapshot = try? SeisAIReadOnlyModelRouterContractSnapshot.validated(
            from: Data(contentsOf: readOnlyRouterContractURL)
        )
        languageModelIntakeSnapshot = try? SeisLanguageModelIntakeRegistrySnapshot.validated(
            from: Data(contentsOf: languageModelIntakeURL)
        )
        languageModelTrainingCurriculumSnapshot = try? SeisLanguageModelTrainingCurriculumSnapshot.validated(
            from: Data(contentsOf: languageModelTrainingCurriculumURL)
        )
        publicReadinessProgramSnapshot = try? SeisAIPublicReadinessProgramSnapshot.validated(
            from: Data(contentsOf: publicReadinessProgramURL)
        )
        commandCenterOperationsReadinessSnapshot = try? SeisCommandCenterOperationsReadinessSnapshot.validated(
            from: Data(contentsOf: commandCenterOperationsReadinessURL)
        )
        do {
            let data = try Data(contentsOf: snapshotURL)
            let nextSnapshot = try SeisAICoreRuntimeSnapshotContract.validated(from: data)
            let loadedRuntime = try SeisAIRuntime.localDemo(snapshotData: data, evidenceLedger: evidenceLedger)
            let nextCapabilityMesh = SeisAICapabilityMesh(snapshot: nextSnapshot)
            let nextOrchestrationSnapshot = SeisAGIAgentHandoffSnapshot.current()
            runtime = loadedRuntime
            snapshot = nextSnapshot
            capabilityMesh = nextCapabilityMesh
            orchestrationSnapshot = nextOrchestrationSnapshot
            readinessReport = SeisAICoreReadinessEvaluator().evaluate(
                snapshot: nextSnapshot,
                capabilityMesh: nextCapabilityMesh,
                promptEngine: promptEngine,
                handoffSnapshot: nextOrchestrationSnapshot,
                workforceSnapshot: workforceSnapshot,
                workforceTrainingSnapshot: workforceTrainingSnapshot,
                modelPlanningSnapshot: modelPlanningSnapshot,
                versionPromotionSnapshot: versionPromotionSnapshot,
                versionRegistrySnapshot: versionRegistrySnapshot,
                subagentOperatingModelSnapshot: subagentOperatingModelSnapshot,
                subagentRuntimeFixturesSnapshot: subagentRuntimeFixturesSnapshot,
                subagentReviewLedgerSnapshot: subagentReviewLedgerSnapshot,
                modelScalingCouncilSnapshot: modelScalingCouncilSnapshot,
                mcpRuntimeContractSnapshot: mcpRuntimeContractSnapshot,
                pluginIntegrationSnapshot: pluginIntegrationSnapshot,
                providerRegistrySnapshot: providerRegistrySnapshot,
                readOnlyRouterContractSnapshot: readOnlyRouterContractSnapshot,
                languageModelIntakeSnapshot: languageModelIntakeSnapshot,
                languageModelTrainingCurriculumSnapshot: languageModelTrainingCurriculumSnapshot,
                publicReadinessProgramSnapshot: publicReadinessProgramSnapshot,
                commandCenterOperationsReadinessSnapshot: commandCenterOperationsReadinessSnapshot
            )
            lastPlan = nil
            lastAgentPlan = nil
            bulkLanePlanStatus = nil
            bulkAgentPlanStatus = nil
            routeDecision = nil
            statusMessage = "Local Demo ready: \(nextSnapshot.pluginMesh.personalLanes.count) lanes are linked to the typed runtime."
            Task {
                evidence = await loadedRuntime.evidenceSnapshot(limit: 8)
                evidencePersistenceState = await loadedRuntime.evidencePersistenceState()
            }
        } catch {
            runtime = nil
            snapshot = nil
            workspaceIndex = SeisAppleLocalWorkspaceIndex.scan(
                rootURL: URL(fileURLWithPath: repositoryPath)
            )
            workforceSnapshot = try? SeisAIWorkforceAssignmentSnapshot.validated(
                from: Data(contentsOf: workforceURL)
            )
            workforceTrainingSnapshot = try? SeisAIWorkforceTrainingSnapshot.validated(
                from: Data(contentsOf: workforceTrainingURL)
            )
            modelPlanningSnapshot = try? SeisAIModelPlanningEvidenceSnapshot.validated(
                from: modelPlanningData()
            )
            versionPromotionSnapshot = try? SeisAICoreVersionPromotionSnapshot.validated(
                from: Data(contentsOf: versionPromotionURL)
            )
            versionRegistrySnapshot = try? SeisAICoreVersionRegistrySnapshot.validated(
                from: Data(contentsOf: versionRegistryURL)
            )
            subagentOperatingModelSnapshot = try? SeisAISubagentOperatingModelSnapshot.validated(
                from: Data(contentsOf: subagentOperatingModelURL)
            )
            subagentRuntimeFixturesSnapshot = try? SeisAISubagentRuntimeFixturesSnapshot.validated(
                from: Data(contentsOf: subagentRuntimeFixturesURL)
            )
            subagentReviewLedgerSnapshot = try? SeisAISubagentReviewLedgerSnapshot.validated(
                from: Data(contentsOf: subagentReviewLedgerURL)
            )
            modelScalingCouncilSnapshot = try? SeisModelScalingSubagentCouncilSnapshot.validated(
                from: Data(contentsOf: modelScalingCouncilURL)
            )
            mcpRuntimeContractSnapshot = try? SeisAICoreMCPRuntimeContractSnapshot.validated(
                from: Data(contentsOf: mcpRuntimeContractURL)
            )
            pluginIntegrationSnapshot = try? SeisAgentPluginIntegrationSnapshot.validated(
                from: Data(contentsOf: pluginIntegrationURL)
            )
            providerRegistrySnapshot = try? SeisAICoreProviderRegistrySnapshot.validated(
                from: Data(contentsOf: providerRegistryURL)
            )
            readOnlyRouterContractSnapshot = try? SeisAIReadOnlyModelRouterContractSnapshot.validated(
                from: Data(contentsOf: readOnlyRouterContractURL)
            )
            languageModelIntakeSnapshot = try? SeisLanguageModelIntakeRegistrySnapshot.validated(
                from: Data(contentsOf: languageModelIntakeURL)
            )
            languageModelTrainingCurriculumSnapshot = try? SeisLanguageModelTrainingCurriculumSnapshot.validated(
                from: Data(contentsOf: languageModelTrainingCurriculumURL)
            )
            publicReadinessProgramSnapshot = try? SeisAIPublicReadinessProgramSnapshot.validated(
                from: Data(contentsOf: publicReadinessProgramURL)
            )
            commandCenterOperationsReadinessSnapshot = try? SeisCommandCenterOperationsReadinessSnapshot.validated(
                from: Data(contentsOf: commandCenterOperationsReadinessURL)
            )
            capabilityMesh = nil
            workforceTrainingSnapshot = nil
            modelPlanningSnapshot = nil
            versionPromotionSnapshot = nil
            versionRegistrySnapshot = nil
            subagentOperatingModelSnapshot = nil
            subagentRuntimeFixturesSnapshot = nil
            subagentReviewLedgerSnapshot = nil
            modelScalingCouncilSnapshot = nil
            mcpRuntimeContractSnapshot = nil
            pluginIntegrationSnapshot = nil
            providerRegistrySnapshot = nil
            readOnlyRouterContractSnapshot = nil
            languageModelIntakeSnapshot = nil
            languageModelTrainingCurriculumSnapshot = nil
            publicReadinessProgramSnapshot = nil
            commandCenterOperationsReadinessSnapshot = nil
            orchestrationSnapshot = SeisAGIAgentHandoffSnapshot(records: [])
            readinessReport = nil
            lastPlan = nil
            lastAgentPlan = nil
            bulkLanePlanStatus = nil
            bulkAgentPlanStatus = nil
            routeDecision = nil
            evidence = []
            Task {
                evidencePersistenceState = await evidenceLedger.persistenceState
            }
            statusMessage = "AI Core Local Demo is unavailable because the tracked snapshot did not validate."
        }
    }

    func planAgent(_ agent: SeisAICoreManagedAgent) {
        guard let runtime else {
            statusMessage = "Load a validated snapshot before planning an agent."
            return
        }
        guard let purpose = renderPlanPurpose(
            goal: agent.displayName,
            constraints: "Status-and-plan-only; inspect repository metadata and produce a bounded plan."
        ) else { return }

        isPlanning = true
        let request = SeisAIAgentTaskRequest(
            id: "apple-agent-plan-\(agent.id)",
            agentID: agent.id,
            purpose: purpose,
            requestedActions: [.inspectRepositoryMetadata, .producePlan],
            inputReferences: ["apps/seis-core/data/seis-ai-core-runtime-snapshot.json"]
        )

        Task {
            let plan = await runtime.planAgentTask(request)
            lastAgentPlan = plan
            evidence = await runtime.evidenceSnapshot(limit: 8)
            evidencePersistenceState = await runtime.evidencePersistenceState()
            isPlanning = false
            statusMessage = plan.outcome == .planned
                ? "\(agent.displayName) plan prepared without runtime authority."
                : "\(agent.displayName) plan was blocked by the Local Demo boundary."
        }
    }

    func planAllAgents(_ agents: [SeisAICoreManagedAgent]) {
        guard let runtime else {
            statusMessage = "Load a validated snapshot before planning managed agents."
            return
        }
        guard !agents.isEmpty else {
            statusMessage = "No managed agents are registered in the validated snapshot."
            return
        }

        let requests = agents.compactMap { agent -> SeisAIAgentTaskRequest? in
            guard let purpose = renderPlanPurpose(
                goal: agent.displayName,
                constraints: "Status-and-plan-only; inspect repository metadata and produce a bounded plan."
            ) else {
                return nil
            }
            return SeisAIAgentTaskRequest(
                id: "apple-bulk-agent-plan-\(agent.id)",
                agentID: agent.id,
                purpose: purpose,
                requestedActions: [.inspectRepositoryMetadata, .producePlan],
                inputReferences: ["apps/seis-core/data/seis-ai-core-runtime-snapshot.json"]
            )
        }

        guard requests.count == agents.count else {
            statusMessage = "Managed-agent batch was blocked by the versioned prompt safety boundary."
            return
        }

        isPlanning = true
        isBulkPlanning = true
        bulkAgentPlanStatus = nil

        Task {
            var plans: [SeisAIAgentTaskPlan] = []
            for request in requests {
                plans.append(await runtime.planAgentTask(request))
            }

            let plannedCount = plans.filter { $0.outcome == .planned }.count
            lastAgentPlan = plans.last
            bulkAgentPlanStatus = "\(plannedCount)/\(plans.count) managed agent plans prepared locally; no agent was activated."
            evidence = await runtime.evidenceSnapshot(limit: 8)
            evidencePersistenceState = await runtime.evidencePersistenceState()
            isBulkPlanning = false
            isPlanning = false
            statusMessage = "Managed-agent batch completed as bounded plan-only work; no provider, MCP, SSH, deployment, or GitHub action was executed."
        }
    }

    func planArchitectTask(purpose: String) {
        guard let runtime else {
            statusMessage = "Load a validated snapshot before planning a task."
            return
        }
        guard let renderedPurpose = renderPlanPurpose(
            goal: purpose,
            constraints: "Status-and-plan-only; no provider, MCP, SSH, deployment, or GitHub mutation."
        ) else { return }

        isPlanning = true
        let request = SeisAIAgentTaskRequest(
            id: "apple-architect-task-plan",
            agentID: "architect-agent",
            purpose: renderedPurpose,
            requestedActions: [.inspectRepositoryMetadata, .producePlan],
            inputReferences: ["apps/seis-core/data/seis-ai-core-runtime-snapshot.json"]
        )

        Task {
            let plan = await runtime.planAgentTask(request)
            lastAgentPlan = plan
            evidence = await runtime.evidenceSnapshot(limit: 8)
            evidencePersistenceState = await runtime.evidencePersistenceState()
            isPlanning = false
            statusMessage = plan.outcome == .planned
                ? "Architect task plan prepared locally; purpose text was not persisted to evidence."
                : "Architect task plan was blocked by the Local Demo boundary."
        }
    }

    func plan(for lane: SeisAICorePersonalLane) {
        guard let runtime else {
            statusMessage = "Load a validated snapshot before planning a lane."
            return
        }
        guard let purpose = renderPlanPurpose(
            goal: lane.displayName,
            constraints: "Status-and-plan-only; review the declared MCP tools and quality gate without invocation."
        ) else { return }

        isPlanning = true
        let request = SeisAIPersonalLaneTaskRequest(
            id: "apple-local-plan-\(lane.id)",
            laneID: lane.id,
            purpose: purpose,
            requestedActions: [
                .inspectCapabilityContract,
                .prepareReadOnlyPlan,
                .reviewQualityGate
            ],
            requestedMCPToolIDs: [lane.mcpTools.last ?? ""],
            inputReferences: ["apps/seis-core/data/seis-ai-core-runtime-snapshot.json"]
        )

        Task {
            let plan = await runtime.planPersonalLaneTask(request)
            lastPlan = plan
            evidence = await runtime.evidenceSnapshot(limit: 8)
            evidencePersistenceState = await runtime.evidencePersistenceState()
            isPlanning = false
            statusMessage = plan.outcome == .planned
                ? "\(lane.displayName) plan prepared without invoking MCP or a provider."
                : "\(lane.displayName) plan was blocked by the Local Demo boundary."
        }
    }

    func planAllLanes(_ lanes: [SeisAICorePersonalLane]) {
        guard let runtime else {
            statusMessage = "Load a validated snapshot before planning personal lanes."
            return
        }
        guard !lanes.isEmpty else {
            statusMessage = "No personal lanes are registered in the validated snapshot."
            return
        }

        let requests = lanes.compactMap { lane -> SeisAIPersonalLaneTaskRequest? in
            guard let purpose = renderPlanPurpose(
                goal: lane.displayName,
                constraints: "Status-and-plan-only; review the declared MCP tools and quality gate without invocation."
            ) else {
                return nil
            }
            guard let toolID = lane.mcpTools.last, !toolID.isEmpty else {
                statusMessage = "Personal-lane batch was blocked because a lane has no declared MCP tool."
                return nil
            }
            return SeisAIPersonalLaneTaskRequest(
                id: "apple-bulk-lane-plan-\(lane.id)",
                laneID: lane.id,
                purpose: purpose,
                requestedActions: [
                    .inspectCapabilityContract,
                    .prepareReadOnlyPlan,
                    .reviewQualityGate
                ],
                requestedMCPToolIDs: [toolID],
                inputReferences: ["apps/seis-core/data/seis-ai-core-runtime-snapshot.json"]
            )
        }

        guard requests.count == lanes.count else {
            statusMessage = "Personal-lane batch was blocked by the prompt or capability safety boundary."
            return
        }

        isPlanning = true
        isBulkLanePlanning = true
        bulkLanePlanStatus = nil

        Task {
            var plans: [SeisAIPersonalLaneTaskPlan] = []
            for request in requests {
                plans.append(await runtime.planPersonalLaneTask(request))
            }

            let plannedCount = plans.filter { $0.outcome == .planned }.count
            lastPlan = plans.last
            bulkLanePlanStatus = "\(plannedCount)/\(plans.count) personal lane plans prepared locally; MCP invocation was not performed."
            evidence = await runtime.evidenceSnapshot(limit: 8)
            evidencePersistenceState = await runtime.evidencePersistenceState()
            isBulkLanePlanning = false
            isPlanning = false
            statusMessage = "Personal-lane batch completed as bounded plan-only work; no MCP, provider, SSH, deployment, or GitHub action was executed."
        }
    }

    func inspectRoute(
        taskType: String,
        capability: String,
        privacyMode: SeisAIPrivacyMode,
        contentClassification: SeisAIContentClassification,
        localOnly: Bool,
        requiresTools: Bool,
        maximumCostTier: SeisAICostTier,
        preferredLatencyTier: SeisAILatencyTier,
        fallbackPolicy: SeisAIFallbackPolicy
    ) {
        guard let runtime else {
            statusMessage = "Load a validated snapshot before inspecting a route."
            return
        }

        let request = SeisAIRoutingRequest(
            id: "apple-route-inspection",
            taskType: taskType,
            capability: capability,
            privacyMode: privacyMode,
            contentClassification: contentClassification,
            localOnly: localOnly,
            requiresTools: requiresTools,
            maximumCostTier: maximumCostTier,
            preferredLatencyTier: preferredLatencyTier,
            preferLocal: true,
            fallbackPolicy: fallbackPolicy
        )

        isRouting = true
        Task {
            let decision = await runtime.inspectRoute(request)
            routeDecision = decision
            isRouting = false
            switch decision.outcome {
            case .localDemoReady:
                statusMessage = "Route is Local Demo ready; no provider or network call was performed."
            case .approvalRequired:
                statusMessage = "Route found, but live or model-backed execution requires human approval."
            case .blocked:
                statusMessage = "Route blocked by the typed privacy, capability, or provider boundary."
            }
        }
    }

    private func renderPlanPurpose(goal: String, constraints: String) -> String? {
        do {
            return try promptEngine.render(
                templateID: "task-plan",
                variables: ["goal": goal, "constraints": constraints],
                renderID: "apple-plan-prompt"
            ).text
        } catch {
            statusMessage = "Plan blocked by the versioned prompt safety boundary."
            return nil
        }
    }

    private var snapshotURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("apps")
            .appendingPathComponent("seis-core")
            .appendingPathComponent("data")
            .appendingPathComponent("seis-ai-core-runtime-snapshot.json")
    }

    private var workforceURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("ai-workforce-assignments.json")
    }

    private var workforceTrainingURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-ai-workforce-training-plan.json")
    }

    private func modelPlanningData() throws -> [String: Data] {
        try Dictionary(uniqueKeysWithValues: SeisAIModelPlanningEvidenceSnapshot.canonicalIDs.map { id in
            let url = URL(fileURLWithPath: repositoryPath)
                .appendingPathComponent("content")
                .appendingPathComponent("development")
                .appendingPathComponent("\(id).json")
            return (id, try Data(contentsOf: url))
        })
    }

    private var versionPromotionURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-ai-core-version-promotion-gates.json")
    }

    private var versionRegistryURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-ai-core-version-registry.json")
    }

    private var subagentOperatingModelURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-ai-core-subagent-operating-model.json")
    }

    private var subagentRuntimeFixturesURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-ai-core-subagent-runtime-fixtures.json")
    }

    private var subagentReviewLedgerURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-ai-core-subagent-review-ledger.json")
    }

    private var modelScalingCouncilURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-model-scaling-subagent-council.json")
    }

    private var mcpRuntimeContractURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-ai-core-mcp-runtime-contract.json")
    }

    private var pluginIntegrationURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-agent-plugin-integration.json")
    }

    private var providerRegistryURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-ai-core-provider-registry.json")
    }

    private var readOnlyRouterContractURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-read-only-model-router-contract.json")
    }

    private var languageModelIntakeURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-language-model-intake-registry.json")
    }

    private var languageModelTrainingCurriculumURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-language-model-training-curriculum.json")
    }

    private var publicReadinessProgramURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-ai-public-readiness-program.json")
    }

    private var commandCenterOperationsReadinessURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-command-center-operations-readiness.json")
    }

    private static func evidenceStorageURL() -> URL? {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)
            .first?
            .appendingPathComponent("SEIS", isDirectory: true)
            .appendingPathComponent("ai-core-execution-evidence.json")
    }
}

struct SeisAICoreLocalDemoView: View {
    @StateObject private var model: SeisAICoreLocalDemoModel
    @State private var taskPurpose = "Prepare a bounded repository readiness plan."
    @State private var routeTaskType = "repository readiness plan"
    @State private var routeCapability = "planning"
    @State private var routePrivacyMode: SeisAIPrivacyMode = .localOnly
    @State private var routeContentClassification: SeisAIContentClassification = .repositoryMetadata
    @State private var routeLocalOnly = true
    @State private var routeRequiresTools = false
    @State private var routeMaximumCostTier: SeisAICostTier = .zero
    @State private var routePreferredLatencyTier: SeisAILatencyTier = .immediate
    @State private var routeFallbackPolicy: SeisAIFallbackPolicy = .none

    init(repositoryPath: String) {
        _model = StateObject(wrappedValue: SeisAICoreLocalDemoModel(repositoryPath: repositoryPath))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            header

            if let snapshot = model.snapshot {
                metrics(snapshot: snapshot)
                if let workspaceIndex = model.workspaceIndex {
                    workspaceAwarenessDisclosure(index: workspaceIndex)
                }
                if let workforceSnapshot = model.workforceSnapshot {
                    workforceDisclosure(snapshot: workforceSnapshot)
                }
                if let workforceTrainingSnapshot = model.workforceTrainingSnapshot {
                    workforceTrainingDisclosure(snapshot: workforceTrainingSnapshot)
                }
                if let modelPlanningSnapshot = model.modelPlanningSnapshot {
                    modelPlanningDisclosure(snapshot: modelPlanningSnapshot)
                }
                if let versionPromotionSnapshot = model.versionPromotionSnapshot {
                    versionPromotionDisclosure(snapshot: versionPromotionSnapshot)
                }
                if let versionRegistrySnapshot = model.versionRegistrySnapshot {
                    versionRegistryDisclosure(snapshot: versionRegistrySnapshot)
                }
                if let subagentOperatingModelSnapshot = model.subagentOperatingModelSnapshot {
                    subagentOperatingModelDisclosure(snapshot: subagentOperatingModelSnapshot)
                }
                if let subagentRuntimeFixturesSnapshot = model.subagentRuntimeFixturesSnapshot {
                    subagentRuntimeFixturesDisclosure(snapshot: subagentRuntimeFixturesSnapshot)
                }
                if let subagentReviewLedgerSnapshot = model.subagentReviewLedgerSnapshot {
                    subagentReviewLedgerDisclosure(snapshot: subagentReviewLedgerSnapshot)
                }
                if let modelScalingCouncilSnapshot = model.modelScalingCouncilSnapshot {
                    modelScalingCouncilDisclosure(snapshot: modelScalingCouncilSnapshot)
                }
                if let mcpRuntimeContractSnapshot = model.mcpRuntimeContractSnapshot {
                    mcpRuntimeContractDisclosure(snapshot: mcpRuntimeContractSnapshot)
                }
                if let pluginIntegrationSnapshot = model.pluginIntegrationSnapshot {
                    pluginIntegrationDisclosure(snapshot: pluginIntegrationSnapshot)
                }
                if let providerRegistrySnapshot = model.providerRegistrySnapshot {
                    providerRegistryDisclosure(snapshot: providerRegistrySnapshot)
                }
                if let readOnlyRouterContractSnapshot = model.readOnlyRouterContractSnapshot {
                    readOnlyRouterContractDisclosure(snapshot: readOnlyRouterContractSnapshot)
                }
                if let languageModelIntakeSnapshot = model.languageModelIntakeSnapshot {
                    languageModelIntakeDisclosure(snapshot: languageModelIntakeSnapshot)
                }
                if let languageModelTrainingCurriculumSnapshot = model.languageModelTrainingCurriculumSnapshot {
                    languageModelTrainingCurriculumDisclosure(snapshot: languageModelTrainingCurriculumSnapshot)
                }
                if let publicReadinessProgramSnapshot = model.publicReadinessProgramSnapshot {
                    publicReadinessProgramDisclosure(snapshot: publicReadinessProgramSnapshot)
                }
                if let commandCenterOperationsReadinessSnapshot = model.commandCenterOperationsReadinessSnapshot {
                    commandCenterOperationsReadinessDisclosure(snapshot: commandCenterOperationsReadinessSnapshot)
                }
                if let capabilityMesh = model.capabilityMesh {
                    capabilityMeshDisclosure(mesh: capabilityMesh)
                }
                orchestrationDisclosure(snapshot: model.orchestrationSnapshot)
                promptCatalogDisclosure(engine: model.promptEngine)
                if let readinessReport = model.readinessReport {
                    readinessDisclosure(report: readinessReport)
                }
                routeInspector
                providerList(snapshot: snapshot)
                taskPlanner
                laneList(snapshot: snapshot)
                agentList(snapshot: snapshot)

                if let plan = model.lastPlan {
                    planResult(plan)
                }

                if let agentPlan = model.lastAgentPlan {
                    agentPlanResult(agentPlan)
                }

                if !model.evidence.isEmpty {
                    evidenceLedger
                }
            } else {
                VStack(spacing: 8) {
                    Image(systemName: "exclamationmark.shield")
                        .font(.title2)
                        .foregroundStyle(.orange)
                    Text("AI Core Local Demo unavailable")
                        .font(.subheadline.weight(.semibold))
                    Text(model.statusMessage)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity, minHeight: 160)
            }
        }
        .padding(16)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
        .onAppear(perform: model.load)
    }

    private var header: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "brain.head.profile")
                .font(.title2)
                .foregroundStyle(.indigo)
                .frame(width: 34, height: 34)
                .background(.indigo.opacity(0.12), in: RoundedRectangle(cornerRadius: 9))

            VStack(alignment: .leading, spacing: 4) {
                Text("SEIS AI Core")
                    .font(.headline)
                Text("Typed Local Demo plans for the five declared SEIS lanes")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Button {
                model.load()
            } label: {
                Label("Refresh", systemImage: "arrow.clockwise")
            }
            .buttonStyle(.bordered)
            .disabled(model.isPlanning)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("SEIS AI Core Local Demo. \(model.statusMessage)")
    }

    private func metrics(snapshot: SeisAICoreRuntimeSnapshotContract) -> some View {
        let metrics = snapshot.summaryMetrics
        return LazyVGrid(
            columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())],
            spacing: 8
        ) {
            metric("Providers", value: "\(metrics.providerCount)", image: "cpu")
            metric("Lanes", value: "\(metrics.personalLaneCount)", image: "square.stack.3d.up")
            metric("Agents", value: "\(metrics.managedAgentCount)", image: "person.3")
            metric("MCP tools", value: "\(metrics.mcpToolCount)", image: "wrench.and.screwdriver")
            metric("Resources", value: "\(metrics.mcpResourceCount)", image: "folder")
            metric("Boundary", value: metrics.runtimeBoundarySafe ? "safe" : "watch", image: "checkmark.shield")
            metric("Evidence", value: model.evidencePersistenceState.displayLabel, image: "externaldrive")
        }
    }

    private func providerList(snapshot: SeisAICoreRuntimeSnapshotContract) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 7) {
                Text("Source-backed status only; no credential validation or provider call is performed.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                ForEach(snapshot.providerRegistry.providers) { provider in
                    HStack(alignment: .top, spacing: 9) {
                        Image(systemName: provider.publicStatus == .available ? "checkmark.shield" : "exclamationmark.shield")
                            .foregroundStyle(providerStatusColor(provider.publicStatus))
                            .frame(width: 20)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(provider.displayName)
                                .font(.caption.weight(.semibold))
                            Text("\(provider.publicStatus.rawValue) · \(provider.actualModel)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text("Credential: \(provider.credentialRequirement) · Backend-only: \(provider.backendOnly ? "yes" : "no") · Routing: \(provider.routingEligible ? "eligible" : "blocked")")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }

                        Spacer(minLength: 0)
                    }
                    .padding(8)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                }
            }
            .padding(.top, 8)
        } label: {
            Label("Provider status (\(snapshot.providerRegistry.providers.count))", systemImage: "cpu")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Provider status list with \(snapshot.providerRegistry.providers.count) source-backed providers. No credential validation or provider call is performed.")
    }

    private func capabilityMeshDisclosure(mesh: SeisAICapabilityMesh) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text(mesh.pluginStatusLabel)
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                Text("Activation: \(mesh.activationPolicy)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                Text(mesh.mcpStatusLabel)
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                Text("Personal lanes: \(mesh.laneIDs.joined(separator: ", "))")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)

                ForEach(mesh.mcpSurfaces) { surface in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: surface.state == "verified" ? "checkmark.seal" : "questionmark.circle")
                            .foregroundStyle(surface.state == "verified" ? .green : .orange)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(surface.label) · \(surface.count)")
                                .font(.caption.weight(.semibold))
                            Text("\(surface.method) · \(surface.state)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(8)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                }

                Text(mesh.isValid
                     ? "Source-backed capability mesh validated. Native view has no MCP invocation or plugin activation authority."
                     : mesh.validationIssues.joined(separator: " "))
                    .font(.caption2)
                    .foregroundStyle(mesh.isValid ? .green : .orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Plugin + MCP capability mesh", systemImage: "point.3.connected.trianglepath.dotted")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Plugin and MCP capability mesh. \(mesh.pluginStatusLabel). \(mesh.mcpStatusLabel). No plugin activation or MCP invocation is performed.")
    }

    private func workspaceAwarenessDisclosure(index: SeisAppleLocalWorkspaceIndex) -> some View {
        let fileCount = index.entries.filter { $0.kind == .file }.count
        let directoryCount = index.entries.filter { $0.kind == .directory }.count

        return DisclosureGroup {
            VStack(alignment: .leading, spacing: 7) {
                Text("Root: \(index.rootPath)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
                Text("State: \(index.state.rawValue) · Entries: \(index.entries.count) · Files: \(fileCount) · Folders: \(directoryCount)")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                Text("Excluded: \(index.excludedCategories.joined(separator: ", "))")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                Text("Metadata awareness only. AI Core does not read file contents, open files, write, rename, delete, execute, or infer private content from this index.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Local workspace awareness", systemImage: "folder.badge.gearshape")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Local workspace awareness. \(index.entries.count) safe metadata entries indexed. File contents and mutations are disabled.")
    }

    private func workforceDisclosure(snapshot: SeisAIWorkforceAssignmentSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Source: content/development/ai-workforce-assignments.json · Version: \(snapshot.version)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Assignments: \(snapshot.assignments.count) · Primary writer: \(snapshot.writerPolicy.primaryWriter) · Status: metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                Text(snapshot.writerPolicy.rule)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                ForEach(snapshot.assignments) { assignment in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: workforceStatusIcon(assignment.launcherStatus))
                            .foregroundStyle(workforceStatusColor(assignment.launcherStatus))
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(assignment.displayName)
                                .font(.caption.weight(.semibold))
                            Text("\(assignment.category) · \(assignment.route) · \(assignment.launcherStatus)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text("No provider call, credential access, direct write, merge, deploy, or autonomous authority.")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(8)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                }
            }
            .padding(.top, 8)
        } label: {
            Label("Installed AI workforce roles", systemImage: "person.3.sequence.fill")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Installed AI workforce role registry. \(snapshot.assignments.count) metadata-only assignments. Codex is the primary writer and all other roles remain review, draft, or local-only surfaces.")
    }

    private func workforceStatusIcon(_ status: String) -> String {
        if status == "installed" { return "checkmark.circle" }
        if status.contains("missing-key") { return "key.slash" }
        if status.contains("pending") || status.contains("defined") { return "clock" }
        return "questionmark.circle"
    }

    private func workforceStatusColor(_ status: String) -> Color {
        if status == "installed" { return .green }
        if status.contains("missing-key") { return .orange }
        if status.contains("pending") || status.contains("defined") { return .secondary }
        return .orange
    }

    private func workforceTrainingDisclosure(snapshot: SeisAIWorkforceTrainingSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Source: content/development/seis-ai-workforce-training-plan.json · Version: \(snapshot.version)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("\(snapshot.trainerRoles.count) trainer roles · \(snapshot.trainingLoops.count) loops · \(snapshot.modelTargets.count) seed targets · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                Text("Quality gate: \(snapshot.qualityGate) · Automation: \(snapshot.automationCommand)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text(snapshot.truthBoundary)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                Text("Trainer roles")
                    .font(.caption.weight(.semibold))
                ForEach(snapshot.trainerRoles) { role in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: role.routeStatus == "installed" ? "checkmark.shield" : "clock.badge.exclamationmark")
                            .foregroundStyle(role.routeStatus == "installed" ? .green : .orange)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(role.displayName)
                                .font(.caption.weight(.semibold))
                            Text("\(role.routeStatus) · \(role.trainingRole)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text(role.outputStatus)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                }

                Text("Seed targets")
                    .font(.caption.weight(.semibold))
                ForEach(snapshot.modelTargets) { target in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: target.runtimeAuthority ? "exclamationmark.triangle" : "lock.shield")
                            .foregroundStyle(target.runtimeAuthority ? .red : .green)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(target.id)
                                .font(.caption.weight(.semibold))
                            Text(target.purpose)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                            Text("Runtime authority: \(target.runtimeAuthority ? "enabled" : "false") · validator: \(target.validationCommand)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                }
                Text("This surface inspects the local training contract only. It does not run training, download datasets, call providers, read credentials, publish models, or grant runtime authority.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("AI workforce training control plane", systemImage: "graduationcap.fill")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("AI workforce training control plane. Ten trainer roles, seven local training loops, four runtime authority false seed targets, and no live training or provider access.")
    }

    private func modelPlanningDisclosure(snapshot: SeisAIModelPlanningEvidenceSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Six canonical model and readiness records · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                Text("AGI claim: blocked · Local Demo: \(snapshot.localDemoIsAllowed ? "allowed" : "not established") · Plan-only: \(snapshot.isMetadataOnly ? "yes" : "no")")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.agiClaimIsBlocked ? .secondary : .red)
                Text("No route today, runtime authority, production readiness, or trained foundation-model claim is inferred from these records.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                ForEach(snapshot.records) { record in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: record.isPlanOnly ? "lock.shield" : "exclamationmark.triangle")
                            .foregroundStyle(record.isPlanOnly ? .green : .red)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(record.id)
                                .font(.caption.weight(.semibold))
                            Text(record.statusLabel)
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text("Runtime: \(record.runtimeAuthority == true ? "enabled" : "blocked") · Production: \(record.productionReady == true ? "ready" : "blocked") · AGI claim: \(record.agiClaimAllowed == true || record.publicReadyAsAgi == true ? "allowed" : "blocked")")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                            Text("Forbidden claims: \(record.forbiddenClaimsCount) · Approvals: \(record.humanApprovalCount) · Next safe actions: \(record.nextSafeActionsCount)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(8)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                }
            }
            .padding(.top, 8)
        } label: {
            Label("Model scaling and AGI evidence", systemImage: "chart.bar.doc.horizontal")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Model scaling and AGI evidence. Six plan-only records. Route, runtime authority, production readiness, and AGI claims are blocked; Local Demo is the only allowed mode.")
    }

    private func versionPromotionDisclosure(snapshot: SeisAICoreVersionPromotionSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Source: content/development/seis-ai-core-version-promotion-gates.json · Version: \(snapshot.version)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Decision: \(snapshot.currentDryRun.decision) · Release promotion: \(snapshot.currentDryRun.releasePromotionAllowed ? "allowed" : "blocked") · Real execution: \(snapshot.currentDryRun.realExecutionBlocked ? "blocked" : "available")")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Runtime: \(snapshot.runtimeBoundary.currentLevel) · Write: \(snapshot.runtimeBoundary.writeExecution) · Provider calls: \(snapshot.runtimeBoundary.liveProviderCalls) · Credentials: \(snapshot.runtimeBoundary.credentialAccess)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text(snapshot.currentDryRun.reason)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                Text("Lane responsibilities")
                    .font(.caption.weight(.semibold))
                ForEach(snapshot.laneResponsibilities) { lane in
                    VStack(alignment: .leading, spacing: 2) {
                        Text(lane.displayName)
                            .font(.caption.weight(.semibold))
                        Text(lane.promotionDuty)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }

                Text("Yearly promotion gates")
                    .font(.caption.weight(.semibold))
                ForEach(snapshot.gates) { gate in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: gate.releasePromotionAllowed ? "exclamationmark.triangle" : "lock.shield")
                            .foregroundStyle(gate.releasePromotionAllowed ? .red : .green)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Year \(gate.year) · \(gate.versionTarget)")
                                .font(.caption.weight(.semibold))
                            Text("\(gate.status) · \(gate.dryRunDecision) · Human approval: \(gate.humanApprovalRequired ? "required" : "not required")")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text("Evidence: \(gate.requiredEvidence.count) · Validators: \(gate.validationCommands.count) · Blockers: \(gate.blockers.count)")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                }
                Text("This is a promotion dry-run, not release approval. No release, external mutation, credential access, deployment, SSH, provider call, or background automation was performed.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("AI Core version promotion gates", systemImage: "checkmark.seal")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("AI Core version promotion gates. Evidence-only dry-run, five yearly gates, release promotion blocked, external mutation blocked, and human approval boundaries visible.")
    }

    private func versionRegistryDisclosure(snapshot: SeisAICoreVersionRegistrySnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.currentVersion.displayName) · \(snapshot.currentVersion.maturity)")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                Text("Provider mode: \(snapshot.currentVersion.providerMode) · Runtime: \(snapshot.runtimeBoundary.currentLevel) · Local Demo: \(snapshot.runtimeBoundary.localDemoAllowed ? "allowed" : "blocked")")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("\(snapshot.versionComponents.count) components · \(snapshot.linkedSubAgentLanes.count) plan-only lanes · \(snapshot.fiveYearVersionRoadmap.count)-year roadmap · \(snapshot.promotionEvidenceRequired.count) promotion evidence requirements")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                Text("The registry identifies an application-layer intelligence profile. It is not a foundation model, trained model, autonomous write runtime, provider ownership claim, or release approval.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                ForEach(snapshot.versionComponents) { component in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: component.status.contains("validated") ? "checkmark.circle" : "doc.text")
                            .foregroundStyle(component.status.contains("validated") ? .green : .secondary)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(component.name)
                                .font(.caption.weight(.semibold))
                            Text("\(component.kind) · \(component.status)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text(component.validation)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                }

                Text("Linked lane permission levels")
                    .font(.caption.weight(.semibold))
                ForEach(snapshot.linkedSubAgentLanes) { lane in
                    HStack {
                        Text(lane.displayName)
                            .font(.caption)
                        Spacer(minLength: 8)
                        Text(lane.permissionLevel)
                            .font(.caption2.monospaced())
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .padding(.top, 8)
        } label: {
            Label("AI Core version registry", systemImage: "number.circle")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("AI Core version registry. SEIS AI Core v0.1, zero-key core, seven components, five plan-only lanes, and five-year roadmap. No trained model or autonomous write claim.")
    }

    private func subagentOperatingModelDisclosure(snapshot: SeisAISubagentOperatingModelSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Runtime: \(snapshot.runtimeBoundary.currentLevel) · Write: \(snapshot.runtimeBoundary.writeMode) · External mutation: \(snapshot.runtimeBoundary.externalMutation)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("\(snapshot.lanes.count) lanes · \(snapshot.permissionMatrix.count) permission levels · \(snapshot.evidenceRequirements.count) evidence requirements · five-year cadence")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                Text("Allowed now: \(snapshot.runtimeBoundary.allowedNow.joined(separator: ", "))")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                Text("Permission matrix")
                    .font(.caption.weight(.semibold))
                ForEach(snapshot.permissionMatrix) { permission in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: permission.status == "enabled" ? "checkmark.shield" : permission.level == "forbidden" ? "nosign" : "clock")
                            .foregroundStyle(permission.status == "enabled" ? .green : permission.level == "forbidden" ? .red : .orange)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(permission.level) · \(permission.status)")
                                .font(.caption.weight(.semibold))
                            Text("Approval: \(permission.approvalRequired) · Actions: \(permission.allowedActions.count) · Evidence: \(permission.evidenceRequired.count)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                        }
                        Spacer(minLength: 0)
                    }
                }

                Text("Sub-agent lanes")
                    .font(.caption.weight(.semibold))
                ForEach(snapshot.lanes) { lane in
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(lane.displayName) · \(lane.currentPermissionLevel)")
                            .font(.caption.weight(.semibold))
                        Text("\(lane.statusTool) / \(lane.planTool) · \(lane.qualityGate)")
                            .font(.caption2.monospaced())
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .padding(.top, 8)
        } label: {
            Label("Sub-agent operating model", systemImage: "person.2.badge.gearshape")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Sub-agent operating model. Five plan-only lanes, five permission levels, fourteen evidence requirements, and external actions approval-gated.")
    }

    private func subagentRuntimeFixturesDisclosure(snapshot: SeisAISubagentRuntimeFixturesSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Runtime: \(snapshot.runtimeBoundary["currentLevel"] ?? "unknown") · Write: \(snapshot.runtimeBoundary["writeExecution"] ?? "unknown") · Background: \(snapshot.runtimeBoundary["backgroundAutomation"] ?? "unknown")")
                    .font(.caption2.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("\(snapshot.fixtures.count) fixture references · delegation depth \(snapshot.roleSchema.maxDelegationDepth) · single-writer queue · append-only planned ledger")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)

                ForEach(snapshot.fixtures) { fixture in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: "checkmark.shield")
                            .foregroundStyle(.green)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(fixture.id)
                                .font(.caption.weight(.semibold))
                            Text(fixture.path)
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text(fixture.summary)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                }
                Text("Cancellation: \(snapshot.cancellationFixture.supportedSignals.joined(separator: ", "))")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Approval records are scoped and blanket approval is disallowed. Redaction is required before promotion; secret values and raw provider errors are not stored.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Sub-agent runtime fixtures", systemImage: "checklist")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Sub-agent runtime fixtures. Seven verified fixture references for role schema, permission, dry-run queue, cancellation, approval, redaction, and planned ledger. No autonomous execution.")
    }

    private func subagentReviewLedgerDisclosure(snapshot: SeisAISubagentReviewLedgerSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Cadence: \(snapshot.cadence.reviewCadence) · Horizon: \(snapshot.cadence.horizonYears) years · Current: \(snapshot.cadence.currentHorizonQuarter) · Next: \(snapshot.cadence.nextReviewQuarter)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("\(snapshot.quarters.count) quarter records · \(snapshot.summary.documentedValidatedQuarterCount) validated · \(snapshot.summary.plannedQuarterCount) planned · write-gated enabled: \(snapshot.summary.writeGatedQuarterCountEnabled)")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("No external mutation, credential access, autonomous merge, or deploy evidence is recorded.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                ForEach(snapshot.quarters) { quarter in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: quarter.status == "documented-validated" ? "checkmark.circle" : quarter.humanApprovalNeeded ? "person.badge.key" : "clock")
                            .foregroundStyle(quarter.status == "documented-validated" ? .green : quarter.humanApprovalNeeded ? .orange : .secondary)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(quarter.id) · \(quarter.status)")
                                .font(.caption.weight(.semibold))
                            Text("Lanes: \(quarter.primaryLanes.joined(separator: ", "))")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text("Evidence: \(quarter.evidence.count) · Validator: \(quarter.validator)")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                }
            }
            .padding(.top, 8)
        } label: {
            Label("Sub-agent quarterly review ledger", systemImage: "calendar.badge.clock")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Sub-agent quarterly review ledger. Twenty quarter records across five years, two documented and validated, eighteen planned, with no external mutation or autonomous merge evidence.")
    }

    private func modelScalingCouncilDisclosure(snapshot: SeisModelScalingSubagentCouncilSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.agents.count) council agents · Runtime: \(snapshot.runtimeBoundary) · Route eligible today: \(snapshot.routeEligibleToday ? "yes" : "no")")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Credential requirement: \(snapshot.coreCredentialRequirement) · Default mode: \(snapshot.defaultRuntimeMode) · Stages: \(snapshot.stageAssignments.count)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text(snapshot.truthBoundary)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                ForEach(snapshot.stageAssignments) { stage in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: stage.routeEligibleToday ? "exclamationmark.triangle" : "lock.shield")
                            .foregroundStyle(stage.routeEligibleToday ? .red : .green)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(stage.stage) · \(stage.status)")
                                .font(.caption.weight(.semibold))
                            Text("Lead agents: \(stage.leadAgents.count) · Required before promotion: \(stage.requiredBeforePromotion.count)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                        }
                        Spacer(minLength: 0)
                    }
                }

                Text("Council agents")
                    .font(.caption.weight(.semibold))
                ForEach(snapshot.agents) { agent in
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(agent.displayName) · \(agent.lane) · \(agent.authority)")
                            .font(.caption.weight(.semibold))
                        Text("\(agent.primaryDuty) · Gate: \(agent.validationGate)")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                Text("All model stages remain plan-only and route-blocked. No model, dataset, benchmark, training, provider, SSH, cloud/GPU, checkpoint, or public-release action is executed.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Model scaling sub-agent council", systemImage: "person.3.sequence")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Model scaling sub-agent council. Twelve plan-only agents, five route-blocked stages, no credential requirement, and no model or provider execution.")
    }

    private func mcpRuntimeContractDisclosure(snapshot: SeisAICoreMCPRuntimeContractSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.transport) · \(snapshot.status) · \(snapshot.toolCount) tools · \(snapshot.resourceCount) resources · \(snapshot.promptCount) prompts")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Fallback: \(snapshot.fallbackRuntime) · Official SDK: optional · Smoke: \(snapshot.smokeTest)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text(snapshot.boundary)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                ForEach(snapshot.surfaces) { surface in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: "checkmark.shield")
                            .foregroundStyle(.green)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(surface.label) · \(surface.count)")
                                .font(.caption.weight(.semibold))
                            Text("\(surface.method) · \(surface.state)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text(surface.duty)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                }
                Text("Local MCP smoke only. No remote server, credentials, SSH, deployment, GitHub mutation, or unrestricted shell tool is invoked from this disclosure.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("MCP runtime contract", systemImage: "point.3.connected.trianglepath.dotted")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("MCP runtime contract. Local stdio JSON-RPC smoke-verified with 35 tools, 30 resources, 3 prompts, and four verified surfaces. No remote or credentialed execution.")
    }

    private func pluginIntegrationDisclosure(snapshot: SeisAgentPluginIntegrationSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("SEIS-Agent · \(snapshot.auditedSnapshot.installedEnabledCount) installed/enabled · \(snapshot.auditedSnapshot.notInstalledCount) not installed · authentication: \(snapshot.auditedSnapshot.authenticationClaim)")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("\(snapshot.personalPlugins.count) personal plugins · \(snapshot.lanes.count) specialist lanes · \(snapshot.helperPluginUniverse.uniquePlugins) helper plugins · \(snapshot.helperPluginUniverse.laneCount) helper lanes")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Activation: \(snapshot.activationPolicy.mode) · Blanket activation: no · Secret disclosure: no · External mutation: user confirmation")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                ForEach(snapshot.personalPlugins) { plugin in
                    HStack {
                        Image(systemName: "puzzlepiece.extension.fill")
                            .foregroundStyle(.green)
                        Text("\(plugin.embeddedAs) · \(plugin.status)")
                            .font(.caption)
                        Spacer(minLength: 0)
                    }
                }
                Text("Specialist lanes")
                    .font(.caption.weight(.semibold))
                ForEach(snapshot.lanes) { lane in
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(lane.displayName) · \(lane.mcpTools.joined(separator: ", "))")
                            .font(.caption.weight(.semibold))
                        Text("\(lane.role) · \(lane.defaultGate)")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                Text("Installed status and lane metadata do not claim connector authentication or activate tools. MCP, provider, SSH, deployment, and GitHub mutation remain separately gated.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Plugin integration manifest", systemImage: "puzzlepiece.extension")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Plugin integration manifest. 185 installed and enabled records, 5 not installed, 5 personal plugins, 10 specialist lanes, 300 helper plugins, and no connector authentication claim.")
    }

    private func providerRegistryDisclosure(snapshot: SeisAICoreProviderRegistrySnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.providers.count) providers · Core credential requirement: \(snapshot.coreCredentialRequirement) · Default: \(snapshot.defaultRoutingMode)")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Available: \(snapshot.providers.filter { $0.publicStatus == "Available" }.count) · Missing Key: \(snapshot.providers.filter { $0.publicStatus == "Missing Key" }.count) · Disabled: \(snapshot.providers.filter { $0.publicStatus == "Disabled" }.count)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Source-backed status only. No credential validation, network health check, provider call, or silent fallback is performed.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                ForEach(snapshot.providers) { provider in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: provider.publicStatus == "Available" ? "checkmark.shield" : provider.publicStatus == "Missing Key" ? "key.slash" : "pause.circle")
                            .foregroundStyle(provider.publicStatus == "Available" ? .green : provider.publicStatus == "Missing Key" ? .orange : .secondary)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(provider.displayName)
                                .font(.caption.weight(.semibold))
                            Text("\(provider.publicStatus) · \(provider.actualModel) · \(provider.privacyClass)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text("Routing eligible: \(provider.routingEligible ? "yes" : "no") · Backend-only: \(provider.backendOnly ? "yes" : "no") · Frontend secret: no")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                }
            }
            .padding(.top, 8)
        } label: {
            Label("Provider registry", systemImage: "server.rack")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Provider registry. Seven source-backed states, zero-key Local Demo, missing-key and disabled states distinct, backend-only credentials, and no frontend secrets.")
    }

    private func readOnlyRouterContractDisclosure(snapshot: SeisAIReadOnlyModelRouterContractSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Default: \(snapshot.defaultMode) · Runtime authority: \(snapshot.runtimeAuthority ? "enabled" : "blocked") · Provider calls: \(snapshot.providerCalls ? "enabled" : "blocked")")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Inputs allowed: \(snapshot.routerInputsAllowed.count) · Forbidden: \(snapshot.routerInputsForbidden.count) · Provider states: \(snapshot.providerStates.count) · Live evidence gates: \(snapshot.requiredEvidenceBeforeLiveRouting.count)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Decision integrity: redacted, named provider state, explicit provider/model, explicit fallback, blocked reasons, no private Obsidian routing.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                Text("Review artifact: \(snapshot.reviewArtifact.json) · \(snapshot.reviewArtifact.markdown)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Blocked model classes: \(snapshot.blockedModelClasses.joined(separator: ", "))")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                Text("This contract describes read-only decisions only. It does not execute a provider, validate credentials, route local-only content to cloud, or store prompt/private content.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Read-only model router contract", systemImage: "arrow.triangle.branch")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Read-only model router contract. Local Demo default, named provider states, explicit fallback, redacted decisions, blocked private content, and execution disabled.")
    }

    private func languageModelIntakeDisclosure(snapshot: SeisLanguageModelIntakeRegistrySnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.candidateModelFamilies.count) candidate families · \(snapshot.hardwareInstallLanes.count) hardware lanes · \(snapshot.trainingLanes.count) training lanes · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Bulk install: no · Download: no · Runtime authority: no · Training: no · Fine-tuning: no · Browser secrets: no")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text(snapshot.truthBoundary)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                Text("Preferred order: \(snapshot.knowledgeStrategy.preferredOrder.joined(separator: " → "))")
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                ForEach(snapshot.candidateModelFamilies) { family in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: "shippingbox")
                            .foregroundStyle(.secondary)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(family.displayName)
                                .font(.caption.weight(.semibold))
                            Text("\(family.allowedToday) · \(family.installState) · \(family.licenseReviewStatus)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text(family.representativeClasses.joined(separator: ", "))
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                }
                Text("No model is installed or trained by this registry. Any future model requires specific human approval, license/provenance, hardware, security, evaluation, rollback, and dataset gates.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Language model intake registry", systemImage: "shippingbox.and.arrow.down")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Language model intake registry. Eight candidate families, all metadata-only and not installed, with downloads, training, fine-tuning, runtime authority, and browser secrets disabled.")
    }

    private func languageModelTrainingCurriculumDisclosure(snapshot: SeisLanguageModelTrainingCurriculumSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.familyCandidates.count) families · \(snapshot.hardwareLanes.count) hardware lanes · \(snapshot.scalingTargets.count) scaling targets · \(snapshot.curriculum.count) phases · planning-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Hardware floor: \(snapshot.targetHardwareFloor)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Safe controls: \(snapshot.safeControls.joined(separator: " · "))")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                ForEach(snapshot.scalingTargets) { target in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: target.allowedRoute || target.runtimeAuthority ? "exclamationmark.triangle" : "lock.shield")
                            .foregroundStyle(target.allowedRoute || target.runtimeAuthority ? .red : .green)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(target.id) · \(target.status)")
                                .font(.caption.weight(.semibold))
                            Text("Route: \(target.allowedRoute ? "yes" : "no") · Runtime: \(target.runtimeAuthority ? "yes" : "no") · Training: \(target.trainingStatus)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text(target.gate)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                }

                Text("Approval before any install or training: \(snapshot.nextApprovalNeeded.joined(separator: " · "))")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Text("Planning-only curriculum. No model install, checkpoint download, provider call, dataset download, inference, benchmark, fine-tune, adapter training, or foundation pretraining is executed by this record.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Language model training curriculum", systemImage: "graduationcap")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Language model training curriculum. Eight families, three hardware lanes, four scaling targets, and four planning phases. Installs, downloads, provider calls, training, inference, benchmarks, and foundation-model claims are disabled.")
    }

    private func publicReadinessProgramDisclosure(snapshot: SeisAIPublicReadinessProgramSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Local Demo: \(snapshot.publicReadyForLocalDemo ? "review-ready" : "blocked") · GitHub-wide: \(snapshot.githubReadyForEveryone ? "ready" : "not ready") · AGI: \(snapshot.publicReadyAsAgi ? "claimed" : "blocked")")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isLocalDemoOnly ? .secondary : .red)
                Text("Route today: \(snapshot.routeEligibleToday ? "yes" : "no") · Runtime authority: \(snapshot.runtimeAuthority ? "yes" : "no") · Training: \(snapshot.trainingStatus) · Weights: \(snapshot.weightsAvailable ? "available" : "unavailable") · Inference: \(snapshot.inferenceAvailable ? "available" : "unavailable")")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("\(snapshot.readinessGates.count) readiness gates · \(snapshot.githubAudienceModes.count) audience modes · \(snapshot.requiredBeforeAnyAgiClaim.count) AGI prerequisites · \(snapshot.forbiddenClaims.count) forbidden claims")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                ForEach(snapshot.readinessGates) { gate in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: gate.status == "available" ? "checkmark.shield" : "lock.shield")
                            .foregroundStyle(gate.status == "available" ? .green : .orange)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(gate.id) · \(gate.status)")
                                .font(.caption.weight(.semibold))
                            Text("GitHub-wide blocked: \(gate.blocksGithubReadyForEveryone ? "yes" : "no") · AGI blocked: \(gate.blocksAgiClaim ? "yes" : "no")")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text(gate.evidence.joined(separator: " · "))
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                }

                Text("Council: \(snapshot.subAgentCouncilUse.status) · allowed: \(snapshot.subAgentCouncilUse.allowedActions.joined(separator: ", "))")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Text(snapshot.truthBoundary)
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Public readiness program", systemImage: "checkmark.seal")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Public readiness program. Local Demo is review-ready without provider keys; GitHub-wide readiness and AGI claims remain blocked, with six readiness gates and explicit approval prerequisites.")
    }

    private func commandCenterOperationsReadinessDisclosure(snapshot: SeisCommandCenterOperationsReadinessSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.decisionState) · \(snapshot.summaryCards.count) summary cards · \(snapshot.checks.count) checks")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isReviewBeforeRelease ? .secondary : .red)
                Text("Required areas: \(snapshot.requiredReadinessAreas.joined(separator: " · "))")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                ForEach(snapshot.summaryCards) { card in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: card.status == "Ready" ? "checkmark.circle" : "eye")
                            .foregroundStyle(card.status == "Ready" ? .green : .orange)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(card.area) · \(card.status)")
                                .font(.caption.weight(.semibold))
                            Text(card.evidence)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                }
                ForEach(snapshot.checks) { check in
                    Text("\(check.name) · \(check.status) · \(check.owner) · \(check.gate)")
                        .font(.caption2.monospaced())
                        .foregroundStyle(.secondary)
                }
                Text(snapshot.completionRule)
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Command Center operations readiness", systemImage: "checklist")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Command Center operations readiness. Review-before-release status across release, CI, security, rollback, and handoff; release-ready requires external evidence and rollback proof.")
    }

    private func orchestrationDisclosure(snapshot: SeisAGIAgentHandoffSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(snapshot.statusLabel)
                        .font(.caption.monospaced())
                        .foregroundStyle(snapshot.isReady ? .green : .orange)
                    Spacer(minLength: 8)
                    Text(snapshot.writerStatusLabel)
                        .font(.caption2.monospaced())
                        .foregroundStyle(.secondary)
                }
                Text("Plugin lanes: \(snapshot.pluginLaneSummary)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                Text("Governance: one writer, separated reviewer, researcher, and designer roles; all handoffs require human approval.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                ForEach(snapshot.records) { record in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: record.writeAllowed ? "pencil.circle" : "checkmark.shield")
                            .foregroundStyle(record.writeAllowed ? .orange : .green)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(record.role.rawValue) · \(record.assignmentId)")
                                .font(.caption.weight(.semibold))
                            Text("\(record.pluginLaneId) · \(record.outputArtifact) · \(record.status.rawValue)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text("Write: \(record.writeAllowed ? "yes" : "no") · Approval: \(record.requiresHumanApproval ? "required" : "missing")")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(8)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                }

                Text("Handoff plan only. No agent was activated, no file was written, and no provider, MCP, SSH, deployment, or GitHub action was executed.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Sub-agent orchestration and handoffs", systemImage: "arrow.triangle.branch")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Sub-agent orchestration and handoffs. \(snapshot.statusLabel). One writer and separate reviewer, researcher, and designer roles. Human approval required; no execution performed.")
    }

    private func promptCatalogDisclosure(engine: SeisAIPromptEngine) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Version: \(engine.version) · \(engine.templates.count) templates")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                Text("System, task, review, coding, documentation, security, SSH review, and clean-room prompts are versioned and secret-rejecting.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                ForEach(engine.templates) { template in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: "text.book.closed")
                            .foregroundStyle(.tint)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(template.title) · \(template.kind.rawValue)")
                                .font(.caption.weight(.semibold))
                            Text("\(template.id) · \(template.version)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text(template.safetyBoundary)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(8)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                }

                Text("Rendered prompts are ephemeral and are not written to the evidence ledger, local session state, or repository.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Versioned prompt engine", systemImage: "text.book.closed.fill")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Versioned prompt engine. Eight typed prompt categories, secret rejection, and ephemeral rendering only.")
    }

    private func readinessDisclosure(report: SeisAICoreReadinessReport) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text(report.statusLabel)
                    .font(.caption.monospaced())
                    .foregroundStyle(report.isReadyLocalDemo ? .green : .orange)
                Text(report.truthBoundary)
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                ForEach(report.checks) { check in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: check.passed ? "checkmark.circle.fill" : "xmark.octagon.fill")
                            .foregroundStyle(check.passed ? .green : .orange)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(check.title)
                                .font(.caption.weight(.semibold))
                            Text(check.evidence)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(8)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                }
            }
            .padding(.top, 8)
        } label: {
            Label("AI Core local readiness evaluation", systemImage: "checkmark.shield.fill")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("AI Core local readiness evaluation. \(report.statusLabel). This is Local Demo readiness only, not production or live-provider readiness.")
    }

    private var routeInspector: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Model router inspector", systemImage: "arrow.triangle.swap")
                .font(.subheadline.weight(.semibold))

            Text("Evaluate a typed request against the registered Local Demo provider. This does not execute a provider, read credentials, or perform network work.")
                .font(.caption2)
                .foregroundStyle(.secondary)

            TextField("Task type", text: $routeTaskType)
                .textFieldStyle(.roundedBorder)
            TextField("Capability", text: $routeCapability)
                .textFieldStyle(.roundedBorder)

            HStack(alignment: .top, spacing: 8) {
                Picker("Privacy", selection: $routePrivacyMode) {
                    ForEach(SeisAIPrivacyMode.allCases, id: \.rawValue) { mode in
                        Text(mode.rawValue).tag(mode)
                    }
                }
                .pickerStyle(.menu)

                Picker("Content", selection: $routeContentClassification) {
                    ForEach(SeisAIContentClassification.allCases, id: \.rawValue) { classification in
                        Text(classification.rawValue).tag(classification)
                    }
                }
                .pickerStyle(.menu)

                Toggle("Local only", isOn: $routeLocalOnly)
                    .toggleStyle(.switch)
            }

            HStack(alignment: .top, spacing: 8) {
                Picker("Cost", selection: $routeMaximumCostTier) {
                    ForEach(SeisAICostTier.allCases, id: \.rawValue) { tier in
                        Text(tier.rawValue).tag(tier)
                    }
                }
                .pickerStyle(.menu)

                Picker("Latency", selection: $routePreferredLatencyTier) {
                    ForEach(SeisAILatencyTier.allCases, id: \.rawValue) { tier in
                        Text(tier.rawValue).tag(tier)
                    }
                }
                .pickerStyle(.menu)

                Picker("Fallback", selection: $routeFallbackPolicy) {
                    ForEach(SeisAIFallbackPolicy.allCases, id: \.rawValue) { policy in
                        Text(policy.rawValue).tag(policy)
                    }
                }
                .pickerStyle(.menu)
            }

            Toggle("Require tools", isOn: $routeRequiresTools)
                .toggleStyle(.switch)

            HStack {
                Button {
                    model.inspectRoute(
                        taskType: routeTaskType,
                        capability: routeCapability,
                        privacyMode: routePrivacyMode,
                        contentClassification: routeContentClassification,
                        localOnly: routeLocalOnly,
                        requiresTools: routeRequiresTools,
                        maximumCostTier: routeMaximumCostTier,
                        preferredLatencyTier: routePreferredLatencyTier,
                        fallbackPolicy: routeFallbackPolicy
                    )
                } label: {
                    Label("Inspect route", systemImage: "arrow.triangle.swap")
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.small)
                .disabled(model.isRouting || model.isPlanning)

                if model.isRouting {
                    ProgressView()
                        .controlSize(.small)
                }
            }

            if let decision = model.routeDecision {
                routeDecisionView(decision)
            }
        }
        .padding(10)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Model router inspector. It evaluates typed local routing policy without executing providers or network calls.")
    }

    private func routeDecisionView(_ decision: SeisAIRouteDecision) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack(alignment: .firstTextBaseline) {
                Text(decision.outcome.rawValue)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(routeOutcomeColor(decision.outcome))
                Spacer(minLength: 8)
                Text(decision.isFailClosed ? "fail-closed" : "review")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
            }

            Text(decision.selectedProviderID.map { "Provider: \($0)" } ?? "Provider: none")
                .font(.caption2.monospaced())
            Text(decision.selectedModelIdentifier.map { "Model: \($0)" } ?? "Model: none")
                .font(.caption2.monospaced())
            Text("Basis: \(decision.selectionBasis)")
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text("Eligible: \(decision.routeEligible ? "yes" : "no") · Approval: \(decision.requiresHumanApproval ? "required" : "not required") · Fallback: \(decision.fallbackUsed ? "explicit" : "none")")
                .font(.caption2)
                .foregroundStyle(.tertiary)

            if !decision.blockedReasons.isEmpty {
                Text(decision.blockedReasons.joined(separator: " "))
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }

            ForEach(decision.providerRejections) { rejection in
                if !rejection.reasons.isEmpty {
                    Text("\(rejection.providerID): \(rejection.reasons.joined(separator: "; "))")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
            }

            Text("Inspection only. Execution: no · Provider call: no · Network: no · Credentials: no")
                .font(.caption2)
                .foregroundStyle(.orange)
        }
        .padding(8)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
    }

    private func routeOutcomeColor(_ outcome: SeisAIRouteOutcome) -> Color {
        switch outcome {
        case .localDemoReady:
            .green
        case .approvalRequired:
            .orange
        case .blocked:
            .red
        }
    }

    private func providerStatusColor(_ status: SeisAICoreProviderState) -> Color {
        switch status {
        case .available:
            .green
        case .missingKey, .disabled, .rateLimited, .error:
            .orange
        }
    }

    private var taskPlanner: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Local task planner", systemImage: "text.badge.checkmark")
                .font(.subheadline.weight(.semibold))
            TextField("Task purpose", text: $taskPurpose)
                .textFieldStyle(.roundedBorder)
                .onSubmit { model.planArchitectTask(purpose: taskPurpose) }
            HStack {
                Text("Purpose is sent only to the local plan runtime and is not persisted in evidence.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Spacer(minLength: 8)
                Button {
                    model.planArchitectTask(purpose: taskPurpose)
                } label: {
                    Label("Plan", systemImage: "list.clipboard")
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.small)
                .disabled(model.isPlanning)
            }
        }
        .padding(10)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Local task planner. Purpose is sent only to the local plan runtime and is not persisted in evidence.")
    }

    private func metric(_ title: String, value: String, image: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: image)
                .foregroundStyle(.secondary)
            VStack(alignment: .leading, spacing: 1) {
                Text(value)
                    .font(.subheadline.weight(.semibold))
                Text(title)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
        }
        .padding(9)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
    }

    private func laneList(snapshot: SeisAICoreRuntimeSnapshotContract) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                Text("Personal Lane Plans")
                    .font(.subheadline.weight(.semibold))
                Spacer(minLength: 8)
                Button {
                    model.planAllLanes(snapshot.pluginMesh.personalLanes)
                } label: {
                    Label("Plan all", systemImage: "rectangle.stack.badge.play")
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.small)
                .disabled(model.isPlanning || model.isBulkLanePlanning)
            }

            if let bulkLanePlanStatus = model.bulkLanePlanStatus {
                Text(bulkLanePlanStatus)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            ForEach(snapshot.pluginMesh.personalLanes) { lane in
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: laneSymbol(for: lane.id))
                        .foregroundStyle(.tint)
                        .frame(width: 20)

                    VStack(alignment: .leading, spacing: 3) {
                        Text(lane.displayName)
                            .font(.subheadline.weight(.semibold))
                        Text(lane.role)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                        Text("Declared MCP: \(lane.mcpTools.joined(separator: ", "))")
                            .font(.caption2.monospaced())
                            .foregroundStyle(.tertiary)
                        Text("Gate: \(lane.qualityGate)")
                            .font(.caption2.monospaced())
                            .foregroundStyle(.tertiary)
                    }

                    Spacer(minLength: 8)

                    Button {
                        model.plan(for: lane)
                    } label: {
                        Label("Plan", systemImage: "list.clipboard")
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                    .disabled(model.isPlanning)
                }
                .padding(10)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
            }
        }
    }

    private func agentList(snapshot: SeisAICoreRuntimeSnapshotContract) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                Text("Managed Agent Plans")
                    .font(.subheadline.weight(.semibold))
                Spacer(minLength: 8)
                Button {
                    model.planAllAgents(snapshot.agentRegistry.agents)
                } label: {
                    Label("Plan all", systemImage: "rectangle.stack.badge.play")
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.small)
                .disabled(model.isPlanning || model.isBulkPlanning)
            }

            if let bulkAgentPlanStatus = model.bulkAgentPlanStatus {
                Text(bulkAgentPlanStatus)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            ForEach(snapshot.agentRegistry.agents) { agent in
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: agent.executionAuthority ? "person.badge.key" : "person.badge.clock")
                        .foregroundStyle(agent.executionAuthority ? .orange : .tint)
                        .frame(width: 20)

                    VStack(alignment: .leading, spacing: 3) {
                        Text(agent.displayName)
                            .font(.subheadline.weight(.semibold))
                        Text(agent.duty)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                        Text("Status: \(agent.status) · Runtime authority: \(agent.executionAuthority ? "yes" : "no")")
                            .font(.caption2.monospaced())
                            .foregroundStyle(.tertiary)
                    }

                    Spacer(minLength: 8)

                    Button {
                        model.planAgent(agent)
                    } label: {
                        Label("Plan", systemImage: "list.clipboard")
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                    .disabled(model.isPlanning)
                }
                .padding(10)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
            }
        }
    }

    private func planResult(_ plan: SeisAIPersonalLaneTaskPlan) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack {
                Label(
                    plan.outcome == .planned ? "Read-only plan ready" : "Plan blocked",
                    systemImage: plan.outcome == .planned ? "checkmark.circle.fill" : "xmark.octagon.fill"
                )
                .foregroundStyle(plan.outcome == .planned ? .green : .orange)
                .font(.subheadline.weight(.semibold))
                Spacer()
                Text(plan.laneID)
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
            }

            Text("Actions: \(plan.plannedActions.map(\.rawValue).joined(separator: ", "))")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)
            Text("MCP invocation performed: no")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)

            if !plan.acceptedInputReferences.isEmpty {
                Text("Inputs: \(plan.acceptedInputReferences.joined(separator: ", "))")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
            }

            if let qualityGate = plan.qualityGate {
                Text("Quality gate: \(qualityGate)")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
            }

            if !plan.blockedReasons.isEmpty {
                Text(plan.blockedReasons.joined(separator: " "))
                    .font(.caption)
                    .foregroundStyle(.orange)
            }
        }
        .padding(10)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Personal lane plan \(plan.outcome.rawValue) for \(plan.laneID). MCP invocation was not performed.")
    }

    private func agentPlanResult(_ plan: SeisAIAgentTaskPlan) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack {
                Label(
                    plan.outcome == .planned ? "Agent plan ready" : "Agent plan blocked",
                    systemImage: plan.outcome == .planned ? "checkmark.circle.fill" : "xmark.octagon.fill"
                )
                .foregroundStyle(plan.outcome == .planned ? .green : .orange)
                .font(.subheadline.weight(.semibold))
                Spacer()
                Text(plan.agentID)
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
            }

            Text("Actions: \(plan.plannedActions.map(\.rawValue).joined(separator: ", "))")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)
            Text("Plan-only: yes · Runtime authority: no · Provider/MCP execution: no")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)
            Text("Governance: ≤\(plan.governanceBudget.maximumSteps) steps · depth ≤\(plan.governanceBudget.maximumDelegationDepth) · timeout \(plan.governanceBudget.timeoutMinutes)m · cost \(plan.governanceBudget.maximumCostTier.rawValue) · background: no")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)
            Text("Required approvals: \(plan.requiredApprovals.count)")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)

            if !plan.blockedReasons.isEmpty {
                Text(plan.blockedReasons.joined(separator: " "))
                    .font(.caption)
                    .foregroundStyle(.orange)
            }
        }
        .padding(10)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Agent plan \(plan.outcome.rawValue) for \(plan.agentID). Plan-only and no runtime authority.")
    }

    private var evidenceLedger: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Execution evidence", systemImage: "list.bullet.rectangle.portrait")
                .font(.subheadline.weight(.semibold))

            Text("Persistence: \(model.evidencePersistenceState.displayLabel)")
                .font(.caption2.monospaced())
                .foregroundStyle(model.evidencePersistenceState.isPersistent ? .secondary : .orange)

            ForEach(model.evidence.reversed()) { entry in
                HStack(alignment: .top, spacing: 8) {
                    Image(systemName: entry.outcome == .blocked ? "xmark.octagon" : "checkmark.shield")
                        .foregroundStyle(entry.outcome == .blocked ? .orange : .green)
                        .frame(width: 18)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("#\(entry.sequence) \(entry.kind.rawValue)")
                            .font(.caption.weight(.semibold).monospaced())
                        Text("\(entry.outcome.rawValue) · \(entry.subjectID)")
                            .font(.caption2.monospaced())
                            .foregroundStyle(.secondary)
                        Text("Read-only: \(entry.isReadOnly ? "yes" : "no") · Local-only: \(entry.localOnly ? "yes" : "no") · Blocked reasons: \(entry.blockedReasonCount)")
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }

                    Spacer(minLength: 0)
                }
                .padding(9)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                .accessibilityElement(children: .combine)
                .accessibilityLabel("Evidence \(entry.sequence), \(entry.kind.rawValue), \(entry.outcome.rawValue), subject \(entry.subjectID), read-only \(entry.isReadOnly ? "yes" : "no"), local-only \(entry.localOnly ? "yes" : "no"), blocked reasons \(entry.blockedReasonCount).")
            }
        }
    }

    private func laneSymbol(for laneID: String) -> String {
        switch laneID {
        case "seis":
            "sparkles"
        case "seis-cloud":
            "cloud"
        case "seis-code":
            "chevron.left.forwardslash.chevron.right"
        case "seis-design":
            "paintpalette"
        case "seis-data":
            "cylinder"
        default:
            "square.stack.3d.up"
        }
    }
}
