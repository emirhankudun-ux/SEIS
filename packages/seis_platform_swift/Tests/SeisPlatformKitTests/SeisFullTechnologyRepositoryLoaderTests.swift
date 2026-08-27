import Foundation
import XCTest
@testable import SeisPlatformKit

final class SeisFullTechnologyRepositoryLoaderTests: XCTestCase {
    func testLoaderFindsRegistryFromNestedRepositoryPath() throws {
        let fixture = try RepositoryFixture()
        defer { fixture.remove() }

        let catalog = try SeisFullTechnologyRepositoryLoader().loadCatalog(
            startingAt: fixture.nestedDirectory
        )

        XCTAssertEqual(catalog.domainCount, 2)
        XCTAssertEqual(catalog.capabilityCount, 4)
        XCTAssertEqual(catalog.domain(id: "intelligence")?.name, "Intelligence")
        XCTAssertTrue(catalog.isReadOnlyByDefault)
    }

    func testLoaderReadsTheCanonicalRepositoryRegistry() throws {
        let sourceFile = URL(fileURLWithPath: #filePath)

        let catalog = try SeisFullTechnologyRepositoryLoader().loadCatalog(
            startingAt: sourceFile
        )

        XCTAssertEqual(catalog.registry.id, "seis-full-technology-registry")
        XCTAssertEqual(catalog.domainCount, 16)
        XCTAssertEqual(catalog.capabilityCount, 96)
        XCTAssertEqual(catalog.registry.requestedGoalID, "SEIS-GOAL-021")
        XCTAssertEqual(catalog.registry.canonicalGoalBinding.status, .unresolved)
    }

    func testLoaderReportsMissingRegistryWithoutSearchingOutsideStartingTree() throws {
        let emptyRoot = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString, isDirectory: true)
        try FileManager.default.createDirectory(
            at: emptyRoot,
            withIntermediateDirectories: true
        )
        defer { try? FileManager.default.removeItem(at: emptyRoot) }

        XCTAssertThrowsError(
            try SeisFullTechnologyRepositoryLoader().loadCatalog(startingAt: emptyRoot)
        ) { error in
            XCTAssertEqual(
                error as? SeisFullTechnologyRepositoryLoaderError,
                .registryNotFound(
                    startingAt: emptyRoot.standardizedFileURL.path,
                    relativePath: SeisFullTechnologyRepositoryLoader.registryRelativePath
                )
            )
        }
    }
}

private struct RepositoryFixture {
    let root: URL
    let nestedDirectory: URL

    init() throws {
        root = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString, isDirectory: true)
        nestedDirectory = root
            .appendingPathComponent("packages", isDirectory: true)
            .appendingPathComponent("example", isDirectory: true)
            .appendingPathComponent("Tests", isDirectory: true)

        let registryDirectory = root
            .appendingPathComponent("content", isDirectory: true)
            .appendingPathComponent("development", isDirectory: true)

        try FileManager.default.createDirectory(
            at: nestedDirectory,
            withIntermediateDirectories: true
        )
        try FileManager.default.createDirectory(
            at: registryDirectory,
            withIntermediateDirectories: true
        )
        try Data(Self.registryJSON.utf8).write(
            to: registryDirectory.appendingPathComponent("seis-full-technology-registry.json"),
            options: .atomic
        )
    }

    func remove() {
        try? FileManager.default.removeItem(at: root)
    }

    private static let registryJSON = """
    {
      "version": 2,
      "id": "seis-full-technology-registry",
      "requestedGoalId": "SEIS-GOAL-021",
      "canonicalGoalBinding": {
        "status": "unresolved",
        "reason": "Fixture goal binding is intentionally unresolved.",
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
}
