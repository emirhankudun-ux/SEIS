import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Sub-Agent Runtime Fixtures Snapshot")
struct SeisAISubagentRuntimeFixturesSnapshotTests {
    @Test func canonicalRuntimeFixturePackIsSafeAndMetadataOnly() throws {
        let snapshot = try SeisAISubagentRuntimeFixturesSnapshot.validated(from: fixturesData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.fixtures.count == 7)
        #expect(snapshot.roleSchema.maxDelegationDepth == 1)
        #expect(snapshot.permissionMatrixFixture.enabledNow == ["read-only", "plan-only"])
        #expect(snapshot.taskQueueFixture.writerPolicy == "single-writer")
        #expect(snapshot.cancellationFixture.cancellationTokenRequired)
        #expect(snapshot.approvalFixture.blanketApprovalAllowed == false)
        #expect(snapshot.redactionFixture.promptAndResponseLoggingDefault == "disabled")
        #expect(snapshot.executionLedgerFixture.sampleRecord.status == "cancelled")
    }

    @Test func unsafeExecutionLedgerSampleIsRejected() {
        let sample = SeisAISubagentExecutionLedgerSample(
            id: "unsafe",
            secretValuesStored: true,
            externalMutationPerformed: true,
            status: "completed"
        )
        #expect(!sample.isSafe)
    }

    private func fixturesData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-ai-core-subagent-runtime-fixtures.json"))
    }
}
