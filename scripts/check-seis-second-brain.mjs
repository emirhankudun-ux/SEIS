#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const contractPath = "content/development/seis-second-brain-system.json";
const docsPath = "docs/product/seis-second-brain.md";
const desktopJsPath = "apps/web/desktop.js";
const desktopCssPath = "apps/web/desktop.css";
const packagePath = "package.json";
const trainingCurriculumPath = "content/development/seis-language-model-training-curriculum.json";
const trainingCurriculumReportPath = "reports/seis-model-scaling/seis-language-model-training-curriculum.md";

for (const [filePath, label] of [
  [contractPath, "Second Brain contract"],
  [docsPath, "Second Brain product docs"],
  [desktopJsPath, "Desktop runtime"],
  [desktopCssPath, "Desktop styles"],
  [packagePath, "package.json"],
  [trainingCurriculumPath, "language model training curriculum"],
  [trainingCurriculumReportPath, "language model training curriculum report"]
]) {
  ensureFile(filePath, label);
}

const contract = readJson(contractPath, "Second Brain contract");
const docs = readText(docsPath, "Second Brain product docs");
const desktopJs = readText(desktopJsPath, "Desktop runtime");
const desktopCss = readText(desktopCssPath, "Desktop styles");
const packageJson = readJson(packagePath, "package.json");

