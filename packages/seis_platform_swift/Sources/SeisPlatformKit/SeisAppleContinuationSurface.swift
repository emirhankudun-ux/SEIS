import Combine
import Foundation

#if canImport(AppKit)
import AppKit
#endif

#if canImport(SwiftUI)
import SwiftUI
#endif

#if canImport(UIKit)
import UIKit
#endif

public struct SeisAppleFrameworkFocus: Codable, Equatable, Sendable {
    public let framework: String
    public let platform: SeisPlatform
    public let qualityGate: String
    public let purpose: String

    public init(framework: String, platform: SeisPlatform, qualityGate: String, purpose: String) {
        self.framework = framework
        self.platform = platform
        self.qualityGate = qualityGate
        self.purpose = purpose
    }
}

public struct SeisAppleContinuationSnapshot: Codable, Equatable, Sendable {
    public let title: String
    public let platforms: [SeisPlatform]
    public let languages: [String]
    public let frameworks: [String]
    public let qualityGates: [String]
    public let focusAreas: [SeisAppleFrameworkFocus]
    public let readiness: [SeisPlatformReadiness]

    public init(
        title: String,
        platforms: [SeisPlatform],
        languages: [String],
        frameworks: [String],
        qualityGates: [String],
        focusAreas: [SeisAppleFrameworkFocus],
        readiness: [SeisPlatformReadiness]
    ) {
        self.title = title
        self.platforms = platforms
        self.languages = languages
        self.frameworks = frameworks
        self.qualityGates = qualityGates
        self.focusAreas = focusAreas
        self.readiness = readiness
    }

    public static let current = make()

    public var isReady: Bool {
        !readiness.isEmpty && readiness.allSatisfy(\.ready)
    }

    public var accessibilitySummary: String {
        "\(title). Platforms: \(platforms.map(\.rawValue).joined(separator: ", ")). Frameworks: \(frameworks.joined(separator: ", "))."
    }

    public static func make(platforms requestedPlatforms: [SeisPlatform] = [.macOS, .iOS]) -> Self {
        let applePlatforms = requestedPlatforms.filter { $0 == .macOS || $0 == .iOS }
        let selectedPlatforms = applePlatforms.isEmpty ? [.macOS, .iOS] : applePlatforms
        let capabilities = selectedPlatforms.compactMap(SeisPlatformPolicy.capability(for:))
        let languages = stableUnique(capabilities.flatMap(\.languages))
        let frameworks = stableUnique(capabilities.flatMap(\.frameworks))
        let gates = stableUnique(capabilities.flatMap(\.qualityGates))

        return SeisAppleContinuationSnapshot(
            title: "SEIS Apple Native Continuation",
            platforms: selectedPlatforms,
            languages: languages,
            frameworks: frameworks,
            qualityGates: gates,
            focusAreas: focusAreas(for: selectedPlatforms),
            readiness: capabilities.map(SeisPlatformPolicy.readiness(for:))
        )
    }

    private static func stableUnique(_ values: [String]) -> [String] {
        var seen = Set<String>()
        return values.filter { seen.insert($0).inserted }
    }

    private static func focusAreas(for platforms: [SeisPlatform]) -> [SeisAppleFrameworkFocus] {
        var focus: [SeisAppleFrameworkFocus] = []
        if platforms.contains(.macOS) {
            focus.append(
                SeisAppleFrameworkFocus(
                    framework: "AppKit",
                    platform: .macOS,
                    qualityGate: "appkit_surface_review",
                    purpose: "Native macOS shell, menus, windows, and system integration."
                )
            )
        }
        if platforms.contains(.iOS) {
            focus.append(
                SeisAppleFrameworkFocus(
                    framework: "UIKit",
                    platform: .iOS,
                    qualityGate: "uikit_accessibility",
                    purpose: "Native iOS interaction, accessibility, navigation, and touch ergonomics."
                )
            )
        }
        focus.append(
            SeisAppleFrameworkFocus(
                framework: "Metal",
                platform: platforms.contains(.iOS) ? .iOS : .macOS,
                qualityGate: "metal_rendering_budget",
                purpose: "GPU-aware rendering budget for rich AI-native visual surfaces."
            )
        )
        focus.append(
            SeisAppleFrameworkFocus(
                framework: "Combine",
                platform: .macOS,
                qualityGate: "combine_state_flow_review",
                purpose: "Observable state flow for calm, inspectable Apple platform updates."
            )
        )
        focus.append(
            SeisAppleFrameworkFocus(
                framework: "Core Data + CloudKit",
                platform: platforms.contains(.iOS) ? .iOS : .macOS,
                qualityGate: "coredata_cloudkit_sync_review",
                purpose: "Local-first persistence with Apple ecosystem sync readiness."
            )
        )
        return focus
    }
}

public final class SeisAppleContinuationModel: ObservableObject {
    @Published public private(set) var snapshot: SeisAppleContinuationSnapshot

    public init(snapshot: SeisAppleContinuationSnapshot = .current) {
        self.snapshot = snapshot
    }

    public func focus(on request: String) {
        let routedPlatforms = SeisPlatformPolicy.route(request: request)
        snapshot = SeisAppleContinuationSnapshot.make(platforms: routedPlatforms)
    }
}

#if canImport(AppKit)
public extension SeisAppleContinuationSnapshot {
    var appKitAccentColor: NSColor {
        .controlAccentColor
    }
}
#endif

#if canImport(UIKit)
public extension SeisAppleContinuationSnapshot {
    var uiKitAccentColor: UIColor {
        .systemBlue
    }
}
#endif

#if canImport(SwiftUI)
@available(macOS 13.0, iOS 16.0, *)
public struct SeisAppleContinuationView: View {
    private let snapshot: SeisAppleContinuationSnapshot

    public init(snapshot: SeisAppleContinuationSnapshot = .current) {
        self.snapshot = snapshot
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(snapshot.title)
                .font(.headline)
            Text(snapshot.frameworks.joined(separator: " / "))
                .font(.subheadline)
            VStack(alignment: .leading, spacing: 8) {
                ForEach(snapshot.focusAreas, id: \.framework) { focus in
                    VStack(alignment: .leading, spacing: 2) {
                        Text(focus.framework)
                            .font(.subheadline.weight(.semibold))
                        Text(focus.purpose)
                            .font(.caption)
                    }
                }
            }
        }
        .padding()
        .accessibilityElement(children: .combine)
        .accessibilityLabel(snapshot.accessibilitySummary)
    }
}
#endif
