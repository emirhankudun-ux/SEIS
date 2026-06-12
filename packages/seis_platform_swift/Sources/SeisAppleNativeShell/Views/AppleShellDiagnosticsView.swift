import SeisPlatformKit
import SwiftUI

struct AppleShellDiagnosticsView: View {
    let snapshot: SeisAppleContinuationSnapshot

    private let diagnostics = SeisAppleShellDiagnosticsContract.appleNativeShell
    private let persistence = SeisApplePersistenceReadinessContract.coreDataCloudKit
    private let telemetry = SeisAppleShellTelemetryLogger()
    @State private var runtimeDiagnostics: SeisAppleShellRuntimeDiagnostics
    @State private var agentHandoffSnapshot: SeisAGIAgentHandoffSnapshot
    @StateObject private var historyStore: SeisAppleShellDiagnosticsHistoryStore

    init(
        snapshot: SeisAppleContinuationSnapshot,
        runtimeDiagnostics: SeisAppleShellRuntimeDiagnostics = .current(),
        agentHandoffSnapshot: SeisAGIAgentHandoffSnapshot = .current(),
        historyStore: SeisAppleShellDiagnosticsHistoryStore = .appleNative()
    ) {
        self.snapshot = snapshot
        self._runtimeDiagnostics = State(initialValue: runtimeDiagnostics)
        self._agentHandoffSnapshot = State(initialValue: agentHandoffSnapshot)
        self._historyStore = StateObject(wrappedValue: historyStore)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Diagnostics")
                    .font(.headline)
                Spacer()
                Text("\(totalReadyCount)/\(totalCheckCount) ready")
                    .font(.caption.monospacedDigit())
                    .foregroundStyle(.secondary)
                Button {
                    refreshDiagnostics(source: "manual")
                } label: {
                    Label("Refresh Diagnostics", systemImage: "arrow.clockwise")
                        .labelStyle(.iconOnly)
                }
                .buttonStyle(.bordered)
                .help("Refresh Diagnostics")
            }

