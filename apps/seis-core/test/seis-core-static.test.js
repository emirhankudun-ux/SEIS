import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);

test("SEIS Command Center shell exposes required modules", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  for (const label of [
    "Dashboard",
    "Goals",
    "Repositories",
    "Documentation",
    "Agents",
    "AI Core",
    "Plugins",
    "Automation",
    "Security",
    "Architecture",
    "Knowledge"
  ]) {
    assert.match(html, new RegExp(`>${label}<`));
  }
  assert.match(html, /SEIS Command Center/);
  assert.match(html, /ai-core-contract-fixture\.js/);
  assert.match(html, /id="command-dialog"/);
  assert.match(html, /id="settings-dialog"/);
});

test("SEIS Command Center script implements local workflows", async () => {
  const script = await readFile(new URL("script.js", root), "utf8");
  const fixture = await readFile(new URL("ai-core-contract-fixture.js", root), "utf8");
  assert.match(script, /localStorage/);
  assert.match(script, /goal-form/);
  assert.match(script, /repositoryFilter/);
  assert.match(script, /activeAgent/);
  assert.match(script, /pluginFamilies/);
  assert.match(script, /automationWorkflows/);
  assert.match(script, /securityReports/);
  assert.match(script, /aiSystems/);
  assert.match(script, /aiCoreContract/);
  assert.match(script, /renderAiCore/);
  assert.match(script, /seisAiCoreContractFixture/);
  assert.match(fixture, /local-readonly-repository-assistant/);
  assert.match(fixture, /surface-repository-assistant/);
  assert.match(fixture, /ai-core-fixture-evaluation-report/);
  assert.match(script, /operatingDomains/);
  assert.match(script, /platformPhases/);
  assert.match(script, /openCommandPalette/);
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
  assert.match(css, /contract-card/);
  assert.match(css, /ai-core-layout/);
  assert.match(css, /automation-card/);
  assert.match(css, /security-card/);
  assert.match(css, /domain-card/);
  assert.match(css, /phase-row/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /prefers-reduced-motion/);
});
