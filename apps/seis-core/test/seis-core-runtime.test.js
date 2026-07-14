import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { JSDOM } from "jsdom";

const root = new URL("../", import.meta.url);
const [html, script, routerArtifact, ecosystemRegistry, runtimeSnapshot] = await Promise.all([
  readFile(new URL("index.html", root), "utf8"),
  readFile(new URL("script.js", root), "utf8"),
  readJson("data/seis-router-routes.json"),
  readJson("data/seis-core-ecosystem-registry.json"),
  readJson("data/seis-ai-core-runtime-snapshot.json")
]);

test("SEIS Core recovers from an unknown persisted view", async () => {
  const { window } = await boot({ storedState: { activeView: "removed-view" } });

  assert.equal(window.document.querySelector("#view-title")?.textContent, "SEIS operating center");
  assert.ok(window.document.querySelector('[data-panel="dashboard"]')?.classList.contains("is-active"));
  assert.ok(window.document.querySelectorAll("#metric-grid article").length > 0);
  assert.equal(JSON.parse(window.localStorage.getItem("seis-core-state-v1")).activeView, "dashboard");
});

test("SEIS Core renders source-backed providers, scenarios, and MCP mesh", async () => {
  const { window } = await boot();
  window.document.querySelector('[data-view="godmode"]')?.click();

  assert.equal(window.document.querySelector("#ai-core-runtime-state")?.textContent, "Source-backed");
  assert.equal(window.document.querySelectorAll("[data-ai-core-provider]").length, 7);
  assert.equal(window.document.querySelectorAll("[data-ai-core-scenario]").length, 7);
  assert.match(window.document.querySelector("#ai-core-runtime-summary")?.textContent || "", /37\/30\/3/);
  assert.match(window.document.querySelector("#ai-core-runtime-summary")?.textContent || "", /6\/6/);
  assert.match(window.document.querySelector("#ai-core-runtime-summary")?.textContent || "", /38\/11/);
  assert.match(window.document.querySelector("#ai-core-mesh-strip")?.textContent || "", /6\/6/);
  const inventoryCard = window.document.querySelector("[data-ai-core-capability-inventory]");
  assert.equal(inventoryCard?.getAttribute("data-ai-core-capability-inventory"), "seis-installed-capability-inventory");
  assert.match(inventoryCard?.textContent || "", /38 skills/);
  assert.match(inventoryCard?.textContent || "", /11 NVIDIA integrations/);
  assert.equal(window.document.querySelector("#ai-workforce-registry-state")?.textContent, "Source-backed");
  assert.equal(window.document.querySelectorAll("[data-ai-workforce-assignment]").length, 10);
  assert.match(window.document.querySelector("#ai-workforce-registry-summary")?.textContent || "", /Codex/);
  assert.match(window.document.querySelector("#ai-workforce-registry-feedback")?.textContent || "", /source-backed role and launcher metadata/i);
  assert.equal(window.document.querySelector("#ai-training-registry-state")?.textContent, "Source-backed");
  assert.equal(window.document.querySelectorAll("[data-ai-training-role]").length, 10);
  assert.equal(window.document.querySelectorAll("[data-ai-training-loop]").length, 7);
  assert.equal(window.document.querySelectorAll("[data-ai-training-target]").length, 4);
  assert.match(window.document.querySelector("#ai-training-registry-summary")?.textContent || "", /Disabled/);
  assert.match(window.document.querySelector("#ai-training-registry-feedback")?.textContent || "", /no live provider calls/i);
  const probeRows = [...window.document.querySelectorAll("[data-ai-core-mcp-probe]")];
  assert.equal(probeRows.length, 6);
  assert.ok(probeRows.some((row) => row.textContent?.includes("seis_cloud_status")));
  assert.ok(probeRows.every((row) => row.textContent?.includes("read-only")));

  window.document.querySelector('[data-ai-core-scenario="private-vault-block"]')?.click();
  const decision = window.document.querySelector("#ai-core-decision");
  assert.equal(decision?.dataset.aiCoreActiveDecision, "private-vault-block");
  assert.match(decision?.textContent || "", /Disabled/);
  assert.match(decision?.textContent || "", /Route eligible\s*No/);
  assert.match(decision?.textContent || "", /Execution\s*Not performed/);

  window.document.querySelector('[data-view="agents"]')?.click();
  const openAiCard = window.document.querySelector('[data-ai-system-provider="openai-general"]');
  const ollamaCard = window.document.querySelector('[data-ai-system-provider="ollama-local"]');
  assert.match(openAiCard?.textContent || "", /Missing Key/);
  assert.match(ollamaCard?.textContent || "", /Disabled/);
});

