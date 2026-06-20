import SeisPlatformKit
import SwiftUI

struct WorkspaceView: View {
    @ObservedObject var store: SeisAICommandCoreStore

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            SurfaceCard {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Prompt")
                        .font(.headline)
                    TextEditor(text: $store.prompt)
                        .font(.body)
                        .frame(minHeight: 132)
                        .padding(8)
                        .background(.background, in: RoundedRectangle(cornerRadius: 8))
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(.quaternary)
                        )

                    HStack {
                        Button {
                            store.generatePlan()
                        } label: {
                            Label("Generate plan", systemImage: "sparkles")
                        }
                        .buttonStyle(.borderedProminent)

                        Button {
                            store.runEvaluation()
                        } label: {
                            Label("Run evaluation", systemImage: "gauge.with.dots.needle.67percent")
                        }
                        .buttonStyle(.bordered)

                        Button("Reset") {
                            store.reset()
                        }
                        .buttonStyle(.bordered)

                        Spacer()
                    }
                }
            }

            SurfaceCard {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Generated plan")
                            .font(.headline)
                        Spacer()
                        StatusPill(label: "Composite \(store.run.compositeScore)/100", kind: .ready)
                    }

                    ForEach(Array(store.run.steps.enumerated()), id: \.element.id) { index, step in
                        PlanStepRow(index: index + 1, step: step)
                    }
                }
            }
        }
    }
}

struct PlanStepRow: View {
    let index: Int
    let step: SeisAICommandCorePlanStep

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Text(String(format: "%02d", index))
                .font(.caption.monospacedDigit().weight(.bold))
                .foregroundStyle(.tint)
                .frame(width: 34, height: 28)
                .background(.tint.opacity(0.12), in: RoundedRectangle(cornerRadius: 7))

            VStack(alignment: .leading, spacing: 4) {
                Text(step.title)
                    .font(.callout.weight(.semibold))
                Text(step.detail)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding(10)
        .background(.background.opacity(0.6), in: RoundedRectangle(cornerRadius: 8))
    }
}
