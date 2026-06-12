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

public struct SeisAGIRoadmapMilestone: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let month: Int
    public let dayRange: String
    public let theme: String
    public let focusAreas: [String]
    public let acceptanceGates: [String]
    public let evidencePaths: [String]

    public init(
        id: String,
        month: Int,
        dayRange: String,
        theme: String,
        focusAreas: [String],
        acceptanceGates: [String],
        evidencePaths: [String]
    ) {
        self.id = id
        self.month = month
        self.dayRange = dayRange
        self.theme = theme
        self.focusAreas = focusAreas
        self.acceptanceGates = acceptanceGates
        self.evidencePaths = evidencePaths
    }

    public var isTraceable: Bool {
        month >= 1 &&
            month <= 3 &&
            !dayRange.isEmpty &&
            !theme.isEmpty &&
            focusAreas.count >= 4 &&
            acceptanceGates.count >= 4 &&
            evidencePaths.count >= 4
    }
}

public struct SeisAGIMemoryPlanningCheckpoint: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let phase: String
    public let appleStorageSurface: String
    public let evidencePath: String
    public let qualityGates: [String]

    public init(
        id: String,
        label: String,
        phase: String,
        appleStorageSurface: String,
        evidencePath: String,
        qualityGates: [String]
    ) {
        self.id = id
        self.label = label
        self.phase = phase
        self.appleStorageSurface = appleStorageSurface
        self.evidencePath = evidencePath
        self.qualityGates = qualityGates
    }
}

public struct SeisAGIMemoryPlanningLoop: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let trigger: String
    public let steps: [String]
    public let outputArtifact: String
    public let evaluationGates: [String]

    public init(
        id: String,
        label: String,
        trigger: String,
        steps: [String],
        outputArtifact: String,
        evaluationGates: [String]
    ) {
        self.id = id
        self.label = label
        self.trigger = trigger
        self.steps = steps
        self.outputArtifact = outputArtifact
        self.evaluationGates = evaluationGates
    }
}

public struct SeisAGIMemoryPlanningContract: Codable, Equatable, Sendable {
    public let id: String
    public let ownerRuntime: String
    public let storagePolicy: String
    public let checkpoints: [SeisAGIMemoryPlanningCheckpoint]
    public let loops: [SeisAGIMemoryPlanningLoop]

    public init(
        id: String,
        ownerRuntime: String,
        storagePolicy: String,
        checkpoints: [SeisAGIMemoryPlanningCheckpoint],
        loops: [SeisAGIMemoryPlanningLoop]
    ) {
        self.id = id
        self.ownerRuntime = ownerRuntime
        self.storagePolicy = storagePolicy
        self.checkpoints = checkpoints
        self.loops = loops
    }

    public var isReady: Bool {
        id == "seis-memory-planning-runtime" &&
            ownerRuntime.contains("Swift") &&
            ownerRuntime.contains("Core Data") &&
            ownerRuntime.contains("CloudKit") &&
            storagePolicy.contains("never persist secrets") &&
            checkpoints.count >= 5 &&
            loops.count >= 4 &&
            checkpoints.contains { $0.id == "context-intake" } &&
            checkpoints.contains { $0.id == "self-evaluation" } &&
            loops.contains { $0.id == "retrieve-compress-plan" } &&
            loops.contains { $0.id == "handoff-review-commit" }
    }
}

public struct SeisAGISystemContract: Codable, Equatable, Sendable {
    public let id: String
    public let generatedAt: String
    public let claimBoundary: String
    public let budget: SeisAGIPlatformBudget
    public let subsystems: [SeisAGISubsystemContract]
    public let pluginLanes: [SeisAGIPluginLaneContract]
    public let memoryPlanning: SeisAGIMemoryPlanningContract
    public let releaseMilestones: [SeisAGIRoadmapMilestone]
    public let implementationRoots: [String]

