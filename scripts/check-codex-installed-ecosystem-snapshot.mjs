#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const snapshotPath = path.join(root, "content", "development", "codex-installed-ecosystem-snapshot.json");
const docsPath = path.join(root, "docs", "platform", "codex-installed-ecosystem-snapshot.md");
const desktopPath = path.join(root, "apps", "web", "desktop.js");
const linuxReplicaPath = path.join(root, "apps", "web", "seis-linux-replica.html");
const packagePath = path.join(root, "package.json");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readText(file, label) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing ${label}: ${path.relative(root, file)}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function readJson(file, label) {
  const text = readText(file, label);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`Invalid JSON in ${label}: ${error.message}`);
    return null;
  }
}

const snapshot = readJson(snapshotPath, "Codex installed ecosystem snapshot");
const docs = readText(docsPath, "snapshot docs");
const desktop = readText(desktopPath, "desktop surface");
const linuxReplica = readText(linuxReplicaPath, "Linux Replica surface");
const packageJson = readJson(packagePath, "package.json");

if (snapshot) {
  ensure(snapshot.id === "codex-installed-ecosystem-snapshot", "snapshot id must be codex-installed-ecosystem-snapshot");
  ensure(snapshot.status === "review-only-session-inventory", "snapshot must stay review-only");
  ensure(snapshot.counts?.extensions === 177, "snapshot must record 177 visible extensions");
  ensure(snapshot.counts?.apps === 56, "snapshot must record 56 visible apps");
  ensure(snapshot.counts?.mcpServers === 3, "snapshot must record 3 visible MCP servers");
  ensure(snapshot.counts?.skills === 72, "snapshot must record 72 visible skills");
  ensure(Array.isArray(snapshot.mcpServers) && snapshot.mcpServers.length === 3, "snapshot must include exactly 3 visible MCP server records");
  ensure(Array.isArray(snapshot.capabilityFamilies) && snapshot.capabilityFamilies.length >= 8, "snapshot must include capability families");
  ensure(Array.isArray(snapshot.visiblePluginSamples) && snapshot.visiblePluginSamples.length >= 60, "snapshot must include visible plugin samples");
  ensure(Array.isArray(snapshot.visibleSkillSamples) && snapshot.visibleSkillSamples.length >= 40, "snapshot must include visible skill samples");
  ensure(snapshot.activationPolicy?.authenticationClaim === "not-claimed", "snapshot must not claim authentication");
  ensure(snapshot.activationPolicy?.blanketActivation === "forbidden", "snapshot must forbid blanket activation");
  ensure(snapshot.activationPolicy?.externalMutationRequiresApproval === true, "snapshot must require approval for external mutation");
  ensure(Array.isArray(snapshot.notClaims) && snapshot.notClaims.length >= 6, "snapshot must include explicit non-claims");

  for (const [key, relativePath] of Object.entries(snapshot.repoBindings || {})) {
    if (key === "packageScript") continue;
    ensure(!String(relativePath).startsWith("/"), `${key} binding must be repository-relative`);
    ensure(fs.existsSync(path.join(root, relativePath)), `${key} binding path must exist: ${relativePath}`);
  }
}

for (const [text, label] of [
  [docs, "docs"],
  [desktop, "desktop"],
  [linuxReplica, "Linux Replica"]
]) {
  ensure(text.includes("codex-installed-ecosystem-snapshot"), `${label} must reference codex-installed-ecosystem-snapshot`);
  ensure(text.includes("177"), `${label} must expose the 177-extension inventory count`);
  ensure(text.includes("72"), `${label} must expose the 72-skill inventory count`);
}

ensure(
  packageJson?.scripts?.["check:codex-installed-ecosystem-snapshot"] ===
    "node scripts/check-codex-installed-ecosystem-snapshot.mjs",
  "package.json must expose check:codex-installed-ecosystem-snapshot"
);

if (failures.length) {
  console.error("Codex installed ecosystem snapshot check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Codex installed ecosystem snapshot check passed.");
