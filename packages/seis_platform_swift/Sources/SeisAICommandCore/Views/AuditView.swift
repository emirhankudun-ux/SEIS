import SwiftUI
#if os(macOS)
import AppKit
#endif

struct AuditView: View {
    @ObservedObject var store: SeisAICommandCoreStore
    @State private var copied = false

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            SurfaceCard {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Audit timeline")
                            .font(.headline)
                        Text("Local run history, approval changes, prompt changes, and evaluation refreshes.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Button {
                        copyAudit()
                    } label: {
                        Label(copied ? "Copied" : "Copy audit", systemImage: copied ? "checkmark" : "doc.on.doc")
                    }
                    .buttonStyle(.bordered)
                }
            }

            VStack(spacing: 10) {
                ForEach(store.auditEvents.reversed()) { event in
                    SurfaceCard {
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "circle.fill")
                                .font(.system(size: 8))
                                .foregroundStyle(.tint)
                                .padding(.top, 6)
                            VStack(alignment: .leading, spacing: 4) {
                                Text(event.title)
                                    .font(.callout.weight(.semibold))
                                Text(event.detail)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                Text(event.createdAt, style: .time)
                                    .font(.caption2.monospacedDigit())
                                    .foregroundStyle(.tertiary)
                            }
                            Spacer()
                        }
                    }
                }
            }
        }
    }

    private func copyAudit() {
        #if os(macOS)
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(store.exportAuditText(), forType: .string)
        #endif
        copied = true
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 1_200_000_000)
            copied = false
        }
    }
}
