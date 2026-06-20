import SeisPlatformKit
import SwiftUI

struct ContentView: View {
    @ObservedObject var store: SeisAICommandCoreStore

    var body: some View {
        NavigationSplitView {
            SidebarView(store: store)
                .navigationSplitViewColumnWidth(min: 220, ideal: 248, max: 300)
        } detail: {
            HStack(spacing: 0) {
                ScrollView {
                    DetailView(store: store)
                        .padding(18)
                        .frame(maxWidth: .infinity, alignment: .topLeading)
                }

                Divider()

                InspectorView(store: store)
                    .frame(width: 320)
            }
            .navigationTitle(store.selectedSection.title)
            .searchable(text: $store.searchText, prompt: "Search modules, agents, evidence")
            .toolbar {
                ToolbarItemGroup {
                    Picker("Mode", selection: $store.mode) {
                        ForEach(SeisAICommandCoreTaskMode.allCases, id: \.rawValue) { mode in
                            Text(mode.title).tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)
                    .frame(width: 320)
                    .onChange(of: store.mode) { _ in
                        store.generatePlan()
                    }

                    Button {
                        store.generatePlan()
                    } label: {
                        Label("Generate", systemImage: "sparkles")
                    }

                    Button {
                        store.runEvaluation()
                    } label: {
                        Label("Evaluate", systemImage: "gauge.with.dots.needle.67percent")
                    }

                    Button {
                        store.approveRun()
                    } label: {
                        Label("Approve", systemImage: "checkmark.shield")
                    }
                    .disabled(!store.canApprove)
                }
            }
        }
    }
}

struct DetailView: View {
    @ObservedObject var store: SeisAICommandCoreStore

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HeaderView(store: store)

            switch store.selectedSection {
            case .workspace:
                WorkspaceView(store: store)
            case .router:
                RouterView(run: store.run)
            case .agents:
                AgentsView(store: store)
            case .workflow:
                WorkflowView(run: store.run)
            case .prompts:
                PromptsView(store: store)
            case .knowledge:
                KnowledgeView(run: store.run)
            case .evals:
                EvaluationsView(run: store.run)
            case .approvals:
                ApprovalsView(store: store)
            case .audit:
                AuditView(store: store)
            }
        }
    }
}

struct HeaderView: View {
    @ObservedObject var store: SeisAICommandCoreStore

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 14) {
                Image(systemName: store.selectedSection.systemImage)
                    .font(.system(size: 30, weight: .semibold))
                    .foregroundStyle(.tint)
                    .frame(width: 48, height: 48)
                    .background(.quaternary.opacity(0.45), in: RoundedRectangle(cornerRadius: 10))

                VStack(alignment: .leading, spacing: 6) {
                    Text("SEIS AI Command Core")
                        .font(.largeTitle.weight(.bold))
                    Text("A local, deterministic desktop demo for model routing, supervised agents, prompt versions, knowledge evidence, evaluation, approvals, and audit.")
                        .font(.callout)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 6) {
                    Text(store.run.id)
                        .font(.caption.monospaced())
                        .foregroundStyle(.secondary)
                    StatusPill(label: "Local demo mode", kind: .ready)
                    StatusPill(label: "No provider key connected", kind: .neutral)
                }
            }

            HStack(spacing: 10) {
                MetricCard(title: "Route", value: store.run.route.selected.name, footnote: "\(store.run.route.selected.score)% confidence")
                MetricCard(title: "Risk", value: store.run.risk.level, footnote: "\(store.run.risk.score)/100")
                MetricCard(title: "Evaluation", value: "\(store.run.compositeScore)/100", footnote: "Composite")
                MetricCard(title: "Approval", value: store.approved ? "Approved" : "Waiting", footnote: store.approvalRequired ? "Required" : "Optional")
            }
        }
        .padding(16)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
}
