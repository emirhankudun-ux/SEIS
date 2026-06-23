import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

const root = process.cwd();
const appRoot = path.join(root, "apps", "seis-core");
const outputRootRelative = "reports/tmp/seis-core-ai-core-panel-navigation";
const outputRoot = path.join(root, ...outputRootRelative.split("/"));
const generatedAt = new Date().toISOString();
const storageKey = "seis-core-state-v1";

const scenarios = [
  {
    id: "desktop-ai-core-panel-navigation",
    label: "Desktop AI Core panel navigation",
    viewport: { width: 1440, height: 900 },
    state: {
      activeView: "dashboard",
      retrievalFilters: { query: "", sourceClass: "all", transcriptState: "all" }
    }
  },
  {
    id: "mobile-ai-core-panel-navigation",
    label: "Mobile AI Core panel navigation",
    viewport: { width: 390, height: 844 },
    state: {
      activeView: "dashboard",
      retrievalFilters: { query: "", sourceClass: "all", transcriptState: "all" }
    }
  }
];
let activeScenario = scenarios[0];

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".webmanifest", "application/manifest+json; charset=utf-8"]
]);

function fail(message) {
  console.error(`SEIS AI Core panel navigation QA failed: ${message}`);
  process.exit(1);
}

function findBrowserBinary() {
  const candidates = [
    process.env.SEIS_BROWSER_BIN,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
    "microsoft-edge"
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.includes(path.sep) && existsSync(candidate)) {
      return candidate;
    }

    if (!candidate.includes(path.sep)) {
      const whichResult = spawnSync("which", [candidate], { encoding: "utf8" });
      if (whichResult.status === 0) {
        return whichResult.stdout.trim();
      }
    }
  }

  return null;
}

function normalizeRequestPath(requestPath) {
  const decodedPath = decodeURIComponent(requestPath.split("?")[0]);
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  const filePath = path.normalize(path.join(appRoot, relativePath));

  if (!filePath.startsWith(appRoot)) {
    return null;
  }

  return filePath;
}

function scenarioHtml(scenario) {
  const stateJson = JSON.stringify(scenario.state).replaceAll("<", "\\u003c");
  const indexHtml = readFileSync(path.join(appRoot, "index.html"), "utf8");
  const seedScript = `<base href="/">
    <script>
      localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(stateJson)});
    </script>`;
  const qaScript = `\n  <script>${panelNavigationScript()}</script>`;

  return indexHtml
    .replace("<head>", `<head>${seedScript}`)
    .replace("</body>", `${qaScript}\n</body>`);
}

