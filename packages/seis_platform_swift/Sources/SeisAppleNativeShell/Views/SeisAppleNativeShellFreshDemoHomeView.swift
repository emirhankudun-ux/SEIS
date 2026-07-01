import Foundation
import SeisPlatformKit
import SwiftUI
#if os(macOS)
import AppKit
#endif

struct SeisAppleNativeShellFreshDemoHomeView: View {
    @ObservedObject var demoShellState: SeisDemoNativeShellState
    let repositoryPath: String
    @Binding var activePanel: SeisAppleNativeShellPanel

    @AppStorage("seisDemoWelcomeBannerDismissed") private var hasDismissedWelcome = false
    @State private var selectedSpecialist = "Tüm Uzmanlar"
    @State private var scenarioSearchText = ""
    @State private var selectedScenarioId: String?
    @State private var quickRouteText = ""
    @State private var quickRouteMessage: String?
    @State private var copiedScenarioId: String?
    @State private var showAllScenarios = false
    @State private var recentRunFilter: RecentRunFilter = .all
    @State private var routeHistory: [String] = []
    @State private var selectedShowcaseTab = 0
    @State private var latestReleaseTag: String?
    @State private var latestReleaseDateText: String?
    @State private var latestReleaseAssetName: String?
    @State private var latestReleaseAssetURL: String?
    @State private var releaseLoadFailed = false
    @State private var copiedValue: String?
    @State private var repositoryLiveSignals: [RepositoryLiveSignal] = []
    @State private var ecosystemCapabilitySignals: [RepositoryLiveSignal] = []
    @State private var fullStackDesignLanes: [FullStackDesignLane] = []
    @State private var lastRepositorySignalRefreshText = "Henüz taranmadı"
    @State private var lastCapabilityRefreshText = "Henüz taranmadı"

    private struct ShowcaseFeature: Identifiable {
        let id = UUID()
        let title: String
        let subtitle: String
        let icon: String
        let tone: Color
    }

    private struct FiveYearMilestone: Identifiable {
        let id = UUID()
        let year: String
        let title: String
        let subtitle: String
    }

    private struct AgentCapability: Identifiable {
        let id = UUID()
        let title: String
        let status: String
        let description: String
        let icon: String
        let tone: Color
    }

    private struct AGILayer: Identifiable {
        let id = UUID()
        let title: String
        let signal: String
        let description: String
        let icon: String
        let tone: Color
    }

    private struct RepositoryLiveSignal: Identifiable {
        let id = UUID()
        let title: String
        let value: String
        let detail: String
        let icon: String
        let tone: Color
    }

    private struct FullStackDesignLane: Identifiable {
        let id: String
        let title: String
        let badge: String
        let intent: String
        let deepLink: String?
        let icon: String
        let tone: Color
    }

    private struct LanguageDistributionReport: Decodable {
        let summary: Summary
        let languages: [Language]

        struct Summary: Decodable {
            let countedFileCount: Int
            let javascriptPercent: Double
            let targetJavaScriptPercent: Double
            let targetStatus: String
        }

        struct Language: Decodable {
            let language: String
            let percent: Double
        }
    }

    private struct TechnologyStackReport: Decodable {
        let generatedAt: String?
        let summary: Summary

        struct Summary: Decodable {
            let sourceLanguageCount: Int
            let ecosystemTechnologyCount: Int
        }
    }

    private struct PluginCapabilityLanesReport: Decodable {
        let summary: Summary
        let laneDefinitions: [LaneDefinition]

        struct Summary: Decodable {
            let laneCount: Int
            let totalAssignments: Int
            let uniquePlugins: Int
            let remotePluginCount: Int?
        }

        struct LaneDefinition: Decodable {
            let id: String
            let label: String
            let intent: String
            let qualityCommands: [String]?
        }
    }

    private struct PluginInventoryReport: Decodable {
        let summary: Summary

        struct Summary: Decodable {
            let totalLinks: Int
            let uniquePlugins: Int
        }
    }

    private struct SSHAccessModelReport: Decodable {
        let defaultVisibleAlias: String
        let profiles: [Profile]
        let visibility: Visibility?
        let longTermDevelopment: LongTermDevelopment?

        struct Profile: Decodable {
            let id: String
            let label: String
            let transport: String
            let visibleAlias: String
            let vpnRequired: Bool
            let developmentSystem: String
        }

        struct Visibility: Decodable {
            let activeAliases: [String]
            let forbiddenVisibleAliases: [String]
            let localMachineHostsAllowed: Bool
        }

        struct LongTermDevelopment: Decodable {
            let pickerCompatibilityCheck: String?
            let operatingModel: String?
            let qualityCommands: [String]?
        }
    }

    private struct CloudEnvironmentReport: Decodable {
        let mode: String
        let remote: String
        let releasePackage: String
        let environment: Environment

        struct Environment: Decodable {
            let requiredAtDeployTime: [String]
            let secrets: [Secret]
        }

        struct Secret: Decodable {
            let name: String
            let scope: String
        }
    }

    @State private var welcomeHints = [
        "Uzmanlardan birini seçin ve senaryoyu başlatın.",
        "Çalışmayı izleyin ve adımları anında görün.",
        "Sonucu kontrol edip raporu açın."
    ]

    private let showcaseFeatures: [ShowcaseFeature] = [
        .init(
            title: "Repo zekası",
            subtitle: "SEIS kaynakları, rotaları ve sonuçları tek ürün yüzeyinde okunur.",
            icon: "rectangle.2.swap",
            tone: .blue
        ),
        .init(
            title: "AGI çalışma döngüsü",
            subtitle: "Memory, skill, governance ve dağıtım sinyalleri birlikte izlenir.",
            icon: "sparkles",
            tone: .green
        ),
        .init(
            title: "Mac + web release",
            subtitle: "Yerel macOS deneyimi indirilebilir web ürünüyle aynı kalite çizgisinde kalır.",
            icon: "arrow.triangle.branch",
            tone: .purple
        )
    ]

    private let fiveYearMilestones: [FiveYearMilestone] = [
        .init(
            year: "Yıl 1",
            title: "Repository Intelligence",
            subtitle: "SEIS repo yüzeyi okunur, anlaşılır ve ilk 5 dakikada çalıştırılabilir hale gelir."
        ),
        .init(
            year: "Yıl 2",
            title: "Self-Improving Skills",
            subtitle: "Tekrarlanan işler skill döngüsüne bağlanır; iyi sonuçlar yeniden kullanılabilir olur."
        ),
        .init(
            year: "Yıl 3",
            title: "Policy-Safe Autonomy",
            subtitle: "Otonom çalışma governance, güvenlik ve rollback kapılarından geçerek ilerler."
        ),
        .init(
            year: "Yıl 4",
            title: "Distributed Platform Runtime",
            subtitle: "Mac, web, cloud, MCP ve agent runtime aynı SEIS operasyon diline bağlanır."
        ),
        .init(
            year: "Yıl 5",
            title: "SEIS AGI Operating System",
            subtitle: "Repo, ürün, güvenlik, design system ve agent orkestrasyonu tek Apple-grade uygulamaya dönüşür."
        )
    ]

    private let agentCapabilities: [AgentCapability] = [
        .init(
            title: "Agent Hafızası",
            status: "Kontekst hazır",
            description: "Senaryolar, son çalışmalar ve rota geçmişi aynı çalışma yüzeyinde tutulur.",
            icon: "brain.head.profile",
            tone: .purple
        ),
        .init(
            title: "Skill Döngüsü",
            status: "Yeniden kullanılabilir",
            description: "Her demo akışı uzman, prompt ve adım çıktılarıyla tekrar çalıştırılabilir.",
            icon: "wand.and.stars",
            tone: .blue
        ),
        .init(
            title: "Gateway Yüzeyi",
            status: "Web + Mac",
            description: "GitHub release, web README ve yerel macOS akışı aynı dağıtım hattına bağlanır.",
            icon: "point.3.connected.trianglepath.dotted",
            tone: .green
        ),
        .init(
            title: "Governance Guard",
            status: "Kontrollü",
            description: "Rota dışı durumlar, fallback ve telemetri olayları görünür tutulur.",
            icon: "checkmark.shield",
            tone: .orange
        )
    ]

