import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Core Readiness Evaluator")
struct SeisAICoreReadinessEvaluatorTests {
    @Test func validatedLocalDemoStackProducesOnlyLocalDemoReadiness() throws {
        let snapshot = try SeisAICoreRuntimeSnapshotContract.validated(from: runtimeSnapshotData())
        let mesh = SeisAICapabilityMesh(snapshot: snapshot)
        let promptEngine = SeisAIPromptEngine.defaultEngine
        let handoffs = SeisAGIAgentHandoffSnapshot.current()
        let workforce = try SeisAIWorkforceAssignmentSnapshot.validated(from: workforceData())
        let workforceTraining = try SeisAIWorkforceTrainingSnapshot.validated(from: workforceTrainingData())
        let modelPlanning = try SeisAIModelPlanningEvidenceSnapshot.validated(from: modelPlanningData())
        let versionPromotion = try SeisAICoreVersionPromotionSnapshot.validated(from: versionPromotionData())
        let versionRegistry = try SeisAICoreVersionRegistrySnapshot.validated(from: versionRegistryData())
        let subagentOperatingModel = try SeisAISubagentOperatingModelSnapshot.validated(from: subagentOperatingModelData())
        let subagentRuntimeFixtures = try SeisAISubagentRuntimeFixturesSnapshot.validated(from: subagentRuntimeFixturesData())
        let subagentReviewLedger = try SeisAISubagentReviewLedgerSnapshot.validated(from: subagentReviewLedgerData())
        let modelScalingCouncil = try SeisModelScalingSubagentCouncilSnapshot.validated(from: modelScalingCouncilData())
        let mcpRuntimeContract = try SeisAICoreMCPRuntimeContractSnapshot.validated(from: mcpRuntimeContractData())
        let pluginIntegration = try SeisAgentPluginIntegrationSnapshot.validated(from: pluginIntegrationData())
        let providerRegistry = try SeisAICoreProviderRegistrySnapshot.validated(from: providerRegistryData())
        let readOnlyRouterContract = try SeisAIReadOnlyModelRouterContractSnapshot.validated(from: readOnlyRouterContractData())
        let languageModelIntake = try SeisLanguageModelIntakeRegistrySnapshot.validated(from: languageModelIntakeData())
        let languageModelTrainingCurriculum = try SeisLanguageModelTrainingCurriculumSnapshot.validated(from: languageModelTrainingCurriculumData())
        let publicReadinessProgram = try SeisAIPublicReadinessProgramSnapshot.validated(from: publicReadinessProgramData())
        let commandCenterOperationsReadiness = try SeisCommandCenterOperationsReadinessSnapshot.validated(from: commandCenterOperationsReadinessData())
        let agiIndependentEvidenceLedger = try SeisAGIIndependentEvidenceLedgerSnapshot.validated(from: agiIndependentEvidenceLedgerData())
        let agiGitHubUserReadinessGates = try SeisAGIGitHubUserReadinessGatesSnapshot.validated(from: agiGitHubUserReadinessGatesData())
        let agiPublicReadinessEvidence = try SeisAGIPublicReadinessEvidenceSnapshot.validated(from: agiPublicReadinessEvidenceData())
        let commandCenterKnowledgeSystem = try SeisCommandCenterKnowledgeSystemSnapshot.validated(from: commandCenterKnowledgeSystemData())
        let dataSchemaRegistry = try SeisDataSchemaRegistrySnapshot.validated(from: dataSchemaRegistryData())
        let designComponentInventory = try SeisDesignComponentInventorySnapshot.validated(from: designComponentInventoryData())
        let universalCapabilityKernel = try SeisUniversalCapabilityKernelSnapshot.validated(from: universalCapabilityKernelData())
        let actionDecisionContract = try SeisActionDecisionContractSnapshot.validated(from: actionDecisionContractData())
        let actionExecutionContract = try SeisActionExecutionContractSnapshot.validated(from: actionExecutionContractData())
        let agentRoleSchema = try SeisAgentRoleSchemaSnapshot.validated(from: agentRoleSchemaData())
        let agentPermissionMatrix = try SeisAgentPermissionMatrixSnapshot.validated(from: agentPermissionMatrixData())
        let activeMissionBoard = try SeisActiveMissionBoardSnapshot.validated(from: activeMissionBoardData())
        let longHorizonMissionKernel = try SeisLongHorizonMissionKernelSnapshot.validated(from: longHorizonMissionKernelData())
        let agiEvaluationProtocol = try SeisAGIEvaluationProtocolSnapshot.validated(from: agiEvaluationProtocolData())
        let fullStackContract = try SeisFullStackContractSnapshot.validated(from: fullStackContractData())
        let agentLaneStatus = try SeisAgentLaneStatusSnapshot.validated(from: agentLaneStatusData())
        let secondBrainContract = try SeisSecondBrainContractSnapshot.validated(from: secondBrainContractData())
        let platformLanguagePolicy = try SeisPlatformLanguagePolicySnapshot.validated(from: platformLanguagePolicyData())
        let platformDevelopmentTracks = try SeisPlatformDevelopmentTracksSnapshot.validated(from: platformDevelopmentTracksData())
        let requestedSoftwareStack = try SeisRequestedSoftwareStackSnapshot.validated(from: requestedSoftwareStackData())
        let obsidianSafeImport = try SeisObsidianSafeImportSnapshot.validated(from: obsidianSafeImportData())
        let readOnlyRouterRuntime = try SeisReadOnlyRouterRuntimeSnapshot.validated(from: readOnlyRouterRuntimeData())
        let technologyStack = try SeisTechnologyStackSnapshot.validated(from: technologyStackData())
        let modelFrontierEscalationPolicy = try SeisModelFrontierEscalationPolicySnapshot.validated(from: modelFrontierEscalationPolicyData())
        let agiSystemSource = try SeisAGISystemSourceSnapshot.validated(from: agiSystemSourceData())
        let projectIntake = try SeisProjectIntakeSnapshot.validated(from: projectIntakeData())
        let connectorCapabilityRegistry = try SeisConnectorCapabilityRegistrySnapshot.validated(from: connectorCapabilityRegistryData())
        let goalCommandCenterView = try SeisGoalCommandCenterViewSnapshot.validated(from: goalCommandCenterViewData())

        let report = SeisAICoreReadinessEvaluator().evaluate(
            snapshot: snapshot,
            capabilityMesh: mesh,
            promptEngine: promptEngine,
            handoffSnapshot: handoffs,
            workforceSnapshot: workforce,
            workforceTrainingSnapshot: workforceTraining,
            modelPlanningSnapshot: modelPlanning,
            versionPromotionSnapshot: versionPromotion,
            versionRegistrySnapshot: versionRegistry,
            subagentOperatingModelSnapshot: subagentOperatingModel,
            subagentRuntimeFixturesSnapshot: subagentRuntimeFixtures,
            subagentReviewLedgerSnapshot: subagentReviewLedger,
            modelScalingCouncilSnapshot: modelScalingCouncil,
            mcpRuntimeContractSnapshot: mcpRuntimeContract,
            pluginIntegrationSnapshot: pluginIntegration,
            providerRegistrySnapshot: providerRegistry,
            readOnlyRouterContractSnapshot: readOnlyRouterContract,
            languageModelIntakeSnapshot: languageModelIntake,
            languageModelTrainingCurriculumSnapshot: languageModelTrainingCurriculum,
            publicReadinessProgramSnapshot: publicReadinessProgram,
            commandCenterOperationsReadinessSnapshot: commandCenterOperationsReadiness,
            agiIndependentEvidenceLedgerSnapshot: agiIndependentEvidenceLedger,
            agiGitHubUserReadinessGatesSnapshot: agiGitHubUserReadinessGates,
            agiPublicReadinessEvidenceSnapshot: agiPublicReadinessEvidence,
            commandCenterKnowledgeSystemSnapshot: commandCenterKnowledgeSystem,
            dataSchemaRegistrySnapshot: dataSchemaRegistry,
            designComponentInventorySnapshot: designComponentInventory,
            universalCapabilityKernelSnapshot: universalCapabilityKernel,
            actionDecisionContractSnapshot: actionDecisionContract,
            actionExecutionContractSnapshot: actionExecutionContract,
            agentRoleSchemaSnapshot: agentRoleSchema,
            agentPermissionMatrixSnapshot: agentPermissionMatrix,
            activeMissionBoardSnapshot: activeMissionBoard,
            longHorizonMissionKernelSnapshot: longHorizonMissionKernel,
            agiEvaluationProtocolSnapshot: agiEvaluationProtocol,
            fullStackContractSnapshot: fullStackContract,
            agentLaneStatusSnapshot: agentLaneStatus,
            secondBrainContractSnapshot: secondBrainContract,
            platformLanguagePolicySnapshot: platformLanguagePolicy,
            technologyStackSnapshot: technologyStack,
            platformDevelopmentTracksSnapshot: platformDevelopmentTracks,
            requestedSoftwareStackSnapshot: requestedSoftwareStack,
            obsidianSafeImportSnapshot: obsidianSafeImport,
            readOnlyRouterRuntimeSnapshot: readOnlyRouterRuntime,
            modelFrontierEscalationPolicySnapshot: modelFrontierEscalationPolicy,
            agiSystemSourceSnapshot: agiSystemSource,
            projectIntakeSnapshot: projectIntake,
            connectorCapabilityRegistrySnapshot: connectorCapabilityRegistry,
            goalCommandCenterViewSnapshot: goalCommandCenterView
        )

        #expect(report.isReadyLocalDemo)
        #expect(report.status == .readyLocalDemo)
        #expect(report.evaluatorVersion == SeisAICoreReadinessEvaluator.evaluatorVersion)
        #expect(report.checks.map(\.id) == SeisAICoreReadinessEvaluator.expectedCheckIDs)
        #expect(report.passedCount == 51)
        #expect(report.failedCount == 0)
        #expect(report.truthBoundary.contains("not proof of live provider access"))
    }