if (contract) {
  ensure(contract.id === "seis-second-brain-system", "contract id must be seis-second-brain-system");
  ensure(contract.status === "local-demo", "contract status must be local-demo");
  ensure(contract.qualityGate === "npm run check:seis-second-brain", "contract must declare the npm quality gate");
  ensure(contract.desktopAppId === "second-brain", "contract must bind desktop app id second-brain");
  ensure(contract.routeId === "seis-second-brain-app", "contract must bind route id seis-second-brain-app");
  ensure(contract.vaultRoot === "/home/seis/SecondBrain", "contract must declare browser-local vault root");
  ensure(contract.trainingPackPath === "/home/seis/SecondBrain/07-learning/seis-agent-training-pack.md", "contract must declare browser-local training pack path");
  ensure(contract.publicContributorPackPath === "/home/seis/SecondBrain/08-public/seis-public-contributor-onboarding.md", "contract must declare browser-local public contributor pack path");
  ensure(contract.obsidianStarterVaultManifestPath === "/home/seis/SecondBrain/09-obsidian/seis-obsidian-starter-vault-manifest.json", "contract must declare browser-local Obsidian starter vault manifest path");
  ensure(contract.obsidianStarterVaultGuidePath === "/home/seis/SecondBrain/09-obsidian/seis-obsidian-starter-vault.md", "contract must declare browser-local Obsidian starter vault guide path");
  ensure(contract.aiCouncilReviewPackPath === "/home/seis/SecondBrain/10-ai-council/seis-ai-council-review-pack.md", "contract must declare browser-local AI council review pack path");
  ensure(contract.releaseReviewPacketPath === "reports/seis-public-demo/pr54-review-packet-latest.md", "contract must declare PR #54 release review packet path");
  ensure(contract.languageModelTrainingCurriculum?.status === "planned-training-contract", "contract must bind planned language model training curriculum");
  ensure(contract.languageModelTrainingCurriculum?.contractPath === trainingCurriculumPath, "contract language model training curriculum path mismatch");
  ensure(contract.languageModelTrainingCurriculum?.reportPath === trainingCurriculumReportPath, "contract language model training curriculum report path mismatch");
  ensure(String(contract.languageModelTrainingCurriculum?.boundary || "").includes("No model install"), "contract language model training curriculum boundary must block model installs");
  ensure(contract.obsidianBridge?.status === "planned", "Obsidian bridge must remain planned until implemented and reviewed");
  ensure(contract.securityBoundary?.storesSecrets === false, "Second Brain must not store secrets");
  ensure(contract.securityBoundary?.providerCalls === false, "Second Brain must not call providers in Local Demo mode");
  ensure(contract.securityBoundary?.sshExecution === false, "Second Brain must not execute SSH");
  ensure(contract.securityBoundary?.deployment === false, "Second Brain must not deploy");
  ensure(contract.securityBoundary?.githubMutation === false, "Second Brain must not mutate GitHub");
  ensure(contract.securityBoundary?.requiresHumanReviewBeforePublicUse === true, "Second Brain must require human review before public use");
  ensureArrayMin(contract.installedAiProfiles, 6, "installedAiProfiles");
  ensureArrayMin(contract.managedSubAgentLanes, 6, "managedSubAgentLanes");
  ensureArrayMin(contract.vaultNotes, 6, "vaultNotes");
  ensureArrayMin(contract.agentLanes, 6, "agentLanes");
  ensureArrayMin(contract.autonomousAgentRoster, 12, "autonomousAgentRoster");
  ensureArrayMin(contract.pipeline, 4, "pipeline");
  ensureArrayMin(contract.githubGates, 4, "githubGates");
  ensure(contract.trainingCoverage?.status === "local-demo-read-only", "trainingCoverage must stay local-demo-read-only");
  ensure(
    contract.trainingCoverage?.source === "repo-owned browser-local Second Brain records only",
    "trainingCoverage source must stay repo-owned browser-local only"
  );
  ensure(contract.trainingCoverage?.trainingPackPath === contract.trainingPackPath, "trainingCoverage path must match trainingPackPath");
  for (const section of [
    "installed AI launcher route coverage",
    "autonomous agent roster onboarding",
    "Obsidian safe import boundary",
    "provider-neutral read-only model router",
    "human approval gates",
    "public demo release gates",
    "public contributor no-key onboarding",
    "Obsidian starter vault no-private-import export",
    "installed AI council review pack"
  ]) {
    ensure((contract.trainingCoverage?.requiredSections || []).includes(section), `trainingCoverage requiredSections missing ${section}`);
  }
  ensure(contract.trainingCoverage?.publicContributorPackPath === contract.publicContributorPackPath, "trainingCoverage public contributor pack path must match publicContributorPackPath");
  ensure(contract.trainingCoverage?.aiCouncilReviewPackPath === contract.aiCouncilReviewPackPath, "trainingCoverage AI council review pack path must match aiCouncilReviewPackPath");
  ensure(contract.publicContributorOnboarding?.status === "local-demo-no-key", "public contributor onboarding must stay local-demo-no-key");
  for (const [field, expected] of [
    ["requiresApiKeys", false],
    ["requiresProviderLogin", false],
    ["requiresPrivateObsidianVault", false],
    ["requiresSsh", false],
    ["requiresDeployment", false],
    ["requiresGitHubWriteAccess", false]
  ]) {
    ensure(contract.publicContributorOnboarding?.[field] === expected, `public contributor onboarding ${field} must be ${expected}`);
  }
  for (const command of [
    "npm run check:seis-second-brain",
    "npm run check:seis-second-brain-readiness-contracts",
    "npm run check:seis-second-brain-browser-smoke"
  ]) {
    ensure((contract.publicContributorOnboarding?.reviewCommands || []).includes(command), `public contributor onboarding reviewCommands missing ${command}`);
  }
  for (const phrase of [
    "how to open the browser-local Second Brain",
    "which installed AI profiles and sub-agent lanes are review-only",
    "how Obsidian compatibility stays metadata-only and approval-gated",
    "which GitHub merge and release gates remain blocked"
  ]) {
    ensure((contract.publicContributorOnboarding?.mustExplain || []).includes(phrase), `public contributor onboarding mustExplain missing ${phrase}`);
  }
  ensure(
    contract.trainingCoverage?.installedAiCoverage?.sourceContract === "content/development/ai-workforce-assignments.json",
    "trainingCoverage installed AI source contract mismatch"
  );
  ensure(
    contract.trainingCoverage?.installedAiCoverage?.requireRegistryRequiredLauncherRoutes === true,
    "trainingCoverage must require registry-required launcher routes"
  );
  ensure(
    contract.trainingCoverage?.installedAiCoverage?.requireSecondBrainProfileForEachLauncherRoute === true,
    "trainingCoverage must require Second Brain profile for every launcher route"
  );
  ensure(
    contract.trainingCoverage?.installedAiCoverage?.requireNoLiveProviderCalls === true,
    "trainingCoverage must forbid live provider calls"
  );
  ensure(
    contract.trainingCoverage?.autonomousAgentCoverage?.requiredRosterCount === 12,
    "trainingCoverage must require the 12-agent roster"
  );
  ensure(
    (contract.autonomousAgentRoster || []).length >= contract.trainingCoverage?.autonomousAgentCoverage?.requiredRosterCount,
    "trainingCoverage autonomous agent roster count is not satisfied"
  );
  ensure(
    contract.trainingCoverage?.autonomousAgentCoverage?.requireNoWriteExecution === true,
    "trainingCoverage must block autonomous write execution"
  );
  ensure(
    contract.trainingCoverage?.autonomousAgentCoverage?.requireApprovalBeforeExternalMutation === true,
    "trainingCoverage must require approval before external mutation"
  );
  ensure(contract.trainingCoverage?.obsidianCoverage?.bridgeStatus === "planned", "trainingCoverage Obsidian bridge must stay planned");
  ensure(
    contract.trainingCoverage?.obsidianCoverage?.bodyImportPolicy === "metadata-only-by-default",
    "trainingCoverage Obsidian body policy must stay metadata-only"
  );
  for (const [field, expected] of [
    ["privateVaultReadAllowed", false],
    ["privateNoteBodyCopyAllowed", false],
    ["pluginInstallAllowed", false]
  ]) {
    ensure(contract.trainingCoverage?.obsidianCoverage?.[field] === expected, `trainingCoverage Obsidian ${field} must be ${expected}`);
  }
  ensure(
    contract.trainingCoverage?.obsidianCoverage?.starterVaultManifestPath === contract.obsidianStarterVaultManifestPath,
    "trainingCoverage Obsidian starter vault manifest path must match the top-level contract path"
  );
  ensure(
    contract.trainingCoverage?.obsidianCoverage?.starterVaultGuidePath === contract.obsidianStarterVaultGuidePath,
    "trainingCoverage Obsidian starter vault guide path must match the top-level contract path"
  );
  ensure(contract.obsidianStarterVault?.status === "local-demo-no-key", "Obsidian starter vault must stay local-demo-no-key");
  ensure(contract.obsidianStarterVault?.manifestPath === contract.obsidianStarterVaultManifestPath, "Obsidian starter vault manifest path mismatch");
  ensure(contract.obsidianStarterVault?.guidePath === contract.obsidianStarterVaultGuidePath, "Obsidian starter vault guide path mismatch");
  for (const [field, expected] of [
    ["requiresPrivateObsidianVault", false],
    ["requiresObsidianPlugin", false],
    ["requiresHostFilesystemRead", false],
    ["copiesDotObsidianState", false],
    ["copiesPrivateNoteBodies", false],
    ["providerCalls", false],
    ["githubMutation", false],
    ["humanApprovalBeforeImport", true]
  ]) {
    ensure(contract.obsidianStarterVault?.[field] === expected, `Obsidian starter vault ${field} must be ${expected}`);
  }
  ensure(contract.aiCouncilReviewPack?.status === "local-demo-no-key", "AI council review pack must stay local-demo-no-key");
  ensure(contract.aiCouncilReviewPack?.packPath === contract.aiCouncilReviewPackPath, "AI council review pack path mismatch");
  ensure(contract.aiCouncilReviewPack?.installedAiProfileCount === contract.installedAiProfiles.length, "AI council review pack installed AI profile count mismatch");
  ensure(contract.aiCouncilReviewPack?.managedSubAgentLaneCount === contract.managedSubAgentLanes.length, "AI council review pack managed sub-agent lane count mismatch");
  ensure(contract.aiCouncilReviewPack?.autonomousAgentRosterCount === contract.autonomousAgentRoster.length, "AI council review pack autonomous agent roster count mismatch");
  for (const [field, expected] of [
    ["requiresApiKeys", false],
    ["requiresProviderLogin", false],
    ["requiresPrivateObsidianVault", false],
    ["providerCalls", false],
    ["credentialValidation", false],
    ["autonomousWriteExecution", false],
    ["sshExecution", false],
    ["deployment", false],
    ["githubMutation", false],
    ["humanApprovalBeforeUse", true]
  ]) {
    ensure(contract.aiCouncilReviewPack?.[field] === expected, `AI council review pack ${field} must be ${expected}`);
  }
  for (const gate of [
    "node scripts/check-seis-second-brain.mjs",
    "node scripts/check-ai-workforce-assignments.mjs",
    "node scripts/create-seis-second-brain-agent-registry.mjs --check"
  ]) {
    ensure((contract.trainingCoverage?.qualityGates || []).includes(gate), `trainingCoverage qualityGates missing ${gate}`);
  }
  for (const blocker of [
    "private Obsidian import",
    "live provider routing",
    "autonomous write execution",
    "GitHub merge or release"
  ]) {
    ensure(
      (contract.trainingCoverage?.blockedUntil || []).some((item) => String(item).includes(blocker)),
      `trainingCoverage blockedUntil missing ${blocker}`
    );
  }

  const noteIds = new Set((contract.vaultNotes || []).map((note) => note.id));
  for (const note of contract.vaultNotes || []) {
    ensure(note.path?.startsWith("/home/seis/SecondBrain/"), `note ${note.id} must stay inside browser-local SecondBrain path`);
    ensure(Array.isArray(note.links), `note ${note.id} must define links`);
    for (const target of note.links || []) {
      ensure(noteIds.has(target), `note ${note.id} links to unknown note ${target}`);
    }
  }

  for (const gate of [
    "no secrets or private vault content",
    "mock, planned, disabled, and real labels are explicit",
    "human approval before push, merge, release, Pages publication, or public community launch"
  ]) {
    ensure((contract.githubGates || []).includes(gate), `contract githubGates missing ${gate}`);
  }
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-second-brain"] === "node scripts/check-seis-second-brain.mjs",
    "package.json must expose check:seis-second-brain"
  );
}

