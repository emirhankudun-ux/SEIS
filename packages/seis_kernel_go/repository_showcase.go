package seis_kernel_go

import "sort"

type RepositoryShowcaseInput struct {
	ReadmeSections        []string
	CommunityFiles        []string
	ContributorSignals    []string
	PlatformSignals       []string
	ValidationSignals     []string
	AIRoutingSignals      []string
	BranchPolicy          string
	WebsiteIsFinalSurface bool
	DependencyPolicy      string
	AddsNewJavaScript     bool
	AddsNewPython         bool
}

type RepositoryShowcaseResult struct {
	Ready               bool
	Score               int
	VerifiedSignalCount int
	Blockers            []string
}

func RequiredReadmeSections() []string {
	return []string{
		"Active Collaboration Stack",
		"Contributors",
		"Platform Policy",
		"Capability Coverage",
		"Orchestration Gate",
		"Repository Governance",
		"Validation",
		"Community",
	}
}

func RequiredCommunityFiles() []string {
	return []string{"CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "SECURITY.md", "LICENSE"}
}

func RequiredShowcaseContributors() []string {
	return []string{"emirhankudun-ux", "OpenAI Codex", "Claude"}
}

func RequiredPlatformSignals() []string {
	return []string{
		"apple-only-languages",
		"windows-non-apple-polyglot",
		"android-native",
		"javascript-growth-frozen",
		"python-growth-frozen",
	}
}

func RequiredValidationSignals() []string {
	return []string{
		"swift-test",
		"go-test",
		"android-java-smoke",
		"windows-cpp-smoke",
		"objective-c-smoke",
	}
}

func RequiredAIRoutingSignals() []string {
	return []string{
		"seis-agent-remote-orchestrator",
		"online-ai-local-helpers",
		"ollama-offline-fallback",
	}
}

func EvaluateRepositoryShowcase(input RepositoryShowcaseInput) RepositoryShowcaseResult {
	blockers := []string{}
	blockers = append(blockers, missingShowcaseSignals(input.ReadmeSections, RequiredReadmeSections(), "readme_section_missing")...)
	blockers = append(blockers, missingShowcaseSignals(input.CommunityFiles, RequiredCommunityFiles(), "community_file_missing")...)
	blockers = append(blockers, missingShowcaseSignals(input.ContributorSignals, RequiredShowcaseContributors(), "contributor_signal_missing")...)
	blockers = append(blockers, missingShowcaseSignals(input.PlatformSignals, RequiredPlatformSignals(), "platform_signal_missing")...)
	blockers = append(blockers, missingShowcaseSignals(input.ValidationSignals, RequiredValidationSignals(), "validation_signal_missing")...)
	blockers = append(blockers, missingShowcaseSignals(input.AIRoutingSignals, RequiredAIRoutingSignals(), "ai_routing_signal_missing")...)

	if input.BranchPolicy != "main-centered" {
		blockers = append(blockers, "branch_policy_must_be_main_centered")
	}
	if !input.WebsiteIsFinalSurface {
		blockers = append(blockers, "website_final_surface_missing")
	}
	if input.DependencyPolicy != "requirement-led" {
		blockers = append(blockers, "dependency_policy_must_be_requirement_led")
	}
	if input.AddsNewJavaScript {
		blockers = append(blockers, "javascript_growth_frozen_for_current_phase")
	}
	if input.AddsNewPython {
		blockers = append(blockers, "python_growth_frozen_for_current_phase")
	}

	sort.Strings(blockers)
	score := 100 - len(blockers)*8
	if score < 0 {
		score = 0
	}
	return RepositoryShowcaseResult{
		Ready: len(blockers) == 0,
		Score: score,
		VerifiedSignalCount: len(input.ReadmeSections) +
			len(input.CommunityFiles) +
			len(input.ContributorSignals) +
			len(input.PlatformSignals) +
			len(input.ValidationSignals) +
			len(input.AIRoutingSignals),
		Blockers: blockers,
	}
}

func missingShowcaseSignals(values []string, required []string, prefix string) []string {
	present := stringSet(values)
	blockers := []string{}
	for _, value := range required {
		if !present[value] {
			blockers = append(blockers, prefix+":"+value)
		}
	}
	return blockers
}
