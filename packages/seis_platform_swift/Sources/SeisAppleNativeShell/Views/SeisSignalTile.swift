import SwiftUI

struct SeisSignalTile: View {
    let title: String
    let signal: String?
    let detail: String
    let icon: String
    let tone: Color
    let eyebrow: String?
    let iconSize: CGFloat
    let detailLineLimit: Int

    init(
        title: String,
        signal: String? = nil,
        detail: String,
        icon: String,
        tone: Color,
        eyebrow: String? = nil,
        iconSize: CGFloat = 30,
        detailLineLimit: Int = 3
    ) {
        self.title = title
        self.signal = signal
        self.detail = detail
        self.icon = icon
        self.tone = tone
        self.eyebrow = eyebrow
        self.iconSize = iconSize
        self.detailLineLimit = detailLineLimit
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(tone.opacity(0.16))
                        .frame(width: iconSize, height: iconSize)

                    Image(systemName: icon)
                        .font(.caption)
                        .foregroundStyle(tone)
                }

                VStack(alignment: .leading, spacing: 1) {
                    if let eyebrow {
                        Text(eyebrow)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }

                    Text(title)
                        .font(.caption)
                        .fontWeight(.semibold)
                        .lineLimit(1)

                    if let signal {
                        Text(signal)
                            .font(.caption2)
                            .foregroundStyle(tone)
                            .lineLimit(1)
                    }
                }
            }

            Text(detail)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(detailLineLimit)
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .seisSidebarCard(accent: tone, radius: 10, prominence: 0.07)
    }
}
