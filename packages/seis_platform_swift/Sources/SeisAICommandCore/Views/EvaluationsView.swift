import SeisPlatformKit
import SwiftUI

struct EvaluationsView: View {
    let run: SeisAICommandCoreRun

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            SurfaceCard {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Evaluation score strip")
                            .font(.headline)
                        Text("Composite \(run.compositeScore)/100 across clarity, security, testability, provenance, and privacy.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Gauge(value: Double(run.compositeScore), in: 0...100) {
                        Text("Score")
                    } currentValueLabel: {
                        Text("\(run.compositeScore)")
                    }
                    .gaugeStyle(.accessoryCircularCapacity)
                    .frame(width: 82)
                }
            }

            VStack(spacing: 10) {
                ForEach(run.evaluations) { evaluation in
                    SurfaceCard {
                        ScoreBar(title: evaluation.name, detail: evaluation.note, value: evaluation.score)
                    }
                }
            }
        }
    }
}
