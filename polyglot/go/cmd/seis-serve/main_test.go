package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func testRoot(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()
	files := map[string]string{
		"index.html":         "<!DOCTYPE html><title>t</title>",
		"site.webmanifest":   `{"name":"t"}`,
		"public/media/a.txt": "asset",
		"icons/icon-192.png": "png-bytes",
		"script.mjs":         "export {};",
	}
	for name, content := range files {
		p := filepath.Join(dir, name)
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(content), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return dir
}

func get(t *testing.T, h http.Handler, path string) *httptest.ResponseRecorder {
	t.Helper()
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
	return rec
}

func TestSecurityHeadersOnEveryResponse(t *testing.T) {
	h := NewHandler(testRoot(t))
	for _, path := range []string{"/", "/icons/icon-192.png", "/nope.html"} {
		rec := get(t, h, path)
		if csp := rec.Header().Get("Content-Security-Policy"); csp == "" {
			t.Errorf("%s: missing Content-Security-Policy", path)
		}
		if rec.Header().Get("X-Content-Type-Options") != "nosniff" {
			t.Errorf("%s: missing nosniff", path)
		}
		if rec.Header().Get("Referrer-Policy") == "" {
			t.Errorf("%s: missing Referrer-Policy", path)
		}
	}
}

func TestCSPAllowsTheActualPageDependencies(t *testing.T) {
	for _, needle := range []string{"fonts.googleapis.com", "fonts.gstatic.com", "behance.net"} {
		if !strings.Contains(ContentSecurityPolicy, needle) {
			t.Errorf("CSP must allow %s — the page loads it", needle)
		}
	}
}

func TestCacheSplit(t *testing.T) {
	h := NewHandler(testRoot(t))
	if cc := get(t, h, "/public/media/a.txt").Header().Get("Cache-Control"); !strings.Contains(cc, "max-age=86400") {
		t.Errorf("public assets should be cacheable, got %q", cc)
	}
	if cc := get(t, h, "/").Header().Get("Cache-Control"); cc != "no-cache" {
		t.Errorf("HTML should be no-cache, got %q", cc)
	}
}

func TestManifestAndModuleMIME(t *testing.T) {
	h := NewHandler(testRoot(t))
	if ct := get(t, h, "/site.webmanifest").Header().Get("Content-Type"); ct != "application/manifest+json" {
		t.Errorf("webmanifest MIME wrong: %q", ct)
	}
	if ct := get(t, h, "/script.mjs").Header().Get("Content-Type"); !strings.Contains(ct, "javascript") {
		t.Errorf(".mjs MIME wrong: %q", ct)
	}
}

func TestHealthzReturnsOKJSON(t *testing.T) {
	h := NewHandler(testRoot(t))
	rec := get(t, h, "/healthz")
	if rec.Code != http.StatusOK {
		t.Fatalf("/healthz code = %d, want 200", rec.Code)
	}
	if ct := rec.Header().Get("Content-Type"); !strings.Contains(ct, "application/json") {
		t.Errorf("/healthz Content-Type = %q, want JSON", ct)
	}
	var body map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("/healthz body is not JSON: %v", err)
	}
	if body["status"] != "ok" {
		t.Errorf("/healthz status = %v, want ok", body["status"])
	}
}

func TestServesContentAnd404(t *testing.T) {
	h := NewHandler(testRoot(t))
	if rec := get(t, h, "/"); rec.Code != http.StatusOK || !strings.Contains(rec.Body.String(), "<title>t</title>") {
		t.Errorf("index not served: code %d", rec.Code)
	}
	if rec := get(t, h, "/missing.css"); rec.Code != http.StatusNotFound {
		t.Errorf("expected 404, got %d", rec.Code)
	}
}
