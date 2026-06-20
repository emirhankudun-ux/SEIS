import SeisPlatformKit
import SwiftUI

struct RouterView: View {
    let run: SeisAICommandCoreRun

    var body: some View {
        SurfaceCard {
            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Selected profile")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(run.route.selected.name)
                            .font(.title2.weight(.semibold))
                        Text(run.route.rationale)
                            .font(.callout)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    StatusPill(label: "\(run.route.selected.score)%", kind: .ready)
                }

                ForEach(run.route.candidates) { candidate in
                    ScoreBar(title: candidate.name, detail: candidate.summary, value: candidate.score)
                }
            }
        }
    }
}
