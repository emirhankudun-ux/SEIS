import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Technology Stack Snapshot")
struct SeisTechnologyStackSnapshotTests {
    @Test func sourceLanguagesAndEcosystemTechnologyCountsRemainBounded() throws {
        let snapshot = try SeisTechnologyStackSnapshot.validated(from: stackData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.sourceLanguageCount == 60)
        #expect(snapshot.ecosystemGroups.count == 7)
        #expect(snapshot.ecosystemTechnologyCount == 143)
        #expect(snapshot.summary.requestedCoreStackCount == 6)
    }

    @Test func githubLanguageSurfaceStaysSeparateFromTechnologyStack() throws {
        let snapshot = try SeisTechnologyStackSnapshot.validated(from: stackData())

        #expect(snapshot.sourceLanguageCatalog.allSatisfy(\.isSourceLanguage))
        #expect(snapshot.summary.githubFocusedPanels == ["JavaScript", "TypeScript", "Objective-C", "Other"])
        #expect(snapshot.summary.githubLanguagePolicy.contains("Only real source languages belong"))
        #expect(snapshot.governance.contains(where: { $0.contains("Do not add placeholder code") }))
        #expect(snapshot.sourceReferences.requestedSoftwareStack == "content/development/requested-software-stack.json")
    }

    private func stackData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-technology-stack.json"))
    }
}
