import Foundation

public struct SeisFocusModeFeature: Codable, Equatable, Sendable {
    public let telemetryEvent: String
    public let purpose: String
}

public enum SeisFocusModeLearningContractSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisFocusModeLearningContractSnapshot: Codable, Equatable, Identifiable, Sendable {
    public static let sourcePath = "content/development/seis-focus-mode-learning-contract.json"
    public static let expectedTelemetryEvent = "seis_demo_focus_mode_changed"
    public static let expectedQualityGate = "npm run check:seis-focus-mode"

    public let id: String
    public let name: String
    public let status: String
    public let feature: SeisFocusModeFeature
    public let agiOperatingBehavior: [String]
    public let qualityGate: String
    public let evidence: [String]

    public static func validated(from data: Data) throws -> Self {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisFocusModeLearningContractSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisFocusModeLearningContractSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-focus-mode-learning-contract" || name != "SEIS Focus Mode" {
            issues.append("focus mode identity is invalid")
        }
        if status != "active" {
            issues.append("focus mode learning contract must remain active")
        }
        if feature.telemetryEvent != Self.expectedTelemetryEvent || feature.purpose.isEmpty {
            issues.append("focus mode feature must expose its telemetry event and purpose")
        }
        if agiOperatingBehavior != Self.expectedOperatingBehavior {
            issues.append("focus mode operating behavior must remain bounded and evidence-first")
        }
        if qualityGate != Self.expectedQualityGate {
            issues.append("focus mode quality gate is invalid")
        }
        if evidence != Self.expectedEvidence {
            issues.append("focus mode evidence paths must remain source-backed")
        }
        return issues
    }

    public var isMetadataOnly: Bool {
        validationIssues.isEmpty &&
            status == "active" &&
            feature.telemetryEvent == Self.expectedTelemetryEvent
    }

    private static let expectedOperatingBehavior = [
        "Keep the active task bounded to the current SEIS objective.",
        "Prefer the minimum effective toolset before expanding context.",
        "Do not claim readiness without current validation evidence.",
        "Protect user work, secrets, and repository integrity while focused.",
        "Escalate only when risk, ambiguity, or hidden operational impact requires it."
    ]

    private static let expectedEvidence = [
        "docs/governance/seis-supreme-vision.md",
        "apps/seis-demo-web/contracts/seis-demo-contract.json",
        "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Resources/seis-demo-contract.json",
        "plugins/seis/skills/seis-focus-mode/SKILL.md"
    ]
}
