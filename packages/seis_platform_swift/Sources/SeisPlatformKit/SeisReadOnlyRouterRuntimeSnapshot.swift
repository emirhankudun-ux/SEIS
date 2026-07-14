import Foundation

public struct SeisReadOnlyRouterRuntimeBoundary: Codable, Equatable, Sendable {
    public let runtimeAuthority: Bool
    public let routeEligible: Bool
    public let providerCalls: Bool
    public let credentialRead: Bool
    public let promptBodyRead: Bool
    public let privateObsidianContentRead: Bool
    public let agentExecution: Bool
    public let externalMutation: Bool
    public let coreRequiresCloudApiKey: Bool
}

public struct SeisReadOnlyRouterProviderMediation: Codable, Equatable, Sendable {
    public let mode: String
    public let frontendSecretAllowed: Bool
    public let routeExecutionEnabled: Bool
    public let status: String

    public var isSafe: Bool {
        mode == "backend-only" &&
            !frontendSecretAllowed &&
            !routeExecutionEnabled &&
            status == "required-before-live-routing"
    }
}

public struct SeisReadOnlyRouterDecisionIntegrity: Codable, Equatable, Sendable {
    public let readOnlyOnly: Bool
    public let runtimeAuthority: Bool
    public let executionPerformedAlwaysFalse: Bool
    public let noPromptBodyInDecision: Bool
    public let noCredentialMaterialInDecision: Bool
    public let decisionLogsRedacted: Bool
    public let providerStateNamed: Bool
    public let selectedProviderExplicit: Bool
    public let fallbackExplicit: Bool
    public let blockedReasonsRequired: Bool
    public let backendOnlyProvidersRequired: Bool
    public let privateObsidianContentRoutable: Bool

    public var isSafe: Bool {
        readOnlyOnly &&
            !runtimeAuthority &&
            executionPerformedAlwaysFalse &&
            noPromptBodyInDecision &&
            noCredentialMaterialInDecision &&
            decisionLogsRedacted &&
            providerStateNamed &&
            selectedProviderExplicit &&
            fallbackExplicit &&
            blockedReasonsRequired &&
            backendOnlyProvidersRequired &&
            !privateObsidianContentRoutable
    }
}

public struct SeisReadOnlyRouterSourceOfTruth: Codable, Equatable, Sendable {
    public let contract: String
    public let providerRegistry: String
    public let subagentOperatingModel: String
    public let runtimeModule: String
    public let runtimeCli: String
    public let agentTool: String
    public let mcpResource: String
    public let runtimeTests: String
}

public struct SeisReadOnlyRouterModelClaimBoundary: Codable, Equatable, Sendable {
    public let isTrainedModel: Bool
    public let isFoundationModel: Bool
    public let isAgi: Bool
    public let route512BEligible: Bool
    public let parameterCountEvidence: String

    enum CodingKeys: String, CodingKey {
        case isTrainedModel
        case isFoundationModel
        case isAgi
        case route512BEligible = "512BRouteEligible"
        case parameterCountEvidence
    }
}

public enum SeisReadOnlyRouterRuntimeSnapshotError: Error, Equatable, Sendable {
    case invalidData
    case invalidSnapshot([String])
}

public struct SeisReadOnlyRouterRuntimeSnapshot: Codable, Equatable, Sendable {
    public let id: String
    public let version: String
    public let status: String
    public let purpose: String
    public let qualityGate: String
    public let runtimeBoundary: SeisReadOnlyRouterRuntimeBoundary
    public let providerMediation: SeisReadOnlyRouterProviderMediation
    public let decisionIntegrity: SeisReadOnlyRouterDecisionIntegrity
    public let sourceOfTruth: SeisReadOnlyRouterSourceOfTruth
    public let inputs: [String]
    public let providerStateRules: [String]
    public let forbiddenInputs: [String]
    public let agentLaneCoverage: [String]
    public let modelClaimBoundary: SeisReadOnlyRouterModelClaimBoundary

