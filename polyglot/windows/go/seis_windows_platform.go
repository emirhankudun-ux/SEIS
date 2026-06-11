package windowsplatform

type Capability struct {
	ID            string
	Languages     []string
	QualityGates  []string
	OfflineHelper bool
	RemoteBridge  bool
}

func CapabilitySurface() Capability {
	return Capability{
		ID:            "windows-go-service",
		Languages:     []string{"Go", "PowerShell", "SQL", "Python"},
		QualityGates:  []string{"go_build_when_available", "windows_path_safety", "permission_scope", "offline_fallback", "event_log_awareness"},
		OfflineHelper: true,
		RemoteBridge:  true,
	}
}

func IsReadyForSEISAgent(capability Capability) bool {
	return len(capability.Languages) >= 4 &&
		len(capability.QualityGates) >= 5 &&
		capability.OfflineHelper &&
		capability.RemoteBridge
}
