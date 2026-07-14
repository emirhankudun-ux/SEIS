import Foundation
import Testing
@testable import SeisPlatformKit

@Test func aiCoreRuntimeSnapshotDecodesTheRealFixtureWithExactMetrics() throws {
    let snapshot = try loadRuntimeSnapshot()
    let metrics = snapshot.summaryMetrics

    #expect(snapshot.id == "seis-ai-core-runtime-snapshot")
    #expect(snapshot.schemaVersion == "1.0.0")
    #expect(snapshot.mode == "Local Demo")
    #expect(snapshot.providerFixtures.count == 7)
    #expect(snapshot.routeScenarios.count == 7)
    #expect(snapshot.agentRegistry.managedLanes.count == 9)
    #expect(snapshot.agentRegistry.agents.count == 13)
    #expect(snapshot.agentPermissionMatrixRegistry.levels.count == 5)
    #expect(snapshot.agentPermissionMatrixRegistry.enabledLevelCount == 2)
    #expect(snapshot.agentPermissionMatrixRegistry.isMetadataOnly)
    #expect(snapshot.subagentRuntimeFixturesRegistry.fixtureCount == 7)
    #expect(snapshot.subagentRuntimeFixturesRegistry.executionLedgerFixture.requiredFieldCount == 19)
    #expect(snapshot.subagentRuntimeFixturesRegistry.executionLedgerFixture.sampleRecord.isSafe)
    #expect(snapshot.subagentRuntimeFixturesRegistry.isMetadataOnly)
    #expect(snapshot.pluginMesh.personalLanes.count == 5)
    #expect(snapshot.pluginMesh.capabilityCatalog.id == "seis-plugin-capability-catalog")
    #expect(snapshot.pluginMesh.capabilityCatalog.status == "source-backed-read-only")
    #expect(snapshot.pluginMesh.capabilityCatalog.pluginCount == 6)
    #expect(snapshot.pluginMesh.capabilityCatalog.personalPluginCount == 5)
    #expect(snapshot.pluginMesh.capabilityCatalog.specialistPluginCount == 4)
    #expect(snapshot.pluginMesh.capabilityCatalog.manifestCapabilityCount == 67)
    #expect(snapshot.pluginMesh.capabilityCatalog.personalManifestCapabilityCount == 51)
    #expect(snapshot.pluginMesh.capabilityCatalog.profileQualityCommandCount == 18)
    #expect(snapshot.pluginMesh.capabilityCatalog.qualityCommandGaps.isEmpty)
    #expect(snapshot.pluginMesh.capabilityCatalog.missingProfilePaths == ["plugins/seis/assets/lane-profile.json"])
    #expect(snapshot.pluginMesh.capabilityCatalog.boundary.localReadOnly)
    #expect(snapshot.pluginMesh.capabilityCatalog.boundary.blanketActivationClaimed == false)
    #expect(snapshot.pluginMesh.mcpMesh.id == "seis-plugin-mcp-mesh")
    #expect(snapshot.pluginMesh.mcpMesh.serverCount == 6)
    #expect(snapshot.pluginMesh.mcpMesh.configuredServerCount == 6)
    #expect(snapshot.pluginMesh.mcpMesh.servers.count == 6)
    #expect(snapshot.pluginMesh.mcpMesh.boundary.liveSessionStarted == false)
    #expect(snapshot.pluginMesh.mcpMesh.boundary.probeOptIn)
    #expect(snapshot.pluginMesh.mcpMesh.status == "probe-verified-local-read-only")
    #expect(snapshot.pluginMesh.mcpMesh.boundary.localProbePerformed)
    #expect(snapshot.pluginMesh.mcpMesh.probe.safeToolCallsPerformed)
    #expect(snapshot.pluginMesh.mcpMesh.probe.safeToolProbeCount == 6)
    #expect(snapshot.pluginMesh.mcpMesh.boundary.safeToolCallsPerformed)
    #expect(snapshot.pluginMesh.mcpMesh.servers.allSatisfy { $0.status == "probe-verified" })
    #expect(snapshot.pluginMesh.mcpMesh.servers.allSatisfy { $0.toolInventory.mode == "stdio-probe" })
    #expect(snapshot.pluginMesh.mcpMesh.servers.allSatisfy { $0.safeToolProbe.isVerified })
    #expect(snapshot.pluginMesh.mcpMesh.servers.reduce(0) { $0 + ($1.toolInventory.toolCount ?? 0) } == 38)
    #expect(snapshot.mcpRuntime.transport == "stdio newline-delimited JSON-RPC")
    #expect(snapshot.mcpRuntime.lifecycle == "initialize -> notifications/initialized -> tools/list")
    #expect(snapshot.mcpRuntime.counts == SeisAICoreMCPCounts(tools: 37, resources: 30, prompts: 3))

    #expect(metrics.providerCount == 7)
    #expect(metrics.availableProviderCount == 2)
    #expect(metrics.routingEligibleProviderCount == 2)
    #expect(metrics.missingKeyProviderCount == 3)
    #expect(metrics.disabledProviderCount == 2)
    #expect(metrics.scenarioCount == 7)
    #expect(metrics.boundarySafeScenarioCount == 7)
    #expect(metrics.managedLaneCount == 9)
    #expect(metrics.managedAgentCount == 13)
    #expect(metrics.personalLaneCount == 5)
    #expect(metrics.personalLaneToolCount == 10)
    #expect(metrics.mcpToolCount == 37)
    #expect(metrics.mcpResourceCount == 30)
    #expect(metrics.mcpPromptCount == 3)
    #expect(metrics.runtimeBoundarySafe)

    requireSendable(snapshot)

    let encoded = try JSONEncoder().encode(snapshot)
    let encodedText = String(decoding: encoded, as: UTF8.self)
    #expect(encodedText.contains("\"toolCount\":23"))
    let roundTrip = try SeisAICoreRuntimeSnapshotContract.validated(from: encoded)
    #expect(roundTrip == snapshot)
    #expect(roundTrip.applicationIntegration.runtimeBoundary == snapshot.applicationIntegration.runtimeBoundary)
    #expect(roundTrip.agentRegistry.safetyBoundary == snapshot.agentRegistry.safetyBoundary)
    #expect(
        roundTrip.agentRegistry.humanApprovalRequiredForMutation ==
            snapshot.agentRegistry.humanApprovalRequiredForMutation
    )
    #expect(roundTrip.runtimeBoundary == snapshot.runtimeBoundary)
}

