import Foundation
import SeisPlatformKit
import SwiftUI

@MainActor
final class SeisAICoreLocalDemoModel: ObservableObject {
    @Published private(set) var snapshot: SeisAICoreRuntimeSnapshotContract?
    @Published private(set) var capabilityMesh: SeisAICapabilityMesh?
    @Published private(set) var orchestrationSnapshot = SeisAGIAgentHandoffSnapshot.current()
    @Published private(set) var statusMessage = "AI Core snapshot has not been loaded."
    @Published private(set) var lastPlan: SeisAIPersonalLaneTaskPlan?
    @Published private(set) var lastAgentPlan: SeisAIAgentTaskPlan?
    @Published private(set) var evidence: [SeisAIExecutionEvidence] = []
    @Published private(set) var evidencePersistenceState: SeisAIExecutionEvidencePersistenceState = .memoryOnly
    @Published private(set) var isPlanning = false

    private let repositoryPath: String
    private let evidenceLedger: SeisAIExecutionEvidenceLedger
    let promptEngine = SeisAIPromptEngine.defaultEngine
    private var runtime: SeisAIRuntime?

    init(repositoryPath: String) {
        self.repositoryPath = repositoryPath
        self.evidenceLedger = SeisAIExecutionEvidenceLedger(storageURL: Self.evidenceStorageURL())
    }

    func load() {
        do {
            let data = try Data(contentsOf: snapshotURL)
            let nextSnapshot = try SeisAICoreRuntimeSnapshotContract.validated(from: data)
            let loadedRuntime = try SeisAIRuntime.localDemo(snapshotData: data, evidenceLedger: evidenceLedger)
            runtime = loadedRuntime
            snapshot = nextSnapshot
            capabilityMesh = SeisAICapabilityMesh(snapshot: nextSnapshot)
            orchestrationSnapshot = SeisAGIAgentHandoffSnapshot.current()
            lastPlan = nil
            lastAgentPlan = nil
            statusMessage = "Local Demo ready: \(nextSnapshot.pluginMesh.personalLanes.count) lanes are linked to the typed runtime."
            Task {
                evidence = await loadedRuntime.evidenceSnapshot(limit: 8)
                evidencePersistenceState = await loadedRuntime.evidencePersistenceState()
            }
        } catch {
            runtime = nil
            snapshot = nil
            capabilityMesh = nil
            orchestrationSnapshot = SeisAGIAgentHandoffSnapshot(records: [])
            lastPlan = nil
            lastAgentPlan = nil
            evidence = []
            Task {
                evidencePersistenceState = await evidenceLedger.persistenceState
            }
            statusMessage = "AI Core Local Demo is unavailable because the tracked snapshot did not validate."
        }
    }

    func planAgent(_ agent: SeisAICoreManagedAgent) {
        guard let runtime else {
            statusMessage = "Load a validated snapshot before planning an agent."
            return
        }

        isPlanning = true
        let request = SeisAIAgentTaskRequest(
            id: "apple-agent-plan-\(agent.id)",
            agentID: agent.id,
            purpose: "Prepare a bounded status-and-plan-only readiness plan for \(agent.displayName).",
            requestedActions: [.inspectRepositoryMetadata, .producePlan],
            inputReferences: ["apps/seis-core/data/seis-ai-core-runtime-snapshot.json"]
        )

        Task {
            let plan = await runtime.planAgentTask(request)
            lastAgentPlan = plan
            evidence = await runtime.evidenceSnapshot(limit: 8)
            evidencePersistenceState = await runtime.evidencePersistenceState()
            isPlanning = false
            statusMessage = plan.outcome == .planned
                ? "\(agent.displayName) plan prepared without runtime authority."
                : "\(agent.displayName) plan was blocked by the Local Demo boundary."
        }
    }

    func planArchitectTask(purpose: String) {
        guard let runtime else {
            statusMessage = "Load a validated snapshot before planning a task."
            return
        }

        isPlanning = true
        let request = SeisAIAgentTaskRequest(
            id: "apple-architect-task-plan",
            agentID: "architect-agent",
            purpose: purpose,
            requestedActions: [.inspectRepositoryMetadata, .producePlan],
            inputReferences: ["apps/seis-core/data/seis-ai-core-runtime-snapshot.json"]
        )

        Task {
            let plan = await runtime.planAgentTask(request)
            lastAgentPlan = plan
            evidence = await runtime.evidenceSnapshot(limit: 8)
            evidencePersistenceState = await runtime.evidencePersistenceState()
            isPlanning = false
            statusMessage = plan.outcome == .planned
                ? "Architect task plan prepared locally; purpose text was not persisted to evidence."
                : "Architect task plan was blocked by the Local Demo boundary."
        }
    }

