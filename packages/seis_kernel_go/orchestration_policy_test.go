package seis_kernel_go

import "testing"

func TestEvaluateOrchestrationPolicyReady(t *testing.T) {
	decision := EvaluateOrchestrationPolicy([]OrchestrationSurface{
		{ID: "seis-agent", Mode: "remote-orchestrator", Gates: orchestrationGates(), HasCredentialBoundary: true},
		{ID: "openai", Mode: "local-helper", Gates: orchestrationGates(), HasCredentialBoundary: true},
		{ID: "claude", Mode: "local-helper", Gates: orchestrationGates(), HasCredentialBoundary: true},
		{ID: "ollama", Mode: "local-helper", Gates: orchestrationGates(), HasCredentialBoundary: true},
	})

	if !decision.Approved {
		t.Fatalf("expected approved orchestration decision, blockers: %#v", decision.Blockers)
	}
	if decision.RemoteOrchestrator != "seis-agent" {
		t.Fatalf("expected seis-agent remote orchestrator, got %q", decision.RemoteOrchestrator)
	}
	if decision.LocalHelperCount != 3 {
		t.Fatalf("expected 3 local helpers, got %d", decision.LocalHelperCount)
	}
}

func TestEvaluateOrchestrationPolicyBlocksRemoteHelperAndMissingGates(t *testing.T) {
	decision := EvaluateOrchestrationPolicy([]OrchestrationSurface{
		{ID: "seis-agent", Mode: "remote-orchestrator", Gates: orchestrationGates(), HasCredentialBoundary: true},
		{ID: "openai", Mode: "remote-orchestrator", Gates: []string{"llm-routing"}, HasCredentialBoundary: false},
	})

	if decision.Approved {
		t.Fatal("expected blocked orchestration decision")
	}
	assertBlocker(t, decision.Blockers, "local_helper_promoted_to_remote:openai")
	assertBlocker(t, decision.Blockers, "credential_boundary_missing:openai")
	assertBlocker(t, decision.Blockers, "missing_required_orchestration_gates:openai")
	assertBlocker(t, decision.Blockers, "remote_orchestrator_must_be_seis_agent_only")
}

func orchestrationGates() []string {
	return []string{"mcp", "skills", "plugins", "llm-routing", "credential-boundary"}
}