@Test func aiCoreRuntimeSnapshotDecodesNativeConsumerAndManagedAgentRegistry() throws {
    let snapshot = try loadRuntimeSnapshot()
    let nativeConsumer = snapshot.applicationIntegration.nativeConsumer
    let agentRegistry = snapshot.agentRegistry

    #expect(snapshot.sourceOfTruth.agentRegistry == "content/development/seis-second-brain-system.json")
    #expect(agentRegistry.id == "seis-second-brain-system")
    #expect(agentRegistry.status == "review-only-agent-registry")
    #expect(agentRegistry.mode == "local-demo")
    #expect(agentRegistry.source == snapshot.sourceOfTruth.agentRegistry)
    #expect(agentRegistry.sourceQualityGate == "npm run check:seis-second-brain")
    #expect(agentRegistry.decision == "NO-GO-autonomous-execution-not-approved")
    #expect(agentRegistry.managedLaneCount == 9)
    #expect(agentRegistry.agentCount == 13)
    #expect(!agentRegistry.runtimeAuthority)
    #expect(agentRegistry.permissionBoundary == "status-and-plan-only")
    #expect(agentRegistry.managedLanes.map(\.id) == SeisAICoreRuntimeSnapshotContract.expectedManagedLaneIDs)
    #expect(agentRegistry.agents.map(\.id) == SeisAICoreRuntimeSnapshotContract.expectedManagedAgentIDs)
    #expect(agentRegistry.agents.allSatisfy { !$0.executionAuthority })
    #expect(agentRegistry.agents.first { $0.id == "security-agent" }?.status == "blocking-review-gate")
    #expect(agentRegistry.safetyBoundary.isSafe)
    #expect(agentRegistry.humanApprovalRequiredForMutation)
    #expect(agentRegistry.isReadOnlySafe)

    #expect(nativeConsumer.id == "seis-platform-kit")
    #expect(nativeConsumer.decodeMode == "injected-data-read-only-validation")
    #expect(!nativeConsumer.runtimeAuthority)
    #expect(nativeConsumer.sourceArtifact == snapshot.sourceOfTruth.output)
    #expect(
        nativeConsumer.contractPath ==
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAICoreRuntimeSnapshotContract.swift"
    )
    #expect(
        nativeConsumer.testsPath ==
            "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisAICoreRuntimeSnapshotContractTests.swift"
    )
    #expect(snapshot.applicationIntegration.runtimeBoundary.isSafe)
}

