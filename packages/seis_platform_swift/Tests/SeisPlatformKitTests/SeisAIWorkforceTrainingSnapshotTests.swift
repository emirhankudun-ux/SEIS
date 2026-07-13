import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Workforce Training Snapshot")
struct SeisAIWorkforceTrainingSnapshotTests {
    @Test func canonicalTrainingPlanDecodesAsLocalMetadataOnly() throws {
        let snapshot = try SeisAIWorkforceTrainingSnapshot.validated(from: trainingData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.trainerRoles.count == 10)
        #expect(snapshot.trainingLoops.count == 7)
        #expect(snapshot.modelTargets.count == 4)
        #expect(snapshot.qualityGate == "npm run check:seis-ai-workforce-training")
        #expect(snapshot.automationCommand == "npm run automation:seis-ai-workforce-training")
        #expect(snapshot.trainerRoles.contains { $0.id == "qwen" && $0.routeStatus == "installed" })
        #expect(snapshot.trainerRoles.contains { $0.id == "claude" && $0.outputStatus == "disabled until configured" })
        #expect(snapshot.modelTargets.allSatisfy { !$0.runtimeAuthority })
        #expect(snapshot.truthBoundary.contains("no live provider calls"))
    }

    @Test func trainingPlanRejectsRuntimeAuthorityAndLiveTrainerFlags() {
        let role = SeisAIWorkforceTrainingTrainerRole(
            id: "unsafe",
            displayName: "Unsafe",
            routeStatus: "installed",
            trainingRole: "test",
            allowedContribution: "test",
            secretAccessAllowed: false,
            liveProviderCallAllowed: true,
            externalTrainingAllowed: false,
            outputStatus: "candidate"
        )
        let target = SeisAIWorkforceTrainingModelTarget(
            id: "unsafe-model",
            purpose: "test",
            datasetPath: "data.json",
            artifactPath: "model.json",
            trainingCommand: "npm run automation:test",
            validationCommand: "npm run check:test",
            runtimeAuthority: true
        )
        let snapshot = SeisAIWorkforceTrainingSnapshot(
            id: "seis-ai-workforce-training-plan",
            version: "test",
            status: "active-local-seed-training-contract",
            updatedAt: "2026-07-13",
            purpose: "test",
            qualityGate: "npm run check:test",
            automationCommand: "npm run automation:test",
            sourceOfTruth: sourceOfTruth(),
            truthBoundary: "No live provider calls, no credential validation, no SSH, no deployment, no external dataset download, no cloud fine-tuning.",
            trainingMeaning: SeisAIWorkforceTrainingMeaning(currentMeaning: "test", notMeaning: ["cloud fine-tuning"]),
            currentLauncherEvidence: SeisAIWorkforceTrainingLauncherEvidence(command: "npm run ai -- list", observedDate: "2026-07-13", notes: ["test"], installedRoutes: ["codex"], missingOrDisabledRoutes: ["claude"]),
            trainerRoles: [role],
            trainingLoops: [SeisAIWorkforceTrainingLoop(id: "loop", owner: "codex", input: "test", output: "test", acceptanceGate: "test")],
            modelTargets: [target],
            safetyRules: ["test"],
            acceptanceGates: ["test"]
        )

        #expect(!snapshot.isValid)
        #expect(snapshot.validationIssues.contains { $0.contains("live and credential-free") })
        #expect(snapshot.validationIssues.contains { $0.contains("runtimeAuthority false") })
    }

    private func trainingData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-workforce-training-plan.json"))
    }

    private func sourceOfTruth() -> SeisAIWorkforceTrainingSourceOfTruth {
        SeisAIWorkforceTrainingSourceOfTruth(
            aiCoreDoc: "ai-core.md",
            trainingDoc: "training.md",
            workforceAssignments: "assignments.json",
            providerRegistry: "providers.json",
            modelFamilyRegistry: "family.json",
            modelPromotionPolicy: "promotion.json",
            modelBenchmarkSuite: "benchmark.json",
            languageModelIntakeRegistry: "intake.json"
        )
    }
}
