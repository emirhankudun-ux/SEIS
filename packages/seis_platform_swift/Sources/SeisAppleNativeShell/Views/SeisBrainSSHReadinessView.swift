import SeisPlatformKit
import SwiftUI

struct SeisBrainSSHReadinessView: View {
    private enum Palette {
        static let ink = Color(red: 0.025, green: 0.035, blue: 0.048)
        static let graphite = Color(red: 0.07, green: 0.08, blue: 0.10)
        static let panel = Color(red: 0.10, green: 0.12, blue: 0.145)
        static let raised = Color(red: 0.13, green: 0.15, blue: 0.18)
        static let hairline = Color.white.opacity(0.12)
        static let primaryText = Color.white.opacity(0.94)
        static let secondaryText = Color.white.opacity(0.68)
        static let tertiaryText = Color.white.opacity(0.48)
        static let cyan = Color(red: 0.30, green: 0.86, blue: 0.95)
        static let violet = Color(red: 0.65, green: 0.55, blue: 0.98)
        static let amber = Color(red: 1.0, green: 0.68, blue: 0.28)
        static let green = Color(red: 0.35, green: 0.86, blue: 0.56)
    }

    private var brainNotes: [SEISBrainNote] {
        SEISAppleFirstFoundation.brainNotes
    }

    private var contextPackRecords: [SEISContextPack] {
        SEISAppleFirstFoundation.contextPacks
    }

    private var sshProfiles: [SEISSSHProfile] {
        SEISAppleFirstFoundation.sshProfiles
    }

    private var cloudStatuses: [SEISCloudStatus] {
        SEISAppleFirstFoundation.cloudStatuses
    }

    private var safeCommands: [SEISSafeCommand] {
        SEISAppleFirstFoundation.safeCommands
    }

    private var forbiddenSSHCommandPatterns: [String] {
        SEISAppleFirstFoundation.forbiddenSSHCommandPatterns
    }

    private var boundary: SEISPublicPrivateBoundary {
        SEISAppleFirstFoundation.brainPublicPrivateBoundary
    }

    private var safetyCommands: [SEISSafeCommand] {
        safeCommands.filter { $0.id.contains("ssh") || $0.id.contains("second-brain") }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            hero
            metrics
            brainAndContextGrid
            sshSafety
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
                                colors: [Palette.violet.opacity(0.34), Palette.cyan.opacity(0.18)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 44, height: 44)

                    Image(systemName: "lock.shield.fill")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundStyle(Palette.cyan)
                }

                VStack(alignment: .leading, spacing: 7) {
                    Text("SEIS Brain & SSH Readiness")
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(Palette.primaryText)

                    Text("Public-safe native snapshot for Obsidian context packs, Xcode handoff, and metadata-only SEIS-SSH review.")
                        .font(.callout)
                        .foregroundStyle(Palette.secondaryText)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer(minLength: 12)

                VStack(alignment: .trailing, spacing: 6) {
                    statusBadge("Metadata only", systemImage: "terminal.fill", tint: Palette.cyan)
                    statusBadge("No live SSH", systemImage: "wifi.slash", tint: Palette.amber)
                }
            }

            HStack(alignment: .bottom, spacing: 12) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Public Brain Boundary")
                        .font(.system(size: 30, weight: .semibold, design: .rounded))
                        .foregroundStyle(Palette.primaryText)
                        .lineLimit(1)
                        .minimumScaleFactor(0.72)