    func plan(for lane: SeisAICorePersonalLane) {
        guard let runtime else {
            statusMessage = "Load a validated snapshot before planning a lane."
            return
        }

        isPlanning = true
        let request = SeisAIPersonalLaneTaskRequest(
            id: "apple-local-plan-\(lane.id)",
            laneID: lane.id,
            purpose: "Prepare a bounded Apple-native readiness plan for \(lane.displayName).",
            requestedActions: [
                .inspectCapabilityContract,
                .prepareReadOnlyPlan,
                .reviewQualityGate
            ],
            requestedMCPToolIDs: [lane.mcpTools.last ?? ""],
            inputReferences: ["apps/seis-core/data/seis-ai-core-runtime-snapshot.json"]
        )

        Task {
            let plan = await runtime.planPersonalLaneTask(request)
            lastPlan = plan
            evidence = await runtime.evidenceSnapshot(limit: 8)
            evidencePersistenceState = await runtime.evidencePersistenceState()
            isPlanning = false
            statusMessage = plan.outcome == .planned
                ? "\(lane.displayName) plan prepared without invoking MCP or a provider."
                : "\(lane.displayName) plan was blocked by the Local Demo boundary."
        }
    }

    private var snapshotURL: URL {
        URL(fileURLWithPath: repositoryPath)
            .appendingPathComponent("apps")
            .appendingPathComponent("seis-core")
            .appendingPathComponent("data")
            .appendingPathComponent("seis-ai-core-runtime-snapshot.json")
    }

    private static func evidenceStorageURL() -> URL? {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)
            .first?
            .appendingPathComponent("SEIS", isDirectory: true)
            .appendingPathComponent("ai-core-execution-evidence.json")
    }
}

struct SeisAICoreLocalDemoView: View {
    @StateObject private var model: SeisAICoreLocalDemoModel
    @State private var taskPurpose = "Prepare a bounded repository readiness plan."

