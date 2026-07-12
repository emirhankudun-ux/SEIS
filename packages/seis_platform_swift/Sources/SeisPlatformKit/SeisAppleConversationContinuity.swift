import Combine
import Foundation

public enum SeisAppleConversationSource: String, CaseIterable, Codable, Identifiable, Sendable {
    case desktop
    case aiCore = "ai-core"
    case search
    case code
    case design
    case cloud
    case store
    case music
    case launchpad
    case files
    case terminal
    case website
    case agents
    case plugins
    case commandCenter = "command-center"

    public var id: String { rawValue }

    public var title: String {
        switch self {
        case .desktop: "SEIS Desktop"
        case .aiCore: "SEIS AI Core"
        case .search: "SEIS Search"
        case .code: "SEIS Code"
        case .design: "SEIS Design"
        case .cloud: "SEIS Cloud"
        case .store: "SEIS Store"
        case .music: "SEIS Music"
        case .launchpad: "SEIS Launchpad"
        case .files: "SEIS Files"
        case .terminal: "Terminal / SSH"
        case .website: "SEIS Website"
        case .agents: "SEIS Agents"
        case .plugins: "SEIS Plugins"
        case .commandCenter: "Command Center"
        }
    }

    public var systemImage: String {
        switch self {
        case .desktop: "desktopcomputer"
        case .aiCore: "sparkles"
        case .search: "magnifyingglass"
        case .code: "chevron.left.forwardslash.chevron.right"
        case .design: "paintbrush"
        case .cloud: "externaldrive"
        case .store: "bag"
        case .music: "music.note"
        case .launchpad: "square.grid.3x3"
        case .files: "folder"
        case .terminal: "terminal"
        case .website: "globe"
        case .agents: "person.3"
        case .plugins: "puzzlepiece.extension"
        case .commandCenter: "command"
        }
    }
}

public enum SeisAppleContinuityCapabilityState: String, Codable, CaseIterable, Sendable {
    case localOnly = "local-only"
    case metadataOnly = "metadata-only"
    case approvalNeeded = "approval-needed"
    case disabled

    public var title: String {
        switch self {
        case .localOnly: "Yalnızca Yerel"
        case .metadataOnly: "Yalnızca Meta Veri"
        case .approvalNeeded: "Onay Gerekli"
        case .disabled: "Kapalı"
        }
    }
}

public enum SeisAppleConversationRole: String, Codable, CaseIterable, Sendable {
    case client
    case agency
    case system

    public var title: String {
        switch self {
        case .client: "Müşteri"
        case .agency: "SEIS Ajans"
        case .system: "Sistem"
        }
    }

    public var systemImage: String {
        switch self {
        case .client: "person.crop.circle"
        case .agency: "building.2"
        case .system: "lock.shield"
        }
    }
}

public enum SeisAppleClientApprovalState: String, Codable, CaseIterable, Sendable {
    case pending
    case approved
    case needsChanges = "needs-changes"
    case rejected

    public var title: String {
        switch self {
        case .pending: "Karar Bekliyor"
        case .approved: "Onaylandı"
        case .needsChanges: "Revizyon İstendi"
        case .rejected: "Reddedildi"
        }
    }
}

public struct SeisAppleConversationSourceState: Codable, Hashable, Identifiable, Sendable {
    public var source: SeisAppleConversationSource
    public var state: SeisAppleContinuityCapabilityState
    public var detail: String

    public var id: String { source.id }

    public init(
        source: SeisAppleConversationSource,
        state: SeisAppleContinuityCapabilityState,
        detail: String
    ) {
        self.source = source
        self.state = state
        self.detail = detail
    }
}

public struct SeisAppleConversationMessage: Codable, Hashable, Identifiable, Sendable {
    public var id: UUID
    public var role: SeisAppleConversationRole
    public var body: String
    public var createdAt: Date
    public var isLocalDemo: Bool

    public init(
        id: UUID = UUID(),
        role: SeisAppleConversationRole,
        body: String,
        createdAt: Date = Date(),
        isLocalDemo: Bool = true
    ) {
        self.id = id
        self.role = role
        self.body = body
        self.createdAt = createdAt
        self.isLocalDemo = isLocalDemo
    }
}