                    Text(boundary.rule)
                        .font(.caption)
                        .foregroundStyle(Palette.secondaryText)
                        .lineLimit(2)
                }

                Spacer()

                compactBadge("No private vault content", systemImage: "doc.badge.shield.checkmark")
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Palette.raised.opacity(0.96), Palette.graphite.opacity(0.92)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Palette.violet.opacity(0.22), lineWidth: 1)
        )
    }

    private var metrics: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 132), spacing: 10)], spacing: 10) {
            metricCard(title: "Brain Notes", value: "\(brainNotes.count)", detail: "\(boundary.publicSafeCount) public-safe")
            metricCard(title: "Context Packs", value: "\(contextPackRecords.count)", detail: "Codex and Xcode")
            metricCard(title: "SSH Profiles", value: "\(sshProfiles.count)", detail: "credential-free")
            metricCard(title: "Cloud Status", value: "\(cloudStatuses.count)", detail: "approval-gated")
        }
    }

    private var brainAndContextGrid: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 280), spacing: 10)], alignment: .leading, spacing: 10) {
            brainNotesPanel
            contextPackPanel
        }
    }

    private var brainNotesPanel: some View {
        sectionPanel(title: "SEIS Brain Notes", systemImage: "brain.head.profile") {
            VStack(alignment: .leading, spacing: 8) {
                ForEach(brainNotes.prefix(5)) { note in
                    HStack(alignment: .top, spacing: 9) {
                        Image(systemName: noteIcon(for: note))
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Palette.green)
                            .frame(width: 16)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(note.title)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Palette.primaryText)
                                .lineLimit(1)

                            Text(note.tags.joined(separator: " / "))
                                .font(.caption2)
                                .foregroundStyle(Palette.tertiaryText)
                                .lineLimit(1)
                        }

                        Spacer(minLength: 6)

                        Text(note.reviewStatus.rawValue)
                            .font(.caption2.monospaced())
                            .foregroundStyle(Palette.secondaryText)
                            .lineLimit(1)
                    }
                    .padding(9)
                    .background(Palette.panel.opacity(0.72), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                }
            }
        }
    }

    private var contextPackPanel: some View {
        sectionPanel(title: "Context Packs", systemImage: "shippingbox.and.arrow.backward") {
            VStack(alignment: .leading, spacing: 8) {
                ForEach(contextPackRecords) { pack in
                    VStack(alignment: .leading, spacing: 5) {
                        HStack(alignment: .firstTextBaseline) {
                            Text(pack.title)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Palette.primaryText)
                                .lineLimit(1)

                            Spacer()

                            Text("\(pack.includedNoteIDs.count) notes")
                                .font(.caption2.monospacedDigit())
                                .foregroundStyle(Palette.secondaryText)
                        }

                        Text(pack.allowedDestinations.joined(separator: " / "))
                            .font(.caption2)
                            .foregroundStyle(Palette.tertiaryText)
                            .lineLimit(1)
                    }
                    .padding(9)
                    .background(Palette.panel.opacity(0.72), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                    .accessibilityElement(children: .combine)
                }
            }
        }
    }

    private var sshSafety: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .firstTextBaseline) {
                Label("SEIS-SSH Safety", systemImage: "shield.lefthalf.filled")
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(Palette.primaryText)

                Spacer()

                Text("Human review required")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Palette.amber)
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 260), spacing: 8)], spacing: 8) {
                ForEach(safetyCommands) { command in
                    commandRow(command)
                }
            }

            VStack(alignment: .leading, spacing: 7) {
                Text("Forbidden command patterns")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Palette.secondaryText)

                Text("Forbidden: \(forbiddenSSHCommandPatterns.joined(separator: ", "))")
                    .font(.caption2.monospaced())
                    .foregroundStyle(Palette.tertiaryText)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(10)
            .background(Palette.panel.opacity(0.72), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .stroke(Palette.amber.opacity(0.22), lineWidth: 1)
            )
        }
        .padding(14)
        .background(Palette.graphite.opacity(0.74), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Palette.hairline, lineWidth: 1)
        )
    }

    private func commandRow(_ command: SEISSafeCommand) -> some View {
        HStack(alignment: .top, spacing: 9) {
            Image(systemName: command.requiresHumanReview ? "person.crop.circle.badge.exclamationmark" : "checkmark.circle.fill")
                .font(.caption.weight(.semibold))
                .foregroundStyle(command.requiresHumanReview ? Palette.amber : Palette.green)
                .frame(width: 16)

            VStack(alignment: .leading, spacing: 4) {
                Text(command.title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Palette.primaryText)
                    .lineLimit(1)

                Text(command.commandPreview)
                    .font(.caption2.monospaced())
                    .foregroundStyle(Palette.secondaryText)
                    .lineLimit(1)
                    .truncationMode(.middle)
            }

            Spacer(minLength: 6)
        }
        .padding(10)
        .background(Palette.panel.opacity(0.78), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(command.requiresHumanReview ? Palette.amber.opacity(0.18) : Palette.green.opacity(0.16), lineWidth: 1)
        )
    }

    private func sectionPanel<Content: View>(title: String, systemImage: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Label(title, systemImage: systemImage)
                .font(.headline.weight(.semibold))
                .foregroundStyle(Palette.primaryText)

            content()
        }
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .padding(14)
        .background(Palette.graphite.opacity(0.74), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Palette.hairline, lineWidth: 1)
        )
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
                    colors: [Palette.ink, Palette.graphite, Color(red: 0.055, green: 0.065, blue: 0.085)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
    }

    private func noteIcon(for note: SEISBrainNote) -> String {
        switch note.reviewStatus {
        case .draft:
            return "doc.text"
        case .aiGenerated:
            return "sparkles"
        case .humanReviewed:
            return "checkmark.seal"
        case .approvedForPublicUse:
            return "checkmark.shield"
        }
    }

    private var accessibilitySummary: String {
        "SEIS Brain and SSH readiness. \(brainNotes.count) public-safe brain notes, \(contextPackRecords.count) context packs, \(sshProfiles.count) credential-free SSH profiles, no live SSH claims."
    }
}
