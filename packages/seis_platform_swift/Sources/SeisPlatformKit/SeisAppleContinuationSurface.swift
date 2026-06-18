import Foundation

#if canImport(Combine)
import Combine
typealias SeisAppleContinuationObservationObject = ObservableObject
#else
protocol SeisAppleContinuationObservationObject {}
#endif

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

public struct SeisAppleReadinessMetric: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let requiredItems: [String]
    public let availableItems: [String]
    public let qualityGate: String
    public let evidence: String

    public init(
        id: String,
        title: String,
        requiredItems: [String],
        availableItems: [String],
        qualityGate: String,
        evidence: String
    ) {
        self.id = id
        self.title = title
        self.requiredItems = requiredItems
        self.availableItems = availableItems
        self.qualityGate = qualityGate
        self.evidence = evidence
    }

    public var readyCount: Int {
        requiredItems.filter { availableItems.contains($0) }.count
    }

    public var isReady: Bool {
        !requiredItems.isEmpty && readyCount == requiredItems.count
    }

    public var readinessLabel: String {
        "\(readyCount)/\(requiredItems.count) ready"
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

    public static let appleFirstLanguages = ["Swift", "SwiftUI", "Objective-C"]

    public var isReady: Bool {
        !readiness.isEmpty && readiness.allSatisfy(\.ready)
    }

    public var readinessMetrics: [SeisAppleReadinessMetric] {
        [
            SeisAppleReadinessMetric(
                id: "apple-languages",
                title: "Apple Languages",
                requiredItems: Self.appleFirstLanguages,
                availableItems: languages,
                qualityGate: "swift_test",
                evidence: "Swift, SwiftUI, and Objective-C stay present in the routed Apple continuation."
            ),
            SeisAppleReadinessMetric(
                id: "apple-frameworks",
                title: "Apple Frameworks",
                requiredItems: frameworkTargets,
                availableItems: frameworks,
                qualityGate: "coredata_cloudkit_sync_review",
                evidence: "Selected Apple framework targets are present for the active macOS and iOS scope."
            ),
            SeisAppleReadinessMetric(
                id: "apple-quality-gates",
                title: "Apple Quality Gates",
                requiredItems: qualityGateTargets,
                availableItems: qualityGates,
                qualityGate: "accessibility_when_ui",
                evidence: "Framework-specific quality gates are tracked alongside the native shell."
            )
        ]
    }

    public var readinessSummary: String {
        let ready = readinessMetrics.filter(\.isReady).count
        return "\(ready)/\(readinessMetrics.count) Apple readiness checks ready"
    }

    public var accessibilitySummary: String {
        "\(title). \(readinessSummary). Platforms: \(platforms.map(\.rawValue).joined(separator: ", ")). Frameworks: \(frameworks.joined(separator: ", "))."
    }

    public static var expectedReadinessViewTokens: [String] {
        [
            "Apple Readiness",
            "snapshot.readinessMetrics",
            "metric.title",
            "metric.readinessLabel",
            "metric.qualityGate",
            "readinessSummary"
        ]
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

    private var frameworkTargets: [String] {
        var targets: [String] = []
        if platforms.contains(.macOS) {
            targets.append("AppKit")
        }
        if platforms.contains(.iOS) {
            targets.append("UIKit")
        }
        targets.append(contentsOf: ["Metal", "Combine", "Core Data", "CloudKit"])
        return Self.stableUnique(targets)
    }

    private var qualityGateTargets: [String] {
        Self.stableUnique(focusAreas.map(\.qualityGate))
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

public final class SeisAppleContinuationModel: SeisAppleContinuationObservationObject {
    #if canImport(Combine)
    @Published public private(set) var snapshot: SeisAppleContinuationSnapshot
    #else
    public private(set) var snapshot: SeisAppleContinuationSnapshot
    #endif

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
                Text("Apple Readiness")
                    .font(.subheadline.weight(.semibold))
                ForEach(snapshot.readinessMetrics) { metric in
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: metric.isReady ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                            .foregroundStyle(metric.isReady ? .green : .orange)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            HStack {
                                Text(metric.title)
                                    .font(.caption.weight(.semibold))
                                Text(metric.readinessLabel)
                                    .font(.caption2.monospacedDigit())
                                    .foregroundStyle(.secondary)
                            }
                            Text(metric.evidence)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                            Text(metric.qualityGate)
                                .font(.caption2.monospaced())
                                .foregroundStyle(.tertiary)
                        }
                    }
                }
            }
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