@Test func aiCoreRuntimeSnapshotDecodesTypedProviderStatesAndFixtures() throws {
    let snapshot = try loadRuntimeSnapshot()
    let fixturesByID = Dictionary(
        snapshot.providerFixtures.map { ($0.id, $0) },
        uniquingKeysWith: { first, _ in first }
    )

    #expect(snapshot.providerRegistry.publicStates == SeisAICoreProviderState.allCases)
    #expect(snapshot.providerRegistry.environmentValidation.isSafe)
    #expect(snapshot.providerRegistry.environmentValidation.secretValuesReturned == false)
    #expect(snapshot.providerRegistry.environmentValidation.credentialAuthenticationPerformed == false)
    #expect(snapshot.providerRegistry.environmentValidation.networkCalled == false)
    #expect(fixturesByID["codex-operator"]?.publicStatus == .available)
    #expect(fixturesByID["seis-local-demo"]?.publicStatus == .available)
    #expect(fixturesByID["anthropic-claude"]?.publicStatus == .missingKey)
    #expect(fixturesByID["openai-general"]?.publicStatus == .missingKey)
    #expect(fixturesByID["google-gemini"]?.publicStatus == .missingKey)
    #expect(fixturesByID["qwen-review"]?.publicStatus == .disabled)
    #expect(fixturesByID["ollama-local"]?.publicStatus == .disabled)
    #expect(snapshot.providerFixtures.allSatisfy { $0.respectsCredentialBoundary })
    #expect(snapshot.applicationIntegration.semantics(for: .missingKey)?.contains("not an Error") == true)
}

@Test func aiCoreRuntimeSnapshotKeepsPrivateVaultRoutingDisabled() throws {
    let snapshot = try loadRuntimeSnapshot()
    let scenario = try #require(snapshot.routeScenarios.first { $0.id == "private-vault-block" })

    #expect(scenario.input.localOnly)
    #expect(scenario.decision.selectedProvider == "none")
    #expect(scenario.decision.selectedModel == "none")
    #expect(scenario.decision.providerState == .disabled)
    #expect(scenario.decision.registryProviderState == nil)
    #expect(!scenario.decision.routeEligible)
    #expect(!scenario.decision.executionPerformed)
    #expect(!scenario.decision.providerCallsPerformed)
    #expect(scenario.decision.safetyBoundary.isIsolated)
    #expect(scenario.decision.blockedReasons.contains { $0.lowercased().contains("private obsidian") })
}

@Test func aiCoreRuntimeSnapshotPassesEveryInvariantWithoutRuntimeAuthority() throws {
    let snapshot = try loadRuntimeSnapshot()

    #expect(snapshot.validationIssues.isEmpty)
    #expect(snapshot.isValid)
    #expect(snapshot.applicationIntegration.runtimeBoundary.isSafe)
    #expect(snapshot.agentRegistry.isReadOnlySafe)
    #expect(snapshot.runtimeBoundary.isSafe)
    #expect(snapshot.routeScenarios.allSatisfy { $0.decision.respectsReadOnlyBoundary })
    #expect(snapshot.routeScenarios.allSatisfy { $0.decision.safetyBoundary.isIsolated })
    #expect(snapshot.routeScenarios.allSatisfy { $0.decision.providerMediation.isSafe })
    #expect(snapshot.routeScenarios.allSatisfy { $0.decision.decisionIntegrity.isSafe })
    #expect(snapshot.routeScenarios.allSatisfy { $0.decision.agentLane.permissionBoundary == "plan-only" })
    #expect(snapshot.routeScenarios.allSatisfy { ["verified", "fail-closed"].contains($0.decision.agentLane.permissionSourceStatus) })
    #expect(snapshot.routeScenarios.allSatisfy { !$0.decision.agentLane.executionPerformed })
}

