import Foundation

public enum SEISAppleSurface: String, Codable, CaseIterable, Sendable {
    case web
    case macOS
    case iPadOS
    case iOS
    case sharedCore
}

public enum SEISModuleKind: String, Codable, CaseIterable, Sendable {
    case commandCenter
    case brain
    case aiCore
    case providerRegistry
    case modelRouter
    case promptEngine
    case desktopOS
    case codeIDE
    case designSystem
    case search
    case cloudSSH
    case agents
    case githubGovernance
    case publicReadiness
}

public enum SEISStatus: String, Codable, CaseIterable, Sendable {
    case planned
    case scaffolded
    case demo
    case implemented
    case blocked
    case requiresReview

    public var isLiveClaim: Bool {
        self == .implemented
    }
}

public enum SEISHealthLevel: String, Codable, CaseIterable, Sendable {
    case healthy
    case watch
    case warning
    case critical
    case unknown
}

public struct SEISModule: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let kind: SEISModuleKind
    public let title: String
    public let surface: SEISAppleSurface
    public let summary: String
    public let status: SEISStatus
    public let health: SEISHealthLevel
    public let relatedDocs: [String]
    public let nextActions: [String]
    public let risks: [String]
    public let verificationCommands: [String]
    public let isPublicSafe: Bool

    public init(
        id: String,
        kind: SEISModuleKind,
        title: String,
        surface: SEISAppleSurface,
        summary: String,
        status: SEISStatus,
        health: SEISHealthLevel,
        relatedDocs: [String] = [],
        nextActions: [String] = [],
        risks: [String] = [],
        verificationCommands: [String] = [],
        isPublicSafe: Bool = true
    ) {
        self.id = id
        self.kind = kind
        self.title = title
        self.surface = surface
        self.summary = summary
        self.status = status
        self.health = health
        self.relatedDocs = relatedDocs
        self.nextActions = nextActions
        self.risks = risks
        self.verificationCommands = verificationCommands
        self.isPublicSafe = isPublicSafe
    }
}

public struct SEISRoadmapPhase: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let surface: SEISAppleSurface
    public let status: SEISStatus
    public let outcomes: [String]

    public init(id: String, title: String, surface: SEISAppleSurface, status: SEISStatus, outcomes: [String]) {
        self.id = id
        self.title = title
        self.surface = surface
        self.status = status
        self.outcomes = outcomes
    }
}

public struct SEISCommand: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let systemImageName: String
    public let status: SEISStatus
    public let isDestructive: Bool
    public let requiresHumanReview: Bool
    public let verificationCommand: String?

    public init(
        id: String,
        title: String,
        systemImageName: String,
        status: SEISStatus,
        isDestructive: Bool,
        requiresHumanReview: Bool,
        verificationCommand: String? = nil
    ) {
        self.id = id
        self.title = title
        self.systemImageName = systemImageName
        self.status = status
        self.isDestructive = isDestructive
        self.requiresHumanReview = requiresHumanReview
        self.verificationCommand = verificationCommand
    }
}

public struct SEISPublicReadinessItem: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let status: SEISStatus
    public let evidence: String
    public let blocksRelease: Bool

    public init(id: String, title: String, status: SEISStatus, evidence: String, blocksRelease: Bool) {
        self.id = id
        self.title = title
        self.status = status
        self.evidence = evidence
        self.blocksRelease = blocksRelease
    }
}

public enum SEISNoteVisibility: String, Codable, CaseIterable, Sendable {
    case publicSafe
    case privateLocal
    case needsReview
}

public enum SEISReviewStatus: String, Codable, CaseIterable, Sendable {
    case draft
    case aiGenerated
    case humanReviewed
    case approvedForPublicUse
}

public struct SEISBrainNote: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let visibility: SEISNoteVisibility
    public let reviewStatus: SEISReviewStatus
    public let tags: [String]

    public init(id: String, title: String, visibility: SEISNoteVisibility, reviewStatus: SEISReviewStatus, tags: [String]) {
        self.id = id
        self.title = title
        self.visibility = visibility
        self.reviewStatus = reviewStatus
        self.tags = tags
    }
}

