import Foundation
import SwiftUI
#if canImport(AppKit)
import AppKit
#endif

#if os(macOS)
struct SeisDesktopDemoCommandCenterView: View {
    let workspacePath: String

    @StateObject private var model: SeisDesktopDemoCommandCenterModel
    @State private var showOnlyFailures = false
    @State private var historyFilter: HistoryFilter = .all
    @State private var historyTimeFilter: HistoryTimeFilter = .all
    @State private var copyToast: String? = nil
    @State private var copyToastToken = UUID()
    @State private var showGitHubAuthApproval = false

    enum HistoryFilter: String, CaseIterable, Identifiable {
        case all = "Tüm Kayıtlar"
        case failedOnly = "Sadece Başarısız"
        case last10 = "Son 10"
        case last50 = "Son 50"

        var id: String { rawValue }
    }

    enum HistoryTimeFilter: String, CaseIterable, Identifiable {
        case all = "Tüm Zamanlar"
        case lastHour = "Son 1 Saat"
        case today = "Bugün"
        case thisWeek = "Bu Hafta"

        var id: String { rawValue }
    }

    init(workspacePath: String) {
        self.workspacePath = workspacePath
        _model = StateObject(wrappedValue: SeisDesktopDemoCommandCenterModel(workspacePath: workspacePath))
    }

    private var displayedResults: [SeisDesktopDemoCommandCenterModel.CommandResult] {
        if showOnlyFailures {
            return model.results.filter { !$0.isSuccess }
        }
        return model.results
    }

    private var displayedHistory: [SeisDesktopDemoCommandCenterModel.CommandResult] {
        var filteredHistory = model.history.filter { result in
            isWithinTimeFilter(result.startedAt)
        }

        if showOnlyFailures {
            filteredHistory = filteredHistory.filter { !$0.isSuccess }
        }

        switch historyFilter {
        case .all:
            break
        case .failedOnly:
            filteredHistory = filteredHistory.filter { !$0.isSuccess }
        case .last10:
            filteredHistory = Array(filteredHistory.suffix(10))
        case .last50:
            filteredHistory = Array(filteredHistory.suffix(50))
        }

        return filteredHistory
    }

