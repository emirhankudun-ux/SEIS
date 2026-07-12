import Testing
@testable import SeisPlatformKit

struct SeisSecondBrainReviewOutcomeTests {
    @Test
    func nativeOutcomeSnapshotSummarizesSafeRecords() {
        let store = SeisSecondBrainReviewOutcomeHistoryStore()
        let record = SeisSecondBrainReviewOutcomeRecord(
            id: "native-review-1",
            assignmentId: "second-brain-brief-1",
            agentRole: "Architect Agent",
            pluginLaneId: "seis",
            brief: "Review the local context map and list evidence gaps.",
            outcome: .approvedForHumanFollowUp,
            recordedAt: "2026-07-12T00:00:00Z"
        )

        #expect(record.isTraceable)
        #expect(!record.externalActionAllowed)
        #expect(!record.agentExecutionAllowed)

        store.save(record)
        let snapshot = store.snapshot()
        #expect(snapshot.isReady)
        #expect(snapshot.count(for: .approvedForHumanFollowUp) == 1)
        #expect(snapshot.externalActionCount == 0)
        #expect(snapshot.agentExecutionCount == 0)
        #expect(snapshot.summaryLabel.contains("Approved for human follow-up: 1"))
    }

    @Test
    func unsafeNativeOutcomeRecordIsNotTraceable() {
        let record = SeisSecondBrainReviewOutcomeRecord(
            id: "unsafe-review",
            assignmentId: "assignment",
            agentRole: "Code Agent",
            pluginLaneId: "seis-code",
            brief: String(repeating: "x", count: 601),
            outcome: .draft,
            externalActionAllowed: true,
            recordedAt: "2026-07-12T00:00:00Z"
        )

        #expect(!record.isTraceable)
    }
}
