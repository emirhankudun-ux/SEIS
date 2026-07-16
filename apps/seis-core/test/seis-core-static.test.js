import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import { nextLargeCodeRelease } from "../../../scripts/seis-core-plugin-release-policy.mjs";
import { APP_PLUGIN_EXPANSION_TARGET } from "../../../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const root = new URL("../", import.meta.url);

test("SEIS Command Center shell exposes required modules", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  for (const label of [
    "Dashboard",
    "God Mode",
    "Goals",
    "Repositories",
    "Documentation",
    "Agents",
    "Plugins",
    "Automation",
    "Security",
    "Architecture",
    "Knowledge"
  ]) {
    assert.match(html, new RegExp(`>${label}<`));
  }
  assert.match(html, /SEIS Command Center/);
  assert.match(html, /id="command-dialog"/);
  assert.match(html, /id="settings-dialog"/);
});

test("SEIS Command Center script implements local workflows", async () => {
  const script = await readFile(new URL("script.js", root), "utf8");
  assert.match(script, /localStorage/);
  assert.match(script, /goal-form/);
  assert.match(script, /repositoryFilter/);
  assert.match(script, /activeAgent/);
  assert.match(script, /pluginFamilies/);
  assert.match(script, /SEIS Command Center App Plugins/);
  assert.match(script, /plugins\/seis-core/);
  assert.match(script, /seis-core-plugin-catalog\.json/);
  assert.match(script, /seis-core-plugin-release-readiness\.json/);
  assert.match(script, /app-plugin-filter/);
  assert.match(script, /loadSeisCorePluginArtifact/);
  assert.match(script, /direct SEIS repo source/);
  assert.match(script, /loadSeisCorePluginReleaseReadiness/);
  assert.match(script, /renderPluginReleaseReadiness/);
  assert.match(script, /read-only report/);
  assert.match(script, /at app release \d+\.\d{4}/);
  assert.match(script, /automationWorkflows/);
  assert.match(script, /godModeLanes/);
  assert.match(script, /godModeProtocol/);
  assert.match(script, /seisAiSetup/);
  assert.match(script, /godModeGuardrails/);
  assert.match(script, /godModeArtifacts/);
  assert.match(script, /godModeRuns/);
  assert.match(script, /renderGodMode/);
  assert.match(script, /fallbackSeisRouterLanes/);
  assert.match(script, /renderSeisRouter/);
  assert.match(script, /loadSeisRouterArtifact/);
  assert.match(script, /renderMissionRoutePreview/);
  assert.match(script, /predictMissionRoute/);
  assert.match(script, /laneId: route\.laneId/);
  assert.match(script, /tool: route\.tool/);
  assert.match(script, /defaultGate,/);
  assert.match(script, /routeSource: route\.routeSource/);
  assert.match(script, /operationsReadiness/);
  assert.match(script, /renderOperationsReadiness/);
  assert.match(script, /featureGrowthLedger/);
  assert.match(script, /renderFeatureGrowthLedger/);
  assert.match(script, /workflowRuns/);
  assert.match(script, /approvalGates/);
  assert.match(script, /rollbackEvidence/);
  assert.match(script, /securityReports/);
  assert.match(script, /permissionReviews/);
  assert.match(script, /dependencyScans/);
  assert.match(script, /securityAudits/);
  assert.match(script, /aiSystems/);
  assert.match(script, /operatingDomains/);
  assert.match(script, /platformPhases/);
  assert.match(script, /dependencyGraph/);
  assert.match(script, /moduleRelationships/);
  assert.match(script, /technicalDebtRegister/);
  assert.match(script, /recentActivity/);
  assert.match(script, /dependencyRisk/);
  assert.match(script, /renderAgentDetail/);
  assert.match(script, /orchestrationLanes/);
  assert.match(script, /handoffAudit/);
  assert.match(script, /agent-routing-matrix/);
  assert.match(script, /renderAgentRoutingMatrix/);
  assert.match(script, /knowledgeGraphNodes/);
  assert.match(script, /knowledgeEdges/);
  assert.match(script, /memoryEvidence/);
  assert.match(script, /decisionHistory/);
  assert.match(script, /reusablePatterns/);
  assert.match(script, /openCommandPalette/);
});

