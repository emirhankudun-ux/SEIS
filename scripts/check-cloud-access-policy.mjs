#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];
const policy = readJson("deploy/cloud-access-policy.json");
const targets = readJson("deploy/server-targets.json");
const matrix = readJson("deploy/provider-matrix.json");
const cloud = readJson("deploy/cloud-environment.json");
const localExample = readJson("deploy/server-targets.local.example.json");
const docs = readText("docs/deployment/cloud-access-policy.md")
  + "\n"
  + readText("docs/deployment/gcp-compute-cloud-server.md")
  + "\n"
  + readText("docs/deployment/server-target-selection.md");
const cloudProfile = readJson("plugins/seis-cloud/assets/lane-profile.json");
const cloudSkill = readText("plugins/seis-cloud/skills/seis-cloud/SKILL.md");
const centralCloudSkill = readText("plugins/seis/skills/seis-cloud/SKILL.md");
const cloudMcp = readText("plugins/seis-cloud/scripts/seis-cloud-mcp-server.mjs");
const centralMcp = readText("mcp/seis-mcp-server.mjs");
const packageJson = readJson("package.json");
const pagesWorkflow = readText(".github/workflows/pages.yml");

ensure(policy?.publicCloud?.audience === "everyone", "publicCloud audience must be everyone");
ensure(policy?.publicCloud?.vpnRequired === false, "publicCloud must not require VPN");
ensure(policy?.teamVpnCloud?.audience === "workplaces-and-teams", "teamVpnCloud audience must be workplaces-and-teams");
ensure(policy?.teamVpnCloud?.vpnRequired === true, "teamVpnCloud must require VPN");

const publicProviders = new Set(policy?.publicCloud?.providers || []);
for (const id of ["github-pages", "cloudflare-pages", "vercel-static", "netlify-static", "firebase-hosting"]) {
  ensure(publicProviders.has(id), `publicCloud providers must include ${id}`);
}

const teamProviders = new Set(policy?.teamVpnCloud?.providers || []);
for (const id of ["gcp-compute-vm", "node-vps", "docker-node-static", "generic-sftp"]) {
  ensure(teamProviders.has(id), `teamVpnCloud providers must include ${id}`);
}

const gcpTarget = (targets?.candidates || []).find((target) => target.id === "gcp-compute-vm");
const gcpMatrix = (matrix?.providers || []).find((provider) => provider.id === "gcp-compute-vm");
const gcpCloud = (cloud?.providers || []).find((provider) => provider.id === "gcp-compute-vm");
const gcpExample = localExample?.["gcp-compute-vm"] || {};
const githubPagesMatrix = (matrix?.providers || []).find((provider) => provider.id === "github-pages");
const githubPagesCloud = (cloud?.providers || []).find((provider) => provider.id === "github-pages");

ensure(packageJson?.scripts?.["cloud:public:readiness"] === "node scripts/check-public-cloud-readiness.mjs", "missing cloud:public:readiness script");
ensure(packageJson?.scripts?.["cloud:public:readiness:strict"] === "node scripts/check-public-cloud-readiness.mjs --require-ready", "missing cloud:public:readiness:strict script");
ensure(packageJson?.scripts?.["check:static-build"] === "node scripts/check-static-build.mjs", "missing check:static-build script");
ensure(githubPagesMatrix?.audience === "everyone", "github-pages matrix audience must be everyone");
ensure(githubPagesCloud?.audience === "everyone", "github-pages cloud audience must be everyone");
ensure(githubPagesMatrix?.readinessCommand === "npm run cloud:public:readiness -- --repo OWNER/REPO", "github-pages matrix must expose public readiness command");
ensure(githubPagesCloud?.readinessCommand === "npm run cloud:public:readiness -- --repo OWNER/REPO", "github-pages cloud must expose public readiness command");
ensure((githubPagesMatrix?.requiredFiles || []).includes("scripts/check-public-cloud-readiness.mjs"), "github-pages provider must require the public readiness checker");
ensure(gcpTarget?.type === "team-vpn-cloud-compute-server", "gcp-compute-vm target type must be team-vpn-cloud-compute-server");
ensure(gcpMatrix?.audience === "workplaces-and-teams", "gcp-compute-vm matrix audience must be workplaces-and-teams");
ensure(gcpCloud?.audience === "workplaces-and-teams", "gcp-compute-vm cloud audience must be workplaces-and-teams");
ensure(gcpCloud?.kind === "team-vpn-cloud-compute-server", "gcp-compute-vm cloud kind must be team-vpn-cloud-compute-server");
ensure(gcpExample.vpn_source_range !== "0.0.0.0/0", "local example must not use 0.0.0.0/0 for VPN source range");

ensure(docs.includes("Public cloud is for everyone"), "docs must state public cloud is for everyone");
ensure(docs.includes("VPN cloud is for workplaces and teams"), "docs must state VPN cloud is for workplaces and teams");
ensure(!docs.includes("Use `0.0.0.0/0` for WireGuard"), "docs must not recommend broad WireGuard source ranges");

ensure(cloudProfile?.accessPolicy?.publicCloud?.audience === "everyone", "SEIS Cloud profile must expose public cloud audience");
ensure(cloudProfile?.accessPolicy?.teamVpnCloud?.audience === "workplaces-and-teams", "SEIS Cloud profile must expose team VPN audience");
ensure((cloudProfile?.qualityCommands || []).includes("npm run check:cloud-access-policy"), "SEIS Cloud profile must include access policy check");
for (const [label, content] of [
  ["SEIS Cloud skill", cloudSkill],
  ["central SEIS Cloud skill", centralCloudSkill],
  ["SEIS Cloud MCP", cloudMcp],
  ["central SEIS MCP", centralMcp]
]) {
  ensure(content.includes("public cloud"), `${label} must mention public cloud`);
  ensure(content.includes("team/workplace VPN cloud") || content.includes("workplaces-and-teams"), `${label} must mention team/workplace VPN cloud`);
}

const provisioner = readText("scripts/provision-gcp-cloud-server.mjs");
ensure(provisioner.includes("workplaces-and-teams"), "provisioner must encode VPN audience");
ensure(provisioner.includes("hasBroadCidr"), "provisioner must reject broad VPN source ranges");

const publicReadiness = readText("scripts/check-public-cloud-readiness.mjs");
ensure(publicReadiness.includes("mode: \"read-only\""), "public readiness checker must declare read-only mode");
ensure(publicReadiness.includes("audience: \"everyone\""), "public readiness checker must preserve everyone audience");
ensure(publicReadiness.includes("vpnRequired: false"), "public readiness checker must keep VPN disabled for public cloud");
ensure(publicReadiness.includes("github-pages-disabled"), "public readiness checker must report disabled GitHub Pages");

ensure(pagesWorkflow.includes("branches: [main]"), "Pages workflow must deploy from main");
ensure(/actions\/upload-pages-artifact@[a-f0-9]{40}/.test(pagesWorkflow), "Pages workflow must upload a pinned Pages artifact action");
ensure(/actions\/deploy-pages@[a-f0-9]{40}/.test(pagesWorkflow), "Pages workflow must deploy through a pinned GitHub Pages action");
ensure(pagesWorkflow.includes("npm run build:static"), "Pages workflow must build the static package");
ensure(pagesWorkflow.includes("npm run check:static-build"), "Pages workflow must validate the static package");
ensure(pagesWorkflow.includes("dist/seis-static"), "Pages workflow must publish dist/seis-static");

if (failures.length > 0) {
  console.error("SEIS cloud access policy check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS cloud access policy check passed.");

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
