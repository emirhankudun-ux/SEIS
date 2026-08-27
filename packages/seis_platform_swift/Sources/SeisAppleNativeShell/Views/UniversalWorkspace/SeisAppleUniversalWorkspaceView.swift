import SeisPlatformKit
import SwiftUI

struct SeisAppleUniversalWorkspaceView: View {
    let repositoryPath: String

    @State private var store = SeisFullTechnologyNativeStore()
    @State private var workspaceState: SeisUniversalWorkspaceState?
    @State private var isCommandPalettePresented = false
    @State private var commandQuery = ""
    @SceneStorage("seis.universal-workspace.snapshot.v2") private var sceneSnapshotJSON = ""

    var body: some View {
        workspaceLayout
            .task { loadIfNeeded() }
            .onMoveCommand(perform: handleMoveCommand)
            .onExitCommand {
                applyWorkspaceCommand(commandID: "selection.clear")
            }
            .sheet(isPresented: $isCommandPalettePresented) {
                if let state = workspaceState {
                    SeisUniversalCommandPaletteView(
                        document: state.document,
                        query: $commandQuery
                    ) { commandID in
                        applyWorkspaceCommand(commandID: commandID)
                        commandQuery = ""
                        isCommandPalettePresented = false
                    }
                } else {
                    SeisUniversalWorkspaceEmptyState(
                        title: "Commands unavailable",
                        systemImage: "command",
                        description: "Load the local workspace document before issuing navigation commands."
                    )
                    .frame(minWidth: 560, minHeight: 430)
                }
            }
            .background {
                Button("Open Commands") {
                    isCommandPalettePresented = true
                }
                .keyboardShortcut("k", modifiers: .command)
                .frame(width: 0, height: 0)
                .opacity(0)
            }
    }

    @ViewBuilder
    private var workspaceLayout: some View {
        if let state = workspaceState {
            HSplitView {
                if state.isHierarchyVisible {
                    hierarchy(state)
                        .frame(minWidth: 220, idealWidth: 280, maxWidth: 380)
                }

                if state.inspectorDock == .leading {
                    inspector(state)
                        .frame(minWidth: 300, idealWidth: 360, maxWidth: 460)
                }

                viewport(state)
                    .frame(minWidth: 520, idealWidth: 760)

                if state.inspectorDock == .trailing {
                    inspector(state)
                        .frame(minWidth: 300, idealWidth: 360, maxWidth: 460)
                }
            }
        } else {
            loadingSurface
        }
    }

    private func hierarchy(_ state: SeisUniversalWorkspaceState) -> some View {
        SeisUniversalHierarchyView(
            document: state.document,
            selectedNodeIDs: state.selectionGraph.selectedNodeIDs,
            focusedNodeID: state.selectionGraph.focusedNodeID,
            expandedNodeIDs: state.expandedNodeIDs,
            onSelect: select(nodeID:mode:),
            onExpansionChange: setExpanded(nodeID:isExpanded:)
        )
    }

    private func inspector(_ state: SeisUniversalWorkspaceState) -> some View {
        SeisUniversalInspectorView(
            selections: state.selectionGraph.selectedSelections,
            dock: state.inspectorDock,
            onCommand: applyWorkspaceCommand(commandID:)
        )
    }

    private func viewport(_ state: SeisUniversalWorkspaceState) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            viewportHeader(state)
            Divider()
            SeisUniversalBreadcrumbView(
                document: state.document,
                focusedNodeID: state.selectionGraph.focusedNodeID
            ) { nodeID in
                select(nodeID: nodeID, mode: .replace)
            }
            Divider()

