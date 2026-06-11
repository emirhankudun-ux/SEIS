package seis_kernel_go

import "testing"

func TestEvaluateMarketReadinessReady(t *testing.T) {
	result := EvaluateMarketReadiness(MarketReadinessInput{
		Domains:                 RequiredCapabilityDomains(),
		ContributorSignals:      []string{"emirhankudun-ux", "OpenAI Codex", "Claude"},
		PrimaryBranch:           "main",
		LongLivedBranches:       []string{"main"},
		WebsiteIsFinalSurface:   true,
		AppleLanguages:          []string{"Swift", "SwiftUI", "Playground", "Objective-C", "AppleScript"},
		WindowsAndroidLanguages: []string{"C#", "PowerShell", "C++", "Rust", "Go", "Java", "Kotlin", "SQL"},
		RuntimeInstallPolicy:    "requirement_led_only",
		HasMITLicense:           true,
		HasSecurityPolicy:       true,
		HasContributingGuide:    true,
		HasCodeOfConduct:        true,
	})

	if !result.Ready {
		t.Fatalf("expected ready result, blockers: %#v", result.Blockers)
	}
	if result.Score != 100 {
		t.Fatalf("expected score 100, got %d", result.Score)
	}
	if result.DomainCount != 41 {
		t.Fatalf("expected 41 domains, got %d", result.DomainCount)
	}
	if !result.MainOnlyPolicy || !result.CodexClaudeVisible {
		t.Fatalf("expected main-only and Codex+Claude signals, got %#v", result)
	}
}

func TestEvaluateMarketReadinessBlocksMissingClaudeAndMain(t *testing.T) {
	result := EvaluateMarketReadiness(MarketReadinessInput{
		Domains:                 RequiredCapabilityDomains(),
		ContributorSignals:      []string{"emirhankudun-ux", "OpenAI Codex"},
		PrimaryBranch:           "codex/seis-platform-polyglot-kernel",
		LongLivedBranches:       []string{"main", "codex/seis-platform-polyglot-kernel"},
		WebsiteIsFinalSurface:   true,
		AppleLanguages:          []string{"Swift", "SwiftUI", "Playground", "Objective-C", "AppleScript"},
		WindowsAndroidLanguages: []string{"C#", "PowerShell", "C++", "Rust", "Go", "Java", "Kotlin", "SQL"},
		RuntimeInstallPolicy:    "requirement_led_only",
		HasMITLicense:           true,
		HasSecurityPolicy:       true,
		HasContributingGuide:    true,
		HasCodeOfConduct:        true,
	})

	if result.Ready {
		t.Fatal("expected blocked result")
	}
	assertBlocker(t, result.Blockers, "codex_claude_contributor_signal_missing")
	assertBlocker(t, result.Blockers, "main_only_branch_policy_not_enforced")
}

func assertBlocker(t *testing.T, blockers []string, expected string) {
	t.Helper()
	for _, blocker := range blockers {
		if blocker == expected {
			return
		}
	}
	t.Fatalf("expected blocker %q in %#v", expected, blockers)
}
