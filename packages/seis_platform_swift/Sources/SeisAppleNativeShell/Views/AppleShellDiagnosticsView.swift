import SeisPlatformKit
import SwiftUI

struct AppleShellDiagnosticsView: View {
    let snapshot: SeisAppleContinuationSnapshot

    private let diagnostics = SeisAppleShellDiagnosticsContract.appleNativeShell

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Diagnostics")
                    .font(.headline)
                Spacer()
                Text("\(diagnostics.readyCount)/\(diagnostics.items.count) ready")
                    .font(.caption.monospacedDigit())
                    .foregroundStyle(.secondary)
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

            VStack(alignment: .leading, spacing: 4) {
                Text("Validation Commands")
                    .font(.subheadline.weight(.semibold))
                ForEach(diagnostics.validationCommands, id: \.self) { command in
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
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(diagnostics.accessibilitySummary) Active quality gates: \(snapshot.qualityGates.count).")
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
}