test("SEIS Command Center owns the personal plugin source boundary", async () => {
  const manifest = JSON.parse(await readFile(new URL("data/seis-core-plugin-sources.json", root), "utf8"));
  const catalog = JSON.parse(await readFile(new URL("data/seis-core-plugin-catalog.json", root), "utf8"));
  const readiness = JSON.parse(await readFile(new URL("data/seis-core-plugin-release-readiness.json", root), "utf8"));
  const releaseTrain = JSON.parse(await readFile(new URL("../../content/development/seis-core-plugin-release-train.json", root), "utf8"));
  assert.equal(manifest.owner, "apps/seis-core");
  assert.equal(manifest.sourceRoot, "plugins/seis-core");
  assert.equal(manifest.pluginCount, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(catalog.sourceRoot, "plugins/seis-core");
  assert.equal(catalog.distribution.repository, "SEIS");
  assert.equal(catalog.distribution.sourceAvailableInRepository, true);
  assert.equal(catalog.distribution.sourceManifest, "apps/seis-core/data/seis-core-plugin-sources.json");
  assert.equal(catalog.distribution.installSurface, "repo-source-app");
  assert.equal(catalog.distribution.marketplaceEntryCount, 0);
  assert.equal(catalog.distribution.coreSourceOwner, false);
  assert.equal(catalog.counts.discovered, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(catalog.plugins.length, APP_PLUGIN_EXPANSION_TARGET);
  assert.equal(readiness.sourceRoot, "plugins/seis-core");
  assert.equal(readiness.currentRelease.label, releaseTrain.currentRelease.label);
  assert.equal(readiness.next.largeCode.label, nextLargeCodeRelease(releaseTrain.currentRelease.label).label);
  assert.equal(readiness.next.annual.label, "1.0000");
  assert.equal(readiness.policy.largeCodeChangeRequiresEvidence, true);
  assert.equal(manifest.releaseTrainPath, "content/development/seis-core-plugin-release-train.json");
  assert.equal(manifest.releaseTrainVersion, releaseTrain.currentRelease.label);
  assert.equal(manifest.releaseSemver, releaseTrain.currentRelease.semver);
  assert.equal(manifest.releaseMajor, releaseTrain.currentRelease.major);
  assert.equal(manifest.releaseRevision, releaseTrain.currentRelease.revision);
  assert.equal(manifest.releaseMicroUnits ?? null, releaseTrain.currentRelease.microUnits ?? null);
  assert.match(releaseTrain.currentRelease.label, /^(?:0\.\d{1,9}|\d+\.\d{4})$/);
  assert.match(releaseTrain.currentRelease.semver, /^\d+\.0\.\d+$/);
  assert.equal(releaseTrain.policy.minimumLabel, "0.000000001");
  assert.equal(releaseTrain.policy.initialLabel, "0.00000001");
  assert.equal(releaseTrain.policy.maximumLabel, "45.0000");
  assert.equal(manifest.coreBoundary.package, "packages/seis-ai");
  assert.match(manifest.coreBoundary.personalPluginSourcePolicy, /No personal plugin source/);
  assert.equal(manifest.activationPolicy.defaultPermissions.write.length, 0);
  assert.equal(manifest.activationPolicy.defaultPermissions.network.length, 0);
  assert.equal(manifest.activationPolicy.defaultPermissions.secrets.length, 0);
});

test("SEIS Command Center exposes 10-lane router contract", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");
  const artifact = JSON.parse(await readFile(new URL("data/seis-router-routes.json", root), "utf8"));
  assert.match(html, /10-Lane SEIS Router/);
  assert.match(html, /id="mission-route-preview"/);
  assert.match(html, /id="seis-router-lanes"/);
  assert.match(html, /id="agent-routing-matrix"/);
  assert.match(script, /data\/seis-router-routes\.json/);
  assert.match(script, /extractMissionRouteFeatures/);
  assert.match(script, /scoreMissionRoute/);
  assert.equal(artifact.sourcePolicy, "scripts/ai-routing-policy.cjs#chooseAutoRoute");
  assert.ok(artifact.policy?.routeHints?.length > 0);
  assert.ok(artifact.model?.labels?.length >= 10);
  assert.equal(artifact.routes.length, 10);
  for (const lane of [
    "seis",
    "seis-governance",
    "seis-cloud",
    "seis-code",
    "seis-design",
    "seis-data",
    "seis-security",
    "seis-research",
    "seis-automation",
    "seis-product"
  ]) {
    assert.ok(artifact.routes.some((route) => route.laneId === lane), `${lane} should exist in router artifact`);
  }
  for (const field of ["tool", "defaultGate", "integrationTool"]) {
    assert.ok(artifact.routes.every((route) => field in route), `${field} should exist on every route`);
  }
});

test("SEIS Command Center agents expose operational evidence", async () => {
  const script = await readFile(new URL("script.js", root), "utf8");
  for (const field of ["capabilities", "tasks", "logs", "outputs"]) {
    assert.match(script, new RegExp(`${field}: \\[`));
  }
});

test("SEIS Command Center supports multi-model orchestration", async () => {
  const script = await readFile(new URL("script.js", root), "utf8");
  for (const model of ["OpenAI", "Claude", "Gemini", "Qwen", "Local Models", "Future AI Systems"]) {
    assert.match(script, new RegExp(`name: "${model}"|primary: "${model}"`));
  }
  for (const lane of ["Plan", "Build", "Validate", "Counter-Review", "Private Draft", "Future Adapter"]) {
    assert.match(script, new RegExp(`lane: "${lane}"`));
  }
});


test("SEIS Command Center covers the required ecosystem operating domains", async () => {
  const script = await readFile(new URL("script.js", root), "utf8");
  for (const domain of [
    "Repositories",
    "AI Agents",
    "MCP Systems",
    "Plugin Systems",
    "Documentation",
    "Architecture Decisions",
    "Roadmap Planning",
    "Goal Tracking",
    "Automation Workflows",
    "Cloud Infrastructure",
    "Knowledge Systems",
    "Security Systems"
  ]) {
    assert.match(script, new RegExp(`name: "${domain}"`));
  }
});

test("SEIS Command Center design system preserves required tokens", async () => {
  const css = await readFile(new URL("styles.css", root), "utf8");
  for (const token of ["--sidebar", "--accent", "--surface", "--radius"]) {
    assert.match(css, new RegExp(token));
  }
  assert.match(css, /plugin-card/);
  assert.match(css, /godmode-workbench/);
  assert.match(css, /mission-composer/);
  assert.match(css, /mission-route-preview/);
  assert.match(css, /route-preview-card/);
  assert.match(css, /lane-chip/);
  assert.match(css, /protocol-step/);
  assert.match(css, /ai-setup-card/);
  assert.match(css, /run-step/);
  assert.match(css, /run-route-meta/);
  assert.match(css, /guardrail-row/);
  assert.match(css, /artifact-card/);
  assert.match(css, /router-lane-card/);
  assert.match(css, /router-facts/);
  assert.match(css, /routing-matrix-row/);
  assert.match(css, /operations-readiness-panel/);
  assert.match(css, /readiness-card/);
  assert.match(css, /readiness-row/);
  assert.match(css, /decision-summary-card/);
  assert.match(css, /feature-growth-ledger/);
  assert.match(css, /ledger-row/);
  assert.match(css, /blocker-row/);
  assert.match(css, /automation-card/);
  assert.match(css, /automation-ops-layout/);
  assert.match(css, /workflow-run-row/);
  assert.match(css, /approval-row/);
  assert.match(css, /rollback-row/);
  assert.match(css, /security-card/);
  assert.match(css, /security-ops-layout/);
  assert.match(css, /permission-review-row/);
  assert.match(css, /dependency-scan-row/);
  assert.match(css, /security-audit-row/);
  assert.match(css, /domain-card/);
  assert.match(css, /phase-row/);
  assert.match(css, /architecture-ops-layout/);
  assert.match(css, /dependency-edge/);
  assert.match(css, /relationship-row/);
  assert.match(css, /debt-row/);
  assert.match(css, /activity-row/);
  assert.match(css, /dependency-row/);
  assert.match(css, /agent-detail/);
  assert.match(css, /orchestration-card/);
  assert.match(css, /handoff-row/);
  assert.match(css, /knowledge-map-panel/);
  assert.match(css, /knowledge-node-card/);
  assert.match(css, /knowledge-edge-row/);
  assert.match(css, /memory-evidence-row/);
  assert.match(css, /decision-history-row/);
  assert.match(css, /pattern-card/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("SEIS Command Center knowledge system exposes graph and memory evidence", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");
  for (const id of [
    "knowledge-node-grid",
    "knowledge-edge-list",
    "memory-evidence-list",
    "decision-history-list",
    "pattern-library"
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const signal of [
    "Repository Memory",
    "Research Sources",
    "Decision History",
    "Reusable Patterns",
    "Security Policy",
    "AI Agent Handoffs"
  ]) {
    assert.match(script, new RegExp(signal));
  }
});
