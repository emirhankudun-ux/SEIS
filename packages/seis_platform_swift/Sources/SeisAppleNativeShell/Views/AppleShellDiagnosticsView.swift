import SeisPlatformKit
import SwiftUI

struct AppleShellDiagnosticsView: View {
    let snapshot: SeisAppleContinuationSnapshot
    let runtimeDiagnostics: SeisAppleShellRuntimeDiagnostics

    private let diagnostics = SeisAppleShellDiagnosticsContract.appleNativeShell

    init(
        snapshot: SeisAppleContinuationSnapshot,
        runtimeDiagnostics: SeisAppleShellRuntimeDiagnostics = .current()
    ) {
        self.snapshot = snapshot
        self.runtimeDiagnostics = runtimeDiagnostics
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
        .accessibilityLabel("\(diagnostics.accessibilitySummary) \(runtimeDiagnostics.accessibilitySummary) Active quality gates: \(snapshot.qualityGates.count).")
    }

    private var totalReadyCount: Int {
        diagnostics.readyCount + runtimeDiagnostics.readyCount
    }

    private var totalCheckCount: Int {
        diagnostics.items.count + runtimeDiagnostics.probes.count
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