public struct SeisAppleConversationThread: Codable, Hashable, Identifiable, Sendable {
    public var id: UUID
    public var source: SeisAppleConversationSource
    public var title: String
    public var summary: String
    public var updatedAt: Date
    public var messages: [SeisAppleConversationMessage]
    public var state: SeisAppleContinuityCapabilityState

    public init(
        id: UUID = UUID(),
        source: SeisAppleConversationSource,
        title: String,
        summary: String,
        updatedAt: Date = Date(),
        messages: [SeisAppleConversationMessage] = [],
        state: SeisAppleContinuityCapabilityState = .localOnly
    ) {
        self.id = id
        self.source = source
        self.title = title
        self.summary = summary
        self.updatedAt = updatedAt
        self.messages = messages
        self.state = state
    }
}

public struct SeisAppleContextEvidence: Codable, Hashable, Identifiable, Sendable {
    public var id: UUID
    public var source: SeisAppleConversationSource
    public var title: String
    public var detail: String
    public var capturedAt: Date
    public var state: SeisAppleContinuityCapabilityState

    public init(
        id: UUID = UUID(),
        source: SeisAppleConversationSource,
        title: String,
        detail: String,
        capturedAt: Date = Date(),
        state: SeisAppleContinuityCapabilityState = .metadataOnly
    ) {
        self.id = id
        self.source = source
        self.title = title
        self.detail = detail
        self.capturedAt = capturedAt
        self.state = state
    }
}

public struct SeisAppleClientDecisionEvent: Codable, Hashable, Identifiable, Sendable {
    public var id: UUID
    public var state: SeisAppleClientApprovalState
    public var actor: String
    public var note: String
    public var createdAt: Date

    public init(
        id: UUID = UUID(),
        state: SeisAppleClientApprovalState,
        actor: String,
        note: String,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.state = state
        self.actor = actor
        self.note = note
        self.createdAt = createdAt
    }
}

public struct SeisAppleClientApproval: Codable, Hashable, Identifiable, Sendable {
    public var id: UUID
    public var threadID: UUID
    public var source: SeisAppleConversationSource
    public var title: String
    public var request: String
    public var state: SeisAppleClientApprovalState
    public var createdAt: Date
    public var updatedAt: Date
    public var events: [SeisAppleClientDecisionEvent]

    public init(
        id: UUID = UUID(),
        threadID: UUID,
        source: SeisAppleConversationSource,
        title: String,
        request: String,
        state: SeisAppleClientApprovalState = .pending,
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        events: [SeisAppleClientDecisionEvent] = []
    ) {
        self.id = id
        self.threadID = threadID
        self.source = source
        self.title = title
        self.request = request
        self.state = state
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.events = events
    }
}

public struct SeisAppleConversationContinuitySnapshot: Codable, Sendable {
    public static let currentSchemaVersion = 1

    public var schemaVersion: Int
    public var workspaceID: String
    public var workspaceTitle: String
    public var updatedAt: Date
    public var sourceStates: [SeisAppleConversationSourceState]
    public var threads: [SeisAppleConversationThread]
    public var contextEvidence: [SeisAppleContextEvidence]
    public var approvals: [SeisAppleClientApproval]

    public init(
        schemaVersion: Int = currentSchemaVersion,
        workspaceID: String,
        workspaceTitle: String,
        updatedAt: Date = Date(),
        sourceStates: [SeisAppleConversationSourceState],
        threads: [SeisAppleConversationThread],
        contextEvidence: [SeisAppleContextEvidence],
        approvals: [SeisAppleClientApproval]
    ) {
        self.schemaVersion = schemaVersion
        self.workspaceID = workspaceID
        self.workspaceTitle = workspaceTitle
        self.updatedAt = updatedAt
        self.sourceStates = sourceStates
        self.threads = threads
        self.contextEvidence = contextEvidence
        self.approvals = approvals
    }
}

public struct SeisAppleConversationContinuityMergeReport: Equatable, Sendable {
    public var addedThreads: Int
    public var addedMessages: Int
    public var addedContextItems: Int
    public var addedApprovals: Int
    public var addedDecisionEvents: Int

    public init(
        addedThreads: Int = 0,
        addedMessages: Int = 0,
        addedContextItems: Int = 0,
        addedApprovals: Int = 0,
        addedDecisionEvents: Int = 0
    ) {
        self.addedThreads = addedThreads
        self.addedMessages = addedMessages
        self.addedContextItems = addedContextItems
        self.addedApprovals = addedApprovals
        self.addedDecisionEvents = addedDecisionEvents
    }

