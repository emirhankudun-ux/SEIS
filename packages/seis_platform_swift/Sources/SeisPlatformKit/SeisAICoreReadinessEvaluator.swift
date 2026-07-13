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
        "agent-governance-budgets",
        "plugin-mesh",
        "mcp-inventory",
        "prompt-engine",
        "subagent-handoffs",
        "installed-ai-workforce",
        "workforce-training-control-plane",
        "model-planning-evidence",
        "version-promotion-dry-run",
        "version-registry",
        "subagent-operating-model",
        "subagent-runtime-fixtures",
        "subagent-review-ledger"
    ]

    public init() {}

    public func evaluate(
        snapshot: SeisAICoreRuntimeSnapshotContract,
        capabilityMesh: SeisAICapabilityMesh,
        promptEngine: SeisAIPromptEngine,
        handoffSnapshot: SeisAGIAgentHandoffSnapshot,
        workforceSnapshot: SeisAIWorkforceAssignmentSnapshot? = nil,
        workforceTrainingSnapshot: SeisAIWorkforceTrainingSnapshot? = nil,
        modelPlanningSnapshot: SeisAIModelPlanningEvidenceSnapshot? = nil,
        versionPromotionSnapshot: SeisAICoreVersionPromotionSnapshot? = nil,
        versionRegistrySnapshot: SeisAICoreVersionRegistrySnapshot? = nil,
        subagentOperatingModelSnapshot: SeisAISubagentOperatingModelSnapshot? = nil,
        subagentRuntimeFixturesSnapshot: SeisAISubagentRuntimeFixturesSnapshot? = nil,
        subagentReviewLedgerSnapshot: SeisAISubagentReviewLedgerSnapshot? = nil
    ) -> SeisAICoreReadinessReport {
        let agentRuntime = try? SeisAIAgentPlanRuntime.statusAndPlanOnly(from: snapshot)
        let governanceBudgetsAreSafe = agentRuntime?.definitions.count == SeisAICoreRuntimeSnapshotContract.expectedManagedAgentCount &&
            agentRuntime?.definitions.allSatisfy { $0.governanceBudget.isSafeLocalPlanOnly } == true

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
                id: "agent-governance-budgets",
                title: "Agent governance budgets",
                passed: governanceBudgetsAreSafe,
                evidence: "Managed-agent plans are bounded to 8 steps, delegation depth 1, 30 minutes, zero cost, no background execution, and human approval for external actions."
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
            ),
            SeisAICoreReadinessCheck(
                id: "installed-ai-workforce",
                title: "Installed AI workforce registry",
                passed: workforceSnapshot?.isMetadataOnly == true && workforceSnapshot?.assignments.count == 10,
                evidence: "Ten source-backed AI/tool assignments are visible as metadata-only roles; Codex remains the primary writer and other roles do not gain direct execution authority."
            ),
            SeisAICoreReadinessCheck(
                id: "workforce-training-control-plane",
                title: "Workforce training control plane",
                passed: workforceTrainingSnapshot?.isMetadataOnly == true,
                evidence: "Ten trainer roles, seven local training loops, and four runtime-authority=false seed targets are source-backed; training remains synthetic, local, validator-gated, and approval-bound."
            ),
            SeisAICoreReadinessCheck(
                id: "model-planning-evidence",
                title: "Model planning evidence",
                passed: modelPlanningSnapshot?.isMetadataOnly == true &&
                    modelPlanningSnapshot?.agiClaimIsBlocked == true,
                evidence: "Six model-scaling and public-readiness records remain plan-only; route, runtime authority, production, and AGI claims stay blocked while Local Demo remains the only public-safe mode."
            ),
            SeisAICoreReadinessCheck(
                id: "version-promotion-dry-run",
                title: "Version promotion dry-run",
                passed: versionPromotionSnapshot?.isMetadataOnly == true,
                evidence: "Version promotion is evidence-only: status-and-plan-only runtime, five yearly gates, no release promotion, no external mutation, no credential access, and explicit human approval boundaries."
            ),
            SeisAICoreReadinessCheck(
                id: "version-registry",
                title: "AI Core version registry",
                passed: versionRegistrySnapshot?.isMetadataOnly == true,
                evidence: "SEIS AI Core v0.1, zero-key core, seven version components, five plan-only lanes, and a five-year roadmap are source-backed without foundation-model or autonomous-write claims."
            ),
            SeisAICoreReadinessCheck(
                id: "subagent-operating-model",
                title: "Sub-agent operating model",
                passed: subagentOperatingModelSnapshot?.isMetadataOnly == true,
                evidence: "Five sub-agent lanes, five permission levels, fourteen evidence requirements, and five-year cadence remain status-and-plan-only; write and external levels stay planned or forbidden."
            ),
            SeisAICoreReadinessCheck(
                id: "subagent-runtime-fixtures",
                title: "Sub-agent runtime fixtures",
                passed: subagentRuntimeFixturesSnapshot?.isMetadataOnly == true,
                evidence: "Seven runtime fixtures cover role schema, permissions, dry-run queue, cancellation, approval, redaction, and append-only planned ledger without enabling autonomous execution."
            ),
            SeisAICoreReadinessCheck(
                id: "subagent-review-ledger",
                title: "Sub-agent review ledger",
                passed: subagentReviewLedgerSnapshot?.isMetadataOnly == true,
                evidence: "Twenty quarterly records cover the five-year horizon; two are documented-validated, eighteen remain planned, and no write-gated, credential, merge, deploy, or external mutation evidence is recorded."
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
