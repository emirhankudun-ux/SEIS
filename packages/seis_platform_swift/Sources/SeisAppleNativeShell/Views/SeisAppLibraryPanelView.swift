import SeisPlatformKit
import SwiftUI
#if os(macOS)
import AppKit
#endif

struct SeisAppLibraryPanelView: View {
    let repositoryPath: String

    @State private var selectedSurfaceID = SeisAppLibraryContract.surfaces.first?.id ?? "seis-app-library"
    @State private var launchMessage: String?

    private enum Palette {
        static let cyan = Color(red: 0.30, green: 0.86, blue: 0.95)
        static let violet = Color(red: 0.65, green: 0.55, blue: 0.98)
        static let amber = Color(red: 1.0, green: 0.68, blue: 0.28)
        static let green = Color(red: 0.35, green: 0.86, blue: 0.56)
        static let panel = Color(red: 0.09, green: 0.105, blue: 0.13)
    }

    private var selectedSurface: SeisAppLibrarySurface {
        SeisAppLibraryContract.surface(id: selectedSurfaceID) ?? SeisAppLibraryContract.surfaces[0]
    }

    private var sourceSurfaces: [SeisAppLibrarySurface] {
        SeisAppLibraryContract.sourceLaneSurfaces
    }

    private var guardedSurfaces: [SeisAppLibrarySurface] {
        SeisAppLibraryContract.guardedLiveSurfaces
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            hero
            metricStrip
            surfaceGrid
            selectedSurfacePanel
            guardrailPanel
        }
        .padding(18)
        .background(
            LinearGradient(
                colors: [Palette.panel.opacity(0.96), Color.black.opacity(0.72)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: 12, style: .continuous)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.white.opacity(0.10), lineWidth: 1)
        )
        .accessibilityElement(children: .contain)
        .accessibilityLabel("SEIS App Library native panel")
    }

    private var hero: some View {
        HStack(alignment: .top, spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [Palette.cyan.opacity(0.26), Palette.violet.opacity(0.18)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 50, height: 50)

                Image(systemName: "square.grid.2x2.fill")
                    .font(.system(size: 23, weight: .semibold))
                    .foregroundStyle(Palette.cyan)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text(SeisAppLibraryContract.visibleTitle)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(.primary)

                Text("SEIS-visible Website and Ubuntu app lanes, plus separate AI, Code AI, AGI, and SSH control surfaces.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 12)

            VStack(alignment: .trailing, spacing: 6) {
                badge("LIB", systemImage: "square.grid.2x2", tint: Palette.cyan)
                badge("No keys", systemImage: "key.slash", tint: Palette.amber)
            }
        }
        .padding(14)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
    }

    private var metricStrip: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 132), spacing: 10)], spacing: 10) {
            metric("Apps", value: "\(SeisAppLibraryContract.moduleCount)", icon: "app.badge")
            metric("Website", value: "\(SeisPublicDemoLaneSource.website.moduleCount)", icon: "globe")
            metric("Ubuntu", value: "\(SeisPublicDemoLaneSource.ubuntu.moduleCount)", icon: "display")
            metric("Gated", value: "\(guardedSurfaces.count)", icon: "lock.shield")
        }
    }

    private var surfaceGrid: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 178), spacing: 10)], spacing: 10) {
            ForEach(SeisAppLibraryContract.surfaces) { surface in
                Button {
                    selectedSurfaceID = surface.id
                } label: {
                    VStack(alignment: .leading, spacing: 9) {
                        HStack(spacing: 8) {
                            Image(systemName: surface.systemImageName)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(tint(for: surface))
                                .frame(width: 18)

                            Text(surface.shortCode)
                                .font(.caption.monospaced().weight(.semibold))
                                .foregroundStyle(tint(for: surface))

                            Spacer()

                            if selectedSurfaceID == surface.id {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(Palette.green)
                            }
                        }

                        Text(surface.title)
                            .font(.caption.weight(.semibold))
                            .lineLimit(1)

                        Text(surface.status.rawValue)
                            .font(.caption2.monospaced())
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                    .padding(11)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 9, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 9, style: .continuous)
                            .stroke(selectedSurfaceID == surface.id ? tint(for: surface).opacity(0.42) : Color.white.opacity(0.08), lineWidth: 1)
                    )
                }
                .buttonStyle(.plain)
                .accessibilityLabel(surface.title)
            }
        }
    }

    private var selectedSurfacePanel: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill(tint(for: selectedSurface).opacity(0.15))
                        .frame(width: 44, height: 44)

                    Image(systemName: selectedSurface.systemImageName)
                        .foregroundStyle(tint(for: selectedSurface))
                }

                VStack(alignment: .leading, spacing: 5) {
                    Text(selectedSurface.title)
                        .font(.headline)

                    Text(selectedSurface.summary)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer()
            }

            HStack(spacing: 8) {
                badge(selectedSurface.shortCode, systemImage: selectedSurface.systemImageName, tint: tint(for: selectedSurface))
                badge(selectedSurface.status.rawValue, systemImage: "checklist", tint: selectedSurface.status == .noKeyDemo ? Palette.green : Palette.amber)
                if selectedSurface.requiresBackend {
                    badge("Backend", systemImage: "server.rack", tint: Palette.amber)
                }
                if selectedSurface.requiresHumanApproval {
                    badge("Review", systemImage: "person.crop.circle.badge.checkmark", tint: Palette.violet)
                }
            }

            if let deepLink = selectedSurface.deepLink {
                HStack(spacing: 9) {
                    Text(deepLink)
                        .font(.caption.monospaced())
                        .foregroundStyle(.secondary)
                        .lineLimit(1)

                    Spacer()

                    Button {
                        openDeepLink(deepLink)
                    } label: {
                        Label("Open", systemImage: "arrow.up.right.square")
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                }
            } else if !selectedSurface.forbiddenLiveClaims.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Live gate")
                        .font(.caption.weight(.semibold))
                    ForEach(selectedSurface.forbiddenLiveClaims, id: \.self) { claim in
                        Label(claim, systemImage: "xmark.shield")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            if let launchMessage {
                Text(launchMessage)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(14)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
    }

    private var guardrailPanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Public Demo Boundary", systemImage: "lock.doc")
                .font(.caption.weight(.semibold))

            Text(SeisAppLibraryContract.hiddenSourcePolicy)
                .font(.caption)
                .foregroundStyle(.secondary)

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 190), spacing: 8)], spacing: 8) {
                ForEach(sourceSurfaces) { surface in
                    Label("\(surface.shortCode) \(surface.title)", systemImage: surface.systemImageName)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .padding(8)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.white.opacity(0.045), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                }
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
    }

    private func metric(_ title: String, value: String, icon: String) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            Label(title, systemImage: icon)
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.title3.monospacedDigit().weight(.semibold))
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 9, style: .continuous))
    }

    private func badge(_ text: String, systemImage: String, tint: Color) -> some View {
        Label(text, systemImage: systemImage)
            .font(.caption2.weight(.semibold))
            .foregroundStyle(tint)
            .padding(.horizontal, 8)
            .padding(.vertical, 5)
            .background(tint.opacity(0.10), in: Capsule(style: .continuous))
    }

    private func tint(for surface: SeisAppLibrarySurface) -> Color {
        switch surface.kind {
        case .library:
            return Palette.cyan
        case .nativeShell:
            return Palette.amber
        case .sourceLane:
            return surface.laneSource == .website ? Palette.violet : Palette.green
        case .aiChat:
            return Palette.cyan
        case .codeAI:
            return Palette.violet
        case .agiControl:
            return Palette.amber
        case .sshControl:
            return Palette.green
        }
    }

    private func openDeepLink(_ deepLink: String) {
        #if os(macOS)
        let rootURL = URL(fileURLWithPath: SeisRepositoryRootResolver.resolve(preferredPath: repositoryPath))
        guard let fileURL = SeisPublicDemoLaneRoute.fileURL(repositoryRoot: rootURL, deepLink: deepLink) else {
            launchMessage = "Blocked: public demo lane did not pass route validation."
            return
        }

        NSWorkspace.shared.open(fileURL)
        launchMessage = "Opened \(selectedSurface.shortCode) public demo lane."
        #else
        launchMessage = "Opening public demo lanes is available on macOS."
        #endif
    }
}
