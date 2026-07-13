import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Second Brain Contract Snapshot")
struct SeisSecondBrainContractSnapshotTests {
    @Test func canonicalBrainRemainsLocalMetadataOnly() throws {
        let snapshot = try SeisSecondBrainContractSnapshot.validated(from: contractData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.vaultNoteCount == 6)
        #expect(snapshot.managedLaneCount == 9)
        #expect(snapshot.installedAiProfiles.count == 6)
        #expect(snapshot.autonomousAgentRoster.count == 13)
        #expect(snapshot.vaultRoot == "/home/seis/SecondBrain")
        #expect(snapshot.vaultNotes.allSatisfy(\.isLocalNote))
    }

    @Test func privateVaultAndPublishBoundariesStayClosed() throws {
        let snapshot = try SeisSecondBrainContractSnapshot.validated(from: contractData())

        #expect(snapshot.obsidianBridge.status == "planned")
        #expect(snapshot.obsidianBridge.forbiddenToday.contains("import private Obsidian vaults"))
        #expect(snapshot.securityBoundary.requiresHumanReviewBeforePublicUse)
        #expect(!snapshot.securityBoundary.storesSecrets)
        #expect(!snapshot.securityBoundary.providerCalls)
        #expect(!snapshot.securityBoundary.githubMutation)
        #expect(snapshot.pipeline.contains { $0.step == "Publish" && $0.status == "blocked-until-approved" })
    }

    private func contractData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-second-brain-system.json"))
    }
}
