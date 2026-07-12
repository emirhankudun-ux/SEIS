import Foundation
import Testing

import SeisPlatformKit

#if canImport(CoreData)
@Test("Core Data round trips safe Second Brain review outcomes")
func coreDataRoundTripsSafeSecondBrainReviewOutcome() throws {
    let store = try SeisSecondBrainReviewOutcomePersistentStore(inMemory: true)
    let record = SeisSecondBrainReviewOutcomeRecord(
        id: "review-persistent-1",
        assignmentId: "assignment-persistent-1",
        agentRole: "architect-agent",
        pluginLaneId: "apple-native",
        brief: "Review the native local-first contract.",
        outcome: .approvedForHumanFollowUp,
        requiresHumanApproval: true,
        externalActionAllowed: false,
        agentExecutionAllowed: false,
        recordedAt: "2026-07-12T00:00:00Z"
    )

    try store.save(record)

    #expect(try store.fetch(limit: 10) == [record])
    #expect(try store.snapshot(limit: 10).records == [record])
}

@Test("Core Data rejects unsafe Second Brain review outcomes")
func coreDataRejectsUnsafeSecondBrainReviewOutcome() throws {
    let store = try SeisSecondBrainReviewOutcomePersistentStore(inMemory: true)
    let unsafeRecord = SeisSecondBrainReviewOutcomeRecord(
        id: "review-persistent-unsafe",
        assignmentId: "assignment-persistent-unsafe",
        agentRole: "architect-agent",
        pluginLaneId: "apple-native",
        brief: String(repeating: "x", count: 601),
        outcome: .draft,
        requiresHumanApproval: true,
        externalActionAllowed: true,
        agentExecutionAllowed: false,
        recordedAt: "2026-07-12T00:00:00Z"
    )

    var didReject = false
    do {
        try store.save(unsafeRecord)
    } catch {
        didReject = true
    }

    #expect(didReject)
    #expect(try store.fetch(limit: 10).isEmpty)
}
#endif
