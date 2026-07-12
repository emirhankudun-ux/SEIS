import Foundation
import Testing

import SeisPlatformKit

private func repositoryTestRecord(id: String = "repository-review-1") -> SeisSecondBrainReviewOutcomeRecord {
    SeisSecondBrainReviewOutcomeRecord(
        id: id,
        assignmentId: "repository-assignment-1",
        agentRole: "apple-platform-agent",
        pluginLaneId: "apple-native",
        brief: "Review the shared Apple-native repository seam.",
        outcome: .approvedForHumanFollowUp,
        requiresHumanApproval: true,
        externalActionAllowed: false,
        agentExecutionAllowed: false,
        recordedAt: "2026-07-12T00:00:00Z"
    )
}

@Test("repository keeps an in-memory fallback available")
func repositoryKeepsInMemoryFallbackAvailable() throws {
    let repository = SeisSecondBrainReviewOutcomeRepository()
    let record = repositoryTestRecord()

    try repository.save(record)

    #expect(repository.storageMode == .inMemory)
    #expect(try repository.snapshot().records == [record])
}

@Test("repository rejects unsafe records before writing")
func repositoryRejectsUnsafeRecordsBeforeWriting() throws {
    let repository = SeisSecondBrainReviewOutcomeRepository()
    let unsafeRecord = SeisSecondBrainReviewOutcomeRecord(
        id: "repository-review-unsafe",
        assignmentId: "repository-assignment-unsafe",
        agentRole: "apple-platform-agent",
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
        try repository.save(unsafeRecord)
    } catch {
        didReject = true
    }

    #expect(didReject)
    #expect(try repository.snapshot().records.isEmpty)
}

#if canImport(CoreData)
@Test("repository can select the Core Data backend")
func repositoryCanSelectCoreDataBackend() throws {
    let repository = try SeisSecondBrainReviewOutcomeRepository.makePersistent(inMemory: true)
    let record = repositoryTestRecord(id: "repository-core-data-1")

    try repository.save(record)

    #expect(repository.storageMode == .coreData)
    #expect(try repository.snapshot().records == [record])
    #expect(try repository.hydrate().records == [record])
}
#endif
