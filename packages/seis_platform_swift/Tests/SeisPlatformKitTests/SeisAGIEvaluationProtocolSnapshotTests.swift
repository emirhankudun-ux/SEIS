import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS AGI Evaluation Protocol Snapshot")
struct SeisAGIEvaluationProtocolSnapshotTests {
    @Test func canonicalProtocolRemainsMetadataOnly() throws {
        let snapshot = try SeisAGIEvaluationProtocolSnapshot.validated(from: protocolData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.minimumEvidenceCount == 20)
        #expect(snapshot.publicResearchBaseline.sources.count == 10)
        #expect(snapshot.sourceDerivedReadinessGates.count == 4)
        #expect(snapshot.evaluationDimensions.count == 11)
        #expect(snapshot.requiredReviewers.count == 11)
    }

    @Test func protocolCannotPromoteClaimsOrRoutes() throws {
        let snapshot = try SeisAGIEvaluationProtocolSnapshot.validated(from: protocolData())

        #expect(snapshot.evaluationRunStatus == "not-run")
        #expect(snapshot.benchmarkStatus == "not-run")
        #expect(snapshot.trainingStatus == "not-started")
        #expect(snapshot.promotionDecisionModel.defaultDecision == "blocked")
        #expect(!snapshot.promotionDecisionModel.silentPromotionAllowed)
        #expect(!snapshot.promotionDecisionModel.selfApprovalAllowed)
        #expect(!snapshot.promotionDecisionModel.providerWrapperPromotionAllowed)
        #expect(snapshot.promotionDecisionModel.publicClaimRequiresExternalReview)
        #expect(snapshot.promotionDecisionModel.routeEligibilityRequiresHumanApproval)
    }

    private func protocolData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-agi-evaluation-protocol.json"))
    }
}
