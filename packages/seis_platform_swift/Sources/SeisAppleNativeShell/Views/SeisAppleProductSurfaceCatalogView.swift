import SeisPlatformKit
import SwiftUI

struct SeisAppleProductSurfaceCatalogView: View {
    private let catalog: SeisAppleProductSurfaceCatalog
    @SceneStorage("seis.apple.product-surface.query") private var query = ""
    @SceneStorage("seis.apple.product-surface.selected") private var selectedSurfaceRawValue: String?

    init(catalog: SeisAppleProductSurfaceCatalog = .defaultCatalog) {
        self.catalog = catalog
    }

    private var filteredSurfaces: [SeisAppleProductSurface] { catalog.filtered(by: query) }
    private var selectedSurface: SeisAppleProductSurface? {
        guard let selectedSurfaceRawValue,
              let selectedSurfaceID = SeisAppleProductSurfaceID(rawValue: selectedSurfaceRawValue)
        else { return nil }
        return catalog.surfaces.first { $0.id == selectedSurfaceID }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: "square.grid.2x2")
                    .font(.title2)
                    .foregroundStyle(.tint)
                    .frame(width: 34, height: 34)
                    .background(.tint.opacity(0.12), in: RoundedRectangle(cornerRadius: 9))
                VStack(alignment: .leading, spacing: 3) {
                    Text("SEIS Product Surface Atlas").font(.headline)
                    Text("All named SEIS surfaces with explicit native, browser, planned, and approval boundaries")
                        .font(.caption).foregroundStyle(.secondary)
                }
                Spacer(minLength: 8)
                Text("\(catalog.surfaces.count) surfaces").font(.caption2.monospaced()).foregroundStyle(.tertiary)
            }

            TextField("Filter SEIS surfaces", text: $query).textFieldStyle(.roundedBorder)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                ForEach(filteredSurfaces) { surface in
                    Button { selectedSurfaceRawValue = surface.id.rawValue } label: { surfaceTile(surface) }
                        .buttonStyle(.plain)
                        .accessibilityLabel("Inspect \(surface.title), \(surface.state.displayLabel)")
                }
            }

            if let selectedSurface { detail(selectedSurface) }
        }
        .padding(16)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
        .accessibilityElement(children: .contain)
        .accessibilityLabel("SEIS Product Surface Atlas with \(catalog.surfaces.count) surfaces.")
    }

    private func surfaceTile(_ surface: SeisAppleProductSurface) -> some View {
        HStack(alignment: .top, spacing: 9) {
            Image(systemName: surface.systemImage).foregroundStyle(.tint).frame(width: 22)
            VStack(alignment: .leading, spacing: 3) {
                Text(surface.title).font(.caption.weight(.semibold)).foregroundStyle(.primary).lineLimit(2)
                Text(surface.state.displayLabel).font(.caption2.monospaced()).foregroundStyle(stateColor(surface.state))
            }
            Spacer(minLength: 0)
            Image(systemName: "chevron.right").font(.caption2.weight(.semibold)).foregroundStyle(.tertiary)
        }
        .padding(10)
        .frame(maxWidth: .infinity, minHeight: 62, alignment: .leading)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8))
    }

    private func detail(_ surface: SeisAppleProductSurface) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack {
                Label(surface.title, systemImage: surface.systemImage).font(.subheadline.weight(.semibold))
                Spacer(minLength: 8)
                Text(surface.state.displayLabel).font(.caption2.monospaced()).foregroundStyle(stateColor(surface.state))
            }
            Text(surface.subtitle).font(.caption).foregroundStyle(.secondary)
            Text("Boundary: \(surface.boundary)").font(.caption2.monospaced()).foregroundStyle(.secondary)
            Text("Evidence: \(surface.evidence)").font(.caption2).foregroundStyle(.tertiary)
            Text("This catalog action inspects a contract only; it does not execute the surface.")
                .font(.caption2).foregroundStyle(.orange)
        }
        .padding(10)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(surface.title). \(surface.state.displayLabel). Boundary: \(surface.boundary). Evidence: \(surface.evidence). Inspection only; no execution.")
    }

    private func stateColor(_ state: SeisAppleProductSurfaceState) -> Color {
        switch state {
        case .nativeLocalDemo: .green
        case .browserLocalDemo: .blue
        case .planned: .secondary
        case .approvalRequired: .orange
        }
    }
}
