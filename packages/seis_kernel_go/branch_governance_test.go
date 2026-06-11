package seis_kernel_go

import "testing"

func TestEvaluateBranchGovernanceBlocksUnmergedAndUnconfirmedBranches(t *testing.T) {
	result := EvaluateBranchGovernance(BranchGovernanceInput{
		DefaultBranch:           "main",
		ProtectedBranches:       []string{"main"},
		RemoteBranches:          []string{"origin/main", "origin/codex/work", "origin/claude/review", "origin/legacy"},
		MergedIntoMainBranches:  []string{"codex/work"},
		ConfirmedDeleteBranches: []string{},
	})

	if result.MainIsDefault != true {
		t.Fatal("expected main to be default")
	}
	assertBlocker(t, result.Blockers, "delete_confirmation_missing:codex/work")
	assertBlocker(t, result.Blockers, "non_main_branch_not_merged_into_main:claude/review")
	assertBlocker(t, result.Blockers, "non_main_branch_requires_manual_review:legacy")
	assertBlocker(t, result.Blockers, "non_main_branch_not_merged_into_main:legacy")
}

func TestEvaluateBranchGovernanceListsOnlyConfirmedMergedBranchesAsDeletable(t *testing.T) {
	result := EvaluateBranchGovernance(BranchGovernanceInput{
		DefaultBranch:           "main",
		ProtectedBranches:       []string{"main"},
		RemoteBranches:          []string{"origin/main", "origin/codex/work"},
		MergedIntoMainBranches:  []string{"origin/codex/work"},
		ConfirmedDeleteBranches: []string{"codex/work"},
	})

	if len(result.DeletableBranches) != 1 || result.DeletableBranches[0] != "codex/work" {
		t.Fatalf("unexpected deletable branches: %#v", result.DeletableBranches)
	}
	if len(result.Blockers) != 0 {
		t.Fatalf("expected no blockers for confirmed merged temp branch, got %#v", result.Blockers)
	}
	if result.ReadyForMainOnlyRepository() {
		t.Fatal("repository is not main-only until the deletable branch is actually removed")
	}
}

func TestEvaluateBranchGovernanceReadyWhenOnlyMainExists(t *testing.T) {
	result := EvaluateBranchGovernance(BranchGovernanceInput{
		DefaultBranch:           "main",
		ProtectedBranches:       []string{"main"},
		RemoteBranches:          []string{"origin/HEAD -> origin/main", "origin/main"},
		MergedIntoMainBranches:  nil,
		ConfirmedDeleteBranches: nil,
	})

	if !result.ReadyForMainOnlyRepository() {
		t.Fatalf("expected main-only readiness, blockers: %#v branches: %#v", result.Blockers, result.NonMainBranches)
	}
}
