import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const root = new URL("../", import.meta.url);

test("SEIS AI demo exposes the required operating modules", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");

  for (const label of [
    "SEIS AI Command Core",
    "Ask SEIS",
    "Router",
    "Agents",
    "Workflow",
    "Prompts",
    "Knowledge",
    "Evals",
    "Approvals",
    "Audit",
    "Local demo mode",
    "No provider key connected",
    "Generate plan",
    "Run evaluation",
    "Open in macOS",
    "Export markdown",
    "Approve"
  ]) {
    assert.ok(html.includes(label), `missing label: ${label}`);
  }

  assert.match(html, /id="composer-form"/);
  assert.match(html, /id="route-bars"/);
  assert.match(html, /id="provider-readiness"/);
  assert.match(html, /id="agent-queue"/);
  assert.match(html, /id="workflow-map"/);
  assert.match(html, /id="run-metrics"/);
  assert.match(html, /id="eval-score-strip"/);
  assert.match(html, /id="audit-timeline"/);
  assert.match(html, /id="command-dialog"/);
});

test("SEIS AI demo script keeps provider-free deterministic workflow helpers", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const dom = new JSDOM(html, {
    url: "http://localhost/apps/seis-ai-demo/",
    pretendToBeVisual: true
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.Blob = dom.window.Blob;
  const originalUrl = global.URL;
  global.URL = dom.window.URL;

  try {
    await import(`${new URL("script.js", root).href}?test=${Date.now()}`);
    const api = dom.window.SeisAIDemo;

    assert.equal(typeof api.routeTask, "function");
    assert.equal(typeof api.computeRisk, "function");
    assert.equal(typeof api.evaluateRun, "function");
    assert.equal(typeof api.createRun, "function");
    assert.equal(typeof api.generateWorkflow, "function");
    assert.equal(typeof api.generateProviderReadiness, "function");
    assert.equal(typeof api.buildMarkdownExport, "function");
    assert.equal(typeof api.buildMacHandoffURL, "function");

    const route = api.routeTask("Build an AI app demo with agents, evals, and security review.", "build");
    assert.equal(route.selected.name, "Implementation Builder");
    assert.ok(route.candidates.length >= 4);

    const risk = api.computeRisk("Review SSH deployment risk without credentials.", 1, true);
    assert.ok(["Medium", "High"].includes(risk.level));

    const run = api.createRun({
      mode: "review",
      prompt: "Evaluate a local provider-free SEIS AI demo.",
      promptVersion: "seis-review-v0.2",
      promptNotes: "Test notes",
      approvalRequired: true,
      redactSecrets: true,
      autonomyLevel: 1,
      approved: false,
      agentFilter: "all",
      runCounter: 7,
      audit: []
    });

    assert.equal(run.id, "SEIS-LOCAL-007");
    assert.equal(run.traceId, "trace-local-007");
    assert.ok(run.steps.length >= 5);
    assert.ok(run.agents.some(agent => agent.name === "QA Agent"));
    assert.ok(run.workflow.some(node => node.id === "approval" && node.state === "Waiting"));
    assert.ok(run.providerReadiness.some(provider => provider.id === "browser-secrets" && provider.state === "Blocked"));
    assert.ok(run.metrics.some(metric => metric.id === "providers" && metric.note === "Live calls disabled"));
    assert.ok(run.evidence.some(item => item.title === "AGENTS.md"));
    assert.ok(run.compositeScore >= 70);

    const markdown = api.buildMarkdownExport({
      mode: "review",
      prompt: "Evaluate a local provider-free SEIS AI demo.",
      promptVersion: "seis-review-v0.2",
      run
    });
    assert.match(markdown, /Provider Readiness/);
    assert.match(markdown, /Browser secret entry: Blocked/);
    assert.match(markdown, /Excluded categories/);

    const handoff = new URL(api.buildMacHandoffURL({
      mode: "security",
      prompt: "Review a local web to macOS bridge without provider keys.",
      promptVersion: "seis-security-v0.1",
      promptNotes: "Bridge smoke test",
      approvalRequired: true,
      redactSecrets: true,
      autonomyLevel: 2
    }));

    assert.equal(handoff.protocol, "seisdemo:");
    assert.equal(handoff.hostname, "ai-command-core");
    assert.equal(handoff.pathname, "/run");
    assert.equal(handoff.searchParams.get("source"), "web-demo");
    assert.equal(handoff.searchParams.get("mode"), "security");
    assert.equal(handoff.searchParams.get("promptVersion"), "seis-security-v0.1");
    assert.equal(handoff.searchParams.get("approval"), "1");
  } finally {
    dom.window.close();
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.Blob;
    global.URL = originalUrl;
  }
});

test("SEIS AI demo design system includes responsive and accessibility safeguards", async () => {
  const css = await readFile(new URL("styles.css", root), "utf8");

  for (const token of [
    "--bg",
    "--graphite",
    "--accent",
    "--ok",
    "--warn",
    "--bad",
    "--focus",
    "--radius"
  ]) {
    assert.ok(css.includes(token), `missing token: ${token}`);
  }

  assert.match(css, /@media \(max-width: 1180px\)/);
  assert.match(css, /@media \(max-width: 940px\)/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(css, /letter-spacing:\s*-/);
});

test("SEIS AI demo documents local-only execution", async () => {
  const readme = await readFile(new URL("README.md", root), "utf8");

  assert.match(readme, /local, deterministic demo application/);
  assert.match(readme, /AI Core Integration/);
  assert.match(readme, /contracts\/seis-ai-command-core-integration\.json/);
  assert.match(readme, /npm run check:seis-ai-local-integration/);
  assert.match(readme, /does not request, store, or use provider API keys/);
  assert.match(readme, /python3 -m http\.server 4177/);
});

test("SEIS AI demo is wired to the restored local AI Core contract spine", async () => {
  const integration = JSON.parse(
    await readFile(new URL("contracts/seis-ai-command-core-integration.json", root), "utf8")
  );
  const packageJson = JSON.parse(await readFile(new URL("../../package.json", root), "utf8"));
  const script = await readFile(new URL("script.js", root), "utf8");
  const serializedIntegration = JSON.stringify(integration);

  assert.equal(integration.contract_name, "SEIS AI Command Core Local Integration");
  assert.equal(integration.status, "local-fixture-backed");
  assert.ok(integration.boundaries.some(boundary => boundary.includes("No browser provider API key")));
  assert.ok(integration.surfaces.some(surface => surface.path === "apps/seis-demo-web"));
  assert.ok(integration.surfaces.some(surface => surface.path === "apps/seis-core"));

  for (const expectedPath of [
    "packages/shared-types/fixtures/ai-core-command-center-foundation.json",
    "packages/model-router/fixtures/model-router-route-contracts.json",
    "packages/prompt-engine/fixtures/assistant-surface-regression-suite.json",
    "packages/agent-runtime/fixtures/agent-runtime-task-lifecycle.json",
    "packages/tool-registry/fixtures/tool-registry-permissions.json",
    "packages/data/fixtures/knowledge-source-classification.json",
    "packages/repository-assistant/fixtures/local-readonly-repository-assistant.json"
  ]) {
    assert.ok(serializedIntegration.includes(expectedPath), `missing contract path: ${expectedPath}`);
  }

  assert.match(script, /AI Core contract spine/);
  assert.match(packageJson.scripts["check:seis-ai-local-integration"], /check:model-router-contracts/);
  assert.match(packageJson.scripts["check:seis-ai-command-core"], /check:seis-ai-local-integration/);
  assert.doesNotMatch(serializedIntegration, /\/Users\//);
});

test("SEIS demo website links into the local AI Command Core surface", async () => {
  const websiteHtml = await readFile(new URL("../seis-demo-web/index.html", root), "utf8");
  const websiteReadme = await readFile(new URL("../seis-demo-web/README.md", root), "utf8");
  const websiteScript = await readFile(new URL("../seis-demo-web/script.js", root), "utf8");
  const websiteContract = JSON.parse(
    await readFile(new URL("../seis-demo-web/contracts/seis-demo-contract.json", root), "utf8")
  );

  assert.match(websiteHtml, /Open AI Command Core/);
  assert.match(websiteHtml, /\.\.\/seis-ai-demo\//);
  assert.match(websiteReadme, /seis-ai-command-core-integration\.json/);
  assert.doesNotMatch(websiteReadme, /\/Users\//);

  assert.ok(websiteContract.linked_surfaces.some(surface => surface.id === "seis-ai-command-core"));
  assert.ok(websiteContract.scenarios.some(scenario => scenario.id === "seis-ai-command-core"));
  assert.match(websiteScript, /SEIS AI Command Core Bridge/);
});
