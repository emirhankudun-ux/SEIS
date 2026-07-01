import SeisPlatformKit
import SwiftUI

struct SeisAIModelScaleRoadmapView: View {
    private enum Palette {
        static let ink = Color(red: 0.03, green: 0.04, blue: 0.055)
        static let graphite = Color(red: 0.075, green: 0.085, blue: 0.105)
        static let panel = Color(red: 0.105, green: 0.12, blue: 0.145)
        static let panelRaised = Color(red: 0.13, green: 0.15, blue: 0.18)
        static let hairline = Color.white.opacity(0.12)
        static let primaryText = Color.white.opacity(0.94)
        static let secondaryText = Color.white.opacity(0.66)
        static let tertiaryText = Color.white.opacity(0.48)
        static let cyan = Color(red: 0.30, green: 0.86, blue: 0.95)
        static let violet = Color(red: 0.66, green: 0.55, blue: 0.98)
        static let amber = Color(red: 1.0, green: 0.67, blue: 0.28)
        static let green = Color(red: 0.35, green: 0.86, blue: 0.56)
    }

    private var milestones: [SEISAIParameterMilestone] {
        SEISAppleFirstFoundation.aiScaleRoadmap
    }

    private var summary: String {
        SEISAppleFirstFoundation.aiScaleRoadmapSummary
    }

    private var routeEligibleCount: Int {
        milestones.filter(\.routeEligibleToday).count
    }

    private var upperBoundary: String {
        milestones.last?.parameterClass ?? "520B"
    }

