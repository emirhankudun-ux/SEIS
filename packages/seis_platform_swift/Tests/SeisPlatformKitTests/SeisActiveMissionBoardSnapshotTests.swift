import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Active Mission Board Snapshot")
struct SeisActiveMissionBoardSnapshotTests {
    @Test func canonicalBoardIsMetadataOnly() throws {
        let snapshot = try SeisActiveMissionBoardSnapshot.validated(from: boardData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.summary.cardCount == 30)
        #expect(snapshot.summary.nowCount == 10)
        #expect(snapshot.summary.nextCount == 10)
        #expect(snapshot.summary.queuedCount == 10)
        #expect(snapshot.firstExecutionCards.count == 3)
    }

    @Test func runtimeInstallPolicyRemainsBounded() throws {
        let snapshot = try SeisActiveMissionBoardSnapshot.validated(from: boardData())

        #expect(snapshot.installPolicy.default == "do_not_install_new_runtime_for_language_percentage")
        #expect(snapshot.cards.allSatisfy { $0.runtimeInstallPolicy == snapshot.installPolicy.default })
    }

    private func boardData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-active-mission-board.json"))
    }
}
