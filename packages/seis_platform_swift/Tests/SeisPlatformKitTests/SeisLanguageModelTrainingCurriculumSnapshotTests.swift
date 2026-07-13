import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Language Model Training Curriculum Snapshot")
struct SeisLanguageModelTrainingCurriculumSnapshotTests {
    @Test func canonicalCurriculumIsPlanningOnly() throws {
        let snapshot = try SeisLanguageModelTrainingCurriculumSnapshot.validated(from: curriculumData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.familyCandidates.count == 8)
        #expect(snapshot.trainingLanes.count == 5)
        #expect(snapshot.hardwareLanes.count == 3)
        #expect(snapshot.scalingTargets.count == 4)
        #expect(snapshot.curriculum.count == 4)
        #expect(snapshot.safeControls.count == 8)
        #expect(snapshot.nextApprovalNeeded.count == 4)
        #expect(snapshot.scalingTargets.allSatisfy { !$0.allowedRoute && !$0.runtimeAuthority })
    }

    @Test func unsafeScalingTargetCannotBecomeRouteable() {
        let target = SeisLanguageModelCurriculumScalingTarget(
            id: "unsafe",
            source: "test",
            status: "candidate",
            allowedRoute: true,
            trainingStatus: "not-started",
            runtimeAuthority: false,
            gate: "test"
        )

        #expect(target.validationIssues.contains { $0.contains("plan-only") })
    }

    private func curriculumData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-language-model-training-curriculum.json"))
    }
}
