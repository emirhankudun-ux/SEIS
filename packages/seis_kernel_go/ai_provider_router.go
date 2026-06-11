package seis_kernel_go

import "sort"

type AIProviderSurface struct {
	ID                 string
	Role               string
	Runtime            string
	OnlineCapable      bool
	OfflineCapable     bool
	AuthReady          bool
	CredentialBoundary bool
	Priority           int
}

type AIProviderRoutingInput struct {
	NetworkOnline bool
	Providers     []AIProviderSurface
}

type AIProviderRoutingDecision struct {
	Ready                bool
	RemoteOrchestrator   string
	SelectedLocalHelpers []string
	OfflineFallback      string
	Blockers             []string
}

func DefaultAIProviderSurfaces() []AIProviderSurface {
	return []AIProviderSurface{
		{ID: "seis-agent", Role: "remote-orchestrator", Runtime: "seis", OnlineCapable: true, AuthReady: true, CredentialBoundary: true, Priority: 0},
		{ID: "openai", Role: "local-helper", Runtime: "remote-api", OnlineCapable: true, AuthReady: true, CredentialBoundary: true, Priority: 10},
		{ID: "claude", Role: "local-helper", Runtime: "remote-api", OnlineCapable: true, AuthReady: true, CredentialBoundary: true, Priority: 20},
		{ID: "gemini", Role: "local-helper", Runtime: "remote-api", OnlineCapable: true, AuthReady: true, CredentialBoundary: true, Priority: 30},
		{ID: "ollama", Role: "offline-helper", Runtime: "local-model", OfflineCapable: true, AuthReady: true, CredentialBoundary: true, Priority: 100},
	}
}

func EvaluateAIProviderRouting(input AIProviderRoutingInput) AIProviderRoutingDecision {
	providers := input.Providers
	if len(providers) == 0 {
		providers = DefaultAIProviderSurfaces()
	}

	blockers := []string{}
	remote := []AIProviderSurface{}
	for _, provider := range providers {
		if provider.Role == "remote-orchestrator" {
			remote = append(remote, provider)
		}
		blockers = append(blockers, aiProviderSurfaceBlockers(provider)...)
	}
	if len(remote) != 1 || remote[0].ID != "seis-agent" {
		blockers = append(blockers, "remote_orchestrator_must_be_seis_agent_only")
	}

	selected := selectedAIHelpers(input.NetworkOnline, providers)
	if input.NetworkOnline && len(selected) == 0 {
		blockers = append(blockers, "online_ai_helper_missing")
	}
	if !input.NetworkOnline && (len(selected) == 0 || selected[0].ID != "ollama") {
		blockers = append(blockers, "offline_ollama_fallback_missing")
	}

	sort.Strings(blockers)
	helperIDs := []string{}
	for _, helper := range selected {
		helperIDs = append(helperIDs, helper.ID)
	}
	offlineFallback := "ollama-standby"
	if !input.NetworkOnline && len(selected) > 0 {
		offlineFallback = selected[0].ID
	}

	remoteOrchestrator := ""
	if len(remote) > 0 {
		remoteOrchestrator = remote[0].ID
	}
	return AIProviderRoutingDecision{
		Ready:                len(blockers) == 0,
		RemoteOrchestrator:   remoteOrchestrator,
		SelectedLocalHelpers: helperIDs,
		OfflineFallback:      offlineFallback,
		Blockers:             blockers,
	}
}

func aiProviderSurfaceBlockers(provider AIProviderSurface) []string {
	blockers := []string{}
	if provider.Role == "remote-orchestrator" && provider.ID != "seis-agent" {
		blockers = append(blockers, "local_helper_promoted_to_remote:"+provider.ID)
	}
	if !provider.CredentialBoundary {
		blockers = append(blockers, "credential_boundary_missing:"+provider.ID)
	}
	if !provider.AuthReady && provider.OnlineCapable {
		blockers = append(blockers, "auth_not_ready:"+provider.ID)
	}
	return blockers
}

func selectedAIHelpers(networkOnline bool, providers []AIProviderSurface) []AIProviderSurface {
	selected := []AIProviderSurface{}
	for _, provider := range providers {
		if networkOnline {
			if provider.Role == "local-helper" &&
				provider.OnlineCapable &&
				provider.AuthReady &&
				provider.CredentialBoundary {
				selected = append(selected, provider)
			}
			continue
		}
		if provider.Role == "offline-helper" &&
			provider.ID == "ollama" &&
			provider.OfflineCapable &&
			provider.AuthReady &&
			provider.CredentialBoundary {
			selected = append(selected, provider)
		}
	}
	sort.SliceStable(selected, func(left int, right int) bool {
		if selected[left].Priority == selected[right].Priority {
			return selected[left].ID < selected[right].ID
		}
		return selected[left].Priority < selected[right].Priority
	})
	return selected
}
