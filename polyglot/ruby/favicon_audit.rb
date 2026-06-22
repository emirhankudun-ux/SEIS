#!/usr/bin/env ruby
# frozen_string_literal: true
# SEIS favicon auditor — verifies that icon <link> href files exist on disk.
#
# Reads apps/web/index.html, extracts every <link> with rel="icon",
# rel="apple-touch-icon", or rel="shortcut icon", then checks that each
# referenced file actually exists under apps/web/.
#
# A missing icon file causes browser DevTools warnings and breaks PWA
# icon display even though the page itself loads correctly.
#
# Usage: ruby polyglot/ruby/favicon_audit.rb [--self-test]
# Exit:  0 PASS, 1 FAIL

HTML_FILE = "apps/web/index.html"
WEB_ROOT  = "apps/web"

ICON_RELS = %w[icon apple-touch-icon shortcut].freeze

def extract_icon_hrefs(html)
  hrefs = []
  html.scan(/<link\s[^>]+>/i) do |tag|
    rel_raw = tag.match(/\brel=["']([^"']+)["']/i)&.captures&.first.to_s
    href    = tag.match(/\bhref=["']([^"']+)["']/i)&.captures&.first
    next unless href
    next if href.start_with?("data:", "http:", "https:")
    rel_tokens = rel_raw.downcase.split
    next unless rel_tokens.any? { |r| ICON_RELS.include?(r) }
    hrefs << href
  end
  hrefs
end

def resolve_href(href, web_root)
  File.join(web_root, href.sub(/\A\.\//, ""))
end

# ─── self-tests ──────────────────────────────────────────────────────────────

def self_test
  pass_count = 0
  total      = 0

  check = lambda do |label, ok|
    total += 1
    if ok
      pass_count += 1
    else
      puts "  [FAIL] self-test: #{label}"
    end
  end

  check.("extracts svg icon href",
    extract_icon_hrefs('<link rel="icon" type="image/svg+xml" href="favicon.svg">') == ["favicon.svg"])

  check.("extracts apple-touch-icon href",
    extract_icon_hrefs('<link rel="apple-touch-icon" href="icons/icon-192.png">') == ["icons/icon-192.png"])

  check.("extracts shortcut icon href",
    extract_icon_hrefs('<link rel="shortcut icon" href="favicon.ico">') == ["favicon.ico"])

  check.("ignores stylesheet links",
    extract_icon_hrefs('<link rel="stylesheet" href="style.css">').empty?)

  check.("ignores data: URIs",
    extract_icon_hrefs('<link rel="icon" href="data:image/png;base64,abc">').empty?)

  check.("ignores https: URIs",
    extract_icon_hrefs('<link rel="icon" href="https://cdn.example.com/fav.ico">').empty?)

  check.("extracts multiple icon hrefs",
    extract_icon_hrefs(
      '<link rel="icon" href="favicon.svg"><link rel="apple-touch-icon" href="icon.png">'
    ).length == 2)

  check.("resolve strips ./",
    resolve_href("./favicon.svg", "apps/web") == "apps/web/favicon.svg")

  check.("resolve plain href",
    resolve_href("icons/icon-192.png", "apps/web") == "apps/web/icons/icon-192.png")

  if File.exist?(HTML_FILE)
    html    = File.read(HTML_FILE, encoding: "utf-8")
    hrefs   = extract_icon_hrefs(html)
    check.("at least 1 icon href found in real HTML", hrefs.length >= 1)
    missing = hrefs.reject { |h| File.exist?(resolve_href(h, WEB_ROOT)) }
    check.("all real icon files exist on disk", missing.empty?)
  end

  passed = (pass_count == total)
  printf "[%s] favicon-audit  %d/%d self-tests passed\n",
         passed ? "PASS" : "FAIL", pass_count, total
  passed
end

# ─── main ────────────────────────────────────────────────────────────────────

if ARGV.include?("--self-test")
  exit(self_test ? 0 : 1)
end

unless File.exist?(HTML_FILE)
  puts "[FAIL] favicon-audit  #{HTML_FILE} not found"
  exit 1
end

html  = File.read(HTML_FILE, encoding: "utf-8")
hrefs = extract_icon_hrefs(html)

if hrefs.empty?
  puts "[FAIL] favicon-audit  no icon <link> tags found in #{HTML_FILE}"
  exit 1
end

missing = hrefs.reject { |h| File.exist?(resolve_href(h, WEB_ROOT)) }

printf "       %s: %d icon href(s)\n", HTML_FILE, hrefs.length

if missing.empty?
  printf "[PASS] favicon-audit  all %d icon file(s) exist on disk\n", hrefs.length
else
  printf "[FAIL] favicon-audit  %d icon file(s) missing:\n", missing.length
  missing.each { |h| puts "       '#{h}' → #{resolve_href(h, WEB_ROOT)}" }
  exit 1
end
