import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const root = new URL("../", import.meta.url);

async function renderCommandCenter({ width = 1440, height = 900 } = {}) {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");
  const fixture = await readFile(new URL("ai-core-contract-fixture.js", root), "utf8");

  const dom = new JSDOM(html, {
    pretendToBeVisual: true,
    runScripts: "outside-only",
    url: "https://seis.local/command-center"
  });

  Object.defineProperty(dom.window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(dom.window, "innerHeight", { configurable: true, value: height });
  dom.window.matchMedia = (query) => ({
    addEventListener() {},
    addListener() {},
    dispatchEvent: () => false,
    matches: query.includes("max-width: 900px") ? width <= 900 : false,
    media: query,
    onchange: null,
    removeEventListener() {},
    removeListener() {}
  });
  dom.window.structuredClone = globalThis.structuredClone;
  dom.window.eval(fixture);
  dom.window.eval(script);

  return dom;
}

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
  assert.match(html, /Goal Evidence Scorecards/);
  assert.match(html, /id="goal-evidence-scorecards"/);
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
  assert.match(script, /renderGoalEvidenceScorecards/);
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
  assert.match(script, /goalEvidenceGates/);
  assert.match(script, /goalOperatingScorecards/);
  assert.match(script, /matchesRetrievalQuery/);
  assert.match(script, /renderEmptyRetrievalState/);
  assert.match(script, /renderContractCard/);
  assert.match(script, /ai-core-boundary-grid/);
  assert.match(script, /ai-core-operating-model/);
  assert.match(script, /ai-core-retrieval-adapters/);
  assert.match(script, /ai-core-retrieval-results/);
  assert.match(script, /ai-core-no-content-transcripts/);
  assert.match(fixture, /task-ai-operating-model/);
  assert.match(fixture, /eval-ai-operating-model/);
  assert.match(fixture, /audit-ai-operating-model/);
  assert.match(fixture, /roadmap-year-1-ai-operating-model/);
  assert.match(fixture, /goal-five-year-development/);
  assert.match(fixture, /gate-five-year-operating-model-doc/);
  assert.match(fixture, /gate-five-year-agent-runtime-validation/);
  assert.match(fixture, /gate-five-year-command-center-surface/);
  assert.match(fixture, /gate-five-year-provider-boundary/);
  assert.match(fixture, /score-five-year-operating-model-current-slice/);
  assert.match(fixture, /score-token-feed-current-slice/);
  assert.match(fixture, /docs\/ai\/seis-ai-operating-model-5-year\.md/);
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
  assert.match(css, /goal-evidence-card/);
  assert.match(css, /goal-evidence-grid/);
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

test("SEIS Command Center local retrieval toolbar preserves desktop and mobile visual smoke contracts", async () => {
  const css = await readFile(new URL("styles.css", root), "utf8");
  const desktopRetrievalControls = css.match(/\.retrieval-controls \{[\s\S]*?\n\}/)?.[0] ?? "";
  const mobileBlock = css.match(/@media \(max-width: 900px\) \{[\s\S]*?(?=\n@media \(max-width: 620px\))/)?.[0] ?? "";

  assert.match(
    desktopRetrievalControls,
    /grid-template-columns: minmax\(220px, 1fr\) minmax\(150px, 190px\) minmax\(150px, 190px\) auto/
  );
  assert.match(mobileBlock, /\.retrieval-controls,\n  \.architecture-strip/);
  assert.match(mobileBlock, /grid-template-columns: 1fr/);
  assert.match(mobileBlock, /\.retrieval-filter-field input,\n  \.retrieval-filter-field select,\n  #ai-core-retrieval-reset/);
  assert.match(mobileBlock, /min-height: 44px/);

  for (const viewport of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 }
  ]) {
    const dom = await renderCommandCenter(viewport);
    const document = dom.window.document;
    const bodyText = document.body.textContent;
    const toolbar = document.querySelector(".retrieval-controls");
    const controls = [
      "#ai-core-retrieval-query",
      "#ai-core-retrieval-source-class",
      "#ai-core-retrieval-transcript-state",
      "#ai-core-retrieval-reset",
      "#ai-core-retrieval-filter-status"
    ].map((selector) => document.querySelector(selector));
    const adapters = document.querySelector("#ai-core-retrieval-adapters");
    const results = document.querySelector("#ai-core-retrieval-results");
    const transcripts = document.querySelector("#ai-core-no-content-transcripts");

    assert.match(bodyText, /SEIS Command Center/, `${viewport.name} body renders shell copy`);
    assert.match(bodyText, /Local Retrieval/, `${viewport.name} body renders retrieval heading`);
    assert.match(bodyText, /Retrieval Result Cards/, `${viewport.name} body renders result panel heading`);
    assert.match(bodyText, /No-Content Search Transcripts/, `${viewport.name} body renders transcript panel heading`);

    assert.equal(toolbar.getAttribute("role"), "group");
    assert.equal(toolbar.getAttribute("aria-labelledby"), "ai-core-local-retrieval-title");
    assert.equal(toolbar.getAttribute("aria-describedby"), "ai-core-retrieval-filter-status");
    assert.deepEqual(
      controls.map((control) => control?.id),
      [
        "ai-core-retrieval-query",
        "ai-core-retrieval-source-class",
        "ai-core-retrieval-transcript-state",
        "ai-core-retrieval-reset",
        "ai-core-retrieval-filter-status"
      ]
    );

    assert.match(adapters.textContent, /local-readonly-retrieval-query-adapter/);
    assert.match(results.textContent, /raw:false/);
    assert.match(results.textContent, /provider:false/);
    assert.match(transcripts.textContent, /0 results/);
    assert.doesNotMatch(
      document.querySelector("#ai-core-retrieval-filter-status").textContent,
      /^0 result cards, 0 no-content transcripts$/
    );
  }
});

test("SEIS Command Center renders AI operating model evidence gates", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const fixture = await readFile(new URL("ai-core-contract-fixture.js", root), "utf8");

  assert.match(html, /AI Operating Model/);
  assert.match(html, /id="ai-core-operating-model"/);
  assert.match(fixture, /goalEvidenceGates/);
  assert.match(fixture, /gate-five-year-operating-model-doc/);
  assert.match(fixture, /gate-five-year-agent-runtime-validation/);
  assert.match(fixture, /gate-five-year-command-center-surface/);
  assert.match(fixture, /gate-five-year-provider-boundary/);
  assert.match(fixture, /goalOperatingScorecards/);
  assert.match(fixture, /score-five-year-operating-model-current-slice/);

  for (const viewport of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 }
  ]) {
    const dom = await renderCommandCenter(viewport);
    const document = dom.window.document;
    const panel = document.querySelector("#ai-core-operating-model");
    const panelText = panel.textContent;

    assert.match(panelText, /Agent Runtime Agent/, `${viewport.name} panel renders operating-model task`);
    assert.match(panelText, /bounded subagent/, `${viewport.name} panel renders bounded subagent guardrail`);
    assert.match(panelText, /pass/, `${viewport.name} panel renders evaluation gate result`);
    assert.match(panelText, /metadata-only/, `${viewport.name} panel renders redaction boundary`);
    assert.match(panelText, /approval/, `${viewport.name} panel renders approval boundary language`);
    assert.match(panelText, /docs\/ai\/seis-ai-operating-model-5-year\.md/, `${viewport.name} panel renders evidence path`);
    assert.match(panelText, /Scorecard: Current Fixture Slice/, `${viewport.name} panel renders gate-derived scorecard`);
    assert.match(panelText, /100% required gate coverage/, `${viewport.name} panel renders derived score percentage`);
    assert.match(panelText, /4\/4 required/, `${viewport.name} panel renders required gate count`);
    assert.match(panelText, /Gate: Browser Evidence/, `${viewport.name} panel renders browser evidence gate`);
    assert.match(panelText, /Gate: Security Boundary/, `${viewport.name} panel renders security boundary gate`);
    assert.equal(panel.querySelectorAll("button").length, 0, `${viewport.name} panel adds no fake action buttons`);
    assert.doesNotMatch(panelText, /full goal complete/i);
    assert.doesNotMatch(panelText, /production orchestration ready/i);
    assert.doesNotMatch(panelText, /provider health available/i);
    assert.doesNotMatch(panelText, /SSH execution enabled/i);
    assert.doesNotMatch(panelText, /trained model/i);
  }
});

