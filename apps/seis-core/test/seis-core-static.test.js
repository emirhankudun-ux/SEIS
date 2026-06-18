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
  assert.match(script, /securityReports/);
  assert.match(script, /aiSystems/);
  assert.match(script, /operatingDomains/);
  assert.match(script, /platformPhases/);
  assert.match(script, /recentActivity/);
  assert.match(script, /dependencyRisk/);
  assert.match(script, /renderAgentDetail/);
  assert.match(script, /orchestrationLanes/);
  assert.match(script, /handoffAudit/);
  assert.match(script, /openCommandPalette/);
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
  assert.match(css, /automation-card/);
  assert.match(css, /security-card/);
  assert.match(css, /domain-card/);
  assert.match(css, /phase-row/);
  assert.match(css, /activity-row/);
  assert.match(css, /dependency-row/);
  assert.match(css, /agent-detail/);
  assert.match(css, /orchestration-card/);
  assert.match(css, /handoff-row/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /prefers-reduced-motion/);
});
