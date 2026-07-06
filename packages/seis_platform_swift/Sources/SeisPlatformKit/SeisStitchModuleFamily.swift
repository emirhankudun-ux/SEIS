import Foundation

public struct SeisStitchUXScreenCatalog: Codable, Equatable, Sendable {
    public let schema: String?
    public let id: String
    public let version: String
    public let status: String
    public let visibility: String
    public let purpose: String
    public let usageBoundary: SeisStitchUsageBoundary
    public let moduleFamilies: [SeisStitchModuleFamily]

    public init(
        schema: String? = nil,
        id: String,
        version: String,
        status: String,
        visibility: String,
        purpose: String,
        usageBoundary: SeisStitchUsageBoundary,
        moduleFamilies: [SeisStitchModuleFamily]
    ) {
        self.schema = schema
        self.id = id
        self.version = version
        self.status = status
        self.visibility = visibility
        self.purpose = purpose
        self.usageBoundary = usageBoundary
        self.moduleFamilies = moduleFamilies
    }

    public func moduleFamily(id: String) -> SeisStitchModuleFamily? {
        moduleFamilies.first { $0.id == id }
    }

    private enum CodingKeys: String, CodingKey {
        case schema = "$schema"
        case id
        case version
        case status
        case visibility
        case purpose
        case usageBoundary
        case moduleFamilies
    }
}

public struct SeisStitchUsageBoundary: Codable, Equatable, Sendable {
    public let originalArchivesMutable: Bool
    public let rawArchiveDumpAllowed: Bool
    public let codeCopyAllowedWithoutReview: Bool
    public let selectedAssetsAllowedAfterReview: Bool
    public let licenseReviewRequired: Bool
    public let sizeReviewRequired: Bool
    public let publicSafeReviewRequired: Bool
    public let demoMayUseAsDesignReference: Bool
    public let swiftMayUseAsModuleVocabulary: Bool

    public init(
        originalArchivesMutable: Bool,
        rawArchiveDumpAllowed: Bool,
        codeCopyAllowedWithoutReview: Bool,
        selectedAssetsAllowedAfterReview: Bool,
        licenseReviewRequired: Bool,
        sizeReviewRequired: Bool,
        publicSafeReviewRequired: Bool,
        demoMayUseAsDesignReference: Bool,
        swiftMayUseAsModuleVocabulary: Bool
    ) {
        self.originalArchivesMutable = originalArchivesMutable
        self.rawArchiveDumpAllowed = rawArchiveDumpAllowed
        self.codeCopyAllowedWithoutReview = codeCopyAllowedWithoutReview
        self.selectedAssetsAllowedAfterReview = selectedAssetsAllowedAfterReview
        self.licenseReviewRequired = licenseReviewRequired
        self.sizeReviewRequired = sizeReviewRequired
        self.publicSafeReviewRequired = publicSafeReviewRequired
        self.demoMayUseAsDesignReference = demoMayUseAsDesignReference
        self.swiftMayUseAsModuleVocabulary = swiftMayUseAsModuleVocabulary
    }

    public var allowsRepositoryAssetImportWithoutReview: Bool {
        rawArchiveDumpAllowed ||
            codeCopyAllowedWithoutReview ||
            !licenseReviewRequired ||
            !sizeReviewRequired ||
            !publicSafeReviewRequired
    }
}

public struct SeisStitchModuleFamily: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let sourceSignals: [String]
    public let seisUse: String
    public let priority: String
    public let allowedNextStep: String

    public init(
        id: String,
        label: String,
        sourceSignals: [String],
        seisUse: String,
        priority: String,
        allowedNextStep: String
    ) {
        self.id = id
        self.label = label
        self.sourceSignals = sourceSignals
        self.seisUse = seisUse
        self.priority = priority
        self.allowedNextStep = allowedNextStep
    }

    public var isFoundationPriority: Bool {
        priority == "P0" || priority == "P1"
    }
}