for (const phrase of [
  "SEIS Second Brain",
  "Obsidian-style Markdown vault",
  "installed AI profiles",
  "bounded sub-agent lanes",
  "6 browser runtime AI fixture profiles",
  "24 Second Brain profiles",
  "18 launcher routes",
  "12 installed launcher routes",
  "All 6 current managed SEIS sub-agent lanes",
  "12-agent target roster",
  "GitHub readiness",
  "Agent training pack",
  "Public contributor onboarding pack",
  "Obsidian starter vault",
  "AI council review pack",
  "Language model training curriculum",
  "without installing models",
  "Human review required",
  "npm run check:seis-second-brain",
  "does not import a private Obsidian vault",
  "does not execute SSH"
]) {
  ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
}

for (const phrase of [
  "SEIS_SECOND_BRAIN_SYSTEM",
  "second-brain",
  "seis-second-brain-app",
  "data-second-brain-app",
  "data-ai-second-brain-bridge",
  "data-second-brain-github-gate",
  "data-second-brain-ai-index",
  "data-second-brain-installed-ai",
  "data-second-brain-subagents",
  "data-second-brain-agent-roster",
  "second-brain-capture",
  "second-brain-link",
  "second-brain-training-pack",
  "second-brain-public-contributor-pack",
  "second-brain-obsidian-starter-vault",
  "second-brain-ai-council-pack",
  "second-brain-review",
  "second-brain-export-github",
  "Save Vault Snapshot",
  "buildSecondBrainSnapshotMarkdown",
  "saveSecondBrainSnapshot",
  "reviewSecondBrainVault",
  "exportSecondBrainGithubReadiness",
  "seis-second-brain-vault-snapshot.md",
  "github-readiness-review.md",
  "seis-agent-training-pack.md",
  "seis-public-contributor-onboarding.md",
  "seis-obsidian-starter-vault-manifest.json",
  "seis-obsidian-starter-vault.md",
  "seis-ai-council-review-pack.md",
  "releaseReviewPacketPath",
  "pr54-review-packet-latest.md",
  "seis-language-model-training-curriculum.json",
  "seis-language-model-training-curriculum.md",
  "Language Model Training Curriculum",
  "No model install",
  "exportSecondBrainTrainingPack",
  "buildSecondBrainTrainingPackMarkdown",
  "exportSecondBrainPublicContributorPack",
  "buildSecondBrainPublicContributorPackMarkdown",
  "exportSecondBrainObsidianStarterVault",
  "buildSecondBrainObsidianStarterVaultManifest",
  "buildSecondBrainObsidianStarterVaultGuideMarkdown",
  "exportSecondBrainAiCouncilReviewPack",
  "buildSecondBrainAiCouncilReviewPackMarkdown",
  "publicContributorPackPath",
  "publicContributorOnboarding",
  "obsidianStarterVaultManifestPath",
  "obsidianStarterVaultGuidePath",
  "obsidianStarterVault",
  "aiCouncilReviewPackPath",
  "aiCouncilReviewPack",
  "SEIS_INSTALLED_AI_SYSTEMS.length",
  "registrySummary",
  "data-second-brain-launcher-evidence",
  "Registry AI Profiles",
  "Launcher Routes",
  "Installed Routes",
  "Observed registry AI profiles",
  "Observed launcher routes",
  "Review-Only Registry Launcher Evidence",
  "SUB_AGENT_DEMO.lanes.length",
  "autonomousAgentRoster",
  "Obsidian bridge planned",
  "Human review before GitHub",
  "npm run check:seis-second-brain"
]) {
  ensure(desktopJs.includes(phrase), `desktop.js missing phrase: ${phrase}`);
}

