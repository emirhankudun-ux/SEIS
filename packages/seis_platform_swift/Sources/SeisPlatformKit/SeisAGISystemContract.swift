import Foundation

public struct SeisAGISubsystemContract: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let intent: String
    public let qualityGates: [String]

    public init(id: String, label: String, intent: String, qualityGates: [String]) {
        self.id = id
        self.label = label
        self.intent = intent
        self.qualityGates = qualityGates
    }
}

public struct SeisAGIPluginLaneContract: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let mode: String
    public let examples: [String]
    public let activationGate: String

    public init(id: String, label: String, mode: String, examples: [String], activationGate: String) {
        self.id = id
        self.label = label
        self.mode = mode
        self.examples = examples
        self.activationGate = activationGate
    }
}

public struct SeisAGIPlatformBudget: Codable, Equatable, Sendable {
    public let javascriptTargetPercent: Double
    public let tokenSavingsTargetPercent: Int
    public let appleLanguages: [String]
    public let targetReleaseDate: String
    public let installPolicy: String

    public var isLanguageBudgetAligned: Bool {
        javascriptTargetPercent == 21.0 &&
            appleLanguages.contains("Swift") &&
            appleLanguages.contains("SwiftUI") &&
            appleLanguages.contains("Objective-C") &&
            appleLanguages.contains("Metal") &&
            appleLanguages.contains("Core Data") &&
            appleLanguages.contains("CloudKit")
    }

    public var isTokenEfficient: Bool {
        tokenSavingsTargetPercent >= 60
    }
}

public struct SeisAGISystemContract: Codable, Equatable, Sendable {
    public let id: String
    public let generatedAt: String
    public let claimBoundary: String
    public let budget: SeisAGIPlatformBudget
    public let subsystems: [SeisAGISubsystemContract]
    public let pluginLanes: [SeisAGIPluginLaneContract]
    public let implementationRoots: [String]

    public init(
        id: String,
        generatedAt: String,
        claimBoundary: String,
        budget: SeisAGIPlatformBudget,
        subsystems: [SeisAGISubsystemContract],
        pluginLanes: [SeisAGIPluginLaneContract],
        implementationRoots: [String]
    ) {
        self.id = id
        self.generatedAt = generatedAt
        self.claimBoundary = claimBoundary
        self.budget = budget
        self.subsystems = subsystems
        self.pluginLanes = pluginLanes
        self.implementationRoots = implementationRoots
    }

    public var isReadyForImplementation: Bool {
        id == "seis-agi-system" &&
            claimBoundary.contains("does not claim autonomous general intelligence") &&
            budget.isLanguageBudgetAligned &&
            budget.isTokenEfficient &&
            subsystems.count >= 10 &&
            pluginLanes.contains { $0.id == "development-read-write" } &&
            pluginLanes.contains { $0.id == "data-read-write" } &&
            pluginLanes.contains { $0.id == "design-interactive" } &&
            implementationRoots.contains("scripts/create-seis-agi-system.py")
    }

