import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Focus Mode Learning Contract Snapshot")
struct SeisFocusModeLearningContractSnapshotTests {
    @Test func sourceContractIsActiveAndEvidenceBacked() throws {
        let snapshot = try SeisFocusModeLearningContractSnapshot.validated(from: sourceData())

        #expect(snapshot.id == "seis-focus-mode-learning-contract")
        #expect(snapshot.name == "SEIS Focus Mode")
        #expect(snapshot.status == "active")
        #expect(snapshot.feature.telemetryEvent == "seis_demo_focus_mode_changed")
        #expect(snapshot.agiOperatingBehavior.count == 5)
        #expect(snapshot.qualityGate == "npm run check:seis-focus-mode")
        #expect(snapshot.evidence.count == 4)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.validationIssues.isEmpty)
    }

    @Test func inactiveOrUnboundedContractIsRejected() throws {
        var object = try JSONSerialization.jsonObject(with: sourceData()) as! [String: Any]
        object["status"] = "autonomous"
        object["agiOperatingBehavior"] = ["Run every tool without review."]
        let invalidData = try JSONSerialization.data(withJSONObject: object)

        let decoded = try JSONDecoder().decode(SeisFocusModeLearningContractSnapshot.self, from: invalidData)
        #expect(!decoded.isMetadataOnly)
        #expect(decoded.validationIssues.count >= 2)
        #expect(throws: SeisFocusModeLearningContractSnapshotError.self) {
            try SeisFocusModeLearningContractSnapshot.validated(from: invalidData)
        }
    }

    private func sourceData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent(SeisFocusModeLearningContractSnapshot.sourcePath))
    }
}
