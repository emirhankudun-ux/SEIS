package polyglot

import "testing"

func TestFoundationHealthContract(t *testing.T) {
	h := FoundationHealth()
	if h.Name == "" || h.Version == "" {
		t.Fatalf("health contract must carry name and version, got %+v", h)
	}
	required := []string{"tr", "en", "fr", "it", "de"}
	for _, locale := range required {
		found := false
		for _, l := range h.Locales {
			if l == locale {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("locale %q missing from health contract", locale)
		}
	}
	if h.CuratedAssetCount <= 0 {
		t.Errorf("curated asset count must be positive, got %d", h.CuratedAssetCount)
	}
	if !h.ReducedMotion {
		t.Error("reduced motion support is a constitution requirement")
	}
}
