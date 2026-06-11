package seis_kernel_go

import "sort"

type UniversalDomainProfile struct {
	ID                  string
	Lane                string
	AgentRole           string
	Algorithms          []string
	Flow                string
	QualityGates        []string
	PlatformBoundaries  []string
	IntegrationSurfaces []string
}

type UniversalDomainCoverageResult struct {
	Ready               bool
	DomainCount         int
	RequiredDomainCount int
	LaneCount           int
	CoveragePercent     float64
	Blockers            []string
}

func RequiredUniversalQualityGates() []string {
	return []string{"security", "maintainability", "testability", "platform-boundary", "rollback"}
}

func RequiredUniversalPlatformBoundaries() []string {
	return []string{"apple-only-apple-languages", "windows-android-non-apple-polyglot", "runtime-install-requirement-led"}
}

func DefaultUniversalDomainProfiles() []UniversalDomainProfile {
	profiles := []UniversalDomainProfile{}
	for _, domain := range RequiredCapabilityDomains() {
		profiles = append(profiles, universalDomainProfile(domain))
	}
	return profiles
}

func EvaluateUniversalDomainCoverage(profiles []UniversalDomainProfile) UniversalDomainCoverageResult {
	if profiles == nil {
		profiles = DefaultUniversalDomainProfiles()
	}

	blockers := []string{}
	profileByID := map[string]UniversalDomainProfile{}
	for _, profile := range profiles {
		profileByID[profile.ID] = profile
	}
	for _, domain := range RequiredCapabilityDomains() {
		if _, ok := profileByID[domain]; !ok {
			blockers = append(blockers, "missing_domain:"+domain)
		}
	}

	for _, profile := range profiles {
		blockers = append(blockers, universalDomainProfileBlockers(profile)...)
	}

	laneCount := len(universalLaneHistogram(profiles))
	if laneCount < 10 {
		blockers = append(blockers, "domain_lane_coverage_too_narrow")
	}

	sort.Strings(blockers)
	requiredCount := len(RequiredCapabilityDomains())
	coverage := 100.0
	if requiredCount > 0 {
		coverage = float64(len(profiles)) / float64(requiredCount) * 100
	}
	return UniversalDomainCoverageResult{
		Ready:               len(blockers) == 0,
		DomainCount:         len(profiles),
		RequiredDomainCount: requiredCount,
		LaneCount:           laneCount,
		CoveragePercent:     coverage,
		Blockers:            blockers,
	}
}

func universalDomainProfile(domain string) UniversalDomainProfile {
	lane := universalLaneForDomain(domain)
	return UniversalDomainProfile{
		ID:                  domain,
		Lane:                lane,
		AgentRole:           domain + "-agent",
		Algorithms:          universalAlgorithmsForLane(lane),
		Flow:                "intake -> classify -> route -> implement -> validate -> report",
		QualityGates:        RequiredUniversalQualityGates(),
		PlatformBoundaries:  RequiredUniversalPlatformBoundaries(),
		IntegrationSurfaces: universalIntegrationSurfacesForLane(lane),
	}
}

func universalDomainProfileBlockers(profile UniversalDomainProfile) []string {
	blockers := []string{}
	if profile.Lane == "" {
		blockers = append(blockers, "domain_lane_missing:"+profile.ID)
	}
	if profile.AgentRole == "" {
		blockers = append(blockers, "domain_agent_missing:"+profile.ID)
	}
	if len(profile.Algorithms) < 2 {
		blockers = append(blockers, "domain_algorithms_insufficient:"+profile.ID)
	}
	if profile.Flow == "" {
		blockers = append(blockers, "domain_flow_missing:"+profile.ID)
	}
	presentGates := stringSet(profile.QualityGates)
	for _, gate := range RequiredUniversalQualityGates() {
		if !presentGates[gate] {
			blockers = append(blockers, "domain_quality_gate_missing:"+profile.ID+":"+gate)
		}
	}
	presentBoundaries := stringSet(profile.PlatformBoundaries)
	for _, boundary := range RequiredUniversalPlatformBoundaries() {
		if !presentBoundaries[boundary] {
			blockers = append(blockers, "domain_platform_boundary_missing:"+profile.ID+":"+boundary)
		}
	}
	if len(profile.IntegrationSurfaces) == 0 {
		blockers = append(blockers, "domain_integration_surface_missing:"+profile.ID)
	}
	return blockers
}

func universalLaneForDomain(domain string) string {
	switch domain {
	case "ai-agent", "mcp", "skills", "plugins", "llm-routing", "machine-learning", "nlp", "computer-vision":
		return "ai-intelligence"
	case "algorithms", "flowcharts", "mathematics", "computer-science", "compiler-design", "formal-methods":
		return "core-computing"
	case "web-development", "mobile-development", "low-code-no-code":
		return "product-engineering"
	case "game-development", "robotics":
		return "interactive-systems"
	case "data-science":
		return "data-intelligence"
	case "database-management", "big-data", "data-governance":
		return "data-platform"
	case "version-control", "requirements-engineering", "agile-delivery", "sdlc-metrics":
		return "product-governance"
	case "cloud-computing", "devops", "system-administration", "sre":
		return "cloud-ops"
	case "cybersecurity", "reverse-engineering":
		return "security-governance"
	case "software-architecture", "design-patterns", "refactoring":
		return "architecture"
	case "ux-ui-engineering":
		return "design-systems"
	case "quantum-programming":
		return "research-lab"
	case "sustainable-software", "ai-ethics":
		return "governance"
	default:
		return "general-engineering"
	}
}

func universalAlgorithmsForLane(lane string) []string {
	switch lane {
	case "ai-intelligence":
		return []string{"intent-routing", "provider-fallback", "policy-gating"}
	case "core-computing":
		return []string{"graph-search", "dynamic-programming", "constraint-solving"}
	case "product-engineering":
		return []string{"request-routing", "state-reduction", "cache-invalidation"}
	case "interactive-systems":
		return []string{"event-loop", "path-planning", "collision-detection"}
	case "data-intelligence", "data-platform":
		return []string{"query-planning", "semantic-aggregation", "lineage-checking"}
	case "cloud-ops":
		return []string{"rollback-sequencing", "health-checking", "capacity-budgeting"}
	case "security-governance":
		return []string{"threat-modeling", "secret-detection", "attack-path-analysis"}
	case "architecture":
		return []string{"dependency-inversion", "behavior-characterization", "adapter-selection"}
	case "design-systems":
		return []string{"information-architecture", "interaction-state-modeling", "accessibility-heuristics"}
	case "research-lab":
		return []string{"simulation", "symbolic-analysis", "experiment-routing"}
	case "governance", "product-governance":
		return []string{"traceability-mapping", "risk-scoring", "stage-gating"}
	default:
		return []string{"classification", "routing", "validation"}
	}
}

func universalIntegrationSurfacesForLane(lane string) []string {
	switch lane {
	case "ai-intelligence":
		return []string{"seis-agent", "mcp", "skills", "plugins", "llm-routing"}
	case "design-systems":
		return []string{"design-review", "accessibility-review", "asset-governance"}
	case "cloud-ops":
		return []string{"deployment-gate", "observability", "rollback-plan"}
	case "security-governance":
		return []string{"security-scan", "threat-model", "credential-boundary"}
	default:
		return []string{"agent-role", "quality-gates", "reporting"}
	}
}

func universalLaneHistogram(profiles []UniversalDomainProfile) map[string]int {
	histogram := map[string]int{}
	for _, profile := range profiles {
		if profile.Lane == "" {
			histogram["unmapped"]++
			continue
		}
		histogram[profile.Lane]++
	}
	return histogram
}