public struct SEISContextPack: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let visibility: SEISNoteVisibility
    public let includedNoteIDs: [String]
    public let allowedDestinations: [String]

    public init(id: String, title: String, visibility: SEISNoteVisibility, includedNoteIDs: [String], allowedDestinations: [String]) {
        self.id = id
        self.title = title
        self.visibility = visibility
        self.includedNoteIDs = includedNoteIDs
        self.allowedDestinations = allowedDestinations
    }
}

public struct SEISDecisionRecord: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let status: SEISReviewStatus
    public let relatedModuleKinds: [SEISModuleKind]

    public init(id: String, title: String, status: SEISReviewStatus, relatedModuleKinds: [SEISModuleKind]) {
        self.id = id
        self.title = title
        self.status = status
        self.relatedModuleKinds = relatedModuleKinds
    }
}

public struct SEISPublicPrivateBoundary: Codable, Equatable, Sendable {
    public let publicSafeCount: Int
    public let privateLocalCount: Int
    public let needsReviewCount: Int
    public let rule: String

    public init(publicSafeCount: Int, privateLocalCount: Int, needsReviewCount: Int, rule: String) {
        self.publicSafeCount = publicSafeCount
        self.privateLocalCount = privateLocalCount
        self.needsReviewCount = needsReviewCount
        self.rule = rule
    }

    public var isPublicReleaseSafe: Bool {
        privateLocalCount == 0 && needsReviewCount == 0
    }
}

public enum SEISProviderKind: String, Codable, CaseIterable, Sendable {
    case local
    case cloud
    case hybrid
}

public enum SEISDemoStatus: String, Codable, CaseIterable, Sendable {
    case noKeyDemo
    case metadataOnly
    case liveVerified
    case unavailable
}

public struct SEISProvider: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let name: String
    public let kind: SEISProviderKind
    public let requiresKey: Bool
    public let demoStatus: SEISDemoStatus

    public init(id: String, name: String, kind: SEISProviderKind, requiresKey: Bool, demoStatus: SEISDemoStatus) {
        self.id = id
        self.name = name
        self.kind = kind
        self.requiresKey = requiresKey
        self.demoStatus = demoStatus
    }
}

public struct SEISModelRoute: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let providerID: String
    public let purpose: String
    public let fallbackProviderID: String?
    public let status: SEISDemoStatus

    public init(id: String, providerID: String, purpose: String, fallbackProviderID: String?, status: SEISDemoStatus) {
        self.id = id
        self.providerID = providerID
        self.purpose = purpose
        self.fallbackProviderID = fallbackProviderID
        self.status = status
    }
}

public struct SEISPromptTemplate: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let visibility: SEISNoteVisibility
    public let allowedSurfaces: [SEISAppleSurface]

    public init(id: String, title: String, visibility: SEISNoteVisibility, allowedSurfaces: [SEISAppleSurface]) {
        self.id = id
        self.title = title
        self.visibility = visibility
        self.allowedSurfaces = allowedSurfaces
    }
}

public struct SEISDemoResponse: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let promptTemplateID: String
    public let status: SEISDemoStatus
    public let disclaimer: String

    public init(id: String, promptTemplateID: String, status: SEISDemoStatus, disclaimer: String) {
        self.id = id
        self.promptTemplateID = promptTemplateID
        self.status = status
        self.disclaimer = disclaimer
    }
}

public struct SEISSSHProfile: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let displayName: String
    public let alias: String
    public let status: SEISDemoStatus
    public let storesCredentials: Bool

    public init(id: String, displayName: String, alias: String, status: SEISDemoStatus, storesCredentials: Bool) {
        self.id = id
        self.displayName = displayName
        self.alias = alias
        self.status = status
        self.storesCredentials = storesCredentials
    }
}

public struct SEISCloudStatus: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let health: SEISHealthLevel
    public let status: SEISDemoStatus
    public let evidence: String

    public init(id: String, title: String, health: SEISHealthLevel, status: SEISDemoStatus, evidence: String) {
        self.id = id
        self.title = title
        self.health = health
        self.status = status
        self.evidence = evidence
    }
}

