import Foundation
import Testing
@testable import SeisPlatformKit

struct SeisMariaRecoveryTests {
    private func fixture() throws -> [String: Any] {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        let data = try Data(contentsOf: root.appendingPathComponent("test/fixtures/maria-recovery-swift-v1.json"))
        return try #require(JSONSerialization.jsonObject(with: data) as? [String: Any])
    }

    private func wire() throws -> Data {
        Data(try #require(fixture()["wire"] as? String).utf8)
    }

    private func changed(_ mutate: (inout [String: Any]) -> Void) throws -> Data {
        var payload = try #require(JSONSerialization.jsonObject(with: wire()) as? [String: Any])
        mutate(&payload)
        return try JSONSerialization.data(withJSONObject: payload, options: [.sortedKeys])
    }

    @Test func pythonGoldenFixtureMatchesNativePresentation() throws {
        let snapshot = try SeisMariaRecoveryDecoder.decode(wire(), expectedProjectID: "SEIS")
        let expected = try #require(fixture()["expected"] as? [[String: Any]])
        #expect(snapshot.wireSchemaVersion == 1)
        #expect(snapshot.projectID == "SEIS")
        #expect(snapshot.totalCandidates == 5)
        #expect(snapshot.replanRequired == 4)
        #expect(snapshot.driftDetected == 1)
        #expect(snapshot.evidenceRequired == 1)
        #expect(snapshot.anchorMissing == 1)
        #expect(snapshot.alignedReplanRequired == 1)
        #expect(snapshot.complete == 1)
        #expect(!snapshot.executionAuthorized)
        for (row, reference) in zip(snapshot.rows, expected) {
            #expect(row.workID == reference["work_id"] as? String)
            #expect(row.disposition.englishLabel == reference["status_label"] as? String)
            #expect(row.disposition.severity.rawValue == reference["severity"] as? String)
            #expect(row.detailFields == reference["detail_fields"] as? [String])
            #expect(row.replanRequired == reference["replan_required"] as? Bool)
            #expect(!row.executionAuthorized)
            #expect(!row.disposition.turkishLabel.isEmpty)
        }
    }

    @Test func missingDataIsNotAnEmptySuccessfulDashboard() throws {
        #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryDecoder.decode(Data()) }
        let data = try changed { payload in
            payload["rows"] = []
            for key in ["total_candidates", "replan_required", "drift_detected", "evidence_required", "anchor_missing", "aligned_replan_required", "complete"] { payload[key] = 0 }
        }
        let empty = try SeisMariaRecoveryDecoder.decode(data)
        #expect(empty.rows.isEmpty)
        #expect(empty.totalCandidates == 0)
    }

    @Test func rejectsUnsupportedAndAmbiguousVersionNumbers() throws {
        for value: Any in [true, 1.5, 999, "1", NSNull()] {
            let data = try changed { $0["schema_version"] = value }
            #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryDecoder.decode(data) }
        }
        let raw = String(decoding: try wire(), as: UTF8.self)
        for value in ["1.0", "1e0", "NaN", "Infinity", "-Infinity"] {
            let changed = raw.replacingOccurrences(of: "\"schema_version\":1", with: "\"schema_version\":\(value)")
            #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryDecoder.decode(Data(changed.utf8)) }
        }
    }

    @Test func durableSchemaVersionFitsSignedNativeIntegerRange() throws {
        let raw = String(decoding: try wire(), as: UTF8.self)
        let marker = "\"schema_version\":2"
        #expect(raw.contains(marker))

        let maximum = raw.replacingOccurrences(
            of: marker,
            with: "\"schema_version\":\(Int.max)"
        )
        let snapshot = try SeisMariaRecoveryDecoder.decode(Data(maximum.utf8))
        #expect(snapshot.rows.allSatisfy { $0.durableSchemaVersion == Int.max })

        let overflow = raw.replacingOccurrences(
            of: marker,
            with: "\"schema_version\":9223372036854775808"
        )
        #expect(throws: SeisMariaRecoveryError.self) {
            try SeisMariaRecoveryDecoder.decode(Data(overflow.utf8))
        }
    }

    @Test func rejectsDuplicateKeysIncludingEscapedAliases() throws {
        let raw = String(decoding: try wire(), as: UTF8.self)
        for replacement in [
            "\"project_id\":\"SEIS\",\"project_id\":\"SEIS\"",
            "\"project_id\":\"SEIS\",\"project_\\u0069d\":\"SEIS\""
        ] {
            let duplicate = raw.replacingOccurrences(of: "\"project_id\":\"SEIS\"", with: replacement)
            #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryDecoder.decode(Data(duplicate.utf8)) }
        }
    }

