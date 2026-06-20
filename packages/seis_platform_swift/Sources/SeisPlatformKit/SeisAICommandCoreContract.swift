import Foundation

public enum SeisAICommandCoreTaskMode: String, CaseIterable, Codable, Sendable {
    case plan
    case build
    case review
    case security

    public var title: String {
        switch self {
        case .plan:
            "Plan"
        case .build:
            "Build"
        case .review:
            "Review"
        case .security:
            "Security"
        }
    }
}

public struct SeisAICommandCoreProfile: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let name: String
    public let strengths: [String]
    public let summary: String
    public let score: Int
}

public struct SeisAICommandCoreRoute: Codable, Equatable, Sendable {
    public let selected: SeisAICommandCoreProfile
    public let candidates: [SeisAICommandCoreProfile]
    public let rationale: String
}

public struct SeisAICommandCoreRisk: Codable, Equatable, Sendable {
    public let score: Int
    public let level: String
    public let summary: String
}

public struct SeisAICommandCorePlanStep: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let detail: String
}

public struct SeisAICommandCoreAgent: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let name: String
    public let lane: String
    public let role: String
    public let status: String
    public let progress: Int
}

public struct SeisAICommandCoreKnowledge: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let trust: String
    public let summary: String
    public let weight: Int
}

public struct SeisAICommandCoreEvaluation: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let name: String
    public let score: Int
    public let note: String
}

public struct SeisAICommandCoreAuditEvent: Codable, Equatable, Identifiable, Sendable {
    public let id: UUID
    public let title: String
    public let detail: String
    public let createdAt: Date

    public init(id: UUID = UUID(), title: String, detail: String, createdAt: Date = Date()) {
        self.id = id
        self.title = title
        self.detail = detail
        self.createdAt = createdAt
    }
}

public struct SeisAICommandCoreRun: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let traceID: String
    public let prompt: String
    public let promptVersion: String
    public let mode: SeisAICommandCoreTaskMode
    public let route: SeisAICommandCoreRoute
    public let risk: SeisAICommandCoreRisk
    public let steps: [SeisAICommandCorePlanStep]
    public let agents: [SeisAICommandCoreAgent]
    public let knowledge: [SeisAICommandCoreKnowledge]
    public let evaluations: [SeisAICommandCoreEvaluation]
    public let compositeScore: Int
    public let createdAt: Date
}

public enum SeisAICommandCoreEngine {
    public static let defaultPrompt = "Build a SEIS AI desktop demo app that routes requests, coordinates supervised agents, checks risk, cites knowledge, runs evaluation, and waits for approval without calling a real provider."

    public static let promptVersions = [
        "seis-command-v0.3",
        "seis-review-v0.2",
        "seis-security-v0.1"
    ]

    public static func makeRun(
        prompt: String,
        mode: SeisAICommandCoreTaskMode,
        promptVersion: String,
        approvalRequired: Bool,
        redactSecrets: Bool,
        autonomyLevel: Int,
        runNumber: Int
    ) -> SeisAICommandCoreRun {
        let boundedPrompt = normalizedPrompt(prompt)
        let route = routeTask(prompt: boundedPrompt, mode: mode)
        let risk = computeRisk(prompt: boundedPrompt, autonomyLevel: autonomyLevel, approvalRequired: approvalRequired)
        let steps = generateSteps(prompt: boundedPrompt, mode: mode, selectedProfile: route.selected.name, riskLevel: risk.level)
        let agents = generateAgents(selectedProfile: route.selected.name, mode: mode, riskLevel: risk.level)
        let knowledge = selectKnowledge(prompt: boundedPrompt, riskLevel: risk.level)
        let evaluations = evaluate(prompt: boundedPrompt, steps: steps, knowledge: knowledge, risk: risk, redactSecrets: redactSecrets)
        let compositeScore = evaluations.isEmpty ? 0 : evaluations.map(\.score).reduce(0, +) / evaluations.count

        return SeisAICommandCoreRun(
            id: "SEIS-DESKTOP-\(String(format: "%03d", runNumber))",
            traceID: "desktop-trace-\(String(format: "%03d", runNumber))",
            prompt: boundedPrompt,
            promptVersion: promptVersion,
            mode: mode,
            route: route,
            risk: risk,
            steps: steps,
            agents: agents,
            knowledge: knowledge,
            evaluations: evaluations,
            compositeScore: compositeScore,
            createdAt: Date()
        )
    }

