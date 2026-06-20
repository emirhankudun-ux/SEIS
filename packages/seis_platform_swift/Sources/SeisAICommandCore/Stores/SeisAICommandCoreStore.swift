import Foundation
import SeisPlatformKit

@MainActor
final class SeisAICommandCoreStore: ObservableObject {
    @Published var selectedSection: CommandCoreSection = .workspace
    @Published var prompt: String
    @Published var mode: SeisAICommandCoreTaskMode
    @Published var promptVersion: String
    @Published var promptNotes: String
    @Published var approvalRequired: Bool
    @Published var redactSecrets: Bool
    @Published var autonomyLevel: Double
    @Published var approved: Bool
    @Published var agentFilter: String
    @Published var searchText: String
    @Published private(set) var run: SeisAICommandCoreRun
    @Published private(set) var auditEvents: [SeisAICommandCoreAuditEvent]

    private var runNumber: Int
    private let storageKey = "seis.ai.commandCore.snapshot"

    struct Snapshot: Codable {
        var prompt: String
        var mode: SeisAICommandCoreTaskMode
        var promptVersion: String
        var promptNotes: String
        var approvalRequired: Bool
        var redactSecrets: Bool
        var autonomyLevel: Int
        var approved: Bool
        var agentFilter: String
        var runNumber: Int
        var auditEvents: [SeisAICommandCoreAuditEvent]
    }

    init() {
        let snapshot = Self.loadSnapshot()
        let initialPrompt = snapshot?.prompt ?? SeisAICommandCoreEngine.defaultPrompt
        let initialMode = snapshot?.mode ?? .plan
        let initialPromptVersion = snapshot?.promptVersion ?? SeisAICommandCoreEngine.promptVersions[0]
        let initialPromptNotes = snapshot?.promptNotes ?? "Keep output bounded, evidence-led, reversible, and explicit about missing credentials."
        let initialApprovalRequired = snapshot?.approvalRequired ?? true
        let initialRedactSecrets = snapshot?.redactSecrets ?? true
        let initialAutonomyLevel = snapshot?.autonomyLevel ?? 1
        let initialRunNumber = snapshot?.runNumber ?? 1

        prompt = initialPrompt
        mode = initialMode
        promptVersion = initialPromptVersion
        promptNotes = initialPromptNotes
        approvalRequired = initialApprovalRequired
        redactSecrets = initialRedactSecrets
        autonomyLevel = Double(initialAutonomyLevel)
        approved = snapshot?.approved ?? false
        agentFilter = snapshot?.agentFilter ?? "All"
        searchText = ""
        runNumber = initialRunNumber
        auditEvents = snapshot?.auditEvents ?? [
            SeisAICommandCoreEngine.makeAudit(title: "Desktop app initialized", detail: "Local deterministic AI command core started."),
            SeisAICommandCoreEngine.makeAudit(title: "Provider disconnected", detail: "No provider key is requested or stored.")
        ]
        run = SeisAICommandCoreEngine.makeRun(
            prompt: initialPrompt,
            mode: initialMode,
            promptVersion: initialPromptVersion,
            approvalRequired: initialApprovalRequired,
            redactSecrets: initialRedactSecrets,
            autonomyLevel: initialAutonomyLevel,
            runNumber: initialRunNumber
        )
    }

    var canApprove: Bool {
        approvalRequired && !approved
    }

    var visibleAgents: [SeisAICommandCoreAgent] {
        run.agents.filter { agent in
            agentFilter == "All" || agent.status == agentFilter
        }
    }