    private func isWithinTimeFilter(_ date: Date) -> Bool {
        guard historyTimeFilter != .all else {
            return true
        }

        let now = Date()
        let calendar = Calendar.current

        switch historyTimeFilter {
        case .all:
            return true
        case .lastHour:
            return date >= calendar.date(byAdding: .hour, value: -1, to: now) ?? now
        case .today:
            return calendar.isDate(date, inSameDayAs: now)
        case .thisWeek:
            guard let week = calendar.dateInterval(of: .weekOfYear, for: now) else {
                return true
            }
            return week.contains(date)
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                Text("SEIS Demo Command Center")
                    .font(.headline)
                Spacer()
                Text(model.statusMessage)
                    .font(.caption)
                    .foregroundStyle(model.statusColor)
            }

            Text("Workspace: \(model.workspacePath)")
                .font(.caption2.monospaced())
                .foregroundStyle(.secondary)

            HStack(spacing: 10) {
                Button("Run Quick Health Checks") {
                    model.runQuickChecks()
                }
                .disabled(model.isRunning)

                Button("Run GitHub Checks") {
                    model.runGitHubChecks()
                }
                .disabled(model.isRunning)

                Button("Run Build Smoke") {
                    model.runBuildSmokeChecks()
                }
                .disabled(model.isRunning)

                Button("Run npm run quality") {
                    model.runQualityGateCheck()
                }
                .disabled(model.isRunning)

                Button("Run gh auth login") {
                    showGitHubAuthApproval = true
                }
                .disabled(model.isRunning)

                Button("Clear Logs") {
                    model.clearResults()
                }
                .disabled(model.isRunning)
            }
            .buttonStyle(.borderedProminent)

            Toggle("Show only failed results", isOn: $showOnlyFailures)
                #if os(macOS)
                .toggleStyle(.checkbox)
                #endif
                .disabled(model.results.isEmpty)

            if let last = model.lastExecutedResult {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Last Executed Command")
                        .font(.subheadline.weight(.semibold))

                    HStack(alignment: .top) {
                        Image(systemName: last.isSuccess ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                            .foregroundStyle(last.isSuccess ? .green : .orange)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(last.label)
                                .font(.caption.weight(.semibold))
                            Text(last.command)
                                .font(.caption.monospaced())
                                .foregroundStyle(.secondary)
                            if last.hasRedactions {
                                redactionBadge(for: last.redactedCount)
                            }
                            Text("Started \(last.startedAt.formatted(date: .omitted, time: .standard)) • Duration \(last.durationMs) ms")
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Button("Rerun") {
                            model.rerun(result: last)
                        }
                        .disabled(model.isRunning)
                        .buttonStyle(.bordered)
                    }

                    if !last.isSuccess {
                        Button("Copy Output") {
                            copyOutput(last.output)
                        }
                        .disabled(model.isRunning)
                        .buttonStyle(.bordered)
                    }

                    if let suggestion = model.suggestedAction(for: last) {
                        Text(suggestion)
                            .font(.caption2)
                            .foregroundStyle(.blue)
                    }
                }
                .padding(10)
                .background(.ultraThickMaterial, in: RoundedRectangle(cornerRadius: 8))
            }

            if model.isRunning {
                ProgressView("Running checks...")
                    .padding(.vertical, 4)
            }

            if let lastRun = model.lastRun {
                Text("Last run: \(lastRun, style: .time)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
            }

            if !displayedResults.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(displayedResults) { result in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Image(systemName: result.isSuccess ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                                    .foregroundStyle(result.isSuccess ? .green : .orange)
                                Text(result.label)
                                    .font(.subheadline.weight(.semibold))
                                Spacer()
                                Text("\(result.durationMs) ms")
                                    .font(.caption.monospacedDigit())
                                    .foregroundStyle(.secondary)
                            }

                            Text(result.command)
                                .font(.caption.monospaced())
                                .foregroundStyle(.secondary)

                            if result.hasRedactions {
                                redactionBadge(for: result.redactedCount)
                            }

                            if let suggestion = model.suggestedAction(for: result) {
                                Text(suggestion)
                                    .font(.caption2)
                                    .foregroundStyle(.blue)
                            }

                            HStack(spacing: 8) {
                                Button("Rerun") {
                                    model.rerun(result: result)
                                }
                                .disabled(model.isRunning)
                                .buttonStyle(.bordered)

                                if !result.isSuccess {
                                    Button("Copy Output") {
                                        copyOutput(result.output)
                                    }
                                    .disabled(model.isRunning)
                                    .buttonStyle(.bordered)
                                }
                            }

                            ScrollView(.horizontal, showsIndicators: true) {
                                Text(result.output.isEmpty ? "No output." : result.output)
                                    .font(.caption.monospaced())
                                    .textSelection(.enabled)
                                    .foregroundStyle(.secondary)
                                    .padding(10)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
                            }

                            Divider()
                        }
                    }
                }
            } else {
                Text("Run checks to see command output and actionable hints.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            if !displayedHistory.isEmpty {
                Divider()
                VStack(alignment: .leading, spacing: 8) {
                    Text("Command History (Time-stamped)")
                        .font(.subheadline.weight(.semibold))
                    Picker("History Filter", selection: $historyFilter) {
                        ForEach(HistoryFilter.allCases) { filter in
                            Text(filter.rawValue).tag(filter)
                        }
                    }
                    .pickerStyle(.segmented)
                    .labelsHidden()

                    Picker("Time Range", selection: $historyTimeFilter) {
                        ForEach(HistoryTimeFilter.allCases) { filter in
                            Text(filter.rawValue).tag(filter)
                        }
                    }
                    .pickerStyle(.menu)
                    .labelsHidden()

                    ForEach(displayedHistory) { entry in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack(alignment: .top, spacing: 8) {
                                Image(systemName: entry.isSuccess ? "clock.fill" : "clock.badge.exclamationmark.fill")
                                    .foregroundStyle(entry.isSuccess ? .green : .orange)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(entry.startedAt.formatted(date: .abbreviated, time: .standard))
                                        .font(.caption2.monospaced())
                                        .foregroundStyle(.secondary)
                                    Text(entry.label)
                                        .font(.caption.weight(.semibold))
                                    Text("\(entry.durationMs) ms")
                                        .font(.caption2.monospaced())
                                        .foregroundStyle(.tertiary)
                                }
                                Spacer()
                                Button("Rerun") {
                                    model.rerun(result: entry)
                                }
                                .disabled(model.isRunning)
                                .buttonStyle(.bordered)

                                if !entry.isSuccess {
                                    Button("Copy Output") {
                                        copyOutput(entry.output)
                                    }
                                    .disabled(model.isRunning)
                                    .buttonStyle(.bordered)
                                }
                            }
                        }
                        Divider()
                    }
                }
            }

            if let copyToast {
                Text(copyToast)
                    .font(.caption2)
                    .fontWeight(.semibold)
                    .foregroundStyle(.green)
                    .padding(8)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
                    .frame(maxWidth: .infinity, alignment: .center)
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10))
        .onAppear {
            model.refreshWorkspacePath(workspacePath)
        }
        .confirmationDialog(
            "Approve GitHub authentication",
            isPresented: $showGitHubAuthApproval,
            titleVisibility: .visible
        ) {
            Button("Approve and Run gh auth login", role: .destructive) {
                model.runGitHubAuthLogin()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This starts an interactive credential and network flow. It is not a read-only check and may change the local GitHub CLI session.")
        }
    }

    private func copyOutput(_ output: String) {
        guard model.copyOutput(output) else {
            return
        }

        let normalizedOutput = output.trimmingCharacters(in: .whitespacesAndNewlines)
        let toastMessage = normalizedOutput.isEmpty ? "Kopyalama başarılı ama boş çıktı" : "Kopyalandı"

        withAnimation(.easeInOut(duration: 0.2)) {
            copyToastToken = UUID()
            copyToast = toastMessage
        }

        let currentToken = copyToastToken
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            if copyToastToken == currentToken {
                withAnimation(.easeInOut(duration: 0.2)) {
                    copyToast = nil
                }
            }
        }
    }

    private func redactionBadge(for count: Int) -> some View {
        let level: Color = count >= 10 ? .red : (count >= 5 ? .orange : .yellow)
        let helpText = "This command output contained \(count) masked item\(count == 1 ? "" : "s"). Values were replaced with [REDACTED] to avoid exposing secrets."

        return HStack(alignment: .center, spacing: 6) {
            Label("Masked fields: \(count)", systemImage: "eye.slash")
                .font(.caption2)
                .foregroundStyle(level)
                .optionalHelp(helpText)
            Image(systemName: "info.circle")
                .font(.caption2)
                .foregroundStyle(.secondary)
                .optionalHelp("Redacted tokens are shown as [REDACTED] to avoid exposing secrets.")
                .symbolRenderingMode(.hierarchical)
        }
    }
}

