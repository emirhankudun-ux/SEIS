#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const failures = [];
const policy = readJson("deploy/cloud-access-policy.json");
const sshAccessModel = readJson("deploy/seis-ssh-access-model.json");
const targets = readJson("deploy/server-targets.json");
const matrix = readJson("deploy/provider-matrix.json");
const cloud = readJson("deploy/cloud-environment.json");
const localExample = readJson("deploy/server-targets.local.example.json");
const docs = readText("docs/deployment/cloud-access-policy.md")
  + "\n"
  + readText("docs/deployment/seis-ssh-access-model.md")
  + "\n"
  + readText("docs/deployment/gcp-compute-cloud-server.md")
  + "\n"
  + readText("docs/deployment/ssh-wireguard-vps-cloud-server.md")
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
ensure(policy?.sshAccessModel?.visibleAlias === "SEIS-SSH", "SSH access model must expose SEIS-SSH");
ensure(policy?.sshAccessModel?.cloudOnly === true, "SSH access model must be cloud-only");
ensure(policy?.sshAccessModel?.individualUsers?.vpnRequired === false, "individual SSH users must not require VPN");
ensure(policy?.sshAccessModel?.companiesAndTeams?.vpnRequired === true, "company/team SSH must require VPN");
ensure(policy?.sshAccessModel?.developers?.mode === "closed-cloud-development-system", "developer SSH must use closed cloud development system");
ensure(sshAccessModel?.defaultVisibleAlias === "SEIS-SSH", "SSH access model source must default to SEIS-SSH");

const publicProviders = new Set(policy?.publicCloud?.providers || []);
for (const id of ["github-pages", "cloudflare-pages", "vercel-static", "netlify-static", "firebase-hosting"]) {
  ensure(publicProviders.has(id), `publicCloud providers must include ${id}`);
}

const teamProviders = new Set(policy?.teamVpnCloud?.providers || []);
for (const id of ["gcp-compute-vm", "ssh-wireguard-vps", "node-vps", "docker-node-static", "generic-sftp"]) {
  ensure(teamProviders.has(id), `teamVpnCloud providers must include ${id}`);
}

const gcpTarget = (targets?.candidates || []).find((target) => target.id === "gcp-compute-vm");
const gcpMatrix = (matrix?.providers || []).find((provider) => provider.id === "gcp-compute-vm");
const gcpCloud = (cloud?.providers || []).find((provider) => provider.id === "gcp-compute-vm");
const gcpExample = localExample?.["gcp-compute-vm"] || {};
const sshVpnTarget = (targets?.candidates || []).find((target) => target.id === "ssh-wireguard-vps");
const sshVpnMatrix = (matrix?.providers || []).find((provider) => provider.id === "ssh-wireguard-vps");
const sshVpnCloud = (cloud?.providers || []).find((provider) => provider.id === "ssh-wireguard-vps");
const sshVpnExample = localExample?.["ssh-wireguard-vps"] || {};
const githubPagesMatrix = (matrix?.providers || []).find((provider) => provider.id === "github-pages");
const githubPagesCloud = (cloud?.providers || []).find((provider) => provider.id === "github-pages");

ensure(packageJson?.scripts?.["cloud:public:readiness"] === "node scripts/check-public-cloud-readiness.mjs", "missing cloud:public:readiness script");
ensure(packageJson?.scripts?.["cloud:public:readiness:strict"] === "node scripts/check-public-cloud-readiness.mjs --require-ready", "missing cloud:public:readiness:strict script");
ensure(packageJson?.scripts?.["cloud:ssh-vpn:readiness"] === "node scripts/check-ssh-wireguard-cloud-readiness.mjs", "missing cloud:ssh-vpn:readiness script");
ensure(packageJson?.scripts?.["cloud:ssh-vpn:readiness:strict"] === "node scripts/check-ssh-wireguard-cloud-readiness.mjs --require-ready", "missing cloud:ssh-vpn:readiness:strict script");
ensure(packageJson?.scripts?.["check:seis-ssh-access-model"] === "node scripts/check-seis-ssh-access-model.mjs", "missing check:seis-ssh-access-model script");
ensure(packageJson?.scripts?.["cloud:self-hosted:kit"] === "node scripts/create-self-hosted-seis-cloud-kit.mjs", "missing cloud:self-hosted:kit script");
ensure(packageJson?.scripts?.["cloud:migration:audit"] === "node scripts/cloud-migration-audit.mjs", "missing cloud:migration:audit script");
ensure(packageJson?.scripts?.["cloud:migration:audit:json"] === "node scripts/cloud-migration-audit.mjs --json", "missing cloud:migration:audit:json script");
ensure(packageJson?.scripts?.["cloud:migration:audit:ci"] === "node scripts/cloud-migration-audit.mjs --strict --json --output cloud-migration-audit.ci.json", "missing cloud:migration:audit:ci script");
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
ensure(sshVpnTarget?.type === "team-vpn-cloud-existing-ssh-server", "ssh-wireguard-vps target type must be team-vpn-cloud-existing-ssh-server");
ensure(sshVpnMatrix?.audience === "workplaces-and-teams", "ssh-wireguard-vps matrix audience must be workplaces-and-teams");
ensure(sshVpnCloud?.audience === "workplaces-and-teams", "ssh-wireguard-vps cloud audience must be workplaces-and-teams");
ensure(sshVpnCloud?.kind === "team-vpn-cloud-existing-ssh-server", "ssh-wireguard-vps cloud kind must be team-vpn-cloud-existing-ssh-server");
ensure(sshVpnExample.vpn_admin_peer?.includes("CLIENT_PUBLIC_KEY"), "ssh-wireguard-vps local example must use placeholder peer key");

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
const sshVpnReadiness = readText("scripts/check-ssh-wireguard-cloud-readiness.mjs");
ensure(sshVpnReadiness.includes("mode: \"read-only\""), "SSH VPN readiness checker must declare read-only mode");
ensure(sshVpnReadiness.includes("workplaces-and-teams"), "SSH VPN readiness checker must preserve team/workplace audience");
const selfHostedKit = readText("scripts/create-self-hosted-seis-cloud-kit.mjs");
ensure(selfHostedKit.includes("mode: \"self-hosted-kit\""), "self-hosted cloud kit must declare its mode");
ensure(selfHostedKit.includes("workplaces-and-teams"), "self-hosted cloud kit must preserve team/workplace audience");

