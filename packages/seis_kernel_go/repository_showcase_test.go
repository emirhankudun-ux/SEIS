package seis_kernel_go

import "testing"

func TestEvaluateRepositoryShowcaseReady(t *testing.T) {
	result := EvaluateRepositoryShowcase(RepositoryShowcaseInput{
		ReadmeSections:        RequiredReadmeSections(),
		CommunityFiles:        RequiredCommunityFiles(),
		ContributorSignals:    RequiredShowcaseContributors(),
		PlatformSignals:       RequiredPlatformSignals(),
		ValidationSignals:     RequiredValidationSignals(),
		AIRoutingSignals:      RequiredAIRoutingSignals(),
		BranchPolicy:          "main-centered",
		WebsiteIsFinalSurface: true,
		DependencyPolicy:      "requirement-led",
		AddsNewJavaScript:     false,
		AddsNewPython:         false,
	})

	if !result.Ready {
		t.Fatalf("expected repository showcase to be ready, blockers: %#v", result.Blockers)
	}
	if result.Score != 100 {
		t.Fatalf("expected score 100, got %d", result.Score)
	}
	if result.VerifiedSignalCount < 28 {
		t.Fatalf("expected broad showcase signal coverage, got %d", result.VerifiedSignalCount)
	}
}

func TestEvaluateRepositoryShowcaseBlocksWeakGithubSurface(t *testing.T) {
	result := EvaluateRepositoryShowcase(RepositoryShowcaseInput{
		ReadmeSections:        []string{"Active Collaboration Stack", "Contributors"},
		CommunityFiles:        []string{"LICENSE"},
		ContributorSignals:    []string{"emirhankudun-ux", "OpenAI Codex"},
		PlatformSignals:       []string{"apple-only-languages"},
		ValidationSignals:     []string{"swift-test"},
		AIRoutingSignals:      []string{"online-ai-local-helpers"},
		BranchPolicy:          "branch-sprawl",
		WebsiteIsFinalSurface: false,
		DependencyPolicy:      "install-everything",
		AddsNewJavaScript:     true,
		AddsNewPython:         true,
	})

	if result.Ready {
		t.Fatal("expected weak repository showcase to be blocked")
	}
	assertBlocker(t, result.Blockers, "contributor_signal_missing:Claude")
	assertBlocker(t, result.Blockers, "community_file_missing:CONTRIBUTING.md")
	assertBlocker(t, result.Blockers, "readme_section_missing:Repository Governance")
	assertBlocker(t, result.Blockers, "platform_signal_missing:windows-non-apple-polyglot")
	assertBlocker(t, result.Blockers, "ai_routing_signal_missing:ollama-offline-fallback")
	assertBlocker(t, result.Blockers, "branch_policy_must_be_main_centered")
	assertBlocker(t, result.Blockers, "dependency_policy_must_be_requirement_led")
	assertBlocker(t, result.Blockers, "javascript_growth_frozen_for_current_phase")
	assertBlocker(t, result.Blockers, "python_growth_frozen_for_current_phase")
}