    private let agiLayers: [AGILayer] = [
        .init(
            title: "Repository Cortex",
            signal: "Kaynak yüzeyi",
            description: "SEIS repo, platform hedefleri, route kontratı ve çalışma geçmişi tek intelligence katmanı olarak okunur.",
            icon: "square.stack.3d.up",
            tone: .blue
        ),
        .init(
            title: "Memory Graph",
            signal: "Kontekst sürekliliği",
            description: "Son çalışmalar, senaryolar ve kullanıcı yönü aynı uygulama hafızasında görünür kalır.",
            icon: "brain",
            tone: .purple
        ),
        .init(
            title: "Skill Foundry",
            signal: "Tekrar kullanılabilirlik",
            description: "Başarılı uzman akışları prompt, adım ve sonuç olarak yeni üretim döngülerine temel olur.",
            icon: "hammer",
            tone: .green
        ),
        .init(
            title: "Policy Kernel",
            signal: "Güvenli otonomi",
            description: "Fallback, route validation, release readiness ve kalite kapıları karar izini korur.",
            icon: "shield.lefthalf.filled",
            tone: .orange
        )
    ]

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

    private let releaseWebsiteURL = "https://github.com/emirhankudun-ux/SEIS/releases/latest"
    private let websiteLandingURL = "https://github.com/emirhankudun-ux/SEIS#readme"
    private let releasesAPIURL = "https://api.github.com/repos/emirhankudun-ux/SEIS/releases/latest"

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
            let haystack = "\(scenario.title) \(scenario.summary) \(scenario.specialist)".lowercased()
            return specialistMatch && haystack.contains(query)
        }
    }

    private var visibleScenarios: [SeisDemoNativeShellState.ContractScenario] {
        let items = filteredScenarios
        return showAllScenarios ? items : Array(items.prefix(6))
    }

    private var selectedScenario: SeisDemoNativeShellState.ContractScenario? {
        guard let selectedScenarioId else {
            return nil
        }
        return demoShellState.scenarioById(selectedScenarioId)
    }

    private var activeRun: SeisDemoNativeShellState.DemoRun? {
        demoShellState.activeRun
    }

    private var displayRun: SeisDemoNativeShellState.DemoRun? {
        if case let .results(runId) = demoShellState.routeType(),
           let run = demoShellState.run(for: runId) {
            return run
        }
        return activeRun
    }

    private var recentRuns: [SeisDemoNativeShellState.DemoRun] {
        let runs = Array(demoShellState.runs.values)
        return Array(runs.sorted { lhs, rhs in
            if let leftDate = parseRunDate(lhs), let rightDate = parseRunDate(rhs) {
                return leftDate > rightDate
            }
            if parseRunDate(lhs) != nil {
                return true
            }
            if parseRunDate(rhs) != nil {
                return false
            }
            return rhs.id.localizedStandardCompare(lhs.id) == .orderedAscending
        })
    }

    private var filteredRecentRuns: [SeisDemoNativeShellState.DemoRun] {
        recentRuns.filter { recentRunFilter.matches($0.status) }
    }

    private var routeSuggestions: [String] {
        let history = routeHistory.filter { !$0.isEmpty }
        let supported = demoShellState.supportedRoutes
        var merged: [String] = []

        if let latestRun = recentRuns.first {
            merged.append("/results/\(latestRun.id)")
        }

        merged.append(contentsOf: history)

        for route in supported where !merged.contains(route) {
            merged.append(route)
        }

        return Array(merged.prefix(12))
    }

    private var shortRepositoryPath: String {
        let fallback = "SEIS Workspace"
        let parts = repositoryPath.split(separator: "/")
        guard !parts.isEmpty else {
            return fallback
        }
        return parts.suffix(5).joined(separator: "/")
    }

    private var quickInstallSource: String {
        latestReleaseAssetURL ?? releaseWebsiteURL
    }

    private var hasScenarios: Bool {
        !demoShellState.contract.scenarios.isEmpty
    }

    private var defaultScenarioId: String? {
        demoShellState.contract.scenarios.first?.id
    }

    private var routeStep: Int {
        let routeType = demoShellState.routeType()
        if case .results = routeType {
            return 3
        }

        switch routeType {
        case .scenario:
            if let activeRun, activeRun.status == "completed" {
                return 3
            }
            return 2
        case .demo:
            return 2
        case .home:
            return selectedScenario == nil && activeRun == nil ? 1 : 2
        case .unsupported:
            return 1
        case .results:
            return 3
        }
    }

    var body: some View {
        #if os(macOS)
        NavigationSplitView {
            sidebar
                .frame(minWidth: 360, idealWidth: 380)
        } detail: {
            detailPanel
        }
        .navigationSplitViewStyle(.balanced)
        .background(
            LinearGradient(
                colors: [Color(nsColor: NSColor.windowBackgroundColor).opacity(0.93), Color.secondary.opacity(0.06)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
        )
        .preferredColorScheme(.dark)
        .onAppear {
            syncSelectionFromRoute(demoShellState.routeForDisplay)
            if selectedScenarioId == nil, let first = demoShellState.contract.scenarios.first {
                selectedScenarioId = first.id
            }
            rememberRoute(demoShellState.routeForDisplay)
            loadReleaseMetadata()
            refreshRepositoryLiveSignals()
            refreshEcosystemCapabilitySignals()
        }
        .onChange(of: demoShellState.routeForDisplay) { route in
            syncSelectionFromRoute(route)
            rememberRoute(route)
        }
        .onChange(of: scenarioSearchText) { _ in
            showAllScenarios = false
        }
        .onChange(of: selectedSpecialist) { _ in
            showAllScenarios = false
        }
        .onChange(of: demoShellState.activeRun) { activeRun in
            if let activeRun {
                selectedScenarioId = activeRun.scenarioId
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
                launchShowcaseCard

                if !hasDismissedWelcome {
                    onboardingCard
                }

                quickStartCard
                quickRouteCard
                featurePillarsCard
                scenarioLibraryCard
                fiveYearVisionCard
                recentRunsCard
                releaseDownloadCard
                if !demoShellState.telemetryEvents.isEmpty {
                    telemetryCard
                }
            }
            .padding(12)
            .padding(.bottom, 16)
        }
    }

    private var detailPanel: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                routeToolbar
                routeSummaryStrip

                if activePanel == .applePlatform {
                    AppleContinuationWindow()
                        .seisSidebarCard(accent: .indigo, radius: 14, prominence: 0.06)
                } else if activePanel == .appLibrary {
                    SeisAppLibraryPanelView(repositoryPath: repositoryPath)
                        .seisSidebarCard(accent: .cyan, radius: 14, prominence: 0.05)
                } else if activePanel == .aiScale {
                    SeisAIModelScaleRoadmapView()
                        .seisSidebarCard(accent: .cyan, radius: 14, prominence: 0.05)
                } else if activePanel == .brainSSH {
                    SeisBrainSSHReadinessView()
                        .seisSidebarCard(accent: .green, radius: 14, prominence: 0.05)
                } else {
                    routeContent
                }
            }
            .padding(14)
        }
        .toolbar {
            ToolbarItem(placement: .automatic) {
                Button {
                    demoShellState.applyRoute("/")
                } label: {
                    Label("Anasayfa", systemImage: "house")
                }
            }
            ToolbarItem(placement: .automatic) {
                Button {
                    demoShellState.applyRoute("/demo")
                } label: {
                    Label("Senaryolar", systemImage: "list.bullet")
                }
            }
            ToolbarItem(placement: .automatic) {
                Button {
                    if let run = recentRuns.first {
                        demoShellState.applyRoute("/results/\(run.id)")
                    }
                } label: {
                    Label("Sonuç", systemImage: "doc.text.magnifyingglass")
                }
                .disabled(recentRuns.isEmpty)
            }
        }
    }

    private var studioHeader: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(.linearGradient(colors: [.blue.opacity(0.4), .indigo.opacity(0.2)], startPoint: .topLeading, endPoint: .bottomTrailing))
                        .frame(width: 44, height: 44)

                    Image(systemName: "sparkles")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundStyle(.white)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("SEIS AGI Native")
                        .font(.title3)
                        .fontWeight(.semibold)
                    Text("Apple-first repository intelligence app")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }

            HStack(spacing: 8) {
                infoBadge("Repo", value: shortRepositoryPath, tone: .blue)
                infoBadge("Senaryo", value: "\(demoShellState.contract.scenarios.count)", tone: .green)
                infoBadge("Kanal", value: "\(demoShellState.supportedRoutes.count)", tone: .purple)
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .cyan, prominence: 0.12)
    }

    private var launchShowcaseCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("SEIS Repo AGI Uygulaması")
                        .font(.headline)
                    Text("Repo zekası, agent hafızası, skill döngüsü ve release kalitesi tek macOS yüzeyinde.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Text("5 yıl")
                    .font(.caption2)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .seisSidebarPill(accent: .blue, prominence: 0.10)
            }

            SeisFlowStepper(steps: ["Repo", "Agent", "Release"], currentStep: routeStep)

            HStack(spacing: 8) {
                Button {
                    startQuickDemo()
                } label: {
                    Label("AGI Akışını Başlat", systemImage: "play.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(!hasScenarios)

                Button {
                    demoShellState.applyRoute("/demo")
                    selectedShowcaseTab = 1
                } label: {
                    Label("Repo Senaryoları", systemImage: "books.vertical.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                Button {
                    activePanel = .appLibrary
                } label: {
                    Label("LIB", systemImage: "square.grid.2x2.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .blue, prominence: 0.18)
    }

    private var featurePillarsCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Neden SEIS AGI App")
                .font(.headline)

            VStack(spacing: 8) {
                ForEach(showcaseFeatures) { feature in
                    HStack(spacing: 10) {
                        ZStack {
                            Circle()
                                .fill(feature.tone.opacity(0.18))
                                .frame(width: 24, height: 24)
                            Image(systemName: feature.icon)
                                .font(.caption)
                                .foregroundStyle(feature.tone)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(feature.title)
                                .font(.caption)
                                .fontWeight(.semibold)
                            Text(feature.subtitle)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(10)
                    .seisSidebarCard(accent: feature.tone, radius: 8, prominence: 0.08)
                }
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .cyan, prominence: 0.08)
    }

    private var onboardingCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Sıfırdan Başla")
                    .font(.headline)
                Spacer()
                Button("Kapat") {
                    hasDismissedWelcome = true
                }
                .buttonStyle(.plain)
                .font(.caption)
            }

            SeisFlowStepper(steps: ["Senaryo seç", "Çalıştır", "Sonuç gör"], currentStep: routeStep)

            VStack(alignment: .leading, spacing: 6) {
                ForEach(welcomeHints, id: \.self) { hint in
                    HStack(alignment: .top, spacing: 6) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                            .font(.caption)
                        Text(hint)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Button {
                startQuickDemo()
            } label: {
                Label("AGI Akışını Başlat", systemImage: "play.fill")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .disabled(!hasScenarios)
        }
        .padding(12)
        .seisSidebarCard(accent: .green, prominence: 0.10)
    }

    private var quickStartCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Hızlı Başlama")
                .font(.headline)

            HStack(spacing: 8) {
                Button {
                    demoShellState.applyRoute("/demo")
                    selectedShowcaseTab = 1
                } label: {
                    Label("Senaryo Listesi", systemImage: "list.bullet")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                Button {
                    if let first = defaultScenarioId {
                        runScenario(first)
                    }
                } label: {
                    Label("Tek Tıkla", systemImage: "bolt.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(!hasScenarios)
            }

            if let message = quickRouteMessage {
                Text(message)
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .blue, prominence: 0.10)
    }

    private var quickRouteCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Hızlı Rota")
                .font(.headline)

            HStack(spacing: 8) {
                TextField("Rota: /demo, /results/xxx", text: $quickRouteText)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit { applyQuickRoute() }

                Button {
                    applyQuickRoute()
                } label: {
                    Label("Git", systemImage: "arrow.right")
                        .frame(width: 76)
                }
                .buttonStyle(.borderedProminent)
                .disabled(quickRouteText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }

            if !routeSuggestions.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(routeSuggestions, id: \.self) { route in
                            routeChip(route)
                        }
                    }
                }
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .cyan, prominence: 0.08)
    }

    private var fiveYearVisionCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("5 Yıllık Yol Haritası")
                    .font(.headline)
                Spacer()
                Text("Her yıl net çıktı")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            VStack(spacing: 8) {
                ForEach(Array(fiveYearMilestones.enumerated()), id: \.offset) { index, milestone in
                    HStack(alignment: .top, spacing: 10) {
                        ZStack {
                            Circle()
                                .fill(Color.accentColor.opacity(0.2))
                                .frame(width: 26, height: 26)
                            Text("\(index + 1)")
                                .font(.caption2)
                                .fontWeight(.semibold)
                                .foregroundStyle(.white)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(milestone.year) · \(milestone.title)")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .lineLimit(1)
                            Text(milestone.subtitle)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                                .lineLimit(2)
                        }
                    }
                    .padding(8)
                    .seisSidebarCard(accent: .indigo, radius: 8, prominence: 0.07)
                }
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .indigo, prominence: 0.08)
    }

    private var scenarioLibraryCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Senaryolar")
                    .font(.headline)

                Spacer()

                Picker("Uzman", selection: $selectedSpecialist) {
                    ForEach(specialistFilters, id: \.self) { specialist in
                        Text(specialist).tag(specialist)
                    }
                }
                .pickerStyle(.menu)
                .frame(width: 170)
            }

            TextField("Senaryo ara", text: $scenarioSearchText)
                .textFieldStyle(.roundedBorder)

            if filteredScenarios.isEmpty {
                Text("Filtreye uygun senaryo bulunamadı.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            } else {
                VStack(spacing: 8) {
                    ForEach(visibleScenarios, id: \.id) { scenario in
                        scenarioRow(scenario)
                    }
                    if filteredScenarios.count > visibleScenarios.count {
                        Button {
                            showAllScenarios.toggle()
                        } label: {
                            Label(showAllScenarios ? "Daha az göster" : "Tümünü göster", systemImage: showAllScenarios ? "chevron.up" : "chevron.down")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)
                        .controlSize(.small)
                    }
                }
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .purple, prominence: 0.10)
    }

    private var recentRunsCard: some View {
        VStack(alignment: .leading, spacing: 10) {
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
            }

            if filteredRecentRuns.isEmpty {
                Text("Kayıt bulunamadı.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            } else {
                VStack(spacing: 8) {
                    ForEach(filteredRecentRuns.prefix(8), id: \.id) { run in
                        HStack(spacing: 8) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(demoShellState.scenarioById(run.scenarioId)?.title ?? run.scenarioId)
                                    .font(.caption2)
                                    .lineLimit(1)
                                Text(runDurationText(run.durationMs))
                                    .font(.caption2.monospacedDigit())
                                    .foregroundStyle(.secondary)
                                if let startedAt = parseRunDate(run) {
                                    Text(relativeDate(for: startedAt))
                                        .font(.caption2)
                                        .foregroundStyle(.tertiary)
                                }
                            }

                            Spacer()

                            statusBadge(run.status)

                            Button {
                                demoShellState.applyRoute("/results/\(run.id)")
                                activePanel = .demo
                            } label: {
                                Label("Detay", systemImage: "doc.text.magnifyingglass")
                                    .labelStyle(.iconOnly)
                            }
                            .buttonStyle(.bordered)
                        }
                        .padding(8)
                        .seisSidebarCard(accent: .green, radius: 8, prominence: 0.07)
                    }
                }
                HStack {
                    Spacer()
                    Button("Temizle") {
                        demoShellState.clearRuns()
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                    .disabled(demoShellState.runs.isEmpty)
                }
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .green, prominence: 0.08)
    }

    private var releaseDownloadCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("macOS Dağıtımı")
                    .font(.headline)
                Spacer()
                if let releaseTag = latestReleaseTag {
                    Text(releaseTag)
                        .font(.caption2.monospaced())
                        .foregroundStyle(.secondary)
                } else if releaseLoadFailed {
                    Text("Sürüm yok")
                        .font(.caption2)
                        .foregroundStyle(.orange)
                } else {
                    ProgressView()
                        .controlSize(.mini)
                }
            }

            if let releaseDate = latestReleaseDateText {
                Text("Son güncelleme: \(releaseDate)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            if let assetName = latestReleaseAssetName {
                Text("Önerilen paket: \(assetName)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }

            HStack(spacing: 8) {
                Button {
                    openWebsite()
                } label: {
                    Label("Sayfada Gör", systemImage: "globe")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                Button {
                    if latestReleaseAssetURL != nil {
                        openReleaseAsset()
                    } else {
                        openDownloadSite()
                    }
                } label: {
                    Label(latestReleaseAssetURL == nil ? "İndir" : "Paketi İndir", systemImage: "arrow.down.circle")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)

                Button {
                    copyToClipboard(quickInstallSource)
                } label: {
                    Label(copiedValue == quickInstallSource ? "Kopyalandı" : "Bağlantıyı Kopyala", systemImage: copiedValue == quickInstallSource ? "checkmark" : "doc.on.doc")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .blue, prominence: 0.16)
    }

    private var telemetryCard: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text("Canlı Telemetri")
                .font(.caption)
                .fontWeight(.semibold)

            Text(demoShellState.telemetryEvents.first?.eventName ?? "Aktif olay yok")
                .font(.caption2)
                .foregroundStyle(.secondary)

            if let latest = demoShellState.telemetryEvents.first,
               let date = parseRunDateValue(latest.occurredAt) {
                Text(relativeDate(for: date))
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(10)
        .seisSidebarCard(accent: .cyan, radius: 10, prominence: 0.08)
    }

    private var routeToolbar: some View {
        HStack(alignment: .center, spacing: 10) {
            VStack(alignment: .leading, spacing: 3) {
                Text("Çalışma Panosu")
                    .font(.title3)
                    .fontWeight(.semibold)
                Text("Rota: \(demoShellState.routeForDisplay)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Picker("Mod", selection: $activePanel) {
                ForEach(SeisAppleNativeShellPanel.allCases) { panel in
                    Label(panel.title, systemImage: panel.systemImage)
                        .tag(panel)
                }
            }
            .pickerStyle(.segmented)
            .controlSize(.small)
            .frame(width: 560)
        }
    }

    private var routeSummaryStrip: some View {
        HStack(spacing: 8) {
            summaryPill("Senaryo", "\(demoShellState.contract.scenarios.count)")
            summaryPill("Kanal", "\(demoShellState.supportedRoutes.count)")
            summaryPill("Geçmiş", "\(recentRuns.count)")
            if let activeRun {
                summaryPill("Durum", activeRun.status == "running" ? "Çalışıyor" : "Hazır")
            } else {
                summaryPill("Durum", "Hazır")
            }
        }
        .padding(.horizontal, 2)
    }

    @ViewBuilder
    private var routeContent: some View {
        switch demoShellState.routeType() {
        case .home, .demo:
            dashboardPanel
        case .scenario:
            if let scenario = selectedScenario {
                scenarioPanel(scenario)
            } else {
                emptyScenarioPanel
            }
        case .results:
            if let run = displayRun {
                resultPanel(run)
            } else {
                emptyScenarioPanel
            }
        case .unsupported:
            unsupportedRoutePanel
        }
    }

    private var dashboardPanel: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("SEIS AGI Native")
                    .font(.title2)
                    .fontWeight(.semibold)

                Spacer()

                Picker("", selection: $selectedShowcaseTab) {
                    Text("Özet").tag(0)
                    Text("Senaryolar").tag(1)
                    Text("Metrikler").tag(2)
                    Text("Yol Haritası").tag(3)
                }
                .pickerStyle(.segmented)
                .controlSize(.small)
                .frame(minWidth: 330, maxWidth: 360)
            }

            switch selectedShowcaseTab {
            case 1:
                if filteredScenarios.isEmpty {
                    Text("Henüz senaryo eklenmedi.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(filteredScenarios.prefix(4), id: \.id) { scenario in
                        scenarioCondensedRow(scenario)
                    }
                }
            case 2:
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], alignment: .leading, spacing: 10) {
                    metricPill("Senaryo", value: "\(demoShellState.contract.scenarios.count)")
                    metricPill("Geçmiş Çalışma", value: "\(recentRuns.count)")
                    metricPill("Canlı Rota", value: "\(demoShellState.supportedRoutes.count)")
                    metricPill("Platform", value: "\(Set(demoShellState.contract.platformTargets).count)")
                }
            case 3:
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(Array(fiveYearMilestones.enumerated()), id: \.offset) { index, milestone in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: 6) {
                                Text(milestone.year)
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                                Text("·")
                                    .foregroundStyle(.tertiary)
                                    .font(.caption2)
                                Text(milestone.title)
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                Spacer()
                                Text("Yıl \(index + 1)")
                                    .font(.caption2.monospacedDigit())
                                    .foregroundStyle(.secondary)
                            }
                            Text(milestone.subtitle)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                        .padding(10)
                        .seisSidebarCard(accent: .indigo, radius: 10, prominence: 0.06)
                    }
                }
            default:
                VStack(alignment: .leading, spacing: 12) {
                    agiSystemMapPanel
                    liveRepositoryIntelligencePanel
                    pluginSkillFabricPanel
                    fullStackDesignSurfacePanel
                    agentCommandCenter
                    releaseReadinessPanel
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Önce repo senaryosunu seçip çalıştırın, sonra SEIS AGI sonucunu tek ekranda görün.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        SeisFlowStepper(steps: ["Repo seç", "Agent çalıştır", "Sonucu gör"], currentStep: routeStep)

                        if let activeRun {
                            HStack {
                                statusBadge(activeRun.status)
                                Text("Son durum: \(runDurationText(activeRun.durationMs))")
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .padding(12)
                    .seisSidebarCard(accent: .cyan, prominence: 0.08)
                }
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .cyan, prominence: 0.06)
    }

    private var agiSystemMapPanel: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("SEIS AGI Repository OS")
                        .font(.headline)
                    Text("Apple-grade macOS yüzeyi: repo intelligence, memory graph, skill foundry ve policy kernel.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Text("Native")
                    .font(.caption2)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Color.accentColor.opacity(0.16), in: Capsule())
                    .foregroundStyle(Color.accentColor)
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 210), spacing: 10)], alignment: .leading, spacing: 10) {
                ForEach(agiLayers) { layer in
                    agiLayerTile(layer)
                }
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .cyan, prominence: 0.08)
    }

    private var liveRepositoryIntelligencePanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Live Repository Intelligence")
                        .font(.headline)
                    Text("SEIS repo durumu, source mix, teknoloji yüzeyi ve quality gate yerel dosyalardan okunur.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Button {
                    refreshRepositoryLiveSignals()
                } label: {
                    Label("Yenile", systemImage: "arrow.clockwise")
                        .labelStyle(.iconOnly)
                }
                .buttonStyle(.bordered)
                .help("Repo intelligence sinyallerini yerel dosyalardan yeniden oku.")
            }

            if repositoryLiveSignals.isEmpty {
                Text("Repo sinyalleri henüz okunmadı.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 170), spacing: 10)], alignment: .leading, spacing: 10) {
                    ForEach(repositoryLiveSignals) { signal in
                        repositorySignalTile(signal)
                    }
                }
            }

            Text("Son tarama: \(lastRepositorySignalRefreshText)")
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding(12)
        .seisSidebarCard(accent: .blue, prominence: 0.08)
    }

    private var pluginSkillFabricPanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Plugin + Skill Fabric")
                        .font(.headline)
                    Text("SEIS eklentileri, becerileri, SSH ve cloud kapıları güvenli capability aileleri olarak okunur.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Button {
                    refreshEcosystemCapabilitySignals()
                } label: {
                    Label("Yenile", systemImage: "arrow.clockwise")
                        .labelStyle(.iconOnly)
                }
                .buttonStyle(.bordered)
                .help("Plugin, skill, SSH ve cloud capability sinyallerini yeniden oku.")
            }

            if ecosystemCapabilitySignals.isEmpty {
                Text("Capability sinyalleri henüz okunmadı.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 170), spacing: 10)], alignment: .leading, spacing: 10) {
                    ForEach(ecosystemCapabilitySignals) { signal in
                        repositorySignalTile(signal)
                    }
                }
            }

            Text("Son capability taraması: \(lastCapabilityRefreshText)")
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding(12)
        .seisSidebarCard(accent: .indigo, prominence: 0.10)
    }

    private var fullStackDesignSurfacePanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Full-Stack Design Surface")
                        .font(.headline)
                    Text("Builder, design, backend, cloud, security ve native platform lane'leri tek ürün yönüne bağlanır.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Text(fullStackDesignLanes.isEmpty ? "Hazırlanıyor" : "\(fullStackDesignLanes.count) lane")
                    .font(.caption2)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Color.teal.opacity(0.16), in: Capsule())
                    .foregroundStyle(Color.teal)
            }

            if fullStackDesignLanes.isEmpty {
                Text("Full-stack lane verisi okunamadı.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                fullStackPublicDemoHandoffBar

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 220), spacing: 10)], alignment: .leading, spacing: 10) {
                    ForEach(fullStackDesignLanes) { lane in
                        fullStackLaneTile(lane)
                    }
                }
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .teal, prominence: 0.08)
    }

    @ViewBuilder
    private var fullStackPublicDemoHandoffBar: some View {
        let lanes = fullStackWebLanes

        if !lanes.isEmpty {
            HStack(spacing: 8) {
                Label("Public Demo", systemImage: "globe")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.primary)

                Spacer(minLength: 8)

                ForEach(lanes) { lane in
                    Button {
                        openFullStackWebLane(lane)
                    } label: {
                        Label(fullStackWebLaneButtonTitle(lane), systemImage: fullStackWebLaneButtonIcon(lane))
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                    .help(lane.deepLink ?? "SEIS web lane")
                }

                Text("No-key")
                    .font(.caption2)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.green.opacity(0.15), in: Capsule())
                    .foregroundStyle(Color.green)
            }
            .padding(8)
            .background(Color.teal.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Public demo handoff, no-key, \(lanes.map(\.title).joined(separator: ", "))")
        }
    }

    private var agentCommandCenter: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("SEIS AGI Command Center")
                        .font(.headline)
                    Text("Memory, skill, gateway ve governance sinyalleri repo AGI runtime içinde birleşir.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                statusBadge(demoShellState.fallbackMode == nil ? "completed" : "running")
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 190), spacing: 10)], alignment: .leading, spacing: 10) {
                ForEach(agentCapabilities) { capability in
                    capabilityTile(capability)
                }
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .purple, prominence: 0.08)
    }

    private var releaseReadinessPanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Website'den İndirilecek Kalite")
                    .font(.headline)
                Spacer()
                if latestReleaseTag != nil {
                    statusBadge("completed")
                } else {
                    statusBadge(releaseLoadFailed ? "idle" : "running")
                }
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 160), spacing: 10)], alignment: .leading, spacing: 10) {
                readinessPill("Installer", value: latestReleaseAssetName ?? "Release bekleniyor", icon: "shippingbox")
                readinessPill("Web", value: "README + release", icon: "globe")
                readinessPill("Deep Link", value: "seisdemo://", icon: "link")
                readinessPill("Güven", value: demoShellState.fallbackMode == nil ? "Rotalar sağlıklı" : "Fallback görünür", icon: "lock.shield")
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .green, prominence: 0.08)
    }

    private func scenarioPanel(_ scenario: SeisDemoNativeShellState.ContractScenario) -> some View {
        let latestRun = latestRunForScenario(scenario.id)

        return VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(scenario.title)
                    .font(.headline)
                Spacer()
                statusBadge(latestRun?.status ?? "idle")
            }

            Text(scenario.summary)
                .font(.caption)
                .foregroundStyle(.secondary)

            Label("Uzman: \(scenario.specialist)", systemImage: "person.crop.circle")
                .font(.caption2)

            if let prompt = scenario.defaultPrompt {
                Text("Örnek prompt")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(prompt)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .padding(10)
                    .seisSidebarCard(accent: .purple, radius: 8, prominence: 0.06)

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
                    runScenario(scenario.id)
                } label: {
                    Label("Çalıştır", systemImage: "play.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)

                Button {
                    openScenario(scenario.id)
                } label: {
                    Label("Tekrar Aç", systemImage: "arrow.counterclockwise.circle")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
            }

            if let latestRun {
                Divider()
                HStack {
                    Label("Sonuçlar: \(runDurationText(latestRun.durationMs))", systemImage: "clock.arrow.circlepath")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Spacer()
                    statusBadge(latestRun.status)
                }
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .purple, prominence: 0.08)
    }

    private func resultPanel(_ run: SeisDemoNativeShellState.DemoRun) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Çalışma Sonucu")
                    .font(.headline)
                Spacer()
                statusBadge(run.status)
            }

            Text(demoShellState.scenarioById(run.scenarioId)?.title ?? run.scenarioId)
                .font(.subheadline)

            HStack(spacing: 8) {
                Label("Süre", systemImage: "clock")
                    .font(.caption)
                Text(runDurationText(run.durationMs))
                    .font(.caption.monospacedDigit())
                    .foregroundStyle(.secondary)
            }

            if !run.steps.isEmpty {
                VStack(alignment: .leading, spacing: 5) {
                    ForEach(Array(run.steps.enumerated()), id: \.offset) { _, step in
                        HStack(spacing: 8) {
                            Image(systemName: step.state == "success" ? "checkmark.circle.fill" : "clock.badge.exclamationmark")
                                .foregroundStyle(step.state == "success" ? .green : .orange)
                            Text(step.name)
                                .font(.caption2)
                            Spacer()
                        }
                    }
                }
                .padding(8)
                .seisSidebarCard(accent: .green, radius: 8, prominence: 0.06)
            }

            Button {
                demoShellState.applyRoute("/demo/\(run.scenarioId)")
            } label: {
                Label("Senaryoya Dön", systemImage: "arrow.uturn.backward.circle")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .disabled(demoShellState.scenarioById(run.scenarioId) == nil)
        }
        .padding(12)
        .seisSidebarCard(accent: .green, prominence: 0.08)
    }

    private var unsupportedRoutePanel: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Rota bulunamadı")
                .font(.headline)
            Text("Desteklenen rotalar: \(demoShellState.supportedRoutes.joined(separator: ", "))")
                .font(.caption)
                .foregroundStyle(.secondary)
            HStack(spacing: 8) {
                Button {
                    demoShellState.applyRoute("/")
                } label: {
                    Label("Ana Sayfa", systemImage: "house")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                Button {
                    demoShellState.applyRoute("/demo")
                } label: {
                    Label("Senaryolar", systemImage: "sparkles")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding(12)
        .seisSidebarCard(accent: .orange, prominence: 0.08)
    }

    private var emptyScenarioPanel: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Seçili senaryo yok")
                .font(.headline)
            Text("Senaryolar listesinden bir seçim yapın veya bir rota açın.")
                .font(.caption)
                .foregroundStyle(.secondary)
            Button("Senaryoları Aç") {
                demoShellState.applyRoute("/demo")
            }
            .buttonStyle(.borderedProminent)
        }
        .padding(12)
        .seisSidebarCard(accent: .cyan, prominence: 0.08)
    }

    private func scenarioCondensedRow(_ scenario: SeisDemoNativeShellState.ContractScenario) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(scenario.title)
                    .font(.caption)
                    .fontWeight(.semibold)
                Text(scenario.summary)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            Spacer()
            Button {
                runScenario(scenario.id)
            } label: {
                Label("Başlat", systemImage: "play.fill")
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.small)
        }
        .padding(10)
        .seisSidebarCard(accent: .purple, radius: 10, prominence: 0.07)
    }

    private func scenarioRow(_ scenario: SeisDemoNativeShellState.ContractScenario) -> some View {
        Button {
            openScenario(scenario.id)
        } label: {
            HStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(alignment: .top, spacing: 8) {
                        Text(scenario.title)
                            .font(.caption)
                            .lineLimit(1)
                        Spacer()
                        if selectedScenarioId == scenario.id {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(.green)
                        }
                    }
                    Text(scenario.summary)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                    Text("Uzman: \(scenario.specialist)")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }

                VStack(spacing: 6) {
                    Button {
                        runScenario(scenario.id)
                    } label: {
                        Image(systemName: "play.fill")
                    }
                    .buttonStyle(.borderedProminent)
                    .labelStyle(.iconOnly)
                    .font(.caption2)
                }
            }
            .padding(10)
            .seisSidebarCard(
                accent: selectedScenarioId == scenario.id ? .blue : .purple,
                radius: 10,
                prominence: selectedScenarioId == scenario.id ? 0.18 : 0.07
            )
        }
        .buttonStyle(.plain)
    }

    private func agiLayerTile(_ layer: AGILayer) -> some View {
        SeisSignalTile(
            title: layer.title,
            signal: layer.signal,
            detail: layer.description,
            icon: layer.icon,
            tone: layer.tone
        )
    }

    private func repositorySignalTile(_ signal: RepositoryLiveSignal) -> some View {
        SeisSignalTile(
            title: signal.value,
            detail: signal.detail,
            icon: signal.icon,
            tone: signal.tone,
            eyebrow: signal.title,
            iconSize: 28,
            detailLineLimit: 2
        )
    }

    private func fullStackLaneTile(_ lane: FullStackDesignLane) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            SeisSignalTile(
                title: lane.title,
                signal: lane.badge,
                detail: fullStackLaneDetail(lane),
                icon: lane.icon,
                tone: lane.tone
            )

            #if os(macOS)
            if hasFullStackWebLane(lane) {
                Button {
                    openFullStackWebLane(lane)
                } label: {
                    Label("Web Lane Aç", systemImage: "arrow.up.right.square")
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
                .help(lane.deepLink ?? "SEIS web lane")
                .accessibilityLabel("\(lane.title) web lane aç")
            }
            #endif
        }
    }

    private func fullStackLaneDetail(_ lane: FullStackDesignLane) -> String {
        guard let deepLink = lane.deepLink, !deepLink.isEmpty else {
            return lane.intent
        }

        return "\(lane.intent)\nWeb lane: \(deepLink)"
    }

    private var fullStackWebLanes: [FullStackDesignLane] {
        fullStackDesignLanes.filter { hasFullStackWebLane($0) }
    }

    private func hasFullStackWebLane(_ lane: FullStackDesignLane) -> Bool {
        fullStackWebLaneRoute(lane) != nil
    }

    private func fullStackWebLaneRoute(_ lane: FullStackDesignLane) -> SeisPublicDemoLaneRoute? {
        guard let deepLink = lane.deepLink?.trimmingCharacters(in: .whitespacesAndNewlines),
              let route = SeisPublicDemoLaneRoute(deepLink: deepLink),
              route.isAllowedPublicDemoLane else {
            return nil
        }

        return route
    }

    private func fullStackWebLaneButtonTitle(_ lane: FullStackDesignLane) -> String {
        if lane.id == "website-ai-platform" {
            return "Website"
        }
        if lane.id == "ubuntu-web-desktop" {
            return "Ubuntu"
        }
        return lane.title
    }

    private func fullStackWebLaneButtonIcon(_ lane: FullStackDesignLane) -> String {
        if lane.id == "website-ai-platform" {
            return "globe"
        }
        if lane.id == "ubuntu-web-desktop" {
            return "display"
        }
        return "arrow.up.right.square"
    }

    private func capabilityTile(_ capability: AgentCapability) -> some View {
        SeisSignalTile(
            title: capability.title,
            signal: capability.status,
            detail: capability.description,
            icon: capability.icon,
            tone: capability.tone
        )
    }

    private func readinessPill(_ title: String, value: String, icon: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundStyle(Color.accentColor)
                .frame(width: 18)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Text(value)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .lineLimit(1)
            }
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .seisSidebarCard(accent: .cyan, radius: 10, prominence: 0.06)
    }

    private func routeChip(_ route: String) -> some View {
        Button {
            quickRouteText = route
            applyQuickRoute()
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
            .seisSidebarPill(accent: .cyan, prominence: 0.08)
        }
        .buttonStyle(.plain)
    }

    private func summaryPill(_ title: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.caption)
                .fontWeight(.semibold)
                .lineLimit(1)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .seisSidebarPill(accent: .blue, prominence: 0.07)
    }

    private func metricPill(_ title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.caption)
                .fontWeight(.semibold)
                .lineLimit(1)
        }
        .padding(10)
        .seisSidebarCard(accent: .cyan, radius: 10, prominence: 0.07)
    }

    private func infoBadge(_ title: String, value: String, tone: Color) -> some View {
        HStack(spacing: 6) {
            Image(systemName: "chart.bar.fill")
                .foregroundStyle(tone)
            VStack(alignment: .leading, spacing: 1) {
                Text(title)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Text(value)
                    .font(.caption2)
                    .lineLimit(1)
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
        .seisSidebarPill(accent: tone, prominence: 0.11)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func statusBadge(_ status: String) -> some View {
        let normalized = status.lowercased()
        let title = normalized == "completed" ? "Tamamlandı" : (normalized == "running" ? "Çalışıyor" : "Hazır")
        let tint: Color = normalized == "completed" ? .green : (normalized == "running" ? .orange : .secondary)
        return Text(title)
            .font(.caption2)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(tint.opacity(0.16), in: Capsule())
            .foregroundStyle(tint)
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
            "questionmark"
        }
    }

    private func startQuickDemo() {
        guard let scenarioId = defaultScenarioId else {
            quickRouteMessage = "Çalıştırılacak senaryo bulunamadı."
            return
        }
        quickRouteMessage = nil
        runScenario(scenarioId)
    }

    private func applyQuickRoute() {
        let normalized = demoShellState.normalizedRoute(quickRouteText)
        guard !normalized.isEmpty else {
            quickRouteMessage = nil
            return
        }

        quickRouteMessage = nil
        demoShellState.applyRoute(normalized)
        quickRouteText = ""
        activePanel = .demo

        if case .unsupported = demoShellState.routeType(for: normalized) {
            quickRouteMessage = "Bu rota desteklenmiyor."
        }
    }

    private func openScenario(_ scenarioId: String) {
        guard demoShellState.scenarioById(scenarioId) != nil else {
            quickRouteMessage = "Senaryo bulunamadı."
            return
        }
        selectedScenarioId = scenarioId
        demoShellState.applyRoute("/demo/\(scenarioId)")
        activePanel = .demo
        quickRouteMessage = nil
    }

    private func runScenario(_ scenarioId: String) {
        guard demoShellState.scenarioById(scenarioId) != nil else {
            quickRouteMessage = "Senaryo bulunamadı."
            return
        }
        selectedScenarioId = scenarioId
        demoShellState.startScenario(scenarioId)
        activePanel = .demo
    }

    private func openDownloadSite() {
        guard let url = URL(string: releaseWebsiteURL) else {
            quickRouteMessage = "Website açılamadı."
            return
        }

        #if os(macOS)
        NSWorkspace.shared.open(url)
        #else
        quickRouteMessage = "macOS dışı desteklenmiyor."
        #endif
    }

    private func openReleaseAsset() {
        guard let url = URL(string: latestReleaseAssetURL ?? "") else {
            quickRouteMessage = "İndirme linki geçersiz."
            return
        }

        #if os(macOS)
        NSWorkspace.shared.open(url)
        #else
        quickRouteMessage = "macOS dışı desteklenmiyor."
        #endif
    }

    private func openWebsite() {
        guard let url = URL(string: websiteLandingURL) else {
            quickRouteMessage = "Website açılamadı."
            return
        }

        #if os(macOS)
        NSWorkspace.shared.open(url)
        #else
        quickRouteMessage = "macOS dışı desteklenmiyor."
        #endif
    }

    private func openFullStackWebLane(_ lane: FullStackDesignLane) {
        #if os(macOS)
        guard let url = fullStackWebLaneURL(lane) else {
            quickRouteMessage = "Web lane açılamadı."
            return
        }

        NSWorkspace.shared.open(url)
        quickRouteMessage = "\(lane.title) web lane açıldı."
        #else
        quickRouteMessage = "macOS dışı desteklenmiyor."
        #endif
    }

    private func fullStackWebLaneURL(_ lane: FullStackDesignLane) -> URL? {
        guard let route = fullStackWebLaneRoute(lane) else {
            return nil
        }

        let repositoryRootURL = URL(fileURLWithPath: SeisRepositoryRootResolver.resolve(preferredPath: repositoryPath))
        return route.fileURL(repositoryRoot: repositoryRootURL)
    }

    private func copyPrompt(_ text: String, scenarioId: String) {
        #if os(macOS)
        let board = NSPasteboard.general
        board.clearContents()
        board.setString(text, forType: .string)
        #endif
        copiedScenarioId = scenarioId
        Task { @MainActor in
            try? await Task.sleep(for: .seconds(1))
            if copiedScenarioId == scenarioId {
                copiedScenarioId = nil
            }
        }
    }

    private func copyToClipboard(_ text: String) {
        guard !text.isEmpty else {
            quickRouteMessage = "Kopyalanacak içerik bulunamadı."
            return
        }

        #if os(macOS)
        let board = NSPasteboard.general
        board.clearContents()
        board.setString(text, forType: .string)
        #endif
        copiedValue = text
        quickRouteMessage = "Bağlantı panoya kopyalandı."

        Task { @MainActor in
            try? await Task.sleep(for: .seconds(1))
            if copiedValue == text {
                copiedValue = nil
            }
        }
    }

    private func refreshRepositoryLiveSignals() {
        if let snapshot = loadRepositorySurfaceSnapshot() {
            repositoryLiveSignals = snapshot.repositorySignals.map(repositorySignal)
            lastRepositorySignalRefreshText = "launcher snapshot"
            return
        }

        let branch = readGitBranchName()
        let languageReport = decodeJSON(
            LanguageDistributionReport.self,
            from: repositoryFileURL("reports/language-distribution.json")
        )
        let technologyReport = decodeJSON(
            TechnologyStackReport.self,
            from: repositoryFileURL("reports/seis-technology-stack.json")
        )
        let packageText = readTextFile("package.json") ?? ""
        let hasQualityGate = packageText.contains("\"quality\"") || packageText.contains("\"quality:governance\"")
        let hasNativeShell = FileManager.default.fileExists(
            atPath: repositoryFileURL("packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/SeisAppleNativeShellFreshDemoHomeView.swift").path
        )

        let swiftPercent = languageReport?.languages.first(where: { $0.language == "Swift" })?.percent
        let jsPercent = languageReport?.summary.javascriptPercent
        let targetStatus = languageReport?.summary.targetStatus.replacingOccurrences(of: "_", with: " ") ?? "bilinmiyor"
        let sourceLanguageCount = technologyReport?.summary.sourceLanguageCount
        let technologyCount = technologyReport?.summary.ecosystemTechnologyCount
        let technologyStackFreshness = fileFreshnessText("reports/seis-technology-stack.json")

        repositoryLiveSignals = [
            RepositoryLiveSignal(
                title: "Branch",
                value: branch ?? "Bilinmiyor",
                detail: branch == "main" ? "Main-only çalışma modeli korunuyor." : "Ana dal dışı veya HEAD okunamadı.",
                icon: "point.topleft.down.curvedto.point.bottomright.up",
                tone: branch == "main" ? .green : .orange
            ),
            RepositoryLiveSignal(
                title: "Source Mix",
                value: swiftPercent.map { "Swift \(percentText($0))" } ?? "Rapor yok",
                detail: jsPercent.map { "JavaScript \(percentText($0)) · hedef \(targetStatus)" } ?? "language-distribution raporu okunamadı.",
                icon: "chart.pie",
                tone: .blue
            ),
            RepositoryLiveSignal(
                title: "Tech Stack",
                value: sourceLanguageCount.map { "\($0) dil" } ?? "Rapor yok",
                detail: technologyCount.map { "\($0) teknoloji · \(technologyStackFreshness)" } ?? "technology-stack raporu okunamadı.",
                icon: "square.stack.3d.up",
                tone: .purple
            ),
            RepositoryLiveSignal(
                title: "Quality Gate",
                value: hasQualityGate ? "Tanımlı" : "Eksik",
                detail: hasQualityGate ? "npm run quality repo-wide doğrulama kapısı olarak mevcut." : "package.json quality script içermiyor.",
                icon: "checkmark.seal",
                tone: hasQualityGate ? .green : .orange
            ),
            RepositoryLiveSignal(
                title: "Native App",
                value: hasNativeShell ? "Aktif" : "Eksik",
                detail: hasNativeShell ? "Fresh AGI shell kaynak yüzeyi yerel repoda mevcut." : "Native shell dosyası bulunamadı.",
                icon: "macwindow",
                tone: hasNativeShell ? .green : .orange
            )
        ]

        lastRepositorySignalRefreshText = relativeDate(for: Date())
    }

    private func refreshEcosystemCapabilitySignals() {
        if let snapshot = loadRepositorySurfaceSnapshot() {
            ecosystemCapabilitySignals = snapshot.ecosystemSignals.map(repositorySignal)
            fullStackDesignLanes = snapshot.fullStackDesignLanes.map(fullStackDesignLane)
            lastCapabilityRefreshText = "launcher snapshot"
            return
        }

        let lanesReport = decodeJSON(
            PluginCapabilityLanesReport.self,
            from: repositoryFileURL("content/development/plugin-capability-lanes.json")
        )
        let inventoryReport = decodeJSON(
            PluginInventoryReport.self,
            from: repositoryFileURL("content/development/requested-plugin-inventory.json")
        )
        let sshAccessModel = decodeJSON(
            SSHAccessModelReport.self,
            from: repositoryFileURL("deploy/seis-ssh-access-model.json")
        )
        let cloudEnvironment = decodeJSON(
            CloudEnvironmentReport.self,
            from: repositoryFileURL("deploy/cloud-environment.json")
        )
        let localSkillCount = countLocalFiles(named: "SKILL.md", under: "plugins")
        let pluginManifestCount = countLocalFiles(named: "plugin.json", under: "plugins")
        let uniquePluginCount = inventoryReport?.summary.uniquePlugins ?? lanesReport?.summary.uniquePlugins
        let laneCount = lanesReport?.summary.laneCount
        let totalAssignments = lanesReport?.summary.totalAssignments
        let activeAlias = sshAccessModel?.visibility?.activeAliases.first ?? sshAccessModel?.defaultVisibleAlias
        let sshProfileCount = sshAccessModel?.profiles.count
        let deploySecretCount = cloudEnvironment?.environment.secrets.count
        let deployRequirementCount = cloudEnvironment?.environment.requiredAtDeployTime.count

        ecosystemCapabilitySignals = [
            RepositoryLiveSignal(
                title: "Submitted Plugins",
                value: uniquePluginCount.map { "\($0) plugin" } ?? "Rapor yok",
                detail: totalAssignments.map { "\($0) lane ataması · aktivasyon sadece ilgili görevde." } ?? "requested-plugin inventory okunamadı.",
                icon: "shippingbox",
                tone: .blue
            ),
            RepositoryLiveSignal(
                title: "Capability Lanes",
                value: laneCount.map { "\($0) lane" } ?? "Rapor yok",
                detail: lanesReport.map { _ in "Builder, design, backend, cloud, security ve AI aileleri yönlendirilebilir." } ?? "plugin-capability-lanes raporu okunamadı.",
                icon: "rectangle.3.group",
                tone: .indigo
            ),
            RepositoryLiveSignal(
                title: "Local Skills",
                value: "\(localSkillCount) skill",
                detail: "\(pluginManifestCount) plugin manifesti ile repo içi SEIS becerileri ürün yüzeyine bağlanıyor.",
                icon: "wand.and.stars",
                tone: .purple
            ),
            RepositoryLiveSignal(
                title: "SEIS-SSH",
                value: activeAlias ?? "Alias yok",
                detail: sshProfileCount.map { "\($0) profil · tek görünen cloud alias modeli." } ?? "SSH access modeli okunamadı.",
                icon: "terminal",
                tone: .green
            ),
            RepositoryLiveSignal(
                title: "Cloud Gate",
                value: cloudEnvironment?.remote ?? "Remote yok",
                detail: deploySecretCount.map { "\($0) secret scope · \(deployRequirementCount ?? 0) deploy requirement." } ?? "Cloud environment raporu okunamadı.",
                icon: "cloud",
                tone: .cyan
            ),
            RepositoryLiveSignal(
                title: "Auth UX",
                value: "Port 1455",
                detail: "Ekran görüntüsündeki callback çakışması oturum kapısı ve API-key fallback olarak tasarıma taşındı.",
                icon: "key.horizontal",
                tone: .orange
            ),
            RepositoryLiveSignal(
                title: "Codex Control",
                value: "Chrome + Mac",
                detail: "Tarayıcı kontrolü ve kilitliyken kullanım ayrı güvenlik izinleri olarak görünür kalmalı.",
                icon: "switch.2",
                tone: .teal
            )
        ]

        let preferredLaneIds = [
            "builder-and-prototyping",
            "creative-production-and-design",
            "backend-data-and-api",
            "cloud-devops-and-release",
            "security-quality-and-governance",
            "platform-native-and-polyglot",
            "ai-workflow-docs-and-knowledge"
        ]
        let definitions = lanesReport?.laneDefinitions ?? []
        let selectedDefinitions = preferredLaneIds.compactMap { laneId in
            definitions.first { $0.id == laneId }
        }

        fullStackDesignLanes = selectedDefinitions.isEmpty
            ? defaultFullStackDesignLanes()
            : selectedDefinitions.map { lane in
                FullStackDesignLane(
                    id: lane.id,
                    title: lane.label,
                    badge: "\(lane.qualityCommands?.count ?? 0) kalite komutu",
                    intent: lane.intent,
                    deepLink: nil,
                    icon: laneIcon(for: lane.id),
                    tone: laneTone(for: lane.id)
                )
            }

        lastCapabilityRefreshText = relativeDate(for: Date())
    }

    private func loadRepositorySurfaceSnapshot() -> SeisRepositorySurfaceSnapshot? {
        guard let snapshotURL = SeisRepositoryRootResolver.repositorySnapshotURL() else {
            return nil
        }

        return decodeJSON(SeisRepositorySurfaceSnapshot.self, from: snapshotURL)
    }

    private func repositorySignal(_ signal: SeisRepositorySurfaceSnapshot.Signal) -> RepositoryLiveSignal {
        RepositoryLiveSignal(
            title: signal.title,
            value: signal.value,
            detail: signal.detail,
            icon: signal.icon,
            tone: signal.color
        )
    }

    private func fullStackDesignLane(_ lane: SeisRepositorySurfaceSnapshot.Lane) -> FullStackDesignLane {
        FullStackDesignLane(
            id: lane.id,
            title: lane.title,
            badge: lane.badge,
            intent: lane.intent,
            deepLink: lane.deepLink,
            icon: lane.icon,
            tone: lane.color
        )
    }

    private func rememberRoute(_ route: String) {
        let normalized = demoShellState.normalizedRoute(route)
        if normalized.isEmpty || normalized == "/" {
            return
        }

        routeHistory.removeAll { $0 == normalized }
        routeHistory.insert(normalized, at: 0)
        if routeHistory.count > 10 {
            routeHistory = Array(routeHistory.prefix(10))
        }
    }

    private func syncSelectionFromRoute(_ route: String) {
        if case let .scenario(id) = demoShellState.routeType(for: route) {
            selectedScenarioId = id
            return
        }
        if selectedScenarioId == nil, let first = demoShellState.contract.scenarios.first {
            selectedScenarioId = first.id
        }
    }

    private func loadReleaseMetadata() {
        guard let releaseAPI = URL(string: releasesAPIURL) else {
            releaseLoadFailed = true
            return
        }

        Task {
            do {
                var request = URLRequest(url: releaseAPI)
                request.setValue("SeisMacDemo", forHTTPHeaderField: "User-Agent")
                let (data, response) = try await URLSession.shared.data(for: request)
                guard let httpResponse = response as? HTTPURLResponse,
                      (200 ... 299).contains(httpResponse.statusCode) else {
                    await MainActor.run {
                        releaseLoadFailed = true
                    }
                    return
                }

                let decoder = JSONDecoder()
                decoder.keyDecodingStrategy = .convertFromSnakeCase
                let payload = try decoder.decode(ReleaseMetadata.self, from: data)

                await MainActor.run {
                    latestReleaseTag = payload.tagName
                    latestReleaseDateText = payload.prettyPublishedDate
                    latestReleaseAssetName = payload.suggestedMacAsset?.name
                    latestReleaseAssetURL = payload.suggestedMacAsset?.browserDownloadUrl
                    releaseLoadFailed = false
                }
            } catch {
                await MainActor.run {
                    releaseLoadFailed = true
                }
            }
        }
    }

    private func latestRunForScenario(_ scenarioId: String) -> SeisDemoNativeShellState.DemoRun? {
        recentRuns.first { $0.scenarioId == scenarioId }
    }

    private func parseRunDate(_ run: SeisDemoNativeShellState.DemoRun) -> Date? {
        if let parsed = ISO8601DateParserFreshDemo.date(from: run.startedAt) {
            return parsed
        }
        return ISO8601DateParserFallbackFreshDemo.date(from: run.startedAt)
    }

    private func parseRunDateValue(_ value: String) -> Date? {
        if let parsed = ISO8601DateParserFreshDemo.date(from: value) {
            return parsed
        }
        return ISO8601DateParserFallbackFreshDemo.date(from: value)
    }

    private func runDurationText(_ ms: Int) -> String {
        if ms < 1000 {
            return "\(ms) ms"
        }
        return String(format: "%.2fs", Double(ms) / 1000)
    }

    private func relativeDate(for date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        return formatter.localizedString(for: date, relativeTo: Date())
    }

    private func repositoryFileURL(_ relativePath: String) -> URL {
        URL(fileURLWithPath: SeisRepositoryRootResolver.resolve(preferredPath: repositoryPath))
            .appendingPathComponent(relativePath)
    }

    private func readTextFile(_ relativePath: String) -> String? {
        try? String(contentsOf: repositoryFileURL(relativePath), encoding: .utf8)
    }

    private func decodeJSON<T: Decodable>(_ type: T.Type, from url: URL) -> T? {
        guard let data = try? Data(contentsOf: url) else {
            return nil
        }
        return try? JSONDecoder().decode(type, from: data)
    }

    private func countLocalFiles(named fileName: String, under relativePath: String) -> Int {
        let root = repositoryFileURL(relativePath)
        guard let enumerator = FileManager.default.enumerator(
            at: root,
            includingPropertiesForKeys: [.isRegularFileKey],
            options: []
        ) else {
            return 0
        }

        var count = 0
        for case let fileURL as URL in enumerator where fileURL.lastPathComponent == fileName {
            count += 1
        }
        return count
    }

    private func laneIcon(for laneId: String) -> String {
        switch laneId {
        case "builder-and-prototyping":
            return "hammer"
        case "creative-production-and-design":
            return "paintpalette"
        case "backend-data-and-api":
            return "server.rack"
        case "cloud-devops-and-release":
            return "icloud.and.arrow.up"
        case "security-quality-and-governance":
            return "checkmark.shield"
        case "platform-native-and-polyglot":
            return "desktopcomputer.and.macbook"
        case "ai-workflow-docs-and-knowledge":
            return "brain.head.profile"
        default:
            return "square.stack.3d.up"
        }
    }

    private func laneTone(for laneId: String) -> Color {
        switch laneId {
        case "builder-and-prototyping":
            return .blue
        case "creative-production-and-design":
            return .pink
        case "backend-data-and-api":
            return .purple
        case "cloud-devops-and-release":
            return .cyan
        case "security-quality-and-governance":
            return .green
        case "platform-native-and-polyglot":
            return .orange
        case "ai-workflow-docs-and-knowledge":
            return .indigo
        default:
            return .secondary
        }
    }

    private func defaultFullStackDesignLanes() -> [FullStackDesignLane] {
        [
            FullStackDesignLane(
                id: "builder-and-prototyping",
                title: "Builder and prototyping",
                badge: "fallback",
                intent: "Create or iterate app surfaces, prototypes, landing systems, and runnable demos.",
                deepLink: nil,
                icon: "hammer",
                tone: .blue
            ),
            FullStackDesignLane(
                id: "creative-production-and-design",
                title: "Creative production and design",
                badge: "fallback",
                intent: "Shape UI direction, visual assets, design systems, campaign creative, and media outputs.",
                deepLink: nil,
                icon: "paintpalette",
                tone: .pink
            ),
            FullStackDesignLane(
                id: "backend-data-and-api",
                title: "Backend, data, and API",
                badge: "fallback",
                intent: "Model data, inspect schemas, build API integrations, and maintain backend execution layers.",
                deepLink: nil,
                icon: "server.rack",
                tone: .purple
            ),
            FullStackDesignLane(
                id: "cloud-devops-and-release",
                title: "Cloud, DevOps, and release",
                badge: "fallback",
                intent: "Coordinate deploy targets, CI/CD, hosting, infrastructure, incidents, and release safety.",
                deepLink: nil,
                icon: "icloud.and.arrow.up",
                tone: .cyan
            )
        ]
    }

    private func readGitBranchName() -> String? {
        guard let head = readTextFile(".git/HEAD")?.trimmingCharacters(in: .whitespacesAndNewlines),
              !head.isEmpty else {
            return nil
        }

        if head.hasPrefix("ref:") {
            let ref = head
                .replacingOccurrences(of: "ref:", with: "")
                .trimmingCharacters(in: .whitespacesAndNewlines)
            return ref.split(separator: "/").last.map(String.init)
        }

        return "detached"
    }

    private func percentText(_ value: Double) -> String {
        String(format: "%.1f%%", value)
    }

    private func fileFreshnessText(_ relativePath: String) -> String {
        let url = repositoryFileURL(relativePath)
        guard let attributes = try? FileManager.default.attributesOfItem(atPath: url.path),
              let modifiedAt = attributes[.modificationDate] as? Date else {
            return "tarih yok"
        }
        return relativeDate(for: modifiedAt)
    }

    private struct ReleaseMetadata: Decodable {
        let tagName: String
        let publishedAt: String?
        let assets: [ReleaseAsset]?

        var suggestedMacAsset: ReleaseAsset? {
            assets?.first { asset in
                let fileName = asset.name.lowercased()
                return fileName.hasSuffix(".dmg") || fileName.hasSuffix(".pkg") || fileName.hasSuffix(".zip")
            }
        }

        var prettyPublishedDate: String? {
            guard let publishedAt else {
                return nil
            }
            guard let date = ISO8601DateParserFreshDemo.date(from: publishedAt) ??
                ISO8601DateParserFallbackFreshDemo.date(from: publishedAt) else {
                return nil
            }

            let formatter = DateFormatter()
            formatter.dateStyle = .short
            formatter.timeStyle = .none
            return formatter.string(from: date)
        }
    }

    private struct ReleaseAsset: Decodable {
        let name: String
        let browserDownloadUrl: String?
    }
}

private enum ISO8601DateParserFreshDemo {
    static func date(from value: String) -> Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: value) ?? ISO8601DateFormatter().date(from: value)
    }
}

private enum ISO8601DateParserFallbackFreshDemo {
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
