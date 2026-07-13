import SwiftUI
import SeisPlatformKit

struct SeisPluginInterfaceRoadmapInspectorView: View {
    private let snapshot: SeisPluginInterfaceRoadmapSnapshot
    @State private var selectedLaneID: String
    @State private var selectedYear: String

    init(snapshot: SeisPluginInterfaceRoadmapSnapshot) {
        self.snapshot = snapshot
        _selectedLaneID = State(initialValue: snapshot.interfaces.first?.id ?? "")
        _selectedYear = State(initialValue: snapshot.fiveYearHorizon.first?.year ?? "")
    }

    private var selectedInterface: SeisPluginInterfaceRecord? {
        snapshot.interfaceRecord(for: selectedLaneID)
    }

    private var selectedHorizon: SeisPluginInterfaceYearRecord? {
        snapshot.horizonRecord(for: selectedYear)
    }

    private var selectedCommitment: SeisPluginLaneCommitment? {
        snapshot.commitment(for: selectedLaneID, year: selectedYear)
    }

    private var selectedRoutine: SeisPluginLaneRoutine? {
        snapshot.laneRoutine(for: selectedLaneID)
    }

    private var selectedReadiness: SeisPluginInterfaceReadiness? {
        snapshot.readinessRecord(for: selectedLaneID)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline, spacing: 12) {
                Picker("Lane", selection: $selectedLaneID) {
                    ForEach(snapshot.interfaces, id: \.id) { interface in
                        Text(interface.handle).tag(interface.id)
                    }
                }
                .pickerStyle(.menu)

                Picker("Year", selection: $selectedYear) {
                    ForEach(snapshot.fiveYearHorizon, id: \.year) { year in
                        Text(year.year).tag(year.year)
                    }
                }
                .pickerStyle(.menu)
            }

            if let selectedInterface, let selectedReadiness {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(alignment: .firstTextBaseline) {
                        Text(selectedInterface.title)
                            .font(.headline)
                        Spacer(minLength: 8)
                        Text(selectedInterface.stage)
                            .font(.caption.monospaced())
                            .foregroundStyle(selectedInterface.risk == "high" ? .orange : .secondary)
                    }
                    Text(selectedInterface.purpose)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text("Surface: \(selectedInterface.currentSurface)")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                    Text("Next: \(selectedInterface.nextAction)")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                    Text("Mode: \(selectedReadiness.currentMode) · Review: \(selectedReadiness.nextReview) · \(selectedReadiness.reviewCadence)")
                        .font(.caption2.monospaced())
                        .foregroundStyle(.secondary)
                }
            }

            if let selectedHorizon, let selectedCommitment {
                Divider()
                VStack(alignment: .leading, spacing: 5) {
                    Text("\(selectedHorizon.phase) · \(selectedHorizon.focus)")
                        .font(.caption.weight(.semibold))
                    Text(selectedCommitment.focus)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Text(selectedCommitment.interfaceOutcome)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Text("Validation: \(selectedCommitment.validationGate)")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
            }

            if let selectedRoutine, let selectedReadiness {
                Divider()
                HStack(alignment: .top, spacing: 12) {
                    routineColumn(title: "H1", text: selectedRoutine.h1)
                    routineColumn(title: "H2", text: selectedRoutine.h2)
                }
                HStack(alignment: .top, spacing: 12) {
                    actionColumn(title: "Allowed", icon: "checkmark.circle", actions: selectedReadiness.allowedActions)
                    actionColumn(title: "Blocked", icon: "lock", actions: selectedReadiness.blockedActions)
                }
            }

            Text("Read-only roadmap metadata. No plugin installation, connector authentication, MCP invocation, cloud deployment, or live action is performed.")
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding(.top, 8)
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Plugin interface roadmap inspector. Select one of five named lanes and one of five years to inspect source-backed purpose, development commitment, cadence, readiness, allowed actions, and blocked actions. No live action is performed.")
    }

    private func routineColumn(title: String, text: String) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(title)
                .font(.caption.weight(.semibold))
            Text(text)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func actionColumn(title: String, icon: String, actions: [String]) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Label(title, systemImage: icon)
                .font(.caption.weight(.semibold))
            ForEach(actions, id: \.self) { action in
                Text("- \(action)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
