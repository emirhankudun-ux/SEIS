import SeisPlatformKit
import SwiftUI

struct AgentsView: View {
    @ObservedObject var store: SeisAICommandCoreStore

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            SurfaceCard {
                HStack {
                    Text("Agent runtime queue")
                        .font(.headline)
                    Spacer()
                    Picker("Filter", selection: $store.agentFilter) {
                        Text("All").tag("All")
                        Text("Ready").tag("Ready")
                        Text("Running").tag("Running")
                        Text("Review").tag("Review")
                    }
                    .pickerStyle(.segmented)
                    .frame(width: 340)
                }
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 240), spacing: 12)], spacing: 12) {
                ForEach(store.visibleAgents) { agent in
                    SurfaceCard {
                        VStack(alignment: .leading, spacing: 10) {
                            HStack {
                                Text(agent.name)
                                    .font(.headline)
                                Spacer()
                                StatusPill(label: agent.status, kind: agent.status == "Review" ? .attention : .ready)
                            }
                            Text(agent.lane)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text(agent.role)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                            ProgressView(value: Double(agent.progress), total: 100)
                        }
                    }
                }
            }
        }
    }
}
