import SeisPlatformKit
import SwiftUI

struct SeisUniversalCommandPaletteView: View {
    let document: SeisUniversalWorkspaceDocument
    @Binding var query: String
    let onCommand: (String) -> Void

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 10) {
                Image(systemName: "command")
                    .foregroundStyle(.secondary)
                TextField("Search commands", text: $query)
                    .textFieldStyle(.plain)
                    .font(.title3)
                Text("⌘K")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
            }
            .padding(16)

            Divider()

            if commands.isEmpty {
                emptyState
            } else {
                List(commands) { command in
                    Button {
                        onCommand(command.id)
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: symbolName(for: command.id))
                                .frame(width: 20)
                                .foregroundStyle(.secondary)
                            VStack(alignment: .leading, spacing: 3) {
                                Text(command.title)
                                    .font(.headline)
                                Text(command.subtitle)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                        }
                        .padding(.vertical, 4)
                    }
                    .buttonStyle(.plain)
                }
            }

            Divider()

            HStack {
                Label("Read-only command surface", systemImage: "lock.shield")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                Text("No tool execution · no external mutation")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(12)
        }
        .frame(minWidth: 560, minHeight: 430)
        .accessibilityLabel("Universal Workspace Command Palette")
    }

    private var commands: [SeisUniversalCommand] {
        SeisUniversalCommandPalette(document: document).workspaceCommands(matching: query)
    }

    private var emptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .font(.largeTitle)
                .foregroundStyle(.secondary)
            Text("No matching commands")
                .font(.headline)
            Text("Try a selection, domain, capability, hierarchy, or inspector command.")
                .font(.callout)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func symbolName(for commandID: String) -> String {
        if commandID.hasPrefix("selection.") { return "scope" }
        if commandID.hasPrefix("inspector.") { return "sidebar.right" }
        if commandID.hasPrefix("hierarchy.") { return "list.bullet.indent" }
        return "circle.grid.2x2"
    }
}
