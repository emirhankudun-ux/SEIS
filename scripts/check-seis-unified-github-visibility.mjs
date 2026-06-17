#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const failures = [];
const warnings = [];

const policyPath = "data/seis-unified-github-visibility-policy.json";
const childAgentIntakePath = "data/seis-child-agent-intake.json";
const docsPath = "docs/governance/seis-unified-github-visibility.md";
const memoriesAgentPath = "docs/development/agents/memories-agent.md";
const dataReadmePath = "data/README.md";
const contributorsPath = "CONTRIBUTORS.md";
const packagePath = "package.json";

const policy = readJson(policyPath);
const childAgentIntake = readJson(childAgentIntakePath);
const docs = readText(docsPath);
const memoriesAgent = readText(memoriesAgentPath);
const dataReadme = readText(dataReadmePath);
const contributors = readText(contributorsPath);
const packageJson = readJson(packagePath);

ensure(policy?.id === "seis-unified-github-visibility-policy", "policy id must stay stable");
ensure(policy?.canonical?.visibleRepository === "emirhankudun-ux/SEIS", "canonical visible repo must be emirhankudun-ux/SEIS");
ensure(policy?.canonical?.defaultBranch === "main", "canonical branch must be main");
ensure(policy?.canonical?.publicFacingMode === "single-visible-seis-repository", "policy must enforce single visible SEIS repository mode");
ensure(policy?.cloudModel?.publicCloud?.audience === "everyone", "public cloud must remain for everyone");
ensure(policy?.cloudModel?.publicCloud?.vpnRequired === false, "public cloud must not require VPN");
ensure(policy?.cloudModel?.teamVpnCloud?.audience === "workplaces-and-teams", "VPN cloud must be workplace/team scoped");
ensure(policy?.cloudModel?.teamVpnCloud?.sshRequired === true, "team VPN cloud must require SSH capability");
ensure(policy?.githubWorkspace?.publicVisibilityRule?.includes("Only SEIS"), "workspace policy must make only SEIS public-facing");
ensure((policy?.githubWorkspace?.knownSourceRepoCandidates || []).includes("UIX-Apps"), "policy must track UIX-Apps as a source candidate");
ensure((policy?.githubWorkspace?.knownSourceRepoCandidates || []).includes("memories"), "policy must track memories as a live public source candidate");
ensure((policy?.childAgentModel?.requiredEvidence || []).some((item) => item.includes("child-agent manifest")), "child-agent evidence must be required");
ensure((policy?.childAgentModel?.forbiddenWithoutConfirmation || []).includes("delete-source-repository"), "repository deletion must be gated");
ensure(policy?.applyGate?.childAgentIntake === childAgentIntakePath, "policy must route source visibility work through child-agent intake");
ensure((policy?.applyGate?.requiredBeforeApply || []).includes("gh repo list succeeds for the owner"), "live GitHub list must be required before apply");
ensure(packageJson?.scripts?.["check:seis-unified-github-visibility"] === "node scripts/check-seis-unified-github-visibility.mjs", "package.json must expose check:seis-unified-github-visibility");

ensure(childAgentIntake?.id === "seis-child-agent-intake", "child-agent intake id must stay stable");
ensure(childAgentIntake?.canonicalRepository === "emirhankudun-ux/SEIS", "child-agent intake must point at SEIS");
ensure(childAgentIntake?.mode === "plan-first-no-live-mutation", "child-agent intake must remain plan-first");
const memoriesIntake = (childAgentIntake?.sources || []).find((source) => source.repository === "emirhankudun-ux/memories");
ensure(memoriesIntake?.targetState === "seis-child-agent-or-hidden-source", "memories must be tracked as a child-agent or hidden-source candidate");
ensure(memoriesIntake?.childAgentManifest === memoriesAgentPath, "memories intake must point to its child-agent manifest");
ensure((memoriesIntake?.forbiddenWithoutConfirmation || []).includes("delete-source-repository"), "memories deletion must require confirmation");
ensure((childAgentIntake?.liveReadOnlyEvidence?.publicNonSeisRepos || []).some((repo) => repo.repository === "emirhankudun-ux/memories"), "child-agent intake must record live public memories evidence");

const partners = policy?.toolingAttribution?.partners || [];
ensure(partners.some((partner) => partner.company === "OpenAI" && (partner.tools || []).includes("Codex")), "policy must attribute OpenAI Codex");
ensure(partners.some((partner) => partner.company === "Anthropic" && (partner.tools || []).includes("Claude")), "policy must attribute Anthropic Claude");
ensure(JSON.stringify(partners).includes("do not imply OpenAI sponsorship"), "OpenAI attribution must avoid sponsorship claims");
ensure(JSON.stringify(partners).includes("do not imply Anthropic sponsorship"), "Anthropic attribution must avoid sponsorship claims");
ensure(policy?.toolingAttribution?.participantSurface === "CONTRIBUTORS.md", "tooling participants must surface in CONTRIBUTORS.md");