public struct SEISLocalDevelopmentTool: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let name: String
    public let category: String
    public let surface: SEISAppleSurface
    public let status: SEISDemoStatus
    public let requiresAccount: Bool
    public let requiresAPIKey: Bool
    public let canWriteRepository: Bool
    public let observedState: String
    public let bestFor: [String]
    public let limitations: [String]
    public let safetyNotes: [String]
    public let relatedModuleKinds: [SEISModuleKind]
    public let recommendedContextPackID: String?
    public let isPublicSafe: Bool

    public init(
        id: String,
        name: String,
        category: String,
        surface: SEISAppleSurface,
        status: SEISDemoStatus,
        requiresAccount: Bool,
        requiresAPIKey: Bool,
        canWriteRepository: Bool,
        observedState: String,
        bestFor: [String],
        limitations: [String],
        safetyNotes: [String],
        relatedModuleKinds: [SEISModuleKind],
        recommendedContextPackID: String?,
        isPublicSafe: Bool
    ) {
        self.id = id
        self.name = name
        self.category = category
        self.surface = surface
        self.status = status
        self.requiresAccount = requiresAccount
        self.requiresAPIKey = requiresAPIKey
        self.canWriteRepository = canWriteRepository
        self.observedState = observedState
        self.bestFor = bestFor
        self.limitations = limitations
        self.safetyNotes = safetyNotes
        self.relatedModuleKinds = relatedModuleKinds
        self.recommendedContextPackID = recommendedContextPackID
        self.isPublicSafe = isPublicSafe
    }
}

public struct SEISSafeCommand: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let commandPreview: String
    public let isDestructive: Bool
    public let requiresHumanReview: Bool

    public init(id: String, title: String, commandPreview: String, isDestructive: Bool, requiresHumanReview: Bool) {
        self.id = id
        self.title = title
        self.commandPreview = commandPreview
        self.isDestructive = isDestructive
        self.requiresHumanReview = requiresHumanReview
    }
}

public struct SEISAgent: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let name: String
    public let role: String
    public let allowedActions: [String]
    public let forbiddenActions: [String]

    public init(id: String, name: String, role: String, allowedActions: [String], forbiddenActions: [String]) {
        self.id = id
        self.name = name
        self.role = role
        self.allowedActions = allowedActions
        self.forbiddenActions = forbiddenActions
    }
}

public struct SEISTask: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let moduleKind: SEISModuleKind
    public let status: SEISStatus
    public let requiresReview: Bool

    public init(id: String, title: String, moduleKind: SEISModuleKind, status: SEISStatus, requiresReview: Bool) {
        self.id = id
        self.title = title
        self.moduleKind = moduleKind
        self.status = status
        self.requiresReview = requiresReview
    }
}

public struct SEISHandoff: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let fromAgentID: String
    public let summary: String
    public let nextActions: [String]
    public let verificationCommands: [String]

    public init(id: String, fromAgentID: String, summary: String, nextActions: [String], verificationCommands: [String]) {
        self.id = id
        self.fromAgentID = fromAgentID
        self.summary = summary
        self.nextActions = nextActions
        self.verificationCommands = verificationCommands
    }
}

public struct SEISRepositoryStatus: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let repositoryFullName: String
    public let branch: String
    public let status: SEISStatus
    public let publicReadiness: SEISHealthLevel

    public init(id: String, repositoryFullName: String, branch: String, status: SEISStatus, publicReadiness: SEISHealthLevel) {
        self.id = id
        self.repositoryFullName = repositoryFullName
        self.branch = branch
        self.status = status
        self.publicReadiness = publicReadiness
    }
}

public struct SEISPullRequestStatus: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let sourceBranch: String
    public let status: SEISStatus
    public let checks: [SEISCheckStatus]

    public init(id: String, title: String, sourceBranch: String, status: SEISStatus, checks: [SEISCheckStatus]) {
        self.id = id
        self.title = title
        self.sourceBranch = sourceBranch
        self.status = status
        self.checks = checks
    }
}

public struct SEISCheckStatus: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let name: String
    public let health: SEISHealthLevel
    public let evidence: String

    public init(id: String, name: String, health: SEISHealthLevel, evidence: String) {
        self.id = id
        self.name = name
        self.health = health
        self.evidence = evidence
    }
}

public struct SEISAppleDesignTokens: Codable, Equatable, Sendable {
    public let canvas: String
    public let surface: String
    public let text: String
    public let accent: String
    public let secondaryAccent: String
    public let warning: String
    public let healthy: String
    public let critical: String