    public var summary: String {
        "\(addedThreads) sohbet, \(addedMessages) mesaj, \(addedContextItems) bağlam, \(addedApprovals) onay ve \(addedDecisionEvents) karar olayı eklendi."
    }
}

public enum SeisAppleConversationContinuityError: LocalizedError {
    case unsupportedSchema(Int)
    case missingImportFile

    public var errorDescription: String? {
        switch self {
        case .unsupportedSchema(let version):
            "Desteklenmeyen süreklilik şeması: \(version)."
        case .missingImportFile:
            "İçe aktarılacak JSON dosyası bulunamadı."
        }
    }
}

@MainActor
public final class SeisAppleConversationContinuityStore: ObservableObject {
    @Published public private(set) var snapshot: SeisAppleConversationContinuitySnapshot
    @Published public var selectedSource: SeisAppleConversationSource
    @Published public var selectedThreadID: UUID?
    @Published public private(set) var statusMessage: String
    @Published public private(set) var lastMergeReport: SeisAppleConversationContinuityMergeReport?

    public let storageURL: URL

    public init(storageURL: URL? = nil) {
        let initialSnapshot = Self.seedSnapshot()
        self.snapshot = initialSnapshot
        self.selectedSource = .aiCore
        self.selectedThreadID = initialSnapshot.threads.first(where: { $0.source == .aiCore })?.id
        self.statusMessage = "Yalnızca yerel süreklilik hazırlanıyor."
        self.lastMergeReport = nil
        self.storageURL = storageURL ?? Self.defaultStorageURL()
        loadFromDisk()
    }

    public var selectedThread: SeisAppleConversationThread? {
        guard let selectedThreadID else { return nil }
        return snapshot.threads.first(where: { $0.id == selectedThreadID })
    }

    public var selectedApprovals: [SeisAppleClientApproval] {
        guard let selectedThreadID else { return [] }
        return snapshot.approvals
            .filter { $0.threadID == selectedThreadID }
            .sorted { $0.updatedAt > $1.updatedAt }
    }

    public func threads(for source: SeisAppleConversationSource) -> [SeisAppleConversationThread] {
        snapshot.threads
            .filter { $0.source == source }
            .sorted { $0.updatedAt > $1.updatedAt }
    }

    public func contextEvidence(for source: SeisAppleConversationSource) -> [SeisAppleContextEvidence] {
        snapshot.contextEvidence
            .filter { $0.source == source }
            .sorted { $0.capturedAt > $1.capturedAt }
    }

    public func sourceState(for source: SeisAppleConversationSource) -> SeisAppleConversationSourceState {
        snapshot.sourceStates.first(where: { $0.source == source })
            ?? Self.defaultSourceState(for: source)
    }

    public func selectSource(_ source: SeisAppleConversationSource) {
        selectedSource = source
        selectedThreadID = threads(for: source).first?.id
    }

    public func selectThread(_ id: UUID) {
        guard let thread = snapshot.threads.first(where: { $0.id == id }) else { return }
        selectedSource = thread.source
        selectedThreadID = id
    }

    @discardableResult
    public func createThread(title: String? = nil) -> UUID {
        let now = Date()
        let normalizedTitle = title?.trimmingCharacters(in: .whitespacesAndNewlines)
        let finalTitle = normalizedTitle?.isEmpty == false
            ? normalizedTitle!
            : "\(selectedSource.title) Sohbeti"
        let thread = SeisAppleConversationThread(
            source: selectedSource,
            title: finalTitle,
            summary: "Yeni yerel ajans-müşteri çalışma kaydı.",
            updatedAt: now,
            messages: [
                SeisAppleConversationMessage(
                    role: .system,
                    body: "Local Demo: Bu sohbet cihazda tutulur; canlı AI sağlayıcısı veya uzak bağlantı kullanılmaz.",
                    createdAt: now
                )
            ]
        )

        var next = snapshot
        next.threads.append(thread)
        next.updatedAt = now
        snapshot = next
        selectedThreadID = thread.id
        persist(status: "Yeni yerel sohbet oluşturuldu.")
        return thread.id
    }