@Test func aiCoreRuntimeSnapshotRoundTripPreservesRouterIntegrityEvidence() throws {
    let snapshot = try loadRuntimeSnapshot()
    let encoded = try JSONEncoder().encode(snapshot)
    let decoded = try SeisAICoreRuntimeSnapshotContract(data: encoded)

    #expect(decoded.routeScenarios.count == snapshot.routeScenarios.count)
    #expect(decoded.routeScenarios.allSatisfy { $0.decision.providerMediation.isSafe })
    #expect(decoded.routeScenarios.allSatisfy { $0.decision.decisionIntegrity.isSafe })
    #expect(decoded.routeScenarios.allSatisfy { $0.decision.agentLane.permissionBoundary == "plan-only" })
    #expect(decoded.routeScenarios.allSatisfy { ["verified", "fail-closed"].contains($0.decision.agentLane.permissionSourceStatus) })
}

@Test func aiCoreRuntimeSnapshotRejectsMutatedRuntimeBoundaries() throws {
    let fixtureData = try runtimeSnapshotData()
    let prohibitedTrueValues = [
        "providerCalls",
        "credentialsRead",
        "frontendSecretsAllowed",
        "liveMcpSessionStarted",
        "sshExecuted",
        "deploymentPerformed",
        "githubMutationPerformed",
        "privateContentRead",
        "routeExecutionPerformed"
    ]

    for key in prohibitedTrueValues {
        let mutatedData = try replacingJSONObjectValue(
            in: fixtureData,
            objectPath: ["runtimeBoundary"],
            key: key,
            with: true
        )
        let error = try validationError(for: mutatedData)

        #expect(error.validationIssues.contains { $0.contains("runtimeBoundary.\(key)") })
    }

    let approvalDisabledData = try replacingJSONObjectValue(
        in: fixtureData,
        objectPath: ["runtimeBoundary"],
        key: "humanApprovalRequiredForLiveActions",
        with: false
    )
    let approvalError = try validationError(for: approvalDisabledData)
    #expect(
        approvalError.validationIssues.contains {
            $0.contains("runtimeBoundary.humanApprovalRequiredForLiveActions")
        }
    )
}

@Test func aiCoreRuntimeSnapshotRejectsMutatedRoutesProvidersAndMCPCounts() throws {
    let fixtureData = try runtimeSnapshotData()

    let executingRouteData = try replacingRouteDecisionValue(
        in: fixtureData,
        scenarioID: "governance-plan",
        key: "executionPerformed",
        with: true
    )
    let executingRouteError = try validationError(for: executingRouteData)
    #expect(executingRouteError.validationIssues.contains { $0.contains("governance-plan") })

    let frontendSecretData = try replacingProviderValue(
        in: fixtureData,
        providerID: "codex-operator",
        key: "frontendSecretAllowed",
        with: true
    )
    let frontendSecretError = try validationError(for: frontendSecretData)
    #expect(frontendSecretError.validationIssues.contains { $0.contains("frontendSecretAllowed") })

    let privateVaultEnabledData = try enablingPrivateVaultProviderSelection(in: fixtureData)
    let privateVaultError = try validationError(for: privateVaultEnabledData)
    #expect(privateVaultError.validationIssues.contains { $0.contains("private-vault-block") })

    let incorrectMCPCountData = try replacingJSONObjectValue(
        in: fixtureData,
        objectPath: ["mcpRuntime"],
        key: "toolCount",
        with: 36
    )
    let incorrectMCPCountError = try validationError(for: incorrectMCPCountData)
    #expect(incorrectMCPCountError.validationIssues.contains { $0.contains("37 tools") })
}

