import { existsSync, readFileSync } from "node:fs";

const registryPath = "content/lab/development-process.json";
const roadmapPath = "content/lab/long-development-roadmap.json";
const documentPath = "docs/governance/development-process.md";

const failures = [];

if (!existsSync(registryPath)) {
  failures.push(`missing ${registryPath}`);
}

if (!existsSync(documentPath)) {
  failures.push(`missing ${documentPath}`);
}

if (!existsSync(roadmapPath)) {
  failures.push(`missing ${roadmapPath}`);
}

let registry = null;
if (existsSync(registryPath)) {
  registry = JSON.parse(readFileSync(registryPath, "utf8"));
}

const documentText = existsSync(documentPath)
  ? readFileSync(documentPath, "utf8")
  : "";
const roadmap = existsSync(roadmapPath)
  ? JSON.parse(readFileSync(roadmapPath, "utf8"))
  : null;

if (registry) {
  if (registry.mode !== "high-efficiency-low-power") {
    failures.push("development process must stay in high-efficiency-low-power mode");
  }

  if (registry.activeBranchPolicy?.githubBranch !== "UIXAppTTR") {
    failures.push("development process must target UIXAppTTR as the GitHub branch");
  }

  if (registry.activeBranchPolicy?.singleRemoteBranchRequired !== true) {
    failures.push("development process must require a single remote branch");
  }

  if (registry.workspaceRouting?.qualitySignal !== "npm run check:workspace") {
    failures.push("development process must route workspace checks through npm run check:workspace");
  }

  if (registry.workspaceRouting?.publishReadinessSignal !== "npm run automation:publish-readiness") {
    failures.push("development process must expose npm run automation:publish-readiness as the publish readiness signal");
  }

  if (!String(registry.workspaceRouting?.rule || "").includes("local staging")) {
    failures.push("development process must define the local staging workspace rule");
  }

  if (!String(registry.workspaceRouting?.rule || "").includes("do not claim remote shipment")) {
    failures.push("development process must explicitly block remote shipment claims in local staging mode");
  }

  const claimPolicy = registry.workspaceRouting?.remoteShipmentClaimPolicy || {};
  if (claimPolicy.stagingMode !== "local-only") {
    failures.push("development process must keep remote claim policy in local-only staging mode");
  }

  if (claimPolicy.disallowClaimWhenLocalStaging !== true) {
    failures.push("development process must disallow remote shipment claims in local staging mode");
  }

  const claimRequirements = claimPolicy.claimRequires || [];
  for (const requiredClaimRequirement of [
    "git checkout detected",
    "UIXAppTTR active branch",
    "UIX-Apps remote configured",
    "clean worktree",
    "branch upstream configured",
    "github authentication ready"
  ]) {
    if (!claimRequirements.includes(requiredClaimRequirement)) {
      failures.push(`development process missing remote claim requirement: ${requiredClaimRequirement}`);
    }
  }

  const phaseNames = new Set((registry.cadence || []).map(item => item.phase));
  for (const phase of ["orient", "compose", "verify", "publish"]) {
    if (!phaseNames.has(phase)) {
      failures.push(`development process missing cadence phase: ${phase}`);
    }
  }

  const validationProfiles = registry.validationProfiles || {};
  const lowPowerProfile = validationProfiles.lowPowerDefault || {};
  const lowPowerCommands = lowPowerProfile.commands || [];
  for (const requiredCommand of [
    "npm run check:workspace",
    "node scripts/check-development-process.mjs",
    "node --check scripts/check-development-process.mjs",
    "node --check scripts/check-workspace-routing.mjs"
  ]) {
    if (!lowPowerCommands.includes(requiredCommand)) {
      failures.push(`development process missing low-power validation command: ${requiredCommand}`);
    }
  }

  const lowPowerDisallow = lowPowerProfile.disallow || [];
  for (const blockedCommand of ["npm install", "npm run build", "playwright"]) {
    if (!lowPowerDisallow.includes(blockedCommand)) {
      failures.push(`development process low-power profile must disallow: ${blockedCommand}`);
    }
  }

  const expandedFoundationProfile = validationProfiles.expandedFoundation || {};
  const expandedCommands = expandedFoundationProfile.commands || [];
  if (!expandedCommands.includes("npm run check:foundation")) {
    failures.push("development process expanded foundation profile must include npm run check:foundation");
  }

  const workstreams = registry.activeSprint?.workstreams || [];
  if (workstreams.length < 4) {
    failures.push("development process must define at least four active sprint workstreams");
  }

  const highPriorityOpenItems = (registry.openBacklog || []).filter(item => item.priority === "high");
  if (highPriorityOpenItems.length < 1) {
    failures.push("development process must keep a high-priority open backlog item");
  }
}

if (roadmap && (roadmap.phases || []).length < 6) {
  failures.push("development process must be paired with the long roadmap phases");
}

for (const requiredText of [
  "UIXAppTTR",
  "Workspace Routing",
  "remote shipment must not be claimed",
  "Development Cadence",
  "Proportional Validation Profiles",
  "Active Sprint",
  "Open Backlog",
  "Stop Conditions",
  "GitHub authentication",
  "automation:publish-readiness"
]) {
  if (!documentText.includes(requiredText)) {
    failures.push(`missing "${requiredText}" in ${documentPath}`);
  }
}

const webShellPath = "apps/web/index.html";
if (existsSync(webShellPath)) {
  const webShell = readFileSync(webShellPath, "utf8");
  if (!webShell.includes('id="development"')) {
    failures.push("web shell must expose the development cockpit section");
  }
}

if (failures.length > 0) {
  console.error("SEIS development process check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS development process check passed.");