    public func postMessage(_ body: String, role: SeisAppleConversationRole) {
        let normalizedBody = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !normalizedBody.isEmpty else {
            statusMessage = "Boş mesaj kaydedilmedi."
            return
        }

        if selectedThread == nil {
            createThread()
        }
        guard let selectedThreadID else { return }

        var next = snapshot
        guard let index = next.threads.firstIndex(where: { $0.id == selectedThreadID }) else { return }
        let now = Date()
        next.threads[index].messages.append(
            SeisAppleConversationMessage(
                role: role,
                body: normalizedBody,
                createdAt: now
            )
        )
        next.threads[index].summary = String(normalizedBody.prefix(140))
        next.threads[index].updatedAt = now
        next.updatedAt = now
        snapshot = next
        persist(status: "\(role.title) mesajı yerel sürekliliğe kaydedildi.")
    }

    public func submitSelectedThreadForApproval() {
        guard let thread = selectedThread else {
            statusMessage = "Onaya gönderilecek sohbet seçilmedi."
            return
        }
        if snapshot.approvals.contains(where: { $0.threadID == thread.id && $0.state == .pending }) {
            statusMessage = "Bu sohbet için zaten bekleyen bir müşteri kararı var."
            return
        }

        let now = Date()
        let approval = SeisAppleClientApproval(
            threadID: thread.id,
            source: thread.source,
            title: thread.title,
            request: "Ajans teslimat yönü için müşteri kararı bekleniyor. Bu kayıt herhangi bir dağıtım veya uzak işlemi otomatik çalıştırmaz.",
            createdAt: now,
            updatedAt: now,
            events: [
                SeisAppleClientDecisionEvent(
                    state: .pending,
                    actor: "SEIS Ajans",
                    note: "Yerel inceleme kaydı oluşturuldu.",
                    createdAt: now
                )
            ]
        )

        var next = snapshot
        next.approvals.append(approval)
        next.updatedAt = now
        snapshot = next
        persist(status: "Teslimat müşteri karar masasına alındı.")
    }

    public func resolveApproval(_ id: UUID, as state: SeisAppleClientApprovalState) {
        guard state != .pending else { return }
        var next = snapshot
        guard let index = next.approvals.firstIndex(where: { $0.id == id }) else { return }
        let now = Date()
        next.approvals[index].state = state
        next.approvals[index].updatedAt = now
        next.approvals[index].events.append(
            SeisAppleClientDecisionEvent(
                state: state,
                actor: "Müşteri",
                note: "Karar Apple-native süreklilik merkezinde yerel olarak kaydedildi.",
                createdAt: now
            )
        )
        next.updatedAt = now
        snapshot = next
        persist(status: "Müşteri kararı kaydedildi: \(state.title).")
    }

    public func exportData() throws -> Data {
        try Self.makeEncoder().encode(snapshot)
    }