@Test func aiCoreRuntimeSnapshotValidatedDecoderRejectsAgentAndNativeAuthorityMutations() throws {
    let fixtureData = try runtimeSnapshotData()

    let registryAuthorityData = try replacingJSONObjectValue(
        in: fixtureData,
        objectPath: ["agentRegistry"],
        key: "runtimeAuthority",
        with: true
    )
    let registryAuthorityError = try validationError(for: registryAuthorityData)
    #expect(registryAuthorityError.validationIssues.contains { $0.contains("agentRegistry.runtimeAuthority") })

    let nativeAuthorityData = try replacingJSONObjectValue(
        in: fixtureData,
        objectPath: ["applicationIntegration", "nativeConsumer"],
        key: "runtimeAuthority",
        with: true
    )
    let nativeAuthorityError = try validationError(for: nativeAuthorityData)
    #expect(
        nativeAuthorityError.validationIssues.contains {
            $0.contains("applicationIntegration.nativeConsumer.runtimeAuthority")
        }
    )

    let agentExecutionData = try replacingAgentValue(
        in: fixtureData,
        agentID: "code-agent",
        key: "executionAuthority",
        with: true
    )
    let agentExecutionError = try validationError(for: agentExecutionData)
    #expect(agentExecutionError.validationIssues.contains { $0.contains("code-agent") })

    let safetyMutationData = try replacingJSONObjectValue(
        in: fixtureData,
        objectPath: ["agentRegistry", "safetyBoundary"],
        key: "providerCalls",
        with: true
    )
    let safetyMutationError = try validationError(for: safetyMutationData)
    #expect(
        safetyMutationError.validationIssues.contains {
            $0.contains("agentRegistry.safetyBoundary.providerCalls")
        }
    )

    let approvalMutationData = try replacingJSONObjectValue(
        in: fixtureData,
        objectPath: ["agentRegistry"],
        key: "humanApprovalRequiredForMutation",
        with: false
    )
    let approvalMutationError = try validationError(for: approvalMutationData)
    #expect(
        approvalMutationError.validationIssues.contains {
            $0.contains("agentRegistry.humanApprovalRequiredForMutation")
        }
    )

    let permissionMatrixMutationData = try replacingJSONObjectValue(
        in: fixtureData,
        objectPath: ["agentPermissionMatrixRegistry"],
        key: "enabledLevelCount",
        with: 3
    )
    let permissionMatrixMutationError = try validationError(for: permissionMatrixMutationData)
    #expect(
        permissionMatrixMutationError.validationIssues.contains {
            $0.contains("agentPermissionMatrixRegistry")
        }
    )

    let executionLedgerMutationData = try replacingJSONObjectValue(
        in: fixtureData,
        objectPath: ["subagentRuntimeFixturesRegistry", "executionLedgerFixture", "sampleRecord"],
        key: "externalMutationPerformed",
        with: true
    )
    let executionLedgerMutationError = try validationError(for: executionLedgerMutationData)
    #expect(
        executionLedgerMutationError.validationIssues.contains {
            $0.contains("execution ledger fixture") || $0.contains("subagentRuntimeFixturesRegistry")
        }
    )

    let applicationRuntimeData = try replacingJSONObjectValue(
        in: fixtureData,
        objectPath: ["applicationIntegration", "runtimeBoundary"],
        key: "executionPerformed",
        with: true
    )
    let applicationRuntimeError = try validationError(for: applicationRuntimeData)
    #expect(
        applicationRuntimeError.validationIssues.contains {
            $0.contains("applicationIntegration.runtimeBoundary.executionPerformed")
        }
    )

    requireSendable(registryAuthorityError)
}

@Test func aiCoreRuntimeSnapshotRouteProviderStatesFailClosed() throws {
    let mutatedData = try replacingRouteDecisionValue(
        in: runtimeSnapshotData(),
        scenarioID: "governance-plan",
        key: "providerState",
        with: "Missing Key"
    )

    #expect(throws: DecodingError.self) {
        _ = try SeisAICoreRuntimeSnapshotContract.validated(from: mutatedData)
    }
}

@Test func aiCoreRuntimeSnapshotValidatedDecoderRequiresExplicitNullableKeys() throws {
    let fixtureData = try runtimeSnapshotData()

    let missingRegistryStateData = try removingRouteDecisionKey(
        in: fixtureData,
        scenarioID: "private-vault-block",
        key: "registryProviderState"
    )
    let missingRegistryStateError = try validationError(for: missingRegistryStateData)
    #expect(
        missingRegistryStateError.validationIssues.contains {
            $0.contains("private-vault-block") && $0.contains("registryProviderState")
        }
    )

    let missingParameterCountData = try removingModelClaimBoundaryKey(
        in: fixtureData,
        scenarioID: "governance-plan",
        key: "parameterCountBillion"
    )
    let missingParameterCountError = try validationError(for: missingParameterCountData)
    #expect(
        missingParameterCountError.validationIssues.contains {
            $0.contains("governance-plan") && $0.contains("parameterCountBillion")
        }
    )
}

@Test func aiCoreRuntimeSnapshotValidatedDecoderRejectsOversizedInput() throws {
    let oversizedData = Data(
        repeating: 0x20,
        count: SeisAICoreRuntimeSnapshotContract.maximumInputByteCount + 1
    )
    let error = try validationError(for: oversizedData)

    #expect(error.validationIssues.contains { $0.contains("maximumInputByteCount") })
}

