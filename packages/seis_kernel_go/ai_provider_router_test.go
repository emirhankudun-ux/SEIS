package seis_kernel_go

import "testing"

func TestEvaluateAIProviderRoutingSelectsOnlineHelpers(t *testing.T) {
	decision := EvaluateAIProviderRouting(AIProviderRoutingInput{NetworkOnline: true})

	if !decision.Ready {
		t.Fatalf("expected online AI provider routing to be ready, blockers: %#v", decision.Blockers)
	}
	if decision.RemoteOrchestrator != "seis-agent" {
		t.Fatalf("expected SEIS Agent as remote orchestrator, got %q", decision.RemoteOrchestrator)
	}
	assertStringSlice(t, decision.SelectedLocalHelpers, []string{"openai", "claude", "gemini"})
	if decision.OfflineFallback != "ollama-standby" {
		t.Fatalf("expected ollama standby fallback, got %q", decision.OfflineFallback)
	}
}

func TestEvaluateAIProviderRoutingUsesOllamaOffline(t *testing.T) {
	decision := EvaluateAIProviderRouting(AIProviderRoutingInput{NetworkOnline: false})

	if !decision.Ready {
		t.Fatalf("expected offline AI provider routing to be ready, blockers: %#v", decision.Blockers)
	}
	assertStringSlice(t, decision.SelectedLocalHelpers, []string{"ollama"})
	if decision.OfflineFallback != "ollama" {
		t.Fatalf("expected ollama offline fallback, got %q", decision.OfflineFallback)
	}
}

func TestEvaluateAIProviderRoutingBlocksRemoteHelperPromotion(t *testing.T) {
	providers := DefaultAIProviderSurfaces()
	providers[1].Role = "remote-orchestrator"
	providers[1].CredentialBoundary = false

	decision := EvaluateAIProviderRouting(AIProviderRoutingInput{
		NetworkOnline: true,
		Providers:     providers,
	})

	if decision.Ready {
		t.Fatal("expected remote helper promotion to be blocked")
	}
	assertBlocker(t, decision.Blockers, "local_helper_promoted_to_remote:openai")
	assertBlocker(t, decision.Blockers, "credential_boundary_missing:openai")
	assertBlocker(t, decision.Blockers, "remote_orchestrator_must_be_seis_agent_only")
}

func assertStringSlice(t *testing.T, actual []string, expected []string) {
	t.Helper()
	if len(actual) != len(expected) {
		t.Fatalf("expected %#v, got %#v", expected, actual)
	}
	for index := range actual {
		if actual[index] != expected[index] {
			t.Fatalf("expected %#v, got %#v", expected, actual)
		}
	}
}
