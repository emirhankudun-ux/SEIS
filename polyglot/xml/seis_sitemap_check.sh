#!/usr/bin/env bash
# SEIS sitemap validator — xmllint-based XML well-formedness and structure checks.
#
# Validates apps/web/sitemap.xml:
#   • Well-formed XML (xmllint --noout)
#   • Encoding declaration present
#   • Correct sitemap namespace
#   • At least one <url> entry
#   • Correct number of hreflang alternate links (expects 6: tr en fr it de x-default)
#   • Every <loc> starts with https://
#
# Self-test: validates a known-good in-memory XML to prove the checks work.
#
# Usage: bash polyglot/xml/seis_sitemap_check.sh [--self-test]
# Exit:  0 PASS, 1 FAIL

set -u

SITEMAP="${REPO_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}/apps/web/sitemap.xml"
FINDINGS=()

fail() { FINDINGS+=("$1"); }

check_sitemap() {
  local file="$1"
  local expected_hreflang="${2:-6}"

  # 1. Well-formed XML
  if ! xmllint --noout "$file" 2>/dev/null; then
    fail "not well-formed XML"
    return
  fi

  # 2. UTF-8 encoding declaration
  if ! grep -q 'encoding="UTF-8"' "$file"; then
    fail "missing encoding=\"UTF-8\" declaration"
  fi

  # 3. Sitemap namespace (namespace-uri is reliable; @xmlns may not bind in XPath 1.0)
  local ns
  ns=$(xmllint --xpath 'namespace-uri(/*[1])' "$file" 2>/dev/null)
  if [ "$ns" != "http://www.sitemaps.org/schemas/sitemap/0.9" ]; then
    fail "incorrect or missing sitemap namespace: '$ns'"
  fi

  # 4. At least one <url>
  local url_count
  url_count=$(xmllint --xpath 'count(//*[local-name()="url"])' "$file" 2>/dev/null)
  if [ "${url_count:-0}" -lt 1 ]; then
    fail "no <url> entries found"
  fi

  # 5. hreflang count matches expectation
  local link_count
  link_count=$(xmllint --xpath 'count(//*[local-name()="link"])' "$file" 2>/dev/null)
  if [ "${link_count:-0}" -ne "$expected_hreflang" ]; then
    fail "expected $expected_hreflang hreflang <link> elements, found ${link_count:-0}"
  fi

  # 6. Every <loc> uses https://
  local http_count
  http_count=$(xmllint --xpath 'count(//*[local-name()="loc"][not(starts-with(text(),"https://"))])' "$file" 2>/dev/null)
  if [ "${http_count:-0}" -gt 0 ]; then
    fail "${http_count} <loc> value(s) do not start with https://"
  fi
}

self_test() {
  local pass=0
  local total=0

  assert() {
    total=$((total + 1))
    local label="$1" result="$2" expected="$3"
    if [ "$result" = "$expected" ]; then
      pass=$((pass + 1))
    else
      echo "  [FAIL] self-test: $label (got '$result', want '$expected')"
    fi
  }

  # Good sitemap — all checks pass
  local good
  good=$(mktemp /tmp/seis_sm_XXXXXX.xml)
  cat > "$good" <<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://example.com/</loc>
    <xhtml:link rel="alternate" hreflang="tr"        href="https://example.com/"/>
    <xhtml:link rel="alternate" hreflang="en"        href="https://example.com/en/"/>
    <xhtml:link rel="alternate" hreflang="fr"        href="https://example.com/fr/"/>
    <xhtml:link rel="alternate" hreflang="it"        href="https://example.com/it/"/>
    <xhtml:link rel="alternate" hreflang="de"        href="https://example.com/de/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/"/>
  </url>
</urlset>
XML
  FINDINGS=()
  check_sitemap "$good" 6
  assert "good sitemap has 0 findings" "${#FINDINGS[@]}" "0"

  # Wrong namespace
  local bad_ns
  bad_ns=$(mktemp /tmp/seis_sm_XXXXXX.xml)
  cat > "$bad_ns" <<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://wrong.ns/">
  <url><loc>https://example.com/</loc></url>
</urlset>
XML
  FINDINGS=()
  check_sitemap "$bad_ns" 6
  assert "wrong namespace is caught" "${#FINDINGS[@]}" "2"  # namespace + hreflang count

  # http:// loc (not https)
  local bad_loc
  bad_loc=$(mktemp /tmp/seis_sm_XXXXXX.xml)
  cat > "$bad_loc" <<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>http://example.com/</loc></url>
</urlset>
XML
  FINDINGS=()
  check_sitemap "$bad_loc" 0
  assert "http:// loc is caught" "${#FINDINGS[@]}" "1"

  # Hreflang count mismatch
  FINDINGS=()
  check_sitemap "$good" 5
  assert "hreflang mismatch is caught" "${#FINDINGS[@]}" "1"

  rm -f "$good" "$bad_ns" "$bad_loc"

  if [ "$pass" -eq "$total" ]; then
    echo "[PASS] xml-sitemap  $total/$total self-tests passed"
    return 0
  fi
  echo "[FAIL] xml-sitemap  $pass/$total self-tests passed"
  return 1
}

main() {
  if [ "${1:-}" = "--self-test" ]; then
    self_test
    return
  fi

  FINDINGS=()
  check_sitemap "$SITEMAP" 6

  if [ "${#FINDINGS[@]}" -eq 0 ]; then
    echo "[PASS] xml-sitemap  sitemap.xml is well-formed, correct namespace, 6 hreflang entries, all https"
    return 0
  fi

  echo "[FAIL] xml-sitemap  ${#FINDINGS[@]} finding(s):"
  for f in "${FINDINGS[@]}"; do
    echo "       $f"
  done
  return 1
}

main "$@"
