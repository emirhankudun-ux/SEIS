import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Execution Evidence Ledger")
struct SeisAIExecutionEvidenceLedgerTests {
    @Test func ledgerIsBoundedAndKeepsDeterministicSequenceOrder() async {
        let ledger = SeisAIExecutionEvidenceLedger(capacity: 2)
        let plan = SeisAIPersonalLaneTaskPlan(
            id: "personal-lane-plan:one:seis",
            taskID: "one",
            laneID: "seis",
            outcome: .planned,
            plannedActions: [.prepareReadOnlyPlan],
            blockedActions: [],
            declaredMCPToolIDs: ["seis_hub_plan"],
            requestedMCPToolIDs: ["seis_hub_plan"],
            qualityGate: "ai_core_snapshot_validation",
            validationRules: ["no-live-mcp-invocation"],
            requiredApprovals: ["human approval before mutation"],
            blockedReasons: []
        )

        let first = await ledger.recordPersonalLanePlan(plan, inputReferenceCount: 1)
        let second = await ledger.recordPersonalLanePlan(plan, inputReferenceCount: 2)
        let third = await ledger.recordPersonalLanePlan(plan, inputReferenceCount: 3)
        let snapshot = await ledger.snapshot()

        #expect(first.sequence == 1)
        #expect(second.sequence == 2)
        #expect(third.sequence == 3)
        #expect(snapshot.map(\.sequence) == [2, 3])
        #expect(snapshot.map(\.id) == ["evidence:2:lane:seis", "evidence:3:lane:seis"])
        #expect(snapshot.allSatisfy { $0.isReadOnly && $0.localOnly && $0.respectsSecretBoundary })
    }

    @Test func runtimeRecordsPlansAndLocalDemoExecutionWithoutRawContent() async throws {
        let ledger = SeisAIExecutionEvidenceLedger()
        let runtime = try SeisAIRuntime.localDemo(
            snapshotData: runtimeSnapshotData(),
            evidenceLedger: ledger
        )
        let plan = await runtime.planPersonalLaneTask(
            SeisAIPersonalLaneTaskRequest(
                id: "evidence-plan",
                laneID: "seis-data",
                purpose: "This purpose must never be copied into evidence.",
                requestedActions: [.inspectCapabilityContract, .prepareReadOnlyPlan],
                requestedMCPToolIDs: ["seis_data_plan"],
                inputReferences: ["apps/seis-core/data/seis-ai-core-runtime-snapshot.json"]
            )
        )
        let request = SeisAIProviderExecutionRequest(
            id: "evidence-execution",
            routing: SeisAIRoutingRequest(
                id: "evidence-execution",
                taskType: "evidence-plan",
                capability: "planning"
            )
        )
        let execution = await runtime.execute(request)
        let evidence = await runtime.evidenceSnapshot()

        #expect(plan.outcome == .planned)
        #expect(execution.outcome == .completedLocalDemo)
        #expect(evidence.map(\.kind) == [.personalLanePlan, .providerExecution])
        #expect(evidence[0].subjectID == "lane:seis-data")
        #expect(evidence[0].inputReferenceCount == 1)
        #expect(evidence[0].blockedReasonCount == 0)
        #expect(evidence[1].providerID == SeisAIProviderDescriptor.localDemo.id)
        #expect(evidence[1].modelIdentifier == SeisAIProviderDescriptor.localDemo.modelIdentifier)
        #expect(evidence[1].executionPerformed)
        #expect(evidence[1].adapterInvocationPerformed)
        #expect(evidence[1].localOnly)
        #expect(evidence[1].respectsSecretBoundary)

        let encoded = try JSONEncoder().encode(evidence)
        let encodedText = String(decoding: encoded, as: UTF8.self)
        #expect(!encodedText.contains("This purpose must never be copied into evidence."))
        #expect(!encodedText.contains("output"))
    }