@MainActor
final class SeisDesktopDemoCommandCenterModel: ObservableObject {
    struct CommandResult: Identifiable {
        let id = UUID()
        let label: String
        let command: String
        let output: String
        let redactedCount: Int
        let exitCode: Int
        let startedAt: Date
        let finishedAt: Date

        var isSuccess: Bool {
            exitCode == 0
        }

        var hasRedactions: Bool {
            redactedCount > 0
        }

        var durationMs: Int {
            Int(finishedAt.timeIntervalSince(startedAt) * 1000)
        }
    }

    @Published private(set) var isRunning = false
    @Published private(set) var statusMessage = "Ready"
    @Published private(set) var results: [CommandResult] = []
    @Published private(set) var history: [CommandResult] = []
    @Published private(set) var lastRun: Date?
    @Published private(set) var lastExecutedResult: CommandResult?
    @Published var workspacePath: String

    private let shellExecutable = "/bin/zsh"
    private let zshArgs = ["-lc"]
    private let outputByteLimit = 8_000
    private let maxHistoryCount = 24
    private let statusSuccessColor = Color.green
    private let statusWarnColor = Color.orange
    private let statusIdleColor = Color.secondary
    nonisolated private static let sensitivePatterns: [NSRegularExpression] = {
        [
            #"\bgh[a-z]_[A-Za-z0-9_]{20,}\b"#,
            #"\bgithub_pat_[A-Za-z0-9_]{20,}\b"#,
            #"\bsk-[A-Za-z0-9]{20,}\b"#,
            #"\bAKIA[0-9A-Z]{16}\b"#,
            #"\bxoxb-[0-9]{10,}-[0-9]{10,}-[a-zA-Z0-9-]{20,}\b"#,
            #"(?i)\b(?:authorization|api[_-]?key|access[_-]?token|password)\s*[:=]\s*[^\s]{12,}\b"#
        ].compactMap { pattern in
            do {
                return try NSRegularExpression(pattern: pattern)
            } catch {
                assertionFailure("Invalid sensitive output regex pattern: \(pattern)")
                return nil
            }
        }
    }()

    init(workspacePath: String) {
        self.workspacePath = workspacePath
    }