    @Test func readinessReportCannotCallLocalDemoProductionReady() throws {
        let snapshot = try SeisAICoreRuntimeSnapshotContract.validated(from: runtimeSnapshotData())
        let workforce = try SeisAIWorkforceAssignmentSnapshot.validated(from: workforceData())
        let workforceTraining = try SeisAIWorkforceTrainingSnapshot.validated(from: workforceTrainingData())
        let modelPlanning = try SeisAIModelPlanningEvidenceSnapshot.validated(from: modelPlanningData())
        let versionPromotion = try SeisAICoreVersionPromotionSnapshot.validated(from: versionPromotionData())
        let versionRegistry = try SeisAICoreVersionRegistrySnapshot.validated(from: versionRegistryData())
        let subagentOperatingModel = try SeisAISubagentOperatingModelSnapshot.validated(from: subagentOperatingModelData())
        let subagentRuntimeFixtures = try SeisAISubagentRuntimeFixturesSnapshot.validated(from: subagentRuntimeFixturesData())
        let subagentReviewLedger = try SeisAISubagentReviewLedgerSnapshot.validated(from: subagentReviewLedgerData())
        let modelScalingCouncil = try SeisModelScalingSubagentCouncilSnapshot.validated(from: modelScalingCouncilData())
        let mcpRuntimeContract = try SeisAICoreMCPRuntimeContractSnapshot.validated(from: mcpRuntimeContractData())
        let pluginIntegration = try SeisAgentPluginIntegrationSnapshot.validated(from: pluginIntegrationData())
        let providerRegistry = try SeisAICoreProviderRegistrySnapshot.validated(from: providerRegistryData())
        let readOnlyRouterContract = try SeisAIReadOnlyModelRouterContractSnapshot.validated(from: readOnlyRouterContractData())
        let languageModelIntake = try SeisLanguageModelIntakeRegistrySnapshot.validated(from: languageModelIntakeData())
        let languageModelTrainingCurriculum = try SeisLanguageModelTrainingCurriculumSnapshot.validated(from: languageModelTrainingCurriculumData())
        let publicReadinessProgram = try SeisAIPublicReadinessProgramSnapshot.validated(from: publicReadinessProgramData())
        let commandCenterOperationsReadiness = try SeisCommandCenterOperationsReadinessSnapshot.validated(from: commandCenterOperationsReadinessData())
        let agiIndependentEvidenceLedger = try SeisAGIIndependentEvidenceLedgerSnapshot.validated(from: agiIndependentEvidenceLedgerData())
        let agiGitHubUserReadinessGates = try SeisAGIGitHubUserReadinessGatesSnapshot.validated(from: agiGitHubUserReadinessGatesData())
        let agiPublicReadinessEvidence = try SeisAGIPublicReadinessEvidenceSnapshot.validated(from: agiPublicReadinessEvidenceData())
        let commandCenterKnowledgeSystem = try SeisCommandCenterKnowledgeSystemSnapshot.validated(from: commandCenterKnowledgeSystemData())
        let dataSchemaRegistry = try SeisDataSchemaRegistrySnapshot.validated(from: dataSchemaRegistryData())
        let designComponentInventory = try SeisDesignComponentInventorySnapshot.validated(from: designComponentInventoryData())
        let universalCapabilityKernel = try SeisUniversalCapabilityKernelSnapshot.validated(from: universalCapabilityKernelData())
        let actionDecisionContract = try SeisActionDecisionContractSnapshot.validated(from: actionDecisionContractData())
        let actionExecutionContract = try SeisActionExecutionContractSnapshot.validated(from: actionExecutionContractData())
        let agentRoleSchema = try SeisAgentRoleSchemaSnapshot.validated(from: agentRoleSchemaData())
        let agentPermissionMatrix = try SeisAgentPermissionMatrixSnapshot.validated(from: agentPermissionMatrixData())
        let activeMissionBoard = try SeisActiveMissionBoardSnapshot.validated(from: activeMissionBoardData())
        let longHorizonMissionKernel = try SeisLongHorizonMissionKernelSnapshot.validated(from: longHorizonMissionKernelData())
        let agiEvaluationProtocol = try SeisAGIEvaluationProtocolSnapshot.validated(from: agiEvaluationProtocolData())
        let fullStackContract = try SeisFullStackContractSnapshot.validated(from: fullStackContractData())
        let agentLaneStatus = try SeisAgentLaneStatusSnapshot.validated(from: agentLaneStatusData())
        let secondBrainContract = try SeisSecondBrainContractSnapshot.validated(from: secondBrainContractData())
        let platformLanguagePolicy = try SeisPlatformLanguagePolicySnapshot.validated(from: platformLanguagePolicyData())
        let platformDevelopmentTracks = try SeisPlatformDevelopmentTracksSnapshot.validated(from: platformDevelopmentTracksData())
        let requestedSoftwareStack = try SeisRequestedSoftwareStackSnapshot.validated(from: requestedSoftwareStackData())
        let obsidianSafeImport = try SeisObsidianSafeImportSnapshot.validated(from: obsidianSafeImportData())
        let readOnlyRouterRuntime = try SeisReadOnlyRouterRuntimeSnapshot.validated(from: readOnlyRouterRuntimeData())
        let technologyStack = try SeisTechnologyStackSnapshot.validated(from: technologyStackData())
        let modelFrontierEscalationPolicy = try SeisModelFrontierEscalationPolicySnapshot.validated(from: modelFrontierEscalationPolicyData())
        let agiSystemSource = try SeisAGISystemSourceSnapshot.validated(from: agiSystemSourceData())
        let projectIntake = try SeisProjectIntakeSnapshot.validated(from: projectIntakeData())
        let connectorCapabilityRegistry = try SeisConnectorCapabilityRegistrySnapshot.validated(from: connectorCapabilityRegistryData())
        let goalCommandCenterView = try SeisGoalCommandCenterViewSnapshot.validated(from: goalCommandCenterViewData())
        let report = SeisAICoreReadinessEvaluator().evaluate(
            snapshot: snapshot,
            capabilityMesh: SeisAICapabilityMesh(snapshot: snapshot),
            promptEngine: SeisAIPromptEngine.defaultEngine,
            handoffSnapshot: SeisAGIAgentHandoffSnapshot.current(),
            workforceSnapshot: workforce,
            workforceTrainingSnapshot: workforceTraining,
            modelPlanningSnapshot: modelPlanning,
            versionPromotionSnapshot: versionPromotion,
            versionRegistrySnapshot: versionRegistry,
            subagentOperatingModelSnapshot: subagentOperatingModel,
            subagentRuntimeFixturesSnapshot: subagentRuntimeFixtures,
            subagentReviewLedgerSnapshot: subagentReviewLedger,
            modelScalingCouncilSnapshot: modelScalingCouncil,
            mcpRuntimeContractSnapshot: mcpRuntimeContract,
            pluginIntegrationSnapshot: pluginIntegration,
            providerRegistrySnapshot: providerRegistry,
            readOnlyRouterContractSnapshot: readOnlyRouterContract,
            languageModelIntakeSnapshot: languageModelIntake,
            languageModelTrainingCurriculumSnapshot: languageModelTrainingCurriculum,
            publicReadinessProgramSnapshot: publicReadinessProgram,
            commandCenterOperationsReadinessSnapshot: commandCenterOperationsReadiness,
            agiIndependentEvidenceLedgerSnapshot: agiIndependentEvidenceLedger,
            agiGitHubUserReadinessGatesSnapshot: agiGitHubUserReadinessGates,
            agiPublicReadinessEvidenceSnapshot: agiPublicReadinessEvidence,
            commandCenterKnowledgeSystemSnapshot: commandCenterKnowledgeSystem,
            dataSchemaRegistrySnapshot: dataSchemaRegistry,
            designComponentInventorySnapshot: designComponentInventory,
            universalCapabilityKernelSnapshot: universalCapabilityKernel,
            actionDecisionContractSnapshot: actionDecisionContract,
            actionExecutionContractSnapshot: actionExecutionContract,
            agentRoleSchemaSnapshot: agentRoleSchema,
            agentPermissionMatrixSnapshot: agentPermissionMatrix,
            activeMissionBoardSnapshot: activeMissionBoard,
            longHorizonMissionKernelSnapshot: longHorizonMissionKernel,
            agiEvaluationProtocolSnapshot: agiEvaluationProtocol,
            fullStackContractSnapshot: fullStackContract,
            agentLaneStatusSnapshot: agentLaneStatus,
            secondBrainContractSnapshot: secondBrainContract,
            platformLanguagePolicySnapshot: platformLanguagePolicy,
            technologyStackSnapshot: technologyStack,
            platformDevelopmentTracksSnapshot: platformDevelopmentTracks,
            requestedSoftwareStackSnapshot: requestedSoftwareStack,
            obsidianSafeImportSnapshot: obsidianSafeImport,
            readOnlyRouterRuntimeSnapshot: readOnlyRouterRuntime,
            modelFrontierEscalationPolicySnapshot: modelFrontierEscalationPolicy,
            agiSystemSourceSnapshot: agiSystemSource,
            projectIntakeSnapshot: projectIntake,
            connectorCapabilityRegistrySnapshot: connectorCapabilityRegistry,
            goalCommandCenterViewSnapshot: goalCommandCenterView
        )

        #expect(report.status.rawValue == "ready-local-demo")
        #expect(!report.truthBoundary.contains("production ready"))
        #expect(!report.truthBoundary.contains("trained model"))
    }

