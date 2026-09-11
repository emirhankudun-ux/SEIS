import SeisPlatformKit
import SwiftUI

struct SeisUniversalSelectionShelfView: View {
    let shelf: SeisUniversalWorkspaceSelectionShelf
    let onSelect: (String) -> Void
    let onTogglePin: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if !shelf.pinnedNodeIDs.isEmpty {
                selectionSection(
                    title: "Pinned",
                    systemImage: "pin.fill",
                    nodeIDs: shelf.pinnedNodeIDs
                )
            }

            if !shelf.recentNodeIDs.isEmpty {
                selectionSection(
                    title: "Recent",
                    systemImage: "clock",
                    nodeIDs: shelf.recentNodeIDs
                )
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, shelf.pinnedNodeIDs.isEmpty && shelf.recentNodeIDs.isEmpty ? 0 : 8)
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Workspace quick selections")
    }

    private func selectionSection(
        title: String,
        systemImage: String,
        nodeIDs: [String]
    ) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Label(title, systemImage: systemImage)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)

            ForEach(nodeIDs, id: \.self) { nodeID in
                if let node = shelf.document.node(id: nodeID) {
                    HStack(spacing: 6) {
                        Button {
                            onSelect(nodeID)
                        } label: {
                            HStack(spacing: 6) {
                                Image(systemName: node.selection.kind == .domain ? "square.stack.3d.up" : "circle.grid.2x2")
                                    .foregroundStyle(.secondary)
                                    .frame(width: 16)
                                Text(node.selection.title)
                                    .lineLimit(1)
                                Spacer(minLength: 4)
                            }
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel("Select \(node.selection.title)")

                        Button {
                            onTogglePin(nodeID)
                        } label: {
                            Image(systemName: shelf.isPinned(nodeID: nodeID) ? "pin.slash" : "pin")
                                .font(.caption)
                        }
                        .buttonStyle(.plain)
                        .foregroundStyle(.secondary)
                        .help(shelf.isPinned(nodeID: nodeID) ? "Unpin" : "Pin")
                        .accessibilityLabel(shelf.isPinned(nodeID: nodeID) ? "Unpin \(node.selection.title)" : "Pin \(node.selection.title)")
                    }
                    .padding(.vertical, 2)
                }
            }
        }
    }
}