const publicReadiness = readText("scripts/check-public-cloud-readiness.mjs");
ensure(publicReadiness.includes("mode: \"read-only\""), "public readiness checker must declare read-only mode");
ensure(publicReadiness.includes("audience: \"everyone\""), "public readiness checker must preserve everyone audience");
ensure(publicReadiness.includes("vpnRequired: false"), "public readiness checker must keep VPN disabled for public cloud");
ensure(publicReadiness.includes("github-pages-disabled"), "public readiness checker must report disabled GitHub Pages");
ensure(publicReadiness.includes("github-pages-build-type-not-workflow"), "public readiness checker must block non-workflow Pages builds");

ensure(pagesWorkflow.includes("branches: [main]"), "Pages workflow must deploy from main");
ensure(pagesWorkflow.includes("workflow_dispatch:"), "Pages workflow must support manual reruns");
ensure(/contents:\s*["']?read["']?/.test(pagesWorkflow), "Pages workflow must keep contents read-only");
ensure(/pages:\s*["']?write["']?/.test(pagesWorkflow), "Pages workflow must grant Pages write permission");
ensure(/id-token:\s*["']?write["']?/.test(pagesWorkflow), "Pages workflow must grant OIDC id-token write permission");
ensure(pagesWorkflow.includes("if: github.ref == 'refs/heads/main'"), "Pages deploy job must be main-branch only");
ensure(/actions\/upload-pages-artifact@[a-f0-9]{40}/.test(pagesWorkflow), "Pages workflow must upload a pinned Pages artifact action");
ensure(/actions\/deploy-pages@[a-f0-9]{40}/.test(pagesWorkflow), "Pages workflow must deploy through a pinned GitHub Pages action");
ensure(/actions\/configure-pages@[a-f0-9]{40}/.test(pagesWorkflow), "Pages workflow must configure GitHub Pages through a pinned action");
ensure(pagesWorkflow.includes("npm run build:static"), "Pages workflow must build the static package");
ensure(pagesWorkflow.includes("npm run check:static-build"), "Pages workflow must validate the static package");
ensure(pagesWorkflow.includes("npm run check:seis-second-brain-browser-smoke"), "Pages workflow must run the Second Brain browser smoke before upload");
ensure(/CHROME_PATH:\s*["']?\/usr\/bin\/google-chrome["']?/.test(pagesWorkflow), "Pages workflow must use GitHub-hosted Chrome for browser smoke");
ensure(/SEIS_SECOND_BRAIN_SMOKE_WEB_ROOT:\s*["']?dist\/seis-static["']?/.test(pagesWorkflow), "Pages workflow must smoke the built Pages artifact");
ensure(pagesWorkflow.includes("dist/seis-static"), "Pages workflow must publish dist/seis-static");

const migrationAuditPath = "cloud-migration-audit.ci.json";
const migrationAudit = runMigrationAudit(migrationAuditPath);
printMigrationAuditSummary(migrationAudit);

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

function runMigrationAudit(outputPath) {
  const result = runCommand([
    "scripts/cloud-migration-audit.mjs", "--strict", "--json", "--output", outputPath
  ], "npm run cloud:migration:audit -- --strict --json --output");
  if (!result) return null;
  return result;
}

function runCommand(argv, commandLabel) {
  const result = spawnSync(process.execPath, argv, {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 30000
  });

  if (result.error) {
    failures.push(`${commandLabel}: ${result.error.message}`);
    return null;
  }

  let payload = null;
  try {
    payload = JSON.parse(result.stdout || "{}");
  } catch (err) {
    failures.push(`${commandLabel} returned invalid JSON: ${err?.message || String(err)}`);
  }

  if (result.status !== 0) {
    const detail = (String(result.stderr || "") || String(result.stdout || "")).trim();
    failures.push(`${commandLabel} failed with exit ${result.status}${detail ? `: ${detail}` : ""}`);
  }

  return payload;
}

function printMigrationAuditSummary(report) {
  if (!report) {
    console.log("Cloud migration audit summary: unavailable");
    return;
  }

  const findings = Array.isArray(report.findings) ? report.findings : [];
  const severityBuckets = { high: 0, medium: 0, low: 0 };

  for (const item of findings) {
    if (item?.severity && severityBuckets[item.severity] !== undefined) {
      severityBuckets[item.severity] += 1;
    }
  }

  console.log("Cloud migration audit summary:");
  console.log(`- migration needed: ${report.migrationNeeded ? "YES" : "NO"}`);
  console.log(`- findings: ${findings.length} (high=${severityBuckets.high}, medium=${severityBuckets.medium}, low=${severityBuckets.low})`);

  if (report.migrationNeeded) {
    console.log("- decision: BLOCKED by strict policy");
  } else {
    console.log("- decision: PASS");
  }
}