    public init(
        canvas: String,
        surface: String,
        text: String,
        accent: String,
        secondaryAccent: String,
        warning: String,
        healthy: String,
        critical: String
    ) {
        self.canvas = canvas
        self.surface = surface
        self.text = text
        self.accent = accent
        self.secondaryAccent = secondaryAccent
        self.warning = warning
        self.healthy = healthy
        self.critical = critical
    }
}

public enum SEISAppleFirstFoundation {
    public static let modules: [SEISModule] = [
        SEISModule(
            id: "command-center",
            kind: .commandCenter,
            title: "SEIS Command Center",
            surface: .macOS,
            summary: "Primary native workspace for system health, modules, agents, GitHub, AI Core, and SEIS-SSH safety.",
            status: .scaffolded,
            health: .watch,
            relatedDocs: ["SEIS_MAC_APP.md", "docs/apple/MAC_APP_ARCHITECTURE.md"],
            nextActions: ["Prototype native module grid with demo data"],
            risks: ["Must not claim live provider, SSH, or CI status from metadata"],
            verificationCommands: ["swift test --package-path packages/seis_platform_swift"]
        ),
        SEISModule(
            id: "brain-ipad",
            kind: .brain,
            title: "SEIS Brain for iPadOS",
            surface: .iPadOS,
            summary: "Public-safe note metadata, context packs, decision records, and design review workspace.",
            status: .planned,
            health: .watch,
            relatedDocs: ["SEIS_IOS_IPADOS_APP.md", "docs/apple/IOS_IPADOS_ARCHITECTURE.md"],
            nextActions: ["Add note metadata browser backed by public-safe demo records"],
            risks: ["Private Obsidian vault content must remain excluded"]
        ),
        SEISModule(
            id: "ios-companion",
            kind: .publicReadiness,
            title: "SEIS iPhone Companion",
            surface: .iOS,
            summary: "Quick status, notes, GitHub/CI glance, agent reports, and Brain search.",
            status: .planned,
            health: .watch,
            relatedDocs: ["SEIS_IOS_IPADOS_APP.md"],
            nextActions: ["Define compact status and search flows"],
            risks: ["Do not force full desktop workflows onto iPhone"]
        )
    ]

    public static let roadmap: [SEISRoadmapPhase] = [
        SEISRoadmapPhase(id: "a0", title: "Apple-first strategy", surface: .sharedCore, status: .implemented, outcomes: ["Docs", "platform roles", "public-safe rules"]),
        SEISRoadmapPhase(id: "a1", title: "SwiftUI foundation", surface: .sharedCore, status: .scaffolded, outcomes: ["shared models", "demo metadata", "tests"]),
        SEISRoadmapPhase(id: "a2", title: "macOS Command Center prototype", surface: .macOS, status: .planned, outcomes: ["sidebar", "module grid", "inspector"]),
        SEISRoadmapPhase(id: "a3", title: "iPadOS SEIS Brain", surface: .iPadOS, status: .planned, outcomes: ["note browser", "context packs", "visibility badges"]),
        SEISRoadmapPhase(id: "a4", title: "iOS companion", surface: .iOS, status: .planned, outcomes: ["quick status", "agent reports", "Brain search"])
    ]

    public static let providers: [SEISProvider] = [
        SEISProvider(id: "local-demo", name: "SEIS Local Demo", kind: .local, requiresKey: false, demoStatus: .noKeyDemo),
        SEISProvider(id: "ollama-metadata", name: "Ollama Metadata", kind: .local, requiresKey: false, demoStatus: .metadataOnly),
        SEISProvider(id: "cloud-provider-placeholder", name: "Cloud Provider Placeholder", kind: .cloud, requiresKey: true, demoStatus: .metadataOnly)
    ]

    public static let sshProfiles: [SEISSSHProfile] = [
        SEISSSHProfile(id: "seis-ssh-demo", displayName: "SEIS-SSH Demo Profile", alias: "SEIS-SSH", status: .metadataOnly, storesCredentials: false)
    ]

