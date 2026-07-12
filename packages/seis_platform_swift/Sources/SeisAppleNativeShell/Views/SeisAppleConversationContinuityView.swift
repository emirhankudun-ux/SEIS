import SeisPlatformKit
import SwiftUI
import UniformTypeIdentifiers

@available(macOS 13.0, iOS 16.0, *)
struct SeisAppleConversationContinuityView: View {
    @StateObject private var store = SeisAppleConversationContinuityStore()
    @State private var composerText = ""
    @State private var composerRole: SeisAppleConversationRole = .client
    @State private var isImporting = false
    @State private var isExporting = false
    @State private var exportDocument = SeisConversationContinuityDocument()
    @FocusState private var composerFocused: Bool

    var body: some View {
        NavigationSplitView {
            sourceSidebar
                .navigationSplitViewColumnWidth(min: 220, ideal: 260, max: 320)
        } content: {
            conversationColumn
                .navigationSplitViewColumnWidth(min: 360, ideal: 560)
        } detail: {
            inspectorColumn
                .navigationSplitViewColumnWidth(min: 280, ideal: 340, max: 440)
        }
        .background(continuityBackground)
        .toolbar { continuityToolbar }
        .fileImporter(
            isPresented: $isImporting,
            allowedContentTypes: [.json],
            allowsMultipleSelection: false,
            onCompletion: importContinuity
        )
        .fileExporter(
            isPresented: $isExporting,
            document: exportDocument,
            contentType: .json,
            defaultFilename: "seis-conversation-continuity"
        ) { result in
            switch result {
            case .success:
                store.reportStatus("Süreklilik arşivi dışa aktarıldı.")
            case .failure(let error):
                store.reportStatus("Dışa aktarma başarısız: \(error.localizedDescription)")
            }
        }
    }

