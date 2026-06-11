package seis_kernel_go

import "sort"

type MarketReadinessInput struct {
	Domains                 []string
	ContributorSignals      []string
	PrimaryBranch           string
	LongLivedBranches       []string
	WebsiteIsFinalSurface   bool
	AppleLanguages          []string
	WindowsAndroidLanguages []string
	RuntimeInstallPolicy    string
	AddsNewJavaScript       bool
	AddsNewPython           bool
	HasMITLicense           bool
	HasSecurityPolicy       bool
	HasContributingGuide    bool
	HasCodeOfConduct        bool
}

type MarketReadinessResult struct {
	Ready              bool
	Score              int
	DomainCount        int
	MainOnlyPolicy     bool
	CodexClaudeVisible bool
	Blockers           []string
}

func RequiredCapabilityDomains() []string {
	return []string{
		"ai-agent",
		"mcp",
		"skills",
		"plugins",
		"llm-routing",
		"algorithms",
		"flowcharts",
		"mathematics",
		"computer-science",
		"web-development",
		"mobile-development",
		"game-development",
		"data-science",
		"machine-learning",
		"database-management",
		"version-control",
		"cloud-computing",
		"cybersecurity",
		"devops",
		"system-administration",
		"test-engineering",
		"software-architecture",
		"design-patterns",
		"big-data",
		"nlp",
		"computer-vision",
		"quantum-programming",
		"sustainable-software",
		"low-code-no-code",
		"ux-ui-engineering",
		"robotics",
		"ai-ethics",
		"data-governance",
		"compiler-design",
		"requirements-engineering",
		"agile-delivery",
		"sdlc-metrics",
		"sre",
		"reverse-engineering",
		"refactoring",
		"formal-methods",
	}
}

func EvaluateMarketReadiness(input MarketReadinessInput) MarketReadinessResult {
	blockers := []string{}
	domainSet := stringSet(input.Domains)
	missingDomains := []string{}
	for _, domain := range RequiredCapabilityDomains() {
		if !domainSet[domain] {
			missingDomains = append(missingDomains, domain)
		}
	}
	if len(missingDomains) > 0 {
		blockers = append(blockers, "missing_domains:"+joinComma(missingDomains))
	}

	contributors := stringSet(input.ContributorSignals)
	codexClaudeVisible := contributors["OpenAI Codex"] && contributors["Claude"]
	if !codexClaudeVisible {
		blockers = append(blockers, "codex_claude_contributor_signal_missing")
	}

	mainOnly := input.PrimaryBranch == "main"
	for _, branch := range input.LongLivedBranches {
		if branch != "main" {
			mainOnly = false
			break
		}
	}
	if !mainOnly {
		blockers = append(blockers, "main_only_branch_policy_not_enforced")
	}

	if !input.WebsiteIsFinalSurface {
		blockers = append(blockers, "website_must_remain_final_release_surface")
	}

	appleOnly := stringSet([]string{"Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"})
	if !sameStringSet(stringSet(input.AppleLanguages), appleOnly) {
		blockers = append(blockers, "apple_surface_must_use_only_apple_languages")
	}

	windowsAndroid := stringSet(input.WindowsAndroidLanguages)
	if len(windowsAndroid) < 8 || intersects(windowsAndroid, appleOnly) {
		blockers = append(blockers, "windows_android_surface_needs_broad_non_apple_languages")
	}

	if input.RuntimeInstallPolicy != "requirement_led_only" {
		blockers = append(blockers, "runtime_installs_must_be_requirement_led")
	}
	if input.AddsNewJavaScript {
		blockers = append(blockers, "javascript_growth_frozen_for_current_phase")
	}
	if input.AddsNewPython {
		blockers = append(blockers, "python_growth_frozen_for_current_phase")
	}

	if !input.HasMITLicense {
		blockers = append(blockers, "mit_license_missing")
	}
	if !input.HasSecurityPolicy {
		blockers = append(blockers, "security_policy_missing")
	}
	if !input.HasContributingGuide {
		blockers = append(blockers, "contributing_guide_missing")
	}
	if !input.HasCodeOfConduct {
		blockers = append(blockers, "code_of_conduct_missing")
	}

	sort.Strings(blockers)
	score := 100 - len(blockers)*12
	if score < 0 {
		score = 0
	}
	return MarketReadinessResult{
		Ready:              len(blockers) == 0,
		Score:              score,
		DomainCount:        len(input.Domains),
		MainOnlyPolicy:     mainOnly,
		CodexClaudeVisible: codexClaudeVisible,
		Blockers:           blockers,
	}
}

func stringSet(values []string) map[string]bool {
	out := map[string]bool{}
	for _, value := range values {
		out[value] = true
	}
	return out
}

func sameStringSet(left map[string]bool, right map[string]bool) bool {
	if len(left) != len(right) {
		return false
	}
	for key := range left {
		if !right[key] {
			return false
		}
	}
	return true
}

func intersects(left map[string]bool, right map[string]bool) bool {
	for key := range left {
		if right[key] {
			return true
		}
	}
	return false
}

func joinComma(values []string) string {
	if len(values) == 0 {
		return ""
	}
	sort.Strings(values)
	out := values[0]
	for _, value := range values[1:] {
		out += "," + value
	}
	return out
}
