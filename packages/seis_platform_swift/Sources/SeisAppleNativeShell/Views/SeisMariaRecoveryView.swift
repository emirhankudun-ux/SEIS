#if os(macOS)
import Foundation
import SeisPlatformKit
import SwiftUI
import UniformTypeIdentifiers

/// On-demand inspection, not a live dashboard or an execution surface.
@MainActor
struct SeisMariaRecoveryView: View {
    @State private var state = SeisMariaRecoveryImportState()
    @State private var showsImporter = false
    @State private var importTask: Task<Void, Never>?

    init(initialState: SeisMariaRecoveryImportState = SeisMariaRecoveryImportState()) {
        _state = State(initialValue: initialState)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text("MARIA · Oturum kayıtları").font(.title2.bold())
                Label("Yalnızca görüntüleme · Canlı bağlantı yok", systemImage: "eye")
                    .font(.subheadline).foregroundStyle(.secondary)
            }
            HStack(spacing: 12) {
                Button {
                    showsImporter = true
                } label: {
                    Label("JSON görüntüsü seç…", systemImage: "square.and.arrow.down")
                }
                .disabled(state.phase == .loading)
                .help("Yalnızca seçtiğin dosya yerel olarak okunur; en fazla 64 KiB.")
                Button("Görünümü temizle") { clear() }
                    .disabled(state.phase == .unloaded)
                    .help("Dosyayı silmez. Yalnızca bu penceredeki görüntüyü temizler.")
            }
            Divider()
            content
            Spacer(minLength: 0)
            Text("İçe aktarılan dosyanın güncelliği ve kaynağı doğrulanmaz. Bağlamın uyumlu görünmesi işlem izni değildir. Tamamlanmış kayıt, doğrulanmış başarı anlamına gelmez.")
                .font(.caption).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
        }
        .padding(24)
        .frame(minWidth: 520, minHeight: 380)
        .fileImporter(isPresented: $showsImporter, allowedContentTypes: [.json]) { result in
            switch result {
            case .success(let url): load(url)
            case .failure:
                let token = state.beginImport()
                state.finishImport(token: token, result: .failure(.unreadableFile))
            }
        }
        .onDisappear { clear() }
    }

    @ViewBuilder
    private var content: some View {
        switch state.phase {
        case .unloaded:
            Label("Henüz kayıt yüklenmedi", systemImage: "tray")
            Text("Bir recovery wire v1 JSON dosyası seç. Checkpoint dizinleri otomatik taranmaz.")
                .foregroundStyle(.secondary)
        case .loading:
            ProgressView("Dosya doğrulanıyor…")
        case .invalid(let error):
            Label("Görüntü yüklenemedi", systemImage: "exclamationmark.triangle")
            Text(errorLabel(error)).foregroundStyle(.secondary)
        case .loaded(let snapshot):
            Text(verbatim: snapshot.projectID).font(.headline).lineLimit(2)
            Text("\(snapshot.totalCandidates) kayıt · \(snapshot.replanRequired) yeniden planlama · \(snapshot.driftDetected) bağlam değişikliği")
                .font(.subheadline).foregroundStyle(.secondary)
            if snapshot.rows.isEmpty {
                Label("Bu görüntüde kayıt yok", systemImage: "tray")
            } else {
                List(snapshot.rows) { row in
                    VStack(alignment: .leading, spacing: 5) {
                        Text(verbatim: row.workID).font(.headline).lineLimit(2)
                        Label(row.disposition.turkishLabel, systemImage: symbol(row.disposition))
                            .font(.subheadline)
                        if !row.detailFields.isEmpty {
                            Text(row.detailFields.map(detailLabel).joined(separator: ", "))
                                .font(.caption).foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 6)
                    .accessibilityElement(children: .combine)
                }
                .listStyle(.plain)
                .accessibilityLabel("İçe aktarılan oturum kayıtları")
            }
        }
    }

    private func load(_ url: URL) {
        importTask?.cancel()
        let token = state.beginImport()
        importTask = Task { @MainActor in
            let result = await Task.detached(priority: .userInitiated) {
                () -> Result<SeisMariaRecoverySnapshot, SeisMariaRecoveryError> in
                let scoped = url.startAccessingSecurityScopedResource()
                defer { if scoped { url.stopAccessingSecurityScopedResource() } }
                do {
                    return .success(try SeisMariaRecoveryFileReader.read(url))
                } catch let error as SeisMariaRecoveryError {
                    return .failure(error)
                } catch {
                    return .failure(.unreadableFile)
                }
            }.value
            guard !Task.isCancelled else { return }
            state.finishImport(token: token, result: result)
        }
    }

    private func clear() {
        importTask?.cancel()
        importTask = nil
        state.clear()
    }

    private func errorLabel(_ error: SeisMariaRecoveryError) -> String {
        switch error {
        case .invalidPayloadSize: "Dosya boş veya 64 KiB sınırını aşıyor."
        case .unsupportedVersion: "Bu wire sürümü desteklenmiyor."
        case .wrongProject: "Proje kimlikleri uyuşmuyor."
        case .unreadableFile, .notRegularFile: "Seçilen dosya güvenli biçimde okunamadı."
        default: "JSON sözleşmesi veya kayıt tutarlılığı doğrulanamadı."
        }
    }

    private func symbol(_ disposition: SeisMariaRecoveryDisposition) -> String {
        switch disposition {
        case .anchorMissing, .evidenceRequired: "exclamationmark.triangle"
        case .driftDetected: "arrow.triangle.branch"
        case .alignedReplanRequired: "arrow.triangle.2.circlepath"
        case .complete: "checkmark.circle"
        }
    }

    private func detailLabel(_ field: String) -> String {
        switch field {
        case "active_goal": "Aktif hedef"
        case "current_repo": "Depo"
        case "current_branch": "Dal"
        case "repository_revision": "Commit"
        default: "Diğer bağlam alanı"
        }
    }
}
#endif
