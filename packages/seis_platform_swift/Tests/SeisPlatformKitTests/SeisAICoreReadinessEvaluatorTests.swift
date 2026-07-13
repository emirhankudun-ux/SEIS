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

        let report = SeisAICoreReadinessEvaluator().evaluate(
            snapshot: snapshot,
            capabilityMesh: mesh,
            promptEngine: promptEngine,
            handoffSnapshot: handoffs
        )

        #expect(report.isReadyLocalDemo)
        #expect(report.status == .readyLocalDemo)
        #expect(report.evaluatorVersion == SeisAICoreReadinessEvaluator.evaluatorVersion)
        #expect(report.checks.map(\.id) == SeisAICoreReadinessEvaluator.expectedCheckIDs)
        #expect(report.passedCount == 7)
        #expect(report.failedCount == 0)
        #expect(report.truthBoundary.contains("not proof of live provider access"))
    }

    @Test func readinessReportCannotCallLocalDemoProductionReady() throws {
        let snapshot = try SeisAICoreRuntimeSnapshotContract.validated(from: runtimeSnapshotData())
        let report = SeisAICoreReadinessEvaluator().evaluate(
            snapshot: snapshot,
            capabilityMesh: SeisAICapabilityMesh(snapshot: snapshot),
            promptEngine: SeisAIPromptEngine.defaultEngine,
            handoffSnapshot: SeisAGIAgentHandoffSnapshot.current()
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
}
