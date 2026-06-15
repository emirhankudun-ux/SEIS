import Foundation
import OSLog
import SwiftUI

@MainActor
final class SeisDemoNativeShellState: NSObject, ObservableObject {
    struct TelemetryRecord: Identifiable, Codable, Equatable {
        let id: String
        let eventName: String
        let eventId: String
        let occurredAt: String
        let route: String
        let source: String
        let runId: String?
        let details: String

        init(
            id: String = UUID().uuidString,
            eventName: String,
            eventId: String = UUID().uuidString,
            occurredAt: String,
            route: String,
            source: String,
            runId: String?,
            details: String
        ) {
            self.id = id
            self.eventName = eventName
            self.eventId = eventId
            self.occurredAt = occurredAt
            self.route = route
            self.source = source
            self.runId = runId
            self.details = details
        }
    }

    struct DemoStep: Codable, Equatable {
        let name: String
        let state: String
        let at: String
    }

    struct DemoRun: Identifiable, Codable, Equatable {
        let id: String
        let scenarioId: String
        let status: String
        let durationMs: Int
        let startedAt: String
        let completedAt: String?
        let steps: [DemoStep]
    }

    struct ContractRoute: Codable, Equatable {
        let path: String
        let view: String
        let title: String
        let description: String?
    }

    struct ContractScenario: Codable, Equatable {
        let id: String
        let title: String
        let summary: String
        let specialist: String
        let defaultPrompt: String?
        let steps: [String]?
    }

    struct ContractEvent: Codable, Equatable {
        let name: String
        let requiredFields: [String]?
        let description: String?
    }

    struct SharedContract: Codable, Equatable {
        let contractVersion: String
        let contractName: String
        let platformTargets: [String]
        let routes: [ContractRoute]
        let scenarios: [ContractScenario]
        let analyticsEvents: [ContractEvent]
    }

    enum FallbackMode: Equatable {
        case contractUnavailable(String)
        case unsupportedRoute(String)

        var title: String {
            switch self {
            case .contractUnavailable:
                "Contract unavailable"
            case .unsupportedRoute:
                "Route is not defined"
            }
        }

        func message(for contract: SharedContract) -> String {
            switch self {
            case let .contractUnavailable(reason):
                "Shared contract could not be loaded. Using fallback contract. Reason: \(reason)"
            case let .unsupportedRoute(route):
                "\(route) route is not in shared route map. Using local fallback screens."
            }
        }
    }

    enum DemoRouteKind {
        case home
        case demo
        case scenario(String)
        case results(String)
        case unsupported
    }

    static let fallbackContract = SharedContract(
        contractVersion: "1.0.0",
        contractName: "SEIS Demo Shared Contract",
        platformTargets: ["iOS", "macOS", "web"],
        routes: [
            .init(path: "/", view: "home", title: "Home", description: "Landing surface and status."),
            .init(path: "/demo", view: "demo", title: "Demo", description: "Scenario list and launch."),
            .init(path: "/demo/:scenario", view: "scenario", title: "Scenario", description: "Scenario detail and actions."),
            .init(path: "/results/:runId", view: "results", title: "Results", description: "Run report and timeline.")
        ],
        scenarios: [
            .init(
                id: "governance-router",
                title: "Governance Routing + Specialist Dispatch",
                summary: "Checks governance and dispatches specialist lanes.",
                specialist: "AI Policy",
                defaultPrompt: "Run governance and specialist readiness checks.",
                steps: [
                    "Read and validate governance inputs",
                    "Resolve candidate specialist lanes",
                    "Generate policy-aligned readiness report"
                ]
            ),
            .init(
                id: "pipeline-speed",
                title: "Pipeline Speed Demo",
                summary: "Profiles route latency and quality gates.",
                specialist: "Ops/Quality",
                defaultPrompt: "Measure start-to-result latency for the route.",
                steps: [
                    "Initialize route tracking",
                    "Execute quality checks",
                    "Build performance breakdown"
                ]
            ),
            .init(
                id: "agent-orchestration",
                title: "Agent Orchestration Scenario",
                summary: "Runs multi-lane specialist request flow and records conversion milestones.",
                specialist: "SEIS Agent",
                defaultPrompt: "Simulate specialist orchestration for a feature request.",
                steps: [
                    "Create dispatch request",
                    "Route to selected specialists",
                    "Consolidate artifact outputs"
                ]
            )
        ],
        analyticsEvents: [
            .init(name: "seis_demo_cta_click", requiredFields: ["event_id", "occurred_at", "session_id", "route", "details"], description: nil),
            .init(name: "seis_demo_started", requiredFields: ["event_id", "occurred_at", "session_id", "route", "run_id", "details"], description: nil),
            .init(name: "seis_demo_step", requiredFields: ["event_id", "occurred_at", "session_id", "route", "run_id", "details"], description: nil),
            .init(name: "seis_demo_specialist_used", requiredFields: ["event_id", "occurred_at", "session_id", "route", "run_id", "details"], description: nil),
            .init(name: "seis_demo_error", requiredFields: ["event_id", "occurred_at", "session_id", "route", "details"], description: nil)
        ]
    )

