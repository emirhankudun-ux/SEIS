import Foundation

public enum SeisAGIResearchSourceKind: String, Codable, Equatable, Sendable {
    case localRepository
    case generatedReport
    case officialDocumentation
    case userProvidedReference
}

public struct SeisAGIResearchSourceManifestItem: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let sourcePath: String
    public let sourceKind: SeisAGIResearchSourceKind
    public let selectedByContext: Bool
    public let requiresFreshnessCheck: Bool
    public let containsSecrets: Bool
    public let qualityGates: [String]

    public init(
        id: String,
        title: String,
        sourcePath: String,
        sourceKind: SeisAGIResearchSourceKind,
        selectedByContext: Bool,
        requiresFreshnessCheck: Bool,
        containsSecrets: Bool,
        qualityGates: [String]
    ) {
        self.id = id
        self.title = title
        self.sourcePath = sourcePath
        self.sourceKind = sourceKind
        self.selectedByContext = selectedByContext
        self.requiresFreshnessCheck = requiresFreshnessCheck
        self.containsSecrets = containsSecrets
        self.qualityGates = qualityGates
    }

    public var isUsable: Bool {
        !id.isEmpty &&
            !title.isEmpty &&
            !sourcePath.isEmpty &&
            !containsSecrets &&
            qualityGates.contains("citation-trace") &&
            qualityGates.contains("claim-boundary")
    }
}

public struct SeisAGIResearchAutomationPlan: Codable, Equatable, Sendable {
    public let researcherAssignmentId: String
    public let outputArtifact: String
    public let selectedSources: [SeisAGIResearchSourceManifestItem]
    public let deferredSources: [SeisAGIResearchSourceManifestItem]
    public let qualityGates: [String]
    public let primarySourcePolicy: String
    public let redactionPolicy: String
    public let claimBoundary: String

    public init(
        researcherAssignmentId: String,
        outputArtifact: String,
        selectedSources: [SeisAGIResearchSourceManifestItem],
        deferredSources: [SeisAGIResearchSourceManifestItem],
        qualityGates: [String],
        primarySourcePolicy: String,
        redactionPolicy: String,
        claimBoundary: String
    ) {
        self.researcherAssignmentId = researcherAssignmentId
        self.outputArtifact = outputArtifact
        self.selectedSources = selectedSources
        self.deferredSources = deferredSources
        self.qualityGates = qualityGates
        self.primarySourcePolicy = primarySourcePolicy
        self.redactionPolicy = redactionPolicy
        self.claimBoundary = claimBoundary
    }

    public var isReady: Bool {
        researcherAssignmentId == "research-synthesizer" &&
            outputArtifact == "source manifest" &&
            selectedSources.contains { $0.id == "research-evidence" } &&
            selectedSources.allSatisfy(\.isUsable) &&
            qualityGates.contains("primary-source-first") &&
            qualityGates.contains("citation-trace") &&
            qualityGates.contains("claim-boundary") &&
            qualityGates.contains("no-fake-usage") &&
            primarySourcePolicy.contains("official documentation") &&
            redactionPolicy.contains("never include secrets") &&
            claimBoundary.contains("does not claim autonomous general intelligence")
    }
}

public struct SeisAGIResearchAutomationRuntime: Codable, Equatable, Sendable {
    public let qualityGates: [String]
    public let primarySourcePolicy: String
    public let redactionPolicy: String

    public init(
        qualityGates: [String] = [
            "primary-source-first",
            "version-compatibility",
            "citation-trace",
            "claim-boundary",
            "no-fake-usage",
            "secret-safety"
        ],
        primarySourcePolicy: String = "Prefer local repository evidence first; verify unstable external claims through official documentation before architecture decisions.",
        redactionPolicy: String = "Build source manifests only from paths and summaries; never include secrets, tokens, credentials, or private connector payloads."
    ) {
        self.qualityGates = qualityGates
        self.primarySourcePolicy = primarySourcePolicy
        self.redactionPolicy = redactionPolicy
    }

    public func makePlan(
        contract: SeisAGISystemContract,
        memorySnapshot: SeisAGIMemoryPlanningSnapshot,
        orchestrationPlan: SeisAGIAgentOrchestrationPlan
    ) -> SeisAGIResearchAutomationPlan {
        let researcherAssignment = orchestrationPlan.assignments.first { $0.role == .researcher }
        let selectedContextIds = Set(researcherAssignment?.selectedContextIds ?? [])
        let researchSourceIds = Set(memorySnapshot.records.filter { $0.phase == "research" }.map(\.checkpointId))
        let selectedIds = selectedContextIds.union(researchSourceIds)
        let manifestItems = Self.manifestItems(from: memorySnapshot.records, selectedIds: selectedIds)
        let selected = manifestItems.filter { selectedIds.contains($0.id) }
        let deferred = manifestItems.filter { !selectedIds.contains($0.id) }
        let subsystemGates = contract.subsystems.first { $0.id == "research-automation" }?.qualityGates ?? []
        let assignmentGates = researcherAssignment?.qualityGates ?? []

        return SeisAGIResearchAutomationPlan(
            researcherAssignmentId: researcherAssignment?.id ?? "missing-researcher",
            outputArtifact: researcherAssignment?.outputArtifact ?? "missing-source-manifest",
            selectedSources: selected,
            deferredSources: deferred,
            qualityGates: Array(Set(qualityGates + subsystemGates + assignmentGates)).sorted(),
            primarySourcePolicy: primarySourcePolicy,
            redactionPolicy: redactionPolicy,
            claimBoundary: contract.claimBoundary
        )
    }

    public static func manifestItems(
        from records: [SeisAGIMemoryPlanningRecord],
        selectedIds: Set<String>
    ) -> [SeisAGIResearchSourceManifestItem] {
        records.map { record in
            SeisAGIResearchSourceManifestItem(
                id: record.checkpointId,
                title: record.title,
                sourcePath: record.evidencePath,
                sourceKind: sourceKind(for: record.evidencePath),
                selectedByContext: selectedIds.contains(record.checkpointId),
                requiresFreshnessCheck: record.qualityGates.contains("version-compatibility"),
                containsSecrets: false,
                qualityGates: Array(Set(record.qualityGates + ["citation-trace", "claim-boundary"])).sorted()
            )
        }
    }

    public static var expectedSourceTokens: [String] {
        [
            "SeisAGIResearchAutomationRuntime",
            "SeisAGIResearchAutomationPlan",
            "SeisAGIResearchSourceManifestItem",
            "primary-source-first",
            "official documentation",
            "citation-trace",
            "claim-boundary",
            "no-fake-usage",
            "never include secrets",
            "research-synthesizer",
            "source manifest"
        ]
    }

    private static func sourceKind(for evidencePath: String) -> SeisAGIResearchSourceKind {
        if evidencePath.hasPrefix("reports/") {
            return .generatedReport
        }
        if evidencePath.hasPrefix("content/development/seis-agi-reference-assets/") {
            return .userProvidedReference
        }
        if evidencePath.hasPrefix("https://developer.apple.com/") ||
            evidencePath.hasPrefix("https://docs.github.com/") {
            return .officialDocumentation
        }
        return .localRepository
    }
}
