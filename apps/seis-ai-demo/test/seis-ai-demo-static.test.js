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
    "Prompts",
    "Knowledge",
    "Evals",
    "Approvals",
    "Audit",
    "Local demo mode",
    "No provider key connected",
    "Generate plan",
    "Run evaluation",
    "Approve"
  ]) {
    assert.ok(html.includes(label), `missing label: ${label}`);
  }

  assert.match(html, /id="composer-form"/);
  assert.match(html, /id="route-bars"/);
  assert.match(html, /id="agent-queue"/);
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
    assert.ok(run.evidence.some(item => item.title === "AGENTS.md"));
    assert.ok(run.compositeScore >= 70);
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
  assert.match(readme, /does not request, store, or use provider API keys/);
  assert.match(readme, /python3 -m http\.server 4177/);
});