    var statusColor: Color {
        if isRunning {
            return statusWarnColor
        }

        guard !results.isEmpty else {
            return statusIdleColor
        }

        let hasFailure = results.contains { !$0.isSuccess }
        return hasFailure ? statusWarnColor : statusSuccessColor
    }

    func refreshWorkspacePath(_ newPath: String) {
        workspacePath = newPath
    }

    func runQualityGateCheck() {
        runSingle(label: "Quality Gate", command: "npm run quality", source: "quality")
    }

    func runGitHubAuthLogin() {
        runSingle(label: "GitHub Auth Login", command: "gh auth login", source: "github")
    }

    func runQuickChecks() {
        runBatch(
            commands: [
                ("Git Status", "git status --short"),
                ("Branch + Remote", "git branch --show-current && echo '---' && git remote -v"),
                ("Working Tree Log", "git log --oneline -n 5"),
                ("Recent App Files", "ls -1 apps/macos"),
            ],
            source: "quick"
        )
    }

    func runGitHubChecks() {
        runBatch(
            commands: [
                ("GitHub Auth", "gh auth status"),
                ("Recent GH Runs", "gh run list --limit 6"),
                ("Workflow JSON", "gh run list --json name,status,conclusion -L 6")
            ],
            source: "github"
        )
    }

    func runBuildSmokeChecks() {
        runBatch(
            commands: [
                ("Swift Build", "swift build --package-path packages/seis_platform_swift --product SeisAppleNativeShell"),
                ("Swift Policy Tests", "swift test --package-path packages/seis_platform_swift --filter SeisPlatformPolicyTests")
            ],
            source: "build"
        )
    }

    func rerun(result: CommandResult) {
        runSingle(label: result.label, command: result.command, source: "rerun")
    }

    func clearResults() {
        guard !isRunning else { return }
        results.removeAll()
        lastRun = nil
        lastExecutedResult = nil
        statusMessage = "Ready"
    }

    @discardableResult
    func copyOutput(_ output: String) -> Bool {
        #if canImport(AppKit)
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        pasteboard.setString(output, forType: .string)
        statusMessage = "Output copied to clipboard."
        return true
        #else
        statusMessage = "Clipboard is unavailable on this platform."
        return false
        #endif
    }

    func suggestedAction(for result: CommandResult) -> String? {
        guard !result.isSuccess else { return nil }

        if result.label == "Git Status" {
            return "Clean workspace or review unstaged changes from output; this may hide accidental edits."
        }
        if result.label == "Branch + Remote" {
            return "Check 'git remote -v' output; remote fetch/push endpoints may need re-check."
        }
        if result.label == "Quality Gate" {
            return "Run with terminal: npm run quality. Inspect npm and Swift diagnostics output for first failing command."
        }
        if result.label == "GitHub Auth" {
            return "Run `gh auth login` in terminal. Check token scope if API calls fail."
        }
        if result.label == "GitHub Auth Login" {
            return "Open browser if prompted, then authorize required scopes."
        }
        if result.label == "Recent GH Runs" || result.label == "Workflow JSON" {
            return "Look at workflow name/status columns to verify latest CI checks and conclusions."
        }
        if result.label == "Swift Build" {
            return "Re-run from terminal to read full toolchain errors if this fails."
        }
        if result.label == "Swift Policy Tests" {
            return "Open failing test names and run `swift test --filter <test-name>` for focused rerun."
        }

        return "Re-run this command after local environment review."
    }

    private func runSingle(label: String, command: String, source: String) {
        runBatch(commands: [(label, command)], source: source)
    }

    private func runBatch(commands: [(label: String, command: String)], source: String) {
        guard !isRunning else { return }
        guard FileManager.default.fileExists(atPath: workspacePath) else {
            statusMessage = "Workspace not found: \(workspacePath)"
            return
        }

        results.removeAll()
        isRunning = true
        statusMessage = "Running \(source) checks..."
        lastRun = Date()
        lastExecutedResult = nil

        let commandQueue = commands
        let shellExecutable = self.shellExecutable
        let zshArgs = self.zshArgs
        let workspacePath = self.workspacePath
        let outputByteLimit = self.outputByteLimit

        Task(priority: .userInitiated) { [weak self, commandQueue, shellExecutable, zshArgs, workspacePath, outputByteLimit] in
            guard let self else { return }

            for command in commandQueue {
                let result = await Self.executeCommand(
                    command: command.command,
                    label: command.label,
                    shellExecutable: shellExecutable,
                    zshArgs: zshArgs,
                    workspacePath: workspacePath,
                    outputByteLimit: outputByteLimit
                )
                await MainActor.run {
                    self.results.append(result)
                    self.lastExecutedResult = result
                    self.lastRun = Date()
                    self.appendToHistory(result)
                }
            }

            await MainActor.run {
                self.isRunning = false
                self.statusMessage = self.results.contains(where: { !$0.isSuccess }) ? "Checks completed with warnings." : "Checks complete."
            }
        }
    }

