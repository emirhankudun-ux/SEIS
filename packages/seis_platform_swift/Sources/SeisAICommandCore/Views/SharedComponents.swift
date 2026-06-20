import SwiftUI

struct SurfaceCard<Content: View>: View {
    @ViewBuilder var content: Content

    var body: some View {
        content
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(.quaternary)
            )
    }
}

enum StatusPillKind {
    case ready
    case attention
    case neutral
}

struct StatusPill: View {
    let label: String
    let kind: StatusPillKind

    var body: some View {
        Text(label)
            .font(.caption2.weight(.semibold))
            .padding(.horizontal, 8)
            .padding(.vertical, 5)
            .foregroundStyle(foreground)
            .background(background, in: Capsule())
    }

    private var foreground: Color {
        switch kind {
        case .ready:
            .green
        case .attention:
            .orange
        case .neutral:
            .secondary
        }
    }

    private var background: Color {
        switch kind {
        case .ready:
            .green.opacity(0.12)
        case .attention:
            .orange.opacity(0.14)
        case .neutral:
            .secondary.opacity(0.12)
        }
    }
}

struct MetricCard: View {
    let title: String
    let value: String
    let footnote: String

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.callout.weight(.semibold))
                .lineLimit(1)
                .minimumScaleFactor(0.72)
            Text(footnote)
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.background.opacity(0.55), in: RoundedRectangle(cornerRadius: 10))
    }
}

struct ScoreBar: View {
    let title: String
    let detail: String
    let value: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack {
                Text(title)
                    .font(.callout.weight(.semibold))
                Spacer()
                Text("\(value)%")
                    .font(.caption.monospacedDigit().weight(.semibold))
                    .foregroundStyle(.secondary)
            }
            Text(detail)
                .font(.caption)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
            ProgressView(value: Double(value), total: 100)
        }
    }
}
