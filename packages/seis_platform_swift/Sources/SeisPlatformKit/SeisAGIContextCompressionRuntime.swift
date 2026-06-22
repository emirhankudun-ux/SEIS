import Foundation

public struct SeisAGIContextSource: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let sourcePath: String
    public let estimatedTokens: Int
    public let priority: Int
    public let qualityGates: [String]
    public let containsSecrets: Bool

    public init(
        id: String,
        title: String,
        sourcePath: String,
        estimatedTokens: Int,
        priority: Int,
        qualityGates: [String],
        containsSecrets: Bool = false
    ) {
        self.id = id
        self.title = title
        self.sourcePath = sourcePath
        self.estimatedTokens = estimatedTokens
        self.priority = priority
        self.qualityGates = qualityGates
        self.containsSecrets = containsSecrets
    }

    public var isSelectable: Bool {
        !id.isEmpty &&
            !title.isEmpty &&
            !sourcePath.isEmpty &&
            estimatedTokens > 0 &&
            !containsSecrets
    }
}

public struct SeisAGIContextCompressionPlan: Codable, Equatable, Sendable {
    public let selectedSources: [SeisAGIContextSource]
    public let deferredSources: [SeisAGIContextSource]
    public let sourceTokenTotal: Int
    public let selectedTokenTotal: Int
    public let targetSavingsPercent: Int
    public let qualityGates: [String]
    public let redactionPolicy: String

    public init(
        selectedSources: [SeisAGIContextSource],
        deferredSources: [SeisAGIContextSource],
        sourceTokenTotal: Int,
        selectedTokenTotal: Int,
        targetSavingsPercent: Int,
        qualityGates: [String],
        redactionPolicy: String
    ) {
        self.selectedSources = selectedSources
        self.deferredSources = deferredSources
        self.sourceTokenTotal = sourceTokenTotal
        self.selectedTokenTotal = selectedTokenTotal
        self.targetSavingsPercent = targetSavingsPercent
        self.qualityGates = qualityGates
        self.redactionPolicy = redactionPolicy
    }

    public var savedTokens: Int {
        max(0, sourceTokenTotal - selectedTokenTotal)
    }

    public var savingsPercent: Int {
        guard sourceTokenTotal > 0 else {
            return 0
        }
        return Int((Double(savedTokens) / Double(sourceTokenTotal) * 100).rounded())
    }

    public var isReady: Bool {
        !selectedSources.isEmpty &&
            selectedSources.allSatisfy(\.isSelectable) &&
            savingsPercent >= targetSavingsPercent &&
            targetSavingsPercent >= 60 &&
            qualityGates.contains("bounded-context") &&
            qualityGates.contains("source-backed-memory") &&
            qualityGates.contains("token-savings-target") &&
            redactionPolicy.contains("never include secrets")
    }
}

public struct SeisAGIContextCompressionRuntime: Codable, Equatable, Sendable {
    public let targetSavingsPercent: Int
    public let maxSelectedTokens: Int
    public let requiredAnchors: [String]
    public let qualityGates: [String]

    public init(
        targetSavingsPercent: Int = 60,
        maxSelectedTokens: Int = 1_600,
        requiredAnchors: [String] = ["context-intake", "self-evaluation"],
        qualityGates: [String] = ["bounded-context", "source-backed-memory", "token-savings-target", "secret-safety"]
    ) {
        self.targetSavingsPercent = targetSavingsPercent
        self.maxSelectedTokens = maxSelectedTokens
        self.requiredAnchors = requiredAnchors
        self.qualityGates = qualityGates
    }

    public func makePlan(from records: [SeisAGIMemoryPlanningRecord]) -> SeisAGIContextCompressionPlan {
        makePlan(from: Self.sources(from: records))
    }

    public func makePlan(from sources: [SeisAGIContextSource]) -> SeisAGIContextCompressionPlan {
        let selectableSources = sources
            .filter(\.isSelectable)
            .sorted { lhs, rhs in
                if lhs.priority == rhs.priority {
                    return lhs.id < rhs.id
                }
                return lhs.priority < rhs.priority
            }

        let sourceTokenTotal = selectableSources.reduce(0) { $0 + $1.estimatedTokens }
        var selected: [SeisAGIContextSource] = []
        var selectedTokens = 0

        for source in selectableSources where requiredAnchors.contains(source.id) {
            if selectedTokens + source.estimatedTokens <= maxSelectedTokens {
                selected.append(source)
                selectedTokens += source.estimatedTokens
            }
        }

        for source in selectableSources where !selected.contains(source) {
            if selectedTokens + source.estimatedTokens <= maxSelectedTokens {
                selected.append(source)
                selectedTokens += source.estimatedTokens
            }
        }

        if selected.isEmpty, let smallest = selectableSources.min(by: { $0.estimatedTokens < $1.estimatedTokens }) {
            selected = [smallest]
            selectedTokens = smallest.estimatedTokens
        }

        let deferred = selectableSources.filter { !selected.contains($0) }
        return SeisAGIContextCompressionPlan(
            selectedSources: selected,
            deferredSources: deferred,
            sourceTokenTotal: sourceTokenTotal,
            selectedTokenTotal: selectedTokens,
            targetSavingsPercent: targetSavingsPercent,
            qualityGates: qualityGates,
            redactionPolicy: "Summarize before expand; never include secrets, tokens, credentials, or private connector payloads."
        )
    }

    public static func sources(from records: [SeisAGIMemoryPlanningRecord]) -> [SeisAGIContextSource] {
        records.map { record in
            SeisAGIContextSource(
                id: record.checkpointId,
                title: record.title,
                sourcePath: record.evidencePath,
                estimatedTokens: estimatedTokens(for: record),
                priority: priority(for: record),
                qualityGates: record.qualityGates,
                containsSecrets: false
            )
        }
    }

    public static var expectedSourceTokens: [String] {
        [
            "SeisAGIContextCompressionRuntime",
            "SeisAGIContextCompressionPlan",
            "targetSavingsPercent: Int = 60",
            "bounded-context",
            "source-backed-memory",
            "token-savings-target",
            "Summarize before expand",
            "never include secrets"
        ]
    }

    private static func estimatedTokens(for record: SeisAGIMemoryPlanningRecord) -> Int {
        switch record.checkpointId {
        case "context-intake":
            return 700
        case "self-evaluation":
            return 800
        case "research-evidence":
            return 1_000
        case "task-decomposition":
            return 1_100
        case "multi-agent-handoff":
            return 1_200
        default:
            return 900
        }
    }

    private static func priority(for record: SeisAGIMemoryPlanningRecord) -> Int {
        switch record.checkpointId {
        case "context-intake":
            return 0
        case "self-evaluation":
            return 1
        case "research-evidence":
            return 2
        case "task-decomposition":
            return 3
        case "multi-agent-handoff":
            return 4
        default:
            return 10
        }
    }
}
