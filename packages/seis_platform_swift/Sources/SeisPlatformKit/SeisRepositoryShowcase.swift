import Foundation

public struct SeisRepositoryShowcaseInput: Codable, Equatable, Sendable {
    public let readmeSections: [String]
    public let communityFiles: [String]
    public let contributorSignals: [String]
    public let platformSignals: [String]
    public let validationSignals: [String]
    public let aiRoutingSignals: [String]
    public let branchPolicy: String
    public let websiteIsFinalSurface: Bool
    public let dependencyPolicy: String
    public let addsNewJavaScript: Bool
    public let addsNewPython: Bool

    public init(
        readmeSections: [String],
        communityFiles: [String],
        contributorSignals: [String],
        platformSignals: [String],
        validationSignals: [String],
        aiRoutingSignals: [String],
        branchPolicy: String,
        websiteIsFinalSurface: Bool,
        dependencyPolicy: String,
        addsNewJavaScript: Bool,
        addsNewPython: Bool
    ) {
        self.readmeSections = readmeSections
        self.communityFiles = communityFiles
        self.contributorSignals = contributorSignals
        self.platformSignals = platformSignals
        self.validationSignals = validationSignals
        self.aiRoutingSignals = aiRoutingSignals
        self.branchPolicy = branchPolicy
        self.websiteIsFinalSurface = websiteIsFinalSurface
        self.dependencyPolicy = dependencyPolicy
        self.addsNewJavaScript = addsNewJavaScript
        self.addsNewPython = addsNewPython
    }
}

public struct SeisRepositoryShowcaseResult: Codable, Equatable, Sendable {
    public let ready: Bool
    public let score: Int
    public let verifiedSignalCount: Int
    public let blockers: [String]
}

public enum SeisRepositoryShowcaseGate {
    public static let requiredReadmeSections = [
        "Active Collaboration Stack",
        "Contributors",
        "Platform Policy",
        "Capability Coverage",
        "Orchestration Gate",
        "Repository Governance",
        "Validation",
        "Community"
    ]

    public static let requiredCommunityFiles = [
        "CONTRIBUTING.md",
        "CODE_OF_CONDUCT.md",
        "SECURITY.md",
        "LICENSE"
    ]

    public static let requiredContributorSignals = [
        "emirhankudun-ux",
        "OpenAI Codex",
        "Claude"
    ]

    public static let requiredPlatformSignals = [
        "apple-only-languages",
        "windows-non-apple-polyglot",
        "android-native",
        "javascript-growth-frozen",
        "python-growth-frozen"
    ]

    public static let requiredValidationSignals = [
        "swift-test",
        "go-test",
        "android-java-smoke",
        "windows-cpp-smoke",
        "objective-c-smoke"
    ]

    public static let requiredAIRoutingSignals = [
        "seis-agent-remote-orchestrator",
        "online-ai-local-helpers",
        "ollama-offline-fallback"
    ]

    public static func evaluate(_ input: SeisRepositoryShowcaseInput) -> SeisRepositoryShowcaseResult {
        var blockers: [String] = []
        blockers.append(contentsOf: missingBlockers(
            values: input.readmeSections,
            required: requiredReadmeSections,
            prefix: "readme_section_missing"
        ))
        blockers.append(contentsOf: missingBlockers(
            values: input.communityFiles,
            required: requiredCommunityFiles,
            prefix: "community_file_missing"
        ))
        blockers.append(contentsOf: missingBlockers(
            values: input.contributorSignals,
            required: requiredContributorSignals,
            prefix: "contributor_signal_missing"
        ))
        blockers.append(contentsOf: missingBlockers(
            values: input.platformSignals,
            required: requiredPlatformSignals,
            prefix: "platform_signal_missing"
        ))
        blockers.append(contentsOf: missingBlockers(
            values: input.validationSignals,
            required: requiredValidationSignals,
            prefix: "validation_signal_missing"
        ))
        blockers.append(contentsOf: missingBlockers(
            values: input.aiRoutingSignals,
            required: requiredAIRoutingSignals,
            prefix: "ai_routing_signal_missing"
        ))

        if input.branchPolicy != "main-centered" {
            blockers.append("branch_policy_must_be_main_centered")
        }
        if !input.websiteIsFinalSurface {
            blockers.append("website_final_surface_missing")
        }
        if input.dependencyPolicy != "requirement-led" {
            blockers.append("dependency_policy_must_be_requirement_led")
        }
        if input.addsNewJavaScript {
            blockers.append("javascript_growth_frozen_for_current_phase")
        }
        if input.addsNewPython {
            blockers.append("python_growth_frozen_for_current_phase")
        }

        blockers.sort()
        let verifiedCount = input.readmeSections.count +
            input.communityFiles.count +
            input.contributorSignals.count +
            input.platformSignals.count +
            input.validationSignals.count +
            input.aiRoutingSignals.count
        return SeisRepositoryShowcaseResult(
            ready: blockers.isEmpty,
            score: max(0, 100 - blockers.count * 8),
            verifiedSignalCount: verifiedCount,
            blockers: blockers
        )
    }

    private static func missingBlockers(values: [String], required: [String], prefix: String) -> [String] {
        let present = Set(values)
        return required
            .filter { !present.contains($0) }
            .map { "\(prefix):\($0)" }
    }
}