    public static let master = SeisAGISystemContract(
        id: "seis-agi-system",
        generatedAt: "2026-06-12",
        claimBoundary: "Human-owned AGI-inspired assistant architecture; it does not claim autonomous general intelligence.",
        budget: SeisAGIPlatformBudget(
            javascriptTargetPercent: 21.0,
            tokenSavingsTargetPercent: 60,
            appleLanguages: [
                "Swift",
                "SwiftUI",
                "Objective-C",
                "Metal",
                "AppKit",
                "UIKit",
                "Combine",
                "Core Data",
                "CloudKit"
            ],
            targetReleaseDate: "2026-09-12",
            installPolicy: "avoid_unnecessary_sdks_runtimes_frameworks_dependencies_and_toolchain_bloat"
        ),
        subsystems: [
            SeisAGISubsystemContract(
                id: "agent-orchestration",
                label: "Advanced Agent Orchestration",
                intent: "Route Codex, Claude, Gemini, Qwen, local helpers, MCP tools, and plugins through one governed layer.",
                qualityGates: ["single-writer-mode", "tool-minimization", "handoff-notes", "permission-scope"]
            ),
            SeisAGISubsystemContract(
                id: "memory-architecture",
                label: "Memory Architecture",
                intent: "Preserve durable project, architecture, governance, deployment, research, and design decisions.",
                qualityGates: ["source-backed-memory", "secret-safety", "retrieval-trace", "staleness-awareness"]
            ),
            SeisAGISubsystemContract(
                id: "planning-and-execution",
                label: "Planning and Execution Kernel",
                intent: "Turn large goals into reversible daily packets, 90-day release windows, and long-horizon mission waves.",
                qualityGates: ["small-slices", "dependency-order", "rollback-ready", "no-runtime-bloat"]
            ),
            SeisAGISubsystemContract(
                id: "research-automation",
                label: "Research Automation",
                intent: "Prefer primary sources and task-specific research tools before assumptions become architecture.",
                qualityGates: ["primary-source-first", "version-compatibility", "citation-trace", "claim-boundary"]
            ),
            SeisAGISubsystemContract(
                id: "multi-agent-coordination",
                label: "Multi-Agent Coordination",
                intent: "Coordinate Codex execution, Claude review, Gemini validation, and local fallback helpers.",
                qualityGates: ["one-writer-at-a-time", "reviewer-role-separated", "diff-review", "human-approval"]
            ),
            SeisAGISubsystemContract(
                id: "plugin-mcp-skills",
                label: "Plugin, MCP, and Skills Mesh",
                intent: "Activate data, development, design, research, deployment, security, and collaboration capabilities only when relevant.",
                qualityGates: ["authenticated-scope", "read-write-gate", "minimum-required-tools", "no-fake-usage"]
            ),
            SeisAGISubsystemContract(
                id: "token-efficiency",
                label: "Token Efficiency Engine",
                intent: "Save prompt and runtime budget through retrieval, compression, source manifests, and staged plans.",
                qualityGates: ["bounded-context", "source-manifest", "summarize-before-expand", "avoid-repeated-discovery"]
            ),
            SeisAGISubsystemContract(
                id: "human-helper-ai",
                label: "Human Helper AI",
                intent: "Keep SEIS helpful through calm UX, explainable decisions, accessibility, and human review.",
                qualityGates: ["accessibility", "humane-ux", "explainability", "human-in-the-loop"]
            ),
            SeisAGISubsystemContract(
                id: "security-governance",
                label: "Security and Governance",
                intent: "Keep credentials, user data, repository state, and connector writes behind explicit safety gates.",
                qualityGates: ["least-privilege", "secret-safety", "auditability", "non-destructive-defaults"]
            ),
            SeisAGISubsystemContract(
                id: "observability-evaluation",
                label: "Observability and Evaluation",
                intent: "Measure agent quality, reliability, token efficiency, capability usage, and release readiness.",
                qualityGates: ["deterministic-checks", "quality-metrics", "regression-tests", "release-evidence"]
            )
        ],
        pluginLanes: [
            SeisAGIPluginLaneContract(
                id: "development-read-write",
                label: "Development read/write",
                mode: "interactive_read_write",
                examples: ["GitHub", "Build Web Apps", "Build iOS Apps", "Build macOS Apps", "Expo", "Vercel", "Cloudflare"],
                activationGate: "Use only for scoped implementation, repo inspection, CI, deploy, or native platform validation."
            ),
            SeisAGIPluginLaneContract(
                id: "data-read-write",
                label: "Data read/write",
                mode: "interactive_read_write",
                examples: ["Airtable", "Supabase", "Neon Postgres", "MotherDuck", "Data Analytics", "Mixpanel", "PostHog"],
                activationGate: "Use only with schema, date range, account scope, privacy boundary, and rollback path."
            ),
            SeisAGIPluginLaneContract(
                id: "design-interactive",
                label: "Design interactive",
                mode: "interactive_visual",
                examples: ["Figma", "Canva", "Adobe", "Product Design", "Creative Production", "Fal", "Shutterstock"],
                activationGate: "Use only with a design brief, asset rights, accessibility notes, and visual QA target."
            )
        ],
        implementationRoots: [
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift",
            "packages/seis_kernel/agi_system.py",
            "scripts/create-seis-agi-system.py",
            "content/development/seis-agi-system.json",
            "reports/seis-agi-system.md",
            "docs/agi/seis-agi-system.md"
        ]
    )
}

public extension SeisAGISystemContract {
    static var expectedReportTokens: [String] {
        [
            "SEIS AGI System",
            "JavaScript target: 21.0%",
            "Token savings target: 60%",
            "Advanced Agent Orchestration",
            "Memory Architecture",
            "Planning and Execution Kernel",
            "Research Automation",
            "Practical Priority Domains",
            "full 150-domain taxonomy is stored",
            "Visual Sources Used",
            "Plugin, MCP, and Skills Mesh",
            "does not claim autonomous general intelligence"
        ]
    }
}