    @discardableResult
    public func merge(importedData: Data) throws -> SeisAppleConversationContinuityMergeReport {
        let imported = try Self.makeDecoder().decode(
            SeisAppleConversationContinuitySnapshot.self,
            from: importedData
        )
        guard imported.schemaVersion == SeisAppleConversationContinuitySnapshot.currentSchemaVersion else {
            throw SeisAppleConversationContinuityError.unsupportedSchema(imported.schemaVersion)
        }

        var next = snapshot
        var report = SeisAppleConversationContinuityMergeReport()

        for importedState in imported.sourceStates {
            if let index = next.sourceStates.firstIndex(where: { $0.source == importedState.source }) {
                next.sourceStates[index].state = Self.moreRestrictive(
                    next.sourceStates[index].state,
                    importedState.state
                )
            } else {
                next.sourceStates.append(importedState)
            }
        }

        for importedThread in imported.threads {
            guard let index = next.threads.firstIndex(where: { $0.id == importedThread.id }) else {
                next.threads.append(importedThread)
                report.addedThreads += 1
                report.addedMessages += importedThread.messages.count
                continue
            }

            let localThread = next.threads[index]
            let localMessageIDs = Set(localThread.messages.map(\.id))
            let newMessages = importedThread.messages.filter { !localMessageIDs.contains($0.id) }
            report.addedMessages += newMessages.count
            next.threads[index].messages.append(contentsOf: newMessages)
            next.threads[index].messages.sort { $0.createdAt < $1.createdAt }
            if importedThread.updatedAt > localThread.updatedAt {
                next.threads[index].title = importedThread.title
                next.threads[index].summary = importedThread.summary
            }
            next.threads[index].updatedAt = max(localThread.updatedAt, importedThread.updatedAt)
            next.threads[index].state = Self.moreRestrictive(localThread.state, importedThread.state)
        }

        let localContextIDs = Set(next.contextEvidence.map(\.id))
        let newContext = imported.contextEvidence.filter { !localContextIDs.contains($0.id) }
        next.contextEvidence.append(contentsOf: newContext)
        report.addedContextItems = newContext.count

        for importedApproval in imported.approvals {
            guard let index = next.approvals.firstIndex(where: { $0.id == importedApproval.id }) else {
                next.approvals.append(importedApproval)
                report.addedApprovals += 1
                report.addedDecisionEvents += importedApproval.events.count
                continue
            }

            let localEventIDs = Set(next.approvals[index].events.map(\.id))
            let newEvents = importedApproval.events.filter { !localEventIDs.contains($0.id) }
            next.approvals[index].events.append(contentsOf: newEvents)
            next.approvals[index].events.sort { $0.createdAt < $1.createdAt }
            report.addedDecisionEvents += newEvents.count
            if importedApproval.updatedAt > next.approvals[index].updatedAt {
                next.approvals[index].state = importedApproval.state
                next.approvals[index].updatedAt = importedApproval.updatedAt
            }
        }

        next = Self.addingMissingSourceCoverage(to: next)
        next.updatedAt = Date()
        snapshot = next
        lastMergeReport = report
        if selectedThread == nil {
            selectedThreadID = threads(for: selectedSource).first?.id
        }
        persist(status: "Birleştirme tamamlandı: \(report.summary)")
        return report
    }

    public func reportStatus(_ message: String) {
        statusMessage = message
    }

    private func loadFromDisk() {
        guard FileManager.default.fileExists(atPath: storageURL.path) else {
            persist(status: "Yeni yerel süreklilik kasası oluşturuldu.")
            return
        }

        do {
            let data = try Data(contentsOf: storageURL)
            let loaded = try Self.makeDecoder().decode(
                SeisAppleConversationContinuitySnapshot.self,
                from: data
            )
            guard loaded.schemaVersion == SeisAppleConversationContinuitySnapshot.currentSchemaVersion else {
                throw SeisAppleConversationContinuityError.unsupportedSchema(loaded.schemaVersion)
            }
            snapshot = Self.addingMissingSourceCoverage(to: loaded)
            selectedThreadID = threads(for: selectedSource).first?.id
            statusMessage = "Yerel süreklilik kasası yüklendi."
        } catch {
            statusMessage = "Yerel kasa okunamadı; güvenli başlangıç verisi korundu: \(error.localizedDescription)"
        }
    }

    private func persist(status: String) {
        do {
            try FileManager.default.createDirectory(
                at: storageURL.deletingLastPathComponent(),
                withIntermediateDirectories: true
            )
            let data = try Self.makeEncoder().encode(snapshot)
            try data.write(to: storageURL, options: .atomic)
            statusMessage = status
        } catch {
            statusMessage = "Yerel kayıt başarısız: \(error.localizedDescription)"
        }
    }

    private static func defaultStorageURL() -> URL {
        let baseURL = FileManager.default.urls(
            for: .applicationSupportDirectory,
            in: .userDomainMask
        ).first ?? FileManager.default.temporaryDirectory
        return baseURL
            .appendingPathComponent("SEIS", isDirectory: true)
            .appendingPathComponent("ConversationContinuity", isDirectory: true)
            .appendingPathComponent("seis-conversation-continuity.json")
    }

