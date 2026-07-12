import Foundation
import Testing
@testable import SeisPlatformKit

@Test func personalLaneRuntimeIntegratesEveryDeclaredSEISLane() throws {
    let snapshot = try SeisAICoreRuntimeSnapshotContract.validated(from: runtimeSnapshotData())
    let runtime = try SeisAIPersonalLaneRuntime.readOnly(from: snapshot)

    #expect(runtime.definitions.map(\.id) == SeisAICoreRuntimeSnapshotContract.expectedPersonalLaneIDs)
    #expect(runtime.definitions.allSatisfy { $0.validationIssues.isEmpty })

    for definition in runtime.definitions {
        let plan = runtime.makePlan(
            for: SeisAIPersonalLaneTaskRequest(
                id: "plan-\(definition.id)",
                laneID: definition.id,
                purpose: "Create a bounded readiness plan for \(definition.displayName).",
                requestedActions: [.inspectCapabilityContract, .prepareReadOnlyPlan],
                requestedMCPToolIDs: [definition.declaredMCPToolIDs[0]],
                inputReferences: ["apps/seis-core/data/seis-ai-core-runtime-snapshot.json"]
            )
        )

        #expect(plan.outcome == .planned)
        #expect(plan.laneID == definition.id)
        #expect(plan.plannedActions == [.inspectCapabilityContract, .prepareReadOnlyPlan])
        #expect(plan.blockedActions.isEmpty)
        #expect(plan.declaredMCPToolIDs == definition.declaredMCPToolIDs)
        #expect(plan.requestedMCPToolIDs == [definition.declaredMCPToolIDs[0]])
        #expect(plan.acceptedInputReferences == ["apps/seis-core/data/seis-ai-core-runtime-snapshot.json"])
        #expect(plan.qualityGate == definition.qualityGate)
        #expect(plan.validationRules.contains("no-live-mcp-invocation"))
        #expect(plan.isReadOnly)
        #expect(!plan.mcpInvocationPerformed)
        #expect(!plan.executionPerformed)
    }
}

@Test func personalLaneRuntimeBlocksLiveMCPAndUnknownLaneRequests() throws {
    let snapshot = try SeisAICoreRuntimeSnapshotContract.validated(from: runtimeSnapshotData())
    let runtime = try SeisAIPersonalLaneRuntime.readOnly(from: snapshot)

    let mcpPlan = runtime.makePlan(
        for: SeisAIPersonalLaneTaskRequest(
            id: "live-mcp-request",
            laneID: "seis-cloud",
            purpose: "Attempt a cloud MCP invocation.",
            requestedActions: [.prepareReadOnlyPlan, .invokeMCP],
            requestedMCPToolIDs: ["seis_cloud_plan"]
        )
    )
    #expect(mcpPlan.outcome == .blocked)
    #expect(mcpPlan.plannedActions.isEmpty)
    #expect(mcpPlan.blockedActions.contains(.invokeMCP))
    #expect(mcpPlan.blockedReasons.contains("requested actions cross the personal lane read-only boundary"))
    #expect(mcpPlan.isReadOnly)

    let unpermittedInputPlan = runtime.makePlan(
        for: SeisAIPersonalLaneTaskRequest(
            id: "private-input-request",
            laneID: "seis",
            purpose: "Attempt to plan from a private environment file.",
            requestedActions: [.prepareReadOnlyPlan],
            inputReferences: [".env"]
        )
    )
    #expect(unpermittedInputPlan.outcome == .blocked)
    #expect(unpermittedInputPlan.acceptedInputReferences.isEmpty)
    #expect(
        unpermittedInputPlan.blockedReasons.contains(
            "input references are outside the Local Demo allow-list: .env"
        )
    )

    let unknownPlan = runtime.makePlan(
        for: SeisAIPersonalLaneTaskRequest(
            id: "unknown-lane-request",
            laneID: "unregistered-lane",
            purpose: "Create a bounded readiness plan.",
            requestedActions: [.prepareReadOnlyPlan]
        )
    )
    #expect(unknownPlan.outcome == .blocked)
    #expect(unknownPlan.declaredMCPToolIDs.isEmpty)
    #expect(unknownPlan.blockedReasons == ["personal lane unregistered-lane is not registered"])
    #expect(unknownPlan.isReadOnly)
}

