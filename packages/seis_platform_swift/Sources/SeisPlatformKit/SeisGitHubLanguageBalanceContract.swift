public enum SeisLanguageBalanceStatus: String, Codable, Equatable, Sendable {
    case belowTarget = "below_target"
    case withinTarget = "within_target"
    case aboveTarget = "above_target"
}

public struct SeisGitHubLanguageBalanceTarget: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let minPercent: Double
    public let maxPercent: Double
    public let sourceLanguages: [String]
    public let ecosystemSurfaces: [String]
    public let owningIdentity: String
    public let purpose: String
    public let qualityGate: String
    public let noFillerRule: String

    public init(
        id: String,
        label: String,
        minPercent: Double,
        maxPercent: Double,
        sourceLanguages: [String],
        ecosystemSurfaces: [String],
        owningIdentity: String,
        purpose: String,
        qualityGate: String,
        noFillerRule: String
    ) {
        self.id = id
        self.label = label
        self.minPercent = minPercent
        self.maxPercent = maxPercent
        self.sourceLanguages = sourceLanguages
        self.ecosystemSurfaces = ecosystemSurfaces
        self.owningIdentity = owningIdentity
        self.purpose = purpose
        self.qualityGate = qualityGate
        self.noFillerRule = noFillerRule
    }

    public var isGoverned: Bool {
        !id.isEmpty &&
            !label.isEmpty &&
            minPercent <= maxPercent &&
            !sourceLanguages.isEmpty &&
            !ecosystemSurfaces.isEmpty &&
            !owningIdentity.isEmpty &&
            !purpose.isEmpty &&
            !qualityGate.isEmpty &&
            noFillerRule.contains("Only product, platform, automation, security, data, design, or governance work")
    }

    public func status(for percent: Double) -> SeisLanguageBalanceStatus {
        if percent < minPercent {
            return .belowTarget
        }
        if percent > maxPercent {
            return .aboveTarget
        }
        return .withinTarget
    }
}

public enum SeisGitHubLanguageBalanceContract {
    public static let mode = "multi_platform_real_source_balance"
    public static let noFillerPolicy = "Do not add filler code only to change GitHub language percentages. Every language must serve a real SEIS purpose."
    public static let noFillerRule = "Only product, platform, automation, security, data, design, or governance work can move this target."

    public static let validationCommands = [
        "npm run check:language-distribution",
        "swift test --package-path packages/seis_platform_swift",
        "npm run quality"
    ]