    @Published var currentRoute: String
    @Published private(set) var contract: SharedContract
    @Published var fallbackMode: FallbackMode?
    @Published private(set) var activeRunId: String?
    @Published private(set) var runs: [String: DemoRun]
    @Published var telemetryEvents: [TelemetryRecord]

    let sessionId: String
    private let logger = Logger(
        subsystem: "com.seis.demo-native",
        category: "shell"
    )

    private var knownEvents: Set<String> {
        Set(contract.analyticsEvents.map(\.name))
    }

    private var isoFormatter: ISO8601DateFormatter {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }

    override init() {
        sessionId = UUID().uuidString
        currentRoute = "/"
        contract = Self.fallbackContract
        fallbackMode = nil
        activeRunId = nil
        runs = [:]
        telemetryEvents = []

        super.init()
        loadSharedContract()
    }

    var routeForDisplay: String {
        currentRoute
    }

    var supportedRoutes: [String] {
        contract.routes.map(\.path)
    }

    var isSupportedRoute: Bool {
        isSupportedRoute(currentRoute)
    }

    var activeRun: DemoRun? {
        activeRunId.flatMap { runs[$0] }
    }

    func normalizedRoute(_ value: String) -> String {
        let trimmed = value
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "#", with: "")

        if trimmed.isEmpty || trimmed == "/" {
            return "/"
        }

        let withoutQuery: String
        if let firstQuery = trimmed.firstIndex(of: "?") {
            withoutQuery = String(trimmed[..<firstQuery])
        } else {
            withoutQuery = trimmed
        }

        var route = withoutQuery
        if !route.hasPrefix("/") {
            route = "/\(route)"
        }

        if route.count > 1 && route.hasSuffix("/") {
            route = String(route.dropLast())
        }

        while route.contains("//") {
            route = route.replacingOccurrences(of: "//", with: "/")
        }

