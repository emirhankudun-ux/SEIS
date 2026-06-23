import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

const root = process.cwd();
const appRoot = path.join(root, "apps", "seis-core");
const outputRoot = path.join(root, "reports", "tmp", "seis-core-local-retrieval-visual");
const generatedAt = new Date().toISOString();
const storageKey = "seis-core-state-v1";

const scenarios = [
  {
    id: "desktop-default",
    label: "Desktop default Local Retrieval",
    viewport: { width: 1440, height: 900 },
    captureViewport: { width: 1440, height: 8200 },
    state: {
      activeView: "ai-core",
      retrievalFilters: { query: "", sourceClass: "all", transcriptState: "all" }
    },
    expectedText: [
      "Local Retrieval",
      "3 result cards, 2 no-content transcripts",
      "local-readonly-retrieval-query-adapter",
      "raw:false",
      "provider:false"
    ]
  },
  {
    id: "desktop-empty-filter",
    label: "Desktop empty-state filter",
    viewport: { width: 1440, height: 900 },
    captureViewport: { width: 1440, height: 8200 },
    state: {
      activeView: "ai-core",
      retrievalFilters: { query: "official docs", sourceClass: "scan-generated", transcriptState: "empty" }
    },
    expectedText: [
      "Local Retrieval",
      "0 result cards, 0 no-content transcripts",
      "No local metadata card matches the current filters",
      "No local no-content transcript matches the current filters",
      "fixture-backed"
    ]
  },
  {
    id: "mobile-credential-filter",
    label: "Mobile credential boundary filter",
    viewport: { width: 390, height: 844 },
    captureViewport: { width: 390, height: 8200 },
    state: {
      activeView: "ai-core",
      retrievalFilters: { query: "credentials", sourceClass: "all", transcriptState: "all" }
    },
    expectedText: [
      "Local Retrieval",
      "0 result cards, 1 no-content transcripts",
      "No local metadata card matches the current filters",
      "Search provider keys or local private credentials",
      "raw:false",
      "provider:false"
    ]
  }
];

const interactionScenarios = [
  {
    id: "desktop-interaction",
    label: "Desktop Local Retrieval interaction flow",
    viewport: { width: 1440, height: 900 },
    state: {
      activeView: "ai-core",
      retrievalFilters: { query: "", sourceClass: "all", transcriptState: "all" }
    }
  },
  {
    id: "mobile-interaction",
    label: "Mobile Local Retrieval interaction flow",
    viewport: { width: 390, height: 844 },
    state: {
      activeView: "ai-core",
      retrievalFilters: { query: "", sourceClass: "all", transcriptState: "all" }
    }
  }
];

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".webmanifest", "application/manifest+json; charset=utf-8"]
]);

