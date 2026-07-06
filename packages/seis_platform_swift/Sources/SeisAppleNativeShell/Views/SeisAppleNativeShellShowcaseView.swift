import SwiftUI

struct SeisAppleNativeShellShowcaseView: View {
    @ObservedObject var demoShellState: SeisDemoNativeShellState
    let repositoryPath: String
    @Binding var activePanel: SeisAppleNativeShellPanel

    @State private var showcaseArea: ShowcaseArea = .dashboard
    @State private var scenarioSearchText = ""
    @State private var specialistFilter = "All"
    @State private var routeInput = ""
    @State private var routeHistory: [String] = []

    private let cardColumns = [
        GridItem(.adaptive(minimum: 300), spacing: 12)
    ]

    private enum ShowcaseArea: String, CaseIterable, Identifiable {
        case dashboard
        case scenarios
        case results
        case platform

        var id: String { rawValue }

        var title: String {
            switch self {
            case .dashboard:
                "Dashboard"
            case .scenarios:
                "Scenarios"
            case .results:
                "Results"
            case .platform:
                "Apple Platform"
            }
        }

        var systemImage: String {
            switch self {
            case .dashboard:
                "sparkles"
            case .scenarios:
                "list.bullet.clipboard"
            case .results:
                "chart.xyaxis.line"
            case .platform:
                "desktopcomputer"
            }
        }
    }

    private var specialistFilters: [String] {
        ["All"] + Array(Set(demoShellState.contract.scenarios.map(\.specialist))).sorted()
    }

    private var shortRepositoryPath: String {
        let parts = repositoryPath.split(separator: "/")
        guard !parts.isEmpty else {
            return "Local SEIS workspace"
        }
        return parts.suffix(3).joined(separator: "/")
    }

    private var defaultScenario: SeisDemoNativeShellState.ContractScenario? {
        demoShellState.contract.scenarios.first
    }

    var body: some View {
        #if os(macOS)
        ZStack {
            Color(NSColor.windowBackgroundColor).ignoresSafeArea()

            ScrollView {
                VStack(spacing: 16) {
                    showcaseHeader
                    areaSwitcher

                    VStack(spacing: 14) {
                switch showcaseArea {
                        case .dashboard:
                            dashboardArea
                        case .scenarios:
                            scenariosArea
                        case .results:
                            resultsArea
                        case .platform:
                            platformArea
                        }
                    }
                }
                .padding(18)
            }
        }
        .onAppear {
            syncShowcaseArea()
            if isFreshSession {
                demoShellState.applyRoute("/")
            }
            rememberRoute(demoShellState.routeForDisplay)
        }
        .onChange(of: demoShellState.routeForDisplay) { newRoute in
            rememberRoute(newRoute)
            if newRoute.hasPrefix("/results") {
                showcaseArea = .results
            } else if newRoute == "/demo" || newRoute.hasPrefix("/demo/") {
                showcaseArea = .scenarios
            } else if newRoute == "/" {
                showcaseArea = .dashboard
            }

            if activePanel == .applePlatform {
                activePanel = .demo
            }
        }
        .onChange(of: showcaseArea) { area in
            switch area {
            case .platform:
                activePanel = .applePlatform
            default:
                activePanel = .demo
            }

            if area == .dashboard, demoShellState.routeForDisplay != "/" {
                demoShellState.applyRoute("/")
            }
        }
        .onChange(of: activePanel) { panel in
            if panel == .applePlatform {
                showcaseArea = .platform
            } else if panel == .demo {
                if showcaseArea == .platform {
                    showcaseArea = .dashboard
                }
            }
        }
        #else
        SeisDemoNativeShellView(state: demoShellState)
        #endif
    }

