import Foundation

public enum SeisAGIAgentRole: String, Codable, CaseIterable, Equatable, Sendable {
    case writer
    case reviewer
    case researcher
    case designer
}

public struct SeisAGIAgentAssignment: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let role: SeisAGIAgentRole
    public let subsystemId: String
    public let pluginLaneId: String
    public let activationMode: String
    public let selectedContextIds: [String]
    public let deferredContextIds: [String]
    public let outputArtifact: String
    public let qualityGates: [String]
    public let writeAllowed: Bool
    public let requiresHumanApproval: Bool

    public init(
        id: String,
        role: SeisAGIAgentRole,
        subsystemId: String,
        pluginLaneId: String,
        activationMode: String,
        selectedContextIds: [String],
        deferredContextIds: [String],
        outputArtifact: String,
        qualityGates: [String],
        writeAllowed: Bool,
        requiresHumanApproval: Bool
    ) {
        self.id = id
        self.role = role
        self.subsystemId = subsystemId
        self.pluginLaneId = pluginLaneId
        self.activationMode = activationMode
        self.selectedContextIds = selectedContextIds
        self.deferredContextIds = deferredContextIds
        self.outputArtifact = outputArtifact
        self.qualityGates = qualityGates
        self.writeAllowed = writeAllowed
        self.requiresHumanApproval = requiresHumanApproval
    }

    public var isGoverned: Bool {
        !id.isEmpty &&
            !subsystemId.isEmpty &&
            !pluginLaneId.isEmpty &&
            activationMode.contains("candidate") &&
            !selectedContextIds.isEmpty &&
            !outputArtifact.isEmpty &&
            qualityGates.count >= 4 &&
            requiresHumanApproval
    }
}

public struct SeisAGIAgentOrchestrationPlan: Codable, Equatable, Sendable {
    public let contextPlan: SeisAGIContextCompressionPlan
    public let assignments: [SeisAGIAgentAssignment]
    public let qualityGates: [String]
    public let claimBoundary: String

    public init(
        contextPlan: SeisAGIContextCompressionPlan,
        assignments: [SeisAGIAgentAssignment],
        qualityGates: [String],
        claimBoundary: String
    ) {
        self.contextPlan = contextPlan
        self.assignments = assignments
        self.qualityGates = qualityGates
        self.claimBoundary = claimBoundary
    }

    public var writerCount: Int {
        assignments.filter { $0.writeAllowed }.count
    }

    public var roleSet: Set<SeisAGIAgentRole> {
        Set(assignments.map(\.role))
    }

    public var isReady: Bool {
        contextPlan.isReady &&
            writerCount == 1 &&
            roleSet.isSuperset(of: [.writer, .reviewer, .researcher, .designer]) &&
            assignments.allSatisfy(\.isGoverned) &&
            assignments.contains { $0.role == .writer && $0.writeAllowed } &&
            assignments.contains { $0.role == .reviewer && !$0.writeAllowed } &&
            qualityGates.contains("single-writer-mode") &&
            qualityGates.contains("reviewer-role-separated") &&
            qualityGates.contains("minimum-required-tools") &&
            qualityGates.contains("no-fake-usage") &&
            claimBoundary.contains("does not claim autonomous general intelligence")
    }
}

public struct SeisAGIAgentOrchestrationRuntime: Codable, Equatable, Sendable {
    public let contextRuntime: SeisAGIContextCompressionRuntime
    public let qualityGates: [String]

    public init(
        contextRuntime: SeisAGIContextCompressionRuntime = SeisAGIContextCompressionRuntime(),
        qualityGates: [String] = [
            "single-writer-mode",
            "reviewer-role-separated",
            "minimum-required-tools",
            "no-fake-usage",
            "human-approval",
            "token-savings-target"
        ]
    ) {
        self.contextRuntime = contextRuntime
        self.qualityGates = qualityGates
    }

