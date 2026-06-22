import SwiftUI
#if os(macOS)
import AppKit
#endif

enum SeisAppleNativeShellPanel: String, CaseIterable, Identifiable {
    case demo
    case applePlatform

    var id: String { rawValue }

    var title: String {
        switch self {
        case .demo:
            "Demo"
        case .applePlatform:
            "Platform"
        }
    }

    var systemImage: String {
        switch self {
        case .demo:
            "sparkles"
        case .applePlatform:
            "desktopcomputer"
        }
    }
}

struct SeisAppleNativeShellRootView: View {
    @ObservedObject var demoShellState: SeisDemoNativeShellState
    let repositoryPath: String
    @Binding var activePanel: SeisAppleNativeShellPanel
    @State private var recentRunsFilter: RecentRunFilter = .all
    @State private var scenarioSearchText = ""
    @State private var specialistFilter = "All"
    @State private var showAllScenarios = false
    @State private var quickRouteInput = ""
    @State private var routeHistory: [String] = []

    private let metricColumns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    private enum RecentRunFilter: String, CaseIterable, Identifiable {
        case all
        case running
        case completed

        var id: String { rawValue }

        var title: String {
            switch self {
            case .all:
                "All"
            case .running:
                "Running"
            case .completed:
                "Completed"
            }
        }

        func matches(_ status: String) -> Bool {
            switch self {
            case .all:
                true
            case .running:
                status == "running"
            case .completed:
                status == "completed"
            }
        }
    }

    var body: some View {
        #if os(macOS)
        ZStack {
            Color(NSColor.windowBackgroundColor)
                .ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    appHeader
                    quickStatsRow

                    HStack(alignment: .top, spacing: 16) {
                        VStack(alignment: .leading, spacing: 14) {
                            quickStartCard
                            activeRunCard
                            quickScenariosCard
                            if !recentRuns.isEmpty {
                                recentRunsCard
                            }
                        }
                        .frame(width: 380)

                        VStack(alignment: .leading, spacing: 12) {
                            panelSwitcher

                            Group {
                                switch activePanel {
                                case .demo:
                                    SeisDemoNativeShellView(state: demoShellState)
                                        .transition(.opacity.combined(with: .move(edge: .trailing)))
                                case .applePlatform:
                                    AppleContinuationWindow()
                                        .transition(.opacity.combined(with: .move(edge: .leading)))
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .topLeading)
                            .padding(12)
                            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
                            .animation(.easeInOut(duration: 0.18), value: activePanel)

                            diagnosticsStrip
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                    }

                    if demoShellState.activeRun == nil {
                        routeHintCard
                    }

                    if !demoShellState.telemetryEvents.isEmpty {
                        telemetryDigestCard
                    }
                }
                .padding(16)
            }
        }
        .onAppear {
            if !specialistFilters.contains(specialistFilter) {
                specialistFilter = "All"
            }

            if isFreshSession {
                demoShellState.applyRoute("/")
            }

            rememberRoute(demoShellState.routeForDisplay)
        }
        .onChange(of: demoShellState.routeForDisplay) { newRoute in
            if newRoute.hasPrefix("/demo") || newRoute.hasPrefix("/results") {
                activePanel = .demo
            }

            rememberRoute(newRoute)
        }
        #else
        SeisDemoNativeShellView(state: demoShellState)
        #endif
    }

    private var quickRouteShortcuts: [String] {
        let supported = demoShellState.supportedRoutes
        let history = routeHistory.filter { !$0.isEmpty }

        let historyOnly = history.filter { !supported.contains($0) }
        return Array(historyOnly.prefix(5)) + supported
    }

    private var specialistFilters: [String] {
        ["All"] + Array(Set(demoShellState.contract.scenarios.map(\.specialist))).sorted()
    }