test("SEIS Command Center renders goal evidence scorecards in the Goals surface", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const script = await readFile(new URL("script.js", root), "utf8");

  assert.match(html, /Read-only gate coverage from AI Core contracts/);
  assert.match(script, /current fixture slice only/);
  assert.match(script, /not a live execution claim/);

  for (const viewport of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 }
  ]) {
    const dom = await renderCommandCenter(viewport);
    const document = dom.window.document;
    const panel = document.querySelector(".goal-evidence-panel");
    const panelText = panel.textContent;
    const expectedScorecardCount = dom.window.seisAiCoreContractFixture.goalOperatingScorecards.length;

    assert.match(panelText, /Scorecard: Current Fixture Slice/, `${viewport.name} Goals surface renders scorecard title`);
    assert.equal(
      panel.querySelectorAll("#goal-evidence-scorecards .goal-evidence-card").length,
      expectedScorecardCount,
      `${viewport.name} Goals surface renders all fixture scorecards`
    );
    assert.match(panelText, /100% required gate coverage/, `${viewport.name} Goals surface renders required gate percentage`);
    assert.match(panelText, /4\/4 required/, `${viewport.name} Goals surface renders five-year required gate count`);
    assert.match(panelText, /2\/2 required/, `${viewport.name} Goals surface renders token-feed required gate count`);
    assert.match(panelText, /docs\/ai\/seis-ai-operating-model-5-year\.md/, `${viewport.name} Goals surface renders five-year evidence path`);
    assert.match(panelText, /packages\/data\/fixtures\/seis-10m-token-feed-budget\.json/, `${viewport.name} Goals surface renders token-feed evidence path`);
    assert.match(panelText, /current fixture slice only/, `${viewport.name} Goals surface preserves fixture-slice label`);
    assert.match(panelText, /not a complete program claim/i, `${viewport.name} Goals surface rejects full-program overclaim`);
    assert.match(panelText, /Goal state/, `${viewport.name} Goals surface renders linked goal state`);
    assert.match(panelText, /Evidence/, `${viewport.name} Goals surface renders evidence path label`);
    assert.match(panelText, /Non-claim/, `${viewport.name} Goals surface renders non-claim guardrail`);
    assert.match(panelText, /Next safe action/, `${viewport.name} Goals surface renders next safe action`);
    assert.match(panelText, /Browser Evidence: pass/, `${viewport.name} Goals surface renders gate strip`);
    assert.match(panelText, /Fixture: pass/, `${viewport.name} Goals surface renders token-feed gate strip`);
    assert.equal(panel.querySelectorAll("button").length, 0, `${viewport.name} Goals surface adds no fake action buttons`);
    assert.doesNotMatch(panelText, /full goal complete/i);
    assert.doesNotMatch(panelText, /production orchestration ready/i);
    assert.doesNotMatch(panelText, /provider health available/i);
    assert.doesNotMatch(panelText, /SSH execution enabled/i);
    assert.doesNotMatch(panelText, /trained model/i);
    assert.doesNotMatch(panelText, /readiness/i);
  }
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
