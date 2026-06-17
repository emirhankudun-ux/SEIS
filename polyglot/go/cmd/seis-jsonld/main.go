// seis-jsonld — JSON-LD structured data validator for the SEIS portfolio.
//
// Extracts the first application/ld+json script block from index.html and
// validates it against the expected schema.org/Person + schema.org/WebSite
// shape used by the portfolio.
//
// Checks:
//
//	@context must be "https://schema.org"
//	@graph must contain a Person node with name, url, @id, jobTitle, email
//	@graph must contain a WebSite node with url, name, publisher
//	Every sameAs URL must start with https://
//
// Usage: go run ./cmd/seis-jsonld [path-to-index.html]
// Exit:  0 PASS, 1 FAIL, 2 file not found
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strings"
)

// LD is a loose map that can represent any JSON-LD node.
type LD = map[string]any

var ldScriptRE = regexp.MustCompile(
	`(?s)<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>`)

func extractLDJSON(html string) (string, bool) {
	m := ldScriptRE.FindStringSubmatch(html)
	if m == nil {
		return "", false
	}
	return strings.TrimSpace(m[1]), true
}

// ---------- field helpers ----------

func str(node LD, key string) string {
	v, _ := node[key].(string)
	return v
}

func nodeType(node LD) string { return str(node, "@type") }

// ---------- validation ----------

type finding struct{ msg string }

func validate(raw string) []finding {
	var doc LD
	if err := json.Unmarshal([]byte(raw), &doc); err != nil {
		return []finding{{fmt.Sprintf("invalid JSON: %v", err)}}
	}

	var ff []finding
	fail := func(msg string) { ff = append(ff, finding{msg}) }

	// @context
	if ctx, _ := doc["@context"].(string); ctx != "https://schema.org" {
		fail(fmt.Sprintf("@context is %q, want \"https://schema.org\"", ctx))
	}

	// @graph
	graphRaw, ok := doc["@graph"].([]any)
	if !ok || len(graphRaw) == 0 {
		fail("@graph missing or empty")
		return ff
	}

	var personNode, siteNode LD
	for _, item := range graphRaw {
		node, _ := item.(LD)
		switch nodeType(node) {
		case "Person":
			personNode = node
		case "WebSite":
			siteNode = node
		}
	}

	// Person checks
	if personNode == nil {
		fail("no schema:Person node in @graph")
	} else {
		for _, req := range []string{"name", "url", "@id", "jobTitle", "email"} {
			if str(personNode, req) == "" {
				fail(fmt.Sprintf("Person missing required field: %s", req))
			}
		}
		// sameAs: every entry must be https://
		if sameAs, ok := personNode["sameAs"].([]any); ok {
			for _, s := range sameAs {
				if url, _ := s.(string); !strings.HasPrefix(url, "https://") {
					fail(fmt.Sprintf("Person.sameAs entry not https: %q", url))
				}
			}
		}
	}

	// WebSite checks
	if siteNode == nil {
		fail("no schema:WebSite node in @graph")
	} else {
		for _, req := range []string{"url", "name"} {
			if str(siteNode, req) == "" {
				fail(fmt.Sprintf("WebSite missing required field: %s", req))
			}
		}
		if _, ok := siteNode["publisher"]; !ok {
			fail("WebSite missing publisher")
		}
	}

	return ff
}

// ---------- self-test ----------

func selfTest() bool {
	pass, total := 0, 0
	assert := func(label string, ok bool) {
		total++
		if ok {
			pass++
		} else {
			fmt.Printf("  [FAIL] self-test: %s\n", label)
		}
	}

	// Valid minimal document
	good := `{
		"@context":"https://schema.org",
		"@graph":[
			{"@type":"Person","name":"Test","url":"https://x.com","@id":"https://x.com/#p",
			 "jobTitle":"Dev","email":"t@x.com","sameAs":["https://github.com/t"]},
			{"@type":"WebSite","url":"https://x.com","name":"Test Site",
			 "publisher":{"@id":"https://x.com/#p"}}
		]}`
	assert("valid doc has 0 findings", len(validate(good)) == 0)

	// Wrong @context
	bad := strings.Replace(good, "https://schema.org", "http://schema.org", 1)
	assert("wrong context is caught", len(validate(bad)) > 0)

	// Missing Person name
	noName := strings.Replace(good, `"name":"Test"`, `"name":""`, 1)
	assert("missing Person.name is caught", len(validate(noName)) > 0)

	// Missing WebSite publisher
	noPub := regexp.MustCompile(`"publisher":\{[^}]+\}`).ReplaceAllString(good, "")
	assert("missing publisher is caught", len(validate(noPub)) > 0)

	// http:// sameAs
	httpSameAs := strings.Replace(good, "https://github.com/t", "http://github.com/t", 1)
	assert("http sameAs is caught", len(validate(httpSameAs)) > 0)

	// Invalid JSON
	assert("invalid JSON is caught", len(validate("not json")) > 0)

	if pass == total {
		fmt.Printf("[PASS] go-jsonld  %d/%d self-tests passed\n", total, total)
		return true
	}
	fmt.Printf("[FAIL] go-jsonld  %d/%d self-tests passed\n", pass, total)
	return false
}

// ---------- main ----------

func main() {
	args := os.Args[1:]

	if len(args) > 0 && args[0] == "--self-test" {
		if selfTest() {
			os.Exit(0)
		}
		os.Exit(1)
	}

	indexPath := "apps/web/index.html"
	if len(args) > 0 {
		indexPath = args[0]
	}

	html, err := os.ReadFile(indexPath)
	if err != nil {
		fmt.Printf("[FAIL] go-jsonld  cannot read %s: %v\n", indexPath, err)
		os.Exit(2)
	}

	raw, ok := extractLDJSON(string(html))
	if !ok {
		fmt.Println("[FAIL] go-jsonld  no application/ld+json block found in HTML")
		os.Exit(1)
	}

	findings := validate(raw)
	if len(findings) == 0 {
		fmt.Println("[PASS] go-jsonld  JSON-LD schema.org block is valid (Person + WebSite)")
		return
	}

	fmt.Printf("[FAIL] go-jsonld  %d finding(s):\n", len(findings))
	for _, f := range findings {
		fmt.Printf("       %s\n", f.msg)
	}
	os.Exit(1)
}
