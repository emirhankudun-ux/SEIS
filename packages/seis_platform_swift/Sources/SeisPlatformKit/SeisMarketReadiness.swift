import Foundation

public struct SeisMarketReadinessInput: Codable, Equatable, Sendable {
    public let domains: [String]
    public let contributorSignals: [String]
    public let primaryBranch: String
    public let longLivedBranches: [String]
    public let websiteIsFinalSurface: Bool
    public let appleLanguages: [String]
    public let windowsAndroidLanguages: [String]
    public let runtimeInstallPolicy: String
    public let addsNewJavaScript: Bool
    public let addsNewPython: Bool
    public let hasMITLicense: Bool
    public let hasSecurityPolicy: Bool
    public let hasContributingGuide: Bool
    public let hasCodeOfConduct: Bool

    public init(
        domains: [String],
        contributorSignals: [String],
        primaryBranch: String,
        longLivedBranches: [String],
        websiteIsFinalSurface: Bool,
        appleLanguages: [String],
        windowsAndroidLanguages: [String],
        runtimeInstallPolicy: String,
        addsNewJavaScript: Bool,
        addsNewPython: Bool,
        hasMITLicense: Bool,
        hasSecurityPolicy: Bool,
        hasContributingGuide: Bool,
        hasCodeOfConduct: Bool
    ) {
        self.domains = domains
        self.contributorSignals = contributorSignals
        self.primaryBranch = primaryBranch
        self.longLivedBranches = longLivedBranches
        self.websiteIsFinalSurface = websiteIsFinalSurface
        self.appleLanguages = appleLanguages
        self.windowsAndroidLanguages = windowsAndroidLanguages
        self.runtimeInstallPolicy = runtimeInstallPolicy
        self.addsNewJavaScript = addsNewJavaScript
        self.addsNewPython = addsNewPython
        self.hasMITLicense = hasMITLicense
        self.hasSecurityPolicy = hasSecurityPolicy
        self.hasContributingGuide = hasContributingGuide
        self.hasCodeOfConduct = hasCodeOfConduct
    }
}

public struct SeisMarketReadinessResult: Codable, Equatable, Sendable {
    public let ready: Bool
    public let score: Int
    public let domainCount: Int
    public let mainOnlyPolicy: Bool
    public let codexClaudeVisible: Bool
    public let blockers: [String]
}

public enum SeisCapabilityDomainSet {
    public static let required: [String] = [
        "ai-agent",
        "mcp",
        "skills",
        "plugins",
        "llm-routing",
        "algorithms",
        "flowcharts",
        "mathematics",
        "computer-science",
        "web-development",
        "mobile-development",
        "game-development",
        "data-science",
        "machine-learning",
        "database-management",
        "version-control",
        "cloud-computing",
        "cybersecurity",
        "devops",
        "system-administration",
        "test-engineering",
        "software-architecture",
        "design-patterns",
        "big-data",
        "nlp",
        "computer-vision",
        "quantum-programming",
        "sustainable-software",
        "low-code-no-code",
        "ux-ui-engineering",
        "robotics",
        "ai-ethics",
        "data-governance",
        "compiler-design",
        "requirements-engineering",
        "agile-delivery",
        "sdlc-metrics",
        "sre",
        "reverse-engineering",
        "refactoring",
        "formal-methods"
    ]
}

public enum SeisMarketReadiness {
    private static let appleOnlyLanguages = Set(["Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"])

    public static func evaluate(_ input: SeisMarketReadinessInput) -> SeisMarketReadinessResult {
        var blockers: [String] = []
        let domainSet = Set(input.domains)
        let missingDomains = SeisCapabilityDomainSet.required.filter { !domainSet.contains($0) }
        if !missingDomains.isEmpty {
            blockers.append("missing_domains:\(missingDomains.joined(separator: ","))")
        }

        let contributors = Set(input.contributorSignals)
        let codexClaudeVisible = contributors.contains("OpenAI Codex") && contributors.contains("Claude")
        if !codexClaudeVisible {
            blockers.append("codex_claude_contributor_signal_missing")
        }

        let mainOnly = input.primaryBranch == "main" && Set(input.longLivedBranches).isSubset(of: ["main"])
        if !mainOnly {
            blockers.append("main_only_branch_policy_not_enforced")
        }

        if !input.websiteIsFinalSurface {
            blockers.append("website_must_remain_final_release_surface")
        }

        if Set(input.appleLanguages) != appleOnlyLanguages {
            blockers.append("apple_surface_must_use_only_apple_languages")
        }

        let windowsAndroid = Set(input.windowsAndroidLanguages)
        if !windowsAndroid.isDisjoint(with: appleOnlyLanguages) || windowsAndroid.count < 8 {
            blockers.append("windows_android_surface_needs_broad_non_apple_languages")
        }

        if input.runtimeInstallPolicy != "requirement_led_only" {
            blockers.append("runtime_installs_must_be_requirement_led")
        }

        if input.addsNewJavaScript {
            blockers.append("javascript_growth_frozen_for_current_phase")
        }

        if input.addsNewPython {
            blockers.append("python_growth_frozen_for_current_phase")
        }

        if !input.hasMITLicense {
            blockers.append("mit_license_missing")
        }
        if !input.hasSecurityPolicy {
            blockers.append("security_policy_missing")
        }
        if !input.hasContributingGuide {
            blockers.append("contributing_guide_missing")
        }
        if !input.hasCodeOfConduct {
            blockers.append("code_of_conduct_missing")
        }

        blockers.sort()
        return SeisMarketReadinessResult(
            ready: blockers.isEmpty,
            score: max(0, 100 - blockers.count * 12),
            domainCount: input.domains.count,
            mainOnlyPolicy: mainOnly,
            codexClaudeVisible: codexClaudeVisible,
            blockers: blockers
        )
    }
}