for (const appId of [
  "seis-system-os",
  "search",
  "ai-assistant",
  "seis-command-center",
  "files"
]) {
  ensure(desktopJs.includes(`data-app-id="${appId}"`) || desktopJs.includes(`appId: "${appId}"`) || desktopJs.includes(`"${appId}"`), `desktop.js must connect Second Brain with ${appId}`);
}

for (const selector of [
  ".second-brain-app",
  ".second-brain-hero",
  ".second-brain-layout",
  ".second-brain-vault",
  ".second-brain-graph",
  ".second-brain-node",
  ".second-brain-inspector",
  ".second-brain-pipeline"
]) {
  ensure(desktopCss.includes(selector), `desktop.css missing selector ${selector}`);
}

for (const filePath of [contractPath, docsPath, desktopJsPath, trainingCurriculumPath, trainingCurriculumReportPath]) {
  requireNotMatches(filePath, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(filePath, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(filePath, /\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS Second Brain check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS Second Brain check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(path.join(root, filePath))) failures.push(`missing ${label}: ${filePath}`);
}

function ensureArrayMin(value, minimum, label) {
  ensure(Array.isArray(value), `${label} must be an array`);
  ensure(Array.isArray(value) && value.length >= minimum, `${label} must include at least ${minimum} records`);
}

function readText(filePath, label) {
  const absolutePath = path.join(root, filePath);
  if (!fs.existsSync(absolutePath)) return "";
  try {
    return fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    failures.push(`unable to read ${label}: ${error.message}`);
    return "";
  }
}

function readJson(filePath, label) {
  const text = readText(filePath, label);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`invalid JSON in ${label}: ${error.message}`);
    return null;
  }
}

function requireNotMatches(filePath, pattern, label) {
  const text = readText(filePath, filePath);
  if (pattern.test(text)) failures.push(`${filePath} contains ${label}`);
}
