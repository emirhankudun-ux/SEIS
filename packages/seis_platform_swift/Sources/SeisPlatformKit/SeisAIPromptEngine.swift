import Foundation

public enum SeisAIPromptKind: String, CaseIterable, Codable, Equatable, Hashable, Sendable {
    case system
    case task
    case review
    case coding
    case documentation
    case security
    case sshReview = "ssh-review"
    case cleanRoom = "clean-room"
}

public struct SeisAIPromptTemplate: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let kind: SeisAIPromptKind
    public let version: String
    public let title: String
    public let template: String
    public let allowedVariables: [String]
    public let safetyBoundary: String

    public init(
        id: String,
        kind: SeisAIPromptKind,
        version: String,
        title: String,
        template: String,
        allowedVariables: [String],
        safetyBoundary: String
    ) {
        self.id = id
        self.kind = kind
        self.version = version
        self.title = title
        self.template = template
        self.allowedVariables = allowedVariables
        self.safetyBoundary = safetyBoundary
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("prompt id must not be empty") }
        if version.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("prompt version must not be empty") }
        if title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("prompt title must not be empty") }
        if template.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("prompt template must not be empty") }
        if allowedVariables.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) {
            issues.append("prompt variables must not contain empty values")
        }
        if Set(allowedVariables).count != allowedVariables.count { issues.append("prompt variables must not contain duplicates") }
        if safetyBoundary.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("prompt safety boundary must not be empty") }
        if Self.containsSecretSignature(template) { issues.append("prompt template contains a secret-shaped signature") }
        if Self.placeholderNames(in: template).subtracting(allowedVariables).isEmpty == false {
            issues.append("prompt template contains an undeclared variable")
        }
        return issues
    }

    private static func placeholderNames(in value: String) -> Set<String> {
        var names = Set<String>()
        var remainder = value[...]
        while let start = remainder.range(of: "{{"),
              let end = remainder[start.upperBound...].range(of: "}}") {
            let name = remainder[start.upperBound..<end.lowerBound]
                .trimmingCharacters(in: .whitespacesAndNewlines)
            names.insert(name)
            remainder = remainder[end.upperBound...]
        }
        return names
    }

    private static func containsSecretSignature(_ value: String) -> Bool {
        let normalized = value.lowercased()
        return normalized.contains("begin private key") ||
            normalized.contains("sk-") ||
            normalized.contains("api_key=") ||
            normalized.contains("password=")
    }
}

public struct SeisAIRenderedPrompt: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let templateID: String
    public let version: String
    public let kind: SeisAIPromptKind
    public let text: String
    public let isEphemeral: Bool

    public init(
        id: String,
        templateID: String,
        version: String,
        kind: SeisAIPromptKind,
        text: String,
        isEphemeral: Bool = true
    ) {
        self.id = id
        self.templateID = templateID
        self.version = version
        self.kind = kind
        self.text = text
        self.isEphemeral = isEphemeral
    }
}

public enum SeisAIPromptEngineError: Error, Equatable, Sendable {
    case invalidEngineVersion
    case duplicateTemplateIDs([String])
    case invalidTemplate(id: String, issues: [String])
    case unknownTemplate(String)
    case undeclaredVariable(String)
    case unsafeVariable(String)
    case renderedPromptTooLong
}

public struct SeisAIPromptEngine: Codable, Equatable, Sendable {
    public static let currentVersion = "seis-prompt-engine-v1"
    public static let maximumRenderedPromptLength = 16_384

    public let version: String
    public let templates: [SeisAIPromptTemplate]

    public init(version: String = currentVersion, templates: [SeisAIPromptTemplate]) throws {
        guard !version.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw SeisAIPromptEngineError.invalidEngineVersion
        }
        let duplicateIDs = templates
            .reduce(into: [String: Int]()) { counts, template in counts[template.id, default: 0] += 1 }
            .filter { $0.value > 1 }
            .map(\.key)
            .sorted()
        guard duplicateIDs.isEmpty else { throw SeisAIPromptEngineError.duplicateTemplateIDs(duplicateIDs) }