    public init(
        id: String,
        generatedAt: String,
        claimBoundary: String,
        budget: SeisAGIPlatformBudget,
        subsystems: [SeisAGISubsystemContract],
        pluginLanes: [SeisAGIPluginLaneContract],
        memoryPlanning: SeisAGIMemoryPlanningContract,
        releaseMilestones: [SeisAGIRoadmapMilestone],
        implementationRoots: [String]
    ) {
        self.id = id
        self.generatedAt = generatedAt
        self.claimBoundary = claimBoundary
        self.budget = budget
        self.subsystems = subsystems
        self.pluginLanes = pluginLanes
        self.memoryPlanning = memoryPlanning
        self.releaseMilestones = releaseMilestones
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
            memoryPlanning.isReady &&
            releaseMilestones.count == 3 &&
            releaseMilestones.allSatisfy(\.isTraceable) &&
            releaseMilestones.contains { $0.id == "month-02-memory-planning-mcp" } &&
            releaseMilestones.contains { $0.acceptanceGates.contains("release-evidence-current") } &&
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
        memoryPlanning: SeisAGIMemoryPlanningContract(
            id: "seis-memory-planning-runtime",
            ownerRuntime: "Swift + Foundation + Core Data + CloudKit",
            storagePolicy: "Use Core Data for local agent context records, CloudKit for optional sync metadata, and Foundation JSON for generated evidence manifests; never persist secrets.",
            checkpoints: [
                SeisAGIMemoryPlanningCheckpoint(
                    id: "context-intake",
                    label: "Context Intake",
                    phase: "inspect",
                    appleStorageSurface: "Core Data local context cache",
                    evidencePath: "AGENTS.md",
                    qualityGates: ["repo-state-read", "instruction-boundary", "secret-safety"]
                ),
                SeisAGIMemoryPlanningCheckpoint(
                    id: "task-decomposition",
                    label: "Task Decomposition",
                    phase: "plan",
                    appleStorageSurface: "Core Data task packet records",
                    evidencePath: "reports/seis-execution-packages.md",
                    qualityGates: ["small-slices", "rollback-ready", "dependency-order"]
                ),
                SeisAGIMemoryPlanningCheckpoint(
                    id: "research-evidence",
                    label: "Research Evidence",
                    phase: "research",
                    appleStorageSurface: "Foundation JSON source manifest",
                    evidencePath: "reports/seis-agi-system.md",
                    qualityGates: ["primary-source-first", "citation-trace", "claim-boundary"]
                ),
                SeisAGIMemoryPlanningCheckpoint(
                    id: "multi-agent-handoff",
                    label: "Multi-Agent Handoff",
                    phase: "coordinate",
                    appleStorageSurface: "Core Data handoff notes plus git diff summary",
                    evidencePath: "docs/agi/seis-agi-system.md",
                    qualityGates: ["single-writer-mode", "reviewer-role-separated", "human-approval"]
                ),
                SeisAGIMemoryPlanningCheckpoint(
                    id: "self-evaluation",
                    label: "Self Evaluation",
                    phase: "verify",
                    appleStorageSurface: "Foundation check transcript plus generated reports",
                    evidencePath: "reports/seis-agi-system.json",
                    qualityGates: ["deterministic-checks", "coverage-evidence", "residual-risk-log"]
                )
            ],
            loops: [
                SeisAGIMemoryPlanningLoop(
                    id: "retrieve-compress-plan",
                    label: "Retrieve Compress Plan",
                    trigger: "large or recurring SEIS goal",
                    steps: ["retrieve durable contract", "compress scope", "select smallest reversible packet", "record evidence paths"],
                    outputArtifact: "content/development/seis-agi-system.json",
                    evaluationGates: ["bounded-context", "source-backed-memory", "token-savings-target"]
                ),
                SeisAGIMemoryPlanningLoop(
                    id: "plan-execute-verify-document",
                    label: "Plan Execute Verify Document",
                    trigger: "repo modification request",
                    steps: ["inspect repo state", "plan focused change", "implement", "run checks", "update docs"],
                    outputArtifact: "reports/seis-agi-system.md",
                    evaluationGates: ["git-diff-reviewable", "swift-test", "docs-updated"]
                ),
                SeisAGIMemoryPlanningLoop(
                    id: "research-synthesize-validate",
                    label: "Research Synthesize Validate",
                    trigger: "unstable or source-sensitive claim",
                    steps: ["select source type", "collect evidence", "summarize constraints", "validate compatibility"],
                    outputArtifact: "docs/agi/seis-agi-system.md",
                    evaluationGates: ["primary-source-first", "version-compatibility", "citation-trace"]
                ),
                SeisAGIMemoryPlanningLoop(
                    id: "handoff-review-commit",
                    label: "Handoff Review Commit",
                    trigger: "agent writer role changes or commit handoff",
                    steps: ["summarize diff", "separate reviewer role", "run deterministic checks", "commit scoped change"],
                    outputArtifact: "git commit",
                    evaluationGates: ["one-writer-at-a-time", "human-readable-handoff", "no-unrelated-reverts"]
                )
            ]
        ),
        releaseMilestones: [
            SeisAGIRoadmapMilestone(
                id: "month-01-foundation-architecture-docs",
                month: 1,
                dayRange: "0-30",
                theme: "Foundation, architecture, documentation",
                focusAreas: [
                    "computer-science-foundation",
                    "software-architecture",
                    "documentation",
                    "open-source-health"
                ],
                acceptanceGates: [
                    "agi-contract-generated",
                    "agent-memory-planning-foundation-visible",
                    "github-community-health-current",
                    "quality-gates-pass"
                ],
                evidencePaths: [
                    "reports/seis-agi-system.md",
                    "reports/seis-active-mission-board.md",
                    "README.md",
                    "AGENTS.md"
                ]
            ),
            SeisAGIRoadmapMilestone(
                id: "month-02-memory-planning-mcp",
                month: 2,
                dayRange: "31-60",
                theme: "Memory, planning, MCP",
                focusAreas: [
                    "memory-architecture",
                    "planning-kernel",
                    "mcp-skills",
                    "plugin-read-write-lanes"
                ],
                acceptanceGates: [
                    "memory-checkpoints-traceable",
                    "planning-loops-deterministic",
                    "plugin-mcp-lanes-scoped",
                    "apple-first-contract-covered"
                ],
                evidencePaths: [
                    "content/development/seis-agi-system.json",
                    "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift",
                    "reports/plugin-capability-lanes.md",
                    "reports/seis-execution-runway.md"
                ]
            ),
            SeisAGIRoadmapMilestone(
                id: "month-03-agents-validation-release",
                month: 3,
                dayRange: "61-90",
                theme: "Agents, validation, release",
                focusAreas: [
                    "agent-orchestration",
                    "multi-agent-coordination",
                    "security-validation",
                    "release-readiness"
                ],
                acceptanceGates: [
                    "agent-roles-separated",
                    "security-and-human-review-gates-present",
                    "github-community-health-ready",
                    "release-evidence-current"
                ],
                evidencePaths: [
                    "docs/development/agents/README.md",
                    "SECURITY.md",
                    ".github/PULL_REQUEST_TEMPLATE.md",
                    "reports/seis-agi-system.json"
                ]
            )
        ],
        implementationRoots: [
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift",
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIMemoryPlanningStore.swift",
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIContextCompressionRuntime.swift",
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIAgentOrchestrationRuntime.swift",
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIAgentHandoffStore.swift",
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
            "Foundation, architecture, documentation",
            "Memory, planning, MCP",
            "Agents, validation, release",
            "release-evidence-current",
            "SeisAGIMemoryPlanningStore.swift",
            "SeisAGIContextCompressionRuntime.swift",
            "SeisAGIAgentOrchestrationRuntime.swift",
            "SeisAGIAgentHandoffStore.swift",
            "Memory Planning Automation",
            "Implementation Surfaces",
            "single-writer-mode",
            "no-fake-usage",
            "Core Data for local agent context records",
            "Retrieve Compress Plan",
            "Self Evaluation",
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
