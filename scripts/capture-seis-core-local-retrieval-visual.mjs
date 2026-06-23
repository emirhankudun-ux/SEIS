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

function scenarioHtml(scenario) {
  const stateJson = JSON.stringify(scenario.state).replaceAll("<", "\\u003c");
  const indexHtml = readFileSync(path.join(appRoot, "index.html"), "utf8");
  const seedScript = `<base href="/">
    <script>
      localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(stateJson)});
    </script>`;

  return indexHtml.replace("<head>", `<head>${seedScript}`);
}

function serveStaticApp() {
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    const qaScenarioId = requestUrl.searchParams.get("qa");

    if ((requestUrl.pathname === "/" || requestUrl.pathname === "/index.html") && qaScenarioId) {
      const scenario = scenarios.find((item) => item.id === qaScenarioId);
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
  nonClaims: [
    "This is browser-run visual QA evidence, not pixel-baseline regression.",
    "No live retrieval, model provider, embedding index, persistent memory write, raw-content return, SSH, deployment, payment, or infrastructure mutation is performed.",
    "Artifacts are written to reports/tmp and are intentionally ignored by Git."
  ]
};

writeFileSync(path.join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`SEIS Local Retrieval browser visual QA passed: ${runResults.length} scenarios`);
console.log(`Artifacts: ${path.relative(root, outputRoot)}`);
