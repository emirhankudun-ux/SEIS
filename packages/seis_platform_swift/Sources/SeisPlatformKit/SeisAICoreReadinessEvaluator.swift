import Foundation

public enum SeisAICoreReadinessStatus: String, Codable, Equatable, Sendable {
    case readyLocalDemo = "ready-local-demo"
    case blocked
}

public struct SeisAICoreReadinessCheck: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let passed: Bool
    public let evidence: String

    public init(id: String, title: String, passed: Bool, evidence: String) {
        self.id = id
        self.title = title
        self.passed = passed
        self.evidence = evidence
    }
}

public struct SeisAICoreReadinessReport: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let evaluatorVersion: String
    public let status: SeisAICoreReadinessStatus
    public let checks: [SeisAICoreReadinessCheck]
    public let truthBoundary: String

    public init(
        id: String,
        evaluatorVersion: String,
        status: SeisAICoreReadinessStatus,
        checks: [SeisAICoreReadinessCheck],
        truthBoundary: String
    ) {
        self.id = id
        self.evaluatorVersion = evaluatorVersion
        self.status = status
        self.checks = checks
        self.truthBoundary = truthBoundary
    }

    public var passedCount: Int { checks.filter(\.passed).count }
    public var failedCount: Int { checks.count - passedCount }
    public var isReadyLocalDemo: Bool {
        status == .readyLocalDemo && !checks.isEmpty && failedCount == 0
    }
    public var statusLabel: String {
        "\(status.rawValue) · \(passedCount)/\(checks.count) checks"
    }
}

public struct SeisAICoreReadinessEvaluator: Sendable {
    public static let evaluatorVersion = "seis-ai-core-readiness-v1"
    public static let expectedCheckIDs = [
        "runtime-boundary",
        "provider-registry",
        "agent-registry",
        "plugin-mesh",
        "mcp-inventory",
        "prompt-engine",
        "subagent-handoffs"
    ]

    public init() {}

    public func evaluate(
        snapshot: SeisAICoreRuntimeSnapshotContract,
        capabilityMesh: SeisAICapabilityMesh,
        promptEngine: SeisAIPromptEngine,
        handoffSnapshot: SeisAGIAgentHandoffSnapshot
    ) -> SeisAICoreReadinessReport {
        let checks = [
            SeisAICoreReadinessCheck(
                id: "runtime-boundary",
                title: "Runtime boundary",
                passed: snapshot.runtimeBoundary.isSafe,
                evidence: "No provider, credential, network, MCP session, SSH, deployment, GitHub mutation, or route execution."
            ),
            SeisAICoreReadinessCheck(
                id: "provider-registry",
                title: "Provider registry",
                passed: snapshot.providerRegistry.providers.count == SeisAICoreRuntimeSnapshotContract.expectedProviderCount &&
                    snapshot.providerRegistry.localOnlyRespected &&
                    snapshot.providerRegistry.providers.allSatisfy(\.respectsCredentialBoundary),
                evidence: "Seven source-backed provider states remain fixture/status data; missing key is distinct from error."
            ),
            SeisAICoreReadinessCheck(
                id: "agent-registry",
                title: "Managed agent registry",
                passed: snapshot.agentRegistry.isReadOnlySafe &&
                    snapshot.agentRegistry.agentCount == SeisAICoreRuntimeSnapshotContract.expectedManagedAgentCount,
                evidence: "Thirteen managed agents remain status-and-plan-only with mutation approval required."
            ),
            SeisAICoreReadinessCheck(
                id: "plugin-mesh",
                title: "Plugin capability mesh",
                passed: capabilityMesh.isValid,
                evidence: capabilityMesh.pluginStatusLabel
            ),
            SeisAICoreReadinessCheck(
                id: "mcp-inventory",
                title: "MCP inventory",
                passed: capabilityMesh.mcpCounts == SeisAICoreRuntimeSnapshotContract.expectedMCPCounts &&
                    capabilityMesh.mcpSurfaces.allSatisfy { $0.state == "verified" },
                evidence: capabilityMesh.mcpStatusLabel
            ),
            SeisAICoreReadinessCheck(
                id: "prompt-engine",
                title: "Prompt engine",
                passed: promptEngine.version == SeisAIPromptEngine.currentVersion &&
                    promptEngine.templates.count == SeisAIPromptKind.allCases.count &&
                    promptEngine.templates.allSatisfy { $0.validationIssues.isEmpty },
                evidence: "Versioned templates reject undeclared variables and secret-shaped values; rendering is ephemeral."
            ),
            SeisAICoreReadinessCheck(
                id: "subagent-handoffs",
                title: "Sub-agent handoffs",
                passed: handoffSnapshot.isReady,
                evidence: "One writer, separated reviewer/researcher/designer roles, traceable plugin lanes, and human approval."
            )
        ]
        let status: SeisAICoreReadinessStatus = checks.allSatisfy(\.passed) ? .readyLocalDemo : .blocked
        return SeisAICoreReadinessReport(
            id: "seis-ai-core-readiness-report",
            evaluatorVersion: Self.evaluatorVersion,
            status: status,
            checks: checks,
            truthBoundary: "Local Demo readiness only. This report is not proof of live provider access, trained model ownership, autonomous execution, deployment, SSH, or production readiness."
        )
    }
}