        return route.isEmpty ? "/" : route
    }

    func routeFromIncomingURL(_ url: URL) -> String {
        let scheme = url.scheme?.lowercased() ?? ""
        var segments: [String] = []

        let normalizedPath = normalizedRoute(url.path)
        let pathSegments = normalizedPath == "/" ? [] : normalizedPath.split(separator: "/").map(String.init)
        let fragmentSegments = extractRouteSegments(from: url.fragment ?? "")

        if scheme == "seisdemo" {
            if let host = url.host, !host.isEmpty {
                segments.append(host)
            }
            segments.append(contentsOf: pathSegments)
            segments.append(contentsOf: fragmentSegments)
        } else {
            if normalizedPath != "/" {
                segments.append(contentsOf: pathSegments)
            }
            if !fragmentSegments.isEmpty {
                segments.append(contentsOf: fragmentSegments)
            }
        }

        let route = "/\(segments.joined(separator: "/"))"
        return normalizedRoute(route)
    }

    func extractRouteSegments(from route: String) -> [String] {
        let normalized = normalizedRoute(route)
        return normalized == "/" ? [] : normalized.split(separator: "/").map(String.init)
    }

    func routeType(for route: String? = nil) -> DemoRouteKind {
        let value = normalizedRoute(route ?? currentRoute)

        if value == "/" {
            return .home
        }

        if value == "/demo" {
            return .demo
        }

        if let scenario = extractRouteParameter(from: value, prefix: "/demo/") {
            return .scenario(scenario)
        }

        if let runId = extractRouteParameter(from: value, prefix: "/results/") {
            return .results(runId)
        }

        return .unsupported
    }

    func scenarioById(_ id: String) -> ContractScenario? {
        contract.scenarios.first(where: { $0.id == id })
    }

    func run(for runId: String) -> DemoRun? {
        runs[runId]
    }

    func loadSharedContract() {
        guard let resourceURL = contractResourceURL() else {
            contract = Self.fallbackContract
            fallbackMode = .contractUnavailable("contract resource missing")
            return
        }

        do {
            let data = try Data(contentsOf: resourceURL)
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            let loaded = try decoder.decode(SharedContract.self, from: data)
            contract = loaded
            if fallbackMode != nil {
                fallbackMode = nil
            }
        } catch {
            fallbackMode = .contractUnavailable("Contract parse failed: \(error.localizedDescription)")
            contract = Self.fallbackContract
        }
    }

    private func contractResourceURL() -> URL? {
        Bundle.main.url(forResource: "seis-demo-contract", withExtension: "json")
    }

    func applyRoute(_ route: String) {
        let normalized = normalizedRoute(route)
        guard currentRoute != normalized else {
            return
        }

        currentRoute = normalized
        if isSupportedRoute(normalized) {
            fallbackMode = nil
            recordTelemetryEvent(
                eventName: "seis_demo_cta_click",
                details: ["cta_id": "route_change", "target": normalized],
                source: "native"
            )
            switch routeType(for: normalized) {
            case let .results(runId):
                activeRunId = runId
            case .home, .demo, .scenario:
                activeRunId = nil
            case .unsupported:
                break
            }
            return
        }

        fallbackMode = .unsupportedRoute(normalized)
        recordTelemetryEvent(
            eventName: "seis_demo_error",
            details: ["cta_id": "unsupported_route", "route": normalized],
            source: "native"
        )
    }

    func handleDeepLink(_ url: URL) {
        let route = routeFromIncomingURL(url)
        recordTelemetryEvent(
            eventName: "seis_demo_cta_click",
            details: ["cta_id": "deep_link", "target": route],
            source: "native"
        )
        applyRoute(route)
    }

    func reset(reason: String) {
        fallbackMode = nil
        recordTelemetryEvent(
            eventName: "seis_demo_cta_click",
            details: ["cta_id": "demo_reset", "reason": reason],
            source: "native"
        )
    }

    func startScenario(_ scenarioId: String) {
        guard let scenario = scenarioById(scenarioId) else {
            recordTelemetryEvent(
                eventName: "seis_demo_error",
                details: ["cta_id": "start_unknown_scenario", "scenario_id": scenarioId],
                source: "native"
            )
            return
        }

        let runId = "run-\(Date().timeIntervalSince1970.formatted(.number.precision(.fractionLength(0))))"
        let startDate = Date()
        let scenarioSteps = scenario.steps ?? ["Initialize", "Execute", "Finalize"]

        let run = DemoRun(
            id: runId,
            scenarioId: scenarioId,
            status: "running",
            durationMs: 0,
            startedAt: isoFormatter.string(from: startDate),
            completedAt: nil,
            steps: []
        )

        runs[runId] = run
        activeRunId = runId
        applyRoute("/results/\(runId)")

        recordTelemetryEvent(
            eventName: "seis_demo_started",
            details: [
                "cta_id": "start_scenario",
                "scenario_id": scenarioId,
                "run_id": runId
            ],
            source: "native"
        )
        recordTelemetryEvent(
            eventName: "seis_demo_specialist_used",
            details: [
                "cta_id": "start_scenario",
                "scenario_id": scenarioId,
                "specialist": scenario.specialist
            ],
            source: "native"
        )

        Task(priority: .userInitiated) { [weak self, scenarioSteps, runId] in
            guard let self else {
                return
            }

            for (index, stepName) in scenarioSteps.enumerated() {
                try? await Task.sleep(for: .milliseconds(650 + Int.random(in: 0...250)))
                let shouldContinue = await MainActor.run {
                    self.applyScenarioStep(
                        runId: runId,
                        stepName: stepName,
                        stepIndex: index + 1,
                        totalSteps: scenarioSteps.count
                    )
                }
                if !shouldContinue {
                    return
                }
            }
        }
    }

    @MainActor
    private func applyScenarioStep(
        runId: String,
        stepName: String,
        stepIndex: Int,
        totalSteps: Int
    ) -> Bool {
        guard var latest = runs[runId], latest.status == "running" else {
            return false
        }

        var steps = latest.steps
        let isFinalStep = stepIndex >= totalSteps
        steps.append(
            DemoStep(
                name: stepName,
                state: "success",
                at: isoFormatter.string(from: Date())
            )
        )

        let startDate = ISO8601DateParser.date(from: latest.startedAt) ?? Date()
        let duration = Int(Date().timeIntervalSince(startDate) * 1000)
        let done = isFinalStep

        latest = DemoRun(
            id: runId,
            scenarioId: latest.scenarioId,
            status: done ? "completed" : "running",
            durationMs: duration,
            startedAt: latest.startedAt,
            completedAt: done ? isoFormatter.string(from: Date()) : nil,
            steps: steps
        )
        runs[runId] = latest

        recordTelemetryEvent(
            eventName: "seis_demo_step",
            details: [
                "run_id": runId,
                "scenario_id": latest.scenarioId,
                "step": isFinalStep ? "complete" : stepName,
                "step_index": stepIndex,
                "steps_count": totalSteps,
                "duration_ms": duration,
                "route": "/results/\(runId)"
            ],
            source: "native"
        )

        return !done
    }

    private func extractRouteParameter(from route: String, prefix: String) -> String? {
        let normalized = normalizedRoute(route)
        guard normalized.hasPrefix(prefix) else {
            return nil
        }
        let tail = String(normalized.dropFirst(prefix.count))
        return tail.isEmpty ? nil : tail
    }

    private func isSupportedRoute(_ route: String) -> Bool {
        contract.routes.contains { templateMatches(route, template: $0.path) }
    }

    private func templateMatches(_ route: String, template: String) -> Bool {
        let normalizedRouteValue = normalizedRoute(route)
        let normalizedTemplate = normalizedRoute(template)

        if normalizedTemplate == "/" && normalizedRouteValue == "/" {
            return true
        }

        let routeParts = normalizedRouteValue.split(separator: "/")
        let templateParts = normalizedTemplate.split(separator: "/")
        guard routeParts.count == templateParts.count else {
            return false
        }

        return zip(routeParts, templateParts).allSatisfy { routePart, templatePart in
            templatePart.hasPrefix(":") || routePart == templatePart
        }
    }

    private func recordTelemetryEvent(eventName: String, details: [String: Any], source: String) {
        var merged: [String: Any] = [
            "event_name": eventName,
            "event_id": UUID().uuidString,
            "occurred_at": isoFormatter.string(from: Date()),
            "route": currentRoute,
            "session_id": sessionId,
            "source": source
        ]

        for (key, value) in details {
            if merged[key] == nil {
                merged[key] = value
            }
        }

        if merged["details"] == nil {
            merged["details"] = telemetryDetailsPayload(from: details)
        }

        var validationIssues: [String] = []
        if !knownEvents.contains(eventName) {
            validationIssues.append("event_not_in_contract")
        }

        validationIssues.append(contentsOf: validateTelemetrySchemaFields(eventName: eventName, payload: merged))
        validationIssues.append(contentsOf: validateFallbackRouteIfNeeded(eventName: eventName, payload: merged))

        if eventName == "seis_demo_cta_click" {
            validationIssues.append(contentsOf: validateCTAFields(payload: merged))
        }

        if !validationIssues.isEmpty {
            merged["validation_error"] = "payload_schema_invalid"
            merged["validation_errors"] = validationIssues
        }

        let detailPayload: String
        do {
            let payloadData = try JSONSerialization.data(withJSONObject: merged, options: [.sortedKeys])
            detailPayload = String(data: payloadData, encoding: .utf8) ?? "{}"
        } catch {
            detailPayload = "{\"encoding_error\":true}"
        }

        let runId = merged["run_id"] as? String
        let routeValue = merged["route"] as? String ?? currentRoute
        telemetryEvents.insert(
            TelemetryRecord(
                eventName: eventName,
                occurredAt: merged["occurred_at"] as? String ?? isoFormatter.string(from: Date()),
                route: routeValue,
                source: source,
                runId: runId,
                details: detailPayload
            ),
            at: 0
        )

        if telemetryEvents.count > 40 {
            telemetryEvents = Array(telemetryEvents.prefix(40))
        }

        if !knownEvents.contains(eventName) {
            logger.warning("Unknown event name: \(eventName, privacy: .public)")
        }
        if !validationIssues.isEmpty {
            logger.warning("Telemetry schema validation issues: \(validationIssues.joined(separator: ", "))")
        } else {
            logger.info("Event: \(eventName, privacy: .public) route=\(routeValue, privacy: .public)")
        }
    }

    private func validateTelemetrySchemaFields(eventName: String, payload: [String: Any]) -> [String] {
        guard let definition = contract.analyticsEvents.first(where: { $0.name == eventName }) else {
            return []
        }

        let required = definition.requiredFields ?? []
        return required.compactMap { field in
            guard let value = payload[field] else {
                return "missing_\(field)"
            }
            if !hasTelemetryValue(value) {
                return "invalid_\(field)"
            }
            return nil
        }
    }

    private func validateFallbackRouteIfNeeded(eventName: String, payload: [String: Any]) -> [String] {
        guard let routeValue = payload["route"] as? String else {
            return ["missing_route"]
        }

        if isSupportedRoute(routeValue) {
            return []
        }
        if eventName == "seis_demo_error" || eventName == "seis_demo_cta_click" {
            return ["route_not_in_contract"]
        }
        return []
    }

    private func validateCTAFields(payload: [String: Any]) -> [String] {
        var issues: [String] = []
        if let ctaId = payload["cta_id"] as? String {
            if ctaId.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                issues.append("cta_id_empty")
            }
        } else {
            issues.append("cta_id_missing")
        }

        if payload["target"] == nil || (payload["target"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ?? false {
            issues.append("cta_target_missing")
        }

        return issues
    }

    private func hasTelemetryValue(_ value: Any) -> Bool {
        if let value = value as? String {
            return !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }
        if let value = value as? [Any] {
            return !value.isEmpty
        }
        if let value = value as? [String: Any] {
            return !value.isEmpty
        }
        return true
    }

    private func telemetryDetailsPayload(from details: [String: Any]) -> String {
        guard let payloadData = try? JSONSerialization.data(withJSONObject: details, options: [.sortedKeys]),
              let payloadString = String(data: payloadData, encoding: .utf8) else {
            return "{}"
        }
        return payloadString
    }
}

