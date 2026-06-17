#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];
const identityPath = "data/seis-operating-identities.json";
const docsPath = "docs/governance/seis-operating-identities.md";
const codexPath = "CODEX.md";
const packagePath = "package.json";

const identities = readJson(identityPath);
const docs = readText(docsPath);
const codex = readText(codexPath);
const packageJson = readJson(packagePath);

ensure(identities?.id === "seis-operating-identities", "identity manifest id must stay stable");
ensure(identities?.canonicalRepository === "emirhankudun-ux/SEIS", "identity manifest must point at SEIS");
ensure(identities?.workflow === "GitHub -> Codex Cloud -> Branch -> Commit -> Pull Request -> Review -> Merge", "identity manifest must preserve Codex Cloud workflow");
ensure(identities?.security?.sshKeyType === "Ed25519", "SSH identity policy must be Ed25519 only");
ensure(identities?.security?.privilegeModel === "least-privilege", "identity policy must require least privilege");
ensure(String(identities?.security?.secretsPolicy || "").includes("never expose"), "identity policy must forbid secret exposure");

const requiredNames = ["SEIS", "SEIS-Agent", "SEIS-Cloud", "SEIS-Code", "SEIS-Design", "SEIS-Data"];
for (const name of requiredNames) {
  const identity = (identities?.identities || []).find((item) => item.name === name);
  ensure(Boolean(identity), `identity manifest missing ${name}`);
  ensure(docs.includes(name), `identity docs must include ${name}`);
  ensure(codex.includes(name), `CODEX.md must include ${name}`);
}

const agent = (identities?.identities || []).find((item) => item.name === "SEIS-Agent");
ensure(agent?.repoSurface === "plugins/seis-ai-agent", "SEIS-Agent must map to plugins/seis-ai-agent");
ensure(agent?.installId === "seis-ai-agent@seis-repo", "SEIS-Agent install id must stay stable");

for (const [name, surface] of [
  ["SEIS-Agent", "plugins/seis-ai-agent/.codex-plugin/plugin.json"],
  ["SEIS-Cloud", "plugins/seis-cloud/.codex-plugin/plugin.json"],
  ["SEIS-Code", "plugins/seis-code/.codex-plugin/plugin.json"],
  ["SEIS-Design", "plugins/seis-design/.codex-plugin/plugin.json"],
  ["SEIS-Data", "plugins/seis-data/.codex-plugin/plugin.json"]
]) {
  ensure(existsSync(surface), `${name} plugin surface missing: ${surface}`);
}

for (const required of [
  "GitHub -> Codex Cloud -> Branch -> Commit -> Pull Request -> Review -> Merge",
  "Ed25519",
  "least privilege",
  "Never expose credentials",
  "npm run quality"
]) {
  ensure(codex.includes(required), `CODEX.md must include ${required}`);
}

for (const required of [
  "creative engineering ecosystem",
  "SSH/WireGuard VPN cloud",
  "Memory and context systems",
  "public launch"
]) {
  ensure(docs.includes(required), `identity docs must include ${required}`);
}

ensure(packageJson?.scripts?.["check:seis-operating-identities"] === "node scripts/check-seis-operating-identities.mjs", "package.json must expose check:seis-operating-identities");

if (failures.length > 0) {
  console.error("SEIS operating identities check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS operating identities check passed.");

function readJson(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return null;
  }
  return JSON.parse(readFileSync(file, "utf8"));
}

function readText(file) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}
