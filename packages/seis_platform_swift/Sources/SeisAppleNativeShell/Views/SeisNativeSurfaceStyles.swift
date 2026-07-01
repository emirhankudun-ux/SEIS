import SwiftUI

private struct SeisSidebarCardSurface: ViewModifier {
    let accent: Color
    let radius: CGFloat
    let prominence: Double

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color(red: 0.115, green: 0.128, blue: 0.150).opacity(0.96),
                                Color(red: 0.060, green: 0.070, blue: 0.088).opacity(0.94),
                                accent.opacity(prominence)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .stroke(Color.white.opacity(0.10), lineWidth: 1)
            )
    }
}

private struct SeisSidebarPillSurface: ViewModifier {
    let accent: Color
    let prominence: Double

    func body(content: Content) -> some View {
        content
            .background(
                Capsule(style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color(red: 0.105, green: 0.118, blue: 0.140).opacity(0.96),
                                accent.opacity(prominence)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            )
            .overlay(
                Capsule(style: .continuous)
                    .stroke(Color.white.opacity(0.09), lineWidth: 1)
            )
    }
}

extension View {
    func seisSidebarCard(
        accent: Color = .cyan,
        radius: CGFloat = 10,
        prominence: Double = 0.10
    ) -> some View {
        modifier(
            SeisSidebarCardSurface(
                accent: accent,
                radius: radius,
                prominence: prominence
            )
        )
    }

    func seisSidebarPill(
        accent: Color = .cyan,
        prominence: Double = 0.08
    ) -> some View {
        modifier(
            SeisSidebarPillSurface(
                accent: accent,
                prominence: prominence
            )
        )
    }
}
