import SeisPlatformKit
import SwiftUI

struct SeisFullTechnologyRootView: View {
    @ObservedObject var model: SeisFullTechnologyMacViewModel

    var body: some View {
        NavigationSplitView {
            VStack(spacing: 0) {
                identityHeader
                Divider()
                sidebarContent
            }
            .navigationSplitViewColumnWidth(min: 260, ideal: 310, max: 380)
        } detail: {
            detailContent
        }
        .searchable(
            text: Binding(
                get: { model.query },
                set: { model.updateQuery($0) }
            ),
            placement: .sidebar,
            prompt: Text("Search domains and capabilities")
        )
        .task {
            if case .idle = model.store.phase {
                model.load()
            }
        }
        .frame(minWidth: 900, minHeight: 600)
    }

    private var identityHeader: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Read-only native inspection", systemImage: "cube.transparent")
                .font(.headline)
            Text("SEIS-GOAL-021")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)
            Text(goalBindingLabel)
                .font(.caption)
                .foregroundStyle(.orange)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
    }

    private var goalBindingLabel: String {
        guard let status = model.explorerState?.catalog.registry.canonicalGoalBinding.status else {
            return "Canonical binding unresolved"
        }

        switch status {
        case .unresolved:
            return "Canonical binding unresolved"
        case .resolved:
            return "Canonical binding resolved"
        case .mapped:
            return "Canonical binding mapped"
        }
    }

    @ViewBuilder
    private var sidebarContent: some View {
        switch model.store.phase {
        case .idle:
            statusView(
                symbol: "tray",
                title: "Registry not loaded",
                detail: "Load the canonical local registry to begin inspection.",
                actionTitle: "Load",
                action: model.load
            )
        case .loading:
            ProgressView("Loading canonical registry…")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case .loaded(let explorerState):
            if explorerState.visibleDomains.isEmpty {
                statusView(
                    symbol: "magnifyingglass",
                    title: "No matching domains",
                    detail: "Clear or revise the search query.",
                    actionTitle: "Clear Search",
                    action: { model.updateQuery("") }
                )
            } else {
                SeisFullTechnologySidebarView(
                    explorer: explorerState,
                    onSelect: model.selectDomain
                )
            }
        case .failed:
            if let failure = model.failure {
                statusView(
                    symbol: "exclamationmark.triangle",
                    title: failure.title,
                    detail: "\(failure.detail) \(failure.recovery)",
                    actionTitle: "Retry",
                    action: model.load
                )
            }
        }
    }

    @ViewBuilder
    private var detailContent: some View {
        if let explorer = model.explorerState,
           let selectedDomain = explorer.selectedDomain {
            SeisFullTechnologyDetailView(
                domain: selectedDomain,
                registry: explorer.catalog.registry
            )
        } else {
            VStack(spacing: 12) {
                Image(systemName: "cube")
                    .font(.system(size: 42, weight: .light))
                    .foregroundStyle(.secondary)
                Text("Select a technology domain")
                    .font(.title2.weight(.semibold))
                Text("No matching domains are selected for inspection.")
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }

    private func statusView(
        symbol: String,
        title: String,
        detail: String,
        actionTitle: String,
        action: @escaping () -> Void
    ) -> some View {
        VStack(spacing: 14) {
            Image(systemName: symbol)
                .font(.system(size: 34, weight: .light))
                .foregroundStyle(.secondary)
            Text(title)
                .font(.headline)
            Text(detail)
                .font(.callout)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button(actionTitle, action: action)
                .buttonStyle(.borderedProminent)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
