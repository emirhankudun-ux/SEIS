import Foundation
import Testing
@testable import SeisPlatformKit

@Suite("SEIS Project Intake Snapshot")
struct SeisProjectIntakeSnapshotTests {
    @Test func canonicalIntakeContractIsMetadataOnly() throws {
        let snapshot = try SeisProjectIntakeSnapshot.validated(from: intakeData())

        #expect(snapshot.isValid)
        #expect(snapshot.isMetadataOnly)
        #expect(snapshot.identity == "seis-project-intake-contract")
        #expect(snapshot.version == "0.2.0")
        #expect(snapshot.requiredEvidence.count == 4)
        #expect(snapshot.requiredArtifacts.count == 5)
        #expect(snapshot.reportShape.topLevelKeys.count == 6)
        #expect(snapshot.reportShape.intakeRequiredFields.count == 5)
        #expect(snapshot.commandPolicy.scopedActions.count == 5)
        #expect(snapshot.nextPhaseSuggestions.count == 3)
    }

    @Test func unsafeInputPolicyMutationIsRejected() throws {
        var root = try #require(JSONSerialization.jsonObject(with: intakeData()) as? [String: Any])
        var inputPolicy = try #require(root["inputPolicy"] as? [String: Any])
        inputPolicy["network"] = "allowed"
        root["inputPolicy"] = inputPolicy

        #expect(throws: SeisProjectIntakeSnapshotError.self) {
            try SeisProjectIntakeSnapshot.validated(from: JSONSerialization.data(withJSONObject: root))
        }
    }

    @Test func unsafeWriteShellAndSecretMutationsAreRejected() throws {
        for key in ["write", "shell", "secretCapture"] {
            var root = try #require(JSONSerialization.jsonObject(with: intakeData()) as? [String: Any])
            var inputPolicy = try #require(root["inputPolicy"] as? [String: Any])
            inputPolicy[key] = "allowed"
            root["inputPolicy"] = inputPolicy

            #expect(throws: SeisProjectIntakeSnapshotError.self) {
                try SeisProjectIntakeSnapshot.validated(from: JSONSerialization.data(withJSONObject: root))
            }
        }
    }

    @Test func unsafeCommandPolicyMutationIsRejected() throws {
        var root = try #require(JSONSerialization.jsonObject(with: intakeData()) as? [String: Any])
        var commandPolicy = try #require(root["commandPolicy"] as? [String: Any])
        var actions = try #require(commandPolicy["scopedActions"] as? [[String: Any]])
        actions[0]["decision"] = "gate"
        commandPolicy["scopedActions"] = actions
        root["commandPolicy"] = commandPolicy

        #expect(throws: SeisProjectIntakeSnapshotError.self) {
            try SeisProjectIntakeSnapshot.validated(from: JSONSerialization.data(withJSONObject: root))
        }
    }

    private func intakeData() throws -> Data {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        return try Data(contentsOf: root.appendingPathComponent("content/development/seis-project-intake-contract.json"))
    }
}
