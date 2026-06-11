#!/usr/bin/env ruby
# SEIS HTML heading hierarchy auditor.
#
# Reads apps/web/index.html and validates:
#   1. Exactly one <h1> on the page
#   2. No heading level is skipped (h1 → h3 without an h2 in between)
#   3. Document landmarks are present: <main>, <nav>, <footer>
#
# Usage: ruby polyglot/ruby/html_heading_audit.rb
# Exit:  0 PASS, 1 FAIL

REPO_ROOT = File.expand_path('../..', __dir__)
HTML_FILE  = File.join(REPO_ROOT, 'apps', 'web', 'index.html')

def extract_headings(html)
  html.scan(/<h([1-6])[^>]*>/i).map { |m| m[0].to_i }
end

def check_headings(levels)
  findings = []
  h1_count = levels.count(1)
  findings << "found #{h1_count} <h1> elements, expected exactly 1" if h1_count != 1
  levels.each_cons(2) do |a, b|
    findings << "heading level skipped: h#{a} → h#{b}" if b > a + 1
  end
  findings
end

def check_landmarks(html)
  findings = []
  %w[main nav footer].each do |tag|
    findings << "missing landmark <#{tag}>" unless html.match?(/<#{tag}[\s>]/i)
  end
  findings
end

def audit(html)
  levels   = extract_headings(html)
  findings = check_headings(levels) + check_landmarks(html)
  { ok: findings.empty?, levels: levels, findings: findings }
end

unless File.exist?(HTML_FILE)
  puts "[FAIL] html-headings  index.html not found"
  exit 1
end

html = File.read(HTML_FILE, encoding: 'UTF-8')
r    = audit(html)

levels_str = r[:levels].map { |l| "h#{l}" }.join(' → ')
puts "       heading order: #{levels_str}"

if r[:ok]
  puts "[PASS] html-headings  #{r[:levels].length} heading(s), #{r[:levels].count(1)} h1, landmarks OK"
else
  puts "[FAIL] html-headings  #{r[:findings].length} finding(s):"
  r[:findings].each { |f| puts "       #{f}" }
  exit 1
end