    public static func routeTask(prompt: String, mode: SeisAICommandCoreTaskMode) -> SeisAICommandCoreRoute {
        let lowercasedPrompt = prompt.lowercased()
        let scored = baseProfiles.map { profile in
            let keywordScore = profile.strengths.reduce(28) { score, keyword in
                lowercasedPrompt.contains(keyword) ? score + 18 : score
            }
            let modeBonus = modeBonus(for: profile.id, mode: mode)
            return SeisAICommandCoreProfile(
                id: profile.id,
                name: profile.name,
                strengths: profile.strengths,
                summary: profile.summary,
                score: min(98, keywordScore + modeBonus)
            )
        }
        .sorted { $0.score > $1.score }

        let selected = scored[0]
        return SeisAICommandCoreRoute(
            selected: selected,
            candidates: scored,
            rationale: "\(selected.name) is selected because the request maps to \(selected.strengths.prefix(3).joined(separator: ", ")). Provider access remains disconnected."
        )
    }

    public static func computeRisk(prompt: String, autonomyLevel: Int, approvalRequired: Bool) -> SeisAICommandCoreRisk {
        let lowercasedPrompt = prompt.lowercased()
        let riskyTerms = ["secret", "key", "token", "ssh", "deploy", "delete", "production", "credential", "firewall"]
        var score = 22 + max(0, min(3, autonomyLevel)) * 14

        for term in riskyTerms where lowercasedPrompt.contains(term) {
            score += 10
        }
        if approvalRequired {
            score -= 8
        }
        if lowercasedPrompt.contains("without calling a real provider") || lowercasedPrompt.contains("local") {
            score -= 8
        }

        score = max(5, min(96, score))
        let level: String
        if score >= 68 {
            level = "High"
        } else if score >= 38 {
            level = "Medium"
        } else {
            level = "Low"
        }

        let summary: String
        switch level {
        case "High":
            summary = "Needs explicit human approval and no privileged execution."
        case "Medium":
            summary = "Safe for local demo execution with approval and redaction controls."
        default:
            summary = "Low-risk local planning flow."
        }

        return SeisAICommandCoreRisk(score: score, level: level, summary: summary)
    }

    public static func makeAudit(title: String, detail: String) -> SeisAICommandCoreAuditEvent {
        SeisAICommandCoreAuditEvent(title: title, detail: detail)
    }

    private static func normalizedPrompt(_ prompt: String) -> String {
        let trimmed = prompt.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? defaultPrompt : trimmed
    }

    private static func generateSteps(
        prompt: String,
        mode: SeisAICommandCoreTaskMode,
        selectedProfile: String,
        riskLevel: String
    ) -> [SeisAICommandCorePlanStep] {
        var steps = [
            SeisAICommandCorePlanStep(
                id: "classify",
                title: "Classify the desktop request",
                detail: "Route the \(mode.title) task through \(selectedProfile) before any action."
            ),
            SeisAICommandCorePlanStep(
                id: "compose",
                title: "Create a bounded plan",
                detail: "Break the request into reversible work packages with explicit validation."
            ),
            SeisAICommandCorePlanStep(
                id: "coordinate",
                title: "Coordinate supervised agents",
                detail: "Assign architecture, SwiftUI, security, documentation, QA, and operations roles."
            ),
            SeisAICommandCorePlanStep(
                id: "evidence",
                title: "Attach evidence",
                detail: "Cite repository instructions, security policy, README context, and local implementation notes."
            ),
            SeisAICommandCorePlanStep(
                id: "evaluate",
                title: "Evaluate before approval",
                detail: "Score clarity, security, testability, accessibility, and provenance; current risk is \(riskLevel)."
            )
        ]

        if prompt.lowercased().contains("desktop") || prompt.lowercased().contains("macos") {
            steps.append(
                SeisAICommandCorePlanStep(
                    id: "desktop",
                    title: "Expose desktop affordances",
                    detail: "Use sidebar selection, toolbar commands, keyboard shortcuts, settings, and inspector controls."
                )
            )
        }

        return steps
    }

    private static func generateAgents(
        selectedProfile: String,
        mode: SeisAICommandCoreTaskMode,
        riskLevel: String
    ) -> [SeisAICommandCoreAgent] {
        agentCatalog.enumerated().map { index, agent in
            let active = selectedProfile.lowercased().contains(agent.id) || agent.lane.lowercased() == mode.rawValue
            let review = agent.id == "security" && riskLevel != "Low"
            let status = review ? "Review" : active ? "Running" : "Ready"
            let progress = status == "Running" ? 78 : status == "Review" ? 52 : 34 + index * 7
            return SeisAICommandCoreAgent(
                id: agent.id,
                name: agent.name,
                lane: agent.lane,
                role: agent.role,
                status: status,
                progress: min(progress, 94)
            )
        }
    }

    private static func selectKnowledge(prompt: String, riskLevel: String) -> [SeisAICommandCoreKnowledge] {
        let lowercasedPrompt = prompt.lowercased()
        return knowledgeCatalog.map { item in
            var weight = 72
            if lowercasedPrompt.contains("security"), item.id == "security" { weight += 17 }
            if lowercasedPrompt.contains("agent"), item.id == "agents" { weight += 14 }
            if lowercasedPrompt.contains("desktop"), item.id == "desktop" { weight += 18 }
            if riskLevel != "Low", item.id == "security" { weight += 8 }
            return SeisAICommandCoreKnowledge(
                id: item.id,
                title: item.title,
                trust: item.trust,
                summary: item.summary,
                weight: min(weight, 99)
            )
        }
        .sorted { $0.weight > $1.weight }
    }

