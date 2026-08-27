import SeisPlatformKit
import SwiftUI

struct SeisAppleUniversalWorkspaceView: View {
    let repositoryPath: String

    @State private var store = SeisFullTechnologyNativeStore()
    @State private var workspaceTabs: SeisUniversalWorkspaceTabs?
    @State private var workspaceSearchState: SeisUniversalWorkspaceSearchState?
    @State private var selectionShelf: SeisUniversalWorkspaceSelectionShelf?
    @State private var searchQuery = ""
    @State private var isCommandPalettePresented = false
    @State private var commandQuery = ""
    @FocusState private var isSearchFocused: Bool
    @SceneStorage("seis.universal-workspace.snapshot.v2") private var sceneSnapshotJSON = ""

    private var workspaceSession: SeisUniversalWorkspaceSession? {
        workspaceTabs?.activeTab?.session
    }

    var body: some View {
        workspaceLayout
            .task { loadIfNeeded() }
            .onMoveCommand(perform: handleMoveCommand)
            .onExitCommand {
                if searchQuery.isEmpty {
                    applyWorkspaceCommand(commandID: "selection.clear")
                } else {
                    updateSearchQuery("")
                }
            }
            .focusedSceneValue(
                \.seisUniversalWorkspaceCommandActions,
                focusedCommandActions
            )
            .sheet(isPresented: $isCommandPalettePresented) {
                if let session = workspaceSession {
                    SeisUniversalCommandPaletteView(
                        document: session.state.document,
                        query: $commandQuery
                    ) { commandID in
                        applyWorkspaceCommand(commandID: commandID)
                        commandQuery = ""
                        if commandID != "search.focus" {
                            isCommandPalettePresented = false
                        }
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
    }

    @ViewBuilder
    private var workspaceLayout: some View {
        if let session = workspaceSession {
            VStack(spacing: 0) {
                workspaceTabStrip
                Divider()
                workspaceContent(session)
            }
        } else {
            loadingSurface
        }
    }

    private var workspaceTabStrip: some View {
        HStack(spacing: 8) {
            if let tabs = workspaceTabs {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 4) {
                        ForEach(tabs.tabs) { tab in
                            HStack(spacing: 4) {
                                Button {
                                    activateWorkspaceTab(id: tab.id)
                                } label: {
                                    HStack(spacing: 6) {
                                        Image(systemName: tab.id == tabs.activeTabID ? "rectangle.fill" : "rectangle")
                                            .font(.caption2)
                                        Text(tab.title)
                                            .lineLimit(1)
                                            .frame(maxWidth: 180, alignment: .leading)
                                    }
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 5)
                                }
                                .buttonStyle(.plain)
                                .accessibilityLabel("Workspace tab \(tab.title)")

                                if tabs.tabs.count > 1 {
                                    Button {
                                        closeWorkspaceTab(id: tab.id)
                                    } label: {
                                        Image(systemName: "xmark")
                                            .font(.caption2)
                                    }
                                    .buttonStyle(.plain)
                                    .foregroundStyle(.secondary)
                                    .accessibilityLabel("Close workspace tab \(tab.title)")
                                }
                            }
                            .padding(.horizontal, 4)
                            .background {
                                if tab.id == tabs.activeTabID {
                                    RoundedRectangle(cornerRadius: 7)
                                        .fill(.quaternary)
                                }
                            }
                        }
                    }
                }
            }

            Spacer(minLength: 4)

            Button {
                openWorkspaceTab()
            } label: {
                Image(systemName: "plus")
            }
            .buttonStyle(.plain)
            .help("New Workspace Tab (⌘T)")
            .accessibilityLabel("New workspace tab")
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(.bar)
    }

    private func workspaceContent(_ session: SeisUniversalWorkspaceSession) -> some View {
        let state = session.state

        return HSplitView {
            if state.isHierarchyVisible {
                hierarchy(state)
                    .frame(minWidth: 220, idealWidth: 280, maxWidth: 380)
            }

            if state.inspectorDock == .leading {
                inspector(state)
                    .frame(minWidth: 300, idealWidth: 360, maxWidth: 460)
            }

            viewport(session)
                .frame(minWidth: 520, idealWidth: 760)

            if state.inspectorDock == .trailing {
                inspector(state)
                    .frame(minWidth: 300, idealWidth: 360, maxWidth: 460)
            }
        }
    }

    private func hierarchy(_ state: SeisUniversalWorkspaceState) -> some View {
        VStack(spacing: 0) {
            selectionShelfView
            if hasSelectionShelfContent {
                Divider()
            }
            SeisUniversalHierarchyView(
                document: state.document,
                projection: searchProjection(for: state),
                selectedNodeIDs: state.selectionGraph.selectedNodeIDs,
                focusedNodeID: state.selectionGraph.focusedNodeID,
                expandedNodeIDs: state.expandedNodeIDs,
                onSelect: select(nodeID:mode:),
                onExpansionChange: setExpanded(nodeID:isExpanded:)
            )
        }
    }

    @ViewBuilder
    private var selectionShelfView: some View {
        if let shelf = selectionShelf {
            SeisUniversalSelectionShelfView(
                shelf: shelf,
                onSelect: { nodeID in
                    select(nodeID: nodeID, mode: .replace)
                },
                onTogglePin: togglePinnedSelection(nodeID:)
            )
        }
    }

    private var hasSelectionShelfContent: Bool {
        guard let shelf = selectionShelf else { return false }
        return !shelf.pinnedNodeIDs.isEmpty || !shelf.recentNodeIDs.isEmpty
    }

    private func inspector(_ state: SeisUniversalWorkspaceState) -> some View {
        SeisUniversalInspectorView(
            selections: state.selectionGraph.selectedSelections,
            dock: state.inspectorDock,
            onCommand: applyWorkspaceCommand(commandID:)
        )
    }

    private func viewport(_ session: SeisUniversalWorkspaceSession) -> some View {
        let state = session.state
        let projection = searchProjection(for: state)

        return VStack(alignment: .leading, spacing: 0) {
            viewportHeader(session)
            Divider()
            SeisUniversalBreadcrumbView(
                document: state.document,
                focusedNodeID: state.selectionGraph.focusedNodeID
            ) { nodeID in
                select(nodeID: nodeID, mode: .replace)
            }
            Divider()

            if projection.isFiltering && projection.rootNodeIDs.isEmpty {
                SeisUniversalWorkspaceEmptyState(
                    title: "No workspace matches",
                    systemImage: "line.3.horizontal.decrease.circle",
                    description: "Adjust the filter to restore matching domains and capabilities."
                )
            } else {
                ScrollView {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 250), spacing: 12)], spacing: 12) {
                        ForEach(projection.rootNodeIDs, id: \.self) { nodeID in
                            if let node = state.document.node(id: nodeID) {
                                domainCard(
                                    node,
                                    visibleChildNodeIDs: projection.childNodeIDs(for: nodeID),
                                    state: state
                                )
                            }
                        }
                    }
                    .padding(16)
                }
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Universal Viewport")
    }

    private func viewportHeader(_ session: SeisUniversalWorkspaceSession) -> some View {
        let state = session.state
        let isFocusedSelectionHidden = isFocusedSelectionHiddenByFilter(state)

        return HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Label("Universal Viewport", systemImage: "rectangle.inset.filled")
                    .font(.title2.weight(.semibold))
                Text("Document graph · registry-backed · no renderer claim")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                if isFocusedSelectionHidden {
                    Label("Current selection is hidden by filter", systemImage: "eye.slash")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .accessibilityLabel("Current selection is hidden by the workspace filter")
                }
            }

            Spacer()

            HStack(spacing: 6) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(.secondary)
                TextField("Filter workspace", text: $searchQuery)
                    .textFieldStyle(.plain)
                    .focused($isSearchFocused)
                    .onChange(of: searchQuery) { newValue in
                        storeSearchQuery(newValue)
                    }
                if !searchQuery.isEmpty {
                    Button {
                        updateSearchQuery("")
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(.secondary)
                    .accessibilityLabel("Clear workspace filter")
                }
            }
            .padding(.horizontal, 9)
            .padding(.vertical, 6)
            .frame(width: 230)
            .background(.quaternary.opacity(0.7), in: RoundedRectangle(cornerRadius: 8))
            .help("Find in Workspace (⌘F)")

            HStack(spacing: 4) {
                Button {
                    applyWorkspaceCommand(commandID: "navigation.back")
                } label: {
                    Image(systemName: "chevron.backward")
                }
                .disabled(!session.canNavigateBack)
                .help("Back (⌘[)")
                .accessibilityLabel("Back through selection history")

                Button {
                    applyWorkspaceCommand(commandID: "navigation.forward")
                } label: {
                    Image(systemName: "chevron.forward")
                }
                .disabled(!session.canNavigateForward)
                .help("Forward (⌘])")
                .accessibilityLabel("Forward through selection history")
            }
            .buttonStyle(.bordered)
            .controlSize(.small)

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
        visibleChildNodeIDs: [String],
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
                ForEach(visibleChildNodeIDs, id: \.self) { childID in
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

    private var focusedCommandActions: SeisUniversalWorkspaceCommandActions {
        SeisUniversalWorkspaceCommandActions(
            canNavigateBack: workspaceSession?.canNavigateBack ?? false,
            canNavigateForward: workspaceSession?.canNavigateForward ?? false,
            hasSelection: !(workspaceSession?.state.selectionGraph.selectedNodeIDs.isEmpty ?? true),
            canCloseTab: (workspaceTabs?.tabs.count ?? 0) > 1,
            navigateBack: {
                applyWorkspaceCommand(commandID: "navigation.back")
            },
            navigateForward: {
                applyWorkspaceCommand(commandID: "navigation.forward")
            },
            clearSelection: {
                applyWorkspaceCommand(commandID: "selection.clear")
            },
            focusSearch: {
                focusWorkspaceSearch()
            },
            openCommandPalette: {
                isCommandPalettePresented = true
            },
            newTab: {
                openWorkspaceTab()
            },
            closeTab: {
                if let activeTabID = workspaceTabs?.activeTabID {
                    closeWorkspaceTab(id: activeTabID)
                }
            },
            nextTab: {
                activateNextWorkspaceTab()
            },
            previousTab: {
                activatePreviousWorkspaceTab()
            }
        )
    }

    private func loadIfNeeded() {
        guard case .idle = store.phase else { return }
        store.load(startingAt: URL(fileURLWithPath: repositoryPath, isDirectory: true))

        guard let explorer = store.explorerState else { return }
        let document = SeisUniversalWorkspaceDocument(catalog: explorer.catalog)
        let state: SeisUniversalWorkspaceState

        if let snapshot = restoredSnapshot {
            state = SeisUniversalWorkspaceState(document: document, restoring: snapshot)
        } else {
            state = SeisUniversalWorkspaceState(document: document)
        }

        let initialSession = SeisUniversalWorkspaceSession(state: state)
        let initialTab = SeisUniversalWorkspaceTab(session: initialSession)
        workspaceTabs = SeisUniversalWorkspaceTabs(
            tabs: [initialTab],
            activeTabID: initialTab.id
        )
        selectionShelf = SeisUniversalWorkspaceSelectionShelf(document: document)
        synchronizeFromActiveTab()
    }

    private var restoredSnapshot: SeisUniversalWorkspaceSceneSnapshot? {
        guard !sceneSnapshotJSON.isEmpty,
              let data = sceneSnapshotJSON.data(using: .utf8)
        else { return nil }

        return try? JSONDecoder().decode(SeisUniversalWorkspaceSceneSnapshot.self, from: data)
    }

    private func searchProjection(for state: SeisUniversalWorkspaceState) -> SeisUniversalHierarchyProjection {
        workspaceSearchState?.projection
            ?? state.document.hierarchyProjection(
                expandedNodeIDs: state.expandedNodeIDs,
                query: searchQuery
            )
    }

    private func isFocusedSelectionHiddenByFilter(_ state: SeisUniversalWorkspaceState) -> Bool {
        guard workspaceSearchState?.isFiltering == true,
              let focusedNodeID = state.selectionGraph.focusedNodeID
        else {
            return false
        }

        return workspaceSearchState?.contains(nodeID: focusedNodeID) == false
    }

    private func focusWorkspaceSearch() {
        isCommandPalettePresented = false
        Task { @MainActor in
            isSearchFocused = true
        }
    }

    private func updateSearchQuery(_ query: String) {
        searchQuery = query
        storeSearchQuery(query)
    }

    private func storeSearchQuery(_ query: String) {
        guard var tabs = workspaceTabs else { return }
        tabs.updateActiveSearchQuery(query)
        workspaceTabs = tabs
        updateSearchProjection(query)
    }

    private func updateSearchProjection(_ query: String) {
        guard let state = workspaceSession?.state else { return }
        var searchState = workspaceSearchState
            ?? SeisUniversalWorkspaceSearchState(
                document: state.document,
                expandedNodeIDs: state.expandedNodeIDs
            )
        searchState.updateQuery(query, expandedNodeIDs: state.expandedNodeIDs)
        workspaceSearchState = searchState
    }

    private func select(nodeID: String, mode: SeisUniversalSelectionMode) {
        guard var session = workspaceSession else { return }
        guard session.select(nodeID: nodeID, mode: mode) else { return }
        commit(session)
    }

    private func setExpanded(nodeID: String, isExpanded: Bool) {
        guard var session = workspaceSession else { return }
        guard session.setExpanded(nodeID: nodeID, isExpanded: isExpanded) else { return }
        commit(session)
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
        switch commandID {
        case "search.focus":
            focusWorkspaceSearch()
            return
        case "search.clear":
            updateSearchQuery("")
            return
        default:
            break
        }

        guard var session = workspaceSession else { return }
        let visibleNodeIDs = workspaceSearchState?.isFiltering == true
            ? workspaceSearchState?.visibleNodeIDs
            : nil
        guard session.applyWorkspaceCommand(
            commandID: commandID,
            visibleNodeIDs: visibleNodeIDs
        ) else { return }
        commit(session)
    }

    private func commit(_ session: SeisUniversalWorkspaceSession) {
        guard var tabs = workspaceTabs else { return }
        guard tabs.updateActiveSession({ activeSession in
            activeSession = session
            return true
        }) else { return }
        workspaceTabs = tabs
        recordShelfSelection(from: session)
        updateSearchProjection(searchQuery)
        persist(session.state.snapshot)
    }

    private func recordShelfSelection(from session: SeisUniversalWorkspaceSession) {
        guard let focusedNodeID = session.state.selectionGraph.focusedNodeID else { return }
        recordShelfSelection(nodeID: focusedNodeID)
    }

    private func recordShelfSelection(nodeID: String) {
        guard var shelf = selectionShelf,
              shelf.recordSelection(nodeID: nodeID)
        else { return }
        selectionShelf = shelf
    }

    private func togglePinnedSelection(nodeID: String) {
        guard var shelf = selectionShelf,
              shelf.togglePin(nodeID: nodeID)
        else { return }
        selectionShelf = shelf
    }

    private func openWorkspaceTab() {
        guard let document = workspaceSession?.state.document,
              var tabs = workspaceTabs
        else { return }

        _ = tabs.openTab(document: document)
        workspaceTabs = tabs
        synchronizeFromActiveTab()
    }

    private func closeWorkspaceTab(id: String) {
        guard var tabs = workspaceTabs,
              tabs.closeTab(id: id)
        else { return }

        workspaceTabs = tabs
        synchronizeFromActiveTab()
    }

    private func activateWorkspaceTab(id: String) {
        guard var tabs = workspaceTabs,
              tabs.activateTab(id: id)
        else { return }

        workspaceTabs = tabs
        synchronizeFromActiveTab()
    }

    private func activateNextWorkspaceTab() {
        guard var tabs = workspaceTabs,
              tabs.activateNextTab()
        else { return }

        workspaceTabs = tabs
        synchronizeFromActiveTab()
    }

    private func activatePreviousWorkspaceTab() {
        guard var tabs = workspaceTabs,
              tabs.activatePreviousTab()
        else { return }

        workspaceTabs = tabs
        synchronizeFromActiveTab()
    }

    private func synchronizeFromActiveTab() {
        guard let tab = workspaceTabs?.activeTab else {
            workspaceSearchState = nil
            searchQuery = ""
            return
        }

        searchQuery = tab.searchQuery
        workspaceSearchState = SeisUniversalWorkspaceSearchState(
            document: tab.session.state.document,
            expandedNodeIDs: tab.session.state.expandedNodeIDs
        )
        updateSearchProjection(tab.searchQuery)
        persist(tab.session.state.snapshot)
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
