package seis_kernel_go

import (
	"sort"
	"strings"
)

type BranchGovernanceInput struct {
	DefaultBranch           string
	ProtectedBranches       []string
	RemoteBranches          []string
	MergedIntoMainBranches  []string
	ConfirmedDeleteBranches []string
}

type BranchGovernanceResult struct {
	MainIsDefault     bool
	NonMainBranches   []string
	DeletableBranches []string
	Blockers          []string
}

func (r BranchGovernanceResult) ReadyForMainOnlyRepository() bool {
	return len(r.Blockers) == 0 && len(r.NonMainBranches) == 0
}

func EvaluateBranchGovernance(input BranchGovernanceInput) BranchGovernanceResult {
	branches := normalizeBranches(input.RemoteBranches)
	nonMain := []string{}
	for _, branch := range branches {
		if branch != "main" {
			nonMain = append(nonMain, branch)
		}
	}
	sort.Strings(nonMain)

	merged := stringSet(normalizeBranches(input.MergedIntoMainBranches))
	confirmed := stringSet(normalizeBranches(input.ConfirmedDeleteBranches))
	blockers := []string{}
	deletable := []string{}

	if input.DefaultBranch != "main" {
		blockers = append(blockers, "default_branch_must_be_main")
	}
	for _, branch := range input.ProtectedBranches {
		if branch != "main" {
			blockers = append(blockers, "only_main_may_be_long_lived_or_protected")
			break
		}
	}
	for _, branch := range nonMain {
		if !isTemporaryBranch(branch) {
			blockers = append(blockers, "non_main_branch_requires_manual_review:"+branch)
		}
		if !merged[branch] {
			blockers = append(blockers, "non_main_branch_not_merged_into_main:"+branch)
			continue
		}
		if !confirmed[branch] {
			blockers = append(blockers, "delete_confirmation_missing:"+branch)
			continue
		}
		deletable = append(deletable, branch)
	}
	sort.Strings(blockers)
	sort.Strings(deletable)
	return BranchGovernanceResult{
		MainIsDefault:     input.DefaultBranch == "main",
		NonMainBranches:   nonMain,
		DeletableBranches: deletable,
		Blockers:          blockers,
	}
}

func isTemporaryBranch(branch string) bool {
	return strings.HasPrefix(branch, "codex/") ||
		strings.HasPrefix(branch, "claude/") ||
		strings.HasPrefix(branch, "fix/") ||
		strings.HasPrefix(branch, "feature/")
}

func normalizeBranches(branches []string) []string {
	normalized := []string{}
	for _, raw := range branches {
		branch := strings.TrimSpace(raw)
		if branch == "" || branch == "origin/HEAD" || strings.Contains(branch, "HEAD ->") {
			continue
		}
		branch = strings.TrimPrefix(branch, "origin/")
		normalized = append(normalized, branch)
	}
	return normalized
}
