import SeisPlatformKit
import SwiftUI

struct SeisAppleNativeShellWorkspaceRouter: View {
    @ObservedObject var demoShellState: SeisDemoNativeShellState
    let repositoryPath: String
    @Binding var activePanel: SeisAppleNativeShellPanel
    @Binding var route: SeisAppleNativeShellRoute

    var body: some View {
        #if os(macOS)
        VStack(spacing: 0) {
            routeBar
            Divider()
            routeContent
        }
        #else
        SeisAppleNativeShellZeroToDemoView(
            demoShellState: demoShellState,
            repositoryPath: repositoryPath,
            activePanel: $activePanel
        )
        #endif
    }

    #if os(macOS)
    private var routeBar: some View {
        HStack(spacing: 10) {
            Label("SEIS", systemImage: "cube.transparent")
                .font(.headline)

            Picker("Workspace", selection: $route) {
                ForEach(SeisAppleNativeShellRoute.allCases, id: \.self) { item in
                    Label(item.title, systemImage: item.symbolName)
                        .tag(item)
                }
            }
            .pickerStyle(.segmented)
            .frame(maxWidth: 660)

            Spacer()

            Label("Read-only foundation", systemImage: "lock.shield")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(.bar)
    }

    @ViewBuilder
    private var routeContent: some View {
        switch route {
        case .demo:
            SeisAppleNativeShellZeroToDemoView(
                demoShellState: demoShellState,
                repositoryPath: repositoryPath,
                activePanel: $activePanel
            )
            .onAppear { activePanel = .demo }

        case .platform:
            SeisAppleNativeShellZeroToDemoView(
                demoShellState: demoShellState,
                repositoryPath: repositoryPath,
                activePanel: $activePanel
            )
            .onAppear { activePanel = .applePlatform }

        case .technologyCenter:
            SeisAppleNativeTechnologyCenterView(repositoryPath: repositoryPath)

        case .universalWorkspace:
            SeisAppleUniversalWorkspaceView(repositoryPath: repositoryPath)
        }
    }
    #endif
}

#if os(macOS)
private struct SeisAppleNativeTechnologyCenterView: View {
    let repositoryPath: String
    @State private var store = SeisFullTechnologyNativeStore()
    @State private var query = ""

    var body: some View {
        NavigationSplitView {
            VStack(spacing: 0) {
                technologyHeader
                Divider()
                technologySidebar
            }
            .navigationSplitViewColumnWidth(min: 250, ideal: 300, max: 380)
        } detail: {
            technologyDetail
        }
        .searchable(text: $query, placement: .sidebar, prompt: "Search domains and capabilities")
        .onChange(of: query) { newValue in
            store.updateQuery(newValue)
        }
        .task { loadIfNeeded() }
    }

    private var technologyHeader: some View {
        VStack(alignment: .leading, spacing: 6) {
            Label("Technology Center", systemImage: "cpu")
                .font(.title3.weight(.semibold))
            Text("Canonical registry · local · read-only")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
    }

    @ViewBuilder
    private var technologySidebar: some View {
        switch store.phase {
        case .idle, .loading:
            ProgressView("Loading canonical registry…")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case .failed:
            failureView
        case .loaded(let explorer):
            if explorer.visibleDomains.isEmpty {
                SeisAppleWorkspaceEmptyState(
                    title: "No matching domains",
                    systemImage: "magnifyingglass",
                    description: "Clear or revise the search query."
                )
            } else {
                List(explorer.visibleDomains, id: \.id) { domain in
                    Button {
                        _ = store.selectDomain(id: domain.id)
                    } label: {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(domain.name)
                                .font(.headline)
                            Text("\(domain.capabilities.count) capabilities")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    @ViewBuilder
    private var technologyDetail: some View {
        if let domain = store.explorerState?.selectedDomain {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    Label(domain.name, systemImage: "square.stack.3d.up")
                        .font(.largeTitle.weight(.semibold))
                    Text(domain.id)
                        .font(.caption.monospaced())
                        .foregroundStyle(.secondary)

                    Divider()

                    Text("Capabilities")
                        .font(.headline)
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 210), spacing: 10)], spacing: 10) {
                        ForEach(domain.capabilities, id: \.self) { capability in
                            HStack {
                                Image(systemName: "circle.grid.2x2")
                                Text(capability)
                                    .font(.callout.monospaced())
                                Spacer()
                            }
                            .padding(12)
                            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10))
                        }
                    }

                    Label("Inspection only — no tool execution or external mutation.", systemImage: "lock.shield")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(24)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        } else {
            SeisAppleWorkspaceEmptyState(
                title: "Select a technology domain",
                systemImage: "cpu",
                description: "The canonical registry remains read-only."
            )
        }
    }