function fail(message) {
  console.error(`SEIS Local Retrieval visual QA failed: ${message}`);
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

function scenarioHtml(scenario, options = {}) {
  const stateJson = JSON.stringify(scenario.state).replaceAll("<", "\\u003c");
  const indexHtml = readFileSync(path.join(appRoot, "index.html"), "utf8");
  const seedScript = `<base href="/">
    <script>
      localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(stateJson)});
    </script>`;
  const interactionScript = options.includeInteractionScript
    ? `\n  <script src="/qa/local-retrieval-interaction.js" defer></script>`
    : "";

  return indexHtml
    .replace("<head>", `<head>${seedScript}`)
    .replace("</body>", `${interactionScript}\n</body>`);
}

function interactionScript() {
  return `
(() => {
  const expectedStatuses = {
    initial: "3 result cards, 2 no-content transcripts",
    afterQuery: "1 result cards, 0 no-content transcripts",
    afterSourceClass: "0 result cards, 0 no-content transcripts",
    afterTranscriptState: "0 result cards, 0 no-content transcripts",
    afterCredentialQuery: "0 result cards, 1 no-content transcripts",
    afterReset: "3 result cards, 2 no-content transcripts"
  };

  const appendReport = (report) => {
    const element = document.createElement("pre");
    element.id = "qa-local-retrieval-interaction-report";
    element.dataset.status = report.status;
    element.textContent = JSON.stringify(report);
    document.body.append(element);
  };

  const run = () => {
    const report = {
      id: "local-retrieval-browser-interaction-qa",
      status: "running",
      steps: [],
      safety: {
        providerCallPerformed: false,
        rawContentReturned: false,
        persistentMemoryWrite: false
      }
    };

    try {
      const query = document.querySelector("#ai-core-retrieval-query");
      const sourceClass = document.querySelector("#ai-core-retrieval-source-class");
      const transcriptState = document.querySelector("#ai-core-retrieval-transcript-state");
      const reset = document.querySelector("#ai-core-retrieval-reset");
      const status = document.querySelector("#ai-core-retrieval-filter-status");
      const results = document.querySelector("#ai-core-retrieval-results");
      const transcripts = document.querySelector("#ai-core-no-content-transcripts");
      const required = { query, sourceClass, transcriptState, reset, status, results, transcripts };

      for (const [name, element] of Object.entries(required)) {
        if (!element) {
          throw new Error("Missing Local Retrieval control: " + name);
        }
      }

      const dispatch = (element, type) => element.dispatchEvent(new Event(type, { bubbles: true }));
      const record = (step, expectedStatus, requirements = {}) => {
        const actualStatus = status.textContent.trim();
        const activeControl = document.activeElement?.id ?? "";
        if (actualStatus !== expectedStatus) {
          throw new Error(step + " expected status " + expectedStatus + " but saw " + actualStatus);
        }
        const stepReport = {
          step,
          status: actualStatus,
          query: query.value,
          sourceClass: sourceClass.value,
          transcriptState: transcriptState.value,
          activeControl,
          resultHasProviderFalse: results.textContent.includes("provider:false"),
          resultHasRawFalse: results.textContent.includes("raw:false"),
          transcriptHasProviderFalse: transcripts.textContent.includes("provider:false"),
          transcriptHasRawFalse: transcripts.textContent.includes("raw:false")
        };
        if (requirements.resultSafety && (!stepReport.resultHasProviderFalse || !stepReport.resultHasRawFalse)) {
          throw new Error(step + " lost result safety chips");
        }
        if (requirements.transcriptSafety && (!stepReport.transcriptHasProviderFalse || !stepReport.transcriptHasRawFalse)) {
          throw new Error(step + " lost transcript safety chips");
        }
        report.steps.push(stepReport);
      };

      record("initial", expectedStatuses.initial, { resultSafety: true, transcriptSafety: true });

      query.focus();
      query.value = "Command Center docs";
      dispatch(query, "input");
      record("after-query", expectedStatuses.afterQuery, { resultSafety: true });

      sourceClass.focus();
      sourceClass.value = "scan-generated";
      dispatch(sourceClass, "change");
      record("after-source-class", expectedStatuses.afterSourceClass);

      transcriptState.focus();
      transcriptState.value = "empty";
      dispatch(transcriptState, "change");
      record("after-transcript-state", expectedStatuses.afterTranscriptState);

      sourceClass.focus();
      sourceClass.value = "all";
      dispatch(sourceClass, "change");
      transcriptState.focus();
      transcriptState.value = "all";
      dispatch(transcriptState, "change");
      query.focus();
      query.value = "credentials";
      dispatch(query, "input");
      record("after-credential-query", expectedStatuses.afterCredentialQuery, { transcriptSafety: true });

      reset.focus();
      reset.click();
      record("after-reset", expectedStatuses.afterReset, { resultSafety: true, transcriptSafety: true });

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
    const qaScenarioId = requestUrl.searchParams.get("qa");
    const qaInteractionId = requestUrl.searchParams.get("interaction");

    if ((requestUrl.pathname === "/" || requestUrl.pathname === "/index.html") && qaScenarioId) {
      const scenario = [...scenarios, ...interactionScenarios].find((item) => item.id === qaScenarioId);
      if (!scenario) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Unknown QA scenario");
        return;
      }

      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(scenarioHtml(scenario, { includeInteractionScript: qaInteractionId === "local-retrieval" }));
      return;
    }

    if (requestUrl.pathname === "/qa/local-retrieval-interaction.js") {
      response.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
      response.end(interactionScript());
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

function runChrome(browserBinary, userDataDir, scenario, url, outputPath, mode) {
  const captureViewport = scenario.captureViewport ?? scenario.viewport;
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
    `--user-data-dir=${userDataDir}`,
    `--window-size=${captureViewport.width},${captureViewport.height}`
  ];

  if (mode === "screenshot") {
    args.push(`--screenshot=${outputPath}`);
  } else {
    args.push("--dump-dom");
  }

  args.push(url);

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
      if (mode === "screenshot" && existsSync(outputPath) && statSync(outputPath).size > 10_000) {
        finish();
      }

      if (mode === "dom" && Buffer.concat(stdoutChunks).toString("utf8").includes("</html>")) {
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
      fail(`${scenario.id} ${mode} failed to start browser: ${error.message}`);
    });
    child.on("close", (code, signal) => {
      clearTimeout(timeout);
      clearInterval(readyInterval);
      if (timedOut) {
        fail(`${scenario.id} ${mode} timed out after 45s`);
      }

      if (!completed && code !== 0) {
        const stderr = Buffer.concat(stderrChunks).toString("utf8");
        fail(`${scenario.id} ${mode} failed with exit ${code ?? signal}: ${stderr.trim()}`);
      }

      const output = mode === "dom" ? Buffer.concat(stdoutChunks).toString("utf8") : "";
      if (mode === "dom" && !output.includes("</html>")) {
        fail(`${scenario.id} ${mode} did not produce a complete DOM dump`);
      }

      resolve(output);
    });
  });
}

function assertScenarioOutput(scenario, domText, screenshotPath) {
  if (!existsSync(screenshotPath) || statSync(screenshotPath).size < 10_000) {
    fail(`${scenario.id} screenshot was not created or is unexpectedly small`);
  }

  for (const expected of scenario.expectedText) {
    if (!domText.includes(expected)) {
      fail(`${scenario.id} DOM output missing expected text: ${expected}`);
    }
  }

  const forbiddenMarkers = [
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    ["BEGIN OPENSSH", "PRIVATE KEY"].join(" ")
  ];
  for (const forbidden of forbiddenMarkers) {
    if (domText.includes(forbidden)) {
      fail(`${scenario.id} DOM output contains forbidden sensitive marker: ${forbidden}`);
    }
  }
}

function decodeHtmlText(value) {
  return value
    .replaceAll("&quot;", "\"")
    .replaceAll("&#34;", "\"")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function extractInteractionReport(scenario, domText) {
  const marker = 'id="qa-local-retrieval-interaction-report" data-status="';
  const markerIndex = domText.indexOf(marker);
  if (markerIndex === -1) {
    fail(`${scenario.id} interaction DOM output missing QA interaction report`);
  }

  const contentStart = domText.indexOf(">", markerIndex) + 1;
  const contentEnd = domText.indexOf("</pre>", contentStart);
  if (contentStart === 0 || contentEnd === -1) {
    fail(`${scenario.id} interaction DOM output has an incomplete QA report`);
  }

  let report;
  try {
    report = JSON.parse(decodeHtmlText(domText.slice(contentStart, contentEnd)));
  } catch (error) {
    fail(`${scenario.id} interaction report was not valid JSON: ${error.message}`);
  }

  if (report.status !== "passed") {
    fail(`${scenario.id} interaction report failed: ${report.error ?? "unknown error"}`);
  }

  const expectedSteps = [
    "initial",
    "after-query",
    "after-source-class",
    "after-transcript-state",
    "after-credential-query",
    "after-reset"
  ];
  const actualSteps = report.steps.map((step) => step.step);
  if (actualSteps.join(",") !== expectedSteps.join(",")) {
    fail(`${scenario.id} interaction report steps were ${actualSteps.join(",")}`);
  }

  for (const forbidden of ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"]) {
    if (domText.includes(forbidden)) {
      fail(`${scenario.id} interaction DOM output contains forbidden sensitive marker: ${forbidden}`);
    }
  }

  return report;
}

const browserBinary = findBrowserBinary();
if (!browserBinary) {
  fail("Chrome/Chromium browser binary not found. Set SEIS_BROWSER_BIN to run browser visual QA.");
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
const interactionResults = [];

try {
  for (const scenario of scenarios) {
    const userDataDir = path.join(tmpdir(), `seis-core-qa-${process.pid}-${scenario.id}`);
    rmSync(userDataDir, { force: true, recursive: true });
    mkdirSync(userDataDir, { recursive: true });

    const scenarioUrl = `http://127.0.0.1:${port}/index.html?qa=${scenario.id}`;
    const screenshotPath = path.join(outputRoot, `${scenario.id}.png`);
    const domPath = path.join(outputRoot, `${scenario.id}.html`);

    await runChrome(browserBinary, userDataDir, scenario, scenarioUrl, screenshotPath, "screenshot");
    const domText = await runChrome(browserBinary, userDataDir, scenario, scenarioUrl, domPath, "dom");
    writeFileSync(domPath, domText);
    assertScenarioOutput(scenario, domText, screenshotPath);

    runResults.push({
      id: scenario.id,
      label: scenario.label,
      viewport: scenario.viewport,
      captureViewport: scenario.captureViewport ?? scenario.viewport,
      screenshot: path.relative(root, screenshotPath),
      domDump: path.relative(root, domPath),
      expectedText: scenario.expectedText
    });

    rmSync(userDataDir, { force: true, recursive: true });
  }

  for (const scenario of interactionScenarios) {
    const userDataDir = path.join(tmpdir(), `seis-core-qa-${process.pid}-${scenario.id}`);
    rmSync(userDataDir, { force: true, recursive: true });
    mkdirSync(userDataDir, { recursive: true });

    const scenarioUrl = `http://127.0.0.1:${port}/index.html?qa=${scenario.id}&interaction=local-retrieval`;
    const domPath = path.join(outputRoot, `${scenario.id}.html`);
    const reportPath = path.join(outputRoot, `${scenario.id}.json`);

    const domText = await runChrome(browserBinary, userDataDir, scenario, scenarioUrl, domPath, "dom");
    writeFileSync(domPath, domText);
    const report = extractInteractionReport(scenario, domText);
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

    interactionResults.push({
      id: scenario.id,
      label: scenario.label,
      viewport: scenario.viewport,
      domDump: path.relative(root, domPath),
      report: path.relative(root, reportPath),
      steps: report.steps.map((step) => ({
        step: step.step,
        status: step.status,
        activeControl: step.activeControl
      }))
    });

    rmSync(userDataDir, { force: true, recursive: true });
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}

const manifest = {
  id: "seis-core-local-retrieval-browser-visual-qa",
  generatedAt,
  browser: {
    source: process.env.SEIS_BROWSER_BIN ? "SEIS_BROWSER_BIN" : "auto-detected",
    binaryName: path.basename(browserBinary)
  },
  app: "apps/seis-core",
  artifactRoot: path.relative(root, outputRoot),
  scenarios: runResults,
  interactionScenarios: interactionResults,
  nonClaims: [
    "This is browser-run visual and interaction QA evidence, not pixel-baseline regression.",
    "No live retrieval, model provider, embedding index, persistent memory write, raw-content return, SSH, deployment, payment, or infrastructure mutation is performed.",
    "Artifacts are written to reports/tmp and are intentionally ignored by Git."
  ]
};

writeFileSync(path.join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`SEIS Local Retrieval browser visual QA passed: ${runResults.length} scenarios`);
console.log(`SEIS Local Retrieval browser interaction QA passed: ${interactionResults.length} scenarios`);
console.log(`Artifacts: ${path.relative(root, outputRoot)}`);
