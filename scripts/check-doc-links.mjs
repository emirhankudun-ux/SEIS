#!/usr/bin/env node
// Checks that relative Markdown links in the governance document set resolve to
// real files — protecting documentation integrity (V14 §17). Scope is the
// governance/decision/platform docs and root governance files; it intentionally
// does not sweep unrelated legacy docs, so it stays a precise, trustworthy gate.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve, join } from "node:path";

const roots = [
  "README.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "CHANGELOG.md",
  "AGENTS.md",
  "ARCHITECTURE.md",
  "ROADMAP.md",
  "docs/governance",
  "docs/decisions",
  "docs/design",
  "docs/platform/hybrid-ai-routing-policy.md",
  "docs/platform/seis-native-ai-model.md",
];

function collect(target, out) {
  if (!existsSync(target)) return;
  if (statSync(target).isDirectory()) {
    for (const entry of readdirSync(target)) collect(join(target, entry), out);
  } else if (target.endsWith(".md") || target.endsWith(".mdx")) {
    out.push(target);
  }
}

const files = [];
for (const root of roots) collect(root, files);

const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
const failures = [];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  let match;
  while ((match = linkPattern.exec(text)) !== null) {
    let href = match[1].trim();
    // Take the URL portion only, dropping any "title" after whitespace.
    href = href.split(/\s+/)[0];
    // Skip external, anchor-only, mail, and protocol-relative links.
    if (
      !href ||
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("<")
    ) {
      continue;
    }
    const path = href.split("#")[0]; // strip anchor on file links
    if (!path) continue;
    const resolved = resolve(dirname(file), path);
    if (!existsSync(resolved)) {
      failures.push(`${file}: broken link -> ${href}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Doc link check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`Doc link check passed (${files.length} files scanned, all relative links resolve).`);
