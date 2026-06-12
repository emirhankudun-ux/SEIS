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

public struct SeisAppleCloudKitAccountStateReadiness: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let accountStatus: String
    public let state: SeisAppleShellDiagnosticState
    public let evidence: String
    public let releaseAction: String
    public let qualityGate: String

    public init(
        id: String,
        title: String,
        accountStatus: String,
        state: SeisAppleShellDiagnosticState,
        evidence: String,
        releaseAction: String,
        qualityGate: String
    ) {
        self.id = id
        self.title = title
        self.accountStatus = accountStatus
        self.state = state
        self.evidence = evidence
        self.releaseAction = releaseAction
        self.qualityGate = qualityGate
    }
}

public struct SeisApplePersistenceReadinessContract: Codable, Equatable, Sendable {
    public let title: String
    public let summary: String
    public let appleFrameworkSymbols: [String]
    public let items: [SeisApplePersistenceReadinessItem]
    public let accountStates: [SeisAppleCloudKitAccountStateReadiness]
    public let validationCommands: [String]

    public init(
        title: String,
        summary: String,
        appleFrameworkSymbols: [String],
        items: [SeisApplePersistenceReadinessItem],
        accountStates: [SeisAppleCloudKitAccountStateReadiness],
        validationCommands: [String]
    ) {
        self.title = title
        self.summary = summary
        self.appleFrameworkSymbols = appleFrameworkSymbols
        self.items = items
        self.accountStates = accountStates
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
            "CKRecord",
            "CKAccountStatus"
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
        accountStates: [
            SeisAppleCloudKitAccountStateReadiness(
                id: "account-available",
                title: "iCloud Account Available",
                accountStatus: "CKAccountStatus.available",
                state: .ready,
                evidence: "CloudKit sync may proceed only after the user account is available.",
                releaseAction: "Enable sync and surface last-successful-sync telemetry.",
                qualityGate: "app_privacy_review"
            ),
            SeisAppleCloudKitAccountStateReadiness(
                id: "account-missing",
                title: "No iCloud Account",
                accountStatus: "CKAccountStatus.noAccount",
                state: .ready,
                evidence: "The shell must keep local Core Data behavior useful without iCloud.",
                releaseAction: "Stay local-first and explain that iCloud sign-in enables sync.",
                qualityGate: "offline_fallback"
            ),
            SeisAppleCloudKitAccountStateReadiness(
                id: "account-restricted",
                title: "Restricted Account",
                accountStatus: "CKAccountStatus.restricted",
                state: .ready,
                evidence: "Managed Apple IDs and device restrictions can prevent CloudKit writes.",
                releaseAction: "Disable sync actions and keep policy-safe local persistence.",
                qualityGate: "permission_scope"
            ),
            SeisAppleCloudKitAccountStateReadiness(
                id: "account-unknown",
                title: "Account State Unknown",
                accountStatus: "CKAccountStatus.couldNotDetermine",
                state: .ready,
                evidence: "Network or system uncertainty must not block local work.",
                releaseAction: "Retry account lookup with observable status and no destructive writes.",
                qualityGate: "notarization_awareness"
            ),
            SeisAppleCloudKitAccountStateReadiness(
                id: "account-temporary",
                title: "Temporarily Unavailable",
                accountStatus: "CKAccountStatus.temporarilyUnavailable",
                state: .ready,
                evidence: "Temporary CloudKit failures need backoff instead of user data loss.",
                releaseAction: "Queue sync, preserve local changes, and surface retry status.",
                qualityGate: "coredata_cloudkit_sync_review"
            )
        ],
        validationCommands: [
            "swift test --package-path packages/seis_platform_swift",
            "xcodebuild -version"
        ]
    )

    public var readyCount: Int {
        items.filter { $0.state == .ready }.count +
            accountStates.filter { $0.state == .ready }.count
    }

    public var checkCount: Int {
        items.count + accountStates.count
    }

    public var isReady: Bool {
        checkCount > 0 && readyCount == checkCount
    }

    public var accessibilitySummary: String {
        "\(title). \(readyCount) of \(checkCount) Apple persistence checks ready. \(summary)"
    }

    public var expectedSourceTokens: [String] {
        [
            "canImport(CoreData)",
            "canImport(CloudKit)",
            "NSManagedObjectModel",
            "NSPersistentCloudKitContainer",
            "NSPersistentHistoryTransaction",
            "CKContainer",
            "CKRecord",
            "CKAccountStatus",
            "CKAccountStatus.temporarilyUnavailable"
        ]
    }

    public var expectedDiagnosticsViewTokens: [String] {
        [
            "Persistence Readiness",
            "CloudKit Account States",
            "persistence.items",
            "persistence.accountStates",
            "item.appleFramework",
            "item.symbol",
            "accountState.accountStatus",
            "accountState.releaseAction",
            "persistence.validationCommands"
        ]
    }
}
