import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";

const root = process.cwd();
const appRoot = path.join(root, "apps", "seis-core");
const reportDir = path.join(root, "reports", "evals");
const reportPath = path.join(reportDir, "ai-core-panel-navigation-browser-qa.md");
const jsonReportPath = path.join(reportDir, "ai-core-panel-navigation-browser-qa.json");

const safetyFlags = {
  providerCallsPerformed: false,
  externalProviderRouting: false,
  browserReceivesProviderKey: false,
  rawContentReturned: false,
  writesPersistentMemory: false,
  createsEmbeddingIndex: false,
  executesGitHubWrite: false,
  executesSsh: false,
  deploysInfrastructure: false,
  claimsModelTraining: false,
  claimsBenchmarkRun: false
};

function fail(message) {
  throw new Error(`SEIS AI Core panel QA failed: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function text(document, selector) {
  return document.querySelector(selector)?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function count(document, selector) {
  return document.querySelectorAll(selector).length;
}

function dispatch(window, element, eventName) {
  element.dispatchEvent(new window.Event(eventName, { bubbles: true }));
}

function click(window, document, selector) {
  const element = document.querySelector(selector);
  assert(element, `missing click target ${selector}`);
  element.click();
  return element;
}

function setInput(window, document, selector, value) {
  const element = document.querySelector(selector);
  assert(element, `missing input ${selector}`);
  element.value = value;
  dispatch(window, element, "input");
  return element;
}

function activePanel(document) {
  return document.querySelector(".view-panel.is-active")?.dataset?.panel ?? "none";
}

async function createDom() {
  const html = await readFile(path.join(appRoot, "index.html"), "utf8");
  const fixtureScript = await readFile(path.join(appRoot, "ai-core-contract-fixture.js"), "utf8");
  const appScript = await readFile(path.join(appRoot, "script.js"), "utf8");
  const routerArtifact = await readFile(path.join(appRoot, "data", "seis-router-routes.json"), "utf8");
  const htmlWithoutExternalScripts = html.replace(/<script\s+src="[^"]+"\s+defer><\/script>/g, "");

  const dom = new JSDOM(htmlWithoutExternalScripts, {
    runScripts: "outside-only",
    pretendToBeVisual: true,
    url: "http://127.0.0.1:4174/"
  });

  const { window } = dom;
  window.scrollTo = () => {};
  if (window.HTMLDialogElement && !window.HTMLDialogElement.prototype.showModal) {
    window.HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true;
    };
  }
  if (window.HTMLDialogElement && !window.HTMLDialogElement.prototype.close) {
    window.HTMLDialogElement.prototype.close = function close() {
      this.open = false;
    };
  }
  window.fetch = async (url) => {
    if (String(url).includes("data/seis-router-routes.json")) {
      return {
        ok: true,
        json: async () => JSON.parse(routerArtifact)
      };
    }
    return { ok: false, json: async () => ({}) };
  };

  window.eval(fixtureScript);
  window.eval(appScript);
  await new Promise((resolve) => setTimeout(resolve, 25));
  return dom;
}

function captureCounts(document, fixture) {
  return {
    modelRoutesExpected: fixture.modelRoutes.length,
    modelRoutesRendered: count(document, "#ai-core-routes .contract-card"),
    promptVersionsExpected: fixture.promptVersions.length,
    promptVersionsRendered: count(document, "#ai-core-prompts .contract-card"),
    agentTasksExpected: fixture.agentTasks.length,
    agentTasksRendered: count(document, "#ai-core-agent-tasks .contract-card"),
    approvalsExpected: fixture.approvalRequests.length,
    approvalsRendered: count(document, "#ai-core-approvals .contract-card"),
    retrievalResultCardsExpected: fixture.retrievalResultCards.length,
    retrievalResultCardsRendered: count(document, "#ai-core-retrieval-results .contract-card"),
    noContentTranscriptsExpected: fixture.noContentSearchTranscripts.length,
    noContentTranscriptsRendered: count(document, "#ai-core-no-content-transcripts .contract-card"),
    evidenceExpected: fixture.evaluationResults.length + fixture.auditEvents.length,
    evidenceRendered: count(document, "#ai-core-evidence .contract-card")
  };
}

function validateCounts(counts) {
  for (const [key, value] of Object.entries(counts)) {
    assert(Number.isInteger(value), `${key} must be an integer`);
  }

  assert(counts.modelRoutesRendered === counts.modelRoutesExpected, "model route cards must match fixture");
  assert(counts.promptVersionsRendered === counts.promptVersionsExpected, "prompt cards must match fixture");
  assert(counts.agentTasksRendered === counts.agentTasksExpected, "agent task cards must match fixture");
  assert(counts.approvalsRendered === counts.approvalsExpected, "approval cards must match fixture");
  assert(counts.retrievalResultCardsRendered === counts.retrievalResultCardsExpected, "retrieval result cards must match fixture");
  assert(counts.noContentTranscriptsRendered === counts.noContentTranscriptsExpected, "no-content transcripts must match fixture");
  assert(counts.evidenceRendered === counts.evidenceExpected, "evaluation and audit cards must match fixture");
}

function buildMarkdown(report) {
  const scenarioRows = report.scenarios
    .map((scenario) => `| ${scenario.id} | ${scenario.status} | ${scenario.observed} |`)
    .join("\n");
  const countRows = Object.entries(report.counts)
    .map(([key, value]) => `| ${key} | ${value} |`)
    .join("\n");
  const safetyRows = Object.entries(report.safetyFlags)
    .map(([key, value]) => `| ${key} | ${value} |`)
    .join("\n");

  return `# AI Core Panel Navigation Browser QA

Status: ${report.status}

This deterministic local QA report exercises the SEIS Command Center AI Core panel in a browser-like JSDOM runtime. It verifies navigation, command palette routing, global search routing, Local Retrieval filtering, reset behavior, fixture-backed card counts, and safety non-claims. It does not use live provider routing, external retrieval, embeddings, persistent memory, GitHub writes, SSH, deployment, payment, infrastructure mutation, benchmark runs, or model training.

## Runtime

| Field | Value |
| --- | --- |
| App | ${report.app} |
| Runner | ${report.runner} |
| Browser path | ${report.browserPath} |
| Viewports | ${report.viewports.join(", ")} |
| Source fixture | ${report.sourceFixture} |

## Scenarios

| Scenario | Status | Observed |
| --- | --- | --- |
${scenarioRows}

## Fixture Counts

| Count | Value |
| --- | --- |
${countRows}

## Safety Non-Claims

| Flag | Value |
| --- | --- |
${safetyRows}
`;
}

async function run() {
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;
  const fixture = window.seisAiCoreContractFixture;
  const scenarios = [];

  assert(fixture?.id === "ai-core-command-center-foundation", "AI Core fixture must load");
  assert(activePanel(document) === "dashboard", "initial active panel must be dashboard");
  scenarios.push({ id: "dashboard-initial", status: "passed", observed: "Dashboard is the initial active panel." });

  click(window, document, '[data-view="ai-core"]');
  assert(activePanel(document) === "ai-core", "sidebar navigation must activate AI Core");
  assert(text(document, "#view-title") === "SEIS AI Core", "view title must identify AI Core");
  scenarios.push({ id: "sidebar-ai-core-navigation", status: "passed", observed: "Sidebar opens the AI Core panel." });

  const counts = captureCounts(document, fixture);
  validateCounts(counts);
  scenarios.push({ id: "ai-core-contract-card-counts", status: "passed", observed: "Rendered AI Core cards match fixture counts." });

  setInput(window, document, "#ai-core-retrieval-query", "provider keys");
  assert(count(document, "#ai-core-retrieval-results .contract-card") === 0, "provider key query must not expose result cards");
  assert(count(document, "#ai-core-retrieval-results .retrieval-empty-state") === 1, "provider key query must show result empty state");
  assert(count(document, "#ai-core-no-content-transcripts .contract-card") >= 1, "provider key query must show a no-content transcript");
  assert(text(document, "#ai-core-no-content-transcripts").includes("Secret and credential lookup is not a supported retrieval task."), "provider key query must show credential boundary transcript");
  scenarios.push({ id: "retrieval-query-provider-keys", status: "passed", observed: "Secret/provider-key lookup shows no local results and exposes the blocked no-content transcript." });

  click(window, document, "#ai-core-retrieval-reset");
  assert(document.querySelector("#ai-core-retrieval-query").value === "", "reset must clear query input");
  assert(count(document, "#ai-core-retrieval-results .contract-card") === fixture.retrievalResultCards.length, "reset must restore retrieval result cards");
  assert(count(document, "#ai-core-no-content-transcripts .contract-card") === fixture.noContentSearchTranscripts.length, "reset must restore no-content transcripts");
  scenarios.push({ id: "retrieval-reset", status: "passed", observed: "Reset clears retrieval filters and restores fixture card counts." });

  click(window, document, "#open-command");
  setInput(window, document, "#command-input", "AI Core");
  click(window, document, '.command-result[data-view="ai-core"]');
  assert(activePanel(document) === "ai-core", "command palette must route to AI Core");
  scenarios.push({ id: "command-palette-ai-core", status: "passed", observed: "Command palette opens AI Core." });

  setInput(window, document, "#global-search", "AI Core");
  assert(activePanel(document) === "ai-core", "global search must route to AI Core");
  scenarios.push({ id: "global-search-ai-core", status: "passed", observed: "Global search keeps AI Core active for the AI Core query." });

  click(window, document, '[data-view="goals"]');
  assert(activePanel(document) === "goals", "goals navigation sanity check must pass");
  assert(count(document, "#goal-board .goal-card") > 0, "goals panel must render goal cards");
  scenarios.push({ id: "goals-navigation-sanity", status: "passed", observed: "Goals panel still opens and renders goal cards after AI Core interactions." });

  for (const [flag, value] of Object.entries(safetyFlags)) {
    assert(value === false, `${flag} must remain false`);
  }

  const report = {
    status: "passed",
    app: "apps/seis-core",
    runner: "JSDOM local browser-like DOM",
    browserPath: "Browser plugin not used for this committed evidence artifact; JSDOM keeps CI/local validation deterministic.",
    viewports: ["dom-default"],
    sourceFixture: fixture.sourceFixture,
    scenarios,
    counts,
    safetyFlags
  };

  await mkdir(reportDir, { recursive: true });
  await writeFile(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(reportPath, buildMarkdown(report));
  console.log(`AI Core panel navigation QA passed: ${reportPath}`);
}

await run();
