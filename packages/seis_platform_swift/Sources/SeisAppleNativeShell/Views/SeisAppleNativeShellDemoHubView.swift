import Foundation
import SwiftUI
#if os(macOS)
import AppKit
#endif

struct SeisAppleNativeShellDemoHubView: View {
    @ObservedObject var demoShellState: SeisDemoNativeShellState
    let repositoryPath: String
    @Binding var activePanel: SeisAppleNativeShellPanel
    @AppStorage("seisDemoWelcomeBannerDismissed") private var didDismissWelcomeBanner = false

    @State private var selectedSpecialist = "Tüm Uzmanlar"
    @State private var scenarioSearchText = ""
    @State private var quickRoute = ""
    @State private var selectedScenarioId: String?
    @State private var routeHistory: [String] = []
    @State private var recentRunFilter: RecentRunFilter = .all
    @State private var showAllScenarios = false
    @State private var quickRouteValidationMessage: String?
    @State private var copiedScenarioId: String?

    private enum RecentRunFilter: String, CaseIterable, Identifiable {
        case all
        case running
        case completed

        var id: String { rawValue }

        var title: String {
            switch self {
            case .all:
                "Hepsi"
            case .running:
                "Çalışan"
            case .completed:
                "Tamamlanan"
            }
        }

        func matches(_ value: String) -> Bool {
            let normalized = value.lowercased()
            switch self {
            case .all:
                return true
            case .running:
                return normalized == "running"
            case .completed:
                return normalized == "completed"
            }
        }
    }

    private let sidebarColumns = [
        GridItem(.adaptive(minimum: 260), spacing: 12)
    ]

    private var specialistFilters: [String] {
        ["Tüm Uzmanlar"] + Array(Set(demoShellState.contract.scenarios.map(\.specialist))).sorted()
    }

    private var filteredScenarios: [SeisDemoNativeShellState.ContractScenario] {
        let query = scenarioSearchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        return demoShellState.contract.scenarios.filter { scenario in
            let specialistMatch = selectedSpecialist == "Tüm Uzmanlar" || scenario.specialist == selectedSpecialist
            guard !query.isEmpty else {
                return specialistMatch
            }
            return specialistMatch && "\(scenario.title) \(scenario.summary) \(scenario.specialist)".lowercased().contains(query)
        }
    }

    private var visibleScenarios: [SeisDemoNativeShellState.ContractScenario] {
        showAllScenarios ? filteredScenarios : Array(filteredScenarios.prefix(6))
    }

    private var hasMoreScenarios: Bool {
        filteredScenarios.count > visibleScenarios.count
    }

    private var featuredScenarios: [SeisDemoNativeShellState.ContractScenario] {
        Array(filteredScenarios.prefix(3))
    }

    private var routeSuggestions: [String] {
        let history = routeHistory
        let supported = demoShellState.supportedRoutes
        return (history + supported.filter { !history.contains($0) }).prefix(8).map { $0 }
    }

    private var selectedScenario: SeisDemoNativeShellState.ContractScenario? {
        guard let selectedScenarioId else {
            return nil
        }
        return demoShellState.scenarioById(selectedScenarioId)
    }

    private var displayRun: SeisDemoNativeShellState.DemoRun? {
        if case let .results(runId) = demoShellState.routeType(),
           let run = demoShellState.run(for: runId) {
            return run
        }
        return demoShellState.activeRun
    }

    private var shortRepositoryPath: String {
        let fallback = "SEIS Workspace"
        let parts = repositoryPath.split(separator: "/")
        guard !parts.isEmpty else {
            return fallback
        }
        return parts.suffix(4).joined(separator: "/")
    }

    private var recentRuns: [SeisDemoNativeShellState.DemoRun] {
        let runs = Array(demoShellState.runs.values)
        return Array(runs.sorted { lhs, rhs in
            let left = parseRunDate(lhs)
            let right = parseRunDate(rhs)

            if let leftDate = left, let rightDate = right {
                return leftDate > rightDate
            }
            if left != nil {
                return true
            }
            if right != nil {
                return false
            }
            return rhs.id.localizedStandardCompare(lhs.id) == .orderedAscending
        }.prefix(6))
    }

