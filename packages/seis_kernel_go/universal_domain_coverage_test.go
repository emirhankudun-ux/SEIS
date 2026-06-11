package seis_kernel_go

import "testing"

func TestEvaluateUniversalDomainCoverageReady(t *testing.T) {
	result := EvaluateUniversalDomainCoverage(nil)

	if !result.Ready {
		t.Fatalf("expected universal domain coverage to be ready, blockers: %#v", result.Blockers)
	}
	if result.DomainCount != 41 || result.RequiredDomainCount != 41 {
		t.Fatalf("expected 41 covered domains, got %#v", result)
	}
	if result.LaneCount < 10 {
		t.Fatalf("expected broad lane coverage, got %d", result.LaneCount)
	}
	if result.CoveragePercent != 100 {
		t.Fatalf("expected 100 coverage, got %.2f", result.CoveragePercent)
	}
}

func TestEvaluateUniversalDomainCoverageBlocksWeakDomain(t *testing.T) {
	result := EvaluateUniversalDomainCoverage([]UniversalDomainProfile{
		{
			ID:                  "ai-agent",
			Lane:                "ai-intelligence",
			AgentRole:           "",
			Algorithms:          []string{"intent-routing"},
			Flow:                "",
			QualityGates:        []string{"security"},
			PlatformBoundaries:  []string{"apple-only-apple-languages"},
			IntegrationSurfaces: nil,
		},
	})

	if result.Ready {
		t.Fatal("expected weak domain coverage to be blocked")
	}
	assertBlocker(t, result.Blockers, "missing_domain:mcp")
	assertBlocker(t, result.Blockers, "domain_agent_missing:ai-agent")
	assertBlocker(t, result.Blockers, "domain_algorithms_insufficient:ai-agent")
	assertBlocker(t, result.Blockers, "domain_flow_missing:ai-agent")
	assertBlocker(t, result.Blockers, "domain_quality_gate_missing:ai-agent:maintainability")
	assertBlocker(t, result.Blockers, "domain_platform_boundary_missing:ai-agent:windows-android-non-apple-polyglot")
	assertBlocker(t, result.Blockers, "domain_integration_surface_missing:ai-agent")
	assertBlocker(t, result.Blockers, "domain_lane_coverage_too_narrow")
}