    private func runtimeSnapshotData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(
            contentsOf: root
                .appendingPathComponent("apps")
                .appendingPathComponent("seis-core")
                .appendingPathComponent("data")
                .appendingPathComponent("seis-ai-core-runtime-snapshot.json")
        )
    }

    private func workforceData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/ai-workforce-assignments.json"))
    }

    private func workforceTrainingData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-workforce-training-plan.json"))
    }

    private func modelPlanningData() throws -> [String: Data] {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Dictionary(uniqueKeysWithValues: SeisAIModelPlanningEvidenceSnapshot.canonicalIDs.map { id in
            let url = root.appendingPathComponent("content/development/\(id).json")
            return (id, try Data(contentsOf: url))
        })
    }

    private func versionPromotionData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-version-promotion-gates.json"))
    }

    private func versionRegistryData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-version-registry.json"))
    }

    private func subagentOperatingModelData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-subagent-operating-model.json"))
    }

    private func subagentRuntimeFixturesData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-subagent-runtime-fixtures.json"))
    }

    private func subagentReviewLedgerData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-subagent-review-ledger.json"))
    }

    private func modelScalingCouncilData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-model-scaling-subagent-council.json"))
    }

    private func mcpRuntimeContractData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-mcp-runtime-contract.json"))
    }

    private func pluginIntegrationData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-agent-plugin-integration.json"))
    }

    private func providerRegistryData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-provider-registry.json"))
    }

    private func readOnlyRouterContractData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-read-only-model-router-contract.json"))
    }

    private func languageModelIntakeData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-language-model-intake-registry.json"))
    }

    private func languageModelTrainingCurriculumData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-language-model-training-curriculum.json"))
    }

    private func publicReadinessProgramData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-public-readiness-program.json"))
    }

    private func commandCenterOperationsReadinessData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-command-center-operations-readiness.json"))
    }

    private func agiIndependentEvidenceLedgerData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-agi-independent-evidence-ledger.json"))
    }

    private func agiGitHubUserReadinessGatesData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-agi-github-user-readiness-gates.json"))
    }

    private func agiPublicReadinessEvidenceData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-agi-public-readiness-evidence.json"))
    }

    private func commandCenterKnowledgeSystemData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-command-center-knowledge-system.json"))
    }

    private func dataSchemaRegistryData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-data-schema-registry.json"))
    }

    private func designComponentInventoryData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-design-component-inventory.json"))
    }

    private func universalCapabilityKernelData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-universal-capability-kernel.json"))
    }

    private func actionDecisionContractData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-action-decision-contract.json"))
    }

    private func actionExecutionContractData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-action-execution-contract.json"))
    }

    private func agentRoleSchemaData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-agent-role-schema.json"))
    }

    private func agentPermissionMatrixData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-agent-permission-matrix.json"))
    }

    private func activeMissionBoardData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-active-mission-board.json"))
    }

    private func longHorizonMissionKernelData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-long-horizon-missions.json"))
    }

    private func agiEvaluationProtocolData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-agi-evaluation-protocol.json"))
    }

    private func fullStackContractData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-fullstack-contract.json"))
    }

    private func agentLaneStatusData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-agent-lane-status.json"))
    }

    private func secondBrainContractData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-second-brain-system.json"))
    }

    private func platformLanguagePolicyData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-platform-language-policy.json"))
    }

    private func technologyStackData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-technology-stack.json"))
    }

    private func requestedSoftwareStackData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/requested-software-stack.json"))
    }

    private func platformDevelopmentTracksData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-platform-development-tracks.json"))
    }

    private func obsidianSafeImportData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-obsidian-bridge-safe-import-contract.json"))
    }

    private func readOnlyRouterRuntimeData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-read-only-router-runtime.json"))
    }

    private func modelFrontierEscalationPolicyData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-model-frontier-escalation-policy.json"))
    }

    private func agiSystemSourceData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-agi-system.json"))
    }

    private func projectIntakeData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-project-intake-contract.json"))
    }

    private func connectorCapabilityRegistryData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/connector-capability-registry.json"))
    }

    private func goalCommandCenterViewData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-goal-command-center-view.json"))
    }
}