    private var failureView: some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
            Text(store.failure?.title ?? "Technology Center unavailable")
                .font(.headline)
            Text(store.failure?.detail ?? "The canonical registry could not be loaded.")
                .font(.callout)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button("Retry") { load() }
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func loadIfNeeded() {
        if case .idle = store.phase {
            load()
        }
    }

    private func load() {
        store.load(startingAt: URL(fileURLWithPath: repositoryPath, isDirectory: true))
    }
}

private struct SeisAppleUniversalWorkspaceView: View {
    let repositoryPath: String
    @State private var store = SeisFullTechnologyNativeStore()
    @State private var workspaceState: SeisUniversalWorkspaceState?
    @State private var isCommandPalettePresented = false
    @State private var commandQuery = ""

    var body: some View {
        workspaceLayout
            .task { loadIfNeeded() }
            .sheet(isPresented: $isCommandPalettePresented) {
                commandPalette
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
        switch workspaceState?.inspectorDock ?? .trailing {
        case .leading:
            HSplitView {
                inspector
                    .frame(minWidth: 300, idealWidth: 360, maxWidth: 460)
                viewport
                    .frame(minWidth: 520, idealWidth: 760)
            }
        case .trailing:
            HSplitView {
                viewport
                    .frame(minWidth: 520, idealWidth: 760)
                inspector
                    .frame(minWidth: 300, idealWidth: 360, maxWidth: 460)
            }
        case .hidden:
            viewport
        }
    }

    private var viewport: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Label("Universal Viewport", systemImage: "rectangle.inset.filled")
                        .font(.title2.weight(.semibold))
                    Text("Document graph · registry-backed · no renderer claim")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Button {
                    isCommandPalettePresented = true
                } label: {
                    Label("Commands", systemImage: "command")
                }
                .buttonStyle(.bordered)
                .help("Open Command Palette (⌘K)")

                if workspaceState?.inspectorDock == .hidden {
                    Button {
                        apply(commandID: "inspector.trailing")
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

            Divider()

            Group {
                switch store.phase {
                case .idle, .loading:
                    ProgressView("Loading workspace document…")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                case .failed:
                    SeisAppleWorkspaceEmptyState(
                        title: "Viewport unavailable",
                        systemImage: "exclamationmark.triangle",
                        description: store.failure?.detail ?? "The canonical registry could not be loaded."
                    )
                case .loaded:
                    if let document = workspaceState?.document {
                        ScrollView {
                            LazyVGrid(columns: [GridItem(.adaptive(minimum: 250), spacing: 12)], spacing: 12) {
                                ForEach(document.rootNodeIDs, id: \.self) { nodeID in
                                    if let node = document.node(id: nodeID) {
                                        domainCard(node, document: document)
                                    }
                                }
                            }
                            .padding(16)
                        }
                    } else {
                        SeisAppleWorkspaceEmptyState(
                            title: "Workspace document unavailable",
                            systemImage: "doc.questionmark",
                            description: "The validated registry loaded, but the local document graph was not created."
                        )
                    }
                }
            }
        }
    }

    private func domainCard(
        _ node: SeisUniversalWorkspaceNode,
        document: SeisUniversalWorkspaceDocument
    ) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Button {
                select(nodeID: node.id)
            } label: {
                HStack {
                    Image(systemName: "square.stack.3d.up")
                    Text(node.selection.title)
                        .font(.headline)
                    Spacer()
                    if workspaceState?.selectionGraph.selectedNodeID == node.id {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .buttonStyle(.plain)

            FlowLayout(spacing: 6) {
                ForEach(node.childIDs, id: \.self) { childID in
                    if let child = document.node(id: childID) {
                        Button(child.selection.title) {
                            select(nodeID: child.id)
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
            if workspaceState?.selectionGraph.selectedNodeID == node.id {
                RoundedRectangle(cornerRadius: 14)
                    .stroke(.secondary, lineWidth: 1)
            }
        }
    }

    private var inspector: some View {
        let presentation = SeisUniversalInspectorPresentation(
            selection: workspaceState?.selectionGraph.selectedSelection
        )

        return ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                HStack(spacing: 8) {
                    Label("Universal Inspector", systemImage: inspectorSymbolName)
                        .font(.title2.weight(.semibold))

                    Spacer()

                    Button {
                        apply(commandID: "inspector.leading")
                    } label: {
                        Image(systemName: "sidebar.left")
                    }
                    .buttonStyle(.borderless)
                    .help("Dock Inspector Left")

                    Button {
                        apply(commandID: "inspector.trailing")
                    } label: {
                        Image(systemName: "sidebar.right")
                    }
                    .buttonStyle(.borderless)
                    .help("Dock Inspector Right")

                    Button {
                        apply(commandID: "inspector.hidden")
                    } label: {
                        Image(systemName: "xmark")
                    }
                    .buttonStyle(.borderless)
                    .help("Hide Inspector")
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(presentation.title)
                        .font(.headline)
                    Text(presentation.subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                ForEach(presentation.sections) { section in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(section.title.uppercased())
                            .font(.caption2.weight(.semibold))
                            .foregroundStyle(.secondary)

                        ForEach(section.rows) { row in
                            HStack(alignment: .firstTextBaseline) {
                                Text(row.label)
                                    .foregroundStyle(.secondary)
                                Spacer()
                                Text(row.value)
                                    .font(.callout.monospaced())
                                    .multilineTextAlignment(.trailing)
                            }
                        }
                    }
                    .padding(12)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10))
                }

                Label("Mutation disabled", systemImage: "lock.fill")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    private var inspectorSymbolName: String {
        workspaceState?.inspectorDock == .leading ? "sidebar.left" : "sidebar.right"
    }

    private var commandPalette: some View {
        VStack(spacing: 0) {
            HStack(spacing: 10) {
                Image(systemName: "command")
                    .foregroundStyle(.secondary)
                TextField("Search commands", text: $commandQuery)
                    .textFieldStyle(.plain)
                    .font(.title3)
                Text("⌘K")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
            }
            .padding(16)

            Divider()

            if let state = workspaceState {
                let commands = SeisUniversalCommandPalette(document: state.document)
                    .commands(matching: commandQuery)

                if commands.isEmpty {
                    SeisAppleWorkspaceEmptyState(
                        title: "No matching commands",
                        systemImage: "magnifyingglass",
                        description: "Try a domain, capability, or inspector command."
                    )
                } else {
                    List(commands) { command in
                        Button {
                            apply(commandID: command.id)
                            commandQuery = ""
                            isCommandPalettePresented = false
                        } label: {
                            HStack(spacing: 12) {
                                Image(systemName: command.id.hasPrefix("inspector.") ? "sidebar.right" : "scope")
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
            } else {
                SeisAppleWorkspaceEmptyState(
                    title: "Commands unavailable",
                    systemImage: "command",
                    description: "Load the local workspace document before issuing navigation commands."
                )
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
    }

    private func loadIfNeeded() {
        guard case .idle = store.phase else { return }
        store.load(startingAt: URL(fileURLWithPath: repositoryPath, isDirectory: true))
        if let explorer = store.explorerState {
            workspaceState = SeisUniversalWorkspaceState(
                document: SeisUniversalWorkspaceDocument(catalog: explorer.catalog)
            )
        }
    }

    private func select(nodeID: String) {
        apply(commandID: "select:\(nodeID)")
    }

    private func apply(commandID: String) {
        guard var state = workspaceState else { return }
        guard state.apply(commandID: commandID) else { return }
        workspaceState = state
    }
}

private struct SeisAppleWorkspaceEmptyState: View {
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
#endif
