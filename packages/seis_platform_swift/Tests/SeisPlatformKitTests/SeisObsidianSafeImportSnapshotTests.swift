import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Obsidian Safe Import Snapshot")
struct SeisObsidianSafeImportSnapshotTests {
    @Test func importRemainsMetadataOnlyAndPublicationBlocked() throws {
        let snapshot = try SeisObsidianSafeImportSnapshot.validated(from: contractData())

        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.allowedToday == [
            "document safe import requirements",
            "render repo-owned browser-local seed notes",
            "export browser-local Markdown snapshots under /home/seis/SecondBrain",
            "generate repo-owned dry-run manifest artifacts under reports/seis-public-demo",
            "validate no-secret and no-private-vault boundaries"
        ])
        #expect(snapshot.importPhaseCount == 5)
        #expect(snapshot.futureImportPhases.last?.status == "blocked")
        #expect(!snapshot.currentRuntime.privateVaultImportEnabled)
        #expect(!snapshot.currentRuntime.githubPublicationEnabled)
    }

    @Test func privateAndSecretBoundariesStayExplicit() throws {
        let snapshot = try SeisObsidianSafeImportSnapshot.validated(from: contractData())

        #expect(snapshot.dryRunManifestSchema.bodyImportPolicy == "metadata-only-by-default")
        #expect(snapshot.dryRunManifestSchema.privatePathPolicy == "hash-or-redact")
        #expect(snapshot.safeOutputPolicy.redactionRequired)
        #expect(snapshot.safeOutputPolicy.hashPrivatePaths)
        #expect(!snapshot.safeOutputPolicy.storeSecrets)
        #expect(snapshot.forbiddenActions.contains("sending imported note content to AI providers"))
        #expect(snapshot.requiredGates.contains("human approval before GitHub publication"))
    }

    private func contractData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-obsidian-bridge-safe-import-contract.json"))
    }
}