test("SEIS Core rejects an unsafe plugin MCP probe snapshot", async () => {
  const { window } = await boot({
    snapshotTransform(snapshot) {
      snapshot.pluginMesh.mcpMesh.probe.safeToolProbeCount = 5;
      return snapshot;
    }
  });

  window.document.querySelector('[data-view="godmode"]')?.click();
  assert.equal(window.document.querySelector("#ai-core-runtime-state")?.textContent, "Fallback");
  assert.match(window.document.querySelector("#ai-core-runtime-feedback")?.textContent || "", /plugin MCP safe-probe boundary/i);
  assert.equal(window.document.querySelectorAll("[data-ai-core-mcp-probe]").length, 0);
});

test("SEIS Core rejects incomplete plugin MCP lifecycle evidence", async () => {
  const { window } = await boot({
    snapshotTransform(snapshot) {
      snapshot.pluginMesh.mcpMesh.probe.lifecycle = "tools/list only";
      return snapshot;
    }
  });

  window.document.querySelector('[data-view="godmode"]')?.click();
  assert.equal(window.document.querySelector("#ai-core-runtime-state")?.textContent, "Fallback");
  assert.match(window.document.querySelector("#ai-core-runtime-feedback")?.textContent || "", /plugin MCP safe-probe boundary/i);
});

test("SEIS Core rejects a non-allowlisted plugin MCP tool", async () => {
  const { window } = await boot({
    snapshotTransform(snapshot) {
      const cloudServer = snapshot.pluginMesh.mcpMesh.servers.find((server) => server.serverId === "seis-cloud");
      cloudServer.safeToolProbe.requestedTool = "seis_cloud_plan";
      return snapshot;
    }
  });

  window.document.querySelector('[data-view="godmode"]')?.click();
  assert.equal(window.document.querySelector("#ai-core-runtime-state")?.textContent, "Fallback");
  assert.match(window.document.querySelector("#ai-core-runtime-feedback")?.textContent || "", /plugin MCP safe-probe boundary/i);
});

test("SEIS Core rejects an unsafe installed capability inventory", async () => {
  const { window } = await boot({
    snapshotTransform(snapshot) {
      snapshot.installedCapabilityInventory.runtimeBoundary.networkCalled = true;
      return snapshot;
    }
  });

  window.document.querySelector('[data-view="godmode"]')?.click();
  assert.equal(window.document.querySelector("#ai-core-runtime-state")?.textContent, "Fallback");
  assert.match(window.document.querySelector("#ai-core-runtime-feedback")?.textContent || "", /installed capability inventory boundary/i);
  const inventoryCard = window.document.querySelector("[data-ai-core-capability-inventory]");
  assert.equal(inventoryCard?.getAttribute("data-ai-core-capability-inventory"), "seis-installed-capability-inventory-fallback");
  assert.match(inventoryCard?.textContent || "", /unavailable/);
});