            ScrollView {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 250), spacing: 12)], spacing: 12) {
                    ForEach(state.document.rootNodeIDs, id: \.self) { nodeID in
                        if let node = state.document.node(id: nodeID) {
                            domainCard(node, state: state)
                        }
                    }
                }
                .padding(16)
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Universal Viewport")
    }

    private func viewportHeader(_ state: SeisUniversalWorkspaceState) -> some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Label("Universal Viewport", systemImage: "rectangle.inset.filled")
                    .font(.title2.weight(.semibold))
                Text("Document graph · registry-backed · no renderer claim")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            if !state.isHierarchyVisible {
                Button {
                    applyWorkspaceCommand(commandID: "hierarchy.show")
                } label: {
                    Label("Hierarchy", systemImage: "sidebar.left")
                }
                .buttonStyle(.bordered)
            }

            Button {
                isCommandPalettePresented = true
            } label: {
                Label("Commands", systemImage: "command")
            }
            .buttonStyle(.bordered)
            .help("Open Command Palette (⌘K)")

            if state.inspectorDock == .hidden {
                Button {
                    applyWorkspaceCommand(commandID: "inspector.trailing")
                } label: {
                    Label("Inspector", systemImage: "sidebar.right")
                }
                .buttonStyle(.bordered)
            }

            Label("Local only", systemImage: "network.slash")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(16)
    }

    private func domainCard(
        _ node: SeisUniversalWorkspaceNode,
        state: SeisUniversalWorkspaceState
    ) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Button {
                select(nodeID: node.id, mode: .replace)
            } label: {
                HStack {
                    Image(systemName: "square.stack.3d.up")
                    Text(node.selection.title)
                        .font(.headline)
                    Spacer()
                    if state.selectionGraph.selectedNodeIDs.contains(node.id) {
                        Image(systemName: state.selectionGraph.focusedNodeID == node.id ? "scope" : "checkmark.circle")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .buttonStyle(.plain)

            FlowLayout(spacing: 6) {
                ForEach(node.childIDs, id: \.self) { childID in
                    if let child = state.document.node(id: childID) {
                        Button(child.selection.title) {
                            select(nodeID: child.id, mode: .replace)
                        }
                        .buttonStyle(.bordered)
                        .controlSize(.small)
                    }
                }
            }
        }
        .padding(14)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
        .overlay {
            if state.selectionGraph.selectedNodeIDs.contains(node.id) {
                RoundedRectangle(cornerRadius: 14)
                    .stroke(.secondary, lineWidth: 1)
            }
        }
    }

    @ViewBuilder
    private var loadingSurface: some View {
        switch store.phase {
        case .idle, .loading:
            ProgressView("Loading workspace document…")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case .failed:
            SeisUniversalWorkspaceEmptyState(
                title: "Viewport unavailable",
                systemImage: "exclamationmark.triangle",
                description: store.failure?.detail ?? "The canonical registry could not be loaded."
            )
        case .loaded:
            SeisUniversalWorkspaceEmptyState(
                title: "Workspace document unavailable",
                systemImage: "doc.questionmark",
                description: "The validated registry loaded, but the local document graph was not created."
            )
        }
    }

    private func loadIfNeeded() {
        guard case .idle = store.phase else { return }
        store.load(startingAt: URL(fileURLWithPath: repositoryPath, isDirectory: true))

        guard let explorer = store.explorerState else { return }
        let document = SeisUniversalWorkspaceDocument(catalog: explorer.catalog)

        if let snapshot = restoredSnapshot {
            workspaceState = SeisUniversalWorkspaceState(document: document, restoring: snapshot)
        } else {
            workspaceState = SeisUniversalWorkspaceState(document: document)
        }
    }

    private var restoredSnapshot: SeisUniversalWorkspaceSceneSnapshot? {
        guard !sceneSnapshotJSON.isEmpty,
              let data = sceneSnapshotJSON.data(using: .utf8)
        else { return nil }

        return try? JSONDecoder().decode(SeisUniversalWorkspaceSceneSnapshot.self, from: data)
    }

    private func select(nodeID: String, mode: SeisUniversalSelectionMode) {
        guard var state = workspaceState else { return }
        guard state.selectionGraph.select(nodeID: nodeID, mode: mode) else { return }
        commit(state)
    }

    private func setExpanded(nodeID: String, isExpanded: Bool) {
        guard var state = workspaceState else { return }
        guard state.setExpanded(nodeID: nodeID, isExpanded: isExpanded) else { return }
        commit(state)
    }

    private func handleMoveCommand(_ direction: MoveCommandDirection) {
        switch direction {
        case .down:
            applyWorkspaceCommand(commandID: "selection.next")
        case .up:
            applyWorkspaceCommand(commandID: "selection.previous")
        case .right:
            applyWorkspaceCommand(commandID: "hierarchy.expand-focused")
        case .left:
            applyWorkspaceCommand(commandID: "hierarchy.collapse-focused")
        @unknown default:
            break
        }
    }

    private func applyWorkspaceCommand(commandID: String) {
        guard var state = workspaceState else { return }
        guard state.applyWorkspaceCommand(commandID: commandID) else { return }
        commit(state)
    }

    private func commit(_ state: SeisUniversalWorkspaceState) {
        workspaceState = state
        persist(state.snapshot)
    }

    private func persist(_ snapshot: SeisUniversalWorkspaceSceneSnapshot) {
        guard let data = try? JSONEncoder().encode(snapshot),
              let json = String(data: data, encoding: .utf8)
        else { return }
        sceneSnapshotJSON = json
    }
}

private struct SeisUniversalWorkspaceEmptyState: View {
    let title: String
    let systemImage: String
    let description: String

    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: systemImage)
                .font(.largeTitle)
                .foregroundStyle(.secondary)
            Text(title)
                .font(.headline)
            Text(description)
                .font(.callout)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .frame(maxWidth: 420)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

private struct FlowLayout: Layout {
    let spacing: CGFloat

    func sizeThatFits(
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) -> CGSize {
        let width = proposal.width ?? .infinity
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x > 0, x + size.width > width {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }

        return CGSize(width: proposal.width ?? x, height: y + rowHeight)
    }

    func placeSubviews(
        in bounds: CGRect,
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) {
        var x = bounds.minX
        var y = bounds.minY
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x > bounds.minX, x + size.width > bounds.maxX {
                x = bounds.minX
                y += rowHeight + spacing
                rowHeight = 0
            }
            subview.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}