        for template in templates where !template.validationIssues.isEmpty {
            throw SeisAIPromptEngineError.invalidTemplate(id: template.id, issues: template.validationIssues)
        }
        self.version = version
        self.templates = templates.sorted { $0.id < $1.id }
    }

    public static let defaultEngine: SeisAIPromptEngine = {
        do {
            return try SeisAIPromptEngine(templates: [
                .init(
                    id: "system-safe-local",
                    kind: .system,
                    version: currentVersion,
                    title: "Safe local system boundary",
                    template: "Operate only inside the declared SEIS local boundary. Never infer credentials, private content, network authority, or mutation authority.",
                    allowedVariables: [],
                    safetyBoundary: "No secrets, provider calls, MCP sessions, SSH, deployment, or GitHub mutation."
                ),
                .init(
                    id: "task-plan",
                    kind: .task,
                    version: currentVersion,
                    title: "Bounded task plan",
                    template: "Goal: {{goal}}\nConstraints: {{constraints}}\nReturn a bounded plan, validation steps, and blocked actions.",
                    allowedVariables: ["constraints", "goal"],
                    safetyBoundary: "Plan-only output; no execution authority."
                ),
                .init(
                    id: "review-evidence",
                    kind: .review,
                    version: currentVersion,
                    title: "Evidence review",
                    template: "Review this source-backed scope: {{scope}}\nAcceptance evidence: {{acceptance}}\nSeparate verified, missing, and blocked claims.",
                    allowedVariables: ["acceptance", "scope"],
                    safetyBoundary: "Do not treat indirect evidence as completion."
                ),
                .init(
                    id: "coding-scoped",
                    kind: .coding,
                    version: currentVersion,
                    title: "Scoped coding plan",
                    template: "Repository scope: {{scope}}\nImplementation goal: {{goal}}\nValidation: {{validation}}\nIdentify rollback before edits.",
                    allowedVariables: ["goal", "scope", "validation"],
                    safetyBoundary: "One scoped writer; unrelated files remain untouched."
                ),
                .init(
                    id: "documentation-handoff",
                    kind: .documentation,
                    version: currentVersion,
                    title: "Documentation handoff",
                    template: "Document the verified state of {{scope}}. Include what exists, what is mock, what is planned, and what remains blocked.",
                    allowedVariables: ["scope"],
                    safetyBoundary: "No invented status, credentials, or live integration claim."
                ),
                .init(
                    id: "security-review",
                    kind: .security,
                    version: currentVersion,
                    title: "Security boundary review",
                    template: "Review {{scope}} for secrets, private-content access, network authority, destructive actions, and approval gaps.",
                    allowedVariables: ["scope"],
                    safetyBoundary: "Fail closed on secret-like or unknown input."
                ),
                .init(
                    id: "ssh-readiness-review",
                    kind: .sshReview,
                    version: currentVersion,
                    title: "SSH readiness review",
                    template: "Review SSH readiness evidence for {{scope}}. Verify host policy, user scope, port continuity, approval, rollback, and credential boundaries.",
                    allowedVariables: ["scope"],
                    safetyBoundary: "Readiness review only; no SSH connection or command execution."
                ),
                .init(
                    id: "clean-room-review",
                    kind: .cleanRoom,
                    version: currentVersion,
                    title: "Clean-room provenance review",
                    template: "Review provenance for {{scope}}. Use public requirements and first-principles design; do not reproduce unclear-license implementation.",
                    allowedVariables: ["scope"],
                    safetyBoundary: "No proprietary, leaked, private, or unclear-license material is copied."
                )
            ])
        } catch {
            preconditionFailure("SEIS default prompt catalog must remain valid: \(error)")
        }
    }()

    public func template(id: String) -> SeisAIPromptTemplate? {
        templates.first { $0.id == id }
    }

    public func render(
        templateID: String,
        variables: [String: String],
        renderID: String = UUID().uuidString
    ) throws -> SeisAIRenderedPrompt {
        guard let template = template(id: templateID) else {
            throw SeisAIPromptEngineError.unknownTemplate(templateID)
        }

        let unknownVariables = Set(variables.keys).subtracting(template.allowedVariables)
        guard unknownVariables.isEmpty else {
            throw SeisAIPromptEngineError.undeclaredVariable(unknownVariables.sorted().joined(separator: ", "))
        }

        for key in variables.keys.sorted() {
            guard !Self.containsUnsafeVariable(variables[key] ?? "") else {
                throw SeisAIPromptEngineError.unsafeVariable(key)
            }
        }

        let rendered = variables.keys.sorted().reduce(template.template) { text, key in
            text.replacingOccurrences(of: "{{\(key)}}", with: variables[key] ?? "")
        }
        guard rendered.count <= Self.maximumRenderedPromptLength else {
            throw SeisAIPromptEngineError.renderedPromptTooLong
        }

        return SeisAIRenderedPrompt(
            id: renderID,
            templateID: template.id,
            version: template.version,
            kind: template.kind,
            text: rendered
        )
    }

    private static func containsUnsafeVariable(_ value: String) -> Bool {
        let normalized = value.lowercased()
        return normalized.contains("begin private key") ||
            normalized.contains("api_key") ||
            normalized.contains("api-key") ||
            normalized.contains("access_token") ||
            normalized.contains("password") ||
            normalized.contains("secret") ||
            normalized.contains(".env")
    }
}
