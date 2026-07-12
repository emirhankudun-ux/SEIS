import Foundation

public enum SeisAppleLocalSearchScope: String, CaseIterable, Codable, Equatable, Sendable {
    case all
    case products
    case evidence

    public var displayLabel: String {
        switch self {
        case .all: "All"
        case .products: "Products"
        case .evidence: "Evidence"
        }
    }
}

public enum SeisAppleLocalSearchDocumentKind: String, CaseIterable, Codable, Equatable, Sendable {
    case productSurface = "product-surface"
    case runtimeEvidence = "runtime-evidence"
}

public struct SeisAppleLocalSearchDocument: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let summary: String
    public let kind: SeisAppleLocalSearchDocumentKind
    public let state: String
    public let keywords: [String]
    public let boundary: String
    public let evidence: String

    public init(
        id: String,
        title: String,
        summary: String,
        kind: SeisAppleLocalSearchDocumentKind,
        state: String,
        keywords: [String],
        boundary: String,
        evidence: String
    ) {
        self.id = id
        self.title = title
        self.summary = summary
        self.kind = kind
        self.state = state
        self.keywords = keywords
        self.boundary = boundary
        self.evidence = evidence
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("document id must not be empty") }
        if title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("document title must not be empty") }
        if summary.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("document summary must not be empty") }
        if state.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("document state must not be empty") }
        if keywords.isEmpty || keywords.contains(where: { $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) { issues.append("document keywords must contain non-empty values") }
        if boundary.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("document boundary must not be empty") }
        if evidence.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { issues.append("document evidence must not be empty") }
        return issues
    }
}

public struct SeisAppleLocalSearchResult: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let summary: String
    public let kind: SeisAppleLocalSearchDocumentKind
    public let state: String
    public let score: Int
    public let matchedTerms: [String]
    public let boundary: String
    public let evidence: String
}

public enum SeisAppleLocalSearchIndexError: Error, Equatable, Sendable {
    case duplicateDocumentIDs([String])
    case invalidDocument(id: String, issues: [String])
}

public struct SeisAppleLocalSearchIndex: Codable, Equatable, Sendable {
    public static let defaultIndex: SeisAppleLocalSearchIndex = {
        let productDocuments = SeisAppleProductSurfaceCatalog.defaultCatalog.surfaces.map { surface in
            SeisAppleLocalSearchDocument(
                id: surface.id.rawValue,
                title: surface.title,
                summary: surface.subtitle,
                kind: .productSurface,
                state: surface.state.displayLabel,
                keywords: [surface.id.rawValue, surface.title, surface.subtitle],
                boundary: surface.boundary,
                evidence: surface.evidence
            )
        }
        let evidenceDocuments = [
            SeisAppleLocalSearchDocument(
                id: "evidence:ai-core-runtime",
                title: "AI Core Runtime Snapshot",
                summary: "Typed provider, lane, agent, MCP, router, and safety boundary contract.",
                kind: .runtimeEvidence,
                state: "Local Demo",
                keywords: ["ai", "core", "provider", "lane", "agent", "mcp", "router", "snapshot"],
                boundary: "No provider calls, credentials, live MCP, SSH, deployment, or GitHub mutation.",
                evidence: "apps/seis-core/data/seis-ai-core-runtime-snapshot.json"
            ),
            SeisAppleLocalSearchDocument(
                id: "evidence:apple-runtime",
                title: "Apple Runtime Diagnostics",
                summary: "Required Swift surfaces, readiness probes, and Apple platform quality gates.",
                kind: .runtimeEvidence,
                state: "Source-backed",
                keywords: ["apple", "swift", "swiftui", "diagnostics", "quality", "platform"],
                boundary: "SDK validation and native runtime execution remain separately verified.",
                evidence: "SeisAppleShellRuntimeDiagnostics.requiredSurfaces"
            ),
            SeisAppleLocalSearchDocument(
                id: "evidence:plugin-governance",
                title: "Plugin and MCP Governance",
                summary: "Specialist lanes, skills, tools, resources, and approval boundaries.",
                kind: .runtimeEvidence,
                state: "Plan-only",
                keywords: ["plugin", "skills", "mcp", "governance", "approval", "seis-cloud", "seis-code", "seis-design", "seis-data"],
                boundary: "No blanket activation, connector authentication, or external mutation.",
                evidence: "packages/seis-ai and content/development contracts"
            )
        ]
        return SeisAppleLocalSearchIndex(documents: productDocuments + evidenceDocuments)
    }()

    public let documents: [SeisAppleLocalSearchDocument]

    public init(documents: [SeisAppleLocalSearchDocument]) {
        self.documents = documents
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let duplicateIDs = documents.reduce(into: [String: Int]()) { counts, document in
            counts[document.id, default: 0] += 1
        }.filter { $0.value > 1 }.map(\.key).sorted()
        if !duplicateIDs.isEmpty { issues.append("duplicate document IDs: \(duplicateIDs.joined(separator: ", "))") }
        for document in documents where !document.validationIssues.isEmpty {
            issues.append(contentsOf: document.validationIssues.map { "\(document.id): \($0)" })
        }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }

    public func search(
        _ query: String,
        scope: SeisAppleLocalSearchScope = .all,
        limit: Int = 20
    ) -> [SeisAppleLocalSearchResult] {
        let terms = normalizedTerms(query)
        guard !terms.isEmpty else { return [] }
        let boundedLimit = max(0, min(limit, documents.count))
        guard boundedLimit > 0 else { return [] }

        return documents.compactMap { document in
            guard scopeMatches(document, scope: scope) else { return nil }
            let fields = [
                (document.title.lowercased(), 8),
                (document.keywords.joined(separator: " ").lowercased(), 5),
                (document.summary.lowercased(), 3),
                (document.state.lowercased(), 2),
                (document.boundary.lowercased(), 1),
                (document.evidence.lowercased(), 1)
            ]
            let matchedTerms = terms.filter { term in fields.contains { $0.0.contains(term) } }
            guard !matchedTerms.isEmpty else { return nil }
            let score = matchedTerms.reduce(0) { total, term in
                total + fields.reduce(0) { fieldScore, field in fieldScore + (field.0.contains(term) ? field.1 : 0) }
            }
            return SeisAppleLocalSearchResult(
                id: document.id,
                title: document.title,
                summary: document.summary,
                kind: document.kind,
                state: document.state,
                score: score,
                matchedTerms: matchedTerms,
                boundary: document.boundary,
                evidence: document.evidence
            )
        }
        .sorted { lhs, rhs in
            if lhs.score != rhs.score { return lhs.score > rhs.score }
            return lhs.title < rhs.title
        }
        .prefix(boundedLimit)
        .map { $0 }
    }

    private func scopeMatches(_ document: SeisAppleLocalSearchDocument, scope: SeisAppleLocalSearchScope) -> Bool {
        switch scope {
        case .all: true
        case .products: document.kind == .productSurface
        case .evidence: document.kind == .runtimeEvidence
        }
    }

    private func normalizedTerms(_ query: String) -> [String] {
        var seen = Set<String>()
        return query
            .lowercased()
            .split { character in
                character.isWhitespace || ",.;:/_-".contains(character)
            }
            .map(String.init)
            .filter { seen.insert($0).inserted }
    }
}
