import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

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
  assert.match(script, /openCommandPalette/);
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
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /prefers-reduced-motion/);
});
