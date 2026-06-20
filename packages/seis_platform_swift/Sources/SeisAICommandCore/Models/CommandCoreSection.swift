import Foundation

enum CommandCoreSection: String, CaseIterable, Identifiable {
    case workspace
    case router
    case agents
    case workflow
    case prompts
    case knowledge
    case evals
    case approvals
    case audit

    var id: String { rawValue }

    var title: String {
        switch self {
        case .workspace:
            "Ask SEIS"
        case .router:
            "Router"
        case .agents:
            "Agents"
        case .workflow:
            "Workflow"
        case .prompts:
            "Prompts"
        case .knowledge:
            "Knowledge"
        case .evals:
            "Evals"
        case .approvals:
            "Approvals"
        case .audit:
            "Audit"
        }
    }

    var subtitle: String {
        switch self {
        case .workspace:
            "Compose and generate"
        case .router:
            "Model-route decision"
        case .agents:
            "Runtime queue"
        case .workflow:
            "Agent workflow"
        case .prompts:
            "Versioned behavior"
        case .knowledge:
            "Evidence graph"
        case .evals:
            "Quality gates"
        case .approvals:
            "Human control"
        case .audit:
            "Trace timeline"
        }
    }

    var systemImage: String {
        switch self {
        case .workspace:
            "sparkles"
        case .router:
            "point.3.connected.trianglepath.dotted"
        case .agents:
            "person.3.sequence"
        case .workflow:
            "point.3.connected.trianglepath.dotted"
        case .prompts:
            "text.badge.checkmark"
        case .knowledge:
            "books.vertical"
        case .evals:
            "gauge.with.dots.needle.67percent"
        case .approvals:
            "checkmark.shield"
        case .audit:
            "list.bullet.clipboard"
        }
    }
}
