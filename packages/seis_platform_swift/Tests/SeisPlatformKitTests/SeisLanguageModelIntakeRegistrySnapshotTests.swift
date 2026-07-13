import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Language Model Intake Registry Snapshot")
struct SeisLanguageModelIntakeRegistrySnapshotTests {
    @Test func canonicalModelIntakeIsMetadataOnly() throws {
        let snapshot = try SeisLanguageModelIntakeRegistrySnapshot.validated(from: intakeData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.candidateModelFamilies.count == 8)
        #expect(snapshot.hardwareInstallLanes.count == 3)
        #expect(snapshot.trainingLanes.count == 5)
        #expect(snapshot.installPolicy.bulkInstallAllowed == false)
        #expect(snapshot.installPolicy.downloadAuthorized == false)
        #expect(snapshot.candidateModelFamilies.allSatisfy { $0.allowedToday == "metadata-only" })
        #expect(snapshot.candidateModelFamilies.allSatisfy { $0.installState == "not-installed-by-registry" })
        #expect(snapshot.trainingLanes.allSatisfy { !$0.foundationModelTraining || !$0.allowedToday })
    }

    @Test func unsafeCandidateFamilyIsRejected() {
        let family = SeisLanguageModelCandidateFamily(
            id: "unsafe",
            displayName: "Unsafe",
            representativeClasses: ["test"],
            source: "test",
            licenseReviewStatus: "required",
            allowedToday: "runtime",
            installState: "installed",
            trainingUse: "authorized",
            notes: ["test"]
        )
        #expect(family.validationIssues.contains { $0.contains("metadata-only") })
    }

    private func intakeData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-language-model-intake-registry.json"))
    }
}