    private var showcaseHeader: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .center, spacing: 14) {
                ZStack {
                    Circle()
                        .fill(.quaternary.opacity(0.4))
                        .frame(width: 46, height: 46)
                    Image(systemName: "sparkles")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundStyle(Color.accentColor)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("SEIS Demo Studio")
                        .font(.title2.weight(.semibold))
                    Text("Instant macOS playground for SEIS specialists, workflows and results")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                if let fallback = demoShellState.fallbackMode {
                    HStack(spacing: 6) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundStyle(.orange)
                        Text("Fallback: \(fallback.title)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                } else {
                    Label("System healthy", systemImage: "checkmark.seal.fill")
                        .font(.caption)
                        .foregroundStyle(.green)
                }
            }

            HStack(spacing: 10) {
                infoBadge(title: "Repo", value: shortRepositoryPath, color: .blue)
                infoBadge(title: "Scenarios", value: "\(demoShellState.contract.scenarios.count)", color: .green)
                infoBadge(title: "Routes", value: "\(demoShellState.supportedRoutes.count)", color: .purple)
                infoBadge(title: "Runs", value: "\(demoShellState.runs.count)", color: .orange)
            }

            Divider()

            HStack(spacing: 10) {
                Button {
                    demoShellState.applyRoute("/")
                    showcaseArea = .dashboard
                } label: {
                    Label("Home", systemImage: "house")
                }
                .buttonStyle(.bordered)

                Button {
                    showcaseArea = .scenarios
                    demoShellState.applyRoute("/demo")
                } label: {
                    Label("Scenarios", systemImage: "list.bullet")
                }
                .buttonStyle(.bordered)

                Button {
                    demoShellState.applyRoute("/results/demo-home")
                    showcaseArea = .results
                } label: {
                    Label("Sample Result", systemImage: "chart.line.uptrend.xyaxis")
                }
                .buttonStyle(.bordered)

                Spacer()

                if let scenario = defaultScenario {
                    Button {
                        activePanel = .demo
                        demoShellState.startScenario(scenario.id)
                        showcaseArea = .results
                    } label: {
                        Label("Run Demo", systemImage: "play.fill")
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
        }
        .padding(14)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
    }

    private var areaSwitcher: some View {
        Picker("Mode", selection: $showcaseArea) {
            ForEach(ShowcaseArea.allCases) { area in
                Label(area.title, systemImage: area.systemImage)
                    .tag(area)
            }
        }
        .pickerStyle(.segmented)
        .controlSize(.small)
    }

    private var dashboardArea: some View {
        LazyVGrid(columns: cardColumns, spacing: 12) {
            dashboardWelcomeCard
            dashboardActiveRunCard
            dashboardQuickScenarioCard
            dashboardRouteCard
            dashboardRecentRunsCard
            dashboardTelemetryCard
            dashboardQuickActionsCard
        }
    }

    private var scenariosArea: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                Text("Scenario Studio")
                    .font(.headline)

                Spacer()

                TextField("Search scenario", text: $scenarioSearchText)
                    .textFieldStyle(.roundedBorder)
                    .frame(width: 240)
            }

            Picker("Specialist", selection: $specialistFilter) {
                ForEach(specialistFilters, id: \.self) { specialist in
                    Text(specialist).tag(specialist)
                }
            }
            .pickerStyle(.menu)
            .frame(width: 160)

            if visibleScenarios.isEmpty {
                Text("No scenario found for current filter.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding(.vertical, 6)
            }

            ForEach(visibleScenarios, id: \.id) { scenario in
                scenarioCard(scenario)
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var resultsArea: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Execution Results")
                .font(.headline)

            if let activeRun = demoShellState.activeRun {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Active run")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    runSummaryCard(activeRun)
                }
            } else {
                Text("No active run. Pick a scenario to produce output.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            if recentRuns.isEmpty {
                Text("No previous runs yet.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Recent")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    ForEach(recentRuns) { run in
                        recentRunRow(run)
                    }
                }
            }
        }
        .padding(12)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var platformArea: some View {
        AppleContinuationWindow()
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var dashboardWelcomeCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Quick Start")
                .font(.headline)
            Text("1) Open scenarios  •  2) Run one  •  3) Review results")
                .font(.caption)
                .foregroundStyle(.secondary)

            if let scenario = defaultScenario {
                Text("Spotlight: \(scenario.title)")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }

            HStack(spacing: 8) {
                Button {
                    showcaseArea = .scenarios
                    demoShellState.applyRoute("/demo")
                } label: {
                    Label("Open Scenarios", systemImage: "list.bullet.rectangle.portrait")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)

                Button {
                    if let scenario = defaultScenario {
                        activePanel = .demo
                        demoShellState.startScenario(scenario.id)
                        showcaseArea = .results
                    }
                } label: {
                    Label("Run Spotlight", systemImage: "play.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .disabled(defaultScenario == nil)
            }

            if let fallback = demoShellState.fallbackMode {
                Text("Contract mode: \(fallback.title)")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                    .lineLimit(2)
            } else {
                Text("Contract mode: active")
                    .font(.caption2)
                    .foregroundStyle(.green)
                    .lineLimit(1)
            }

            if isFreshSession {
                Text("Welcome! This is a clean first-run flow. Everything is local and traceable.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            } else {
                Text("Current route: \(demoShellState.routeForDisplay)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var dashboardActiveRunCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Active Run")
                .font(.headline)

            if let activeRun = demoShellState.activeRun {
                let totalSteps = max(1, activeRunScenarioSteps(for: activeRun).count)
                let completedSteps = activeRunCompletedStepCount(for: activeRun)
                let progress = min(1.0, Double(completedSteps) / Double(totalSteps))

                HStack(spacing: 8) {
                    statusChip(activeRun.status)

                    Text(demoShellState.scenarioById(activeRun.scenarioId)?.title ?? activeRun.scenarioId)
                        .font(.subheadline.weight(.semibold))
                        .lineLimit(1)

                    Spacer()

                    Text(runDurationText(activeRun.durationMs))
                        .font(.caption.monospacedDigit())
                        .foregroundStyle(.secondary)
                }

                if !activeRunScenarioSteps(for: activeRun).isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text("Progress")
                                .font(.caption2)
                                .foregroundStyle(.secondary)

                            Spacer()

                            Text("\(completedSteps)/\(totalSteps)")
                                .font(.caption2.monospacedDigit())
                                .foregroundStyle(.tertiary)
                        }

                        ProgressView(value: progress)
                            .controlSize(.small)
                    }
                }

                Button {
                    demoShellState.applyRoute("/results/\(activeRun.id)")
                    showcaseArea = .results
                } label: {
                    Label("Open Result", systemImage: "doc.text.magnifyingglass")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
            } else {
                Text("No active run. Pick a scenario to start.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(12)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var dashboardQuickScenarioCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Fast Scenario Actions")
                .font(.headline)

            let quickScenarios = Array(demoShellState.contract.scenarios.prefix(4))
            if quickScenarios.isEmpty {
                Text("No scenario available right now.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(quickScenarios, id: \.id) { scenario in
                    HStack(spacing: 8) {
                        Image(systemName: "bolt.fill")
                            .foregroundStyle(.blue)

                        VStack(alignment: .leading, spacing: 1) {
                            Text(scenario.title)
                                .font(.caption)
                                .lineLimit(1)
                            Text(scenario.specialist)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        Button {
                            demoShellState.applyRoute("/demo/\(scenario.id)")
                            showcaseArea = .scenarios
                        } label: {
                            Label("Open", systemImage: "text.book.closed")
                        }
                        .buttonStyle(.bordered)
                        .controlSize(.mini)

                        Button {
                            demoShellState.startScenario(scenario.id)
                            showcaseArea = .results
                        } label: {
                            Label("Run", systemImage: "play.fill")
                        }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.mini)
                    }
                    .padding(8)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
                }
            }

            if demoShellState.contract.scenarios.count > 4 {
                Button {
                    showcaseArea = .scenarios
                } label: {
                    Text("View all scenarios")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var dashboardRouteCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Quick Route")
                .font(.headline)

            HStack(spacing: 8) {
                TextField("Go to route", text: $routeInput)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit {
                        openQuickRoute()
                    }

                Menu {
                    if !routeHistory.isEmpty {
                        Section("Recent") {
                            ForEach(routeHistory, id: \.self) { route in
                                Button(route) {
                                    routeInput = route
                                    openQuickRoute()
                                }
                            }
                        }
                    }

                    Section("Supported") {
                        if demoShellState.supportedRoutes.isEmpty {
                            Text("No routes available")
                                .foregroundStyle(.secondary)
                        } else {
                            ForEach(demoShellState.supportedRoutes, id: \.self) { route in
                                Button(route) {
                                    routeInput = route
                                    openQuickRoute()
                                }
                            }
                        }
                    }
                } label: {
                    Label("Shortcuts", systemImage: "list.bullet")
                        .frame(width: 96)
                }
                .menuStyle(.borderedButton)

                Button {
                    openQuickRoute()
                } label: {
                    Label("Open", systemImage: "arrow.up.right.square")
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.small)
                .disabled(routeInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }

            if let fallback = demoShellState.fallbackMode {
                Text("⚠️ \(fallback.message(for: demoShellState.contract))")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
        }
        .padding(12)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var dashboardQuickActionsCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Tools")
                .font(.headline)

            HStack(spacing: 8) {
                Button {
                    demoShellState.reset(reason: "showcase_toolbar")
                } label: {
                    Label("Reset", systemImage: "arrow.clockwise")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                Button {
                    demoShellState.clearRuns()
                } label: {
                    Label("Clear Runs", systemImage: "trash")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .disabled(demoShellState.runs.isEmpty)

                Button {
                    NotificationCenter.default.post(name: .seisRefreshAppleDiagnostics, object: nil)
                } label: {
                    Label("Refresh", systemImage: "arrow.triangle.2.circlepath")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
            }
            .frame(maxWidth: .infinity)

            if !demoShellState.telemetryEvents.isEmpty {
                Text("Latest telemetry: \(demoShellState.telemetryEvents.first?.eventName ?? "—")")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var dashboardTelemetryCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Recent Telemetry")
                .font(.headline)

            if demoShellState.telemetryEvents.isEmpty {
                Text("No telemetry yet.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            } else {
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(Array(demoShellState.telemetryEvents.prefix(4))) { event in
                        VStack(alignment: .leading, spacing: 2) {
                            HStack(alignment: .center, spacing: 6) {
                                Text(event.eventName)
                                    .font(.caption.weight(.medium))
                                    .lineLimit(1)

                                Spacer()

                                Text(relativeTelemetryTime(for: event.occurredAt))
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }

                            Text(event.route)
                                .font(.caption2.monospacedDigit())
                                .foregroundStyle(.tertiary)
                                .lineLimit(1)

                            Text("source: \(event.source)")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        .padding(8)
                        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
                    }
                }
            }
        }
        .padding(12)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var dashboardRecentRunsCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Recent Runs")
                .font(.headline)

            if recentRuns.isEmpty {
                Text("No runs yet")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(recentRuns.prefix(3)) { run in
                    recentRunRow(run)
                }
            }
        }
        .padding(12)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var visibleScenarios: [SeisDemoNativeShellState.ContractScenario] {
        let query = scenarioSearchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        return demoShellState.contract.scenarios.filter { scenario in
            let specialistMatch = specialistFilter == "All" || scenario.specialist == specialistFilter
            guard !query.isEmpty else { return specialistMatch }
            let haystack = "\(scenario.title) \(scenario.summary) \(scenario.specialist)".lowercased()
            return specialistMatch && haystack.contains(query)
        }
    }

    private var recentRuns: [SeisDemoNativeShellState.DemoRun] {
        demoShellState.runs.values
            .sorted { lhs, rhs in
                let left = runSortDate(lhs)
                let right = runSortDate(rhs)
                if let l = left, let r = right { return l > r }
                if left != nil { return true }
                if right != nil { return false }
                return runSortIdValue(lhs) > runSortIdValue(rhs)
            }
            .prefix(6)
            .map { $0 }
    }

    private var isFreshSession: Bool {
        demoShellState.runs.isEmpty && demoShellState.activeRun == nil && demoShellState.telemetryEvents.isEmpty
    }

    private func runSortDate(_ run: SeisDemoNativeShellState.DemoRun) -> Date? {
        if let parsed = ISO8601DateParser.date(from: run.startedAt) {
            return parsed
        }

        return ISO8601DateParserFallback.date(from: run.startedAt)
    }

    private func runSortIdValue(_ run: SeisDemoNativeShellState.DemoRun) -> Double {
        Double(run.id.replacingOccurrences(of: "run-", with: "")) ?? 0
    }

    private func activeRunScenarioSteps(for run: SeisDemoNativeShellState.DemoRun) -> [String] {
        demoShellState.scenarioById(run.scenarioId)?.steps ?? ["Initialize", "Execute", "Finalize"]
    }

    private func activeRunCompletedStepCount(for run: SeisDemoNativeShellState.DemoRun) -> Int {
        run.steps.filter { $0.state.lowercased() == "success" }.count
    }

    private func scenarioCard(_ scenario: SeisDemoNativeShellState.ContractScenario) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "wand.and.stars")
                    .foregroundStyle(Color.accentColor)
                VStack(alignment: .leading, spacing: 2) {
                    Text(scenario.title)
                        .font(.subheadline.weight(.semibold))
                        .lineLimit(1)
                    Text(scenario.specialist)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                Spacer()
            }

            Text(scenario.summary)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(2)

            HStack(spacing: 8) {
                Button {
                    demoShellState.applyRoute("/demo/\(scenario.id)")
                    showcaseArea = .scenarios
                } label: {
                    Label("Open", systemImage: "text.book.closed")
                }
                .buttonStyle(.bordered)

                Button {
                    demoShellState.startScenario(scenario.id)
                    showcaseArea = .results
                } label: {
                    Label("Run", systemImage: "play.fill")
                }
                .buttonStyle(.borderedProminent)
            }
            .font(.caption)
        }
        .padding(10)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10))
    }

    private func recentRunRow(_ run: SeisDemoNativeShellState.DemoRun) -> some View {
        HStack(spacing: 10) {
            VStack(alignment: .leading, spacing: 2) {
                Text(demoShellState.scenarioById(run.scenarioId)?.title ?? run.scenarioId)
                    .font(.caption2)
                    .lineLimit(1)
                Text(run.id)
                    .font(.caption2.monospacedDigit())
                    .foregroundStyle(.tertiary)
            }

            Spacer()

            statusChip(run.status)

            Text(runDurationText(run.durationMs))
                .font(.caption2.monospacedDigit())
                .foregroundStyle(.secondary)

            Button {
                demoShellState.applyRoute("/results/\(run.id)")
                showcaseArea = .results
            } label: {
                Label("Open", systemImage: "arrow.up.right.square")
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
        }
        .padding(8)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
    }

    private func runSummaryCard(_ run: SeisDemoNativeShellState.DemoRun) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                statusChip(run.status)

                Text(run.scenarioId)
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(1)

                Spacer()

                Text(runDurationText(run.durationMs))
                    .font(.caption.monospacedDigit())
                    .foregroundStyle(.secondary)
            }

            if run.steps.isEmpty {
                Text("No step data yet.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(Array(run.steps.enumerated()), id: \.offset) { _, step in
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                        Text(step.name)
                            .font(.caption)
                    }
                }
            }
        }
        .padding(10)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10))
    }

    private func statusChip(_ status: String) -> some View {
        let normalized = status.lowercased()
        let title: String = normalized == "completed" ? "Done" : normalized == "running" ? "Running" : status
        let tint: Color = normalized == "completed" ? .green : .orange

        return Text(title)
            .font(.caption2)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(tint.opacity(0.2), in: Capsule())
            .foregroundStyle(tint)
    }

    private func infoBadge(title: String, value: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.caption2)
                .foregroundStyle(.secondary)

            Text(value)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(color)
        }
        .padding(8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(color.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
    }

    private func runDurationText(_ ms: Int) -> String {
        if ms < 1000 {
            return "\(ms) ms"
        }
        let seconds = Double(ms) / 1000
        return String(format: "%.2fs", seconds)
    }

    private func relativeTelemetryTime(for value: String) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        if let parsed = ISO8601DateParser.date(from: value) {
            return formatter.localizedString(for: parsed, relativeTo: Date())
        }

        if let parsed = ISO8601DateParserFallback.date(from: value) {
            return formatter.localizedString(for: parsed, relativeTo: Date())
        }

        return "just now"
    }

    private func rememberRoute(_ route: String) {
        let normalized = demoShellState.normalizedRoute(route)
        guard !normalized.isEmpty else { return }

        if let index = routeHistory.firstIndex(of: normalized) {
            routeHistory.remove(at: index)
        }

        routeHistory.insert(normalized, at: 0)

        if routeHistory.count > 8 {
            routeHistory.removeLast(routeHistory.count - 8)
        }
    }

    private func openQuickRoute() {
        let normalized = demoShellState.normalizedRoute(routeInput)
        guard !normalized.isEmpty else { return }

        demoShellState.applyRoute(normalized)
        if normalized.hasPrefix("/") {
            if normalized.hasPrefix("/results") {
                showcaseArea = .results
            } else {
                showcaseArea = .scenarios
            }
        }

        routeInput = ""
    }

    private func syncShowcaseArea() {
        switch demoShellState.routeForDisplay {
        case "/", "/home":
            showcaseArea = .dashboard
        case "/demo":
            showcaseArea = .scenarios
        case let route where route.hasPrefix("/demo/"):
            showcaseArea = .scenarios
        case let route where route.hasPrefix("/results"):
            showcaseArea = .results
        default:
            if activePanel == .applePlatform {
                showcaseArea = .platform
            } else {
                showcaseArea = .dashboard
            }
        }
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
