package seis_kernel_go

import "sort"

type CapabilityActivationSurface struct {
	ID                 string
	Family             string
	Mode               string
	MissionMatched     bool
	AuthReady          bool
	TargetKnown        bool
	RollbackReady      bool
	QualityGatePassed  bool
	CredentialBoundary bool
	WriteCapable       bool
	ApprovedForWrite   bool
}

type CapabilityActivationDecision struct {
	ApprovedSurfaceIDs []string
	BlockedSurfaceIDs  []string
	Blockers           []string
}

func (d CapabilityActivationDecision) Ready() bool {
	return len(d.Blockers) == 0
}

func EvaluateCapabilityActivation(surfaces []CapabilityActivationSurface) CapabilityActivationDecision {
	approved := []string{}
	blocked := []string{}
	blockers := []string{}

	for _, surface := range surfaces {
		surfaceBlockers := capabilityActivationBlockers(surface)
		if len(surfaceBlockers) == 0 {
			approved = append(approved, surface.ID)
			continue
		}
		blocked = append(blocked, surface.ID)
		blockers = append(blockers, surfaceBlockers...)
	}

	sort.Strings(approved)
	sort.Strings(blocked)
	sort.Strings(blockers)
	return CapabilityActivationDecision{
		ApprovedSurfaceIDs: approved,
		BlockedSurfaceIDs:  blocked,
		Blockers:           blockers,
	}
}

func capabilityActivationBlockers(surface CapabilityActivationSurface) []string {
	blockers := []string{}
	if !surface.MissionMatched {
		blockers = append(blockers, "mission_not_matched:"+surface.ID)
	}
	if !surface.AuthReady {
		blockers = append(blockers, "auth_not_ready:"+surface.ID)
	}
	if !surface.TargetKnown {
		blockers = append(blockers, "target_unknown:"+surface.ID)
	}
	if !surface.RollbackReady {
		blockers = append(blockers, "rollback_missing:"+surface.ID)
	}
	if !surface.QualityGatePassed {
		blockers = append(blockers, "quality_gate_failed:"+surface.ID)
	}
	if !surface.CredentialBoundary {
		blockers = append(blockers, "credential_boundary_missing:"+surface.ID)
	}
	if surface.WriteCapable && !surface.ApprovedForWrite {
		blockers = append(blockers, "write_approval_missing:"+surface.ID)
	}
	return blockers
}