    public static let targets = [
        SeisGitHubLanguageBalanceTarget(
            id: "apple-swift-ecosystem",
            label: "Apple / Swift ecosystem",
            minPercent: 25.0,
            maxPercent: 30.0,
            sourceLanguages: ["Swift", "Objective-C", "AppleScript"],
            ecosystemSurfaces: ["SwiftUI", "Metal", "Core Data", "CloudKit"],
            owningIdentity: "SEIS",
            purpose: "Apple-first app, platform, policy, and native integration code.",
            qualityGate: "swift_package_policy_tests",
            noFillerRule: noFillerRule
        ),
        SeisGitHubLanguageBalanceTarget(
            id: "ai-data-python-sql",
            label: "AI, Data, Python, SQL",
            minPercent: 18.0,
            maxPercent: 22.0,
            sourceLanguages: ["Python", "SQL", "R", "Julia", "Scala", "JSON", "JSON-LD", "Turtle", "SPARQL"],
            ecosystemSurfaces: ["agent memory", "analytics contracts", "knowledge graphs", "research manifests"],
            owningIdentity: "SEIS-DATA",
            purpose: "AI, analytics, memory, context, data contracts, and knowledge governance.",
            qualityGate: "data_contract_report_check",
            noFillerRule: noFillerRule
        ),
        SeisGitHubLanguageBalanceTarget(
            id: "typescript-javascript-tooling",
            label: "TypeScript / JavaScript tooling",
            minPercent: 15.0,
            maxPercent: 20.0,
            sourceLanguages: ["TypeScript", "JavaScript"],
            ecosystemSurfaces: ["MCP tools", "automation scripts", "web tooling", "agent surfaces"],
            owningIdentity: "SEIS-Agent",
            purpose: "Tooling, web interaction, MCP, automation, and agent surfaces.",
            qualityGate: "node_automation_checks",
            noFillerRule: noFillerRule
        ),
        SeisGitHubLanguageBalanceTarget(
            id: "android-jvm",
            label: "Android / JVM",
            minPercent: 10.0,
            maxPercent: 15.0,
            sourceLanguages: ["Kotlin", "Java", "Groovy", "Clojure"],
            ecosystemSurfaces: ["Android readiness", "JVM validation", "cross-platform policy"],
            owningIdentity: "SEIS-Code",
            purpose: "Android, JVM validation, and cross-platform policy contracts.",
            qualityGate: "jvm_surface_check",
            noFillerRule: noFillerRule
        ),
        SeisGitHubLanguageBalanceTarget(
            id: "rust-c-cpp-systems",
            label: "Rust / C / C++ systems",
            minPercent: 10.0,
            maxPercent: 15.0,
            sourceLanguages: ["Rust", "C", "C++", "Zig"],
            ecosystemSurfaces: ["native audits", "systems performance", "safety contracts"],
            owningIdentity: "SEIS-Code",
            purpose: "Systems, performance, safety, native audits, and low-level contracts.",
            qualityGate: "systems_surface_check",
            noFillerRule: noFillerRule
        ),
        SeisGitHubLanguageBalanceTarget(
            id: "go-infrastructure",
            label: "Go / Infrastructure",
            minPercent: 5.0,
            maxPercent: 8.0,
            sourceLanguages: ["Go", "Shell", "YAML", "HCL", "TOML", "Bicep", "Nix", "CUE", "Rego", "Dockerfile"],
            ecosystemSurfaces: ["cloud readiness", "CI policy", "deployment automation", "server tooling"],
            owningIdentity: "SEIS-Cloud",
            purpose: "Cloud, CI, deployment, server, policy, and infrastructure automation.",
            qualityGate: "infrastructure_readiness_check",
            noFillerRule: noFillerRule
        ),
        SeisGitHubLanguageBalanceTarget(
            id: "windows-dotnet",
            label: "Windows / .NET",
            minPercent: 5.0,
            maxPercent: 8.0,
            sourceLanguages: ["C#", "F#", "Visual Basic", "PowerShell"],
            ecosystemSurfaces: ["WinUI policy", ".NET validation", "PowerShell readiness"],
            owningIdentity: "SEIS-Code",
            purpose: "Windows platform and .NET policy contracts.",
            qualityGate: "dotnet_surface_check",
            noFillerRule: noFillerRule
        ),
        SeisGitHubLanguageBalanceTarget(
            id: "html-css-preview",
            label: "HTML / CSS previews",
            minPercent: 0.0,
            maxPercent: 3.0,
            sourceLanguages: ["HTML", "CSS"],
            ecosystemSurfaces: ["docs previews", "demos", "lightweight product surfaces"],
            owningIdentity: "SEIS-Design",
            purpose: "Docs, demos, previews, and lightweight product surfaces only.",
            qualityGate: "preview_surface_review",
            noFillerRule: noFillerRule
        )
    ]

    public static let migrationOrder = [
        "apple-swift-ecosystem",
        "android-jvm",
        "rust-c-cpp-systems",
        "windows-dotnet",
        "go-infrastructure",
        "html-css-preview",
        "ai-data-python-sql",
        "typescript-javascript-tooling"
    ]

    public static var targetIDs: [String] {
        targets.map(\.id)
    }

    public static var isReady: Bool {
        targetIDs.count == 8 &&
            Set(targetIDs).count == targetIDs.count &&
            targets.allSatisfy(\.isGoverned) &&
            noFillerPolicy.contains("Do not add filler") &&
            validationCommands.contains("swift test --package-path packages/seis_platform_swift") &&
            validationCommands.contains("npm run quality")
    }

    public static func target(for id: String) -> SeisGitHubLanguageBalanceTarget? {
        targets.first { $0.id == id }
    }

    public static func status(for targetID: String, percent: Double) -> SeisLanguageBalanceStatus? {
        target(for: targetID)?.status(for: percent)
    }
}