function panelNavigationScript() {
  return `
(() => {
  const appendReport = (report) => {
    const element = document.createElement("pre");
    element.id = "qa-ai-core-panel-navigation-report";
    element.dataset.status = report.status;
    element.textContent = JSON.stringify(report);
    document.body.append(element);
  };

  const run = () => {
    const report = {
      id: "ai-core-browser-panel-navigation-qa",
      status: "running",
      steps: [],
      panels: {},
      safety: {
        providerCallPerformed: false,
        rawContentReturned: false,
        persistentMemoryWrite: false,
        privilegedActionEnabled: false
      }
    };

    const assert = (condition, message) => {
      if (!condition) {
        throw new Error(message);
      }
    };
    const text = (selector) => document.querySelector(selector)?.textContent ?? "";
    const count = (selector) => document.querySelectorAll(selector).length;
    const click = (selector) => {
      const element = document.querySelector(selector);
      assert(element, "Missing clickable target: " + selector);
      element.click();
      return element;
    };
    const setInput = (selector, value) => {
      const element = document.querySelector(selector);
      assert(element, "Missing input target: " + selector);
      element.focus();
      element.value = value;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      return element;
    };
    const record = (step, extra = {}) => {
      report.steps.push({
        step,
        activeView: document.querySelector(".view-panel.is-active")?.dataset.panel ?? "",
        activeNav: document.querySelector(".nav-item.is-active")?.dataset.view ?? "",
        viewTitle: text("#view-title").trim(),
        activeElement: document.activeElement?.id || document.activeElement?.className || "",
        ...extra
      });
    };
    const assertAiCoreActive = (step) => {
      assert(document.querySelector('.view-panel.is-active')?.dataset.panel === "ai-core", step + " did not activate AI Core panel");
      assert(document.querySelector('.nav-item.is-active')?.dataset.view === "ai-core", step + " did not activate AI Core nav item");
      assert(text("#view-title").includes("AI Core"), step + " did not update the view title");
    };
    const assertGoalsActive = (step) => {
      assert(document.querySelector('.view-panel.is-active')?.dataset.panel === "goals", step + " did not activate Goals panel");
      assert(document.querySelector('.nav-item.is-active')?.dataset.view === "goals", step + " did not activate Goals nav item");
      assert(text("#view-kicker").includes("Goals"), step + " did not update the view kicker");
      assert(text("#view-title").includes("Goal tracking"), step + " did not update the view title");
    };
    const assertPanelText = (selector, requiredText, label) => {
      const value = text(selector);
      assert(value.trim().length > 0, label + " is empty");
      for (const expected of requiredText) {
        assert(value.includes(expected), label + " missing text: " + expected);
      }
      return value;
    };
    const assertAiCorePanels = () => {
      assertPanelText("#ai-core-summary-grid", ["Routes", "Tools", "Sources", "Retrieval", "Approvals", "Evidence"], "AI Core summary");
      assertPanelText("#ai-core-boundary-grid", [
        "No live model execution is performed",
        "No external provider call",
        "No provider key",
        "No GitHub push",
        "No benchmark"
      ], "AI Core safety boundary");
      assertPanelText("#ai-core-routes", ["repository-review", "local-only", "approval-needed", "external-provider-redacted"], "AI Core routes");
      assertPanelText("#ai-core-prompts", ["Repository Assistant", "Documentation Assistant", "assistant-surface-regression-suite"], "AI Core prompts");
      assertPanelText("#ai-core-agent-tasks", ["Documentation Agent", "Repository Intelligence Agent", "AI Systems Agent", "DevOps Agent"], "AI Core agent tasks");
      assertPanelText("#ai-core-approvals", ["external-provider-routing", "approval-needed", "critical", "blocked"], "AI Core approvals");
      assertPanelText("#ai-core-retrieval-adapters", ["Command Center Evidence Lookup", "provider:false", "memory:false"], "AI Core retrieval adapters");
      assertPanelText("#ai-core-retrieval-results", ["Official AI Core and Command Center docs", "raw:false", "provider:false"], "AI Core retrieval result cards");
      assertPanelText("#ai-core-no-content-transcripts", ["Show discarded assistant archive implementation code", "provider:false"], "AI Core no-content transcripts");
      assertPanelText("#ai-core-evidence", ["Evaluation:", "Audit:", "Source:", "Retrieval:", "No Content:"], "AI Core evidence");

      report.panels = {
        ...report.panels,
        summaryCards: count("#ai-core-summary-grid .metric-card"),
        boundaryCards: count("#ai-core-boundary-grid .boundary-card"),
        routeCards: count("#ai-core-routes .contract-card"),
        promptCards: count("#ai-core-prompts .contract-card"),
        agentTaskCards: count("#ai-core-agent-tasks .contract-card"),
        approvalCards: count("#ai-core-approvals .contract-card"),
        retrievalAdapterCards: count("#ai-core-retrieval-adapters .contract-card"),
        retrievalResultCards: count("#ai-core-retrieval-results .contract-card"),
        noContentTranscriptCards: count("#ai-core-no-content-transcripts .contract-card"),
        evidenceCards: count("#ai-core-evidence .contract-card")
      };

      assert(report.panels.summaryCards >= 10, "AI Core summary should expose 10 metric cards");
      assert(report.panels.routeCards >= 4, "AI Core routes should expose at least 4 route cards");
      assert(report.panels.promptCards >= 2, "AI Core prompts should expose at least 2 prompt cards");
      assert(report.panels.agentTaskCards >= 5, "AI Core agent tasks should expose at least 5 cards");
      assert(report.panels.approvalCards >= 5, "AI Core approvals should expose at least 5 cards");
      assert(report.panels.evidenceCards >= 10, "AI Core evidence should expose at least 10 cards");
    };
    const assertGoalEvidenceScorecards = () => {
      const fixture = window.seisAiCoreContractFixture ?? {};
      const panelText = assertPanelText(".goal-evidence-panel", [
        "Goal Evidence Scorecards",
        "Read-only gate coverage from AI Core contracts",
        "current fixture slice only",
        "not a complete program claim",
        "Scorecard: Current Fixture Slice",
        "100% required gate coverage",
        "4/4 required",
        "2/2 required",
        "docs/ai/seis-ai-operating-model-5-year.md",
        "packages/data/fixtures/seis-10m-token-feed-budget.json",
        "Goal state",
        "Evidence",
        "Non-claim",
        "Next safe action",
        "Browser Evidence: pass",
        "Fixture: pass"
      ], "Goals evidence scorecards");

      const scorecardCards = count("#goal-evidence-scorecards .goal-evidence-card");
      const expectedScorecards = fixture.goalOperatingScorecards?.length ?? 0;
      const gateChips = count("#goal-evidence-scorecards .goal-gate-strip .meta-chip");
      const expectedGates = fixture.goalEvidenceGates?.length ?? 0;
      const actionButtons = count(".goal-evidence-panel button");

      assert(expectedScorecards >= 2, "Goals evidence fixture should expose at least 2 scorecards");
      assert(scorecardCards === expectedScorecards, "Goals evidence scorecard count drifted from fixture");
      assert(expectedGates >= 6, "Goals evidence fixture should expose at least 6 gates");
      assert(gateChips === expectedGates, "Goals evidence gate chip count drifted from fixture");
      assert(actionButtons === 0, "Goals evidence scorecards must not expose action buttons");
      assert(!/full goal complete|production orchestration ready|provider health available|SSH execution enabled|trained model/i.test(panelText), "Goals evidence scorecards contain an unsafe completion or capability claim");

      report.panels = {
        ...report.panels,
        goalEvidenceCards: scorecardCards
      };
      report.goalEvidence = {
        scorecardCards,
        expectedScorecards,
        gateChips,
        expectedGates,
        actionButtons,
        fixtureSliceLabelPresent: panelText.includes("current fixture slice only"),
        nonClaimPresent: /not a complete program claim/i.test(panelText)
      };

      assert(report.panels.goalEvidenceCards >= 2, "Goals evidence scorecards should expose at least 2 cards");
    };

    try {
      assert(text("body").includes("SEIS Command Center"), "Command Center shell did not render");
      record("initial-dashboard");

      click('.sidebar-nav [data-view="goals"]');
      assertGoalsActive("sidebar goals navigation");
      assertGoalEvidenceScorecards();
      record("sidebar-goals-evidence", { panels: report.panels });

      click('[data-view="ai-core"]');
      assertAiCoreActive("sidebar navigation");
      assertAiCorePanels();
      record("sidebar-ai-core", { panels: report.panels });

      click('[data-view="dashboard"]');
      click("#open-command");
      setInput("#command-input", "AI Core");
      const aiCoreCommand = [...document.querySelectorAll("#command-results [data-view='ai-core']")][0];
      assert(aiCoreCommand, "Command palette did not expose AI Core result");
      aiCoreCommand.click();
      assertAiCoreActive("command palette navigation");
      record("command-palette-ai-core");

      click('[data-view="dashboard"]');
      const search = setInput("#global-search", "AI Core");
      assertAiCoreActive("global search navigation");
      assert(document.activeElement === search, "Global search focus was not preserved");
      record("global-search-ai-core");

      const appText = text(".app-frame");
      const forbiddenMarkers = [
        ["BEGIN OPENSSH", "PRIVATE KEY"].join(" "),
        ["OPENAI", "API", "KEY"].join("_"),
        ["ANTHROPIC", "API", "KEY"].join("_")
      ];
      assert(text("#ai-core-retrieval-filter-status").trim() === "3 result cards, 2 no-content transcripts", "Local Retrieval default status changed unexpectedly");
      for (const forbidden of forbiddenMarkers) {
        assert(!appText.includes(forbidden), "App surface includes forbidden sensitive marker");
      }

      report.status = "passed";
    } catch (error) {
      report.status = "failed";
      report.error = error instanceof Error ? error.message : String(error);
    } finally {
      appendReport(report);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
`;
}