    private static func makeEncoder() -> JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        return encoder
    }

    private static func makeDecoder() -> JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }

    private static func moreRestrictive(
        _ lhs: SeisAppleContinuityCapabilityState,
        _ rhs: SeisAppleContinuityCapabilityState
    ) -> SeisAppleContinuityCapabilityState {
        let rank: [SeisAppleContinuityCapabilityState: Int] = [
            .localOnly: 0,
            .metadataOnly: 1,
            .approvalNeeded: 2,
            .disabled: 3
        ]
        return (rank[lhs] ?? 3) >= (rank[rhs] ?? 3) ? lhs : rhs
    }

    private static func defaultSourceState(
        for source: SeisAppleConversationSource
    ) -> SeisAppleConversationSourceState {
        switch source {
        case .cloud:
            SeisAppleConversationSourceState(
                source: source,
                state: .disabled,
                detail: "CloudKit eşitlemesi entitlement ve müşteri onayı olmadan etkin değildir."
            )
        case .terminal:
            SeisAppleConversationSourceState(
                source: source,
                state: .metadataOnly,
                detail: "SSH komutu çalıştırılmaz; yalnızca güvenli durum meta verisi tutulur."
            )
        default:
            SeisAppleConversationSourceState(
                source: source,
                state: .localOnly,
                detail: "Bu kaynak Local Demo modunda uygulama sandbox'ında tutulur."
            )
        }
    }

    private static func addingMissingSourceCoverage(
        to snapshot: SeisAppleConversationContinuitySnapshot
    ) -> SeisAppleConversationContinuitySnapshot {
        var next = snapshot
        for source in SeisAppleConversationSource.allCases {
            if !next.sourceStates.contains(where: { $0.source == source }) {
                next.sourceStates.append(defaultSourceState(for: source))
            }
            if !next.threads.contains(where: { $0.source == source }) {
                next.threads.append(seedThread(for: source, now: Date()))
            }
        }
        return next
    }

    private static func seedThread(
        for source: SeisAppleConversationSource,
        now: Date
    ) -> SeisAppleConversationThread {
        SeisAppleConversationThread(
            source: source,
            title: "\(source.title) Sürekliliği",
            summary: "Local Demo çalışma kaydı; canlı entegrasyon iddiası yoktur.",
            updatedAt: now,
            messages: [
                SeisAppleConversationMessage(
                    role: .system,
                    body: "Local Demo: \(source.title) sohbet bağlamı yalnızca bu cihazda tutulur.",
                    createdAt: now
                )
            ]
        )
    }

    private static func seedSnapshot() -> SeisAppleConversationContinuitySnapshot {
        let now = Date()
        var threads = SeisAppleConversationSource.allCases.map { seedThread(for: $0, now: now) }
        if let aiIndex = threads.firstIndex(where: { $0.source == .aiCore }) {
            threads[aiIndex].messages.append(
                SeisAppleConversationMessage(
                    role: .client,
                    body: "SEIS'i Apple odaklı ve multiplatform geliştir; yeni ürün hattında HTML, CSS ve JavaScript yerine Swift/SwiftUI kullan.",
                    createdAt: now.addingTimeInterval(1)
                )
            )
            threads[aiIndex].messages.append(
                SeisAppleConversationMessage(
                    role: .agency,
                    body: "Ajans teslimat hattı Swift Package Manager, SwiftUI ve yerel güvenli durumlarla ilerleyecek; mevcut web demosu korunacak.",
                    createdAt: now.addingTimeInterval(2)
                )
            )
            threads[aiIndex].updatedAt = now.addingTimeInterval(2)
            threads[aiIndex].summary = "Apple-first Swift/SwiftUI ürün yönü kayıt altına alındı."
        }

        let contextEvidence = [
            SeisAppleContextEvidence(
                source: .desktop,
                title: "Apple-native kabuk",
                detail: "macOS ve iOS/iPadOS yüzeyleri SwiftUI üzerinden aynı süreklilik sözleşmesini kullanır.",
                capturedAt: now
            ),
            SeisAppleContextEvidence(
                source: .aiCore,
                title: "Sağlayıcı sınırı",
                detail: "Canlı AI sağlayıcısı yapılandırılmadı; çekirdek deneyim Local Demo olarak çalışır.",
                capturedAt: now
            ),
            SeisAppleContextEvidence(
                source: .commandCenter,
                title: "Ajans-müşteri yönetişimi",
                detail: "Ajans önerir ve teslim eder; müşteri kapsam, riskli işlem ve ürün yönü kararlarını verir.",
                capturedAt: now
            )
        ]

        let sourceStates = SeisAppleConversationSource.allCases.map(defaultSourceState(for:))
        return SeisAppleConversationContinuitySnapshot(
            workspaceID: "seis-apple-local-demo",
            workspaceTitle: "SEIS Apple Continuity",
            updatedAt: now,
            sourceStates: sourceStates,
            threads: threads,
            contextEvidence: contextEvidence,
            approvals: []
        )
    }
}
