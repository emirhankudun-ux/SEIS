import SeisPlatformKit
import SwiftUI

struct KnowledgeView: View {
    let run: SeisAICommandCoreRun

    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 260), spacing: 12)], spacing: 12) {
            ForEach(run.knowledge) { item in
                SurfaceCard {
                    VStack(alignment: .leading, spacing: 9) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 3) {
                                Text(item.title)
                                    .font(.headline)
                                Text(item.trust)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            StatusPill(label: "\(item.weight)%", kind: .ready)
                        }
                        Text(item.summary)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                        ProgressView(value: Double(item.weight), total: 100)
                    }
                }
            }
        }
    }
}