function serveStaticApp() {
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    const scenarioMatch = requestUrl.pathname.match(/^\/qa\/scenario\/([A-Za-z0-9_-]+)\.html$/);
    const qaScenarioId = scenarioMatch?.[1] ?? requestUrl.searchParams.get("qa");

    if (requestUrl.pathname === "/" || requestUrl.pathname === "/index.html" || scenarioMatch) {
      const scenario = scenarioMatch ? scenarios.find((item) => item.id === qaScenarioId) : activeScenario;
      if (!scenario) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Unknown QA scenario");
        return;
      }

      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(scenarioHtml(scenario));
      return;
    }

    const filePath = normalizeRequestPath(requestUrl.pathname);
    if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "content-type": mimeTypes.get(path.extname(filePath)) ?? "application/octet-stream"
    });
    createReadStream(filePath).pipe(response);
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function runChrome(browserBinary, userDataDir, scenario, url) {
  const args = [
    "--headless",
    "--disable-background-networking",
    "--disable-dev-shm-usage",
    "--disable-extensions",
    "--disable-gpu",
    "--disable-sync",
    "--hide-scrollbars",
    "--metrics-recording-only",
    "--no-first-run",
    "--no-default-browser-check",
    "--run-all-compositor-stages-before-draw",
    "--timeout=5000",
    "--virtual-time-budget=10000",
    `--user-data-dir=${userDataDir}`,
    `--window-size=${scenario.viewport.width},${scenario.viewport.height}`,
    "--dump-dom",
    url
  ];

  return new Promise((resolve) => {
    const child = spawn(browserBinary, args, { stdio: ["ignore", "pipe", "pipe"] });
    const stdoutChunks = [];
    const stderrChunks = [];
    let timedOut = false;
    let completed = false;
    const finish = () => {
      if (completed) {
        return;
      }
      completed = true;
      child.kill("SIGKILL");
    };
    const readyInterval = setInterval(() => {
      if (Buffer.concat(stdoutChunks).toString("utf8").includes("</html>")) {
        finish();
      }
    }, 250);
    const timeout = setTimeout(() => {
      timedOut = true;
      finish();
    }, 45000);

    child.stdout.on("data", (chunk) => stdoutChunks.push(chunk));
    child.stderr.on("data", (chunk) => stderrChunks.push(chunk));
    child.on("error", (error) => {
      clearTimeout(timeout);
      clearInterval(readyInterval);
      fail(`${scenario.id} failed to start browser: ${error.message}`);
    });
    child.on("close", (code, signal) => {
      clearTimeout(timeout);
      clearInterval(readyInterval);
      if (timedOut) {
        fail(`${scenario.id} timed out after 45s`);
      }

      if (!completed && code !== 0) {
        const stderr = Buffer.concat(stderrChunks).toString("utf8");
        fail(`${scenario.id} failed with exit ${code ?? signal}: ${stderr.trim()}`);
      }

      const output = Buffer.concat(stdoutChunks).toString("utf8");
      if (!output.includes("</html>")) {
        fail(`${scenario.id} did not produce a complete DOM dump`);
      }

      resolve(output);
    });
  });
}