test("SEIS Core rejects an unsafe AI workforce assignment snapshot", async () => {
  const { window } = await boot({
    snapshotTransform(snapshot) {
      snapshot.workforceAssignmentRegistry.runtimeBoundary.externalMutationPerformed = true;
      return snapshot;
    }
  });

  window.document.querySelector('[data-view="agents"]')?.click();
  assert.equal(window.document.querySelector("#ai-workforce-registry-state")?.textContent, "Fallback");
  assert.match(window.document.querySelector("#ai-core-runtime-feedback")?.textContent || "", /AI workforce assignment boundary/i);
  assert.equal(window.document.querySelectorAll("[data-ai-workforce-assignment]").length, 1);
  assert.match(window.document.querySelector("#ai-workforce-registry-feedback")?.textContent || "", /unavailable/i);
});

test("SEIS Core rejects an AI workforce assignment with unsafe boundary text or launcher status", async () => {
  const { window } = await boot({
    snapshotTransform(snapshot) {
      snapshot.workforceAssignmentRegistry.truthBoundary = "Live autonomous execution enabled.";
      snapshot.workforceAssignmentRegistry.assignments[0].launcherStatus = "live";
      return snapshot;
    }
  });

  window.document.querySelector('[data-view="agents"]')?.click();
  assert.equal(window.document.querySelector("#ai-workforce-registry-state")?.textContent, "Fallback");
  assert.match(window.document.querySelector("#ai-core-runtime-feedback")?.textContent || "", /AI workforce assignment boundary/i);
});

test("SEIS Core rejects an unsafe AI workforce training snapshot", async () => {
  const { window } = await boot({
    snapshotTransform(snapshot) {
      snapshot.workforceTrainingRegistry.modelTargets[0].runtimeAuthority = true;
      return snapshot;
    }
  });

  window.document.querySelector('[data-view="agents"]')?.click();
  assert.equal(window.document.querySelector("#ai-training-registry-state")?.textContent, "Fallback");
  assert.match(window.document.querySelector("#ai-core-runtime-feedback")?.textContent || "", /AI workforce training boundary/i);
  assert.equal(window.document.querySelectorAll("[data-ai-training-role]").length, 1);
  assert.equal(window.document.querySelectorAll("[data-ai-training-loop]").length, 0);
  assert.match(window.document.querySelector("#ai-training-registry-feedback")?.textContent || "", /unavailable/i);
});

test("SEIS Core renders and fail-closes the AI agent permission matrix", async () => {
  const { window } = await boot();
  window.document.querySelector('[data-view="agents"]')?.click();

  assert.equal(window.document.querySelector("#agent-permission-matrix-state")?.textContent, "Source-backed");
  assert.equal(window.document.querySelectorAll("[data-agent-permission-level]").length, 5);
  assert.equal(window.document.querySelectorAll("#agent-permission-forbidden-list li").length, 7);
  assert.match(window.document.querySelector("#agent-permission-matrix-summary")?.textContent || "", /Enabled now\s*2/);
  assert.match(window.document.querySelector("#agent-permission-matrix-feedback")?.textContent || "", /do not grant runtime authority/i);

  const { window: unsafeWindow } = await boot({
    snapshotTransform(snapshot) {
      snapshot.agentPermissionMatrixRegistry.enabledLevelCount = 3;
      return snapshot;
    }
  });
  unsafeWindow.document.querySelector('[data-view="agents"]')?.click();
  assert.equal(unsafeWindow.document.querySelector("#agent-permission-matrix-state")?.textContent, "Fallback");
  assert.match(unsafeWindow.document.querySelector("#ai-core-runtime-feedback")?.textContent || "", /AI agent permission matrix boundary/i);
  assert.equal(unsafeWindow.document.querySelectorAll("[data-agent-permission-level]").length, 0);
});

