package seis_kernel_go

import "testing"

func TestEvaluateCapabilityBudget(t *testing.T) {
	domains := []DomainSignal{
		{
			ID: "ai-agent-engineering", Lane: "ai-intelligence", PluginCount: 5,
			QualityGateCount: 7, HasAgentRole: true, HasFlow: true,
		},
		{
			ID: "formal-methods", Lane: "core-computing", PluginCount: 2,
			QualityGateCount: 7, HasAgentRole: true, HasFlow: true,
		},
	}

	result := EvaluateCapabilityBudget(domains, 3, 5)
	if result.DomainCount != 2 {
		t.Fatalf("expected 2 domains, got %d", result.DomainCount)
	}
	if result.ReadyDomainCount != 1 {
		t.Fatalf("expected 1 ready domain, got %d", result.ReadyDomainCount)
	}
	if len(result.BlockedDomainIDs) != 1 || result.BlockedDomainIDs[0] != "formal-methods" {
		t.Fatalf("unexpected blocked domains: %#v", result.BlockedDomainIDs)
	}
}

func TestLaneHistogram(t *testing.T) {
	histogram := LaneHistogram([]DomainSignal{
		{ID: "web-development", Lane: "product-engineering"},
		{ID: "mobile-development", Lane: "product-engineering"},
		{ID: "cybersecurity", Lane: "security-governance"},
		{ID: "unknown"},
	})

	if histogram["product-engineering"] != 2 {
		t.Fatalf("expected product-engineering count 2, got %d", histogram["product-engineering"])
	}
	if histogram["security-governance"] != 1 {
		t.Fatalf("expected security-governance count 1, got %d", histogram["security-governance"])
	}
	if histogram["unmapped"] != 1 {
		t.Fatalf("expected unmapped count 1, got %d", histogram["unmapped"])
	}
}