    private var filteredScenarios: [SeisDemoNativeShellState.ContractScenario] {
        let query = scenarioSearchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        return demoShellState.contract.scenarios.filter { scenario in
            let matchesSpecialist = specialistFilter == "All" || scenario.specialist == specialistFilter
            guard !query.isEmpty else {
                return matchesSpecialist
            }

            let searchableText = "\(scenario.title) \(scenario.summary) \(scenario.specialist)".lowercased()
            return matchesSpecialist && searchableText.contains(query)
        }
    }

    private var visibleScenarios: [SeisDemoNativeShellState.ContractScenario] {
        if showAllScenarios {
            return filteredScenarios
        }

        return Array(filteredScenarios.prefix(4))
    }

    private var appHeader: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .center, spacing: 12) {
                ZStack {
                    Circle()
                        .fill(.quaternary.opacity(0.3))
                        .frame(width: 42, height: 42)

                    Image(systemName: "sparkles")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundStyle(Color.accentColor)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("SEIS Demo Studio")
                        .font(.title2)
                        .fontWeight(.semibold)

                    Text("Fast, premium macOS demo workspace for shared SEIS scenarios")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 4) {
                    Text("Repository")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)

                    Text(shortRepositoryPath)
                        .font(.caption2.monospaced())
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            Divider()

            HStack(spacing: 10) {
                Label("Route: \(demoShellState.routeForDisplay)", systemImage: "link")
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                Spacer()

                if let fallback = demoShellState.fallbackMode {
                    HStack(spacing: 6) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundStyle(.orange)
                        Text("\(fallback.title): \(fallback.message(for: demoShellState.contract))")
                            .font(.caption2)
                            .lineLimit(2)
                            .foregroundStyle(.secondary)
                    }
                } else {
                    Label("System healthy", systemImage: "checkmark.shield.fill")
                        .font(.caption2)
                        .foregroundStyle(.green)
                }
            }
        }
        .padding(14)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
    }

    private var quickStatsRow: some View {
        LazyVGrid(columns: metricColumns, spacing: 12) {
            statsCard(
                title: "Scenarios",
                value: "\(demoShellState.contract.scenarios.count)",
                systemImage: "sparkles",
                tint: .blue
            )

            statsCard(
                title: "Recent Runs",
                value: "\(recentRuns.count)",
                systemImage: "clock.arrow.circlepath",
                tint: .green
            )

            statsCard(
                title: "Completed",
                value: "\(completedRuns.count)",
                systemImage: "checkmark.seal.fill",
                tint: .mint
            )

            statsCard(
                title: "Active",
                value: demoShellState.activeRun == nil ? "0" : "1",
                systemImage: "bolt.circle.fill",
                tint: .orange
            )
        }
    }

    private func statsCard(title: String, value: String, systemImage: String, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .center, spacing: 8) {
                Image(systemName: systemImage)
                    .foregroundStyle(tint)
                Text(title)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Text(value)
                .font(.title3)
                .fontWeight(.semibold)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.secondary.opacity(0.08), lineWidth: 1)
        )
    }

    private var routeHintCard: some View {
        HStack(spacing: 10) {
            Label("Fast paths", systemImage: "arrow.triangle.branch")
                .font(.caption)
                .foregroundStyle(.secondary)

            Spacer()

            Button {
                activePanel = .demo
                demoShellState.applyRoute("/")
            } label: {
                Label("Home", systemImage: "house")
            }
            .buttonStyle(.bordered)
            .controlSize(.small)

            Button {
                activePanel = .demo
                demoShellState.applyRoute("/demo")
            } label: {
                Label("Open Demo", systemImage: "play.circle.fill")
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.small)

            Button {
                activePanel = .applePlatform
            } label: {
                Label("Apple", systemImage: "desktopcomputer")
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var diagnosticsStrip: some View {
        HStack(spacing: 12) {
            DiagnosticsStripItem(title: "Routes", value: "\(demoShellState.supportedRoutes.count)", isPositive: !demoShellState.supportedRoutes.isEmpty)
            DiagnosticsStripItem(title: "Events", value: "\(demoShellState.telemetryEvents.count)", isPositive: true)
            DiagnosticsStripItem(title: "Fallback", value: demoShellState.fallbackMode == nil ? "off" : "on", isPositive: demoShellState.fallbackMode == nil)

            Spacer()

            if activePanel == .applePlatform {
                Button("Refresh Diagnostics") {
                    NotificationCenter.default.post(name: .seisRefreshAppleDiagnostics, object: nil)
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
            }
        }
        .padding(10)
        .frame(maxWidth: .infinity)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var quickStartCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Quick Start")
                .font(.headline)

            if isFreshSession {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Get started in three steps:")
                        .font(.subheadline.weight(.semibold))
                    Text("1) open Demo, 2) choose a scenario, 3) run")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Divider()
                }
            }

            Button {
                activePanel = .demo
                demoShellState.applyRoute("/demo")
            } label: {
                Label("Open Demo", systemImage: "sparkles")
            }
            .buttonStyle(.borderedProminent)

            HStack(spacing: 8) {
                Button {
                    demoShellState.applyRoute("/")
                } label: {
                    Label("Home", systemImage: "house")
                }
                .buttonStyle(.bordered)

                Button {
                    if let firstScenario = demoShellState.contract.scenarios.first {
                        activePanel = .demo
                        demoShellState.startScenario(firstScenario.id)
                    }
                } label: {
                    Label("Run First", systemImage: "bolt.fill")
                }
                .buttonStyle(.bordered)
                .disabled(demoShellState.contract.scenarios.isEmpty)

                Button {
                    activePanel = .applePlatform
                } label: {
                    Label("Diagnostics", systemImage: "chart.bar")
                }
                .buttonStyle(.bordered)
            }

            Divider()

            HStack(spacing: 8) {
                TextField("Go to route", text: $quickRouteInput)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit {
                        applyQuickRoute()
                    }

                Menu {
                    if !routeHistory.isEmpty {
                        Section("Recent routes") {
                            ForEach(routeHistory, id: \.self) { route in
                                Button(route) {
                                    quickRouteInput = route
                                    applyQuickRoute()
                                }
                            }
                        }
                    }

                    Section("Supported routes") {
                        if demoShellState.supportedRoutes.isEmpty {
                            Text("No routes available")
                                .foregroundStyle(.secondary)
                        } else {
                            ForEach(demoShellState.supportedRoutes, id: \.self) { route in
                                Button(route) {
                                    quickRouteInput = route
                                    applyQuickRoute()
                                }
                            }
                        }
                    }
                    .controlSize(.small)
                } label: {
                    Label("Shortcuts", systemImage: "list.bullet")
                        .frame(width: 90)
                }
                .menuStyle(.borderedButton)

                Button {
                    applyQuickRoute()
                } label: {
                    Label("Open", systemImage: "arrow.up.right.square")
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.small)
                .disabled(quickRouteInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var telemetryDigestCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Telemetry")
                .font(.headline)

            if let latest = demoShellState.telemetryEvents.first {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(latest.eventName)
                            .font(.subheadline)
                            .lineLimit(1)

                        Spacer()

                        Text(relativeShortTimeString(from: parseTelemetryDate(latest.occurredAt)))
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }

                    Text(latest.route)
                        .font(.caption2.monospaced())
                        .foregroundStyle(.secondary)

                    if !latest.source.isEmpty {
                        Text("Source: \(latest.source)")
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                }
                .padding(8)
                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
            } else {
                Text("No telemetry yet.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(12)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var activeRunCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Active Run")
                .font(.headline)

            if let activeRun = demoShellState.activeRun {
                let scenarioSteps = activeRunSteps(for: activeRun)
                let totalSteps = max(1, scenarioSteps.count)
                let completedSteps = completedStepCount(for: activeRun)
                let progress = min(1.0, Double(completedSteps) / Double(totalSteps))

                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 8) {
                        Image(systemName: activeRun.status == "completed" ? "checkmark.seal.fill" : "bolt.horizontal.fill")
                            .foregroundStyle(activeRun.status == "completed" ? .green : .orange)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(demoShellState.scenarioById(activeRun.scenarioId)?.title ?? activeRun.scenarioId)
                                .font(.subheadline.weight(.semibold))
                                .lineLimit(1)

                            if let specialist = demoShellState.scenarioById(activeRun.scenarioId)?.specialist {
                                Text("Specialist: \(specialist)")
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                        }

                        Spacer()

                        Text(statusLabel(for: activeRun.status))
                            .font(.caption2)
                            .fontWeight(.semibold)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(statusBackground(for: activeRun.status), in: Capsule())
                    }

                    Text("Duration: \(runDurationText(activeRun.durationMs))")
                        .font(.caption2.monospaced())
                        .foregroundStyle(.secondary)

                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text("Progress")
                                .font(.caption2)
                                .foregroundStyle(.secondary)

                            Spacer()

                            Text("\(completedSteps)/\(totalSteps)")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.tertiary)
                        }

                        ProgressView(value: progress)
                            .controlSize(.small)

                        if !scenarioSteps.isEmpty {
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    ForEach(Array(scenarioSteps.enumerated()), id: \.offset) { index, stepName in
                                        HStack(spacing: 4) {
                                            Text("\(index + 1)")
                                                .font(.caption2.monospacedDigit())
                                                .foregroundStyle(.secondary)

                                            Text(stepName)
                                                .font(.caption2)
                                                .foregroundStyle(index < completedSteps ? .green : .secondary)
                                        }
                                        .padding(.vertical, 4)
                                        .padding(.horizontal, 8)
                                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8))
                                    }
                                }
                                .padding(.top, 2)
                            }
                        }
                    }

                    Button {
                        activePanel = .demo
                        demoShellState.applyRoute("/results/\(activeRun.id)")
                    } label: {
                        Label("Open Result", systemImage: "doc.text.magnifyingglass")
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)

                    if activeRun.status == "running" {
                        HStack {
                            Text("Running...")
                                .font(.caption2)
                                .foregroundStyle(.orange)
                            ProgressView()
                                .controlSize(.small)
                        }
                    }
                }
            } else {
                Text("No active run. Pick a scenario to start.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(12)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var quickScenariosCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Scenarios")
                .font(.headline)

            if demoShellState.contract.scenarios.isEmpty {
                Text("No scenario available in contract.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            } else {
                HStack(spacing: 8) {
                    TextField("Search scenarios", text: $scenarioSearchText)
                        .textFieldStyle(.roundedBorder)

                    Picker("Specialist", selection: $specialistFilter) {
                        ForEach(specialistFilters, id: \.self) { specialist in
                            Text(specialist)
                                .tag(specialist)
                        }
                    }
                    .pickerStyle(.menu)
                }

                ForEach(visibleScenarios, id: \.id) { scenario in
                    scenarioCard(scenario)
                }

                if filteredScenarios.count > 4 {
                    Button {
                        showAllScenarios.toggle()
                    } label: {
                        Label(showAllScenarios ? "Show fewer" : "Show all", systemImage: showAllScenarios ? "chevron.up" : "chevron.down")
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                }

                if filteredScenarios.isEmpty {
                    Text("No scenario matches your query.")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var recentRunsCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .center) {
                Text("Recent Runs")
                    .font(.headline)

                Spacer()

                Picker("Filter", selection: $recentRunsFilter) {
                    ForEach(RecentRunFilter.allCases) { filter in
                        Text(filter.title)
                            .tag(filter)
                    }
                }
                .pickerStyle(.segmented)
                .controlSize(.mini)
                .frame(width: 200)
            }

            ForEach(filteredRecentRuns) { run in
                HStack(spacing: 10) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(run.scenarioId)
                            .font(.caption2)
                            .lineLimit(1)

                        Text(run.id)
                            .font(.caption2.monospaced())
                            .foregroundStyle(.tertiary)
                            .lineLimit(1)
                    }

                    Spacer()

                    Text(runDurationText(run.durationMs))
                        .font(.caption2.monospaced())
                        .foregroundStyle(.secondary)

                    if let startDate = runSortDate(run) {
                        Text(relativeTimeString(from: startDate))
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }

                    Button {
                        activePanel = .demo
                        demoShellState.applyRoute("/results/\(run.id)")
                    } label: {
                        Label("Open", systemImage: "arrow.up.right.square")
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.mini)

                    Button {
                        activePanel = .demo
                        demoShellState.startScenario(run.scenarioId)
                    } label: {
                        Label("Rerun", systemImage: "arrow.clockwise")
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.mini)
                }
                .padding(8)
                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
            }

            if filteredRecentRuns.isEmpty {
                Text("No run matches selected filter.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            HStack {
                Spacer()
                Button {
                    demoShellState.clearRuns()
                } label: {
                    Label("Clear Recent Runs", systemImage: "trash")
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
                .disabled(recentRuns.isEmpty)
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var panelSwitcher: some View {
        Picker("Workspace panel", selection: $activePanel) {
            ForEach(SeisAppleNativeShellPanel.allCases) { panel in
                Label(panel.title, systemImage: panel.systemImage)
                    .tag(panel)
            }
        }
        .pickerStyle(.segmented)
        .controlSize(.small)
    }

    private func scenarioCard(_ scenario: SeisDemoNativeShellState.ContractScenario) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .top, spacing: 6) {
                Image(systemName: "lightbulb")
                    .foregroundStyle(.secondary)
                    .font(.caption)
                    .frame(width: 16)

                VStack(alignment: .leading, spacing: 2) {
                    Text(scenario.title)
                        .font(.caption)
                        .lineLimit(1)

                    Text(scenario.specialist)
                        .font(.caption2)
                        .foregroundStyle(.secondary)

                    Text(scenario.summary)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                        .lineLimit(2)
                }
            }

            HStack(spacing: 8) {
                Button {
                    activePanel = .demo
                    demoShellState.applyRoute("/demo/\(scenario.id)")
                } label: {
                    Label("Open", systemImage: "text.book.closed")
                }
                .buttonStyle(.bordered)
                .controlSize(.small)

                Button {
                    activePanel = .demo
                    demoShellState.startScenario(scenario.id)
                } label: {
                    Label("Run", systemImage: "play.fill")
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.small)
            }
        }
        .padding(10)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10))
    }

    private var shortRepositoryPath: String {
        let fallback = "Local workspace"
        let parts = repositoryPath.split(separator: "/")
        guard !parts.isEmpty else {
            return fallback
        }
        return parts.suffix(3).joined(separator: "/")
    }

    private var isFreshSession: Bool {
        demoShellState.runs.isEmpty && demoShellState.activeRun == nil && demoShellState.telemetryEvents.isEmpty
    }

    private var completedRuns: [SeisDemoNativeShellState.DemoRun] {
        recentRuns.filter { $0.status == "completed" }
    }

    private func activeRunSteps(for run: SeisDemoNativeShellState.DemoRun) -> [String] {
        if let scenario = demoShellState.scenarioById(run.scenarioId) {
            return scenario.steps ?? ["Initialize", "Execute", "Finalize"]
        }
        return ["Initialize", "Execute", "Finalize"]
    }

    private func completedStepCount(for run: SeisDemoNativeShellState.DemoRun) -> Int {
        run.steps.filter { $0.state.lowercased() == "success" }.count
    }

    private var recentRuns: [SeisDemoNativeShellState.DemoRun] {
        Array(demoShellState.runs.values)
            .sorted { lhs, rhs in
                let left = runSortDate(lhs)
                let right = runSortDate(rhs)

                if let leftDate = left, let rightDate = right {
                    return leftDate > rightDate
                }

                if left != nil {
                    return true
                }

                if right != nil {
                    return false
                }

                return runSortIdValue(rhs) > runSortIdValue(lhs)
            }
            .prefix(10)
            .filter { !$0.id.isEmpty }
            .map { $0 }
    }

    private var filteredRecentRuns: [SeisDemoNativeShellState.DemoRun] {
        recentRuns.filter { recentRunsFilter.matches($0.status) }
    }

    private func statusLabel(for status: String) -> String {
        switch status {
        case "completed":
            "Done"
        case "running":
            "Running"
        default:
            status.capitalized
        }
    }

    private func statusBackground(for status: String) -> some ShapeStyle {
        status == "completed" ? AnyShapeStyle(.green.opacity(0.2)) : AnyShapeStyle(.orange.opacity(0.2))
    }

    private func runSortDate(_ run: SeisDemoNativeShellState.DemoRun) -> Date? {
        if let parsed = ISO8601DateParser.date(from: run.startedAt) {
            return parsed
        }

        if let parsedFallback = ISO8601DateParserFallback.date(from: run.startedAt) {
            return parsedFallback
        }

        return nil
    }

    private func runSortIdValue(_ run: SeisDemoNativeShellState.DemoRun) -> Double {
        guard let timestamp = Double(run.id.replacingOccurrences(of: "run-", with: "")) else {
            return 0
        }
        return timestamp
    }

    private func runDurationText(_ ms: Int) -> String {
        if ms < 1000 {
            return "\(ms) ms"
        }
        let seconds = Double(ms) / 1000
        return String(format: "%.2fs", seconds)
    }

    private func applyQuickRoute() {
        let normalized = demoShellState.normalizedRoute(quickRouteInput)
        guard !normalized.isEmpty else {
            return
        }

        demoShellState.applyRoute(normalized)
        if activePanel == .applePlatform {
            activePanel = .demo
        }
        quickRouteInput = ""
    }

    private func rememberRoute(_ route: String) {
        let normalized = demoShellState.normalizedRoute(route)
        guard !normalized.isEmpty else {
            return
        }

        if let matchIndex = routeHistory.firstIndex(of: normalized) {
            routeHistory.remove(at: matchIndex)
        }

        routeHistory.insert(normalized, at: 0)
        if routeHistory.count > 8 {
            routeHistory = Array(routeHistory.prefix(8))
        }
    }

    private func relativeTimeString(from date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        return formatter.localizedString(for: date, relativeTo: Date())
    }

    private func relativeShortTimeString(from date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        formatter.dateTimeStyle = .numeric
        return formatter.localizedString(for: date, relativeTo: Date())
    }

    private func parseTelemetryDate(_ value: String) -> Date {
        if let parsed = ISO8601DateParser.date(from: value) {
            return parsed
        }
        if let parsedFallback = ISO8601DateParserFallback.date(from: value) {
            return parsedFallback
        }
        return Date()
    }
}

private struct DiagnosticsStripItem: View {
    let title: String
    let value: String
    let isPositive: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption2)
                .foregroundStyle(.secondary)

            HStack(spacing: 6) {
                Image(systemName: isPositive ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                    .foregroundStyle(isPositive ? .green : .orange)
                Text(value)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .lineLimit(1)
            }
        }
        .padding(8)
        .frame(maxWidth: .infinity)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
    }
}

private enum ISO8601DateParser {
    static func date(from value: String) -> Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: value)
    }
}

private enum ISO8601DateParserFallback {
    static func date(from value: String) -> Date? {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = .current
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSSXXXXX"
        if let parsed = formatter.date(from: value) {
            return parsed
        }

        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssXXXXX"
        return formatter.date(from: value)
    }
}
