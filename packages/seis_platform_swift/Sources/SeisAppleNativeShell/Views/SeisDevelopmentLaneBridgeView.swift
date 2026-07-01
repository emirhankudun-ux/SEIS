import SeisPlatformKit
import SwiftUI

struct SeisDevelopmentLaneBridgeView: View {
    private enum Palette {
        static let ink = Color(red: 0.03, green: 0.04, blue: 0.055)
        static let panel = Color(red: 0.105, green: 0.12, blue: 0.145)
        static let hairline = Color.white.opacity(0.12)
        static let primaryText = Color.white.opacity(0.94)
        static let secondaryText = Color.white.opacity(0.66)
        static let cyan = Color(red: 0.30, green: 0.86, blue: 0.95)
        static let violet = Color(red: 0.66, green: 0.55, blue: 0.98)
        static let green = Color(red: 0.35, green: 0.86, blue: 0.56)
    }

    private var lanes: [SEISDevelopmentLane] {
        SEISAppleFirstFoundation.developmentLanes
    }

    private var milestones: [SEISAIParameterMilestone] {
        SEISAppleFirstFoundation.aiScaleRoadmap
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            hero
            laneGrid
            modelLadder
            validatorFooter
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(Palette.panel)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Palette.hairline, lineWidth: 1)
        )
        .accessibilityElement(children: .contain)
        .accessibilityLabel("SEIS development lane bridge")
    }

    private var hero: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Development Lane Bridge")
                .font(.title3.weight(.semibold))
                .foregroundStyle(Palette.primaryText)

            Text(SEISAppleFirstFoundation.developmentLaneBridgeSummary)
                .font(.callout)
                .foregroundStyle(Palette.secondaryText)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 10) {
                badge("\(lanes.count) lanes", tint: Palette.cyan)
                badge("\(milestones.count) model tiers", tint: Palette.violet)
                badge("Local Demo default", tint: Palette.green)
            }
        }
    }

    private var laneGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            ForEach(lanes) { lane in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(lane.label)
                            .font(.headline)
                            .foregroundStyle(Palette.primaryText)
                        Spacer(minLength: 8)
                        Text(lane.status)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Palette.cyan)
                    }

                    Text(lane.detail)
                        .font(.caption)
                        .foregroundStyle(Palette.secondaryText)
                        .fixedSize(horizontal: false, vertical: true)

                    Text(lane.surface)
                        .font(.caption2.monospaced())
                        .foregroundStyle(Palette.secondaryText)

                    Text(lane.validator)
                        .font(.caption2.monospaced())
                        .foregroundStyle(Palette.violet)
                }
                .padding(12)
                .background(Palette.ink.opacity(0.55), in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .stroke(Palette.hairline, lineWidth: 1)
                )
            }
        }
    }

    private var modelLadder: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Model Parameter Ladder")
                .font(.headline)
                .foregroundStyle(Palette.primaryText)

            ForEach(milestones) { milestone in
                HStack(alignment: .top, spacing: 10) {
                    Text(milestone.parameterClass)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Palette.primaryText)
                        .frame(width: 56, alignment: .leading)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(milestone.title)
                            .font(.subheadline)
                            .foregroundStyle(Palette.primaryText)
                        Text(milestone.cadence)
                            .font(.caption)
                            .foregroundStyle(Palette.secondaryText)
                    }

                    Spacer(minLength: 8)

                    Text(milestone.routeEligibleToday ? "Eligible" : "Blocked")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(milestone.routeEligibleToday ? Palette.green : Palette.secondaryText)
                }
            }
        }
    }

    private var validatorFooter: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Validation Commands")
                .font(.headline)
                .foregroundStyle(Palette.primaryText)

            ForEach(SEISAppleFirstFoundation.developmentLaneValidators, id: \.self) { command in
                Text(command)
                    .font(.caption.monospaced())
                    .foregroundStyle(Palette.secondaryText)
            }
        }
    }

    private func badge(_ title: String, tint: Color) -> some View {
        Text(title)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(tint.opacity(0.16), in: Capsule())
            .foregroundStyle(tint)
    }
}
