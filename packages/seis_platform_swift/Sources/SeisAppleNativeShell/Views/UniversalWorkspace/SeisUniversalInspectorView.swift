import SeisPlatformKit
import SwiftUI

struct SeisUniversalInspectorView: View {
    let selections: [SeisUniversalSelection]
    let dock: SeisUniversalInspectorDock
    let onCommand: (String) -> Void

    var body: some View {
        let presentation = SeisUniversalInspectorPresentation(selections: selections)

        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                header

                VStack(alignment: .leading, spacing: 4) {
                    Text(presentation.title)
                        .font(.headline)
                    Text(presentation.subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                ForEach(presentation.sections) { section in
                    sectionView(section)
                }

                Label("Mutation disabled", systemImage: "lock.fill")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Universal Inspector")
    }

    private var header: some View {
        HStack(spacing: 8) {
            Label("Universal Inspector", systemImage: dock == .leading ? "sidebar.left" : "sidebar.right")
                .font(.title3.weight(.semibold))

            Spacer()

            Button {
                onCommand("inspector.leading")
            } label: {
                Image(systemName: "sidebar.left")
            }
            .buttonStyle(.borderless)
            .help("Dock Inspector Left")

            Button {
                onCommand("inspector.trailing")
            } label: {
                Image(systemName: "sidebar.right")
            }
            .buttonStyle(.borderless)
            .help("Dock Inspector Right")

            Button {
                onCommand("inspector.hidden")
            } label: {
                Image(systemName: "xmark")
            }
            .buttonStyle(.borderless)
            .help("Hide Inspector")
        }
    }

    private func sectionView(_ section: SeisUniversalInspectorSection) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(section.title.uppercased())
                .font(.caption2.weight(.semibold))
                .foregroundStyle(.secondary)

            ForEach(section.rows) { row in
                HStack(alignment: .firstTextBaseline) {
                    Text(row.label)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text(row.value)
                        .font(.callout.monospaced())
                        .multilineTextAlignment(.trailing)
                        .textSelection(.enabled)
                }
            }
        }
        .padding(12)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10))
    }
}
