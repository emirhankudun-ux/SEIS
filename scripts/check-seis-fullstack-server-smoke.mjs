#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const host = "127.0.0.1";
const port = 58000 + Math.floor(Math.random() * 2000);
const serverPath = "server/node/static-server.mjs";
const webRoot = "apps/web";
const failures = [];

const endpoints = [
  { route: "/_server/session", sourceKey: "session" },
  { route: "/_server/capabilities", sourceKey: "capabilities" },
  { route: "/_server/projects", sourceKey: "projects" },
  { route: "/_server/app-installs", sourceKey: "appInstalls" },
  { route: "/_server/provider-status", sourceKey: "providerStatus" },
  { route: "/_server/audit-log", sourceKey: "auditLogs" },
  { route: "/_server/agent-tasks", sourceKey: "agentTasks" },
  { route: "/_server/fullstack-contract", sourceKey: "self" }
];

ensure(existsSync(join(root, serverPath)), `missing ${serverPath}`);
ensure(existsSync(join(root, webRoot)), `missing ${webRoot}`);

let child;

try {
  child = spawn(process.execPath, [serverPath], {
    cwd: root,
    env: {
      ...process.env,
      HOST: host,
      PORT: String(port),
      SEIS_STATIC_ROOT: webRoot,
      SEIS_WORKSPACE_ROOT: root
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  const startup = waitForServer(child);
  await startup;

  const routeResponse = await fetchWithRetry(`http://${host}:${port}/desktop.html`);
  ensure(routeResponse.status === 200, `expected SEIS Desktop static route 200, found ${routeResponse.status}`);
  ensure((routeResponse.headers.get("content-type") || "").includes("text/html"), "static route must return HTML");

  const summaries = [];
  for (const endpoint of endpoints) {
    const response = await fetchWithRetry(`http://${host}:${port}${endpoint.route}`);
    ensure(response.status === 200, `${endpoint.route} returned HTTP ${response.status}`);
    ensure((response.headers.get("content-type") || "").includes("application/json"), `${endpoint.route} must return JSON`);
    const payload = await response.json();
    ensure(payload.ok === true, `${endpoint.route} payload ok must be true`);
    ensure(payload.source === "node-server", `${endpoint.route} source must be node-server`);
    if (endpoint.sourceKey === "self") {
      ensure(payload.id === "seis-fullstack-contract", `${endpoint.route} must return contract id`);
      ensure(payload.coreCredentialRequirement === "none", `${endpoint.route} must preserve no-key core`);
      ensure(payload.liveCredentialRequirement === "optional-backend-only-after-approval", `${endpoint.route} must keep backend-only live credential gate`);
      ensure(Array.isArray(payload.publicEndpoints) && payload.publicEndpoints.length === endpoints.length, `${endpoint.route} must expose every public endpoint`);
      summaries.push({ route: endpoint.route, id: payload.id, endpoints: payload.publicEndpoints.length });
      continue;
    }
    ensure(payload.contractId === "seis-fullstack-contract", `${endpoint.route} contractId mismatch`);
    ensure(payload.sourceKey === endpoint.sourceKey, `${endpoint.route} sourceKey mismatch`);
    ensure(payload.data !== undefined, `${endpoint.route} data missing`);
    if (endpoint.sourceKey === "providerStatus") {
      const validation = payload.environmentValidation;
      ensure(validation?.id === "seis-ai-core-provider-environment-validation", `${endpoint.route} must expose provider environment validation id`);
      ensure(["validated-no-network", "blocked-unsafe-environment", "unavailable"].includes(validation?.status), `${endpoint.route} must expose an honest non-network validation status`);
      ensure(validation?.secretValuesReturned === false, `${endpoint.route} must not return secret values`);
      ensure(validation?.secretValuesLogged === false, `${endpoint.route} must not log secret values`);
      ensure(validation?.credentialAuthenticationPerformed === false, `${endpoint.route} must not authenticate credentials`);
      ensure(validation?.networkCalled === false, `${endpoint.route} must not call the network`);
      ensure(validation?.externalMutationPerformed === false, `${endpoint.route} must not mutate external systems`);
      ensure(validation?.liveRoutingEnabled === false, `${endpoint.route} must not enable live routing`);
    }
    summaries.push({
      route: endpoint.route,
      sourceKey: payload.sourceKey,
      count: Array.isArray(payload.data) ? payload.data.length : Object.keys(payload.data || {}).length
    });
  }

  if (failures.length > 0) {
    console.error("SEIS full-stack server smoke failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({
      ok: true,
      host,
      port,
      staticRoute: "/desktop.html",
      endpoints: summaries
    }, null, 2));
  }
} finally {
  if (child && child.exitCode === null) {
    child.kill("SIGTERM");
    await waitForExit(child, 1500);
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function waitForServer(processHandle) {
  return new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for SEIS static server. Output: ${output}`));
    }, 10000);

    processHandle.stdout.on("data", (chunk) => {
      output += chunk.toString();
      if (output.includes("SEIS static server listening")) {
        clearTimeout(timeout);
        resolve();
      }
    });

    processHandle.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });

    processHandle.once("exit", (code) => {
      if (code !== 0) {
        clearTimeout(timeout);
        reject(new Error(`SEIS static server exited early with ${code}. Output: ${output}`));
      }
    });
  });
}

async function fetchWithRetry(url, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      return await fetch(url);
    } catch (error) {
      lastError = error;
      await delay(150);
    }
  }
  throw new Error(`Timed out fetching ${url}: ${lastError?.message || "unknown error"}`);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForExit(processHandle, timeoutMs) {
  return Promise.race([
    new Promise((resolve) => processHandle.once("exit", resolve)),
    delay(timeoutMs)
  ]);
}