            VStack(alignment: .leading, spacing: 8) {
                ForEach(diagnostics.items) { item in
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: systemImage(for: item.state))
                            .foregroundStyle(statusColor(for: item.state))
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.title)
                                .font(.subheadline.weight(.semibold))
                            Text(item.evidence)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text(item.qualityGate)
                                .font(.caption2.monospaced())
                                .foregroundStyle(.tertiary)
                        }
                    }
                }
            }

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                Text("Persistence Readiness")
                    .font(.subheadline.weight(.semibold))
                ForEach(persistence.items) { item in
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: systemImage(for: item.state))
                            .foregroundStyle(statusColor(for: item.state))
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.title)
                                .font(.caption.weight(.semibold))
                            Text("\(item.appleFramework) / \(item.symbol)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text(item.evidence)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                            Text(item.qualityGate)
                                .font(.caption2.monospaced())
                                .foregroundStyle(.tertiary)
                        }
                    }
                }

                Text("CloudKit Account States")
                    .font(.caption.weight(.semibold))
                    .padding(.top, 4)
                ForEach(persistence.accountStates) { accountState in
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: systemImage(for: accountState.state))
                            .foregroundStyle(statusColor(for: accountState.state))
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(accountState.title)
                                .font(.caption.weight(.semibold))
                            Text(accountState.accountStatus)
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text(accountState.releaseAction)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                            Text(accountState.qualityGate)
                                .font(.caption2.monospaced())
                                .foregroundStyle(.tertiary)
                        }
                    }
                }

                Text("Core Data Migration Gates")
                    .font(.caption.weight(.semibold))
                    .padding(.top, 4)
                ForEach(persistence.migrationGates) { migration in
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: systemImage(for: migration.state))
                            .foregroundStyle(statusColor(for: migration.state))
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(migration.title)
                                .font(.caption.weight(.semibold))
                            Text(migration.coreDataSurface)
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text(migration.releaseAction)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                            Text(migration.qualityGate)
                                .font(.caption2.monospaced())
                                .foregroundStyle(.tertiary)
                        }
                    }
                }
            }

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Agent Handoff Status")
                        .font(.subheadline.weight(.semibold))
                    Spacer()
                    Text(agentHandoffSnapshot.writerStatusLabel)
                        .font(.caption.monospacedDigit())
                        .foregroundStyle(agentHandoffSnapshot.writerCount == 1 ? Color.secondary : Color.orange)
                }
                Text(agentHandoffSnapshot.statusLabel)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(agentHandoffSnapshot.pluginLaneSummary)
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                ForEach(agentHandoffSnapshot.records) { handoff in
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: systemImage(for: handoff.role))
                            .foregroundStyle(handoff.writeAllowed ? .blue : .secondary)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(handoff.assignmentId)
                                .font(.caption.weight(.semibold))
                            Text("\(handoff.role.rawValue) / \(handoff.pluginLaneId)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text("\(handoff.outputArtifact) / selected \(handoff.selectedContextIds.count) / deferred \(handoff.deferredContextIds.count)")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                            Text(handoff.writeAllowed ? "writer enabled / human approval required" : "review lane / human approval required")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                    }
                }
            }

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                Text("Runtime Probes")
                    .font(.subheadline.weight(.semibold))
                ForEach(runtimeDiagnostics.probes) { probe in
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: systemImage(for: probe.state))
                            .foregroundStyle(statusColor(for: probe.state))
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(probe.title)
                                .font(.caption.weight(.semibold))
                            Text(probe.relativePath)
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text(probe.evidence)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                    }
                }
                Text(runtimeDiagnostics.repositoryRootPath)
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
                    .lineLimit(1)
                Text("\(runtimeDiagnostics.processName) / \(runtimeDiagnostics.operatingSystemVersion)")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                Text("Diagnostics Timeline")
                    .font(.subheadline.weight(.semibold))
                ForEach(historyStore.snapshots) { historySnapshot in
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: historySnapshot.isReady ? "clock.badge.checkmark" : "clock.badge.exclamationmark")
                            .foregroundStyle(historySnapshot.isReady ? .green : .orange)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(historySnapshot.statusLabel)
                                .font(.caption.weight(.semibold))
                            Text("\(historySnapshot.source) / \(historySnapshot.recordedAt)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                            Text("\(historySnapshot.runtimeStatusLabel) / \(historySnapshot.persistenceStatusLabel)")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                            Text(historySnapshot.agentHandoffStatusSummary)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                    }
                }
            }

            Divider()

            VStack(alignment: .leading, spacing: 4) {
                Text("Validation Commands")
                    .font(.subheadline.weight(.semibold))
                ForEach(validationCommands, id: \.self) { command in
                    Text(command)
                        .font(.caption.monospaced())
                        .foregroundStyle(.secondary)
                }
                Text("\(snapshot.qualityGates.count) active Apple quality gates")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
        .accessibilityElement(children: .contain)
        .accessibilityLabel("\(diagnostics.accessibilitySummary) \(persistence.accessibilitySummary) \(runtimeDiagnostics.accessibilitySummary) \(agentHandoffSnapshot.statusLabel). Active quality gates: \(snapshot.qualityGates.count).")
        .onAppear {
            recordDiagnosticsTelemetry(source: "appear")
        }
        .onReceive(NotificationCenter.default.publisher(for: .seisRefreshAppleDiagnostics)) { _ in
            refreshDiagnostics(source: "command")
        }
    }

    private var totalReadyCount: Int {
        diagnostics.readyCount + persistence.readyCount + runtimeDiagnostics.readyCount + (agentHandoffSnapshot.isReady ? 1 : 0)
    }

    private var totalCheckCount: Int {
        diagnostics.items.count + persistence.checkCount + runtimeDiagnostics.probes.count + 1
    }

    private var validationCommands: [String] {
        var seen = Set<String>()
        return (diagnostics.validationCommands + persistence.validationCommands).filter { seen.insert($0).inserted }
    }

    private func systemImage(for state: SeisAppleShellDiagnosticState) -> String {
        switch state {
        case .ready:
            "checkmark.circle.fill"
        case .watch:
            "exclamationmark.triangle.fill"
        }
    }

    private func statusColor(for state: SeisAppleShellDiagnosticState) -> Color {
        switch state {
        case .ready:
            .green
        case .watch:
            .orange
        }
    }

    private func systemImage(for role: SeisAGIAgentRole) -> String {
        switch role {
        case .writer:
            "square.and.pencil"
        case .reviewer:
            "checkmark.seal"
        case .researcher:
            "doc.text.magnifyingglass"
        case .designer:
            "paintpalette"
        }
    }

    private func refreshDiagnostics(source: String) {
        telemetry.record(.diagnosticsRefreshRequested, detail: "source=\(source)")
        runtimeDiagnostics = .current()
        agentHandoffSnapshot = .current()
        recordDiagnosticsTelemetry(source: source)
    }

    private func recordDiagnosticsTelemetry(source: String) {
        let historySnapshot = historyStore.record(
            source: source,
            continuation: snapshot,
            diagnostics: diagnostics,
            persistence: persistence,
            runtime: runtimeDiagnostics,
            agentHandoff: agentHandoffSnapshot
        )
        telemetry.record(
            .diagnosticsRefreshed,
            detail: "source=\(source) ready=\(historySnapshot.readyCount) total=\(historySnapshot.checkCount) activeGates=\(historySnapshot.qualityGateCount)"
        )
        telemetry.record(
            .runtimeProbeSnapshot,
            detail: "source=\(source) ready=\(runtimeDiagnostics.readyCount) total=\(runtimeDiagnostics.probes.count) process=\(runtimeDiagnostics.processName)"
        )
        telemetry.record(
            .persistenceReadinessSnapshot,
            detail: "source=\(source) ready=\(persistence.readyCount) total=\(persistence.checkCount) accountStates=\(persistence.accountStates.count) migrationGates=\(persistence.migrationGates.count)"
        )
        telemetry.record(
            .agentHandoffSnapshot,
            detail: "source=\(source) handoffs=\(agentHandoffSnapshot.records.count) writer=\(agentHandoffSnapshot.writerCount) ready=\(agentHandoffSnapshot.isReady)"
        )
    }
}
