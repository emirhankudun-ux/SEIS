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
            languageModelTrainingCurriculumSnapshot: languageModelTrainingCurriculum
        )

        #expect(report.isReadyLocalDemo)
        #expect(report.status == .readyLocalDemo)
        #expect(report.evaluatorVersion == SeisAICoreReadinessEvaluator.evaluatorVersion)
        #expect(report.checks.map(\.id) == SeisAICoreReadinessEvaluator.expectedCheckIDs)
        #expect(report.passedCount == 23)
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
            languageModelTrainingCurriculumSnapshot: languageModelTrainingCurriculum
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
}