    public static let localDevelopmentTools: [SEISLocalDevelopmentTool] = [
        SEISLocalDevelopmentTool(
            id: "xcode-seis-platform-swift",
            name: "Xcode",
            category: "Apple native IDE",
            surface: .macOS,
            status: .metadataOnly,
            requiresAccount: false,
            requiresAPIKey: false,
            canWriteRepository: true,
            observedState: "Xcode 26.6 welcome window shows the recent SEIS Swift Package at packages/seis_platform_swift.",
            bestFor: [
                "Swift Package navigation",
                "SwiftUI native shell review",
                "macOS Command Center prototype inspection"
            ],
            limitations: [
                "Opening Xcode does not prove the native shell builds or runs.",
                "Xcode edits must stay coordinated with the single-writer policy."
            ],
            safetyNotes: [
                "Do not add meaningless Swift files for language statistics.",
                "Keep provider keys, SSH keys, and private vault material out of Xcode project files."
            ],
            relatedModuleKinds: [.commandCenter, .brain, .publicReadiness],
            recommendedContextPackID: "seis-apple-native-context",
            isPublicSafe: true
        )
    ]

    public static let brainNotes: [SEISBrainNote] = [
        SEISBrainNote(
            id: "apple-first-platform-strategy",
            title: "Apple-first platform strategy",
            visibility: .publicSafe,
            reviewStatus: .draft,
            tags: ["apple-first", "platform", "public-readiness"]
        ),
        SEISBrainNote(
            id: "second-brain-public-boundary",
            title: "Second Brain public/private boundary",
            visibility: .publicSafe,
            reviewStatus: .draft,
            tags: ["second-brain", "obsidian", "no-private-vault"]
        ),
        SEISBrainNote(
            id: "seis-ssh-safety-center",
            title: "SEIS-SSH safety center",
            visibility: .publicSafe,
            reviewStatus: .draft,
            tags: ["seis-ssh", "metadata-only", "no-credentials"]
        )
    ]

    public static let contextPacks: [SEISContextPack] = [
        SEISContextPack(
            id: "seis-apple-native-context",
            title: "SEIS Apple Native Context",
            visibility: .publicSafe,
            includedNoteIDs: ["apple-first-platform-strategy", "second-brain-public-boundary", "seis-ssh-safety-center"],
            allowedDestinations: ["Codex", "Xcode", "Public GitHub"]
        ),
        SEISContextPack(
            id: "seis-ssh-review-context",
            title: "SEIS-SSH Review Context",
            visibility: .publicSafe,
            includedNoteIDs: ["seis-ssh-safety-center", "second-brain-public-boundary"],
            allowedDestinations: ["Codex", "Xcode", "Public GitHub"]
        )
    ]

    public static let decisionRecords: [SEISDecisionRecord] = [
        SEISDecisionRecord(
            id: "native-swiftpm-first",
            title: "Use the active SwiftPM package for Apple-native work before a full Xcode project",
            status: .draft,
            relatedModuleKinds: [.commandCenter, .publicReadiness]
        ),
        SEISDecisionRecord(
            id: "metadata-before-live-ssh",
            title: "Keep SEIS-SSH metadata-only until live access is explicitly verified",
            status: .draft,
            relatedModuleKinds: [.cloudSSH, .publicReadiness]
        ),
        SEISDecisionRecord(
            id: "public-safe-brain-first",
            title: "Keep Second Brain context packs public-safe before private vault import",
            status: .draft,
            relatedModuleKinds: [.brain, .githubGovernance]
        )
    ]

    public static let cloudStatuses: [SEISCloudStatus] = [
        SEISCloudStatus(
            id: "seis-ssh-metadata-only",
            title: "SEIS-SSH public-safe metadata",
            health: .watch,
            status: .metadataOnly,
            evidence: "docs/deployment/seis-ssh-access-model.md"
        ),
        SEISCloudStatus(
            id: "seis-ssh-live-disabled",
            title: "Live SSH remains approval-gated",
            health: .healthy,
            status: .metadataOnly,
            evidence: "npm run cloud:ssh:online:strict is required before any live claim"
        )
    ]

    public static let forbiddenSSHCommandPatterns: [String] = [
        "rm -rf",
        "git push --force",
        "private key printing",
        "token printing",
        "remote destructive cleanup"
    ]

    public static let safeCommands: [SEISSafeCommand] = [
        SEISSafeCommand(id: "swift-test", title: "Run Swift package tests", commandPreview: "swift test --package-path packages/seis_platform_swift", isDestructive: false, requiresHumanReview: false),
        SEISSafeCommand(id: "second-brain-readiness", title: "Review Second Brain readiness contracts", commandPreview: "npm run check:seis-second-brain-readiness-contracts", isDestructive: false, requiresHumanReview: false),
        SEISSafeCommand(id: "ssh-access-model", title: "Check SEIS-SSH access model", commandPreview: "npm run check:seis-ssh-access-model", isDestructive: false, requiresHumanReview: true),
        SEISSafeCommand(id: "ssh-review", title: "Review SEIS-SSH safety", commandPreview: "open docs/deployment/seis-ssh-access-model.md", isDestructive: false, requiresHumanReview: true)
    ]