    private func appendToHistory(_ result: CommandResult) {
        history.append(result)
        if history.count > maxHistoryCount {
            history.removeFirst(history.count - maxHistoryCount)
        }
    }

    nonisolated private static func executeCommand(
        command: String,
        label: String,
        shellExecutable: String,
        zshArgs: [String],
        workspacePath: String,
        outputByteLimit: Int
    ) async -> CommandResult {
        let startedAt = Date()
        let result = await withCheckedContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                let process = Process()
                process.executableURL = URL(fileURLWithPath: shellExecutable)
                process.arguments = zshArgs + [command]
                process.currentDirectoryURL = URL(fileURLWithPath: workspacePath)

                let stdout = Pipe()
                let stderr = Pipe()
                process.standardOutput = stdout
                process.standardError = stderr

                var outputText = ""
                var redactedCount = 0
                var exitCode = 1

                do {
                    try process.run()
                    process.waitUntilExit()
                    exitCode = Int(process.terminationStatus)

                    let outputData = try stdout.fileHandleForReading.readToEnd() ?? Data()
                    let errorData = try stderr.fileHandleForReading.readToEnd() ?? Data()
                    let stdoutText = String(data: outputData, encoding: .utf8) ?? ""
                    let stderrText = String(data: errorData, encoding: .utf8) ?? ""
                    let mergedOutput = [stdoutText, stderrText]
                        .filter { !$0.isEmpty }
                        .joined(separator: "\n--- stderr ---\n")
                    let sanitizedResult = Self.sanitizeOutputWithMetadata(mergedOutput)
                    let sanitizedOutput = sanitizedResult.text
                    redactedCount = sanitizedResult.redactedCount
                    if sanitizedOutput.count > outputByteLimit {
                        outputText = String(sanitizedOutput.prefix(outputByteLimit)) + "\n\n(truncated)"
                    } else {
                        outputText = sanitizedOutput
                    }
                } catch {
                    let sanitizedFailure = Self.sanitizeOutputWithMetadata(
                        "Failed to execute command '\(command)' from \(workspacePath). \(error.localizedDescription)"
                    )
                    outputText = sanitizedFailure.text
                    redactedCount = sanitizedFailure.redactedCount
                }

                continuation.resume(returning: CommandResult(
                    label: label,
                    command: command,
                    output: outputText,
                    redactedCount: redactedCount,
                    exitCode: exitCode,
                    startedAt: startedAt,
                    finishedAt: Date()
                ))
            }
        }

        return result
    }

    nonisolated private static func sanitizeOutput(_ value: String) -> String {
        sanitizeOutputWithMetadata(value).text
    }

    nonisolated private static func sanitizeOutputWithMetadata(_ value: String) -> (text: String, redactedCount: Int) {
        var redacted = value
        var redactedCount = 0

        for pattern in sensitivePatterns {
            let matches = pattern.matches(in: redacted, range: NSRange(redacted.startIndex..<redacted.endIndex, in: redacted)).count
            redactedCount += matches
            redacted = pattern.stringByReplacingMatches(
                in: redacted,
                options: [],
                range: NSRange(redacted.startIndex..<redacted.endIndex, in: redacted),
                withTemplate: "[REDACTED]"
            )
        }

        return (redacted, redactedCount)
    }
}

private extension View {
    @ViewBuilder
    func optionalHelp(_ text: String) -> some View {
        #if os(macOS)
        self.help(text)
        #else
        self
        #endif
    }
}
#endif

#if !os(macOS)
struct SeisDesktopDemoCommandCenterView: View {
    let workspacePath: String

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("SEIS Demo Command Center")
                .font(.headline)
            Text("Desktop Demo Command Center macOS-only özelliği iOS'ta desteklenmiyor.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Text("Workspace: \(workspacePath)")
                .font(.caption2.monospaced())
                .foregroundStyle(.secondary)
        }
        .padding()
    }
}
#endif
