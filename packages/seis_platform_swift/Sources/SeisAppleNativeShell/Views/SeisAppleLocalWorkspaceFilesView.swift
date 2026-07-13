import SeisPlatformKit
import SwiftUI

struct SeisAppleLocalWorkspaceFilesView: View {
    private let repositoryPath: String
    @SceneStorage("seis.apple.local-files.query") private var query = ""
    @SceneStorage("seis.apple.local-files.kind") private var kindRawValue = "all"
    @State private var index: SeisAppleLocalWorkspaceIndex
    @State private var selectedPath: String?

    init(repositoryPath: String) {
        self.repositoryPath = repositoryPath
        _index = State(
            initialValue: SeisAppleLocalWorkspaceIndex(
                rootPath: repositoryPath,
                entries: [],
                state: .rootMissing
            )
        )
    }

    private var filteredEntries: [SeisAppleLocalWorkspaceEntry] {
        let normalizedQuery = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        return index.entries.filter { entry in
            let kindMatches = kindRawValue == "all" || entry.kind.rawValue == kindRawValue
            let queryMatches = normalizedQuery.isEmpty || entry.relativePath.lowercased().contains(normalizedQuery)
            return kindMatches && queryMatches
        }
    }

    private var selectedEntry: SeisAppleLocalWorkspaceEntry? {
        guard let selectedPath else { return nil }
        return index.entries.first { $0.id == selectedPath }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: "folder.badge.gearshape")
                    .font(.title2)
                    .foregroundStyle(.tint)
                VStack(alignment: .leading, spacing: 3) {
                    Text("SEIS Local Files").font(.headline)
                    Text("Allow-listed workspace metadata only; file contents and mutations stay disabled.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer(minLength: 8)
                Button {
                    refresh()
                } label: {
                    Label("Refresh", systemImage: "arrow.clockwise")
                }
                .buttonStyle(.bordered)
                .accessibilityHint("Scans the selected local workspace for safe metadata only.")
            }

            HStack(spacing: 8) {
                TextField("Filter workspace paths", text: $query)
                    .textFieldStyle(.roundedBorder)
                Text("\(filteredEntries.count)/\(index.entries.count)")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.tertiary)
            }

            Picker("File kind", selection: $kindRawValue) {
                Text("All").tag("all")
                Text("Files").tag(SeisAppleLocalWorkspaceEntryKind.file.rawValue)
                Text("Folders").tag(SeisAppleLocalWorkspaceEntryKind.directory.rawValue)
            }
            .pickerStyle(.segmented)

            HStack(spacing: 8) {
                Label(index.state.rawValue, systemImage: stateIcon)
                    .font(.caption2.monospaced())
                    .foregroundStyle(stateColor)
                Text("Root: \(index.rootPath)")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                    .lineLimit(1)
            }

            if filteredEntries.isEmpty {
                Text(index.state == .rootMissing ? "Local workspace root is unavailable." : "No safe local metadata matches this filter.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.vertical, 12)
            } else {
                ForEach(filteredEntries) { entry in
                    Button {
                        selectedPath = entry.id
                    } label: {
                        entryRow(entry)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Inspect local \(entry.kind.rawValue) \(entry.relativePath)")
                }
            }

            if let selectedEntry {
                detail(selectedEntry)
            }
        }
        .padding(16)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
        .accessibilityElement(children: .contain)
        .accessibilityLabel("SEIS Local Files. Safe workspace metadata index with content reads and mutations disabled.")
        .onAppear(perform: refresh)
    }

    private func entryRow(_ entry: SeisAppleLocalWorkspaceEntry) -> some View {
        HStack(alignment: .top, spacing: 9) {
            Image(systemName: entry.kind == .directory ? "folder" : "doc.text")
                .foregroundStyle(entry.kind == .directory ? .blue : .secondary)
                .frame(width: 20)
            VStack(alignment: .leading, spacing: 3) {
                Text(entry.relativePath)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.primary)
                    .lineLimit(2)
                Text("\(entry.kind.rawValue) · \(formatBytes(entry.byteCount))")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
            Image(systemName: "chevron.right")
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding(9)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
    }

    private func detail(_ entry: SeisAppleLocalWorkspaceEntry) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(entry.relativePath).font(.subheadline.weight(.semibold))
            Text("Kind: \(entry.kind.rawValue) · Size: \(formatBytes(entry.byteCount))")
                .font(.caption2.monospaced())
                .foregroundStyle(.secondary)
            Text("Metadata only. SEIS does not read, open, rename, delete, or write this entry from this surface.")
                .font(.caption2)
                .foregroundStyle(.orange)
        }
        .padding(10)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(entry.relativePath). Metadata only; no content read or file mutation.")
    }

    private func refresh() {
        index = SeisAppleLocalWorkspaceIndex.scan(rootURL: URL(fileURLWithPath: repositoryPath))
        if selectedPath != nil, selectedEntry == nil {
            selectedPath = nil
        }
    }

    private var stateIcon: String {
        switch index.state {
        case .ready: "checkmark.circle"
        case .empty: "tray"
        case .limited: "exclamationmark.triangle"
        case .rootMissing: "questionmark.folder"
        }
    }

    private var stateColor: Color {
        switch index.state {
        case .ready: .green
        case .empty: .secondary
        case .limited: .orange
        case .rootMissing: .red
        }
    }

    private func formatBytes(_ count: Int64) -> String {
        ByteCountFormatter.string(fromByteCount: count, countStyle: .file)
    }
}
