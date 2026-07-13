import Foundation

public enum SeisAGISystemSourceSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisAGISourceMasterGoal: Codable, Equatable, Sendable {
    public let name: String
    public let northStar: String
    public let claimBoundary: String
    public let workingMode: [String]

    public var hasSafeClaimBoundary: Bool {
        claimBoundary.localizedCaseInsensitiveContains("does not claim autonomous general intelligence")
    }
}

public struct SeisAGISourceReleaseMilestone: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let month: Int
    public let dayRange: String
    public let theme: String
    public let done: String
    public let focusAreas: [String]
    public let acceptanceGates: [String]
    public let evidencePaths: [String]

    public var isTraceable: Bool {
        (1...3).contains(month) &&
            !dayRange.isEmpty &&
            !theme.isEmpty &&
            !done.isEmpty &&
            !focusAreas.isEmpty &&
            !acceptanceGates.isEmpty &&
            !evidencePaths.isEmpty
    }
}

public struct SeisAGISourceReleaseWindow: Codable, Equatable, Sendable {
    public let startDate: String
    public let targetReleaseDate: String
    public let cadence: String
    public let milestones: [SeisAGISourceReleaseMilestone]
}

public struct SeisAGISourceTokenEfficiency: Codable, Equatable, Sendable {
    public let targetSavingsPercent: Int
    public let strategy: [String]
}

public struct SeisAGISourceDomain: Codable, Equatable, Identifiable, Sendable {
    public let id: Int
    public let label: String
    public let lane: String
}

public struct SeisAGISourceDomainLane: Codable, Equatable, Sendable {
    public let lane: String
    public let domainCount: Int
}

public struct SeisAGISourceSubsystem: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let intent: String
    public let implementationRoots: [String]
    public let qualityGates: [String]
}

public struct SeisAGISourcePluginCapabilityLane: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let sourceLaneIds: [String]
    public let examples: [String]
    public let activationGate: String
}

public struct SeisAGISourcePlatformStrategy: Codable, Equatable, Sendable {
    public let priority: String
    public let appleLanguages: [String]
    public let webLanguages: [String]
    public let aiDataLanguages: [String]
    public let androidLanguages: [String]
    public let windowsLanguages: [String]
    public let systemsInfrastructureLanguages: [String]
    public let installPolicy: String
    public let javascriptTargetPercent: Double
    public let htmlCssPolicy: String
}

public struct SeisAGISourceMemoryCheckpoint: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let phase: String
    public let appleStorageSurface: String
    public let evidencePath: String
    public let qualityGates: [String]
}

public struct SeisAGISourceMemoryLoop: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let trigger: String
    public let steps: [String]
    public let outputArtifact: String
    public let evaluationGates: [String]
}

public struct SeisAGISourceMemoryPlanning: Codable, Equatable, Sendable {
    public let id: String
    public let ownerRuntime: String
    public let storagePolicy: String
    public let checkpoints: [SeisAGISourceMemoryCheckpoint]
    public let loops: [SeisAGISourceMemoryLoop]
}

public struct SeisAGISourceImplementation: Codable, Equatable, Sendable {
    public let swiftContract: String
    public let swiftMemoryPlanningStore: String
    public let swiftContextCompressionRuntime: String
    public let swiftAgentOrchestrationRuntime: String
    public let swiftResearchAutomationRuntime: String
    public let swiftAgentHandoffStore: String
    public let generator: String
    public let sourceContract: String
    public let report: String
    public let documentation: String

    public var roots: [String] {
        [
            swiftContract,
            swiftMemoryPlanningStore,
            swiftContextCompressionRuntime,
            swiftAgentOrchestrationRuntime,
            swiftResearchAutomationRuntime,
            swiftAgentHandoffStore,
            generator,
            sourceContract,
            report,
            documentation
        ]
    }
}