test("SEIS Core renders and fail-closes sub-agent runtime fixture evidence", async () => {
  const { window } = await boot();
  window.document.querySelector('[data-view="agents"]')?.click();

  assert.equal(window.document.querySelector("#ai-runtime-fixtures-state")?.textContent, "Source-backed");
  assert.equal(window.document.querySelectorAll("[data-ai-runtime-fixture]").length, 7);
  assert.match(window.document.querySelector("#ai-runtime-fixtures-summary")?.textContent || "", /Ledger fields\s*19/);
  assert.match(window.document.querySelector("#ai-execution-ledger")?.textContent || "", /append-only-planned/i);
  assert.match(window.document.querySelector("#ai-execution-ledger")?.textContent || "", /operator-cancel/i);
  assert.match(window.document.querySelector("#ai-runtime-fixtures-feedback")?.textContent || "", /do not execute agents/i);

  const { window: unsafeWindow } = await boot({
    snapshotTransform(snapshot) {
      snapshot.subagentRuntimeFixturesRegistry.executionLedgerFixture.sampleRecord.externalMutationPerformed = true;
      return snapshot;
    }
  });
  unsafeWindow.document.querySelector('[data-view="agents"]')?.click();
  assert.equal(unsafeWindow.document.querySelector("#ai-runtime-fixtures-state")?.textContent, "Fallback");
  assert.match(unsafeWindow.document.querySelector("#ai-core-runtime-feedback")?.textContent || "", /execution ledger boundary/i);
  assert.equal(unsafeWindow.document.querySelectorAll("[data-ai-runtime-fixture]").length, 0);
});

test("God Mode mission submission records a decision-only route", async () => {
  const { window } = await boot();
  window.document.querySelector('[data-view="godmode"]')?.click();
  const mission = window.document.querySelector("#godmode-mission-input");
  mission.value = "Prepare a cloud provider deploy preflight with rollback evidence";
  mission.dispatchEvent(new window.Event("input", { bubbles: true }));
  window.document.querySelector("#godmode-mission-form")?.dispatchEvent(
    new window.Event("submit", { bubbles: true, cancelable: true })
  );

  const latestRun = window.document.querySelector("#godmode-run-timeline .run-step");
  assert.match(latestRun?.textContent || "", /Decision-only route/);
  assert.match(latestRun?.textContent || "", /provider state:/i);
  assert.match(latestRun?.textContent || "", /execution: not performed/i);
  assert.match(latestRun?.textContent || "", /Review/);
  assert.doesNotMatch(latestRun?.textContent || "", /provider calls performed: true/i);

  const preview = window.document.querySelector("#mission-route-preview");
  assert.match(preview?.textContent || "", /Decision only|Safety adjusted/);
  assert.match(preview?.textContent || "", /Runtime\s*Not performed/);
  assert.match(preview?.textContent || "", /route eligible: no/i);
});