    private var sourceSidebar: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Label("Apple-first", systemImage: "apple.logo")
                        .font(.headline)
                    Text("Tüm SEIS sohbetleri için yerel, güvenli ve birleştirilebilir çalışma alanı.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    capabilityBadge(.localOnly)
                }
                .padding(.vertical, 6)
            }

            Section("SEIS Kaynakları") {
                ForEach(SeisAppleConversationSource.allCases) { source in
                    Button {
                        store.selectSource(source)
                    } label: {
                        sourceRow(source)
                    }
                    .buttonStyle(.plain)
                }
            }

            Section {
                ForEach(store.threads(for: store.selectedSource)) { thread in
                    Button {
                        store.selectThread(thread.id)
                    } label: {
                        HStack(spacing: 9) {
                            Image(systemName: thread.id == store.selectedThreadID ? "bubble.left.fill" : "bubble.left")
                                .foregroundStyle(thread.id == store.selectedThreadID ? Color.accentColor : .secondary)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(thread.title)
                                    .font(.subheadline.weight(.medium))
                                    .lineLimit(1)
                                Text(thread.updatedAt, format: .dateTime.day().month().hour().minute())
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(.vertical, 3)
                    }
                    .buttonStyle(.plain)
                }
            } header: {
                HStack {
                    Text("Sohbetler")
                    Spacer()
                    Button {
                        store.createThread()
                    } label: {
                        Image(systemName: "plus.circle.fill")
                    }
                    .buttonStyle(.plain)
                    .help("Yeni yerel sohbet")
                }
            }
        }
        .listStyle(.sidebar)
        .navigationTitle("Süreklilik")
    }

    private var conversationColumn: some View {
        Group {
            if let thread = store.selectedThread {
                VStack(spacing: 0) {
                    conversationHeader(thread)
                    Divider()
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(thread.messages) { message in
                                SeisConversationMessageBubble(message: message)
                            }
                        }
                        .padding(18)
                    }
                }
                .safeAreaInset(edge: .bottom) {
                    composer
                }
            } else {
                VStack(spacing: 12) {
                    Image(systemName: "bubble.left.and.bubble.right")
                        .font(.system(size: 36, weight: .medium))
                        .foregroundStyle(.secondary)
                    Text("Sohbet Seçilmedi")
                        .font(.title3.weight(.semibold))
                    Text("Bir SEIS kaynağı seçin veya yeni yerel sohbet oluşturun.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(24)
            }
        }
        .background(.thinMaterial)
    }

    private var inspectorColumn: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                inspectorHero
                safetyCard

                sectionTitle("Bağlam Kanıtı", systemImage: "doc.text.magnifyingglass")
                let evidence = store.contextEvidence(for: store.selectedSource)
                if evidence.isEmpty {
                    emptyCard("Bu kaynak için henüz yerel bağlam kanıtı yok.")
                } else {
                    ForEach(evidence) { item in
                        contextCard(item)
                    }
                }

                sectionTitle("Müşteri Karar Masası", systemImage: "checkmark.seal")
                if store.selectedApprovals.isEmpty {
                    emptyCard("Bu sohbet için bekleyen veya tamamlanmış karar bulunmuyor.")
                } else {
                    ForEach(store.selectedApprovals) { approval in
                        approvalCard(approval)
                    }
                }

                Button {
                    store.submitSelectedThreadForApproval()
                } label: {
                    Label("Teslimatı Onaya Gönder", systemImage: "paperplane")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)

                Text("Onay kaydı yalnızca yerel yönetişim verisidir. GitHub merge, dağıtım, CloudKit veya SSH işlemi çalıştırmaz.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(16)
        }
        .background(.ultraThinMaterial)
        .navigationTitle("Bağlam ve Kararlar")
    }

    private var inspectorHero: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: store.selectedSource.systemImage)
                .font(.system(size: 28, weight: .semibold))
                .foregroundStyle(.tint)
            Text(store.selectedSource.title)
                .font(.title2.weight(.bold))
            Text("Ajans teslimatı ile müşteri kararını aynı yerel kayıtta tutar.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var safetyCard: some View {
        let sourceState = store.sourceState(for: store.selectedSource)
        return VStack(alignment: .leading, spacing: 8) {
            HStack {
                Label("Çalışma Sınırı", systemImage: "lock.shield")
                    .font(.headline)
                Spacer()
                capabilityBadge(sourceState.state)
            }
            Text(sourceState.detail)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Divider()
            Text(store.statusMessage)
                .font(.caption)
                .foregroundStyle(.secondary)
                .textSelection(.enabled)
        }
        .padding(14)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(.white.opacity(0.08), lineWidth: 1)
        }
    }

    private func sourceRow(_ source: SeisAppleConversationSource) -> some View {
        let isSelected = source == store.selectedSource
        let sourceState = store.sourceState(for: source)
        return HStack(spacing: 10) {
            Image(systemName: source.systemImage)
                .frame(width: 22)
                .foregroundStyle(isSelected ? Color.white : Color.accentColor)
            Text(source.title)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(isSelected ? Color.white : Color.primary)
            Spacer()
            Circle()
                .fill(stateColor(sourceState.state))
                .frame(width: 7, height: 7)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(
            isSelected ? Color.accentColor : Color.clear,
            in: RoundedRectangle(cornerRadius: 10, style: .continuous)
        )
        .contentShape(Rectangle())
    }

    private func conversationHeader(_ thread: SeisAppleConversationThread) -> some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(thread.title)
                    .font(.title3.weight(.semibold))
                Text(thread.summary)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            Spacer()
            capabilityBadge(thread.state)
        }
        .padding(16)
        .background(.regularMaterial)
    }

    private var composer: some View {
        VStack(spacing: 10) {
            HStack {
                Picker("Gönderen", selection: $composerRole) {
                    ForEach([SeisAppleConversationRole.client, .agency], id: \.self) { role in
                        Label(role.title, systemImage: role.systemImage)
                            .tag(role)
                    }
                }
                .pickerStyle(.segmented)
                .frame(maxWidth: 280)
                Spacer()
                Label("Local Demo", systemImage: "lock.fill")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
            }

            HStack(alignment: .bottom, spacing: 10) {
                TextField("Kararı, talebi veya ajans notunu kaydet…", text: $composerText, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(1...4)
                    .focused($composerFocused)
                    .onSubmit(sendMessage)
                Button(action: sendMessage) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 28))
                }
                .buttonStyle(.plain)
                .disabled(composerText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                .accessibilityLabel("Mesajı yerel sürekliliğe kaydet")
            }
        }
        .padding(12)
        .background(.regularMaterial)
        .overlay(alignment: .top) { Divider() }
    }

    private func contextCard(_ item: SeisAppleContextEvidence) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack {
                Text(item.title)
                    .font(.subheadline.weight(.semibold))
                Spacer()
                capabilityBadge(item.state)
            }
            Text(item.detail)
                .font(.caption)
                .foregroundStyle(.secondary)
                .textSelection(.enabled)
            Text(item.capturedAt, format: .dateTime.day().month().year().hour().minute())
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private func approvalCard(_ approval: SeisAppleClientApproval) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(approval.title)
                    .font(.subheadline.weight(.semibold))
                Spacer()
                Text(approval.state.title)
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(approvalColor(approval.state))
            }
            Text(approval.request)
                .font(.caption)
                .foregroundStyle(.secondary)

            if approval.state == .pending || approval.state == .needsChanges {
                HStack {
                    Button("Onayla") {
                        store.resolveApproval(approval.id, as: .approved)
                    }
                    .buttonStyle(.borderedProminent)
                    Button("Revizyon İste") {
                        store.resolveApproval(approval.id, as: .needsChanges)
                    }
                    .buttonStyle(.bordered)
                }
                .controlSize(.small)
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private func sectionTitle(_ title: String, systemImage: String) -> some View {
        Label(title, systemImage: systemImage)
            .font(.headline)
            .padding(.top, 4)
    }

    private func emptyCard(_ message: String) -> some View {
        Text(message)
            .font(.caption)
            .foregroundStyle(.secondary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(12)
            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private func capabilityBadge(_ state: SeisAppleContinuityCapabilityState) -> some View {
        Text(state.rawValue)
            .font(.caption2.monospaced().weight(.semibold))
            .foregroundStyle(stateColor(state))
            .padding(.horizontal, 7)
            .padding(.vertical, 4)
            .background(stateColor(state).opacity(0.12), in: Capsule())
    }

    private func stateColor(_ state: SeisAppleContinuityCapabilityState) -> Color {
        switch state {
        case .localOnly: .cyan
        case .metadataOnly: .blue
        case .approvalNeeded: .orange
        case .disabled: .secondary
        }
    }

    private func approvalColor(_ state: SeisAppleClientApprovalState) -> Color {
        switch state {
        case .pending: .orange
        case .approved: .green
        case .needsChanges: .yellow
        case .rejected: .red
        }
    }

    private var continuityBackground: some View {
        LinearGradient(
            colors: [
                Color(red: 0.035, green: 0.08, blue: 0.12),
                Color(red: 0.02, green: 0.14, blue: 0.18),
                Color(red: 0.04, green: 0.07, blue: 0.09)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }

    @ToolbarContentBuilder
    private var continuityToolbar: some ToolbarContent {
        ToolbarItemGroup {
            Button {
                isImporting = true
            } label: {
                Label("Birleştir", systemImage: "square.and.arrow.down")
            }
            .help("Başka bir SEIS süreklilik JSON dosyasını silmeden birleştir")

            Button(action: prepareExport) {
                Label("Dışa Aktar", systemImage: "square.and.arrow.up")
            }
            .help("Cihazlar arası güvenli aktarım için JSON arşivi oluştur")
        }
    }

    private func sendMessage() {
        let message = composerText
        store.postMessage(message, role: composerRole)
        if !message.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            composerText = ""
            composerFocused = true
        }
    }

    private func prepareExport() {
        do {
            exportDocument = SeisConversationContinuityDocument(data: try store.exportData())
            isExporting = true
        } catch {
            store.reportStatus("Dışa aktarma hazırlanamadı: \(error.localizedDescription)")
        }
    }

    private func importContinuity(_ result: Result<[URL], Error>) {
        do {
            let urls = try result.get()
            guard let url = urls.first else {
                throw SeisAppleConversationContinuityError.missingImportFile
            }
            let didAccess = url.startAccessingSecurityScopedResource()
            defer {
                if didAccess {
                    url.stopAccessingSecurityScopedResource()
                }
            }
            try store.merge(importedData: Data(contentsOf: url))
        } catch {
            store.reportStatus("Birleştirme başarısız: \(error.localizedDescription)")
        }
    }
}

@available(macOS 13.0, iOS 16.0, *)
struct SeisApplePlatformWorkspaceView: View {
    private enum Workspace: String, CaseIterable, Identifiable {
        case continuity
        case platform

        var id: String { rawValue }

        var title: String {
            switch self {
            case .continuity: "Sohbet Sürekliliği"
            case .platform: "Platform Durumu"
            }
        }
    }

    @State private var workspace: Workspace = .continuity

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 3) {
                    Text("SEIS Apple Workspace")
                        .font(.title3.weight(.semibold))
                    Text("SwiftUI tabanlı yerel ürün ve süreklilik yüzeyleri")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Picker("Apple çalışma alanı", selection: $workspace) {
                    ForEach(Workspace.allCases) { item in
                        Text(item.title).tag(item)
                    }
                }
                .pickerStyle(.segmented)
                .frame(maxWidth: 360)
            }
            .padding(.horizontal, 4)

            Group {
                switch workspace {
                case .continuity:
                    SeisAppleConversationContinuityView()
                case .platform:
                    AppleContinuationWindow()
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
    }
}

@available(macOS 13.0, iOS 16.0, *)
private struct SeisConversationMessageBubble: View {
    let message: SeisAppleConversationMessage

    var body: some View {
        HStack {
            if message.role == .client { Spacer(minLength: 42) }
            VStack(alignment: .leading, spacing: 6) {
                Label(message.role.title, systemImage: message.role.systemImage)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(roleColor)
                Text(message.body)
                    .font(.body)
                    .textSelection(.enabled)
                HStack(spacing: 6) {
                    Text(message.createdAt, format: .dateTime.day().month().hour().minute())
                    if message.isLocalDemo {
                        Text("Local Demo")
                    }
                }
                .font(.caption2)
                .foregroundStyle(.secondary)
            }
            .padding(12)
            .background(bubbleColor, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            if message.role != .client { Spacer(minLength: 42) }
        }
    }

    private var roleColor: Color {
        switch message.role {
        case .client: .cyan
        case .agency: .blue
        case .system: .secondary
        }
    }

    private var bubbleColor: Color {
        switch message.role {
        case .client: Color.cyan.opacity(0.13)
        case .agency: Color.blue.opacity(0.13)
        case .system: Color.secondary.opacity(0.1)
        }
    }
}

@available(macOS 13.0, iOS 16.0, *)
private struct SeisConversationContinuityDocument: FileDocument {
    static var readableContentTypes: [UTType] { [.json] }

    var data: Data

    init(data: Data = Data()) {
        self.data = data
    }

    init(configuration: ReadConfiguration) throws {
        data = configuration.file.regularFileContents ?? Data()
    }

    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper {
        FileWrapper(regularFileWithContents: data)
    }
}
