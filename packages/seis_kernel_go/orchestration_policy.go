package seis_kernel_go

import "sort"

type OrchestrationSurface struct {
	ID                    string
	Mode                  string
	Gates                 []string
	HasCredentialBoundary bool
}

type OrchestrationDecision struct {
	Approved           bool
	RemoteOrchestrator string
	LocalHelperCount   int
	Blockers           []string
}

func EvaluateOrchestrationPolicy(surfaces []OrchestrationSurface) OrchestrationDecision {
	blockers := []string{}
	remote := []string{}
	for _, surface := range surfaces {
		if surface.Mode == "remote-orchestrator" {
			remote = append(remote, surface.ID)
		}
		if !hasAllRequiredOrchestrationGates(surface.Gates) {
			blockers = append(blockers, "missing_required_orchestration_gates:"+surface.ID)
		}
		if !surface.HasCredentialBoundary {
			blockers = append(blockers, "credential_boundary_missing:"+surface.ID)
		}
		if surface.ID != "seis-agent" && surface.Mode == "remote-orchestrator" {
			blockers = append(blockers, "local_helper_promoted_to_remote:"+surface.ID)
		}
	}
	if len(remote) != 1 || remote[0] != "seis-agent" {
		blockers = append(blockers, "remote_orchestrator_must_be_seis_agent_only")
	}
	sort.Strings(blockers)

	localHelperCount := 0
	for _, surface := range surfaces {
		if surface.Mode == "local-helper" {
			localHelperCount++
		}
	}
	remoteOrchestrator := ""
	if len(remote) > 0 {
		remoteOrchestrator = remote[0]
	}
	return OrchestrationDecision{
		Approved:           len(blockers) == 0,
		RemoteOrchestrator: remoteOrchestrator,
		LocalHelperCount:   localHelperCount,
		Blockers:           blockers,
	}
}

func hasAllRequiredOrchestrationGates(gates []string) bool {
	required := map[string]bool{
		"mcp":                 false,
		"skills":              false,
		"plugins":             false,
		"llm-routing":         false,
		"credential-boundary": false,
	}
	for _, gate := range gates {
		if _, ok := required[gate]; ok {
			required[gate] = true
		}
	}
	for _, present := range required {
		if !present {
			return false
		}
	}
	return true
}