@Test func personalLaneRuntimeNormalizesAValidReorderedSnapshot() throws {
    let snapshot = try SeisAICoreRuntimeSnapshotContract.validated(from: reorderedRuntimeSnapshotData())
    let runtime = try SeisAIPersonalLaneRuntime.readOnly(from: snapshot)

    #expect(runtime.definitions.map(\.id) == SeisAICoreRuntimeSnapshotContract.expectedPersonalLaneIDs)
    #expect(runtime.definitions.allSatisfy { $0.validationIssues.isEmpty })
}

@Test func localDemoRuntimeExposesPersonalLanePlansOnlyWhenSnapshotIsValidated() async throws {
    let runtime = try SeisAIRuntime.localDemo(snapshotData: runtimeSnapshotData())

    let plan = await runtime.planPersonalLaneTask(
        SeisAIPersonalLaneTaskRequest(
            id: "runtime-seis-data-plan",
            laneID: "seis-data",
            purpose: "Produce a provenance readiness plan.",
            requestedActions: [.inspectCapabilityContract, .reviewQualityGate],
            requestedMCPToolIDs: ["seis_data_plan"]
        )
    )

    #expect(plan.outcome == .planned)
    #expect(plan.qualityGate == "npm run check:plugin-capability-lanes")
    #expect(plan.isReadOnly)
    #expect(plan.requiredApprovals.count == 1)
}

@Test func runtimeFailsClosedWithoutAnInjectedPersonalLaneRuntime() async throws {
    let runtime = try SeisAIRuntime()
    let plan = await runtime.planPersonalLaneTask(
        SeisAIPersonalLaneTaskRequest(
            id: "unconfigured-runtime-plan",
            laneID: "seis",
            purpose: "Attempt a repository governance plan without a validated snapshot.",
            requestedActions: [.prepareReadOnlyPlan],
            requestedMCPToolIDs: ["seis_hub_plan"]
        )
    )

    #expect(plan.outcome == .blocked)
    #expect(plan.plannedActions.isEmpty)
    #expect(plan.blockedActions == [.prepareReadOnlyPlan])
    #expect(plan.validationRules == ["fail-closed-without-personal-lane-runtime"])
    #expect(plan.blockedReasons == ["no validated personal lane runtime was injected"])
    #expect(plan.isReadOnly)
}

@Test func personalLaneRuntimeRejectsInvalidDefinitions() throws {
    let invalidDefinition = SeisAIPersonalLaneDefinition(
        id: "seis",
        displayName: "SEIS Hub",
        role: "repository governance",
        declaredMCPToolIDs: ["seis_hub_plan", "seis_hub_plan"],
        qualityGate: "npm run check:seis-ai-agent"
    )

    #expect(throws: SeisAIPersonalLaneRuntimeError.self) {
        _ = try SeisAIPersonalLaneRuntime(definitions: [invalidDefinition])
    }
}

private func runtimeSnapshotData() throws -> Data {
    let snapshotURL = repositoryRoot()
        .appendingPathComponent("apps")
        .appendingPathComponent("seis-core")
        .appendingPathComponent("data")
        .appendingPathComponent("seis-ai-core-runtime-snapshot.json")
    return try Data(contentsOf: snapshotURL)
}

private func reorderedRuntimeSnapshotData() throws -> Data {
    let decoded = try JSONSerialization.jsonObject(with: runtimeSnapshotData())
    guard
        var root = decoded as? [String: Any],
        var pluginMesh = root["pluginMesh"] as? [String: Any],
        let personalLanes = pluginMesh["personalLanes"] as? [[String: Any]],
        var mcpRuntime = root["mcpRuntime"] as? [String: Any]
    else {
        throw NSError(domain: "SeisAIPersonalLaneRuntimeTests", code: 1)
    }

    pluginMesh["personalLanes"] = Array(personalLanes.reversed())
    root["pluginMesh"] = pluginMesh
    mcpRuntime["boundary"] = "Local Demo MCP boundary is structurally validated."
    root["mcpRuntime"] = mcpRuntime
    return try JSONSerialization.data(withJSONObject: root, options: [.sortedKeys])
}

private func repositoryRoot() -> URL {
    var url = URL(fileURLWithPath: #filePath)
    for _ in 0..<5 {
        url.deleteLastPathComponent()
    }
    return url
}