private enum ISO8601DateParser {
    static func date(from value: String) -> Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: value) ?? ISO8601DateFormatter().date(from: value)
    }
}

struct SeisDemoNativeShellView: View {
    @ObservedObject var state: SeisDemoNativeShellState

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            header

            if state.fallbackMode != nil || !state.isSupportedRoute {
                SeisDemoFallbackView(state: state)
            } else {
                switch state.routeType() {
                case .home:
                    homeContent
                case .demo:
                    demoContent
                case let .scenario(scenarioId):
                    scenarioContent(scenarioId: scenarioId)
                case let .results(runId):
                    resultsContent(runId: runId)
                case .unsupported:
                    SeisDemoFallbackView(state: state)
                }
            }

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                Text("Shared contract: \(state.contract.contractName)")
                    .font(.headline)
                Text("Routes: \(state.supportedRoutes.joined(separator: ", "))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)

                if let fallback = state.fallbackMode {
                    Text("\(fallback.title): \(fallback.message(for: state.contract))")
                        .font(.caption)
                        .foregroundStyle(.red)
                        .lineLimit(3)
                }

                if !state.telemetryEvents.isEmpty {
                    Text("Telemetry (latest)")
                        .font(.subheadline)
                        .padding(.top, 4)
                    ScrollView {
                        VStack(alignment: .leading, spacing: 6) {
                            ForEach(state.telemetryEvents.prefix(6)) { event in
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("[\(event.occurredAt)] \(event.eventName) • \(event.route)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Text(event.details)
                                        .font(.caption2.monospacedDigit())
                                        .lineLimit(2)
                                        .truncationMode(.middle)
                                        .foregroundStyle(.tertiary)
                                }
                            }
                        }
                    }
                    .frame(maxHeight: 220)
                    .padding(8)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10))
                }
            }
            .padding(.bottom, 4)
        }
        .padding(16)
        .frame(minHeight: 500)
    }

    @ViewBuilder
    private var header: some View {
        HStack(alignment: .center, spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text("SEIS Demo (Native)")
                    .font(.title2)
                    .fontWeight(.semibold)
                Text("Route: \(state.routeForDisplay)")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            HStack(spacing: 10) {
                Button("Home") {
                    state.applyRoute("/")
                }
                Button("Demo") {
                    state.applyRoute("/demo")
                }
                Button("Sample Result") {
                    state.applyRoute("/results/demo-home")
                }
            }
            .buttonStyle(.bordered)
        }
    }

    private var homeContent: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Open-source SEIS demo for iOS + macOS")
                .font(.headline)
            Text("Pick a scenario and run natively to generate shared analytics events and demo output.")
                .foregroundStyle(.secondary)
            HStack {
                Button("Open Demo") {
                    state.applyRoute("/demo")
                }
                .buttonStyle(.borderedProminent)
                Button("Retry") {
                    state.reset(reason: "home_retry")
                }
                .buttonStyle(.bordered)
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var demoContent: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Demo scenarios")
                .font(.headline)
            ForEach(state.contract.scenarios, id: \.id) { scenario in
                VStack(alignment: .leading, spacing: 6) {
                    Text(scenario.title)
                        .font(.subheadline.weight(.semibold))
                    Text(scenario.summary)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text("Specialist: \(scenario.specialist)")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)

                    HStack {
                        Button("Open route") {
                            state.applyRoute("/demo/\(scenario.id)")
                        }
                        Button("Run") {
                            state.startScenario(scenario.id)
                        }
                        .buttonStyle(.borderedProminent)
                    }
                }
                .padding(10)
                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10))
            }
        }
    }

    private func scenarioContent(scenarioId: String) -> some View {
        let scenario = state.scenarioById(scenarioId)
        return VStack(alignment: .leading, spacing: 12) {
            if let scenario {
                Text(scenario.title)
                    .font(.headline)
                Text(scenario.summary)
                    .foregroundStyle(.secondary)
                Text("Specialist: \(scenario.specialist)")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
                if let prompt = scenario.defaultPrompt {
                    Text("Prompt")
                        .font(.subheadline)
                    Text(prompt)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Button("Run scenario") {
                    state.startScenario(scenario.id)
                }
                .buttonStyle(.borderedProminent)
            } else {
                Text("Scenario not found.")
                    .foregroundStyle(.red)
                Button("Back to Demo") {
                    state.applyRoute("/demo")
                }
                .buttonStyle(.bordered)
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func resultsContent(runId: String) -> some View {
        let run = state.run(for: runId)

        return VStack(alignment: .leading, spacing: 12) {
            Text("Demo results")
                .font(.headline)
            if let run {
                HStack {
                    Text("Run:")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Text(run.id)
                        .font(.caption.monospaced())
                }
                Text("Scenario: \(state.scenarioById(run.scenarioId)?.title ?? run.scenarioId)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text("Status: \(run.status)")
                    .foregroundStyle(run.status == "completed" ? .green : .orange)
                Text("Started: \(run.startedAt)")
                    .font(.caption2)
                Text("Duration: \(run.durationMs)ms")
                    .font(.caption2)

                VStack(alignment: .leading, spacing: 8) {
                    ForEach(Array(run.steps.enumerated()), id: \.offset) { index, step in
                        HStack {
                            Text("\(index + 1).")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                                .frame(width: 20)
                            Text(step.name)
                                .font(.caption)
                            Spacer()
                            Text(step.state)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .padding(8)
                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
            } else {
                Text("No run found for this route id.")
                    .foregroundStyle(.red)
            }

            Button("Back to Demo") {
                state.applyRoute("/demo")
            }
            .buttonStyle(.bordered)
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
}

private struct SeisDemoFallbackView: View {
    @ObservedObject var state: SeisDemoNativeShellState

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Demo fallback screen")
                .font(.headline)
            Text("The route is not in the contract. Use local route shortcuts.")
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack {
                Button("Retry demo") {
                    state.reset(reason: "fallback_retry")
                }
                Button("Go Home") {
                    state.applyRoute("/")
                }
                .buttonStyle(.bordered)
            }

            Text("Available routes")
                .font(.subheadline)

            ForEach(state.contract.routes, id: \.path) { route in
                Button {
                    state.applyRoute(route.path)
                } label: {
                    Label(route.path, systemImage: "link")
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .buttonStyle(.bordered)
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
}
