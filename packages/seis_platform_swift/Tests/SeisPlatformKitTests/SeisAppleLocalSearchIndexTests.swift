import Testing
@testable import SeisPlatformKit

@Suite("SEIS Apple Local Search Index")
struct SeisAppleLocalSearchIndexTests {
    @Test func defaultIndexContainsProductsAndSafeEvidenceDocuments() {
        let index = SeisAppleLocalSearchIndex.defaultIndex

        #expect(index.isValid)
        #expect(index.documents.count == 18)
        #expect(index.documents.filter { $0.kind == .productSurface }.count == 15)
        #expect(index.documents.filter { $0.kind == .runtimeEvidence }.count == 3)
    }

    @Test func searchRanksSpecificProductTermsDeterministically() {
        let index = SeisAppleLocalSearchIndex.defaultIndex

        let results = index.search("cloud ssh", scope: .all)

        #expect(!results.isEmpty)
        #expect(results.first?.id == "cloud")
        #expect(results.first?.matchedTerms.contains("cloud") == true)
        #expect(results.first?.matchedTerms.contains("ssh") == true)
        #expect(results.map(\.score) == results.sorted { $0 > $1 })
    }

    @Test func searchScopesSeparateProductsFromEvidence() {
        let index = SeisAppleLocalSearchIndex.defaultIndex

        #expect(index.search("provider", scope: .products).isEmpty)
        #expect(index.search("provider", scope: .evidence).map(\.id) == ["evidence:ai-core-runtime"])
        #expect(index.search("seis-code", scope: .products).map(\.id) == ["code"])
        #expect(index.search("", scope: .all).isEmpty)
    }

    @Test func invalidIndexReportsDuplicateDocumentsAndMissingFields() {
        let invalid = SeisAppleLocalSearchDocument(
            id: "duplicate",
            title: "",
            summary: "",
            kind: .productSurface,
            state: "",
            keywords: [],
            boundary: "",
            evidence: ""
        )
        let index = SeisAppleLocalSearchIndex(documents: [invalid, invalid])

        #expect(!index.isValid)
        #expect(index.validationIssues.contains { $0.contains("duplicate document IDs") })
        #expect(index.validationIssues.contains { $0.contains("document title must not be empty") })
    }
}
