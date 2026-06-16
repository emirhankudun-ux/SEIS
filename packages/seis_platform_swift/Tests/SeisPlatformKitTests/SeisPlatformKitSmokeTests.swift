import XCTest
@testable import SeisPlatformKit

final class SeisPlatformKitSmokeTests: XCTestCase {
    func testPolicyCoverageDefaultsToExpectedPlatforms() {
        let policy = SeisPlatformPolicy.route(request: "Build Apple Native Shell and Windows tools")
        XCTAssertTrue(policy.contains(.macOS))
        XCTAssertTrue(policy.contains(.windows))
    }
}
