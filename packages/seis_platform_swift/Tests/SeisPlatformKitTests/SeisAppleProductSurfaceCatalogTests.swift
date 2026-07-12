import Testing
@testable import SeisPlatformKit

@Suite("SEIS Apple Product Surface Catalog")
struct SeisAppleProductSurfaceCatalogTests {
    @Test func defaultCatalogCoversEveryNamedProductSurface() {
        let catalog = SeisAppleProductSurfaceCatalog.defaultCatalog
        #expect(catalog.isValid)
        #expect(catalog.surfaces.map(\.id) == SeisAppleProductSurfaceCatalog.expectedSurfaceIDs)
        #expect(catalog.surfaces.count == 15)
        #expect(catalog.surfaces.allSatisfy { !$0.state.isExecutable })
    }

    @Test func catalogFilterFindsTermsAndPreservesExplicitBoundaries() {
        let catalog = SeisAppleProductSurfaceCatalog.defaultCatalog
        #expect(catalog.filtered(by: "cloud").map(\.id) == [.cloud])
        #expect(catalog.filtered(by: "agent").map(\.id) == [.aiCore, .agents])
        #expect(catalog.filtered(by: "planned").isEmpty)
        #expect(catalog.surfaces.contains { $0.id == .terminal && $0.boundary.contains("SSH") })
        #expect(catalog.surfaces.contains { $0.id == .aiCore && $0.state == .nativeLocalDemo })
    }

    @Test func invalidCatalogReportsDuplicateAndMissingMetadata() {
        let duplicate = SeisAppleProductSurface(id: .cloud, title: "", subtitle: "", systemImage: "", state: .planned, boundary: "", evidence: "")
        let catalog = SeisAppleProductSurfaceCatalog(surfaces: [duplicate, duplicate])
        #expect(!catalog.isValid)
        #expect(catalog.validationIssues.contains { $0.contains("duplicate surface IDs") })
        #expect(catalog.validationIssues.contains { $0.contains("surface title must not be empty") })
    }
}