    private var verificationCommands: [String] {
        Array(Set(milestones.flatMap(\.verificationCommands))).sorted()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            hero
            metricDeck
            milestoneLadder
            verificationFooter
        }
        .padding(18)
        .background(backgroundSurface)
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Palette.hairline, lineWidth: 1)
        )
        .accessibilityElement(children: .contain)
        .accessibilityLabel(accessibilitySummary)
    }

    private var hero: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [Palette.cyan.opacity(0.30), Palette.violet.opacity(0.24)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 44, height: 44)

                    Image(systemName: "chart.line.uptrend.xyaxis")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundStyle(Palette.cyan)
                }

                VStack(alignment: .leading, spacing: 7) {
                    Text("SEIS AI Scale Roadmap")
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(Palette.primaryText)

                    Text(summary)
                        .font(.callout)
                        .foregroundStyle(Palette.secondaryText)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer(minLength: 12)

                VStack(alignment: .trailing, spacing: 6) {
                    statusBadge("Local Demo default", systemImage: "checkmark.shield.fill", tint: Palette.green)
                    statusBadge("No trained weights", systemImage: "lock.shield.fill", tint: Palette.amber)
                }
            }

            HStack(alignment: .bottom, spacing: 12) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("20B -> \(upperBoundary)")
                        .font(.system(size: 34, weight: .semibold, design: .rounded))
                        .foregroundStyle(Palette.primaryText)
                        .lineLimit(1)
                        .minimumScaleFactor(0.72)

                    Text("Periodic gated path. Evidence first, runtime later.")
                        .font(.caption)
                        .foregroundStyle(Palette.secondaryText)
                }

                Spacer()

                HStack(spacing: 8) {
                    compactBadge("20B floor", systemImage: "memorychip")
                    compactBadge("520B boundary", systemImage: "point.3.connected.trianglepath.dotted")
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Palette.panelRaised.opacity(0.96), Palette.graphite.opacity(0.92)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Palette.cyan.opacity(0.18), lineWidth: 1)
        )
    }

    private var metricDeck: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 128), spacing: 10)], spacing: 10) {
            metricCard(title: "Milestones", value: "\(milestones.count)", detail: "review gates")
            metricCard(title: "Floor", value: milestones.first?.parameterClass ?? "20B", detail: "planned")
            metricCard(title: "Boundary", value: upperBoundary, detail: "long horizon")
            metricCard(title: "routeEligibleToday", value: "\(routeEligibleCount)", detail: "all blocked")
        }
    }

    private var milestoneLadder: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline) {
                Text("Parameter Ladder")
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(Palette.primaryText)

                Spacer()

                Text("Plan-only")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Palette.amber)
            }

            VStack(spacing: 8) {
                ForEach(Array(milestones.enumerated()), id: \.element.id) { index, milestone in
                    milestoneRow(milestone, index: index)
                }
            }
        }
    }

    private func milestoneRow(_ milestone: SEISAIParameterMilestone, index: Int) -> some View {
        HStack(alignment: .top, spacing: 13) {
            VStack(spacing: 6) {
                Text(milestone.parameterClass)
                    .font(.caption.monospaced().weight(.bold))
                    .foregroundStyle(index == 0 ? Palette.cyan : index == milestones.count - 1 ? Palette.violet : Palette.primaryText)
                    .frame(width: 56, alignment: .leading)

                Circle()
                    .fill(index == 0 ? Palette.cyan : index == milestones.count - 1 ? Palette.violet : Palette.hairline)
                    .frame(width: 7, height: 7)
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(milestone.title)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Palette.primaryText)
                            .fixedSize(horizontal: false, vertical: true)

                        Text(milestone.cadence)
                            .font(.caption)
                            .foregroundStyle(Palette.secondaryText)
                    }

                    Spacer(minLength: 8)

                    statusBadge(milestone.routeEligibleToday ? "Route ready" : "Blocked", systemImage: milestone.routeEligibleToday ? "checkmark.circle.fill" : "pause.circle.fill", tint: milestone.routeEligibleToday ? Palette.green : Palette.amber)
                }

                Text("Gate: \(milestone.evidenceGates.prefix(3).joined(separator: " / "))")
                    .font(.caption)
                    .foregroundStyle(Palette.secondaryText)
                    .lineLimit(2)

                Text("Forbidden: \(milestone.forbiddenClaims.joined(separator: " / "))")
                    .font(.caption2)
                    .foregroundStyle(Palette.tertiaryText)
                    .lineLimit(2)
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(rowFill(for: milestone, index: index))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(rowStroke(for: milestone, index: index), lineWidth: 1)
        )
        .accessibilityElement(children: .combine)
    }

    private var verificationFooter: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Label("Verification", systemImage: "checklist.checked")
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(Palette.primaryText)

                Spacer()

                Text("verificationCommands")
                    .font(.caption2.monospaced().weight(.medium))
                    .foregroundStyle(Palette.tertiaryText)
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 260), spacing: 8)], spacing: 8) {
                ForEach(verificationCommands, id: \.self) { command in
                    Text(command)
                        .font(.caption2.monospaced())
                        .foregroundStyle(Palette.secondaryText)
                        .lineLimit(1)
                        .truncationMode(.middle)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 7)
                        .background(Palette.panel.opacity(0.78), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 8, style: .continuous)
                                .stroke(Palette.hairline, lineWidth: 1)
                        )
                }
            }
        }
        .padding(14)
        .background(Palette.graphite.opacity(0.72), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private func metricCard(title: String, value: String, detail: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption.weight(.medium))
                .foregroundStyle(Palette.secondaryText)

            Text(value)
                .font(.system(size: 24, weight: .semibold, design: .rounded))
                .foregroundStyle(Palette.primaryText)
                .lineLimit(1)
                .minimumScaleFactor(0.78)

            Text(detail)
                .font(.caption2)
                .foregroundStyle(Palette.tertiaryText)
                .lineLimit(2)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(Palette.panel.opacity(0.86), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Palette.hairline, lineWidth: 1)
        )
    }

    private func statusBadge(_ text: String, systemImage: String, tint: Color) -> some View {
        Label(text, systemImage: systemImage)
            .font(.caption.weight(.semibold))
            .foregroundStyle(tint)
            .labelStyle(.titleAndIcon)
            .padding(.horizontal, 9)
            .padding(.vertical, 6)
            .background(tint.opacity(0.12), in: Capsule())
            .overlay(Capsule().stroke(tint.opacity(0.24), lineWidth: 1))
    }

    private func compactBadge(_ text: String, systemImage: String) -> some View {
        Label(text, systemImage: systemImage)
            .font(.caption2.weight(.medium))
            .foregroundStyle(Palette.secondaryText)
            .padding(.horizontal, 9)
            .padding(.vertical, 6)
            .background(Palette.panel.opacity(0.8), in: Capsule())
            .overlay(Capsule().stroke(Palette.hairline, lineWidth: 1))
    }

    private var backgroundSurface: some View {
        RoundedRectangle(cornerRadius: 8, style: .continuous)
            .fill(
                LinearGradient(
                    colors: [Palette.ink, Palette.graphite, Color(red: 0.06, green: 0.07, blue: 0.09)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
    }

    private func rowFill(for milestone: SEISAIParameterMilestone, index: Int) -> LinearGradient {
        let accent = index == 0 ? Palette.cyan : index == milestones.count - 1 ? Palette.violet : Palette.amber
        return LinearGradient(
            colors: [Palette.panelRaised.opacity(0.82), accent.opacity(0.06)],
            startPoint: .leading,
            endPoint: .trailing
        )
    }

    private func rowStroke(for milestone: SEISAIParameterMilestone, index: Int) -> Color {
        if milestone.routeEligibleToday {
            return Palette.green.opacity(0.35)
        }

        if index == 0 {
            return Palette.cyan.opacity(0.25)
        }

        if index == milestones.count - 1 {
            return Palette.violet.opacity(0.28)
        }

        return Palette.hairline
    }

    private var accessibilitySummary: String {
        "SEIS AI Scale Roadmap. 20B to \(upperBoundary), \(milestones.count) milestones, \(routeEligibleCount) route eligible today, no trained weights."
    }
}
