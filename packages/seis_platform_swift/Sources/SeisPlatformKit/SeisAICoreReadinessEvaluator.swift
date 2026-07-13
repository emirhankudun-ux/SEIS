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
        "subagent-review-ledger",
        "model-scaling-council",
        "mcp-runtime-contract",
        "plugin-integration",
        "provider-registry",
        "read-only-router-contract",
        "language-model-intake",
        "language-model-training-curriculum",
        "public-readiness-program",
        "command-center-operations-readiness",
        "agi-independent-evidence-ledger",
        "agi-github-user-readiness-gates",
        "agi-public-readiness-evidence",
        "command-center-knowledge-system",
        "data-schema-registry",
        "design-component-inventory",
        "universal-capability-kernel",
        "action-governance-contracts",
        "agent-governance-contracts",
        "active-mission-board"
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
        subagentReviewLedgerSnapshot: SeisAISubagentReviewLedgerSnapshot? = nil,
        modelScalingCouncilSnapshot: SeisModelScalingSubagentCouncilSnapshot? = nil,
        mcpRuntimeContractSnapshot: SeisAICoreMCPRuntimeContractSnapshot? = nil,
        pluginIntegrationSnapshot: SeisAgentPluginIntegrationSnapshot? = nil,
        providerRegistrySnapshot: SeisAICoreProviderRegistrySnapshot? = nil,
        readOnlyRouterContractSnapshot: SeisAIReadOnlyModelRouterContractSnapshot? = nil,
        languageModelIntakeSnapshot: SeisLanguageModelIntakeRegistrySnapshot? = nil,
        languageModelTrainingCurriculumSnapshot: SeisLanguageModelTrainingCurriculumSnapshot? = nil,
        publicReadinessProgramSnapshot: SeisAIPublicReadinessProgramSnapshot? = nil,
        commandCenterOperationsReadinessSnapshot: SeisCommandCenterOperationsReadinessSnapshot? = nil,
        agiIndependentEvidenceLedgerSnapshot: SeisAGIIndependentEvidenceLedgerSnapshot? = nil,
        agiGitHubUserReadinessGatesSnapshot: SeisAGIGitHubUserReadinessGatesSnapshot? = nil,
        agiPublicReadinessEvidenceSnapshot: SeisAGIPublicReadinessEvidenceSnapshot? = nil,
        commandCenterKnowledgeSystemSnapshot: SeisCommandCenterKnowledgeSystemSnapshot? = nil,
        dataSchemaRegistrySnapshot: SeisDataSchemaRegistrySnapshot? = nil,
        designComponentInventorySnapshot: SeisDesignComponentInventorySnapshot? = nil,
        universalCapabilityKernelSnapshot: SeisUniversalCapabilityKernelSnapshot? = nil,
        actionDecisionContractSnapshot: SeisActionDecisionContractSnapshot? = nil,
        actionExecutionContractSnapshot: SeisActionExecutionContractSnapshot? = nil,
        agentRoleSchemaSnapshot: SeisAgentRoleSchemaSnapshot? = nil,
        agentPermissionMatrixSnapshot: SeisAgentPermissionMatrixSnapshot? = nil,
        activeMissionBoardSnapshot: SeisActiveMissionBoardSnapshot? = nil
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
            ),
            SeisAICoreReadinessCheck(
                id: "model-scaling-council",
                title: "Model scaling sub-agent council",
                passed: modelScalingCouncilSnapshot?.isMetadataOnly == true,
                evidence: "Twelve plan-only council agents cover 20B, 70B, 150B, 512B, and future stages; all routes remain blocked until evidence and human approval exist."
            ),
            SeisAICoreReadinessCheck(
                id: "mcp-runtime-contract",
                title: "MCP runtime contract",
                passed: mcpRuntimeContractSnapshot?.isMetadataOnly == true,
                evidence: "Local stdio JSON-RPC MCP contract exposes 35 tools, 30 resources, 3 prompts, and four verified surfaces without remote servers, credentials, SSH, deployment, GitHub mutation, or unrestricted shell execution."
            ),
            SeisAICoreReadinessCheck(
                id: "plugin-integration",
                title: "Plugin integration manifest",
                passed: pluginIntegrationSnapshot?.isMetadataOnly == true,
                evidence: "185 installed/enabled and 5 not-installed audit states, five personal plugins, ten specialist lanes, 300 helper plugins, and scoped activation policy are source-backed without authentication or blanket activation claims."
            ),
            SeisAICoreReadinessCheck(
                id: "provider-registry",
                title: "Provider registry",
                passed: providerRegistrySnapshot?.isMetadataOnly == true,
                evidence: "Seven provider records preserve Available, Missing Key, Disabled, Rate Limited, and Error semantics; core remains zero-key Local Demo and frontend secrets remain forbidden."
            ),
            SeisAICoreReadinessCheck(
                id: "read-only-router-contract",
                title: "Read-only router contract",
                passed: readOnlyRouterContractSnapshot?.isMetadataOnly == true,
                evidence: "Provider-neutral router contract keeps Local Demo default, named states, explicit fallback, redacted decisions, blocked private content, and executionPerformed=false."
            ),
            SeisAICoreReadinessCheck(
                id: "language-model-intake",
                title: "Language model intake registry",
                passed: languageModelIntakeSnapshot?.isMetadataOnly == true,
                evidence: "Eight candidate model families remain metadata-only, three hardware lanes remain gated, and five training lanes keep downloads, inference, fine-tuning, and foundation training explicitly unauthorized."
            ),
            SeisAICoreReadinessCheck(
                id: "language-model-training-curriculum",
                title: "Language model training curriculum",
                passed: languageModelTrainingCurriculumSnapshot?.isMetadataOnly == true,
                evidence: "Eight family candidates, three hardware lanes, four scaling targets, and four curriculum phases remain planning-only; safe controls keep installs, checkpoints, providers, datasets, fine-tuning, inference, benchmarks, and foundation training disabled."
            ),
            SeisAICoreReadinessCheck(
                id: "public-readiness-program",
                title: "Public readiness program",
                passed: publicReadinessProgramSnapshot?.isLocalDemoOnly == true,
                evidence: "Local Demo is public-review-ready without keys, while GitHub-wide readiness, AGI claims, 512B route eligibility, runtime authority, training, weights, inference, and benchmark status remain explicitly blocked or not started."
            ),
            SeisAICoreReadinessCheck(
                id: "command-center-operations-readiness",
                title: "Command Center operations readiness",
                passed: commandCenterOperationsReadinessSnapshot?.isReviewBeforeRelease == true,
                evidence: "Release, CI, security, rollback, and handoff evidence remain visible in review-before-release state; release-ready requires local quality, clean source boundary, external CI or explicit handoff evidence, and rollback proof."
            ),
            SeisAICoreReadinessCheck(
                id: "agi-independent-evidence-ledger",
                title: "AGI independent evidence ledger",
                passed: agiIndependentEvidenceLedgerSnapshot?.isPlanOnly == true,
                evidence: "Independent AGI and 512B evidence remains missing and approval is not recorded; Local Demo stays available while routeability, runtime authority, AGI claims, internet downloads, training, inference, benchmarks, and deployment remain blocked."
            ),
            SeisAICoreReadinessCheck(
                id: "agi-github-user-readiness-gates",
                title: "GitHub user readiness gates",
                passed: agiGitHubUserReadinessGatesSnapshot?.isLocalDemoOnly == true,
                evidence: "GitHub users may review the Local Demo and run no-key validators, while real AGI use, live providers, 512B routeability, runtime authority, release approval, and external mutation remain gated."
            ),
            SeisAICoreReadinessCheck(
                id: "agi-public-readiness-evidence",
                title: "AGI public readiness evidence",
                passed: agiPublicReadinessEvidenceSnapshot?.isBlockedPlanOnly == true,
                evidence: "Twenty minimum AGI/512B evidence requirements remain missing, zero are accepted, and the protocol is not run; Local Demo remains available while AGI claims, routeability, inference, benchmarks, providers, training, and deployment stay blocked."
            ),
            SeisAICoreReadinessCheck(
                id: "command-center-knowledge-system",
                title: "Command Center knowledge system",
                passed: commandCenterKnowledgeSystemSnapshot?.isMetadataOnly == true,
                evidence: "Repository memory, knowledge-graph nodes, research sources, decisions, reusable patterns, security policy, and agent handoff evidence remain source-backed and secret-free."
            ),
            SeisAICoreReadinessCheck(
                id: "data-schema-registry",
                title: "SEIS-Data schema registry",
                passed: dataSchemaRegistrySnapshot?.isMetadataOnly == true,
                evidence: "Eighteen source-backed data contracts cover @seis, @seis-cloud, @seis-code, @seis-design, and @seis-data without reading record contents or storing secrets."
            ),
            SeisAICoreReadinessCheck(
                id: "design-component-inventory",
                title: "SEIS-Design component inventory",
                passed: designComponentInventorySnapshot?.isMetadataOnly == true,
                evidence: "Twelve source-backed design components preserve accessibility, motion, selectors, and validation metadata without executable UI mutation."
            ),
            SeisAICoreReadinessCheck(
                id: "universal-capability-kernel",
                title: "Universal capability kernel",
                passed: universalCapabilityKernelSnapshot?.isMetadataOnly == true,
                evidence: "Thirty-eight domains, fourteen lanes, thirty-eight agent roles, and 168 plugin inventory records remain source-backed and approval-gated."
            ),
            SeisAICoreReadinessCheck(
                id: "action-governance-contracts",
                title: "Action governance contracts",
                passed: actionDecisionContractSnapshot?.isMetadataOnly == true && actionExecutionContractSnapshot?.isMetadataOnly == true,
                evidence: "Read-only decisions, dry-run execution, redaction, explicit approval, and documented rollback remain source-backed; no action authority is implied."
            ),
            SeisAICoreReadinessCheck(
                id: "agent-governance-contracts",
                title: "Agent governance contracts",
                passed: agentRoleSchemaSnapshot?.isMetadataOnly == true && agentPermissionMatrixSnapshot?.isMetadataOnly == true,
                evidence: "Five lane roles and five permission levels remain status-and-plan-only, with write/external/forbidden actions separately gated or forbidden."
            ),
            SeisAICoreReadinessCheck(
                id: "active-mission-board",
                title: "Active mission board",
                passed: activeMissionBoardSnapshot?.isMetadataOnly == true,
                evidence: "Thirty deterministic mission cards cover now, next, and queued lanes with platform, language, quality-gate, and acceptance-gate metadata."
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
