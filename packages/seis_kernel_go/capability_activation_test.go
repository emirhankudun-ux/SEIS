package seis_kernel_go

import "testing"

func TestEvaluateCapabilityActivationApprovesSmallRelevantSet(t *testing.T) {
	decision := EvaluateCapabilityActivation([]CapabilityActivationSurface{
		{
			ID: "github", Family: "repository", Mode: "local-cli",
			MissionMatched: true, AuthReady: true, TargetKnown: true,
			RollbackReady: true, QualityGatePassed: true, CredentialBoundary: true,
			WriteCapable: true, ApprovedForWrite: true,
		},
		{
			ID: "swiftpm", Family: "apple", Mode: "local-cli",
			MissionMatched: true, AuthReady: true, TargetKnown: true,
			RollbackReady: true, QualityGatePassed: true, CredentialBoundary: true,
			WriteCapable: false, ApprovedForWrite: false,
		},
	})

	if !decision.Ready() {
		t.Fatalf("expected activation to be ready, blockers: %#v", decision.Blockers)
	}
	if len(decision.ApprovedSurfaceIDs) != 2 {
		t.Fatalf("expected 2 approved surfaces, got %#v", decision.ApprovedSurfaceIDs)
	}
}

func TestEvaluateCapabilityActivationBlocksBroadOrUnsafeUse(t *testing.T) {
	decision := EvaluateCapabilityActivation([]CapabilityActivationSurface{
		{
			ID: "slack", Family: "collaboration", Mode: "connector",
			MissionMatched: false, AuthReady: false, TargetKnown: false,
			RollbackReady: false, QualityGatePassed: false, CredentialBoundary: false,
			WriteCapable: true, ApprovedForWrite: false,
		},
	})

	if decision.Ready() {
		t.Fatal("expected unsafe activation to be blocked")
	}
	assertBlocker(t, decision.Blockers, "mission_not_matched:slack")
	assertBlocker(t, decision.Blockers, "auth_not_ready:slack")
	assertBlocker(t, decision.Blockers, "target_unknown:slack")
	assertBlocker(t, decision.Blockers, "rollback_missing:slack")
	assertBlocker(t, decision.Blockers, "quality_gate_failed:slack")
	assertBlocker(t, decision.Blockers, "credential_boundary_missing:slack")
	assertBlocker(t, decision.Blockers, "write_approval_missing:slack")
}
