#!/usr/bin/env node
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

const launcherDir = path.dirname(fileURLToPath(import.meta.url));
const candidateRoots = [];
const seen = new Set();

function addCandidate(candidate) {
  if (!candidate) return;
  const resolved = path.resolve(candidate);
  if (!seen.has(resolved)) {
    seen.add(resolved);
    candidateRoots.push(resolved);
  }
}

function addAncestorCandidates(startPath, depth = 8) {
  let current = path.resolve(startPath);
  for (let i = 0; i < depth; i += 1) {
    addCandidate(current);
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
}

function hasServer(root) {
  return existsSync(path.join(root, "mcp", "seis-mcp-server.mjs"));
}

addCandidate(process.env.SEIS_ROOT);
addCandidate(process.cwd());
addCandidate(path.resolve(launcherDir, ".."));
addCandidate(path.resolve(launcherDir, "../.."));
addCandidate(path.resolve(launcherDir, "../../.."));

const home = os.homedir();
addCandidate(path.join(home, "Library", "Mobile Documents", "com~apple~CloudDocs", "Github"));
addCandidate(path.join(home, "Library", "Mobile Documents", "com~apple~CloudDocs", "Github", "SEIS"));
addCandidate(path.join(home, "Github"));
addCandidate(path.join(home, "GitHub"));
addCandidate(path.join(home, "projects"));
addCandidate(path.join(home, "work"));

addAncestorCandidates(process.cwd(), 10);
addAncestorCandidates(launcherDir, 10);
addCandidate(path.resolve(launcherDir, ".."));

for (const candidate of [
  ...candidateRoots.filter((candidatePath) => candidatePath.endsWith("/cache")),
  ...candidateRoots,
]) {
  const withName = path.join(candidate, "SEIS");
  addCandidate(withName);
}

const configuredHints = process.env.SEIS_ROOT_HINTS;
if (configuredHints) {
  for (const hint of configuredHints.split(path.delimiter)) {
    addCandidate(hint);
  }
}

const serverRoots = [];
for (const root of candidateRoots) {
  if (hasServer(root)) {
    serverRoots.push(root);
    continue;
  }

  const names = ["SEIS", "seis", "Seis", "SEIS-repo", "seis-repo"];
  for (const name of names) {
    const candidateRoot = path.join(root, name);
    if (hasServer(candidateRoot)) {
      serverRoots.push(candidateRoot);
      break;
    }
  }
}

const uniqueServerRoots = [...new Set(serverRoots)];
if (!uniqueServerRoots.length) {
  console.error("Could not resolve SEIS MCP server root.");
  console.error("Checked candidates:");
  for (const candidate of candidateRoots) {
    console.error(` - ${candidate}`);
    for (const name of ["SEIS", "seis", "Seis", "SEIS-repo", "seis-repo"]) {
      console.error(`   - ${path.join(candidate, name, "mcp", "seis-mcp-server.mjs")}`);
    }
  }
  process.exit(1);
}

const mcpRoot = uniqueServerRoots[0];
const mcpPath = path.join(mcpRoot, "mcp", "seis-mcp-server.mjs");

const child = spawn(process.execPath, [mcpPath], {
  stdio: "inherit",
  env: {
    ...process.env,
    SEIS_ROOT: mcpRoot,
  },
});

const terminate = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

process.on("SIGINT", () => terminate("SIGINT"));
process.on("SIGTERM", () => terminate("SIGTERM"));

child.on("error", (error) => {
  console.error("Failed to start SEIS MCP server:", error.message);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(typeof code === "number" ? code : 1);
});