public struct SeisAGISystemSourceSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: Int
    public let generatedAt: String
    public let mode: String
    public let masterGoal: SeisAGISourceMasterGoal
    public let releaseWindow: SeisAGISourceReleaseWindow
    public let tokenEfficiency: SeisAGISourceTokenEfficiency
    public let priorityDomains: Int
    public let domainTaxonomy: Int
    public let domainLanes: Int
    public let subsystems: [SeisAGISourceSubsystem]
    public let pluginCapabilityLanes: [SeisAGISourcePluginCapabilityLane]
    public let qualityGates: [String]
    public let platformStrategy: SeisAGISourcePlatformStrategy
    public let memoryPlanning: SeisAGISourceMemoryPlanning
    public let implementation: SeisAGISourceImplementation

    public static func validated(from data: Data) throws -> Self {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisAGISystemSourceSnapshotError.invalidData
        }

        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisAGISystemSourceSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var priorityDomainCount: Int { priorityDomains }
    public var domainTaxonomyCount: Int { domainTaxonomy }
    public var domainLaneCount: Int { domainLanes }
    public var subsystemCount: Int { subsystems.count }
    public var pluginCapabilityLaneCount: Int { pluginCapabilityLanes.count }
    public var qualityGateCount: Int { qualityGates.count }
    public var memoryCheckpointCount: Int { memoryPlanning.checkpoints.count }
    public var planningLoopCount: Int { memoryPlanning.loops.count }
    public var releaseMilestoneCount: Int { releaseWindow.milestones.count }
    public var implementationRootCount: Int { implementation.roots.count }

    public var validationIssues: [String] {
        var issues: [String] = []
        if id != "seis-agi-system" || version != 1 || generatedAt != "2026-06-12" {
            issues.append("source identity, version, or generation date is invalid")
        }
        if mode != "human_owned_agi_inspired_engineering_system" {
            issues.append("source mode is invalid")
        }
        if masterGoal.name != "SEIS MASTER GOAL" ||
            masterGoal.northStar.isEmpty ||
            masterGoal.workingMode.isEmpty ||
            !masterGoal.hasSafeClaimBoundary {
            issues.append("source claim boundary is unsafe or incomplete")
        }
        if releaseWindow.startDate != "2026-06-12" ||
            releaseWindow.targetReleaseDate != "2026-09-12" ||
            releaseWindow.cadence != "three_month_version_window" ||
            releaseWindow.milestones.count != 3 ||
            !releaseWindow.milestones.allSatisfy(\.isTraceable) ||
            Set(releaseWindow.milestones.map(\.id)) != Set([
                "month-01-foundation-architecture-docs",
                "month-02-memory-planning-mcp",
                "month-03-agents-validation-release"
            ]) {
            issues.append("source release window is incomplete")
        }
        if tokenEfficiency.targetSavingsPercent != 60 || tokenEfficiency.strategy.isEmpty {
            issues.append("source token-efficiency target is invalid")
        }
        if priorityDomains != 20 {
            issues.append("source priority-domain count is invalid")
        }
        if domainTaxonomy != 150 {
            issues.append("source domain-taxonomy count is invalid")
        }
        if domainLanes != 125 {
            issues.append("source domain-lane count is invalid")
        }
        if subsystems.count != 10 || Set(subsystems.map(\.id)).count != 10 {
            issues.append("source subsystem count is invalid")
        }
        if pluginCapabilityLanes.count != 5 || Set(pluginCapabilityLanes.map(\.id)).count != 5 {
            issues.append("source plugin-capability-lane count is invalid")
        }
        if qualityGates.count != 13 || Set(qualityGates).count != 13 {
            issues.append("source quality-gate count is invalid")
        }
        if platformStrategy.priority != "apple_first_when_practical" ||
            platformStrategy.javascriptTargetPercent != 21.0 ||
            !platformStrategy.appleLanguages.contains("Swift") ||
            !platformStrategy.appleLanguages.contains("SwiftUI") {
            issues.append("source platform strategy is not Apple-first or has the wrong JavaScript target")
        }
        if memoryPlanning.id != "seis-memory-planning-runtime" ||
            !memoryPlanning.storagePolicy.localizedCaseInsensitiveContains("never persist secrets") ||
            memoryPlanning.checkpoints.count != 5 ||
            memoryPlanning.loops.count != 4 {
            issues.append("source memory-planning boundary or counts are invalid")
        }
        let expectedImplementationRoots = Set([
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift",
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIMemoryPlanningStore.swift",
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIContextCompressionRuntime.swift",
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIAgentOrchestrationRuntime.swift",
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIResearchAutomationRuntime.swift",
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIAgentHandoffStore.swift",
            "scripts/create-seis-agi-system.py",
            "content/development/seis-agi-system.json",
            "reports/seis-agi-system.md",
            "docs/agi/seis-agi-system.md"
        ])
        if implementation.roots.count != 10 ||
            Set(implementation.roots) != expectedImplementationRoots ||
            implementation.sourceContract != "content/development/seis-agi-system.json" ||
            implementation.swiftContract != "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift" ||
            implementation.generator != "scripts/create-seis-agi-system.py" {
            issues.append("source implementation roots are incomplete")
        }
        return issues
    }

    public var isValid: Bool { validationIssues.isEmpty }

    public var isMetadataOnly: Bool {
        isValid && mode == "human_owned_agi_inspired_engineering_system"
    }
}