    @Test func explicitRouteInspectionRecordsOnlyRedactedDecisionMetadata() async throws {
        let ledger = SeisAIExecutionEvidenceLedger()
        let runtime = try SeisAIRuntime(evidenceLedger: ledger)
        let decision = await runtime.inspectRoute(
            SeisAIRoutingRequest(
                id: "route-inspection-test",
                taskType: "repository readiness plan must not be stored",
                capability: "planning",
                privacyMode: .localOnly,
                contentClassification: .repositoryMetadata,
                localOnly: true,
                fallbackPolicy: .none
            )
        )
        let evidence = await runtime.evidenceSnapshot()
        let encoded = try JSONEncoder().encode(evidence)
        let encodedText = String(decoding: encoded, as: UTF8.self)

        #expect(decision.outcome == .localDemoReady)
        #expect(evidence.count == 1)
        #expect(evidence[0].kind == .routeInspection)
        #expect(evidence[0].outcome == .routeInspection)
        #expect(evidence[0].routeOutcome == .localDemoReady)
        #expect(evidence[0].providerID == SeisAIProviderDescriptor.localDemo.id)
        #expect(evidence[0].modelIdentifier == SeisAIProviderDescriptor.localDemo.modelIdentifier)
        #expect(evidence[0].isReadOnly)
        #expect(evidence[0].localOnly)
        #expect(evidence[0].respectsSecretBoundary)
        #expect(!encodedText.contains("repository readiness plan must not be stored"))
        #expect(!encodedText.contains("route-inspection-test"))
    }

    @Test func blockedExecutionIsRecordedAsBlockedMetadata() async throws {
        let ledger = SeisAIExecutionEvidenceLedger()
        let runtime = try SeisAIRuntime(evidenceLedger: ledger)
        let result = await runtime.execute(
            SeisAIProviderExecutionRequest(
                id: "blocked-evidence",
                routing: SeisAIRoutingRequest(
                    id: "blocked-evidence",
                    taskType: "blocked route",
                    capability: "planning",
                    requestedProviderID: "missing-provider"
                )
            )
        )
        let evidence = await runtime.evidenceSnapshot()

        #expect(result.outcome == .blocked)
        #expect(evidence.count == 1)
        #expect(evidence[0].outcome == .blocked)
        #expect(evidence[0].blockedReasonCount > 0)
        #expect(!evidence[0].executionPerformed)
        #expect(!evidence[0].adapterInvocationPerformed)
        #expect(evidence[0].providerCallPerformed == false)
        #expect(evidence[0].networkCallPerformed == false)
        #expect(evidence[0].respectsSecretBoundary)
    }

    @Test func ledgerPersistsOnlyRedactedEvidenceAcrossInstances() async throws {
        let storageURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("seis-evidence-\(UUID().uuidString)")
            .appendingPathComponent("evidence.json")
        defer { try? FileManager.default.removeItem(at: storageURL.deletingLastPathComponent()) }

        let plan = SeisAIPersonalLaneTaskPlan(
            id: "persistent-plan",
            taskID: "user-provided-task-id",
            laneID: "seis-design",
            outcome: .blocked,
            plannedActions: [],
            blockedActions: [.invokeMCP],
            declaredMCPToolIDs: ["seis_design_plan"],
            requestedMCPToolIDs: ["seis_design_plan"],
            qualityGate: "plugin_governance",
            validationRules: ["no-live-mcp-invocation"],
            requiredApprovals: ["human approval"],
            blockedReasons: ["user private content must never be copied into evidence"]
        )
        let firstLedger = SeisAIExecutionEvidenceLedger(storageURL: storageURL)
        let firstState = await firstLedger.persistenceState
        _ = await firstLedger.recordPersonalLanePlan(plan, inputReferenceCount: 1)

        let restoredLedger = SeisAIExecutionEvidenceLedger(storageURL: storageURL)
        let restoredState = await restoredLedger.persistenceState
        let restoredEvidence = await restoredLedger.snapshot()
        let encoded = try JSONEncoder().encode(restoredEvidence)
        let encodedText = String(decoding: encoded, as: UTF8.self)

        #expect(firstState == .localFile)
        #expect(restoredState == .localFile)
        #expect(restoredEvidence.count == 1)
        #expect(restoredEvidence[0].subjectID == "lane:seis-design")
        #expect(!encodedText.contains("user-provided-task-id"))
        #expect(!encodedText.contains("user private content"))

        await restoredLedger.clear()
        #expect(await restoredLedger.snapshot().isEmpty)
    }

    private func runtimeSnapshotData() throws -> Data {
        let root = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
        return try Data(
            contentsOf: root
                .appendingPathComponent("apps/seis-core/data/seis-ai-core-runtime-snapshot.json")
        )
    }
}