test("SEIS Core renders and selects the full managed agent registry", async () => {
  const { window } = await boot();
  window.document.querySelector('[data-view="agents"]')?.click();

  assert.equal(window.document.querySelector("#managed-agent-registry-state")?.textContent, "Source-backed");
  assert.equal(window.document.querySelectorAll("[data-managed-lane]").length, 9);
  assert.equal(window.document.querySelectorAll("[data-managed-agent]").length, 13);
  assert.match(window.document.querySelector("#managed-agent-registry-summary")?.textContent || "", /Execution\s*Disabled/);

  assert.equal(window.document.querySelector("#ai-workforce-registry-state")?.textContent, "Source-backed");
  assert.equal(window.document.querySelectorAll("[data-ai-workforce-assignment]").length, 10);
  assert.match(window.document.querySelector("#ai-workforce-registry-summary")?.textContent || "", /10/);

  window.document.querySelector('[data-managed-agent="security-agent"]')?.click();
  const detail = window.document.querySelector("#managed-agent-detail");
  assert.match(detail?.textContent || "", /Security Agent/);
  assert.match(detail?.textContent || "", /Execution authority\s*None/);
  assert.match(detail?.textContent || "", /Human approval required/);
  assert.equal(JSON.parse(window.localStorage.getItem("seis-core-state-v1")).activeManagedAgentId, "security-agent");

  window.document.querySelector('[data-ai-workforce-assignment="qwen"]')?.click();
  const workforceDetail = window.document.querySelector("#ai-workforce-assignment-detail");
  assert.match(workforceDetail?.textContent || "", /Qwen/);
  assert.match(workforceDetail?.textContent || "", /Execution authority\s*None/);
  assert.match(workforceDetail?.textContent || "", /Provider calls\s*Not performed/);
  assert.match(workforceDetail?.textContent || "", /Human approval required/);
  assert.equal(JSON.parse(window.localStorage.getItem("seis-core-state-v1")).activeAIWorkforceAssignmentId, "qwen");
  assert.equal(window.document.querySelector('[data-ai-workforce-assignment="qwen"]')?.getAttribute("role"), null);
  assert.equal(window.document.querySelector('[data-ai-workforce-assignment="qwen"]')?.parentElement?.getAttribute("role"), "listitem");

  assert.equal(window.document.querySelector("#ai-training-registry-state")?.textContent, "Source-backed");
  window.document.querySelector('[data-ai-training-role="ollama"]')?.click();
  const trainingDetail = window.document.querySelector("#ai-training-role-detail");
  assert.match(trainingDetail?.textContent || "", /Ollama/);
  assert.match(trainingDetail?.textContent || "", /Secret access\s*Not allowed/);
  assert.match(trainingDetail?.textContent || "", /Provider calls\s*Not allowed/);
  assert.match(trainingDetail?.textContent || "", /Runtime authority\s*None/);
  assert.equal(JSON.parse(window.localStorage.getItem("seis-core-state-v1")).activeAITrainingRoleId, "ollama");
  assert.equal(window.document.querySelector('[data-ai-training-role="ollama"]')?.getAttribute("role"), null);
  assert.equal(window.document.querySelector('[data-ai-training-role="ollama"]')?.parentElement?.getAttribute("role"), "listitem");
});

test("SEIS Core renders and selects source-backed ecosystem lanes", async () => {
  const { window } = await boot();
  window.document.querySelector('[data-view="plugins"]')?.click();

  assert.equal(window.document.querySelector("#ecosystem-control-state")?.textContent, "Source-backed");
  assert.equal(window.document.querySelectorAll("[data-ecosystem-lane]").length, 6);
  assert.match(window.document.querySelector("#ecosystem-control-summary")?.textContent || "", /6 \/ 25/);
  assert.match(window.document.querySelector("#ecosystem-control-summary")?.textContent || "", /37 \/ 30 \/ 3/);

  window.document.querySelector('[data-ecosystem-lane="seis-cloud"]')?.click();
  const detail = window.document.querySelector("#ecosystem-lane-detail");
  assert.equal(detail?.dataset.ecosystemActiveLane, "seis-cloud");
  assert.match(detail?.textContent || "", /Execution\s*Disabled/);
  assert.match(detail?.textContent || "", /Live MCP\s*Not started/);
  assert.match(detail?.textContent || "", /blocked-provider-billing/);
  assert.match(detail?.textContent || "", /preserve-existing-server-and-port/);
  const ecosystemLink = detail?.querySelector(".ecosystem-link");
  assert.match(ecosystemLink?.getAttribute("href") || "", /desktop\.html\?app=seis-cloud/);
  assert.equal(ecosystemLink?.getAttribute("target"), null);
  assert.equal(window.document.querySelector('[data-ecosystem-lane="seis-cloud"]')?.getAttribute("aria-selected"), "true");
  assert.equal(JSON.parse(window.localStorage.getItem("seis-core-state-v1")).activeEcosystemLaneId, "seis-cloud");

  detail?.querySelector("[data-copy-ecosystem-gate]")?.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.match(window.document.querySelector("#ecosystem-control-feedback")?.textContent || "", /Copied validation gate/);
});

