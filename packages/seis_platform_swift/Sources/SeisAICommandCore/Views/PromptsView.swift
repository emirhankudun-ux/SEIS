import SeisPlatformKit
import SwiftUI

struct PromptsView: View {
    @ObservedObject var store: SeisAICommandCoreStore

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            SurfaceCard {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Prompt engine")
                        .font(.headline)
                    Picker("Active prompt version", selection: $store.promptVersion) {
                        ForEach(SeisAICommandCoreEngine.promptVersions, id: \.self) { version in
                            Text(version).tag(version)
                        }
                    }
                    .pickerStyle(.segmented)

                    TextEditor(text: $store.promptNotes)
                        .frame(minHeight: 96)
                        .padding(8)
                        .background(.background, in: RoundedRectangle(cornerRadius: 8))
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(.quaternary))

                    Button {
                        store.updatePromptSettings()
                    } label: {
                        Label("Save prompt note", systemImage: "text.badge.checkmark")
                    }
                    .buttonStyle(.borderedProminent)
                }
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 250), spacing: 12)], spacing: 12) {
                PromptVersionCard(version: "seis-command-v0.3", scope: "Repository-safe execution planning", active: store.promptVersion == "seis-command-v0.3")
                PromptVersionCard(version: "seis-review-v0.2", scope: "Design and code review", active: store.promptVersion == "seis-review-v0.2")
                PromptVersionCard(version: "seis-security-v0.1", scope: "Secret, SSH, provider, and deployment safety", active: store.promptVersion == "seis-security-v0.1")
            }
        }
    }
}

struct PromptVersionCard: View {
    let version: String
    let scope: String
    let active: Bool

    var body: some View {
        SurfaceCard {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(version)
                        .font(.headline)
                    Spacer()
                    StatusPill(label: active ? "Active" : "Ready", kind: active ? .ready : .neutral)
                }
                Text(scope)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text("Prompts version SEIS behavior, routing, evaluation, and safety policy. It does not claim model ownership.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
    }
}
