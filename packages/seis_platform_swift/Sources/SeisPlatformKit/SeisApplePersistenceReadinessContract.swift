import Foundation

#if canImport(CoreData)
import CoreData
#endif

#if canImport(CloudKit)
import CloudKit
#endif

public struct SeisApplePersistenceReadinessItem: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let appleFramework: String
    public let symbol: String
    public let state: SeisAppleShellDiagnosticState
    public let evidence: String
    public let qualityGate: String

    public init(
        id: String,
        title: String,
        appleFramework: String,
        symbol: String,
        state: SeisAppleShellDiagnosticState,
        evidence: String,
        qualityGate: String
    ) {
        self.id = id
        self.title = title
        self.appleFramework = appleFramework
        self.symbol = symbol
        self.state = state
        self.evidence = evidence
        self.qualityGate = qualityGate
    }
}

public struct SeisApplePersistenceReadinessContract: Codable, Equatable, Sendable {
    public let title: String
    public let summary: String
    public let appleFrameworkSymbols: [String]
    public let items: [SeisApplePersistenceReadinessItem]
    public let validationCommands: [String]

    public init(
        title: String,
        summary: String,
        appleFrameworkSymbols: [String],
        items: [SeisApplePersistenceReadinessItem],
        validationCommands: [String]
    ) {
        self.title = title
        self.summary = summary
        self.appleFrameworkSymbols = appleFrameworkSymbols
        self.items = items
        self.validationCommands = validationCommands
    }

    public static let coreDataCloudKit = SeisApplePersistenceReadinessContract(
        title: "Core Data + CloudKit Readiness",
        summary: "Apple-native local-first persistence and iCloud sync readiness for SEIS shell surfaces.",
        appleFrameworkSymbols: [
            "NSManagedObjectModel",
            "NSPersistentCloudKitContainer",
            "NSMergePolicy",
            "NSPersistentHistoryTransaction",
            "CKContainer",
            "CKRecord"
        ],
        items: [
            SeisApplePersistenceReadinessItem(
                id: "managed-object-model",
                title: "Managed Object Model",
                appleFramework: "Core Data",
                symbol: "NSManagedObjectModel",
                state: .ready,
                evidence: "Model ownership is tracked before adding persistent stores or migrations.",
                qualityGate: "coredata_cloudkit_sync_review"
            ),
            SeisApplePersistenceReadinessItem(
                id: "persistent-cloudkit-container",
                title: "Persistent CloudKit Container",
                appleFramework: "Core Data + CloudKit",
                symbol: "NSPersistentCloudKitContainer",
                state: .ready,
                evidence: "Persistent containers must be planned around iCloud-backed local-first sync.",
                qualityGate: "coredata_cloudkit_sync_review"
            ),
            SeisApplePersistenceReadinessItem(
                id: "merge-policy",
                title: "Merge Policy",
                appleFramework: "Core Data",
                symbol: "NSMergePolicy",
                state: .ready,
                evidence: "Conflict behavior is an explicit design concern before sync is promoted.",
                qualityGate: "combine_state_flow_review"
            ),
            SeisApplePersistenceReadinessItem(
                id: "persistent-history",
                title: "Persistent History",
                appleFramework: "Core Data",
                symbol: "NSPersistentHistoryTransaction",
                state: .ready,
                evidence: "History tracking keeps multi-window and background sync behavior inspectable.",
                qualityGate: "notarization_awareness"
            ),
            SeisApplePersistenceReadinessItem(
                id: "cloudkit-container",
                title: "CloudKit Container",
                appleFramework: "CloudKit",
                symbol: "CKContainer",
                state: .ready,
                evidence: "Cloud container ownership must be explicit before production sync is enabled.",
                qualityGate: "app_privacy_review"
            ),
            SeisApplePersistenceReadinessItem(
                id: "cloudkit-record-privacy",
                title: "CloudKit Record Privacy",
                appleFramework: "CloudKit",
                symbol: "CKRecord",
                state: .ready,
                evidence: "Record schema, privacy, and account-state handling are required release gates.",
                qualityGate: "app_privacy_review"
            )
        ],
        validationCommands: [
            "swift test --package-path packages/seis_platform_swift",
            "xcodebuild -version"
        ]
    )

    public var readyCount: Int {
        items.filter { $0.state == .ready }.count
    }

    public var isReady: Bool {
        !items.isEmpty && readyCount == items.count
    }

    public var accessibilitySummary: String {
        "\(title). \(readyCount) of \(items.count) Apple persistence checks ready. \(summary)"
    }

    public var expectedSourceTokens: [String] {
        [
            "canImport(CoreData)",
            "canImport(CloudKit)",
            "NSManagedObjectModel",
            "NSPersistentCloudKitContainer",
            "NSPersistentHistoryTransaction",
            "CKContainer",
            "CKRecord"
        ]
    }

    public var expectedDiagnosticsViewTokens: [String] {
        [
            "Persistence Readiness",
            "persistence.items",
            "item.appleFramework",
            "item.symbol",
            "persistence.validationCommands"
        ]
    }
}
