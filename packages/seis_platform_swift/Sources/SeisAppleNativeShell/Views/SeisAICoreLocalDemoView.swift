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
    @Published private(set) var agiIndependentEvidenceLedgerSnapshot: SeisAGIIndependentEvidenceLedgerSnapshot?
    @Published private(set) var agiGitHubUserReadinessGatesSnapshot: SeisAGIGitHubUserReadinessGatesSnapshot?
    @Published private(set) var agiPublicReadinessEvidenceSnapshot: SeisAGIPublicReadinessEvidenceSnapshot?
    @Published private(set) var commandCenterKnowledgeSystemSnapshot: SeisCommandCenterKnowledgeSystemSnapshot?
    @Published private(set) var dataSchemaRegistrySnapshot: SeisDataSchemaRegistrySnapshot?
    @Published private(set) var designComponentInventorySnapshot: SeisDesignComponentInventorySnapshot?
    @Published private(set) var universalCapabilityKernelSnapshot: SeisUniversalCapabilityKernelSnapshot?
    @Published private(set) var actionDecisionContractSnapshot: SeisActionDecisionContractSnapshot?
    @Published private(set) var actionExecutionContractSnapshot: SeisActionExecutionContractSnapshot?
    @Published private(set) var agentRoleSchemaSnapshot: SeisAgentRoleSchemaSnapshot?
    @Published private(set) var agentPermissionMatrixSnapshot: SeisAgentPermissionMatrixSnapshot?
    @Published private(set) var activeMissionBoardSnapshot: SeisActiveMissionBoardSnapshot?
    @Published private(set) var longHorizonMissionKernelSnapshot: SeisLongHorizonMissionKernelSnapshot?
    @Published private(set) var agiEvaluationProtocolSnapshot: SeisAGIEvaluationProtocolSnapshot?
    @Published private(set) var fullStackContractSnapshot: SeisFullStackContractSnapshot?
    @Published private(set) var agentLaneStatusSnapshot: SeisAgentLaneStatusSnapshot?
    @Published private(set) var secondBrainContractSnapshot: SeisSecondBrainContractSnapshot?
    @Published private(set) var platformLanguagePolicySnapshot: SeisPlatformLanguagePolicySnapshot?
    @Published private(set) var requestedSoftwareStackSnapshot: SeisRequestedSoftwareStackSnapshot?
    @Published private(set) var technologyStackSnapshot: SeisTechnologyStackSnapshot?
    @Published private(set) var platformDevelopmentTracksSnapshot: SeisPlatformDevelopmentTracksSnapshot?
    @Published private(set) var obsidianSafeImportSnapshot: SeisObsidianSafeImportSnapshot?
    @Published private(set) var readOnlyRouterRuntimeSnapshot: SeisReadOnlyRouterRuntimeSnapshot?
    @Published private(set) var modelFrontierEscalationPolicySnapshot: SeisModelFrontierEscalationPolicySnapshot?
    @Published private(set) var agiSystemSourceSnapshot: SeisAGISystemSourceSnapshot?
    @Published private(set) var projectIntakeSnapshot: SeisProjectIntakeSnapshot?
    @Published private(set) var connectorCapabilityRegistrySnapshot: SeisConnectorCapabilityRegistrySnapshot?
    @Published private(set) var installedCapabilityInventorySnapshot: SeisAIInstalledCapabilityInventorySnapshot?
    @Published private(set) var goalCommandCenterViewSnapshot: SeisGoalCommandCenterViewSnapshot?
    @Published private(set) var focusModeLearningContractSnapshot: SeisFocusModeLearningContractSnapshot?
    @Published private(set) var pluginInterfaceRoadmapSnapshot: SeisPluginInterfaceRoadmapSnapshot?
    @Published private(set) var capabilityMesh: SeisAICapabilityMesh?
    @Published private(set) var orchestrationSnapshot = SeisAGIAgentHandoffSnapshot.current()
    @Published private(set) var readinessReport: SeisAICoreReadinessReport?
    @Published private(set) var statusMessage = "AI Core snapshot has not been loaded."
    @Published private(set) var lastPlan: SeisAIPersonalLaneTaskPlan?
    @Published private(set) var lastAgentPlan: SeisAIAgentTaskPlan?
    @Published private(set) var bulkLanePlanStatus: String?
    @Published private(set) var bulkAgentPlanStatus: String?
    @Published private(set) var routeDecision: SeisAIRouteDecision?
    @Published private(set) var localLoopbackReadiness: SeisAILocalLoopbackReadiness?
    @Published var localLoopbackModelIdentifier = "ollama-local"
    @Published private(set) var evidence: [SeisAIExecutionEvidence] = []
    @Published private(set) var evidencePersistenceState: SeisAIExecutionEvidencePersistenceState = .memoryOnly
    @Published private(set) var isPlanning = false
    @Published private(set) var isBulkLanePlanning = false
    @Published private(set) var isBulkPlanning = false
    @Published private(set) var isRouting = false
    @Published private(set) var isCheckingLocalLoopback = false

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
        agiIndependentEvidenceLedgerSnapshot = try? SeisAGIIndependentEvidenceLedgerSnapshot.validated(
            from: Data(contentsOf: agiIndependentEvidenceLedgerURL)
        )
        agiGitHubUserReadinessGatesSnapshot = try? SeisAGIGitHubUserReadinessGatesSnapshot.validated(
            from: Data(contentsOf: agiGitHubUserReadinessGatesURL)
        )
        agiPublicReadinessEvidenceSnapshot = try? SeisAGIPublicReadinessEvidenceSnapshot.validated(
            from: Data(contentsOf: agiPublicReadinessEvidenceURL)
        )
        commandCenterKnowledgeSystemSnapshot = try? SeisCommandCenterKnowledgeSystemSnapshot.validated(
            from: Data(contentsOf: commandCenterKnowledgeSystemURL)
        )
        dataSchemaRegistrySnapshot = try? SeisDataSchemaRegistrySnapshot.validated(
            from: Data(contentsOf: dataSchemaRegistryURL)
        )
        designComponentInventorySnapshot = try? SeisDesignComponentInventorySnapshot.validated(
            from: Data(contentsOf: designComponentInventoryURL)
        )
        universalCapabilityKernelSnapshot = try? SeisUniversalCapabilityKernelSnapshot.validated(
            from: Data(contentsOf: universalCapabilityKernelURL)
        )
        actionDecisionContractSnapshot = try? SeisActionDecisionContractSnapshot.validated(
            from: Data(contentsOf: actionDecisionContractURL)
        )
        actionExecutionContractSnapshot = try? SeisActionExecutionContractSnapshot.validated(
            from: Data(contentsOf: actionExecutionContractURL)
        )
        agentRoleSchemaSnapshot = try? SeisAgentRoleSchemaSnapshot.validated(
            from: Data(contentsOf: agentRoleSchemaURL)
        )
        agentPermissionMatrixSnapshot = try? SeisAgentPermissionMatrixSnapshot.validated(
            from: Data(contentsOf: agentPermissionMatrixURL)
        )
        activeMissionBoardSnapshot = try? SeisActiveMissionBoardSnapshot.validated(
            from: Data(contentsOf: activeMissionBoardURL)
        )
        longHorizonMissionKernelSnapshot = try? SeisLongHorizonMissionKernelSnapshot.validated(
            from: Data(contentsOf: longHorizonMissionKernelURL)
        )
        agiEvaluationProtocolSnapshot = try? SeisAGIEvaluationProtocolSnapshot.validated(
            from: Data(contentsOf: agiEvaluationProtocolURL)
        )
        fullStackContractSnapshot = try? SeisFullStackContractSnapshot.validated(
            from: Data(contentsOf: fullStackContractURL)
        )
        agentLaneStatusSnapshot = try? SeisAgentLaneStatusSnapshot.validated(
            from: Data(contentsOf: agentLaneStatusURL)
        )
        secondBrainContractSnapshot = try? SeisSecondBrainContractSnapshot.validated(
            from: Data(contentsOf: secondBrainContractURL)
        )
        platformLanguagePolicySnapshot = try? SeisPlatformLanguagePolicySnapshot.validated(
            from: Data(contentsOf: platformLanguagePolicyURL)
        )
        technologyStackSnapshot = try? SeisTechnologyStackSnapshot.validated(
            from: Data(contentsOf: technologyStackURL)
        )
        requestedSoftwareStackSnapshot = try? SeisRequestedSoftwareStackSnapshot.validated(
            from: Data(contentsOf: requestedSoftwareStackURL)
        )
        platformDevelopmentTracksSnapshot = try? SeisPlatformDevelopmentTracksSnapshot.validated(
            from: Data(contentsOf: platformDevelopmentTracksURL)
        )
        obsidianSafeImportSnapshot = try? SeisObsidianSafeImportSnapshot.validated(
            from: Data(contentsOf: obsidianSafeImportURL)
        )
        readOnlyRouterRuntimeSnapshot = try? SeisReadOnlyRouterRuntimeSnapshot.validated(
            from: Data(contentsOf: readOnlyRouterRuntimeURL)
        )
        modelFrontierEscalationPolicySnapshot = try? SeisModelFrontierEscalationPolicySnapshot.validated(
            from: Data(contentsOf: modelFrontierEscalationPolicyURL)
        )
        agiSystemSourceSnapshot = try? SeisAGISystemSourceSnapshot.validated(
            from: Data(contentsOf: agiSystemSourceURL)
        )
        projectIntakeSnapshot = try? SeisProjectIntakeSnapshot.validated(
            from: Data(contentsOf: projectIntakeURL)
        )
        connectorCapabilityRegistrySnapshot = try? SeisConnectorCapabilityRegistrySnapshot.validated(
            from: Data(contentsOf: connectorCapabilityRegistryURL)
        )
        installedCapabilityInventorySnapshot = try? SeisAIInstalledCapabilityInventorySnapshot.validated(
            bigTechData: Data(contentsOf: bigTechCapabilityInventoryURL),
            nvidiaData: Data(contentsOf: nvidiaCapabilityInventoryURL)
        )
        goalCommandCenterViewSnapshot = try? SeisGoalCommandCenterViewSnapshot.validated(
            from: Data(contentsOf: goalCommandCenterViewURL)
        )
        focusModeLearningContractSnapshot = try? SeisFocusModeLearningContractSnapshot.validated(
            from: Data(contentsOf: focusModeLearningContractURL)
        )
        pluginInterfaceRoadmapSnapshot = try? SeisPluginInterfaceRoadmapSnapshot.validated(
            from: Data(contentsOf: pluginInterfaceRoadmapURL)
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
                installedCapabilityInventorySnapshot: installedCapabilityInventorySnapshot,
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
                commandCenterOperationsReadinessSnapshot: commandCenterOperationsReadinessSnapshot,
                agiIndependentEvidenceLedgerSnapshot: agiIndependentEvidenceLedgerSnapshot,
                agiGitHubUserReadinessGatesSnapshot: agiGitHubUserReadinessGatesSnapshot,
                agiPublicReadinessEvidenceSnapshot: agiPublicReadinessEvidenceSnapshot,
                commandCenterKnowledgeSystemSnapshot: commandCenterKnowledgeSystemSnapshot,
                dataSchemaRegistrySnapshot: dataSchemaRegistrySnapshot,
                designComponentInventorySnapshot: designComponentInventorySnapshot,
                universalCapabilityKernelSnapshot: universalCapabilityKernelSnapshot,
                actionDecisionContractSnapshot: actionDecisionContractSnapshot,
                actionExecutionContractSnapshot: actionExecutionContractSnapshot,
                agentRoleSchemaSnapshot: agentRoleSchemaSnapshot,
                agentPermissionMatrixSnapshot: agentPermissionMatrixSnapshot,
                activeMissionBoardSnapshot: activeMissionBoardSnapshot,
                longHorizonMissionKernelSnapshot: longHorizonMissionKernelSnapshot,
                agiEvaluationProtocolSnapshot: agiEvaluationProtocolSnapshot,
                fullStackContractSnapshot: fullStackContractSnapshot,
                agentLaneStatusSnapshot: agentLaneStatusSnapshot,
                secondBrainContractSnapshot: secondBrainContractSnapshot,
                platformLanguagePolicySnapshot: platformLanguagePolicySnapshot,
                technologyStackSnapshot: technologyStackSnapshot,
                platformDevelopmentTracksSnapshot: platformDevelopmentTracksSnapshot,
                requestedSoftwareStackSnapshot: requestedSoftwareStackSnapshot,
                obsidianSafeImportSnapshot: obsidianSafeImportSnapshot,
                readOnlyRouterRuntimeSnapshot: readOnlyRouterRuntimeSnapshot,
                modelFrontierEscalationPolicySnapshot: modelFrontierEscalationPolicySnapshot,
                agiSystemSourceSnapshot: agiSystemSourceSnapshot,
                projectIntakeSnapshot: projectIntakeSnapshot,
                connectorCapabilityRegistrySnapshot: connectorCapabilityRegistrySnapshot,
                goalCommandCenterViewSnapshot: goalCommandCenterViewSnapshot,
                focusModeLearningContractSnapshot: focusModeLearningContractSnapshot,
                pluginInterfaceRoadmapSnapshot: pluginInterfaceRoadmapSnapshot
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
            agiIndependentEvidenceLedgerSnapshot = try? SeisAGIIndependentEvidenceLedgerSnapshot.validated(
                from: Data(contentsOf: agiIndependentEvidenceLedgerURL)
            )
            agiGitHubUserReadinessGatesSnapshot = try? SeisAGIGitHubUserReadinessGatesSnapshot.validated(
                from: Data(contentsOf: agiGitHubUserReadinessGatesURL)
            )
            agiPublicReadinessEvidenceSnapshot = try? SeisAGIPublicReadinessEvidenceSnapshot.validated(
                from: Data(contentsOf: agiPublicReadinessEvidenceURL)
            )
            commandCenterKnowledgeSystemSnapshot = try? SeisCommandCenterKnowledgeSystemSnapshot.validated(
                from: Data(contentsOf: commandCenterKnowledgeSystemURL)
            )
            dataSchemaRegistrySnapshot = try? SeisDataSchemaRegistrySnapshot.validated(
                from: Data(contentsOf: dataSchemaRegistryURL)
            )
            designComponentInventorySnapshot = try? SeisDesignComponentInventorySnapshot.validated(
                from: Data(contentsOf: designComponentInventoryURL)
            )
            universalCapabilityKernelSnapshot = try? SeisUniversalCapabilityKernelSnapshot.validated(
                from: Data(contentsOf: universalCapabilityKernelURL)
            )
            actionDecisionContractSnapshot = try? SeisActionDecisionContractSnapshot.validated(
                from: Data(contentsOf: actionDecisionContractURL)
            )
            actionExecutionContractSnapshot = try? SeisActionExecutionContractSnapshot.validated(
                from: Data(contentsOf: actionExecutionContractURL)
            )
            agentRoleSchemaSnapshot = try? SeisAgentRoleSchemaSnapshot.validated(
                from: Data(contentsOf: agentRoleSchemaURL)
            )
            agentPermissionMatrixSnapshot = try? SeisAgentPermissionMatrixSnapshot.validated(
                from: Data(contentsOf: agentPermissionMatrixURL)
            )
            activeMissionBoardSnapshot = try? SeisActiveMissionBoardSnapshot.validated(
                from: Data(contentsOf: activeMissionBoardURL)
            )
            longHorizonMissionKernelSnapshot = try? SeisLongHorizonMissionKernelSnapshot.validated(
                from: Data(contentsOf: longHorizonMissionKernelURL)
            )
            agiEvaluationProtocolSnapshot = try? SeisAGIEvaluationProtocolSnapshot.validated(
                from: Data(contentsOf: agiEvaluationProtocolURL)
            )
            fullStackContractSnapshot = try? SeisFullStackContractSnapshot.validated(
                from: Data(contentsOf: fullStackContractURL)
            )
            agentLaneStatusSnapshot = try? SeisAgentLaneStatusSnapshot.validated(
                from: Data(contentsOf: agentLaneStatusURL)
            )
            secondBrainContractSnapshot = try? SeisSecondBrainContractSnapshot.validated(
                from: Data(contentsOf: secondBrainContractURL)
            )
            platformLanguagePolicySnapshot = try? SeisPlatformLanguagePolicySnapshot.validated(
                from: Data(contentsOf: platformLanguagePolicyURL)
            )
            technologyStackSnapshot = try? SeisTechnologyStackSnapshot.validated(
                from: Data(contentsOf: technologyStackURL)
            )
            requestedSoftwareStackSnapshot = try? SeisRequestedSoftwareStackSnapshot.validated(
                from: Data(contentsOf: requestedSoftwareStackURL)
            )
            platformDevelopmentTracksSnapshot = try? SeisPlatformDevelopmentTracksSnapshot.validated(
                from: Data(contentsOf: platformDevelopmentTracksURL)
            )
            obsidianSafeImportSnapshot = try? SeisObsidianSafeImportSnapshot.validated(
                from: Data(contentsOf: obsidianSafeImportURL)
            )
            readOnlyRouterRuntimeSnapshot = try? SeisReadOnlyRouterRuntimeSnapshot.validated(
                from: Data(contentsOf: readOnlyRouterRuntimeURL)
            )
            modelFrontierEscalationPolicySnapshot = try? SeisModelFrontierEscalationPolicySnapshot.validated(
                from: Data(contentsOf: modelFrontierEscalationPolicyURL)
            )
            agiSystemSourceSnapshot = try? SeisAGISystemSourceSnapshot.validated(
                from: Data(contentsOf: agiSystemSourceURL)
            )
            projectIntakeSnapshot = try? SeisProjectIntakeSnapshot.validated(
                from: Data(contentsOf: projectIntakeURL)
            )
            connectorCapabilityRegistrySnapshot = try? SeisConnectorCapabilityRegistrySnapshot.validated(
                from: Data(contentsOf: connectorCapabilityRegistryURL)
            )
            installedCapabilityInventorySnapshot = try? SeisAIInstalledCapabilityInventorySnapshot.validated(
                bigTechData: Data(contentsOf: bigTechCapabilityInventoryURL),
                nvidiaData: Data(contentsOf: nvidiaCapabilityInventoryURL)
            )
            goalCommandCenterViewSnapshot = try? SeisGoalCommandCenterViewSnapshot.validated(
                from: Data(contentsOf: goalCommandCenterViewURL)
            )
            focusModeLearningContractSnapshot = try? SeisFocusModeLearningContractSnapshot.validated(
                from: Data(contentsOf: focusModeLearningContractURL)
            )
            pluginInterfaceRoadmapSnapshot = try? SeisPluginInterfaceRoadmapSnapshot.validated(
                from: Data(contentsOf: pluginInterfaceRoadmapURL)
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
            agiIndependentEvidenceLedgerSnapshot = nil
            agiGitHubUserReadinessGatesSnapshot = nil
            agiPublicReadinessEvidenceSnapshot = nil
            commandCenterKnowledgeSystemSnapshot = nil
            dataSchemaRegistrySnapshot = nil
            designComponentInventorySnapshot = nil
            universalCapabilityKernelSnapshot = nil
            actionDecisionContractSnapshot = nil
            actionExecutionContractSnapshot = nil
            agentRoleSchemaSnapshot = nil
            agentPermissionMatrixSnapshot = nil
            activeMissionBoardSnapshot = nil
            longHorizonMissionKernelSnapshot = nil
            agiEvaluationProtocolSnapshot = nil
            fullStackContractSnapshot = nil
            agentLaneStatusSnapshot = nil
            secondBrainContractSnapshot = nil
            platformLanguagePolicySnapshot = nil
            technologyStackSnapshot = nil
            requestedSoftwareStackSnapshot = nil
            platformDevelopmentTracksSnapshot = nil
            obsidianSafeImportSnapshot = nil
            readOnlyRouterRuntimeSnapshot = nil
            modelFrontierEscalationPolicySnapshot = nil
            agiSystemSourceSnapshot = nil
            projectIntakeSnapshot = nil
            connectorCapabilityRegistrySnapshot = nil
            installedCapabilityInventorySnapshot = nil
            goalCommandCenterViewSnapshot = nil
            focusModeLearningContractSnapshot = nil
            pluginInterfaceRoadmapSnapshot = nil
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

    func checkLocalLoopback() {
        guard !isCheckingLocalLoopback else { return }

        isCheckingLocalLoopback = true
        Task {
            do {
                let modelIdentifier = localLoopbackModelIdentifier.trimmingCharacters(in: .whitespacesAndNewlines)
                guard !modelIdentifier.isEmpty else {
                    localLoopbackReadiness = nil
                    statusMessage = "Enter a local model identifier before checking; no prompt was sent."
                    isCheckingLocalLoopback = false
                    return
                }
                let adapter = try SeisAILocalLoopbackProviderAdapter(modelIdentifier: modelIdentifier)
                let readiness = await adapter.preflight()
                localLoopbackReadiness = readiness
                statusMessage = "Local loopback preflight: \(readiness.status.rawValue), \(readiness.modelCount) model(s); no prompt was sent."
            } catch {
                localLoopbackReadiness = nil
                statusMessage = "Local loopback preflight could not be configured; no prompt was sent."
            }
            isCheckingLocalLoopback = false
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

    private var agiIndependentEvidenceLedgerURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-agi-independent-evidence-ledger.json")
    }

    private var agiGitHubUserReadinessGatesURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-agi-github-user-readiness-gates.json")
    }

    private var agiPublicReadinessEvidenceURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-agi-public-readiness-evidence.json")
    }

    private var commandCenterKnowledgeSystemURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-command-center-knowledge-system.json")
    }

    private var dataSchemaRegistryURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-data-schema-registry.json")
    }

    private var designComponentInventoryURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-design-component-inventory.json")
    }

    private var universalCapabilityKernelURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-universal-capability-kernel.json")
    }

    private var actionDecisionContractURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-action-decision-contract.json")
    }

    private var actionExecutionContractURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-action-execution-contract.json")
    }

    private var agentRoleSchemaURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-ai-core-agent-role-schema.json")
    }

    private var agentPermissionMatrixURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-ai-core-agent-permission-matrix.json")
    }

    private var activeMissionBoardURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-active-mission-board.json")
    }

    private var longHorizonMissionKernelURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-long-horizon-missions.json")
    }

    private var agiEvaluationProtocolURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-agi-evaluation-protocol.json")
    }

    private var fullStackContractURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-fullstack-contract.json")
    }

    private var agentLaneStatusURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-agent-lane-status.json")
    }

    private var secondBrainContractURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-second-brain-system.json")
    }

    private var platformLanguagePolicyURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-platform-language-policy.json")
    }

    private var technologyStackURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-technology-stack.json")
    }

    private var requestedSoftwareStackURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("requested-software-stack.json")
    }

    private var platformDevelopmentTracksURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-platform-development-tracks.json")
    }

    private var obsidianSafeImportURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-obsidian-bridge-safe-import-contract.json")
    }

    private var readOnlyRouterRuntimeURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-ai-core-read-only-router-runtime.json")
    }

    private var modelFrontierEscalationPolicyURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-model-frontier-escalation-policy.json")
    }

    private var agiSystemSourceURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-agi-system.json")
    }

    private var projectIntakeURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-project-intake-contract.json")
    }

    private var connectorCapabilityRegistryURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("connector-capability-registry.json")
    }

    private var bigTechCapabilityInventoryURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-big-tech-mcp-skill-inventory.json")
    }

    private var nvidiaCapabilityInventoryURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-nvidia-installed-integrations.json")
    }

    private var goalCommandCenterViewURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("content")
            .appendingPathComponent("development")
            .appendingPathComponent("seis-goal-command-center-view.json")
    }

    private var focusModeLearningContractURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent(SeisFocusModeLearningContractSnapshot.sourcePath)
    }

    private var pluginInterfaceRoadmapURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent(SeisPluginInterfaceRoadmapSnapshot.sourcePath)
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
                if let installedCapabilityInventorySnapshot = model.installedCapabilityInventorySnapshot {
                    installedCapabilityInventoryDisclosure(snapshot: installedCapabilityInventorySnapshot)
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
                if let agiIndependentEvidenceLedgerSnapshot = model.agiIndependentEvidenceLedgerSnapshot {
                    agiIndependentEvidenceLedgerDisclosure(snapshot: agiIndependentEvidenceLedgerSnapshot)
                }
                if let agiGitHubUserReadinessGatesSnapshot = model.agiGitHubUserReadinessGatesSnapshot {
                    agiGitHubUserReadinessGatesDisclosure(snapshot: agiGitHubUserReadinessGatesSnapshot)
                }
                if let agiPublicReadinessEvidenceSnapshot = model.agiPublicReadinessEvidenceSnapshot {
                    agiPublicReadinessEvidenceDisclosure(snapshot: agiPublicReadinessEvidenceSnapshot)
                }
                if let commandCenterKnowledgeSystemSnapshot = model.commandCenterKnowledgeSystemSnapshot {
                    commandCenterKnowledgeSystemDisclosure(snapshot: commandCenterKnowledgeSystemSnapshot)
                }
                if let dataSchemaRegistrySnapshot = model.dataSchemaRegistrySnapshot {
                    dataSchemaRegistryDisclosure(snapshot: dataSchemaRegistrySnapshot)
                }
                if let designComponentInventorySnapshot = model.designComponentInventorySnapshot {
                    designComponentInventoryDisclosure(snapshot: designComponentInventorySnapshot)
                }
                if let universalCapabilityKernelSnapshot = model.universalCapabilityKernelSnapshot {
                    universalCapabilityKernelDisclosure(snapshot: universalCapabilityKernelSnapshot)
                }
                if let actionDecisionContractSnapshot = model.actionDecisionContractSnapshot,
                   let actionExecutionContractSnapshot = model.actionExecutionContractSnapshot {
                    actionGovernanceContractsDisclosure(
                        decision: actionDecisionContractSnapshot,
                        execution: actionExecutionContractSnapshot
                    )
                }
                if let agentRoleSchemaSnapshot = model.agentRoleSchemaSnapshot,
                   let agentPermissionMatrixSnapshot = model.agentPermissionMatrixSnapshot {
                    agentGovernanceContractsDisclosure(
                        roleSchema: agentRoleSchemaSnapshot,
                        permissionMatrix: agentPermissionMatrixSnapshot
                    )
                }
                if let activeMissionBoardSnapshot = model.activeMissionBoardSnapshot {
                    activeMissionBoardDisclosure(snapshot: activeMissionBoardSnapshot)
                }
                if let longHorizonMissionKernelSnapshot = model.longHorizonMissionKernelSnapshot {
                    longHorizonMissionKernelDisclosure(snapshot: longHorizonMissionKernelSnapshot)
                }
                if let agiEvaluationProtocolSnapshot = model.agiEvaluationProtocolSnapshot {
                    agiEvaluationProtocolDisclosure(snapshot: agiEvaluationProtocolSnapshot)
                }
                if let fullStackContractSnapshot = model.fullStackContractSnapshot {
                    fullStackContractDisclosure(snapshot: fullStackContractSnapshot)
                }
                if let agentLaneStatusSnapshot = model.agentLaneStatusSnapshot {
                    agentLaneStatusDisclosure(snapshot: agentLaneStatusSnapshot)
                }
                if let secondBrainContractSnapshot = model.secondBrainContractSnapshot {
                    secondBrainContractDisclosure(snapshot: secondBrainContractSnapshot)
                }
                if let platformLanguagePolicySnapshot = model.platformLanguagePolicySnapshot {
                    platformLanguagePolicyDisclosure(snapshot: platformLanguagePolicySnapshot)
                }
                if let technologyStackSnapshot = model.technologyStackSnapshot {
                    technologyStackDisclosure(snapshot: technologyStackSnapshot)
                }
                if let requestedSoftwareStackSnapshot = model.requestedSoftwareStackSnapshot {
                    requestedSoftwareStackDisclosure(snapshot: requestedSoftwareStackSnapshot)
                }
                if let platformDevelopmentTracksSnapshot = model.platformDevelopmentTracksSnapshot {
                    platformDevelopmentTracksDisclosure(snapshot: platformDevelopmentTracksSnapshot)
                }
                if let obsidianSafeImportSnapshot = model.obsidianSafeImportSnapshot {
                    obsidianSafeImportDisclosure(snapshot: obsidianSafeImportSnapshot)
                }
                if let readOnlyRouterRuntimeSnapshot = model.readOnlyRouterRuntimeSnapshot {
                    readOnlyRouterRuntimeDisclosure(snapshot: readOnlyRouterRuntimeSnapshot)
                }
                if let modelFrontierEscalationPolicySnapshot = model.modelFrontierEscalationPolicySnapshot {
                    modelFrontierEscalationPolicyDisclosure(snapshot: modelFrontierEscalationPolicySnapshot)
                }
                if let agiSystemSourceSnapshot = model.agiSystemSourceSnapshot {
                    agiSystemSourceDisclosure(snapshot: agiSystemSourceSnapshot)
                }
                if let projectIntakeSnapshot = model.projectIntakeSnapshot {
                    projectIntakeDisclosure(snapshot: projectIntakeSnapshot)
                }
                if let connectorCapabilityRegistrySnapshot = model.connectorCapabilityRegistrySnapshot {
                    connectorCapabilityRegistryDisclosure(snapshot: connectorCapabilityRegistrySnapshot)
                }
                if let goalCommandCenterViewSnapshot = model.goalCommandCenterViewSnapshot {
                    goalCommandCenterViewDisclosure(snapshot: goalCommandCenterViewSnapshot)
                }
                if let focusModeLearningContractSnapshot = model.focusModeLearningContractSnapshot {
                    focusModeLearningContractDisclosure(snapshot: focusModeLearningContractSnapshot)
                }
                if let pluginInterfaceRoadmapSnapshot = model.pluginInterfaceRoadmapSnapshot {
                    pluginInterfaceRoadmapDisclosure(snapshot: pluginInterfaceRoadmapSnapshot)
                }
                if let capabilityMesh = model.capabilityMesh {
                    capabilityMeshDisclosure(mesh: capabilityMesh)
                }
                pluginCapabilityCatalogDisclosure(snapshot: snapshot.pluginMesh.capabilityCatalog)
                orchestrationDisclosure(snapshot: model.orchestrationSnapshot)
                promptCatalogDisclosure(engine: model.promptEngine)
                if let readinessReport = model.readinessReport {
                    readinessDisclosure(report: readinessReport)
                }
                routeInspector
                providerList(snapshot: snapshot)
                localLoopbackPreflight
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
                Text(mesh.pluginMcpStatusLabel)
                    .font(.caption.monospaced())
                    .foregroundStyle(mesh.pluginMcpBoundarySafe ? .green : .orange)
                Text("Allowlisted local status tools: \(mesh.pluginMcpSafeToolNames.joined(separator: ", "))")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                Text("Per-server probe evidence")
                    .font(.caption.weight(.semibold))
                ForEach(mesh.pluginMcpProbes) { probe in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: probe.isVerified && probe.boundarySafe ? "checkmark.seal" : "exclamationmark.triangle")
                            .foregroundStyle(probe.isVerified && probe.boundarySafe ? .green : .orange)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(probe.serverID)
                                .font(.caption.weight(.semibold))
                            Text("\(probe.requestedTool) · \(probe.status)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text("\(probe.resultKeyCount) redacted result keys · \(probe.boundarySafe ? "read-only" : "watch")")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(8)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                }
                Text("Status probes only. No plugin activation, MCP invocation, credentials, network, SSH, or mutation is performed.")
                    .font(.caption2)
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
        .accessibilityLabel("Plugin and MCP capability mesh. \(mesh.pluginStatusLabel). \(mesh.mcpStatusLabel). \(mesh.pluginMcpStatusLabel). Status probes only; no plugin activation or MCP invocation is performed.")
    }

    private func pluginCapabilityCatalogDisclosure(
        snapshot: SeisAICorePluginCapabilityCatalog
    ) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Source: \(snapshot.boundary.sourceOfTruth) · Mode: \(snapshot.mode)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("\(snapshot.pluginCount) bundled plugins · \(snapshot.manifestCapabilityCount) manifest capabilities · \(snapshot.profileQualityCommandCount) specialist profile command declarations")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                Text("Personal: \(snapshot.personalPluginCount) plugins / \(snapshot.personalManifestCapabilityCount) capabilities · Specialist: \(snapshot.specialistPluginCount) plugins / \(snapshot.specialistManifestCapabilityCount) capabilities")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                ForEach(snapshot.plugins) { plugin in
                    DisclosureGroup {
                        VStack(alignment: .leading, spacing: 6) {
                            catalogTerms(title: "Capabilities", values: plugin.capabilities)
                            catalogTerms(title: "Primary paths", values: plugin.profile.primaryPaths)
                            catalogTerms(title: "Quality commands", values: plugin.profile.qualityCommands)
                            catalogTerms(title: "Guardrails", values: plugin.profile.guardrails)
                            catalogTerms(title: "Helper families", values: plugin.profile.helperFamilies)
                            catalogTerms(title: "Source evidence", values: plugin.profile.sourceEvidence)
                            if !plugin.embeddedLaneProfiles.isEmpty {
                                Text("Embedded lane profiles")
                                    .font(.caption.weight(.semibold))
                                ForEach(plugin.embeddedLaneProfiles, id: \.path) { embedded in
                                    Label(embedded.path, systemImage: embedded.exists ? "checkmark.circle" : "questionmark.circle")
                                        .font(.caption2.monospaced())
                                        .foregroundStyle(embedded.exists ? .secondary : .orange)
                                }
                            }
                        }
                        .padding(.top, 6)
                    } label: {
                        HStack(spacing: 7) {
                            Image(systemName: plugin.profile.exists ? "checkmark.seal" : "exclamationmark.triangle")
                                .foregroundStyle(plugin.profile.exists ? .green : .orange)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(plugin.displayName)
                                    .font(.caption.weight(.semibold))
                                Text("\(plugin.classification) · \(plugin.capabilityCount) capabilities · profile: \(plugin.profile.status)")
                                    .font(.caption2.monospaced())
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .padding(8)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                }

                if !snapshot.qualityCommandGaps.isEmpty {
                    Text("Core quality-command gaps (\(snapshot.qualityCommandGaps.count))")
                        .font(.caption.weight(.semibold))
                    ForEach(snapshot.qualityCommandGaps, id: { gap in "\(gap.pluginID):\(gap.command)" }) { gap in
                        Text("\(gap.pluginID): \(gap.command)")
                            .font(.caption2.monospaced())
                            .foregroundStyle(.orange)
                    }
                } else {
                    Text("All specialist profile quality commands are linked to the Core lane gates.")
                        .font(.caption2)
                        .foregroundStyle(.green)
                }

                if !snapshot.missingProfilePaths.isEmpty {
                    Text("Missing profile sources")
                        .font(.caption.weight(.semibold))
                    ForEach(snapshot.missingProfilePaths, id: \.self) { path in
                        Text(path)
                            .font(.caption2.monospaced())
                            .foregroundStyle(.orange)
                    }
                }

                Text(snapshot.boundary.localReadOnly && !snapshot.boundary.blanketActivationClaimed
                     ? "Source-backed catalog only. No plugin is installed, activated, authenticated, invoked, or granted mutation authority by this panel."
                     : "Capability catalog boundary requires review.")
                    .font(.caption2)
                    .foregroundStyle(snapshot.boundary.localReadOnly ? .green : .orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Plugin capability catalog", systemImage: "list.bullet.rectangle.portrait")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Plugin capability catalog. \(snapshot.pluginCount) bundled plugins and \(snapshot.manifestCapabilityCount) source-backed capabilities. Missing profiles and quality gaps remain explicit. No activation or mutation is performed.")
    }

    private func catalogTerms(title: String, values: [String]) -> some View {
        guard !values.isEmpty else { return AnyView(EmptyView()) }
        return AnyView(
            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.caption.weight(.semibold))
                ForEach(values, id: \.self) { value in
                    Text(value)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        )
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
                Text("Launcher evidence: \(snapshot.currentLauncherEvidence.command) · observed \(snapshot.currentLauncherEvidence.observedDate)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                Text("Approval gates: \(snapshot.approvalRequiredFor.count) · external actions remain human-approved")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                Text(snapshot.truthBoundary)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
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

    private func installedCapabilityInventoryDisclosure(snapshot: SeisAIInstalledCapabilityInventorySnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Sources: \(snapshot.sourcePaths.joined(separator: " · "))")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Skills: \(snapshot.installedSkillCount) · CLI/tool profiles: \(snapshot.cliToolProfiles.count) · Project MCP/skill configs: \(snapshot.projectMCPConfigurations.count)")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                Text("Current-session MCP surfaces: \(snapshot.currentSessionMCPSurfaceCount) · Local apps: \(snapshot.localAppCount) · Pending connector approvals: \(snapshot.pendingConnectorInstallCount)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("NVIDIA skill manifests: \(snapshot.nvidiaSkillManifestCount) · Installed-gated integrations: \(snapshot.nvidiaIntegrationIDs.count) · Runtime blockers: \(snapshot.nvidiaRuntimeBlockedCount)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Runtime authority: \(snapshot.runtimeAuthority ? "enabled" : "blocked") · Credentials: \(snapshot.credentialsRead ? "read" : "not read") · Network: \(snapshot.networkCalled ? "called" : "not called") · Mutation: \(snapshot.externalMutationPerformed ? "performed" : "not performed")")
                    .font(.caption2.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)

                Text("Installed skill IDs")
                    .font(.caption.weight(.semibold))
                Text(snapshot.installedSkillIDs.joined(separator: " · "))
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)

                Text("Local CLI and tool profiles")
                    .font(.caption.weight(.semibold))
                ForEach(snapshot.cliToolProfiles) { profile in
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(profile.vendor) · \(profile.name)")
                            .font(.caption.weight(.semibold))
                        Text("\(profile.status) · \(profile.providerState)")
                            .font(.caption2.monospaced())
                            .foregroundStyle(.secondary)
                    }
                }

                Text("Project MCP and skill configurations")
                    .font(.caption.weight(.semibold))
                ForEach(snapshot.projectMCPConfigurations) { configuration in
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(configuration.client) · \(configuration.path)")
                            .font(.caption.weight(.semibold))
                        Text("Servers: \(configuration.serverIDs.isEmpty ? "none" : configuration.serverIDs.joined(separator: ", ")) · \(configuration.status)")
                            .font(.caption2.monospaced())
                            .foregroundStyle(.secondary)
                    }
                }

                Text("NVIDIA integrations: \(snapshot.nvidiaIntegrationIDs.joined(separator: " · "))")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                Text(snapshot.truthBoundary)
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Installed AI, MCP, skill, and NVIDIA inventory", systemImage: "square.stack.3d.up")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Installed AI, MCP, skill, and NVIDIA inventory. 38 skills, 3 local tool profiles, 17 current-session MCP surfaces, and 11 NVIDIA integrations are metadata-only; activation requires human approval.")
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
        .accessibilityLabel("MCP runtime contract. Local newline-delimited stdio JSON-RPC smoke-verified with initialize, notifications initialized, and tools list; 37 tools, 30 resources, 3 prompts, and four verified surfaces. No remote or credentialed execution.")
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

    private func agiIndependentEvidenceLedgerDisclosure(snapshot: SeisAGIIndependentEvidenceLedgerSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.status) · \(snapshot.researchBaseline.count) research baselines · \(snapshot.pendingExternalInquiries.count) pending inquiries")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isPlanOnly ? .secondary : .red)
                Text("Local Demo: \(snapshot.publicReadyForLocalDemo ? "available" : "blocked") · AGI claim: \(snapshot.agiClaimAllowed ? "allowed" : "blocked") · 512B route: \(snapshot.routeEligibleToday ? "eligible" : "blocked") · Approval: \(snapshot.humanApprovalNeeded.decision)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                ForEach(snapshot.pendingExternalInquiries) { inquiry in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: "person.crop.circle.badge.questionmark")
                            .foregroundStyle(.orange)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(inquiry.id) · \(inquiry.status)")
                                .font(.caption.weight(.semibold))
                            Text("Owners: \(inquiry.ownerAgents.joined(separator: ", "))")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text("Required: \(inquiry.requiredEvidence.joined(separator: " · "))")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                }
                Text("Readiness gates: \(snapshot.readinessChecks.gateIds.joined(separator: " · "))")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Text(snapshot.truthBoundary)
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("AGI independent evidence ledger", systemImage: "person.2.badge.gearshape")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("AGI independent evidence ledger. Three external inquiries are missing, human approval is not recorded, Local Demo remains available, and AGI or 512B claims remain blocked.")
    }

    private func agiGitHubUserReadinessGatesDisclosure(snapshot: SeisAGIGitHubUserReadinessGatesSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text(snapshot.claimDecision)
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isLocalDemoOnly ? .secondary : .red)
                Text("Validator: \(snapshot.oneCommandReadinessValidator.status) · \(snapshot.oneCommandReadinessValidator.checks.count) checks · Secrets: \(snapshot.coreCredentialRequirement)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("\(snapshot.githubUserModes.count) user modes · \(snapshot.readinessGates.count) readiness gates · \(snapshot.forbiddenClaims.count) forbidden claims")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                ForEach(snapshot.githubUserModes) { mode in
                    Text("\(mode.label) · \(mode.status) · secrets: \(mode.requiresSecrets ? "yes" : "no")")
                        .font(.caption2.monospaced())
                        .foregroundStyle(.secondary)
                }
                ForEach(snapshot.readinessGates) { gate in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: gate.status.contains("satisfied") ? "checkmark.shield" : "lock.shield")
                            .foregroundStyle(gate.status.contains("satisfied") ? .green : .orange)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(gate.id) · \(gate.status)")
                                .font(.caption.weight(.semibold))
                            Text("Local Demo blocked: \(gate.blocksGithubLocalDemo ? "yes" : "no") · AGI blocked: \(gate.blocksAgiClaim ? "yes" : "no")")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text("Owners: \(gate.ownerAgents.joined(separator: ", "))")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                }
                Text(snapshot.truthBoundary)
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("GitHub user readiness gates", systemImage: "person.crop.circle.badge.checkmark")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("GitHub user readiness gates. Local Demo review and no-key validators are allowed; real AGI use, live providers, 512B routeability, runtime authority, and release approval remain gated.")
    }

    private func agiPublicReadinessEvidenceDisclosure(snapshot: SeisAGIPublicReadinessEvidenceSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.readinessSummary.acceptedClaimEvidenceCount)/\(snapshot.readinessSummary.minimumClaimEvidenceCount) minimum claim evidence accepted · \(snapshot.readinessSummary.missingClaimEvidenceCount) missing")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isBlockedPlanOnly ? .secondary : .red)
                Text("Protocol: \(snapshot.readinessSummary.protocolStatus) · Apex: \(snapshot.readinessSummary.apexProgramStatus) · Dimensions: \(snapshot.readinessSummary.evaluationDimensionCount) · Source gates: \(snapshot.readinessSummary.sourceDerivedGateCount)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                ForEach(snapshot.sourceDerivedGateMatrix) { gate in
                    Text("\(gate.gateId) · \(gate.status) · evidence: \(gate.evidenceStatus)")
                        .font(.caption2.monospaced())
                        .foregroundStyle(.secondary)
                }
                Text(snapshot.readinessSummary.blockedReason)
                    .font(.caption2)
                    .foregroundStyle(.orange)
                Text(snapshot.truthBoundary)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("AGI public readiness evidence", systemImage: "exclamationmark.shield")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("AGI public readiness evidence. Zero of twenty minimum claim evidence items are accepted, twenty remain missing, and the protocol is not run; Local Demo remains separate from AGI claims.")
    }

    private func commandCenterKnowledgeSystemDisclosure(snapshot: SeisCommandCenterKnowledgeSystemSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.requiredNodes.count) knowledge nodes · \(snapshot.requiredEvidenceKinds.count) evidence kinds · \(snapshot.evidence.count) evidence records · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Secrets stored: \(snapshot.securityBoundary.storesSecrets ? "yes" : "no") · Forbidden data: \(snapshot.securityBoundary.forbiddenData.joined(separator: ", "))")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Nodes: \(snapshot.requiredNodes.joined(separator: " · "))")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                Text(snapshot.releaseRule)
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Command Center knowledge system", systemImage: "brain")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Command Center knowledge system. Six source-backed knowledge nodes, five evidence kinds, seven evidence records, and no secret storage.")
    }

    private func dataSchemaRegistryDisclosure(snapshot: SeisDataSchemaRegistrySnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.records.count) records · \(snapshot.laneIDs.count) lanes · \(snapshot.validatedRecordCount) validated · \(snapshot.scaffoldedRecordCount) scaffolded · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Lanes: \(snapshot.laneIDs.joined(separator: " · "))")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                Text("Source-backed registry records expose paths, shapes, freshness, validation commands, and secret policies only. Record contents remain outside this native inspection surface.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .padding(.top, 8)
        } label: {
            Label("SEIS-Data schema registry", systemImage: "tablecells")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("SEIS-Data schema registry. Eighteen source-backed records across five lanes, with sixteen validated and two scaffolded; metadata-only and no record contents are read.")
    }

    private func designComponentInventoryDisclosure(snapshot: SeisDesignComponentInventorySnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.components.count) components · \(snapshot.surfaceIDs.count) surfaces · \(snapshot.selectorCount) selectors · \(snapshot.validatedComponentCount) validated · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Surfaces: \(snapshot.surfaceIDs.joined(separator: " · "))")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                Text("Accessibility, motion policy, source paths, selectors, and validation commands remain inspectable design metadata; this panel does not mutate the web or native design system.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .padding(.top, 8)
        } label: {
            Label("SEIS-Design component inventory", systemImage: "rectangle.3.group")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("SEIS-Design component inventory. Twelve source-backed components across multiple surfaces, twelve validated, with accessibility and motion metadata; metadata-only and no design mutation.")
    }

    private func universalCapabilityKernelDisclosure(snapshot: SeisUniversalCapabilityKernelSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.summary.domainCount) domains · \(snapshot.summary.laneCount) lanes · \(snapshot.summary.agentRoles.count) agent roles · \(snapshot.summary.pluginInventoryCount) plugin records · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Platforms: \(snapshot.summary.platformCount) · Apple languages: \(snapshot.summary.appleLanguageCount) · Windows languages: \(snapshot.summary.windowsLanguageCount) · policy languages: \(snapshot.summary.windowsPolicyLanguageCount)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                Text("Lanes: \(snapshot.laneIDs.joined(separator: " · "))")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Text(snapshot.routingContract.executionBoundary)
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Universal capability kernel", systemImage: "point.3.connected.trianglepath.dotted")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Universal capability kernel. Thirty-eight domains, fourteen lanes, thirty-eight agent roles, 168 plugin records, and explicit user approval before activation; metadata-only.")
    }

    private func actionGovernanceContractsDisclosure(
        decision: SeisActionDecisionContractSnapshot,
        execution: SeisActionExecutionContractSnapshot
    ) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Decision: \(decision.defaultDecision) · Execution: \(execution.defaultDecision) · \(decision.ruleCount) capability rules")
                    .font(.caption.monospaced())
                    .foregroundStyle(decision.isMetadataOnly && execution.isMetadataOnly ? .secondary : .red)
                Text("Dry run: \(execution.executionPolicy.dryRun ? "yes" : "no") · Max command: \(execution.executionPolicy.maxCommandSeconds)s · Rollback: \(execution.executionPolicy.rollback.strategy)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                Text("Explicit approval: \(execution.executionPolicy.requiresExplicitApprovalFor.joined(separator: " · "))")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Text("Secret capability is denied; write, shell, git, network, deploy, model, and data remain gated or approval-required. Reports are redacted and no action is executed by this inspection surface.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Action governance contracts", systemImage: "checkmark.shield")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Action governance contracts. Read-only decision default, dry-run execution default, twelve capability rules, explicit approval for higher-risk actions, redaction, documented rollback, and no execution authority.")
    }

    private func agentGovernanceContractsDisclosure(
        roleSchema: SeisAgentRoleSchemaSnapshot,
        permissionMatrix: SeisAgentPermissionMatrixSnapshot
    ) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(roleSchema.roles.count) lane roles · \(permissionMatrix.levels.count) permission levels · \(permissionMatrix.enabledLevelCount) enabled · status-and-plan-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(roleSchema.isMetadataOnly && permissionMatrix.isMetadataOnly ? .secondary : .red)
                Text("Lanes: \(roleSchema.laneIDs.joined(separator: " · "))")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                Text("Read-only and plan-only are enabled. Write-gated, external-gated, and forbidden actions remain planned, approval-gated, or forbidden without a separate security and recovery plan.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Agent governance contracts", systemImage: "person.3.sequence")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Agent governance contracts. Five lane roles, five permission levels, two enabled safe levels, and write, external, and forbidden actions separately gated; status-and-plan-only.")
    }

    private func activeMissionBoardDisclosure(snapshot: SeisActiveMissionBoardSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.summary.cardCount) cards · \(snapshot.summary.laneCount) lanes · \(snapshot.summary.platformCoverageCount) platforms · \(snapshot.summary.languageCoverageCount) languages · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Now/Next/Queued: \(snapshot.summary.nowCount)/\(snapshot.summary.nextCount)/\(snapshot.summary.queuedCount) · Quality gates: \(snapshot.summary.qualityGateCoverageCount) · Acceptance gates: \(snapshot.summary.acceptanceGateCoverageCount)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                ForEach(Array(snapshot.firstExecutionCards)) { card in
                    Text("#\(card.order) · \(card.title) · \(card.agentRole) · \(card.executionMode)")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                Text("Install policy: \(snapshot.installPolicy.default). The board is a deterministic planning surface; it does not install runtimes or execute mission cards.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Active mission board", systemImage: "list.bullet.clipboard")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Active mission board. Thirty cards across now, next, and queued lanes, five platforms, 29 languages, 41 quality gates, and 12 acceptance gates; deterministic plan-only metadata.")
    }

    private func longHorizonMissionKernelDisclosure(snapshot: SeisLongHorizonMissionKernelSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.duration.weeks) weeks · \(snapshot.summary.waveCount) waves · \(snapshot.summary.missionCount) missions · \(snapshot.summary.domainCoverageCount) domains · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Languages: \(snapshot.summary.languageCoverageCount) · Apple missions: \(snapshot.summary.appleMissionCount) · Windows missions: \(snapshot.summary.windowsMissionCount) · Minimum gates: \(snapshot.summary.minimumQualityGateCount)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                ForEach(Array(snapshot.firstMissions)) { mission in
                    Text("#\(mission.order) · \(mission.label) · \(mission.agentRole) · \(mission.status)")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                Text("Install policy: \(snapshot.installPolicy.default). All 120 records remain planned; this native surface does not install runtimes or execute missions.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Long-horizon mission kernel", systemImage: "calendar.badge.clock")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Long-horizon mission kernel. Fifty-two weeks, twelve waves, 120 planned missions, 38 domains, 35 languages, 20 Apple missions, and 20 Windows missions; metadata-only.")
    }

    private func agiEvaluationProtocolDisclosure(snapshot: SeisAGIEvaluationProtocolSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("(snapshot.minimumEvidenceCount) minimum claim evidence items · (snapshot.evaluationDimensions.count) dimensions · (snapshot.sourceDerivedReadinessGates.count) source gates · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Research sources: (snapshot.publicResearchBaseline.sources.count) · Reviewers: (snapshot.requiredReviewers.count) · Evaluation: (snapshot.evaluationRunStatus) · Benchmarks: (snapshot.benchmarkStatus)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Promotion: \(snapshot.promotionDecisionModel.defaultDecision) · External review: \(snapshot.promotionDecisionModel.publicClaimRequiresExternalReview ? "required" : "not required") · Human route approval: \(snapshot.promotionDecisionModel.routeEligibilityRequiresHumanApproval ? "required" : "not required")")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                Text(snapshot.truthBoundary)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("AGI evaluation protocol boundary", systemImage: "checkmark.shield")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("AGI evaluation protocol boundary. Twenty minimum claim evidence items, eleven evaluation dimensions, four source gates, and eleven reviewers remain not-run; promotion is blocked and this is not AGI or benchmark evidence.")
    }

    private func fullStackContractDisclosure(snapshot: SeisFullStackContractSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.publicEndpoints.count) read-only endpoints · \(snapshot.providerStatus.count) providers · \(snapshot.agentTasks.count) dry-run tasks · \(snapshot.capabilities.count) capabilities · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Session: \(snapshot.session.userMode) · Storage: \(snapshot.session.storageMode) · Auth: \(snapshot.session.auth.status) · AI Core: \(snapshot.session.capabilitySummary["aiCore"] ?? "unknown")")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Server: \(snapshot.serverBoundary.runtime) · Writes: \(snapshot.serverBoundary.writePolicy) · SSH: \(snapshot.session.capabilitySummary["ssh"] ?? "unknown") · Deployment: \(snapshot.session.capabilitySummary["deployment"] ?? "unknown")")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                Text("No-server fallback: \(snapshot.frontendState.fallbackContract)")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Full-stack contract boundary", systemImage: "server.rack")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Full-stack contract boundary. Eight read-only Local Demo endpoints, five backend-only provider states, three dry-run agent tasks, and seven capabilities preserve no-key startup and static fallback; auth, live AI, SSH, and deployment remain gated.")
    }

    private func agentLaneStatusDisclosure(snapshot: SeisAgentLaneStatusSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.activeLaneCount) active lanes · \(snapshot.personalLaneCount) personal SEIS lanes · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Personal lanes: seis, seis-cloud, seis-code, seis-design, seis-data")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                ForEach(snapshot.firstLanes) { lane in
                    Text("\(lane.displayName) · \(lane.autonomyLevel) · \(lane.status)")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
                Text("Every lane declares skill, tool, safety, autonomy, and validation boundaries. This surface does not activate agents or run background work.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Agent lane status", systemImage: "person.3.sequence")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Agent lane status. Fourteen active observable lanes include five supervised personal SEIS lanes; each declares skill, tool, safety, autonomy, and validation boundaries. No agents are activated.")
    }

    private func secondBrainContractDisclosure(snapshot: SeisSecondBrainContractSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.vaultNoteCount) local vault notes · \(snapshot.managedLaneCount) managed lanes · \(snapshot.autonomousAgentRoster.count) roster agents · \(snapshot.installedAiProfiles.count) AI profiles · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Vault: \(snapshot.vaultRoot) · Obsidian bridge: \(snapshot.obsidianBridge.status) · Publish: \(snapshot.pipeline.first(where: { $0.step == "Publish" })?.status ?? "unknown")")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                ForEach(snapshot.firstNotes) { note in
                    Text("\(note.title) · \(note.status)")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
                Text("No secrets, provider calls, SSH, deployment, private-vault import, or GitHub mutation. Human review is required before public use.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("SEIS Second Brain", systemImage: "brain.head.profile")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("SEIS Second Brain. Six local vault notes, nine managed lanes, thirteen plan-only roster agents, six installed AI profiles, and a publish-blocked pipeline. No private vault import or external mutation is enabled.")
    }

    private func platformLanguagePolicyDisclosure(snapshot: SeisPlatformLanguagePolicySnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Apple: \(snapshot.appleLanguageCount) language surfaces · \(snapshot.summary.appleNativeFrameworkCount) frameworks · Windows: \(snapshot.windowsLanguageCount) surfaces · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Apple platforms: \(snapshot.apple.platforms.joined(separator: ", ")) · Windows required lanes: \(snapshot.summary.windowsRequiredLanguageCount)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Apple-only surfaces stay excluded from Windows: \(snapshot.summary.appleOnlyLanguageSurfaces.joined(separator: ", ")).")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                Text(snapshot.routingRule)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Apple-first platform language policy", systemImage: "macwindow.on.rectangle")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Apple-first platform language policy. Five Apple language surfaces and ten native frameworks are prioritized across macOS and iOS; Windows keeps 41 polyglot surfaces and excludes Apple-only surfaces. This is policy metadata, not runtime installation evidence.")
    }

    private func technologyStackDisclosure(snapshot: SeisTechnologyStackSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.sourceLanguageCount) source languages · \(snapshot.ecosystemGroups.count) ecosystem groups · \(snapshot.ecosystemTechnologyCount) technologies · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("GitHub panels: \(snapshot.summary.githubFocusedPanels.joined(separator: ", ")) · Requested core stack: \(snapshot.summary.requestedCoreStackCount)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text(snapshot.summary.githubLanguagePolicy)
                    .font(.caption2)
                    .foregroundStyle(.orange)
                Text("Frameworks, SDKs, clouds, products, and tools remain ecosystem metadata. Runtime installation and filler code are not implied.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Technology stack contract", systemImage: "square.stack.3d.up")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Technology stack contract. Sixty real source languages, seven ecosystem groups, 143 technologies, and six requested core technologies are visible as metadata. GitHub language surfaces remain separate from frameworks, SDKs, clouds, products, and tools; no runtime installation or filler code is implied.")
    }

    private func requestedSoftwareStackDisclosure(snapshot: SeisRequestedSoftwareStackSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.requestedTechnologyCount) technologies · \(snapshot.summary.entrypointCount) entrypoints · \(snapshot.uniqueSubmittedPluginCount) submitted plugins · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Capability lanes: \(snapshot.capabilityLaneCount) · Polyglot language surfaces: \(snapshot.summary.polyglotLanguageSurfaces)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Activation: task-scoped, authenticated, relevant, and user-approved. Supporting plugins are references, not installed or active connectors.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                Text("No runtime dependencies are installed by this metadata contract; credentials and live connector tokens remain out of source control.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Requested software stack", systemImage: "shippingbox")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Requested software stack. Six technologies, ten entrypoints, 300 submitted plugins, twelve capability lanes, and 117 polyglot language surfaces are visible as source metadata. Plugin references are not installed or activated; authentication, user approval, runtime, and credential boundaries remain explicit.")
    }

    private func platformDevelopmentTracksDisclosure(snapshot: SeisPlatformDevelopmentTracksSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.trackCount) tracks · Apple: \(snapshot.summary.appleLanguageCount) languages / \(snapshot.summary.appleNativeFrameworkCount) frameworks · Windows: \(snapshot.summary.windowsLanguageCoverageCount) surfaces · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Required Windows: \(snapshot.summary.windowsRequiredLanguageCount) · Extended Windows: \(snapshot.summary.windowsExtendedLanguageCount) · Unique quality gates: \(snapshot.uniqueQualityGateCount)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Apple-native continuation remains first; Windows excludes Apple-only language surfaces; JavaScript remains compatibility-only and runtime installs stay requirement-led.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                Text("Track records define policy, validation commands, agent roles, artifacts, and gates. They do not prove that every runtime or build tool is installed.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Platform development tracks", systemImage: "arrow.triangle.branch")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Platform development tracks. Four metadata tracks preserve Apple-native continuation, required and extended Windows polyglot execution, and governance. Apple has five language surfaces and ten frameworks; Windows has 41 surfaces and excludes Apple-only surfaces. Runtime or build tool installation is not claimed.")
    }

    private func obsidianSafeImportDisclosure(snapshot: SeisObsidianSafeImportSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.allowedToday.count) allowed local-demo actions · \(snapshot.blockedActionCount) forbidden actions · \(snapshot.importPhaseCount) future phases · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Body policy: \(snapshot.dryRunManifestSchema.bodyImportPolicy) · Private paths: \(snapshot.dryRunManifestSchema.privatePathPolicy) · Public sync: \(snapshot.futureImportPhases.last?.status ?? "unknown")")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("No host vault read, private import, Obsidian plugin install, provider submission, external mutation, secrets, or GitHub publication is enabled. Human approval remains required.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                Text("The native surface reads the contract only; it does not scan a vault or import note bodies.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Obsidian safe import boundary", systemImage: "lock.doc")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Obsidian safe import boundary. Explicit user-selected import only, metadata-only by default, with redaction and provenance gates. Host vault reads, private import, plugin installation, provider submission, external mutation, secrets, and GitHub publication remain disabled or blocked. The native surface does not scan a vault.")
    }

    private func readOnlyRouterRuntimeDisclosure(snapshot: SeisReadOnlyRouterRuntimeSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.inputCount) metadata inputs · \(snapshot.providerStateRules.count) provider rules · \(snapshot.coveredLaneCount) SEIS lanes · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Runtime authority: disabled · Route eligibility: disabled · Provider calls: disabled · Cloud key required: disabled")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Inputs are metadata only. Prompt bodies, API keys, private Obsidian contents, SSH credentials, cookies, service accounts, and unredacted provider errors are forbidden.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                Text("This evaluator does not claim a trained model, foundation model, AGI, or 512B route eligibility.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Read-only router runtime", systemImage: "arrow.triangle.2.circlepath")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Read-only router runtime. Nine metadata inputs, five provider-state rules, seven forbidden input categories, and five SEIS lanes are visible. Runtime authority, route eligibility, provider calls, credential reads, prompt-body reads, private Obsidian reads, agent execution, external mutation, and cloud API key requirements are disabled. No trained model, foundation model, AGI, or 512B claim is made.")
    }

    private func modelFrontierEscalationPolicyDisclosure(snapshot: SeisModelFrontierEscalationPolicySnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.escalationStages.count) escalation stages · \(snapshot.routeEligibleStageCount) route-eligible today · \(snapshot.humanApprovalRequiredFor.count) approval gates · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Current mode: \(snapshot.currentAllowedMode) · Default: \(snapshot.defaultRuntimeMode) · Route eligible today: \(snapshot.routeEligibleToday ? "yes" : "no")")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Only the Local Demo stage is allowed today. 20B, 70B, 150B, and 512B remain evidence-gated, approval-gated, and route-blocked.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                Text("This policy does not download weights, run inference, call providers, execute benchmarks, or claim SEIS owns trained weights, AGI, or a routeable frontier model.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Model frontier escalation policy", systemImage: "chart.line.uptrend.xyaxis")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Model frontier escalation policy. Six metadata stages are visible; only Local Demo is allowed and route-eligible today. Twenty billion, seventy billion, one hundred fifty billion, and five hundred twelve billion parameter stages remain blocked pending evidence and human approval. No weights, inference, provider, benchmark, ownership, or AGI claim is made.")
    }

    private func agiSystemSourceDisclosure(snapshot: SeisAGISystemSourceSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.priorityDomainCount) priority domains · \(snapshot.domainTaxonomyCount) taxonomy terms · \(snapshot.domainLaneCount) domain lanes · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("\(snapshot.subsystemCount) subsystems · \(snapshot.pluginCapabilityLaneCount) capability lanes · \(snapshot.releaseMilestoneCount) release milestones · \(snapshot.memoryCheckpointCount) memory checkpoints / \(snapshot.planningLoopCount) loops")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Apple-first source strategy: \(snapshot.platformStrategy.priority) · JavaScript target: \(snapshot.platformStrategy.javascriptTargetPercent, specifier: "%.1f")% · token target: \(snapshot.tokenEfficiency.targetSavingsPercent)%")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("This is an AGI-inspired, human-owned operating architecture. It does not claim autonomous general intelligence, live model ownership, autonomous execution, or provider access.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("AGI system source contract", systemImage: "brain.head.profile")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("AGI system source contract. Twenty priority domains, 150 taxonomy terms, 125 domain lanes, ten subsystems, five plugin capability lanes, three release milestones, five memory checkpoints, and four planning loops are source-backed metadata. The contract explicitly does not claim autonomous general intelligence or live model ownership.")
    }

    private func projectIntakeDisclosure(snapshot: SeisProjectIntakeSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.requiredEvidence.count) evidence items · \(snapshot.requiredArtifacts.count) artifacts · \(snapshot.nextPhaseSuggestions.count) next actions · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Read: allowed · Write: approval · Shell: approval · Network: disabled by default · Secret capture: forbidden")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Scope: \(snapshot.scopeRecommendation.primary) / \(snapshot.scopeRecommendation.secondary) · Target: \(snapshot.scopeRecommendation.target)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("The intake surface inspects a local repository and prepares evidence; it does not write, run shell, access network, capture secrets, or claim a completed project build.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Project intake safety contract", systemImage: "checklist")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Project intake safety contract. Read is allowed, write and shell require user approval, network is disabled by default, and secret capture is forbidden. Four evidence items, five artifacts, and three next actions are source-backed metadata only.")
    }

    private func connectorCapabilityRegistryDisclosure(snapshot: SeisConnectorCapabilityRegistrySnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.connectorCount) connectors · \(snapshot.skillCount) skills · \(snapshot.capabilityFamilyCount) families · \(snapshot.automationRules.count) activation rules · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Ready-if-authenticated: \(snapshot.readyConnectorCount) · Candidate: \(snapshot.candidateConnectorCount) · Requested blocked: \(snapshot.requestedBlockedConnectorCount) · Registry-ready: \(snapshot.registryReadyConnectorCount)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Activation: registry-first · Auth: explicit · Tokens: never committed · Blanket OAuth, unreviewed remote mutation, broad scans, and unbounded browser runs: blocked")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                Text("The registry exposes capability selection and activation gates; it does not authenticate connectors, install skills, call remote services, or grant write authority.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Connector capability registry", systemImage: "point.3.connected.trianglepath.dotted")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Connector capability registry. Twenty-one connectors, fifty skills, seven capability families, and five activation rules are source-backed. Activation is registry-first and explicit-auth-only; token commits, blanket OAuth, unreviewed remote mutation, broad scans, and unbounded browser runs remain blocked. No connector is authenticated or called by this native surface.")
    }

    private func goalCommandCenterViewDisclosure(snapshot: SeisGoalCommandCenterViewSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.totalGoalCount) goals · \(snapshot.activeGoalCount) active · \(snapshot.blockedGoalCount) blocked · \(snapshot.plannedGoalCount) planned · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("\(snapshot.progressCardCount) progress cards · \(snapshot.panelCount) panels · \(snapshot.uxGuardCount) UX guards · \(snapshot.sourceRecordCount) source records")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("State: \(snapshot.finalState) · non-LLM generated view · repository hygiene remains visible as a blocker")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                Text("This native surface reads the tracked Goal Command Center view as evidence-backed metadata. It does not mark blocked goals complete, synchronize live GitHub state, or claim autonomous project execution.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("Goal Command Center view", systemImage: "target")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Goal Command Center view. Twenty goals are tracked with five active, three blocked, and twelve planned. Twenty progress cards, twenty-four panels, four UX guards, and twelve source records are visible as non-LLM metadata. Repository hygiene remains an explicit blocker; this surface does not claim live GitHub synchronization or autonomous execution.")
    }

    private func focusModeLearningContractDisclosure(snapshot: SeisFocusModeLearningContractSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.agiOperatingBehavior.count) bounded behaviors · \(snapshot.evidence.count) evidence paths · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("Telemetry: \(snapshot.feature.telemetryEvent) · Gate: \(snapshot.qualityGate)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Focus Mode narrows the current task to the minimum effective toolset, protects secrets and repository integrity, and escalates only for material risk or ambiguity.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                Text("This contract is a supervised operating boundary. It does not suppress validation, grant autonomous execution, or claim live telemetry delivery from this native surface.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.top, 8)
        } label: {
            Label("SEIS Focus Mode learning contract", systemImage: "scope")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("SEIS Focus Mode learning contract. Five bounded behaviors, four evidence paths, a focus mode telemetry event, and the local quality gate are source-backed metadata. Focus Mode does not suppress validation or grant autonomous execution.")
    }

    private func pluginInterfaceRoadmapDisclosure(snapshot: SeisPluginInterfaceRoadmapSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(snapshot.interfaceCount) lanes · \(snapshot.yearCount)-year horizon · \(snapshot.laneYearCommitmentCount) lane-year commitments · metadata-only")
                    .font(.caption.monospaced())
                    .foregroundStyle(snapshot.isMetadataOnly ? .secondary : .red)
                Text("\(snapshot.cadenceLoopCount) H1/H2 cadence loops · \(snapshot.readinessGateCount) readiness gates · \(snapshot.liveActionCount) live actions")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Lanes: \(snapshot.interfaces.map(\.handle).joined(separator: " · ")) · current mode: documented-static-interface")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                SeisPluginInterfaceRoadmapInspectorView(snapshot: snapshot)
            }
            .padding(.top, 8)
        } label: {
            Label("Plugin interface roadmap", systemImage: "point.3.connected.trianglepath.dotted")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Plugin interface roadmap. Five named lanes, five years, twenty-five lane-year commitments, ten H1/H2 cadence loops, five readiness gates, and zero live actions are source-backed metadata. The native surface does not install plugins, authenticate connectors, invoke MCP, or claim live actions.")
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

    private var localLoopbackPreflight: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Local model runtime", systemImage: "antenna.radiowaves.left.and.right")
                .font(.subheadline.weight(.semibold))

            if let readiness = model.localLoopbackReadiness {
                HStack(spacing: 6) {
                    Image(systemName: readiness.status == .modelAvailable ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                        .foregroundStyle(localLoopbackReadinessColor(readiness.status))
                    Text("\(readiness.status.rawValue) · \(readiness.modelCount) model(s)")
                        .font(.caption.weight(.semibold))
                }
                Text("Endpoint: \(readiness.endpoint) · Requested model: \(readiness.requestedModelIdentifier)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
                Text("Service reachable: \(readiness.serviceReachable ? "yes" : "no") · Model available: \(readiness.requestedModelAvailable ? "yes" : "no")")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            } else {
                Text("Not checked")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            TextField("Model identifier", text: $model.localLoopbackModelIdentifier)
                .textFieldStyle(.roundedBorder)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .accessibilityLabel("Local model identifier")

            HStack {
                Text("Read-only GET /api/tags. No prompt, credentials, model generation, or mutation.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Spacer(minLength: 8)
                Button {
                    model.checkLocalLoopback()
                } label: {
                    Label("Check", systemImage: "arrow.clockwise")
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
                .disabled(model.isCheckingLocalLoopback)
            }
        }
        .padding(10)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Local model runtime preflight. Reads the loopback tags endpoint only and does not send a prompt or perform model execution.")
    }

    private func localLoopbackReadinessColor(_ status: SeisAILocalLoopbackReadinessStatus) -> Color {
        switch status {
        case .modelAvailable:
            .green
        case .serviceAvailableWithoutModel:
            .orange
        case .unavailable, .invalidResponse:
            .red
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
