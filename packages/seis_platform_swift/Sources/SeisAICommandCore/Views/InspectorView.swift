import SwiftUI

struct InspectorView: View {
    @ObservedObject var store: SeisAICommandCoreStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                SurfaceCard {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("Inspector")
                                .font(.headline)
                            Spacer()
                            StatusPill(label: "\(store.run.risk.level) risk", kind: store.run.risk.level == "Low" ? .ready : .attention)
                        }
                        InspectorRow(label: "Run", value: store.run.id)
                        InspectorRow(label: "Trace", value: store.run.traceID)
                        InspectorRow(label: "Mode", value: store.mode.title)
                        InspectorRow(label: "Provider", value: "Disconnected")
                        InspectorRow(label: "Privacy", value: "Local only")
                    }
                }

                SurfaceCard {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Risk controls")
                            .font(.headline)
                        Toggle("Require approval", isOn: $store.approvalRequired)
                        Toggle("Redact secrets", isOn: $store.redactSecrets)
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Autonomy level: \(Int(store.autonomyLevel))")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Slider(value: $store.autonomyLevel, in: 0...3, step: 1)
                        }
                    }
                    .onChange(of: store.approvalRequired) { _ in store.updateRiskControls() }
                    .onChange(of: store.redactSecrets) { _ in store.updateRiskControls() }
                    .onChange(of: store.autonomyLevel) { _ in store.updateRiskControls() }
                }

                SurfaceCard {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Evaluation")
                            .font(.headline)
                        ForEach(store.run.evaluations.prefix(3)) { evaluation in
                            HStack {
                                Text(evaluation.name)
                                Spacer()
                                Text("\(evaluation.score)")
                                    .font(.caption.monospacedDigit().weight(.semibold))
                            }
                            .font(.caption)
                        }
                    }
                }
            }
            .padding(14)
        }
        .background(.thinMaterial)
    }
}

struct InspectorRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.caption.monospaced())
                .multilineTextAlignment(.trailing)
        }
        .font(.caption)
    }
}
