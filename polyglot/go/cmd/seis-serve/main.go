// seis-serve — local preview server for the SEIS portfolio site.
//
// The site is static with no build step, but opening index.html from the
// filesystem breaks fetch() and the service worker. This server gives a
// faithful local preview AND demonstrates the production header set:
// the security_audit advisory "no CSP meta tag" is intentionally solved
// at the HTTP layer, which is where CSP belongs for a static site.
//
// Usage: go run ./cmd/seis-serve [-addr :8080] [-root ../../apps/web]
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// ContentSecurityPolicy mirrors what the site actually loads: self for
// everything, Google Fonts for styles/fonts, Behance embeds in frames.
const ContentSecurityPolicy = "default-src 'self'; " +
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
	"font-src 'self' https://fonts.gstatic.com; " +
	"img-src 'self' data:; " +
	"frame-src https://www.behance.net; " +
	"script-src 'self'; " +
	"connect-src 'self'; " +
	"base-uri 'self'; form-action 'self' mailto:"

// extraMIME covers types Go's stdlib table misses or platforms misreport.
var extraMIME = map[string]string{
	".webmanifest": "application/manifest+json",
	".woff2":       "font/woff2",
	".mjs":         "text/javascript; charset=utf-8",
}

func securityHeaders(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hdr := w.Header()
		hdr.Set("Content-Security-Policy", ContentSecurityPolicy)
		hdr.Set("X-Content-Type-Options", "nosniff")
		hdr.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		hdr.Set("X-Frame-Options", "DENY")
		hdr.Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		h.ServeHTTP(w, r)
	})
}

func cachePolicy(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/public/") || strings.HasPrefix(r.URL.Path, "/icons/") {
			w.Header().Set("Cache-Control", "public, max-age=86400")
		} else {
			w.Header().Set("Cache-Control", "no-cache")
		}
		h.ServeHTTP(w, r)
	})
}

func withMIME(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if mime, ok := extraMIME[strings.ToLower(filepath.Ext(r.URL.Path))]; ok {
			w.Header().Set("Content-Type", mime)
		}
		h.ServeHTTP(w, r)
	})
}

// healthHandler reports liveness/readiness as JSON for uptime checks and
// load-balancer health probes — the observability lane of the SEIS full-stack map.
func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"status":  "ok",
		"service": "seis-serve",
	})
}

// statusRecorder captures the response status code for structured access logs.
type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (s *statusRecorder) WriteHeader(code int) {
	s.status = code
	s.ResponseWriter.WriteHeader(code)
}

// accessLog emits one structured line per request: method, path, status, duration.
// Structured logs are the first observability signal; an error sink/alerting and
// SLOs remain tracked as targets in SEIS_FULLSTACK_STACK.md.
func accessLog(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		h.ServeHTTP(rec, r)
		log.Printf("method=%s path=%q status=%d dur_ms=%d",
			r.Method, r.URL.Path, rec.status, time.Since(start).Milliseconds())
	})
}

// NewHandler assembles the full middleware chain over a root directory, routing
// /healthz to the health endpoint and everything else to the static file server.
func NewHandler(root string) http.Handler {
	fs := http.FileServer(http.Dir(root))
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", healthHandler)
	mux.Handle("/", securityHeaders(cachePolicy(withMIME(fs))))
	return accessLog(mux)
}

func main() {
	addr := flag.String("addr", ":8080", "listen address")
	root := flag.String("root", defaultRoot(), "web root directory to serve")
	flag.Parse()

	if _, err := os.Stat(filepath.Join(*root, "index.html")); err != nil {
		log.Fatalf("web root %q has no index.html: %v", *root, err)
	}
	fmt.Printf("seis-serve · http://localhost%s · root %s\n", *addr, *root)
	log.Fatal(http.ListenAndServe(*addr, NewHandler(*root)))
}

// defaultRoot resolves apps/web relative to this package's repo layout.
func defaultRoot() string {
	for _, candidate := range []string{"apps/web", "../../apps/web", "../../../apps/web"} {
		if _, err := os.Stat(filepath.Join(candidate, "index.html")); err == nil {
			return candidate
		}
	}
	return "apps/web"
}
