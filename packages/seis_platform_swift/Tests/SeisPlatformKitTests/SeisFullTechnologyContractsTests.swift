import XCTest
@testable import SeisPlatformKit

final class SeisFullTechnologyContractsTests: XCTestCase {
    func testRegistryDecodesCanonicalShapeAndBuildsValidatedCatalog() throws {
        let registry = try JSONDecoder().decode(
            SeisFullTechnologyRegistry.self,
            from: Data(Self.validRegistryJSON.utf8)
        )

        let catalog = try SeisFullTechnologyCatalog(validating: registry)

        XCTAssertEqual(catalog.domainCount, 2)
        XCTAssertEqual(catalog.capabilityCount, 4)
        XCTAssertEqual(catalog.domain(id: "intelligence")?.name, "Intelligence")
        XCTAssertEqual(catalog.domain(id: "software")?.capabilities, ["code-studio", "test-lab"])
        XCTAssertTrue(catalog.isReadOnlyByDefault)
        XCTAssertEqual(registry.requestedGoalID, "SEIS-GOAL-021")
        XCTAssertEqual(registry.canonicalGoalBinding.status, .unresolved)
    }

    func testCatalogRejectsDuplicateDomainIdentifiers() throws {
        let registry = try JSONDecoder().decode(
            SeisFullTechnologyRegistry.self,
            from: Data(Self.duplicateDomainJSON.utf8)
        )

        XCTAssertThrowsError(try SeisFullTechnologyCatalog(validating: registry)) { error in
            XCTAssertEqual(
                error as? SeisFullTechnologyValidationError,
                .duplicateDomainID("intelligence")
            )
        }
    }

    func testCatalogRejectsDeclaredCountDrift() throws {
        let registry = try JSONDecoder().decode(
            SeisFullTechnologyRegistry.self,
            from: Data(Self.countDriftJSON.utf8)
        )

        XCTAssertThrowsError(try SeisFullTechnologyCatalog(validating: registry)) { error in
            XCTAssertEqual(
                error as? SeisFullTechnologyValidationError,
                .domainCountMismatch(declared: 3, actual: 2)
            )
        }
    }

    func testCatalogRejectsUnsafeDefaultPermissions() throws {
        let registry = try JSONDecoder().decode(
            SeisFullTechnologyRegistry.self,
            from: Data(Self.unsafeBoundaryJSON.utf8)
        )

        XCTAssertThrowsError(try SeisFullTechnologyCatalog(validating: registry)) { error in
            XCTAssertEqual(
                error as? SeisFullTechnologyValidationError,
                .unsafeDefaultBoundary(network: "allow", write: "deny")
            )
        }
    }

    private static let validRegistryJSON = """
    {
      "version": 2,
      "id": "seis-full-technology-registry",
      "requestedGoalId": "SEIS-GOAL-021",
      "canonicalGoalBinding": {
        "status": "unresolved",
        "reason": "Canonical goal record is unavailable in this fixture.",
        "source": "docs/SEIS_GOAL_TRACKING.md"
      },
      "mode": "registry-first-local-demo",
      "status": "prototype",
      "summary": {
        "domainCount": 2,
        "capabilityCount": 4,
        "implementationClasses": ["native-core", "native-tool", "adapter", "plugin", "research"],
        "maturityStates": ["concept", "prototype", "stable"]
      },
      "domains": [
        {"id": "intelligence", "name": "Intelligence", "capabilities": ["ai-core", "model-router"]},
        {"id": "software", "name": "Software", "capabilities": ["code-studio", "test-lab"]}
      ],
      "universalFrameworks": ["universal-inspector"],
      "coreSystems": ["seis-cube", "seis-workbench-composer"],
      "safetyBoundary": {
        "defaultNetwork": "deny",
        "defaultWrite": "deny",
        "externalMutationRequiresApproval": true,
        "credentialsInRegistry": false,
        "demoClaimsMustBeExplicit": true,
        "unverifiedCapabilitiesMustRemainUnavailableOrProposed": true
      }
    }
    """

    private static let duplicateDomainJSON = validRegistryJSON.replacingOccurrences(
        of: "{\"id\": \"software\", \"name\": \"Software\", \"capabilities\": [\"code-studio\", \"test-lab\"]}",
        with: "{\"id\": \"intelligence\", \"name\": \"Software\", \"capabilities\": [\"code-studio\", \"test-lab\"]}"
    )

    private static let countDriftJSON = validRegistryJSON.replacingOccurrences(
        of: "\"domainCount\": 2",
        with: "\"domainCount\": 3"
    )

    private static let unsafeBoundaryJSON = validRegistryJSON.replacingOccurrences(
        of: "\"defaultNetwork\": \"deny\"",
        with: "\"defaultNetwork\": \"allow\""
    )
}