for (const required of [
  "Only SEIS should be public-facing",
  "No repository deletion",
  "explicit confirmation",
  "OpenAI Codex",
  "ChatGPT",
  "Claude",
  "OpenAI",
  "Anthropic",
  "not imply sponsorship"
]) {
  ensure(docs.includes(required), `docs must include ${required}`);
}
ensure(docs.includes("emirhankudun-ux/memories"), "docs must track the live memories visibility blocker");
ensure(dataReadme.includes(childAgentIntakePath), "data README must list child-agent intake");
ensure(memoriesAgent.includes("emirhankudun-ux/memories"), "memories child-agent manifest must name the source repo");
ensure(memoriesAgent.includes("Rollback owner"), "memories child-agent manifest must name a rollback owner");
ensure(memoriesAgent.includes("No GitHub visibility mutation"), "memories child-agent manifest must forbid direct visibility mutation");

for (const required of [
  "AI Tooling Participants",
  "OpenAI",
  "Anthropic",
  "Codex",
  "ChatGPT",
  "Claude",
  "do not imply sponsorship"
]) {
  ensure(contributors.includes(required), `CONTRIBUTORS.md must include ${required}`);
}

let live = null;
if (args.live || args["require-single-visible"]) {
  live = readLiveRepos(policy.canonical.visibleRepository);
}

const result = {
  ok: failures.length === 0 && (!live || live.ok),
  mode: "read-only",
  policy: policyPath,
  childAgentIntake: childAgentIntakePath,
  canonicalVisibleRepository: policy?.canonical?.visibleRepository || null,
  live,
  failures,
  warnings,
  nextActions: buildNextActions(live)
};

if (args.json || live) {
  console.log(JSON.stringify(result, null, 2));
}

if (failures.length > 0) {
  console.error("SEIS unified GitHub visibility check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (!args.json && !live) {
  console.log("SEIS unified GitHub visibility check passed.");
}

function readLiveRepos(canonicalRepo) {
  const owner = canonicalRepo.split("/")[0];
  const canonicalName = canonicalRepo.split("/")[1];
  const gh = spawnSync("gh", [
    "repo",
    "list",
    owner,
    "--limit",
    "200",
    "--json",
    "name,visibility,isArchived,url,isPrivate"
  ], {
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0"
    }
  });

  if (gh.status !== 0) {
    warnings.push("live GitHub visibility check unavailable");
    return {
      checked: true,
      ok: false,
      status: "unavailable",
      stderr: gh.stderr.trim()
    };
  }

  let repos = [];
  try {
    repos = JSON.parse(gh.stdout);
  } catch (error) {
    failures.push(`gh repo list returned invalid JSON: ${error.message}`);
  }

  const publicNonSeis = repos.filter((repo) =>
    repo.name !== canonicalName && repo.visibility === "PUBLIC" && repo.isArchived !== true
  );
  const registeredSourceNames = new Set((childAgentIntake?.sources || []).map((source) => source.repositoryName));
  const unregisteredPublicNonSeis = publicNonSeis.filter((repo) => !registeredSourceNames.has(repo.name));

  if (args["require-single-visible"] && publicNonSeis.length > 0) {
    failures.push(`public non-SEIS repositories still visible: ${publicNonSeis.map((repo) => repo.name).join(", ")}`);
  }

  return {
    checked: true,
    ok: publicNonSeis.length === 0,
    status: publicNonSeis.length === 0 ? "single-visible" : "non-seis-public-repos-visible",
    repoCount: repos.length,
    unregisteredPublicNonSeis: unregisteredPublicNonSeis.map((repo) => repo.name),
    publicNonSeis: publicNonSeis.map((repo) => ({
      name: repo.name,
      url: repo.url,
      visibility: repo.visibility,
      isArchived: repo.isArchived,
      isPrivate: repo.isPrivate
    }))
  };
}

function buildNextActions(live) {
  if (!live) {
    return [
      "Run with --live after GitHub CLI auth is responsive to plan repository visibility changes."
    ];
  }
  if (live.status === "unavailable") {
    return [
      "Restore GitHub CLI auth/network access, then rerun the live read-only visibility plan."
    ];
  }
  if (live.publicNonSeis?.length > 0) {
    return [
      "Import or snapshot each public non-SEIS repository into SEIS.",
      "Create a child-agent manifest for each retained source.",
      "Choose archive, private, transfer, or keep with explicit maintainer confirmation."
    ];
  }
  return [
    "Keep SEIS as the only public-facing repository and continue child-agent intake."
  ];
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readJson(file) {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}

function readText(file) {
  if (!existsSync(file)) return "";
  return readFileSync(file, "utf8");
}

function parseArgs(tokens) {
  const parsed = {};
  for (const token of tokens) {
    if (token === "--live") parsed.live = true;
    if (token === "--json") parsed.json = true;
    if (token === "--require-single-visible") parsed["require-single-visible"] = true;
  }
  return parsed;
}
