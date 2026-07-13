import Foundation
import XCTest
@testable import SeisPlatformKit

final class SeisModelFrontierEscalationPolicySnapshotTests: XCTestCase {
    func testSourcePolicyLoadsAndPreservesLocalDemoBoundary() throws {
        let snapshot = try SeisModelFrontierEscalationPolicySnapshot.loadAndValidate(
            from: sourceURL()
        )

        XCTAssertEqual(snapshot.id, "seis-model-frontier-escalation-policy")
        XCTAssertEqual(snapshot.version, "2026.06.24")
        XCTAssertEqual(snapshot.defaultRuntimeMode, "local-demo")
        XCTAssertFalse(snapshot.routeEligibleToday)
        XCTAssertEqual(snapshot.currentAllowedMode, "Local Demo and deterministic seed-model lab only")
        XCTAssertEqual(snapshot.escalationStages.count, 6)
        XCTAssertEqual(snapshot.routeEligibleStageCount, 1)
        XCTAssertEqual(snapshot.forbiddenClaims.count, 13)
        XCTAssertEqual(snapshot.humanApprovalRequiredFor.count, 12)
        XCTAssertTrue(snapshot.isMetadataOnly)
        XCTAssertTrue(snapshot.validationIssues.isEmpty)
    }

    func testOnlyDemoStageIsAllowedAndAllEscalationStagesAreBlocked() throws {
        let snapshot = try SeisModelFrontierEscalationPolicySnapshot.loadAndValidate(
            from: sourceURL()
        )

        XCTAssertEqual(snapshot.escalationStages.first?.id, "stage-0-local-demo")
        XCTAssertTrue(snapshot.escalationStages.first?.allowedToday == true)
        XCTAssertTrue(snapshot.escalationStages.first?.routeEligibleToday == true)

        for stage in snapshot.escalationStages.dropFirst() {
            XCTAssertTrue(stage.isBlocked, "Expected \(stage.id) to remain blocked")
            XCTAssertFalse(stage.allowedToday)
            XCTAssertFalse(stage.routeEligibleToday)
        }
    }

    func testSnapshotRetainsNonClaimsAndApprovalBoundary() throws {
        let snapshot = try SeisModelFrontierEscalationPolicySnapshot.loadAndValidate(
            from: sourceURL()
        )

        XCTAssertTrue(snapshot.truthBoundary.contains("does not download models"))
        XCTAssertTrue(snapshot.truthBoundary.contains("run inference"))
        XCTAssertTrue(snapshot.truthBoundary.contains("call providers"))
        XCTAssertTrue(snapshot.truthBoundary.contains("claim SEIS owns a trained"))
        XCTAssertTrue(snapshot.forbiddenClaims.contains(where: { $0.contains("achieved real AGI") }))
        XCTAssertTrue(snapshot.forbiddenClaims.contains(where: { $0.contains("routeable 512B weights") }))
        XCTAssertTrue(snapshot.humanApprovalRequiredFor.contains("runtime adapter execution"))
        XCTAssertTrue(snapshot.humanApprovalRequiredFor.contains("provider credential setup"))
        XCTAssertFalse(snapshot.fallbackPolicy.silentCloudFallbackAllowed)
        XCTAssertTrue(snapshot.fallbackPolicy.localOnlyModeMustBeRespected)
    }

    func testUnsafePolicyFailsValidation() throws {
        var policy = try loadSourceData()
        policy["routeEligibleToday"] = true

        let data = try JSONSerialization.data(withJSONObject: policy)
        let snapshot = try JSONDecoder().decode(
            SeisModelFrontierEscalationPolicySnapshot.self,
            from: data
        )

        XCTAssertThrowsError(try snapshot.validate()) { error in
            guard case let SeisModelFrontierEscalationPolicySnapshot.ValidationError.policyBoundaryViolation(issues) = error else {
                return XCTFail("Unexpected validation error: \(error)")
            }
            XCTAssertTrue(issues.contains(where: { $0.contains("route") }))
        }
    }

    func testMalformedSourceFailsWithInvalidJSON() {
        XCTAssertThrowsError(
            try SeisModelFrontierEscalationPolicySnapshot.decodeAndValidate(Data("{\"id\":".utf8))
        ) { error in
            guard case .invalidJSON = error else {
                return XCTFail("Unexpected error: \(error)")
            }
        }
    }

    private func sourceURL() -> URL {
        let packageRoot = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent()
            .deletingLastPathComponent()
        let repositoryRoot = packageRoot
            .deletingLastPathComponent()
            .deletingLastPathComponent()
        return SeisModelFrontierEscalationPolicySnapshot.sourceURL(repositoryRoot: repositoryRoot)
    }

    private func loadSourceData() throws -> [String: Any] {
        let data = try Data(contentsOf: sourceURL())
        return try XCTUnwrap(JSONSerialization.jsonObject(with: data) as? [String: Any])
    }
}
