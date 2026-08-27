import AppKit
import SeisPlatformKit
import SwiftUI

struct SeisUniversalHierarchyView: View {
    let document: SeisUniversalWorkspaceDocument
    let selectedNodeIDs: [String]
    let focusedNodeID: String?
    let expandedNodeIDs: [String]
    let onSelect: (String, SeisUniversalSelectionMode) -> Void
    let onExpansionChange: (String, Bool) -> Void

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider()
            List {
                ForEach(document.rootNodeIDs, id: \.self) { rootID in
                    if let node = document.node(id: rootID) {
                        rootRow(node)

                        if expandedNodeIDs.contains(rootID) {
                            ForEach(node.childIDs, id: \.self) { childID in
                                if let child = document.node(id: childID) {
                                    nodeRow(child, level: 1)
                                }
                            }
                        }
                    }
                }
            }
            .listStyle(.sidebar)
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Universal Workspace Hierarchy")
    }

    private var header: some View {
        HStack(spacing: 8) {
            Label("Hierarchy", systemImage: "list.bullet.indent")
                .font(.headline)
            Spacer()
            if !selectedNodeIDs.isEmpty {
                Text("\(selectedNodeIDs.count) selected")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
    }

    private func rootRow(_ node: SeisUniversalWorkspaceNode) -> some View {
        HStack(spacing: 4) {
            Button {
                let isExpanded = expandedNodeIDs.contains(node.id)
                onExpansionChange(node.id, !isExpanded)
            } label: {
                Image(systemName: expandedNodeIDs.contains(node.id) ? "chevron.down" : "chevron.right")
                    .font(.caption.weight(.semibold))
                    .frame(width: 16, height: 20)
            }
            .buttonStyle(.plain)
            .help(expandedNodeIDs.contains(node.id) ? "Collapse" : "Expand")

            selectionButton(node, level: 0)
        }
        .listRowBackground(rowBackground(for: node.id))
    }

    private func nodeRow(_ node: SeisUniversalWorkspaceNode, level: Int) -> some View {
        selectionButton(node, level: level)
            .padding(.leading, CGFloat(level * 20))
            .listRowBackground(rowBackground(for: node.id))
    }

    private func selectionButton(_ node: SeisUniversalWorkspaceNode, level: Int) -> some View {
        Button {
            onSelect(node.id, currentSelectionMode)
        } label: {
            HStack(spacing: 8) {
                Image(systemName: node.selection.kind == .domain ? "square.stack.3d.up" : "circle.grid.2x2")
                    .foregroundStyle(.secondary)
                    .frame(width: 18)
                VStack(alignment: .leading, spacing: 2) {
                    Text(node.selection.title)
                        .lineLimit(1)
                    if level == 0 {
                        Text(node.selection.subtitle)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                }
                Spacer(minLength: 4)
                if focusedNodeID == node.id {
                    Image(systemName: "scope")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .accessibilityLabel("Focused")
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(node.selection.title)
        .accessibilityValue(selectedNodeIDs.contains(node.id) ? "Selected" : "Not selected")
        .help("Command-click to add to the current selection")
    }

    private var currentSelectionMode: SeisUniversalSelectionMode {
        NSEvent.modifierFlags.contains(.command) ? .additive : .replace
    }

    @ViewBuilder
    private func rowBackground(for nodeID: String) -> some View {
        if selectedNodeIDs.contains(nodeID) {
            Color.accentColor.opacity(focusedNodeID == nodeID ? 0.18 : 0.10)
        } else {
            Color.clear
        }
    }
}
