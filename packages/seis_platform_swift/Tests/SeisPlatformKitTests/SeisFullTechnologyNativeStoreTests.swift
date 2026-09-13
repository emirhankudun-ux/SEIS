import Foundation
import XCTest
@testable import SeisPlatformKit

final class SeisFullTechnologyNativeStoreTests: XCTestCase {
    func testStoreStartsIdleAndLoadsAValidatedExplorer() throws {
        let expectedCatalog = try Self.makeCatalog()
        let repositoryURL = URL(fileURLWithPath: "/tmp/SEIS")
        var receivedURL: URL?
        var store = SeisFullTechnologyNativeStore()

        XCTAssertEqual(store.phase, .idle)

        store.load(startingAt: repositoryURL) { url in
            receivedURL = url
            return expectedCatalog
        }

        XCTAssertEqual(receivedURL, repositoryURL)
        XCTAssertEqual(store.explorerState?.catalog, expectedCatalog)
        XCTAssertEqual(store.explorerState?.selectedDomain?.id, "intelligence")
        XCTAssertNil(store.failure)
    }

    func testStoreMapsMissingRegistryToActionableRedactedFailure() {
        let privateRoot = URL(fileURLWithPath: "/Users/emirhan/Secret/SEIS")
        var store = SeisFullTechnologyNativeStore()

        store.load(startingAt: privateRoot) { _ in
            throw SeisFullTechnologyRepositoryLoaderError.registryNotFound(
                startingAt: privateRoot.path,
                relativePath: SeisFullTechnologyRepositoryLoader.registryRelativePath
            )
        }

        XCTAssertEqual(store.phase, .failed(.registryUnavailable))
        XCTAssertEqual(store.failure?.title, "Registry unavailable")
        XCTAssertEqual(store.failure?.recovery, "Choose the SEIS repository root and try again.")
        XCTAssertFalse(store.failure?.detail.contains(privateRoot.path) ?? true)
        XCTAssertFalse(store.failure?.detail.contains("emirhan") ?? true)
    }

    func testStoreSupportsRetryAfterFailure() throws {
        let expectedCatalog = try Self.makeCatalog()
        let repositoryURL = URL(fileURLWithPath: "/tmp/SEIS")
        var attempts = 0
        var store = SeisFullTechnologyNativeStore()

        store.load(startingAt: repositoryURL) { _ in
            attempts += 1
            if attempts == 1 {
                throw SeisFullTechnologyRepositoryLoaderError.registryUnreadable(
                    path: "/private/seis-full-technology-registry.json"
                )
            }
            return expectedCatalog
        }
        XCTAssertEqual(store.phase, .failed(.registryUnreadable))

        store.load(startingAt: repositoryURL) { _ in
            attempts += 1
            return expectedCatalog
        }

        XCTAssertEqual(attempts, 2)
        XCTAssertEqual(store.explorerState?.catalog, expectedCatalog)
        XCTAssertNil(store.failure)
    }

    func testStoreRoutesSearchAndSelectionOnlyWhenLoaded() throws {
        let expectedCatalog = try Self.makeCatalog()
        var store = SeisFullTechnologyNativeStore()

        store.updateQuery("renderer")
        XCTAssertFalse(store.selectDomain(id: "graphics"))
        XCTAssertEqual(store.phase, .idle)

        store.load(startingAt: URL(fileURLWithPath: "/tmp/SEIS")) { _ in expectedCatalog }
        store.updateQuery("renderer")

        XCTAssertEqual(store.explorerState?.visibleDomains.map(\.id), ["graphics"])
        XCTAssertEqual(store.explorerState?.selectedDomain?.id, "graphics")
        XCTAssertFalse(store.selectDomain(id: "security"))
        XCTAssertTrue(store.selectDomain(id: "graphics"))
    }

    private static func makeCatalog() throws -> SeisFullTechnologyCatalog {
        let domains = [
            SeisFullTechnologyDomain(
                id: "intelligence",
                name: "AI & Agents",
                capabilities: ["model-router", "agent-runtime"]
            ),
            SeisFullTechnologyDomain(
                id: "graphics",
                name: "Graphics & Reality",
                capabilities: ["renderer", "shader-lab"]
            ),
            SeisFullTechnologyDomain(
                id: "security",
                name: "Security & Privacy",
                capabilities: ["permission-graph", "secret-boundary"]
            )
        ]

        let registry = SeisFullTechnologyRegistry(
            version: 2,
            id: "seis-full-technology-registry",
            requestedGoalID: "SEIS-GOAL-021",
            canonicalGoalBinding: SeisCanonicalGoalBinding(
                status: .unresolved,
                reason: "Test fixture",
                source: "test"
            ),
            mode: "registry-first-local-demo",
            status: "prototype",
            summary: SeisFullTechnologySummary(
                domainCount: domains.count,
                capabilityCount: domains.reduce(0) { $0 + $1.capabilities.count },
                implementationClasses: ["native-core", "native-tool", "adapter", "plugin", "research"],
                maturityStates: ["concept", "prototype", "stable"]
            ),
            domains: domains,
            universalFrameworks: ["universal-inspector"],
            coreSystems: ["seis-cube"],
            safetyBoundary: SeisFullTechnologySafetyBoundary(
                defaultNetwork: "deny",
                defaultWrite: "deny",
                externalMutationRequiresApproval: true,
                credentialsInRegistry: false,
                demoClaimsMustBeExplicit: true,
                unverifiedCapabilitiesMustRemainUnavailableOrProposed: true
            )
        )

        return try SeisFullTechnologyCatalog(validating: registry)
    }
}
