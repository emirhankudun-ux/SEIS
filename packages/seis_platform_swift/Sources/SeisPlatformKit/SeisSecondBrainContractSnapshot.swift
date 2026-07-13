import Foundation

public struct SeisSecondBrainVaultNote: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let folder: String
    public let path: String
    public let status: String
    public let summary: String
    public let tags: [String]
    public let links: [String]

    public var isLocalNote: Bool {
        path.hasPrefix("/home/seis/SecondBrain/") &&
            !title.isEmpty &&
            !summary.isEmpty &&
            !tags.isEmpty
    }
}

public struct SeisSecondBrainAgentLane: Codable, Equatable, Identifiable, Sendable {
    public let agent: String
    public let permission: String
    public let duty: String

    public var id: String { agent }
    public var isDeclared: Bool { !agent.isEmpty && !permission.isEmpty && !duty.isEmpty }
}

public struct SeisSecondBrainAgentRosterEntry: Codable, Equatable, Identifiable, Sendable {
    public let agent: String
    public let status: String
    public let duty: String

    public var id: String { agent }
    public var isPlanOnly: Bool {
        !agent.isEmpty && !duty.isEmpty && (status == "status-plan-only" || status == "blocking-review-gate")
    }
}

public struct SeisSecondBrainPipelineStep: Codable, Equatable, Identifiable, Sendable {
    public let step: String
    public let status: String
    public let detail: String

    public var id: String { step }
    public var isDeclared: Bool { !step.isEmpty && !status.isEmpty && !detail.isEmpty }
}

public struct SeisSecondBrainTrainingCurriculumReference: Codable, Equatable, Sendable {
    public let status: String
    public let contractPath: String
    public let reportPath: String
    public let boundary: String
}

public struct SeisSecondBrainObsidianBridge: Codable, Equatable, Sendable {
    public let status: String
    public let currentMode: String
    public let allowedToday: [String]
    public let forbiddenToday: [String]
}

public struct SeisSecondBrainSecurityBoundary: Codable, Equatable, Sendable {
    public let storesSecrets: Bool
    public let providerCalls: Bool
    public let sshExecution: Bool
    public let deployment: Bool
    public let githubMutation: Bool
    public let requiresHumanReviewBeforePublicUse: Bool
}