    @Test func rejectsAuthorizationExtraFieldsAndWrongProject() throws {
        for key in ["execution_authorized", "prompt", "recovery_anchor", "permission", "action"] {
            let data = try changed { $0[key] = true }
            #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryDecoder.decode(data) }
        }
        #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryDecoder.decode(wire(), expectedProjectID: "OTHER") }
        let data = try changed { payload in
            var rows = payload["rows"] as! [[String: Any]]
            rows[0]["project_id"] = "OTHER"; payload["rows"] = rows
        }
        #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryDecoder.decode(data) }
    }

    @Test func rejectsEveryMissingRootField() throws {
        let payload = try #require(JSONSerialization.jsonObject(with: wire()) as? [String: Any])
        for key in payload.keys {
            let data = try changed { $0.removeValue(forKey: key) }
            #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryDecoder.decode(data) }
        }
    }

    @Test func rejectsCounterForgeriesAndWrongScalarTypes() throws {
        for key in ["total_candidates", "replan_required", "drift_detected", "evidence_required", "anchor_missing", "aligned_replan_required", "complete"] {
            for value: Any in [true, -1, 6, "1", NSNull()] {
                let data = try changed { $0[key] = value }
                #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryDecoder.decode(data) }
            }
        }
    }

    @Test func rejectsRowInvariants() throws {
        let mutations: [(inout [[String: Any]]) -> Void] = [
            { $0.reverse() },
            { $0[1]["work_id"] = "work-001" },
            { $0[0]["disposition"] = "not-found" },
            { $0[0]["disposition"] = [] },
            { $0[0]["execution_authorized"] = true },
            { $0[0]["schema_version"] = true },
            { $0[0]["schema_version"] = NSNull() },
            { $0[0]["next_step_id"] = NSNull() },
            { $0[4]["next_step_id"] = "resume" },
            { $0[2]["drift_fields"] = [] },
            { $0[2]["missing_context"] = ["current_repo"] },
            { $0[1]["missing_context"] = [] },
            { $0[1]["drift_fields"] = ["current_repo"] },
            { $0[3]["drift_fields"] = ["current_repo"] },
            { $0[2]["drift_fields"] = ["current_repo", "current_repo"] },
            { $0[0]["work_id"] = " " },
            { $0[0]["work_id"] = String(repeating: "a", count: 513) },
            { $0[0]["prompt"] = "not-for-ui" },
            { $0[0].removeValue(forKey: "missing_context") }
        ]
        for mutate in mutations {
            let data = try changed { payload in
                var rows = payload["rows"] as! [[String: Any]]
                mutate(&rows); payload["rows"] = rows
            }
            #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryDecoder.decode(data) }
        }
    }

    @Test func rejectsInvalidJSONUtf8DepthAndByteOverflow() throws {
        for raw in [Data([0xff]), Data("{} trailing".utf8), Data("{\"x\":[[[[[[[[[[0]]]]]]]]]]}".utf8), Data(repeating: 32, count: 65537)] {
            #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryDecoder.decode(raw) }
        }
        let raw = String(decoding: try wire(), as: UTF8.self)
        for token in ["\\ud800", "\\udc00"] {
            let data = Data(raw.replacingOccurrences(of: "work-001", with: token).utf8)
            #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryDecoder.decode(data) }
        }
    }

    @Test func validWhitespaceAndEscapedStringsRemainSupported() throws {
        let payload = try #require(JSONSerialization.jsonObject(with: wire()) as? [String: Any])
        let pretty = try JSONSerialization.data(withJSONObject: payload, options: [.prettyPrinted])
        #expect(try SeisMariaRecoveryDecoder.decode(pretty) == SeisMariaRecoveryDecoder.decode(wire()))
    }
    @Test func canonicallyEquivalentPythonIDsHaveDistinctNativeIdentity() throws {
        let data = try changed { payload in
            var rows = payload["rows"] as! [[String: Any]]
            rows[0]["work_id"] = "e\u{301}"
            rows[4]["work_id"] = "\u{e9}"
            payload["rows"] = rows
        }
        let snapshot = try SeisMariaRecoveryDecoder.decode(data)
        #expect(snapshot.rows[0].id != snapshot.rows[4].id)
    }

    @Test func payloadBoundaryIsMeasuredInBytes() throws {
        var data = try wire()
        data.append(Data(repeating: 32, count: SeisMariaRecoveryDecoder.maximumBytes - data.count))
        #expect(try SeisMariaRecoveryDecoder.decode(data).totalCandidates == 5)
        data.append(32)
        #expect(throws: SeisMariaRecoveryError.self) { try SeisMariaRecoveryDecoder.decode(data) }
    }

}