    public static let designTokens = SEISAppleDesignTokens(
        canvas: "deep-black",
        surface: "graphite-charcoal",
        text: "off-white",
        accent: "electric-cyan",
        secondaryAccent: "soft-violet",
        warning: "amber-orange",
        healthy: "green",
        critical: "critical-red"
    )

    public static let publicReadiness: [SEISPublicReadinessItem] = [
        SEISPublicReadinessItem(id: "apple-docs", title: "Apple-first docs exist", status: .implemented, evidence: "SEIS_APPLE_FIRST.md and docs/apple", blocksRelease: false),
        SEISPublicReadinessItem(id: "no-key-demo", title: "No-key demo remains explicit", status: .implemented, evidence: "README demo mode and Apple docs", blocksRelease: false),
        SEISPublicReadinessItem(id: "native-brain-ssh-snapshot", title: "Native Brain and SSH readiness snapshot", status: .scaffolded, evidence: "SeisPlatformKit public-safe metadata", blocksRelease: false),
        SEISPublicReadinessItem(id: "xcode-tool-boundary", title: "Xcode tool boundary is public-safe", status: .scaffolded, evidence: "Xcode is local native tooling; repository writes remain handoff-gated", blocksRelease: false),
        SEISPublicReadinessItem(id: "no-secrets", title: "No native secrets", status: .requiresReview, evidence: "Secret scan required before PR", blocksRelease: true)
    ]

    public static var brainPublicPrivateBoundary: SEISPublicPrivateBoundary {
        SEISPublicPrivateBoundary(
            publicSafeCount: brainNotes.filter { $0.visibility == .publicSafe }.count + contextPacks.filter { $0.visibility == .publicSafe }.count,
            privateLocalCount: brainNotes.filter { $0.visibility == .privateLocal }.count + contextPacks.filter { $0.visibility == .privateLocal }.count,
            needsReviewCount: brainNotes.filter { $0.visibility == .needsReview }.count + contextPacks.filter { $0.visibility == .needsReview }.count,
            rule: "Native SEIS Brain metadata may include public-safe summaries, context-pack IDs, and safety tags, but never private vault bodies, absolute private vault paths, credentials, or live SSH access claims."
        )
    }

    public static var hasPublicSafeBrainAndSSHReadiness: Bool {
        let brainNoteIDs = Set(brainNotes.map(\.id))
        let contextPacksUseKnownNotes = contextPacks.allSatisfy { contextPack in
            contextPack.visibility == .publicSafe &&
                Set(contextPack.includedNoteIDs).isSubset(of: brainNoteIDs) &&
                contextPack.allowedDestinations.allSatisfy { !$0.lowercased().contains("private") }
        }

        return !brainNotes.isEmpty &&
            !contextPacks.isEmpty &&
            contextPacksUseKnownNotes &&
            decisionRecords.allSatisfy { $0.status != .approvedForPublicUse } &&
            brainPublicPrivateBoundary.isPublicReleaseSafe &&
            sshProfiles.allSatisfy { !$0.storesCredentials && $0.status != .liveVerified } &&
            cloudStatuses.allSatisfy { $0.status != .liveVerified } &&
            localDevelopmentTools.allSatisfy { $0.isPublicSafe && $0.status != .liveVerified } &&
            forbiddenSSHCommandPatterns.contains("rm -rf")
    }

    public static var hasOnlyPublicSafeDemoMetadata: Bool {
        modules.allSatisfy(\.isPublicSafe) &&
            providers.allSatisfy { $0.demoStatus != .liveVerified || !$0.requiresKey } &&
            sshProfiles.allSatisfy { !$0.storesCredentials && $0.status != .liveVerified } &&
            localDevelopmentTools.allSatisfy { $0.isPublicSafe && $0.status != .liveVerified } &&
            safeCommands.allSatisfy { !$0.isDestructive } &&
            hasPublicSafeBrainAndSSHReadiness
    }
}
