package polyglot

type HealthStatus struct {
	Name              string   `json:"name"`
	Version           string   `json:"version"`
	Locales           []string `json:"locales"`
	CuratedAssetCount int      `json:"curatedAssetCount"`
	ReducedMotion     bool     `json:"reducedMotion"`
}

func FoundationHealth() HealthStatus {
	return HealthStatus{
		Name:              "seis-digital-experience-foundation",
		Version:           "0.1.0",
		Locales:           []string{"tr", "en", "fr", "it", "de", "es", "ar"},
		CuratedAssetCount: 20,
		ReducedMotion:     true,
	}
}
