import SeisPlatformKit
import SwiftUI

struct SeisUniversalBreadcrumbView: View {
    let document: SeisUniversalWorkspaceDocument
    let focusedNodeID: String?
    let onSelect: (String) -> Void

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: "point.3.connected.trianglepath.dotted")
                .foregroundStyle(.secondary)
                .accessibilityHidden(true)

            if breadcrumbNodeIDs.isEmpty {
                Text("No selection")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(Array(breadcrumbNodeIDs.enumerated()), id: \.element) { index, nodeID in
                    if index > 0 {
                        Image(systemName: "chevron.right")
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                            .accessibilityHidden(true)
                    }

                    if let node = document.node(id: nodeID) {
                        Button(node.selection.title) {
                            onSelect(nodeID)
                        }
                        .buttonStyle(.plain)
                        .font(.caption.weight(nodeID == focusedNodeID ? .semibold : .regular))
                        .foregroundStyle(nodeID == focusedNodeID ? .primary : .secondary)
                        .accessibilityLabel("Select \(node.selection.title)")
                    }
                }
            }

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(.bar)
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Selection breadcrumb")
    }

    private var breadcrumbNodeIDs: [String] {
        guard let focusedNodeID else { return [] }
        return document.breadcrumbNodeIDs(for: focusedNodeID)
    }
}