    public static func validated(from data: Data) throws -> SeisReadOnlyRouterRuntimeSnapshot {
        guard let snapshot = try? JSONDecoder().decode(Self.self, from: data) else {
            throw SeisReadOnlyRouterRuntimeSnapshotError.invalidData
        }
        let issues = snapshot.validationIssues
        guard issues.isEmpty else {
            throw SeisReadOnlyRouterRuntimeSnapshotError.invalidSnapshot(issues)
        }
        return snapshot
    }

    public var validationIssues: [String] {
        var issues: [String] = []
        let expectedLanes = ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"]
        let expectedInputs = ["task type metadata", "capability label metadata", "privacy mode", "local-only flag", "cost preference", "speed preference", "context size requirement", "tool support requirement", "explicit fallback policy"]
        if id != "seis-ai-core-read-only-router-runtime" || version != "1.0.0" || status != "local-read-only-runtime" ||
            purpose.isEmpty || qualityGate != "npm run check:seis-ai-core-read-only-router" {
            issues.append("read-only router runtime identity or quality gate is invalid")
        }
        if inputs != expectedInputs || providerStateRules.count != 5 || forbiddenInputs.count != 7 ||
            agentLaneCoverage != expectedLanes ||
            !providerStateRules.contains("Missing Key is not Error") ||
            !providerStateRules.contains("local-only mode never routes to cloud providers") ||
            !forbiddenInputs.contains("API keys and tokens") ||
            !forbiddenInputs.contains("private Obsidian vault contents") {
            issues.append("read-only router runtime policy lists are incomplete")
        }
        let boundary = runtimeBoundary
        if boundary.runtimeAuthority || boundary.routeEligible || boundary.providerCalls || boundary.credentialRead ||
            boundary.promptBodyRead || boundary.privateObsidianContentRead || boundary.agentExecution ||
            boundary.externalMutation || boundary.coreRequiresCloudApiKey {
            issues.append("read-only router runtime boundary permits unsafe authority")
        }
        if !providerMediation.isSafe {
            issues.append("read-only router runtime provider mediation is not backend-only and pre-live")
        }
        if !decisionIntegrity.isSafe {
            issues.append("read-only router runtime decision integrity is unsafe")
        }
        if sourceOfTruth.contract != "content/development/seis-read-only-model-router-contract.json" ||
            sourceOfTruth.providerRegistry != "content/development/seis-ai-core-provider-registry.json" ||
            sourceOfTruth.subagentOperatingModel != "content/development/seis-ai-core-subagent-operating-model.json" ||
            sourceOfTruth.runtimeModule != "packages/seis-ai/src/model/read-only-router.mjs" ||
            sourceOfTruth.runtimeCli != "packages/seis-ai/bin/seis-router.mjs" ||
            sourceOfTruth.agentTool != "seis_ai_core_read_only_route" ||
            sourceOfTruth.mcpResource != "seis://ai/read-only-router-runtime.json" ||
            sourceOfTruth.runtimeTests != "packages/seis-ai/test/read-only-router.test.mjs" {
            issues.append("read-only router runtime source-of-truth map is incomplete")
        }
        if modelClaimBoundary.isTrainedModel || modelClaimBoundary.isFoundationModel || modelClaimBoundary.isAgi ||
            modelClaimBoundary.route512BEligible || modelClaimBoundary.parameterCountEvidence != "not provided by this evaluator" {
            issues.append("read-only router runtime model claim boundary is unsafe")
        }
        return issues
    }

    public var isMetadataOnly: Bool {
        validationIssues.isEmpty &&
            !runtimeBoundary.runtimeAuthority &&
            !runtimeBoundary.routeEligible &&
            !runtimeBoundary.providerCalls &&
            providerMediation.isSafe &&
            decisionIntegrity.isSafe &&
            !modelClaimBoundary.isAgi
    }

    public var inputCount: Int { inputs.count }
    public var coveredLaneCount: Int { agentLaneCoverage.count }
}