    private static func evaluate(
        prompt: String,
        steps: [SeisAICommandCorePlanStep],
        knowledge: [SeisAICommandCoreKnowledge],
        risk: SeisAICommandCoreRisk,
        redactSecrets: Bool
    ) -> [SeisAICommandCoreEvaluation] {
        let clarity = prompt.count > 80 ? 91 : 78
        let security = risk.level == "High" ? 70 : risk.level == "Medium" ? 84 : 92
        let testability = steps.count >= 5 ? 88 : 76
        let provenance = knowledge.count >= 4 ? 90 : 79
        let privacy = redactSecrets ? 93 : 68

        return [
            SeisAICommandCoreEvaluation(id: "clarity", name: "Clarity", score: clarity, note: "Request maps to concrete steps and visible desktop state."),
            SeisAICommandCoreEvaluation(id: "security", name: "Security", score: security, note: risk.summary),
            SeisAICommandCoreEvaluation(id: "testability", name: "Testability", score: testability, note: "Swift contract tests and local build checks are available."),
            SeisAICommandCoreEvaluation(id: "provenance", name: "Provenance", score: provenance, note: "Official instructions, security rules, README, and implementation notes are separated."),
            SeisAICommandCoreEvaluation(id: "privacy", name: "Privacy", score: privacy, note: redactSecrets ? "Redaction is enabled and provider calls are disconnected." : "Redaction is disabled for demo display.")
        ]
    }

    private static func modeBonus(for profileID: String, mode: SeisAICommandCoreTaskMode) -> Int {
        switch (profileID, mode) {
        case ("architecture-planner", .plan):
            18
        case ("implementation-builder", .build):
            24
        case ("evaluation-critic", .review):
            24
        case ("security-reviewer", .security):
            24
        default:
            0
        }
    }

    private static let baseProfiles = [
        SeisAICommandCoreProfile(
            id: "architecture-planner",
            name: "Architecture Planner",
            strengths: ["architecture", "roadmap", "agent", "router", "system", "docs", "governance"],
            summary: "System boundaries, staged plans, documentation, and SEIS operating design.",
            score: 0
        ),
        SeisAICommandCoreProfile(
            id: "implementation-builder",
            name: "Implementation Builder",
            strengths: ["build", "code", "app", "ui", "test", "demo", "feature", "desktop", "macos"],
            summary: "Shippable desktop app surfaces, local state, tests, and static implementation.",
            score: 0
        ),
        SeisAICommandCoreProfile(
            id: "security-reviewer",
            name: "Security Reviewer",
            strengths: ["security", "secret", "approval", "ssh", "risk", "audit", "privacy"],
            summary: "Risk gates, secret handling, audit trails, and permission boundaries.",
            score: 0
        ),
        SeisAICommandCoreProfile(
            id: "evaluation-critic",
            name: "Evaluation Critic",
            strengths: ["eval", "quality", "validation", "review", "coverage", "accessibility"],
            summary: "Scoring, testability, accessibility, and review-ready acceptance criteria.",
            score: 0
        )
    ]

    private static let agentCatalog = [
        (id: "architect", name: "Architect Agent", lane: "Plan", role: "System boundaries, ADRs, and long-term structure."),
        (id: "swiftui", name: "SwiftUI Agent", lane: "Build", role: "Desktop layout, toolbars, settings, split views, and controls."),
        (id: "security", name: "Security Agent", lane: "Security", role: "Secret hygiene, approval gates, provider boundaries, and audit readiness."),
        (id: "documentation", name: "Documentation Agent", lane: "Plan", role: "Source-of-truth docs, runbooks, and recovery reports."),
        (id: "qa", name: "QA Agent", lane: "Review", role: "Evaluation scores, tests, accessibility, and failure-path review."),
        (id: "operations", name: "Operations Agent", lane: "Review", role: "Git isolation, handoff, release readiness, and rollback notes.")
    ]

    private static let knowledgeCatalog = [
        (id: "agents", title: "AGENTS.md", trust: "Constitution", summary: "SEIS work stays modular, human-supervised, source-controlled, and security aware."),
        (id: "security", title: "SECURITY.md", trust: "Policy", summary: "No API keys, tokens, credentials, .env contents, or personal data should be committed."),
        (id: "readme", title: "README.md", trust: "Product source", summary: "SEIS is an AI-native platform layer for agents, MCP, plugins, LLM workflows, and governance."),
        (id: "desktop", title: "macOS lane", trust: "Implementation", summary: "SwiftUI is the first-party desktop path for SEIS local tools and native app surfaces.")
    ]
}
