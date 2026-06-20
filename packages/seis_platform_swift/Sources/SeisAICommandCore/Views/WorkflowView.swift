import SeisPlatformKit
import SwiftUI

struct WorkflowView: View {
    let run: SeisAICommandCoreRun

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            SurfaceCard {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Agent workflow")
                        .font(.headline)
                    Text("Qwen-derived multi-agent, workflow-node, provider-router, and metrics ideas are rewritten as local deterministic SEIS state.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 280), spacing: 12)], spacing: 12) {
                ForEach(run.workflow) { node in
                    WorkflowNodeCard(node: node)
                }
            }

            HStack(alignment: .top, spacing: 12) {
                SurfaceCard {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Run metrics")
                            .font(.headline)
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 120), spacing: 10)], spacing: 10) {
                            ForEach(run.metrics) { metric in
                                MetricCard(title: metric.label, value: metric.value, footnote: metric.note)
                            }
                        }
                    }
                }

                SurfaceCard {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Provider readiness")
                            .font(.headline)
                        ForEach(run.providerReadiness) { provider in
                            ProviderReadinessRow(provider: provider)
                        }
                    }
                }
            }
        }
    }
}

private struct WorkflowNodeCard: View {
    let node: SeisAICommandCoreWorkflowNode

    var body: some View {
        SurfaceCard {
            VStack(alignment: .leading, spacing: 8) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text(node.type.uppercased())
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(.secondary)
                        Text(node.title)
                            .font(.headline)
                    }
                    Spacer()
                    StatusPill(label: node.state, kind: statusKind)
                }
                Text(node.detail)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    private var statusKind: StatusPillKind {
        node.state == "Review" || node.state == "Waiting" || node.state == "Blocked" ? .attention : .ready
    }
}

private struct ProviderReadinessRow: View {
    let provider: SeisAICommandCoreProviderReadiness

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack(alignment: .firstTextBaseline) {
                Text(provider.name)
                    .font(.callout.weight(.semibold))
                Spacer()
                StatusPill(label: provider.state, kind: provider.state == "Blocked" ? .attention : .ready)
            }
            Text(provider.boundary)
                .font(.caption)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(10)
        .background(provider.emphasized ? Color.accentColor.opacity(0.08) : Color.secondary.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
    }
}