test("SEIS Core keeps ecosystem execution disabled when the generated registry cannot load", async () => {
  const { window } = await boot({ ecosystemAvailable: false });
  window.document.querySelector('[data-view="plugins"]')?.click();

  assert.equal(window.document.querySelector("#ecosystem-control-state")?.textContent, "Fallback");
  assert.equal(window.document.querySelectorAll("[data-ecosystem-lane]").length, 6);
  assert.match(window.document.querySelector("#ecosystem-control-feedback")?.textContent || "", /Fallback active/);
  assert.match(window.document.querySelector("#ecosystem-lane-detail")?.textContent || "", /Execution\s*Disabled/);
});

test("SEIS Core keeps an explicit disabled fallback when the snapshot cannot load", async () => {
  const { window } = await boot({ snapshotAvailable: false });
  window.document.querySelector('[data-view="godmode"]')?.click();

  assert.equal(window.document.querySelector("#ai-core-runtime-state")?.textContent, "Fallback");
  assert.equal(window.document.querySelectorAll("[data-ai-core-provider]").length, 1);
  assert.match(window.document.querySelector("#ai-core-runtime-feedback")?.textContent || "", /Fallback active/);
  assert.match(window.document.querySelector("#ai-core-runtime-feedback")?.textContent || "", /execution remain disabled/);
  window.document.querySelector('[data-view="agents"]')?.click();
  assert.equal(window.document.querySelector("#managed-agent-registry-state")?.textContent, "Fallback");
  assert.equal(window.document.querySelectorAll("[data-managed-agent]").length, 1);
  assert.equal(window.document.querySelector("#ai-workforce-registry-state")?.textContent, "Fallback");
  assert.equal(window.document.querySelectorAll("[data-ai-workforce-assignment]").length, 1);
  assert.equal(window.document.querySelector("#ai-training-registry-state")?.textContent, "Fallback");
  assert.equal(window.document.querySelectorAll("[data-ai-training-role]").length, 1);
});

test("view-specific primary actions stay in their operational context", async () => {
  const { window } = await boot();
  window.document.querySelector('[data-view="plugins"]')?.click();
  window.document.querySelector("#primary-action")?.click();

  assert.ok(window.document.querySelector('[data-panel="plugins"]')?.classList.contains("is-active"));
  assert.equal(window.document.activeElement?.classList.contains("ecosystem-control-plane"), true);
});

async function boot({ storedState, snapshotAvailable = true, ecosystemAvailable = true, snapshotTransform } = {}) {
  const dom = new JSDOM(html, {
    url: "http://127.0.0.1:4174/",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.structuredClone = globalThis.structuredClone;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.Element.prototype.scrollIntoView = function scrollIntoView() {};
  window.HTMLDialogElement.prototype.showModal = function showModal() { this.open = true; };
  window.HTMLDialogElement.prototype.close = function close() { this.open = false; };
  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value: { async writeText() {} }
  });

  const fixtures = new Map([
    ["data/seis-router-routes.json", routerArtifact],
    ["data/seis-core-ecosystem-registry.json", ecosystemRegistry],
    ["data/seis-ai-core-runtime-snapshot.json", runtimeSnapshot]
  ]);
  window.fetch = async (url) => {
    const key = String(url);
    if (key.endsWith("data/seis-core-ecosystem-registry.json") && !ecosystemAvailable) {
      return { ok: false, status: 404, async json() { return {}; } };
    }
    if (key.endsWith("data/seis-ai-core-runtime-snapshot.json") && !snapshotAvailable) {
      return { ok: false, status: 404, async json() { return {}; } };
    }
    const fixture = [...fixtures].find(([name]) => key.endsWith(name))?.[1];
    return fixture
      ? { ok: true, status: 200, async json() { return snapshotTransform && key.endsWith("data/seis-ai-core-runtime-snapshot.json") ? snapshotTransform(structuredClone(fixture)) : structuredClone(fixture); } }
      : { ok: false, status: 404, async json() { return {}; } };
  };

  if (storedState !== undefined) {
    window.localStorage.setItem("seis-core-state-v1", JSON.stringify(storedState));
  }
  window.eval(script);
  await new Promise((resolve) => setTimeout(resolve, 25));
  return { dom, window };
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, root), "utf8"));
}
