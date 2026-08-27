import XCTest
@testable import SeisPlatformKit

final class SeisFullTechnologyExplorerStateTests: XCTestCase {
    func testExplorerStartsWithAllDomainsAndStableFirstSelection() throws {
        let catalog = try Self.makeCatalog()
        let state = SeisFullTechnologyExplorerState(catalog: catalog)

        XCTAssertEqual(state.visibleDomains.map(\.id), ["intelligence", "graphics", "security"])
        XCTAssertEqual(state.selectedDomain?.id, "intelligence")
        XCTAssertEqual(state.resultSummary, "3 domains · 6 capabilities")
    }

    func testSearchMatchesDomainNamesIdentifiersAndCapabilitiesCaseInsensitively() throws {
        let catalog = try Self.makeCatalog()
        var state = SeisFullTechnologyExplorerState(catalog: catalog)

        state.updateQuery("ShAdEr")

        XCTAssertEqual(state.visibleDomains.map(\.id), ["graphics"])
        XCTAssertEqual(state.selectedDomain?.id, "graphics")
        XCTAssertEqual(state.resultSummary, "1 domain · 2 capabilities")
    }

    func testSearchReconcilesSelectionAndExposesAnExplicitEmptyState() throws {
        let catalog = try Self.makeCatalog()
        var state = SeisFullTechnologyExplorerState(catalog: catalog)

        XCTAssertTrue(state.selectDomain(id: "security"))
        XCTAssertEqual(state.selectedDomain?.id, "security")

        state.updateQuery("renderer")
        XCTAssertEqual(state.selectedDomain?.id, "graphics")

        state.updateQuery("not-a-real-capability")
        XCTAssertTrue(state.visibleDomains.isEmpty)
        XCTAssertNil(state.selectedDomain)
        XCTAssertEqual(state.resultSummary, "No matching domains")
    }

    func testUnknownDomainSelectionIsRejectedWithoutChangingState() throws {
        let catalog = try Self.makeCatalog()
        var state = SeisFullTechnologyExplorerState(catalog: catalog)

        XCTAssertFalse(state.selectDomain(id: "missing"))
        XCTAssertEqual(state.selectedDomain?.id, "intelligence")
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
