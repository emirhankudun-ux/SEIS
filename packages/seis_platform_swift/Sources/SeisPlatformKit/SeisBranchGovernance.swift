import Foundation

public struct SeisBranchGovernanceInput: Codable, Equatable, Sendable {
    public let defaultBranch: String
    public let protectedBranches: [String]
    public let remoteBranches: [String]
    public let mergedIntoMainBranches: [String]
    public let confirmedDeleteBranches: [String]

    public init(
        defaultBranch: String,
        protectedBranches: [String],
        remoteBranches: [String],
        mergedIntoMainBranches: [String],
        confirmedDeleteBranches: [String]
    ) {
        self.defaultBranch = defaultBranch
        self.protectedBranches = protectedBranches
        self.remoteBranches = remoteBranches
        self.mergedIntoMainBranches = mergedIntoMainBranches
        self.confirmedDeleteBranches = confirmedDeleteBranches
    }
}

public struct SeisBranchGovernanceResult: Codable, Equatable, Sendable {
    public let mainIsDefault: Bool
    public let nonMainBranches: [String]
    public let deletableBranches: [String]
    public let blockers: [String]

    public var readyForMainOnlyRepository: Bool {
        blockers.isEmpty && nonMainBranches.isEmpty
    }
}

public enum SeisBranchGovernance {
    private static let allowedTemporaryPrefixes = ["codex/", "claude/", "fix/", "feature/"]

    public static func evaluate(_ input: SeisBranchGovernanceInput) -> SeisBranchGovernanceResult {
        let branches = normalizedBranches(input.remoteBranches)
        let nonMainBranches = branches.filter { $0 != "main" }.sorted()
        let merged = Set(normalizedBranches(input.mergedIntoMainBranches))
        let confirmed = Set(normalizedBranches(input.confirmedDeleteBranches))
        var blockers: [String] = []
        var deletable: [String] = []

        if input.defaultBranch != "main" {
            blockers.append("default_branch_must_be_main")
        }

        let protected = Set(input.protectedBranches)
        if !protected.isSubset(of: ["main"]) {
            blockers.append("only_main_may_be_long_lived_or_protected")
        }

        for branch in nonMainBranches {
            if !isTemporaryBranch(branch) {
                blockers.append("non_main_branch_requires_manual_review:\(branch)")
            }
            if !merged.contains(branch) {
                blockers.append("non_main_branch_not_merged_into_main:\(branch)")
                continue
            }
            if !confirmed.contains(branch) {
                blockers.append("delete_confirmation_missing:\(branch)")
                continue
            }
            deletable.append(branch)
        }

        blockers.sort()
        deletable.sort()
        return SeisBranchGovernanceResult(
            mainIsDefault: input.defaultBranch == "main",
            nonMainBranches: nonMainBranches,
            deletableBranches: deletable,
            blockers: blockers
        )
    }

    private static func isTemporaryBranch(_ branch: String) -> Bool {
        allowedTemporaryPrefixes.contains { branch.hasPrefix($0) }
    }

    private static func normalizedBranches(_ branches: [String]) -> [String] {
        branches.compactMap { raw in
            var branch = raw.trimmingCharacters(in: .whitespacesAndNewlines)
            if branch == "origin/HEAD" || branch.contains("HEAD ->") {
                return nil
            }
            if branch.hasPrefix("origin/") {
                branch.removeFirst("origin/".count)
            }
            return branch.isEmpty ? nil : branch
        }
    }
}