    init(repositoryPath: String) {
        _model = StateObject(wrappedValue: SeisAICoreLocalDemoModel(repositoryPath: repositoryPath))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            header

            if let snapshot = model.snapshot {
                metrics(snapshot: snapshot)
                if let capabilityMesh = model.capabilityMesh {
                    capabilityMeshDisclosure(mesh: capabilityMesh)
                }
                orchestrationDisclosure(snapshot: model.orchestrationSnapshot)
                promptCatalogDisclosure(engine: model.promptEngine)
                providerList(snapshot: snapshot)
                taskPlanner
                laneList(snapshot: snapshot)
                agentList(snapshot: snapshot)

                if let plan = model.lastPlan {
                    planResult(plan)
                }

                if let agentPlan = model.lastAgentPlan {
                    agentPlanResult(agentPlan)
                }

                if !model.evidence.isEmpty {
                    evidenceLedger
                }
            } else {
                VStack(spacing: 8) {
                    Image(systemName: "exclamationmark.shield")
                        .font(.title2)
                        .foregroundStyle(.orange)
                    Text("AI Core Local Demo unavailable")
                        .font(.subheadline.weight(.semibold))
                    Text(model.statusMessage)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity, minHeight: 160)
            }
        }
        .padding(16)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
        .onAppear(perform: model.load)
    }

    private var header: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "brain.head.profile")
                .font(.title2)
                .foregroundStyle(.indigo)
                .frame(width: 34, height: 34)
                .background(.indigo.opacity(0.12), in: RoundedRectangle(cornerRadius: 9))

            VStack(alignment: .leading, spacing: 4) {
                Text("SEIS AI Core")
                    .font(.headline)
                Text("Typed Local Demo plans for the five declared SEIS lanes")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Button {
                model.load()
            } label: {
                Label("Refresh", systemImage: "arrow.clockwise")
            }
            .buttonStyle(.bordered)
            .disabled(model.isPlanning)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("SEIS AI Core Local Demo. \(model.statusMessage)")
    }

    private func metrics(snapshot: SeisAICoreRuntimeSnapshotContract) -> some View {
        let metrics = snapshot.summaryMetrics
        return LazyVGrid(
            columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())],
            spacing: 8
        ) {
            metric("Providers", value: "\(metrics.providerCount)", image: "cpu")
            metric("Lanes", value: "\(metrics.personalLaneCount)", image: "square.stack.3d.up")
            metric("Agents", value: "\(metrics.managedAgentCount)", image: "person.3")
            metric("MCP tools", value: "\(metrics.mcpToolCount)", image: "wrench.and.screwdriver")
            metric("Resources", value: "\(metrics.mcpResourceCount)", image: "folder")
            metric("Boundary", value: metrics.runtimeBoundarySafe ? "safe" : "watch", image: "checkmark.shield")
            metric("Evidence", value: model.evidencePersistenceState.displayLabel, image: "externaldrive")
        }
    }

    private func providerList(snapshot: SeisAICoreRuntimeSnapshotContract) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 7) {
                Text("Source-backed status only; no credential validation or provider call is performed.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                ForEach(snapshot.providerRegistry.providers) { provider in
                    HStack(alignment: .top, spacing: 9) {
                        Image(systemName: provider.publicStatus == .available ? "checkmark.shield" : "exclamationmark.shield")
                            .foregroundStyle(providerStatusColor(provider.publicStatus))
                            .frame(width: 20)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(provider.displayName)
                                .font(.caption.weight(.semibold))
                            Text("\(provider.publicStatus.rawValue) · \(provider.actualModel)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text("Credential: \(provider.credentialRequirement) · Backend-only: \(provider.backendOnly ? "yes" : "no") · Routing: \(provider.routingEligible ? "eligible" : "blocked")")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }

                        Spacer(minLength: 0)
                    }
                    .padding(8)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                }
            }
            .padding(.top, 8)
        } label: {
            Label("Provider status (\(snapshot.providerRegistry.providers.count))", systemImage: "cpu")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Provider status list with \(snapshot.providerRegistry.providers.count) source-backed providers. No credential validation or provider call is performed.")
    }

    private func capabilityMeshDisclosure(mesh: SeisAICapabilityMesh) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text(mesh.pluginStatusLabel)
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                Text("Activation: \(mesh.activationPolicy)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                Text(mesh.mcpStatusLabel)
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                Text("Personal lanes: \(mesh.laneIDs.joined(separator: ", "))")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)

                ForEach(mesh.mcpSurfaces) { surface in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: surface.state == "verified" ? "checkmark.seal" : "questionmark.circle")
                            .foregroundStyle(surface.state == "verified" ? .green : .orange)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(surface.label) · \(surface.count)")
                                .font(.caption.weight(.semibold))
                            Text("\(surface.method) · \(surface.state)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(8)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                }

                Text(mesh.isValid
                     ? "Source-backed capability mesh validated. Native view has no MCP invocation or plugin activation authority."
                     : mesh.validationIssues.joined(separator: " "))
                    .font(.caption2)
                    .foregroundStyle(mesh.isValid ? .green : .orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Plugin + MCP capability mesh", systemImage: "point.3.connected.trianglepath.dotted")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Plugin and MCP capability mesh. \(mesh.pluginStatusLabel). \(mesh.mcpStatusLabel). No plugin activation or MCP invocation is performed.")
    }

    private func orchestrationDisclosure(snapshot: SeisAGIAgentHandoffSnapshot) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(snapshot.statusLabel)
                        .font(.caption.monospaced())
                        .foregroundStyle(snapshot.isReady ? .green : .orange)
                    Spacer(minLength: 8)
                    Text(snapshot.writerStatusLabel)
                        .font(.caption2.monospaced())
                        .foregroundStyle(.secondary)
                }
                Text("Plugin lanes: \(snapshot.pluginLaneSummary)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                Text("Governance: one writer, separated reviewer, researcher, and designer roles; all handoffs require human approval.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                ForEach(snapshot.records) { record in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: record.writeAllowed ? "pencil.circle" : "checkmark.shield")
                            .foregroundStyle(record.writeAllowed ? .orange : .green)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(record.role.rawValue) · \(record.assignmentId)")
                                .font(.caption.weight(.semibold))
                            Text("\(record.pluginLaneId) · \(record.outputArtifact) · \(record.status.rawValue)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text("Write: \(record.writeAllowed ? "yes" : "no") · Approval: \(record.requiresHumanApproval ? "required" : "missing")")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(8)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                }

                Text("Handoff plan only. No agent was activated, no file was written, and no provider, MCP, SSH, deployment, or GitHub action was executed.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Sub-agent orchestration and handoffs", systemImage: "arrow.triangle.branch")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Sub-agent orchestration and handoffs. \(snapshot.statusLabel). One writer and separate reviewer, researcher, and designer roles. Human approval required; no execution performed.")
    }

    private func promptCatalogDisclosure(engine: SeisAIPromptEngine) -> some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: 8) {
                Text("Version: \(engine.version) · \(engine.templates.count) templates")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                Text("System, task, review, coding, documentation, security, SSH review, and clean-room prompts are versioned and secret-rejecting.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                ForEach(engine.templates) { template in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: "text.book.closed")
                            .foregroundStyle(.tint)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(template.title) · \(template.kind.rawValue)")
                                .font(.caption.weight(.semibold))
                            Text("\(template.id) · \(template.version)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text(template.safetyBoundary)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(8)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                }

                Text("Rendered prompts are ephemeral and are not written to the evidence ledger, local session state, or repository.")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
            .padding(.top, 8)
        } label: {
            Label("Versioned prompt engine", systemImage: "text.book.closed.fill")
                .font(.subheadline.weight(.semibold))
        }
        .accessibilityLabel("Versioned prompt engine. Eight typed prompt categories, secret rejection, and ephemeral rendering only.")
    }

    private func providerStatusColor(_ status: SeisAICoreProviderState) -> Color {
        switch status {
        case .available:
            .green
        case .missingKey, .disabled, .rateLimited, .error:
            .orange
        }
    }

    private var taskPlanner: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Local task planner", systemImage: "text.badge.checkmark")
                .font(.subheadline.weight(.semibold))
            TextField("Task purpose", text: $taskPurpose)
                .textFieldStyle(.roundedBorder)
                .onSubmit { model.planArchitectTask(purpose: taskPurpose) }
            HStack {
                Text("Purpose is sent only to the local plan runtime and is not persisted in evidence.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Spacer(minLength: 8)
                Button {
                    model.planArchitectTask(purpose: taskPurpose)
                } label: {
                    Label("Plan", systemImage: "list.clipboard")
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.small)
                .disabled(model.isPlanning)
            }
        }
        .padding(10)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Local task planner. Purpose is sent only to the local plan runtime and is not persisted in evidence.")
    }

    private func metric(_ title: String, value: String, image: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: image)
                .foregroundStyle(.secondary)
            VStack(alignment: .leading, spacing: 1) {
                Text(value)
                    .font(.subheadline.weight(.semibold))
                Text(title)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
        }
        .padding(9)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
    }

    private func laneList(snapshot: SeisAICoreRuntimeSnapshotContract) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Personal Lane Plans")
                .font(.subheadline.weight(.semibold))

            ForEach(snapshot.pluginMesh.personalLanes) { lane in
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: laneSymbol(for: lane.id))
                        .foregroundStyle(.tint)
                        .frame(width: 20)

                    VStack(alignment: .leading, spacing: 3) {
                        Text(lane.displayName)
                            .font(.subheadline.weight(.semibold))
                        Text(lane.role)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                        Text("Declared MCP: \(lane.mcpTools.joined(separator: ", "))")
                            .font(.caption2.monospaced())
                            .foregroundStyle(.tertiary)
                        Text("Gate: \(lane.qualityGate)")
                            .font(.caption2.monospaced())
                            .foregroundStyle(.tertiary)
                    }

                    Spacer(minLength: 8)

                    Button {
                        model.plan(for: lane)
                    } label: {
                        Label("Plan", systemImage: "list.clipboard")
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                    .disabled(model.isPlanning)
                }
                .padding(10)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
            }
        }
    }

    private func agentList(snapshot: SeisAICoreRuntimeSnapshotContract) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Managed Agent Plans")
                .font(.subheadline.weight(.semibold))

            ForEach(snapshot.agentRegistry.agents) { agent in
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: agent.executionAuthority ? "person.badge.key" : "person.badge.clock")
                        .foregroundStyle(agent.executionAuthority ? .orange : .tint)
                        .frame(width: 20)

                    VStack(alignment: .leading, spacing: 3) {
                        Text(agent.displayName)
                            .font(.subheadline.weight(.semibold))
                        Text(agent.duty)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                        Text("Status: \(agent.status) · Runtime authority: \(agent.executionAuthority ? "yes" : "no")")
                            .font(.caption2.monospaced())
                            .foregroundStyle(.tertiary)
                    }

                    Spacer(minLength: 8)

                    Button {
                        model.planAgent(agent)
                    } label: {
                        Label("Plan", systemImage: "list.clipboard")
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                    .disabled(model.isPlanning)
                }
                .padding(10)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
            }
        }
    }

    private func planResult(_ plan: SeisAIPersonalLaneTaskPlan) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack {
                Label(
                    plan.outcome == .planned ? "Read-only plan ready" : "Plan blocked",
                    systemImage: plan.outcome == .planned ? "checkmark.circle.fill" : "xmark.octagon.fill"
                )
                .foregroundStyle(plan.outcome == .planned ? .green : .orange)
                .font(.subheadline.weight(.semibold))
                Spacer()
                Text(plan.laneID)
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
            }

            Text("Actions: \(plan.plannedActions.map(\.rawValue).joined(separator: ", "))")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)
            Text("MCP invocation performed: no")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)

            if !plan.acceptedInputReferences.isEmpty {
                Text("Inputs: \(plan.acceptedInputReferences.joined(separator: ", "))")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
            }

            if let qualityGate = plan.qualityGate {
                Text("Quality gate: \(qualityGate)")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
            }

            if !plan.blockedReasons.isEmpty {
                Text(plan.blockedReasons.joined(separator: " "))
                    .font(.caption)
                    .foregroundStyle(.orange)
            }
        }
        .padding(10)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Personal lane plan \(plan.outcome.rawValue) for \(plan.laneID). MCP invocation was not performed.")
    }

    private func agentPlanResult(_ plan: SeisAIAgentTaskPlan) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack {
                Label(
                    plan.outcome == .planned ? "Agent plan ready" : "Agent plan blocked",
                    systemImage: plan.outcome == .planned ? "checkmark.circle.fill" : "xmark.octagon.fill"
                )
                .foregroundStyle(plan.outcome == .planned ? .green : .orange)
                .font(.subheadline.weight(.semibold))
                Spacer()
                Text(plan.agentID)
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
            }

            Text("Actions: \(plan.plannedActions.map(\.rawValue).joined(separator: ", "))")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)
            Text("Plan-only: yes · Runtime authority: no · Provider/MCP execution: no")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)
            Text("Required approvals: \(plan.requiredApprovals.count)")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)

            if !plan.blockedReasons.isEmpty {
                Text(plan.blockedReasons.joined(separator: " "))
                    .font(.caption)
                    .foregroundStyle(.orange)
            }
        }
        .padding(10)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Agent plan \(plan.outcome.rawValue) for \(plan.agentID). Plan-only and no runtime authority.")
    }

    private var evidenceLedger: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Execution evidence", systemImage: "list.bullet.rectangle.portrait")
                .font(.subheadline.weight(.semibold))

            Text("Persistence: \(model.evidencePersistenceState.displayLabel)")
                .font(.caption2.monospaced())
                .foregroundStyle(model.evidencePersistenceState.isPersistent ? .secondary : .orange)

            ForEach(model.evidence.reversed()) { entry in
                HStack(alignment: .top, spacing: 8) {
                    Image(systemName: entry.outcome == .blocked ? "xmark.octagon" : "checkmark.shield")
                        .foregroundStyle(entry.outcome == .blocked ? .orange : .green)
                        .frame(width: 18)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("#\(entry.sequence) \(entry.kind.rawValue)")
                            .font(.caption.weight(.semibold).monospaced())
                        Text("\(entry.outcome.rawValue) · \(entry.subjectID)")
                            .font(.caption2.monospaced())
                            .foregroundStyle(.secondary)
                        Text("Read-only: \(entry.isReadOnly ? "yes" : "no") · Local-only: \(entry.localOnly ? "yes" : "no") · Blocked reasons: \(entry.blockedReasonCount)")
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }

                    Spacer(minLength: 0)
                }
                .padding(9)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
                .accessibilityElement(children: .combine)
                .accessibilityLabel("Evidence \(entry.sequence), \(entry.kind.rawValue), \(entry.outcome.rawValue), subject \(entry.subjectID), read-only \(entry.isReadOnly ? "yes" : "no"), local-only \(entry.localOnly ? "yes" : "no"), blocked reasons \(entry.blockedReasonCount).")
            }
        }
    }

    private func laneSymbol(for laneID: String) -> String {
        switch laneID {
        case "seis":
            "sparkles"
        case "seis-cloud":
            "cloud"
        case "seis-code":
            "chevron.left.forwardslash.chevron.right"
        case "seis-design":
            "paintpalette"
        case "seis-data":
            "cylinder"
        default:
            "square.stack.3d.up"
        }
    }
}