    var searchableSections: [CommandCoreSection] {
        guard !searchText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return CommandCoreSection.allCases
        }
        let query = searchText.lowercased()
        return CommandCoreSection.allCases.filter {
            $0.title.lowercased().contains(query) || $0.subtitle.lowercased().contains(query)
        }
    }

    func generatePlan() {
        runNumber += 1
        approved = false
        refreshRun()
        appendAudit(title: "Plan generated", detail: "\(run.route.selected.name) routed \(run.steps.count) desktop plan steps.")
    }

    func runEvaluation() {
        refreshRun()
        appendAudit(title: "Evaluation refreshed", detail: "Composite score \(run.compositeScore)/100.")
    }

    func approveRun() {
        guard canApprove else { return }
        approved = true
        appendAudit(title: "Run approved", detail: "Human approval recorded. No privileged action was executed.")
    }

    func updatePromptSettings() {
        approved = false
        refreshRun()
        appendAudit(title: "Prompt settings saved", detail: "\(promptVersion) applied with updated run notes.")
    }

    func updateRiskControls() {
        approved = !approvalRequired
        refreshRun()
        appendAudit(title: "Risk controls changed", detail: "Approval \(approvalRequired ? "required" : "not required"), redaction \(redactSecrets ? "enabled" : "disabled").")
    }

    @discardableResult
    func applyBridgeURL(_ url: URL) -> Bool {
        guard let payload = SeisAICommandCoreBridge.parseRunURL(url) else {
            appendAudit(title: "Bridge URL rejected", detail: "Unsupported or incomplete macOS handoff URL.")
            return false
        }

        prompt = payload.prompt
        mode = payload.mode
        promptVersion = payload.promptVersion
        if !payload.promptNotes.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            promptNotes = payload.promptNotes
        }
        approvalRequired = payload.approvalRequired
        redactSecrets = payload.redactSecrets
        autonomyLevel = Double(payload.autonomyLevel)
        approved = !payload.approvalRequired
        selectedSection = .workspace
        runNumber += 1
        refreshRun()
        appendAudit(title: "Web handoff received", detail: "\(payload.source) opened \(mode.title) mode as \(run.id).")
        return true
    }

    func reset() {
        prompt = SeisAICommandCoreEngine.defaultPrompt
        mode = .plan
        promptVersion = SeisAICommandCoreEngine.promptVersions[0]
        promptNotes = "Keep output bounded, evidence-led, reversible, and explicit about missing credentials."
        approvalRequired = true
        redactSecrets = true
        autonomyLevel = 1
        approved = false
        agentFilter = "All"
        searchText = ""
        runNumber = 1
        auditEvents = [
            SeisAICommandCoreEngine.makeAudit(title: "Demo reset", detail: "Local desktop state returned to defaults.")
        ]
        refreshRun()
        persist()
    }

    func exportAuditText() -> String {
        let formatter = ISO8601DateFormatter()
        let rows = auditEvents.map { event in
            "[\(formatter.string(from: event.createdAt))] \(event.title): \(event.detail)"
        }
        return rows.joined(separator: "\n")
    }

    private func refreshRun() {
        run = SeisAICommandCoreEngine.makeRun(
            prompt: prompt,
            mode: mode,
            promptVersion: promptVersion,
            approvalRequired: approvalRequired,
            redactSecrets: redactSecrets,
            autonomyLevel: Int(autonomyLevel),
            runNumber: runNumber
        )
        persist()
    }

    private func appendAudit(title: String, detail: String) {
        auditEvents.append(SeisAICommandCoreEngine.makeAudit(title: title, detail: detail))
        if auditEvents.count > 60 {
            auditEvents = Array(auditEvents.suffix(60))
        }
        persist()
    }

    private func persist() {
        let snapshot = Snapshot(
            prompt: prompt,
            mode: mode,
            promptVersion: promptVersion,
            promptNotes: promptNotes,
            approvalRequired: approvalRequired,
            redactSecrets: redactSecrets,
            autonomyLevel: Int(autonomyLevel),
            approved: approved,
            agentFilter: agentFilter,
            runNumber: runNumber,
            auditEvents: auditEvents
        )

        guard let data = try? JSONEncoder().encode(snapshot) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
    }

    private static func loadSnapshot() -> Snapshot? {
        guard let data = UserDefaults.standard.data(forKey: "seis.ai.commandCore.snapshot") else {
            return nil
        }
        return try? JSONDecoder().decode(Snapshot.self, from: data)
    }
}
