import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("SEIS Agent Workforce Console exposes required dry-run surfaces", async () => {
  const html = await read("agent-workforce.html");
  for (const marker of [
    "SEIS Agent Workforce Console",
    "data-seis-agent-workforce=\"browser-local-dry-run\"",
    "Local Demo mode - no provider calls",
    "Mission intake",
    "Agent workforce",
    "Safety gates",
    "Dry-run queue",
    "Mock vs real status",
    "approval-needed",
    "providerCalled: false"
  ]) {
    assert.match(html, new RegExp(marker));
  }
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /<main id="main"/);
});

test("SEIS Agent Workforce Console script is local-only and covers required agents", async () => {
  const script = await read("agent-workforce.js");
  for (const agent of [
    "Architect Agent",
    "Code Agent",
    "Design Agent",
    "UI/UX Agent",
    "Research Agent",
    "Search Agent",
    "Security Agent",
    "DevOps Agent",
    "Documentation Agent",
    "QA Agent",
    "Cloud Agent",
    "Automation Agent",
    "Clean-Room Agent",
    "PR Rescue Agent",
    "Local AI Agent",
    "Plugin Agent",
    "Accessibility Agent",
    "Product Strategy Agent"
  ]) {
    assert.match(script, new RegExp(agent.replace(/[/-]/g, "\\$&")));
  }
  for (const marker of [
    "localStorage",
    "seis.agent.workforce.console.v1",
    "executionPerformed: false",
    "providerCalled: false",
    "credentialRead: false",
    "githubMutation: false",
    "sshExecuted: false",
    "dry-run-only"
  ]) {
    assert.match(script, new RegExp(marker));
  }
  for (const forbidden of ["fetch(", "XMLHttpRequest", "WebSocket", "EventSource", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY", "BEGIN OPENSSH", "PRIVATE KEY"]) {
    assert.equal(script.includes(forbidden), false, `${forbidden} must not appear`);
  }
});

test("SEIS Agent Workforce Console styles preserve premium responsive accessibility", async () => {
  const css = await read("agent-workforce.css");
  for (const marker of ["prefers-reduced-motion", "skip-link", "agent-grid", "hero-panel", "ledger-grid", "@media (max-width: 920px)", "--cyan", "--gold", "--radius"]) {
    assert.match(css, new RegExp(marker.replace(/[()]/g, "\\$&")));
  }
});
