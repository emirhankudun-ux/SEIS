import Foundation
import Testing
@testable import SeisPlatformKit

struct SeisMariaRecoveryBoundsTests {
    private func payload() throws -> [String: Any] {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<5 { root.deleteLastPathComponent() }
        let fixtureData = try Data(
            contentsOf: root.appendingPathComponent("test/fixtures/maria-recovery-swift-v1.json")
        )
        let fixture = try #require(JSONSerialization.jsonObject(with: fixtureData) as? [String: Any])
        let wire = Data(try #require(fixture["wire"] as? String).utf8)
        return try #require(JSONSerialization.jsonObject(with: wire) as? [String: Any])
    }

    private func anchorRows(_ count: Int) throws -> [[String: Any]] {
        let source = try #require(payload()["rows"] as? [[String: Any]])
        let template = try #require(source.first)
        return (0..<count).map { index in
            var row = template
            row["work_id"] = String(format: "work-%03d", index)
            return row
        }
    }

    private func setAnchorSummary(_ payload: inout [String: Any], count: Int) {
        payload["total_candidates"] = count
        payload["replan_required"] = count
        payload["anchor_missing"] = count
        payload["evidence_required"] = 0
        payload["drift_detected"] = 0
        payload["aligned_replan_required"] = 0
        payload["complete"] = 0
    }

    @Test func rowCardinalityMatchesWireV1Boundary() throws {
        var maximum = try payload()
        maximum["rows"] = try anchorRows(256)
        setAnchorSummary(&maximum, count: 256)
        let maximumData = try JSONSerialization.data(withJSONObject: maximum, options: [.sortedKeys])
        #expect(maximumData.count <= SeisMariaRecoveryDecoder.maximumBytes)
        #expect(try SeisMariaRecoveryDecoder.decode(maximumData).totalCandidates == 256)

        var overflow = try payload()
        overflow["rows"] = try anchorRows(257)
        setAnchorSummary(&overflow, count: 257)
        let overflowData = try JSONSerialization.data(withJSONObject: overflow, options: [.sortedKeys])
        #expect(overflowData.count <= SeisMariaRecoveryDecoder.maximumBytes)
        #expect(throws: SeisMariaRecoveryError.self) {
            try SeisMariaRecoveryDecoder.decode(overflowData)
        }
    }

    @Test func detailFieldCardinalityMatchesWireV1Boundary() throws {
        var maximum = try payload()
        var rows = try #require(maximum["rows"] as? [[String: Any]])
        rows[2]["drift_fields"] = (0..<16).map { "f\($0)" }
        maximum["rows"] = rows
        let maximumData = try JSONSerialization.data(withJSONObject: maximum, options: [.sortedKeys])
        #expect(try SeisMariaRecoveryDecoder.decode(maximumData).rows[2].detailFields.count == 16)

        var overflow = maximum
        rows[2]["drift_fields"] = (0..<17).map { "f\($0)" }
        overflow["rows"] = rows
        let overflowData = try JSONSerialization.data(withJSONObject: overflow, options: [.sortedKeys])
        #expect(throws: SeisMariaRecoveryError.self) {
            try SeisMariaRecoveryDecoder.decode(overflowData)
        }
    }
}
