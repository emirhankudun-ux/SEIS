#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const marketplacePath = ".agents/plugins/marketplace.json";
const forbiddenTerm = /\bpersonal\b/i;
const failures = [];
const marketplace = readJson(marketplacePath);
const entries = Array.isArray(marketplace?.plugins) ? marketplace.plugins : [];

ensure(marketplace?.name === "seis-repo", "public marketplace must be named seis-repo");
ensure(marketplace?.interface?.displayName === "SEIS Repo", "public marketplace must display as SEIS Repo");
ensure(entries.length > 0, "public marketplace must contain plugin cards");

for (const entry of entries) {
  const name = String(entry?.name || "");
  ensure(name.length > 0, "marketplace card is missing a name");
  ensure(!forbiddenTerm.test(name), `${name || "unknown"}: marketplace name must not expose Personal terminology`);
  ensure(entry?.source?.source === "local", `${name}: marketplace source must be local repository metadata`);
  ensure(typeof entry?.source?.path === "string" && entry.source.path.startsWith("./plugins/") && !entry.source.path.includes(".."), `${name}: marketplace path must stay within the public plugin root`);

  if (!entry?.source?.path) continue;
  const manifestPath = path.join(root, entry.source.path.replace(/^\.\//, ""), ".codex-plugin", "plugin.json");
  ensure(fs.existsSync(manifestPath), `${name}: public card manifest is missing`);
  if (!fs.existsSync(manifestPath)) continue;

  const manifest = readJson(path.relative(root, manifestPath));
  ensure(manifest?.name === name, `${name}: manifest name must match the marketplace card`);
  for (const [label, value] of Object.entries({
    name: manifest?.name,
    description: manifest?.description,
    displayName: manifest?.interface?.displayName,
    shortDescription: manifest?.interface?.shortDescription,
    longDescription: manifest?.interface?.longDescription,
  })) {
    ensure(!forbiddenTerm.test(String(value || "")), `${name}: visible ${label} must not expose Personal terminology`);
  }
}

const report = {
  ok: failures.length === 0,
  id: "seis-public-marketplace-terminology",
  marketplaceName: marketplace?.name || null,
  marketplaceDisplayName: marketplace?.interface?.displayName || null,
  checkedCardCount: entries.length,
  forbiddenVisibleTerm: "personal",
  failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}
