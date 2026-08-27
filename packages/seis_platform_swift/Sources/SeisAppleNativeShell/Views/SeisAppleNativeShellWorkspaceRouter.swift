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
#endif