    private var filteredRecentRuns: [SeisDemoNativeShellState.DemoRun] {
        recentRuns.filter { run in
            recentRunFilter.matches(run.status)
        }
    }

    private var hasScenarios: Bool {
        !demoShellState.contract.scenarios.isEmpty
    }

    var body: some View {
        #if os(macOS)
        ZStack {
            Color(NSColor.windowBackgroundColor)
                .ignoresSafeArea()

            HStack(spacing: 14) {
                sidebar
                    .frame(width: 380)

                Divider()

                demoContent
            }
            .padding(14)
        }
        .onAppear {
            syncSelectionFromRoute(demoShellState.routeForDisplay)
            rememberRoute(demoShellState.routeForDisplay)
        }
        .onChange(of: demoShellState.routeForDisplay) { route in
            syncSelectionFromRoute(route)
            rememberRoute(route)
        }
        .onChange(of: demoShellState.activeRun) { activeRun in
            if activeRun != nil {
                selectedScenarioId = activeRun?.scenarioId
            }
        }
        #else
        SeisDemoNativeShellView(state: demoShellState)
        #endif
    }

    private var sidebar: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                studioHeader
                if !didDismissWelcomeBanner {
                    onboardingCard
                }
                featuredScenariosCard
                quickActionsCard
                quickRouteCard
                scenarioListCard
                recentRunsCard
                if !demoShellState.telemetryEvents.isEmpty {
                    telemetryCard
                }
            }
        }
        .onChange(of: scenarioSearchText) { _ in
            showAllScenarios = false
        }
        .onChange(of: selectedSpecialist) { _ in
            showAllScenarios = false
        }
    }

    private var demoContent: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                sectionHeader
                panelSwitcher

                if activePanel == .applePlatform {
                    AppleContinuationWindow()
                        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
                } else if let run = displayRun {
                    resultSummaryCard(run)
                } else if case .unsupported = demoShellState.routeType() {
                    unsupportedRouteCard
                } else if let scenario = selectedScenario {
                    scenarioDetailCard(scenario)
                } else {
                    EmptyStateCard()
                }

                if let activeRun = demoShellState.activeRun {
                    activeRunMiniCard(activeRun)
                }
            }
            .padding(.leading, 6)
        }
    }

    private var studioHeader: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                ZStack {
                    Circle()
                        .fill(.quaternary.opacity(0.35))
                        .frame(width: 44, height: 44)
                    Image(systemName: "sparkles")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundStyle(Color.accentColor)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("SEIS Demo Studio")
                        .font(.title2)
                        .fontWeight(.semibold)
                    Text("SEIS senaryolarını tek ekranda başlatın, izleyin, sonuçlayın")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Text("Proje: \(shortRepositoryPath)")
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(1)

            flowGuide
        }
        .padding(12)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var flowGuide: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Kolay kullanım akışı")
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack {
                flowStep("1", title: "Senaryo seç", isActive: true)
                flowConnector
                flowStep("2", title: "Çalıştır", isActive: demoShellState.activeRun != nil)
                flowConnector
                flowStep("3", title: "Sonucu incele", isActive: displayRun != nil)
            }
            .font(.caption2)
        }
    }

    private var flowConnector: some View {
        Capsule()
            .fill(.secondary.opacity(0.25))
            .frame(height: 2)
    }

    private func flowStep(_ number: String, title: String, isActive: Bool) -> some View {
        HStack(spacing: 6) {
            Text(number)
                .font(.caption)
                .fontWeight(.semibold)
                .frame(width: 20, height: 20)
                .background(isActive ? AnyShapeStyle(Color.accentColor) : AnyShapeStyle(.secondary.opacity(0.3)), in: Circle())
                .foregroundStyle(isActive ? .white : .secondary)
            Text(title)
                .foregroundStyle(isActive ? .primary : .secondary)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var quickActionsCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Hızlı Başlangıç")
                .font(.headline)

            Text("Senaryo seçin, çalıştırın, sonuç kartını otomatik görün.")
                .font(.caption)
                .foregroundStyle(.secondary)

            Button {
                demoShellState.applyRoute("/demo")
                activePanel = .demo
            } label: {
                Label("Senaryoları Aç", systemImage: "list.bullet")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)

            HStack(spacing: 8) {
                Button {
                    demoShellState.applyRoute("/")
                } label: {
                    Label("Ana Sayfa", systemImage: "house")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                Button {
                    if let firstScenario = demoShellState.contract.scenarios.first {
                        runScenario(firstScenario.id)
                    }
                } label: {
                    Label("Tek Tıkla Demo", systemImage: "play.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(demoShellState.contract.scenarios.isEmpty)
            }

            if let fallback = demoShellState.fallbackMode {
                Label {
                    Text("\(fallback.title): \(fallback.message(for: demoShellState.contract))")
                        .foregroundStyle(.orange)
                        .lineLimit(3)
                } icon: {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(.orange)
                }
                .font(.caption2)
            } else {
                HStack(spacing: 6) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                    Text("Sözleşme ve routing aktif")
                        .font(.caption2)
                        .foregroundStyle(.green)
                }
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var onboardingCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                HStack(spacing: 8) {
                    Image(systemName: "sparkles")
                        .foregroundStyle(Color.accentColor)
                    Text("SEIS ile Hızlı Başla")
                        .font(.headline)
                }

                Spacer()

                Button {
                    didDismissWelcomeBanner = true
                } label: {
                    Label("Kapat", systemImage: "xmark.circle")
                        .labelStyle(.iconOnly)
                }
                .buttonStyle(.plain)
            }

            Text("Tek bir akış: senaryo seç → Çalıştır → Sonucu gör.")
                .font(.caption)
                .foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 8) {
                onboardingStep(number: "1", text: "Sol panelden senaryo seçin")
                onboardingStep(number: "2", text: "Tek tıkla ‘Çalıştır’ deyin")
                onboardingStep(number: "3", text: "Sağ panelde sonuç kartını takip edin")
            }

            if let firstScenario = demoShellState.contract.scenarios.first {
                HStack(spacing: 8) {
                    Button {
                        openScenario(firstScenario.id)
                    } label: {
                        Label("Örnek Senaryo", systemImage: "arrow.right.circle")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)

                    Button {
                        runScenario(firstScenario.id)
                        activePanel = .demo
                    } label: {
                        Label("Tek Tıkla Çalıştır", systemImage: "play.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(!hasScenarios)
                }
            }
        }
        .padding(12)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func onboardingStep(number: String, text: String) -> some View {
        HStack(alignment: .top, spacing: 8) {
            Text(number)
                .font(.caption2)
                .fontWeight(.semibold)
                .frame(width: 18, height: 18)
                .background(.secondary.opacity(0.3), in: Circle())
                .foregroundStyle(.white)

            Text(text)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var featuredScenariosCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Öne Çıkan Senaryolar")
                .font(.headline)

            if featuredScenarios.isEmpty {
                Text("Henüz öne çıkan senaryo bulunmuyor.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(featuredScenarios, id: \.id) { scenario in
                    HStack(alignment: .top, spacing: 10) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(scenario.title)
                                .font(.caption)
                                .fontWeight(.medium)
                                .lineLimit(2)
                            Text(scenario.summary)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                                .lineLimit(2)
                        }

                        Spacer()

                        Button {
                            openScenario(scenario.id)
                        } label: {
                            Image(systemName: "arrow.right")
                        }
                        .buttonStyle(.bordered)
                        .help("Önizlemeyi aç")

                        Button {
                            runScenario(scenario.id)
                        } label: {
                            Image(systemName: "play.fill")
                        }
                        .buttonStyle(.borderedProminent)
                        .help("Bu senaryoyu başlat")
                    }
                    .padding(8)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10))
                }
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var quickRouteCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Route Hızlı Git")
                .font(.headline)

            HStack(spacing: 8) {
                TextField("Örn: /demo", text: $quickRoute)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit {
                        openQuickRoute()
                    }
                    .labelsHidden()

                Button {
                    openQuickRoute()
                } label: {
                    Label("Git", systemImage: "arrow.up.right.square")
                }
                .buttonStyle(.borderedProminent)
                .disabled(quickRoute.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }

            HStack {
                Menu {
                    if !routeHistory.isEmpty {
                        Section("Son Rotalar") {
                            ForEach(routeHistory, id: \.self) { route in
                                Button(route) {
                                    quickRoute = route
                                    openQuickRoute()
                                }
                            }
                        }
                    }
                    if !demoShellState.supportedRoutes.isEmpty {
                        Section("Desteklenen Rotalar") {
                            ForEach(demoShellState.supportedRoutes, id: \.self) { route in
                                Button(route) {
                                    quickRoute = route
                                    openQuickRoute()
                                }
                            }
                        }
                    }
                } label: {
                    Label("Kısayollar", systemImage: "clock.arrow.circlepath")
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .buttonStyle(.bordered)
                .disabled(routeHistory.isEmpty && demoShellState.supportedRoutes.isEmpty)

                if !routeHistory.isEmpty {
                    Button {
                        routeHistory.removeAll()
                    } label: {
                        Label("Geçmişi Temizle", systemImage: "trash")
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                }
            }

            if let quickRouteValidationMessage {
                Text(quickRouteValidationMessage)
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }

            if !routeSuggestions.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(routeSuggestions, id: \.self) { route in
                            routeChip(route)
                        }
                    }
                    .padding(.top, 2)
                }
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var recentRunsCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Son Çalışmalar")
                    .font(.headline)

                Spacer()

                Picker("Filtre", selection: $recentRunFilter) {
                    ForEach(RecentRunFilter.allCases) { filter in
                        Text(filter.title).tag(filter)
                    }
                }
                .pickerStyle(.segmented)
                .controlSize(.mini)
                .frame(width: 220)

                Button {
                    demoShellState.clearRuns()
                } label: {
                    Label("Temizle", systemImage: "trash")
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
                .disabled(demoShellState.runs.isEmpty)
            }

            if filteredRecentRuns.isEmpty {
                Text("Henüz çalışma yok.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(filteredRecentRuns, id: \.id) { run in
                    HStack(spacing: 8) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(demoShellState.scenarioById(run.scenarioId)?.title ?? run.scenarioId)
                                .font(.caption)
                                .lineLimit(1)
                            Text(runDurationText(run.durationMs))
                                .font(.caption2.monospacedDigit())
                                .foregroundStyle(.secondary)
                            if let startedAt = parseRunDate(run),
                               let relativeText = relativeDate(for: startedAt) {
                                Text(relativeText)
                                    .font(.caption2)
                                    .foregroundStyle(.tertiary)
                            }
                        }

                        Spacer()

                        statusBadge(run.status)

                        Button {
                            demoShellState.applyRoute("/results/\(run.id)")
                        } label: {
                            Label("Detay", systemImage: "doc.text.magnifyingglass")
                        }
                        .buttonStyle(.bordered)

                        Button {
                            runScenario(run.scenarioId)
                        } label: {
                            Label("Yenile", systemImage: "arrow.clockwise")
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding(8)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8))
                }
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var scenarioListCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Senaryolar")
                .font(.headline)

            HStack(spacing: 8) {
                TextField("Senaryo ara", text: $scenarioSearchText)
                    .textFieldStyle(.roundedBorder)

                Picker("Uzman", selection: $selectedSpecialist) {
                    ForEach(specialistFilters, id: \.self) { specialist in
                        Text(specialist).tag(specialist)
                    }
                }
                .pickerStyle(.menu)
                .frame(width: 170)
            }

            if filteredScenarios.isEmpty {
                Text("Filtreye uygun senaryo yok.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            } else {
                LazyVGrid(columns: sidebarColumns, spacing: 8) {
                    ForEach(visibleScenarios, id: \.id) { scenario in
                        Button {
                            openScenario(scenario.id)
                        } label: {
                            scenarioSidebarItem(scenario)
                        }
                        .buttonStyle(.plain)
                    }
                }

                if hasMoreScenarios {
                    Button {
                        showAllScenarios.toggle()
                    } label: {
                        Label(showAllScenarios ? "Daha Az Göster" : "Tüm Senaryoları Göster", systemImage: showAllScenarios ? "chevron.up" : "chevron.down")
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                }
            }
        }
        .padding(12)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func routeChip(_ route: String) -> some View {
        Button {
            quickRoute = route
            openQuickRoute()
        } label: {
            HStack(spacing: 4) {
                Image(systemName: routeTypeIcon(for: route))
                    .font(.caption2)
                Text(route)
                    .font(.caption2)
                    .lineLimit(1)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(.regularMaterial, in: Capsule())
        }
        .buttonStyle(.plain)
        .help("Open \(route)")
    }

    private func routeTypeIcon(for route: String) -> String {
        switch demoShellState.routeType(for: route) {
        case .home:
            "house"
        case .demo:
            "list.bullet"
        case .scenario:
            "text.book.closed"
        case .results:
            "doc.text.magnifyingglass"
        case .unsupported:
            "questionmark.circle"
        }
    }

    private func scenarioSidebarItem(_ scenario: SeisDemoNativeShellState.ContractScenario) -> some View {
        let isSelected = selectedScenarioId == scenario.id

        return VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(scenario.title)
                    .font(.caption)
                    .lineLimit(1)
                    .foregroundStyle(.primary)

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                        .font(.caption)
                }
            }

            Text(scenario.summary)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(2)

            Text(scenario.specialist)
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(isSelected ? Color.accentColor.opacity(0.15) : scenarioBackgroundColor)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(isSelected ? Color.accentColor.opacity(0.35) : Color.clear, lineWidth: 1)
        )
    }

    private var scenarioBackgroundColor: Color {
        #if os(macOS)
        Color(NSColor.controlBackgroundColor).opacity(0.35)
        #else
        Color.secondary.opacity(0.12)
        #endif
    }

    private func statusBadge(_ status: String) -> some View {
        let normalized = status.lowercased()
        let title = normalized == "completed" ? "Tamamlandı" : normalized == "running" ? "Çalışıyor" : status
        let tint: Color = normalized == "completed" ? .green : .orange

        return Text(title)
            .font(.caption2)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(tint.opacity(0.16), in: Capsule())
            .foregroundStyle(tint)
    }

    private var telemetryCard: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Canlı Telemetri")
                .font(.headline)
            Text("Son olay: \(demoShellState.telemetryEvents.first?.eventName ?? "Yok")")
                .font(.caption2)
                .foregroundStyle(.secondary)

            if let latest = demoShellState.telemetryEvents.first {
                Text("\(latest.route) • \(relativeTelemetryTime(for: latest.occurredAt))")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(10)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func openScenario(_ scenarioId: String) {
        guard let scenario = demoShellState.scenarioById(scenarioId) else {
            quickRouteValidationMessage = "Seçilen senaryo bulunamadı."
            return
        }

        selectedScenarioId = scenario.id
        demoShellState.applyRoute("/demo/\(scenario.id)")
        activePanel = .demo
        quickRouteValidationMessage = nil
    }

    private func runScenario(_ scenarioId: String) {
        guard demoShellState.scenarioById(scenarioId) != nil else {
            quickRouteValidationMessage = "Seçilen senaryo bulunamadı."
            return
        }

        selectedScenarioId = scenarioId
        activePanel = .demo
        demoShellState.startScenario(scenarioId)
    }

    private func copyPrompt(_ text: String, scenarioId: String) {
        #if os(macOS)
        let board = NSPasteboard.general
        board.clearContents()
        board.setString(text, forType: .string)
        #endif

        copiedScenarioId = scenarioId
        Task { @MainActor in
            try? await Task.sleep(for: .seconds(1.2))
            if copiedScenarioId == scenarioId {
                copiedScenarioId = nil
            }
        }
    }

    private var sectionHeader: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 2) {
                Text("İş Akışı")
                    .font(.title3)
                    .fontWeight(.semibold)
                Text("Mevcut yol: \(demoShellState.routeForDisplay)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            DiagnosticsStripItem(title: "Rotalar", value: "\(demoShellState.supportedRoutes.count)", isPositive: !demoShellState.supportedRoutes.isEmpty)
                .frame(width: 130)
                .padding(.vertical, 4)
        }
    }

    private var panelSwitcher: some View {
        Picker("Panel", selection: $activePanel) {
            ForEach(SeisAppleNativeShellPanel.allCases) { panel in
                Label(panel.title, systemImage: panel.systemImage)
                    .tag(panel)
            }
        }
        .pickerStyle(.segmented)
        .controlSize(.small)
    }

    private func scenarioDetailCard(_ scenario: SeisDemoNativeShellState.ContractScenario) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Senaryo")
                .font(.headline)

            Text(scenario.title)
                .font(.subheadline.weight(.semibold))

            Text(scenario.summary)
                .font(.caption)
                .foregroundStyle(.secondary)

            Label {
                Text("Uzman: \(scenario.specialist)")
                    .font(.caption2)
            } icon: {
                Image(systemName: "person.crop.circle")
            }

            if let prompt = scenario.defaultPrompt {
                Text("Örnek Prompt")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)

                Text(prompt)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .padding(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))

                Button {
                    copyPrompt(prompt, scenarioId: scenario.id)
                } label: {
                    if copiedScenarioId == scenario.id {
                        Label("Kopyalandı", systemImage: "checkmark")
                    } else {
                        Label("Promptu Kopyala", systemImage: "doc.on.doc")
                    }
                }
                .buttonStyle(.plain)
                .font(.caption2)
            }

            HStack(spacing: 8) {
                Button {
                    openScenario(scenario.id)
                } label: {
                    Label("Detay", systemImage: "text.book.closed")
                }
                .buttonStyle(.bordered)

                Button {
                    runScenario(scenario.id)
                } label: {
                    Label("Çalıştır", systemImage: "play.fill")
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func resultSummaryCard(_ run: SeisDemoNativeShellState.DemoRun) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Text("Sonuç")
                    .font(.headline)
                Spacer()
                Text(run.status == "completed" ? "Tamamlandı" : "Devam Ediyor")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(run.status == "completed" ? Color.green.opacity(0.2) : Color.orange.opacity(0.2), in: Capsule())
                    .foregroundStyle(run.status == "completed" ? .green : .orange)
            }

            Text(demoShellState.scenarioById(run.scenarioId)?.title ?? run.scenarioId)
                .font(.subheadline.weight(.semibold))
                .lineLimit(1)

            HStack(spacing: 12) {
                Label("Süre", systemImage: "clock")
                Text(runDurationText(run.durationMs))
                    .font(.caption.monospacedDigit())
                    .foregroundStyle(.secondary)
            }
            .font(.caption)
            .foregroundStyle(.secondary)

            if !run.steps.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(Array(run.steps.enumerated()), id: \.offset) { _, step in
                        HStack(spacing: 6) {
                            Image(systemName: step.state == "success" ? "checkmark.circle.fill" : "circle.dashed")
                                .foregroundStyle(step.state == "success" ? .green : .secondary)
                            Text(step.name)
                                .font(.caption2)
                        }
                    }
                }
                .padding(8)
                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
            }

            if run.status == "completed" {
                Button {
                    runScenario(run.scenarioId)
                } label: {
                    Label("Yeniden başlat", systemImage: "arrow.clockwise")
                }
                .buttonStyle(.bordered)
            }
        }
        .padding(12)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func activeRunMiniCard(_ run: SeisDemoNativeShellState.DemoRun) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Aktif Çalışma")
                .font(.subheadline.weight(.semibold))

            Text(demoShellState.scenarioById(run.scenarioId)?.title ?? run.scenarioId)
                .font(.caption2)
                .lineLimit(1)

            if run.status == "running" {
                ProgressView(value: min(1, 0.2 + Double(run.steps.count) * 0.2))
                Text("İşleniyor...")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
        }
        .padding(10)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 10))
    }

    private var unsupportedRouteCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Rota Bulunamadı")
                .font(.headline)

            Text("Bu rota desteklenmiyor. Hızlı başlangıçta önerilen rotalardan birini ya da senaryo listesini kullanın.")
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack(spacing: 8) {
                Button {
                    demoShellState.applyRoute("/demo")
                    activePanel = .demo
                } label: {
                    Label("Demo Listesine Git", systemImage: "list.bullet")
                }
                .buttonStyle(.bordered)

                Button {
                    demoShellState.applyRoute("/")
                    activePanel = .demo
                } label: {
                    Label("Ana Sayfa", systemImage: "house")
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func EmptyStateCard() -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("SEIS Demo Studio'ya hoş geldiniz")
                .font(.headline)
            Text("İlk adım: bir senaryo seçin. Sol panelde bir senaryo seçtiğinizde detay ve çalıştırma butonu aktifleşir.")
                .font(.caption)
                .foregroundStyle(.secondary)

            if let firstScenario = demoShellState.contract.scenarios.first {
                Button {
                    openScenario(firstScenario.id)
                } label: {
                    Label("Senaryo 1", systemImage: "sparkles")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func syncSelectionFromRoute(_ route: String) {
        if case let .scenario(scenarioId) = demoShellState.routeType(for: route) {
            selectedScenarioId = scenarioId
            selectedSpecialist = "Tüm Uzmanlar"
            activePanel = .demo
            return
        }

        if selectedScenarioId == nil, let first = demoShellState.contract.scenarios.first {
            selectedScenarioId = first.id
        }
    }

    private func openQuickRoute() {
        let normalized = demoShellState.normalizedRoute(quickRoute)
        guard !normalized.isEmpty else {
            quickRouteValidationMessage = nil
            return
        }

        demoShellState.applyRoute(normalized)
        rememberRoute(normalized)
        quickRoute = ""
        let routeKind = demoShellState.routeType(for: normalized)
        if case .unsupported = routeKind {
            quickRouteValidationMessage = "Geçersiz rota: \(normalized)"
        } else {
            quickRouteValidationMessage = nil
        }
        activePanel = .demo
    }

    private func rememberRoute(_ route: String) {
        let normalized = demoShellState.normalizedRoute(route)
        guard !normalized.isEmpty else {
            return
        }

        if let existing = routeHistory.firstIndex(of: normalized) {
            routeHistory.remove(at: existing)
        }

        routeHistory.insert(normalized, at: 0)
        if routeHistory.count > 8 {
            routeHistory.removeLast(routeHistory.count - 8)
        }
    }

    private func parseRunDate(_ run: SeisDemoNativeShellState.DemoRun) -> Date? {
        if let parsed = ISO8601DateParser.date(from: run.startedAt) {
            return parsed
        }
        return ISO8601DateParserFallback.date(from: run.startedAt)
    }

    private func runDurationText(_ ms: Int) -> String {
        if ms < 1000 {
            return "\(ms) ms"
        }
        return String(format: "%.2fs", Double(ms) / 1000)
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

        return "şu an"
    }

    private func relativeDate(for date: Date) -> String? {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

private struct DiagnosticsStripItem: View {
    let title: String
    let value: String
    let isPositive: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.caption2)
                .foregroundStyle(.secondary)

            HStack(spacing: 4) {
                Image(systemName: isPositive ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                    .foregroundStyle(isPositive ? .green : .orange)
                Text(value)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .lineLimit(1)
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