    public func makePlan(
        contract: SeisAGISystemContract,
        memorySnapshot: SeisAGIMemoryPlanningSnapshot
    ) -> SeisAGIAgentOrchestrationPlan {
        let contextPlan = contextRuntime.makePlan(from: memorySnapshot.records)
        let selectedContextIds = contextPlan.selectedSources.map(\.id)
        let deferredContextIds = contextPlan.deferredSources.map(\.id)
        let lanesById = Dictionary(uniqueKeysWithValues: contract.pluginLanes.map { ($0.id, $0) })
        let subsystemsById = Dictionary(uniqueKeysWithValues: contract.subsystems.map { ($0.id, $0) })

        let assignments = [
            assignment(
                id: "codex-writer",
                role: .writer,
                subsystemId: "agent-orchestration",
                pluginLaneId: "development-read-write",
                outputArtifact: "git diff",
                writeAllowed: true,
                lanesById: lanesById,
                subsystemsById: subsystemsById,
                selectedContextIds: selectedContextIds,
                deferredContextIds: deferredContextIds
            ),
            assignment(
                id: "reviewer-sentinel",
                role: .reviewer,
                subsystemId: "multi-agent-coordination",
                pluginLaneId: "development-read-write",
                outputArtifact: "review notes",
                writeAllowed: false,
                lanesById: lanesById,
                subsystemsById: subsystemsById,
                selectedContextIds: selectedContextIds,
                deferredContextIds: deferredContextIds
            ),
            assignment(
                id: "research-synthesizer",
                role: .researcher,
                subsystemId: "research-automation",
                pluginLaneId: "data-read-write",
                outputArtifact: "source manifest",
                writeAllowed: false,
                lanesById: lanesById,
                subsystemsById: subsystemsById,
                selectedContextIds: selectedContextIds,
                deferredContextIds: deferredContextIds
            ),
            assignment(
                id: "design-coordinator",
                role: .designer,
                subsystemId: "human-helper-ai",
                pluginLaneId: "design-interactive",
                outputArtifact: "design handoff",
                writeAllowed: false,
                lanesById: lanesById,
                subsystemsById: subsystemsById,
                selectedContextIds: selectedContextIds,
                deferredContextIds: deferredContextIds
            )
        ]

        return SeisAGIAgentOrchestrationPlan(
            contextPlan: contextPlan,
            assignments: assignments,
            qualityGates: qualityGates,
            claimBoundary: contract.claimBoundary
        )
    }

    public static var expectedSourceTokens: [String] {
        [
            "SeisAGIAgentOrchestrationRuntime",
            "SeisAGIAgentOrchestrationPlan",
            "single-writer-mode",
            "reviewer-role-separated",
            "minimum-required-tools",
            "no-fake-usage",
            "development-read-write",
            "data-read-write",
            "design-interactive",
            "does not claim autonomous general intelligence"
        ]
    }

    private func assignment(
        id: String,
        role: SeisAGIAgentRole,
        subsystemId: String,
        pluginLaneId: String,
        outputArtifact: String,
        writeAllowed: Bool,
        lanesById: [String: SeisAGIPluginLaneContract],
        subsystemsById: [String: SeisAGISubsystemContract],
        selectedContextIds: [String],
        deferredContextIds: [String]
    ) -> SeisAGIAgentAssignment {
        let subsystemGates = subsystemsById[subsystemId]?.qualityGates ?? []
        let laneGate = lanesById[pluginLaneId]?.activationGate ?? "Use only when scoped by the current task."
        return SeisAGIAgentAssignment(
            id: id,
            role: role,
            subsystemId: subsystemId,
            pluginLaneId: pluginLaneId,
            activationMode: "candidate lane; \(laneGate)",
            selectedContextIds: selectedContextIds,
            deferredContextIds: deferredContextIds,
            outputArtifact: outputArtifact,
            qualityGates: Array(Set(qualityGates + subsystemGates)).sorted(),
            writeAllowed: writeAllowed,
            requiresHumanApproval: true
        )
    }
}