function decodeHtmlText(value) {
  return value
    .replaceAll("&quot;", "\"")
    .replaceAll("&#34;", "\"")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function extractNavigationReport(scenario, domText) {
  const marker = 'id="qa-ai-core-panel-navigation-report" data-status="';
  const markerIndex = domText.indexOf(marker);
  if (markerIndex === -1) {
    fail(`${scenario.id} DOM output missing AI Core panel navigation report`);
  }

  const contentStart = domText.indexOf(">", markerIndex) + 1;
  const contentEnd = domText.indexOf("</pre>", contentStart);
  if (contentStart === 0 || contentEnd === -1) {
    fail(`${scenario.id} DOM output has an incomplete panel navigation report`);
  }

  let report;
  try {
    report = JSON.parse(decodeHtmlText(domText.slice(contentStart, contentEnd)));
  } catch (error) {
    fail(`${scenario.id} panel navigation report was not valid JSON: ${error.message}`);
  }

  if (report.status !== "passed") {
    fail(`${scenario.id} panel navigation report failed: ${report.error ?? "unknown error"}`);
  }

  const expectedSteps = ["initial-dashboard", "sidebar-goals-evidence", "sidebar-ai-core", "command-palette-ai-core", "global-search-ai-core"];
  const actualSteps = report.steps.map((step) => step.step);
  if (actualSteps.join(",") !== expectedSteps.join(",")) {
    fail(`${scenario.id} panel navigation steps were ${actualSteps.join(",")}`);
  }

  for (const key of ["goalEvidenceCards", "routeCards", "promptCards", "agentTaskCards", "approvalCards", "evidenceCards"]) {
    if (!Number.isInteger(report.panels?.[key]) || report.panels[key] <= 0) {
      fail(`${scenario.id} panel navigation report has invalid ${key}`);
    }
  }

  for (const forbidden of [
    ["OPENAI", "API", "KEY"].join("_"),
    ["ANTHROPIC", "API", "KEY"].join("_"),
    ["BEGIN OPENSSH", "PRIVATE KEY"].join(" ")
  ]) {
    if (domText.includes(forbidden)) {
      fail(`${scenario.id} DOM output contains forbidden sensitive marker: ${forbidden}`);
    }
  }

  return report;
}

const browserBinary = findBrowserBinary();
if (!browserBinary) {
  fail("Chrome/Chromium browser binary not found. Set SEIS_BROWSER_BIN to run browser panel navigation QA.");
}

if (!existsSync(path.join(appRoot, "index.html"))) {
  fail("apps/seis-core/index.html not found");
}

rmSync(outputRoot, { force: true, recursive: true });
mkdirSync(outputRoot, { recursive: true });

const server = await serveStaticApp();
const address = server.address();
const port = address.port;
const runResults = [];

try {
  for (const scenario of scenarios) {
    const userDataDir = path.join(tmpdir(), `seis-core-panel-qa-${process.pid}-${scenario.id}`);
    rmSync(userDataDir, { force: true, recursive: true });
    mkdirSync(userDataDir, { recursive: true });

    activeScenario = scenario;
    const scenarioUrl = `http://127.0.0.1:${port}/`;
    const domPath = path.join(outputRoot, `${scenario.id}.html`);
    const reportPath = path.join(outputRoot, `${scenario.id}.json`);
    const domText = await runChrome(browserBinary, userDataDir, scenario, scenarioUrl);
    writeFileSync(domPath, domText);
    const report = extractNavigationReport(scenario, domText);
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

    runResults.push({
      id: scenario.id,
      label: scenario.label,
      viewport: scenario.viewport,
      domDump: path.relative(root, domPath),
      report: path.relative(root, reportPath),
      steps: report.steps.map((step) => ({
        step: step.step,
        activeView: step.activeView,
        activeNav: step.activeNav,
        viewTitle: step.viewTitle
      })),
      panels: report.panels,
      goalEvidence: report.goalEvidence
    });

    rmSync(userDataDir, { force: true, recursive: true });
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}

const manifest = {
  id: "seis-core-ai-core-browser-panel-navigation-qa",
  generatedAt,
  browser: {
    source: process.env.SEIS_BROWSER_BIN ? "SEIS_BROWSER_BIN" : "auto-detected",
    binaryName: path.basename(browserBinary)
  },
  app: "apps/seis-core",
  artifactRoot: outputRootRelative,
  scenarios: runResults,
  nonClaims: [
    "This is browser-run AI Core panel navigation QA evidence, not live provider or backend integration evidence.",
    "No live retrieval, model provider, embedding index, persistent memory write, raw-content return, GitHub write, SSH, deployment, payment, or infrastructure mutation is performed.",
    "Artifacts are written to reports/tmp and are intentionally ignored by Git."
  ]
};

writeFileSync(path.join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`SEIS AI Core panel navigation browser QA passed: ${runResults.length} scenarios`);
console.log(`Artifacts: ${path.relative(root, outputRoot)}`);