private enum RuntimeSnapshotTestError: Error {
    case expectedJSONObject
    case expectedValidationFailure
    case missingObject(String)
    case missingArray(String)
    case missingRecord(String)
}

private func loadRuntimeSnapshot() throws -> SeisAICoreRuntimeSnapshotContract {
    try SeisAICoreRuntimeSnapshotContract.validated(from: runtimeSnapshotData())
}

private func validationError(for data: Data) throws -> SeisAICoreRuntimeSnapshotValidationError {
    do {
        _ = try SeisAICoreRuntimeSnapshotContract.validated(from: data)
    } catch let error as SeisAICoreRuntimeSnapshotValidationError {
        return error
    }
    throw RuntimeSnapshotTestError.expectedValidationFailure
}

private func runtimeSnapshotData() throws -> Data {
    let snapshotURL = repositoryRoot()
        .appendingPathComponent("apps")
        .appendingPathComponent("seis-core")
        .appendingPathComponent("data")
        .appendingPathComponent("seis-ai-core-runtime-snapshot.json")
    return try Data(contentsOf: snapshotURL)
}

private func repositoryRoot() -> URL {
    var url = URL(fileURLWithPath: #filePath)
    for _ in 0..<5 {
        url.deleteLastPathComponent()
    }
    return url
}

private func replacingJSONObjectValue(
    in data: Data,
    objectPath: [String],
    key: String,
    with value: Any
) throws -> Data {
    try mutatingJSONObject(data) { object in
        try setJSONValue(value, in: &object, objectPath: objectPath[...], key: key)
    }
}

private func setJSONValue(
    _ value: Any,
    in object: inout [String: Any],
    objectPath: ArraySlice<String>,
    key: String
) throws {
    guard let component = objectPath.first else {
        object[key] = value
        return
    }
    guard var child = object[component] as? [String: Any] else {
        throw RuntimeSnapshotTestError.missingObject(component)
    }

    try setJSONValue(value, in: &child, objectPath: objectPath.dropFirst(), key: key)
    object[component] = child
}

private func replacingRouteDecisionValue(
    in data: Data,
    scenarioID: String,
    key: String,
    with value: Any
) throws -> Data {
    try mutatingJSONObject(data) { object in
        guard var router = object["router"] as? [String: Any] else {
            throw RuntimeSnapshotTestError.missingObject("router")
        }
        guard var scenarios = router["scenarios"] as? [[String: Any]] else {
            throw RuntimeSnapshotTestError.missingArray("router.scenarios")
        }
        guard let index = scenarios.firstIndex(where: { $0["id"] as? String == scenarioID }) else {
            throw RuntimeSnapshotTestError.missingRecord(scenarioID)
        }

        var scenario = scenarios[index]
        guard var decision = scenario["decision"] as? [String: Any] else {
            throw RuntimeSnapshotTestError.missingObject("router.scenarios[\(scenarioID)].decision")
        }
        decision[key] = value
        scenario["decision"] = decision
        scenarios[index] = scenario
        router["scenarios"] = scenarios
        object["router"] = router
    }
}

private func removingRouteDecisionKey(
    in data: Data,
    scenarioID: String,
    key: String
) throws -> Data {
    try mutatingJSONObject(data) { object in
        guard var router = object["router"] as? [String: Any] else {
            throw RuntimeSnapshotTestError.missingObject("router")
        }
        guard var scenarios = router["scenarios"] as? [[String: Any]] else {
            throw RuntimeSnapshotTestError.missingArray("router.scenarios")
        }
        guard let index = scenarios.firstIndex(where: { $0["id"] as? String == scenarioID }) else {
            throw RuntimeSnapshotTestError.missingRecord(scenarioID)
        }

        var scenario = scenarios[index]
        guard var decision = scenario["decision"] as? [String: Any] else {
            throw RuntimeSnapshotTestError.missingObject("router.scenarios[\(scenarioID)].decision")
        }
        decision.removeValue(forKey: key)
        scenario["decision"] = decision
        scenarios[index] = scenario
        router["scenarios"] = scenarios
        object["router"] = router
    }
}

private func removingModelClaimBoundaryKey(
    in data: Data,
    scenarioID: String,
    key: String
) throws -> Data {
    try mutatingJSONObject(data) { object in
        guard var router = object["router"] as? [String: Any] else {
            throw RuntimeSnapshotTestError.missingObject("router")
        }
        guard var scenarios = router["scenarios"] as? [[String: Any]] else {
            throw RuntimeSnapshotTestError.missingArray("router.scenarios")
        }
        guard let index = scenarios.firstIndex(where: { $0["id"] as? String == scenarioID }) else {
            throw RuntimeSnapshotTestError.missingRecord(scenarioID)
        }

        var scenario = scenarios[index]
        guard var decision = scenario["decision"] as? [String: Any] else {
            throw RuntimeSnapshotTestError.missingObject("router.scenarios[\(scenarioID)].decision")
        }
        guard var modelClaimBoundary = decision["modelClaimBoundary"] as? [String: Any] else {
            throw RuntimeSnapshotTestError.missingObject(
                "router.scenarios[\(scenarioID)].decision.modelClaimBoundary"
            )
        }
        modelClaimBoundary.removeValue(forKey: key)
        decision["modelClaimBoundary"] = modelClaimBoundary
        scenario["decision"] = decision
        scenarios[index] = scenario
        router["scenarios"] = scenarios
        object["router"] = router
    }
}

private func replacingProviderValue(
    in data: Data,
    providerID: String,
    key: String,
    with value: Any
) throws -> Data {
    try mutatingJSONObject(data) { object in
        guard var registry = object["providerRegistry"] as? [String: Any] else {
            throw RuntimeSnapshotTestError.missingObject("providerRegistry")
        }
        guard var providers = registry["providers"] as? [[String: Any]] else {
            throw RuntimeSnapshotTestError.missingArray("providerRegistry.providers")
        }
        guard let index = providers.firstIndex(where: { $0["id"] as? String == providerID }) else {
            throw RuntimeSnapshotTestError.missingRecord(providerID)
        }

        providers[index][key] = value
        registry["providers"] = providers
        object["providerRegistry"] = registry
    }
}

private func replacingAgentValue(
    in data: Data,
    agentID: String,
    key: String,
    with value: Any
) throws -> Data {
    try mutatingJSONObject(data) { object in
        guard var registry = object["agentRegistry"] as? [String: Any] else {
            throw RuntimeSnapshotTestError.missingObject("agentRegistry")
        }
        guard var agents = registry["agents"] as? [[String: Any]] else {
            throw RuntimeSnapshotTestError.missingArray("agentRegistry.agents")
        }
        guard let index = agents.firstIndex(where: { $0["id"] as? String == agentID }) else {
            throw RuntimeSnapshotTestError.missingRecord(agentID)
        }

        agents[index][key] = value
        registry["agents"] = agents
        object["agentRegistry"] = registry
    }
}

private func enablingPrivateVaultProviderSelection(in data: Data) throws -> Data {
    try mutatingJSONObject(data) { object in
        guard var router = object["router"] as? [String: Any] else {
            throw RuntimeSnapshotTestError.missingObject("router")
        }
        guard var scenarios = router["scenarios"] as? [[String: Any]] else {
            throw RuntimeSnapshotTestError.missingArray("router.scenarios")
        }
        guard let index = scenarios.firstIndex(where: { $0["id"] as? String == "private-vault-block" }) else {
            throw RuntimeSnapshotTestError.missingRecord("private-vault-block")
        }

        var scenario = scenarios[index]
        guard var decision = scenario["decision"] as? [String: Any] else {
            throw RuntimeSnapshotTestError.missingObject("private-vault-block.decision")
        }
        decision["selectedProvider"] = "codex-operator"
        decision["selectedModel"] = "current-codex-session"
        decision["providerState"] = "Available"
        decision["registryProviderState"] = "Available"
        scenario["decision"] = decision
        scenarios[index] = scenario
        router["scenarios"] = scenarios
        object["router"] = router
    }
}

private func mutatingJSONObject(
    _ data: Data,
    mutation: (inout [String: Any]) throws -> Void
) throws -> Data {
    guard var object = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
        throw RuntimeSnapshotTestError.expectedJSONObject
    }
    try mutation(&object)
    return try JSONSerialization.data(withJSONObject: object, options: [.sortedKeys])
}

private func requireSendable<T: Sendable>(_: T) {}