public enum SeisSecondBrainContractSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisSecondBrainContractSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let status: String
    public let qualityGate: String
    public let desktopAppId: String
    public let routeId: String
    public let vaultRoot: String
    public let trainingPackPath: String
    public let releaseReviewPacketPath: String
    public let languageModelTrainingCurriculum: SeisSecondBrainTrainingCurriculumReference
    public let obsidianBridge: SeisSecondBrainObsidianBridge
    public let securityBoundary: SeisSecondBrainSecurityBoundary
    public let installedAiProfiles: [String]
    public let managedSubAgentLanes: [String]
    public let vaultNotes: [SeisSecondBrainVaultNote]
    public let agentLanes: [SeisSecondBrainAgentLane]
    public let autonomousAgentRoster: [SeisSecondBrainAgentRosterEntry]
    public let pipeline: [SeisSecondBrainPipelineStep]
    public let githubGates: [String]

    public static func validated(from data: Data) throws -> SeisSecondBrainContractSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisSecondBrainContractSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisSecondBrainContractSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-second-brain-system" || title != "SEIS Second Brain" || status != "local-demo" || qualityGate != "npm run check:seis-second-brain" { issues.append("Second Brain identity or quality gate is invalid") }
        if desktopAppId != "second-brain" || routeId != "seis-second-brain-app" || vaultRoot != "/home/seis/SecondBrain" || !trainingPackPath.hasPrefix("/home/seis/SecondBrain/") { issues.append("Second Brain local app or vault boundary is invalid") }
        if languageModelTrainingCurriculum.status != "planned-training-contract" || languageModelTrainingCurriculum.contractPath != "content/development/seis-language-model-training-curriculum.json" || languageModelTrainingCurriculum.reportPath.isEmpty || !languageModelTrainingCurriculum.boundary.contains("No model install") { issues.append("Second Brain training boundary is incomplete") }
        if obsidianBridge.status != "planned" || obsidianBridge.currentMode != "browser-local Markdown vault only" || !obsidianBridge.forbiddenToday.contains("import private Obsidian vaults") || !obsidianBridge.forbiddenToday.contains("read host filesystem vaults") || !obsidianBridge.forbiddenToday.contains("execute SSH or deployment commands") { issues.append("Second Brain Obsidian bridge boundary is unsafe") }
        if securityBoundary.storesSecrets || securityBoundary.providerCalls || securityBoundary.sshExecution || securityBoundary.deployment || securityBoundary.githubMutation || !securityBoundary.requiresHumanReviewBeforePublicUse { issues.append("Second Brain security boundary is unsafe") }
        let requiredProfiles = Set(["codex-operator", "seis-local-demo", "claude-review-profile", "qwen-review-profile", "gemini-validation-profile", "ollama-local-profile"])
        if installedAiProfiles.count < 6 || !requiredProfiles.isSubset(of: Set(installedAiProfiles)) { issues.append("Second Brain installed AI profile inventory is incomplete") }
        let requiredManagedLanes = Set(["SEIS Hub", "SEIS Cloud", "SEIS-Code", "SEIS-Design", "SEIS-DATA", "SEIS-Security", "SEIS-Research", "SEIS-Automation", "SEIS-Product"])
        if managedSubAgentLanes.count < 9 || !requiredManagedLanes.isSubset(of: Set(managedSubAgentLanes)) { issues.append("Second Brain managed lane inventory is incomplete") }
        let noteIDs = Set(vaultNotes.map(\.id))
        if vaultNotes.count < 6 || noteIDs.count != vaultNotes.count || !vaultNotes.allSatisfy(\.isLocalNote) || vaultNotes.contains(where: { $0.links.contains(where: { !noteIDs.contains($0) }) }) { issues.append("Second Brain vault note graph is incomplete or escapes local scope") }
        let requiredAgentLanes = Set(["Architect Agent", "Code Agent", "Design Agent", "Search Agent", "Security Agent", "Documentation Agent", "Research Agent", "Automation Agent", "Product Agent"])
        if agentLanes.count < 9 || !requiredAgentLanes.isSubset(of: Set(agentLanes.map(\.agent))) || !agentLanes.allSatisfy(\.isDeclared) { issues.append("Second Brain agent lane inventory is incomplete") }
        let requiredRoster = Set(["Architect Agent", "Code Agent", "Design Agent", "UI/UX Agent", "Research Agent", "Search Agent", "Security Agent", "DevOps Agent", "Documentation Agent", "QA Agent", "Cloud Agent", "Automation Agent", "Product Agent"])
        if autonomousAgentRoster.count < 13 || !requiredRoster.isSubset(of: Set(autonomousAgentRoster.map(\.agent))) || !autonomousAgentRoster.allSatisfy(\.isPlanOnly) { issues.append("Second Brain autonomous roster is not plan-only") }
        if pipeline.count < 4 || !pipeline.allSatisfy(\.isDeclared) || !pipeline.contains(where: { $0.step == "Publish" && $0.status == "blocked-until-approved" }) { issues.append("Second Brain pipeline is incomplete or publish is not blocked") }
        if !githubGates.contains("no secrets or private vault content") || !githubGates.contains("mock, planned, disabled, and real labels are explicit") || !githubGates.contains(where: { $0.contains("human approval before push") }) { issues.append("Second Brain GitHub gates are incomplete") }
        return issues
    }

    public var isMetadataOnly: Bool { validationIssues.isEmpty && !securityBoundary.storesSecrets && !securityBoundary.providerCalls && !securityBoundary.sshExecution && !securityBoundary.deployment && !securityBoundary.githubMutation }
    public var vaultNoteCount: Int { vaultNotes.count }
    public var managedLaneCount: Int { managedSubAgentLanes.count }
    public var firstNotes: ArraySlice<SeisSecondBrainVaultNote> { vaultNotes.prefix(3) }
}
