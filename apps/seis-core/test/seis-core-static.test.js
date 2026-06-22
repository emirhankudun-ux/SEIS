import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

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
  assert.match(fixture, /model-router-route-contracts/);
  assert.match(fixture, /route-metadata-doc-summary/);
  assert.match(fixture, /agent-runtime-task-lifecycle/);
  assert.match(fixture, /task-provider-routing-approval-needed/);
  assert.match(fixture, /tool-registry-permissions/);
  assert.match(fixture, /tool-github-pr-publish/);
  assert.match(script, /toolRegistryEntries/);
  assert.match(fixture, /knowledge-source-classification/);
  assert.match(fixture, /knowledge-discarded-assistant-archive/);
  assert.match(script, /knowledgeSources/);
  assert.match(script, /retrievalQueryAdapters/);
  assert.match(script, /retrievalFilters/);
  assert.match(script, /retrievalResultCards/);
  assert.match(script, /noContentSearchTranscripts/);
  assert.match(script, /matchesRetrievalQuery/);
  assert.match(script, /renderEmptyRetrievalState/);
  assert.match(script, /renderContractCard/);
  assert.match(script, /ai-core-boundary-grid/);
  assert.match(script, /ai-core-retrieval-adapters/);
  assert.match(script, /ai-core-retrieval-results/);
  assert.match(script, /ai-core-no-content-transcripts/);
  assert.match(script, /Browser Local State/);
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
  assert.match(css, /boundary-card/);
  assert.match(css, /action-boundary/);
  assert.match(css, /ai-core-layout/);
  assert.match(css, /retrieval-filter-field input:focus-visible/);
  assert.match(css, /retrieval-filter-field select:focus-visible/);
  assert.match(css, /outline: 3px solid rgba\(64, 120, 255, 0\.22\)/);
  assert.match(css, /box-shadow: 0 0 0 1px rgba\(64, 120, 255, 0\.16\)/);
  assert.match(css, /automation-card/);
  assert.match(css, /security-card/);
  assert.match(css, /domain-card/);
  assert.match(css, /phase-row/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("SEIS Command Center local retrieval filters have mobile viewport coverage", async () => {
  const css = await readFile(new URL("styles.css", root), "utf8");
  const mobileBlock = css.match(/@media \(max-width: 900px\) \{[\s\S]*?(?=\n@media \(max-width: 620px\))/)?.[0] ?? "";

  assert.match(mobileBlock, /\.retrieval-controls/);
  assert.match(mobileBlock, /grid-template-columns: 1fr/);
  assert.match(mobileBlock, /#ai-core-retrieval-reset/);
  assert.match(mobileBlock, /min-height: 44px/);
  assert.match(mobileBlock, /width: 100%/);
});

test("SEIS Command Center exposes local-only retrieval boundaries", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");
  const fixture = await readFile(new URL("ai-core-contract-fixture.js", root), "utf8");

  assert.match(html, /Local Retrieval/);
  assert.match(html, /No content ingestion/);
  assert.match(html, /Retrieval Result Cards/);
  assert.match(html, /No-Content Search Transcripts/);
  assert.match(html, /id="ai-core-retrieval-query"/);
  assert.match(html, /id="ai-core-retrieval-source-class"/);
  assert.match(html, /id="ai-core-retrieval-transcript-state"/);
  assert.match(html, /id="ai-core-retrieval-reset"/);
  assert.match(html, /id="ai-core-retrieval-filter-status"/);
  assert.match(html, /role="group" aria-labelledby="ai-core-local-retrieval-title" aria-describedby="ai-core-retrieval-filter-status"/);
  assert.match(html, /aria-controls="ai-core-retrieval-results ai-core-no-content-transcripts"/);
  assert.match(html, /Safety Boundary/);
  assert.match(fixture, /local-readonly-retrieval-query-adapter/);
  assert.match(fixture, /local-readonly-retrieval-search-transcript/);
  assert.match(fixture, /filter-local-retrieval-query/);
  assert.match(fixture, /empty-state-no-matching-source-class/);
  assert.match(fixture, /expectedResultMessage/);
  assert.match(fixture, /expectedTranscriptMessage/);
  assert.match(fixture, /result-official-ai-core-docs/);
  assert.match(fixture, /transcript-blocked-discarded-archive/);
  assert.match(fixture, /adapter-command-center-evidence/);
  assert.match(fixture, /adapter-discarded-archive-block/);
  assert.match(fixture, /rawContentReturned: false|\"rawContentReturned\": false/);
  assert.match(fixture, /providerCallPerformed: false|\"providerCallPerformed\": false/);
  assert.match(fixture, /browserReceivesProviderKey: false|\"browserReceivesProviderKey\": false/);
  assert.match(fixture, /writesPersistentMemory: false|\"writesPersistentMemory\": false/);
  assert.match(script, /No live model execution is performed/);
  assert.match(script, /No local metadata card matches the current filters/);
  assert.match(script, /No local no-content transcript matches the current filters/);
  assert.match(script, /No GitHub push, merge, PR mutation, SSH command, deployment, payment, or infrastructure mutation is enabled/);
});

test("SEIS Command Center local retrieval filters render empty states and reset", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");
  const fixture = await readFile(new URL("ai-core-contract-fixture.js", root), "utf8");

  const dom = new JSDOM(html, {
    runScripts: "outside-only",
    url: "https://seis.local/command-center"
  });
  dom.window.structuredClone = globalThis.structuredClone;
  dom.window.eval(fixture);
  dom.window.eval(script);

  const document = dom.window.document;
  const dispatch = (element, eventName) => {
    element.dispatchEvent(new dom.window.Event(eventName, { bubbles: true }));
  };

  const queryInput = document.querySelector("#ai-core-retrieval-query");
  const sourceSelect = document.querySelector("#ai-core-retrieval-source-class");
  const transcriptSelect = document.querySelector("#ai-core-retrieval-transcript-state");
  const resetButton = document.querySelector("#ai-core-retrieval-reset");

  queryInput.focus();
  queryInput.value = "official docs";
  dispatch(queryInput, "input");
  assert.equal(document.activeElement, queryInput);

  sourceSelect.focus();
  sourceSelect.value = "scan-generated";
  dispatch(sourceSelect, "change");
  assert.equal(document.activeElement, sourceSelect);

  transcriptSelect.focus();
  transcriptSelect.value = "empty";
  dispatch(transcriptSelect, "change");
  assert.equal(document.activeElement, transcriptSelect);

  assert.match(
    document.querySelector("#ai-core-retrieval-results").textContent,
    /No local metadata card matches the current filters/
  );
  assert.match(
    document.querySelector("#ai-core-no-content-transcripts").textContent,
    /No local no-content transcript matches the current filters/
  );
  assert.match(
    document.querySelector("#ai-core-retrieval-filter-status").textContent,
    /0 result cards, 0 no-content transcripts/
  );

  resetButton.focus();
  resetButton.click();
  assert.equal(document.activeElement, resetButton);

  assert.equal(queryInput.value, "");
  assert.equal(sourceSelect.value, "all");
  assert.equal(transcriptSelect.value, "all");
  assert.match(
    document.querySelector("#ai-core-retrieval-filter-status").textContent,
    /[1-9]\d* result cards, [1-9]\d* no-content transcripts/
  );
});

test("SEIS Command Center local retrieval filters preserve keyboard focus order", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");
  const fixture = await readFile(new URL("ai-core-contract-fixture.js", root), "utf8");

  const dom = new JSDOM(html, {
    runScripts: "outside-only",
    url: "https://seis.local/command-center"
  });
  dom.window.structuredClone = globalThis.structuredClone;
  dom.window.eval(fixture);
  dom.window.eval(script);

  const document = dom.window.document;
  const focusableRetrievalControls = [
    "#ai-core-retrieval-query",
    "#ai-core-retrieval-source-class",
    "#ai-core-retrieval-transcript-state",
    "#ai-core-retrieval-reset"
  ].map((selector) => document.querySelector(selector));
  const controlsInDomOrder = [...document.querySelectorAll(".retrieval-controls input, .retrieval-controls select, .retrieval-controls button")];

  assert.deepEqual(controlsInDomOrder, focusableRetrievalControls);
  assert.equal(document.querySelector(".retrieval-controls").getAttribute("role"), "group");
  assert.equal(document.querySelector(".retrieval-controls").getAttribute("aria-labelledby"), "ai-core-local-retrieval-title");
  assert.equal(document.querySelector(".retrieval-controls").getAttribute("aria-describedby"), "ai-core-retrieval-filter-status");

  for (const control of focusableRetrievalControls) {
    control.focus();
    assert.equal(document.activeElement, control);
    assert.equal(control.getAttribute("aria-controls"), "ai-core-retrieval-results ai-core-no-content-transcripts");
  }

  assert.equal(document.querySelector("#ai-core-retrieval-query").getAttribute("type"), "search");
  assert.equal(document.querySelector("#ai-core-retrieval-filter-status").getAttribute("aria-live"), "polite");
});

test("SEIS Command Center browser bundle does not contain live provider or secret transport hooks", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");
  const fixture = await readFile(new URL("ai-core-contract-fixture.js", root), "utf8");
  const bundle = `${html}\n${script}\n${fixture}`;

  for (const pattern of [
    /\bfetch\s*\(/,
    /\bXMLHttpRequest\b/,
    /\bWebSocket\b/,
    /\bEventSource\b/,
    /\bsendBeacon\b/,
    /Authorization/i,
    /Bearer\s+[A-Za-z0-9._-]+/,
    /(^|[^A-Za-z0-9_-])sk-[A-Za-z0-9_-]{20,}/,
    /API_KEY/,
    /\.env/
  ]) {
    assert.doesNotMatch(bundle, pattern);
  }
});
