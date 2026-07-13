import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Action Governance Contracts Snapshot")
struct SeisActionGovernanceContractsSnapshotTests {
    @Test func canonicalContractsAreMetadataOnly() throws {
        let decision = try SeisActionDecisionContractSnapshot.validated(from: decisionData())
        let execution = try SeisActionExecutionContractSnapshot.validated(from: executionData())

        #expect(decision.isMetadataOnly)
        #expect(execution.isMetadataOnly)
        #expect(decision.defaultDecision == "read-only")
        #expect(execution.executionPolicy.dryRun)
        #expect(execution.executionPolicy.maxCommandSeconds == 60)
        #expect(decision.ruleCount == 12)
    }

    @Test func unsafeExecutionPolicyIsRejected() {
        let policy = SeisActionExecutionPolicy(
            mode: "live",
            dryRun: false,
            maxCommandSeconds: 60,
            requiresExplicitApprovalFor: ["write"],
            redaction: SeisActionRedactionPolicy(enabled: true, patterns: ["secret"]),
            rollback: SeisActionRollbackPolicy(required: false, strategy: "none")
        )

        #expect(!policy.isSafe)
    }

    private func decisionData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-action-decision-contract.json"))
    }

    private func executionData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-action-execution-contract.json"))
    }
}
