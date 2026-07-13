import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AGI System Source Snapshot")
struct SeisAGISystemSourceSnapshotTests {
    @Test func trackedSourceIsMetadataOnlyAndCountsAreSourceBacked() throws {
        let snapshot = try SeisAGISystemSourceSnapshot.validated(from: sourceData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.id == "seis-agi-system")
        #expect(snapshot.version == 1)
        #expect(snapshot.generatedAt == "2026-06-12")
        #expect(snapshot.mode == "human_owned_agi_inspired_engineering_system")
        #expect(snapshot.masterGoal.hasSafeClaimBoundary)
        #expect(snapshot.masterGoal.claimBoundary.contains("does not claim autonomous general intelligence"))
        #expect(snapshot.priorityDomainCount == 20)
        #expect(snapshot.domainTaxonomyCount == 150)
        #expect(snapshot.domainLaneCount == 125)
        #expect(snapshot.subsystemCount == 10)
        #expect(snapshot.pluginCapabilityLaneCount == 5)
        #expect(snapshot.qualityGateCount == 13)
        #expect(snapshot.platformStrategy.priority == "apple_first_when_practical")
        #expect(snapshot.platformStrategy.javascriptTargetPercent == 21.0)
        #expect(snapshot.tokenEfficiency.targetSavingsPercent == 60)
        #expect(snapshot.memoryCheckpointCount == 5)
        #expect(snapshot.planningLoopCount == 4)
        #expect(snapshot.memoryPlanning.storagePolicy.contains("never persist secrets"))
        #expect(snapshot.releaseMilestoneCount == 3)
        #expect(snapshot.implementationRootCount == 10)
        #expect(snapshot.implementation.sourceContract == "content/development/seis-agi-system.json")
        #expect(snapshot.implementation.swiftContract == "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift")
        #expect(snapshot.implementation.generator == "scripts/create-seis-agi-system.py")
    }

    @Test func unsafeClaimBoundaryMutationIsRejected() throws {
        var root = try #require(JSONSerialization.jsonObject(with: sourceData()) as? [String: Any])
        var masterGoal = try #require(root["masterGoal"] as? [String: Any])
        masterGoal["claimBoundary"] = "SEIS claims autonomous general intelligence."
        root["masterGoal"] = masterGoal
        let mutatedData = try JSONSerialization.data(withJSONObject: root, options: [.sortedKeys])

        do {
            _ = try SeisAGISystemSourceSnapshot.validated(from: mutatedData)
            Issue.record("An unsafe AGI claim boundary was accepted")
        } catch let error as SeisAGISystemSourceSnapshotError {
            guard case let .invalidSnapshot(issues) = error else {
                Issue.record("Unexpected source snapshot error: \(error)")
                return
            }
            #expect(issues.contains { $0.contains("claim boundary") })
        }
    }

    private func sourceData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-agi-system.json"))
    }
}
